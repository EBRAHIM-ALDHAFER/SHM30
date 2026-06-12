export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  total: number;
  product_id?: string;
  sku?: string;
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
  tenant_id?: string;
  discount?: number;
  pos_id?: string;
  posId?: string;
  warehouse_id?: string;
  warehouseId?: string;
  warehouse?: string;
  shift_id?: string;
  shiftId?: string;
  payment_method?: string;
  paymentMethod?: string;
  cash_amount?: number;
  cashAmount?: number;
  card_amount?: number;
  cardAmount?: number;
  transfer_amount?: number;
  transferAmount?: number;
  wallet_amount?: number;
  walletAmount?: number;
  sale_id?: string;
  saleId?: string;
  created_at?: string;
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
  tenant_id?: string;
  pos_id?: string;
  warehouse_id?: string;
  shift_id?: string;
  
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
  shortCode?: string;         // الاختصار الموحد للقبول
  gps?: {
    lat: string;
    lng: string;
  };
  mapUrl?: string;            // رابط الموقع
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
  id: string | number;
  tenant_id?: string;
  organization_id?: string;
  company_id?: string;
  fullName: string; // الاسم الكامل
  username: string; // اسم المستخدم
  email: string; // البريد الإلكتروني
  phone?: string; // رقم الجوال
  passwordHash?: string; // كلمة مرور مشفرة/مسجلة
  password?: string; // كلمة المرور الصافية
  role: "tenant_owner" | "admin" | "branch_manager" | "inventory_manager" | "cashier" | "accountant" | "marketer" | "support" | "custom" | string;
  department?: "management" | "sales" | "warehouse" | "support" | string; // القسم: إدارة، مبيعات، مخازن، دعم فني
  status: "active" | "disabled" | "pending"; // نشط / موقوف / بانتظار التفعيل
  emailVerified: boolean; // البريد موثق / غير موثق
  mustChangePassword: boolean; // إجبار المستخدم على تغيير كلمة المرور عند أول دخول
  allowedStoreIds: string[]; // المتاجر المسموحة
  allowedBranchIds: string[]; // الفروع المسموحة
  allowedWarehouseIds: string[]; // المستودعات المسموحة
  allowedPosIds: string[]; // نقاط البيع المسموحة
  permissions: string[]; // الصلاحيات التفصيلية
  lastLoginAt?: string; // آخر دخول
  createdAt: string; // تاريخ الإنشاء
  createdBy: string; // أنشئ بواسطة
  workLocationType?: "hq" | "store" | "branch" | "warehouse" | "pos" | "remote"; // نوع موقع العمل
  workLocationId?: string; // معرف موقع العمل
  disableReason?: string; // سبب التعطيل المبرر

  // Compatibility fields for legacy code references
  name?: string;
  avatar?: string;
  imageUrl?: string;
  company?: string;
  storeId?: string;
  branchId?: string;
  warehouseId?: string;
  posId?: string;
  allowedStores?: string[];
  allowedBranches?: string[];
  allowedWarehouses?: string[];
  allowedPosUnits?: string[];
  defaultStoreId?: string;
  defaultBranchId?: string;
  defaultWarehouseId?: string;
  defaultPosId?: string;
  addressProfile?: AddressProfile;
  shortNationalAddress?: string;
  address?: {
    shortCode: string;
    buildingNumber: string;
    streetName: string;
    district: string;
    city: string;
    postalCode: string;
    additionalNumber: string;
    gps: {
      lat: string;
      lng: string;
    };
    mapUrl: string;
  };
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
  tenant_id?: string;
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
  tenant_id?: string;
  company_id?: string;
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
  tenant_id?: string;
  company_id?: string;
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
  companyId?: string; // Links the store/sale channel to an establishment/company
}

export interface CompanyProfile {
  id: string;
  tenant_id?: string;
  name: string; // الاسم التجاري للمنشأة
  companyLegalName: string; // الاسم القانوني للشركة / الكيان
  crNumber: string; // رقم السجل التجاري
  crDate: string; // تاريخ السجل التجاري
  crExpiryDate: string; // تاريخ انتهاء السجل التجاري
  vatNumber: string; // الرقم الضريبي
  unifiedNumber700: string; // الرقم الموحد 700
  address: string; // العنوان الوطني للمنشأة
  managerName: string; // المالك / المدير المسؤول
  phone: string; // رقم التواصل للمنشأة
  email: string; // البريد الإلكتروني للمنشأة
  bankAccount: string; // الحساب البنكي / الإيبان
  status: "active" | "suspended" | "draft"; // الحالة الرسمية للمنشأة
  subscriptionPlan: string; // نوع الباقة والاشتراك (e.g. باقة دقة الاحترافية)
  logoUrl?: string; // شعار المنشأة
  coverUrl?: string; // غلاف المنشأة
  invoiceLogoUrl?: string; // شعار الفواتير للمنشأة
  stampUrl?: string; // ختم المنشأة الملون
  country?: string; // دولة المنشأة
  country_code?: string; // رمز الدولة
  phone_country_code?: string; // مفتاح الاتصال
  phone_e164?: string; // رقم الهاتف بصيغة e164
  createdAt: string; // تاريخ التأسيس في النظام
}

