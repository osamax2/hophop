# Docker Setup für HopHop

Dieses Projekt ist für Docker konfiguriert mit 3 Komponenten:
- **Database**: PostgreSQL 16
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + Nginx

---

## 🚀 Quick Start (Production)

### 1. Environment-Datei erstellen
```bash
cp .env.example .env
# Bearbeite .env und setze sichere Werte für POSTGRES_PASSWORD und JWT_SECRET
```

### 2. Container starten
```bash
docker-compose up -d --build
```

### 3. Zugriff
- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

---

## 🛠️ Development Mode (mit Hot-Reload)

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Zugriff im Development
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

---

## 📋 Nützliche Befehle

### Container verwalten
```bash
# Status anzeigen
docker-compose ps

# Logs anzeigen
docker-compose logs -f

# Logs für einzelnen Service
docker-compose logs -f backend

# Container stoppen
docker-compose down

# Container stoppen und Volumes löschen (⚠️ Datenbank wird gelöscht!)
docker-compose down -v
```

### Datenbank

```bash
# Mit Datenbank verbinden
docker exec -it hophop-db psql -U hophop -d hophop

# Backup erstellen
docker exec hophop-db pg_dump -U hophop hophop > backup.sql

# Backup wiederherstellen
docker exec -i hophop-db psql -U hophop hophop < backup.sql
```

### Rebuild einzelner Services
```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## 🔧 Konfiguration

### Environment Variables

| Variable | Default | Beschreibung |
|----------|---------|--------------|
| `POSTGRES_USER` | hophop | Datenbank-Benutzer |
| `POSTGRES_PASSWORD` | hophop123 | Datenbank-Passwort |
| `POSTGRES_DB` | hophop | Datenbankname |
| `JWT_SECRET` | - | Secret für JWT-Token (WICHTIG: In Production ändern!) |

---

## 📁 Struktur

```
hophop/
├── docker-compose.yml        # Production Setup
├── docker-compose.dev.yml    # Development Setup (Hot-Reload)
├── .env.example              # Environment Template
├── backend/
│   ├── Dockerfile            # Production Build
│   ├── Dockerfile.dev        # Development Build
│   └── .dockerignore
└── frontend/
    ├── Dockerfile            # Production Build (mit Nginx)
    ├── Dockerfile.dev        # Development Build (Vite Dev Server)
    ├── nginx.conf            # Nginx Konfiguration
    └── .dockerignore
```

---

## ⚠️ Wichtige Hinweise

1. **Erste Ausführung**: Die Datenbank wird automatisch mit `backup_fixed.sql` initialisiert.

2. **Uploads**: Uploads werden in einem Docker Volume gespeichert (`backend_uploads`).

3. **Production**: Ändere unbedingt `JWT_SECRET` und `POSTGRES_PASSWORD` in der `.env` Datei!

4. **Datenbank-Reset**: Um die Datenbank neu zu initialisieren:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

5. **Backup konvertieren**: Falls du ein neues Backup erstellen musst:
   ```bash
   # Backup aus Container exportieren
   docker exec hophop-db pg_dump -U hophop hophop > backup_new.sql
   
   # Oder falls das Backup in UTF-16 ist:
   iconv -f UTF-16LE -t UTF-8 backup.sql | grep -v 'restrict' | sed 's/OWNER TO postgres/OWNER TO hophop/g' | tr -d '\r' > backup_fixed.sql
   ```
