import { MapPin, Clock, DollarSign, Users, Wifi, Wind, Camera, Heart, Check, AlertCircle } from 'lucide-react';
import type { Language } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
    price: 'Preis',
    company: 'Busgesellschaft',
    tripUnavailable: 'Diese Verbindung ist derzeit nicht verfügbar',
    alternativeTrips: 'Alternative Fahrten',
    loginToFavorite: 'Melden Sie sich an, um Favoriten zu speichern',
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
    price: 'Price',
    company: 'Bus Company',
    tripUnavailable: 'This connection is currently unavailable',
    alternativeTrips: 'Alternative Trips',
    loginToFavorite: 'Sign in to save favorites',
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
    price: 'السعر',
    company: 'شركة الباص',
    tripUnavailable: 'هذه الرحلة غير متاحة حاليًا',
    alternativeTrips: 'رحلات بديلة',
    loginToFavorite: 'سجل الدخول لحفظ المفضلة',
  },
};

// Mock trip data
const mockTripData: Record<string, any> = {
  '1': {
    id: '1',
    from: 'Damascus',
    to: 'Aleppo',
    departureTime: '08:00',
    arrivalTime: '12:30',
    duration: '4h 30m',
    price: 1500,
    company: 'AlKhaleej Transport',
    type: 'vip',
    amenities: ['wifi', 'ac', 'reclining-seats', 'charging-ports'],
    seatsAvailable: 12,
    totalSeats: 40,
    stops: [
      { city: 'Damascus', time: '08:00', duration: '0h' },
      { city: 'Homs', time: '10:15', duration: '2h 15m' },
      { city: 'Hama', time: '11:00', duration: '3h' },
      { city: 'Aleppo', time: '12:30', duration: '4h 30m' },
    ],
    available: true,
  },
  '2': {
    id: '2',
    from: 'Damascus',
    to: 'Aleppo',
    departureTime: '10:30',
    arrivalTime: '15:15',
    duration: '4h 45m',
    price: 1200,
    company: 'Pullman Syria',
    type: 'normal',
    amenities: ['ac', 'reclining-seats'],
    seatsAvailable: 8,
    totalSeats: 45,
    stops: [
      { city: 'Damascus', time: '10:30', duration: '0h' },
      { city: 'Homs', time: '12:45', duration: '2h 15m' },
      { city: 'Hama', time: '13:30', duration: '3h' },
      { city: 'Aleppo', time: '15:15', duration: '4h 45m' },
    ],
    available: true,
  },
};

export function TripDetails({ tripId, language, isFavorite, onToggleFavorite, isLoggedIn }: TripDetailsProps) {
  const t = translations[language];
  const trip = mockTripData[tripId] || mockTripData['1'];

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
            {/* Route Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl text-gray-900">{t.route}</h2>
              </div>
              <div className="relative h-64 bg-gradient-to-br from-green-50 to-blue-50">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1737275853879-731f24015ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeXJpYSUyMGRhbWFzY3VzJTIwY2l0eXxlbnwxfHx8fDE3NjQ4NjgzMzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Route Map"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-90 px-6 py-3 rounded-lg">
                    <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-700">Kartenansicht</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stops */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl text-gray-900 mb-6">{t.stops}</h2>
              <div className="space-y-4">
                {trip.stops.map((stop: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 || index === trip.stops.length - 1
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`} />
                      {index < trip.stops.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-900">{stop.city}</div>
                          <div className="text-sm text-gray-600">{stop.duration}</div>
                        </div>
                        <div className="text-gray-900">{stop.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl text-gray-900 mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {t.photos}
              </h2>
              
              <div className="space-y-6">
                {/* Bus Photos */}
                <div>
                  <h3 className="text-sm text-gray-700 mb-3">{t.busPhotos}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1760386128700-d752f805c116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidXMlMjB0cmF2ZWx8ZW58MXx8fHwxNzY0ODUxOTYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                          alt={`Bus photo ${i}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Station Photos */}
                <div>
                  <h3 className="text-sm text-gray-700 mb-3">{t.stationPhotos}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1559990050-9e0b9175a782?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXMlMjBzdGF0aW9uJTIwdGVybWluYWx8ZW58MXx8fHwxNzY0NzgyNjQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                          alt={`Station photo ${i}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
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
                  {trip.price.toLocaleString()} SYP
                </div>
                <div className="text-sm text-gray-600">{t.price}</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.company}</span>
                  <span className="text-sm text-gray-900">{trip.company}</span>
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
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                  {t.bookNow}
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

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg text-gray-900 mb-4">{t.amenities}</h2>
              <div className="space-y-3">
                {trip.amenities.includes('wifi') && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">WiFi</span>
                  </div>
                )}
                {trip.amenities.includes('ac') && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                      <Wind className="w-5 h-5 text-cyan-600" />
                    </div>
                    <span className="text-sm text-gray-700">Klimaanlage</span>
                  </div>
                )}
                {trip.amenities.includes('reclining-seats') && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Liegesitze</span>
                  </div>
                )}
                {trip.amenities.includes('charging-ports') && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Ladeanschlüsse</span>
                  </div>
                )}
              </div>
            </div>
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
    </div>
  );
}
