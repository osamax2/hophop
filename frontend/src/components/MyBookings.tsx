import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import type { Language, User } from '../App';
import { formatCurrency, formatTime } from '../lib/i18n-utils';

interface MyBookingsProps {
  language: Language;
  isLoggedIn: boolean;
  user: User | null;
  onNavigateToLogin: () => void;
  onNavigateToBookingStatus: (token: string) => void;
}

const translations = {
  de: {
    title: 'Meine Buchungen',
    noBookings: 'Keine Buchungen gefunden',
    noBookingsDesc: 'Sie haben noch keine Fahrten gebucht',
    loginRequired: 'Bitte melden Sie sich an, um Ihre Buchungen zu sehen',
    login: 'Anmelden',
    bookingNumber: 'Buchungsnummer',
    status: 'Status',
    trip: 'Fahrt',
    date: 'Datum',
    seats: 'Plätze',
    totalPrice: 'Gesamtpreis',
    company: 'Gesellschaft',
    from: 'Von',
    to: 'Nach',
    departure: 'Abfahrt',
    arrival: 'Ankunft',
    bookedOn: 'Gebucht am',
    // Status translations
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    cancelled: 'Storniert',
    cancellation_requested: 'Stornierung angefordert',
    completed: 'Abgeschlossen',
    refunded: 'Erstattet',
    loading: 'Laden...',
    error: 'Fehler beim Laden der Buchungen',
    viewDetails: 'Details anzeigen',
    cancelTrip: 'Reise stornieren',
    cancelConfirm: 'Möchten Sie wirklich eine Stornierungsanfrage senden? Die Firma muss die Stornierung noch genehmigen.',
    cancelling: 'Wird gesendet...',
    cancelSuccess: 'Stornierungsanfrage wurde gesendet. Sie werden benachrichtigt, sobald die Firma diese bearbeitet.',
    cancelError: 'Fehler beim Senden der Anfrage',
  },
  en: {
    title: 'My Bookings',
    noBookings: 'No bookings found',
    noBookingsDesc: 'You haven\'t booked any trips yet',
    loginRequired: 'Please log in to view your bookings',
    login: 'Log In',
    bookingNumber: 'Booking Number',
    status: 'Status',
    trip: 'Trip',
    date: 'Date',
    seats: 'Seats',
    totalPrice: 'Total Price',
    company: 'Company',
    from: 'From',
    to: 'To',
    departure: 'Departure',
    arrival: 'Arrival',
    bookedOn: 'Booked on',
    // Status translations
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    cancellation_requested: 'Cancellation Requested',
    completed: 'Completed',
    refunded: 'Refunded',
    loading: 'Loading...',
    error: 'Error loading bookings',
    viewDetails: 'View Details',
    cancelTrip: 'Cancel Trip',
    cancelConfirm: 'Are you sure you want to send a cancellation request? The company must approve the cancellation.',
    cancelling: 'Sending...',
    cancelSuccess: 'Cancellation request sent. You will be notified once the company processes it.',
    cancelError: 'Error sending request',
  },
  ar: {
    title: 'حجوزاتي',
    noBookings: 'لا توجد حجوزات',
    noBookingsDesc: 'لم تقم بحجز أي رحلات بعد',
    loginRequired: 'يرجى تسجيل الدخول لعرض حجوزاتك',
    login: 'تسجيل الدخول',
    bookingNumber: 'رقم الحجز',
    status: 'الحالة',
    trip: 'الرحلة',
    date: 'التاريخ',
    seats: 'المقاعد',
    totalPrice: 'السعر الإجمالي',
    company: 'الشركة',
    from: 'من',
    to: 'إلى',
    departure: 'المغادرة',
    arrival: 'الوصول',
    bookedOn: 'تم الحجز في',
    // Status translations
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغى',
    cancellation_requested: 'انتظار الإلغاء',
    completed: 'مكتمل',
    refunded: 'مسترد',
    loading: 'جار التحميل...',
    error: 'خطأ في تحميل الحجوزات',
    viewDetails: 'عرض التفاصيل',
    cancelTrip: 'إلغاء الرحلة',
    cancelConfirm: 'هل أنت متأكد من إرسال طلب إلغاء؟ يجب أن توافق الشركة على الإلغاء.',
    cancelling: 'جار الإرسال...',
    cancelSuccess: 'تم إرسال طلب الإلغاء. سيتم إخطارك عندما تقوم الشركة بمعالجته.',
    cancelError: 'خطأ في إرسال الطلب',
  },
};

interface Booking {
  id: number;
  booking_status: string;
  seats_booked: number;
  total_price: number;
  currency: string;
  created_at: string;
  trip_id: number;
  departure_time: string;
  arrival_time: string;
  from_city: string;
  to_city: string;
  company_name: string;
  status_token?: string;
}

export function MyBookings({ language, isLoggedIn, user, onNavigateToLogin, onNavigateToBookingStatus }: MyBookingsProps) {
  const t = translations[language];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/api/bookings/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isLoggedIn]);

  const handleCancelBooking = async (bookingId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to booking status
    
    if (!window.confirm(t.cancelConfirm)) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send cancellation request');
      }

      // Don't update the status locally - it remains pending/confirmed
      // Just refresh the bookings list
      const data = await response.json();
      
      alert(t.cancelSuccess);
      
      // Optionally refresh bookings to show updated data
      const refreshResponse = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (refreshResponse.ok) {
        const refreshedBookings = await refreshResponse.json();
        setBookings(refreshedBookings);
      }
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      alert(t.cancelError + ': ' + (err.message || 'Unknown error'));
    } finally {
      setCancellingId(null);
    }
  };

  const canCancelBooking = (booking: Booking) => {
    // Can only cancel pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.booking_status.toLowerCase())) {
      return false;
    }
    
    // Check if trip is in the future
    const tripDate = new Date(booking.departure_time);
    const now = new Date();
    return tripDate > now;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.loginRequired}</h3>
          <button
            onClick={onNavigateToLogin}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t.login}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800">{t.error}</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[50px]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noBookings}</h3>
          <p className="text-gray-600">{t.noBookingsDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => {
                if (booking.status_token) {
                  onNavigateToBookingStatus(booking.status_token);
                }
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(booking.booking_status)}
                  <div>
                    <div className="text-sm text-gray-600">{t.bookingNumber}</div>
                    <div className="font-semibold text-gray-900">#{booking.id}</div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(booking.booking_status)}`} style={{ paddingTop: '50px' }}>
                  {t[booking.booking_status.toLowerCase() as keyof typeof t] || booking.booking_status}
                </div>

                {/* Trip Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{booking.from_city}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{booking.to_city}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">{t.company}</div>
                      <div className="text-gray-900">{booking.company_name}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">{t.departure}</div>
                      <div className="text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(booking.departure_time, language)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">{t.arrival}</div>
                      <div className="text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(booking.arrival_time, language)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">{t.seats}</div>
                      <div className="text-gray-900 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {booking.seats_booked}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Date */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(booking.total_price, language)}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    {t.bookedOn} {formatDate(booking.created_at)}
                  </div>
                  
                  {/* Cancel Button */}
                  {canCancelBooking(booking) && (
                    <button
                      onClick={(e) => handleCancelBooking(booking.id, e)}
                      disabled={cancellingId === booking.id}
                      className="w-full mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                      style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                    >
                      {cancellingId === booking.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#ffffff' }} />
                          <span>{t.cancelling}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" style={{ color: '#ffffff' }} />
                          <span>{t.cancelTrip}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
