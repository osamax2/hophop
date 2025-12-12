import { useState } from 'react';
import { BarChart3, Users, Calendar, Upload, Image, AlertCircle, TrendingUp, Clock, MapPin } from 'lucide-react';
import type { Language, User } from '../App';

interface AdminDashboardProps {
  user: User | null;
  language: Language;
}

const translations = {
  de: {
    adminDashboard: 'Admin-Dashboard',
    accessDenied: 'Zugriff verweigert',
    accessMessage: 'Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.',
    scheduleManagement: 'Fahrplanverwaltung',
    userManagement: 'Benutzerverwaltung',
    photoManagement: 'Fotoverwaltung',
    dataImport: 'Datenimport',
    analytics: 'Analyse & Statistiken',
    addSchedule: 'Fahrplan hinzufügen',
    from: 'Von',
    to: 'Nach',
    departure: 'Abfahrt',
    price: 'Preis',
    company: 'Gesellschaft',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    save: 'Speichern',
    uploadCSV: 'CSV hochladen',
    uploadPhoto: 'Foto hochladen',
    selectFile: 'Datei auswählen',
    import: 'Importieren',
    totalTrips: 'Fahrten gesamt',
    totalUsers: 'Benutzer gesamt',
    averageOccupancy: 'Durchschnittliche Auslastung',
    popularRoutes: 'Beliebte Routen',
    userName: 'Name',
    userEmail: 'E-Mail',
    userRole: 'Rolle',
    changeRole: 'Rolle ändern',
    blockUser: 'Benutzer sperren',
    photoType: 'Foto-Typ',
    busPhoto: 'Bus',
    stationPhoto: 'Haltestelle',
    preview: 'Vorschau',
    uploadSuccess: 'Erfolgreich hochgeladen',
    importSuccess: 'Import erfolgreich',
    importError: 'Import fehlgeschlagen',
  },
  en: {
    adminDashboard: 'Admin Dashboard',
    accessDenied: 'Access Denied',
    accessMessage: 'You do not have permission to access this area.',
    scheduleManagement: 'Schedule Management',
    userManagement: 'User Management',
    photoManagement: 'Photo Management',
    dataImport: 'Data Import',
    analytics: 'Analytics & Statistics',
    addSchedule: 'Add Schedule',
    from: 'From',
    to: 'To',
    departure: 'Departure',
    price: 'Price',
    company: 'Company',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    uploadCSV: 'Upload CSV',
    uploadPhoto: 'Upload Photo',
    selectFile: 'Select File',
    import: 'Import',
    totalTrips: 'Total Trips',
    totalUsers: 'Total Users',
    averageOccupancy: 'Average Occupancy',
    popularRoutes: 'Popular Routes',
    userName: 'Name',
    userEmail: 'Email',
    userRole: 'Role',
    changeRole: 'Change Role',
    blockUser: 'Block User',
    photoType: 'Photo Type',
    busPhoto: 'Bus',
    stationPhoto: 'Station',
    preview: 'Preview',
    uploadSuccess: 'Successfully uploaded',
    importSuccess: 'Import successful',
    importError: 'Import failed',
  },
  ar: {
    adminDashboard: 'لوحة الإدارة',
    accessDenied: 'تم رفض الوصول',
    accessMessage: 'ليس لديك إذن للوصول إلى هذه المنطقة.',
    scheduleManagement: 'إدارة الجداول',
    userManagement: 'إدارة المستخدمين',
    photoManagement: 'إدارة الصور',
    dataImport: 'استيراد البيانات',
    analytics: 'التحليلات والإحصائيات',
    addSchedule: 'إضافة جدول',
    from: 'من',
    to: 'إلى',
    departure: 'المغادرة',
    price: 'السعر',
    company: 'الشركة',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    uploadCSV: 'تحميل CSV',
    uploadPhoto: 'تحميل صورة',
    selectFile: 'اختر ملف',
    import: 'استيراد',
    totalTrips: 'إجمالي الرحلات',
    totalUsers: 'إجمالي المستخدمين',
    averageOccupancy: 'متوسط الإشغال',
    popularRoutes: 'الطرق الشائعة',
    userName: 'الاسم',
    userEmail: 'البريد الإلكتروني',
    userRole: 'الدور',
    changeRole: 'تغيير الدور',
    blockUser: 'حظر المستخدم',
    photoType: 'نوع الصورة',
    busPhoto: 'باص',
    stationPhoto: 'محطة',
    preview: 'معاينة',
    uploadSuccess: 'تم التحميل بنجاح',
    importSuccess: 'نجح الاستيراد',
    importError: 'فشل الاستيراد',
  },
};

