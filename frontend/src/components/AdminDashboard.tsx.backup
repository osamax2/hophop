import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, Upload, Image, AlertCircle, TrendingUp, Clock, MapPin, Loader2, Plus, X, Save, Filter, Download, Star, Edit, Trash2, Building2 } from 'lucide-react';
import type { Language, User } from '../App';
import { adminApi, imagesApi, tripsApi, citiesApi } from '../lib/api';
import { CitySelector } from './CitySelector';
import { CompanyManagement } from './CompanyManagement';

interface AdminDashboardProps {
  user: User | null;
  language: Language;
}

// Transport type translations
const getTransportTypeName = (code: string, language: Language): string => {
  const translations: Record<string, Record<Language, string>> = {
    'BUS': {
      en: 'Bus',
      de: 'Bus',
      ar: 'باص',
    },
    'VAN': {
      en: 'Van',
      de: 'Van',
      ar: 'فان',
    },
    'VIP_VAN': {
      en: 'VIP Van',
      de: 'VIP Van',
      ar: 'فان VIP',
    },
    'VIP-VAN': {
      en: 'VIP Van',
      de: 'VIP Van',
      ar: 'فان VIP',
    },
    'SHIP': {
      en: 'Ship',
      de: 'Schiff',
      ar: 'سفينة',
    },
    'TRAIN': {
      en: 'Train',
      de: 'Zug',
      ar: 'قطار',
    },
  };

  const normalizedCode = code?.toUpperCase() || '';
  const typeTranslations = translations[normalizedCode];
  
  if (typeTranslations && typeTranslations[language]) {
    return typeTranslations[language];
  }
  
  // Fallback to original code if no translation found
  return code || '';
};

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
    userRole: 'Kontotyp',
    changeRole: 'Kontotyp ändern',
    editProfile: 'Profil bearbeiten',
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
    arrivalTimeAfterDeparture: 'Die Ankunftszeit muss nach der Abfahrtszeit liegen',
    deletePermanently: 'Diese deaktivierte Fahrt dauerhaft löschen?',
    deletePermanentlyConfirm: 'Möchten Sie diese deaktivierte Fahrt wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    welcomeMessage: 'Willkommen',
    filterTrips: 'Reisen filtern',
    exportTrips: 'Reisen exportieren',
    filterByTime: 'Nach Zeit filtern',
    filterByDate: 'Nach Datum filtern',
    filterByCity: 'Nach Stadt filtern',
    filterByCompany: 'Nach Unternehmen filtern',
    fromTime: 'Von Zeit',
    toTime: 'Bis Zeit',
    fromDate: 'Von Datum',
    toDate: 'Bis Datum',
    selectCity: 'Stadt auswählen',
    selectCompany: 'Unternehmen auswählen',
    clearFilters: 'Filter löschen',
    exportToCSV: 'Als CSV exportieren',
    noTripsMatch: 'Keine Reisen entsprechen den Filtern',
    ratingsManagement: 'Bewertungsverwaltung',
    companyManagement: 'Unternehmensverwaltung',
    user: 'Benutzer',
    company: 'Unternehmen',
    punctuality: 'Pünktlichkeit',
    friendliness: 'Freundlichkeit',
    cleanliness: 'Sauberkeit',
    comment: 'Kommentar',
    date: 'Datum',
    editRating: 'Bewertung bearbeiten',
    deleteRating: 'Bewertung löschen',
    confirmDeleteRating: 'Möchten Sie diese Bewertung wirklich löschen?',
    ratingUpdated: 'Bewertung erfolgreich aktualisiert',
    ratingDeleted: 'Bewertung erfolgreich gelöscht',
    updateRating: 'Bewertung aktualisieren',
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
    userRole: 'Account Type',
    changeRole: 'Change Account Type',
    editProfile: 'Edit Profile',
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
    arrivalTimeAfterDeparture: 'Arrival time must be after departure time',
    deletePermanently: 'Permanently delete this inactive trip?',
    deletePermanentlyConfirm: 'Are you sure you want to permanently delete this inactive trip? This action cannot be undone.',
    welcomeMessage: 'Welcome',
    filterTrips: 'Filter Trips',
    exportTrips: 'Export Trips',
    filterByTime: 'Filter by Time',
    filterByDate: 'Filter by Date',
    filterByCity: 'Filter by City',
    filterByCompany: 'Filter by Company',
    fromTime: 'From Time',
    toTime: 'To Time',
    fromDate: 'From Date',
    toDate: 'To Date',
    selectCity: 'Select City',
    selectCompany: 'Select Company',
    clearFilters: 'Clear Filters',
    exportToCSV: 'Export to CSV',
    noTripsMatch: 'No trips match the filters',
    ratingsManagement: 'Ratings Management',
    companyManagement: 'Company Management',
    user: 'User',
    company: 'Company',
    punctuality: 'Punctuality',
    friendliness: 'Friendliness',
    cleanliness: 'Cleanliness',
    comment: 'Comment',
    date: 'Date',
    editRating: 'Edit Rating',
    deleteRating: 'Delete Rating',
    confirmDeleteRating: 'Are you sure you want to delete this rating?',
    ratingUpdated: 'Rating updated successfully',
    ratingDeleted: 'Rating deleted successfully',
    updateRating: 'Update Rating',
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
    userRole: 'نوع الحساب',
    changeRole: 'تغيير نوع الحساب',
    editProfile: 'تعديل الملف',
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
    duration: 'المدة المتوقعة',
    arrival: 'الوصول',
    arrivalTimeAfterDeparture: 'يجب أن يكون وقت الوصول بعد وقت المغادرة',
    deletePermanently: 'حذف هذه الرحلة المعطلة نهائياً؟',
    deletePermanentlyConfirm: 'هل أنت متأكد من حذف هذه الرحلة المعطلة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
    welcomeMessage: 'أهلاً',
    filterTrips: 'فلترة الرحلات',
    exportTrips: 'تصدير الرحلات',
    filterByTime: 'فلترة حسب الوقت',
    filterByDate: 'فلترة حسب التاريخ',
    filterByCity: 'فلترة حسب المدينة',
    filterByCompany: 'فلترة حسب الشركة',
    fromTime: 'من الوقت',
    toTime: 'إلى الوقت',
    fromDate: 'من التاريخ',
    toDate: 'إلى التاريخ',
    selectCity: 'اختر المدينة',
    selectCompany: 'اختر الشركة',
    clearFilters: 'مسح الفلاتر',
    exportToCSV: 'تصدير كملف CSV',
    noTripsMatch: 'لا توجد رحلات تطابق الفلاتر',
    ratingsManagement: 'إدارة التقييمات',
    companyManagement: 'إدارة الشركات',
    user: 'المستخدم',
    company: 'الشركة',
    punctuality: 'الدقة',
    friendliness: 'الود',
    cleanliness: 'النظافة',
    comment: 'التعليق',
    date: 'التاريخ',
    editRating: 'تعديل التقييم',
    deleteRating: 'حذف التقييم',
    confirmDeleteRating: 'هل أنت متأكد من حذف هذا التقييم؟',
    ratingUpdated: 'تم تحديث التقييم بنجاح',
    ratingDeleted: 'تم حذف التقييم بنجاح',
    updateRating: 'تحديث التقييم',
  },
};

