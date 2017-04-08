import os
from fabric.api import local, run, cd, put, hosts, env, hide

env.user = 'root'
env.hosts = ['54.152.187.197']


def encrypt(filename, key=os.environ['SECRET_KEY']):
    """Encrypt a file"""
    local("gpg --passphrase %s -c %s" % (key, filename))

def decrypt(filename, key=os.environ['SECRET_KEY']):
    """Decrypt a file"""
    outfile = filename.replace('.gpg', '')
    local("gpg --decrypt -o %s --passphrase %s --decrypt %s" % (
        outfile, key, filename))

def build(key=os.environ['PRODUCTION_TOKEN']):
    """Builds and pushes docker image"""
    local('docker-compose build')
    local('docker push banjocat/tivix-brooklyn')

def deploy(key=os.environ['PRODUCTION_TOKEN']):
    """Deploy to jacks-instance on lightsail"""
    run('mkdir -p /app/brooklyn-bot')
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        run('docker-compose pull')
        with hide('running'):
            run('BOT_TOKEN=%s docker-compose up -d' % key)


def down():
    """Stops the docker container"""
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        run('docker-compose down')
    

