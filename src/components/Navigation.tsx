import { Menu, X, Globe, User, LogOut, Home, Search, Calendar, Star, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import type { Language, User as UserType } from '../App';
import logo from 'figma:asset/4dddb73877b28322b7848adc27f0f948198765ae.png';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: UserType | null;
  onLogout: () => void;
}

const translations = {
  de: {
    home: 'Startseite',
    search: 'Fahrten suchen',
    schedules: 'Fahrpläne',
    companies: 'Busgesellschaften',
    reviews: 'Bewertungen',
    favorites: 'Favoriten',
    profile: 'Profil',
    login: 'Anmelden',
    admin: 'Admin-Bereich',
    logout: 'Abmelden',
  },
  en: {
    home: 'Home',
    search: 'Search Trips',
    schedules: 'Schedules',
    companies: 'Bus Companies',
    reviews: 'Reviews',
    favorites: 'Favorites',
    profile: 'Profile',
    login: 'Login',
    admin: 'Admin',
    logout: 'Logout',
  },
  ar: {
    home: 'الصفحة الرئيسية',
    search: 'البحث عن رحلات',
    schedules: 'جداول المواعيد',
    companies: 'شركات الباصات',
    reviews: 'التقييمات',
    favorites: 'المفضلة',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    admin: 'لوحة الإدارة',
    logout: 'تسجيل الخروج',
  },
};

export function Navigation({ currentPage, setCurrentPage, language, setLanguage, user, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const t = translations[language];

  const menuItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'search-results', label: t.search, icon: Search },
    { id: 'reviews', label: t.reviews, icon: Star },
    { id: 'favorites', label: t.favorites, icon: Star },
  ];

  if (user?.role === 'admin' || user?.role === 'agent') {
    menuItems.push({ id: 'admin', label: t.admin, icon: BarChart3 });
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{language}</span>
              </button>
              
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  {(['de', 'en', 'ar'] as Language[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        language === lang ? 'bg-green-50 text-green-600' : 'text-gray-700'
                      }`}
                    >
                      {lang === 'de' ? 'Deutsch' : lang === 'en' ? 'English' : 'العربية'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <User className="w-4 h-4" />
                {t.login}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}