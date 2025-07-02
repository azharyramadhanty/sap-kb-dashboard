# PLN SAP Knowledge Management System

A modern document management system built with React, TypeScript, and MongoDB.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Your backend API running (or update docker-compose.yml with your backend image)

### Development Environment
```bash
# Build and run development environment
npm run docker:run:dev

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

### Production Environment
```bash
# Build and run production environment
npm run docker:run:prod

# Or manually
docker-compose up -d
```

## 🐳 Docker Commands

### Build Images
```bash
npm run docker:build
```

### Run Environments
```bash
# Development with hot reload
npm run docker:run:dev

# Production
npm run docker:run:prod
```

### Management Commands
```bash
# Stop all containers
npm run docker:stop

# View logs
npm run docker:logs

# Clean up (remove containers and volumes)
npm run docker:clean
```

## 🌐 Access Points

### Development
- **Frontend**: http://localhost:5173
- **MongoDB**: mongodb://localhost:27017

### Production
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001 (if using provided docker-compose)
- **MongoDB**: mongodb://localhost:27017

## 📁 Project Structure

```
├── src/                    # React application source
├── public/                 # Static assets
├── scripts/               # Docker helper scripts
├── Dockerfile             # Production Docker image
├── Dockerfile.dev         # Development Docker image
├── docker-compose.yml     # Production compose file
├── docker-compose.dev.yml # Development compose file
├── .dockerignore          # Docker ignore file
└── mongo-init.js          # MongoDB initialization
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development:
```env
VITE_API_BASE_URL=http://localhost:3001
```

### Backend Integration

Update `docker-compose.yml` to point to your actual backend:
```yaml
backend:
  image: your-backend-image:latest  # Replace with your backend image
  # ... rest of configuration
```

## 🛠️ Development

### Local Development (without Docker)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### With Docker Development Environment
```bash
# Start with hot reload
npm run docker:run:dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

## 🏗️ Building for Production

### Docker Build
```bash
npm run docker:build
```

### Local Build
```bash
npm run build
```

## 📊 Monitoring

### Container Status
```bash
docker-compose ps
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
```

### Health Checks
The frontend container includes health checks that verify the application is running correctly.

## 🔒 Security Notes

1. Change default MongoDB credentials in production
2. Update the default admin user password in `mongo-init.js`
3. Use environment-specific secrets
4. Enable MongoDB authentication in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.