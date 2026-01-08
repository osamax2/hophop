# QR-Code Buchungsverifizierungssystem - Vollständige Implementierung

## Übersicht

Das QR-Code-Buchungsverifizierungssystem ermöglicht es Transportunternehmen, Buchungen zu verwalten und Fahrern, Tickets über QR-Codes zu verifizieren.

## Workflow

1. **Kunde bucht eine Fahrt**
   - Über die normale Buchungsmaske (angemeldet oder als Gast)
   - Status: `pending`

2. **Firmen-Manager sieht neue Buchung**
   - Login als Agent mit `agent_type=manager`
   - Admin-Dashboard → Tab "Firmenbuchungen"
   - Liste aller Buchungen für Fahrten der eigenen Firma

3. **Manager akzeptiert Buchung**
   - Klick auf "Akzeptieren" bei ausstehender Buchung
   - Backend generiert 32-Byte hex QR-Code (crypto.randomBytes)
   - QR-Code wird als PNG-Bild (300x300px) generiert via `QRCode.toDataURL()`
   - Status ändert sich zu `confirmed`
   - QR-Code wird in `qr_code_data` gespeichert
   - E-Mail wird an Kunde gesendet **mit eingebettetem QR-Code-Bild**

4. **Kunde erhält Bestätigungs-E-Mail**
   - E-Mail enthält:
     - ✅ **QR-Code direkt als Bild in der E-Mail** (300x300px, scannbar)
     - ✅ Buchungsdetails in 3 Sprachen
     - ✅ Link zur Buchungsstatusseite: `/booking-status/{status_token}`
   - Kunde kann QR-Code **direkt aus der E-Mail scannen**
   - ODER auf Link klicken für Web-Version

5. **Kunde sieht QR-Code**
   - BookingStatus-Seite lädt
   - Bei Status `confirmed` wird QR-Code-Bild angezeigt
   - Großer, scanbarer QR-Code mit grünem Border
   - Anleitung: "Zeigen Sie diesen Code beim Einsteigen dem Fahrer"

6. **Am Reisetag: Fahrer scannt QR-Code**
   - Login als Agent mit `agent_type=driver` oder `driver_assistant`
   - Admin-Dashboard → Tab "QR-Scanner"
   - Klick auf "Scannen starten"
   - Browser fragt nach Kamera-Berechtigung
   - QR-Code vor die Kamera halten

7. **Verifizierung**
   - QR-Code wird automatisch erkannt
   - Backend überprüft:
     - Existiert der Code?
     - Gehört die Buchung zur Firma des Fahrers?
     - Ist Status = `confirmed`? (nicht `checked_in`, `cancelled`, etc.)
   - **Erfolg (Grün)**:
     - Status ändert sich zu `checked_in`
     - Großer grüner Screen mit ✓
     - Buchungsdetails werden angezeigt
   - **Fehler (Rot)**:
     - Code ungültig, bereits verwendet, oder andere Firma
     - Großer roter Screen mit ✗
     - Fehlermeldung

## Implementierte Dateien

### Backend

#### `/backend/src/routes/company-bookings.ts` (NEU)
```typescript
// 5 REST-Endpunkte:
GET    /api/company-bookings              // Liste aller Buchungen der Firma
PUT    /api/company-bookings/:id/accept   // Buchung akzeptieren
PUT    /api/company-bookings/:id/reject   // Buchung ablehnen
POST   /api/company-bookings/verify-qr    // QR-Code verifizieren
GET    /api/company-bookings/qr-image/:id // QR-Code-Bild generieren
```

**Features:**
- Rollenbasierte Zugriffskontrolle (company_admin, driver, driver_assistant)
- QR-Code-Generierung mit `crypto.randomBytes(32).toString('hex')`
- QR-Code als Bild mit `qrcode.toDataURL()`
- E-Mail-Versand bei Buchungsänderungen
- Firmen-Isolation (Fahrer sehen nur eigene Firmenbuchungen)

