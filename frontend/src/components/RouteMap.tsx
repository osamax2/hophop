import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  fromCity: string;
  toCity: string;
  stops?: Array<{
    station_name: string;
    latitude?: number;
    longitude?: number;
  }>;
  departureStation?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  arrivalStation?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

// Simplified coordinates for major Syrian cities
const CITY_COORDINATES: Record<string, [number, number]> = {
  'Damascus': [33.5138, 36.2765],
  'Aleppo': [36.2021, 37.1343],
  'Homs': [34.7298, 36.7184],
  'Hama': [35.1355, 36.7502],
  'Latakia': [35.5309, 35.7925],
  'Tartus': [34.8899, 35.8869],
  'Daraa': [32.6184, 36.1012],
  'Deir ez-Zor': [35.3363, 40.1429],
  'Al-Hasakah': [36.5019, 40.7478],
  'Ar-Raqqah': [35.9503, 39.0088],
  'Idlib': [35.9268, 36.6331],
  'As-Suwayda': [32.7096, 36.5699],
  'Quneitra': [33.1264, 35.8239],
  
  // Arabic names
  'دمشق': [33.5138, 36.2765],
  'حلب': [36.2021, 37.1343],
  'حمص': [34.7298, 36.7184],
  'حماة': [35.1355, 36.7502],
  'اللاذقية': [35.5309, 35.7925],
  'طرطوس': [34.8899, 35.8869],
  'درعا': [32.6184, 36.1012],
  'دير الزور': [35.3363, 40.1429],
  'الحسكة': [36.5019, 40.7478],
  'الرقة': [35.9503, 39.0088],
  'إدلب': [35.9268, 36.6331],
  'السويداء': [32.7096, 36.5699],
  'القنيطرة': [33.1264, 35.8239],
};

const getCityCoordinates = (cityName: string): [number, number] | null => {
  // Try exact match first
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }
  
  // Try case-insensitive match
  const lowerCity = cityName.toLowerCase();
  for (const [key, value] of Object.entries(CITY_COORDINATES)) {
    if (key.toLowerCase() === lowerCity) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(CITY_COORDINATES)) {
    if (key.toLowerCase().includes(lowerCity) || lowerCity.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};

export function RouteMap({ fromCity, toCity, stops, departureStation, arrivalStation }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) {
      return;
    }

    console.log('RouteMap rendering for:', fromCity, '->', toCity);

    // Get coordinates
    const fromCoords = departureStation?.latitude && departureStation?.longitude
      ? [departureStation.latitude, departureStation.longitude] as [number, number]
      : getCityCoordinates(fromCity);
    
    const toCoords = arrivalStation?.latitude && arrivalStation?.longitude
      ? [arrivalStation.latitude, arrivalStation.longitude] as [number, number]
      : getCityCoordinates(toCity);

    console.log('From coords:', fromCoords, 'To coords:', toCoords);

    if (!fromCoords || !toCoords) {
      console.warn('Could not find coordinates for cities:', fromCity, toCity);
      // Show Syria map as fallback
      const syriaCenter: [number, number] = [34.8021, 38.9968]; // Center of Syria
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current).setView(syriaCenter, 6);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      return;
    }

    // Initialize map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView(fromCoords, 8);
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    const startMarker = L.marker(fromCoords, {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #16a34a; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(map);
    startMarker.bindPopup(`<b>${departureStation?.name || fromCity}</b><br/>Departure`);

    const endMarker = L.marker(toCoords, {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #dc2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(map);
    endMarker.bindPopup(`<b>${arrivalStation?.name || toCity}</b><br/>Arrival`);

    // Add intermediate stops if available
    const stopCoords: [number, number][] = [];
    if (stops && stops.length > 0) {
      stops.forEach((stop) => {
        if (stop.latitude && stop.longitude) {
          const coords: [number, number] = [stop.latitude, stop.longitude];
          stopCoords.push(coords);
          
          const stopMarker = L.marker(coords, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
          }).addTo(map);
          stopMarker.bindPopup(`<b>${stop.station_name}</b><br/>Stop`);
        }
      });
    }

    // Build waypoints for routing (start -> stops -> end)
    const waypoints: [number, number][] = [fromCoords, ...stopCoords, toCoords];

    // Fetch route from OSRM and draw it
    const fetchAndDrawRoute = async () => {
      try {
        // Build OSRM URL with all waypoints
        const coordinates = waypoints.map(coord => `${coord[1]},${coord[0]}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
        
        const response = await fetch(osrmUrl);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const route = data.routes[0];
          const routeCoordinates = route.geometry.coordinates.map((coord: number[]) => 
            [coord[1], coord[0]] as [number, number]
          );
          
          // Draw the actual road route
          L.polyline(routeCoordinates, {
            color: '#16a34a',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
          }).addTo(map);
          
          console.log('Route drawn successfully, distance:', (route.distance / 1000).toFixed(1), 'km');
        } else {
          console.warn('OSRM routing failed, drawing straight line');
          // Fallback to straight line
          L.polyline(waypoints, {
            color: '#16a34a',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
          }).addTo(map);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to straight line
        L.polyline(waypoints, {
          color: '#16a34a',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(map);
      }
    };

    fetchAndDrawRoute();

    // Fit map to show all markers
    const bounds = L.latLngBounds(waypoints);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isReady, fromCity, toCity, stops, departureStation, arrivalStation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ minHeight: '384px', zIndex: 0 }}
    />
  );
}
