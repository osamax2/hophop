import { Menu, X, Globe, User, LogOut, Home, Search, Calendar, Star, BarChart3, CreditCard, Ticket } from 'lucide-react';
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
    bookings: 'Meine Buchungen',
    profile: 'Profil',
    login: 'Anmelden',
    admin: 'Admin-Bereich',
    subscriptions: 'Abonnements',
    logout: 'Abmelden',
  },
  en: {
    home: 'Home',
    search: 'Search Trips',
    schedules: 'Schedules',
    companies: 'Bus Companies',
    reviews: 'Reviews',
    favorites: 'Favorites',
    bookings: 'My Bookings',
    profile: 'Profile',
    login: 'Login',
    admin: 'Admin',
    subscriptions: 'Subscriptions',
    logout: 'Logout',
  },
  ar: {
    home: 'الصفحة الرئيسية',
    search: 'البحث عن رحلات',
    schedules: 'جداول المواعيد',
    companies: 'شركات الباصات',
    reviews: 'التقييمات',
    favorites: 'المفضلة',
    bookings: 'حجوزاتي',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    admin: 'لوحة الإدارة',
    subscriptions: 'الاشتراكات',
    logout: 'تسجيل الخروج',
  },
};

export function Navigation({ currentPage, setCurrentPage, language, setLanguage, user, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const t = translations[language];
  const isRTL = language === 'ar';

  // Debug: Log user role
  console.log("Navigation - User object:", user);
  console.log("Navigation - User role:", user?.role);

  const menuItems = [
    { id: 'reviews', label: t.reviews, icon: Star },
    { id: 'favorites', label: t.favorites, icon: Star },
    { id: 'bookings', label: t.bookings, icon: Ticket },
    { id: 'home', label: t.home, icon: Home },
  ];

  if (user?.role === 'admin' || user?.role === 'agent') {
    console.log("Adding admin menu item");
    menuItems.push({ id: 'admin', label: t.admin, icon: BarChart3 });
    menuItems.push({ id: 'subscriptions', label: t.subscriptions, icon: CreditCard });
  } else {
    console.log("NOT adding admin menu item - role is:", user?.role);
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center h-16 gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Order in code: Logo, Menu, Language, Login */}
          {/* With flex-row-reverse in RTL, displays as: Login, Language, Menu, Logo (right to left) */}
          
          {/* Logo - First in code, appears leftmost in RTL (last visually) */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </button>
          </div>

          {/* Spacer - Left side */}
          <div className="flex-1"></div>

          {/* Desktop Menu Items - Home, Favorites, Reviews - Centered */}
          <div className="hidden md:flex items-center gap-4">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'gap-2'} px-3 py-2 rounded-lg transition-colors ${
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

          {/* Spacer - Right side */}
          <div className="flex-1"></div>

          {/* Language Selector */}
          <div className={`relative ${isRTL ? 'mr-6' : 'ml-6'}`}>
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'gap-2'} px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>
            
            {languageMenuOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50`}>
                {(['de', 'en', 'ar'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLanguageMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 ${isRTL ? 'text-right' : 'text-left'} hover:bg-gray-50 transition-colors ${
                      language === lang ? 'bg-green-50 text-green-600' : 'text-gray-700'
                    }`}
                  >
                    {lang === 'de' ? 'Deutsch' : lang === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login/User Menu - Last in code, appears rightmost in RTL (first visually) */}
          {user ? (
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'gap-2'} px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </button>
              <button
                onClick={onLogout}
                className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'gap-2'} px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600 transition-colors`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className={`flex items-center ${isRTL ? 'flex-row-reverse gap-2' : 'gap-2'} px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${isRTL ? 'text-sm md:text-base' : ''}`}
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
                  className={`w-full flex items-center ${isRTL ? 'flex-row-reverse gap-3' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
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