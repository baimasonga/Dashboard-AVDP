export type DashboardUiMode = 'viewer' | 'analyst';

const runtimeEnv =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};

export const getDashboardUiMode = (): DashboardUiMode =>
  runtimeEnv.VITE_DASHBOARD_UI_MODE === 'analyst' ? 'analyst' : 'viewer';
