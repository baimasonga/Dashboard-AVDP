import React, { useState } from 'react';
import {
  FINANCE_OVERVIEW_METRICS,
  FUNDING_SOURCES,
  COMPONENT_EXPENDITURES,
  ANNUAL_DISBURSEMENTS,
  MATCHING_GRANT_WINDOWS,
  FundingSource,
  ComponentExpenditure,
} from '../../data/financeData';
import {
  DollarSign,
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle2,
  Download,
  Filter,
  ArrowUpRight,
  Layers,
  Sparkles,
  CreditCard,
  Wallet,
  Coins,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function FinancialInformationView() {
  const [currency, setCurrency] = useState<'USD' | 'NLE'>('USD');
  const [activeTab, setActiveTab] = useState<'components' | 'donors' | 'trajectory' | 'matching_grants'>('components');
  const [selectedComponent, setSelectedComponent] = useState<ComponentExpenditure | null>(COMPONENT_EXPENDITURES[0]);

  // Exchange rate helper
  const fxRate = FINANCE_OVERVIEW_METRICS.fxRateUsdToNle;

  const formatMoney = (usdValue: number) => {
    if (currency === 'USD') {
      if (usdValue >= 1000000) {
        return `$${(usdValue / 1000000).toFixed(2)}M`;
      }
      return `$${usdValue.toLocaleString()}`;
    } else {
      const nleValue = usdValue * fxRate;
      if (nleValue >= 1000000) {
        return `NLe ${(nleValue / 1000000).toFixed(2)}M`;
      }
      return `NLe ${Math.round(nleValue).toLocaleString()}`;
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Component Code',
      'Component Name',
      'Budget Allocated (USD)',
      'Actual Expenditure (USD)',
      'Expenditure Rate %',
      'Committed Contracts (USD)',
      'Remaining Balance (USD)',
      'Lead Agency',
    ];

    const rows = COMPONENT_EXPENDITURES.map((c) => [
      `"${c.componentCode}"`,
      `"${c.componentName}"`,
      c.budgetAllocatedUSD,
      c.actualExpenditureUSD,
      c.expenditureRatePct,
      c.committedContractsUSD,
      c.remainingBalanceUSD,
      `"${c.leadResponsibleAgency}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AVDP_Financial_Expenditure_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Data: Donors
  const donorChartData = FUNDING_SOURCES.map((s) => ({
    name: s.donorName.split(' ')[0] + ' ' + (s.donorName.split(' ')[1] || ''),
    commitment: s.totalCommitmentUSD / 1000000,
    disbursed: s.disbursedUSD / 1000000,
    rate: s.disbursementRatePct,
  }));

  // Chart Data: Annual Trajectory
  const annualTrajectoryData = ANNUAL_DISBURSEMENTS.map((d) => ({
    year: d.year.toString(),
    targetAnnual: d.annualTargetUSD / 1000000,
    actualAnnual: d.actualDisbursedUSD / 1000000,
    cumulativeDisbursed: d.cumulativeDisbursedUSD / 1000000,
    status: d.status,
  }));

  // Pie colors
  const DONOR_COLORS = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#ec4899', '#64748b'];

  return (
    <div id="financial-main-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Financial Information &amp; Budget Execution
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                Multi-Donor Program &bull; {FINANCE_OVERVIEW_METRICS.extendedLifecycleSpan}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Financing sources, component budget absorption, annual disbursement trajectory, and audit compliance.
            </p>
          </div>
        </div>

        {/* Currency & Export controls */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currency === 'USD' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('NLE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currency === 'NLE' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              NLe (New Leone)
            </button>
          </div>

          <button
            id="btn-export-finance-csv"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Financing Envelope</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {formatMoney(FINANCE_OVERVIEW_METRICS.totalFinancingEnvelopeUSD)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            IFAD, OFID, Adaptation Fund, GoSL &amp; Equity
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cumulative Disbursements</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-300 font-mono mt-2">
            {formatMoney(FINANCE_OVERVIEW_METRICS.cumulativeDisbursementUSD)}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{FINANCE_OVERVIEW_METRICS.overallDisbursementRatePct}% Overall Absorption Rate</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">GoSL Counterpart Flow</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-2">
            {formatMoney(FINANCE_OVERVIEW_METRICS.counterpartGoSLDisbursedUSD)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Of {formatMoney(FINANCE_OVERVIEW_METRICS.counterpartGoSLCommittedUSD)} ({FINANCE_OVERVIEW_METRICS.counterpartDisbursementRatePct}% Delivered)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Audit &amp; IFR Governance</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-2">
            100% Clean
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {FINANCE_OVERVIEW_METRICS.auditsCompletedCount} Unqualified Independent Audits
          </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'components'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Component Budget &amp; Absorption
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('donors')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'donors'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Financier Commitments ({FUNDING_SOURCES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('trajectory')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'trajectory'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Disbursement Trajectory (2019–2027)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matching_grants')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'matching_grants'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Rural Matching Grants &amp; Microfinance
        </button>
      </div>

      {/* Tab 1: Component Expenditures */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {COMPONENT_EXPENDITURES.map((comp) => {
              const isSelected = selectedComponent?.componentCode === comp.componentCode;

              return (
                <div
                  key={comp.componentCode}
                  onClick={() => setSelectedComponent(comp)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-emerald-400">{comp.componentCode}</span>
                    <span className="font-bold text-slate-300 font-mono">{comp.expenditureRatePct}% Disbursed</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 min-h-[2rem]">
                    {comp.componentName}
                  </h4>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${comp.expenditureRatePct}%` }}
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Allocated:</span>
                      <span className="font-mono text-slate-200">{formatMoney(comp.budgetAllocatedUSD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disbursed:</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatMoney(comp.actualExpenditureUSD)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-component Detailed Breakdown */}
          {selectedComponent && (
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{selectedComponent.componentCode} Detailed Breakdown</span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">{selectedComponent.componentName}</h3>
                </div>
                <div className="text-xs text-slate-400">
                  Lead Agency: <strong className="text-slate-200">{selectedComponent.leadResponsibleAgency}</strong>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300">Sub-Component Budget Allocations &amp; Realized Spend:</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedComponent.subComponents.map((sub, idx) => {
                    const subRate = Math.round((sub.spentUSD / sub.allocatedUSD) * 100);

                    return (
                      <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-white leading-snug">{sub.title}</div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${subRate}%` }} />
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Absorption:</span>
                          <span className="font-mono text-emerald-400 font-bold">{subRate}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Spent / Allocated:</span>
                          <span className="font-mono text-slate-200">
                            {formatMoney(sub.spentUSD)} / {formatMoney(sub.allocatedUSD)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
                <span>Committed in Executing Contracts: <strong className="text-white font-mono">{formatMoney(selectedComponent.committedContractsUSD)}</strong></span>
                <span>Uncommitted Balance: <strong className="text-emerald-400 font-mono">{formatMoney(selectedComponent.remainingBalanceUSD)}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Financiers & Donors */}
      {activeTab === 'donors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Bar Chart of Donor Disbursements */}
            <div className="lg:col-span-2 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-400" />
                <span>Financier Commitment vs. Actual Disbursement (in Millions USD)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Tracking co-financier drawdowns against legal financing agreements.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donorChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                      formatter={(val: any) => [`$${val}M`, '']}
                    />
                    <Legend />
                    <Bar dataKey="commitment" name="Commitment ($M)" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="disbursed" name="Disbursed ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donor Shares Pie */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Financing Share Proportion</h4>
                <p className="text-[11px] text-slate-400 mb-3">Total project envelope breakdown.</p>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={FUNDING_SOURCES}
                        dataKey="totalCommitmentUSD"
                        nameKey="donorName"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {FUNDING_SOURCES.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DONOR_COLORS[index % DONOR_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`$${(val / 1000000).toFixed(1)}M`, 'Envelope']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>IFAD Loan ($45.0M)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                  <span>OFID Co-Financing ($20.0M)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  <span>GoSL Counterpart ($12.0M)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Sources */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Funding Partner / Donor</th>
                  <th className="py-2.5 px-3 font-semibold">Facility Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Commitment</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Disbursed</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Rate %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Undrawn Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {FUNDING_SOURCES.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{src.donorName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{src.type}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                      {formatMoney(src.totalCommitmentUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      {formatMoney(src.disbursedUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">
                      {src.disbursementRatePct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatMoney(src.undrawnBalanceUSD)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Trajectory (2019–2027) */}
      {activeTab === 'trajectory' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Year-by-Year Disbursement Curve (2019–2027 Extended Lifecycle)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Annual expenditure vs. cumulative financial absorption progression in Millions USD.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={annualTrajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
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
                  <Line
                    type="monotone"
                    dataKey="targetAnnual"
                    name="Annual Planned ($M)"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualAnnual"
                    name="Actual Annual Disbursed ($M)"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeDisbursed"
                    name="Cumulative Total Disbursed ($M)"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Verification Table */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
            <h4 className="text-xs font-bold text-white mb-2">Annual Financial Audit &amp; Counterpart Record</h4>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Fiscal Year</th>
                  <th className="py-2.5 px-3 font-semibold">Lifecycle Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Planned (USD)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actual Disbursed (USD)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cumulative Total</th>
                  <th className="py-2.5 px-3 font-semibold text-right">GoSL Counterpart</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Audit Opinion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ANNUAL_DISBURSEMENTS.map((rec) => (
                  <tr key={rec.year} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-mono text-white">{rec.year}</td>
                    <td className="py-2.5 px-3 text-slate-400">{rec.status}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatMoney(rec.annualTargetUSD)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      {formatMoney(rec.actualDisbursedUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sky-400 font-bold">
                      {formatMoney(rec.cumulativeDisbursedUSD)} ({rec.cumulativeRatePct}%)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                      {formatMoney(rec.counterpartContributionUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{rec.externalAuditOpinion}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Matching Grants */}
      {activeTab === 'matching_grants' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MATCHING_GRANT_WINDOWS.map((win, idx) => (
              <div key={idx} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {win.revolvingRepaymentRatePct}% Recovery Rate
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">{win.windowName}</h4>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Window Fund:</span>
                    <span className="font-mono text-white font-bold">{formatMoney(win.totalFundUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disbursed Grants:</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatMoney(win.disbursedUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enterprises Funded:</span>
                    <span className="font-mono text-slate-200">{win.beneficiaryEnterprisesCount}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Women / Youth Led:</span>
                    <span className="font-mono text-slate-300">
                      {win.womenLedEnterprisesCount} women / {win.youthLedEnterprisesCount} youth
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Avg Grant Size:</span>
                    <span className="font-mono text-amber-300">{formatMoney(win.averageGrantUSD)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
            <strong className="text-white">Apex Bank &amp; Rural Financial Services Facility:</strong> Administered in partnership with 17 Community Banks (CBs) and 59 Financial Services Associations (FSAs). Matching grants operate as non-reimbursable equity contributions paired with commercial micro-credit, ensuring long-term capitalization of rural agribusinesses.
          </div>
        </div>
      )}
    </div>
  );
}
