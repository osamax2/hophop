import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import type { Language } from '../App';
import { ratingsApi, companiesApi, isAdminRole } from '../lib/api';

interface ReviewsProps {
  language: Language;
  isLoggedIn: boolean;
  user?: {
    role?: string;
    company_id?: number;
  } | null;
}

const translations = {
  de: {
    reviews: 'Bewertungen',
    rateCompany: 'Busgesellschaft bewerten',
    selectCompany: 'Gesellschaft auswählen',
    punctuality: 'Pünktlichkeit',
    friendliness: 'Freundlichkeit',
    cleanliness: 'Sauberkeit',
    comment: 'Kommentar (optional)',
    submit: 'Bewertung abgeben',
    allReviews: 'Alle Bewertungen',
    averageRating: 'Durchschnittsbewertung',
    loginToReview: 'Melden Sie sich an, um eine Bewertung abzugeben',
    thankYou: 'Vielen Dank für Ihre Bewertung!',
  },
  en: {
    reviews: 'Reviews',
    rateCompany: 'Rate Bus Company',
    selectCompany: 'Select Company',
    punctuality: 'Punctuality',
    friendliness: 'Friendliness',
    cleanliness: 'Cleanliness',
    comment: 'Comment (optional)',
    submit: 'Submit Review',
    allReviews: 'All Reviews',
    averageRating: 'Average Rating',
    loginToReview: 'Sign in to submit a review',
    thankYou: 'Thank you for your review!',
  },
  ar: {
    reviews: 'التقييمات',
    rateCompany: 'تقييم شركة الباص',
    selectCompany: 'اختر الشركة',
    punctuality: 'الالتزام بالمواعيد',
    friendliness: 'اللطف',
    cleanliness: 'النظافة',
    comment: 'تعليق (اختياري)',
    submit: 'إرسال التقييم',
    allReviews: 'جميع التقييمات',
    averageRating: 'متوسط التقييم',
    loginToReview: 'سجل الدخول لإرسال تقييم',
    thankYou: 'شكرًا لتقييمك!',
  },
};

export function Reviews({ language, isLoggedIn, user }: ReviewsProps) {
  const t = translations[language];
  
  // Check if user is admin or company (agent) user - they cannot add reviews
  const isAdminOrCompany = isAdminRole(user?.role) || user?.role === 'agent' || (user?.company_id !== undefined && user?.company_id !== null);
  const canRate = isLoggedIn && !isAdminOrCompany;
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [ratings, setRatings] = useState({
    punctuality: 0,
    friendliness: 0,
    cleanliness: 0,
  });
  const [comment, setComment] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companiesData, reviewsData] = await Promise.all([
          companiesApi.getAll(),
          ratingsApi.getAll(),
        ]);
        setCompanies(companiesData);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const fetchReviews = async () => {
        try {
          const data = await ratingsApi.getAll(selectedCompanyId);
          setReviews(data);
        } catch (err) {
          console.error('Error fetching reviews:', err);
        }
      };
      fetchReviews();
    }
  }, [selectedCompanyId]);

  const handleCompanyChange = (companyName: string) => {
    setSelectedCompany(companyName);
    const company = companies.find(c => c.name === companyName);
    setSelectedCompanyId(company?.id || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !selectedCompanyId) return;
    
    if (ratings.punctuality === 0 || ratings.friendliness === 0 || ratings.cleanliness === 0) {
      alert('Please rate all categories');
      return;
    }

    try {
      setSubmitting(true);
      await ratingsApi.submit({
        company_id: selectedCompanyId,
        punctuality_rating: ratings.punctuality,
        friendliness_rating: ratings.friendliness,
        cleanliness_rating: ratings.cleanliness,
        comment: comment || undefined,
      });
      
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
      
      // Refresh reviews
      const updatedReviews = await ratingsApi.getAll(selectedCompanyId);
      setReviews(updatedReviews);
      
      // Reset form
      setSelectedCompany('');
      setSelectedCompanyId(null);
      setRatings({ punctuality: 0, friendliness: 0, cleanliness: 0 });
      setComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (category: keyof typeof ratings, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRatings({ ...ratings, [category]: star })}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
            disabled={!interactive}
          >
            <Star
              className={`w-6 h-6 ${
                star <= ratings[category]
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const calculateAverage = (ratings: { punctuality: number; friendliness: number; cleanliness: number }) => {
    const avg = (ratings.punctuality + ratings.friendliness + ratings.cleanliness) / 3;
    return avg.toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">{t.reviews}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl text-gray-900 mb-6">{t.rateCompany}</h2>

            {showThankYou && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm">{t.thankYou}</span>
                </div>
              </div>
            )}

            {canRate ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Selection */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    {t.selectCompany}
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">{t.selectCompany}</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.name}>{company.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                  {/* Punctuality */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      {t.punctuality}
                    </label>
                    {renderStars('punctuality', true)}
                  </div>

                  {/* Friendliness */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      {t.friendliness}
                    </label>
                    {renderStars('friendliness', true)}
                  </div>

                  {/* Cleanliness */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      {t.cleanliness}
                    </label>
                    {renderStars('cleanliness', true)}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    {t.comment}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none"
                    placeholder="Teilen Sie Ihre Erfahrungen..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : null}
                  {t.submit}
                </button>
              </form>
            ) : isAdminOrCompany ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'الأدمن والشركات لا يمكنهم إنشاء التقييمات، يمكنهم فقط عرضها'
                    : language === 'de'
                    ? 'Admins und Unternehmen können keine Bewertungen erstellen, nur anzeigen'
                    : 'Admins and companies cannot create ratings, only view them'}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">{t.loginToReview}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl text-gray-900 mb-6">{t.allReviews}</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => {
                const avgRating = calculateAverage({
                  punctuality: review.punctuality_rating,
                  friendliness: review.friendliness_rating,
                  cleanliness: review.cleanliness_rating,
                });
                
                return (
                  <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-gray-900 mb-1">{review.company_name || 'Unknown Company'}</div>
                        <div className="text-sm text-gray-600">
                          {review.user_name || review.user_email} • {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg text-gray-900">{avgRating}</span>
                        </div>
                        <div className="text-xs text-gray-600">{t.averageRating}</div>
                      </div>
                    </div>

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">{t.punctuality}</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-900">{review.punctuality_rating}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">{t.friendliness}</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-900">{review.friendliness_rating}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">{t.cleanliness}</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-900">{review.cleanliness_rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
