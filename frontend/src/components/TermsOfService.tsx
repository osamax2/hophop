import { X } from 'lucide-react';
import type { Language } from '../App';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const translations = {
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdated: 'Zuletzt aktualisiert',
    sections: {
      intro: {
        title: 'Einleitung',
        content: 'Willkommen bei HopHop. Durch den Zugriff auf oder die Nutzung unserer Website und Dienste stimmen Sie diesen Nutzungsbedingungen zu. Bitte lesen Sie sie sorgfältig durch.'
      },
      acceptance: {
        title: '1. Annahme der Bedingungen',
        content: 'Durch die Nutzung unserer Dienste bestätigen Sie, dass Sie diese Nutzungsbedingungen gelesen, verstanden und akzeptiert haben. Wenn Sie nicht einverstanden sind, dürfen Sie unsere Dienste nicht nutzen.'
      },
      services: {
        title: '2. Unsere Dienste',
        content: 'HopHop bietet eine Plattform zur Buchung von Transportdienstleistungen in Syrien. Wir:',
        items: [
          'Vermitteln Buchungen zwischen Passagieren und Transportunternehmen',
          'Bieten Informationen über verfügbare Routen und Fahrpläne',
          'Ermöglichen Online-Zahlungen für Buchungen',
          'Senden Buchungsbestätigungen und Reiseinformationen',
          'Bieten Kundensupport für Buchungsanfragen'
        ]
      },
      userResponsibilities: {
        title: '3. Nutzerverantwortung',
        content: 'Als Nutzer verpflichten Sie sich:',
        items: [
          'Genaue und vollständige Informationen bei der Buchung anzugeben',
          'Ihre Kontodaten vertraulich zu behandeln',
          'Unsere Dienste nicht für illegale Zwecke zu nutzen',
          'Die Rechte anderer Nutzer und Dritter zu respektieren',
          'Die geltenden Gesetze und Vorschriften einzuhalten',
          'Pünktlich zu Ihren gebuchten Reisen zu erscheinen'
        ]
      },
      bookings: {
        title: '4. Buchungen und Zahlungen',
        content: 'Bei der Buchung über unsere Plattform gelten folgende Bedingungen:',
        items: [
          'Buchungsbestätigungen: Sie erhalten eine Bestätigungs-E-Mail nach erfolgreicher Buchung',
          'Zahlungen: Alle Zahlungen müssen zum Zeitpunkt der Buchung erfolgen',
          'Preise: Alle angezeigten Preise verstehen sich inklusive aller Gebühren',
          'Verfügbarkeit: Buchungen unterliegen der Verfügbarkeit',
          'Stornierungen: Stornierungsbedingungen variieren je nach Transportunternehmen'
        ]
      },
      cancellations: {
        title: '5. Stornierungen und Rückerstattungen',
        content: 'Stornierungsrichtlinien:',
        items: [
          'Stornierungen müssen gemäß den Richtlinien des jeweiligen Transportunternehmens erfolgen',
          'Rückerstattungen werden nach den Bedingungen des Transportunternehmens bearbeitet',
          'HopHop kann eine Bearbeitungsgebühr für Stornierungen erheben',
          'Nicht erscheinen (No-Show) kann zum Verlust der Buchung ohne Rückerstattung führen',
          'Rückerstattungen werden innerhalb von 7-14 Werktagen bearbeitet'
        ]
      },
      liability: {
        title: '6. Haftungsbeschränkung',
        content: 'HopHop haftet nicht für:',
        items: [
          'Verspätungen oder Ausfälle von Transportunternehmen',
          'Verlorenes oder beschädigtes Gepäck',
          'Verletzungen oder Schäden während der Reise',
          'Inhalte oder Handlungen von Transportunternehmen',
          'Technische Probleme oder Serviceunterbrechungen',
          'Indirekte oder Folgeschäden aus der Nutzung unserer Dienste'
        ],
        note: 'Hinweis: Die Beförderung erfolgt gemäß den Bedingungen des jeweiligen Transportunternehmens. Bei Problemen während der Reise kontaktieren Sie bitte direkt das Transportunternehmen.'
      },
      intellectualProperty: {
        title: '7. Geistiges Eigentum',
        content: 'Alle Inhalte auf unserer Website, einschließlich Texte, Grafiken, Logos, Bilder und Software, sind Eigentum von HopHop oder unseren Lizenzgebern und durch syrische und internationale Urheberrechtsgesetze geschützt.'
      },
      userData: {
        title: '8. Nutzerdaten und Datenschutz',
        content: 'Ihre Nutzung unserer Dienste unterliegt unserer Datenschutzerklärung. Wir verpflichten uns, Ihre persönlichen Daten gemäß den geltenden Datenschutzgesetzen zu schützen.'
      },
      prohibitedUses: {
        title: '9. Verbotene Nutzung',
        content: 'Sie dürfen unsere Dienste nicht nutzen für:',
        items: [
          'Illegale oder betrügerische Aktivitäten',
          'Belästigung, Bedrohung oder Verletzung anderer',
          'Spam oder unerwünschte Werbung',
          'Verbreitung von Viren oder schädlichem Code',
          'Umgehung von Sicherheitsmaßnahmen',
          'Scraping oder automatisiertes Datensammeln ohne Genehmigung'
        ]
      },
      termination: {
        title: '10. Beendigung',
        content: 'Wir behalten uns das Recht vor, Ihr Konto zu sperren oder zu löschen und Ihren Zugang zu unseren Diensten zu verweigern, wenn Sie gegen diese Nutzungsbedingungen verstoßen.'
      },
      governingLaw: {
        title: '11. Anwendbares Recht',
        content: 'Diese Nutzungsbedingungen unterliegen den Gesetzen der Arabischen Republik Syrien. Streitigkeiten unterliegen der ausschließlichen Zuständigkeit der syrischen Gerichte.'
      },
      changes: {
        title: '12. Änderungen der Bedingungen',
        content: 'Wir können diese Nutzungsbedingungen jederzeit ändern. Änderungen treten sofort nach Veröffentlichung auf unserer Website in Kraft. Ihre fortgesetzte Nutzung unserer Dienste nach Änderungen bedeutet Ihre Zustimmung zu den geänderten Bedingungen.'
      },
      contact: {
        title: '13. Kontakt',
        content: 'Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns bitte unter:',
        email: 'E-Mail: info@hophopsy.com',
        phone: 'Telefon: +963 11 123 4567',
        address: 'Adresse: Damaskus, Syrien'
      }
    },
    close: 'Schließen'
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated',
    sections: {
      intro: {
        title: 'Introduction',
        content: 'Welcome to HopHop. By accessing or using our website and services, you agree to these Terms of Service. Please read them carefully.'
      },
      acceptance: {
        title: '1. Acceptance of Terms',
        content: 'By using our services, you confirm that you have read, understood, and accepted these Terms of Service. If you do not agree, you may not use our services.'
      },
      services: {
        title: '2. Our Services',
        content: 'HopHop provides a platform for booking transportation services in Syria. We:',
        items: [
          'Facilitate bookings between passengers and transport companies',
          'Provide information about available routes and schedules',
          'Enable online payments for bookings',
          'Send booking confirmations and travel information',
          'Provide customer support for booking inquiries'
        ]
      },
      userResponsibilities: {
        title: '3. User Responsibilities',
        content: 'As a user, you agree to:',
        items: [
          'Provide accurate and complete information when booking',
          'Keep your account credentials confidential',
          'Not use our services for illegal purposes',
          'Respect the rights of other users and third parties',
          'Comply with applicable laws and regulations',
          'Arrive on time for your booked trips'
        ]
      },
      bookings: {
        title: '4. Bookings and Payments',
        content: 'When booking through our platform, the following applies:',
        items: [
          'Booking confirmations: You will receive a confirmation email after successful booking',
          'Payments: All payments must be made at the time of booking',
          'Prices: All displayed prices include all fees',
          'Availability: Bookings are subject to availability',
          'Cancellations: Cancellation terms vary by transport company'
        ]
      },
      cancellations: {
        title: '5. Cancellations and Refunds',
        content: 'Cancellation policies:',
        items: [
          'Cancellations must be made according to the respective transport company\'s policies',
          'Refunds will be processed according to the transport company\'s terms',
          'HopHop may charge a processing fee for cancellations',
          'No-shows may result in loss of booking without refund',
          'Refunds will be processed within 7-14 business days'
        ]
      },
      liability: {
        title: '6. Limitation of Liability',
        content: 'HopHop is not liable for:',
        items: [
          'Delays or cancellations by transport companies',
          'Lost or damaged luggage',
          'Injuries or damages during travel',
          'Content or actions of transport companies',
          'Technical issues or service interruptions',
          'Indirect or consequential damages from using our services'
        ],
        note: 'Note: Transportation is provided according to the terms of the respective transport company. For issues during travel, please contact the transport company directly.'
      },
      intellectualProperty: {
        title: '7. Intellectual Property',
        content: 'All content on our website, including text, graphics, logos, images, and software, is the property of HopHop or our licensors and is protected by Syrian and international copyright laws.'
      },
      userData: {
        title: '8. User Data and Privacy',
        content: 'Your use of our services is subject to our Privacy Policy. We are committed to protecting your personal data in accordance with applicable data protection laws.'
      },
      prohibitedUses: {
        title: '9. Prohibited Uses',
        content: 'You may not use our services for:',
        items: [
          'Illegal or fraudulent activities',
          'Harassment, threats, or harm to others',
          'Spam or unsolicited advertising',
          'Distribution of viruses or malicious code',
          'Circumventing security measures',
          'Scraping or automated data collection without permission'
        ]
      },
      termination: {
        title: '10. Termination',
        content: 'We reserve the right to suspend or delete your account and deny your access to our services if you violate these Terms of Service.'
      },
      governingLaw: {
        title: '11. Governing Law',
        content: 'These Terms of Service are governed by the laws of the Syrian Arab Republic. Disputes are subject to the exclusive jurisdiction of Syrian courts.'
      },
      changes: {
        title: '12. Changes to Terms',
        content: 'We may change these Terms of Service at any time. Changes take effect immediately upon posting on our website. Your continued use of our services after changes constitutes acceptance of the modified terms.'
      },
      contact: {
        title: '13. Contact',
        content: 'If you have questions about these Terms of Service, please contact us at:',
        email: 'Email: info@hophopsy.com',
        phone: 'Phone: +963 11 123 4567',
        address: 'Address: Damascus, Syria'
      }
    },
    close: 'Close'
  },
  ar: {
    title: 'شروط الاستخدام',
    lastUpdated: 'آخر تحديث',
    sections: {
      intro: {
        title: 'مقدمة',
        content: 'مرحباً بك في HopHop. باستخدامك لموقعنا وخدماتنا، فإنك توافق على شروط الاستخدام هذه. يرجى قراءتها بعناية.'
      },
      acceptance: {
        title: '١. قبول الشروط',
        content: 'باستخدامك لخدماتنا، فإنك تؤكد أنك قد قرأت وفهمت وقبلت شروط الاستخدام هذه. إذا كنت لا توافق، فلا يجوز لك استخدام خدماتنا.'
      },
      services: {
        title: '٢. خدماتنا',
        content: 'توفر HopHop منصة لحجز خدمات النقل في سوريا. نحن:',
        items: [
          'نسهّل الحجوزات بين الركاب وشركات النقل',
          'نوفر معلومات حول المسارات والجداول الزمنية المتاحة',
          'نمكّن الدفع عبر الإنترنت للحجوزات',
          'نرسل تأكيدات الحجز ومعلومات السفر',
          'نقدم دعم العملاء لاستفسارات الحجز'
        ]
      },
      userResponsibilities: {
        title: '٣. مسؤوليات المستخدم',
        content: 'كمستخدم، أنت توافق على:',
        items: [
          'تقديم معلومات دقيقة وكاملة عند الحجز',
          'الحفاظ على سرية بيانات حسابك',
          'عدم استخدام خدماتنا لأغراض غير قانونية',
          'احترام حقوق المستخدمين الآخرين والأطراف الثالثة',
          'الامتثال للقوانين واللوائح المعمول بها',
          'الحضور في الوقت المحدد للرحلات المحجوزة'
        ]
      },
      bookings: {
        title: '٤. الحجوزات والمدفوعات',
        content: 'عند الحجز عبر منصتنا، تنطبق الشروط التالية:',
        items: [
          'تأكيدات الحجز: ستتلقى بريداً إلكترونياً للتأكيد بعد الحجز الناجح',
          'المدفوعات: يجب إجراء جميع المدفوعات في وقت الحجز',
          'الأسعار: جميع الأسعار المعروضة تشمل جميع الرسوم',
          'التوافر: الحجوزات تخضع للتوافر',
          'الإلغاءات: شروط الإلغاء تختلف حسب شركة النقل'
        ]
      },
      cancellations: {
        title: '٥. الإلغاءات والاسترداد',
        content: 'سياسات الإلغاء:',
        items: [
          'يجب إجراء الإلغاءات وفقاً لسياسات شركة النقل المعنية',
          'سيتم معالجة المبالغ المستردة وفقاً لشروط شركة النقل',
          'قد تفرض HopHop رسوم معالجة للإلغاءات',
          'عدم الحضور قد يؤدي إلى فقدان الحجز دون استرداد',
          'سيتم معالجة المبالغ المستردة خلال ٧-١٤ يوم عمل'
        ]
      },
      liability: {
        title: '٦. حدود المسؤولية',
        content: 'HopHop غير مسؤولة عن:',
        items: [
          'التأخيرات أو الإلغاءات من قبل شركات النقل',
          'الأمتعة المفقودة أو التالفة',
          'الإصابات أو الأضرار أثناء السفر',
          'محتوى أو أفعال شركات النقل',
          'المشاكل التقنية أو انقطاع الخدمة',
          'الأضرار غير المباشرة أو التبعية من استخدام خدماتنا'
        ],
        note: 'ملاحظة: يتم توفير النقل وفقاً لشروط شركة النقل المعنية. في حالة حدوث مشاكل أثناء السفر، يرجى الاتصال بشركة النقل مباشرة.'
      },
      intellectualProperty: {
        title: '٧. الملكية الفكرية',
        content: 'جميع المحتويات على موقعنا، بما في ذلك النصوص والرسومات والشعارات والصور والبرامج، هي ملك لـ HopHop أو مرخصينا ومحمية بموجب قوانين حقوق النشر السورية والدولية.'
      },
      userData: {
        title: '٨. بيانات المستخدم والخصوصية',
        content: 'يخضع استخدامك لخدماتنا لسياسة الخصوصية الخاصة بنا. نلتزم بحماية بياناتك الشخصية وفقاً لقوانين حماية البيانات المعمول بها.'
      },
      prohibitedUses: {
        title: '٩. الاستخدامات المحظورة',
        content: 'لا يجوز لك استخدام خدماتنا من أجل:',
        items: [
          'الأنشطة غير القانونية أو الاحتيالية',
          'المضايقة أو التهديد أو إلحاق الضرر بالآخرين',
          'الرسائل المزعجة أو الإعلانات غير المرغوب فيها',
          'توزيع الفيروسات أو الأكواد الضارة',
          'تجاوز إجراءات الأمان',
          'جمع البيانات بشكل آلي دون إذن'
        ]
      },
      termination: {
        title: '١٠. الإنهاء',
        content: 'نحتفظ بالحق في تعليق أو حذف حسابك ورفض وصولك إلى خدماتنا إذا انتهكت شروط الاستخدام هذه.'
      },
      governingLaw: {
        title: '١١. القانون الحاكم',
        content: 'تخضع شروط الاستخدام هذه لقوانين الجمهورية العربية السورية. تخضع النزاعات للاختصاص الحصري للمحاكم السورية.'
      },
      changes: {
        title: '١٢. التغييرات على الشروط',
        content: 'يمكننا تغيير شروط الاستخدام هذه في أي وقت. تدخل التغييرات حيز التنفيذ فوراً بعد نشرها على موقعنا. استمرارك في استخدام خدماتنا بعد التغييرات يعني قبولك للشروط المعدلة.'
      },
      contact: {
        title: '١٣. الاتصال',
        content: 'إذا كان لديك أسئلة حول شروط الاستخدام هذه، يرجى الاتصال بنا على:',
        email: 'البريد الإلكتروني: info@hophopsy.com',
        phone: 'الهاتف: ٤٥٦٧ ١٢٣ ١١ ٩٦٣+',
        address: 'العنوان: دمشق، سوريا'
      }
    },
    close: 'إغلاق'
  }
};

