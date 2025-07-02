#!/bin/bash

# Docker build script for PLN Knowledge Management System

set -e

echo "🐳 Building PLN Knowledge Management Docker Images..."

# Build production image
echo "📦 Building production image..."
docker build -t pln-knowledge-frontend:latest .

# Build development image
echo "🔧 Building development image..."
docker build -f Dockerfile.dev -t pln-knowledge-frontend:dev .

echo "✅ Docker images built successfully!"

# Show images
echo "📋 Available images:"
docker images | grep pln-knowledge-frontend

echo ""
echo "🚀 To run the application:"
echo "  Production: docker-compose up -d"
echo "  Development: docker-compose -f docker-compose.dev.yml up -d"