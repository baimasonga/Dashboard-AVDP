import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { CommodityType } from '../../data/cropTrendData';
import {
  FutureYieldRegressionService,
  OutlookScenario,
  TrajectoryTrackingResult,
} from '../../services/futureYieldRegressionService';

interface CompareTrajectoryViewProps {
  commodity: CommodityType;
  district: string;
  scenario: OutlookScenario;
  growthFactor: number;
  onApplyScenario?: (scenario: OutlookScenario, growthFactor?: number) => void;
}

export const CompareTrajectoryView: React.FC<CompareTrajectoryViewProps> = ({
  commodity,
  district,
  scenario,
  growthFactor,
  onApplyScenario,
}) => {
  const trackingData: TrajectoryTrackingResult = useMemo(() => {
    return FutureYieldRegressionService.computeTrajectoryTracking(
      commodity,
      district,
      scenario,
      growthFactor
    );
  }, [commodity, district, scenario, growthFactor]);

  // Color mapping by pacing status
  const statusColor = useMemo(() => {
    switch (trackingData.overallPacingStatus) {
      case 'Ahead of Pace':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'On Track':
        return { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' };
      case 'At Risk':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'Critical Shortfall':
      default:
        return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    }
  }, [trackingData.overallPacingStatus]);

  // Custom Recharts Tooltip
  const CustomTrajectoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isProjected = label > 2027;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs max-w-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Year {label}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isProjected ? 'bg-purple-900/40 text-purple-300' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isProjected ? 'Projected Trajectory' : 'Extended Project Lifecycle'}
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {payload.map((item: any) => {
              if (item.value === undefined || item.value === null) return null;
              return (
                <div key={item.dataKey} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}{' '}
                    {trackingData.commodityMeta.unitYield}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Project Closure Goal (2027):</span>
            <span className="text-amber-300 font-mono font-bold">
              {trackingData.target2030Yield} {trackingData.commodityMeta.unitYield}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Status Header */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Target Trajectory Benchmark &amp; Milestone Pacing
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
              >
                {trackingData.overallPacingStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Benchmarking <strong className="text-slate-200">{trackingData.district}</strong> against the
              required linear velocity to reach the Project Closure Goal ({trackingData.target2030Yield}{' '}
              {trackingData.commodityMeta.unitYield}). Comparing historical trajectory pacing against active
              scenario projections (2019&ndash;2027 lifecycle, max 2028 horizon).
            </p>
          </div>

          {/* Quick Velocity Gauge pill */}
          <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center gap-3">
            <Gauge className={`w-5 h-5 ${statusColor.text}`} />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Pacing Velocity Coverage
              </span>
              <span className={`text-base font-bold font-mono ${statusColor.text}`}>
                {trackingData.velocityCoveragePct}% of Required Pace
              </span>
            </div>
          </div>
        </div>

        {/* Velocity & Pacing Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          {/* Required Annual Velocity */}
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Target className="w-3 h-3 text-amber-400" />
              Required Velocity
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-amber-300">
                +{trackingData.requiredAnnualVelocityMT}
              </span>
              <span className="text-[10px] text-slate-400">MT/Ha/yr</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Required annual gain to 2027 closure
            </span>
          </div>

          {/* Historical Baseline Velocity */}
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              Historical Pace (OLS)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-slate-200">
                +{trackingData.historicalVelocityMT}
              </span>
              <span className="text-[10px] text-slate-400">MT/Ha/yr</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Empirical slope (2019–2027)
            </span>
          </div>

          {/* Projected Scenario Velocity */}
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Scenario Velocity
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-lg font-bold font-mono ${
                  trackingData.projectedAnnualVelocityMT >= trackingData.requiredAnnualVelocityMT
                    ? 'text-emerald-400'
                    : 'text-amber-300'
                }`}
              >
                +{trackingData.projectedAnnualVelocityMT}
              </span>
              <span className="text-[10px] text-slate-400">MT/Ha/yr</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Under {trackingData.growthFactor.toFixed(2)}x growth factor
            </span>
          </div>

          {/* Project Closure Milestone Gap */}
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Closure Milestone Gap
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-lg font-bold font-mono ${
                  trackingData.milestoneGap2030MT === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trackingData.milestoneGap2030MT === 0
                  ? 'Surplus'
                  : `-${trackingData.milestoneGap2030MT} MT/Ha`}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {trackingData.milestoneGap2030MT === 0
                ? 'Target completely attained'
                : `${trackingData.milestoneGap2030Pct}% shortfall at closure year`}
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Tracking Chart */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trajectory Pathway vs Required Linear Path (2019–2027 / 2028 Horizon)
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              Historical Empirical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-purple-400 inline-block border-dashed" />
              Scenario Projected
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              Required Target Path
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trackingData.chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['auto', 'auto']}
                unit={` ${trackingData.commodityMeta.unitYield.split('/')[0]}`}
              />
              <Tooltip content={<CustomTrajectoryTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '8px', fontSize: '11px', color: '#94a3b8' }}
              />

              {/* 2027 Extended Baseline separator line */}
              <ReferenceLine
                x={2027}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{
                  value: 'Ext Base 2027',
                  fill: '#94a3b8',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />

              {/* Project Closure Target Reference */}
              <ReferenceLine
                y={trackingData.target2030Yield}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                label={{
                  value: `Closure Goal (${trackingData.target2030Yield} MT/Ha)`,
                  fill: '#fcd34d',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              {/* 95% Confidence Interval Ribbon */}
              <Area
                type="monotone"
                dataKey="confidenceUpper95"
                name="95% Upper CI"
                stroke="none"
                fill="#10b981"
                fillOpacity={0.08}
              />
              <Area
                type="monotone"
                dataKey="confidenceLower95"
                name="95% Lower CI"
                stroke="none"
                fill="#10b981"
                fillOpacity={0.08}
              />

              {/* Required Linear Target Benchmark Path */}
              <Line
                type="linear"
                dataKey="requiredTargetPath"
                name="Required Linear Target Path"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#f59e0b' }}
              />

              {/* Historical Empirical Progress */}
              <Line
                type="monotone"
                dataKey="empiricalYield"
                name="Empirical Historical Yield"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />

              {/* Projected Scenario Trajectory */}
              <Line
                type="monotone"
                dataKey="projectedYield"
                name="Projected Trajectory"
                stroke="#c084fc"
                strokeWidth={2.5}
                strokeDasharray="3 3"
                dot={{ r: 4, fill: '#c084fc' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Checkpoint Table */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Pacing Checkpoint Milestones &amp; Trajectory Variance
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Variance vs Required Linear Pacing
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Checkpoint Year</th>
                <th className="py-2.5 px-3 font-semibold">Phase Classification</th>
                <th className="py-2.5 px-3 font-semibold text-right">Required Path (MT/Ha)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Projected (MT/Ha)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Variance (MT/Ha)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Variance (%)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Pacing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {trackingData.checkpoints.map((cp) => {
                let milestoneLabel = '';
                if (cp.year === 2019) milestoneLabel = 'Project Inception Baseline';
                else if (cp.year === 2021) milestoneLabel = 'Early Implementation Phase';
                else if (cp.year === 2023) milestoneLabel = 'Mid-Term Evaluation Period';
                else if (cp.year === 2025) milestoneLabel = 'Pre-Closure Consolidation';
                else if (cp.year === 2026) milestoneLabel = 'Original Project Life Cycle End';
                else if (cp.year === 2027) milestoneLabel = 'Extended Project Closure Deadline';
                else if (cp.year === 2028) milestoneLabel = 'Post-Closure Adjusted Horizon (Capped)';

                return (
                  <tr
                    key={cp.year}
                    className={`hover:bg-slate-850/40 transition-colors ${
                      cp.year === 2027 ? 'bg-amber-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-white flex items-center gap-1.5">
                      {cp.year === 2027 && <Target className="w-3.5 h-3.5 text-amber-400" />}
                      {cp.year}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {milestoneLabel}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                      {cp.requiredTargetPath.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                      {cp.actualOrProjectedYield.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={
                          cp.varianceMT >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                        }
                      >
                        {cp.varianceMT >= 0 ? '+' : ''}
                        {cp.varianceMT.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      <span className={cp.variancePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {cp.variancePct >= 0 ? '+' : ''}
                        {cp.variancePct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cp.status === 'Ahead'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : cp.status === 'On Track'
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                            : cp.status === 'At Risk'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {cp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Trajectory Policy Corrections */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Strategic Trajectory Corrective Levers
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Policy Interventions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Input Acceleration</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Subsidize certified ROK &amp; NERICA seed distribution to close the{' '}
              <strong className="text-amber-300 font-mono">
                {trackingData.milestoneGap2030MT} MT/Ha
              </strong>{' '}
              deficit gap before project closure (2027).
            </p>
            {onApplyScenario && (
              <button
                type="button"
                onClick={() => onApplyScenario('avdp_accelerated', 1.35)}
                className="mt-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Test Accelerated Scenario (+35%)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Water &amp; IVS Bunding</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Rehabilitate peripheral bunds to reduce monsoon flood damage and ensure second-season harvests,
              lifting annual velocity by +0.12 MT/Ha/yr.
            </p>
            {onApplyScenario && (
              <button
                type="button"
                onClick={() => onApplyScenario('avdp_accelerated', 1.25)}
                className="mt-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Test Water Bunding (+25%)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Post-Harvest Recovery</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Introduce motorized threshers and hermetic storage bags across cooperatives to capture an
              immediate 15% recovery in realized market volume.
            </p>
            {onApplyScenario && (
              <button
                type="button"
                onClick={() => onApplyScenario('avdp_accelerated', 1.18)}
                className="mt-1 text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Test Loss Recovery (+18%)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
