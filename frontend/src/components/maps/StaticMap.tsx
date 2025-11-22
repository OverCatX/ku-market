"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  ZoomControl,
  Popup,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type StaticMapProps = {
  position: { lat: number; lng: number };
  locationName?: string;
  height?: string;
};


const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

function RecenterOnPosition({ target }: { target: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    const [lat, lng] = Array.isArray(target)
      ? target
      : [target.lat, target.lng];
    const next: LatLngExpression = [lat, lng];
    const current = map.getCenter();
    const distance = map.distance(current, next);
    if (distance < 1) return;
    const zoom = Math.max(map.getZoom(), 16);
    map.flyTo(next, zoom, { duration: 0.6 });
  }, [target, map]);
  return null;
}

export default function StaticMap({
  position,
  locationName,
  height = "200px",
}: StaticMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = pinIcon;
  }, []);

  const normalizedPosition = useMemo(() => {
    return [position.lat, position.lng] as LatLngExpression;
  }, [position.lat, position.lng]);

  return (
    <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={normalizedPosition}
        zoom={16}
        minZoom={14}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        attributionControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <RecenterOnPosition target={normalizedPosition} />
        <Marker position={normalizedPosition} icon={pinIcon}>
          {locationName && (
            <Popup>
              <div className="text-sm font-medium">{locationName}</div>
              <div className="text-xs text-gray-500 mt-1">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}

