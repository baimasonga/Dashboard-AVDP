// Sierra Leone Agricultural Data Validation & Cleaning Service

export type DataErrorType =
  | 'missing'
  | 'district_mismatch'
  | 'format_inconsistency'
  | 'outlier'
  | 'type_mismatch';

export interface CellError {
  rowIndex: number;
  column: string;
  originalValue: any;
  errorType: DataErrorType;
  message: string;
  suggestedValue?: any;
  severity: 'error' | 'warning';
}

export interface ColumnValidationSummary {
  column: string;
  totalValues: number;
  missingCount: number;
  outlierCount: number;
  formatIssueCount: number;
  detectedType: 'numeric' | 'text' | 'district' | 'date';
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  distinctCount: number;
}

export interface ValidationReport {
  totalRows: number;
  totalColumns: number;
  healthScore: number; // 0 - 100
  errorCount: number;
  warningCount: number;
  missingCount: number;
  outlierCount: number;
  formatIssueCount: number;
  cellErrors: CellError[];
  columnSummaries: Record<string, ColumnValidationSummary>;
  duplicateRowCount: number;
}

export interface AutoCleanOptions {
  normalizeDistricts?: boolean;
  trimAndTitleCase?: boolean;
  parseNumericStrings?: boolean;
  imputeMissingNumeric?: 'median' | 'mean' | 'zero' | 'none';
  imputeMissingText?: 'mode' | 'unknown' | 'none';
  handleOutliers?: 'cap_iqr' | 'replace_median' | 'none';
  removeDuplicates?: boolean;
}

// 16 Official Sierra Leone Districts
export const SIERRA_LEONE_OFFICIAL_DISTRICTS = [
  'Bo',
  'Bombali',
  'Bonthe',
  'Falaba',
  'Kailahun',
  'Kambia',
  'Karene',
  'Kenema',
  'Koinadugu',
  'Kono',
  'Moyamba',
  'Port Loko',
  'Pujehun',
  'Tonkolili',
  'Western Area Rural',
  'Western Area Urban',
];

// District typo and alias dictionary for Sierra Leone
const DISTRICT_ALIASES: Record<string, string> = {
  bo: 'Bo',
  'bo district': 'Bo',
  'bo dist': 'Bo',
  bombali: 'Bombali',
  'bombali district': 'Bombali',
  'bombali dist': 'Bombali',
  makeni: 'Bombali',
  bonthe: 'Bonthe',
  'bonthe district': 'Bonthe',
  'bonthe dist': 'Bonthe',
  sherbro: 'Bonthe',
  falaba: 'Falaba',
  'falaba district': 'Falaba',
  mongor: 'Falaba',
  kailahun: 'Kailahun',
  'kailahun district': 'Kailahun',
  'kailahun dist': 'Kailahun',
  luawa: 'Kailahun',
  kambia: 'Kambia',
  'kambia district': 'Kambia',
  'kambia dist': 'Kambia',
  karene: 'Karene',
  'karene district': 'Karene',
  kamaranka: 'Karene',
  kenema: 'Kenema',
  'kenema district': 'Kenema',
  'kenema dist': 'Kenema',
  'kenema city': 'Kenema',
  koinadugu: 'Koinadugu',
  'koinadugu district': 'Koinadugu',
  kabala: 'Koinadugu',
  kono: 'Kono',
  'kono district': 'Kono',
  koidu: 'Kono',
  sefadu: 'Kono',
  moyamba: 'Moyamba',
  'moyamba district': 'Moyamba',
  'moyamba dist': 'Moyamba',
  'port loko': 'Port Loko',
  'port-loko': 'Port Loko',
  portloko: 'Port Loko',
  'port loko district': 'Port Loko',
  pujehun: 'Pujehun',
  'pujehun district': 'Pujehun',
  pujehum: 'Pujehun',
  tonkolili: 'Tonkolili',
  'tonkolili district': 'Tonkolili',
  magburaka: 'Tonkolili',
  'mile 91': 'Tonkolili',
  'western area rural': 'Western Area Rural',
  'western rural': 'Western Area Rural',
  'wa rural': 'Western Area Rural',
  waterloo: 'Western Area Rural',
  york: 'Western Area Rural',
  'western area urban': 'Western Area Urban',
  'western urban': 'Western Area Urban',
  'wa urban': 'Western Area Urban',
  freetown: 'Western Area Urban',
  'freetown urban': 'Western Area Urban',
  'greater freetown': 'Western Area Urban',
};

