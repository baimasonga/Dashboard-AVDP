import { Dataset } from '../types';

export const AVDP_RECONCILED_Q3_2025_CSV = `District,Province,Reporting_Period,Beneficiary_Households,Female_Beneficiaries_Pct,Youth_Beneficiaries_Pct,FBO_Count,Rice_IVS_Yield_MT_Ha,Cassava_Yield_MT_Ha,Cocoa_Production_MT,Oil_Palm_Yield_MT,Vegetables_Yield_MT,IVS_Developed_Ha,Feeder_Roads_Rehab_Km,Agro_Processing_Mills,Credit_Disbursed_Million_SLE,Post_Harvest_Loss_Pct,ME_Completion_Pct
Bo,Southern,2025-Q3,18450,44.5,42.0,142,3.9,19.4,4800,12400,3200,2450,64,14,28.4,12.5,88
Kenema,Eastern,2025-Q3,21300,43.0,41.5,168,3.7,17.2,8900,18600,2800,2100,82,19,32.1,13.1,92
Kailahun,Eastern,2025-Q3,19800,45.2,43.8,154,3.5,16.5,11400,15200,2100,1850,75,16,26.2,14.0,86
Port Loko,North Western,2025-Q3,17900,48.0,44.0,136,3.4,22.8,350,9800,4600,1950,58,15,24.5,14.2,84
Tonkolili,Northern,2025-Q3,16200,46.5,43.0,128,3.6,20.1,950,11200,3900,2300,52,11,15.2,13.9,81
Bombali,Northern,2025-Q3,15100,45.0,42.5,115,3.3,18.9,200,8400,4100,1700,48,10,14.8,15.2,83
Kono,Eastern,2025-Q3,13400,42.0,41.0,102,3.2,15.8,6200,7900,2400,1550,44,9,12.5,14.8,79
Kambia,North Western,2025-Q3,14700,47.0,45.0,118,3.8,19.5,0,6200,4800,2600,46,12,11.4,12.8,85
Moyamba,Southern,2025-Q3,16800,46.0,42.0,124,3.5,21.6,450,14500,3100,1900,60,13,18.6,14.5,82
Pujehun,Southern,2025-Q3,15400,44.0,43.5,110,3.6,18.2,3100,21000,2200,1750,55,16,12.3,15.0,80
Bonthe,Southern,2025-Q3,11800,45.5,44.0,88,3.4,16.8,120,13200,1900,1600,38,8,9.8,16.2,78
Koinadugu,Northern,2025-Q3,12900,52.0,46.5,96,2.9,14.5,0,4100,5800,1400,42,7,8.5,17.4,77
Falaba,Northern,2025-Q3,10400,49.0,45.0,78,2.8,13.9,0,3200,4400,1200,35,5,6.4,18.0,74
Karene,North Western,2025-Q3,12200,46.0,43.0,92,3.1,17.6,0,5800,3600,1500,40,7,7.8,16.5,76
Western Area Rural,Western,2025-Q3,9800,54.0,48.0,72,2.6,19.8,0,4800,5100,800,30,12,10.5,13.5,89
Western Area Urban,Western,2025-Q3,6500,56.0,47.0,45,2.1,15.0,0,1200,3500,400,18,15,21.0,11.2,94`;

