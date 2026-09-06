/**
 * Sierra Leone AVDP Financial Information & Budget Execution Data
 * Financing sources (IFAD, OFID, Adaptation Fund, GoSL, Private Sector),
 * Component allocations, annual disbursement trajectory (2019–2027),
 * and financial audit compliance indicators.
 */

export interface FundingSource {
  id: string;
  donorName: string;
  type: 'Multilateral Loan' | 'Multilateral Grant' | 'Co-Financing' | 'Counterpart Contribution' | 'Beneficiary Equity';
  totalCommitmentUSD: number;
  disbursedUSD: number;
  disbursementRatePct: number;
  undrawnBalanceUSD: number;
  currency: string;
  notes: string;
}

export interface ComponentExpenditure {
  componentCode: string;
  componentName: string;
  budgetAllocatedUSD: number;
  actualExpenditureUSD: number;
  expenditureRatePct: number;
  committedContractsUSD: number;
  remainingBalanceUSD: number;
  leadResponsibleAgency: string;
  subComponents: {
    title: string;
    allocatedUSD: number;
    spentUSD: number;
  }[];
}

export interface AnnualDisbursementRecord {
  year: number;
  status: 'Historical Actual' | 'Extended Lifecycle Closure';
  annualTargetUSD: number;
  actualDisbursedUSD: number;
  cumulativeDisbursedUSD: number;
  cumulativeRatePct: number;
  counterpartContributionUSD: number;
  externalAuditOpinion: 'Unqualified (Clean)' | 'Pending Verification';
}

export interface MatchingGrantSummary {
  windowName: string;
  totalFundUSD: number;
  disbursedUSD: number;
  beneficiaryEnterprisesCount: number;
  womenLedEnterprisesCount: number;
  youthLedEnterprisesCount: number;
  revolvingRepaymentRatePct: number;
  averageGrantUSD: number;
}

export const FINANCE_OVERVIEW_METRICS = {
  totalFinancingEnvelopeUSD: 105820000,
  cumulativeDisbursementUSD: 88014000,
  overallDisbursementRatePct: 83.17,
  uncommittedBalanceUSD: 17806000,
  counterpartGoSLCommittedUSD: 12000000,
  counterpartGoSLDisbursedUSD: 9800000,
  counterpartDisbursementRatePct: 81.67,
  ruralFinanceRevolvingFundUSD: 5800000,
  matchingGrantsAwardedUSD: 4950000,
  auditsCompletedCount: 7, // 2019-2025 completed, 2026 underway
  cleanAuditRatePct: 100.0,
  interimFinancialReportCompliancePct: 100.0,
  fxRateUsdToNle: 22.85, // Sierra Leone New Leone exchange rate
  extendedLifecycleSpan: '2019–2027',
};

export const FUNDING_SOURCES: FundingSource[] = [
  {
    id: 'src_ifad_loan',
    donorName: 'IFAD Loan (Performance-Based Allocation)',
    type: 'Multilateral Loan',
    totalCommitmentUSD: 45000000,
    disbursedUSD: 38700000,
    disbursementRatePct: 86.0,
    undrawnBalanceUSD: 6300000,
    currency: 'SDR / USD Equivalent',
    notes: 'Highly concessional financing supporting core agricultural infrastructure, IVS rehabilitation, and value chain development.',
  },
  {
    id: 'src_ifad_grant',
    donorName: 'IFAD Special Climate & Youth Grant',
    type: 'Multilateral Grant',
    totalCommitmentUSD: 5000000,
    disbursedUSD: 4650000,
    disbursementRatePct: 93.0,
    undrawnBalanceUSD: 350000,
    currency: 'USD',
    notes: 'Grant envelope targeted specifically toward youth agribusiness incubation, women GALS equity, and climate-smart innovation.',
  },
  {
    id: 'src_ofid',
    donorName: 'OPEC Fund for International Development (OFID)',
    type: 'Co-Financing',
    totalCommitmentUSD: 20000000,
    disbursedUSD: 16200000,
    disbursementRatePct: 81.0,
    undrawnBalanceUSD: 3800000,
    currency: 'USD',
    notes: 'Co-financing facility specifically funding feeder road rehabilitation lots (420+ km) and rural market warehouse hubs.',
  },
  {
    id: 'src_adaptation_fund',
    donorName: 'Adaptation Fund (Climate Resilience Window)',
    type: 'Multilateral Grant',
    totalCommitmentUSD: 9820000,
    disbursedUSD: 8454000,
    disbursementRatePct: 86.1,
    undrawnBalanceUSD: 1366000,
    currency: 'USD',
    notes: 'Dedicated grant for solar-powered multi-purpose boreholes, climate-proofing Inland Valley Swamps, and agroforestry demo plots.',
  },
  {
    id: 'src_gosl_counterpart',
    donorName: 'Government of Sierra Leone (GoSL) Counterpart',
    type: 'Counterpart Contribution',
    totalCommitmentUSD: 12000000,
    disbursedUSD: 9800000,
    disbursementRatePct: 81.7,
    undrawnBalanceUSD: 2200000,
    currency: 'SLL / New Leone & Tax Exemptions',
    notes: 'National budgetary appropriations, duties exemptions, and operational support through the Ministry of Agriculture & Food Security (MAFS).',
  },
  {
    id: 'src_private_beneficiaries',
    donorName: 'Beneficiary FBOs & Rural Financial Institutions',
    type: 'Beneficiary Equity',
    totalCommitmentUSD: 14000000,
    disbursedUSD: 10210000,
    disbursementRatePct: 72.9,
    undrawnBalanceUSD: 3790000,
    currency: 'USD Equivalent',
    notes: 'Farmer-Based Organization sweat equity, labor, matching fund contributions, and Apex Bank / Community Bank credit co-financing.',
  },
];

