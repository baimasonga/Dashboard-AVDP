import { CanvasState, Dataset, SyncQueueItem, SyncStatus } from '../types';
import { DEFAULT_DATASETS, INITIAL_WIDGETS } from '../data/sierraLeoneData';

const STORAGE_KEYS = {
  CANVAS_STATE: 'avdp_sl_canvas_state_v1',
  DATASETS: 'avdp_sl_datasets_v1',
  SYNC_QUEUE: 'avdp_sl_sync_queue_v1',
  LAST_SYNC: 'avdp_sl_last_sync_timestamp',
  OFFLINE_SIM: 'avdp_sl_simulated_offline',
  THEME_MODE: 'avdp_sl_theme_mode',
};

class StorageService {
  private simulatedOffline: boolean = false;
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.simulatedOffline = localStorage.getItem(STORAGE_KEYS.OFFLINE_SIM) === 'true';
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  public isNetworkOnline(): boolean {
    if (this.simulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public setSimulatedOffline(simulated: boolean) {
    this.simulatedOffline = simulated;
    localStorage.setItem(STORAGE_KEYS.OFFLINE_SIM, String(simulated));
    this.notifySyncStatus();
    if (!simulated && navigator.onLine) {
      this.syncWithCloud();
    }
  }

  public isSimulatedOffline(): boolean {
    return this.simulatedOffline;
  }

  // Canvas State persistence
  public getCanvasState(): CanvasState {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANVAS_STATE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading canvas from storage:', e);
    }

    const defaultState: CanvasState = {
      id: 'canvas_sl_avdp_master',
      title: 'AVDP Sierra Leone Agricultural Value Chain Master Dashboard',
      subtitle: 'IFAD-Supported Monitoring & Evaluation, District Benchmarks, and Value Chain Analytics',
      templateType: 'executive_summary',
      widgets: INITIAL_WIDGETS,
      theme: 'dark-emerald',
      lastModified: Date.now(),
      updatedBy: 'Local User',
      version: 1,
    };
    this.saveCanvasStateLocally(defaultState);
    return defaultState;
  }

  public saveCanvasStateLocally(state: CanvasState) {
    try {
      state.lastModified = Date.now();
      localStorage.setItem(STORAGE_KEYS.CANVAS_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save canvas locally:', e);
    }
  }

  public queueCanvasUpdate(state: CanvasState, author: string = 'Local M&E Officer') {
    this.saveCanvasStateLocally(state);

    const queueItem: SyncQueueItem = {
      id: 'queue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'canvas_update',
      payload: state,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.addToSyncQueue(queueItem);

    if (this.isNetworkOnline()) {
      this.syncWithCloud();
    } else {
      this.notifySyncStatus();
    }
  }

  // Datasets Persistence
  public getDatasets(): Dataset[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DATASETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading datasets from storage:', e);
    }

    this.saveDatasetsLocally(DEFAULT_DATASETS);
    return DEFAULT_DATASETS;
  }

  public saveDatasetsLocally(datasets: Dataset[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
    } catch (e) {
      console.error('Failed to save datasets:', e);
    }
  }

  public addCustomDataset(dataset: Dataset) {
    const existing = this.getDatasets();
    const updated = [dataset, ...existing.filter((d) => d.id !== dataset.id)];
    this.saveDatasetsLocally(updated);

    this.addToSyncQueue({
      id: 'ds_sync_' + Date.now(),
      type: 'dataset_save',
      payload: dataset,
      timestamp: Date.now(),
      retryCount: 0,
    });

    if (this.isNetworkOnline()) {
      this.syncWithCloud();
    } else {
      this.notifySyncStatus();
    }
    return updated;
  }

  // Sync Queue Management
  public getSyncQueue(): SyncQueueItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private addToSyncQueue(item: SyncQueueItem) {
    const queue = this.getSyncQueue();
    // deduplicate by type if applicable
    const filtered = queue.filter(
      (q) => !(q.type === item.type && item.type === 'canvas_update')
    );
    filtered.push(item);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  }

  public clearQueueItems(ids: string[]) {
    const queue = this.getSyncQueue();
    const remaining = queue.filter((item) => !ids.includes(item.id));
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remaining));
  }

  public getLastSyncTime(): number | null {
    const time = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return time ? parseInt(time, 10) : null;
  }

