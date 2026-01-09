import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Building2, Clock, Star, ShieldCheck, Bus, ArrowLeftRight, Mail, Phone, Facebook, Instagram } from 'lucide-react';
import type { Language, SearchParams } from '../App';
import logo from 'figma:asset/4dddb73877b28322b7848adc27f0f948198765ae.png';
import { CitySelector } from './CitySelector';

interface HomePageProps {
  onSearch: (params: SearchParams) => void;
  language: Language;
  onContactClick?: () => void;
  searchParams?: SearchParams | null;
}

const translations = {
  de: {
    mainTitle: 'Finde deine Reise',
    subtitle: 'Suche die aktuellen Fahrpläne zwischen syrischen Städten',
    slogan: 'Deine beste Wahl',
    from: 'Startort',
    to: 'Zielort',
    date: 'Datum',
    returnDate: 'Rückfahrt Datum',
    roundTrip: 'Hin- und Rückfahrt',
    search: 'Suche starten',
    fromPlaceholder: 'Wähle Startstadt',
    toPlaceholder: 'Wähle Zielstadt',
    transportType: 'Transportart (optional)',
    popularRoutes: 'Beliebte Routen',
    whyHopHop: 'Warum HopHop ist deine beste Wahl',
    typeAll: 'Alle',
    typeBus: 'Bus',
    typeVan: 'Van',
    typeVipVan: 'VIP Van',
    typeShip: 'Schiff',
    typeTrain: 'Zug',
    // Feature cards
    featureAllCompanies: 'Alle Unternehmen',
    featureAllCompaniesText: 'Vergleiche Angebote von allen Transportunternehmen',
    featureSchedules: 'Präzise Fahrpläne',
    featureSchedulesText: 'Aktuelle und zuverlässige Abfahrts- und Ankunftszeiten',
    featureRating: 'Transportgesellschaft bewerten',
    featureRatingText: 'Teile deine Erfahrungen und hilf anderen Reisenden',
    featureBooking: 'Sicher buchen',
    featureBookingText: 'Sichere Zahlungsmethoden und bestätigte Reservierungen',
    // Validation messages
    searchValidationError: 'Bitte füllen Sie alle erforderlichen Felder aus (Von, Nach, Datum)',
    emptyFieldsError: 'Bitte geben Sie einen Abfahrts- und einen Ankunftsort ein',
    // Footer
    footerAbout: 'Über uns',
    footerContact: 'Kontakt',
    footerLinks: 'Links',
    footerFollowUs: 'Folgen Sie uns',
    footerCopyright: '© 2024 HopHop. Alle Rechte vorbehalten.',
    footerAboutText: 'Ihre zuverlässige Plattform für Busfahrpläne zwischen syrischen Städten.',
    footerContactText: 'Kontaktieren Sie uns für Unterstützung und Fragen.',
    footerSocialText: 'Folgen Sie uns auf sozialen Medien',
    footerPrivacy: 'Datenschutz',
    footerTerms: 'Nutzungsbedingungen',
    footerQuickLinks: 'Schnelllinks',
    footerHome: 'Startseite',
    footerAllCompanies: 'Alle Unternehmen',
    footerSchedules: 'Fahrpläne',
    footerRateCompanies: 'Unternehmen bewerten',
    footerSupport: 'Support',
    footerSupportText: 'Kontaktieren Sie uns für Fragen und Unterstützung.',
    footerLegal: 'Rechtliches',
  },
  en: {
    mainTitle: 'Find Your Journey',
    subtitle: 'Search current schedules between Syrian cities',
    slogan: 'Your best choice',
    from: 'From',
    to: 'To',
    date: 'Date',
    returnDate: 'Return Date',
    roundTrip: 'Round Trip',
    search: 'Start Search',
    fromPlaceholder: 'Select departure city',
    toPlaceholder: 'Select destination city',
    transportType: 'Transport Type (optional)',
    popularRoutes: 'Popular Routes',
    whyHopHop: 'Why HopHop is your best choice',
    typeAll: 'All',
    typeBus: 'Bus',
    typeVan: 'Van',
    typeVipVan: 'VIP Van',
    typeShip: 'Ship',
    typeTrain: 'Train',
    // Feature cards
    featureAllCompanies: 'All Companies',
    featureAllCompaniesText: 'Compare offers from all transport companies',
    featureSchedules: 'Accurate Schedules',
    featureSchedulesText: 'Current and reliable departure and arrival times',
    featureRating: 'Rate Transport Company',
    featureRatingText: 'Share your experience and help other travelers',
    featureBooking: 'Secure Booking',
    featureBookingText: 'Secure payment methods and confirmed reservations',
    // Validation messages
    searchValidationError: 'Please fill in all required fields (From, To, Date)',
    emptyFieldsError: 'Please enter both departure and arrival locations',
    // Footer
    footerAbout: 'About Us',
    footerContact: 'Contact',
    footerLinks: 'Links',
    footerFollowUs: 'Follow Us',
    footerCopyright: '© 2024 HopHop. All rights reserved.',
    footerAboutText: 'Your reliable platform for bus schedules between Syrian cities.',
    footerContactText: 'Contact us for support and inquiries.',
    footerSocialText: 'Follow us on social media',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerQuickLinks: 'Quick Links',
    footerHome: 'Home',
    footerAllCompanies: 'All Companies',
    footerSchedules: 'Schedules',
    footerRateCompanies: 'Rate Companies',
    footerSupport: 'Support',
    footerSupportText: 'Contact us for questions and support.',
    footerLegal: 'Legal',
  },
  ar: {
    mainTitle: 'ابحث عن رحلتك',
    subtitle: 'ابحث في الجداول الحالية بين المدن السورية',
    slogan: 'خيارك الأفضل',
    from: 'من',
    to: 'إلى',
    date: 'التاريخ',
    returnDate: 'تاريخ العودة',
    roundTrip: 'ذهاب وعودة',
    search: 'ابدأ البحث',
    fromPlaceholder: 'اختر مدينة المغادرة',
    toPlaceholder: 'اختر مدينة الوصول',
    transportType: 'نوع النقل (اختياري)',
    popularRoutes: 'الطرق الشائعة',
    whyHopHop: 'لماذا هوب هوب خيارك الأفضل',
    typeAll: 'الكل',
    typeBus: 'باص',
    typeVan: 'فان',
    typeVipVan: 'فان VIP',
    typeShip: 'سفينة',
    typeTrain: 'قطار',
    // Feature cards
    featureAllCompanies: 'جميع الشركات',
    featureAllCompaniesText: 'قارن العروض من جميع شركات النقل',
    featureSchedules: 'جداول دقيقة',
    featureSchedulesText: 'أوقات مغادرة ووصول حالية وموثوقة',
    featureRating: 'تقييم شركة النقل',
    featureRatingText: 'شارك تجربتك وساعد المسافرين الآخرين',
    featureBooking: 'حجز آمن',
    featureBookingText: 'طرق دفع آمنة وحجوزات مؤكدة',
    // Validation messages
    searchValidationError: 'يرجى تعبئة جميع الحقول المطلوبة (من، إلى، التاريخ)',
    emptyFieldsError: 'يرجى إدخال مكان المغادرة ومكان الوصول',
    // Footer
    footerAbout: 'من نحن',
    footerContact: 'تواصل معنا',
    footerLinks: 'روابط',
    footerFollowUs: 'تابعنا',
    footerCopyright: '© 2024 هوب هوب. جميع الحقوق محفوظة.',
    footerAboutText: 'منصتك الموثوقة لجدول مواعيد الرحلات بين المدن السورية.',
    footerContactText: 'اتصل بنا للحصول على الدعم والاستفسارات.',
    footerSocialText: 'تابعنا على وسائل التواصل الاجتماعي',
    footerPrivacy: 'سياسة الخصوصية',
    footerTerms: 'شروط الاستخدام',
    footerQuickLinks: 'روابط سريعة',
    footerHome: 'الصفحة الرئيسية',
    footerAllCompanies: 'جميع الشركات',
    footerSchedules: 'الجداول',
    footerRateCompanies: 'تقييم الشركات',
    footerSupport: 'الدعم',
    footerSupportText: 'يمكنك التواصل معنا للاستفسارات والدعم.',
    footerLegal: 'معلومات قانونية',
  },
};

