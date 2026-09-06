import React, { useState } from 'react';
import { Dataset, CanvasState } from '../../types';
import {
  INFOGRAPHIC_TEMPLATES,
  InfographicTemplate,
  InfographicTheme,
  AgriIconPlaceholder,
  buildCanvasFromTemplate,
} from '../../data/infographicTemplates';
import {
  RicePaddyIcon,
  CassavaTuberIcon,
  CocoaPodIcon,
  OilPalmIcon,
  AgroMillIcon,
  SolarIrrigationIcon,
  GrainSiloIcon,
  QualityBadgeIcon,
  FishAquacultureIcon,
  PoultryLivestockIcon,
  VegetableGardenIcon,
} from '../Common/AgriIcons';
import {
  LayoutTemplate,
  Check,
  X,
  Sparkles,
  MapPin,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  Palette,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasets: Dataset[];
  currentDatasetId?: string;
  onApplyTemplate: (newCanvas: CanvasState) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  datasets,
  currentDatasetId,
  onApplyTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<InfographicTemplate | null>(null);

  // Customization state for active template
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [targetDatasetId, setTargetDatasetId] = useState<string>(
    currentDatasetId || datasets[0]?.id || 'ds_district_matrix'
  );
  const [selectedTheme, setSelectedTheme] = useState<InfographicTheme>('emerald');
  const [iconPlaceholder, setIconPlaceholder] = useState<AgriIconPlaceholder>('rice');
  const [mapMetric, setMapMetric] = useState<
    'yield' | 'beneficiaries' | 'processing' | 'target_pct' | 'oil_palm' | 'cocoa' | 'vegetables' | 'ivs_ha'
  >('yield');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates', count: INFOGRAPHIC_TEMPLATES.length },
    {
      id: 'value_chains',
      label: 'AVDP Value Chains',
      count: INFOGRAPHIC_TEMPLATES.filter((t) => t.category === 'value_chains').length,
    },
    {
      id: 'production',
      label: 'Crop Production',
      count: INFOGRAPHIC_TEMPLATES.filter((t) => t.category === 'production').length,
    },
    {
      id: 'market',
      label: 'Market Analysis',
      count: INFOGRAPHIC_TEMPLATES.filter((t) => t.category === 'market').length,
    },
    {
      id: 'supply_chain',
      label: 'Supply Chain & Logistics',
      count: INFOGRAPHIC_TEMPLATES.filter((t) => t.category === 'supply_chain').length,
    },
    {
      id: 'me_impact',
      label: 'M&E Logframe',
      count: INFOGRAPHIC_TEMPLATES.filter((t) => t.category === 'me_impact').length,
    },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? INFOGRAPHIC_TEMPLATES
      : INFOGRAPHIC_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelectTemplateForCustomization = (tpl: InfographicTemplate) => {
    setActiveTemplate(tpl);
    setCustomTitle(tpl.title);
    setCustomSubtitle(tpl.subtitle);
    setSelectedTheme(tpl.defaultTheme);
    setIconPlaceholder(tpl.defaultIconPlaceholder);
    setMapMetric(tpl.defaultMapMetric);
    setTargetDatasetId(
      datasets.some((d) => d.id === tpl.recommendedDatasetId)
        ? tpl.recommendedDatasetId
        : datasets[0]?.id || 'ds_district_matrix'
    );
  };

  const handleConfirmApply = () => {
    if (!activeTemplate) return;
    const newCanvas = buildCanvasFromTemplate(activeTemplate, {
      customTitle,
      customSubtitle,
      targetDatasetId,
      selectedTheme,
      iconPlaceholder,
      mapMetric,
    });
    onApplyTemplate(newCanvas);
    onClose();
  };

  // Icon component mapper
  const renderAgriIcon = (icon: AgriIconPlaceholder, className = 'w-5 h-5') => {
    switch (icon) {
      case 'rice':
        return <RicePaddyIcon className={className} />;
      case 'cassava':
        return <CassavaTuberIcon className={className} />;
      case 'cocoa':
        return <CocoaPodIcon className={className} />;
      case 'oil_palm':
        return <OilPalmIcon className={className} />;
      case 'vegetables':
        return <VegetableGardenIcon className={className} />;
      case 'warehouse':
      case 'tractor':
        return <GrainSiloIcon className={className} />;
      case 'solar_irrigation':
        return <SolarIrrigationIcon className={className} />;
      case 'quality_badge':
        return <QualityBadgeIcon className={className} />;
      case 'fish':
        return <FishAquacultureIcon className={className} />;
      case 'poultry':
        return <PoultryLivestockIcon className={className} />;
      default:
        return <RicePaddyIcon className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Sierra Leone AVDP Infographic Template Library
              </h3>
              <p className="text-xs text-slate-400">
                Pre-configured infographics customizable with your imported CSV data sets, maps, and icons
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area: Either Template Gallery OR Customizer View */}
        {!activeTemplate ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedCategory === cat.id ? 'bg-slate-900 text-emerald-300' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/20"
                >
                  <div>
                    {/* Header with Icon and Category */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                          {renderAgriIcon(tpl.thumbnailIcon, 'w-5 h-5 text-emerald-400')}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                            {tpl.category.replace('_', ' ')}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                            {tpl.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Key Highlights Checklist */}
                    <div className="space-y-1.5 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Features Included:
                      </span>
                      {tpl.keyHighlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="line-clamp-1">{hl}</span>
                        </div>
                      ))}
                    </div>

                    {/* Widget counts badge */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {tpl.widgets.length} Pre-built Visual Widgets
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        16-District Map
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        Custom Icons
                      </span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Tailored for: {tpl.recommendedValueChain}
                    </span>
                    <button
                      onClick={() => handleSelectTemplateForCustomization(tpl)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Preview &amp; Customize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Customization Mode */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTemplate(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold"
              >
                ← Back to Template Gallery
              </button>
              <span className="text-xs font-bold text-emerald-400">
                Customizing: {activeTemplate.title}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Customization Controls */}
              <div className="md:col-span-6 space-y-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Data Source Binding</span>
                  </h5>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Select CSV Dataset to Feed Template:
                    </label>
                    <select
                      value={targetDatasetId}
                      onChange={(e) => setTargetDatasetId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {datasets.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.rowCount} rows {d.isCustom ? '• Imported' : '• Preloaded'})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Template widgets will automatically aggregate metrics from this dataset.
                    </p>
                  </div>
                </div>

                {/* Custom Icon Placeholder Selector */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Custom Icon Placeholder</span>
                  </h5>

                  <p className="text-xs text-slate-400">
                    Choose an agricultural icon to feature in widget headers and callout badges:
                  </p>

                  <div className="grid grid-cols-6 gap-2">
                    {(
                      [
                        { id: 'rice', label: 'Rice Paddy' },
                        { id: 'oil_palm', label: 'Oil Palm' },
                        { id: 'cocoa', label: 'Cocoa' },
                        { id: 'vegetables', label: 'Vegetables' },
                        { id: 'cassava', label: 'Cassava' },
                        { id: 'warehouse', label: 'Grain Silo' },
                        { id: 'solar_irrigation', label: 'Irrigation' },
                        { id: 'quality_badge', label: 'Certified' },
                        { id: 'fish', label: 'Fish' },
                        { id: 'poultry', label: 'Poultry' },
                        { id: 'tractor', label: 'Machinery' },
                      ] as { id: AgriIconPlaceholder; label: string }[]
                    ).map((ico) => (
                      <button
                        key={ico.id}
                        onClick={() => setIconPlaceholder(ico.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          iconPlaceholder === ico.id
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {renderAgriIcon(ico.id, 'w-5 h-5')}
                        <span className="text-[10px] font-medium line-clamp-1">{ico.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sierra Leone Map Metric Placeholder */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Map Layer Metric Placeholder</span>
                  </h5>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'yield', label: 'Rice Yield (MT/Ha)' },
                      { id: 'oil_palm', label: 'Oil Palm (MT)' },
                      { id: 'cocoa', label: 'Cocoa (MT)' },
                      { id: 'vegetables', label: 'Vegetables (MT)' },
                      { id: 'ivs_ha', label: 'IVS Swamps (Ha)' },
                      { id: 'beneficiaries', label: 'Smallholders (HH)' },
                      { id: 'processing', label: 'Agro-Mills' },
                      { id: 'target_pct', label: 'M&E Rate (%)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMapMetric(m.id as any)}
                        className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                          mapMetric === m.id
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Palette Selector */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>Infographic Color Theme</span>
                  </h5>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'emerald', label: 'Emerald Agro', color: '#10b981' },
                      { id: 'amber', label: 'Golden Harvest', color: '#f59e0b' },
                      { id: 'cyan', label: 'Logistics Teal', color: '#06b6d4' },
                      { id: 'indigo', label: 'M&E Indigo', color: '#6366f1' },
                      { id: 'rose', label: 'Critical Alert', color: '#f43f5e' },
                      { id: 'slate', label: 'Modern Neutral', color: '#94a3b8' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setSelectedTheme(th.id as InfographicTheme)}
                        className={`p-2 rounded-lg text-xs font-semibold border flex items-center gap-2 transition-all ${
                          selectedTheme === th.id
                            ? 'bg-slate-800 border-white text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: th.color }}
                        />
                        <span>{th.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Template Title & Live Layout Preview */}
              <div className="md:col-span-6 space-y-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Infographic Header &amp; Subtitle
                  </h5>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Custom Dashboard Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Custom Subtitle / Organization Attribution
                    </label>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Visual Architecture Preview */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Visual Architecture Preview
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                      {activeTemplate.widgets.length} Widgets Ready
                    </span>
                  </div>

                  <div className="border border-slate-850 rounded-xl p-3 bg-slate-900/50 space-y-2">
                    {/* Simulated KPI Row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="h-12 rounded-lg bg-slate-800/80 border border-slate-700/60 p-1.5 flex flex-col justify-between"
                        >
                          <div className="w-8 h-1.5 bg-slate-700 rounded" />
                          <div className="w-12 h-3 bg-emerald-500/40 rounded font-bold" />
                        </div>
                      ))}
                    </div>

                    {/* Simulated Map + Bar Row */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7 h-28 rounded-lg bg-slate-800/90 border border-slate-700/60 flex flex-col items-center justify-center text-slate-500 text-[11px] gap-1">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Sierra Leone Map ({mapMetric})</span>
                      </div>
                      <div className="col-span-5 h-28 rounded-lg bg-slate-800/90 border border-slate-700/60 p-2 flex flex-col justify-between">
                        <div className="w-16 h-2 bg-slate-700 rounded" />
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-amber-500/40 rounded" />
                          <div className="w-4/5 h-2 bg-amber-500/40 rounded" />
                          <div className="w-3/5 h-2 bg-amber-500/40 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Value Chain Icon Placeholder Preview */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-850 border border-slate-800 text-xs">
                      <span className="text-slate-400">Featured Crop / Value Chain:</span>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        {renderAgriIcon(iconPlaceholder, 'w-4 h-4')}
                        <span className="capitalize">{iconPlaceholder.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {activeTemplate && (
            <button
              onClick={handleConfirmApply}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Customized Template to Canvas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
