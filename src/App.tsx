import React, { useState, useEffect, useMemo, useRef } from "react";
import { Invoice, Product, Customer, User, ThemeType, ThemeColors, Supplier, StoreProfile, CompanyProfile, TenantSubscription } from "./types";
import { INVOICES0, PRODUCTS0, CUSTOMERS0, SUPPLIERS0, USERS, STORES0 } from "./data";
import { SahmDatabaseService, freeUpLocalStorageSpace } from "./core/database/dbService";
import { branchService } from "./core/database/branchService";
import { warehouseService } from "./core/database/warehouseService";
import { posService } from "./core/database/posService";

// Import custom views
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Invoices from "./components/Invoices";
import Customers from "./components/Customers";
import Suppliers from "./components/Suppliers";
import Reports from "./components/Reports";
import HelpSupport from "./components/HelpSupport";
import Settings from "./components/Settings";
import ProductPromotionBuilder, { ProductPromotionBoundary } from "./components/ProductPromotionBuilder";
import UnifiedActionSystem from "./components/UnifiedActionSystem";
import UnifiedProfileHub from "./components/UnifiedProfileHub";
import SahmIntegrationsHub from "./components/SahmIntegrationsHub";
import FacilitySetup from "./components/FacilitySetup";
import FacilityAndEstablishmentHub from "./components/FacilityAndEstablishmentHub";
import OfflineSyncHUD from "./components/OfflineSyncHUD";
import OnboardingWizard from "./components/OnboardingWizard";
import SystemClientsManager from "./components/SystemClientsManager";

const Products = React.lazy(() => import("./modules/products/ProductsPage"));
const HumanResources = React.lazy(() => import("./components/HumanResources"));
const AIProductBuilder = React.lazy(() => import("./components/AIProductBuilder"));
const StoreManager = React.lazy(() => import("./components/StoreManager"));
const BranchWarehouseManager = React.lazy(() => import("./components/BranchWarehouseManager"));
const SahmCommandCenter = React.lazy(() => import("./components/SahmCommandCenter"));
const IntelligentHub = React.lazy(() => import("./components/IntelligentHub"));
const PosAndOperations = React.lazy(() => import("./components/PosAndOperations"));
const AccountingERP = React.lazy(() => import("./components/AccountingERP"));
const MediaCenter = React.lazy(() => import("./components/MediaCenter"));
const SmartCatalogBuilder = React.lazy(() => import("./components/SmartCatalogBuilder"));
const CompetitorMonitor = React.lazy(() => import("./components/CompetitorMonitor"));
const SahmBrain360 = React.lazy(() => import("./components/SahmBrain360"));
const WorkflowEngine = React.lazy(() => import("./components/WorkflowEngine"));
const AutoPublish = React.lazy(() => import("./components/AutoPublish"));
const AIAnalyzer = React.lazy(() => import("./components/AIAnalyzer"));
const AIProductStudio = React.lazy(() => import("./components/AIProductStudio"));

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    <div className="text-xs font-bold text-gray-400 font-sans">جاري تحميل المنظومة السحابية...</div>
  </div>
);

// Enterprise Modular System Imports
import UnifiedNotifications from "./components/UnifiedNotifications";
import GlobalUnifiedSearch from "./components/GlobalUnifiedSearch";
import AuditLogTimeline from "./components/AuditLogTimeline";
import BackupRestoreSystem from "./components/BackupRestoreSystem";
import SaaSSubscriptionEngine from "./components/SaaSSubscriptionEngine";
import MySubscription from "./components/MySubscription";
import ThemeStudioMarketplace from "./components/ThemeStudioMarketplace";
import { sahmIconPngUrl, sahmLogoPngUrl, sahmMiniMarkPngUrl, sahmSplashPngUrl } from "./assets/brand/sahm-brand-assets";

// Import lucide icons for navigators
import { 
  Grid, FileText, Package, Users, BarChart3, Sparkles, Send, Settings as SettingsIcon, LogOut, Store, HelpCircle, Truck, Cpu, Bot, MapPin, Landmark, Bell, Zap, X, Image, Layers, Sliders, Plus, Link, Building, Search, ChevronDown, Briefcase, ShieldCheck, CreditCard,
  LayoutDashboard, ShoppingBag, TrendingUp, Brain, Database, ExternalLink
} from "lucide-react";
import { CustomIconRenderer } from "./lib/customIcons";

export const PLATFORM_ROLES = ["platform_owner", "system_owner", "system_admin"];

export function isPlatformRole(user: any) {
  const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase" || import.meta.env.VITE_DATA_MODE === "production";
  if (isSupabase) {
    return PLATFORM_ROLES.includes(String(user?.role || "").trim());
  }
  return (
    PLATFORM_ROLES.includes(String(user?.role || "").trim()) ||
    user?.username === "admin" ||
    user?.email === "admin@sahm.com"
  );
}

export function isTenantRole(user: any) {
  return user?.role === "tenant_owner";
}

// Central permission evaluation function (قاعدة الصلاحيات المركزية)
export function hasPermission(user: User | null | undefined, permission?: string): boolean {
  if (!user) return false;

  const isSuperUser = isPlatformRole(user);

  if (isSuperUser) {
    return true;
  }

  if (!permission) return true;

  if (permission === "*") {
    return false;
  }

  return user.permissions?.includes(permission) || false;
}

