import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, Upload, Image, AlertCircle, TrendingUp, Clock, MapPin, Loader2, Plus, X, Save, Filter, Download, Building2, Star, Search, Check, Scan, ListChecks } from 'lucide-react';
import type { Language, User } from '../App';
import { adminApi, imagesApi, tripsApi, citiesApi, authApi } from '../lib/api';
import { CitySelector } from './CitySelector';
import { ScheduleManagement } from './ScheduleManagement';
import { CompanyManagement } from './CompanyManagement';
import RatingManagement from './RatingManagement';
import BookingManagement from './BookingManagement';
import InvoiceManagement from './InvoiceManagement';
import CompanyBookings from './CompanyBookings';
import QRScanner from './QRScanner';
import BranchManagement from './BranchManagement';
import BranchManagement from './BranchManagement';

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
    companyManagement: 'Unternehmensverwaltung',
    ratingsManagement: 'Bewertungsverwaltung',
    bookingsManagement: 'Buchungsverwaltung',
    invoicesManagement: 'Rechnungsverwaltung',
    branchManagement: 'Filialen-Verwaltung',
    subscriptionManagement: 'Abonnementverwaltung',
    userManagement: 'Benutzerverwaltung',
    searchUsers: 'Benutzer suchen',
    searchUsersPlaceholder: 'Nach Name oder E-Mail suchen...',
    filterByRole: 'Nach Rolle filtern',
    allRoles: 'Alle Rollen',
    adminRole: 'Administrator',
    agentRole: 'Agent',
    userRole: 'Benutzer',
    agentType: 'Agent-Typ',
    selectAgentType: 'Agent-Typ wählen',
    manager: 'Manager',
    driver: 'Fahrer',
    driverAssistant: 'Fahrerhelfer',
    assignedCompany: 'Zugewiesene Firma',
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
    showTrash: 'Papierkorb anzeigen',
    hideTrash: 'Papierkorb ausblenden',
    restore: 'Wiederherstellen',
    permanentDelete: 'Dauerhaft löschen',
    inTrash: 'Im Papierkorb',
    viewStops: 'Stopps anzeigen',
    manageStops: 'Stopps verwalten',
    addStop: 'Stopp hinzufügen',
    stopOrder: 'Reihenfolge',
    stationName: 'Haltestelle',
    arrivalTime: 'Ankunftszeit',
    departureTime: 'Abfahrtszeit',
    noStops: 'Keine Zwischenstopps',
    type: 'Typ',
    status: 'Status',
    scheduled: 'Geplant',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    recurringTrip: 'Wiederholende Fahrt',
    once: 'Einmalig',
    daily: 'Täglich (30 Tage)',
    weekly: 'Wöchentlich (4 Wochen)',
    recurringInfo: 'Wählen Sie, ob diese Fahrt einmalig oder wiederkehrend erstellt werden soll',
  },
  en: {
    adminDashboard: 'Admin Dashboard',
    accessDenied: 'Access Denied',
    accessMessage: 'You do not have permission to access this area.',
    scheduleManagement: 'Schedule Management',
    companyManagement: 'Company Management',
    ratingsManagement: 'Ratings Management',
    bookingsManagement: 'Booking Management',
    invoicesManagement: 'Invoice Management',
    branchManagement: 'Branch Management',
    subscriptionManagement: 'Subscription Management',
    userManagement: 'User Management',
    searchUsers: 'Search Users',
    searchUsersPlaceholder: 'Search by name or email...',
    filterByRole: 'Filter by Role',
    allRoles: 'All Roles',
    adminRole: 'Administrator',
    agentRole: 'Agent',
    userRole: 'User',
    agentType: 'Agent Type',
    selectAgentType: 'Select Agent Type',
    manager: 'Manager',
    driver: 'Driver',
    driverAssistant: 'Driver Assistant',
    assignedCompany: 'Assigned Company',
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
    showTrash: 'Show Trash',
    hideTrash: 'Hide Trash',
    restore: 'Restore',
    permanentDelete: 'Delete Permanently',
    inTrash: 'In Trash',
    viewStops: 'View Stops',
    manageStops: 'Manage Stops',
    addStop: 'Add Stop',
    stopOrder: 'Order',
    stationName: 'Station',
    arrivalTime: 'Arrival Time',
    departureTime: 'Departure Time',
    noStops: 'No intermediate stops',
    type: 'Type',
    status: 'Status',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    recurringTrip: 'Recurring Trip',
    once: 'Once',
    daily: 'Daily (30 days)',
    weekly: 'Weekly (4 weeks)',
    recurringInfo: 'Choose whether this trip should be created once or recurring',
  },
  ar: {
    adminDashboard: 'لوحة الإدارة',
    accessDenied: 'تم رفض الوصول',
    accessMessage: 'ليس لديك إذن للوصول إلى هذه المنطقة.',
    scheduleManagement: 'إدارة الجداول',
    companyManagement: 'إدارة الشركات',
    ratingsManagement: 'إدارة التقييمات',
    bookingsManagement: 'إدارة الحجوزات',
    invoicesManagement: 'إدارة الفواتير',
    branchManagement: 'إدارة الفروع',
    subscriptionManagement: 'إدارة الاشتراكات',
    userManagement: 'إدارة المستخدمين',
    searchUsers: 'بحث المستخدمين',
    searchUsersPlaceholder: 'البحث بالاسم أو البريد الإلكتروني...',
    filterByRole: 'تصفية حسب الدور',
    allRoles: 'جميع الأدوار',
    adminRole: 'مدير',
    agentRole: 'وكيل',
    userRole: 'مستخدم',
    agentType: 'نوع الوكيل',
    selectAgentType: 'اختر نوع الوكيل',
    manager: 'مدير',
    driver: 'سائق',
    driverAssistant: 'مساعد السائق',
    assignedCompany: 'الشركة المعينة',
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
    showTrash: 'عرض سلة المهملات',
    hideTrash: 'إخفاء سلة المهملات',
    restore: 'استعادة',
    permanentDelete: 'حذف نهائي',
    inTrash: 'في سلة المهملات',
    viewStops: 'عرض المحطات',
    manageStops: 'إدارة المحطات',
    addStop: 'إضافة محطة',
    stopOrder: 'الترتيب',
    stationName: 'المحطة',
    arrivalTime: 'وقت الوصول',
    departureTime: 'وقت المغادرة',
    noStops: 'لا توجد محطات متوسطة',
    type: 'النوع',
    status: 'الحالة',
    scheduled: 'مجدولة',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    recurringTrip: 'رحلة متكررة',
    once: 'مرة واحدة',
    daily: 'يومياً (30 يوم)',
    weekly: 'أسبوعياً (4 أسابيع)',
    recurringInfo: 'اختر ما إذا كان يجب إنشاء هذه الرحلة مرة واحدة أو متكررة',
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
  },
};

