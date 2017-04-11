import os
from fabric.api import local, run, cd, put, hosts, env, hide

env.user = 'root'
env.hosts = ['54.152.187.197']



def encrypt(filename, key=os.environ['SECRET_KEY']):
    """Encrypt a file"""
    local("gpg --passphrase %s -c %s" % (key, filename))

def decrypt(filename, key=os.environ['SECRET_KEY'], mode=local):
    """Decrypt a file"""
    outfile = filename.replace('.gpg', '')
    with hide('running'):
        mode("rm -rf %s" % outfile)
        mode("gpg --decrypt -o %s --passphrase %s --decrypt %s" % (
            outfile, key, filename))

def build(key=os.environ['PRODUCTION_TOKEN']):
    """Builds and pushes docker image"""
    local('docker-compose build')
    local('docker-compose push bot')

def deploy(key=os.environ['PRODUCTION_TOKEN'], bootstrap=False):
    """Deploy to jacks-instance on lightsail"""
    run('mkdir -p /app/brooklyn-bot')
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        put('./secrets.sh.gpg', '.')
        put('./client_secret.json.gpg', '.')
        # Now decrypt them
        decrypt('secrets.sh.gpg', mode=run)
        decrypt('client_secret.json.gpg', mode=run)
        run('chmod 400 secrets.sh')
        run('chmod 400 client_secret.json')
        run('. ./secrets.sh && docker-compose pull')
        with hide('running'):
            if bootstrap:
                run('. ./secrets.sh && docker-compose run bot node bootstrap.js');
            run('. ./secrets.sh && docker-compose up -d')



def down():
    """Stops the docker container"""
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        run('docker-compose down')
    

