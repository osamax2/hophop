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
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  time: string;
  type?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const isRTL = language === 'ar';

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
    setSearchParams(params);
    setCurrentPage('search-results');
  };

  const handleViewDetails = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentPage('trip-details');
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
          />
        )}
        
        {currentPage === 'contact' && (
          <ContactForm 
            language={language}
            onClose={() => setCurrentPage('home')}
          />
        )}
        
        {currentPage === 'search-results' && searchParams && (
          <SearchResults
            searchParams={searchParams}
            onViewDetails={handleViewDetails}
            language={language}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            isLoggedIn={!!user}
          />
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
          />
        )}
      </main>
    </div>
  );
}