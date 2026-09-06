import React from 'react';
import { AlertTriangle, Database, FilterX, RefreshCw } from 'lucide-react';

interface DashboardScopeStateProps {
  kind: 'source-error' | 'empty-scope';
  district: string | null;
  valueChain: string;
  reportingPeriod: string;
  error?: string | null;
  onResetFilters: () => void;
  onRetrySource: () => void;
  onOpenRefreshMonitor: () => void;
}

export const DashboardScopeState: React.FC<DashboardScopeStateProps> = ({
  kind,
  district,
  valueChain,
  reportingPeriod,
  error,
  onResetFilters,
  onRetrySource,
  onOpenRefreshMonitor,
}) => {
  const sourceError = kind === 'source-error';

  return (
    <section
      className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-xl"
      role="status"
      aria-live="polite"
    >
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl border ${
          sourceError
            ? 'border-rose-800 bg-rose-950 text-rose-300'
            : 'border-amber-800 bg-amber-950 text-amber-300'
        }`}
      >
        {sourceError ? <AlertTriangle className="h-6 w-6" /> : <FilterX className="h-6 w-6" />}
      </div>

      <h2 className="mt-4 text-lg font-bold text-white">
        {sourceError ? 'Dashboard data is unavailable' : 'No datasets match this scope'}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
        {sourceError
          ? 'The configured analytical source could not provide a validated dataset. Dashboard charts are withheld so demonstration records are not mistaken for live results.'
          : 'This filter combination has no compatible datasets. It does not mean that programme performance is zero; it means there is no information available for this analytical scope.'}
      </p>

      {sourceError && error && (
        <p className="mx-auto mt-3 max-w-xl rounded-lg border border-rose-900 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      <dl className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-2 text-left text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <dt className="text-slate-500">District</dt>
          <dd className="mt-1 font-semibold text-slate-200">{district || 'All districts'}</dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <dt className="text-slate-500">Value chain</dt>
          <dd className="mt-1 font-semibold text-slate-200">{valueChain}</dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <dt className="text-slate-500">Reporting period</dt>
          <dd className="mt-1 font-semibold text-slate-200">{reportingPeriod}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {sourceError ? (
          <button
            type="button"
            onClick={onRetrySource}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry data source
          </button>
        ) : (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <FilterX className="h-3.5 w-3.5" />
            Reset dashboard filters
          </button>
        )}
        <button
          type="button"
          onClick={onOpenRefreshMonitor}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
        >
          <Database className="h-3.5 w-3.5" />
          Open data refresh monitor
        </button>
      </div>
    </section>
  );
};
