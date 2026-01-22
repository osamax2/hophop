import React from 'react';
import { ArrowLeft, Code, Smartphone, Shield, Server, GraduationCap, Quote, Sparkles, Mail, Phone } from 'lucide-react';

interface AboutUsProps {
  language: 'de' | 'en' | 'ar';
  onBack: () => void;
  onContact: () => void;
}

const translations = {
  ar: {
    title: 'من نحن',
    companyName: 'الراين للتطوير التقني',
    aboutTitle: 'من نحن؟',
    aboutDescription: 'شركة متخصصة في تطوير الحلول البرمجية والتقنية المتقدمة، نقدم خدمات تصميم وبناء الأنظمة الرقمية، تطبيقات الويب والموبايل، والأتمتة الذكية وفق أعلى معايير الجودة والأمن. نركز على الابتكار ونقل الخبرات التقنية الألمانية لتقديم حلول موثوقة وقابلة للتوسع تلبي احتياجات الشركات والمؤسسات.',
    servicesTitle: 'خدماتنا',
    skillsTitle: 'المهارات',
    whatWeOffer: 'ماذا نقدم',
    whatWeOfferDesc: 'نقوم في الراين للتطوير التقني بتصميم وتطوير حلول تقنية متكاملة تبدأ من تحليل احتياجات العميل، مرورًا ببناء الأنظمة البرمجية وتطبيقات الويب والموبايل، وصولًا إلى التشغيل والصيانة والدعم الفني. كما نعمل على أتمتة العمليات، تكامل الأنظمة، تعزيز أمن المعلومات، وتقديم حلول مخصصة تعتمد على أحدث التقنيات لضمان الكفاءة، الاستقرار، وقابلية التوسع للأعمال.',
    service1Title: 'تطوير البرمجيات والأنظمة',
    service1Desc: 'تصميم وبرمجة وتنفيذ الأنظمة المعلوماتية المخصصة للشركات والمؤسسات، بما يشمل أنظمة إدارة الموارد (ERP)، إدارة العملاء (CRM)، أنظمة الأرشفة، والبوابات الإلكترونية.',
    service2Title: 'تطبيقات الويب والموبايل',
    service2Desc: 'تطوير تطبيقات Android وiOS وتطبيقات الويب ولوحات التحكم (Dashboards)، مع بناء واجهات مستخدم وتجربة مستخدم (UI/UX) وتشغيلها على بيئات استضافة مناسبة.',
    service3Title: 'الأمن السيبراني واختبارات الحماية',
    service3Desc: 'تقديم خدمات فحص وتقييم أمن المعلومات، واختبار الاختراق للتطبيقات والأنظمة والشبكات، وإعداد تقارير الثغرات وخطط المعالجة، وتحسين الضبط الأمني وفق أفضل الممارسات.',
    service4Title: 'البنية التحتية والتشغيل',
    service4Desc: 'إعداد وإدارة بيئات التشغيل، الأتمتة، وخطوط النشر المستمر (CI/CD)، المراقبة (Monitoring) وإدارة السجلات، وتحسين الاعتمادية والأداء باستخدام Docker والتقنيات الحديثة.',
    service5Title: 'الاستشارات التقنية والتدريب',
    service5Desc: 'تقديم الاستشارات، إعداد الدراسات الفنية، توثيق الأنظمة، وتدريب فرق العمل على التشغيل والصيانة والأمن وجودة البرمجيات.',
    testimonialText: '"التصميم البسيط وسلاسة تجربة المستخدم جعلت موقعنا أسهل في الاستخدام، ولاحظنا ارتفاعًا واضحًا في تفاعل العملاء."',
    testimonialAuthor: 'منى',
    testimonialRole: 'مطورة مواقع وتطبيقات',
    ctaTitle: 'حيث تتحول الأفكار إلى مواقع إلكترونية',
    ctaSubtitle: 'ابتكر شيئًا يدوم إلى الأبد',
    ctaDesc: 'حيث تتحول الأفكار إلى مواقع إلكترونية نابضة بالحياة، نصنع حلولًا رقمية تبدأ من الرؤية وتصل إلى الواقع. نحوّل الابتكار إلى أنظمة وتطبيقات موثوقة تخدم اليوم وتواكب الغد. نبتكر تقنيات تُبنى بجودة عالية لتدوم، وتترك أثرًا رقميًا لا يزول.',
    getStarted: 'ابدأ الآن',
    contactUs: 'اتصل بنا',
    back: 'رجوع',
  },
  de: {
    title: 'Über uns',
    companyName: 'Al-Rhein Technische Entwicklung',
    aboutTitle: 'Wer sind wir?',
    aboutDescription: 'Ein auf fortschrittliche Software- und Technologielösungen spezialisiertes Unternehmen. Wir bieten Dienstleistungen in Design und Entwicklung digitaler Systeme, Web- und Mobile-Anwendungen sowie intelligente Automatisierung nach höchsten Qualitäts- und Sicherheitsstandards. Wir konzentrieren uns auf Innovation und den Transfer deutscher technischer Expertise, um zuverlässige und skalierbare Lösungen zu liefern.',
    servicesTitle: 'Unsere Dienstleistungen',
    skillsTitle: 'Fähigkeiten',
    whatWeOffer: 'Was wir bieten',
    whatWeOfferDesc: 'Bei Al-Rhein entwerfen und entwickeln wir integrierte technische Lösungen, beginnend mit der Analyse der Kundenanforderungen, über den Aufbau von Softwaresystemen und Web-/Mobile-Anwendungen bis hin zu Betrieb, Wartung und technischem Support.',
    service1Title: 'Software- & Systementwicklung',
    service1Desc: 'Design, Programmierung und Implementierung maßgeschneiderter Informationssysteme für Unternehmen, einschließlich ERP, CRM, Archivierungssysteme und elektronische Portale.',
    service2Title: 'Web- & Mobile-Anwendungen',
    service2Desc: 'Entwicklung von Android- und iOS-Apps, Webanwendungen und Dashboards mit UI/UX-Design und Hosting-Lösungen.',
    service3Title: 'Cybersicherheit & Penetrationstests',
    service3Desc: 'Sicherheitsbewertungen, Penetrationstests für Anwendungen, Systeme und Netzwerke, Schwachstellenberichte und Sicherheitsoptimierung.',
    service4Title: 'Infrastruktur & Betrieb',
    service4Desc: 'Einrichtung und Verwaltung von Betriebsumgebungen, CI/CD-Pipelines, Monitoring und Protokollverwaltung mit Docker und modernen Technologien.',
    service5Title: 'Technische Beratung & Schulung',
    service5Desc: 'Beratung, technische Studien, Systemdokumentation und Schulung von Teams in Betrieb, Wartung und Softwarequalität.',
    testimonialText: '"Das einfache Design und die reibungslose Benutzererfahrung haben unsere Website benutzerfreundlicher gemacht, und wir haben eine deutliche Steigerung der Kundenbindung festgestellt."',
    testimonialAuthor: 'Mona',
    testimonialRole: 'Web- & App-Entwicklerin',
    ctaTitle: 'Wo Ideen zu Websites werden',
    ctaSubtitle: 'Schaffen Sie etwas, das für immer hält',
    ctaDesc: 'Wo Ideen zu lebendigen Websites werden, schaffen wir digitale Lösungen von der Vision bis zur Realität. Wir verwandeln Innovation in zuverlässige Systeme und Anwendungen.',
    getStarted: 'Loslegen',
    contactUs: 'Kontakt',
    back: 'Zurück',
  },
  en: {
    title: 'About Us',
    companyName: 'Al-Rhein Technical Development',
    aboutTitle: 'Who are we?',
    aboutDescription: 'A company specializing in developing advanced software and technical solutions. We provide services in designing and building digital systems, web and mobile applications, and intelligent automation according to the highest quality and security standards. We focus on innovation and transferring German technical expertise to deliver reliable and scalable solutions.',
    servicesTitle: 'Our Services',
    skillsTitle: 'Skills',
    whatWeOffer: 'What We Offer',
    whatWeOfferDesc: 'At Al-Rhein, we design and develop integrated technical solutions starting from analyzing client needs, through building software systems and web/mobile applications, to operation, maintenance, and technical support.',
    service1Title: 'Software & Systems Development',
    service1Desc: 'Design, programming, and implementation of customized information systems for companies, including ERP, CRM, archiving systems, and electronic portals.',
    service2Title: 'Web & Mobile Applications',
    service2Desc: 'Development of Android and iOS apps, web applications and dashboards with UI/UX design and hosting solutions.',
    service3Title: 'Cybersecurity & Penetration Testing',
    service3Desc: 'Security assessments, penetration testing for applications, systems, and networks, vulnerability reports, and security optimization.',
    service4Title: 'Infrastructure & Operations',
    service4Desc: 'Setup and management of operating environments, CI/CD pipelines, monitoring and log management using Docker and modern technologies.',
    service5Title: 'Technical Consulting & Training',
    service5Desc: 'Consulting, technical studies, system documentation, and training teams on operations, maintenance, and software quality.',
    testimonialText: '"The simple design and smooth user experience made our website easier to use, and we noticed a clear increase in customer engagement."',
    testimonialAuthor: 'Mona',
    testimonialRole: 'Web & App Developer',
    ctaTitle: 'Where Ideas Become Websites',
    ctaSubtitle: 'Create Something That Lasts Forever',
    ctaDesc: 'Where ideas transform into vibrant websites, we create digital solutions from vision to reality. We turn innovation into reliable systems and applications that serve today and embrace tomorrow.',
    getStarted: 'Get Started',
    contactUs: 'Contact Us',
    back: 'Back',
  },
};

