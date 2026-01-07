import { useState } from 'react';
import { X, Users, DollarSign, CreditCard, AlertCircle, Check, Loader2 } from 'lucide-react';
import type { Language } from '../App';
import { bookingsApi } from '../lib/api';
import { formatCurrency } from '../lib/i18n-utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    from: string;
    to: string;
    company: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    currency: string;
    seatsAvailable: number;
    totalSeats: number;
  };
  language: Language;
}

const translations = {
  de: {
    bookTrip: 'Reise buchen',
    route: 'Strecke',
    company: 'Unternehmen',
    departure: 'Abfahrt',
    arrival: 'Ankunft',
    duration: 'Dauer',
    numberOfSeats: 'Anzahl der Plätze',
    seatsAvailable: 'verfügbare Plätze',
    pricePerSeat: 'Preis pro Platz',
    totalPrice: 'Gesamtpreis',
    fareCategory: 'Tarifkategorie',
    standard: 'Standard',
    student: 'Student',
    senior: 'Senior',
    child: 'Kind',
    bookingOption: 'Buchungsoption',
    default: 'Standard',
    flexiTicket: 'Flexibles Ticket',
    earlyBird: 'Frühbucher',
    confirmBooking: 'Buchung bestätigen',
    cancel: 'Abbrechen',
    bookingSuccess: 'Buchung erfolgreich!',
    bookingSuccessMessage: 'Ihre Buchung wurde erfolgreich erstellt. Sie erhalten eine Bestätigungs-E-Mail.',
    bookingError: 'Buchungsfehler',
    close: 'Schließen',
    processing: 'Wird bearbeitet...',
    selectSeats: 'Bitte wählen Sie die Anzahl der Plätze',
    notEnoughSeats: 'Nicht genügend verfügbare Plätze',
    loginRequired: 'Anmeldung erforderlich',
    pleaseLogin: 'Bitte melden Sie sich an, um eine Buchung vorzunehmen',
  },
  en: {
    bookTrip: 'Book Trip',
    route: 'Route',
    company: 'Company',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    numberOfSeats: 'Number of Seats',
    seatsAvailable: 'seats available',
    pricePerSeat: 'Price per Seat',
    totalPrice: 'Total Price',
    fareCategory: 'Fare Category',
    standard: 'Standard',
    student: 'Student',
    senior: 'Senior',
    child: 'Child',
    bookingOption: 'Booking Option',
    default: 'Default',
    flexiTicket: 'Flexible Ticket',
    earlyBird: 'Early Bird',
    confirmBooking: 'Confirm Booking',
    cancel: 'Cancel',
    bookingSuccess: 'Booking Successful!',
    bookingSuccessMessage: 'Your booking has been created successfully. You will receive a confirmation email.',
    bookingError: 'Booking Error',
    close: 'Close',
    processing: 'Processing...',
    selectSeats: 'Please select number of seats',
    notEnoughSeats: 'Not enough seats available',
    loginRequired: 'Login Required',
    pleaseLogin: 'Please login to make a booking',
  },
  ar: {
    bookTrip: 'حجز رحلة',
    route: 'المسار',
    company: 'الشركة',
    departure: 'المغادرة',
    arrival: 'الوصول',
    duration: 'المدة',
    numberOfSeats: 'عدد المقاعد',
    seatsAvailable: 'مقعد متاح',
    pricePerSeat: 'السعر للمقعد',
    totalPrice: 'السعر الإجمالي',
    fareCategory: 'فئة التعرفة',
    standard: 'قياسي',
    student: 'طالب',
    senior: 'كبار السن',
    child: 'طفل',
    bookingOption: 'خيار الحجز',
    default: 'افتراضي',
    flexiTicket: 'تذكرة مرنة',
    earlyBird: 'حجز مبكر',
    confirmBooking: 'تأكيد الحجز',
    cancel: 'إلغاء',
    bookingSuccess: 'تم الحجز بنجاح!',
    bookingSuccessMessage: 'تم إنشاء حجزك بنجاح. سوف تتلقى رسالة تأكيد بالبريد الإلكتروني.',
    bookingError: 'خطأ في الحجز',
    close: 'إغلاق',
    processing: 'جاري المعالجة...',
    selectSeats: 'الرجاء اختيار عدد المقاعد',
    notEnoughSeats: 'لا توجد مقاعد كافية متاحة',
    loginRequired: 'تسجيل الدخول مطلوب',
    pleaseLogin: 'الرجاء تسجيل الدخول لإجراء الحجز',
  },
};

