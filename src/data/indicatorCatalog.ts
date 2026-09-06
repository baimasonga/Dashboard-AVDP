export type DataClassification =
  | 'demonstration'
  | 'reported'
  | 'verified'
  | 'estimated'
  | 'modelled'
  | 'forecast';

export interface DataSourceDefinition {
  id: string;
  name: string;
  owner: string;
  description: string;
  refreshFrequency: string;
  status: DataClassification;
}

export interface IndicatorDefinition {
  id: string;
  code: string;
  name: string;
  resultLevel: 'Impact' | 'Outcome' | 'Output' | 'Management';
  unit: string;
  formula: string;
  frequency: string;
  sourceId: string;
  disaggregation: string[];
  definition: string;
  status: DataClassification;
}

export const DATA_SOURCES: DataSourceDefinition[] = [
  {
    id: 'demo-me',
    name: 'AVDP M&E Demonstration Dataset',
    owner: 'Monitoring & Evaluation Unit',
    description: 'Fictitious indicator, target and achievement records used to test dashboard behaviour.',
    refreshFrequency: 'Prototype snapshot',
    status: 'demonstration',
  },
  {
    id: 'demo-field',
    name: 'Field Activities Demonstration Extract',
    owner: 'AVDP Technical Components',
    description: 'Illustrative district, beneficiary, Farmer Field School and value-chain aggregates.',
    refreshFrequency: 'Prototype snapshot',
    status: 'demonstration',
  },
  {
    id: 'demo-finance',
    name: 'Financial Summary Demonstration Extract',
    owner: 'Finance Unit',
    description: 'Illustrative approved-budget, expenditure and disbursement summaries.',
    refreshFrequency: 'Prototype snapshot',
    status: 'demonstration',
  },
  {
    id: 'demo-procurement',
    name: 'Procurement Summary Demonstration Extract',
    owner: 'Procurement Unit',
    description: 'Illustrative procurement package values and implementation-stage summaries.',
    refreshFrequency: 'Prototype snapshot',
    status: 'demonstration',
  },
  {
    id: 'demo-grm',
    name: 'GRM Aggregated Demonstration Extract',
    owner: 'GRM Focal Unit',
    description: 'Fictitious, non-personal grievance totals and resolution-performance metrics.',
    refreshFrequency: 'Prototype snapshot',
    status: 'demonstration',
  },
];

