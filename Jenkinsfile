pipeline{
    agent any

    stages{
        stage("Build"){
            step{ echo 'Building valora application...'
            bat 'docker compose build'
            }
        }
    }
    
}