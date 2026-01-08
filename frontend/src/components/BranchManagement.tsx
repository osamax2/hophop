import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { branchesApi, subscriptionsApi } from '../lib/api';

interface Branch {
  id: number;
  company_id: number;
  name: string;
  address?: string;
  city_id?: number;
  city_name?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  staff_count: number;
  created_at: string;
}

interface Subscription {
  id: number;
  name: string;
  max_branches: number;
  current_branches: number;
  price_per_month: number;
  currency: string;
}

interface BranchManagementProps {
  companyId: number;
  language: 'de' | 'en' | 'ar';
}

const BranchManagement: React.FC<BranchManagementProps> = ({ companyId, language }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const translations = {
    de: {
      title: 'Filialen-Verwaltung',
      addBranch: 'Neue Filiale',
      subscription: 'Ihr Abonnement',
      branches: 'Filialen',
      of: 'von',
      upgrade: 'Upgrade',
      name: 'Name',
      address: 'Adresse',
      phone: 'Telefon',
      email: 'E-Mail',
      staff: 'Mitarbeiter',
      actions: 'Aktionen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      limitReached: 'Filialen-Limit erreicht',
      upgradeMessage: 'Sie haben das Maximum Ihrer Filialen erreicht. Bitte upgraden Sie Ihr Abonnement.',
      deleteConfirm: 'Möchten Sie diese Filiale wirklich löschen?',
      required: 'Pflichtfeld',
      success: 'Erfolgreich',
      error: 'Fehler',
    },
    en: {
      title: 'Branch Management',
      addBranch: 'Add Branch',
      subscription: 'Your Subscription',
      branches: 'Branches',
      of: 'of',
      upgrade: 'Upgrade',
      name: 'Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      staff: 'Staff',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      limitReached: 'Branch Limit Reached',
      upgradeMessage: 'You have reached your maximum number of branches. Please upgrade your subscription.',
      deleteConfirm: 'Are you sure you want to delete this branch?',
      required: 'Required',
      success: 'Success',
      error: 'Error',
    },
    ar: {
      title: 'إدارة الفروع',
      addBranch: 'إضافة فرع',
      subscription: 'اشتراكك',
      branches: 'الفروع',
      of: 'من',
      upgrade: 'ترقية',
      name: 'الاسم',
      address: 'العنوان',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      staff: 'الموظفون',
      actions: 'الإجراءات',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      active: 'نشط',
      inactive: 'غير نشط',
      limitReached: 'تم الوصول لحد الفروع',
      upgradeMessage: 'لقد وصلت إلى الحد الأقصى من الفروع. يرجى ترقية اشتراكك.',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الفرع؟',
      required: 'مطلوب',
      success: 'نجح',
      error: 'خطأ',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesData, subscriptionData] = await Promise.all([
        branchesApi.getByCompany(companyId),
        subscriptionsApi.getCompanySubscription(companyId),
      ]);
      setBranches(branchesData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = () => {
    if (subscription && branches.length >= subscription.max_branches) {
      alert(t.upgradeMessage);
      return;
    }
    setShowAddDialog(true);
    setEditingBranch(null);
    setFormData({ name: '', address: '', phone: '', email: '' });
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
    });
    setShowAddDialog(true);
  };

  const handleSaveBranch = async () => {
    if (!formData.name) {
      alert(`${t.name} ${t.required}`);
      return;
    }

    try {
      if (editingBranch) {
        await branchesApi.update(editingBranch.id, formData);
      } else {
        await branchesApi.create({
          company_id: companyId,
          ...formData,
        });
      }
      setShowAddDialog(false);
      fetchData();
      alert(t.success);
    } catch (error: any) {
      console.error('Error saving branch:', error);
      alert(error.message || t.error);
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      await branchesApi.delete(branchId);
      fetchData();
      alert(t.success);
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      alert(error.message || t.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isLimitReached = subscription && branches.length >= subscription.max_branches;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <button
          onClick={handleAddBranch}
          disabled={isLimitReached}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
            isLimitReached
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus className="w-5 h-5" />
          {t.addBranch}
        </button>
      </div>

      {/* Subscription Info */}
      {subscription && (
        <div className={`mb-6 p-4 rounded-lg ${isLimitReached ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className={`w-6 h-6 ${isLimitReached ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t.subscription}: {subscription.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.current_branches} {t.of} {subscription.max_branches === 999 ? '100+' : subscription.max_branches} {t.branches}
                </p>
              </div>
            </div>
            {isLimitReached && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <button
                  onClick={() => window.location.href = '/subscriptions'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  {t.upgrade}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {branch.is_active ? t.active : t.inactive}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {branch.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{branch.address}</span>
                </div>
              )}
              {branch.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{branch.phone}</span>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{branch.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{branch.staff_count} {t.staff}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditBranch(branch)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Edit2 className="w-4 h-4" />
                {t.edit}
              </button>
              <button
                onClick={() => handleDeleteBranch(branch.id)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingBranch ? t.edit : t.addBranch}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.name} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveBranch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
