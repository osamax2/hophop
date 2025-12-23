#!/bin/bash

# HopHop Deployment Script
# Usage: ./deploy.sh [server_ip]

SERVER=${1:-"87.106.51.243"}
USER="root"
APP_DIR="/opt/hophop"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Deploying HopHop to $USER@$SERVER..."

# Create directory on server
echo "📁 Creating directory on server..."
ssh $USER@$SERVER "mkdir -p $APP_DIR"

# Sync files to server (excluding node_modules, .git, etc.)
echo "📤 Syncing files to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.DS_Store' \
    --exclude 'backup.sql' \
    --exclude 'backup_clean.sql' \
    "$PROJECT_DIR/" "$USER@$SERVER:$APP_DIR/"

# Copy .env file if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "🔐 Copying .env file..."
    scp "$PROJECT_DIR/.env" "$USER@$SERVER:$APP_DIR/.env"
else
    echo "⚠️  No .env file found. Using .env.example..."
    scp "$PROJECT_DIR/.env.example" "$USER@$SERVER:$APP_DIR/.env"
fi

# Deploy on server
echo "🐳 Starting Docker containers on server..."
ssh $USER@$SERVER "cd $APP_DIR && docker compose down && docker compose up -d --build"

# Show status
echo "📊 Checking container status..."
ssh $USER@$SERVER "cd $APP_DIR && docker compose ps"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://$SERVER"
echo "🔌 Backend API: http://$SERVER:4000"
echo ""
