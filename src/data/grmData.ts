/**
 * Sierra Leone AVDP Grievance Redress Mechanism (GRM) Component
 * Operational grievance architecture ensuring transparency, accountability,
 * SECAP environmental & social safeguards, and swift conflict resolution.
 */

import { PRESET_QA_IMAGES, InfrastructureQaTag } from './grmImagePresets';
export type { InfrastructureQaTag };

export interface SiteImageAttachment {
  id: string;
  url: string; // Data URI or image URL
  caption: string;
  timestamp: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    elevationMeters?: number;
  };
  locationName?: string;
  chainageOrStation?: string; // e.g. "CH 12+400"
  qaTags: InfrastructureQaTag[];
  severity: 'Low' | 'Moderate' | 'Critical / Safety Risk';
  capturedBy: string;
  deviceInfo?: string;
  verifiedByEngineer?: boolean;
  engineeringNotes?: string;
}

export interface GrievanceRecord {
  ticketId: string;
  dateLogged: string;
  district: string;
  chiefdom: string;
  category:
    | 'Land & Boundary Dispute'
    | 'Contractor Civil Works / Road Damage'
    | 'Agricultural Input Quality & Timing'
    | 'FBO / ABC Cooperative Governance'
    | 'Environmental & Water Siltation'
    | 'Gender & GALS Inequity';
  tierLevel: 'Tier 1: Community / FBO' | 'Tier 2: Chiefdom / Ward' | 'Tier 3: District GRC' | 'Tier 4: National PMU / NPPA';
  summary: string;
  complainantType: 'Smallholder Farmer' | 'Women Grower Group' | 'Youth Outgrower' | 'Community Elder' | 'Anonymous Whistleblower';
  intakeChannel: 'Toll-Free Hotline (#311)' | 'Chiefdom Suggestion Box' | 'FBO Ledger Book' | 'SMS Gateway' | 'Mobile Web App';
  status: 'Resolved' | 'In Investigation' | 'Under Mediation';
  resolutionDays: number;
  resolutionOutcome: string;
  infrastructureAssetType?: 'Feeder Road' | 'Box Culvert / Bridge' | 'Drinking Water Well' | 'Solar Irrigation Borehole' | 'Agribusiness Processing Center' | 'Other';
  chainageOrMilestone?: string;
  contractorName?: string;
  siteAttachments?: SiteImageAttachment[];
}

export const GRM_OVERVIEW = {
  title: 'AVDP Grievance Redress Mechanism (GRM)',
  mandate:
    'A formal 4-tiered safeguard mechanism established by the AVDP Project Management Unit (PMU) and the Ministry of Agriculture & Food Security to ensure timely, transparent, and fair resolution of community grievances and contractor compliance issues under IFAD SECAP safeguards.',
  tollFreeHotline: '0800-AVDP-75 (#311)',
  smsPortalCode: '9021-AVDP',
  totalGrievancesLogged: 342,
  totalResolved: 322,
  resolutionRatePct: 94.2,
  avgResolutionDays: 6.4,
  satisfactionRatePct: 91.5,
  escalatedToNationalPmuCount: 14,
  channels: [
    { name: 'Toll-Free Hotline (#311)', sharePct: 42, icon: '📞' },
    { name: 'FBO Community Ledger Books', sharePct: 28, icon: '📖' },
    { name: 'Chiefdom Box & Ward Council', sharePct: 18, icon: '📮' },
    { name: 'SMS & Digital Mobile Portal', sharePct: 12, icon: '📱' },
  ],
  tiers: [
    {
      tier: 'Tier 1: Community / FBO Grievance Committee',
      resolutionWindow: '3 – 5 Days',
      composition: 'FBO Chair, Lead Female Farmer, Youth Rep, Village Headman',
      scope: 'Seedling allocation disputes, local labor wages, nursery maintenance friction',
      resolutionRate: '72% of all cases settled at this level',
    },
    {
      tier: 'Tier 2: Chiefdom / Ward Grievance Committee',
      resolutionWindow: '7 Days',
      composition: 'Paramount Chief / Speaker, Ward Councilor, MAFS Agricultural Extension Agent',
      scope: 'Land boundary adjustments, chiefdom tenure, local contractor disputes',
      resolutionRate: '20% settled at this level',
    },
    {
      tier: 'Tier 3: District Multi-Stakeholder GRC (D-GRC)',
      resolutionWindow: '14 Days',
      composition: 'District Agricultural Officer (DAO), District Council Engineer, SECAP Officer, Civil Society Rep',
      scope: 'Feeder road culvert damage, river siltation, ABC cooperative financial disputes',
      resolutionRate: '6% settled at this level',
    },
    {
      tier: 'Tier 4: National PMU & Independent Ethics Review / NPPA',
      resolutionWindow: '21 – 30 Days',
      composition: 'National Project Coordinator, IFAD SECAP Specialist, NPPA Procurement Ombudsman',
      scope: 'Procurement fraud allegations, contractor default, severe environmental breaches, formal appeals',
      resolutionRate: '2% escalated to national oversight',
    },
  ],
};

