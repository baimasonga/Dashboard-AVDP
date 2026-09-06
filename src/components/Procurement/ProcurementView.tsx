import React, { useState, useMemo } from 'react';
import {
  PROCUREMENT_OVERVIEW_METRICS,
  PROCUREMENT_CATEGORIES_SUMMARY,
  PROCUREMENT_METHODS_METRICS,
  REPRESENTATIVE_CONTRACTS,
  ProcurementContract,
} from '../../data/procurementData';
import {
  Briefcase,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Building,
  TrendingUp,
  FileText,
  ShieldCheck,
  ChevronRight,
  Layers,
  ArrowUpRight,
  DollarSign,
  Truck,
  Wrench,
  Percent,
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
} from 'recharts';

export function ProcurementView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'register' | 'categories' | 'methods' | 'local_content'>('register');
  const [selectedContractModal, setSelectedContractModal] = useState<ProcurementContract | null>(null);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return REPRESENTATIVE_CONTRACTS.filter((c) => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchMethod = selectedMethod === 'All' || c.procurementMethod === selectedMethod;
      const matchStatus = selectedStatus === 'All' || c.executionStatus === selectedStatus;
      const matchSearch =
        !searchQuery.trim() ||
        c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.awardedContractorOrFirm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.districtCovered.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchMethod && matchStatus && matchSearch;
    });
  }, [selectedCategory, selectedMethod, selectedStatus, searchQuery]);

  // Unique Filter Lists
  const categoryList = ['All', 'Civil Works', 'Goods & Machinery', 'Consulting Services', 'Non-Consulting Services'];
  const methodList = ['All', 'NCB', 'ICB', 'QCBS', 'CQS', 'RFQ', 'Direct Contracting'];
  const statusList = ['All', 'Completed', 'Ongoing / On-Track', 'Under Defect Liability'];

  // Format currency helper
  const formatUSD = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${val.toLocaleString()}`;
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Contract Number',
      'Title',
      'Category',
      'Method',
      'Awarded Contractor / Firm',
      'Origin',
      'Contract Value (USD)',
      'Engineers Estimate (USD)',
      'Cost Savings (USD)',
      'Award Date',
      'Contractual Completion',
      'Actual Completion',
      'Execution Status',
      'Completion %',
      'IFAD No-Objection Date',
      'District Covered',
    ];

    const rows = filteredContracts.map((c) => [
      `"${c.contractNumber}"`,
      `"${c.title}"`,
      `"${c.category}"`,
      `"${c.procurementMethod}"`,
      `"${c.awardedContractorOrFirm}"`,
      `"${c.origin}"`,
      c.contractValueUSD,
      c.engineersEstimateUSD,
      c.savingsUSD,
      `"${c.awardDate}"`,
      `"${c.contractualCompletionDate}"`,
      `"${c.actualOrAnticipatedCompletionDate}"`,
      `"${c.executionStatus}"`,
      c.completionPct,
      `"${c.ifadNoObjectionDate}"`,
      `"${c.districtCovered}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AVDP_Procurement_Contracts_Register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Data: Categories
  const categoryChartData = PROCUREMENT_CATEGORIES_SUMMARY.map((c) => ({
    category: c.category,
    committed: c.totalCommittedUSD / 1000000,
    disbursed: c.totalDisbursedUSD / 1000000,
    localContent: c.localContentPct,
  }));

  // Chart Data: Methods Lead Time
  const methodChartData = PROCUREMENT_METHODS_METRICS.map((m) => ({
    method: m.method,
    leadTime: m.averageLeadTimeDays,
    value: m.totalValueUSD / 1000000,
    contracts: m.contractsCount,
  }));

  return (
    <div id="procurement-main-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Procurement &amp; Contract Administration
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                IFAD Guidelines &amp; NPPA Standards &bull; {PROCUREMENT_OVERVIEW_METRICS.lifecycleSpan}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Contract award register, civil works execution, goods deliveries, consulting studies, and local supplier participation.
            </p>
          </div>
        </div>

        <button
          id="btn-export-procurement-csv"
          onClick={handleExportCSV}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Contracts CSV</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Procurement Volume</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {formatUSD(PROCUREMENT_OVERVIEW_METRICS.totalProcurementValueUSD)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across <strong className="text-white font-mono">{PROCUREMENT_OVERVIEW_METRICS.totalContractsAwarded} Total Contracts</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Local Sierra Leone Content</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-300 font-mono mt-2">
            {PROCUREMENT_OVERVIEW_METRICS.localSupplierSharePct}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Awarded to Registered National Firms</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Lead Time</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-2">
            {PROCUREMENT_OVERVIEW_METRICS.averageProcurementLeadTimeDays} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            Below IFAD 90-Day Benchmark (8 Days Faster)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cost Savings vs Estimate</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-2">
            {formatUSD(PROCUREMENT_OVERVIEW_METRICS.cumulativeCostSavingsUSD)}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {PROCUREMENT_OVERVIEW_METRICS.ifadNoObjectionComplianceRatePct}% IFAD No-Objection Clearance
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'register'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Contract Register &amp; Execution Matrix ({filteredContracts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Procurement Categories (Works, Goods, Services)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('methods')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'methods'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Procurement Methods &amp; Lead Times
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('local_content')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'local_content'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Local Content &amp; Value Retention
        </button>
      </div>

      {/* Tab 1: Contract Register */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contract number, title, contractor, district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>

              {/* Method Filter */}
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {methodList.map((m) => (
                  <option key={m} value={m}>
                    Method: {m}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {statusList.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredContracts.length}</span> procurement packages
            </div>
          </div>

          {/* Table */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Contract Ref &amp; Package</th>
                  <th className="py-2.5 px-3 font-semibold">Category &amp; Method</th>
                  <th className="py-2.5 px-3 font-semibold">Contractor / Firm</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Value (USD)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Progress</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContracts.map((cnt) => (
                  <tr key={cnt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 max-w-[280px]">
                      <span className="font-mono font-bold text-emerald-400 text-[11px] block">
                        {cnt.contractNumber}
                      </span>
                      <span className="text-white font-medium text-xs line-clamp-1">{cnt.title}</span>
                      <span className="text-[10px] text-slate-400 block">{cnt.districtCovered}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-300 block">{cnt.category}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono text-[10px] inline-block mt-0.5">
                        {cnt.procurementMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px]">
                      <span className="text-slate-200 font-medium block truncate">{cnt.awardedContractorOrFirm}</span>
                      <span className="text-[10px] text-slate-500 block">{cnt.origin}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {formatUSD(cnt.contractValueUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="w-16 bg-slate-950 rounded-full h-1.5 mx-auto overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${cnt.completionPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-1 block">{cnt.completionPct}%</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                          cnt.executionStatus === 'Completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : cnt.executionStatus === 'Ongoing / On-Track'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {cnt.executionStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedContractModal(cnt)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Procurement Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Committed vs. Disbursed by Category (in Millions USD)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Works (Feeder roads, IVS bunds, ABCs) represent over 56% of total procurement capital.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`$${val}M`, '']}
                    />
                    <Legend />
                    <Bar dataKey="committed" name="Committed ($M)" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="disbursed" name="Disbursed ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROCUREMENT_CATEGORIES_SUMMARY.map((cat) => (
                <div key={cat.category} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cat.category}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {cat.contractsCount} Packages
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-white font-mono">
                    {formatUSD(cat.totalCommittedUSD)}
                  </div>
                  <div className="space-y-1 pt-1.5 border-t border-slate-800/80 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Disbursed:</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatUSD(cat.totalDisbursedUSD)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Execution Rate:</span>
                      <span className="font-mono text-sky-400 font-bold">{cat.averageExecutionPct}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Local Content:</span>
                      <span className="font-mono text-amber-400 font-bold">{cat.localContentPct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Methods & Lead Times */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Average Procurement Lead Time by Method (Days)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Elapsed calendar days from bid document publication to contract signature.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={methodChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="method" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`${val} Days`, 'Lead Time']}
                    />
                    <Bar dataKey="leadTime" name="Lead Time (Days)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
              <h4 className="text-xs font-bold text-white mb-2">IFAD Prior vs. Post Review Audits by Method</h4>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Method</th>
                    <th className="py-2.5 px-3 font-semibold">Contracts</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total ($M)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Prior Review</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Post Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {PROCUREMENT_METHODS_METRICS.map((m) => (
                    <tr key={m.method} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white block">{m.method}</span>
                        <span className="text-[10px] text-slate-500 block">{m.fullName}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{m.contractsCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        ${(m.totalValueUSD / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-300">{m.ifadPriorReviewCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-sky-300">{m.ifadPostReviewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Local Content */}
      {activeTab === 'local_content' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Sierra Leone Local Content &amp; Value Retention Policy</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              In accordance with national public procurement regulations and IFAD rural economic empowerment targets, AVDP gives margin-of-preference to qualified domestic contractors and suppliers. This policy has channeled over <strong>$44.2 Million (68.2%)</strong> directly into Sierra Leonean small-and-medium enterprises.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-xs">Civil Works Local Share</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">74.0%</div>
                <p className="text-[11px] text-slate-500">Gravel roads, masonry culverts, ABC drying floors</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-xs">Consulting Local Share</span>
                <div className="text-xl font-bold text-sky-400 font-mono">65.0%</div>
                <p className="text-[11px] text-slate-500">Njala University, national engineering survey firms</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-xs">Non-Consulting Local Share</span>
                <div className="text-xl font-bold text-purple-400 font-mono">88.0%</div>
                <p className="text-[11px] text-slate-500">Community logistics, farmer training facilitators</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContractModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedContractModal.contractNumber}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedContractModal.title}</h3>
                <p className="text-xs text-slate-400">{selectedContractModal.districtCovered}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contractor / Firm:</span>
                  <span className="font-bold text-white">{selectedContractModal.awardedContractorOrFirm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Origin / Registration:</span>
                  <span className="text-slate-200">{selectedContractModal.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Procurement Method:</span>
                  <span className="font-mono text-slate-200">{selectedContractModal.procurementMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFAD No-Objection:</span>
                  <span className="font-mono text-emerald-400">{selectedContractModal.ifadNoObjectionDate}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-300">Deliverables &amp; Scope Summary:</span>
                <p className="text-slate-400 leading-relaxed">{selectedContractModal.deliverablesSummary}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Contract Value</span>
                  <span className="font-bold text-white font-mono text-xs">
                    {formatUSD(selectedContractModal.contractValueUSD)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Engineer Estimate</span>
                  <span className="font-bold text-slate-300 font-mono text-xs">
                    {formatUSD(selectedContractModal.engineersEstimateUSD)}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
                  <span className="text-[10px] text-emerald-300 block">Cost Savings</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    +{formatUSD(selectedContractModal.savingsUSD)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Award Date: <strong className="text-slate-200 font-mono">{selectedContractModal.awardDate}</strong></span>
                <span>Completion: <strong className="text-slate-200 font-mono">{selectedContractModal.actualOrAnticipatedCompletionDate}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
