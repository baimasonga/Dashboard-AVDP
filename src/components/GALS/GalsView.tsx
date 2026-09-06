import React, { useState } from 'react';
import {
  GALS_OVERVIEW,
  GALS_CORE_TOOLS,
  GALS_METRICS_DATA,
  GALS_CASE_STUDIES,
  GalsTool,
} from '../../data/galsData';
import {
  HeartHandshake,
  Users,
  Compass,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  HelpCircle,
  Quote,
  Shield,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const GalsView: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string>('vision_journey');
  const [selectedCaseDistrict, setSelectedCaseDistrict] = useState<string>('All');

  const activeTool: GalsTool =
    GALS_CORE_TOOLS.find((t) => t.id === activeToolId) || GALS_CORE_TOOLS[0];

  const filteredCaseStudies =
    selectedCaseDistrict === 'All'
      ? GALS_CASE_STUDIES
      : GALS_CASE_STUDIES.filter((c) => c.district.toLowerCase() === selectedCaseDistrict.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/80 text-purple-200 border border-purple-700">
                IFAD Household Methodology
              </span>
              <span className="text-xs text-slate-400">Gender Action Learning System (GALS)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Gender Action Learning System &amp; Household Equity
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {GALS_OVERVIEW.mandate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Trained Households</span>
              <span className="text-sm font-extrabold text-purple-300">
                {GALS_OVERVIEW.totalHouseholdsTrained.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Women Beneficiary Share</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {GALS_OVERVIEW.womenBeneficiaryRatePct}% (Target: 50%)
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Conflict Reduction</span>
              <span className="text-sm font-extrabold text-amber-400">
                -{GALS_OVERVIEW.genderBasedConflictReductionPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Philosophy Callout */}
        <div className="mt-4 p-3.5 bg-slate-950/70 border border-purple-800/40 rounded-2xl flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-200/90 leading-relaxed italic">
            "{GALS_OVERVIEW.philosophy}"
          </p>
        </div>
      </div>

      {/* Quantitative Impact Dashboard */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>GALS Quantitative Progress &amp; Baseline vs Actual Scorecard</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GALS_METRICS_DATA.map((m, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white text-xs">{m.label}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {m.changePct}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed my-2">{m.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">Baseline</span>
                  <span className="font-semibold text-slate-400">{m.baseline}</span>
                </div>
                <div className="bg-slate-950 p-1.5 rounded-lg border border-emerald-900/60">
                  <span className="text-[9px] text-emerald-400 block font-medium">Actual 2024</span>
                  <span className="font-bold text-emerald-400">{m.currentActual}</span>
                </div>
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">2025 Target</span>
                  <span className="font-semibold text-slate-200">{m.target2025}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 4 Core GALS Tools Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              <span>The 4 Core GALS Methodological Tools in AVDP Fieldwork</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive participatory diagramming tools used across 14,200 rural farming households
            </p>
          </div>
        </div>

        {/* 4 Tool Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GALS_CORE_TOOLS.map((tool) => {
            const isSelected = tool.id === activeToolId;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-purple-500 shadow-xl ring-1 ring-purple-500/60'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tool.visualIcon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-purple-950 text-purple-300 border border-purple-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tool.krioName}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{tool.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tool.purpose}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tool Deep Dive */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <span className="text-4xl p-3 bg-purple-950/60 border border-purple-800/80 rounded-2xl">
                {activeTool.visualIcon}
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  GALS Tool Architecture
                </span>
                <h3 className="text-xl font-bold text-white">{activeTool.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">Krio Concept: {activeTool.krioName}</p>
                <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">{activeTool.purpose}</p>
              </div>
            </div>

            <div className="bg-purple-950/50 border border-purple-800/80 p-3 rounded-2xl max-w-xs">
              <span className="text-[10px] text-purple-300 uppercase font-bold block mb-1">
                Intra-Household Paradigm Shift:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">"{activeTool.intraHouseholdShift}"</p>
            </div>
          </div>

          {/* How it Works Step-by-Step & Tangible Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step-by-Step Process */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>How Non-Literate Families Practice This Tool</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{activeTool.methodology}</p>

              <div className="space-y-2.5">
                {activeTool.howItWorks.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-purple-900 text-purple-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tangible Realized Outputs */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tangible Field Outcomes in AVDP Communities</span>
              </h4>

              <div className="space-y-3 pt-2">
                {activeTool.keyOutputs.map((out, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 font-medium leading-relaxed">{out}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Cascade Dissemination:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Each trained smallholder family is mentored to teach 5 neighboring farming households, creating an
                  exponential community diffusion wave across the chiefdom without requiring continuous project subsidy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Testimonials & Case Studies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Quote className="w-5 h-5 text-amber-400" />
            <span>Documented Field Success Stories: From Domestic Friction to Joint Wealth</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Filter District:</span>
            {['All', 'Kailahun', 'Kambia', 'Pujehun'].map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedCaseDistrict(dist)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  selectedCaseDistrict === dist
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCaseStudies.map((study) => (
            <div
              key={study.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/60 transition-all shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 block">{study.valueChain}</span>
                    <h4 className="text-sm font-bold text-white">{study.householdHead}</h4>
                    <span className="text-[11px] text-slate-400">{study.community}, {study.district}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 mb-3">
                  <div className="bg-red-950/30 border border-red-900/40 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-red-400 block mb-0.5">Situation Before GALS:</span>
                    <p className="text-[11px] text-red-200/90 leading-relaxed">{study.situationBefore}</p>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">Impact After GALS:</span>
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed">{study.impactAfter}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-amber-300/90 italic font-medium leading-relaxed">
                  {study.quote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
