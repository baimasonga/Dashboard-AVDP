/**
 * Professional GIS & Statistical Analysis Engine for Sierra Leone AVDP
 * Author: Senior Data Analyst & GIS Lead
 *
 * Implements:
 * - 1D Fisher-Jenks Natural Breaks Optimization
 * - Quantile & Equal-Interval Choropleth Classifications
 * - Standardized Z-Score & Ranking Engine
 * - Parametric & Non-Parametric Summary Statistics
 * - Color Ramp Interpolations
 */

import { DistrictMetric } from '../types';
import { MapMetricType } from '../components/Map/SierraLeoneMap';

export type ClassificationMethod = 'jenks' | 'quantiles' | 'equal_interval' | 'standard_deviation';

export interface DescriptiveStats {
  count: number;
  min: number;
  max: number;
  sum: number;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  q1: number;
  q3: number;
  iqr: number;
}

export interface ClassBreakInterval {
  min: number;
  max: number;
  color: string;
  count: number;
  label: string;
}

export const COLOR_RAMPS = {
  emerald: {
    name: 'Emerald Agriculture (Rice / IVS)',
    colors: ['#d1fae5', '#6ee7b7', '#10b981', '#047857', '#064e3b'],
    darkColors: ['#064e3b', '#047857', '#059669', '#10b981', '#34d399'],
  },
  forest: {
    name: 'Forest Oil Palm (CPO Mills)',
    colors: ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'],
    darkColors: ['#14532d', '#166534', '#15803d', '#22c55e', '#4ade80'],
  },
  amber: {
    name: 'Cocoa Gold (Export Grade 1)',
    colors: ['#fef3c7', '#fcd34d', '#f59e0b', '#b45309', '#78350f'],
    darkColors: ['#78350f', '#92400e', '#b45309', '#f59e0b', '#fbbf24'],
  },
  cyan: {
    name: 'Teal Cyan (Vegetables & Irrigation)',
    colors: ['#cffafe', '#67e8f9', '#06b6d4', '#0e7490', '#164e63'],
    darkColors: ['#164e63', '#155e75', '#0891b2', '#06b6d4', '#22d3ee'],
  },
  sky: {
    name: 'Sky Blue (M&E Logframe Rate)',
    colors: ['#e0f2fe', '#7dd3fc', '#0284c7', '#0369a1', '#0c4a6e'],
    darkColors: ['#0c4a6e', '#075985', '#0284c7', '#0ea5e9', '#38bdf8'],
  },
  amber_purple: {
    name: 'Outreach & Households (Purple)',
    colors: ['#f3e8ff', '#d8b4fe', '#a855f7', '#7e22ce', '#3b0764'],
    darkColors: ['#3b0764', '#581c87', '#7e22ce', '#a855f7', '#c084fc'],
  },
  spectral: {
    name: 'Risk & Divergent Scale',
    colors: ['#fee2e2', '#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'],
    darkColors: ['#7f1d1d', '#991b1b', '#dc2626', '#ef4444', '#f87171'],
  },
};

export class GisStatisticalService {
  /**
   * Extract raw numeric values for a specific metric across districts
   */
  static getMetricValue(d: DistrictMetric, metric: MapMetricType): number {
    switch (metric) {
      case 'rice_yield':
        return d.riceYieldMTPerHa;
      case 'oil_palm':
        return d.oilPalmYieldMT;
      case 'cocoa':
        return d.cocoaProductionMT;
      case 'vegetables':
        return d.vegetablesYieldMT ?? 0;
      case 'ivs_ha':
        return d.ivsDevelopedHa ?? 0;
      case 'cassava_yield':
        return d.cassavaYieldMTPerHa;
      case 'beneficiaries':
        return d.beneficiaryHouseholds;
      case 'me_completion':
        return d.meCompletionRate;
      case 'processing':
        return d.activeProcessingMills;
      default:
        return d.beneficiaryHouseholds;
    }
  }

