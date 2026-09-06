import React, { useState } from 'react';
import { CanvasState, Dataset, ValueChainType } from '../../types';
import { ReportingPeriod } from '../../data/reportingPeriods';
import {
  AVDP_ME_LOGFRAME,
  SIERRA_LEONE_DISTRICTS,
} from '../../data/sierraLeoneData';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Package,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasState: CanvasState;
  datasets: Dataset[];
  selectedDistrict: string | null;
  selectedValueChain: ValueChainType;
  selectedReportingPeriod: ReportingPeriod;
}

type ReportType =
  | 'executive'
  | 'quarterly'
  | 'district'
  | 'value-chain'
  | 'data-quality';

const REPORT_TYPES: Array<{ id: ReportType; label: string }> = [
  { id: 'executive', label: 'Executive dashboard brief' },
  { id: 'quarterly', label: 'Quarterly progress summary' },
  { id: 'district', label: 'District performance profile' },
  { id: 'value-chain', label: 'Value-chain performance summary' },
  { id: 'data-quality', label: 'Data-quality summary' },
];

const escapeHtml = (value: unknown) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const downloadBlob = (content: string, type: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const ReportingModal: React.FC<ReportingModalProps> = ({
  isOpen,
  onClose,
  canvasState,
  datasets,
  selectedDistrict,
  selectedValueChain,
  selectedReportingPeriod,
}) => {
  const [reportType, setReportType] = useState<ReportType>('executive');
  const [reportTitle, setReportTitle] = useState(
    'Sierra Leone AVDP Demonstration Performance Report'
  );
  const reportingPeriod = selectedReportingPeriod;
  const [includeLogframe, setIncludeLogframe] = useState(true);
  const [includeDistricts, setIncludeDistricts] = useState(true);
  const [includeDatasetRegister, setIncludeDatasetRegister] = useState(true);

  if (!isOpen) return null;

  const scopedDistricts = selectedDistrict
    ? SIERRA_LEONE_DISTRICTS.filter(
        (district) => district.name === selectedDistrict
      )
    : selectedValueChain === 'All Value Chains'
    ? SIERRA_LEONE_DISTRICTS
    : SIERRA_LEONE_DISTRICTS.filter((district) =>
        district.primaryValueChains.includes(selectedValueChain)
      );

  const scopedIndicators = AVDP_ME_LOGFRAME.filter(
    (indicator) =>
      selectedValueChain === 'All Value Chains' ||
      indicator.valueChain === 'All Value Chains' ||
      indicator.valueChain === selectedValueChain
  );

  const scopeLabel = [
    selectedDistrict || 'All applicable districts',
    selectedValueChain,
  ].join(' • ');

  const handleExportJson = () => {
    const reportPackage = {
      metadata: {
        project: 'Sierra Leone Agriculture Value Chain Development Project (AVDP)',
        reportTitle,
        reportType,
        reportingPeriod,
        geographicScope: selectedDistrict || 'All applicable districts',
        valueChainScope: selectedValueChain,
        generatedAt: new Date().toISOString(),
        dataStatus: 'demonstration',
        disclaimer:
          'Fictitious prototype information. Not approved for official reporting.',
      },
      sections: {
        canvas: canvasState,
        datasets: includeDatasetRegister ? datasets : undefined,
        districts: includeDistricts ? scopedDistricts : undefined,
        logframe: includeLogframe ? scopedIndicators : undefined,
      },
    };

    downloadBlob(
      JSON.stringify(reportPackage, null, 2),
      'application/json',
      `avdp_demo_${reportType}_${Date.now()}.json`
    );
  };

  const handleExportCsv = () => {
    const headers =
      'Reporting_Period,District,Province,Value_Chain_Filter,Beneficiary_Households,FBO_Count,Rice_Yield_MT_Ha,Cassava_Yield_MT_Ha,Cocoa_Production_MT,Oil_Palm_Output_MT,ME_Completion_Pct,Feeder_Roads_Km,Processing_Facilities,Data_Status\n';
    const rows = scopedDistricts
      .map((district) =>
        [
          reportingPeriod,
          district.name,
          district.province,
          selectedValueChain,
          district.beneficiaryHouseholds,
          district.fboCount,
          district.riceYieldMTPerHa,
          district.cassavaYieldMTPerHa,
          district.cocoaProductionMT,
          district.oilPalmYieldMT,
          district.meCompletionRate,
          district.feederRoadsRehabKm,
          district.activeProcessingMills,
          'Demonstration',
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    downloadBlob(
      headers + rows,
      'text/csv;charset=utf-8;',
      `avdp_demo_district_summary_${reportingPeriod
        .toLowerCase()
        .replaceAll(' ', '-')}.csv`
    );
  };

  const handlePrintReport = () => {
    const districtRows = includeDistricts
      ? scopedDistricts
          .map(
            (district) => `
              <tr>
                <td>${escapeHtml(district.name)}</td>
                <td>${escapeHtml(district.province)}</td>
                <td class="number">${district.beneficiaryHouseholds.toLocaleString()}</td>
                <td class="number">${district.riceYieldMTPerHa.toFixed(1)}</td>
                <td class="number">${district.cassavaYieldMTPerHa.toFixed(1)}</td>
                <td class="number">${district.meCompletionRate}%</td>
              </tr>`
          )
          .join('')
      : '';

    const indicatorRows = includeLogframe
      ? scopedIndicators
          .map(
            (indicator) => `
              <tr>
                <td>${escapeHtml(indicator.code)}</td>
                <td>${escapeHtml(indicator.indicator)}</td>
                <td>${escapeHtml(indicator.valueChain)}</td>
                <td class="number">${escapeHtml(indicator.currentActual)} ${escapeHtml(indicator.unit)}</td>
                <td class="number">${escapeHtml(indicator.finalTarget)} ${escapeHtml(indicator.unit)}</td>
                <td class="number">${indicator.achievedPct.toFixed(1)}%</td>
              </tr>`
          )
          .join('')
      : '';

    const datasetRows = includeDatasetRegister
      ? datasets
          .map(
            (dataset) => `
              <tr>
                <td>${escapeHtml(dataset.name)}</td>
                <td>${escapeHtml(dataset.valueChain)}</td>
                <td class="number">${dataset.rowCount.toLocaleString()}</td>
                <td>${escapeHtml(dataset.uploadedAt)}</td>
                <td>Demonstration</td>
              </tr>`
          )
          .join('')
      : '';

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(reportTitle)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #172033; font: 12px Arial, sans-serif; }
    header { border-bottom: 3px solid #16845b; padding-bottom: 14px; }
    h1 { margin: 0; font-size: 22px; }
    h2 { margin: 24px 0 8px; color: #126447; font-size: 15px; }
    .subtitle { margin-top: 6px; color: #526176; }
    .warning { margin: 16px 0; border: 1px solid #d69b2d; background: #fff8e5; padding: 10px; font-weight: bold; color: #815b11; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 16px 0; }
    .meta div { border: 1px solid #d9e0e8; padding: 8px; }
    .label { color: #667085; display: block; font-size: 10px; margin-bottom: 3px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #d9e0e8; padding: 6px; text-align: left; vertical-align: top; }
    th { background: #eef7f3; color: #126447; font-size: 10px; text-transform: uppercase; }
    .number { text-align: right; white-space: nowrap; }
    footer { margin-top: 24px; border-top: 1px solid #d9e0e8; padding-top: 8px; color: #667085; font-size: 10px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(reportTitle)}</h1>
    <div class="subtitle">Sierra Leone Agriculture Value Chain Development Project (AVDP)</div>
  </header>
  <div class="warning">DEMONSTRATION DATA — Fictitious prototype information. Not approved for official reporting.</div>
  <section class="meta">
    <div><span class="label">Report type</span>${escapeHtml(REPORT_TYPES.find((type) => type.id === reportType)?.label)}</div>
    <div><span class="label">Reporting period</span>${escapeHtml(reportingPeriod)}</div>
    <div><span class="label">Dashboard scope</span>${escapeHtml(scopeLabel)}</div>
    <div><span class="label">Generated</span>${escapeHtml(new Date().toLocaleString())}</div>
  </section>
  <h2>Executive context</h2>
  <p>This report reflects the active dashboard filters. It contains ${canvasState.widgets.length} configured infographic widgets, ${datasets.length} datasets in scope, ${scopedDistricts.length} applicable districts and ${scopedIndicators.length} logframe indicators.</p>
  ${
    includeDistricts
      ? `<h2>District performance summary</h2>
         <table><thead><tr><th>District</th><th>Province</th><th>Beneficiary households</th><th>Rice yield MT/ha</th><th>Cassava yield MT/ha</th><th>M&E completion</th></tr></thead><tbody>${districtRows}</tbody></table>`
      : ''
  }
  ${
    includeLogframe
      ? `<h2>M&E logframe summary</h2>
         <table><thead><tr><th>Code</th><th>Indicator</th><th>Value chain</th><th>Demo actual</th><th>Final target</th><th>Achievement</th></tr></thead><tbody>${indicatorRows}</tbody></table>`
      : ''
  }
  ${
    includeDatasetRegister
      ? `<h2>Dataset register</h2>
         <table><thead><tr><th>Dataset</th><th>Value chain</th><th>Rows</th><th>Snapshot date</th><th>Status</th></tr></thead><tbody>${datasetRows}</tbody></table>`
      : ''
  }
  <footer>Source: AVDP demonstration datasets • Reporting period: ${escapeHtml(reportingPeriod)} • Status: Demonstration</footer>
  <script>window.addEventListener('load', () => window.print());<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
      >
        <header className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 id="report-dialog-title" className="flex items-center gap-2 text-base font-bold text-white">
              <FileText className="h-5 w-5 text-emerald-400" />
              Generate AVDP Demonstration Report
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Filter-aware management outputs with explicit scope and provenance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report generator"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200">
            <strong>Demonstration output:</strong> all exported figures are fictitious and not approved for official AVDP reporting.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-semibold text-slate-300">
              Report type
              <select
                value={reportType}
                onChange={(event) => setReportType(event.target.value as ReportType)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-300">
              Reporting period
              <select
                value={reportingPeriod}
                disabled
                className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300"
              >
                <option>{reportingPeriod}</option>
              </select>
              <span className="mt-1 block text-[10px] font-normal text-slate-500">
                Controlled by the global dashboard filter.
              </span>
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-300">
            Report title
            <input
              value={reportTitle}
              onChange={(event) => setReportTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
          </label>

          <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Calendar className="h-4 w-4 text-sky-400" />
              Active report scope
            </div>
            <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
              <div><dt className="text-slate-500">Geography</dt><dd className="mt-1 font-semibold text-slate-200">{selectedDistrict || 'All applicable districts'}</dd></div>
              <div><dt className="text-slate-500">Value chain</dt><dd className="mt-1 font-semibold text-slate-200">{selectedValueChain}</dd></div>
              <div><dt className="text-slate-500">Datasets</dt><dd className="mt-1 font-semibold text-slate-200">{datasets.length} in scope</dd></div>
            </dl>
          </section>

          <fieldset>
            <legend className="text-xs font-semibold text-slate-300">Report sections</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {[
                ['District summary', includeDistricts, setIncludeDistricts],
                ['M&E logframe', includeLogframe, setIncludeLogframe],
                ['Dataset register', includeDatasetRegister, setIncludeDatasetRegister],
              ].map(([label, checked, setter]) => (
                <label key={String(label)} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={(event) =>
                      (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)
                    }
                    className="accent-emerald-500"
                  />
                  {String(label)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={handlePrintReport} className="rounded-xl border border-emerald-800 bg-emerald-950/50 p-4 text-left transition-colors hover:bg-emerald-950">
              <Printer className="h-5 w-5 text-emerald-400" />
              <div className="mt-2 text-xs font-bold text-white">Print-ready report</div>
              <div className="mt-1 text-[10px] text-slate-400">Structured A4 HTML for printing or PDF</div>
            </button>
            <button type="button" onClick={handleExportCsv} className="rounded-xl border border-amber-800 bg-amber-950/40 p-4 text-left transition-colors hover:bg-amber-950">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
              <div className="mt-2 text-xs font-bold text-white">District CSV</div>
              <div className="mt-1 text-[10px] text-slate-400">Filtered analytical district extract</div>
            </button>
            <button type="button" onClick={handleExportJson} className="rounded-xl border border-sky-800 bg-sky-950/40 p-4 text-left transition-colors hover:bg-sky-950">
              <Package className="h-5 w-5 text-sky-400" />
              <div className="mt-2 text-xs font-bold text-white">Report data package</div>
              <div className="mt-1 text-[10px] text-slate-400">Structured JSON with provenance</div>
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-[11px] leading-5 text-slate-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            Exports include the reporting period, active filters, generation time, data status and demonstration disclaimer.
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
            Close
          </button>
          <button type="button" onClick={handlePrintReport} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400">
            <Download className="h-4 w-4" />
            Generate report
          </button>
        </footer>
      </div>
    </div>
  );
};
