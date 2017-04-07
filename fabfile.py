import os
from fabric.api import local, run, cd, put, hosts, env

env.user = 'root'
env.hosts = ['54.152.187.197']


def build(key=os.environ['BOT_TOKEN']):
    """Builds and pushes docker image"""
    local('docker-compose build')
    local('docker push banjocat/tivix-brooklyn')

def deploy(key=os.environ['BOT_TOKEN']):
    """Deploy to jacks-instance on lightsail"""
    run('mkdir -p /app/brooklyn-bot')
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        run('docker-compose pull')
        run('BOT_TOKEN=%s docker-compose up -d' % key)


def down():
    """Stops the docker container"""
    with cd('/app/brooklyn-bot'):
        put('./docker-compose.yml', 'docker-compose.yml')
        run('docker-compose down')
    

