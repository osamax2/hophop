import React, { useState } from 'react';
import { ArrowLeft, UserX, AlertTriangle, CheckCircle, Send } from 'lucide-react';

interface DeleteAccountRequestProps {
  language: 'de' | 'en' | 'ar';
  onBack: () => void;
  user?: { id: string; name: string; email: string } | null;
}

const translations = {
  ar: {
    title: 'طلب حذف الحساب',
    subtitle: 'يمكنك طلب حذف حسابك وجميع بياناتك من النظام',
    back: 'رجوع',
    warning: 'تحذير هام',
    warningText: 'عند حذف حسابك، سيتم حذف جميع بياناتك بشكل نهائي بما في ذلك:',
    warningItem1: 'معلومات الحساب الشخصية',
    warningItem2: 'سجل الحجوزات',
    warningItem3: 'التقييمات والمراجعات',
    warningItem4: 'المفضلات المحفوظة',
    warningItem5: 'جميع البيانات المرتبطة بحسابك',
    irreversible: 'هذا الإجراء لا يمكن التراجع عنه!',
    yourEmail: 'بريدك الإلكتروني',
    reason: 'سبب طلب الحذف (اختياري)',
    reasonPlaceholder: 'أخبرنا لماذا تريد حذف حسابك...',
    confirm: 'أؤكد رغبتي في حذف حسابي وجميع بياناتي',
    submit: 'إرسال طلب الحذف',
    submitting: 'جاري الإرسال...',
    success: 'تم إرسال طلبك بنجاح',
    successMessage: 'سنقوم بمراجعة طلبك وحذف حسابك خلال 30 يومًا. ستتلقى تأكيدًا عبر البريد الإلكتروني.',
    error: 'حدث خطأ أثناء إرسال الطلب',
    required: 'يجب تأكيد رغبتك في حذف الحساب',
    requestNumber: 'رقم الطلب',
    goBack: 'العودة للصفحة الرئيسية',
  },
  de: {
    title: 'Konto löschen beantragen',
    subtitle: 'Sie können die Löschung Ihres Kontos und aller Ihrer Daten beantragen',
    back: 'Zurück',
    warning: 'Wichtige Warnung',
    warningText: 'Wenn Sie Ihr Konto löschen, werden alle Ihre Daten dauerhaft gelöscht, einschließlich:',
    warningItem1: 'Persönliche Kontoinformationen',
    warningItem2: 'Buchungsverlauf',
    warningItem3: 'Bewertungen und Rezensionen',
    warningItem4: 'Gespeicherte Favoriten',
    warningItem5: 'Alle mit Ihrem Konto verbundenen Daten',
    irreversible: 'Diese Aktion kann nicht rückgängig gemacht werden!',
    yourEmail: 'Ihre E-Mail',
    reason: 'Grund für die Löschanfrage (optional)',
    reasonPlaceholder: 'Teilen Sie uns mit, warum Sie Ihr Konto löschen möchten...',
    confirm: 'Ich bestätige, dass ich mein Konto und alle meine Daten löschen möchte',
    submit: 'Löschanfrage senden',
    submitting: 'Wird gesendet...',
    success: 'Ihre Anfrage wurde erfolgreich gesendet',
    successMessage: 'Wir werden Ihre Anfrage prüfen und Ihr Konto innerhalb von 30 Tagen löschen. Sie erhalten eine Bestätigung per E-Mail.',
    error: 'Beim Senden der Anfrage ist ein Fehler aufgetreten',
    required: 'Sie müssen die Kontolöschung bestätigen',
    requestNumber: 'Anfragenummer',
    goBack: 'Zurück zur Startseite',
  },
  en: {
    title: 'Request Account Deletion',
    subtitle: 'You can request the deletion of your account and all your data',
    back: 'Back',
    warning: 'Important Warning',
    warningText: 'When you delete your account, all your data will be permanently deleted, including:',
    warningItem1: 'Personal account information',
    warningItem2: 'Booking history',
    warningItem3: 'Ratings and reviews',
    warningItem4: 'Saved favorites',
    warningItem5: 'All data associated with your account',
    irreversible: 'This action cannot be undone!',
    yourEmail: 'Your Email',
    reason: 'Reason for deletion request (optional)',
    reasonPlaceholder: 'Tell us why you want to delete your account...',
    confirm: 'I confirm that I want to delete my account and all my data',
    submit: 'Submit Deletion Request',
    submitting: 'Submitting...',
    success: 'Your request has been submitted successfully',
    successMessage: 'We will review your request and delete your account within 30 days. You will receive a confirmation via email.',
    error: 'An error occurred while submitting the request',
    required: 'You must confirm the account deletion',
    requestNumber: 'Request Number',
    goBack: 'Back to Home',
  },
};

export const DeleteAccountRequest: React.FC<DeleteAccountRequestProps> = ({ language, onBack, user }) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    email: user?.email || '',
    reason: '',
    confirmed: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmed) {
      setError(t.required);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/account-deletion-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          reason: formData.reason,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequestNumber(data.requestNumber || `DEL-${Date.now()}`);
        setSuccess(true);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      setErrorMessage(t.error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-black">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl text-black font-bold">{t.title}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.success}</h2>
            <p className="text-gray-600 mb-6">{t.successMessage}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">{t.requestNumber}</p>
              <p className="text-2xl font-bold text-gray-900">{requestNumber}</p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.goBack}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t.back}</span>
          </button>
          <div className="flex items-center gap-3">
            <UserX className="w-8 h-8" />
            <div>
              <h1 className="text-3xl text-black font-bold">{t.title}</h1>
              <p className="text-black/80 mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Warning Box */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-700 mb-3">{t.warning}</h2>
              <p className="text-red-600 mb-4">{t.warningText}</p>
              <ul className={`space-y-2 text-red-600 ${isRTL ? 'pr-4' : 'pl-4'}`}>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {t.warningItem1}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {t.warningItem2}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {t.warningItem3}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {t.warningItem4}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {t.warningItem5}
                </li>
              </ul>
              <p className="mt-4 font-bold text-red-700">{t.irreversible}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.yourEmail}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
              disabled={!!user?.email}
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.reason}</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t.reasonPlaceholder}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Confirmation */}
          <div className="mb-8">
            <label className={`flex items-start gap-3 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input
                type="checkbox"
                checked={formData.confirmed}
                onChange={(e) => {
                  setFormData({ ...formData, confirmed: e.target.checked });
                  setError('');
                }}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-0.5"
              />
              <span className="text-gray-700">{t.confirm}</span>
            </label>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.confirmed}
            className="w-full py-4 bg-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default DeleteAccountRequest;
