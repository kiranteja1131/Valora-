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
                    bat 'docker compose push'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    try {
                        echo 'Deploying Valora...'

                        bat 'kubectl apply -f k8s/'

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