export class DataCleaningService {
  /**
   * Checks if a value is considered empty/missing
   */
  public static isMissing(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      return (
        trimmed === '' ||
        trimmed === 'na' ||
        trimmed === 'n/a' ||
        trimmed === 'null' ||
        trimmed === 'none' ||
        trimmed === 'nan' ||
        trimmed === 'undefined' ||
        trimmed === '-' ||
        trimmed === '?'
      );
    }
    if (typeof value === 'number') {
      return isNaN(value);
    }
    return false;
  }

  /**
   * Helper to parse messy numbers (e.g. "$1,250.50", "4.2 MT", "85%")
   */
  public static parseMessyNumber(val: any): number | null {
    if (typeof val === 'number') return isNaN(val) ? null : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[$€£LeSLE,%\s]|(MT|Ha|Kg|tons|Tons)/gi, '').trim();
      const num = parseFloat(cleaned);
      return !isNaN(num) && isFinite(num) ? num : null;
    }
    return null;
  }

  /**
   * Matches a string against Sierra Leone district names and aliases
   */
  public static matchDistrictName(val: string): string | null {
    if (!val || typeof val !== 'string') return null;
    const clean = val.trim().toLowerCase();

    // Exact match in official list
    const exact = SIERRA_LEONE_OFFICIAL_DISTRICTS.find(
      (d) => d.toLowerCase() === clean
    );
    if (exact) return exact;

    // Check alias dictionary
    if (DISTRICT_ALIASES[clean]) {
      return DISTRICT_ALIASES[clean];
    }

    // Fuzzy check for contains
    for (const official of SIERRA_LEONE_OFFICIAL_DISTRICTS) {
      if (clean.includes(official.toLowerCase())) {
        return official;
      }
    }

    return null;
  }

  /**
   * Comprehensive validation scan of a dataset
   */
  public static validateDataset(
    rows: Record<string, any>[],
    columns: string[]
  ): ValidationReport {
    const cellErrors: CellError[] = [];
    const columnSummaries: Record<string, ColumnValidationSummary> = {};

    let totalMissing = 0;
    let totalOutliers = 0;
    let totalFormatIssues = 0;

    // Detect duplicate rows
    const rowSignatures = new Set<string>();
    let duplicateRowCount = 0;
    rows.forEach((r) => {
      const sig = columns.map((c) => String(r[c] ?? '')).join('|');
      if (rowSignatures.has(sig)) {
        duplicateRowCount++;
      } else {
        rowSignatures.add(sig);
      }
    });

    // Analyze each column
    columns.forEach((col) => {
      let missingCount = 0;
      let formatIssueCount = 0;
      const values: any[] = [];
      const numericVals: number[] = [];
      const distinctSet = new Set<string>();

      // Detect if column is district-related
      const isDistrictCol =
        col.toLowerCase().includes('district') ||
        col.toLowerCase().includes('location') ||
        col.toLowerCase() === 'dist';

      rows.forEach((row, rowIndex) => {
        const val = row[col];
        values.push(val);

        if (this.isMissing(val)) {
          missingCount++;
          cellErrors.push({
            rowIndex,
            column: col,
            originalValue: val,
            errorType: 'missing',
            message: `Missing or null value in column "${col}"`,
            severity: 'error',
          });
          return;
        }

        distinctSet.add(String(val));

        // Check for District matching
        if (isDistrictCol && typeof val === 'string') {
          const matched = this.matchDistrictName(val);
          if (!matched) {
            formatIssueCount++;
            cellErrors.push({
              rowIndex,
              column: col,
              originalValue: val,
              errorType: 'district_mismatch',
              message: `"${val}" does not match any recognized Sierra Leone district`,
              severity: 'error',
            });
          } else if (matched !== val) {
            formatIssueCount++;
            cellErrors.push({
              rowIndex,
              column: col,
              originalValue: val,
              errorType: 'district_mismatch',
              message: `Inconsistent district naming: "${val}" should be standardized to "${matched}"`,
              suggestedValue: matched,
              severity: 'warning',
            });
          }
        }

        // Check for number consistency
        const parsedNum = this.parseMessyNumber(val);
        if (parsedNum !== null) {
          numericVals.push(parsedNum);
          if (typeof val === 'string' && (val.includes(',') || val.includes('$') || val.includes('%') || val.includes('MT'))) {
            formatIssueCount++;
            cellErrors.push({
              rowIndex,
              column: col,
              originalValue: val,
              errorType: 'format_inconsistency',
              message: `Contains formatting symbols ("${val}"). Recommended: Clean numeric format.`,
              suggestedValue: parsedNum,
              severity: 'warning',
            });
          }
        } else if (typeof val === 'string' && (val.startsWith(' ') || val.endsWith(' ') || val.includes('  '))) {
          formatIssueCount++;
          cellErrors.push({
            rowIndex,
            column: col,
            originalValue: val,
            errorType: 'format_inconsistency',
            message: `Contains unnecessary whitespace padding`,
            suggestedValue: val.trim().replace(/\s+/g, ' '),
            severity: 'warning',
          });
        }
      });

      // Statistical analysis for numeric columns
      const isNumericCol = numericVals.length >= Math.max(2, rows.length * 0.6);
      let min: number | undefined;
      let max: number | undefined;
      let mean: number | undefined;
      let median: number | undefined;
      let q1: number | undefined;
      let q3: number | undefined;
      let iqr: number | undefined;
      let outlierCount = 0;

      if (isNumericCol && numericVals.length > 3) {
        numericVals.sort((a, b) => a - b);
        min = numericVals[0];
        max = numericVals[numericVals.length - 1];
        mean = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;

        const mid = Math.floor(numericVals.length / 2);
        median =
          numericVals.length % 2 === 0
            ? (numericVals[mid - 1] + numericVals[mid]) / 2
            : numericVals[mid];

        const q1Idx = Math.floor(numericVals.length * 0.25);
        const q3Idx = Math.floor(numericVals.length * 0.75);
        q1 = numericVals[q1Idx];
        q3 = numericVals[q3Idx];
        iqr = q3 - q1;

        // Outlier detection using 1.5 * IQR or agricultural feasibility limits
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;

        rows.forEach((row, rowIndex) => {
          const val = row[col];
          const num = this.parseMessyNumber(val);
          if (num !== null) {
            let isOutlier = false;
            let outlierReason = '';

            // Domain specific checks for Sierra Leone agriculture
            if (col.toLowerCase().includes('yield') && (num < 0 || num > 35)) {
              isOutlier = true;
              outlierReason = `Yield of ${num} MT/Ha is outside realistic agricultural thresholds (0 - 35 MT/Ha)`;
            } else if (col.toLowerCase().includes('pct') && (num < 0 || num > 100)) {
              isOutlier = true;
              outlierReason = `Percentage value ${num}% cannot be less than 0 or greater than 100%`;
            } else if (col.toLowerCase().includes('loss') && (num < 0 || num > 100)) {
              isOutlier = true;
              outlierReason = `Post-harvest loss ${num}% outside 0 - 100% boundary`;
            } else if (iqr > 0 && (num < lowerFence || num > upperFence)) {
              isOutlier = true;
              outlierReason = `Statistical anomaly (${num}): deviates significantly from normal distribution (${lowerFence.toFixed(1)} to ${upperFence.toFixed(1)})`;
            }

            if (isOutlier) {
              outlierCount++;
              cellErrors.push({
                rowIndex,
                column: col,
                originalValue: val,
                errorType: 'outlier',
                message: outlierReason,
                suggestedValue: num > upperFence ? Math.round(upperFence * 10) / 10 : Math.round(lowerFence * 10) / 10,
                severity: 'warning',
              });
            }
          }
        });
      }

      totalMissing += missingCount;
      totalOutliers += outlierCount;
      totalFormatIssues += formatIssueCount;

      columnSummaries[col] = {
        column: col,
        totalValues: rows.length,
        missingCount,
        outlierCount,
        formatIssueCount,
        detectedType: isDistrictCol
          ? 'district'
          : isNumericCol
          ? 'numeric'
          : 'text',
        min,
        max,
        mean: mean !== undefined ? Math.round(mean * 100) / 100 : undefined,
        median: median !== undefined ? Math.round(median * 100) / 100 : undefined,
        q1: q1 !== undefined ? Math.round(q1 * 100) / 100 : undefined,
        q3: q3 !== undefined ? Math.round(q3 * 100) / 100 : undefined,
        iqr: iqr !== undefined ? Math.round(iqr * 100) / 100 : undefined,
        distinctCount: distinctSet.size,
      };
    });

    const totalCells = Math.max(1, rows.length * columns.length);
    const errorCellsCount = cellErrors.filter((e) => e.severity === 'error').length;
    const warningCellsCount = cellErrors.filter((e) => e.severity === 'warning').length;

    // Data Health Score calculation (weighted penalty)
    const penalty =
      (errorCellsCount * 2.5 + warningCellsCount * 0.8 + duplicateRowCount * 2.0) /
      totalCells;
    const rawScore = 100 - penalty * 100;
    const healthScore = Math.max(10, Math.min(100, Math.round(rawScore)));

    return {
      totalRows: rows.length,
      totalColumns: columns.length,
      healthScore,
      errorCount: errorCellsCount,
      warningCount: warningCellsCount,
      missingCount: totalMissing,
      outlierCount: totalOutliers,
      formatIssueCount: totalFormatIssues,
      cellErrors,
      columnSummaries,
      duplicateRowCount,
    };
  }

  /**
   * Automated Cleaning Pipeline with customizable rules
   */
  public static autoCleanDataset(
    rows: Record<string, any>[],
    columns: string[],
    options: AutoCleanOptions = {}
  ): {
    cleanedRows: Record<string, any>[];
    changesApplied: string[];
    report: ValidationReport;
  } {
    const opts: Required<AutoCleanOptions> = {
      normalizeDistricts: options.normalizeDistricts ?? true,
      trimAndTitleCase: options.trimAndTitleCase ?? true,
      parseNumericStrings: options.parseNumericStrings ?? true,
      imputeMissingNumeric: options.imputeMissingNumeric ?? 'median',
      imputeMissingText: options.imputeMissingText ?? 'mode',
      handleOutliers: options.handleOutliers ?? 'cap_iqr',
      removeDuplicates: options.removeDuplicates ?? true,
    };

    let cleaned = rows.map((r) => ({ ...r }));
    const changes: string[] = [];

    // 1. Deduplicate rows if requested
    if (opts.removeDuplicates) {
      const seen = new Set<string>();
      const beforeCount = cleaned.length;
      cleaned = cleaned.filter((row) => {
        const sig = columns.map((c) => String(row[c] ?? '')).join('|||');
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      });
      const dropped = beforeCount - cleaned.length;
      if (dropped > 0) {
        changes.push(`Removed ${dropped} duplicate records`);
      }
    }

    // Pre-calculate initial column metrics
    const initialReport = this.validateDataset(cleaned, columns);

    // 2. Process column by column
    columns.forEach((col) => {
      const summary = initialReport.columnSummaries[col];
      if (!summary) return;

      const isDistrictCol = summary.detectedType === 'district';
      const isNumericCol = summary.detectedType === 'numeric';

      // Find mode value for text columns
      let textMode = 'Unknown';
      if (!isNumericCol) {
        const counts = new Map<string, number>();
        cleaned.forEach((r) => {
          const val = r[col];
          if (!this.isMissing(val)) {
            const s = String(val).trim();
            counts.set(s, (counts.get(s) || 0) + 1);
          }
        });
        let maxCount = 0;
        counts.forEach((cnt, val) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            textMode = val;
          }
        });
      }

      let districtsNormalized = 0;
      let formatFixed = 0;
      let missingImputed = 0;
      let outliersCapped = 0;

      cleaned.forEach((row) => {
        let val = row[col];

        // A. Missing Value Imputation
        if (this.isMissing(val)) {
          if (isNumericCol) {
            if (opts.imputeMissingNumeric === 'median' && summary.median !== undefined) {
              row[col] = summary.median;
              missingImputed++;
            } else if (opts.imputeMissingNumeric === 'mean' && summary.mean !== undefined) {
              row[col] = summary.mean;
              missingImputed++;
            } else if (opts.imputeMissingNumeric === 'zero') {
              row[col] = 0;
              missingImputed++;
            }
          } else {
            if (opts.imputeMissingText === 'mode') {
              row[col] = textMode;
              missingImputed++;
            } else if (opts.imputeMissingText === 'unknown') {
              row[col] = 'Unspecified';
              missingImputed++;
            }
          }
          return;
        }

        // B. District Normalization
        if (isDistrictCol && opts.normalizeDistricts && typeof val === 'string') {
          const matched = this.matchDistrictName(val);
          if (matched && matched !== val) {
            row[col] = matched;
            districtsNormalized++;
          }
        }

        // C. Clean formatting & parse numbers
        if (isNumericCol && opts.parseNumericStrings) {
          const num = this.parseMessyNumber(val);
          if (num !== null && (typeof val !== 'number' || num !== val)) {
            row[col] = num;
            formatFixed++;
          }
        } else if (typeof val === 'string' && opts.trimAndTitleCase) {
          const trimmed = val.trim().replace(/\s+/g, ' ');
          if (trimmed !== val) {
            row[col] = trimmed;
            formatFixed++;
          }
        }

        // D. Outlier Handling
        if (isNumericCol && opts.handleOutliers === 'cap_iqr' && summary.q1 !== undefined && summary.q3 !== undefined && summary.iqr !== undefined) {
          const num = typeof row[col] === 'number' ? row[col] : this.parseMessyNumber(row[col]);
          if (num !== null) {
            const lowerFence = summary.q1 - 1.5 * summary.iqr;
            const upperFence = summary.q3 + 1.5 * summary.iqr;
            if (num > upperFence) {
              row[col] = Math.round(upperFence * 10) / 10;
              outliersCapped++;
            } else if (num < lowerFence && lowerFence >= 0) {
              row[col] = Math.round(lowerFence * 10) / 10;
              outliersCapped++;
            }
          }
        } else if (isNumericCol && opts.handleOutliers === 'replace_median' && summary.median !== undefined) {
          const num = typeof row[col] === 'number' ? row[col] : this.parseMessyNumber(row[col]);
          if (num !== null && summary.q1 !== undefined && summary.q3 !== undefined && summary.iqr !== undefined) {
            const lowerFence = summary.q1 - 1.5 * summary.iqr;
            const upperFence = summary.q3 + 1.5 * summary.iqr;
            if (num > upperFence || num < lowerFence) {
              row[col] = summary.median;
              outliersCapped++;
            }
          }
        }
      });

      if (districtsNormalized > 0) {
        changes.push(`Standardized ${districtsNormalized} district names in "${col}"`);
      }
      if (formatFixed > 0) {
        changes.push(`Cleaned text formatting / numeric parsing for ${formatFixed} cells in "${col}"`);
      }
      if (missingImputed > 0) {
        changes.push(`Imputed ${missingImputed} missing values in "${col}"`);
      }
      if (outliersCapped > 0) {
        changes.push(`Capped ${outliersCapped} statistical outliers in "${col}"`);
      }
    });

    const finalReport = this.validateDataset(cleaned, columns);

    return {
      cleanedRows: cleaned,
      changesApplied: changes,
      report: finalReport,
    };
  }

  /**
   * Manual Single Cell Update
   */
  public static updateCell(
    rows: Record<string, any>[],
    rowIndex: number,
    column: string,
    newValue: any
  ): Record<string, any>[] {
    const updated = [...rows];
    if (rowIndex >= 0 && rowIndex < updated.length) {
      updated[rowIndex] = {
        ...updated[rowIndex],
        [column]: newValue,
      };
    }
    return updated;
  }

  /**
   * Column-level imputation
   */
  public static imputeColumn(
    rows: Record<string, any>[],
    column: string,
    strategy: 'median' | 'mean' | 'zero' | 'mode' | 'custom',
    customVal?: any
  ): Record<string, any>[] {
    const summary = this.validateDataset(rows, [column]).columnSummaries[column];
    let fillValue: any = 0;

    if (strategy === 'median' && summary?.median !== undefined) fillValue = summary.median;
    else if (strategy === 'mean' && summary?.mean !== undefined) fillValue = summary.mean;
    else if (strategy === 'zero') fillValue = 0;
    else if (strategy === 'custom') fillValue = customVal ?? 0;
    else if (strategy === 'mode') {
      const counts = new Map<any, number>();
      rows.forEach((r) => {
        if (!this.isMissing(r[column])) {
          counts.set(r[column], (counts.get(r[column]) || 0) + 1);
        }
      });
      let maxCnt = 0;
      counts.forEach((cnt, val) => {
        if (cnt > maxCnt) {
          maxCnt = cnt;
          fillValue = val;
        }
      });
    }

    return rows.map((r) => {
      if (this.isMissing(r[column])) {
        return { ...r, [column]: fillValue };
      }
      return r;
    });
  }

  /**
   * Drop rows that contain errors
   */
  public static dropProblematicRows(
    rows: Record<string, any>[],
    cellErrors: CellError[],
    severityFilter: 'error_only' | 'all' = 'error_only'
  ): Record<string, any>[] {
    const badRowIndices = new Set<number>();
    cellErrors.forEach((err) => {
      if (severityFilter === 'all' || err.severity === 'error') {
        badRowIndices.add(err.rowIndex);
      }
    });

    return rows.filter((_, idx) => !badRowIndices.has(idx));
  }
}
