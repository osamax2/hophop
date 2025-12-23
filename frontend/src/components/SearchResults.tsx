import { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  Star,
  Wifi,
  Wind,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  Heart,
} from 'lucide-react';
import type { Language, SearchParams } from '../App';
import { formatTime, formatCurrency, formatDuration } from '../lib/i18n-utils';

interface SearchResultsProps {
  searchParams: SearchParams;
  onViewDetails: (tripId: string) => void;
  language: Language;
  favorites: string[];
  onToggleFavorite: (tripId: string) => void;
  isLoggedIn: boolean;
}

const translations = {
  de: {
    results: 'Suchergebnisse',
    filters: 'Filter',
    sortBy: 'Sortieren nach',
    earliest: 'Früheste',
    cheapest: 'Günstigste',
    departureTime: 'Abfahrtszeit',
    price: 'Preis',
    duration: 'Dauer',
    company: 'Busgesellschaft',
    availability: 'Verfügbarkeit',
    viewDetails: 'Details anzeigen',
    stops: 'Zwischenstopps',
    seats: 'Plätze frei',
    noResults: 'Keine Fahrten gefunden',
    tryDifferent: 'Versuchen Sie andere Suchkriterien',
    amenities: 'Ausstattung',
    morning: 'Morgen (6-12)',
    afternoon: 'Nachmittag (12-18)',
    evening: 'Abend (18-24)',
    night: 'Nacht (0-6)',
    emptyFieldsError: 'Bitte geben Sie einen Abfahrts- und einen Ankunftsort ein',
    loadError: 'Fehler beim Laden der Fahrten',
  },
  en: {
    results: 'Search Results',
    filters: 'Filters',
    sortBy: 'Sort by',
    earliest: 'Earliest',
    cheapest: 'Cheapest',
    departureTime: 'Departure Time',
    price: 'Price',
    duration: 'Duration',
    company: 'Bus Company',
    availability: 'Availability',
    viewDetails: 'View Details',
    stops: 'Stops',
    seats: 'Seats available',
    noResults: 'No trips found',
    tryDifferent: 'Try different search criteria',
    amenities: 'Amenities',
    morning: 'Morning (6-12)',
    afternoon: 'Afternoon (12-18)',
    evening: 'Evening (18-24)',
    night: 'Night (0-6)',
    emptyFieldsError: 'Please enter both departure and arrival locations',
    loadError: 'Failed to load trips',
  },
  ar: {
    results: 'نتائج البحث',
    filters: 'الفلاتر',
    sortBy: 'ترتيب حسب',
    earliest: 'الأبكر',
    cheapest: 'الأرخص',
    departureTime: 'وقت المغادرة',
    price: 'السعر',
    duration: 'المدة',
    company: 'شركة الباص',
    availability: 'التوفر',
    viewDetails: 'عرض التفاصيل',
    stops: 'محطات التوقف',
    seats: 'مقاعد متاحة',
    noResults: 'لم يتم العثور على رحلات',
    tryDifferent: 'جرب معايير بحث مختلفة',
    amenities: 'المرافق',
    morning: 'صباح (6-12)',
    afternoon: 'بعد الظهر (12-18)',
    evening: 'مساء (18-24)',
    night: 'ليل (0-6)',
    emptyFieldsError: 'يرجى إدخال مكان المغادرة ومكان الوصول',
    loadError: 'فشل تحميل الرحلات',
  },
} as const;

type Trip = {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  company: string;
  type: 'vip' | 'normal' | 'van';
  amenities: string[];
  stops: number;
  seatsAvailable: number;
};

