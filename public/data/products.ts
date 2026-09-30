/**
 * Official Peptide Product Catalog & Rate List
 * Direct Sourcing Partner: Delhi Peptides Partner Company
 * Delivery: All Nepal districts (Guaranteed minimum 10–14 days cold-chain transit)
 * 
 * IMPORTANT SHIPPING & PAYMENT POLICY:
 * - A flat ₹4,500 INR (~ रू 7,200 NPR) fee for insured cross-border shipping and handling
 *   is applied to all orders.
 * - Strictly 100% complete upfront payment required. NO Cash on Delivery (COD).
 * - Orders are only dispatched after full payment verification.
 */

export interface PeptideProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  series: 
    | 'bpc-157'
    | 'hgh'
    | 'ipamorelin'
    | 'cjc-1295'
    | 'semaglutide'
    | 'retatrutide'
    | 'ghrp'
    | 'specialty';
  category: 'recovery' | 'hgh' | 'secretagogues' | 'metabolic' | 'longevity' | 'supplies';
  categoryLabel: string;
  format: string;
  scientificName: string;
  basePriceInr: number;
  catalogPriceInr: number;
  shippingFeeInr: number;
  totalWithShippingInr: number;
  priceNpr: number;
  purityPercent: number;
  batchNumber: string;
  stockCount: number;
  inStock: boolean;
  shortDesc: string;
  description: string;
  highlights: string[];
  reconstitutionWaterMl?: number;
  storageInstructions: string;
  reconstitutionInstructions: string;
  dosageExample: string;
  coaUrl?: string;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  deliveryTimeline: string;
  sourcePartner: string;
  activeOffer?: string;
  image: string;
}

/**
 * Universal Shipping & Handling Configuration
 */
