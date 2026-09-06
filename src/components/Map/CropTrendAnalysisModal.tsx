/**
 * CropTrendAnalysisModal
 * Comprehensive Multi-Year Agricultural Trend Analysis & Predictive Modeling Inspector
 * Features:
 * - Interactive Recharts time-series with historical (2019-2025) + 2026 baseline + 2027-2030 projections
 * - 95% Confidence interval shaded band
 * - Scenario comparison (AVDP Accelerated vs Baseline OLS vs Climate Risk)
 * - District performance rankings & yield gap analysis
 * - Agronomic & policy intervention recommendations
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import {
  CommodityType,
  ProjectionScenario,
  COMMODITY_METADATA,
} from '../../data/cropTrendData';
import {
  CropTrendForecastService,
  DistrictForecastResult,
} from '../../services/cropTrendForecastService';

interface CropTrendAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string | null;
  onSelectDistrict: (district: string) => void;
  activeCommodity: CommodityType;
  onChangeCommodity: (c: CommodityType) => void;
  activeScenario: ProjectionScenario;
  onChangeScenario: (s: ProjectionScenario) => void;
  activeYear: number;
  onChangeYear: (yr: number) => void;
  isPlayingTimeline: boolean;
  onTogglePlayTimeline: () => void;
}

export const CropTrendAnalysisModal: React.FC<CropTrendAnalysisModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  onSelectDistrict,
  activeCommodity,
  onChangeCommodity,
  activeScenario,
  onChangeScenario,
  activeYear,
  onChangeYear,
  isPlayingTimeline,
  onTogglePlayTimeline,
}) => {
  const [chartMetric, setChartMetric] = useState<'yield' | 'production'>('yield');
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [compareNational, setCompareNational] = useState<boolean>(true);
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  const meta = COMMODITY_METADATA[activeCommodity];

  // Default to Bo or first district if none selected
  const effectiveDistrictName = selectedDistrict || 'Bo';

  // Forecast for selected district
  const districtForecast = useMemo(() => {
    return (
      CropTrendForecastService.getDistrictForecast(
        effectiveDistrictName,
        activeCommodity,
        activeScenario
      ) ||
      CropTrendForecastService.getDistrictForecast('Bo', activeCommodity, activeScenario)!
    );
  }, [effectiveDistrictName, activeCommodity, activeScenario]);

  // Forecasts for all 16 districts
  const allForecasts = useMemo(() => {
    return CropTrendForecastService.getAllDistrictForecasts(activeCommodity, activeScenario);
  }, [activeCommodity, activeScenario]);

  // National Summary
  const nationalSummary = useMemo(() => {
    return CropTrendForecastService.getNationalSummary(activeCommodity, activeScenario, activeYear);
  }, [activeCommodity, activeScenario, activeYear]);

  // Build combined time-series chart data (2019-2028)
  const chartData = useMemo(() => {
    const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];

    return years.map((yr) => {
      // District value
      const distPt = districtForecast.timeline.find((t) => t.year === yr);
      const isFuture = yr > 2026;

      // National weighted average
      let natProdSum = 0;
      let natAreaSum = 0;
      let natWeightedYieldSum = 0;

      allForecasts.forEach((f) => {
        const pt = f.timeline.find((t) => t.year === yr);
        if (pt) {
          natProdSum += pt.productionMT;
          natAreaSum += pt.harvestedAreaHa;
          natWeightedYieldSum += pt.yieldMTPerHa * pt.harvestedAreaHa;
        }
      });

      const natAvgYield = natAreaSum > 0 ? +(natWeightedYieldSum / natAreaSum).toFixed(2) : 0;

      const distYield = distPt?.yieldMTPerHa ?? 0;
      const distProd = distPt?.productionMT ?? 0;
      const lower = distPt?.confidenceLower95 ?? distYield;
      const upper = distPt?.confidenceUpper95 ?? distYield;

      return {
        year: yr,
        isFuture,
        // Historical vs Projected split for line continuity
        historicalYield: yr <= 2026 ? distYield : undefined,
        projectedYield: yr >= 2026 ? distYield : undefined,
        historicalProduction: yr <= 2026 ? distProd : undefined,
        projectedProduction: yr >= 2026 ? distProd : undefined,
        nationalYield: natAvgYield,
        nationalProduction: natProdSum,
        confidenceLower: lower,
        confidenceUpper: upper,
        confidenceSpan: [lower, upper],
      };
    });
  }, [districtForecast, allForecasts]);

  // Filtered district rankings
  const rankedDistricts = useMemo(() => {
    return [...allForecasts]
      .filter(
        (f) =>
          f.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          f.province.toLowerCase().includes(searchDistrict.toLowerCase())
      )
      .sort((a, b) => {
        const valA =
          chartMetric === 'yield'
            ? a.timeline.find((t) => t.year === activeYear)?.yieldMTPerHa || 0
            : a.timeline.find((t) => t.year === activeYear)?.productionMT || 0;
        const valB =
          chartMetric === 'yield'
            ? b.timeline.find((t) => t.year === activeYear)?.yieldMTPerHa || 0
            : b.timeline.find((t) => t.year === activeYear)?.productionMT || 0;
        return valB - valA;
      });
  }, [allForecasts, activeYear, chartMetric, searchDistrict]);

  if (!isOpen) return null;

  return (
    <div
      id="crop-trend-analysis-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* ------------------------------------------------------------- */}
        {/* 1. MODAL HEADER                                               */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 md:px-6 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border flex items-center justify-center text-xl shadow-inner"
              style={{
                backgroundColor: `${meta.accentColor}15`,
                borderColor: `${meta.accentColor}50`,
                color: meta.accentColor,
              }}
            >
              <span>{meta.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-extrabold text-white tracking-tight">
                  Multi-Year Trend Analysis &amp; Yield Projections
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                  2019 &ndash; 2027 Project Lifecycle (2028 Horizon)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  OLS + Capacity Ceiling Model
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sierra Leone AVDP &bull; District-level empirical trajectories and predictive scenarios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="trend-modal-close"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Analysis Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. COMMODITY & SCENARIO TOOLBAR                               */}
        {/* ------------------------------------------------------------- */}
        <div className="px-4 md:px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          {/* Commodity Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['rice', 'cocoa', 'oil_palm'] as CommodityType[]).map((c) => {
              const cMeta = COMMODITY_METADATA[c];
              const isSelected = activeCommodity === c;
              return (
                <button
                  key={c}
                  id={`commodity-tab-${c}`}
                  onClick={() => onChangeCommodity(c)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  style={isSelected ? { borderColor: `${cMeta.accentColor}80` } : {}}
                >
                  <span>{cMeta.icon}</span>
                  <span>{cMeta.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Scenario:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                id="scenario-avdp-accel"
                onClick={() => onChangeScenario('avdp_accelerated')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeScenario === 'avdp_accelerated'
                    ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                AVDP Accelerated (+45%)
              </button>
              <button
                id="scenario-baseline"
                onClick={() => onChangeScenario('baseline')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeScenario === 'baseline'
                    ? 'bg-blue-900/60 text-blue-200 border border-blue-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3 text-blue-400" />
                Historical OLS Baseline
              </button>
              <button
                id="scenario-climate-risk"
                onClick={() => onChangeScenario('climate_risk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeScenario === 'climate_risk'
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Climate Risk Stress
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. YEAR SCRUBBER & TIMELINE CONTROLS                          */}
        {/* ------------------------------------------------------------- */}
        <div className="px-4 md:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="timeline-play-pause"
              onClick={onTogglePlayTimeline}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isPlayingTimeline
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isPlayingTimeline ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Pause Timeline
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Animate Trajectory
                </>
              )}
            </button>

            <button
              id="timeline-reset"
              onClick={() => onChangeYear(2026)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              title="Reset to Baseline 2026"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px] text-slate-400">Target Year:</span>
              <span
                className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-black border ${
                  activeYear > 2026
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                    : 'bg-slate-800 text-white border-slate-700'
                }`}
              >
                {activeYear} {activeYear > 2026 ? '(Projected)' : activeYear === 2026 ? '(Current)' : '(Historical)'}
              </span>
            </div>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map((yr) => {
              const isSelected = yr === activeYear;
              const isFuture = yr > 2026;
              return (
                <button
                  key={yr}
                  onClick={() => onChangeYear(yr)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md scale-105'
                      : isFuture
                      ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/40'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {yr}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. MAIN SCROLLABLE CONTENT BODY                               */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Current Selected District Yield */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>{effectiveDistrictName} &bull; {activeYear} Yield</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {meta.shortName}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  {districtForecast.timeline.find((t) => t.year === activeYear)?.yieldMTPerHa ?? 0}{' '}
                  <span className="text-xs font-normal text-slate-400">{meta.unitYield}</span>
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {districtForecast.projectedCagrPct}% CAGR
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Agro-Frontier:</span>
                <span className="font-semibold text-slate-200">
                  {districtForecast.potentialFrontierYield} {meta.unitYield} (
                  {districtForecast.timeline.find((t) => t.year === activeYear)?.yieldGapPct}% attained)
                </span>
              </div>
            </div>

            {/* 2. District Projected Production */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>{effectiveDistrictName} &bull; Output</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {districtForecast.province}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  {(districtForecast.timeline.find((t) => t.year === activeYear)?.productionMT ?? 0).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">{meta.unitProd}</span>
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  +{(districtForecast.netProductionGainMT).toLocaleString()} MT by 2027
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Area Cultivated:</span>
                <span className="font-semibold text-slate-200">
                  {(districtForecast.timeline.find((t) => t.year === activeYear)?.harvestedAreaHa ?? 0).toLocaleString()} Ha
                </span>
              </div>
            </div>

            {/* 3. National Aggregate Output */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>National {activeYear} Production</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  16 Districts
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-300">
                  {(nationalSummary.totalProductionMT).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">{meta.unitProd}</span>
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Mean {nationalSummary.averageYieldMTPerHa} {meta.unitYield}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Closure Target Attainment:</span>
                <span className="font-semibold text-emerald-400">
                  {nationalSummary.nationalTarget2030AttainmentPct}%
                </span>
              </div>
            </div>

            {/* 4. Regression & Statistical Model Fit */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Statistical Regression Fit</span>
                <span className="text-[10px] font-mono text-slate-400">OLS R&sup2;</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  {(districtForecast.regression.rSquared * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  &plusmn;{districtForecast.regression.stdError.toFixed(2)} SE
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Annual Slope (&beta;1):</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  +{districtForecast.regression.slope.toFixed(3)} {meta.unitYield}/yr
                </span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 5. INTERACTIVE TIME-SERIES PROJECTION CHART                  */}
          {/* ----------------------------------------------------------- */}
          <div className="bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {effectiveDistrictName} District &bull; {meta.name} Multi-Year Trajectory
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    2019-2026 Monitoring + 2027 Closure / 2028 Horizon
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solid lines represent empirical data; dashed lines represent econometric projections with 95% confidence intervals.
                </p>
              </div>

              {/* Chart controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Metric toggle: Yield vs Production */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setChartMetric('yield')}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      chartMetric === 'yield'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Yield ({meta.unitYield})
                  </button>
                  <button
                    onClick={() => setChartMetric('production')}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      chartMetric === 'production'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Production ({meta.unitProd})
                  </button>
                </div>

                {/* Toggles */}
                <button
                  onClick={() => setShowConfidenceBand(!showConfidenceBand)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    showConfidenceBand
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  95% CI Band
                </button>

                <button
                  onClick={() => setCompareNational(!compareNational)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    compareNational
                      ? 'bg-sky-950/60 text-sky-300 border-sky-700/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  vs National Mean
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) =>
                      chartMetric === 'yield'
                        ? `${val}`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}k`
                        : `${val}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(val: any, name: string) => {
                      if (val === undefined || val === null) return ['N/A', name];
                      const num = typeof val === 'number' ? val : parseFloat(val);
                      if (name.includes('Yield')) return [`${num.toFixed(2)} ${meta.unitYield}`, name];
                      if (name.includes('Production')) return [`${Math.round(num).toLocaleString()} ${meta.unitProd}`, name];
                      return [val, name];
                    }}
                  />

                  {/* Reference line for currently active year */}
                  <ReferenceLine
                    x={activeYear}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: `Selected (${activeYear})`,
                      fill: '#fcd34d',
                      fontSize: 10,
                      position: 'insideTopLeft',
                    }}
                  />

                  {/* Reference line for baseline transition (2026) */}
                  <ReferenceLine
                    x={2026}
                    stroke="#64748b"
                    strokeDasharray="2 2"
                    label={{
                      value: 'Baseline Cutoff',
                      fill: '#94a3b8',
                      fontSize: 10,
                      position: 'insideBottomLeft',
                    }}
                  />

                  {/* Confidence Interval Upper/Lower Area */}
                  {showConfidenceBand && chartMetric === 'yield' && (
                    <Area
                      type="monotone"
                      dataKey="confidenceUpper"
                      stroke="transparent"
                      fill="#10b981"
                      fillOpacity={0.12}
                      name="95% CI Upper"
                    />
                  )}
                  {showConfidenceBand && chartMetric === 'yield' && (
                    <Area
                      type="monotone"
                      dataKey="confidenceLower"
                      stroke="transparent"
                      fill="#0f172a"
                      fillOpacity={1}
                      name="95% CI Lower"
                    />
                  )}

                  {/* National Average Line */}
                  {compareNational && (
                    <Line
                      type="monotone"
                      dataKey={chartMetric === 'yield' ? 'nationalYield' : 'nationalProduction'}
                      name="National Average"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}

                  {/* Historical Solid Line */}
                  <Line
                    type="monotone"
                    dataKey={chartMetric === 'yield' ? 'historicalYield' : 'historicalProduction'}
                    name={`${effectiveDistrictName} (Historical)`}
                    stroke={meta.accentColor}
                    strokeWidth={3}
                    dot={{ fill: meta.accentColor, r: 4, strokeWidth: 1, stroke: '#0f172a' }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Projected Dashed Line */}
                  <Line
                    type="monotone"
                    dataKey={chartMetric === 'yield' ? 'projectedYield' : 'projectedProduction'}
                    name={`${effectiveDistrictName} (Projected)`}
                    stroke={meta.accentColor}
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ fill: '#fbbf24', r: 4, strokeWidth: 1, stroke: '#0f172a' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Footnote */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: meta.accentColor }}></span>
                  <span>Historical Data (2019&ndash;2026)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-amber-400"></span>
                  <span className="text-amber-300">Projected Yield (2027 Closure &ndash; 2028 Horizon)</span>
                </div>
                {compareNational && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-b border-dashed border-sky-400"></span>
                    <span className="text-sky-300">National Weighted Mean</span>
                  </div>
                )}
                {showConfidenceBand && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-emerald-500/20 border border-emerald-500/40"></span>
                    <span>95% Confidence Envelope</span>
                  </div>
                )}
              </div>

              <span className="font-mono text-slate-500">
                Data Model: Sierra Leone MAFS / IFAD AVDP Baseline Analytics
              </span>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 6. DISTRICT RANKING & COMPARATIVE MATRIX TABLE              */}
          {/* ----------------------------------------------------------- */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 md:p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  District Cross-Comparison &bull; {activeYear} Projections ({allForecasts.length} Districts)
                </h3>
                <p className="text-xs text-slate-400">
                  Ranked by {chartMetric === 'yield' ? 'Yield Performance' : 'Total Output'}. Click any district to focus.
                </p>
              </div>

              {/* District search */}
              <input
                type="text"
                placeholder="Search district or province..."
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-900/50">
                    <th className="py-2.5 px-3"># Rank</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Province</th>
                    <th className="py-2.5 px-3 text-right">2026 Baseline</th>
                    <th className="py-2.5 px-3 text-right">{activeYear} {meta.primaryMetricLabel}</th>
                    <th className="py-2.5 px-3 text-right">Proj. CAGR</th>
                    <th className="py-2.5 px-3 text-right">Yield Gap %</th>
                    <th className="py-2.5 px-3">Dominant AVDP Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rankedDistricts.map((f, idx) => {
                    const pt = f.timeline.find((t) => t.year === activeYear) || f.timeline[f.timeline.length - 1];
                    const baselinePt = f.timeline.find((t) => t.year === 2026) || f.timeline[0];
                    const isCurrent = f.district.toLowerCase() === effectiveDistrictName.toLowerCase();

                    return (
                      <tr
                        key={f.district}
                        onClick={() => onSelectDistrict(f.district)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-emerald-950/40 text-emerald-200 font-semibold'
                            : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                          <span>{f.district}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-black">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{f.province}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {chartMetric === 'yield'
                            ? `${baselinePt.yieldMTPerHa.toFixed(2)} ${meta.unitYield}`
                            : `${Math.round(baselinePt.productionMT).toLocaleString()} ${meta.unitProd}`}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-300">
                          {chartMetric === 'yield'
                            ? `${pt.yieldMTPerHa.toFixed(2)} ${meta.unitYield}`
                            : `${Math.round(pt.productionMT).toLocaleString()} ${meta.unitProd}`}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400">
                          {f.projectedCagrPct >= 0 ? '+' : ''}{f.projectedCagrPct}%
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pt.yieldGapPct >= 75
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                : pt.yieldGapPct >= 50
                                ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                                : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                            }`}
                          >
                            {pt.yieldGapPct}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-xs" title={f.dominantIntervention}>
                          {f.dominantIntervention}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 7. AGRONOMIC CONTEXT & INTERVENTION ACTION PLAN             */}
          {/* ----------------------------------------------------------- */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 md:p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Agro-Ecological Zoning</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                <strong>{effectiveDistrictName}:</strong> {districtForecast.primaryAgroZone}.
                Agro-ecological yield potential is rated at <strong>{districtForecast.potentialFrontierYield} {meta.unitYield}</strong>.
              </p>
            </div>

            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                <Zap className="w-4 h-4" />
                <span>AVDP Core Value Chain Package</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {districtForecast.dominantIntervention}.
                Interventions drive an anticipated yield expansion of{' '}
                <strong>+{districtForecast.yieldChangePct}%</strong> by 2027 project closure under the{' '}
                {activeScenario.replace('_', ' ')} scenario.
              </p>
            </div>

            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-2">
                <ChevronRight className="w-4 h-4" />
                <span>M&amp;E Logframe Target Alignment</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Sierra Leone 2027 project closure target is <strong>{(meta.projectClosureTargetProduction || meta.nationalTarget2030Production).toLocaleString()} {meta.unitProd}</strong>.
                {activeYear} projections indicate <strong>{nationalSummary.nationalTarget2030AttainmentPct}%</strong> progress toward closure target.
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 8. FOOTER ACTIONS                                             */}
        {/* ------------------------------------------------------------- */}
        <div className="p-3 md:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Geographic Focus: <strong>{effectiveDistrictName} District</strong> ({districtForecast.province})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
          >
            Return to Map View
          </button>
        </div>
      </div>
    </div>
  );
};
