pipeline {
agent any


stages {
    stage('Build') {
        steps {
            echo 'Building Valora application...'
            bat 'docker compose build'
        }
    }
    stage('Verify Images') { 
        steps { echo 'Verifying Docker images...' 
                bat 'docker images' 
                } 
            }
    stage('Push Images') {
        steps {
            withCredentials([usernamePassword(
                credentialsId: 'dockerhub-creds',
                usernameVariable: 'DOCKER_USERNAME',
                passwordVariable: 'DOCKER_PASSWORD'
            )]) {
                bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
                bat 'docker compose push'
            }
        }
    }

    stage('Deploy') {
        steps {
            echo 'Deploying valora application...'
            bat 'docker compose up -d'
        }
    }
}
post{
    success{
        echo 'pipeline successfully completed'
        }
    failure {
        echo 'something has interrupted..! '
    }
    always{
        echo 'pipeline execution finished..'
    }
    }
}
