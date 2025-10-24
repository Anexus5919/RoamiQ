// /app/components/GlobeDisplay.jsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe component only on the client-side
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeDisplay({ fromCoords, destinationCoords, fromName, destinationName, distance }) {
  const globeEl = useRef();
  const [globeReady, setGlobeReady] = useState(false);
  // State to store container dimensions for responsiveness
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(); // Ref for the container div

  // Check if we have valid coordinates
  const hasValidCoords = fromCoords && destinationCoords && 
                         fromCoords.lat != null && fromCoords.lon != null &&
                         destinationCoords.lat != null && destinationCoords.lon != null;

  // --- COMPLETE: Data for points and arcs ---
  const pointsData = hasValidCoords ? [
    { ...fromCoords, name: fromName, color: 'cyan', size: 0.5 },
    { ...destinationCoords, name: destinationName, color: 'red', size: 0.5 }
  ] : [];

  const arcsData = hasValidCoords ? [
    {
      startLat: fromCoords.lat,
      startLng: fromCoords.lon,
      endLat: destinationCoords.lat,
      endLng: destinationCoords.lon,
      color: ['cyan', 'red'],
      stroke: 0.3,
      name: `Route: ${distance || 'N/A'}` // Use distance from travelAnalysis
    }
  ] : [];
  // --- END ---

  // --- COMPLETE: Update dimensions effect ---
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []); // Empty dependency array, function doesn't change

  useEffect(() => {
    updateDimensions(); // Set initial dimensions
    const handleResize = () => updateDimensions(); // Define handler
    window.addEventListener('resize', handleResize); // Update on resize
    return () => window.removeEventListener('resize', handleResize); // Cleanup listener
  }, [updateDimensions]);
  // --- END ---

  useEffect(() => {
    // Aim globe focus
    if (globeReady && globeEl.current && arcsData.length > 0) {
      try {
        const arc = arcsData[0];
        const midLat = (arc.startLat + arc.endLat) / 2;
        const midLng = (arc.startLng + arc.endLng) / 2;

        const R = 6371; // Earth radius in km
        const dLon = (arc.endLng - arc.startLng) * Math.PI / 180;
        const dLat = (arc.endLat - arc.startLat) * Math.PI / 180;
        const a = Math.sin(dLat / 2)**2 + Math.cos(arc.startLat * Math.PI / 180) * Math.cos(arc.endLat * Math.PI / 180) * Math.sin(dLon / 2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        // Altitude Calculation (with fix for less zoom)
        const altitude = 1.8 + Math.max(0.2, Math.min(2.5, distanceKm / 10000));

        globeEl.current.pointOfView({ lat: midLat, lng: midLng, altitude: altitude }, 1500); // Animate transition
      } catch (error) { console.error("Error setting globe POV:", error); }
    }
  }, [globeReady, arcsData]);

  // --- COMPLETE: Label style ---
  const labelStyle = {
      padding: '4px 8px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)', // Slightly darker background
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
      whiteSpace: 'nowrap'
  };
  // Convert style object to string once
  const pointLabelStyleString = Object.entries(labelStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';');
  const arcLabelStyleString = Object.entries(labelStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';');
  // --- END ---

  return (
    // Container with fixes for height
    <div ref={containerRef} className="relative w-full h-full rounded-lg overflow-hidden border border-border shadow-lg bg-card">
      {/* Conditionally render Globe */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          width={dimensions.width}
          height={dimensions.height}

          // --- COMPLETE: Markers & Arcs props ---
          pointsData={pointsData}
          pointAltitude="size"
          pointColor="color"
          pointLabel={({ name, lat, lon }) => `<div style="${pointLabelStyleString}">${name}<br/>(${lat?.toFixed(2)}, ${lon?.toFixed(2)})</div>`} // Added optional chaining
          onPointHover={() => globeEl.current && (globeEl.current.controls().autoRotate = false)} // Check ref exists

          arcsData={arcsData}
          arcColor="color"
          arcStroke="stroke"
          arcDashLength={0.6}
          arcDashGap={0.3}
          arcDashAnimateTime={2000}
          arcLabel={({ name }) => `<div style="${arcLabelStyleString}">${name}</div>`}
          // --- END ---

          enablePointerInteraction={true}
          onGlobeReady={() => setGlobeReady(true)}
        />
      )}
    </div>
  );
}