import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Wifi, Wind, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { Language } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatTime, formatCurrency, formatDuration } from '../lib/i18n-utils';
import { tripsApi, bookingsApi } from '../lib/api';

interface RoundTripBookingProps {
  outboundTripId: string;
  returnTripId: string;
  language: Language;
  isLoggedIn: boolean;
  onNavigateToLogin: () => void;
  onBookingComplete: (tokens: { outbound: string; return: string }) => void;
}

const translations = {
  de: {
    title: 'Hin- und Rückfahrt buchen',
    outboundTrip: 'Hinreise',
    returnTrip: 'Rückreise',
    departure: 'Abfahrt',
    arrival: 'Ankunft',
    duration: 'Dauer',
    price: 'Preis',
    company: 'Gesellschaft',
    seats: 'Plätze verfügbar',
    totalPrice: 'Gesamtpreis',
    bookBothTrips: 'Beide Fahrten buchen',
    numberOfSeats: 'Anzahl der Plätze',
    bookingDetails: 'Buchungsdetails',
    loginRequired: 'Bitte melden Sie sich an, um zu buchen',
    login: 'Anmelden',
    bookingSuccess: 'Buchung erfolgreich!',
    bookingError: 'Buchungsfehler',
    loading: 'Laden...',
    tripUnavailable: 'Eine oder beide Fahrten sind nicht mehr verfügbar',
  },
  en: {
    title: 'Book Round Trip',
    outboundTrip: 'Outbound Journey',
    returnTrip: 'Return Journey',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    price: 'Price',
    company: 'Company',
    seats: 'Seats available',
    totalPrice: 'Total Price',
    bookBothTrips: 'Book Both Trips',
    numberOfSeats: 'Number of Seats',
    bookingDetails: 'Booking Details',
    loginRequired: 'Please log in to book',
    login: 'Log In',
    bookingSuccess: 'Booking successful!',
    bookingError: 'Booking error',
    loading: 'Loading...',
    tripUnavailable: 'One or both trips are no longer available',
  },
  ar: {
    title: 'حجز رحلة ذهاب وعودة',
    outboundTrip: 'رحلة الذهاب',
    returnTrip: 'رحلة العودة',
    departure: 'المغادرة',
    arrival: 'الوصول',
    duration: 'المدة',
    price: 'السعر',
    company: 'الشركة',
    seats: 'المقاعد المتاحة',
    totalPrice: 'السعر الإجمالي',
    bookBothTrips: 'احجز كلا الرحلتين',
    numberOfSeats: 'عدد المقاعد',
    bookingDetails: 'تفاصيل الحجز',
    loginRequired: 'يرجى تسجيل الدخول للحجز',
    login: 'تسجيل الدخول',
    bookingSuccess: 'تم الحجز بنجاح!',
    bookingError: 'خطأ في الحجز',
    loading: 'جار التحميل...',
    tripUnavailable: 'إحدى الرحلتين أو كلتاهما غير متاحة',
  },
};

