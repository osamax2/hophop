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

# Create init script inline (avoids Windows CRLF issues)
RUN printf '#!/bin/sh\n\
set -e\n\
echo "Waiting for database to be ready..."\n\
until pg_isready -h ${DB_HOST:-hophop-db} -U ${DB_USER:-hophop}; do\n\
  sleep 1\n\
done\n\
echo "Database is ready. Running migrations..."\n\
for migration in /app/migrations/*.sql; do\n\
  if [ -f "$migration" ]; then\n\
    echo "Running migration: $(basename $migration)"\n\
    PGPASSWORD=${DB_PASSWORD:-hophop123} psql -h ${DB_HOST:-hophop-db} -U ${DB_USER:-hophop} -d ${DB_NAME:-hophop} -f "$migration" 2>&1 || {\n\
      echo "Warning: Migration $(basename $migration) failed or already applied"\n\
    }\n\
  fi\n\
done\n\
echo "Migrations complete. Starting application..."\n\
exec npm start\n' > ./init-db.sh && chmod +x ./init-db.sh

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Use init script as entrypoint
CMD ["./init-db.sh"]
