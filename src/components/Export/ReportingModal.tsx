import React, { useState } from 'react';
import { CanvasState, Dataset, DistrictMetric } from '../../types';
import { SIERRA_LEONE_DISTRICTS, AVDP_ME_LOGFRAME } from '../../data/sierraLeoneData';
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Package,
  Image as ImageIcon,
  Check,
  X,
  Share2,
  Calendar,
} from 'lucide-react';

interface ReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasState: CanvasState;
  datasets: Dataset[];
  selectedDistrict: string | null;
}

export const ReportingModal: React.FC<ReportingModalProps> = ({
  isOpen,
  onClose,
  canvasState,
  datasets,
  selectedDistrict,
}) => {
  const [reportTitle, setReportTitle] = useState(
    'Sierra Leone AVDP Operational Progress & M&E Quarterly Report'
  );
  const [reportingPeriod, setReportingPeriod] = useState('Q3 2024 / Harvest Season');
  const [includeMELogframe, setIncludeMELogframe] = useState(true);
  const [includeDistricts, setIncludeDistricts] = useState(true);
  const [includeAIInsights, setIncludeAIInsights] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const backupPackage = {
      project: 'Sierra Leone Agriculture Value Chain Development Project (AVDP)',
      exportTimestamp: new Date().toISOString(),
      reportingPeriod,
      canvasState,
      customDatasets: datasets.filter((d) => d.isCustom),
      districtsSummary: SIERRA_LEONE_DISTRICTS,
      meLogframe: AVDP_ME_LOGFRAME,
    };

    const blob = new Blob([JSON.stringify(backupPackage, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AVDP_Full_Workspace_Package_${Date.now()}.json`;
    a.click();
  };

  const handleExportConsolidatedCSV = () => {
    // Generate multi-district consolidated report CSV
    const headers =
      'District,Province,Beneficiary_Households,FBO_Count,Rice_Yield_MT_Ha,Cassava_Yield_MT_Ha,ME_Completion_Rate,Active_Processing_Mills,Primary_Value_Chains\n';
    const rows = SIERRA_LEONE_DISTRICTS.map((d) =>
      `"${d.name}","${d.province}",${d.beneficiaryHouseholds},${d.fboCount},${d.riceYieldMTPerHa},${d.cassavaYieldMTPerHa},${d.meCompletionRate},${d.activeProcessingMills},"${d.primaryValueChains.join('; ')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sierra_leone_avdp_all_districts_consolidated.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Official AVDP Project Report</h3>
              <p className="text-xs text-slate-400">
                Multi-format export engine for government, donor, and decentralized field reporting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reporting Period / Season
                </label>
                <input
                  type="text"
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Geographic Scope
                </label>
                <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                  {selectedDistrict ? `${selectedDistrict} District (Filtered)` : 'All 16 National Districts'}
                </div>
              </div>
            </div>
          </div>

          {/* Export Formats Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Choose Export Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Print / PDF */}
              <button
                onClick={handlePrintReport}
                className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-emerald-500 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white mb-0.5">Print / PDF Brief</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Ready-to-print executive memo with charts &amp; M&amp;E tables
                </div>
              </button>

              {/* Consolidated CSV */}
              <button
                onClick={handleExportConsolidatedCSV}
                className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-500 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white mb-0.5">Consolidated CSV</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Spreadsheet of all 16 districts, yield metrics, and mills
                </div>
              </button>

              {/* JSON Package */}
              <button
                onClick={handleExportJSON}
                className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-sky-500 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-2 group-hover:scale-105 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white mb-0.5">Project Bundle (JSON)</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Full canvas layout, custom datasets, and sync state
                </div>
              </button>
            </div>
          </div>

          {/* Printable Preview Summary */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Report Contents Summary:</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                Validated
              </span>
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px]">
              <li>Executive dashboard with {canvasState.widgets.length} infographic chart widgets</li>
              <li>Interactive Sierra Leone 16-district choropleth and value chain mapping</li>
              <li>M&E Logframe Matrix ({AVDP_ME_LOGFRAME.length} national impact indicators)</li>
              <li>Rice, Cassava, Cocoa, and Oil Palm yield benchmarks</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrintReport}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Open Printable Version</span>
          </button>
        </div>
      </div>
    </div>
  );
};
