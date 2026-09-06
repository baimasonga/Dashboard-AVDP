import React, { useState } from 'react';
import {
  VALUE_CHAIN_AGRIBUSINESS,
  MATCHING_GRANT_FACILITY_SUMMARY,
  RURAL_FINANCE_ECOSYSTEM,
  ValueChainAgribusinessProfile,
} from '../../data/agribusinessData';
import {
  RicePaddyIcon,
  CassavaTuberIcon,
  CocoaPodIcon,
  OilPalmIcon,
  SolarIrrigationIcon,
} from '../Common/AgriIcons';
import {
  Building2,
  Handshake,
  DollarSign,
  TrendingUp,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  CreditCard,
  Layers,
  ArrowUpRight,
  Truck,
} from 'lucide-react';

const VALUE_CHAIN_KEYS = [
  { id: 'rice', label: 'Rice (IVS & Bolilands)', icon: RicePaddyIcon, color: '#10b981' },
  { id: 'cassava', label: 'Cassava & HQCF Flour', icon: CassavaTuberIcon, color: '#f59e0b' },
  { id: 'cocoa', label: 'Cocoa & Coffee', icon: CocoaPodIcon, color: '#d97706' },
  { id: 'oil_palm', label: 'Oil Palm & CPO', icon: OilPalmIcon, color: '#059669' },
  { id: 'vegetables', label: 'Horticulture & Vegetables', icon: SolarIrrigationIcon, color: '#06b6d4' },
];

