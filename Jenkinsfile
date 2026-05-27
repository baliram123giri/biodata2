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
       PROD DEPLOY (main only)
       ======================= */
    stage('Deploy PROD') {
      steps {
        // Prevent shell command echoing - no secrets leak into logs
        sh '''
          set -e
          set +x

          echo "🚀 Starting Zero-Downtime Deployment..."

          TS=$(date +%Y%m%d_%H%M%S)
          RELEASE="$PROD_BASE/releases/$TS"

          echo "📂 Creating new release folder: $RELEASE"
          mkdir -p "$RELEASE"

          # Sync source only - explicitly exclude secrets and build artifacts
          rsync -a \
             -exclude=node_modules \
             -exclude=.next \
             -exclude=.git \
             -exclude=.env \
             -exclude=.env.local \
             -exclude=.env.production \
             -exclude=.env.development \
             -exclude="*.pem" \
             -exclude="*.key" \
            ./ "$RELEASE/"

          # Lock down release directory permissions immediately
          chmod -R o-rwx "$RELEASE"

          cd "$RELEASE"

          # Symlink the shared .env file into the isolated release folder
          echo "🔗 Linking .env file"
          ln -sfn "$PROD_BASE/.env" ./.env

          echo "Cleaning old cache"
          rm -rf .next || true
          
          # Install deps
          echo "📦 Installing dependencies"
          npm ci

          # Generate Prisma Client
          echo "🗄️ Generating Prisma Client"
          npx prisma generate

          # Build silently - no env values echoed
          echo "🏗 Building Next.js"
          NODE_ENV=production npm run build  -silent

          # Atomic symlink swap (no downtime window)
          echo "🔗 Swapping 'current' symlink"
          ln -sfn "$RELEASE" "$PROD_BASE/current"

          # Zero-downtime PM2 reload
          echo "🔄 Gracefully restarting PM2"
          cd "$PROD_BASE/current"
          pm2 reload ecosystem.config.js  -only "$APP_NAME"  -silent \
            || pm2 start ecosystem.config.js  -only "$APP_NAME"  -silent

          pm2 save  -force 2>/dev/null

          # Prune old releases
          echo "🧹 Cleaning up old releases"
          cd "$PROD_BASE/releases"
          ls -dt */ | tail -n +$(($KEEP_RELEASES + 1)) | xargs -r rm -rf
          
          echo "✅ Release $TS is live!"
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