export const INDICATOR_CATALOG: IndicatorDefinition[] = [
  {
    id: 'beneficiary-households',
    code: 'AVDP-OUT-01',
    name: 'Smallholder households reached',
    resultLevel: 'Output',
    unit: 'Households',
    formula: 'Distinct eligible households receiving at least one documented AVDP service',
    frequency: 'Quarterly',
    sourceId: 'demo-field',
    disaggregation: ['District', 'Value chain', 'Sex of household head'],
    definition: 'Number of distinct eligible smallholder households reached by supported interventions during the reporting scope.',
    status: 'demonstration',
  },
  {
    id: 'women-participation',
    code: 'AVDP-OUT-02',
    name: 'Women beneficiaries',
    resultLevel: 'Output',
    unit: 'Percent',
    formula: '(Women beneficiaries ÷ Total beneficiaries with recorded sex) × 100',
    frequency: 'Quarterly',
    sourceId: 'demo-field',
    disaggregation: ['District', 'Value chain', 'Age group'],
    definition: 'Share of reported beneficiaries identified as women.',
    status: 'demonstration',
  },
  {
    id: 'youth-participation',
    code: 'AVDP-OUT-03',
    name: 'Youth beneficiaries',
    resultLevel: 'Output',
    unit: 'Percent',
    formula: '(Youth beneficiaries ÷ Total beneficiaries with recorded age) × 100',
    frequency: 'Quarterly',
    sourceId: 'demo-field',
    disaggregation: ['District', 'Value chain', 'Sex'],
    definition: 'Share of reported beneficiaries who meet the project-approved youth age definition.',
    status: 'demonstration',
  },
  {
    id: 'rice-yield',
    code: 'AVDP-OUT-04',
    name: 'Average rice yield',
    resultLevel: 'Outcome',
    unit: 'MT/ha',
    formula: 'Total verified harvested rice weight ÷ Total verified harvested area',
    frequency: 'Seasonal',
    sourceId: 'demo-field',
    disaggregation: ['District', 'Production system', 'Season'],
    definition: 'Average metric tonnes of paddy rice harvested per hectare in the selected reporting scope.',
    status: 'demonstration',
  },
  {
    id: 'cassava-yield',
    code: 'AVDP-OUT-05',
    name: 'Average cassava yield',
    resultLevel: 'Outcome',
    unit: 'MT/ha',
    formula: 'Total verified harvested cassava weight ÷ Total verified harvested area',
    frequency: 'Seasonal',
    sourceId: 'demo-field',
    disaggregation: ['District', 'Production system', 'Season'],
    definition: 'Average metric tonnes of fresh cassava roots harvested per hectare.',
    status: 'demonstration',
  },
  {
    id: 'ffs-established',
    code: 'AVDP-OUT-06',
    name: 'Farmer Field Schools established',
    resultLevel: 'Output',
    unit: 'Schools',
    formula: 'Count of unique qualifying FFS identifiers in the reporting scope',
    frequency: 'Quarterly',
    sourceId: 'demo-field',
    disaggregation: ['District', 'Value chain', 'Status'],
    definition: 'Number of Farmer Field Schools meeting the project definition and active within the selected scope.',
    status: 'demonstration',
  },
  {
    id: 'infrastructure-completion',
    code: 'AVDP-OUT-07',
    name: 'Infrastructure completion rate',
    resultLevel: 'Output',
    unit: 'Percent',
    formula: '(Completed infrastructure items ÷ Planned infrastructure items) × 100',
    frequency: 'Monthly',
    sourceId: 'demo-me',
    disaggregation: ['District', 'Infrastructure type', 'Contract'],
    definition: 'Share of planned infrastructure items recorded as completed and accepted.',
    status: 'demonstration',
  },
  {
    id: 'budget-utilization',
    code: 'AVDP-MGT-01',
    name: 'Budget utilization',
    resultLevel: 'Management',
    unit: 'Percent',
    formula: '(Eligible expenditure ÷ Approved budget) × 100',
    frequency: 'Monthly',
    sourceId: 'demo-finance',
    disaggregation: ['Component', 'Category', 'Funding source'],
    definition: 'Eligible expenditure as a percentage of the approved budget for the selected reporting scope.',
    status: 'demonstration',
  },
  {
    id: 'procurement-completion',
    code: 'AVDP-MGT-02',
    name: 'Procurement packages completed',
    resultLevel: 'Management',
    unit: 'Percent',
    formula: '(Completed packages ÷ Planned packages due by reporting date) × 100',
    frequency: 'Monthly',
    sourceId: 'demo-procurement',
    disaggregation: ['Category', 'Method', 'Component'],
    definition: 'Share of procurement packages due by the selected date that have reached completion.',
    status: 'demonstration',
  },
  {
    id: 'grm-resolution',
    code: 'AVDP-MGT-03',
    name: 'GRM case resolution rate',
    resultLevel: 'Management',
    unit: 'Percent',
    formula: '(Resolved cases ÷ Cases received and due for resolution) × 100',
    frequency: 'Monthly',
    sourceId: 'demo-grm',
    disaggregation: ['District', 'Category', 'Severity'],
    definition: 'Share of aggregated grievance cases due for resolution that were resolved within the reporting scope.',
    status: 'demonstration',
  },
  {
    id: 'indicator-achievement',
    code: 'AVDP-ME-01',
    name: 'Indicators on track',
    resultLevel: 'Management',
    unit: 'Percent',
    formula: '(Indicators meeting expected progress ÷ Indicators due for reporting) × 100',
    frequency: 'Quarterly',
    sourceId: 'demo-me',
    disaggregation: ['Result level', 'Component', 'Value chain'],
    definition: 'Share of indicators whose progress is consistent with the time-adjusted target.',
    status: 'demonstration',
  },
  {
    id: 'reporting-completeness',
    code: 'AVDP-DQ-01',
    name: 'Reporting completeness',
    resultLevel: 'Management',
    unit: 'Percent',
    formula: '(Required submissions received ÷ Required submissions due) × 100',
    frequency: 'Monthly',
    sourceId: 'demo-me',
    disaggregation: ['District', 'Component', 'Reporting period'],
    definition: 'Share of required reporting submissions received for the selected period.',
    status: 'demonstration',
  },
];

export const getDataSource = (sourceId: string) =>
  DATA_SOURCES.find((source) => source.id === sourceId);
