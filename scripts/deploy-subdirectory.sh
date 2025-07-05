#!/bin/bash

# Deployment script for subdirectory setup
set -e

echo "🚀 Deploying PLN Knowledge Management to subdirectory..."

# Configuration
SUBDIRECTORY="cms"
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/${SUBDIRECTORY}"
NGINX_CONFIG="/etc/nginx/conf.d/default.conf"

# Build the application for subdirectory
echo "📦 Building application for /${SUBDIRECTORY} subdirectory..."
NODE_ENV=production npm run build

# Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p ${DEPLOY_DIR}

# Copy built files
echo "📋 Copying built files..."
sudo cp -r ${BUILD_DIR}/* ${DEPLOY_DIR}/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data ${DEPLOY_DIR}
sudo chmod -R 755 ${DEPLOY_DIR}

# Copy nginx configuration
echo "⚙️ Updating nginx configuration..."
sudo cp nginx.conf ${NGINX_CONFIG}

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: https://www.mywebsite.com/${SUBDIRECTORY}"
echo ""
echo "📝 Next steps:"
echo "1. Update your backend API base URL to point to the correct endpoint"
echo "2. Configure SSL certificates if needed"
echo "3. Test all functionality in the subdirectory environment"