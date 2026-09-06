import React, { useState } from 'react';
import {
  INFRASTRUCTURE_OVERVIEW,
  FEEDER_ROADS_LOTS,
  WATER_WELLS_PROJECTS,
  FeederRoadLot,
  WaterWellProject,
} from '../../data/infrastructureData';
import {
  Truck,
  Droplets,
  Route,
  Compass,
  CheckCircle2,
  Clock,
  Sun,
  ShieldCheck,
  TrendingDown,
  Layers,
  MapPin,
  Building,
  AlertCircle,
} from 'lucide-react';

export const InfrastructureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feeder_roads' | 'water_wells'>('feeder_roads');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [wellPurposeFilter, setWellPurposeFilter] = useState<string>('All');

  const filteredLots =
    districtFilter === 'All'
      ? FEEDER_ROADS_LOTS
      : FEEDER_ROADS_LOTS.filter((lot) => lot.district.toLowerCase() === districtFilter.toLowerCase());

  const filteredWells =
    wellPurposeFilter === 'All'
      ? WATER_WELLS_PROJECTS
      : WATER_WELLS_PROJECTS.filter((w) => w.purpose.includes(wellPurposeFilter));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900/80 text-blue-200 border border-blue-700">
                AVDP Component 1 &amp; 3
              </span>
              <span className="text-xs text-slate-400">Rural Infrastructure &amp; Climate-Resilient Water Systems</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Rural Feeder Roads &amp; Multi-Purpose Water Wells
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Unlocking remote agricultural production valleys across 8 priority districts through 420+ km of climate-proof
              feeder roads, 14 major river bridges, and 64 multi-purpose water wells providing community drinking water
              and solar-powered micro-irrigation for female vegetable growers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Total Feeder Roads</span>
              <span className="text-sm font-extrabold text-blue-300">{INFRASTRUCTURE_OVERVIEW.totalFeederRoadsKm} km</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Bridges Complete</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {INFRASTRUCTURE_OVERVIEW.bridgesCompleted} / {INFRASTRUCTURE_OVERVIEW.bridgesTotal}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Water Wells Active</span>
              <span className="text-sm font-extrabold text-cyan-300">
                {INFRASTRUCTURE_OVERVIEW.totalWaterWellsConstructed} Wells
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('feeder_roads')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'feeder_roads'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Feeder Roads, Bridges &amp; Farm Tracks (420+ km)</span>
          </button>
          <button
            onClick={() => setActiveTab('water_wells')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'water_wells'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Multi-Purpose Water Wells (Drinking &amp; Vegetable Irrigation)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FEEDER ROADS & BRIDGES */}
      {activeTab === 'feeder_roads' && (
        <div className="space-y-6">
          {/* Key Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Post-Harvest Transit Loss</span>
                <span className="text-lg font-extrabold text-white">
                  -{INFRASTRUCTURE_OVERVIEW.postHarvestTransportLossReductionPct}%
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">Crop damage during haulage</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Average Transit Time</span>
                <span className="text-lg font-extrabold text-white">
                  -{INFRASTRUCTURE_OVERVIEW.avgTransitTimeReductionPct}%
                </span>
                <span className="text-[10px] text-blue-400 block font-medium">From farm-gate to highway</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Freight Cost Per Bag</span>
                <span className="text-lg font-extrabold text-white">
                  -{INFRASTRUCTURE_OVERVIEW.freightCostReductionPerBagPct}%
                </span>
                <span className="text-[10px] text-amber-400 block font-medium">Tractor &amp; truck hiring rate</span>
              </div>
            </div>
          </div>

          {/* Feeder Road Lots Table / Grid */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-400" />
                <span>Rehabilitated Road Lots Across 8 Priority Agricultural Districts</span>
              </h3>

              <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
                <span className="text-slate-400">District:</span>
                {['All', 'Kailahun', 'Kenema', 'Pujehun', 'Bonthe', 'Bo', 'Moyamba', 'Port Loko', 'Kono'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistrictFilter(d)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      districtFilter === d
                        ? 'bg-blue-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLots.map((lot) => (
                <div
                  key={lot.lotNumber}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-blue-500/50 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {lot.lotNumber} • {lot.district} District
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          lot.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {lot.status} ({lot.completionPct}%)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{lot.roadSection}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Contractor: {lot.contractor}</p>
                  </div>

                  {/* Road Engineering Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Length</span>
                      <span className="font-bold text-white">{lot.lengthKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Bridges</span>
                      <span className="font-bold text-blue-400">{lot.bridgesCount} Concrete</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Box Culverts</span>
                      <span className="font-bold text-emerald-400">{lot.boxCulverts} Units</span>
                    </div>
                  </div>

                  {/* Travel Time Comparison */}
                  <div className="flex items-center justify-between text-xs bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-850">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Before: <strong className="text-slate-300">{lot.priorTransitHours} hrs</strong></span>
                    </div>
                    <span className="text-slate-600">➔</span>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Now: <strong className="text-emerald-300 font-bold">{lot.currentTransitHours} hrs</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 block font-semibold">Priority Cargo Evacuated:</span>
                    <span className="text-emerald-400/90 font-medium">{lot.cropEvacuationTarget}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-PURPOSE WATER WELLS */}
      {activeTab === 'water_wells' && (
        <div className="space-y-6">
          {/* Key Well Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Solar Irrigation Boreholes</span>
              <span className="text-xl font-extrabold text-cyan-400 mt-1 block">
                {INFRASTRUCTURE_OVERVIEW.solarIrrigationBoreholes} Systems
              </span>
              <span className="text-[10px] text-slate-400">Motorized Solar PV (3.2 kWp)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Safe Drinking Water Wells</span>
              <span className="text-xl font-extrabold text-blue-400 mt-1 block">
                {INFRASTRUCTURE_OVERVIEW.safeDrinkingWaterWells} Wells
              </span>
              <span className="text-[10px] text-slate-400">Co-located at ABCs &amp; Hamlets</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Solar Irrigated Area</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                {INFRASTRUCTURE_OVERVIEW.hectaresUnderSolarIrrigation} Hectares
              </span>
              <span className="text-[10px] text-slate-400">Dry-Season Horticulture</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Daily Water Fetching Saved</span>
              <span className="text-xl font-extrabold text-amber-400 mt-1 block">
                {INFRASTRUCTURE_OVERVIEW.dailyWaterCollectionTimeSavedHours} Hours / Day
              </span>
              <span className="text-[10px] text-slate-400">Unlocked for Women &amp; Girls</span>
            </div>
          </div>

          {/* Deep Dive Description of Well Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Sun className="w-4 h-4" />
                <span>1. Solar-Powered Irrigation Boreholes for Vegetables</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deep boreholes (45–65 meters) equipped with 3.2 kWp photovoltaic solar arrays and variable-frequency
                submersible pumps. Water is pumped into 8,000–12,000 liter elevated steel-tower storage tanks, feeding
                pressurized drip irrigation tape and sprinkler manifolds for women's horticultural cooperatives during the
                critical December–May dry season.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Enables 3 consecutive harvests per year (tomato, pepper, onion)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Eliminates expensive, carbon-polluting diesel pump rentals</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Community Safe Drinking Water Wells</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Boreholes protected with reinforced concrete sanitary aprons, perimeter fencing, and soakaway drainage pits
                fitted with heavy-duty Afridev or India Mark II hand pumps. Co-located directly at Agricultural Business Centres
                (ABCs) and processing mills, eliminating waterborne pathogens and reducing female domestic burdens.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-blue-300 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Certified 100% free of E. coli and fecal coliforms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Saves women &amp; children 2.4 hours daily, improving school attendance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Wells Project Registry */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Active Water Wells &amp; Solar Irrigation Facilities Directory</span>
              </h3>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Filter Purpose:</span>
                {['All', 'Irrigation', 'Drinking', 'Multi-Purpose'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setWellPurposeFilter(p)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                      wellPurposeFilter === p
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWells.map((well) => (
                <div
                  key={well.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-cyan-500/50 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          well.purpose.includes('Irrigation')
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {well.purpose}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{well.community}</h4>
                      <span className="text-[11px] text-slate-400">{well.district} District</span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                      {well.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Depth</span>
                      <span className="font-bold text-white">{well.wellDepthMeters}m Borehole</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Power Setup</span>
                      <span className="font-semibold text-cyan-300 truncate block">{well.powerSource.split('(')[0]}</span>
                    </div>
                    {well.storageTankCapacityLiters ? (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Storage Tank</span>
                        <span className="font-bold text-blue-300">
                          {well.storageTankCapacityLiters.toLocaleString()} Liters
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Water Test</span>
                        <span className="font-bold text-emerald-400">Potable</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Beneficiary Group:</span>
                      <span className="font-semibold text-white truncate max-w-[240px]">
                        {well.beneficiaryFBOorCommunity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Women Growers / Residents Served:</span>
                      <span className="font-bold text-emerald-400">{well.womenGrowersServed} Farmers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
