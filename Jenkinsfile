pipeline {
  agent any

  tools {
    nodejs 'Node 20'
  }

  environment {
    NODE_ENV = 'test'
    PORT = '3001'
    MONGODB_URI = 'mongodb://127.0.0.1:27017/movforyou'
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Cloning repository and preparing build workspace'
      }
    }

    stage('Start MongoDB') {
      steps {
        sh '''
          if command -v docker >/dev/null 2>&1; then
            docker rm -f movforyou-mongo >/dev/null 2>&1 || true
            docker run -d --name movforyou-mongo -p 27017:27017 mongo:7
          else
            echo 'Docker not available; continuing without MongoDB service'
          fi
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install --no-audit --no-fund'
      }
    }

    stage('Run test suite') {
      steps {
        sh 'npm test'
      }
    }

    stage('Validate app syntax') {
      steps {
        sh 'node --check server/server.js'
      }
    }

    stage('Smoke test') {
      steps {
        script {
          sh '''
            npm start > server.log 2>&1 &
            APP_PID=$!
            echo "App started with PID: $APP_PID"

            for i in $(seq 1 30); do
              if curl -fsS http://localhost:3001/api/health > health.json; then
                echo "Health check passed"
                break
              fi
              sleep 2
            done

            curl -fsS http://localhost:3001/api/health | grep -q '"status":"online"'
            kill $APP_PID || true
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'pkill -f "node server/server.js" || true'
      sh 'docker rm -f movforyou-mongo >/dev/null 2>&1 || true'
      sh 'rm -f health.json || true'
    }
    success {
      echo 'Jenkins pipeline completed successfully.'
    }
    failure {
      echo 'Jenkins pipeline failed. Review logs for details.'
    }
  }
}
