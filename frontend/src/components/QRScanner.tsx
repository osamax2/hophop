import React, { useState, useEffect, useRef } from 'react';
import { companyBookingsApi } from '../lib/api';
import { Camera, CheckCircle, XCircle, Scan, AlertCircle, Download, Send, Trash2, Users } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannedBooking {
  id: number;
  passengerName: string;
  seats: number;
  assignedSeats: string;
  route: string;
  departureTime: string;
  checkedInAt: string;
  tripId?: number;
}

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    booking?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // List of scanned bookings for the current trip
  const [scannedBookings, setScannedBookings] = useState<ScannedBooking[]>([]);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    // Check camera permission on mount
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then(permissionStatus => {
        setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        
        permissionStatus.onchange = () => {
          setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        };
      });
    }
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setResult(null);
      setScanning(true);

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          // QR code successfully scanned
          console.log('QR Code detected:', decodedText);
          
          // Stop scanning immediately
          await stopScanning();
          
          // Verify the QR code
          await verifyQRCode(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (happens continuously while searching)
          // console.log('Scan error:', errorMessage);
        }
      );
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setError('Kamera konnte nicht gestartet werden: ' + (err.message || 'Unknown error'));
      setScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setCameraPermission('denied');
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setScanning(false);
  };

  const verifyQRCode = async (qrData: string) => {
    try {
      const response = await companyBookingsApi.verifyQR(qrData);
      
      if (response.valid) {
        setResult({
          success: true,
          message: 'QR-Code gültig! Buchung wurde eingecheckt.',
          booking: response.booking
        });
        
        // Add to scanned bookings list if not already there
        const booking = response.booking;
        setScannedBookings(prev => {
          if (prev.some(b => b.id === booking.id)) {
            return prev; // Already in list
          }
          return [...prev, {
            id: booking.id,
            passengerName: booking.passengerName || booking.user_name || booking.guest_name || 'Unbekannt',
            seats: booking.seats || booking.seats_booked || 1,
            assignedSeats: booking.assignedSeats || '-',
            route: booking.route || `${booking.from_city} → ${booking.to_city}`,
            departureTime: booking.departureTime || booking.departure_time,
            checkedInAt: new Date().toISOString(),
            tripId: booking.tripId
          }];
        });
        setReportSent(false); // Reset report sent status when new booking added
      } else {
        setResult({
          success: false,
          message: response.message || 'QR-Code ungültig oder bereits verwendet.'
        });
      }
    } catch (err: any) {
      console.error('Failed to verify QR code:', err);
      setResult({
        success: false,
        message: 'Verifizierung fehlgeschlagen: ' + (err.message || 'Unknown error')
      });
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setError(null);
    startScanning();
  };

  // Generate CSV content
  const generateCSV = () => {
    const headers = ['Buchungs-Nr', 'Passagier', 'Sitze', 'Sitzplätze', 'Route', 'Abfahrt', 'Eingecheckt'];
    const rows = scannedBookings.map(b => [
      b.id.toString(),
      b.passengerName,
      b.seats.toString(),
      b.assignedSeats,
      b.route,
      new Date(b.departureTime).toLocaleString('de-DE'),
      new Date(b.checkedInAt).toLocaleString('de-DE')
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');
    
    return csvContent;
  };

  // Download CSV file
  const downloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `passagierliste_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Send report to manager and download CSV
  const sendReportToManager = async () => {
    if (scannedBookings.length === 0) return;
    
    setSendingReport(true);
    try {
      // Download CSV first
      downloadCSV();
      
      // Send to manager
      const tripId = scannedBookings[0]?.tripId || 0;
      await companyBookingsApi.sendPassengerReport(tripId, scannedBookings.map(b => ({
        bookingId: b.id,
        passengerName: b.passengerName,
        seats: b.seats,
        assignedSeats: b.assignedSeats,
        route: b.route,
        departureTime: b.departureTime,
        checkedInAt: b.checkedInAt
      })));
      
      setReportSent(true);
      // Clear the list after sending
      setScannedBookings([]);
      setResult(null);
    } catch (err: any) {
      console.error('Failed to send report:', err);
      setError('Bericht konnte nicht gesendet werden: ' + (err.message || 'Unknown error'));
    } finally {
      setSendingReport(false);
    }
  };

  // Clear the scanned list
  const clearScannedList = () => {
    setScannedBookings([]);
    setReportSent(false);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Scan className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">QR-Code Scanner</h2>
        </div>

        {/* Camera Permission Warning */}
        {cameraPermission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Kamera-Zugriff verweigert</p>
                <p className="text-sm text-red-700 mt-1">
                  Bitte erlauben Sie den Kamera-Zugriff in Ihren Browser-Einstellungen, um QR-Codes scannen zu können.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Fehler</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className={`border-2 rounded-lg p-6 mb-4 ${
            result.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-xl font-bold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.success ? '✓ Gültig' : '✗ Ungültig'}
                </p>
                <p className={`text-sm mb-4 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>

                {result.booking && (
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Buchung:</span>
                      <span className="text-gray-900">#{result.booking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Passagier:</span>
                      <span className="text-gray-900">{result.booking.passengerName || result.booking.user_name || result.booking.guest_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Route:</span>
                      <span className="text-gray-900">{result.booking.route || `${result.booking.from_city} → ${result.booking.to_city}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Sitze:</span>
                      <span className="text-gray-900">{result.booking.seats || result.booking.seats_booked}</span>
                    </div>
                    {result.booking.assignedSeats && (
                      <div className="flex justify-between bg-green-100 -mx-4 px-4 py-2 rounded">
                        <span className="font-semibold text-green-800">🪑 Sitzplätze:</span>
                        <span className="text-green-900 font-bold text-lg">{result.booking.assignedSeats}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Abfahrt:</span>
                      <span className="text-gray-900">
                        {new Date(result.booking.departure_time).toLocaleString('de-DE')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scanner Container */}
        <div className="relative">
          <div 
            id="qr-reader" 
            className={`rounded-lg overflow-hidden ${scanning ? 'block' : 'hidden'}`}
          ></div>
          
          {!scanning && !result && (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Klicken Sie auf "Scannen starten", um einen QR-Code zu scannen
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {!scanning && !result && (
            <button
              onClick={startScanning}
              disabled={cameraPermission === 'denied'}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Scannen starten
            </button>
          )}
          
          {scanning && (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Stoppen
            </button>
          )}
          
          {result && (
            <button
              onClick={handleScanAgain}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Scan className="w-5 h-5" />
              Erneut scannen
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-semibold mb-2">Anleitung:</p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Klicken Sie auf "Scannen starten"</li>
            <li>Erlauben Sie den Kamera-Zugriff wenn gefragt</li>
            <li>Halten Sie den QR-Code vor die Kamera</li>
            <li>Der Code wird automatisch erkannt und verifiziert</li>
            <li>Grün = gültig, Rot = ungültig oder bereits verwendet</li>
          </ul>
        </div>
      </div>

      {/* Scanned Bookings List */}
      {scannedBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Eingecheckte Passagiere ({scannedBookings.length})
              </h3>
            </div>
            <button
              onClick={clearScannedList}
              className="text-gray-500 hover:text-red-600 p-2"
              title="Liste löschen"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Passenger List */}
          <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
            {scannedBookings.map((booking, index) => (
              <div 
                key={booking.id} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-gray-900">{booking.passengerName}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>{booking.route}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-700">
                      🪑 {booking.assignedSeats}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.seats} {booking.seats === 1 ? 'Sitz' : 'Sitze'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Eingecheckt: {new Date(booking.checkedInAt).toLocaleTimeString('de-DE')}
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-800">Gesamt Passagiere:</span>
              <span className="text-2xl font-bold text-green-700">
                {scannedBookings.reduce((sum, b) => sum + b.seats, 0)}
              </span>
            </div>
          </div>

          {/* Send Report Button */}
          <button
            onClick={sendReportToManager}
            disabled={sendingReport || reportSent}
            className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-3 text-lg ${
              reportSent
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : sendingReport
                ? 'bg-gray-300 text-gray-600 cursor-wait'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {reportSent ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Bericht gesendet & heruntergeladen ✓
              </>
            ) : sendingReport ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <Download className="w-6 h-6" />
                Passagierliste an Manager senden
              </>
            )}
          </button>

          {reportSent && (
            <p className="text-center text-sm text-green-600 mt-3">
              Die CSV-Datei wurde heruntergeladen und per E-Mail an den Manager gesendet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
