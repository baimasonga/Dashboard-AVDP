import React, { useState } from 'react';
import { WidgetConfig, Dataset, CanvasState } from '../../types';
import { ChartRenderer } from './ChartRenderer';
import { WidgetConfigModal } from './WidgetConfigModal';
import {
  Plus,
  MoveUp,
  MoveDown,
  Edit2,
  Trash2,
  Maximize2,
  Layers,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  LayoutTemplate,
  Wand2,
} from 'lucide-react';

interface VisualCanvasProps {
  canvasState: CanvasState;
  datasets: Dataset[];
  selectedDistrict: string | null;
  onSelectDistrict: (district: string | null) => void;
  onUpdateCanvas: (updated: CanvasState) => void;
  activeRemoteWidgetId?: string | null;
  onOpenTemplates?: () => void;
  onOpenDataCleaning?: () => void;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  canvasState,
  datasets,
  selectedDistrict,
  onSelectDistrict,
  onUpdateCanvas,
  activeRemoteWidgetId,
  onOpenTemplates,
  onOpenDataCleaning,
}) => {
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const widgets = canvasState.widgets || [];

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newWidgets = [...widgets];
    const [moved] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(dropIndex, 0, moved);

    onUpdateCanvas({
      ...canvasState,
      widgets: newWidgets,
      lastModified: Date.now(),
      version: canvasState.version + 1,
    });
    setDraggedIndex(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const newWidgets = [...widgets];
    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;

    onUpdateCanvas({
      ...canvasState,
      widgets: newWidgets,
      lastModified: Date.now(),
      version: canvasState.version + 1,
    });
  };

  const handleDelete = (id: string) => {
    const newWidgets = widgets.filter((w) => w.id !== id);
    onUpdateCanvas({
      ...canvasState,
      widgets: newWidgets,
      lastModified: Date.now(),
      version: canvasState.version + 1,
    });
  };

  const handleSaveWidget = (updated: WidgetConfig) => {
    const exists = widgets.some((w) => w.id === updated.id);
    const newWidgets = exists
      ? widgets.map((w) => (w.id === updated.id ? updated : w))
      : [...widgets, updated];

    onUpdateCanvas({
      ...canvasState,
      widgets: newWidgets,
      lastModified: Date.now(),
      version: canvasState.version + 1,
    });
  };

  const handleAddNew = (type: WidgetConfig['type']) => {
    const defaultDs = datasets[0];
    const newWidget: WidgetConfig = {
      id: 'w-' + Date.now(),
      type,
      title: `New ${type.replace(/_/g, ' ').toUpperCase()}`,
      datasetId: defaultDs ? defaultDs.id : 'ds_district_matrix',
      xAxis: defaultDs ? defaultDs.categoricalColumns[0] || defaultDs.columns[0] : 'District',
      yAxis: defaultDs ? defaultDs.numericColumns[0] || defaultDs.columns[1] : 'Beneficiaries',
      aggregation: 'sum',
      colorScheme: 'emerald',
      colSpan: type === 'kpi_metric' ? 3 : type === 'flow_diagram' ? 12 : 6,
    };
    setEditingWidget(newWidget);
    setIsModalOpen(true);
  };

  // Helper for column classes in 12-column grid
  const getColSpanClass = (span: number) => {
    switch (span) {
      case 3:
        return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 4:
        return 'col-span-12 sm:col-span-6 lg:col-span-4';
      case 5:
        return 'col-span-12 lg:col-span-5';
      case 6:
        return 'col-span-12 lg:col-span-6';
      case 7:
        return 'col-span-12 lg:col-span-7';
      case 8:
        return 'col-span-12 lg:col-span-8';
      case 12:
      default:
        return 'col-span-12';
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Widget Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Infographic Canvas ({widgets.length} blocks)
          </span>

          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="ml-2 px-2.5 py-1 text-xs bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer"
              title="Browse pre-designed infographic templates for Sierra Leone agriculture"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
              <span>Templates</span>
            </button>
          )}

          {onOpenDataCleaning && (
            <button
              onClick={onOpenDataCleaning}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
              title="Validate and clean dataset values, standardize districts, and cap outliers"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Clean Data</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 hidden xl:inline ml-1">
            • Drag blocks to reorder • Double click to edit
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 font-medium">Add Block:</span>
          <button
            onClick={() => handleAddNew('kpi_metric')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>KPI Metric</span>
          </button>
          <button
            onClick={() => handleAddNew('bar')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => handleAddNew('line')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-sky-400" />
            <span>Trend Line</span>
          </button>
          <button
            onClick={() => handleAddNew('donut')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-indigo-400" />
            <span>Donut Share</span>
          </button>
          <button
            onClick={() => handleAddNew('map')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>SL District Map</span>
          </button>
          <button
            onClick={() => handleAddNew('flow_diagram')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-rose-400" />
            <span>Value Chain Flow</span>
          </button>
        </div>
      </div>

      {/* Responsive 12-Column Grid Canvas */}
      <div className="grid grid-cols-12 gap-4">
        {widgets.map((widget, index) => {
          const ds = datasets.find((d) => d.id === widget.datasetId);
          const isRemoteActive = activeRemoteWidgetId === widget.id;

          return (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`${getColSpanClass(
                widget.colSpan
              )} relative group transition-all duration-200 ${
                isRemoteActive ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950' : ''
              }`}
            >
              {/* Remote collaborator indicator */}
              {isRemoteActive && (
                <div className="absolute -top-3 right-4 z-30 px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold shadow-lg animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Peer is viewing / editing this block</span>
                </div>
              )}

              {/* Action Toolbar on Hover */}
              <div className="absolute top-3 right-10 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-lg">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  title="Move left/up"
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === widgets.length - 1}
                  title="Move right/down"
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingWidget(widget);
                    setIsModalOpen(true);
                  }}
                  title="Configure axes & metrics"
                  className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(widget.id)}
                  title="Remove block"
                  className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chart Renderer Container */}
              <div className="h-full">
                <ChartRenderer
                  widget={widget}
                  dataset={ds}
                  selectedDistrict={selectedDistrict}
                  onSelectDistrict={onSelectDistrict}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for editing widget */}
      <WidgetConfigModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWidget(null);
        }}
        widget={editingWidget}
        datasets={datasets}
        onSave={handleSaveWidget}
      />
    </div>
  );
};