const popularRoutes = [
  { from: 'دمشق', to: 'حلب', duration: '4h 30m' },
  { from: 'دمشق', to: 'اللاذقية', duration: '3h 45m' },
  { from: 'حلب', to: 'حمص', duration: '2h 15m' },
  { from: 'دمشق', to: 'حمص', duration: '2h 30m' },
];

export function HomePage({ onSearch, language, onContactClick, searchParams }: HomePageProps) {
  const t = translations[language];
  const [from, setFrom] = useState(searchParams?.from || '');
  const [to, setTo] = useState(searchParams?.to || '');
  const [date, setDate] = useState(searchParams?.date || new Date().toISOString().split('T')[0]);
  const [busType, setBusType] = useState(searchParams?.type || '');
  const [isRoundTrip, setIsRoundTrip] = useState(searchParams?.isRoundTrip || false);
  const [returnDate, setReturnDate] = useState(searchParams?.returnDate || '');
  const [searchError, setSearchError] = useState('');
  
  // Update fields when searchParams change
  useEffect(() => {
    if (searchParams) {
      setFrom(searchParams.from || '');
      setTo(searchParams.to || '');
      setDate(searchParams.date || new Date().toISOString().split('T')[0]);
      setBusType(searchParams.type || '');
      setIsRoundTrip(searchParams.isRoundTrip || false);
      setReturnDate(searchParams.returnDate || '');
    }
  }, [searchParams]);

  const handleSwapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    
    // Check if both from and to are empty
    if ((!from || from.trim() === '') && (!to || to.trim() === '')) {
      setSearchError(t.emptyFieldsError);
      return;
    }
    
    if (!from || !to || !date) {
      setSearchError(t.searchValidationError);
      return;
    }
    
    // Check if return date is provided when round trip is enabled
    if (isRoundTrip && !returnDate) {
      setSearchError(t.searchValidationError);
      return;
    }
    
    onSearch({ 
      from, 
      to, 
      date, 
      time: '08:00', 
      type: busType,
      isRoundTrip,
      returnDate: isRoundTrip ? returnDate : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Green Gradient */}
      <div className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 pt-16 pb-32 overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }} />
        </div>

        {/* Decorative Blobs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        {/* Content Container */}
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Logo Card */}
          <div className="inline-block mb-2">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <img src={logo} alt="Logo" className="h-32 w-auto" />
            </div>
          </div>

          {/* Slogan */}
          <p className="text-white/95 text-2xl mb-4 tracking-wide">{t.slogan}</p>

          {/* Main Title */}
          <h1 className="text-white text-5xl md:text-6xl mb-4 drop-shadow-lg">
            {t.mainTitle}
          </h1>
        </div>
      </div>

      {/* Search Box - Floating Effect */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8" noValidate>
          <div className="space-y-6 mb-6">
            {/* From and To with Swap Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From with Swap Button */}
              <div className="relative flex items-end gap-2">
                <div className="flex-1">
                  <CitySelector
                    value={from}
                    onChange={setFrom}
                    placeholder={t.fromPlaceholder}
                    label={t.from}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="w-10 h-10 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 mb-2"
                  title="تبديل بين من وإلى"
                  aria-label="Swap cities"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>
              </div>

              {/* To */}
              <div className="relative">
                <CitySelector
                  value={to}
                  onChange={setTo}
                  placeholder={t.toPlaceholder}
                  label={t.to}
                  required
                />
              </div>
            </div>

            {/* Date and Round Trip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Departure Date */}
              <div>
                <label className="block text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>{t.date}</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              {/* Return Date (only show when round trip is enabled) */}
              <div>
                <label className="block text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>{t.returnDate}</span>
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={date || new Date().toISOString().split('T')[0]}
                  disabled={!isRoundTrip}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                    isRoundTrip ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Round Trip Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsRoundTrip(!isRoundTrip);
                  if (isRoundTrip) {
                    setReturnDate('');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isRoundTrip
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5" />
                <span>{t.roundTrip}</span>
              </button>
            </div>
          </div>

          {/* Transport Type Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-3 flex items-center gap-2">
              <Bus className="w-5 h-5 text-green-600" />
              <span>{t.transportType}</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {['', 'bus', 'van', 'vip-van', 'ship', 'train'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBusType(type)}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    busType === type
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === '' ? t.typeAll : 
                   type === 'bus' ? t.typeBus : 
                   type === 'van' ? t.typeVan : 
                   type === 'vip-van' ? t.typeVipVan : 
                   type === 'ship' ? t.typeShip : 
                   t.typeTrain}
                </button>
              ))}
            </div>
          </div>

          {/* Search Error Message */}
          {searchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{searchError}</p>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Search className="w-5 h-5" />
            <span className="text-lg">{t.search}</span>
          </button>
        </form>
      </div>

      {/* Popular Routes Section */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <h2 className="text-3xl text-gray-900 mb-8 text-center">{t.popularRoutes}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => {
                setFrom(route.from);
                setTo(route.to);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Trigger search automatically
                onSearch({ 
                  from: route.from, 
                  to: route.to, 
                  date: date, 
                  time: '08:00', 
                  type: busType 
                });
              }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 text-left hover:border-green-500"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">{route.from}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">{route.to}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{route.duration}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl text-gray-900 mb-10 text-center">{t.whyHopHop}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* All Companies */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-gray-900 text-lg mb-2">{t.featureAllCompanies}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{t.featureAllCompaniesText}</p>
          </div>

          {/* Accurate Schedules */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-gray-900 text-lg mb-2">{t.featureSchedules}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{t.featureSchedulesText}</p>
          </div>

          {/* Rate Company */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center mb-4">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-gray-900 text-lg mb-2">{t.featureRating}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{t.featureRatingText}</p>
          </div>

          {/* Secure Booking */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-gray-900 text-lg mb-2">{t.featureBooking}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{t.featureBookingText}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20 border-t border-gray-700/30">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Main Footer Content - 3 Columns */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-10 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {/* Column 1: Brand Identity */}
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 shadow-md border border-white/10">
                  <img src={logo} alt="HopHop Logo" className="h-10 w-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 tracking-tight">HopHop</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                {t.footerAboutText}
              </p>
            </div>

            {/* Column 2: Support & Contact */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-400 mb-4 tracking-tight">
                {t.footerSupport}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {t.footerSupportText}
              </p>
              <button
                onClick={onContactClick}
                className="group relative inline-flex items-center justify-center gap-5.5 bg-green-600 hover:bg-green-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 text-sm min-w-[140px]"
              >
                <Mail className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
                <span className="relative z-10">{t.footerContact}</span>
                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
              </button>
            </div>

            {/* Column 3: Legal Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-400 mb-4 tracking-tight">
                {t.footerLegal}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#" 
                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-200 text-sm"
                  >
                    <span className={`w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 ${language === 'ar' ? 'order-2' : ''}`}></span>
                    <span className={`relative after:absolute after:bottom-0 ${language === 'ar' ? 'after:right-0' : 'after:left-0'} after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-200 group-hover:after:w-full`}>
                      {t.footerPrivacy}
                    </span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-200 text-sm"
                  >
                    <span className={`w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 ${language === 'ar' ? 'order-2' : ''}`}></span>
                    <span className={`relative after:absolute after:bottom-0 ${language === 'ar' ? 'after:right-0' : 'after:left-0'} after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-200 group-hover:after:w-full`}>
                      {t.footerTerms}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar - Divider & Copyright */}
          <div className="border-t border-gray-700/50 pt-6">
            <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
              <p className="text-gray-500 text-xs sm:text-sm">
                {t.footerCopyright}
              </p>
              <div className={`flex gap-4 sm:gap-6 text-xs ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <a 
                  href="#" 
                  className={`text-gray-500 hover:text-green-400 transition-colors duration-200 relative after:absolute after:bottom-0 ${language === 'ar' ? 'after:right-0' : 'after:left-0'} after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-200 hover:after:w-full`}
                >
                  {t.footerPrivacy}
                </a>
                <a 
                  href="#" 
                  className={`text-gray-500 hover:text-green-400 transition-colors duration-200 relative after:absolute after:bottom-0 ${language === 'ar' ? 'after:right-0' : 'after:left-0'} after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-200 hover:after:w-full`}
                >
                  {t.footerTerms}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}