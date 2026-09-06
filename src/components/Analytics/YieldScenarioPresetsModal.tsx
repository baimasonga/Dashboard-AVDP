import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  X,
  ArrowRight,
  ShieldAlert,
  Sprout,
  Droplets,
  Layers,
  Wrench,
  Leaf,
} from 'lucide-react';
import { CommodityType } from '../../data/cropTrendData';
import {
  FutureYieldRegressionService,
  OutlookScenario,
  YieldScenarioPreset,
  YIELD_SCENARIO_PRESETS,
} from '../../services/futureYieldRegressionService';

interface YieldScenarioPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodity: CommodityType;
  district: string;
  activePresetId?: string;
  onApplyPreset: (preset: YieldScenarioPreset) => void;
}

export const YieldScenarioPresetsModal: React.FC<YieldScenarioPresetsModalProps> = ({
  isOpen,
  onClose,
  commodity,
  district,
  activePresetId,
  onApplyPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = [
    'All',
    'Strategic Target',
    'Intervention Package',
    'Agronomic Innovation',
    'Climate & Risk',
  ];

  const filteredPresets =
    selectedCategory === 'All'
      ? YIELD_SCENARIO_PRESETS
      : YIELD_SCENARIO_PRESETS.filter((p) => p.category === selectedCategory);

  // Quick icon helper by category or id
  const getPresetIcon = (preset: YieldScenarioPreset) => {
    if (preset.id.includes('climate') || preset.id.includes('drought')) {
      return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
    if (preset.id.includes('water') || preset.id.includes('ivs')) {
      return <Droplets className="w-4 h-4 text-blue-400" />;
    }
    if (preset.id.includes('agroforestry')) {
      return <Leaf className="w-4 h-4 text-lime-400" />;
    }
    if (preset.id.includes('postharvest') || preset.id.includes('mechanization')) {
      return <Wrench className="w-4 h-4 text-purple-400" />;
    }
    if (preset.id.includes('vision') || preset.id.includes('sufficiency')) {
      return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
    return <TrendingUp className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Yield Scenario Presets &amp; Strategic Policy Packages
              </h3>
              <p className="text-xs text-slate-400">
                Instantly apply calibrated agronomic and climate shock configurations to the predictive model.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto bg-slate-950/30">
          <span className="text-xs font-semibold text-slate-400 mr-2">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/70 text-slate-300 hover:text-white border border-slate-700/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Preset Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPresets.map((preset) => {
            const isActive = activePresetId === preset.id;
            // Run quick outlook for this preset to show projected outcome
            const previewOutlook = FutureYieldRegressionService.run5YearOutlook(
              commodity,
              district,
              preset.scenario,
              2,
              preset.growthFactor
            );
            const projClosure =
              previewOutlook.projectedPoints.find((p) => p.year === 2027)?.yieldMTPerHa ??
              previewOutlook.projectedEndYield;
            const targetClosure = previewOutlook.projectClosureTargetYield || previewOutlook.nationalTarget2030Yield;
            const attainment = Math.round((projClosure / targetClosure) * 100);

            return (
              <div
                key={preset.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700"
                        style={{ color: preset.color }}
                      >
                        {getPresetIcon(preset)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {preset.category} &bull; Factor {preset.growthFactor.toFixed(2)}x (
                          {preset.growthFactor >= 1.0 ? '+' : ''}
                          {Math.round((preset.growthFactor - 1) * 100)}%)
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border"
                      style={{
                        backgroundColor: `${preset.color}15`,
                        color: preset.color,
                        borderColor: `${preset.color}40`,
                      }}
                    >
                      {preset.badge}
                    </span>
                  </div>

                  {/* Description & Tagline */}
                  <p className="text-xs text-slate-300 font-medium">
                    {preset.tagline}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Key Drivers */}
                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Key Interventions &amp; Drivers:
                    </span>
                    <ul className="space-y-1">
                      {preset.keyDrivers.map((driver, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0">&bull;</span>
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lever Settings Preview Strip */}
                  <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">NPK Fert.</span>
                      <span className="font-mono font-bold text-slate-200">
                        {preset.leverSettings.fertilizer_npk} kg/ha
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Seeds</span>
                      <span className="font-mono font-bold text-slate-200">
                        {preset.leverSettings.certified_seeds}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rainfall</span>
                      <span
                        className={`font-mono font-bold ${
                          preset.leverSettings.rainfall_anomaly >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {preset.leverSettings.rainfall_anomaly >= 0 ? '+' : ''}
                        {preset.leverSettings.rainfall_anomaly}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mechanized</span>
                      <span className="font-mono font-bold text-slate-200">
                        {preset.leverSettings.mechanization_access}%
                      </span>
                    </div>
                  </div>

                  {/* Closure Forecast Impact Preview */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Projected 2027 Yield:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {projClosure.toFixed(2)} {previewOutlook.commodityMeta.unitYield}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Target Attainment:</span>
                      <span
                        className={`font-mono font-bold ${
                          attainment >= 100
                            ? 'text-emerald-400'
                            : attainment >= 85
                            ? 'text-teal-300'
                            : 'text-rose-400'
                        }`}
                      >
                        {attainment}% of Goal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apply Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 max-w-[65%] truncate">
                    {preset.policyRecommendation}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyPreset(preset);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      isActive
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                  >
                    <span>{isActive ? 'Re-Apply Preset' : 'Apply Preset'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs text-slate-400">
          <span>
            Target focus: <strong className="text-slate-200">{district}</strong> &bull; Commodity:{' '}
            <strong className="text-emerald-400 font-semibold">{commodity.toUpperCase()}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface PresetQuickBarProps {
  activePresetId?: string;
  onOpenPresetsModal: () => void;
  onApplyPreset: (preset: YieldScenarioPreset) => void;
}

export const PresetQuickBar: React.FC<PresetQuickBarProps> = ({
  activePresetId,
  onOpenPresetsModal,
  onApplyPreset,
}) => {
  // Take first 4 primary presets for quick bar
  const quickPresets = YIELD_SCENARIO_PRESETS.slice(0, 5);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Scenario Presets:</span>
      </div>

      {quickPresets.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: preset.color }}
            />
            <span>{preset.name.split(' ')[0]}</span>
            <span className="text-[10px] opacity-75">
              ({preset.growthFactor >= 1 ? '+' : ''}
              {Math.round((preset.growthFactor - 1) * 100)}%)
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onOpenPresetsModal}
        className="px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
      >
        <span>All Presets ({YIELD_SCENARIO_PRESETS.length})</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
