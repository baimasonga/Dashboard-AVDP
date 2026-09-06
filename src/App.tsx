import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CanvasState,
  Dataset,
  DistrictMetric,
  Collaborator,
  SyncQueueItem,
  ValueChainType,
} from './types';
import {
  DEFAULT_DATASETS,
  DEFAULT_CANVAS_CONFIG,
  SIERRA_LEONE_DISTRICTS,
} from './data/sierraLeoneData';
import { storageService } from './services/storageService';
import { collabService } from './services/collabService';
import { VisualCanvas } from './components/Builder/VisualCanvas';
import { SierraLeoneMap } from './components/Map/SierraLeoneMap';
import { ValueChainsView } from './components/ValueChains/ValueChainsView';
import { AgribusinessHubView } from './components/Agribusiness/AgribusinessHubView';
import { InfrastructureView } from './components/Infrastructure/InfrastructureView';
import { GalsView } from './components/GALS/GalsView';
import { GrmView } from './components/GRM/GrmView';
import { ClimateSmartView } from './components/ClimateSmart/ClimateSmartView';
import { MELogframeView } from './components/ME/MELogframeView';
import { FutureYieldOutlook } from './components/Analytics/FutureYieldOutlook';
import { YieldStudiesView } from './components/Analytics/YieldStudiesView';
import { FarmerFieldSchoolsView } from './components/FFS/FarmerFieldSchoolsView';
import { FinancialInformationView } from './components/Finance/FinancialInformationView';
import { ProcurementView } from './components/Procurement/ProcurementView';
import { CsvImportModal } from './components/Builder/CsvImportModal';
import { AiInsightsModal } from './components/AI/AiInsightsModal';
import { ReportingModal } from './components/Export/ReportingModal';
import { CollabDrawer } from './components/Collab/CollabDrawer';
import { TemplatePickerModal } from './components/Templates/TemplatePickerModal';
import { DataCleaningModal } from './components/Cleaner/DataCleaningModal';
import { DashboardFilterBar } from './components/Common/DashboardFilterBar';
import { IndicatorCatalogModal } from './components/Common/IndicatorCatalogModal';
import { DataQualityView } from './components/Quality/DataQualityView';
import {
  RicePaddyIcon,
  CassavaTuberIcon,
  CocoaPodIcon,
  OilPalmIcon,
} from './components/Common/AgriIcons';
import {
  LayoutDashboard,
  MapPin,
  GitCommit,
  Award,
  Upload,
  Sparkles,
  Download,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  ChevronDown,
  FileSpreadsheet,
  LayoutTemplate,
  Wand2,
  Building2,
  Route,
  HeartHandshake,
  ShieldAlert,
  Leaf,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Briefcase,
  Microscope,
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'data_quality'
    | 'map'
    | 'value_chains'
    | 'yield_outlook'
    | 'yield_studies'
    | 'ffs'
    | 'financial'
    | 'procurement'
    | 'agribusiness'
    | 'infrastructure'
    | 'gals'
    | 'grm'
    | 'climate_smart'
    | 'me_logframe'
  >('dashboard');

  // Core app state
  const [canvasState, setCanvasState] = useState<CanvasState>(DEFAULT_CANVAS_CONFIG);
  const [datasets, setDatasets] = useState<Dataset[]>(DEFAULT_DATASETS);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedValueChain, setSelectedValueChain] = useState<ValueChainType>('All Value Chains');

  const filteredDatasets = useMemo(
    () =>
      selectedValueChain === 'All Value Chains'
        ? datasets
        : datasets.filter(
            (dataset) =>
              dataset.valueChain === selectedValueChain ||
              dataset.valueChain === 'All Value Chains'
          ),
    [datasets, selectedValueChain]
  );

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals & Drawers
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isReportingOpen, setIsReportingOpen] = useState<boolean>(false);
  const [isCollabDrawerOpen, setIsCollabDrawerOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isDataCleaningModalOpen, setIsDataCleaningModalOpen] = useState<boolean>(false);
  const [isIndicatorCatalogOpen, setIsIndicatorCatalogOpen] = useState<boolean>(false);
  const [activeCleaningDatasetId, setActiveCleaningDatasetId] = useState<string>('ds_district_matrix');

  // Collaboration State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, { x: number; y: number; name: string; color: string }>
  >({});
  const [activeRemoteWidgetId, setActiveRemoteWidgetId] = useState<string | null>(null);

  // Initialize storage & collaboration
  useEffect(() => {
    // Load cached canvas & datasets
    const cachedCanvas = storageService.getCanvasState();
    if (cachedCanvas) {
      setCanvasState(cachedCanvas);
    }
    const allDatasets = storageService.getAllDatasets();
    setDatasets(allDatasets);

    setIsSimulatedOffline(storageService.isSimulatedOffline());
    setIsOnline(storageService.isOnline());
    setPendingSyncCount(storageService.getPendingSyncQueue().length);

    // Subscribe to storage sync notifications
    const unsubscribeStorage = storageService.subscribe((event) => {
      if (event.type === 'sync_status_changed') {
        setIsOnline(event.data.online);
        setIsSimulatedOffline(event.data.isSimulated);
        setPendingSyncCount(event.data.pendingCount);
      } else if (event.type === 'sync_completed') {
        setSyncToast(
          `Sync successful: ${event.data.syncedCount} offline field changes merged with cloud.`
        );
        setTimeout(() => setSyncToast(null), 4000);
      } else if (event.type === 'dataset_added') {
        setDatasets(storageService.getAllDatasets());
        setSyncToast(`Dataset "${event.data.name}" added to workspace.`);
        setTimeout(() => setSyncToast(null), 3000);
      }
    });

    // Connect real-time collaboration
    collabService.connect();
    const unsubscribeCollab = collabService.subscribe((event) => {
      if (event.type === 'collaborators_changed') {
        setCollaborators(event.data);
      } else if (event.type === 'remote_canvas_updated') {
        if (event.data?.canvas) {
          setCanvasState(event.data.canvas);
          storageService.saveCanvasState(event.data.canvas);
        }
        if (event.data?.widgetId) {
          setActiveRemoteWidgetId(event.data.widgetId);
          setTimeout(() => setActiveRemoteWidgetId(null), 3000);
        }
      } else if (event.type === 'cursor_moved') {
        setRemoteCursors((prev) => ({
          ...prev,
          [event.data.userId]: {
            x: event.data.cursor.x,
            y: event.data.cursor.y,
            name: event.data.name,
            color: event.data.color,
          },
        }));
      }
    });

    return () => {
      unsubscribeStorage();
      unsubscribeCollab();
      collabService.disconnect();
    };
  }, []);

  // Broadcast throttled cursor movements to peers
  const lastCursorSend = useRef<number>(0);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastCursorSend.current > 60) {
      lastCursorSend.current = now;
      collabService.sendCursorMove(e.clientX, e.clientY);
    }
  }, []);

  // Update canvas state & broadcast to peers
  const handleCanvasUpdate = (updated: CanvasState) => {
    setCanvasState(updated);
    storageService.saveCanvasState(updated);
    collabService.sendCanvasUpdate(updated);
  };

  // Toggle simulated offline mode
  const handleToggleOfflineMode = () => {
    const next = !isSimulatedOffline;
    storageService.setSimulatedOffline(next);
    setIsSimulatedOffline(next);
    setIsOnline(!next);
    if (next) {
      collabService.disconnect();
      setSyncToast('Offline-First Mode Activated: Local caching enabled.');
    } else {
      collabService.connect();
      setSyncToast('Network Restored: Re-establishing cloud connection...');
      storageService.syncWithCloud();
    }
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Trigger manual cloud sync
  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncToast('Cannot sync while offline. Please reconnect first.');
      setTimeout(() => setSyncToast(null), 3000);
      return;
    }
    setIsSyncing(true);
    await storageService.syncWithCloud();
    setIsSyncing(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans"
    >
      {/* Remote Peer Cursors */}
      {Object.entries(remoteCursors).map(([id, cursorData]) => {
        const cur = cursorData as { x: number; y: number; name: string; color: string };
        return (
          <div
            key={id}
            className="fixed pointer-events-none z-50 transition-all duration-75 ease-out"
            style={{ left: `${cur.x}px`, top: `${cur.y}px` }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={cur.color} stroke="#0f172a" strokeWidth="1.5">
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
            </svg>
            <span
              className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-950 shadow-md whitespace-nowrap"
              style={{ backgroundColor: cur.color }}
            >
              {cur.name.split(' ')[0]}
            </span>
          </div>
        );
      })}

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 border border-emerald-500/80 shadow-2xl rounded-xl px-4 py-3 text-xs text-slate-200 flex items-center gap-3 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{syncToast}</span>
        </div>
      )}

      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <RicePaddyIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white tracking-tight">
                  SIERRA LEONE AVDP
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                  MAFS
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/70">
                  DEMONSTRATION DATA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Agriculture Value Chain Development Infographic &amp; M&amp;E Platform
              </p>
            </div>
          </div>

          {/* Action Bar (Templates, CSV Import, Data Cleaning, AI Insights, Export, Collab, Sync) */}
          <div className="flex items-center gap-2">
            {/* Indicator catalogue and data provenance */}
            <button
              id="btn-indicator-catalog"
              onClick={() => setIsIndicatorCatalogOpen(true)}
              className="px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900 text-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-sky-800/80"
              title="Open indicator definitions, formulas and data source provenance"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Indicators</span>
            </button>

            {/* Infographic Templates */}
            <button
              id="btn-templates"
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-800/80"
              title="Browse Pre-Designed Infographic Templates for Sierra Leone Agriculture"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {/* CSV Import */}
            <button
              id="btn-import-csv"
              onClick={() => setIsCsvModalOpen(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/80"
              title="Import CSV Dataset"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

            {/* Data Validation & Cleaning Studio */}
            <button
              id="btn-data-cleaning"
              onClick={() => {
                setActiveCleaningDatasetId(datasets[0]?.id || 'ds_district_matrix');
                setIsDataCleaningModalOpen(true);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/80"
              title="Data Validation, Quality Audit & Cleaning Studio"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Clean Data</span>
            </button>

            {/* AI Decision Insights */}
            <button
              id="btn-ai-insights"
              onClick={() => setIsAiModalOpen(true)}
              className="px-2.5 py-1.5 bg-purple-950/70 hover:bg-purple-900 text-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-800/80"
              title="Automated Data-Driven Decision Support"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Insights</span>
            </button>

            {/* Export & Reporting */}
            <button
              id="btn-export-report"
              onClick={() => setIsReportingOpen(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/80"
              title="Export Report & Charts"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Report</span>
            </button>

            {/* Collaboration Team Drawer */}
            <button
              id="btn-collab-drawer"
              onClick={() => setIsCollabDrawerOpen(true)}
              className="relative px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/80"
              title="Field Collaboration Team"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">Team</span>
              {collaborators.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                  {collaborators.length}
                </span>
              )}
            </button>

            {/* Network Sync Toggle */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              <button
                id="btn-toggle-offline"
                onClick={handleToggleOfflineMode}
                className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                  isOnline
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                    : 'bg-amber-950/80 border-amber-700 text-amber-400 hover:bg-amber-900/80'
                }`}
                title={
                  isOnline
                    ? 'Online mode: Click to simulate remote field offline mode'
                    : 'Offline mode active: Click to reconnect to cloud'
                }
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-bold hidden sm:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </button>

              {/* Sync queue indicator */}
              {pendingSyncCount > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || isSyncing}
                  className="px-2 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-bold flex items-center gap-1 animate-pulse"
                  title="Offline changes pending sync. Click to push now."
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{pendingSyncCount} Pending</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AVDP Comprehensive Component Navigation Strip */}
        <div className="bg-slate-950/90 border-t border-slate-800/90 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-0.5 text-xs">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Infographics</span>
            </button>
            <button
              id="tab-data-quality"
              onClick={() => setActiveTab('data_quality')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'data_quality'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Data Quality</span>
            </button>
            <button
              id="tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>District GIS Map</span>
            </button>
            <button
              id="tab-value-chains"
              onClick={() => setActiveTab('value_chains')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'value_chains'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Value Chains</span>
            </button>
            <button
              id="tab-yield-outlook"
              onClick={() => setActiveTab('yield_outlook')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'yield_outlook'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Future Yield Outlook</span>
            </button>
            <button
              id="tab-yield-studies"
              onClick={() => setActiveTab('yield_studies')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'yield_studies'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Yield Studies</span>
            </button>
            <button
              id="tab-ffs"
              onClick={() => setActiveTab('ffs')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'ffs'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Farmer Field Schools (FFS)</span>
            </button>
            <button
              id="tab-financial"
              onClick={() => setActiveTab('financial')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'financial'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Financial Information</span>
            </button>
            <button
              id="tab-procurement"
              onClick={() => setActiveTab('procurement')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'procurement'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Procurement</span>
            </button>
            <button
              id="tab-agribusiness"
              onClick={() => setActiveTab('agribusiness')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'agribusiness'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Agribusiness Hub</span>
            </button>
            <button
              id="tab-infrastructure"
              onClick={() => setActiveTab('infrastructure')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'infrastructure'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Feeder Roads &amp; Water Wells</span>
            </button>
            <button
              id="tab-gals"
              onClick={() => setActiveTab('gals')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'gals'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>GALS Household Equity</span>
            </button>
            <button
              id="tab-grm"
              onClick={() => setActiveTab('grm')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'grm'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Grievance Redress (GRM)</span>
            </button>
            <button
              id="tab-climate"
              onClick={() => setActiveTab('climate_smart')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'climate_smart'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Climate-Smart Agric</span>
            </button>
            <button
              id="tab-me"
              onClick={() => setActiveTab('me_logframe')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'me_logframe'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>M&amp;E Logframe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard-wide data provenance notice */}
      <section className="border-b border-amber-800/60 bg-amber-950/35 px-4 py-2" aria-label="Data status">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 text-[11px] text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold">
            Prototype mode: all figures are fictitious and provided for dashboard testing only.
          </span>
          <span className="text-amber-300">
            Source: AVDP demonstration datasets • Status: Illustrative • Not for official reporting
          </span>
        </div>
      </section>

      <DashboardFilterBar
        districts={SIERRA_LEONE_DISTRICTS.map((district) => district.name)}
        selectedDistrict={selectedDistrict}
        selectedValueChain={selectedValueChain}
        visibleDatasetCount={filteredDatasets.length}
        totalDatasetCount={datasets.length}
        onDistrictChange={setSelectedDistrict}
        onValueChainChange={setSelectedValueChain}
        onReset={() => {
          setSelectedDistrict(null);
          setSelectedValueChain('All Value Chains');
        }}
      />

      {/* Offline Mode Banner when offline */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Remote Field Mode Active:</strong> Low-bandwidth / disconnected state.
              All chart modifications and field records are cached locally and will sync once internet restores.
            </span>
          </div>
          <button
            onClick={handleToggleOfflineMode}
            className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-[11px] font-bold hover:bg-amber-400 transition-colors whitespace-nowrap ml-3"
          >
            Simulate Reconnect
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <VisualCanvas
            canvasState={canvasState}
            datasets={filteredDatasets}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            onUpdateCanvas={handleCanvasUpdate}
            activeRemoteWidgetId={activeRemoteWidgetId}
            onOpenTemplates={() => setIsTemplateModalOpen(true)}
            onOpenDataCleaning={() => {
              setActiveCleaningDatasetId(datasets[0]?.id || 'ds_district_matrix');
              setIsDataCleaningModalOpen(true);
            }}
          />
        )}

        {activeTab === 'data_quality' && (
          <DataQualityView datasets={filteredDatasets} />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span>Sierra Leone 16-District Choropleth &amp; Value Chain Density</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive spatial mapping across Northern, North Western, Eastern, Southern, and Western Area provinces
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Total Beneficiary Coverage:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                  124,500 Smallholder Households
                </span>
              </div>
            </div>

            <div className="w-full">
              <SierraLeoneMap
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
                activeMetric="rice_yield"
                height="h-[620px]"
              />
            </div>
          </div>
        )}

        {activeTab === 'value_chains' && <ValueChainsView />}

        {activeTab === 'yield_outlook' && (
          <div className="space-y-6">
            <FutureYieldOutlook
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
            />
          </div>
        )}

        {activeTab === 'yield_studies' && <YieldStudiesView />}

        {activeTab === 'ffs' && <FarmerFieldSchoolsView />}

        {activeTab === 'financial' && <FinancialInformationView />}

        {activeTab === 'procurement' && <ProcurementView />}

        {activeTab === 'agribusiness' && <AgribusinessHubView />}

        {activeTab === 'infrastructure' && <InfrastructureView />}

        {activeTab === 'gals' && <GalsView />}

        {activeTab === 'grm' && <GrmView />}

        {activeTab === 'climate_smart' && <ClimateSmartView />}

        {activeTab === 'me_logframe' && (
          <MELogframeView
            selectedDistrict={selectedDistrict}
            selectedValueChain={selectedValueChain}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Sierra Leone Agriculture Value Chain Development Project (AVDP) • Ministry of Agriculture &amp; Food Security (MAFS)
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Supported by IFAD, OFID, Adaptation Fund &amp; GoSL</span>
            <span>•</span>
            <span className="text-emerald-500">P2P Real-Time Active</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <IndicatorCatalogModal
        isOpen={isIndicatorCatalogOpen}
        onClose={() => setIsIndicatorCatalogOpen(false)}
      />


      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onDatasetImported={(newDs) => {
          setDatasets(storageService.getAllDatasets());
          // Auto create a widget for the new dataset
          const newWidget = {
            id: 'w_imported_' + Date.now(),
            title: newDs.name,
            subtitle: `Analyzed from custom CSV (${newDs.rowCount} records)`,
            type: 'bar' as const,
            datasetId: newDs.id,
            xAxis: newDs.categoricalColumns[0] || newDs.columns[0],
            yAxis: newDs.numericColumns[0] || newDs.columns[1],
            aggregation: 'sum' as const,
            colorScheme: 'emerald' as const,
            colSpan: 6,
          };
          const updatedCanvas = {
            ...canvasState,
            widgets: [newWidget, ...canvasState.widgets],
            lastModified: Date.now(),
            version: canvasState.version + 1,
          };
          handleCanvasUpdate(updatedCanvas);
        }}
      />

      <AiInsightsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        dataset={filteredDatasets[0] || datasets[0] || DEFAULT_DATASETS[0]}
        canvasState={canvasState}
      />

      <ReportingModal
        isOpen={isReportingOpen}
        onClose={() => setIsReportingOpen(false)}
        canvasState={canvasState}
        datasets={filteredDatasets}
        selectedDistrict={selectedDistrict}
      />

      <CollabDrawer
        isOpen={isCollabDrawerOpen}
        onClose={() => setIsCollabDrawerOpen(false)}
      />

      {/* Pre-designed Infographic Template Gallery */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        datasets={filteredDatasets}
        currentDatasetId={filteredDatasets[0]?.id}
        onApplyTemplate={(newCanvas) => {
          handleCanvasUpdate(newCanvas);
          setSyncToast(`Applied template "${newCanvas.title}"`);
          setTimeout(() => setSyncToast(null), 3500);
        }}
      />

      {/* Data Validation, Audit & Cleaning Studio */}
      {isDataCleaningModalOpen && (
        <DataCleaningModal
          isOpen={isDataCleaningModalOpen}
          onClose={() => setIsDataCleaningModalOpen(false)}
          dataset={datasets.find((d) => d.id === activeCleaningDatasetId) || datasets[0]}
          onSaveCleanedDataset={(cleanedDs) => {
            storageService.addCustomDataset(cleanedDs);
            setDatasets(storageService.getAllDatasets());
            setSyncToast(`Saved cleaned dataset "${cleanedDs.name}" to workspace.`);
            setTimeout(() => setSyncToast(null), 3500);
          }}
        />
      )}
    </div>
  );
}
