import React, { useState } from 'react';
import { AVDP_ME_LOGFRAME } from '../../data/sierraLeoneData';
import { MELogframeIndicator } from '../../types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Plus,
  ShieldCheck,
  Building,
  Users,
  Search,
} from 'lucide-react';

export const MELogframeView: React.FC = () => {
  const [indicators, setIndicators] = useState<MELogframeIndicator[]>(AVDP_ME_LOGFRAME);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newActualVal, setNewActualVal] = useState<number>(0);

  const filtered = indicators.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (tierFilter !== 'all' && item.tier !== tierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.indicator.toLowerCase().includes(q) ||
        item.valueChain.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Overall Completion
  const onTrackCount = indicators.filter((i) => i.status === 'on_track').length;
  const moderateCount = indicators.filter((i) => i.status === 'moderate').length;
  const laggingCount = indicators.filter((i) => i.status === 'lagging').length;
  const overallScore = Math.round(
    indicators.reduce((acc, curr) => acc + (curr.actual2024 / curr.target2025) * 100, 0) /
      indicators.length
  );

  const handleUpdateActual = (id: string) => {
    setIndicators((prev) =>
      prev.map((ind) => {
        if (ind.id === id) {
          const updatedActual = Number(newActualVal);
          const pct = (updatedActual / ind.target2025) * 100;
          const status = pct >= 85 ? 'on_track' : pct >= 65 ? 'moderate' : 'lagging';
          return {
            ...ind,
            actual2024: updatedActual,
            status,
          };
        }
        return ind;
      })
    );
    setEditingId(null);
  };

  const exportMELogframeCSV = () => {
    const headers = 'Code,Tier,Indicator,Value_Chain,Baseline,Target_2025,Actual_2024,Unit,Status,Risk_Rating\n';
    const rows = indicators
      .map(
        (i) =>
          `"${i.code}","${i.tier}","${i.indicator}","${i.valueChain}",${i.baseline},${i.target2025},${i.actual2024},"${i.unit}","${i.status}","${i.riskRating}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sierra_leone_avcdp_me_logframe.csv';
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Top Executive KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall M&E Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-white">{overallScore}%</span>
            <span className="text-xs text-emerald-400 font-medium ml-2">Progress toward 2025 Target</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallScore)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>On-Track Indicators</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{onTrackCount}</span>
            <span className="text-xs text-slate-400 ml-2">of {indicators.length} targets</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">&gt; 85% milestones achieved</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Moderate / Watchlist</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-amber-400">{moderateCount}</span>
            <span className="text-xs text-slate-400 ml-2">requiring field support</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">65% - 85% progress band</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lagging Targets</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-rose-400">{laggingCount}</span>
            <span className="text-xs text-slate-400 ml-2">action items</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Remedial actions triggered</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search M&E indicator code or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                tierFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setTierFilter('impact')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                tierFilter === 'impact' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Impact
            </button>
            <button
              onClick={() => setTierFilter('outcome')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                tierFilter === 'outcome' ? 'bg-sky-950 text-sky-400 border border-sky-700 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Outcome
            </button>
            <button
              onClick={() => setTierFilter('output')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                tierFilter === 'output' ? 'bg-amber-950 text-amber-400 border border-amber-700 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Output
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="on_track">On Track (&gt;85%)</option>
            <option value="moderate">Moderate (65-85%)</option>
            <option value="lagging">Lagging (&lt;65%)</option>
          </select>

          {/* Export button */}
          <button
            onClick={exportMELogframeCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Logframe CSV</span>
          </button>
        </div>
      </div>

      {/* Table of Indicators */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Indicator Description</th>
                <th className="px-4 py-3.5">Value Chain</th>
                <th className="px-4 py-3.5 text-right">Baseline</th>
                <th className="px-4 py-3.5 text-right">Target 2025</th>
                <th className="px-4 py-3.5 text-right">Actual 2024</th>
                <th className="px-4 py-3.5 text-center">Progress %</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filtered.map((item) => {
                const pct = Math.round((item.actual2024 / item.target2025) * 100);
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-white">{item.indicator}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="uppercase font-semibold text-emerald-400">{item.tier}</span>
                        <span>• Verification: {item.meansOfVerification}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                        {item.valueChain}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-400">
                      {item.baseline.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-200">
                      {item.target2025.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={newActualVal}
                            onChange={(e) => setNewActualVal(Number(e.target.value))}
                            className="w-20 px-1.5 py-0.5 bg-slate-800 border border-emerald-500 rounded text-right text-xs text-white"
                          />
                          <button
                            onClick={() => handleUpdateActual(item.id)}
                            className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded text-[10px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span className="font-extrabold text-emerald-400">
                          {item.actual2024.toLocaleString()} {item.unit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-28 mx-auto">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-white">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 85 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'on_track'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : item.status === 'moderate'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : 'bg-rose-950 text-rose-300 border-rose-700'
                        }`}
                      >
                        {item.status === 'on_track' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'moderate' && <Clock className="w-3 h-3" />}
                        {item.status === 'lagging' && <AlertTriangle className="w-3 h-3" />}
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setNewActualVal(item.actual2024);
                        }}
                        className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                      >
                        Update Actual
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
