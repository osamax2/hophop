import { useState } from 'react';
import { User, Mail, Phone, Lock, Calendar, Globe } from 'lucide-react';
import type { Language, User as UserType } from '../App';

interface LoginRegisterProps {
  onLogin: (user: UserType) => void;
  language: Language;
}

const translations = {
  de: {
    login: 'Anmelden',
    register: 'Registrieren',
    email: 'E-Mail',
    phone: 'Telefonnummer',
    password: 'Passwort',
    loginButton: 'Anmelden',
    registerButton: 'Konto erstellen',
    noAccount: 'Noch kein Konto?',
    hasAccount: 'Bereits ein Konto?',
    switchToRegister: 'Jetzt registrieren',
    switchToLogin: 'Zur Anmeldung',
    name: 'Name',
    birthDate: 'Geburtsdatum',
    gender: 'Geschlecht',
    male: 'Männlich',
    female: 'Weiblich',
    other: 'Andere',
    selectLanguage: 'Sprache auswählen',
    orLoginWith: 'Oder anmelden mit',
    whatsapp: 'WhatsApp',
  },
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    phone: 'Phone Number',
    password: 'Password',
    loginButton: 'Sign In',
    registerButton: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    switchToRegister: 'Register now',
    switchToLogin: 'Sign in',
    name: 'Name',
    birthDate: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    selectLanguage: 'Select Language',
    orLoginWith: 'Or sign in with',
    whatsapp: 'WhatsApp',
  },
  ar: {
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    registerButton: 'إنشاء حساب',
    noAccount: 'لا تملك حسابًا؟',
    hasAccount: 'لديك حساب بالفعل؟',
    switchToRegister: 'سجل الآن',
    switchToLogin: 'تسجيل الدخول',
    name: 'الاسم',
    birthDate: 'تاريخ الميلاد',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    selectLanguage: 'اختر اللغة',
    orLoginWith: 'أو سجل الدخول باستخدام',
    whatsapp: 'واتساب',
  },
};

export function LoginRegister({ onLogin, language }: LoginRegisterProps) {
  const t = translations[language];
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    birthDate: '',
    gender: '',
    language: language,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login/register - in real app, this would call an API
    const user: UserType = {
      id: '1',
      name: formData.name || 'Test User',
      email: formData.email,
      phone: formData.phone,
      role: 'user',
      language: formData.language as Language,
    };
    
    onLogin(user);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-2">
              {isLogin ? t.login : t.register}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    {t.name}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required={!isLogin}
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
                  <label className="block text-sm text-gray-700 mb-2">{t.gender}</label>
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
                    <Globe className="w-4 h-4 inline mr-1" />
                    {t.selectLanguage}
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
              </>
            )}

            {/* Email or Phone */}
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

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                {t.password}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isLogin ? t.loginButton : t.registerButton}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t.orLoginWith}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Phone className="w-5 h-5 text-green-600" />
              {t.whatsapp}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              {isLogin ? t.noAccount : t.hasAccount}
            </span>
            {' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:text-green-700"
            >
              {isLogin ? t.switchToRegister : t.switchToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