export function SearchResults({
  searchParams,
  onViewDetails,
  language,
  favorites,
  onToggleFavorite,
  isLoggedIn,
}: SearchResultsProps) {
  const t = translations[language];

  const [sortBy, setSortBy] = useState<'earliest' | 'cheapest'>('earliest');
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // استدعاء الرحلات من الـ backend
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current translations based on language
        const currentTranslations = translations[language];

        // Check if both from and to are empty
        const fromEmpty = !searchParams.from || searchParams.from.trim() === '';
        const toEmpty = !searchParams.to || searchParams.to.trim() === '';
        
        if (fromEmpty && toEmpty) {
          setError(currentTranslations.emptyFieldsError);
          setLoading(false);
          setTrips([]);
          return;
        }

        const params = new URLSearchParams({
          from: searchParams.from || '',
          to: searchParams.to || '',
          date: searchParams.date,
        });

        const API_BASE = import.meta.env.VITE_API_BASE || "";
        const url = `${API_BASE}/api/trips?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`API endpoint not found: ${url}. Please make sure the backend server is running on ${API_BASE}`);
          }
          throw new Error(`Failed to fetch trips: ${res.status} ${res.statusText}`);
        }

        const data: Trip[] = await res.json();
        setTrips(data);

        // لو حاب، ممكن نضبط الرينج حسب الأسعار الفعلية
        if (data.length > 0) {
          const maxPrice = Math.max(...data.map((t) => t.price));
          setPriceRange([0, maxPrice]);
        }
      } catch (err) {
        console.error(err);
        const currentTranslations = translations[language];
        setError(currentTranslations.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [searchParams.from, searchParams.to, searchParams.date, language]);

  // Update error message when language changes if fields are still empty
  useEffect(() => {
    const fromEmpty = !searchParams.from || searchParams.from.trim() === '';
    const toEmpty = !searchParams.to || searchParams.to.trim() === '';
    
    if (fromEmpty && toEmpty) {
      const currentTranslations = translations[language];
      setError(currentTranslations.emptyFieldsError);
    }
  }, [language, searchParams.from, searchParams.to]);

  // Filter and sort trips
  let filteredTrips = trips.filter((trip) => {
    // Price filter
    if (trip.price < priceRange[0] || trip.price > priceRange[1]) return false;

    // Time slot filter
    if (selectedTimeSlots.length > 0) {
      const hour = parseInt(trip.departureTime.split(':')[0]);
      const slot =
        hour >= 6 && hour < 12
          ? 'morning'
          : hour >= 12 && hour < 18
          ? 'afternoon'
          : hour >= 18
          ? 'evening'
          : 'night';
      if (!selectedTimeSlots.includes(slot)) return false;
    }

    // Company filter
    if (selectedCompanies.length > 0 && !selectedCompanies.includes(trip.company))
      return false;

    return true;
  });

  // Sort trips
  filteredTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'earliest') {
      return a.departureTime.localeCompare(b.departureTime);
    } else {
      return a.price - b.price;
    }
  });

  const companies = Array.from(new Set(trips.map((t) => t.company)));
  const timeSlots = ['morning', 'afternoon', 'evening', 'night'] as const;

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company],
    );
  };

  let content: JSX.Element;

  if (loading) {
    content = (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600">Loading trips...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 mb-4">
        {error}
      </div>
    );
  } else if (filteredTrips.length === 0) {
    content = (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl text-gray-900 mb-2">{t.noResults}</h3>
        <p className="text-gray-600">{t.tryDifferent}</p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Time Info */}
              <div className="flex items-center gap-6 flex-1">
                <div className="text-center">
                  <div className="text-2xl text-gray-900 mb-1">{trip.departureTime}</div>
                  <div className="text-sm text-gray-600">{trip.from}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-0.5 flex-1 bg-gray-300" />
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="h-0.5 flex-1 bg-gray-300" />
                  </div>
                  <div className="text-center text-sm text-gray-600">{trip.duration}</div>
                  {trip.stops > 0 && (
                    <div className="text-center text-xs text-gray-500 mt-1">
                      {trip.stops} {t.stops}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl text-gray-900 mb-1">{trip.arrivalTime}</div>
                  <div className="text-sm text-gray-600">{trip.to}</div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                {/* Company & Amenities */}
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-2">{trip.company}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {trip.amenities.includes('wifi') && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                        <Wifi className="w-3 h-3" />
                        WiFi
                      </div>
                    )}
                    {trip.amenities.includes('ac') && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs">
                        <Wind className="w-3 h-3" />
                        AC
                      </div>
                    )}
                    {trip.type === 'vip' && (
                      <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                        VIP
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                    <Users className="w-4 h-4" />
                    {trip.seatsAvailable} {t.seats}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex md:flex-col items-center md:items-end gap-3">
                  <div className="text-right flex-1 md:flex-none">
                    <div className="text-2xl text-green-600">
                      {formatCurrency(trip.price, language)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isLoggedIn && (
                      <button
                        onClick={() => onToggleFavorite(trip.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          favorites.includes(trip.id)
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(trip.id) ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => onViewDetails(trip.id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">{t.results}</h1>
        <p className="text-gray-600">
          {searchParams.from} → {searchParams.to} • {searchParams.date}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
            {/* Filter Header */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors lg:cursor-default"
            >
              <h2 className="text-xl text-gray-900">{t.filters}</h2>
              <span className="lg:hidden">
                {showFilters ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </span>
            </button>

            {/* Filter Content */}
            <div
              className={`${
                showFilters ? 'block' : 'hidden lg:block'
              } border-t border-gray-200`}
            >
              {/* Sort By */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm text-gray-700 mb-3">{t.sortBy}</h3>
                <div className="space-y-2">
                  {(['earliest', 'cheapest'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                        sortBy === option
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {t[option]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm text-gray-700 mb-3">{t.price}</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={priceRange[1] || 5000}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value, 10)])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0 SYP</span>
                    <span>{priceRange[1]} SYP</span>
                  </div>
                </div>
              </div>

              {/* Departure Time */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm text-gray-700 mb-3">{t.departureTime}</h3>
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => toggleTimeSlot(slot)}
                      className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                        selectedTimeSlots.includes(slot)
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {t[slot]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bus Company */}
              <div className="p-6">
                <h3 className="text-sm text-gray-700 mb-3">{t.company}</h3>
                <div className="space-y-2">
                  {companies.length === 0 && (
                    <p className="text-sm text-gray-500">
                      {language === 'ar'
                        ? 'لا توجد شركات حالياً'
                        : language === 'de'
                        ? 'Keine Unternehmen verfügbar'
                        : 'No companies available'}
                    </p>
                  )}
                  {companies.map((company) => (
                    <label
                      key={company}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company)}
                        onChange={() => toggleCompany(company)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{company}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1">{content}</div>
      </div>
    </div>
  );
}
