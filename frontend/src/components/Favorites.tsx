import { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, DollarSign, LogIn, Loader2 } from 'lucide-react';
import type { Language } from '../App';
import { favoritesApi } from '../lib/api';
import { formatTime, formatCurrency, formatDuration } from '../lib/i18n-utils';

interface FavoritesProps {
  favorites: string[]; // Keep for backward compatibility, but will fetch from API
  onViewDetails: (tripId: string) => void;
  language: Language;
  isLoggedIn: boolean;
  onNavigateToLogin: () => void;
  onToggleFavorite?: (tripId: string) => void; // Optional callback to sync with parent
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
    availability: 'Verfügbarkeit',
    seatsFree: 'Plätze frei',
    time: 'Zeit',
    duration: 'Dauer',
    company: 'Gesellschaft',
    price: 'Preis',
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
    availability: 'Availability',
    seatsFree: 'seats available',
    time: 'Time',
    duration: 'Duration',
    company: 'Company',
    price: 'Price',
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
    availability: 'التوفر',
    seatsFree: 'مقاعد متاحة',
    time: 'الوقت',
    duration: 'المدة',
    company: 'الشركة',
    price: 'السعر',
  },
};

export function Favorites({ favorites, onViewDetails, language, isLoggedIn, onNavigateToLogin, onToggleFavorite }: FavoritesProps) {
  const t = translations[language];
  
  // Helper to convert to Arabic numerals
  const toArabicNumerals = (num: string | number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
  };
  
  const [favoriteTrips, setFavoriteTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingTripId, setRemovingTripId] = useState<string | null>(null);
  const [removalError, setRemovalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const favs = await favoritesApi.getAll();
        
        // Format trips for display
        const formatted = favs.map((f: any) => ({
          id: String(f.trip_id),
          from: f.from_city,
          to: f.to_city,
          departureTime: formatTime(f.departure_time, language),
          arrivalTime: formatTime(f.arrival_time, language),
          duration: formatDuration(f.duration_minutes, language),
          price: f.price || 0,
          company: f.company_name || 'Unknown',
          seatsAvailable: f.seats_available,
        }));
        
        setFavoriteTrips(formatted);
      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        setError(err.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, language]);

  const handleRemoveFavorite = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!isLoggedIn) return;
    
    const tripIdNum = parseInt(tripId);
    if (isNaN(tripIdNum)) return;

    try {
      setRemovingTripId(tripId);
      setRemovalError(null);
      
      // Remove from backend
      await favoritesApi.remove(tripIdNum);
      
      // Update local state - remove trip from list immediately
      setFavoriteTrips(prev => prev.filter(trip => trip.id !== tripId));
      
      // Also update parent component's favorites list if callback is provided
      if (onToggleFavorite) {
        onToggleFavorite(tripId);
      }
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      setRemovalError(err.message || 'Failed to remove favorite');
      // Auto-hide error after 5 seconds
      setTimeout(() => setRemovalError(null), 5000);
    } finally {
      setRemovingTripId(null);
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-600 fill-current" />
          <h1 className="text-3xl text-gray-900">{t.favorites}</h1>
        </div>
        <p className="text-gray-600">
          {favoriteTrips.length} {favoriteTrips.length === 1 ? 'trip' : 'trips'} saved
        </p>
      </div>

      {/* Removal Error Toast */}
      {removalError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm">{removalError}</p>
          <button
            onClick={() => setRemovalError(null)}
            className="text-red-600 hover:text-red-800 ml-4"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

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
                <button
                  onClick={(e) => handleRemoveFavorite(trip.id, e)}
                  disabled={removingTripId === trip.id}
                  className="p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={t.remove}
                  title={t.remove}
                >
                  {removingTripId === trip.id ? (
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  ) : (
                    <Heart className="w-6 h-6 text-red-600 fill-current hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {t.time}
                  </div>
                  <span className="text-sm text-gray-900">
                    {trip.departureTime} - {trip.arrivalTime}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.duration}</span>
                  <span className="text-sm text-gray-900">{trip.duration}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{t.company}</span>
                  <span className="text-sm text-gray-900">{trip.company}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {t.price}
                  </div>
                  <span className="text-lg text-green-600">
                    {formatCurrency(trip.price, language, (trip as any).currency || 'SYP')}
                  </span>
                </div>
              </div>

              {/* Availability Badge */}
              <div className="bg-green-50 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">{t.availability}</span>
                  <span className="text-green-900">
                    {language === 'ar' ? toArabicNumerals(trip.seatsAvailable) : trip.seatsAvailable} {t.seatsFree}
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
