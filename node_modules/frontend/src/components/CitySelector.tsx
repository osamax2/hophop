import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
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
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        } else {
          console.warn('No cities returned from API');
        }
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter cities based on input value - show suggestions immediately
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredCities([]);
      setIsOpen(false);
      return;
    }

    const filtered = cities.filter(city =>
      city.name.toLowerCase().startsWith(inputValue.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
    
    setFilteredCities(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, cities]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelect = (city: City) => {
    setInputValue(city.name);
    onChange(city.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredCities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
          handleSelect(filteredCities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-gray-700 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>{label}</span>
        </label>
      )}
      
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (filteredCities.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={`w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
              !inputValue ? 'text-gray-400' : ''
            }`}
            style={{ paddingLeft: '1rem', paddingRight: '1.5rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
            required={required}
          />
        </div>

        {/* Autocomplete suggestions dropdown */}
        {isOpen && filteredCities.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-80 overflow-hidden">
            <div className="overflow-y-auto max-h-80">
              {filteredCities.map((city, index) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-2 ${
                    index === selectedIndex ? 'bg-green-100' : ''
                  } ${
                    value === city.name ? 'bg-green-50 font-medium' : ''
                  }`}
                >
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900">
                    <span className="font-medium">{inputValue}</span>
                    <span>{city.name.substring(inputValue.length)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
