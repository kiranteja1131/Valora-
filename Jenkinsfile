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
        steps { withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DOCKER_USERNAME',
            passwordVariable: 'DOCKER_PASSWORD'
            )])
            {
                bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
                bat 'docker compose push'
            }
        }
    }
    stage('Deploy to Kubernetes') {
    steps {
        echo 'Deploying Valora application to Kubernetes...'

        bat 'kubectl apply -f k8s/'

        bat 'kubectl rollout status deployment/backend'
        bat 'kubectl rollout status deployment/frontend'
        bat 'kubectl rollout status deployment/mongodb'
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