import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  FutureYieldRegressionService,
  FiveYearOutlookResult,
} from '../../services/futureYieldRegressionService';

interface ExportOutlookMenuProps {
  outlookResult: FiveYearOutlookResult;
}

export const ExportOutlookMenu: React.FC<ExportOutlookMenuProps> = ({
  outlookResult,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleExportCsv = () => {
    const csvContent = FutureYieldRegressionService.generateCsv(outlookResult);
    const filename = `AVDP_5Yr_Outlook_${outlookResult.commodity}_${outlookResult.district.replace(
      /\s+/g,
      '_'
    )}_2027_2031.csv`;
    FutureYieldRegressionService.downloadFile(
      csvContent,
      filename,
      'text/csv;charset=utf-8;'
    );
    triggerToast('CSV report downloaded successfully');
    setIsOpen(false);
  };

  const handleExportJson = () => {
    const jsonContent = FutureYieldRegressionService.generateJson(outlookResult);
    const filename = `AVDP_5Yr_Outlook_${outlookResult.commodity}_${outlookResult.district.replace(
      /\s+/g,
      '_'
    )}_2027_2031.json`;
    FutureYieldRegressionService.downloadFile(
      jsonContent,
      filename,
      'application/json;charset=utf-8;'
    );
    triggerToast('JSON analytical dossier downloaded');
    setIsOpen(false);
  };

  const handleCopySummary = () => {
    const pointClosure =
      outlookResult.projectedPoints.find((p) => p.year === 2027) ||
      outlookResult.projectedPoints[outlookResult.projectedPoints.length - 1];
    const targetClosure = outlookResult.projectClosureTargetYield || outlookResult.nationalTarget2030Yield;

    const text = [
      `=== SIERRA LEONE AVDP FUTURE YIELD OUTLOOK (2019–2027 / 2028) ===`,
      `Commodity: ${outlookResult.commodityMeta.name}`,
      `District: ${outlookResult.district}`,
      `Scenario: ${outlookResult.scenario} (Growth Multiplier: ${outlookResult.growthFactor.toFixed(2)}x)`,
      `----------------------------------------------------`,
      `Historical Project Baseline: ${outlookResult.baselineYield} ${outlookResult.commodityMeta.unitYield}`,
      `2027 Project Closure Projected Yield: ${pointClosure?.yieldMTPerHa} ${outlookResult.commodityMeta.unitYield}`,
      `Project Closure Target: ${targetClosure} ${outlookResult.commodityMeta.unitYield}`,
      `Closure Target Status: ${
        outlookResult.isDeficitProjected2030
          ? `Shortfall of ${outlookResult.deficit2030YieldMT} MT/Ha (-${outlookResult.deficit2030Pct}%) | ~${outlookResult.productionShortfall2030MT.toLocaleString()} MT volume gap`
          : 'Project Closure Target Met / Self-Sufficient'
      }`,
      `Closure Target Attainment: ${outlookResult.targetAttainmentPct}%`,
      `Projected CAGR: +${outlookResult.projected5YrCagrPct}%`,
      `----------------------------------------------------`,
      `Model Fit: R² = ${(outlookResult.regression.rSquared * 100).toFixed(1)}% | Reliability: ${
        outlookResult.regression.reliabilityRating
      } (${outlookResult.regression.confidenceScore}/100)`,
      `OLS Linear Equation: ${outlookResult.regression.equation}`,
      `Annual Velocity: ${outlookResult.regression.annualChangeLabel}`,
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      triggerToast('Summary copied to clipboard');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        title="Export 5-Year Outlook Report"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span>Export Outlook</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-40 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Export 5-Year Forecast
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full px-3 py-2.5 text-left hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">Export CSV Data</div>
              <div className="text-[10px] text-slate-400">
                Tabular year-by-year yields, targets, and deficit gaps
              </div>
            </div>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="w-full px-3 py-2.5 text-left hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer border-t border-slate-800/60"
          >
            <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">Export JSON Dossier</div>
              <div className="text-[10px] text-slate-400">
                Full econometric statistics, metadata, and points
              </div>
            </div>
          </button>

          {/* Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full px-3 py-2.5 text-left hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer border-t border-slate-800/60"
          >
            <Copy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">Copy Executive Summary</div>
              <div className="text-[10px] text-slate-400">
                Formatted text breakdown for briefs and reporting
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