export const AboutUs: React.FC<AboutUsProps> = ({ language, onBack, onContact }) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const services = [
    { icon: Code, title: t.service1Title, desc: t.service1Desc },
    { icon: Smartphone, title: t.service2Title, desc: t.service2Desc },
    { icon: Shield, title: t.service3Title, desc: t.service3Desc },
    { icon: Server, title: t.service4Title, desc: t.service4Desc },
    { icon: GraduationCap, title: t.service5Title, desc: t.service5Desc },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t.back}</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold">{t.companyName}</h1>
          <p className="text-xl text-black/80 mt-2">{t.title}</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">{t.aboutTitle}</h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {t.aboutDescription}
            </p>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 md:p-12 border border-gray-300 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-black">{t.whatWeOffer}</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
            {t.whatWeOfferDesc}
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">{t.servicesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-100 rounded-2xl p-6 border border-gray-300 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative">
            <Quote className="w-12 h-12 text-white/30 mb-4" />
            <p className="text-xl md:text-2xl text-green-600 font-medium mb-6 leading-relaxed">
              {t.testimonialText}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👩‍💻</span>
              </div>
              <div>
                <p className="text-green-600 font-bold">{t.testimonialAuthor}</p>
                <p className="text-white/70">{t.testimonialRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{t.ctaTitle}</h2>
          <p className="text-2xl text-green-600 font-semibold mb-6">{t.ctaSubtitle}</p>
          <p className="text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t.ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onContact}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t.getStarted}
            </button>
            <button
              onClick={onContact}
              className="px-8 py-4 bg-white text-black font-bold rounded-xl border border-gray-300 hover:border-green-500 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {t.contactUs}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} {t.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
