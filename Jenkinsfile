pipeline {
    agent any
        environment {
            SECRET_KEY = credentials("gpg_secret_key")
            DOCKER_PASS = credentials("docker_password")
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
                sshagent(credentials: ['ssh_key']) {
                sh "fab deploy"
                }
            }
        }
    }

}