export function TermsOfService({ isOpen, onClose, language }: TermsOfServiceProps) {
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
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-black font-bold">{t.title}</h2>
            <p className="text-green-100 text-sm mt-1">
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

          {/* Acceptance */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.acceptance.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.acceptance.content}</p>
          </section>

          {/* Services */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.services.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.services.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.services.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.userResponsibilities.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.userResponsibilities.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.userResponsibilities.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Bookings */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.bookings.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.bookings.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.bookings.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Cancellations */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.cancellations.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.cancellations.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.cancellations.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Liability */}
          <section className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.liability.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.liability.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4 mb-4">
              {t.sections.liability.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
            <p className="text-gray-600 italic">{t.sections.liability.note}</p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.intellectualProperty.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.intellectualProperty.content}</p>
          </section>

          {/* User Data */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.userData.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.userData.content}</p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.prohibitedUses.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{t.sections.prohibitedUses.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              {t.sections.prohibitedUses.items.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.termination.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.termination.content}</p>
          </section>

          {/* Governing Law */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.governingLaw.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.governingLaw.content}</p>
          </section>

          {/* Changes */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.sections.changes.title}</h3>
            <p className="text-gray-700 leading-relaxed">{t.sections.changes.content}</p>
          </section>

          {/* Contact */}
          <section className="bg-green-50 p-6 rounded-xl">
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
