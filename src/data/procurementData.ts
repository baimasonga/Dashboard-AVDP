/**
 * Sierra Leone AVDP Procurement & Contract Management Data
 * In accordance with IFAD Project Procurement Guidelines and NPPA standards.
 * Extended Project Lifecycle: 2019–2027
 */

export interface ProcurementContract {
  id: string;
  contractNumber: string;
  title: string;
  category: 'Civil Works' | 'Goods & Machinery' | 'Consulting Services' | 'Non-Consulting Services';
  procurementMethod: 'ICB' | 'NCB' | 'QCBS' | 'CQS' | 'RFQ' | 'Direct Contracting';
  awardedContractorOrFirm: string;
  origin: 'National (Sierra Leone)' | 'International (Regional / Global)';
  contractValueUSD: number;
  engineersEstimateUSD: number;
  savingsUSD: number;
  awardDate: string; // YYYY-MM-DD
  contractualCompletionDate: string;
  actualOrAnticipatedCompletionDate: string;
  executionStatus: 'Completed' | 'Ongoing / On-Track' | 'Under Defect Liability' | 'Under Evaluation' | 'Final Inspection';
  completionPct: number;
  ifadNoObjectionDate: string;
  districtCovered: string;
  deliverablesSummary: string;
}

export interface ProcurementCategorySummary {
  category: 'Civil Works' | 'Goods & Machinery' | 'Consulting Services' | 'Non-Consulting Services';
  contractsCount: number;
  totalCommittedUSD: number;
  totalDisbursedUSD: number;
  averageExecutionPct: number;
  localContentPct: number;
}

export interface ProcurementMethodMetric {
  method: string;
  fullName: string;
  contractsCount: number;
  totalValueUSD: number;
  averageLeadTimeDays: number;
  ifadPriorReviewCount: number;
  ifadPostReviewCount: number;
}

export const PROCUREMENT_OVERVIEW_METRICS = {
  totalProcurementValueUSD: 64820000,
  totalContractsAwarded: 156,
  completedContractsCount: 118,
  activeOngoingContractsCount: 38,
  contractsOnSchedulePct: 89.7,
  localSupplierSharePct: 68.2, // Value awarded to Sierra Leonean registered firms
  averageProcurementLeadTimeDays: 82, // From bidding document issue to contract signing
  ifadLeadTimeTargetDays: 90,
  cumulativeCostSavingsUSD: 3450000, // Compared to initial engineer estimates
  disputeFreeExecutionRatePct: 98.5,
  ifadNoObjectionComplianceRatePct: 100.0,
  lifecycleSpan: '2019–2027',
};

export const PROCUREMENT_CATEGORIES_SUMMARY: ProcurementCategorySummary[] = [
  {
    category: 'Civil Works',
    contractsCount: 42,
    totalCommittedUSD: 36420000,
    totalDisbursedUSD: 31250000,
    averageExecutionPct: 88.5,
    localContentPct: 74.0,
  },
  {
    category: 'Goods & Machinery',
    contractsCount: 58,
    totalCommittedUSD: 18190000,
    totalDisbursedUSD: 16840000,
    averageExecutionPct: 94.2,
    localContentPct: 61.5,
  },
  {
    category: 'Consulting Services',
    contractsCount: 36,
    totalCommittedUSD: 7810000,
    totalDisbursedUSD: 7120000,
    averageExecutionPct: 92.0,
    localContentPct: 65.0,
  },
  {
    category: 'Non-Consulting Services',
    contractsCount: 20,
    totalCommittedUSD: 2400000,
    totalDisbursedUSD: 2210000,
    averageExecutionPct: 96.5,
    localContentPct: 88.0,
  },
];