const mockSchedules = [
  { id: '1', from: 'Damascus', to: 'Aleppo', departure: '08:00', price: 1500, company: 'AlKhaleej' },
  { id: '2', from: 'Damascus', to: 'Latakia', departure: '09:30', price: 1200, company: 'Pullman' },
  { id: '3', from: 'Aleppo', to: 'Homs', departure: '14:00', price: 800, company: 'Karnak' },
];

const mockUsers = [
  { id: '1', name: 'Ahmed K.', email: 'ahmed@example.com', role: 'user' },
  { id: '2', name: 'Sara M.', email: 'sara@example.com', role: 'user' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

const mockStats = {
  totalTrips: 156,
  totalUsers: 1247,
  averageOccupancy: 78,
  popularRoutes: [
    { route: 'Damascus → Aleppo', trips: 45 },
    { route: 'Damascus → Latakia', trips: 38 },
    { route: 'Aleppo → Homs', trips: 32 },
  ],
};

export function AdminDashboard({ user, language }: AdminDashboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'schedules' | 'users' | 'photos' | 'import' | 'analytics'>('analytics');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-3">{t.accessDenied}</h2>
          <p className="text-gray-600">{t.accessMessage}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics' as const, label: t.analytics, icon: BarChart3 },
    { id: 'schedules' as const, label: t.scheduleManagement, icon: Calendar },
    { id: 'users' as const, label: t.userManagement, icon: Users },
    { id: 'photos' as const, label: t.photoManagement, icon: Image },
    { id: 'import' as const, label: t.dataImport, icon: Upload },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">{t.adminDashboard}</h1>
        <p className="text-gray-600">Willkommen, {user.name}</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl text-gray-900 mb-1">{mockStats.totalTrips}</div>
              <div className="text-sm text-gray-700">{t.totalTrips}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl text-gray-900 mb-1">{mockStats.totalUsers}</div>
              <div className="text-sm text-gray-700">{t.totalUsers}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl text-gray-900 mb-1">{mockStats.averageOccupancy}%</div>
              <div className="text-sm text-gray-700">{t.averageOccupancy}</div>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl text-gray-900 mb-6">{t.popularRoutes}</h2>
            <div className="space-y-4">
              {mockStats.popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-900">{route.route}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-200 rounded-full h-2 w-32">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(route.trips / 50) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{route.trips}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              {t.addSchedule}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.from}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.to}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.departure}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.price}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.company}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockSchedules.map(schedule => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.from}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.to}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.departure}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.price} SYP</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.company}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700">{t.edit}</button>
                        <button className="text-red-600 hover:text-red-700">{t.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.userName}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.userEmail}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.userRole}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockUsers.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{userItem.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{userItem.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        userItem.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700">{t.changeRole}</button>
                        <button className="text-red-600 hover:text-red-700">{t.blockUser}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-6">{t.uploadPhoto}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">{t.photoType}</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900">
                <option value="bus">{t.busPhoto}</option>
                <option value="station">{t.stationPhoto}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">{t.selectFile}</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              onClick={() => {
                setUploadStatus('success');
                setTimeout(() => setUploadStatus('idle'), 3000);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.uploadPhoto}
            </button>
            {uploadStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                {t.uploadSuccess}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-6">{t.dataImport}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">{t.uploadCSV}</label>
              <input
                type="file"
                accept=".csv,.xml"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              onClick={() => {
                setUploadStatus('success');
                setTimeout(() => setUploadStatus('idle'), 3000);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.import}
            </button>
            {uploadStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                {t.importSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
