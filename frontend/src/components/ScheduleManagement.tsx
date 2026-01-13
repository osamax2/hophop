import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Trash2, RotateCcw, MapPin, Star } from 'lucide-react';
import type { Language } from '../App';

interface ScheduleManagementProps {
  language: Language;
  onEditTrip: (tripId: number) => void;
  onAddTrip: () => void;
  onSponsorTrip?: (tripId: number) => void;
  onRemoveSponsor?: (tripId: number) => void;
  refreshTrigger?: number;
}

// Convert numbers to Arabic numerals
const toArabicNumerals = (num: number | string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
};

// City name translations
const getCityName = (cityName: string, language: Language): string => {
  if (language !== 'ar') return cityName;
  
  const cityTranslations: Record<string, string> = {
    'Damascus': 'دمشق',
    'Aleppo': 'حلب',
    'Homs': 'حمص',
    'Latakia': 'اللاذقية',
    'Tartus': 'طرطوس',
    'Hama': 'حماة',
    'Deir ez-Zor': 'دير الزور',
    'Raqqa': 'الرقة',
    'Daraa': 'درعا',
    'Al-Hasakah': 'الحسكة',
    'Qamishli': 'القامشلي',
    'Idlib': 'إدلب',
    'As-Suwayda': 'السويداء',
    'Quneitra': 'القنيطرة',
    'Al-Hajar al-Aswad': 'الحجر الأسود',
    'Douma': 'دوما',
    'Jaramana': 'جرمانا',
    'Al-Qusayr': 'القصير',
    'Manbij': 'منبج',
    'Azaz': 'أعزاز',
    'Al-Bab': 'الباب',
    'Afrin': 'عفرين',
    'Ras al-Ayn': 'رأس العين',
    'Kobani': 'كوباني',
    'Tel Abyad': 'تل أبيض',
  };
  
  return cityTranslations[cityName] || cityName;
};

// Transport type translations
const getTransportTypeName = (code: string, language: Language): string => {
  const translations: Record<string, Record<Language, string>> = {
    'BUS': { en: 'Bus', de: 'Bus', ar: 'باص' },
    'VAN': { en: 'Van', de: 'Van', ar: 'فان' },
    'VIP_VAN': { en: 'VIP Van', de: 'VIP Van', ar: 'فان VIP' },
    'VIP-VAN': { en: 'VIP Van', de: 'VIP Van', ar: 'فان VIP' },
    'SHIP': { en: 'Ship', de: 'Schiff', ar: 'سفينة' },
    'TRAIN': { en: 'Train', de: 'Zug', ar: 'قطار' },
  };
  const normalizedCode = code?.toUpperCase() || '';
  return translations[normalizedCode]?.[language] || code || '';
};

