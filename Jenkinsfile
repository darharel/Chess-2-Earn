pipeline {
  agent  any

  environment {
    DOCKER_IMAGE = "chess-app"
    CONTAINER_NAME = "chess"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'master', url: 'https://github.com/darharel/Chess-2-Earn.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        dir('app') {
          sh 'docker build -t $DOCKER_IMAGE .'
        }
      }
    }

    stage('Stop Previous Container') {
      steps {
        script {
          sh """
            docker ps -q --filter name=$CONTAINER_NAME | grep . && docker rm -f $CONTAINER_NAME || echo 'No container to stop'
          """
        }
      }
    }

    stage('Run New Container') {
      steps {
        sh 'docker run -d -p 80:80 --name $CONTAINER_NAME $DOCKER_IMAGE'
      }
    }
  }

  post {
    success {
      echo '🎉 Deployed Hello Chess app successfully!'
    }
    failure {
      echo '❌ Deployment failed.'
    }
  }
}

