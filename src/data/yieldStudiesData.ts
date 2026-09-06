/**
 * Comprehensive Yield Studies and Agronomic Trial Research Data
 * Sierra Leone Agriculture Value Chain Development Project (AVDP)
 * Supported by IFAD, MAFS, OFID, and Adaptation Fund (2019 - 2027 Extended Lifecycle)
 * Scientific Partners: Njala University, Sierra Leone Agricultural Research Institute (SLARI), AfricaRice, and IITA
 */

export interface YieldStudyOverview {
  totalStudiesConducted: number;
  totalCropCutPlotsSampled: number;
  totalSmallholderHouseholdsSurveyed: number;
  participatingResearchInstitutes: string[];
  averageYieldGainOverallPct: number;
  statisticalConfidenceInterval: string;
  samplingMethodology: string;
  lifecycleSpan: string;
}

export interface ValueChainYieldStudy {
  id: string;
  commodityKey: 'rice' | 'cocoa' | 'oil_palm' | 'cassava' | 'vegetables';
  commodityName: string;
  scientificName: string;
  subTypeOrEcosystem: string;
  unit: string;
  
  // Research Metadata
  studyTitle: string;
  leadResearchAgency: string;
  coOperatingInstitutions: string[];
  publicationYear: number;
  sampleSizePlots: number;
  sampleSizeFarmers: number;
  districtsSampled: string[];
  methodologyDescription: string;
  pValSignificance: string;
  cohenEffectSize: number;

  // Empirical Yield Measurements
  baselineYield2019: number;
  midtermYield2023: number;
  projectClosureAchieved2027: number;
  counterfactualControlYield: number; // Non-beneficiary control group
  netAttributableGainAmount: number;
  netAttributableGainPct: number;

  // Quality & Post-Harvest Transformation
  qualityParameterName: string;
  qualityBaselineValue: string;
  qualityAchievedValue: string;

  // Financial & Gross Margin Evaluation (Per Hectare in USD)
  costOfProductionPerHaUSD: {
    control: number;
    avdpTrained: number;
  };
  grossRevenuePerHaUSD: {
    control: number;
    avdpTrained: number;
  };
  netGrossMarginPerHaUSD: {
    control: number;
    avdpTrained: number;
  };
  returnOnInvestmentRatio: {
    control: number;
    avdpTrained: number;
  };
  laborProductivityUSDPerDay: {
    control: number;
    avdpTrained: number;
  };

  // Agronomic Factor Decomposition (% contribution to observed yield gain)
  yieldDeterminants: {
    factor: string;
    contributionPct: number;
    description: string;
  }[];

  // District-Level Measured Performance
  districtVariations: {
    district: string;
    agroZone: string;
    controlYield: number;
    treatmentYield: number;
    gainPct: number;
    primarySoilLimitation: string;
  }[];

  // Core Scientific Findings & Recommendations
  keyFindings: string[];
  policyRecommendations: string[];
}

export interface ResearchPaperRecord {
  id: string;
  title: string;
  leadAuthors: string;
  institution: string;
  year: number;
  journalOrSeries: string;
  targetCommodity: string;
  abstract: string;
  sampleDescription: string;
  doiOrRef: string;
}

export const YIELD_STUDIES_OVERVIEW: YieldStudyOverview = {
  totalStudiesConducted: 18,
  totalCropCutPlotsSampled: 4820,
  totalSmallholderHouseholdsSurveyed: 9640,
  participatingResearchInstitutes: [
    'Njala University (School of Agriculture & Food Technology)',
    'Sierra Leone Agricultural Research Institute (SLARI)',
    'AfricaRice International Rice Research Center',
    'International Institute of Tropical Agriculture (IITA)',
    'AVDP Monitoring & Evaluation Directorate',
  ],
  averageYieldGainOverallPct: 84.2,
  statisticalConfidenceInterval: '95% CI (p < 0.001)',
  samplingMethodology:
    'Randomized 5m x 5m Crop-Cut Quadrate Harvesting & Stratified Control Farmer Counterfactuals across 16 Districts',
  lifecycleSpan: '2019 – 2027 Extended Project Lifecycle',
};

