/**
 * Future Yield Regression & Predictive Modeling Service
 * Computes Ordinary Least Squares (OLS) linear regressions, 95% prediction intervals,
 * and 5-year outlook forecasts for Rice, Cocoa, and Palm Oil across Sierra Leone.
 */

import {
  CommodityType,
  COMMODITY_METADATA,
  DISTRICT_CROP_SERIES,
  CommodityMeta,
} from '../data/cropTrendData';

export type OutlookScenario = 'baseline_ols' | 'avdp_accelerated' | 'climate_risk';

export interface DataPoint {
  year: number;
  yieldMTPerHa: number;
  productionMT: number;
  harvestedAreaHa: number;
  isProjected: boolean;
  confidenceLower95?: number;
  confidenceUpper95?: number;
  regressionTrend?: number;
  // National Target Deficit Gap Metrics
  deficitGapRange?: [number, number] | null; // For Recharts Area shading [projectedYield, targetYield]
  deficitShortfallMT?: number; // Target - Projected (if > 0)
  deficitPctOfTarget?: number; // % shortfall
  productionShortfallMT?: number; // (Target - Projected) * harvestedArea
}

export interface RegressionStatistics {
  slope: number; // m in y = mx + b (annual yield change in MT/Ha/yr)
  intercept: number; // b in y = mx + b
  rSquared: number; // Coefficient of determination (0 - 1)
  adjRSquared: number; // Adjusted R^2 penalized for small sample
  stdError: number; // Standard error of regression
  tStatistic: number; // t-stat for slope significance
  equation: string; // e.g. "y = 0.165x - 330.4"
  annualChangeLabel: string; // e.g. "+0.165 MT/Ha per year"
  fitQuality: 'Exceptional' | 'Strong' | 'Moderate' | 'Weak';
  mape: number; // Mean Absolute Percentage Error (%)
  durbinWatson: number; // Durbin-Watson autocorrelation statistic (ideal ~ 2.0)
  confidenceScore: number; // 0-100 composite confidence rating
  reliabilityRating: 'Very High' | 'High' | 'Moderate' | 'Low';
}

export interface ScenarioComparisonItem {
  id: OutlookScenario | 'sustainable_agroforestry';
  name: string;
  description: string;
  badge: string;
  color: string;
  projected2030Yield: number;
  projected2030ProductionMT: number;
  targetAttainment2030Pct: number;
  deficitYieldMT: number;
  productionShortfallMT: number;
  isGoalMet: boolean;
  fiveYearCagrPct: number;
  netGainMT: number;
  breakEvenYear?: number;
}

export interface MultiScenarioChartPoint {
  year: number;
  isProjected: boolean;
  baselineOls: number;
  avdpAccelerated: number;
  climateRisk: number;
  sustainableAgroforestry: number;
  nationalTarget2030: number;
}

export interface SensitivityLever {
  id: string;
  name: string;
  category: 'Input' | 'Climate' | 'Technology' | 'Agronomy';
  unit: string;
  baselineValue: number;
  currentValue: number;
  min: number;
  max: number;
  step: number;
  elasticity: number; // % yield change per 10% change in lever
  impactOnYieldMT: number; // marginal impact in MT/Ha
  impactOnProductionMT: number; // marginal national volume impact in MT
  description: string;
}

export interface CropSensitivityAnalysis {
  commodity: CommodityType;
  district: string;
  baseline2030Yield: number;
  simulated2030Yield: number;
  nationalTarget2030Yield: number;
  gapClosedPct: number;
  isDeficitEliminated: boolean;
  levers: SensitivityLever[];
  tornadoData: {
    name: string;
    lowImpact: number;
    highImpact: number;
    baseline: number;
    swing: number;
  }[];
  breakEvenRecommendation: string;
}

export interface FiveYearOutlookResult {
  commodity: CommodityType;
  commodityMeta: CommodityMeta;
  district: string; // 'National Aggregate' or specific district name
  province?: string;
  scenario: OutlookScenario;
  horizonYears: number; // 1 (2027 Project Closure) or 2 (2028 Adjusted Horizon)
  historicalPoints: DataPoint[]; // 2019 - 2026 Empirical Implementation Years
  projectedPoints: DataPoint[]; // 2027 (Project Closure) and max 2028 (Adjusted Horizon)
  allPoints: DataPoint[]; // Combined 2019 - 2027 or 2028 for charts (strictly bounded <= 2028)
  regression: RegressionStatistics;
  baselineYear: number; // 2026 (Project Baseline Anchor)
  baselineYield: number;
  projectClosureYear: number; // 2027
  projectedEndYear: number; // 2027 or 2028 (never after 2028)
  projectedEndYield: number;
  netYieldGainMT: number; // End yield - Baseline yield
  percentageGain: number; // ((End - Baseline) / Baseline) * 100
  historicalCagrPct: number; // 2019 -> 2026/2027 CAGR
  projected5YrCagrPct: number; // Projected CAGR over forecast horizon
  projectLifeCycleCagrPct: number; // Inception (2019) to Project Closure (2027) CAGR
  frontierYield: number;
  targetAttainmentPct: number; // % of Project Closure target attained
  // AVDP Project Closure Goal & Deficit Analysis (2027 Target)
  projectClosureTargetYield: number;
  projectClosureTargetProduction: number;
  deficitClosureYieldMT: number; // Shortfall to Project Closure target in MT/Ha (0 if exceeded)
  deficitClosurePct: number; // % shortfall
  productionShortfallClosureMT: number; // Production volume shortfall in MT
  isDeficitProjected: boolean;
  // Backward compatibility properties
  nationalTarget2030Yield: number;
  nationalTarget2030Production: number;
  deficit2030YieldMT: number;
  deficit2030Pct: number;
  productionShortfall2030MT: number;
  isDeficitProjected2030: boolean;
  // Dynamic growth factor adjustment
  growthFactor: number; // e.g. 1.0 = baseline, 1.35 = +35% boost
  growthFactorPct: number; // e.g. 0 or +35
}

export interface PredictiveHeatmapRow {
  district: string;
  province: string;
  primaryAgroZone: string;
  dominantIntervention: string;
  y2019: number; // Inception
  y2021: number; // Early-Stage
  y2023: number; // Mid-Term
  y2025: number; // Penultimate
  baseline2026: number; // Project Baseline
  y2027: number; // Project Closure Target Year
  y2028: number; // Adjusted Close-Out Horizon (Max Allowable Year)
  targetClosure: number; // AVDP Project Closure Target
  attainmentClosurePct: number; // % attainment of 2027 closure target
  deficitClosureMT: number; // Shortfall in MT/Ha
  surplusClosureMT: number; // Surplus in MT/Ha
  cagrProjectPct: number; // 2019 -> 2027 Inception-to-Closure CAGR
  rSquared: number;
  status: 'Surpassed' | 'On Track' | 'Moderate Risk' | 'High Deficit';
  // Backward compatibility aliases
  baseline2027: number;
  y2029: number;
  y2030: number;
  y2031: number;
  y2032: number;
  target2030: number;
  attainment2030Pct: number;
  deficit2030MT: number;
  surplus2030MT: number;
  cagr5YrPct: number;
}

export interface PredictiveHeatmapData {
  commodity: CommodityType;
  commodityMeta: CommodityMeta;
  scenario: OutlookScenario;
  growthFactor: number;
  rows: PredictiveHeatmapRow[];
  minYield: number;
  maxYield: number;
  avgAttainmentPct: number;
  topPerformingDistrict: string;
  mostVulnerableDistrict: string;
}

export interface TrajectoryTrackingPoint {
  year: number;
  isProjected: boolean;
  actualOrProjectedYield: number;
  requiredTargetPath: number; // Required linear path to 2030 National Target
  varianceMT: number; // actualOrProjectedYield - requiredTargetPath
  variancePct: number; // relative % variance
  status: 'Ahead' | 'On Track' | 'At Risk' | 'Lagging';
}

