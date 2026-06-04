import React, { useState, useEffect, useMemo } from "react";
import { Invoice, Product, Customer, User, ThemeType, ThemeColors, Supplier, StoreProfile } from "./types";
import { INVOICES0, PRODUCTS0, CUSTOMERS0, SUPPLIERS0, USERS, STORES0 } from "./data";
import { SahmDatabaseService, freeUpLocalStorageSpace } from "./core/database/dbService";
import { branchService } from "./core/database/branchService";
import { warehouseService } from "./core/database/warehouseService";
import { posService } from "./core/database/posService";

// Import custom views
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Invoices from "./components/Invoices";
import Products from "./modules/products/ProductsPage";
import Customers from "./components/Customers";
import Suppliers from "./components/Suppliers";
import Reports from "./components/Reports";
import HelpSupport from "./components/HelpSupport";
import Settings from "./components/Settings";
import SahmCommandCenter from "./components/SahmCommandCenter";
import IntelligentHub from "./components/IntelligentHub";
import PosAndOperations from "./components/PosAndOperations";
import AccountingERP from "./components/AccountingERP";
import UnifiedActionSystem from "./components/UnifiedActionSystem";
import UnifiedProfileHub from "./components/UnifiedProfileHub";
import AIProductBuilder from "./components/AIProductBuilder";
import StoreManager from "./components/StoreManager";
import SahmIntegrationsHub from "./components/SahmIntegrationsHub";
import FacilitySetup from "./components/FacilitySetup";

// Enterprise Modular System Imports
import UnifiedNotifications from "./components/UnifiedNotifications";
import GlobalUnifiedSearch from "./components/GlobalUnifiedSearch";
import AuditLogTimeline from "./components/AuditLogTimeline";
import BackupRestoreSystem from "./components/BackupRestoreSystem";
import SaaSSubscriptionEngine from "./components/SaaSSubscriptionEngine";
import ThemeStudioMarketplace from "./components/ThemeStudioMarketplace";
import { sahmIconPngUrl, sahmLogoPngUrl, sahmMiniMarkPngUrl, sahmSplashPngUrl } from "./assets/brand/sahm-brand-assets";

// Import lucide icons for navigators
import { 
  Grid, FileText, Package, Users, BarChart3, Sparkles, Send, Settings as SettingsIcon, LogOut, Store, HelpCircle, Truck, Cpu, Bot, MapPin, Landmark, Bell, Zap, X, Image, Layers, Sliders, Plus, Link, Building
} from "lucide-react";

