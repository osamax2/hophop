import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RotateCcw, Loader2, Building2, Mail, Phone, MapPin, FileText, X, Search, Filter, Download } from 'lucide-react';
import type { Language } from '../App';

interface CompanyManagementProps {
  language: Language;
}

const translations = {
  de: {
    companyManagement: 'Unternehmensverwaltung',
    addCompany: 'Unternehmen hinzufügen',
    editCompany: 'Unternehmen bearbeiten',
    companyName: 'Unternehmensname',
    email: 'E-Mail',
    phone: 'Telefon',
    address: 'Adresse',
    crNumber: 'CR-Nummer',
    description: 'Beschreibung',
    logoUrl: 'Logo-URL',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    status: 'Status',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    restore: 'Wiederherstellen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    showDeleted: 'Gelöschte anzeigen',
    hideDeleted: 'Gelöschte ausblenden',
    confirmDelete: 'Unternehmen löschen?',
    confirmRestore: 'Unternehmen wiederherstellen?',
    companyAdded: 'Unternehmen erfolgreich hinzugefügt',
    companyUpdated: 'Unternehmen erfolgreich aktualisiert',
    companyDeleted: 'Unternehmen erfolgreich gelöscht',
    companyRestored: 'Unternehmen erfolgreich wiederhergestellt',
    noCompanies: 'Keine Unternehmen gefunden',
    required: 'Erforderlich',
    trips: 'Fahrten',
    users: 'Benutzer',
    createdAt: 'Erstellt am',
    // User account section
    createUserAccount: 'Benutzerkonto erstellen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    userEmail: 'Benutzer E-Mail',
    userPhone: 'Benutzer Telefon',
    password: 'Passwort',
    optional: '(Optional)',
    userAccountInfo: 'Ein Agenten-Konto wird für dieses Unternehmen erstellt',
    search: 'Suchen',
    searchPlaceholder: 'Nach Name, E-Mail oder CR-Nummer suchen...',
    filterByStatus: 'Nach Status filtern',
    all: 'Alle',
    activeOnly: 'Nur Aktive',
    inactiveOnly: 'Nur Inaktive',
    clearFilters: 'Filter löschen',
    exportToCSV: 'Als CSV exportieren',
  },
  en: {
    companyManagement: 'Company Management',
    addCompany: 'Add Company',
    editCompany: 'Edit Company',
    companyName: 'Company Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    crNumber: 'CR Number',
    description: 'Description',
    logoUrl: 'Logo URL',
    active: 'Active',
    inactive: 'Inactive',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    restore: 'Restore',
    save: 'Save',
    cancel: 'Cancel',
    showDeleted: 'Show Deleted',
    hideDeleted: 'Hide Deleted',
    confirmDelete: 'Delete company?',
    confirmRestore: 'Restore company?',
    companyAdded: 'Company added successfully',
    companyUpdated: 'Company updated successfully',
    companyDeleted: 'Company deleted successfully',
    companyRestored: 'Company restored successfully',
    noCompanies: 'No companies found',
    required: 'Required',
    trips: 'Trips',
    users: 'Users',
    createdAt: 'Created',
    // User account section
    createUserAccount: 'Create User Account',
    firstName: 'First Name',
    lastName: 'Last Name',
    userEmail: 'User Email',
    userPhone: 'User Phone',
    password: 'Password',
    optional: '(Optional)',
    userAccountInfo: 'An agent account will be created for this company',
    search: 'Search',
    searchPlaceholder: 'Search by name, email or CR number...',
    filterByStatus: 'Filter by Status',
    all: 'All',
    activeOnly: 'Active Only',
    inactiveOnly: 'Inactive Only',
    clearFilters: 'Clear Filters',
    exportToCSV: 'Export to CSV',
  },
  ar: {
    companyManagement: 'إدارة الشركات',
    addCompany: 'إضافة شركة',
    editCompany: 'تعديل الشركة',
    companyName: 'اسم الشركة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    crNumber: 'رقم السجل التجاري',
    description: 'الوصف',
    logoUrl: 'رابط الشعار',
    active: 'نشط',
    inactive: 'غير نشط',
    status: 'الحالة',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    restore: 'استعادة',
    save: 'حفظ',
    cancel: 'إلغاء',
    showDeleted: 'إظهار المحذوفة',
    hideDeleted: 'إخفاء المحذوفة',
    confirmDelete: 'حذف الشركة؟',
    confirmRestore: 'استعادة الشركة؟',
    companyAdded: 'تمت إضافة الشركة بنجاح',
    companyUpdated: 'تم تحديث الشركة بنجاح',
    companyDeleted: 'تم حذف الشركة بنجاح',
    companyRestored: 'تمت استعادة الشركة بنجاح',
    noCompanies: 'لا توجد شركات',
    required: 'مطلوب',
    trips: 'الرحلات',
    users: 'المستخدمون',
    createdAt: 'تاريخ الإنشاء',
    // User account section
    createUserAccount: 'إنشاء حساب مستخدم',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    userEmail: 'بريد المستخدم الإلكتروني',
    userPhone: 'هاتف المستخدم',
    password: 'كلمة المرور',
    optional: '(اختياري)',
    userAccountInfo: 'سيتم إنشاء حساب وكيل لهذه الشركة',
    search: 'بحث',
    searchPlaceholder: 'البحث بالاسم أو البريد الإلكتروني أو رقم السجل التجاري...',
    filterByStatus: 'تصفية حسب الحالة',
    all: 'الكل',
    activeOnly: 'النشطة فقط',
    inactiveOnly: 'غير النشطة فقط',
    clearFilters: 'مسح الفلاتر',
  },
};

