import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateIndicatorMetric } from './indicatorMetrics';

test('classifies progress against the expected target for elapsed time', () => {
  assert.equal(calculateIndicatorMetric({ baseline: 0, target: 100, actual: 45, elapsedRatio: 0.5 }).status, 'on_track');
  assert.equal(calculateIndicatorMetric({ baseline: 0, target: 100, actual: 38, elapsedRatio: 0.5 }).status, 'attention');
  assert.equal(calculateIndicatorMetric({ baseline: 0, target: 100, actual: 30, elapsedRatio: 0.5 }).status, 'off_track');
});

test('classifies targets reached in either direction', () => {
  assert.equal(calculateIndicatorMetric({ baseline: 10, target: 20, actual: 20, elapsedRatio: 0.5 }).status, 'target_achieved');
  assert.equal(calculateIndicatorMetric({ baseline: 20, target: 10, actual: 9, elapsedRatio: 0.5 }).status, 'target_achieved');
});

test('does not convert missing or provisional figures into confirmed performance', () => {
  assert.equal(calculateIndicatorMetric({ baseline: 0, target: 100, actual: null, elapsedRatio: 0.5 }).status, 'not_reported');
  assert.equal(calculateIndicatorMetric({ baseline: 0, target: 100, actual: 100, elapsedRatio: 1, provisional: true }).status, 'provisional');
});
