import React, { useEffect, useState } from 'react';
import { Check, X, Building2, Users, TrendingUp, Zap, Shield, Crown } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  max_branches: number;
  price_per_month: number;
  currency: string;
  features: string;
  is_active: boolean;
}

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [language, setLanguage] = useState<'de' | 'en' | 'ar'>('de');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const response = await fetch(`${API_BASE}/api/subscriptions/plans`);
      const data = await response.json();
      
      // Ensure price_per_month is a number
      const normalizedPlans = data.map((plan: any) => ({
        ...plan,
        price_per_month: Number(plan.price_per_month) || 0,
        max_branches: Number(plan.max_branches) || 0,
      }));
      
      setPlans(normalizedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    de: {
      title: 'Wählen Sie Ihren Plan',
      subtitle: 'Flexible Preise für jede Unternehmensgröße',
      monthly: 'pro Monat',
      branches: 'Filialen',
      currentPlan: 'Aktueller Plan',
      choosePlan: 'Plan auswählen',
      mostPopular: 'Beliebteste',
      free: 'Kostenlos',
      features: {
        unlimitedStaff: 'Unbegrenzte Mitarbeiter pro Filiale',
        basicSupport: 'Basis Support',
        prioritySupport: 'Priority Support',
        reporting: 'Erweiterte Berichte',
        api: 'API Zugang',
        customization: 'Individuelle Anpassungen',
        dedicatedManager: 'Dedizierter Account Manager',
      }
    },
    en: {
      title: 'Choose Your Plan',
      subtitle: 'Flexible pricing for every business size',
      monthly: 'per month',
      branches: 'Branches',
      currentPlan: 'Current Plan',
      choosePlan: 'Choose Plan',
      mostPopular: 'Most Popular',
      free: 'Free',
      features: {
        unlimitedStaff: 'Unlimited staff per branch',
        basicSupport: 'Basic Support',
        prioritySupport: 'Priority Support',
        reporting: 'Advanced Reporting',
        api: 'API Access',
        customization: 'Custom Integrations',
        dedicatedManager: 'Dedicated Account Manager',
      }
    },
    ar: {
      title: 'اختر خطتك',
      subtitle: 'أسعار مرنة لكل حجم عمل',
      monthly: 'شهرياً',
      branches: 'فروع',
      currentPlan: 'الخطة الحالية',
      choosePlan: 'اختر الخطة',
      mostPopular: 'الأكثر شعبية',
      free: 'مجاني',
      features: {
        unlimitedStaff: 'موظفون غير محدودون لكل فرع',
        basicSupport: 'دعم أساسي',
        prioritySupport: 'دعم ذو أولوية',
        reporting: 'تقارير متقدمة',
        api: 'وصول API',
        customization: 'تكاملات مخصصة',
        dedicatedManager: 'مدير حساب مخصص',
      }
    }
  };

  const t = translations[language];

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return <Building2 className="w-8 h-8" />;
    if (name.includes('starter')) return <Zap className="w-8 h-8" />;
    if (name.includes('business')) return <Users className="w-8 h-8" />;
    if (name.includes('professional')) return <TrendingUp className="w-8 h-8" />;
    if (name.includes('enterprise')) return <Shield className="w-8 h-8" />;
    if (name.includes('ultimate')) return <Crown className="w-8 h-8" />;
    return <Building2 className="w-8 h-8" />;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features = [];
    
    if (plan.name === 'Free') {
      features.push(`${plan.max_branches} ${t.branches}`);
      features.push('1 Manager + 1 Fahrer + 1 Assistent pro Filiale');
      features.push(t.features.basicSupport);
    } else {
      features.push(`${plan.max_branches === 999 ? '100+' : plan.max_branches} ${t.branches}`);
      features.push(t.features.unlimitedStaff);
      features.push(t.features.prioritySupport);
      
      if (plan.max_branches >= 25) {
        features.push(t.features.reporting);
        features.push(t.features.api);
      }
      
      if (plan.max_branches >= 50) {
        features.push(t.features.customization);
        features.push(t.features.dedicatedManager);
      }
    }
    
    return features;
  };

  const isPopular = (index: number) => {
    return index === 2; // Business plan
  };

  const convertPrice = (price: number) => {
    const numPrice = Number(price) || 0;
    if (selectedCurrency === 'USD') {
      return (numPrice * 1.1).toFixed(2); // Approximate conversion
    }
    return numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 mb-8">{t.subtitle}</p>
          
          {/* Language and Currency Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('de')}
                className={`px-4 py-2 rounded-lg ${language === 'de' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-2 rounded-lg ${language === 'ar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                AR
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCurrency('EUR')}
                className={`px-4 py-2 rounded-lg ${selectedCurrency === 'EUR' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                EUR €
              </button>
              <button
                onClick={() => setSelectedCurrency('USD')}
                className={`px-4 py-2 rounded-lg ${selectedCurrency === 'USD' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                USD $
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                isPopular(index) ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular(index) && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  {t.mostPopular}
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className={`mb-4 ${isPopular(index) ? 'text-blue-600' : 'text-gray-700'}`}>
                  {getPlanIcon(plan.name)}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  {plan.price_per_month === 0 ? (
                    <div className="text-4xl font-bold text-gray-900">{t.free}</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-gray-900">
                        {selectedCurrency === 'EUR' ? '€' : '$'}
                        {convertPrice(plan.price_per_month)}
                      </div>
                      <div className="text-gray-600">{t.monthly}</div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {getPlanFeatures(plan).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isPopular(index)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    // Handle plan selection
                    console.log('Selected plan:', plan.id);
                  }}
                >
                  {t.choosePlan}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'de' && 'Alle Pläne beinhalten:'}
              {language === 'en' && 'All plans include:'}
              {language === 'ar' && 'تتضمن جميع الخطط:'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {language === 'de' && 'Buchungsverwaltung'}
                    {language === 'en' && 'Booking Management'}
                    {language === 'ar' && 'إدارة الحجوزات'}
                  </h4>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {language === 'de' && 'Routen & Fahrpläne'}
                    {language === 'en' && 'Routes & Schedules'}
                    {language === 'ar' && 'المسارات والجداول'}
                  </h4>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {language === 'de' && 'Kunden-Support'}
                    {language === 'en' && 'Customer Support'}
                    {language === 'ar' && 'دعم العملاء'}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
