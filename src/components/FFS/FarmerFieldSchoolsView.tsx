import React, { useState, useMemo } from 'react';
import {
  FFS_OVERVIEW_METRICS,
  FFS_CURRICULUM_MODULES,
  FFS_DISTRICT_SUMMARIES,
  REPRESENTATIVE_FFS_GROUPS,
  FFSGroup,
  FFSCurriculumModule,
} from '../../data/ffsData';
import {
  GraduationCap,
  BookOpen,
  Users,
  Sprout,
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  HelpCircle,
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
} from 'recharts';

export function FarmerFieldSchoolsView() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedValueChain, setSelectedValueChain] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'roster' | 'curriculum' | 'districts' | 'impact'>('roster');
  const [selectedModule, setSelectedModule] = useState<FFSCurriculumModule | null>(FFS_CURRICULUM_MODULES[0]);
  const [selectedGroupModal, setSelectedGroupModal] = useState<FFSGroup | null>(null);

  // Filtered FFS Groups
  const filteredGroups = useMemo(() => {
    return REPRESENTATIVE_FFS_GROUPS.filter((g) => {
      const matchDistrict = selectedDistrict === 'All' || g.district === selectedDistrict;
      const matchVC = selectedValueChain === 'All' || g.valueChain.includes(selectedValueChain);
      const matchStatus = selectedStatus === 'All' || g.status === selectedStatus;
      const matchSearch =
        !searchQuery.trim() ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.facilitatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.chiefdom.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDistrict && matchVC && matchStatus && matchSearch;
    });
  }, [selectedDistrict, selectedValueChain, selectedStatus, searchQuery]);

  // Unique lists for filters
  const districtList = useMemo(() => {
    return ['All', ...new Set(FFS_DISTRICT_SUMMARIES.map((d) => d.district))];
  }, []);

  const valueChainList = ['All', 'Rice', 'Cocoa', 'Oil Palm', 'Cassava'];

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'FFS Name',
      'District',
      'Chiefdom',
      'Community',
      'Value Chain',
      'Facilitator',
      'Facilitator Type',
      'Cohort',
      'Total Enrolled',
      'Women Learners',
      'Youth Learners',
      'Graduated Count',
      'Status',
      'Demo Plot (Ha)',
      'Baseline Yield (MT/Ha)',
      'Achieved Yield (MT/Ha)',
      'Yield Gain %',
    ];

    const rows = filteredGroups.map((g) => [
      `"${g.name}"`,
      `"${g.district}"`,
      `"${g.chiefdom}"`,
      `"${g.community}"`,
      `"${g.valueChain}"`,
      `"${g.facilitatorName}"`,
      `"${g.facilitatorType}"`,
      `"${g.cycleCohort}"`,
      g.totalEnrolled,
      g.womenLearners,
      g.youthLearners,
      g.graduatedCount,
      `"${g.status}"`,
      g.demoPlotAreaHa,
      g.baselineYieldMTPerHa,
      g.achievedYieldMTPerHa,
      g.yieldGainPct,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AVDP_Farmer_Field_Schools_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Yield Comparison Chart Data
  const yieldChartData = [
    {
      commodity: 'IVS Rice',
      unit: 'MT/Ha',
      traditional: 1.45,
      ffsTrained: 2.75,
      gainPct: 89.6,
    },
    {
      commodity: 'Rehabilitated Cocoa',
      unit: 'MT/Ha',
      traditional: 0.38,
      ffsTrained: 0.72,
      gainPct: 89.5,
    },
    {
      commodity: 'Tenera Oil Palm (FFB)',
      unit: 'MT/Ha',
      traditional: 4.80,
      ffsTrained: 8.60,
      gainPct: 79.2,
    },
    {
      commodity: 'Cassava & Legumes',
      unit: 'MT/Ha',
      traditional: 9.50,
      ffsTrained: 16.80,
      gainPct: 76.8,
    },
  ];

  // District Training Comparison Data
  const districtChartData = FFS_DISTRICT_SUMMARIES.slice(0, 8).map((d) => ({
    district: d.district,
    trained: d.totalFarmersTrained,
    womenPct: d.womenPercentage,
    groups: d.ffsGroupsCount,
    adoptionRate: d.adoptionRatePct,
  }));

  return (
    <div id="ffs-main-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Farmer Field Schools (FFS) &amp; Agro-Ecological Extension
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  Component 1 &bull; {FFS_OVERVIEW_METRICS.lifecycleSpan}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Participatory learning, demonstration plots, and Good Agricultural Practices (GAP) for rice, cocoa, and oil palm across Sierra Leone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            id="btn-export-ffs-csv"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export FFS CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total FFS Established</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {FFS_OVERVIEW_METRICS.totalFfsEstablished.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% of Project Target Met across 16 Districts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Graduates &amp; Enrollees</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {FFS_OVERVIEW_METRICS.cumulativeGraduates.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-bold">{FFS_OVERVIEW_METRICS.womenPercentage}% Women</span> &bull; {FFS_OVERVIEW_METRICS.youthPercentage}% Youth
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Demo Learning Plots</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {FFS_OVERVIEW_METRICS.demoPlotsHectares.toLocaleString()} <span className="text-sm font-normal text-slate-400">Ha</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Certified Facilitators: <span className="text-slate-200 font-bold font-mono">{FFS_OVERVIEW_METRICS.masterTrainersCertified} Master Trainers</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Avg Yield Improvement</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-2">
            +{FFS_OVERVIEW_METRICS.averageYieldIncreasePct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Adoption Rate: <span className="text-emerald-400 font-bold font-mono">{FFS_OVERVIEW_METRICS.practiceAdoptionRatePct}%</span> of GAP practices
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'roster'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          FFS Groups Roster ({filteredGroups.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'curriculum'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Curriculum Modules ({FFS_CURRICULUM_MODULES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('districts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'districts'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          16-District Training Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('impact')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'impact'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Yield &amp; Adoption Impact Analytics
        </button>
      </div>

      {/* Tab 1: FFS Groups Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search FFS group, community, facilitator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    District: {d}
                  </option>
                ))}
              </select>

              {/* Value Chain Filter */}
              <select
                value={selectedValueChain}
                onChange={(e) => setSelectedValueChain(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {valueChainList.map((v) => (
                  <option key={v} value={v}>
                    Crop: {v}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">Status: All</option>
                <option value="Graduated">Graduated</option>
                <option value="Active In-Session">Active In-Session</option>
                <option value="Post-Graduation Mentoring">Post-Graduation Mentoring</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredGroups.length}</span> verified FFS cohorts
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => {
              const womenPct = Math.round((group.womenLearners / group.totalEnrolled) * 100);
              const youthPct = Math.round((group.youthLearners / group.totalEnrolled) * 100);

              return (
                <div
                  key={group.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight">{group.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          group.status === 'Graduated'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : group.status === 'Active In-Session'
                            ? 'bg-purple-950 text-purple-300 border border-purple-700'
                            : 'bg-sky-950 text-sky-300 border border-sky-700'
                        }`}
                      >
                        {group.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {group.community}, {group.chiefdom} Chiefdom, {group.district}
                      </span>
                    </div>

                    {/* Commodity & Demo Practice */}
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Value Chain:</span>
                        <span className="font-bold text-emerald-400">{group.valueChain}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lead Facilitator:</span>
                        <span className="text-slate-200 font-medium">{group.facilitatorName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Cohort:</span>
                        <span className="text-slate-400 font-mono">{group.cycleCohort}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300 line-clamp-2">
                        <strong className="text-slate-400">Trial Focus:</strong> {group.demoPracticeFocus}
                      </div>
                    </div>

                    {/* Learner Demographics */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Total</div>
                        <div className="font-bold text-white font-mono">{group.totalEnrolled}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Women</div>
                        <div className="font-bold text-emerald-400 font-mono">
                          {group.womenLearners} ({womenPct}%)
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Youth</div>
                        <div className="font-bold text-sky-400 font-mono">
                          {group.youthLearners} ({youthPct}%)
                        </div>
                      </div>
                    </div>

                    {/* Yield Comparison */}
                    <div className="mt-3 p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Yield Progress:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400 line-through">{group.baselineYieldMTPerHa}</span>
                        <span className="text-white">&rarr;</span>
                        <span className="text-emerald-400 font-bold">{group.achievedYieldMTPerHa} MT/Ha</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                          +{group.yieldGainPct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Demo Plot: <strong className="text-slate-300 font-mono">{group.demoPlotAreaHa} Ha</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupModal(group)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Modules */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Module List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Core Experiential Training Modules
            </h3>
            {FFS_CURRICULUM_MODULES.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedModule?.id === mod.id
                    ? 'bg-emerald-950/60 border-emerald-600 text-white shadow-lg'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono text-emerald-400 font-bold">{mod.moduleCode}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {mod.durationWeeks} Weeks
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-snug">{mod.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                  <span>{mod.category}</span>
                  <span>&bull;</span>
                  <span>{mod.targetCommodity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Module Detailed View */}
          {selectedModule && (
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {selectedModule.moduleCode} &bull; {selectedModule.category}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">{selectedModule.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono font-bold">
                    {selectedModule.practicalFieldHours} Practical Hours
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h5 className="font-bold text-slate-300 mb-1">Module Overview &amp; Learning Objective:</h5>
                  <p className="text-slate-400 leading-relaxed">{selectedModule.description}</p>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Field Experiment &amp; Demonstration Design:</span>
                  </h5>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {selectedModule.fieldExperimentType}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-300 mb-2">Core Competencies Acquired by Graduates:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedModule.coreCompetencies.map((comp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-[11px] leading-relaxed">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Target Value Chain: <strong className="text-slate-200">{selectedModule.targetCommodity}</strong></span>
                  <span>Curriculum Certification: <strong className="text-emerald-400">MAFS &amp; IFAD Standard</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: District Training Matrix */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">16-District FFS Establishment &amp; Training Progress Matrix</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">District</th>
                  <th className="py-2.5 px-3 font-semibold">Region</th>
                  <th className="py-2.5 px-3 font-semibold text-right">FFS Groups</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Trained Farmers</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Women %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Demo Area (Ha)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Adoption %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Yield Gain %</th>
                  <th className="py-2.5 px-3 font-semibold">Lead Crops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {FFS_DISTRICT_SUMMARIES.map((d) => (
                  <tr key={d.district} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{d.district}</td>
                    <td className="py-2.5 px-3 text-slate-400">{d.region}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">{d.ffsGroupsCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      {d.totalFarmersTrained.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{d.womenPercentage}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{d.demoHectares}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{d.adoptionRatePct}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-300 font-bold">+{d.avgYieldIncreasePct}%</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{d.leadCommodities.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Impact Analytics */}
      {activeTab === 'impact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Yield Gain Chart */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Yield Gain: Traditional Practice vs. FFS Graduate Plots</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Empirical yield comparison across primary value chains in Sierra Leone (MT/Ha).
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="commodity" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="traditional" name="Baseline (Traditional)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ffsTrained" name="FFS Trained (GAP/SRI)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* District Trained Chart */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>District Farmer Graduation Volume (Top 8 Districts)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Total smallholder graduates trained through experiential FFS demo plots.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="district" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="trained" name="Graduated Farmers" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Group Detail */}
      {selectedGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">{selectedGroupModal.cycleCohort}</span>
                <h3 className="text-base font-bold text-white">{selectedGroupModal.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedGroupModal.community}, {selectedGroupModal.chiefdom}, {selectedGroupModal.district}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroupModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Value Chain:</span>
                  <span className="font-bold text-emerald-400">{selectedGroupModal.valueChain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Facilitator:</span>
                  <span className="text-slate-200">
                    {selectedGroupModal.facilitatorName} ({selectedGroupModal.facilitatorType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Demo Plot Area:</span>
                  <span className="font-mono text-slate-200">{selectedGroupModal.demoPlotAreaHa} Hectares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Graduation Status:</span>
                  <span className="font-bold text-emerald-400">{selectedGroupModal.status}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-300">Demonstration Practice Focus:</span>
                <p className="text-slate-400 leading-relaxed">{selectedGroupModal.demoPracticeFocus}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400">Baseline Yield</span>
                  <div className="text-sm font-bold text-slate-300 font-mono">
                    {selectedGroupModal.baselineYieldMTPerHa} MT/Ha
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-center">
                  <span className="text-[10px] text-emerald-300">Achieved FFS Yield</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {selectedGroupModal.achievedYieldMTPerHa} MT/Ha (+{selectedGroupModal.yieldGainPct}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
