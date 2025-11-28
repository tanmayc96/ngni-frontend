
"use client";

import type { FC } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export interface CustomPolygonProps extends google.maps.PolygonOptions {
  paths: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][] | google.maps.MVCArray<google.maps.LatLngLiteral> | google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLngLiteral>>;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

const PolygonComponent: FC<CustomPolygonProps> = (props) => {
  const map = useMap();
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const onClickRef = useRef(props.onClick);

  useEffect(() => {
    onClickRef.current = props.onClick;
  }, [props.onClick]);

  useEffect(() => {
    if (!map) return;

    // Create the polygon instance
    const newPolygon = new google.maps.Polygon(props);
    newPolygon.setMap(map);
    setPolygon(newPolygon);

    // Cleanup function to remove the polygon when the component unmounts or map changes
    return () => {
      newPolygon.setMap(null);
    };
  }, [map]); // Only re-create if map instance changes, initial props are passed at creation.

  // Update polygon options if props change
  useEffect(() => {
    if (polygon) {
      // Destructure to avoid passing onClick directly to setOptions
      const { onClick, ...options } = props;
      polygon.setOptions(options);
    }
  }, [polygon, props]);

  // Handle click event
  useEffect(() => {
    if (!polygon) return;

    const clickListener = polygon.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (onClickRef.current) {
        onClickRef.current(e);
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [polygon]);

  return null; // This component doesn't render any visible DOM element
};

export default PolygonComponent;
