import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, FileText, User, Lock, ArrowLeft } from 'lucide-react';
import type { Language } from '../App';

interface CompanyRegisterProps {
  language: Language;
  onBack: () => void;
}

const translations = {
  de: {
    registerAsCompany: 'Als Unternehmen registrieren',
    companyDetails: 'Unternehmensdaten',
    accountDetails: 'Kontodaten',
    companyName: 'Unternehmensname',
    companyEmail: 'Unternehmens-E-Mail',
    companyPhone: 'Unternehmens-Telefon',
    companyAddress: 'Unternehmensadresse',
    crNumber: 'Handelsregisternummer (CR)',
    companyDescription: 'Unternehmensbeschreibung',
    firstName: 'Vorname',
    lastName: 'Nachname',
    userEmail: 'Ihre E-Mail',
    userPhone: 'Ihre Telefonnummer',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    register: 'Registrieren',
    backToLogin: 'Zurück zum Login',
    required: 'Erforderlich',
    registering: 'Registrierung läuft...',
    registrationSuccess: 'Registrierung erfolgreich!',
    registrationSuccessMessage: 'Ihre Unternehmensregistrierung wurde eingereicht. Nach Prüfung durch einen Administrator wird Ihr Konto aktiviert.',
    backToLoginButton: 'Zum Login',
    companyNameRequired: 'Unternehmensname ist erforderlich',
    companyEmailRequired: 'Unternehmens-E-Mail ist erforderlich',
    companyPhoneRequired: 'Unternehmens-Telefon ist erforderlich',
    crNumberRequired: 'CR-Nummer ist erforderlich',
    firstNameRequired: 'Vorname ist erforderlich',
    lastNameRequired: 'Nachname ist erforderlich',
    userEmailRequired: 'E-Mail ist erforderlich',
    passwordRequired: 'Passwort ist erforderlich',
    passwordMismatch: 'Passwörter stimmen nicht überein',
    passwordTooShort: 'Passwort muss mindestens 6 Zeichen lang sein',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    crNumberTooShort: 'CR-Nummer muss mindestens 5 Zeichen lang sein',
    registrationFailed: 'Registrierung fehlgeschlagen',
    optional: 'Optional',
  },
  en: {
    registerAsCompany: 'Register as Company',
    companyDetails: 'Company Details',
    accountDetails: 'Account Details',
    companyName: 'Company Name',
    companyEmail: 'Company Email',
    companyPhone: 'Company Phone',
    companyAddress: 'Company Address',
    crNumber: 'Commercial Registration (CR) Number',
    companyDescription: 'Company Description',
    firstName: 'First Name',
    lastName: 'Last Name',
    userEmail: 'Your Email',
    userPhone: 'Your Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    register: 'Register',
    backToLogin: 'Back to Login',
    required: 'Required',
    registering: 'Registering...',
    registrationSuccess: 'Registration Successful!',
    registrationSuccessMessage: 'Your company registration has been submitted. Your account will be activated after admin approval.',
    backToLoginButton: 'Go to Login',
    companyNameRequired: 'Company name is required',
    companyEmailRequired: 'Company email is required',
    companyPhoneRequired: 'Company phone is required',
    crNumberRequired: 'CR number is required',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    userEmailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    invalidEmail: 'Invalid email address',
    crNumberTooShort: 'CR number must be at least 5 characters',
    registrationFailed: 'Registration failed',
    optional: 'Optional',
  },
  ar: {
    registerAsCompany: 'التسجيل كشركة',
    companyDetails: 'بيانات الشركة',
    accountDetails: 'بيانات الحساب',
    companyName: 'اسم الشركة',
    companyEmail: 'البريد الإلكتروني للشركة',
    companyPhone: 'هاتف الشركة',
    companyAddress: 'عنوان الشركة',
    crNumber: 'رقم السجل التجاري',
    companyDescription: 'وصف الشركة',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    userEmail: 'بريدك الإلكتروني',
    userPhone: 'رقم هاتفك',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    register: 'تسجيل',
    backToLogin: 'العودة لتسجيل الدخول',
    required: 'مطلوب',
    registering: 'جاري التسجيل...',
    registrationSuccess: 'تم التسجيل بنجاح!',
    registrationSuccessMessage: 'تم إرسال طلب تسجيل شركتك. سيتم تفعيل حسابك بعد موافقة المسؤول.',
    backToLoginButton: 'الذهاب لتسجيل الدخول',
    companyNameRequired: 'اسم الشركة مطلوب',
    companyEmailRequired: 'البريد الإلكتروني للشركة مطلوب',
    companyPhoneRequired: 'هاتف الشركة مطلوب',
    crNumberRequired: 'رقم السجل التجاري مطلوب',
    firstNameRequired: 'الاسم الأول مطلوب',
    lastNameRequired: 'الاسم الأخير مطلوب',
    userEmailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    invalidEmail: 'عنوان بريد إلكتروني غير صالح',
    crNumberTooShort: 'رقم السجل التجاري يجب أن يكون 5 أحرف على الأقل',
    registrationFailed: 'فشل التسجيل',
    optional: 'اختياري',
  },
};

