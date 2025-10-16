import React, { useEffect, useRef } from 'react';
import { Listing } from '../types';

// Declare Leaflet in the global scope to avoid TypeScript errors
declare const L: any;

interface MapViewProps {
  listings: Listing[];
}

interface PointOfInterest {
    name: string;
    type: 'University' | 'Transport' | 'Shopping' | 'Police';
    coords: [number, number];
}

const pointsOfInterest: PointOfInterest[] = [
    { name: 'University of Johannesburg', type: 'University', coords: [-26.1823, 27.999] },
    { name: 'Wits University', type: 'University', coords: [-26.192, 28.03] },
    { name: 'Rea Vaya Bus Stop', type: 'Transport', coords: [-26.185, 28.005] },
    { name: 'Gautrain Park Station', type: 'Transport', coords: [-26.197, 28.041] },
    { name: 'Campus Square', type: 'Shopping', coords: [-26.186, 27.998] },
    { name: 'Brixton Police Station', type: 'Police', coords: [-26.189, 28.002] },
];

const getIcon = (type: PointOfInterest['type']) => {
    const icons = {
        University: 'graduation-cap',
        Transport: 'bus',
        Shopping: 'shopping-cart',
        Police: 'shield',
    };
    const colors = {
        University: '#8B5CF6', // Purple
        Transport: '#F59E0B', // Amber
        Shopping: '#10B981', // Emerald
        Police: '#3B82F6', // Blue
    }
    const iconHtml = `<div style="background-color: ${colors[type]};" class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg">
        <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
    </div>`;
    
    return L.divIcon({
        html: iconHtml,
        className: 'custom-poi-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

const MapView: React.FC<MapViewProps> = ({ listings }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // To hold the Leaflet map instance

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) { // Initialize map only once
      const map = L.map(mapRef.current).setView([-26.19, 28.02], 13); // Centered on Johannesburg
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add listings to map
      listings.forEach(listing => {
        L.marker([listing.gpsCoordinates.lat, listing.gpsCoordinates.lng])
          .addTo(map)
          .bindPopup(`
            <div class="popup-title">${listing.title}</div>
            <div class="text-sm text-gray-600 mb-1">${listing.location}</div>
            <div class="popup-price">R${listing.price} / month</div>
          `);
      });

      // Add points of interest
      pointsOfInterest.forEach(poi => {
          L.marker(poi.coords, { icon: getIcon(poi.type) })
            .addTo(map)
            .bindPopup(`<b>${poi.name}</b><br>${poi.type}`);
      });
      
      // We need to call createIcons here because the icons are created dynamically
      if (window.lucide) {
          window.lucide.createIcons();
      }
    }
     // Cleanup function to remove the map instance when the component unmounts
    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  }, [listings]); // Rerun effect if listings change

  return <div ref={mapRef} style={{ height: '600px', borderRadius: '8px' }} className="shadow-lg" />;
};

export default MapView;