export const PROCUREMENT_METHODS_METRICS: ProcurementMethodMetric[] = [
  {
    method: 'NCB',
    fullName: 'National Competitive Bidding',
    contractsCount: 78,
    totalValueUSD: 28450000,
    averageLeadTimeDays: 74,
    ifadPriorReviewCount: 14,
    ifadPostReviewCount: 64,
  },
  {
    method: 'ICB',
    fullName: 'International Competitive Bidding',
    contractsCount: 18,
    totalValueUSD: 24650000,
    averageLeadTimeDays: 115,
    ifadPriorReviewCount: 18,
    ifadPostReviewCount: 0,
  },
  {
    method: 'QCBS',
    fullName: 'Quality & Cost-Based Selection',
    contractsCount: 22,
    totalValueUSD: 6250000,
    averageLeadTimeDays: 92,
    ifadPriorReviewCount: 16,
    ifadPostReviewCount: 6,
  },
  {
    method: 'CQS',
    fullName: "Consultant's Qualification Selection",
    contractsCount: 14,
    totalValueUSD: 1560000,
    averageLeadTimeDays: 52,
    ifadPriorReviewCount: 4,
    ifadPostReviewCount: 10,
  },
  {
    method: 'RFQ',
    fullName: 'Request for Quotations / Shopping',
    contractsCount: 20,
    totalValueUSD: 2480000,
    averageLeadTimeDays: 38,
    ifadPriorReviewCount: 2,
    ifadPostReviewCount: 18,
  },
  {
    method: 'Direct Contracting',
    fullName: 'Direct Contracting (Proprietary / Emergency)',
    contractsCount: 4,
    totalValueUSD: 1430000,
    averageLeadTimeDays: 45,
    ifadPriorReviewCount: 4,
    ifadPostReviewCount: 0,
  },
];

