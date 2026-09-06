/**
 * Sierra Leone AVDP Grievance Redress & Infrastructure QA Image Presets
 * High-fidelity, localized SVG site inspection imagery and GPS coordinate matrices
 */

export interface DistrictGpsPreset {
  district: string;
  chiefdom: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

export type InfrastructureQaTag =
  | 'Culvert & Drainage Siltation'
  | 'Subgrade & Laterite Erosion'
  | 'Bridge Abutment Scour'
  | 'Borehole Apron Cracking'
  | 'Water Well Turbidity / Salinity'
  | 'Contractor Spoil Dump / Crop Encroachment'
  | 'Inadequate Road Compaction'
  | 'SECAP Environmental Safeguard Breach'
  | 'Safety Barrier / Signage Missing';

export interface PresetQaImage {
  id: string;
  title: string;
  caption: string;
  assetType: string;
  chainage: string;
  district: string;
  chiefdom: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  qaTags: InfrastructureQaTag[];
  severity: 'Low' | 'Moderate' | 'Critical / Safety Risk';
  capturedBy: string;
  deviceInfo: string;
  verifiedByEngineer: boolean;
  dataUri: string;
}

export const DISTRICT_GPS_PRESETS: Record<string, DistrictGpsPreset> = {
  Kailahun: {
    district: 'Kailahun',
    chiefdom: 'Luawa Chiefdom',
    latitude: 8.2778,
    longitude: -10.5739,
    elevationMeters: 285,
  },
  Kenema: {
    district: 'Kenema',
    chiefdom: 'Dama Chiefdom',
    latitude: 7.8753,
    longitude: -11.1874,
    elevationMeters: 172,
  },
  'Port Loko': {
    district: 'Port Loko',
    chiefdom: 'Lokomasama Chiefdom',
    latitude: 8.7667,
    longitude: -12.7833,
    elevationMeters: 45,
  },
  Bonthe: {
    district: 'Bonthe',
    chiefdom: 'Bum Chiefdom (Torma Bum)',
    latitude: 7.5333,
    longitude: -11.9667,
    elevationMeters: 18,
  },
  Moyamba: {
    district: 'Moyamba',
    chiefdom: 'Ribbi Chiefdom',
    latitude: 8.1611,
    longitude: -12.4319,
    elevationMeters: 62,
  },
  Pujehun: {
    district: 'Pujehun',
    chiefdom: 'Soro-Gbema Chiefdom',
    latitude: 7.3506,
    longitude: -11.7208,
    elevationMeters: 54,
  },
  Kono: {
    district: 'Kono',
    chiefdom: 'Nimikoro Chiefdom',
    latitude: 8.6439,
    longitude: -10.9712,
    elevationMeters: 415,
  },
  Bo: {
    district: 'Bo',
    chiefdom: 'Kakua Chiefdom',
    latitude: 7.9553,
    longitude: -11.7381,
    elevationMeters: 112,
  },
};

// Generates an inline SVG data URI representing a field inspection photo with engineering HUD overlay
function createSvgDataUri(
  title: string,
  assetTag: string,
  chainage: string,
  gps: string,
  severityColor: string,
  svgArt: string
): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="laterite" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect width="800" height="500" fill="url(#grid)"/>

  <!-- Field Scene Artwork -->
  ${svgArt}

  <!-- Viewfinder / Reticle Frame -->
  <path d="M 40 70 L 40 40 L 70 40" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <path d="M 760 70 L 760 40 L 730 40" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <path d="M 40 430 L 40 460 L 70 460" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <path d="M 760 430 L 760 460 L 730 460" fill="none" stroke="#38bdf8" stroke-width="3"/>

  <!-- Center Crosshairs -->
  <circle cx="400" cy="250" r="28" fill="none" stroke="rgba(56,189,248,0.4)" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="390" y1="250" x2="410" y2="250" stroke="#38bdf8" stroke-width="2"/>
  <line x1="400" y1="240" x2="400" y2="260" stroke="#38bdf8" stroke-width="2"/>

  <!-- Top Metadata HUD Banner -->
  <rect x="30" y="25" width="740" height="38" rx="8" fill="rgba(15, 23, 42, 0.88)" stroke="#334155" stroke-width="1.5"/>
  <circle cx="50" cy="44" r="6" fill="${severityColor}"/>
  <text x="66" y="48" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">${title}</text>
  <text x="480" y="48" fill="#94a3b8" font-family="monospace" font-size="11">${assetTag} | ${chainage}</text>

