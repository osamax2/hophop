import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Users, Wifi, Wind, Camera, Heart, Check, AlertCircle, Loader2, Star } from 'lucide-react';
import type { Language } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RouteMap } from './RouteMap';
import { BookingModal } from './BookingModal';
import { tripsApi, imagesApi, ratingsApi } from '../lib/api';
import { formatTime, formatCurrency, formatDuration } from '../lib/i18n-utils';

interface TripDetailsProps {
  tripId: string;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (tripId: string) => void;
  isLoggedIn: boolean;
}

const translations = {
  de: {
    tripDetails: 'Fahrtdetails',
    route: 'Route',
    schedule: 'Fahrplan',
    pricing: 'Preise',
    availability: 'Verfügbarkeit',
    amenities: 'Ausstattung',
    photos: 'Fotos',
    stops: 'Zwischenstationen',
    seatsAvailable: 'Plätze verfügbar',
    addToFavorites: 'Zu Favoriten hinzufügen',
    removeFromFavorites: 'Aus Favoriten entfernen',
    bookNow: 'Jetzt buchen',
    busPhotos: 'Bus-Fotos',
    stationPhotos: 'Haltestellen-Fotos',
    departure: 'Abfahrt',
    arrival: 'Ankunft',
    duration: 'Dauer',
    date: 'Datum',
    price: 'Preis',
    company: 'Busgesellschaft',
    companyPhone: 'Telefon',
    tripUnavailable: 'Diese Verbindung ist derzeit nicht verfügbar',
    alternativeTrips: 'Alternative Fahrten',
    loginToFavorite: 'Melden Sie sich an, um Favoriten zu speichern',
    noBusPhotos: 'Keine Bus-Fotos verfügbar',
    noStationPhotos: 'Keine Haltestellen-Fotos verfügbar',
    companyReviews: 'Bewertungen der Gesellschaft',
    averageRating: 'Durchschnittsbewertung',
    noReviewsYet: 'Noch keine Bewertungen',
    equipmentDetails: 'Ausstattungsdetails',
    cancellationPolicy: 'Stornierungsbedingungen',
    additionalInfo: 'Zusätzliche Informationen',
    noInfo: 'Keine Informationen verfügbar',
    fareOptions: 'Tarifoptionen',
    fareCategory: 'Kategorie',
    bookingOption: 'Option',
    seatsLeft: 'Plätze übrig',
    noFareOptions: 'Nur Standardpreis verfügbar',
  },
  en: {
    tripDetails: 'Trip Details',
    route: 'Route',
    schedule: 'Schedule',
    pricing: 'Pricing',
    availability: 'Availability',
    amenities: 'Amenities',
    photos: 'Photos',
    stops: 'Stops',
    seatsAvailable: 'Seats available',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    bookNow: 'Book Now',
    busPhotos: 'Bus Photos',
    stationPhotos: 'Station Photos',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    date: 'Date',
    price: 'Price',
    company: 'Bus Company',
    companyPhone: 'Phone',
    tripUnavailable: 'This connection is currently unavailable',
    alternativeTrips: 'Alternative Trips',
    loginToFavorite: 'Sign in to save favorites',
    noBusPhotos: 'No bus photos available',
    noStationPhotos: 'No station photos available',
    companyReviews: 'Company Reviews',
    averageRating: 'Average Rating',
    noReviewsYet: 'No reviews yet',
    equipmentDetails: 'Equipment Details',
    cancellationPolicy: 'Cancellation Policy',
    additionalInfo: 'Additional Information',
    noInfo: 'No information available',
    fareOptions: 'Fare Options',
    fareCategory: 'Category',
    bookingOption: 'Option',
    seatsLeft: 'Seats left',
    noFareOptions: 'Standard price only',
  },
  ar: {
    tripDetails: 'تفاصيل الرحلة',
    route: 'المسار',
    schedule: 'الجدول الزمني',
    pricing: 'الأسعار',
    availability: 'التوفر',
    amenities: 'المرافق',
    photos: 'الصور',
    stops: 'محطات التوقف',
    seatsAvailable: 'مقاعد متاحة',
    addToFavorites: 'إضافة للمفضلة',
    removeFromFavorites: 'إزالة من المفضلة',
    bookNow: 'احجز الآن',
    busPhotos: 'صور الباص',
    stationPhotos: 'صور المحطات',
    departure: 'المغادرة',
    arrival: 'الوصول',
    duration: 'المدة',
    date: 'التاريخ',
    price: 'السعر',
    company: 'شركة الباص',    companyPhone: 'الهاتف',    tripUnavailable: 'هذه الرحلة غير متاحة حاليًا',
    alternativeTrips: 'رحلات بديلة',
    loginToFavorite: 'سجل الدخول لحفظ المفضلة',
    noBusPhotos: 'لا توجد صور للباص',
    noStationPhotos: 'لا توجد صور للمحطات',
    companyReviews: 'تقييمات الشركة',
    averageRating: 'متوسط التقييم',
    noReviewsYet: 'لا توجد تقييمات بعد',
    equipmentDetails: 'تفاصيل المعدات',
    cancellationPolicy: 'سياسة الإلغاء',
    additionalInfo: 'معلومات إضافية',
    noInfo: 'لا توجد معلومات متاحة',
    fareOptions: 'خيارات الأسعار',
    fareCategory: 'الفئة',
    bookingOption: 'الخيار',
    seatsLeft: 'مقاعد متبقية',
    noFareOptions: 'السعر القياسي فقط',
  },
};

