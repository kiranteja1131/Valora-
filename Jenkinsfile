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

        stage('Open Valora') {
            steps {
                script {
                    def ip = bat(
                        script: 'minikube ip',
                        returnStdout: true
                    ).trim()

                    def port = bat(
                        script: 'kubectl get svc frontend -o jsonpath={.spec.ports[0].nodePort}',
                        returnStdout: true
                    ).trim()

                    def appUrl = "http://${ip}:${port}"

                    echo "Valora Application URL: ${appUrl}"

                    bat "start \"\" \"${appUrl}\""
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