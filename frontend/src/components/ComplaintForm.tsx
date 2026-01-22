import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from 'lucide-react';

interface ComplaintFormProps {
  language: 'de' | 'en' | 'ar';
  onBack: () => void;
  user?: { id: string; name: string; email: string } | null;
}

const translations = {
  ar: {
    title: 'رفع شكوى',
    subtitle: 'يمكنك تقديم شكوى من أي جهة على أي جهة',
    back: 'رجوع',
    complainerType: 'نوع المُشتكي',
    passenger: 'راكب',
    driver: 'سائق',
    company: 'شركة',
    admin: 'إدارة',
    againstType: 'الشكوى ضد',
    yourName: 'اسمك',
    yourEmail: 'بريدك الإلكتروني',
    yourPhone: 'رقم هاتفك',
    subject: 'موضوع الشكوى',
    description: 'تفاصيل الشكوى',
    tripDate: 'تاريخ الرحلة (اختياري)',
    tripRoute: 'مسار الرحلة (اختياري)',
    submit: 'إرسال الشكوى',
    submitting: 'جاري الإرسال...',
    success: 'تم إرسال شكواك بنجاح',
    successMessage: 'سنقوم بمراجعة شكواك والرد عليك في أقرب وقت ممكن.',
    error: 'حدث خطأ أثناء إرسال الشكوى',
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'البريد الإلكتروني غير صالح',
    subjectPlaceholder: 'اكتب موضوع الشكوى',
    descriptionPlaceholder: 'اكتب تفاصيل الشكوى بشكل واضح ومفصل',
    routePlaceholder: 'مثال: دمشق - حلب',
    complaintNumber: 'رقم الشكوى',
    newComplaint: 'تقديم شكوى جديدة',
  },
  de: {
    title: 'Beschwerde einreichen',
    subtitle: 'Sie können eine Beschwerde von jeder Partei gegen jede Partei einreichen',
    back: 'Zurück',
    complainerType: 'Beschwerdeführer-Typ',
    passenger: 'Fahrgast',
    driver: 'Fahrer',
    company: 'Unternehmen',
    admin: 'Verwaltung',
    againstType: 'Beschwerde gegen',
    yourName: 'Ihr Name',
    yourEmail: 'Ihre E-Mail',
    yourPhone: 'Ihre Telefonnummer',
    subject: 'Betreff',
    description: 'Beschreibung',
    tripDate: 'Reisedatum (optional)',
    tripRoute: 'Reiseroute (optional)',
    submit: 'Beschwerde einreichen',
    submitting: 'Wird gesendet...',
    success: 'Ihre Beschwerde wurde erfolgreich eingereicht',
    successMessage: 'Wir werden Ihre Beschwerde prüfen und uns so schnell wie möglich bei Ihnen melden.',
    error: 'Beim Einreichen der Beschwerde ist ein Fehler aufgetreten',
    required: 'Dieses Feld ist erforderlich',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    subjectPlaceholder: 'Geben Sie den Betreff ein',
    descriptionPlaceholder: 'Beschreiben Sie Ihre Beschwerde ausführlich',
    routePlaceholder: 'z.B. Damaskus - Aleppo',
    complaintNumber: 'Beschwerdenummer',
    newComplaint: 'Neue Beschwerde einreichen',
  },
  en: {
    title: 'Submit Complaint',
    subtitle: 'You can submit a complaint from any party against any party',
    back: 'Back',
    complainerType: 'Complainant Type',
    passenger: 'Passenger',
    driver: 'Driver',
    company: 'Company',
    admin: 'Administration',
    againstType: 'Complaint Against',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourPhone: 'Your Phone',
    subject: 'Subject',
    description: 'Description',
    tripDate: 'Trip Date (optional)',
    tripRoute: 'Trip Route (optional)',
    submit: 'Submit Complaint',
    submitting: 'Submitting...',
    success: 'Your complaint has been submitted successfully',
    successMessage: 'We will review your complaint and get back to you as soon as possible.',
    error: 'An error occurred while submitting the complaint',
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    subjectPlaceholder: 'Enter the subject',
    descriptionPlaceholder: 'Describe your complaint in detail',
    routePlaceholder: 'e.g. Damascus - Aleppo',
    complaintNumber: 'Complaint Number',
    newComplaint: 'Submit New Complaint',
  },
};

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ language, onBack, user }) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    complainerType: 'passenger',
    againstType: 'company',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    description: '',
    tripDate: '',
    tripRoute: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [complaintNumber, setComplaintNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || "";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.email.trim()) {
      newErrors.email = t.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }
    if (!formData.subject.trim()) newErrors.subject = t.required;
    if (!formData.description.trim()) newErrors.description = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComplaintNumber(data.complaintNumber || `CMP-${Date.now()}`);
        setSuccess(true);
      } else {
        throw new Error('Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setErrorMessage(t.error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      complainerType: 'passenger',
      againstType: 'company',
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      subject: '',
      description: '',
      tripDate: '',
      tripRoute: '',
    });
    setSuccess(false);
    setComplaintNumber('');
    setErrors({});
  };

  const partyTypes = [
    { value: 'passenger', label: t.passenger },
    { value: 'driver', label: t.driver },
    { value: 'company', label: t.company },
    { value: 'admin', label: t.admin },
  ];

  if (success) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-black">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t.back}</span>
            </button>
            <h1 className="text-3xl text-black font-bold">{t.title}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.success}</h2>
            <p className="text-gray-600 mb-6">{t.successMessage}</p>
            <div className="bg-green-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">{t.complaintNumber}</p>
              <p className="text-2xl font-bold text-green-600">{complaintNumber}</p>
            </div>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.newComplaint}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-black/80 hover:text-black transition-colors mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t.back}</span>
          </button>
          <h1 className="text-3xl text-black font-bold">{t.title}</h1>
          <p className="text-black/80 mt-2">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Party Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.complainerType}</label>
              <select
                value={formData.complainerType}
                onChange={(e) => setFormData({ ...formData, complainerType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {partyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.againstType}</label>
              <select
                value={formData.againstType}
                onChange={(e) => setFormData({ ...formData, againstType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {partyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.yourName} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.yourEmail} *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.yourPhone}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.subject} *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder={t.subjectPlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.description} *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.descriptionPlaceholder}
              rows={5}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.tripDate}</label>
              <input
                type="date"
                value={formData.tripDate}
                onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.tripRoute}</label>
              <input
                type="text"
                value={formData.tripRoute}
                onChange={(e) => setFormData({ ...formData, tripRoute: e.target.value })}
                placeholder={t.routePlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-green-600 font-semibold rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>{t.submitting}</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{t.submit}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