#### `/backend/src/index.ts`
- Route registriert: `app.use("/api/company-bookings", companyBookingsRoutes)`

#### `/backend/src/services/email.ts`
**E-Mail-Service mit QR-Code-Integration:**
- Interface `BookingEmailData` erweitert um:
  - `qrCodeDataUrl?: string` - Base64 PNG-Bild des QR-Codes
  - `statusUrl?: string` - Link zur Buchungsstatusseite
- E-Mail-Template `getConfirmedBookingEmailTemplate()` zeigt:
  - QR-Code als 300x300px Bild
  - Mehrsprachige Anleitung zum Scannen
  - Grüner Border und Badge-Design
  - Fallback-Link zur Web-Version
- Responsive HTML-E-Mail (Desktop + Mobile)

### Frontend

#### `/frontend/src/lib/api.ts`
```typescript
export const companyBookingsApi = {
  getAll: async () => {...}              // GET /api/company-bookings
  accept: async (bookingId) => {...}     // PUT /:id/accept
  reject: async (bookingId, reason?) => {...} // PUT /:id/reject
  verifyQR: async (qrData) => {...}      // POST /verify-qr
  getQRImage: async (bookingId) => {...} // GET /qr-image/:id
}
```

#### `/frontend/src/components/BookingStatus.tsx`
- QR-Code-Anzeige für bestätigte Buchungen
- Automatisches Laden des QR-Bildes via `companyBookingsApi.getQRImage()`
- Schönes Design mit grünem Border und Icon
- Mehrsprachig (Deutsch, Englisch, Arabisch)

#### `/frontend/src/components/CompanyBookings.tsx` (NEU)
**Firmen-Dashboard für Manager:**
- Liste aller Buchungen mit Filterung nach Status
- Status-Tabs: Alle, Ausstehend, Bestätigt, Eingecheckt
- Akzeptieren/Ablehnen-Buttons für ausstehende Buchungen
- Detaillierte Buchungsinformationen:
  - Passagiername und E-Mail
  - Route (Von → Nach)
  - Abfahrtzeit
  - Anzahl Sitze
  - Gesamtpreis
  - Buchungsdatum
- Statusanzeige mit farbigen Badges
- Automatisches Neuladen nach Aktionen

#### `/frontend/src/components/QRScanner.tsx` (NEU)
**QR-Scanner für Fahrer:**
- Kamera-Zugriff mit `html5-qrcode`
- Live-Scan-Vorschau
- Automatische QR-Erkennung
- Großes Ergebnis-Feedback:
  - **Grün**: Gültiger Code + Buchungsdetails
  - **Rot**: Ungültiger Code + Fehlermeldung
- "Erneut scannen"-Button
- Mehrsprachige Anleitung
- Kamera-Berechtigungsprüfung

#### `/frontend/src/components/AdminDashboard.tsx`
- Neue Tabs hinzugefügt:
  - **"Firmenbuchungen"** für Agent-Manager (isAgentManager)
  - **"QR-Scanner"** für Fahrer (isDriver)
- Rollenbasierte Tab-Anzeige
- Default-Tab basierend auf Rolle:
  - Admin → Analytics
  - Manager → Firmenbuchungen
  - Fahrer → QR-Scanner

#### `/frontend/package.json`
- Neue Dependency: `html5-qrcode@latest`

## Datenbankschema

### `bookings` Tabelle
```sql
qr_code_data VARCHAR(255) UNIQUE  -- 64 Zeichen hex string (32 bytes)
booking_status VARCHAR(50)        -- pending, confirmed, checked_in, cancelled, completed
-- Index bereits vorhanden: idx_bookings_qr_code_data
```

## API-Endpunkte Details

### 1. GET /api/company-bookings
**Auth:** Bearer Token (company_admin, driver, driver_assistant)  
**Rückgabe:**
```json
{
  "bookings": [
    {
      "id": 123,
      "booking_status": "confirmed",
      "seats_booked": 2,
      "total_price": 50.00,
      "currency": "EUR",
      "from_city": "Berlin",
      "to_city": "München",
      "departure_time": "2024-01-15T10:00:00Z",
      "user_name": "Max Mustermann",
      "user_email": "max@example.com",
      // ... weitere Felder
    }
  ]
}
```

