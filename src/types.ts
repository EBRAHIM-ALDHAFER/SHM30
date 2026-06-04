export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  type: 'sale' | 'purchase';
  customer: string;
  date: string;
  total: number;
  status: 'مدفوع' | 'معلق';
  items: InvoiceItem[];
  company_id?: string;
  store_id?: string;
  branch_id?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  description?: string;
  image?: string;
  company_id?: string;
  store_id?: string;
  branch_id?: string;
  
  // Advanced AI Product Lifecycle Engine Optional Fields
  subtitle?: string;
  localCategory?: string;
  brand?: string;
  longDescription?: string;
  discountPrice?: string;
  discountStart?: string;
  discountEnd?: string;
  barcode?: string;
  gtin?: string;
  mpn?: string;
  warehouse?: string;
  alertLimit?: string;
  requiresShipping?: boolean;
  weight?: string;
  weightUnit?: string;
  length?: string;
  width?: string;
  height?: string;
  isTaxable?: boolean;
  taxType?: string;
  taxRate?: string;
  seoTitle?: string;
  seoSlug?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishSalla?: boolean;
  publishZid?: boolean;
  publishShopify?: boolean;
  publishWoo?: boolean;
  publishNoon?: boolean;
  publishAmazon?: boolean;
  platformSpecificFields?: any;
  marketingShortAd?: string;
  marketingAdDescription?: string;
  marketingHashtags?: string;
  marketingTargetAudience?: string;
  marketingRecommendedChannels?: string;
  assets?: any[];
  variants?: any[];
  timeline?: any[];
  productStatus?: "draft" | "review_needed" | "ready_to_publish" | "published" | "archived";
  backups?: any[];
}

export interface AddressProfile {
  shortAddress: string;       // العنوان الوطني المختصر
  buildingNumber: string;     // رقم المبنى
  streetName: string;         // اسم الشارع
  district: string;           // الحي
  city: string;               // المدينة
  region: string;             // المنطقة
  postalCode: string;         // الرمز البريدي
  additionalNumber: string;   // الرقم الإضافي
  unitNumber: string;         // رقم الوحدة
  country: string;            // الدولة
  mapLink: string;            // رابط الموقع على الخريطة
  gpsCoordinates?: string;    // إحداثيات GPS اختيارية
  latitude?: string;          // خط العرض اختياري
  longitude?: string;         // خط الطول اختياري
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  balance: number; // Positive means we owe them (له), Negative means they owe us (عليه)
  addressProfile?: AddressProfile;
  imageUrl?: string;
  company_id?: string;
  store_id?: string;
  branch_id?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  company: string;
  balance: number; // Positive means we owe them (له / مستحقات المورد), Negative means they owe us (مدفوع مقدمًا)
  addressProfile?: AddressProfile;
  imageUrl?: string;
  company_id?: string;
  store_id?: string;
  branch_id?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  avatar: string;
  addressProfile?: AddressProfile;
  imageUrl?: string;
  phone?: string;
  email?: string;
  company?: string;
  storeId?: string;
  branchId?: string;
  warehouseId?: string;
  posId?: string;
  permissions?: string[];
  allowedStores?: string[];
  allowedBranches?: string[];
  allowedWarehouses?: string[];
  allowedPosUnits?: string[];
  defaultStoreId?: string;
  defaultBranchId?: string;
  defaultWarehouseId?: string;
  defaultPosId?: string;
}

export type ThemeType = 'dark' | 'light' | 'royal' | 'executive' | 'luxury' | 'saudi' | 'neon_ai' | 'custom';

export interface ThemeColors {
  name: string;
  bg: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  // Professional Styling Properties for Theme Builder and Preset Themes
  fontFamily?: string;      // E.g. 'Cairo', 'Amiri', 'Tajawal', 'mono'
  borderRadius?: string;    // E.g. '8px', '16px', '0px' (brutalist)
  shadow?: string;          // E.g. 'none', '0 4px 12px rgba(0,0,0,0.1)'
  borderStyle?: string;     // E.g. 'solid', 'dashed'
  glowColor?: string;       // For Neon glows
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
  employees: string[];
  workingHours: string;
  sales: number;
  profits: number;
  expenses: number;
  customersCount: number;
  isActive: boolean;
  addressProfile?: AddressProfile;
  imageUrl?: string;
  associatedWh?: string;
  items?: { productId: string; stock: number; minLimit?: number; locationCode?: string; }[];
  
