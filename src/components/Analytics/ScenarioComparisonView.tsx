import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Check,
  Zap,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { CommodityType, COMMODITY_METADATA } from '../../data/cropTrendData';
import {
  FutureYieldRegressionService,
  OutlookScenario,
  ScenarioComparisonItem,
} from '../../services/futureYieldRegressionService';

interface ScenarioComparisonViewProps {
  commodity: CommodityType;
  district: string;
  growthFactor: number;
  activeScenario: OutlookScenario;
  onApplyScenario: (scenario: OutlookScenario, growthFactor?: number) => void;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  commodity,
  district,
  growthFactor,
  activeScenario,
  onApplyScenario,
}) => {
  const meta = COMMODITY_METADATA[commodity];

  const comparison = useMemo(() => {
    return FutureYieldRegressionService.compareScenarios(commodity, district, growthFactor);
  }, [commodity, district, growthFactor]);

  const targetYield = meta.projectClosureTargetYield || meta.nationalTarget2030Yield;

  return (
    <div id="scenario-comparison-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner: Key Insights & Spread */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">
                Multi-Scenario Comparative Trajectory (2019–2027 Lifecycle &amp; 2028 Horizon)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {district} &bull; {meta.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side modeling of 4 divergent intervention and climate risk futures against the Project Closure Target.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              Closure Yield Spread
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">
              {comparison.spreadMT} {meta.unitYield}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              Project Target Goal
            </div>
            <div className="text-xs font-mono font-bold text-rose-400">
              {targetYield} {meta.unitYield}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Scenario Overlay Chart */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80 text-xs">
          <span className="font-bold text-slate-200">
            Comparative Yield Trajectories Across Scenarios (MT/Ha)
          </span>
          <span className="text-[11px] text-slate-400">
            Dashed lines denote projected 2027–2031 divergence
          </span>
        </div>

        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={comparison.chartOverlay}
              margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                domain={['auto', 'auto']}
                unit={` ${meta.unitYield}`}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const isProjected = label > 2027;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[240px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-white text-sm">Year {label}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            isProjected
                              ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                              : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
                          }`}
                        >
                          {isProjected ? 'Projected Horizon' : 'Extended Project Lifecycle'}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-sky-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            Baseline OLS:
                          </span>
                          <span className="font-bold">
                            {payload.find((p) => p.dataKey === 'baselineOls')?.value} {meta.unitYield}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            AVDP Accelerated:
                          </span>
                          <span className="font-bold">
                            {payload.find((p) => p.dataKey === 'avdpAccelerated')?.value} {meta.unitYield}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-purple-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Agroforestry:
                          </span>
                          <span className="font-bold">
                            {payload.find((p) => p.dataKey === 'sustainableAgroforestry')?.value} {meta.unitYield}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-rose-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Climate Shock:
                          </span>
                          <span className="font-bold">
                            {payload.find((p) => p.dataKey === 'climateRisk')?.value} {meta.unitYield}
                          </span>
                        </div>

                        {targetYield > 0 && (
                          <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between text-rose-400 font-sans">
                            <span className="text-[10px]">Project Target Goal:</span>
                            <span className="font-mono font-bold">
                              {targetYield} {meta.unitYield}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
              />

              {/* 2027 Baseline Divider */}
              <ReferenceLine
                x={2027}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '2027 Extended Closure',
                  position: 'insideTopLeft',
                  fill: '#94a3b8',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              {/* Project Closure Target Line */}
              {targetYield > 0 && (
                <ReferenceLine
                  y={targetYield}
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{
                    value: `Project Target (${targetYield} ${meta.unitYield})`,
                    position: 'insideTopRight',
                    fill: '#fda4af',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
              )}

              {/* 4 Scenario Curves */}
              <Line
                type="monotone"
                dataKey="baselineOls"
                name="Baseline OLS Trend"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38bdf8' }}
              />
              <Line
                type="monotone"
                dataKey="avdpAccelerated"
                name="AVDP Accelerated Inputs"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3.5, fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="sustainableAgroforestry"
                name="Agroforestry & Soil Regeneration"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#a855f7' }}
              />
              <Line
                type="monotone"
                dataKey="climateRisk"
                name="Climate Shock & Drought"
                stroke="#f43f5e"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: '#f43f5e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {comparison.scenarios.map((sc) => {
          const isSelected = activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono"
                    style={{
                      backgroundColor: `${sc.color}20`,
                      color: sc.color,
                      borderColor: `${sc.color}40`,
                      borderWidth: '1px',
                    }}
                  >
                    {sc.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">{sc.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {sc.description}
                </p>

                {/* Project Closure Key Numbers */}
                <div className="mt-3 pt-3 border-t border-slate-800/70 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">Closure Projected Yield:</span>
                    <span className="font-bold text-white">
                      {sc.projectedClosureYield ?? sc.projected2030Yield} {meta.unitYield}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">Closure Target Gap:</span>
                    <span
                      className={`font-bold ${
                        sc.isGoalMet ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sc.isGoalMet ? (
                        <span className="flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Met (+{sc.netGainMT})
                        </span>
                      ) : (
                        `-${sc.deficitYieldMT} ${meta.unitYield}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">5-Yr CAGR:</span>
                    <span
                      className={`font-bold ${
                        sc.fiveYearCagrPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sc.fiveYearCagrPct >= 0 ? `+${sc.fiveYearCagrPct}%` : `${sc.fiveYearCagrPct}%`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">Goal Attainment:</span>
                    <span className="text-slate-200">
                      {sc.targetAttainmentClosurePct ?? sc.targetAttainment2030Pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  if (sc.id === 'baseline_ols' || sc.id === 'avdp_accelerated' || sc.id === 'climate_risk') {
                    onApplyScenario(sc.id);
                  } else {
                    onApplyScenario('avdp_accelerated', 1.2);
                  }
                }}
                className={`mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{isSelected ? 'Currently Selected' : 'Apply to Model'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Scenario Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">
            Detailed Scenario Comparison Matrix (Project Closure Milestone)
          </span>
          <span className="text-[11px] text-slate-400">
            Comparing production volume, yield gaps, and target achievement
          </span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-3 py-2.5">Scenario</th>
              <th className="px-3 py-2.5">Key Driver</th>
              <th className="px-3 py-2.5 text-right">Closure Yield ({meta.unitYield})</th>
              <th className="px-3 py-2.5 text-right">Target Attainment</th>
              <th className="px-3 py-2.5 text-right">Deficit Gap</th>
              <th className="px-3 py-2.5 text-right">Closure Production (MT)</th>
              <th className="px-3 py-2.5 text-right">5-Yr CAGR</th>
              <th className="px-3 py-2.5 text-center">Self-Sufficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {comparison.scenarios.map((sc) => (
              <tr
                key={sc.id}
                className={`hover:bg-slate-900/50 transition-colors ${
                  activeScenario === sc.id ? 'bg-emerald-950/20 font-bold' : ''
                }`}
              >
                <td className="px-3 py-2 font-bold text-white flex items-center gap-1.5 font-sans">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: sc.color }}
                  />
                  <span>{sc.name}</span>
                </td>
                <td className="px-3 py-2 text-slate-400 font-sans text-[11px]">
                  {sc.badge}
                </td>
                <td className="px-3 py-2 text-right font-bold text-white">
                  {sc.projectedClosureYield ?? sc.projected2030Yield}
                </td>
                <td className="px-3 py-2 text-right text-slate-200">
                  {sc.targetAttainmentClosurePct ?? sc.targetAttainment2030Pct}%
                </td>
                <td className="px-3 py-2 text-right font-bold">
                  {sc.isGoalMet ? (
                    <span className="text-emerald-400">Target Surpassed</span>
                  ) : (
                    <span className="text-rose-400">-{sc.deficitYieldMT} {meta.unitYield}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {(sc.projectedClosureProductionMT ?? sc.projected2030ProductionMT).toLocaleString()} MT
                </td>
                <td
                  className={`px-3 py-2 text-right font-bold ${
                    sc.fiveYearCagrPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {sc.fiveYearCagrPct >= 0 ? `+${sc.fiveYearCagrPct}%` : `${sc.fiveYearCagrPct}%`}
                </td>
                <td className="px-3 py-2 text-center font-sans">
                  {sc.isGoalMet ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Achieved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-700/60">
                      <AlertTriangle className="w-2.5 h-2.5" /> Shortfall
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
