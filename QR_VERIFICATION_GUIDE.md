# QR Code Verifizierung für Fahrer und Fahrerassistenten

## Übersicht

Das System ermöglicht es Fahrern und Fahrerassistenten, QR-Codes von Buchungen ihrer eigenen Firma zu scannen und zu verifizieren. Dies gewährleistet die Sicherheit, dass nur autorisierte Mitarbeiter Buchungen ihrer Firma einchecken können.

## Sicherheitsmechanismen

### 1. Rollenberechtigung
**Backend Middleware (`requireRole`):**
- Prüft sowohl System-Rollen (`roles`) als auch Filial-Mitarbeiterrollen (`branch_staff_roles`)
- Erlaubte Rollen für QR-Verifizierung:
  - `company_admin` - Firmen-Manager
  - `driver` - Fahrer
  - `driver_assistant` - Fahrerassistent

**Berechtigte Rollen-Kombinationen:**
```typescript
// System-Rolle: Agent + Filial-Rolle: driver
user.role = 'agent' 
user.agent_type = 'driver'

// System-Rolle: Agent + Filial-Rolle: driver_assistant
user.role = 'agent'
user.agent_type = 'driver_assistant'

// System-Rolle: Agent + Filial-Rolle: manager
user.role = 'agent'
user.agent_type = 'manager'
```

### 2. Firmen-Zuordnung
**QR-Verifizierung prüft:**
1. Benutzer hat eine `company_id`
2. Buchung gehört zu einer Fahrt (`trip_id`) dieser Firma
3. Buchung hat Status `confirmed`

**SQL-Abfrage:**
```sql
SELECT b.*, t.*, fc.name as from_city, tc.name as to_city
FROM bookings b
JOIN trips t ON t.id = b.trip_id
WHERE b.qr_code_data = $1 
  AND t.company_id = $2          -- ✓ Firmen-Check
  AND b.booking_status = 'confirmed'
```

### 3. Status-Management
**Buchungs-Status-Flow:**
1. `pending` → Neue Buchung
2. `confirmed` → Bestätigt (QR-Code generiert)
3. `checked_in` → Eingecheckt per QR-Scan ✓
4. `cancelled` → Storniert

**Nur `confirmed` Buchungen können eingecheckt werden!**

## API Endpoints

### POST /api/company-bookings/verify-qr
**Berechtigung:** `company_admin`, `driver`, `driver_assistant`

**Request:**
```json
{
  "qrData": "booking_123_abc456def..."
}
```

**Response (Erfolg):**
```json
{
  "valid": true,
  "message": "Booking verified successfully",
  "booking": {
    "id": 123,
    "passengerName": "Max Mustermann",
    "seats": 2,
    "route": "Damascus → Aleppo",
    "departureTime": "2026-01-10T10:00:00Z"
  }
}
```

**Response (Fehler - Falsche Firma):**
```json
{
  "valid": false,
  "message": "Invalid QR code or booking not confirmed"
}
```

**Response (Fehler - Keine Firma zugeordnet):**
```json
{
  "message": "No company associated with this user"
}
```

## Frontend Integration

### QR-Scanner Komponente
**Verfügbar für:**
- Fahrer (`agent_type === 'driver'`)
- Fahrerassistent (`agent_type === 'driver_assistant'`)

**Features:**
- Kamera-Zugriff mit Berechtigungsprüfung
- Automatische QR-Code-Erkennung
- Echtzeit-Verifizierung gegen Backend
- Visuelle Erfolgs-/Fehleranzeige
- Buchungsdetails-Anzeige bei erfolgreicher Verifizierung

**Zugriffsweg:**
1. Als Fahrer/Fahrerassistent einloggen
2. Automatisch zum QR-Scanner Tab weitergeleitet
3. "Scannen starten" klicken
4. Kamera-Zugriff erlauben
5. QR-Code vor die Kamera halten

## Testszenarien

### Szenario 1: Erfolgreiche Verifizierung
**Setup:**
1. Benutzer: Fahrer von "Firma A"
2. Buchung: Trip von "Firma A", Status `confirmed`
3. QR-Code: Gültiger Code von dieser Buchung

**Erwartetes Ergebnis:**
- ✅ QR-Code wird als gültig erkannt
- ✅ Buchung wird auf `checked_in` gesetzt
- ✅ Passagierdetails werden angezeigt

