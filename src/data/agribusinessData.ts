/**
 * Sierra Leone AVDP Agribusiness & Market Access Component (Component 2)
 * Comprehensive commercialization, matching grants, private sector off-takers,
 * rural finance (Apex Bank / Community Banks / FSAs), and FBO/ABC enterprise models.
 */

export interface ValueChainAgribusinessProfile {
  chain: string;
  businessModel: string;
  matchingGrantWindow: string;
  grantUtilization: string;
  privateOffTakers: {
    name: string;
    type: 'Commercial Outgrower' | 'Industrial Processor' | 'Export Aggregator' | 'Institutional Buyer';
    location: string;
    annualVolumeContracted: string;
    pricingMechanism: string;
    certifications: string[];
  }[];
  fboToAbcTransition: {
    abcsOperational: number;
    activeFBOsLinked: number;
    commercialServicesProvided: string[];
    governanceStatus: string;
  };
  ruralFinanceAndCredit: {
    partnerFSPs: string;
    loanProduct: string;
    disbursedUSD: string;
    repaymentRatePct: number;
    digitizedCreditScore: boolean;
  };
  commercialAggregationAndStorage: {
    warehousesCount: number;
    storageCapacityMT: number;
    receiptFinancingAvailable: boolean;
    qualityGradingEquipment: string[];
  };
  enterpriseKpis: {
    label: string;
    value: string;
    trend: string;
  }[];
}

