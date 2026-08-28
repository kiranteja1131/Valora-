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
}


}