export function AdminDashboard({ user, language }: AdminDashboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'schedules' | 'users' | 'photos' | 'import' | 'analytics' | 'ratings' | 'companies'>('analytics');
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
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  
  // Edit Profile Dialog
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [editProfileData, setEditProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'User'
  });

  // Add/Edit Trip Dialog
  const [showAddTripDialog, setShowAddTripDialog] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
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
    price: '',
    currency: 'SYP',
    bus_number: '',
    driver_name: '',
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

  // Filters for trips
  const [filterTimeFrom, setFilterTimeFrom] = useState<string>('');
  const [filterTimeTo, setFilterTimeTo] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [allCities, setAllCities] = useState<any[]>([]);
  const [showTripsList, setShowTripsList] = useState<boolean>(false);
  
  // Filters for users
  const [showUsersList, setShowUsersList] = useState<boolean>(false);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');

  // Ratings data
  const [ratings, setRatings] = useState<any[]>([]);
  const [showEditRatingDialog, setShowEditRatingDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const [editRatingData, setEditRatingData] = useState({
    punctuality_rating: 0,
    friendliness_rating: 0,
    cleanliness_rating: 0,
    comment: '',
  });

  // Load analytics data
  useEffect(() => {
    if (activeTab === 'analytics') {
      console.log('Analytics tab activated, loading data...');
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

  // Load cities when Add Route Dialog opens
  useEffect(() => {
    if (showAddRouteDialog && cities.length === 0) {
      loadTripFormData();
    }
  }, [showAddRouteDialog]);

  // Load cities when Add Trip Dialog opens
  useEffect(() => {
    if (showAddTripDialog && cities.length === 0) {
      loadTripFormData();
    }
  }, [showAddTripDialog]);

  // Auto-calculate duration when departure_time or arrival_time changes
  useEffect(() => {
    if (newTrip.departure_time && newTrip.arrival_time) {
      const dep = new Date(newTrip.departure_time);
      const arr = new Date(newTrip.arrival_time);
      
      if (!isNaN(dep.getTime()) && !isNaN(arr.getTime()) && arr > dep) {
        const durationMinutes = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
        setNewTrip(prev => ({ ...prev, duration_minutes: String(durationMinutes) }));
      }
    }
  }, [newTrip.departure_time, newTrip.arrival_time]);

  const loadTripFormData = async () => {
    try {
      const [companiesData, transportTypesData, stationsData, citiesData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getTransportTypes(),
        adminApi.getStations(),
        adminApi.getCities(), // Use adminApi.getCities()
      ]);
      console.log('Loaded cities:', citiesData?.length || 0);
      console.log('Cities data:', citiesData);
      setCompanies(companiesData);
      setTransportTypes(transportTypesData);
      setStations(stationsData);
      setCities(Array.isArray(citiesData) ? citiesData : []);
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
  }, [activeTab, showDeletedUsers]);

  // Load ratings data
  useEffect(() => {
    if (activeTab === 'ratings') {
      loadRatings();
    }
  }, [activeTab]);

  // Debug: Monitor dialog state changes
  useEffect(() => {
    if (showEditRatingDialog) {
      console.log('Dialog is now visible. selectedRating:', selectedRating);
    }
  }, [showEditRatingDialog, selectedRating]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Loading analytics data...');
      
      // Try to load stats and routes separately to see which one fails
      let statsData = { totalTrips: 0, totalUsers: 0, averageOccupancy: 0 };
      let routesData: any[] = [];
      
      try {
        statsData = await adminApi.getStats();
        console.log('Stats data loaded:', statsData);
      } catch (statsError: any) {
        console.error('Error loading stats:', statsError);
        // Set default values on error
        statsData = { totalTrips: 0, totalUsers: 0, averageOccupancy: 0 };
      }
      
      try {
        routesData = await adminApi.getPopularRoutes();
        console.log('Routes data loaded:', routesData);
        routesData = Array.isArray(routesData) ? routesData : [];
      } catch (routesError: any) {
        console.error('Error loading popular routes:', routesError);
        // Set empty array on error
        routesData = [];
      }
      
      setStats(statsData);
      setPopularRoutes(routesData);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      console.error('Error details:', {
        status: err.status,
        message: err.message,
        details: err.details,
        stack: err.stack
      });
      
      // Handle 401 Unauthorized - token expired or missing
      if (err.status === 401 || err.message?.includes('token') || err.message?.includes('Unauthorized')) {
        const authErrorMsg = language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : language === 'de' 
          ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' 
          : 'Session expired. Please log in again.';
        alert(authErrorMsg);
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }
      
      // Set empty data on error to prevent display issues
      setStats({ totalTrips: 0, totalUsers: 0, averageOccupancy: 0 });
      setPopularRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (showAll: boolean = false) => {
    try {
      setLoading(true);
      // Load all trips including inactive ones for admin management
      const [tripsData, routesData] = await Promise.all([
        adminApi.getTrips(showAll),
        adminApi.getRoutes(),
      ]);
      
      console.log('Loaded trips from server:', tripsData.length);
      console.log('Trip IDs:', tripsData.map((t: any) => ({ id: t.id, is_active: t.is_active })));
      
      // Type assertion for tripsData
      const typedTripsData = tripsData as any[];
      setTrips(typedTripsData);
      setRoutes(routesData);
    } catch (err: any) {
      console.error('Error loading schedules:', err);
      alert(language === 'ar' 
        ? `خطأ في تحميل الجداول: ${err.message || 'حدث خطأ غير معروف'}`
        : language === 'de'
        ? `Fehler beim Laden der Zeitpläne: ${err.message || 'Unbekannter Fehler'}`
        : `Error loading schedules: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter trips based on filters
  const getFilteredTrips = () => {
    let filtered = [...trips];

    // Filter by date
    if (filterDateFrom) {
      filtered = filtered.filter((trip: any) => {
        if (!trip.departure_time) return false;
        const tripDate = new Date(trip.departure_time);
        tripDate.setHours(0, 0, 0, 0);
        const filterFrom = new Date(filterDateFrom);
        filterFrom.setHours(0, 0, 0, 0);
        return tripDate >= filterFrom;
      });
    }
    if (filterDateTo) {
      filtered = filtered.filter((trip: any) => {
        if (!trip.departure_time) return false;
        const tripDate = new Date(trip.departure_time);
        tripDate.setHours(0, 0, 0, 0);
        const filterTo = new Date(filterDateTo);
        filterTo.setHours(23, 59, 59, 999);
        return tripDate <= filterTo;
      });
    }

    // Filter by time
    if (filterTimeFrom) {
      filtered = filtered.filter((trip: any) => {
        if (!trip.departure_time) return false;
        const tripTime = new Date(trip.departure_time).getHours() * 60 + new Date(trip.departure_time).getMinutes();
        const filterFrom = parseInt(filterTimeFrom.split(':')[0]) * 60 + parseInt(filterTimeFrom.split(':')[1] || '0');
        return tripTime >= filterFrom;
      });
    }
    if (filterTimeTo) {
      filtered = filtered.filter((trip: any) => {
        if (!trip.departure_time) return false;
        const tripTime = new Date(trip.departure_time).getHours() * 60 + new Date(trip.departure_time).getMinutes();
        const filterTo = parseInt(filterTimeTo.split(':')[0]) * 60 + parseInt(filterTimeTo.split(':')[1] || '0');
        return tripTime <= filterTo;
      });
    }

    // Filter by city (from or to)
    if (filterCity) {
      filtered = filtered.filter((trip: any) => {
        return (trip.from_city && trip.from_city.toLowerCase().includes(filterCity.toLowerCase())) ||
               (trip.to_city && trip.to_city.toLowerCase().includes(filterCity.toLowerCase()));
      });
    }

    // Filter by company
    if (filterCompany) {
      filtered = filtered.filter((trip: any) => {
        const companyName = trip.company_name || '';
        return companyName.toLowerCase().includes(filterCompany.toLowerCase());
      });
    }

    return filtered;
  };

  // Export filtered trips to CSV
  const exportTripsToCSV = () => {
    const filteredTrips = getFilteredTrips();
    
    if (filteredTrips.length === 0) {
      alert(language === 'ar' 
        ? 'لا توجد رحلات للتصدير'
        : language === 'de'
        ? 'Keine Reisen zum Exportieren'
        : 'No trips to export');
      return;
    }

    // Prepare CSV headers
    const headers = [
      'ID',
      language === 'ar' ? 'من' : language === 'de' ? 'Von' : 'From',
      language === 'ar' ? 'إلى' : language === 'de' ? 'Nach' : 'To',
      language === 'ar' ? 'وقت المغادرة' : language === 'de' ? 'Abfahrtszeit' : 'Departure Time',
      language === 'ar' ? 'وقت الوصول' : language === 'de' ? 'Ankunftszeit' : 'Arrival Time',
      language === 'ar' ? 'الشركة' : language === 'de' ? 'Unternehmen' : 'Company',
      language === 'ar' ? 'المقاعد المتاحة' : language === 'de' ? 'Verfügbare Plätze' : 'Available Seats',
      language === 'ar' ? 'الحالة' : language === 'de' ? 'Status' : 'Status',
    ];

    // Prepare CSV rows
    const rows = filteredTrips.map((trip: any) => {
      const departureTime = trip.departure_time 
        ? new Date(trip.departure_time).toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : 'N/A';
      const arrivalTime = trip.arrival_time 
        ? new Date(trip.arrival_time).toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : 'N/A';
      
      return [
        trip.id || '',
        trip.from_city || 'N/A',
        trip.to_city || 'N/A',
        departureTime,
        arrivalTime,
        trip.company_name || 'N/A',
        trip.seats_available || '0',
        trip.is_active ? (language === 'ar' ? 'نشط' : language === 'de' ? 'Aktiv' : 'Active') : (language === 'ar' ? 'معطل' : language === 'de' ? 'Inaktiv' : 'Inactive'),
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trips_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilterTimeFrom('');
    setFilterTimeTo('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterCity('');
    setFilterCompany('');
  };

  // Clear user filters
  const clearUserFilters = () => {
    setFilterRole('');
    setFilterName('');
  };

  // Filter users by role and name
  const getFilteredUsers = () => {
    let filtered = [...users];

    // Filter by name
    if (filterName) {
      const nameFilter = filterName.toLowerCase();
      filtered = filtered.filter((user: any) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(nameFilter) || email.includes(nameFilter);
      });
    }

    // Filter by role
    if (filterRole) {
      filtered = filtered.filter((user: any) => {
        const roles = Array.isArray(user.roles) ? user.roles : [];
        if (filterRole === 'Administrator') {
          return roles.includes('Administrator') || roles.includes('ADMIN');
        } else if (filterRole === 'Agent') {
          return roles.includes('Agent') || roles.includes('AGENT');
        } else if (filterRole === 'User') {
          return !roles.includes('Administrator') && !roles.includes('ADMIN') && !roles.includes('Agent') && !roles.includes('AGENT');
        }
        return true;
      });
    }

    return filtered;
  };

  // Export users to CSV
  const exportUsersToCSV = () => {
    const filteredUsers = getFilteredUsers();
    
    if (filteredUsers.length === 0) {
      alert(language === 'ar' 
        ? 'لا يوجد مستخدمون للتصدير'
        : language === 'de'
        ? 'Keine Benutzer zum Exportieren'
        : 'No users to export');
      return;
    }

    // Prepare CSV headers
    const headers = [
      language === 'ar' ? 'الاسم' : language === 'de' ? 'Name' : 'Name',
      language === 'ar' ? 'البريد الإلكتروني' : language === 'de' ? 'E-Mail' : 'Email',
      language === 'ar' ? 'رقم الهاتف' : language === 'de' ? 'Telefonnummer' : 'Phone',
      language === 'ar' ? 'نوع الحساب' : language === 'de' ? 'Kontotyp' : 'Account Type',
    ];

    // Prepare CSV rows
    const rows = filteredUsers.map((user: any) => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'N/A';
      const roles = Array.isArray(user.roles) ? user.roles : [];
      let roleDisplay = 'User';
      if (roles.includes('Administrator') || roles.includes('ADMIN')) {
        roleDisplay = 'Administrator';
      } else if (roles.includes('Agent') || roles.includes('AGENT')) {
        roleDisplay = 'Agent';
      }
      
      return [
        fullName,
        user.email || 'N/A',
        user.phone || 'N/A',
        roleDisplay,
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminApi.getUsers(showDeletedUsers);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      setLoading(true);
      const ratingsData = await adminApi.getRatings();
      console.log('Loaded ratings:', ratingsData);
      console.log('Number of ratings:', ratingsData?.length || 0);
      setRatings(ratingsData || []);
    } catch (err) {
      console.error('Error loading ratings:', err);
      alert(language === 'ar' 
        ? `خطأ في تحميل التقييمات: ${err instanceof Error ? err.message : 'حدث خطأ غير معروف'}`
        : language === 'de'
        ? `Fehler beim Laden der Bewertungen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
        : `Error loading ratings: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRatingClick = (rating: any) => {
    console.log('handleEditRatingClick called with rating:', rating);
    if (!rating) {
      console.error('Rating is null or undefined');
      return;
    }
    try {
      setSelectedRating(rating);
      setEditRatingData({
        punctuality_rating: rating.punctuality_rating || 0,
        friendliness_rating: rating.friendliness_rating || 0,
        cleanliness_rating: rating.cleanliness_rating || 0,
        comment: rating.comment || '',
      });
      setShowEditRatingDialog(true);
      console.log('Dialog state set to true, showEditRatingDialog should be true');
    } catch (error) {
      console.error('Error in handleEditRatingClick:', error);
    }
  };

  const handleUpdateRating = async () => {
    if (!selectedRating) return;

    try {
      setLoading(true);
      await adminApi.updateRating(selectedRating.id, editRatingData);
      alert(language === 'ar' ? t.ratingUpdated : language === 'de' ? t.ratingUpdated : t.ratingUpdated);
      setShowEditRatingDialog(false);
      setSelectedRating(null);
      loadRatings();
    } catch (err: any) {
      console.error('Error updating rating:', err);
      alert(language === 'ar' 
        ? `خطأ في تحديث التقييم: ${err.message || 'حدث خطأ غير معروف'}`
        : language === 'de'
        ? `Fehler beim Aktualisieren der Bewertung: ${err.message || 'Unbekannter Fehler'}`
        : `Error updating rating: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId: number) => {
    if (!window.confirm(language === 'ar' ? t.confirmDeleteRating : language === 'de' ? t.confirmDeleteRating : t.confirmDeleteRating)) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.deleteRating(ratingId);
      alert(language === 'ar' ? t.ratingDeleted : language === 'de' ? t.ratingDeleted : t.ratingDeleted);
      loadRatings();
    } catch (err: any) {
      console.error('Error deleting rating:', err);
      alert(language === 'ar' 
        ? `خطأ في حذف التقييم: ${err.message || 'حدث خطأ غير معروف'}`
        : language === 'de'
        ? `Fehler beim Löschen der Bewertung: ${err.message || 'Unbekannter Fehler'}`
        : `Error deleting rating: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number, currentIsActive: boolean) => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      alert(language === 'ar' 
        ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
        : language === 'de' 
        ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
        : 'Session expired. Please log in again.');
      window.location.reload();
      return;
    }

    const confirmMessage = currentIsActive
      ? (language === 'ar' ? 'هل أنت متأكد من حظر هذا المستخدم؟' : language === 'de' ? 'Sind Sie sicher, dass Sie diesen Benutzer sperren möchten?' : 'Are you sure you want to ban this user?')
      : (language === 'ar' ? 'هل أنت متأكد من إلغاء حظر هذا المستخدم؟' : language === 'de' ? 'Sind Sie sicher, dass Sie diesen Benutzer entsperren möchten?' : 'Are you sure you want to unban this user?');
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.banUser(userId, !currentIsActive);
      alert(language === 'ar' 
        ? (currentIsActive ? 'تم حظر المستخدم بنجاح' : 'تم إلغاء حظر المستخدم بنجاح')
        : language === 'de' 
        ? (currentIsActive ? 'Benutzer erfolgreich gesperrt' : 'Benutzer erfolgreich entsperrt')
        : (currentIsActive ? 'User banned successfully' : 'User unbanned successfully'));
      loadUsers(); // Refresh users list
    } catch (err: any) {
      console.error('Error banning user:', err);
      
      // Handle 401 Unauthorized - token expired or missing
      if (err.status === 401 || err.message?.includes('token') || err.message?.includes('Unauthorized')) {
        const authErrorMsg = language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : language === 'de' 
          ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' 
          : 'Session expired. Please log in again.';
        alert(authErrorMsg);
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      alert(language === 'ar' 
        ? 'فشل حظر المستخدم. يرجى المحاولة مرة أخرى.'
        : language === 'de' 
        ? 'Fehler beim Sperren des Benutzers. Bitte versuchen Sie es erneut.'
        : 'Failed to ban user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfileClick = (userItem: any) => {
    console.log('handleEditProfileClick called with user:', userItem);
    try {
      // Set initial data based on current user data
      const roles = Array.isArray(userItem.roles) ? userItem.roles : [];
      let currentRole = 'User';
      if (roles.includes('Administrator') || roles.includes('ADMIN')) {
        currentRole = 'Administrator';
      } else if (roles.includes('Agent') || roles.includes('AGENT')) {
        currentRole = 'Agent';
      }
      
      setEditProfileData({
        first_name: userItem.first_name || '',
        last_name: userItem.last_name || '',
        email: userItem.email || '',
        password: '',
        role: currentRole
      });
      setSelectedUserForEdit(userItem);
      setShowEditProfileDialog(true);
      console.log('Edit profile dialog should be shown now, showEditProfileDialog:', true);
    } catch (error) {
      console.error('Error in handleEditProfileClick:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      alert(language === 'ar' 
        ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
        : language === 'de' 
        ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
        : 'Session expired. Please log in again.');
      window.location.reload();
      return;
    }

    const confirmMessage = language === 'ar' 
      ? 'هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.'
      : language === 'de' 
      ? 'Sind Sie sicher, dass Sie dieses Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
      : 'Are you sure you want to delete this account? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.deleteUser(userId);
      alert(language === 'ar' 
        ? 'تم حذف الحساب بنجاح'
        : language === 'de' 
        ? 'Konto erfolgreich gelöscht'
        : 'Account deleted successfully');
      
      setShowEditProfileDialog(false);
      setSelectedUserForEdit(null);
      setEditProfileData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'User'
      });
      loadUsers(); // Refresh users list
    } catch (err: any) {
      console.error('Error deleting user:', err);
      
      // Handle 401 Unauthorized - token expired or missing
      if (err.status === 401 || err.message?.includes('token') || err.message?.includes('Unauthorized')) {
        const authErrorMsg = language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : language === 'de' 
          ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' 
          : 'Session expired. Please log in again.';
        alert(authErrorMsg);
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      const errorMsg = err.message || (language === 'ar' 
        ? 'فشل حذف الحساب. يرجى المحاولة مرة أخرى.'
        : language === 'de' 
        ? 'Fehler beim Löschen des Kontos. Bitte versuchen Sie es erneut.'
        : 'Failed to delete account. Please try again.');
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfileEdit = async () => {
    if (!selectedUserForEdit) {
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      alert(language === 'ar' 
        ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
        : language === 'de' 
        ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
        : 'Session expired. Please log in again.');
      window.location.reload();
      return;
    }

    // Validate required fields
    if (!editProfileData.email) {
      alert(language === 'ar' 
        ? 'البريد الإلكتروني مطلوب'
        : language === 'de' 
        ? 'E-Mail ist erforderlich'
        : 'Email is required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare update data
      const updateData: any = {
        first_name: editProfileData.first_name || null,
        last_name: editProfileData.last_name || null,
        email: editProfileData.email,
        role_names: [editProfileData.role]
      };

      // Only include password if it's not empty
      if (editProfileData.password && editProfileData.password.trim() !== '') {
        updateData.password = editProfileData.password;
      }

      await adminApi.updateUserProfile(selectedUserForEdit.id, updateData);
      
      alert(language === 'ar' 
        ? 'تم تحديث ملف المستخدم بنجاح'
        : language === 'de' 
        ? 'Benutzerprofil erfolgreich aktualisiert'
        : 'User profile updated successfully');
      
      setShowEditProfileDialog(false);
      setSelectedUserForEdit(null);
      setEditProfileData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'User'
      });
      loadUsers(); // Refresh users list
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      
      // Handle 401 Unauthorized - token expired or missing
      if (err.status === 401 || err.message?.includes('token') || err.message?.includes('Unauthorized')) {
        const authErrorMsg = language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : language === 'de' 
          ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' 
          : 'Session expired. Please log in again.';
        alert(authErrorMsg);
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      const errorMsg = err.message || (language === 'ar' 
        ? 'فشل تحديث ملف المستخدم. يرجى المحاولة مرة أخرى.'
        : language === 'de' 
        ? 'Fehler beim Aktualisieren des Benutzerprofils. Bitte versuchen Sie es erneut.'
        : 'Failed to update user profile. Please try again.');
      alert(errorMsg);
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

  const handleEditTrip = async (tripId: number) => {
    try {
      setLoading(true);
      console.log('Loading trip details for ID:', tripId);
      
      // Load trip details
      const trip = await tripsApi.getById(tripId);
      
      console.log('Loaded trip data:', trip);
      
      if (!trip) {
        throw new Error('Trip data is empty');
      }
      
      // Find route to get city names
      const route = routes.find((r: any) => r.id === trip.route_id);
      
      // Convert trip data to form format
      // Get trip price from trip_fares if available
      let tripPrice = '';
      let tripCurrency = 'SYP';
      if (trip.id) {
        try {
          const tripIdNum = typeof trip.id === 'string' ? parseInt(trip.id) : trip.id;
          const fares = await adminApi.getFares(tripIdNum);
          if (fares && Array.isArray(fares) && fares.length > 0) {
            tripPrice = String(fares[0].price || '');
            tripCurrency = fares[0].currency || 'SYP';
          }
        } catch (e) {
          console.log('Could not load trip fares:', e);
        }
      }

      setNewTrip({
        from_city: route?.from_city || trip.from_city || '',
        to_city: route?.to_city || trip.to_city || '',
        route_id: String(trip.route_id || ''),
        company_id: String(trip.company_id || ''),
        transport_type_id: String(trip.transport_type_id || ''),
        departure_station_id: String(trip.departure_station_id || ''),
        arrival_station_id: String(trip.arrival_station_id || ''),
        departure_time: trip.departure_time ? new Date(trip.departure_time).toISOString().slice(0, 16) : '',
        arrival_time: trip.arrival_time ? new Date(trip.arrival_time).toISOString().slice(0, 16) : '',
        duration_minutes: String(trip.duration_minutes || ''),
        seats_total: String(trip.seats_total || ''),
        price: tripPrice,
        currency: tripCurrency,
        bus_number: trip.bus_number || '',
        driver_name: trip.driver_name || '',
        equipment: trip.equipment || '',
        cancellation_policy: trip.cancellation_policy || '',
        extra_info: trip.extra_info || '',
      });
      
      setEditingTripId(tripId);
      setShowAddTripDialog(true);
    } catch (err: any) {
      console.error('Error loading trip:', err);
      console.error('Error status:', err.status);
      console.error('Error details:', err.details);
      
      let errorMsg = err.message || 'Failed to load trip data';
      if (err.status === 404) {
        errorMsg = language === 'ar' ? 'الرحلة غير موجودة' : 
                   language === 'de' ? 'Fahrt nicht gefunden' : 
                   'Trip not found';
      } else if (err.status === 500) {
        errorMsg = language === 'ar' ? 'خطأ في الخادم. يرجى المحاولة مرة أخرى.' : 
                   language === 'de' ? 'Serverfehler. Bitte versuchen Sie es erneut.' : 
                   'Server error. Please try again.';
      }
      
      alert(language === 'ar' ? `خطأ في تحميل بيانات الرحلة: ${errorMsg}` : 
            language === 'de' ? `Fehler beim Laden der Fahrtdaten: ${errorMsg}` : 
            `Error loading trip data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    try {
      setLoading(true);
      
      // Validate that arrival time is after departure time
      if (newTrip.departure_time && newTrip.arrival_time) {
        const dep = new Date(newTrip.departure_time);
        const arr = new Date(newTrip.arrival_time);
        
        if (arr <= dep) {
          alert(t.arrivalTimeAfterDeparture);
          setLoading(false);
          return;
        }
      }
      
      // Find or create route based on selected cities
      let routeId = newTrip.route_id;
      
      // If cities are selected but route_id is not set, find or create the route
      if (!routeId && newTrip.from_city && newTrip.to_city) {
        // Find existing route
        const fromCity = cities.find((c: any) => c.name === newTrip.from_city);
        const toCity = cities.find((c: any) => c.name === newTrip.to_city);
        
        if (!fromCity || !toCity) {
          alert(language === 'ar' 
            ? 'يرجى اختيار مدينة المغادرة ومدينة الوصول الصحيحة' 
            : language === 'de' 
            ? 'Bitte wählen Sie gültige Abfahrts- und Ankunftsstädte' 
            : 'Please select valid departure and arrival cities');
          setLoading(false);
          return;
        }

        if (fromCity && toCity) {
          const existingRoute = routes.find((r: any) => 
            r.from_city_id === fromCity.id && r.to_city_id === toCity.id
          );
          
          if (existingRoute) {
            routeId = String(existingRoute.id);
          } else {
            // Create new route
            try {
              const createdRoute: any = await adminApi.createRoute(fromCity.id, toCity.id);
              routeId = String(createdRoute.id || createdRoute.route_id || createdRoute);
              // Reload routes to include the new one
              const updatedRoutes: any = await adminApi.getRoutes();
              setRoutes(updatedRoutes);
            } catch (routeError: any) {
              console.error('Error creating route:', routeError);
              alert(language === 'ar' 
                ? 'فشل إنشاء المسار. يرجى المحاولة مرة أخرى.' 
                : language === 'de' 
                ? 'Fehler beim Erstellen der Route. Bitte versuchen Sie es erneut.' 
                : 'Failed to create route. Please try again.');
              setLoading(false);
              return;
            }
          }
        }
      }

      if (!routeId) {
        alert(language === 'ar' 
          ? 'يرجى اختيار مدينة المغادرة ومدينة الوصول' 
          : language === 'de' 
          ? 'Bitte wählen Sie Abfahrts- und Ankunftsstadt' 
          : 'Please select departure and arrival cities');
        setLoading(false);
        return;
      }

      // Calculate duration if not provided
      let duration = parseInt(newTrip.duration_minutes);
      if (!duration && newTrip.departure_time && newTrip.arrival_time) {
        const dep = new Date(newTrip.departure_time);
        const arr = new Date(newTrip.arrival_time);
        duration = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
      }

      const tripData = {
        route_id: parseInt(routeId),
        company_id: parseInt(newTrip.company_id),
        transport_type_id: parseInt(newTrip.transport_type_id),
        departure_station_id: parseInt(newTrip.departure_station_id),
        arrival_station_id: parseInt(newTrip.arrival_station_id),
        departure_time: newTrip.departure_time,
        arrival_time: newTrip.arrival_time,
        duration_minutes: duration,
        seats_total: parseInt(newTrip.seats_total),
        price: newTrip.price ? parseFloat(newTrip.price) : null,
        currency: newTrip.currency || 'SYP',
        bus_number: newTrip.bus_number || null,
        driver_name: newTrip.driver_name || null,
        equipment: newTrip.equipment || null,
        cancellation_policy: newTrip.cancellation_policy || null,
        extra_info: newTrip.extra_info || null,
      };

      if (editingTripId) {
        // Update existing trip
        await adminApi.updateTrip(editingTripId, tripData);
        alert(language === 'ar' ? 'تم تحديث الرحلة بنجاح' : language === 'de' ? 'Fahrt erfolgreich aktualisiert' : 'Trip updated successfully!');
      } else {
        // Create new trip
        await adminApi.createTrip(tripData);
        alert(t.tripAdded || 'Trip added successfully!');
      }
      
      setShowAddTripDialog(false);
      setEditingTripId(null);
      setNewTrip({
        from_city: '',
        to_city: '',
        route_id: '',
        company_id: '',
        transport_type_id: '',
        departure_station_id: '',
        arrival_station_id: '',
        departure_time: '',
        arrival_time: '',
        duration_minutes: '',
        seats_total: '',
        price: '',
        currency: 'SYP',
        bus_number: '',
        driver_name: '',
        equipment: '',
        cancellation_policy: '',
        extra_info: '',
      });
      loadSchedules(); // Refresh trips list
    } catch (err: any) {
      console.error('Error saving trip:', err);
      
      // Handle 401 Unauthorized - token expired or missing
      if (err.status === 401) {
        const authErrorMsg = language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : language === 'de' 
          ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' 
          : 'Session expired. Please log in again.';
        alert(authErrorMsg);
        // Redirect to login or reload page
        window.location.href = '/';
        return;
      }
      
      const errorMessage = err.message || (editingTripId 
        ? (language === 'ar' ? 'فشل تحديث الرحلة' : language === 'de' ? 'Fehler beim Aktualisieren der Fahrt' : 'Failed to update trip')
        : (language === 'ar' ? 'فشل إضافة الرحلة' : language === 'de' ? 'Fehler beim Hinzufügen der Fahrt' : 'Failed to add trip'));
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = () => {
    setEditingTripId(null);
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
      price: '',
      currency: 'SYP',
      bus_number: '',
      driver_name: '',
      equipment: '',
      cancellation_policy: '',
      extra_info: '',
    });
    setShowAddTripDialog(true);
  };

  const handleDeleteTrip = async (tripId: number) => {
    // Show confirmation message for permanent deletion
    const confirmMessage = language === 'ar'
      ? 'هل أنت متأكد من حذف هذه الرحلة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.'
      : language === 'de'
      ? 'Sind Sie sicher, dass Sie diese Fahrt dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
      : 'Are you sure you want to permanently delete this trip? This action cannot be undone.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      const result: any = await adminApi.deleteTrip(tripId);
      
      console.log('Delete successful, removing trip from list...');
      
      // Remove from local state immediately
      setTrips(prevTrips => {
        const filtered = prevTrips.filter((t: any) => t.id !== tripId);
        console.log(`Removed trip ${tripId} from local state. Remaining trips:`, filtered.length);
        return filtered;
      });
      
      alert(language === 'ar' 
        ? 'تم حذف الرحلة نهائياً' 
        : language === 'de' 
        ? 'Fahrt dauerhaft gelöscht' 
        : 'Trip permanently deleted');
      
      // Refresh the list from server to ensure consistency
      console.log('Refreshing trips list from server...');
      await loadSchedules(false); // Only load active trips
      console.log('Trips list refreshed');
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      console.error('Error status:', err.status);
      console.error('Error message:', err.message);
      console.error('Error details:', err.details);
      
      // Handle 401 Unauthorized - token expired or missing
      if (err.status === 401) {
        const authErrorMsg = language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : language === 'de' 
          ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' 
          : 'Session expired. Please log in again.';
        alert(authErrorMsg);
        // Redirect to login or reload page
        window.location.href = '/';
        return;
      }
      
      const errorMessage = err.message || (language === 'ar' ? 'فشل حذف الرحلة' : language === 'de' ? 'Fehler beim Löschen der Fahrt' : 'Failed to delete trip');
      const details = err.details ? `\n\nDetails: ${JSON.stringify(err.details)}` : '';
      alert(`${errorMessage}${details}`);
    } finally {
      setLoading(false);
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
    // Users management tab - Admin only
    ...(user?.role === 'admin' ? [{ id: 'users' as const, label: t.userManagement, icon: Users }] : []),
    // Companies management tab - Admin only
    ...(user?.role === 'admin' ? [{ id: 'companies' as const, label: t.companyManagement, icon: Building2 }] : []),
    { id: 'ratings' as const, label: t.ratingsManagement, icon: Star },
    { id: 'photos' as const, label: t.photoManagement, icon: Image },
    { id: 'import' as const, label: t.dataImport, icon: Upload },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">{t.adminDashboard}</h1>
        <p className="text-gray-600">{t.welcomeMessage}, {user.name}</p>
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
                <div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setShowTripsList(!showTripsList);
                    if (!showTripsList) {
                      // Load trips when opening
                      adminApi.getTrips(true).then((tripsData) => {
                        setTrips(Array.isArray(tripsData) ? tripsData : []);
                      }).catch(console.error);
                      // Load cities for filtering
                      if (allCities.length === 0) {
                        adminApi.getCities().then((citiesData) => {
                          setAllCities(Array.isArray(citiesData) ? citiesData : []);
                        }).catch(console.error);
                      }
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl text-gray-900 mb-1">{stats.totalTrips}</div>
                  <div className="text-sm text-gray-700">{t.totalTrips}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    {language === 'ar' 
                      ? showTripsList ? 'انقر لإخفاء القائمة' : 'انقر لعرض القائمة'
                      : language === 'de'
                      ? showTripsList ? 'Klicken zum Ausblenden' : 'Klicken zum Anzeigen'
                      : showTripsList ? 'Click to hide' : 'Click to view'}
                  </div>
                </div>

                <div 
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setShowUsersList(!showUsersList);
                    if (!showUsersList) {
                      // Load users when opening
                      adminApi.getUsers().then((usersData) => {
                        setUsers(Array.isArray(usersData) ? usersData : []);
                      }).catch(console.error);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl text-gray-900 mb-1">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-700">{t.totalUsers}</div>
                  <div className="text-xs text-green-600 mt-2">
                    {language === 'ar' 
                      ? showUsersList ? 'انقر لإخفاء القائمة' : 'انقر لعرض القائمة'
                      : language === 'de'
                      ? showUsersList ? 'Klicken zum Ausblenden' : 'Klicken zum Anzeigen'
                      : showUsersList ? 'Click to hide' : 'Click to view'}
                  </div>
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
                  <p className="text-gray-600 text-center py-8">
                    {language === 'ar' 
                      ? 'لا توجد بيانات للمسارات الشائعة'
                      : language === 'de'
                      ? 'Keine Routendaten verfügbar'
                      : 'No route data available'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {popularRoutes.map((route: any, index: number) => {
                      const maxTrips = Math.max(...popularRoutes.map((r: any) => r.trip_count || 0), 1);
                      const tripCount = route.trip_count || 0;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-gray-900">{route.route || 'Unknown Route'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-200 rounded-full h-2 w-32">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(tripCount / maxTrips) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{tripCount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* All Users with Filtering and Export - Shown when clicking on Total Users card */}
              {showUsersList && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl text-gray-900">{t.totalUsers}</h2>
                    <button 
                      onClick={exportUsersToCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {language === 'ar' ? 'تصدير المستخدمين' : language === 'de' ? 'Benutzer exportieren' : 'Export Users'}
                    </button>
                  </div>

                  {/* Filters Section */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg text-gray-900">
                        {language === 'ar' ? 'فلترة المستخدمين' : language === 'de' ? 'Benutzer filtern' : 'Filter Users'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Name Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ar' ? 'البحث بالاسم' : language === 'de' ? 'Nach Name suchen' : 'Search by Name'}
                        </label>
                        <input
                          type="text"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل الاسم أو البريد الإلكتروني' : language === 'de' ? 'Name oder E-Mail eingeben' : 'Enter name or email'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      {/* Role Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ar' ? 'فلترة حسب نوع الحساب' : language === 'de' ? 'Nach Kontotyp filtern' : 'Filter by Account Type'}
                        </label>
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">
                            {language === 'ar' ? 'جميع أنواع الحسابات' : language === 'de' ? 'Alle Kontotypen' : 'All Account Types'}
                          </option>
                          <option value="Administrator">
                            {language === 'ar' ? 'مدير' : language === 'de' ? 'Administrator' : 'Administrator'}
                          </option>
                          <option value="Agent">
                            {language === 'ar' ? 'وكيل' : language === 'de' ? 'Agent' : 'Agent'}
                          </option>
                          <option value="User">
                            {language === 'ar' ? 'مستخدم' : language === 'de' ? 'Benutzer' : 'User'}
                          </option>
                        </select>
                      </div>

                      {/* Clear Filters Button */}
                      <div className="flex items-end">
                        <button
                          onClick={clearUserFilters}
                          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          {language === 'ar' ? 'مسح الفلاتر' : language === 'de' ? 'Filter löschen' : 'Clear Filters'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                              {language === 'ar' ? 'الاسم' : language === 'de' ? 'Name' : 'Name'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>
                              {language === 'ar' ? 'البريد الإلكتروني' : language === 'de' ? 'E-Mail' : 'Email'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>
                              {language === 'ar' ? 'رقم الهاتف' : language === 'de' ? 'Telefonnummer' : 'Phone'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>
                              {language === 'ar' ? 'نوع الحساب' : language === 'de' ? 'Kontotyp' : 'Account Type'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(() => {
                            const filteredUsers = getFilteredUsers();
                            if (filteredUsers.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                                    {users.length === 0
                                      ? (language === 'ar' 
                                          ? 'لا يوجد مستخدمون.'
                                          : language === 'de'
                                          ? 'Keine Benutzer vorhanden.'
                                          : 'No users available.')
                                      : (language === 'ar' 
                                          ? 'لا يوجد مستخدمون يطابقون الفلاتر'
                                          : language === 'de'
                                          ? 'Keine Benutzer entsprechen den Filtern'
                                          : 'No users match the filters')}
                                  </td>
                                </tr>
                              );
                            }
                            return filteredUsers.map((userItem: any) => {
                              const fullName = `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || userItem.email || 'N/A';
                              const roles = Array.isArray(userItem.roles) ? userItem.roles : [];
                              let roleDisplay = language === 'ar' ? 'مستخدم' : language === 'de' ? 'Benutzer' : 'User';
                              if (roles.includes('Administrator') || roles.includes('ADMIN')) {
                                roleDisplay = language === 'ar' ? 'مدير' : language === 'de' ? 'Administrator' : 'Administrator';
                              } else if (roles.includes('Agent') || roles.includes('AGENT')) {
                                roleDisplay = language === 'ar' ? 'وكيل' : language === 'de' ? 'Agent' : 'Agent';
                              }
                              return (
                                <tr key={userItem.id} className={`hover:bg-gray-50 ${userItem.is_active === false ? 'opacity-60 bg-gray-100' : ''}`}>
                                  <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                                    {fullName}
                                    {userItem.is_active === false && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        ({language === 'ar' ? 'معطل' : language === 'de' ? 'Deaktiviert' : 'Inactive'})
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>{userItem.email || 'N/A'}</td>
                                  <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>{userItem.phone || 'N/A'}</td>
                                  <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>{roleDisplay}</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* All Trips with Filtering and Export - Shown when clicking on Total Trips card */}
              {showTripsList && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl text-gray-900">{t.totalTrips}</h2>
                    <button 
                      onClick={exportTripsToCSV}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t.exportTrips}
                    </button>
                  </div>

                  {/* Filters Section */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg text-gray-900">{t.filterTrips}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByDate}</label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <input
                            type="date"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Time Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByTime}</label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={filterTimeFrom}
                            onChange={(e) => setFilterTimeFrom(e.target.value)}
                            placeholder={t.fromTime}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <input
                            type="time"
                            value={filterTimeTo}
                            onChange={(e) => setFilterTimeTo(e.target.value)}
                            placeholder={t.toTime}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* City Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByCity}</label>
                        <select
                          value={filterCity}
                          onChange={(e) => setFilterCity(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">{t.selectCity}</option>
                          {allCities.map((city: any) => (
                            <option key={city.id} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Company Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByCompany}</label>
                        <select
                          value={filterCompany}
                          onChange={(e) => setFilterCompany(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">{t.selectCompany}</option>
                          {Array.from(new Set(trips.map((t: any) => t.company_name).filter(Boolean))).map((company: string) => (
                            <option key={company} value={company}>
                              {company}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Clear Filters Button */}
                      <div className="flex items-end">
                        <button
                          onClick={clearFilters}
                          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          {t.clearFilters}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trips Table */}
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{t.from}</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{t.to}</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>{t.departure}</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}>{t.company}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(() => {
                            const filteredTrips = getFilteredTrips();
                            if (filteredTrips.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                                    {trips.length === 0
                                      ? (language === 'ar' 
                                          ? 'لا توجد رحلات.'
                                          : language === 'de'
                                          ? 'Keine Reisen vorhanden.'
                                          : 'No trips available.')
                                      : t.noTripsMatch}
                                  </td>
                                </tr>
                              );
                            }
                            return filteredTrips.map((trip: any) => (
                              <tr key={trip.id} className={`hover:bg-gray-50 ${trip.is_active === false ? 'opacity-60 bg-gray-100' : ''}`}>
                                <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                                  {trip.from_city || 'N/A'}
                                  {trip.is_active === false && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({language === 'ar' ? 'معطل' : language === 'de' ? 'Deaktiviert' : 'Inactive'})
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{trip.to_city || 'N/A'}</td>
                                <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
                                  {trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}>
                                  {trip.company_name || 'N/A'}
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{t.from}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{t.to}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>{t.departure}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                        {language === 'ar' 
                          ? 'لا توجد رحلات. يرجى إضافة رحلة جديدة أو التحقق من قاعدة البيانات.'
                          : language === 'de'
                          ? 'Es gibt keinen Zeitplan. Bitte überprüfen Sie alle Zeitpläne und passen Sie sie nach Bedarf an.'
                          : 'No trips found. Please add a new trip or check the database.'}
                      </td>
                    </tr>
                  ) : (
                    trips.slice(0, 20).map((trip: any) => (
                      <tr key={trip.id} className={`hover:bg-gray-50 ${trip.is_active === false ? 'opacity-60 bg-gray-100' : ''}`}>
                        <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                          {trip.from_city || 'N/A'}
                          {trip.is_active === false && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({language === 'ar' ? 'معطل' : language === 'de' ? 'Deaktiviert' : 'Inactive'})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{trip.to_city || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
                          {trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditTrip(trip.id)}
                              className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              {t.edit}
                            </button>
                            <button 
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
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

          {/* Add Trip Dialog - Popup Window */}
          {showAddTripDialog && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
              onClick={(e) => {
                // Close dialog when clicking on backdrop
                if (e.target === e.currentTarget) {
                  setShowAddTripDialog(false);
                  setEditingTripId(null);
                }
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Sticky */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center z-10 shadow-lg">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    {editingTripId ? (
                      <>
                        <span>{language === 'ar' ? 'تعديل الرحلة' : language === 'de' ? 'Fahrt bearbeiten' : 'Edit Trip'}</span>
                        <span className="text-sm font-normal bg-white/20 px-2 py-1 rounded">ID: {editingTripId}</span>
                      </>
                    ) : (
                      <span>{t.addSchedule}</span>
                    )}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddTripDialog(false);
                      setEditingTripId(null);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    title={language === 'ar' ? 'إغلاق' : language === 'de' ? 'Schließen' : 'Close'}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6">
                  <div className="space-y-4">
                  {/* From City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.from}</label>
                    <select
                      value={newTrip.from_city}
                      onChange={(e) => {
                        const fromCity = e.target.value;
                        const fromCityObj = cities.find((c: any) => c.name === fromCity);
                        setNewTrip((prev: any) => ({ ...prev, from_city: fromCity, route_id: '' }));
                        // Auto-select route if to_city is already selected
                        if (newTrip.to_city && fromCity && fromCityObj) {
                          const toCityObj = cities.find((c: any) => c.name === newTrip.to_city);
                          if (toCityObj) {
                            const existingRoute = routes.find((r: any) => 
                              r.from_city_id === fromCityObj.id && r.to_city_id === toCityObj.id
                            );
                            if (existingRoute) {
                              setNewTrip((prev: any) => ({ ...prev, from_city: fromCity, route_id: String(existingRoute.id) }));
                            }
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">{language === 'ar' ? 'اختر مدينة المغادرة' : language === 'de' ? 'Abfahrtsstadt wählen' : 'Select departure city'}</option>
                      {cities.length > 0 ? (
                        cities.map((city: any) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {language === 'ar' ? 'لا توجد مدن متاحة' : language === 'de' ? 'Keine Städte verfügbar' : 'No cities available'}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* To City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.to}</label>
                    <select
                      value={newTrip.to_city}
                      onChange={(e) => {
                        const toCity = e.target.value;
                        const toCityObj = cities.find((c: any) => c.name === toCity);
                        setNewTrip((prev: any) => ({ ...prev, to_city: toCity, route_id: '' }));
                        // Auto-select route if from_city is already selected
                        if (newTrip.from_city && toCity && toCityObj) {
                          const fromCityObj = cities.find((c: any) => c.name === newTrip.from_city);
                          if (fromCityObj) {
                            const existingRoute = routes.find((r: any) => 
                              r.from_city_id === fromCityObj.id && r.to_city_id === toCityObj.id
                            );
                            if (existingRoute) {
                              setNewTrip((prev: any) => ({ ...prev, to_city: toCity, route_id: String(existingRoute.id) }));
                            }
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">{language === 'ar' ? 'اختر مدينة الوصول' : language === 'de' ? 'Ankunftsstadt wählen' : 'Select arrival city'}</option>
                      {cities.length > 0 ? (
                        cities.map((city: any) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {language === 'ar' ? 'لا توجد مدن متاحة' : language === 'de' ? 'Keine Städte verfügbar' : 'No cities available'}
                        </option>
                      )}
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
                      {transportTypes.map((type: any) => {
                        // Get the transport type code (could be in type_name, code, or type.code)
                        const typeCode = type.type_name || type.code || type.name || '';
                        // Get translated name based on code and language
                        const translatedName = getTransportTypeName(typeCode, language);
                        // Fallback to original name if translation not found
                        const displayName = translatedName || type.name || type.label || typeCode;
                        
                        return (
                          <option key={type.id} value={type.id}>
                            {displayName}
                          </option>
                        );
                      })}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.duration || 'Duration'} (دقائق)
                        {newTrip.departure_time && newTrip.arrival_time && (
                          <span className="text-xs text-gray-500 ml-2">
                            {language === 'ar' ? '(محسوبة تلقائياً)' : language === 'de' ? '(automatisch berechnet)' : '(auto-calculated)'}
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={newTrip.duration_minutes}
                        onChange={(e) => setNewTrip({ ...newTrip, duration_minutes: e.target.value })}
                        placeholder="240"
                        readOnly={newTrip.departure_time && newTrip.arrival_time ? true : false}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          newTrip.departure_time && newTrip.arrival_time ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        title={newTrip.departure_time && newTrip.arrival_time ? 
                          (language === 'ar' ? 'المدة محسوبة تلقائياً من وقت المغادرة والوصول' : 
                           language === 'de' ? 'Dauer wird automatisch aus Abfahrts- und Ankunftszeit berechnet' : 
                           'Duration is auto-calculated from departure and arrival times') : ''}
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

                  <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'السعر' : language === 'de' ? 'Preis' : 'Price'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newTrip.price}
                        onChange={(e) => setNewTrip({ ...newTrip, price: e.target.value })}
                        placeholder="1000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'العملة' : language === 'de' ? 'Währung' : 'Currency'}
                      </label>
                      <select
                        value={newTrip.currency}
                        onChange={(e) => setNewTrip({ ...newTrip, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="SYP">SYP (ليرة سورية)</option>
                        <option value="USD">USD (دولار أمريكي)</option>
                        <option value="EUR">EUR (يورو)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Bus Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'رقم الباص' : language === 'de' ? 'Busnummer' : 'Bus Number'}
                      </label>
                      <input
                        type="text"
                        value={newTrip.bus_number}
                        onChange={(e) => setNewTrip({ ...newTrip, bus_number: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: 1234' : language === 'de' ? 'z.B. 1234' : 'e.g. 1234'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Driver Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'اسم السائق' : language === 'de' ? 'Fahrername' : 'Driver Name'}
                      </label>
                      <input
                        type="text"
                        value={newTrip.driver_name}
                        onChange={(e) => setNewTrip({ ...newTrip, driver_name: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: أحمد محمد' : language === 'de' ? 'z.B. Ahmed Mohammed' : 'e.g. Ahmed Mohammed'}
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

                  </div>

                  {/* Actions - Sticky Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6 -mb-6 mt-6 flex gap-4 shadow-lg">
                    <button
                      onClick={handleSaveTrip}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingTripId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingTripId ? (language === 'ar' ? 'حفظ التعديلات' : language === 'de' ? 'Änderungen speichern' : 'Save Changes') : t.add}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTripDialog(false);
                        setEditingTripId(null);
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
                          price: '',
                          currency: 'SYP',
                          bus_number: '',
                          driver_name: '',
                          equipment: '',
                          cancellation_policy: '',
                          extra_info: '',
                        });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
                  <h2 className="text-2xl text-gray-900">
                    {language === 'ar' ? 'إضافة مسار جديد' : language === 'de' ? 'Neue Route hinzufügen' : 'Add New Route'}
                  </h2>
                  <button
                    onClick={() => setShowAddRouteDialog(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {cities.length === 0 && (
                    <div className="text-sm text-gray-500 mb-2">
                      {language === 'ar' ? 'جاري تحميل المدن...' : language === 'de' ? 'Städte werden geladen...' : 'Loading cities...'}
                    </div>
                  )}
                  {/* From City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'من' : language === 'de' ? 'Von' : 'From'}
                    </label>
                    <select
                      value={newRoute.from_city}
                      onChange={(e) => setNewRoute({ ...newRoute, from_city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">
                        {language === 'ar' ? 'اختر مدينة المغادرة' : language === 'de' ? 'Abfahrtsstadt wählen' : 'Select departure city'}
                      </option>
                      {cities.length > 0 ? (
                        cities.map((city: any) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {language === 'ar' ? 'لا توجد مدن متاحة' : language === 'de' ? 'Keine Städte verfügbar' : 'No cities available'}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* To City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'إلى' : language === 'de' ? 'Nach' : 'To'}
                    </label>
                    <select
                      value={newRoute.to_city}
                      onChange={(e) => setNewRoute({ ...newRoute, to_city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">
                        {language === 'ar' ? 'اختر مدينة الوصول' : language === 'de' ? 'Ankunftsstadt wählen' : 'Select arrival city'}
                      </option>
                      {cities.length > 0 ? (
                        cities.map((city: any) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {language === 'ar' ? 'لا توجد مدن متاحة' : language === 'de' ? 'Keine Städte verfügbar' : 'No cities available'}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleCreateRoute}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      {language === 'ar' ? 'إضافة' : language === 'de' ? 'Hinzufügen' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRouteDialog(false);
                        setNewRoute({ from_city: '', to_city: '' });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {language === 'ar' ? 'إلغاء' : language === 'de' ? 'Abbrechen' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && user?.role === 'admin' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'المستخدمون' : language === 'de' ? 'Benutzer' : 'Users'}
            </h3>
            <button
              onClick={() => setShowDeletedUsers(!showDeletedUsers)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showDeletedUsers 
                ? (language === 'ar' ? 'إخفاء المحذوفة' : language === 'de' ? 'Gelöschte ausblenden' : 'Hide Deleted')
                : (language === 'ar' ? 'إظهار المحذوفة' : language === 'de' ? 'Gelöschte anzeigen' : 'Show Deleted')
              }
            </button>
          </div>

          {/* Filters Section */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name/Email Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'البحث بالاسم أو البريد الإلكتروني' : language === 'de' ? 'Suche nach Name oder E-Mail' : 'Search by Name or Email'}
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث...' : language === 'de' ? 'Suchen...' : 'Search...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'فلتر حسب الدور' : language === 'de' ? 'Nach Rolle filtern' : 'Filter by Role'}
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">{language === 'ar' ? 'جميع الأدوار' : language === 'de' ? 'Alle Rollen' : 'All Roles'}</option>
                  <option value="Administrator">{language === 'ar' ? 'مدير' : language === 'de' ? 'Administrator' : 'Administrator'}</option>
                  <option value="Agent">{language === 'ar' ? 'وكيل' : language === 'de' ? 'Agent' : 'Agent'}</option>
                  <option value="User">{language === 'ar' ? 'مستخدم' : language === 'de' ? 'Benutzer' : 'User'}</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={clearUserFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  {language === 'ar' ? 'مسح الفلاتر' : language === 'de' ? 'Filter löschen' : 'Clear Filters'}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{t.userName}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>{t.userEmail}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>{t.userRole}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getFilteredUsers().length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-600">No users found</td>
                    </tr>
                  ) : (
                    getFilteredUsers().map((userItem: any) => {
                      const userName = `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || userItem.email;
                      const roles = Array.isArray(userItem.roles) ? userItem.roles : [];
                      const isAdmin = roles.includes('Administrator') || roles.includes('ADMIN');
                      const isAgent = roles.includes('Agent') || roles.includes('AGENT');
                      const roleDisplay = isAdmin ? 'admin' : isAgent ? 'agent' : 'user';
                      return (
                        <tr key={userItem.id} className={`hover:bg-gray-50 ${userItem.is_active === false ? 'opacity-60 bg-gray-100' : ''}`}>
                          <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{userName}</td>
                          <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>{userItem.email}</td>
                          <td className="px-6 py-3" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              isAdmin ? 'bg-purple-100 text-purple-700' : isAgent ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {roleDisplay}
                              {userItem.is_active === false && (
                                <span className="ml-1 text-xs">({language === 'ar' ? 'محظور' : language === 'de' ? 'Gesperrt' : 'Banned'})</span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Button clicked for user:', userItem.id);
                                  if (!loading) {
                                    handleEditProfileClick(userItem);
                                  }
                                }}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                              >
                                {t.editProfile}
                              </button>
                              <button 
                                onClick={() => handleBanUser(userItem.id, userItem.is_active !== false)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {userItem.is_active === false 
                                  ? (language === 'ar' ? 'إلغاء الحظر' : language === 'de' ? 'Entsperren' : 'Unban')
                                  : t.blockUser}
                              </button>
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

      {activeTab === 'ratings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.ratingsManagement}
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.user}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.company}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.punctuality}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.friendliness}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.cleanliness}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.comment}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.date}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!ratings || ratings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                        {language === 'ar' ? 'لا توجد تقييمات' : language === 'de' ? 'Keine Bewertungen' : 'No ratings found'}
                      </td>
                    </tr>
                  ) : (
                    ratings.map((rating: any) => {
                      console.log('Rendering rating:', rating);
                      return (
                        <tr key={rating.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">{rating.user_name || rating.user_email}</td>
                          <td className="px-6 py-3 text-sm text-gray-900">{rating.company_name || '-'}</td>
                          <td className="px-6 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              {rating.punctuality_rating || 0}
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              {rating.friendliness_rating || 0}
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              {rating.cleanliness_rating || 0}
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900 max-w-xs truncate">
                            {rating.comment || '-'}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {rating.created_at 
                              ? new Date(rating.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US')
                              : '-'}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Edit button clicked for rating:', rating.id);
                                  if (!loading) {
                                    handleEditRatingClick(rating);
                                  }
                                }}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t.editRating}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteRating(rating.id);
                                }}
                                className="text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                                title={t.deleteRating}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

      {/* Companies Tab */}
      {activeTab === 'companies' && user?.role === 'admin' && (
        <CompanyManagement language={language} />
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

      {/* Edit Profile Dialog */}
      {showEditProfileDialog && selectedUserForEdit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] p-4 backdrop-blur-md"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            // Close dialog when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowEditProfileDialog(false);
              setSelectedUserForEdit(null);
              setEditProfileData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role: 'User'
              });
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 relative z-[10001] border border-gray-200"
            style={{ position: 'relative', zIndex: 10001, maxWidth: '28rem' }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Content - Scrollable */}
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الاسم الأول' : language === 'de' ? 'Vorname' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={editProfileData.first_name}
                  onChange={(e) => setEditProfileData({ ...editProfileData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'ar' ? 'أدخل الاسم الأول' : language === 'de' ? 'Vorname eingeben' : 'Enter first name'}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الاسم الأخير' : language === 'de' ? 'Nachname' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={editProfileData.last_name}
                  onChange={(e) => setEditProfileData({ ...editProfileData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'ar' ? 'أدخل الاسم الأخير' : language === 'de' ? 'Nachname eingeben' : 'Enter last name'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : language === 'de' ? 'E-Mail' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editProfileData.email}
                  onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : language === 'de' ? 'E-Mail eingeben' : 'Enter email'}
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الدور' : language === 'de' ? 'Rolle' : 'Role'}
                </label>
                <select
                  value={editProfileData.role}
                  onChange={(e) => setEditProfileData({ ...editProfileData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="User">
                    {language === 'ar' ? 'مستخدم' : language === 'de' ? 'Benutzer' : 'User'}
                  </option>
                  <option value="Agent">
                    {language === 'ar' ? 'وكيل' : language === 'de' ? 'Agent' : 'Agent'}
                  </option>
                  <option value="Administrator">
                    {language === 'ar' ? 'مدير' : language === 'de' ? 'Administrator' : 'Administrator'}
                  </option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'كلمة المرور (اتركها فارغة للاحتفاظ بالكلمة الحالية)' : language === 'de' ? 'Passwort (leer lassen, um das aktuelle beizubehalten)' : 'Password (leave empty to keep current password)'}
                </label>
                <input
                  type="password"
                  value={editProfileData.password}
                  onChange={(e) => setEditProfileData({ ...editProfileData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'ar' ? 'أدخل كلمة مرور جديدة (اختياري)' : language === 'de' ? 'Neues Passwort eingeben (optional)' : 'Enter new password (optional)'}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex flex-col gap-3 rounded-b-2xl">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditProfileDialog(false);
                    setSelectedUserForEdit(null);
                    setEditProfileData({
                      first_name: '',
                      last_name: '',
                      email: '',
                      password: '',
                      role: 'User'
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'de' ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveProfileEdit}
                  disabled={loading || !editProfileData.email}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {language === 'ar' ? 'حفظ' : language === 'de' ? 'Speichern' : 'Save'}
                </button>
              </div>
              <button
                onClick={() => selectedUserForEdit && handleDeleteUser(selectedUserForEdit.id)}
                disabled={loading || !selectedUserForEdit}
                className="w-full px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => {
                  if (!loading && selectedUserForEdit) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && selectedUserForEdit) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {language === 'ar' ? 'حذف الحساب' : language === 'de' ? 'Konto löschen' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rating Dialog */}
      {showEditRatingDialog && selectedRating && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] p-4 backdrop-blur-md"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditRatingDialog(false);
              setSelectedRating(null);
              setEditRatingData({
                punctuality_rating: 0,
                friendliness_rating: 0,
                cleanliness_rating: 0,
                comment: '',
              });
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 relative z-[10001] border border-gray-200"
            style={{ position: 'relative', zIndex: 10001, maxWidth: '28rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t.editRating}
              </h2>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                {/* Punctuality Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.punctuality} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditRatingData({ ...editRatingData, punctuality_rating: star })}
                        className="transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= editRatingData.punctuality_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Friendliness Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.friendliness} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditRatingData({ ...editRatingData, friendliness_rating: star })}
                        className="transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= editRatingData.friendliness_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleanliness Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.cleanliness} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditRatingData({ ...editRatingData, cleanliness_rating: star })}
                        className="transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= editRatingData.cleanliness_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.comment}
                  </label>
                  <textarea
                    value={editRatingData.comment}
                    onChange={(e) => setEditRatingData({ ...editRatingData, comment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder={language === 'ar' ? 'أدخل تعليقاً' : language === 'de' ? 'Kommentar eingeben' : 'Enter a comment'}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-4 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditRatingDialog(false);
                  setSelectedRating(null);
                  setEditRatingData({
                    punctuality_rating: 0,
                    friendliness_rating: 0,
                    cleanliness_rating: 0,
                    comment: '',
                  });
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleUpdateRating}
                disabled={loading || editRatingData.punctuality_rating === 0 || editRatingData.friendliness_rating === 0 || editRatingData.cleanliness_rating === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {t.updateRating}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
