
"use client";

import type { ROIReport, ROIRegion } from "@/types/roi";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import React, { useEffect, useRef } from "react";
import PolygonComponent from './polygon';

interface MapViewProps {
  data: ROIReport;
  onRegionClick: (region: ROIRegion) => void;
  selectedRegionId?: string | null;
}

const mapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

export function MapView({ data, onRegionClick, selectedRegionId }: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && data) {
      mapRef.current.setCenter(data.mapCenter);
      mapRef.current.setZoom(data.mapZoom);
    }
  }, [data]);

  const getRegionFillColor = (roi: number): string => {
    if (roi >= 40) return "hsl(140, 60%, 40%)"; // Green
    if (roi >= 20) return "hsl(45, 90%, 50%)"; // Orange
    if (roi >= 0) return "hsl(25, 85%, 55%)"; // Red-Orange
    return "hsl(0, 80%, 50%)"; // Red for negative ROI
  };

  const selectedStrokeColor = "hsl(var(--primary))"; 

  return (
    <Map
      ref={mapRef}
      defaultCenter={data.mapCenter}
      defaultZoom={data.mapZoom}
      gestureHandling="greedy"
      disableDefaultUI={true}
      mapId="roiVisionMap"
      styles={mapStyle}
      className="w-full h-full"
      streetViewControl={false}
      fullscreenControl={false}
      mapTypeControl={false}
      zoomControl={true}
      key={data.city} 
    >
      {data.regions.map((region) => {
        const isSelected = region.id === selectedRegionId;
        if (!region.polygonCoordinates || region.polygonCoordinates.length === 0) {
          console.warn(`Region ${region.name} is missing polygonCoordinates.`);
          return null; 
        }
        
        const fillColor = getRegionFillColor(region.roiPercentage);
        const strokeColor = isSelected ? selectedStrokeColor : fillColor;

        return (
          <React.Fragment key={region.id}>
            <PolygonComponent
              paths={region.polygonCoordinates}
              onClick={() => onRegionClick(region)}
              strokeColor={strokeColor}
              strokeOpacity={1}
              strokeWeight={isSelected ? 4 : 1.5}
              fillColor={fillColor}
              fillOpacity={isSelected ? 0.6 : 0.4}
              clickable={true}
              zIndex={isSelected ? 10 : 0}
            />
            <AdvancedMarker position={region.coordinates}>
              <div 
                onClick={() => onRegionClick(region)}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur-sm border transition-all ${
                  isSelected 
                  ? 'bg-primary text-primary-foreground border-primary-foreground/50 scale-110'
                  : 'bg-background/80 text-foreground border-border'
                }`}
              >
                {region.roiPercentage.toFixed(1)}%
              </div>
            </AdvancedMarker>
          </React.Fragment>
        );
      })}
    </Map>
  );
}
