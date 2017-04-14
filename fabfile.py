import os
from fabric.api import local, run, cd, put, hosts, env, hide

env.user = 'root'
env.hosts = ['54.152.187.197']


def encrypt(filename, key=os.environ['SECRET_KEY']):
    """Encrypt a file"""
    local("gpg --passphrase %s -c %s" % (key, filename))

def decrypt(filename, key=os.environ['SECRET_KEY'], mode=local):
    """Decrypt a file. Set mode to remote or local"""
    outfile = filename.replace('.gpg', '')
    with hide('running'):
        mode("rm -rf %s" % outfile)
        mode("gpg --decrypt -o %s --passphrase %s --decrypt %s" % (
            outfile, key, filename))

def build():
    """Builds and pushes docker image"""
    local('docker-compose build')
    local('docker-compose push bot')
    local('docker-compose push voicebot')

def deploy(bootstrap=False, ENV='prod'):
    """Deploy to jacks-instance on lightsail"""
    run('mkdir -p /app/brooklyn-bot/slackbot')
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        put('./slackbot/secrets.json.gpg', './slackbot/.')
        put('./slackbot/client_secret.json.gpg', './slackbot/.')
        # Now decrypt them
        decrypt('./slackbot/secrets.json.gpg', mode=run)
        decrypt('./slackbot/client_secret.json.gpg', mode=run)
        run('chmod 400 ./slackbot/secrets.json')
        run('chmod 400 ./slackbot/client_secret.json')
        run('docker-compose pull')
        with hide('running'):
            if bootstrap:
                run('docker-compose run bot node bootstrap.js');
            run('ENV=%s docker-compose up -d' % ENV)

def down():
    """Stops the docker container"""
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        run('docker-compose down')
    