export interface TrajectoryTrackingResult {
  commodity: CommodityType;
  commodityMeta: CommodityMeta;
  district: string;
  scenario: OutlookScenario;
  growthFactor: number;
  baseline2027Yield: number;
  baseline2026Yield?: number;
  target2030Yield: number;
  requiredAnnualVelocityMT: number; // (Target - Baseline2027) / 3 years (2027 to 2030)
  historicalVelocityMT: number; // OLS slope across 2019-2027
  projectedAnnualVelocityMT: number; // Scenario slope / velocity
  velocityCoveragePct: number; // projected / required * 100
  overallPacingStatus: 'Ahead of Pace' | 'On Track' | 'At Risk' | 'Critical Shortfall';
  checkpoints: TrajectoryTrackingPoint[];
  milestoneGap2030MT: number;
  milestoneGap2030Pct: number;
  chartData: {
    year: number;
    empiricalYield?: number;
    projectedYield?: number;
    requiredTargetPath: number;
    confidenceLower95?: number;
    confidenceUpper95?: number;
  }[];
}

export interface YieldScenarioPreset {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  scenario: OutlookScenario;
  growthFactor: number;
  color: string;
  category: 'Strategic Target' | 'Intervention Package' | 'Climate & Risk' | 'Agronomic Innovation';
  keyDrivers: string[];
  leverSettings: {
    fertilizer_npk: number;
    certified_seeds: number;
    rainfall_anomaly: number;
    mechanization_access: number;
  };
  policyRecommendation: string;
}

export const YIELD_SCENARIO_PRESETS: YieldScenarioPreset[] = [
  {
    id: 'vision_2030_self_sufficiency',
    name: 'Vision 2030 Food Self-Sufficiency',
    badge: 'National Priority',
    tagline: 'Aggressive input mobilization to eliminate national rice deficit by 2030.',
    description:
      'Targets full domestic food sovereignty via subsidized certified seed saturation, comprehensive NPK fertilization, and water management across major IVS basins.',
    scenario: 'avdp_accelerated',
    growthFactor: 1.45,
    color: '#10b981',
    category: 'Strategic Target',
    keyDrivers: [
      'High-potency NERICA & ROK certified seed distribution (+45%)',
      'Balanced NPK 15-15-15 + Urea top-dressing at 85 kg/ha',
      'Expanded power-tiller access across rural FBO cooperatives',
    ],
    leverSettings: {
      fertilizer_npk: 85,
      certified_seeds: 75,
      rainfall_anomaly: 0,
      mechanization_access: 45,
    },
    policyRecommendation:
      'Requires establishing national seed bank reserves and front-loading fertilizer vouchers before May planting.',
  },
  {
    id: 'avdp_phase2_scaleup',
    name: 'AVDP Phase II Accelerated Inputs',
    badge: 'Flagship Program',
    tagline: 'Direct value-chain scaling through structured smallholder input packages.',
    description:
      'Standard accelerated AVDP intervention bundle providing certified planting materials, localized agricultural extension agents, and feeder-road link access.',
    scenario: 'avdp_accelerated',
    growthFactor: 1.35,
    color: '#06b6d4',
    category: 'Intervention Package',
    keyDrivers: [
      'Extension agent outreach ratio expanded to 1:250 farmers',
      'Targeted fertilizer application rate at 65 kg/ha',
      'Farmer-Based Organization (FBO) group-purchasing facilitation',
    ],
    leverSettings: {
      fertilizer_npk: 65,
      certified_seeds: 60,
      rainfall_anomaly: 0,
      mechanization_access: 35,
    },
    policyRecommendation:
      'Prioritize high-yield districts (Port Loko, Kambia, Kenema) to optimize national aggregate output returns.',
  },
  {
    id: 'ivs_swamp_bunding',
    name: 'IVS Swamp Bunding & Water Control',
    badge: 'Resilient Water',
    tagline: 'Perennial canal bunding and drainage enabling year-round double-cropping.',
    description:
      'Focuses on engineering Inland Valley Swamps (IVS) with micro-dams, drainage headworks, and peripheral bunds to protect against flooding and drought.',
    scenario: 'avdp_accelerated',
    growthFactor: 1.28,
    color: '#3b82f6',
    category: 'Agronomic Innovation',
    keyDrivers: [
      'Engineered bunds and contour canals for flood regulation',
      'Second-season dry period cropping with short-duration varieties',
      'Community maintenance committees for hydrological assets',
    ],
    leverSettings: {
      fertilizer_npk: 50,
      certified_seeds: 55,
      rainfall_anomaly: 5,
      mechanization_access: 30,
    },
    policyRecommendation:
      'Rehabilitate 12,000 hectares of neglected lowland swamps in Bo, Moyamba, and Tonkolili.',
  },
  {
    id: 'sustainable_agroforestry',
    name: 'Sustainable Agroforestry & Soil Regeneration',
    badge: 'Eco-Regenerative',
    tagline: 'Preserving soil organic carbon and microclimates via shade-tree planting.',
    description:
      'Combines legume cover cropping, compost mulching, and indigenous tree canopy preservation for cocoa and oil palm agro-forests, boosting long-term soil health.',
    scenario: 'avdp_accelerated',
    growthFactor: 1.20,
    color: '#84cc16',
    category: 'Agronomic Innovation',
    keyDrivers: [
      'Biological nitrogen fixation via Mucuna pruriens cover crops',
      'Permanent shade canopy reducing heat scorch on cocoa pods',
      'Zero synthetic herbicide adoption preserving microbial biome',
    ],
    leverSettings: {
      fertilizer_npk: 40,
      certified_seeds: 50,
      rainfall_anomaly: 0,
      mechanization_access: 20,
    },
    policyRecommendation:
      'Incentivize organic certification premiums for Eastern Province cocoa cooperatives in Kailahun and Kenema.',
  },
  {
    id: 'postharvest_loss_mechanization',
    name: 'Post-Harvest Loss Mitigation & Mechanization',
    badge: 'Loss Reduction',
    tagline: 'Modern threshing, moisture meters, and hermetic bags reclaiming 15% in crop losses.',
    description:
      'Focuses on mitigating on-farm and post-harvest crop shrinkage through mechanized de-husking, motorized threshers, and tarpaulin solar drying slabs.',
    scenario: 'avdp_accelerated',
    growthFactor: 1.18,
    color: '#a855f7',
    category: 'Intervention Package',
    keyDrivers: [
      'Motorized multi-crop threshers reducing field shatter',
      'Hermetic storage bags preventing weevil and rodent infestation',
      'Community aggregation centers with solar drying floors',
    ],
    leverSettings: {
      fertilizer_npk: 45,
      certified_seeds: 40,
      rainfall_anomaly: 0,
      mechanization_access: 50,
    },
    policyRecommendation:
      'Establish 50 rural machinery service centers managed by youth agribusiness entrepreneurs.',
  },
  {
    id: 'baseline_ols_trend',
    name: 'Baseline OLS Business-as-Usual',
    badge: 'Historical Trend',
    tagline: 'Continuation of 2019–2027 extended project life cycle linear progression without supplemental shocks.',
    description:
      'Standard unadjusted econometric trajectory derived strictly from empirical historical regression slopes across 2019 to 2027 extended project lifecycle data points.',
    scenario: 'baseline_ols',
    growthFactor: 1.00,
    color: '#64748b',
    category: 'Strategic Target',
    keyDrivers: [
      'Organic smallholder expansion at historical baseline velocity',
      'Current informal input market access rates (30-35%)',
      'Standard public extension coverage without emergency interventions',
    ],
    leverSettings: {
      fertilizer_npk: 35,
      certified_seeds: 30,
      rainfall_anomaly: 0,
      mechanization_access: 15,
    },
    policyRecommendation:
      'Serves as the benchmark baseline against which all policy intervention returns should be evaluated.',
  },
  {
    id: 'climate_shock_drought',
    name: 'Climate Shock & Extended Drought Stress',
    badge: 'Downside Stress-Test',
    tagline: '-25% rainfall anomaly, delayed rainy season, and heatwaves during panicle initiation.',
    description:
      'Simulates severe climate disruption featuring a 4-week delayed monsoon, episodic mid-season droughts, and increased pest outbreaks, causing yield contractions.',
    scenario: 'climate_risk',
    growthFactor: 0.82,
    color: '#f43f5e',
    category: 'Climate & Risk',
    keyDrivers: [
      '-25% cumulative seasonal precipitation anomaly',
      'Late planting resulting in panicle blast and incomplete grain filling',
      'Elevated farmgate diesel fuel prices curtailing water pumps',
    ],
    leverSettings: {
      fertilizer_npk: 25,
      certified_seeds: 20,
      rainfall_anomaly: -25,
      mechanization_access: 15,
    },
    policyRecommendation:
      'Pre-position drought-tolerant ROK-24 seeds and activate parametric crop micro-insurance triggers.',
  },
  {
    id: 'subsistence_input_shortage',
    name: 'Subsistence Input Bottleneck',
    badge: 'Economic Squeeze',
    tagline: 'High global fertilizer prices and informal seed recycling depressing yields.',
    description:
      'Economic stress-test modeling severe input inflation where smallholders are forced to rely exclusively on saved degenerated seeds and unfertilized soils.',
    scenario: 'climate_risk',
    growthFactor: 0.88,
    color: '#f97316',
    category: 'Climate & Risk',
    keyDrivers: [
      'Commercial NPK price surges driving application rates below 20 kg/ha',
      'Recycled 4th-generation seeds with 25% lower germination vigor',
      'Manual labor bottlenecks during peak harvesting periods',
    ],
    leverSettings: {
      fertilizer_npk: 15,
      certified_seeds: 15,
      rainfall_anomaly: -5,
      mechanization_access: 10,
    },
    policyRecommendation:
      'Subsidize local organic compost production and support FBO communal labor sharing groups.',
  },
];