export interface SubscriptionPlan {
  id: string;
  name_ar: string;
  name_en: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  status: "active" | "inactive" | "hidden";
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  enabled: boolean;
  limit_value: number;
  is_unlimited: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  company_id: string;
  plan_id: string;
  status: "trial" | "active" | "suspended" | "expired" | "cancelled";
  start_date: string;
  trial_ends_at: string;
  current_period_start: string;
  current_period_end: string;
  billing_cycle: "monthly" | "yearly";
  custom_price?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionUsage {
  id: string;
  tenant_id: string;
  company_id: string;
  period_month: string;
  invoices_count: number;
  products_count: number;
  users_count: number;
  branches_count: number;
  stores_count: number;
  pos_count: number;
  ai_requests_count: number;
  storage_used_mb: number;
  updated_at?: string;
}

export interface TenantFeatureOverride {
  id: string;
  tenant_id: string;
  company_id: string;
  feature_key: string;
  enabled: boolean;
  limit_value: number;
  is_unlimited: boolean;
  reason: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductStudioSession {
  id: string;
  tenant_id: string;
  company_id: string;
  store_id?: string;
  branch_id?: string;
  product_id?: string;
  category_id?: string;
  status: 'draft' | 'processing' | 'ready' | 'approved' | 'failed';
  current_step: string;
  brand_voice?: string;
  target_market?: string;
  target_audience?: string;
  sales_channel?: string;
  original_image_url?: string;
  approved_text_version_id?: string;
  approved_image_asset_ids?: string[];
  approved_video_asset_ids?: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  product_name?: string;
  price?: number;
  cost?: number;
  sku?: string;
  quantity?: number;
  user_notes?: string;
}

export interface BrandProfile {
  id: string;
  tenant_id: string;
  company_id: string;
  brand_name: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  fonts?: Record<string, any>;
  tone_of_voice?: string;
  forbidden_words?: string[];
  preferred_words?: string[];
  logo_url?: string;
  guidelines?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProductAiAnalysis {
  id: string;
  session_id: string;
  tenant_id: string;
  product_id?: string;
  analysis_json: Record<string, any>;
  product_type: string;
  suggested_category: string;
  target_audience: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  score: number;
  created_at?: string;
}

export interface ProductContentVersion {
  id: string;
  session_id: string;
  tenant_id: string;
  product_id?: string;
  version_number: number;
  style: string;
  language: string;
  title: string;
  product_name: string;
  short_description: string;
  long_description: string;
  features: string[];
  benefits: string[];
  seo_keywords: string[];
  captions: {
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    salla?: string;
    zid?: string;
    amazon?: string;
  };
  ad_copy: {
    ad_title?: string;
    ad_body?: string;
  };
  cta: string;
  status: 'draft' | 'processing' | 'ready' | 'approved' | 'failed';
  is_approved: boolean;
  prompt_used?: string;
  ai_model?: string;
  created_at?: string;
}

export interface ProductAsset {
  id: string;
  session_id: string;
  tenant_id: string;
  company_id?: string;
  product_id?: string;
  category_id?: string;
  asset_type: 'image' | 'image_prompt' | 'video' | 'video_prompt';
  asset_purpose: 'Hero' | 'Features' | 'Offer' | 'Story' | 'ShortVideo' | 'DeepVideo';
  title?: string;
  url?: string;
  content?: string;
  prompt_used?: string;
  generation_settings?: Record<string, any>;
  dimensions?: '1:1' | '4:5' | '9:16' | '16:9' | 'Banner';
  file_size?: number;
  mime_type?: string;
  status: 'draft' | 'processing' | 'ready' | 'approved' | 'failed';
  is_approved: boolean;
  storage_path?: string;
  created_by?: string;
  created_at?: string;
}

export interface ProductPublishPackage {
  id: string;
  session_id: string;
  tenant_id: string;
  product_id: string;
  channel: 'InternalStore' | 'Salla' | 'Zid' | 'Shopify' | 'Instagram' | 'TikTok' | 'WhatsApp' | 'Snapchat' | 'Amazon' | 'AdCampaign';
  title?: string;
  description?: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  selected_asset_ids?: string[];
  status: 'draft' | 'reviewed' | 'approved';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface ProductQualityReview {
  id: string;
  session_id: string;
  tenant_id: string;
  product_id?: string;
  overall_score: number;
  content_score: number;
  image_score: number;
  video_score: number;
  brand_score: number;
  persuasion_score: number;
  positives: string[];
  negatives: string[];
  recommendations: string[];
  status: 'ready' | 'needs_improvement' | 'rejected';
  created_at?: string;
}




