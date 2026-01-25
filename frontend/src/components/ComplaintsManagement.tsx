import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, Clock, Eye, MessageSquare, Search, Filter, RefreshCw, X, Send } from 'lucide-react';

interface ComplaintsManagementProps {
  language: 'de' | 'en' | 'ar';
}

interface Complaint {
  id: number;
  complaint_number: string;
  complainer_type: string;
  against_type: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
  trip_date: string | null;
  trip_route: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const translations = {
  ar: {
    title: 'إدارة الشكاوى',
    subtitle: 'عرض ومعالجة جميع الشكاوى',
    search: 'بحث...',
    filterStatus: 'حالة الشكوى',
    all: 'الكل',
    pending: 'قيد الانتظار',
    inProgress: 'قيد المعالجة',
    resolved: 'تم الحل',
    rejected: 'مرفوضة',
    refresh: 'تحديث',
    noComplaints: 'لا توجد شكاوى',
    complaintNumber: 'رقم الشكوى',
    from: 'من',
    against: 'ضد',
    subject: 'الموضوع',
    date: 'التاريخ',
    status: 'الحالة',
    actions: 'الإجراءات',
    viewDetails: 'عرض التفاصيل',
    passenger: 'راكب',
    driver: 'سائق',
    company: 'شركة',
    admin: 'إدارة',
    complaintDetails: 'تفاصيل الشكوى',
    description: 'الوصف',
    tripDate: 'تاريخ الرحلة',
    tripRoute: 'مسار الرحلة',
    contactInfo: 'معلومات التواصل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    adminNotes: 'ملاحظات الإدارة',
    notesPlaceholder: 'أضف ملاحظات حول هذه الشكوى...',
    updateStatus: 'تحديث الحالة',
    saveNotes: 'حفظ الملاحظات',
    saving: 'جاري الحفظ...',
    close: 'إغلاق',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    totalComplaints: 'إجمالي الشكاوى',
    pendingCount: 'قيد الانتظار',
    resolvedCount: 'تم حلها',
    notAvailable: 'غير متوفر',
  },
  de: {
    title: 'Beschwerdemanagement',
    subtitle: 'Alle Beschwerden anzeigen und bearbeiten',
    search: 'Suchen...',
    filterStatus: 'Status filtern',
    all: 'Alle',
    pending: 'Ausstehend',
    inProgress: 'In Bearbeitung',
    resolved: 'Gelöst',
    rejected: 'Abgelehnt',
    refresh: 'Aktualisieren',
    noComplaints: 'Keine Beschwerden',
    complaintNumber: 'Beschwerdenummer',
    from: 'Von',
    against: 'Gegen',
    subject: 'Betreff',
    date: 'Datum',
    status: 'Status',
    actions: 'Aktionen',
    viewDetails: 'Details anzeigen',
    passenger: 'Fahrgast',
    driver: 'Fahrer',
    company: 'Unternehmen',
    admin: 'Verwaltung',
    complaintDetails: 'Beschwerdedetails',
    description: 'Beschreibung',
    tripDate: 'Reisedatum',
    tripRoute: 'Reiseroute',
    contactInfo: 'Kontaktinformationen',
    email: 'E-Mail',
    phone: 'Telefon',
    adminNotes: 'Admin-Notizen',
    notesPlaceholder: 'Notizen zu dieser Beschwerde hinzufügen...',
    updateStatus: 'Status aktualisieren',
    saveNotes: 'Notizen speichern',
    saving: 'Speichern...',
    close: 'Schließen',
    loading: 'Laden...',
    error: 'Ein Fehler ist aufgetreten',
    totalComplaints: 'Gesamtbeschwerden',
    pendingCount: 'Ausstehend',
    resolvedCount: 'Gelöst',
    notAvailable: 'Nicht verfügbar',
  },
  en: {
    title: 'Complaints Management',
    subtitle: 'View and process all complaints',
    search: 'Search...',
    filterStatus: 'Filter by Status',
    all: 'All',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
    refresh: 'Refresh',
    noComplaints: 'No complaints',
    complaintNumber: 'Complaint Number',
    from: 'From',
    against: 'Against',
    subject: 'Subject',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
    viewDetails: 'View Details',
    passenger: 'Passenger',
    driver: 'Driver',
    company: 'Company',
    admin: 'Administration',
    complaintDetails: 'Complaint Details',
    description: 'Description',
    tripDate: 'Trip Date',
    tripRoute: 'Trip Route',
    contactInfo: 'Contact Information',
    email: 'Email',
    phone: 'Phone',
    adminNotes: 'Admin Notes',
    notesPlaceholder: 'Add notes about this complaint...',
    updateStatus: 'Update Status',
    saveNotes: 'Save Notes',
    saving: 'Saving...',
    close: 'Close',
    loading: 'Loading...',
    error: 'An error occurred',
    totalComplaints: 'Total Complaints',
    pendingCount: 'Pending',
    resolvedCount: 'Resolved',
    notAvailable: 'N/A',
  },
};

export function ComplaintsManagement({ language }: ComplaintsManagementProps) {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "";
  const token = localStorage.getItem("token");

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/complaints/admin`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load complaints:', response.status, errorData);
        throw new Error('Failed to load complaints');
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getPartyLabel = (type: string) => {
    switch (type) {
      case 'passenger': return t.passenger;
      case 'driver': return t.driver;
      case 'company': return t.company;
      case 'admin': return t.admin;
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            {t.pending}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            <RefreshCw className="w-3 h-3" />
            {t.inProgress}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            {t.resolved}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <X className="w-3 h-3" />
            {t.rejected}
          </span>
        );
      default:
        return status;
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.complaint_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const openDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNotes(complaint.admin_notes || '');
    setNewStatus(complaint.status);
  };

  const saveChanges = async () => {
    if (!selectedComplaint) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/complaints/admin/${selectedComplaint.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes,
        }),
      });

      if (response.ok) {
        const updatedComplaint = await response.json();
        // Update local state with the response from server
        setComplaints(complaints.map(c => 
          c.id === selectedComplaint.id 
            ? updatedComplaint
            : c
        ));
        setSelectedComplaint(null);
        // Reload to ensure sync
        loadComplaints();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save complaint:', response.status, errorData);
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving complaint:', err);
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  // Modal component rendered via portal
  const detailsModal = selectedComplaint ? createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedComplaint(null);
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col"
        style={{ 
          position: 'relative',
          zIndex: 100000,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-black p-6 flex justify-between items-center z-10 shadow-lg">
          <div>
            <h2 className="text-2xl font-bold">{t.complaintDetails}</h2>
            <p className="text-black/80">{selectedComplaint.complaint_number}</p>
          </div>
          <button
            onClick={() => setSelectedComplaint(null)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div 
          className="flex-1 p-6"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: 'calc(95vh - 160px)',
          }}
        >
          <div className="space-y-6">
            {/* Party Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">{t.from}</p>
                <p className="font-semibold text-gray-900">{selectedComplaint.name}</p>
                <p className="text-sm text-green-600">{getPartyLabel(selectedComplaint.complainer_type)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">{t.against}</p>
                <p className="font-semibold text-gray-900">{getPartyLabel(selectedComplaint.against_type)}</p>
              </div>
            </div>

            {/* Subject & Description */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.subject}</p>
              <p className="font-semibold text-gray-900">{selectedComplaint.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.description}</p>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedComplaint.description}</p>
            </div>

            {/* Trip Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t.tripDate}</p>
                <p className="text-gray-900">{selectedComplaint.trip_date || t.notAvailable}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.tripRoute}</p>
                <p className="text-gray-900">{selectedComplaint.trip_route || t.notAvailable}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.contactInfo}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t.email}</p>
                  <p className="text-gray-900">{selectedComplaint.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.phone}</p>
                  <p className="text-gray-900">{selectedComplaint.phone || t.notAvailable}</p>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.updateStatus}</p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="pending">{t.pending}</option>
                <option value="in_progress">{t.inProgress}</option>
                <option value="resolved">{t.resolved}</option>
                <option value="rejected">{t.rejected}</option>
              </select>
            </div>

            {/* Admin Notes */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.adminNotes}</p>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => setSelectedComplaint(null)}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t.close}
          </button>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? t.saving : (
              <>
                <Send className="w-5 h-5" />
                {t.saveNotes}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.totalComplaints}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.pendingCount}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.resolvedCount}</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">{t.all}</option>
              <option value="pending">{t.pending}</option>
              <option value="in_progress">{t.inProgress}</option>
              <option value="resolved">{t.resolved}</option>
              <option value="rejected">{t.rejected}</option>
            </select>
          </div>
          <button
            onClick={loadComplaints}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t.loading}</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t.noComplaints}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.complaintNumber}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.from}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.against}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.subject}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.date}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.status}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{complaint.complaint_number}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900">{complaint.name}</p>
                        <p className="text-sm text-gray-500">{getPartyLabel(complaint.complainer_type)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{getPartyLabel(complaint.against_type)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{complaint.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(complaint.status)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetails(complaint)}
                        className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {t.viewDetails}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    {detailsModal}
    </>
  );
}

export default ComplaintsManagement;