  // Exact requested fields
  branch_id?: string;
  store_id?: string;
  company_id?: string;
  branch_name?: string;
  linked_warehouse_id?: string;
  status?: string;
}

export interface WarehouseItem {
  productId: string;
  stock: number;
}

export interface Warehouse {
  id: string;
  name: string;
  type: 'main' | 'sub' | 'branch';
  location: string;
  manager: string;
  capacity: number; // e.g. Max total items it can store
  items: WarehouseItem[];
  store_id?: string;
  isActive?: boolean;
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  fromType: 'warehouse' | 'branch';
  fromId: string;
  fromName: string;
  toType: 'warehouse' | 'branch';
  toId: string;
  toName: string;
  productId: string;
  productName: string;
  qty: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  notes?: string;
  historyLogs: string[];
}

export interface RolePermission {
  role: string;
  roleNameAr: string;
  modules: {
    dashboard: boolean;
    invoices: boolean;
    products: boolean;
    customers: boolean;
    suppliers: boolean;
    branches: boolean;
    warehouses: boolean;
    aiHub: boolean;
    settings: boolean;
  };
  actions: {
    canAddInvoice: boolean;
    canAddProduct: boolean;
    canDeleteProduct: boolean;
    canDoTransfer: boolean;
    canApproveTransfer: boolean;
  };
}

// ============== ERP ACCOUNTING TYPES ==============

export interface Account {
  code: string;
  name: string;
  type: 'assets' | 'liabilities' | 'equity' | 'revenues' | 'expenses';
  status: 'active' | 'suspended';
  descriptionAr?: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  ref: string; // e.g., "فاتورة بيع #101" or "رواتب مايو"
  lines: JournalLine[];
  isPosted: boolean; // locked from edit and deletion after post
  attachment?: string; // base64 or simulated filename
  company_id?: string;
  store_id?: string;
  branch_id?: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  category: 'vehicles' | 'computers' | 'machinery' | 'furniture';
  cost: number;
  purchaseDate: string;
  usefulLifeYears: number;
  depreciationRate: number; // Straight line rate, e.g. 0.20 for 5 years
  accumulatedDepreciation: number;
}

export interface PayrollEmployee {
  id: string;
  name: string;
  role: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  status: 'paid' | 'pending';
  addressProfile?: AddressProfile;
  imageUrl?: string;
}

export interface ExpenseTransaction {
  id: string;
  category: string; // 'salaries' | 'rent' | 'marketing' | 'shipping' | 'utilities' | 'other'
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'cash' | 'bank';
  attachmentName?: string;
  accountCode?: string;
  payeeType?: 'employee' | 'supplier' | 'customer' | 'branch' | 'other';
  payeeId?: string;
  payeeName?: string;
  company_id?: string;
  store_id?: string;
  branch_id?: string;
}

export interface BudgetItem {
  category: string;
  planned: number;
  actual: number;
}

export interface StoreBankAccount {
  id: string;
  bankName: string;
  iban: string;
  accountNumber: string;
  beneficiaryName: string;
}

export interface StoreDocument {
  id: string;
  name: string;
  category: 'cr' | 'vat' | 'zakat' | 'maroof' | 'contract' | 'license' | 'other';
  uploadedAt: string;
  fileUrl?: string;
  fileSize?: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  tradeName: string;
  companyLegalName: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  invoiceLogoUrl?: string;
  stampUrl?: string;
  
  crNumber: string;
  crDate: string;
  crExpiryDate: string;
  vatNumber: string;
  unifiedNumber700: string;
  zakatNumber: string;
  maroofNumber: string;
  ministryOfLaborNumber: string;
  establishmentNumber: string;
  
  phone: string;
  supportPhone: string;
  email: string;
  supportEmail: string;
  website: string;
  
  address: AddressProfile;
  
  bankAccounts: StoreBankAccount[];
  documents: StoreDocument[];
  
  branches: string[]; // Linked branch IDs
  warehouses: string[]; // Linked warehouse IDs
  users: number[]; // Linked user IDs
  
  platforms: {
    salla: { isConnected: boolean; taxNumber: string; apiKey?: string };
    zid: { isConnected: boolean; storeId: string; managerToken?: string };
    shopify: { isConnected: boolean; storeUrl: string; accessToken?: string };
    wooCommerce: { isConnected: boolean; consumerKey: string; consumerSecret: string };
  };
  
  isActive: boolean;
  isDefault: boolean;
  isArchived?: boolean;
}


