/**
 * Sierra Leone AVDP Gender Action Learning System (GALS) Component
 * IFAD-backed community household methodology for gender equity, joint decision-making,
 * equitable intra-household resource allocation, women's land tenure, and youth empowerment.
 */

export interface GalsTool {
  id: string;
  name: string;
  krioName?: string;
  purpose: string;
  methodology: string;
  howItWorks: string[];
  intraHouseholdShift: string;
  visualIcon: string;
  keyOutputs: string[];
}

export interface GalsCaseStudy {
  id: string;
  community: string;
  district: string;
  householdHead: string;
  valueChain: string;
  situationBefore: string;
  galsIntervention: string;
  impactAfter: string;
  quote: string;
}

export interface GalsMetric {
  label: string;
  baseline: string;
  currentActual: string;
  target2025: string;
  changePct: string;
  description: string;
}

export const GALS_OVERVIEW = {
  title: 'Gender Action Learning System (GALS) in AVDP Sierra Leone',
  mandate:
    'GALS is a community-led household methodology championed by IFAD and implemented by the AVDP to tackle systemic gender inequalities, unequal domestic workloads, exclusion of women from commercial crop proceeds, and youth marginalization.',
  philosophy:
    'Sustainable agricultural commercialization is impossible when women do 70% of field labor but control 0% of sales income. GALS uses visual participatory diagramming so non-literate farming families negotiate fair labor sharing, joint budgeting, and secure land tenure.',
  totalHouseholdsTrained: 14200,
  peerFacilitatorsTrained: 640,
  womenBeneficiaryRatePct: 52.4,
  youthBeneficiaryRatePct: 38.6,
  jointHouseholdPlanningRatePct: 78.5,
  genderBasedConflictReductionPct: 65.0,
};

