pipeline {
agent any

environment {
    PROD_BASE = "/var/www/biodata99"
    KEEP_RELEASES = "3"
    APP_NAME = "biodata99"
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

                echo "Starting Deployment"

                TS=$(date +%Y%m%d_%H%M%S)
                RELEASE="$PROD_BASE/releases/$TS"

                echo "Creating release directory"
                mkdir -p "$RELEASE"

                echo "Copying source code"

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

                cd "$RELEASE"

                echo "Linking environment file"
                ln -sfn "$PROD_BASE/.env" .env

                echo "Cleaning previous build"
                rm -rf .next
                rm -rf node_modules

                echo "Installing dependencies"
                npm install

                echo "Pushing database schema to production database"
                npx prisma db push --accept-data-loss

                echo "Generating Prisma Client"
                npx prisma generate

                echo "Building Next.js application"
                NODE_ENV=production npm run build

                echo "Updating current symlink"
                ln -sfn "$RELEASE" "$PROD_BASE/current"

                cd "$PROD_BASE/current"

                echo "Restarting PM2 process system-wide"

                if sudo pm2 describe "$APP_NAME" > /dev/null 2>&1; then
                    sudo pm2 reload ecosystem.config.js --only "$APP_NAME" --update-env
                else
                    sudo pm2 start ecosystem.config.js --only "$APP_NAME"
                fi

                sudo pm2 save --force

                echo "Cleaning old releases safely with superuser privileges"

                cd "$PROD_BASE/releases"

                ls -dt */ | tail -n +$(($KEEP_RELEASES + 1)) | xargs -r sudo rm -rf

                echo "Deployment completed successfully"
            '''
        }
    }
}

post {
    success {
        echo 'Deployment completed successfully.'
    }

    failure {
        echo 'Deployment failed. Review the logs above.'
    }
}


}