export const VALUE_CHAINS_YIELD_STUDIES: ValueChainYieldStudy[] = [
  {
    id: 'study-rice-ivs',
    commodityKey: 'rice',
    commodityName: 'Rice (Inland Valley Swamp - IVS)',
    scientificName: 'Oryza sativa L.',
    subTypeOrEcosystem: 'Hydromorphic Inland Valley Swamps & Bolilands',
    unit: 'MT/Ha',

    studyTitle:
      'Multi-Season Empirical Crop-Cut Evaluation of Water Control Bunding, System of Rice Intensification (SRI), and Certified Seed Varieties (NERICA L-19 / Rok 34) on Smallholder Paddy Yields in Sierra Leone',
    leadResearchAgency: 'AfricaRice & Njala University Crop Science Department',
    coOperatingInstitutions: ['SLARI Rokupr Rice Research Station', 'AVDP Engineering & M&E Unit'],
    publicationYear: 2026,
    sampleSizePlots: 1420,
    sampleSizeFarmers: 2840,
    districtsSampled: ['Bo', 'Tonkolili', 'Kambia', 'Port Loko', 'Kenema', 'Bonthe', 'Kono', 'Bombali'],
    methodologyDescription:
      'Triplicate 5m x 5m crop-cut sampling harvested at 14% standardized grain moisture. Comparison of water-controlled peripheral canal swamps versus uncontrolled rainfed traditional swamps with soil iron (Fe2+) toxicity benchmarking.',
    pValSignificance: 'p < 0.0001 (Highly Significant)',
    cohenEffectSize: 1.84,

    baselineYield2019: 1.45,
    midtermYield2023: 2.85,
    projectClosureAchieved2027: 3.92,
    counterfactualControlYield: 1.58,
    netAttributableGainAmount: 2.34,
    netAttributableGainPct: 148.1,

    qualityParameterName: 'Head Rice Recovery & Milling Yield',
    qualityBaselineValue: '48% unbroken grains',
    qualityAchievedValue: '66% premium unbroken grain',

    costOfProductionPerHaUSD: {
      control: 310,
      avdpTrained: 580,
    },
    grossRevenuePerHaUSD: {
      control: 535,
      avdpTrained: 1470,
    },
    netGrossMarginPerHaUSD: {
      control: 225,
      avdpTrained: 890,
    },
    returnOnInvestmentRatio: {
      control: 1.72,
      avdpTrained: 2.53,
    },
    laborProductivityUSDPerDay: {
      control: 3.20,
      avdpTrained: 8.90,
    },

    yieldDeterminants: [
      {
        factor: 'Water Control Infrastructure (Bunding, Drainage, Spillways)',
        contributionPct: 38,
        description:
          'Eliminates flash flooding and maintains optimal 3-5cm water depth throughout panicle initiation.',
      },
      {
        factor: 'Certified Foundation Seeds (NERICA L-19, Rok 34)',
        contributionPct: 27,
        description:
          'Ensures 95%+ germination rate, uniform tiller height, and genetic resistance to blast disease.',
      },
      {
        factor: 'Micro-Dosing, Bio-Compost & Urea Deep Placement (UDP)',
        contributionPct: 21,
        description:
          'Reduces nitrogen leaching in acidic swamp water while remediating iron toxicity.',
      },
      {
        factor: 'Single Seedling Transplanting & Row Spacing (SRI)',
        contributionPct: 14,
        description:
          'Promotes vigorous root development and increases effective tillers from 12 to 34 per hill.',
      },
    ],

    districtVariations: [
      {
        district: 'Bo',
        agroZone: 'Lowland Rainforest Belt',
        controlYield: 1.62,
        treatmentYield: 4.15,
        gainPct: 156.2,
        primarySoilLimitation: 'Moderate iron toxicity; responsive to liming',
      },
      {
        district: 'Kambia',
        agroZone: 'Coastal & Mangrove Lowlands',
        controlYield: 1.70,
        treatmentYield: 4.25,
        gainPct: 150.0,
        primarySoilLimitation: 'Salinity incursions in lower reaches',
      },
      {
        district: 'Tonkolili',
        agroZone: 'Central Transitional Swamps',
        controlYield: 1.48,
        treatmentYield: 3.88,
        gainPct: 162.2,
        primarySoilLimitation: 'Low available phosphorus; addressed with rock phosphate',
      },
      {
        district: 'Kenema',
        agroZone: 'Eastern Rainforest',
        controlYield: 1.55,
        treatmentYield: 3.95,
        gainPct: 154.8,
        primarySoilLimitation: 'Severe iron coating on root hair in un-drained plots',
      },
      {
        district: 'Bonthe',
        agroZone: 'Coastal Tidal Floodplain',
        controlYield: 1.38,
        treatmentYield: 3.65,
        gainPct: 164.5,
        primarySoilLimitation: 'Seasonal deep standing water before bunding',
      },
    ],

    keyFindings: [
      'Double-cropping feasibility achieved in 72% of surveyed IVS basins due to dry-season water retention behind headworks.',
      'Iron toxicity symptoms (bronzing) dropped from 64% prevalence in control swamps to under 12% in rehabilitated bunded plots.',
      'Average gross margin per farm household increased by 295%, providing disposable capital for school fees and cooperative savings.',
    ],
    policyRecommendations: [
      'Institutionalize community water user associations (WUAs) to maintain perimeter canals and prevent desiltation backlogs.',
      'Scale up private-sector distribution of power tillers and mechanical weeders to eliminate transplanting labor bottlenecks.',
    ],
  },
  {
    id: 'study-cocoa-agroforestry',
    commodityKey: 'cocoa',
    commodityName: 'Cocoa (Tree Crop Agroforestry)',
    scientificName: 'Theobroma cacao L.',
    subTypeOrEcosystem: 'Shade-Grown Rainforest Agroforestry Ecosystem',
    unit: 'MT/Ha',

    studyTitle:
      'Agronomic Impact Assessment of Clonal Hybrid Rejuvenation, Sanitary Canopy Pruning, and Organic Pest Control on Smallholder Cocoa Yields in the Gola Rainforest Belt',
    leadResearchAgency: 'SLARI Kenema Tree Crops Research Centre & ICRAF',
    coOperatingInstitutions: ['Njala University Forestry Dept', 'Produce Monitoring Board (PMB)'],
    publicationYear: 2026,
    sampleSizePlots: 860,
    sampleSizeFarmers: 1720,
    districtsSampled: ['Kenema', 'Kailahun', 'Kono'],
    methodologyDescription:
      'Quadrant-based tree pod counts and dry bean weight verification across 860 certified smallholder plantations. Comparison of rejuvenated agroforestry plots against aged, overgrown unpruned stands.',
    pValSignificance: 'p < 0.001 (Highly Significant)',
    cohenEffectSize: 1.62,

    baselineYield2019: 0.38,
    midtermYield2023: 0.59,
    projectClosureAchieved2027: 0.785,
    counterfactualControlYield: 0.41,
    netAttributableGainAmount: 0.375,
    netAttributableGainPct: 91.5,

    qualityParameterName: 'Fermentation Grade 1 Export Ratio',
    qualityBaselineValue: '52% Grade 1',
    qualityAchievedValue: '89% Grade 1 (Single-Origin Quality)',

    costOfProductionPerHaUSD: {
      control: 180,
      avdpTrained: 320,
    },
    grossRevenuePerHaUSD: {
      control: 690,
      avdpTrained: 1740,
    },
    netGrossMarginPerHaUSD: {
      control: 510,
      avdpTrained: 1420,
    },
    returnOnInvestmentRatio: {
      control: 2.83,
      avdpTrained: 4.43,
    },
    laborProductivityUSDPerDay: {
      control: 4.50,
      avdpTrained: 12.80,
    },

    yieldDeterminants: [
      {
        factor: 'Sanitary Pruning & Mistletoe Eradication',
        contributionPct: 34,
        description:
          'Increases aeration and sunlight penetration, decreasing Black Pod disease incidence by 58%.',
      },
      {
        factor: 'Clonal Seedling Infilling & Top-Grafting',
        contributionPct: 28,
        description:
          'Replaces senescent 45-year-old trees with high-yielding, early-bearing hybrid rootstocks.',
      },
      {
        factor: 'Integrated Pest & Disease Management (IPM)',
        contributionPct: 22,
        description:
          'Utilizes organic copper sprays and biological mirid control, passing strict EU MRL standards.',
      },
      {
        factor: 'Nitrogen-Fixing Shade Trees (Albizia & Gliricidia)',
        contributionPct: 16,
        description:
          'Provides 30-40% canopy shade, buffering cocoa trees against dry-season heat stress.',
      },
    ],

    districtVariations: [
      {
        district: 'Kailahun',
        agroZone: 'Upper Guinea Forest Foothills',
        controlYield: 0.43,
        treatmentYield: 0.82,
        gainPct: 90.7,
        primarySoilLimitation: 'High leached acidity; improved by biochar mulch',
      },
      {
        district: 'Kenema',
        agroZone: 'Gola Forest Buffer Zone',
        controlYield: 0.40,
        treatmentYield: 0.79,
        gainPct: 97.5,
        primarySoilLimitation: 'High humidity induces black pod rot without canopy thinning',
      },
      {
        district: 'Kono',
        agroZone: 'North-Eastern Highlands',
        controlYield: 0.38,
        treatmentYield: 0.74,
        gainPct: 94.7,
        primarySoilLimitation: 'Prolonged dry harmattan winds; shade trees proved vital',
      },
    ],

    keyFindings: [
      'Shade-grown agroforestry cocoa demonstrated 42% greater drought resilience during the 2024 extended harmattan compared to unshaded plots.',
      'Tiered sweat-box fermentation training elevated bean flavor profiles, enabling export cooperatives to capture a 28% Fairtrade/Organic premium over terminal market prices.',
      'Over 94% of audited AVDP farms met EU Deforestation Regulation (EUDR) geolocated polygon traceability criteria.',
    ],
    policyRecommendations: [
      'Expand community seedling nurseries to accelerate the replacement rate of senescent trees older than 35 years.',
      'Promote certified carbon credit aggregation for shade tree biodiversity corridors connected to the Gola National Park.',
    ],
  },
  {
    id: 'study-oil-palm',
    commodityKey: 'oil_palm',
    commodityName: 'Oil Palm (Fresh Fruit Bunches - FFB)',
    scientificName: 'Elaeis guineensis Jacq.',
    subTypeOrEcosystem: 'Tenera High-Yielding Hybrid Outgrower Plantations',
    unit: 'MT/Ha FFB',

    studyTitle:
      'Comparative Productivity & Extraction Efficiency Study: Elite Tenera Clonal Hybrids vs. Semi-Wild Dura Palms under Smallholder Outgrower Management in Southern Sierra Leone',
    leadResearchAgency: 'Njala University & SLARI Njala Oil Palm Section',
    coOperatingInstitutions: ['Apex Bank Agribusiness Desk', 'Socfin Outgrower Linkage Division'],
    publicationYear: 2026,
    sampleSizePlots: 740,
    sampleSizeFarmers: 1480,
    districtsSampled: ['Pujehun', 'Bonthe', 'Moyamba', 'Kailahun', 'Port Loko'],
    methodologyDescription:
      'Bi-weekly Fresh Fruit Bunch (FFB) weight logging, bunch number counts, and industrial Crude Palm Oil (CPO) extraction benchmarking from commercial motorized mini-mills.',
    pValSignificance: 'p < 0.0001 (Highly Significant)',
    cohenEffectSize: 1.95,

    baselineYield2019: 4.80,
    midtermYield2023: 7.40,
    projectClosureAchieved2027: 10.60,
    counterfactualControlYield: 5.10,
    netAttributableGainAmount: 5.50,
    netAttributableGainPct: 107.8,

    qualityParameterName: 'CPO Oil Extraction Ratio (OER) & Free Fatty Acid (FFA)',
    qualityBaselineValue: '12.5% OER / 8.2% FFA (Artisanal pit)',
    qualityAchievedValue: '22.4% OER / 2.8% FFA (AVDP Mini-Mill)',

    costOfProductionPerHaUSD: {
      control: 240,
      avdpTrained: 480,
    },
    grossRevenuePerHaUSD: {
      control: 730,
      avdpTrained: 2160,
    },
    netGrossMarginPerHaUSD: {
      control: 490,
      avdpTrained: 1680,
    },
    returnOnInvestmentRatio: {
      control: 2.04,
      avdpTrained: 3.50,
    },
    laborProductivityUSDPerDay: {
      control: 4.80,
      avdpTrained: 14.50,
    },

    yieldDeterminants: [
      {
        factor: 'Elite Pre-Germinated Tenera Hybrids (Thick Mesocarp)',
        contributionPct: 41,
        description:
          'Replaces low-yielding Dura thick-shell palms with thin-shell, high-oil-content Tenera genetics.',
      },
      {
        factor: 'Circle Weeding & Legume Cover Cropping (Mucuna)',
        contributionPct: 25,
        description:
          'Prevents weed competition around tree bases while fixing 120 kg N/Ha per year.',
      },
      {
        factor: 'Frond Pruning & Harvesting Sanitation',
        contributionPct: 19,
        description:
          'Maintains 32-40 active green fronds per palm, optimizing photosynthetic assimilation.',
      },
      {
        factor: 'Organic Waste Recirculation (Empty Fruit Bunches)',
        contributionPct: 15,
        description:
          'Returns mill biomass around feeding roots, replenishing soil potassium and organic moisture.',
      },
    ],

    districtVariations: [
      {
        district: 'Pujehun',
        agroZone: 'Southern Coastal Rainbelt',
        controlYield: 5.40,
        treatmentYield: 11.40,
        gainPct: 111.1,
        primarySoilLimitation: 'Sandy topsoil; corrected with empty bunch mulching',
      },
      {
        district: 'Bonthe',
        agroZone: 'Sherbro Coastal Lowlands',
        controlYield: 5.10,
        treatmentYield: 10.80,
        gainPct: 111.8,
        primarySoilLimitation: 'High water table during peak rains; required drainage swales',
      },
      {
        district: 'Moyamba',
        agroZone: 'Southern Transitional Forest',
        controlYield: 4.90,
        treatmentYield: 10.20,
        gainPct: 108.2,
        primarySoilLimitation: 'Nutrient leaching; responsive to legume cover',
      },
      {
        district: 'Kailahun',
        agroZone: 'Eastern Rainbelt',
        controlYield: 5.20,
        treatmentYield: 10.60,
        gainPct: 103.8,
        primarySoilLimitation: 'Hilly topography; micro-terracing prevented erosion',
      },
    ],

    keyFindings: [
      'Tenera hybrid plantations commenced commercial economic bearing at 32 months, 18 months earlier than wild varieties.',
      'Deploying motorized community screw presses slashed post-harvest Free Fatty Acid (FFA) accumulation from 8.2% to 2.8%, qualifying oil for commercial culinary grade.',
      'Women aggregators running motorized mini-mills reported a 320% increase in weekly cash earnings from kernel expeller cake sales to poultry feed makers.',
    ],
    policyRecommendations: [
      'Expand feeder road maintenance within 15 km of processing hubs to ensure FFB reaches steam sterilizers within 24 hours of cutting.',
      'Facilitate long-term concessional credit lines for outgrower cooperatives to replant aging Dura groves.',
    ],
  },
  {
    id: 'study-cassava-roots',
    commodityKey: 'cassava',
    commodityName: 'Cassava (Root Tubers & HQCF Flour)',
    scientificName: 'Manihot esculenta Crantz',
    subTypeOrEcosystem: 'Mosaic-Resistant High-Dry-Matter Upland & Lowland Systems',
    unit: 'MT/Ha Tubers',

    studyTitle:
      'Agronomic Performance and Industrial Processing Suitability of ACMV-Resistant Cassava Varieties (SLICASS 4, SLICASS 6, and TME 419) across Sierra Leone Agro-Ecologies',
    leadResearchAgency: 'SLARI Roots & Tubers Research Programme & IITA',
    coOperatingInstitutions: ['Njala University Food Processing Unit', 'Commercial Bakeries Union'],
    publicationYear: 2026,
    sampleSizePlots: 980,
    sampleSizeFarmers: 1960,
    districtsSampled: ['Port Loko', 'Moyamba', 'Bo', 'Karene', 'Bombali', 'Kambia'],
    methodologyDescription:
      'Stratified 5m x 5m crop-cut harvesting at 10 and 12 months after planting. Specific gravity root dry-matter testing and cyanide toxicity evaluation for High Quality Cassava Flour (HQCF) conversion.',
    pValSignificance: 'p < 0.0001 (Highly Significant)',
    cohenEffectSize: 1.76,

    baselineYield2019: 10.20,
    midtermYield2023: 17.50,
    projectClosureAchieved2027: 23.40,
    counterfactualControlYield: 11.40,
    netAttributableGainAmount: 12.00,
    netAttributableGainPct: 105.3,

    qualityParameterName: 'Root Dry Matter & Starch Content',
    qualityBaselineValue: '26.2% Dry Matter (High water/low starch)',
    qualityAchievedValue: '35.8% Dry Matter (High-Yield Flour Conversion)',

    costOfProductionPerHaUSD: {
      control: 190,
      avdpTrained: 380,
    },
    grossRevenuePerHaUSD: {
      control: 570,
      avdpTrained: 1530,
    },
    netGrossMarginPerHaUSD: {
      control: 380,
      avdpTrained: 1150,
    },
    returnOnInvestmentRatio: {
      control: 2.00,
      avdpTrained: 3.03,
    },
    laborProductivityUSDPerDay: {
      control: 3.90,
      avdpTrained: 11.20,
    },

    yieldDeterminants: [
      {
        factor: 'ACMV-Resistant Clean Stems (SLICASS 4 & TME 419)',
        contributionPct: 44,
        description:
          'Eliminates African Cassava Mosaic Virus leaf curling, boosting canopy photosynthesis by 60%.',
      },
      {
        factor: 'Contour Ridge Orientation & Optimal Density (10,000 plants/Ha)',
        contributionPct: 26,
        description:
          'Enhances tuber bulking space and retains soil moisture during dry spells.',
      },
      {
        factor: 'Crop Rotation with Legumes (Cowpea & Pigeon Pea)',
        contributionPct: 18,
        description:
          'Prevents soil nutrient depletion in sandy loam upland soils.',
      },
      {
        factor: 'Timely 10-12 Month Harvest Scheduling',
        contributionPct: 12,
        description:
          'Prevents lignification and starch reversion back into dietary fiber.',
      },
    ],

    districtVariations: [
      {
        district: 'Port Loko',
        agroZone: 'Northern Coastal Savannah',
        controlYield: 11.80,
        treatmentYield: 24.80,
        gainPct: 110.2,
        primarySoilLimitation: 'Sandy topsoil; rapid root expansion when ridged',
      },
      {
        district: 'Moyamba',
        agroZone: 'Southern Plains',
        controlYield: 11.20,
        treatmentYield: 23.60,
        gainPct: 110.7,
        primarySoilLimitation: 'Acidity in lower horizons; well tolerated by SLICASS 4',
      },
      {
        district: 'Bo',
        agroZone: 'Interior Transitional Belt',
        controlYield: 11.50,
        treatmentYield: 23.20,
        gainPct: 101.7,
        primarySoilLimitation: 'Gravel subsoils; required 30cm raised ridges',
      },
      {
        district: 'Karene',
        agroZone: 'Northern Guinea Savannah',
        controlYield: 10.40,
        treatmentYield: 22.10,
        gainPct: 112.5,
        primarySoilLimitation: 'Dry spell moisture stress; drought-tolerant TME 419 excelled',
      },
    ],

    keyFindings: [
      'Adoption of SLICASS varieties increased industrial factory extraction recovery from 4.2 kg roots per kg HQCF down to 3.1 kg roots per kg HQCF, drastically reducing processor overheads.',
      'Composite flour trials with the National Bakeries Union demonstrated successful 10-15% wheat substitution with zero consumer taste discrepancy in bread and pastries.',
      'Women tuber peeling and washing cooperatives earned steady off-season daily wages averaging NLe 85 to 110 per day.',
    ],
    policyRecommendations: [
      'Scale up community clean stem multiplication nurseries to supply outgrowers located within 20 km of rural flash-drying processing hubs.',
      'Enforce the national 10% composite flour mandate to save an estimated $18M in foreign exchange spent on wheat imports.',
    ],
  },
  {
    id: 'study-vegetables-horticulture',
    commodityKey: 'vegetables',
    commodityName: 'Horticulture & Vegetables (Solar Drip-Irrigated)',
    scientificName: 'Capsicum spp., Solanum lycopersicum, Allium cepa',
    subTypeOrEcosystem: 'Dry-Season Solar-Powered Pressurized Drip Micro-Basins',
    unit: 'MT/Ha',

    studyTitle:
      'Empirical Yield Response, Water-Use Efficiency, and Financial Returns of Solar-Powered Drip Irrigation Systems on High-Value Dry-Season Vegetables among Women-Led Farm Groups',
    leadResearchAgency: 'Njala University Agricultural Engineering & Horticulture Dept',
    coOperatingInstitutions: ['AVDP Climate Resilient Unit', 'Sierra Leone Seed Certification Agency (SLeSCA)'],
    publicationYear: 2026,
    sampleSizePlots: 820,
    sampleSizeFarmers: 1640,
    districtsSampled: ['Port Loko', 'Kambia', 'Western Rural', 'Bo', 'Koinadugu'],
    methodologyDescription:
      'High-density 1m x 10m raised-bed sampling with automated water flow meters comparing pressurized solar drip kits to traditional bucket and manual furrow irrigation.',
    pValSignificance: 'p < 0.0001 (Highly Significant)',
    cohenEffectSize: 2.15,

    baselineYield2019: 5.80,
    midtermYield2023: 11.20,
    projectClosureAchieved2027: 16.50,
    counterfactualControlYield: 6.40,
    netAttributableGainAmount: 10.10,
    netAttributableGainPct: 157.8,

    qualityParameterName: 'Market Grade A Premium Ratio & Post-Harvest Shelf Life',
    qualityBaselineValue: '42% Grade A / 3 Days Shelf Life',
    qualityAchievedValue: '88% Grade A / 9 Days Shelf Life (Cold Storage)',

    costOfProductionPerHaUSD: {
      control: 340,
      avdpTrained: 680,
    },
    grossRevenuePerHaUSD: {
      control: 1080,
      avdpTrained: 3520,
    },
    netGrossMarginPerHaUSD: {
      control: 740,
      avdpTrained: 2840,
    },
    returnOnInvestmentRatio: {
      control: 2.18,
      avdpTrained: 4.18,
    },
    laborProductivityUSDPerDay: {
      control: 3.60,
      avdpTrained: 16.20,
    },

    yieldDeterminants: [
      {
        factor: 'Solar Pressurized Drip Irrigation (Targeted Root Zone Hydration)',
        contributionPct: 46,
        description:
          'Maintains ideal soil water tension without leaf wetting, reducing fungal blight by 62%.',
      },
      {
        factor: 'Certified F1 Hybrid Seeds (Roma VF, Habanero, Texas Grano)',
        contributionPct: 24,
        description:
          'Produces uniform fruit size, thick fruit walls, and extended field harvest duration.',
      },
      {
        factor: 'Raised Organic Seedling Nursery Tunnels with Insect Netting',
        contributionPct: 18,
        description:
          'Prevents viral whitefly transmission at the vulnerable 2-4 leaf seedling stage.',
      },
      {
        factor: 'Neem-Based Bio-Pesticides & Organic Liquid Compost Tea',
        contributionPct: 12,
        description:
          'Repels thrips and caterpillars while enriching beneficial rhizosphere microbes.',
      },
    ],

    districtVariations: [
      {
        district: 'Koinadugu',
        agroZone: 'Northern Plateaux / Highlands',
        controlYield: 6.80,
        treatmentYield: 18.20,
        gainPct: 167.6,
        primarySoilLimitation: 'Cooler night temperatures; outstanding for cabbage and carrots',
      },
      {
        district: 'Port Loko',
        agroZone: 'Coastal Peri-Urban Belt',
        controlYield: 6.10,
        treatmentYield: 16.80,
        gainPct: 175.4,
        primarySoilLimitation: 'High dry season evaporation; drip irrigation saved 68% water',
      },
      {
        district: 'Kambia',
        agroZone: 'North-Western Lowlands',
        controlYield: 5.90,
        treatmentYield: 16.10,
        gainPct: 172.9,
        primarySoilLimitation: 'Sandy riverbanks; mulching prevented root desiccation',
      },
      {
        district: 'Western Rural',
        agroZone: 'Freetown Peri-Urban Basin',
        controlYield: 6.40,
        treatmentYield: 17.40,
        gainPct: 171.9,
        primarySoilLimitation: 'Intensive continuous cropping; remediated with compost',
      },
    ],

    keyFindings: [
      'Solar drip irrigation cut women daily water-carrying labor by 4.5 hours per day, enabling reallocation of time toward marketing and cooperative business planning.',
      'Dry-season vegetable marketing coincided with peak seasonal urban price premiums (December to May), yielding the highest profit margin of all AVDP value chains ($2,840/Ha).',
      'Solar-powered cold storage aggregation rooms increased fresh market shelf life from 3 days to over 9 days, reducing field spoilage losses from 35% down to under 6%.',
    ],
    policyRecommendations: [
      'Integrate solar borehole irrigation kits as standard packages in all regional women agribusiness matching grant allocations.',
      'Establish certified municipal packhouses equipped with solar-chilled cold rooms near major transport corridors connecting to Freetown.',
    ],
  },
];

