import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { SearchResults } from './components/SearchResults';
import { TripDetails } from './components/TripDetails';
import { Favorites } from './components/Favorites';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginRegister } from './components/LoginRegister';
import { Reviews } from './components/Reviews';
import { ContactForm } from './components/ContactForm';
import VerifyEmail from './components/VerifyEmail';
import { BookingStatus } from './components/BookingStatus';
import SubscriptionPlans from './components/SubscriptionPlans';
import { RoundTripBooking } from './components/RoundTripBooking';
import { MyBookings } from './components/MyBookings';
import { favoritesApi } from './lib/api';

export type Language = 'de' | 'ar' | 'en';
export type UserRole = 'visitor' | 'user' | 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: Language;
  company_id?: number;
  company_name?: string;
  agent_type?: string;
  agent_type_name?: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  time: string;
  type?: string;
  returnDate?: string;
  isRoundTrip?: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [roundTripIds, setRoundTripIds] = useState<{ outbound: string; return: string } | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [bookingStatusToken, setBookingStatusToken] = useState<string | null>(null);
  const [showNoTripsModal, setShowNoTripsModal] = useState(false);

  const isRTL = language === 'ar';

  // Initialize page state from URL on load
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (path === '/verify-email') {
      setVerifyToken(urlParams.get('token'));
      setCurrentPage('verify-email');
    } else if (path.startsWith('/booking-status/')) {
      const token = path.split('/booking-status/')[1];
      setBookingStatusToken(token);
      setCurrentPage('booking-status');
    } else if (path.startsWith('/trip/')) {
      const tripId = path.split('/trip/')[1];
      setSelectedTripId(tripId);
      setCurrentPage('trip-details');
    } else if (path === '/favorites') {
      setCurrentPage('favorites');
    } else if (path === '/profile') {
      setCurrentPage('profile');
    } else if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/subscriptions') {
      setCurrentPage('subscriptions');
    } else if (path === '/search') {
      const from = urlParams.get('from') || '';
      const to = urlParams.get('to') || '';
      const date = urlParams.get('date') || '';
      const time = urlParams.get('time') || '';
      if (from || to || date) {
        setSearchParams({ from, to, date, time });
        setCurrentPage('search-results');
      }
    }
  }, []);

  // Update URL when page changes
  useEffect(() => {
    let url = '/';
    
    switch (currentPage) {
      case 'trip-details':
        if (selectedTripId) {
          url = `/trip/${selectedTripId}`;
        }
        break;
      case 'search-results':
        if (searchParams) {
          const params = new URLSearchParams();
          if (searchParams.from) params.set('from', searchParams.from);
          if (searchParams.to) params.set('to', searchParams.to);
          if (searchParams.date) params.set('date', searchParams.date);
          if (searchParams.time) params.set('time', searchParams.time);
          url = `/search?${params.toString()}`;
        }
        break;
      case 'favorites':
        url = '/favorites';
        break;
      case 'profile':
        url = '/profile';
        break;
      case 'admin':
        url = '/admin';
        break;
      case 'subscriptions':
        url = '/subscriptions';
        break;
      case 'verify-email':
        if (verifyToken) {
          url = `/verify-email?token=${verifyToken}`;
        }
        break;
      case 'booking-status':
        if (bookingStatusToken) {
          url = `/booking-status/${bookingStatusToken}`;
        }
        break;
      default:
        url = '/';
    }
    
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, '', url);
    }
  }, [currentPage, selectedTripId, searchParams, verifyToken, bookingStatusToken]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      if (path === '/verify-email') {
        setVerifyToken(urlParams.get('token'));
        setCurrentPage('verify-email');
      } else if (path.startsWith('/booking-status/')) {
        const token = path.split('/booking-status/')[1];
        setBookingStatusToken(token);
        setCurrentPage('booking-status');
      } else if (path.startsWith('/trip/')) {
        const tripId = path.split('/trip/')[1];
        setSelectedTripId(tripId);
        setCurrentPage('trip-details');
      } else if (path === '/favorites') {
        setCurrentPage('favorites');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/subscriptions') {
        setCurrentPage('subscriptions');
      } else if (path === '/search') {
        const from = urlParams.get('from') || '';
        const to = urlParams.get('to') || '';
        const date = urlParams.get('date') || '';
        const time = urlParams.get('time') || '';
        if (from || to || date) {
          setSearchParams({ from, to, date, time });
          setCurrentPage('search-results');
        } else {
          setCurrentPage('home');
        }
      } else {
        setCurrentPage('home');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-login on page load if token exists
  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const API_BASE = import.meta.env.VITE_API_BASE || "";
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.ok) {
          const meData = await meRes.json();
          const userData = meData?.user || meData;
          const userRole = userData?.role ?? "user";
          
          const userObj: User = {
            id: String(userData?.id ?? "1"),
            name: userData?.name ?? "",
            email: userData?.email ?? "",
            phone: userData?.phone ?? "",
            role: userRole as UserRole,
            language: (userData?.language ?? 'ar') as Language,
            company_id: userData?.company_id,
            company_name: userData?.company_name,
            agent_type: userData?.agent_type,
            agent_type_name: userData?.agent_type_name,
          };
          
          setUser(userObj);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auto-login failed:", err);
        localStorage.removeItem("token");
      }
    };

    autoLogin();
  }, []);

  const handleSearch = (params: SearchParams) => {
    console.log('handleSearch called with params:', params);
    console.log('isRoundTrip type:', typeof params.isRoundTrip, 'value:', params.isRoundTrip);
    console.log('returnDate:', params.returnDate);
    setSearchParams(params);
    setCurrentPage('search-results');
    setShowNoTripsModal(false);
    console.log('Current page set to search-results');
  };

  const handleNoTripsFound = () => {
    console.log('handleNoTripsFound called, showing modal');
    console.log('Current page before:', currentPage);
    // عرض النافذة مباشرة دون تغيير الصفحة
    setShowNoTripsModal(true);
    // العودة إلى الصفحة الرئيسية بعد عرض النافذة
    setTimeout(() => {
      setCurrentPage('home');
    }, 100);
  };

  const handleViewDetails = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentPage('trip-details');
  }

  const handleBookRoundTrip = (outboundTripId: string, returnTripId: string) => {
    setRoundTripIds({ outbound: outboundTripId, return: returnTripId });
    setCurrentPage('round-trip-booking');
  }

  const handleRoundTripBookingComplete = (tokens: { outbound: string; return: string }) => {
    console.log('Round trip booked successfully:', tokens);
    alert('Both trips booked successfully!');
    setCurrentPage('home');
  };

  const handleNavigateToBookingStatus = (token: string) => {
    setBookingStatusToken(token);
    setCurrentPage('booking-status');
  };

  // Load favorites when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }

      try {
        const favs = await favoritesApi.getAll();
        setFavorites(favs.map((f: any) => String(f.trip_id)));
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (tripId: string) => {
    if (!user) return;

    const tripIdNum = parseInt(tripId);
    if (isNaN(tripIdNum)) return;

    try {
      const isFavorite = favorites.includes(tripId);
      if (isFavorite) {
        await favoritesApi.remove(tripIdNum);
        setFavorites(prev => prev.filter(id => id !== tripId));
      } else {
        await favoritesApi.add(tripIdNum);
        setFavorites(prev => [...prev, tripId]);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      alert(err.message || 'Failed to update favorite');
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Redirect admin users to admin dashboard, others to home
    if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    setCurrentPage('home');
    localStorage.removeItem("token");
  };

  // Debug: Log current page and search params
  useEffect(() => {
    console.log('App state changed - currentPage:', currentPage, 'searchParams:', searchParams, 'showNoTripsModal:', showNoTripsModal);
  }, [currentPage, searchParams, showNoTripsModal]);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="pb-8">
        {currentPage === 'home' && (
          <HomePage 
            onSearch={handleSearch} 
            language={language}
            onContactClick={() => setCurrentPage('contact')}
            searchParams={searchParams}
          />
        )}
        
        {currentPage === 'contact' && (
          <ContactForm 
            language={language}
            onClose={() => setCurrentPage('home')}
          />
        )}
        
        {currentPage === 'search-results' && searchParams && (
          <>
            {console.log('Rendering SearchResults component')}
            {console.log('searchParams being passed:', searchParams)}
            {console.log('searchParams.isRoundTrip:', searchParams.isRoundTrip, 'type:', typeof searchParams.isRoundTrip)}
            {console.log('searchParams.returnDate:', searchParams.returnDate)}
            <SearchResults
              searchParams={searchParams}
              onViewDetails={handleViewDetails}
              onBookRoundTrip={handleBookRoundTrip}
              language={language}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              isLoggedIn={!!user}
              onNoTripsFound={handleNoTripsFound}
            />
          </>
        )}
        
        {currentPage === 'trip-details' && selectedTripId && (
          <TripDetails
            tripId={selectedTripId}
            language={language}
            isFavorite={favorites.includes(selectedTripId)}
            onToggleFavorite={toggleFavorite}
            isLoggedIn={!!user}
          />
        )}
        
        {currentPage === 'favorites' && (
          <Favorites
            favorites={favorites}
            onViewDetails={handleViewDetails}
            language={language}
            isLoggedIn={!!user}
            onNavigateToLogin={() => setCurrentPage('login')}
          />
        )}
        
        {currentPage === 'profile' && (
          <UserProfile
            user={user}
            language={language}
            onNavigateToLogin={() => setCurrentPage('login')}
            onUpdateUser={setUser}
          />
        )}
        
        {currentPage === 'admin' && (
          <AdminDashboard
            user={user}
            language={language}
          />
        )}
        
        {currentPage === 'subscriptions' && (
          <SubscriptionPlans />
        )}
        
        {currentPage === 'login' && (
          <LoginRegister
            onLogin={handleLogin}
            language={language}
          />
        )}
        
        {currentPage === 'reviews' && (
          <Reviews
            language={language}
            isLoggedIn={!!user}
            user={user}
          />
        )}
        
        {currentPage === 'booking-status' && bookingStatusToken && (
          <BookingStatus
            token={bookingStatusToken}
            language={language}
          />
        )}

        {currentPage === 'verify-email' && (
          <VerifyEmailWrapper 
            token={verifyToken}
            onVerified={(token) => {
              if (token) {
                localStorage.setItem('token', token);
              }
              // Clear URL and redirect to home
              window.history.replaceState({}, '', '/');
              setCurrentPage('home');
              window.location.reload();
            }}
            onNavigateToLogin={() => {
              window.history.replaceState({}, '', '/');
              setCurrentPage('login');
            }}
          />
        )}

        {currentPage === 'round-trip-booking' && roundTripIds && (
          <RoundTripBooking
            outboundTripId={roundTripIds.outbound}
            returnTripId={roundTripIds.return}
            language={language}
            isLoggedIn={!!user}
            onNavigateToLogin={() => setCurrentPage('login')}
            onBookingComplete={handleRoundTripBookingComplete}
          />
        )}

        {currentPage === 'bookings' && (
          <MyBookings
            language={language}
            isLoggedIn={!!user}
            user={user}
            onNavigateToLogin={() => setCurrentPage('login')}
            onNavigateToBookingStatus={handleNavigateToBookingStatus}
          />
        )}
      </main>

      {/* No Trips Modal */}
      {showNoTripsModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={() => {
            console.log('Modal backdrop clicked, closing modal');
            setShowNoTripsModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
            style={{ zIndex: 10000 }}
            onClick={(e) => {
              console.log('Modal content clicked');
              e.stopPropagation();
            }}
          >
            {console.log('Modal content rendering')}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar'
                  ? 'لا توجد رحلات في هذا التاريخ'
                  : language === 'de'
                  ? 'Keine Fahrten an diesem Datum verfügbar'
                  : 'No trips available on this date'}
              </h3>
              <p className={`text-gray-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar'
                  ? 'جرب معايير بحث مختلفة'
                  : language === 'de'
                  ? 'Versuchen Sie andere Suchkriterien'
                  : 'Try different search criteria'}
              </p>
            </div>
            <button
              onClick={() => setShowNoTripsModal(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition-colors font-medium"
            >
              {language === 'ar' ? 'إغلاق' : language === 'de' ? 'Schließen' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component for VerifyEmail to handle navigation without react-router
function VerifyEmailWrapper({ 
  token, 
  onVerified, 
  onNavigateToLogin 
}: { 
  token: string | null;
  onVerified: (token?: string) => void;
  onNavigateToLogin: () => void;
}) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('Kein Verifizierungstoken gefunden.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const response = await fetch(`${API_BASE}/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'E-Mail erfolgreich verifiziert!');
          
          if (data.token) {
            setJwtToken(data.token);
            // Auto redirect after 3 seconds
            setTimeout(() => {
              onVerified(data.token);
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verifizierung fehlgeschlagen.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    };

    verifyEmail();
  }, [token, onVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
          <div className="text-4xl mb-2">🚌</div>
          <h1 className="text-2xl font-bold text-white">HopHop</h1>
        </div>
        
        <div className="p-6 text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✗</span>
              </div>
            )}
            {status === 'no-token' && (
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠</span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-2">
            {status === 'loading' && 'E-Mail wird verifiziert...'}
            {status === 'success' && 'Erfolgreich verifiziert! 🎉'}
            {status === 'error' && 'Verifizierung fehlgeschlagen'}
            {status === 'no-token' && 'Fehlender Token'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'success' && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Sie werden in wenigen Sekunden automatisch weitergeleitet...
              </p>
              <button 
                onClick={() => onVerified(jwtToken || undefined)}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700"
              >
                Jetzt zur Startseite →
              </button>
            </>
          )}
          
          {(status === 'error' || status === 'no-token') && (
            <button 
              onClick={onNavigateToLogin}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Zur Anmeldeseite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}