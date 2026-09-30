export type Category = 
  | 'all'
  | 'recovery'
  | 'hgh'
  | 'metabolic'
  | 'longevity'
  | 'supplies';

export interface ProductVialOption {
  mg: number;
  label: string;
  priceInr: number;
  originalPriceInr?: number;
  priceNpr?: number;
  originalPriceNpr?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  format?: string; // e.g. 'Lyophilized Vial', 'Oral Capsules', 'Blend'
  scientificName: string;
  category: 'recovery' | 'hgh' | 'secretagogues' | 'metabolic' | 'longevity' | 'supplies';
  categoryLabel: string;
  priceInr: number;
  originalPriceInr?: number;
  priceNpr?: number;
  originalPriceNpr?: number;
  vialOptions: ProductVialOption[];
  defaultVialMg: number;
  inStock: boolean;
  stockCount: number;
  purityPercent: number; // e.g. 99.4
  batchNumber: string;
  casNumber?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  sequence?: string;
  shortDesc: string;
  description: string;
  highlights: string[];
  reconstitutionWaterMl: number;
  storageInstructions: string;
  reconstitutionInstructions: string;
  dosageExample: string;
  coaUrl?: string;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  image: string;
  deliveryTimeline?: string; // Default: '10–14 days'
  activeOffer?: string;
  sourcePartner?: string;
}

export interface CartItem {
  id: string; // unique item id: productId-vialMg
  productId: string;
  product: Product;
  selectedVialMg: number;
  unitPriceInr: number;
  unitPriceNpr?: number;
  quantity: number;
}

export type PaymentMethod = 'esewa' | 'khalti' | 'cod' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'verified' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  vialMg: number;
  unitPriceInr: number;
  unitPriceNpr?: number;
  quantity: number;
  totalInr: number;
  totalNpr?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotalInr: number;
  deliveryFeeInr: number;
  discountInr: number;
  totalInr: number;
  subtotalNpr: number;
  deliveryFeeNpr: number;
  discountNpr: number;
  totalNpr: number;
  currency?: string;
  deliveryTimeline?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionRef?: string;
  trackingNumber: string;
  createdAt: string;
}

export interface BatchCOA {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  vialSize: string;
  purityPercent: number;
  testDate: string;
  testingLab: string;
  analyst: string;
  testMethod: string;
  molecularMassFound: string;
  expectedMass: string;
  heavyMetals: 'Pass' | 'Fail';
  endotoxinLevel: string;
  status: 'Verified' | 'Pending';
  notes: string;
}

export interface GuideFact {
  label: string;
  text: string;
}

export interface GuideSource {
  title: string;
  url: string;
}

export interface GuideItem {
  id: string;
  name: string;
  aka: string;
  status: 'Approved' | 'In trials' | 'Not approved';
  badge: string;
  facts: GuideFact[];
  sources: GuideSource[];
  dopingStatus?: string;
  nepalRegulatoryStatus?: string;
}

export interface QuizQuestion {
  id: string;
  statement: string;
  answer: 'myth' | 'fact';
  explanation: string;
  reference: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  address?: string;
  city?: string;
  district?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