  <!-- Bottom GPS & Timestamp HUD Banner -->
  <rect x="30" y="435" width="740" height="40" rx="8" fill="rgba(15, 23, 42, 0.92)" stroke="#334155" stroke-width="1.5"/>
  <text x="48" y="460" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">📍 ${gps}</text>
  <text x="520" y="460" fill="#cbd5e1" font-family="monospace" font-size="11">AVDP QA FIELD AUDIT • VERIFIED</text>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_QA_IMAGES: Record<string, PresetQaImage> = {
  culvert_washout: {
    id: 'img_preset_culvert',
    title: 'Box Culvert Inlet Siltation & Scour',
    caption: 'Feeder Road Lot 04, Box Culvert Inlet completely silted with monsoon gravel deposit, blocking discharge into swamp stream.',
    assetType: 'Box Culvert / Bridge',
    chainage: 'CH 12+400',
    district: 'Kailahun',
    chiefdom: 'Luawa Chiefdom',
    latitude: 8.2741,
    longitude: -10.5719,
    elevationMeters: 284,
    qaTags: ['Culvert & Drainage Siltation', 'Bridge Abutment Scour'],
    severity: 'Critical / Safety Risk' as const,
    capturedBy: 'Ing. M. Kallon (District Council Engineer)',
    deviceInfo: 'Trimble TDC600 GNSS Handheld',
    verifiedByEngineer: true,
    dataUri: createSvgDataUri(
      'SECAP QA: BOX CULVERT SILTATION',
      'FR-LOT04-BC02',
      'CH 12+400',
      '8.2741°N, 10.5719°W (±1.8m)',
      '#ef4444',
      `
      <!-- Embankment & Culvert Scene -->
      <polygon points="40,380 40,220 760,220 760,380" fill="#78350f" opacity="0.9"/>
      <polygon points="40,220 200,160 600,160 760,220" fill="#92400e"/>
      <!-- Road Surface -->
      <polygon points="220,160 580,160 660,220 140,220" fill="#b45309"/>
      <!-- Concrete Culvert Barrel -->
      <rect x="290" y="240" width="220" height="130" rx="8" fill="#475569" stroke="#64748b" stroke-width="4"/>
      <rect x="320" y="270" width="160" height="95" rx="4" fill="#0f172a"/>
      <!-- Silt blockage inside culvert barrel -->
      <path d="M 320 330 Q 400 295 480 340 L 480 365 L 320 365 Z" fill="#9a3412"/>
      <path d="M 280 365 Q 400 340 520 370 L 520 380 L 280 380 Z" fill="#78350f"/>
      <!-- Wingwall Cracks -->
      <path d="M 290 260 L 315 285 L 305 315" fill="none" stroke="#ef4444" stroke-width="3"/>
      <text x="230" y="280" fill="#fca5a5" font-family="monospace" font-size="11" font-weight="bold">CRACK 12mm</text>
      <!-- Depth Scale Indicator -->
      <line x1="505" y1="270" x2="505" y2="365" stroke="#facc15" stroke-width="3"/>
      <text x="515" y="320" fill="#fef08a" font-family="monospace" font-size="11">75% SILTED</text>
      `
    ),
  },

  road_rutting_erosion: {
    id: 'img_preset_road_erosion',
    title: 'Laterite Subgrade Rutting & Gully Erosion',
    caption: 'Heavy monsoon storm caused deep laterite longitudinal washouts exceeding 250mm depth on newly graded roadway.',
    assetType: 'Feeder Road',
    chainage: 'CH 06+850',
    district: 'Moyamba',
    chiefdom: 'Ribbi Chiefdom',
    latitude: 8.1634,
    longitude: -12.4312,
    elevationMeters: 64,
    qaTags: ['Subgrade & Laterite Erosion', 'Inadequate Road Compaction'],
    severity: 'Moderate' as const,
    capturedBy: 'A. Sesay (MAFS Agricultural Extension Agent)',
    deviceInfo: 'Samsung Galaxy Rugged Field Tab',
    verifiedByEngineer: true,
    dataUri: createSvgDataUri(
      'SECAP QA: ROAD SUBGRADE EROSION',
      'FR-LOT06-RD01',
      'CH 06+850',
      '8.1634°N, 12.4312°W (±2.4m)',
      '#f59e0b',
      `
      <!-- Roadway Perspective Scene -->
      <polygon points="80,420 340,150 460,150 720,420" fill="#b45309"/>
      <!-- Road Shoulder / Ditch -->
      <polygon points="40,430 80,420 340,150 280,150" fill="#78350f"/>
      <polygon points="760,430 720,420 460,150 520,150" fill="#78350f"/>
      <!-- Deep Erosion Gully / Rut -->
      <path d="M 370 170 Q 350 260 280 400 L 320 410 Q 380 270 395 170 Z" fill="#451a03"/>
      <path d="M 430 170 Q 450 270 510 400 L 480 410 Q 420 280 410 170 Z" fill="#451a03"/>
      <!-- Stagnant Runoff Pool in Rut -->
      <ellipse cx="305" cy="385" rx="25" ry="8" fill="#0284c7" opacity="0.8"/>
      <!-- Survey Stake -->
      <line x1="240" y1="360" x2="240" y2="430" stroke="#ffffff" stroke-width="4"/>
      <polygon points="240,360 270,375 240,390" fill="#ef4444"/>
      <text x="210" y="350" fill="#fef08a" font-family="monospace" font-size="11" font-weight="bold">RUT DEPTH: 28cm</text>
      `
    ),
  },

  solar_borehole_crack: {
    id: 'img_preset_borehole',
    title: 'Solar Borehole Apron Fracture & Pooling',
    caption: 'Sanitary concrete apron perimeter cracked adjacent to submersible solar pump riser, permitting wastewater back-seepage.',
    assetType: 'Drinking Water Well',
    chainage: 'Well #BW-04',
    district: 'Port Loko',
    chiefdom: 'Lokomasama Chiefdom',
    latitude: 8.7612,
    longitude: -12.7845,
    elevationMeters: 48,
    qaTags: ['Borehole Apron Cracking', 'Water Well Turbidity / Salinity'],
    severity: 'Critical / Safety Risk' as const,
    capturedBy: 'F. Bangura (Community WASH Water Committee Chair)',
    deviceInfo: 'Field GPS Smartphone Cam',
    verifiedByEngineer: false,
    dataUri: createSvgDataUri(
      'SECAP QA: BOREHOLE APRON FRACTURE',
      'DW-WELL-BW04',
      'STATION 01',
      '8.7612°N, 12.7845°W (±2.1m)',
      '#ef4444',
      `
      <!-- Concrete Slab Apron Floor -->
      <polygon points="120,410 240,210 560,210 680,410" fill="#64748b"/>
      <!-- Raised Central Pedestal -->
      <polygon points="320,290 360,230 440,230 480,290" fill="#94a3b8"/>
      <!-- Stainless Steel Solar Pump Head Riser & Spout -->
      <rect x="385" y="170" width="30" height="90" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <path d="M 415 190 L 455 190 L 455 210" fill="none" stroke="#cbd5e1" stroke-width="8"/>
      <!-- Severe Apron Crack across drain trough -->
      <path d="M 420 290 L 435 340 L 400 375 L 420 410" fill="none" stroke="#dc2626" stroke-width="3.5"/>
      <path d="M 435 340 L 470 360 L 490 390" fill="none" stroke="#dc2626" stroke-width="2.5"/>
      <!-- Water puddle seep -->
      <ellipse cx="450" cy="380" rx="45" ry="14" fill="#0369a1" opacity="0.85"/>
      <text x="490" y="350" fill="#fca5a5" font-family="monospace" font-size="11" font-weight="bold">FRACTURE 8mm</text>
      <text x="490" y="365" fill="#fca5a5" font-family="monospace" font-size="10">CONTAMINATION RISK</text>
      `
    ),
  },

  cocoa_orchard_laterite_spill: {
    id: 'img_preset_spoil_dump',
    title: 'Contractor Spoil Dump into Cocoa Basins',
    caption: 'Heavy road grading contractor spilled unprocessed laterite berm over roadside boundary markers into certified organic cocoa trees.',
    assetType: 'Feeder Road',
    chainage: 'CH 04+120',
    district: 'Kailahun',
    chiefdom: 'Luawa Chiefdom',
    latitude: 8.2915,
    longitude: -10.561,
    elevationMeters: 290,
    qaTags: ['Contractor Spoil Dump / Crop Encroachment', 'SECAP Environmental Safeguard Breach'],
    severity: 'Moderate' as const,
    capturedBy: 'M. Sannoh (Organic Cocoa Lead Farmer)',
    deviceInfo: 'Android Mobile Field App',
    verifiedByEngineer: true,
    dataUri: createSvgDataUri(
      'SECAP QA: CROP SPOIL ENCROACHMENT',
      'FR-LOT04-SP01',
      'CH 04+120',
      '8.2915°N, 10.5610°W (±3.1m)',
      '#f59e0b',
      `
      <!-- Road Grader Laterite Mound -->
      <polygon points="40,360 40,240 380,240 460,360" fill="#b45309"/>
      <!-- Spoil Slump into Orchard -->
      <path d="M 380 240 Q 480 280 540 370 L 460 370 Z" fill="#9a3412"/>
      <!-- Cocoa Trees -->
      <rect x="560" y="210" width="18" height="110" fill="#78350f"/>
      <ellipse cx="569" cy="200" rx="45" ry="40" fill="#15803d"/>
      <ellipse cx="550" cy="225" rx="8" ry="12" fill="#d97706"/> <!-- Cocoa Pod -->
      <rect x="680" y="230" width="16" height="100" fill="#78350f"/>
      <ellipse cx="688" cy="215" rx="40" ry="35" fill="#166534"/>
      <!-- Silt covering root flares -->
      <ellipse cx="570" cy="320" rx="35" ry="12" fill="#9a3412"/>
      <text x="430" y="270" fill="#fef08a" font-family="monospace" font-size="11" font-weight="bold">SPOIL OVERRUN: 18m</text>
      `
    ),
  },
};
