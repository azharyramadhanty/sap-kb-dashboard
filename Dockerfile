# Use Node.js 20 slim as the base image
FROM node:20-slim AS base

# Set working directory
WORKDIR /app

# Install pnpm globally for better package management
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage
FROM base AS build

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-slim AS production

# Install serve to serve static files
RUN npm install -g serve

# Create app directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]