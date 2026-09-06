import React, { useState } from 'react';
import { WidgetConfig, Dataset, ChartType } from '../../types';
import {
  X,
  Check,
  BarChart2,
  TrendingUp,
  PieChart,
  GitCommit,
  MapPin,
  FileText,
  Target,
  Hash,
} from 'lucide-react';

interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: WidgetConfig | null;
  datasets: Dataset[];
  onSave: (widget: WidgetConfig) => void;
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  isOpen,
  onClose,
  widget,
  datasets,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(widget?.title || 'New Visual Chart');
  const [subtitle, setSubtitle] = useState(widget?.subtitle || '');
  const [type, setType] = useState<ChartType>(widget?.type || 'bar');
  const [datasetId, setDatasetId] = useState(widget?.datasetId || datasets[0]?.id || '');
  const [xAxis, setXAxis] = useState(widget?.xAxis || '');
  const [yAxis, setYAxis] = useState(widget?.yAxis || '');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count' | 'max' | 'min'>(
    widget?.aggregation || 'sum'
  );
  const [colorScheme, setColorScheme] = useState<
    'emerald' | 'amber' | 'cyan' | 'indigo' | 'rose' | 'slate'
  >(widget?.colorScheme || 'emerald');
  const [colSpan, setColSpan] = useState(widget?.colSpan || 6);
  const [metricPrefix, setMetricPrefix] = useState(widget?.metricPrefix || '');
  const [metricSuffix, setMetricSuffix] = useState(widget?.metricSuffix || '');
  const [targetValue, setTargetValue] = useState<number>(widget?.targetValue || 100);

  const selectedDataset = datasets.find((d) => d.id === datasetId) || datasets[0];

  // Set defaults if axes empty
  React.useEffect(() => {
    if (selectedDataset) {
      if (!xAxis || !selectedDataset.columns.includes(xAxis)) {
        setXAxis(
          selectedDataset.categoricalColumns[0] || selectedDataset.columns[0] || ''
        );
      }
      if (!yAxis || !selectedDataset.columns.includes(yAxis)) {
        setYAxis(
          selectedDataset.numericColumns[0] || selectedDataset.columns[1] || ''
        );
      }
    }
  }, [datasetId, selectedDataset]);

  const handleSave = () => {
    const updated: WidgetConfig = {
      id: widget?.id || 'w-' + Date.now(),
      title,
      subtitle,
      type,
      datasetId,
      xAxis,
      yAxis,
      aggregation,
      colorScheme,
      colSpan,
      metricPrefix,
      metricSuffix,
      targetValue: Number(targetValue) || undefined,
      flowSteps: widget?.flowSteps,
      valueChain: widget?.valueChain,
      mapMetric: widget?.mapMetric,
    };
    onSave(updated);
    onClose();
  };

  const chartTypes: { type: ChartType; label: string; icon: any }[] = [
    { type: 'bar', label: 'Vertical Bar', icon: BarChart2 },
    { type: 'horizontal_bar', label: 'Horizontal Bar', icon: BarChart2 },
    { type: 'line', label: 'Trend Line', icon: TrendingUp },
    { type: 'area', label: 'Filled Area', icon: TrendingUp },
    { type: 'donut', label: 'Donut Share', icon: PieChart },
    { type: 'kpi_metric', label: 'KPI Metric', icon: Hash },
    { type: 'target_progress', label: 'Target Gauge', icon: Target },
    { type: 'flow_diagram', label: 'Value Chain Flow', icon: GitCommit },
    { type: 'map', label: 'District Map', icon: MapPin },
    { type: 'notes', label: 'Text / Notes', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {widget ? 'Edit Infographic Widget' : 'Configure New Chart Widget'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Chart Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Visualization Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {chartTypes.map((item) => {
                const Icon = item.icon;
                const active = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                      active
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Widget Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Metric Tons / Ha per district"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Dataset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Data Source (CSV or Preloaded)
            </label>
            <select
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Axes mapping if not notes or flow */}
          {type !== 'notes' && type !== 'flow_diagram' && type !== 'map' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  X-Axis / Category
                </label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {selectedDataset?.columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Y-Axis / Metric
                </label>
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {(selectedDataset?.numericColumns.length > 0
                    ? selectedDataset.numericColumns
                    : selectedDataset?.columns || []
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Aggregation
                </label>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="sum">Sum (Total)</option>
                  <option value="avg">Average (Mean)</option>
                  <option value="count">Count (Rows)</option>
                  <option value="max">Maximum</option>
                  <option value="min">Minimum</option>
                </select>
              </div>
            </div>
          )}

          {/* Color & Size configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Color Accent
              </label>
              <div className="flex items-center gap-2">
                {(['emerald', 'amber', 'cyan', 'indigo', 'rose', 'slate'] as const).map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorScheme(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        colorScheme === c ? 'border-white scale-110' : 'border-transparent opacity-70'
                      }`}
                      style={{
                        backgroundColor:
                          c === 'emerald'
                            ? '#10b981'
                            : c === 'amber'
                            ? '#f59e0b'
                            : c === 'cyan'
                            ? '#06b6d4'
                            : c === 'indigo'
                            ? '#6366f1'
                            : c === 'rose'
                            ? '#f43f5e'
                            : '#64748b',
                      }}
                    >
                      {colorScheme === c && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Grid Width (Cols out of 12)
              </label>
              <div className="flex items-center gap-1.5">
                {[3, 4, 6, 7, 8, 12].map((span) => (
                  <button
                    key={span}
                    type="button"
                    onClick={() => setColSpan(span)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                      colSpan === span
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {span === 12 ? 'Full (12)' : `${span}/12`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target value or Suffix for KPI */}
          {(type === 'kpi_metric' || type === 'target_progress') && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Metric Unit / Suffix
                </label>
                <input
                  type="text"
                  value={metricSuffix}
                  onChange={(e) => setMetricSuffix(e.target.value)}
                  placeholder="e.g. MT/Ha, Farmers, %"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Target Value
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
          >
            Save Widget Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
