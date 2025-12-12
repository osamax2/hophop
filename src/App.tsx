import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { SearchResults } from './components/SearchResults';
import { TripDetails } from './components/TripDetails';
import { Favorites } from './components/Favorites';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginRegister } from './components/LoginRegister';
import { Reviews } from './components/Reviews';

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

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentPage('search-results');
  };

  const handleViewDetails = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentPage('trip-details');
  };

  const toggleFavorite = (tripId: string) => {
    setFavorites(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
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
          <HomePage onSearch={handleSearch} language={language} />
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