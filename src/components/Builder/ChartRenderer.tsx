import React, { useState, useRef } from 'react';
import { WidgetConfig, Dataset } from '../../types';
import { SierraLeoneMap } from '../Map/SierraLeoneMap';
import {
  RicePaddyIcon,
  CassavaTuberIcon,
  CocoaPodIcon,
  OilPalmIcon,
  AgroMillIcon,
  SolarIrrigationIcon,
  GrainSiloIcon,
  QualityBadgeIcon,
} from '../Common/AgriIcons';
import {
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Code,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ChartRendererProps {
  widget: WidgetConfig;
  dataset?: Dataset;
  selectedDistrict?: string | null;
  onSelectDistrict?: (d: string | null) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  widget,
  dataset,
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and aggregate dataset rows
  const rows = dataset ? dataset.rows : [];
  const filteredRows = selectedDistrict
    ? rows.filter(
        (r) =>
          String(r.District || r.district || '').toLowerCase() ===
          selectedDistrict.toLowerCase()
      )
    : rows;

  // Aggregation helper
  const aggregatedData: { label: string; value: number; sublabel?: string }[] = [];
  if (filteredRows.length > 0 && widget.xAxis && widget.yAxis) {
    const groups = new Map<string, number[]>();
    filteredRows.forEach((r) => {
      const key = String(r[widget.xAxis] || 'N/A');
      const val = parseFloat(r[widget.yAxis]);
      const num = isNaN(val) ? 0 : val;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(num);
    });

    groups.forEach((vals, key) => {
      let finalVal = 0;
      switch (widget.aggregation) {
        case 'avg':
          finalVal = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
          break;
        case 'count':
          finalVal = vals.length;
          break;
        case 'max':
          finalVal = Math.max(...vals);
          break;
        case 'min':
          finalVal = Math.min(...vals);
          break;
        case 'sum':
        default:
          finalVal = vals.reduce((a, b) => a + b, 0);
          break;
      }
      aggregatedData.push({
        label: key,
        value: Math.round(finalVal * 100) / 100,
      });
    });

    if (widget.sortOrder === 'desc') {
      aggregatedData.sort((a, b) => b.value - a.value);
    } else if (widget.sortOrder === 'asc') {
      aggregatedData.sort((a, b) => a.value - b.value);
    }

    if (widget.limit && widget.limit > 0) {
      aggregatedData.splice(widget.limit);
    }
  }

  // Color mappings
  const getColorHex = (scheme: string, index: number = 0): string => {
    const palettes: Record<string, string[]> = {
      emerald: ['#10b981', '#059669', '#34d399', '#047857', '#6ee7b7', '#065f46'],
      amber: ['#f59e0b', '#d97706', '#fbbf24', '#b45309', '#fcd34d', '#78350f'],
      cyan: ['#06b6d4', '#0891b2', '#22d3ee', '#0e7490', '#67e8f9', '#164e63'],
      indigo: ['#6366f1', '#4f46e5', '#818cf8', '#4338ca', '#a5b4fc', '#312e81'],
      rose: ['#f43f5e', '#e11d48', '#fb7185', '#be123c', '#fda4af', '#881337'],
      slate: ['#94a3b8', '#64748b', '#cbd5e1', '#475569', '#e2e8f0', '#334155'],
    };
    const list = palettes[scheme] || palettes.emerald;
    return list[index % list.length];
  };

  // Export handlers
  const exportToCSV = () => {
    if (aggregatedData.length === 0) return;
    const header = `${widget.xAxis},${widget.yAxis}\n`;
    const body = aggregatedData.map((d) => `"${d.label}",${d.value}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget.title.toLowerCase().replace(/\s+/g, '_')}_data.csv`;
    a.click();
    setShowExportMenu(false);
  };

  const exportToSVG = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget.title.toLowerCase().replace(/\s+/g, '_')}.svg`;
    a.click();
    setShowExportMenu(false);
  };

  const exportToPNG = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const svgSize = svgEl.getBoundingClientRect();
    const scale = 2; // High DPI
    canvas.width = (svgSize.width || 600) * scale;
    canvas.height = (svgSize.height || 360) * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${widget.title.toLowerCase().replace(/\s+/g, '_')}.png`;
      a.click();
      setShowExportMenu(false);
    };
    img.src = url;
  };

  // Render specific chart type
  const renderChartBody = () => {
    switch (widget.type) {
      case 'kpi_metric': {
        const total = aggregatedData.reduce((acc, curr) => acc + curr.value, 0);
        const displayVal =
          widget.aggregation === 'avg' && aggregatedData.length > 0
            ? total / aggregatedData.length
            : total;
        const target = widget.targetValue || 100;
        const pctOfTarget = Math.min(150, Math.round((displayVal / target) * 100));
        const color = getColorHex(widget.colorScheme, 0);

        return (
          <div className="flex flex-col justify-between h-full pt-1 pb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {widget.metricPrefix || ''}
                {displayVal > 1000 ? displayVal.toLocaleString() : displayVal.toFixed(1)}
                {widget.metricSuffix || ''}
              </span>
            </div>

            {widget.targetValue && (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Target: {target.toLocaleString()}
                  </span>
                  <span
                    className={`font-semibold ${
                      pctOfTarget >= 100 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {pctOfTarget}% of Target
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, pctOfTarget)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>+18.4% YoY Project Baseline Improvement</span>
            </div>
          </div>
        );
      }

      case 'map': {
        return (
          <div className="w-full min-h-[480px]">
            <SierraLeoneMap
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              height="h-[440px]"
              activeMetric={
                widget.mapMetric === 'yield'
                  ? 'rice_yield'
                  : widget.mapMetric === 'oil_palm'
                  ? 'oil_palm'
                  : widget.mapMetric === 'cocoa'
                  ? 'cocoa'
                  : widget.mapMetric === 'vegetables'
                  ? 'vegetables'
                  : widget.mapMetric === 'ivs_ha'
                  ? 'ivs_ha'
                  : widget.mapMetric === 'processing'
                  ? 'processing'
                  : widget.mapMetric === 'target_pct'
                  ? 'me_completion'
                  : 'beneficiaries'
              }
            />
          </div>
        );
      }

      case 'bar': {
        const maxVal = Math.max(...aggregatedData.map((d) => d.value), 1);
        const barColor = getColorHex(widget.colorScheme, 0);

        return (
          <div className="relative w-full h-[260px] flex flex-col justify-end pt-6 pb-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <g key={i}>
                  <line
                    x1="40"
                    y1={170 - ratio * 140}
                    x2="480"
                    y2={170 - ratio * 140}
                    stroke="#1e293b"
                    strokeDasharray="2 2"
                  />
                  <text
                    x="30"
                    y={173 - ratio * 140}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {Math.round(ratio * maxVal)}
                  </text>
                </g>
              ))}

              {/* Bars */}
              {aggregatedData.map((d, i) => {
                const totalBars = aggregatedData.length;
                const slotWidth = 430 / totalBars;
                const barWidth = Math.min(32, slotWidth * 0.7);
                const x = 50 + i * slotWidth + (slotWidth - barWidth) / 2;
                const barHeight = (d.value / maxVal) * 140;
                const y = 170 - barHeight;
                const isHovered = hoveredIndex === i;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-all"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="3"
                      fill={barColor}
                      fillOpacity={isHovered ? 1 : 0.85}
                      className="transition-all duration-150"
                      style={{
                        filter: isHovered
                          ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                          : 'none',
                      }}
                    />
                    {/* Value on top of bar if hovered or <= 8 items */}
                    {(isHovered || totalBars <= 8) && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        fill={isHovered ? '#ffffff' : '#94a3b8'}
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {d.value}
                      </text>
                    )}
                    {/* X axis label */}
                    <text
                      x={x + barWidth / 2}
                      y="186"
                      fill={isHovered ? '#38bdf8' : '#64748b'}
                      fontSize="9"
                      fontWeight={isHovered ? '600' : '400'}
                      textAnchor="middle"
                      className="select-none"
                    >
                      {d.label.length > 8 ? d.label.substring(0, 7) + '..' : d.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip card */}
            {hoveredIndex !== null && aggregatedData[hoveredIndex] && (
              <div className="absolute top-2 right-4 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-md shadow-lg text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: barColor }} />
                <span className="font-semibold text-white">
                  {aggregatedData[hoveredIndex].label}:
                </span>
                <span className="font-bold text-emerald-400">
                  {aggregatedData[hoveredIndex].value.toLocaleString()} {widget.metricSuffix || ''}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'horizontal_bar': {
        const maxVal = Math.max(...aggregatedData.map((d) => d.value), 1);
        const barColor = getColorHex(widget.colorScheme, 0);

        return (
          <div className="w-full space-y-2.5 py-2">
            {aggregatedData.slice(0, 8).map((d, i) => {
              const pct = Math.min(100, Math.round((d.value / maxVal) * 100));
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-medium ${
                        isHovered ? 'text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {d.label}
                    </span>
                    <span className="font-bold text-slate-200">
                      {d.value.toLocaleString()} {widget.metricSuffix || ''}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                        opacity: isHovered ? 1 : 0.8,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      case 'line':
      case 'area': {
        const maxVal = Math.max(...aggregatedData.map((d) => d.value), 1);
        const minVal = Math.min(...aggregatedData.map((d) => d.value), 0);
        const range = maxVal - minVal || 1;
        const color = getColorHex(widget.colorScheme, 0);

        const points = aggregatedData.map((d, i) => {
          const x = 45 + (i / (aggregatedData.length - 1 || 1)) * 420;
          const y = 170 - ((d.value - minVal) / range) * 130;
          return { x, y, ...d };
        });

        const pathD = points.reduce(
          (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
          ''
        );

        const areaD =
          points.length > 0
            ? `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`
            : '';

        return (
          <div className="relative w-full h-[260px] flex flex-col justify-end pt-4 pb-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => (
                <g key={i}>
                  <line
                    x1="40"
                    y1={170 - ratio * 130}
                    x2="480"
                    y2={170 - ratio * 130}
                    stroke="#1e293b"
                    strokeDasharray="2 2"
                  />
                  <text
                    x="35"
                    y={173 - ratio * 130}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {Math.round(minVal + ratio * range)}
                  </text>
                </g>
              ))}

              {/* Area fill */}
              <path d={areaD} fill={`url(#grad-${widget.id})`} />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((p, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill="#0f172a"
                      stroke={color}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all"
                    />
                    <text
                      x={p.x}
                      y="186"
                      fill={isHovered ? '#38bdf8' : '#64748b'}
                      fontSize="9"
                      fontWeight={isHovered ? '600' : '400'}
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredIndex !== null && points[hoveredIndex] && (
              <div className="absolute top-2 right-4 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-md shadow-lg text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-semibold text-white">
                  {points[hoveredIndex].label}:
                </span>
                <span className="font-bold text-emerald-400">
                  {points[hoveredIndex].value.toLocaleString()} {widget.metricSuffix || ''}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'donut': {
        const total = aggregatedData.reduce((acc, curr) => acc + curr.value, 0) || 1;
        let cumulativeAngle = 0;
        const cx = 130;
        const cy = 110;
        const r = 70;
        const innerR = 44;

        const slices = aggregatedData.map((d, i) => {
          const sliceAngle = (d.value / total) * 360;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + sliceAngle;
          cumulativeAngle = endAngle;

          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);

          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);

          const ix1 = cx + innerR * Math.cos(startRad);
          const iy1 = cy + innerR * Math.sin(startRad);
          const ix2 = cx + innerR * Math.cos(endRad);
          const iy2 = cy + innerR * Math.sin(endRad);

          const largeArc = sliceAngle > 180 ? 1 : 0;

          const pathD = [
            `M ${ix1} ${iy1}`,
            `L ${x1} ${y1}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            'Z',
          ].join(' ');

          return {
            ...d,
            pathD,
            color: getColorHex(widget.colorScheme, i),
            pct: Math.round((d.value / total) * 100),
          };
        });

        return (
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-2">
            <div className="relative w-64 h-56 flex items-center justify-center">
              <svg viewBox="0 0 260 220" className="w-full h-full">
                {slices.map((s, i) => {
                  const isHovered = hoveredIndex === i;
                  return (
                    <path
                      key={i}
                      d={s.pathD}
                      fill={s.color}
                      fillOpacity={isHovered ? 1 : 0.85}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white">
                  {hoveredIndex !== null && slices[hoveredIndex]
                    ? `${slices[hoveredIndex].pct}%`
                    : `${total > 1000 ? Math.round(total / 1000) + 'k' : total}`}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {hoveredIndex !== null && slices[hoveredIndex]
                    ? slices[hoveredIndex].label
                    : 'Total Units'}
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 space-y-1.5 w-full">
              {slices.map((s, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    hoveredIndex === i ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs text-slate-300 font-medium">{s.label}</span>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {s.value.toLocaleString()} ({s.pct}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'flow_diagram': {
        const steps = widget.flowSteps || [];
        return (
          <div className="w-full py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {steps.map((step, i) => (
                <div
                  key={step.id || i}
                  className="relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all rounded-xl p-3.5 flex flex-col justify-between group shadow-sm"
                >
                  {/* Step sequence badge */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                      {step.stage}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {step.efficiency}% Eff.
                    </span>
                  </div>

                  {/* Title & icon */}
                  <div>
                    <h5 className="text-xs font-bold text-white line-clamp-2 mb-1 group-hover:text-emerald-300 transition-colors">
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {step.subtext}
                    </p>
                  </div>

                  {/* Metric & loss footer */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <div className="text-xs font-extrabold text-emerald-400">{step.metric}</div>
                    <div className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{step.loss}</span>
                    </div>
                  </div>

                  {/* Flow Arrow indicator (between cards) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 shadow">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'target_progress': {
        const total = aggregatedData.reduce((acc, curr) => acc + curr.value, 0);
        const target = widget.targetValue || 100;
        const pct = Math.round((total / target) * 100);

        return (
          <div className="w-full flex flex-col justify-center h-full py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white">
                  {total.toLocaleString()} {widget.metricSuffix || ''}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  out of {target.toLocaleString()} target
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  pct >= 90
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : pct >= 70
                    ? 'bg-amber-950 text-amber-400 border-amber-700'
                    : 'bg-rose-950 text-rose-400 border-rose-700'
                }`}
              >
                {pct}% Delivered
              </span>
            </div>

            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">On Track</span>
                <span className="font-bold text-emerald-400">&gt; 85% Target</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Moderate</span>
                <span className="font-bold text-amber-400">70 - 85%</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Lagging</span>
                <span className="font-bold text-rose-400">&lt; 70%</span>
              </div>
            </div>
          </div>
        );
      }

      case 'notes': {
        return (
          <div className="w-full h-full p-3 bg-slate-900/60 border border-slate-800/90 rounded-lg text-xs leading-relaxed text-slate-300">
            <p>{widget.customNotes || 'Add field observations, M&E audit notes, or data source annotations.'}</p>
          </div>
        );
      }

      default:
        return <div className="text-xs text-slate-500">Visualization not configured</div>;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-full bg-slate-900/80 backdrop-blur-sm border border-slate-800/90 hover:border-slate-700/80 transition-all rounded-xl p-4 shadow-lg group select-none"
    >
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            {widget.valueChain?.includes('Rice') && <RicePaddyIcon className="w-4 h-4 text-emerald-400" />}
            {widget.valueChain?.includes('Cassava') && <CassavaTuberIcon className="w-4 h-4 text-amber-400" />}
            {widget.valueChain?.includes('Cocoa') && <CocoaPodIcon className="w-4 h-4 text-amber-500" />}
            {widget.valueChain?.includes('Oil Palm') && <OilPalmIcon className="w-4 h-4 text-emerald-500" />}
            <span>{widget.title}</span>
          </h4>
          {widget.subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{widget.subtitle}</p>
          )}
        </div>

        {/* Quick Export Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export chart or data"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1.5 z-40 text-xs text-slate-300 animate-in fade-in zoom-in-95">
              <button
                onClick={exportToPNG}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 hover:text-white transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export High-Res PNG</span>
              </button>
              <button
                onClick={exportToSVG}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 hover:text-white transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-sky-400" />
                <span>Export Vector SVG</span>
              </button>
              <button
                onClick={exportToCSV}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 hover:text-white transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Aggregated CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Widget Content Body */}
      <div className="flex-1 w-full">{renderChartBody()}</div>
    </div>
  );
};
