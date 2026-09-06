export type IndicatorPerformanceStatus =
  | 'target_achieved'
  | 'on_track'
  | 'attention'
  | 'off_track'
  | 'not_reported'
  | 'provisional';

export interface IndicatorMetricInput {
  baseline: number;
  target: number;
  actual: number | null | undefined;
  elapsedRatio: number;
  provisional?: boolean;
}

export interface IndicatorMetricResult {
  expectedValue: number;
  achievementPct: number | null;
  pacePct: number | null;
  status: IndicatorPerformanceStatus;
}

const clampElapsedRatio = (ratio: number) => Math.min(1, Math.max(0, ratio));

export const interpolateTarget = (baseline: number, target: number, ratio: number) =>
  baseline + (target - baseline) * clampElapsedRatio(ratio);

export const calculateIndicatorProgress = (
  baseline: number,
  target: number,
  actual: number
) => {
  const plannedChange = target - baseline;
  if (plannedChange === 0) return actual === target ? 1 : 0;
  return Math.max(0, (actual - baseline) / plannedChange);
};

export const calculateIndicatorMetric = ({
  baseline,
  target,
  actual,
  elapsedRatio,
  provisional = false,
}: IndicatorMetricInput): IndicatorMetricResult => {
  const expectedValue = interpolateTarget(baseline, target, elapsedRatio);

  if (actual === null || actual === undefined || !Number.isFinite(actual)) {
    return { expectedValue, achievementPct: null, pacePct: null, status: 'not_reported' };
  }

  const achievementPct = calculateIndicatorProgress(baseline, target, actual) * 100;
  const expectedProgress = Math.max(0.01, clampElapsedRatio(elapsedRatio));
  const pacePct = Math.max(0, achievementPct / expectedProgress);
  const targetReached = target >= baseline ? actual >= target : actual <= target;

  let status: IndicatorPerformanceStatus;
  if (provisional) status = 'provisional';
  else if (targetReached) status = 'target_achieved';
  else if (pacePct >= 90) status = 'on_track';
  else if (pacePct >= 70) status = 'attention';
  else status = 'off_track';

  return { expectedValue, achievementPct, pacePct, status };
};