export function TripDetails({ tripId, language, isFavorite, onToggleFavorite, isLoggedIn }: TripDetailsProps) {
  const t = translations[language];
  const [trip, setTrip] = useState<any>(null);
  const [tripFares, setTripFares] = useState<any[]>([]);
  const [tripImages, setTripImages] = useState<any[]>([]);
  const [busImages, setBusImages] = useState<any[]>([]);
  const [stationImages, setStationImages] = useState<any[]>([]);
  const [companyReviews, setCompanyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tripsApi.getById(tripId);
        
        // Format the trip data for display
        const formattedTrip = {
          id: data.id,
          from: data.from_city,
          to: data.to_city,
          departureDate: data.departure_time,
          departureTime: formatTime(data.departure_time, language),
          arrivalTime: formatTime(data.arrival_time, language),
          duration: formatDuration(data.duration_minutes, language),
          price: data.price || 0,
          currency: data.currency || 'SYP',
          company: data.company_name || 'Unknown',
          companyId: data.company_id,
          companyPhone: data.company_phone || null,
          seatsAvailable: data.seats_available,
          totalSeats: data.seats_total,
          stops: data.stops || [],
          available: data.status === 'scheduled' && data.seats_available > 0,
          equipment: data.equipment,
          cancellationPolicy: data.cancellation_policy,
          extraInfo: data.extra_info,
          amenities: data.equipment ? (data.equipment.includes('wifi') ? ['wifi'] : []).concat(
            data.equipment.includes('ac') ? ['ac'] : []
          ) : [],
        };
        
        setTrip(formattedTrip);

        // Fetch images, fares and reviews for this trip
        try {
          const [tripImgs, busImgs, stationImgs, reviews, fares] = await Promise.all([
            imagesApi.getByEntity('trip', data.id || 0),
            imagesApi.getByEntity('bus', data.company_id || 0),
            imagesApi.getByEntity('station', data.departure_station_id || 0),
            ratingsApi.getByCompany(data.company_id || 0).catch(() => []),
            fetch(`/api/fares?trip_id=${data.id}`).then(r => r.ok ? r.json() : []).catch(() => []),
          ]);
          console.log('Company reviews fetched:', reviews.length, 'reviews for company_id:', data.company_id);
          console.log('Trip fares fetched:', fares.length, 'fares for trip_id:', data.id);
          setTripImages(tripImgs);
          setBusImages(busImgs);
          setStationImages(stationImgs);
          setCompanyReviews(reviews);
          setTripFares(fares);
        } catch (imgErr) {
          console.error('Error fetching images:', imgErr);
          // Images are optional, so we continue
        }
      } catch (err: any) {
        console.error('Error fetching trip:', err);
        setError(err.message || 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, language]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-900 mb-2">{error || 'Trip not found'}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">{t.tripDetails}</h1>
        <div className="flex items-center gap-3 text-gray-600">
          <span>{trip.from}</span>
          <MapPin className="w-4 h-4" />
          <span>{trip.to}</span>
        </div>
      </div>

      {trip.available ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl text-gray-900">{t.route}</h2>
              </div>
              <div className="relative h-96">
                <RouteMap
                  fromCity={trip.from}
                  toCity={trip.to}
                  stops={trip.stops}
                  departureStation={{
                    name: trip.departure_station_name || trip.from,
                  }}
                  arrivalStation={{
                    name: trip.arrival_station_name || trip.to,
                  }}
                />
              </div>
            </div>

            {/* Stops */}
            {trip.stops && trip.stops.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl text-gray-900 mb-6">{t.stops}</h2>
                <div className="space-y-4">
                  {/* Add departure station */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-green-600" />
                      {trip.stops.length > 0 && (
                        <div className="w-0.5 h-12 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-900">{trip.from}</div>
                          <div className="text-sm text-gray-600">0h</div>
                        </div>
                        <div className="text-gray-900">{trip.departureTime}</div>
                      </div>
                    </div>
                  </div>
                  
                  {trip.stops.map((stop: any, index: number) => {
                    // Format time - handle both full datetime and time-only formats
                    const formatStopTime = (timeStr: string) => {
                      if (!timeStr) return '';
                      let time = '';
                      // Check if it's just a time string (HH:MM:SS or HH:MM)
                      if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
                        time = timeStr.substring(0, 5); // Return HH:MM
                      } else {
                        // Try to parse as full datetime
                        const date = new Date(timeStr);
                        if (!isNaN(date.getTime())) {
                          time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                        } else {
                          time = timeStr; // Fallback to raw string
                        }
                      }
                      // Convert to Arabic numerals if language is Arabic
                      if (language === 'ar') {
                        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                        return time.replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
                      }
                      return time;
                    };
                    
                    return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                        {index < trip.stops.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-gray-900">{stop.station_name}</div>
                            {stop.arrival_time && (
                              <div className="text-sm text-gray-600">
                                {formatStopTime(stop.arrival_time)}
                              </div>
                            )}
                          </div>
                          {stop.departure_time && (
                            <div className="text-gray-900">
                              {formatStopTime(stop.departure_time)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                  
                  {/* Add arrival station */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-green-600" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-900">{trip.to}</div>
                          <div className="text-sm text-gray-600">{trip.duration}</div>
                        </div>
                        <div className="text-gray-900">{trip.arrivalTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl text-gray-900 mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {t.photos}
              </h2>
              
              <div className="space-y-6">
                {/* Bus Photos (including trip images) */}
                <div>
                  <h3 className="text-sm text-gray-700 mb-3">{t.busPhotos}</h3>
                  {tripImages.length === 0 && busImages.length === 0 ? (
                    <p className="text-sm text-gray-500">{t.noBusPhotos}</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Show trip images first */}
                      {tripImages.map((img: any) => (
                        <div key={`trip-${img.id}`} className="aspect-video rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={img.image_url}
                            alt={img.file_name || 'Trip photo'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                      {/* Then bus images */}
                      {busImages.map((img: any) => (
                        <div key={`bus-${img.id}`} className="aspect-video rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={img.image_url}
                            alt={img.file_name || 'Bus photo'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Station Photos */}
                <div>
                  <h3 className="text-sm text-gray-700 mb-3">{t.stationPhotos}</h3>
                  {stationImages.length === 0 ? (
                    <p className="text-sm text-gray-500">{t.noStationPhotos}</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {stationImages.map((img: any) => (
                        <div key={img.id} className="aspect-video rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={img.image_url}
                            alt={img.file_name || 'Station photo'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl text-green-600 mb-1">
                  {formatCurrency(trip.price, language, trip.currency)}
                </div>
                <div className="text-sm text-gray-600">{t.price}</div>
              </div>

              {/* Fare Options Table */}
              {tripFares.length > 0 && (
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.fareOptions}</h3>
                  <div className="space-y-2">
                    {tripFares.map((fare: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {language === 'ar' && fare.fare_category_label_ar 
                              ? fare.fare_category_label_ar 
                              : fare.fare_category_code || fare.fare_category_label}
                          </span>
                          <span className="text-gray-600">
                            {language === 'ar' && fare.booking_option_label_ar 
                              ? fare.booking_option_label_ar 
                              : fare.booking_option_code || fare.booking_option_label}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(fare.price, language, fare.currency || trip.currency)}
                          </span>
                          <span className="text-gray-500">
                            {fare.seats_available} {t.seatsLeft}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.company}</span>
                  <span className="text-sm text-gray-900">{trip.company}</span>
                </div>
                {trip.companyPhone && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{t.companyPhone}</span>
                    <a 
                      href={`tel:${trip.companyPhone}`} 
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                      dir="ltr"
                    >
                      {trip.companyPhone}
                    </a>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.date}</span>
                  <span className="text-sm text-gray-900">
                    {new Date(trip.departureDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.departure}</span>
                  <span className="text-sm text-gray-900">{trip.departureTime}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.arrival}</span>
                  <span className="text-sm text-gray-900">{trip.arrivalTime}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.duration}</span>
                  <span className="text-sm text-gray-900">{trip.duration}</span>
                </div>
                {trip.equipment && (
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700 block mb-2">{t.equipmentDetails}</span>
                    <span className="text-sm text-gray-900 whitespace-pre-wrap">{trip.equipment}</span>
                  </div>
                )}
                {trip.cancellationPolicy && (
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700 block mb-2">{t.cancellationPolicy}</span>
                    <span className="text-sm text-gray-900 whitespace-pre-wrap">{trip.cancellationPolicy}</span>
                  </div>
                )}
                {trip.extraInfo && (
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700 block mb-2">{t.additionalInfo}</span>
                    <span className="text-sm text-gray-900 whitespace-pre-wrap">{trip.extraInfo}</span>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-900">{t.availability}</span>
                </div>
                <div className="text-2xl text-green-700">
                  {trip.seatsAvailable} / {trip.totalSeats}
                </div>
                <div className="text-sm text-green-600">{t.seatsAvailable}</div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!trip) return;
                    if (trip.seatsAvailable === 0) {
                      alert('Sold Out / Ausverkauft / نفذت الكمية');
                      return;
                    }
                    setShowBookingModal(true);
                  }}
                  disabled={trip.seatsAvailable === 0}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trip.seatsAvailable === 0 ? 'Ausverkauft / Sold Out / نفذت الكمية' : t.bookNow}
                </button>
                
                {isLoggedIn ? (
                  <button
                    onClick={() => onToggleFavorite(tripId)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      isFavorite
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? t.removeFromFavorites : t.addToFavorites}
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-600 py-3">
                    {t.loginToFavorite}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Reviews Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.companyReviews}</h2>
            {companyReviews.length > 0 ? (
              <div className="space-y-6">
                {/* Average Rating */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {(companyReviews.reduce((acc, r) => acc + ((r.punctuality_rating + r.friendliness_rating + r.cleanliness_rating) / 3), 0) / companyReviews.length).toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(companyReviews.reduce((acc, r) => acc + ((r.punctuality_rating + r.friendliness_rating + r.cleanliness_rating) / 3), 0) / companyReviews.length)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {companyReviews.length} {language === 'de' ? 'Bewertungen' : language === 'en' ? 'reviews' : 'تقييمات'}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">{language === 'de' ? 'Pünktlichkeit' : language === 'en' ? 'Punctuality' : 'الالتزام بالمواعيد'}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${(companyReviews.reduce((acc, r) => acc + r.punctuality_rating, 0) / companyReviews.length / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {(companyReviews.reduce((acc, r) => acc + r.punctuality_rating, 0) / companyReviews.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">{language === 'de' ? 'Freundlichkeit' : language === 'en' ? 'Friendliness' : 'اللطف'}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${(companyReviews.reduce((acc, r) => acc + r.friendliness_rating, 0) / companyReviews.length / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {(companyReviews.reduce((acc, r) => acc + r.friendliness_rating, 0) / companyReviews.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">{language === 'de' ? 'Sauberkeit' : language === 'en' ? 'Cleanliness' : 'النظافة'}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${(companyReviews.reduce((acc, r) => acc + r.cleanliness_rating, 0) / companyReviews.length / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {(companyReviews.reduce((acc, r) => acc + r.cleanliness_rating, 0) / companyReviews.length).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {companyReviews.slice(0, 5).map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-medium text-sm">
                            {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{review.user_name || 'Anonymous'}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round((review.punctuality_rating + review.friendliness_rating + review.cleanliness_rating) / 3)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm">{review.comment}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.created_at).toLocaleDateString(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t.noReviewsYet}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Unavailable Trip
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">{t.tripUnavailable}</h3>
          <p className="text-gray-600 mb-6">Bitte wählen Sie eine alternative Fahrt</p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            {t.alternativeTrips}
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {trip && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          trip={trip}
          tripFares={tripFares}
          language={language}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}