export const COMPONENT_EXPENDITURES: ComponentExpenditure[] = [
  {
    componentCode: 'COMP-1',
    componentName: 'Climate-Resilient Agricultural Production & Productivity',
    budgetAllocatedUSD: 46200000,
    actualExpenditureUSD: 39270000,
    expenditureRatePct: 85.0,
    committedContractsUSD: 43500000,
    remainingBalanceUSD: 6930000,
    leadResponsibleAgency: 'MAFS Technical Directorate & AVDP Engineering Unit',
    subComponents: [
      {
        title: 'Inland Valley Swamp (IVS) Development & Water Control',
        allocatedUSD: 21500000,
        spentUSD: 18705000,
      },
      {
        title: 'Tree Crop Rehabilitation (Cocoa & Tenera Oil Palm)',
        allocatedUSD: 14200000,
        spentUSD: 12212000,
      },
      {
        title: 'Farmer Field Schools (FFS) & Extension Services',
        allocatedUSD: 10500000,
        spentUSD: 8353000,
      },
    ],
  },
  {
    componentCode: 'COMP-2',
    componentName: 'Agribusiness Development & Market Access Infrastructure',
    budgetAllocatedUSD: 34500000,
    actualExpenditureUSD: 28290000,
    expenditureRatePct: 82.0,
    committedContractsUSD: 31200000,
    remainingBalanceUSD: 6210000,
    leadResponsibleAgency: 'Sierra Leone Roads Authority (SLRA) & AVDP Value Chain Unit',
    subComponents: [
      {
        title: 'Feeder Roads Rehabilitation & Stream Crossings (420+ km)',
        allocatedUSD: 22000000,
        spentUSD: 18480000,
      },
      {
        title: 'Agribusiness Centers (ABCs) & Processing Machinery',
        allocatedUSD: 8500000,
        spentUSD: 6885000,
      },
      {
        title: 'Market Information Systems & Contract Farming Linkages',
        allocatedUSD: 4000000,
        spentUSD: 2925000,
      },
    ],
  },
  {
    componentCode: 'COMP-3',
    componentName: 'Rural Financial Services & Matching Grant Window',
    budgetAllocatedUSD: 15820000,
    actualExpenditureUSD: 12656000,
    expenditureRatePct: 80.0,
    committedContractsUSD: 14100000,
    remainingBalanceUSD: 3164000,
    leadResponsibleAgency: 'Apex Bank Sierra Leone & Commercial Partner Banks',
    subComponents: [
      {
        title: 'Matching Grant Facilities for Women & Youth Enterprises',
        allocatedUSD: 7500000,
        spentUSD: 6225000,
      },
      {
        title: 'Community Bank & FSA Institutional Capacity Building',
        allocatedUSD: 4820000,
        spentUSD: 3856000,
      },
      {
        title: 'Agricultural Lending Risk Mitigation & Credit Guarantees',
        allocatedUSD: 3500000,
        spentUSD: 2575000,
      },
    ],
  },
  {
    componentCode: 'COMP-4',
    componentName: 'Project Management, Policy Coordination & M&E',
    budgetAllocatedUSD: 9300000,
    actualExpenditureUSD: 8463000,
    expenditureRatePct: 91.0,
    committedContractsUSD: 8950000,
    remainingBalanceUSD: 8370000,
    leadResponsibleAgency: 'AVDP National Project Management Unit (NPMU) Kenema / Freetown',
    subComponents: [
      {
        title: 'Monitoring, Evaluation, GIS Tracking & Impact Evaluation',
        allocatedUSD: 3800000,
        spentUSD: 3534000,
      },
      {
        title: 'Financial Management, Audits & Environmental Safeguards',
        allocatedUSD: 2900000,
        spentUSD: 2639000,
      },
      {
        title: 'NPMU Operations, Field Vehicles & Steering Committee',
        allocatedUSD: 2600000,
        spentUSD: 2290000,
      },
    ],
  },
];

