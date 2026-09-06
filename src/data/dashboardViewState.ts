import { ValueChainType } from '../types';
import { REPORTING_PERIODS, ReportingPeriod } from './reportingPeriods';

export const DASHBOARD_TABS = [
  'dashboard',
  'data_quality',
  'data_refresh',
  'map',
  'district_profile',
  'value_chains',
  'yield_outlook',
  'yield_studies',
  'ffs',
  'financial',
  'procurement',
  'agribusiness',
  'infrastructure',
  'gals',
  'grm',
  'climate_smart',
  'me_logframe',
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export const DASHBOARD_VALUE_CHAINS: ValueChainType[] = [
  'All Value Chains',
  'Rice (IVS & Bolilands)',
  'Cassava & HQCF',
  'Cocoa & Coffee',
  'Oil Palm & CPO',
  'Horticulture & Vegetables',
  'Poultry & Livestock',
  'Inland Aquaculture',
];

export interface DashboardViewState {
  tab: DashboardTab;
  district: string | null;
  valueChain: ValueChainType;
  reportingPeriod: ReportingPeriod;
}

const defaults: DashboardViewState = {
  tab: 'dashboard',
  district: null,
  valueChain: 'All Value Chains',
  reportingPeriod: 'Latest available',
};

export const readDashboardViewState = (districts: string[]): DashboardViewState => {
  if (typeof window === 'undefined') return defaults;

  const params = new URLSearchParams(window.location.search);
  const tab = params.get('view');
  const district = params.get('district');
  const valueChain = params.get('valueChain');
  const reportingPeriod = params.get('period');

  return {
    tab: DASHBOARD_TABS.includes(tab as DashboardTab)
      ? (tab as DashboardTab)
      : defaults.tab,
    district: district && districts.includes(district) ? district : null,
    valueChain: DASHBOARD_VALUE_CHAINS.includes(valueChain as ValueChainType)
      ? (valueChain as ValueChainType)
      : defaults.valueChain,
    reportingPeriod: REPORTING_PERIODS.includes(reportingPeriod as ReportingPeriod)
      ? (reportingPeriod as ReportingPeriod)
      : defaults.reportingPeriod,
  };
};

export const buildDashboardViewUrl = (state: DashboardViewState): string => {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const setUnlessDefault = (key: string, value: string, defaultValue: string) => {
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);
  };

  setUnlessDefault('view', state.tab, defaults.tab);
  if (state.district) params.set('district', state.district);
  else params.delete('district');
  setUnlessDefault('valueChain', state.valueChain, defaults.valueChain);
  setUnlessDefault('period', state.reportingPeriod, defaults.reportingPeriod);

  url.search = params.toString();
  return url.toString();
};

export const replaceDashboardViewUrl = (state: DashboardViewState) => {
  const url = buildDashboardViewUrl(state);
  if (url && url !== window.location.href) {
    window.history.replaceState(null, '', url);
  }
};
