#!/bin/bash

# Docker run script for PLN Knowledge Management System

set -e

# Default to production
ENVIRONMENT=${1:-production}

echo "🐳 Starting PLN Knowledge Management System in $ENVIRONMENT mode..."

if [ "$ENVIRONMENT" = "development" ] || [ "$ENVIRONMENT" = "dev" ]; then
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Development environment started!"
    echo "🌐 Frontend: http://localhost:5173"
    echo "📝 Note: Make sure your backend API is running separately"
elif [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "prod" ]; then
    echo "🚀 Starting production environment..."
    docker-compose up -d
    echo "✅ Production environment started!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 Backend: http://localhost:3001 (update docker-compose.yml with your backend image)"
else
    echo "❌ Invalid environment. Use 'development' or 'production'"
    exit 1
fi

echo ""
echo "📊 Container status:"
if [ "$ENVIRONMENT" = "development" ] || [ "$ENVIRONMENT" = "dev" ]; then
    docker-compose -f docker-compose.dev.yml ps
else
    docker-compose ps
fi