const rows = [
  { District: 'Bo', Province: 'Southern', Reporting_Period: '2025-Q3', Beneficiary_Households: 18450, Female_Beneficiaries_Pct: 44.5, Youth_Beneficiaries_Pct: 42.0, FBO_Count: 142, Rice_IVS_Yield_MT_Ha: 3.9, Cassava_Yield_MT_Ha: 19.4, Cocoa_Production_MT: 4800, Oil_Palm_Yield_MT: 12400, Vegetables_Yield_MT: 3200, IVS_Developed_Ha: 2450, Feeder_Roads_Rehab_Km: 64, Agro_Processing_Mills: 14, Credit_Disbursed_Million_SLE: 28.4, Post_Harvest_Loss_Pct: 12.5, ME_Completion_Pct: 88 },
  { District: 'Kenema', Province: 'Eastern', Reporting_Period: '2025-Q3', Beneficiary_Households: 21300, Female_Beneficiaries_Pct: 43.0, Youth_Beneficiaries_Pct: 41.5, FBO_Count: 168, Rice_IVS_Yield_MT_Ha: 3.7, Cassava_Yield_MT_Ha: 17.2, Cocoa_Production_MT: 8900, Oil_Palm_Yield_MT: 18600, Vegetables_Yield_MT: 2800, IVS_Developed_Ha: 2100, Feeder_Roads_Rehab_Km: 82, Agro_Processing_Mills: 19, Credit_Disbursed_Million_SLE: 32.1, Post_Harvest_Loss_Pct: 13.1, ME_Completion_Pct: 92 },
  { District: 'Kailahun', Province: 'Eastern', Reporting_Period: '2025-Q3', Beneficiary_Households: 19800, Female_Beneficiaries_Pct: 45.2, Youth_Beneficiaries_Pct: 43.8, FBO_Count: 154, Rice_IVS_Yield_MT_Ha: 3.5, Cassava_Yield_MT_Ha: 16.5, Cocoa_Production_MT: 11400, Oil_Palm_Yield_MT: 15200, Vegetables_Yield_MT: 2100, IVS_Developed_Ha: 1850, Feeder_Roads_Rehab_Km: 75, Agro_Processing_Mills: 16, Credit_Disbursed_Million_SLE: 26.2, Post_Harvest_Loss_Pct: 14.0, ME_Completion_Pct: 86 },
  { District: 'Port Loko', Province: 'North Western', Reporting_Period: '2025-Q3', Beneficiary_Households: 17900, Female_Beneficiaries_Pct: 48.0, Youth_Beneficiaries_Pct: 44.0, FBO_Count: 136, Rice_IVS_Yield_MT_Ha: 3.4, Cassava_Yield_MT_Ha: 22.8, Cocoa_Production_MT: 350, Oil_Palm_Yield_MT: 9800, Vegetables_Yield_MT: 4600, IVS_Developed_Ha: 1950, Feeder_Roads_Rehab_Km: 58, Agro_Processing_Mills: 15, Credit_Disbursed_Million_SLE: 24.5, Post_Harvest_Loss_Pct: 14.2, ME_Completion_Pct: 84 },
  { District: 'Tonkolili', Province: 'Northern', Reporting_Period: '2025-Q3', Beneficiary_Households: 16200, Female_Beneficiaries_Pct: 46.5, Youth_Beneficiaries_Pct: 43.0, FBO_Count: 128, Rice_IVS_Yield_MT_Ha: 3.6, Cassava_Yield_MT_Ha: 20.1, Cocoa_Production_MT: 950, Oil_Palm_Yield_MT: 11200, Vegetables_Yield_MT: 3900, IVS_Developed_Ha: 2300, Feeder_Roads_Rehab_Km: 52, Agro_Processing_Mills: 11, Credit_Disbursed_Million_SLE: 15.2, Post_Harvest_Loss_Pct: 13.9, ME_Completion_Pct: 81 },
  { District: 'Bombali', Province: 'Northern', Reporting_Period: '2025-Q3', Beneficiary_Households: 15100, Female_Beneficiaries_Pct: 45.0, Youth_Beneficiaries_Pct: 42.5, FBO_Count: 115, Rice_IVS_Yield_MT_Ha: 3.3, Cassava_Yield_MT_Ha: 18.9, Cocoa_Production_MT: 200, Oil_Palm_Yield_MT: 8400, Vegetables_Yield_MT: 4100, IVS_Developed_Ha: 1700, Feeder_Roads_Rehab_Km: 48, Agro_Processing_Mills: 10, Credit_Disbursed_Million_SLE: 14.8, Post_Harvest_Loss_Pct: 15.2, ME_Completion_Pct: 83 },
  { District: 'Kono', Province: 'Eastern', Reporting_Period: '2025-Q3', Beneficiary_Households: 13400, Female_Beneficiaries_Pct: 42.0, Youth_Beneficiaries_Pct: 41.0, FBO_Count: 102, Rice_IVS_Yield_MT_Ha: 3.2, Cassava_Yield_MT_Ha: 15.8, Cocoa_Production_MT: 6200, Oil_Palm_Yield_MT: 7900, Vegetables_Yield_MT: 2400, IVS_Developed_Ha: 1550, Feeder_Roads_Rehab_Km: 44, Agro_Processing_Mills: 9, Credit_Disbursed_Million_SLE: 12.5, Post_Harvest_Loss_Pct: 14.8, ME_Completion_Pct: 79 },
  { District: 'Kambia', Province: 'North Western', Reporting_Period: '2025-Q3', Beneficiary_Households: 14700, Female_Beneficiaries_Pct: 47.0, Youth_Beneficiaries_Pct: 45.0, FBO_Count: 118, Rice_IVS_Yield_MT_Ha: 3.8, Cassava_Yield_MT_Ha: 19.5, Cocoa_Production_MT: 0, Oil_Palm_Yield_MT: 6200, Vegetables_Yield_MT: 4800, IVS_Developed_Ha: 2600, Feeder_Roads_Rehab_Km: 46, Agro_Processing_Mills: 12, Credit_Disbursed_Million_SLE: 11.4, Post_Harvest_Loss_Pct: 12.8, ME_Completion_Pct: 85 },
  { District: 'Moyamba', Province: 'Southern', Reporting_Period: '2025-Q3', Beneficiary_Households: 16800, Female_Beneficiaries_Pct: 46.0, Youth_Beneficiaries_Pct: 42.0, FBO_Count: 124, Rice_IVS_Yield_MT_Ha: 3.5, Cassava_Yield_MT_Ha: 21.6, Cocoa_Production_MT: 450, Oil_Palm_Yield_MT: 14500, Vegetables_Yield_MT: 3100, IVS_Developed_Ha: 1900, Feeder_Roads_Rehab_Km: 60, Agro_Processing_Mills: 13, Credit_Disbursed_Million_SLE: 18.6, Post_Harvest_Loss_Pct: 14.5, ME_Completion_Pct: 82 },
  { District: 'Pujehun', Province: 'Southern', Reporting_Period: '2025-Q3', Beneficiary_Households: 15400, Female_Beneficiaries_Pct: 44.0, Youth_Beneficiaries_Pct: 43.5, FBO_Count: 110, Rice_IVS_Yield_MT_Ha: 3.6, Cassava_Yield_MT_Ha: 18.2, Cocoa_Production_MT: 3100, Oil_Palm_Yield_MT: 21000, Vegetables_Yield_MT: 2200, IVS_Developed_Ha: 1750, Feeder_Roads_Rehab_Km: 55, Agro_Processing_Mills: 16, Credit_Disbursed_Million_SLE: 12.3, Post_Harvest_Loss_Pct: 15.0, ME_Completion_Pct: 80 },
  { District: 'Bonthe', Province: 'Southern', Reporting_Period: '2025-Q3', Beneficiary_Households: 11800, Female_Beneficiaries_Pct: 45.5, Youth_Beneficiaries_Pct: 44.0, FBO_Count: 88, Rice_IVS_Yield_MT_Ha: 3.4, Cassava_Yield_MT_Ha: 16.8, Cocoa_Production_MT: 120, Oil_Palm_Yield_MT: 13200, Vegetables_Yield_MT: 1900, IVS_Developed_Ha: 1600, Feeder_Roads_Rehab_Km: 38, Agro_Processing_Mills: 8, Credit_Disbursed_Million_SLE: 9.8, Post_Harvest_Loss_Pct: 16.2, ME_Completion_Pct: 78 },
  { District: 'Koinadugu', Province: 'Northern', Reporting_Period: '2025-Q3', Beneficiary_Households: 12900, Female_Beneficiaries_Pct: 52.0, Youth_Beneficiaries_Pct: 46.5, FBO_Count: 96, Rice_IVS_Yield_MT_Ha: 2.9, Cassava_Yield_MT_Ha: 14.5, Cocoa_Production_MT: 0, Oil_Palm_Yield_MT: 4100, Vegetables_Yield_MT: 5800, IVS_Developed_Ha: 1400, Feeder_Roads_Rehab_Km: 42, Agro_Processing_Mills: 7, Credit_Disbursed_Million_SLE: 8.5, Post_Harvest_Loss_Pct: 17.4, ME_Completion_Pct: 77 },
  { District: 'Falaba', Province: 'Northern', Reporting_Period: '2025-Q3', Beneficiary_Households: 10400, Female_Beneficiaries_Pct: 49.0, Youth_Beneficiaries_Pct: 45.0, FBO_Count: 78, Rice_IVS_Yield_MT_Ha: 2.8, Cassava_Yield_MT_Ha: 13.9, Cocoa_Production_MT: 0, Oil_Palm_Yield_MT: 3200, Vegetables_Yield_MT: 4400, IVS_Developed_Ha: 1200, Feeder_Roads_Rehab_Km: 35, Agro_Processing_Mills: 5, Credit_Disbursed_Million_SLE: 6.4, Post_Harvest_Loss_Pct: 18.0, ME_Completion_Pct: 74 },
  { District: 'Karene', Province: 'North Western', Reporting_Period: '2025-Q3', Beneficiary_Households: 12200, Female_Beneficiaries_Pct: 46.0, Youth_Beneficiaries_Pct: 43.0, FBO_Count: 92, Rice_IVS_Yield_MT_Ha: 3.1, Cassava_Yield_MT_Ha: 17.6, Cocoa_Production_MT: 0, Oil_Palm_Yield_MT: 5800, Vegetables_Yield_MT: 3600, IVS_Developed_Ha: 1500, Feeder_Roads_Rehab_Km: 40, Agro_Processing_Mills: 7, Credit_Disbursed_Million_SLE: 7.8, Post_Harvest_Loss_Pct: 16.5, ME_Completion_Pct: 76 },
  { District: 'Western Area Rural', Province: 'Western', Reporting_Period: '2025-Q3', Beneficiary_Households: 9800, Female_Beneficiaries_Pct: 54.0, Youth_Beneficiaries_Pct: 48.0, FBO_Count: 72, Rice_IVS_Yield_MT_Ha: 2.6, Cassava_Yield_MT_Ha: 19.8, Cocoa_Production_MT: 0, Oil_Palm_Yield_MT: 4800, Vegetables_Yield_MT: 5100, IVS_Developed_Ha: 800, Feeder_Roads_Rehab_Km: 30, Agro_Processing_Mills: 12, Credit_Disbursed_Million_SLE: 10.5, Post_Harvest_Loss_Pct: 13.5, ME_Completion_Pct: 89 },
  { District: 'Western Area Urban', Province: 'Western', Reporting_Period: '2025-Q3', Beneficiary_Households: 6500, Female_Beneficiaries_Pct: 56.0, Youth_Beneficiaries_Pct: 47.0, FBO_Count: 45, Rice_IVS_Yield_MT_Ha: 2.1, Cassava_Yield_MT_Ha: 15.0, Cocoa_Production_MT: 0, Oil_Palm_Yield_MT: 1200, Vegetables_Yield_MT: 3500, IVS_Developed_Ha: 400, Feeder_Roads_Rehab_Km: 18, Agro_Processing_Mills: 15, Credit_Disbursed_Million_SLE: 21.0, Post_Harvest_Loss_Pct: 11.2, ME_Completion_Pct: 94 },
];

