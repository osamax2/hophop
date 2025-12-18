import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, Upload, Image, AlertCircle, TrendingUp, Clock, MapPin, Loader2, Plus, X } from 'lucide-react';
import type { Language, User } from '../App';
import { adminApi, imagesApi } from '../lib/api';
import { CitySelector } from './CitySelector';

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
    preview: 'Vorschau',
    tripAdded: 'Fahrt erfolgreich hinzugefügt',
    tripDeleted: 'Fahrt erfolgreich gelöscht',
    confirmDelete: 'Möchten Sie diese Fahrt wirklich löschen?',
    route: 'Route',
    station: 'Haltestelle',
    transportType: 'Transporttyp',
    seats: 'Sitze',
    equipment: 'Ausstattung',
    cancellationPolicy: 'Stornierungsrichtlinie',
    additionalInfo: 'Zusätzliche Informationen',
    cancel: 'Abbrechen',
    add: 'Hinzufügen',
    selectRoute: 'Route auswählen',
    selectCompany: 'Gesellschaft auswählen',
    selectTransportType: 'Transporttyp auswählen',
    selectStation: 'Haltestelle auswählen',
    time: 'Zeit',
    duration: 'Dauer',
    arrival: 'Ankunft',
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
    preview: 'Preview',
    tripAdded: 'Trip added successfully!',
    tripDeleted: 'Trip deleted successfully!',
    confirmDelete: 'Are you sure you want to delete this trip?',
    route: 'Route',
    station: 'Station',
    transportType: 'Transport Type',
    seats: 'Seats',
    equipment: 'Equipment',
    cancellationPolicy: 'Cancellation Policy',
    additionalInfo: 'Additional Info',
    cancel: 'Cancel',
    add: 'Add',
    selectRoute: 'Select Route',
    selectCompany: 'Select Company',
    selectTransportType: 'Select Transport Type',
    selectStation: 'Select Station',
    time: 'Time',
    duration: 'Duration',
    arrival: 'Arrival',
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
    preview: 'معاينة',
    tripAdded: 'تم إضافة الرحلة بنجاح!',
    tripDeleted: 'تم حذف الرحلة بنجاح!',
    confirmDelete: 'هل أنت متأكد من حذف هذه الرحلة؟',
    route: 'المسار',
    station: 'المحطة',
    transportType: 'نوع النقل',
    seats: 'المقاعد',
    equipment: 'المرافق',
    cancellationPolicy: 'سياسة الإلغاء',
    additionalInfo: 'معلومات إضافية',
    cancel: 'إلغاء',
    add: 'إضافة',
    selectRoute: 'اختر المسار',
    selectCompany: 'اختر الشركة',
    selectTransportType: 'اختر نوع النقل',
    selectStation: 'اختر المحطة',
    time: 'الوقت',
    duration: 'المدة',
    arrival: 'الوصول',
  },
};