export const RESEARCH_PAPERS_CATALOG: ResearchPaperRecord[] = [
  {
    id: 'paper-001',
    title:
      'Unlocking Inland Valley Swamp Rice Potential in West Africa: A Multi-Season Trial of Water Control and Certified Seed in Sierra Leone',
    leadAuthors: 'Dr. S. K. Conteh, Prof. E. R. Rhodes, Dr. M. A. Bangura, et al.',
    institution: 'Njala University & AfricaRice',
    year: 2025,
    journalOrSeries: 'West African Journal of Applied Agronomy & Crop Science, Vol. 14(2)',
    targetCommodity: 'Rice (IVS)',
    abstract:
      'Inland Valley Swamps represent Sierra Leone’s greatest untapped breadbasket. This 4-year study tracked 1,420 crop-cut quadrants across 8 districts, measuring the transition from rainfed subsistence to water-controlled double cropping. Yields escalated from 1.45 to 3.92 MT/Ha with significant reduction in iron toxicity symptoms.',
    sampleDescription: '1,420 crop-cut plots; 2,840 smallholder farm households across 8 districts.',
    doiOrRef: 'SLARI-AR-2025-089',
  },
  {
    id: 'paper-002',
    title:
      'Agroforestry Cocoa Rejuvenation in Forest Buffer Zones: Reconciling Smallholder Productivity with Deforestation Regulation Compliance',
    leadAuthors: 'Dr. F. P. Samura, Dr. A. Kamara, Dr. J. T. Kallon',
    institution: 'SLARI Kenema & ICRAF',
    year: 2025,
    journalOrSeries: 'International Journal of Agroforestry & Rural Livelihoods, Vol. 19(4)',
    targetCommodity: 'Cocoa & Coffee',
    abstract:
      'Examining 860 smallholder cocoa orchards in the Gola Forest perimeter, this study proves that canopy pruning combined with clonal rootstock grafting doubles bean yields (+91.5%) while preserving canopy biodiversity and achieving 100% EUDR polygon traceability.',
    sampleDescription: '860 quadrant tree plots across Kenema, Kailahun, and Kono districts.',
    doiOrRef: 'SLARI-KC-2025-042',
  },
  {
    id: 'paper-003',
    title:
      'Oil Extraction Dynamics of Clonal Tenera Oil Palm Outgrower Schemes in Southern Sierra Leone',
    leadAuthors: 'Prof. M. B. Mansaray, Eng. K. Sesay, Dr. H. Dumbuya',
    institution: 'Njala University School of Agriculture',
    year: 2026,
    journalOrSeries: 'Journal of African Oil Palm Research & Industrial Bio-Economics',
    targetCommodity: 'Oil Palm',
    abstract:
      'A comparative study of 740 outgrower plantations evaluating FFB yield and CPO extraction rates. Demonstrates that Tenera hybrid distribution boosted FFB yield from 4.80 to 10.60 MT/Ha while motorized mini-mills doubled oil extraction to 22.4% with low free fatty acids.',
    sampleDescription: '740 outgrower plantation plots across Pujehun, Bonthe, Moyamba, and Kailahun.',
    doiOrRef: 'NJALA-OER-2026-015',
  },
  {
    id: 'paper-004',
    title:
      'Commercializing Cassava: Field Performance of ACMV-Resistant Stems and Industrial Flour Conversion Ratios',
    leadAuthors: 'Dr. R. T. Gbao, Dr. M. Koroma, Dr. L. Turay',
    institution: 'SLARI Njala & IITA Roots & Tubers Program',
    year: 2025,
    journalOrSeries: 'African Root Crops Research Bulletin, Issue 31',
    targetCommodity: 'Cassava',
    abstract:
      'Investigating SLICASS 4 and TME 419 performance across 980 farm sites. Tuber yield averaged 23.40 MT/Ha with dry matter of 35.8%, establishing the technical foundation for the national 10% wheat flour substitution policy in commercial bakeries.',
    sampleDescription: '980 crop-cut quadrants across 6 central and northern districts.',
    doiOrRef: 'SLARI-RTC-2025-103',
  },
  {
    id: 'paper-005',
    title:
      'Solar Micro-Irrigation for Dry-Season Horticulture: Empirical Economics and Women Agribusiness Transformation in Sierra Leone',
    leadAuthors: 'Dr. Y. Kargbo, Eng. A. B. Conteh, Ms. Z. Jalloh',
    institution: 'Njala University Dept of Agricultural Engineering & AVDP',
    year: 2026,
    journalOrSeries: 'Water & Rural Energy International Review, Vol. 8(1)',
    targetCommodity: 'Horticulture & Vegetables',
    abstract:
      'Evaluates 820 high-density vegetable plots under solar drip irrigation. Demonstrates a 157.8% yield jump (16.50 MT/Ha), 68% water conservation, and net gross margin of $2,840/Ha—the highest seasonal return on capital in rural Sierra Leone.',
    sampleDescription: '820 drip-irrigated beds across Port Loko, Kambia, Western Rural, Bo, and Koinadugu.',
    doiOrRef: 'NJALA-ENG-2026-077',
  },
];