export const AgribusinessHubView: React.FC = () => {
  const [selectedChainKey, setSelectedChainKey] = useState<string>('rice');
  const [activeSubTab, setActiveSubTab] = useState<'value_chain' | 'matching_grants' | 'rural_finance' | 'offtakers'>(
    'value_chain'
  );

  const activeProfile: ValueChainAgribusinessProfile =
    VALUE_CHAIN_AGRIBUSINESS[selectedChainKey] || VALUE_CHAIN_AGRIBUSINESS.rice;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                AVDP Component 2
              </span>
              <span className="text-xs text-slate-400">Agribusiness &amp; Market Access Commercialization</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Agribusiness Systems Across All Value Chains
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Transforming subsistence smallholders into commercially viable agribusiness enterprises through the
              Matching Grant Facility (MGF), contract farming with private off-takers, rural financial intermediation
              via the Apex Bank, and modern Agricultural Business Centres (ABCs).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Total MGF Disbursed</span>
              <span className="text-sm font-extrabold text-emerald-400">$13.95 Million</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Private Capital Leveraged</span>
              <span className="text-sm font-extrabold text-amber-400">$9.40 Million</span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveSubTab('value_chain')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'value_chain'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Value Chain Agribusiness Profiles</span>
          </button>
          <button
            onClick={() => setActiveSubTab('matching_grants')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'matching_grants'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Matching Grant Facility (MGF Windows)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rural_finance')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'rural_finance'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Rural Credit &amp; Apex Bank</span>
          </button>
          <button
            onClick={() => setActiveSubTab('offtakers')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'offtakers'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Commercial Off-Taker Directory</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: VALUE CHAIN AGRIBUSINESS PROFILES */}
      {activeSubTab === 'value_chain' && (
        <div className="space-y-6">
          {/* Value Chain Picker Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {VALUE_CHAIN_KEYS.map((vc) => {
              const Icon = vc.icon;
              const isSelected = vc.id === selectedChainKey;
              return (
                <button
                  key={vc.id}
                  onClick={() => setSelectedChainKey(vc.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${vc.color}25`, color: vc.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate">{vc.label}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">Agribusiness Profile</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Chain Deep Dive Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Agribusiness Enterprise Model
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeProfile.chain}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">{activeProfile.businessModel}</p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeProfile.enterpriseKpis.map((kpi, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">{kpi.label}</span>
                    <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block">{kpi.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Pillars: Matching Grants, ABC Transformation, Rural Credit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Matching Grant Utilization */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>Matching Grant Allocation</span>
                </div>
                <div className="text-xs text-slate-200">
                  <span className="text-[10px] text-slate-400 block">Eligible Window:</span>
                  <p className="font-semibold text-emerald-300">{activeProfile.matchingGrantWindow}</p>
                </div>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Investments Funded:</span>
                  <p className="leading-relaxed">{activeProfile.grantUtilization}</p>
                </div>
              </div>

              {/* FBO to ABC Transition */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>ABC &amp; FBO Commercialization</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Operational ABCs:</span>
                  <span className="font-bold text-white">{activeProfile.fboToAbcTransition.abcsOperational} Hubs</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Linked Smallholder FBOs:</span>
                  <span className="font-bold text-emerald-400">
                    {activeProfile.fboToAbcTransition.activeFBOsLinked} Cooperatives
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block font-semibold mb-1">Commercial Services:</span>
                  <ul className="space-y-1">
                    {activeProfile.fboToAbcTransition.commercialServicesProvided.map((svc, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rural Finance & Warehousing */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <Warehouse className="w-4 h-4" />
                  <span>Aggregation, Storage &amp; Credit</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Active Warehouses:</span>
                  <span className="font-bold text-white">
                    {activeProfile.commercialAggregationAndStorage.warehousesCount} Sheds (
                    {activeProfile.commercialAggregationAndStorage.storageCapacityMT.toLocaleString()} MT)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Credit Disbursed:</span>
                  <span className="font-bold text-emerald-400">{activeProfile.ruralFinanceAndCredit.disbursedUSD}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Loan Repayment Rate:</span>
                  <span className="font-bold text-emerald-300">
                    {activeProfile.ruralFinanceAndCredit.repaymentRatePct}%
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block">Quality Testing Equipment:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeProfile.commercialAggregationAndStorage.qualityGradingEquipment.map((eq, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Formal Private Off-Takers for This Value Chain */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-emerald-400" />
                  <span>Contract Farming &amp; Private Off-Taker Agreements</span>
                </h4>
                <span className="text-[11px] text-slate-400">Legally binding forward purchase agreements</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeProfile.privateOffTakers.map((off, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {off.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{off.location}</span>
                      </div>
                      <h5 className="text-sm font-bold text-white mb-1">{off.name}</h5>
                      <div className="text-xs text-slate-300 space-y-1 my-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Annual Contract:</span>
                          <span className="font-semibold text-emerald-400">{off.annualVolumeContracted}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">"{off.pricingMechanism}"</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">Certifications:</span>
                      <div className="flex flex-wrap gap-1">
                        {off.certifications.map((c, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MATCHING GRANT FACILITY (MGF) WINDOWS */}
      {activeSubTab === 'matching_grants' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Total MGF Facility</span>
              <span className="text-xl font-extrabold text-white mt-1 block">
                ${(MATCHING_GRANT_FACILITY_SUMMARY.totalAllocatedUSD / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">IFAD &amp; AfDB Co-Financed</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Disbursed to Date</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                ${(MATCHING_GRANT_FACILITY_SUMMARY.totalDisbursedUSD / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {MATCHING_GRANT_FACILITY_SUMMARY.disbursementRatePct}% Disbursement Rate
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Private Capital Leveraged</span>
              <span className="text-xl font-extrabold text-amber-400 mt-1 block">
                ${(MATCHING_GRANT_FACILITY_SUMMARY.privateCapitalLeveragedUSD / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Beneficiary Equity Matching</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Beneficiary Enterprises</span>
              <span className="text-xl font-extrabold text-cyan-400 mt-1 block">
                {MATCHING_GRANT_FACILITY_SUMMARY.totalBeneficiaryEnterprises}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">FBOs, ABCs, &amp; Agro-SMEs</span>
            </div>
          </div>

          {/* 3 Windows Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MATCHING_GRANT_FACILITY_SUMMARY.windows.map((win) => (
              <div
                key={win.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/60 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-extrabold text-emerald-400">{win.title.split(':')[0]}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {win.completionRatePct}% Completed
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mt-2 mb-1">{win.title.split(':')[1]}</h4>
                  <p className="text-xs text-slate-300 mb-3">{win.target}</p>

                  <div className="space-y-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Grant Size Range:</span>
                      <span className="font-bold text-white">{win.grantRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Co-Financing Split:</span>
                      <span className="font-semibold text-emerald-400">
                        {win.grantSharePct}% Grant / {win.beneficiaryEquityPct}% Equity
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Disbursed:</span>
                      <span className="font-bold text-emerald-300">{win.disbursedUSD}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Beneficiaries Funded:</span>
                      <span className="font-bold text-cyan-400">{win.enterprisesCount} Enterprises</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold mb-1">Eligible Assets Funded:</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{win.supportedItems}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: RURAL FINANCE & APEX BANK */}
      {activeSubTab === 'rural_finance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Financial Intermediation
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Apex Bank of Sierra Leone &amp; Community Banking Network
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  {RURAL_FINANCE_ECOSYSTEM.apexBankOverview}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Total Disbursed</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    ${(RURAL_FINANCE_ECOSYSTEM.totalLoansDisbursedUSD / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Women Borrowers</span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {RURAL_FINANCE_ECOSYSTEM.womenBorrowersPct}%
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">PAR &gt; 30 Days</span>
                  <span className="text-sm font-extrabold text-cyan-400">
                    {RURAL_FINANCE_ECOSYSTEM.averagePortfolioAtRisk30Days}%
                  </span>
                </div>
              </div>
            </div>

            {/* Participating Community Banks & FSAs Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Key Participating Community Banks (CBs) &amp; Financial Services Associations (FSAs)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {RURAL_FINANCE_ECOSYSTEM.participatingInstitutions.map((inst, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{inst.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {inst.district}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Active Portfolio:</span>
                          <span className="font-bold text-emerald-400">{inst.activeAgriLoans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Portfolio Quality:</span>
                          <span className="font-bold text-emerald-300">{inst.portfolioQualityPct}% Current</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ALL COMMERCIAL OFF-TAKERS DIRECTORY */}
      {activeSubTab === 'offtakers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Handshake className="w-5 h-5 text-emerald-400" />
              <span>National Commercial Off-Taker &amp; Industrial Buyer Network</span>
            </h3>
            <span className="text-xs text-slate-400">15 Active Anchor Agro-Enterprises Linked across 16 Districts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(VALUE_CHAIN_AGRIBUSINESS).flatMap(([chainKey, profile]) =>
              profile.privateOffTakers.map((off, idx) => (
                <div
                  key={`${chainKey}-${idx}`}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/60 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {off.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{profile.chain.split(' ')[0]}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{off.name}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>📍</span> {off.location}
                    </span>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Annual Offtake:</span>
                        <span className="font-bold text-emerald-400">{off.annualVolumeContracted}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 pt-1 leading-relaxed italic border-t border-slate-850">
                        {off.pricingMechanism}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                    {off.certifications.map((cert, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-medium text-slate-300"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
