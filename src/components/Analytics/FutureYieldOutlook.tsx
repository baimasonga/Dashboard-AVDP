/**
 * Future Yield Outlook Component
 * Evaluates project lifecycle data (2019–2027) for Rice, Cocoa, and Palm Oil across Sierra Leone
 * and runs econometric projections bounded by project closure (2027) with an adjusted horizon capped at 2028.
 * Features an interactive Recharts trend line graph with 95% confidence intervals, scenario modeling,
 * district filters, and econometric diagnostics.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Filter,
  Layers,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  Award,
  Leaf,
  SlidersHorizontal,
  Sliders,
  RotateCcw,
  Sprout,
  Target,
  RefreshCw,
  Zap,
  FileSpreadsheet,
  GitCompare,
  ShieldCheck,
  Grid,
  Compass,
} from 'lucide-react';
import {
  CommodityType,
  COMMODITY_METADATA,
  DISTRICT_CROP_SERIES,
} from '../../data/cropTrendData';
import {
  FutureYieldRegressionService,
  OutlookScenario,
  FiveYearOutlookResult,
  DataPoint,
  YieldScenarioPreset,
  YIELD_SCENARIO_PRESETS,
} from '../../services/futureYieldRegressionService';
import {
  RicePaddyIcon,
  CocoaPodIcon,
  OilPalmIcon,
} from '../Common/AgriIcons';
import { ScenarioComparisonView } from './ScenarioComparisonView';
import { CropSensitivityView } from './CropSensitivityView';
import { ForecastConfidenceView } from './ForecastConfidenceView';
import { ExportOutlookMenu } from './ExportOutlookMenu';
import { PredictiveHeatmapView } from './PredictiveHeatmapView';
import { CompareTrajectoryView } from './CompareTrajectoryView';
import { YieldScenarioPresetsModal, PresetQuickBar } from './YieldScenarioPresetsModal';

interface FutureYieldOutlookProps {
  initialCommodity?: CommodityType;
  initialDistrict?: string;
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const FutureYieldOutlook: React.FC<FutureYieldOutlookProps> = ({
  initialCommodity = 'rice',
  initialDistrict = 'National Aggregate',
  selectedDistrict: propSelectedDistrict,
  onSelectDistrict,
  className = '',
  isCompact = false,
}) => {
  // State
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityType>(initialCommodity);
  const [isMultiCropView, setIsMultiCropView] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    propSelectedDistrict || initialDistrict
  );
  const [selectedScenario, setSelectedScenario] = useState<OutlookScenario>('baseline_ols');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(5); // 3, 5, or 7 years
  const [activeMetric, setActiveMetric] = useState<'yield' | 'production' | 'area'>('yield');
  // Dynamic growth factor variable (0.50x to 2.50x) representing agronomic inputs (e.g. improved seeds, fertilizer micro-dosing)
  const [growthFactor, setGrowthFactor] = useState<number>(1.0);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true);
  const [showRegressionTrendline, setShowRegressionTrendline] = useState<boolean>(true);
  const [showDeficitGap, setShowDeficitGap] = useState<boolean>(true);
  const [showDataTable, setShowDataTable] = useState<boolean>(false);

  // Active Outlook Mode Tab: 'trend_model' | 'scenario_comparison' | 'crop_sensitivity' | 'forecast_confidence' | 'predictive_heatmap' | 'compare_trajectory'
  const [activeOutlookTab, setActiveOutlookTab] = useState<
    | 'trend_model'
    | 'scenario_comparison'
    | 'crop_sensitivity'
    | 'forecast_confidence'
    | 'predictive_heatmap'
    | 'compare_trajectory'
  >('trend_model');

  // Scenario presets state
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | undefined>('vision_2030_sufficiency');
  const [presetAppliedMessage, setPresetAppliedMessage] = useState<string | null>(null);

  // Interactive agronomic sensitivity lever settings
  const [sensitivityLevers, setSensitivityLevers] = useState<Record<string, number>>({
    fertilizer_npk: 35,
    certified_seeds: 30,
    rainfall_anomaly: 0,
    mechanization_access: 15,
  });

  const handleLeverChange = (id: string, value: number) => {
    setSensitivityLevers((prev) => ({ ...prev, [id]: value }));
  };

  const handleResetLevers = () => {
    setSensitivityLevers({
      fertilizer_npk: 35,
      certified_seeds: 30,
      rainfall_anomaly: 0,
      mechanization_access: 15,
    });
  };

  const handleApplyScenario = (scenario: OutlookScenario, gf?: number) => {
    setSelectedScenario(scenario);
    if (gf !== undefined) {
      setGrowthFactor(gf);
    }
    setActiveOutlookTab('trend_model');
  };

  const handleApplyPreset = (preset: YieldScenarioPreset) => {
    setSelectedScenario(preset.scenario);
    setGrowthFactor(preset.growthFactor);
    setSensitivityLevers(preset.leverSettings);
    setActivePresetId(preset.id);
    setPresetAppliedMessage(`Applied "${preset.name}" (${preset.growthFactor.toFixed(2)}x factor)`);
    setTimeout(() => {
      setPresetAppliedMessage(null);
    }, 4500);
  };

  // Available districts grouped by province
  const districtList = useMemo(() => {
    const districts = Array.from(new Set(DISTRICT_CROP_SERIES.map((s) => s.district))).sort();
    return ['National Aggregate', ...districts];
  }, []);

  // Sync with prop when external selectedDistrict changes
  useEffect(() => {
    if (propSelectedDistrict && propSelectedDistrict !== selectedDistrict) {
      if (districtList.includes(propSelectedDistrict)) {
        setSelectedDistrict(propSelectedDistrict);
      }
    }
  }, [propSelectedDistrict, districtList]);

  // Compute 5-Year Outlook for the selected commodity
  const outlookResult: FiveYearOutlookResult = useMemo(() => {
    return FutureYieldRegressionService.run5YearOutlook(
      selectedCommodity,
      selectedDistrict,
      selectedScenario,
      selectedHorizon,
      growthFactor
    );
  }, [selectedCommodity, selectedDistrict, selectedScenario, selectedHorizon, growthFactor]);

  // Compute multi-crop comparison
  const multiCropComparison = useMemo(() => {
    if (!isMultiCropView) return null;
    return FutureYieldRegressionService.compareAllCommodities(
      selectedDistrict,
      selectedScenario,
      growthFactor
    );
  }, [isMultiCropView, selectedDistrict, selectedScenario, growthFactor]);

  // Transform data for Recharts (Metric-aware for Yield, Production, or Area)
  const chartData = useMemo(() => {
    if (isMultiCropView && multiCropComparison) {
      return multiCropComparison.indexedComparison;
    }

    const targetVal =
      activeMetric === 'yield'
        ? (outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield)
        : activeMetric === 'production'
        ? (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)
        : 0;

    return outlookResult.allPoints.map((pt) => {
      const isHistorical = !pt.isProjected;
      const metricVal =
        activeMetric === 'yield'
          ? pt.yieldMTPerHa
          : activeMetric === 'production'
          ? pt.productionMT
          : pt.harvestedAreaHa;

      const histMetric = isHistorical || pt.year === 2027 ? metricVal : null;
      const projMetric = pt.isProjected || pt.year === 2027 ? metricVal : null;

      // Deficit curve boundary for Area component filled to baseValue
      const deficitCurve =
        (pt.isProjected || pt.year === 2027) && targetVal > 0
          ? Math.min(metricVal, targetVal)
          : null;

      // Metric CI
      const ciLowerVal =
        activeMetric === 'yield'
          ? pt.confidenceLower95
          : activeMetric === 'production'
          ? Math.round(pt.confidenceLower95 * pt.harvestedAreaHa)
          : pt.harvestedAreaHa;

      const ciUpperVal =
        activeMetric === 'yield'
          ? pt.confidenceUpper95
          : activeMetric === 'production'
          ? Math.round(pt.confidenceUpper95 * pt.harvestedAreaHa)
          : pt.harvestedAreaHa;

      return {
        year: pt.year,
        isProjected: pt.isProjected,
        // Active metric primary fields
        metricValue: metricVal,
        historicalMetric: histMetric,
        projectedMetric: projMetric,
        // CI bounds (only for projections)
        ciRange: pt.isProjected ? [ciLowerVal, ciUpperVal] : null,
        ciLower: pt.isProjected ? ciLowerVal : metricVal,
        ciUpper: pt.isProjected ? ciUpperVal : metricVal,
        // Regression trend line (only for yield)
        regressionLine: activeMetric === 'yield' ? pt.regressionTrend : null,
        // Deficit gap curve
        deficitCurve: deficitCurve,
        targetVal: targetVal,
        // Specific individual crop metrics
        historicalYield: isHistorical || pt.year === 2027 ? pt.yieldMTPerHa : null,
        projectedYield: pt.isProjected || pt.year === 2027 ? pt.yieldMTPerHa : null,
        deficitYieldCurve:
          (pt.isProjected || pt.year === 2027) &&
          (outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield) > 0
            ? Math.min(
                pt.yieldMTPerHa,
                outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield
              )
            : null,
        deficitGapRange: pt.deficitGapRange,
        deficitShortfallMT: pt.deficitShortfallMT,
        deficitPctOfTarget: pt.deficitPctOfTarget,
        productionShortfallMT: pt.productionShortfallMT,
        productionMT: pt.productionMT,
        harvestedAreaHa: pt.harvestedAreaHa,
        yieldMTPerHa: pt.yieldMTPerHa,
      };
    });
  }, [outlookResult, isMultiCropView, multiCropComparison, activeMetric]);

  // Color palette for current commodity
  const palette = useMemo(() => {
    switch (selectedCommodity) {
      case 'cocoa':
        return {
          primary: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.3)',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          gradientFrom: '#f59e0b',
          gradientTo: '#d97706',
        };
      case 'oil_palm':
        return {
          primary: '#22c55e',
          glow: 'rgba(34, 197, 94, 0.3)',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          gradientFrom: '#22c55e',
          gradientTo: '#15803d',
        };
      case 'rice':
      default:
        return {
          primary: '#10b981',
          glow: 'rgba(16, 185, 129, 0.3)',
          badge: 'bg-teal-950/80 text-teal-300 border-teal-700/60',
          gradientFrom: '#10b981',
          gradientTo: '#047857',
        };
    }
  }, [selectedCommodity]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Year',
      'Status',
      'Yield_MT_Per_Ha',
      'CI_Lower_95',
      'CI_Upper_95',
      'Project_Closure_Target_Yield',
      'Deficit_Gap_MT_Per_Ha',
      'Deficit_Pct_Of_Target',
      'Production_Shortfall_MT',
      'Production_MT',
      'Harvested_Area_Ha',
    ];
    const rows = outlookResult.allPoints.map((p) => [
      p.year,
      p.isProjected ? 'Horizon Projection' : p.year === 2027 ? 'Extended Lifecycle Baseline' : 'Historical',
      p.yieldMTPerHa,
      p.confidenceLower95 ?? p.yieldMTPerHa,
      p.confidenceUpper95 ?? p.yieldMTPerHa,
      outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield,
      p.deficitShortfallMT ?? 0,
      p.deficitPctOfTarget ?? 0,
      p.productionShortfallMT ?? 0,
      p.productionMT,
      p.harvestedAreaHa,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `AVDP_Future_Yield_Outlook_${selectedCommodity}_${selectedDistrict.replace(/\s+/g, '_')}_2019_2028.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPt = outlookResult.allPoints.find((p) => p.year === label);
    const isProjected = label > 2027;
    const baselineYield = outlookResult.baselineYield;
    const currentYield = dataPt?.yieldMTPerHa ?? 0;
    const diffFromBaseline = +(currentYield - baselineYield).toFixed(2);
    const pctFromBaseline = baselineYield > 0 ? +((diffFromBaseline / baselineYield) * 100).toFixed(1) : 0;
    const targetYield = outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield;
    const hasDeficit = targetYield > 0 && currentYield < targetYield;
    const shortfallMT = hasDeficit ? +(targetYield - currentYield).toFixed(2) : 0;
    const shortfallPct = hasDeficit && targetYield > 0 ? +((shortfallMT / targetYield) * 100).toFixed(1) : 0;
    const volumeShortfall = hasDeficit && dataPt ? Math.round(shortfallMT * dataPt.harvestedAreaHa) : 0;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[260px] max-w-xs">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-white text-sm">Year {label}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isProjected
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                : label === 2027
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isProjected ? 'Projected Horizon' : label === 2027 ? 'Extended Lifecycle Closure' : 'Historical Empirical'}
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Projected Yield:</span>
            <span className="text-white font-bold font-mono text-sm">
              {currentYield} {outlookResult.commodityMeta.unitYield}
            </span>
          </div>

          {isProjected && (
            <>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>95% Confidence Band:</span>
                <span className="text-slate-300 font-mono">
                  [{dataPt?.confidenceLower95} - {dataPt?.confidenceUpper95}]
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Change vs Baseline:</span>
                <span
                  className={`font-mono font-bold flex items-center gap-0.5 ${
                    diffFromBaseline >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {diffFromBaseline >= 0 ? '+' : ''}
                  {diffFromBaseline} MT/Ha ({diffFromBaseline >= 0 ? '+' : ''}
                  {pctFromBaseline}%)
                </span>
              </div>
            </>
          )}

          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Production:</span>
            <span className="text-slate-200 font-mono font-medium">
              {dataPt?.productionMT?.toLocaleString()} MT
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Harvested Area:</span>
            <span className="text-slate-200 font-mono font-medium">
              {dataPt?.harvestedAreaHa?.toLocaleString()} Ha
            </span>
          </div>
        </div>

        {/* Project Closure Goal & Deficit Callout */}
        {label >= 2027 && targetYield > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3 text-rose-400" />
                Project Closure Goal:
              </span>
              <span className="text-white font-mono font-bold">
                {targetYield} {outlookResult.commodityMeta.unitYield}
              </span>
            </div>

            {hasDeficit ? (
              <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/70 space-y-1">
                <div className="flex items-center justify-between text-rose-300 font-bold text-[11px]">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Deficit Gap (Shortfall):
                  </span>
                  <span className="font-mono text-rose-300">
                    -{shortfallMT} {outlookResult.commodityMeta.unitYield} (-{shortfallPct}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-rose-300/80">
                  <span>Est. Production Shortfall:</span>
                  <span className="font-mono font-semibold text-white">
                    ~{volumeShortfall.toLocaleString()} MT
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/70 flex items-center justify-between text-emerald-300 font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  National Goal Reached
                </span>
                <span className="font-mono">
                  +{(currentYield - targetYield).toFixed(2)} {outlookResult.commodityMeta.unitYield}
                </span>
              </div>
            )}
          </div>
        )}

        {isProjected && (
          <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 italic">
            Linear OLS slope: {outlookResult.regression.annualChangeLabel}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="future-yield-outlook"
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm ${className}`}
    >
      {/* Component Header & Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Future Yield Outlook
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Extended Lifecycle Outlook (2019–2027 &bull; 2028 Horizon)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  95% Prediction Interval
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Econometric Ordinary Least Squares (OLS) trajectory based on extended project lifecycle (2019–2027) empirical data for rice, cocoa, and palm oil.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: District, Scenario, Horizon */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* District Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                onSelectDistrict?.(e.target.value);
              }}
              className="bg-transparent text-slate-200 font-semibold focus:outline-hidden cursor-pointer text-xs"
            >
              {districtList.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">Scenario:</span>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value as OutlookScenario)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="baseline_ols" className="bg-slate-900 text-slate-200">
                Baseline OLS (Trend Continuation)
              </option>
              <option value="avdp_accelerated" className="bg-slate-900 text-slate-200">
                AVDP Accelerated (+40% Momentum)
              </option>
              <option value="climate_risk" className="bg-slate-900 text-slate-200">
                Climate Variability Risk (-45% Drag)
              </option>
            </select>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 text-xs">
            {[3, 5, 7].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHorizon(h)}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  selectedHorizon === h
                    ? 'bg-emerald-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}Y
              </button>
            ))}
          </div>

          {/* Export Outlook Menu */}
          <ExportOutlookMenu outlookResult={outlookResult} />
        </div>
      </div>

      {/* Primary Outlook Mode Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-3 border-b border-slate-800 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveOutlookTab('trend_model')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeOutlookTab === 'trend_model'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trend &amp; Projection</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOutlookTab('scenario_comparison')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeOutlookTab === 'scenario_comparison'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Scenario Comparison</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOutlookTab('crop_sensitivity')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeOutlookTab === 'crop_sensitivity'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Crop Sensitivity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOutlookTab('forecast_confidence')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeOutlookTab === 'forecast_confidence'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Forecast Confidence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOutlookTab('predictive_heatmap')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeOutlookTab === 'predictive_heatmap'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Predictive Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOutlookTab('compare_trajectory')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeOutlookTab === 'compare_trajectory'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Compare Trajectory</span>
        </button>

        <div className="ml-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsPresetsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Yield Presets ({YIELD_SCENARIO_PRESETS.length})</span>
          </button>
        </div>
      </div>

      {/* Preset Applied Toast / Banner */}
      {presetAppliedMessage && (
        <div className="my-2 p-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{presetAppliedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setPresetAppliedMessage(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Commodity Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
        {/* Commodity Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              setSelectedCommodity('rice');
              setIsMultiCropView(false);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              !isMultiCropView && selectedCommodity === 'rice'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <RicePaddyIcon className="w-4 h-4 stroke-[2.2]" />
            <span>Rice (IVS &amp; Boliland)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCommodity('cocoa');
              setIsMultiCropView(false);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              !isMultiCropView && selectedCommodity === 'cocoa'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CocoaPodIcon className="w-4 h-4 stroke-[2.2]" />
            <span>Cocoa (Export Grade 1)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCommodity('oil_palm');
              setIsMultiCropView(false);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              !isMultiCropView && selectedCommodity === 'oil_palm'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <OilPalmIcon className="w-4 h-4 stroke-[2.2]" />
            <span>Palm Oil (FFB &amp; CPO)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMultiCropView(!isMultiCropView)}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isMultiCropView
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Multi-Crop Normalized Growth Index"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare All (Index)</span>
          </button>
        </div>

        {/* Center/Right Controls: Metric Selector & View Toggles (Trend Model View) */}
        {activeOutlookTab === 'trend_model' ? (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Metric Selector (Yield / Production / Area) */}
            {!isMultiCropView && (
              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMetric('yield')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeMetric === 'yield'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Yield ({outlookResult.commodityMeta.unitYield})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('production')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeMetric === 'production'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Production (MT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('area')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeMetric === 'area'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Area (Ha)
                </button>
              </div>
            )}

            {/* View Options */}
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showConfidenceInterval}
                  onChange={(e) => setShowConfidenceInterval(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">95% CI Ribbon</span>
              </label>

              {activeMetric === 'yield' && (
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRegressionTrendline}
                    onChange={(e) => setShowRegressionTrendline(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px]">OLS Trendline</span>
                </label>
              )}

              <label className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 cursor-pointer select-none bg-rose-950/30 border border-rose-800/50 px-2 py-0.5 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={showDeficitGap}
                  onChange={(e) => setShowDeficitGap(e.target.checked)}
                  className="rounded bg-slate-950 border-rose-600 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-rose-500/80 inline-block" />
                  Shade Deficit Gap
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300">
              Focus: {outlookResult.commodityMeta.name} &bull; {selectedDistrict}
            </span>
          </div>
        )}
      </div>

      {/* Tab 1: Interactive Trend & 5-Year Projection Model */}
      {activeOutlookTab === 'trend_model' && (
        <>
          {/* KPI Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        {/* Baseline Yield */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>2027 Baseline Yield (Ext.)</span>
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">
            {outlookResult.baselineYield}{' '}
            <span className="text-xs font-normal text-slate-400">
              {outlookResult.commodityMeta.unitYield}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Empirical actual / validated</div>
        </div>

        {/* 2031 Projected Yield */}
        <div className="p-3 bg-slate-950/80 border border-purple-500/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-purple-300 text-[11px]">
            <span>{outlookResult.projectedEndYear} Projected Yield</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">
            {outlookResult.projectedEndYield}{' '}
            <span className="text-xs font-normal text-purple-300">
              {outlookResult.commodityMeta.unitYield}
            </span>
          </div>
          <div className="text-[10px] text-purple-300/80 mt-0.5 font-mono">
            95% CI: [{outlookResult.projectedPoints[outlookResult.projectedPoints.length - 1]?.confidenceLower95} -{' '}
            {outlookResult.projectedPoints[outlookResult.projectedPoints.length - 1]?.confidenceUpper95}]
          </div>
        </div>

        {/* Net 5-Yr Yield Gain */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>5-Yr Net Yield Gain</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div
            className={`text-xl font-extrabold mt-1 font-mono flex items-baseline gap-1 ${
              outlookResult.netYieldGainMT >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>
              {outlookResult.netYieldGainMT >= 0 ? '+' : ''}
              {outlookResult.netYieldGainMT}
            </span>
            <span className="text-xs font-semibold">
              ({outlookResult.percentageGain >= 0 ? '+' : ''}
              {outlookResult.percentageGain}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Trajectory vs 2027 baseline
          </div>
        </div>

        {/* 5-Yr Projected CAGR */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Projected 5-Yr CAGR</span>
            <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-teal-400 mt-1 font-mono">
            {outlookResult.projected5YrCagrPct >= 0 ? '+' : ''}
            {outlookResult.projected5YrCagrPct}%
            <span className="text-xs font-normal text-slate-400">/yr</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Historical (2019-27): +{outlookResult.historicalCagrPct}%/yr
          </div>
        </div>

        {/* Target Attainment & OLS Fit */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>OLS Fit (R²)</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 mt-1 font-mono">
            {outlookResult.regression.rSquared.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                outlookResult.regression.fitQuality === 'Exceptional' ||
                outlookResult.regression.fitQuality === 'Strong'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
            <span>{outlookResult.regression.fitQuality} Fit Quality</span>
          </div>
        </div>
      </div>

      {/* Project Closure Production Goal & Deficit Analysis Banner */}
      {!isMultiCropView && (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield) > 0 && (
        <div
          className={`mt-4 rounded-2xl border p-4 transition-all ${
            outlookResult.isDeficitProjected2030
              ? 'bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border-rose-800/60 shadow-lg shadow-rose-950/20'
              : 'bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-800/60 shadow-lg shadow-emerald-950/20'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  outlookResult.isDeficitProjected2030
                    ? 'bg-rose-950/80 border-rose-700/60 text-rose-400'
                    : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-400'
                }`}
              >
                {outlookResult.isDeficitProjected2030 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-white">
                    {outlookResult.isDeficitProjected2030
                      ? 'Project Closure Goal Deficit Gap (Closure Shortfall Alert)'
                      : 'Project Closure Goal Attainment on Track'}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      outlookResult.isDeficitProjected2030
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                        : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
                    }`}
                  >
                    {outlookResult.isDeficitProjected2030
                      ? `-${outlookResult.deficit2030Pct}% Gap to Target`
                      : 'Goal Attained (100%+)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualized as the shaded area between projected yield trajectory (2019–2027 / 2028) and the project closure goal ({outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield} {outlookResult.commodityMeta.unitYield}).
                </p>
              </div>
            </div>

            {/* Quick Toggle for Shading */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowDeficitGap(!showDeficitGap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showDeficitGap
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{showDeficitGap ? 'Deficit Shading: ON' : 'Deficit Shading: OFF'}</span>
              </button>
            </div>
          </div>

          {/* 4 Quantitative Deficit Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Project Closure Target</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield}{' '}
                <span className="text-xs font-normal text-slate-400">{outlookResult.commodityMeta.unitYield}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Target: {(outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production).toLocaleString()} MT
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Projected Closure Yield</div>
              <div className="text-base font-extrabold text-purple-300 font-mono mt-0.5">
                {(outlookResult.projectedPoints.find((p) => p.year === 2027) || outlookResult.projectedPoints[outlookResult.projectedPoints.length - 1])?.yieldMTPerHa}{' '}
                <span className="text-xs font-normal text-slate-400">{outlookResult.commodityMeta.unitYield}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {selectedScenario === 'baseline_ols'
                  ? 'Baseline OLS continuation'
                  : selectedScenario === 'avdp_accelerated'
                  ? 'AVDP Accelerated Momentum'
                  : 'Climate Risk Stress'}
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Yield Shortfall Gap</div>
              <div
                className={`text-base font-extrabold font-mono mt-0.5 flex items-baseline gap-1 ${
                  outlookResult.isDeficitProjected2030 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                <span>
                  {outlookResult.isDeficitProjected2030 ? '-' : '+'}
                  {outlookResult.deficit2030YieldMT}{' '}
                  <span className="text-xs font-normal">{outlookResult.commodityMeta.unitYield}</span>
                </span>
                <span className="text-xs font-semibold">
                  ({outlookResult.isDeficitProjected2030 ? `-${outlookResult.deficit2030Pct}%` : 'Met'})
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {outlookResult.isDeficitProjected2030 ? 'Required yield acceleration' : 'Target surpassed'}
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Production Volume Gap</div>
              <div
                className={`text-base font-extrabold font-mono mt-0.5 ${
                  outlookResult.isDeficitProjected2030 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {outlookResult.isDeficitProjected2030
                  ? `~${outlookResult.productionShortfall2030MT.toLocaleString()} MT`
                  : 'Self-Sufficient'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {outlookResult.isDeficitProjected2030 ? 'Annual production shortfall' : 'Surplus production'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Growth Factor Variable Range Slider (Real-time Agronomic Intervention Simulator) */}
      <div className="mt-5 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">
                  Agronomic Growth Factor Variable &amp; Input Simulator
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                    growthFactor === 1.0
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : growthFactor > 1.0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {growthFactor.toFixed(2)}x (
                  {growthFactor === 1.0
                    ? 'Baseline'
                    : growthFactor > 1.0
                    ? `+${Math.round((growthFactor - 1) * 100)}% Momentum`
                    : `-${Math.round((1 - growthFactor) * 100)}% Contraction`}
                  )
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag slider to model real-time yield and production impacts of improved seed varieties, NPK micro-dosing, or input shocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {growthFactor !== 1.0 && (
              <button
                id="reset-growth-factor-btn"
                onClick={() => setGrowthFactor(1.0)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Reset growth factor to 1.00x (Historical Baseline)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (1.00x)</span>
              </button>
            )}
          </div>
        </div>

        {/* Range Slider Control */}
        <div className="mt-4 px-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Intervention Impact Multiplier</span>
            </span>
            <div className="text-xs font-mono">
              <span className="text-slate-400">Current Multiplier: </span>
              <span
                className={`font-bold ${
                  growthFactor > 1.0
                    ? 'text-emerald-400'
                    : growthFactor < 1.0
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {growthFactor.toFixed(2)}x
              </span>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              id="growth-factor-range-slider"
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={growthFactor}
              onChange={(e) => setGrowthFactor(parseFloat(e.target.value))}
              aria-label="Agronomic growth factor multiplier slider"
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Slider Scale Labels & Ticks */}
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 px-0.5 font-mono">
            <span
              onClick={() => setGrowthFactor(0.5)}
              className="cursor-pointer hover:text-slate-300 transition-colors"
            >
              0.50x (-50% Shock)
            </span>
            <span
              onClick={() => setGrowthFactor(1.0)}
              className={`cursor-pointer transition-colors ${
                growthFactor === 1.0 ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'
              }`}
            >
              1.00x (Baseline)
            </span>
            <span
              onClick={() => setGrowthFactor(1.35)}
              className={`cursor-pointer transition-colors ${
                growthFactor === 1.35 ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'
              }`}
            >
              1.35x (Seeds)
            </span>
            <span
              onClick={() => setGrowthFactor(1.75)}
              className={`cursor-pointer transition-colors ${
                growthFactor === 1.75 ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'
              }`}
            >
              1.75x (Fertilizer)
            </span>
            <span
              onClick={() => setGrowthFactor(2.1)}
              className={`cursor-pointer transition-colors ${
                growthFactor === 2.1 ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'
              }`}
            >
              2.10x (Integrated)
            </span>
            <span
              onClick={() => setGrowthFactor(2.5)}
              className="cursor-pointer hover:text-slate-300 transition-colors"
            >
              2.50x (Max Frontier)
            </span>
          </div>
        </div>

        {/* Quick Intervention Preset Buttons */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">
            Quick Intervention Presets:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="preset-baseline"
              onClick={() => setGrowthFactor(1.0)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                growthFactor === 1.0
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              Baseline (1.00x)
            </button>
            <button
              id="preset-seeds"
              onClick={() => setGrowthFactor(1.25)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                growthFactor === 1.25
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              Certified Seeds (+25%)
            </button>
            <button
              id="preset-fertilizer"
              onClick={() => setGrowthFactor(1.5)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                growthFactor === 1.5
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              Fertilizer Micro-Dosing (+50%)
            </button>
            <button
              id="preset-integrated"
              onClick={() => setGrowthFactor(1.8)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                growthFactor === 1.8
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              Seeds + NPK + Bunding (+80%)
            </button>
            <button
              id="preset-mechanization"
              onClick={() => setGrowthFactor(2.2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                growthFactor === 2.2
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              Intensive Mechanization (+120%)
            </button>
          </div>

          {/* Calibrated Scenario Presets Quick Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60">
            <PresetQuickBar
              activePresetId={activePresetId}
              onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        </div>

        {/* Real-time Dynamic Feedback Strip */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-slate-300">
              <strong>Simulated Closure Yield:</strong>{' '}
              <span className="text-emerald-400 font-bold font-mono">
                {outlookResult.projectedPoints.find((p) => p.year === 2027)?.yieldMTPerHa || outlookResult.projectedEndYield} MT/Ha
              </span>{' '}
              <span className="text-slate-500 text-[11px]">
                (vs {outlookResult.baselineYield} MT/Ha baseline)
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Target Deficit:</span>
            <span
              className={`font-semibold font-mono px-2 py-0.5 rounded text-[11px] ${
                outlookResult.isDeficitProjected2030
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              {outlookResult.isDeficitProjected2030
                ? `Shortfall of ${outlookResult.deficit2030YieldMT} MT/Ha (-${outlookResult.deficit2030Pct}%)`
                : 'Project Closure Goal Met!'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="mt-5 bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">
              {isMultiCropView
                ? 'Multi-Commodity Normalized Yield Index (Baseline = 100)'
                : `${outlookResult.commodityMeta.name} — ${
                    activeMetric === 'yield'
                      ? 'Yield Trajectory'
                      : activeMetric === 'production'
                      ? 'National & District Production Volume'
                      : 'Harvested Cropland Area'
                  } (2019–${outlookResult.projectedEndYear})`}
            </span>
            <span className="text-slate-400 text-[11px]">
              &bull; {selectedDistrict}
            </span>
            {growthFactor !== 1.0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {growthFactor.toFixed(2)}x Growth Factor Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span>Project Lifecycle (2019–2027)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-purple-400 inline-block" />
              <span>Adjusted Horizon (2027–2028)</span>
            </span>
            {showRegressionTrendline && activeMetric === 'yield' && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-slate-500 inline-block" />
                <span>Linear OLS Fit</span>
              </span>
            )}
            {showDeficitGap &&
              !isMultiCropView &&
              ((activeMetric === 'yield' && (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield) > 0) ||
                (activeMetric === 'production' && (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production) > 0)) && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-2 rounded-xs bg-rose-500/30 border border-rose-500 border-dashed inline-block" />
                  <span className="text-rose-300 font-medium">Deficit Gap Shading</span>
                </span>
              )}
            {!isMultiCropView &&
              ((activeMetric === 'yield' && (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield) > 0) ||
                (activeMetric === 'production' && (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production) > 0)) && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-400 inline-block" />
                  <span className="text-rose-300 font-medium">
                    Closure Goal (
                    {activeMetric === 'yield'
                      ? `${outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield} ${outlookResult.commodityMeta.unitYield}`
                      : `${(((outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)) / 1000).toFixed(0)}k MT`}
                    )
                  </span>
                </span>
              )}
          </div>
        </div>

        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            {isMultiCropView ? (
              // Multi-Crop Comparison Chart
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
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
                  unit=""
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  x={2027}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: '2027 Baseline | 5-Yr Horizon',
                    position: 'top',
                    fill: '#94a3b8',
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="riceIndex"
                  name="Rice (Index)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="cocoaIndex"
                  name="Cocoa (Index)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="palmIndex"
                  name="Palm Oil (Index)"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#22c55e' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </ComposedChart>
            ) : (
              // Single Commodity Detailed Projection Chart
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 25, left: 5, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={palette.primary} stopOpacity={0.02} />
                  </linearGradient>

                  <linearGradient id="deficitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#fda4af" stopOpacity="0.10" />
                  </linearGradient>

                  <pattern
                    id="deficitHatchPattern"
                    width="10"
                    height="10"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="10"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                  </pattern>
                </defs>

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
                  domain={[
                    (dataMin: number) => Math.max(0, +(dataMin * 0.85).toFixed(1)),
                    (dataMax: number) => {
                      const target =
                        activeMetric === 'yield'
                          ? (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield)
                          : activeMetric === 'production'
                          ? (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)
                          : 0;
                      const effectiveMax = Math.max(dataMax, target);
                      return +(effectiveMax * 1.14).toFixed(1);
                    },
                  ]}
                  unit={
                    activeMetric === 'yield'
                      ? ` ${outlookResult.commodityMeta.unitYield}`
                      : activeMetric === 'production'
                      ? ' MT'
                      : ' Ha'
                  }
                  tickFormatter={(v) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                    return `${v}`;
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* 2027 Project Closure Separator Reference Line */}
                <ReferenceLine
                  x={2027}
                  stroke="#a855f7"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '2027 Project Closure | 2028 Adjusted Horizon',
                    position: 'insideTopLeft',
                    fill: '#c084fc',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />

                {/* Project Closure Target Production Goal Reference Line */}
                {((activeMetric === 'yield' && (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield) > 0) ||
                  (activeMetric === 'production' && (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production) > 0)) && (
                  <ReferenceLine
                    y={
                      activeMetric === 'yield'
                        ? (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield)
                        : (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)
                    }
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    label={{
                      value: `Closure Goal (${
                        activeMetric === 'yield'
                          ? `${outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield} ${outlookResult.commodityMeta.unitYield}`
                          : `${(((outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)) / 1000).toFixed(0)}k MT`
                      })`,
                      position: 'insideTopRight',
                      fill: '#fda4af',
                      fontSize: 10,
                      fontWeight: 'bold',
                      offset: 6,
                    }}
                  />
                )}

                {/* Shaded Deficit Gap between Projected Metric and Project Closure Goal */}
                {showDeficitGap &&
                  ((activeMetric === 'yield' && (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield) > 0) ||
                    (activeMetric === 'production' && (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production) > 0)) && (
                    <>
                      <Area
                        type="monotone"
                        dataKey={activeMetric === 'yield' ? 'deficitYieldCurve' : 'deficitCurve'}
                        baseValue={
                          activeMetric === 'yield'
                            ? (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield)
                            : (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)
                        }
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        strokeOpacity={0.85}
                        fill="url(#deficitGradient)"
                        name="Closure Goal Deficit Gap"
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                      <Area
                        type="monotone"
                        dataKey={activeMetric === 'yield' ? 'deficitYieldCurve' : 'deficitCurve'}
                        baseValue={
                          activeMetric === 'yield'
                            ? (outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield)
                            : (outlookResult.projectClosureTargetProduction || outlookResult.nationalTarget2030Production)
                        }
                        stroke="transparent"
                        fill="url(#deficitHatchPattern)"
                        legendType="none"
                        tooltipType="none"
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    </>
                  )}

                {/* 95% Confidence Interval Band (Area) */}
                {showConfidenceInterval && (
                  <Area
                    type="monotone"
                    dataKey="ciUpper"
                    stroke="transparent"
                    fill="url(#ciGradient)"
                    fillOpacity={0.4}
                    name="95% CI Upper"
                  />
                )}
                {showConfidenceInterval && (
                  <Area
                    type="monotone"
                    dataKey="ciLower"
                    stroke="transparent"
                    fill="#020617"
                    fillOpacity={0.9}
                    name="95% CI Lower"
                  />
                )}

                {/* Linear OLS Regression Trendline (only applicable for Yield metric) */}
                {showRegressionTrendline && activeMetric === 'yield' && (
                  <Line
                    type="linear"
                    dataKey="regressionLine"
                    name="Linear OLS Fit"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}

                {/* Historical Metric Line (Solid) */}
                <Line
                  type="monotone"
                  dataKey="historicalMetric"
                  name={`Historical ${
                    activeMetric === 'yield'
                      ? 'Yield'
                      : activeMetric === 'production'
                      ? 'Production'
                      : 'Cropland Area'
                  }`}
                  stroke={palette.primary}
                  strokeWidth={3}
                  dot={{ r: 4, fill: palette.primary, stroke: '#0f172a', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: palette.primary }}
                  connectNulls={false}
                />

                {/* Projected Metric Line (Dashed) */}
                <Line
                  type="monotone"
                  dataKey="projectedMetric"
                  name={`5-Yr Projected ${
                    activeMetric === 'yield'
                      ? 'Yield'
                      : activeMetric === 'production'
                      ? 'Production'
                      : 'Cropland Area'
                  }`}
                  stroke="#c084fc"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={{
                    r: 4.5,
                    fill: '#c084fc',
                    stroke: '#0f172a',
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7, fill: '#c084fc' }}
                  connectNulls={false}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Econometric & Regression Diagnostics Strip */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Regression Formula Card */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>OLS Regression Formula</span>
          </div>
          <div className="font-mono text-sm text-emerald-400 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
            {outlookResult.regression.equation}
          </div>
          <p className="text-[11px] text-slate-400">
            Linear slope ($m$): <span className="text-slate-200 font-mono">{outlookResult.regression.annualChangeLabel}</span>.
            Constant velocity computed across 8 empirical years.
          </p>
        </div>

        {/* Model Fit & Significance */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Target className="w-3.5 h-3.5 text-teal-400" />
              <span>Goodness-of-Fit &amp; Error</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {outlookResult.regression.reliabilityRating} ({outlookResult.regression.confidenceScore}/100)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">R² / Adj. R²:</span>
            <span className="text-amber-300 font-mono font-bold">
              {(outlookResult.regression.rSquared * 100).toFixed(1)}% / {(outlookResult.regression.adjRSquared * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Standard Error / MAPE:</span>
            <span className="text-slate-200 font-mono">
              &plusmn;{outlookResult.regression.stdError.toFixed(3)} {outlookResult.commodityMeta.unitYield} ({outlookResult.regression.mape}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">t-Stat / Durbin-Watson:</span>
            <span className="text-emerald-400 font-mono font-bold">
              t = {outlookResult.regression.tStatistic.toFixed(2)} / d = {outlookResult.regression.durbinWatson}
            </span>
          </div>
        </div>

        {/* Agro-Ecological Target Status */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Target &amp; Frontier Progress</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Project Closure Goal:</span>
            <span className="text-slate-200 font-mono font-medium">
              {outlookResult.projectClosureTargetYield || outlookResult.commodityMeta.nationalTarget2030Yield} {outlookResult.commodityMeta.unitYield}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Attainment (2027):</span>
            <span className="text-emerald-400 font-mono font-bold">
              {outlookResult.targetAttainmentPct}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Closure Deficit Status:</span>
            <span
              className={`font-mono font-bold ${
                outlookResult.isDeficitProjected2030 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {outlookResult.isDeficitProjected2030
                ? `-${outlookResult.deficit2030YieldMT} ${outlookResult.commodityMeta.unitYield} (-${outlookResult.deficit2030Pct}%)`
                : 'Target Surpassed'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Biological Frontier Ceiling:</span>
            <span className="text-slate-400 font-mono">
              {outlookResult.frontierYield} {outlookResult.commodityMeta.unitYield}
            </span>
          </div>
        </div>
      </div>

      {/* Toggle Tabular Projection Breakdown */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowDataTable(!showDataTable)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{showDataTable ? 'Hide 5-Year Data Table' : 'View Year-by-Year 5-Year Forecast Table'}</span>
        </button>

        <div className="text-[11px] text-slate-500 font-mono">
          Model: OLS Linear Extrapolation &bull; Alpha: 0.05
        </div>
      </div>

      {/* Expandable Year-by-Year Forecast Table */}
      {showDataTable && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Year</th>
                <th className="px-3 py-2.5">Classification</th>
                <th className="px-3 py-2.5 text-right">Yield ({outlookResult.commodityMeta.unitYield})</th>
                <th className="px-3 py-2.5 text-right">95% CI Range</th>
                <th className="px-3 py-2.5 text-right">Production (MT)</th>
                <th className="px-3 py-2.5 text-right">Harvested Area (Ha)</th>
                <th className="px-3 py-2.5 text-right">&Delta; vs 2027</th>
                <th className="px-3 py-2.5 text-right text-rose-300">Goal Deficit Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {outlookResult.allPoints.map((row) => {
                const diff = +(row.yieldMTPerHa - outlookResult.baselineYield).toFixed(2);
                const isBaseline = row.year === 2027;
                const hasDeficit = row.deficitShortfallMT && row.deficitShortfallMT > 0;
                return (
                  <tr
                    key={row.year}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      row.isProjected
                        ? 'bg-purple-950/10'
                        : isBaseline
                        ? 'bg-emerald-950/20 font-bold'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-bold text-white flex items-center gap-1.5">
                      {row.year}
                      {isBaseline && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-900 text-emerald-300">
                          Baseline
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-400 font-sans">
                      {row.isProjected ? (
                        <span className="text-purple-300">5-Yr Projection</span>
                      ) : (
                        'Historical'
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-white">
                      {row.yieldMTPerHa}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">
                      {row.isProjected
                        ? `[${row.confidenceLower95} – ${row.confidenceUpper95}]`
                        : 'Actual'}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-300">
                      {row.productionMT.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">
                      {row.harvestedAreaHa.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-bold ${
                        diff > 0
                          ? 'text-emerald-400'
                          : diff < 0
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff === 0 ? '—' : `${diff}`}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">
                      {row.year >= 2027 && (outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield) > 0 ? (
                        hasDeficit ? (
                          <span className="text-rose-400 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                            -{row.deficitShortfallMT} ({row.deficitPctOfTarget}%)
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Goal Met
                          </span>
                        )
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}

      {/* Tab 2: Scenario Comparison View */}
      {activeOutlookTab === 'scenario_comparison' && (
        <div className="mt-4">
          <ScenarioComparisonView
            commodity={selectedCommodity}
            district={selectedDistrict}
            growthFactor={growthFactor}
            activeScenario={selectedScenario}
            onApplyScenario={handleApplyScenario}
          />
        </div>
      )}

      {/* Tab 3: Crop Sensitivity View */}
      {activeOutlookTab === 'crop_sensitivity' && (
        <div className="mt-4">
          <CropSensitivityView
            commodity={selectedCommodity}
            district={selectedDistrict}
            levers={sensitivityLevers}
            onChangeLever={handleLeverChange}
            onResetLevers={handleResetLevers}
          />
        </div>
      )}

      {/* Tab 4: Forecast Confidence View */}
      {activeOutlookTab === 'forecast_confidence' && (
        <div className="mt-4">
          <ForecastConfidenceView outlookResult={outlookResult} />
        </div>
      )}

      {/* Tab 5: Predictive Heatmap View */}
      {activeOutlookTab === 'predictive_heatmap' && (
        <div className="mt-4">
          <PredictiveHeatmapView
            commodity={selectedCommodity}
            scenario={selectedScenario}
            growthFactor={growthFactor}
            onSelectDistrict={(dist) => {
              setSelectedDistrict(dist);
              onSelectDistrict?.(dist);
              setActiveOutlookTab('trend_model');
            }}
          />
        </div>
      )}

      {/* Tab 6: Compare Track Trajectory View */}
      {activeOutlookTab === 'compare_trajectory' && (
        <div className="mt-4">
          <CompareTrajectoryView
            commodity={selectedCommodity}
            district={selectedDistrict}
            scenario={selectedScenario}
            growthFactor={growthFactor}
            onApplyScenario={handleApplyScenario}
          />
        </div>
      )}

      {/* Yield Scenario Presets Modal */}
      <YieldScenarioPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        commodity={selectedCommodity}
        district={selectedDistrict}
        activePresetId={activePresetId}
        onApplyPreset={handleApplyPreset}
      />
    </div>
  );
};
