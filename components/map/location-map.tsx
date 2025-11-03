'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: string;
    markers?: Array<{
        lat: number;
        lng: number;
        popup?: string;
        icon?: 'default' | 'red' | 'blue' | 'green';
    }>;
    onMapClick?: (lat: number, lng: number) => void;
}

export function LocationMap({
    latitude,
    longitude,
    zoom = 13,
    height = '400px',
    markers = [],
    onMapClick
}: LocationMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], zoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        // Add main marker
        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup('Your Location')
            .openPopup();

        // Add additional markers
        markers.forEach((marker) => {
            const markerInstance = L.marker([marker.lat, marker.lng]);

            // Customize icon based on type
            if (marker.icon === 'red') {
                const redIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                markerInstance.setIcon(redIcon);
            } else if (marker.icon === 'blue') {
                const blueIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                markerInstance.setIcon(blueIcon);
            } else if (marker.icon === 'green') {
                const greenIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                markerInstance.setIcon(greenIcon);
            }

            markerInstance.addTo(map);

            if (marker.popup) {
                markerInstance.bindPopup(marker.popup);
            }
        });

        // Handle map clicks
        if (onMapClick) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                onMapClick(e.latlng.lat, e.latlng.lng);
            });
        }

        mapRef.current = map;

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map center when coordinates change
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], zoom);
        }
    }, [latitude, longitude, zoom]);

    return (
        <div
            ref={mapContainerRef}
            style={{ height, width: '100%', borderRadius: '8px' }}
            className="z-0"
        />
    );
}