export function AdminDashboard({ user, language }: AdminDashboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'schedules' | 'users' | 'photos' | 'import' | 'analytics'>('analytics');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  
  // Analytics data
  const [stats, setStats] = useState({ totalTrips: 0, totalUsers: 0, averageOccupancy: 0 });
  const [popularRoutes, setPopularRoutes] = useState<Array<{ route: string; trip_count: number }>>([]);
  
  // Schedules data
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  
  // Users data
  const [users, setUsers] = useState<any[]>([]);

  // Add Trip Dialog
  const [showAddTripDialog, setShowAddTripDialog] = useState(false);
  const [showAddRouteDialog, setShowAddRouteDialog] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [transportTypes, setTransportTypes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [newRoute, setNewRoute] = useState({ from_city: '', to_city: '' });
  const [newTrip, setNewTrip] = useState({
    route_id: '',
    company_id: '',
    transport_type_id: '',
    departure_station_id: '',
    arrival_station_id: '',
    departure_time: '',
    arrival_time: '',
    duration_minutes: '',
    seats_total: '',
    equipment: '',
    cancellation_policy: '',
    extra_info: '',
  });
  
  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'bus' | 'station'>('bus');
  const [entityId, setEntityId] = useState<string>('');
  
  // CSV import
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any>(null);

  // Load analytics data
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  // Load schedules data
  useEffect(() => {
    if (activeTab === 'schedules') {
      loadSchedules();
      loadTripFormData();
    }
  }, [activeTab]);

  const loadTripFormData = async () => {
    try {
      const [companiesData, transportTypesData, stationsData, citiesData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getTransportTypes(),
        adminApi.getStations(),
        adminApi.getCities(),
      ]);
      console.log('Loaded cities:', citiesData?.length || 0);
      setCompanies(companiesData);
      setTransportTypes(transportTypesData);
      setStations(stationsData);
      setCities(citiesData || []);
    } catch (err) {
      console.error('Error loading trip form data:', err);
      alert('فشل تحميل البيانات. تأكد من أن الخادم يعمل.');
    }
  };

  const handleCreateRoute = async () => {
    if (!newRoute.from_city || !newRoute.to_city) {
      alert('يرجى اختيار مدينتي المغادرة والوصول');
      return;
    }

    if (newRoute.from_city === newRoute.to_city) {
      alert('مدينة المغادرة ومدينة الوصول يجب أن تكونا مختلفتين');
      return;
    }

    try {
      const fromCity = cities.find(c => c.name === newRoute.from_city);
      const toCity = cities.find(c => c.name === newRoute.to_city);

      if (!fromCity || !toCity) {
        alert('لم يتم العثور على المدن المحددة');
        return;
      }

      await adminApi.createRoute(fromCity.id, toCity.id);
      alert('تم إنشاء المسار بنجاح');
      setNewRoute({ from_city: '', to_city: '' });
      setShowAddRouteDialog(false);
      loadSchedules(); // Reload routes
    } catch (err: any) {
      console.error('Error creating route:', err);
      alert(err.message || 'فشل إنشاء المسار');
    }
  };

  // Load users data
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsData, routesData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPopularRoutes(),
      ]);
      setStats(statsData);
      setPopularRoutes(routesData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const [tripsData, routesData] = await Promise.all([
        adminApi.getTrips(),
        adminApi.getRoutes(),
      ]);
      setTrips(tripsData);
      setRoutes(routesData);
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminApi.getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !entityId) {
      alert('Please select a file and enter entity ID');
      return;
    }

    try {
      setUploadStatus('idle');
      await adminApi.uploadImage(selectedFile, photoType, parseInt(entityId));
      setUploadStatus('success');
      setSelectedFile(null);
      setEntityId('');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err: any) {
      setUploadStatus('error');
      alert(err.message || 'Failed to upload image');
    }
  };

  const handleCSVPreview = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const preview = await adminApi.previewCSV(csvFile);
      setCsvPreview(preview);
    } catch (err: any) {
      alert(err.message || 'Failed to preview CSV');
    }
  };

  const handleCSVImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      const result = await adminApi.importTrips(csvFile);
      alert(result.message || 'Import completed');
      setCsvFile(null);
      setCsvPreview(null);
      loadSchedules(); // Refresh schedules
    } catch (err: any) {
      alert(err.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = async () => {
    try {
      setLoading(true);
      
      // Calculate duration if not provided
      let duration = parseInt(newTrip.duration_minutes);
      if (!duration && newTrip.departure_time && newTrip.arrival_time) {
        const dep = new Date(newTrip.departure_time);
        const arr = new Date(newTrip.arrival_time);
        duration = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
      }

      const tripData = {
        route_id: parseInt(newTrip.route_id),
        company_id: parseInt(newTrip.company_id),
        transport_type_id: parseInt(newTrip.transport_type_id),
        departure_station_id: parseInt(newTrip.departure_station_id),
        arrival_station_id: parseInt(newTrip.arrival_station_id),
        departure_time: newTrip.departure_time,
        arrival_time: newTrip.arrival_time,
        duration_minutes: duration,
        seats_total: parseInt(newTrip.seats_total),
        equipment: newTrip.equipment || null,
        cancellation_policy: newTrip.cancellation_policy || null,
        extra_info: newTrip.extra_info || null,
      };

      await adminApi.createTrip(tripData);
      alert(t.tripAdded || 'Trip added successfully!');
      setShowAddTripDialog(false);
      setNewTrip({
        route_id: '',
        company_id: '',
        transport_type_id: '',
        departure_station_id: '',
        arrival_station_id: '',
        departure_time: '',
        arrival_time: '',
        duration_minutes: '',
        seats_total: '',
        equipment: '',
        cancellation_policy: '',
        extra_info: '',
      });
      loadSchedules(); // Refresh trips list
    } catch (err: any) {
      alert(err.message || 'Failed to add trip');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm(t.confirmDelete || 'Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      await adminApi.deleteTrip(tripId);
      alert(t.tripDeleted || 'Trip deleted successfully!');
      loadSchedules(); // Refresh trips list
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl text-gray-900 mb-1">{stats.totalTrips}</div>
                  <div className="text-sm text-gray-700">{t.totalTrips}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl text-gray-900 mb-1">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-700">{t.totalUsers}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl text-gray-900 mb-1">{stats.averageOccupancy}%</div>
                  <div className="text-sm text-gray-700">{t.averageOccupancy}</div>
                </div>
              </div>

              {/* Popular Routes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl text-gray-900 mb-6">{t.popularRoutes}</h2>
                {popularRoutes.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No route data available</p>
                ) : (
                  <div className="space-y-4">
                    {popularRoutes.map((route, index) => {
                      const maxTrips = Math.max(...popularRoutes.map(r => r.trip_count));
                      return (
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
                                style={{ width: `${(route.trip_count / maxTrips) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{route.trip_count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl text-gray-900">{t.scheduleManagement}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddRouteDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مسار جديد
                </button>
                <button 
                  onClick={() => setShowAddTripDialog(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t.addSchedule}
                </button>
              </div>
            </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.from}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.to}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.departure}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-600">No trips found</td>
                    </tr>
                  ) : (
                    trips.slice(0, 20).map((trip: any) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{trip.from_city || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{trip.to_city || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-700">{t.edit}</button>
                            <button 
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              {t.delete}
                            </button>
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

          {/* Add Trip Dialog */}
          {showAddTripDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-2xl text-gray-900">{t.addSchedule}</h2>
                  <button
                    onClick={() => setShowAddTripDialog(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Route */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.route}</label>
                    <select
                      value={newTrip.route_id}
                      onChange={(e) => setNewTrip({ ...newTrip, route_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{t.selectRoute || 'Select Route'}</option>
                      {routes.map((route: any) => (
                        <option key={route.id} value={route.id}>
                          {route.from_city} → {route.to_city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.company}</label>
                    <select
                      value={newTrip.company_id}
                      onChange={(e) => setNewTrip({ ...newTrip, company_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{t.selectCompany || 'Select Company'}</option>
                      {companies.map((company: any) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transport Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.transportType}</label>
                    <select
                      value={newTrip.transport_type_id}
                      onChange={(e) => setNewTrip({ ...newTrip, transport_type_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{t.selectTransportType || 'Select Transport Type'}</option>
                      {transportTypes.map((type: any) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Departure Station */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.departure} {t.station}</label>
                      <select
                        value={newTrip.departure_station_id}
                        onChange={(e) => setNewTrip({ ...newTrip, departure_station_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{t.selectStation || 'Select Station'}</option>
                        {stations.map((station: any) => (
                          <option key={station.id} value={station.id}>
                            {station.city_name} - {station.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Arrival Station */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.arrival || 'Arrival'} {t.station}</label>
                      <select
                        value={newTrip.arrival_station_id}
                        onChange={(e) => setNewTrip({ ...newTrip, arrival_station_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{t.selectStation || 'Select Station'}</option>
                        {stations.map((station: any) => (
                          <option key={station.id} value={station.id}>
                            {station.city_name} - {station.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Departure Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.departure} {t.time || 'Time'}</label>
                      <input
                        type="datetime-local"
                        value={newTrip.departure_time}
                        onChange={(e) => setNewTrip({ ...newTrip, departure_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Arrival Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.arrival || 'Arrival'} {t.time || 'Time'}</label>
                      <input
                        type="datetime-local"
                        value={newTrip.arrival_time}
                        onChange={(e) => setNewTrip({ ...newTrip, arrival_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.duration || 'Duration'} (دقائق)</label>
                      <input
                        type="number"
                        value={newTrip.duration_minutes}
                        onChange={(e) => setNewTrip({ ...newTrip, duration_minutes: e.target.value })}
                        placeholder="240"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Seats */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.seats}</label>
                      <input
                        type="number"
                        value={newTrip.seats_total}
                        onChange={(e) => setNewTrip({ ...newTrip, seats_total: e.target.value })}
                        placeholder="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.equipment}</label>
                    <input
                      type="text"
                      value={newTrip.equipment}
                      onChange={(e) => setNewTrip({ ...newTrip, equipment: e.target.value })}
                      placeholder="wifi,ac,usb"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Cancellation Policy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.cancellationPolicy}</label>
                    <textarea
                      value={newTrip.cancellation_policy}
                      onChange={(e) => setNewTrip({ ...newTrip, cancellation_policy: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.additionalInfo}</label>
                    <textarea
                      value={newTrip.extra_info}
                      onChange={(e) => setNewTrip({ ...newTrip, extra_info: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleAddTrip}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      {t.add}
                    </button>
                    <button
                      onClick={() => setShowAddTripDialog(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Route Dialog */}
          {showAddRouteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-2xl text-gray-900">إضافة مسار جديد</h2>
                  <button
                    onClick={() => setShowAddRouteDialog(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* From City */}
                  <CitySelector
                    value={newRoute.from_city}
                    onChange={(city) => setNewRoute({ ...newRoute, from_city: city })}
                    placeholder="اختر مدينة المغادرة"
                    label="من"
                    required
                  />

                  {/* To City */}
                  <CitySelector
                    value={newRoute.to_city}
                    onChange={(city) => setNewRoute({ ...newRoute, to_city: city })}
                    placeholder="اختر مدينة الوصول"
                    label="إلى"
                    required
                  />

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleCreateRoute}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      إضافة
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRouteDialog(false);
                        setNewRoute({ from_city: '', to_city: '' });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
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
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-600">No users found</td>
                    </tr>
                  ) : (
                    users.map((userItem: any) => {
                      const userName = `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || userItem.email;
                      const roles = Array.isArray(userItem.roles) ? userItem.roles : [];
                      const isAdmin = roles.includes('ADMIN');
                      return (
                        <tr key={userItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{userName}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{userItem.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {isAdmin ? 'admin' : roles.includes('AGENT') ? 'agent' : 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-700">{t.changeRole}</button>
                              <button className="text-red-600 hover:text-red-700">{t.blockUser}</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-6">{t.uploadPhoto}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">{t.photoType}</label>
              <select
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value as 'bus' | 'station')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                <option value="bus">{t.busPhoto}</option>
                <option value="station">{t.stationPhoto}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Entity ID (Bus ID or Station ID)</label>
              <input
                type="number"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Enter ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">{t.selectFile}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              onClick={handleImageUpload}
              disabled={!selectedFile || !entityId || uploadStatus === 'success'}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.uploadPhoto}
            </button>
            {uploadStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                {t.uploadSuccess}
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                Upload failed. Please try again.
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
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            {csvFile && (
              <div className="flex gap-2">
                <button
                  onClick={handleCSVPreview}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.preview}
                </button>
                <button
                  onClick={handleCSVImport}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.import}
                </button>
              </div>
            )}
            {csvPreview && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Preview ({csvPreview.totalRows} rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {csvPreview.headers?.map((h: string, i: number) => (
                          <th key={i} className="px-2 py-1 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.preview?.map((row: string[], i: number) => (
                        <tr key={i} className="border-t">
                          {row.map((cell: string, j: number) => (
                            <td key={j} className="px-2 py-1">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvPreview.errors && (
                  <div className="mt-2 text-red-600 text-xs">
                    {csvPreview.errors.join(', ')}
                  </div>
                )}
              </div>
            )}
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
