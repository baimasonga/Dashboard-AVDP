import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDashboardViewHref,
  parseDashboardViewSearch,
} from './dashboardViewState';
import {
  datasetMatchesReportingPeriod,
  getDemonstrationDatasetMetadata,
} from './reportingPeriods';
import { isDataset } from '../services/dashboardDataGateway';

const districts = ['Bo', 'Kenema', 'Kailahun'];

test('reporting metadata is stable for a dataset regardless of surrounding filters', () => {
  const first = getDemonstrationDatasetMetadata({ id: 'district-yield-register' });
  const second = getDemonstrationDatasetMetadata({ id: 'district-yield-register' });

  assert.deepEqual(first, second);
  assert.equal(
    datasetMatchesReportingPeriod(
      { id: 'district-yield-register' },
      first.reportingPeriod
    ),
    true
  );
  assert.equal(
    datasetMatchesReportingPeriod({ id: 'district-yield-register' }, 'Latest available'),
    true
  );
});

test('shared dashboard URLs restore only approved values', () => {
  const parsed = parseDashboardViewSearch(
    '?view=data_quality&district=Bo&valueChain=Rice+%28IVS+%26+Bolilands%29&period=2025+Q4',
    districts
  );

  assert.deepEqual(parsed, {
    tab: 'data_quality',
    district: 'Bo',
    valueChain: 'Rice (IVS & Bolilands)',
    reportingPeriod: '2025 Q4',
  });
});

test('invalid shared dashboard values fall back to safe defaults', () => {
  const parsed = parseDashboardViewSearch(
    '?view=admin&district=Unknown&valueChain=Invalid&period=2035',
    districts
  );

  assert.deepEqual(parsed, {
    tab: 'dashboard',
    district: null,
    valueChain: 'All Value Chains',
    reportingPeriod: 'Latest available',
  });
});

test('dashboard URL builder preserves unrelated parameters and omits default scope', () => {
  const url = buildDashboardViewHref('https://dashboard.example/?campaign=review', {
    tab: 'dashboard',
    district: null,
    valueChain: 'All Value Chains',
    reportingPeriod: 'Latest available',
  });

  assert.equal(url, 'https://dashboard.example/?campaign=review');
});

test('dashboard URL builder encodes a complete filtered view', () => {
  const url = new URL(
    buildDashboardViewHref('https://dashboard.example/', {
      tab: 'data_refresh',
      district: 'Kailahun',
      valueChain: 'Cocoa & Coffee',
      reportingPeriod: '2025 FY',
    })
  );

  assert.equal(url.searchParams.get('view'), 'data_refresh');
  assert.equal(url.searchParams.get('district'), 'Kailahun');
  assert.equal(url.searchParams.get('valueChain'), 'Cocoa & Coffee');
  assert.equal(url.searchParams.get('period'), '2025 FY');
});

const validDataset = {
  id: 'demo-1',
  name: 'Demonstration dataset',
  description: 'Fictitious records',
  valueChain: 'All Value Chains',
  columns: ['District', 'Value'],
  numericColumns: ['Value'],
  categoricalColumns: ['District'],
  rows: [{ District: 'Bo', Value: 10 }],
  rowCount: 1,
  uploadedAt: '2025-12-18T00:00:00.000Z',
};

test('live dataset contract accepts a complete, reconciled dataset', () => {
  assert.equal(isDataset(validDataset), true);
});

test('live dataset contract rejects row-count mismatches', () => {
  assert.equal(isDataset({ ...validDataset, rowCount: 2 }), false);
});

test('live dataset contract rejects invalid row shapes', () => {
  assert.equal(isDataset({ ...validDataset, rows: [['Bo', 10]] }), false);
});

test('live dataset contract accepts complete provenance metadata', () => {
  assert.equal(
    isDataset({
      ...validDataset,
      source: 'Approved AVDP analytical warehouse',
      reportingPeriod: '2025 Q4',
      refreshedAt: '2025-12-19T08:00:00.000Z',
      verificationStatus: 'Verified',
    }),
    true
  );
});

test('live dataset contract rejects unsupported verification labels', () => {
  assert.equal(
    isDataset({ ...validDataset, verificationStatus: 'Official enough' }),
    false
  );
});