export class FutureYieldRegressionService {
  /**
   * Run Ordinary Least Squares (OLS) Linear Regression on (x, y) coordinates
   */
  static computeLinearRegression(points: { x: number; y: number }[]): RegressionStatistics {
    const n = points.length;
    if (n < 2) {
      return {
        slope: 0,
        intercept: points[0]?.y ?? 0,
        rSquared: 0,
        adjRSquared: 0,
        stdError: 0,
        tStatistic: 0,
        equation: 'y = 0',
        annualChangeLabel: '0.00 MT/Ha/yr',
        fitQuality: 'Weak',
        mape: 0,
        durbinWatson: 2.0,
        confidenceScore: 50,
        reliabilityRating: 'Low',
      };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;
    const denominator = sumXX - (sumX * sumX) / n;

    const slope = denominator === 0 ? 0 : (sumXY - (sumX * sumY) / n) / denominator;
    const intercept = meanY - slope * meanX;

    // Calculate sum of squares and residuals
    let ssTot = 0;
    let ssRes = 0;
    let sumAbsPctErr = 0;
    const residuals: number[] = [];

    for (const p of points) {
      const predY = slope * p.x + intercept;
      const res = p.y - predY;
      residuals.push(res);
      ssTot += Math.pow(p.y - meanY, 2);
      ssRes += Math.pow(res, 2);
      if (p.y !== 0) {
        sumAbsPctErr += Math.abs(res / p.y);
      }
    }

    const rSquared = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));
    const degreesOfFreedom = n - 2;
    const adjRSquared =
      degreesOfFreedom > 0
        ? Math.max(0, +(1 - (1 - rSquared) * ((n - 1) / degreesOfFreedom)).toFixed(3))
        : rSquared;
    const stdError = degreesOfFreedom > 0 ? Math.sqrt(ssRes / degreesOfFreedom) : 0;
    const sxx = denominator;
    const seSlope = sxx > 0 && degreesOfFreedom > 0 ? stdError / Math.sqrt(sxx) : 0;
    const tStatistic = seSlope > 0 ? Math.abs(slope / seSlope) : 0;

    // Mean Absolute Percentage Error (MAPE)
    const mape = +( (sumAbsPctErr / n) * 100 ).toFixed(2);

    // Durbin-Watson statistic for serial correlation
    let dwNum = 0;
    let dwDen = 0;
    for (let i = 0; i < residuals.length; i++) {
      dwDen += residuals[i] * residuals[i];
      if (i > 0) {
        dwNum += Math.pow(residuals[i] - residuals[i - 1], 2);
      }
    }
    const durbinWatson = dwDen > 0 ? +(dwNum / dwDen).toFixed(2) : 2.0;

    // Composite Forecast Confidence Score (0 - 100)
    // Combines R^2 (50 pts), MAPE accuracy (30 pts), and t-stat significance (20 pts)
    const r2Pts = rSquared * 50;
    const mapePts = Math.max(0, 30 - mape * 2.5);
    const tStatPts = Math.min(20, (tStatistic / 4) * 20);
    const confidenceScore = Math.round(Math.min(99, Math.max(25, r2Pts + mapePts + tStatPts)));

    let reliabilityRating: RegressionStatistics['reliabilityRating'] = 'Moderate';
    if (confidenceScore >= 85) reliabilityRating = 'Very High';
    else if (confidenceScore >= 70) reliabilityRating = 'High';
    else if (confidenceScore >= 50) reliabilityRating = 'Moderate';
    else reliabilityRating = 'Low';

    const sign = intercept >= 0 ? '+' : '-';
    const equation = `y = ${slope >= 0 ? '' : '-'}${Math.abs(slope).toFixed(4)}x ${sign} ${Math.abs(intercept).toFixed(2)}`;
    const annualChangeLabel = `${slope >= 0 ? '+' : ''}${slope.toFixed(3)} MT/Ha per year`;

    let fitQuality: RegressionStatistics['fitQuality'] = 'Moderate';
    if (rSquared >= 0.9) fitQuality = 'Exceptional';
    else if (rSquared >= 0.75) fitQuality = 'Strong';
    else if (rSquared >= 0.5) fitQuality = 'Moderate';
    else fitQuality = 'Weak';

