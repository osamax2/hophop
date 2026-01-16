#!/bin/bash
# Deploy script for HopHop backend
# This script syncs files to the server WITHOUT overwriting .env

set -e

SERVER="root@87.106.51.243"
REMOTE_PATH="/root/hophop/backend"

echo "Syncing backend files to server..."
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.env' \
  /Volumes/WorkSSD/hophop/backend/ $SERVER:$REMOTE_PATH/

echo "Building backend on server..."
ssh $SERVER "cd $REMOTE_PATH && docker build --no-cache -t hophop-backend ."

echo "Restarting backend container..."
ssh $SERVER "docker stop hophop-backend && docker rm hophop-backend && docker run -d --name hophop-backend --network hophop_hophop-network -p 8081:4000 -v hophop_backend_uploads:/app/uploads -v /root/hophop/backend/.env:/app/.env hophop-backend"

echo "Done! Backend deployed successfully."