  /**
   * Format metric values with engineering and metric units
   */
  static formatMetricValue(val: number, metric: MapMetricType): string {
    switch (metric) {
      case 'rice_yield':
      case 'cassava_yield':
        return `${val.toFixed(2)} MT/Ha`;
      case 'oil_palm':
      case 'cocoa':
      case 'vegetables':
        return `${Math.round(val).toLocaleString()} MT`;
      case 'ivs_ha':
        return `${Math.round(val).toLocaleString()} Ha`;
      case 'beneficiaries':
        return `${Math.round(val).toLocaleString()} HH`;
      case 'me_completion':
        return `${val.toFixed(1)}%`;
      case 'processing':
        return `${Math.round(val)} Hubs`;
      default:
        return val.toLocaleString();
    }
  }

  /**
   * Calculate descriptive statistics
   */
  static calculateStats(values: number[]): DescriptiveStats {
    if (!values.length) {
      return {
        count: 0,
        min: 0,
        max: 0,
        sum: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        variance: 0,
        q1: 0,
        q3: 0,
        iqr: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;

    // Median
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Quartiles
    const q1 = sorted[Math.floor(count * 0.25)];
    const q3 = sorted[Math.floor(count * 0.75)];
    const iqr = q3 - q1;

    // Variance & Standard Deviation
    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      min,
      max,
      sum,
      mean,
      median,
      stdDev,
      variance,
      q1,
      q3,
      iqr,
    };
  }

  /**
   * Fisher-Jenks Natural Breaks 1D Clustering Algorithm
   */
  static jenksBreaks(data: number[], nClasses: number): number[] {
    if (data.length <= nClasses) {
      return [...new Set(data)].sort((a, b) => a - b);
    }

    const sorted = [...data].sort((a, b) => a - b);
    const numData = sorted.length;

    // Matrices
    const mat1: number[][] = Array.from({ length: numData + 1 }, () =>
      Array(nClasses + 1).fill(0)
    );
    const mat2: number[][] = Array.from({ length: numData + 1 }, () =>
      Array(nClasses + 1).fill(0)
    );

    for (let y = 1; y <= nClasses; y++) {
      mat1[0][y] = 1;
      mat2[0][y] = 0;
      for (let t = 1; t <= numData; t++) {
        mat2[t][y] = Infinity;
      }
    }

    let v = 0;
    for (let l = 2; l <= numData; l++) {
      let s1 = 0;
      let s2 = 0;
      let w = 0;
      for (let m = 1; m <= l; m++) {
        const i3 = l - m + 1;
        const val = sorted[i3 - 1];
        s2 += val * val;
        s1 += val;
        w++;
        v = s2 - (s1 * s1) / w;
        const i4 = i3 - 1;
        if (i4 !== 0) {
          for (let p = 2; p <= nClasses; p++) {
            if (mat2[l][p] >= v + mat2[i4][p - 1]) {
              mat1[l][p] = i3;
              mat2[l][p] = v + mat2[i4][p - 1];
            }
          }
        }
      }
      mat1[l][1] = 1;
      mat2[l][1] = v;
    }

    let k = numData;
    const kclass: number[] = Array(nClasses + 1).fill(0);
    kclass[nClasses] = sorted[numData - 1];
    kclass[0] = sorted[0];

    for (let count = nClasses; count >= 2; count--) {
      const id = parseInt(mat1[k][count].toString(), 10) - 2;
      if (id >= 0 && id < numData) {
        kclass[count - 1] = sorted[id];
        k = parseInt(mat1[k][count].toString(), 10) - 1;
      }
    }

    return [...new Set(kclass)].sort((a, b) => a - b);
  }

  /**
   * Quantile (Equal Frequency) Classification
   */
  static quantileBreaks(data: number[], nClasses: number): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const breaks: number[] = [sorted[0]];

    for (let i = 1; i < nClasses; i++) {
      const idx = Math.floor((i / nClasses) * sorted.length);
      breaks.push(sorted[idx]);
    }
    breaks.push(sorted[sorted.length - 1]);
    return [...new Set(breaks)].sort((a, b) => a - b);
  }

  /**
   * Equal Interval Classification
   */
  static equalIntervalBreaks(data: number[], nClasses: number): number[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / nClasses;

    const breaks: number[] = [];
    for (let i = 0; i <= nClasses; i++) {
      breaks.push(min + step * i);
    }
    return breaks;
  }

