pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    PORT = '3001'
    MONGODB_URI = 'mongodb://127.0.0.1:27017/movforyou'
  }

  options {
    skipDefaultCheckout(true)
    disableConcurrentBuilds()
    timestamps()
    timeout(time: 10, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        sh '''
          node -v
          npm -v
          npm ci --no-audit --no-fund
        '''
      }
    }

    stage('Validate') {
      steps {
        sh '''
          node --check server/server.js
          find server public/js -type f -name '*.js' -print0 | xargs -0 -n1 node --check
        '''
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Smoke test') {
      steps {
        sh '''
          npm start > server.log 2>&1 &
          APP_PID=$!
          trap 'kill $APP_PID 2>/dev/null || true; wait $APP_PID 2>/dev/null || true' EXIT

          HEALTH_CHECK_PASSED=false
          for i in $(seq 1 30); do
            if curl -fsS http://127.0.0.1:3001/api/health > health.json; then
              if grep -q '"status":"online"' health.json; then
                HEALTH_CHECK_PASSED=true
                echo 'Health check passed'
                break
              fi
            fi
            sleep 2
          done

          if [ "$HEALTH_CHECK_PASSED" != 'true' ]; then
            echo 'Health check failed'
            cat server.log
            exit 1
          fi
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'server.log, health.json', allowEmptyArchive: true
      sh 'rm -f health.json server.log'
    }
  }
}