export const ANNUAL_DISBURSEMENTS: AnnualDisbursementRecord[] = [
  {
    year: 2019,
    status: 'Historical Actual',
    annualTargetUSD: 4500000,
    actualDisbursedUSD: 3850000,
    cumulativeDisbursedUSD: 3850000,
    cumulativeRatePct: 3.64,
    counterpartContributionUSD: 450000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2020,
    status: 'Historical Actual',
    annualTargetUSD: 8200000,
    actualDisbursedUSD: 7450000,
    cumulativeDisbursedUSD: 11300000,
    cumulativeRatePct: 10.68,
    counterpartContributionUSD: 820000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2021,
    status: 'Historical Actual',
    annualTargetUSD: 13500000,
    actualDisbursedUSD: 12100000,
    cumulativeDisbursedUSD: 23400000,
    cumulativeRatePct: 22.11,
    counterpartContributionUSD: 1250000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2022,
    status: 'Historical Actual',
    annualTargetUSD: 17800000,
    actualDisbursedUSD: 16400000,
    cumulativeDisbursedUSD: 39800000,
    cumulativeRatePct: 37.61,
    counterpartContributionUSD: 1680000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2023,
    status: 'Historical Actual',
    annualTargetUSD: 19500000,
    actualDisbursedUSD: 18200000,
    cumulativeDisbursedUSD: 58000000,
    cumulativeRatePct: 54.81,
    counterpartContributionUSD: 1950000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2024,
    status: 'Historical Actual',
    annualTargetUSD: 16200000,
    actualDisbursedUSD: 14850000,
    cumulativeDisbursedUSD: 72850000,
    cumulativeRatePct: 68.84,
    counterpartContributionUSD: 1720000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2025,
    status: 'Historical Actual',
    annualTargetUSD: 12400000,
    actualDisbursedUSD: 11200000,
    cumulativeDisbursedUSD: 84050000,
    cumulativeRatePct: 79.43,
    counterpartContributionUSD: 1350000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2026,
    status: 'Historical Actual',
    annualTargetUSD: 7500000,
    actualDisbursedUSD: 6850000,
    cumulativeDisbursedUSD: 90900000,
    cumulativeRatePct: 85.90,
    counterpartContributionUSD: 980000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
  {
    year: 2027,
    status: 'Extended Lifecycle Closure',
    annualTargetUSD: 6220000,
    actualDisbursedUSD: 5800000,
    cumulativeDisbursedUSD: 96700000,
    cumulativeRatePct: 91.38,
    counterpartContributionUSD: 850000,
    externalAuditOpinion: 'Unqualified (Clean)',
  },
];

export const MATCHING_GRANT_WINDOWS: MatchingGrantSummary[] = [
  {
    windowName: 'Window 1: Women Agribusiness Start-up & Processing Grants',
    totalFundUSD: 2500000,
    disbursedUSD: 2310000,
    beneficiaryEnterprisesCount: 540,
    womenLedEnterprisesCount: 540,
    youthLedEnterprisesCount: 195,
    revolvingRepaymentRatePct: 94.2,
    averageGrantUSD: 4277,
  },
  {
    windowName: 'Window 2: Youth Agricultural Mechanization & Tillage Services',
    totalFundUSD: 1800000,
    disbursedUSD: 1650000,
    beneficiaryEnterprisesCount: 220,
    womenLedEnterprisesCount: 65,
    youthLedEnterprisesCount: 220,
    revolvingRepaymentRatePct: 91.5,
    averageGrantUSD: 7500,
  },
  {
    windowName: 'Window 3: Commercial Aggregation & Value Addition Storage Facilities',
    totalFundUSD: 1500000,
    disbursedUSD: 1240000,
    beneficiaryEnterprisesCount: 48,
    womenLedEnterprisesCount: 24,
    youthLedEnterprisesCount: 16,
    revolvingRepaymentRatePct: 96.0,
    averageGrantUSD: 25833,
  },
];
