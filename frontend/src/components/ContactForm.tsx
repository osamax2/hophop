import { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, X } from 'lucide-react';
import type { Language } from '../App';
import { api } from '../lib/api';

interface ContactFormProps {
  language: Language;
  onClose?: () => void;
}

const translations = {
  de: {
    title: 'Kontaktieren Sie uns',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefonnummer',
    subject: 'Betreff',
    message: 'Nachricht',
    send: 'Senden',
    namePlaceholder: 'Ihr Name',
    emailPlaceholder: 'ihre@email.com',
    phonePlaceholder: '+963 11 123 4567',
    subjectPlaceholder: 'Betreff Ihrer Nachricht',
    messagePlaceholder: 'Schreiben Sie Ihre Nachricht hier...',
    nameRequired: 'Name ist erforderlich',
    emailRequired: 'E-Mail ist erforderlich',
    emailInvalid: 'Ungültige E-Mail-Adresse',
    phoneRequired: 'Telefonnummer ist erforderlich',
    subjectRequired: 'Betreff ist erforderlich',
    messageRequired: 'Nachricht ist erforderlich',
    sending: 'Wird gesendet...',
    success: 'Nachricht erfolgreich gesendet!',
    error: 'Fehler beim Senden der Nachricht',
  },
  en: {
    title: 'Contact Us',
    name: 'Name',
    email: 'Email',
    phone: 'Phone Number',
    subject: 'Subject',
    message: 'Message',
    send: 'Send',
    namePlaceholder: 'Your Name',
    emailPlaceholder: 'your@email.com',
    phonePlaceholder: '+963 11 123 4567',
    subjectPlaceholder: 'Subject of your message',
    messagePlaceholder: 'Write your message here...',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email address',
    phoneRequired: 'Phone number is required',
    subjectRequired: 'Subject is required',
    messageRequired: 'Message is required',
    sending: 'Sending...',
    success: 'Message sent successfully!',
    error: 'Error sending message',
  },
  ar: {
    title: 'تواصل معنا',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    subject: 'الموضوع',
    message: 'الرسالة',
    send: 'إرسال',
    namePlaceholder: 'اسمك',
    emailPlaceholder: 'بريدك@الإلكتروني.com',
    phonePlaceholder: '+963 11 123 4567',
    subjectPlaceholder: 'موضوع رسالتك',
    messagePlaceholder: 'اكتب رسالتك هنا...',
    nameRequired: 'الاسم مطلوب',
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'عنوان بريد إلكتروني غير صحيح',
    phoneRequired: 'رقم الهاتف مطلوب',
    subjectRequired: 'الموضوع مطلوب',
    messageRequired: 'الرسالة مطلوبة',
    sending: 'جاري الإرسال...',
    success: 'تم إرسال الرسالة بنجاح!',
    error: 'خطأ في إرسال الرسالة',
  },
};

export function ContactForm({ language, onClose }: ContactFormProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneRequired;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t.subjectRequired;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.messageRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.submitContactForm(formData);

      // Show success message
      alert(t.success);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setErrors({});

      // Close modal if onClose is provided
      if (onClose) {
        setTimeout(() => onClose(), 500);
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      alert(t.error + ': ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className={`block text-gray-700 mb-2 font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="w-5 h-5 text-green-600" />
                <span>{t.name}</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t.namePlaceholder}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-gray-700 mb-2 font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-5 h-5 text-green-600" />
                <span>{t.email}</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t.emailPlaceholder}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-gray-700 mb-2 font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-5 h-5 text-green-600" />
                <span>{t.phone}</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t.phonePlaceholder}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className={`block text-gray-700 mb-2 font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>{t.subject}</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder={t.subjectPlaceholder}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className={`block text-gray-700 mb-2 font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>{t.message}</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder={t.messagePlaceholder}
                rows={6}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-medium ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t.sending}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t.send}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

