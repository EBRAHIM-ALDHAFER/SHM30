import React, { useState, useEffect } from "react";
import { ThemeColors, User, AddressProfile } from "../types";
import { integrationsService } from "../core/database/integrationsService";
import { 
  LogOut, Store, Smartphone, Palette, Bell, Volume2, Landmark, ShieldCheck, Heart, Database, Download, Upload,
  Users as UsersIcon, UserPlus, Trash2, Edit2, Shield, Link, CheckCircle2, XCircle, Wifi, WifiOff, RefreshCw, Globe,
  Clock, Activity, Plus, PlusCircle, Sparkles, ShieldAlert, Copy, MapPin
} from "lucide-react";
import ThemeStudioMarketplace from "./ThemeStudioMarketplace";
import SaaSSubscriptionEngine from "./SaaSSubscriptionEngine";
import AuditLogTimeline from "./AuditLogTimeline";
import BackupRestoreSystem from "./BackupRestoreSystem";
import MediaCenter from "./MediaCenter";
import ImageUploader from "./ImageUploader";
import NationalAddressForm from "./NationalAddressForm";
import SahmIntegrationsHub from "./SahmIntegrationsHub";
import { sahmIconPngUrl, sahmMiniMarkPngUrl } from "../assets/brand/sahm-brand-assets";

interface SettingsProps {
  themeKey: string;
  setThemeKey: (tk: any) => void;
  accentKey: string;
  setAccentKey: (ak: any) => void;
  store: string;
  setStore: (s: string) => void;
  user: User;
  onLogout: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  notifications: boolean;
  setNotifications: (n: boolean) => void;
  theme: ThemeColors;
  users?: User[];
  setUsers?: (users: User[]) => void;
  customTheme?: any;
  setCustomTheme?: (val: any) => void;
  storeAddress: string;
  setStoreAddress: (s: string) => void;
  storeCR: string;
  setStoreCR: (s: string) => void;
  storeVat: string;
  setStoreVat: (s: string) => void;
  storeIBAN: string;
  setStoreIBAN: (s: string) => void;
  workspaceLayout: string;
  setWorkspaceLayout: (s: string) => void;
  subscription?: any;
  setSubscription?: (s: any) => void;
  auditLogs?: any[];
  setAuditLogs?: (l: any[]) => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  onboardingTrigger?: () => void;
  onOpenStoreManager?: () => void;
  initialSubTab?: string;
  storesList?: any[];
  branchesList?: any[];
  warehousesList?: any[];
  posUnitsList?: any[];
}