export function RoundTripBooking({
  outboundTripId,
  returnTripId,
  language,
  isLoggedIn,
  onNavigateToLogin,
  onBookingComplete,
}: RoundTripBookingProps) {
  const t = translations[language];
  const [outboundTrip, setOutboundTrip] = useState<any>(null);
  const [returnTrip, setReturnTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const [outbound, returnT] = await Promise.all([
          tripsApi.getById(outboundTripId),
          tripsApi.getById(returnTripId),
        ]);

        setOutboundTrip({
          id: outbound.id,
          from: outbound.from_city,
          to: outbound.to_city,
          departureTime: formatTime(outbound.departure_time, language),
          arrivalTime: formatTime(outbound.arrival_time, language),
          duration: formatDuration(outbound.duration_minutes, language),
          price: outbound.price || 0,
          currency: outbound.currency || 'SYP',
          company: outbound.company_name || 'Unknown',
          seatsAvailable: outbound.seats_available,
          available: outbound.status === 'scheduled' && outbound.seats_available > 0,
          amenities: outbound.equipment ? outbound.equipment.split(',') : [],
        });

        setReturnTrip({
          id: returnT.id,
          from: returnT.from_city,
          to: returnT.to_city,
          departureTime: formatTime(returnT.departure_time, language),
          arrivalTime: formatTime(returnT.arrival_time, language),
          duration: formatDuration(returnT.duration_minutes, language),
          price: returnT.price || 0,
          currency: returnT.currency || 'SYP',
          company: returnT.company_name || 'Unknown',
          seatsAvailable: returnT.seats_available,
          available: returnT.status === 'scheduled' && returnT.seats_available > 0,
          amenities: returnT.equipment ? returnT.equipment.split(',') : [],
        });
      } catch (err: any) {
        console.error('Error fetching trips:', err);
        setError(err.message || 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [outboundTripId, returnTripId, language]);

  const handleBooking = async () => {
    if (!isLoggedIn) {
      onNavigateToLogin();
      return;
    }

    try {
      setBooking(true);
      
      // Book both trips
      const [outboundBooking, returnBooking] = await Promise.all([
        bookingsApi.createBooking({
          trip_id: parseInt(outboundTripId),
          quantity: seats,
        }),
        bookingsApi.createBooking({
          trip_id: parseInt(returnTripId),
          quantity: seats,
        }),
      ]);

      onBookingComplete({
        outbound: outboundBooking.booking_token || String(outboundBooking.id),
        return: returnBooking.booking_token || String(returnBooking.id),
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      alert(t.bookingError + ': ' + (err.message || 'Unknown error'));
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error || !outboundTrip || !returnTrip) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-900 mb-2">{error || t.tripUnavailable}</h3>
        </div>
      </div>
    );
  }

  const totalPrice = (outboundTrip.price + returnTrip.price) * seats;
  const maxSeats = Math.min(outboundTrip.seatsAvailable, returnTrip.seatsAvailable);

  const renderTripCard = (trip: any, type: 'outbound' | 'return') => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {type === 'outbound' ? t.outboundTrip : t.returnTrip}
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{trip.departureTime}</div>
          <div className="text-sm text-gray-600">{trip.from}</div>
        </div>
        
        <div className="flex-1 flex flex-col items-center px-4">
          <div className="flex items-center w-full">
            <div className="h-0.5 flex-1 bg-gray-300" />
            <Clock className="w-4 h-4 text-gray-400 mx-2" />
            <div className="h-0.5 flex-1 bg-gray-300" />
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">{trip.duration}</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{trip.arrivalTime}</div>
          <div className="text-sm text-gray-600">{trip.to}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
        <div>
          <div className="text-sm text-gray-600">{t.company}</div>
          <div className="text-gray-900">{trip.company}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">{t.price}</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(trip.price, language)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">{t.seats}</div>
          <div className="text-gray-900 flex items-center gap-1">
            <Users className="w-4 h-4" />
            {trip.seatsAvailable}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Amenities</div>
          <div className="flex gap-2">
            {trip.amenities.includes('wifi') && <Wifi className="w-4 h-4 text-blue-600" />}
            {trip.amenities.includes('ac') && <Wind className="w-4 h-4 text-cyan-600" />}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {renderTripCard(outboundTrip, 'outbound')}
          
          <div className="flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-gray-400 rotate-90 lg:rotate-0" />
          </div>
          
          {renderTripCard(returnTrip, 'return')}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.bookingDetails}</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">{t.numberOfSeats}</label>
                <input
                  type="number"
                  min="1"
                  max={maxSeats}
                  value={seats}
                  onChange={(e) => setSeats(Math.min(maxSeats, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{t.outboundTrip}</span>
                <span className="text-gray-900">{formatCurrency(outboundTrip.price * seats, language)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">{t.returnTrip}</span>
                <span className="text-gray-900">{formatCurrency(returnTrip.price * seats, language)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>{t.totalPrice}</span>
                <span className="text-green-600">{formatCurrency(totalPrice, language)}</span>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                onClick={handleBooking}
                disabled={booking || !outboundTrip.available || !returnTrip.available}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  t.bookBothTrips
                )}
              </button>
            ) : (
              <div>
                <p className="text-sm text-gray-600 text-center mb-3">{t.loginRequired}</p>
                <button
                  onClick={onNavigateToLogin}
                  className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t.login}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