export function CompanyManagement({ language }: CompanyManagementProps) {
  const t = translations[language];
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cr_number: '',
    description: '',
    logo_url: '',
    is_active: true,
    // User account fields
    first_name: '',
    last_name: '',
    user_email: '',
    user_phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<any>({});

  const API_BASE = import.meta.env.VITE_API_BASE || "";
  const token = localStorage.getItem("token");
  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    loadCompanies();
  }, [showDeleted]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/api/admin/companies${showDeleted ? '?showDeleted=true' : ''}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Failed to load companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      alert('Failed to load companies: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.email.trim()) newErrors.email = t.required;
    if (!formData.phone.trim()) newErrors.phone = t.required;
    if (!formData.cr_number.trim()) newErrors.cr_number = t.required;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // When adding new company with user account
    if (!editingCompany && formData.user_email) {
      if (!formData.first_name.trim()) newErrors.first_name = t.required;
      if (!formData.last_name.trim()) newErrors.last_name = t.required;
      if (!formData.password.trim()) newErrors.password = t.required;
      if (!emailRegex.test(formData.user_email)) {
        newErrors.user_email = 'Invalid email format';
      }
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editingCompany) {
        // Update existing company
        const response = await fetch(
          `${API_BASE}/api/admin/companies/${editingCompany.id}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify(formData),
          }
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update company');
        }
        
        alert(t.companyUpdated);
      } else {
        // Create new company
        const response = await fetch(
          `${API_BASE}/api/admin/companies`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(formData),
          }
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create company');
        }
        
        alert(t.companyAdded);
      }
      
      setShowDialog(false);
      setEditingCompany(null);
      resetForm();
      loadCompanies();
      
    } catch (error: any) {
      console.error('Error saving company:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      cr_number: company.cr_number || '',
      description: company.description || '',
      logo_url: company.logo_url || '',
      is_active: company.is_active !== false,
      first_name: '',
      last_name: '',
      user_email: '',
      user_phone: '',
      password: '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/admin/companies/${id}`,
        { method: 'DELETE', headers }
      );
      
      if (!response.ok) throw new Error('Failed to delete company');
      
      alert(t.companyDeleted);
      loadCompanies();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm(t.confirmRestore)) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/admin/companies/${id}/restore`,
        { method: 'POST', headers }
      );
      
      if (!response.ok) throw new Error('Failed to restore company');
      
      alert(t.companyRestored);
      loadCompanies();
    } catch (error: any) {
      console.error('Error restoring company:', error);
      alert('Failed to restore company: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      cr_number: '',
      description: '',
      logo_url: '',
      is_active: true,
      first_name: '',
      last_name: '',
      user_email: '',
      user_phone: '',
      password: '',
    });
    setErrors({});
  };

  const openAddDialog = () => {
    setEditingCompany(null);
    resetForm();
    setShowDialog(true);
  };

  // Filter and search companies
  const filteredCompanies = companies.filter((company) => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.cr_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && company.is_active) ||
      (statusFilter === 'inactive' && !company.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Export filtered companies to CSV
  const exportToCSV = () => {
    if (filteredCompanies.length === 0) {
      alert(t.noCompanies);
      return;
    }

    // CSV headers
    const headers = ['ID', 'Name', 'Email', 'Phone', 'CR Number', 'Address', 'Status', 'Trips Count', 'Users Count', 'Created At', 'Description'];
    
    // CSV rows
    const rows = filteredCompanies.map(company => [
      company.id,
      `"${(company.name || '').replace(/"/g, '""')}"`,
      company.email || '',
      company.phone || '',
      company.cr_number || '',
      `"${(company.address || '').replace(/"/g, '""')}"`,
      company.is_active ? t.active : t.inactive,
      company.trips_count || 0,
      company.users_count || 0,
      new Date(company.created_at).toLocaleString(language === 'de' ? 'de-DE' : language === 'ar' ? 'ar-SY' : 'en-US'),
      `"${(company.description || '').replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    // Generate filename with filters
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `companies_${timestamp}`;
    if (searchQuery) filename += `_search`;
    if (statusFilter !== 'all') filename += `_${statusFilter}`;
    filename += '.csv';

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">{t.all}</option>
              <option value="active">{t.activeOnly}</option>
              <option value="inactive">{t.inactiveOnly}</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t.clearFilters}
            </button>
          )}

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            disabled={filteredCompanies.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {t.exportToCSV}
          </button>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredCompanies.length} {filteredCompanies.length === 1 ? t.companyManagement.slice(0, -1) : t.companyManagement}
        </div>
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          {t.companyManagement}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              showDeleted
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? t.hideDeleted : t.showDeleted}
          </button>
          {!showDeleted && (
            <button
              onClick={openAddDialog}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-5 h-5" />
              {t.addCompany}
            </button>
          )}
        </div>
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">ID</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.companyName}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.email}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.phone}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.crNumber}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.trips}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.users}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.status}</th>
                <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-600">
                    {t.noCompanies}
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr 
                    key={company.id} 
                    className={`hover:bg-gray-50 ${company.deleted_at ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-900">{company.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {company.name}
                      {company.deleted_at && (
                        <span className="ml-2 text-xs text-red-600">(Deleted)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{company.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{company.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{company.cr_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{company.trips_count || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{company.users_count || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        company.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {company.is_active ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {company.deleted_at ? (
                          <button
                            onClick={() => handleRestore(company.id)}
                            className="text-green-600 hover:text-green-700"
                            title={t.restore}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(company)}
                              className="text-blue-600 hover:text-blue-700"
                              title={t.edit}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(company.id)}
                              className="text-red-600 hover:text-red-700"
                              title={t.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Add/Edit Dialog - Outside main container */}
      {showDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDialog(false);
              setEditingCompany(null);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCompany ? t.editCompany : t.addCompany}
              </h3>
              <button
                onClick={() => {
                  setShowDialog(false);
                  setEditingCompany(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Company Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.companyName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.crNumber} *
                  </label>
                  <input
                    type="text"
                    value={formData.cr_number}
                    onChange={(e) => setFormData({ ...formData, cr_number: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.cr_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cr_number && <span className="text-xs text-red-600">{errors.cr_number}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.logoUrl}
                  </label>
                  <input
                    type="text"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.description}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>

                {editingCompany && (
                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{t.active}</span>
                    </label>
                  </div>
                )}
              </div>

              {/* User Account Section - Only for new companies */}
              {!editingCompany && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {t.createUserAccount} {t.optional}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">{t.userAccountInfo}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.firstName}
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.first_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.first_name && <span className="text-xs text-red-600">{errors.first_name}</span>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.lastName}
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.last_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.last_name && <span className="text-xs text-red-600">{errors.last_name}</span>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.userEmail}
                        </label>
                        <input
                          type="email"
                          value={formData.user_email}
                          onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.user_email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.user_email && <span className="text-xs text-red-600">{errors.user_email}</span>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.userPhone}
                        </label>
                        <input
                          type="text"
                          value={formData.user_phone}
                          onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.password}
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.password && <span className="text-xs text-red-600">{errors.password}</span>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingCompany(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t.save
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