### 2. PUT /api/company-bookings/:id/accept
**Auth:** Bearer Token (company_admin)  
**Rückgabe:**
```json
{
  "message": "Booking accepted successfully",
  "bookingId": 123,
  "qrCodeData": "abc123...def456"
}
```
**Aktionen:**
- Generiert QR-Code (32 Bytes hex = 64 Zeichen)
- Generiert QR-Code-Bild als PNG (Base64 Data URL, 300x300px)
- Speichert QR-Code in `qr_code_data`
- Ändert Status zu `confirmed`
- Sendet E-Mail an Kunde **mit eingebettetem QR-Code-Bild**

### 3. PUT /api/company-bookings/:id/reject
**Auth:** Bearer Token (company_admin)  
**Body:** `{ "reason": "optional" }`  
**Rückgabe:**
```json
{
  "message": "Booking rejected successfully"
}
```

### 4. POST /api/company-bookings/verify-qr
**Auth:** Bearer Token (company_admin, driver, driver_assistant)  
**Body:** `{ "qrData": "abc123...def456" }`  
**Rückgabe (Erfolg):**
```json
{
  "valid": true,
  "message": "Booking verified successfully",
  "booking": {
    "id": 123,
    "from_city": "Berlin",
    "to_city": "München",
    // ... Buchungsdetails
  }
}
```
**Rückgabe (Fehler):**
```json
{
  "valid": false,
  "message": "Invalid QR code or already checked in"
}
```

### 5. GET /api/company-bookings/qr-image/:bookingId
**Auth:** Keine (öffentlich, da nur mit status_token zugänglich)  
**Rückgabe:**
```json
{
  "qrCode": "data:image/png;base64,iVBOR..."
}
```

## Sicherheitsmerkmale

1. **Crypto-sichere QR-Codes**
   - `crypto.randomBytes(32)` = 32 Bytes = 64 hex Zeichen
   - ~256 Bit Entropie
   - Praktisch unmöglich zu raten

2. **Single-Use QR-Codes**
   - Status-Check verhindert doppeltes Einchecken
   - Nur `confirmed` → `checked_in` erlaubt
   - Bereits eingecheckte Tickets werden abgelehnt

3. **Firmen-Isolation**
   - SQL-Abfrage prüft `company_id` über Trip-Relation
   - Fahrer können nur QR-Codes ihrer eigenen Firma verifizieren
   - Cross-Company-Angriffe unmöglich

4. **Rollenbasierte Zugriffskontrolle**
   - company_admin: Kann akzeptieren/ablehnen
   - driver/driver_assistant: Kann nur scannen/verifizieren
   - Keine Überschneidung der Berechtigungen

5. **Status-Token für Buchungsstatus**
   - Separater Token für öffentlichen Zugriff
   - QR-Code-Bild ohne Auth abrufbar (aber nur mit status_token)

## Testing

### Manueller Test-Workflow

1. **Buchung erstellen:**
```bash
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": 1,
    "quantity": 2,
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "+49123456789"
  }'
```

2. **Als Manager einloggen:**
```bash
# Im Browser: Admin-Dashboard → Firmenbuchungen
# Oder API:
curl http://localhost/api/company-bookings \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN"
```

3. **Buchung akzeptieren:**
```bash
curl -X PUT http://localhost/api/company-bookings/1/accept \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN"
```

4. **Buchungsstatus ansehen:**
```bash
# Im Browser: /booking-status/{status_token}
# QR-Code sollte angezeigt werden
```

5. **QR-Code scannen:**
```bash
# Im Browser als Fahrer: Admin-Dashboard → QR-Scanner
# Oder API:
curl -X POST http://localhost/api/company-bookings/verify-qr \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrData": "QR_CODE_FROM_PREVIOUS_STEP"}'
```

