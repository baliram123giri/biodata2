pipeline {
  agent any

  environment {
    PROD_BASE     = "/var/www/biodata99"
    KEEP_RELEASES = "3"
    APP_NAME      = "biodata99"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    /* =======================
       PROD DEPLOY (main/master only)
       ======================= */
    stage('Deploy PROD') {
      when {
        anyOf {
          branch 'main'
        }
      }
      steps {
        // Prevent shell command echoing — no secrets leak into logs
        sh '''
          set -e
          set +x

          TS=$(date +%Y%m%d_%H%M%S)
          RELEASE="$PROD_BASE/releases/$TS"

          mkdir -p "$RELEASE"

          # Sync source only — explicitly exclude secrets and build artifacts
          rsync -a \
            --exclude=node_modules \
            --exclude=.next \
            --exclude=.git \
            --exclude=.env \
            --exclude=.env.local \
            --exclude=.env.production \
            --exclude=.env.development \
            --exclude="*.pem" \
            --exclude="*.key" \
            ./ "$RELEASE/"

          # Lock down release directory permissions immediately
          chmod -R o-rwx "$RELEASE"

          cd "$RELEASE"

          # Symlink the shared .env file into the release folder
          ln -s "$PROD_BASE/.env" ./.env

          # Install deps silently — suppresses package names from log
          npm ci --silent 2>&1 | grep -v "added"

          # Build silently — no env values echoed
          NODE_ENV=production npm run build --silent

          # Atomic symlink swap (no downtime window)
          ln -sfn "$RELEASE" "$PROD_BASE/current"

          # Zero-downtime PM2 reload
          cd "$PROD_BASE/current"
          pm2 reload ecosystem.config.js --only "$APP_NAME" --silent \
            || pm2 start ecosystem.config.js --only "$APP_NAME" --silent

          pm2 save --force 2>/dev/null

          # Prune old releases
          cd "$PROD_BASE/releases"
          ls -dt */ | tail -n +$(($KEEP_RELEASES + 1)) | xargs -r rm -rf
        '''
      }
    }
  }

  post {
    success {
      echo "Deployment completed successfully."
    }
    failure {
      echo "Deployment failed. Review the pipeline steps above."
    }
  }
}
