pipeline {
agent any

```
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

    stage('Deploy PROD') {
        steps {
            sh '''
                set -e

                echo "🚀 Starting Deployment"

                TS=$(date +%Y%m%d_%H%M%S)
                RELEASE="$PROD_BASE/releases/$TS"

                echo "📂 Creating release directory"
                mkdir -p "$RELEASE"

                echo "📋 Copying source code"

                rsync -av \
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

                cd "$RELEASE"

                echo "🔗 Linking shared env"
                ln -sfn "$PROD_BASE/.env" .env

                echo "🧹 Cleaning build cache"
                rm -rf .next || true
                rm -rf node_modules || true

                echo "📦 Installing dependencies"
                npm install

                echo "🗄️ Generating Prisma Client"
                npx prisma generate

                echo "🏗️ Building application"
                NODE_ENV=production npm run build

                echo "🔐 Fixing permissions"
                chown -R jenkins:jenkins "$RELEASE" || true
                chmod -R 755 "$RELEASE" || true

                echo "🔄 Switching current release"
                ln -sfn "$RELEASE" "$PROD_BASE/current"

                echo "♻️ Restarting PM2"

                cd "$PROD_BASE/current"

                pm2 describe "$APP_NAME" > /dev/null 2>&1

                if [ $? -eq 0 ]; then
                    pm2 reload ecosystem.config.js \
                        --only "$APP_NAME" \
                        --update-env
                else
                    pm2 start ecosystem.config.js \
                        --only "$APP_NAME"
                fi

                pm2 save --force

                echo "🧹 Removing old releases"

                cd "$PROD_BASE/releases"

                ls -dt */ | tail -n +$(($KEEP_RELEASES + 1)) | while read OLD
                do
                    echo "Removing $OLD"
                    chmod -R u+w "$OLD" || true
                    rm -rf "$OLD" || true
                done

                echo "✅ Deployment Successful"
            '''
        }
    }
}

post {
    success {
        echo '✅ Deployment completed successfully.'
    }

    failure {
        echo '❌ Deployment failed.'
    }
}
```

}
