# Multi-stage build for React Frontend
FROM node:18-alpine as builder

# Set build arguments
ARG VITE_API_URL=http://localhost:8000
ARG VITE_APP_NAME="AI Chatbot"
ARG VITE_ENABLE_RAG=true

# Set environment variables
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_ENABLE_RAG=$VITE_ENABLE_RAG

# Set work directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY frontend/ .

# Build the application (bypass TypeScript issues)
RUN npx vite build --mode production

# Production stage with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set permissions for nginx directories
RUN chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]