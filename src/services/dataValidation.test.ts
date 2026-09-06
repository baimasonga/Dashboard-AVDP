import assert from 'node:assert/strict';
import test from 'node:test';
import { DataCleaningService } from './dataCleaningService';

test('validation reports issues without altering uploaded rows', () => {
  const rows = [
    { District: 'bo dist', Yield_MT_Ha: 48.5 },
    { District: 'Kenema', Yield_MT_Ha: null },
    { District: 'Kailahun', Yield_MT_Ha: 3.4 },
    { District: 'Bo', Yield_MT_Ha: 3.6 },
    { District: 'Kambia', Yield_MT_Ha: 3.8 },
  ];
  const original = structuredClone(rows);

  const report = DataCleaningService.validateDataset(rows, ['District', 'Yield_MT_Ha']);

  assert.deepEqual(rows, original);
  assert.ok(report.cellErrors.length > 0);
  assert.ok(report.formatIssueCount > 0);
  assert.ok(report.missingCount > 0);
  assert.ok(report.outlierCount > 0);
});
