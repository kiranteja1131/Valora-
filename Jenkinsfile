pipeline {
agent any


stages {
    stage('Build') {
        steps {
            echo 'Building Valora application...'
            bat 'docker compose build'
        }
    }
}


}
