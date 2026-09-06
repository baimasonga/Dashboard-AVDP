import React, { useState, useRef } from 'react';
import {
  SiteImageAttachment,
  InfrastructureQaTag,
  GrievanceRecord,
} from '../../data/grmData';
import {
  DISTRICT_GPS_PRESETS,
  PRESET_QA_IMAGES,
} from '../../data/grmImagePresets';
import {
  Camera,
  Upload,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Smartphone,
  Navigation,
} from 'lucide-react';

interface AttachPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: GrievanceRecord | null;
  onAttachPhoto: (attachment: SiteImageAttachment, ticketId?: string) => void;
}

const AVAILABLE_QA_TAGS: InfrastructureQaTag[] = [
  'Culvert & Drainage Siltation',
  'Subgrade & Laterite Erosion',
  'Bridge Abutment Scour',
  'Borehole Apron Cracking',
  'Water Well Turbidity / Salinity',
  'Contractor Spoil Dump / Crop Encroachment',
  'Inadequate Road Compaction',
  'SECAP Environmental Safeguard Breach',
  'Safety Barrier / Signage Missing',
];

export const AttachPhotoModal: React.FC<AttachPhotoModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onAttachPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [chainage, setChainage] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(() => {
    const dist = ticket?.district || 'Kailahun';
    return DISTRICT_GPS_PRESETS[dist]?.latitude || 8.2778;
  });
  const [longitude, setLongitude] = useState<number>(() => {
    const dist = ticket?.district || 'Kailahun';
    return DISTRICT_GPS_PRESETS[dist]?.longitude || -10.5739;
  });
  const [elevation, setElevation] = useState<number>(() => {
    const dist = ticket?.district || 'Kailahun';
    return DISTRICT_GPS_PRESETS[dist]?.elevationMeters || 180;
  });
  const [accuracy, setAccuracy] = useState<number>(2.5);
  const [selectedTags, setSelectedTags] = useState<InfrastructureQaTag[]>([
    'Culvert & Drainage Siltation',
  ]);
  const [severity, setSeverity] = useState<'Low' | 'Moderate' | 'Critical / Safety Risk'>('Moderate');
  const [capturedBy, setCapturedBy] = useState<string>('Field Extension Officer');
  const [deviceInfo, setDeviceInfo] = useState<string>('Field Mobile / GPS Active');
  const [engineerNotes, setEngineerNotes] = useState<string>('');
  const [gpsStatus, setGpsStatus] = useState<string>('District Centroid Pre-loaded');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  // Process File Upload or Drag & Drop
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreviewUrl(result);
      if (!caption) {
        setCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Device Geolocation Request
  const handleAcquireDeviceGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by this browser. Using manual coordinates.');
      return;
    }

    setGpsStatus('Acquiring high-accuracy GNSS fix from device satellites...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
        setAccuracy(parseFloat((pos.coords.accuracy || 3.0).toFixed(1)));
        if (pos.coords.altitude) {
          setElevation(Math.round(pos.coords.altitude));
        }
        setGpsStatus(`Live Device GPS Locked (±${pos.coords.accuracy.toFixed(1)}m precision)`);
        setDeviceInfo('Android / iOS GNSS Sensor');
      },
      (err) => {
        console.warn('GPS location request error:', err);
        setGpsStatus(`GPS signal unavailable (${err.message}). Defaulted to ${ticket?.district || 'District'} coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Load Preset QA Sample
  const handleLoadPreset = (key: keyof typeof PRESET_QA_IMAGES) => {
    const preset = PRESET_QA_IMAGES[key];
    setImagePreviewUrl(preset.dataUri);
    setCaption(preset.title);
    setLocationName(`${preset.chiefdom}, ${preset.district} (${preset.chainage})`);
    setChainage(preset.chainage);
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setElevation(preset.elevationMeters);
    setAccuracy(1.8);
    setSelectedTags([...preset.qaTags]);
    setSeverity(preset.severity);
    setCapturedBy(preset.capturedBy);
    setDeviceInfo(preset.deviceInfo);
    setGpsStatus(`Loaded verified AVDP QA field preset: ${preset.title}`);
  };

  const toggleTag = (tag: InfrastructureQaTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagePreviewUrl) {
      alert('Please upload an image, capture a photo, or choose one of the pre-loaded field situations.');
      return;
    }

    const newAttachment: SiteImageAttachment = {
      id: `att_${Date.now()}`,
      url: imagePreviewUrl,
      caption: caption || 'Infrastructure Site Inspection Photo',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GMT',
      coordinates: {
        latitude,
        longitude,
        accuracyMeters: accuracy,
        elevationMeters: elevation,
      },
      locationName: locationName || `${ticket?.chiefdom || 'Field Location'}, ${ticket?.district || 'District'}`,
      chainageOrStation: chainage || undefined,
      qaTags: selectedTags.length > 0 ? selectedTags : ['Culvert & Drainage Siltation'],
      severity,
      capturedBy,
      deviceInfo,
      verifiedByEngineer: true,
      engineeringNotes: engineerNotes || 'Site photo logged and tagged for contractor QA audit.',
    };

    onAttachPhoto(newAttachment, ticket?.ticketId);
    onClose();
  };

  return (
    <div
      id="modal-attach-photo"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Capture &amp; Attach Site Image with Location Metadata
                </h3>
                {ticket && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    {ticket.ticketId}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Infrastructure Quality Assurance, SECAP Defect Documentation &amp; Field Verification
              </p>
            </div>
          </div>

          <button
            id="btn-close-attach-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Image Upload & Drag-Drop Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold">
                1. Site Image / Field Photo (Drag &amp; Drop, Select, or Camera):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-open-camera"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>Use Device Camera</span>
                </button>
                <button
                  type="button"
                  id="btn-browse-file"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Browse File</span>
                </button>
              </div>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Drag & Drop Visual Area */}
            <div
              id="drop-zone-site-image"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !imagePreviewUrl && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-amber-400 bg-amber-950/20'
                  : imagePreviewUrl
                  ? 'border-emerald-700/60 bg-slate-950'
                  : 'border-slate-750 bg-slate-950 hover:border-slate-600'
              }`}
            >
              {imagePreviewUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-44 h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 relative group">
                    <img
                      src={imagePreviewUrl}
                      alt="Site Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded">
                        Change Photo
                      </span>
                    </div>
                  </div>
                  <div className="text-left space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">Photo Loaded &amp; Ready</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Geotags and inspection HUD are mapped to this field inspection image.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreviewUrl('');
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline pt-1 block"
                    >
                      Remove and choose another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-5 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Drag and drop site inspection photo here, or{' '}
                    <span className="text-amber-400 font-bold underline">click to browse</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP, or SVG vectors</p>
                </div>
              )}
            </div>

            {/* Quick Presets Strip */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Or load verified Sierra Leone field QA scenarios:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  id="btn-preset-culvert"
                  onClick={() => handleLoadPreset('culvert_washout')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  💧 Culvert Siltation &amp; Crack
                </button>
                <button
                  type="button"
                  id="btn-preset-road"
                  onClick={() => handleLoadPreset('road_rutting_erosion')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  🚜 Subgrade Erosion / Rutting
                </button>
                <button
                  type="button"
                  id="btn-preset-borehole"
                  onClick={() => handleLoadPreset('solar_borehole_crack')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  🚰 Borehole Apron Fracture
                </button>
                <button
                  type="button"
                  id="btn-preset-cocoa"
                  onClick={() => handleLoadPreset('cocoa_orchard_laterite_spill')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  🍫 Cocoa Orchard Spoil Spill
                </button>
              </div>
            </div>
          </div>

          {/* 2. Photo Caption & Location Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Photo Title / Caption:</label>
              <input
                type="text"
                required
                placeholder="e.g. Feeder Road Box Culvert Inlet Siltation"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Chainage / Station Reference:
              </label>
              <input
                type="text"
                placeholder="e.g. CH 12+400 or Borehole Well #BW-04"
                value={chainage}
                onChange={(e) => setChainage(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Physical Location &amp; Landmark Description:
            </label>
            <input
              type="text"
              placeholder="e.g. Pendembu - Kailahun Feeder Road Spur, adjacent to Moa River drainage"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 3. Location-Based GPS Geotagging */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Geospatial Location Metadata Tagging</span>
              </span>

              <button
                type="button"
                id="btn-acquire-gps"
                onClick={handleAcquireDeviceGps}
                className="px-3 py-1 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Acquire Device GPS Position</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-semibold mb-0.5">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-semibold mb-0.5">
                  Longitude (°W)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-semibold mb-0.5">
                  Est. Accuracy (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={accuracy}
                  onChange={(e) => setAccuracy(parseFloat(e.target.value) || 1)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-semibold mb-0.5">
                  Elevation (m)
                </label>
                <input
                  type="number"
                  value={elevation}
                  onChange={(e) => setElevation(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
              <span>Status: {gpsStatus}</span>
            </div>
          </div>

          {/* 4. Infrastructure QA Classification Tags */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">
              4. Infrastructure QA Defect Tags (Select Applicable):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_QA_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Severity & Field Inspector Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">SECAP Defect Severity:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="Low">Low (Maintenance Advisory)</option>
                <option value="Moderate">Moderate (Corrective Notice)</option>
                <option value="Critical / Safety Risk">Critical / Safety Risk (Stop-Work)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Inspector / Officer:</label>
              <input
                type="text"
                value={capturedBy}
                onChange={(e) => setCapturedBy(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Capture Tool / Device:</label>
              <input
                type="text"
                value={deviceInfo}
                onChange={(e) => setDeviceInfo(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          {/* 6. Engineering Notes */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Engineering QA Notes &amp; Contractor Rectification Mandate:
            </label>
            <textarea
              rows={2}
              value={engineerNotes}
              onChange={(e) => setEngineerNotes(e.target.value)}
              placeholder="e.g. Contractor ordered to reconstruct culvert wingwall, desilt barrel, and submit compaction test within 14 calendar days."
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-attach"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-attach-photo"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Attach Geo-Tagged Site Photo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
