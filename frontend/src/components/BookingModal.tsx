import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, DollarSign, CreditCard, AlertCircle, Check, Loader2, Clock } from 'lucide-react';
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
  isLoggedIn?: boolean;
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
    guestBooking: 'Als Gast buchen',
    guestInfo: 'Ihre Kontaktdaten',
    guestName: 'Vollständiger Name',
    guestEmail: 'E-Mail-Adresse',
    guestPhone: 'Telefonnummer',
    orLogin: 'Oder melden Sie sich an',
    loginNow: 'Jetzt anmelden',
    bookingPending: 'Buchung ausstehend!',
    bookingPendingMessage: 'Ihre Buchungsanfrage wurde gesendet und wartet auf die Bestätigung durch das Unternehmen. Sie erhalten eine E-Mail, sobald die Buchung bestätigt wurde.',
    requiredField: 'Dieses Feld ist erforderlich',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    passengerNames: 'Namen der Passagiere',
    passengerName: 'Passagier',
    mainPassenger: 'Hauptpassagier (Sie)',
    thankYou: 'Vielen Dank für Ihre Buchung!',
    thankYouMessage: 'Ihre Buchung wurde erfolgreich erstellt. Sie können den Status Ihrer Buchung jederzeit über den unten stehenden Link überprüfen.',
    viewStatus: 'Weiter',
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
    guestBooking: 'Book as Guest',
    guestInfo: 'Your Contact Information',
    guestName: 'Full Name',
    guestEmail: 'Email Address',
    guestPhone: 'Phone Number',
    orLogin: 'Or login',
    loginNow: 'Login Now',
    bookingPending: 'Booking Pending!',
    bookingPendingMessage: 'Your booking request has been sent and is waiting for company confirmation. You will receive an email once the booking is confirmed.',
    requiredField: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    thankYou: 'Thank you for your booking!',
    thankYouMessage: 'Your booking has been created successfully. You can check your booking status anytime using the link below.',
    viewStatus: 'Continue',
    passengerNames: 'Passenger Names',
    passengerName: 'Passenger',
    mainPassenger: 'Main Passenger (You)',
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
    guestBooking: 'الحجز كضيف',
    guestInfo: 'معلومات الاتصال الخاصة بك',
    guestName: 'الاسم الكامل',
    guestEmail: 'عنوان البريد الإلكتروني',
    guestPhone: 'رقم الهاتف',
    orLogin: 'أو تسجيل الدخول',
    loginNow: 'تسجيل الدخول الآن',
    bookingPending: 'الحجز قيد الانتظار!',
    bookingPendingMessage: 'تم إرسال طلب الحجز الخاص بك وهو بانتظار تأكيد الشركة. سوف تتلقى بريدًا إلكترونيًا بمجرد تأكيد الحجز.',
    requiredField: 'هذا الحقل مطلوب',
    invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح',
    passengerNames: 'أسماء الركاب',
    passengerName: 'راكب',
    mainPassenger: 'الراكب الرئيسي (أنت)',
    thankYou: 'شكراً لحجزك معنا!',
    thankYouMessage: 'تم إنشاء حجزك بنجاح. يمكنك التحقق من حالة حجزك في أي وقت باستخدام الرابط أدناه.',
    viewStatus: 'متابعة',
  },
};

