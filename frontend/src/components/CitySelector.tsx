import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown } from 'lucide-react';
import { citiesApi } from '../lib/api';

interface City {
  id: number;
  name: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

interface CitySelectorProps {
  value: string;
  onChange: (cityName: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CitySelector({
  value,
  onChange,
  placeholder = 'Select city',
  label,
  required = false,
  className = '',
}: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load all cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        console.log('Loading cities from API...');
        const data = await citiesApi.getAll({ limit: 1000 });
        console.log('Cities loaded:', data.length, 'cities');
        if (data && Array.isArray(data) && data.length > 0) {
          setCities(data);
          setFilteredCities(data);
        } else {
          console.warn('No cities returned from API');
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        // Show error message to user
        alert('فشل تحميل المدن. تأكد من أن الخادم يعمل وأن المدن موجودة في قاعدة البيانات.');
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCities(cities);
      return;
    }

    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm, cities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (city: City) => {
    onChange(city.name);
    setSearchTerm('');
    setIsOpen(false);
  };

  const selectedCity = cities.find(c => c.name === value);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-gray-700 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>{label}</span>
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white text-left flex items-center justify-between ${
            !value ? 'text-gray-400' : ''
          }`}
          required={required}
        >
          <span className="truncate">
            {selectedCity ? selectedCity.name : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-80 overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Cities list */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading cities...</div>
              ) : filteredCities.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No cities found' : 'No cities available'}
                </div>
              ) : (
                <div className="py-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`w-full px-4 py-2 text-left hover:bg-green-50 transition-colors ${
                        value === city.name ? 'bg-green-100 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{city.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
