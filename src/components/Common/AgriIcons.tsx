import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const RicePaddyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Stalk */}
    <path d="M7 21c2-5 3-10 3-17" />
    <path d="M10 4c2 2 3 5 2 9" />
    {/* Rice Grains Left */}
    <path d="M8 8c-2-1-3-3-2-4 1 0 3 2 3 3" />
    <path d="M9 12c-2.5-1-3.5-3-2.5-4 1 0 3.5 2 3.5 3" />
    <path d="M10 16c-2.5-1-3.5-3-2.5-4 1 0 3.5 2 3.5 3" />
    {/* Rice Grains Right */}
    <path d="M11 6c2-1 3-3 2-4-1 0-3 2-3 3" />
    <path d="M11 10c2.5-1 3.5-3 2.5-4-1 0-3.5 2-3.5 3" />
    <path d="M11 14c2.5-1 3.5-3 2.5-4-1 0-3.5 2-3.5 3" />
    {/* Field Water Ripple */}
    <path d="M3 21c3-1 6-1 9 0 3 1 6 1 9 0" />
  </svg>
);

export const CassavaTuberIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Main tapered tuber root */}
    <path d="M4 17c3-3 8-7 16-11-2 4-6 9-11 13-2 1-4 0-5-2z" />
    {/* Secondary root */}
    <path d="M8 14c1 3 3 5 6 6-2-2-3-4-3-6" />
    {/* Stem top */}
    <path d="M18 4l2-2m-2 2l2 1" />
    {/* Skin segments */}
    <path d="M9 12l2 2m3-4l2 2" strokeDasharray="1 2" />
  </svg>
);

export const CocoaPodIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Tree twig */}
    <path d="M12 2v3m-2-1h4" />
    {/* Pod Body - elliptical with pointed tip */}
    <path d="M12 5c-5 2-7 7-6 11 1 3 4 5 6 6 2-1 5-3 6-6 1-4-1-9-6-11z" />
    {/* Longitudinal ridges of cocoa pod */}
    <path d="M12 5v17" />
    <path d="M9 7c-2 2-3 5-2 8 1 2 2 3 3 4" />
    <path d="M15 7c2 2 3 5 2 8-1 2-2 3-3 4" />
  </svg>
);

export const OilPalmIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Trunk */}
    <path d="M12 11v11" />
    <path d="M10 16l4-2m-4 4l4-2" />
    {/* Fronds radiating out */}
    <path d="M12 11c-3-3-7-4-10-3 3 2 6 4 8 7" />
    <path d="M12 11c3-3 7-4 10-3-3 2-6 4-8 7" />
    <path d="M12 11c-2-5-4-8-7-9 1 3 3 7 5 9" />
    <path d="M12 11c2-5 4-8 7-9-1 3-3 7-5 9" />
    {/* Fresh Fruit Bunch center */}
    <circle cx="12" cy="11" r="2.5" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const AgroMillIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Factory base & sawtooth roof */}
    <path d="M2 21h20M4 21V10l5 4V10l5 4V7l6 4v10" />
    {/* Silo column */}
    <path d="M18 7a2 2 0 0 0-2-2h-1v16h3V7z" />
    {/* Output chute */}
    <path d="M9 18h2v3H9z" />
  </svg>
);

export const SolarIrrigationIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Solar panel */}
    <path d="M3 13l3-7h12l3 7H3z" />
    <path d="M7 6v7m5-7v7m5-7v7M4 9.5h16" />
    {/* Stand */}
    <path d="M12 13v6m-4 2h8" />
    {/* Water drop sprinkler */}
    <path d="M19 18c0 1.5-1 3-2 3s-2-1.5-2-3c0-1.5 2-4 2-4s2 2.5 2 4z" />
  </svg>
);

export const GrainSiloIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Dome top */}
    <path d="M7 8a5 5 0 0 1 10 0v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8z" />
    {/* Corrugated ribs */}
    <path d="M7 11h10M7 14h10M7 17h10" />
    {/* Ladder */}
    <path d="M18 9v12M17 12h2M17 15h2M17 18h2" />
  </svg>
);

export const QualityBadgeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Star ribbon badge */}
    <circle cx="12" cy="9" r="6" />
    <path d="M9 14.5L7 22l5-3 5 3-2-7.5" />
    <path d="M9.5 9l1.5 1.5 3.5-3.5" />
  </svg>
);

export const FishAquacultureIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Tilapia / Fish outline */}
    <path d="M2 12c5-5 12-5 18 0-6 5-13 5-18 0z" />
    {/* Tail fin */}
    <path d="M20 12l3-3v6l-3-3z" />
    {/* Eye */}
    <circle cx="6" cy="11" r="1" fill="currentColor" />
    {/* Scales / Gills */}
    <path d="M10 9c1 1.5 1 4.5 0 6" />
    <path d="M13 10c1 1 1 3 0 4" />
  </svg>
);

export const PoultryLivestockIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Rooster / Bird crest and body */}
    <path d="M12 4c-1-2-3-2-4-1 0 1 1 2 2 3-3 1-5 4-5 8 0 4 3 7 7 7s7-3 7-7c0-3-1-5-3-7l1-3c-1 0-2 1-3 2" />
    {/* Eye */}
    <circle cx="9" cy="7" r="1" fill="currentColor" />
    {/* Beak */}
    <path d="M6 7l-3 1 3 1" />
    {/* Feet */}
    <path d="M10 21v2M14 21v2" />
  </svg>
);

export const VegetableGardenIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size, color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    style={color ? { color } : undefined}
  >
    {/* Fresh root vegetable with lush foliage */}
    <path d="M12 22l-2.8-7.5c-1-2.5 0-5.5 2.5-6.5 2.5-1 5.5 0 6.5 2.5.8 2 0 4.5-1.7 5.8L12 22z" />
    <path d="M12 8C11 5 9 3.5 6.5 3.5c0 2.5 1.5 4.5 3.5 5" />
    <path d="M13.5 7.5C15 5 17 3.5 19.5 3.5c0 2.5-1.5 4.5-3.5 5" />
    <path d="M13 7V2" />
    <path d="M10.5 13.5h3M11 17h2" strokeDasharray="1 1" />
  </svg>
);