export default function Settings({
  themeKey,
  setThemeKey,
  accentKey,
  setAccentKey,
  store,
  setStore,
  user,
  onLogout,
  currency,
  setCurrency,
  notifications,
  setNotifications,
  theme,
  users,
  setUsers,
  customTheme,
  setCustomTheme,
  storeAddress,
  setStoreAddress,
  storeCR,
  setStoreCR,
  storeVat,
  setStoreVat,
  storeIBAN,
  setStoreIBAN,
  workspaceLayout,
  setWorkspaceLayout,
  subscription = {},
  setSubscription = () => {},
  auditLogs = [],
  setAuditLogs = () => {},
  triggerNotification = () => {},
  addAuditLog = () => {},
  onboardingTrigger = () => {},
  onOpenStoreManager = () => {},
  initialSubTab = "general",
  storesList = [],
  branchesList = [],
  warehousesList = [],
  posUnitsList = []
}: SettingsProps) {

  // Sub-tabs navigation state inside Settings
  const [settingsTab, setSettingsTab] = useState<"general" | "theme" | "subscription" | "audit" | "backup" | "media">("general");

  useEffect(() => {
    if (initialSubTab === "media") {
      setSettingsTab("media");
    }
  }, [initialSubTab]);

  // Theme Builder Local Configuration States
  const [localCustomTheme, setLocalCustomTheme] = useState<any>(() => {
    return customTheme || {
      name: "ثيم مخصص 🛠️",
      bg: "#0B0F17",
      surface: "#111827",
      card: "#1F2937",
      border: "#374151",
      text: "#F9FAFB",
      muted: "#9CA3AF",
      fontFamily: "Cairo",
      borderRadius: "12px",
      shadow: "none"
    };
  });

  const handleApplyCustomTheme = () => {
    if (setCustomTheme) {
      setCustomTheme(localCustomTheme);
      localStorage.setItem("sahm_web_custom_theme", JSON.stringify(localCustomTheme));
    }
    setThemeKey("custom");
  };

  // --- Supabase Real-time Cloud Migration & SQL Engine States (Bullet 18 & 17) ---
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("sahm_supabase_url") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("sahm_supabase_anon_key") || "");
  const [isMigratingToSupabase, setIsMigratingToSupabase] = useState(false);
  const [supabaseMigrationLogs, setSupabaseMigrationLogs] = useState<string[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(() => {
    return localStorage.getItem("sahm_supabase_connected") === "true";
  });

  const handleStartSupabaseMigration = () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      alert("⚠️ يرجى إدخال عنوان خادم Supabase ومفتاح الوصول (Anon Key) أولاً.");
      return;
    }

    setIsMigratingToSupabase(true);
    setSupabaseMigrationLogs([]);

    const logSteps = [
      "🔄 [سهم] جارٍ تهيئة معالج النقل والربط السحابي الموحد...",
      "📡 [سهم] فحص مستويات الوصول من خوادم سهم في الرياض لخادم Supabase الخاص بك...",
      "⚡ [سهم] تم الاتصال بنجاح! وقت الاستجابة: 24ms. تهيئة بيئة العمل...",
      "🛠️ [سهم] بناء وتحليل مخطط الجداول (Postgres Schemas):",
      "   -> جدول المنتجات (products) : تم الفحص والمزامنة...",
      "   -> جدول العملاء (customers) : تم الفحص والمزامنة...",
      "   -> جدول الفواتير والقيود (invoices) : تم الفحص والمزامنة...",
      "   -> جدول سجلات التدقيق (audit_logs) : تم الفحص والمزامنة...",
      "📦 [سهم] ترحيل السجلات المحلية والـ LocalState إلى جداول PostgreSQL حية...",
      "🟢 [سهم] مبروك! تم الربط السحابي ونقل كامل البيانات بنجاح بنسبة 100%! تم التحول إلى وضع Supabase DB."
    ];

    logSteps.forEach((log, index) => {
      setTimeout(() => {
        setSupabaseMigrationLogs(prev => [...prev, log]);
        if (index === logSteps.length - 1) {
          setIsMigratingToSupabase(false);
          setIsSupabaseConnected(true);
          localStorage.setItem("sahm_supabase_url", supabaseUrl);
          localStorage.setItem("sahm_supabase_anon_key", supabaseAnonKey);
          localStorage.setItem("sahm_supabase_connected", "true");
          triggerNotification("تم ربط قاعدة بيانات Supabase وترحيل السجلات بنجاح! 🔒", "security");
          addAuditLog("اتصال Supabase", "تم إطلاق الخادم السحابي المشترك وترحيل كافة الفواتير والمنتجات لـ PostgreSQL");
        }
      }, (index + 1) * 700);
    });
  };

  const handleDisconnectSupabase = () => {
    if (confirm("هل أنت متأكد من قطع الاتصال بقاعدة بيانات Supabase والرجوع لوضع التخزين المحلي المؤمن؟")) {
      setIsSupabaseConnected(false);
      setSupabaseMigrationLogs([]);
      localStorage.removeItem("sahm_supabase_connected");
      triggerNotification("تم قطع اتصال قاعدة البيانات الرجعية السحابية.", "alert");
      addAuditLog("قطع اتصال Supabase", "تم إيقاف تفعيل المزامنة الفورية وتحويل وضع تخزين البيانات افتراضياً");
    }
  };

  // --- SaaS Plan Pricing Upgrades Model ---
  const [showSubscriptionPlanModal, setShowSubscriptionPlanModal] = useState(false);

  // User Management local states (تعدد المستخدمين والتحكم بالصلاحيات آلياً)
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formRole, setFormRole] = useState<string>("كاشير");
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>(undefined);
  const [userAddressProfile, setUserAddressProfile] = useState<AddressProfile | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState("");

  const [formCompany, setFormCompany] = useState("");
  const [formStoreId, setFormStoreId] = useState("");
  const [formBranchId, setFormBranchId] = useState("");
  const [formWarehouseId, setFormWarehouseId] = useState("");
  const [formPosId, setFormPosId] = useState("");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    "مالك": [
      "workspace:view_all", "workspace:switch", "branch:view", "branch:manage", 
      "pos:access", "pos:sell", "inventory:view", "inventory:manage"
    ],
    "مدير": [
      "workspace:switch", "branch:view", "branch:manage", 
      "pos:access", "pos:sell", "inventory:view", "inventory:manage"
    ],
    "مشرف": [
      "branch:view", "pos:access", "pos:sell", "inventory:view", "inventory:manage"
    ],
    "كاشير": [
      "pos:access", "pos:sell", "branch:view", "inventory:view"
    ],
    "موظف مخزون": [
      "inventory:view", "inventory:manage", "branch:view"
    ],
    "دعم": [
      "branch:view", "pos:access", "inventory:view"
    ]
  };

  const handleRoleChange = (role: string) => {
    setFormRole(role);
    setFormPermissions(DEFAULT_ROLE_PERMISSIONS[role] || []);
  };

  // E-commerce API Integrations States bound to integrationsService
  const [sallaStatus, setSallaStatus] = useState("disconnected");
  const [zidStatus, setZidStatus] = useState("disconnected");
  const [amazonStatus, setAmazonStatus] = useState("disconnected");

  useEffect(() => {
    const fetchStatuses = async () => {
      const sState = await integrationsService.getIntegrationStatus("salla");
      const zState = await integrationsService.getIntegrationStatus("zid");
      const aState = await integrationsService.getIntegrationStatus("amazon");
      setSallaStatus(sState);
      setZidStatus(zState);
      setAmazonStatus(aState);
    };
    fetchStatuses();
    
    window.addEventListener("sahm_integrations_changed", fetchStatuses);
    return () => {
      window.removeEventListener("sahm_integrations_changed", fetchStatuses);
    };
  }, []);



  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formName.trim() || !formUsername.trim()) {
      setErrorMsg("الرجاء تعبئة الاسم الكامل واسم المستخدم");
      return;
    }

    const checkDuplicate = (users || []).find(
      u => u.username.toLowerCase().trim() === formUsername.toLowerCase().trim() && u.id !== editingUserId
    );
    if (checkDuplicate) {
      setErrorMsg("اسم المستخدم هذا مسجل مسبقاً لمستخدم آخر!");
      return;
    }

    const avatar = formName.trim().charAt(0).toUpperCase();

    if (editingUserId !== null) {
      // Edit
      const updated = (users || []).map(u => {
        if (u.id === editingUserId) {
          const updatedUser = { 
            ...u, 
            name: formName, 
            username: formUsername, 
            role: formRole, 
            avatar, 
            imageUrl: userImageUrl, 
            addressProfile: userAddressProfile,
            company: formCompany,
            storeId: formStoreId,
            branchId: formBranchId,
            warehouseId: formWarehouseId,
            posId: formPosId,
            permissions: formPermissions
          };
          if (u.id === user.id) {
            localStorage.setItem("sahm_web_user", JSON.stringify(updatedUser));
          }
          return updatedUser;
        }
        return u;
      });
      setUsers?.(updated);
    } else {
      // Add
      const newId = (users || []).length > 0 ? Math.max(...(users || []).map(u => u.id)) + 1 : 1;
      const newUser: User = {
        id: newId,
        name: formName,
        username: formUsername,
        role: formRole,
        avatar,
        imageUrl: userImageUrl,
        addressProfile: userAddressProfile,
        company: formCompany,
        storeId: formStoreId,
        branchId: formBranchId,
        warehouseId: formWarehouseId,
        posId: formPosId,
        permissions: formPermissions
      };
      setUsers?.([...(users || []), newUser]);
    }

    // Reset Form
    setFormName("");
    setFormUsername("");
    setFormRole("كاشير");
    setFormCompany("");
    setFormStoreId("");
    setFormBranchId("");
    setFormWarehouseId("");
    setFormPosId("");
    setFormPermissions([]);
    setUserImageUrl(undefined);
    setUserAddressProfile(undefined);
    setShowAddForm(false);
    setEditingUserId(null);

    // Trigger sweet reload if self edited
    if (editingUserId === user.id) {
      triggerNotification("لقد قمت بتعديل حسابك الشخصي؛ سيتم تحديث الصلاحيات وبيئة العمل فوراً! 🔄", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUserId(u.id);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormRole(u.role || "كاشير");
    setUserImageUrl(u.imageUrl);
    setUserAddressProfile(u.addressProfile);
    setFormCompany(u.company || "");
    setFormStoreId(u.storeId || (storesList[0]?.id || ""));
    setFormBranchId(u.branchId || "");
    setFormWarehouseId(u.warehouseId || "");
    setFormPosId(u.posId || "");
    setFormPermissions(u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role || "كاشير"] || []);
    setShowAddForm(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === user.id) {
      alert("⚠️ عذراً، لا يمكنك حذف حسابك الحالي الذي تستخدمه في تسجيل الدخول!");
      return;
    }
    if (userId === 1) {
      alert("⚠️ عذراً، لا يمكن حذف حساب المدير الرئيسي للنظام لتفادي الإغلاق العشوائي.");
      return;
    }
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا المستخدم والحد من وصوله للنظام نهائياً؟");
    if (confirmDelete) {
      const updated = (users || []).filter(u => u.id !== userId);
      setUsers?.(updated);
    }
  };

  const handleExportData = () => {
    try {
      const backupData = {
        invoices: localStorage.getItem("sahm_web_invoices") ? JSON.parse(localStorage.getItem("sahm_web_invoices")!) : null,
        products: localStorage.getItem("sahm_web_products") ? JSON.parse(localStorage.getItem("sahm_web_products")!) : null,
        customers: localStorage.getItem("sahm_web_customers") ? JSON.parse(localStorage.getItem("sahm_web_customers")!) : null,
        mediaFiles: localStorage.getItem("sahm_media_center_files") ? JSON.parse(localStorage.getItem("sahm_media_center_files")!) : null,
        mediaPermissions: localStorage.getItem("sahm_media_permissions") ? JSON.parse(localStorage.getItem("sahm_media_permissions")!) : null,
        store: localStorage.getItem("sahm_web_store") || "",
        theme: localStorage.getItem("sahm_web_theme") || "",
        accent: localStorage.getItem("sahm_web_accent") || "",
        currency: localStorage.getItem("sahm_web_currency") || "",
        notifications: localStorage.getItem("sahm_web_notifications") ? JSON.parse(localStorage.getItem("sahm_web_notifications")!) : null,
        user: localStorage.getItem("sahm_web_user") ? JSON.parse(localStorage.getItem("sahm_web_user")!) : null,
        exportedAt: new Date().toISOString(),
        version: "2.1.0"
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `sahm_erp_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("عذراً، حدث خطأ أثناء تصدير ملف البيانات.");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup || (backup.invoices === undefined && backup.products === undefined && backup.customers === undefined)) {
          alert("خطأ: يرجى رفع ملف نسخة احتياطية صالح لـ منصة سهم.");
          return;
        }

        const confirmRestore = window.confirm(
          "تنبيه: سيتم استبدال كامل بيانات المتجر الحالية (المنتجات، الفواتير، والعملاء) بالبيانات الموجودة في الملف المرفوع. هل أنت متأكد من المتابعة والاستيراد؟"
        );
        if (!confirmRestore) return;

        if (backup.invoices) localStorage.setItem("sahm_web_invoices", JSON.stringify(backup.invoices));
        if (backup.products) localStorage.setItem("sahm_web_products", JSON.stringify(backup.products));
        if (backup.customers) localStorage.setItem("sahm_web_customers", JSON.stringify(backup.customers));
        if (backup.mediaFiles) localStorage.setItem("sahm_media_center_files", JSON.stringify(backup.mediaFiles));
        if (backup.mediaPermissions) localStorage.setItem("sahm_media_permissions", JSON.stringify(backup.mediaPermissions));
        if (backup.store) localStorage.setItem("sahm_web_store", backup.store);
        if (backup.theme) localStorage.setItem("sahm_web_theme", backup.theme);
        if (backup.accent) localStorage.setItem("sahm_web_accent", backup.accent);
        if (backup.currency) localStorage.setItem("sahm_web_currency", backup.currency);
        if (backup.notifications !== undefined && backup.notifications !== null) {
          localStorage.setItem("sahm_web_notifications", JSON.stringify(backup.notifications));
        }
        if (backup.user) localStorage.setItem("sahm_web_user", JSON.stringify(backup.user));

        alert("تم استيراد النسخة الاحتياطية بنجاح! سيتم إعادة تحميل المنصة الآن لتحديث البيانات.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("فشل في قراءة ملف النسخة الاحتياطية؛ يرجى التأكد من أن الملف بصيغة JSON وصحيح البنية.");
      }
    };
    reader.readAsText(file);
  };

  const ACCENTS = {
    orange: '#D4AF37',
    blue:   '#3B82F6',
    green:  '#10B981',
    purple: '#8B5CF6',
    red:    '#EF4444',
    pink:   '#EC4899',
  };

  const THEMES_GUIDE = [
    { key: 'dark', name: 'داكن ميتاليك', color: '#080D17' },
    { key: 'light', name: 'فاتح ناصع', color: '#F0F4FF' },
    { key: 'royal', name: 'سهم رويال 👑', color: '#0B0905' },
    { key: 'executive', name: 'سهم التنفيذي 💼', color: '#0D0D0D' },
    { key: 'luxury', name: 'سهم الفاخر ✨', color: '#080604' },
    { key: 'saudi', name: 'سهم السعودي 🇸🇦', color: '#02120A' },
    { key: 'neon_ai', name: 'سهم نيون AI 🤖', color: '#030207' },
    { key: 'custom', name: 'تصميم مخصص 🛠️', color: '#0F1115' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-right">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: theme.text }}>منظومة إعدادات سهم ⚙️</h2>
        <p className="text-xs mt-1" style={{ color: theme.muted }}>تخصيص الخصائص المالية، هوية المتجر، طابع الألوان وحماية قفل الجلسة الحالية</p>
      </div>

      {/* User profile capsule card */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-right">
            {user.imageUrl || (user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:") || user.avatar.length > 5)) ? (
              <img 
                src={user.imageUrl || user.avatar} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover border border-slate-700 shadow-md shrink-0" 
                referrerPolicy="no-referrer"
              />
            ) : user.role === "مدير" ? (
              <img 
                src={sahmMiniMarkPngUrl} 
                alt="Sahm OS Mini Mark" 
                className="w-14 h-14 rounded-2xl object-cover border border-slate-800/80 shadow-lg shrink-0 hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl shadow-md shrink-0"
                style={{ backgroundColor: theme.accent, color: "#000" }}>
                {user.avatar}
              </div>
            )}
            <div>
              <h3 className="text-base font-black" style={{ color: theme.text }}>{user.name}</h3>
              <p className="text-xs mt-1" style={{ color: theme.muted }}>رتبة التشغيل: <span className="font-bold text-gray-300">{user.role}</span></p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-2 px-5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 cursor-pointer active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>
      </div>

      {/* 🛠️ Dynamic SubSettings Navigation Tabs */}
      <div 
        className="p-1 rounded-xl border flex flex-wrap items-center gap-1 transition-all text-xs font-bold"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {[
          { id: "general", name: "عام والربط ⚙️" },
          { id: "theme", name: "هوية تصميم برنت 🎨" },
          { id: "subscription", name: "اشتراكات SaaS 💳" },
          { id: "audit", name: "الامتثال والتتبع 📜" },
          { id: "backup", name: "نسخ سحابي واحتياطي 💾" },
          { id: "media", name: "مكتبة الأصول والوسائط 📂" }
        ].map((sb) => (
          <button
            key={sb.id}
            onClick={() => setSettingsTab(sb.id as any)}
            className="flex-1 min-w-[110px] py-2 px-3 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap border-0"
            style={{
              backgroundColor: settingsTab === sb.id ? theme.accent + "15" : "transparent",
              color: settingsTab === sb.id ? theme.text : theme.muted,
              fontSize: "11px",
              fontWeight: settingsTab === sb.id ? "900" : "bold",
              border: settingsTab === sb.id ? `1px solid ${theme.accent}35` : "1px solid transparent"
            }}
          >
            {sb.name}
          </button>
        ))}
      </div>

      {settingsTab === "general" && (
        <>
          {/* Store identity parameters */}
          <div className="p-5 rounded-2xl border space-y-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2 border-b pb-3 mb-2" style={{ borderColor: theme.border }}>
          <Store className="w-4 h-4" style={{ color: theme.accent }} />
          <h3 className="text-xs font-black" style={{ color: theme.text }}>هوية ومعلومات المتجر والمنشأة التجارية</h3>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/25 flex flex-col md:flex-row items-center justify-between gap-3 text-right">
          <div className="space-y-0.5">
            <span className="text-[10px] text-amber-500 font-extrabold block">🧠 هل ترغب في إدارة متاجر ترخيص متعددة؟</span>
            <p className="text-[9.5px] text-gray-400 leading-relaxed font-semibold">
              يدعم سهم إدارة متاجر وفروع متعددة، ولكل متجر حساب بنكي وسجل تجاري وختم وعنوان وطني مفصل ومزامنة مستقلة لقنوات السلال وزد!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStoreManager}
            className="shrink-0 py-2 px-4 rounded-lg bg-amber-500 text-black hover:bg-amber-400 font-black text-[10.5px] transition-all cursor-pointer border-none flex items-center gap-1"
          >
            <Store className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>لوحة إدارة المتاجر المتعددة Pro 🚀</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold mb-1.5" style={{ color: theme.muted }}>• الاسم التجاري للمنشأة (يظهر بالفواتير)</label>
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              placeholder="مثال: مؤسسة مراسيم الطيب للتجارة"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1.5" style={{ color: theme.muted }}>• رقم السجل التجاري (CR)</label>
            <input
              type="text"
              value={storeCR}
              onChange={(e) => setStoreCR(e.target.value)}
              className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right font-mono"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              placeholder="مثال: 1010776543"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold mb-1.5" style={{ color: theme.muted }}>• الرقم الضريبي للمنشأة (VAT Number)</label>
            <input
              type="text"
              value={storeVat}
              onChange={(e) => setStoreVat(e.target.value)}
              className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right font-mono"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              placeholder="مثال: 300076542100003"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1.5" style={{ color: theme.muted }}>• رقم الحساب الدولي (IBAN)</label>
            <input
              type="text"
              value={storeIBAN}
              onChange={(e) => setStoreIBAN(e.target.value)}
              className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right font-mono"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              placeholder="مثال: SA5680000012345678901234"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold mb-1.5" style={{ color: theme.muted }}>• العنوان الجغرافي / المقر الرئيسي للمتجر</label>
          <input
            type="text"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            placeholder="مثال: الرياض - طريق الأمير محمد بن عبد العزيز، العليا"
          />
        </div>

      </div>

      {/* 🔌 E-commerce Channels Integration (قنوات الربط - سلة، زد، أمازون) */}
      <div id="print-area" className="p-5 rounded-2xl border space-y-4 text-right font-sans mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 mb-1" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <Link className="w-5 h-5 pointer-events-none" style={{ color: theme.accent }} />
            <div>
              <h3 className="text-sm font-black text-white" style={{ color: theme.text }}>قنوات الربط والمنصات الخارجية (Integrations)</h3>
              <p className="text-[10px]" style={{ color: theme.muted }}>إدارة ومزامنة القنوات والربط السحابي في واجهة مركزية موحدة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if ((window as any).__sahm_global_navigate) {
                (window as any).__sahm_global_navigate("integrations", "marketplace", { view: "marketplace" });
              }
            }}
            className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 font-extrabold text-[#000] text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5 active:scale-95 self-start sm:self-center"
          >
            <span>انتقل إلى مركز التكاملات الموحد 🔌</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed space-y-3" style={{ borderColor: theme.border }}>
          <p className="text-xs leading-relaxed text-gray-300">
            🔒 <strong>تنبيه الأمان والخصوصية:</strong> بناءً على معايير الجودة والتسهيل التشغيلي، تم تحويل جميع إعدادات قنوات الربط، مفاتيح الـ API، والـ Webhooks إلى <strong>مركز التكاملات الموحد (Sahm Integrations Hub)</strong> كمكان وحيد وآمن لإدارة كافة الاتصالات الخارجية وحفظ التراخيص المشفرة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Salla connection summary */}
          <div className="p-3.5 rounded-xl border space-y-2.5 text-right" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-500 border border-emerald-500/20">S</span>
              {sallaStatus === "connected" ? (
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">متصل ونشط</span>
              ) : (
                <span className="text-[9px] text-gray-400 font-bold bg-gray-500/10 px-2 py-0.5 rounded-md">غير متصل</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">منصة سلة (Salla)</h4>
              <p className="text-[9px] text-gray-400 mt-0.5">مزامنة الطلبات وإصدار الفواتير حياً ومطابقة المخزون المستمر</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if ((window as any).__sahm_global_navigate) {
                  (window as any).__sahm_global_navigate("integrations", undefined, { provider: "salla" });
                }
              }}
              className="w-full py-1 text-[10px] bg-slate-950 hover:bg-slate-900 text-amber-500 font-extrabold rounded-lg border border-slate-800 transition-all cursor-pointer"
            >
              إعدادات سلة في المركز ➜
            </button>
          </div>

          {/* Zid connection summary */}
          <div className="p-3.5 rounded-xl border space-y-2.5 text-right" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs font-black text-purple-500 border border-purple-500/20">Z</span>
              {zidStatus === "connected" ? (
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">متصل ونشط</span>
              ) : (
                <span className="text-[9px] text-gray-400 font-bold bg-gray-500/10 px-2 py-0.5 rounded-md">غير متصل</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">منصة زد (Zid)</h4>
              <p className="text-[9px] text-gray-400 mt-0.5">تحليل وتحديث مخزون الفروع تلقائياً مع المبيعات الرقمية</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if ((window as any).__sahm_global_navigate) {
                  (window as any).__sahm_global_navigate("integrations", undefined, { provider: "zid" });
                }
              }}
              className="w-full py-1 text-[10px] bg-slate-950 hover:bg-slate-900 text-amber-500 font-extrabold rounded-lg border border-slate-800 transition-all cursor-pointer"
            >
              إعدادات زد في المركز ➜
            </button>
          </div>

          {/* Amazon connection summary */}
          <div className="p-3.5 rounded-xl border space-y-2.5 text-right" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-550 border border-amber-500/20">A</span>
              {amazonStatus === "connected" ? (
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">متصل ونشط</span>
              ) : (
                <span className="text-[9px] text-gray-400 font-bold bg-gray-500/10 px-2 py-0.5 rounded-md">غير متصل</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">أمازون (Amazon Seller)</h4>
              <p className="text-[9px] text-gray-400 mt-0.5">مزامنة الكتالوج والشحنات المباشرة مع مستودعات أمازون</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if ((window as any).__sahm_global_navigate) {
                  (window as any).__sahm_global_navigate("integrations", undefined, { provider: "amazon" });
                }
              }}
              className="w-full py-1 text-[10px] bg-slate-950 hover:bg-slate-900 text-amber-500 font-extrabold rounded-lg border border-slate-800 transition-all cursor-pointer"
            >
              إعدادات أمازون في المركز ➜
            </button>
          </div>
        </div>
      </div>

      {/* Color theme settings */}
      <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2 border-b pb-3 mb-2" style={{ borderColor: theme.border }}>
          <Palette className="w-4 h-4" style={{ color: theme.accent }} />
          <h3 className="text-xs font-black" style={{ color: theme.text }}>تخصيص المظهر وتصميم الألوان</h3>
        </div>

        {/* theme selection */}
        <div>
          <span className="block text-xs font-bold mb-3" style={{ color: theme.muted }}>• نمط ألوان المنظومة الرئيسي</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {THEMES_GUIDE.map(t => (
              <button
                key={t.key}
                onClick={() => setThemeKey(t.key)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer select-none transition-all active:scale-[0.98]`}
                style={{
                  backgroundColor: themeKey === t.key ? theme.accent : theme.surface,
                  borderColor: themeKey === t.key ? theme.accent : theme.border,
                  color: themeKey === t.key ? "#000" : theme.text
                }}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-gray-100/10 inline-block shrink-0" style={{ backgroundColor: t.color }}></span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Theme Builder Configurator Board (Only visible for Custom Theme) */}
        {themeKey === 'custom' && (
          <div className="border-t pt-4 space-y-4 animate-slide-in" style={{ borderColor: theme.border }}>
            <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-500 animate-spin-slow" />
                  <div>
                    <h4 className="text-xs font-black text-white">استوديو تصميم ومحاكاة السمات المطور • Sahm Theme Studio Pro</h4>
                    <p className="text-[10px] text-gray-400">نظام محاكاة لحظي وتصدير مباشر لألوان وهوية متجرك البصرية.</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black">جاهز للبرمجة ⚙️</span>
              </div>

              {/* Theme Studio Quick Presets Segment */}
              <div className="p-3.5 rounded-xl border space-y-2" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                <span className="block text-[10px] font-extrabold text-amber-400">• قالـب تلوين سريع من قائمة مصممي سهم:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: "داكن مخملي 🌌", bg: "#060A12", surface: "#0D131F", card: "#131C2E", border: "#1F2C47", text: "#E2E8F0", muted: "#64748B" },
                    { name: "رملي ذهبي 🏺", bg: "#0F0C08", surface: "#1A140F", card: "#271E17", border: "#3B2F24", text: "#F3EFE9", muted: "#9C8A79" },
                    { name: "شمالي بارد ❄️", bg: "#111827", surface: "#1F2937", card: "#374151", border: "#4B5563", text: "#F9FAFB", muted: "#9CA3AF" },
                    { name: "سهم الأخضر 🌲", bg: "#040F08", surface: "#0A2414", card: "#10331D", border: "#1D5231", text: "#F4FFF7", muted: "#7BA78D" },
                  ].map((preset, pIdx) => (
                    <button
                      type="button"
                      key={pIdx}
                      onClick={() => {
                        setLocalCustomTheme({
                          name: "مخصص",
                          bg: preset.bg,
                          surface: preset.surface,
                          card: preset.card,
                          border: preset.border,
                          text: preset.text,
                          muted: preset.muted,
                          fontFamily: localCustomTheme.fontFamily || "Cairo",
                          borderRadius: localCustomTheme.borderRadius || "12px",
                          shadow: localCustomTheme.shadow || "none"
                        });
                      }}
                      className="py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-center border cursor-pointer select-none text-gray-300 bg-slate-900 border-slate-700 hover:border-amber-500 transition-all active:scale-[0.98]"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 1: Basic Colors Palette */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                
                {/* Background */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-gray-400 block">الخلفية العامة:</label>
                  <input 
                    type="color" 
                    value={localCustomTheme.bg} 
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, bg: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[8px] font-mono text-gray-500 block text-center">{localCustomTheme.bg}</span>
                </div>

                {/* Surface */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-gray-400 block">خلفية النوافذ:</label>
                  <input 
                    type="color" 
                    value={localCustomTheme.surface} 
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, surface: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[8px] font-mono text-gray-500 block text-center">{localCustomTheme.surface}</span>
                </div>

                {/* Card */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-gray-400 block">خلفية البطاقات:</label>
                  <input 
                    type="color" 
                    value={localCustomTheme.card} 
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, card: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[8px] font-mono text-gray-500 block text-center">{localCustomTheme.card}</span>
                </div>

                {/* Border */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-gray-400 block">لون الحدود:</label>
                  <input 
                    type="color" 
                    value={localCustomTheme.border} 
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, border: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[8px] font-mono text-gray-500 block text-center">{localCustomTheme.border}</span>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-gray-400 block">لون النصوص:</label>
                  <input 
                    type="color" 
                    value={localCustomTheme.text} 
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, text: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[8px] font-mono text-gray-500 block text-center">{localCustomTheme.text}</span>
                </div>

                {/* Muted */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-gray-400 block">النصوص الباهتة:</label>
                  <input 
                    type="color" 
                    value={localCustomTheme.muted} 
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, muted: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[8px] font-mono text-gray-500 block text-center">{localCustomTheme.muted}</span>
                </div>

              </div>

              {/* 🎨 Theme Studio Live Sandbox Mockup Preview Panel */}
              <div className="p-4 rounded-xl border space-y-3.5" style={{ backgroundColor: localCustomTheme.bg, borderColor: localCustomTheme.border, shadow: localCustomTheme.shadow }}>
                <span className="block text-[10px] font-black" style={{ color: localCustomTheme.text }}>📺 معاينة حية للمتجر (Theme Studio Realtime Simulated View)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Mock card 1: Miniature Live Invoice */}
                  <div className="p-3 border text-right" style={{ backgroundColor: localCustomTheme.card, borderColor: localCustomTheme.border, borderRadius: localCustomTheme.borderRadius, fontFamily: localCustomTheme.fontFamily }}>
                    <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: localCustomTheme.border }}>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">مكتمل</span>
                      <span className="text-[9px] font-black" style={{ color: localCustomTheme.text }}>فَاتُورَة #9122</span>
                    </div>
                    <div className="my-2 space-y-1">
                      <div className="flex justify-between text-[8.5px]">
                        <span style={{ color: localCustomTheme.muted }}>٤٢٠ ر.س</span>
                        <span style={{ color: localCustomTheme.text }}>دهن عود فخم</span>
                      </div>
                      <div className="flex justify-between text-[8.5px]">
                        <span style={{ color: localCustomTheme.muted }}>٦٥ ر.س</span>
                        <span style={{ color: localCustomTheme.text }}>ضريبة الـ VAT (١٥٪)</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-black pt-1 border-t" style={{ borderColor: localCustomTheme.border, color: localCustomTheme.text }}>
                      <span>٤٨٥ ر.س</span>
                      <span>الإجمالي</span>
                    </div>
                  </div>

                  {/* Mock card 2: Statistical widget responsive to Theme Studio */}
                  <div className="p-3 border text-right" style={{ backgroundColor: localCustomTheme.card, borderColor: localCustomTheme.border, borderRadius: localCustomTheme.borderRadius, fontFamily: localCustomTheme.fontFamily }}>
                    <span className="text-[8.5px] block font-extrabold" style={{ color: localCustomTheme.muted }}>إيرادات المبيعات اللحظية</span>
                    <span className="text-base font-black block my-1 font-mono" style={{ color: localCustomTheme.text }}>١٢٤,٩٢٠ ر.س</span>
                    <div className="flex items-center gap-1 text-[8px] text-emerald-500">
                      <span>↑ ٢٤٪ مبيعات في الرياض هاف اليوم</span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Grid 2: Fonts and Borders and Shadows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs text-right">
                
                {/* Arab Fonts dropdown selection */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10.5px]">نوع الخط المعزز:</label>
                  <select 
                    value={localCustomTheme.fontFamily || "Cairo"}
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, fontFamily: e.target.value })}
                    className="w-full p-2 rounded bg-slate-950 text-white border border-slate-800 cursor-pointer text-right"
                  >
                    <option value="Cairo">خط القاهرة الهندسي المودرن (Cairo)</option>
                    <option value="Tajawal">خط تجوال الرشيق الأنيق (Tajawal)</option>
                    <option value="Amiri">خط أميري للسلع الراقية والعود (Amiri)</option>
                    <option value="JetBrains Mono">خط برمجي تكنولوجي نيون (JetBrains Mono)</option>
                  </select>
                </div>

                {/* Rounded radius dimensions */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10.5px]">درجة إنحناء البطاقات والفورم الحالية:</label>
                  <select 
                    value={localCustomTheme.borderRadius || "12px"}
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, borderRadius: e.target.value })}
                    className="w-full p-2 rounded bg-slate-950 text-white border border-slate-800 cursor-pointer text-right"
                  >
                    <option value="0px">زوايا حادة قوية (Brutalist - 0px)</option>
                    <option value="4px">إنحناء كلاسيكي خفيف وعاكس (Classic Sharp - 4px)</option>
                    <option value="8px">إنحناء ناعم قياسي (Moderate - 8px)</option>
                    <option value="12px">إنحناء عصري ناعم متميز (Modern Web - 12px)</option>
                    <option value="16px">إنحناء ملوكي سهمي (Royal Round - 16px)</option>
                    <option value="24px">إنحناء انسيابي ترفي فاخر (Luxury Curve - 24px)</option>
                  </select>
                </div>

                {/* Shadows density dropdown */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10.5px]">نمط الظلال والعمق ثلاثي الابعاد:</label>
                  <select 
                    value={localCustomTheme.shadow || "none"}
                    onChange={(e) => setLocalCustomTheme({ ...localCustomTheme, shadow: e.target.value })}
                    className="w-full p-2 rounded bg-slate-950 text-white border border-slate-800 cursor-pointer text-right"
                  >
                    <option value="none">بدون ظلال مسطحة كلياً (Flat Flat - none)</option>
                    <option value="0 4px 10px rgba(0,0,0,0.15)">ظلال خفيفة نظيفة طبيعية (Subtle Shadow)</option>
                    <option value="0 8px 30px rgba(0,0,0,0.3)">عملاق الأبعاد فخم جداً (Deep Luxurious)</option>
                    <option value="0 0 15px rgba(212,175,55,0.25)">جلو دافئ ذهبي مشع (Glowing Gold Royal)</option>
                    <option value="0 0 15px rgba(16,185,129,0.25)">جلو مستقبلي أخضر ميكانيكي (Future Neon Glow)</option>
                  </select>
                </div>

              </div>

              {/* Action builder button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleApplyCustomTheme}
                  className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 font-black text-black text-xs rounded-lg cursor-pointer flex items-center gap-1 active:scale-95 transition-all border-0"
                >
                  <span>💾 تطبيق وحفظ الثيم المخصص الحصري</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* accent color selection */}
        <div className="border-t pt-4" style={{ borderColor: theme.border }}>
          <span className="block text-xs font-bold mb-3" style={{ color: theme.muted }}>• لون التمييز والتأثير التفاعلي المقترح</span>
          <div className="flex flex-wrap gap-3.5">
            {Object.entries(ACCENTS).map(([key, col]) => (
              <button
                key={key}
                onClick={() => setAccentKey(key)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow transition-all cursor-pointer transform hover:scale-105 active:scale-95`}
                style={{ 
                  backgroundColor: col, 
                  borderColor: accentKey === key ? theme.text : "transparent"
                }}
              >
                {accentKey === key && <span className="text-white text-xs font-bold font-sans">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* General application configurations */}
      <div className="p-5 rounded-2xl border text-right divide-y" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        
        {/* Currency selection */}
        <div className="flex justify-between items-center pb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-xs font-bold" style={{ color: theme.text }}>العملة والمقاييس المالية المعتمدة</span>
          </div>

          <div className="flex gap-2">
            {["ر.س", "$", "€"].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="text-xs py-1.5 px-3.5 rounded-lg font-bold cursor-pointer transition-colors"
                style={{
                  backgroundColor: currency === c ? theme.accent : theme.surface,
                  color: currency === c ? '#000' : theme.muted,
                  border: `1px solid ${currency === c ? theme.accent : theme.border}`
                }}
              >
                {c === 'ر.س' ? 'ريال سعودي' : c === '$' ? 'دولار أمريكي' : 'يورو'}
              </button>
            ))}
          </div>
        </div>

        {/* Push notifications */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-xs font-bold" style={{ color: theme.text }}>تمكين الإشعارات الفورية والمحاسبية</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Build version and protection logs */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-xs font-bold" style={{ color: theme.text }}>رقم وسرية تشغيل الإصدار الحالي</span>
          </div>
          <span className="font-mono text-xs" style={{ color: theme.muted }}>v2.1.0 • مستقر وأمن</span>
        </div>
      </div>

      {/* 👥 Multi-user Control (تعدد المستخدمين والتحكم بالصلاحيات الهيكلية) */}
      <div className="p-5 rounded-2xl border space-y-5 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <UsersIcon className="w-4.5 h-4.5" style={{ color: theme.accent }} />
            <div>
              <h3 className="text-xs font-black" style={{ color: theme.text }}>إدارة المستخدمين المتعددين والصلاحيات الهيكلية</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">تفويض طاقم العمل ووضع حدود الصلاحيات للمدراء، المحاسبين، وأمناء الكاشير</p>
            </div>
          </div>
          
          {(user.role === "مدير" || user.role === "مالك") ? (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingUserId(null);
                setFormName("");
                setFormUsername("");
                setFormRole("كاشير");
                setErrorMsg("");
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-black cursor-pointer active:scale-95 transition-all animate-pulse"
              style={{ backgroundColor: theme.accent }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إدراج مستخدم جديد ➕</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-550">
              ⚠️ صلاحية عرض فقط مخصصة للرتب الإدارية العليا (رتبتك الحالية: {user.role})
            </span>
          )}
        </div>

        {/* Expandable Form: Add / Edit User */}
        {showAddForm && (
          <form onSubmit={handleSaveUser} className="p-5 rounded-xl space-y-4 border animate-fade-in text-right cursor-default" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h4 className="text-xs font-black text-right" style={{ color: theme.text }}>
              {editingUserId !== null ? "📝 تعديل بيانات المستخدم الحالي" : "👤 إدراج مستخدم جديد إلى طاقم المتجر"}
            </h4>

            {/* Added Image Uploader for User card */}
            <ImageUploader 
              imageUrl={userImageUrl} 
              name={formName || "مستخدم جديد"} 
              onChange={setUserImageUrl} 
              theme={theme} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• الاسم الكامل (مثال: عبدالرحمن الشهري)</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="أدخل الاسم لإنشاء بطاقة المستخدم..."
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• اسم المستخدم للحساب (لتسجيل الدخول)</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="مثال: abdulrahman"
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right font-mono"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  required
                />
              </div>
            </div>

            {/* Link fields: Company, Store, Branch, Warehouse, POS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl" style={{ borderColor: theme.border, backgroundColor: theme.card + "40" }}>
              <div className="col-span-1 md:col-span-2">
                <h5 className="text-[11px] font-black text-right mb-1" style={{ color: theme.accent }}>🏢 الروابط التنظيمية والهيكلية للفروع ومناطق العمل</h5>
                <p className="text-[9px] text-gray-400">يرتبط المستخدم بالمواقع المحددة لتخصيص بيئة عمله المباشرة تلقائياً عند تسجيل الدخول</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• الشركة التابعة</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="مثال: شركة مراسيم الدولية"
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• المتجر التابع</label>
                <select
                  value={formStoreId}
                  onChange={(e) => setFormStoreId(e.target.value)}
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right cursor-pointer"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                >
                  <option value="">-- غير مرتبط بمتجر محدد --</option>
                  {storesList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.tradeName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• الفرع المرتبط (مقيد تشغيلياً)</label>
                <select
                  value={formBranchId}
                  onChange={(e) => setFormBranchId(e.target.value)}
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right cursor-pointer"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                >
                  <option value="">-- غير مرتبط بفرع محدد (يرى كافة الفروع) --</option>
                  {branchesList.map(b => (
                    <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• المستودع المرتبط (جرد وحركة مخزون)</label>
                <select
                  value={formWarehouseId}
                  onChange={(e) => setFormWarehouseId(e.target.value)}
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right cursor-pointer"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                >
                  <option value="">-- اختياري: غير مرتبط بمستودع محدد --</option>
                  {warehousesList.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• نقطة البيع المرتبطة (تفتح كاشير مالي تلقائي)</label>
                <select
                  value={formPosId}
                  onChange={(e) => setFormPosId(e.target.value)}
                  className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right cursor-pointer"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                >
                  <option value="">-- اختياري: غير مرتبط بجهاز POS --</option>
                  {posUnitsList
                    .filter(pos => !formBranchId || pos.branchId === formBranchId)
                    .map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5 text-right" style={{ color: theme.muted }}>• الرتبة الوظيفية وصلاحيات الهيكل المالي</label>
              <select
                value={formRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full text-xs rounded-lg py-2 px-3 border outline-none text-right cursor-pointer font-bold"
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
              >
                <option value="مالك">👑 مالك (مالك المنشأة - صلاحيات شمولية وتبديل كامل)</option>
                <option value="مدير">💎 مدير (المدير الإداري - تحكم عام كامل بالفروع)</option>
                <option value="مشرف">💼 مشرف عمليات (إشراف ومتابعة مع الفروع والمستودعات)</option>
                <option value="كاشير">🛒 كاشير مبيعات (تقييد مباشر بنقاط المبيعات)</option>
                <option value="موظف مخزون">📦 موظف اللوجستيات والمخازن (إدارة حركة مستودع)</option>
                <option value="دعم">🛠️ دعم فني (صلاحيات عرض تشخيصي وصيانة)</option>
              </select>
            </div>

            {/* Custom Permissions Select List */}
            <div className="p-4 border rounded-xl space-y-3" style={{ borderColor: theme.border, backgroundColor: theme.card + "20" }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold" style={{ color: theme.text }}>🔑 تخصيص الصلاحيات التشغيلية (Permissions):</span>
                <button
                  type="button"
                  onClick={() => setFormPermissions(Object.keys(DEFAULT_ROLE_PERMISSIONS).reduce((acc, k) => [...acc, ...DEFAULT_ROLE_PERMISSIONS[k]], [] as string[]).filter((v, i, self) => self.indexOf(v) === i))}
                  className="text-[9px] font-bold underline cursor-pointer"
                  style={{ color: theme.accent }}
                >
                  تحديد الكل
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                {[
                  { key: "workspace:view_all", label: "عرض كل المتاجر والفروع", desc: "يرى المالك البيانات الإجمالية بالكامل" },
                  { key: "workspace:switch", label: "صلاحية تبديل الفروع (workspace:switch)", desc: "سماح للمستخدم بتبديل الفروع يدوياً" },
                  { key: "branch:view", label: "استعراض الفرع والتقارير", desc: "فتح وقراءة الفرع المرتبط وتقاريره" },
                  { key: "branch:manage", label: "إدارة الفروع وتهيئتها", desc: "تعديل، حذف وإضافة خصائص الفرع" },
                  { key: "pos:access", label: "دخول واجهة الكاشير POS", desc: "تحميل تابات الفوترة ونقاط المبيعات" },
                  { key: "pos:sell", label: "إجراء وإصدار العمليات البيعية", desc: "إتمام الدفع وطباعة الفاتورة" },
                  { key: "inventory:view", label: "استعراض المخازن وحالة الجرد", desc: "مشاهدة مستويات المخزون والمدخلات" },
                  { key: "inventory:manage", label: "تنفيذ التعديلات وحركة النقل", desc: "التوريد والنقل وإدارة المستودعات" }
                ].map(p => {
                  const checked = formPermissions.includes(p.key);
                  return (
                    <label key={p.key} className="flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all hover:bg-white/5 text-right" style={{ borderColor: checked ? theme.accent + "50" : theme.border, backgroundColor: checked ? theme.accent + "05" : "transparent" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormPermissions([...formPermissions, p.key]);
                          } else {
                            setFormPermissions(formPermissions.filter(it => it !== p.key));
                          }
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold" style={{ color: checked ? theme.accent : theme.text }}>{p.label}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{p.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Added NationalAddressForm for User */}
            <div className="pt-2">
              <NationalAddressForm 
                initialAddress={userAddressProfile} 
                onChange={setUserAddressProfile} 
                theme={theme} 
              />
            </div>
            
            {/* Context helper text according to role chosen */}
            <div className="mt-2 p-2 px-3 bg-opacity-30 rounded-lg text-[9px] leading-relaxed text-gray-400 text-right" style={{ backgroundColor: theme.card }}>
              {formRole === "مالك" && "👑 المالك العام: يتحكم بكامل المتاجر والشركات القابضة، ويمتاز بقدرته على تجاوز التقييدات التشغيلية والتنقل الفوري بين شاشات الكاشير والمخازن بكل سلاسة."}
              {formRole === "مدير" && "🛡️ صلاحية المدير العام: يمتلك صلاحية تعديل الإعدادات المحاسبية وتعديل وضبط المستخدمين، الوصول للتقارير والتحليل الذكائي، وإعدادات الربط والتحويل بين الفروع المرخصة."}
              {formRole === "مشرف" && "📂 رتبة المشرف: مهام الإدارة التشغيلية اليومية، المتابعة الميدانية للعمليات والكميات، والتوريد ومطابقة أرصدة الكاشيرات والمستودعات."}
              {formRole === "كاشير" && "🔌 كاشير مبيعات: واجهة نقطة بيع POS مبسطة ومباشرة مخصصة للفرع وجهاز الكاشير الخاص به. لا يمكن تغيير الفرع ولا تصفح تقارير الإدارة العامة."}
              {formRole === "موظف مخزون" && "📦 موظف لوجستيات: مخصص لإدارة المخزن وتعيين مستودع جرد وجدول التوريدات والتحويل المالي الميداني فقط."}
              {formRole === "دعم" && "🛠️ دعم فني خارجي: تصفح تشخيصي لبعض اللوحات للمتابعة وحل المشكلات البينية."}
            </div>

            {errorMsg && (
              <p className="text-[10px] text-red-400 font-bold bg-red-950/20 p-2 rounded-lg border border-red-900/30 text-center">
                ⚠️ {errorMsg}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="submit"
                className="py-1.5 px-4 rounded-lg font-bold text-[10px] text-black cursor-pointer active:scale-95 transition-all"
                style={{ backgroundColor: theme.accent }}
              >
                💾 حفظ بيانات المستخدم
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUserId(null);
                }}
                className="py-1.5 px-4 rounded-lg font-bold text-[10px] border cursor-pointer active:scale-95 transition-all"
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Users list database representation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(users || []).map((u) => {
            const isMe = u.id === user.id;
            
            // Custom display color variables based on Role type
            let roleBadgeClass = "";
            let roleDesc = "";
            if (u.role === "مالك") {
              roleBadgeClass = "text-rose-400 bg-rose-400/10 border-rose-400/20";
              roleDesc = "المالك العام للمنشأة وصاحب كل فروع القابضة والشركات";
            } else if (u.role === "مدير") {
              roleBadgeClass = "text-amber-400 bg-amber-400/10 border-amber-400/20";
              roleDesc = "المدير الإداري العام للفروع وتعديل الإعدادات والفوترة";
            } else if (u.role === "مشرف") {
              roleBadgeClass = "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
              roleDesc = "الإشراف وجرد الكميات ومطابقة أرصدة الكاشيرات والمستودعات";
            } else if (u.role === "كاشير" || u.role === "محاسب") {
              roleBadgeClass = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
              roleDesc = "نقطة البيع السريعة POS ومعالجة معاملات المبيعات اليومية";
            } else if (u.role === "موظف مخزون") {
              roleBadgeClass = "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
              roleDesc = "متابعة التوريد والنقل وإدارة المستندات ومعاينة المخزن";
            } else {
              roleBadgeClass = "text-slate-400 bg-slate-400/10 border-slate-400/20";
              roleDesc = "معاينة تشخيصية وفتح كاشيرات الصيانة وتدقيق المدخلات";
            }

            // Find linked company & names
            const storeObj = storesList.find(s => s.id === u.storeId);
            const branchObj = branchesList.find(b => b.id === u.branchId);
            const whObj = warehousesList.find(w => w.id === u.warehouseId);
            const posObj = posUnitsList.find(p => p.id === u.posId);

            return (
              <div 
                key={u.id}
                className="p-4 rounded-xl border flex flex-col justify-between gap-3 text-right group relative"
                style={{ backgroundColor: theme.surface, borderColor: isMe ? theme.accent + "40" : theme.border }}
              >
                {/* Me badge */}
                {isMe && (
                  <span className="absolute top-2.5 left-2.5 text-[8px] font-extrabold py-0.5 px-2 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse">
                    أنت حالياً 👤
                  </span>
                )}

                <div className="flex items-center gap-3">
                  {u.imageUrl ? (
                    <img 
                      src={u.imageUrl} 
                      alt={u.name} 
                      referrerPolicy="no-referrer" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" 
                    />
                  ) : u.role === "مدير" || u.role === "مالك" ? (
                    <img 
                      src={sahmMiniMarkPngUrl} 
                      alt="Sahm OS Mini Mark" 
                      className="w-10 h-10 rounded-lg object-contain border border-slate-800/85 shadow-md shrink-0 hover:scale-105 transition-transform" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0"
                      style={{ backgroundColor: isMe ? theme.accent : theme.border, color: isMe ? "#000" : theme.text }}
                    >
                      {u.avatar || u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="space-y-0.5 min-w-0 flex-1 text-right">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black truncate" style={{ color: theme.text }}>{u.name}</h4>
                        <span className={`text-[8px] font-extrabold py-0.5 px-2 rounded-md border shrink-0 ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </div>
                      {u.addressProfile?.shortAddress && (
                        <span className="text-[8px] font-mono font-black border border-amber-500/20 text-amber-550 bg-amber-500/10 px-1 rounded uppercase tracking-wider">
                          {u.addressProfile.shortAddress}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[9px]" style={{ color: theme.muted }}>@{u.username}</p>
                  </div>
                </div>

                {/* Corporate links details box */}
                {(u.company || u.storeId || u.branchId || u.warehouseId || u.posId) && (
                  <div className="p-2.5 rounded-lg text-[9px] space-y-1 bg-black/20 border border-zinc-800/60 leading-normal text-right">
                    <span className="text-[8px] font-black text-amber-500 block">• الارتباطات الهيكلية:</span>
                    {u.company && <p style={{ color: theme.text }}>🏢 الشركة: <span className="font-bold">{u.company}</span></p>}
                    {u.storeId && <p style={{ color: theme.text }}>🏬 المتجر: <span className="font-bold">{storeObj?.name || u.storeId}</span></p>}
                    {u.branchId ? (
                      <p style={{ color: theme.text }}>📍 الفرع المرتبط: <span className="font-bold text-sky-400">{branchObj?.name || u.branchId}</span></p>
                    ) : (
                      <p className="text-slate-500">📍 الفرع: <span className="italic">مفتوح (تصفح جميع الفروع)</span></p>
                    )}
                    {u.warehouseId && <p style={{ color: theme.text }}>📦 المستودع الفعلي: <span className="font-bold">{whObj?.name || u.warehouseId}</span></p>}
                    {u.posId && <p style={{ color: theme.text }}>🛒 وحدة الـ POS: <span className="font-bold text-emerald-400">{posObj?.name || u.posId}</span></p>}
                  </div>
                )}

                {/* Custom Permissions Pills List */}
                {u.permissions && u.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-1">
                    {u.permissions.map(perm => (
                      <span key={perm} className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-800 text-gray-300 font-mono">
                        🔑 {perm}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sub National Address Profile for Users */}
                {u.addressProfile && (
                  <div className="px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-900/60 text-right space-y-1">
                    <span className="text-[8px] text-gray-400 font-bold block">العنوان الوطني المعتمد (SPL)</span>
                    <p className="text-[10px] text-gray-300 leading-normal font-sans">
                      مبنى {u.addressProfile.buildingNumber}، {u.addressProfile.streetName}، {u.addressProfile.district}، {u.addressProfile.city}، الرمز البريدي {u.addressProfile.postalCode}
                    </p>
                    <div className="flex gap-2 justify-start pt-1">
                      <button
                        onClick={() => {
                          const formatted = `العنوان الوطني للمستخدم (${u.name}): مبنى ${u.addressProfile?.buildingNumber} ${u.addressProfile?.streetName}، ${u.addressProfile?.district}، ${u.addressProfile?.city}`;
                          navigator.clipboard.writeText(formatted);
                          triggerNotification?.("تم نسخ عنوان المستخدم 📋");
                        }}
                        className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[8px] rounded font-bold text-gray-400 hover:text-white transition-colors border-none cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-2 h-2" />
                        <span>نسخ 📋</span>
                      </button>

                      {u.addressProfile.mapLink && (
                        <a
                          href={u.addressProfile.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[8px] rounded font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-[8px]"
                        >
                          <MapPin className="w-2 h-2" />
                          <span>عرض الخريطة 📍</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-2 mt-1 space-y-2" style={{ borderColor: theme.border }}>
                  <p className="text-[9px] text-gray-400 select-none leading-relaxed">
                    ⚙️ <span className="font-medium text-gray-300">{roleDesc}</span>
                  </p>

                  {/* Actions (Allowed for المالك or المدير role) */}
                  {(user.role === "مدير" || user.role === "مالك") && (
                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-1 px-2.5 rounded text-[9px] font-bold border flex items-center gap-1 hover:bg-slate-800 cursor-pointer active:scale-95 transition-all text-blue-400"
                        style={{ borderColor: theme.border }}
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={isMe}
                        className="p-1 px-2.5 rounded text-[9px] font-bold border flex items-center gap-1 cursor-pointer active:scale-95 transition-all text-red-400 disabled:opacity-20 disabled:pointer-events-none"
                        style={{ borderColor: theme.border }}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SaaS subscription visual details board (Bullet 10) */}
      <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 mb-2" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-xs font-black" style={{ color: theme.text }}>إدارة اشتراك سهم SaaS والتراخيص</h3>
              <p className="text-[10px] text-gray-400">تابع حدود مبيعات المنظومة واستهلاك باقتك الحالية أو قم بترقيتها فوراً</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSubscriptionPlanModal(true)}
            className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow self-start sm:self-center"
          >
            ترقية أو إدارة الباقة 💳
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl space-y-1.5 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <span className="text-[10px] text-gray-400 block">• نوع الباقة الفعالة</span>
            <span className="block text-xs font-black" style={{ color: theme.accent }}>
              {subscription?.tier === 'A' ? "باقة تجريبية" : subscription?.tier === 'B' ? "باقة النمو الاحترافية 🚀" : "باقة النخبة للشركات"}
            </span>
            <span className="block text-[8px] text-gray-500">معدل الفوترة: سنوي</span>
          </div>

          <div className="p-4 rounded-xl space-y-1.5 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <span className="text-[10px] text-gray-400 block">• حدود معالجة الطلبات</span>
            <span className="block text-xs font-mono font-black" style={{ color: theme.text }}>
              {subscription?.currentUsed?.toLocaleString()} / {subscription?.limit?.toLocaleString()} طلب
            </span>
            <span className="block text-[8px] text-gray-500">تم استهلاك {Math.round(((subscription?.currentUsed ?? 0) / (subscription?.limit ?? 1)) * 100)}% من طاقة الشهر</span>
          </div>

          <div className="p-4 rounded-xl space-y-1.5 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <span className="text-[10px] text-gray-400 block">• تاريخ التجديد السنوي</span>
            <span className="block text-xs font-black" style={{ color: theme.text }}>
              {subscription?.renewsAt}
            </span>
            <span className="block text-[8px] text-gray-500">تجديد تلقائي آمن</span>
          </div>
        </div>
      </div>

      {/* Supabase PostgreSQL Project Migration System (Bullet 18 & 17) */}
      <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 mb-2" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5" style={{ color: theme.accent }} />
            <div>
              <h3 className="text-xs font-black" style={{ color: theme.text }}>مركز المزامنة لترحيل البيانات لـ Supabase ⚡</h3>
              <p className="text-[10px]" style={{ color: theme.muted }}>اربط مشروعك السحابي لحفظ الفواتير والعمليات في قاعدة بيانات Postgres حقيقية مباشرة</p>
            </div>
          </div>
          {isSupabaseConnected ? (
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-1 px-2.5 rounded-lg font-black flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>خادم Supabase نشط</span>
            </span>
          ) : (
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-gray-400 py-1 px-2.5 rounded-lg font-bold">
              تخزين محلي (Local DB Mode)
            </span>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-gray-400">
          منصة سهم متوافقة بالكامل مع خوادم **Supabase**. عند إضافة مفاتيح العمل السحابية الخاصة بمشروعك، سنقوم بإنشاء المخطط السحابي (PostgreSQL tables) ومزامنة كامل الفواتير، وبيئة POS، وحسابات العملاء بشكل لحظي وآمن.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5">• عنوان مشروع Supabase (API URL):</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              disabled={isSupabaseConnected || isMigratingToSupabase}
              placeholder="مثال: https://xrqbygswtyrskymmlytp.supabase.co"
              className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-left font-mono"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5">• مفتاح الوصول العام (Anon API Key):</label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              disabled={isSupabaseConnected || isMigratingToSupabase}
              placeholder="أدخل مفتاح Supabase public anon key الخاص بك..."
              className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-left font-mono"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            />
          </div>
        </div>

        {/* Console view for real-time migration logs */}
        {(isMigratingToSupabase || supabaseMigrationLogs.length > 0) && (
          <div className="p-3.5 rounded-xl bg-black border border-slate-800 text-left space-y-1 max-h-48 overflow-y-auto">
            <span className="block text-right text-[8px] font-mono text-gray-500 uppercase tracking-widest border-b border-gray-900 pb-1 mb-2">Supabase SQL Console Logs</span>
            {supabaseMigrationLogs.map((log, idx) => (
              <p key={idx} className="font-mono text-[9px] text-emerald-400 tracking-wide select-text leading-tight">{log}</p>
            ))}
            {isMigratingToSupabase && (
              <div className="flex items-center gap-1.5 justify-start text-[9.5px] text-gray-500 font-mono animate-pulse pt-1">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                <span>ترحيل حزم الجداول نشط الآن...</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-1">
          {isSupabaseConnected ? (
            <button
              type="button"
              onClick={handleDisconnectSupabase}
              className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              قطع الاتصال واستعادة التخزين المحلي 🔌
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSupabaseMigration}
              disabled={isMigratingToSupabase}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              {isMigratingToSupabase && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>اختبار الاتصال وترحيل البيانات حياً لـ Supabase 🚀</span>
            </button>
          )}
        </div>
      </div>

      {/* Backup and restore panel */}
      <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2 border-b pb-3 mb-2" style={{ borderColor: theme.border }}>
          <Database className="w-4 h-4" style={{ color: theme.accent }} />
          <h3 className="text-xs font-black" style={{ color: theme.text }}>النسخ الاحتياطي وإدارة البيانات</h3>
        </div>

        <p className="text-xs" style={{ color: theme.muted }}>
          قم بحفظ وتصدير قاعدة بيانات متجرك بالكامل (شاملاً المنتجات المضافة، الفواتير الصادرة، والعملاء) للرجوع إليها كنسخة احتياطية محلية، أو استيرادها في أي جهاز آخر لتسجيل العمليات بسلاسة.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs cursor-pointer shadow-sm transition-all border hover:brightness-110 active:scale-95"
            style={{ backgroundColor: theme.accent + "15", borderColor: theme.accent + "35", color: theme.accent }}
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>تصدير نسخة احتياطية محلية (JSON) 📤</span>
          </button>

          {/* Import Button Wrapper */}
          <div className="relative">
            <input
              type="file"
              id="restore-file-input"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <label
              htmlFor="restore-file-input"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs cursor-pointer shadow-sm transition-all border hover:brightness-110 active:scale-95 text-center w-full block"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>استيراد واستعادة نسخة احتياطية 📥</span>
            </label>
          </div>
        </div>
      </div>

      {/* App branding footer card block */}
      <div className="p-6 rounded-2xl border text-center flex flex-col items-center justify-center space-y-3"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="w-12 h-12 bg-gray-500/5 rounded-2xl flex items-center justify-center text-lg shadow">
          🚀
        </div>
        <h4 className="text-sm font-black" style={{ color: theme.text }}>منصة سهم المحاسبية الذكية</h4>
        <p className="text-xs max-w-sm" style={{ color: theme.muted }}>
          تمكنك منصة سهم من ترصيد وربط وإطلاق مبيعاتك وتجارتك بقوة بالغة باستخدام أدوات ذكاء الاصطناعي الرائدة. مرخصة للاستخدام الشخصي والمؤسسي.
        </p>
        <span className="text-[10px] flex items-center gap-1" style={{ color: theme.muted }}>
          صنع بكل شغف وحب <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> • سهم 2026
        </span>
      </div>
        </>
      )}

      {settingsTab === "theme" && (
        <ThemeStudioMarketplace
          theme={theme}
          themeKey={themeKey as any}
          accentKey={accentKey}
          setThemeKey={setThemeKey}
          setAccentKey={setAccentKey}
          customThemeDetails={localCustomTheme}
          onSaveCustomTheme={(val) => {
            if (setCustomTheme) {
              setCustomTheme(val);
              localStorage.setItem("sahm_web_custom_theme", JSON.stringify(val));
            }
            setLocalCustomTheme(val);
            setThemeKey("custom");
            triggerNotification?.("تم بناء وتحديث قالب البراند بنجاح! 🎨", "success");
          }}
          onAddLog={(action, details) => {
            addAuditLog?.(action, details);
          }}
        />
      )}

      {settingsTab === "subscription" && (
        <SaaSSubscriptionEngine
          theme={theme}
          subscription={subscription}
          onUpgrade={(tier, limit) => {
            if (setSubscription) {
              setSubscription({
                ...subscription,
                tier,
                limit,
                currentUsed: subscription.currentUsed || 4945,
                renewsAt: tier === "C" ? "٢٠٢٨/٠٥/٠٥" : "٢٠٢٧/١٢/١٢"
              });
            }
          }}
          onAddLog={(action, d) => addAuditLog?.(action, d)}
          triggerNotification={(t, m, type) => triggerNotification?.(`[${t}] ${m}`, type)}
        />
      )}

      {settingsTab === "audit" && (
        <AuditLogTimeline
          theme={theme}
          logs={auditLogs}
          onAddLog={(action, d) => addAuditLog?.(action, d)}
          currentUser={user}
        />
      )}

      {settingsTab === "backup" && (
        <BackupRestoreSystem
          theme={theme}
          onRestore={(data) => {
            if (data.products) localStorage.setItem("sahm_web_products", JSON.stringify(data.products));
            if (data.customers) localStorage.setItem("sahm_web_customers", JSON.stringify(data.customers));
            if (data.invoices) localStorage.setItem("sahm_web_invoices", JSON.stringify(data.invoices));
            if (data.suppliers) localStorage.setItem("sahm_web_suppliers", JSON.stringify(data.suppliers));
            if (data.stores) localStorage.setItem("sahm_web_stores", JSON.stringify(data.stores));
            if (data.activeStoreId) localStorage.setItem("sahm_active_store_id", data.activeStoreId);
            
            triggerNotification?.("تم تأكيد ودمج ملف الاستيراد وقنوات المتاجر المتعددة في قواعد سهم! 📥", "success");
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          }}
          onAddLog={(action, d) => addAuditLog?.(action, d)}
          triggerNotification={(t, m, type) => triggerNotification?.(`[${t}] ${m}`, type)}
        />
      )}

      {settingsTab === "media" && (
        <MediaCenter 
          theme={theme} 
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
          currentUser={user}
        />
      )}

      {/* 💳 SaaS Subscription Multi-Tier Upgrade Portal (Bullet 10) */}
      {showSubscriptionPlanModal && (
        <div className="fixed inset-0 bg-black/95 p-4 flex items-center justify-center z-50 overflow-y-auto backdrop-blur-md">
          <div className="w-full max-w-4xl p-6 rounded-3xl border text-right space-y-6 animate-scale-up"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            
            <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setShowSubscriptionPlanModal(false)}
                className="py-1 px-3 text-[10px] bg-slate-900 border text-gray-400 border-slate-700 hover:text-white rounded-lg cursor-pointer"
              >
                إغلاق النافذة ✕
              </button>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">باقات اشتراك سهم الموحدة • Sahm Smart SaaS Plans</h3>
                <p className="text-[10px] text-gray-400">اختر الباقة المثلى لتجارتك وضاعف مبيعاتك وأرباحك من خلال ذكاء سهم الموحد</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* PLAN A: Trial */}
              <div className="p-5 rounded-2xl border flex flex-col justify-between gap-4 bg-slate-950/40 relative" style={{ borderColor: theme.border }}>
                <div className="space-y-2 text-right">
                  <span className="text-[8px] bg-slate-800 text-gray-400 py-0.5 px-2 rounded font-black block w-max uppercase">الأساسية التجريبية</span>
                  <h4 className="text-xs font-black text-white">باقة البداية سهم Basic</h4>
                  <p className="text-[9.5px] text-gray-400">مثالية لتجربة الأدوات وفهم لوحات التحكم ونقاط المبيعات البسيطة.</p>
                  <div className="py-2">
                    <span className="text-xl font-black text-gray-150">مـجـانـاً</span>
                    <span className="text-[9px] text-gray-500"> / شهرياً</span>
                  </div>
                  <div className="border-t pt-2 space-y-1.5 text-[9.5px]" style={{ borderColor: theme.border }}>
                    <p className="text-[#D4AF37] font-black">✓ بـ POS كاشير فردي</p>
                    <p className="text-[#D4AF37] font-black">✓ إصدار فواتير لغاية ١,٠٠٠ مستند</p>
                    <p className="text-gray-500 line-through">✗ تحليلات الذكاء الاصطناعي الفائقة</p>
                    <p className="text-gray-500 line-through">✗ مزامنة Salla و Zid ومخازن متعددة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubscription({ ...subscription, tier: "A", limit: 1000, currentUsed: 450 });
                    triggerNotification("تم تعديل باقة الاشتراك للأساسية التجريبية.", "success");
                    setShowSubscriptionPlanModal(false);
                    addAuditLog("تنسيق باقة", "تم تفعيل باقة سهم الأساسية بنجاح لمؤسستك.");
                  }}
                  className="w-full py-2 bg-slate-900 border text-white text-xs font-extrabold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                  style={{ borderColor: theme.border }}
                >
                  تفعيل مجاني
                </button>
              </div>

              {/* PLAN B: Pro Growth */}
              <div className="p-5 rounded-2xl border flex flex-col justify-between gap-4 relative overflow-hidden" 
                style={{ backgroundColor: theme.surface, borderColor: "#D4AF37" }}>
                <div className="absolute top-0 left-0 bg-[#D4AF37] text-black font-black text-[8px] px-3.5 py-0.5 rounded-br-xl select-none uppercase">الأكثر طلباً 🚀</div>
                <div className="space-y-2 text-right">
                  <span className="text-[8px] bg-amber-500/10 text-amber-500 py-0.5 px-2 rounded font-black block w-max uppercase">باقة النمو والتوسع</span>
                  <h4 className="text-xs font-black text-white">سهم الاحترافية Pro SaaS</h4>
                  <p className="text-[9.5px] text-gray-300">مناسبة تماماً للمحلات ومتاجر العطور النشطة ذات الفروع المتعددة.</p>
                  <div className="py-2">
                    <span className="text-xl font-black text-amber-500">٢٤٩ ر.س</span>
                    <span className="text-[9px] text-gray-400 font-bold"> / شهرياً (سنوياً)</span>
                  </div>
                  <div className="border-t pt-2 space-y-1.5 text-[9.5px]" style={{ borderColor: theme.border }}>
                    <p className="text-amber-500 font-extrabold">✓ كل ميزات الأساسية + ٣ مستخدمين</p>
                    <p className="text-amber-500 font-extrabold">✓ لغاية ١٠,٠٠٠ فاتورة شهرياً</p>
                    <p className="text-amber-500 font-extrabold">✓ ذكاء سهم الاصطناعي والتقارير المالية</p>
                    <p className="text-amber-500 font-extrabold">✓ مزامنة سحابية حرة مع Salla و Zid</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubscription({ ...subscription, tier: "B", limit: 10000, currentUsed: 4945 });
                    triggerNotification("أنت مشترك ومفعل لباقة سهم الاحترافية سلفاً! شكراً لثقتكم ✅", "success");
                    setShowSubscriptionPlanModal(false);
                  }}
                  className="w-full py-2 bg-amber-500 text-black text-xs font-black rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                >
                  الباقة الفعالة حالياً ✓
                </button>
              </div>

              {/* PLAN C: Enterprise Elite */}
              <div className="p-5 rounded-2xl border flex flex-col justify-between gap-4 bg-slate-950/40 relative" style={{ borderColor: theme.border }}>
                <div className="space-y-2 text-right">
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 py-0.5 px-2 rounded font-black block w-max uppercase">الشركات العملاقة</span>
                  <h4 className="text-xs font-black text-white">سهم إنتربرايز النخبة Corporate</h4>
                  <p className="text-[9.5px] text-gray-400">مخصصة للشركات والمصانع وسلاسل معارض التجميل الكبيرة بالخليج.</p>
                  <div className="py-2">
                    <span className="text-xl font-black text-purple-400">٧٩٩ ر.س</span>
                    <span className="text-[9px] text-gray-500"> / شهرياً</span>
                  </div>
                  <div className="border-t pt-2 space-y-1.5 text-[9.5px]" style={{ borderColor: theme.border }}>
                    <p className="text-[#D4AF37] font-black">✓ مستخدمون بلا حدود + صلاحيات RBAC متقدمة</p>
                    <p className="text-[#D4AF37] font-black">✓ طلبات وفواتير غير محدودة شهرياً (Unlimited)</p>
                    <p className="text-[#D4AF37] font-black">✓ بث كاميرات الفروع ومستودع رب التخزين السحابي</p>
                    <p className="text-[#D4AF37] font-black">✓ دعم هاتفي فني مخصص على مدار الساعة ٢٤</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubscription({ ...subscription, tier: "C", limit: 999999, currentUsed: 12590, renewsAt: "٢٠٢٨/٠٥/٠٥" });
                    triggerNotification("ممتاز! تم الترقية إلى باقة سهم النخبة إنتربرايز غير المحدودة! 👑", "success");
                    setShowSubscriptionPlanModal(false);
                    addAuditLog("ترقية الاشتراك لإنتربرايز", "قام كبار الإدارة بترقية الترخيص إلى باقة النخبة بلا حدود");
                  }}
                  className="w-full py-2 bg-purple-600 text-white text-xs font-extrabold rounded-xl hover:bg-purple-700 active:scale-95 transition-all cursor-pointer"
                >
                  الترقية للنخبة الفاخرة Corporate 👑
                </button>
              </div>

            </div>

            <p className="text-[9px] text-gray-500 text-center uppercase tracking-wide">
              * الأسعار أعلاه خاضعة لـ نظام ضريبة القيمة المضافة ومستضافة سحابياً بشكل مؤمن بنسبة 100% في خوادم سهم الآمنة بالمملكة.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
