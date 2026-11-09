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
            steps {
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
                    bat 'docker push kiran626/valora-backend:%BUILD_NUMBER%'
bat 'docker push kiran626/valora-frontend:%BUILD_NUMBER%'
                }
            }
        }

        stage('Deploy to Kubernetes') {
    steps {
        script {
            try {
                echo 'Deploying Valora build version...'

                bat 'kubectl apply -f k8s/'

                // Deploy versioned images
                bat 'kubectl set image deployment/backend backend=kiran626/valora-backend:%BUILD_NUMBER%'

                bat 'kubectl set image deployment/frontend frontend=kiran626/valora-frontend:%BUILD_NUMBER%'

                // Verify deployments
                bat 'kubectl rollout status deployment/backend --timeout=120s'
                bat 'kubectl rollout status deployment/frontend --timeout=120s'
                bat 'kubectl rollout status deployment/mongodb --timeout=120s'

            } catch (err) {
                echo 'Deployment failed! Rolling back application...'

                bat 'kubectl rollout undo deployment/backend'
                bat 'kubectl rollout undo deployment/frontend'

                throw err
            }
        }
    }
} 
    }

    post {
        success {
            echo 'Valora pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the deployment logs.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}