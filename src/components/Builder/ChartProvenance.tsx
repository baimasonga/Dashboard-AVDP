import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { Dataset } from '../../types';
import { getDemonstrationDatasetMetadata } from '../../data/reportingPeriods';
import { DashboardDataMode } from '../../services/dashboardDataGateway';

interface ChartProvenanceProps {
  dataset: Dataset;
  dataSourceMode: DashboardDataMode;
}

export const ChartProvenance: React.FC<ChartProvenanceProps> = ({
  dataset,
  dataSourceMode,
}) => {
  const demonstrationMetadata = getDemonstrationDatasetMetadata(dataset);
  const isDemonstration = dataSourceMode === 'demonstration';
  const reportingPeriod =
    dataset.reportingPeriod ||
    (isDemonstration ? demonstrationMetadata.reportingPeriod : 'Not supplied');
  const refreshDate =
    dataset.refreshedAt ||
    (isDemonstration ? demonstrationMetadata.refreshDate : dataset.uploadedAt);
  const verificationStatus =
    dataset.verificationStatus ||
    (isDemonstration ? demonstrationMetadata.verificationStatus : 'Not supplied');
  const source = dataset.source || dataset.name;

  return (
    <footer
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-800 bg-slate-950/80 px-3 py-2 text-[10px] text-slate-500"
      aria-label={`Data provenance for ${dataset.name}`}
    >
      <span className="flex min-w-0 items-center gap-1 text-slate-400" title={source}>
        <Database className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="max-w-48 truncate">Source: {source}</span>
      </span>
      <span>Period: {reportingPeriod}</span>
      <span>Refreshed: {refreshDate}</span>
      <span
        className={`flex items-center gap-1 font-semibold ${
          verificationStatus === 'Verified'
            ? 'text-emerald-400'
            : verificationStatus === 'Not supplied'
              ? 'text-rose-300'
              : 'text-amber-300'
        }`}
      >
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        {verificationStatus}
      </span>
      {isDemonstration && (
        <span className="ml-auto rounded border border-amber-800 bg-amber-950 px-1.5 py-0.5 font-bold text-amber-300">
          DEMONSTRATION
        </span>
      )}
    </footer>
  );
};