const translations = {
  de: {
    scheduleManagement: 'Fahrplanverwaltung',
    addSchedule: 'Fahrplan hinzufügen',
    from: 'Von',
    to: 'Nach',
    company: 'Gesellschaft',
    type: 'Typ',
    departure: 'Abfahrt',
    arrival: 'Ankunft',
    duration: 'Dauer',
    price: 'Preis',
    seats: 'Sitze',
    status: 'Status',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    showTrash: 'Papierkorb anzeigen',
    hideTrash: 'Papierkorb ausblenden',
    restore: 'Wiederherstellen',
    permanentDelete: 'Dauerhaft löschen',
    inTrash: 'Im Papierkorb',
    viewStops: 'Stopps',
    manageStops: 'Zwischenstopps verwalten',
    addStop: 'Stopp hinzufügen',
    stopOrder: 'Reihenfolge',
    stationName: 'Haltestelle',
    arrivalTime: 'Ankunft',
    departureTime: 'Abfahrt',
    noStops: 'Keine Zwischenstopps vorhanden',
    noTrips: 'Keine Fahrten gefunden',
    noTrash: 'Papierkorb ist leer',
    backToTrips: 'Zurück zu Fahrten',
    scheduled: 'Geplant',
    filterTrips: 'Fahrten filtern',
    filterByDate: 'Nach Datum filtern',
    filterByTime: 'Nach Zeit filtern',
    filterByCity: 'Nach Stadt filtern',
    filterByCompany: 'Nach Gesellschaft filtern',
    fromTime: 'Von',
    toTime: 'Bis',
    selectCity: 'Stadt auswählen',
    selectCompany: 'Gesellschaft auswählen',
    allCities: 'Alle Städte',
    companyName: 'Firmenname',
    clearFilters: 'Filter löschen',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    confirmDelete: 'Fahrt in den Papierkorb verschieben?',
    confirmPermanentDelete: 'Fahrt dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    tripMovedToTrash: 'Fahrt in Papierkorb verschoben',
    tripRestored: 'Fahrt wiederhergestellt',
    tripDeleted: 'Fahrt dauerhaft gelöscht',
    stopAdded: 'Stopp hinzugefügt',
    stopRemoved: 'Stopp entfernt',
    selectStation: 'Haltestelle auswählen',
    close: 'Schließen',
    sponsor: 'Sponsern',
    sponsored: 'Gesponsert',
    removeSponsor: 'Sponsoring entfernen',
  },
  en: {
    scheduleManagement: 'Schedule Management',
    addSchedule: 'Add Schedule',
    from: 'From',
    to: 'To',
    company: 'Company',
    type: 'Type',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    price: 'Price',
    seats: 'Seats',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    showTrash: 'Show Trash',
    hideTrash: 'Hide Trash',
    restore: 'Restore',
    permanentDelete: 'Delete Permanently',
    inTrash: 'In Trash',
    viewStops: 'Stops',
    manageStops: 'Manage Intermediate Stops',
    addStop: 'Add Stop',
    stopOrder: 'Order',
    stationName: 'Station',
    arrivalTime: 'Arrival',
    departureTime: 'Departure',
    noStops: 'No intermediate stops',
    noTrips: 'No trips found',
    noTrash: 'Trash is empty',
    backToTrips: 'Back to Trips',
    scheduled: 'Scheduled',
    filterTrips: 'Filter Trips',
    filterByDate: 'Filter by Date',
    filterByTime: 'Filter by Time',
    filterByCity: 'Filter by City',
    filterByCompany: 'Filter by Company',
    fromTime: 'From',
    toTime: 'To',
    selectCity: 'Select City',
    selectCompany: 'Select Company',
    allCities: 'All Cities',
    companyName: 'Company Name',
    clearFilters: 'Clear Filters',
    completed: 'Completed',
    cancelled: 'Cancelled',
    confirmDelete: 'Move trip to trash?',
    confirmPermanentDelete: 'Permanently delete trip? This action cannot be undone.',
    tripMovedToTrash: 'Trip moved to trash',
    tripRestored: 'Trip restored',
    tripDeleted: 'Trip permanently deleted',
    stopAdded: 'Stop added',
    stopRemoved: 'Stop removed',
    selectStation: 'Select station',
    close: 'Close',
    sponsor: 'Sponsor',
    sponsored: 'Sponsored',
    removeSponsor: 'Remove Sponsor',
  },
  ar: {
    scheduleManagement: 'إدارة الجدول الزمني',
    addSchedule: 'إضافة رحلة',
    from: 'من',
    to: 'إلى',
    company: 'الشركة',
    type: 'النوع',
    departure: 'المغادرة',
    arrival: 'الوصول',
    duration: 'المدة',
    price: 'السعر',
    seats: 'المقاعد',
    status: 'الحالة',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    showTrash: 'عرض سلة المهملات',
    hideTrash: 'إخفاء سلة المهملات',
    restore: 'استعادة',
    permanentDelete: 'حذف نهائي',
    inTrash: 'في سلة المهملات',
    viewStops: 'المحطات',
    manageStops: 'إدارة المحطات المتوسطة',
    addStop: 'إضافة محطة',
    stopOrder: 'الترتيب',
    stationName: 'المحطة',
    arrivalTime: 'الوصول',
    departureTime: 'المغادرة',
    noStops: 'لا توجد محطات متوسطة',
    noTrips: 'لا توجد رحلات',
    noTrash: 'سلة المهملات فارغة',
    backToTrips: 'العودة إلى الرحلات',
    scheduled: 'مجدولة',
    filterTrips: 'تصفية الرحلات',
    filterByDate: 'تصفية حسب التاريخ',
    filterByTime: 'تصفية حسب الوقت',
    filterByCity: 'تصفية حسب المدينة',
    filterByCompany: 'تصفية حسب الشركة',
    fromTime: 'من',
    toTime: 'إلى',
    selectCity: 'اختر المدينة',
    selectCompany: 'اختر الشركة',
    allCities: 'جميع المدن',
    companyName: 'اسم الشركة',
    clearFilters: 'مسح الفلاتر',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    confirmDelete: 'نقل الرحلة إلى سلة المهملات؟',
    confirmPermanentDelete: 'حذف الرحلة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
    tripMovedToTrash: 'تم نقل الرحلة إلى سلة المهملات',
    tripRestored: 'تم استعادة الرحلة',
    tripDeleted: 'تم حذف الرحلة نهائياً',
    stopAdded: 'تم إضافة المحطة',
    stopRemoved: 'تم حذف المحطة',
    selectStation: 'اختر المحطة',
    close: 'إغلاق',
    sponsor: 'رعاية',
    sponsored: 'دعاية',
    removeSponsor: 'إزالة الرعاية',
  },
};