export const GALS_CORE_TOOLS: GalsTool[] = [
  {
    id: 'vision_journey',
    name: 'Soul Mate Vision Journey (Individual & Household Roadmap)',
    krioName: 'Wi Famli Dreem Rod',
    purpose:
      'Enables husbands, wives, and youth to map out a shared 3-5 year economic and livelihood destination, identifying mutual goals and intermediate milestone targets.',
    methodology:
      'Using visual symbols on large butcher paper, each family member draws their current baseline situation on the left and their shared vision on the right, linking them with a road and identifying "fruits" (achievements) and "boulders" (challenges).',
    howItWorks: [
      'Draw current assets, debts, and housing condition on the left side of the road.',
      'Draw the 5-year dream: tin-roof house, children secondary schooling, solar home system, 2 Ha rehabilitated cocoa or IVS rice.',
      'Plot 1-year and 2-year stepping stones with specific cash requirements.',
      'Identify potential roadblocks (e.g. malaria treatment costs, crop disease, alcohol expenditure) and negotiated coping strategies.',
    ],
    intraHouseholdShift:
      'Replaces secretive individual budgeting with a transparent, mutual family investment plan where both spouses pool harvest earnings.',
    visualIcon: '🗺️',
    keyOutputs: [
      'Joint savings accounts opened in Community Banks',
      'Timetables for school fee payments prior to harvesting seasons',
      'Diversified income streams (e.g. adding dry-season vegetables to rice farming)',
    ],
  },
  {
    id: 'gender_balance_tree',
    name: 'Gender Balance Tree / Happy Family Tree',
    krioName: 'Di Balance Famli Tik',
    purpose:
      'Dramatically visualizes the imbalance between who does the heavy physical field and domestic labor versus who controls and spends the harvest revenue.',
    methodology:
      'Participants draw a large tree: Roots represent who works (field tasks, cooking, fetching water); Trunk represents the family structure; Branches represent income streams; Fruits represent who decides expenditure.',
    howItWorks: [
      'Red marks (women/girls) and blue marks (men/boys) are placed on the roots representing daily labor tasks.',
      'Families immediately see that women do 70-80% of weeding, parboiling, firewood fetching, and childcare.',
      'Red and blue marks placed on the fruits reveal men predominantly control cocoa sales, rice bags, and motorcycle purchases.',
      'The family negotiates a "rebalanced tree" where men take on domestic tasks (e.g. child care, firewood) and women gain co-signatory control over crop income.',
    ],
    intraHouseholdShift:
      'Men voluntarily take on physically demanding domestic chores and share financial decision-making power at the household table.',
    visualIcon: '🌳',
    keyOutputs: [
      'Husbands assisting with swamp weeding and firewood transport',
      'Women accompanying men to ABCs and mill sales to receive payments directly',
      'Elimination of unbudgeted personal expenditures on non-productive vices',
    ],
  },
  {
    id: 'challenge_action_tree',
    name: 'Challenge Action Tree (Root-Cause Diagnostic)',
    krioName: 'Problem & Solution Tik',
    purpose:
      'Diagnoses the deep-seated root causes of gender-based barriers, land tenure insecurity for women, youth exclusion from village decisions, and post-harvest poverty.',
    methodology:
      'Trunk = Core Challenge (e.g. "Women denied inheritance of cocoa plantations"); Roots = Historical, cultural, and legal causes; Branches = Negative impacts on family nutrition and income; Fruit = Concrete negotiated action commitments.',
    howItWorks: [
      'Identifies why women were historically barred from Inland Valley Swamp land allocation by village landholders.',
      'Brings Paramount Chiefs and Section Chiefs into GALS peer dialogues to reform local customary bylaws.',
      'Agrees on written family agreements granting women long-term tenure over designated IVS rice and vegetable plots.',
      'Allocates dedicated commercial tree-crop rows to youth to keep them engaged in rural agribusiness.',
    ],
    intraHouseholdShift:
      'Transitions from entrenched customary exclusion toward legally and culturally recognized economic security for women and youth.',
    visualIcon: '🪵',
    keyOutputs: [
      'Over 4,200 women issued formal land-use agreements for IVS plots',
      'Youth-led agribusiness committees established in 120 chiefdoms',
      'Community mediation eliminating inheritance disputes before planting season',
    ],
  },
  {
    id: 'social_empowerment_map',
    name: 'Social Empowerment & Leadership Diamond',
    krioName: 'Power & Netwok Map',
    purpose:
      'Maps social networks, power relationships, and institutional connections to propel women and youth into leadership positions within FBOs, ABCs, and local governance.',
    methodology:
      'Participants draw concentric circles of influence: Center = Individual/Household; Inner Ring = FBO and Church/Mosque groups; Outer Ring = ABC Management, Financial Institutions, and Chiefdom Councils.',
    howItWorks: [
      'Identifies positive institutional allies (e.g. MAFS female extension workers, Community Bank loan officers).',
      'Identifies predatory middlemen and exploitative informal moneylenders to be avoided.',
      'Builds peer mentorship circles where experienced female lead farmers train young women in public speaking and financial negotiation.',
      'Demands formal 40%+ female representation on FBO executive councils and ABC board of directors.',
    ],
    intraHouseholdShift:
      'Women evolve from passive cooperative laborers into vocal board chairpersons, treasurers, and certified master trainers.',
    visualIcon: '💎',
    keyOutputs: [
      'Women occupy 48% of executive committee seats across AVDP-supported FBOs',
      'Over 180 female ABC warehouse managers trained in digital inventory management',
      'Direct peer-to-peer mobilization of 8,500 additional farming women',
    ],
  },
];

