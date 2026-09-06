import React, { useMemo, useState } from 'react';
import { AVDP_ME_LOGFRAME } from '../../data/sierraLeoneData';
import { MELogframeIndicator, ValueChainType } from '../../types';
import {
  calculateIndicatorMetric,
  IndicatorPerformanceStatus,
  interpolateTarget,
} from '../../services/indicatorMetrics';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Search,
} from 'lucide-react';

interface MELogframeViewProps {
  selectedDistrict?: string | null;
  selectedValueChain?: ValueChainType;
}

type PeriodId = '2023-annual' | '2024-annual' | '2025-q2' | '2025-q3';
type PaceStatus = IndicatorPerformanceStatus;

const REPORTING_PERIODS: Array<{
  id: PeriodId;
  label: string;
  projectElapsed: number;
  actualScale: number;
}> = [
  { id: '2023-annual', label: '2023 Annual', projectElapsed: 0.35, actualScale: 0.42 },
  { id: '2024-annual', label: '2024 Annual', projectElapsed: 0.6, actualScale: 0.72 },
  { id: '2025-q2', label: '2025 Q2', projectElapsed: 0.76, actualScale: 0.9 },
  { id: '2025-q3', label: '2025 Q3', projectElapsed: 0.82, actualScale: 1 },
];

const getPeriodActual = (
  indicator: MELogframeIndicator,
  actualScale: number
) => interpolateTarget(indicator.baseline, indicator.currentActual, actualScale);

const formatValue = (value: number) =>
  Math.abs(value) >= 1000
    ? Math.round(value).toLocaleString()
    : Number(value.toFixed(2)).toLocaleString();