export const REPRESENTATIVE_CONTRACTS: ProcurementContract[] = [
  {
    id: 'cnt_cw_01',
    contractNumber: 'AVDP/CW/NCB/2021/04',
    title: 'Rehabilitation of 48.5 km Feeder Roads & 2 Reinforced Concrete Bridges (Lot 1)',
    category: 'Civil Works',
    procurementMethod: 'NCB',
    awardedContractorOrFirm: 'Salcost Construction Sierra Leone Ltd',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 2850000,
    engineersEstimateUSD: 3100000,
    savingsUSD: 250000,
    awardDate: '2021-04-12',
    contractualCompletionDate: '2022-10-30',
    actualOrAnticipatedCompletionDate: '2022-11-15',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2021-03-28',
    districtCovered: 'Kenema & Kailahun',
    deliverablesSummary: '48.5 km standard gravel road with 24 pipe culverts and 2 two-lane RC stream bridges facilitating cocoa transport.',
  },
  {
    id: 'cnt_cw_02',
    contractNumber: 'AVDP/CW/ICB/2022/01',
    title: 'Development of 1,200 Ha Inland Valley Swamps (IVS) Water Control & Bunding (Package A)',
    category: 'Civil Works',
    procurementMethod: 'ICB',
    awardedContractorOrFirm: 'China Geo-Engineering Corporation (CGC)',
    origin: 'International (Regional / Global)',
    contractValueUSD: 4680000,
    engineersEstimateUSD: 4950000,
    savingsUSD: 270000,
    awardDate: '2022-02-18',
    contractualCompletionDate: '2023-12-31',
    actualOrAnticipatedCompletionDate: '2024-01-20',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2022-01-30',
    districtCovered: 'Bo, Pujehun & Moyamba',
    deliverablesSummary: '1,200 ha perimeter bunding, spillways, main diversion canals, and water gates for double-cropping rice.',
  },
  {
    id: 'cnt_gd_03',
    contractNumber: 'AVDP/GD/ICB/2022/06',
    title: 'Supply, Delivery & Commissioning of 120 Units Walking Tractors and 60 Rice Threshers',
    category: 'Goods & Machinery',
    procurementMethod: 'ICB',
    awardedContractorOrFirm: 'Sonalika International Agro Machinery Ltd',
    origin: 'International (Regional / Global)',
    contractValueUSD: 1940000,
    engineersEstimateUSD: 2100000,
    savingsUSD: 160000,
    awardDate: '2022-07-05',
    contractualCompletionDate: '2023-01-15',
    actualOrAnticipatedCompletionDate: '2022-12-28',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2022-06-18',
    districtCovered: 'Multi-District (16 Districts)',
    deliverablesSummary: '120 diesel walking power tillers with reversible plows, rotary blades, and 60 mobile multi-crop thresher units.',
  },
  {
    id: 'cnt_cw_04',
    contractNumber: 'AVDP/CW/NCB/2023/02',
    title: 'Construction of 24 Solar-Powered Multi-Purpose Boreholes for Drinking & Drip Irrigation',
    category: 'Civil Works',
    procurementMethod: 'NCB',
    awardedContractorOrFirm: 'Apex Hydrological & Solar Engineering Co.',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 1820000,
    engineersEstimateUSD: 1950000,
    savingsUSD: 130000,
    awardDate: '2023-03-10',
    contractualCompletionDate: '2024-04-30',
    actualOrAnticipatedCompletionDate: '2024-05-15',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2023-02-22',
    districtCovered: 'Port Loko, Kambia, Bonthe & Kono',
    deliverablesSummary: '24 deep boreholes (70-95m) equipped with 3.2kWp Grundfos solar submersible pumps, 10,000L elevated tanks, and community taps.',
  },
  {
    id: 'cnt_cs_05',
    contractNumber: 'AVDP/CS/QCBS/2021/01',
    title: 'Consultancy for Comprehensive Socio-Economic Baseline Survey & GIS Mapping',
    category: 'Consulting Services',
    procurementMethod: 'QCBS',
    awardedContractorOrFirm: 'Njala University Consulting Consortium',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 520000,
    engineersEstimateUSD: 580000,
    savingsUSD: 60000,
    awardDate: '2021-01-15',
    contractualCompletionDate: '2021-08-30',
    actualOrAnticipatedCompletionDate: '2021-08-25',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2020-12-20',
    districtCovered: 'All 16 Districts',
    deliverablesSummary: 'Baseline dataset covering 4,500 households, crop yield benchmarks, GPS coordinates of 240 ABCs, and GIS geodatabase.',
  },
  {
    id: 'cnt_gd_06',
    contractNumber: 'AVDP/GD/NCB/2023/08',
    title: 'Procurement and Distribution of 450,000 Clonal Tenera Oil Palm Seedlings (NIFOR Certified)',
    category: 'Goods & Machinery',
    procurementMethod: 'NCB',
    awardedContractorOrFirm: 'Goldtree Agro-Industrial Seedlings Enterprise',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 1350000,
    engineersEstimateUSD: 1420000,
    savingsUSD: 70000,
    awardDate: '2023-05-20',
    contractualCompletionDate: '2024-06-30',
    actualOrAnticipatedCompletionDate: '2024-06-15',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2023-04-28',
    districtCovered: 'Kenema, Bo, Pujehun & Moyamba',
    deliverablesSummary: 'Certified high-yielding Tenera oil palm polybag seedlings delivered to 3,000 outgrowers across 4 southern/eastern districts.',
  },
  {
    id: 'cnt_cw_07',
    contractNumber: 'AVDP/CW/NCB/2024/01',
    title: 'Construction of 12 Agribusiness Center (ABC) Warehouses & Solar Drying Floors (Lot 3)',
    category: 'Civil Works',
    procurementMethod: 'NCB',
    awardedContractorOrFirm: 'Bonthe Engineering & General Supplies Ltd',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 1650000,
    engineersEstimateUSD: 1780000,
    savingsUSD: 130000,
    awardDate: '2024-02-14',
    contractualCompletionDate: '2025-06-30',
    actualOrAnticipatedCompletionDate: '2025-07-15',
    executionStatus: 'Under Defect Liability',
    completionPct: 100,
    ifadNoObjectionDate: '2024-01-25',
    districtCovered: 'Bonthe, Moyamba & Bo',
    deliverablesSummary: '12 standard 250-ton ventilated seed and produce storage warehouses with perimeter fencing and 400m² concrete solar drying floors.',
  },
  {
    id: 'cnt_cs_08',
    contractNumber: 'AVDP/CS/QCBS/2024/03',
    title: 'Consultancy for Gender Action Learning System (GALS) Household Mentorship & M&E Scaling',
    category: 'Consulting Services',
    procurementMethod: 'QCBS',
    awardedContractorOrFirm: 'Oxfam / Community Action for Development (CAD)',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 440000,
    engineersEstimateUSD: 480000,
    savingsUSD: 40000,
    awardDate: '2024-04-10',
    contractualCompletionDate: '2026-03-31',
    actualOrAnticipatedCompletionDate: '2026-04-15',
    executionStatus: 'Ongoing / On-Track',
    completionPct: 82,
    ifadNoObjectionDate: '2024-03-18',
    districtCovered: 'Kenema, Kailahun, Kono & Bo',
    deliverablesSummary: 'Rolling out GALS methodology across 8,500 farming households, training 340 peer champions, and intra-household equity audits.',
  },
  {
    id: 'cnt_cw_09',
    contractNumber: 'AVDP/CW/NCB/2025/03',
    title: 'Periodic Maintenance & Culvert Armor of 36.2 km Feeder Roads in Kenema Cocoa Corridor',
    category: 'Civil Works',
    procurementMethod: 'NCB',
    awardedContractorOrFirm: 'Gola Forest Civil Contractors Ltd',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 1420000,
    engineersEstimateUSD: 1510000,
    savingsUSD: 90000,
    awardDate: '2025-03-08',
    contractualCompletionDate: '2026-11-30',
    actualOrAnticipatedCompletionDate: '2026-12-15',
    executionStatus: 'Ongoing / On-Track',
    completionPct: 78,
    ifadNoObjectionDate: '2025-02-14',
    districtCovered: 'Kenema',
    deliverablesSummary: 'Reshaping, spot gravelling, and headwall masonry for all stream-crossing culverts along the Tunkia-Gaura chiefdom route.',
  },
  {
    id: 'cnt_gd_10',
    contractNumber: 'AVDP/GD/RFQ/2025/11',
    title: 'Supply of 65 Heavy-Duty Field Motorbikes (Yamaha AG200) for Agricultural Extension Officers',
    category: 'Goods & Machinery',
    procurementMethod: 'RFQ',
    awardedContractorOrFirm: 'Sierra Leone National Trading Motors Co.',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 312000,
    engineersEstimateUSD: 330000,
    savingsUSD: 18000,
    awardDate: '2025-06-15',
    contractualCompletionDate: '2025-09-30',
    actualOrAnticipatedCompletionDate: '2025-09-12',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2025-05-28',
    districtCovered: 'All 16 Districts',
    deliverablesSummary: '65 off-road 200cc motorbikes equipped with helmets, protective gear, and GPS tracking brackets for remote field access.',
  },
  {
    id: 'cnt_cs_11',
    contractNumber: 'AVDP/CS/CQS/2026/02',
    title: 'Project Lifecycle Extended Endline Impact Evaluation & Beneficiary Living Standards Assessment',
    category: 'Consulting Services',
    procurementMethod: 'CQS',
    awardedContractorOrFirm: 'Institute of Development Studies & Agri-Policy Sierra Leone',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 395000,
    engineersEstimateUSD: 420000,
    savingsUSD: 25000,
    awardDate: '2026-02-10',
    contractualCompletionDate: '2027-06-30',
    actualOrAnticipatedCompletionDate: '2027-06-30',
    executionStatus: 'Ongoing / On-Track',
    completionPct: 55,
    ifadNoObjectionDate: '2026-01-18',
    districtCovered: 'All 16 Districts',
    deliverablesSummary: 'Rigorous quasi-experimental impact evaluation measuring poverty reduction, food security, income gains, and climate resilience.',
  },
  {
    id: 'cnt_nc_12',
    contractNumber: 'AVDP/NC/RFQ/2025/07',
    title: 'Logistics, Venue Management & Field Materials for 280 Farmer Field School Graduation Ceremonies',
    category: 'Non-Consulting Services',
    procurementMethod: 'RFQ',
    awardedContractorOrFirm: 'Makeni Event Logistics & Rural Communications Hub',
    origin: 'National (Sierra Leone)',
    contractValueUSD: 185000,
    engineersEstimateUSD: 198000,
    savingsUSD: 13000,
    awardDate: '2025-08-12',
    contractualCompletionDate: '2025-12-15',
    actualOrAnticipatedCompletionDate: '2025-12-10',
    executionStatus: 'Completed',
    completionPct: 100,
    ifadNoObjectionDate: '2025-07-30',
    districtCovered: 'Northern & North Western Districts',
    deliverablesSummary: 'Audio-visual logistics, certificates, training kits, and community facilitation for 8,400 graduating farmers.',
  },
];