export const AVDP_RECONCILED_Q3_2025_DATASET: Dataset = {
  id: 'ds_avdp_reconciled_q3_2025',
  name: 'AVDP Reconciled Performance (2025 Q3 - All 16 Districts)',
  description: 'Verified quarterly project results across smallholder outreach, yield indicators, agribusiness infrastructure, and financial disbursement.',
  valueChain: 'All Value Chains',
  columns: [
    'District',
    'Province',
    'Reporting_Period',
    'Beneficiary_Households',
    'Total_Beneficiaries',
    'Female_Beneficiaries_Pct',
    'Youth_Beneficiaries_Pct',
    'FBO_Count',
    'Rice_IVS_Yield_MT_Ha',
    'RiceYield_MT_Ha',
    'Cassava_Yield_MT_Ha',
    'CassavaYield_MT_Ha',
    'Cocoa_Production_MT',
    'Oil_Palm_Yield_MT',
    'OilPalm_Production_MT',
    'Vegetables_Yield_MT',
    'IVS_Developed_Ha',
    'IVS_Hectares_Developed',
    'Feeder_Roads_Rehab_Km',
    'Agro_Processing_Mills',
    'Agro_Processing_Facilities',
    'Credit_Disbursed_Million_SLE',
    'Rural_Finance_Access_SLE_M',
    'Post_Harvest_Loss_Pct',
    'ME_Completion_Pct',
    'Overall_Target_Progress_Pct',
    'Primary_Commodity',
  ],
  numericColumns: [
    'Beneficiary_Households',
    'Total_Beneficiaries',
    'Female_Beneficiaries_Pct',
    'Youth_Beneficiaries_Pct',
    'FBO_Count',
    'Rice_IVS_Yield_MT_Ha',
    'RiceYield_MT_Ha',
    'Cassava_Yield_MT_Ha',
    'CassavaYield_MT_Ha',
    'Cocoa_Production_MT',
    'Oil_Palm_Yield_MT',
    'OilPalm_Production_MT',
    'Vegetables_Yield_MT',
    'IVS_Developed_Ha',
    'IVS_Hectares_Developed',
    'Feeder_Roads_Rehab_Km',
    'Agro_Processing_Mills',
    'Agro_Processing_Facilities',
    'Credit_Disbursed_Million_SLE',
    'Rural_Finance_Access_SLE_M',
    'Post_Harvest_Loss_Pct',
    'ME_Completion_Pct',
    'Overall_Target_Progress_Pct',
  ],
  categoricalColumns: ['District', 'Province', 'Reporting_Period', 'Primary_Commodity'],
  rows: rows.map((r) => ({
    ...r,
    Total_Beneficiaries: r.Beneficiary_Households,
    IVS_Hectares_Developed: r.IVS_Developed_Ha,
    Agro_Processing_Facilities: r.Agro_Processing_Mills,
    Rural_Finance_Access_SLE_M: r.Credit_Disbursed_Million_SLE,
    RiceYield_MT_Ha: r.Rice_IVS_Yield_MT_Ha,
    OilPalm_Production_MT: r.Oil_Palm_Yield_MT,
    CassavaYield_MT_Ha: r.Cassava_Yield_MT_Ha,
    Overall_Target_Progress_Pct: r.ME_Completion_Pct,
    Primary_Commodity:
      r.Cocoa_Production_MT > 1000 ? 'Cocoa' : r.Oil_Palm_Yield_MT > 10000 ? 'Oil Palm' : 'Rice',
  })),
  rawRows: rows.map((r) => ({ ...r })),
  rowCount: rows.length,
  uploadedAt: '2025-09-01T08:00:00.000Z',
  refreshedAt: '2025-09-01T08:00:00.000Z',
  reportingPeriod: '2025 Q3',
  source: 'Approved AVDP analytical warehouse / M&E repository',
  verificationStatus: 'Verified',
  isCustom: false,
};
