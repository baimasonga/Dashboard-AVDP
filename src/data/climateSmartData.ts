/**
 * Sierra Leone AVDP Climate-Smart Agriculture (CSA) Component
 * Funded by Adaptation Fund & IFAD: Resilience, System of Rice Intensification (SRI),
 * agroforestry, zero-burning, solar micro-irrigation, and certified resilient seeds.
 */

export interface CsaPractice {
  id: string;
  name: string;
  category: 'Water Control & Irrigation' | 'Soil Health & Carbon' | 'Crop Genetics' | 'Agroforestry & Ecosystem' | 'Renewable Energy';
  valueChains: string[];
  description: string;
  keyTechniques: string[];
  climateBenefit: string;
  yieldImpact: string;
  hectaresAdopted: number;
  farmerAdoptionRatePct: number;
  icon: string;
}

export interface DistrictCsaPerformance {
  district: string;
  province: string;
  csaFarmersTrained: number;
  csaAdoptionRatePct: number;
  haUnderCsa: number;
  primaryCsaIntervention: string;
  ivsWaterControlHectares: number;
  shadeAgroforestryHectares: number;
}

export const CLIMATE_SMART_OVERVIEW = {
  title: 'Climate-Smart Agriculture (CSA) in AVDP Sierra Leone',
  mandate:
    'Financed jointly by the Adaptation Fund, IFAD, and the Government of Sierra Leone to transform traditional vulnerable farming systems into climate-resilient, low-carbon, and highly productive agricultural landscapes.',
  totalFarmersAdoptedCsa: 44800,
  csaTargetAchievementPct: 85.2, // Achieved 85% of project target
  totalHectaresUnderCsa: 36400,
  co2EquivalentSequesteredMt: 148000,
  waterSavingsInIvsPct: 36.5,
  syntheticFertilizerReductionPct: 38.0,
  solarPumpsInstalled: 85,
};

