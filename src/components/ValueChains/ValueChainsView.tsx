import React, { useState } from 'react';
import { SierraLeoneMap, MapMetricType } from '../Map/SierraLeoneMap';
import { VALUE_CHAIN_AGRIBUSINESS } from '../../data/agribusinessData';
import {
  RicePaddyIcon,
  CassavaTuberIcon,
  CocoaPodIcon,
  OilPalmIcon,
  SolarIrrigationIcon,
  AgroMillIcon,
  GrainSiloIcon,
  QualityBadgeIcon,
  FishAquacultureIcon,
  PoultryLivestockIcon,
} from '../Common/AgriIcons';
import {
  TrendingUp,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Handshake,
  DollarSign,
  Warehouse,
} from 'lucide-react';
import { FutureYieldOutlook } from '../Analytics/FutureYieldOutlook';
import { CommodityType } from '../../data/cropTrendData';

interface ValueChainDetail {
  id: string;
  name: string;
  subheading: string;
  icon: any;
  color: string;
  bgGradient: string;
  hotspotDistricts: string[];
  nationalShare: string;
  avdpTarget2025: string;
  currentActual: string;
  completionPct: number;
  stages: {
    stage: string;
    description: string;
    efficiency: string;
    interventions: string[];
  }[];
  challenges: string[];
  opportunities: string[];
}

