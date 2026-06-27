"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

type PropertyMapInnerProps = {
  coordinates: [number, number];
  label: string;
};

const markerIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;height:18px;width:18px;border-radius:9999px;background:#D85A30;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function PropertyMapInner({ coordinates, label }: PropertyMapInnerProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={coordinates}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full rounded-2xl"
      aria-label={`Map showing ${label}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coordinates} icon={markerIcon} />
    </MapContainer>
  );
}