export function AdminDashboard({ user, language }: AdminDashboardProps) {
  const t = translations[language];
  
  // Determine user access level
  const isAdmin = user?.role === 'admin';
  const isAgentManager = user?.role === 'agent' && user?.agent_type === 'manager' && user?.company_id;
  const isDriver = user?.role === 'agent' && (user?.agent_type === 'driver' || user?.agent_type === 'driver_assistant');
  
  // Default tab based on role
  const defaultTab = isAdmin ? 'analytics' : isDriver ? 'qr-scanner' : isAgentManager ? 'company-bookings' : 'schedules';
  const [activeTab, setActiveTab] = useState<'schedules' | 'users' | 'companies' | 'ratings' | 'bookings' | 'invoices' | 'photos' | 'import' | 'analytics' | 'company-bookings' | 'qr-scanner' | 'branches' | 'subscriptions'>(defaultTab);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  
  // Analytics data
  const [stats, setStats] = useState({ totalTrips: 0, totalUsers: 0, averageOccupancy: 0 });
  const [popularRoutes, setPopularRoutes] = useState<Array<{ route: string; trip_count: number }>>([]);
  
  // Schedules data
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [selectedTripForSteps, setSelectedTripForSteps] = useState<any>(null);
  const [tripSteps, setTripSteps] = useState<any[]>([]);
  
  // Users data
  const [users, setUsers] = useState<any[]>([]);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'agent' | 'user'>('all');
  
  // Edit Profile Dialog
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [editProfileData, setEditProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'User',
    company_id: '' as string | number,
    agent_type: '' as string
  });
  const [editCompanySearchQuery, setEditCompanySearchQuery] = useState('');
  const [showEditCompanySuggestions, setShowEditCompanySuggestions] = useState(false);
  const [editSelectedCompanyName, setEditSelectedCompanyName] = useState('');

  // Add/Edit Trip Dialog
  const [showAddTripDialog, setShowAddTripDialog] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [showAddRouteDialog, setShowAddRouteDialog] = useState(false);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);
  
  // Photo Upload Dialog
  const [showPhotoUploadDialog, setShowPhotoUploadDialog] = useState(false);
  
  // CSV Import Dialog
  const [showCSVImportDialog, setShowCSVImportDialog] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [transportTypes, setTransportTypes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [fareCategories, setFareCategories] = useState<any[]>([]);
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);
  const [tripFares, setTripFares] = useState<Array<{
    id?: number;
    fare_category_id: string;
    booking_option_id: string;
    price_modifier: string;
    seats_available: string;
  }>>([]);
  const [newRoute, setNewRoute] = useState({ from_city: '', to_city: '' });
  const [recurringType, setRecurringType] = useState<'once' | 'daily' | 'weekly'>('once');
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
  
  // Trip photo state
  const [tripImageId, setTripImageId] = useState<number | null>(null);
  const [busImages, setBusImages] = useState<any[]>([]);
  const [uploadingBusPhoto, setUploadingBusPhoto] = useState(false);
  
  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'bus' | 'station'>('bus');
  const [entityId, setEntityId] = useState<string>('');
  const [images, setImages] = useState<any[]>([]);
  const [editingImage, setEditingImage] = useState<any>(null);
  
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
  
  // Add User Dialog
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    company_id: '' as string | number,
    agent_type: '' as string
  });
  const [userValidationErrors, setUserValidationErrors] = useState<any>({});
  const [agentTypes, setAgentTypes] = useState<Array<{id: number; code: string; name: string; name_ar?: string}>>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  
  // Stops for new trip
  const [newTripStops, setNewTripStops] = useState<Array<{
    station_id: string;
    stop_order: number;
    arrival_time?: string;
    departure_time?: string;
  }>>([]);

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
      // Wait for user to be loaded before fetching trips (for agent manager filtering)
      // For admins, user is defined but company_id may be undefined - that's OK
      // For agent managers, we need company_id to filter
      if (user) {
        loadSchedules();
        loadTripFormData();
      }
    }
  }, [activeTab, showTrash, user?.company_id, user?.role]);

  // Load images when photos tab is active
  useEffect(() => {
    if (activeTab === 'photos') {
      loadImages();
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
    const depTime = newTrip.departure_time;
    const arrTime = newTrip.arrival_time;
    
    if (depTime && arrTime) {
      const dep = new Date(depTime);
      const arr = new Date(arrTime);
      
      if (!isNaN(dep.getTime()) && !isNaN(arr.getTime()) && arr > dep) {
        const durationMinutes = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
        
        // Only update if the duration has actually changed to avoid infinite loops
        setNewTrip(prev => {
          const currentDuration = parseInt(prev.duration_minutes) || 0;
          if (currentDuration !== durationMinutes) {
            return { ...prev, duration_minutes: String(durationMinutes) };
          }
          return prev;
        });
      }
    }
  }, [newTrip.departure_time, newTrip.arrival_time]);

  const loadBusImages = async () => {
    try {
      const allImages = await adminApi.getAllImages();
      // Filter for bus and trip images
      const busImgs = allImages.filter((img: any) => img.entity_type === 'bus' || img.entity_type === 'trip');
      setBusImages(busImgs);
    } catch (err) {
      console.error('Error loading bus images:', err);
    }
  };

  const loadTripFormData = async () => {
    try {
      const [companiesData, transportTypesData, stationsData, citiesData, fareCategoriesData, bookingOptionsData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getTransportTypes(),
        adminApi.getStations(),
        adminApi.getCities(), // Use adminApi.getCities()
        adminApi.getFareCategories(),
        adminApi.getBookingOptions(),
      ]);
      console.log('Loaded cities:', citiesData?.length || 0);
      console.log('Cities data:', citiesData);
      console.log('Loaded fare categories:', fareCategoriesData);
      console.log('Loaded booking options:', bookingOptionsData);
      setCompanies(companiesData);
      setTransportTypes(transportTypesData);
      setStations(stationsData);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setFareCategories(Array.isArray(fareCategoriesData) ? fareCategoriesData : []);
      setBookingOptions(Array.isArray(bookingOptionsData) ? bookingOptionsData : []);
      // Load bus images for trip photo selection
      await loadBusImages();
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
      // Load companies for user creation/editing
      if (companies.length === 0) {
        loadTripFormData();
      }
    }
  }, [activeTab, showTrash]);

  // Listen for navigate-to-trip event from BookingManagement
  useEffect(() => {
    const handleNavigateToTrip = (event: any) => {
      const { tripId } = event.detail;
      setActiveTab('trips');
      // You could also filter trips by tripId here if needed
      setTimeout(() => {
        const tripElement = document.querySelector(`[data-trip-id="${tripId}"]`);
        if (tripElement) {
          tripElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    window.addEventListener('navigate-to-trip', handleNavigateToTrip);
    return () => window.removeEventListener('navigate-to-trip', handleNavigateToTrip);
  }, []);

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
      
      // Backend now automatically filters by company_id based on user's token
      // No need to pass company_id as query parameter
      const url = showTrash 
        ? `/api/admin/trips?showTrash=true`
        : `/api/admin/trips?showAll=${showAll}`;
      
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}${url}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('Failed to load trips');
      const tripsData = await response.json();
      
      const routesData = await adminApi.getRoutes();
      
      console.log('Loaded trips from server:', tripsData.length, 'showTrash:', showTrash);
      console.log('Current user for filtering:', user?.email, 'role:', user?.role, 'agent_type:', user?.agent_type, 'company_id:', user?.company_id);
      console.log('isAdmin:', isAdmin, 'isAgentManager:', isAgentManager);
      
      setTrips(tripsData);
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

    // For Agent Managers, only show trips from their company
    // Check if user is agent with manager type and has company_id
    const userIsAgentManager = user?.role === 'agent' && user?.agent_type === 'manager' && user?.company_id;
    console.log('getFilteredTrips - user:', user?.email, 'role:', user?.role, 'agent_type:', user?.agent_type, 'company_id:', user?.company_id, 'isAgentManager:', userIsAgentManager);
    
    if (userIsAgentManager) {
      console.log('Filtering trips for agent manager, company_id:', user?.company_id);
      filtered = filtered.filter((trip: any) => {
        const match = Number(trip.company_id) === Number(user?.company_id);
        console.log('Trip', trip.id, 'company_id:', trip.company_id, 'match:', match);
        return match;
      });
      console.log('After filter:', filtered.length, 'trips');
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

  const clearUserFilters = () => {
    setFilterRole('');
    setFilterName('');
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const url = showTrash 
        ? '/api/admin/users?showTrash=true'
        : '/api/admin/users';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load users');
      const usersData = await response.json();
      setUsers(usersData);
      
      // Also load agent types
      const types = await adminApi.getAgentTypes();
      setAgentTypes(types);
    } catch (err) {
      console.error('Error loading users:', err);
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

  // Handle user status change (active, inactive, blocked)
  const handleUserStatusChange = async (userId: number, newStatus: 'active' | 'inactive' | 'blocked') => {
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

    const statusLabels: Record<string, Record<string, string>> = {
      active: { ar: 'نشط', de: 'Aktiv', en: 'Active' },
      inactive: { ar: 'غير نشط', de: 'Inaktiv', en: 'Inactive' },
      blocked: { ar: 'محظور', de: 'Gesperrt', en: 'Blocked' }
    };

    const confirmMessage = language === 'ar'
      ? `هل أنت متأكد من تغيير حالة المستخدم إلى "${statusLabels[newStatus].ar}"؟`
      : language === 'de'
      ? `Sind Sie sicher, dass Sie den Status auf "${statusLabels[newStatus].de}" ändern möchten?`
      : `Are you sure you want to change user status to "${statusLabels[newStatus].en}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.setUserStatus(userId, newStatus);
      alert(language === 'ar' 
        ? 'تم تغيير حالة المستخدم بنجاح'
        : language === 'de' 
        ? 'Benutzerstatus erfolgreich geändert'
        : 'User status changed successfully');
      loadUsers();
    } catch (err: any) {
      console.error('Error changing user status:', err);
      alert(language === 'ar' 
        ? 'فشل تغيير حالة المستخدم. يرجى المحاولة مرة أخرى.'
        : language === 'de' 
        ? 'Fehler beim Ändern des Benutzerstatus. Bitte versuchen Sie es erneut.'
        : 'Failed to change user status. Please try again.');
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
        role: currentRole,
        company_id: userItem.company_id || '',
        agent_type: userItem.agent_type || ''
      });
      setEditSelectedCompanyName(userItem.company_name || '');
      setEditCompanySearchQuery('');
      setShowEditCompanySuggestions(false);
      setSelectedUserForEdit(userItem);
      setShowEditProfileDialog(true);
      console.log('Edit profile dialog should be shown now, showEditProfileDialog:', true);
    } catch (error) {
      console.error('Error in handleEditProfileClick:', error);
    }
  };

  const handleDeleteUser = async (userId: number, isInTrash: boolean = false) => {
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

    const confirmMessage = isInTrash
      ? (language === 'ar' 
        ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.'
        : language === 'de' 
        ? 'Sind Sie sicher, dass Sie diesen Benutzer dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
        : 'Are you sure you want to permanently delete this user? This action cannot be undone.')
      : (language === 'ar' 
        ? 'هل تريد نقل هذا المستخدم إلى سلة المهملات؟'
        : language === 'de' 
        ? 'Möchten Sie diesen Benutzer in den Papierkorb verschieben?'
        : 'Move this user to trash?');
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      
      if (isInTrash) {
        // Permanent delete
        await fetch(`/api/admin/users/${userId}?force=true`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Soft delete (move to trash)
        await adminApi.deleteUser(userId);
      }
      
      alert(isInTrash
        ? (language === 'ar' 
          ? 'تم حذف المستخدم نهائياً'
          : language === 'de' 
          ? 'Benutzer dauerhaft gelöscht'
          : 'User permanently deleted')
        : (language === 'ar' 
          ? 'تم نقل المستخدم إلى سلة المهملات'
          : language === 'de' 
          ? 'Benutzer in Papierkorb verschoben'
          : 'User moved to trash'));
      
      setShowEditProfileDialog(false);
      setSelectedUserForEdit(null);
      setEditProfileData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'User'
      });
      loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      
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
        ? 'فشل حذف المستخدم'
        : language === 'de' 
        ? 'Fehler beim Löschen des Benutzers'
        : 'Failed to delete user');
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(language === 'ar' 
        ? 'انتهت صلاحية الجلسة'
        : language === 'de' 
        ? 'Sitzung abgelaufen'
        : 'Session expired');
      window.location.reload();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to restore user');

      alert(language === 'ar' 
        ? 'تم استعادة المستخدم بنجاح'
        : language === 'de' 
        ? 'Benutzer erfolgreich wiederhergestellt'
        : 'User restored successfully');
      
      loadUsers();
    } catch (err: any) {
      console.error('Error restoring user:', err);
      alert(language === 'ar' 
        ? 'فشل استعادة المستخدم'
        : language === 'de' 
        ? 'Fehler beim Wiederherstellen des Benutzers'
        : 'Failed to restore user');
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
      
      // Update agent info if role is Agent
      if (editProfileData.role === 'Agent') {
        await adminApi.updateAgentInfo(selectedUserForEdit.id, {
          company_id: editProfileData.company_id ? Number(editProfileData.company_id) : null,
          agent_type: editProfileData.agent_type || null
        });
      }
      
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
        role: 'User',
        company_id: '',
        agent_type: ''
      });
      setEditCompanySearchQuery('');
      setEditSelectedCompanyName('');
      setShowEditCompanySuggestions(false);
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

  const validateNewUser = () => {
    const errors: any = {};
    
    // First name validation
    if (!newUserData.first_name.trim()) {
      errors.first_name = language === 'ar' ? 'الاسم الأول مطلوب' : language === 'de' ? 'Vorname erforderlich' : 'First name is required';
    }
    
    // Last name validation
    if (!newUserData.last_name.trim()) {
      errors.last_name = language === 'ar' ? 'اسم العائلة مطلوب' : language === 'de' ? 'Nachname erforderlich' : 'Last name is required';
    }
    
    // Email validation
    if (!newUserData.email.trim()) {
      errors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : language === 'de' ? 'E-Mail erforderlich' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
      errors.email = language === 'ar' ? 'البريد الإلكتروني غير صالح' : language === 'de' ? 'Ungültige E-Mail' : 'Invalid email format';
    }
    
    // Password validation
    if (!newUserData.password) {
      errors.password = language === 'ar' ? 'كلمة المرور مطلوبة' : language === 'de' ? 'Passwort erforderlich' : 'Password is required';
    } else if (newUserData.password.length < 6) {
      errors.password = language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : language === 'de' ? 'Passwort muss mindestens 6 Zeichen lang sein' : 'Password must be at least 6 characters';
    }
    
    // Phone validation (optional but if provided should be valid)
    if (newUserData.phone && !/^\+?[0-9]{10,15}$/.test(newUserData.phone.replace(/\s/g, ''))) {
      errors.phone = language === 'ar' ? 'رقم الهاتف غير صالح' : language === 'de' ? 'Ungültige Telefonnummer' : 'Invalid phone number';
    }
    
    setUserValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateNewUser()) {
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

    try {
      setLoading(true);
      
      // Register the user
      const registerResponse = await authApi.register({
        email: newUserData.email,
        password: newUserData.password,
        first_name: newUserData.first_name,
        last_name: newUserData.last_name,
        phone: newUserData.phone || undefined
      });
      
      // Get the created user to assign role
      const users = await adminApi.getUsers(false);
      const createdUser = users.find((u: any) => u.email === newUserData.email);
      
      if (createdUser && newUserData.role !== 'user') {
        // Assign role if not default 'user'
        const roleNames: string[] = [];
        if (newUserData.role === 'admin') {
          roleNames.push('Administrator');
        } else if (newUserData.role === 'agent') {
          roleNames.push('Agent');
          // For Agent Managers, automatically assign their company
          const agentMgrCompanyId = (user?.role === 'agent' && user?.agent_type === 'manager' && user?.company_id);
          const companyIdToUse = agentMgrCompanyId ? user.company_id : newUserData.company_id;
          // Also update agent info (company and type)
          if (companyIdToUse || newUserData.agent_type) {
            await adminApi.updateAgentInfo(createdUser.id, {
              company_id: companyIdToUse ? Number(companyIdToUse) : null,
              agent_type: newUserData.agent_type || null
            });
          }
        }
        
        if (roleNames.length > 0) {
          await adminApi.changeUserRole(createdUser.id, roleNames);
        }
      }
      
      alert(language === 'ar' 
        ? 'تم إضافة المستخدم بنجاح'
        : language === 'de' 
        ? 'Benutzer erfolgreich hinzugefügt'
        : 'User added successfully');
      
      // Reset form
      setNewUserData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        company_id: '',
        agent_type: ''
      });
      setUserValidationErrors({});
      setCompanySearchQuery('');
      setSelectedCompanyName('');
      setShowCompanySuggestions(false);
      setShowAddUserDialog(false);
      
      // Refresh users list
      loadUsers();
    } catch (err: any) {
      console.error('Error adding user:', err);
      
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
        ? 'فشل إضافة المستخدم. يرجى المحاولة مرة أخرى.'
        : language === 'de' 
        ? 'Fehler beim Hinzufügen des Benutzers. Bitte versuchen Sie es erneut.'
        : 'Failed to add user. Please try again.');
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!entityId) {
      alert('Please enter entity ID');
      return;
    }

    try {
      setLoading(true);
      setUploadStatus('idle');
      
      // If editing an existing image
      if (editingImage) {
        // Update metadata only (entity_type and entity_id)
        await adminApi.updateImage(editingImage.id, {
          entity_type: photoType,
          entity_id: parseInt(entityId)
        });
        
        // If a new file was selected, upload it as a separate image
        if (selectedFile) {
          await adminApi.uploadImage(selectedFile, photoType, parseInt(entityId));
        }
      } else {
        // Create new image - file is required
        if (!selectedFile) {
          alert('Please select a file');
          return;
        }
        await adminApi.uploadImage(selectedFile, photoType, parseInt(entityId));
      }
      
      setUploadStatus('success');
      setSelectedFile(null);
      setEntityId('');
      setEditingImage(null);
      
      // Reload images to show the changes
      await loadImages();
      
      // Close dialog after successful operation
      setTimeout(() => {
        setUploadStatus('idle');
        setShowPhotoUploadDialog(false);
      }, 2000);
    } catch (err: any) {
      setUploadStatus('error');
      alert(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      const imagesData = await imagesApi.getAll();
      setImages(Array.isArray(imagesData) ? imagesData : []);
    } catch (err: any) {
      console.error('Error loading images:', err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = (image: any) => {
    setEditingImage(image);
    setPhotoType(image.entity_type as 'bus' | 'station');
    setEntityId(String(image.entity_id));
    setSelectedFile(null);
    setShowPhotoUploadDialog(true);
  };

  const handleDeleteImage = async (imageId: number) => {
    const confirmMsg = language === 'ar' 
      ? 'هل أنت متأكد من حذف هذه الصورة؟' 
      : language === 'de' 
      ? 'Sind Sie sicher, dass Sie dieses Bild löschen möchten?' 
      : 'Are you sure you want to delete this image?';
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.deleteImage(imageId);
      await loadImages();
      alert(language === 'ar' ? 'تم حذف الصورة' : language === 'de' ? 'Bild gelöscht' : 'Image deleted');
    } catch (err: any) {
      console.error('Error deleting image:', err);
      alert(err.message || 'Failed to delete image');
    } finally {
      setLoading(false);
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
      
      // Load trip form data first if not already loaded
      if (cities.length === 0 || companies.length === 0 || transportTypes.length === 0 || stations.length === 0) {
        console.log('Loading trip form data first...');
        await loadTripFormData();
      }
      
      // Load trip details
      const trip = await tripsApi.getById(tripId);
      
      console.log('Loaded trip data:', trip);
      
      if (!trip) {
        throw new Error('Trip data is empty');
      }
      
      // The backend already returns from_city and to_city from the JOIN
      const fromCity = trip.from_city || '';
      const toCity = trip.to_city || '';
      
      console.log('Cities from trip:', { fromCity, toCity });
      
      // Convert trip data to form format
      // Get trip price from trip_fares if available
      let tripPrice = '';
      let tripCurrency = 'SYP';
      let loadedFares: any[] = [];
      if (trip.id) {
        try {
          const tripIdNum = typeof trip.id === 'string' ? parseInt(trip.id) : trip.id;
          const fares = await adminApi.getFares(tripIdNum);
          if (fares && Array.isArray(fares) && fares.length > 0) {
            tripPrice = String(fares[0].price || '');
            tripCurrency = fares[0].currency || 'SYP';
            loadedFares = fares.map((f: any) => ({
              id: f.id,
              fare_category_id: String(f.fare_category_id || ''),
              booking_option_id: String(f.booking_option_id || ''),
              price_modifier: String(f.price_modifier || '0'),
              seats_available: String(f.seats_available || ''),
            }));
          }
        } catch (e) {
          console.log('Could not load trip fares:', e);
        }
      }

      setNewTrip({
        from_city: fromCity,
        to_city: toCity,
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
      
      // Load trip image if it exists
      try {
        const allImages = await adminApi.getAllImages();
        const tripImage = allImages.find((img: any) => img.entity_type === 'trip' && img.entity_id === tripId);
        if (tripImage) {
          setTripImageId(tripImage.id);
        } else {
          setTripImageId(null);
        }
      } catch (imgErr) {
        console.log('Could not load trip image:', imgErr);
        setTripImageId(null);
      }
      
      // Set loaded fares or empty array
      setTripFares(loadedFares);
      
      console.log('Setting editingTripId and opening dialog...');
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
      
      console.log('handleSaveTrip - Starting save process');
      console.log('handleSaveTrip - newTrip:', newTrip);
      console.log('handleSaveTrip - cities array length:', cities.length);
      console.log('handleSaveTrip - routes array length:', routes.length);
      
      // ALWAYS find or create the route based on selected cities
      // This ensures that when cities are changed, the route_id is updated
      if (newTrip.from_city && newTrip.to_city) {
        console.log('handleSaveTrip - Looking for route:', newTrip.from_city, '->', newTrip.to_city);
        // Find existing route
        const fromCity = cities.find((c: any) => c.name === newTrip.from_city);
        const toCity = cities.find((c: any) => c.name === newTrip.to_city);
        
        console.log('handleSaveTrip - fromCity found:', fromCity);
        console.log('handleSaveTrip - toCity found:', toCity);
        
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

      // Calculate duration if not provided or invalid
      let duration = parseInt(newTrip.duration_minutes);
      if (isNaN(duration) || duration <= 0) {
        if (newTrip.departure_time && newTrip.arrival_time) {
          const dep = new Date(newTrip.departure_time);
          const arr = new Date(newTrip.arrival_time);
          if (!isNaN(dep.getTime()) && !isNaN(arr.getTime())) {
            duration = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
          }
        }
      }

      // For Agent Managers, always use their company_id
      const companyIdToUse = isAgentManager ? user?.company_id : parseInt(newTrip.company_id);

      const tripData = {
        route_id: parseInt(routeId),
        company_id: companyIdToUse,
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

      console.log('handleSaveTrip - tripData prepared:', tripData);
      console.log('handleSaveTrip - editingTripId:', editingTripId);

      if (editingTripId) {
        // Update existing trip
        console.log('handleSaveTrip - Calling adminApi.updateTrip with ID:', editingTripId);
        const updatedTrip = await adminApi.updateTrip(editingTripId, tripData);
        console.log('handleSaveTrip - updateTrip response:', updatedTrip);
        
        // Update trip image if selected
        if (tripImageId) {
          try {
            // Update the image entity_id to link it to this trip
            await fetch(`/api/admin/images/${tripImageId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                entity_type: 'trip',
                entity_id: editingTripId,
              }),
            });
          } catch (imgErr) {
            console.error('Error updating trip image:', imgErr);
          }
        }
        
        // The backend returns the complete trip with JOIN data (from_city, to_city, company_name)
        // Replace the entire trip object to ensure all fields are updated
        setTrips(prevTrips => 
          prevTrips.map(trip => 
            trip.id === editingTripId ? updatedTrip : trip
          )
        );
        
        // Trigger ScheduleManagement to refresh its data
        setScheduleRefreshTrigger(prev => prev + 1);
        
        // Save trip fares if any
        if (tripFares.length > 0 && editingTripId) {
          try {
            await adminApi.createTripFares(editingTripId, tripFares.map(fare => ({
              fare_category_id: parseInt(fare.fare_category_id),
              booking_option_id: parseInt(fare.booking_option_id),
              price_modifier: parseFloat(fare.price_modifier),
              seats_available: parseInt(fare.seats_available) || 0,
            })));
          } catch (faresErr) {
            console.error('Error saving trip fares:', faresErr);
          }
        }
        
        alert(language === 'ar' ? 'تم تحديث الرحلة بنجاح' : language === 'de' ? 'Fahrt erfolgreich aktualisiert' : 'Trip updated successfully!');
      } else {
        // Create new trip
        const newCreatedTrip = await adminApi.createTrip(tripData);
        
        // Link image to newly created trip
        if (tripImageId && newCreatedTrip.id) {
          try {
            await fetch(`/api/admin/images/${tripImageId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                entity_type: 'trip',
                entity_id: newCreatedTrip.id,
              }),
            });
          } catch (imgErr) {
            console.error('Error linking trip image:', imgErr);
          }
        }
        
        // Add stops if any were defined
        if (newTripStops.length > 0 && newCreatedTrip.id) {
          try {
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            const token = localStorage.getItem("token");
            
            // Add each stop to the newly created trip
            for (const stop of newTripStops) {
              await fetch(`${API_BASE}/api/admin/trips/${newCreatedTrip.id}/steps`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  station_id: parseInt(stop.station_id),
                  stop_order: stop.stop_order,
                  arrival_time: stop.arrival_time || null,
                  departure_time: stop.departure_time || null,
                }),
              });
            }
          } catch (stopsErr) {
            console.error('Error adding stops:', stopsErr);
            // Don't fail the entire trip creation if stops fail
            alert(language === 'ar' 
              ? 'تم إنشاء الرحلة ولكن فشل إضافة بعض المحطات' 
              : language === 'de' 
              ? 'Fahrt erstellt, aber einige Haltestellen konnten nicht hinzugefügt werden' 
              : 'Trip created but some stops failed to add');
          }
        }
        
        // Add the new trip to the local state instead of reloading all trips
        setTrips(prevTrips => [...prevTrips, newCreatedTrip]);
        
        // Trigger ScheduleManagement to refresh its data
        setScheduleRefreshTrigger(prev => prev + 1);
        
        // Save trip fares if any
        if (tripFares.length > 0 && newCreatedTrip.id) {
          try {
            await adminApi.createTripFares(newCreatedTrip.id, tripFares.map(fare => ({
              fare_category_id: parseInt(fare.fare_category_id),
              booking_option_id: parseInt(fare.booking_option_id),
              price_modifier: parseFloat(fare.price_modifier),
              seats_available: parseInt(fare.seats_available) || 0,
            })));
          } catch (faresErr) {
            console.error('Error saving trip fares:', faresErr);
          }
        }
        
        // Handle recurring trips
        if (recurringType !== 'once') {
          const baseDepartureTime = new Date(newTrip.departure_time);
          const baseArrivalTime = new Date(newTrip.arrival_time);
          const iterations = recurringType === 'daily' ? 30 : 4;
          const dayIncrement = recurringType === 'daily' ? 1 : 7;
          
          for (let i = 1; i < iterations; i++) {
            try {
              const recurringDepartureTime = new Date(baseDepartureTime);
              recurringDepartureTime.setDate(recurringDepartureTime.getDate() + (dayIncrement * i));
              
              const recurringArrivalTime = new Date(baseArrivalTime);
              recurringArrivalTime.setDate(recurringArrivalTime.getDate() + (dayIncrement * i));
              
              const recurringTripData = {
                ...tripData,
                departure_time: recurringDepartureTime.toISOString(),
                arrival_time: recurringArrivalTime.toISOString(),
              };
              
              const recurringTrip = await adminApi.createTrip(recurringTripData);
              
              // Link image to recurring trip as well
              if (tripImageId && recurringTrip.id) {
                try {
                  await fetch(`/api/admin/images/${tripImageId}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                      entity_type: 'trip',
                      entity_id: recurringTrip.id,
                    }),
                  });
                } catch (imgErr) {
                  console.error('Error linking recurring trip image:', imgErr);
                }
              }
              
              // Add stops to recurring trip
              if (newTripStops.length > 0 && recurringTrip.id) {
                try {
                  const API_BASE = import.meta.env.VITE_API_BASE || "";
                  const token = localStorage.getItem("token");
                  
                  for (const stop of newTripStops) {
                    // Calculate stop times based on the recurring trip times
                    const stopDepartureTime = stop.departure_time ? new Date(stop.departure_time) : null;
                    const stopArrivalTime = stop.arrival_time ? new Date(stop.arrival_time) : null;
                    
                    if (stopDepartureTime) {
                      stopDepartureTime.setDate(stopDepartureTime.getDate() + (dayIncrement * i));
                    }
                    if (stopArrivalTime) {
                      stopArrivalTime.setDate(stopArrivalTime.getDate() + (dayIncrement * i));
                    }
                    
                    await fetch(`${API_BASE}/api/admin/trips/${recurringTrip.id}/steps`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({
                        station_id: parseInt(stop.station_id),
                        stop_order: stop.stop_order,
                        arrival_time: stopArrivalTime ? stopArrivalTime.toISOString() : null,
                        departure_time: stopDepartureTime ? stopDepartureTime.toISOString() : null,
                      }),
                    });
                  }
                } catch (stopsErr) {
                  console.error('Error adding stops to recurring trip:', stopsErr);
                }
              }
              
              // Copy fares to recurring trip
              if (tripFares.length > 0 && recurringTrip.id) {
                try {
                  await adminApi.createTripFares(recurringTrip.id, tripFares.map(fare => ({
                    fare_category_id: parseInt(fare.fare_category_id),
                    booking_option_id: parseInt(fare.booking_option_id),
                    price_modifier: parseFloat(fare.price_modifier),
                    seats_available: parseInt(fare.seats_available) || 0,
                  })));
                } catch (faresErr) {
                  console.error('Error saving recurring trip fares:', faresErr);
                }
              }
              
              // Add recurring trip to local state
              setTrips(prevTrips => [...prevTrips, recurringTrip]);
            } catch (recurringErr) {
              console.error(`Error creating recurring trip ${i + 1}:`, recurringErr);
            }
          }
        }
        
        alert(t.tripAdded || 'Trip added successfully!');
      }
      
      setShowAddTripDialog(false);
      setEditingTripId(null);
      setNewTripStops([]);
      setTripImageId(null);
      setTripFares([]);
      setRecurringType('once');
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
    setTripImageId(null);
    setTripFares([]);
    setRecurringType('once');
    // For Agent Managers, automatically set their company_id
    const agentManagerCompanyId = (user?.role === 'agent' && user?.agent_type === 'manager' && user?.company_id) 
      ? String(user.company_id) 
      : '';
    setNewTrip({
      route_id: '',
      company_id: agentManagerCompanyId,
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
    setNewTripStops([]);
    setShowAddTripDialog(true);
  };

  const handleDeleteTrip = async (tripId: number, permanent: boolean = false) => {
    const trip = trips.find((t: any) => t.id === tripId);
    const isInTrash = trip?.deleted_at !== null;
    
    // If in trash or permanent flag set, do hard delete
    if (isInTrash || permanent) {
      const confirmMessage = language === 'ar'
        ? 'هل أنت متأكد من حذف هذه الرحلة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.'
        : language === 'de'
        ? 'Sind Sie sicher, dass Sie diese Fahrt dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
        : 'Are you sure you want to permanently delete this trip? This action cannot be undone.';
      
      if (!confirm(confirmMessage)) return;
    }

    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const token = localStorage.getItem("token");
      
      const url = isInTrash || permanent 
        ? `${API_BASE}/api/admin/trips/${tripId}?permanent=true`
        : `${API_BASE}/api/admin/trips/${tripId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('Failed to delete trip');
      
      setTrips(prevTrips => prevTrips.filter((t: any) => t.id !== tripId));
      
      alert(isInTrash || permanent
        ? (language === 'ar' ? 'تم حذف الرحلة نهائياً' : language === 'de' ? 'Fahrt dauerhaft gelöscht' : 'Trip permanently deleted')
        : (language === 'ar' ? 'تم نقل الرحلة إلى سلة المهملات' : language === 'de' ? 'Fahrt in Papierkorb verschoben' : 'Trip moved to trash')
      );
      
      await loadSchedules(false);
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert(err.message || (language === 'ar' ? 'فشل حذف الرحلة' : language === 'de' ? 'Fehler beim Löschen' : 'Failed to delete trip'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTrip = async (tripId: number) => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}/restore`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('Failed to restore trip');
      
      alert(language === 'ar' ? 'تم استعادة الرحلة' : language === 'de' ? 'Fahrt wiederhergestellt' : 'Trip restored');
      await loadSchedules(false);
    } catch (err: any) {
      console.error('Error restoring trip:', err);
      alert(err.message || 'Failed to restore trip');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSteps = async (trip: any) => {
    try {
      setSelectedTripForSteps(trip);
      setShowStepsDialog(true);
      setLoading(true);
      
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}/api/admin/trips/${trip.id}/steps`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('Failed to load stops');
      const steps = await response.json();
      setTripSteps(steps);
    } catch (err: any) {
      console.error('Error loading stops:', err);
      alert('Failed to load stops');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = async (stationId: number, stopOrder: number, arrivalTime?: string, departureTime?: string) => {
    if (!selectedTripForSteps) return;
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}/api/admin/trips/${selectedTripForSteps.id}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          station_id: stationId,
          stop_order: stopOrder,
          arrival_time: arrivalTime || null,
          departure_time: departureTime || null,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add stop');
      
      await handleViewSteps(selectedTripForSteps);
      alert(language === 'ar' ? 'تم إضافة المحطة' : language === 'de' ? 'Haltestelle hinzugefügt' : 'Stop added');
    } catch (err: any) {
      console.error('Error adding stop:', err);
      alert('Failed to add stop');
    }
  };

  const handleRemoveStop = async (stopId: number) => {
    if (!selectedTripForSteps) return;
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}/api/admin/trips/${selectedTripForSteps.id}/steps/${stopId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('Failed to remove stop');
      
      await handleViewSteps(selectedTripForSteps);
      alert(language === 'ar' ? 'تم حذف المحطة' : language === 'de' ? 'Haltestelle entfernt' : 'Stop removed');
    } catch (err: any) {
      console.error('Error removing stop:', err);
      alert('Failed to remove stop');
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

  // canAccessDashboard uses the isAdmin and isAgentManager defined at the top
  const canAccessDashboard = isAdmin || isAgentManager || isDriver;

  const tabs = [
    // Analytics - Admin only
    ...(isAdmin ? [{ id: 'analytics' as const, label: t.analytics, icon: BarChart3 }] : []),
    // Company Bookings - Agent Manager only
    ...(isAgentManager ? [{ id: 'company-bookings' as const, label: language === 'de' ? 'Firmenbuchungen' : language === 'ar' ? 'حجوزات الشركة' : 'Company Bookings', icon: ListChecks }] : []),
    // QR Scanner - Driver or Driver Assistant only
    ...(isDriver ? [{ id: 'qr-scanner' as const, label: language === 'de' ? 'QR-Scanner' : language === 'ar' ? 'ماسح QR' : 'QR Scanner', icon: Scan }] : []),
    { id: 'schedules' as const, label: t.scheduleManagement, icon: Calendar },
    // Users management tab - Admin or Agent Manager
    ...((isAdmin || isAgentManager) ? [{ id: 'users' as const, label: t.userManagement, icon: Users }] : []),
    // Companies management tab - Admin only
    ...(isAdmin ? [{ id: 'companies' as const, label: t.companyManagement, icon: Building2 }] : []),
    // Branches management tab - Agent Manager only
    ...(isAgentManager ? [{ id: 'branches' as const, label: t.branchManagement, icon: Building2 }] : []),
    // Ratings management tab - Admin only
    ...(isAdmin ? [{ id: 'ratings' as const, label: t.ratingsManagement, icon: Star }] : []),
    // Bookings management tab - Admin or Agent Manager
    ...((isAdmin || isAgentManager) ? [{ id: 'bookings' as const, label: t.bookingsManagement, icon: Calendar }] : []),
    // Invoices management tab - Admin or Agent Manager
    ...((isAdmin || isAgentManager) ? [{ id: 'invoices' as const, label: t.invoicesManagement, icon: Download }] : []),
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
                      // Load trips when opening - backend automatically filters by company for agent managers
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
        <>
          <ScheduleManagement 
            language={language}
            onEditTrip={handleEditTrip}
            onAddTrip={() => setShowAddTripDialog(true)}
            refreshTrigger={scheduleRefreshTrigger}
          />

          {/* Add Trip Dialog - Popup Window */}
          {showAddTripDialog && (
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
                // Close dialog when clicking on backdrop
                if (e.target === e.currentTarget) {
                  setShowAddTripDialog(false);
                  setEditingTripId(null);
                  setNewTripStops([]);
                }
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col"
                style={{ 
                  position: 'relative',
                  zIndex: 100000,
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Sticky */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center z-10 shadow-lg">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
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
                      setNewTripStops([]);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    title={language === 'ar' ? 'إغلاق' : language === 'de' ? 'Schließen' : 'Close'}
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
                    maxHeight: 'calc(95vh - 100px)',
                  }}
                >
                  <div className="space-y-4">
                  {/* From City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.from}</label>
                    <select
                      value={newTrip.from_city}
                      onChange={(e) => {
                        const fromCity = e.target.value;
                        const fromCityObj = cities.find((c: any) => c.name === fromCity);
                        setNewTrip((prev: any) => ({ 
                          ...prev, 
                          from_city: fromCity, 
                          route_id: '',
                          departure_station_id: '' // Reset departure station when city changes
                        }));
                        // Auto-select route if to_city is already selected
                        if (newTrip.to_city && fromCity && fromCityObj) {
                          const toCityObj = cities.find((c: any) => c.name === newTrip.to_city);
                          if (toCityObj) {
                            const existingRoute = routes.find((r: any) => 
                              r.from_city_id === fromCityObj.id && r.to_city_id === toCityObj.id
                            );
                            if (existingRoute) {
                              setNewTrip((prev: any) => ({ 
                                ...prev, 
                                from_city: fromCity, 
                                route_id: String(existingRoute.id),
                                departure_station_id: '' // Reset departure station when city changes
                              }));
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
                        setNewTrip((prev: any) => ({ 
                          ...prev, 
                          to_city: toCity, 
                          route_id: '',
                          arrival_station_id: '' // Reset arrival station when city changes
                        }));
                        // Auto-select route if from_city is already selected
                        if (newTrip.from_city && toCity && toCityObj) {
                          const fromCityObj = cities.find((c: any) => c.name === newTrip.from_city);
                          if (fromCityObj) {
                            const existingRoute = routes.find((r: any) => 
                              r.from_city_id === fromCityObj.id && r.to_city_id === toCityObj.id
                            );
                            if (existingRoute) {
                              setNewTrip((prev: any) => ({ 
                                ...prev, 
                                to_city: toCity, 
                                route_id: String(existingRoute.id),
                                arrival_station_id: '' // Reset arrival station when city changes
                              }));
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

                  {/* Company - Only show for Admins, Agent Managers use their company automatically */}
                  {isAdmin ? (
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
                  ) : isAgentManager ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.company}</label>
                      <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                        {user?.company_name || (language === 'ar' ? 'شركتك' : language === 'de' ? 'Ihre Firma' : 'Your company')}
                      </div>
                    </div>
                  ) : null}

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
                        disabled={!newTrip.from_city}
                      >
                        <option value="">
                          {!newTrip.from_city 
                            ? (language === 'ar' ? 'اختر مدينة المغادرة أولاً' : language === 'de' ? 'Wähle zuerst Abfahrtsstadt' : 'Select departure city first')
                            : (t.selectStation || 'Select Station')
                          }
                        </option>
                        {stations
                          .filter((station: any) => station.city_name === newTrip.from_city)
                          .map((station: any) => (
                            <option key={station.id} value={station.id}>
                              {station.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Arrival Station */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.arrival || 'Arrival'} {t.station}</label>
                      <select
                        value={newTrip.arrival_station_id}
                        onChange={(e) => setNewTrip({ ...newTrip, arrival_station_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={!newTrip.to_city}
                      >
                        <option value="">
                          {!newTrip.to_city 
                            ? (language === 'ar' ? 'اختر مدينة الوصول أولاً' : language === 'de' ? 'Wähle zuerst Ankunftsstadt' : 'Select arrival city first')
                            : (t.selectStation || 'Select Station')
                          }
                        </option>
                        {stations
                          .filter((station: any) => station.city_name === newTrip.to_city)
                          .map((station: any) => (
                            <option key={station.id} value={station.id}>
                              {station.name}
                            </option>
                          ))
                        }
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
                        <option value="SYP">SYP (Old Syrian Pound - ليرة سورية قديمة)</option>
                        <option value="NEW_SYP">NEW SYP (New Syrian Pound - ليرة السورية الجديدة)</option>
                        <option value="TRY">TRY (Turkish Lira - ليرة تركية)</option>
                        <option value="USD">USD (US Dollar - دولار أمريكي)</option>
                        <option value="EUR">EUR (Euro - يورو)</option>
                      </select>
                    </div>
                  </div>

                  {/* Trip Fares & Options */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {language === 'ar' ? 'أسعار الرحلة والخيارات' : language === 'de' ? 'Fahrpreise & Optionen' : 'Trip Fares & Options'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setTripFares([...tripFares, {
                            fare_category_id: fareCategories[0]?.id || '',
                            booking_option_id: bookingOptions[0]?.id || '',
                            price_modifier: '0',
                            seats_available: newTrip.seats_total || ''
                          }]);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        {language === 'ar' ? 'إضافة سعر' : language === 'de' ? 'Preis hinzufügen' : 'Add Fare'}
                      </button>
                    </div>

                    {tripFares.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === 'ar' ? 'لا توجد أسعار. انقر على "إضافة سعر" لإضافة خيارات التسعير.' : language === 'de' ? 'Keine Preise. Klicken Sie auf "Preis hinzufügen", um Preisoptionen hinzuzufügen.' : 'No fares. Click "Add Fare" to add pricing options.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tripFares.map((fare, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-end border border-gray-200 p-3 rounded-lg bg-gray-50">
                            <div className="col-span-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'ar' ? 'فئة السعر' : language === 'de' ? 'Preiskategorie' : 'Fare Category'}
                              </label>
                              <select
                                value={fare.fare_category_id}
                                onChange={(e) => {
                                  const newFares = [...tripFares];
                                  newFares[index].fare_category_id = e.target.value;
                                  setTripFares(newFares);
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">{language === 'ar' ? 'اختر فئة' : language === 'de' ? 'Wählen' : 'Select'}</option>
                                {fareCategories.map(cat => (
                                  <option key={cat.id} value={cat.id}>
                                    {language === 'ar' && cat.label_ar ? cat.label_ar : cat.label || cat.code}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-span-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'ar' ? 'خيار الحجز' : language === 'de' ? 'Buchungsoption' : 'Booking Option'}
                              </label>
                              <select
                                value={fare.booking_option_id}
                                onChange={(e) => {
                                  const newFares = [...tripFares];
                                  newFares[index].booking_option_id = e.target.value;
                                  setTripFares(newFares);
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">{language === 'ar' ? 'اختر خيار' : language === 'de' ? 'Wählen' : 'Select'}</option>
                                {bookingOptions.map(opt => (
                                  <option key={opt.id} value={opt.id}>
                                    {language === 'ar' && opt.label_ar ? opt.label_ar : opt.label || opt.code}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'ar' ? 'تعديل السعر' : language === 'de' ? 'Preisänderung' : 'Price +/-'}
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={fare.price_modifier}
                                onChange={(e) => {
                                  const newFares = [...tripFares];
                                  newFares[index].price_modifier = e.target.value;
                                  setTripFares(newFares);
                                }}
                                placeholder="0"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'ar' ? 'المقاعد' : language === 'de' ? 'Sitze' : 'Seats'}
                              </label>
                              <input
                                type="number"
                                value={fare.seats_available}
                                onChange={(e) => {
                                  const newFares = [...tripFares];
                                  newFares[index].seats_available = e.target.value;
                                  setTripFares(newFares);
                                }}
                                placeholder="10"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                              />
                            </div>

                            <div className="col-span-2 flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-700">
                                {language === 'ar' ? 'السعر النهائي:' : language === 'de' ? 'Endpreis:' : 'Final:'}
                                <br />
                                <span className="text-green-600">
                                  {(parseFloat(newTrip.price || '0') + parseFloat(fare.price_modifier || '0')).toFixed(2)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setTripFares(tripFares.filter((_, i) => i !== index));
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {language === 'ar' 
                        ? 'قم بإنشاء خيارات تسعير متعددة للرحلة نفسها (مثل: بالغ، طفل، طالب) مع خيارات حجز مختلفة (مثل: قياسي، مقعد بجانب النافذة، أمتعة إضافية).'
                        : language === 'de'
                        ? 'Erstellen Sie mehrere Preisoptionen für dieselbe Fahrt (z.B. Erwachsener, Kind, Student) mit verschiedenen Buchungsoptionen (z.B. Standard, Fensterplatz, Extra-Gepäck).'
                        : 'Create multiple pricing options for the same trip (e.g., Adult, Child, Student) with different booking options (e.g., Standard, Window Seat, Extra Luggage).'}
                    </p>
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

                  {/* Recurring Trip Option */}
                  {!editingTripId && (
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.recurringTrip}</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recurring"
                            value="once"
                            checked={recurringType === 'once'}
                            onChange={(e) => setRecurringType(e.target.value as 'once' | 'daily' | 'weekly')}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm">{t.once}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recurring"
                            value="daily"
                            checked={recurringType === 'daily'}
                            onChange={(e) => setRecurringType(e.target.value as 'once' | 'daily' | 'weekly')}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm">{t.daily}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recurring"
                            value="weekly"
                            checked={recurringType === 'weekly'}
                            onChange={(e) => setRecurringType(e.target.value as 'once' | 'daily' | 'weekly')}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm">{t.weekly}</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{t.recurringInfo}</p>
                    </div>
                  )}

                  {/* Bus Photo Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'صورة الباص' : language === 'de' ? 'Busfoto' : 'Bus Photo'}
                    </label>
                    
                    {/* Photo Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dropdown to select existing photo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {language === 'ar' ? 'اختر صورة موجودة' : language === 'de' ? 'Vorhandenes Foto wählen' : 'Select Existing Photo'}
                        </label>
                        <select
                          value={tripImageId || ''}
                          onChange={(e) => setTripImageId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">
                            {language === 'ar' ? 'لا توجد صورة' : language === 'de' ? 'Kein Foto' : 'No photo'}
                          </option>
                          {busImages.map((img: any) => (
                            <option key={img.id} value={img.id}>
                              {img.file_name || `Image ${img.id}`} ({img.entity_type})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Upload new photo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {language === 'ar' ? 'أو ارفع صورة جديدة' : language === 'de' ? 'Oder neues Foto hochladen' : 'Or Upload New Photo'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              try {
                                setUploadingBusPhoto(true);
                                const formData = new FormData();
                                formData.append('image', file);
                                formData.append('entity_type', 'bus');
                                formData.append('entity_id', '0'); // Temporary ID, will be updated when trip is created
                                
                                const response = await fetch('/api/admin/images', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                  },
                                  body: formData,
                                });
                                
                                if (!response.ok) throw new Error('Upload failed');
                                
                                const uploadedImage = await response.json();
                                setTripImageId(uploadedImage.id);
                                await loadBusImages(); // Reload images list
                                
                                alert(language === 'ar' ? 'تم رفع الصورة بنجاح' : language === 'de' ? 'Foto erfolgreich hochgeladen' : 'Photo uploaded successfully');
                              } catch (err) {
                                console.error('Error uploading photo:', err);
                                alert(language === 'ar' ? 'فشل رفع الصورة' : language === 'de' ? 'Fehler beim Hochladen' : 'Upload failed');
                              } finally {
                                setUploadingBusPhoto(false);
                                e.target.value = ''; // Reset file input
                              }
                            }}
                            className="flex-1 text-sm"
                            disabled={uploadingBusPhoto}
                          />
                          {uploadingBusPhoto && (
                            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo Preview */}
                    {tripImageId && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {language === 'ar' ? 'معاينة' : language === 'de' ? 'Vorschau' : 'Preview'}
                        </p>
                        <img
                          src={busImages.find(img => img.id === tripImageId)?.image_url || `https://via.placeholder.com/400x300?text=Image+${tripImageId}`}
                          alt="Bus preview"
                          className="max-w-full h-auto max-h-48 rounded-lg object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setTripImageId(null)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          {language === 'ar' ? 'إزالة الصورة' : language === 'de' ? 'Foto entfernen' : 'Remove Photo'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stops Section - Only for new trips */}
                  {!editingTripId && (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'ar' ? 'المحطات (اختياري)' : language === 'de' ? 'Haltestellen (optional)' : 'Stops (Optional)'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setNewTripStops([...newTripStops, {
                              station_id: '',
                              stop_order: newTripStops.length + 1,
                              arrival_time: '',
                              departure_time: '',
                            }]);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          {language === 'ar' ? 'إضافة محطة' : language === 'de' ? 'Haltestelle hinzufügen' : 'Add Stop'}
                        </button>
                      </div>
                      
                      {newTripStops.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {language === 'ar' ? 'لم يتم إضافة محطات بعد. انقر فوق "إضافة محطة" لإضافة محطات إلى هذه الرحلة.' : language === 'de' ? 'Noch keine Haltestellen hinzugefügt. Klicken Sie auf "Haltestelle hinzufügen", um Haltestellen zu dieser Fahrt hinzuzufügen.' : 'No stops added yet. Click "Add Stop" to add stops to this trip.'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {newTripStops.map((stop, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                  {index + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {language === 'ar' ? 'المحطة' : language === 'de' ? 'Station' : 'Station'}
                                    </label>
                                    <select
                                      value={stop.station_id}
                                      onChange={(e) => {
                                        const newStops = [...newTripStops];
                                        newStops[index].station_id = e.target.value;
                                        setNewTripStops(newStops);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      required
                                    >
                                      <option value="">
                                        {language === 'ar' ? 'اختر محطة' : language === 'de' ? 'Station wählen' : 'Select station'}
                                      </option>
                                      {stations.map((station: any) => (
                                        <option key={station.id} value={station.id}>
                                          {station.city_name} - {station.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {language === 'ar' ? 'وقت الوصول' : language === 'de' ? 'Ankunftszeit' : 'Arrival Time'}
                                    </label>
                                    <input
                                      type="time"
                                      value={stop.arrival_time || ''}
                                      onChange={(e) => {
                                        const newStops = [...newTripStops];
                                        newStops[index].arrival_time = e.target.value;
                                        setNewTripStops(newStops);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {language === 'ar' ? 'وقت المغادرة' : language === 'de' ? 'Abfahrtszeit' : 'Departure Time'}
                                    </label>
                                    <input
                                      type="time"
                                      value={stop.departure_time || ''}
                                      onChange={(e) => {
                                        const newStops = [...newTripStops];
                                        newStops[index].departure_time = e.target.value;
                                        setNewTripStops(newStops);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newStops = newTripStops.filter((_, i) => i !== index);
                                    // Re-number the remaining stops
                                    newStops.forEach((s, i) => s.stop_order = i + 1);
                                    setNewTripStops(newStops);
                                  }}
                                  className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors p-1"
                                  title={language === 'ar' ? 'حذف المحطة' : language === 'de' ? 'Haltestelle löschen' : 'Delete stop'}
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
                        setNewTripStops([]);
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
        </>
      )}

      {activeTab === 'users' && (isAdmin || isAgentManager) && (() => {
        // Filter users based on search and role
        let filteredUsers = users.filter((userItem: any) => {
          // For Agent Managers, only show users from their company
          if (isAgentManager && !isAdmin) {
            if (userItem.company_id !== user?.company_id) {
              return false;
            }
          }
          
          // Search filter
          const userName = `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim();
          const matchesSearch = userSearchQuery === '' ||
            userName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            userItem.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
          
          // Role filter
          const userRoles = Array.isArray(userItem.roles) ? userItem.roles : [];
          const hasAdminRole = userRoles.includes('Administrator');
          const hasAgentRole = userRoles.includes('Agent');
          const hasUserRole = userRoles.includes('User') || userRoles.length === 0;
          
          const matchesRole =
            userRoleFilter === 'all' ||
            (userRoleFilter === 'admin' && hasAdminRole) ||
            (userRoleFilter === 'agent' && hasAgentRole) ||
            (userRoleFilter === 'user' && hasUserRole);
          
          return matchesSearch && matchesRole;
        });

        return (
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
                      placeholder={t.searchUsersPlaceholder}
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as 'all' | 'admin' | 'agent' | 'user')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">{t.allRoles}</option>
                    <option value="admin">{t.adminRole}</option>
                    <option value="agent">{t.agentRole}</option>
                    <option value="user">{t.userRole}</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(userSearchQuery || userRoleFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setUserSearchQuery('');
                      setUserRoleFilter('all');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t.clearFilters}
                  </button>
                )}
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-600">
                {filteredUsers.length} {filteredUsers.length === 1 ? t.userRole : t.userManagement}
              </div>
            </div>

            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'المستخدمون' : language === 'de' ? 'Benutzer' : 'Users'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddUserDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {language === 'ar' ? 'إضافة مستخدم' : language === 'de' ? 'Benutzer hinzufügen' : 'Add User'}
              </button>
              <button
                onClick={() => setShowTrash(!showTrash)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showTrash 
                  ? (language === 'ar' ? 'إخفاء المحذوفة' : language === 'de' ? 'Gelöschte ausblenden' : 'Hide Deleted')
                  : (language === 'ar' ? 'إظهار المحذوفة' : language === 'de' ? 'Gelöschte anzeigen' : 'Show Deleted')
                }
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
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{t.userName}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>{t.userEmail}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>{t.userRole}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>{language === 'ar' ? 'الحالة' : language === 'de' ? 'Status' : 'Status'}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-600">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((userItem: any) => {
                      const userName = `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || userItem.email;
                      const roles = Array.isArray(userItem.roles) ? userItem.roles : [];
                      const isUserAdmin = roles.includes('Administrator') || roles.includes('ADMIN');
                      const isAgent = roles.includes('Agent') || roles.includes('AGENT');
                      const roleDisplay = isUserAdmin ? 'admin' : isAgent ? 'agent' : 'user';
                      const currentStatus = userItem.status || (userItem.is_active ? 'active' : 'inactive');
                      return (
                        <tr key={userItem.id} className={`hover:bg-gray-50 ${currentStatus === 'blocked' ? 'bg-red-50' : currentStatus === 'inactive' ? 'opacity-60 bg-gray-100' : ''}`}>
                          <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{userName}</td>
                          <td className="px-6 py-3 text-sm text-gray-900" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>{userItem.email}</td>
                          <td className="px-6 py-3" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              isUserAdmin ? 'bg-purple-100 text-purple-700' : isAgent ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {roleDisplay}
                            </span>
                          </td>
                          <td className="px-6 py-3" style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                            {(isAdmin || isAgentManager) ? (
                              <select
                                value={currentStatus}
                                onChange={(e) => handleUserStatusChange(userItem.id, e.target.value as 'active' | 'inactive' | 'blocked')}
                                disabled={loading}
                                className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${
                                  currentStatus === 'active' ? 'bg-green-100 text-green-700' :
                                  currentStatus === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}
                              >
                                <option value="active">{language === 'ar' ? 'نشط' : language === 'de' ? 'Aktiv' : 'Active'}</option>
                                <option value="inactive">{language === 'ar' ? 'غير نشط' : language === 'de' ? 'Inaktiv' : 'Inactive'}</option>
                                <option value="blocked">{language === 'ar' ? 'محظور' : language === 'de' ? 'Gesperrt' : 'Blocked'}</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                currentStatus === 'active' ? 'bg-green-100 text-green-700' :
                                currentStatus === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {currentStatus === 'active' ? (language === 'ar' ? 'نشط' : language === 'de' ? 'Aktiv' : 'Active') :
                                 currentStatus === 'inactive' ? (language === 'ar' ? 'غير نشط' : language === 'de' ? 'Inaktiv' : 'Inactive') :
                                 (language === 'ar' ? 'محظور' : language === 'de' ? 'Gesperrt' : 'Blocked')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm" style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }}>
                            {showTrash ? (
                              <div className="flex gap-2">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!loading) {
                                      handleRestoreUser(userItem.id);
                                    }
                                  }}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                                >
                                  {language === 'ar' ? 'استعادة' : language === 'de' ? 'Wiederherstellen' : 'Restore'}
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!loading) {
                                      handleDeleteUser(userItem.id, true);
                                    }
                                  }}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                                >
                                  {language === 'ar' ? 'حذف نهائي' : language === 'de' ? 'Dauerhaft löschen' : 'Delete'}
                                </button>
                              </div>
                            ) : (
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
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!loading) {
                                      handleDeleteUser(userItem.id, false);
                                    }
                                  }}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                                >
                                  {language === 'ar' ? 'حذف' : language === 'de' ? 'Löschen' : 'Delete'}
                                </button>
                              </div>
                            )}
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
        );
      })()}

      {/* Companies Tab */}
      {activeTab === 'companies' && isAdmin && (
        <CompanyManagement language={language} />
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && isAgentManager && user?.company_id && (
        <BranchManagement companyId={user.company_id} language={language} />
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && isAdmin && (
        <RatingManagement language={language} />
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (isAdmin || isAgentManager) && (
        <BookingManagement language={language} companyId={isAgentManager ? user?.company_id : undefined} />
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (isAdmin || isAgentManager) && (
        <InvoiceManagement language={language} companyId={isAgentManager ? user?.company_id : undefined} />
      )}

      {/* Company Bookings Tab */}
      {activeTab === 'company-bookings' && isAgentManager && (
        <CompanyBookings />
      )}

      {/* QR Scanner Tab */}
      {activeTab === 'qr-scanner' && isDriver && (
        <QRScanner />
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'إدارة الصور' : language === 'de' ? 'Fotoverwaltung' : 'Photo Management'}
            </h3>
            <button
              onClick={() => {
                setEditingImage(null);
                setPhotoType('bus');
                setEntityId('');
                setSelectedFile(null);
                setShowPhotoUploadDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              {language === 'ar' ? 'تحميل صورة' : language === 'de' ? 'Foto hochladen' : 'Upload Photo'}
            </button>
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
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '80px' }}>
                      {language === 'ar' ? 'معاينة' : language === 'de' ? 'Vorschau' : 'Preview'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '100px' }}>
                      {language === 'ar' ? 'معرّف الصورة' : language === 'de' ? 'Bild-ID' : 'Image ID'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '200px' }}>
                      {language === 'ar' ? 'اسم الملف' : language === 'de' ? 'Dateiname' : 'File Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '120px' }}>
                      {language === 'ar' ? 'نوع الصورة' : language === 'de' ? 'Foto-Typ' : 'Photo Type'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '100px' }}>
                      {language === 'ar' ? 'معرف الكيان' : language === 'de' ? 'Entitäts-ID' : 'Entity ID'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '180px' }}>
                      {language === 'ar' ? 'تم الرفع بواسطة' : language === 'de' ? 'Hochgeladen von' : 'Uploaded By'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '160px' }}>
                      {language === 'ar' ? 'التاريخ' : language === 'de' ? 'Datum' : 'Date'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider" style={{ width: '150px' }}>
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {images.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                        <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>{language === 'ar' ? 'لا توجد صور' : language === 'de' ? 'Keine Fotos vorhanden' : 'No photos uploaded'}</p>
                      </td>
                    </tr>
                  ) : (
                    images.map((image: any) => (
                      <tr key={image.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">
                          <img 
                            src={image.image_url} 
                            alt={image.file_name}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect fill="%23eee" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-gray-900">{image.id}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(String(image.id));
                                alert(language === 'ar' 
                                  ? `تم نسخ المعرف ${image.id}` 
                                  : language === 'de' 
                                  ? `ID ${image.id} kopiert` 
                                  : `ID ${image.id} copied`);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                              title={language === 'ar' ? 'نسخ المعرف' : language === 'de' ? 'ID kopieren' : 'Copy ID'}
                            >
                              {language === 'ar' ? 'نسخ' : language === 'de' ? 'Kopieren' : 'Copy'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">{image.file_name || 'N/A'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            image.entity_type === 'bus' ? 'bg-blue-100 text-blue-700' : 
                            image.entity_type === 'station' ? 'bg-green-100 text-green-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {image.entity_type === 'bus' ? (language === 'ar' ? 'باص' : language === 'de' ? 'Bus' : 'Bus') : 
                             image.entity_type === 'station' ? (language === 'ar' ? 'محطة' : language === 'de' ? 'Station' : 'Station') : 
                             image.entity_type}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">{image.entity_id}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{image.uploaded_by_name || image.uploaded_by_email || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {image.created_at ? new Date(image.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'de' ? 'de-DE' : 'en-US') : 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditImage(image)}
                              className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              {t.edit}
                            </button>
                            <button 
                              onClick={() => handleDeleteImage(image.id)}
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
      )}

      {/* Photo Upload Dialog */}
      {showPhotoUploadDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPhotoUploadDialog(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center z-10 shadow-lg">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <Upload className="w-6 h-6" />
                {editingImage 
                  ? (language === 'ar' ? 'تحديث الصورة' : language === 'de' ? 'Foto aktualisieren' : 'Update Photo')
                  : t.uploadPhoto
                }
              </h2>
              <button
                onClick={() => {
                  setShowPhotoUploadDialog(false);
                  setEditingImage(null);
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                {editingImage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700">
                      {language === 'ar' ? 'تحديث صورة موجودة. تحديد ملف جديد سيستبدل الصورة الحالية.' : 
                       language === 'de' ? 'Bestehendes Foto aktualisieren. Eine neue Datei auswählen ersetzt das aktuelle Foto.' : 
                       'Updating existing photo. Select a new file to replace the current image.'}
                    </p>
                    <div className="mt-2">
                      <img 
                        src={editingImage.image_url} 
                        alt={editingImage.file_name}
                        className="w-32 h-32 object-cover rounded border border-blue-300"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.photoType}</label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value as 'bus' | 'station')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    disabled={!!editingImage}
                  >
                    <option value="bus">{t.busPhoto}</option>
                    <option value="station">{t.stationPhoto}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'معرف الكيان (معرف الحافلة أو معرف المحطة)' : language === 'de' ? 'Entitäts-ID (Bus-ID oder Stations-ID)' : 'Entity ID (Bus ID or Station ID)'}
                  </label>
                  <input
                    type="number"
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل المعرف' : language === 'de' ? 'ID eingeben' : 'Enter ID'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    disabled={!!editingImage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectFile}
                    {editingImage && <span className="text-xs text-gray-500 ml-2">({language === 'ar' ? 'اختياري' : language === 'de' ? 'optional' : 'optional'})</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                </div>
                {uploadStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                    {t.uploadSuccess}
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {language === 'ar' ? 'فشل التحميل. يرجى المحاولة مرة أخرى.' : language === 'de' ? 'Upload fehlgeschlagen. Bitte versuchen Sie es erneut.' : 'Upload failed. Please try again.'}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4 shadow-lg">
              <button
                onClick={() => {
                  handleImageUpload();
                }}
                disabled={(!selectedFile && !editingImage) || !entityId || uploadStatus === 'success' || loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {editingImage 
                  ? (language === 'ar' ? 'تحديث' : language === 'de' ? 'Aktualisieren' : 'Update')
                  : t.uploadPhoto
                }
              </button>
              <button
                onClick={() => {
                  setShowPhotoUploadDialog(false);
                  setEditingImage(null);
                  setUploadStatus('');
                  setSelectedFile(null);
                  setEntityId('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'photos_old_remove_this' && (
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-gray-900">{t.dataImport}</h2>
            <button
              onClick={() => setShowCSVImportDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              {t.uploadCSV}
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{language === 'ar' ? 'انقر على "تحميل CSV" لاستيراد بيانات جديدة' : language === 'de' ? 'Klicken Sie auf "CSV hochladen", um neue Daten zu importieren' : 'Click "Upload CSV" to import new data'}</p>
          </div>
        </div>
      )}

      {/* CSV Import Dialog */}
      {showCSVImportDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCSVImportDialog(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center z-10 shadow-lg">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <Upload className="w-6 h-6" />
                {t.dataImport}
              </h2>
              <button
                onClick={() => setShowCSVImportDialog(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadCSV}</label>
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
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5" />
                      {t.preview}
                    </button>
                    <button
                      onClick={async () => {
                        await handleCSVImport();
                        setShowCSVImportDialog(false);
                      }}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {t.import}
                    </button>
                  </div>
                )}
                {csvPreview && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      {language === 'ar' ? 'معاينة' : language === 'de' ? 'Vorschau' : 'Preview'} ({csvPreview.totalRows} {language === 'ar' ? 'صفوف' : language === 'de' ? 'Zeilen' : 'rows'})
                    </h3>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {csvPreview.headers?.map((h: string, i: number) => (
                              <th key={i} className="px-2 py-1 text-left border border-gray-300">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.rows?.slice(0, 10).map((row: any[], i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              {row.map((cell: any, j: number) => (
                                <td key={j} className="px-2 py-1 border border-gray-300">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvPreview.totalRows > 10 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {language === 'ar' ? `عرض 10 من ${csvPreview.totalRows} صفوف` : language === 'de' ? `10 von ${csvPreview.totalRows} Zeilen angezeigt` : `Showing 10 of ${csvPreview.totalRows} rows`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4 shadow-lg">
              <button
                onClick={() => {
                  setShowCSVImportDialog(false);
                  setCsvFile(null);
                  setCsvPreview(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'import_old_remove_this' && (
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
                role: 'User',
                company_id: '' as string | number,
                agent_type: ''
              });
              setEditCompanySearchQuery('');
              setShowEditCompanySuggestions(false);
              setEditSelectedCompanyName('');
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

              {/* Company and Agent Type - Only show for Agents */}
              {editProfileData.role === 'Agent' && (
                <>
                  {/* Company Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الشركة المعينة' : language === 'de' ? 'Zugewiesene Firma' : 'Assigned Company'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editCompanySearchQuery}
                        onChange={(e) => {
                          setEditCompanySearchQuery(e.target.value);
                          setShowEditCompanySuggestions(true);
                          if (!e.target.value) {
                            setEditProfileData({ ...editProfileData, company_id: '' });
                            setEditSelectedCompanyName('');
                          }
                        }}
                        onFocus={() => setShowEditCompanySuggestions(true)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'ابحث عن شركة...' : language === 'de' ? 'Firma suchen...' : 'Search for a company...'}
                      />
                      {editSelectedCompanyName && (
                        <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          {editSelectedCompanyName}
                        </div>
                      )}
                      {showEditCompanySuggestions && editCompanySearchQuery && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {companies
                            .filter(c => 
                              c.name.toLowerCase().includes(editCompanySearchQuery.toLowerCase()) ||
                              (c.name_ar && c.name_ar.includes(editCompanySearchQuery))
                            )
                            .slice(0, 10)
                            .map(company => (
                              <div
                                key={company.id}
                                onClick={() => {
                                  setEditProfileData({ ...editProfileData, company_id: company.id });
                                  setEditSelectedCompanyName(language === 'ar' ? (company.name_ar || company.name) : company.name);
                                  setEditCompanySearchQuery('');
                                  setShowEditCompanySuggestions(false);
                                }}
                                className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0"
                              >
                                <div className="font-medium">{language === 'ar' ? (company.name_ar || company.name) : company.name}</div>
                              </div>
                            ))
                          }
                          {companies.filter(c => 
                            c.name.toLowerCase().includes(editCompanySearchQuery.toLowerCase()) ||
                            (c.name_ar && c.name_ar.includes(editCompanySearchQuery))
                          ).length === 0 && (
                            <div className="px-4 py-2 text-gray-500">
                              {language === 'ar' ? 'لم يتم العثور على شركات' : language === 'de' ? 'Keine Firmen gefunden' : 'No companies found'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نوع الوكيل' : language === 'de' ? 'Agent-Typ' : 'Agent Type'}
                    </label>
                    <select
                      value={editProfileData.agent_type}
                      onChange={(e) => setEditProfileData({ ...editProfileData, agent_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">
                        {language === 'ar' ? 'اختر نوع الوكيل' : language === 'de' ? 'Agent-Typ wählen' : 'Select agent type'}
                      </option>
                      {agentTypes.map(type => (
                        <option key={type.id} value={type.code}>
                          {language === 'ar' ? (type.name_ar || type.name) : type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

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
                      role: 'User',
                      company_id: '' as string | number,
                      agent_type: ''
                    });
                    setEditCompanySearchQuery('');
                    setShowEditCompanySuggestions(false);
                    setEditSelectedCompanyName('');
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

      {/* Add User Dialog */}
      {showAddUserDialog && (
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
              setShowAddUserDialog(false);
              setNewUserData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone: '',
                role: 'user',
                company_id: '',
                agent_type: ''
              });
              setUserValidationErrors({});
              setCompanySearchQuery('');
              setSelectedCompanyName('');
              setShowCompanySuggestions(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] flex flex-col"
            style={{ 
              position: 'relative',
              zIndex: 100000,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center z-10 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'إضافة مستخدم جديد' : language === 'de' ? 'Neuen Benutzer hinzufügen' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowAddUserDialog(false);
                  setNewUserData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'user',
                    company_id: '',
                    agent_type: ''
                  });
                  setUserValidationErrors({});
                  setCompanySearchQuery('');
                  setSelectedCompanyName('');
                  setShowCompanySuggestions(false);
                }}
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
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم الأول' : language === 'de' ? 'Vorname' : 'First Name'} *
                  </label>
                  <input
                    type="text"
                    value={newUserData.first_name}
                    onChange={(e) => {
                      setNewUserData({ ...newUserData, first_name: e.target.value });
                      if (userValidationErrors.first_name) {
                        setUserValidationErrors({ ...userValidationErrors, first_name: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      userValidationErrors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={language === 'ar' ? 'أدخل الاسم الأول' : language === 'de' ? 'Vorname eingeben' : 'Enter first name'}
                  />
                  {userValidationErrors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{userValidationErrors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'اسم العائلة' : language === 'de' ? 'Nachname' : 'Last Name'} *
                  </label>
                  <input
                    type="text"
                    value={newUserData.last_name}
                    onChange={(e) => {
                      setNewUserData({ ...newUserData, last_name: e.target.value });
                      if (userValidationErrors.last_name) {
                        setUserValidationErrors({ ...userValidationErrors, last_name: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      userValidationErrors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={language === 'ar' ? 'أدخل اسم العائلة' : language === 'de' ? 'Nachname eingeben' : 'Enter last name'}
                  />
                  {userValidationErrors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{userValidationErrors.last_name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : language === 'de' ? 'E-Mail' : 'Email'} *
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => {
                      setNewUserData({ ...newUserData, email: e.target.value });
                      if (userValidationErrors.email) {
                        setUserValidationErrors({ ...userValidationErrors, email: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      userValidationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : language === 'de' ? 'E-Mail eingeben' : 'Enter email'}
                  />
                  {userValidationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{userValidationErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'كلمة المرور' : language === 'de' ? 'Passwort' : 'Password'} *
                  </label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => {
                      setNewUserData({ ...newUserData, password: e.target.value });
                      if (userValidationErrors.password) {
                        setUserValidationErrors({ ...userValidationErrors, password: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      userValidationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : language === 'de' ? 'Passwort eingeben' : 'Enter password'}
                  />
                  {userValidationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{userValidationErrors.password}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'رقم الهاتف' : language === 'de' ? 'Telefonnummer' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => {
                      setNewUserData({ ...newUserData, phone: e.target.value });
                      if (userValidationErrors.phone) {
                        setUserValidationErrors({ ...userValidationErrors, phone: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      userValidationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : language === 'de' ? 'Telefonnummer eingeben' : 'Enter phone number'}
                  />
                  {userValidationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{userValidationErrors.phone}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الدور' : language === 'de' ? 'Rolle' : 'Role'} *
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value, company_id: '', agent_type: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="user">{language === 'ar' ? 'مستخدم' : language === 'de' ? 'Benutzer' : 'User'}</option>
                    <option value="agent">{language === 'ar' ? 'وكيل' : language === 'de' ? 'Agent' : 'Agent'}</option>
                    {/* Only admins can create other admins */}
                    {isAdmin && (
                      <option value="admin">{language === 'ar' ? 'مدير' : language === 'de' ? 'Administrator' : 'Admin'}</option>
                    )}
                  </select>
                </div>

                {/* Agent-specific fields */}
                {newUserData.role === 'agent' && (
                  <>
                    {/* Company Selection with Search - Only for Admins, Agent Managers auto-assign their company */}
                    {isAdmin ? (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.assignedCompany} *
                        </label>
                        <input
                          type="text"
                          value={selectedCompanyName || companySearchQuery}
                          onChange={(e) => {
                            setCompanySearchQuery(e.target.value);
                            setSelectedCompanyName('');
                            setNewUserData({ ...newUserData, company_id: '' });
                            setShowCompanySuggestions(true);
                          }}
                          onFocus={() => setShowCompanySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                          placeholder={language === 'ar' ? 'ابحث عن شركة...' : language === 'de' ? 'Firma suchen...' : 'Search company...'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      {showCompanySuggestions && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {companies
                            .filter((company: any) => 
                              !companySearchQuery || company.name.toLowerCase().includes(companySearchQuery.toLowerCase())
                            )
                            .slice(0, 10)
                            .map((company: any) => (
                              <div
                                key={company.id}
                                className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  setNewUserData({ ...newUserData, company_id: company.id });
                                  setSelectedCompanyName(company.name);
                                  setCompanySearchQuery('');
                                  setShowCompanySuggestions(false);
                                }}
                              >
                                {company.name}
                              </div>
                            ))
                          }
                          {companies.filter((company: any) => 
                            !companySearchQuery || company.name.toLowerCase().includes(companySearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div className="px-4 py-2 text-gray-500 italic">
                              {language === 'ar' ? 'لا توجد نتائج' : language === 'de' ? 'Keine Ergebnisse' : 'No results'}
                            </div>
                          )}
                        </div>
                      )}
                      {selectedCompanyName && (
                        <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                          ✓ {selectedCompanyName}
                        </div>
                      )}
                      </div>
                    ) : (
                      /* Agent Manager sees their company name (read-only) */
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.assignedCompany}
                        </label>
                        <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                          {user?.company_name || (language === 'ar' ? 'شركتك' : language === 'de' ? 'Ihre Firma' : 'Your company')}
                        </div>
                      </div>
                    )}

                    {/* Agent Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.agentType} *
                      </label>
                      <select
                        value={newUserData.agent_type}
                        onChange={(e) => setNewUserData({ ...newUserData, agent_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{t.selectAgentType}</option>
                        {/* Agent Managers can only create drivers and assistants, not other managers */}
                        {isAdmin && <option value="manager">{t.manager}</option>}
                        <option value="driver">{t.driver}</option>
                        <option value="assistant">{t.driverAssistant}</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddUserDialog(false);
                  setNewUserData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'user',
                    company_id: '',
                    agent_type: ''
                  });
                  setUserValidationErrors({});
                  setCompanySearchQuery('');
                  setSelectedCompanyName('');
                  setShowCompanySuggestions(false);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : language === 'de' ? 'Abbrechen' : 'Cancel'}
              </button>
              <button
                onClick={handleAddUser}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {language === 'ar' ? 'إضافة' : language === 'de' ? 'Hinzufügen' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
