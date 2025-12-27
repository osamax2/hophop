import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Trash2, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

interface Invoice {
  id: number;
  booking_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_date: string | null;
  created_at: string;
  deleted_at: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  booking_status: string;
  seats_booked: number;
  company_id: number;
  company_name: string;
}

interface InvoiceManagementProps {
  language: 'de' | 'en' | 'ar';
}

const translations = {
  de: {
    title: 'Rechnungsverwaltung',
    search: 'Suchen...',
    searchPlaceholder: 'Rechnungsnummer, Benutzer suchen',
    status: 'Status',
    allStatuses: 'Alle Status',
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    overdue: 'Überfällig',
    cancelled: 'Storniert',
    paymentMethod: 'Zahlungsmethode',
    allMethods: 'Alle Methoden',
    cash: 'Bargeld',
    card: 'Karte',
    bank: 'Banküberweisung',
    online: 'Online',
    fromDate: 'Von Datum',
    toDate: 'Bis Datum',
    showDeleted: 'Gelöschte anzeigen',
    clearFilters: 'Filter löschen',
    resultsCount: 'Ergebnisse',
    id: 'ID',
    invoiceNumber: 'Rechnungsnummer',
    user: 'Benutzer',
    company: 'Unternehmen',
    amount: 'Betrag',
    issueDate: 'Ausstellungsdatum',
    dueDate: 'Fälligkeitsdatum',
    paymentDate: 'Zahlungsdatum',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    restore: 'Wiederherstellen',
    permanentDelete: 'Endgültig löschen',
    loading: 'Lädt...',
    noInvoices: 'Keine Rechnungen gefunden',
    editInvoice: 'Rechnung bearbeiten',
    updateStatus: 'Status aktualisieren',
    updatePaymentMethod: 'Zahlungsmethode aktualisieren',
    updateAmount: 'Betrag aktualisieren',
    updateDueDate: 'Fälligkeitsdatum aktualisieren',
    updatePaymentDate: 'Zahlungsdatum aktualisieren',
    save: 'Speichern',
    cancel: 'Abbrechen',
    confirmDelete: 'Möchten Sie diese Rechnung wirklich löschen?',
    confirmPermanentDelete: 'Möchten Sie diese Rechnung ENDGÜLTIG löschen? Diese Aktion kann nicht rückgängig gemacht werden!',
    confirmRestore: 'Möchten Sie diese Rechnung wiederherstellen?',
    yes: 'Ja',
    no: 'Nein',
    success: 'Erfolgreich',
    error: 'Fehler',
    updateSuccess: 'Rechnung erfolgreich aktualisiert',
    deleteSuccess: 'Rechnung erfolgreich gelöscht',
    restoreSuccess: 'Rechnung erfolgreich wiederhergestellt',
    updateError: 'Fehler beim Aktualisieren der Rechnung',
    deleteError: 'Fehler beim Löschen der Rechnung',
    restoreError: 'Fehler beim Wiederherstellen der Rechnung',
  },
  en: {
    title: 'Invoice Management',
    search: 'Search...',
    searchPlaceholder: 'Search invoice number, user',
    status: 'Status',
    allStatuses: 'All Statuses',
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    paymentMethod: 'Payment Method',
    allMethods: 'All Methods',
    cash: 'Cash',
    card: 'Card',
    bank: 'Bank Transfer',
    online: 'Online',
    fromDate: 'From Date',
    toDate: 'To Date',
    showDeleted: 'Show Deleted',
    clearFilters: 'Clear Filters',
    resultsCount: 'Results',
    id: 'ID',
    invoiceNumber: 'Invoice Number',
    user: 'User',
    company: 'Company',
    amount: 'Amount',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    paymentDate: 'Payment Date',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    restore: 'Restore',
    permanentDelete: 'Permanent Delete',
    loading: 'Loading...',
    noInvoices: 'No invoices found',
    editInvoice: 'Edit Invoice',
    updateStatus: 'Update Status',
    updatePaymentMethod: 'Update Payment Method',
    updateAmount: 'Update Amount',
    updateDueDate: 'Update Due Date',
    updatePaymentDate: 'Update Payment Date',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure you want to delete this invoice?',
    confirmPermanentDelete: 'Are you sure you want to PERMANENTLY delete this invoice? This action cannot be undone!',
    confirmRestore: 'Are you sure you want to restore this invoice?',
    yes: 'Yes',
    no: 'No',
    success: 'Success',
    error: 'Error',
    updateSuccess: 'Invoice updated successfully',
    deleteSuccess: 'Invoice deleted successfully',
    restoreSuccess: 'Invoice restored successfully',
    updateError: 'Error updating invoice',
    deleteError: 'Error deleting invoice',
    restoreError: 'Error restoring invoice',
  },
  ar: {
    title: 'إدارة الفواتير',
    search: 'بحث...',
    searchPlaceholder: 'البحث عن رقم الفاتورة، المستخدم',
    status: 'الحالة',
    allStatuses: 'جميع الحالات',
    pending: 'قيد الانتظار',
    paid: 'مدفوع',
    overdue: 'متأخر',
    cancelled: 'ملغي',
    paymentMethod: 'طريقة الدفع',
    allMethods: 'جميع الطرق',
    cash: 'نقدي',
    card: 'بطاقة',
    bank: 'تحويل بنكي',
    online: 'عبر الإنترنت',
    fromDate: 'من تاريخ',
    toDate: 'إلى تاريخ',
    showDeleted: 'إظهار المحذوفة',
    clearFilters: 'مسح الفلاتر',
    resultsCount: 'النتائج',
    id: 'المعرف',
    invoiceNumber: 'رقم الفاتورة',
    user: 'المستخدم',
    company: 'الشركة',
    amount: 'المبلغ',
    issueDate: 'تاريخ الإصدار',
    dueDate: 'تاريخ الاستحقاق',
    paymentDate: 'تاريخ الدفع',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    restore: 'استعادة',
    permanentDelete: 'حذف نهائي',
    loading: 'جارٍ التحميل...',
    noInvoices: 'لم يتم العثور على فواتير',
    editInvoice: 'تعديل الفاتورة',
    updateStatus: 'تحديث الحالة',
    updatePaymentMethod: 'تحديث طريقة الدفع',
    updateAmount: 'تحديث المبلغ',
    updateDueDate: 'تحديث تاريخ الاستحقاق',
    updatePaymentDate: 'تحديث تاريخ الدفع',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirmDelete: 'هل أنت متأكد أنك تريد حذف هذه الفاتورة؟',
    confirmPermanentDelete: 'هل أنت متأكد أنك تريد حذف هذه الفاتورة نهائيًا؟ لا يمكن التراجع عن هذا الإجراء!',
    confirmRestore: 'هل أنت متأكد أنك تريد استعادة هذه الفاتورة؟',
    yes: 'نعم',
    no: 'لا',
    success: 'نجاح',
    error: 'خطأ',
    updateSuccess: 'تم تحديث الفاتورة بنجاح',
    deleteSuccess: 'تم حذف الفاتورة بنجاح',
    restoreSuccess: 'تم استعادة الفاتورة بنجاح',
    updateError: 'خطأ في تحديث الفاتورة',
    deleteError: 'خطأ في حذف الفاتورة',
    restoreError: 'خطأ في استعادة الفاتورة',
  },
};

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ language }) => {
  const t = translations[language];
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editDueDate, setEditDueDate] = useState('');
  const [editPaymentDate, setEditPaymentDate] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, paymentMethodFilter, fromDate, toDate, showDeleted, searchQuery]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (paymentMethodFilter) params.append('payment_method', paymentMethodFilter);
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (showDeleted) params.append('showDeleted', 'true');
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `http://87.106.51.243:3002/api/admin/invoices?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditStatus(invoice.status);
    setEditPaymentMethod(invoice.payment_method || '');
    setEditAmount(invoice.amount);
    setEditDueDate(invoice.due_date || '');
    setEditPaymentDate(invoice.payment_date || '');
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;

    try {
      const response = await fetch(
        `http://87.106.51.243:3002/api/admin/invoices/${editingInvoice.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: editStatus,
            payment_method: editPaymentMethod || null,
            amount: editAmount,
            due_date: editDueDate || null,
            payment_date: editPaymentDate || null,
          }),
        }
      );

      if (response.ok) {
        alert(t.updateSuccess);
        setEditingInvoice(null);
        fetchInvoices();
      } else {
        alert(t.updateError);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert(t.updateError);
    }
  };

  const handleDelete = async (id: number, permanent = false) => {
    const confirmMsg = permanent ? t.confirmPermanentDelete : t.confirmDelete;
    if (!window.confirm(confirmMsg)) return;

    try {
      const url = permanent
        ? `http://87.106.51.243:3002/api/admin/invoices/${id}?permanent=true`
        : `http://87.106.51.243:3002/api/admin/invoices/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        alert(t.deleteSuccess);
        fetchInvoices();
      } else {
        alert(t.deleteError);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert(t.deleteError);
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm(t.confirmRestore)) return;

    try {
      const response = await fetch(
        `http://87.106.51.243:3002/api/admin/invoices/${id}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        alert(t.restoreSuccess);
        fetchInvoices();
      } else {
        alert(t.restoreError);
      }
    } catch (error) {
      console.error('Error restoring invoice:', error);
      alert(t.restoreError);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentMethodFilter('');
    setFromDate('');
    setToDate('');
    setShowDeleted(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar' : language);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
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
              <option value="paid">{t.paid}</option>
              <option value="overdue">{t.overdue}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.paymentMethod}
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.allMethods}</option>
              <option value="cash">{t.cash}</option>
              <option value="card">{t.card}</option>
              <option value="bank">{t.bank}</option>
              <option value="online">{t.online}</option>
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
        {t.resultsCount}: {invoices.length}
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t.noInvoices}</p>
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
                    {t.invoiceNumber}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.user}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.company}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.amount}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.paymentMethod}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.issueDate}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.dueDate}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={invoice.deleted_at ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.user_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.amount.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {t[invoice.status as keyof typeof t] || invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.payment_method ? (t[invoice.payment_method as keyof typeof t] || invoice.payment_method) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {invoice.deleted_at ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRestore(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                            title={t.restore}
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id, true)}
                            className="text-red-600 hover:text-red-900"
                            title={t.permanentDelete}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id, false)}
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
      {editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{t.editInvoice}</h3>
              <button
                onClick={() => setEditingInvoice(null)}
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
                  <option value="paid">{t.paid}</option>
                  <option value="overdue">{t.overdue}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updatePaymentMethod}
                </label>
                <select
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-</option>
                  <option value="cash">{t.cash}</option>
                  <option value="card">{t.card}</option>
                  <option value="bank">{t.bank}</option>
                  <option value="online">{t.online}</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updateAmount}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updateDueDate}
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.updatePaymentDate}
                </label>
                <input
                  type="date"
                  value={editPaymentDate}
                  onChange={(e) => setEditPaymentDate(e.target.value)}
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
                onClick={() => setEditingInvoice(null)}
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

export default InvoiceManagement;
