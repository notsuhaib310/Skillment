#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/skillment-backend
sudo chown -R $USER:$USER /var/www/skillment-backend

# Copy application files
cp -r ./* /var/www/skillment-backend/
cd /var/www/skillment-backend

# Install dependencies
npm install

# Build the application
npm run build

# Create production .env file
cat > .env << EOL
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWFBUWEdTU1czNDlYNjk0Wkg2WlFHSlgiLCJ0ZW5hbnRfaWQiOiJmNmFiYzJhMTMwOGNjYjQ5MDc3Njk3MjNjY2MyZDJkYWRmN2U4ZTk4ZTM0ZjRlYjNmOGYwYTBjYTZhMTdlNTA3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMWY0YTkxNWEtZTc0Yy00MjJiLWJkOWUtODY3ZWM4ODYzODBhIn0.7Avgkr9_J1hicSHDa7ejVH9rI5ibcYQXRdI2bAILWJw"
JWT_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"

# CORS
FRONTEND_URL=https://your-frontend-domain.com
DASHBOARD_URL=https://your-dashboard-domain.com

# Cookie
COOKIE_DOMAIN=.your-domain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
EOL

# Start the application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup 