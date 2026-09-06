import React, { useState } from 'react';
import { SiteImageAttachment, GrievanceRecord } from '../../data/grmData';
import {
  MapPin,
  Calendar,
  User,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface SiteImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: SiteImageAttachment | null;
  ticket: GrievanceRecord | null;
  onUpdateVerification?: (attachmentId: string, verified: boolean, notes?: string) => void;
}

export const SiteImageModal: React.FC<SiteImageModalProps> = ({
  isOpen,
  onClose,
  attachment,
  ticket,
  onUpdateVerification,
}) => {
  const [copiedGps, setCopiedGps] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [engineerNotes, setEngineerNotes] = useState(attachment?.engineeringNotes || '');

  if (!isOpen || !attachment) return null;

  const handleCopyGps = () => {
    if (attachment.coordinates) {
      const coordsText = `${attachment.coordinates.latitude.toFixed(6)}, ${attachment.coordinates.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(coordsText);
      setCopiedGps(true);
      setTimeout(() => setCopiedGps(false), 2000);
    }
  };

  const severityBadgeClass = {
    Low: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    Moderate: 'bg-amber-950 text-amber-300 border-amber-800',
    'Critical / Safety Risk': 'bg-red-950 text-red-300 border-red-800 animate-pulse',
  }[attachment.severity];

  return (
    <div
      id="modal-site-image-inspector"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {ticket?.ticketId || 'FIELD-INSPECTION'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold text-white">{attachment.caption}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Infrastructure Quality Assurance &amp; SECAP Geospatial Audit
              </p>
            </div>
          </div>

          <button
            id="btn-close-image-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Image Viewport + Metadata Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Column: Image Canvas & Controls (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center min-h-[320px] max-h-[480px]">
              <img
                src={attachment.url}
                alt={attachment.caption}
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* HUD Overlay Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider backdrop-blur-sm ${severityBadgeClass}`}
                >
                  {attachment.severity}
                </span>
                {attachment.verifiedByEngineer && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 flex items-center gap-1 backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Engineer Verified</span>
                  </span>
                )}
              </div>

              {/* Zoom Toggle */}
              <button
                id="btn-toggle-image-zoom"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-sm text-xs flex items-center gap-1"
                title={isZoomed ? 'Reset Zoom' : 'Zoom In'}
              >
                {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Actions Bar below image */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="text-[11px]">
                {attachment.chainageOrStation
                  ? `Station / Chainage: ${attachment.chainageOrStation}`
                  : 'Site Inspection Photo'}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={attachment.url}
                  download={`AVDP_QA_${ticket?.ticketId || 'INSPECTION'}_${attachment.id}.svg`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>Download SVG</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Geospatial & QA Metadata Inspector (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-slate-900/90 text-xs">
            {/* GPS Geotag Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Geospatial Coordinates</span>
                </span>
                <button
                  id="btn-copy-gps"
                  onClick={handleCopyGps}
                  className="text-[10px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 transition-colors"
                >
                  {copiedGps ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy GPS</span>
                    </>
                  )}
                </button>
              </div>

              {attachment.coordinates ? (
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-sans">Latitude</span>
                    <span className="text-sky-300 font-bold">
                      {attachment.coordinates.latitude.toFixed(6)}° N
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-sans">Longitude</span>
                    <span className="text-sky-300 font-bold">
                      {Math.abs(attachment.coordinates.longitude).toFixed(6)}° W
                    </span>
                  </div>
                  {attachment.coordinates.accuracyMeters !== undefined && (
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Accuracy</span>
                      <span className="text-emerald-400 font-semibold">
                        ±{attachment.coordinates.accuracyMeters} m
                      </span>
                    </div>
                  )}
                  {attachment.coordinates.elevationMeters !== undefined && (
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Elevation</span>
                      <span className="text-slate-300 font-semibold">
                        {attachment.coordinates.elevationMeters} m AMSL
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic">No GPS coordinates tagged for this image.</p>
              )}

              {attachment.locationName && (
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-850 flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{attachment.locationName}</span>
                </div>
              )}
            </div>

            {/* QA Tags & Deficiency Flags */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Infrastructure QA Defect Classifications
              </span>
              <div className="flex flex-wrap gap-1.5">
                {attachment.qaTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 text-amber-200 border border-slate-700 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Field Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Capture Timestamp</span>
                </span>
                <span className="text-slate-200 font-medium">{attachment.timestamp}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Inspected By</span>
                </span>
                <span className="text-slate-200 font-medium truncate block">{attachment.capturedBy}</span>
              </div>
            </div>

            {attachment.deviceInfo && (
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <Smartphone className="w-3 h-3 text-sky-400" />
                <span>Device: {attachment.deviceInfo}</span>
              </div>
            )}

            {/* Engineering Verification & Action Notes */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Engineering QA Verification</span>
                </span>
                <button
                  id="btn-toggle-engineer-verify"
                  onClick={() => {
                    const newStatus = !attachment.verifiedByEngineer;
                    if (onUpdateVerification) {
                      onUpdateVerification(attachment.id, newStatus, engineerNotes);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    attachment.verifiedByEngineer
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {attachment.verifiedByEngineer ? '✓ Verified by DAO/Engineer' : 'Mark as Verified'}
                </button>
              </div>

              <div className="space-y-1 text-[11px]">
                <label className="text-[10px] text-slate-400 font-medium">Engineering Remediation Notes:</label>
                <textarea
                  rows={2}
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  onBlur={() => {
                    if (onUpdateVerification) {
                      onUpdateVerification(attachment.id, !!attachment.verifiedByEngineer, engineerNotes);
                    }
                  }}
                  placeholder="Enter structural defect notes or contractor rectification order..."
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Sierra Leone AVDP Safeguards &amp; SECAP Quality Assurance Module</span>
          <button
            id="btn-modal-done"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
