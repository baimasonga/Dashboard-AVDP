import { Dataset } from '../types';
import { storageService } from './storageService';

export type DashboardDataMode = 'demonstration' | 'live';

export interface DashboardDataSnapshot {
  datasets: Dataset[];
  mode: DashboardDataMode;
  source: string;
  loadedAt: string;
  warning?: string;
}

interface LiveDatasetResponse {
  datasets?: unknown;
  source?: unknown;
  generatedAt?: unknown;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isDataset = (value: unknown): value is Dataset => {
  if (!value || typeof value !== 'object') return false;
  const dataset = value as Partial<Dataset>;
  return (
    typeof dataset.id === 'string' &&
    typeof dataset.name === 'string' &&
    typeof dataset.description === 'string' &&
    typeof dataset.valueChain === 'string' &&
    isStringArray(dataset.columns) &&
    isStringArray(dataset.numericColumns) &&
    isStringArray(dataset.categoricalColumns) &&
    Array.isArray(dataset.rows) &&
    dataset.rows.every((row) => Boolean(row) && typeof row === 'object' && !Array.isArray(row)) &&
    typeof dataset.rowCount === 'number' &&
    dataset.rowCount === dataset.rows.length &&
    typeof dataset.uploadedAt === 'string'
  );
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const runtimeEnv =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};

class DashboardDataGateway {
  public getConfiguredMode(): DashboardDataMode {
    return runtimeEnv.VITE_DASHBOARD_DATA_MODE === 'live' ? 'live' : 'demonstration';
  }

  public async load(): Promise<DashboardDataSnapshot> {
    const mode = this.getConfiguredMode();

    if (mode === 'demonstration') {
      return {
        datasets: storageService.getAllDatasets(),
        mode,
        source: 'Bundled and locally imported fictitious datasets',
        loadedAt: new Date().toISOString(),
        warning: 'Prototype data only — not approved for official AVDP reporting.',
      };
    }

    const configuredBaseUrl = String(runtimeEnv.VITE_DASHBOARD_DATA_API_URL || '').trim();
    if (!configuredBaseUrl) {
      throw new Error(
        'Live dashboard mode requires VITE_DASHBOARD_DATA_API_URL. Demonstration data was not substituted.'
      );
    }

    const response = await fetch(`${normalizeBaseUrl(configuredBaseUrl)}/datasets`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Approved data service returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as LiveDatasetResponse;
    if (!Array.isArray(payload.datasets) || !payload.datasets.every(isDataset)) {
      throw new Error('Approved data service returned an invalid dashboard dataset contract.');
    }

    return {
      datasets: payload.datasets,
      mode,
      source:
        typeof payload.source === 'string' && payload.source.trim()
          ? payload.source
          : 'Approved AVDP analytical data service',
      loadedAt:
        typeof payload.generatedAt === 'string' && payload.generatedAt.trim()
          ? payload.generatedAt
          : new Date().toISOString(),
    };
  }
}

export const dashboardDataGateway = new DashboardDataGateway();
