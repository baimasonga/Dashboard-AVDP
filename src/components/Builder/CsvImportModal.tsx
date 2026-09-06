import React, { useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { Dataset, ValueChainType } from '../../types';
import { storageService } from '../../services/storageService';
import {
  DataCleaningService,
  ValidationReport,
} from '../../services/dataCleaningService';
import { DataCleaningModal } from '../Cleaner/DataCleaningModal';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  FileText,
  Database,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetImported: (dataset: Dataset) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onDatasetImported,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [datasetDesc, setDatasetDesc] = useState('');
  const [selectedChain, setSelectedChain] = useState<ValueChainType>('All Value Chains');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [parsedCols, setParsedCols] = useState<string[]>([]);
  const [numericCols, setNumericCols] = useState<string[]>([]);
  const [categoricalCols, setCategoricalCols] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute live validation report on the parsed rows
  const validationReport: ValidationReport | null = useMemo(() => {
    if (parsedRows.length === 0 || parsedCols.length === 0) return null;
    return DataCleaningService.validateDataset(parsedRows, parsedCols);
  }, [parsedRows, parsedCols]);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setError(null);
    setIsProcessing(true);
    setFileName(file.name);
    setDatasetName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);
        if (results.errors.length > 0 && results.data.length === 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as Record<string, any>[];
        if (data.length === 0) {
          setError('The imported CSV file contains no data rows.');
          return;
        }

        const columns = Object.keys(data[0]);
        const numCols: string[] = [];
        const catCols: string[] = [];

        columns.forEach((col) => {
          let hasNumber = false;
          for (let i = 0; i < Math.min(data.length, 20); i++) {
            const val = data[i][col];
            if (typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))) {
              hasNumber = true;
              break;
            }
          }
          if (hasNumber) numCols.push(col);
          else catCols.push(col);
        });

        setParsedRows(data);
        setParsedCols(columns);
        setNumericCols(numCols);
        setCategoricalCols(catCols);
      },
      error: (err) => {
        setIsProcessing(false);
        setError(`Failed to read CSV: ${err.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        handleFileProcess(file);
      } else {
        setError('Please upload a valid .csv file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0 || !datasetName) {
      setError('Please provide a dataset name and valid CSV data.');
      return;
    }

    const newDataset: Dataset = {
      id: 'custom_ds_' + Date.now(),
      name: datasetName,
      description: datasetDesc || 'Custom agricultural dataset imported by user',
      valueChain: selectedChain,
      columns: parsedCols,
      numericColumns: numericCols,
      categoricalColumns: categoricalCols,
      rows: parsedRows,
      rawRows: parsedRows.map((row) => ({ ...row })),
      rowCount: parsedRows.length,
      uploadedAt: new Date().toISOString().split('T')[0],
      isCustom: true,
    };

    storageService.addCustomDataset(newDataset);
    onDatasetImported(newDataset);
    onClose();
  };

  const loadSampleCSV = (type: 'rice' | 'cassava' | 'mechanization' | 'unclean_survey') => {
    let sampleCSV = '';
    if (type === 'rice') {
      sampleCSV = `District,IVS_Yield_MT_Ha,Upland_Yield_MT_Ha,Certified_Seed_MT,FBO_Membership,Fertilizer_Bags,Post_Harvest_Loss_Pct
Bo,4.1,2.1,380,1850,2400,12
Kenema,3.9,1.9,340,1620,2100,14
Kailahun,3.8,2.0,320,1540,1950,15
Port Loko,3.6,1.8,290,1410,1800,16
Tonkolili,3.7,1.9,310,1490,1900,13
Kambia,4.2,2.2,410,1920,2600,11
Moyamba,3.5,1.7,280,1350,1750,17
Bombali,3.4,1.8,260,1280,1600,18`;
    } else if (type === 'cassava') {
      sampleCSV = `Agro_Hub,District,Tuber_Intake_MT,HQCF_Flour_MT,Gari_Output_MT,Operating_Efficiency_Pct,Farmers_Contracted
Port Loko Central,Port Loko,14500,3200,2900,89,1950
Moyamba Agro-Park,Moyamba,12900,2850,2450,85,1720
Bo Roots Factory,Bo,13800,3100,2700,92,1840
Tonkolili Modern Mill,Tonkolili,11200,2450,2150,78,1450
Kambia Border Hub,Kambia,9900,2200,1980,82,1310`;
    } else if (type === 'mechanization') {
      sampleCSV = `District,Tractors_Distributed,Power_Tillers,Multi_Threshers,Solar_Dryers,Processing_Mills,Hectares_Serviced
Bo,12,38,18,24,14,3400
Kenema,10,42,16,32,19,3850
Kailahun,8,34,14,40,16,3100
Port Loko,15,45,22,18,15,4200
Tonkolili,11,36,15,16,11,3250
Kambia,14,40,19,20,12,3900`;
    } else {
      // Unclean raw field survey with missing values, district typos, and outliers
      sampleCSV = `District,Farmer_Group,Yield_MT_Ha,Fertilizer_Supplied_Kg,Loan_Repayment_Pct
bo dist,Kakua Farmers,3.9,"1,200",92
Kenema,Nongowa Co-op,,850,88
Pujehum,Wangechi Union,3.4,"1,100",76
Karene,Sanda Loko,2.8,700,
w-rural,Mountain Hub,4.2,"1,400",95
portloko,Marampa Rice,48.5,"1,350",89
Tonkolili,Yoni Group,3.6,,81
Kambia District,Gbalamuya,4.0,"1,250",94`;
    }

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const file = new File([blob], `avcdp_${type}_field_data.csv`, { type: 'text/csv' });
    handleFileProcess(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import CSV Dataset for Custom Visualization</h3>
              <p className="text-xs text-slate-400">
                Upload custom Sierra Leone agricultural survey, M&E, or production data
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Sample Presets */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Need test data? Load AVDP field survey template:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => loadSampleCSV('rice')}
                className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Rice Survey
              </button>
              <button
                onClick={() => loadSampleCSV('cassava')}
                className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Cassava Mills
              </button>
              <button
                onClick={() => loadSampleCSV('mechanization')}
                className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Agro-Machinery
              </button>
              <button
                onClick={() => loadSampleCSV('unclean_survey')}
                className="px-2.5 py-1 text-xs bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-md transition-colors flex items-center gap-1 font-semibold"
                title="Loads survey containing typos, missing values, and outliers to test cleaning tools"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Test Survey (With Errors)</span>
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragOver
                ? 'border-emerald-400 bg-emerald-950/20'
                : fileName
                ? 'border-emerald-700/80 bg-slate-800/30'
                : 'border-slate-700 hover:border-slate-600 bg-slate-850/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              {fileName ? fileName : 'Drag & drop your CSV file here, or browse'}
            </p>
            <p className="text-xs text-slate-400">
              Supports standard comma-separated and semicolon-delimited CSV formats
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Metadata Configuration */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g. Bo & Kenema IVS Rice Yields 2024"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Value Chain Domain
                  </label>
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value as ValueChainType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All Value Chains">All Value Chains / Multi-Sectoral</option>
                    <option value="Rice (IVS & Bolilands)">Rice (IVS &amp; Bolilands)</option>
                    <option value="Cassava & HQCF">Cassava &amp; HQCF</option>
                    <option value="Cocoa & Coffee">Cocoa &amp; Coffee</option>
                    <option value="Oil Palm & CPO">Oil Palm &amp; CPO</option>
                    <option value="Horticulture & Vegetables">Horticulture &amp; Vegetables</option>
                    <option value="Poultry & Livestock">Poultry &amp; Livestock</option>
                    <option value="Inland Aquaculture">Inland Aquaculture</option>
                  </select>
                </div>
              </div>

              {/* Data Quality & Cleaning Module Banner */}
              {validationReport && (
                <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                          validationReport.healthScore >= 85
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                            : validationReport.healthScore >= 70
                            ? 'bg-amber-950 text-amber-400 border-amber-700'
                            : 'bg-rose-950 text-rose-400 border-rose-700'
                        }`}
                      >
                        {validationReport.healthScore}%
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Data Health Index</span>
                          {validationReport.cellErrors.length === 0 ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700">
                              No issues detected
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-700">
                              {validationReport.cellErrors.length} Issue{validationReport.cellErrors.length > 1 ? 's' : ''} Detected
                            </span>
                          )}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {validationReport.healthScore >= 85
                            ? 'No validation issues were detected in this preview.'
                            : 'Review the flagged values before approving this dataset.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCleaningModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                        <span>Review validation issues</span>
                      </button>
                    </div>
                  </div>

                  {/* Badges Breakdown */}
                  <div className="flex items-center gap-2 text-[11px] flex-wrap pt-1 border-t border-slate-800/80">
                    {validationReport.missingCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-medium">
                        {validationReport.missingCount} Missing cell values
                      </span>
                    )}
                    {validationReport.formatIssueCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-medium">
                        {validationReport.formatIssueCount} Format / District mismatches
                      </span>
                    )}
                    {validationReport.outlierCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-medium">
                        {validationReport.outlierCount} Statistical outliers (IQR &gt; 1.5x)
                      </span>
                    )}
                    {validationReport.cellErrors.length === 0 && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        ✓ All 16 Sierra Leone district names, numerics, and bounds validated.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Data Schema Summary */}
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Schema Detected:</span>
                  <span className="text-emerald-400 font-bold">
                    {parsedRows.length.toLocaleString()} rows • {parsedCols.length} columns
                  </span>
                </div>
                <div className="text-xs flex flex-wrap gap-1.5">
                  <span className="text-slate-400 text-[11px]">Numeric Metrics:</span>
                  {numericCols.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-semibold border border-emerald-800/60"
                    >
                      # {c}
                    </span>
                  ))}
                  <span className="text-slate-400 text-[11px] ml-2">Categories:</span>
                  {categoricalCols.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-semibold"
                    >
                      abc {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Preview (First 4 rows):
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/90 text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-700">
                      <tr>
                        {parsedCols.map((col) => (
                          <th key={col} className="px-3 py-2 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {parsedRows.slice(0, 4).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {parsedCols.map((col) => (
                            <td key={col} className="px-3 py-1.5 whitespace-nowrap text-slate-200">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              parsedRows.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Import Dataset to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Data Cleaning Studio Modal */}
      {isCleaningModalOpen && (
        <DataCleaningModal
          isOpen={isCleaningModalOpen}
          onClose={() => setIsCleaningModalOpen(false)}
          dataset={{
            id: 'temp_import_preview',
            name: datasetName || 'Imported CSV',
            columns: parsedCols,
            numericColumns: numericCols,
            categoricalColumns: categoricalCols,
            rows: parsedRows,
            rowCount: parsedRows.length,
            valueChain: selectedChain,
            uploadedAt: new Date().toISOString().split('T')[0],
            isCustom: true,
          }}
          onSaveCleanedDataset={(cleaned) => {
            setParsedRows(cleaned.rows);
            setParsedCols(cleaned.columns);
            setNumericCols(cleaned.numericColumns);
            setCategoricalCols(cleaned.categoricalColumns);
            setIsCleaningModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