const VALUE_CHAINS_DATA: ValueChainDetail[] = [
  {
    id: 'rice',
    name: 'Rice (IVS & Bolilands)',
    subheading: 'National Staple Food Security & Import Substitution',
    icon: RicePaddyIcon,
    color: '#10b981',
    bgGradient: 'from-emerald-950/60 to-slate-900',
    hotspotDistricts: ['Bo', 'Tonkolili', 'Kambia', 'Port Loko', 'Kenema'],
    nationalShare: '65% of Caloric Intake',
    avdpTarget2025: '4.5 MT/Ha IVS Average',
    currentActual: '3.7 MT/Ha (+48% vs Baseline)',
    completionPct: 82,
    stages: [
      {
        stage: 'Input Supply',
        description: 'Certified foundation seeds (Rokit 4, NERICA L-19), eco-fertilizer, and power tillers.',
        efficiency: '88%',
        interventions: ['Community Seed Banks established', 'Voucher subsidy system for inputs'],
      },
      {
        stage: 'Cultivation',
        description: 'Inland Valley Swamp (IVS) bunding, leveling, canal drainage, and water control gates.',
        efficiency: '84%',
        interventions: ['7,200 Ha IVS rehabilitated with water control', 'Farmer Field Schools (FFS) training'],
      },
      {
        stage: 'Post-Harvest Handling',
        description: 'Threshing, parboiling, drying floors, and moisture-controlled warehouse storage.',
        efficiency: '76%',
        interventions: ['Solar bubble dryers deployed', 'Multi-crop threshers distributed to FBOs'],
      },
      {
        stage: 'Agro-Processing & Milling',
        description: 'De-stoning, hulling, polishing, and automated 25kg/50kg packaging for domestic retail.',
        efficiency: '81%',
        interventions: ['14 Integrated Rice Mills commissioned', 'Public-Private Partnership (PPP) management'],
      },
      {
        stage: 'Market Offtake & Trade',
        description: 'Supply to national school feeding program, military rations, and Freetown supermarkets.',
        efficiency: '90%',
        interventions: ['Offtaker forward purchasing contracts', 'Digital commodity price bulletin via SMS'],
      },
    ],
    challenges: [
      'Seasonal labor shortages during transplanting and harvesting windows.',
      'Siltation of drainage canals following heavy monsoon flash floods.',
      'Access to affordable working capital for FBO aggregator cooperatives.',
    ],
    opportunities: [
      'Double-cropping in IVS with dry-season horticulture rotation.',
      'Mechanized custom-hiring service centers run by rural youth entrepreneurs.',
    ],
  },
  {
    id: 'cassava',
    name: 'Cassava & HQCF Flour',
    subheading: 'Industrial Starch, Bread Flour Substitution & Food Resilience',
    icon: CassavaTuberIcon,
    color: '#f59e0b',
    bgGradient: 'from-amber-950/60 to-slate-900',
    hotspotDistricts: ['Port Loko', 'Moyamba', 'Bo', 'Karene', 'Bombali'],
    nationalShare: '2nd Major Food Crop',
    avdpTarget2025: '25.0 MT/Ha Tuber Yield',
    currentActual: '21.5 MT/Ha (+54% vs Baseline)',
    completionPct: 86,
    stages: [
      {
        stage: 'Stem Multiplication',
        description: 'Disease-resistant, high-starch cassava varieties (TME 419, SLICASS series).',
        efficiency: '92%',
        interventions: ['Clean stem cuttings distributed to 14,000 farmers', 'Mosaic-free seed fields'],
      },
      {
        stage: 'Commercial Planting',
        description: 'Staggered planting across upland plots to guarantee continuous factory feedstock.',
        efficiency: '89%',
        interventions: ['Cluster outgrower contracting schemes', 'Tractor disc-ridging services'],
      },
      {
        stage: 'Rapid Intake & Washing',
        description: 'Tubers processed within 48 hours of harvest to avoid cyanide build-up and starch rot.',
        efficiency: '83%',
        interventions: ['Tricycle motorized transport for fast field collection', 'Centralized washing tanks'],
      },
      {
        stage: 'HQCF & Gari Production',
        description: 'Mechanical grating, hydraulic pressing, flash drying, and automated sieving.',
        efficiency: '85%',
        interventions: ['9 Commercial HQCF Processing Hubs active', 'Stainless-steel hygienic equipment'],
      },
      {
        stage: 'Industrial Offtake',
        description: '10% cassava composite bread policy with Sierra Leone Bakeries Union & breweries.',
        efficiency: '79%',
        interventions: ['Bakeries association supply contracts', 'National Standards Bureau certification'],
      },
    ],
    challenges: [
      'Rapid post-harvest deterioration of unpeeled tubers within 48 hours.',
      'Diesel generator fuel costs for industrial flash dryers during grid outages.',
    ],
    opportunities: [
      'Biogas capture from cassava peelings and wastewater to power factory boilers.',
      'Export of packaged premium fortified gari to regional ECOWAS markets.',
    ],
  },
  {
    id: 'cocoa',
    name: 'Cocoa & Coffee',
    subheading: 'High-Value Export Earnings, Agroforestry & Rainforest Conservation',
    icon: CocoaPodIcon,
    color: '#d97706',
    bgGradient: 'from-amber-950/70 to-slate-900',
    hotspotDistricts: ['Kenema', 'Kailahun', 'Kono'],
    nationalShare: 'Top Agricultural Foreign Exchange',
    avdpTarget2025: '850 kg/Ha Fermented Beans',
    currentActual: '720 kg/Ha (+44% vs Baseline)',
    completionPct: 84,
    stages: [
      {
        stage: 'Clonal Nurseries',
        description: 'Early-maturing, high-yield hybrid cocoa seedlings raised under shade trees.',
        efficiency: '91%',
        interventions: ['Central seedling nurseries in Kailahun & Kenema', 'Agroforestry shade trees planted'],
      },
      {
        stage: 'Orchard Rehabilitation',
        description: 'Sanitary pruning, mistletoe removal, black pod disease management, and micro-terracing.',
        efficiency: '80%',
        interventions: ['Motorized pruning shears provided to youth brigades', 'Organic bio-pesticides distributed'],
      },
      {
        stage: 'Controlled Fermentation',
        description: 'Tiered wooden sweat boxes for 6-day uniform fermentation and aroma development.',
        efficiency: '87%',
        interventions: ['Standardized wooden fermentation boxes built', 'Temperature monitoring logbooks'],
      },
      {
        stage: 'Solar Bed Drying',
        description: 'Raised solar drying tables with ultraviolet protective plastic covers.',
        efficiency: '86%',
        interventions: ['Raised drying beds keeping beans off dirt floors', 'Digital moisture meters for coops'],
      },
      {
        stage: 'Traceable Export',
        description: 'Direct cooperative export to EU chocolate manufacturers with Fairtrade & Organic premiums.',
        efficiency: '93%',
        interventions: ['GPS farm polygon mapping for EUDR deforestation compliance', 'Blockchain shipment traceability'],
      },
    ],
    challenges: [
      'Strict EU Deforestation Regulation (EUDR) geolocated farm traceability mandates.',
      'Black pod disease outbreaks during continuous heavy rain spells.',
    ],
    opportunities: [
      'Specialty single-origin Sierra Leone chocolates sold at 35% premium.',
      'Carbon credit revenue for shade-grown cocoa biodiversity corridors.',
    ],
  },
  {
    id: 'oil_palm',
    name: 'Oil Palm & Crude Palm Oil (CPO)',
    subheading: 'Domestic Edible Oil Sufficiency, Soap Manufacturing & Bio-Energy',
    icon: OilPalmIcon,
    color: '#059669',
    bgGradient: 'from-emerald-950/70 to-slate-900',
    hotspotDistricts: ['Pujehun', 'Bonthe', 'Moyamba', 'Kailahun', 'Port Loko'],
    nationalShare: 'Primary Cooking Fat',
    avdpTarget2025: '12.0 MT/Ha FFB Yield',
    currentActual: '9.8 MT/Ha (+40% vs Baseline)',
    completionPct: 81,
    stages: [
      {
        stage: 'Tenera Seedlings',
        description: 'High-oil extraction Tenera pre-germinated seed nuts raised in drip-irrigated polybags.',
        efficiency: '90%',
        interventions: ['Government certified oil palm nurseries', 'Legume cover crop planting for soil health'],
      },
      {
        stage: 'Harvesting FFB',
        description: 'Bi-weekly harvesting of Fresh Fruit Bunches (FFB) using ergonomic sickle poles.',
        efficiency: '84%',
        interventions: ['Ergonomic harvesting poles distributed', 'Outgrower collection timetable coordination'],
      },
      {
        stage: 'Sterilization & Digestion',
        description: 'Steam sterilization to stop free fatty acid (FFA) rise followed by mechanical screw digestion.',
        efficiency: '82%',
        interventions: ['Community mini-mills installed with biomass steam boilers', 'FFA levels reduced under 4%'],
      },
      {
        stage: 'Clarification & Storage',
        description: 'Continuous settling tanks, centrifuge drying, and food-grade stainless storage drums.',
        efficiency: '88%',
        interventions: ['Food-grade bulk storage facilities', 'Zero-waste palm kernel expeller integration'],
      },
      {
        stage: 'Regional Distribution',
        description: 'Bulk delivery to Freetown domestic markets and local industrial soap makers.',
        efficiency: '91%',
        interventions: ['Direct distribution contracts with women trade associations', 'Standardized 20L sealed containers'],
      },
    ],
    challenges: [
      'High Free Fatty Acid (FFA) spikes when bunches wait more than 24 hours before boiling.',
      'Competition with low-efficiency artisanal pit extraction techniques.',
    ],
    opportunities: [
      'Palm kernel oil (PKO) high-value cosmetic soap fractionation.',
      'Empty fruit bunch composting to generate organic fertilizer for surrounding rice fields.',
    ],
  },
  {
    id: 'vegetables',
    name: 'Horticulture & Vegetables',
    subheading: 'Solar-Powered Irrigation, Women & Youth Empowerment & Urban Offtake',
    icon: SolarIrrigationIcon,
    color: '#06b6d4',
    bgGradient: 'from-cyan-950/70 to-slate-900',
    hotspotDistricts: ['Port Loko', 'Kambia', 'Western Rural', 'Bo', 'Koinadugu'],
    nationalShare: 'Year-Round Micronutrient Security',
    avdpTarget2025: '3,500 Ha Solar Irrigated & 60% Women Led',
    currentActual: '2,840 Ha Irrigated (+62% Women/Youth)',
    completionPct: 88,
    stages: [
      {
        stage: 'Solar Micro-Irrigation',
        description: 'Solar borehole pumps, pressurized drip kits, and raised seedbed nurseries.',
        efficiency: '92%',
        interventions: ['Solar pump kits distributed to 85 women farmer groups', 'Drip lines installed for dry-season production'],
      },
      {
        stage: 'High-Yield Seeds & Nursery',
        description: 'Climate-resilient pepper, tomato, onion, and leafy greens varieties with pest netting.',
        efficiency: '89%',
        interventions: ['Community nursery tunnels erected', 'Organic neem-based bio-pesticide training'],
      },
      {
        stage: 'Dry-Season Cultivation',
        description: 'Off-season vegetable production commanding peak market prices during December-May dry spells.',
        efficiency: '86%',
        interventions: ['Mulching and water-conservation techniques', 'Micro-credit working capital for women groups'],
      },
      {
        stage: 'Solar Cold Storage',
        description: 'Zero-emission solar chilling units at aggregated collection centers preventing spoilage.',
        efficiency: '84%',
        interventions: ['Solar cold room pilot in Port Loko & Waterloo', 'Crated transit replacing woven sacks'],
      },
      {
        stage: 'Freetown & Urban Offtake',
        description: 'Direct supply contracts with supermarket chains, hotels, and major municipal markets.',
        efficiency: '90%',
        interventions: ['Direct trade agreements bypassing middleman exploitation', 'Digital price bulletin SMS alerts'],
      },
    ],
    challenges: [
      'High perishable nature requiring uninterrupted cold chain logistics.',
      'Surface water scarcity in extreme dry season before solar deep boreholes.',
    ],
    opportunities: [
      'Year-round supply to Freetown commanding up to 3x higher price in dry season.',
      'Sun-dried chili and tomato paste micro-processing for extended shelf life.',
    ],
  },
];