  /**
   * Compute classification breaks based on selected statistical method
   */
  static computeBreaks(
    data: number[],
    method: ClassificationMethod,
    nClasses: number = 5
  ): number[] {
    if (!data.length) return [0, 1];
    const uniqueVals = [...new Set(data)];
    if (uniqueVals.length <= 2) {
      return [Math.min(...data), Math.max(...data)];
    }

    switch (method) {
      case 'jenks':
        return this.jenksBreaks(data, nClasses);
      case 'quantiles':
        return this.quantileBreaks(data, nClasses);
      case 'equal_interval':
      default:
        return this.equalIntervalBreaks(data, nClasses);
    }
  }

  /**
   * Generate intervals for legend display with counts & styling
   */
  static buildClassIntervals(
    breaks: number[],
    allValues: number[],
    palette: string[],
    metric: MapMetricType
  ): ClassBreakInterval[] {
    const intervals: ClassBreakInterval[] = [];
    if (breaks.length < 2) return intervals;

    for (let i = 0; i < breaks.length - 1; i++) {
      const lower = breaks[i];
      const upper = breaks[i + 1];
      const color = palette[Math.min(i, palette.length - 1)];

      // Count how many values fall in this interval
      const inRange = allValues.filter((v) => {
        if (i === breaks.length - 2) {
          return v >= lower && v <= upper;
        }
        return v >= lower && v < upper;
      });

      const label = `${this.formatMetricValue(lower, metric)} – ${this.formatMetricValue(
        upper,
        metric
      )}`;

      intervals.push({
        min: lower,
        max: upper,
        color,
        count: inRange.length,
        label,
      });
    }

    return intervals;
  }

  /**
   * Find polygon color for a given district value
   */
  static getColor(value: number, breaks: number[], palette: string[]): string {
    if (breaks.length < 2) return palette[palette.length - 1];

    for (let i = 0; i < breaks.length - 1; i++) {
      if (value <= breaks[i + 1]) {
        return palette[Math.min(i, palette.length - 1)];
      }
    }
    return palette[palette.length - 1];
  }

  /**
   * Calculate district scorecard & statistical ranking
   */
  static getDistrictScorecard(
    district: DistrictMetric,
    allDistricts: DistrictMetric[],
    metric: MapMetricType
  ) {
    const currentVal = this.getMetricValue(district, metric);
    const allVals = allDistricts.map((d) => this.getMetricValue(d, metric));
    const stats = this.calculateStats(allVals);

    // Rank: 1 is top
    const sorted = [...allVals].sort((a, b) => b - a);
    const rank = sorted.indexOf(currentVal) + 1;

    // Z-Score
    const zScore = stats.stdDev > 0 ? (currentVal - stats.mean) / stats.stdDev : 0;

    // % of national average
    const pctOfMean = stats.mean > 0 ? (currentVal / stats.mean) * 100 : 100;

    // National Contribution (%)
    const pctOfTotal = stats.sum > 0 ? (currentVal / stats.sum) * 100 : 0;

    return {
      value: currentVal,
      formattedValue: this.formatMetricValue(currentVal, metric),
      rank,
      totalDistricts: allDistricts.length,
      zScore,
      pctOfMean,
      pctOfTotal,
      stats,
    };
  }

  /**
   * Export district data enriched with GeoJSON properties
   */
  static generateEnrichedGeoJson(baseGeoJson: any, districts: DistrictMetric[]) {
    const districtMap = new Map<string, DistrictMetric>();
    districts.forEach((d) => districtMap.set(d.name.toLowerCase().trim(), d));

    const enriched = JSON.parse(JSON.stringify(baseGeoJson));
    enriched.features = enriched.features.map((feat: any) => {
      const name = feat.properties.name.toLowerCase().trim();
      const match = districtMap.get(name);
      if (match) {
        feat.properties = {
          ...feat.properties,
          ...match,
          avdp_rice_yield: match.riceYieldMTPerHa,
          avdp_oil_palm_mt: match.oilPalmYieldMT,
          avdp_cocoa_mt: match.cocoaProductionMT,
          avdp_vegetables_mt: match.vegetablesYieldMT,
          avdp_ivs_ha: match.ivsDevelopedHa,
          avdp_beneficiaries: match.beneficiaryHouseholds,
          avdp_fbo_count: match.fboCount,
          avdp_me_rate: match.meCompletionRate,
          avdp_feeder_roads_km: match.feederRoadsRehabKm,
          avdp_processing_mills: match.activeProcessingMills,
        };
      }
      return feat;
    });

    return enriched;
  }
}
