import { X } from 'lucide-react';
import type { Language } from '../App';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const translations = {
  de: {
    title: 'Datenschutzerklärung',
    lastUpdated: 'Zuletzt aktualisiert',
    sections: {
      intro: {
        title: 'Einleitung',
        content: 'HopHop ("wir", "uns" oder "unser") respektiert Ihre Privatsphäre und verpflichtet sich, Ihre persönlichen Daten zu schützen. Diese Datenschutzerklärung informiert Sie darüber, wie wir mit Ihren persönlichen Daten umgehen, wenn Sie unsere Website besuchen und unsere Dienste nutzen.'
      },
      dataCollection: {
        title: '1. Welche Daten wir sammeln',
        content: 'Wir können die folgenden Arten von persönlichen Daten sammeln:',
        items: [
          'Persönliche Identifikationsdaten: Name, E-Mail-Adresse, Telefonnummer',
          'Buchungsinformationen: Reisedaten, Zielorte, Passagierdaten',
          'Zahlungsinformationen: Kreditkartendaten, Rechnungsinformationen (verarbeitet über sichere Zahlungsanbieter)',
          'Technische Daten: IP-Adresse, Browser-Typ, Geräteinformationen',
          'Nutzungsdaten: Wie Sie unsere Website nutzen, besuchte Seiten, Klickverhalten'
        ]
      },
      dataUse: {
        title: '2. Wie wir Ihre Daten verwenden',
        content: 'Wir verwenden Ihre persönlichen Daten für:',
        items: [
          'Bearbeitung und Verwaltung Ihrer Buchungen',
          'Kommunikation mit Ihnen über Ihre Reisen',
          'Bereitstellung von Kundenservice',
          'Verbesserung unserer Dienste und Website',
          'Versenden von Marketing-Mitteilungen (mit Ihrer Zustimmung)',
          'Einhaltung gesetzlicher Verpflichtungen',
          'Betrugsprävention und Sicherheit'
        ]
      },
      dataSharing: {
        title: '3. Weitergabe von Daten',
        content: 'Wir können Ihre persönlichen Daten an folgende Parteien weitergeben:',
        items: [
          'Transportunternehmen: Um Ihre Buchungen durchzuführen',
          'Zahlungsanbieter: Um Zahlungen sicher abzuwickeln',
          'Dienstleister: Die uns bei der Bereitstellung unserer Dienste unterstützen',
          'Behörden: Wenn gesetzlich erforderlich',
          'Geschäftspartner: Mit Ihrer ausdrücklichen Zustimmung'
        ]
      },
      dataSecurity: {
        title: '4. Datensicherheit',
        content: 'Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre persönlichen Daten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen. Dazu gehören Verschlüsselung, sichere Server und Zugangskontrollen.'
      },
      dataRetention: {
        title: '5. Datenspeicherung',
        content: 'Wir speichern Ihre persönlichen Daten nur so lange, wie es für die in dieser Datenschutzerklärung beschriebenen Zwecke erforderlich ist oder wie es gesetzlich vorgeschrieben ist.'
      },
      yourRights: {
        title: '6. Ihre Rechte',
        content: 'Sie haben folgende Rechte bezüglich Ihrer persönlichen Daten:',
        items: [
          'Auskunftsrecht: Sie können eine Kopie Ihrer persönlichen Daten anfordern',
          'Berichtigungsrecht: Sie können die Korrektur unrichtiger Daten verlangen',
          'Löschungsrecht: Sie können die Löschung Ihrer Daten verlangen',
          'Einschränkungsrecht: Sie können die Verarbeitung Ihrer Daten einschränken',
          'Widerspruchsrecht: Sie können der Verarbeitung Ihrer Daten widersprechen',
          'Datenübertragbarkeit: Sie können Ihre Daten in strukturierter Form erhalten'
        ]
      },
      cookies: {
        title: '7. Cookies',
        content: 'Unsere Website verwendet Cookies und ähnliche Technologien, um Ihre Erfahrung zu verbessern und Analysen durchzuführen. Sie können Cookies in Ihren Browser-Einstellungen verwalten.'
      },
      changes: {
        title: '8. Änderungen dieser Richtlinie',
        content: 'Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Änderungen werden auf dieser Seite veröffentlicht und treten sofort nach Veröffentlichung in Kraft.'
      },
      contact: {
        title: '9. Kontakt',
        content: 'Bei Fragen zu dieser Datenschutzerklärung kontaktieren Sie uns bitte unter:',
        email: 'E-Mail: info@hophopsy.com',
        phone: 'Telefon: +963 11 123 4567',
        address: 'Adresse: Damaskus, Syrien'
      }
    },
    close: 'Schließen'
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated',
    sections: {
      intro: {
        title: 'Introduction',
        content: 'HopHop ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This privacy policy informs you about how we handle your personal data when you visit our website and use our services.'
      },
      dataCollection: {
        title: '1. Data We Collect',
        content: 'We may collect the following types of personal data:',
        items: [
          'Personal identification data: Name, email address, phone number',
          'Booking information: Travel dates, destinations, passenger details',
          'Payment information: Credit card details, billing information (processed via secure payment providers)',
          'Technical data: IP address, browser type, device information',
          'Usage data: How you use our website, pages visited, click behavior'
        ]
      },
      dataUse: {
        title: '2. How We Use Your Data',
        content: 'We use your personal data for:',
        items: [
          'Processing and managing your bookings',
          'Communicating with you about your trips',
          'Providing customer service',
          'Improving our services and website',
          'Sending marketing communications (with your consent)',
          'Complying with legal obligations',
          'Fraud prevention and security'
        ]
      },
      dataSharing: {
        title: '3. Data Sharing',
        content: 'We may share your personal data with:',
        items: [
          'Transport companies: To fulfill your bookings',
          'Payment providers: To process payments securely',
          'Service providers: Who assist us in providing our services',
          'Authorities: When legally required',
          'Business partners: With your explicit consent'
        ]
      },
      dataSecurity: {
        title: '4. Data Security',
        content: 'We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or misuse. This includes encryption, secure servers, and access controls.'
      },
      dataRetention: {
        title: '5. Data Retention',
        content: 'We retain your personal data only for as long as necessary for the purposes described in this privacy policy or as required by law.'
      },
      yourRights: {
        title: '6. Your Rights',
        content: 'You have the following rights regarding your personal data:',
        items: [
          'Right of access: You can request a copy of your personal data',
          'Right to rectification: You can request correction of inaccurate data',
          'Right to erasure: You can request deletion of your data',
          'Right to restriction: You can restrict processing of your data',
          'Right to object: You can object to processing of your data',
          'Right to data portability: You can receive your data in structured format'
        ]
      },
      cookies: {
        title: '7. Cookies',
        content: 'Our website uses cookies and similar technologies to enhance your experience and perform analytics. You can manage cookies through your browser settings.'
      },
      changes: {
        title: '8. Changes to This Policy',
        content: 'We may update this privacy policy from time to time. Changes will be posted on this page and will take effect immediately upon posting.'
      },
      contact: {
        title: '9. Contact',
        content: 'If you have questions about this privacy policy, please contact us at:',
        email: 'Email: info@hophopsy.com',
        phone: 'Phone: +963 11 123 4567',
        address: 'Address: Damascus, Syria'
      }
    },
    close: 'Close'
  },
  ar: {
    title: 'سياسة الخصوصية',
    lastUpdated: 'آخر تحديث',
    sections: {
      intro: {
        title: 'مقدمة',
        content: 'تحترم HopHop ("نحن" أو "لنا") خصوصيتك وتلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية تعاملنا مع بياناتك الشخصية عند زيارتك لموقعنا واستخدام خدماتنا.'
      },
      dataCollection: {
        title: '١. البيانات التي نجمعها',
        content: 'قد نجمع الأنواع التالية من البيانات الشخصية:',
        items: [
          'بيانات التعريف الشخصية: الاسم، عنوان البريد الإلكتروني، رقم الهاتف',
          'معلومات الحجز: تواريخ السفر، الوجهات، تفاصيل الركاب',
          'معلومات الدفع: تفاصيل البطاقة الائتمانية، معلومات الفواتير (تتم معالجتها عبر مزودي دفع آمنين)',
          'البيانات التقنية: عنوان IP، نوع المتصفح، معلومات الجهاز',
          'بيانات الاستخدام: كيفية استخدامك لموقعنا، الصفحات التي تمت زيارتها، سلوك النقر'
        ]
      },
      dataUse: {
        title: '٢. كيفية استخدامنا لبياناتك',
        content: 'نستخدم بياناتك الشخصية من أجل:',
        items: [
          'معالجة وإدارة حجوزاتك',
          'التواصل معك بشأن رحلاتك',
          'تقديم خدمة العملاء',
          'تحسين خدماتنا وموقعنا الإلكتروني',
          'إرسال رسائل تسويقية (بموافقتك)',
          'الامتثال للالتزامات القانونية',
          'منع الاحتيال والأمان'
        ]
      },
      dataSharing: {
        title: '٣. مشاركة البيانات',
        content: 'قد نشارك بياناتك الشخصية مع:',
        items: [
          'شركات النقل: لتنفيذ حجوزاتك',
          'مزودي خدمات الدفع: لمعالجة المدفوعات بشكل آمن',
          'مزودي الخدمات: الذين يساعدوننا في تقديم خدماتنا',
          'السلطات: عندما يكون ذلك مطلوباً قانونياً',
          'الشركاء التجاريين: بموافقتك الصريحة'
        ]
      },
      dataSecurity: {
        title: '٤. أمان البيانات',
        content: 'نطبق تدابير تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الفقدان أو إساءة الاستخدام. يشمل ذلك التشفير والخوادم الآمنة وضوابط الوصول.'
      },
      dataRetention: {
        title: '٥. الاحتفاظ بالبيانات',
        content: 'نحتفظ ببياناتك الشخصية فقط للمدة اللازمة للأغراض الموضحة في سياسة الخصوصية هذه أو كما هو مطلوب بموجب القانون.'
      },
      yourRights: {
        title: '٦. حقوقك',
        content: 'لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:',
        items: [
          'حق الوصول: يمكنك طلب نسخة من بياناتك الشخصية',
          'حق التصحيح: يمكنك طلب تصحيح البيانات غير الدقيقة',
          'حق الحذف: يمكنك طلب حذف بياناتك',
          'حق التقييد: يمكنك تقييد معالجة بياناتك',
          'حق الاعتراض: يمكنك الاعتراض على معالجة بياناتك',
          'حق نقل البيانات: يمكنك الحصول على بياناتك بصيغة منظمة'
        ]
      },
      cookies: {
        title: '٧. ملفات تعريف الارتباط',
        content: 'يستخدم موقعنا ملفات تعريف الارتباط (Cookies) وتقنيات مماثلة لتحسين تجربتك وإجراء التحليلات. يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.'
      },
      changes: {
        title: '٨. التغييرات على هذه السياسة',
        content: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة وستدخل حيز التنفيذ فوراً بعد النشر.'
      },
      contact: {
        title: '٩. الاتصال',
        content: 'إذا كان لديك أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على:',
        email: 'البريد الإلكتروني: info@hophopsy.com',
        phone: 'الهاتف: ٤٥٦٧ ١٢٣ ١١ ٩٦٣+',
        address: 'العنوان: دمشق، سوريا'
      }
    },
    close: 'إغلاق'
  }
};

export function PrivacyPolicy({ isOpen, onClose, language }: PrivacyPolicyProps) {
  if (!isOpen) return null;

  const t = translations[language];
  const currentDate = new Date().toLocaleDateString(
    language === 'ar' ? 'ar-SY' : language === 'de' ? 'de-DE' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black bg-opacity-50"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">{t.title}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {t.lastUpdated}: {currentDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Introduction */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.intro.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.intro.content}</p>
          </section>

          {/* Data Collection */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.dataCollection.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.dataCollection.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.dataCollection.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Use */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.dataUse.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.dataUse.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.dataUse.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.dataSharing.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.dataSharing.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.dataSharing.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.dataSecurity.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.dataSecurity.content}</p>
          </section>

          {/* Data Retention */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.dataRetention.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.dataRetention.content}</p>
          </section>

          {/* Your Rights */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.yourRights.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.yourRights.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.yourRights.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.cookies.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.cookies.content}</p>
          </section>

          {/* Changes */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.changes.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.changes.content}</p>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.contact.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.contact.content}</p>
            <div className="space-y-2 text-gray-700">
              <p>{t.sections.contact.email}</p>
              <p>{t.sections.contact.phone}</p>
              <p>{t.sections.contact.address}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
