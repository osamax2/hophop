import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Trash2, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

interface Booking {
  id: number;
  user_id: number;
  trip_id: number;
  booking_status: string;
  seats_booked: number;
  total_price: number;
  currency: string;
  created_at: string;
  deleted_at: string | null;
  user_name: string;
  user_email: string;
  departure_time: string;
  arrival_time: string;
  company_id: number;
  company_name: string;
  from_city: string;
  to_city: string;
}

interface BookingManagementProps {
  language: 'de' | 'en' | 'ar';
}

const translations = {
  de: {
    title: 'Buchungsverwaltung',
    search: 'Suchen...',
    searchPlaceholder: 'Benutzer suchen (Name oder E-Mail)',
    status: 'Status',
    allStatuses: 'Alle Status',
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    company: 'Unternehmen',
    allCompanies: 'Alle Unternehmen',
    fromDate: 'Von Datum',
    toDate: 'Bis Datum',
    showDeleted: 'Gelöschte anzeigen',
    clearFilters: 'Filter löschen',
    resultsCount: 'Ergebnisse',
    id: 'ID',
    user: 'Benutzer',
    route: 'Route',
    seats: 'Sitze',
    price: 'Preis',
    createdAt: 'Erstellt am',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    restore: 'Wiederherstellen',
    permanentDelete: 'Endgültig löschen',
    loading: 'Lädt...',
    noBookings: 'Keine Buchungen gefunden',
    editBooking: 'Buchung bearbeiten',
    updateStatus: 'Status aktualisieren',
    updateSeats: 'Sitze aktualisieren',
    updatePrice: 'Preis aktualisieren',
    save: 'Speichern',
    cancel: 'Abbrechen',
    confirmDelete: 'Möchten Sie diese Buchung wirklich löschen?',
    confirmPermanentDelete: 'Möchten Sie diese Buchung ENDGÜLTIG löschen? Diese Aktion kann nicht rückgängig gemacht werden!',
    confirmRestore: 'Möchten Sie diese Buchung wiederherstellen?',
    yes: 'Ja',
    no: 'Nein',
    success: 'Erfolgreich',
    error: 'Fehler',
    updateSuccess: 'Buchung erfolgreich aktualisiert',
    deleteSuccess: 'Buchung erfolgreich gelöscht',
    restoreSuccess: 'Buchung erfolgreich wiederhergestellt',
    updateError: 'Fehler beim Aktualisieren der Buchung',
    deleteError: 'Fehler beim Löschen der Buchung',
    restoreError: 'Fehler beim Wiederherstellen der Buchung',
  },
  en: {
    title: 'Booking Management',
    search: 'Search...',
    searchPlaceholder: 'Search user (name or email)',
    status: 'Status',
    allStatuses: 'All Statuses',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    company: 'Company',
    allCompanies: 'All Companies',
    fromDate: 'From Date',
    toDate: 'To Date',
    showDeleted: 'Show Deleted',
    clearFilters: 'Clear Filters',
    resultsCount: 'Results',
    id: 'ID',
    user: 'User',
    route: 'Route',
    seats: 'Seats',
    price: 'Price',
    createdAt: 'Created At',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    restore: 'Restore',
    permanentDelete: 'Permanent Delete',
    loading: 'Loading...',
    noBookings: 'No bookings found',
    editBooking: 'Edit Booking',
    updateStatus: 'Update Status',
    updateSeats: 'Update Seats',
    updatePrice: 'Update Price',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure you want to delete this booking?',
    confirmPermanentDelete: 'Are you sure you want to PERMANENTLY delete this booking? This action cannot be undone!',
    confirmRestore: 'Are you sure you want to restore this booking?',
    yes: 'Yes',
    no: 'No',
    success: 'Success',
    error: 'Error',
    updateSuccess: 'Booking updated successfully',
    deleteSuccess: 'Booking deleted successfully',
    restoreSuccess: 'Booking restored successfully',
    updateError: 'Error updating booking',
    deleteError: 'Error deleting booking',
    restoreError: 'Error restoring booking',
  },
  ar: {
    title: 'إدارة الحجوزات',
    search: 'بحث...',
    searchPlaceholder: 'البحث عن مستخدم (الاسم أو البريد الإلكتروني)',
    status: 'الحالة',
    allStatuses: 'جميع الحالات',
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    company: 'الشركة',
    allCompanies: 'جميع الشركات',
    fromDate: 'من تاريخ',
    toDate: 'إلى تاريخ',
    showDeleted: 'إظهار المحذوفة',
    clearFilters: 'مسح الفلاتر',
    resultsCount: 'النتائج',
    id: 'المعرف',
    user: 'المستخدم',
    route: 'المسار',
    seats: 'المقاعد',
    price: 'السعر',
    createdAt: 'تاريخ الإنشاء',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    restore: 'استعادة',
    permanentDelete: 'حذف نهائي',
    loading: 'جارٍ التحميل...',
    noBookings: 'لم يتم العثور على حجوزات',
    editBooking: 'تعديل الحجز',
    updateStatus: 'تحديث الحالة',
    updateSeats: 'تحديث المقاعد',
    updatePrice: 'تحديث السعر',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا الحجز؟',
    confirmPermanentDelete: 'هل أنت متأكد أنك تريد حذف هذا الحجز نهائيًا؟ لا يمكن التراجع عن هذا الإجراء!',
    confirmRestore: 'هل أنت متأكد أنك تريد استعادة هذا الحجز؟',
    yes: 'نعم',
    no: 'لا',
    success: 'نجاح',
    error: 'خطأ',
    updateSuccess: 'تم تحديث الحجز بنجاح',
    deleteSuccess: 'تم حذف الحجز بنجاح',
    restoreSuccess: 'تم استعادة الحجز بنجاح',
    updateError: 'خطأ في تحديث الحجز',
    deleteError: 'خطأ في حذف الحجز',
    restoreError: 'خطأ في استعادة الحجز',
  },
};

