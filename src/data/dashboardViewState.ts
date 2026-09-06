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

export const parseDashboardViewSearch = (
  search: string,
  districts: string[]
): DashboardViewState => {
  const params = new URLSearchParams(search);
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

export const readDashboardViewState = (districts: string[]): DashboardViewState =>
  typeof window === 'undefined'
    ? defaults
    : parseDashboardViewSearch(window.location.search, districts);

export const buildDashboardViewHref = (
  currentHref: string,
  state: DashboardViewState
): string => {
  const url = new URL(currentHref);
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

export const buildDashboardViewUrl = (state: DashboardViewState): string =>
  typeof window === 'undefined' ? '' : buildDashboardViewHref(window.location.href, state);

export const replaceDashboardViewUrl = (state: DashboardViewState) => {
  const url = buildDashboardViewUrl(state);
  if (url && url !== window.location.href) {
    window.history.replaceState(null, '', url);
  }
};
