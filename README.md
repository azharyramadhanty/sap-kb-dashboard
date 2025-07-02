# PLN SAP Knowledge Management System

A modern document management system built with React, TypeScript, and your custom backend API.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Your backend API running (update docker-compose.yml with your backend image)

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
- **Backend**: Your backend API endpoint

### Production
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001 (if using provided docker-compose)

## 📁 Project Structure

```
├── src/                    # React application source
├── public/                 # Static assets
├── scripts/               # Docker helper scripts
├── Dockerfile             # Production Docker image
├── Dockerfile.dev         # Development Docker image
├── docker-compose.yml     # Production compose file
├── docker-compose.dev.yml # Development compose file
└── .dockerignore          # Docker ignore file
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
  ports:
    - "3001:3001"
  environment:
    - NODE_ENV=production
    - PORT=3001
  # Add any other environment variables your backend needs
```

## 🛠️ Development

### Local Development (without Docker)
```bash
# Install dependencies (force install without lock file)
npm install --force

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

## 🔗 API Integration

This frontend is configured to work with your custom backend API endpoints:

- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/auth/me` - Get current user profile
- `GET /api/v1/users` - List users (Admin/Editor only)
- `POST /api/v1/users` - Create user (Admin only)
- `POST /api/v1/documents/upload` - Upload documents
- `GET /api/v1/documents` - List documents
- `GET /api/v1/activities` - View activities
- `GET /api/v1/health` - Health check

## 📦 Package Management

This project uses **npm** with force installation to ensure all packages are installed regardless of lock file conflicts:

```bash
# Install dependencies
npm install --force

# Add new package
npm install <package-name> --force

# Remove package
npm uninstall <package-name>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.