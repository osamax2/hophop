import React, { useState, useEffect } from 'react';
import { companyBookingsApi } from '../lib/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Booking {
  id: number;
  booking_status: string;
  seats_booked: number;
  total_price: number;
  currency: string;
  booking_date: string;
  user_email?: string;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  user_name?: string;
  user_phone?: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  trip_id: number;
}

export default function CompanyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await companyBookingsApi.getAll();
      setBookings(data.bookings || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (bookingId: number) => {
    if (!confirm('Buchung akzeptieren? Ein QR-Code wird generiert und an den Kunden gesendet.')) {
      return;
    }

    try {
      setProcessingId(bookingId);
      await companyBookingsApi.accept(bookingId);
      alert('Buchung erfolgreich akzeptiert! QR-Code wurde an den Kunden gesendet.');
      await fetchBookings();
    } catch (err: any) {
      console.error('Failed to accept booking:', err);
      alert('Fehler beim Akzeptieren der Buchung: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: number) => {
    const reason = prompt('Grund für die Ablehnung (optional):');
    if (reason === null) return; // User cancelled

    try {
      setProcessingId(bookingId);
      await companyBookingsApi.reject(bookingId, reason || undefined);
      alert('Buchung wurde abgelehnt.');
      await fetchBookings();
    } catch (err: any) {
      console.error('Failed to reject booking:', err);
      alert('Fehler beim Ablehnen der Buchung: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.booking_status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      checked_in: 'bg-purple-100 text-purple-800 border-purple-300'
    };

    const labels = {
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      cancelled: 'Storniert',
      completed: 'Abgeschlossen',
      checked_in: 'Eingecheckt'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'pending').length,
    confirmed: bookings.filter(b => b.booking_status === 'confirmed').length,
    checked_in: bookings.filter(b => b.booking_status === 'checked_in').length,
    completed: bookings.filter(b => b.booking_status === 'completed').length,
    cancelled: bookings.filter(b => b.booking_status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-semibold">Fehler beim Laden der Buchungen</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Firmenbuchungen</h2>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alle ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Ausstehend ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'confirmed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Bestätigt ({statusCounts.confirmed})
          </button>
          <button
            onClick={() => setFilter('checked_in')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'checked_in' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Eingecheckt ({statusCounts.checked_in})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Keine Buchungen gefunden</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div 
                key={booking.id} 
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Buchung #{booking.id}
                      </h3>
                      {getStatusBadge(booking.booking_status)}
                    </div>
                    <div className="flex flex-col gap-1 text-gray-600 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{booking.user_name || booking.guest_name || 'Unbekannt'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="ml-6">📧 {booking.user_email || booking.guest_email}</span>
                      </div>
                      {(booking.guest_phone || booking.user_phone) && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="ml-6">📞 {booking.guest_phone || booking.user_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {booking.booking_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={processingId === booking.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Akzeptieren
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={processingId === booking.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Ablehnen
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{booking.from_city}</p>
                      <p className="text-gray-500">→ {booking.to_city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Abfahrt</p>
                      <p className="text-gray-600">
                        {new Date(booking.departure_time).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Sitze</p>
                      <p className="text-gray-600">{booking.seats_booked}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Gesamtpreis</p>
                      <p className="text-gray-600">
                        {booking.total_price.toFixed(2)} {booking.currency}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Gebucht am</p>
                      <p className="text-gray-600">
                        {new Date(booking.booking_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
