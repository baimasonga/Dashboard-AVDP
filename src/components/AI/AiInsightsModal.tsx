import React, { useState } from 'react';
import { Dataset, CanvasState } from '../../types';
import {
  BarChart3,
  Check,
  Copy,
  Download,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

type InsightType = 'general' | 'bottlenecks' | 'interventions' | 'projections';

interface AiInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset;
  canvasState: CanvasState;
  selectedDistrict: string | null;
  selectedValueChain: string;
}

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value.replace(/,/g, '').replace(/%$/, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

export const AiInsightsModal: React.FC<AiInsightsModalProps> = ({
  isOpen,
  onClose,
  dataset,
  canvasState,
  selectedDistrict,
  selectedValueChain,
}) => {
  const [insightType, setInsightType] = useState<InsightType>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const generateLocalInsight = (type: InsightType): string => {
    const districtColumn = dataset.columns.find((column) =>
      column.toLowerCase().includes('district')
    );
    const scopedRows =
      selectedDistrict && districtColumn
        ? dataset.rows.filter(
            (row) =>
              String(row[districtColumn] ?? '').toLowerCase() ===
              selectedDistrict.toLowerCase()
          )
        : dataset.rows;

    const metricSummaries = dataset.numericColumns
      .map((column) => {
        const values = scopedRows
          .map((row) => asNumber(row[column]))
          .filter((value): value is number => value !== null);
        if (!values.length) return null;
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        return {
          column,
          count: values.length,
          missing: scopedRows.length - values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          mean,
        };
      })
      .filter((summary): summary is NonNullable<typeof summary> => summary !== null)
      .slice(0, 6);

    const scope = [
      selectedDistrict ? `district: ${selectedDistrict}` : 'all districts',
      selectedValueChain,
    ].join(' · ');

    const evidence =
      metricSummaries.length > 0
        ? metricSummaries.map(
            (metric) =>
              `- **${metric.column}** — n=${metric.count}, mean=${formatNumber(
                metric.mean
              )}, range=${formatNumber(metric.min)}–${formatNumber(metric.max)}, missing=${
                metric.missing
              }`
          )
        : ['- No usable numeric metric was found in the selected dataset and scope.'];

    const missingMetrics = metricSummaries.filter((metric) => metric.missing > 0);
    const widestSpread = [...metricSummaries].sort(
      (a, b) => b.max - b.min - (a.max - a.min)
    )[0];

    const observations: string[] = [
      `${scopedRows.length} of ${dataset.rows.length} rows are included in the current analytical scope.`,
    ];

    if (widestSpread) {
      observations.push(
        `${widestSpread.column} has the widest observed numeric range (${formatNumber(
          widestSpread.min
        )}–${formatNumber(widestSpread.max)}); investigate the underlying records before interpreting the variation.`
      );
    }
    if (missingMetrics.length) {
      observations.push(
        `${missingMetrics.length} displayed metric(s) contain missing values; completeness should be resolved before official reporting.`
      );
    } else if (metricSummaries.length) {
      observations.push('No missing values were detected in the numeric values summarized here.');
    }

    const typeGuidance: Record<InsightType, string[]> = {
      general: [
        'Use the evidence table below as a descriptive snapshot, not as proof of programme impact.',
        'Compare the same indicators across reporting periods before drawing trend conclusions.',
      ],
      bottlenecks: [
        'Review records behind wide metric ranges and missing values as priority data-quality checks.',
        'Validate apparent low or high values with district source documents before escalation.',
      ],
      interventions: [
        'Use verified gaps to prioritize follow-up data collection and programme review.',
        'Record the owner, due date, and evidence source for any action taken from this dashboard.',
      ],
      projections: [
        'No forecast is produced: the current dataset does not establish a validated time-series model.',
        'Add reporting-period fields, targets, and documented assumptions before enabling projections.',
      ],
    };

    return `# AVDP local analytical brief

**Dataset:** ${dataset.name}  
**Scope:** ${scope}  
**Data status:** Demonstration / fictitious data  
**Method:** Deterministic browser calculation; no dashboard rows were transmitted to an external service.

## Observations

${observations.map((item) => `- ${item}`).join('\n')}

## Evidence

${evidence.join('\n')}

## Suggested next checks

${typeGuidance[type].map((item) => `- ${item}`).join('\n')}
${customPrompt.trim() ? `\n**User question recorded:** ${customPrompt.trim()}\n\nThe local engine only returns verified descriptive statistics; it does not infer causes or answer questions beyond the available fields.` : ''}

## Limitations

- These are fictitious prototype records and must not be presented as official AVDP findings.
- Means and ranges are descriptive only; they do not establish causation, attribution, or statistical significance.
- The result reflects ${canvasState.widgets.length} configured dashboard widget(s) and the current filters at generation time.
`;
  };

  const handleGenerate = (type: InsightType = insightType) => {
    setInsightType(type);
    setIsLoading(true);
    setResultText(null);
    window.setTimeout(() => {
      setResultText(generateLocalInsight(type));
      setIsLoading(false);
    }, 250);
  };

  const copyToClipboard = async () => {
    if (!resultText) return;
    await navigator.clipboard.writeText(resultText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const exportReportFile = () => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `AVDP_Local_Insights_${dataset.name.replace(/\s+/g, '_')}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const modes: Array<{ id: InsightType; label: string; description: string }> = [
    { id: 'general', label: 'Summary', description: 'Descriptive metrics' },
    { id: 'bottlenecks', label: 'Data gaps', description: 'Missing values & ranges' },
    { id: 'interventions', label: 'Next checks', description: 'Verification actions' },
    { id: 'projections', label: 'Readiness', description: 'Forecast prerequisites' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-700 flex items-center justify-center text-sky-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Evidence-based dashboard insights
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  LOCAL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Descriptive analysis of the current fictitious dataset and filter scope
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close insights" className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-[11px] text-emerald-200 flex gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Privacy-safe mode: calculations run in this browser. No dashboard records are sent to an external AI service.</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleGenerate(mode.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  insightType === mode.id
                    ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold text-white mb-0.5">{mode.label}</div>
                <div className="text-[10px] text-slate-400">{mode.description}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(event) => setCustomPrompt(event.target.value)}
              placeholder="Record a question to guide follow-up verification…"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLoading ? 'Calculating…' : 'Generate'}
            </button>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 min-h-[220px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                <span className="text-xs">Calculating scoped descriptive statistics…</span>
              </div>
            ) : resultText ? (
              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">{resultText}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
                <BarChart3 className="w-8 h-8 text-slate-600" />
                <span>Select an insight mode to calculate a scoped brief.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Current dataset: <strong>{dataset.name}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyToClipboard} disabled={!resultText} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={exportReportFile} disabled={!resultText} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-40">
              <Download className="w-3.5 h-3.5" />
              Export brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