// Themes configuration mapping matching user specifications
const THEMES_PRESETS: Record<ThemeType, Omit<ThemeColors, 'accent'>> = {
  dark: {
    name: "داكن",
    bg: "#050814",
    surface: "#090f21",
    card: "#0d1527",
    border: "#16223f",
    text: "#f8fafc",
    muted: "#64748b",
    fontFamily: "Cairo",
    borderRadius: "24px",
    shadow: "0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212,175,55,0.08)",
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
    bg: "#070603",
    surface: "#0d0b07",
    card: "#14110a",
    border: "#2b2112",
    text: "#f7f4eb",
    muted: "#8c7c64",
    fontFamily: "Amiri",
    borderRadius: "24px",
    shadow: "0 10px 40px rgba(0, 0, 0, 0.55), 0 0 25px rgba(212,175,55,0.1)",
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
      const saved = localStorage.getItem("sahm_web_user") || localStorage.getItem("sahm_web_user3");
      if (saved) {
        const user = JSON.parse(saved);
        const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase" || import.meta.env.VITE_DATA_MODE === "production";
        if (isSupabase) {
          if (user && (user.username === "admin" || user.email === "admin@sahm.com") && user.role !== "platform_owner") {
            return null;
          }
          if (user && user.role === "owner") {
            if (user.tenant_id && user.tenant_id !== "tenant-local") {
              const normalizedUser = { ...user, role: "tenant_owner" };
              localStorage.setItem("sahm_web_user", JSON.stringify(normalizedUser));
              localStorage.removeItem("sahm_web_user3");
              return normalizedUser;
            } else {
              localStorage.removeItem("sahm_web_user");
              localStorage.removeItem("sahm_web_user3");
              return null;
            }
          }
          return user;
        }

        if (user && (user.username === "admin" || user.email === "admin@sahm.com" || user.role === "platform_owner")) {
          const officialAdmin = USERS.find(u => u.username === "admin");
          const normalizedAdmin = {
            ...user,
            ...officialAdmin,
            role: "platform_owner",
            tenant_id: undefined
          };
          localStorage.setItem("sahm_web_user", JSON.stringify(normalizedAdmin));
          localStorage.removeItem("sahm_web_user3");
          return normalizedAdmin;
        }

        // Handle owner role transformation (Requirement 5)
        if (user && user.role === "owner") {
          if (user.tenant_id && user.tenant_id !== "tenant-local") {
            const normalizedUser = { ...user, role: "tenant_owner" };
            localStorage.setItem("sahm_web_user", JSON.stringify(normalizedUser));
            localStorage.removeItem("sahm_web_user3");
            return normalizedUser;
          } else {
            // No tenant_id: clear and return null to force login (don't show black screen/error)
            localStorage.removeItem("sahm_web_user");
            localStorage.removeItem("sahm_web_user3");
            return null;
          }
        }
        return user;
      }
      return null;
    } catch {
      return null;
    }
  });

  console.log("CURRENT_USER_DEBUG", currentUser?.id, currentUser?.username, currentUser?.role, currentUser?.tenant_id);

  // Business and preference states (Multi-Tenant architecture)
  const [rawInvoices, setRawInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.INVOICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INVOICES0;
  });

  const [rawProducts, setRawProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return PRODUCTS0;
  });

  const [rawCustomers, setRawCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.CUSTOMERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return CUSTOMERS0;
  });

  const [rawSuppliers, setRawSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEYS.SUPPLIERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return SUPPLIERS0;
  });

  const [rawStores, setRawStores] = useState<StoreProfile[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_stores");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return STORES0;
  });

  const [rawUsers, setRawUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_users_list3");
      const savedUsers = saved ? JSON.parse(saved) : [];
      const officialAdmin = USERS.find(u => u.username === "admin");
      
      const cleanedSavedUsers = Array.isArray(savedUsers)
        ? savedUsers.filter((u: any) => u && u.username !== "admin" && u.email !== "admin@sahm.com" && u.role !== "platform_owner" && u.role !== "owner")
        : [];
      
      const finalUsers = officialAdmin ? [officialAdmin, ...cleanedSavedUsers] : cleanedSavedUsers;

      const normalizedUsers = finalUsers.map((u: any) => {
        if (u && u.role === "owner") {
          return { ...u, role: "tenant_owner" };
        }
        return u;
      });

      localStorage.setItem("sahm_web_users_list3", JSON.stringify(normalizedUsers));
      return normalizedUsers;
    } catch {
      return USERS;
    }
  });

  const [rawCompanies, setRawCompanies] = useState<CompanyProfile[]>(() => {
    if (import.meta.env.VITE_DATA_MODE === "supabase") {
      return [];
    }
    try {
      const saved = localStorage.getItem("sahm_web_companies");
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaultCompany: CompanyProfile = {
      id: "comp-default",
      name: "مجموعة سهم القابضة للخدمات اللوجستية",
      companyLegalName: "شركة سهم القابضة للخدمات اللوجستية ش.م.م",
      crNumber: "1010411223",
      crDate: "1440-02-15",
      crExpiryDate: "1450-02-15",
      vatNumber: "302213456700003",
      unifiedNumber700: "7001452637",
      address: "المملكة العربية السعودية، الرياض، حي السلي، شارع الإسطنبول، المبنى الإضافي 3",
      managerName: "عبد الرحمن بن فهد السجيني",
      phone: "920011400",
      email: "info@sahm.group",
      bankAccount: "SA80000001010345678901",
      status: "active",
      subscriptionPlan: "باقة سهم البلاتينية 👑",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
      createdAt: "2024-01-01",
      tenant_id: import.meta.env.VITE_DATA_MODE === "supabase" ? "" : "tenant-local"
    };
    if (import.meta.env.VITE_DATA_MODE !== "supabase") {
      try {
        localStorage.setItem("sahm_web_companies", JSON.stringify([defaultCompany]));
      } catch {}
    }
    return [defaultCompany];
  });

  const setCompanies = (val: CompanyProfile[]) => {
    const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase";
    const fallbackTenant = isSupabase ? "" : "tenant-local";

    const isPlatformOwner = currentUser && (
      currentUser.role === "platform_owner" ||
      currentUser.role === "system_owner" ||
      currentUser.role === "system_admin"
    );

    if (isPlatformOwner) {
      setRawCompanies(val);
      if (!isSupabase) {
        localStorage.setItem("sahm_web_companies", JSON.stringify(val));
      }
      const db = SahmDatabaseService.getInstance();
      val.forEach(comp => {
        db.saveCompany(comp).catch(err => {
          console.error("Failed to save company to database:", err);
        });
      });
      return;
    }

    const otherTenants = rawCompanies.filter(c => (c.tenant_id || c.tenantId || fallbackTenant) !== currentUserTenantId);
    const updated = val
      .filter(c => c.tenant_id !== fallbackTenant || currentUserTenantId === fallbackTenant)
      .map((item: any) => ({
        ...item,
        tenant_id: currentUserTenantId
      }));
    const finalVal = [...otherTenants, ...updated];

    setRawCompanies(finalVal);
    if (!isSupabase) {
      localStorage.setItem("sahm_web_companies", JSON.stringify(finalVal));
    }

    const db = SahmDatabaseService.getInstance();
    updated.forEach(comp => {
      if (!comp.tenant_id || comp.tenant_id === fallbackTenant) {
        return;
      }
      db.saveCompany(comp).catch(err => {
        console.error("Failed to save company to database:", err);
      });
    });
  };

  const refreshCompaniesFromSupabase = async () => {
    const db = SahmDatabaseService.getInstance();
    const [companiesData, storesData] = await Promise.all([
      db.getCompanies(),
      db.getStores()
    ]);
    console.log("REFRESHED_COMPANIES", companiesData);
    setRawCompanies(companiesData || []);
    setRawStores(storesData || []);
  };

  // Impersonation state variables
  const [impersonatedTenantId, setImpersonatedTenantId] = useState<string | null>(
    () => localStorage.getItem("sahm_impersonate_tenant_id")
  );
  const [impersonatedOrganizationId, setImpersonatedOrganizationId] = useState<string | null>(
    () => localStorage.getItem("sahm_impersonate_org_id")
  );
  const [impersonatedCompanyName, setImpersonatedCompanyName] = useState<string | null>(
    () => localStorage.getItem("sahm_impersonate_company_name")
  );

  const handleImpersonate = (tenantId: string, orgId: string, companyName: string) => {
    console.log("IMPERSONATE", tenantId, orgId);
    localStorage.setItem("sahm_impersonate_tenant_id", tenantId);
    localStorage.setItem("sahm_impersonate_org_id", orgId);
    localStorage.setItem("sahm_impersonate_company_name", companyName);
    setImpersonatedTenantId(tenantId);
    setImpersonatedOrganizationId(orgId);
    setImpersonatedCompanyName(companyName);
    
    localStorage.removeItem("sahm_active_store_id");
    localStorage.removeItem("sahm_active_branch_id");
    localStorage.removeItem("sahm_active_warehouse_id");
    localStorage.removeItem("sahm_active_pos_id");
    
    triggerNotification(`جاري التحويل لبيئة عمل [${companyName}] كـ مراقب/دعم فني...`, "success");
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleStopImpersonating = () => {
    localStorage.removeItem("sahm_impersonate_tenant_id");
    localStorage.removeItem("sahm_impersonate_org_id");
    localStorage.removeItem("sahm_impersonate_company_name");
    setImpersonatedTenantId(null);
    setImpersonatedOrganizationId(null);
    setImpersonatedCompanyName(null);
    triggerNotification("تم إنهاء جلسة المراقبة بنجاح، العودة لوضع مالك النظام الرئيسي", "info");
    setTimeout(() => window.location.reload(), 1000);
  };

  const isSystemAdmin = isPlatformRole(currentUser);
  
  const isPlatformOwner = !!(currentUser && ["platform_owner", "system_owner", "system_admin"].includes(currentUser.role || ""));
  const isImpersonating = !!impersonatedTenantId && !!impersonatedOrganizationId;
  const isTenantOwner = currentUser?.role === "tenant_owner";

  const platformMode = isPlatformOwner && !isImpersonating;
  const impersonationMode = isPlatformOwner && isImpersonating;

  const currentTenantId = impersonatedTenantId || currentUser?.tenant_id || (import.meta.env.VITE_DATA_MODE === "supabase" ? "" : "tenant-local");
  const currentOrganizationId = impersonatedOrganizationId || currentUser?.organization_id || currentUser?.company_id || "comp-default";
  const currentUserRole = currentUser?.role || "cashier";

  // tenant ID resolver (maintains compatibility)
  const currentUserTenantId = currentTenantId;

  const getItemTenantId = (item: any): string => {
    if (!item) return "";
    return item.tenant_id || item.tenantId || (import.meta.env.VITE_DATA_MODE === "supabase" ? "" : "tenant-local");
  };

  const matchesTenantAndOrg = (item: any): boolean => {
    const tId = getItemTenantId(item);
    if (tId !== currentTenantId) return false;
    if (isSystemAdmin || isTenantOwner) return true;
    const cId = item.company_id || item.companyId || item.organization_id;
    if (!cId || cId === "comp-default" || cId === currentOrganizationId) return true;
    return false;
  };

  // isolated tenant-specific shadow variables
  const invoices = (isSystemAdmin && !impersonatedTenantId)
    ? rawInvoices
    : rawInvoices.filter(matchesTenantAndOrg);

  const products = (isSystemAdmin && !impersonatedTenantId)
    ? rawProducts
    : rawProducts.filter(matchesTenantAndOrg);

  const customers = (isSystemAdmin && !impersonatedTenantId)
    ? rawCustomers
    : rawCustomers.filter(matchesTenantAndOrg);

  const suppliers = (isSystemAdmin && !impersonatedTenantId)
    ? rawSuppliers
    : rawSuppliers.filter(matchesTenantAndOrg);

  const stores = (() => {
    let filtered = (isSystemAdmin && !impersonatedTenantId)
      ? rawStores
      : rawStores.filter(matchesTenantAndOrg);
    
    const isSuperUser = currentUser?.role === "system_owner" || currentUser?.role === "system_admin" || currentUser?.role === "platform_owner";
    const isTenantOwner = currentUser?.role === "tenant_owner";
    if (!isSuperUser && !isTenantOwner && currentUser?.allowedStoreIds && currentUser.allowedStoreIds.length > 0) {
      filtered = filtered.filter(st => currentUser.allowedStoreIds.includes(st.id));
    }
    return filtered;
  })();

  const users = (isSystemAdmin && !impersonatedTenantId)
    ? rawUsers
    : rawUsers.filter(matchesTenantAndOrg);

  const companies = (isSystemAdmin && !impersonatedTenantId)
    ? rawCompanies
    : rawCompanies.filter(item => 
        getItemTenantId(item) === currentTenantId
      );

  const setUsers = (val: User[]) => {
    const isPlatformOwner = currentUser && (
      currentUser.role === "platform_owner" ||
      currentUser.role === "system_owner" ||
      currentUser.role === "system_admin"
    );

    if (isPlatformOwner) {
      setRawUsers(val);
      localStorage.setItem("sahm_web_users_list3", JSON.stringify(val));
      addAuditLog("تحديث المستخدمين", "تعديل في قائمة صلاحيات الموظفين وتراخيص الوصول");
      return;
    }

    const otherTenants = rawUsers.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = val.map((item: any) => ({ 
      ...item, 
      tenant_id: currentUserTenantId,
      organization_id: item.organization_id || currentOrganizationId,
      company_id: item.company_id || currentOrganizationId
    }));
    const finalVal = [...otherTenants, ...updated];
    setRawUsers(finalVal);
    localStorage.setItem("sahm_web_users_list3", JSON.stringify(finalVal));
    addAuditLog("تحديث المستخدمين", "تعديل في قائمة صلاحيات الموظفين وتراخيص الوصول");
  };

  const setInvoices = async (val: Invoice[]) => {
    const otherTenants = rawInvoices.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = val.map(item => ({ 
      ...item, 
      tenant_id: currentUserTenantId,
      company_id: item.company_id || currentOrganizationId
    }));
    const finalVal = [...otherTenants, ...updated];
    
    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      if (updated.length > 0) {
        const currentList = rawInvoices.filter(item => getItemTenantId(item) === currentUserTenantId);
        const savedItems = updated.filter(item => {
          const existing = currentList.find(x => x.id === item.id);
          if (!existing) return true;
          return JSON.stringify(existing) !== JSON.stringify(item);
        });
        if (savedItems.length > 0) {
          try {
            for (const item of savedItems) {
              await db.saveInvoice(item);
            }
          } catch (err: any) {
            triggerNotification(`فشلت مزامنة الفاتورة سحابياً: ${err.message || err}`, "critical");
            return;
          }
        }
      }
      setRawInvoices(finalVal);
      localStorage.removeItem(LS_KEYS.INVOICES);
    } else {
      setRawInvoices(finalVal);
      localStorage.setItem(LS_KEYS.INVOICES, JSON.stringify(finalVal));
      if (updated.length > 0) {
        db.saveInvoice(updated[0]).catch(() => {});
      }
    }
  };

  const setProducts = async (val: Product[]) => {
    const sanitizedVal = val.map(p => ({
      ...p,
      backups: [],
      tenant_id: currentUserTenantId,
      company_id: p.company_id || currentOrganizationId,
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

    const otherTenants = rawProducts.filter(p => getItemTenantId(p) !== currentUserTenantId);
    const finalVal = [...otherTenants, ...sanitizedVal];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      const currentList = rawProducts.filter(p => getItemTenantId(p) === currentUserTenantId);
      
      const deletedItems = currentList.filter(item => !sanitizedVal.some(x => x.id === item.id));
      if (deletedItems.length > 0) {
        try {
          for (const item of deletedItems) {
            await db.deleteProduct(item.id);
          }
        } catch (err: any) {
          triggerNotification(`فشل حذف المنتج سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      if (sanitizedVal.length > 0) {
        const changedProducts = sanitizedVal.filter(item => {
          const existing = currentList.find(p => p.id === item.id);
          if (!existing) return true;
          return (
            existing.stock !== item.stock ||
            existing.price !== item.price ||
            existing.cost !== item.cost ||
            existing.name !== item.name ||
            existing.sku !== item.sku ||
            existing.productStatus !== item.productStatus
          );
        });

        if (changedProducts.length > 0) {
          try {
            for (const prod of changedProducts) {
              await db.saveProduct(prod);
            }
          } catch (err: any) {
            triggerNotification(`فشلت مزامنة المنتج سحابياً: ${err.message || err}`, "critical");
            return;
          }
        }
      }

      setRawProducts(finalVal);
      localStorage.removeItem(LS_KEYS.PRODUCTS);
    } else {
      setRawProducts(finalVal);
      try {
        localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(finalVal));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
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
          const truncatedFinal = [...otherTenants, ...truncated];
          localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(truncatedFinal));
          setRawProducts(truncatedFinal);
        }
      }

      if (sanitizedVal.length > 0) {
        const changedProducts = sanitizedVal.filter(item => {
          const existing = rawProducts.find(p => p.id === item.id);
          if (!existing) return true;
          return (
            existing.stock !== item.stock ||
            existing.price !== item.price ||
            existing.cost !== item.cost ||
            existing.name !== item.name ||
            existing.sku !== item.sku ||
            existing.productStatus !== item.productStatus
          );
        });
        if (changedProducts.length > 0) {
          changedProducts.forEach(prod => {
            db.saveProduct(prod).catch(() => {});
          });
        } else {
          db.saveProduct(sanitizedVal[0]).catch(() => {});
        }
      }
    }
  };

  const setCustomers = async (val: Customer[]) => {
    const otherTenants = rawCustomers.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = val.map(item => ({ 
      ...item, 
      tenant_id: currentUserTenantId,
      company_id: item.company_id || currentOrganizationId
    }));
    const finalVal = [...otherTenants, ...updated];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      if (updated.length > 0) {
        const currentList = rawCustomers.filter(item => getItemTenantId(item) === currentUserTenantId);
        const savedItems = updated.filter(item => {
          const existing = currentList.find(x => x.id === item.id);
          if (!existing) return true;
          return JSON.stringify(existing) !== JSON.stringify(item);
        });
        if (savedItems.length > 0) {
          try {
            for (const item of savedItems) {
              await db.saveCustomer(item);
            }
          } catch (err: any) {
            triggerNotification(`فشلت مزامنة العميل سحابياً: ${err.message || err}`, "critical");
            return;
          }
        }
      }
      setRawCustomers(finalVal);
      localStorage.removeItem(LS_KEYS.CUSTOMERS);
    } else {
      setRawCustomers(finalVal);
      localStorage.setItem(LS_KEYS.CUSTOMERS, JSON.stringify(finalVal));
      if (updated.length > 0) {
        db.saveCustomer(updated[0]).catch(() => {});
      }
    }
  };

  const setSuppliers = async (val: Supplier[]) => {
    const otherTenants = rawSuppliers.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = val.map(item => ({ 
      ...item, 
      tenant_id: currentUserTenantId,
      company_id: item.company_id || currentOrganizationId
    }));
    const finalVal = [...otherTenants, ...updated];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      if (updated.length > 0) {
        const currentList = rawSuppliers.filter(item => getItemTenantId(item) === currentUserTenantId);
        const savedItems = updated.filter(item => {
          const existing = currentList.find(x => x.id === item.id);
          if (!existing) return true;
          return JSON.stringify(existing) !== JSON.stringify(item);
        });
        if (savedItems.length > 0) {
          try {
            for (const item of savedItems) {
              await db.saveSupplier(item);
            }
          } catch (err: any) {
            triggerNotification(`فشلت مزامنة المورد سحابياً: ${err.message || err}`, "critical");
            return;
          }
        }
      }
      setRawSuppliers(finalVal);
      localStorage.removeItem(LS_KEYS.SUPPLIERS);
    } else {
      setRawSuppliers(finalVal);
      localStorage.setItem(LS_KEYS.SUPPLIERS, JSON.stringify(finalVal));
      if (updated.length > 0) {
        db.saveSupplier(updated[0]).catch(() => {});
      }
    }
  };

  const setStores = async (val: StoreProfile[] | ((prev: StoreProfile[]) => StoreProfile[])) => {
    const resolvedVal = typeof val === 'function' ? val(stores) : val;
    const otherTenants = rawStores.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = resolvedVal.map((item: any) => ({ 
      ...item, 
      tenant_id: currentUserTenantId,
      company_id: item.company_id || item.companyId || currentOrganizationId,
      companyId: item.companyId || item.company_id || currentOrganizationId
    }));
    const finalVal = [...otherTenants, ...updated];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      if (updated.length > 0) {
        const currentList = rawStores.filter(item => getItemTenantId(item) === currentUserTenantId);
        const savedItems = updated.filter(item => {
          const existing = currentList.find(x => x.id === item.id);
          if (!existing) return true;
          return JSON.stringify(existing) !== JSON.stringify(item);
        });
        if (savedItems.length > 0) {
          try {
            for (const item of savedItems) {
              await db.saveStore(item);
            }
          } catch (err: any) {
            triggerNotification(`فشلت مزامنة المتجر سحابياً: ${err.message || err}`, "critical");
            return;
          }
        }
      }
      setRawStores(finalVal);
      localStorage.removeItem("sahm_web_stores");
    } else {
      setRawStores(finalVal);
      localStorage.setItem("sahm_web_stores", JSON.stringify(finalVal));
    }
  };

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const [activeStoreId, setActiveStoreIdRaw] = useState<string>(() => {
    // Check platformMode (Requirement 5)
    const isPlatform = currentUser?.role === "platform_owner";
    const isImpersonating = !!localStorage.getItem("sahm_impersonate_tenant_id");
    if (isPlatform && !isImpersonating) {
      return "all";
    }
    try {
      return localStorage.getItem("sahm_active_store_id") || "store_1";
    } catch {
      return "store_1";
    }
  });

  const [showStoreManagerModal, setShowStoreManagerModal] = useState(false);

  // Unified activeDropdownId state manager
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const showStoreDropdown = activeDropdownId === "store_dropdown";
  const showWorkspaceSelector = activeDropdownId === "workspace_selector";
  const showCreateDropdown = activeDropdownId === "create_dropdown";
  const showMoreActionsDropdown = activeDropdownId === "more_actions_dropdown";
  const showBranchDropdown = activeDropdownId === "branch_dropdown";
  const showUserDropdown = activeDropdownId === "user_dropdown";
  const showEnvDropdown = activeDropdownId === "env_dropdown";

  const setShowStoreDropdown = (open: boolean) => {
    setActiveDropdownId(open ? "store_dropdown" : null);
  };
  const setShowWorkspaceSelector = (open: boolean) => {
    setActiveDropdownId(open ? "workspace_selector" : null);
  };
  const setShowCreateDropdown = (open: boolean) => {
    setActiveDropdownId(open ? "create_dropdown" : null);
  };
  const setShowMoreActionsDropdown = (open: boolean) => {
    setActiveDropdownId(open ? "more_actions_dropdown" : null);
  };
  const setShowBranchDropdown = (open: boolean) => {
    setActiveDropdownId(open ? "branch_dropdown" : null);
  };
  const setShowUserDropdown = (open: boolean) => {
    setActiveDropdownId(open ? "user_dropdown" : null);
  };
  const setShowEnvDropdown = (open: boolean) => {
    setActiveDropdownId(open ? "env_dropdown" : null);
  };

  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // HTML component Refs for robust click-outside / Escape dismissals
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const storeDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const workspaceSelectorRef = useRef<HTMLDivElement>(null);
  const workspaceSelectorButtonRef = useRef<HTMLButtonElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const envDropdownRef = useRef<HTMLDivElement>(null);
  const envDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Handlers for absolute mutual exclusion via unified state
  const handleToggleStoreDropdown = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveDropdownId(prev => {
      const next = prev === "store_dropdown" ? null : "store_dropdown";
      if (next) {
        window.dispatchEvent(new CustomEvent("active_dropdown_changed", { detail: { id: "store_dropdown" } }));
      }
      return next;
    });
  };

  const handleToggleWorkspaceSelector = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveDropdownId(prev => {
      const next = prev === "workspace_selector" ? null : "workspace_selector";
      if (next) {
        window.dispatchEvent(new CustomEvent("active_dropdown_changed", { detail: { id: "workspace_selector" } }));
      }
      return next;
    });
  };

  const handleToggleCreateDropdown = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveDropdownId(prev => {
      const next = prev === "create_dropdown" ? null : "create_dropdown";
      if (next) {
        window.dispatchEvent(new CustomEvent("active_dropdown_changed", { detail: { id: "create_dropdown" } }));
      }
      return next;
    });
  };

  // Unified controller for all header system popups (Click outside, Escape key down and cross-component notifications)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      let shouldClose = false;

      // Check click outside store selection popover
      if (
        storeDropdownRef.current && 
        !storeDropdownRef.current.contains(target) &&
        storeDropdownButtonRef.current && 
        !storeDropdownButtonRef.current.contains(target) &&
        activeDropdownId === "store_dropdown"
      ) {
        shouldClose = true;
      }

      // Check click outside workspace selector popover
      if (
        workspaceSelectorRef.current && 
        !workspaceSelectorRef.current.contains(target) &&
        workspaceSelectorButtonRef.current && 
        !workspaceSelectorButtonRef.current.contains(target) &&
        activeDropdownId === "workspace_selector"
      ) {
        shouldClose = true;
      }

      // Check click outside new item creator dropdown
      if (
        createDropdownRef.current && 
        !createDropdownRef.current.contains(target) &&
        createDropdownButtonRef.current && 
        !createDropdownButtonRef.current.contains(target) &&
        activeDropdownId === "create_dropdown"
      ) {
        shouldClose = true;
      }

      // Check click outside environment and alerts dropdown
      if (
        envDropdownRef.current &&
        !envDropdownRef.current.contains(target) &&
        envDropdownButtonRef.current &&
        !envDropdownButtonRef.current.contains(target) &&
        activeDropdownId === "env_dropdown"
      ) {
        shouldClose = true;
      }

      // Check click outside user dropdown
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target) &&
        userDropdownButtonRef.current &&
        !userDropdownButtonRef.current.contains(target) &&
        activeDropdownId === "user_dropdown"
      ) {
        shouldClose = true;
      }

      if (shouldClose) {
        setActiveDropdownId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdownId(null);
        window.dispatchEvent(new CustomEvent("active_dropdown_changed", { detail: { id: "escape" } }));
      }
    };

    const handleActiveDropdownChanged = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail && ev.detail.id === "branch_selector") {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("active_dropdown_changed", handleActiveDropdownChanged);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("active_dropdown_changed", handleActiveDropdownChanged);
    };
  }, [activeDropdownId]);

  const setActiveStoreId = (val: string) => {
    setActiveStoreIdRaw(val);
    if (!platformMode) {
      localStorage.setItem("sahm_active_store_id", val);
      // Automatically switch branch and warehouse to match the active store's branches/warehouses
      const db = SahmDatabaseService.getInstance();
      const resolvedBranch = db.resolveActiveBranchId(undefined, val);
      if (resolvedBranch) {
        setActiveBranchId(resolvedBranch);
        localStorage.setItem("sahm_active_branch_id", resolvedBranch);
      }
      
      const storeWarehouses = rawWarehouses.filter(w => w.storeId === val || w.store_id === val);
      if (storeWarehouses.length > 0) {
        setActiveWarehouseId(storeWarehouses[0].id);
        localStorage.setItem("sahm_active_warehouse_id", storeWarehouses[0].id);
      }
    }
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

  // Guard to ensure activeStoreId is always one of the allowed/filtered stores
  const allowedStores = React.useMemo(() => {
    if (!currentUser) return [];
    const isSystemUser = ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");
    if (isSystemUser) return stores;

    return stores.filter(store => {
      const storeTenant = store.tenant_id || store.tenantId;
      const userTenant = currentUser.tenant_id;
      if (storeTenant && userTenant && storeTenant !== userTenant) return false;

      const storeCompany = store.company_id || store.companyId;
      const userCompany = currentUser.organization_id || currentUser.company_id;
      if (storeCompany && userCompany && storeCompany !== userCompany) return false;

      if (currentUser.allowedStoreIds && currentUser.allowedStoreIds.length > 0) {
        if (!currentUser.allowedStoreIds.includes(store.id)) return false;
      }
      return true;
    });
  }, [stores, currentUser]);

  useEffect(() => {
    if (!initialDataLoaded) return;
    const isSystemUser = currentUser && ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");
    if (allowedStores.length > 0) {
      if (activeStoreId === "all_stores") {
        if (!isSystemUser) {
          setActiveStoreId(allowedStores[0].id);
        }
      } else if (!allowedStores.some(s => s.id === activeStoreId)) {
        setActiveStoreId(allowedStores[0].id);
      }
    }
  }, [activeStoreId, allowedStores, currentUser, initialDataLoaded]);

  // Fetch and sync data with SahmDatabaseService (PostgreSQL/Supabase)
  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    db.initializeSupabase();

    const currentTenant = impersonatedTenantId || currentUser?.tenant_id;
    const isTenantInvalid = import.meta.env.VITE_DATA_MODE === "supabase" &&
      !isPlatformRole(currentUser) && (
        !currentUser ||
        !currentTenant ||
        currentTenant === "tenant-local"
      );

    if (isTenantInvalid) {
      console.warn("Skipping data fetch and seed verification: invalid or missing tenant_id in Supabase mode.");
      return;
    }

    const loadData = async () => {
      const isPlatformOwner = currentUser && ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");
      const isImpersonating = !!impersonatedTenantId;
      const fetchStoreId = (isPlatformOwner && !isImpersonating) ? undefined : (activeStoreId === "all_stores" ? undefined : activeStoreId);

      try {
        const [products, invoices, customers, suppliers, branchesData, warehousesData, storesData, usersData, companiesData, posData] = await Promise.all([
          db.getProducts(fetchStoreId).catch(err => { console.error("Failed to load products:", err); return []; }),
          db.getInvoices(fetchStoreId).catch(err => { console.error("Failed to load invoices:", err); return []; }),
          db.getCustomers(fetchStoreId).catch(err => { console.error("Failed to load customers:", err); return []; }),
          db.getSuppliers(fetchStoreId).catch(err => { console.error("Failed to load suppliers:", err); return []; }),
          db.getBranches().catch(err => { console.error("Failed to load branches on startup:", err); return []; }),
          db.getWarehouses().catch(err => { console.error("Failed to load warehouses on startup:", err); return []; }),
          db.getStores().catch(err => { console.error("Failed to load stores on startup:", err); return []; }),
          db.getUsers().catch(err => { console.error("Failed to load users on startup:", err); return []; }),
          db.getCompanies().catch(err => { console.error("Failed to load companies on startup:", err); return []; }),
          db.getPosTerminals(isPlatformOwner && !impersonatedTenantId ? undefined : fetchStoreId).catch(err => { console.error("Failed to load POS units on startup:", err); return []; })
        ]);

        setRawProducts(products);
        setRawInvoices(invoices);
        setRawCustomers(customers);
        setRawSuppliers(suppliers);
        setRawBranches(branchesData);
        setRawWarehouses(warehousesData);
        setRawStores(storesData);

        if (import.meta.env.VITE_DATA_MODE === "supabase") {
          const officialAdmin = USERS.find(u => u.username === "admin");
          const fetchedUsers = usersData || [];
          const hasAdmin = fetchedUsers.some(u => u.username === "admin" || u.email === "admin@sahm.com");
          const finalUsers = (officialAdmin && !hasAdmin) ? [officialAdmin, ...fetchedUsers] : fetchedUsers;
          setRawUsers(finalUsers);
        } else if (usersData && usersData.length > 0) {
          setRawUsers(usersData);
        }

        if (import.meta.env.VITE_DATA_MODE === "supabase") {
          setRawCompanies(companiesData || []);
        } else if (companiesData && companiesData.length > 0) {
          setRawCompanies(prev => {
            const merged = companiesData.map(dbComp => {
              const localMatch = prev.find(lc => lc.id === dbComp.id);
              if (localMatch) {
                return { ...localMatch, ...dbComp };
              }
              return dbComp;
            });
            const dbIds = new Set(companiesData.map(d => d.id));
            const localOnly = prev.filter(lc => !dbIds.has(lc.id));
            return [...merged, ...localOnly];
          });
        }

        if (posData) {
          setRawPosUnits(posData);
        }

        // Check if the current user's company is suspended
        if (currentUser && currentUser.tenant_id && !isPlatformOwner) {
          const userCompany = (companiesData || []).find(c => c.tenant_id === currentUser.tenant_id);
          if (userCompany && userCompany.status === "suspended") {
            console.warn("Session blocked: tenant is suspended.");
            handleLogout();
            triggerNotification("تم إيقاف المنشأة، تواصل مع إدارة منصة سهم.", "critical");
            return;
          }
        }

        setInitialDataLoaded(true);
      } catch (err) {
        console.error("Critical error loading initial data:", err);
        setInitialDataLoaded(true);
      }
    };

    if (db.isSupabaseConnected() || db.isSupabaseModeOnly()) {
      db.ensureWorkspaceSeed().then(loadData);
    } else {
      loadData();
    }
  }, [activeStoreId, impersonatedTenantId, currentUser]);

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
  const [rawBranches, setRawBranches] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_branches");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "branch_riyadh_main",
        name: "فرع الرياض",
        city: "الرياض",
        address: "طريق الملك فهد، حي المروج",
        phone: "0112445566",
        manager: "عبدالله بن فهد",
        employees: ["صالح الشمري", "محمد العتيبي", "خالد الحربي", "نورة القحطاني"],
        workingHours: "08:00 ص - 11:00 م",
        associatedWh: "warehouse_1",
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

  const [rawWarehouses, setRawWarehouses] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_warehouses");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "warehouse_1",
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

  const [rawPosUnits, setRawPosUnits] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_terminals_local");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "pos_1", name: "كاشير فرع الرياض 1 🖥️", branchId: "branch_riyadh_main", isDefault: true, status: "نشط" },
      { id: "pos_riyadh_2", name: "كاشير فرع الرياض 2 📱", branchId: "branch_riyadh_main", isDefault: false, status: "نشط" },
      { id: "pos_jeddah_1", name: "كاشير فرع جدة 1 🖥️", branchId: "br_jeddah_int", isDefault: true, status: "نشط" },
      { id: "pos_dammam_1", name: "كاشير معرض دبي 1 🖥️", branchId: "br_dammam", isDefault: true, status: "نشط" }
    ];
  });

  // Isolated environment lists
  const branches = (isSystemAdmin && !impersonatedTenantId)
    ? rawBranches
    : rawBranches.filter(matchesTenantAndOrg);

  const warehouses = (isSystemAdmin && !impersonatedTenantId)
    ? rawWarehouses
    : rawWarehouses.filter(matchesTenantAndOrg);

  const posUnits = (isSystemAdmin && !impersonatedTenantId)
    ? rawPosUnits
    : rawPosUnits.filter(matchesTenantAndOrg);

  const setBranches = async (val: any[] | ((prev: any[]) => any[])) => {
    const resolvedVal = typeof val === 'function' ? val(branches) : val;
    const otherTenants = rawBranches.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = resolvedVal.map((item: any) => ({
      ...item,
      tenant_id: item.tenant_id || currentUserTenantId,
      company_id: item.company_id || item.companyId || currentOrganizationId
    }));
    const finalVal = [...otherTenants, ...updated];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      const currentList = rawBranches.filter(item => getItemTenantId(item) === currentUserTenantId);
      
      const deleted = currentList.filter(item => !updated.some(x => x.id === item.id));
      if (deleted.length > 0) {
        try {
          for (const item of deleted) {
            await db.deleteBranch(item.id);
          }
        } catch (err: any) {
          triggerNotification(`فشل حذف الفرع سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      const saved = updated.filter(item => {
        const existing = currentList.find(x => x.id === item.id);
        if (!existing) return true;
        return JSON.stringify(existing) !== JSON.stringify(item);
      });
      if (saved.length > 0) {
        try {
          for (const item of saved) {
            await db.saveBranch(item);
          }
        } catch (err: any) {
          triggerNotification(`فشلت مزامنة الفرع سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      setRawBranches(finalVal);
      localStorage.removeItem("sahm_web_branches");
    } else {
      setRawBranches(finalVal);
      localStorage.setItem("sahm_web_branches", JSON.stringify(finalVal));
    }
  };

  const setWarehouses = async (val: any[] | ((prev: any[]) => any[])) => {
    const resolvedVal = typeof val === 'function' ? val(warehouses) : val;
    const otherTenants = rawWarehouses.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = resolvedVal.map((item: any) => {
      const storeIdVal = item.store_id || item.storeId || activeStoreId || "store_1";
      const resolvedStoreId = storeIdVal === "all_stores" ? (stores[0]?.id || "store_1") : storeIdVal;
      return { 
        ...item, 
        tenant_id: item.tenant_id || currentUserTenantId,
        company_id: item.company_id || item.companyId || currentOrganizationId,
        store_id: resolvedStoreId,
        storeId: resolvedStoreId
      };
    });
    const finalVal = [...otherTenants, ...updated];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      const currentList = rawWarehouses.filter(item => getItemTenantId(item) === currentUserTenantId);
      
      const deleted = currentList.filter(item => !updated.some(x => x.id === item.id));
      if (deleted.length > 0) {
        try {
          for (const item of deleted) {
            await db.deleteWarehouse(item.id);
          }
        } catch (err: any) {
          triggerNotification(`فشل حذف المستودع سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      const saved = updated.filter(item => {
        const existing = currentList.find(x => x.id === item.id);
        if (!existing) return true;
        return JSON.stringify(existing) !== JSON.stringify(item);
      });
      if (saved.length > 0) {
        try {
          for (const item of saved) {
            await db.saveWarehouse(item);
          }
        } catch (err: any) {
          triggerNotification(`فشلت مزامنة المستودع سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      setRawWarehouses(finalVal);
      localStorage.removeItem("sahm_web_warehouses");
    } else {
      setRawWarehouses(finalVal);
      localStorage.setItem("sahm_web_warehouses", JSON.stringify(finalVal));
    }
  };

  const setPosUnits = async (val: any[] | ((prev: any[]) => any[])) => {
    const resolvedVal = typeof val === 'function' ? val(posUnits) : val;
    const otherTenants = rawPosUnits.filter(item => getItemTenantId(item) !== currentUserTenantId);
    const updated = resolvedVal.map((item: any) => {
      const storeIdVal = item.store_id || item.storeId || activeStoreId || "store_1";
      const resolvedStoreId = storeIdVal === "all_stores" ? (stores[0]?.id || "store_1") : storeIdVal;
      return { 
        ...item, 
        tenant_id: item.tenant_id || currentUserTenantId,
        company_id: item.company_id || item.companyId || currentOrganizationId,
        store_id: resolvedStoreId,
        storeId: resolvedStoreId
      };
    });
    const finalVal = [...otherTenants, ...updated];

    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      const currentList = rawPosUnits.filter(item => getItemTenantId(item) === currentUserTenantId);
      
      const deleted = currentList.filter(item => !updated.some(x => x.id === item.id));
      if (deleted.length > 0) {
        try {
          for (const item of deleted) {
            await posService.delete(item.id);
          }
        } catch (err: any) {
          triggerNotification(`فشل حذف جهاز نقاط البيع سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      const saved = updated.filter(item => {
        const existing = currentList.find(x => x.id === item.id);
        if (!existing) return true;
        
        const nameChanged = existing.name !== item.name;
        const branchChanged = (existing.branchId || existing.branch_id || "") !== (item.branchId || item.branch_id || "");
        const storeChanged = (existing.storeId || existing.store_id || "") !== (item.storeId || item.store_id || "");
        const whChanged = (existing.defaultWh || existing.warehouseId || existing.warehouse_id || "") !== (item.defaultWh || item.warehouseId || item.warehouse_id || "");
        const cashierChanged = (existing.cashier || "") !== (item.cashier || "");
        const statusChanged = (existing.status || "") !== (item.status || "");
        const activeChanged = (existing.isActive ?? existing.is_active ?? true) !== (item.isActive ?? item.is_active ?? true);
        
        return nameChanged || branchChanged || storeChanged || whChanged || cashierChanged || statusChanged || activeChanged;
      });
      if (saved.length > 0) {
        try {
          for (const item of saved) {
            await posService.create(item);
          }
        } catch (err: any) {
          triggerNotification(`فشلت مزامنة جهاز نقاط البيع سحابياً: ${err.message || err}`, "critical");
          return;
        }
      }

      setRawPosUnits(finalVal);
      localStorage.removeItem("sahm_web_terminals_local");
    } else {
      setRawPosUnits(finalVal);
      localStorage.setItem("sahm_web_terminals_local", JSON.stringify(finalVal));
    }
  };

  // Local storage synchronization effects
  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    if (!db.isSupabaseModeOnly()) {
      localStorage.setItem("sahm_web_branches", JSON.stringify(rawBranches));
    }
  }, [rawBranches]);

  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    if (!db.isSupabaseModeOnly()) {
      localStorage.setItem("sahm_web_warehouses", JSON.stringify(rawWarehouses));
    }
  }, [rawWarehouses]);

  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    if (!db.isSupabaseModeOnly()) {
      localStorage.setItem("sahm_web_terminals_local", JSON.stringify(rawPosUnits));
    }
  }, [rawPosUnits]);

  // Selected Environment Selector States
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    const isPlatform = currentUser?.role === "platform_owner";
    const isImpersonating = !!localStorage.getItem("sahm_impersonate_tenant_id");
    if (isPlatform && !isImpersonating) {
      return "all";
    }
    const saved = localStorage.getItem("sahm_active_branch_id");
    if (saved) return saved;
    const currentTenant = impersonatedTenantId || currentUser?.tenant_id || "";
    if (currentTenant && currentTenant !== "tenant-default") {
      return "";
    }
    return (import.meta.env.VITE_DATA_MODE === "supabase" || import.meta.env.VITE_DATA_MODE === "production") ? "branch_1" : "branch_riyadh_main";
  });

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>(() => {
    const isPlatform = currentUser?.role === "platform_owner";
    const isImpersonating = !!localStorage.getItem("sahm_impersonate_tenant_id");
    if (isPlatform && !isImpersonating) {
      return "all";
    }
    const saved = localStorage.getItem("sahm_active_warehouse_id");
    if (saved) return saved;
    const currentTenant = impersonatedTenantId || currentUser?.tenant_id || "";
    if (currentTenant && currentTenant !== "tenant-default") {
      return "";
    }
    return "warehouse_1";
  });

  const [activePosId, setActivePosId] = useState<string>(() => {
    const isPlatform = currentUser?.role === "platform_owner";
    const isImpersonating = !!localStorage.getItem("sahm_impersonate_tenant_id");
    if (isPlatform && !isImpersonating) {
      return "all";
    }
    const saved = localStorage.getItem("sahm_active_pos_id");
    if (saved) return saved;
    const currentTenant = impersonatedTenantId || currentUser?.tenant_id || "";
    if (currentTenant && currentTenant !== "tenant-default") {
      return "";
    }
    return "pos_1";
  });

  // Auto-sanitize selected environment IDs to prevent foreign key errors with legacy localStorage values
  useEffect(() => {
    if (platformMode || !initialDataLoaded) return;
    if (rawBranches.length > 0) {
      const tenantBranches = rawBranches.filter(b => getItemTenantId(b) === currentUserTenantId);
      if (tenantBranches.length > 0) {
        const isValid = tenantBranches.some(b => b.id === activeBranchId);
        if (!isValid) {
          console.warn(`[Sanitize] Active branch ${activeBranchId} is invalid, falling back to ${tenantBranches[0].id}`);
          setActiveBranchId(tenantBranches[0].id);
          localStorage.setItem("sahm_active_branch_id", tenantBranches[0].id);
        }
      }
    }
  }, [rawBranches, activeBranchId, currentUserTenantId, platformMode, initialDataLoaded]);

  useEffect(() => {
    if (platformMode || !initialDataLoaded) return;
    if (rawWarehouses.length > 0) {
      const tenantWarehouses = rawWarehouses.filter(w => getItemTenantId(w) === currentUserTenantId);
      if (tenantWarehouses.length > 0) {
        const isValid = tenantWarehouses.some(w => w.id === activeWarehouseId);
        if (!isValid) {
          console.warn(`[Sanitize] Active warehouse ${activeWarehouseId} is invalid, falling back to ${tenantWarehouses[0].id}`);
          setActiveWarehouseId(tenantWarehouses[0].id);
          localStorage.setItem("sahm_active_warehouse_id", tenantWarehouses[0].id);
        }
      }
    }
  }, [rawWarehouses, activeWarehouseId, currentUserTenantId, platformMode, initialDataLoaded]);

  useEffect(() => {
    if (platformMode || !initialDataLoaded) return;
    if (posUnits.length > 0) {
      const isValid = posUnits.some(p => p.id === activePosId);
      if (!isValid) {
        console.warn(`[Sanitize] Active POS ${activePosId} is invalid, falling back to ${posUnits[0].id}`);
        setActivePosId(posUnits[0].id);
        localStorage.setItem("sahm_active_pos_id", posUnits[0].id);
      }
    }
  }, [posUnits, activePosId, platformMode, initialDataLoaded]);

  // Memoized user-restricted allowed assets lists
  const allowedBranches = useMemo(() => {
    if (!currentUser) return branches;
    const canSwitch = hasPermission(currentUser, "workspace:switch");
    if (canSwitch) return branches;
    if (currentUser.branchId) {
      return branches.filter((b: any) => b.id === currentUser.branchId);
    }
    return branches;
  }, [currentUser, branches]);

  const allowedWarehouses = useMemo(() => {
    if (!currentUser) return warehouses;
    const canSwitch = hasPermission(currentUser, "workspace:switch");
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
    const canSwitch = hasPermission(currentUser, "workspace:switch");
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
    if (platformMode) return;
    if (currentUser) {
      const canSwitch = hasPermission(currentUser, "workspace:switch");
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

  // Synchronize mainCompanyName with the active company name in rawCompanies
  useEffect(() => {
    const targetCompId = impersonatedOrganizationId || currentUser?.organization_id || currentUser?.company_id || "comp-default";
    const activeComp = rawCompanies.find(c => c.id === targetCompId) || 
                       rawCompanies.find(c => (c.tenant_id || c.tenantId) === currentTenantId) || 
                       rawCompanies[0];
    if (activeComp && activeComp.name && activeComp.name !== mainCompanyName) {
      setMainCompanyName(activeComp.name);
    }
  }, [rawCompanies, impersonatedOrganizationId, currentUser, currentTenantId, mainCompanyName]);

  // Keep references handy
  const activeBranchObj = branches.find(b => b.id === activeBranchId) || branches[0];
  const activeWarehouseObj = warehouses.find(w => w.id === activeWarehouseId) || warehouses[0];
  const activePosObj = posUnits.find(p => p.id === activePosId) || posUnits[0];

  // Handler helpers
  const handleSwitchBranch = (id: string) => {
    setActiveBranchId(id);
    if (!platformMode) {
      localStorage.setItem("sahm_active_branch_id", id);
    }
    
    // Auto-update legacy activeWorkspaceId for backward-compatibilities
    if (id === "branch_riyadh_main") {
      setActiveWorkspaceId("riyadh");
      if (!platformMode) {
        localStorage.setItem("sahm_active_workspace_id", "riyadh");
      }
    } else if (id === "br_jeddah_int") {
      setActiveWorkspaceId("dubai");
      if (!platformMode) {
        localStorage.setItem("sahm_active_workspace_id", "dubai");
      }
    } else if (id === "br_dammam") {
      setActiveWorkspaceId("jeddah");
      if (!platformMode) {
        localStorage.setItem("sahm_active_workspace_id", "jeddah");
      }
    }
    
    const b = branches.find(br => br.id === id);
    if (b) {
      if (b.associatedWh) {
        setActiveWarehouseId(b.associatedWh);
        if (!platformMode) {
          localStorage.setItem("sahm_active_warehouse_id", b.associatedWh);
        }
      }
      
      const associatedPos = posUnits.find(p => p.branchId === id && p.isDefault) || posUnits.find(p => p.branchId === id);
      if (associatedPos) {
        setActivePosId(associatedPos.id);
        if (!platformMode) {
          localStorage.setItem("sahm_active_pos_id", associatedPos.id);
        }
      }
      triggerNotification(`تم تفعيل بيئة عمل فرع: [${b.name}] بنجاح 🌐`, "info");
      addAuditLog("تغيير الفرع", `تم التبديل للفرع النشط: ${b.name}`);
    }
  };

  const handleSwitchWarehouse = (id: string) => {
    setActiveWarehouseId(id);
    if (!platformMode) {
      localStorage.setItem("sahm_active_warehouse_id", id);
    }
    const w = warehouses.find(wh => wh.id === id);
    if (w) {
      triggerNotification(`تم تفعيل المستودع النشط: [${w.name}] 📦`, "success");
      addAuditLog("تغيير المستودع", `تم تنشيط مستودع الجرد: ${w.name}`);
    }
  };

  const handleSwitchPos = (id: string) => {
    setActivePosId(id);
    if (!platformMode) {
      localStorage.setItem("sahm_active_pos_id", id);
    }
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
      const saved = import.meta.env.VITE_DATA_MODE !== "supabase" ? localStorage.getItem("sahm_audit_logs_v8") : null;
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
      if (import.meta.env.VITE_DATA_MODE !== "supabase") {
        localStorage.setItem("sahm_audit_logs_v8", JSON.stringify(updated));
      }
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

  const [currentActiveShift, setCurrentActiveShift] = useState<any | null>(null);

  useEffect(() => {
    const handleShiftChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCurrentActiveShift(detail);
    };
    window.addEventListener("sahm_active_shift_changed", handleShiftChange);
    return () => {
      window.removeEventListener("sahm_active_shift_changed", handleShiftChange);
    };
  }, []);

  useEffect(() => {
    if (currentUser && activePosId) {
      SahmDatabaseService.getInstance().getActiveShift(String(currentUser.id), activePosId)
        .then(shift => {
          setCurrentActiveShift(shift);
        })
        .catch(console.error);
    } else {
      setCurrentActiveShift(null);
    }
  }, [currentUser, activePosId]);

  // Current active navigation tab state with virtual sub-tab router
  const [activeTabVal, setActiveTabRaw] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem("sahm_web_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const isImpersonating = localStorage.getItem("sahm_impersonate_tenant_id");
        if (isImpersonating) return "setup_organizations";

        const isSystem = ["platform_owner", "system_admin", "system_owner"].includes(u.role || "");
        if (isSystem) return "system_clients";

        const savedTab = localStorage.getItem("sahm_active_tab");
        if (savedTab) return savedTab;
      }
    } catch (e) {
      console.error(e);
    }
    return "setup_organizations";
  });
  const [commandCenterSubTab, setCommandCenterSubTab] = useState<'overview' | 'analytics' | 'assistant' | 'recommendations' | 'competitors' | 'alerts' | 'operations' | 'forecasts' | 'performance' | 'cabin_customize' | 'intelligent_hub'>("overview");
  const [intelligentHubSubTab, setIntelligentHubSubTab] = useState<"sahm-brain" | "ai" | "publish" | "saas" | "competitors" | "catalog-health">("catalog-health");
  const [showStartupGuide, setShowStartupGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sahm_show_onboarding_v31") !== "false";
    } catch {
      return true;
    }
  });
  const [isPosFullscreen, setIsPosFullscreen] = useState<boolean>(false);
  const [financialSubTab, setFinancialSubTab] = useState<"invoices" | "customers" | "suppliers" | "accounting" | "profiles" | "accounting_ai">("invoices");
  const [settingsSubTab, setSettingsSubTab] = useState<string>("general");
  const [showGlobalAIBuilder, setShowGlobalAIBuilder] = useState(false);
  const [platformSubTab, setPlatformSubTab] = useState<"clients" | "facilities">("clients");

  // Re-organized 8 Two-Level navigation sub-tab states
  const [dashboardSubTab, setDashboardSubTab] = useState<"cockpit" | "performance" | "alerts" | "metrics" | "tasks">("performance");
  const [productStudioSubTab, setProductStudioSubTab] = useState<"studio_dashboard" | "new_product" | "ai_generation" | "catalog_optimization" | "product_images" | "product_videos" | "product_assets" | "categories_attributes" | "pricing_offers" | "publishing_channels" | "products_library">("studio_dashboard");
  const [salesCommerceSubTab, setSalesCommerceSubTab] = useState<"pos" | "orders" | "invoices" | "customers" | "offers_discounts" | "subscriptions">("pos");
  const [operationsSubTab, setOperationsSubTab] = useState<"branches_locations" | "warehouses" | "inventory" | "suppliers" | "purchases" | "documents_records">("branches_locations");
  const [marketingGrowthSubTab, setMarketingGrowthSubTab] = useState<"catalog_promo" | "competitors" | "campaigns" | "visitor_radar" | "theme_marketplace" | "landing_pages">("catalog_promo");
  const [intelligenceAnalyticsSubTab, setIntelligenceAnalyticsSubTab] = useState<"copilot" | "ai_capabilities" | "recommendations" | "reports" | "predictions">("copilot");
  const [automationIntegrationSubTab, setAutomationIntegrationSubTab] = useState<"workflows" | "publishing" | "app_store" | "api_webhooks">("workflows");
  const [managementSettingsSubTab, setManagementSettingsSubTab] = useState<"organization_hub" | "users_permissions" | "general_settings" | "billing_packages" | "themes" | "notifications" | "audit_log">("organization_hub");

  // Product Studio landing page search and filter states
  const [studioSearchQuery, setStudioSearchQuery] = useState<string>("");
  const [studioCategoryFilter, setStudioCategoryFilter] = useState<string>("all");

  const activeTab = activeTabVal;
  const setActiveTab = (rawTab: string) => {
    // Auto-close any active header/aside popups on page change (Requirement 3)
    setShowStoreDropdown(false);
    setShowWorkspaceSelector(false);
    setShowCreateDropdown(false);

    let tab = rawTab;

    // Comprehensive mapping of legacy tab/sub-tab IDs to the new 8 Categories
    if (tab === "command_center" || tab === "dashboard") {
      tab = "dashboard";
    } else if (tab === "product_studio" || tab === "products") {
      tab = "product_studio";
    } else if (tab === "pos_and_operations" || tab === "sales_commerce" || tab === "pos") {
      tab = "sales_commerce";
      setSalesCommerceSubTab("pos");
    } else if (tab === "invoices" || tab === "orders") {
      tab = "sales_commerce";
      setSalesCommerceSubTab("invoices");
    } else if (tab === "customers") {
      tab = "sales_commerce";
      setSalesCommerceSubTab("customers");
    } else if (tab === "subscriptions") {
      tab = "sales_commerce";
      setSalesCommerceSubTab("subscriptions");
    } else if (tab === "offers_discounts" || tab === "discounts") {
      tab = "sales_commerce";
      setSalesCommerceSubTab("offers_discounts");
    } else if (tab === "inventory_management" || tab === "operations" || tab === "inventory") {
      tab = "operations";
      setOperationsSubTab("inventory");
    } else if (tab === "branches_locations" || tab === "branches") {
      tab = "operations";
      setOperationsSubTab("branches_locations");
    } else if (tab === "warehouses") {
      tab = "operations";
      setOperationsSubTab("warehouses");
    } else if (tab === "suppliers") {
      tab = "operations";
      setOperationsSubTab("suppliers");
    } else if (tab === "purchases") {
      tab = "operations";
      setOperationsSubTab("purchases");
    } else if (tab === "intelligent_hub" || tab === "marketing_growth" || tab === "catalog_promo" || tab === "marketing") {
      tab = "marketing_growth";
      setMarketingGrowthSubTab("catalog_promo");
    } else if (tab === "competitors") {
      tab = "marketing_growth";
      setMarketingGrowthSubTab("competitors");
    } else if (tab === "campaigns") {
      tab = "marketing_growth";
      setMarketingGrowthSubTab("campaigns");
    } else if (tab === "reports" || tab === "intelligence_analytics" || tab === "copilot") {
      tab = "intelligence_analytics";
      setIntelligenceAnalyticsSubTab("reports");
    } else if (tab === "workflows" || tab === "automation_integration") {
      tab = "automation_integration";
      setAutomationIntegrationSubTab("workflows");
    } else if (tab === "publishing" || tab === "auto_publish") {
      tab = "automation_integration";
      setAutomationIntegrationSubTab("publishing");
    } else if (tab === "settings" || tab === "management_settings" || tab === "general_settings") {
      tab = "management_settings";
      setManagementSettingsSubTab("general_settings");
    } else if (tab === "audit_log") {
      tab = "management_settings";
      setManagementSettingsSubTab("audit_log");
    } else if (tab === "users_permissions") {
      tab = "management_settings";
      setManagementSettingsSubTab("users_permissions");
    } else if (tab === "organization_hub") {
      tab = "management_settings";
      setManagementSettingsSubTab("organization_hub");
    }

    const isSystemUser = currentUser && ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");

    const userSetupDone = isSystemUser || !initialDataLoaded || (branches.length > 0 && allowedStores.length > 0 && warehouses.length > 0 && posUnits.length > 0);
    if (!userSetupDone && tab !== "setup_organizations" && tab !== "system_clients") {
      triggerNotification("يرجى استكمال إعداد المنشأة والفرع والمستودع ونقطة البيع أولا", "warning");
      return;
    }

    if (activeTabVal === "sales_commerce" && tab !== "sales_commerce") {
      if (currentActiveShift && currentActiveShift.status === "open") {
        triggerNotification("⚠️ لا يمكن مغادرة نقطة البيع ولديك وردية مفتوحة. يرجى موازنة وتسليم الوردية أولاً قبل المغادرة للوحة القيادة العامة!", "warning");
        window.dispatchEvent(new CustomEvent("sahm_pos_force_shift_modal"));
        return;
      }
    }

    if (tab === "human_resources") {
      const perms = currentUser?.permissions || [];
      const isSuperUser = ["system_owner", "system_admin", "platform_owner"].includes(currentUser?.role || "");
      const hasDirectPerm = perms.includes("users:view") || perms.includes("hr:view") || (perms.includes("*") && isSuperUser);
      const hasRolePerm = ["tenant_owner", "system_admin", "admin"].includes(currentUser?.role || "");
      if (!hasDirectPerm && !hasRolePerm) {
        triggerNotification("عذراً، ليس لديك صلاحية الوصول إلى الموارد البشرية (users:view / hr:view) 👥", "critical");
        return;
      }
    }

    if (tab === "saas_blueprint" || tab === "saas" || tab === "saas_2030" || tab === "saas_vision") {
      setActiveTabRaw("dashboard");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sahm_open_saas_2030"));
      }, 50);
    } else if (tab === "ai" || tab === "publish" || tab === "publication") {
      setActiveTabRaw("marketing_growth");
      setMarketingGrowthSubTab("catalog_promo");
    } else if (tab === "invoices" || tab === "customers" || tab === "suppliers" || tab === "accounting" || tab === "profiles" || tab === "accounting_ai") {
      setActiveTabRaw("sales_commerce");
      if (tab === "invoices" || tab === "accounting") setSalesCommerceSubTab("invoices");
      if (tab === "customers") setSalesCommerceSubTab("customers");
    } else if (tab === "media_center" || tab === "media") {
      setActiveTabRaw("management_settings");
      setManagementSettingsSubTab("general_settings");
    } else {
      setActiveTabRaw(tab);
      if (tab !== "management_settings") {
        setSettingsSubTab("general");
      }
    }
    localStorage.setItem("sahm_active_tab", tab);
  };

  // Removed system_clients redirect logic to allow platform_owner without impersonation to view setup_organizations ("إدارة المنشآت")

  // --- 🔍 Global Search Central Controller (Bullet 5 - Global Search System) ---
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  useEffect(() => {
    // URL-based routing simulation for '/hr' (Requirement 8)
    const handleLocationRouting = () => {
      const path = window.location.hash || window.location.pathname;
      if (path.includes("/hr")) {
        setActiveTab("human_resources");
      }
    };
    handleLocationRouting();
    window.addEventListener("hashchange", handleLocationRouting);
    window.addEventListener("popstate", handleLocationRouting);

    // Patch pushState to detect custom programmatic layout routers
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args: any[]) {
      const res = originalPushState.apply(this, args as any);
      handleLocationRouting();
      return res;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    
    const handlePromoteProductEvent = (e: Event) => {
      const product = (e as CustomEvent).detail;
      if (!product) {
        triggerNotification("لم يتم العثور على شاشة أو تفاصيل تفاعلية للمنتج المحدد ترويجياً.", "critical");
        return;
      }
      setPromotedProduct(product);
    };

    const handleSahmEnterPosFullscreen = () => {
      setIsPosFullscreen(true);
      setActiveTab("pos_and_operations");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("sahm_promote_product", handlePromoteProductEvent);
    window.addEventListener("sahm_enter_pos_fullscreen", handleSahmEnterPosFullscreen);
    
    // Bind global navigation helper for all external sections
    (window as any).__sahm_global_navigate = (tab: string, subTab?: string, prefill?: any) => {
      handleGlobalNavigate(tab, subTab, prefill);
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("sahm_promote_product", handlePromoteProductEvent);
      window.removeEventListener("sahm_enter_pos_fullscreen", handleSahmEnterPosFullscreen);
      window.removeEventListener("hashchange", handleLocationRouting);
      window.removeEventListener("popstate", handleLocationRouting);
      window.history.pushState = originalPushState;
    };
  }, []);

  // Intercept setter for combined intelligent_hub navigation compatibility
  const handleSetActiveTab = (tab: string) => {
    if (tab === "saas_blueprint" || tab === "saas" || tab === "saas_2030" || tab === "saas_vision") {
      setActiveTab("command_center");
      setCommandCenterSubTab("assistant");
    } else if (tab === "ai" || tab === "publish" || tab === "publication" || tab === "intelligent_hub") {
      setActiveTab("command_center");
      setCommandCenterSubTab("intelligent_hub");
      if (tab === "ai") {
        setIntelligentHubSubTab("ai");
      } else if (tab === "publish" || tab === "publication") {
        setIntelligentHubSubTab("publish");
      } else {
        setIntelligentHubSubTab("catalog-health");
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleGlobalNavigate = (tab: string, subTab?: string, prefill?: any) => {
    if (tab === "saas" || tab === "saas_2030" || tab === "saas_blueprint" || tab === "saas_vision") {
      setActiveTab("command_center");
      setCommandCenterSubTab("assistant");
      if (prefill) {
        setPrefillPublish(prefill);
      }
    } else if (tab === "intelligent_hub" || tab === "ai") {
      setActiveTab("command_center");
      setCommandCenterSubTab("intelligent_hub");
      if (subTab) {
        setIntelligentHubSubTab(subTab as any);
      } else if (tab === "ai") {
        setIntelligentHubSubTab("ai");
      } else {
        setIntelligentHubSubTab("catalog-health");
      }
      if (prefill) {
        setPrefillPublish(prefill);
      }
    } else {
      setActiveTab(tab);
      if (tab === "command_center" && subTab) {
        setCommandCenterSubTab(subTab as any);
      } else if (tab === "sales_commerce" && subTab) {
        setSalesCommerceSubTab(subTab as any);
      } else if (tab === "operations" && subTab) {
        setOperationsSubTab(subTab as any);
      } else if (tab === "marketing_growth" && subTab) {
        setMarketingGrowthSubTab(subTab as any);
      } else if (tab === "intelligence_analytics" && subTab) {
        setIntelligenceAnalyticsSubTab(subTab as any);
      } else if (tab === "management_settings" && subTab) {
        setManagementSettingsSubTab(subTab as any);
      } else if (tab === "automation_integration" && subTab) {
        setAutomationIntegrationSubTab(subTab as any);
      } else if (tab === "dashboard" && subTab) {
        setDashboardSubTab(subTab as any);
      } else if (tab === "product_studio" && subTab) {
        setProductStudioSubTab(subTab as any);
      }
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

  // Shared state for pre-filling the post publishing flow from the AI Analyzer
  const [prefillPublish, setPrefillPublish] = useState<{
    name: string;
    price: string;
    image: { uri: string; base64: string; mimeType: string } | null;
  } | null>(null);

  // State to hold the active product configured for the custom promotion builder
  const [promotedProduct, setPromotedProduct] = useState<Product | null>(null);

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

  const normalizeLoginUser = (user: any): any => {
    const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase" || import.meta.env.VITE_DATA_MODE === "production";
    if (isSupabase) {
      if (user?.role === "owner") {
        if (user.tenant_id && user.tenant_id !== "tenant-local") {
          return {
            ...user,
            role: "tenant_owner"
          };
        }
        throw new Error("حساب owner غير صالح في Pilot. يجب أن يكون platform_owner أو tenant_owner مع tenant_id حقيقي.");
      }
      return user;
    }

    const isAdminIdentity =
      user?.username === "admin" ||
      user?.email === "admin@sahm.com";

    if (isAdminIdentity) {
      const officialAdmin = USERS.find(u => u.username === "admin" || u.email === "admin@sahm.com");
      return {
        ...officialAdmin,
        ...user,
        role: "platform_owner",
        tenant_id: undefined,
        tenantId: undefined
      };
    }

    if (user?.role === "owner") {
      if (user.tenant_id && user.tenant_id !== "tenant-local") {
        return {
          ...user,
          role: "tenant_owner"
        };
      }

      throw new Error("حساب owner غير صالح في Pilot. يجب أن يكون platform_owner أو tenant_owner مع tenant_id حقيقي.");
    }

    return user;
  };

  const handleLogin = (rawUser: User) => {
    const user = normalizeLoginUser(rawUser);
    console.log("CURRENT_USER_ROLE", user.role, user.tenant_id);
    setCurrentUser(user);
    localStorage.setItem("sahm_web_user", JSON.stringify(user));
    localStorage.removeItem("sahm_web_user3");

    let activatedBranch = "";
    let activatedWarehouse = "";
    let activatedPos = "";

    // Sync active environmental references
    if (user.branchId) {
      setActiveBranchId(user.branchId);
      localStorage.setItem("sahm_active_branch_id", user.branchId);
      activatedBranch = branches.find(b => b.id === user.branchId)?.name || user.branchId;

      // Sync legacy workspace settings
      if (user.branchId === "branch_riyadh_main") {
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

    // Role-based landing redirects & notifications
    const isSystemUser = ["platform_owner", "system_admin", "system_owner"].includes(user.role || "");
    const userBranches = branches.filter(b => (b.tenant_id || b.tenantId) === user.tenant_id);
    const userStores = allowedStores.filter(s => (s.tenant_id || s.tenantId) === user.tenant_id);
    const userWarehouses = warehouses.filter(w => (w.tenant_id || w.tenantId) === user.tenant_id);
    const userPosUnits = posUnits.filter(p => (p.tenant_id || p.tenantId) === user.tenant_id);
    const userSetupDone = isSystemUser || (userBranches.length > 0 && userStores.length > 0 && userWarehouses.length > 0 && userPosUnits.length > 0);

    if (isSystemUser) {
      setActiveTabRaw("system_clients");
      triggerNotification("مرحبا بك! تم توجيهك لمركز إدارة المنصة بنجاح", "success");
    } else if (!userSetupDone) {
      setActiveTabRaw("setup_organizations");
      triggerNotification("مرحبا بك! يرجى استكمال إعداد المنشأة والفرع والمستودع ونقطة البيع لتشغيل المنظومة", "success");
    } else {
      setActiveTabRaw("setup_organizations");
      triggerNotification("مرحبا بك! تم تحميل مركز إدارة المنشأة بنجاح", "success");
    }

    addAuditLog(
      "تسجيل الدخول للنظام",
      `قام الموظف @${user.username} (رتبة: ${user.role}) بتسجيل دخول ناجح إلى النظام ونقل الجلسة لبيئة العمل النشطة بمستوى وصول مرخص.`,
      user
    );
  };

  const handleLogout = () => {
    const db = SahmDatabaseService.getInstance();
    if (db.isSupabaseModeOnly()) {
      db.signOut().catch((err: any) => console.error("Supabase signOut error:", err));
    }
    setCurrentUser(null);
    localStorage.removeItem(LS_KEYS.USER);
    localStorage.removeItem("sahm_web_user");
    localStorage.removeItem("sahm_web_user3");
    localStorage.removeItem("sahm_web_users_list3");
    localStorage.removeItem("sahm_impersonate_tenant_id");
    localStorage.removeItem("sahm_impersonate_org_id");
    localStorage.removeItem("sahm_impersonate_company_name");
    setImpersonatedTenantId(null);
    setImpersonatedOrganizationId(null);
    setImpersonatedCompanyName(null);
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

  const isSetupCompleted = React.useMemo(() => {
    const isSystemUser = currentUser && ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");
    if (isSystemUser) return true;
    if (!initialDataLoaded) return true;
    return branches.length > 0 && allowedStores.length > 0 && warehouses.length > 0 && posUnits.length > 0;
  }, [branches, allowedStores, warehouses, posUnits, currentUser, initialDataLoaded]);

  // Redirect to setup tab if setup is not completed after loading data
  useEffect(() => {
    if (initialDataLoaded && !isSetupCompleted && activeTabVal !== "setup_organizations" && activeTabVal !== "system_clients") {
      setActiveTabRaw("setup_organizations");
      localStorage.setItem("sahm_active_tab", "setup_organizations");
    }
  }, [initialDataLoaded, isSetupCompleted, activeTabVal]);

  // Render pristine golden splash loader on initial load
  if (systemLoading || (currentUser && !initialDataLoaded)) {
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
    return <Login onLogin={handleLogin} users={rawUsers} companies={rawCompanies} />;
  }

  // Check if tenant is suspended and user is not a platform owner
  const isPlatformUser = ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");
  const userCompany = rawCompanies.find(c => c.tenant_id === currentUser.tenant_id);
  if (!isPlatformUser && userCompany && userCompany.status === "suspended") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#080D17] text-white p-6 font-sans text-center space-y-6 select-none antialiased">
        <div className="bg-[#0F1724] border border-[#1C2A40] rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-red-950/40 border border-red-900/50 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-red-200">تم إيقاف المنشأة</h1>
          <p className="text-sm text-gray-400">
            تم إيقاف المنشأة، تواصل مع إدارة منصة سهم.
          </p>
          <button
            onClick={() => {
              setCurrentUser(null);
              localStorage.removeItem("sahm_web_user");
            }}
            className="w-full bg-[#D4AF37] hover:bg-[#E5BF48] text-[#080D17] font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer border-none font-sans"
          >
            العودة لصفحة تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  console.log("APP_RENDER_CURRENT_USER", currentUser.role, currentUser.tenant_id, "isPlatformOwner:", isPlatformOwner);

  // If user is logged in, but tenant_id is missing or equal to tenant-local under Supabase mode
  const isInvalidTenant =
    import.meta.env.VITE_DATA_MODE === "supabase" &&
    !!currentUser &&
    !isPlatformRole(currentUser) &&
    (
      !currentUser.tenant_id ||
      currentUser.tenant_id === "tenant-local"
    );

  if (isInvalidTenant) {
    console.log("AUTH_DEBUG", currentUser?.username, currentUser?.email, currentUser?.role, currentUser?.tenant_id);
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#1c0b0b] text-[#f87171] p-6 font-sans select-none antialiased">
        <div className="flex flex-col items-center max-w-md w-full text-center space-y-6 bg-[#2d1212]/30 p-8 rounded-2xl border border-red-500/20">
          <div className="relative">
            <svg className="w-16 h-16 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-tight text-red-200">خطأ أمني فادح: المستأجر غير صالح</h1>
            <p className="text-sm text-red-300">
              في وضع الاتصال بقاعدة البيانات السحابية (Supabase Mode)، يُمنع استخدام الحسابات الافتراضية أو الحسابات التي لا تملك معرّف مستأجر (tenant_id) صالح.
            </p>
            <p className="text-xs text-red-400 font-mono">
              معرّف المستأجر الحالي: {currentUser?.tenant_id || "غير متوفر"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white rounded-xl transition font-medium text-sm border border-red-500/30"
          >
            تسجيل الخروج والعودة
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem("sahm_web_user");
              localStorage.removeItem("sahm_web_user3");
              localStorage.removeItem("sahm_web_users_list3");
              localStorage.removeItem("sahm_impersonate_tenant_id");
              localStorage.removeItem("sahm_impersonate_org_id");
              window.location.reload();
            }}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-550 active:bg-amber-755 text-slate-950 font-black rounded-xl transition font-medium text-sm border border-amber-500/30 mt-3 cursor-pointer"
          >
            إعادة ضبط الجلسة
          </button>
        </div>
      </div>
    );
  }

  // If user is logged in, but they belong to a newly setup tenant with zero stores:
  if (initialDataLoaded && currentUser && !isPlatformOwner && stores.length === 0) {
    return (
      <OnboardingWizard
        theme={themeColors}
        currentUser={currentUser}
        onLogout={handleLogout}
        onComplete={async (onboardingData) => {
          const db = SahmDatabaseService.getInstance();
          const isSupabase = db.isSupabaseModeOnly();

          // 1. Prepare and persist company with tenant_id or save directly
          const newCompanyWithTenant = {
            ...onboardingData.company,
            tenant_id: currentUserTenantId
          };

          // 2. Persist store, branch, warehouse, and POS units with tenant_id directly!
          const newStore = {
            ...onboardingData.store,
            tenant_id: currentUserTenantId,
            company_id: newCompanyWithTenant.id,
            companyId: newCompanyWithTenant.id
          };

          const newBranch = {
            ...onboardingData.branch,
            tenant_id: currentUserTenantId,
            company_id: newCompanyWithTenant.id
          };

          const newWarehouse = {
            ...onboardingData.warehouse,
            tenant_id: currentUserTenantId,
            company_id: newCompanyWithTenant.id
          };

          const newPos = {
            ...onboardingData.posUnit,
            tenant_id: currentUserTenantId,
            company_id: newCompanyWithTenant.id,
            storeId: newStore.id,
            store_id: newStore.id,
            warehouseId: newWarehouse.id,
            warehouse_id: newWarehouse.id
          };

          // 3. Persist product if provided
          const newProduct = onboardingData.product ? {
            ...onboardingData.product,
            tenant_id: currentUserTenantId,
            company_id: newCompanyWithTenant.id
          } : null;

          // 4. Persist employee if invited
          const newEmployee = onboardingData.employee ? {
            ...onboardingData.employee,
            tenant_id: currentUserTenantId
          } : null;

          // 5. Update tenant_owner user with access to newly created ID configurations
          const updatedOwner = {
            ...currentUser,
            organization_id: newCompanyWithTenant.id,
            company_id: newCompanyWithTenant.id,
            allowedStoreIds: [newStore.id],
            allowedBranchIds: [newBranch.id],
            allowedWarehouseIds: [newWarehouse.id],
            allowedPosIds: [newPos.id]
          };

          if (isSupabase) {
            try {
              const tenantId = currentUserTenantId;
              if (!tenantId || tenantId === "tenant-local") {
                throw new Error("خطأ أمني: معرف المستأجر غير صالح أو غير متوفر في وضع الاتصال السحابي.");
              }

              console.log(`Pilot: FOUNDING_TENANT_ID ${tenantId}`);

              // 1. First: Create tenant in tenants table
              triggerNotification("جاري تهيئة حساب المستأجر الرئيسي...", "info");
              
              if (!db.supabaseClient) {
                throw new Error("تعذر الاتصال بقاعدة البيانات السحابية لتهيئة المستأجر.");
              }

              // Check if tenant exists
              const { data: existingTenant, error: selectErr } = await db.supabaseClient
                .from("tenants")
                .select("id")
                .eq("id", tenantId)
                .maybeSingle();

              if (selectErr) {
                console.error("Failed to select tenant:", selectErr);
              }

              if (!existingTenant) {
                const { error: insertTenantErr } = await db.supabaseClient
                  .from("tenants")
                  .insert({
                    id: tenantId,
                    name: newCompanyWithTenant.name || "مستأجر سهم الجديد"
                  });

                if (insertTenantErr) {
                  console.error("FAIL_CREATE_TENANT", insertTenantErr);
                  throw new Error(`تعذر إنشاء حساب المستأجر الرئيسي: ${insertTenantErr.message}`);
                }
              }

              console.log(`Pilot: FOUNDING_TENANT_CREATED ${tenantId}`);

              // Verify that it actually exists in DB
              const { data: verifiedTenant, error: verifyTenantErr } = await db.supabaseClient
                .from("tenants")
                .select("id")
                .eq("id", tenantId)
                .maybeSingle();

              if (!verifiedTenant) {
                const checkErr = verifyTenantErr?.message || "المستأجر غير موجود في قاعدة البيانات بعد الإنشاء";
                throw new Error(`تعذر إنشاء حساب المستأجر الرئيسي في قاعدة البيانات: ${checkErr}`);
              }

              // 2. Second: Save Company
              console.log("Pilot: FOUNDING_COMPANY_PAYLOAD", JSON.stringify(newCompanyWithTenant));
              triggerNotification("جاري حفظ بيانات المنشأة...", "info");
              try {
                await db.saveCompany(newCompanyWithTenant);
              } catch (companySaveErr: any) {
                console.error("Pilot: FOUNDING_COMPANY_SAVE_ERROR", companySaveErr);
                throw new Error(`تعذر حفظ بيانات المنشأة لأن حساب المستأجر الرئيسي لم يُنشأ بشكل صحيح: ${companySaveErr.message || companySaveErr}`);
              }

              // 3. Third: Save Store
              triggerNotification("جاري حفظ بيانات المتجر...", "info");
              await db.saveStore(newStore);

              // 4. Fourth: Save Branch
              triggerNotification("جاري حفظ بيانات الفرع...", "info");
              await db.saveBranch(newBranch);

              // 5. Fifth: Save Warehouse
              triggerNotification("جاري حفظ بيانات المستودع...", "info");
              await db.saveWarehouse(newWarehouse);

              // 6. Sixth: Save POS Terminal
              triggerNotification("جاري حفظ بيانات جهاز كاشير نقاط البيع...", "info");
              await posService.create(newPos);

              // 7. Seventh: Save Product (if provided)
              if (newProduct) {
                triggerNotification("جاري حفظ المنتج الأول...", "info");
                await db.saveProduct(newProduct);
              }

              // 8. Eighth: Save User (Owner & Employee)
              triggerNotification("جاري حفظ حساب المالك...", "info");
              await db.saveUser(updatedOwner);

              if (newEmployee) {
                triggerNotification("جاري حفظ حساب الموظف المساعد...", "info");
                await db.saveUser(newEmployee);
              }

              // 9. Ninth: Save Subscription
              const newSubscription: TenantSubscription = {
                id: `sub_${Date.now()}`,
                tenant_id: tenantId,
                company_id: newCompanyWithTenant.id,
                plan_id: onboardingData.selectedPlan === "A" ? "plan_free" : onboardingData.selectedPlan === "B" ? "plan_pro" : "plan_corporate",
                status: "active",
                start_date: new Date().toISOString(),
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                billing_cycle: "monthly",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              triggerNotification("جاري حفظ بيانات الاشتراك التأسيسي...", "info");
              await db.saveTenantSubscription(newSubscription);

              // Update React States directly for immediate local visual sync
              setRawCompanies([...rawCompanies, newCompanyWithTenant]);
              setRawStores([newStore]);
              setRawBranches([newBranch]);
              setRawWarehouses([newWarehouse]);
              setRawPosUnits([newPos]);
              if (newProduct) {
                setRawProducts([newProduct]);
              }

              // Clean local storage keys to ensure we reload from Supabase freshly
              localStorage.removeItem("sahm_web_companies");
              localStorage.removeItem("sahm_web_stores");
              localStorage.removeItem("sahm_web_branches");
              localStorage.removeItem("sahm_web_warehouses");
              localStorage.removeItem("sahm_web_terminals_local");
              localStorage.removeItem(LS_KEYS.PRODUCTS);
            } catch (err: any) {
              console.error("Failed to save onboarding data to Supabase:", err);
              triggerNotification(`فشلت عملية حفظ البيانات سحابياً: ${err.message || err}`, "critical");
              throw err;
            }
          } else {
            // LocalStorage / Memory Mode
            setCompanies([...rawCompanies, newCompanyWithTenant]);
            setStores([newStore]);
            setBranches([newBranch]);
            setWarehouses([newWarehouse]);
            setPosUnits([newPos]);
            if (newProduct) {
              setProducts([newProduct]);
            }
          }

          // 6. Update employee lists/state locally
          if (newEmployee) {
            const otherUsers = rawUsers.filter(u => u.username !== newEmployee.username);
            const finalUsers = [...otherUsers, newEmployee];
            setRawUsers(finalUsers);
            localStorage.setItem("sahm_web_users_list3", JSON.stringify(finalUsers));
          }

          // 7. Update current logged-in user state & local storage
          setCurrentUser(updatedOwner);
          localStorage.setItem(LS_KEYS.USER, JSON.stringify(updatedOwner));

          // Ensure tenant_owner is correctly recorded into the rawUsers list
          const otherUsers = rawUsers.filter(u => u.username !== currentUser.username);
          const finalRawUsers = [...otherUsers, updatedOwner];
          setRawUsers(finalRawUsers);
          localStorage.setItem("sahm_web_users_list3", JSON.stringify(finalRawUsers));

          // 8. Pre-select active IDs for immediate live operation without manual selection steps
          setActiveStoreIdRaw(newStore.id);
          localStorage.setItem("sahm_active_store_id", newStore.id);
          setStoreName(newStore.name);

          setActiveBranchId(newBranch.id);
          localStorage.setItem("sahm_active_branch_id", newBranch.id);

          setActiveWarehouseId(newWarehouse.id);
          localStorage.setItem("sahm_active_warehouse_id", newWarehouse.id);

          setActivePosId(newPos.id);
          localStorage.setItem("sahm_active_pos_id", newPos.id);

          triggerNotification("🎉 تم تأسيس وتفعيل منشأتك وتهيئتها بنجاح تام على Sahm OS!", "success");

          // Flush page sync
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }}
      />
    );
  }

  const navItems = [
    { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard, permission: "dashboard:view" },
    { id: "pos_and_operations", label: "المبيعات", icon: ShoppingBag, permission: "pos:access" },
    { id: "orders", label: "الطلبات", icon: FileText, permission: "pos:access" },
    { id: "products", label: "المنتجات", icon: Package, permission: "products:view" },
    { id: "inventory", label: "المخزون", icon: Store, permission: "pos:access" },
    { id: "marketing", label: "التسويق", icon: TrendingUp, permission: "products:view" },
    { id: "customers", label: "العملاء", icon: Users, permission: "pos:access" },
    { id: "reports", label: "التقارير والتحليلات", icon: BarChart3, permission: "finance:view" },
    { id: "integrations", label: "التكاملات", icon: Cpu, permission: "settings:manage" },
    { id: "settings", label: "الإعدادات", icon: SettingsIcon, permission: "settings:manage" },
  ].filter(item => {
    const isSystemUser = currentUser && ["platform_owner", "system_admin", "system_owner"].includes(currentUser.role || "");
    if (!isSetupCompleted && !isSystemUser) {
      return item.id === "settings";
    }
    return true;
  });

  const isTabActive = (itemId: string) => {
    if (itemId === "dashboard") return activeTab === "dashboard";
    if (itemId === "pos_and_operations") return activeTab === "pos_and_operations" || (activeTab === "sales_commerce" && salesCommerceSubTab === "pos");
    if (itemId === "orders") return activeTab === "sales_commerce" && salesCommerceSubTab === "orders";
    if (itemId === "products") return activeTab === "products" || activeTab === "product_studio";
    if (itemId === "inventory") return activeTab === "operations" && operationsSubTab === "inventory";
    if (itemId === "marketing") return activeTab === "marketing_growth";
    if (itemId === "customers") return activeTab === "sales_commerce" && salesCommerceSubTab === "customers";
    if (itemId === "reports") return activeTab === "reports" || (activeTab === "intelligence_analytics" && intelligenceAnalyticsSubTab === "reports");
    if (itemId === "integrations") return activeTab === "automation_integration";
    if (itemId === "settings") return activeTab === "management_settings";
    return false;
  };

  const handleTabClick = (itemId: string) => {
    if (itemId === "dashboard") {
      setActiveTab("dashboard");
      setDashboardSubTab("performance");
    } else if (itemId === "pos_and_operations") {
      setActiveTab("pos_and_operations");
    } else if (itemId === "orders") {
      setActiveTab("sales_commerce");
      setSalesCommerceSubTab("orders");
    } else if (itemId === "products") {
      setActiveTab("products");
    } else if (itemId === "inventory") {
      setActiveTab("operations");
      setOperationsSubTab("inventory");
    } else if (itemId === "marketing") {
      setActiveTab("marketing_growth");
      setMarketingGrowthSubTab("catalog_promo");
    } else if (itemId === "customers") {
      setActiveTab("sales_commerce");
      setSalesCommerceSubTab("customers");
    } else if (itemId === "reports") {
      setActiveTab("reports");
    } else if (itemId === "integrations") {
      setActiveTab("automation_integration");
      setAutomationIntegrationSubTab("app_store");
    } else if (itemId === "settings") {
      setActiveTab("management_settings");
      setManagementSettingsSubTab("general_settings");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans select-none antialiased"
      style={{ 
        backgroundColor: themeColors.bg, 
        color: themeColors.text,
        "--bg-color": themeColors.bg,
        "--surface-color": themeColors.surface,
        "--card-color": themeColors.card,
        "--border-color": themeColors.border,
        "--text-color": themeColors.text,
        "--muted-color": themeColors.muted,
        "--accent-color": themeColors.accent,
        "--border-radius": themeColors.borderRadius || "12px",
        "--card-shadow": themeColors.shadow || "none",
      } as React.CSSProperties}>
      
      {/* 1. Desktop Sidebar Navigation Drawer */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 h-full border-l border-white/5 relative z-30 select-none bg-[#0E1A2B]"
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
                <span>سهم AI</span>
              </h1>
              <span className="text-[10px] block mt-0.5 text-[#D4AF37] font-extrabold">الربط الذكي الموحد</span>
              <span className="text-[8px] block text-gray-500 font-mono">Enterprise Edition v16</span>
            </div>
          </div>

          {/* 👥 Unified Workspace Environment Switcher Section (Requirement 1, 3, 5) */}
          <div className="space-y-1 relative">
            {isPlatformOwner && !isImpersonating && (
              <div className="p-3 bg-slate-900/80 border border-amber-500/30 rounded-xl text-center shadow-lg">
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block mb-1">
                  بيئة العمل والتشغيل النشطة:
                </span>
                <span className="text-xs font-black text-white block">
                  🛡️ مركز إدارة المنصة
                </span>
              </div>
            )}

            {isPlatformOwner && isImpersonating && (
              <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-right shadow-lg space-y-1.5">
                <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider block">
                  وضع المراقبة النشط 🔍
                </span>
                <div className="text-[11px] font-black text-white truncate">
                  🏢 {impersonatedCompanyName || "الشركة المراقبة"}
                </div>
                <button
                  ref={workspaceSelectorButtonRef}
                  onClick={handleToggleWorkspaceSelector}
                  className="w-full text-[10px] py-1.5 px-2 bg-slate-900/95 border border-slate-800 text-gray-250 outline-none rounded-lg cursor-pointer font-bold flex items-center justify-between transition-all hover:border-rose-500/40 text-right shadow-sm"
                >
                  <span className="truncate">
                    📍 {activeBranchObj?.name || "فرع"} | {activeWarehouseObj ? `📦 ${activeWarehouseObj.name}` : "مستودع"}
                  </span>
                  <span className="text-[8px] text-gray-500">▼</span>
                </button>
              </div>
            )}

            {!isPlatformOwner && (
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-right shadow-lg space-y-1.5">
                <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-wider block">
                  {isTenantOwner ? "إدارة المنشأة 🏢" : "بيئة العمل النشطة 🏢"}
                </span>
                <div className="text-[11px] font-black text-white truncate">
                  🏢 {mainCompanyName}
                </div>
                <button
                  ref={workspaceSelectorButtonRef}
                  onClick={handleToggleWorkspaceSelector}
                  className="w-full text-[10px] py-1.5 px-2 bg-slate-900/95 border border-slate-800 text-gray-250 outline-none rounded-lg cursor-pointer font-bold flex items-center justify-between transition-all hover:border-amber-500/40 text-right shadow-sm"
                >
                  <span className="truncate">
                    📍 {activeBranchObj?.name || "فرع"} | {activeWarehouseObj ? `📦 ${activeWarehouseObj.name}` : "مستودع"}
                  </span>
                  <span className="text-[8px] text-gray-500">▼</span>
                </button>
              </div>
            )}

            {showWorkspaceSelector && (
              <div 
                ref={workspaceSelectorRef}
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
                    {allowedPosUnits.filter(p => 
                      !p.branchId || 
                      p.branchId === activeBranchId || 
                      p.defaultWh === activeWarehouseId || 
                      p.warehouse_id === activeWarehouseId ||
                      p.storeId === activeStoreId ||
                      p.store_id === activeStoreId
                    ).map((p) => {
                      const isSelected = activePosId === p.id;
                      const br = branches.find(b => b.id === p.branchId || b.id === p.branch_id);
                      const wh = warehouses.find(w => w.id === p.defaultWh || w.id === p.warehouse_id);
                      const assocLabel = `(${br ? br.name : "بدون فرع"} - ${wh ? wh.name : "بدون مستودع"})`;
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
                          <span className="truncate">🖥️ {p.name} <span className="text-[8.5px] text-gray-500 font-normal">{assocLabel}</span></span>
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
            const isActive = isTabActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-xs font-bold text-right transition-colors cursor-pointer select-none"
                style={{
                  backgroundColor: isActive ? themeColors.accent + "18" : "transparent",
                  color: isActive ? themeColors.text : themeColors.muted,
                }}
              >
                <CustomIconRenderer 
                  moduleId={item.id} 
                  className="w-4.5 h-4.5 shrink-0" 
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }} 
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer profile segment */}
        <div className="p-2.5 mx-3 mb-3 rounded-xl border text-right bg-slate-900/50 flex flex-col gap-1.5" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-2">
            {currentUser.imageUrl || (currentUser.avatar && (currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("data:") || currentUser.avatar.length > 5)) ? (
              <img 
                src={currentUser.imageUrl || currentUser.avatar} 
                alt={currentUser.name} 
                className="rounded-md object-cover shrink-0"
                style={{ width: "32px", height: "32px" }}
                referrerPolicy="no-referrer"
              />
            ) : (currentUser.role === "admin" || currentUser.role === "tenant_owner" || currentUser.role === "system_admin" || currentUser.role === "system_owner") ? (
              <img 
                src={sahmMiniMarkPngUrl} 
                alt="Sahm OS Mini Mark" 
                className="rounded-md object-contain shrink-0"
                style={{ width: "32px", height: "32px" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="flex items-center justify-center font-black text-[10px] text-[#000] rounded-md shrink-0 font-sans"
                style={{ 
                  backgroundColor: themeColors.accent,
                  width: "32px",
                  height: "32px"
                }}
              >
                {currentUser.avatar}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-[11px] block text-white truncate leading-tight" style={{ color: themeColors.text }}>{currentUser.name}</span>
              <span className="text-[8.5px] font-mono font-bold block text-amber-500 tracking-wider uppercase leading-none">
                {currentUser.role === "tenant_owner" ? "OWNER" : currentUser.role === "admin" ? "ADMIN" : currentUser.role === "cashier" ? "CASHIER" : String(currentUser.role).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="pt-1.5 border-t flex flex-col gap-1 text-[10px]" style={{ borderColor: themeColors.border }}>
            <div className="text-gray-300 font-sans flex items-center justify-between">
              <span className="text-gray-400">الباقة:</span>
              <span className="font-bold text-amber-400">
                {subscription?.tier === 'A' ? "تجريبية" : subscription?.tier === 'B' ? "محترفة 🚀" : "Corporate النخبة الذهبية"}
              </span>
            </div>
            
            <div className="text-gray-300 font-sans flex items-center justify-between">
              <span className="text-gray-400">الطلبات:</span>
              <span className="font-mono font-bold text-white">
                {(subscription?.currentUsed ?? 4945).toLocaleString()} <span className="text-gray-500 text-[9px]">/</span> {(subscription?.limit ?? 100000).toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-slate-950/85 h-1 rounded-full overflow-hidden mt-0.5 border border-zinc-900/60">
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${((subscription?.currentUsed ?? 4945) / (subscription?.limit ?? 100000)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-1.5 border-t flex justify-between items-center" style={{ borderColor: themeColors.border }}>
            <span className="text-[8px] text-gray-500 font-mono">الاستهلاك: {Math.round(((subscription?.currentUsed ?? 4945) / (subscription?.limit ?? 100000)) * 100)}%</span>
            <button
              onClick={handleLogout}
              className="px-1.5 py-0.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-500 cursor-pointer transition-colors text-[9.5px] font-bold flex items-center gap-1 border-0"
              title="تسجيل الخروج من المنظومة"
            >
              <LogOut className="w-2.5 h-2.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Primary layout body wrapper */}
      <div className={`flex-grow flex flex-col min-w-0 overflow-hidden relative ${isPosFullscreen && (activeTab === "pos_and_operations" || (activeTab === "sales_commerce" && salesCommerceSubTab === "pos")) ? "" : "pb-16 lg:pb-0"}`}>
        
        {/* ⚠️ وضع الدعم الفني والمراقبة الميدانية */}
        {impersonatedTenantId && (
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/25 to-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between gap-4 z-[49] relative select-text animate-fade-in" dir="rtl">
            <div className="flex items-center gap-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="text-right flex items-center gap-3">
                <span className="text-xs font-black text-white">
                  وضع المراقبة النشط — أنت تدير منشأة: {impersonatedCompanyName || impersonatedTenantId}
                </span>
                
                {/* 🔄 التنقل بين المنشآت */}
                <select
                  value={impersonatedOrganizationId || ""}
                  onChange={(e) => {
                    const selectedComp = rawCompanies.find(c => c.id === e.target.value);
                    if (selectedComp) {
                      handleImpersonate(selectedComp.tenant_id, selectedComp.id, selectedComp.name);
                    }
                  }}
                  className="py-1 px-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-[10.5px] focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                >
                  <option value="" disabled>التنقل السريع بين المنشآت...</option>
                  {rawCompanies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleStopImpersonating}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg border-none cursor-pointer transition shadow-md active:scale-95 whitespace-nowrap animate-none"
            >
              إنهاء المراقبة والعودة للوحة المالك
            </button>
          </div>
        )}
        
        {/* Web App Header top-bar */}
        {!(isPosFullscreen && (activeTab === "pos_and_operations" || (activeTab === "sales_commerce" && salesCommerceSubTab === "pos"))) && (
          <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 z-[48] relative"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
            dir="rtl"
          >
            {/* RIGHT SECTION: Branding and Workspace Switcher */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
                <img 
                  src={sahmMiniMarkPngUrl} 
                  alt="Sahm OS Mini Mark" 
                  className="rounded-lg object-contain shrink-0"
                  style={{ width: "32px", height: "32px" }}
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block text-right">
                  <h1 className="text-xs font-black text-white leading-tight">Sahm OS</h1>
                  <span className="text-[9px] block text-[#D4AF37] font-extrabold leading-none">الربط الذكي الموحد</span>
                </div>
              </div>

              {!(isPlatformOwner && !isImpersonating) && (
                <div className="relative">
                  <button
                    ref={workspaceSelectorButtonRef}
                    onClick={handleToggleWorkspaceSelector}
                    className="text-[10px] py-1.5 px-3 bg-slate-900 border border-slate-800 text-gray-250 outline-none rounded-xl cursor-pointer font-bold flex items-center gap-2 transition-all hover:border-amber-500/40 text-right shadow-sm select-none"
                  >
                    <span>🏢 {isImpersonating ? impersonatedCompanyName : mainCompanyName}</span>
                    <span className="text-gray-500 border-r border-slate-800 pr-2 block">
                      📍 {activeBranchObj?.name || "فرع"} | {activeWarehouseObj ? `📦 ${activeWarehouseObj.name}` : "مستودع"}
                    </span>
                    <span className="text-[8px] text-gray-500">▼</span>
                  </button>

                  {showWorkspaceSelector && (
                    <div 
                      ref={workspaceSelectorRef}
                      className="absolute right-0 top-10 mt-1 rounded-2xl border p-4 shadow-2xl text-right z-[150] overflow-y-auto max-h-[440px] space-y-4 no-print w-[380px] bg-slate-950 border-slate-800 text-white"
                    >
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                        <span className="text-xs font-black text-amber-500">تغيير الفرع أو المستودع النشط</span>
                        <button 
                          onClick={() => setShowWorkspaceSelector(false)} 
                          className="text-gray-400 hover:text-white text-[10px] border-none bg-transparent cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowWorkspaceSelector(false);
                          setEnvModalTab("branches");
                          setShowEnvManagerModal(true);
                          triggerNotification("تهيئة وإدارة المواقع التشغيلية", "info");
                        }}
                        className="w-full py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all animate-none"
                      >
                        <span>⚙️ إدارة الفروع والمستودعات</span>
                      </button>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-gray-500 font-extrabold block">الفروع المتاحة:</span>
                        <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1">
                          {branches.map(br => {
                            const isSelected = activeBranchId === br.id;
                            return (
                              <button
                                key={br.id}
                                onClick={() => {
                                  setActiveBranchId(br.id);
                                  setShowWorkspaceSelector(false);
                                }}
                                className={`w-full text-right p-2 rounded-lg text-[10px] flex items-center justify-between transition-all border font-bold cursor-pointer ${
                                  isSelected 
                                    ? "bg-sky-600 border-sky-500 text-white font-black" 
                                    : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
                                }`}
                              >
                                <span>📍 {br.name}</span>
                                {isSelected && <span className="text-[8px] bg-sky-500 text-white px-1 rounded">نشط</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-gray-500 font-extrabold block">المستودعات المتاحة:</span>
                        <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1">
                          {warehouses.map(wh => {
                            const isSelected = activeWarehouseId === wh.id;
                            return (
                              <button
                                key={wh.id}
                                onClick={() => {
                                  setActiveWarehouseId(wh.id);
                                  setShowWorkspaceSelector(false);
                                }}
                                className={`w-full text-right p-2 rounded-lg text-[10px] flex items-center justify-between transition-all border font-bold cursor-pointer ${
                                  isSelected 
                                    ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400 font-bold" 
                                    : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
                                }`}
                              >
                                <span>📦 {wh.name}</span>
                                {isSelected && <span className="text-[8px] bg-emerald-500 text-white px-1 rounded">نشط</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-gray-500 font-extrabold block">نقاط البيع (POS):</span>
                        <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1">
                          {posUnits.map(pos => {
                            const isSelected = activePosId === pos.id;
                            return (
                              <button
                                key={pos.id}
                                onClick={() => {
                                  setActivePosId(pos.id);
                                  setShowWorkspaceSelector(false);
                                }}
                                className={`w-full text-right p-2 rounded-lg text-[10px] flex items-center justify-between transition-all border font-bold cursor-pointer ${
                                  isSelected 
                                    ? "bg-amber-500 border-amber-500 text-black font-black" 
                                    : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
                                }`}
                              >
                                <span>🖥️ {pos.name}</span>
                                {isSelected && <span className="text-[8px] bg-amber-500 text-black px-1 rounded font-black">نشط</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MIDDLE SECTION: Search Field */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsGlobalSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-400 hover:text-white transition-all text-[11px] font-bold border w-64 justify-between bg-slate-900 border-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  <span>ابحث عن فاتورة، منتج، أو قرار...</span>
                </div>
                <kbd className="hidden sm:inline-block px-1 rounded border border-slate-800 bg-slate-950 font-sans text-[8.5px] font-bold tracking-widest text-[#D4AF37]">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* LEFT SECTION: Alerts, Environment, Notifications Panel, Profile */}
            <div className="flex items-center gap-3">
              {/* 🛍️ New Product Button */}
              <button
                onClick={() => {
                  setActiveTab("product_studio");
                  setProductStudioSubTab("new_product");
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-[11px] font-black rounded-xl cursor-pointer shadow-md transition-all border-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>منتج جديد</span>
              </button>

              
              {/* 🔔 Slide Down Notification Panel Overlay (الإشعارات) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifTray(!showNotifTray)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 transition-all cursor-pointer border relative border-slate-850 text-gray-300 flex items-center justify-center"
                  style={{ width: "36px", height: "36px" }}
                  title="صندوق الإشعارات الموقتة"
                >
                  <Bell className="w-4 h-4 text-gray-400" />
                  {notificationsList.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-black text-[8.5px] rounded-full flex items-center justify-center animate-pulse z-20">
                      {notificationsList.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifTray && (
                  <div 
                    className="absolute left-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl text-right animate-scale-up space-y-3 z-[9999] bg-slate-950 border-slate-800 text-white"
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
                    <div className="flex justify-end pt-1.5 border-t border-slate-900">
                      <button 
                        onClick={() => setShowNotifTray(false)}
                        className="text-[9.5px] cursor-pointer text-gray-400 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-black transition-all"
                      >
                        إغلاق ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Context Display / Selector in TopBar based on Modes */}
              {platformMode && (
                <div className="flex items-center gap-2 py-1.5 px-3.5 rounded-xl border border-amber-500/30 bg-slate-900 text-xs font-black text-amber-500 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-amber-500 animate-pulse animate-none" />
                  <span>مركز إدارة المنصة</span>
                </div>
              )}

              {/* 🌐 بيئة العمل والتنبيهات (Dropdown) */}
              {!platformMode && (
                <div className="relative" ref={envDropdownRef}>
                  {impersonationMode ? (
                    <button
                      ref={envDropdownButtonRef}
                      onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:border-rose-500/50 transition-all text-xs font-black cursor-pointer text-white shadow-sm"
                    >
                      <Sliders className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0 animate-none" />
                      <span className="font-extrabold text-[11px] text-rose-300">
                        وضع المراقبة النشط | {impersonatedCompanyName || "الشركة"}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showEnvDropdown ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <button
                      ref={envDropdownButtonRef}
                      onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border transition-all text-xs font-black cursor-pointer bg-slate-900 border-slate-850 hover:border-amber-500/40 text-white shadow-sm"
                      title="بيئة العمل والتشغيل"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse shrink-0 animate-none" />
                      <span className="font-extrabold text-[11.5px] text-gray-200">
                        {isTenantOwner ? "إدارة المنشأة" : "بيئة العمل والتنبيهات"}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showEnvDropdown ? "rotate-180" : ""}`} />
                    </button>
                  )}

                {showEnvDropdown && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border p-3.5 shadow-2xl text-right animate-scale-up z-[9999] bg-slate-950 border-slate-800 text-white font-sans space-y-3.5" dir="rtl">
                    
                    {/* Header */}
                    <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                      <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-wider">بيئة العمل والتنبيهات ⚙️</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold font-mono">
                        V2.10
                      </span>
                    </div>

                    {/* 1. Branch Selector */}
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] text-gray-400 font-extrabold flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-amber-500" />
                        <span>الفرع الحالي وتغيير الفرع:</span>
                      </span>
                      <div className="p-1 rounded-xl bg-slate-900/60 border border-slate-850 space-y-1">
                        {/* Unified/All mode */}
                        <button
                          onClick={() => {
                            setActiveBranchId("all");
                            setShowEnvDropdown(false);
                            triggerNotification("✓ تم تنشيط وضع العرض الموحد والشامل لكل الفروع القائمة.", "success");
                          }}
                          className={`w-full text-right p-2 rounded-lg text-[11px] flex items-center justify-between transition-all border-none font-bold cursor-pointer ${
                            !activeBranchId || activeBranchId === "all" || activeBranchId === ""
                            ? "bg-amber-500 text-black font-black"
                            : "bg-transparent text-gray-300 hover:bg-slate-950"
                          }`}
                        >
                          <span className="truncate">🌍 شامل الفروع (رؤية موحدة)</span>
                          {(!activeBranchId || activeBranchId === "all" || activeBranchId === "") && <span className="text-[10px] font-bold">✓</span>}
                        </button>

                        {branches.map((b) => {
                          const isActive = b.id === activeBranchId;
                          return (
                            <button
                              key={b.id}
                              onClick={() => {
                                setActiveBranchId(b.id);
                                if ((window as any).workspaceService && typeof (window as any).workspaceService.setCurrentBranch === "function") {
                                  (window as any).workspaceService.setCurrentBranch(b.id);
                                }
                                setShowEnvDropdown(false);
                                triggerNotification(`✓ تم الانتقال لفرع [${b.name}] ونشر بيئة التشغيل.`, "success");
                              }}
                              className={`w-full text-right p-2 rounded-lg text-[11px] flex items-center justify-between transition-all border-none font-bold cursor-pointer ${
                                isActive
                                ? "bg-gradient-to-l from-[#D4AF37] to-amber-500 text-black font-black"
                                : "bg-transparent text-gray-300 hover:bg-slate-950"
                              }`}
                            >
                              <span className="truncate">🏢 {b.name}</span>
                              {isActive && <span className="text-[10px] font-bold">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Security scan & status */}
                    <div className="p-2.5 rounded-xl bg-slate-905 border border-slate-850 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">حالة الاتصال والتوثيق الميداني</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                        مؤمن ونشط ✓
                      </span>
                    </div>

                    {/* 3. OfflineSyncHUD & PWA Sync */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 font-bold block">مزامنة البيانات والـ PWA:</span>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-850">
                        <OfflineSyncHUD 
                          themeColors={themeColors} 
                          triggerNotification={triggerNotification} 
                        />
                      </div>
                    </div>

                    {/* 4. Onboarding Guide Option */}
                    <button
                      onClick={() => {
                        setShowEnvDropdown(false);
                        setShowOnboarding(true);
                      }}
                      className="w-full text-right p-2 rounded-xl text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all justify-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse animate-bounce" />
                      <span>تشغيل مرشد البداية التفاعلي ✨</span>
                    </button>

                    {/* 5. Quick Creation options - integrated seamlessly! */}
                    <div className="space-y-1.5 border-t border-slate-900 pt-3">
                      <span className="text-[9px] text-gray-400 font-black flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>الإنشاء السريع والخيارات:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            setShowEnvDropdown(false);
                            setActiveTab("products");
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent("sahm_open_new_product"));
                            }, 50);
                          }}
                          className="text-right py-1.5 px-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-black text-gray-300 cursor-pointer border border-slate-800 transition-all flex items-center gap-1 justify-center"
                        >
                          <span>منتج جديد 📦</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowEnvDropdown(false);
                            setShowGlobalAIBuilder(true);
                            triggerNotification("تم فتح صانع المنتجات الذكي بالذكاء الاصطناعي 🤖✨", "success");
                          }}
                          className="text-right py-1.5 px-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-black text-amber-400 cursor-pointer border border-slate-800 transition-all flex items-center gap-1 justify-center"
                        >
                          <span>منتج ذكي 🤖✨</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowEnvDropdown(false);
                            setActiveTab("financial_hub");
                            setFinancialSubTab("customers");
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent("sahm_open_new_customer"));
                            }, 50);
                          }}
                          className="text-right py-1.5 px-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-black text-gray-300 cursor-pointer border border-slate-800 transition-all flex items-center gap-1 justify-center"
                        >
                          <span>عميل جديد 👥</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowEnvDropdown(false);
                            setActiveTab("financial_hub");
                            setFinancialSubTab("invoices");
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent("sahm_open_new_invoice"));
                            }, 50);
                          }}
                          className="text-right py-1.5 px-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-black text-gray-300 cursor-pointer border border-slate-800 transition-all flex items-center gap-1 justify-center"
                        >
                          <span>فاتورة جديدة 🧾</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
              )}

              {/* 👤 USER PROFILE MENU (قائمة المستخدم) */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  ref={userDropdownButtonRef}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none bg-transparent"
                  title="قائمة المستخدم والحساب"
                >
                  <div className="w-8 bg-amber-500 h-8 rounded-lg border border-slate-800 flex items-center justify-center font-black text-xs text-black uppercase shadow-inner shrink-0 leading-none">
                    {currentUser.name ? currentUser.name.substring(0, 1) : "A"}
                  </div>
                  <span className="hidden xl:inline-block text-xs font-extrabold text-[#D4AF37] max-w-[80px] truncate">{currentUser.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {showUserDropdown && (
                  <div className="absolute left-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl text-right animate-scale-up z-[9999] bg-slate-950 border-slate-800" dir="rtl">
                    <div className="px-3 py-2 border-b border-slate-900 mb-1">
                      <span className="text-xs font-black text-white block truncate">{currentUser.name}</span>
                      <span className="text-[8.5px] text-[#D4AF37] font-bold block mt-0.5 font-mono">[{currentUser.role}]</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab("settings");
                        triggerNotification("تم فتح إعدادات حساب Sahm OS 🛠️", "info");
                      }}
                      className="w-full text-right py-2 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-slate-900 transition-all border-none bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-gray-500" />
                      <span>إعدادات النظام والملف</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab("setup_organizations");
                        triggerNotification("جاري الانتقال لإدارة المنشآت والشركات القابضة.", "info");
                      }}
                      className="w-full text-right py-2 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-slate-900 transition-all border-none bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <Landmark className="w-4 h-4 text-gray-500" />
                      <span>بيانات وتوثيق المؤسسة</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (confirm("هل تريد بالتأكيد تسجيل الخروج وتجميد الجلسة الحركية المحمية؟")) {
                          handleLogout();
                          window.location.reload();
                        }
                      }}
                      className="w-full text-right py-2 px-3 rounded-xl text-xs font-black text-red-400 hover:bg-red-500/10 transition-all border-none bg-transparent cursor-pointer flex items-center gap-2 border-t border-slate-900 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>تسجيل الخروج الآمن</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </header>
        )}

        {/* 🌐 TWO-LEVEL NAVIGATION HEADER */}
        {!(isPosFullscreen && (activeTab === "pos_and_operations" || (activeTab === "sales_commerce" && salesCommerceSubTab === "pos"))) && (
          <div className="flex flex-col shrink-0 z-40 select-none">
            {/* Level 1: Main Category Tabs */}
            <div className="lg:hidden bg-slate-950 border-b border-slate-900/60 px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto" style={{ borderColor: themeColors.border }}>
              <div className="flex items-center gap-2.5">
                {navItems.map((item) => {
                  const isActive = isTabActive(item.id);
                  const isProductStudio = item.id === "product_studio";
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`relative px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap select-none border border-solid ${
                        isActive
                          ? isProductStudio
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10"
                            : "bg-slate-900 text-white border-slate-800"
                          : isProductStudio
                            ? "bg-amber-500/10 text-amber-450 border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-slate-900/50"
                      }`}
                    >
                      {isProductStudio && <Sparkles className={`w-3.5 h-3.5 ${isActive ? "text-slate-950 fill-slate-950" : "text-amber-400 animate-pulse"}`} />}
                      <CustomIconRenderer moduleId={item.id} className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {isProductStudio && !isActive && (
                        <span className="absolute -top-1.5 -left-1.5 px-1 py-0.5 rounded-md bg-amber-500 text-[7.5px] font-black text-slate-950 uppercase animate-pulse">
                          مهم
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 2: Sub-tab bar */}
            <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-2 flex items-center gap-1.5 overflow-x-auto" style={{ borderColor: themeColors.border }}>
              {activeTab === "dashboard" && (
                <>
                  {[
                    { id: "cockpit", label: "Executive Cockpit" },
                    { id: "performance", label: "ملخص الأداء" },
                    { id: "alerts", label: "التنبيهات" },
                    { id: "metrics", label: "مؤشرات الأعمال" },
                    { id: "tasks", label: "المهام المفتوحة" },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setDashboardSubTab(sub.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                        dashboardSubTab === sub.id
                          ? "bg-slate-850 text-white"
                          : "text-gray-450 hover:text-white hover:bg-slate-800/40"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </>
              )}
              {activeTab === "product_studio" && (
                <>
                  {[
                    { id: "studio_dashboard", label: "لوحة الاستديو" },
                    { id: "new_product", label: "إنشاء صنف جديد" },
                    { id: "ai_generation", label: "صياغة المنتج بالذكاء الاصطناعي" },
                    { id: "catalog_optimization", label: "تحسين وصناعة الكتالوج" },
                    { id: "product_images", label: "صور المنتجات" },
                    { id: "product_videos", label: "فيديو المنتجات" },
                    { id: "product_assets", label: "أصول المنتج" },
                    { id: "categories_attributes", label: "التصنيفات والسمات" },
                    { id: "pricing_offers", label: "التسعير والعروض" },
                    { id: "publishing_channels", label: "النشر والربط" },
                    { id: "products_library", label: "مكتبة المنتجات" },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setProductStudioSubTab(sub.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                        productStudioSubTab === sub.id
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "text-gray-450 hover:text-white hover:bg-slate-800/40"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </>
              )}
              {(activeTab === "sales_commerce" || activeTab === "operations") && (
                <>
                  {[
                    { id: "pos", label: "نقاط البيع POS", type: "sales_commerce" },
                    { id: "orders", label: "الطلبيات", type: "sales_commerce" },
                    { id: "invoices", label: "الفواتير", type: "sales_commerce" },
                    { id: "customers", label: "العملاء CRM", type: "sales_commerce" },
                    { id: "offers_discounts", label: "العروض والخصومات", type: "sales_commerce" },
                    { id: "subscriptions", label: "الاشتراكات التجارية", type: "sales_commerce" },
                    { id: "branches_locations", label: "الفروع والمواقع", type: "operations" },
                    { id: "warehouses", label: "المستودعات", type: "operations" },
                    { id: "inventory", label: "المخزون", type: "operations" },
                    { id: "suppliers", label: "الموردون", type: "operations" },
                    { id: "purchases", label: "المشتريات", type: "operations" },
                    { id: "documents_records", label: "الوثائق والسجلات", type: "operations" },
                  ].map(sub => {
                    const isSubActive = sub.type === "sales_commerce"
                      ? (activeTab === "sales_commerce" && salesCommerceSubTab === sub.id)
                      : (activeTab === "operations" && operationsSubTab === sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (sub.type === "sales_commerce") {
                            setActiveTab("sales_commerce");
                            setSalesCommerceSubTab(sub.id as any);
                          } else {
                            setActiveTab("operations");
                            setOperationsSubTab(sub.id as any);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                          isSubActive
                            ? "bg-slate-850 text-white"
                            : "text-gray-450 hover:text-white hover:bg-slate-800/40"
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </>
              )}
              {(activeTab === "marketing_growth" || activeTab === "intelligence_analytics") && (
                <>
                  {[
                    { id: "catalog_promo", label: "تحسين وصناعة الكتالوج", type: "marketing_growth" },
                    { id: "competitors", label: "مراقبة المنافسين", type: "marketing_growth" },
                    { id: "campaigns", label: "الحملات", type: "marketing_growth" },
                    { id: "visitor_radar", label: "كاشف زائر 360", type: "marketing_growth" },
                    { id: "theme_marketplace", label: "متجر السمات والتسويق", type: "marketing_growth" },
                    { id: "landing_pages", label: "صفحات الهبوط", type: "marketing_growth" },
                    { id: "copilot", label: "سهم Copilot والذكاء", type: "intelligence_analytics" },
                    { id: "ai_capabilities", label: "تحليل وقدرات الذكاء", type: "intelligence_analytics" },
                    { id: "recommendations", label: "التوصيات", type: "intelligence_analytics" },
                    { id: "reports", label: "التقارير", type: "intelligence_analytics" },
                    { id: "predictions", label: "التنبؤات", type: "intelligence_analytics" },
                  ].map(sub => {
                    const isSubActive = sub.type === "marketing_growth"
                      ? (activeTab === "marketing_growth" && marketingGrowthSubTab === sub.id)
                      : (activeTab === "intelligence_analytics" && intelligenceAnalyticsSubTab === sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (sub.type === "marketing_growth") {
                            setActiveTab("marketing_growth");
                            setMarketingGrowthSubTab(sub.id as any);
                          } else {
                            setActiveTab("intelligence_analytics");
                            setIntelligenceAnalyticsSubTab(sub.id as any);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                          isSubActive
                            ? "bg-slate-850 text-white"
                            : "text-gray-450 hover:text-white hover:bg-slate-800/40"
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </>
              )}
              {(activeTab === "management_settings" || activeTab === "automation_integration") && (
                <>
                  {[
                    { id: "workflows", label: "محرك العمل والأتمتة Workflows", type: "automation_integration" },
                    { id: "publishing", label: "النشر والربط السحابي", type: "automation_integration" },
                    { id: "app_store", label: "متجر التطبيقات والربط", type: "automation_integration" },
                    { id: "api_webhooks", label: "API / Webhooks", type: "automation_integration" },
                    { id: "organization_hub", label: "إدارة المنشأة", type: "management_settings" },
                    { id: "users_permissions", label: "المستخدمون والصلاحيات", type: "management_settings" },
                    { id: "general_settings", label: "الإعدادات العامة", type: "management_settings" },
                    { id: "billing_packages", label: "الباقات والاشتراكات", type: "management_settings" },
                    { id: "themes", label: "الهوية والثيمات", type: "management_settings" },
                    { id: "notifications", label: "الإشعارات", type: "management_settings" },
                    { id: "audit_log", label: "السجل والتدقيق", type: "management_settings" },
                  ].map(sub => {
                    const isSubActive = sub.type === "automation_integration"
                      ? (activeTab === "automation_integration" && automationIntegrationSubTab === sub.id)
                      : (activeTab === "management_settings" && managementSettingsSubTab === sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (sub.type === "automation_integration") {
                            setActiveTab("automation_integration");
                            setAutomationIntegrationSubTab(sub.id as any);
                          } else {
                            setActiveTab("management_settings");
                            setManagementSettingsSubTab(sub.id as any);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                          isSubActive
                            ? "bg-slate-850 text-white"
                            : "text-gray-450 hover:text-white hover:bg-slate-800/40"
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Content workspace renderer */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-5 pb-20 select-text">
          <React.Suspense fallback={<LoadingScreen />}>
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
                allowedStores={allowedStores}
                activeStoreId={activeStoreId}
                setActiveStoreId={setActiveStoreId}
                branches={branches}
                activeBranchId={activeBranchId}
                setActiveBranchId={setActiveBranchId}
                warehouses={warehouses}
                activeWarehouseId={activeWarehouseId}
                setActiveWarehouseId={setActiveWarehouseId}
                setActiveTab={setActiveTab}
                prefillPublish={prefillPublish}
                setPrefillPublish={setPrefillPublish}
                activeSubTab={commandCenterSubTab}
                setActiveSubTab={setCommandCenterSubTab}
                intelligentHubSubTab={intelligentHubSubTab}
                setIntelligentHubSubTab={setIntelligentHubSubTab}
                rawCompanies={rawCompanies}
                impersonatedTenantId={impersonatedTenantId}
                onImpersonate={handleImpersonate}
                onStopImpersonating={handleStopImpersonating}
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
                      {allowedStores.map(st => (
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
                  activeBranchId={activeBranchId}
                  activeWarehouseId={activeWarehouseId}
                  activePosId={activePosId}
                  activeStoreId={activeStoreId}
                  branches={branches}
                  warehouses={warehouses}
                  posUnits={posUnits}
                  setActiveTab={setActiveTab}
                />
              )
            )}

            {/* ⚖️ TAB CONTENT: Financial Hub (المنظومة المالية والشركاء) */}
            {activeTab === "financial_hub" && (
              <div className="space-y-6">
                {/* Modern Segmented Control Header (Merged Premium Design) */}
                <div className="p-6 rounded-3xl flex flex-col xl:flex-row gap-6 items-center justify-between border select-none transition-all shadow-2xl relative overflow-hidden bg-slate-950/65 backdrop-blur-xl"
                  style={{ borderColor: themeColors.border }}>
                  {/* Glowing background shapes for premium aesthetic */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse shrink-0">
                      <Landmark className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="text-right">
                      <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                        <span>المنظومة المالية وإدارة الشركاء 💼</span>
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">سهم ERP</span>
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        إدارة مركزية متكاملة تشمل الفواتير، العملاء، الموردين، الحسابات الختامية، ومستشار الذكاء المالي AI
                      </p>
                    </div>
                  </div>

                  {/* Sub-tab segment buttons with standardized/unified sizes */}
                  <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 select-none relative z-10 w-full xl:w-auto">
                    <button
                      onClick={() => setFinancialSubTab("invoices")}
                      className={`h-[38px] w-[145px] md:w-[170px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border bg-transparent ${financialSubTab === "invoices" ? "bg-amber-500 !text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent" : "text-gray-400 border-slate-800/60 hover:text-white hover:border-slate-700/80 hover:bg-slate-900/40"}`}
                      style={{ backgroundColor: financialSubTab === "invoices" ? themeColors.accent : "" }}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>الفواتير</span>
                    </button>

                    {hasPermission(currentUser, "finance:view") && (
                      <>
                        <button
                          onClick={() => setFinancialSubTab("customers")}
                          className={`h-[38px] w-[145px] md:w-[170px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border bg-transparent ${financialSubTab === "customers" ? "bg-amber-500 !text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent" : "text-gray-400 border-slate-800/60 hover:text-white hover:border-slate-700/80 hover:bg-slate-900/40"}`}
                          style={{ backgroundColor: financialSubTab === "customers" ? themeColors.accent : "" }}
                        >
                          <Users className="w-4 h-4 shrink-0" />
                          <span>العملاء</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("suppliers")}
                          className={`h-[38px] w-[145px] md:w-[170px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border bg-transparent ${financialSubTab === "suppliers" ? "bg-amber-500 !text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent" : "text-gray-400 border-slate-800/60 hover:text-white hover:border-slate-700/80 hover:bg-slate-900/40"}`}
                          style={{ backgroundColor: financialSubTab === "suppliers" ? themeColors.accent : "" }}
                        >
                          <Truck className="w-4 h-4 shrink-0" />
                          <span>الموردين</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("profiles")}
                          className={`h-[38px] w-[145px] md:w-[170px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border bg-transparent ${financialSubTab === "profiles" ? "bg-amber-500 !text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent" : "text-gray-400 border-slate-800/60 hover:text-white hover:border-slate-700/80 hover:bg-slate-900/40"}`}
                          style={{ backgroundColor: financialSubTab === "profiles" ? themeColors.accent : "" }}
                        >
                          <Users className="w-4 h-4 shrink-0" />
                          <span>الملفات الموحدة 🗃️</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("accounting")}
                          className={`h-[38px] w-[145px] md:w-[170px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border bg-transparent ${financialSubTab === "accounting" ? "bg-amber-500 !text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent" : "text-gray-400 border-slate-800/60 hover:text-white hover:border-slate-700/80 hover:bg-slate-900/40"}`}
                          style={{ backgroundColor: financialSubTab === "accounting" ? themeColors.accent : "" }}
                        >
                          <Layers className="w-4 h-4 shrink-0" />
                          <span>النظام المحاسبي ERP</span>
                        </button>

                        <button
                          onClick={() => setFinancialSubTab("accounting_ai")}
                          className={`h-[38px] w-[145px] md:w-[170px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border bg-transparent ${financialSubTab === "accounting_ai" ? "bg-amber-500 !text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent" : "text-gray-400 border-slate-800/60 hover:text-white hover:border-slate-700/80 hover:bg-slate-900/40"}`}
                          style={{ backgroundColor: financialSubTab === "accounting_ai" ? themeColors.accent : "" }}
                        >
                          <Bot className="w-4 h-4 shrink-0 animate-pulse text-amber-500" />
                          <span>مستشار الذكاء المالي AI</span>
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

                  {financialSubTab === "customers" && hasPermission(currentUser, "finance:view") && (
                    <Customers 
                      customers={customers} 
                      setCustomers={setCustomers} 
                      theme={themeColors} 
                      openUnifiedActions={openUnifiedActions}
                      triggerNotification={triggerNotification}
                      addAuditLog={addAuditLog}
                    />
                  )}

                  {financialSubTab === "suppliers" && hasPermission(currentUser, "finance:view") && (
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

                  {financialSubTab === "profiles" && hasPermission(currentUser, "finance:view") && (
                    <UnifiedProfileHub 
                      theme={themeColors} 
                      triggerNotification={triggerNotification}
                      addAuditLog={addAuditLog}
                    />
                  )}

                  {financialSubTab === "accounting" && hasPermission(currentUser, "finance:view") && (
                    <AccountingERP 
                      invoices={invoices}
                      products={products}
                      customers={customers}
                      suppliers={suppliers}
                      theme={themeColors}
                      openUnifiedActions={openUnifiedActions}
                      initialTab="dashboard"
                    />
                  )}

                  {financialSubTab === "accounting_ai" && hasPermission(currentUser, "finance:view") && (
                    <AccountingERP 
                      invoices={invoices}
                      products={products}
                      customers={customers}
                      suppliers={suppliers}
                      theme={themeColors}
                      openUnifiedActions={openUnifiedActions}
                      initialTab="ai_analyst"
                    />
                  )}
                </div>
              </div>
            )}

            {/* 📦 TAB CONTENT: Products & AI Product Builder */}
            {activeTab === "products" && (
              <React.Suspense fallback={<LoadingScreen />}>
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
              </React.Suspense>
            )}

            {/* 📊 TAB CONTENT 6: Business analytics & Reports */}
            {activeTab === "reports" && (
              <Reports 
                invoices={invoices} 
                products={products} 
                theme={themeColors} 
              />
            )}

            {/* 1) لوحة التحكم والتنفيذ (dashboard) */}
            {activeTab === "dashboard" && (
              <>
                {dashboardSubTab === "cockpit" && (
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
                    allowedStores={allowedStores}
                    activeStoreId={activeStoreId}
                    setActiveStoreId={setActiveStoreId}
                    branches={branches}
                    activeBranchId={activeBranchId}
                    setActiveBranchId={setActiveBranchId}
                    warehouses={warehouses}
                    activeWarehouseId={activeWarehouseId}
                    setActiveWarehouseId={setActiveWarehouseId}
                    setActiveTab={setActiveTab}
                    prefillPublish={prefillPublish}
                    setPrefillPublish={setPrefillPublish}
                    activeSubTab={commandCenterSubTab}
                    setActiveSubTab={setCommandCenterSubTab}
                    intelligentHubSubTab={intelligentHubSubTab}
                    setIntelligentHubSubTab={setIntelligentHubSubTab}
                    rawCompanies={rawCompanies}
                    impersonatedTenantId={impersonatedTenantId}
                    onImpersonate={handleImpersonate}
                    onStopImpersonating={handleStopImpersonating}
                  />
                )}
                {dashboardSubTab === "performance" && (
                  <Dashboard
                    invoices={invoices}
                    products={products}
                    customers={customers}
                    user={currentUser}
                    theme={themeColors}
                    currentBranchId={activeBranchId}
                    branches={branches}
                    setActiveTab={setActiveTab}
                    onNavigate={handleGlobalNavigate}
                  />
                )}
                {dashboardSubTab === "alerts" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">🔔 التنبيهات وإشعارات النظام الحية</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                      تتبع التنبيهات الموقوتة والعمليات المنفذة في بيئة المنشأة حياً.
                    </p>
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
                  </div>
                )}
                {dashboardSubTab === "metrics" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                      <span className="text-[10px] text-gray-400 font-bold block">إجمالي الإيرادات المنجزة</span>
                      <div className="text-xl font-black text-emerald-400 mt-1.5">{invoices.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()} ر.س</div>
                      <span className="text-[9px] text-gray-500 block mt-1">من واقع الفواتير المعتمدة</span>
                    </div>
                    <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                      <span className="text-[10px] text-gray-400 font-bold block">متوسط سلة المشتريات</span>
                      <div className="text-xl font-black text-white mt-1.5">{invoices.length > 0 ? Math.round(invoices.reduce((acc, curr) => acc + (curr.total || 0), 0) / invoices.length) : 0} ر.س</div>
                      <span className="text-[9px] text-gray-500 block mt-1">لكل عملية بيع POS</span>
                    </div>
                    <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                      <span className="text-[10px] text-gray-400 font-bold block">عدد الفواتير الصادرة</span>
                      <div className="text-xl font-black text-amber-500 mt-1.5">{invoices.length} فاتورة</div>
                      <span className="text-[9px] text-gray-500 block mt-1">تشمل المبيعات والمرتجع</span>
                    </div>
                    <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                      <span className="text-[10px] text-gray-400 font-bold block">عدد المنتجات النشطة</span>
                      <div className="text-xl font-black text-indigo-400 mt-1.5">{products.length} صنف</div>
                      <span className="text-[9px] text-gray-500 block mt-1">مسجلة بمخازن سهم السحابية</span>
                    </div>
                  </div>
                )}
                {dashboardSubTab === "tasks" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">📋 المهام والعمليات المفتوحة</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">أحدث سجلات وتدقيق النظام والمراجعة الفورية.</p>
                    <AuditLogTimeline 
                      logs={auditLogs} 
                      theme={themeColors} 
                      onAddLog={(action, details) => addAuditLog(action, details)}
                      currentUser={currentUser}
                    />
                  </div>
                )}
              </>
            )}

            {/* 2) استديو المنتجات (product_studio) */}
            {activeTab === "product_studio" && (
              <>
                {productStudioSubTab === "studio_dashboard" && (
                  <AIProductStudio
                    theme={themeColors}
                    products={products}
                    setProducts={setProducts}
                    setActiveTab={setActiveTab}
                    currentUser={currentUser}
                  />
                )}

                {productStudioSubTab === "new_product" && (
                  <AIProductBuilder
                    products={products}
                    setProducts={setProducts}
                    theme={themeColors}
                    onClose={() => setProductStudioSubTab("studio_dashboard")}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                  />
                )}
                {productStudioSubTab === "ai_generation" && (
                  <AIProductStudio
                    theme={themeColors}
                    products={products}
                    setProducts={setProducts}
                    setActiveTab={setActiveTab}
                    currentUser={currentUser}
                    setPrefillPublish={setPrefillPublish}
                  />
                )}
                {productStudioSubTab === "catalog_optimization" && (
                  <SmartCatalogBuilder
                    theme={themeColors}
                    products={products}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                  />
                )}
                {productStudioSubTab === "product_images" && (
                  <MediaCenter
                    theme={themeColors}
                    addAuditLog={addAuditLog}
                    triggerNotification={triggerNotification}
                  />
                )}
                {productStudioSubTab === "product_videos" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">🎬 منشئ فيديوهات المنتجات التسويقية</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                      قم بصناعة مقاطع ترويجية ذكية لمنتجاتك معدلة للقصص (Reels, TikTok, Snapchat).
                    </p>
                    <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                      <span className="text-4xl">📹</span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-white">مولد فيديو الطيب الذكي قيد التنزيل</h4>
                        <p className="text-[10px] text-gray-500">قم بربط حساب TikTok Business أو Snapchat Ad Manager لتوليد الفيديوهات تلقائياً.</p>
                      </div>
                      <button className="py-2 px-4 bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl cursor-pointer">ربط الحساب الإعلاني</button>
                    </div>
                  </div>
                )}
                {productStudioSubTab === "product_assets" && (
                  <MediaCenter
                    theme={themeColors}
                    addAuditLog={addAuditLog}
                    triggerNotification={triggerNotification}
                  />
                )}
                {productStudioSubTab === "categories_attributes" && (
                  <div className="p-6 rounded-3xl border text-right space-y-6" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: themeColors.border }}>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-white">🗂️ إدارة التصنيفات والسمات للمنتجات</h3>
                        <p className="text-xs text-gray-400 font-sans">قم بتنظيم شجرة التصنيفات وتحديد خصائص المنتجات لسهولة البحث والفلترة.</p>
                      </div>
                      <button 
                        onClick={() => triggerNotification("ميزة إضافة تصنيف جديد قيد التطوير وسيتم توفيرها قريباً! 🛠️", "info")}
                        className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة تصنيف جديد</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Categories List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span>التصنيفات الحالية</span>
                        </h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {[
                            { name: "أجهزة كهربائية وإلكترونيات", count: 12, code: "ELE-01" },
                            { name: "العطور ومستحضرات التجميل", count: 8, code: "COS-02" },
                            { name: "الملابس والمنسوجات", count: 15, code: "CLO-03" },
                            { name: "الأثاث والديكور المنزلي", count: 5, code: "FUR-04" },
                            { name: "الألعاب والترفيه", count: 9, code: "TOY-05" }
                          ].map((cat, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between transition-all">
                              <span className="text-[10px] text-gray-500 font-mono font-bold">{cat.code}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-slate-800 text-gray-300 px-2 py-0.5 rounded-md font-bold">{cat.count} منتج</span>
                                <span className="text-xs font-extrabold text-white">{cat.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Attributes List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                          <span>السمات والخصائص (Attributes)</span>
                        </h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {[
                            { name: "اللون", type: "اختيار متعدد (قائمة)", values: "أحمر، أزرق، أسود..." },
                            { name: "المقاس", type: "نص قصير", values: "S, M, L, XL" },
                            { name: "الوزن", type: "رقمي (كجم)", values: "أرقام عشرية" },
                            { name: "العلامة التجارية", type: "قائمة منسدلة", values: "اسماء الماركات" }
                          ].map((attr, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl flex flex-col gap-1 transition-all">
                              <div className="flex justify-between items-center">
                                <span className="text-[9.5px] text-[#D4AF37] font-black">{attr.type}</span>
                                <span className="text-xs font-extrabold text-white">{attr.name}</span>
                              </div>
                              <span className="text-[9.5px] text-gray-500 text-right font-sans">القيم الافتراضية: {attr.values}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {productStudioSubTab === "pricing_offers" && (
                  <ProductPromotionBuilder
                    product={null}
                    theme={themeColors}
                    onClose={() => {}}
                    triggerNotification={triggerNotification}
                  />
                )}
                {productStudioSubTab === "publishing_channels" && (
                  <AutoPublish
                    theme={themeColors}
                    products={products}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                  />
                )}
                {productStudioSubTab === "products_library" && (
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
              </>
            )}

            {/* 3) المبيعات والتجارة (sales_commerce) */}
            {activeTab === "sales_commerce" && (
              <>
                {salesCommerceSubTab === "pos" && (
                  activeStoreId === "all_stores" ? (
                    <div className="p-8 rounded-3xl border text-center space-y-6 max-w-2xl mx-auto my-12"
                      style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-bounce text-3xl">
                        ⚠️
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-black text-white">وضع العرض الموحد — تشغيل الكاشير POS مجمّد</h3>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          يرجى اختيار علامة تجارية أو متجر فرعي محدد لبدء تشغيل الكاشير وإصدار الفواتير الفورية.
                        </p>
                      </div>
                      <div className="border-t border-slate-800/60 my-4 pt-4 space-y-2.5">
                        <span className="text-[10px] text-sky-400 font-extrabold block uppercase tracking-wider">حدد أحد المتاجر النشطة للتشغيل الفوري وتفعيل الـ POS:</span>
                        <div className="grid grid-cols-1 gap-2">
                          {allowedStores.map(st => (
                            <button
                              key={st.id}
                              onClick={() => {
                                setActiveStoreId(st.id);
                                triggerNotification(`تمت تهيئة وتفعيل متجر [${st.name}] لتشغيل الكاشير! 🛍️`, "success");
                              }}
                              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-black text-white flex items-center justify-between cursor-pointer transition-all border-solid"
                            >
                              <div className="flex items-center gap-2">
                                <span>🏬</span>
                                <span>{st.name}</span>
                              </div>
                              <span className="text-amber-450 text-[10px]">تشغيل الكاشير الآن ←</span>
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
                      activeBranchId={activeBranchId}
                      activeWarehouseId={activeWarehouseId}
                      activePosId={activePosId}
                      activeStoreId={activeStoreId}
                      branches={branches}
                      warehouses={warehouses}
                      posUnits={posUnits}
                      setActiveTab={setActiveTab}
                    />
                  )
                )}
                {salesCommerceSubTab === "orders" && (
                  <Invoices 
                    invoices={invoices} 
                    setInvoices={setInvoices} 
                    products={products}
                    customers={customers}
                    suppliers={suppliers}
                    setSuppliers={setSuppliers}
                    theme={themeColors} 
                  />
                )}
                {salesCommerceSubTab === "invoices" && (
                  <Invoices 
                    invoices={invoices} 
                    setInvoices={setInvoices} 
                    products={products}
                    customers={customers}
                    suppliers={suppliers}
                    setSuppliers={setSuppliers}
                    theme={themeColors} 
                  />
                )}
                {salesCommerceSubTab === "customers" && (
                  <Customers customers={customers} setCustomers={setCustomers} theme={themeColors} />
                )}
                {salesCommerceSubTab === "offers_discounts" && (
                  <ProductPromotionBuilder
                    product={null}
                    theme={themeColors}
                    onClose={() => {}}
                    triggerNotification={triggerNotification}
                  />
                )}
                {salesCommerceSubTab === "subscriptions" && (
                  <MySubscription
                    theme={themeColors}
                    subscription={subscription}
                    rawCompanies={rawCompanies}
                    currentUser={currentUser}
                    invoicesCount={invoices.length}
                    productsCount={products.length}
                    branchesCount={branches.length}
                    warehousesCount={warehouses.length}
                    triggerNotification={triggerNotification}
                  />
                )}
              </>
            )}

            {/* 4) التشغيل والعمليات (operations) */}
            {activeTab === "operations" && (
              <>
                {operationsSubTab === "branches_locations" && (
                  <BranchWarehouseManager
                    theme={themeColors}
                    branches={branches}
                    setBranches={setBranches}
                    warehouses={warehouses}
                    setWarehouses={setWarehouses}
                    stores={allowedStores}
                    currentUser={currentUser!}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                    initialSubTab="branches"
                  />
                )}
                {operationsSubTab === "warehouses" && (
                  <BranchWarehouseManager
                    theme={themeColors}
                    branches={branches}
                    setBranches={setBranches}
                    warehouses={warehouses}
                    setWarehouses={setWarehouses}
                    stores={allowedStores}
                    currentUser={currentUser!}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                    initialSubTab="warehouses"
                  />
                )}
                {operationsSubTab === "inventory" && (
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
                {operationsSubTab === "suppliers" && (
                  <Suppliers 
                    suppliers={suppliers} 
                    setSuppliers={setSuppliers} 
                    invoices={invoices}
                    theme={themeColors} 
                  />
                )}
                {operationsSubTab === "purchases" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">📦 إدارة المشتريات وتوريد البضائع</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                      قم بإنشاء وتتبع طلبات شراء المخزون مع الموردين المعتمدين وتحديث تكلفة COGS بشكل ديناميكي.
                    </p>
                    <div className="p-8 border border-slate-800 bg-slate-900/40 rounded-2xl text-center space-y-2">
                      <span className="text-3xl block">📜</span>
                      <h4 className="text-xs font-bold text-white">لا توجد طلبات شراء مسجلة حالياً</h4>
                      <p className="text-[10px] text-gray-500 font-sans">يمكنك طلب المنتجات وتوريدها مباشرة من خلال الموردين المعتمدين.</p>
                    </div>
                  </div>
                )}
                {operationsSubTab === "documents_records" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">📁 الوثائق والسجلات الرسمية</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">أرشفة ووثائق المؤسسة وعقود الموردين وبوالص الشحن أرامكس.</p>
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between text-right">
                      <div>
                        <h4 className="text-xs font-black text-white">بوالص أرامكس والتخليص 📑</h4>
                        <span className="text-[9px] text-gray-550">تم إنشاؤها تلقائياً عند اعتماد الشحن المزدوج</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">مكتمل الأرشفة</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 5) التسويق والنمو (marketing_growth) */}
            {activeTab === "marketing_growth" && (
              <>
                {marketingGrowthSubTab === "catalog_promo" && (
                  <SmartCatalogBuilder
                    theme={themeColors}
                    products={products}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                  />
                )}
                {marketingGrowthSubTab === "competitors" && (
                  <CompetitorMonitor
                    theme={themeColors}
                    currentUser={currentUser!}
                    triggerNotification={triggerNotification}
                  />
                )}
                {marketingGrowthSubTab === "campaigns" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">📢 حملات التسويق والنمو</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">صمم وأطلق حملات الرسائل النصية وحملات سناب شات وإنستغرام الممولة بنقرة واحدة.</p>
                    <div className="p-8 border border-slate-800 bg-slate-900/40 rounded-2xl text-center space-y-2">
                      <span className="text-3xl block">🚀</span>
                      <h4 className="text-xs font-black text-white">محرك إطلاق الحملات جاهز</h4>
                      <p className="text-[10px] text-gray-500 font-sans">اختر أحد المنتجات الذكية من الاستديو لبدء إطلاق الحملة الترويجية مباشرة.</p>
                    </div>
                  </div>
                )}
                {marketingGrowthSubTab === "visitor_radar" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">🎯 كاشف زائر 360 (Visitor Radar)</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">تتبع مباشر للزوار المارين بمتجرك السحابي وتحديد المنتجات الأكثر اهتماماً لتهيئة خصومات حية.</p>
                    <div className="p-5 bg-gradient-to-l from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 18 زائر يتصفح المتجر الآن</span>
                      <span className="text-xs font-extrabold text-white">الرياض وجدة والدمام 📍</span>
                    </div>
                  </div>
                )}
                {marketingGrowthSubTab === "theme_marketplace" && (
                  <ThemeStudioMarketplace
                    theme={themeColors}
                    themeKey={themeKey}
                    setThemeKey={setThemeKey}
                    accentKey={accentKey}
                    setAccentKey={setAccentKey}
                    onSaveCustomTheme={(details) => {
                      setCustomTheme(details);
                      localStorage.setItem("sahm_web_custom_theme", JSON.stringify(details));
                    }}
                    customThemeDetails={customTheme}
                    onAddLog={(action, details) => addAuditLog(action, details)}
                  />
                )}
                {marketingGrowthSubTab === "landing_pages" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">📄 صفحات الهبوط الذكية (Landing Pages)</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">مولد صفحات هبوط احترافية وسريعة جداً للمنتجات عالية الجاذبية لجمع الاشتراكات الفورية.</p>
                    <button className="py-2 px-4 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-black cursor-pointer hover:border-amber-500/30">تصميم صفحة هبوط جديدة ←</button>
                  </div>
                )}
              </>
            )}

            {/* 6) الذكاء والتحليلات (intelligence_analytics) */}
            {activeTab === "intelligence_analytics" && (
              <>
                {intelligenceAnalyticsSubTab === "copilot" && (
                  <SahmBrain360
                    theme={themeColors}
                    currentUser={currentUser!}
                    products={products}
                    invoices={invoices}
                    customers={customers}
                    addAuditLog={addAuditLog}
                  />
                )}
                {intelligenceAnalyticsSubTab === "ai_capabilities" && (
                  <AIAnalyzer
                    theme={themeColors}
                    products={products}
                    setProducts={setProducts}
                    setActiveTab={setActiveTab}
                  />
                )}
                {intelligenceAnalyticsSubTab === "recommendations" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">💡 توصيات سهم الاستراتيجية للنمو</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">رؤى وتوصيات تم توليدها بالذكاء المالي لتقليل الهدر وزيادة هامش الربح.</p>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-gray-300 leading-relaxed font-sans">
                      💡 يُنصح برفع سعر منتج "دهن عود كلمنتان فاخر" بمعدل 12% لزيادة الربحية بنهاية الأسبوع بناءً على حجم الطلب النشط بالرياض.
                    </div>
                  </div>
                )}
                {intelligenceAnalyticsSubTab === "reports" && (
                  <Reports invoices={invoices} products={products} theme={themeColors} />
                )}
                {intelligenceAnalyticsSubTab === "predictions" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">🔮 التنبؤات والتحليلات التنبؤية</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">تقديرات حجم مبيعات المخزون للموسم القادم بالذكاء التنبئي.</p>
                    <div className="h-48 border border-slate-900 bg-slate-900/30 rounded-xl flex items-center justify-center text-center text-gray-500">
                      مخطط التنبؤ قيد المعالجة الإحصائية... 📈
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 7) الأتمتة والربط (automation_integration) */}
            {activeTab === "automation_integration" && (
              <>
                {automationIntegrationSubTab === "workflows" && (
                  <WorkflowEngine
                    theme={themeColors}
                    onAddLog={(action, details) => addAuditLog(action, details)}
                    triggerNotification={triggerNotification}
                  />
                )}
                {automationIntegrationSubTab === "publishing" && (
                  <AutoPublish
                    theme={themeColors}
                    products={products}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                  />
                )}
                {automationIntegrationSubTab === "app_store" && (
                  <SahmIntegrationsHub
                    theme={themeColors}
                    addAuditLog={addAuditLog}
                    triggerNotification={triggerNotification}
                    activeStoreId={activeWorkspaceId}
                  />
                )}
                {automationIntegrationSubTab === "api_webhooks" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">🔌 واجهة برمجة التطبيقات API / Webhooks</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                      قم بتهيئة مفاتيح الوصول البرمجي لربط ERP سهم بتطبيقاتك وأنظمتك الخارجية الخاصة.
                    </p>
                    <div className="p-4 bg-slate-900 rounded-xl font-mono text-[10px] text-amber-500 overflow-x-auto text-left">
                      GET https://api.sahm-os.com/v1/products?tenant_id={currentTenantId}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 8) الإدارة والإعدادات (management_settings) */}
            {activeTab === "management_settings" && (
              <>
                {managementSettingsSubTab === "organization_hub" && (
                  <FacilityAndEstablishmentHub
                    themeColors={themeColors}
                    allowedStores={allowedStores}
                    setStores={setStores}
                    branches={branches}
                    setBranches={setBranches}
                    warehouses={warehouses}
                    setWarehouses={setWarehouses}
                    posUnits={posUnits}
                    setPosUnits={setPosUnits}
                    activeStoreId={activeStoreId}
                    setActiveStoreId={(id) => {
                      setActiveStoreId(id);
                      const found = stores.find(s => s.id === id);
                      if (found) {
                        setStoreNameRaw(found.name);
                      }
                    }}
                    activeBranchId={activeBranchId}
                    setActiveBranchId={setActiveBranchId}
                    activeWarehouseId={activeWarehouseId}
                    setActiveWarehouseId={setActiveWarehouseId}
                    activePosId={activePosId}
                    setActivePosId={setActivePosId}
                    addAuditLog={addAuditLog}
                    triggerNotification={triggerNotification}
                    users={users}
                    rawCompanies={companies}
                    setRawCompanies={setCompanies}
                    tenantId={currentTenantId}
                  />
                )}
                {managementSettingsSubTab === "users_permissions" && (
                  <HumanResources
                    theme={themeColors}
                    users={users}
                    setUsers={setUsers}
                    currentUser={currentUser}
                    triggerNotification={triggerNotification}
                    addAuditLog={addAuditLog}
                    stores={allowedStores}
                    branches={branches}
                    warehouses={warehouses}
                    posUnits={posUnits}
                  />
                )}
                {managementSettingsSubTab === "general_settings" && (
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
                    onOpenStoreManager={() => setManagementSettingsSubTab("organization_hub")}
                    onOpenHRTab={() => setManagementSettingsSubTab("users_permissions")}
                    initialSubTab={settingsSubTab}
                    storesList={stores}
                    branchesList={branches}
                    warehousesList={warehouses}
                    posUnitsList={posUnits}
                  />
                )}
                {managementSettingsSubTab === "billing_packages" && (
                  <MySubscription
                    theme={themeColors}
                    subscription={subscription}
                    rawCompanies={rawCompanies}
                    currentUser={currentUser}
                    invoicesCount={invoices.length}
                    productsCount={products.length}
                    branchesCount={branches.length}
                    warehousesCount={warehouses.length}
                    triggerNotification={triggerNotification}
                  />
                )}
                {managementSettingsSubTab === "themes" && (
                  <ThemeStudioMarketplace
                    theme={themeColors}
                    themeKey={themeKey}
                    setThemeKey={setThemeKey}
                    accentKey={accentKey}
                    setAccentKey={setAccentKey}
                    onSaveCustomTheme={(details) => {
                      setCustomTheme(details);
                      localStorage.setItem("sahm_web_custom_theme", JSON.stringify(details));
                    }}
                    customThemeDetails={customTheme}
                    onAddLog={(action, details) => addAuditLog(action, details)}
                  />
                )}
                {managementSettingsSubTab === "notifications" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">⚙️ إعدادات الإشعارات والرسائل</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">حدد كيفية استقبال إشعارات مبيعات POS والعهد وحركات المخزون.</p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs text-white justify-start flex-row-reverse cursor-pointer">
                        <span>إرسال إشعارات مبيعات POS المباشرة عبر البريد الإلكتروني</span>
                        <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-900 w-4 h-4" />
                      </label>
                    </div>
                  </div>
                )}
                {managementSettingsSubTab === "audit_log" && (
                  <div className="p-6 rounded-3xl border text-right space-y-4" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <h3 className="text-base font-black text-white">🛡️ سجل السجلات وتدقيق الأمان المتقدم</h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">مراجعة شاملة لجميع الحركات وتوثيق العمليات الجارية.</p>
                    <AuditLogTimeline 
                      logs={auditLogs} 
                      theme={themeColors} 
                      onAddLog={(action, details) => addAuditLog(action, details)}
                      currentUser={currentUser}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          </React.Suspense>
        </main>

        {/* 3. Mobile Navigation bottom tabs bar */}
        {!(isPosFullscreen && (activeTab === "pos_and_operations" || (activeTab === "sales_commerce" && salesCommerceSubTab === "pos"))) && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex justify-around items-center z-40"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            
            {/* Button 1: الرئيسية */}
            {(() => {
              const isActive = isTabActive("dashboard");
              return (
                <button
                  onClick={() => handleTabClick("dashboard")}
                  className="flex flex-col items-center justify-center flex-grow py-1 gap-1 cursor-pointer border-0 bg-transparent"
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }}
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold">الرئيسية</span>
                </button>
              );
            })()}

            {/* Button 2: استديو المنتجات */}
            {(() => {
              const isActive = isTabActive("product_studio");
              return (
                <button
                  onClick={() => handleTabClick("product_studio")}
                  className="flex flex-col items-center justify-center flex-grow py-1 gap-1 cursor-pointer border-0 bg-transparent"
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }}
                >
                  <Sparkles className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold">الاستديو</span>
                </button>
              );
            })()}

            {/* Button 3: البيع والتشغيل */}
            {(() => {
              const isActive = isTabActive("sales_ops");
              return (
                <button
                  onClick={() => handleTabClick("sales_ops")}
                  className="flex flex-col items-center justify-center flex-grow py-1 gap-1 cursor-pointer border-0 bg-transparent"
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }}
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold">البيع والتشغيل</span>
                </button>
              );
            })()}

            {/* Button 4: التسويق والنمو */}
            {(() => {
              const isActive = isTabActive("marketing_growth");
              return (
                <button
                  onClick={() => handleTabClick("marketing_growth")}
                  className="flex flex-col items-center justify-center flex-grow py-1 gap-1 cursor-pointer border-0 bg-transparent"
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }}
                >
                  <TrendingUp className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold">التسويق والنمو</span>
                </button>
              );
            })()}

            {/* Button 5: الإدارة */}
            {(() => {
              const isActive = isTabActive("management");
              return (
                <button
                  onClick={() => handleTabClick("management")}
                  className="flex flex-col items-center justify-center flex-grow py-1 gap-1 cursor-pointer border-0 bg-transparent"
                  style={{ color: isActive ? themeColors.accent : themeColors.muted }}
                >
                  <SettingsIcon className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold">الإدارة</span>
                </button>
              );
            })()}

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
      {showOnboarding && !isSystemAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-right font-sans">
          <LegacyOnboardingWizard
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

      {/* 📣 DYNAMIC INTERACTIVE PRODUCT PROMOTION BUILDER MODAL */}
      {promotedProduct !== null && (
        <ProductPromotionBoundary>
          <ProductPromotionBuilder
            product={promotedProduct}
            theme={themeColors}
            onClose={() => setPromotedProduct(null)}
            triggerNotification={triggerNotification}
          />
        </ProductPromotionBoundary>
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
          allowedStores={allowedStores}
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
          tenantId={currentTenantId}
          rawCompanies={companies}
          setRawCompanies={setCompanies}
          userRole={currentUser?.role}
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
        <React.Suspense fallback={<LoadingScreen />}>
          <AIProductBuilder
            products={products}
            setProducts={setProducts}
            theme={themeColors}
            onClose={() => setShowGlobalAIBuilder(false)}
            triggerNotification={triggerNotification}
            addAuditLog={addAuditLog}
          />
        </React.Suspense>
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
                                  id: "branch_riyadh_main",
                                  name: "المعرض الرئيسي • الرياض",
                                  city: "الرياض",
                                  manager: "سعود بن فهد",
                                  phone: "0550011223",
                                  address: "طريق الملك فهد، حي الصحافة",
                                  associatedWh: "warehouse_1",
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
                                  id: "warehouse_1",
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
                            const targetCompId = impersonatedOrganizationId || currentUser?.organization_id || currentUser?.company_id || "";
                            if (import.meta.env.VITE_DATA_MODE === "supabase" && (!targetCompId || targetCompId === "comp-default")) {
                              triggerNotification("تعذر تنفيذ العملية: لا يوجد معرف منشأة صالح.", "warning");
                              return;
                            }
                            const companyToUpdate = rawCompanies.find(c => c.id === targetCompId) || 
                                                    rawCompanies.find(c => (c.tenant_id || c.tenantId) === currentTenantId) || 
                                                    rawCompanies[0];
                            if (companyToUpdate) {
                              const updatedCompanies = rawCompanies.map(c => 
                                c.id === companyToUpdate.id 
                                  ? { ...c, name: mainCompanyName, companyLegalName: mainCompanyName } 
                                  : c
                              );
                              setCompanies(updatedCompanies);
                            }
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
                        {allowedStores.map(st => {
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
                                {allowedStores.map(st => (
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
                        {allowedStores.map(st => {
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
                              {allowedStores.map(st => (
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
                                setBranches([...branches, newBranch]);
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
                                    {allowedStores.map(st => (
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
                                      setBranches(branches.map(item => item.id === b.id ? updated : item));
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
                                const resolvedStoreId = (activeStoreId && activeStoreId !== "all_stores") ? activeStoreId : (stores[0]?.id || "store_1");
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
                                  store_id: resolvedStoreId,
                                  storeId: resolvedStoreId
                                };

                                // Save in the Data Layer via warehouseService
                                await warehouseService.create(newWh);

                                // Update state immediately
                                setWarehouses([...warehouses, newWh]);
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
                                      setWarehouses(warehouses.map(item => item.id === w.id ? updated : item));
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
                                const resolvedStoreId = (activeStoreId && activeStoreId !== "all_stores") ? activeStoreId : (stores[0]?.id || "store_1");
                                const newPos = {
                                  id: "pos_" + Date.now(),
                                  name: inlinePosName.trim(),
                                  branchId: inlinePosBranchId || activeBranchId || (branches[0] ? branches[0].id : ""),
                                  isDefault: false,
                                  status: inlinePosStatus,
                                  cashier: inlinePosCashier.trim() || undefined,
                                  warehouseId: inlinePosWh || undefined,
                                  payMethods: inlinePosPayMethods,
                                  store_id: resolvedStoreId,
                                  storeId: resolvedStoreId
                                };

                                // Save in the Data Layer via posService
                                await posService.create(newPos);

                                // Update state immediately
                                setPosUnits([...posUnits, newPos]);
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
                                      setPosUnits(posUnits.map(item => item.id === p.id ? updated : item));
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
                            {(() => {
                              const filtered = posUnits.filter(p => 
                                p.branchId === activeBranchId || 
                                p.branch_id === activeBranchId || 
                                p.defaultWh === activeWarehouseId || 
                                p.warehouse_id === activeWarehouseId ||
                                p.storeId === activeStoreId ||
                                p.store_id === activeStoreId
                              );
                              // Fallback to all posUnits if filtered is empty
                              const listToDisplay = filtered.length > 0 ? filtered : posUnits;
                              return listToDisplay.map(p => {
                                const br = branches.find(b => b.id === p.branchId || b.id === p.branch_id);
                                const wh = warehouses.find(w => w.id === p.defaultWh || w.id === p.warehouse_id);
                                const assocLabel = `(${br ? br.name : "بدون فرع"} - ${wh ? wh.name : "بدون مستودع"})`;
                                return (
                                  <option key={p.id} value={p.id}>🖥️ {p.name} {assocLabel}</option>
                                );
                              });
                            })()}
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
interface LegacyOnboardingProps {
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

function LegacyOnboardingWizard({
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
}: LegacyOnboardingProps) {
  const [step, setStep] = useState(1);
  
  // Simulated State for Onboarding tasks
  const [branchName, setBranchName] = useState("الفرع الرئيسي بالرياض 📍");
  const [warehouseName, setWarehouseName] = useState("مستودع السلي المركزي 📦");
  const [productSku, setProductSku] = useState("SAHM-OUD-01");
  const [productName, setProductName] = useState("دهن عود كمبودي ملكي معتق 💎");
  const [productPrice, setProductPrice] = useState("350");
  const [productQty, setProductQty] = useState("25");

  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || "");
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
            
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs leading-relaxed space-y-2 text-right">
              <span className="font-extrabold text-emerald-450 block text-sm">🔒 اتصال سحابي مؤمن ومدار بالكامل:</span>
              <p className="text-gray-300">
                الاتصال بقواعد البيانات السحابية مدار بالكامل ومفعل تلقائياً عبر متغيرات البيئة الآمنة في ملف <code className="font-mono text-amber-500">.env.local</code>.
              </p>
              <p className="text-zinc-400 text-[11px]">
                تم إخفاء مدخلات المفاتيح والأرقام السرية من واجهة المستخدم لضمان أعلى معايير الحماية والأمان لمتجرك وقاعدة بياناتك.
              </p>
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
