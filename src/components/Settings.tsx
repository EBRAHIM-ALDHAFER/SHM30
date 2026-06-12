import React, { useState, useEffect } from "react";
import { ThemeColors, User, AddressProfile } from "../types";
import { integrationsService } from "../core/database/integrationsService";
import { SahmDatabaseService } from "../core/database/dbService";
import { 
  LogOut, Store, Smartphone, Palette, Bell, Volume2, Landmark, ShieldCheck, Heart, Database, Download, Upload,
  Users as UsersIcon, UserPlus, Trash2, Edit2, Shield, Link, CheckCircle2, XCircle, Wifi, WifiOff, RefreshCw, Globe,
  Clock, Activity, Plus, PlusCircle, Sparkles, ShieldAlert, Copy, MapPin, Eye, EyeOff, Search, Filter, Mail, Phone,
  CreditCard
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
import { getMediaCenterFiles, saveMediaCenterFiles } from "../utils/safeStorage";
import { 
  saveCustomIcon, 
  resetCustomIcon, 
  getActiveIconValue, 
  CustomIconRenderer, 
  AVAILABLE_LIBRARY_ICONS 
} from "../lib/customIcons";

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
  onOpenHRTab?: () => void;
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
  onOpenHRTab = () => {},
  initialSubTab = "general",
  storesList = [],
  branchesList = [],
  warehousesList = [],
  posUnitsList = []
}: SettingsProps) {

  // Sub-tabs navigation state inside Settings
  const [settingsTab, setSettingsTab] = useState<"general" | "theme" | "subscription" | "audit" | "backup" | "media" | "icons">("general");

  const isPlatformOwner = !!(user && (user.role === "platform_owner" || user.role === "system_owner" || user.role === "system_admin"));

  useEffect(() => {
    if (!isPlatformOwner && settingsTab !== "general") {
      setSettingsTab("general");
    }
  }, [isPlatformOwner, settingsTab]);

  useEffect(() => {
    if (initialSubTab === "media" && isPlatformOwner) {
      setSettingsTab("media");
    }
  }, [initialSubTab, isPlatformOwner]);

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
  const [isStrictSupabase] = useState(() => {
    const mode = import.meta.env.VITE_DATA_MODE;
    return mode === "supabase" || mode === "production";
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  const isSupabaseConnected = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const isMigratingToSupabase = false;
  const supabaseMigrationLogs: string[] = [];

  // --- SaaS Plan Pricing Upgrades Model ---
  const [showSubscriptionPlanModal, setShowSubscriptionPlanModal] = useState(false);

  // User Management local states (تعدد المستخدمين والتحكم بالصلاحيات آلياً)
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formRole, setFormRole] = useState<string>("cashier");
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>(undefined);
  const [userAddressProfile, setUserAddressProfile] = useState<AddressProfile | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState("");

  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "disabled" | "pending">("active");
  const [formEmailVerified, setFormEmailVerified] = useState(false);
  const [formMustChangePassword, setFormMustChangePassword] = useState(false);

  // Scope ranges
  const [formAllowedStoreIds, setFormAllowedStoreIds] = useState<string[]>(["store_1"]);
  const [formAllowedBranchIds, setFormAllowedBranchIds] = useState<string[]>([]);
  const [formAllowedWarehouseIds, setFormAllowedWarehouseIds] = useState<string[]>([]);
  const [formAllowedPosIds, setFormAllowedPosIds] = useState<string[]>([]);
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  // Search and filter inputs
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("");
  const [userFilterStatus, setUserFilterStatus] = useState("");
  const [formShowPassword, setFormShowPassword] = useState(false);

  // Fallback / legacy compatibility fields
  const [formCompany, setFormCompany] = useState("مجموعة مراسيم القابضة");
  const [formStoreId, setFormStoreId] = useState("");
  const [formBranchId, setFormBranchId] = useState("");
  const [formWarehouseId, setFormWarehouseId] = useState("");
  const [formPosId, setFormPosId] = useState("");

  const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    tenant_owner: [
      "users:view", "users:create", "users:update", "users:disable", "roles:manage",
      "pos:access", "pos:sell", "pos:settings:manage", "inventory:view", "inventory:manage",
      "products:view", "products:manage", "reports:view", "finance:view", "settings:manage",
      "workspace:view_all", "workspace:switch", "branch:view", "branch:manage"
    ],
    admin: [
      "users:view", "users:create", "users:update", "users:disable", "roles:manage",
      "pos:access", "pos:sell", "pos:settings:manage", "inventory:view", "inventory:manage",
      "products:view", "products:manage", "reports:view", "finance:view", "settings:manage",
      "workspace:switch", "branch:view", "branch:manage"
    ],
    branch_manager: [
      "pos:access", "pos:sell", "inventory:view", "inventory:manage",
      "products:view", "branch:view"
    ],
    inventory_manager: [
      "inventory:view", "inventory:manage", "products:view", "branch:view"
    ],
    cashier: [
      "pos:access", "pos:sell", "products:view", "inventory:view"
    ],
    accountant: [
      "finance:view", "reports:view", "products:view", "inventory:view", "branch:view"
    ],
    marketer: [
      "products:view", "pos:access", "reports:view"
    ],
    support: [
      "products:view", "inventory:view", "branch:view"
    ],
    custom: []
  };

  const ROLE_TRANSLATIONS: Record<string, string> = {
    tenant_owner: "مالك النظام (Owner)",
    admin: "مدير النظام (Admin)",
    branch_manager: "مدير فرع (Branch Manager)",
    inventory_manager: "مدير مخزون (Inventory Manager)",
    cashier: "كاشير (Cashier)",
    accountant: "محاسب (Accountant)",
    marketer: "مسوّق (Marketer)",
    support: "موظف دعم (Support)",
    custom: "مستخدم مخصص (Custom)",
    // legacy backups
    "مالك": "مالك النظام (Owner)",
    "مدير": "مدير النظام (Admin)",
    "مشرف": "مدير فرع (Branch Manager)",
    "كاشير": "كاشير (Cashier)",
    "موظف مخزون": "مدير مخزون (Inventory Manager)",
    "دعم": "موظف دعم (Support)",
    "محاسب": "محاسب (Accountant)"
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

    if (!formEmail.trim() || !formPhone.trim()) {
      setErrorMsg("البريد الإلكتروني ورقم الجوال مطلوبان لحفظ الحساب!");
      return;
    }

    if (editingUserId === null && !formPassword) {
      setErrorMsg("كلمة المرور إلزامية لإضافة مستخدم جديد!");
      return;
    }

    if (formPassword && formPassword !== formConfirmPassword) {
      setErrorMsg("تأكيد كلمة المرور غير متطابق!");
      return;
    }

    const checkDuplicate = (users || []).find(
      u => u.username.toLowerCase().trim() === formUsername.toLowerCase().trim() && u.id !== editingUserId
    );
    if (checkDuplicate) {
      setErrorMsg("اسم المستخدم هذا مسجل مسبقاً لمستخدم آخر!");
      return;
    }

    // Verify permission authority: user cannot grant permissions beyond their own
    const myPermissions = user.permissions || [];
    const isOwner = user.role === "tenant_owner" || user.role === "مالك";
    if (!isOwner) {
      const unauthorizedGranted = formPermissions.filter(p => !myPermissions.includes(p));
      if (unauthorizedGranted.length > 0) {
        setErrorMsg("أمن النظام المالي والهيكلي يمنعك من منح صلاحيات أعلى من صلاحياتك الحالية!");
        return;
      }
    }

    // Secondary security policy: primary administrator checks
    if (editingUserId === 1 || editingUserId === "1") {
      if (formStatus !== "active") {
        setErrorMsg("لا يمكن إيقاف أو تعطيل صلاحيات حساب مدير النظام الأساسي!");
        return;
      }
    }

    const avatar = formName.trim().charAt(0).toUpperCase();
    const timestamp = new Date().toISOString();

    if (editingUserId !== null) {
      // Edit mode
      const updated = (users || []).map(u => {
        if (u.id === editingUserId) {
          const oldStatus = u.status || "active";
          if (oldStatus !== formStatus) {
            addAuditLog?.("حالة مستخدم", `تم تعديل حالة المستخدم [${formName}] من [${oldStatus === "active" ? "نشط" : oldStatus === "disabled" ? "موقوف" : "بانتظار التفعيل"}] إلى [${formStatus === "active" ? "نشط" : formStatus === "disabled" ? "موقوف" : "بانتظار التفعيل"}]`);
          }
          if (formPassword && u.password !== formPassword) {
            addAuditLog?.("تغيير كلمة مرور", `تم تعديل كلمة المرور للمستخدم [${formName}]`);
          }
          if (JSON.stringify(u.permissions || []) !== JSON.stringify(formPermissions)) {
            addAuditLog?.("تغيير صلاحيات", `تمت إعادة جدولة الصلاحيات التفصيلية للمستعمل [${formName}]`);
          }

          const updatedUser: User = { 
            ...u, 
            fullName: formName,
            name: formName, 
            username: formUsername, 
            email: formEmail,
            phone: formPhone,
            role: formRole, 
            status: formStatus,
            emailVerified: formEmailVerified,
            mustChangePassword: formMustChangePassword,
            allowedStoreIds: formAllowedStoreIds,
            allowedBranchIds: formAllowedBranchIds,
            allowedWarehouseIds: formAllowedWarehouseIds,
            allowedPosIds: formAllowedPosIds,
            permissions: formPermissions,
            avatar, 
            imageUrl: userImageUrl, 
            addressProfile: userAddressProfile,
            company: formCompany,
            
            // compatibility fields
            storeId: formAllowedStoreIds[0] || "",
            branchId: formAllowedBranchIds[0] || "",
            warehouseId: formAllowedWarehouseIds[0] || "",
            posId: formAllowedPosIds[0] || "",
            allowedStores: formAllowedStoreIds,
            allowedBranches: formAllowedBranchIds,
            allowedWarehouses: formAllowedWarehouseIds,
            allowedPosUnits: formAllowedPosIds,
          };

          if (formPassword) {
            updatedUser.password = formPassword;
            updatedUser.passwordHash = formPassword;
          }

          addAuditLog?.("تعديل مستخدم", `تم تعديل وتطبيق خصائص الحساب للمستخدم: [${formName}]`);

          if (u.id === user.id) {
            localStorage.setItem("sahm_web_user", JSON.stringify(updatedUser));
          }
          return updatedUser;
        }
        return u;
      });
      setUsers?.(updated);
      triggerNotification?.("تم تحديث معلومات الموظف بنجاح 💾", "success");
    } else {
      // Create mode
      const newId = (users || []).length > 0 ? String(Math.max(...(users || []).map(u => typeof u.id === 'number' ? u.id : parseInt(String(u.id)) || 0)) + 1) : "6";
      const newUser: User = {
        id: newId,
        fullName: formName,
        name: formName,
        username: formUsername,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        passwordHash: formPassword,
        role: formRole, 
        status: formStatus,
        emailVerified: formEmailVerified,
        mustChangePassword: formMustChangePassword,
        allowedStoreIds: formAllowedStoreIds,
        allowedBranchIds: formAllowedBranchIds,
        allowedWarehouseIds: formAllowedWarehouseIds,
        allowedPosIds: formAllowedPosIds,
        permissions: formPermissions,
        avatar, 
        imageUrl: userImageUrl, 
        addressProfile: userAddressProfile,
        company: formCompany,
        createdAt: timestamp,
        createdBy: user.fullName || user.name || "المدير العام",
        
        // compatibility fields
        storeId: formAllowedStoreIds[0] || "",
        branchId: formAllowedBranchIds[0] || "",
        warehouseId: formAllowedWarehouseIds[0] || "",
        posId: formAllowedPosIds[0] || "",
        allowedStores: formAllowedStoreIds,
        allowedBranches: formAllowedBranchIds,
        allowedWarehouses: formAllowedWarehouseIds,
        allowedPosUnits: formAllowedPosIds,
      };

      setUsers?.([...(users || []), newUser]);
      addAuditLog?.("إنشاء مستخدم", `جرى إدراج مستخدم جديد بالمنظومة [${formName}] برتبة [${ROLE_TRANSLATIONS[formRole] || formRole}]`);
      triggerNotification?.("تم إدراج المستخدم الجديد وتنظيم نطاق الصلاحيات.", "success");
    }

    // Reset Form
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormRole("cashier");
    setFormStatus("active");
    setFormEmailVerified(false);
    setFormMustChangePassword(false);
    setFormAllowedStoreIds(["store_1"]);
    setFormAllowedBranchIds([]);
    setFormAllowedWarehouseIds([]);
    setFormAllowedPosIds([]);
    setFormPermissions([]);
    setUserImageUrl(undefined);
    setUserAddressProfile(undefined);
    setShowAddForm(false);
    setEditingUserId(null);

    // Trigger sweet reload if self edited
    if (editingUserId === user.id) {
      triggerNotification?.("لقد قمت بتعديل حسابك الشخصي؛ سيتم تحديث الصلاحيات وبيئة العمل فوراً! 🔄", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUserId(u.id);
    setFormName(u.fullName || u.name || "");
    setFormUsername(u.username);
    setFormEmail(u.email || "");
    setFormPhone(u.phone || "");
    setFormPassword(u.password || "");
    setFormConfirmPassword(u.password || "");
    setFormRole(u.role || "cashier");
    setFormStatus(u.status || "active");
    setFormEmailVerified(!!u.emailVerified);
    setFormMustChangePassword(!!u.mustChangePassword);
    setFormAllowedStoreIds(u.allowedStoreIds || (u.storeId ? [u.storeId] : ["store_1"]));
    setFormAllowedBranchIds(u.allowedBranchIds || (u.branchId ? [u.branchId] : []));
    setFormAllowedWarehouseIds(u.allowedWarehouseIds || (u.warehouseId ? [u.warehouseId] : []));
    setFormAllowedPosIds(u.allowedPosIds || (u.posId ? [u.posId] : []));
    setFormPermissions(u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role || "cashier"] || []);
    setUserImageUrl(u.imageUrl);
    setUserAddressProfile(u.addressProfile);
    setFormCompany(u.company || "مجموعة مراسيم القابضة");
    setShowAddForm(true);
  };

  const handleDeleteUser = (userId: string | number) => {
    if (userId === user.id) {
      triggerNotification?.("⚠️ عذراً، لا يمكنك حذف حسابك الذي تستخدمه حالياً!", "alert");
      return;
    }
    if (userId === 1 || userId === "1") {
      triggerNotification?.("⚠️ عذراً، لا يمكن حذف حساب المدير الرئيسي المالك العام لتجنب إقفال النظام.", "alert");
      return;
    }
    const matched = (users || []).find(u => u.id === userId);
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف حساب المستخدم [${matched?.fullName || matched?.name || "الموظف"}] وسحب صلاحيته نهائياً؟`);
    if (confirmDelete) {
      const updated = (users || []).filter(u => u.id !== userId);
      setUsers?.(updated);
      addAuditLog?.("حذف مستخدم", `تمت إزالة بيانات وملف حساب الموظف [${matched?.fullName || matched?.name}] من النظام بالكامل.`);
      triggerNotification?.("تم حذف بيانات الموظف بنجاح من قائمة الصلاحيات الشجرية.", "success");
    }
  };

  const handleExportData = async () => {
    try {
      const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase";
      let invoices = null;
      let products = null;
      let customers = null;
      
      if (isSupabase) {
        const db = SahmDatabaseService.getInstance();
        [invoices, products, customers] = await Promise.all([
          db.getInvoices(),
          db.getProducts(),
          db.getCustomers()
        ]);
      } else {
        invoices = localStorage.getItem("sahm_web_invoices") ? JSON.parse(localStorage.getItem("sahm_web_invoices")!) : null;
        products = localStorage.getItem("sahm_web_products") ? JSON.parse(localStorage.getItem("sahm_web_products")!) : null;
        customers = localStorage.getItem("sahm_web_customers") ? JSON.parse(localStorage.getItem("sahm_web_customers")!) : null;
      }

      const backupData = {
        invoices,
        products,
        customers,
        mediaFiles: getMediaCenterFiles(),
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
    reader.onload = async (e) => {
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

        const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase";
        if (isSupabase) {
          const db = SahmDatabaseService.getInstance();
          try {
            if (backup.products && Array.isArray(backup.products)) {
              for (const p of backup.products) await db.saveProduct(p);
            }
            if (backup.customers && Array.isArray(backup.customers)) {
              for (const c of backup.customers) await db.saveCustomer(c);
            }
            if (backup.invoices && Array.isArray(backup.invoices)) {
              for (const inv of backup.invoices) await db.saveInvoice(inv);
            }
          } catch (err: any) {
            alert("فشل استيراد البيانات سحابياً: " + err.message);
            return;
          }
        } else {
          if (backup.invoices) localStorage.setItem("sahm_web_invoices", JSON.stringify(backup.invoices));
          if (backup.products) localStorage.setItem("sahm_web_products", JSON.stringify(backup.products));
          if (backup.customers) localStorage.setItem("sahm_web_customers", JSON.stringify(backup.customers));
        }

        if (backup.mediaFiles) saveMediaCenterFiles(backup.mediaFiles);
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
          { id: "icons", name: "أيقونات النظام 🎨" },
          { id: "subscription", name: "اشتراكات SaaS 💳" },
          { id: "audit", name: "الامتثال والتتبع 📜" },
          { id: "backup", name: "نسخ سحابي واحتياطي 💾" },
          { id: "media", name: "مكتبة الأصول والوسائط 📂" }
        ].filter(sb => isPlatformOwner || sb.id === "general").map((sb) => (
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
          {!isPlatformOwner && (
            <div className="p-5 rounded-2xl border space-y-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-3 mb-2" style={{ borderColor: theme.border }}>
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black" style={{ color: theme.text }}>اشتراك منشأتي</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">الباقة الحالية</span>
                  <strong className="text-xs font-black text-white block">
                    {subscription.tier === "A" ? "باقة تجريبية (Trial)" : subscription.tier === "C" ? "باقة النخبة (Enterprise Elite)" : "باقة سهم Pro الاحترافية ⚡"}
                  </strong>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">استهلاك الفواتير والعمليات</span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                      <span className="text-gray-400">/ {subscription.limit?.toLocaleString() || "10,000"}</span>
                      <span className="text-amber-500">{subscription.currentUsed?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${Math.min(100, ((subscription.currentUsed || 0) / (subscription.limit || 10000)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">حالة وتاريخ التجديد</span>
                  <div className="text-xs font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black inline-block mb-1">نشط</span>
                    <span className="block text-[10px] text-gray-400 font-mono">يتجدد في: {subscription.renewsAt || "2026/07/10"}</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                ℹ️ لترقية اشتراك منشأتك أو زيادة حدود العمليات والمتاجر المتاحة، يرجى التواصل مع إدارة منصة سهم.
              </p>
            </div>
          )}

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

      {/* Users & Permissions Management Section */}
      <div className="p-6 rounded-3xl border text-right space-y-4 shadow-xl text-white" 
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-amber-500/15 text-amber-500 rounded-2xl">
              <UsersIcon className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-sm font-black flex items-center gap-2">
                <span>إدارة المستخدمين والصلاحيات (HR Portal)</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-550 px-2 py-0.5 rounded font-black">محدّث مدمج</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                تم نقل وترقية نظام إدارة الموظفين، مستويات الصلاحيات (RBAC)، والتحقق الميداني والعنوان الوطني الموحد إلى تبويب الموارد البشرية (HR) المستقل.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenHRTab}
            className="py-2.5 px-6 rounded-2xl bg-amber-550 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow border-none self-end sm:self-center shrink-0"
          >
            <span>👥 الانتقال إلى الموارد البشرية HR</span>
          </button>
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

      {/* Supabase PostgreSQL Project Migration System (Strict Read-only Mode) */}
      {isPlatformOwner && (
        <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 mb-2" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5" style={{ color: theme.accent }} />
              <div>
                <h3 className="text-xs font-black" style={{ color: theme.text }}>حالة الربط السحابي (Supabase Connected) ⚡</h3>
                <p className="text-[10px]" style={{ color: theme.muted }}>معلومات الاتصال السحابي الحالية بنظام سهم</p>
              </div>
            </div>
            {isSupabaseConnected ? (
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-1 px-2.5 rounded-lg font-black flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span>نشط ومتصل</span>
              </span>
            ) : (
              <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 py-1 px-2.5 rounded-lg font-black flex items-center gap-1.5">
                <span>غير متصل بالخادم السحابي</span>
              </span>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-gray-400">
            تتم مزامنة البيانات وتأمينها تلقائياً على خوادم Supabase النشطة. يتم التحكم في إعدادات الاتصال وقيم المفاتيح حصرياً عن طريق ملف الإعدادات البيئية .env.
          </p>
        </div>
      )}

      {/* Backup and restore panel */}
      {isPlatformOwner && (
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
      )}

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

      {settingsTab === "theme" && isPlatformOwner && (
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

      {settingsTab === "subscription" && isPlatformOwner && (
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

      {settingsTab === "audit" && isPlatformOwner && (
        <AuditLogTimeline
          theme={theme}
          logs={auditLogs}
          onAddLog={(action, d) => addAuditLog?.(action, d)}
          currentUser={user}
        />
      )}

      {settingsTab === "backup" && isPlatformOwner && (
        <BackupRestoreSystem
          theme={theme}
          onRestore={async (data) => {
            const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase";
            if (isSupabase) {
              const db = SahmDatabaseService.getInstance();
              try {
                if (data.products && Array.isArray(data.products)) {
                  for (const p of data.products) {
                    await db.saveProduct(p);
                  }
                }
                if (data.customers && Array.isArray(data.customers)) {
                  for (const c of data.customers) {
                    await db.saveCustomer(c);
                  }
                }
                if (data.invoices && Array.isArray(data.invoices)) {
                  for (const inv of data.invoices) {
                    await db.saveInvoice(inv);
                  }
                }
                if (data.suppliers && Array.isArray(data.suppliers)) {
                  for (const s of data.suppliers) {
                    await db.saveSupplier(s);
                  }
                }
                if (data.stores && Array.isArray(data.stores)) {
                  for (const st of data.stores) {
                    await db.saveStore(st);
                  }
                }
                if (data.activeStoreId) {
                  localStorage.setItem("sahm_active_store_id", data.activeStoreId);
                }
              } catch (e: any) {
                triggerNotification?.("فشل استيراد البيانات إلى السحاب: " + e.message, "error");
                return;
              }
            } else {
              if (data.products) localStorage.setItem("sahm_web_products", JSON.stringify(data.products));
              if (data.customers) localStorage.setItem("sahm_web_customers", JSON.stringify(data.customers));
              if (data.invoices) localStorage.setItem("sahm_web_invoices", JSON.stringify(data.invoices));
              if (data.suppliers) localStorage.setItem("sahm_web_suppliers", JSON.stringify(data.suppliers));
              if (data.stores) localStorage.setItem("sahm_web_stores", JSON.stringify(data.stores));
              if (data.activeStoreId) localStorage.setItem("sahm_active_store_id", data.activeStoreId);
            }
            
            triggerNotification?.("تم تأكيد ودمج ملف الاستيراد وقنوات المتاجر المتعددة في قواعد سهم! 📥", "success");
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          }}
          onAddLog={(action, d) => addAuditLog?.(action, d)}
          triggerNotification={(t, m, type) => triggerNotification?.(`[${t}] ${m}`, type)}
        />
      )}

      {settingsTab === "media" && isPlatformOwner && (
        <MediaCenter 
          theme={theme} 
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
          currentUser={user}
        />
      )}

      {settingsTab === "icons" && isPlatformOwner && (
        <div className="p-5 rounded-2xl border space-y-6 animate-fade-in" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">🎨</span>
              <div>
                <h3 className="text-sm font-black text-white">إعدادات وتخصيص أيقونات النظام الموحدة</h3>
                <p className="text-[10px] text-gray-400">خصص مظهر وأيقونات القوائم الجانبية، الأزرار، الكروت، الفروع والخدمات</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/[0.02] border border-amber-500/15 text-xs text-right text-gray-300 font-sans leading-relaxed">
            💡 <strong>حرية التخصيص الكاملة:</strong> يوفر هذا التبويب للمدراء التنفيذيين إمكانية إعادة تصميم وتعديل أيقونات الأفرع والأقسام ومحاور المنصة. يمكنك الاختيار من مكتبة مدمجة حيوية، أو رفع أيقونة مخصصة (رابط صورة PNG/SVG مباشر أو كود SVG خام).
          </div>

          <IconSettingsPanel 
            theme={theme} 
            triggerNotification={triggerNotification} 
            addAuditLog={addAuditLog} 
          />
        </div>
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

function IconSettingsPanel({ theme, triggerNotification, addAuditLog }: { theme: any, triggerNotification: any, addAuditLog: any }) {
  const [activeEditingModule, setActiveEditingModule] = useState<string | null>(null);
  const [customInputValue, setCustomInputValue] = useState("");
  const [selectedLibraryIcon, setSelectedLibraryIcon] = useState("");

  const [iconMap, setIconMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialConfig: Record<string, string> = {};
    const modules = [
      "sahm_brand_logo", "command_center", "intelligent_hub", "setup_organizations", 
      "products", "pos_and_operations", "integrations", "financial_hub", 
      "reports", "help", "hr", "settings", "branches", "warehouses", "pos", "stores"
    ];
    modules.forEach(m => {
      initialConfig[m] = getActiveIconValue(m);
    });
    setIconMap(initialConfig);

    const handleUpdate = () => {
      const refreshed: Record<string, string> = {};
      modules.forEach(m => {
        refreshed[m] = getActiveIconValue(m);
      });
      setIconMap(refreshed);
    };

    window.addEventListener("sahm_icons_updated", handleUpdate);
    return () => window.removeEventListener("sahm_icons_updated", handleUpdate);
  }, []);

  const systemModules = [
    { id: "sahm_brand_logo", name: "شعار سهم الموحد (SAHM OS Logo) 🏷️🏆", desc: "الشعار والرمز الميداني المميز لقصة النجاح في كابينة القيادة التنفيذية للمجموعة" },
    { id: "command_center", name: "مركز القيادة والتحليلات ⚡", desc: "أيقونة مركز القيادة الرئيسي للوحة التحكم" },
    { id: "intelligent_hub", name: "المنصة الذكية 🧠🔌", desc: "أقسام الذكاء الاصطناعي وصناعة المحتوى الذكي" },
    { id: "setup_organizations", name: "التأسيس والمنشآت 🏢⭐", desc: "أيقونة مرشد التأسيس، المنشآت والمستودعات الموحدة" },
    { id: "products", name: "المنتجات والمخزون 📦", desc: "إدارة المنتجات، الأصناف، كروت تفاصيل المخزن" },
    { id: "pos_and_operations", name: "العمليات ونقاط البيع 🛍️🏢", desc: "واجهة الكاشير POS الفورية ومربعات السلة" },
    { id: "integrations", name: "مركز التكاملات والمنافذ 🔌", desc: "ربط قنوات سلة، زد ومنافذ الدفع الآلي" },
    { id: "financial_hub", name: "المنظومة المالية والشركاء ⚖️", desc: "الفواتير الإلكترونية، العملاء والموردين" },
    { id: "hr", name: "الموارد البشرية والموظفين 👥", desc: "شؤون طاقم العمل، الصلاحيات والتحكم" },
    { id: "reports", name: "التقارير والإحصائيات 📊", desc: "التقارير البيانية والرسومات التحليلية للأرباح" },
    { id: "help", name: "مركز التواصل والدعم 💬", desc: "تذاكر الدعم والاتصال السحابي المباشر بمراسيم" },
    { id: "settings", name: "إعدادات النظام والمظهر ⚙️", desc: "تخصيص ثيمات الألوان والتحكم الكامل بالامتدادات" },
    { id: "branches", name: "فروع التشغيل الميدانية 📍", desc: "أزرار وكروت استعراض فروع التشغيل الميداني" },
    { id: "warehouses", name: "المستودعات ومواقع التخزين 📦", desc: "أزرار ومؤشرات المستودعات اللوجستية والتموين" },
    { id: "pos", name: "أجهزة الكاشير والعمليات 🖥️", desc: "أيقونة وحدات وأجهزة نقاط البيع النشطة" },
    { id: "stores", name: "المتاجر والعلامات التجارية 🏬", desc: "أيقونة العلامة التجارية النشطة والماركات" }
  ];

  const handleStartEdit = (moduleId: string) => {
    setActiveEditingModule(moduleId);
    const currentValue = getActiveIconValue(moduleId);
    
    const isLibrary = AVAILABLE_LIBRARY_ICONS.some(icon => icon.name === currentValue || icon.kebab === currentValue);
    if (isLibrary) {
      setSelectedLibraryIcon(currentValue);
      setCustomInputValue("");
    } else {
      setSelectedLibraryIcon("");
      setCustomInputValue(currentValue);
    }
  };

  const handleSaveIcon = (moduleId: string) => {
    let finalValue = "";
    if (customInputValue.trim()) {
      finalValue = customInputValue.trim();
    } else if (selectedLibraryIcon) {
      finalValue = selectedLibraryIcon;
    } else {
      triggerNotification("⚠️ الرجاء اختيار أيقونة أو إدخال كود SVG/رابط مخصص أولاً.", "warning");
      return;
    }

    saveCustomIcon(moduleId, finalValue);
    setActiveEditingModule(null);
    triggerNotification("✓ تم حفظ الأيقونة الجديدة للقسم وتحديث كافة واجهات المنصة فوراً! 🎨", "success");
    addAuditLog("تعديل أيقونة النظام", `تم تعديل أيقونة تبويب [${moduleId}] إلى الأيقونة المخصصة.`);
  };

  const handleResetToDefault = (moduleId: string) => {
    resetCustomIcon(moduleId);
    setActiveEditingModule(null);
    triggerNotification("✓ تم استعادة الأيقونة الافتراضية للقسم بنجاح! 🔄", "info");
    addAuditLog("استعادة أيقونة النظام الافتراضية", `تم استرجاع الأيقونة الرسمية لتبويب [${moduleId}].`);
  };

  return (
    <div className="space-y-4 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemModules.map(mod => {
          const isEditing = activeEditingModule === mod.id;
          return (
            <div 
              key={mod.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-right transition-all transform duration-200 ${
                isEditing 
                ? "border-amber-500 bg-amber-500/[0.01] shadow-[0_0_15px_rgba(212,175,55,0.1)] scale-[1.01]" 
                : "border-slate-800 bg-slate-950/20 hover:bg-slate-950/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-[11.5px] font-black text-white block">{mod.name}</span>
                  <p className="text-[9.5px] text-gray-400 font-sans leading-relaxed">{mod.desc}</p>
                </div>
                
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center border text-amber-400 bg-slate-900 shadow-inner shrink-0"
                  style={{ borderColor: isEditing ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.05)" }}
                >
                  <CustomIconRenderer 
                    moduleId={mod.id} 
                    className="w-5 h-5 shrink-0 transition-transform duration-300 transform scale-110" 
                  />
                </div>
              </div>

              {!isEditing ? (
                <div className="flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5 mt-1">
                  {localStorage.getItem("sahm_custom_icons_config") && JSON.parse(localStorage.getItem("sahm_custom_icons_config") || "{}")[mod.id] && (
                    <span className="text-[9px] text-[#D4AF37] font-extrabold font-sans bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 ml-auto">
                      ● مخصصة
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(mod.id)}
                    className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white border border-slate-800 hover:border-amber-500/35 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                  >
                    تغيير الأيقونة 🎨
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2.5 mt-1 border-t border-amber-500/15 animate-fade-in">
                  
                  <div className="space-y-1">
                    <label className="text-[9px] text-amber-500 font-black tracking-wide block">1. اختر أيقونة جاهزة من المكتبة المدمجة:</label>
                    <select
                      value={selectedLibraryIcon}
                      onChange={(e) => {
                        setSelectedLibraryIcon(e.target.value);
                        setCustomInputValue("");
                      }}
                      className="w-full bg-[#05060c] text-neutral-200 border border-zinc-800 rounded-lg p-1.5 px-2 text-[10.5px] font-bold focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">-- أو ادخل تخصيصاً حراً بالأسفل --</option>
                      {AVAILABLE_LIBRARY_ICONS.map(i => (
                        <option key={i.name} value={i.name}>
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-zinc-500 font-bold leading-none select-none">(اختياري)</span>
                      <label className="text-[9px] text-amber-500 font-black tracking-wide block">2. أو ارفع كود SVG خام / رابط صورة (PNG/SVG):</label>
                    </div>
                    <textarea
                      value={customInputValue}
                      onChange={(e) => {
                        setCustomInputValue(e.target.value);
                        setSelectedLibraryIcon("");
                      }}
                      placeholder={`أدخل رابط ويب للصورة مسبوقاً بـ http:// أو كود خام يبدأ بـ <svg...`}
                      rows={2}
                      className="w-full bg-slate-950/80 text-neutral-200 border border-zinc-900 rounded-lg p-1.5 focus:outline-none focus:border-amber-500/50 text-[10.5px] font-mono leading-tight tracking-wider"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2.5 pt-1.5 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(mod.id)}
                      className="py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 border border-red-500/20 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                    >
                      استعادة الافتراضي ↺
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveEditingModule(null)}
                        className="py-1 px-3 bg-slate-900 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveIcon(mod.id)}
                        className="py-1 px-3.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95"
                      >
                        تطبيق وحفظ الحزمة ✓
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