    return {
      slope,
      intercept,
      rSquared: +rSquared.toFixed(3),
      adjRSquared,
      stdError: +stdError.toFixed(3),
      tStatistic: +tStatistic.toFixed(2),
      equation,
      annualChangeLabel,
      fitQuality,
      mape,
      durbinWatson,
      confidenceScore,
      reliabilityRating,
    };
  }

  /**
   * Compound Annual Growth Rate (CAGR) calculation
   */
  static computeCagr(startVal: number, endVal: number, years: number): number {
    if (startVal <= 0 || endVal <= 0 || years <= 0) return 0;
    return (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
  }

  /**
   * Retrieve historical time series for a single district or national weighted aggregate (2019 - 2026 empirical monitoring)
   */
  static getHistoricalSeries(
    commodity: CommodityType,
    district: string = 'National Aggregate'
  ): {
    points: DataPoint[];
    frontierYield: number;
    province?: string;
  } {
    if (district === 'National Aggregate' || district === 'All') {
      // Aggregate across all 16 districts for this commodity
      const districtSeries = DISTRICT_CROP_SERIES.filter((s) => s.commodity === commodity);
      const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

      const points: DataPoint[] = years.map((yr) => {
        let totalProd = 0;
        let totalArea = 0;

        districtSeries.forEach((series) => {
          if (yr === 2026) {
            totalProd += series.baseline2026.productionMT;
            totalArea += series.baseline2026.harvestedAreaHa;
          } else {
            const pt = series.history.find((h) => h.year === yr);
            if (pt) {
              totalProd += pt.productionMT;
              totalArea += pt.harvestedAreaHa;
            }
          }
        });

        const weightedYield = totalArea > 0 ? +(totalProd / totalArea).toFixed(2) : 0;

        return {
          year: yr,
          yieldMTPerHa: weightedYield,
          productionMT: totalProd,
          harvestedAreaHa: totalArea,
          isProjected: false,
        };
      });

      const avgFrontier =
        districtSeries.reduce((acc, s) => acc + s.potentialFrontierYield, 0) /
        (districtSeries.length || 1);

      return {
        points,
        frontierYield: +avgFrontier.toFixed(2),
        province: 'Sierra Leone (16 Districts)',
      };
    } else {
      // Specific district
      const series = DISTRICT_CROP_SERIES.find(
        (s) =>
          s.commodity === commodity &&
          s.district.toLowerCase() === district.toLowerCase()
      );

      if (!series) {
        // Fallback to national aggregate
        return this.getHistoricalSeries(commodity, 'National Aggregate');
      }

      const points: DataPoint[] = [
        ...series.history.map((h) => ({
          year: h.year,
          yieldMTPerHa: h.yieldMTPerHa,
          productionMT: h.productionMT,
          harvestedAreaHa: h.harvestedAreaHa,
          isProjected: false,
        })),
        {
          year: series.baseline2026.year,
          yieldMTPerHa: series.baseline2026.yieldMTPerHa,
          productionMT: series.baseline2026.productionMT,
          harvestedAreaHa: series.baseline2026.harvestedAreaHa,
          isProjected: false,
        },
      ];

      return {
        points,
        frontierYield: series.potentialFrontierYield,
        province: series.province,
      };
    }
  }

  /**
   * Run Yield Outlook Linear Regression Projection
   * Strictly modeled between inception (2019) and project closure (2027),
   * with optional adjusted close-out horizon up to 2028 (never after 2028).
   */
  static run5YearOutlook(
    commodity: CommodityType,
    district: string = 'National Aggregate',
    scenario: OutlookScenario = 'baseline_ols',
    horizonYears: number = 1,
    customGrowthFactor: number = 1.0
  ): FiveYearOutlookResult {
    const commodityMeta = COMMODITY_METADATA[commodity];
    const { points: historicalPoints, frontierYield, province } = this.getHistoricalSeries(
      commodity,
      district
    );

    // Prepare (x, y) coordinates for linear regression
    const xyPoints = historicalPoints.map((p) => ({ x: p.year, y: p.yieldMTPerHa }));
    const regression = this.computeLinearRegression(xyPoints);

    const targetYield = commodityMeta.projectClosureTargetYield || commodityMeta.nationalTarget2030Yield;
    const targetProd = commodityMeta.projectClosureTargetProduction || commodityMeta.nationalTarget2030Production;

    // Calculate regression trendline values for historical points
    const historicalWithTrend: DataPoint[] = historicalPoints.map((p) => {
      const fitted = +(regression.slope * p.year + regression.intercept).toFixed(2);
      const isBaseline = p.year === 2026;
      const hasDeficit = targetYield > 0 && p.yieldMTPerHa < targetYield;
      const deficitShortfallMT = isBaseline && hasDeficit ? +(targetYield - p.yieldMTPerHa).toFixed(2) : 0;
      const deficitPctOfTarget = isBaseline && hasDeficit && targetYield > 0 ? +((deficitShortfallMT / targetYield) * 100).toFixed(1) : 0;
      const productionShortfallMT = isBaseline && hasDeficit ? Math.round(deficitShortfallMT * p.harvestedAreaHa) : 0;
      const deficitGapRange: [number, number] | null = isBaseline
        ? (hasDeficit ? [p.yieldMTPerHa, targetYield] : [targetYield, targetYield])
        : null;

      return {
        ...p,
        regressionTrend: fitted,
        confidenceLower95: p.yieldMTPerHa,
        confidenceUpper95: p.yieldMTPerHa,
        deficitGapRange,
        deficitShortfallMT,
        deficitPctOfTarget,
        productionShortfallMT,
      };
    });

    // Determine scenario growth multipliers
    let yieldMultiplier = 1.0;
    let areaMultiplier = 1.0;

    switch (scenario) {
      case 'avdp_accelerated':
        // Policy / AVDP acceleration: improved seeds, IVS bunding, cocoa rejuvenation
        yieldMultiplier = 1.4;
        areaMultiplier = 1.15;
        break;
      case 'climate_risk':
        // Environmental headwind: monsoon shifts, pest stress
        yieldMultiplier = 0.55;
        areaMultiplier = 0.85;
        break;
      case 'baseline_ols':
      default:
        yieldMultiplier = 1.0;
        areaMultiplier = 1.0;
        break;
    }

    const baselinePoint = historicalPoints[historicalPoints.length - 1]; // 2026 (Project Baseline Anchor)
    const baselineYield = baselinePoint.yieldMTPerHa;
    const baselineArea = baselinePoint.harvestedAreaHa;

    // Constrain projection strictly to Project Closure (2027) or Adjusted Horizon (2028).
    // NEVER allow any projection year after 2028.
    const isClosureOnly = horizonYears === 1 || horizonYears === 2027;
    const futureYears: number[] = isClosureOnly ? [2027] : [2027, 2028];

    const n = xyPoints.length;
    const meanX = xyPoints.reduce((acc, p) => acc + p.x, 0) / n;
    const ssX = xyPoints.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0);
    // Student's t critical value for 95% CI (df = 6 -> ~2.447)
    const tCrit = 2.447;

    let previousYield = baselineYield;
    let previousArea = baselineArea;
    const projectedPoints: DataPoint[] = [];

    futureYears.forEach((year, idx) => {
      const yearOffset = idx + 1; // 1 (2027), 2 (2028)
      const baseGrowth = Math.max(0.005, regression.slope);
      const effectiveAnnualGrowth = baseGrowth * yieldMultiplier * customGrowthFactor;

      // Asymptotic frontier damping so yields don't exceed biological maxima
      const gapToFrontier = Math.max(0, frontierYield - previousYield);
      const dampingFactor = frontierYield > 0 ? Math.min(1, gapToFrontier / (frontierYield * 0.35 || 1)) : 1;

      // Point estimate
      let nextYield: number;
      if (scenario === 'baseline_ols' && customGrowthFactor === 1.0) {
        // Pure unconstrained OLS continuation with gentle frontier ceiling
        const rawOls = regression.slope * year + regression.intercept;
        nextYield = Math.min(frontierYield * 1.05, Math.max(0.1, rawOls));
      } else {
        nextYield = Math.min(
          frontierYield * 1.05,
          Math.max(0.1, previousYield + effectiveAnnualGrowth * dampingFactor)
        );
      }

      nextYield = +nextYield.toFixed(2);

      // Area growth projection
      const areaGrowthSlope = baselineArea * 0.015 * areaMultiplier;
      const nextArea = Math.round(previousArea + areaGrowthSlope);
      const nextProd = Math.round(nextYield * nextArea);

      // Standard error of prediction for year x_0:
      const leverage = ssX > 0 ? Math.pow(year - meanX, 2) / ssX : 0;
      const sePred = regression.stdError * Math.sqrt(1 + 1 / n + leverage);
      const marginOfError = +(tCrit * sePred).toFixed(2);

      const confidenceLower95 = Math.max(0.1, +(nextYield - marginOfError).toFixed(2));
      const confidenceUpper95 = Math.min(
        +(frontierYield * 1.1).toFixed(2),
        +(nextYield + marginOfError).toFixed(2)
      );

      const fittedTrend = +(regression.slope * year + regression.intercept).toFixed(2);
      const hasDeficit = targetYield > 0 && nextYield < targetYield;
      const deficitShortfallMT = hasDeficit ? +(targetYield - nextYield).toFixed(2) : 0;
      const deficitPctOfTarget = hasDeficit && targetYield > 0 ? +((deficitShortfallMT / targetYield) * 100).toFixed(1) : 0;
      const productionShortfallMT = hasDeficit ? Math.round(deficitShortfallMT * nextArea) : 0;
      const deficitGapRange: [number, number] | null = hasDeficit
        ? [nextYield, targetYield]
        : [targetYield, targetYield];

      projectedPoints.push({
        year,
        yieldMTPerHa: nextYield,
        productionMT: nextProd,
        harvestedAreaHa: nextArea,
        isProjected: true,
        confidenceLower95,
        confidenceUpper95,
        regressionTrend: fittedTrend,
        deficitGapRange,
        deficitShortfallMT,
        deficitPctOfTarget,
        productionShortfallMT,
      });

      previousYield = nextYield;
      previousArea = nextArea;
    });

    // Calculate metrics
    const endPoint = projectedPoints[projectedPoints.length - 1];
    const projectedEndYield = endPoint.yieldMTPerHa;
    const projectedEndYear = endPoint.year;
    const netYieldGainMT = +(projectedEndYield - baselineYield).toFixed(2);
    const percentageGain = +(((projectedEndYield - baselineYield) / (baselineYield || 1)) * 100).toFixed(1);

    const startHist = historicalPoints[0]; // 2019
    const historicalCagrPct = +this.computeCagr(
      startHist.yieldMTPerHa,
      baselineYield,
      baselinePoint.year - startHist.year
    ).toFixed(2);

    const projected5YrCagrPct = +this.computeCagr(
      baselineYield,
      projectedEndYield,
      futureYears.length
    ).toFixed(2);

    // Project Closure Point (2027)
    const pointClosure = projectedPoints.find((p) => p.year === 2027) || endPoint;
    const projectLifeCycleCagrPct = +this.computeCagr(
      startHist.yieldMTPerHa,
      pointClosure.yieldMTPerHa,
      8 // 2019 to 2027 = 8 years
    ).toFixed(2);

    const targetAttainmentPct = targetYield > 0
      ? +((pointClosure.yieldMTPerHa / targetYield) * 100).toFixed(1)
      : 100;

    // Project Closure Target Deficit Gap Analysis (2027)
    const deficitClosureYieldMT = targetYield > pointClosure.yieldMTPerHa
      ? +(targetYield - pointClosure.yieldMTPerHa).toFixed(2)
      : 0;
    const deficitClosurePct = targetYield > 0 && deficitClosureYieldMT > 0
      ? +((deficitClosureYieldMT / targetYield) * 100).toFixed(1)
      : 0;
    const productionShortfallClosureMT = deficitClosureYieldMT > 0
      ? Math.round(deficitClosureYieldMT * pointClosure.harvestedAreaHa)
      : 0;
    const isDeficitProjected = deficitClosureYieldMT > 0;

    const allPoints = [...historicalWithTrend, ...projectedPoints];

    return {
      commodity,
      commodityMeta,
      district,
      province,
      scenario,
      horizonYears: futureYears.length,
      historicalPoints: historicalWithTrend,
      projectedPoints,
      allPoints,
      regression,
      baselineYear: 2026,
      baselineYield,
      projectClosureYear: 2027,
      projectedEndYear,
      projectedEndYield,
      netYieldGainMT,
      percentageGain,
      historicalCagrPct,
      projected5YrCagrPct,
      projectLifeCycleCagrPct,
      frontierYield,
      targetAttainmentPct,
      projectClosureTargetYield: targetYield,
      projectClosureTargetProduction: targetProd,
      deficitClosureYieldMT,
      deficitClosurePct,
      productionShortfallClosureMT,
      isDeficitProjected,
      // Backward compatibility properties
      nationalTarget2030Yield: targetYield,
      nationalTarget2030Production: targetProd,
      deficit2030YieldMT: deficitClosureYieldMT,
      deficit2030Pct: deficitClosurePct,
      productionShortfall2030MT: productionShortfallClosureMT,
      isDeficitProjected2030: isDeficitProjected,
      growthFactor: customGrowthFactor,
      growthFactorPct: Math.round((customGrowthFactor - 1.0) * 100),
    };
  }

  /**
   * Compare all three commodities (Rice, Cocoa, Oil Palm) side-by-side
   * Returns normalized indexed performance (2027 extended baseline = 100)
   */
  static compareAllCommodities(
    district: string = 'National Aggregate',
    scenario: OutlookScenario = 'baseline_ols',
    customGrowthFactor: number = 1.0
  ) {
    const rice = this.run5YearOutlook('rice', district, scenario, 5, customGrowthFactor);
    const cocoa = this.run5YearOutlook('cocoa', district, scenario, 5, customGrowthFactor);
    const palm = this.run5YearOutlook('oil_palm', district, scenario, 5, customGrowthFactor);

    const years = rice.allPoints.map((p) => p.year);

    const indexedComparison = years.map((year) => {
      const rPt = rice.allPoints.find((p) => p.year === year)!;
      const cPt = cocoa.allPoints.find((p) => p.year === year)!;
      const pPt = palm.allPoints.find((p) => p.year === year)!;

      return {
        year,
        isProjected: year > 2027,
        riceYield: rPt.yieldMTPerHa,
        cocoaYield: cPt.yieldMTPerHa,
        palmYield: pPt.yieldMTPerHa,
        riceIndex: +((rPt.yieldMTPerHa / rice.baselineYield) * 100).toFixed(1),
        cocoaIndex: +((cPt.yieldMTPerHa / cocoa.baselineYield) * 100).toFixed(1),
        palmIndex: +((pPt.yieldMTPerHa / palm.baselineYield) * 100).toFixed(1),
      };
    });

    return {
      rice,
      cocoa,
      palm,
      indexedComparison,
    };
  }

  /**
   * Multi-Scenario Comparative Analysis for a single commodity & district
   * Models Baseline OLS, AVDP Accelerated, Climate Risk, and Sustainable Agroforestry
   */
  static compareScenarios(
    commodity: CommodityType,
    district: string = 'National Aggregate',
    customGrowthFactor: number = 1.0
  ): {
    scenarios: ScenarioComparisonItem[];
    chartOverlay: MultiScenarioChartPoint[];
    bestScenario: ScenarioComparisonItem;
    worstScenario: ScenarioComparisonItem;
    spreadMT: number;
  } {
    const baseline = this.run5YearOutlook(commodity, district, 'baseline_ols', 2, 1.0);
    const accelerated = this.run5YearOutlook(
      commodity,
      district,
      'avdp_accelerated',
      2,
      customGrowthFactor > 1.0 ? customGrowthFactor : 1.35
    );
    const climateRisk = this.run5YearOutlook(commodity, district, 'climate_risk', 2, 0.82);
    const agroforestry = this.run5YearOutlook(
      commodity,
      district,
      'avdp_accelerated',
      2,
      1.2
    );

    const targetYield = baseline.projectClosureTargetYield || baseline.nationalTarget2030Yield;

    const findClosurePt = (res: FiveYearOutlookResult) =>
      res.projectedPoints.find((p) => p.year === 2027) ||
      res.projectedPoints[0] ||
      res.historicalPoints[res.historicalPoints.length - 1];

    const ptBase = findClosurePt(baseline);
    const ptAcc = findClosurePt(accelerated);
    const ptClim = findClosurePt(climateRisk);
    const ptAgro = findClosurePt(agroforestry);

    const buildItem = (
      id: ScenarioComparisonItem['id'],
      name: string,
      description: string,
      badge: string,
      color: string,
      res: FiveYearOutlookResult,
      pt: DataPoint
    ): ScenarioComparisonItem => {
      const defYield = targetYield > pt.yieldMTPerHa ? +(targetYield - pt.yieldMTPerHa).toFixed(2) : 0;
      const defProd = defYield > 0 ? Math.round(defYield * pt.harvestedAreaHa) : 0;
      const isGoalMet = defYield === 0;
      const targetAttain = targetYield > 0 ? +((pt.yieldMTPerHa / targetYield) * 100).toFixed(1) : 100;
      const netGain = +(pt.yieldMTPerHa - res.baselineYield).toFixed(2);

      const breakEvenPt = res.projectedPoints.find((p) => p.yieldMTPerHa >= targetYield);

      return {
        id,
        name,
        description,
        badge,
        color,
        projected2030Yield: pt.yieldMTPerHa,
        projected2030ProductionMT: pt.productionMT,
        targetAttainment2030Pct: targetAttain,
        deficitYieldMT: defYield,
        productionShortfallMT: defProd,
        isGoalMet,
        fiveYearCagrPct: res.projected5YrCagrPct,
        netGainMT: netGain,
        breakEvenYear: breakEvenPt?.year,
      };
    };

    const scenarios: ScenarioComparisonItem[] = [
      buildItem(
        'baseline_ols',
        'Historical OLS Trend',
        'Unconstrained linear regression continuing 2019-2026 historical momentum without major policy shift.',
        'Current Trajectory',
        '#38bdf8', // sky-400
        baseline,
        ptBase
      ),
      buildItem(
        'avdp_accelerated',
        'AVDP Accelerated Inputs',
        'Aggressive expansion of certified hybrid seeds, fertilizer micro-dosing, and Farmer Field Schools.',
        'Recommended Path',
        '#10b981', // emerald-500
        accelerated,
        ptAcc
      ),
      buildItem(
        'climate_risk',
        'Climate Shock & Drought Stress',
        'Severe rainfall volatility, erratic monsoon onset, and heat stress without adaptation.',
        'Stress Scenario',
        '#f43f5e', // rose-500
        climateRisk,
        ptClim
      ),
      buildItem(
        'sustainable_agroforestry',
        'Agroforestry & Soil Regeneration',
        'Cover cropping, shade-tree cocoa/oil palm, and organic compost resilience with low capital intensity.',
        'Eco-Resilient',
        '#a855f7', // purple-500
        agroforestry,
        ptAgro
      ),
    ];

    // Build multi-scenario overlay chart data
    const chartOverlay: MultiScenarioChartPoint[] = baseline.allPoints.map((basePt) => {
      const yr = basePt.year;
      const accPt = accelerated.allPoints.find((p) => p.year === yr) || basePt;
      const climPt = climateRisk.allPoints.find((p) => p.year === yr) || basePt;
      const agroPt = agroforestry.allPoints.find((p) => p.year === yr) || basePt;

      return {
        year: yr,
        isProjected: yr > 2027,
        baselineOls: basePt.yieldMTPerHa,
        avdpAccelerated: accPt.yieldMTPerHa,
        climateRisk: climPt.yieldMTPerHa,
        sustainableAgroforestry: agroPt.yieldMTPerHa,
        nationalTarget2030: targetYield,
      };
    });

    const bestScenario = [...scenarios].sort((a, b) => b.projected2030Yield - a.projected2030Yield)[0];
    const worstScenario = [...scenarios].sort((a, b) => a.projected2030Yield - b.projected2030Yield)[0];
    const spreadMT = +(bestScenario.projected2030Yield - worstScenario.projected2030Yield).toFixed(2);

    return {
      scenarios,
      chartOverlay,
      bestScenario,
      worstScenario,
      spreadMT,
    };
  }

  /**
   * Crop Sensitivity Analysis
   * Tests sensitivity of 2030 yield to Fertilizer (NPK), Seed Certification, Rainfall, and Mechanization
   */
  static computeCropSensitivity(
    commodity: CommodityType,
    district: string = 'National Aggregate',
    leverAdjustments?: Record<string, number>
  ): CropSensitivityAnalysis {
    const outlook = this.run5YearOutlook(commodity, district, 'baseline_ols', 5, 1.0);
    const baselinePt = outlook.projectedPoints.find((p) => p.year === 2030) || outlook.projectedPoints[outlook.projectedPoints.length - 1];
    const baseline2030Yield = baselinePt.yieldMTPerHa;
    const nationalTarget2030Yield = outlook.nationalTarget2030Yield;
    const harvestedArea = baselinePt.harvestedAreaHa;

    // Commodity specific elasticity parameters
    const elasticityProfiles: Record<CommodityType, { fertilizer: number; seeds: number; rainfall: number; mechanization: number }> = {
      rice: { fertilizer: 0.35, seeds: 0.42, rainfall: 0.28, mechanization: 0.22 },
      cocoa: { fertilizer: 0.22, seeds: 0.38, rainfall: 0.32, mechanization: 0.15 },
      oil_palm: { fertilizer: 0.30, seeds: 0.34, rainfall: 0.25, mechanization: 0.26 },
    };

    const prof = elasticityProfiles[commodity] || elasticityProfiles.rice;

    // Levers definitions
    const defaultLevers: SensitivityLever[] = [
      {
        id: 'fertilizer_npk',
        name: 'NPK & Urea Soil Application',
        category: 'Input',
        unit: 'kg/ha',
        baselineValue: 35,
        currentValue: leverAdjustments?.fertilizer_npk ?? 35,
        min: 0,
        max: 150,
        step: 5,
        elasticity: prof.fertilizer,
        impactOnYieldMT: 0,
        impactOnProductionMT: 0,
        description: 'Micro-dosing inorganic and organic soil nutrient amendments to correct nitrogen/phosphorus depletion.',
      },
      {
        id: 'certified_seeds',
        name: 'Certified Hybrid Seed Adoption',
        category: 'Agronomy',
        unit: '% of farmers',
        baselineValue: 30,
        currentValue: leverAdjustments?.certified_seeds ?? 30,
        min: 10,
        max: 95,
        step: 5,
        elasticity: prof.seeds,
        impactOnYieldMT: 0,
        impactOnProductionMT: 0,
        description: 'Distribution of high-yielding NERICA rice, tenera oil palm clones, or grafted hybrid cocoa seedlings.',
      },
      {
        id: 'rainfall_anomaly',
        name: 'Precipitation / Irrigation Anomaly',
        category: 'Climate',
        unit: '% vs normal',
        baselineValue: 0,
        currentValue: leverAdjustments?.rainfall_anomaly ?? 0,
        min: -35,
        max: 35,
        step: 5,
        elasticity: prof.rainfall,
        impactOnYieldMT: 0,
        impactOnProductionMT: 0,
        description: 'Climate variation modeling seasonal drought deficits (-30%) or water-harvesting/IVS bunding surplus (+30%).',
      },
      {
        id: 'mechanization_access',
        name: 'Tractor Tillage & Harvester Access',
        category: 'Technology',
        unit: '% arable area',
        baselineValue: 15,
        currentValue: leverAdjustments?.mechanization_access ?? 15,
        min: 5,
        max: 80,
        step: 5,
        elasticity: prof.mechanization,
        impactOnYieldMT: 0,
        impactOnProductionMT: 0,
        description: 'Availability of power tillers, tractor hire services, and mechanical threshers to eliminate labor bottlenecks.',
      },
    ];

    // Compute marginal impacts
    let totalMarginalYieldMT = 0;

    const evaluatedLevers = defaultLevers.map((lev) => {
      let deltaRatio = 0;
      if (lev.unit === '% vs normal') {
        deltaRatio = (lev.currentValue - lev.baselineValue) / 100;
      } else if (lev.baselineValue > 0) {
        deltaRatio = (lev.currentValue - lev.baselineValue) / lev.baselineValue;
      }

      // Diminishing returns square root transformation
      const effectiveDelta = deltaRatio >= 0 ? Math.sqrt(deltaRatio + 1) - 1 : -Math.sqrt(Math.abs(deltaRatio) + 1) + 1;
      const yieldDeltaMT = +(baseline2030Yield * effectiveDelta * lev.elasticity).toFixed(3);
      const prodDeltaMT = Math.round(yieldDeltaMT * harvestedArea);

      totalMarginalYieldMT += yieldDeltaMT;

      return {
        ...lev,
        impactOnYieldMT: yieldDeltaMT,
        impactOnProductionMT: prodDeltaMT,
      };
    });

    const simulated2030Yield = Math.max(0.1, +(baseline2030Yield + totalMarginalYieldMT).toFixed(2));
    const baselineDeficit = Math.max(0, nationalTarget2030Yield - baseline2030Yield);
    const newDeficit = Math.max(0, nationalTarget2030Yield - simulated2030Yield);

    const gapClosedPct =
      baselineDeficit > 0
        ? Math.min(100, Math.max(0, +(((baselineDeficit - newDeficit) / baselineDeficit) * 100).toFixed(1)))
        : 100;

    const isDeficitEliminated = simulated2030Yield >= nationalTarget2030Yield;

    // Tornado analysis: test each lever at its low (-25%) and high (+25%) bound
    const tornadoData = evaluatedLevers.map((lev) => {
      const lowDeltaRatio = -0.35;
      const highDeltaRatio = 0.50;
      const lowYield = +(baseline2030Yield * (1 + lowDeltaRatio * lev.elasticity)).toFixed(2);
      const highYield = +(baseline2030Yield * (1 + highDeltaRatio * lev.elasticity)).toFixed(2);
      const swing = +(highYield - lowYield).toFixed(2);

      return {
        name: lev.name.split(' ')[0] + ' (' + lev.category + ')',
        lowImpact: lowYield,
        highImpact: highYield,
        baseline: baseline2030Yield,
        swing,
      };
    }).sort((a, b) => b.swing - a.swing);

    // Break-even recommendation
    let breakEvenRecommendation = '';
    if (isDeficitEliminated) {
      breakEvenRecommendation = `Current input configuration successfully closes 100% of the 2030 deficit gap, reaching ${simulated2030Yield} MT/Ha (Goal: ${nationalTarget2030Yield} MT/Ha).`;
    } else {
      const neededYieldMT = +(nationalTarget2030Yield - simulated2030Yield).toFixed(2);
      const neededSeedsPct = Math.min(85, Math.round(evaluatedLevers[1].currentValue + (neededYieldMT / (baseline2030Yield * evaluatedLevers[1].elasticity)) * 40));
      const neededFertilizer = Math.min(120, Math.round(evaluatedLevers[0].currentValue + (neededYieldMT / (baseline2030Yield * evaluatedLevers[0].elasticity)) * 30));
      breakEvenRecommendation = `To overcome remaining ${neededYieldMT} MT/Ha gap, prioritize increasing certified seed adoption to ${neededSeedsPct}% and NPK soil nutrition to ${neededFertilizer} kg/ha.`;
    }

    return {
      commodity,
      district,
      baseline2030Yield,
      simulated2030Yield,
      nationalTarget2030Yield,
      gapClosedPct,
      isDeficitEliminated,
      levers: evaluatedLevers,
      tornadoData,
      breakEvenRecommendation,
    };
  }

  /**
   * Generate clean CSV string formatted for Excel / agricultural databases
   */
  static generateCsv(outlook: FiveYearOutlookResult): string {
    const lines: string[] = [];
    lines.push(`"Sierra Leone AVDP - 5-Year Crop Yield Outlook Report"`);
    lines.push(`"Commodity","${outlook.commodityMeta.name}"`);
    lines.push(`"District","${outlook.district}"`);
    lines.push(`"Scenario","${outlook.scenario}"`);
    lines.push(`"Growth Factor","${outlook.growthFactor.toFixed(2)}x (${outlook.growthFactorPct >= 0 ? '+' : ''}${outlook.growthFactorPct}%)"`);
    lines.push(`"R-Squared (Model Fit)","${(outlook.regression.rSquared * 100).toFixed(1)}%"`);
    lines.push(`"National 2030 Goal","${outlook.nationalTarget2030Yield} ${outlook.commodityMeta.unitYield}"`);
    lines.push(`"Generated At","${new Date().toISOString()}"`);
    lines.push('');
    lines.push([
      'Year',
      'Classification',
      `Yield (${outlook.commodityMeta.unitYield})`,
      '95% CI Lower',
      '95% CI Upper',
      'Production (MT)',
      'Harvested Area (Ha)',
      'Linear Fit (MT/Ha)',
      '2030 Target (MT/Ha)',
      'Goal Deficit Gap (MT/Ha)',
      'Production Shortfall (MT)',
    ].map((c) => `"${c}"`).join(','));

    outlook.allPoints.forEach((p) => {
      lines.push([
        p.year,
        p.isProjected ? '5-Yr Projection' : 'Historical Empirical',
        p.yieldMTPerHa.toFixed(2),
        p.confidenceLower95 !== undefined ? p.confidenceLower95.toFixed(2) : 'N/A',
        p.confidenceUpper95 !== undefined ? p.confidenceUpper95.toFixed(2) : 'N/A',
        p.productionMT,
        p.harvestedAreaHa,
        p.regressionTrend !== undefined ? p.regressionTrend.toFixed(2) : 'N/A',
        outlook.nationalTarget2030Yield.toFixed(2),
        (p.deficitShortfallMT || 0).toFixed(2),
        p.productionShortfallMT || 0,
      ].map((c) => `"${c}"`).join(','));
    });

    return lines.join('\n');
  }

  /**
   * Generate structured JSON string
   */
  static generateJson(outlook: FiveYearOutlookResult): string {
    return JSON.stringify(
      {
        project: 'Sierra Leone Agriculture Value Chain Development Project (AVDP)',
        reportType: '5-Year Future Yield & Production Econometric Outlook',
        metadata: {
          commodity: outlook.commodityMeta.name,
          commodityDescription: outlook.commodityMeta.description,
          district: outlook.district,
          province: outlook.province,
          scenario: outlook.scenario,
          growthFactor: outlook.growthFactor,
          growthFactorPct: outlook.growthFactorPct,
          timestamp: new Date().toISOString(),
        },
        diagnostics: {
          equation: outlook.regression.equation,
          slopeMTPerYear: outlook.regression.slope,
          rSquared: outlook.regression.rSquared,
          adjustedRSquared: outlook.regression.adjRSquared,
          standardError: outlook.regression.stdError,
          tStatistic: outlook.regression.tStatistic,
          mapePercent: outlook.regression.mape,
          durbinWatson: outlook.regression.durbinWatson,
          confidenceScore: outlook.regression.confidenceScore,
          reliabilityRating: outlook.regression.reliabilityRating,
        },
        targets: {
          national2030YieldGoal: outlook.nationalTarget2030Yield,
          national2030ProductionGoalMT: outlook.nationalTarget2030Production,
          projected2030Yield: (outlook.projectedPoints.find((p) => p.year === 2030) || outlook.projectedPoints[outlook.projectedPoints.length - 1])?.yieldMTPerHa,
          deficit2030YieldMT: outlook.deficit2030YieldMT,
          deficit2030Percent: outlook.deficit2030Pct,
          productionShortfall2030MT: outlook.productionShortfall2030MT,
          isDeficitProjected: outlook.isDeficitProjected2030,
          targetAttainment2031Pct: outlook.targetAttainmentPct,
        },
        timeSeries: outlook.allPoints,
      },
      null,
      2
    );
  }

  /**
   * Browser file download helper
   */
  static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Compute multi-district predictive heatmap matrix for project lifecycle (2019-2027 / max 2028)
   */
  static computeDistrictHeatmap(
    commodity: CommodityType,
    scenario: OutlookScenario = 'baseline_ols',
    growthFactor: number = 1.0
  ): PredictiveHeatmapData {
    const meta = COMMODITY_METADATA[commodity];
    const seriesList = DISTRICT_CROP_SERIES.filter((s) => s.commodity === commodity);
    const targetClosure = meta.projectClosureTargetYield || meta.nationalTarget2030Yield;

    const rows: PredictiveHeatmapRow[] = [];
    let minYield = Infinity;
    let maxYield = -Infinity;

    // Helper to extract historical or projected year point
    const getPointYield = (res: FiveYearOutlookResult, yr: number, fallback: number = 0): number => {
      const found = res.allPoints.find((p) => p.year === yr);
      return found ? +found.yieldMTPerHa.toFixed(2) : fallback;
    };

    // Process National Aggregate first
    const natOutlook = FutureYieldRegressionService.run5YearOutlook(
      commodity,
      'National Aggregate',
      scenario,
      2, // Horizon up to 2028
      growthFactor
    );

    const natY19 = getPointYield(natOutlook, 2019, 1.0);
    const natY21 = getPointYield(natOutlook, 2021, natY19);
    const natY23 = getPointYield(natOutlook, 2023, natY21);
    const natY25 = getPointYield(natOutlook, 2025, natY23);
    const natB26 = +natOutlook.baselineYield.toFixed(2);
    const natY27 = getPointYield(natOutlook, 2027, natB26);
    const natY28 = getPointYield(natOutlook, 2028, natY27);

    const natAttainment = +((natY27 / targetClosure) * 100).toFixed(1);
    const natDeficit = +(Math.max(0, targetClosure - natY27)).toFixed(2);
    const natSurplus = +(Math.max(0, natY27 - targetClosure)).toFixed(2);
    const natCagrProject = +this.computeCagr(natY19, natY27, 8).toFixed(2);

    rows.push({
      district: 'National Aggregate',
      province: 'All Sierra Leone',
      primaryAgroZone: 'National Multi-Zone Synthesis',
      dominantIntervention: 'AVDP Integrated Nationwide Sector Portfolio',
      y2019: natY19,
      y2021: natY21,
      y2023: natY23,
      y2025: natY25,
      baseline2026: natB26,
      y2027: natY27,
      y2028: natY28,
      targetClosure,
      attainmentClosurePct: natAttainment,
      deficitClosureMT: natDeficit,
      surplusClosureMT: natSurplus,
      cagrProjectPct: natCagrProject,
      rSquared: +natOutlook.regression.rSquared.toFixed(3),
      status:
        natAttainment >= 100
          ? 'Surpassed'
          : natAttainment >= 85
          ? 'On Track'
          : natAttainment >= 70
          ? 'Moderate Risk'
          : 'High Deficit',
      // Backward compatibility
      baseline2027: natY27,
      y2029: natY28,
      y2030: natY27,
      y2031: natY28,
      y2032: natY28,
      target2030: targetClosure,
      attainment2030Pct: natAttainment,
      deficit2030MT: natDeficit,
      surplus2030MT: natSurplus,
      cagr5YrPct: natCagrProject,
    });

    // Process all individual districts
    seriesList.forEach((series) => {
      const distOutlook = FutureYieldRegressionService.run5YearOutlook(
        commodity,
        series.district,
        scenario,
        2,
        growthFactor
      );

      const y19 = getPointYield(distOutlook, 2019, 1.0);
      const y21 = getPointYield(distOutlook, 2021, y19);
      const y23 = getPointYield(distOutlook, 2023, y21);
      const y25 = getPointYield(distOutlook, 2025, y23);
      const b26 = +distOutlook.baselineYield.toFixed(2);
      const y27 = getPointYield(distOutlook, 2027, b26);
      const y28 = getPointYield(distOutlook, 2028, y27);

      const attainment = +((y27 / targetClosure) * 100).toFixed(1);
      const deficit = +(Math.max(0, targetClosure - y27)).toFixed(2);
      const surplus = +(Math.max(0, y27 - targetClosure)).toFixed(2);
      const cagrProject = +this.computeCagr(y19, y27, 8).toFixed(2);

      const allVals = [y19, y21, y23, y25, b26, y27, y28];
      allVals.forEach((v) => {
        if (v < minYield) minYield = v;
        if (v > maxYield) maxYield = v;
      });

      rows.push({
        district: series.district,
        province: series.province,
        primaryAgroZone: series.primaryAgroZone,
        dominantIntervention: series.dominantIntervention,
        y2019: y19,
        y2021: y21,
        y2023: y23,
        y2025: y25,
        baseline2026: b26,
        y2027: y27,
        y2028: y28,
        targetClosure,
        attainmentClosurePct: attainment,
        deficitClosureMT: deficit,
        surplusClosureMT: surplus,
        cagrProjectPct: cagrProject,
        rSquared: +distOutlook.regression.rSquared.toFixed(3),
        status:
          attainment >= 100
            ? 'Surpassed'
            : attainment >= 85
            ? 'On Track'
            : attainment >= 70
            ? 'Moderate Risk'
            : 'High Deficit',
        // Backward compatibility
        baseline2027: y27,
        y2029: y28,
        y2030: y27,
        y2031: y28,
        y2032: y28,
        target2030: targetClosure,
        attainment2030Pct: attainment,
        deficit2030MT: deficit,
        surplus2030MT: surplus,
        cagr5YrPct: cagrProject,
      });
    });

    if (minYield === Infinity) minYield = 0;
    if (maxYield === -Infinity) maxYield = targetClosure;

    const districtRows = rows.filter((r) => r.district !== 'National Aggregate');
    const avgAttainmentPct =
      districtRows.length > 0
        ? +(districtRows.reduce((acc, r) => acc + r.attainmentClosurePct, 0) / districtRows.length).toFixed(1)
        : natAttainment;

    const sortedByAttainment = [...districtRows].sort((a, b) => b.attainmentClosurePct - a.attainmentClosurePct);
    const topPerformingDistrict = sortedByAttainment[0]?.district ?? 'Port Loko';
    const mostVulnerableDistrict = sortedByAttainment[sortedByAttainment.length - 1]?.district ?? 'Falaba';

    return {
      commodity,
      commodityMeta: meta,
      scenario,
      growthFactor,
      rows,
      minYield,
      maxYield,
      avgAttainmentPct,
      topPerformingDistrict,
      mostVulnerableDistrict,
    };
  }

  /**
   * Compute trajectory milestone tracking against AVDP Project Closure benchmark (2027)
   */
  static computeTrajectoryTracking(
    commodity: CommodityType,
    district: string = 'National Aggregate',
    scenario: OutlookScenario = 'baseline_ols',
    growthFactor: number = 1.0
  ): TrajectoryTrackingResult {
    const outlook = FutureYieldRegressionService.run5YearOutlook(
      commodity,
      district,
      scenario,
      2, // Bounded at 2028
      growthFactor
    );

    const b26 = outlook.baselineYield; // 2026 project baseline
    const targetClosure = outlook.projectClosureTargetYield || outlook.nationalTarget2030Yield;
    const yearsToClosure = 1; // 2026 to 2027 (1 year to project closure)

    // Required annual velocity to reach closure target from 2026 baseline
    const requiredAnnualVelocityMT = +( (targetClosure - b26) / yearsToClosure ).toFixed(3);
    const historicalVelocityMT = +outlook.regression.slope.toFixed(3);

    // Projected velocity to 2027 under scenario
    const projected2027Point =
      outlook.projectedPoints.find((p) => p.year === 2027) ||
      outlook.projectedPoints[0];
    const projected27Yield = projected2027Point?.yieldMTPerHa ?? b26;
    const projectedAnnualVelocityMT = +( (projected27Yield - b26) / yearsToClosure ).toFixed(3);

    const velocityCoveragePct =
      requiredAnnualVelocityMT > 0
        ? +( (projectedAnnualVelocityMT / requiredAnnualVelocityMT) * 100 ).toFixed(1)
        : 100;

    let overallPacingStatus: TrajectoryTrackingResult['overallPacingStatus'] = 'On Track';
    if (velocityCoveragePct >= 105) overallPacingStatus = 'Ahead of Pace';
    else if (velocityCoveragePct >= 90) overallPacingStatus = 'On Track';
    else if (velocityCoveragePct >= 65) overallPacingStatus = 'At Risk';
    else overallPacingStatus = 'Critical Shortfall';

    // Build checkpoints strictly across project lifecycle: 2019, 2021, 2023, 2025, 2026, 2027, 2028
    const checkpoints: TrajectoryTrackingPoint[] = [];
    const checkpointYears = [2019, 2021, 2023, 2025, 2026, 2027, 2028];

    checkpointYears.forEach((yr) => {
      const isProjected = yr >= 2027;
      const pt = outlook.allPoints.find((p) => p.year === yr);
      const actualOrProjected = pt ? pt.yieldMTPerHa : (yr === 2027 ? projected27Yield : b26);

      // Linear required path targeting closure in 2027 and holding/consolidating in 2028
      let reqPath = b26;
      if (yr <= 2026) {
        reqPath = +(b26 - requiredAnnualVelocityMT * (2026 - yr) * 0.5).toFixed(2);
      } else if (yr === 2027) {
        reqPath = targetClosure;
      } else {
        reqPath = +(targetClosure + requiredAnnualVelocityMT * 0.15).toFixed(2);
      }

      const varianceMT = +(actualOrProjected - reqPath).toFixed(2);
      const variancePct = reqPath > 0 ? +((varianceMT / reqPath) * 100).toFixed(1) : 0;

      let status: TrajectoryTrackingPoint['status'] = 'On Track';
      if (variancePct >= 4) status = 'Ahead';
      else if (variancePct >= -4) status = 'On Track';
      else if (variancePct >= -12) status = 'At Risk';
      else status = 'Lagging';

      checkpoints.push({
        year: yr,
        isProjected,
        actualOrProjectedYield: actualOrProjected,
        requiredTargetPath: reqPath,
        varianceMT,
        variancePct,
        status,
      });
    });

    const milestoneGapClosureMT = +(Math.max(0, targetClosure - projected27Yield)).toFixed(2);
    const milestoneGapClosurePct = targetClosure > 0 ? +((milestoneGapClosureMT / targetClosure) * 100).toFixed(1) : 0;

    // Build combined chart data strictly from inception 2019 to max 2028
    const chartData = outlook.allPoints
      .filter((pt) => pt.year <= 2028)
      .map((pt) => {
        let reqPath = b26;
        if (pt.year <= 2026) {
          reqPath = +(b26 - requiredAnnualVelocityMT * (2026 - pt.year) * 0.5).toFixed(2);
        } else if (pt.year === 2027) {
          reqPath = targetClosure;
        } else {
          reqPath = +(targetClosure + requiredAnnualVelocityMT * 0.15).toFixed(2);
        }

        return {
          year: pt.year,
          empiricalYield: !pt.isProjected ? pt.yieldMTPerHa : undefined,
          projectedYield: pt.isProjected ? pt.yieldMTPerHa : undefined,
          requiredTargetPath: reqPath,
          confidenceLower95: pt.confidenceLower95,
          confidenceUpper95: pt.confidenceUpper95,
        };
      });

    return {
      commodity,
      commodityMeta: outlook.commodityMeta,
      district,
      scenario,
      growthFactor,
      baseline2027Yield: projected27Yield,
      baseline2026Yield: b26,
      target2030Yield: targetClosure,
      requiredAnnualVelocityMT,
      historicalVelocityMT,
      projectedAnnualVelocityMT,
      velocityCoveragePct,
      overallPacingStatus,
      checkpoints,
      milestoneGap2030MT: milestoneGapClosureMT,
      milestoneGap2030Pct: milestoneGapClosurePct,
      chartData,
    };
  }
}

