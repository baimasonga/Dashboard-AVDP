/**
 * Multi-Year Trend Analysis & Predictive Forecasting Service
 * AVDP Agro-Analytics & Geospatial Intelligence
 *
 * Implements:
 * - Ordinary Least Squares (OLS) Linear Regression with asymptotic capacity frontier
 * - Three Predictive Scenarios:
 *     1. AVDP Accelerated (Climate-Smart Target)
 *     2. Baseline Historical (OLS Continuation)
 *     3. Climate Risk (Monsoon Variability & Pest Shocks)
 * - 95% Confidence Prediction Intervals
 * - Compound Annual Growth Rate (CAGR) Engine
 * - Yield Gap Assessment relative to agro-ecological potential
 */

import {
  CommodityType,
  ProjectionScenario,
  AnnualCropData,
  DistrictCropSeries,
  DISTRICT_CROP_SERIES,
  COMMODITY_METADATA,
} from '../data/cropTrendData';

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  stdError: number;
}

export interface ProjectedPoint extends AnnualCropData {
  confidenceLower95: number;
  confidenceUpper95: number;
  yieldGapPct: number; // Current/Projected yield as % of agro-ecological frontier
}

export interface DistrictForecastResult {
  district: string;
  province: string;
  commodity: CommodityType;
  scenario: ProjectionScenario;
  potentialFrontierYield: number;
  primaryAgroZone: string;
  dominantIntervention: string;
  timeline: ProjectedPoint[]; // 2019 - 2027/2028 (inception to closure 2019-2027 + adjusted horizon 2028)
  regression: LinearRegressionResult;
  historicalCagrPct: number; // 2019 -> 2026 Empirical Monitoring
  projectedCagrPct: number; // 2026 -> 2027 Project Closure Target Pacing
  overallCagrPct: number; // 2019 -> 2027 Full Project Lifecycle CAGR
  netProductionGainMT: number; // 2027 Closure vs 2026 Baseline
  yieldChangePct: number; // ((2027 - 2026) / 2026) * 100
}

export interface NationalCropSummary {
  commodity: CommodityType;
  scenario: ProjectionScenario;
  year: number;
  isProjected: boolean;
  totalProductionMT: number;
  averageYieldMTPerHa: number;
  totalHarvestedAreaHa: number;
  topProducingDistricts: { district: string; productionMT: number; yieldMTPerHa: number }[];
  highestYieldDistricts: { district: string; yieldMTPerHa: number }[];
  highestGrowthDistricts: { district: string; projectedCagrPct: number }[];
  nationalYieldGapPct: number;
  nationalTarget2030AttainmentPct: number;
}

export class CropTrendForecastService {
  /**
   * Ordinary Least Squares (OLS) linear regression
   */
  static calculateLinearRegression(points: { x: number; y: number }[]): LinearRegressionResult {
    const n = points.length;
    if (n < 2) {
      return { slope: 0, intercept: points[0]?.y ?? 0, rSquared: 0, stdError: 0 };
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

    // Calculate R² and standard error
    let ssTot = 0;
    let ssRes = 0;
    for (const p of points) {
      const predY = slope * p.x + intercept;
      ssTot += Math.pow(p.y - meanY, 2);
      ssRes += Math.pow(p.y - predY, 2);
    }

    const rSquared = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));
    const stdError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

