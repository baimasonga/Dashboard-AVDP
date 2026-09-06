/**
 * Sierra Leone AVDP Key Agricultural Facilities & Agro-Processing Hubs
 * Geospatially mapped for Senior GIS & M&E Analysis
 */

export interface AgriFacility {
  id: string;
  name: string;
  type: 'oil_palm_mill' | 'rice_mill' | 'cocoa_hub' | 'veg_solar' | 'seed_center';
  district: string;
  province: string;
  lat: number;
  lon: number;
  capacityDescription: string;
  operator: string;
  status: 'operational' | 'upgrading' | 'planned';
}

export const AVDP_AGRI_FACILITIES: AgriFacility[] = [
  // Rice Mills & Parboiling Hubs
  {
    id: 'fac-rice-01',
    name: 'Rokupr Rice Processing & Seed Station',
    type: 'seed_center',
    district: 'Kambia',
    province: 'North Western',
    lat: 9.0125,
    lon: -12.9461,
    capacityDescription: '15 MT/day parboiling & certified ROK-4 seed cleaning',
    operator: 'SLARI & Kambia Rice FBO Union',
    status: 'operational',
  },
  {
    id: 'fac-rice-02',
    name: 'Mambolo Boliland Milling Center',
    type: 'rice_mill',
    district: 'Kambia',
    province: 'North Western',
    lat: 9.0833,
    lon: -12.9833,
    capacityDescription: '10 MT/day modern de-husking & destoning',
    operator: 'Mambolo Agricultural Cooperative',
    status: 'operational',
  },
  {
    id: 'fac-rice-03',
    name: 'Torma Bum Riverine Rice Hub',
    type: 'rice_mill',
    district: 'Bonthe',
    province: 'Southern',
    lat: 7.5333,
    lon: -11.9667,
    capacityDescription: '25 MT/day commercial industrial mill',
    operator: 'AVDP Mechanization Service Center',
    status: 'operational',
  },
  {
    id: 'fac-rice-04',
    name: 'Gberegboto IVS Central Mill',
    type: 'rice_mill',
    district: 'Bo',
    province: 'Southern',
    lat: 7.9644,
    lon: -11.7383,
    capacityDescription: '8 MT/day solar-assisted parboiling unit',
    operator: 'Bo District Rice Farmers Association',
    status: 'operational',
  },
  {
    id: 'fac-rice-05',
    name: 'Koidu Inland Valley Processing Hub',
    type: 'rice_mill',
    district: 'Kono',
    province: 'Eastern',
    lat: 8.6439,
    lon: -10.9714,
    capacityDescription: '6 MT/day grading & packaging line',
    operator: 'Kono Agro-Alliance',
    status: 'operational',
  },

  // Oil Palm Mini-CPO Mills
  {
    id: 'fac-palm-01',
    name: 'Pujehun Gold Mini-CPO Extractor',
    type: 'oil_palm_mill',
    district: 'Pujehun',
    province: 'Southern',
    lat: 7.3581,
    lon: -11.7208,
    capacityDescription: '5 MT/hour fresh fruit bunch (FFB) digestion',
    operator: 'Southern Palm Oil Producers Cooperative',
    status: 'operational',
  },
  {
    id: 'fac-palm-02',
    name: 'Kenema Smallholder Palm Complex',
    type: 'oil_palm_mill',
    district: 'Kenema',
    province: 'Eastern',
    lat: 7.8767,
    lon: -11.1875,
    capacityDescription: '8 MT/hour mechanized expeller & clarification',
    operator: 'AVDP Outgrower Scheme',
    status: 'operational',
  },
  {
    id: 'fac-palm-03',
    name: 'Moyamba Central Palm Nursery & Mill',
    type: 'oil_palm_mill',
    district: 'Moyamba',
    province: 'Southern',
    lat: 8.1583,
    lon: -12.4317,
    capacityDescription: '4 MT/hour extraction + 250k Tenera nursery',
    operator: 'Moyamba Tree Crop Cooperative',
    status: 'operational',
  },
  {
    id: 'fac-palm-04',
    name: 'Kailahun Moa Valley Palm Mill',
    type: 'oil_palm_mill',
    district: 'Kailahun',
    province: 'Eastern',
    lat: 8.2778,
    lon: -10.5731,
    capacityDescription: '6 MT/hour automated boiler & press',
    operator: 'Eastern Palm Producers Union',
    status: 'operational',
  },

  // Cocoa Solar Fermentaries & Export Quality Centers
  {
    id: 'fac-cocoa-01',
    name: 'Kailahun Central Fermentary & Solar Dryers',
    type: 'cocoa_hub',
    district: 'Kailahun',
    province: 'Eastern',
    lat: 8.2833,
    lon: -10.5667,
    capacityDescription: '2,500 MT/year certified organic solar drying beds',
    operator: 'Kailahun Cocoa Farmers Cooperative Union',
    status: 'operational',
  },
  {
    id: 'fac-cocoa-02',
    name: 'Hangha Specialty Cocoa Warehouse & QC Lab',
    type: 'cocoa_hub',
    district: 'Kenema',
    province: 'Eastern',
    lat: 7.9167,
    lon: -11.2333,
    capacityDescription: '3,800 MT export staging & moisture testing lab',
    operator: 'Fairtrade Cocoa Producers Federation',
    status: 'operational',
  },
  {
    id: 'fac-cocoa-03',
    name: 'Koidu-Yengema Fermentation Station',
    type: 'cocoa_hub',
    district: 'Kono',
    province: 'Eastern',
    lat: 8.6167,
    lon: -11.05,
    capacityDescription: '1,200 MT/year Grade 1 beans conditioning',
    operator: 'Kono Tree Crops Association',
    status: 'operational',
  },

  // Horticulture, Solar Micro-Irrigation & Cold Storage Hubs
  {
    id: 'fac-veg-01',
    name: 'Kabala Plateau Solar Irrigation & Cold Hub',
    type: 'veg_solar',
    district: 'Koinadugu',
    province: 'Northern',
    lat: 9.5892,
    lon: -11.5522,
    capacityDescription: '50 Ha solar drip system + 150 MT cold store',
    operator: 'Kabala Women Vegetable Growers Association',
    status: 'operational',
  },
  {
    id: 'fac-veg-02',
    name: 'Mongo High-Altitude Vegetable Depot',
    type: 'veg_solar',
    district: 'Falaba',
    province: 'Northern',
    lat: 9.8833,
    lon: -11.3167,
    capacityDescription: 'Solar micro-pumps & off-season horticulture nursery',
    operator: 'Falaba Youth Agribusiness Collective',
    status: 'operational',
  },
  {
    id: 'fac-veg-03',
    name: 'Waterloo Peri-Urban Greenhouses',
    type: 'veg_solar',
    district: 'Western Area Rural',
    province: 'Western',
    lat: 8.3389,
    lon: -13.0708,
    capacityDescription: '20 solar tunnel greenhouses supplying Freetown',
    operator: 'Western Women Commercial Gardeners',
    status: 'operational',
  },
  {
    id: 'fac-veg-04',
    name: 'Lungi Fresh Produce Packing Facility',
    type: 'veg_solar',
    district: 'Port Loko',
    province: 'North Western',
    lat: 8.6167,
    lon: -13.2,
    capacityDescription: 'Export packhouse & pre-cooling facility',
    operator: 'North-West Horticultural Exporters Group',
    status: 'operational',
  },
];