export const CSA_PRACTICES: CsaPractice[] = [
  {
    id: 'csa_sri_ivs',
    name: 'System of Rice Intensification (SRI) & IVS Water Control',
    category: 'Water Control & Irrigation',
    valueChains: ['Rice (IVS & Bolilands)'],
    description:
      'Replacing continuous deep flooding with carefully controlled water intake sluice gates, precise field leveling, peripheral bunding, and Alternate Wetting and Drying (AWD).',
    keyTechniques: [
      'Transplanting single, young (10–12 day old) seedlings at 25cm x 25cm grid spacing',
      'Intermittent shallow irrigation (AWD) allowing aerobic soil conditions for deeper root growth',
      'Mechanical push-weeders that incorporate green weeds into the soil as organic compost',
      'Peripheral drainage canals preventing monsoon swamp inundation and flash flood damage',
    ],
    climateBenefit:
      'Reduces methane emissions from flooded swamps by 44% and cuts irrigation water demand by 36.5% during dry periods.',
    yieldImpact: 'Increases paddy yield from 1.5 MT/Ha to 3.7 – 4.5 MT/Ha (+146% yield gain)',
    hectaresAdopted: 11400,
    farmerAdoptionRatePct: 82.4,
    icon: '🌾',
  },
  {
    id: 'csa_agroforestry',
    name: 'Shade-Tree Agroforestry & Microclimate Buffering',
    category: 'Agroforestry & Ecosystem',
    valueChains: ['Cocoa & Coffee', 'Oil Palm & CPO'],
    description:
      'Inter-planting nitrogen-fixing leguminous shade trees and economic fruit species within cocoa and oil palm groves to protect soil moisture and buffer extreme temperatures.',
    keyTechniques: [
      'Planting 25–35 native shade trees per hectare (Albizia zygia, Gliricidia sepium, Terminalia superba)',
      'Multi-strata canopy design maintaining 30–40% filtered sunlight to reduce leaf scorch',
      'Nitrogen-fixing root symbiosis naturally fertilizing surrounding tree crops',
      'Deep root networks that stabilize hillsides and prevent flash mudslides during monsoons',
    ],
    climateBenefit:
      'Buffers microclimate temperatures by 3.2°C during heatwaves, prevents soil erosion, and sequesters 4.8 MT CO2e/Ha/Yr.',
    yieldImpact: 'Extends productive lifespan of cocoa trees from 20 years to 35+ years with consistent bean quality',
    hectaresAdopted: 9800,
    farmerAdoptionRatePct: 78.6,
    icon: '🌳',
  },
  {
    id: 'csa_zero_burning',
    name: 'Zero-Burning, Bio-Mulching & Soil Composting',
    category: 'Soil Health & Carbon',
    valueChains: ['Cassava & HQCF', 'Rice (IVS & Bolilands)', 'Horticulture & Vegetables'],
    description:
      'Eliminating destructive slash-and-burn shifting cultivation; converting cleared crop residues, rice husks, and animal manure into nutrient-rich compost and organic bio-mulch.',
    keyTechniques: [
      'Slashing vegetation without burning, creating thick ground cover to retain soil moisture',
      'Composting rice straw, empty fruit bunches (EFB), and poultry manure with beneficial microorganisms',
      'Biochar incorporation into acidic tropical soils to permanently fix soil organic carbon',
      'Living leguminous cover crops (Mucuna pruriens, Pueraria phaseoloides) suppressing weeds',
    ],
    climateBenefit:
      'Prevents catastrophic wildfires, stops atmospheric particulate smoke emissions, and builds soil water-holding capacity.',
    yieldImpact: 'Improves soil organic matter from 1.2% to 3.8%, reducing drought crop failure risk by 68%',
    hectaresAdopted: 8200,
    farmerAdoptionRatePct: 74.5,
    icon: '🍂',
  },
  {
    id: 'csa_resilient_seeds',
    name: 'Certified Climate-Resilient Foundation Seeds',
    category: 'Crop Genetics',
    valueChains: ['Rice (IVS & Bolilands)', 'Cassava & HQCF', 'Oil Palm & CPO'],
    description:
      'Multiplication and distribution of SLARI-certified seed varieties specifically bred for drought tolerance, flood submergence survival, and resistance to cassava mosaic disease.',
    keyTechniques: [
      'Short-duration rice varieties (ROK-34, 105-day maturity) to escape early dry season cutoffs',
      'Submergence-tolerant rice varieties surviving up to 14 days under monsoon flash flooding',
      'Clean virus-free cassava stem cuttings (TME-419 and SLICASS-6) yielding 25+ MT/Ha',
      'Pre-germinated high-oil Tenera palm nuts adapted to erratic rainfall onset patterns',
    ],
    climateBenefit:
      'Mitigates the risk of total crop wipeout from delayed rains or extreme sudden monsoon deluges.',
    yieldImpact: 'Guarantees reliable baseline yields (+42% to +60% over traditional unselected landraces)',
    hectaresAdopted: 14800,
    farmerAdoptionRatePct: 88.0,
    icon: '🌱',
  },
  {
    id: 'csa_solar_irrigation',
    name: 'Solar-Powered Micro-Drip Irrigation Systems',
    category: 'Renewable Energy',
    valueChains: ['Horticulture & Vegetables'],
    description:
      'Solar submersible photovoltaic pump arrays linked to overhead gravity storage tanks and low-pressure drip lines for zero-emission dry-season horticulture.',
    keyTechniques: [
      '3.2 kWp solar array with variable frequency inverter driving submersible borehole pumps',
      '10,000L elevated polyethylene storage reservoirs providing reliable gravity head',
      'T-tape drip irrigation delivering precise root-zone hydration with 92% application efficiency',
      'Automated soil moisture sensors preventing groundwater over-extraction and salinization',
    ],
    climateBenefit:
      'Displaces 142,000 liters of fossil diesel fuel per year, avoiding 380 MT of direct greenhouse gas emissions.',
    yieldImpact: 'Enables 3 consecutive vegetable harvest cycles per year rather than a single rainfed crop',
    hectaresAdopted: 1850,
    farmerAdoptionRatePct: 86.2,
    icon: '☀️',
  },
  {
    id: 'csa_climate_advisory',
    name: 'Hyper-Local Agrometeorological SMS Advisories',
    category: 'Water Control & Irrigation',
    valueChains: ['Rice (IVS & Bolilands)', 'Cocoa & Coffee', 'Vegetables', 'Cassava', 'Oil Palm'],
    description:
      'Partnership with the Sierra Leone Meteorological Agency (SLMet) delivering hyper-local 7-day rainfall forecasts, onset predictions, and spray advisories via automated SMS.',
    keyTechniques: [
      'Automated weather stations installed at 16 district agricultural offices',
      'Downscaled seasonal forecasts translated into Krio, Mende, and Temne voice/SMS messages',
      'Optimal planting date advisories preventing premature sowing before steady monsoon rains',
      'Pest and fungal outbreak warnings correlated with humidity spikes',
    ],
    climateBenefit:
      'Equips smallholders to make climate-informed decisions, preventing catastrophic seed loss from false rains.',
    yieldImpact: 'Prevents 22% of early-season replanting costs and optimizes fertilizer application timing',
    hectaresAdopted: 24000,
    farmerAdoptionRatePct: 89.5,
    icon: '📲',
  },
];

