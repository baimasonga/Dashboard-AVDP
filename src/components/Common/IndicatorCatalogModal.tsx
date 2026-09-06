import React, { useMemo, useState } from 'react';
import { BookOpen, Database, Search, X } from 'lucide-react';
import {
  DATA_SOURCES,
  INDICATOR_CATALOG,
  IndicatorDefinition,
} from '../../data/indicatorCatalog';

interface IndicatorCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CatalogTab = 'indicators' | 'sources';
type ResultLevelFilter = 'All' | IndicatorDefinition['resultLevel'];

export const IndicatorCatalogModal: React.FC<IndicatorCatalogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogTab>('indicators');
  const [search, setSearch] = useState('');
  const [resultLevel, setResultLevel] = useState<ResultLevelFilter>('All');

  const indicators = useMemo(() => {
    const query = search.trim().toLowerCase();
    return INDICATOR_CATALOG.filter((indicator) => {
      const matchesLevel = resultLevel === 'All' || indicator.resultLevel === resultLevel;
      const matchesSearch =
        !query ||
        indicator.name.toLowerCase().includes(query) ||
        indicator.code.toLowerCase().includes(query) ||
        indicator.definition.toLowerCase().includes(query);
      return matchesLevel && matchesSearch;
    });
  }, [resultLevel, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="indicator-catalog-title"
      >
        <header className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 id="indicator-catalog-title" className="flex items-center gap-2 text-base font-bold text-white">
              <BookOpen className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              AVDP Indicator &amp; Data Source Catalogue
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Definitions, formulas and provenance for consistent dashboard interpretation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close indicator catalogue"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex border-b border-slate-800 px-6 pt-3">
          {([
            ['indicators', 'Indicators'],
            ['sources', 'Data sources'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`border-b-2 px-4 pb-3 text-xs font-bold transition-colors ${
                activeTab === id
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'indicators' && (
          <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/50 px-6 py-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search indicators</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by indicator name, code or definition"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </label>
            <label>
              <span className="sr-only">Filter by result level</span>
              <select
                value={resultLevel}
                onChange={(event) => setResultLevel(event.target.value as ResultLevelFilter)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 sm:w-44"
              >
                {['All', 'Impact', 'Outcome', 'Output', 'Management'].map((level) => (
                  <option key={level} value={level}>
                    {level === 'All' ? 'All result levels' : level}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'indicators' ? (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-400">
                {indicators.length} of {INDICATOR_CATALOG.length} indicators shown
              </div>
              {indicators.map((indicator) => {
                const source = DATA_SOURCES.find((item) => item.id === indicator.sourceId);
                return (
                  <article key={indicator.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-emerald-400">{indicator.code}</span>
                          <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                            {indicator.resultLevel}
                          </span>
                          <span className="rounded border border-amber-800 bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                            {indicator.status}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-bold text-white">{indicator.name}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{indicator.definition}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs font-bold text-sky-300">{indicator.unit}</span>
                    </div>
                    <dl className="mt-3 grid gap-3 border-t border-slate-800 pt-3 text-xs md:grid-cols-3">
                      <div>
                        <dt className="font-semibold text-slate-500">Calculation</dt>
                        <dd className="mt-1 text-slate-300">{indicator.formula}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Source &amp; frequency</dt>
                        <dd className="mt-1 text-slate-300">{source?.name || indicator.sourceId} • {indicator.frequency}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Disaggregation</dt>
                        <dd className="mt-1 text-slate-300">{indicator.disaggregation.join(' • ')}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {DATA_SOURCES.map((source) => (
                <article key={source.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Database className="h-5 w-5 text-sky-400" aria-hidden="true" />
                    <span className="rounded border border-amber-800 bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                      {source.status}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">{source.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{source.description}</p>
                  <dl className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Data owner</dt>
                      <dd className="text-right font-medium text-slate-300">{source.owner}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Refresh</dt>
                      <dd className="text-right font-medium text-slate-300">{source.refreshFrequency}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-slate-800 bg-slate-950/50 px-6 py-3 text-[11px] text-slate-400">
          Catalogue entries are currently configured for fictitious prototype data and must be reconciled with the approved AVDP logframe before official use.
        </footer>
      </div>
    </div>
  );
};