export const VALUE_CHAIN_AGRIBUSINESS: Record<string, ValueChainAgribusinessProfile> = {
  rice: {
    chain: 'Rice (IVS & Bolilands)',
    businessModel:
      'Tripartite contract farming: FBO aggregators receive certified seed (ROK-4/NERICA) & mechanization services, delivering paddy directly to commercial parboiling & milling hubs under guaranteed minimum price contracts with institutional off-takers.',
    matchingGrantWindow: 'Window 2 (ABC Processing & Mechanization) & Window 3 (Commercial Millers)',
    grantUtilization: '$3.4M disbursed for 14 commercial de-stoning mills, 48 multi-crop threshers, and 24 mobile drying floors',
    privateOffTakers: [
      {
        name: 'Torma Bum Agro-Industrial Mechanization Hub',
        type: 'Industrial Processor',
        location: 'Bonthe / Southern Province',
        annualVolumeContracted: '12,500 MT Paddy',
        pricingMechanism: 'Floor price tied to national market index + 8% quality premium for <14% moisture',
        certifications: ['SLARI Certified Pure Seed', 'Codex Standards'],
      },
      {
        name: 'National School Feeding & Security Service Offtake',
        type: 'Institutional Buyer',
        location: 'National (Freetown / Bo / Makeni)',
        annualVolumeContracted: '8,000 MT Milled Rice',
        pricingMechanism: 'Government guaranteed forward purchase contract',
        certifications: ['Sierra Leone Standards Bureau Grade 1'],
      },
      {
        name: 'Mambolo Agricultural Cooperative Union Mill',
        type: 'Commercial Outgrower',
        location: 'Kambia Bolilands',
        annualVolumeContracted: '4,200 MT Paddy',
        pricingMechanism: 'Pre-season input credit deduction at harvest parity',
        certifications: ['ECOWAS Regional Grain Quality Standard'],
      },
    ],
    fboToAbcTransition: {
      abcsOperational: 38,
      activeFBOsLinked: 245,
      commercialServicesProvided: [
        'Tractor & power tiller custom hiring',
        'Certified seed & basal fertilizer advance',
        'Mechanical de-stoning & moisture verification',
        'Automated 25kg & 50kg branded bagging',
      ],
      governanceStatus: 'Formally registered agribusiness cooperatives with audited accounts and elected boards',
    },
    ruralFinanceAndCredit: {
      partnerFSPs: 'Apex Bank of Sierra Leone, Marampa Community Bank, Segbwema Community Bank, 18 FSAs',
      loanProduct: 'Seasonal Inventory Credit & Input Working Capital Loan (12% interest)',
      disbursedUSD: '$2,850,000',
      repaymentRatePct: 94.6,
      digitizedCreditScore: true,
    },
    commercialAggregationAndStorage: {
      warehousesCount: 42,
      storageCapacityMT: 28000,
      receiptFinancingAvailable: true,
      qualityGradingEquipment: ['Dickey-John Moisture Testers', 'Aspirator De-stoners', 'Polishing cylinders'],
    },
    enterpriseKpis: [
      { label: 'Avg Smallholder Net Income Increase', value: '+54%', trend: 'positive' },
      { label: 'Post-Harvest Loss Reduction', value: 'Down to 7.8%', trend: 'positive' },
      { label: 'Commercial Mill Capacity Utilization', value: '78.5%', trend: 'positive' },
      { label: 'MGF Matching Capital Mobilized', value: '$1.85M Private', trend: 'positive' },
    ],
  },

  cassava: {
    chain: 'Cassava & HQCF Flour',
    businessModel:
      'Industrial value-addition hub model: Outgrower clusters supply continuous fresh tubers within 36 hours of harvest to commercial High Quality Cassava Flour (HQCF) and gari processing plants tied to brewery and industrial bakery off-takers.',
    matchingGrantWindow: 'Window 2 (Flash Drying & Stainless Hydraulic Presses) & Window 1 (FBO Tricycle Logistics)',
    grantUtilization: '$1.9M allocated for 9 industrial flash dryers, 32 motorized graters, and 65 cargo tricycles',
    privateOffTakers: [
      {
        name: 'Sierra Leone Brewery Limited (Heineken Affiliate)',
        type: 'Industrial Processor',
        location: 'Wellington / Western Area',
        annualVolumeContracted: '6,500 MT Industrial Starch & HQCF',
        pricingMechanism: 'Annual contract with quarterly indexation against imported maize/malt prices',
        certifications: ['ISO 22000 Food Safety', 'Brewing Quality Starch Spec'],
      },
      {
        name: 'Sierra Leone National Bakers Association',
        type: 'Commercial Outgrower',
        location: 'Freetown, Bo, Kenema',
        annualVolumeContracted: '4,800 MT Composite Bread Flour (10% blend)',
        pricingMechanism: '15% discount against imported wheat flour benchmark',
        certifications: ['National Standards Bureau Food Grade'],
      },
      {
        name: 'Gari King Regional Agro-Enterprises',
        type: 'Export Aggregator',
        location: 'Moyamba / Bo Corridor',
        annualVolumeContracted: '3,200 MT Fortified Yellow Gari',
        pricingMechanism: 'Spot market parity + 12% premium for vitamin-A fortified cassava',
        certifications: ['ECOWAS Trade Liberalization Scheme (ETLS)'],
      },
    ],
    fboToAbcTransition: {
      abcsOperational: 24,
      activeFBOsLinked: 168,
      commercialServicesProvided: [
        'Motorized cargo tricycle farm-gate collection',
        'Mechanical washing & hydraulic de-watering',
        'Starch flash-drying and micron sieving',
        'Food-grade polyethylene packaging',
      ],
      governanceStatus: 'Commercial agribusiness enterprises managed under joint FBO-private management contracts',
    },
    ruralFinanceAndCredit: {
      partnerFSPs: 'Apex Bank, Moyamba Community Bank, Port Loko Financial Services Association',
      loanProduct: 'Asset finance for motorized tricycles and processing equipment (18-month tenor)',
      disbursedUSD: '$1,420,000',
      repaymentRatePct: 91.8,
      digitizedCreditScore: true,
    },
    commercialAggregationAndStorage: {
      warehousesCount: 26,
      storageCapacityMT: 14500,
      receiptFinancingAvailable: false,
      qualityGradingEquipment: ['Cyanide Rapid Test Kits', 'Moisture Balances', 'Rotary Stainless Sieves'],
    },
    enterpriseKpis: [
      { label: 'Farm-Gate Tuber Spoilage Rate', value: '4.2% (was 28%)', trend: 'positive' },
      { label: 'Industrial HQCF Offtake Ratio', value: '62% Commercial', trend: 'positive' },
      { label: 'Women Processing Enterprise Revenue', value: '+$340/season', trend: 'positive' },
      { label: 'Imported Wheat Substitution Value', value: '$2.1M Saved/Yr', trend: 'positive' },
    ],
  },

  cocoa: {
    chain: 'Cocoa & Coffee',
    businessModel:
      'High-value traceable export corridor: Farmer cooperatives operate central solar fermentaries and raised drying tables, using GPS farm polygon mapping to guarantee 100% EUDR (deforestation-free) compliance for European specialty chocolate buyers.',
    matchingGrantWindow: 'Window 3 (Specialty Export Processing) & Window 1 (FBO Solar Drying Floors)',
    grantUtilization: '$4.1M invested in 3 regional export conditioning laboratories, 120 wooden sweat boxes, and 45 raised solar drying complexes',
    privateOffTakers: [
      {
        name: 'Biolands / Barry Callebaut Organic Sourcing',
        type: 'Export Aggregator',
        location: 'Kenema & Kailahun',
        annualVolumeContracted: '5,500 MT Organic Dry Beans',
        pricingMechanism: 'World Cocoa Market (ICCO) spot price + $350/MT Fairtrade/Organic premium',
        certifications: ['Fairtrade Certified', 'Rainforest Alliance', 'EU Organic', 'EUDR Traceable'],
      },
      {
        name: 'Nedoil Specialty Cocoa & Tree Crop Division',
        type: 'Commercial Outgrower',
        location: 'Kono & Kenema',
        annualVolumeContracted: '2,800 MT Grade 1 Single-Origin',
        pricingMechanism: 'Quality-tiered pricing based on <7.5% moisture and <5% defective beans',
        certifications: ['UTZ / Rainforest Alliance', 'Fair Labor Association'],
      },
      {
        name: 'Artisan Chocolate European Roasters Consortium',
        type: 'Export Aggregator',
        location: 'Kailahun Moa Basin',
        annualVolumeContracted: '1,200 MT Single-Origin Forest Cocoa',
        pricingMechanism: 'Direct trade fixed premium ($3,800/MT base guaranteed)',
        certifications: ['Single Estate Forest Garden Certificate'],
      },
    ],
    fboToAbcTransition: {
      abcsOperational: 32,
      activeFBOsLinked: 210,
      commercialServicesProvided: [
        'Controlled tiered wooden sweat-box fermentation (6 days)',
        'Raised solar drying table moisture control (<7.5%)',
        'Digital cut-test bean grading & defect counting',
        'GPS polygon traceability tagging per cocoa bag',
      ],
      governanceStatus: 'Cooperative unions with Fairtrade Premium investment committees directing community revenue',
    },
    ruralFinanceAndCredit: {
      partnerFSPs: 'Apex Bank, Kailahun Community Bank, Kenema Microfinance Union, Eastern FSAs',
      loanProduct: 'Pre-harvest working capital & tree crop rehabilitation credit lines',
      disbursedUSD: '$3,600,000',
      repaymentRatePct: 96.2,
      digitizedCreditScore: true,
    },
    commercialAggregationAndStorage: {
      warehousesCount: 36,
      storageCapacityMT: 19000,
      receiptFinancingAvailable: true,
      qualityGradingEquipment: ['Pfeuffer Grain & Bean Moisture Testers', 'Guillotine Cut-Test Knives', 'Pallet aeration racks'],
    },
    enterpriseKpis: [
      { label: 'Export Premium Earned by FBOs', value: '$1.48M/Yr', trend: 'positive' },
      { label: 'EUDR Deforestation Compliance Rate', value: '98.4% Geotagged', trend: 'positive' },
      { label: 'Grade 1 Certified Export Bean Share', value: '89% (was 52%)', trend: 'positive' },
      { label: 'Cooperative Fairtrade Dividend Paid', value: '$620k to Farmers', trend: 'positive' },
    ],
  },

  oil_palm: {
    chain: 'Oil Palm & Crude Palm Oil (CPO)',
    businessModel:
      'Nucleus estate and outgrower integration: Smallholder tree crop cooperatives deliver fresh fruit bunches (FFB) within 24 hours to high-efficiency automated mini-CPO expellers and regional industrial mills, keeping Free Fatty Acid (FFA) levels below 4%.',
    matchingGrantWindow: 'Window 2 (Mini-CPO Extraction Mills) & Window 3 (Industrial Kernel Fractionation)',
    grantUtilization: '$3.8M deployed for 8 mechanized mini-CPO expellers, steam boilers, and 12 bulk storage tank farms',
    privateOffTakers: [
      {
        name: 'Goldtree Sierra Leone Limited',
        type: 'Industrial Processor',
        location: 'Kailahun & Kenema',
        annualVolumeContracted: '18,000 MT Fresh Fruit Bunches (FFB)',
        pricingMechanism: 'Rotterdam CPO index linked pricing with weekly payment via mobile money',
        certifications: ['RSPO Certified Smallholder Supply', 'Organic EU'],
      },
      {
        name: 'Socfin Agricultural Company (Sierra Leone) Ltd',
        type: 'Industrial Processor',
        location: 'Pujehun & Bonthe',
        annualVolumeContracted: '22,000 MT FFB Outgrower Supply',
        pricingMechanism: 'Contractual formula: 11% of spot international CPO price per MT of FFB delivered',
        certifications: ['ISO 14001 Environmental Standard', 'RSPO Mass Balance'],
      },
      {
        name: 'Sierra Leone Domestic Edible Oil & Soap Consortium',
        type: 'Commercial Outgrower',
        location: 'Bo, Freetown, Makeni',
        annualVolumeContracted: '7,500 MT Refined Food-Grade CPO',
        pricingMechanism: 'National wholesale benchmark price + quality retention',
        certifications: ['Sierra Leone Standards Bureau Palm Oil Quality Certificate'],
      },
    ],
    fboToAbcTransition: {
      abcsOperational: 28,
      activeFBOsLinked: 195,
      commercialServicesProvided: [
        'High-yielding certified Tenera nursery seedlings',
        'Motorized sickle harvesting tool leasing',
        'Continuous steam sterilization to arrest FFA',
        'Bulk stainless-steel food-grade drum leasing',
      ],
      governanceStatus: 'Outgrower associations with formal pricing negotiation councils and joint monitoring teams',
    },
    ruralFinanceAndCredit: {
      partnerFSPs: 'Apex Bank, Pujehun Community Bank, Bo-South Financial Services Association',
      loanProduct: 'Medium-term tree crop plantation rehabilitation & replanting loans (36-month term)',
      disbursedUSD: '$2,450,000',
      repaymentRatePct: 93.4,
      digitizedCreditScore: true,
    },
    commercialAggregationAndStorage: {
      warehousesCount: 30,
      storageCapacityMT: 22000,
      receiptFinancingAvailable: true,
      qualityGradingEquipment: ['Digital FFA Titration Kits', 'Moisture Analyzers', 'Food-Grade 20L & 200L Tanks'],
    },
    enterpriseKpis: [
      { label: 'Average Oil Extraction Rate (OER)', value: '21.5% (was 13%)', trend: 'positive' },
      { label: 'Free Fatty Acid (FFA) Level', value: '<3.8% Export Grade', trend: 'positive' },
      { label: 'Smallholder Revenue Growth', value: '+48% per Hectare', trend: 'positive' },
      { label: 'Local Soap Industry Feedstock', value: '100% Domestic', trend: 'positive' },
    ],
  },

  vegetables: {
    chain: 'Horticulture & Vegetables',
    businessModel:
      'Solar-powered dry-season agribusiness: Female and youth horticultural clusters produce high-value vegetables (chili, tomato, bell pepper, onion) during off-peak dry months when market prices rise 250%, supplying refrigerated cold rooms and urban retail chains.',
    matchingGrantWindow: 'Window 1 (Solar Micro-Irrigation Kits & Shadenets) & Window 2 (Solar Cold Hubs)',
    grantUtilization: '$2.6M invested in 85 solar micro-drip borehole systems, 14 nursery shadehouses, and 4 refrigerated solar packhouses',
    privateOffTakers: [
      {
        name: 'Freetown Supermarket & Retailers Association (Monoprix / St. Marys)',
        type: 'Institutional Buyer',
        location: 'Western Area Urban & Rural',
        annualVolumeContracted: '1,800 MT Grade A Fresh Produce',
        pricingMechanism: 'Fixed dry-season contract pricing (2.5x higher than rainy season market glut)',
        certifications: ['Pesticide Residue Free', 'Safe Water Irrigation Certified'],
      },
      {
        name: 'Sierra Tropical Limited (Processing Division)',
        type: 'Industrial Processor',
        location: 'Bo & Southern Corridor',
        annualVolumeContracted: '2,400 MT Fresh Tomatoes & Hot Chili',
        pricingMechanism: 'Contract paste manufacturing pricing with guaranteed minimum floor',
        certifications: ['HACCP Certified Supply Chain'],
      },
      {
        name: 'Lumley & Aberdeen Hospitality Procurement Union',
        type: 'Institutional Buyer',
        location: 'Freetown Hotels & Restaurants',
        annualVolumeContracted: '950 MT Gourmet Salad Greens & Herbs',
        pricingMechanism: 'Weekly standing delivery orders with 48-hour payment terms',
        certifications: ['Good Agricultural Practices (GAP)'],
      },
    ],
    fboToAbcTransition: {
      abcsOperational: 22,
      activeFBOsLinked: 154,
      commercialServicesProvided: [
        'Solar-powered micro-irrigation scheduling and maintenance',
        'Hybrid certified seed seedling nursery raising',
        'Solar-powered walk-in pre-cooling packhouse storage (4°C)',
        'Ventilated plastic crate leasing for damage-free transit',
      ],
      governanceStatus: 'Women-led agribusiness executive committees (82% female leadership across horticultural ABCs)',
    },
    ruralFinanceAndCredit: {
      partnerFSPs: 'Apex Bank, Waterloo Community Bank, Kambia Financial Services Association, Kabala VSLAs',
      loanProduct: 'Micro-working capital credit revolving lines for women growers ($150–$600 per member)',
      disbursedUSD: '$1,750,000',
      repaymentRatePct: 98.1,
      digitizedCreditScore: true,
    },
    commercialAggregationAndStorage: {
      warehousesCount: 18,
      storageCapacityMT: 4500,
      receiptFinancingAvailable: false,
      qualityGradingEquipment: ['Refractometers (Brix sugar)', 'Digital Soil Moisture Probes', 'Solar Cold Rooms'],
    },
    enterpriseKpis: [
      { label: 'Off-Season Crop Margin Uplift', value: '+185% Profit', trend: 'positive' },
      { label: 'Women Smallholder Direct Beneficiaries', value: '64% Women Led', trend: 'positive' },
      { label: 'Perishable Spoilage in Transit', value: 'Down to 5.4%', trend: 'positive' },
      { label: 'Average Loan Repayment Rate', value: '98.1% (Highest)', trend: 'positive' },
    ],
  },
};

