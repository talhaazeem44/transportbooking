"use client";
import React from 'react';

interface MapProps {
  address?: string;
  height?: string;
}

export default function Map({ address = "Toronto, ON, Canada", height = "400px" }: MapProps) {
  // Google Maps embed URL - you can replace with your actual location
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${encodeURIComponent(address)}`;
  
  // Fallback to a simple iframe embed (works without API key for basic display)
  const fallbackUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div style={{ width: '100%', height, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
        <iframe
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
      ) : (
        <iframe
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={fallbackUrl}
        />
      )}
    </div>
  );
}
