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
    }
}
