import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { citiesApi } from '../lib/api';

// Arabic to English city name mapping for Syrian cities
const arabicToEnglishCity: Record<string, string> = {
  'دمشق': 'Damascus',
  'حلب': 'Aleppo',
  'حمص': 'Homs',
  'حماة': 'Hama',
  'اللاذقية': 'Latakia',
  'طرطوس': 'Tartus',
  'دير الزور': 'Deir ez-Zor',
  'الرقة': 'Raqqa',
  'الحسكة': 'Hasakah',
  'القامشلي': 'Qamishli',
  'إدلب': 'Idlib',
  'درعا': 'Daraa',
  'السويداء': 'As-Suwayda',
  'القنيطرة': 'Quneitra',
  'تدمر': 'Palmyra',
  'الباب': 'Al-Bab',
  'منبج': 'Manbij',
  'عفرين': 'Afrin',
  'كوباني': 'Kobani',
  'البوكمال': 'Al-Bukamal',
  'الميادين': 'Al-Mayadin',
  'سلمية': 'Salamiyah',
  'جبلة': 'Jableh',
  'بانياس': 'Baniyas',
  'صافيتا': 'Safita',
  'مصياف': 'Masyaf',
  'القصير': 'Al-Qusayr',
  'دوما': 'Douma',
  'حرستا': 'Harasta',
  'التل': 'Al-Tall',
  'النبك': 'Al-Nabek',
  'قطنا': 'Qatana',
  'داريا': 'Darayya',
  'الحجر الأسود': 'Al-Hajar al-Aswad',
  'سحنايا': 'Sahnaya',
  'كفربطنا': 'Kafr Batna',
  'جرمانا': 'Jaramana',
  'ريف دمشق': 'Rif Dimashq',
  'التنف': 'Al-Tanam',
};

// English to Arabic city name mapping (reverse mapping for display)
const englishToArabicCity: Record<string, string> = Object.fromEntries(
  Object.entries(arabicToEnglishCity).map(([ar, en]) => [en, ar])
);

// Helper function to get English city name from Arabic or return as-is
const getEnglishCityName = (input: string): string => {
  return arabicToEnglishCity[input] || input;
};

// Helper function to check if input matches city (Arabic or English)
const cityMatchesInput = (cityName: string, input: string): boolean => {
  const inputLower = input.toLowerCase();
  const cityLower = cityName.toLowerCase();
  
  // Direct match with English name
  if (cityLower.startsWith(inputLower)) {
    return true;
  }
  
  // Check if input is Arabic and matches this city
  const englishFromArabic = arabicToEnglishCity[input];
  if (englishFromArabic && englishFromArabic.toLowerCase() === cityLower) {
    return true;
  }
  
  // Check partial Arabic match
  for (const [arabic, english] of Object.entries(arabicToEnglishCity)) {
    if (arabic.startsWith(input) && english.toLowerCase() === cityLower) {
      return true;
    }
  }
  
  return false;
};

interface City {
  id: number;
  name: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

interface CitySelectorProps {
  value: string;
  onChange: (cityName: string, cityId?: number) => void;
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

  // Filter cities based on input value - show suggestions only when typing
  useEffect(() => {
    if (!inputValue.trim()) {
      // Don't show cities when field is empty
      setFilteredCities([]);
      setIsOpen(false);
      return;
    }

    // Filter cities that match the input value (English or Arabic)
    const filtered = cities.filter(city =>
      cityMatchesInput(city.name, inputValue)
    ).slice(0, 50); // Show up to 50 cities that match
    
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
    
    // Convert Arabic to English if needed
    const englishCityName = getEnglishCityName(newValue);
    
    // Find the city to get its ID (check both Arabic input and English name)
    const matchedCity = cities.find(c => 
      c.name.toLowerCase() === newValue.toLowerCase() ||
      c.name.toLowerCase() === englishCityName.toLowerCase()
    );
    
    onChange(matchedCity?.name || newValue, matchedCity?.id);
    // Keep dropdown open when typing to show filtered results
    if (newValue.trim() && cities.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSelect = (city: City) => {
    setInputValue(city.name);
    onChange(city.name, city.id);
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
              // Only open dropdown if there's text and filtered cities
              if (inputValue.trim() && filteredCities.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={`w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
              !inputValue ? 'text-gray-400' : ''
            }`}
            style={{ paddingLeft: '1rem', paddingRight: '1.5rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
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
                    {inputValue.trim() ? (
                      <>
                        <span className="font-medium">{inputValue}</span>
                        <span>{city.name.substring(inputValue.length)}</span>
                      </>
                    ) : (
                      <span>{city.name}</span>
                    )}
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