export const SAMPLE_GRIEVANCES: GrievanceRecord[] = [
  {
    ticketId: 'GRM-2025-014',
    dateLogged: '2025-01-18',
    district: 'Kailahun',
    chiefdom: 'Luawa Chiefdom',
    category: 'Contractor Civil Works / Road Damage',
    tierLevel: 'Tier 3: District GRC',
    summary:
      'Box Culvert at Chainage 12+400 suffered heavy upstream embankment collapse and wingwall shear fracture during flash flooding, depositing 25 cubic meters of coarse laterite gravel inside culvert barrel.',
    complainantType: 'Smallholder Farmer',
    intakeChannel: 'Mobile Web App',
    status: 'In Investigation',
    resolutionDays: 2,
    resolutionOutcome:
      'D-GRC structural engineer conducted site inspection; issued formal Defect Rectification Notice to contractor with 14-day clearance mandate under contract retention clause.',
    infrastructureAssetType: 'Box Culvert / Bridge',
    chainageOrMilestone: 'CH 12+400',
    contractorName: 'Apex Civil Infrastructure Ltd',
    siteAttachments: [
      {
        id: PRESET_QA_IMAGES.culvert_washout.id,
        url: PRESET_QA_IMAGES.culvert_washout.dataUri,
        caption: PRESET_QA_IMAGES.culvert_washout.caption,
        timestamp: '2025-01-18 10:20 GMT',
        coordinates: {
          latitude: PRESET_QA_IMAGES.culvert_washout.latitude,
          longitude: PRESET_QA_IMAGES.culvert_washout.longitude,
          accuracyMeters: 1.8,
          elevationMeters: PRESET_QA_IMAGES.culvert_washout.elevationMeters,
        },
        locationName: 'Pendembu - Kailahun Feeder Road Spur',
        chainageOrStation: 'CH 12+400',
        qaTags: PRESET_QA_IMAGES.culvert_washout.qaTags,
        severity: PRESET_QA_IMAGES.culvert_washout.severity,
        capturedBy: PRESET_QA_IMAGES.culvert_washout.capturedBy,
        deviceInfo: PRESET_QA_IMAGES.culvert_washout.deviceInfo,
        verifiedByEngineer: true,
        engineeringNotes: 'Requires hydraulic desilting, rip-rap energy dissipater, and epoxy mortar injection on wingwall crack.',
      },
    ],
  },
  {
    ticketId: 'GRM-2024-089',
    dateLogged: '2024-09-14',
    district: 'Kailahun',
    chiefdom: 'Luawa Chiefdom',
    category: 'Contractor Civil Works / Road Damage',
    tierLevel: 'Tier 2: Chiefdom / Ward',
    summary:
      'Feeder road contractor grader deposited heavy red laterite subsoil into an adjacent certified organic cocoa orchard during ditch excavation, threatening 45 productive cocoa trees.',
    complainantType: 'Smallholder Farmer',
    intakeChannel: 'Toll-Free Hotline (#311)',
    status: 'Resolved',
    resolutionDays: 5,
    resolutionOutcome:
      'Contractor road engineer mobilized labor to manually excavate laterite from orchard, installed protective silt fencing, and provided $120 compensation for nursery seedlings.',
    infrastructureAssetType: 'Feeder Road',
    chainageOrMilestone: 'CH 04+120',
    contractorName: 'Sierra Road Construction & Civil Works Ltd',
    siteAttachments: [
      {
        id: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.id,
        url: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.dataUri,
        caption: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.caption,
        timestamp: '2024-09-14 11:30 GMT',
        coordinates: {
          latitude: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.latitude,
          longitude: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.longitude,
          accuracyMeters: 3.1,
          elevationMeters: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.elevationMeters,
        },
        locationName: 'Luawa - Jojoima Road Corridor',
        chainageOrStation: 'CH 04+120',
        qaTags: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.qaTags,
        severity: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.severity,
        capturedBy: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.capturedBy,
        deviceInfo: PRESET_QA_IMAGES.cocoa_orchard_laterite_spill.deviceInfo,
        verifiedByEngineer: true,
        engineeringNotes: 'Excavation completed. Silt fence erected along 40m perimeter.',
      },
    ],
  },
  {
    ticketId: 'GRM-2024-112',
    dateLogged: '2024-10-02',
    district: 'Port Loko',
    chiefdom: 'Lokomasama Chiefdom',
    category: 'Gender & GALS Inequity',
    tierLevel: 'Tier 1: Community / FBO',
    summary:
      'A local landowner attempted to reclaim a 2-acre irrigated vegetable plot leased to a women grower group after AVDP installed the solar borehole system, citing increased land value.',
    complainantType: 'Women Grower Group',
    intakeChannel: 'FBO Ledger Book',
    status: 'Resolved',
    resolutionDays: 4,
    resolutionOutcome:
      'Chiefdom GALS committee mediated with Section Chief; executed a legally binding 10-year registered lease in favor of the Lokomasama Women Cooperative at agreed standard peppercorn rent.',
    infrastructureAssetType: 'Drinking Water Well',
    chainageOrMilestone: 'Well #BW-04',
    contractorName: 'EcoHydro West Africa Ltd',
    siteAttachments: [
      {
        id: PRESET_QA_IMAGES.solar_borehole_crack.id,
        url: PRESET_QA_IMAGES.solar_borehole_crack.dataUri,
        caption: PRESET_QA_IMAGES.solar_borehole_crack.caption,
        timestamp: '2024-10-02 09:45 GMT',
        coordinates: {
          latitude: PRESET_QA_IMAGES.solar_borehole_crack.latitude,
          longitude: PRESET_QA_IMAGES.solar_borehole_crack.longitude,
          accuracyMeters: 2.1,
          elevationMeters: PRESET_QA_IMAGES.solar_borehole_crack.elevationMeters,
        },
        locationName: 'Lokomasama Women Horticultural Compound',
        chainageOrStation: 'Well #BW-04',
        qaTags: PRESET_QA_IMAGES.solar_borehole_crack.qaTags,
        severity: PRESET_QA_IMAGES.solar_borehole_crack.severity,
        capturedBy: PRESET_QA_IMAGES.solar_borehole_crack.capturedBy,
        deviceInfo: PRESET_QA_IMAGES.solar_borehole_crack.deviceInfo,
        verifiedByEngineer: false,
        engineeringNotes: 'Concrete curing defect in sanitary apron. Contractor instructed to recast outer 1.5m apron ring.',
      },
    ],
  },
  {
    ticketId: 'GRM-2024-138',
    dateLogged: '2024-10-21',
    district: 'Bonthe',
    chiefdom: 'Bum Chiefdom (Torma Bum)',
    category: 'Agricultural Input Quality & Timing',
    tierLevel: 'Tier 3: District GRC',
    summary:
      'Certified ROK-4 foundation seed paddy delivery delayed by 18 days due to damaged ferry crossing, causing 42 farmers to risk missing early tidal planting window.',
    complainantType: 'Smallholder Farmer',
    intakeChannel: 'SMS Gateway',
    status: 'Resolved',
    resolutionDays: 3,
    resolutionOutcome:
      'AVDP logistics re-routed 15 MT of certified seed from Bo seed bank via upland road network with express barge transport, ensuring full planting coverage.',
  },
  {
    ticketId: 'GRM-2024-165',
    dateLogged: '2024-11-04',
    district: 'Moyamba',
    chiefdom: 'Ribbi Chiefdom',
    category: 'Environmental & Water Siltation',
    tierLevel: 'Tier 2: Chiefdom / Ward',
    summary:
      'Culvert construction on Feeder Road Lot 06 temporarily diverted monsoon runoff, causing flash flooding in two downstream Inland Valley Swamp rice fields.',
    complainantType: 'Community Elder',
    intakeChannel: 'Chiefdom Suggestion Box',
    status: 'Resolved',
    resolutionDays: 7,
    resolutionOutcome:
      'Engineers re-engineered the culvert headwall with a gabion mattress energy dissipater and excavated a dedicated stone-lined drainage bypass.',
    infrastructureAssetType: 'Feeder Road',
    chainageOrMilestone: 'CH 06+850',
    contractorName: 'Salini-Moyamba Engineering JV',
    siteAttachments: [
      {
        id: PRESET_QA_IMAGES.road_rutting_erosion.id,
        url: PRESET_QA_IMAGES.road_rutting_erosion.dataUri,
        caption: PRESET_QA_IMAGES.road_rutting_erosion.caption,
        timestamp: '2024-11-04 14:15 GMT',
        coordinates: {
          latitude: PRESET_QA_IMAGES.road_rutting_erosion.latitude,
          longitude: PRESET_QA_IMAGES.road_rutting_erosion.longitude,
          accuracyMeters: 2.4,
          elevationMeters: PRESET_QA_IMAGES.road_rutting_erosion.elevationMeters,
        },
        locationName: 'Ribbi - Bradford Feeder Road',
        chainageOrStation: 'CH 06+850',
        qaTags: PRESET_QA_IMAGES.road_rutting_erosion.qaTags,
        severity: PRESET_QA_IMAGES.road_rutting_erosion.severity,
        capturedBy: PRESET_QA_IMAGES.road_rutting_erosion.capturedBy,
        deviceInfo: PRESET_QA_IMAGES.road_rutting_erosion.deviceInfo,
        verifiedByEngineer: true,
        engineeringNotes: 'Gabion energy dissipater constructed. Embankment stabilized with vetiver grass.',
      },
    ],
  },
  {
    ticketId: 'GRM-2024-192',
    dateLogged: '2024-11-18',
    district: 'Kenema',
    chiefdom: 'Dama Chiefdom',
    category: 'FBO / ABC Cooperative Governance',
    tierLevel: 'Tier 1: Community / FBO',
    summary:
      'Two cooperative members alleged the FBO treasurer was withholding mechanized thresher rental receipts and favoring relatives for equipment booking.',
    complainantType: 'Youth Outgrower',
    intakeChannel: 'Toll-Free Hotline (#311)',
    status: 'Resolved',
    resolutionDays: 4,
    resolutionOutcome:
      'Cooperative general assembly convened with MAFS extension observer; instituted a transparent digital logbook and appointed a youth co-signatory for thresher bookings.',
  },
  {
    ticketId: 'GRM-2024-210',
    dateLogged: '2024-12-01',
    district: 'Pujehun',
    chiefdom: 'Soro-Gbema Chiefdom',
    category: 'Agricultural Input Quality & Timing',
    tierLevel: 'Tier 2: Chiefdom / Ward',
    summary:
      'Batch of 1,200 pre-germinated Tenera oil palm polybag seedlings suffered moisture stress during long transit on unpaved bypass road.',
    complainantType: 'Smallholder Farmer',
    intakeChannel: 'Mobile Web App',
    status: 'In Investigation',
    resolutionDays: 6,
    resolutionOutcome:
      'AVDP tree-crop agronomist conducted nursery viability audit; replaced 320 non-viable seedlings with fresh stock from Pujehun central nursery.',
  },
];
