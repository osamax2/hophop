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
  onNoTripsFound?: () => void;
}

const translations = {
  de: {
    results: 'Suchergebnisse',
    roundTrip: 'Hin- und Rückfahrt',
    outboundTrip: 'Hinreise',
    returnTrip: 'Rückreise',
    selectOutbound: 'Wählen Sie Ihre Hinreise',
    selectReturn: 'Wählen Sie Ihre Rückreise',
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
    noResultsForDate: 'Keine Fahrten an diesem Datum verfügbar',
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
    roundTrip: 'Round Trip',
    outboundTrip: 'Outbound Journey',
    returnTrip: 'Return Journey',
    selectOutbound: 'Select your outbound trip',
    selectReturn: 'Select your return trip',
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
    noResultsForDate: 'No trips available on this date',
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
    roundTrip: 'ذهاب وعودة',
    outboundTrip: 'رحلة الذهاب',
    returnTrip: 'رحلة العودة',
    selectOutbound: 'اختر رحلة الذهاب',
    selectReturn: 'اختر رحلة العودة',
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
    noResultsForDate: 'لا توجد رحلات في هذا التاريخ',
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
  image_url?: string | null;
};

export function SearchResults({
  searchParams,
  onViewDetails,
  language,
  favorites,
  onToggleFavorite,
  isLoggedIn,
  onNoTripsFound,
}: SearchResultsProps) {
  console.log('SearchResults component rendered', { 
    from: searchParams.from, 
    to: searchParams.to, 
    date: searchParams.date,
    onNoTripsFound: !!onNoTripsFound 
  });
  const t = translations[language];

  // Helper to convert to Arabic numerals
  const toArabicNumerals = (num: string | number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  const [sortBy, setSortBy] = useState<'earliest' | 'cheapest'>('earliest');
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [returnTrips, setReturnTrips] = useState<Trip[]>([]);
  const [selectedOutboundTrip, setSelectedOutboundTrip] = useState<string | null>(null);
  const [selectedReturnTrip, setSelectedReturnTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNoTrips, setHasNoTrips] = useState(false);

  // استدعاء الرحلات من الـ backend
  useEffect(() => {
    console.log('SearchResults useEffect triggered', { 
      from: searchParams.from, 
      to: searchParams.to, 
      date: searchParams.date 
    });
    const fetchTrips = async () => {
      try {
        console.log('fetchTrips started');
        setLoading(true);
        setError(null);
        setHasNoTrips(false);

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
        console.log('Trips data received:', data.length, 'trips');
        setTrips(data);

        // Fetch return trips if round trip
        if (searchParams.isRoundTrip && searchParams.returnDate) {
          console.log('Fetching return trips - Round trip detected', {
            isRoundTrip: searchParams.isRoundTrip,
            returnDate: searchParams.returnDate,
            swappedFrom: searchParams.to,
            swappedTo: searchParams.from
          });
          const returnParams = new URLSearchParams({
            from: searchParams.to || '', // Swap from and to
            to: searchParams.from || '',
            date: searchParams.returnDate,
          });
          const returnUrl = `${API_BASE}/api/trips?${returnParams.toString()}`;
          console.log('Return trips URL:', returnUrl);
          const returnRes = await fetch(returnUrl);
          if (returnRes.ok) {
            const returnData: Trip[] = await returnRes.json();
            console.log('Return trips data received:', returnData.length, 'trips', returnData);
            setReturnTrips(returnData);
          } else {
            console.error('Failed to fetch return trips:', returnRes.status, returnRes.statusText);
            setReturnTrips([]);
          }
        } else {
          console.log('Not fetching return trips:', {
            isRoundTrip: searchParams.isRoundTrip,
            returnDate: searchParams.returnDate
          });
          setReturnTrips([]);
        }

        // لو حاب، ممكن نضبط الرينج حسب الأسعار الفعلية
        if (data.length > 0) {
          console.log('Trips found, setting hasNoTrips to false');
          const maxPrice = Math.max(...data.map((t) => t.price));
          setPriceRange([0, maxPrice]);
          setHasNoTrips(false);
          setLoading(false);
        } else {
          // إذا لم تكن هناك رحلات، تحديد الحالة واستدعاء callback
          const hasFrom = searchParams.from && searchParams.from.trim() !== '';
          const hasTo = searchParams.to && searchParams.to.trim() !== '';
          console.log('No trips found. hasFrom:', hasFrom, 'hasTo:', hasTo, 'date:', searchParams.date, 'onNoTripsFound:', !!onNoTripsFound);
          if ((hasFrom || hasTo) && searchParams.date && onNoTripsFound) {
            console.log('Conditions met, calling onNoTripsFound callback');
            setHasNoTrips(true);
            setLoading(false);
            // استدعاء callback مباشرة بعد تعيين الحالة
            try {
              onNoTripsFound();
              console.log('onNoTripsFound callback executed successfully');
            } catch (error) {
              console.error('Error calling onNoTripsFound:', error);
            }
          } else {
            console.log('Conditions not met, not calling callback');
            setHasNoTrips(false);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        const currentTranslations = translations[language];
        setError(currentTranslations.loadError);
        setLoading(false);
      }
    };

    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.from, searchParams.to, searchParams.date, searchParams.returnDate, searchParams.isRoundTrip, language]);

  // هذا useEffect لم يعد ضرورياً لأننا نستدعي callback مباشرة في fetchTrips


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

  // Filter and sort return trips
  let filteredReturnTrips = returnTrips.filter((trip) => {
    if (trip.price < priceRange[0] || trip.price > priceRange[1]) return false;
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
    if (selectedCompanies.length > 0 && !selectedCompanies.includes(trip.company))
      return false;
    return true;
  });

  filteredReturnTrips = [...filteredReturnTrips].sort((a, b) => {
    if (sortBy === 'earliest') {
      return a.departureTime.localeCompare(b.departureTime);
    } else {
      return a.price - b.price;
    }
  });

  const companies = Array.from(new Set([...trips.map((t) => t.company), ...returnTrips.map((t) => t.company)]));
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
  } else if ((!loading && trips.length === 0 && !error) || (hasNoTrips && !loading)) {
    // إذا لم تكن هناك رحلات بعد التحميل، إرجاع null لإخفاء الصفحة
    // سيتم عرض النافذة المنبثقة من App.tsx
    console.log('Returning null - no trips found. hasNoTrips:', hasNoTrips, 'trips.length:', trips.length, 'loading:', loading, 'error:', error);
    return null;
  } else {
    // Render function for trip cards
    const renderTripCard = (trip: Trip, isReturn: boolean = false) => {
      const isSelected = isReturn 
        ? selectedReturnTrip === trip.id 
        : selectedOutboundTrip === trip.id;
      const shouldShowSelect = searchParams.isRoundTrip;
      
      return (
        <div
          key={trip.id}
          className={`bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
            shouldShowSelect ? 'cursor-pointer' : ''
          } ${isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'}`}
          onClick={() => {
            if (shouldShowSelect) {
              if (isReturn) {
                setSelectedReturnTrip(trip.id);
              } else {
                setSelectedOutboundTrip(trip.id);
              }
            }
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {trip.image_url && (
              <div className="md:w-32 md:h-32 w-full h-48 flex-shrink-0">
                <img
                  src={trip.image_url}
                  alt={`${trip.company} bus`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
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

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
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
                  {language === 'ar' ? toArabicNumerals(trip.seatsAvailable) : trip.seatsAvailable} {t.seats}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end gap-3">
                <div className="text-right flex-1 md:flex-none">
                  <div className="text-2xl text-green-600">
                    {formatCurrency(trip.price, language)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isLoggedIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(trip.id);
                      }}
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
                  {shouldShowSelect ? (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(trip.id);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm"
                      >
                        {t.viewDetails}
                      </button>
                      {isSelected && (
                        <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                          ✓ {language === 'de' && 'Ausgewählt'}
                          {language === 'en' && 'Selected'}
                          {language === 'ar' && 'محدد'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(trip.id);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      {t.viewDetails}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    content = (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {searchParams.isRoundTrip ? t.outboundTrip : t.results}
          </h2>
          {searchParams.isRoundTrip && (
            <p className="text-sm text-gray-600 mb-4">{t.selectOutbound}</p>
          )}
          <div className="space-y-4">
            {filteredTrips.map((trip) => renderTripCard(trip, false))}
          </div>
        </div>

        {/* Debug info */}
        {console.log('Render check:', {
          isRoundTrip: searchParams.isRoundTrip,
          returnTripsLength: returnTrips.length,
          filteredReturnTripsLength: filteredReturnTrips.length,
          shouldShow: searchParams.isRoundTrip
        })}

        {searchParams.isRoundTrip && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.returnTrip}</h2>
            {returnTrips.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">{t.selectReturn}</p>
                <div className="space-y-4">
                  {filteredReturnTrips.map((trip) => renderTripCard(trip, true))}
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-gray-700">
                  {language === 'de' && 'Keine Rückfahrten für das ausgewählte Datum verfügbar'}
                  {language === 'en' && 'No return trips available for the selected date'}
                  {language === 'ar' && 'لا توجد رحلات عودة متاحة للتاريخ المحدد'}
                </p>
              </div>
            )}
          </div>
        )}

        {searchParams.isRoundTrip && selectedOutboundTrip && selectedReturnTrip && (
          <div className="sticky bottom-4 bg-white rounded-2xl shadow-lg border-2 border-green-500 p-4">
            <button
              onClick={() => {
                onViewDetails(selectedOutboundTrip);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-3 text-lg font-semibold"
            >
              {language === 'de' && 'Beide Fahrten buchen'}
              {language === 'en' && 'Book Both Trips'}
              {language === 'ar' && 'احجز كلا الرحلتين'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">
          {searchParams.isRoundTrip ? `${t.results} - ${t.roundTrip}` : t.results}
        </h1>
        <div className="flex flex-col gap-2">
          <p className="text-gray-600 flex items-center gap-2">
            <span className="font-medium">{t.outboundTrip}:</span>
            {searchParams.from} → {searchParams.to} • {searchParams.date}
          </p>
          {searchParams.isRoundTrip && searchParams.returnDate && (
            <p className="text-gray-600 flex items-center gap-2">
              <span className="font-medium">{t.returnTrip}:</span>
              {searchParams.to} → {searchParams.from} • {searchParams.returnDate}
            </p>
          )}
        </div>
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
                    <span>{formatCurrency(0, language)}</span>
                    <span>{formatCurrency(priceRange[1], language)}</span>
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
