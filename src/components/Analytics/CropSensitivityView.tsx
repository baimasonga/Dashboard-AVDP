import React, { useMemo } from 'react';
import {
  Sliders,
  RotateCcw,
  Sprout,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Sun,
  Wrench,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { CommodityType, COMMODITY_METADATA } from '../../data/cropTrendData';
import {
  FutureYieldRegressionService,
  CropSensitivityAnalysis,
} from '../../services/futureYieldRegressionService';

interface CropSensitivityViewProps {
  commodity: CommodityType;
  district: string;
  levers: Record<string, number>;
  onChangeLever: (id: string, value: number) => void;
  onResetLevers: () => void;
}

export const CropSensitivityView: React.FC<CropSensitivityViewProps> = ({
  commodity,
  district,
  levers,
  onChangeLever,
  onResetLevers,
}) => {
  const meta = COMMODITY_METADATA[commodity];

  const sensitivity: CropSensitivityAnalysis = useMemo(() => {
    return FutureYieldRegressionService.computeCropSensitivity(commodity, district, levers);
  }, [commodity, district, levers]);

  // Lever Icon Helper
  const getLeverIcon = (id: string) => {
    switch (id) {
      case 'fertilizer_npk':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'certified_seeds':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'rainfall_anomaly':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'mechanization_access':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      default:
        return <Sliders className="w-4 h-4 text-slate-400" />;
    }
  };

  // Quick Preset Handlers
  const applyPreset = (type: 'baseline' | 'breakeven' | 'high_input' | 'drought_stress') => {
    if (type === 'baseline') {
      onResetLevers();
    } else if (type === 'breakeven') {
      onChangeLever('fertilizer_npk', 75);
      onChangeLever('certified_seeds', 65);
      onChangeLever('rainfall_anomaly', 0);
      onChangeLever('mechanization_access', 35);
    } else if (type === 'high_input') {
      onChangeLever('fertilizer_npk', 120);
      onChangeLever('certified_seeds', 85);
      onChangeLever('rainfall_anomaly', 10);
      onChangeLever('mechanization_access', 60);
    } else if (type === 'drought_stress') {
      onChangeLever('fertilizer_npk', 25);
      onChangeLever('certified_seeds', 25);
      onChangeLever('rainfall_anomaly', -25);
      onChangeLever('mechanization_access', 15);
    }
  };

  const isModified = Object.keys(levers).length > 0 && (
    levers.fertilizer_npk !== 35 ||
    levers.certified_seeds !== 30 ||
    levers.rainfall_anomaly !== 0 ||
    levers.mechanization_access !== 15
  );

  return (
    <div id="crop-sensitivity-view" className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner: Simulation Overview & Gap Closed Meter */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">
                  Crop Sensitivity &amp; Agronomic Intervention Simulator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {district} &bull; {meta.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Test the elasticity of project closure crop yields in response to fertilizer, seed adoption, rainfall shifts, and farm mechanization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isModified && (
              <button
                type="button"
                onClick={onResetLevers}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Levers</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Outcome Cards & Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Baseline Project Closure */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Baseline Closure Yield (OLS)</div>
            <div className="text-lg font-extrabold text-white font-mono mt-0.5">
              {sensitivity.baseline2030Yield} <span className="text-xs font-normal text-slate-400">{meta.unitYield}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Unconstrained trend continuation</div>
          </div>

          {/* Simulated Project Closure */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Simulated Closure Yield</div>
            <div className="text-lg font-extrabold font-mono mt-0.5 flex items-baseline gap-1.5">
              <span className={sensitivity.isDeficitEliminated ? 'text-emerald-400' : 'text-purple-300'}>
                {sensitivity.simulated2030Yield} {meta.unitYield}
              </span>
              <span
                className={`text-xs font-semibold ${
                  sensitivity.simulated2030Yield >= sensitivity.baseline2030Yield
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                ({sensitivity.simulated2030Yield >= sensitivity.baseline2030Yield ? '+' : ''}
                {(sensitivity.simulated2030Yield - sensitivity.baseline2030Yield).toFixed(2)})
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Under active input configuration</div>
          </div>

          {/* Deficit Status */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Goal Deficit Status</div>
            <div
              className={`text-lg font-extrabold font-mono mt-0.5 flex items-center gap-1.5 ${
                sensitivity.isDeficitEliminated ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {sensitivity.isDeficitEliminated ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Goal Surpassed</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    -{(sensitivity.nationalTarget2030Yield - sensitivity.simulated2030Yield).toFixed(2)} {meta.unitYield}
                  </span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Target: {sensitivity.nationalTarget2030Yield} {meta.unitYield}
            </div>
          </div>
        </div>

        {/* Deficit Gap Closed Progress Bar */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>National Deficit Gap Closed:</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {sensitivity.gapClosedPct}% Closed
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                sensitivity.isDeficitEliminated
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-purple-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, sensitivity.gapClosedPct))}%` }}
            />
          </div>
        </div>

        {/* Actionable Break-Even Policy Recommendation */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300">Policy Recommendation: </span>
            <span className="leading-relaxed">{sensitivity.breakEvenRecommendation}</span>
          </div>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Intervention Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset('baseline')}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          Baseline Current
        </button>
        <button
          type="button"
          onClick={() => applyPreset('breakeven')}
          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <Target className="w-3 h-3 text-emerald-400" />
          <span>Break-Even Package</span>
        </button>
        <button
          type="button"
          onClick={() => applyPreset('high_input')}
          className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          High-Tech Maximum
        </button>
        <button
          type="button"
          onClick={() => applyPreset('drought_stress')}
          className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          Drought Stress Test
        </button>
      </div>

      {/* 4 Interactive Input Levers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensitivity.levers.map((lev) => (
          <div
            key={lev.id}
            className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  {getLeverIcon(lev.id)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{lev.name}</h4>
                  <span className="text-[10px] text-slate-400">Category: {lev.category}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-sm font-bold text-emerald-400">
                  {lev.currentValue} <span className="text-xs font-normal text-slate-400">{lev.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Baseline: {lev.baselineValue} {lev.unit}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lev.description}
            </p>

            {/* Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min={lev.min}
                max={lev.max}
                step={lev.step}
                value={lev.currentValue}
                onChange={(e) => onChangeLever(lev.id, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-hidden"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{lev.min} {lev.unit}</span>
                <span>Baseline: {lev.baselineValue}</span>
                <span>{lev.max} {lev.unit}</span>
              </div>
            </div>

            {/* Marginal Impact Strip */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-sans text-[11px]">Marginal Impact:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold ${
                    lev.impactOnYieldMT > 0
                      ? 'text-emerald-400'
                      : lev.impactOnYieldMT < 0
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {lev.impactOnYieldMT > 0 ? `+${lev.impactOnYieldMT}` : lev.impactOnYieldMT} {meta.unitYield}
                </span>
                <span className="text-slate-500 font-normal text-[10px]">
                  ({lev.impactOnProductionMT > 0 ? `+${lev.impactOnProductionMT.toLocaleString()}` : lev.impactOnProductionMT.toLocaleString()} MT)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tornado Sensitivity Elasticity Ranking */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Sensitivity Elasticity Tornado (Swing Range MT/Ha)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Yield spread between -35% low bound and +50% high bound
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {sensitivity.tornadoData.map((item, idx) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span>{item.name}</span>
                </span>
                <div className="font-mono text-xs flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">
                    [{item.lowImpact} &rarr; {item.highImpact} {meta.unitYield}]
                  </span>
                  <span className="font-bold text-emerald-400">
                    &Delta; {item.swing} {meta.unitYield}
                  </span>
                </div>
              </div>

              {/* Visual Swing Bar */}
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-teal-300 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(15, (item.swing / (sensitivity.tornadoData[0].swing || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
