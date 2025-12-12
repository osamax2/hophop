import { useState } from 'react';
import { Search, MapPin, Calendar, Building2, Clock, Star, ShieldCheck, Bus } from 'lucide-react';
import type { Language, SearchParams } from '../App';
import logo from 'figma:asset/4dddb73877b28322b7848adc27f0f948198765ae.png';

interface HomePageProps {
  onSearch: (params: SearchParams) => void;
  language: Language;
}

const translations = {
  de: {
    mainTitle: 'Finde deine Reise',
    subtitle: 'Suche die aktuellen Fahrpläne zwischen syrischen Städten',
    slogan: 'Deine beste Wahl',
    from: 'Startort',
    to: 'Zielort',
    date: 'Datum',
    search: 'Suche starten',
    fromPlaceholder: 'Wähle Startstadt',
    toPlaceholder: 'Wähle Zielstadt',
    transportType: 'Transportart (optional)',
    popularRoutes: 'Beliebte Routen',
    whyHopHop: 'Warum HopHop ist deine beste Wahl',
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
  },
  en: {
    mainTitle: 'Find Your Journey',
    subtitle: 'Search current schedules between Syrian cities',
    slogan: 'Your best choice',
    from: 'From',
    to: 'To',
    date: 'Date',
    search: 'Start Search',
    fromPlaceholder: 'Select departure city',
    toPlaceholder: 'Select destination city',
    transportType: 'Transport Type (optional)',
    popularRoutes: 'Popular Routes',
    whyHopHop: 'Why HopHop is your best choice',
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
  },
  ar: {
    mainTitle: 'ابحث عن رحلتك',
    subtitle: 'ابحث في الجداول الحالية بين المدن السورية',
    slogan: 'خيارك الأفضل',
    from: 'من',
    to: 'إلى',
    date: 'التاريخ',
    search: 'ابدأ البحث',
    fromPlaceholder: 'اختر مدينة المغادرة',
    toPlaceholder: 'اختر مدينة الوصول',
    transportType: 'نوع النقل (اختياري)',
    popularRoutes: 'الطرق الشائعة',
    whyHopHop: 'لماذا هوب هوب هو خيارك الأفضل',
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
  },
};

const cities = [
  'Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama', 'Tartus', 
  'Deir ez-Zor', 'Raqqa', 'Idlib', 'Daraa', 'Al-Hasakah', 'Qamishli'
];

const popularRoutes = [
  { from: 'Damascus', to: 'Aleppo', duration: '4h 30m' },
  { from: 'Damascus', to: 'Latakia', duration: '3h 45m' },
  { from: 'Aleppo', to: 'Homs', duration: '2h 15m' },
  { from: 'Damascus', to: 'Homs', duration: '2h 30m' },
];

export function HomePage({ onSearch, language }: HomePageProps) {
  const t = translations[language];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [busType, setBusType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      onSearch({ from, to, date, time: '08:00', type: busType });
    }
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
          <div className="inline-block mb-8">
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

          {/* Subtitle */}
          <p className="text-white/90 text-xl md:text-2xl max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Search Box - Floating Effect */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* From */}
            <div>
              <label className="block text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>{t.from}</span>
              </label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                required
              >
                <option value="">{t.fromPlaceholder}</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* To */}
            <div>
              <label className="block text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>{t.to}</span>
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                required
              >
                <option value="">{t.toPlaceholder}</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Date */}
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
                required
              />
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
                  {type === '' ? 'Alle' : 
                   type === 'bus' ? t.typeBus : 
                   type === 'van' ? t.typeVan : 
                   type === 'vip-van' ? t.typeVipVan : 
                   type === 'ship' ? t.typeShip : 
                   t.typeTrain}
                </button>
              ))}
            </div>
          </div>

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
    </div>
  );
}