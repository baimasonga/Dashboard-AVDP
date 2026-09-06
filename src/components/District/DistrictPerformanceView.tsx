import React, { useMemo } from 'react';
import {
  BarChart3,
  Download,
  MapPin,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { SIERRA_LEONE_DISTRICTS } from '../../data/sierraLeoneData';
import { DistrictMetric, ValueChainType } from '../../types';

interface DistrictPerformanceViewProps {
  selectedDistrict: string | null;
  selectedValueChain: ValueChainType;
  onSelectDistrict: (district: string | null) => void;
}

interface MetricDefinition {
  id: string;
  label: string;
  unit: string;
  value: (district: DistrictMetric) => number;
  chains?: ValueChainType[];
}

const METRICS: MetricDefinition[] = [
  {
    id: 'beneficiaries',
    label: 'Beneficiary households',
    unit: 'households',
    value: (district) => district.beneficiaryHouseholds,
  },
  {
    id: 'me-completion',
    label: 'M&E reporting completion',
    unit: '%',
    value: (district) => district.meCompletionRate,
  },
  {
    id: 'rice-yield',
    label: 'Rice yield',
    unit: 'MT/ha',
    value: (district) => district.riceYieldMTPerHa,
    chains: ['Rice (IVS & Bolilands)'],
  },
  {
    id: 'cassava-yield',
    label: 'Cassava yield',
    unit: 'MT/ha',
    value: (district) => district.cassavaYieldMTPerHa,
    chains: ['Cassava & HQCF'],
  },
  {
    id: 'cocoa-production',
    label: 'Cocoa production',
    unit: 'MT',
    value: (district) => district.cocoaProductionMT,
    chains: ['Cocoa & Coffee'],
  },
  {
    id: 'oil-palm-yield',
    label: 'Oil palm output',
    unit: 'MT',
    value: (district) => district.oilPalmYieldMT,
    chains: ['Oil Palm & CPO'],
  },
  {
    id: 'vegetable-output',
    label: 'Vegetable output',
    unit: 'MT',
    value: (district) => district.vegetablesYieldMT || 0,
    chains: ['Horticulture & Vegetables'],
  },
  {
    id: 'ivs-developed',
    label: 'IVS developed',
    unit: 'ha',
    value: (district) => district.ivsDevelopedHa || 0,
    chains: ['Rice (IVS & Bolilands)'],
  },
  {
    id: 'roads',
    label: 'Feeder roads rehabilitated',
    unit: 'km',
    value: (district) => district.feederRoadsRehabKm,
  },
  {
    id: 'mills',
    label: 'Active processing facilities',
    unit: 'facilities',
    value: (district) => district.activeProcessingMills,
  },
];

const formatValue = (value: number) =>
  Math.abs(value) >= 1000
    ? Math.round(value).toLocaleString()
    : Number(value.toFixed(1)).toLocaleString();

export const DistrictPerformanceView: React.FC<DistrictPerformanceViewProps> = ({
  selectedDistrict,
  selectedValueChain,
  onSelectDistrict,
}) => {
  const eligibleDistricts = useMemo(
    () =>
      selectedValueChain === 'All Value Chains'
        ? SIERRA_LEONE_DISTRICTS
        : SIERRA_LEONE_DISTRICTS.filter((district) =>
            district.primaryValueChains.includes(selectedValueChain)
          ),
    [selectedValueChain]
  );

  const district =
    eligibleDistricts.find((item) => item.name === selectedDistrict) ||
    eligibleDistricts[0] ||
    SIERRA_LEONE_DISTRICTS[0];

  const visibleMetrics = METRICS.filter(
    (metric) =>
      !metric.chains ||
      selectedValueChain === 'All Value Chains' ||
      metric.chains.includes(selectedValueChain)
  );

  const comparisons = visibleMetrics.map((metric) => {
    const values = eligibleDistricts.map(metric.value);
    const nationalAverage =
      values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const districtValue = metric.value(district);
    const variancePct =
      nationalAverage === 0
        ? 0
        : ((districtValue - nationalAverage) / nationalAverage) * 100;
    const rank =
      [...eligibleDistricts]
        .sort((a, b) => metric.value(b) - metric.value(a))
        .findIndex((item) => item.name === district.name) + 1;

    return {
      ...metric,
      districtValue,
      nationalAverage,
      variancePct,
      rank,
    };
  });

  const exportProfile = () => {
    const headers =
      'District,Province,Value_Chain_Filter,Metric,Demonstration_Value,Comparison_Average,Variance_Pct,Rank,Districts_Compared,Unit,Data_Status\n';
    const rows = comparisons
      .map((metric) =>
        [
          district.name,
          district.province,
          selectedValueChain,
          metric.label,
          metric.districtValue,
          metric.nationalAverage.toFixed(2),
          metric.variancePct.toFixed(1),
          metric.rank,
          eligibleDistricts.length,
          metric.unit,
          'Demonstration',
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `avdp_demo_district_profile_${district.code.toLowerCase()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-white">
              {district.name} District Performance Profile
            </h2>
            <span className="rounded border border-amber-800 bg-amber-950 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
              Demonstration
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {district.province} Province • Comparison group: {eligibleDistricts.length} districts • {selectedValueChain}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {district.primaryValueChains.map((chain) => (
              <span
                key={chain}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300"
              >
                {chain}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <label>
            <span className="sr-only">Select district profile</span>
            <select
              value={district.name}
              onChange={(event) => onSelectDistrict(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500"
            >
              {eligibleDistricts.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={exportProfile}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            Export profile
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {comparisons.map((metric) => {
          const positive = metric.variancePct >= 0;
          const DifferenceIcon = positive ? TrendingUp : TrendingDown;
          const relativeWidth =
            metric.nationalAverage === 0
              ? 0
              : Math.min(100, (metric.districtValue / metric.nationalAverage) * 50);

          return (
            <article
              key={metric.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">
                    {formatValue(metric.districtValue)}
                    <span className="ml-1 text-xs font-medium text-slate-500">
                      {metric.unit}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center">
                  <div className="text-[9px] uppercase text-slate-500">Rank</div>
                  <div className="text-sm font-bold text-sky-300">
                    {metric.rank}/{eligibleDistricts.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${relativeWidth}%` }}
                />
                <span className="sr-only">
                  District value relative to comparison average
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Comparison average: {formatValue(metric.nationalAverage)} {metric.unit}
                </span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    positive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <DifferenceIcon className="h-3 w-3" aria-hidden="true" />
                  {positive ? '+' : ''}
                  {metric.variancePct.toFixed(1)}%
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-sky-400" aria-hidden="true" />
          <h3 className="text-sm font-bold text-white">Interpretation notes</h3>
        </div>
        <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
          <li>• Rankings compare the selected district only with districts relevant to the active value-chain filter.</li>
          <li>• Positive variance means the district value is above the comparison average; it does not automatically mean better performance.</li>
          <li>• All values are fictitious prototype figures and must not be used for official reporting.</li>
        </ul>
      </section>
    </div>
  );
};
