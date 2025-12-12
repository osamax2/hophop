import { useState } from 'react';
import { User as UserIcon, Phone, Mail, Calendar, Save, LogIn } from 'lucide-react';
import type { Language, User } from '../App';

interface UserProfileProps {
  user: User | null;
  language: Language;
  onNavigateToLogin: () => void;
  onUpdateUser: (user: User) => void;
}

const translations = {
  de: {
    profile: 'Mein Profil',
    personalData: 'Persönliche Daten',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefonnummer',
    birthDate: 'Geburtsdatum',
    gender: 'Geschlecht',
    male: 'Männlich',
    female: 'Weiblich',
    other: 'Andere',
    language: 'Sprache',
    saveProfile: 'Profil speichern',
    loginRequired: 'Anmeldung erforderlich',
    loginMessage: 'Melden Sie sich an, um Ihr Profil anzusehen und zu bearbeiten',
    loginButton: 'Jetzt anmelden',
    saved: 'Profil gespeichert!',
  },
  en: {
    profile: 'My Profile',
    personalData: 'Personal Data',
    name: 'Name',
    email: 'Email',
    phone: 'Phone Number',
    birthDate: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    language: 'Language',
    saveProfile: 'Save Profile',
    loginRequired: 'Login Required',
    loginMessage: 'Sign in to view and edit your profile',
    loginButton: 'Sign In Now',
    saved: 'Profile saved!',
  },
  ar: {
    profile: 'ملفي الشخصي',
    personalData: 'البيانات الشخصية',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    birthDate: 'تاريخ الميلاد',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    language: 'اللغة',
    saveProfile: 'حفظ الملف الشخصي',
    loginRequired: 'تسجيل الدخول مطلوب',
    loginMessage: 'سجل الدخول لعرض وتعديل ملفك الشخصي',
    loginButton: 'سجل الدخول الآن',
    saved: 'تم حفظ الملف الشخصي!',
  },
};

export function UserProfile({ user, language, onNavigateToLogin, onUpdateUser }: UserProfileProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: '',
    gender: '',
    language: user?.language || language,
  });
  const [showSaved, setShowSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdateUser({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        language: formData.language as Language,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }
  };

  if (!user) {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl text-gray-900">{t.profile}</h1>
        </div>
        <p className="text-gray-600">{user.email}</p>
      </div>

      {/* Success Message */}
      {showSaved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <Save className="w-5 h-5" />
            <span>{t.saved}</span>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl text-gray-900 mb-6">{t.personalData}</h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-1" />
              {t.name}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              {t.email}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              {t.phone}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {t.birthDate}
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              {t.gender}
            </label>
            <div className="flex gap-4">
              {['male', 'female', 'other'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t[option as keyof typeof t]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              {t.language}
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {t.saveProfile}
        </button>
      </form>
    </div>
  );
}
