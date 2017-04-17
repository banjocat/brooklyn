pipeline {
    agent any
        environment {
            SECRET_KEY = credentials("brooklyn_secret_key")
            DOCKER_PASS = credentials("brooklyn_docker_password")
            ENV = "PROD"
        }
    stages {
        stage('Build') {
            steps {
                git url: "https://github.com/banjocat/brooklyn.git", branch: "master"
                sh "docker login -u banjocat -p $DOCKER_PASS"
                sh "fab build"
            }
        }
        stage('Deploy') {
            steps {
                sshagent(credentials: ['jacks_lightsail_ssh_login']) {
                sh "fab deploy"
                }
            }
        }
    }

}