const BookingManagement: React.FC<BookingManagementProps> = ({ language }) => {
  const t = translations[language];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSeats, setEditSeats] = useState(0);
  const [editPrice, setEditPrice] = useState(0);

  useEffect(() => {
    fetchCompanies();
    fetchBookings();
  }, [statusFilter, companyFilter, fromDate, toDate, showDeleted, searchQuery]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://87.106.51.243:3002/api/admin/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (companyFilter) params.append('company_id', companyFilter);
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (showDeleted) params.append('showDeleted', 'true');
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `http://87.106.51.243:3002/api/admin/bookings?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setEditStatus(booking.booking_status);
    setEditSeats(booking.seats_booked);
    setEditPrice(booking.total_price);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;

    try {
      const response = await fetch(
        `http://87.106.51.243:3002/api/admin/bookings/${editingBooking.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_status: editStatus,
            seats_booked: editSeats,
            total_price: editPrice,
          }),
        }
      );

      if (response.ok) {
        alert(t.updateSuccess);
        setEditingBooking(null);
        fetchBookings();
      } else {
        alert(t.updateError);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(t.updateError);
    }
  };

  const handleDelete = async (id: number, permanent = false) => {
    const confirmMsg = permanent ? t.confirmPermanentDelete : t.confirmDelete;
    if (!window.confirm(confirmMsg)) return;

    try {
      const url = permanent
        ? `http://87.106.51.243:3002/api/admin/bookings/${id}?permanent=true`
        : `http://87.106.51.243:3002/api/admin/bookings/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        alert(t.deleteSuccess);
        fetchBookings();
      } else {
        alert(t.deleteError);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert(t.deleteError);
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm(t.confirmRestore)) return;

    try {
      const response = await fetch(
        `http://87.106.51.243:3002/api/admin/bookings/${id}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        alert(t.restoreSuccess);
        fetchBookings();
      } else {
        alert(t.restoreError);
      }
    } catch (error) {
      console.error('Error restoring booking:', error);
      alert(t.restoreError);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCompanyFilter('');
    setFromDate('');
    setToDate('');
    setShowDeleted(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'ar' ? 'ar' : language);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <h2 className="text-2xl font-bold mb-6">{t.title}</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.search}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.allStatuses}</option>
              <option value="pending">{t.pending}</option>
              <option value="confirmed">{t.confirmed}</option>
              <option value="completed">{t.completed}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.company}
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.allCompanies}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.fromDate}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.toDate}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Show Deleted & Clear Filters */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm text-gray-700">{t.showDeleted}</span>
          </label>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {t.resultsCount}: {bookings.length}
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t.noBookings}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.id}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.user}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.route}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.company}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.seats}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.price}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.createdAt}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={booking.deleted_at ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.from_city} → {booking.to_city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          booking.booking_status
                        )}`}
                      >
                        {t[booking.booking_status as keyof typeof t] || booking.booking_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.seats_booked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.total_price.toFixed(2)} {booking.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.deleted_at ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRestore(booking.id)}
                            className="text-green-600 hover:text-green-900"
                            title={t.restore}
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id, true)}
                            className="text-red-600 hover:text-red-900"
                            title={t.permanentDelete}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(booking)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id, false)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t.delete}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{t.editBooking}</h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updateStatus}
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">{t.pending}</option>
                  <option value="confirmed">{t.confirmed}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>

              {/* Seats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updateSeats}
                </label>
                <input
                  type="number"
                  min="1"
                  value={editSeats}
                  onChange={(e) => setEditSeats(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updatePrice}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {t.save}
              </button>
              <button
                onClick={() => setEditingBooking(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
