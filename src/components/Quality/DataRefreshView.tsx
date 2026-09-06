import React, { useMemo, useState } from 'react';
import { Dataset } from '../../types';
import {
  CheckCircle2,
  Clock3,
  Database,
  Download,
  FileWarning,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface DataRefreshViewProps {
  datasets: Dataset[];
}

type VerificationStatus = 'Verified' | 'Under review' | 'Draft';

const sourceByValueChain: Record<string, string> = {
  Rice: 'AVDP M&E consolidated extract',
  Cassava: 'Value-chain monitoring extract',
  Cocoa: 'Value-chain monitoring extract',
  'Oil Palm': 'Value-chain monitoring extract',
  Livestock: 'Livestock activity extract',
  Fish: 'Aquaculture activity extract',
  'All Value Chains': 'AVDP cross-component register',
};

const statusStyles: Record<VerificationStatus, string> = {
  Verified: 'border-emerald-800 bg-emerald-950/60 text-emerald-300',
  'Under review': 'border-amber-800 bg-amber-950/60 text-amber-300',
  Draft: 'border-slate-700 bg-slate-800 text-slate-300',
};

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

export const DataRefreshView: React.FC<DataRefreshViewProps> = ({ datasets }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | VerificationStatus>('All');

  const register = useMemo(
    () =>
      datasets.map((dataset, index) => {
        const status: VerificationStatus =
          index % 5 === 4 ? 'Draft' : index % 3 === 2 ? 'Under review' : 'Verified';
        const day = String(18 - (index % 8)).padStart(2, '0');
        return {
          id: dataset.id,
          dataset: dataset.name,
          source: sourceByValueChain[dataset.valueChain] || 'AVDP programme extract',
          valueChain: dataset.valueChain,
          reportingPeriod: index % 2 === 0 ? 'Q4 2025' : 'FY 2025',
          refreshDate: `${day} Dec 2025`,
          refreshCadence: index % 2 === 0 ? 'Quarterly' : 'Annual',
          status,
          rows: dataset.rows.length,
          owner: index % 2 === 0 ? 'M&E Unit' : 'Component lead',
        };
      }),
    [datasets]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return register.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [item.dataset, item.source, item.valueChain, item.owner]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, register, statusFilter]);

  const totalRows = register.reduce((sum, item) => sum + item.rows, 0);
  const verifiedCount = register.filter((item) => item.status === 'Verified').length;
  const reviewCount = register.length - verifiedCount;

  const exportRegister = () => {
    const headers = [
      'Dataset',
      'Source',
      'Value chain',
      'Reporting period',
      'Refresh date',
      'Cadence',
      'Verification status',
      'Rows',
      'Owner',
      'Data status',
    ];
    const rows = filtered.map((item) => [
      item.dataset,
      item.source,
      item.valueChain,
      item.reportingPeriod,
      item.refreshDate,
      item.refreshCadence,
      item.status,
      item.rows,
      item.owner,
      'Demonstration / fictitious',
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'AVDP_Demonstration_Data_Refresh_Register.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    {
      label: 'Datasets in scope',
      value: register.length.toLocaleString(),
      note: 'Current value-chain filter',
      icon: Database,
      color: 'text-sky-400',
    },
    {
      label: 'Rows represented',
      value: totalRows.toLocaleString(),
      note: 'Demonstration records',
      icon: Clock3,
      color: 'text-violet-400',
    },
    {
      label: 'Verified extracts',
      value: verifiedCount.toLocaleString(),
      note: 'Prototype verification state',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    {
      label: 'Require follow-up',
      value: reviewCount.toLocaleString(),
      note: 'Draft or under review',
      icon: FileWarning,
      color: 'text-amber-400',
    },
  ];

  return (
    <section className="space-y-5" aria-labelledby="refresh-monitor-title">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-sky-400" />
            <h2 id="refresh-monitor-title" className="text-lg font-bold text-white">
              Data Source &amp; Refresh Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Read-only visibility of the extracts feeding this dashboard: source, reporting coverage,
            refresh cadence, record volume and verification status.
          </p>
        </div>
        <button
          onClick={exportRegister}
          className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4" />
          Export register
        </button>
      </div>

      <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 px-4 py-3 flex gap-3 text-xs text-amber-100">
        <FileWarning className="w-4 h-4 shrink-0 text-amber-400" />
        <p>
          Demonstration metadata only. Dates, owners and verification states are fictitious and must
          be replaced by the approved AVDP source register before production reporting.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map(({ label, value, note, icon: Icon, color }) => (
          <article key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{note}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Dataset refresh register</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {filtered.length} of {register.length} dataset(s) shown
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <span className="sr-only">Search datasets</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dataset, source or owner"
                className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </label>
            <label>
              <span className="sr-only">Filter by verification status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'All' | VerificationStatus)
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="All">All statuses</option>
                <option value="Verified">Verified</option>
                <option value="Under review">Under review</option>
                <option value="Draft">Draft</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                {['Dataset / source', 'Coverage', 'Last refresh', 'Rows', 'Owner', 'Verification'].map(
                  (heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 min-w-64">
                    <p className="font-semibold text-slate-100">{item.dataset}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.source}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-slate-200">{item.reportingPeriod}</p>
                    <p className="text-[11px] text-slate-500">{item.valueChain}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-slate-200">{item.refreshDate}</p>
                    <p className="text-[11px] text-slate-500">{item.refreshCadence}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{item.rows.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{item.owner}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap ${statusStyles[item.status]}`}>
                      {item.status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No datasets match the current search and status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
