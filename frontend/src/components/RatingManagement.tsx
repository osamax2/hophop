import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, RotateCcw, Edit2, Star, X } from 'lucide-react';

// Rating Management Component v2.0
interface Rating {
  id: number;
  user_id: number;
  company_id: number;
  punctuality_rating: number;
  friendliness_rating: number;
  cleanliness_rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_name: string;
  user_email: string;
  company_name: string;
  average_rating?: number | null;
}

interface Company {
  id: number;
  name: string;
}

interface RatingManagementProps {
  language: 'de' | 'en' | 'ar';
}

const RatingManagement: React.FC<RatingManagementProps> = ({ language }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [minRatingFilter, setMinRatingFilter] = useState<string>('');
  const [maxRatingFilter, setMaxRatingFilter] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states for editing
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [friendlinessRating, setFriendlinessRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const translations = {
    de: {
      title: 'Bewertungsverwaltung',
      search: 'Suchen',
      searchPlaceholder: 'Nach Benutzer, Unternehmen oder Kommentar suchen...',
      filter: 'Filter',
      company: 'Unternehmen',
      allCompanies: 'Alle Unternehmen',
      minRating: 'Min. Bewertung',
      maxRating: 'Max. Bewertung',
      showDeleted: 'Gelöschte anzeigen',
      hideDeleted: 'Gelöschte ausblenden',
      clearFilters: 'Filter löschen',
      results: 'Ergebnisse',
      user: 'Benutzer',
      punctuality: 'Pünktlichkeit',
      friendliness: 'Freundlichkeit',
      cleanliness: 'Sauberkeit',
      average: 'Durchschnitt',
      commentText: 'Kommentar',
      date: 'Datum',
      actions: 'Aktionen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      restore: 'Wiederherstellen',
      deletedOn: 'Gelöscht am',
      editRating: 'Bewertung bearbeiten',
      cancel: 'Abbrechen',
      save: 'Speichern',
      deleteConfirm: 'Möchten Sie diese Bewertung wirklich löschen?',
      permanentDeleteConfirm: 'ACHTUNG: Dies wird die Bewertung dauerhaft löschen. Fortfahren?',
      restoreConfirm: 'Möchten Sie diese Bewertung wiederherstellen?',
      success: 'Erfolgreich',
      error: 'Fehler',
      updateSuccess: 'Bewertung erfolgreich aktualisiert',
      deleteSuccess: 'Bewertung erfolgreich gelöscht',
      restoreSuccess: 'Bewertung erfolgreich wiederhergestellt',
      noComment: 'Kein Kommentar',
      loading: 'Lädt...',
      noRatings: 'Keine Bewertungen gefunden',
    },
    en: {
      title: 'Rating Management',
      search: 'Search',
      searchPlaceholder: 'Search by user, company, or comment...',
      filter: 'Filter',
      company: 'Company',
      allCompanies: 'All Companies',
      minRating: 'Min. Rating',
      maxRating: 'Max. Rating',
      showDeleted: 'Show Deleted',
      hideDeleted: 'Hide Deleted',
      clearFilters: 'Clear Filters',
      results: 'Results',
      user: 'User',
      punctuality: 'Punctuality',
      friendliness: 'Friendliness',
      cleanliness: 'Cleanliness',
      average: 'Average',
      commentText: 'Comment',
      date: 'Date',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      restore: 'Restore',
      deletedOn: 'Deleted on',
      editRating: 'Edit Rating',
      cancel: 'Cancel',
      save: 'Save',
      deleteConfirm: 'Are you sure you want to delete this rating?',
      permanentDeleteConfirm: 'WARNING: This will permanently delete the rating. Continue?',
      restoreConfirm: 'Are you sure you want to restore this rating?',
      success: 'Success',
      error: 'Error',
      updateSuccess: 'Rating updated successfully',
      deleteSuccess: 'Rating deleted successfully',
      restoreSuccess: 'Rating restored successfully',
      noComment: 'No comment',
      loading: 'Loading...',
      noRatings: 'No ratings found',
    },
    ar: {
      title: 'إدارة التقييمات',
      search: 'بحث',
      searchPlaceholder: 'البحث حسب المستخدم أو الشركة أو التعليق...',
      filter: 'فلتر',
      company: 'الشركة',
      allCompanies: 'جميع الشركات',
      minRating: 'أدنى تقييم',
      maxRating: 'أعلى تقييم',
      showDeleted: 'إظهار المحذوفة',
      hideDeleted: 'إخفاء المحذوفة',
      clearFilters: 'مسح الفلاتر',
      results: 'النتائج',
      user: 'المستخدم',
      punctuality: 'الالتزام بالمواعيد',
      friendliness: 'الود',
      cleanliness: 'النظافة',
      average: 'المتوسط',
      commentText: 'التعليق',
      date: 'التاريخ',
      actions: 'الإجراءات',
      edit: 'تعديل',
      delete: 'حذف',
      restore: 'استعادة',
      deletedOn: 'تم الحذف في',
      editRating: 'تعديل التقييم',
      cancel: 'إلغاء',
      save: 'حفظ',
      deleteConfirm: 'هل أنت متأكد من حذف هذا التقييم؟',
      permanentDeleteConfirm: 'تحذير: سيؤدي هذا إلى حذف التقييم نهائيًا. هل تريد المتابعة؟',
      restoreConfirm: 'هل أنت متأكد من استعادة هذا التقييم؟',
      success: 'نجح',
      error: 'خطأ',
      updateSuccess: 'تم تحديث التقييم بنجاح',
      deleteSuccess: 'تم حذف التقييم بنجاح',
      restoreSuccess: 'تمت استعادة التقييم بنجاح',
      noComment: 'لا يوجد تعليق',
      loading: 'جار التحميل...',
      noRatings: 'لم يتم العثور على تقييمات',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchRatings();
    fetchCompanies();
  }, [showDeleted, companyFilter, searchQuery, minRatingFilter, maxRatingFilter]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showDeleted) params.append('showDeleted', 'true');
      if (companyFilter !== 'all') params.append('company_id', companyFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (minRatingFilter) params.append('min_rating', minRatingFilter);
      if (maxRatingFilter) params.append('max_rating', maxRatingFilter);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ratings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleEdit = (rating: Rating) => {
    setEditingRating(rating);
    setPunctualityRating(rating.punctuality_rating);
    setFriendlinessRating(rating.friendliness_rating);
    setCleanlinessRating(rating.cleanliness_rating);
    setComment(rating.comment || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRating) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ratings/${editingRating.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          punctuality_rating: punctualityRating,
          friendliness_rating: friendlinessRating,
          cleanliness_rating: cleanlinessRating,
          comment: comment,
        }),
      });

      if (!response.ok) throw new Error('Failed to update rating');

      alert(t.updateSuccess);
      setShowEditModal(false);
      setEditingRating(null);
      fetchRatings();
    } catch (error) {
      console.error('Error updating rating:', error);
      alert(t.error);
    }
  };

  const handleDelete = async (id: number, permanent: boolean = false) => {
    const confirmMsg = permanent ? t.permanentDeleteConfirm : t.deleteConfirm;
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const url = permanent
        ? `/api/admin/ratings/${id}?permanent=true`
        : `/api/admin/ratings/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete rating');

      alert(t.deleteSuccess);
      fetchRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert(t.error);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm(t.restoreConfirm)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ratings/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to restore rating');

      alert(t.restoreSuccess);
      fetchRatings();
    } catch (error) {
      console.error('Error restoring rating:', error);
      alert(t.error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCompanyFilter('all');
    setMinRatingFilter('');
    setMaxRatingFilter('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStarInput = (
    value: number,
    onChange: (val: number) => void,
    label: string
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-500 transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const hasActiveFilters =
    searchQuery || companyFilter !== 'all' || minRatingFilter || maxRatingFilter;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">{t.title}</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Company Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.company}
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.allCompanies}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.minRating}
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(e.target.value)}
              placeholder="1-5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Rating */}
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.maxRating}
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={maxRatingFilter}
              onChange={(e) => setMaxRatingFilter(e.target.value)}
              placeholder="1-5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Show Deleted Toggle */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showDeleted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? t.hideDeleted : t.showDeleted}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {t.results}: {ratings.length}
        </div>
      </div>

      {/* Ratings Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">{t.loading}</div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.noRatings}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.user}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.company}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.punctuality}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.friendliness}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.cleanliness}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.average}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.commentText}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <tr
                    key={rating.id}
                    className={rating.deleted_at ? 'bg-red-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {rating.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rating.user_name}
                      </div>
                      <div className="text-sm text-gray-500">{rating.user_email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {rating.company_name || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {renderStars(rating.punctuality_rating)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {renderStars(rating.friendliness_rating)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {renderStars(rating.cleanliness_rating)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {rating.average_rating ? rating.average_rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {rating.comment || (
                        <span className="italic text-gray-400">{t.noComment}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                      {rating.deleted_at && (
                        <div className="text-xs text-red-600 mt-1">
                          {t.deletedOn}:{' '}
                          {new Date(rating.deleted_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {!rating.deleted_at ? (
                          <>
                            <button
                              onClick={() => handleEdit(rating)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title={t.edit}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rating.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title={t.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(rating.id)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title={t.restore}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rating.id, true)}
                              className="text-red-800 hover:text-red-900 p-1"
                              title={t.delete + ' (Permanent)'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRating && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingRating(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t.editRating}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRating(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>{t.user}:</strong> {editingRating.user_name} (
                  {editingRating.user_email})
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <strong>{t.company}:</strong> {editingRating.company_name || '-'}
                </div>
              </div>

              {/* Rating Inputs */}
              {renderStarInput(punctualityRating, setPunctualityRating, t.punctuality)}
              {renderStarInput(friendlinessRating, setFriendlinessRating, t.friendliness)}
              {renderStarInput(cleanlinessRating, setCleanlinessRating, t.cleanliness)}

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.commentText}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.noComment}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRating(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingManagement;
