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
    echo "🗄️  MongoDB: mongodb://localhost:27017"
elif [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "prod" ]; then
    echo "🚀 Starting production environment..."
    docker-compose up -d
    echo "✅ Production environment started!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 Backend: http://localhost:3001"
    echo "🗄️  MongoDB: mongodb://localhost:27017"
else
    echo "❌ Invalid environment. Use 'development' or 'production'"
    exit 1
fi

echo ""
echo "📊 Container status:"
docker-compose ps