### Szenario 2: Falsche Firma
**Setup:**
1. Benutzer: Fahrer von "Firma A"
2. Buchung: Trip von "Firma B", Status `confirmed`
3. QR-Code: Gültiger Code von Firma B's Buchung

**Erwartetes Ergebnis:**
- ❌ QR-Code wird als ungültig erkannt
- ❌ Meldung: "Invalid QR code or booking not confirmed"
- ❌ Buchung bleibt `confirmed`

### Szenario 3: Bereits eingecheckt
**Setup:**
1. Benutzer: Fahrer von "Firma A"
2. Buchung: Trip von "Firma A", Status `checked_in`
3. QR-Code: Bereits verwendeter Code

**Erwartetes Ergebnis:**
- ❌ QR-Code wird als ungültig erkannt
- ❌ Meldung: "Invalid QR code or booking not confirmed"
- ❌ Status bleibt `checked_in`

### Szenario 4: Keine Firmen-Zuordnung
**Setup:**
1. Benutzer: Fahrer ohne `company_id`
2. Buchung: Beliebiger Trip

**Erwartetes Ergebnis:**
- ❌ HTTP 403 Fehler
- ❌ Meldung: "No company associated with this user"

### Szenario 5: Falsche Rolle
**Setup:**
1. Benutzer: Normaler User (kein Fahrer)
2. Versucht QR-Scanner zu öffnen

**Erwartetes Ergebnis:**
- ❌ HTTP 403 Fehler
- ❌ Kein Zugriff auf QR-Scanner Tab

## Datenbank-Struktur

### Relevante Tabellen

**users:**
```sql
id: INTEGER
company_id: INTEGER           -- Zuordnung zur Firma
branch_staff_role_id: INTEGER -- Rolle: driver, driver_assistant, manager
```

**branch_staff_roles:**
```sql
id: INTEGER
code: VARCHAR                 -- 'driver', 'driver_assistant', 'branch_manager'
name: VARCHAR                 -- 'Driver', 'Driver Assistant', 'Branch Manager'
```

**bookings:**
```sql
id: INTEGER
trip_id: INTEGER              -- Verknüpfung zum Trip
booking_status: VARCHAR       -- 'pending', 'confirmed', 'checked_in', 'cancelled'
qr_code_data: TEXT           -- Einzigartiger QR-Code String
```

**trips:**
```sql
id: INTEGER
company_id: INTEGER           -- Zuordnung zur Firma (wichtig für Verifizierung!)
route_id: INTEGER
```

## Sicherheits-Best Practices

1. **Niemals QR-Code-Daten im Frontend speichern**
2. **Immer company_id des Benutzers mit trip.company_id vergleichen**
3. **Nur bestätigte Buchungen (`confirmed`) können eingecheckt werden**
4. **Status-Änderung protokollieren mit Timestamp**
5. **Rate-Limiting für QR-Scan-Endpunkt implementieren** (TODO)
6. **QR-Code sollte nur einmal verwendbar sein** (bereits implementiert)

## Deployment-Status

✅ Backend API implementiert
✅ Middleware für Rollenberechtigung erweitert
✅ Frontend QR-Scanner Komponente fertig
✅ Firmen-Zuordnungsprüfung aktiv
✅ Status-Management implementiert
✅ Fehlerbehandlung implementiert

## Nächste Schritte

1. **Rate-Limiting hinzufügen** - Max. 10 Scans pro Minute pro Benutzer
2. **Audit-Log implementieren** - Protokolliere alle QR-Scans
3. **Offline-Modus** - QR-Codes temporär offline speichern und später synchronisieren
4. **Push-Benachrichtigungen** - Manager benachrichtigen bei Check-In
5. **Statistiken** - Dashboard für Check-In-Raten pro Fahrer/Route

## Support

Bei Problemen:
1. Backend-Logs prüfen: `docker compose logs backend | grep "verify-qr"`
2. Firmen-Zuordnung prüfen: `SELECT company_id FROM users WHERE id = ?`
3. Rollenzuordnung prüfen: `SELECT * FROM branch_staff_roles WHERE id = (SELECT branch_staff_role_id FROM users WHERE id = ?)`
4. Buchungsstatus prüfen: `SELECT booking_status FROM bookings WHERE qr_code_data = ?`
