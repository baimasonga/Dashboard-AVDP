import React, { useState } from 'react';
import {
  GRM_OVERVIEW,
  SAMPLE_GRIEVANCES,
  GrievanceRecord,
  SiteImageAttachment,
} from '../../data/grmData';
import { PRESET_QA_IMAGES, DISTRICT_GPS_PRESETS } from '../../data/grmImagePresets';
import { SiteImageModal } from './SiteImageModal';
import { AttachPhotoModal } from './AttachPhotoModal';
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Search,
  PlusCircle,
  Layers,
  Send,
  Building,
  Camera,
  MapPin,
  Compass,
  AlertTriangle,
  Upload,
  Check,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const GrmView: React.FC = () => {
  const [grievances, setGrievances] = useState<GrievanceRecord[]>(SAMPLE_GRIEVANCES);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [photoFilter, setPhotoFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);

  // Photo Inspection Lightbox State
  const [selectedAttachment, setSelectedAttachment] = useState<SiteImageAttachment | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<GrievanceRecord | null>(null);

  // Attach Photo Modal State
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);
  const [targetTicketForPhoto, setTargetTicketForPhoto] = useState<GrievanceRecord | null>(null);

  // Form State for New Grievance
  const [newChiefdom, setNewChiefdom] = useState<string>('');
  const [newDistrict, setNewDistrict] = useState<string>('Kailahun');
  const [newCategory, setNewCategory] = useState<GrievanceRecord['category']>('Contractor Civil Works / Road Damage');
  const [newChannel, setNewChannel] = useState<GrievanceRecord['intakeChannel']>('Mobile Web App');
  const [newSummary, setNewSummary] = useState<string>('');
  const [complainantType, setComplainantType] = useState<GrievanceRecord['complainantType']>('Smallholder Farmer');
  const [newAssetType, setNewAssetType] = useState<GrievanceRecord['infrastructureAssetType']>('Feeder Road');
  const [newChainage, setNewChainage] = useState<string>('');
  const [newContractor, setNewContractor] = useState<string>('');
  const [draftPhotoAttachment, setDraftPhotoAttachment] = useState<SiteImageAttachment | null>(null);

  // Filtered Grievances Logic
  const filteredGrievances = grievances.filter((g) => {
    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || g.district.toLowerCase() === districtFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || g.category === categoryFilter;
    const matchesPhoto = !photoFilter || (g.siteAttachments && g.siteAttachments.length > 0);
    const matchesSearch =
      searchQuery === '' ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.chiefdom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.contractorName && g.contractorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.chainageOrMilestone && g.chainageOrMilestone.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesDistrict && matchesCategory && matchesPhoto && matchesSearch;
  });

  // Calculate Field Imagery Metrics
  const allAttachments = grievances.flatMap((g) => g.siteAttachments || []);
  const totalPhotosCount = allAttachments.length;
  const criticalDefectsCount = allAttachments.filter((a) => a.severity === 'Critical / Safety Risk').length;
  const engineerVerifiedCount = allAttachments.filter((a) => a.verifiedByEngineer).length;
  const validAccuracies = allAttachments
    .map((a) => a.coordinates?.accuracyMeters)
    .filter((acc): acc is number => acc !== undefined);
  const avgGpsAccuracy =
    validAccuracies.length > 0
      ? (validAccuracies.reduce((a, b) => a + b, 0) / validAccuracies.length).toFixed(1)
      : '2.2';

  // Attach Photo to Ticket Handler
  const handleAttachPhoto = (attachment: SiteImageAttachment, ticketId?: string) => {
    if (ticketId) {
      setGrievances((prev) =>
        prev.map((item) => {
          if (item.ticketId === ticketId) {
            return {
              ...item,
              siteAttachments: [...(item.siteAttachments || []), attachment],
            };
          }
          return item;
        })
      );
    } else {
      // Attached during new ticket drafting
      setDraftPhotoAttachment(attachment);
    }
  };

  // Update verification status from modal
  const handleUpdateVerification = (attachmentId: string, verified: boolean, notes?: string) => {
    setGrievances((prev) =>
      prev.map((ticket) => ({
        ...ticket,
        siteAttachments: ticket.siteAttachments?.map((att) =>
          att.id === attachmentId
            ? { ...att, verifiedByEngineer: verified, engineeringNotes: notes || att.engineeringNotes }
            : att
        ),
      }))
    );

    if (selectedAttachment && selectedAttachment.id === attachmentId) {
      setSelectedAttachment((prev) =>
        prev
          ? {
              ...prev,
              verifiedByEngineer: verified,
              engineeringNotes: notes || prev.engineeringNotes,
            }
          : null
      );
    }
  };

  // Create New Grievance Ticket Handler
  const handleCreateGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const newTicketId = `GRM-2025-${Math.floor(200 + Math.random() * 800)}`;
    const newTicket: GrievanceRecord = {
      ticketId: newTicketId,
      dateLogged: new Date().toISOString().split('T')[0],
      district: newDistrict,
      chiefdom: newChiefdom || 'Central Chiefdom',
      category: newCategory,
      tierLevel: 'Tier 1: Community / FBO',
      summary: newSummary,
      complainantType: complainantType,
      intakeChannel: newChannel,
      status: 'In Investigation',
      resolutionDays: 1,
      resolutionOutcome: 'Ticket registered into AVDP Central Safeguard Ledger. Dispatched to Community Grievance Committee.',
      infrastructureAssetType: newAssetType,
      chainageOrMilestone: newChainage || undefined,
      contractorName: newContractor || undefined,
      siteAttachments: draftPhotoAttachment ? [draftPhotoAttachment] : undefined,
    };

    setGrievances([newTicket, ...grievances]);
    setIsNewTicketModalOpen(false);
    setNewSummary('');
    setNewChiefdom('');
    setNewChainage('');
    setNewContractor('');
    setDraftPhotoAttachment(null);
  };

  return (
    <div id="section-grm-main" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-900/80 text-red-200 border border-red-700">
                IFAD SECAP Safeguards
              </span>
              <span className="text-xs text-slate-400">Social, Environmental &amp; Climate Safeguards</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Grievance Redress Mechanism (GRM) &amp; Infrastructure QA
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {GRM_OVERVIEW.mandate} Integrated with localized site photo evidence capture and location-based metadata
              tagging for feeder roads, culverts, and water infrastructure quality assurance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Hotline (Toll-Free)</span>
              <span className="text-sm font-extrabold text-amber-400">{GRM_OVERVIEW.tollFreeHotline}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Resolution Rate</span>
              <span className="text-sm font-extrabold text-emerald-400">{GRM_OVERVIEW.resolutionRatePct}%</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Avg Resolution Time</span>
              <span className="text-sm font-extrabold text-blue-300">{GRM_OVERVIEW.avgResolutionDays} Days</span>
            </div>
          </div>
        </div>

        {/* Channels Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          {GRM_OVERVIEW.channels.map((ch, i) => (
            <div key={i} className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <span className="text-lg">{ch.icon}</span>
              <div>
                <span className="font-semibold text-white block text-[11px]">{ch.name}</span>
                <span className="text-[10px] text-emerald-400 font-bold">{ch.sharePct}% of Intake</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure QA & Field Site Evidence Metric Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Field Site Image Capture &amp; Infrastructure Quality Assurance
              </h3>
              <p className="text-[11px] text-slate-400">
                Localized photo auditing with GPS coordinates, chainage stations, and defect tagging
              </p>
            </div>
          </div>

          <button
            id="btn-quick-attach-photo"
            onClick={() => {
              setTargetTicketForPhoto(grievances[0] || null);
              setIsAttachModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Capture / Attach Field Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Geo-Tagged Site Photos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-sky-400">{totalPhotosCount}</span>
              <span className="text-[10px] text-slate-500">attached</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Critical Defect Flags</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-red-400">{criticalDefectsCount}</span>
              <span className="text-[10px] text-red-400/80 font-medium">action required</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Engineer Audits Verified</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-emerald-400">{engineerVerifiedCount}</span>
              <span className="text-[10px] text-slate-500">
                ({totalPhotosCount > 0 ? Math.round((engineerVerifiedCount / totalPhotosCount) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Mean GNSS Precision</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-400">±{avgGpsAccuracy}m</span>
              <span className="text-[10px] text-slate-500">satellite fix</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Tier Architecture Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>4-Tier Escalation &amp; Conflict Resolution Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {GRM_OVERVIEW.tiers.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/50 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-extrabold text-amber-400 text-[11px]">0{idx + 1}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {t.resolutionWindow}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2 mb-1">{t.tier}</h4>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  <strong className="text-slate-300">Composition:</strong> {t.composition}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-slate-400">Jurisdiction:</strong> {t.scope}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 font-semibold">
                {t.resolutionRate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Grievance Tracking Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Live Grievance Registry &amp; Safeguards Resolution Audit</span>
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of community cases, investigations, executed remediation agreements, and site photos
            </p>
          </div>

          <button
            id="btn-open-log-modal"
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log New Grievance Ticket</span>
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              id="input-search-grm"
              type="text"
              placeholder="Search by ticket ID, community, contractor, chainage, or issue description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              id="btn-filter-photos-toggle"
              onClick={() => setPhotoFilter(!photoFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                photoFilter
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{photoFilter ? 'Showing With Photos' : 'With Photos Only'}</span>
            </button>

            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Resolved">Resolved</option>
              <option value="In Investigation">In Investigation</option>
              <option value="Under Mediation">Under Mediation</option>
            </select>

            <select
              id="select-district-filter"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Districts</option>
              <option value="Kailahun">Kailahun</option>
              <option value="Port Loko">Port Loko</option>
              <option value="Bonthe">Bonthe</option>
              <option value="Moyamba">Moyamba</option>
              <option value="Kenema">Kenema</option>
              <option value="Pujehun">Pujehun</option>
            </select>
          </div>
        </div>

        {/* Grievances List */}
        <div className="space-y-3">
          {filteredGrievances.length === 0 ? (
            <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No grievance records match the current filter criteria.
            </div>
          ) : (
            filteredGrievances.map((ticket) => (
              <div
                key={ticket.ticketId}
                id={`ticket-card-${ticket.ticketId}`}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-850">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-xs text-amber-400 font-mono">{ticket.ticketId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {ticket.category}
                    </span>
                    {ticket.infrastructureAssetType && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold">
                        {ticket.infrastructureAssetType}
                      </span>
                    )}
                    {ticket.chainageOrMilestone && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {ticket.chainageOrMilestone}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">Logged: {ticket.dateLogged}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400">{ticket.tierLevel}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>

                {/* Summary & Details */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p>{ticket.summary}</p>
                </div>

                {/* Resolution Block */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolution &amp; Corrective Action:</span>
                    </span>
                    <span className="text-slate-400">Resolved in {ticket.resolutionDays} days</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{ticket.resolutionOutcome}</p>
                </div>

                {/* Photo Attachments Gallery (if available) */}
                {ticket.siteAttachments && ticket.siteAttachments.length > 0 && (
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                        <Camera className="w-3 h-3" />
                        <span>Geo-Tagged Site Evidence ({ticket.siteAttachments.length} Photo)</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Click photo to launch QA Inspector</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ticket.siteAttachments.map((att) => (
                        <div
                          key={att.id}
                          id={`photo-thumb-${att.id}`}
                          onClick={() => {
                            setSelectedAttachment(att);
                            setSelectedTicket(ticket);
                          }}
                          className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 hover:border-amber-400/80 cursor-pointer transition-all shadow"
                        >
                          <div className="h-32 w-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
                            <img
                              src={att.url}
                              alt={att.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                            {/* Top HUD Badges */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                  att.severity === 'Critical / Safety Risk'
                                    ? 'bg-red-950 text-red-300 border-red-800'
                                    : att.severity === 'Moderate'
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {att.severity.split('/')[0]}
                              </span>

                              {att.verifiedByEngineer && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>

                            {/* Bottom GPS Tag */}
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white">
                              {att.coordinates && (
                                <span className="font-mono text-[9px] text-sky-300 bg-slate-900/80 px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                                  <MapPin className="w-2.5 h-2.5 text-amber-400" />
                                  <span>
                                    {att.coordinates.latitude.toFixed(4)}°N, {Math.abs(att.coordinates.longitude).toFixed(4)}°W
                                  </span>
                                </span>
                              )}
                              <span className="p-1 rounded-md bg-slate-900/80 text-slate-300 group-hover:text-amber-400 transition-colors">
                                <Eye className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 text-[11px] space-y-1">
                            <p className="font-bold text-slate-200 truncate">{att.caption}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{att.locationName || `${ticket.district}`}</span>
                              <span>{att.chainageOrStation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Metadata & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-850 gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>Complainant: {ticket.complainantType}</span>
                    <span>
                      Location: {ticket.chiefdom}, {ticket.district} District
                    </span>
                    {ticket.contractorName && (
                      <span className="text-amber-400/90 font-medium">Contractor: {ticket.contractorName}</span>
                    )}
                    <span>Channel: {ticket.intakeChannel}</span>
                  </div>

                  <button
                    id={`btn-attach-to-ticket-${ticket.ticketId}`}
                    onClick={() => {
                      setTargetTicketForPhoto(ticket);
                      setIsAttachModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-sky-400 hover:text-sky-300 text-[10px] font-bold flex items-center gap-1 border border-slate-800 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>+ Attach Site Image</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: LOG NEW GRIEVANCE */}
      {isNewTicketModalOpen && (
        <div
          id="modal-new-grievance"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Submit Grievance or SECAP Incident Ticket</span>
              </h3>
              <button
                id="btn-close-new-ticket-modal"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGrievance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Complainant Category:</label>
                <select
                  value={complainantType}
                  onChange={(e) => setComplainantType(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Smallholder Farmer">Smallholder Farmer</option>
                  <option value="Women Grower Group">Women Grower Group</option>
                  <option value="Youth Outgrower">Youth Outgrower</option>
                  <option value="Community Elder">Community Elder</option>
                  <option value="Anonymous Whistleblower">Anonymous Whistleblower</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">District:</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {['Kailahun', 'Kenema', 'Pujehun', 'Bonthe', 'Bo', 'Moyamba', 'Port Loko', 'Kono'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Chiefdom / Ward:</label>
                  <input
                    type="text"
                    placeholder="e.g. Luawa, Dama, Bum"
                    value={newChiefdom}
                    onChange={(e) => setNewChiefdom(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Grievance Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Contractor Civil Works / Road Damage">Contractor Civil Works / Road Damage</option>
                  <option value="Land & Boundary Dispute">Land & Boundary Dispute</option>
                  <option value="Agricultural Input Quality & Timing">Agricultural Input Quality & Timing</option>
                  <option value="FBO / ABC Cooperative Governance">FBO / ABC Cooperative Governance</option>
                  <option value="Environmental & Water Siltation">Environmental & Water Siltation</option>
                  <option value="Gender & GALS Inequity">Gender & GALS Inequity</option>
                </select>
              </div>

              {/* Infrastructure Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Asset Type:</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as any)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                  >
                    <option value="Feeder Road">Feeder Road</option>
                    <option value="Box Culvert / Bridge">Box Culvert / Bridge</option>
                    <option value="Drinking Water Well">Drinking Water Well</option>
                    <option value="Solar Irrigation Borehole">Solar Irrigation Borehole</option>
                    <option value="Agribusiness Processing Center">Agribusiness Processing Center</option>
                    <option value="Other">Other Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Chainage / Well #:</label>
                  <input
                    type="text"
                    placeholder="e.g. CH 14+200"
                    value={newChainage}
                    onChange={(e) => setNewChainage(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Contractor (if known):</label>
                  <input
                    type="text"
                    placeholder="e.g. Salini JV"
                    value={newContractor}
                    onChange={(e) => setNewContractor(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                  />
                </div>
              </div>

              {/* Attach Site Photo during drafting */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    <span>Attach Field Inspection Photo &amp; Geotag:</span>
                  </span>
                  {draftPhotoAttachment && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Photo Attached</span>
                    </span>
                  )}
                </div>

                {draftPhotoAttachment ? (
                  <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <img
                      src={draftPhotoAttachment.url}
                      alt="Draft Preview"
                      className="w-16 h-12 rounded object-cover border border-slate-700"
                    />
                    <div className="flex-1 text-[11px]">
                      <span className="font-bold text-white block">{draftPhotoAttachment.caption}</span>
                      <span className="text-[10px] text-sky-400 font-mono">
                        {draftPhotoAttachment.coordinates?.latitude.toFixed(4)}°N,{' '}
                        {Math.abs(draftPhotoAttachment.coordinates?.longitude || 0).toFixed(4)}°W
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftPhotoAttachment(null)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-draft-add-photo"
                      onClick={() => {
                        setTargetTicketForPhoto(null);
                        setIsAttachModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload or Choose Sample Photo</span>
                    </button>
                    <span className="text-[10px] text-slate-500">Supports drag &amp; drop, camera, and GPS</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description of Grievance / Impact:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the location, contractor, damage to crops or infrastructure, or unfair distribution..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  id="btn-cancel-new-ticket"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-new-ticket"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Register Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULLSCREEN PHOTO INSPECTOR & QA LIGHTBOX */}
      <SiteImageModal
        isOpen={!!selectedAttachment}
        onClose={() => {
          setSelectedAttachment(null);
          setSelectedTicket(null);
        }}
        attachment={selectedAttachment}
        ticket={selectedTicket}
        onUpdateVerification={handleUpdateVerification}
      />

      {/* MODAL 3: CAPTURE & ATTACH PHOTO MODAL */}
      <AttachPhotoModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        ticket={targetTicketForPhoto}
        onAttachPhoto={handleAttachPhoto}
      />
    </div>
  );
};
