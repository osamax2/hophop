import { useState, useEffect } from 'react';
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
    // Validation messages
    passwordMinLength: 'Das Passwort muss mindestens 8 Zeichen lang sein',
    passwordUppercase: 'Das Passwort muss mindestens einen Großbuchstaben enthalten',
    passwordLowercase: 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten',
    passwordNumber: 'Das Passwort muss mindestens eine Zahl enthalten',
    passwordSpecial: 'Das Passwort muss mindestens ein Sonderzeichen enthalten',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse mit @ und .com ein',
    ageRestriction: 'Sie müssen mindestens 18 Jahre alt sein, um ein Konto zu erstellen',
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
    // Validation messages
    passwordMinLength: 'Password must be at least 8 characters long',
    passwordUppercase: 'Password must contain at least one uppercase letter',
    passwordLowercase: 'Password must contain at least one lowercase letter',
    passwordNumber: 'Password must contain at least one number',
    passwordSpecial: 'Password must contain at least one special character',
    invalidEmail: 'Please enter a valid email address containing @ and .com',
    ageRestriction: 'You must be at least 18 years old to create an account',
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
    // Validation messages
    passwordMinLength: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    passwordUppercase: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل',
    passwordLowercase: 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل',
    passwordNumber: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
    passwordSpecial: 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح يحتوي على @ و .com',
    ageRestriction: 'يجب أن يكون عمرك 18 عامًا على الأقل لإنشاء حساب',
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  // Update formData.language when language prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, language }));
  }, [language]);

  // Convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  // Format date for display based on language
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    if (language === 'ar') {
      // Convert date to Arabic format with Arabic numerals
      const [year, month, day] = dateStr.split('-');
      return `${toArabicNumerals(day)}/${toArabicNumerals(month)}/${toArabicNumerals(year)}`;
    }
    return dateStr;
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    // Must contain @ and .com
    if (!email.includes('@')) return false;
    if (!email.includes('.com')) return false;
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push(t.passwordMinLength);
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t.passwordUppercase);
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t.passwordLowercase);
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t.passwordNumber);
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(t.passwordSpecial);
    }
    return errors;
  };

  const validateAge = (birthDate: string): boolean => {
    if (!birthDate) return true; // Optional field
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation for registration
    if (!isLogin) {
      const newErrors: { [key: string]: string } = {};

      // Email validation
      if (!validateEmail(formData.email)) {
        newErrors.email = t.invalidEmail;
      }

      // Password validation
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join('. ');
      }

      // Age validation
      if (formData.birthDate && !validateAge(formData.birthDate)) {
        newErrors.birthDate = t.ageRestriction;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    } else {
      // Email validation for login
      if (!validateEmail(formData.email)) {
        setErrors({ email: t.invalidEmail });
        return;
      }
    }

    try {
      const url = isLogin
        ? `${API_BASE}/api/auth/login`
        : `${API_BASE}/api/auth/register`;


      // ملاحظة: عدّل أسماء الحقول إذا باك-إندك مختلف (مثلاً full_name بدل name)
      const payload: any = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            language: formData.language,
            birthDate: formData.birthDate || null,
            gender: formData.gender || null,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if response is ok and has content
      if (!res.ok) {
        let errorMessage = "Login/Register failed";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData?.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (err) {
          console.error('Error parsing error response:', err);
        }
        alert(errorMessage);
        return;
      }

      // Parse JSON response only if response is ok
      let data;
      try {
        const responseText = await res.text();
        if (!responseText) {
          alert("Empty response from server");
          return;
        }
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Error parsing JSON response:', err);
        alert("Invalid response from server");
        return;
      }

      // ✅ خزّن JWT الحقيقي
      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        alert("No token returned from server");
        return;
      }

      // ✅ جيب بيانات المستخدم من /api/auth/me
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: "Bearer " + data.token },
      });
      
      if (!meRes.ok) {
        console.error('Failed to fetch user data:', meRes.status, meRes.statusText);
        const errorText = await meRes.text();
        console.error('Error response:', errorText);
        alert("Failed to fetch user data. Please try logging in again.");
        return;
      }
      
      let meData;
      try {
        const meText = await meRes.text();
        console.log("Raw response text:", meText);
        if (meText) {
          meData = JSON.parse(meText);
        } else {
          console.error("Empty response from /api/auth/me");
          alert("Empty response from server. Please try again.");
          return;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        alert("Error parsing user data. Please try again.");
        return;
      }

      // Debug: Log the response to see what we're getting
      console.log("API /api/auth/me response:", meData);
      console.log("API /api/auth/me user:", meData?.user);
      console.log("API /api/auth/me roles:", meData?.user?.roles);
      console.log("API /api/auth/me roles type:", typeof meData?.user?.roles);
      console.log("API /api/auth/me roles is array?", Array.isArray(meData?.user?.roles));

      // تحديد الدور - endpoint /api/auth/me يعيد { user: { role: "...", roles: [...] } }
      const userData = meData?.user || meData;
      
      // استخدام role مباشرة من user object (backend يحسبه من roles array)
      let userRole = userData?.role || "user";
      
      // إذا لم يكن role موجوداً، احسبه من roles array
      if (!userData?.role && Array.isArray(userData?.roles) && userData.roles.length > 0) {
        console.log("No role found, calculating from roles array:", userData.roles);
        const roleNames = userData.roles.map((r: any) => {
          if (typeof r === 'string') return r.toLowerCase();
          if (r && typeof r === 'object') return (r.name || r.role || '').toLowerCase();
          return '';
        }).filter(Boolean);
        
        console.log("Role names (lowercase):", roleNames);
        
        if (roleNames.includes('administrator') || roleNames.includes('admin')) {
          userRole = "admin";
          console.log("Role set to admin from roles array");
        } else if (roleNames.includes('agent')) {
          userRole = "agent";
          console.log("Role set to agent from roles array");
        }
      }
      
      console.log("Final detected role:", userRole);
      
      const userDataFinal = meData?.user || meData;
      const userObj: UserType = {
        id: String(userDataFinal?.id ?? meData?.id ?? "1"),
        name: (userDataFinal?.name ?? meData?.name ?? formData.name) || "User",
        email: userDataFinal?.email ?? meData?.email ?? formData.email,
        phone: userDataFinal?.phone ?? meData?.phone ?? formData.phone ?? "",
        role: userRole as any,
        language: formData.language as Language,
      };
      
      console.log("User object being set:", userObj);

      onLogin(userObj);
    } catch (err: any) {
      console.error(err);
      alert("Something went wrong. Check console.");
    }
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
                  {language === 'ar' ? (
                    // Arabic date with dropdowns and Arabic numerals
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2" dir="rtl">
                        {/* Day */}
                        <select
                          value={formData.birthDate ? new Date(formData.birthDate).getDate() : ''}
                          onChange={(e) => {
                            const day = e.target.value;
                            const currentDate = formData.birthDate ? new Date(formData.birthDate) : new Date();
                            currentDate.setDate(parseInt(day) || 1);
                            const newDate = currentDate.toISOString().split('T')[0];
                            setFormData({ ...formData, birthDate: newDate });
                            if (newDate && !validateAge(newDate)) {
                              setErrors({ ...errors, birthDate: translations[language].ageRestriction });
                            } else {
                              const newErrors = { ...errors };
                              delete newErrors.birthDate;
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                            errors.birthDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">يوم</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{toArabicNumerals(day)}</option>
                          ))}
                        </select>
                        
                        {/* Month */}
                        <select
                          value={formData.birthDate ? new Date(formData.birthDate).getMonth() + 1 : ''}
                          onChange={(e) => {
                            const month = e.target.value;
                            const currentDate = formData.birthDate ? new Date(formData.birthDate) : new Date();
                            currentDate.setMonth(parseInt(month) - 1 || 0);
                            const newDate = currentDate.toISOString().split('T')[0];
                            setFormData({ ...formData, birthDate: newDate });
                            if (newDate && !validateAge(newDate)) {
                              setErrors({ ...errors, birthDate: translations[language].ageRestriction });
                            } else {
                              const newErrors = { ...errors };
                              delete newErrors.birthDate;
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                            errors.birthDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">شهر</option>
                          {[
                            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                          ].map((month, idx) => (
                            <option key={idx + 1} value={idx + 1}>{month}</option>
                          ))}
                        </select>
                        
                        {/* Year */}
                        <select
                          value={formData.birthDate ? new Date(formData.birthDate).getFullYear() : ''}
                          onChange={(e) => {
                            const year = e.target.value;
                            const currentDate = formData.birthDate ? new Date(formData.birthDate) : new Date();
                            currentDate.setFullYear(parseInt(year) || 2000);
                            const newDate = currentDate.toISOString().split('T')[0];
                            setFormData({ ...formData, birthDate: newDate });
                            if (newDate && !validateAge(newDate)) {
                              setErrors({ ...errors, birthDate: translations[language].ageRestriction });
                            } else {
                              const newErrors = { ...errors };
                              delete newErrors.birthDate;
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                            errors.birthDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">سنة</option>
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i).map(year => (
                            <option key={year} value={year}>{toArabicNumerals(year)}</option>
                          ))}
                        </select>
                      </div>
                      {formData.birthDate && (
                        <div className="text-sm text-gray-600 text-right">
                          {formatDateForDisplay(formData.birthDate)}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Standard date input for non-Arabic languages
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => {
                        const newBirthDate = e.target.value;
                        setFormData({ ...formData, birthDate: newBirthDate });
                        
                        // Validate age immediately when date changes
                        if (newBirthDate && !validateAge(newBirthDate)) {
                          setErrors({ ...errors, birthDate: translations[language].ageRestriction });
                        } else {
                          // Clear error if age is valid
                          const newErrors = { ...errors };
                          delete newErrors.birthDate;
                          setErrors(newErrors);
                        }
                      }}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                        errors.birthDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">{t.gender}</label>
                  <div className="flex gap-4">
                    {['male', 'female'].map(option => (
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
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setFormData({ ...formData, email: newEmail });
                  
                  // Validate email immediately when it changes
                  if (newEmail && !validateEmail(newEmail)) {
                    setErrors({ ...errors, email: translations[language].invalidEmail });
                  } else {
                    // Clear error if email is valid or empty
                    const newErrors = { ...errors };
                    delete newErrors.email;
                    setErrors(newErrors);
                  }
                }}
                onBlur={(e) => {
                  // Also validate on blur
                  if (e.target.value && !validateEmail(e.target.value)) {
                    setErrors({ ...errors, email: translations[language].invalidEmail });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {!isLogin && (
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
                  required={!isLogin}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                {t.password}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {!isLogin && formData.password && (
                <div className="mt-2 text-xs text-gray-600">
                  <p className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    • {t.passwordMinLength}
                  </p>
                  <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                    • {t.passwordUppercase}
                  </p>
                  <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                    • {t.passwordLowercase}
                  </p>
                  <p className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                    • {t.passwordNumber}
                  </p>
                  <p className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                    • {t.passwordSpecial}
                  </p>
                </div>
              )}
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