  private setLastSyncTime(timestamp: number) {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(timestamp));
  }

  // Cloud Synchronization Engine
  public async syncWithCloud(): Promise<SyncStatus> {
    const isOnline = this.isNetworkOnline();
    if (!isOnline) {
      const status: SyncStatus = {
        isOnline: false,
        simulatedOffline: this.simulatedOffline,
        pendingCount: this.getSyncQueue().length,
        lastSyncTime: this.getLastSyncTime(),
        syncState: 'idle',
      };
      this.notifySyncStatus(status);
      return status;
    }

    this.notifySyncStatus({
      isOnline: true,
      simulatedOffline: false,
      pendingCount: this.getSyncQueue().length,
      lastSyncTime: this.getLastSyncTime(),
      syncState: 'syncing',
    });

    try {
      const queue = this.getSyncQueue();
      const lastSync = this.getLastSyncTime() || 0;
      const currentCanvas = this.getCanvasState();

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue,
          clientLastSync: lastSync,
          clientCanvas: currentCanvas,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync server responded with ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.appliedIds && result.appliedIds.length > 0) {
          this.clearQueueItems(result.appliedIds);
        } else if (queue.length > 0) {
          this.clearQueueItems(queue.map((q) => q.id));
        }

        this.setLastSyncTime(result.serverTimestamp || Date.now());

        // If server had a newer authoritative canvas state
        if (result.serverCanvas && result.serverCanvas.lastModified > currentCanvas.lastModified) {
          this.saveCanvasStateLocally(result.serverCanvas);
        }

        const successStatus: SyncStatus = {
          isOnline: true,
          simulatedOffline: false,
          pendingCount: this.getSyncQueue().length,
          lastSyncTime: Date.now(),
          syncState: 'synced',
        };
        this.notifySyncStatus(successStatus);
        return successStatus;
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (err: any) {
      console.warn('Sync failed, queuing for next retry:', err);
      const errorStatus: SyncStatus = {
        isOnline: true,
        simulatedOffline: false,
        pendingCount: this.getSyncQueue().length,
        lastSyncTime: this.getLastSyncTime(),
        syncState: 'error',
        lastError: err.message || 'Network sync timeout',
      };
      this.notifySyncStatus(errorStatus);
      return errorStatus;
    }
  }

  public subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    // Send immediate state
    listener(this.getCurrentSyncStatus());
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  public getCurrentSyncStatus(): SyncStatus {
    return {
      isOnline: this.isNetworkOnline(),
      simulatedOffline: this.simulatedOffline,
      pendingCount: this.getSyncQueue().length,
      lastSyncTime: this.getLastSyncTime(),
      syncState: 'idle',
    };
  }

  private notifySyncStatus(customStatus?: SyncStatus) {
    const status = customStatus || this.getCurrentSyncStatus();
    this.syncListeners.forEach((l) => l(status));
  }

  private handleNetworkChange() {
    this.notifySyncStatus();
    if (this.isNetworkOnline()) {
      this.syncWithCloud();
    }
  }

  // Template Export & Import
  public getAllDatasets(): Dataset[] {
    return this.getDatasets();
  }

  public isOnline(): boolean {
    return this.isNetworkOnline();
  }

  public getPendingSyncQueue(): SyncQueueItem[] {
    return this.getSyncQueue();
  }

  public saveCanvasState(state: CanvasState) {
    this.queueCanvasUpdate(state);
  }

  public subscribe(listener: (event: { type: string; data?: any }) => void): () => void {
    const syncHandler = (status: SyncStatus) => {
      listener({
        type: 'sync_status_changed',
        data: {
          online: status.isOnline,
          isSimulated: status.simulatedOffline,
          pendingCount: status.pendingCount,
        },
      });
    };
    return this.subscribeSyncStatus(syncHandler);
  }

  public exportProjectTemplate(): string {
    const payload = {
      format: 'sierra-leone-avcdp-template',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      canvas: this.getCanvasState(),
      datasets: this.getDatasets(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public importProjectTemplate(jsonContent: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.canvas && parsed.canvas.widgets) {
        this.saveCanvasStateLocally(parsed.canvas);
      }
      if (Array.isArray(parsed.datasets) && parsed.datasets.length > 0) {
        this.saveDatasetsLocally(parsed.datasets);
      }
      this.queueCanvasUpdate(this.getCanvasState());
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid JSON format' };
    }
  }
}

export const storageService = new StorageService();
