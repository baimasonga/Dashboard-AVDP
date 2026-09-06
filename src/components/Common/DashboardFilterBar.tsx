import React from 'react';
import { CalendarDays, Database, Filter, Link2, MapPin, RotateCcw } from 'lucide-react';
import { ValueChainType } from '../../types';
import { REPORTING_PERIODS, ReportingPeriod } from '../../data/reportingPeriods';
import { DASHBOARD_VALUE_CHAINS } from '../../data/dashboardViewState';

interface DashboardFilterBarProps {
  districts: string[];
  selectedDistrict: string | null;
  selectedValueChain: ValueChainType;
  selectedReportingPeriod: ReportingPeriod;
  visibleDatasetCount: number;
  totalDatasetCount: number;
  onDistrictChange: (district: string | null) => void;
  onValueChainChange: (valueChain: ValueChainType) => void;
  onReportingPeriodChange: (period: ReportingPeriod) => void;
  onCopyView: () => void;
  onReset: () => void;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  districts,
  selectedDistrict,
  selectedValueChain,
  selectedReportingPeriod,
  visibleDatasetCount,
  totalDatasetCount,
  onDistrictChange,
  onValueChainChange,
  onReportingPeriodChange,
  onCopyView,
  onReset,
}) => {
  const hasFilters =
    Boolean(selectedDistrict) ||
    selectedValueChain !== 'All Value Chains' ||
    selectedReportingPeriod !== 'Latest available';

  return (
    <section
      className="border-b border-slate-800 bg-slate-900/95 px-4 py-3"
      aria-label="Dashboard filters and data provenance"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Filter className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span>Dashboard filters</span>
          </div>

          <label className="relative">
            <span className="sr-only">Filter by district</span>
            <MapPin
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <select
              value={selectedDistrict || ''}
              onChange={(event) => onDistrictChange(event.target.value || null)}
              className="rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-200 outline-none transition-colors hover:border-slate-600 focus:border-emerald-500"
            >
              <option value="">All districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by value chain</span>
            <select
              value={selectedValueChain}
              onChange={(event) => onValueChainChange(event.target.value as ValueChainType)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition-colors hover:border-slate-600 focus:border-emerald-500"
            >
              {DASHBOARD_VALUE_CHAINS.map((valueChain) => (
                <option key={valueChain} value={valueChain}>
                  {valueChain}
                </option>
              ))}
            </select>
          </label>

          <label className="relative">
            <span className="sr-only">Filter by reporting period</span>
            <CalendarDays
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <select
              value={selectedReportingPeriod}
              onChange={(event) =>
                onReportingPeriodChange(event.target.value as ReportingPeriod)
              }
              className="rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-200 outline-none transition-colors hover:border-slate-600 focus:border-emerald-500"
            >
              {REPORTING_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period === 'Latest available' ? 'Latest available period' : period}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onCopyView}
            className="flex items-center gap-1 rounded-lg border border-sky-800 bg-sky-950/50 px-2.5 py-1.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-900"
            title="Copy a link to the current dashboard view and filters"
          >
            <Link2 className="h-3 w-3" aria-hidden="true" />
            Copy view link
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-amber-300">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Demonstration datasets
          </span>
          <span className="text-slate-400">
            {visibleDatasetCount} of {totalDatasetCount} datasets in scope
          </span>
          <span className="text-slate-500">
            District, value-chain and period scope applies across compatible dashboard views
          </span>
        </div>
      </div>
    </section>
  );
};