export const MATCHING_GRANT_FACILITY_SUMMARY = {
  totalAllocatedUSD: 15800000,
  totalDisbursedUSD: 13950000,
  disbursementRatePct: 88.3,
  privateCapitalLeveragedUSD: 9400000,
  totalBeneficiaryEnterprises: 842,
  windows: [
    {
      id: 'window_1',
      title: 'Window 1: Smallholder FBO Production & Tools',
      target: 'Farmer-Based Organizations (FBOs), women & youth groups',
      grantRange: '$5,000 – $15,000',
      grantSharePct: 70,
      beneficiaryEquityPct: 30,
      disbursedUSD: '$3,850,000',
      supportedItems: 'Power tillers, multi-crop threshers, solar irrigation kits, certified seeds, post-harvest drying tarpaulins',
      enterprisesCount: 490,
      completionRatePct: 92,
    },
    {
      id: 'window_2',
      title: 'Window 2: ABC Processing, Mechanization & Warehousing',
      target: 'Agricultural Business Centres (ABCs) and Cooperative Unions',
      grantRange: '$25,000 – $80,000',
      grantSharePct: 60,
      beneficiaryEquityPct: 40,
      disbursedUSD: '$6,200,000',
      supportedItems: 'Commercial integrated rice mills, mini-CPO expellers, flash dryers, solar cold hubs, 500 MT storage sheds',
      enterprisesCount: 118,
      completionRatePct: 86,
    },
    {
      id: 'window_3',
      title: 'Window 3: Commercial Off-taker & Agro-Enterprise Partnerships',
      target: 'Commercial agri-SMEs, outgrower aggregators, export processing firms',
      grantRange: '$100,000 – $250,000',
      grantSharePct: 40,
      beneficiaryEquityPct: 60,
      disbursedUSD: '$3,900,000',
      supportedItems: 'Quality testing labs, EUDR geofencing digital traceability, industrial boilers, export conditioning lines',
      enterprisesCount: 34,
      completionRatePct: 84,
    },
  ],
};