export function BookingModal({ isOpen, onClose, trip, language }: BookingModalProps) {
  const t = translations[language];
  const [quantity, setQuantity] = useState(1);
  const [fareCategory, setFareCategory] = useState('STANDARD');
  const [bookingOption, setBookingOption] = useState('DEFAULT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= trip.seatsAvailable) {
      setQuantity(value);
      setError(null);
    } else if (value > trip.seatsAvailable) {
      setError(t.notEnoughSeats);
    }
  };

  const totalPrice = trip.price * quantity;

  const handleBooking = async () => {
    if (quantity < 1 || quantity > trip.seatsAvailable) {
      setError(t.notEnoughSeats);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await bookingsApi.createBooking({
        trip_id: parseInt(trip.id),
        quantity,
        fare_category_code: fareCategory,
        booking_option_code: bookingOption,
      });

      setBookingSuccess(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setBookingSuccess(false);
        onClose();
        // Optionally reload page or update seats
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setError(err.message || t.bookingError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setQuantity(1);
      setFareCategory('STANDARD');
      setBookingOption('DEFAULT');
      setError(null);
      setBookingSuccess(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t.bookTrip}</h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">{t.bookingSuccess}</h3>
              <p className="text-sm text-green-700">{t.bookingSuccessMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {!bookingSuccess && (
          <div className="p-6 space-y-6">
            {/* Trip Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">{t.route}</span>
                <span className="text-base text-gray-900 font-medium text-right">
                  {trip.from} → {trip.to}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">{t.company}</span>
                <span className="text-base text-gray-900">{trip.company}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">{t.departure}</span>
                <span className="text-base text-gray-900">{trip.departureTime}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">{t.arrival}</span>
                <span className="text-base text-gray-900">{trip.arrivalTime}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">{t.duration}</span>
                <span className="text-base text-gray-900">{trip.duration}</span>
              </div>
            </div>

            {/* Number of Seats */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.numberOfSeats}
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isProcessing}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={trip.seatsAvailable}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={isProcessing}
                  className="w-20 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg py-2 focus:outline-none focus:border-green-500 disabled:bg-gray-50"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= trip.seatsAvailable || isProcessing}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{trip.seatsAvailable} {t.seatsAvailable}</span>
                </div>
              </div>
            </div>

            {/* Fare Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.fareCategory}
              </label>
              <select
                value={fareCategory}
                onChange={(e) => setFareCategory(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-50"
              >
                <option value="STANDARD">{t.standard}</option>
                <option value="STUDENT">{t.student}</option>
                <option value="SENIOR">{t.senior}</option>
                <option value="CHILD">{t.child}</option>
              </select>
            </div>

            {/* Booking Option */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.bookingOption}
              </label>
              <select
                value={bookingOption}
                onChange={(e) => setBookingOption(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-50"
              >
                <option value="DEFAULT">{t.default}</option>
                <option value="FLEXI_TICKET">{t.flexiTicket}</option>
                <option value="EARLY_BIRD">{t.earlyBird}</option>
              </select>
            </div>

            {/* Price Summary */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{t.pricePerSeat}</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(trip.price, language)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{t.numberOfSeats}</span>
                <span className="text-gray-900 font-medium">× {quantity}</span>
              </div>
              <div className="pt-2 border-t-2 border-green-300 flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">{t.totalPrice}</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(totalPrice, language)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleBooking}
                disabled={isProcessing || quantity < 1 || quantity > trip.seatsAvailable}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t.confirmBooking}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
