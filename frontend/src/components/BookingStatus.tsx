import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, MapPin, Calendar, Users, CreditCard } from 'lucide-react';
import type { Language } from '../App';

interface BookingStatusProps {
  token: string;
  language: Language;
}

interface BookingStatusData {
  id: number;
  booking_status: string;
  seats_booked: number;
  total_price: number;
  currency: string;
  guest_name?: string;
  guest_email?: string;
  created_at: string;
  departure_time: string;
  arrival_time: string;
  from_city: string;
  from_city_de: string;
  from_city_ar: string;
  to_city: string;
  to_city_de: string;
  to_city_ar: string;
  company_name: string;
  company_phone: string;
  company_email: string;
  passengers: Array<{ name: string; seat_number: number }>;
}

const translations = {
  de: {
    title: 'Buchungsstatus',
    loading: 'Buchungsstatus wird geladen...',
    notFound: 'Buchung nicht gefunden',
    notFoundDesc: 'Diese Buchung existiert nicht oder der Link ist ungültig.',
    bookingId: 'Buchungs-ID',
    status: 'Status',
    confirmed: 'Bestätigt',
    pending: 'Ausstehend',
    cancelled: 'Storniert',
    completed: 'Abgeschlossen',
    pendingDesc: 'Ihre Buchung wartet auf die Bestätigung durch das Transportunternehmen.',
    confirmedDesc: 'Ihre Buchung wurde bestätigt! Bitte seien Sie 15 Minuten vor Abfahrt am Abfahrtsort.',
    cancelledDesc: 'Diese Buchung wurde storniert.',
    tripDetails: 'Reisedetails',
    from: 'Von',
    to: 'Nach',
    departure: 'Abfahrt',
    arrival: 'Ankunft',
    company: 'Unternehmen',
    companyContact: 'Kontakt',
    passengers: 'Passagiere',
    seats: 'Plätze',
    totalPrice: 'Gesamtpreis',
    bookedOn: 'Gebucht am',
    mainPassenger: 'Hauptpassagier',
  },
  en: {
    title: 'Booking Status',
    loading: 'Loading booking status...',
    notFound: 'Booking not found',
    notFoundDesc: 'This booking does not exist or the link is invalid.',
    bookingId: 'Booking ID',
    status: 'Status',
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',
    pendingDesc: 'Your booking is waiting for confirmation from the transport company.',
    confirmedDesc: 'Your booking has been confirmed! Please be at the departure location 15 minutes before departure.',
    cancelledDesc: 'This booking has been cancelled.',
    tripDetails: 'Trip Details',
    from: 'From',
    to: 'To',
    departure: 'Departure',
    arrival: 'Arrival',
    company: 'Company',
    companyContact: 'Contact',
    passengers: 'Passengers',
    seats: 'Seats',
    totalPrice: 'Total Price',
    bookedOn: 'Booked on',
    mainPassenger: 'Main Passenger',
  },
  ar: {
    title: 'حالة الحجز',
    loading: 'جاري تحميل حالة الحجز...',
    notFound: 'الحجز غير موجود',
    notFoundDesc: 'هذا الحجز غير موجود أو الرابط غير صالح.',
    bookingId: 'رقم الحجز',
    status: 'الحالة',
    confirmed: 'مؤكد',
    pending: 'قيد الانتظار',
    cancelled: 'ملغى',
    completed: 'مكتمل',
    pendingDesc: 'حجزك في انتظار تأكيد شركة النقل.',
    confirmedDesc: 'تم تأكيد حجزك! يرجى التواجد في موقع المغادرة قبل 15 دقيقة من الموعد.',
    cancelledDesc: 'تم إلغاء هذا الحجز.',
    tripDetails: 'تفاصيل الرحلة',
    from: 'من',
    to: 'إلى',
    departure: 'المغادرة',
    arrival: 'الوصول',
    company: 'الشركة',
    companyContact: 'التواصل',
    passengers: 'الركاب',
    seats: 'المقاعد',
    totalPrice: 'السعر الإجمالي',
    bookedOn: 'تاريخ الحجز',
    mainPassenger: 'الراكب الرئيسي',
  },
};

export function BookingStatus({ token, language = 'en' }: BookingStatusProps) {
  const [booking, setBooking] = useState<BookingStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const fetchBookingStatus = async () => {
      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const response = await fetch(`${API_BASE}/api/booking-status/${token}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        console.error('Failed to fetch booking status:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStatus();
  }, [token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'pending':
        return <Clock className="w-12 h-12 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return <Clock className="w-12 h-12 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t.confirmed;
      case 'pending':
        return t.pending;
      case 'cancelled':
        return t.cancelled;
      case 'completed':
        return t.completed;
      default:
        return status;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return t.confirmedDesc;
      case 'pending':
        return t.pendingDesc;
      case 'cancelled':
        return t.cancelledDesc;
      default:
        return '';
    }
  };

  const getCityName = (city: any) => {
    if (language === 'de') return city.from_city_de || city.from_city;
    if (language === 'ar') return city.from_city_ar || city.from_city;
    return city.from_city;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.notFound}</h1>
          <p className="text-gray-600">{t.notFoundDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            {getStatusIcon(booking.booking_status)}
            <h1 className="text-3xl font-bold text-gray-900 mt-4">{t.title}</h1>
            <p className="text-gray-600 mt-2">
              {t.bookingId}: <span className="font-mono font-semibold">#{booking.id}</span>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">{t.status}</div>
            <div className={`text-2xl font-bold ${
              booking.booking_status === 'confirmed' || booking.booking_status === 'completed'
                ? 'text-green-700'
                : booking.booking_status === 'pending'
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {getStatusText(booking.booking_status)}
            </div>
            <p className="text-sm text-gray-600 mt-3">{getStatusDescription(booking.booking_status)}</p>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.tripDetails}</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="text-sm text-gray-600">{t.from}</div>
                <div className="font-semibold text-gray-900">
                  {language === 'de' ? booking.from_city_de : language === 'ar' ? booking.from_city_ar : booking.from_city}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-red-600 mt-1" />
              <div className="flex-1">
                <div className="text-sm text-gray-600">{t.to}</div>
                <div className="font-semibold text-gray-900">
                  {language === 'de' ? booking.to_city_de : language === 'ar' ? booking.to_city_ar : booking.to_city}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">{t.departure}</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(booking.departure_time).toLocaleString(language === 'de' ? 'de-DE' : language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t.arrival}</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(booking.arrival_time).toLocaleString(language === 'de' ? 'de-DE' : language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">{t.company}</div>
              <div className="font-semibold text-gray-900">{booking.company_name}</div>
              <div className="text-sm text-gray-600 mt-2">{t.companyContact}: {booking.company_phone}</div>
            </div>
          </div>
        </div>

        {/* Passengers */}
        {booking.passengers && booking.passengers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              {t.passengers}
            </h2>
            <div className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                      {passenger.seat_number}
                    </div>
                    <span className="font-medium text-gray-900">{passenger.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            {t.totalPrice}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>{t.seats}:</span>
              <span className="font-medium">{booking.seats_booked}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
              <span>{t.totalPrice}:</span>
              <span className="text-green-700">{booking.total_price} {booking.currency}</span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              {t.bookedOn}: {new Date(booking.created_at).toLocaleDateString(language === 'de' ? 'de-DE' : language === 'ar' ? 'ar-SA' : 'en-US')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
