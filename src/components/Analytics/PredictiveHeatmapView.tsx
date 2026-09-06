import React, { useState, useMemo } from 'react';
import {
  Grid,
  MapPin,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { CommodityType } from '../../data/cropTrendData';
import {
  FutureYieldRegressionService,
  OutlookScenario,
  PredictiveHeatmapRow,
} from '../../services/futureYieldRegressionService';

interface PredictiveHeatmapViewProps {
  commodity: CommodityType;
  scenario: OutlookScenario;
  growthFactor: number;
  onSelectDistrict?: (district: string) => void;
}

type HeatmapMetric = 'yield' | 'attainment' | 'deficit' | 'cagr';

export const PredictiveHeatmapView: React.FC<PredictiveHeatmapViewProps> = ({
  commodity,
  scenario,
  growthFactor,
  onSelectDistrict,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<HeatmapMetric>('attainment');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'attainment' | 'yield2027' | 'deficit' | 'cagr' | 'name'>('attainment');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeDistrictDetail, setActiveDistrictDetail] = useState<PredictiveHeatmapRow | null>(null);

  // Compute heatmap matrix
  const heatmapData = useMemo(() => {
    return FutureYieldRegressionService.computeDistrictHeatmap(commodity, scenario, growthFactor);
  }, [commodity, scenario, growthFactor]);

  // Available provinces
  const provinces = useMemo(() => {
    const set = new Set<string>();
    heatmapData.rows.forEach((r) => {
      if (r.province !== 'All Sierra Leone') {
        set.add(r.province);
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [heatmapData]);

  // Filtered & sorted rows
  const displayedRows = useMemo(() => {
    let list = heatmapData.rows;
    if (selectedProvince !== 'All') {
      list = list.filter((r) => r.province === selectedProvince || r.district === 'National Aggregate');
    }

    // Keep National Aggregate at top or sort alongside
    const nationalRow = list.find((r) => r.district === 'National Aggregate');
    const districtRows = list.filter((r) => r.district !== 'National Aggregate');

    districtRows.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'attainment') {
        valA = a.attainmentClosurePct ?? a.attainment2030Pct;
        valB = b.attainmentClosurePct ?? b.attainment2030Pct;
      } else if (sortBy === 'yield2027') {
        valA = a.y2027 ?? a.y2030;
        valB = b.y2027 ?? b.y2030;
      } else if (sortBy === 'deficit') {
        valA = a.deficitClosureMT ?? a.deficit2030MT;
        valB = b.deficitClosureMT ?? b.deficit2030MT;
      } else if (sortBy === 'cagr') {
        valA = a.cagrProjectPct ?? a.cagr5YrPct;
        valB = b.cagrProjectPct ?? b.cagr5YrPct;
      } else {
        return sortOrder === 'asc' ? a.district.localeCompare(b.district) : b.district.localeCompare(a.district);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return nationalRow ? [nationalRow, ...districtRows] : districtRows;
  }, [heatmapData, selectedProvince, sortBy, sortOrder]);

  // Quick KPI summaries
  const stats = useMemo(() => {
    const districtsOnly = heatmapData.rows.filter((r) => r.district !== 'National Aggregate');
    const totalDistricts = districtsOnly.length;
    const meetingGoal = districtsOnly.filter((r) => (r.attainmentClosurePct ?? r.attainment2030Pct) >= 100).length;
    const highDeficit = districtsOnly.filter((r) => (r.attainmentClosurePct ?? r.attainment2030Pct) < 70).length;
    const meetingGoalPct = totalDistricts > 0 ? Math.round((meetingGoal / totalDistricts) * 100) : 0;

    return {
      totalDistricts,
      meetingGoal,
      meetingGoalPct,
      highDeficit,
      topDistrict: heatmapData.topPerformingDistrict,
      vulnerableDistrict: heatmapData.mostVulnerableDistrict,
      avgAttainment: heatmapData.avgAttainmentPct,
    };
  }, [heatmapData]);

  // Cell coloring helper
  const getCellColor = (
    val: number,
    metric: HeatmapMetric,
    row: PredictiveHeatmapRow
  ): { bg: string; text: string; border?: string } => {
    if (metric === 'attainment') {
      const pct = val;
      if (pct >= 100) {
        return { bg: 'bg-emerald-500/25', text: 'text-emerald-300 font-bold', border: 'border-emerald-500/40' };
      }
      if (pct >= 85) {
        return { bg: 'bg-teal-500/20', text: 'text-teal-300 font-semibold', border: 'border-teal-500/30' };
      }
      if (pct >= 70) {
        return { bg: 'bg-amber-500/20', text: 'text-amber-300 font-semibold', border: 'border-amber-500/30' };
      }
      return { bg: 'bg-rose-500/25', text: 'text-rose-300 font-semibold', border: 'border-rose-500/30' };
    }

    if (metric === 'yield') {
      const { minYield, maxYield } = heatmapData;
      const range = maxYield - minYield || 1;
      const ratio = Math.max(0, Math.min(1, (val - minYield) / range));
      if (ratio >= 0.75) {
        return { bg: 'bg-emerald-500/30', text: 'text-emerald-200 font-bold' };
      }
      if (ratio >= 0.5) {
        return { bg: 'bg-emerald-900/40', text: 'text-emerald-300' };
      }
      if (ratio >= 0.25) {
        return { bg: 'bg-slate-800/80', text: 'text-slate-300' };
      }
      return { bg: 'bg-amber-950/40', text: 'text-amber-300' };
    }

    if (metric === 'deficit') {
      if (val === 0) {
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-300 font-bold' };
      }
      if (val < 0.5) {
        return { bg: 'bg-amber-500/20', text: 'text-amber-300' };
      }
      return { bg: 'bg-rose-500/25', text: 'text-rose-300 font-semibold' };
    }

    // CAGR
    if (val >= 6) {
      return { bg: 'bg-emerald-500/25', text: 'text-emerald-300 font-bold' };
    }
    if (val >= 3) {
      return { bg: 'bg-teal-500/20', text: 'text-teal-300' };
    }
    if (val >= 0) {
      return { bg: 'bg-slate-800/80', text: 'text-slate-300' };
    }
    return { bg: 'bg-rose-500/25', text: 'text-rose-300' };
  };

  const years = [
    { label: '2019 Incept', key: 'y2019' as const },
    { label: '2021 Early', key: 'y2021' as const },
    { label: '2023 Mid', key: 'y2023' as const },
    { label: '2025 Pre-Close', key: 'y2025' as const },
    { label: '2026 Baseline', key: 'baseline2026' as const },
    { label: '2027 Closure', key: 'y2027' as const },
    { label: '2028 Horizon', key: 'y2028' as const },
  ];

  const closureTarget = heatmapData.commodityMeta.projectClosureTargetYield || heatmapData.commodityMeta.nationalTarget2030Yield;

  return (
    <div className="space-y-4">
      {/* Top Banner & Analytical Overview */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Grid className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Spatial &amp; Temporal Predictive Yield Heatmap (2019–2027 Inception-to-Closure / 2028 Horizon)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                16 Districts + National Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Cross-district predictive trajectory matrix strictly modeling project inception to extended closure (2019–2027) with close-out horizon up to 2028 for{' '}
              <strong className="text-slate-200">{heatmapData.commodityMeta.name}</strong> under the active scenario.
              Project closure target: <strong className="text-amber-300 font-mono">{closureTarget} {heatmapData.commodityMeta.unitYield}</strong> by 2027.
            </p>
          </div>

          {/* Quick Metrics Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 border border-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setSelectedMetric('attainment')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'attainment'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Target Attainment (%)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('yield')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'yield'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yield Value ({heatmapData.commodityMeta.unitYield})
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('deficit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'deficit'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deficit / Surplus
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('cagr')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'cagr'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lifecycle CAGR (%)
            </button>
          </div>
        </div>

        {/* Highlight KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <div className="p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              Closure Attainment Avg
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold font-mono text-emerald-400">
                {stats.avgAttainment}%
              </span>
              <span className="text-[10px] text-slate-400">of 2027 Closure Target</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              Districts Meeting Goal
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold font-mono text-teal-300">
                {stats.meetingGoal} / {stats.totalDistricts}
              </span>
              <span className="text-[10px] text-teal-400/80">({stats.meetingGoalPct}%)</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              Top Projected District
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 truncate">
              <span className="text-sm font-bold text-slate-200 truncate">
                {stats.topDistrict}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Largest Deficit Risk
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 truncate">
              <span className="text-sm font-bold text-rose-300 truncate">
                {stats.vulnerableDistrict}
              </span>
              <span className="text-[10px] text-rose-400/80">({stats.highDeficit} lagging)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        {/* Province Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            Province:
          </span>
          {provinces.map((prov) => (
            <button
              key={prov}
              type="button"
              onClick={() => setSelectedProvince(prov)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedProvince === prov
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden"
          >
            <option value="attainment">2027 Closure Attainment %</option>
            <option value="yield2027">2027 Projected Yield</option>
            <option value="deficit">Closure Deficit Shortfall</option>
            <option value="cagr">Lifecycle CAGR Growth</option>
            <option value="name">District Name</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={`Toggle sort order (${sortOrder.toUpperCase()})`}
          >
            {sortOrder === 'desc' ? 'High → Low' : 'Low → High'}
          </button>
        </div>
      </div>

      {/* Heatmap Color Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px]">
        <span className="text-slate-400 font-semibold">Heatmap Intensity:</span>
        {selectedMetric === 'attainment' ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-3 h-3 rounded-xs bg-emerald-500/30 border border-emerald-500/40 inline-block" />
              &ge; 100% (Closure Target Achieved)
            </span>
            <span className="flex items-center gap-1.5 text-teal-300">
              <span className="w-3 h-3 rounded-xs bg-teal-500/25 border border-teal-500/30 inline-block" />
              85% – 99% (On Track)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-3 h-3 rounded-xs bg-amber-500/25 border border-amber-500/30 inline-block" />
              70% – 84% (Moderate Risk)
            </span>
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="w-3 h-3 rounded-xs bg-rose-500/30 border border-rose-500/40 inline-block" />
              &lt; 70% (Severe Deficit)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Lowest</span>
            <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-amber-950/80 via-slate-800 to-emerald-500" />
            <span className="text-emerald-400 font-bold">Highest Performance</span>
          </div>
        )}
      </div>

      {/* Main Heatmap Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <th className="py-3 px-3 font-semibold sticky left-0 bg-slate-900/95 z-10 w-44">
                District / Province
              </th>
              {years.map((y) => (
                <th key={y.key} className="py-3 px-2.5 font-semibold text-center w-24">
                  {y.label}
                </th>
              ))}
              <th className="py-3 px-2.5 font-semibold text-center w-24">Closure Goal</th>
              <th className="py-3 px-2.5 font-semibold text-center w-28">Attainment (2027)</th>
              <th className="py-3 px-2.5 font-semibold text-center w-24">Lifecycle CAGR</th>
              <th className="py-3 px-3 font-semibold text-center w-24">Status</th>
              <th className="py-3 px-2.5 font-semibold text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {displayedRows.map((row) => {
              const isNational = row.district === 'National Aggregate';
              const isSelected = activeDistrictDetail?.district === row.district;
              const target = row.targetClosure ?? row.target2030 ?? closureTarget;
              const attainmentPct = row.attainmentClosurePct ?? row.attainment2030Pct;
              const cagr = row.cagrProjectPct ?? row.cagr5YrPct;

              return (
                <tr
                  key={row.district}
                  onClick={() => setActiveDistrictDetail(isSelected ? null : row)}
                  className={`transition-colors cursor-pointer ${
                    isNational
                      ? 'bg-emerald-950/20 font-semibold'
                      : isSelected
                      ? 'bg-slate-800/70'
                      : 'hover:bg-slate-900/50'
                  }`}
                >
                  {/* District & Province */}
                  <td className="py-2.5 px-3 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isNational ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <div className="truncate">
                        <span
                          className={`truncate font-bold ${
                            isNational ? 'text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {row.district}
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate">
                          {row.province}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Year Columns (Heatmap Cells) */}
                  {years.map((y) => {
                    const val = (row as any)[y.key] ?? 0;
                    // Display value depending on selected metric
                    let displayVal = `${val.toFixed(2)}`;
                    let colorVal = val;

                    if (selectedMetric === 'attainment') {
                      const att = Math.round((val / target) * 100);
                      displayVal = `${att}%`;
                      colorVal = att;
                    } else if (selectedMetric === 'deficit') {
                      const def = Math.max(0, target - val);
                      displayVal = def === 0 ? 'Surplus' : `-${def.toFixed(2)}`;
                      colorVal = def;
                    } else if (selectedMetric === 'cagr') {
                      const baseVal = row.y2019 ?? row.baseline2026 ?? 1;
                      const cagrVal =
                        y.key === 'y2019'
                          ? 0
                          : Math.round(((val - baseVal) / (baseVal || 1)) * 100);
                      displayVal = `${cagrVal >= 0 ? '+' : ''}${cagrVal}%`;
                      colorVal = cagrVal;
                    }

                    const style = getCellColor(colorVal, selectedMetric, row);

                    return (
                      <td key={y.key} className="py-2 px-1 text-center">
                        <div
                          className={`mx-auto py-1 px-1.5 rounded-lg text-[11px] font-mono transition-all ${
                            style.bg
                          } ${style.text} ${style.border || ''}`}
                          title={`${row.district} (${y.label}): Yield ${val.toFixed(2)} ${
                            heatmapData.commodityMeta.unitYield
                          } | Closure Attainment ${Math.round((val / target) * 100)}%`}
                        >
                          {displayVal}
                        </div>
                      </td>
                    );
                  })}

                  {/* Closure Target */}
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] text-amber-300 font-semibold">
                    {target.toFixed(2)}
                  </td>

                  {/* Attainment % */}
                  <td className="py-2.5 px-2 text-center font-mono text-[11px]">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`font-bold ${
                          attainmentPct >= 100
                            ? 'text-emerald-400'
                            : attainmentPct >= 85
                            ? 'text-teal-300'
                            : attainmentPct >= 70
                            ? 'text-amber-300'
                            : 'text-rose-400'
                        }`}
                      >
                        {attainmentPct}%
                      </span>
                    </div>
                  </td>

                  {/* Lifecycle CAGR */}
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-300">
                    <span className={cagr >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {cagr >= 0 ? '+' : ''}
                      {cagr}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Surpassed'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : row.status === 'On Track'
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          : row.status === 'Moderate Risk'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Quick Select */}
                  <td className="py-2.5 px-2 text-center">
                    {onSelectDistrict && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDistrict(row.district);
                        }}
                        className="p-1 rounded-md bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                        title={`Load ${row.district} in Primary Outlook Model`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected District Drilldown Drawer / Card */}
      {activeDistrictDetail && (
        <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                {activeDistrictDetail.district} District Agribusiness Profile &bull; {activeDistrictDetail.province}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                Fit R² = {(activeDistrictDetail.rSquared * 100).toFixed(1)}%
              </span>
            </div>

            {onSelectDistrict && (
              <button
                type="button"
                onClick={() => onSelectDistrict(activeDistrictDetail.district)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <span>Load in Primary Trend Model</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[11px] block">Primary Agro-Ecological Zone:</span>
              <span className="text-slate-200 font-semibold">
                {activeDistrictDetail.primaryAgroZone}
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[11px] block">Dominant AVDP Intervention:</span>
              <span className="text-slate-200 font-semibold">
                {activeDistrictDetail.dominantIntervention}
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[11px] block">2027 Project Closure Outcome:</span>
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>{activeDistrictDetail.y2027 ?? activeDistrictDetail.y2030} {heatmapData.commodityMeta.unitYield}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {activeDistrictDetail.attainmentClosurePct ?? activeDistrictDetail.attainment2030Pct}% of Target
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
