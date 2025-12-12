import { Heart, MapPin, Clock, DollarSign, LogIn } from 'lucide-react';
import type { Language } from '../App';

interface FavoritesProps {
  favorites: string[];
  onViewDetails: (tripId: string) => void;
  language: Language;
  isLoggedIn: boolean;
  onNavigateToLogin: () => void;
}

const translations = {
  de: {
    favorites: 'Meine Favoriten',
    noFavorites: 'Keine Favoriten gespeichert',
    addFavorites: 'Fügen Sie Fahrten zu Ihren Favoriten hinzu, um sie später schnell zu finden',
    loginRequired: 'Anmeldung erforderlich',
    loginMessage: 'Melden Sie sich an, um Ihre Favoriten zu sehen und zu verwalten',
    loginButton: 'Jetzt anmelden',
    viewDetails: 'Details anzeigen',
    remove: 'Entfernen',
  },
  en: {
    favorites: 'My Favorites',
    noFavorites: 'No favorites saved',
    addFavorites: 'Add trips to your favorites to quickly find them later',
    loginRequired: 'Login Required',
    loginMessage: 'Sign in to view and manage your favorites',
    loginButton: 'Sign In Now',
    viewDetails: 'View Details',
    remove: 'Remove',
  },
  ar: {
    favorites: 'المفضلة',
    noFavorites: 'لا توجد مفضلات محفوظة',
    addFavorites: 'أضف رحلات إلى مفضلاتك للعثور عليها بسرعة لاحقًا',
    loginRequired: 'تسجيل الدخول مطلوب',
    loginMessage: 'سجل الدخول لعرض وإدارة مفضلاتك',
    loginButton: 'سجل الدخول الآن',
    viewDetails: 'عرض التفاصيل',
    remove: 'إزالة',
  },
};

// Mock trip data
const mockTrips: Record<string, any> = {
  '1': {
    id: '1',
    from: 'Damascus',
    to: 'Aleppo',
    departureTime: '08:00',
    arrivalTime: '12:30',
    duration: '4h 30m',
    price: 1500,
    company: 'AlKhaleej Transport',
    seatsAvailable: 12,
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
    seatsAvailable: 8,
  },
  '3': {
    id: '3',
    from: 'Damascus',
    to: 'Aleppo',
    departureTime: '14:00',
    arrivalTime: '18:30',
    duration: '4h 30m',
    price: 1800,
    company: 'Karnak Tours',
    seatsAvailable: 15,
  },
  '4': {
    id: '4',
    from: 'Damascus',
    to: 'Aleppo',
    departureTime: '16:30',
    arrivalTime: '21:00',
    duration: '4h 30m',
    price: 1000,
    company: 'Damascus Express',
    seatsAvailable: 20,
  },
};

export function Favorites({ favorites, onViewDetails, language, isLoggedIn, onNavigateToLogin }: FavoritesProps) {
  const t = translations[language];

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-3">{t.loginRequired}</h2>
          <p className="text-gray-600 mb-8">{t.loginMessage}</p>
          <button
            onClick={onNavigateToLogin}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t.loginButton}
          </button>
        </div>
      </div>
    );
  }

  const favoriteTrips = favorites.map(id => mockTrips[id]).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-600 fill-current" />
          <h1 className="text-3xl text-gray-900">{t.favorites}</h1>
        </div>
        <p className="text-gray-600">
          {favorites.length} {favorites.length === 1 ? 'Fahrt' : 'Fahrten'} gespeichert
        </p>
      </div>

      {favoriteTrips.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">{t.noFavorites}</h3>
          <p className="text-gray-600">{t.addFavorites}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {favoriteTrips.map(trip => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Route */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-gray-900">{trip.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-gray-900">{trip.to}</span>
                  </div>
                </div>
                <Heart className="w-6 h-6 text-red-600 fill-current" />
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Zeit
                  </div>
                  <span className="text-sm text-gray-900">
                    {trip.departureTime} - {trip.arrivalTime}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Dauer</span>
                  <span className="text-sm text-gray-900">{trip.duration}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Gesellschaft</span>
                  <span className="text-sm text-gray-900">{trip.company}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    Preis
                  </div>
                  <span className="text-lg text-green-600">
                    {trip.price.toLocaleString()} SYP
                  </span>
                </div>
              </div>

              {/* Availability Badge */}
              <div className="bg-green-50 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Verfügbarkeit</span>
                  <span className="text-green-900">
                    {trip.seatsAvailable} Plätze frei
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onViewDetails(trip.id)}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t.viewDetails}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
