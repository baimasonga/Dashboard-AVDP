/**
 * Sierra Leone AVDP Rural Infrastructure Component (Component 1 & 3)
 * Feeder roads rehabilitation (420+ km across 8 districts), bridges, farm tracks,
 * and multi-purpose water wells (drinking water boreholes & solar-powered irrigation).
 */

export interface FeederRoadLot {
  lotNumber: string;
  district: string;
  roadSection: string;
  lengthKm: number;
  contractor: string;
  bridgesCount: number;
  boxCulverts: number;
  status: 'Completed' | 'In Progress' | 'Final Inspection';
  completionPct: number;
  directBeneficiaries: number;
  priorTransitHours: number;
  currentTransitHours: number;
  cropEvacuationTarget: string;
}

export interface WaterWellProject {
  id: string;
  purpose: 'Solar-Powered Irrigation (Vegetables)' | 'Community Safe Drinking Water' | 'Multi-Purpose (Drinking + ABC Processing)';
  district: string;
  community: string;
  coordinates: [number, number]; // [lat, lng]
  wellDepthMeters: number;
  powerSource: 'Solar Photovoltaic Array (3.2 kWp)' | 'Hand Pump (India Mark II / Afridev)' | 'Solar-Hybrid Dual Motor';
  storageTankCapacityLiters?: number;
  irrigatedHectares?: number;
  beneficiaryFBOorCommunity: string;
  waterQualityTested: boolean;
  bacteriologicalStatus: 'Potable / Zero E. Coli' | 'Potable with Chlorination';
  womenGrowersServed: number;
  status: 'Fully Operational' | 'Commissioning';
}

export const INFRASTRUCTURE_OVERVIEW = {
  totalFeederRoadsKm: 420.5,
  farmAccessTracksKm: 75.0,
  bridgesTotal: 14,
  bridgesCompleted: 8,
  bridgesInProgress: 6,
  boxCulvertsInstalled: 312,
  priorityDistrictsCovered: 8,
  districtsList: ['Bo', 'Moyamba', 'Pujehun', 'Bonthe', 'Kenema', 'Kailahun', 'Kono', 'Port Loko'],
  postHarvestTransportLossReductionPct: 58.4,
  avgTransitTimeReductionPct: 62.5,
  freightCostReductionPerBagPct: 46.0,
  totalWaterWellsConstructed: 64,
  solarIrrigationBoreholes: 24,
  safeDrinkingWaterWells: 40,
  hectaresUnderSolarIrrigation: 1850,
  populationWithSafeDrinkingWaterAccess: 38500,
  dailyWaterCollectionTimeSavedHours: 2.4,
};