export function ScheduleManagement({ language, onEditTrip, onAddTrip, onSponsorTrip, onRemoveSponsor, refreshTrigger }: ScheduleManagementProps) {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  
  // Filter states
  const [filterTimeFrom, setFilterTimeFrom] = useState<string>('');
  const [filterTimeTo, setFilterTimeTo] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [allCities, setAllCities] = useState<any[]>([]);
  
  // Steps Dialog
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripSteps, setTripSteps] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  
  // Add Stop Form
  const [newStopStation, setNewStopStation] = useState('');
  const [newStopOrder, setNewStopOrder] = useState('');
  const [newStopArrival, setNewStopArrival] = useState('');
  const [newStopDeparture, setNewStopDeparture] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || "";
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Load cities for filter
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cities`, { headers });
        if (response.ok) {
          const data = await response.json();
          setAllCities(data);
        }
      } catch (error) {
        console.error('Failed to load cities:', error);
      }
    };
    loadCities();
  }, []);

  // Load trips on mount and when showTrash or refreshTrigger changes
  useEffect(() => {
    loadTrips();
  }, [showTrash, refreshTrigger]);

  // Clear all filters
  const clearFilters = () => {
    setFilterTimeFrom('');
    setFilterTimeTo('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterCity('');
    setFilterCompany('');
  };

  // Apply filters to trips
  const getFilteredTrips = () => {
    let filtered = trips;

    // Filter by date
    if (filterDateFrom) {
      filtered = filtered.filter((trip: any) => {
        const tripDate = new Date(trip.departure_time).toISOString().split('T')[0];
        return tripDate >= filterDateFrom;
      });
    }
    if (filterDateTo) {
      filtered = filtered.filter((trip: any) => {
        const tripDate = new Date(trip.departure_time).toISOString().split('T')[0];
        return tripDate <= filterDateTo;
      });
    }

    // Filter by time
    if (filterTimeFrom) {
      filtered = filtered.filter((trip: any) => {
        const tripTime = new Date(trip.departure_time).toTimeString().slice(0, 5);
        return tripTime >= filterTimeFrom;
      });
    }
    if (filterTimeTo) {
      filtered = filtered.filter((trip: any) => {
        const tripTime = new Date(trip.departure_time).toTimeString().slice(0, 5);
        return tripTime <= filterTimeTo;
      });
    }

    // Filter by city
    if (filterCity) {
      filtered = filtered.filter((trip: any) => 
        trip.from_city_id === parseInt(filterCity) || trip.to_city_id === parseInt(filterCity)
      );
    }

    // Filter by company
    if (filterCompany) {
      filtered = filtered.filter((trip: any) => 
        trip.company_name?.toLowerCase().includes(filterCompany.toLowerCase())
      );
    }

    return filtered;
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      const url = showTrash 
        ? `${API_BASE}/api/admin/trips?showTrash=true`
        : `${API_BASE}/api/admin/trips?showAll=true`;
      
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Failed to load trips');
      const data = await response.json();
      setTrips(data);
    } catch (err: any) {
      console.error('Error loading trips:', err);
      alert('Failed to load trips: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStations = async () => {
    try {
      console.log('loadStations called, fetching from:', `${API_BASE}/api/stations`);
      const response = await fetch(`${API_BASE}/api/stations`, { headers });
      console.log('loadStations response status:', response.status);
      if (!response.ok) throw new Error('Failed to load stations');
      const data = await response.json();
      console.log('Stations loaded:', data.length, data);
      setStations(data);
    } catch (err: any) {
      console.error('Error loading stations:', err);
    }
  };

  const handleDeleteTrip = async (tripId: number, permanent: boolean = false) => {
    const confirmMsg = permanent ? t.confirmPermanentDelete : t.confirmDelete;
    if (!confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const url = permanent 
        ? `${API_BASE}/api/admin/trips/${tripId}?permanent=true`
        : `${API_BASE}/api/admin/trips/${tripId}`;
      
      const response = await fetch(url, { method: 'DELETE', headers });
      if (!response.ok) throw new Error('Failed to delete trip');
      
      alert(permanent ? t.tripDeleted : t.tripMovedToTrash);
      await loadTrips();
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTrip = async (tripId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}/restore`, {
        method: 'POST',
        headers,
      });
      if (!response.ok) throw new Error('Failed to restore trip');
      
      alert(t.tripRestored);
      await loadTrips();
    } catch (err: any) {
      console.error('Error restoring trip:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSteps = async (trip: any) => {
    try {
      setSelectedTrip(trip);
      setShowStepsDialog(true);
      setLoading(true);
      
      // Load steps and stations in parallel
      const [stepsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/trips/${trip.id}/steps`, { headers }),
        loadStations(),
      ]);
      
      if (!stepsResponse.ok) throw new Error('Failed to load stops');
      const steps = await stepsResponse.json();
      setTripSteps(steps);
    } catch (err: any) {
      console.error('Error loading stops:', err);
      alert('Failed to load stops');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = async () => {
    console.log('handleAddStop called');
    console.log('selectedTrip:', selectedTrip);
    console.log('newStopStation:', newStopStation);
    console.log('newStopOrder:', newStopOrder);
    console.log('stations:', stations);
    
    if (!selectedTrip || !newStopStation || !newStopOrder) {
      alert('Please select station and order');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/trips/${selectedTrip.id}/steps`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: parseInt(newStopStation),
          stop_order: parseInt(newStopOrder),
          arrival_time: newStopArrival || null,
          departure_time: newStopDeparture || null,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add stop');
      
      alert(t.stopAdded);
      setNewStopStation('');
      setNewStopOrder('');
      setNewStopArrival('');
      setNewStopDeparture('');
      await handleViewSteps(selectedTrip);
    } catch (err: any) {
      console.error('Error adding stop:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStop = async (stopId: number) => {
    if (!selectedTrip) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/trips/${selectedTrip.id}/steps/${stopId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) throw new Error('Failed to remove stop');
      
      alert(t.stopRemoved);
      await handleViewSteps(selectedTrip);
    } catch (err: any) {
      console.error('Error removing stop:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const locale = language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US';
    return new Date(dateString).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
    };
    const statusText = status === 'completed' ? t.completed :
                       status === 'cancelled' ? t.cancelled : t.scheduled;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status] || statusColors.scheduled}`}>
        {statusText}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-900">{t.scheduleManagement}</h2>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setShowTrash(!showTrash)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                showTrash 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={showTrash ? { color: '#000000' } : undefined}
            >
              <Trash2 className="w-4 h-4" />
              {showTrash ? t.hideTrash : t.showTrash}
            </button>
            {!showTrash && (
              <button 
                onClick={onAddTrip}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t.addSchedule}
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByDate}</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder={t.from}
                />
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder={t.to}
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <input
                  type="time"
                  value={filterTimeTo}
                  onChange={(e) => setFilterTimeTo(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByCity}</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">{t.allCities}</option>
                {allCities.map((city: any) => (
                  <option key={city.id} value={city.id}>
                    {getCityName(city.name, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.filterByCompany}</label>
              <input
                type="text"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                placeholder={t.companyName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                {t.clearFilters}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
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
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">
                    {language === 'ar' ? 'الصورة' : language === 'de' ? 'Bild' : 'Image'}
                  </th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.from}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.to}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.company}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.type}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.departure}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.arrival}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.duration}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.price}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.seats}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.status}</th>
                  <th className="px-4 py-3 text-xs text-gray-600 uppercase font-medium">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getFilteredTrips().length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center">
                      <div className="text-gray-500 mb-4">
                        {showTrash ? t.noTrash : t.noTrips}
                      </div>
                      {showTrash && (
                        <button
                          onClick={() => setShowTrash(false)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          {t.backToTrips}
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  getFilteredTrips().map((trip: any) => (
                    <tr 
                      key={trip.id} 
                      className={`hover:bg-gray-50 ${
                        trip.deleted_at ? 'bg-red-50' : 
                        !trip.is_active ? 'bg-gray-50 opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {language === 'ar' ? toArabicNumerals(trip.id) : trip.id}
                      </td>
                      <td className="px-4 py-3">
                        {trip.image_url ? (
                          <img
                            src={trip.image_url.startsWith('http') ? trip.image_url : `${import.meta.env.VITE_API_BASE || ''}${trip.image_url}`}
                            alt={`Trip ${trip.id}`}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {getCityName(trip.from_city || 'N/A', language)}
                        {trip.deleted_at && (
                          <span className="ml-2 text-xs text-red-600 font-medium">({t.inTrash})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {getCityName(trip.to_city || 'N/A', language)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{trip.company_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {trip.transport_type_code ? getTransportTypeName(trip.transport_type_code, language) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{formatTime(trip.departure_time)}</td>
                      <td className="px-4 py-3 text-gray-900">{formatTime(trip.arrival_time)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {trip.duration_minutes ? (language === 'ar' ? `${toArabicNumerals(trip.duration_minutes)}دقيقة` : `${trip.duration_minutes}m`) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {trip.price ? (language === 'ar' ? `${toArabicNumerals(Number(trip.price).toLocaleString())} ليرة` : `${Number(trip.price).toLocaleString()} SYP`) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className={trip.seats_available < 5 ? 'text-red-600 font-medium' : ''}>
                          {language === 'ar' ? `${toArabicNumerals(trip.seats_available)}/${toArabicNumerals(trip.seats_total)}` : `${trip.seats_available}/${trip.seats_total}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(trip.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {trip.deleted_at ? (
                            <>
                              <button 
                                onClick={() => handleRestoreTrip(trip.id)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                                disabled={loading}
                              >
                                <RotateCcw className="w-3 h-3" />
                                {t.restore}
                              </button>
                              <button 
                                onClick={() => handleDeleteTrip(trip.id, true)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                disabled={loading}
                              >
                                {t.permanentDelete}
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => onEditTrip(trip.id)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                disabled={loading}
                              >
                                {t.edit}
                              </button>
                              <button 
                                onClick={() => handleViewSteps(trip)}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1"
                                disabled={loading}
                              >
                                <MapPin className="w-3 h-3" />
                                {t.viewStops}
                              </button>
                              {trip.is_sponsored && trip.sponsored_until && new Date(trip.sponsored_until) > new Date() ? (
                                <button 
                                  onClick={() => onRemoveSponsor?.(trip.id)}
                                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center gap-1"
                                  disabled={loading}
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  {t.removeSponsor}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => onSponsorTrip?.(trip.id)}
                                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center gap-1"
                                  disabled={loading}
                                >
                                  <Star className="w-3 h-3" />
                                  {t.sponsor}
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteTrip(trip.id, false)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                disabled={loading}
                              >
                                {t.delete}
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

      {/* Steps Dialog - Using Portal-like fixed positioning */}
      {showStepsDialog && selectedTrip && (
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
              setShowStepsDialog(false);
              setSelectedTrip(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            style={{ 
              position: 'relative',
              zIndex: 100000,
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-black p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{t.manageStops}</h2>
                <p className="text-purple-200 text-sm mt-1">
                  {selectedTrip.from_city} → {selectedTrip.to_city}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStepsDialog(false);
                  setSelectedTrip(null);
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Current Stops */}
              {tripSteps.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>{t.noStops}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Current Stops ({tripSteps.length})</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600 uppercase">{t.stopOrder}</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600 uppercase">{t.stationName}</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600 uppercase">{t.arrivalTime}</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600 uppercase">{t.departureTime}</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600 uppercase">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tripSteps.map((step: any) => (
                          <tr key={step.id} className="hover:bg-white">
                            <td className="px-4 py-3 font-medium">{step.stop_order}</td>
                            <td className="px-4 py-3">
                              {step.station_name}
                              {step.city_name && (
                                <span className="text-gray-500 ml-1">({step.city_name})</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{step.arrival_time || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{step.departure_time || '—'}</td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => handleRemoveStop(step.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                disabled={loading}
                              >
                                {t.delete}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add New Stop Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">{t.addStop}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.stationName}</label>
                    <select
                      value={newStopStation}
                      onChange={(e) => setNewStopStation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">{t.selectStation}</option>
                      {stations.map((station: any) => (
                        <option key={station.id} value={station.id}>
                          {station.name} {station.city_name && `(${station.city_name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.stopOrder}</label>
                    <input
                      type="number"
                      value={newStopOrder}
                      onChange={(e) => setNewStopOrder(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.arrivalTime}</label>
                    <input
                      type="time"
                      value={newStopArrival}
                      onChange={(e) => setNewStopArrival(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.departureTime}</label>
                    <input
                      type="time"
                      value={newStopDeparture}
                      onChange={(e) => setNewStopDeparture(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Add Stop button clicked!');
                    console.log('Current state - newStopStation:', newStopStation, 'newStopOrder:', newStopOrder, 'loading:', loading);
                    handleAddStop();
                  }}
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {t.addStop}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowStepsDialog(false);
                  setSelectedTrip(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