export const MELogframeView: React.FC<MELogframeViewProps> = ({
  selectedDistrict = null,
  selectedValueChain = 'All Value Chains',
}) => {
  const [periodId, setPeriodId] = useState<PeriodId>('2025-q3');
  const [statusFilter, setStatusFilter] = useState<'all' | PaceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const period =
    REPORTING_PERIODS.find((item) => item.id === periodId) ||
    REPORTING_PERIODS[REPORTING_PERIODS.length - 1];

  const evaluated = useMemo(
    () =>
      AVDP_ME_LOGFRAME.map((indicator) => {
        const aggregateActual = getPeriodActual(indicator, period.actualScale);
        const districtActual =
          selectedDistrict && indicator.districtBreakdown[selectedDistrict] !== undefined
            ? indicator.districtBreakdown[selectedDistrict] * period.actualScale
            : null;
        const actual = districtActual ?? aggregateActual;
        const metric = calculateIndicatorMetric({
          baseline: indicator.baseline,
          target: indicator.finalTarget,
          actual: aggregateActual,
          elapsedRatio: period.projectElapsed,
        });

        return {
          indicator,
          actual,
          aggregateActual,
          expectedValue: metric.expectedValue,
          finalAchievementPct: metric.achievementPct ?? 0,
          pacePct: metric.pacePct ?? 0,
          status: metric.status,
          districtScoped: districtActual !== null,
        };
      }),
    [period, selectedDistrict]
  );

  const filtered = evaluated.filter(({ indicator, status }) => {
    if (
      selectedValueChain !== 'All Value Chains' &&
      indicator.valueChain !== selectedValueChain &&
      indicator.valueChain !== 'All Value Chains'
    ) {
      return false;
    }
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        indicator.code.toLowerCase().includes(query) ||
        indicator.indicator.toLowerCase().includes(query) ||
        indicator.component.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const onTrackCount = evaluated.filter((item) =>
    ['on_track', 'target_achieved'].includes(item.status)
  ).length;
  const attentionCount = evaluated.filter((item) => item.status === 'attention').length;
  const offTrackCount = evaluated.filter((item) => item.status === 'off_track').length;
  const overallPace = Math.round(
    evaluated.reduce((sum, item) => sum + item.pacePct, 0) /
      Math.max(1, evaluated.length)
  );

  const exportCsv = () => {
    const headers =
      'Reporting_Period,Code,Component,Indicator,Value_Chain,Scope,Baseline,Expected_To_Date,Demonstration_Actual,Final_Target,Final_Achievement_Pct,Pace_Pct,Pace_Status,Unit,Data_Status\n';
    const rows = filtered
      .map(({ indicator, actual, expectedValue, finalAchievementPct, pacePct, status }) =>
        [
          period.label,
          indicator.code,
          indicator.component,
          indicator.indicator,
          indicator.valueChain,
          selectedDistrict || 'Project aggregate',
          indicator.baseline,
          expectedValue.toFixed(2),
          actual.toFixed(2),
          indicator.finalTarget,
          finalAchievementPct.toFixed(1),
          pacePct.toFixed(1),
          status,
          indicator.unit,
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
    anchor.download = `avdp_demo_logframe_${period.id}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Demonstration reporting period
          </div>
          <p className="mt-1 text-[11px] text-amber-300/80">
            Period values are illustrative interpolations used to test time-aware monitoring. They are not official historical results.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          Period
          <select
            value={periodId}
            onChange={(event) => setPeriodId(event.target.value as PeriodId)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
          >
            {REPORTING_PERIODS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Performance against expected pace',
            value: `${overallPace}%`,
            detail: `${Math.round(period.projectElapsed * 100)}% of project period elapsed`,
            icon: Award,
            color: 'text-white',
          },
          {
            label: 'On track',
            value: onTrackCount,
            detail: 'At least 90% of expected progress',
            icon: CheckCircle2,
            color: 'text-emerald-400',
          },
          {
            label: 'Attention',
            value: attentionCount,
            detail: '70–89% of expected progress',
            icon: Clock,
            color: 'text-amber-400',
          },
          {
            label: 'Off track',
            value: offTrackCount,
            detail: 'Below 70% of expected progress',
            icon: AlertTriangle,
            color: 'text-rose-400',
          },
        ].map(({ label, value, detail, icon: Icon, color }) => (
          <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{label}</span>
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            </div>
            <div className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</div>
            <div className="mt-2 text-[11px] text-slate-500">{detail}</div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex-1">
          <span className="sr-only">Search M&E indicators</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search indicator code, component or description"
            className="w-full rounded-lg border border-slate-700/80 bg-slate-800 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | PaceStatus)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 outline-none"
          >
            <option value="all">All pace statuses</option>
            <option value="on_track">On track</option>
            <option value="attention">Attention</option>
            <option value="off_track">Off track</option>
            <option value="target_achieved">Target achieved</option>
            <option value="not_reported">Not reported</option>
            <option value="provisional">Provisional</option>
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            Export filtered CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-700/80 bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Indicator</th>
                <th className="px-4 py-3.5">Scope</th>
                <th className="px-4 py-3.5 text-right">Baseline</th>
                <th className="px-4 py-3.5 text-right">Expected to date</th>
                <th className="px-4 py-3.5 text-right">Demo actual</th>
                <th className="px-4 py-3.5 text-right">Final target</th>
                <th className="px-4 py-3.5 text-center">Final achievement</th>
                <th className="px-4 py-3.5 text-center">Expected pace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filtered.map(
                ({
                  indicator,
                  actual,
                  expectedValue,
                  finalAchievementPct,
                  pacePct,
                  status,
                  districtScoped,
                }) => (
                  <tr key={indicator.id} className="transition-colors hover:bg-slate-800/40">
                    <td className="max-w-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                          {indicator.code}
                        </span>
                        <span className="text-[10px] text-slate-500">{indicator.component}</span>
                      </div>
                      <div className="mt-1.5 font-semibold text-white">{indicator.indicator}</div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        {indicator.valueChain} • Demonstration
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                      {districtScoped ? selectedDistrict : 'Project aggregate'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatValue(indicator.baseline)} {indicator.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-sky-300">
                      {formatValue(expectedValue)} {indicator.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-white">
                      {formatValue(actual)} {indicator.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatValue(indicator.finalTarget)} {indicator.unit}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-200">
                      {Math.round(finalAchievementPct)}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="mx-auto w-32">
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                          <span
                            className={
                              status === 'on_track' || status === 'target_achieved'
                                ? 'text-emerald-400'
                                : status === 'attention'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {status.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-white">{Math.round(pacePct)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              status === 'on_track' || status === 'target_achieved'
                                ? 'bg-emerald-500'
                                : status === 'attention'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, pacePct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No indicators match the selected dashboard filters.
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        Direction is derived from baseline and final target, so indicators where a lower value is better are evaluated correctly. The selected district is used only where a district breakdown exists.
      </p>
    </div>
  );
};
