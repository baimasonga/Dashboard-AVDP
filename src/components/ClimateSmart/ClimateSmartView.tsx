import React, { useState } from 'react';
import {
  CLIMATE_SMART_OVERVIEW,
  CSA_PRACTICES,
  DISTRICT_CSA_PERFORMANCE,
  CsaPractice,
} from '../../data/climateSmartData';
import {
  Leaf,
  Sun,
  Droplets,
  Wind,
  Layers,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Sparkles,
  TreePine,
  ShieldCheck,
  Flame,
} from 'lucide-react';

export const ClimateSmartView: React.FC = () => {
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>('csa_sri_ivs');
  const [provinceFilter, setProvinceFilter] = useState<string>('All');

  const activePractice: CsaPractice =
    CSA_PRACTICES.find((p) => p.id === selectedPracticeId) || CSA_PRACTICES[0];

  const filteredDistricts =
    provinceFilter === 'All'
      ? DISTRICT_CSA_PERFORMANCE
      : DISTRICT_CSA_PERFORMANCE.filter((d) => d.province.toLowerCase() === provinceFilter.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                Adaptation Fund &amp; IFAD
              </span>
              <span className="text-xs text-slate-400">Climate-Smart Agriculture (CSA) Innovation</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Climate-Smart Agriculture &amp; Environmental Resilience
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {CLIMATE_SMART_OVERVIEW.mandate} Equipping 44,800+ smallholder farmers to buffer against changing rainfall
              onset dates, monsoon flash flooding, and dry-season droughts while sequestering 148,000 MT of CO₂ equivalent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Target Achieved</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {CLIMATE_SMART_OVERVIEW.csaTargetAchievementPct}% of Target
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Hectares Under CSA</span>
              <span className="text-sm font-extrabold text-teal-300">
                {CLIMATE_SMART_OVERVIEW.totalHectaresUnderCsa.toLocaleString()} Ha
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-medium">CO₂ Sequestered</span>
              <span className="text-sm font-extrabold text-cyan-400">
                {(CLIMATE_SMART_OVERVIEW.co2EquivalentSequesteredMt / 1000).toFixed(0)}k MT CO₂e
              </span>
            </div>
          </div>
        </div>

        {/* Environmental Impact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">IVS Water Conservation</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
              +{CLIMATE_SMART_OVERVIEW.waterSavingsInIvsPct}% Water Efficiency
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Chemical Fertilizer Cut</span>
            <span className="text-xs font-bold text-teal-300 mt-0.5 block">
              -{CLIMATE_SMART_OVERVIEW.syntheticFertilizerReductionPct}% via Composting
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Clean Energy Pumps</span>
            <span className="text-xs font-bold text-cyan-300 mt-0.5 block">
              {CLIMATE_SMART_OVERVIEW.solarPumpsInstalled} Solar Submersibles
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">CSA Farmers Practicing</span>
            <span className="text-xs font-bold text-amber-400 mt-0.5 block">
              {CLIMATE_SMART_OVERVIEW.totalFarmersAdoptedCsa.toLocaleString()} Smallholders
            </span>
          </div>
        </div>
      </div>

      {/* 6 Core CSA Practices Explorer */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span>The 6 Core Climate-Smart Practices Promoted by AVDP</span>
          </h3>
          <p className="text-xs text-slate-400">
            Field-tested agronomic practices improving yields while sequestering carbon and conserving soil moisture
          </p>
        </div>

        {/* 6 Practices Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CSA_PRACTICES.map((practice) => {
            const isSelected = practice.id === selectedPracticeId;
            return (
              <button
                key={practice.id}
                onClick={() => setSelectedPracticeId(practice.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/60'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{practice.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {practice.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{practice.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{practice.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">{practice.hectaresAdopted.toLocaleString()} Ha</span>
                  <span className="text-slate-400 font-semibold">{practice.farmerAdoptionRatePct}% Adoption</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Practice Deep Dive */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <span className="text-4xl p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl">
                {activePractice.icon}
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {activePractice.category}
                </span>
                <h3 className="text-xl font-bold text-white">{activePractice.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activePractice.valueChains.map((vc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold"
                    >
                      {vc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Field Adoption</span>
                <span className="text-sm font-extrabold text-emerald-400">{activePractice.farmerAdoptionRatePct}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Hectares</span>
                <span className="text-sm font-extrabold text-teal-300">
                  {activePractice.hectaresAdopted.toLocaleString()} Ha
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agronomic Techniques */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Field Agronomic Techniques</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{activePractice.description}</p>

              <div className="space-y-2">
                {activePractice.keyTechniques.map((tech, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Climate & Yield Outcomes */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Climate Adaptation &amp; Yield Impacts</span>
              </h4>

              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Climate Mitigation &amp; Resilience Benefit:
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed">{activePractice.climateBenefit}</p>
              </div>

              <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/60 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Productivity &amp; Economic Yield Impact:
                </span>
                <p className="text-xs text-cyan-200 leading-relaxed">{activePractice.yieldImpact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* District CSA Scorecard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>District Climate-Smart Agriculture Adoption Scorecard</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verified spatial adoption across Inland Valley Swamps (IVS) and Tree Crop Agroforestry
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Province:</span>
            {['All', 'Eastern', 'Southern', 'North Western', 'Northern'].map((p) => (
              <button
                key={p}
                onClick={() => setProvinceFilter(p)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  provinceFilter === p
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Province</th>
                <th className="py-2.5 px-3">CSA Farmers</th>
                <th className="py-2.5 px-3">Adoption %</th>
                <th className="py-2.5 px-3">Total Area</th>
                <th className="py-2.5 px-3">IVS Water Control</th>
                <th className="py-2.5 px-3">Shade Agroforestry</th>
                <th className="py-2.5 px-3">Primary Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredDistricts.map((row) => (
                <tr key={row.district} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{row.district}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.province}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-medium">
                    {row.csaFarmersTrained.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                      {row.csaAdoptionRatePct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-teal-300 font-semibold">{row.haUnderCsa.toLocaleString()} Ha</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.ivsWaterControlHectares} Ha</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.shadeAgroforestryHectares} Ha</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[220px]">
                    {row.primaryCsaIntervention}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
