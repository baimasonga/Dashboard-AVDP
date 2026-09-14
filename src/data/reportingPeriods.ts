import { Dataset } from '../types';

export const REPORTING_PERIODS = ['Latest available', '2025 Q4', '2025 FY'] as const;
export type ReportingPeriod = (typeof REPORTING_PERIODS)[number];
export type DatasetReportingPeriod = Exclude<ReportingPeriod, 'Latest available'>;

export type VerificationStatus = 'Verified' | 'Under review' | 'Draft';

export interface DemonstrationDatasetMetadata {
  reportingPeriod: DatasetReportingPeriod;
  refreshDate: string;
  refreshCadence: 'Quarterly' | 'Annual';
  verificationStatus: VerificationStatus;
  owner: 'M&E Unit' | 'Component lead';
}

const stableCode = (value?: string | null) =>
  Array.from(String(value || '')).reduce((sum, character) => sum + character.charCodeAt(0), 0);

export const getDemonstrationDatasetMetadata = (
  dataset?: Pick<Dataset, 'id'> | null
): DemonstrationDatasetMetadata => {
  const id = dataset?.id || 'default_dataset';
  const code = stableCode(id);
  const quarterly = code % 2 === 0;

  return {
    reportingPeriod: quarterly ? '2025 Q4' : '2025 FY',
    refreshDate: `${String(11 + (code % 8)).padStart(2, '0')} Dec 2025`,
    refreshCadence: quarterly ? 'Quarterly' : 'Annual',
    verificationStatus: code % 5 === 0 ? 'Draft' : code % 3 === 0 ? 'Under review' : 'Verified',
    owner: quarterly ? 'M&E Unit' : 'Component lead',
  };
};

export const datasetMatchesReportingPeriod = (
  dataset: Pick<Dataset, 'id'> | null | undefined,
  period: ReportingPeriod
) => {
  if (!dataset) return false;
  if (period === 'Latest available') return true;
  return getDemonstrationDatasetMetadata(dataset).reportingPeriod === period;
};
