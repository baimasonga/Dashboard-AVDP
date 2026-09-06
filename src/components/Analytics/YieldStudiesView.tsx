import React, { useState, useMemo } from 'react';
import {
  YIELD_STUDIES_OVERVIEW,
  VALUE_CHAINS_YIELD_STUDIES,
  RESEARCH_PAPERS_CATALOG,
  ValueChainYieldStudy,
  ResearchPaperRecord,
} from '../../data/yieldStudiesData';
import {
  FlaskConical,
  Sprout,
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  DollarSign,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  Search,
  ExternalLink,
  Scale,
  Microscope,
  Calendar,
  Sparkles,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from 'recharts';

export function YieldStudiesView() {
  const [selectedCommodityKey, setSelectedCommodityKey] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'trajectory' | 'determinants' | 'economics' | 'districts' | 'papers'
  >('overview');
  const [searchPaperQuery, setSearchPaperQuery] = useState<string>('');
  const [selectedStudyModal, setSelectedStudyModal] = useState<ValueChainYieldStudy | null>(null);

  // Selected study for single-commodity view
  const currentStudy = useMemo(() => {
    return VALUE_CHAINS_YIELD_STUDIES.find((s) => s.commodityKey === selectedCommodityKey) || null;
  }, [selectedCommodityKey]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    if (!searchPaperQuery.trim()) return RESEARCH_PAPERS_CATALOG;
    const q = searchPaperQuery.toLowerCase();
    return RESEARCH_PAPERS_CATALOG.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.leadAuthors.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.targetCommodity.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q)
    );
  }, [searchPaperQuery]);

  // Overall Comparative Chart Data
  const comparativeYieldData = useMemo(() => {
    return VALUE_CHAINS_YIELD_STUDIES.map((s) => ({
      name: s.commodityName.split(' ')[0],
      fullName: s.commodityName,
      unit: s.unit,
      baseline: s.baselineYield2019,
      control: s.counterfactualControlYield,
      midterm: s.midtermYield2023,
      closureAchieved: s.projectClosureAchieved2027,
      gainPct: s.netAttributableGainPct,
    }));
  }, []);

  // Comparative Economic Gross Margin Data
  const comparativeMarginData = useMemo(() => {
    return VALUE_CHAINS_YIELD_STUDIES.map((s) => ({
      name: s.commodityName.split(' ')[0],
      controlMargin: s.netGrossMarginPerHaUSD.control,
      avdpMargin: s.netGrossMarginPerHaUSD.avdpTrained,
      marginMultiplier: (s.netGrossMarginPerHaUSD.avdpTrained / s.netGrossMarginPerHaUSD.control).toFixed(1),
    }));
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Commodity',
      'Scientific Name',
      'Ecosystem / Sub-Type',
      'Unit',
      'Study Title',
      'Lead Research Institution',
      'Sample Size (Plots)',
      'Sample Size (Farmers)',
      'Baseline Yield (2019)',
      'Control Counterfactual Yield',
      'Midterm Yield (2023)',
      'AVDP Closure Achieved Yield (2027)',
      'Net Attributable Gain (%)',
      'Quality Parameter Name',
      'Quality Baseline',
      'Quality Achieved',
      'Cost per Ha - Control (USD)',
      'Cost per Ha - AVDP (USD)',
      'Net Margin - Control (USD/Ha)',
      'Net Margin - AVDP (USD/Ha)',
      'ROI - Control',
      'ROI - AVDP',
      'Labor Productivity - Control ($/day)',
      'Labor Productivity - AVDP ($/day)',
    ];

    const rows = VALUE_CHAINS_YIELD_STUDIES.map((s) => [
      `"${s.commodityName}"`,
      `"${s.scientificName}"`,
      `"${s.subTypeOrEcosystem}"`,
      `"${s.unit}"`,
      `"${s.studyTitle}"`,
      `"${s.leadResearchAgency}"`,
      s.sampleSizePlots,
      s.sampleSizeFarmers,
      s.baselineYield2019,
      s.counterfactualControlYield,
      s.midtermYield2023,
      s.projectClosureAchieved2027,
      s.netAttributableGainPct,
      `"${s.qualityParameterName}"`,
      `"${s.qualityBaselineValue}"`,
      `"${s.qualityAchievedValue}"`,
      s.costOfProductionPerHaUSD.control,
      s.costOfProductionPerHaUSD.avdpTrained,
      s.netGrossMarginPerHaUSD.control,
      s.netGrossMarginPerHaUSD.avdpTrained,
      s.returnOnInvestmentRatio.control,
      s.returnOnInvestmentRatio.avdpTrained,
      s.laborProductivityUSDPerDay.control,
      s.laborProductivityUSDPerDay.avdpTrained,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AVDP_Empirical_Yield_Studies_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const FACTOR_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div id="yield-studies-main-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Yield Studies &amp; Agronomic Research
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  {YIELD_STUDIES_OVERVIEW.lifecycleSpan} &bull; {YIELD_STUDIES_OVERVIEW.statisticalConfidenceInterval}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Randomized crop-cut trials, counterfactual control benchmarking, and microeconomic gross margin evaluations across all 5 AVDP value chains.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            id="btn-export-yield-studies-csv"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Complete Dataset CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Sampled Crop-Cut Plots</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {YIELD_STUDIES_OVERVIEW.totalCropCutPlotsSampled.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across <strong className="text-white font-mono">{YIELD_STUDIES_OVERVIEW.totalSmallholderHouseholdsSurveyed.toLocaleString()}</strong> households in 16 districts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Overall Average Gain</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-300 font-mono mt-2">
            +{YIELD_STUDIES_OVERVIEW.averageYieldGainOverallPct}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Statistically Proven (p &lt; 0.001)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Counterfactual Outperformance</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-2">
            +114.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Over non-beneficiary control farm plots
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Net Margin Gain</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-2">
            +$1,090 <span className="text-xs font-normal text-slate-400">/Ha</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            +275% Increase in Smallholder Profit
          </div>
        </div>
      </div>

      {/* Research Partners Tag Strip */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Scientific Collaborative Partners:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {YIELD_STUDIES_OVERVIEW.participatingResearchInstitutes.map((inst, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
            >
              {inst}
            </span>
          ))}
        </div>
      </div>

      {/* Commodity Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setSelectedCommodityKey('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCommodityKey === 'all'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All 5 Value Chains Overview
        </button>

        {VALUE_CHAINS_YIELD_STUDIES.map((study) => (
          <button
            key={study.commodityKey}
            type="button"
            onClick={() => setSelectedCommodityKey(study.commodityKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCommodityKey === study.commodityKey
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{study.commodityName}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                selectedCommodityKey === study.commodityKey
                  ? 'bg-slate-950 text-emerald-300'
                  : 'bg-slate-800 text-emerald-400'
              }`}
            >
              +{study.netAttributableGainPct}%
            </span>
          </button>
        ))}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Comparative Studies Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('trajectory')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'trajectory'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Yield Trajectory &amp; Counterfactual
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('determinants')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'determinants'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Agronomic Yield Determinants
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('economics')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'economics'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Gross Margins &amp; ROI Economics
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('districts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'districts'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          District Agro-Ecological Variations
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('papers')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'papers'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Research Papers Catalog ({RESEARCH_PAPERS_CATALOG.length})
        </button>
      </div>

      {/* Content Pane 1: Comparative Studies Matrix */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart: Yield Gain Across Value Chains */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Baseline vs. Control vs. AVDP Closure Achieved Yield</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Empirical crop-cut results demonstrating statistically validated gains across all 5 value chains.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeYieldData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                      formatter={(val: any, name: string) => [
                        `${val}`,
                        name === 'baseline'
                          ? 'Baseline 2019'
                          : name === 'control'
                          ? 'Counterfactual Control'
                          : 'AVDP Achieved 2027',
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="baseline" name="Baseline (2019)" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="control" name="Control (Non-AVDP)" fill="#475569" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="closureAchieved" name="AVDP Closure (2027)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Net Gross Margin Comparison */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>Net Smallholder Gross Margin Comparison ($/Hectare)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Net income per hectare after deducting all seed, fertilizer, labor, and mechanization costs.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeMarginData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`$${val}/Ha`, '']}
                    />
                    <Legend />
                    <Bar dataKey="controlMargin" name="Control ($/Ha)" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avdpMargin" name="AVDP Trained ($/Ha)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Master Yield Studies Table */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Empirical Value Chain Agronomic Study Register</h3>
              <span className="text-xs text-slate-400">Sample: 4,820 Randomized Plots</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Value Chain</th>
                  <th className="py-2.5 px-3 font-semibold">Scientific Partner</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Baseline (2019)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Control Farm</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Midterm (2023)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Closure (2027)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Net Gain %</th>
                  <th className="py-2.5 px-3 font-semibold">Quality Transformation</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {VALUE_CHAINS_YIELD_STUDIES.map((study) => (
                  <tr key={study.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <strong className="text-white block">{study.commodityName}</strong>
                      <span className="text-[10px] text-slate-500 italic block">{study.scientificName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Unit: {study.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-[200px]">
                      <span className="line-clamp-1">{study.leadResearchAgency}</span>
                      <span className="text-[10px] text-emerald-400 font-mono block">N = {study.sampleSizePlots} Plots</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {study.baselineYield2019}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {study.counterfactualControlYield}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sky-400">
                      {study.midtermYield2023}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {study.projectClosureAchieved2027}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      +{study.netAttributableGainPct}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-[220px]">
                      <span className="text-[10px] text-slate-400 block font-medium">{study.qualityParameterName}:</span>
                      <span className="text-emerald-400 font-mono text-[11px] block">{study.qualityAchievedValue}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCommodityKey(study.commodityKey);
                          setSelectedStudyModal(study);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        Deep Dive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Pane 2: Yield Trajectory & Counterfactual Comparison */}
      {activeSubTab === 'trajectory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUE_CHAINS_YIELD_STUDIES.map((study) => {
              const trajectoryData = [
                { stage: 'Baseline (2019)', yield: study.baselineYield2019 },
                { stage: 'Control Counterfactual', yield: study.counterfactualControlYield },
                { stage: 'Midterm (2023)', yield: study.midtermYield2023 },
                { stage: 'AVDP Closure (2027)', yield: study.projectClosureAchieved2027 },
              ];

              return (
                <div key={study.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{study.commodityName}</h4>
                      <p className="text-[11px] text-slate-400">{study.subTypeOrEcosystem}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      +{study.netAttributableGainPct}%
                    </span>
                  </div>

                  {/* Mini-chart */}
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trajectoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="stage" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.5rem',
                            fontSize: '10px',
                          }}
                          formatter={(v: any) => [`${v} ${study.unit}`, 'Yield']}
                        />
                        <Bar dataKey="yield" fill="#10b981" radius={[3, 3, 0, 0]}>
                          {trajectoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? '#64748b' : index === 1 ? '#475569' : index === 2 ? '#0ea5e9' : '#10b981'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baseline (2019):</span>
                      <span className="font-mono text-slate-300">
                        {study.baselineYield2019} {study.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Control Group (Non-AVDP):</span>
                      <span className="font-mono text-slate-300">
                        {study.counterfactualControlYield} {study.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Project Closure Achieved:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {study.projectClosureAchieved2027} {study.unit}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 text-[10px] text-slate-500">
                      <span>Statistical Power: {study.pValSignificance}</span>
                      <span>Cohen's d: {study.cohenEffectSize}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Pane 3: Agronomic Yield Determinants */}
      {activeSubTab === 'determinants' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Multi-Factor Variance Decomposition:</strong> These empirical weights reflect the percentage contribution of individual agronomic practices to the overall observed yield gains, determined via multivariable econometric regression analysis conducted by Njala University and SLARI.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(currentStudy ? [currentStudy] : VALUE_CHAINS_YIELD_STUDIES).map((study) => (
              <div key={study.id} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{study.commodityName}</h3>
                    <p className="text-xs text-emerald-400 font-mono">Net Attributable Gain: +{study.netAttributableGainPct}%</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">N = {study.sampleSizePlots} Plots</span>
                </div>

                <div className="space-y-3">
                  {study.yieldDeterminants.map((factor, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{factor.factor}</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {factor.contributionPct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${factor.contributionPct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Pane 4: Gross Margins & ROI Economics */}
      {activeSubTab === 'economics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUE_CHAINS_YIELD_STUDIES.map((study) => {
              const profitGain = study.netGrossMarginPerHaUSD.avdpTrained - study.netGrossMarginPerHaUSD.control;
              const profitMultiplier = (
                study.netGrossMarginPerHaUSD.avdpTrained / study.netGrossMarginPerHaUSD.control
              ).toFixed(1);

              return (
                <div key={study.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{study.commodityName}</h4>
                      <p className="text-[11px] text-slate-400">Per-Hectare Farm Budget Model</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      {profitMultiplier}x Net Profit
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Control Farm</span>
                      <div className="font-mono text-slate-300 font-bold text-base mt-0.5">
                        ${study.netGrossMarginPerHaUSD.control}
                      </div>
                      <span className="text-[10px] text-slate-500 block">Net Margin/Ha</span>
                    </div>

                    <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-800/60">
                      <span className="text-[10px] text-emerald-300 block">AVDP Trained</span>
                      <div className="font-mono text-emerald-400 font-extrabold text-base mt-0.5">
                        ${study.netGrossMarginPerHaUSD.avdpTrained}
                      </div>
                      <span className="text-[10px] text-emerald-400 block">+${profitGain}/Ha Extra</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production Cost:</span>
                      <span className="font-mono text-slate-200">
                        ${study.costOfProductionPerHaUSD.control} &rarr; ${study.costOfProductionPerHaUSD.avdpTrained}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Revenue:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ${study.grossRevenuePerHaUSD.control} &rarr; ${study.grossRevenuePerHaUSD.avdpTrained}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Benefit-Cost Ratio (ROI):</span>
                      <span className="font-mono text-slate-300">
                        {study.returnOnInvestmentRatio.control}:1 &rarr;{' '}
                        <strong className="text-white">{study.returnOnInvestmentRatio.avdpTrained}:1</strong>
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/50">
                      <span className="text-slate-400">Labor Productivity:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ${study.laborProductivityUSDPerDay.avdpTrained}/day (vs. ${study.laborProductivityUSDPerDay.control})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Pane 5: District Agro-Ecological Variations */}
      {activeSubTab === 'districts' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-2">District-by-District Crop-Cut Trial Performance</h3>
            <p className="text-xs text-slate-400 mb-4">
              Geographic yield variations illustrating treatment response across diverse soil profiles and rainfall belts.
            </p>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Commodity</th>
                  <th className="py-2.5 px-3 font-semibold">District</th>
                  <th className="py-2.5 px-3 font-semibold">Agro-Ecological Zone</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Control Yield</th>
                  <th className="py-2.5 px-3 font-semibold text-right">AVDP Yield</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Gain %</th>
                  <th className="py-2.5 px-3 font-semibold">Primary Soil / Climate Limitation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {VALUE_CHAINS_YIELD_STUDIES.flatMap((study) =>
                  study.districtVariations.map((v, i) => (
                    <tr key={`${study.id}-${v.district}-${i}`} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{study.commodityName.split(' ')[0]}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{v.district}</td>
                      <td className="py-2.5 px-3 text-slate-400">{v.agroZone}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {v.controlYield} {study.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {v.treatmentYield} {study.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">+{v.gainPct}%</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{v.primarySoilLimitation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Pane 6: Research Papers Catalog */}
      {activeSubTab === 'papers' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search publications, authors, commodity, or methodology..."
                value={searchPaperQuery}
                onChange={(e) => setSearchPaperQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredPapers.length}</span> scientific publications
            </div>
          </div>

          <div className="space-y-3">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                      {paper.doiOrRef} &bull; {paper.targetCommodity}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">{paper.title}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{paper.leadAuthors}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{paper.year}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{paper.abstract}</p>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    Institution: <strong className="text-slate-300">{paper.institution}</strong>
                  </span>
                  <span>
                    Published in: <strong className="text-slate-300">{paper.journalOrSeries}</strong>
                  </span>
                  <span className="text-emerald-400 font-mono font-medium">{paper.sampleDescription}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Study Detail */}
      {selectedStudyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedStudyModal.subTypeOrEcosystem}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedStudyModal.studyTitle}</h3>
                <p className="text-xs text-slate-400">
                  Lead Agency: {selectedStudyModal.leadResearchAgency} ({selectedStudyModal.publicationYear})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudyModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-300">Methodology &amp; Sampling Rigor:</span>
                <p className="text-slate-400 leading-relaxed">{selectedStudyModal.methodologyDescription}</p>
                <div className="pt-1 flex justify-between text-[11px] text-emerald-400 font-mono">
                  <span>Significance: {selectedStudyModal.pValSignificance}</span>
                  <span>Cohen's Effect Size: {selectedStudyModal.cohenEffectSize}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Key Empirical Findings:</span>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-400">
                  {selectedStudyModal.keyFindings.map((f, i) => (
                    <li key={i} className="leading-relaxed">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-1">Policy &amp; Extension Recommendations:</span>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-400">
                  {selectedStudyModal.policyRecommendations.map((r, i) => (
                    <li key={i} className="leading-relaxed">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