export function BookingModal({ isOpen, onClose, trip, language, isLoggedIn = false }: BookingModalProps) {
  const t = translations[language];
  const [quantity, setQuantity] = useState(1);
  const [fareCategory, setFareCategory] = useState('STANDARD');
  const [bookingOption, setBookingOption] = useState('DEFAULT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  
  // Guest booking fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  
  // Passenger names (for multiple seats)
  const [passengerNames, setPassengerNames] = useState<string[]>([]);
  
  // Status link from booking response
  const [statusLink, setStatusLink] = useState<string | null>(null);

  // 10-minute timeout countdown
  useEffect(() => {
    if (!isOpen || bookingSuccess) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, bookingSuccess, onClose]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeRemaining(600);
      setQuantity(1);
      setFareCategory('STANDARD');
      setBookingOption('DEFAULT');
      setError(null);
      setBookingSuccess(false);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setPassengerNames([]);
      setStatusLink(null);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= trip.seatsAvailable) {
      setQuantity(value);
      setError(null);
      // Initialize passenger names array
      setPassengerNames(new Array(value).fill(''));
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

    // Validate passenger names if quantity > 1
    if (quantity > 1) {
      for (let i = 0; i < quantity; i++) {
        if (!passengerNames[i]?.trim()) {
          setError(`${t.requiredField}: ${t.passengerName} ${i + 1}`);
          return;
        }
      }
    }

    // Validate guest fields if not logged in
    if (!isLoggedIn) {
      if (!guestName.trim()) {
        setError(t.requiredField + ': ' + t.guestName);
        return;
      }
      if (!guestEmail.trim()) {
        setError(t.requiredField + ': ' + t.guestEmail);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        setError(t.invalidEmail);
        return;
      }
      if (!guestPhone.trim()) {
        setError(t.requiredField + ': ' + t.guestPhone);
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      let captchaToken: string | null = null;

      // Get reCAPTCHA token for guest bookings
      if (!isLoggedIn && typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          captchaToken = await (window as any).grecaptcha.execute('6LfVxKMqAAAAADMq7vJq3o8xZ0U3K6MdP7wQGJ5R', {
            action: 'guest_booking'
          });
        } catch (captchaError) {
          console.error('reCAPTCHA error:', captchaError);
          setError('Captcha verification failed. Please reload the page and try again.');
          setIsProcessing(false);
          return;
        }
      }

      const bookingData: any = {
        trip_id: parseInt(trip.id),
        quantity,
        fare_category_code: fareCategory,
        booking_option_code: bookingOption,
        passenger_names: quantity > 1 ? passengerNames : [guestName || 'Main Passenger'],
      };

      // Add guest info if not logged in
      if (!isLoggedIn) {
        bookingData.guest_name = guestName;
        bookingData.guest_email = guestEmail;
        bookingData.guest_phone = guestPhone;
        
        // Add captcha token for guest bookings
        if (captchaToken) {
          bookingData.captcha_token = captchaToken;
        }
      }

      const response = await bookingsApi.createBooking(bookingData);

      // Save status link from response
      if (response.status_link) {
        setStatusLink(response.status_link);
      }

      setBookingSuccess(true);
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
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setPassengerNames([]);
      setStatusLink(null);
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      style={{ 
        direction: language === 'ar' ? 'rtl' : 'ltr',
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full"
        style={{
          maxWidth: '48rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 rounded-t-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{t.bookTrip}</h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {!bookingSuccess && (
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <Clock className="w-4 h-4" />
              <span>
                {language === 'de' ? 'Verbleibende Zeit' : language === 'en' ? 'Time remaining' : 'الوقت المتبقي'}: {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">{t.thankYou}</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {t.thankYouMessage}
                </p>
              </div>

              {statusLink && (
                <button
                  onClick={() => window.location.href = statusLink}
                  className="w-full max-w-xs mx-auto block px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {t.viewStatus}
                </button>
              )}

              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                {t.close}
              </button>
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

            {/* Passenger Names (if quantity > 1) */}
            {quantity > 1 && (
              <div className="space-y-4 border-t-2 border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.passengerNames}</h3>
                {Array.from({ length: quantity }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {index === 0 ? t.mainPassenger : `${t.passengerName} ${index + 1}`} *
                    </label>
                    <input
                      type="text"
                      value={passengerNames[index] || ''}
                      onChange={(e) => {
                        const newNames = [...passengerNames];
                        newNames[index] = e.target.value;
                        setPassengerNames(newNames);
                      }}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-50"
                      placeholder={language === 'de' ? 'Max Mustermann' : language === 'en' ? 'John Doe' : 'محمد أحمد'}
                    />
                  </div>
                ))}
              </div>
            )}

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

            {/* Guest Information Form */}
            {!isLoggedIn && (
              <div className="space-y-4 border-t-2 border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.guestInfo}</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t.guestName} *
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-50"
                    placeholder={language === 'de' ? 'Max Mustermann' : language === 'en' ? 'John Doe' : 'محمد أحمد'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t.guestEmail} *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-50"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t.guestPhone} *
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-50"
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-sm text-gray-500">{t.orLogin}</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/#login';
                  }}
                  className="w-full px-4 py-2 text-sm text-green-700 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  {t.loginNow}
                </button>
              </div>
            )}

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

  const modalRoot = document.getElementById('modal-root');
  return createPortal(modalContent, modalRoot || document.body);
}
