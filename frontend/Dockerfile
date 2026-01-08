# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL
ARG VITE_API_BASE=https://hophopsy.com/api

# Set environment variable for build
ENV VITE_API_BASE=${VITE_API_BASE}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app with environment variable
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
