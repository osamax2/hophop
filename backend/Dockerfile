# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install Chromium and dependencies for Puppeteer, plus PostgreSQL client
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-arabic \
    postgresql-client

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy fonts for PDF generation with Arabic support
COPY fonts ./fonts

# Copy migrations directory
COPY migrations ./migrations

# Copy init script
COPY init-db.sh ./init-db.sh
RUN chmod +x ./init-db.sh

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Use init script as entrypoint
CMD ["./init-db.sh"]