export function CompanyRegister({ language, onBack }: CompanyRegisterProps) {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    cr_number: '',
    company_description: '',
    first_name: '',
    last_name: '',
    user_email: '',
    user_phone: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<any>({});

  const API_BASE = import.meta.env.VITE_API_BASE || "";

  const validateForm = () => {
    const newErrors: any = {};

    // Company fields
    if (!formData.company_name.trim()) newErrors.company_name = t.companyNameRequired;
    if (!formData.company_email.trim()) newErrors.company_email = t.companyEmailRequired;
    if (!formData.company_phone.trim()) newErrors.company_phone = t.companyPhoneRequired;
    if (!formData.cr_number.trim()) newErrors.cr_number = t.crNumberRequired;

    // User fields
    if (!formData.first_name.trim()) newErrors.first_name = t.firstNameRequired;
    if (!formData.last_name.trim()) newErrors.last_name = t.lastNameRequired;
    if (!formData.user_email.trim()) newErrors.user_email = t.userEmailRequired;
    if (!formData.password.trim()) newErrors.password = t.passwordRequired;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.company_email && !emailRegex.test(formData.company_email)) {
      newErrors.company_email = t.invalidEmail;
    }
    if (formData.user_email && !emailRegex.test(formData.user_email)) {
      newErrors.user_email = t.invalidEmail;
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t.passwordTooShort;
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = t.passwordMismatch;
    }

    // CR number validation
    if (formData.cr_number && formData.cr_number.length < 5) {
      newErrors.cr_number = t.crNumberTooShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/companies/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(t.registrationFailed + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t.registrationSuccess}
          </h2>
          <p className="text-gray-600 mb-6">
            {t.registrationSuccessMessage}
          </p>
          <button
            onClick={onBack}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t.backToLoginButton}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToLogin}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t.registerAsCompany}
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t.companyDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.companyName} *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.company_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.company_name && (
                  <span className="text-xs text-red-600">{errors.company_name}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.companyEmail} *
                </label>
                <input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.company_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.company_email && (
                  <span className="text-xs text-red-600">{errors.company_email}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.companyPhone} *
                </label>
                <input
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.company_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.company_phone && (
                  <span className="text-xs text-red-600">{errors.company_phone}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.crNumber} *
                </label>
                <input
                  type="text"
                  value={formData.cr_number}
                  onChange={(e) => setFormData({ ...formData, cr_number: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.cr_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cr_number && (
                  <span className="text-xs text-red-600">{errors.cr_number}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.companyAddress} ({t.optional})
                </label>
                <input
                  type="text"
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.companyDescription} ({t.optional})
                </label>
                <textarea
                  value={formData.company_description}
                  onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.accountDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.firstName} *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.first_name && (
                  <span className="text-xs text-red-600">{errors.first_name}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.lastName} *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.last_name && (
                  <span className="text-xs text-red-600">{errors.last_name}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.userEmail} *
                </label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.user_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.user_email && (
                  <span className="text-xs text-red-600">{errors.user_email}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.userPhone} ({t.optional})
                </label>
                <input
                  type="tel"
                  value={formData.user_phone}
                  onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.password} *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && (
                  <span className="text-xs text-red-600">{errors.password}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.confirmPassword} *
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirm_password && (
                  <span className="text-xs text-red-600">{errors.confirm_password}</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              {t.backToLogin}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.registering}
                </>
              ) : (
                t.register
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