export const FEEDER_ROADS_LOTS: FeederRoadLot[] = [
  {
    lotNumber: 'LOT-SL-01',
    district: 'Kailahun',
    roadSection: 'Pendembu – Mobai – Baiima – Giehun Cocoa Corridor',
    lengthKm: 64.2,
    contractor: 'Salcost / Freetown Civil Works JV',
    bridgesCount: 3,
    boxCulverts: 48,
    status: 'Completed',
    completionPct: 100,
    directBeneficiaries: 24500,
    priorTransitHours: 5.5,
    currentTransitHours: 1.5,
    cropEvacuationTarget: 'Organic Cocoa, Palm Oil & Cassava Tubers',
  },
  {
    lotNumber: 'LOT-SL-02',
    district: 'Kenema',
    roadSection: 'Blama – Sembehun – Dama Chiefdom Agricultural Loop',
    lengthKm: 52.8,
    contractor: 'CSE Senegal / Sierra Engineering Ltd',
    bridgesCount: 2,
    boxCulverts: 38,
    status: 'In Progress',
    completionPct: 88,
    directBeneficiaries: 19800,
    priorTransitHours: 4.2,
    currentTransitHours: 1.8,
    cropEvacuationTarget: 'Fresh Fruit Bunches (FFB) & IVS Swamp Rice',
  },
  {
    lotNumber: 'LOT-SL-03',
    district: 'Pujehun',
    roadSection: 'Zimmi – Fairo – Gbongeh – Mano River Outgrower Access',
    lengthKm: 58.5,
    contractor: 'Guicopres Sierra Leone Ltd',
    bridgesCount: 2,
    boxCulverts: 44,
    status: 'In Progress',
    completionPct: 82,
    directBeneficiaries: 22000,
    priorTransitHours: 6.0,
    currentTransitHours: 2.0,
    cropEvacuationTarget: 'Industrial Oil Palm Bunches to Socfin & Goldtree Mills',
  },
  {
    lotNumber: 'LOT-SL-04',
    district: 'Bonthe',
    roadSection: 'Mattru Jong – Tisana – Torma Bum Rice Plains Access',
    lengthKm: 48.0,
    contractor: 'Secon Construction Ltd',
    bridgesCount: 2,
    boxCulverts: 36,
    status: 'In Progress',
    completionPct: 85,
    directBeneficiaries: 18500,
    priorTransitHours: 4.8,
    currentTransitHours: 1.6,
    cropEvacuationTarget: 'Mechanized Paddy Evacuation from Torma Bum Plains',
  },
  {
    lotNumber: 'LOT-SL-05',
    district: 'Bo',
    roadSection: 'Tikonko – Gerihun – Baoma Rice & Cassava Hub',
    lengthKm: 46.5,
    contractor: 'Welthungerhilfe / MODEP Infrastructure Hub',
    bridgesCount: 1,
    boxCulverts: 32,
    status: 'Completed',
    completionPct: 100,
    directBeneficiaries: 21000,
    priorTransitHours: 3.5,
    currentTransitHours: 1.1,
    cropEvacuationTarget: 'HQCF Cassava Tubers, Rice, and Fresh Vegetables',
  },
  {
    lotNumber: 'LOT-SL-06',
    district: 'Moyamba',
    roadSection: 'Rotifunk – Ribbi – Moyamba Junction HQCF Feeder',
    lengthKm: 51.0,
    contractor: 'China Railway Seventh Group (CRSG) SL',
    bridgesCount: 2,
    boxCulverts: 40,
    status: 'In Progress',
    completionPct: 80,
    directBeneficiaries: 17800,
    priorTransitHours: 4.5,
    currentTransitHours: 1.7,
    cropEvacuationTarget: 'Fresh Cassava Tubers to Commercial Flash Dryers',
  },
  {
    lotNumber: 'LOT-SL-07',
    district: 'Port Loko',
    roadSection: 'Masiaka – Rogbere – Lokomasama Horticultural Highway',
    lengthKm: 53.5,
    contractor: 'Gento Aviation & Engineering Ltd',
    bridgesCount: 1,
    boxCulverts: 42,
    status: 'Completed',
    completionPct: 100,
    directBeneficiaries: 28400,
    priorTransitHours: 3.8,
    currentTransitHours: 1.2,
    cropEvacuationTarget: 'Perishable Dry-Season Vegetables to Freetown Wholesale',
  },
  {
    lotNumber: 'LOT-SL-08',
    district: 'Kono',
    roadSection: 'Koidu – Nimikoro – Sandor Coffee & Cocoa Trunk',
    lengthKm: 46.0,
    contractor: 'Nimo Construction Sierra Leone',
    bridgesCount: 1,
    boxCulverts: 32,
    status: 'Final Inspection',
    completionPct: 95,
    directBeneficiaries: 16200,
    priorTransitHours: 4.0,
    currentTransitHours: 1.4,
    cropEvacuationTarget: 'Traceable Organic Cocoa & Specialty Robusta Coffee',
  },
];

