#!/bin/bash
# Frontend Deployment Script
# Führe diesen Code im CloudPanel Terminal aus

set -e

echo "🚀 Starting Frontend Deployment..."

# 1. Frontend vom Container holen und sichern
echo "📦 Backing up current frontend..."
docker exec hophop-frontend sh -c "cd /usr/share/nginx/html && tar -czf /tmp/backup.tar.gz ."

# 2. Temporäres Upload-Verzeichnis erstellen
echo "📁 Preparing upload directory..."
mkdir -p /tmp/new-frontend
cd /tmp/new-frontend

# 3. Hier Upload-Instruktionen
echo ""
echo "⏸️  PAUSIERT - Jetzt musst du:"
echo "   1. frontend.tar.gz hochladen nach /tmp/new-frontend/"
echo "   2. Dann dieses Script weiter ausführen"
echo ""
read -p "Drücke Enter wenn frontend.tar.gz hochgeladen ist..."

# 4. Entpacken und deployen
echo "📦 Extracting new frontend..."
tar -xzf frontend.tar.gz

# 5. In Container kopieren
echo "🐳 Deploying to container..."
docker cp . hophop-frontend:/usr/share/nginx/html/

# 6. Nginx reload
echo "🔄 Reloading Nginx..."
docker exec hophop-frontend nginx -s reload

# 7. Test
echo "✅ Testing deployment..."
curl -I http://localhost:8080 2>&1 | head -3

echo ""
echo "🎉🎉🎉 Frontend deployed successfully!"
echo ""
echo "🌍 Test: http://hophopsy.com (nach DNS-Propagierung)"
