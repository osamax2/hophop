import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import type { Language } from '../App';

interface ReviewsProps {
  language: Language;
  isLoggedIn: boolean;
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

const companies = [
  'AlKhaleej Transport',
  'Pullman Syria',
  'Karnak Tours',
  'Damascus Express',
];

const mockReviews = [
  {
    id: '1',
    company: 'AlKhaleej Transport',
    user: 'Ahmed K.',
    date: '2024-11-20',
    ratings: { punctuality: 5, friendliness: 5, cleanliness: 4 },
    comment: 'Sehr guter Service, pünktliche Abfahrt und angenehme Fahrt.',
  },
  {
    id: '2',
    company: 'Pullman Syria',
    user: 'Sara M.',
    date: '2024-11-18',
    ratings: { punctuality: 4, friendliness: 5, cleanliness: 5 },
    comment: 'Freundliches Personal und sauberer Bus. Sehr empfehlenswert!',
  },
  {
    id: '3',
    company: 'AlKhaleej Transport',
    user: 'Omar H.',
    date: '2024-11-15',
    ratings: { punctuality: 5, friendliness: 4, cleanliness: 5 },
    comment: 'Komfortabel und zuverlässig. Gerne wieder!',
  },
];

export function Reviews({ language, isLoggedIn }: ReviewsProps) {
  const t = translations[language];
  const [selectedCompany, setSelectedCompany] = useState('');
  const [ratings, setRatings] = useState({
    punctuality: 0,
    friendliness: 0,
    cleanliness: 0,
  });
  const [comment, setComment] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    
    // Mock submission
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
    
    // Reset form
    setSelectedCompany('');
    setRatings({ punctuality: 0, friendliness: 0, cleanliness: 0 });
    setComment('');
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
    return ((ratings.punctuality + ratings.friendliness + ratings.cleanliness) / 3).toFixed(1);
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

            {isLoggedIn ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Selection */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    {t.selectCompany}
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">{t.selectCompany}</option>
                    {companies.map(company => (
                      <option key={company} value={company}>{company}</option>
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
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t.submit}
                </button>
              </form>
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
          
          <div className="space-y-4">
            {mockReviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-gray-900 mb-1">{review.company}</div>
                    <div className="text-sm text-gray-600">
                      {review.user} • {review.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg text-gray-900">
                        {calculateAverage(review.ratings)}
                      </span>
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
                      <span className="text-sm text-gray-900">{review.ratings.punctuality}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t.friendliness}</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-900">{review.ratings.friendliness}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t.cleanliness}</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-900">{review.ratings.cleanliness}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