export const DISTRICT_CSA_PERFORMANCE: DistrictCsaPerformance[] = [
  {
    district: 'Kailahun',
    province: 'Eastern',
    csaFarmersTrained: 5400,
    csaAdoptionRatePct: 88.4,
    haUnderCsa: 4800,
    primaryCsaIntervention: 'Agroforestry Shade Trees & Cocoa Organic Composting',
    ivsWaterControlHectares: 1200,
    shadeAgroforestryHectares: 3600,
  },
  {
    district: 'Kenema',
    province: 'Eastern',
    csaFarmersTrained: 5100,
    csaAdoptionRatePct: 86.2,
    haUnderCsa: 4500,
    primaryCsaIntervention: 'Cocoa Agroforestry & IVS Swamp Water Control',
    ivsWaterControlHectares: 1400,
    shadeAgroforestryHectares: 3100,
  },
  {
    district: 'Kono',
    province: 'Eastern',
    csaFarmersTrained: 3800,
    csaAdoptionRatePct: 82.0,
    haUnderCsa: 3200,
    primaryCsaIntervention: 'Upland Soil Terracing & Organic Tree Crop Systems',
    ivsWaterControlHectares: 950,
    shadeAgroforestryHectares: 2250,
  },
  {
    district: 'Bo',
    province: 'Southern',
    csaFarmersTrained: 4600,
    csaAdoptionRatePct: 85.5,
    haUnderCsa: 3900,
    primaryCsaIntervention: 'System of Rice Intensification (SRI) & Cassava Mulching',
    ivsWaterControlHectares: 2100,
    shadeAgroforestryHectares: 1800,
  },
  {
    district: 'Pujehun',
    province: 'Southern',
    csaFarmersTrained: 3900,
    csaAdoptionRatePct: 84.1,
    haUnderCsa: 3400,
    primaryCsaIntervention: 'Oil Palm Cover Cropping & IVS Bunding',
    ivsWaterControlHectares: 1600,
    shadeAgroforestryHectares: 1800,
  },
  {
    district: 'Bonthe',
    province: 'Southern',
    csaFarmersTrained: 4100,
    csaAdoptionRatePct: 83.8,
    haUnderCsa: 3700,
    primaryCsaIntervention: 'Boliland Water Control & Flood-Tolerant Rice Varieties',
    ivsWaterControlHectares: 2800,
    shadeAgroforestryHectares: 900,
  },
  {
    district: 'Moyamba',
    province: 'Southern',
    csaFarmersTrained: 3700,
    csaAdoptionRatePct: 81.5,
    haUnderCsa: 3100,
    primaryCsaIntervention: 'Zero-Burning Cassava Stem Nurseries & Composting',
    ivsWaterControlHectares: 1300,
    shadeAgroforestryHectares: 1800,
  },
  {
    district: 'Port Loko',
    province: 'North Western',
    csaFarmersTrained: 4800,
    csaAdoptionRatePct: 87.2,
    haUnderCsa: 3800,
    primaryCsaIntervention: 'Solar Micro-Drip Irrigation & SRI Rice in Inland Swamps',
    ivsWaterControlHectares: 2200,
    shadeAgroforestryHectares: 1600,
  },
  {
    district: 'Kambia',
    province: 'North Western',
    csaFarmersTrained: 4400,
    csaAdoptionRatePct: 86.8,
    haUnderCsa: 3600,
    primaryCsaIntervention: 'Tidal Mangrove & Boliland Salinity Water Management',
    ivsWaterControlHectares: 2600,
    shadeAgroforestryHectares: 1000,
  },
  {
    district: 'Koinadugu & Falaba',
    province: 'Northern',
    csaFarmersTrained: 5000,
    csaAdoptionRatePct: 89.1,
    haUnderCsa: 4400,
    primaryCsaIntervention: 'Solar Highlands Vegetable Irrigation & Contour Ridging',
    ivsWaterControlHectares: 1900,
    shadeAgroforestryHectares: 2500,
  },
];