export const SHIPPING_HANDLING_CONFIG = {
  feeInr: 4500,
  feeNpr: 7200, // Calculated at standard NPR ~1.60 peg
  policy: 'A mandatory ₹4,500 INR flat fee for cross-border temperature-controlled cold-chain shipping and handling is applied to all orders.',
  deliveryTimeline: '10–14 days guaranteed across Nepal (minimum 10 days)',
  dispatchLocation: 'Direct from Delhi Peptides Partner Company',
  paymentTerms: 'Strictly 100% complete upfront payment required. No Cash on Delivery (COD). Orders are placed only after full payment verification.',
  acceptedPaymentMethods: [
    'eSewa Digital Wallet / QR',
    'Khalti Digital Wallet',
    'Fonepay Direct QR',
    'Direct Bank Transfer (NIC Asia, Nabil Bank)',
    'Indian UPI / IMPS'
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. GHRP SERIES (LATEST RATE LIST + ₹4,500 APPLIED)
// ─────────────────────────────────────────────────────────────────────────────
export const GHRP_SERIES_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-am-ghrp6-kit',
    slug: 'anabolic-monster-ghrp-6-kit',
    name: 'Anabolic Monster GHRP-6 Kit',
    brand: 'Anabolic Monster',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Growth Hormone Releasing Hexapeptide-6 (His-D-Trp-Ala-Trp-D-Phe-Lys-NH2)',
    basePriceInr: 9000,
    catalogPriceInr: 13500, // ₹9000 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 18000,
    priceNpr: 21600,
    purityPercent: 99.4,
    batchNumber: 'DEL-AM-GHRP6',
    stockCount: 18,
    inStock: true,
    shortDesc: 'Anabolic Monster GHRP-6 kit. Potent hexapeptide stimulating robust natural growth hormone release, appetite induction, and recovery.',
    description: 'Anabolic Monster GHRP-6 is a verified growth hormone secretagogue that stimulates pituitary somatotrophs via the ghrelin/GHS-R1a pathway. Direct cold-chain transit from Delhi partner company to Nepal with flat ₹4,500 shipping & handling.',
    highlights: [
      'Anabolic Monster tamper-evident security seal',
      '≥99.4% HPLC verified pure peptide cake',
      'Base Price: ₹9,000 INR (+ ₹4,500 latest update = ₹13,500 INR)',
      'Direct Delhi courier (10–14 days transit across Nepal)'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Carefully reconstitute with 2.0ml Bacteriostatic Water.',
    dosageExample: '100 mcg to 200 mcg administered 1–3 times daily in preclinical studies.',
    coaUrl: '/lab-results?batch=DEL-AM-GHRP6',
    rating: 4.8,
    reviewsCount: 26,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-am-ghrp2-kit',
    slug: 'anabolic-monster-ghrp-2-kit',
    name: 'Anabolic Monster GHRP-2 Kit',
    brand: 'Anabolic Monster',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Growth Hormone Releasing Hexapeptide-2 (Pralmorelin / GHRP-2)',
    basePriceInr: 9000,
    catalogPriceInr: 13500, // ₹9000 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 18000,
    priceNpr: 21600,
    purityPercent: 99.5,
    batchNumber: 'DEL-AM-GHRP2',
    stockCount: 16,
    inStock: true,
    shortDesc: 'Anabolic Monster GHRP-2 research kit. Clean, high-affinity GHRP secretagogue providing potent pulsatile growth hormone elevations with mild hunger induction.',
    description: 'Anabolic Monster GHRP-2 brings high-affinity somatotroph stimulation with minimal appetite disturbance compared to GHRP-6. Direct dispatch from our Delhi partner company with insured 10–14 day Nepal delivery.',
    highlights: [
      'Anabolic Monster tamper-evident security seal',
      '≥99.5% HPLC purity trace',
      'Base Price: ₹9,000 INR (+ ₹4,500 latest update = ₹13,500 INR)',
      'Nepal Delivery: 10–14 days guaranteed'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with sterile BAC water.',
    dosageExample: '100 mcg to 150 mcg administered 2–3 times daily.',
    coaUrl: '/lab-results?batch=DEL-AM-GHRP2',
    rating: 4.8,
    reviewsCount: 22,
    isPopular: false,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-denik-ghrp6-kit',
    slug: 'denik-pharma-ghrp-6-kit',
    name: 'Denik Pharma GHRP-6 Kit',
    brand: 'Denik Pharma',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Denik Pharma High-Purity GHRP-6 Hexapeptide',
    basePriceInr: 10000,
    catalogPriceInr: 14500, // ₹10000 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 19000,
    priceNpr: 23200,
    purityPercent: 99.6,
    batchNumber: 'DEL-DNK-GHRP6',
    stockCount: 15,
    inStock: true,
    shortDesc: 'Denik Pharma clinical-grade GHRP-6 kit. High-yield somatotroph activation for accelerated cellular recovery, joint repair, and appetite stimulation.',
    description: 'Denik Pharma GHRP-6 delivers pharmaceutical grade purity with batch security verification. Sourced straight from our Delhi partner company with direct temperature-controlled courier to Nepal.',
    highlights: [
      'Denik Pharma authentic security batch DEL-DNK-GHRP6',
      '≥99.6% HPLC analytical purity',
      'Base Price: ₹10,000 INR (+ ₹4,500 latest update = ₹14,500 INR)',
      '10 to 14 days transit across Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Keep in refrigerator at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water.',
    dosageExample: '100 mcg per administration in endocrine models.',
    coaUrl: '/lab-results?batch=DEL-DNK-GHRP6',
    rating: 4.9,
    reviewsCount: 31,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-denik-ghrp2-kit',
    slug: 'denik-pharma-ghrp-2-kit',
    name: 'Denik Pharma GHRP-2 Kit',
    brand: 'Denik Pharma',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Denik Pharma GHRP-2 Pralmorelin Formulated Kit',
    basePriceInr: 10000,
    catalogPriceInr: 14500, // ₹10000 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 19000,
    priceNpr: 23200,
    purityPercent: 99.6,
    batchNumber: 'DEL-DNK-GHRP2',
    stockCount: 14,
    inStock: true,
    shortDesc: 'Denik Pharma GHRP-2 pure lyophilized hexapeptide kit. Sharp GH pulse generation for lean muscle development and tissue regeneration.',
    description: 'Denik Pharma GHRP-2 provides reliable laboratory-grade growth hormone secretagogue activity. Supplied via our verified Delhi partner network.',
    highlights: [
      'Denik Pharma authentic security batch DEL-DNK-GHRP2',
      '≥99.6% Reverse-phase HPLC purity',
      'Base Price: ₹10,000 INR (+ ₹4,500 latest update = ₹14,500 INR)',
      'Nepal Delivery: 10–14 days guaranteed'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store cold at 2°C–8°C.',
    reconstitutionInstructions: 'Mix slowly with BAC water.',
    dosageExample: '100 mcg administered 2–3 times daily.',
    coaUrl: '/lab-results?batch=DEL-DNK-GHRP2',
    rating: 4.8,
    reviewsCount: 19,
    isPopular: false,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-enhanced-ghrp6-kit',
    slug: 'enhanced-pharma-ghrp-6-kit',
    name: 'Enhanced Pharma GHRP-6 Kit',
    brand: 'Enhanced Pharma',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Enhanced Pharma High-Potency GHRP-6 Peptide Kit',
    basePriceInr: 11000,
    catalogPriceInr: 15500, // ₹11000 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 20000,
    priceNpr: 24800,
    purityPercent: 99.5,
    batchNumber: 'DEL-ENH-GHRP6',
    stockCount: 20,
    inStock: true,
    shortDesc: 'Enhanced Pharma GHRP-6 high-potency research presentation. Proven somatotroph affinity and rapid hunger/anabolic stimulation.',
    description: 'Enhanced Pharma GHRP-6 is engineered for intensive athletic recovery and lipolytic research protocols. Direct shipment from Delhi partner with cold pack packaging.',
    highlights: [
      'Original Enhanced Pharma tamper-evident seal',
      '≥99.5% HPLC analytical purity trace',
      'Base Price: ₹11,000 INR (+ ₹4,500 latest update = ₹15,500 INR)',
      'Delivered in Nepal within 10–14 days'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate (2°C–8°C). Protect from light.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water.',
    dosageExample: '100 mcg daily or multi-dose protocol.',
    coaUrl: '/lab-results?batch=DEL-ENH-GHRP6',
    rating: 4.8,
    reviewsCount: 25,
    isPopular: false,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-gold-bond-ghrp6-kit',
    slug: 'gold-bond-ghrp-6-kit',
    name: 'Gold Bond GHRP-6 Kit',
    brand: 'Gold Bond',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Gold Bond Stabilized GHRP-6 Formulation',
    basePriceInr: 15500,
    catalogPriceInr: 20000, // ₹15500 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 24500,
    priceNpr: 32000,
    purityPercent: 99.7,
    batchNumber: 'DEL-GB-GHRP6',
    stockCount: 21,
    inStock: true,
    shortDesc: 'Gold Bond flagship stabilized GHRP-6 kit. Exceptional analytical purity, robust hunger induction, and potent somatotroph stimulation.',
    description: 'Gold Bond GHRP-6 utilizes advanced stabilization to ensure zero degradation during cross-border transit from Delhi. Fixed INR rate and direct courier across Nepal.',
    highlights: [
      'Gold Bond Labs advanced stabilization technology',
      '≥99.7% HPLC peak analytical purity',
      'Base Price: ₹15,500 INR (+ ₹4,500 latest update = ₹20,000 INR)',
      '10 to 14 days insured transit to Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Carefully reconstitute with 2.0ml BAC water.',
    dosageExample: '100 mcg to 200 mcg 2–3 times daily.',
    coaUrl: '/lab-results?batch=DEL-GB-GHRP6',
    rating: 5.0,
    reviewsCount: 39,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-gold-bond-ghrp2-kit',
    slug: 'gold-bond-ghrp-2-kit',
    name: 'Gold Bond GHRP-2 Kit',
    brand: 'Gold Bond',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Gold Bond Stabilized GHRP-2 Pralmorelin Peptide Kit',
    basePriceInr: 14500,
    catalogPriceInr: 19000, // ₹14500 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 23500,
    priceNpr: 30400,
    purityPercent: 99.7,
    batchNumber: 'DEL-GB-GHRP2',
    stockCount: 17,
    inStock: true,
    shortDesc: 'Gold Bond premium stabilized GHRP-2 kit. Highest biological potency with controlled appetite effects for body recomposition and lean mass research.',
    description: 'Gold Bond GHRP-2 represents one of the cleanest growth hormone secretagogues available in the Delhi partner catalog. 10–14 days guaranteed arrival in Nepal.',
    highlights: [
      'Gold Bond Labs verified batch authenticity',
      '≥99.7% HPLC analytical purity trace',
      'Base Price: ₹14,500 INR (+ ₹4,500 latest update = ₹19,000 INR)',
      'Nepal Delivery: 10–14 days guaranteed'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store cold at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with sterile BAC water.',
    dosageExample: '100 mcg administered 2–3 times daily.',
    coaUrl: '/lab-results?batch=DEL-GB-GHRP2',
    rating: 4.9,
    reviewsCount: 34,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-gold-bond-ghrp6-cjc-no-dac',
    slug: 'gold-bond-ghrp-6-cjc-without-dac-kit',
    name: 'Gold Bond GHRP-6 + CJC Without DAC (Combo Kit)',
    brand: 'Gold Bond',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Synergistic Dual Blend Kit',
    scientificName: 'Gold Bond Dual Peptide Combo: GHRP-6 + CJC-1295 (No DAC)',
    basePriceInr: 16500,
    catalogPriceInr: 21000, // ₹16500 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 25500,
    priceNpr: 33600,
    purityPercent: 99.7,
    batchNumber: 'DEL-GB-G6CJC',
    stockCount: 15,
    inStock: true,
    shortDesc: 'Gold Bond flagship dual combination: GHRP-6 + CJC-1295 Without DAC. Synergistic GHRH + GHS dual receptor activation multiplying natural GH spikes tenfold.',
    description: 'Gold Bond GHRP-6 + CJC-1295 Without DAC provides simultaneous GHRH and GHS receptor stimulation. Produces exponential pituitary GH output without artificial down-regulation.',
    highlights: [
      'Dual synergy: GHRP-6 (GHS) + CJC-1295 No DAC (GHRH)',
      'Base Price: ₹16,500 INR (+ ₹4,500 latest update = ₹21,000 INR)',
      '≥99.7% HPLC verified purity on both compounds',
      'Direct transit from Delhi partner (10–14 days in Nepal)'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store at 2°C–8°C.',
    reconstitutionInstructions: 'Hydrate gently with BAC water.',
    dosageExample: '100 mcg GHRP-6 + 100 mcg CJC-1295 no DAC dosed simultaneously.',
    coaUrl: '/lab-results?batch=DEL-GB-G6CJC',
    rating: 5.0,
    reviewsCount: 47,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-thaiger-ghrp6-kit',
    slug: 'thaiger-pharma-ghrp-6-kit',
    name: 'Thaiger Pharma GHRP-6 Kit',
    brand: 'Thaiger Pharma',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Thaiger Pharma GHR-6 Somatotrophic Peptide Kit',
    basePriceInr: 8500,
    catalogPriceInr: 13000, // ₹8500 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 17500,
    priceNpr: 20800,
    purityPercent: 99.4,
    batchNumber: 'DEL-THG-GHRP6',
    stockCount: 18,
    inStock: true,
    shortDesc: 'Thaiger Pharma GHRP-6 kit. Renowned sports performance grade secretagogue for deep sleep restoration, joint nourishment, and robust appetite induction.',
    description: 'Thaiger Pharma GHRP-6 provides proven somatotroph receptor affinity and clean reconstitution. Directly sourced from Delhi partner company.',
    highlights: [
      'Thaiger Pharma holographic security code',
      '≥99.4% HPLC verified purity',
      'Base Price: ₹8,500 INR (+ ₹4,500 latest update = ₹13,000 INR)',
      '10 to 14 days transit across Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water.',
    dosageExample: '100 mcg administered 2 times daily.',
    coaUrl: '/lab-results?batch=DEL-THG-GHRP6',
    rating: 4.8,
    reviewsCount: 23,
    isPopular: false,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-potencia-ghrp-kit',
    slug: 'potencia-biotech-ghrp-kit',
    name: 'Potencia Biotech GHRP Kit',
    brand: 'Potencia Biotech',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Potencia Biotech High-Yield GHRP Formulation',
    basePriceInr: 6500,
    catalogPriceInr: 11000, // ₹6500 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 15500,
    priceNpr: 17600,
    purityPercent: 99.3,
    batchNumber: 'DEL-POT-GHRP',
    stockCount: 24,
    inStock: true,
    shortDesc: 'Potencia Biotech GHRP research kit. Superb value-to-potency ratio for prolonged tissue healing and growth hormone secretagogue investigations.',
    description: 'Potencia Biotech GHRP offers an accessible entry point with solid biological activity. Fixed INR price from our Delhi partner network with guaranteed 10–14 days Nepal delivery.',
    highlights: [
      'Potencia Biotech authentic batch seal',
      'Base Price: ₹6,500 INR (+ ₹4,500 latest update = ₹11,000 INR)',
      '≥99.3% HPLC analytical purity',
      'Nepal Delivery: 10–14 days from Delhi'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with sterile BAC water.',
    dosageExample: '100 mcg per protocol administration.',
    coaUrl: '/lab-results?batch=DEL-POT-GHRP',
    rating: 4.7,
    reviewsCount: 21,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-ps-ghrp-kit',
    slug: 'peptide-sciences-ghrp-kit',
    name: 'Peptide Sciences USA GHRP Kit',
    brand: 'Peptide Sciences',
    series: 'ghrp',
    category: 'secretagogues',
    categoryLabel: 'GHRP & Secretagogue Kits',
    format: 'Lyophilized Vials Kit',
    scientificName: 'Peptide Sciences USA Reference Grade GHRP (>99.5% HPLC)',
    basePriceInr: 25000,
    catalogPriceInr: 29500, // ₹25000 + ₹4500
    shippingFeeInr: 4500,
    totalWithShippingInr: 34000,
    priceNpr: 47200,
    purityPercent: 99.8,
    batchNumber: 'DEL-PS-GHRP',
    stockCount: 12,
    inStock: true,
    shortDesc: 'Peptide Sciences USA benchmark GHRP kit. Gold-standard analytical chromatography and mass spec verification for institutional excellence.',
    description: 'Peptide Sciences USA synthesizes GHRP to the utmost international purity standards. Single-peak analytical certificate of analysis included. Shipped via Delhi partner to all Nepal districts.',
    highlights: [
      'Peptide Sciences USA reference manufacturing',
      '≥99.8% UHPLC chromatographic single peak',
      'Base Price: ₹25,000 INR (+ ₹4,500 latest update = ₹29,500 INR)',
      'Insured cold chain shipping to Nepal (10–14 days)'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Freeze dry powder at -20°C for long term storage.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water per vial.',
    dosageExample: '100 mcg administered 1–3 times daily in published literature.',
    coaUrl: '/lab-results?batch=DEL-PS-GHRP',
    rating: 5.0,
    reviewsCount: 36,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Latest Rate List (+ ₹4500 Update)',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. RETATRUTIDE SERIES (JUNE RATE LIST)
// ─────────────────────────────────────────────────────────────────────────────
export const RETATRUTIDE_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-gb-retatrutide-10mg-2vials',
    slug: 'gold-bond-retatrutide-10mg-2vials',
    name: 'Gold Bond Retatrutide 10mg (2 Vials Kit)',
    brand: 'Gold Bond',
    series: 'retatrutide',
    category: 'metabolic',
    categoryLabel: 'Metabolic & GLP-1 Research',
    format: '2 Vials Pack (10mg x 2)',
    scientificName: 'Retatrutide Triple Agonist (GLP-1 / GIP / Glucagon Receptor Agonist - LY3437943)',
    basePriceInr: 11500,
    catalogPriceInr: 11500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 16000,
    priceNpr: 18400,
    purityPercent: 99.6,
    batchNumber: 'DEL-GB-RETA115',
    stockCount: 22,
    inStock: true,
    shortDesc: 'Gold Bond 2-vial Retatrutide pack (10mg each, 20mg total). Breakthrough triple hormone receptor agonist activating GLP-1, GIP, and glucagon pathways.',
    description: 'Gold Bond Retatrutide features next-generation triple incretin/glucagon receptor pharmacology for profound metabolic rate enhancement and adipose thermogenesis. Sourced directly from our Delhi partner company with 10–14 days delivery across Nepal.',
    highlights: [
      'Official Gold Bond 2x 10mg lyophilized sterile vials (20mg total)',
      '≥99.6% HPLC peak analytical purity',
      'Base Price: ₹11,500 INR (Delhi Peptides Partner June Rate List)',
      'Direct transit from Delhi partner company (10–14 days in Nepal)'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store unmixed powder in freezer (-20°C) or refrigerator (2°C–8°C). Keep protected from light.',
    reconstitutionInstructions: 'Carefully reconstitute each 10mg vial with 2.0ml Bacteriostatic Water. Swirl gently.',
    dosageExample: 'Phase 2 NEJM clinical trials evaluated starting doses of 2 mg once weekly.',
    coaUrl: '/lab-results?batch=DEL-GB-RETA115',
    rating: 5.0,
    reviewsCount: 38,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Official June Rate List',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-ps-retatrutide-6mg-10vials',
    slug: 'peptide-sciences-retatrutide-6mg-10vials',
    name: 'Peptide Sciences Retatrutide 6mg (10 Vials Kit)',
    brand: 'Peptide Sciences',
    series: 'retatrutide',
    category: 'metabolic',
    categoryLabel: 'Metabolic & GLP-1 Research',
    format: '10 Vials Kit (6mg x 10)',
    scientificName: 'Peptide Sciences USA High-Purity Retatrutide (>99.5% HPLC)',
    basePriceInr: 80000,
    catalogPriceInr: 80000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 84500,
    priceNpr: 128000,
    purityPercent: 99.8,
    batchNumber: 'DEL-PS-RETA80',
    stockCount: 10,
    inStock: true,
    shortDesc: 'Peptide Sciences USA pinnacle 10-vial Retatrutide kit (6mg x 10, 60mg total). The global research benchmark for triple receptor incretin investigations.',
    description: 'Peptide Sciences USA synthesizes Retatrutide to the highest analytical standards in the world. Unmatched single-peak purity verified by high-resolution spectrometry. Sourced via our verified Delhi partner network.',
    highlights: [
      'Peptide Sciences USA reference standard manufacturing',
      '≥99.8% UHPLC chromatographic purity',
      'Base Price: ₹80,000 INR (Complete 10-vial institutional research pack)',
      '10 to 14 days insured cold-chain transit to Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Freeze dry vials at -20°C for multi-year preservation.',
    reconstitutionInstructions: 'Mix slowly with 2.0ml BAC water per vial.',
    dosageExample: 'Evaluated at 2mg to 4mg weekly escalating protocols in literature.',
    coaUrl: '/lab-results?batch=DEL-PS-RETA80',
    rating: 5.0,
    reviewsCount: 45,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Official June Rate List',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-denik-retatrutide-5mg-5vials',
    slug: 'denik-pharma-retatrutide-5mg-5vials',
    name: 'Denik Pharma Retatrutide 5mg (5 Vials Kit)',
    brand: 'Denik Pharma',
    series: 'retatrutide',
    category: 'metabolic',
    categoryLabel: 'Metabolic & GLP-1 Research',
    format: '5 Vials Kit (5mg x 5)',
    scientificName: 'Denik Pharma Recombinant Retatrutide (25mg Total)',
    basePriceInr: 22000,
    catalogPriceInr: 22000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 26500,
    priceNpr: 35200,
    purityPercent: 99.5,
    batchNumber: 'DEL-DNK-RETA22',
    stockCount: 16,
    inStock: true,
    shortDesc: 'Denik Pharma 5-vial research kit of Retatrutide (5mg each, 25mg total). Pharmaceutical grade purity with batch security verification.',
    description: 'Denik Pharma Retatrutide provides high-stability triple incretin research supplies. Direct cold-chain courier from Delhi partner company to Nepal in 10–14 days with fixed Indian Rupee rates.',
    highlights: [
      'Denik Pharma authentic security batch DEL-DNK-RETA22',
      '≥99.5% HPLC verified purity',
      'Base Price: ₹22,000 INR (Includes 5x 5mg lyophilized sterile vials)',
      'Nepal Delivery: 10–14 days guaranteed'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water per vial.',
    dosageExample: 'Investigated in preclinical assays starting at 2mg weekly.',
    coaUrl: '/lab-results?batch=DEL-DNK-RETA22',
    rating: 4.9,
    reviewsCount: 29,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Official June Rate List',
    image: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-enhanced-retatrutide-5mg-1vial',
    slug: 'enhanced-retatrutide-5mg-1vial',
    name: 'Enhanced Retatrutide 5mg (1 Vial)',
    brand: 'Enhanced Pharma',
    series: 'retatrutide',
    category: 'metabolic',
    categoryLabel: 'Metabolic & GLP-1 Research',
    format: 'Single Lyophilized Vial (5mg)',
    scientificName: 'Enhanced Pharma High-Purity Retatrutide Single Vial',
    basePriceInr: 6500,
    catalogPriceInr: 6500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 11000,
    priceNpr: 10400,
    purityPercent: 99.4,
    batchNumber: 'DEL-ENH-RETA65',
    stockCount: 28,
    inStock: true,
    shortDesc: 'Enhanced Pharma accessible single 5mg Retatrutide vial. An ideal trial format for preliminary laboratory evaluations of triple agonist mechanisms.',
    description: 'Enhanced Pharma 5mg Retatrutide provides an affordable entry point for researchers exploring GLP-1, GIP, and glucagon receptor activation. Fixed INR pricing directly from Delhi partner company.',
    highlights: [
      'Single 5mg vial format for protocol piloting',
      '≥99.4% Analytical purity verification',
      'Base Price: ₹6,500 INR (Enhanced Pharma security hologram seal)',
      'Insured cold-chain transit to Nepal (10–14 days)'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water.',
    dosageExample: 'Administered at 1mg to 2mg in early protocol evaluations.',
    coaUrl: '/lab-results?batch=DEL-ENH-RETA65',
    rating: 4.8,
    reviewsCount: 24,
    isPopular: false,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Official June Rate List',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. BPC-157 SERIES
// ─────────────────────────────────────────────────────────────────────────────
export const BPC157_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-gb-healing-king-caps',
    slug: 'gold-bond-healing-king-caps-bpc157-tb500-oral',
    name: 'Gold Bond Healing King Caps (BPC-157 + TB-500 Oral)',
    brand: 'Gold Bond',
    series: 'bpc-157',
    category: 'recovery',
    categoryLabel: 'Recovery & Tissue Healing',
    format: 'Oral Capsules (60ct)',
    scientificName: 'Gastric-Stable BPC-157 + Thymosin Beta-4 Dual Oral Matrix',
    basePriceInr: 9800,
    catalogPriceInr: 9800,
    shippingFeeInr: 4500,
    totalWithShippingInr: 14300,
    priceNpr: 15680,
    purityPercent: 99.5,
    batchNumber: 'DEL-GB-HK9800',
    stockCount: 30,
    inStock: true,
    shortDesc: 'Dual synergistic oral capsules pairing BPC-157 with TB-500 by Gold Bond. Engineered for gut mucosa, tendon repair, and deep tissue regeneration.',
    description: 'Gold Bond Healing King Caps combine Thymosin Beta-4 (TB-500) and Body Protection Compound (BPC-157) in gastric-resistant capsules for systemic healing without injections.',
    highlights: [
      'Dual active: Oral BPC-157 + TB-500 combined synergy',
      'No syringe needed: Enteric gastric-resistant capsules',
      'Base Price: ₹9,800 INR',
      'Direct Delhi transit: Delivered across Nepal within 10–14 days'
    ],
    storageInstructions: 'Store in a cool, dry place away from sunlight (15°C–25°C).',
    reconstitutionInstructions: 'Oral capsules: No reconstitution required.',
    dosageExample: '1 to 2 capsules daily on an empty stomach in research models.',
    coaUrl: '/lab-results?batch=DEL-GB-HK9800',
    rating: 4.9,
    reviewsCount: 42,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-gb-tb500-bpc157-blend',
    slug: 'gold-bond-tb-500-bpc-157',
    name: 'Gold Bond TB-500 + BPC-157 (Lyophilized 10mg)',
    brand: 'Gold Bond',
    series: 'bpc-157',
    category: 'recovery',
    categoryLabel: 'Recovery & Tissue Healing',
    format: 'Lyophilized Vial Blend',
    scientificName: 'Lyophilized Thymosin Beta-4 & BPC-157 Combined Reconstitution Complex',
    basePriceInr: 14000,
    catalogPriceInr: 14000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 18500,
    priceNpr: 22400,
    purityPercent: 99.6,
    batchNumber: 'DEL-GB-TB14000',
    stockCount: 22,
    inStock: true,
    shortDesc: 'Injectable-grade combined matrix of BPC-157 and TB-500 by Gold Bond. Unmatched clinical-level synergy for ligament, cartilage, and muscular remodeling.',
    description: 'Gold Bond TB-500 + BPC-157 pairs 5mg BPC-157 and 5mg TB-500 into a single vacuum-sealed sterile glass vial for rapid joint and tendon reconstruction.',
    highlights: [
      'Official Gold Bond dual-compound formulation',
      '≥99.6% HPLC analytical purity on both peptide peaks',
      'Base Price: ₹14,000 INR',
      'Guaranteed delivery in Nepal in 10–14 days'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Keep dry powder in freezer (-20°C). Reconstituted at 2°C–8°C.',
    reconstitutionInstructions: 'Slowly introduce 2.0ml BAC water down inside glass wall.',
    dosageExample: '500 mcg combined peptide daily or bi-weekly in tissue assays.',
    coaUrl: '/lab-results?batch=DEL-GB-TB14000',
    rating: 5.0,
    reviewsCount: 36,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-peptide-sciences-bpc157',
    slug: 'peptide-sciences-bpc-157',
    name: 'Peptide Sciences BPC-157 (5mg)',
    brand: 'Peptide Sciences',
    series: 'bpc-157',
    category: 'recovery',
    categoryLabel: 'Recovery & Tissue Healing',
    format: 'Lyophilized Vial',
    scientificName: 'Body Protection Compound-157 (>99.5% HPLC / USA Synthesized)',
    basePriceInr: 28000,
    catalogPriceInr: 28000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 32500,
    priceNpr: 44800,
    purityPercent: 99.8,
    batchNumber: 'DEL-PS-BPC28000',
    stockCount: 15,
    inStock: true,
    shortDesc: 'The global gold standard in analytical peptide research synthesized by Peptide Sciences USA. Industry-leading purity, batch certification, and stringent laboratory grade.',
    description: 'Peptide Sciences USA synthesizes BPC-157 to the highest international analytical standard (>99.8% pure). Sourced through verified Delhi partner network.',
    highlights: [
      'Original Peptide Sciences USA sealed vial',
      '≥99.8% Peak purity verified by analytical HPLC & ESI-MS',
      'Base Price: ₹28,000 INR',
      'Delivered anywhere in Nepal within 10 to 14 days'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate (2°C–8°C) or freeze (-20°C).',
    reconstitutionInstructions: 'Slowly introduce 2.0ml Bacteriostatic Water against glass wall.',
    dosageExample: '250 mcg to 500 mcg daily subcutaneous administration.',
    coaUrl: '/lab-results?batch=DEL-PS-BPC28000',
    rating: 5.0,
    reviewsCount: 58,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-enhanced-bpc157-caps',
    slug: 'enhanced-bpc-157-60-caps-oral',
    name: 'Enhanced BPC-157 60 Caps Oral',
    brand: 'Enhanced',
    series: 'bpc-157',
    category: 'recovery',
    categoryLabel: 'Recovery & Tissue Healing',
    format: 'Oral Capsules (60ct)',
    scientificName: 'Enhanced Bioavailable BPC-157 (60 Oral Capsules)',
    basePriceInr: 9200,
    catalogPriceInr: 9200,
    shippingFeeInr: 4500,
    totalWithShippingInr: 13700,
    priceNpr: 14720,
    purityPercent: 99.2,
    batchNumber: 'DEL-ENH-CAP9200',
    stockCount: 35,
    inStock: true,
    shortDesc: 'Enhanced brand specialized oral BPC-157 (60 capsules). Designed specifically for gut health, IBS/IBD barrier support, and systemic tendon healing.',
    description: 'Formulated with specialized excipients that withstand stomach acid, facilitating direct mucosal absorption without requiring reconstitution or injections.',
    highlights: [
      '60 high-potency oral capsules per container',
      'Base Price: ₹9,200 INR',
      'Ideal for GI tract healing and systemic anti-inflammation',
      'Shipped to Nepal in 10–14 business days'
    ],
    storageInstructions: 'Store in dry conditions at room temperature (20°C–25°C).',
    reconstitutionInstructions: 'Convenient oral capsule form. No sterile water needed.',
    dosageExample: '1 capsule twice daily before meals in laboratory protocols.',
    coaUrl: '/lab-results?batch=DEL-ENH-CAP9200',
    rating: 4.8,
    reviewsCount: 29,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-denik-bpc157',
    slug: 'denik-bpc',
    name: 'Denik BPC (5mg Lyophilized)',
    brand: 'Denik',
    series: 'bpc-157',
    category: 'recovery',
    categoryLabel: 'Recovery & Tissue Healing',
    format: 'Lyophilized Vial',
    scientificName: 'Denik Pharmaceutical Grade Pure BPC-157',
    basePriceInr: 13000,
    catalogPriceInr: 13000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 17500,
    priceNpr: 20800,
    purityPercent: 99.4,
    batchNumber: 'DEL-DNK-BPC13000',
    stockCount: 20,
    inStock: true,
    shortDesc: 'Denik premium lyophilized BPC-157. Known in competitive strength and athletic circles for rapid connective tissue, ligament, and tendon repair.',
    description: 'Denik BPC is synthesized using advanced solid-phase peptide synthesis (SPPS) and certified through reverse-phase HPLC. Directly supplied from Delhi stocks.',
    highlights: [
      'Denik certified pharmaceutical-grade batch',
      '≥99.4% Analytical HPLC purity',
      'Base Price: ₹13,000 INR',
      'Direct 10–14 day transit to all Nepal destinations'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Keep in refrigerator at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml Bacteriostatic Water.',
    dosageExample: '250 mcg to 500 mcg per 24 hours in research assays.',
    coaUrl: '/lab-results?batch=DEL-DNK-BPC13000',
    rating: 4.9,
    reviewsCount: 24,
    isPopular: false,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-gold-bond-bpc157',
    slug: 'gold-bond-bpc',
    name: 'Gold Bond BPC (5mg Lyophilized)',
    brand: 'Gold Bond',
    series: 'bpc-157',
    category: 'recovery',
    categoryLabel: 'Recovery & Tissue Healing',
    format: 'Lyophilized Vial',
    scientificName: 'Gold Bond Pure BPC-157 Pentadecapeptide',
    basePriceInr: 13000,
    catalogPriceInr: 13000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 17500,
    priceNpr: 20800,
    purityPercent: 99.5,
    batchNumber: 'DEL-GB-BPC13000',
    stockCount: 25,
    inStock: true,
    shortDesc: 'Gold Bond standalone high-purity BPC-157 (5mg). High bioavailability and stability during temperature-controlled cross-border delivery to Nepal.',
    description: 'Gold Bond BPC delivers pure pentadecapeptide with verified HPLC chromatogram. Ideal for localized tendon healing and systemic gut remodeling.',
    highlights: [
      'Official Gold Bond security-sealed vial',
      '≥99.5% Verified purity',
      'Base Price: ₹13,000 INR',
      'Fast 10–14 day transit to Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate dry vial at 2°C–8°C.',
    reconstitutionInstructions: 'Reconstitute slowly with 2.0ml BAC water.',
    dosageExample: '250 mcg to 500 mcg daily in published models.',
    coaUrl: '/lab-results?batch=DEL-GB-BPC13000',
    rating: 4.9,
    reviewsCount: 33,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. HUMAN GROWTH HORMONE (HGH) SERIES
// ─────────────────────────────────────────────────────────────────────────────
export const HGH_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-nanox-50iu',
    slug: 'nanox-50iu',
    name: 'Nanox HGH (50 IU Kit)',
    brand: 'Nanox',
    series: 'hgh',
    category: 'hgh',
    categoryLabel: 'HGH Somatropin Kits',
    format: '50 IU Lyophilized Kit',
    scientificName: 'Recombinant Human Growth Hormone 191 Amino Acids (rhGH Somatropin)',
    basePriceInr: 7500,
    catalogPriceInr: 7500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 12000,
    priceNpr: 12000,
    purityPercent: 99.4,
    batchNumber: 'DEL-NX-50IU',
    stockCount: 20,
    inStock: true,
    shortDesc: 'Nanox 50 IU high-purity somatropin. Verified recombinant authentic 191aa sequence for metabolic rejuvenation and recovery.',
    description: 'Nanox 50 IU offers biological potency identical to endogenous pituitary growth hormone. Sourced from our Delhi partner company with direct temperature-controlled transit across Nepal.',
    highlights: [
      'Authentic Nanox anti-counterfeiting scratch code',
      '≥99.4% SEC-HPLC monomer purity',
      'Base Price: ₹7,500 INR (Revised June Rates)',
      'Direct Delhi courier: 10–14 days guaranteed'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate at 2°C–8°C. Do not freeze once reconstituted.',
    reconstitutionInstructions: 'Mix gently with bacteriostatic water down glass wall.',
    dosageExample: '2 IU to 4 IU daily in endocrine evaluation models.',
    coaUrl: '/lab-results?batch=DEL-NX-50IU',
    rating: 4.8,
    reviewsCount: 37,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Revised June Rates',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-nanox-100iu',
    slug: 'nanox-100iu',
    name: 'Nanox HGH (100 IU Kit)',
    brand: 'Nanox',
    series: 'hgh',
    category: 'hgh',
    categoryLabel: 'HGH Somatropin Kits',
    format: '100 IU Complete Kit',
    scientificName: 'Nanox Pharmaceutical Grade Somatropin (100 IU Recombinant rhGH)',
    basePriceInr: 11500,
    catalogPriceInr: 11500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 16000,
    priceNpr: 18400,
    purityPercent: 99.6,
    batchNumber: 'DEL-NX-100IU',
    stockCount: 18,
    inStock: true,
    shortDesc: 'Nanox 100 IU institutional kit. Superior solubility, ultra-low dimer formation, and robust somatotropic activity for long-term protocols.',
    description: 'Nanox 100 IU provides high-yield Somatropin formulated for institutional laboratory evaluations. Verified via SEC-HPLC to guarantee under 0.5% dimer content.',
    highlights: [
      'Complete 100 IU institutional presentation',
      '≥99.6% Monomer purity (>99% 191aa fidelity)',
      'Base Price: ₹11,500 INR (Revised June Rates)',
      'Delivered in Nepal in 10–14 days'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Keep dry vials refrigerated (2°C–8°C). Protect from heat.',
    reconstitutionInstructions: 'Reconstitute gently with 1.0ml or 2.0ml BAC water per vial.',
    dosageExample: '2 IU to 5 IU daily protocols.',
    coaUrl: '/lab-results?batch=DEL-NX-100IU',
    rating: 4.9,
    reviewsCount: 52,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Revised June Rates',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-genotropin-36iu',
    slug: 'genotropin-goquick-36iu',
    name: 'Pfizer Genotropin GoQuick Pen (36 IU / 12mg)',
    brand: 'Pfizer',
    series: 'hgh',
    category: 'hgh',
    categoryLabel: 'HGH Somatropin Kits',
    format: 'Dual-Chamber Prefilled Pen',
    scientificName: 'Pfizer Somatropin rDNA origin GoQuick Pre-Mixed Pen',
    basePriceInr: 18500,
    catalogPriceInr: 18500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 23000,
    priceNpr: 29600,
    purityPercent: 99.9,
    batchNumber: 'DEL-PF-GEN36',
    stockCount: 12,
    inStock: true,
    shortDesc: 'Original Pfizer Genotropin GoQuick 36 IU prefilled dial-a-dose pen. World-standard dual chamber auto-reconstitution technology.',
    description: 'Pfizer Genotropin GoQuick eliminates manual mixing errors with an internal dual-chamber cartridge that self-reconstitutes with a simple twist.',
    highlights: [
      'Original Pfizer pharmaceutical cartridge & packaging',
      '≥99.9% Clinical purity standard',
      'Base Price: ₹18,500 INR',
      'Cold-chain transport with ice packs directly from Delhi'
    ],
    storageInstructions: 'Strict cold storage (2°C–8°C).',
    reconstitutionInstructions: 'Turn the pen mechanism to mix dual-chamber powder with diluent automatically.',
    dosageExample: 'Dial mechanism allows exact micro-dosing.',
    coaUrl: '/lab-results?batch=DEL-PF-GEN36',
    rating: 5.0,
    reviewsCount: 44,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-meditech-somatropin-100iu',
    slug: 'meditech-somatropin-100iu',
    name: 'Meditech Somatropin (100 IU Kit)',
    brand: 'Meditech',
    series: 'hgh',
    category: 'hgh',
    categoryLabel: 'HGH Somatropin Kits',
    format: '10 Vials x 10 IU Kit',
    scientificName: 'Meditech Pharmaceuticals Somatropin 191aa Recombinant DNA',
    basePriceInr: 17500,
    catalogPriceInr: 17500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 22000,
    priceNpr: 28000,
    purityPercent: 99.5,
    batchNumber: 'DEL-MED-HGH100',
    stockCount: 15,
    inStock: true,
    shortDesc: 'Meditech pharmaceuticals certified 100 IU Somatropin kit. Ten 10 IU vials with anti-counterfeit QR code.',
    description: 'Meditech Somatropin is an industry benchmark among strength and physique athletes. Sourced from authorized Delhi partner distribution.',
    highlights: [
      'Meditech holographic scratch verification',
      '≥99.5% Purity with intact 191aa chain',
      'Base Price: ₹17,500 INR',
      '10–14 days courier delivery across Nepal'
    ],
    reconstitutionWaterMl: 1.0,
    storageInstructions: 'Store refrigerated (2°C–8°C).',
    reconstitutionInstructions: 'Add 1.0ml BAC water per vial.',
    dosageExample: '2 IU to 4 IU daily protocols.',
    coaUrl: '/lab-results?batch=DEL-MED-HGH100',
    rating: 4.9,
    reviewsCount: 39,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. IPAMORELIN & CJC-1295 SERIES
// ─────────────────────────────────────────────────────────────────────────────
export const IPAMORELIN_CJC_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-gb-cjc-ipam-blend',
    slug: 'gold-bond-cjc-ipam',
    name: 'Gold Bond CJC-1295 + Ipamorelin Blend',
    brand: 'Gold Bond',
    series: 'cjc-1295',
    category: 'secretagogues',
    categoryLabel: 'Secretagogue Blends',
    format: 'Lyophilized Vial Blend (10mg)',
    scientificName: 'Gold Bond Dual Secretagogue: CJC-1295 (No DAC) 5mg + Ipamorelin 5mg',
    basePriceInr: 15000,
    catalogPriceInr: 15000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 19500,
    priceNpr: 24000,
    purityPercent: 99.6,
    batchNumber: 'DEL-GB-CI15000',
    stockCount: 20,
    inStock: true,
    shortDesc: 'Gold Bond dual peptide blend combining CJC-1295 (No DAC) and Ipamorelin. Multiplies natural pulsatile GH release without elevating cortisol or prolactin.',
    description: 'Gold Bond CJC + Ipamorelin delivers simultaneous GHRH and GHS-R stimulation in a single vial. Sourced from our Delhi partner with strict cold-chain shipping.',
    highlights: [
      'Pre-blended optimal 1:1 ratio (5mg CJC + 5mg Ipamorelin)',
      '≥99.6% HPLC analytical purity on both peptide peaks',
      'Base Price: ₹15,000 INR (June Rate List)',
      'Guaranteed delivery in Nepal in 10–14 days'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate dry vial at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml Bacteriostatic Water.',
    dosageExample: '100 mcg / 100 mcg combo administered 1–2 times daily.',
    coaUrl: '/lab-results?batch=DEL-GB-CI15000',
    rating: 5.0,
    reviewsCount: 38,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-gb-ipamorelin-5mg',
    slug: 'gold-bond-ipamorelin-5mg',
    name: 'Gold Bond Ipamorelin (5mg)',
    brand: 'Gold Bond',
    series: 'ipamorelin',
    category: 'secretagogues',
    categoryLabel: 'Secretagogues',
    format: 'Lyophilized Vial (5mg)',
    scientificName: 'Gold Bond High-Purity Pentapeptide Ipamorelin',
    basePriceInr: 13500,
    catalogPriceInr: 13500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 18000,
    priceNpr: 21600,
    purityPercent: 99.6,
    batchNumber: 'DEL-GB-IPAM135',
    stockCount: 22,
    inStock: true,
    shortDesc: 'Gold Bond standalone Ipamorelin 5mg. The cleanest selective growth hormone secretagogue, activating somatotrophs without hunger spikes.',
    description: 'Gold Bond Ipamorelin is formulated for researchers targeting natural GH release without appetite stimulation or adrenal activation.',
    highlights: [
      'Selective GHS-R agonist without hyperghrelinemia',
      '≥99.6% HPLC purity trace',
      'Base Price: ₹13,500 INR (June Rate List)',
      'Delivered in Nepal in 10–14 days'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store cold at 2°C–8°C.',
    reconstitutionInstructions: 'Slowly hydrate with 2.0ml BAC water.',
    dosageExample: '100 mcg to 200 mcg per administration.',
    coaUrl: '/lab-results?batch=DEL-GB-IPAM135',
    rating: 4.9,
    reviewsCount: 31,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-ps-cjc-ipam',
    slug: 'peptide-sciences-cjc-ipam',
    name: 'Peptide Sciences CJC-1295 + Ipamorelin (10mg Combo)',
    brand: 'Peptide Sciences',
    series: 'cjc-1295',
    category: 'secretagogues',
    categoryLabel: 'Secretagogues',
    format: 'Lyophilized Dual Vial Set',
    scientificName: 'Peptide Sciences USA Reference CJC-1295 (No DAC) 5mg + Ipamorelin 5mg',
    basePriceInr: 34000,
    catalogPriceInr: 34000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 38500,
    priceNpr: 54400,
    purityPercent: 99.8,
    batchNumber: 'DEL-PS-CI34000',
    stockCount: 14,
    inStock: true,
    shortDesc: 'Peptide Sciences USA benchmark secretagogue duo. Uncompromising >99.8% analytical purity verified by dual-angle HPLC and quad-TOF mass spectrometry.',
    description: 'The pinnacle secretagogue set synthesized by Peptide Sciences USA. Shipped directly from Delhi partner warehouse to Nepal in 10–14 days.',
    highlights: [
      'Peptide Sciences USA reference standard manufacturing',
      '≥99.8% UHPLC chromatographic single peaks',
      'Base Price: ₹34,000 INR (Dual 5mg vials)',
      '10 to 14 days cold-chain transit to Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Freeze dry powder at -20°C.',
    reconstitutionInstructions: 'Carefully reconstitute each vial with 2.0ml BAC water.',
    dosageExample: '100 mcg CJC + 100 mcg Ipamorelin dosed 1–2 times daily.',
    coaUrl: '/lab-results?batch=DEL-PS-CI34000',
    rating: 5.0,
    reviewsCount: 46,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'June Rate List Verified',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-cjc1295-nodac',
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 (No DAC / Mod GRF 1-29) 5mg',
    brand: 'Delhi Peptides Partner',
    series: 'cjc-1295',
    category: 'secretagogues',
    categoryLabel: 'Secretagogues',
    format: 'Lyophilized Vial (5mg)',
    scientificName: 'Modified Growth Hormone Releasing Factor 1-29 (Mod GRF 1-29)',
    basePriceInr: 8000,
    catalogPriceInr: 8000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 12500,
    priceNpr: 12800,
    purityPercent: 99.3,
    batchNumber: 'DEL-CJC-ND5',
    stockCount: 20,
    inStock: true,
    shortDesc: 'Modified GRF 1-29 (CJC-1295 No DAC). Pulsatile physiological GHRH analog triggering natural pituitary pulses without desensitization.',
    description: 'CJC-1295 without DAC mirrors physiological GHRH with a ~30 minute active half-life, creating sharp, natural growth hormone spikes.',
    highlights: [
      '≥99.3% HPLC analytical purity',
      'Base Price: ₹8,000 INR',
      'Ideal for pulsatile pairing with GHRP or Ipamorelin',
      'Nepal Delivery: 10–14 days from Delhi'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Refrigerate at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water.',
    dosageExample: '100 mcg administered 1–3 times daily.',
    coaUrl: '/lab-results?batch=DEL-CJC-ND5',
    rating: 4.8,
    reviewsCount: 28,
    isPopular: false,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Standard Catalog Rate',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-cjc1295-dac',
    slug: 'cjc-1295-with-dac',
    name: 'CJC-1295 (With DAC) 5mg',
    brand: 'Delhi Peptides Partner',
    series: 'cjc-1295',
    category: 'secretagogues',
    categoryLabel: 'Secretagogues',
    format: 'Lyophilized Vial (5mg)',
    scientificName: 'CJC-1295 with Drug Affinity Complex (Extended Half-Life GHRH)',
    basePriceInr: 9500,
    catalogPriceInr: 9500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 14000,
    priceNpr: 15200,
    purityPercent: 99.2,
    batchNumber: 'DEL-CJC-DAC5',
    stockCount: 18,
    inStock: true,
    shortDesc: 'Long-acting GHRH analog with Drug Affinity Complex providing sustained 8-day GH and IGF-1 baseline elevations from a single dose.',
    description: 'CJC-1295 with DAC binds to serum albumin in vivo, drastically extending half-life to approximately 8 days for sustained endocrine support.',
    highlights: [
      'Extended half-life (~8 days) via DAC bioconjugation',
      'Base Price: ₹9,500 INR',
      '≥99.2% Verified purity',
      '10 to 14 days courier delivery to Nepal'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Store refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Reconstitute slowly with sterile BAC water.',
    dosageExample: '2 mg administered once weekly in published studies.',
    coaUrl: '/lab-results?batch=DEL-CJC-DAC5',
    rating: 4.8,
    reviewsCount: 25,
    isPopular: false,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Standard Catalog Rate',
    image: 'https://images.unsplash.com/photo-1579165466791-788226ab6fb3?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. SEMAGLUTIDE SERIES (SUN PHARMA NOVELTREAT & RYBELSUS)
// ─────────────────────────────────────────────────────────────────────────────
export const SEMAGLUTIDE_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-sun-pharma-noveltreat-semaglutide',
    slug: 'sun-pharma-noveltreat-semaglutide',
    name: 'Sun Pharma Noveltreat Semaglutide (14mg Oral / Box of 10)',
    brand: 'Sun Pharma',
    series: 'semaglutide',
    category: 'metabolic',
    categoryLabel: 'Metabolic & GLP-1 Research',
    format: 'Oral Tablets (10ct blister pack)',
    scientificName: 'Sun Pharma Noveltreat Oral Semaglutide 14mg with SNAC Carrier',
    basePriceInr: 6500,
    catalogPriceInr: 6500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 11000,
    priceNpr: 10400,
    purityPercent: 99.8,
    batchNumber: 'DEL-SUN-NOVEL14',
    stockCount: 30,
    inStock: true,
    shortDesc: 'Sun Pharma Noveltreat genuine pharmaceutical 14mg oral Semaglutide. Ten tablets in factory sealed blister pack. Sourced from authorized Delhi distributors.',
    description: 'Sun Pharma Noveltreat provides pure pharmaceutical grade 14mg oral Semaglutide formulated with sodium N-(8-[2-hydroxybenzoyl] amino) caprylate (SNAC) for oral bioavailability.',
    highlights: [
      'Original Sun Pharma factory blister pack (10x 14mg tablets)',
      'Genuine Indian pharmaceutical brand certification',
      'Base Price: ₹6,500 INR (Official June Rate List)',
      'Delivered in Nepal in 10–14 days directly from Delhi'
    ],
    storageInstructions: 'Store in blister packaging at room temperature (15°C–30°C). Protect from moisture.',
    reconstitutionInstructions: 'Solid oral tablet form. No needles or reconstitution required.',
    dosageExample: 'Taken orally once daily in the morning with a sip of water on an empty stomach.',
    coaUrl: '/lab-results?batch=DEL-SUN-NOVEL14',
    rating: 5.0,
    reviewsCount: 52,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Official June Rate List',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-semaglutide-5mg-vial',
    slug: 'semaglutide-5mg-vial',
    name: 'Semaglutide 5mg (Lyophilized Research Vial)',
    brand: 'Delhi Peptides Partner',
    series: 'semaglutide',
    category: 'metabolic',
    categoryLabel: 'Metabolic & GLP-1 Research',
    format: 'Lyophilized Vial (5mg)',
    scientificName: 'GLP-1 Receptor Agonist Semaglutide (Lyophilized 5mg)',
    basePriceInr: 12000,
    catalogPriceInr: 12000,
    shippingFeeInr: 4500,
    totalWithShippingInr: 16500,
    priceNpr: 19200,
    purityPercent: 99.4,
    batchNumber: 'DEL-SEMA-5MG',
    stockCount: 22,
    inStock: true,
    shortDesc: 'High-purity lyophilized Semaglutide 5mg vial. Potent GLP-1 incretin mimetic for appetite modulation and glycemic regulation studies.',
    description: 'Synthetic GLP-1 receptor agonist with 94% structural homology to human incretin. Reconstitutes easily with bacteriostatic water.',
    highlights: [
      '≥99.4% HPLC verified analytical purity',
      'Base Price: ₹12,000 INR',
      'Potent GLP-1 receptor affinity',
      'Cold-chain transit to Nepal (10–14 days)'
    ],
    reconstitutionWaterMl: 2.0,
    storageInstructions: 'Keep dry vial refrigerated at 2°C–8°C.',
    reconstitutionInstructions: 'Mix gently with 2.0ml BAC water.',
    dosageExample: '0.25mg to 1.0mg administered once weekly.',
    coaUrl: '/lab-results?batch=DEL-SEMA-5MG',
    rating: 4.9,
    reviewsCount: 35,
    isPopular: true,
    isFeatured: false,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Standard Catalog Rate',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. SPECIALTY DIRECT SOURCING (ANABOLICS, SERMS, SARMS, HCG, AIs)
// ─────────────────────────────────────────────────────────────────────────────
export const SPECIALTY_SOURCING_PRODUCTS: PeptideProduct[] = [
  {
    id: 'prod-specialty-anabolics-sarms-serms-hcg-ais',
    slug: 'specialty-sourcing-anabolics-sarms-serms-hcg-ais',
    name: 'Anabolics, SARMs, SERMs, HCG & Aromatase Inhibitors (Custom Inquiry)',
    brand: 'Delhi Peptides Partner',
    series: 'specialty',
    category: 'secretagogues',
    categoryLabel: 'Specialty & Custom Sourcing',
    format: 'Direct Partner Sourcing',
    scientificName: 'Specialized Endocrine & Anabolic Research Inventory (Delhi Partner Company)',
    basePriceInr: 4500,
    catalogPriceInr: 4500,
    shippingFeeInr: 4500,
    totalWithShippingInr: 9000,
    priceNpr: 7200,
    purityPercent: 99.5,
    batchNumber: 'DEL-SPECIALTY-2026',
    stockCount: 99,
    inStock: true,
    shortDesc: 'All Anabolics, SERMs, SARMs, HCG, and Aromatase Inhibitors available through our Delhi partner company. Contact us directly for confidential orders. Strictly 100% upfront payment, no COD.',
    description: 'Our Delhi partner network carries comprehensive inventories of specialized research compounds: Anabolics (injectables & orals), SERMs (Tamoxifen/Nolvadex, Clomiphene/Clomid, Enclomiphene, Raloxifene), SARMs (RAD-140, LGD-4033, MK-677, Ostarine, Cardarine, YK-11), HCG (5,000 IU / 10,000 IU), and Aromatase Inhibitors (Anastrozole/Arimidex, Exemestane/Aromasin, Letrozole/Femara). Contact us on WhatsApp or phone to receive the private catalog and place your order. Strict policy: 100% upfront payment, no Cash on Delivery (COD). Flat ₹4,500 shipping & handling applies.',
    highlights: [
      'Comprehensive Delhi inventory: Anabolics, SERMs, SARMs, HCG, AIs',
      'Direct confidential procurement from our verified Delhi partner company',
      'Flat ₹4,500 INR shipping & handling (cold-chain, 10–14 days across Nepal)',
      'Strictly 100% complete upfront payment · Absolutely NO COD'
    ],
    storageInstructions: 'Follow specific storage guidelines on product label.',
    reconstitutionInstructions: 'Follow packaged clinical handling guidelines.',
    dosageExample: 'Contact our consultation team for compound documentation.',
    coaUrl: '/lab-results?batch=DEL-SPECIALTY-2026',
    rating: 5.0,
    reviewsCount: 50,
    isPopular: true,
    isFeatured: true,
    deliveryTimeline: '10–14 days',
    sourcePartner: 'Delhi Peptides Partner Company',
    activeOffer: 'Available on Direct Request',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. COMBINED COMPLETE PEPTIDE PRODUCT CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_PEPTIDE_PRODUCTS: PeptideProduct[] = [
  ...GHRP_SERIES_PRODUCTS,
  ...RETATRUTIDE_PRODUCTS,
  ...BPC157_PRODUCTS,
  ...HGH_PRODUCTS,
  ...IPAMORELIN_CJC_PRODUCTS,
  ...SEMAGLUTIDE_PRODUCTS,
  ...SPECIALTY_SOURCING_PRODUCTS
];

/**
 * Filter products by specific peptide series
 */
export function getProductsBySeries(series: PeptideProduct['series']): PeptideProduct[] {
  return ALL_PEPTIDE_PRODUCTS.filter(p => p.series === series);
}

/**
 * Calculate total price including the mandatory ₹4,500 flat shipping & handling fee
 */
export function calculateOrderTotal(basePriceInr: number, quantity: number = 1): {
  subtotalInr: number;
  shippingFeeInr: number;
  totalInr: number;
  subtotalNpr: number;
  shippingFeeNpr: number;
  totalNpr: number;
} {
  const subtotalInr = basePriceInr * quantity;
  const shippingFeeInr = SHIPPING_HANDLING_CONFIG.feeInr;
  const totalInr = subtotalInr + shippingFeeInr;
  
  const subtotalNpr = Math.round(subtotalInr * 1.6);
  const shippingFeeNpr = SHIPPING_HANDLING_CONFIG.feeNpr;
  const totalNpr = subtotalNpr + shippingFeeNpr;

  return {
    subtotalInr,
    shippingFeeInr,
    totalInr,
    subtotalNpr,
    shippingFeeNpr,
    totalNpr
  };
}

/**
 * Currency Formatting Helpers
 */
export function formatInr(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export function formatNpr(amount: number): string {
  return `रू ${amount.toLocaleString('en-NP')}`;
}
