"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";

type MeetupLeafletMapProps = {
  position: LatLngExpression | null;
  onPositionChange: (value: { lat: number; lng: number } | null) => void;
};

const campusBounds = {
  minLat: 13.829,
  maxLat: 13.873,
  minLng: 100.552,
  maxLng: 100.607,
};

const CAMPUS_CENTER: LatLngExpression = [13.8495, 100.571];

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

function isInsideCampus(lat: number, lng: number): boolean {
  return (
    lat >= campusBounds.minLat &&
    lat <= campusBounds.maxLat &&
    lng >= campusBounds.minLng &&
    lng <= campusBounds.maxLng
  );
}

function ClickHandler({
  onPositionChange,
}: {
  onPositionChange: (value: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      if (!isInsideCampus(lat, lng)) {
        toast.error(
          "Please choose a meetup point within Kasetsart University campus."
        );
        return;
      }
      onPositionChange({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      });
    },
  });
  return null;
}

export default function MeetupLeafletMap({
  position,
  onPositionChange,
}: MeetupLeafletMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = pinIcon;
  }, []);

  const normalizedPosition = useMemo(() => {
    if (!position) return null;
    const [lat, lng] = Array.isArray(position)
      ? position
      : [position.lat, position.lng];
    return [Number(lat), Number(lng)] as LatLngExpression;
  }, [position]);

  function RecenterOnPosition({ target }: { target: LatLngExpression | null }) {
    const map = useMap();
    useEffect(() => {
      if (!target) return;
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

  return (
    <MapContainer
      center={normalizedPosition ?? CAMPUS_CENTER}
      zoom={17}
      minZoom={14}
      maxZoom={18}
      style={{ height: "100%", width: "100%", borderRadius: "1.25rem" }}
      scrollWheelZoom
      zoomControl={false}
      attributionControl
    >
      <ZoomControl position="topright" />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RecenterOnPosition target={normalizedPosition} />
      <ClickHandler onPositionChange={onPositionChange} />
      {normalizedPosition && (
        <Marker position={normalizedPosition} icon={pinIcon} />
      )}
    </MapContainer>
  );
}