export const ValueChainsView: React.FC = () => {
  const [selectedChainId, setSelectedChainId] = useState<string>('rice');
  const activeChain = VALUE_CHAINS_DATA.find((c) => c.id === selectedChainId) || VALUE_CHAINS_DATA[0];
  const ActiveIcon = activeChain.icon;

  return (
    <div className="space-y-6">
      {/* Top Value Chain Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {VALUE_CHAINS_DATA.map((chain) => {
          const Icon = chain.icon;
          const isActive = chain.id === selectedChainId;

          return (
            <button
              key={chain.id}
              onClick={() => setSelectedChainId(chain.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'text-slate-400 bg-slate-800'
                  }`}
                >
                  {chain.completionPct}% M&amp;E
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{chain.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{chain.subheading}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Selected Value Chain Deep Dive */}
      <div
        className={`bg-gradient-to-b ${activeChain.bgGradient} border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6`}
      >
        {/* Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/10"
              style={{ backgroundColor: `${activeChain.color}30`, color: activeChain.color }}
            >
              <ActiveIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  AVDP Priority Value Chain
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">{activeChain.nationalShare}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{activeChain.name}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{activeChain.subheading}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Target 2025</span>
              <span className="text-sm font-extrabold text-white">{activeChain.avdpTarget2025}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Actual 2024 Status</span>
              <span className="text-sm font-extrabold text-emerald-400">{activeChain.currentActual}</span>
            </div>
          </div>
        </div>

        {/* Hotspots */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            District Hubs:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeChain.hotspotDistricts.map((d) => (
              <span
                key={d}
                className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/60"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Value Chain Real GIS Map */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Geospatial Production &amp; Processing Footprint: {activeChain.name}</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Choropleth density, active agro-processing hubs &amp; seed facilities
            </span>
          </div>

          <SierraLeoneMap
            activeMetric={
              (activeChain.id === 'rice'
                ? 'rice_yield'
                : activeChain.id === 'oil_palm'
                ? 'oil_palm'
                : activeChain.id === 'cocoa'
                ? 'cocoa'
                : activeChain.id === 'vegetables'
                ? 'vegetables'
                : 'cassava_yield') as MapMetricType
            }
            height="h-[460px]"
            showToolbar={true}
          />
        </div>

        {/* 5-Stage Value Chain Flow Architecture */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>End-to-End Value Chain Pipeline Architecture</span>
            <span className="text-[10px] font-normal text-slate-500">(Seed to Consumer)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {activeChain.stages.map((stage, idx) => (
              <div
                key={stage.stage}
                className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 text-[11px] uppercase">
                      0{idx + 1}. {stage.stage}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                      {stage.efficiency} Eff.
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{stage.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 block">AVDP Interventions:</span>
                  {stage.interventions.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-300/90 leading-tight">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agribusiness & Market Access Component (Component 2 Integration) */}
        {VALUE_CHAIN_AGRIBUSINESS[selectedChainId] && (() => {
          const agri = VALUE_CHAIN_AGRIBUSINESS[selectedChainId];
          return (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    AVDP Component 2 Agribusiness Profile
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-emerald-400" />
                    <span>Commercialization, Matching Grants &amp; Off-Takers: {activeChain.name}</span>
                  </h4>
                </div>

                <span className="text-[11px] text-slate-400">
                  {agri.fboToAbcTransition.abcsOperational} Operational ABCs • {agri.fboToAbcTransition.activeFBOsLinked} Linked FBOs
                </span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-2xl border border-slate-850">
                <strong className="text-emerald-400 font-semibold">Agribusiness Model: </strong>
                {agri.businessModel}
              </div>

              {/* 3 Agribusiness Columns: Matching Grants, Rural Finance, Aggregation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Matching Grant Facility (MGF)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{agri.matchingGrantWindow}</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                    {agri.grantUtilization}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span>Rural Credit &amp; Apex Bank</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Disbursed Credit:</span>
                    <span className="font-bold text-emerald-400">{agri.ruralFinanceAndCredit.disbursedUSD}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Loan Repayment:</span>
                    <span className="font-bold text-emerald-300">{agri.ruralFinanceAndCredit.repaymentRatePct}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    {agri.ruralFinanceAndCredit.partnerFSPs}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Warehouse className="w-3.5 h-3.5" />
                    <span>Commercial Storage &amp; Quality</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Warehouses:</span>
                    <span className="font-bold text-white">
                      {agri.commercialAggregationAndStorage.warehousesCount} ({agri.commercialAggregationAndStorage.storageCapacityMT.toLocaleString()} MT)
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Warehouse Receipts:</span>
                    <span className="font-semibold text-emerald-400">
                      {agri.commercialAggregationAndStorage.receiptFinancingAvailable ? 'Available' : 'Pending Scale'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800">
                    {agri.commercialAggregationAndStorage.qualityGradingEquipment.map((eq, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-slate-300 border border-slate-800">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Private Off-Takers for This Value Chain */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Commercial Off-Takers &amp; Outgrower Partners
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {agri.privateOffTakers.map((off, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {off.type}
                          </span>
                          <span className="text-slate-400">{off.location}</span>
                        </div>
                        <h6 className="text-xs font-bold text-white mb-1">{off.name}</h6>
                        <span className="text-[11px] text-emerald-400 font-semibold block mb-1">
                          Volume: {off.annualVolumeContracted}
                        </span>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed">
                          "{off.pricingMechanism}"
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-2 mt-2 border-t border-slate-850">
                        {off.certifications.map((c, i) => (
                          <span key={i} className="px-1 py-0.5 rounded bg-slate-900 text-[9px] text-slate-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 5-Year Econometric Yield Projection (for Rice, Cocoa, Oil Palm) */}
        {['rice', 'cocoa', 'oil_palm'].includes(activeChain.id) && (
          <div className="pt-2">
            <FutureYieldOutlook
              initialCommodity={activeChain.id as CommodityType}
              className="bg-slate-950/80 border-slate-800/80"
            />
          </div>
        )}

        {/* Challenges & Strategic Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Operational Bottlenecks &amp; Climate Risks</span>
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              {activeChain.challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>Commercial Scaling &amp; Private Investment Opportunities</span>
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              {activeChain.opportunities.map((o, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