export const GALS_METRICS_DATA: GalsMetric[] = [
  {
    label: 'Women Beneficiaries in AVDP Value Chains',
    baseline: '28.5%',
    currentActual: '52.4%',
    target2025: '50.0%',
    changePct: '+83.8%',
    description: 'Percentage of direct beneficiaries across all 5 value chains who are female smallholder farmers.',
  },
  {
    label: 'Joint Household Financial Decision-Making',
    baseline: '22.0%',
    currentActual: '78.5%',
    target2025: '75.0%',
    changePct: '+256.8%',
    description: 'Couples reporting mutually agreed budgets for crop sale proceeds and large asset investments.',
  },
  {
    label: 'Women Formal Land Tenure in IVS & Tree Crops',
    baseline: '14.2%',
    currentActual: '44.8%',
    target2025: '40.0%',
    changePct: '+215.5%',
    description: 'Women possessing chiefdom-recognized written or customary user rights to productive plots.',
  },
  {
    label: 'Youth Inclusion in Agribusiness Services',
    baseline: '18.0%',
    currentActual: '38.6%',
    target2025: '35.0%',
    changePct: '+114.4%',
    description: 'Youth under 35 operating mechanization hiring, seedling nurseries, spraying, or transport enterprises.',
  },
  {
    label: 'Domestic & Harvest-Related Conflict Frequency',
    baseline: '68.0%',
    currentActual: '23.8%',
    target2025: '<25.0%',
    changePct: '-65.0%',
    description: 'Households experiencing domestic disputes regarding crop sales and money mismanagement.',
  },
  {
    label: 'Women as FBO / ABC Executive Officers',
    baseline: '12.4%',
    currentActual: '48.2%',
    target2025: '45.0%',
    changePct: '+288.7%',
    description: 'Female representation in President, Secretary, and Treasurer roles across participating cooperatives.',
  },
];

export const GALS_CASE_STUDIES: GalsCaseStudy[] = [
  {
    id: 'case_kailahun_01',
    community: 'Giehun Community, Luawa Chiefdom',
    district: 'Kailahun',
    householdHead: 'Fatmata & Momoh Lansana',
    valueChain: 'Cocoa & Tree Crops',
    situationBefore:
      'Momoh harvested 1.5 MT of cocoa and sold it independently to traveling buyers, spending the proceeds in town while Fatmata struggled to feed the four children and pay elementary school fees despite doing all the bean fermentation and drying.',
    galsIntervention:
      'Participated in the 5-day GALS Vision Journey and Gender Balance Tree workshop. Realized the labor disparity and created a shared 3-year plan to replace their thatch roof with corrugated iron sheets.',
    impactAfter:
      'They opened a joint account at Kailahun Community Bank. For the first time, cocoa was sold together to the cooperative with organic premiums. Their new tin roof was completed, and their eldest daughter was enrolled in senior secondary school.',
    quote:
      '"Before GALS, I felt like a laborer on my own husband\'s farm. Now we are business partners. We sit together with our ledger book before selling a single bag."',
  },
  {
    id: 'case_kambia_02',
    community: 'Rokupr Boliland Cluster',
    district: 'Kambia',
    householdHead: 'Aminata & Alie Kamara',
    valueChain: 'Rice & Dry-Season Vegetables',
    situationBefore:
      'Aminata had no land of her own and worked on Alie\'s upland rice farm. In the dry season, income fell to zero, forcing the family into debt with local informal moneylenders charging 50% interest.',
    galsIntervention:
      'Through the Challenge Action Tree, Alie negotiated with the local landholding family to allocate Aminata a 1-acre Inland Valley Swamp plot for year-round farming under the AVDP solar irrigation scheme.',
    impactAfter:
      'Aminata formed the "Kambia Progressive Women Growers" and grew dry-season chili pepper and sweet pepper, earning $1,400 in 4 months. Alie now helps weed the vegetable nursery while Aminata manages sales.',
    quote:
      '"The Gender Balance Tree opened my eyes. I saw that helping my wife was not weakness, it was wealth for our home. We paid off all debts in our very first vegetable season."',
  },
  {
    id: 'case_pujehun_03',
    community: 'Zimmi Outgrower Hub',
    district: 'Pujehun',
    householdHead: 'Mariama & Brima Vandy',
    valueChain: 'Oil Palm & CPO Extraction',
    situationBefore:
      'Brima sold fresh palm fruit bunches to middlemen without telling Mariama, while Mariama processed low-grade pit palm oil with high smoke exposure that damaged her eyes and lungs.',
    galsIntervention:
      'Graduated from GALS and joined the AVDP Mini-CPO processing enterprise. Mariama was elected Financial Secretary of the Zimmi Oil Palm Cooperative.',
    impactAfter:
      'They now deliver fresh fruit bunches to the automated mill together. Mariama oversees quality testing and Mobile Money payments, and they have invested in a certified Tenera nursery employing 6 local youth.',
    quote:
      '"GALS removed the fear in our marriage. When men and women plan with open hands, poverty leaves through the back door."',
  },
];
