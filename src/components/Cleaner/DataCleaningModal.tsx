import React, { useState, useMemo } from 'react';
import { Dataset } from '../../types';
import {
  DataCleaningService,
  ValidationReport,
  CellError,
} from '../../services/dataCleaningService';
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  RotateCcw,
  Edit2,
  Check,
  X,
  Search,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface DataCleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset;
  onSaveCleanedDataset: (updatedDataset: Dataset) => void;
}

export const DataCleaningModal: React.FC<DataCleaningModalProps> = ({
  isOpen,
  onClose,
  dataset,
  onSaveCleanedDataset,
}) => {
  // Local state for active rows
  const [rows, setRows] = useState<Record<string, any>[]>(() =>
    dataset.rows.map((r) => ({ ...r }))
  );
  const [originalRows] = useState<Record<string, any>[]>(() =>
    (dataset.rawRows || dataset.rows).map((r) => ({ ...r }))
  );
  const [approvedChanges, setApprovedChanges] = useState<string[]>([]);

  // UI state
  const [filterMode, setFilterMode] = useState<'all' | 'issues_only' | 'missing_only' | 'outliers_only'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Column action dropdown
  const [activeColMenu, setActiveColMenu] = useState<string | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live validation report
  const report: ValidationReport = useMemo(() => {
    return DataCleaningService.validateDataset(rows, dataset.columns);
  }, [rows, dataset.columns]);

  // Map of cell errors for fast O(1) lookup
  const errorCellMap = useMemo(() => {
    const map = new Map<string, CellError>();
    report.cellErrors.forEach((err) => {
      map.set(`${err.rowIndex}_${err.column}`, err);
    });
    return map;
  }, [report.cellErrors]);

  if (!isOpen) return null;

  // Filtered rows
  const filteredRowsWithIndices = useMemo(() => {
    return rows
      .map((row, originalIndex) => ({ row, originalIndex }))
      .filter(({ row, originalIndex }) => {
        // Filter by issue mode
        if (filterMode === 'issues_only') {
          const hasIssue = dataset.columns.some((col) =>
            errorCellMap.has(`${originalIndex}_${col}`)
          );
          if (!hasIssue) return false;
        } else if (filterMode === 'missing_only') {
          const hasMissing = dataset.columns.some((col) => {
            const err = errorCellMap.get(`${originalIndex}_${col}`);
            return err && err.errorType === 'missing';
          });
          if (!hasMissing) return false;
        } else if (filterMode === 'outliers_only') {
          const hasOutlier = dataset.columns.some((col) => {
            const err = errorCellMap.get(`${originalIndex}_${col}`);
            return err && err.errorType === 'outlier';
          });
          if (!hasOutlier) return false;
        }

        // Filter by search query
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          return dataset.columns.some((col) =>
            String(row[col] ?? '').toLowerCase().includes(query)
          );
        }

        return true;
      });
  }, [rows, dataset.columns, filterMode, searchTerm, errorCellMap]);

  const totalPages = Math.ceil(filteredRowsWithIndices.length / pageSize) || 1;
  const paginatedRows = filteredRowsWithIndices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Automated Suggestion: Standardize Districts
  const handleStandardizeDistricts = (column?: string) => {
    const targetCols = column ? [column] : dataset.columns;
    let totalFixed = 0;
    const nextRows = rows.map((r) => ({ ...r }));

    targetCols.forEach((col) => {
      const summary = report.columnSummaries[col];
      if (summary?.detectedType === 'district') {
        nextRows.forEach((row) => {
          const val = row[col];
          if (typeof val === 'string') {
            const matched = DataCleaningService.matchDistrictName(val);
            if (matched && matched !== val) {
              row[col] = matched;
              totalFixed++;
            }
          }
        });
      }
    });

    setRows(nextRows);
    if (totalFixed > 0) {
      setApprovedChanges((items) => [...items, `Standardized ${totalFixed} district value(s)`]);
    }
    showToast(`Standardized ${totalFixed} Sierra Leone district name entries.`);
  };

  // Manual Cell Edit
  const startEditing = (rowIndex: number, col: string, val: any) => {
    setEditingCell({ rowIndex, col });
    setEditValue(val !== undefined && val !== null ? String(val) : '');
  };

  const saveEditing = () => {
    if (!editingCell) return;
    const { rowIndex, col } = editingCell;
    const summary = report.columnSummaries[col];

    let finalVal: any = editValue.trim();
    if (summary?.detectedType === 'numeric') {
      const parsed = DataCleaningService.parseMessyNumber(editValue);
      if (parsed !== null) finalVal = parsed;
    }

    const updated = DataCleaningService.updateCell(rows, rowIndex, col, finalVal);
    setRows(updated);
    setApprovedChanges((items) => [...items, `Manually edited row ${rowIndex + 1}, ${col}`]);
    setEditingCell(null);
  };

  const cancelEditing = () => {
    setEditingCell(null);
  };

  // Accept a suggested cell value directly
  const handleAcceptSuggestion = (err: CellError) => {
    if (err.suggestedValue === undefined) return;
    const updated = DataCleaningService.updateCell(
      rows,
      err.rowIndex,
      err.column,
      err.suggestedValue
    );
    setRows(updated);
    setApprovedChanges((items) => [...items, `Accepted suggested value for row ${err.rowIndex + 1}, ${err.column}`]);
    showToast(`Applied suggestion "${err.suggestedValue}" to row #${err.rowIndex + 1}`);
  };

  // Reset to original imported data
  const handleResetToRaw = () => {
    setRows(originalRows.map((r) => ({ ...r })));
    setApprovedChanges([]);
    showToast('Reverted all changes back to raw CSV data.');
  };

  // Download cleaned CSV
  const handleDownloadCleanedCSV = () => {
    const header = dataset.columns.join(',') + '\n';
    const body = rows
      .map((row) =>
        dataset.columns
          .map((col) => {
            const val = row[col] ?? '';
            return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_cleaned.csv`;
    a.click();
    showToast('Cleaned dataset exported to CSV.');
  };

  const handleDownloadValidationReport = () => {
    const header = 'Row,Column,Issue,Severity,Current_Value,Suggested_Value,Message\n';
    const body = report.cellErrors.map((error) =>
      [
        error.rowIndex + 1,
        error.column,
        error.errorType,
        error.severity,
        rows[error.rowIndex]?.[error.column] ?? '',
        error.suggestedValue ?? '',
        error.message,
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_validation_report.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Validation report downloaded. No source values were changed.');
  };

  // Finalize & Save back to workspace
  const handleSaveWorkspace = () => {
    if (approvedChanges.length > 0 && !window.confirm(
      `Approve ${approvedChanges.length} documented change(s) and use the reviewed copy in the dashboard? The original upload will remain recoverable.`
    )) return;
    // Re-detect numeric and categorical columns
    const numericCols = dataset.columns.filter((c) => {
      const numCount = rows.filter((r) => {
        const v = DataCleaningService.parseMessyNumber(r[c]);
        return v !== null;
      }).length;
      return numCount >= Math.max(2, rows.length * 0.6);
    });

    const categoricalCols = dataset.columns.filter((c) => !numericCols.includes(c));

    const updatedDataset: Dataset = {
      ...dataset,
      rows,
      rowCount: rows.length,
      numericColumns: numericCols,
      categoricalColumns: categoricalCols,
      rawRows: dataset.rawRows || originalRows,
      validationAudit: {
        validatedAt: new Date().toISOString(),
        approvedChanges,
        remainingIssues: report.cellErrors.length,
      },
    };

    onSaveCleanedDataset(updatedDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Assisted Data Validation
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {dataset.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review flagged values, approve individual corrections, and retain the original upload
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

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 px-6 py-2 text-xs font-semibold text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Health Score & Automated Recommendations Banner */}
        <div className="px-6 py-3.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Health Score Metric */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base border ${
                  report.healthScore >= 85
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : report.healthScore >= 70
                    ? 'bg-amber-950 text-amber-400 border-amber-700'
                    : 'bg-rose-950 text-rose-400 border-rose-700'
                }`}
              >
                {report.healthScore}%
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Data Quality Health
                </span>
                <span className="text-[11px] text-slate-400">
                  {report.healthScore >= 85
                    ? 'Ready for visualization & mapping'
                    : report.healthScore >= 70
                    ? 'Moderate issues detected'
                    : 'Critical errors require attention'}
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                {report.totalRows.toLocaleString()} Rows
              </span>
              {report.missingCount > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {report.missingCount} Missing
                </span>
              )}
              {report.formatIssueCount > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {report.formatIssueCount} Format / District
                </span>
              )}
              {report.outlierCount > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {report.outlierCount} Outliers
                </span>
              )}
              {report.cellErrors.length === 0 && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  No Anomalies Detected
                </span>
              )}
            </div>
          </div>

          <div className="max-w-sm text-right text-[11px] leading-relaxed text-slate-400">
            Validation never imputes missing values, caps outliers, or removes records automatically.
          </div>
        </div>

        {/* Automated Suggestions Bar */}
        {(report.missingCount > 0 || report.formatIssueCount > 0 || report.outlierCount > 0) && (
          <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800/80 flex items-center gap-3 overflow-x-auto text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 whitespace-nowrap text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Suggested review actions:
            </span>

            {report.formatIssueCount > 0 && (
              <button
                onClick={() => handleStandardizeDistricts()}
                className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-700/60 text-amber-300 hover:bg-amber-900/60 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Standardize 16 District Names</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </button>
            )}

            {report.missingCount > 0 && <span className="text-rose-300">Review missing values individually</span>}
            {report.outlierCount > 0 && <span className="text-purple-300">Verify outliers against source documents</span>}
          </div>
        )}

        {/* Table Controls (Filters & Search) */}
        <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> View:
            </span>
            <button
              onClick={() => {
                setFilterMode('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({rows.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('issues_only');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                filterMode === 'issues_only'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>Rows with Issues</span>
              <span className="text-[10px] opacity-80">
                ({report.cellErrors.length})
              </span>
            </button>
            {report.missingCount > 0 && (
              <button
                onClick={() => {
                  setFilterMode('missing_only');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterMode === 'missing_only'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                }`}
              >
                Missing ({report.missingCount})
              </button>
            )}
            {report.outlierCount > 0 && (
              <button
                onClick={() => {
                  setFilterMode('outliers_only');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterMode === 'outliers_only'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-purple-300'
                }`}
              >
                Outliers ({report.outlierCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>

            <span className="text-[11px] text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {/* Data Grid with Color Coded Diagnostics */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4">
          <div className="rounded-xl border border-slate-800 overflow-hidden shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 sticky top-0 z-20 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-3 py-2.5 text-[11px] font-bold uppercase w-12 text-slate-500">
                    #
                  </th>
                  {dataset.columns.map((col) => {
                    const summary = report.columnSummaries[col];
                    const colHasErrors =
                      (summary?.missingCount || 0) +
                        (summary?.formatIssueCount || 0) +
                        (summary?.outlierCount || 0) >
                      0;

                    return (
                      <th
                        key={col}
                        className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap relative group"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-slate-300 flex items-center gap-1">
                            {summary?.detectedType === 'numeric' && (
                              <span className="text-emerald-400 font-mono">#</span>
                            )}
                            {summary?.detectedType === 'district' && (
                              <span className="text-amber-400">📍</span>
                            )}
                            {summary?.detectedType === 'text' && (
                              <span className="text-cyan-400 font-mono">abc</span>
                            )}
                            {col}
                          </span>

                          <div className="flex items-center gap-1">
                            {colHasErrors && (
                              <span
                                title={`${summary?.missingCount || 0} missing, ${summary?.outlierCount || 0} outliers`}
                                className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                              />
                            )}
                            <button
                              onClick={() =>
                                setActiveColMenu(activeColMenu === col ? null : col)
                              }
                              className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Column Quick Actions Dropdown */}
                        {activeColMenu === col && (
                          <div className="absolute left-0 top-full mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 text-xs font-normal normal-case text-slate-300 animate-in fade-in">
                            <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                              Column Operations
                            </div>

                            {summary?.detectedType === 'numeric' && (
                              <p className="px-2 py-1.5 text-[10px] leading-relaxed text-slate-500">
                                Missing numeric values must be verified and edited individually; no values are imputed automatically.
                              </p>
                            )}

                            {summary?.detectedType === 'district' && (
                              <button
                                onClick={() => {
                                  handleStandardizeDistricts(col);
                                  setActiveColMenu(null);
                                }}
                                className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded text-amber-300"
                              >
                                Standardize District Names
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const nextRows = rows.map((r) => {
                                  const val = r[col];
                                  if (typeof val === 'string') {
                                    return { ...r, [col]: val.trim() };
                                  }
                                  return r;
                                });
                                setRows(nextRows);
                                setApprovedChanges((items) => [...items, `Trimmed whitespace in ${col}`]);
                                setActiveColMenu(null);
                                showToast(`Trimmed whitespace in "${col}"`);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded"
                            >
                              Trim whitespace
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={dataset.columns.length + 1}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No records match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map(({ row, originalIndex }) => (
                    <tr
                      key={originalIndex}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-3 py-2 text-[11px] font-mono text-slate-600 select-none">
                        {originalIndex + 1}
                      </td>

                      {dataset.columns.map((col) => {
                        const cellKey = `${originalIndex}_${col}`;
                        const error = errorCellMap.get(cellKey);
                        const isEditing =
                          editingCell?.rowIndex === originalIndex &&
                          editingCell?.col === col;

                        // Visual styling based on error severity
                        let cellBg = '';
                        let cellBorder = 'border-transparent';
                        if (error) {
                          if (error.errorType === 'missing') {
                            cellBg = 'bg-rose-950/40';
                            cellBorder = 'border-rose-700/60';
                          } else if (
                            error.errorType === 'district_mismatch' ||
                            error.errorType === 'format_inconsistency'
                          ) {
                            cellBg = 'bg-amber-950/40';
                            cellBorder = 'border-amber-700/60';
                          } else if (error.errorType === 'outlier') {
                            cellBg = 'bg-purple-950/40';
                            cellBorder = 'border-purple-700/60';
                          }
                        }

                        const cellVal = row[col];
                        const isNull = DataCleaningService.isMissing(cellVal);

                        return (
                          <td
                            key={col}
                            className={`px-3 py-1.5 whitespace-nowrap border ${cellBorder} ${cellBg} relative group/cell`}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing();
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                  className="px-2 py-0.5 bg-slate-800 border border-emerald-500 rounded text-xs text-white focus:outline-none w-28"
                                />
                                <button
                                  onClick={saveEditing}
                                  className="p-1 text-emerald-400 hover:text-white"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 min-w-[80px]">
                                <span
                                  onClick={() =>
                                    startEditing(originalIndex, col, cellVal)
                                  }
                                  className={`cursor-pointer font-medium ${
                                    isNull
                                      ? 'text-rose-400 italic text-[11px]'
                                      : 'text-slate-200'
                                  }`}
                                >
                                  {isNull ? 'null / empty' : String(cellVal)}
                                </span>

                                <div className="flex items-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                  {/* Quick suggestion apply */}
                                  {error?.suggestedValue !== undefined && (
                                    <button
                                      onClick={() => handleAcceptSuggestion(error)}
                                      title={`Quick fix: Replace with "${error.suggestedValue}"`}
                                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                                    >
                                      Fix → {String(error.suggestedValue)}
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      startEditing(originalIndex, col, cellVal)
                                    }
                                    title="Edit cell"
                                    className="p-1 text-slate-500 hover:text-white"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Error tooltip banner */}
                            {error && !isEditing && (
                              <div className="hidden group-hover/cell:block absolute left-0 bottom-full mb-1 z-30 w-56 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-2xl text-[11px] pointer-events-none">
                                <div className="flex items-center gap-1 font-bold mb-0.5">
                                  {error.severity === 'error' ? (
                                    <AlertCircle className="w-3 h-3 text-rose-400" />
                                  ) : (
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  )}
                                  <span
                                    className={
                                      error.severity === 'error'
                                        ? 'text-rose-400'
                                        : 'text-amber-400'
                                    }
                                  >
                                    {error.errorType === 'missing'
                                      ? 'Missing Value'
                                      : error.errorType === 'outlier'
                                      ? 'Statistical Outlier'
                                      : 'Formatting Inconsistency'}
                                  </span>
                                </div>
                                <p className="text-slate-300 leading-snug">
                                  {error.message}
                                </p>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToRaw}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Raw CSV</span>
            </button>

            <button
              onClick={handleDownloadCleanedCSV}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download reviewed copy</span>
            </button>
            <button
              onClick={handleDownloadValidationReport}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Validation report</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkspace}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve reviewed copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