export const RURAL_FINANCE_ECOSYSTEM = {
  apexBankOverview:
    'Apex Bank of Sierra Leone serves as the financial intermediary for AVDP rural credit, supervising 59 Community Banks (CBs) and Financial Services Associations (FSAs) across all 16 districts.',
  totalRuralClientsReached: 46200,
  womenBorrowersPct: 54.2,
  totalLoansDisbursedUSD: 10620000,
  averagePortfolioAtRisk30Days: 4.8,
  participatingInstitutions: [
    { name: 'Kailahun Community Bank', district: 'Kailahun', activeAgriLoans: '$1.42M', portfolioQualityPct: 96.5 },
    { name: 'Segbwema Community Bank', district: 'Kenema', activeAgriLoans: '$1.28M', portfolioQualityPct: 95.8 },
    { name: 'Marampa Community Bank', district: 'Port Loko', activeAgriLoans: '$1.15M', portfolioQualityPct: 94.2 },
    { name: 'Moyamba Community Bank', district: 'Moyamba', activeAgriLoans: '$980k', portfolioQualityPct: 93.9 },
    { name: 'Pujehun Financial Services Association', district: 'Pujehun', activeAgriLoans: '$890k', portfolioQualityPct: 94.8 },
    { name: 'Kabala Financial Services Association', district: 'Koinadugu', activeAgriLoans: '$920k', portfolioQualityPct: 97.4 },
    { name: 'Kambia Boliland FSA', district: 'Kambia', activeAgriLoans: '$840k', portfolioQualityPct: 95.1 },
    { name: 'Kono Agro-Growers FSA', district: 'Kono', activeAgriLoans: '$760k', portfolioQualityPct: 93.6 },
  ],
};
