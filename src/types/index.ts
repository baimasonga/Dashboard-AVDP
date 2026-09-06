export type ValueChainType =
  | 'All Value Chains'
  | 'Rice (IVS & Bolilands)'
  | 'Cassava & HQCF'
  | 'Cocoa & Coffee'
  | 'Oil Palm & CPO'
  | 'Horticulture & Vegetables'
  | 'Poultry & Livestock'
  | 'Inland Aquaculture';

export type ChartType =
  | 'bar'
  | 'horizontal_bar'
  | 'line'
  | 'area'
  | 'donut'
  | 'radar'
  | 'kpi_metric'
  | 'flow_diagram'
  | 'map'
  | 'target_progress'
  | 'notes'
  | 'ranking';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  valueChain: string;
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  uploadedAt: string;
  isCustom?: boolean;
}

export interface FlowStep {
  id: string;
  stage: string;
  title: string;
  metric: string;
  subtext: string;
  efficiency: number; // e.g. 92%
  loss: string; // e.g. "8% post-harvest loss"
  icon: string;
}

export interface WidgetConfig {
  id: string;
  type: ChartType;
  title: string;
  subtitle?: string;
  datasetId?: string;
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  colorScheme?: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'rose' | 'slate';
  colSpan: number; // 1 to 12
  heightPx?: number;
  valueChain?: string;
  metricPrefix?: string;
  metricSuffix?: string;
  targetValue?: number;
  customNotes?: string;
  mapMetric?: 'yield' | 'beneficiaries' | 'target_pct' | 'processing' | 'oil_palm' | 'cocoa' | 'vegetables' | 'ivs_ha' | 'women_youth';
  flowSteps?: FlowStep[];
  sortOrder?: 'asc' | 'desc' | 'none';
  limit?: number;
}

export interface CanvasState {
  id: string;
  title: string;
  subtitle: string;
  templateType: 'custom' | 'executive_summary' | 'me_quarterly' | 'rice_value_chain' | 'district_benchmarks' | 'crop_production' | 'market_analysis' | 'supply_chain' | string;
  widgets: WidgetConfig[];
  theme: 'dark-emerald' | 'dark-slate' | 'dark-amber' | 'dark-cyan' | 'dark-indigo' | 'dark-rose' | string;
  lastModified: number;
  updatedBy: string;
  version: number;
}

export interface MELogframeIndicator {
  id: string;
  code: string;
  component: string;
  indicator: string;
  valueChain: string;
  unit: string;
  baseline: number;
  midtermTarget: number;
  finalTarget: number;
  currentActual: number;
  achievedPct: number;
  status: 'on_track' | 'at_risk' | 'critical';
  genderDisaggregation: {
    womenPct: number;
    youthPct: number;
    menPct: number;
  };
  districtBreakdown: Record<string, number>;
  lastVerifiedDate: string;
  leadOfficer: string;
}

export interface DistrictMetric {
  name: string;
  code: string;
  province: 'Northern' | 'North Western' | 'Southern' | 'Eastern' | 'Western';
  primaryValueChains: string[];
  riceYieldMTPerHa: number;
  cassavaYieldMTPerHa: number;
  cocoaProductionMT: number;
  oilPalmYieldMT: number;
  vegetablesYieldMT?: number;
  ivsDevelopedHa?: number;
  womenBeneficiaryPct?: number;
  youthBeneficiaryPct?: number;
  beneficiaryHouseholds: number;
  fboCount: number; // Farmer-Based Organizations
  meCompletionRate: number; // percentage
  feederRoadsRehabKm: number;
  activeProcessingMills: number;
  coordinates: { x: number; y: number };
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
  cursor?: { x: number; y: number };
  isOnline: boolean;
  lastActive: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  color: string;
  timestamp: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'canvas_update' | 'dataset_save' | 'me_update';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  simulatedOffline: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  syncState: 'idle' | 'syncing' | 'synced' | 'error';
  lastError?: string;
}