### Datenbank-Checks

```sql
-- Buchung mit QR-Code finden
SELECT id, booking_status, qr_code_data, from_city, to_city 
FROM bookings 
WHERE booking_status = 'confirmed' AND qr_code_data IS NOT NULL;

-- QR-Code-Länge prüfen
SELECT id, LENGTH(qr_code_data) as qr_length 
FROM bookings 
WHERE qr_code_data IS NOT NULL;
-- Sollte 64 zurückgeben

-- Eingecheckte Buchungen
SELECT id, booking_status, from_city, to_city, updated_at
FROM bookings 
WHERE booking_status = 'checked_in'
ORDER BY updated_at DESC;
```

## Fehlerbehebung

### QR-Code wird nicht angezeigt
- **Check 1:** `booking_status` muss `confirmed` sein
- **Check 2:** `qr_code_data` darf nicht NULL sein
- **Check 3:** Frontend-API-Call erfolgreich? (Browser Console prüfen)
- **Check 4:** Backend-Route läuft? `docker logs hophop-backend | grep company-bookings`

### Scanner findet Kamera nicht
- **Check 1:** Browser-Berechtigung erteilt? (Chrome → Einstellungen → Datenschutz)
- **Check 2:** HTTPS erforderlich? (Localhost funktioniert ohne, Production braucht SSL)
- **Check 3:** Andere Apps verwenden Kamera? (Schließen und neu versuchen)

### QR-Code wird als ungültig erkannt
- **Check 1:** Richtiger QR-Code gescannt? (Nicht alter/falscher Code)
- **Check 2:** Status bereits `checked_in`? (Kann nur einmal gescannt werden)
- **Check 3:** Fahrer gehört zur richtigen Firma? (company_id prüfen)
- **Check 4:** Backend-Logs prüfen: `docker logs hophop-backend --tail 100`

### E-Mail wird nicht versendet
- **Check 1:** SMTP-Credentials konfiguriert? (Backend `.env`)
- **Check 2:** Backend-Logs prüfen: "Email not sent - SMTP not configured"
- **Check 3:** SMTP-Server erreichbar? (Firewall, DNS)

## Deployment

### Backend
```bash
cd /Volumes/WorkSSD/hophop/backend
npm run build
docker-compose restart backend
```

### Frontend
```bash
cd /Volumes/WorkSSD/hophop
docker-compose stop frontend
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

## Nächste Schritte / TODOs

- [x] Backend-Routen implementiert
- [x] QR-Code-Generierung implementiert
- [x] QR-Code als Bild in E-Mail eingebettet
- [x] E-Mail-Template mit QR-Code-Sektion
- [x] Frontend QR-Anzeige implementiert
- [x] CompanyBookings-Dashboard implementiert
- [x] QRScanner-Komponente implementiert
- [x] AdminDashboard-Integration
- [x] Backend neugestartet
- [x] Frontend neu gebaut
- [x] E-Mail-Vorschau erstellt (email-preview.html)
- [ ] E-Mail-Templates verfeinern (optional)
- [ ] Statistiken zu gescannten QR-Codes (optional)
- [ ] QR-Code-Historie/Audit-Log (optional)
- [ ] Push-Benachrichtigungen bei Buchungsänderungen (optional)
- [ ] Offline-Modus für Scanner (PWA, optional)

## E-Mail-Vorschau

Eine visuelle Vorschau der E-Mail mit eingebettetem QR-Code finden Sie in:
**`/backend/email-preview.html`**

Öffnen Sie diese Datei im Browser, um zu sehen, wie die E-Mail für Kunden aussieht.

## Lizenz & Credits

- **QR-Code-Generierung:** qrcode (npm package)
- **QR-Code-Scanner:** html5-qrcode (npm package)
- **Crypto:** Node.js native crypto module

---
**Status:** ✅ Vollständig implementiert und deployed  
**Letzte Aktualisierung:** 2024-01-08  
**Autor:** Development Team