export const WATER_WELLS_PROJECTS: WaterWellProject[] = [
  {
    id: 'well_irr_01',
    purpose: 'Solar-Powered Irrigation (Vegetables)',
    district: 'Port Loko',
    community: 'Lokomasama Horticulture Cooperative',
    coordinates: [8.651, -12.923],
    wellDepthMeters: 55,
    powerSource: 'Solar Photovoltaic Array (3.2 kWp)',
    storageTankCapacityLiters: 10000,
    irrigatedHectares: 85,
    beneficiaryFBOorCommunity: 'Lokomasama Women Vegetable Growers Union (180 Members)',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 180,
    status: 'Fully Operational',
  },
  {
    id: 'well_irr_02',
    purpose: 'Solar-Powered Irrigation (Vegetables)',
    district: 'Koinadugu',
    community: 'Kabala Highlands Green Valley',
    coordinates: [9.589, -11.552],
    wellDepthMeters: 62,
    powerSource: 'Solar Photovoltaic Array (3.2 kWp)',
    storageTankCapacityLiters: 12000,
    irrigatedHectares: 110,
    beneficiaryFBOorCommunity: 'Kabala Vegetable Farmers Cooperative (220 Members)',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 220,
    status: 'Fully Operational',
  },
  {
    id: 'well_irr_03',
    purpose: 'Solar-Powered Irrigation (Vegetables)',
    district: 'Kambia',
    community: 'Rokupr Tidal Swamps Fringe',
    coordinates: [9.012, -12.918],
    wellDepthMeters: 48,
    powerSource: 'Solar Photovoltaic Array (3.2 kWp)',
    storageTankCapacityLiters: 8000,
    irrigatedHectares: 65,
    beneficiaryFBOorCommunity: 'Rokupr Women Off-Season Chili & Tomato Association',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 145,
    status: 'Fully Operational',
  },
  {
    id: 'well_irr_04',
    purpose: 'Solar-Powered Irrigation (Vegetables)',
    district: 'Western Area Rural',
    community: 'Waterloo – Fogbo Agri-Belt',
    coordinates: [8.338, -13.072],
    wellDepthMeters: 52,
    powerSource: 'Solar Photovoltaic Array (3.2 kWp)',
    storageTankCapacityLiters: 10000,
    irrigatedHectares: 75,
    beneficiaryFBOorCommunity: 'Fogbo Peri-Urban Women Horticulturalists',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 160,
    status: 'Fully Operational',
  },
  {
    id: 'well_dw_01',
    purpose: 'Community Safe Drinking Water',
    district: 'Kailahun',
    community: 'Pendembu ABC & Market Center',
    coordinates: [8.283, -10.967],
    wellDepthMeters: 42,
    powerSource: 'Hand Pump (India Mark II / Afridev)',
    storageTankCapacityLiters: 0,
    beneficiaryFBOorCommunity: 'Pendembu Township & Cocoa Farmers Union (1,850 Residents)',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 420,
    status: 'Fully Operational',
  },
  {
    id: 'well_dw_02',
    purpose: 'Community Safe Drinking Water',
    district: 'Bonthe',
    community: 'Torma Bum Central Agro-Hub',
    coordinates: [7.534, -11.967],
    wellDepthMeters: 38,
    powerSource: 'Hand Pump (India Mark II / Afridev)',
    storageTankCapacityLiters: 0,
    beneficiaryFBOorCommunity: 'Torma Bum Rice Farmers & Mill Workers Settlement',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 380,
    status: 'Fully Operational',
  },
  {
    id: 'well_dw_03',
    purpose: 'Multi-Purpose (Drinking + ABC Processing)',
    district: 'Moyamba',
    community: 'Rotifunk Cassava HQCF Mill Center',
    coordinates: [8.225, -12.678],
    wellDepthMeters: 50,
    powerSource: 'Solar-Hybrid Dual Motor',
    storageTankCapacityLiters: 15000,
    irrigatedHectares: 30,
    beneficiaryFBOorCommunity: 'Rotifunk Community & Cassava Washing Operations',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 280,
    status: 'Fully Operational',
  },
  {
    id: 'well_dw_04',
    purpose: 'Community Safe Drinking Water',
    district: 'Pujehun',
    community: 'Zimmi Outgrower Hamlet',
    coordinates: [7.317, -11.317],
    wellDepthMeters: 45,
    powerSource: 'Hand Pump (India Mark II / Afridev)',
    storageTankCapacityLiters: 0,
    beneficiaryFBOorCommunity: 'Zimmi Palm Harvester Families (1,400 Residents)',
    waterQualityTested: true,
    bacteriologicalStatus: 'Potable / Zero E. Coli',
    womenGrowersServed: 340,
    status: 'Fully Operational',
  },
];
