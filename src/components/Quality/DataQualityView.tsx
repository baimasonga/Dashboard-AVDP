import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileWarning,
  Search,
} from 'lucide-react';
import { Dataset } from '../../types';
import {
  DataCleaningService,
  ValidationReport,
} from '../../services/dataCleaningService';

interface DataQualityViewProps {
  datasets: Dataset[];
}

type QualityBand = 'ready' | 'review' | 'attention';

const getQualityBand = (score: number): QualityBand => {
  if (score >= 90) return 'ready';
  if (score >= 75) return 'review';
  return 'attention';
};

export const DataQualityView: React.FC<DataQualityViewProps> = ({ datasets }) => {
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState<'all' | QualityBand>('all');

  const assessed = useMemo(
    () =>
      datasets.map((dataset) => {
        const report = DataCleaningService.validateDataset(
          dataset.rows,
          dataset.columns
        );
        return {
          dataset,
          report,
          band: getQualityBand(report.healthScore),
        };
      }),
    [datasets]
  );

  const filtered = assessed.filter(({ dataset, band }) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      dataset.name.toLowerCase().includes(query) ||
      dataset.description.toLowerCase().includes(query) ||
      dataset.valueChain.toLowerCase().includes(query);
    return matchesSearch && (bandFilter === 'all' || band === bandFilter);
  });

  const totals = assessed.reduce(
    (summary, item) => {
      summary.rows += item.report.totalRows;
      summary.missing += item.report.missingCount;
      summary.outliers += item.report.outlierCount;
      summary.formatIssues += item.report.formatIssueCount;
      summary.duplicates += item.report.duplicateRowCount;
      summary.weightedScore +=
        item.report.healthScore * Math.max(1, item.report.totalRows);
      summary.weight += Math.max(1, item.report.totalRows);
      return summary;
    },
    {
      rows: 0,
      missing: 0,
      outliers: 0,
      formatIssues: 0,
      duplicates: 0,
      weightedScore: 0,
      weight: 0,
    }
  );

  const overallScore = Math.round(
    totals.weightedScore / Math.max(1, totals.weight)
  );
  const datasetsNeedingReview = assessed.filter(
    (item) => item.band !== 'ready'
  ).length;

  const exportQualityReport = () => {
    const headers =
      'Dataset,Value_Chain,Rows,Columns,Health_Score,Quality_Band,Missing,Outliers,Format_Issues,Duplicates,Errors,Warnings,Data_Status\n';
    const rows = filtered
      .map(({ dataset, report, band }) =>
        [
          dataset.name,
          dataset.valueChain,
          report.totalRows,
          report.totalColumns,
          report.healthScore,
          band,
          report.missingCount,
          report.outlierCount,
          report.formatIssueCount,
          report.duplicateRowCount,
          report.errorCount,
          report.warningCount,
          'Demonstration',
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'avdp_demonstration_data_quality_report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metricCards = [
    {
      label: 'Overall data health',
      value: `${overallScore}%`,
      detail: 'Weighted by dataset row count',
      color: overallScore >= 90 ? 'text-emerald-400' : overallScore >= 75 ? 'text-amber-400' : 'text-rose-400',
    },
    {
      label: 'Datasets assessed',
      value: assessed.length,
      detail: `${datasetsNeedingReview} requiring review`,
      color: 'text-sky-400',
    },
    {
      label: 'Rows assessed',
      value: totals.rows.toLocaleString(),
      detail: `${totals.missing} missing values detected`,
      color: 'text-white',
    },
    {
      label: 'Potential anomalies',
      value: (totals.outliers + totals.formatIssues + totals.duplicates).toLocaleString(),
      detail: `${totals.outliers} outliers • ${totals.duplicates} duplicates`,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-sky-800/60 bg-sky-950/25 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-sky-200">
          <Database className="h-4 w-4" aria-hidden="true" />
          Demonstration Data Quality Monitor
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Read-only validation of datasets currently in scope. Findings are diagnostic flags—not automatic corrections—and the underlying demonstration records are not changed.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {metricCards.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg"
          >
            <div className="text-xs text-slate-400">{metric.label}</div>
            <div className={`mt-2 text-3xl font-extrabold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">{metric.detail}</div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex-1">
          <span className="sr-only">Search datasets</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dataset name, description or value chain"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select
            value={bandFilter}
            onChange={(event) =>
              setBandFilter(event.target.value as 'all' | QualityBand)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 outline-none"
          >
            <option value="all">All quality bands</option>
            <option value="ready">Ready (90–100)</option>
            <option value="review">Review (75–89)</option>
            <option value="attention">Attention (below 75)</option>
          </select>
          <button
            type="button"
            onClick={exportQualityReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            Export quality report
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map(({ dataset, report, band }) => (
          <DatasetQualityCard
            key={dataset.id}
            dataset={dataset}
            report={report}
            band={band}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-sm text-slate-500">
          No datasets match the selected filters.
        </div>
      )}
    </div>
  );
};

const DatasetQualityCard: React.FC<{
  dataset: Dataset;
  report: ValidationReport;
  band: QualityBand;
}> = ({ dataset, report, band }) => {
  const BandIcon =
    band === 'ready'
      ? CheckCircle2
      : band === 'review'
      ? AlertTriangle
      : FileWarning;

  const bandStyles =
    band === 'ready'
      ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
      : band === 'review'
      ? 'border-amber-800 bg-amber-950/60 text-amber-300'
      : 'border-rose-800 bg-rose-950/60 text-rose-300';

  const problemColumns = Object.values(report.columnSummaries)
    .filter(
      (column) =>
        column.missingCount > 0 ||
        column.outlierCount > 0 ||
        column.formatIssueCount > 0
    )
    .sort(
      (a, b) =>
        b.missingCount +
        b.outlierCount +
        b.formatIssueCount -
        (a.missingCount + a.outlierCount + a.formatIssueCount)
    )
    .slice(0, 3);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {dataset.valueChain} • Demonstration
          </div>
          <h3 className="mt-1 text-sm font-bold text-white">{dataset.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
            {dataset.description}
          </p>
        </div>
        <div className={`flex min-w-20 flex-col items-center rounded-xl border px-3 py-2 ${bandStyles}`}>
          <BandIcon className="h-4 w-4" aria-hidden="true" />
          <span className="mt-1 text-xl font-extrabold">{report.healthScore}%</span>
          <span className="text-[9px] font-bold uppercase">{band}</span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] sm:grid-cols-6">
        {[
          ['Rows', report.totalRows],
          ['Columns', report.totalColumns],
          ['Missing', report.missingCount],
          ['Outliers', report.outlierCount],
          ['Formats', report.formatIssueCount],
          ['Duplicates', report.duplicateRowCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-950/70 px-2 py-2">
            <dt className="text-slate-500">{label}</dt>
            <dd className="mt-1 font-bold text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Highest-priority columns
        </div>
        {problemColumns.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {problemColumns.map((column) => (
              <span
                key={column.column}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-slate-300"
              >
                {column.column}: {column.missingCount + column.outlierCount + column.formatIssueCount} flags
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-emerald-400">
            No missing, format or statistical outlier flags detected.
          </p>
        )}
      </div>
    </article>
  );
};