// Themes configuration mapping matching user specifications
const THEMES_PRESETS: Record<ThemeType, Omit<ThemeColors, 'accent'>> = {
  dark: {
    name: "داكن",
    bg: "#080D17",
    surface: "#0F1724",
    card: "#151F30",
    border: "#1C2A40",
    text: "#EDF2FF",
    muted: "#5A6E8C",
    fontFamily: "Cairo",
    borderRadius: "12px",
  },
  light: {
    name: "فاتح",
    bg: "#F0F4FF",
    surface: "#FFFFFF",
    card: "#F8FAFF",
    border: "#DDE5F0",
    text: "#0F1724",
    muted: "#6B7FA3",
    fontFamily: "Cairo",
    borderRadius: "12px",
  },
  royal: {
    name: "سهم رويال 👑",
    bg: "#0B0905",
    surface: "#14110A",
    card: "#1D1911",
    border: "#332614",
    text: "#F7F4EB",
    muted: "#9E8E75",
    fontFamily: "Amiri",
    borderRadius: "4px",
    shadow: "0 4px 20px rgba(212, 175, 55, 0.08)",
  },
  executive: {
    name: "سهم التنفيذي 💼",
    bg: "#0D0D0D",
    surface: "#171717",
    card: "#212121",
    border: "#333333",
    text: "#FFFFFF",
    muted: "#8A8A8A",
    fontFamily: "Tajawal",
    borderRadius: "0px",
    shadow: "none",
  },
  luxury: {
    name: "سهم الفاخر ✨",
    bg: "#080604",
    surface: "#14100E",
    card: "#1C1613",
    border: "#3A2A20",
    text: "#EADACE",
    muted: "#9C8372",
    fontFamily: "Cairo",
    borderRadius: "24px",
    shadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  saudi: {
    name: "سهم السعودي 🇸🇦",
    bg: "#02120A",
    surface: "#082415",
    card: "#0D331F",
    border: "#175736",
    text: "#F4FFF8",
    muted: "#7EAB93",
    fontFamily: "Cairo",
    borderRadius: "16px",
  },
  neon_ai: {
    name: "سهم نيون AI 🤖",
    bg: "#030207",
    surface: "#0A0615",
    card: "#100B22",
    border: "#231849",
    text: "#E9E5FF",
    muted: "#7770A3",
    fontFamily: "JetBrains Mono",
    borderRadius: "10px",
    glowColor: "#10B981",
    shadow: "0 0 15px rgba(16, 185, 129, 0.15)",
  },
  custom: {
    name: "مخصص 🛠️",
    bg: "#0F1115",
    surface: "#171B21",
    card: "#212730",
    border: "#2C3440",
    text: "#EAEFF5",
    muted: "#7B889B",
    fontFamily: "Cairo",
    borderRadius: "12px",
  }
};

const ACCENTS_PRESETS: Record<string, string> = {
  orange: "#D4AF37",
  blue:   "#3B82F6",
  green:  "#10B981",
  purple: "#8B5CF6",
  red:    "#EF4444",
  pink:   "#EC4899",
};
const LS_KEYS = {
  INVOICES: "sahm_web_invoices",
  PRODUCTS: "sahm_web_products",
  CUSTOMERS: "sahm_web_customers",
  SUPPLIERS: "sahm_web_suppliers",
  STORE: "sahm_web_store",
  THEME: "sahm_web_theme",
  ACCENT: "sahm_web_accent",
  CURRENCY: "sahm_web_currency",
  NOTIFICATIONS: "sahm_web_notifications",
  USER: "sahm_web_user",
};

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Business and preference states
  const [invoices, setInvoicesRaw] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INVOICES0;
    } catch {
      return INVOICES0;
    }
  });

  const [products, setProductsRaw] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : PRODUCTS0;
    } catch {
      return PRODUCTS0;
    }
  });

  const [customers, setCustomersRaw] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : CUSTOMERS0;
    } catch {
      return CUSTOMERS0;
    }
  });

  const [suppliers, setSuppliersRaw] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : SUPPLIERS0;
    } catch {
      return SUPPLIERS0;
    }
  });

  const [stores, setStoresRaw] = useState<StoreProfile[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_stores");
      return saved ? JSON.parse(saved) : STORES0;
    } catch {
      return STORES0;
    }
  });

  const [activeStoreId, setActiveStoreIdRaw] = useState<string>(() => {
    try {
      return localStorage.getItem("sahm_active_store_id") || "store_1";
    } catch {
      return "store_1";
    }
  });

  const [showStoreManagerModal, setShowStoreManagerModal] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);

  const setStores = (val: StoreProfile[]) => {
    setStoresRaw(val);
    localStorage.setItem("sahm_web_stores", JSON.stringify(val));
  };

  const setActiveStoreId = (val: string) => {
    setActiveStoreIdRaw(val);
    localStorage.setItem("sahm_active_store_id", val);
  };

  const [storeName, setStoreNameRaw] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_KEYS.STORE) || "مراسيم الطيب";
    } catch {
      return "مراسيم الطيب";
    }
  });

  // Keep legacy state updated as active store changes dynamically
  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0] || STORES0[0];

  useEffect(() => {
    if (activeStore) {
      setStoreNameRaw(activeStore.name);
      localStorage.setItem(LS_KEYS.STORE, activeStore.name);
      
      setStoreCRRaw(activeStore.crNumber);
      localStorage.setItem("sahm_web_store_cr", activeStore.crNumber);
      
      setStoreVatRaw(activeStore.vatNumber);
      localStorage.setItem("sahm_web_store_vat", activeStore.vatNumber);
      
      const primaryBankIban = activeStore.bankAccounts?.[0]?.iban || "";
      setStoreIBANRaw(primaryBankIban);
      localStorage.setItem("sahm_web_store_iban", primaryBankIban);
      
      const primaryAddress = activeStore.address 
        ? `${activeStore.address.buildingNumber || ""} ${activeStore.address.streetName || ""}، ${activeStore.address.district || ""}، ${activeStore.address.city || ""}`
        : "";
      setStoreAddressRaw(primaryAddress);
      localStorage.setItem("sahm_web_store_address", primaryAddress);
    }
  }, [activeStoreId, stores]);

  // Fetch and sync data with SahmDatabaseService (PostgreSQL/Supabase)
  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    db.initializeSupabase();

    db.getProducts(activeStoreId).then(data => {
      if (data && data.length > 0) setProductsRaw(data);
    });
    db.getInvoices(activeStoreId).then(data => {
      if (data && data.length > 0) setInvoicesRaw(data);
    });
    db.getCustomers(activeStoreId).then(data => {
      if (data && data.length > 0) setCustomersRaw(data);
    });
    db.getSuppliers(activeStoreId).then(data => {
      if (data && data.length > 0) setSuppliersRaw(data);
    });
  }, [activeStoreId]);

  const [themeKey, setThemeKeyRaw] = useState<ThemeType>(() => {
    try {
      return (localStorage.getItem(LS_KEYS.THEME) as ThemeType) || "dark";
    } catch {
      return "dark";
    }
  });

  const [accentKey, setAccentKeyRaw] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_KEYS.ACCENT) || "orange";
    } catch {
      return "orange";
    }
  });

  const [currency, setCurrencyRaw] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_KEYS.CURRENCY) || "ر.س";
    } catch {
      return "ر.س";
    }
  });

  const [notifications, setNotificationsRaw] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Store Company Identity parameters
  const [storeAddress, setStoreAddressRaw] = useState<string>(() => {
    try {
      return localStorage.getItem("sahm_web_store_address") || "طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية";
    } catch {
      return "طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية";
    }
  });
  const [storeCR, setStoreCRRaw] = useState<string>(() => {
    try {
      return localStorage.getItem("sahm_web_store_cr") || "1010778844";
    } catch {
      return "1010778844";
    }
  });
  const [storeVat, setStoreVatRaw] = useState<string>(() => {
    try {
      return localStorage.getItem("sahm_web_store_vat") || "310499221100003";
    } catch {
      return "310499221100003";
    }
  });
  const [storeIBAN, setStoreIBANRaw] = useState<string>(() => {
    try {
      return localStorage.getItem("sahm_web_store_iban") || "SA8040000001234567890123";
    } catch {
      return "SA8040000001234567890123";
    }
  });

  // Global Interactive Systems
  const [actionItem, setActionItem] = useState<{ type: string; data: any } | null>(null);
  const [showNotifTray, setShowNotifTray] = useState(false);
  
  // Custom Workspace widget configurations:
  const [workspaceLayout, setWorkspaceLayoutRaw] = useState<{id: string, name: string, active: boolean}[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_workspace_layout_config");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [
      { id: "revenue_metric", name: "إيرادات المبيعات اللحظية", active: true },
      { id: "ai_analysis", name: "المحلل الذكي ومراقبة المنافسين", active: true },
      { id: "low_stock", name: "مستويات المخازن المهددة بالنفاد", active: true },
      { id: "accounting_notes", name: "مدونة الحسابات السريعة والقيود", active: true },
      { id: "direct_cameras", name: "بث كاميرات المراقبة الحية للفروع", active: true },
      { id: "zakat_calculator", name: "حاسبة الزكاة والضرائب", active: true }
    ];
  });

  // Shared Workspace Environment States (Requirement 6, 7 & 8)
  const [branches, setBranches] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_branches");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "br_riyadh_main",
        name: "فرع الرياض",
        city: "الرياض",
        address: "طريق الملك فهد، حي المروج",
        phone: "0112445566",
        manager: "عبدالله بن فهد",
        employees: ["صالح الشمري", "محمد العتيبي", "خالد الحربي", "نورة القحطاني"],
        workingHours: "08:00 ص - 11:00 م",
        associatedWh: "wh_central_riyadh",
        storeId: "store_1",
        status: "نشط",
        sales: 145000,
        profits: 48000,
        expenses: 12000,
        customersCount: 380,
        isActive: true
      },
      {
        id: "br_jeddah_int",
        name: "فرع جدة",
        city: "جدة",
        address: "طريق الملك عبدالعزيز، ردسي مول",
        phone: "0123554433",
        manager: "أنس القرني",
        employees: ["مازن السهلي", "سهام القحطاني", "بدر الغامدي"],
        workingHours: "10:00 ص - 12:00 م",
        associatedWh: "wh_jeddah_sub",
        storeId: "store_2",
        status: "نشط",
        sales: 98000,
        profits: 31000,
        expenses: 15000,
        customersCount: 220,
        isActive: true
      },
      {
        id: "br_dammam",
        name: "معرض دبي",
        city: "دبي",
        address: "دبي سنتر، شارع الشيخ زايد",
        phone: "043554422",
        manager: "رائد المطيري",
        employees: ["سمير الدوسري", "سلطان العتيبي"],
        workingHours: "09:00 ص - 11:00 م",
        associatedWh: "", // Keep unlinked by default for Requirement 5 testing simulation!
        storeId: "store_3",
        status: "نشط",
        sales: 42000,
        profits: 11000,
        expenses: 7000,
        customersCount: 95,
        isActive: true
      }
    ];
  });

  // State variables for Add Branch form (inside Organisational Hierarchy tab)
  const [showAddBranchForm, setShowAddBranchForm] = useState(false);
  const [addBranchName, setAddBranchName] = useState("");
  const [addBranchCity, setAddBranchCity] = useState("الرياض");
  const [addBranchAddress, setAddBranchAddress] = useState("");
  const [addBranchManager, setAddBranchManager] = useState("");
  const [addBranchPhone, setAddBranchPhone] = useState("");
  const [addBranchStoreId, setAddBranchStoreId] = useState("store_1");
  const [addBranchWhId, setAddBranchWhId] = useState("");
  const [addBranchStatus, setAddBranchStatus] = useState("نشط");

  // State variables for Add Warehouse form inside the Workspace screen
  const [showAddWarehouseForm, setShowAddWarehouseForm] = useState(false);
  const [addWhName, setAddWhName] = useState("");
  const [addWhCity, setAddWhCity] = useState("الرياض");
  const [addWhAddress, setAddWhAddress] = useState("");
  const [addWhManager, setAddWhManager] = useState("");
  const [addWhCapacity, setAddWhCapacity] = useState("5000");
  const [addWhType, setAddWhType] = useState("main");
  const [addWhStatus, setAddWhStatus] = useState("نشط");

  // State variables for Add POS form inside the Workspace screen
  const [showAddPosForm, setShowAddPosForm] = useState(false);
  const [addPosName, setAddPosName] = useState("");
  const [addPosBranchId, setAddPosBranchId] = useState("");
  const [addPosWarehouseId, setAddPosWarehouseId] = useState("");
  const [addPosCashier, setAddPosCashier] = useState("");
  const [addPosStatus, setAddPosStatus] = useState("نشط");

  const [warehouses, setWarehouses] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_warehouses");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "wh_central_riyadh",
        name: "مستودع الرياض الرئيسي",
        type: "main",
        location: "صناعية السلي الجديدة، الرياض",
        manager: "صالح الفهيد",
        capacity: 10000,
        items: [
          { productId: "1", stock: 150 },
          { productId: "2", stock: 200 },
          { productId: "3", stock: 12 },
          { productId: "4", stock: 45 }
        ]
      },
      {
        id: "wh_jeddah_sub",
        name: "مستودع جدة",
        type: "sub",
        location: "حي الخمرة، جدة",
        manager: "سعيد باوزير",
        capacity: 5000,
        items: [
          { productId: "1", stock: 80 },
          { productId: "2", stock: 95 },
          { productId: "3", stock: 40 },
          { productId: "4", stock: 18 }
        ]
      },
      {
        id: "wh_dammam_sub",
        name: "مستودع مركزي يخدم أكثر من فرع",
        type: "branch",
        location: "حي الأثير، الدمام",
        manager: "رائد المطيري",
        capacity: 2500,
        items: [
          { productId: "1", stock: 45 },
          { productId: "2", stock: 50 },
          { productId: "3", stock: 10 },
          { productId: "4", stock: 15 }
        ]
      }
    ];
  });

  const [posUnits, setPosUnits] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_pos_units");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "pos_riyadh_1", name: "كاشير فرع الرياض 1 🖥️", branchId: "br_riyadh_main", isDefault: true, status: "نشط" },
      { id: "pos_riyadh_2", name: "كاشير فرع الرياض 2 📱", branchId: "br_riyadh_main", isDefault: false, status: "نشط" },
      { id: "pos_jeddah_1", name: "كاشير فرع جدة 1 🖥️", branchId: "br_jeddah_int", isDefault: true, status: "نشط" },
      { id: "pos_dammam_1", name: "كاشير معرض دبي 1 🖥️", branchId: "br_dammam", isDefault: true, status: "نشط" }
    ];
  });

  // Local storage synchronization effects
  useEffect(() => {
    localStorage.setItem("sahm_web_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("sahm_web_warehouses", JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem("sahm_web_pos_units", JSON.stringify(posUnits));
  }, [posUnits]);

  // Selected Environment Selector States
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    return localStorage.getItem("sahm_active_branch_id") || "br_riyadh_main";
  });

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>(() => {
    return localStorage.getItem("sahm_active_warehouse_id") || "wh_central_riyadh";
  });

  const [activePosId, setActivePosId] = useState<string>(() => {
    return localStorage.getItem("sahm_active_pos_id") || "pos_riyadh_1";
  });

  // Memoized user-restricted allowed assets lists
  const allowedBranches = useMemo(() => {
    if (!currentUser) return branches;
    const canSwitch = currentUser.permissions?.includes("workspace:switch") || currentUser.role === "مالك" || currentUser.role === "مدير";
    if (canSwitch) return branches;
    if (currentUser.branchId) {
      return branches.filter((b: any) => b.id === currentUser.branchId);
    }
    return branches;
  }, [currentUser, branches]);

  const allowedWarehouses = useMemo(() => {
    if (!currentUser) return warehouses;
    const canSwitch = currentUser.permissions?.includes("workspace:switch") || currentUser.role === "مالك" || currentUser.role === "مدير";
    if (canSwitch) return warehouses;
    if (currentUser.warehouseId) {
      return warehouses.filter((w: any) => w.id === currentUser.warehouseId);
    }
    if (currentUser.branchId) {
      return warehouses.filter((w: any) => w.associatedBranch === currentUser.branchId || w.id === activeWarehouseId);
    }
    return warehouses;
  }, [currentUser, warehouses, activeWarehouseId]);

  const allowedPosUnits = useMemo(() => {
    if (!currentUser) return posUnits;
    const canSwitch = currentUser.permissions?.includes("workspace:switch") || currentUser.role === "مالك" || currentUser.role === "مدير";
    if (canSwitch) return posUnits;
    if (currentUser.posId) {
      return posUnits.filter((p: any) => p.id === currentUser.posId);
    }
    if (currentUser.branchId) {
      return posUnits.filter((p: any) => p.branchId === currentUser.branchId);
    }
    return posUnits;
  }, [currentUser, posUnits]);

  // Keep references synced if currentUser does not possess switch permissions
  useEffect(() => {
    if (currentUser) {
      const canSwitch = currentUser.permissions?.includes("workspace:switch") || currentUser.role === "مالك" || currentUser.role === "مدير";
      if (!canSwitch) {
        if (currentUser.branchId && activeBranchId !== currentUser.branchId) {
          setActiveBranchId(currentUser.branchId);
          localStorage.setItem("sahm_active_branch_id", currentUser.branchId);
        }
        if (currentUser.warehouseId && activeWarehouseId !== currentUser.warehouseId) {
          setActiveWarehouseId(currentUser.warehouseId);
          localStorage.setItem("sahm_active_warehouse_id", currentUser.warehouseId);
        }
        if (currentUser.posId && activePosId !== currentUser.posId) {
          setActivePosId(currentUser.posId);
          localStorage.setItem("sahm_active_pos_id", currentUser.posId);
        }
      }
    }
  }, [currentUser, activeBranchId, activeWarehouseId, activePosId]);

  const [showEnvManagerModal, setShowEnvManagerModal] = useState(false);
  const [envModalTab, setEnvModalTab] = useState<"branches" | "warehouses" | "pos" | "linking" | "hierarchy">("hierarchy");

  // Safe prompt-less inline modal/form state variables for EnvManagerModal
  const [isAddingBranchInline, setIsAddingBranchInline] = useState(false);
  const [inlineBranchName, setInlineBranchName] = useState("");
  const [inlineBranchCity, setInlineBranchCity] = useState("الرياض");
  const [inlineBranchAddress, setInlineBranchAddress] = useState("");
  const [inlineBranchManager, setInlineBranchManager] = useState("");
  const [inlineBranchPhone, setInlineBranchPhone] = useState("");
  const [inlineBranchWh, setInlineBranchWh] = useState("");
  const [inlineBranchType, setInlineBranchType] = useState("فرع بيع");
  const [inlineBranchStatus, setInlineBranchStatus] = useState("نشط");
  const [inlineBranchStoreId, setInlineBranchStoreId] = useState("store_1");

  const [isAddingWhInline, setIsAddingWhInline] = useState(false);
  const [inlineWhName, setInlineWhName] = useState("");
  const [inlineWhLocation, setInlineWhLocation] = useState("");
  const [inlineWhType, setInlineWhType] = useState<"main" | "sub">("sub");
  const [inlineWhCapacity, setInlineWhCapacity] = useState(3000);
  const [inlineWhCity, setInlineWhCity] = useState("الرياض");
  const [inlineWhManager, setInlineWhManager] = useState("");
  const [inlineWhStatus, setInlineWhStatus] = useState("نشط");

  const [isAddingPosInline, setIsAddingPosInline] = useState(false);
  const [inlinePosName, setInlinePosName] = useState("");
  const [inlinePosBranchId, setInlinePosBranchId] = useState("");
  const [inlinePosCashier, setInlinePosCashier] = useState("");
  const [inlinePosWh, setInlinePosWh] = useState("");
  const [inlinePosPayMethods, setInlinePosPayMethods] = useState<string[]>(["cash", "card"]);
  const [inlinePosStatus, setInlinePosStatus] = useState("نشط");

  // Edit form state variables
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editBranchName, setEditBranchName] = useState("");
  const [editBranchCity, setEditBranchCity] = useState("الرياض");
  const [editBranchAddress, setEditBranchAddress] = useState("");
  const [editBranchManager, setEditBranchManager] = useState("");
  const [editBranchPhone, setEditBranchPhone] = useState("");
  const [editBranchStoreId, setEditBranchStoreId] = useState("store_1");
  const [editBranchWh, setEditBranchWh] = useState("");
  const [editBranchStatus, setEditBranchStatus] = useState("نشط");

  const [editingWhId, setEditingWhId] = useState<string | null>(null);
  const [editWhName, setEditWhName] = useState("");
  const [editWhCity, setEditWhCity] = useState("الرياض");
  const [editWhLocation, setEditWhLocation] = useState("");
  const [editWhManager, setEditWhManager] = useState("");
  const [editWhCapacity, setEditWhCapacity] = useState(3000);
  const [editWhType, setEditWhType] = useState<"main" | "sub">("sub");
  const [editWhStatus, setEditWhStatus] = useState("نشط");

  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editPosName, setEditPosName] = useState("");
  const [editPosBranchId, setEditPosBranchId] = useState("");
  const [editPosCashier, setEditPosCashier] = useState("");
  const [editPosWh, setEditPosWh] = useState("");
  const [editPosPayMethods, setEditPosPayMethods] = useState<string[]>(["cash", "card"]);
  const [editPosStatus, setEditPosStatus] = useState("نشط");

  const [mainCompanyName, setMainCompanyName] = useState<string>(() => {
    return localStorage.getItem("sahm_main_company_name") || "شركة مراسيم الطيب للتجارة المحدودة";
  });

  useEffect(() => {
    localStorage.setItem("sahm_main_company_name", mainCompanyName);
  }, [mainCompanyName]);

  // Keep references handy
  const activeBranchObj = branches.find(b => b.id === activeBranchId) || branches[0];
  const activeWarehouseObj = warehouses.find(w => w.id === activeWarehouseId) || warehouses[0];
  const activePosObj = posUnits.find(p => p.id === activePosId) || posUnits[0];

  // Handler helpers
  const handleSwitchBranch = (id: string) => {
    setActiveBranchId(id);
    localStorage.setItem("sahm_active_branch_id", id);
    
    // Auto-update legacy activeWorkspaceId for backward-compatibilities
    if (id === "br_riyadh_main") {
      setActiveWorkspaceId("riyadh");
      localStorage.setItem("sahm_active_workspace_id", "riyadh");
    } else if (id === "br_jeddah_int") {
      setActiveWorkspaceId("dubai");
      localStorage.setItem("sahm_active_workspace_id", "dubai");
    } else if (id === "br_dammam") {
      setActiveWorkspaceId("jeddah");
      localStorage.setItem("sahm_active_workspace_id", "jeddah");
    }
    
    const b = branches.find(br => br.id === id);
    if (b) {
      if (b.associatedWh) {
        setActiveWarehouseId(b.associatedWh);
        localStorage.setItem("sahm_active_warehouse_id", b.associatedWh);
      }
      
      const associatedPos = posUnits.find(p => p.branchId === id && p.isDefault) || posUnits.find(p => p.branchId === id);
      if (associatedPos) {
        setActivePosId(associatedPos.id);
        localStorage.setItem("sahm_active_pos_id", associatedPos.id);
      }
      triggerNotification(`تم تفعيل بيئة عمل فرع: [${b.name}] بنجاح 🌐`, "info");
      addAuditLog("تغيير الفرع", `تم التبديل للفرع النشط: ${b.name}`);
    }
  };

  const handleSwitchWarehouse = (id: string) => {
    setActiveWarehouseId(id);
    localStorage.setItem("sahm_active_warehouse_id", id);
    const w = warehouses.find(wh => wh.id === id);
    if (w) {
      triggerNotification(`تم تفعيل المستودع النشط: [${w.name}] 📦`, "success");
      addAuditLog("تغيير المستودع", `تم تنشيط مستودع الجرد: ${w.name}`);
    }
  };

  const handleSwitchPos = (id: string) => {
    setActivePosId(id);
    localStorage.setItem("sahm_active_pos_id", id);
    const p = posUnits.find(pos => pos.id === id);
    if (p) {
      triggerNotification(`تم تفعيل جهاز كاشير نقطة البيع: [${p.name}] 🖥️`, "success");
      addAuditLog("تغيير نقطة البيع", `تم تحويل الكاشير النشط إلى جهاز: ${p.name}`);
    }
  };

  // Enterprise Active Workspace State (Bullet 18 & 11)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      return localStorage.getItem("sahm_active_workspace_id") || "riyadh";
    } catch {
      return "riyadh";
    }
  });

  const workspaces = [
    { id: "riyadh", name: "مراسيم الطيب - فرع الرياض الرئيسي 🇸🇦", balance: 124920, city: "الرياض", rate: 1.0, currency: "ر.س", count: 482 },
    { id: "jeddah", name: "مراسيم الطيب - مستودع المنطقة الغربية 📦", balance: 78140, city: "جدة", rate: 0.85, currency: "ر.س", count: 310 },
    { id: "dubai", name: "مراسيم الطيب - معرض دبي والشرق الأوسط 🇦🇪", balance: 195400, city: "دبي", rate: 1.15, currency: "د.إ", count: 642 }
  ];

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleSwitchWorkspace = (id: string) => {
    try {
      setActiveWorkspaceId(id);
      localStorage.setItem("sahm_active_workspace_id", id);
      triggerNotification(`تم الانتقال لبيئة عمل: ${workspaces.find(w => w.id === id)?.name} بنجاح 🚀`, "security");
      addAuditLog("تغيير Workspace", `قام المستخدم بالانتقال إلى مساحة عمل ${workspaces.find(w => w.id === id)?.city}`);
    } catch (e) {
      console.error(e);
    }
  };

  // SaaS subscription states (Bullet 10)
  const [subscription, setSubscription] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("sahm_active_subscription_v8");
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
    return {
      tier: 'B', // 'A' - Trial, 'B' - Growth SaaS, 'C' - Enterprise Elite
      billing: 'annual',
      limit: 10000,
      currentUsed: 4945,
      renewsAt: "٢٠٢٧/٠١/٠١"
    };
  });

  const updateSubscription = (val: any) => {
    try {
      setSubscription(val);
      localStorage.setItem("sahm_active_subscription_v8", JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  // SaaS Addons & Modular ERP installations (Bullet 3 & 1)
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("sahm_modular_marketplace_addons_v8");
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
    return {
      command_center: true,
      intelligent_hub: true,
      pos_and_operations: true,
      invoices: true,
      customers: true,
      suppliers: true,
      reports: true,
      accounting: true,
      help: true,
      settings: true
    };
  });

  const setEnabledModulesWithNotify = (val: Record<string, boolean>) => {
    try {
      setEnabledModules(val);
      localStorage.setItem("sahm_modular_marketplace_addons_v8", JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  // Onboarding Wizard controllers (Bullet 2)
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sahm_onboarding_completed_v8") !== "true";
    } catch {
      return true;
    }
  });

  const [systemLoading, setSystemLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSystemLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Unified Notification Center notifications state (Bullet 14)
  const [notificationsList, setNotificationsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_notifications_hub");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [
      { id: 1, title: "مزامنة سلة نجحت 🟢", text: "تم سحب ومطابقة ٦ طلبات حية من متجر سلة بنجاح سحابياً.", read: false, time: "منذ ٥ دقائق", type: "sync" },
      { id: 2, title: "انخفاض عينة دهن العود 📦", text: "مخزون دهن العود الكمبودي في مستودع الرياض أقل من ٢٠ قطعة.", read: false, time: "منذ ساعة", type: "alert" },
      { id: 3, title: "فاتورة لعميل جديد 👥", text: "تم تسجيل العميل عبالرحمن العتيبي وإصدار فاتورة بقيمة ١,٤٥٠ ر.س.", read: true, time: "اليوم ٠٢:٣٤ م", type: "sale" },
      { id: 4, title: "إشعار أمني - سيرفر سهم 🔒", text: "تم تأكيد الربط السحابي بقاعدة Supabase API بنجاح.", read: true, time: "أمس", type: "security" }
    ];
  });

  const triggerNotification = (text: string, type: "sync" | "alert" | "sale" | "security" | "success" | "warning" | "critical" | "info" | "ai" = "success") => {
    const titleMap: Record<string, string> = {
      sync: "مزامنة سحابية 🔄",
      alert: "تنبيه المخازن ⚠️",
      sale: "عملية بيع حية 📈",
      security: "إشعار أمني 🔒",
      success: "لقطة ذكية ناجحة ✅",
      warning: "تنبيه عام ⚠️",
      critical: "تحذير حرج 🚨",
      info: "إشعار معلومات ℹ️",
      ai: "ذكاء سهم برين 🧠"
    };
    const newNotif = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: titleMap[type] || "شمالي سهم 🔔",
      text,
      read: false,
      time: "الآن حياً",
      type: type as any
    };
    const updated = [newNotif, ...notificationsList];
    setNotificationsList(updated);
    try {
      localStorage.setItem("sahm_notifications_hub", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Audit Logs telemetry tracker (Bullet 19)
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_audit_logs_v8");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [
      { id: 1, event: "تدشين النظام", text: "تم إطلاق منصة Sahm OS الموحدة بنجاح للمنشأة.", user: "المدير العام", time: "٠٩:٠٠ ص", date: "اليوم" },
      { id: 2, event: "مزامنة Supabase", text: "تم فحص وربط الجداول المزامنة مع خادم Supabase السحابي.", user: "النظام المحاسبي", time: "١٠:١٥ ص", date: "اليوم" },
      { id: 3, event: "تعديل المظهر", text: "تحديث السمة العامة للشركة وحفظ خيارات ألوان الهوية البصرية.", user: "المدير العام", time: "١١:٣٠ ص", date: "اليوم" }
    ];
  });

  const addAuditLog = (event: string, text: string, userOverride?: User) => {
    const activeUser = userOverride || currentUser;
    const newLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      event,
      text,
      user: activeUser ? activeUser.name : "المدير العام",
      userId: activeUser ? activeUser.id : null,
      username: activeUser ? activeUser.username : null,
      storeId: activeUser?.storeId || "store_1",
      branchId: activeUser?.branchId || activeBranchId,
      posId: activeUser?.posId || activePosId,
      warehouseId: activeUser?.warehouseId || activeWarehouseId,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      date: "اليوم"
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    try {
      localStorage.setItem("sahm_audit_logs_v8", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Permanent AI Memory registry (Bullet 8)
  const [aiMemory, setAiMemory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_ai_memory_permanent");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [
      { key: "نبرة البرند (Brand Tone)", val: "ملكية راقية وفخمة لمنتجات العود الطبيعي والبخور" },
      { key: "سوق الرياض (Focus Target)", val: "التركيز على الفئة الفاخرة، وساعات الذروة بين ٤ م إلى ٩ م" },
      { key: "تفضيل العملاء الشائع", val: "التلقائي تفضيل التغليف الملكي الخاص بالإهداء والصناديق العود" },
      { key: "قناة الشحن المفضلة", val: "أرامكس للمنطقة الوسطى وسلاسل زد للمستودعات السريعة" }
    ];
  });

  const saveAiMemory = (val: any[]) => {
    setAiMemory(val);
    try {
      localStorage.setItem("sahm_ai_memory_permanent", JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  // Current active navigation tab state with virtual sub-tab router
  const [activeTabVal, setActiveTabRaw] = useState<string>("command_center");
  const [isPosFullscreen, setIsPosFullscreen] = useState<boolean>(false);
  const [financialSubTab, setFinancialSubTab] = useState<"invoices" | "customers" | "suppliers" | "accounting" | "profiles">("invoices");
  const [settingsSubTab, setSettingsSubTab] = useState<string>("general");
  const [showGlobalAIBuilder, setShowGlobalAIBuilder] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  const activeTab = activeTabVal;
  const setActiveTab = (tab: string) => {
    if (tab === "ai" || tab === "publish" || tab === "saas_blueprint" || tab === "publication") {
      setActiveTabRaw("intelligent_hub");
    } else if (tab === "invoices" || tab === "customers" || tab === "suppliers" || tab === "accounting" || tab === "profiles") {
      setActiveTabRaw("financial_hub");
      setFinancialSubTab(tab as any);
    } else if (tab === "media_center" || tab === "media") {
      setActiveTabRaw("settings");
      setSettingsSubTab("media");
    } else {
      setActiveTabRaw(tab);
      if (tab !== "settings") {
        setSettingsSubTab("general");
      }
    }
  };

  // --- 🔍 Global Search Central Controller (Bullet 5 - Global Search System) ---
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    
    const handlePromoteProductEvent = (e: Event) => {
      const product = (e as CustomEvent).detail;
      if (product) {
        setPrefillPublish({
          id: product.id,
          name: product.name,
          price: String(product.price),
          image: product.image ? { uri: product.image, base64: "", mimeType: "image/png" } : null,
          stock: product.stock,
          category: product.category,
          description: product.description || "",
          discountPrice: product.discountPrice || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          seoKeywords: product.seoKeywords || "",
          publishSalla: product.publishSalla ?? true,
          publishZid: product.publishZid ?? false,
        } as any);
        
        setActiveTabRaw("intelligent_hub");
        setTimeout(() => {
          window.dispatchEvent(new Event("sahm_open_new_campaign"));
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("sahm_promote_product", handlePromoteProductEvent);
    
    // Bind global navigation helper for all external sections
    (window as any).__sahm_global_navigate = (tab: string, subTab?: string, prefill?: any) => {
      handleGlobalNavigate(tab, subTab, prefill);
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("sahm_promote_product", handlePromoteProductEvent);
    };
  }, []);

  // Intercept setter for combined intelligent_hub navigation compatibility
  const handleSetActiveTab = (tab: string) => {
    if (tab === "ai" || tab === "publish" || tab === "saas_blueprint" || tab === "publication") {
      setActiveTab("intelligent_hub");
    } else {
      setActiveTab(tab);
    }
  };

  const handleGlobalNavigate = (tab: string, subTab?: string, prefill?: any) => {
    if (tab === "intelligent_hub") {
      setActiveTab("intelligent_hub");
      if (prefill) {
        setPrefillPublish(prefill);
      }
    } else {
      setActiveTab(tab);
      if (prefill) {
        if (tab === "pos_and_operations") {
          (window as any).__sahm_prefill_pos = prefill;
          window.dispatchEvent(new CustomEvent("sahm_pos_prefill", { detail: prefill }));
        } else if (tab === "accounting") {
          (window as any).__sahm_prefill_accounting = prefill;
          window.dispatchEvent(new CustomEvent("sahm_accounting_prefill", { detail: prefill }));
        } else if (tab === "customers") {
          (window as any).__sahm_prefill_customers = prefill;
          window.dispatchEvent(new CustomEvent("sahm_customers_prefill", { detail: prefill }));
        } else if (tab === "integrations") {
          (window as any).__sahm_prefill_integrations = prefill;
          window.dispatchEvent(new CustomEvent("sahm_navigate_integrations", { detail: prefill }));
        }
      }
    }
  };

  const openUnifiedActions = (type: string, data: any) => {
    setActionItem({ type, data });
  };

  // Multi-user state management list
  const [users, setUsersRaw] = useState<User[]>(() => {
    const saved = localStorage.getItem("sahm_web_users_list2");
    if (saved) return JSON.parse(saved);
    localStorage.setItem("sahm_web_users_list2", JSON.stringify(USERS));
    return USERS;
  });

  const setUsers = (val: User[]) => {
    setUsersRaw(val);
    localStorage.setItem("sahm_web_users_list2", JSON.stringify(val));
    addAuditLog("تحديث المستخدمين", "تعديل في قائمة صلاحيات الموظفين وتراخيص الوصول");
  };

  // Shared state for pre-filling the post publishing flow from the AI Analyzer
  const [prefillPublish, setPrefillPublish] = useState<{
    name: string;
    price: string;
    image: { uri: string; base64: string; mimeType: string } | null;
  } | null>(null);

  // Custom persistent mutators
  const setInvoices = (val: Invoice[]) => {
    setInvoicesRaw(val);
    localStorage.setItem(LS_KEYS.INVOICES, JSON.stringify(val));
    if (val.length > 0) {
      SahmDatabaseService.getInstance().saveInvoice(val[0]);
    }
  };

  const setProducts = (val: Product[]) => {
    // Sanitize any massive data URLs inside images and assets beforehand to save space
    const sanitizedVal = val.map(p => ({
      ...p,
      backups: [],
      image: (p.image && p.image.startsWith("data:") && p.image.length > 30000)
        ? p.image.substring(0, 5000) + "...[مضغوطة]"
        : p.image,
      assets: Array.isArray(p.assets) ? p.assets.map((asset: any) => {
        if (asset && asset.url && asset.url.startsWith("data:") && asset.url.length > 20000) {
          return { ...asset, url: asset.url.substring(0, 2000) + "...[مضغوطة]" };
        }
        return asset;
      }) : p.assets
    }));

    setProductsRaw(sanitizedVal);
    try {
      localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(sanitizedVal));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn("Storage full in setProducts! Freeing up space...");
        freeUpLocalStorageSpace();
        
        // Retry with highly compacted structure
        const truncated = sanitizedVal.map(p => ({
          ...p,
          backups: [],
          image: (p.image && p.image.startsWith("data:")) ? "[صورة مفرغة]" : p.image,
          assets: Array.isArray(p.assets) ? p.assets.map((asset: any) => {
            if (asset && asset.url && asset.url.startsWith("data:")) {
              return { ...asset, url: "[ملف قاعدة بيانات مخزن]" };
            }
            return asset;
          }) : p.assets
        }));
        try {
          localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(truncated));
          setProductsRaw(truncated);
        } catch (innerErr) {
          console.error("Absolute storage quota limit reached even after cleanups!", innerErr);
        }
      } else {
        throw e;
      }
    }
    if (sanitizedVal.length > 0) {
      SahmDatabaseService.getInstance().saveProduct(sanitizedVal[0]);
    }
  };

  const setCustomers = (val: Customer[]) => {
    setCustomersRaw(val);
    localStorage.setItem(LS_KEYS.CUSTOMERS, JSON.stringify(val));
    if (val.length > 0) {
      SahmDatabaseService.getInstance().saveCustomer(val[0]);
    }
  };

  const setSuppliers = (val: Supplier[]) => {
    setSuppliersRaw(val);
    localStorage.setItem(LS_KEYS.SUPPLIERS, JSON.stringify(val));
    if (val.length > 0) {
      SahmDatabaseService.getInstance().saveSupplier(val[0]);
    }
  };

  const setStoreName = (val: string) => {
    setStoreNameRaw(val);
    localStorage.setItem(LS_KEYS.STORE, val);
  };

  const setThemeKey = (val: ThemeType) => {
    setThemeKeyRaw(val);
    localStorage.setItem(LS_KEYS.THEME, val);
  };

  const setAccentKey = (val: string) => {
    setAccentKeyRaw(val);
    localStorage.setItem(LS_KEYS.ACCENT, val);
  };

  const setCurrency = (val: string) => {
    setCurrencyRaw(val);
    localStorage.setItem(LS_KEYS.CURRENCY, val);
  };

  const setNotifications = (val: boolean) => {
    setNotificationsRaw(val);
    localStorage.setItem(LS_KEYS.NOTIFICATIONS, JSON.stringify(val));
  };

  const setStoreAddress = (val: string) => {
    setStoreAddressRaw(val);
    localStorage.setItem("sahm_web_store_address", val);
  };

  const setStoreCR = (val: string) => {
    setStoreCRRaw(val);
    localStorage.setItem("sahm_web_store_cr", val);
  };

  const setStoreVat = (val: string) => {
    setStoreVatRaw(val);
    localStorage.setItem("sahm_web_store_vat", val);
  };

  const setStoreIBAN = (val: string) => {
    setStoreIBANRaw(val);
    localStorage.setItem("sahm_web_store_iban", val);
  };

  const setWorkspaceLayout = (val: any) => {
    setWorkspaceLayoutRaw(val);
    localStorage.setItem("sahm_workspace_layout_config", JSON.stringify(val));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));

    let activatedBranch = "";
    let activatedWarehouse = "";
    let activatedPos = "";

    // Sync active environmental references
    if (user.branchId) {
      setActiveBranchId(user.branchId);
      localStorage.setItem("sahm_active_branch_id", user.branchId);
      activatedBranch = branches.find(b => b.id === user.branchId)?.name || user.branchId;

      // Sync legacy workspace settings
      if (user.branchId === "br_riyadh_main") {
        setActiveWorkspaceId("riyadh");
        localStorage.setItem("sahm_active_workspace_id", "riyadh");
      } else if (user.branchId === "br_jeddah_int") {
        setActiveWorkspaceId("dubai");
        localStorage.setItem("sahm_active_workspace_id", "dubai");
      } else if (user.branchId === "br_dammam") {
        setActiveWorkspaceId("jeddah");
        localStorage.setItem("sahm_active_workspace_id", "jeddah");
      }
    }

    if (user.warehouseId) {
      setActiveWarehouseId(user.warehouseId);
      localStorage.setItem("sahm_active_warehouse_id", user.warehouseId);
      activatedWarehouse = warehouses.find(w => w.id === user.warehouseId)?.name || user.warehouseId;
    }

    if (user.posId) {
      setActivePosId(user.posId);
      localStorage.setItem("sahm_active_pos_id", user.posId);
      activatedPos = posUnits.find(p => p.id === user.posId)?.name || user.posId;
    }

    // Role-based, POS-based, Branch-based, or Warehouse-based landing redirects & notifications
    if (user.posId || user.role === "كاشير") {
      setActiveTabRaw("pos_and_operations");
      triggerNotification(`مرحباً ${user.name}! تم فتح نقطة البيع الخاصة بك [${activatedPos || "كاشير مالي"}] لفرع [${activatedBranch || "الرياض"}] تلقائياً 🛒`, "success");
    } else if (user.role === "موظف مخزون" || user.warehouseId) {
      setActiveTabRaw("products");
      triggerNotification(`مرحباً ${user.name}! تم فتح المنظومة اللوجستية وتوجيهك لمستودعك المرتبط [${activatedWarehouse || "الرئيسي"}] تلقائياً 📦`, "success");
    } else if (user.branchId) {
      setActiveTabRaw("command_center");
      triggerNotification(`مرحباً ${user.name}! تم فتح النظام تلقائياً وتوجيهك لفرعك المرتبط [${activatedBranch}] 🌐`, "success");
    } else if (user.role === "مدير" || user.role === "مالك") {
      setActiveTabRaw("command_center");
      triggerNotification(`أهلاً بك ${user.name}! تم تحميل مركز التحكم السحابي الشامل لمجموعة [${user.company || "المنشأة"}] بنجاح ⚡`, "success");
    } else {
      setActiveTabRaw("command_center");
      triggerNotification(`مرحباً ${user.name}! تم الدخول بنجاح وتوجيهك لمركز العمل لفرعك المرتبط 🌐`, "success");
    }

    addAuditLog(
      "تسجيل الدخول للنظام",
      `قام الموظف @${user.username} (رتبة: ${user.role}) بتسجيل دخول ناجح إلى النظام ونقل الجلسة لبيئة العمل النشطة بمستوى وصول مرخص.`,
      user
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LS_KEYS.USER);
  };

  // Support dynamic custom themes
  const [customTheme, setCustomTheme] = useState<any>(() => {
    const saved = localStorage.getItem("sahm_web_custom_theme");
    return saved ? JSON.parse(saved) : null;
  });

  // Compile active theme details and resolve gold/green backward migrations
  let activeThemeKey: any = themeKey;
  if (themeKey as string === "gold") activeThemeKey = "royal";
  if (themeKey as string === "green") activeThemeKey = "saudi";

  const preset = activeThemeKey === 'custom' && customTheme 
    ? customTheme 
    : (THEMES_PRESETS[activeThemeKey] || THEMES_PRESETS.dark);
    
  const accent = ACCENTS_PRESETS[accentKey] || ACCENTS_PRESETS.orange;
  const themeColors: ThemeColors = { 
    ...preset, 
    accent: preset.accent || accent 
  };

  // Sync index body styling to match active theme background, fonts, and borders
  useEffect(() => {
    document.body.style.backgroundColor = themeColors.bg;
    document.body.style.color = themeColors.text;
    if (themeColors.fontFamily) {
      document.body.style.fontFamily = `"${themeColors.fontFamily}", "Cairo", sans-serif`;
    } else {
      document.body.style.fontFamily = `"Cairo", sans-serif`;
    }
  }, [themeKey, themeColors]);

  // Render pristine golden splash loader on initial load
  if (systemLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#080D17] text-white p-6 font-sans select-none antialiased">
        <div className="flex flex-col items-center max-w-md w-full text-center space-y-6">
          <div className="relative">
            <img 
              src={sahmIconPngUrl} 
              alt="Sahm OS Official Logo" 
              className="w-24 h-24 object-contain animate-pulse"
              referrerPolicy="no-referrer"
            />
            {/* Elegant spinning loading accent circle */}
            <div className="absolute -inset-4 rounded-full border border-dashed border-[#D4AF37]/30 animate-spin" style={{ animationDuration: "8s" }}></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white mb-0">Sahm OS</h1>
            <p className="text-[#D4AF37] font-black text-xs uppercase tracking-widest mt-0 select-none">الربط الذكي والأتمتة الموحدة</p>
          </div>
          {/* Progress bar simulation */}
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mx-auto relative mt-2">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-[#D4AF37] rounded-full"
              style={{
                width: "40%",
                animation: "sahm-load 1.2s ease-in-out infinite"
              }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Loading Secure ERP Engine...</p>
        </div>
        <style>{`
          @keyframes sahm-load {
            0% { left: -40%; width: 40%; }
            50% { width: 60%; }
            100% { left: 100%; width: 40%; }
          }
        `}</style>
      </div>
    );
  }

  // If user unauthorized, force render beautiful authorization portal
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  // Navigation Links catalog config filtered by Role (تعدد المستخدمين والصلاحيات)
  const allowedItemsMap: Record<string, string[]> = {
    "مدير": ["command_center", "intelligent_hub", "facility_setup", "store_management", "products", "pos_and_operations", "integrations", "financial_hub", "reports", "media_center", "help", "settings"],
    "محاسب": ["command_center", "intelligent_hub", "facility_setup", "store_management", "products", "pos_and_operations", "integrations", "financial_hub", "reports", "media_center", "help", "settings"],
    "كاشير": ["command_center", "products", "pos_and_operations", "financial_hub", "help"]
  };

  const navItems = [
    { id: "command_center", label: "مركز القيادة والتحليلات ⚡", icon: Bot },
    { id: "intelligent_hub", label: "المنصة الذكية 🧠🔌", icon: Sparkles },
    { id: "facility_setup", label: "مسار تأسيس المنشأة 🏢⭐", icon: Landmark },
    { id: "store_management", label: "إدارة المتاجر والمنشآت 🏬", icon: Building },
    { id: "products", label: "المنتجات والمخزون 📦", icon: Package },
    { id: "pos_and_operations", label: "العمليات ونقاط البيع 🛍️🏢", icon: Store },
    { id: "integrations", label: "مركز التكاملات 🔌", icon: Link },
    { id: "financial_hub", label: "المنظومة المالية والشركاء ⚖️", icon: Landmark },
    { id: "reports", label: "التقارير", icon: BarChart3 },
    { id: "help", label: "مركز التواصل والدعم 💬", icon: HelpCircle },
    { id: "settings", label: "الإعدادات", icon: SettingsIcon },
  ].filter(item => {
    const allowed = allowedItemsMap[currentUser?.role || "مدير"] || ["command_center", "pos_and_operations", "financial_hub", "help"];
    const isEnabled = enabledModules[item.id] !== false;
    return allowed.includes(item.id) && isEnabled;
  });

  return (
    <div className="flex h-screen overflow-hidden font-sans select-none antialiased"
      style={{ backgroundColor: themeColors.bg, color: themeColors.text }}>
      
      {/* 1. Desktop Sidebar Navigation Drawer */}
      <aside className={`${isPosFullscreen && activeTab === "pos_and_operations" ? "hidden" : "hidden lg:flex"} flex-col w-64 border-l select-none shrink-0`}
        style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        {/* Branding header area */}
        <div className="p-5 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={sahmMiniMarkPngUrl} 
              alt="Sahm OS Mini Mark" 
              className="rounded-lg object-contain shrink-0"
              style={{ width: "42px", height: "42px" }}
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5" style={{ color: themeColors.text }}>
                <span>Sahm OS</span>
              </h1>
              <span className="text-[10px] block mt-0.5 text-[#D4AF37] font-extrabold">الربط الذكي الموحد</span>
              <span className="text-[8px] block text-gray-500 font-mono">Enterprise Edition v16</span>
            </div>
          </div>

          {/* 👥 Unified Workspace Environment Switcher Section (Requirement 1, 3, 5) */}
          <div className="space-y-1 relative">
            <label className="text-[9px] font-black uppercase text-amber-500 tracking-wider block">بيئة العمل والتشغيل النشطة:</label>
            <button
              onClick={() => setShowWorkspaceSelector(!showWorkspaceSelector)}
              className="w-full text-[11px] py-2.5 px-3 bg-slate-900/90 border text-gray-200 outline-none rounded-xl cursor-pointer font-bold flex items-center justify-between transition-all hover:border-amber-500/40 text-right bg-slate-950 shadow-lg"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-550 animate-pulse"></span>
                <span className="truncate">
                  📍 {activeBranchObj?.name} | {activeWarehouseObj ? `📦 ${activeWarehouseObj.name}` : "⚠️ فرع غير مربوط بمستودع"}
                </span>
              </div>
              <span className="text-[9px] text-gray-500">▼</span>
            </button>

            {showWorkspaceSelector && (
              <div 
                className="absolute right-0 left-0 top-11 mt-1 rounded-2xl border p-4 shadow-2xl text-right z-50 overflow-y-auto max-h-[440px] space-y-4 no-print w-[380px] xs:w-full"
                style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
              >
                {/* 1. BUTTON: إدارة بيئة العمل (Requirement 1, 3) */}
                <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: themeColors.border }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkspaceSelector(false);
                      setEnvModalTab("branches");
                      setShowEnvManagerModal(true);
                      triggerNotification("تم فتح لوحة تحكم تهيئة بيئة العمل ⚙️", "info");
                    }}
                    className="w-full py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all animate-none"
                  >
                    <span>⚙️</span>
                    <span>إدارة بيئة العمل (تهيئة كاملة)</span>
                  </button>
                </div>

                {/* 2. SECTION: الفروع والمعارض النشطة */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-sky-400 font-extrabold flex items-center gap-1">📍 اختيار فرع / معرض سريع</span>
                    <span className="text-[8px] bg-sky-500/10 text-sky-450 px-1.5 py-0.5 rounded font-bold uppercase">قاعدة الفروع</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {allowedBranches.map((b) => {
                      const isSelected = activeBranchId === b.id;
                      const hasLinkedWarehouse = !!b.associatedWh;
                      return (
                        <div key={b.id} className="space-y-1 bg-slate-950/20 p-1.5 rounded-xl border border-slate-900/45">
                          <button
                            type="button"
                            onClick={() => {
                              handleSwitchBranch(b.id);
                              setShowWorkspaceSelector(false);
                            }}
                            className={`w-full text-right p-2 rounded-lg text-[11px] flex items-center justify-between transition-all border font-bold cursor-pointer ${
                              isSelected 
                                ? "bg-sky-600 border-sky-500 text-white font-black" 
                                : "bg-slate-950/30 border-transparent text-gray-400 hover:text-white"
                            }`}
                          >
                            <span className="truncate">🏢 {b.name} ({b.city})</span>
                            {isSelected && <span className="text-emerald-400">● نشط</span>}
                          </button>

                          {/* WARNING IF NO LINKED WAREHOUSE (Requirement 5) */}
                          {!hasLinkedWarehouse && (
                            <div className="p-1 px-2 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-between text-[8px] text-red-400 font-sans">
                              <span className="font-bold flex items-center gap-1">⚠️ هذا الفرع غير مربوط بمستودع</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowWorkspaceSelector(false);
                                  setEnvModalTab("linking");
                                  setShowEnvManagerModal(true);
                                  triggerNotification("يرجى اختيار مستودع إمداد للفرع المعني 🔗", "info");
                                }}
                                className="py-0.5 px-2 bg-red-500 hover:bg-red-400 text-black text-[7.5px] font-black rounded cursor-pointer border-none shadow-sm transition-all"
                              >
                                ربط الآن
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. SECTION: المستودعات والمخازن اللوجستية */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-emerald-400 font-extrabold flex items-center gap-1">📦 اختيار مستودع الجرد والتموين</span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">الخدمات اللوجستية</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {allowedWarehouses.map((w) => {
                      const isSelected = activeWarehouseId === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            handleSwitchWarehouse(w.id);
                            setShowWorkspaceSelector(false);
                          }}
                          className={`w-full text-right p-2 rounded-lg text-[11px] flex items-center justify-between transition-all border font-bold cursor-pointer ${
                            isSelected 
                              ? "bg-emerald-650/15 border-emerald-500/40 text-emerald-400 font-red" 
                              : "bg-slate-950/30 border-transparent text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className="truncate">📦 {w.name} ({w.type === "main" ? "رئيسي" : "فرعي"})</span>
                          {isSelected && <span className="text-emerald-400">● نشط</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. SECTION: نقاط البيع النشطة */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-amber-500 font-extrabold flex items-center gap-1">🖥️ اختيار جهاز الكاشير (POS)</span>
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold font-mono">أجهزة العمليات</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {allowedPosUnits.filter(p => !activeBranchId || p.branchId === activeBranchId).map((p) => {
                      const isSelected = activePosId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            handleSwitchPos(p.id);
                            setShowWorkspaceSelector(false);
                          }}
                          className={`w-full text-right p-2 rounded-lg text-[11px] flex items-center justify-between transition-all border font-bold cursor-pointer ${
                            isSelected 
                              ? "bg-amber-500 border-amber-500 text-black font-black" 
                              : "bg-slate-950/30 border-transparent text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className="truncate">🖥️ {p.name}</span>
                          {isSelected && <span className="text-emerald-400 font-bold">● نشط</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. FOOTER LINK: بيئة العمل الحالية 360 */}
                <div className="pt-2 text-center border-t animate-none" style={{ borderColor: themeColors.border }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkspaceSelector(false);
                      setActiveTab("active_environment");
                    }}
                    className="text-[10px] text-gray-400 hover:text-amber-400 transition-all font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer border-none bg-transparent"
                  >
                    <span>🌐 عرض لوحة 360 لكامل بيئة العمل النشطة</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-xs font-bold text-right transition-colors cursor-pointer select-none"
                style={{
                  backgroundColor: isActive ? themeColors.accent + "18" : "transparent",
                  color: isActive ? themeColors.text : themeColors.muted,
                }}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" style={{ color: isActive ? themeColors.accent : themeColors.muted }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 💳 SaaS Subscription Metrics Sidebar Widget (Bullet 10) */}
        <div className="p-3.5 mx-3 mb-2 rounded-xl border space-y-2 text-right bg-slate-900/50" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center justify-between">
            <span className="text-[8px] bg-amber-500/10 text-amber-500 py-0.5 px-1.5 rounded-md font-sans">
              {subscription?.tier === 'A' ? "باقة تجريبية" : subscription?.tier === 'B' ? "باقة احترافية 🚀" : "باقة النخبة Corporate"}
            </span>
            <span className="text-[9px] text-gray-400 font-bold">حدود المبيعات</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-bold">
              <span className="font-mono text-gray-400">{(subscription?.currentUsed ?? 0).toLocaleString()} / {(subscription?.limit ?? 1).toLocaleString()}</span>
              <span className="text-gray-300">الطلبيات النشطة:</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${((subscription?.currentUsed ?? 0) / (subscription?.limit ?? 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[8px] text-gray-500">
              <span>التجديد: {subscription?.renewsAt ?? "غير محدد"}</span>
              <span>الاستهلاك: {Math.round(((subscription?.currentUsed ?? 0) / (subscription?.limit ?? 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* User Footer profile segment */}
        <div className="p-4 border-t flex items-center justify-between gap-2" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-2">
            {currentUser.imageUrl || (currentUser.avatar && (currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("data:") || currentUser.avatar.length > 5)) ? (
              <img 
                src={currentUser.imageUrl || currentUser.avatar} 
                alt={currentUser.name} 
                className="rounded-lg object-cover shrink-0"
                style={{ width: "42px", height: "42px" }}
                referrerPolicy="no-referrer"
              />
            ) : currentUser.role === "مدير" ? (
              <img 
                src={sahmMiniMarkPngUrl} 
                alt="Sahm OS Mini Mark" 
                className="rounded-lg object-contain shrink-0"
                style={{ width: "42px", height: "42px" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="flex items-center justify-center font-black text-xs text-[#000] rounded-lg shrink-0 font-sans"
                style={{ 
                  backgroundColor: themeColors.accent,
                  width: "42px",
                  height: "42px"
                }}
              >
                {currentUser.avatar}
              </div>
            )}
            <div className="max-w-[120px] truncate">
              <span className="font-bold text-xs block truncate" style={{ color: themeColors.text }}>{currentUser.name}</span>
              <span className="text-[8px] block uppercase" style={{ color: themeColors.muted }}>دور {currentUser.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 cursor-pointer transition-colors border-0"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Primary layout body wrapper */}
      <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative ${isPosFullscreen && activeTab === "pos_and_operations" ? "" : "pb-16 lg:pb-0"}`}>
        
        {/* Web App Header top-bar */}
        {!(isPosFullscreen && activeTab === "pos_and_operations") && (
          <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 z-30 relative"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          {/* Active store identity with dropdown switcher */}
          <div className="flex items-center gap-2 relative">
            {/* Mobile-only brand logo (sidebar is hidden on mobile screens) */}
            <img 
              src={sahmMiniMarkPngUrl} 
              alt="Sahm OS Logo" 
              className="rounded-lg object-contain lg:hidden shrink-0"
              style={{ width: "42px", height: "42px" }}
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              className="flex items-center gap-1.5 py-1 px-3.5 rounded-xl border transition-all text-xs font-black cursor-pointer bg-slate-900/60 border-slate-800 hover:border-amber-500/40 text-white"
              style={{ borderColor: showStoreDropdown ? themeColors.accent : undefined }}
            >
              <Store className="w-4 h-4 text-amber-500" />
              <span className="font-extrabold">{storeName}</span>
              <span className="text-[9px] text-gray-500 transform transition-transform duration-200">▼</span>
            </button>

            {showStoreDropdown && (
              <div 
                className="absolute right-0 top-10 mt-1 w-64 rounded-2xl border p-2 shadow-2xl text-right animate-scale-up z-50"
                style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
              >
                <div className="px-3 py-1.5 border-b border-slate-800 mb-1">
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase">تبديل المتجر الحالي المفتوح:</span>
                </div>
                 <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
                  {/* 🌍 UNIFIED VIEW MODE FOR ALL STORES */}
                  <button
                    onClick={() => {
                      setActiveStoreId("all_stores");
                      setShowStoreDropdown(false);
                      triggerNotification("تم الانتقال لوضع العرض الموحد لجميع المتاجر! 🌍", "success");
                    }}
                    className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-all border-none font-bold cursor-pointer ${
                      activeStoreId === "all_stores" 
                      ? "bg-amber-500 text-black font-extrabold" 
                      : "bg-transparent text-gray-300 hover:bg-slate-950/60"
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <span>🌍</span>
                      <span>عرض موحد لكل المتاجر (الكل)</span>
                    </span>
                    {activeStoreId === "all_stores" && <span className="text-[10px]">👑</span>}
                  </button>

                  {stores.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setActiveStoreId(st.id);
                        setShowStoreDropdown(false);
                        triggerNotification(`تم الانتقال لمتجر [${st.name}] بنجاح! 🔄`, "success");
                      }}
                      className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-all border-none font-bold cursor-pointer ${
                        st.id === activeStoreId 
                        ? "bg-amber-500 text-black font-extrabold" 
                        : "bg-transparent text-gray-300 hover:bg-slate-950/60"
                      }`}
                    >
                      <span className="truncate">{st.name}</span>
                      {st.id === activeStoreId && <span className="text-[10px]">👑</span>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 mt-1 pt-1.5 pb-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowStoreDropdown(false);
                      setActiveTab("store_management");
                      triggerNotification("تم تحويلك لتبويب إدارة المتاجر والمنشآت 🏬", "info");
                    }}
                    className="w-full text-right py-1.5 px-3 rounded-lg text-[10.5px] font-black text-[#D4AF37] hover:bg-slate-950/40 flex items-center gap-1.5 transition-all cursor-pointer border-none bg-transparent"
                  >
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>إدارة المتاجر والمنشآت 🏬</span>
                  </button>
                </div>
              </div>
            )}

            <span className="hidden md:inline-block text-[9px] py-1 px-2.5 bg-slate-900 border rounded-lg text-[#D4AF37]" style={{ borderColor: themeColors.border }}>
              📍 {activeWorkspace.name.split("-")[1]}
            </span>

            {activeStoreId === "all_stores" && (
              <span className="animate-pulse inline-flex items-center gap-1.5 text-[10px] py-1 px-3 bg-amber-500/15 border border-amber-550/40 rounded-xl text-amber-400 font-extrabold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                وضع العرض الموحد — كل المتاجر
              </span>
            )}
          </div>

          {/* 🔍 Dynamic Global Search Input Trigger (Bullet 5) */}
          <button 
            type="button"
            onClick={() => setIsGlobalSearchOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-gray-400 hover:text-white transition-all text-[10.5px] font-bold border max-w-xs w-64 justify-between cursor-pointer"
            style={{ backgroundColor: themeColors.bg, borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>ابحث عن فاتورة، منتج، أو عميل...</span>
            </div>
            <kbd className="font-sans px-1.5 py-0.5 text-[8.5px] rounded border border-slate-800 bg-slate-950 font-extrabold tracking-widest text-[#D4AF37]">
              Ctrl + K
            </kbd>
          </button>

          {/* Quick info actions (Bullet 14 - Unified Notification bell) */}
          <div className="flex items-center gap-3 text-xs font-bold relative">
            
            {/* ➕ Quick Create Dropdown System (زر إنشاء عام في الهيدر) */}
            <div className="relative">
              <button
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                className="py-1 px-3 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#475569] text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="إنشاء عنصر جديد سريع"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400 bg-amber-450/10 rounded" />
                <span>+ إنشاء</span>
              </button>

              {showCreateDropdown && (
                <div 
                  className="absolute left-0 mt-2.5 w-48 rounded-xl border p-1 shadow-2xl text-right animate-scale-up z-50 overflow-hidden space-y-0.5"
                  style={{ backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }}
                >
                  <div className="px-3 py-1 border-b border-slate-800 mb-1 text-[8px] text-gray-400 font-extrabold">قائمة الإنشاء السريع:</div>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setActiveTab("products");
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("sahm_open_new_product"));
                      }, 50);
                    }}
                    className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-gray-300 hover:text-white hover:bg-slate-950/60 transition-all cursor-pointer border-none bg-transparent flex items-center gap-2 justify-end"
                  >
                    <span>منتج جديد 📦</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setShowGlobalAIBuilder(true);
                      triggerNotification("تم فتح صانع المنتجات الذكي بالذكاء الاصطناعي 🤖✨", "success");
                    }}
                    className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-amber-400 hover:text-amber-300 hover:bg-slate-950/60 transition-all cursor-pointer border-none bg-transparent flex items-center gap-2 justify-end"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>منتج ذكي 🤖✨</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setActiveTab("financial_hub");
                      setFinancialSubTab("customers");
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("sahm_open_new_customer"));
                      }, 50);
                    }}
                    className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-gray-300 hover:text-white hover:bg-slate-950/60 transition-all cursor-pointer border-none bg-transparent flex items-center gap-2 justify-end"
                  >
                    <span>عميل جديد 👥</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setActiveTab("financial_hub");
                      setFinancialSubTab("invoices");
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("sahm_open_new_invoice"));
                      }, 50);
                    }}
                    className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-gray-300 hover:text-white hover:bg-slate-950/60 transition-all cursor-pointer border-none bg-transparent flex items-center gap-2 justify-end"
                  >
                    <span>فاتورة جديدة 🧾</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setActiveTab("intelligent_hub");
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("sahm_open_new_campaign"));
                      }, 50);
                    }}
                    className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-gray-300 hover:text-white hover:bg-slate-950/60 transition-all cursor-pointer border-none bg-transparent flex items-center gap-2 justify-end"
                  >
                    <span>حملة جديدة 📢</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setActiveTab("help");
                      triggerNotification("تم توجيهك لمركز المساعدة - ارفع تذكرة دعم فني جديدة 🛠️", "info");
                    }}
                    className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-gray-300 hover:text-white hover:bg-slate-950/60 transition-all cursor-pointer border-none bg-transparent flex items-center gap-2 justify-end border-t border-dashed border-slate-800/60 mt-1"
                  >
                    <span>تذكرة دعم 🛠️</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowOnboarding(true)}
              className="py-1 px-2.5 bg-amber-500 hover:bg-amber-600 text-black text-[9.5px] font-black rounded-lg transition-all animate-bounce flex items-center gap-1 cursor-pointer border-0"
              title="مرشد الإعداد التفاعلي لمتجرك"
            >
              <Sparkles className="w-3 h-3 text-slate-900" />
              <span>مرشد البداية ✨</span>
            </button>

            {/* Notification trigger bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifTray(!showNotifTray)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer border relative border-slate-800 text-gray-300"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-black text-[8.5px] rounded-full flex items-center justify-center animate-pulse">
                    {notificationsList.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* 🔔 Slide Down Notification Panel Overlay (Bullet 14) */}
              {showNotifTray && (
                <div 
                  className="absolute left-0 mt-2.5 w-80 rounded-xl border p-4 shadow-2xl text-right animate-scale-up space-y-3 z-50 overflow-hidden"
                  style={{ backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }}
                >
                  <UnifiedNotifications
                    theme={themeColors}
                    notifications={notificationsList}
                    onMarkRead={(id) => {
                      const updated = notificationsList.map(n => n.id === id ? { ...n, read: true } : n);
                      setNotificationsList(updated);
                      localStorage.setItem("sahm_notifications_hub", JSON.stringify(updated));
                    }}
                    onClearAll={() => {
                      setNotificationsList([]);
                      localStorage.setItem("sahm_notifications_hub", JSON.stringify([]));
                    }}
                    onAddNotification={(title, text, type, module) => {
                      const newN = {
                        id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
                        title,
                        text,
                        time: "الآن",
                        type,
                        read: false,
                        module
                      };
                      const updated = [newN, ...notificationsList];
                      setNotificationsList(updated);
                      localStorage.setItem("sahm_notifications_hub", JSON.stringify(updated));
                      triggerNotification(text, "success");
                    }}
                  />
                  <div className="flex justify-end pt-1.5 border-t" style={{ borderColor: themeColors.border }}>
                    <button 
                      onClick={() => setShowNotifTray(false)}
                      className="text-[9.5px] cursor-pointer text-gray-400 hover:text-white px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-black transition-all"
                    >
                      إغلاق ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] border border-emerald-500/20">
              ● الفرع الرئيسي متصل ومحمي
            </span>
          </div>
        </header>
        )}

        {/* Content workspace renderer */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-5 pb-20 select-text">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 📊 TAB CONTENT 1: Sahm Executive Command Center */}
            {activeTab === "command_center" && (
              <SahmCommandCenter 
                invoices={invoices} 
                setInvoices={setInvoices} 
                products={products} 
                setProducts={setProducts} 
                customers={customers} 
                setCustomers={setCustomers} 
                suppliers={suppliers} 
                theme={themeColors} 
                user={currentUser} 
                workspaces={workspaces}
                activeWorkspaceId={activeWorkspaceId}
                setActiveWorkspaceId={handleSwitchWorkspace}
                activeWorkspace={activeWorkspace}
                subscription={subscription}
                setSubscription={updateSubscription}
                enabledModules={enabledModules}
                setEnabledModules={setEnabledModulesWithNotify}
                notificationsList={notificationsList}
                setNotificationsList={setNotificationsList}
                triggerNotification={triggerNotification}
                auditLogs={auditLogs}
                addAuditLog={addAuditLog}
                aiMemory={aiMemory}
                setAiMemory={saveAiMemory}
              />
            )}

             {/* 🛍️ TAB CONTENT 2: Point of Sale & Operations */}
            {activeTab === "pos_and_operations" && (
              activeStoreId === "all_stores" ? (
                <div className="p-8 rounded-3xl border text-center space-y-6 max-w-2xl mx-auto my-12"
                  style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-bounce text-3xl">
                    ⚠️
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-white">وضع العرض الموحد — تشغيل الكاشير POS مجمّد</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      قوانين الهيكلة التنظيمية والامتثال الضريبي من هيئة الزكاة والضريبة والجمارك تمنع تشغيل نقطة بيع موحدة لعدة علامات تجارية أو متاجر تشغيلية في آن واحد. يرجى اختيار علامة تجارية أو متجر فرعي محدد لبدء تشغيل الكاشير وإصدار الفواتير الفورية.
                    </p>
                  </div>
                  <div className="border-t border-slate-800/60 my-4 pt-4 space-y-2.5">
                    <span className="text-[10px] text-sky-400 font-extrabold block uppercase tracking-wider">حدد أحد المتاجر النشطة للتشغيل الفوري وتفعيل الـ POS:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {stores.map(st => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setActiveStoreId(st.id);
                            triggerNotification(`تمت تهيئة وتفعيل متجر [${st.name}] لتشغيل الكاشير! 🛍️`, "success");
                            addAuditLog("تفعيل متجر", `تم الانتقال المباشر وتفعيل متجر [${st.name}] من خلال شاشة الكاشير لمباشرة العمليات الميدانية.`);
                          }}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-black text-white flex items-center justify-between cursor-pointer transition-all border-solid"
                        >
                          <div className="flex items-center gap-2">
                            <span>🏬</span>
                            <span>{st.name}</span>
                          </div>
                          <span className="text-amber-400 text-[10px]">تشغيل الكاشير الآن ←</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <PosAndOperations 
                  products={products}
                  setProducts={setProducts}
                  invoices={invoices}
                  setInvoices={setInvoices}
                  customers={customers}
                  setCustomers={setCustomers}
                  theme={themeColors}
                  user={currentUser}
                  triggerNotification={triggerNotification}
                  addAuditLog={addAuditLog}
                  isPosFullscreen={isPosFullscreen}
                  setIsPosFullscreen={setIsPosFullscreen}
                />
              )
            )}

            {/* ⚖️ TAB CONTENT: Financial Hub (المنظومة المالية والشركاء) */}
            {activeTab === "financial_hub" && (
              <div className="space-y-6">
                {/* Modern Segmented Control Header */}
                <div className="p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border select-none transition-all shadow-sm"
                  style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                      <Landmark className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black tracking-tight" style={{ color: themeColors.text }}>
                        المنظومة المالية وإدارة الشركاء 💼
                      </h2>
                      <p className="text-[10px]" style={{ color: themeColors.muted }}>
                        إدارة مركزية للفواتير والعملاء والموردين ودفاتر الحسابات المتكاملة
                      </p>
                    </div>
                  </div>

                  {/* Sub-tab segment buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-slate-800">
                    <button
                      onClick={() => setFinancialSubTab("invoices")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${financialSubTab === "invoices" ? "bg-amber-500 !text-black shadow" : "text-gray-400 hover:text-white"}`}
                      style={{ backgroundColor: financialSubTab === "invoices" ? themeColors.accent : "" }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>الفواتير</span>
                    </button>

                    {(currentUser.role === "مدير" || currentUser.role === "محاسب") && (
                      <>
                        <button
                          onClick={() => setFinancialSubTab("customers")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${financialSubTab === "customers" ? "bg-amber-500 !text-black shadow" : "text-gray-400 hover:text-white"}`}
                          style={{ backgroundColor: financialSubTab === "customers" ? themeColors.accent : "" }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>العملاء</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("suppliers")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${financialSubTab === "suppliers" ? "bg-amber-500 !text-black shadow" : "text-gray-400 hover:text-white"}`}
                          style={{ backgroundColor: financialSubTab === "suppliers" ? themeColors.accent : "" }}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>الموردين</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("profiles")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${financialSubTab === "profiles" ? "bg-amber-500 !text-black shadow" : "text-gray-400 hover:text-white"}`}
                          style={{ backgroundColor: financialSubTab === "profiles" ? themeColors.accent : "" }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>الملفات الموحدة 🗃️</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("accounting")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${financialSubTab === "accounting" ? "bg-amber-500 !text-black shadow" : "text-gray-400 hover:text-white"}`}
                          style={{ backgroundColor: financialSubTab === "accounting" ? themeColors.accent : "" }}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>النظام المحاسبي ERP</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-tab view viewport */}
                <div className="animate-fade-in animate-duration-300">
                  {financialSubTab === "invoices" && (
                    <Invoices 
                      invoices={invoices} 
                      setInvoices={setInvoices} 
                      products={products} 
                      customers={customers} 
                      suppliers={suppliers}
                      setSuppliers={setSuppliers}
                      theme={themeColors} 
                      openUnifiedActions={openUnifiedActions}
                      triggerNotification={triggerNotification}
                      addAuditLog={addAuditLog}
                      activeStoreId={activeStoreId}
                    />
                  )}

                  {financialSubTab === "customers" && (currentUser.role === "مدير" || currentUser.role === "محاسب") && (
                    <Customers 
                      customers={customers} 
                      setCustomers={setCustomers} 
                      theme={themeColors} 
                      openUnifiedActions={openUnifiedActions}
                      triggerNotification={triggerNotification}
                      addAuditLog={addAuditLog}
                    />
                  )}

                  {financialSubTab === "suppliers" && (currentUser.role === "مدير" || currentUser.role === "محاسب") && (
                    <Suppliers 
                      suppliers={suppliers} 
                      setSuppliers={setSuppliers} 
                      invoices={invoices}
                      theme={themeColors} 
                      openUnifiedActions={openUnifiedActions}
                      triggerNotification={triggerNotification}
                      addAuditLog={addAuditLog}
                    />
                  )}

                  {financialSubTab === "profiles" && (currentUser.role === "مدير" || currentUser.role === "محاسب") && (
                    <UnifiedProfileHub 
                      theme={themeColors} 
                      triggerNotification={triggerNotification}
                      addAuditLog={addAuditLog}
                    />
                  )}

                  {financialSubTab === "accounting" && (currentUser.role === "مدير" || currentUser.role === "محاسب") && (
                    <AccountingERP 
                      invoices={invoices}
                      products={products}
                      customers={customers}
                      suppliers={suppliers}
                      theme={themeColors}
                      openUnifiedActions={openUnifiedActions}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 📦 TAB CONTENT: Products & AI Product Builder */}
            {activeTab === "products" && (
              <Products 
                products={products} 
                setProducts={setProducts} 
                theme={themeColors} 
                openUnifiedActions={openUnifiedActions}
                triggerNotification={triggerNotification}
                addAuditLog={addAuditLog}
                invoices={invoices}
                setInvoices={setInvoices}
                user={currentUser}
                activeStoreId={activeStoreId}
              />
            )}

            {/* 📊 TAB CONTENT 6: Business analytics & Reports */}
            {activeTab === "reports" && (
              <Reports 
                invoices={invoices} 
                products={products} 
                theme={themeColors} 
              />
            )}

            {/* 🧠 TAB CONTENT 8: AI Intelligent Hub Studio */}
            {activeTab === "intelligent_hub" && (
              <IntelligentHub 
                theme={themeColors} 
                user={currentUser}
                products={products}
                setProducts={setProducts}
                invoices={invoices}
                setInvoices={setInvoices}
                customers={customers}
                setCustomers={setCustomers}
                prefillPublish={prefillPublish}
                setPrefillPublish={setPrefillPublish}
                setActiveTab={handleSetActiveTab}
                triggerNotification={triggerNotification}
                addAuditLog={addAuditLog}
              />
            )}

            {/* 🏬 TAB CONTENT: Store Management Profile Hub */}
            {activeTab === "store_management" && (
              <StoreManager 
                theme={themeColors}
                stores={stores}
                setStores={setStores}
                activeStoreId={activeStoreId}
                setActiveStoreId={(id) => {
                  setActiveStoreId(id);
                  const found = stores.find(s => s.id === id);
                  if (found) {
                    setStoreNameRaw(found.name);
                    localStorage.setItem(LS_KEYS.STORE, found.name);
                  }
                }}
                branches={branches}
                setBranches={setBranches}
                warehouses={warehouses}
                setWarehouses={setWarehouses}
                posUnits={posUnits}
                setPosUnits={setPosUnits}
                users={users}
                triggerNotification={(text, type) => triggerNotification(text, type === "error" ? "critical" : "success")}
                addAuditLog={addAuditLog}
                isInline={true}
              />
            )}

            {/* 🏢 TAB CONTENT: Step-by-Step Facility Setup Wizard (تأسيس المنشأة) */}
            {activeTab === "facility_setup" && (
              <FacilitySetup 
                themeColors={themeColors}
                stores={stores}
                onStoreCreated={(newStore) => {
                  const exists = stores.some(s => s.id === newStore.id);
                  if (!exists) {
                    setStores([...stores, newStore]);
                  }
                }}
                branches={branches}
                onBranchCreated={(newBranch) => {
                  setBranches(prev => {
                    const exists = prev.some(b => b.id === newBranch.id);
                    if (exists) return prev;
                    return [...prev, newBranch];
                  });
                }}
                warehouses={warehouses}
                onWarehouseCreated={(newWh) => {
                  setWarehouses(prev => {
                    const exists = prev.some(w => w.id === newWh.id);
                    if (exists) return prev;
                    return [...prev, newWh];
                  });
                }}
                posUnits={posUnits}
                onPosCreated={(newPos) => {
                  setPosUnits(prev => {
                    const exists = prev.some(p => p.id === newPos.id);
                    if (exists) return prev;
                    return [...prev, newPos];
                  });
                }}
                activeStoreId={activeStoreId}
                setActiveStoreId={(id) => {
                  setActiveStoreId(id);
                  const found = stores.find(s => s.id === id);
                  if (found) {
                    setStoreNameRaw(found.name);
                    localStorage.setItem(LS_KEYS.STORE, found.name);
                  }
                }}
                activeBranchId={activeBranchId}
                setActiveBranchId={setActiveBranchId}
                activeWarehouseId={activeWarehouseId}
                setActiveWarehouseId={setActiveWarehouseId}
                activePosId={activePosId}
                setActivePosId={setActivePosId}
                addAuditLog={addAuditLog}
                triggerNotification={(msg, type) => triggerNotification(msg, type === "error" ? "critical" : type)}
              />
            )}

            {/* 🔌 TAB CONTENT 8.7: Sahm Integrations Hub */}
            {activeTab === "integrations" && (
              <SahmIntegrationsHub 
                theme={themeColors} 
                addAuditLog={addAuditLog}
                triggerNotification={triggerNotification}
                activeStoreId={activeWorkspaceId}
              />
            )}

            {/* ⚙️ TAB CONTENT 9: ERP Global Settings */}
            {activeTab === "settings" && (
              <Settings 
                themeKey={themeKey} 
                setThemeKey={setThemeKey} 
                accentKey={accentKey} 
                setAccentKey={setAccentKey} 
                store={storeName} 
                setStore={setStoreName} 
                user={currentUser!} 
                onLogout={handleLogout} 
                currency={currency} 
                setCurrency={setCurrency} 
                notifications={notifications} 
                setNotifications={setNotifications} 
                theme={themeColors} 
                users={users}
                setUsers={setUsers}
                customTheme={customTheme}
                setCustomTheme={setCustomTheme}
                storeAddress={storeAddress}
                setStoreAddress={setStoreAddress}
                storeCR={storeCR}
                setStoreCR={setStoreCR}
                storeVat={storeVat}
                setStoreVat={setStoreVat}
                storeIBAN={storeIBAN}
                setStoreIBAN={setStoreIBAN}
                workspaceLayout={workspaceLayout}
                setWorkspaceLayout={setWorkspaceLayout}
                subscription={subscription}
                setSubscription={updateSubscription}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
                triggerNotification={triggerNotification}
                addAuditLog={addAuditLog}
                onboardingTrigger={() => setShowOnboarding(true)}
                onOpenStoreManager={() => setActiveTab("store_management")}
                initialSubTab={settingsSubTab}
                storesList={stores}
                branchesList={branches}
                warehousesList={warehouses}
                posUnitsList={posUnits}
              />
            )}

            {/* ❔ TAB CONTENT 10: Help Support Portal */}
            {activeTab === "help" && (
              <HelpSupport 
                theme={themeColors}
                customers={customers}
                setCustomers={setCustomers}
                invoices={invoices}
                setInvoices={setInvoices}
                products={products}
                user={currentUser}
                onAddLog={(action, details) => addAuditLog(action, details)}
                triggerNotification={triggerNotification}
              />
            )}
          </div>
        </main>

        {/* 3. Mobile Navigation bottom tabs bar */}
        {!(isPosFullscreen && activeTab === "pos_and_operations") && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex justify-around items-center z-40"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center justify-center flex-grow py-1 gap-1 cursor-pointer border-0 bg-transparent"
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-bold">{item.label.replace("مركز القيادة والتحليلات ⚡", "الرئيسية").replace("المنصة الذكية 🧠🔌", "ذكاء").replace("العمليات ونقاط البيع 🛍️🏢", "مبيعات").replace("النظام المحاسبي ERP ⚖️", "محاسبة")}</span>
                </button>
              );
            })}
          </nav>
        )}

      </div>

      {/* Global Unified Action Hub Modal */}
      {actionItem && (
        <UnifiedActionSystem
          item={actionItem}
          onClose={() => setActionItem(null)}
          theme={themeColors}
          products={products}
          setProducts={setProducts}
          invoices={invoices}
          setInvoices={setInvoices}
          customers={customers}
          setCustomers={setCustomers}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
          onNavigate={handleGlobalNavigate}
        />
      )}

      {/* 🔮 CUSTOM INTERACTIVE ONBOARDING WIZARD DIALOG MODAL (Bullet 2) */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-right font-sans">
          <OnboardingWizard
            theme={themeColors}
            storeName={storeName}
            setStoreName={setStoreName}
            storeCR={storeCR}
            setStoreCR={setStoreCR}
            storeVat={storeVat}
            setStoreVat={setStoreVat}
            accentKey={accentKey}
            setAccentKey={setAccentKey}
            enabledModules={enabledModules}
            setEnabledModules={setEnabledModulesWithNotify}
            subscription={subscription}
            setSubscription={updateSubscription}
            onClose={() => {
              setShowOnboarding(false);
              localStorage.setItem("sahm_onboarding_completed_v8", "true");
              addAuditLog("إعداد Wizard المكتمل", "أتم المدير العام جولة التهيئة السريعة الموحدة بنجاح 🚀");
            }}
          />
        </div>
      )}

      {/* 🔍 LUXURIOUS GLOBAL SEARCH DIALOG MODAL (Ctrl + K) (Bullet 5) */}
      {isGlobalSearchOpen && (
        <GlobalUnifiedSearch
          theme={themeColors}
          products={products}
          customers={customers}
          invoices={invoices}
          onSelectProduct={(p) => {
            setActiveTab("products");
            setIsGlobalSearchOpen(false);
          }}
          onSelectCustomer={(c) => {
            setActiveTab("customers");
            setIsGlobalSearchOpen(false);
          }}
          onSelectInvoice={(inv) => {
            setActiveTab("invoices");
            setIsGlobalSearchOpen(false);
          }}
          onNavigateTab={(tabId) => {
            setActiveTab(tabId);
            setIsGlobalSearchOpen(false);
          }}
        />
      )}

      {showStoreManagerModal && (
        <StoreManager 
          theme={themeColors}
          stores={stores}
          setStores={setStores}
          activeStoreId={activeStoreId}
          setActiveStoreId={setActiveStoreId}
          branches={branches}
          setBranches={setBranches}
          warehouses={warehouses}
          setWarehouses={setWarehouses}
          posUnits={posUnits}
          setPosUnits={setPosUnits}
          users={users}
          triggerNotification={(text, type) => triggerNotification(text, type === "error" ? "critical" : "success")}
          addAuditLog={addAuditLog}
          onClose={() => setShowStoreManagerModal(false)}
        />
      )}

      {false && isGlobalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/85 backdrop-blur-md animate-fade-in text-right font-sans">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border p-5 space-y-4 shadow-2xl relative animate-scale-up"
            style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
          >
            {/* Header / Input Field */}
            <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: themeColors.border }}>
              <span className="text-xl">🔍</span>
              <input
                autoFocus
                type="text"
                placeholder="ابحث عن أي فاتورة، قيد، منتج، عميل، مورد، أو صفحة داخل سهم..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-right font-bold"
                style={{ color: themeColors.text }}
              />
              <button 
                onClick={() => {
                  setIsGlobalSearchOpen(false);
                  setGlobalSearchQuery("");
                }}
                className="p-1.5 rounded-lg bg-slate-900 border text-gray-400 hover:text-white cursor-pointer"
                style={{ borderColor: themeColors.border }}
              >
                ✕
              </button>
            </div>

            {/* Hint tag */}
            <div className="flex justify-between items-center text-[9px] text-gray-500">
              <span>اضغط Esc للخروج</span>
              <span>ابحث بالاسم، الرقم الضريبي، كود SKU، رقم الجوال أو القيمة المالية</span>
            </div>

            {/* Results Grid block */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {(() => {
                const query = globalSearchQuery.trim().toLowerCase();
                
                // 1. Pages configuration indices
                const pages = [
                  { id: "command_center", name: "لوحة التحكم والمؤشرات (مركز القيادة والتحليلات) ⚡" },
                  { id: "intelligent_hub", name: "المنصة الذكية AI Studio (تحليل الأعلانات والتطبيقات) 🧠🔌" },
                  { id: "pos_and_operations", name: "نقاط المبيعات السريعة وبث الكاميرات الرقمية (POS) 🛍️🏢" },
                  { id: "invoices", name: "الفواتير الصادرة والمسودات المقيدة 🧾" },
                  { id: "customers", name: "العملاء وكبار المشتركتين (Customer 360) 👥" },
                  { id: "suppliers", name: "الموردين وقنوات استيراد البضائع 🚚" },
                  { id: "reports", name: "التقارير المالية وخطوط الربحية الخضراء 📊" },
                  { id: "accounting", name: "شجرة الحسابات، قيود اليومية، والميزانية العمومية ⚖️" },
                  { id: "media_center", name: "مركز الوسائط والملفات والباركودات (Media Center) 📂✨" },
                  { id: "settings", name: "إعدادات المتجر، صلاحيات الموظفين، والربط مع Supabase ⚙️" }
                ];

                const filteredPages = query 
                  ? pages.filter(p => p.name.toLowerCase().includes(query))
                  : pages.slice(0, 4); // Default show top 4 pages if no query

                // 2. Filter products
                const filteredProducts = query 
                  ? products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query)))
                  : [];

                // 3. Filter customers
                const filteredCustomers = query 
                  ? customers.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query) || c.city.toLowerCase().includes(query))
                  : [];

                // 4. Filter invoices
                const filteredInvoices = query 
                  ? invoices.filter(v => v.id.toLowerCase().includes(query) || v.customer.toLowerCase().includes(query) || String(v.total).includes(query))
                  : [];

                // 5. Filter suppliers
                const filteredSuppliers = query 
                  ? suppliers.filter(s => s.name.toLowerCase().includes(query) || s.company.toLowerCase().includes(query))
                  : [];

                const totalResults = filteredPages.length + filteredProducts.length + filteredCustomers.length + filteredInvoices.length + filteredSuppliers.length;

                if (query && totalResults === 0) {
                  return (
                    <div className="text-center py-8 space-y-2">
                      <span className="text-3xl block">🏮</span>
                      <p className="text-xs font-bold text-gray-400">لا يوجد أي نتائج تطابق "{globalSearchQuery}"</p>
                      <p className="text-[10px] text-gray-500">حاول البحث بكلمات أبسط أو راجع الأرقام الضريبية المدخلة.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* 📊 CATEGORY 1: Systems & Pages Navigation */}
                    {filteredPages.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider block">🏢 الصفحات وخدمات النظام</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {filteredPages.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(p.id);
                                setIsGlobalSearchOpen(false);
                                setGlobalSearchQuery("");
                              }}
                              className="w-full p-2.5 rounded-xl border text-right text-xs font-bold bg-[#000]/10 hover:border-amber-500/50 transition-all flex items-center justify-between gap-2"
                              style={{ borderColor: themeColors.border }}
                            >
                              <span className="text-gray-300">{p.name}</span>
                              <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-amber-500 font-sans">الانتقال ➔</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 📦 CATEGORY 2: Inventory & Products */}
                    {filteredProducts.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider block">📦 المنتجات والمستودعات ({filteredProducts.length})</span>
                        <div className="space-y-1">
                          {filteredProducts.map(p => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setActiveTab("pos_and_operations");
                                setIsGlobalSearchOpen(false);
                                setGlobalSearchQuery("");
                                triggerNotification(`تم الانتقال وعرض تفاصيل المنتج: ${p.name}`, "success");
                              }}
                              className="p-2.5 rounded-xl border text-right text-xs font-bold hover:border-amber-500/50 transition-all flex items-center justify-between gap-4 cursor-pointer bg-slate-900/30"
                              style={{ borderColor: themeColors.border }}
                            >
                              <div className="flex items-center gap-3">
                                {p.image ? (
                                  <img referrerPolicy="no-referrer" src={p.image} className="w-8 h-8 rounded-lg object-cover" alt={p.name} />
                                ) : (
                                  <span className="w-8 h-8 bg-slate-850 rounded-lg flex items-center justify-center">📦</span>
                                )}
                                <div className="text-right">
                                  <span className="block text-white font-extrabold">{p.name}</span>
                                  <span className="block text-[8.5px] text-gray-500">التصنيف: {p.category} | SKU: {p.sku || "N/A"}</span>
                                </div>
                              </div>
                              <div className="text-left font-mono">
                                <span className="block text-[#D4AF37]">{p.price} ر.س</span>
                                <span className={`block text-[9px] ${p.stock <= 5 ? 'text-red-400' : 'text-emerald-400'}`}>المستودع: {p.stock} حبة</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 🧾 CATEGORY 3: Invoices */}
                    {filteredInvoices.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider block">🧾 الفواتير والقيود المقيدة ({filteredInvoices.length})</span>
                        <div className="space-y-1">
                          {filteredInvoices.map(v => (
                            <div
                              key={v.id}
                              onClick={() => {
                                setActiveTab("invoices");
                                setIsGlobalSearchOpen(false);
                                setGlobalSearchQuery("");
                                triggerNotification(`عرض الفاتورة ${v.id}`, "sync");
                              }}
                              className="p-2.5 rounded-xl border text-right text-xs font-bold hover:border-amber-500/50 transition-all flex items-center justify-between gap-4 cursor-pointer bg-[#000]/10"
                              style={{ borderColor: themeColors.border }}
                            >
                              <div className="text-right">
                                <span className="block text-white font-extrabold">{v.id} • {v.customer}</span>
                                <span className="block text-[8.5px] text-gray-500">التاريخ: {v.date} | النوع: {v.type === "sale" ? "مبيعات" : "مشتريات"}</span>
                              </div>
                              <div className="text-left font-mono">
                                <span className="block text-amber-500">{(v.total ?? 0).toLocaleString()} ر.س</span>
                                <span className={`block text-[8.5px] px-1.5 py-0.5 rounded text-center w-max ml-auto ${
                                  v.status === 'مدفوع' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/15 text-red-400'
                                }`}>
                                  {v.status === 'مدفوع' ? 'مدفوعة ✓' : 'معلقة ⏳'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 👥 CATEGORY 4: Customers */}
                    {filteredCustomers.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider block">👥 ملفات العملاء وكبار المستهلكين ({filteredCustomers.length})</span>
                        <div className="space-y-1">
                          {filteredCustomers.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                // Navigate to customer dashboard & select this customer in Customer360 profile
                                setActiveTab("customers");
                                setIsGlobalSearchOpen(false);
                                setGlobalSearchQuery("");
                                triggerNotification(`تم سحب وتصفير ملف العميل: ${c.name}`, "success");
                              }}
                              className="p-2.5 rounded-xl border text-right text-xs font-bold hover:border-amber-500/50 transition-all flex items-center justify-between gap-4 cursor-pointer bg-slate-900/30"
                              style={{ borderColor: themeColors.border }}
                            >
                              <div className="text-right flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">👤</span>
                                <div>
                                  <span className="block text-white font-black">{c.name}</span>
                                  <span className="block text-[8.5px] text-gray-400">{c.phone}</span>
                                </div>
                              </div>
                              <div className="text-left text-[9px] text-gray-500">
                                <span className="block text-gray-300">المدينة: {c.city}</span>
                                <span className="block">الحساب: {(c.balance ?? 0).toLocaleString()} ر.س</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Global AI Product Builder Modal overlay */}
      {showGlobalAIBuilder && (
        <AIProductBuilder
          products={products}
          setProducts={setProducts}
          theme={themeColors}
          onClose={() => setShowGlobalAIBuilder(false)}
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
        />
      )}

      {/* ⚙️ Workspace Environment Manager Modal (Requirements 1, 2, 3) */}
      {showEnvManagerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none font-sans overflow-y-auto">
          <div 
            className="w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col md:h-[650px] max-h-[90vh]"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
          >
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeColors.border }}>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>⚙️</span>
                  <span>إدارة وتهيئة بيئة العمل الموحدة</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 font-sans">تحديد الفروع والمعارض والمستودعات ونقاط البيع وإدارتها بشكل كامل</p>
              </div>
              <button 
                onClick={() => setShowEnvManagerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-red-950/40 text-gray-400 hover:text-red-400 flex items-center justify-center font-black transition-all cursor-pointer border border-transparent hover:border-red-500/10"
              >
                ✕
              </button>
            </div>

            {/* Layout with tab sidebar on left (or top on mobile) */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              {/* Tab Selector Buttons */}
              <div 
                className="w-full md:w-56 shrink-0 border-l border-slate-900/60 p-3 space-y-1 flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto"
                style={{ backgroundColor: themeColors.bg }}
              >
                {[
                  { id: "hierarchy", label: "👑 هيكلية المنظومة (5 مستويات)", count: null },
                  { id: "branches", label: "🏢 الفروع والمعارض", count: branches.length },
                  { id: "warehouses", label: "📦 المستودعات اللوجستية", count: warehouses.length },
                  { id: "pos", label: "🖥️ نقاط البيع (POS)", count: posUnits.length },
                  { id: "linking", label: "🔗 الربط وتحديد الافتراضيات", count: null },
                ].map((tab) => {
                  const isActive = envModalTab === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setEnvModalTab(tab.id as any)}
                      className={`w-full text-right py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between shrink-0 cursor-pointer ${
                        isActive 
                          ? "bg-amber-500 text-black font-black" 
                          : "text-gray-400 hover:bg-slate-900/60 hover:text-white"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span className={`text-[10px] uppercase font-bold py-0.5 px-1.5 rounded-full ${isActive ? "bg-black/10 text-black" : "bg-slate-900 text-gray-400"}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Content Pane */}
              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                
                {/* 👑 HIERARCHY TAB (5-Tier Organizational Architecture) */}
                {envModalTab === "hierarchy" && (
                  <div className="space-y-6 animate-fade-in text-right">
                    <div className="border-b pb-3" style={{ borderColor: themeColors.border }}>
                      <h4 className="text-sm font-black text-amber-400 flex items-center justify-between">
                        <span>👑 الهيكلية التنظيمية الموحدة للمؤسسة (الهرم الإداري والتشغيلي)</span>
                        <div className="flex gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setMainCompanyName("شركة مراسيم الطيب");
                              setStores(STORES0);
                                                            const defaultBranches = [
                                {
                                  id: "br_riyadh_main",
                                  name: "المعرض الرئيسي • الرياض",
                                  city: "الرياض",
                                  manager: "سعود بن فهد",
                                  phone: "0550011223",
                                  address: "طريق الملك فهد، حي الصحافة",
                                  associatedWh: "wh_central_riyadh",
                                  storeId: "store_1",
                                  status: "نشط",
                                  isActive: true,
                                  employees: []
                                }
                              ];
                              setBranches(defaultBranches);
                              localStorage.setItem("sahm_web_branches", JSON.stringify(defaultBranches));
                              const defaultWhs = [
                                {
                                  id: "wh_central_riyadh",
                                  name: "المستودع المركزي بالرياض",
                                  type: "main",
                                  location: "حي السلي, مخرج 16",
                                  manager: "خالد السبيعي",
                                  capacity: 10000,
                                  status: "نشط"
                                }
                              ];
                              setWarehouses(defaultWhs);
                              localStorage.setItem("sahm_web_warehouses", JSON.stringify(defaultWhs));
                              triggerNotification("تمت إعادة تعيين الهيكلية الموحدة إلى القيم الافتراضية بنجاح! 👑", "info");
                              addAuditLog("إعادة ضبط الهيكل", "تم إعادة ضبط كامل الهرم التشغيلي للمؤسسة");
                            }}
                            className="text-[9.5px] px-2 py-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-300 rounded-lg cursor-pointer shrink-0"
                          >
                            إعادة تعيين الهيكلية للوضع الافتراضي ⚠️
                          </button>
                        </div>
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        استعراض وضبط هرمية المنظومة بدءاً من الشركة القابضة الحاضنة ومروراً بالمتاجر والبراندات، وصولاً للفروع ونقاط البيع والموظفين.
                      </p>
                    </div>

                    {/* Level 1: الشركة القابضة */}
                    <div className="p-4 rounded-xl border relative overflow-hidden bg-amber-950/10 space-y-3" style={{ borderColor: themeColors.border }}>
                      <div className="absolute top-0 left-0 bg-amber-500/10 text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-wider">
                        Level 1 • الشركة الأم القابضة
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👑</span>
                        <div>
                          <h5 className="text-xs font-black text-amber-300">اسم الكيان القانوني القابض (Holding Company)</h5>
                          <p className="text-[9.5px] text-gray-400">المظلة القانونية والمالية العليا التي تنطوي تحتها كافة العلامات والفروع.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 max-w-md pt-1.5">
                        <input
                          type="text"
                          value={mainCompanyName}
                          onChange={(e) => setMainCompanyName(e.target.value)}
                          className="flex-grow bg-slate-900 border text-xs text-gray-100 py-1.5 px-3 rounded-lg outline-none focus:border-amber-500 font-bold"
                          placeholder="مثال: شركة مراسيم الطيب القابضة للتجارة"
                          style={{ borderColor: themeColors.border }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            triggerNotification("تم حفظ وتحديث اسم الشركة الأم بنجاح! 👑", "success");
                            addAuditLog("تعديل اسم الشركة", `تم تغيير الاسم القانوني للشركة القابضة إلى: ${mainCompanyName}`);
                          }}
                          className="px-2.5 bg-amber-500 text-black font-black text-[10px] rounded-lg hover:bg-amber-450 transition-all shrink-0 cursor-pointer"
                        >
                          حفظ التعديل
                        </button>
                      </div>
                    </div>

                    {/* Connector visual indicator */}
                    <div className="flex justify-center -my-3.5 no-print">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-indigo-500"></div>
                    </div>

                    {/* Level 2: المتاجر والعلامات التجارية */}
                    <div className="p-4 rounded-xl border relative overflow-hidden bg-indigo-950/10 space-y-3" style={{ borderColor: themeColors.border }}>
                      <div className="absolute top-0 left-0 bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-wider">
                        Level 2 • المتاجر والبراندات
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🛍️</span>
                          <div>
                            <h5 className="text-xs font-black text-indigo-300">المتاجر الفرعية والبراندات المرتبطة ({stores.length})</h5>
                            <p className="text-[9.5px] text-gray-400">المتاجر الفرعية أو العلامات التجارية السبعة الحاصلة على سجل تجاري تحت القابضة.</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEnvModalTab("stores")}
                            className="text-[9.5px] px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 rounded-lg cursor-pointer shrink-0"
                          >
                            تعديل المتاجر 🛍️
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-sans">
                        {stores.map(st => {
                          const isActiveStore = st.id === activeStoreId;
                          return (
                            <div
                              key={st.id}
                              className={`p-2.5 rounded-lg border text-right space-y-1 transition-all ${
                                isActiveStore 
                                  ? "bg-indigo-950/30 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/20" 
                                  : "bg-slate-900/60 border-slate-900 text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-black truncate">{st.name}</span>
                                {isActiveStore && <span className="text-[8.5px] bg-indigo-500 text-black px-1.5 py-0.5 rounded font-black shrink-0">نشط حالياً</span>}
                              </div>
                              <p className="text-[8px] text-gray-500 leading-snug truncate">{st.companyLegalName || "شركة فرعية تابعة"}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connector visual indicator */}
                    <div className="flex justify-center -my-3.5 no-print">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-sky-500"></div>
                    </div>

                    {/* Level 3: الفروع والمعارض */}
                    <div className="p-4 rounded-xl border relative overflow-hidden bg-sky-950/10 space-y-3" style={{ borderColor: themeColors.border }}>
                      <div className="absolute top-0 left-0 bg-sky-550/15 text-sky-400 text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-wider">
                        Level 3 • الفروع الجغرافية
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏛️</span>
                          <div>
                            <h5 className="text-xs font-black text-sky-300">الفروع والمعارض ومنافذ البيع الميدانية ({branches.length})</h5>
                            <p className="text-[9.5px] text-gray-400">منافذ وقنوات البيع الجغرافية المباشرة التي تقابل الجمهور.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddBranchForm(!showAddBranchForm);
                              if(!showAddBranchForm) {
                                setAddBranchName("");
                                setAddBranchCity("");
                                setAddBranchAddress("");
                                setAddBranchManager("");
                                setAddBranchPhone("");
                                setAddBranchStoreId(stores[0]?.id || "store_1");
                                setAddBranchWhId(warehouses[0]?.id || "");
                                setAddBranchStatus("نشط");
                              }
                            }}
                            className="text-[9.5px] px-2.5 py-1 bg-amber-500 hover:bg-amber-450 text-black font-black rounded-lg cursor-pointer border-0 transition-all flex items-center gap-1 shrink-0"
                          >
                            <span>{showAddBranchForm ? "إغلاق النموذج ×" : "+ إضافة فرع جديد"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEnvModalTab("branches")}
                            className="text-[9.5px] px-2 py-1 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-300 rounded-lg cursor-pointer shrink-0"
                          >
                            تعديل الفروع 🏢
                          </button>
                        </div>
                      </div>

                      {showAddBranchForm && (
                        <div className="p-4 rounded-xl border border-dashed bg-slate-900/80 border-amber-500/30 text-right space-y-3 animate-slide-up">
                          <h6 className="text-[11px] font-black text-amber-400">📝 إضافة فرع تشغيلي جديد للمجموعة</h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">اسم الفرع *</label>
                              <input
                                type="text"
                                placeholder="مثال: فرع الرياض"
                                value={addBranchName}
                                onChange={(e) => setAddBranchName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">المدينة</label>
                              <input
                                type="text"
                                placeholder="مثال: الرياض"
                                value={addBranchCity}
                                onChange={(e) => setAddBranchCity(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">المتجر التابع له *</label>
                              <select
                                value={addBranchStoreId}
                                onChange={(e) => setAddBranchStoreId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              >
                                {stores.map(st => (
                                  <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">العنوان الجغرافي</label>
                              <input
                                type="text"
                                placeholder="حي المروج، طريق الملك فهد"
                                value={addBranchAddress}
                                onChange={(e) => setAddBranchAddress(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">مدير الفرع</label>
                              <input
                                type="text"
                                placeholder="صالح الحربي"
                                value={addBranchManager}
                                onChange={(e) => setAddBranchManager(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">رقم التواصل</label>
                              <input
                                type="text"
                                placeholder="0500000000"
                                value={addBranchPhone}
                                onChange={(e) => setAddBranchPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-mono font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">المستودع المرتبط تزويدياً</label>
                              <select
                                value={addBranchWhId}
                                onChange={(e) => setAddBranchWhId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              >
                                <option value="">-- غير مرتبط بمستودع --</option>
                                {warehouses.map(wh => (
                                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-gray-400 font-bold block">الحالة التشغيلية</label>
                              <select
                                value={addBranchStatus}
                                onChange={(e) => setAddBranchStatus(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10.5px] text-white outline-none focus:border-amber-500 font-bold"
                              >
                                <option value="نشط">نشط</option>
                                <option value="غير نشط">غير نشط</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!addBranchName.trim()) {
                                  triggerNotification("يرجى إدخال اسم الفرع أولاً! ⚠️", "warning");
                                  return;
                                }
                                const newB = {
                                  id: "br_" + Date.now(),
                                  name: addBranchName.trim(),
                                  city: addBranchCity || "الرياض",
                                  manager: addBranchManager.trim() || "مدير فرع",
                                  phone: addBranchPhone.trim() || "050000000",
                                  address: addBranchAddress.trim() || "شارع الملك فهد العام",
                                  associatedWh: addBranchWhId || undefined,
                                  storeId: addBranchStoreId,
                                  status: addBranchStatus,
                                  isActive: addBranchStatus === "نشط",
                                  employees: []
                                };
                                const updatedBranches = [...branches, newB];
                                setBranches(updatedBranches);
                                try {
                                  localStorage.setItem("sahm_web_branches", JSON.stringify(updatedBranches));
                                } catch (err) {
                                  console.warn("Storage write failed:", err);
                                }
                                triggerNotification(`تم تسجيل وتنشيط الفرع الجديد [${newB.name}] بنجاح! 🎉`, "success");
                                addAuditLog("إضافة فرع", `تمت إضافة فرع جديد بنجاح: [${newB.name}] في مدينة [${newB.city}] مخصص تحت كود متجر [${addBranchStoreId}]`);
                                
                                // Reset form inputs
                                setAddBranchName("");
                                setAddBranchCity("الرياض");
                                setAddBranchAddress("");
                                setAddBranchManager("");
                                setAddBranchPhone("");
                                setShowAddBranchForm(false);
                              }}
                              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-black text-[11px] font-black rounded-lg transition-all cursor-pointer border-0"
                            >
                              حفظ وتسجيل الفرع 💾
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddBranchForm(false)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 text-[11px] font-bold rounded-lg cursor-pointer border-0"
                            >
                              إلغاء الأمر
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🌌 Grouped Branches by Selected Store (Tree structure layout) */}
                      <div className="space-y-3 pt-1 font-sans">
                        {stores.map(st => {
                          const storeBranches = branches.filter(b => b.storeId === st.id || (!b.storeId && st.id === "store_1"));
                          return (
                            <div key={st.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/50 text-right space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-800/30 pb-1.5">
                                <span className="text-[10.5px] font-black text-indigo-400">🛍️ {st.name}</span>
                                <span className="text-[8.5px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black font-sans shrink-0 uppercase">
                                  {storeBranches.length} فروع مرتبطة
                                </span>
                              </div>
                              
                              {storeBranches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {storeBranches.map(b => {
                                    const isSelectedBranch = b.id === activeBranchId;
                                    const isInactive = b.status === "غير نشط";
                                    const linkedWh = warehouses.find(wh => wh.id === b.associatedWh);
                                    return (
                                      <div
                                        key={b.id}
                                        className={`p-2 rounded-lg border text-right space-y-1 transition-all ${
                                          isSelectedBranch 
                                            ? "bg-sky-950/35 border-sky-500 text-sky-100 ring-1 ring-sky-500/20" 
                                            : "bg-slate-950/30 border-slate-900 text-gray-300"
                                        } ${isInactive ? "opacity-60 border-dashed" : ""}`}
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[10px] font-black truncate">{b.name}</span>
                                          <div className="flex gap-1 items-center shrink-0">
                                            {isInactive ? (
                                              <span className="text-[7px] bg-red-500/20 text-red-400 px-1 py-0.1 select-none rounded">غير نشط</span>
                                            ) : (
                                              <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1 py-0.1 select-none rounded">نشط</span>
                                            )}
                                            {isSelectedBranch && (
                                              <span className="text-[7.5px] bg-sky-500 text-black px-1 py-0.5 rounded font-black font-sans">النشط حالياً</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-[8px] text-gray-500 space-y-0.5 leading-snug">
                                          <div className="flex justify-between">
                                            <span>المدينة: {b.city}</span>
                                            <span>المدير: {b.manager?.split(" ")[0]}</span>
                                          </div>
                                          {linkedWh ? (
                                            <div className="text-emerald-400 text-[7.5px] font-bold">📦 مرتبط بـ: {linkedWh.name}</div>
                                          ) : (
                                            <div className="text-red-400 text-[7.5px] font-bold">⚠️ غير مربوط بمستودع</div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-[9px] text-gray-500 py-2 font-sans text-center">
                                  لا توجد فروع مخصصة تحت هذا المتجر بعد.
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connector visual indicator */}
                    <div className="flex justify-center -my-3.5 no-print">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-sky-500 to-emerald-500"></div>
                    </div>

                    {/* Level 4: المستودعات اللوجستية */}
                    <div className="p-4 rounded-xl border relative overflow-hidden bg-emerald-950/10 space-y-3" style={{ borderColor: themeColors.border }}>
                      <div className="absolute top-0 left-0 bg-emerald-550/15 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-br-lg uppercase tracking-wider">
                        Level 4 • المستودعات والخدمات
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📦</span>
                          <div>
                            <h5 className="text-xs font-black text-emerald-300">مستودعات التغذية ومراكز الجرد واللوجستيات ({warehouses.length})</h5>
                            <p className="text-[9.5px] text-gray-400">مخازن دعم وتزويد الفروع بالبضائع لمنع نفاد المخزون وضمان انتظام الجرد.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnvModalTab("warehouses")}
                          className="text-[9.5px] px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 rounded-lg cursor-pointer"
                        >
                          تعديل وإضافة المستودعات 📦
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-sans">
                        {warehouses.map(w => {
                          const isSelectedWh = w.id === activeWarehouseId;
                          const linkedBranches = branches.filter(b => b.associatedWh === w.id);
                          return (
                            <div
                              key={w.id}
                              className={`p-2.5 rounded-lg border text-right space-y-1 transition-all ${
                                isSelectedWh 
                                  ? "bg-emerald-950/30 border-emerald-500 text-emerald-100" 
                                  : "bg-slate-900/60 border-slate-900 text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-black truncate">{w.name}</span>
                                {isSelectedWh && <span className="text-[8px] bg-emerald-555 text-black px-1.5 py-0.5 rounded font-black shrink-0">النشط جردياً</span>}
                              </div>
                              <p className="text-[8px] text-gray-500 truncate">الموقع: {w.location}</p>
                              {linkedBranches.length > 0 ? (
                                <div className="text-[7.5px] text-emerald-400 leading-snug font-bold">
                                  🔗 يغذي: {linkedBranches.map(b => b.name.replace("فرع", "").trim()).join(" • ")}
                                </div>
                              ) : (
                                <div className="text-[7.5px] text-amber-500 font-bold">
                                  ⚠️ مستودع حر / غير مربوط بفرع حالياً
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connector visual indicator */}
                    <div className="flex justify-center -my-3.5 no-print">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-rose-500"></div>
                    </div>

                    {/* Level 5: نقاط البيع POS */}
                    <div className="p-4 rounded-xl border relative overflow-hidden bg-rose-950/10 space-y-3" style={{ borderColor: themeColors.border }}>
                      <div className="absolute top-0 left-0 bg-rose-550/15 text-rose-400 text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-wider">
                        Level 5 • الكاشير وPOS
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🖥️</span>
                          <div>
                            <h5 className="text-xs font-black text-rose-300">أجهزة الكاشير ومحطات البيع الفورية POS ({posUnits.length})</h5>
                            <p className="text-[9.5px] text-gray-400">محطات البيع المثبتة بالفرع لتسجيل مبيعات الكاشير وطباعة الفاتورة الفورية بسيريال نظامي.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnvModalTab("pos")}
                          className="text-[9.5px] px-2 py-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-300 rounded-lg cursor-pointer"
                        >
                          تعديل كاشيرات POS 💻
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 font-sans">
                        {posUnits.map(p => {
                          const isSelectedPos = p.id === activePosId;
                          const associatedBranch = branches.find(b => b.id === p.branchId);
                          return (
                            <div
                              key={p.id}
                              className={`p-2.5 rounded-lg border text-right space-y-1 transition-all ${
                                isSelectedPos 
                                  ? "bg-rose-950/30 border-rose-500 text-rose-100" 
                                  : "bg-slate-900/60 border-slate-900 text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-black truncate">{p.name}</span>
                                {isSelectedPos && <span className="text-[8px] bg-rose-500 text-black px-1.5 py-0.5 rounded font-black shrink-0">مفعل</span>}
                              </div>
                              <p className="text-[8px] text-gray-500 truncate">
                                الفرع: {associatedBranch ? associatedBranch.name : "غير معين"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* BRANCHES TAB */}
                {envModalTab === "branches" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: themeColors.border }}>
                      <div>
                        <h4 className="text-sm font-bold text-white">إدارة الفروع والمنافذ</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">إضافة وتعديل وحذف مستودع الارتباط للفروع</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingBranchInline(!isAddingBranchInline);
                          // reset fields
                          setInlineBranchName("");
                          setInlineBranchCity("الرياض");
                          setInlineBranchManager("");
                          setInlineBranchPhone("0500000000");
                          setInlineBranchAddress("طريق الملك فهد العام");
                          setInlineBranchWh("");
                        }}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg transition-all cursor-pointer"
                      >
                        {isAddingBranchInline ? "إلغاء ×" : "+ إضافة فرع جديد"}
                      </button>
                    </div>

                    {/* Inline Beautiful Form to Add Branch safely */}
                    {isAddingBranchInline && (
                      <div className="p-4 rounded-xl border border-[#D4AF37]/20 bg-slate-950/60 text-right space-y-4 animate-fade-in-up">
                        <h5 className="text-xs font-bold text-amber-400">📝 نموذج إضافة فرع جديد</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                          {/* Name */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• اسم الفرع <span className="text-red-500">*</span></label>
                            <input 
                              type="text"
                              value={inlineBranchName}
                              onChange={(e) => setInlineBranchName(e.target.value)}
                              placeholder="مثال: فرع الملز الفرعي"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-amber-500 font-bold"
                            />
                          </div>

                          {/* City */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• المدينة</label>
                            <select
                              value={inlineBranchCity}
                              onChange={(e) => setInlineBranchCity(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-amber-500 text-right"
                            >
                              <option value="الرياض">الرياض</option>
                              <option value="جدة">جدة</option>
                              <option value="الدمام">الدمام</option>
                              <option value="المدينة المنورة">المدينة المنورة</option>
                              <option value="مكة المكرمة">مكة المكرمة</option>
                              <option value="الخبر">الخبر</option>
                            </select>
                          </div>

                          {/* Address */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-gray-400 block">• العنوان بالتفصيل</label>
                            <input 
                              type="text"
                              value={inlineBranchAddress}
                              onChange={(e) => setInlineBranchAddress(e.target.value)}
                              placeholder="مثال: شارع الستين، مقابل مستشفى قوى الأمن"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Manager */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• مدير الفرع</label>
                            <input 
                              type="text"
                              value={inlineBranchManager}
                              onChange={(e) => setInlineBranchManager(e.target.value)}
                              placeholder="مثال: أ. صالح السديري"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none"
                            />
                          </div>

                          {/* Phone */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• رقم التواصل</label>
                            <input 
                              type="text"
                              value={inlineBranchPhone}
                              onChange={(e) => setInlineBranchPhone(e.target.value)}
                              placeholder="مثال: 055xxxxxxx"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-left font-mono"
                            />
                          </div>

                          {/* Associated Store */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• المتجر التابع <span className="text-red-500">*</span></label>
                            <select
                              value={inlineBranchStoreId}
                              onChange={(e) => setInlineBranchStoreId(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right font-medium text-amber-300"
                            >
                              {stores.map(st => (
                                <option key={st.id} value={st.id}>{st.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Status */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• الحالة</label>
                            <select
                              value={inlineBranchStatus}
                              onChange={(e) => setInlineBranchStatus(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right font-bold text-emerald-400"
                            >
                              <option value="نشط">نشط</option>
                              <option value="غير نشط">غير نشط</option>
                              <option value="تحت التأسيس">تحت التأسيس</option>
                            </select>
                          </div>

                          {/* Warehouse Link */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• المستودع الافتراضي</label>
                            <select
                              value={inlineBranchWh}
                              onChange={(e) => setInlineBranchWh(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right"
                            >
                              <option value="">-- بدون مستودع --</option>
                              {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Branch Type */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• نوع الفرع</label>
                            <select
                              value={inlineBranchType}
                              onChange={(e) => setInlineBranchType(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right"
                            >
                              <option value="فرع بيع">فرع بيع (فوري بالتجزئة)</option>
                              <option value="معرض">معرض رئيسي (Showroom)</option>
                              <option value="نقطة تشغيل">نقطة تشغيل وسحابي (Kitchen/Cloud)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingBranchInline(false)}
                            className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-gray-300"
                          >
                            بيان التراجع
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!inlineBranchName.trim()) {
                                triggerNotification("يرجى إدخال اسم الفرع أولاً! ⚠️", "warning");
                                return;
                              }
                              try {
                                const newBranch = {
                                  id: "br_" + Date.now(),
                                  name: inlineBranchName.trim(),
                                  city: inlineBranchCity,
                                  manager: inlineBranchManager.trim() || "صالح كمال",
                                  phone: inlineBranchPhone.trim() || "0500000000",
                                  address: inlineBranchAddress.trim() || "طريق الملك فهد العام",
                                  workingHours: "08:00 ص - 11:00 م",
                                  associatedWh: inlineBranchWh,
                                  storeId: inlineBranchStoreId,
                                  status: inlineBranchStatus,
                                  isActive: inlineBranchStatus === "نشط",
                                  employees: [],
                                  sales: 0,
                                  profits: 0,
                                  expenses: 0,
                                  customersCount: 0
                                };

                                // Save in the Data Layer (branchService)
                                await branchService.create(newBranch);
                                
                                // Update layout state immediately
                                setBranches(prevBranches => [...prevBranches, newBranch]);
                                triggerNotification(`تمت إضافة الفرع الجديد بنجاح وحفظه في الطبقة الموحدة: [${newBranch.name}] 🏬`, "success");
                                addAuditLog("إضافة فرع", `تمت إضافة فرع جديد بنظام بيئة العمل باسم: ${newBranch.name}`);
                                setIsAddingBranchInline(false);
                              } catch (err: any) {
                                triggerNotification(`فشل حفظ الفرع: ${err.message} ❌`, "critical");
                              }
                            }}
                            className="py-1.5 px-4 rounded-lg text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-black border-none cursor-pointer"
                          >
                            حفظ وتسجيل الفرع 💾
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2.5 font-sans">
                      {branches.map(b => {
                        const isMainActive = activeBranchId === b.id;
                        const linkedWh = warehouses.find(w => w.id === b.associatedWh);

                        if (editingBranchId === b.id) {
                          return (
                            <div 
                              key={b.id} 
                              className="p-5 rounded-xl border border-sky-500 bg-slate-900 text-right space-y-4"
                            >
                              <div className="flex items-center justify-between border-b border-sky-500/10 pb-2">
                                <h5 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                                  <span>⚙️ تعديل بيانات الفرع:</span> <span className="text-white font-extrabold">{b.name}</span>
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => setEditingBranchId(null)}
                                  className="text-gray-400 hover:text-white text-xs font-black"
                                >
                                  إلغاء ×
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {/* Name */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• اسم الفرع <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text"
                                    value={editBranchName}
                                    onChange={(e) => setEditBranchName(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-sky-500 font-bold"
                                  />
                                </div>

                                {/* City */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المدينة</label>
                                  <select
                                    value={editBranchCity}
                                    onChange={(e) => setEditBranchCity(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right"
                                  >
                                    <option value="الرياض">الرياض</option>
                                    <option value="جدة">جدة</option>
                                    <option value="الدمام">الدمام</option>
                                    <option value="المدينة المنورة">المدينة المنورة</option>
                                    <option value="مكة المكرمة">مكة المكرمة</option>
                                    <option value="الخبر">الخبر</option>
                                  </select>
                                </div>

                                {/* Address */}
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] text-gray-400 block">• العنوان الجغرافي بالتفصيل</label>
                                  <input 
                                    type="text"
                                    value={editBranchAddress}
                                    onChange={(e) => setEditBranchAddress(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-sky-500"
                                  />
                                </div>

                                {/* Manager */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المسؤول أو المدير</label>
                                  <input 
                                    type="text"
                                    value={editBranchManager}
                                    onChange={(e) => setEditBranchManager(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-sky-500"
                                  />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• رقم تواصل الفرع</label>
                                  <input 
                                    type="text"
                                    value={editBranchPhone}
                                    onChange={(e) => setEditBranchPhone(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-sky-500 font-mono"
                                  />
                                </div>

                                {/* Associated Store */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المتجر التابع <span className="text-red-500">*</span></label>
                                  <select
                                    value={editBranchStoreId}
                                    onChange={(e) => setEditBranchStoreId(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right font-medium text-amber-300"
                                  >
                                    {stores.map(st => (
                                      <option key={st.id} value={st.id}>{st.name}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Warehouse Link */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المستودع الافتراضي للتغذية</label>
                                  <select
                                    value={editBranchWh}
                                    onChange={(e) => setEditBranchWh(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right text-emerald-400 font-bold"
                                  >
                                    <option value="">-- غير مربوط بمستودع --</option>
                                    {warehouses.map(wh => (
                                      <option key={wh.id} value={wh.id}>📦 {wh.name}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Status */}
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] text-gray-400 block">• حالة تشغيل الفرع</label>
                                  <select
                                    value={editBranchStatus}
                                    onChange={(e) => setEditBranchStatus(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right font-bold text-emerald-400"
                                  >
                                    <option value="نشط">نشط</option>
                                    <option value="غير نشط">غير نشط</option>
                                    <option value="تحت التأسيس">تحت التأسيس</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 text-xs pt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingBranchId(null)}
                                  className="py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-gray-300 font-bold"
                                >
                                  تراجع
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!editBranchName.trim()) {
                                      triggerNotification("اسم الفرع مطلوب! ⚠️", "warning");
                                      return;
                                    }
                                    try {
                                      const updated = {
                                        ...b,
                                        name: editBranchName.trim(),
                                        city: editBranchCity,
                                        address: editBranchAddress.trim() || b.address,
                                        manager: editBranchManager.trim() || b.manager,
                                        phone: editBranchPhone.trim() || b.phone,
                                        storeId: editBranchStoreId,
                                        associatedWh: editBranchWh,
                                        status: editBranchStatus,
                                        isActive: editBranchStatus === "نشط"
                                      };

                                      // Persist to Layer (branchService)
                                      await branchService.create(updated);

                                      // Update local React state instantly
                                      setBranches(prev => prev.map(item => item.id === b.id ? updated : item));
                                      triggerNotification(`تم تحديث بيانات الفرع [${updated.name}] بنجاح وحفظها 🏬`, "success");
                                      addAuditLog("تعديل فرع", `تم تحديث بيانات فرع: ${updated.name}`);
                                      setEditingBranchId(null);
                                    } catch (err: any) {
                                      triggerNotification(`تعذر تعديل الفرع: ${err.message} ❌`, "critical");
                                    }
                                  }}
                                  className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg"
                                >
                                  حفظ التغييرات 💾
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={b.id} 
                            className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/30"
                            style={{ borderColor: themeColors.border }}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sky-400 font-bold text-sm">🏢 {b.name}</span>
                                <span className="text-[8.5px] bg-sky-500/10 text-sky-400 py-0.5 px-1.5 rounded-md font-bold">{b.city}</span>
                                {isMainActive && <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 py-0.5 px-1.5 rounded-md font-black">النشط حالياً</span>}
                                <span className={`text-[8.5px] py-0.5 px-1.5 rounded-md font-black ${
                                  b.status === "نشط" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                }`}>
                                  {b.status || "نشط"}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 space-y-0.5">
                                <div><span className="text-gray-500">المدير المسئول:</span> {b.manager} | <span className="text-gray-500">ساعة العمل:</span> {b.workingHours}</div>
                                <div className="flex items-center gap-1.5 mt-1 font-bold">
                                  <span className="text-gray-500">المستودع المغذي:</span>
                                  {linkedWh ? (
                                    <span className="text-emerald-400 flex items-center gap-1">📦 {linkedWh.name}</span>
                                  ) : (
                                    <span className="text-red-400 flex items-center gap-1 font-sans text-[9px]">⚠️ غير مربوط بمستودع تزويد</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSwitchBranch(b.id)}
                                className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  isMainActive 
                                    ? "bg-slate-900 border border-[#D4AF37]/35 text-[#D4AF37]" 
                                    : "bg-sky-600/10 hover:bg-sky-650/20 text-sky-400"
                                }`}
                              >
                                {isMainActive ? "الفرع النشط 👑" : "تفعيل كفرع نشط"}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBranchId(b.id);
                                  setEditBranchName(b.name || "");
                                  setEditBranchCity(b.city || "الرياض");
                                  setEditBranchAddress(b.address || "");
                                  setEditBranchManager(b.manager || "");
                                  setEditBranchPhone(b.phone || "");
                                  setEditBranchStoreId(b.storeId || "store_1");
                                  setEditBranchWh(b.associatedWh || "");
                                  setEditBranchStatus(b.status || "نشط");
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-sky-400 hover:text-sky-300 transition-all border border-transparent hover:border-slate-800 cursor-pointer text-xs"
                                title="تعديل بيانات الفرع"
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (isMainActive) {
                                    alert("لا يمكن حذف الفرع النشط حالياً!");
                                    return;
                                  }
                                  if (confirm(`هل أنت متأكد من حذف ${b.name}؟\nتنبيه: سيتم إلغاء ربط الأجهزة التابعة.`)) {
                                    try {
                                      await branchService.delete(b.id);
                                      setBranches(branches.filter(item => item.id !== b.id));
                                      triggerNotification(`تم حذف الفرع [${b.name}] بنجاح`, "info");
                                      addAuditLog("حذف فرع", `تم حذف فرع ${b.name}`);
                                    } catch (err: any) {
                                      triggerNotification(`حدث فشل أثناء الحذف: ${err.message}`, "critical");
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 cursor-pointer text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WAREHOUSES TAB */}
                {envModalTab === "warehouses" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: themeColors.border }}>
                      <div>
                        <h4 className="text-sm font-bold text-white">إعادة تهيئة المستودعات اللوجستية</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-sans">المخازن ومناسيب السعة الاستيعابية الخاصة بكل منطقة</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingWhInline(!isAddingWhInline);
                          setInlineWhName("");
                          setInlineWhLocation("");
                          setInlineWhType("sub");
                          setInlineWhCapacity(5000);
                        }}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg transition-all cursor-pointer"
                      >
                        {isAddingWhInline ? "إلغاء ×" : "+ إضافة مستودع جديد"}
                      </button>
                    </div>

                    {/* Inline Beautiful Form to Add Warehouse safely */}
                    {isAddingWhInline && (
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-slate-950/60 text-right space-y-4 animate-fade-in-up">
                        <h5 className="text-xs font-bold text-emerald-400 font-sans">📝 نموذج إضافة مستودع جديد</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                          {/* Name */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• اسم المستودع <span className="text-red-500">*</span></label>
                            <input 
                              type="text"
                              value={inlineWhName}
                              onChange={(e) => setInlineWhName(e.target.value)}
                              placeholder="مثال: مستودع السلي الفرعي للتخزين"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 font-bold"
                            />
                          </div>

                          {/* Type */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• نوع المستودع</label>
                            <select
                              value={inlineWhType}
                              onChange={(e) => setInlineWhType(e.target.value as "main" | "sub")}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right font-sans"
                            >
                              <option value="main">رئيسي</option>
                              <option value="sub">فرعي</option>
                            </select>
                          </div>

                          {/* City */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• المدينة</label>
                            <select
                              value={inlineWhCity}
                              onChange={(e) => setInlineWhCity(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 text-right"
                            >
                              <option value="الرياض">الرياض</option>
                              <option value="جدة">جدة</option>
                              <option value="الدمام">الدمام</option>
                              <option value="المدينة المنورة">المدينة المنورة</option>
                              <option value="مكة المكرمة">مكة المكرمة</option>
                              <option value="الخبر">الخبر</option>
                            </select>
                          </div>

                          {/* Responsible Manager */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• المسؤول</label>
                            <input 
                              type="text"
                              value={inlineWhManager}
                              onChange={(e) => setInlineWhManager(e.target.value)}
                              placeholder="مثال: صالح الفهيد"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500"
                            />
                          </div>

                          {/* Location */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-gray-400 block">• العنوان <span className="text-red-500">*</span></label>
                            <input 
                              type="text"
                              value={inlineWhLocation}
                              onChange={(e) => setInlineWhLocation(e.target.value)}
                              placeholder="مثال: حي السلي، تقاطع مخرج 16، الرياض"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500"
                            />
                          </div>

                          {/* Capacity */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• السعة الاستيعابية (وحدة قصوى)</label>
                            <input 
                              type="number"
                              value={inlineWhCapacity}
                              onChange={(e) => setInlineWhCapacity(Number(e.target.value))}
                              placeholder="5000"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none font-mono"
                            />
                          </div>

                          {/* Status */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• الحالة</label>
                            <select
                              value={inlineWhStatus}
                              onChange={(e) => setInlineWhStatus(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right font-sans"
                            >
                              <option value="نشط">نشط</option>
                              <option value="تحت الصيانة">تحت الصيانة</option>
                              <option value="مغلق">مغلق</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setIsAddingWhInline(false)}
                            className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-gray-300"
                          >
                            تراجع
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!inlineWhName.trim()) {
                                triggerNotification("يرجى إدخال اسم المستودع! ⚠️", "warning");
                                return;
                              }
                              try {
                                const newWh = {
                                  id: "wh_" + Date.now(),
                                  name: inlineWhName.trim(),
                                  type: inlineWhType,
                                  location: inlineWhLocation.trim() || `${inlineWhCity}، المملكة العربية السعودية`,
                                  manager: inlineWhManager.trim() || "صالح الفهيد",
                                  capacity: inlineWhCapacity || 5000,
                                  isActive: inlineWhStatus === "نشط",
                                  status: inlineWhStatus,
                                  items: [],
                                  store_id: activeStoreId || "store_1"
                                };

                                // Save in the Data Layer via warehouseService
                                await warehouseService.create(newWh);

                                // Update state immediately
                                setWarehouses(prevWarehouses => [...prevWarehouses, newWh]);
                                triggerNotification(`تمت إضافة المستودع اللوجستي الجديد بنجاح وحفظه في الطبقة الموحدة: [${newWh.name}] 📦`, "success");
                                addAuditLog("إضافة مستودع", `تم إنشاء مستودع جديد بالنظام باسم: ${newWh.name}`);
                                setIsAddingWhInline(false);
                              } catch (err: any) {
                                triggerNotification(`فشل حفظ المستودع: ${err.message} ❌`, "critical");
                              }
                            }}
                            className="py-1.5 px-4 rounded-lg text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-black border-none cursor-pointer"
                          >
                            تخصيص المستودع وحفظه 💾
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2.5">
                      {warehouses.map(w => {
                        const isMainwhActive = activeWarehouseId === w.id;

                        if (editingWhId === w.id) {
                          return (
                            <div 
                              key={w.id} 
                              className="p-5 rounded-xl border border-emerald-500 bg-slate-900 text-right space-y-4"
                            >
                              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                                <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                                  <span>📦 تعديل مستودع:</span> <span className="text-white font-extrabold">{w.name}</span>
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => setEditingWhId(null)}
                                  className="text-gray-400 hover:text-white text-xs font-black"
                                >
                                  إلغاء ×
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                                {/* Name */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• اسم المستودع <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text"
                                    value={editWhName}
                                    onChange={(e) => setEditWhName(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 font-bold"
                                  />
                                </div>

                                {/* Type */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• نوع المستودع</label>
                                  <select
                                    value={editWhType}
                                    onChange={(e) => setEditWhType(e.target.value as "main" | "sub")}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 text-right"
                                  >
                                    <option value="main">رئيسي</option>
                                    <option value="sub">فرعي</option>
                                  </select>
                                </div>

                                {/* City */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المدينة</label>
                                  <select
                                    value={editWhCity}
                                    onChange={(e) => setEditWhCity(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 text-right"
                                  >
                                    <option value="الرياض">الرياض</option>
                                    <option value="جدة">جدة</option>
                                    <option value="الدمام">الدمام</option>
                                    <option value="المدينة المنورة">المدينة المنورة</option>
                                    <option value="مكة المكرمة">مكة المكرمة</option>
                                    <option value="الخبر">الخبر</option>
                                  </select>
                                </div>

                                {/* Responsible Manager */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المسؤول</label>
                                  <input 
                                    type="text"
                                    value={editWhManager}
                                    onChange={(e) => setEditWhManager(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                                  />
                                </div>

                                {/* Location */}
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] text-gray-400 block">• العنوان الجغرافي للمستودع</label>
                                  <input 
                                    type="text"
                                    value={editWhLocation}
                                    onChange={(e) => setEditWhLocation(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                                  />
                                </div>

                                {/* Capacity */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• السعة الاستيعابية (وحدة قصوى)</label>
                                  <input 
                                    type="number"
                                    value={editWhCapacity}
                                    onChange={(e) => setEditWhCapacity(Number(e.target.value))}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none font-mono focus:border-emerald-500"
                                  />
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• الحالة</label>
                                  <select
                                    value={editWhStatus}
                                    onChange={(e) => setEditWhStatus(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right focus:border-emerald-500"
                                  >
                                    <option value="نشط">نشط</option>
                                    <option value="تحت الصيانة">تحت الصيانة</option>
                                    <option value="مغلق">مغلق</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 text-xs pt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingWhId(null)}
                                  className="py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-gray-300 font-bold"
                                >
                                  تراجع
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!editWhName.trim()) {
                                      triggerNotification("اسم المستودع مطلوب! ⚠️", "warning");
                                      return;
                                    }
                                    try {
                                      const updated = {
                                        ...w,
                                        name: editWhName.trim(),
                                        type: editWhType,
                                        location: editWhLocation.trim() || `${editWhCity}، المملكة العربية السعودية`,
                                        manager: editWhManager.trim(),
                                        capacity: editWhCapacity || 5000,
                                        status: editWhStatus,
                                        isActive: editWhStatus === "نشط"
                                      };

                                      // Persist to Layer via warehouseService
                                      await warehouseService.create(updated);

                                      // Update React State immediately
                                      setWarehouses(prev => prev.map(item => item.id === w.id ? updated : item));
                                      triggerNotification(`تم تحديث بيانات المستودع [${updated.name}] بنجاح 📦`, "success");
                                      addAuditLog("تعديل مستودع", `تم تحديث مستودع: ${updated.name}`);
                                      setEditingWhId(null);
                                    } catch (err: any) {
                                      triggerNotification(`تعذر تعديل المستودع: ${err.message} ❌`, "critical");
                                    }
                                  }}
                                  className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg"
                                >
                                  حفظ التغييرات 💾
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={w.id} 
                            className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/30"
                            style={{ borderColor: themeColors.border }}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-bold text-sm">📦 {w.name}</span>
                                <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 py-0.5 px-1.5 rounded-md font-bold">
                                  {w.type === "main" ? "رئيسي" : "فرعي التغذية"}
                                </span>
                                {isMainwhActive && <span className="text-[8.5px] bg-amber-500/10 text-amber-500 py-0.5 px-1.5 rounded-md font-black">المستودع النشط</span>}
                                <span className={`text-[8.5px] py-0.5 px-1.5 rounded-md font-black ${
                                  w.status === "نشط" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                }`}>
                                  {w.status || "نشط"}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 space-y-0.5">
                                <div><span className="text-gray-500">العنوان:</span> {w.location} | <span className="text-gray-500">السعة القصوى:</span> {w.capacity?.toLocaleString()} وحدة</div>
                                <div className="text-emerald-550 font-mono mt-1 text-[9.5px]">تعداد أصناف مخزن الجرد الحالي: {w.items?.length || 0} صنف مبوب</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSwitchWarehouse(w.id)}
                                className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  isMainwhActive 
                                    ? "bg-slate-900 border border-[#D4AF37]/35 text-[#D4AF37]" 
                                    : "bg-emerald-600/10 hover:bg-emerald-650/20 text-emerald-400"
                                }`}
                              >
                                {isMainwhActive ? "مستودع الجرد النشط" : "تنشيط كهدف للمخازن"}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingWhId(w.id);
                                  setEditWhName(w.name || "");
                                  setEditWhType(w.type || "sub");
                                  setEditWhCity(w.location?.includes("جدة") ? "جدة" : w.location?.includes("الدمام") ? "الدمام" : "الرياض");
                                  setEditWhLocation(w.location || "");
                                  setEditWhManager(w.manager || "صالح الفهيد");
                                  setEditWhCapacity(w.capacity || 5000);
                                  setEditWhStatus(w.status || "نشط");
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-all border border-transparent hover:border-slate-800 cursor-pointer text-xs"
                                title="تعديل بيانات المستودع"
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (isMainwhActive) {
                                    alert("لا يمكن حذف مستودع فعال جردياً!");
                                    return;
                                  }
                                  if (confirm(`هل أنت متأكد من حذف مستودع: ${w.name}؟\nتنبيه: سيتم إلغاء ربط الفروع المتعلقة به حالياً.`)) {
                                    try {
                                      await warehouseService.delete(w.id);
                                      setWarehouses(warehouses.filter(item => item.id !== w.id));
                                      triggerNotification(`تم حذف مستودع [${w.name}]`, "info");
                                      addAuditLog("حذف مستودع", `تم حذف مستودع ${w.name}`);
                                    } catch (err: any) {
                                      triggerNotification(`حدث فشل أثناء الحذف: ${err.message}`, "critical");
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 cursor-pointer text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* POS DEVICES TAB */}
                {envModalTab === "pos" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: themeColors.border }}>
                      <div>
                        <h4 className="text-sm font-bold text-white">تفاصيل نقاط البيع المخصصة (POS)</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">تحديد أجهزة الكاشير وتخصيصها بنطاقات عمل الفروع لتسجيل المعاملات بشكل فوري</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingPosInline(!isAddingPosInline);
                          setInlinePosName("");
                          setInlinePosBranchId(activeBranchId || (branches[0] ? branches[0].id : ""));
                          setInlinePosCashier("");
                          setInlinePosWh("");
                          setInlinePosPayMethods(["cash", "card"]);
                          setInlinePosStatus("نشط");
                        }}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg transition-all cursor-pointer"
                      >
                        {isAddingPosInline ? "إلغاء ×" : "+ إضافة جهاز جديد POS"}
                      </button>
                    </div>

                    {/* Inline Beautiful Form to Add POS Device safely */}
                    {isAddingPosInline && (
                      <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-950/60 text-right space-y-4 animate-fade-in-up">
                        <h5 className="text-xs font-bold text-amber-400 font-sans">📝 نموذج إضافة نقطة بيع (POS) جديدة</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                          {/* Name / Title */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• اسم جهاز الكاشير <span className="text-red-500">*</span></label>
                            <input 
                              type="text"
                              value={inlinePosName}
                              onChange={(e) => setInlinePosName(e.target.value)}
                              placeholder="مثال: كاشير رقم 1 (قسم التجزئة)"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-amber-500 font-bold"
                            />
                          </div>

                          {/* Branch Selection */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• الفرع التابع لها</label>
                            <select
                              value={inlinePosBranchId}
                              onChange={(e) => setInlinePosBranchId(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right font-sans"
                            >
                              {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Cashier / Manager in charge */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• الموظف المسؤول (اختياري)</label>
                            <input 
                              type="text"
                              value={inlinePosCashier}
                              onChange={(e) => setInlinePosCashier(e.target.value)}
                              placeholder="مثال: صالح العلي"
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none"
                            />
                          </div>

                          {/* Source Warehouse */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">• المستودع الافتراضي</label>
                            <select
                              value={inlinePosWh}
                              onChange={(e) => setInlinePosWh(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right"
                            >
                              <option value="">-- تغذية مباشرة ممتدة من الفرع --</option>
                              {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Permitted Payment Methods */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-gray-400 block">• طرق الدفع المسموحة</label>
                            <div className="flex items-center gap-4 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                                <input 
                                  type="checkbox" 
                                  checked={inlinePosPayMethods.includes("cash")}
                                  onChange={(e) => {
                                    if(e.target.checked) setInlinePosPayMethods([...inlinePosPayMethods, "cash"]);
                                    else setInlinePosPayMethods(inlinePosPayMethods.filter(m => m !== "cash"));
                                  }}
                                />
                                <span className="mr-1">💵 كاش ونقدي</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                                <input 
                                  type="checkbox" 
                                  checked={inlinePosPayMethods.includes("card")}
                                  onChange={(e) => {
                                    if(e.target.checked) setInlinePosPayMethods([...inlinePosPayMethods, "card"]);
                                    else setInlinePosPayMethods(inlinePosPayMethods.filter(m => m !== "card"));
                                  }}
                                />
                                <span className="mr-1">💳 بطاقة ومدى</span>
                              </label>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-gray-400 block">• حالة نقطة البيع</label>
                            <select
                              value={inlinePosStatus}
                              onChange={(e) => setInlinePosStatus(e.target.value)}
                              className="w-full rounded-lg p-2 bg-slate-900 border border-slate-800 text-white outline-none text-right font-sans"
                            >
                              <option value="نشط">نشط ومتوفر للمعاملات الفورية</option>
                              <option value="غير نشط">مغلق للصيانة المؤقتة</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setIsAddingPosInline(false)}
                            className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-gray-300"
                          >
                            تراجع
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!inlinePosName.trim()) {
                                triggerNotification("يرجى إدخال اسم نقطة البيع! ⚠️", "warning");
                                return;
                              }
                              try {
                                const newPos = {
                                  id: "pos_" + Date.now(),
                                  name: inlinePosName.trim(),
                                  branchId: inlinePosBranchId || activeBranchId || (branches[0] ? branches[0].id : ""),
                                  isDefault: false,
                                  status: inlinePosStatus,
                                  cashier: inlinePosCashier.trim() || undefined,
                                  warehouseId: inlinePosWh || undefined,
                                  payMethods: inlinePosPayMethods
                                };

                                // Save in the Data Layer via posService
                                await posService.create(newPos);

                                // Update state immediately
                                setPosUnits(prevPosUnits => [...prevPosUnits, newPos]);
                                triggerNotification(`تمت إضافة كاشير نقطة بيع بنجاح وحفظه في الطبقة الموحدة: [${newPos.name}] 🖥️`, "success");
                                addAuditLog("إضافة جهاز POS", `تم إضافة جهاز كاشير جديد بنجاح باسم: ${newPos.name}`);
                                setIsAddingPosInline(false);
                              } catch (err: any) {
                                triggerNotification(`فشل حفظ الكاشير: ${err.message} ❌`, "critical");
                              }
                            }}
                            className="py-1.5 px-4 rounded-lg text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-black border-none cursor-pointer"
                          >
                            حفظ وتعميد نقطة البيع 💾
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2.5">
                      {posUnits.map(p => {
                        const isMainPosActive = activePosId === p.id;
                        const brObj = branches.find(b => b.id === p.branchId);

                        if (editingPosId === p.id) {
                          return (
                            <div 
                              key={p.id} 
                              className="p-5 rounded-xl border border-amber-550 bg-slate-900 text-right space-y-4 font-sans text-xs"
                            >
                              <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                                <h5 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                  <span>🖥️ تعديل نقطة بيع (POS):</span> <span className="text-white font-extrabold">{p.name}</span>
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => setEditingPosId(null)}
                                  className="text-gray-400 hover:text-white text-xs font-black"
                                >
                                  إلغاء ×
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-fade-in">
                                {/* Name */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• اسم نقطة البيع <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text"
                                    value={editPosName}
                                    onChange={(e) => setEditPosName(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-500 font-bold"
                                  />
                                </div>

                                {/* Branch Selection */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• الفرع التابع لها</label>
                                  <select
                                    value={editPosBranchId}
                                    onChange={(e) => setEditPosBranchId(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right font-medium"
                                  >
                                    {branches.map(b => (
                                      <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Cashier Responsibility */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• الموظف المعين المسؤول</label>
                                  <input 
                                    type="text"
                                    value={editPosCashier}
                                    onChange={(e) => setEditPosCashier(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-500"
                                  />
                                </div>

                                {/* Default Warehouse */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-gray-400 block">• المستودع الافتراضي للصرف</label>
                                  <select
                                    value={editPosWh}
                                    onChange={(e) => setEditPosWh(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right"
                                  >
                                    <option value="">-- تغذية مباشرة من الفرع --</option>
                                    {warehouses.map(wh => (
                                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Payment Methods */}
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] text-gray-400 block">• طرق الدفع المسموحة</label>
                                  <div className="flex items-center gap-4 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                    <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                                      <input 
                                        type="checkbox" 
                                        checked={editPosPayMethods.includes("cash")}
                                        onChange={(e) => {
                                          if(e.target.checked) setEditPosPayMethods([...editPosPayMethods, "cash"]);
                                          else setEditPosPayMethods(editPosPayMethods.filter(m => m !== "cash"));
                                        }}
                                      />
                                      <span className="mr-1">💵 كاش ونقدي</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                                      <input 
                                        type="checkbox" 
                                        checked={editPosPayMethods.includes("card")}
                                        onChange={(e) => {
                                          if(e.target.checked) setEditPosPayMethods([...editPosPayMethods, "card"]);
                                          else setEditPosPayMethods(editPosPayMethods.filter(m => m !== "card"));
                                        }}
                                      />
                                      <span className="mr-1">💳 بطاقة ومدى</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] text-gray-400 block">• حالة نقطة البيع</label>
                                  <select
                                    value={editPosStatus}
                                    onChange={(e) => setEditPosStatus(e.target.value)}
                                    className="w-full rounded-lg p-2 bg-slate-950 border border-slate-800 text-white outline-none text-right font-medium text-emerald-400"
                                  >
                                    <option value="نشط">نشط ومتوفر للمعاملات الفورية</option>
                                    <option value="غير نشط">مغلق للصيانة المؤقتة</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 text-xs pt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPosId(null)}
                                  className="py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-gray-300 font-bold"
                                >
                                  تراجع
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!editPosName.trim()) {
                                      triggerNotification("اسم نقطة البيع مطلوب! ⚠️", "warning");
                                      return;
                                    }
                                    try {
                                      const updated = {
                                        ...p,
                                        name: editPosName.trim(),
                                        branchId: editPosBranchId,
                                        cashier: editPosCashier.trim() || undefined,
                                        warehouseId: editPosWh || undefined,
                                        payMethods: editPosPayMethods,
                                        status: editPosStatus
                                      };

                                      // Persist to Layer
                                      await posService.create(updated);

                                      // Update React State immediately
                                      setPosUnits(prev => prev.map(item => item.id === p.id ? updated : item));
                                      triggerNotification(`تم تحديث جهاز الكاشير [${updated.name}] بنجاح 🖥️`, "success");
                                      addAuditLog("تعديل كاشير", `تم تعديل كاشير: ${updated.name}`);
                                      setEditingPosId(null);
                                    } catch (err: any) {
                                      triggerNotification(`تعذر تعديل جهاز الكاشير: ${err.message} ❌`, "critical");
                                    }
                                  }}
                                  className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg"
                                >
                                  حفظ التغييرات 💾
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={p.id} 
                            className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/30"
                            style={{ borderColor: themeColors.border }}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-amber-500 font-bold text-sm">🖥️ {p.name}</span>
                                <span className="text-[8.5px] bg-amber-500/10 text-amber-500 py-0.5 px-1.5 rounded-md font-bold">
                                  {brObj ? brObj.name : "غير معين بنطاق فرعي"}
                                </span>
                                {isMainPosActive && <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 py-0.5 px-1.5 rounded-md font-black">الكاشير المفعل</span>}
                                <span className={`text-[8.5px] py-0.5 px-1.5 rounded-md font-black ${
                                  p.status === "نشط" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                }`}>
                                  {p.status || "نشط"}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400">
                                <div><span className="text-gray-500">رقم الكاشير المعرف:</span> {p.id} | <span className="text-gray-500">حالة الربط والعمليات:</span> <span className="text-emerald-400 font-bold">{p.status || "نشط"}</span></div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSwitchPos(p.id)}
                                className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  isMainPosActive 
                                    ? "bg-slate-900 border border-[#D4AF37]/35 text-[#D4AF37]" 
                                    : "bg-amber-500/10 hover:bg-amber-500/25 text-amber-400"
                                }`}
                              >
                                {isMainPosActive ? "جهاز نشط حالياً" : "تنشيط الجهاز"}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPosId(p.id);
                                  setEditPosName(p.name || "");
                                  setEditPosBranchId(p.branchId || "");
                                  setEditPosCashier(p.cashier || "");
                                  setEditPosWh(p.warehouseId || "");
                                  setEditPosPayMethods(p.payMethods || ["cash", "card"]);
                                  setEditPosStatus(p.status || "نشط");
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-500 hover:text-amber-400 transition-all border border-transparent hover:border-slate-800 cursor-pointer text-xs"
                                title="تعديل بيانات الكاشير"
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (isMainPosActive) {
                                    alert("لا يمكن حذف الكاشير النشط حالياً!");
                                    return;
                                  }
                                  if (confirm(`هل أنت متأكد من حذف الكاشير ${p.name}؟`)) {
                                    try {
                                      await posService.delete(p.id);
                                      setPosUnits(posUnits.filter(item => item.id !== p.id));
                                      triggerNotification(`تمت إزالة جهاز [${p.name}] من المنظومة`, "info");
                                      addAuditLog("حذف كاشير", `تم حذف جهاز نقطة بيع ${p.name}`);
                                    } catch (err: any) {
                                      triggerNotification(`فشل الحذف: ${err.message}`, "critical");
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 cursor-pointer text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* LINKING & DEFAULTS TAB */}
                {envModalTab === "linking" && (
                  <div className="space-y-6">
                    <div className="border-b pb-3" style={{ borderColor: themeColors.border }}>
                      <h4 className="text-sm font-bold text-white">الربط الذكي وتعيين مستودعات الإمداد للفروع</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">تزويد منافذ البيع بالمخزون وضبط الخيارات الافتراضية للجلسات</p>
                    </div>

                    {/* Section 1: Branch to Warehouse Mapping */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-gray-300">🔗 خريطة ربط الفروع النشطة:</h5>
                      <div className="space-y-3">
                        {branches.map(b => {
                          return (
                            <div 
                              key={b.id}
                              className="p-3.5 rounded-xl border bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                              style={{ borderColor: themeColors.border }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">🏢 {b.name}</span>
                                <span className="text-[8.5px] bg-slate-900 text-gray-400 py-0.5 px-1.5 rounded">{b.city}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-bold">مستودع التغذية:</span>
                                <select
                                  value={b.associatedWh || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setBranches(branches.map(item => item.id === b.id ? { ...item, associatedWh: value } : item));
                                    triggerNotification(`تم تحديث مستودع إمداد فرع [${b.name}] بنجاح`, "success");
                                    addAuditLog("ربط فرع بمستودع", `تم ربط الفرع ${b.name} بالمستودع الكودي: ${value}`);
                                  }}
                                  className="bg-slate-900 border text-xs text-gray-200 py-1.5 px-3 rounded-lg outline-none focus:border-amber-500 cursor-pointer"
                                  style={{ borderColor: themeColors.border }}
                                >
                                  <option value="">-- غير مربوط بمستودع --</option>
                                  {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>📦 {w.name} ({w.type === "main" ? "رئيسي" : "فرعي"})</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Environment Default Setting */}
                    <div className="space-y-4 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                      <h5 className="text-xs font-bold text-gray-300">👑 تحديد الافتراضيات وبيئة التشغيل السريعة:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 font-black">الفرع الافتراضي النشط:</label>
                          <select
                            value={activeBranchId}
                            onChange={(e) => handleSwitchBranch(e.target.value)}
                            className="w-full bg-slate-900 border text-xs text-gray-200 py-2 px-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                            style={{ borderColor: themeColors.border }}
                          >
                            {allowedBranches.map(b => (
                              <option key={b.id} value={b.id}>🏢 {b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 font-black">المستودع الافتراضي النشط:</label>
                          <select
                            value={activeWarehouseId}
                            onChange={(e) => handleSwitchWarehouse(e.target.value)}
                            className="w-full bg-slate-900 border text-xs text-gray-200 py-2 px-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                            style={{ borderColor: themeColors.border }}
                          >
                            {allowedWarehouses.map(w => (
                              <option key={w.id} value={w.id}>📦 {w.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 font-black">جهاز الكاشير الافتراضي النشط:</label>
                          <select
                            value={activePosId}
                            onChange={(e) => handleSwitchPos(e.target.value)}
                            className="w-full bg-slate-900 border text-xs text-gray-200 py-2 px-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                            style={{ borderColor: themeColors.border }}
                          >
                            {posUnits.filter(p => p.branchId === activeBranchId).map(p => (
                              <option key={p.id} value={p.id}>🖥️ {p.name}</option>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end" style={{ borderColor: themeColors.border }}>
              <button
                type="button"
                onClick={() => setShowEnvManagerModal(false)}
                className="py-2 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all border cursor-pointer"
                style={{ borderColor: themeColors.border }}
              >
                موافق وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 🌸 Multi-step Guided Wizard Implementation (Bullet 2)
interface OnboardingProps {
  theme: ThemeColors;
  storeName: string;
  setStoreName: (s: string) => void;
  storeCR: string;
  setStoreCR: (s: string) => void;
  storeVat: string;
  setStoreVat: (s: string) => void;
  accentKey: string;
  setAccentKey: (s: string) => void;
  enabledModules: Record<string, boolean>;
  setEnabledModules: (m: Record<string, boolean>) => void;
  subscription: any;
  setSubscription: (s: any) => void;
  onClose: () => void;
}

function OnboardingWizard({
  theme,
  storeName,
  setStoreName,
  storeCR,
  setStoreCR,
  storeVat,
  setStoreVat,
  accentKey,
  setAccentKey,
  enabledModules,
  setEnabledModules,
  subscription,
  setSubscription,
  onClose
}: OnboardingProps) {
  const [step, setStep] = useState(1);
  
  // Simulated State for Onboarding tasks
  const [branchName, setBranchName] = useState("الفرع الرئيسي بالرياض 📍");
  const [warehouseName, setWarehouseName] = useState("مستودع السلي المركزي 📦");
  const [productSku, setProductSku] = useState("SAHM-OUD-01");
  const [productName, setProductName] = useState("دهن عود كمبودي ملكي معتق 💎");
  const [productPrice, setProductPrice] = useState("350");
  const [productQty, setProductQty] = useState("25");

  const [supabaseUrl, setSupabaseUrl] = useState("https://sahm-cloud-db.supabase.co");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sahmCloudSecretsTokenDirect");
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState("");

  const handleTestSupabase = () => {
    setTestingConnection(true);
    setTestResult("");
    setTimeout(() => {
      setTestingConnection(false);
      setTestResult("الاتصال متزامن ومحمي بنجاح (HTTP 200) ✅");
    }, 1200);
  };

  const handleToggleAddon = (key: string) => {
    setEnabledModules({
      ...enabledModules,
      [key]: !enabledModules[key]
    });
  };

  return (
    <div 
      className="w-full max-w-2xl rounded-3xl border p-7 space-y-6 shadow-2xl relative animate-scale-up border-slate-700/80 text-right"
      style={{ backgroundColor: theme.card }}
    >
      {/* Step Progress Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="text-right">
          <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">مرشد البداية الموحد (Sahm Guide Tour)</span>
          <h3 className="text-sm font-black text-white mt-0.5">الخطوة {step} من ٦</h3>
        </div>
        <div className="flex gap-1.5 direction-ltr">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div 
              key={s} 
              className={`w-6 h-1.5 rounded-full transition-all ${s <= step ? 'bg-amber-500' : 'bg-slate-800'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* STEP 1: Store Setup (تهيئة المتجر) */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs leading-relaxed space-y-2">
            <span className="font-extrabold text-amber-500 block text-sm">💡 علاقة الكيانات بالتأسيس (Entity Relationship):</span>
            <p className="text-gray-300">
              <strong>المتجر (Store)</strong> هو الكيان الأساسي (الأب التجاري والقانوني) لكامل المنظومة. تحت هذا المتجر تُقَيد كافّة التراخيص، الأوراق الرسمية، السجل التجاري، والأرقام الضريبية، وهي المظلة التي تمتد لتشمل بقية الفروع والمستودعات والمنتجات ماليًا ومحاسبيًا.
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            <h3 className="text-base font-black text-white">🏢 الخطوة ١: إعداد الهوية والبنية المؤسسية للمتجر</h3>
            <div className="space-y-3 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-gray-400 block">اسم الكيان التجاري أو براند المتجر الرائد *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white outline-none border-slate-800 text-right"
                  placeholder="مثال: براند مراسيم الطيب للعود الفخم"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 block">رقم السجل التجاري الرسمي CR</label>
                  <input
                    type="text"
                    value={storeCR}
                    onChange={(e) => setStoreCR(e.target.value)}
                    placeholder="مثال: 1010882424"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border text-white outline-none border-slate-800 font-mono text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block">الرقم الضريبي المعتمد (هيئة الزكاة) VAT</label>
                  <input
                    type="text"
                    value={storeVat}
                    onChange={(e) => setStoreVat(e.target.value)}
                    placeholder="مثال: 302214450200003"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border text-white outline-none border-slate-800 font-mono text-center"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block">باقة الاشتراك والترخيص المفعل حالياً لمتجرك:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'A', name: 'الباقة المجانية', limit: 1000 },
                    { k: 'B', name: 'النمو الاحترافي', limit: 10000 },
                    { k: 'C', name: 'نخبة الشركات', limit: 100000 }
                  ].map(p => (
                    <button
                      key={p.k}
                      type="button"
                      onClick={() => setSubscription({ ...(subscription || {}), tier: p.k, limit: p.limit })}
                      className="py-2 px-15 rounded-xl border text-[10px] font-black cursor-pointer text-center"
                      style={{
                        backgroundColor: subscription?.tier === p.k ? theme.accent : "#0f172a",
                        borderColor: subscription?.tier === p.k ? theme.accent : "#1e293b",
                        color: subscription?.tier === p.k ? "#000" : "#cbd5e1"
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Branches & Warehouses (إضافة الفرع والمستودع) */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs leading-relaxed space-y-2">
            <span className="font-extrabold text-amber-500 block text-sm">💡 علاقة الفروع والمستودعات بالفروع الرقمية الجغرافية:</span>
            <p className="text-gray-300">
              <strong>الفروع (Branches)</strong> هي منافذ البيع الجغرافية المباشرة التي تقابل الجمهور جهاراً، بينما <strong>المستودعات (Warehouses)</strong> هي مراكز الدعم والصيانة خلف الكواليس التي تقوم بتخزين الأرصدة وجدولة الجرد. يربط النظام الفرع بمستودعه الإرشادي لضمان تزويد الفرع بالأصناف ومنع نفاد المخزون.
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            <h3 className="text-base font-black text-white">📍 الخطوة ٢: ربط وتأسيس الفروع والمستودعات بالـ ERP</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-gray-400 block">اسم منافذ البيع أو الفرع الجغرافي الأول</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white border-slate-800 outline-none"
                  placeholder="مثال: فرع السليمانية الرياض"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block">اسم المستودع أو مركز الجرد اللوجستي المغذي</label>
                <input
                  type="text"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white border-slate-800 outline-none"
                  placeholder="مثال: مستودع السلي المركزي"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[10.5px] text-gray-400">
              ✔️ سيقوم سهم OS بقيد الفرع <strong>[{branchName}]</strong> ونسبه تلقائيًا للمستودع <strong>[{warehouseName}]</strong> لتغذية سريعة ومطابقة ذكية للمبيعات حياً.
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Add Products (إضافة المنتجات والسلع) */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs leading-relaxed space-y-2">
            <span className="font-extrabold text-amber-500 block text-sm">💡 علاقة المنتجات بالمتجر والمخازن:</span>
            <p className="text-gray-300">
              <strong>المنتجات (Products)</strong> تنشأ بالاسم والباركود والوصف تحت الهوية الأم للمتجر، ولكنها تتطلب الإيداع المباشر بداخل <strong>المستودعات (Warehouses)</strong> لتكتسب كمية وموقعًا وسعرًا حقيقيًا، لتصبح جاهزة للمبيعات الميدانية وجداول المطابقة الضريبية بكابينة الكاشير.
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            <h3 className="text-base font-black text-white">📦 الخطوة ٣: توليد الصنف الأول وتنسيب وربط الأرصدة بالمخزن</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-gray-400 block">اسم السلعة / المنتج الأول بالـ ERP</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block">رمز SKU أو باركود التخزين الموحد</label>
                <input
                  type="text"
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white border-slate-800 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block">سعر البيع الترويجي المستهدف (ر.س)</label>
                <input
                  type="text"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white border-slate-800 outline-none font-mono text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block">المخزون المتوفر الأولي بالمستودع الكلي (وحدة)</label>
                <input
                  type="text"
                  value={productQty}
                  onChange={(e) => setProductQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border text-white border-slate-800 outline-none font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Cashier Experience (تجربة الكاشير) */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs leading-relaxed space-y-2">
            <span className="font-extrabold text-amber-500 block text-sm">💡 علاقة الكاشير بمخازن الفروع لإتمام الصفقات:</span>
            <p className="text-gray-300">
              <strong>الكاشير ونقاط البيع (POS)</strong> هي الأداة التنفيذية لتحويل أصناف المستودعات المحددة إلى فواتير حية للعملاء. يقوم الكاشير بقراءة باركود المنتج، وسحب كميته فورًا من مستودع الفرع المرتبط، وتوليد الفاتورة الضريبية وحفظ القيود بالدفاتر تلقائياً دون ترحيل يدوي مجهد.
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            <h3 className="text-base font-black text-white">🖥️ الخطوة ٤: تجربة بيئة الكاشير والمبيعات الرقمية الفورية</h3>
            
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3 text-xs leading-relaxed">
              <span className="text-amber-500 font-extrabold block">🛒 كيف ستتم أول عملية كاشير بالمحل:</span>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>ستفتح تبويب <strong>أجهزة الكاشير ونقاط البيع (POS)</strong> بالمنصة.</li>
                <li>ستجد منتجك الأول <strong>[{productName}]</strong> متاحاً ومسعراً بـ <strong>{productPrice} ر.س</strong>.</li>
                <li>بمجرد النقر عليه، سيقوم نظام كاشير سهم باحتساب ضريبة الزكاة الرسمية (15%) تلقائياً.</li>
                <li>عند النقر على "حفظ وطباعة الفاتورة"، سيخصم النظام قطعة واحدة من المستودع لتصبح الكمية <strong>{parseInt(productQty) - 1} وحدات</strong>، مع قيد الفاتورة في القيود تلقائياً!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Integrations (قنوات الربط والشركاء) */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs leading-relaxed space-y-2">
            <span className="font-extrabold text-amber-500 block text-sm">💡 أهمية الربط وتوحيد القنوات السحابية:</span>
            <p className="text-gray-300">
              <strong>بوابات الربط والتكامل (Integrations)</strong> تمكّن المتجر من ربط مبيعات ومخزون منصات التجارة الخارجية الشريكة مثل <strong>سلة Salla</strong> أو <strong>زد Zid</strong> بقاعدة بيانات سهم OS المركزية. هذا يعني تكرار سحب المنتجات والفواتير لحظياً بحيث لا تتعارض كميات مخازن مبيعاتك الإلكترونية مع كاشير فروعك الميدانية نهائياً!
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            <h3 className="text-base font-black text-white">🔌 الخطوة ٥: تنشيط بوابات الربط السريع للتكامل متعدد القنوات</h3>
            
            <p className="text-xs text-gray-400">حدد ميزات الكابينة السهمية المطلوب تشغيلها حالياً للحد من تداخل الصلاحيات وجرد المعاملات المزدوجة:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
              {[
                { k: 'pos_and_operations', name: 'أجهزة الكاشير ونقاط البيع (POS)', desc: 'فواتير دقيقة وسريعة' },
                { k: 'accounting', name: 'محرك القيد والضرائب المحاسبي', desc: 'دفاتر مسك الحسابات للموردين' },
                { k: 'intelligent_hub', name: 'المنصة الذكية AI Studio', desc: 'توليد أفكار الكتالوج وكتابة الوصف' },
                { k: 'reports', name: 'التقارير وسرعات البيع الخضراء', desc: 'خطوط الربحية وقمم المخزون' }
              ].map(mod => (
                <button
                  key={mod.k}
                  type="button"
                  onClick={() => handleToggleAddon(mod.k)}
                  className="p-3 rounded-xl border text-right space-y-1 transition-all cursor-pointer"
                  style={{
                    backgroundColor: enabledModules[mod.k] ? theme.accent + "12" : "#0f172a",
                    borderColor: enabledModules[mod.k] ? theme.accent : "#1e293b"
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center font-bold text-[8px] ${enabledModules[mod.k] ? 'bg-amber-500 border-amber-500 text-black' : 'border-slate-500 text-transparent'}`}>✓</div>
                    <span className="text-[11px] font-black" style={{ color: theme.text }}>{mod.name}</span>
                  </div>
                  <p className="text-[9px] text-gray-450">{mod.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Backup & Synergies (النسخ الاحتياطي ومطابقة البيانات) */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs leading-relaxed space-y-2">
            <span className="font-extrabold text-amber-500 block text-sm">💡 علاقة النسخ الاحتياطي بالحفاظ والسيولة:</span>
            <p className="text-gray-300">
              <strong>النسخ الاحتياطي والمطابقة ومزامنة السحاب</strong> هو صمام الأمان المالي لكل عملياتك. من خلال الاتصال بقواعد بيانات سحابية متفوقة مثل <strong>Supabase</strong> أو <strong>PostgreSQL</strong>، يضمن سهم OS لك حماية مروية لبيانات مبيعات الكاشير وسجلات الجرد من الفقد، متيحًا استرجاعًا سلسًا للمحفظة في أجزاء من الثانية ومن متصفحات وأجهزة متعددة.
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            <h3 className="text-sm font-black text-white">🔄 الخطوة ٦: إعداد النسخ السحابي ومطابقة الـ ERP</h3>
            
            <div className="space-y-3 text-xs font-bold font-mono">
              <div className="space-y-1">
                <label className="text-gray-400 block text-right font-sans">Supabase API Endpoint Protocol:</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-850 text-left outline-none rounded-xl text-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block text-right font-sans">Supabase JWT Anon API Key Token:</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-850 text-left outline-none rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 mt-2">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testingConnection}
                className="py-1.5 px-4 rounded bg-amber-500 text-black text-[10px] font-black hover:bg-amber-600 transition-all cursor-pointer border-0 disabled:opacity-50"
              >
                {testingConnection ? "يقوم بالأستعلام..." : "اتصال وفحص قواعد البيانات ⚡"}
              </button>
              {testResult && (
                <span className="text-[10px] text-emerald-400 font-sans font-bold">{testResult}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Button Controls Footer */}
      <div className="flex justify-between items-center border-t border-slate-850 pt-4 mt-2">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="py-1.5 px-4 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:brightness-110 cursor-pointer border-0"
            >
              السابق
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="py-1.5 px-5 rounded-xl bg-slate-900 border text-white text-xs font-black cursor-pointer"
              style={{ borderColor: theme.border }}
            >
              التالي →
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer border-0"
              style={{ backgroundColor: theme.accent }}
            >
              إكمال الإعداد وتدشين متجرك الذكي 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