    return { slope, intercept, rSquared, stdError };
  }

  /**
   * Calculate Compound Annual Growth Rate (CAGR)
   */
  static calculateCagr(startVal: number, endVal: number, years: number): number {
    if (startVal <= 0 || endVal <= 0 || years <= 0) return 0;
    return (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
  }

  /**
   * Generate Multi-Year Forecast for a specific district and commodity
   * Strictly bounded to inception (2019) through project closure (2027),
   * with max adjusted horizon to 2028 (never after 2028).
   */
  static generateDistrictForecast(
    districtSeries: DistrictCropSeries,
    scenario: ProjectionScenario = 'avdp_accelerated'
  ): DistrictForecastResult {
    const allKnown = [
      ...districtSeries.history,
      districtSeries.baseline2026,
    ].filter(Boolean);
    const yieldPoints = allKnown.map((d) => ({ x: d.year, y: d.yieldMTPerHa }));
    const areaPoints = allKnown.map((d) => ({ x: d.year, y: d.harvestedAreaHa }));

    const yieldReg = this.calculateLinearRegression(yieldPoints);
    const areaReg = this.calculateLinearRegression(areaPoints);

    // Scenario coefficients
    let scenarioYieldMultiplier = 1.0;
    let scenarioAreaMultiplier = 1.0;

    switch (scenario) {
      case 'avdp_accelerated':
        // Accelerate yield growth via AVDP inputs (IVS, Tenera seedlings, cocoa rejuvenation)
        scenarioYieldMultiplier = 1.45;
        scenarioAreaMultiplier = 1.2;
        break;
      case 'climate_risk':
        // Moderate drag due to climate variability, dry spells, flood events
        scenarioYieldMultiplier = 0.45;
        scenarioAreaMultiplier = 0.8;
        break;
      case 'baseline':
      default:
        scenarioYieldMultiplier = 1.0;
        scenarioAreaMultiplier = 1.0;
        break;
    }

    // Future years strictly: 2027 (Project Closure) and 2028 (Max Adjusted Horizon)
    const futureYears = [2027, 2028];
    const timeline: ProjectedPoint[] = [];

    // 1. Add historical empirical monitoring points (2019-2026)
    allKnown.forEach((pt) => {
      const yieldGapPct =
        districtSeries.potentialFrontierYield > 0
          ? Math.min(100, (pt.yieldMTPerHa / districtSeries.potentialFrontierYield) * 100)
          : 0;

      timeline.push({
        ...pt,
        confidenceLower95: pt.yieldMTPerHa,
        confidenceUpper95: pt.yieldMTPerHa,
        yieldGapPct,
      });
    });

    // 2. Generate future projected points (2027-2028) from 2026 baseline
    const baselineAnchor = districtSeries.baseline2026;
    let lastYield = baselineAnchor.yieldMTPerHa;
    let lastArea = baselineAnchor.harvestedAreaHa;

    futureYears.forEach((year, index) => {
      const yearOffset = index + 1; // 1 (2027), 2 (2028)
      const baseSlope = Math.max(0.01, yieldReg.slope);
      const effectiveYieldGrowth = baseSlope * scenarioYieldMultiplier;

      // Diminishing returns ceiling as yield approaches agro-ecological potential
      const gapToFrontier = Math.max(0, districtSeries.potentialFrontierYield - lastYield);
      const dampingFactor = Math.min(1, gapToFrontier / (districtSeries.potentialFrontierYield * 0.4 || 1));

      const nextYield = Math.min(
        districtSeries.potentialFrontierYield,
        lastYield + effectiveYieldGrowth * dampingFactor
      );

      const baseAreaGrowth = Math.max(50, areaReg.slope);
      const nextArea = lastArea + baseAreaGrowth * scenarioAreaMultiplier;
      const nextProduction = Math.round(nextYield * nextArea);

      // 95% Confidence bounds widening with future horizon
      const confidenceMargin =
        (yieldReg.stdError || 0.15) * 1.96 * Math.sqrt(1 + yearOffset * 0.25);
      const confidenceLower95 = Math.max(0, +(nextYield - confidenceMargin).toFixed(2));
      const confidenceUpper95 = Math.min(
        districtSeries.potentialFrontierYield * 1.05,
        +(nextYield + confidenceMargin).toFixed(2)
      );

      const yieldGapPct =
        districtSeries.potentialFrontierYield > 0
          ? Math.min(100, (nextYield / districtSeries.potentialFrontierYield) * 100)
          : 0;

      timeline.push({
        year,
        yieldMTPerHa: +nextYield.toFixed(2),
        productionMT: nextProduction,
        harvestedAreaHa: Math.round(nextArea),
        isProjected: true,
        confidenceLower95,
        confidenceUpper95,
        yieldGapPct: +yieldGapPct.toFixed(1),
      });

      lastYield = nextYield;
      lastArea = nextArea;
    });

    // Compute CAGRs
    const val2019 = timeline.find((t) => t.year === 2019)?.yieldMTPerHa || 1;
    const val2026 = timeline.find((t) => t.year === 2026)?.yieldMTPerHa || lastYield;
    const val2027 = timeline.find((t) => t.year === 2027)?.yieldMTPerHa || lastYield;

    const prod2026 = timeline.find((t) => t.year === 2026)?.productionMT || 0;
    const prod2027 = timeline.find((t) => t.year === 2027)?.productionMT || 0;

    const historicalCagrPct = +this.calculateCagr(val2019, val2026, 7).toFixed(2);
    const projectedCagrPct = +this.calculateCagr(val2026, val2027, 1).toFixed(2);
    const overallCagrPct = +this.calculateCagr(val2019, val2027, 8).toFixed(2);
    const netProductionGainMT = prod2027 - prod2026;
    const yieldChangePct = +(((val2027 - val2026) / (val2026 || 1)) * 100).toFixed(1);

    return {
      district: districtSeries.district,
      province: districtSeries.province,
      commodity: districtSeries.commodity,
      scenario,
      potentialFrontierYield: districtSeries.potentialFrontierYield,
      primaryAgroZone: districtSeries.primaryAgroZone,
      dominantIntervention: districtSeries.dominantIntervention,
      timeline,
      regression: yieldReg,
      historicalCagrPct,
      projectedCagrPct,
      overallCagrPct,
      netProductionGainMT,
      yieldChangePct,
    };
  }

  /**
   * Get forecasts for all 16 districts for a given commodity and scenario
   */
  static getAllDistrictForecasts(
    commodity: CommodityType,
    scenario: ProjectionScenario = 'avdp_accelerated'
  ): DistrictForecastResult[] {
    const seriesList = DISTRICT_CROP_SERIES.filter((s) => s.commodity === commodity);
    return seriesList.map((series) => this.generateDistrictForecast(series, scenario));
  }

  /**
   * Get single district forecast
   */
  static getDistrictForecast(
    districtName: string,
    commodity: CommodityType,
    scenario: ProjectionScenario = 'avdp_accelerated'
  ): DistrictForecastResult | null {
    const series = DISTRICT_CROP_SERIES.find(
      (s) =>
        s.commodity === commodity &&
        s.district.toLowerCase().trim() === districtName.toLowerCase().trim()
    );
    if (!series) return null;
    return this.generateDistrictForecast(series, scenario);
  }

  /**
   * Extract choropleth map value for a specific district, year, commodity, and metric mode
   */
  static getMapFeatureValue(
    districtName: string,
    commodity: CommodityType,
    year: number,
    scenario: ProjectionScenario,
    metricSubtype: 'yield' | 'production' | 'projected_cagr' | 'yield_gap'
  ): { value: number; formatted: string; isProjected: boolean } {
    const forecast = this.getDistrictForecast(districtName, commodity, scenario);
    if (!forecast) {
      return { value: 0, formatted: 'N/A', isProjected: false };
    }

    const point = forecast.timeline.find((t) => t.year === year) || forecast.timeline[forecast.timeline.length - 1];
    const isProjected = point.isProjected;
    const meta = COMMODITY_METADATA[commodity];

    switch (metricSubtype) {
      case 'yield':
        return {
          value: point.yieldMTPerHa,
          formatted: `${point.yieldMTPerHa.toFixed(2)} ${meta.unitYield}`,
          isProjected,
        };
      case 'production':
        return {
          value: point.productionMT,
          formatted: `${Math.round(point.productionMT).toLocaleString()} ${meta.unitProd}`,
          isProjected,
        };
      case 'projected_cagr':
        return {
          value: forecast.projectedCagrPct,
          formatted: `${forecast.projectedCagrPct >= 0 ? '+' : ''}${forecast.projectedCagrPct.toFixed(1)}% / yr`,
          isProjected: true,
        };
      case 'yield_gap':
        return {
          value: point.yieldGapPct,
          formatted: `${point.yieldGapPct.toFixed(1)}% of potential`,
          isProjected,
        };
      default:
        return {
          value: point.yieldMTPerHa,
          formatted: `${point.yieldMTPerHa.toFixed(2)} ${meta.unitYield}`,
          isProjected,
        };
    }
  }

  /**
   * Get National Aggregate Summary for a selected year & scenario
   */
  static getNationalSummary(
    commodity: CommodityType,
    scenario: ProjectionScenario,
    year: number
  ): NationalCropSummary {
    const forecasts = this.getAllDistrictForecasts(commodity, scenario);
    const meta = COMMODITY_METADATA[commodity];

    let totalProductionMT = 0;
    let totalHarvestedAreaHa = 0;
    let weightedYieldSum = 0;
    let totalFrontierYield = 0;
    let isProjected = year > 2026;

    const districtYearStats: {
      district: string;
      productionMT: number;
      yieldMTPerHa: number;
      projectedCagrPct: number;
    }[] = [];

    forecasts.forEach((f) => {
      const pt = f.timeline.find((t) => t.year === year) || f.timeline[f.timeline.length - 1];
      totalProductionMT += pt.productionMT;
      totalHarvestedAreaHa += pt.harvestedAreaHa;
      weightedYieldSum += pt.yieldMTPerHa * pt.harvestedAreaHa;
      totalFrontierYield += f.potentialFrontierYield;

      districtYearStats.push({
        district: f.district,
        productionMT: pt.productionMT,
        yieldMTPerHa: pt.yieldMTPerHa,
        projectedCagrPct: f.projectedCagrPct,
      });
    });

    const averageYieldMTPerHa =
      totalHarvestedAreaHa > 0 ? +(weightedYieldSum / totalHarvestedAreaHa).toFixed(2) : 0;

    const topProducingDistricts = [...districtYearStats]
      .sort((a, b) => b.productionMT - a.productionMT)
      .slice(0, 4);

    const highestYieldDistricts = [...districtYearStats]
      .sort((a, b) => b.yieldMTPerHa - a.yieldMTPerHa)
      .slice(0, 4);

    const highestGrowthDistricts = [...districtYearStats]
      .sort((a, b) => b.projectedCagrPct - a.projectedCagrPct)
      .slice(0, 4);

    const avgFrontier = totalFrontierYield / (forecasts.length || 1);
    const nationalYieldGapPct =
      avgFrontier > 0 ? Math.min(100, +((averageYieldMTPerHa / avgFrontier) * 100).toFixed(1)) : 0;

    const nationalTarget2030AttainmentPct =
      meta.nationalTarget2030Production > 0
        ? Math.min(150, +((totalProductionMT / meta.nationalTarget2030Production) * 100).toFixed(1))
        : 100;

    return {
      commodity,
      scenario,
      year,
      isProjected,
      totalProductionMT,
      averageYieldMTPerHa,
      totalHarvestedAreaHa,
      topProducingDistricts,
      highestYieldDistricts,
      highestGrowthDistricts,
      nationalYieldGapPct,
      nationalTarget2030AttainmentPct,
    };
  }

  /**
   * Format any trend metric value
   */
  static formatMetric(
    val: number,
    commodity: CommodityType,
    metricSubtype: 'yield' | 'production' | 'projected_cagr' | 'yield_gap'
  ): string {
    const meta = COMMODITY_METADATA[commodity];
    switch (metricSubtype) {
      case 'yield':
        return `${val.toFixed(2)} ${meta.unitYield}`;
      case 'production':
        return `${Math.round(val).toLocaleString()} ${meta.unitProd}`;
      case 'projected_cagr':
        return `${val >= 0 ? '+' : ''}${val.toFixed(1)}% / yr`;
      case 'yield_gap':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  }
}
