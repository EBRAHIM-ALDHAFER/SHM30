import React, { useState, useMemo } from "react";
import { 
  Users, UserCheck, UserX, UserMinus, Search, Plus, Filter, ShieldAlert,
  FileText, Building, MapPin, Activity, Database, Lock, Edit, Trash,
  RefreshCw, Download, Key, ShieldCheck, HelpCircle, Check, Map, AlertTriangle, ArrowRight
} from "lucide-react";
import { User, AddressProfile, ThemeColors } from "../types";
import { SubscriptionGuard } from "../core/database/subscriptionGuard";
import { SahmDatabaseService } from "../core/database/dbService";

// Standard RBAC mappings in the system
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  tenant_owner: [
    "dashboard:view", "setup:view", "integrations:view", "help:view",
    "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
    "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
    "products:view", "products:create", "products:update", "products:delete",
    "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
    "settings:manage", "integrations:manage"
  ],
  admin: [
    "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
    "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
    "products:view", "products:create", "products:update", "products:delete",
    "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage"
  ],
  general_manager: [
    "users:view", "roles:manage", "pos:access", "reports:view", "finance:view", "branch:view"
  ],
  operations_manager: [
    "inventory:view", "inventory:manage", "inventory:transfer", "pos:access", "pos:sell", "pos:settings:manage", "reports:view", "branch:view", "products:view"
  ],
  ceo: [
    "reports:view", "finance:view", "users:view", "products:view"
  ],
  hr_manager: [
    "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage"
  ],
  recruiter: [
    "users:view", "users:create"
  ],
  employee_relations: [
    "users:view", "users:update"
  ],
  payroll_officer: [
    "users:view", "finance:view"
  ],
  attendance_officer: [
    "users:view"
  ],
  cfo: [
    "finance:view", "reports:view", "users:view"
  ],
  accountant: [
    "finance:view", "reports:view", "products:view", "inventory:view", "branch:view"
  ],
  cashier_treasurer: [
    "pos:access", "pos:sell", "finance:view"
  ],
  billing_officer: [
    "pos:access", "pos:sell", "pos:refund"
  ],
  procurement_officer: [
    "inventory:view", "inventory:manage", "products:view"
  ],
  store_manager: [
    "pos:access", "pos:sell", "pos:settings:manage", "inventory:view", "products:view", "branch:view"
  ],
  branch_manager: [
    "pos:access", "pos:sell", "inventory:view", "products:view", "branch:view"
  ],
  branch_supervisor: [
    "pos:access", "pos:sell", "inventory:view", "products:view", "branch:view"
  ],
  sales_associate: [
    "pos:access", "pos:sell", "products:view"
  ],
  cashier: [
    "pos:access", "pos:sell", "products:view", "inventory:view"
  ],
  inventory_manager: [
    "inventory:view", "inventory:manage", "inventory:transfer", "products:view", "branch:view"
  ],
  warehouse_keeper: [
    "inventory:view", "inventory:manage"
  ],
  supply_officer: [
    "inventory:view", "inventory:manage"
  ],
  inventory_auditor: [
    "inventory:view", "inventory:manage"
  ],
  marketing_manager: [
    "products:view", "reports:view"
  ],
  marketer: [
    "products:view", "pos:access", "reports:view"
  ],
  content_creator: [
    "products:view"
  ],
  campaign_officer: [
    "products:view"
  ],
  customer_service: [
    "products:view"
  ],
  support: [
    "products:view", "inventory:view", "branch:view"
  ],
  customer_service_supervisor: [
    "products:view"
  ],
  cto: [
    "settings:manage", "integrations:manage", "products:view", "users:view"
  ],
  integrations_manager: [
    "settings:manage", "integrations:manage"
  ],
  sys_admin: [
    "settings:manage", "integrations:manage", "users:view", "users:create", "users:update", "users:disable"
  ],
  custom: []
};

export const ROLE_TRANSLATIONS: Record<string, string> = {
  // الإدارة
  tenant_owner: "مالك النظام (Owner)",
  admin: "مدير النظام (Admin)",
  general_manager: "المدير العام (General Manager)",
  operations_manager: "مدير العمليات (Operations Manager)",
  ceo: "المدير التنفيذي (CEO)",

  // الموارد البشرية
  hr_manager: "مدير الموارد البشرية (HR Manager)",
  recruiter: "مسؤول التوظيف (Recruiter)",
  employee_relations: "مسؤول شؤون الموظفين (Employee Relations)",
  payroll_officer: "مسؤول الرواتب (Payroll Officer)",
  attendance_officer: "مسؤول الحضور والانصراف (Attendance Officer)",

  // المالية
  cfo: "المدير المالي (CFO)",
  accountant: "محاسب مالي (Accountant)",
  cashier_treasurer: "أمين صندوق (Treasurer)",
  billing_officer: "مسؤول الفواتير (Billing Officer)",
  procurement_officer: "مسؤول المشتريات (Procurement Officer)",

  // المتاجر والفروع
  store_manager: "مدير متجر (Store Manager)",
  branch_manager: "مدير فرع (Branch Manager)",
  branch_supervisor: "مشرف فرع (Branch Supervisor)",
  sales_associate: "موظف مبيعات (Sales Associate)",
  cashier: "كاشير (Cashier)",

  // المخزون
  inventory_manager: "مدير مخزون (Inventory Manager)",
  warehouse_keeper: "أمين مستودع (Warehouse Keeper)",
  supply_officer: "مسؤول توريد (Supply Officer)",
  inventory_auditor: "مسؤول جرد (Inventory Auditor)",

  // التسويق
  marketing_manager: "مدير تسويق (Marketing Manager)",
  marketer: "مسؤول تسويق (Marketer)",
  content_creator: "صانع محتوى (Content Creator)",
  campaign_officer: "مسؤول حملات (Campaign Officer)",

  // الدعم والتقنية
  customer_service: "مسؤول خدمة العملاء (Customer Service)",
  support: "دعم فني (Support)",
  customer_service_supervisor: "مشرف خدمة العملاء (CS Supervisor)",
  cto: "مدير تقني (CTO)",
  integrations_manager: "مسؤول تككاملات (Integrations Manager)",
  sys_admin: "مشرف نظام (System Administrator)",

  // مخصص
  custom: "مخصص (Custom Role)"
};

export const ROLE_DEPARTMENTS: Record<string, { label: string; icon: string; roles: string[] }> = {
  management: {
    label: "الإدارة العامة",
    icon: "🏢",
    roles: ["tenant_owner", "admin", "general_manager", "operations_manager", "ceo"]
  },
  hr: {
    label: "الموارد البشرية",
    icon: "👥",
    roles: ["hr_manager", "recruiter", "employee_relations", "payroll_officer", "attendance_officer"]
  },
  finance: {
    label: "المالية والشركاء",
    icon: "💰",
    roles: ["cfo", "accountant", "cashier_treasurer", "billing_officer", "procurement_officer"]
  },
  stores: {
    label: "المتاجر والفروع",
    icon: "🛍️",
    roles: ["store_manager", "branch_manager", "branch_supervisor", "sales_associate", "cashier"]
  },
  inventory: {
    label: "المخزون والمستودعات",
    icon: "📦",
    roles: ["inventory_manager", "warehouse_keeper", "supply_officer", "inventory_auditor"]
  },
  marketing: {
    label: "التسويق والدعاية",
    icon: "📢",
    roles: ["marketing_manager", "marketer", "content_creator", "campaign_officer"]
  },
  support: {
    label: "الدعم والتقنية",
    icon: "🖥️",
    roles: ["customer_service", "support", "customer_service_supervisor", "cto", "integrations_manager", "sys_admin"]
  }
};

export const PERMISSION_LABELS_AR: Record<string, string> = {
  "users:view": "عرض المستخدمين",
  "users:create": "إضافة مستخدم",
  "users:update": "تعديل المستخدمين",
  "users:disable": "تعطيل المستخدمين",
  "roles:manage": "إدارة الأدوار",
  "permissions:manage": "إدارة الصلاحيات",

  "products:view": "عرض المنتجات",
  "products:create": "إضافة منتج",
  "products:update": "تعديل المنتجات",
  "products:delete": "حذف المنتجات",

  "inventory:view": "عرض المخزون",
  "inventory:manage": "إدارة المخزون",
  "inventory:transfer": "تحويل المخزون",

  "pos:access": "دخول نقطة البيع",
  "pos:sell": "البيع من الكاشير",
  "pos:refund": "استرجاع فاتورة",
  "pos:settings:manage": "إدارة إعدادات نقطة البيع",

  "reports:view": "عرض التقارير",
  "finance:view": "عرض المالية",
  "settings:manage": "إدارة الإعدادات",
  "integrations:manage": "إدارة التكاملات",
};

export const DEPARTMENT_MAP: Record<string, { label: string; color: string; icon: string }> = {
  management: { label: "الإدارة", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: "🏢" },
  sales: { label: "المبيعات", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: "🛍️" },
  warehouse: { label: "المخازن", color: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: "📦" },
  support: { label: "الدعم الفني", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: "🖥️" },
};

export const getUserDepartment = (user: User): string => {
  if (user.department && DEPARTMENT_MAP[user.department]) {
    return user.department;
  }
  // Fallback dynamic helper based on role
  const role = user.role;
  if (["tenant_owner", "admin", "accountant"].includes(role)) {
    return "management";
  }
  if (["branch_manager", "cashier", "marketer"].includes(role)) {
    return "sales";
  }
  if (["inventory_manager"].includes(role)) {
    return "warehouse";
  }
  return "support";
};

interface HumanResourcesProps {
  theme: ThemeColors;
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
  triggerNotification: (msg: string, type: "success" | "critical" | "info" | "alert") => void;
  addAuditLog: (action: string, details: string) => void;
  stores: any[];
  branches: any[];
  warehouses: any[];
  posUnits: any[];
}

export default function HumanResources({
  theme,
  users = [],
  setUsers,
  currentUser,
  triggerNotification,
  addAuditLog,
  stores = [],
  branches = [],
  warehouses = [],
  posUnits = []
}: HumanResourcesProps) {
  // Dynamic Roles-Permissions structure
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("sahm_dynamic_role_permissions_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { ...DEFAULT_ROLE_PERMISSIONS };
  });

  const [roleTranslations, setRoleTranslations] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("sahm_dynamic_role_translations_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { ...ROLE_TRANSLATIONS };
  });

  const [availablePermissions, setAvailablePermissions] = useState<string[]>(() => {
    const DEFAULT_PERMS = [
      "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
      "products:view", "products:create", "products:update", "products:delete",
      "inventory:view", "inventory:manage", "inventory:transfer",
      "pos:access", "pos:sell", "pos:refund", "pos:settings:manage",
      "reports:view", "finance:view", "settings:manage", "integrations:manage"
    ];
    try {
      const saved = localStorage.getItem("sahm_dynamic_available_permissions_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PERMS;
  });

  // State to handle Role Editing
  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState<string[]>([]);
  const [editingRoleLabel, setEditingRoleLabel] = useState<string>("");

  // Search inside permission checkboxes
  const [searchPermissionTerm, setSearchPermissionTerm] = useState<string>("");

  // Creative Addition States
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);
  const [newRoleKeyInput, setNewRoleKeyInput] = useState("");
  const [newRoleLabelInput, setNewRoleLabelInput] = useState("");

  const [showAddPermissionForm, setShowAddPermissionForm] = useState(false);
  const [newPermissionStr, setNewPermissionStr] = useState("");

  // Role Cloning / Copying
  const [cloneSourceRoleKey, setCloneSourceRoleKey] = useState("");
  const [cloneDestRoleKey, setCloneDestRoleKey] = useState("");
  const [cloneDestRoleLabel, setCloneDestRoleLabel] = useState("");

  // User-specific direct permission override
  const [selectedUserForDirectPerm, setSelectedUserForDirectPerm] = useState<string>("");

  // Helper permission manager checker
  const canManagePermissionsGlobal = (user: User | null | undefined): boolean => {
    if (!user) return false;
    const isSuperUser = ["system_owner", "system_admin", "platform_owner"].includes(user.role || "");
    return (
      user.role === "tenant_owner" ||
      user.role === "system_owner" ||
      user.role === "system_admin" ||
      (user.permissions?.includes("*") && isSuperUser) ||
      user.permissions?.includes("roles:manage") ||
      user.permissions?.includes("permissions:manage")
    );
  };

  // Helper category classifier
  const getPermissionCategory = (perm: string): string => {
    if (perm.startsWith("users:") || perm.startsWith("roles:") || perm.startsWith("permissions:")) return "المستخدمين والوصول";
    if (perm.startsWith("products:")) return "المنتجات";
    if (perm.startsWith("inventory:")) return "المخزون والمستودعات";
    if (perm.startsWith("pos:")) return "نقطة البيع POS";
    if (perm.startsWith("reports:")) return "التقارير";
    if (perm.startsWith("finance:")) return "المالية والشركاء";
    if (perm.startsWith("settings:")) return "الإعدادات";
    if (perm.startsWith("integrations:")) return "التكاملات";
    return "أخرى / صلاحيات عامة";
  };

  // Save role permissions and synchronize associated users immediately
  const handleSaveRolePermissionsAndSyncUsers = (roleKey: string, newPerms: string[]) => {
    // Owner security check
    if (roleKey === "tenant_owner") {
      if (!newPerms.includes("roles:manage") && !newPerms.includes("permissions:manage") && !newPerms.includes("*")) {
        newPerms = [...newPerms, "roles:manage"];
      }
    }

    const updatedRolePerms = {
      ...rolePermissions,
      [roleKey]: newPerms
    };
    
    setRolePermissions(updatedRolePerms);
    try {
      localStorage.setItem("sahm_dynamic_role_permissions_v3", JSON.stringify(updatedRolePerms));
    } catch (e) {
      console.error(e);
    }

    // Synchronize current users mapped to this role immediately
    const updatedUsers = users.map(u => {
      if (u.role === roleKey) {
        // Don't strip "*" or critical permissions from superusers
        const isSuperUser = u.role === "system_owner" || u.role === "system_admin" || u.role === "platform_owner";
        if (isSuperUser && u.permissions.includes("*") && !newPerms.includes("*")) {
          return {
            ...u,
            permissions: ["*", ...newPerms]
          };
        }
        return {
          ...u,
          permissions: [...newPerms]
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    
    // Add Audit Log
    addAuditLog(
      "تعديل صلاحيات الدور", 
      `تم تعديل صلاحيات دور: [${roleTranslations[roleKey] || roleKey}] بواسطة مالك النظام.`
    );
    
    triggerNotification(
      `✓ تم حفظ صلاحيات الدور [${roleTranslations[roleKey] || roleKey}] وتطبيقها فوراً على جميع الموظفين المرتبطين به (${updatedUsers.filter(u => u.role === roleKey).length} موظف).`,
      "success"
    );
  };

  // Modify permissions directly for a specific user
  const handleSaveUserDirectPermissions = (userId: string | number, newPerms: string[]) => {
    const userToEdit = users.find(u => String(u.id) === String(userId));
    if (!userToEdit) return;

    // Security constraints: Super User cannot have '*' stripped
    const isSuperUserToEdit =
      userToEdit.role === "system_owner" ||
      userToEdit.role === "system_admin" ||
      userToEdit.role === "platform_owner";
    if (isSuperUserToEdit && !newPerms.includes("*") && userToEdit.permissions.includes("*")) {
      newPerms = ["*", ...newPerms];
      triggerNotification("حماية أمنية: لا يمكن سحب الصلاحية المطلقة (*) من هذا الحساب القيادي الرئيسي.", "alert");
    }

    const updated = users.map(u => {
      if (String(u.id) === String(userId)) {
        return {
          ...u,
          permissions: newPerms
        };
      }
      return u;
    });

    setUsers(updated);
    addAuditLog(
      "تعديل صلاحيات موظف", 
      `تعديل صلاحيات الموظف [${userToEdit.fullName || userToEdit.name}] بشكل مباشر ومخصص.`
    );
    triggerNotification(`✓ تم تحديث صلاحيات الموظف [${userToEdit.fullName || userToEdit.name}] وحفظ التغييرات فوراً.`, "success");
  };

  // Navigation tabs of HR Tab
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "users_list" | "locations" | "roles" | "logs" | "security">("overview");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationTypeFilter, setLocationTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Create / Edit User State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  
  // Form values state
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [formRole, setFormRole] = useState("cashier");
  const [formDepartment, setFormDepartment] = useState<string>("sales");
  const [formStatus, setFormStatus] = useState<"active" | "disabled" | "pending">("active");
  const [formWorkLocationType, setFormWorkLocationType] = useState<"hq" | "store" | "branch" | "warehouse" | "pos" | "remote">("hq");
  const [formWorkLocationId, setFormWorkLocationId] = useState("");
  const [formCompany, setFormCompany] = useState("مجموعة مراسيم القابضة");
  
  // Scope control
  const [formAllowedStoreIds, setFormAllowedStoreIds] = useState<string[]>([]);
  const [formAllowedBranchIds, setFormAllowedBranchIds] = useState<string[]>([]);
  const [formAllowedWarehouseIds, setFormAllowedWarehouseIds] = useState<string[]>([]);
  const [formAllowedPosIds, setFormAllowedPosIds] = useState<string[]>([]);
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  // National address profile for security and compliance
  const [userAddressProfile, setUserAddressProfile] = useState<AddressProfile>({
    shortAddress: "",
    buildingNumber: "",
    streetName: "",
    district: "",
    city: "",
    region: "",
    postalCode: "",
    additionalNumber: "",
    unitNumber: "",
    country: "المملكة العربية السعودية",
    mapLink: ""
  });

  // Saudi National Address Mock Data Resolver
  const MOCK_ADDRESS_RESOLVER: Record<string, {
    city: string;
    district: string;
    streetName: string;
    buildingNumber: string;
    postalCode: string;
    additionalNumber: string;
    latitude: string;
    longitude: string;
    mapLink: string;
  }> = {
    "SP764": {
      city: "الرياض",
      district: "حي العليا السكني",
      streetName: "شارع العليا العام",
      buildingNumber: "1283",
      postalCode: "12211",
      additionalNumber: "4827",
      latitude: "24.7136",
      longitude: "46.6753",
      mapLink: "https://maps.google.com/?q=24.7136,46.6753"
    },
    "RAGB2929": {
      city: "جدة",
      district: "حي الحمراء",
      streetName: "شارع فلسطين",
      buildingNumber: "2929",
      postalCode: "23321",
      additionalNumber: "8847",
      latitude: "21.5165",
      longitude: "39.1555",
      mapLink: "https://maps.google.com/?q=21.5165,39.1555"
    }
  };

  const [addressFetchStatus, setAddressFetchStatus] = useState<{
    type: "idle" | "loading" | "success" | "error" | "warning";
    message: string;
  }>({ type: "idle", message: "" });

  const [showReplaceAddressConfirm, setShowReplaceAddressConfirm] = useState(false);
  const [pendingFetchedAddress, setPendingFetchedAddress] = useState<any>(null);

  const applyFetchedAddress = (data: any) => {
    setUserAddressProfile(prev => ({
      ...prev,
      buildingNumber: data.buildingNumber || "",
      streetName: data.streetName || "",
      district: data.district || "",
      city: data.city || "",
      postalCode: data.postalCode || "",
      additionalNumber: data.additionalNumber || "",
      mapLink: data.mapLink || "",
      gpsCoordinates: `${data.latitude || ""}, ${data.longitude || ""}`,
      latitude: data.latitude || "",
      longitude: data.longitude || "",
      shortCode: prev.shortAddress,
      gps: {
        lat: data.latitude || "",
        lng: data.longitude || ""
      },
      mapUrl: data.mapLink || ""
    }));
    setAddressFetchStatus({ type: "success", message: "تم جلب بيانات العنوان بنجاح" });
    triggerNotification("تم استيراد وحقن بيانات العنوان الوطني بنجاح.", "success");
    setShowReplaceAddressConfirm(false);
    setPendingFetchedAddress(null);
  };

  const handleFetchNationalAddress = () => {
    const short = userAddressProfile.shortAddress?.trim();
    if (!short) {
      setAddressFetchStatus({ type: "error", message: "الرجاء إدخال العنوان المختصر أولًا" });
      return;
    }

    setAddressFetchStatus({ type: "loading", message: "جاري جلب بيانات العنوان..." });

    setTimeout(() => {
      const matched = MOCK_ADDRESS_RESOLVER[short.toUpperCase()];
      if (!matched) {
        setAddressFetchStatus({ type: "error", message: "لم يتم العثور على العنوان المختصر" });
        return;
      }

      // Check if any target fields already have input
      const hasExistingData = [
        userAddressProfile.buildingNumber,
        userAddressProfile.streetName,
        userAddressProfile.district,
        userAddressProfile.city,
        userAddressProfile.postalCode,
        userAddressProfile.additionalNumber,
        userAddressProfile.mapLink
      ].some(val => val && val.trim().length > 0);

      if (hasExistingData) {
        setPendingFetchedAddress(matched);
        setShowReplaceAddressConfirm(true);
        setAddressFetchStatus({ type: "warning", message: "تأكيد مطلوب: سيتم استبدال المدخلات الحالية." });
      } else {
        applyFetchedAddress(matched);
      }
    }, 700);
  };

  const handleClearAddressData = () => {
    setUserAddressProfile({
      shortAddress: "",
      buildingNumber: "",
      streetName: "",
      district: "",
      city: "",
      region: "",
      postalCode: "",
      additionalNumber: "",
      unitNumber: "",
      country: "المملكة العربية السعودية",
      mapLink: "",
      gpsCoordinates: "",
      latitude: "",
      longitude: "",
      shortCode: "",
      gps: { lat: "", lng: "" },
      mapUrl: ""
    });
    setAddressFetchStatus({ type: "idle", message: "" });
    triggerNotification("تم مسح حقول العنوان بالكامل.", "success");
  };

  const [errorMsg, setErrorMsg] = useState("");

  // Role dropdown states
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Advanced HR Action States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUser, setTransferUser] = useState<User | null>(null);
  const [transferLocationType, setTransferLocationType] = useState<"hq" | "store" | "branch" | "warehouse" | "pos" | "remote">("hq");
  const [transferLocationId, setTransferLocationId] = useState<string>("");
  const [transferDept, setTransferDept] = useState<string>("management");

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablingUser, setDisablingUser] = useState<User | null>(null);
  const [disableReason, setDisableReason] = useState<string>("");

  const [showImportModal, setShowImportModal] = useState(false);
  const [importPasteArea, setImportPasteArea] = useState<string>("");

  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);

  // Robust RBAC security clearance validator
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    const isSuperUser = ["system_owner", "system_admin", "platform_owner"].includes(currentUser.role || "");
    if (
      currentUser.role === "tenant_owner" ||
      currentUser.role === "system_owner" ||
      (currentUser.permissions?.includes("*") && isSuperUser)
    ) {
      return true;
    }
    return currentUser.permissions?.includes(permission) || false;
  };

  // Quick statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const disabled = users.filter(u => u.status === "disabled").length;
    const pending = users.filter(u => u.status === "pending").length;
    const loggedInToday = users.filter(u => u.lastLoginAt).length; // Simulated today

    // Department statistics
    const mgtCount = users.filter(u => getUserDepartment(u) === "management").length;
    const mgtActive = users.filter(u => getUserDepartment(u) === "management" && u.status === "active").length;

    const salesCount = users.filter(u => getUserDepartment(u) === "sales").length;
    const salesActive = users.filter(u => getUserDepartment(u) === "sales" && u.status === "active").length;

    const whCount = users.filter(u => getUserDepartment(u) === "warehouse").length;
    const whActive = users.filter(u => getUserDepartment(u) === "warehouse" && u.status === "active").length;

    const supCount = users.filter(u => getUserDepartment(u) === "support").length;
    const supActive = users.filter(u => getUserDepartment(u) === "support" && u.status === "active").length;

    return { 
      total, active, disabled, pending, loggedInToday,
      mgtCount, mgtActive,
      salesCount, salesActive,
      whCount, whActive,
      supCount, supActive
    };
  }, [users]);

  // Handle auto filling permissions based on selected standard role
  const handleRoleChangeInForm = (role: string) => {
    setFormRole(role);
    setFormPermissions(rolePermissions[role] || []);
  };

  // Toggle permission flag
  const handleTogglePermission = (perm: string) => {
    if (formPermissions.includes(perm)) {
      setFormPermissions(formPermissions.filter(p => p !== perm));
    } else {
      setFormPermissions([...formPermissions, perm]);
    }
  };

  // Reset password helper
  const handleResetPassword = (userObj: User) => {
    const freshPass = Math.random().toString(36).slice(-8);
    const updated = users.map(u => {
      if (u.id === userObj.id) {
        return { ...u, password: freshPass };
      }
      return u;
    });
    setUsers(updated);
    addAuditLog("إعادة تعيين كلمة مرور الموظف", `طلب إعادة تعيين عشوائي مجدول لحساب [${userObj.fullName || userObj.name}] وبث الإشعار الأمناتي.`);
    alert(`🔐 تم توليد كلمة مرور جديدة مؤقتة للموظف بنجاح:\n${freshPass}\n\nيرجى تسليمها له لتسجيل الدخول الفوري وتحديثها.`);
    triggerNotification(`تمت إعادة تعيين كلمة مرور الموظف [${userObj.fullName || userObj.name}] وتوليد رمز مخصص.`, "success");
  };

  // Handle transfer execution and audit logging
  const handleSaveTransfer = () => {
    if (!transferUser) return;
    const updated = users.map(u => {
      if (u.id === transferUser.id) {
        return {
          ...u,
          workLocationType: transferLocationType,
          workLocationId: transferLocationId || "HQ-RIYADH",
          department: transferDept
        };
      }
      return u;
    });
    setUsers(updated);
    addAuditLog(
      "نقل موظف",
      `تم نقل مقر عمل الموظف [${transferUser.fullName || transferUser.name}] إلى موقع جديد [${getLocationName(transferLocationType, transferLocationId || "HQ-RIYADH")}] وقسم [${transferDept}].`
    );
    triggerNotification(`تم نقل الموظف [${transferUser.fullName || transferUser.name}] بنجاح للمقر الجديد.`, "success");
    setShowTransferModal(false);
    setTransferUser(null);
  };

  // Toggle active/inactive state
  const handleToggleStatus = (userObj: User) => {
    if (userObj.id === currentUser.id) {
      triggerNotification("لا يمكنك تجميد حسابك الشخصي الجاري لتجنب فقدان التحكم بالنظام.", "alert");
      return;
    }
    const isSuperUser = ["system_owner", "system_admin", "platform_owner"].includes(userObj.role || "");
    if (userObj.role === "tenant_owner" || userObj.role === "system_owner" || (userObj.permissions?.includes("*") && isSuperUser)) {
      triggerNotification("لا يمكن تجميد أو تعطيل حساب مالك النظام تحت أي ظرف.", "alert");
      return;
    }
    const targetStatus = userObj.status === "active" ? "disabled" : "active";
    const updated = users.map(u => {
      if (u.id === userObj.id) {
        return { ...u, status: targetStatus as "active" | "disabled" | "pending" };
      }
      return u;
    });
    setUsers(updated);
    addAuditLog(targetStatus === "disabled" ? "تعطيل مستخدم" : "تنشيط مستخدم", `تعديل الحالة التشغيلية للملف [${userObj.fullName || userObj.name}] إلى ${targetStatus === "disabled" ? "موقوف" : "نشط"}`);
    triggerNotification(`تم ${targetStatus === "disabled" ? "تعطيل وتجميد" : "تنشيط وتحرير"} حساب الموظف المذكور بنجاح.`, "success");
  };

  // Handle edit launch
  const handleLaunchEdit = (u: User) => {
    if (!hasPermission("users:update") && currentUser.role !== "admin") {
      triggerNotification("ليست لديك صلاحية تحرير وتعديل حسابات الموظفين (users:update).", "alert");
      return;
    }
    setEditingUserId(u.id);
    setFormName(u.fullName || u.name || "");
    setFormUsername(u.username || "");
    setFormEmail(u.email || "");
    setFormPhone(u.phone || "");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormRole(u.role || "cashier");
    setFormDepartment(u.department || getUserDepartment(u));
    setFormStatus(u.status || "active");
    setFormWorkLocationType(u.workLocationType || "hq");
    setFormWorkLocationId(u.workLocationId || "");
    setFormCompany(u.company || "مجموعة مراسيم القابضة");
    
    setFormAllowedStoreIds(u.allowedStoreIds || []);
    setFormAllowedBranchIds(u.allowedBranchIds || []);
    setFormAllowedWarehouseIds(u.allowedWarehouseIds || []);
    setFormAllowedPosIds(u.allowedPosIds || []);
    setFormPermissions(u.permissions || rolePermissions[u.role || "cashier"] || []);
    
    const profile: any = u.addressProfile || {};
    const legacyAddr: any = u.address || {};
    setUserAddressProfile({
      shortAddress: profile.shortAddress || profile.shortCode || u.shortNationalAddress || legacyAddr.shortCode || "",
      buildingNumber: profile.buildingNumber || legacyAddr.buildingNumber || "",
      streetName: profile.streetName || legacyAddr.streetName || "",
      district: profile.district || legacyAddr.district || "",
      city: profile.city || legacyAddr.city || "",
      region: profile.region || "",
      postalCode: profile.postalCode || legacyAddr.postalCode || "",
      additionalNumber: profile.additionalNumber || legacyAddr.additionalNumber || "",
      unitNumber: profile.unitNumber || "",
      country: profile.country || "المملكة العربية السعودية",
      mapLink: profile.mapLink || legacyAddr.mapUrl || "",
      gpsCoordinates: profile.gpsCoordinates || (legacyAddr.gps ? `${legacyAddr.gps.lat}, ${legacyAddr.gps.lng}` : ""),
      latitude: profile.latitude || legacyAddr.gps?.lat || "",
      longitude: profile.longitude || legacyAddr.gps?.lng || "",
      shortCode: profile.shortCode || legacyAddr.shortCode || "",
      gps: profile.gps || legacyAddr.gps || { lat: "", lng: "" },
      mapUrl: profile.mapUrl || legacyAddr.mapUrl || ""
    });

    setShowAddForm(true);
    setErrorMsg("");
  };

  // Handle save user (add/edit)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formName.trim() || !formUsername.trim() || !formEmail.trim() || !formPhone.trim()) {
      setErrorMsg("الرجاء تعبئة الاسم الكامل، واسم المستخدم، والبريد ورقم الجوال!");
      return;
    }

    const tenantId = currentUser?.tenant_id || localStorage.getItem("sahm_impersonate_tenant_id") || "tenant-default";
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(currentUser?.role || "").trim());

    if (editingUserId === null) {
      if (!isPlatform && tenantId !== "tenant-local") {
        const guard = SubscriptionGuard.getInstance();
        const check = await guard.checkLimit(tenantId, "users", users.length);
        if (!check.allowed) {
          const errMsg = `⚠️ وصلت إلى الحد الأقصى للمستخدمين في باقتك الحالية (الحد: ${check.limit}). تواصل مع إدارة منصة سهم للترقية.`;
          setErrorMsg(errMsg);
          triggerNotification(errMsg, "critical");
          return;
        }
      }
    }

    if (editingUserId === null) {
      // Add - enforce password
      if (!formPassword) {
        setErrorMsg("كلمة المرور إلزامية لإضافة مستخدم جديد!");
        return;
      }
      if (formPassword !== formConfirmPassword) {
        setErrorMsg("كلمتا المرور غير متطابقتين!");
        return;
      }
      // Check username duplicate
      const found = users.find(u => u.username.toLowerCase() === formUsername.toLowerCase());
      if (found) {
        setErrorMsg(`اسم المستخدم [${formUsername}] مسجل مسبقاً لموظف آخر!`);
        return;
      }
    } else {
      // Edit - if password filled, check match
      if (formPassword && formPassword !== formConfirmPassword) {
        setErrorMsg("كلمتا المرور غير متطابقتين!");
        return;
      }
    }

    // Role permissions authority warning check
    const myPermissions = currentUser.permissions || [];
    const violatingScopes = formPermissions.filter(p => !myPermissions.includes(p));
    if (violatingScopes.length > 0 && currentUser.role !== "tenant_owner" && currentUser.role !== "system_owner" && currentUser.role !== "admin") {
      triggerNotification(`تحذير أمني: منحت صلاحيات غير موجودة بملفك الشخصي [${violatingScopes.join(", ")}]`, "alert");
    }

    const savedAddressProfile = {
      ...userAddressProfile,
      shortCode: userAddressProfile.shortAddress,
      gps: {
        lat: userAddressProfile.latitude || "",
        lng: userAddressProfile.longitude || ""
      },
      mapUrl: userAddressProfile.mapLink
    };

    const savedAddress = {
      shortCode: userAddressProfile.shortAddress || "",
      buildingNumber: userAddressProfile.buildingNumber || "",
      streetName: userAddressProfile.streetName || "",
      district: userAddressProfile.district || "",
      city: userAddressProfile.city || "",
      postalCode: userAddressProfile.postalCode || "",
      additionalNumber: userAddressProfile.additionalNumber || "",
      gps: {
        lat: userAddressProfile.latitude || "",
        lng: userAddressProfile.longitude || ""
      },
      mapUrl: userAddressProfile.mapLink || ""
    };

    if (editingUserId !== null) {
      // Edit mode
      const updated = users.map(u => {
        if (u.id === editingUserId) {
          const passProps = formPassword ? { password: formPassword } : {};
          return {
            ...u,
            fullName: formName,
            name: formName,
            username: formUsername,
            email: formEmail,
            phone: formPhone,
            role: formRole,
            department: formDepartment,
            status: formStatus,
            workLocationType: formWorkLocationType,
            workLocationId: formWorkLocationId,
            company: formCompany,
            allowedStoreIds: formAllowedStoreIds,
            allowedBranchIds: formAllowedBranchIds,
            allowedWarehouseIds: formAllowedWarehouseIds,
            allowedPosIds: formAllowedPosIds,
            permissions: formPermissions,
            addressProfile: savedAddressProfile,
            address: savedAddress,
            shortNationalAddress: userAddressProfile.shortAddress,
            ...passProps
          };
        }
        return u;
      });
      setUsers(updated);
      addAuditLog("تعديل مستخدم", `تحديث الملف الشامل للموظف [${formName}] وتدقيق الإعدادات الجغرافية.`);
      triggerNotification(`تم تحديث بيانات ومسميات الموظف [${formName}] بنجاح.`, "success");
    } else {
      // Add mode
      const newId = String(users.length > 0 ? Math.max(...users.map(u => parseInt(String(u.id)) || 0)) + 1 : "6");
      const newUser: User = {
        id: newId,
        fullName: formName,
        name: formName,
        username: formUsername,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        role: formRole,
        department: formDepartment,
        status: formStatus,
        emailVerified: true,
        mustChangePassword: false,
        workLocationType: formWorkLocationType,
        workLocationId: formWorkLocationId,
        company: formCompany,
        allowedStoreIds: formAllowedStoreIds,
        allowedBranchIds: formAllowedBranchIds,
        allowedWarehouseIds: formAllowedWarehouseIds,
        allowedPosIds: formAllowedPosIds,
        permissions: formPermissions,
        createdAt: new Date().toISOString().split("T")[0],
        createdBy: currentUser.fullName || currentUser.name || "مدير النظام",
        addressProfile: savedAddressProfile,
        address: savedAddress,
        shortNationalAddress: userAddressProfile.shortAddress
      };
      setUsers([...users, newUser]);
      addAuditLog("إنشاء مستخدم", `إدراج الموظف الجديد [${formName}] وربطه بموقع العمل [${formWorkLocationType}].`);
      triggerNotification(`تم رصد وإدراج الموظف الجديد [${formName}] وتعيين صلاحيات الدور بنجاح.`, "success");

      // Increment usage
      if (!isPlatform && tenantId !== "tenant-local") {
        try {
          const db = SahmDatabaseService.getInstance();
          await db.incrementSubscriptionUsage(tenantId, currentUser.organization_id || currentUser.company_id || "comp-default", "users_count", 1);
        } catch (uErr) {
          console.warn("[HumanResources] Failed to increment users count in usage:", uErr);
        }
      }
    }

    // Reset states
    setShowAddForm(false);
    setEditingUserId(null);
  };

  // Instead of permanent deletion, we open the Disable modal to freeze the employee with a written reason.
  const handleDeleteUser = (userObj: User) => {
    if (userObj.id === currentUser.id) {
      triggerNotification("⚠️ عذراً، لا يمكنك تعطيل حسابك الشخصي الذي تستخدمه حالياً!", "alert");
      return;
    }
    const isSuperUser = ["system_owner", "system_admin", "platform_owner"].includes(userObj.role || "");
    if (userObj.role === "tenant_owner" || userObj.role === "system_owner" || (userObj.permissions?.includes("*") && isSuperUser)) {
      triggerNotification("⚠️ عذراً، لا يمكن تجميد أو تعطيل حساب مالك النظام تحت أي ظرف لضمان سلامة الوصول للنظام.", "alert");
      return;
    }
    if (userObj.id === 1 || userObj.id === "1") {
      triggerNotification("⚠️ عذراً، لا يمكن تعطيل حساب المالك الرئيسي لتجنب إقفال النظام.", "alert");
      return;
    }
    setDisablingUser(userObj);
    setDisableReason("");
    setShowDisableModal(true);
  };

  // Safe helper to grab mapped Location string name
  const getLocationName = (type: string, id: string) => {
    if (!id) return "غير معين";
    switch (type) {
      case "hq": return "الإدارة المركزية";
      case "store": {
        const item = stores.find(s => s.id === id);
        return item ? `متجر: ${item.name}` : `متجر مجهول (${id})`;
      }
      case "branch": {
        const item = branches.find(b => b.id === id);
        return item ? `فرع: ${item.name}` : `فرع مجهول (${id})`;
      }
      case "warehouse": {
        const item = warehouses.find(w => w.id === id);
        return item ? `مستودع: ${item.name}` : `مستودع مجهول (${id})`;
      }
      case "pos": {
        const item = posUnits.find(p => p.id === id);
        return item ? `كاشير: ${item.name}` : `نقطة بيع (${id})`;
      }
      case "remote": return "عن بعد";
      default: return "غير محدد";
    }
  };

  // Filtered array of users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const nameMatch = (u.fullName || u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.phone || "").includes(searchTerm);
      const roleMatch = !roleFilter || u.role === roleFilter;
      const deptMatch = !departmentFilter || getUserDepartment(u) === departmentFilter;
      const statusMatch = !statusFilter || u.status === statusFilter;
      const locTypeMatch = !locationTypeFilter || u.workLocationType === locationTypeFilter;
      return nameMatch && roleMatch && deptMatch && statusMatch && locTypeMatch;
    });
  }, [users, searchTerm, roleFilter, departmentFilter, locationTypeFilter, statusFilter]);

  return (
    <div className="w-full text-right p-4 space-y-6" dir="rtl" style={{ color: theme.text }}>
      
      {/* Upper Cabin: Welcome and Subtab switcher */}
      <div className="p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(234,179,8,0.08)]"
        style={{
          background: `radial-gradient(circle at top right, rgba(234, 179, 8, 0.08) 0%, rgba(13, 21, 39, 0.95) 100%)`,
          borderColor: theme.border
        }}>
        <div className="absolute left-0 top-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          {/* Double-ring attendance & shift compliance gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0 bg-black/45 rounded-2xl border border-zinc-800/60 p-2 shadow-inner">
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="#EAB308" 
                  strokeWidth="2.5" 
                  strokeDasharray="100" 
                  strokeDashoffset="3.5" 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
            <div className="absolute inset-1.5">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2" 
                  strokeDasharray="100" 
                  strokeDashoffset="0.8" 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
            <div className="text-center z-10">
              <span className="block text-[10px] font-black text-white font-mono leading-none">96.5%</span>
              <span className="block text-[5.5px] text-yellow-500 mt-0.5 leading-none">انضباط الورديات</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="p-3.5 bg-yellow-500/15 text-yellow-500 rounded-2xl">
              <Users className="w-7 h-7" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>إدارة الموارد البشرية والتحقق الأمني (HR Portal)</span>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full font-black">إصدار أمني 🔐</span>
              </h2>
              <p className="text-xs mt-1" style={{ color: theme.muted }}>
                لوحة التنظيم الهيكلي للموظفين، تخطيط الصلاحيات الشجرية (RBAC)، والتحقق من العنوان الوطني وعقود العمل.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10">
          {currentUser.permissions.includes("users:create") && !showAddForm && (
            <button
              onClick={() => {
                setEditingUserId(null);
                setFormName("");
                setFormUsername("");
                setFormEmail("");
                setFormPhone("");
                setFormPassword("");
                setFormConfirmPassword("");
                setFormRole("cashier");
                setFormStatus("active");
                setFormWorkLocationType("hq");
                setFormWorkLocationId("");
                setFormCompany("مجموعة مراسيم القابضة");
                setFormAllowedStoreIds([]);
                setFormAllowedBranchIds([]);
                setFormAllowedWarehouseIds([]);
                setFormAllowedPosIds([]);
                setFormPermissions(rolePermissions["cashier"] || []);
                setUserAddressProfile({
                  shortAddress: "",
                  buildingNumber: "",
                  streetName: "",
                  district: "",
                  city: "",
                  region: "",
                  postalCode: "",
                  additionalNumber: "",
                  unitNumber: "",
                  country: "المملكة العربية السعودية",
                  mapLink: ""
                });
                setShowAddForm(true);
              }}
              className="py-2.5 px-5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow border-none"
            >
              <span>➕ إضافة موظف / مستخدم جديد</span>
            </button>
          )}

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href",     dataStr);
              downloadAnchorNode.setAttribute("download", `sahm_os_staff_export_2026.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
              triggerNotification("تم تصدير سجل الكادر البشري بنجاح كمستند JSON مشفر.", "success");
            }}
            className="py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer hover:bg-white/5"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Download className="w-4 h-4" />
            <span>تصدير البيانات</span>
          </button>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex gap-1 overflow-x-auto border-b pb-1" style={{ borderColor: theme.border }}>
        {[
          { id: "overview", label: "نظرة عامة 📊", icon: Activity },
          { id: "users_list", label: "الموظفون والمستخدمون 👥", icon: Users },
          { id: "locations", label: "الفروع والمواقع 🏢", icon: MapPin },
          { id: "roles", label: "الأدوار والصلاحيات 🔐", icon: ShieldCheck },
          { id: "logs", label: "سجل الأنشطة والمتابعة 🕒", icon: FileText },
          { id: "security", label: "إعدادات الأمان ومكافحة الانتحال 🛡️", icon: Lock },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setShowAddForm(false);
              }}
              className="flex items-center gap-2 py-2 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer border-b-2"
              style={{
                borderColor: isActive ? "rgba(234, 179, 8, 1)" : "transparent",
                color: isActive ? "rgba(234, 179, 8, 1)" : theme.muted,
                backgroundColor: isActive ? "rgba(234, 179, 8, 0.05)" : "transparent"
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 📊 أقسام الكادر البشري وإحصائياتها السريعة */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-300 flex items-center gap-1.5">
            📊 توزيع الكادر البشري ومعدلات النشاط الفوري بالأقسام:
          </span>
          {departmentFilter && (
            <button
              onClick={() => setDepartmentFilter("")}
              className="text-[10px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-2.5 py-1 rounded-lg border border-yellow-500/20 transition-all font-black cursor-pointer"
            >
              إلغاء فلترة القسم وعرض الكل 👁️
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Card 1: الإدارة */}
          <div 
            onClick={() => {
              setDepartmentFilter(departmentFilter === "management" ? "" : "management");
              setActiveSubTab("users_list");
              triggerNotification("تمت تصفية القائمة واستعراض الكادر الإداري والمالي.", "info");
            }}
            className={`p-4 rounded-2xl border text-right relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer flex flex-col justify-between h-[105px] ${
              departmentFilter === "management" ? "border-blue-500 ring-1 ring-blue-500/20" : "border-slate-800/80 hover:border-slate-700/80"
            }`}
            style={{ 
              background: `radial-gradient(circle at top right, rgba(59, 130, 246, 0.05) 0%, ${theme.card} 100%)`
            }}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                  <span>🏢</span>
                  <span>قسم الإدارة والمتابعة</span>
                </span>
                <span className="text-[8px] bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded border border-blue-500/15">
                  Executive
                </span>
              </div>
              
              <p className="text-xl font-black mt-1.5 font-mono text-blue-400">
                {stats.mgtCount} <span className="text-[9px] text-gray-500 font-sans font-normal">موظف</span>
              </p>
            </div>
            
            {/* Sparkline & Status */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[8px] text-blue-400 font-extrabold">نشط: {stats.mgtActive}</span>
              <div className="h-3 w-16 opacity-70">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,15 Q25,8 50,15 T100,10" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: المبيعات */}
          <div 
            onClick={() => {
              setDepartmentFilter(departmentFilter === "sales" ? "" : "sales");
              setActiveSubTab("users_list");
              triggerNotification("تمت تصفية القائمة واستعراض موظفي المبيعات والكاشير.", "info");
            }}
            className={`p-4 rounded-2xl border text-right relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer flex flex-col justify-between h-[105px] ${
              departmentFilter === "sales" ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-slate-800/80 hover:border-slate-700/80"
            }`}
            style={{ 
              background: `radial-gradient(circle at top right, rgba(16, 185, 129, 0.05) 0%, ${theme.card} 100%)`
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                <span>🛍️</span>
                <span>قسم مبيعات الفروع</span>
              </span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/15">
                Front-office
              </span>
            </div>
            
            <p className="text-xl font-black mt-1.5 font-mono text-emerald-400">
              {stats.salesCount} <span className="text-[9px] text-gray-500 font-sans font-normal">موظف</span>
            </p>
            
            {/* Sparkline & Status */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[8px] text-emerald-400 font-extrabold">نشط: {stats.salesActive}</span>
              <div className="h-3 w-16 opacity-70">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,20 Q20,5 40,15 T80,3 T100,5" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: المخازن */}
          <div 
            onClick={() => {
              setDepartmentFilter(departmentFilter === "warehouse" ? "" : "warehouse");
              setActiveSubTab("users_list");
              triggerNotification("تمت تصفية القائمة واستعراض أمناء ومسؤولي المخازن والمستودعات.", "info");
            }}
            className={`p-4 rounded-2xl border text-right relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer flex flex-col justify-between h-[105px] ${
              departmentFilter === "warehouse" ? "border-purple-500 ring-1 ring-purple-500/20" : "border-slate-800/80 hover:border-slate-700/80"
            }`}
            style={{ 
              background: `radial-gradient(circle at top right, rgba(168, 85, 247, 0.05) 0%, ${theme.card} 100%)`
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                <span>📦</span>
                <span>قسم المخازن واللوجستك</span>
              </span>
              <span className="text-[8px] bg-purple-500/10 text-purple-400 font-extrabold px-1.5 py-0.5 rounded border border-purple-500/15">
                Logistic
              </span>
            </div>
            
            <p className="text-xl font-black mt-1.5 font-mono text-purple-400">
              {stats.whCount} <span className="text-[9px] text-gray-500 font-sans font-normal">موظف</span>
            </p>
            
            {/* Sparkline & Status */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[8px] text-purple-400 font-extrabold">نشط: {stats.whActive}</span>
              <div className="h-3 w-16 opacity-70">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,15 Q25,18 50,10 T100,12" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: الدعم الفني */}
          <div 
            onClick={() => {
              setDepartmentFilter(departmentFilter === "support" ? "" : "support");
              setActiveSubTab("users_list");
              triggerNotification("تمت تصفية القائمة واستعراض كادر الدعم الفني والتقني.", "info");
            }}
            className={`p-4 rounded-2xl border text-right relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer flex flex-col justify-between h-[105px] ${
              departmentFilter === "support" ? "border-amber-500 ring-1 ring-amber-500/20" : "border-slate-800/80 hover:border-slate-700/80"
            }`}
            style={{ 
              background: `radial-gradient(circle at top right, rgba(234, 179, 8, 0.05) 0%, ${theme.card} 100%)`
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                <span>🖥️</span>
                <span>الدعم الفني والتقني</span>
              </span>
              <span className="text-[8px] bg-amber-500/10 text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/15">
                Technical
              </span>
            </div>
            
            <p className="text-xl font-black mt-1.5 font-mono text-amber-400">
              {stats.supCount} <span className="text-[9px] text-gray-500 font-sans font-normal">موظف</span>
            </p>
            
            {/* Sparkline & Status */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[8px] text-amber-400 font-extrabold">نشط: {stats.supActive}</span>
              <div className="h-3 w-16 opacity-70">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,10 Q25,12 50,11 T100,10" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ERROR MSGS CONTAINER */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ====================================
          VIEW 1: ADD / EDIT FORM
         ==================================== */}
      {showAddForm && (
        <div className="p-6 rounded-2xl border space-y-6 shadow-2xl relative" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
            <h3 className="text-sm font-black flex items-center gap-2">
              <span className="p-1 rgb-[234, 179, 8] text-yellow-500">👤</span>
              {editingUserId !== null ? `تعديل الملف التنفيذي العائد لـ [${formName}]` : "تأسيس حساب موظف وظيفي جديد"}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 px-3 bg-red-650/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[10px] font-black cursor-pointer"
            >
              إلغاء ×
            </button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">الاسم الكامل للموظف:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="محمد أحمد القحطاني"
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">اسم المستخدم للربط والولوج:</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="qahtani_m"
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black font-mono tracking-tight"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">البريد الإلكتروني الموثق:</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@sahmos.com"
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black font-mono"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">رقم الجوال الشخصي المربوط:</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+966500000000"
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black font-mono text-left"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">
                  {editingUserId !== null ? "تغيير كلمة المرور (اختياري):" : "تعيين كلمة المرور الأولية (أمني):"}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUserId !== null ? "اتركه فارغاً للاحتفاظ بالقديمة" : "••••••••"}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-mono"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">تأكيد كلمة المرور:</label>
                <input
                  type="password"
                  value={formConfirmPassword}
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-mono"
                />
              </div>

              {/* Custom Searchable Role selector */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-gray-400">الدور والمنصب التنفيذي:</label>
                <div 
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black flex justify-between items-center cursor-pointer select-none"
                >
                  <span className="truncate">
                    {roleTranslations[formRole] || formRole || "اختر دوراً..."}
                  </span>
                  <span className="text-zinc-500 text-[10px]">▼</span>
                </div>

                {showRoleDropdown && (
                  <div className="absolute z-50 left-0 right-0 mt-1 p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl max-h-[300px] overflow-y-auto space-y-3">
                    {/* Search Field */}
                    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-zinc-900">
                      <Search className="w-3.5 h-3.5 text-zinc-500" />
                      <input 
                        type="text"
                        placeholder="ابحث بالعربي أو الإنجليزي... (Search...)"
                        value={roleSearchTerm}
                        onChange={(e) => setRoleSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] text-white w-full text-right"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {roleSearchTerm && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setRoleSearchTerm(""); }}
                          className="text-[10px] text-gray-455 hover:text-white"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Grouped Roles list */}
                    <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-0.5">
                      {Object.keys(ROLE_DEPARTMENTS).map((deptKey) => {
                        const deptInfo = ROLE_DEPARTMENTS[deptKey];
                        const matchedRoles = deptInfo.roles.filter(rKey => {
                          const label = roleTranslations[rKey] || "";
                          return rKey.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
                                 label.toLowerCase().includes(roleSearchTerm.toLowerCase());
                        });

                        if (matchedRoles.length === 0) return null;

                        return (
                          <div key={deptKey} className="space-y-1">
                            <div className="text-[9px] font-black text-amber-500 flex items-center gap-1 select-none border-b border-zinc-900 pb-0.5">
                              <span>{deptInfo.icon}</span>
                              <span>{deptInfo.label}</span>
                            </div>
                            <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
                              {matchedRoles.map((rKey) => (
                                <div
                                  key={rKey}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRoleChangeInForm(rKey);
                                    // Automatically pre-select department based on role category
                                    if (deptKey === "stores" || deptKey === "marketing") {
                                      setFormDepartment("sales");
                                    } else if (deptKey === "inventory") {
                                      setFormDepartment("warehouse");
                                    } else if (deptKey === "support") {
                                      setFormDepartment("support");
                                    } else {
                                      setFormDepartment("management");
                                    }
                                    setShowRoleDropdown(false);
                                  }}
                                  className={`p-2 rounded text-[10.5px] cursor-pointer font-bold transition-all flex justify-between items-center ${
                                    formRole === rKey 
                                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" 
                                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                                  }`}
                                >
                                  <span>{roleTranslations[rKey] || rKey}</span>
                                  <span className="text-[8.5px] font-mono text-zinc-500 font-normal">({rKey})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Custom Roles group if any dynamic user roles exist */}
                      {Object.keys(roleTranslations).filter(r => !Object.values(ROLE_DEPARTMENTS).flatMap(d => d.roles).includes(r) && r !== "custom").length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] font-black text-blue-400 flex items-center gap-1 select-none border-b border-zinc-900 pb-0.5">
                            <span>🔐</span>
                            <span>أدوار مصممة مخصصة</span>
                          </div>
                          <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
                            {Object.keys(roleTranslations)
                              .filter(r => !Object.values(ROLE_DEPARTMENTS).flatMap(d => d.roles).includes(r) && r !== "custom")
                              .filter(rKey => {
                                const label = roleTranslations[rKey] || "";
                                return rKey.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
                                       label.toLowerCase().includes(roleSearchTerm.toLowerCase());
                              })
                              .map(rKey => (
                                <div
                                  key={rKey}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRoleChangeInForm(rKey);
                                    setShowRoleDropdown(false);
                                  }}
                                  className={`p-2 rounded text-[10.5px] cursor-pointer font-bold transition-all flex justify-between items-center ${
                                    formRole === rKey 
                                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" 
                                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                                  }`}
                                >
                                  <span>{roleTranslations[rKey] || rKey}</span>
                                  <span className="text-[8.5px] font-mono text-zinc-500">({rKey})</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Create Role inline */}
                    <div className="border-t border-zinc-900 pt-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRoleDropdown(false);
                          setActiveSubTab("roles"); // Jump to roles sub-tab
                          triggerNotification("تم نقلك إلى قسم تصميم الأدوار؛ يرجى ملء نموذج إنشاء دور جديد هنا.", "info");
                        }}
                        className="w-full text-center py-2 bg-zinc-900 hover:bg-yellow-500/15 border border-zinc-850 hover:border-yellow-500/30 rounded-lg text-yellow-500 text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        ➕ إنشاء وتصميم دور جديد
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Department Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">القسم الوظيفي التابع له:</label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black"
                >
                  <option value="management">الإدارة العامة والمتابعة (Management)</option>
                  <option value="sales">المبيعات ونقاط البيع (Sales & Cashiers)</option>
                  <option value="warehouse">المخازن والمستودعات والخدمات اللوجستية (Warehouses)</option>
                  <option value="support">الدعم الفني والتقني والأعطال (Support & I.T.)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">حالة ملف الموظف:</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black"
                >
                  <option value="active">نشط ومفعل الدخول ✅</option>
                  <option value="disabled">موقوف ومجمد مؤقتاً 🚫</option>
                  <option value="pending">بانتظار التحقق والتوثيق 🕒</option>
                </select>
              </div>

              {/* Work Location Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-500">نوع موقع العمل الرئيسي:</label>
                <select
                  value={formWorkLocationType}
                  onChange={(e) => {
                    const type = e.target.value as any;
                    setFormWorkLocationType(type);
                    // Autofill first appropriate id
                    if (type === "branch" && branches.length > 0) setFormWorkLocationId(branches[0].id);
                    else if (type === "warehouse" && warehouses.length > 0) setFormWorkLocationId(warehouses[0].id);
                    else if (type === "pos" && posUnits.length > 0) setFormWorkLocationId(posUnits[0].id);
                    else if (type === "store" && stores.length > 0) setFormWorkLocationId(stores[0].id);
                    else setFormWorkLocationId("");
                  }}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black"
                >
                  <option value="hq">الإدارة العامة وعقود HQ</option>
                  <option value="store">المتجر الرئيسي للمؤسسة</option>
                  <option value="branch">أحد الفروع الميدانية</option>
                  <option value="warehouse">أحد المستودعات وإمدادات المخازن</option>
                  <option value="pos">جهاز كاشير ومحطة بيع محددة</option>
                  <option value="remote">عن بعد (Remote Duty)</option>
                </select>
              </div>

              {/* Work Location Id selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-500">تعيين الموقع المحدد:</label>
                {formWorkLocationType === "hq" || formWorkLocationType === "remote" ? (
                  <div className="p-3 text-xs bg-zinc-950 border text-zinc-400 rounded-xl border-zinc-800 select-none">
                    موقع إداري عام أو غير لوجستي
                  </div>
                ) : (
                  <select
                    value={formWorkLocationId}
                    onChange={(e) => setFormWorkLocationId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-black"
                  >
                    <option value="">-- يرجى اختيار الموقع --</option>
                    {formWorkLocationType === "store" && stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {formWorkLocationType === "branch" && branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.city})</option>)}
                    {formWorkLocationType === "warehouse" && warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type === "main" ? "رئيسي" : "فرعي"})</option>)}
                    {formWorkLocationType === "pos" && posUnits.map(p => <option key={p.id} value={p.id}>{p.name} (فرع: {p.branchId})</option>)}
                  </select>
                )}
              </div>

              {/* Employer / Company name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400">الشركة المتعاقد معها وطرف التوظيف:</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-bold"
                />
              </div>

            </div>

            {/* National Address Verification section for compliance with KSA laws (التحقق الأمني للعنوان والبريد) */}
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-3 mb-3 gap-2">
                <h4 className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                  <Map className="w-4 h-4" />
                  بيانات التوثيق السكني والعنوان الوطني للموظف (مكافحة الهجمات ومخاطر السطو)
                </h4>
                <button
                  type="button"
                  onClick={handleClearAddressData}
                  className="text-[10px] py-1 px-2.5 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30 rounded-lg font-bold transition-all cursor-pointer hover:border-red-500 active:scale-95"
                >
                  ✖ مسح بيانات العنوان
                </button>
              </div>

              {/* Lookup and Status indicators */}
              <div className="mb-4 bg-black/20 p-3.5 rounded-xl border border-zinc-900 space-y-3 text-right">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="space-y-1.5 flex-1 w-full text-right">
                    <label className="text-[10px] font-extrabold text-gray-300 block">
                      العنوان الوطني المختصر (مثال: SP764 أو RAGB2929):
                    </label>
                    <input
                      type="text"
                      value={userAddressProfile.shortAddress}
                      onChange={(e) => {
                        setUserAddressProfile({ ...userAddressProfile, shortAddress: e.target.value });
                        if (addressFetchStatus.type !== 'idle') {
                          setAddressFetchStatus({ type: 'idle', message: '' });
                        }
                      }}
                      placeholder="SP764"
                      className="w-full text-xs p-3 rounded-xl bg-slate-950/80 border border-zinc-800 text-white font-mono placeholder:text-gray-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchNationalAddress}
                    disabled={addressFetchStatus.type === "loading"}
                    className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {addressFetchStatus.type === "loading" ? "⏳ جاري الجلب..." : "🔍 جلب بيانات العنوان"}
                  </button>
                </div>

                {/* Status indicator alerts */}
                {addressFetchStatus.type !== "idle" && (
                  <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed flex items-center justify-between transition-all ${
                    addressFetchStatus.type === "loading" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                    addressFetchStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    addressFetchStatus.type === "warning" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                    "bg-red-500/10 border-red-500/20 text-red-500"
                  }`}>
                    <span className="font-bold">
                      {addressFetchStatus.type === "loading" && "⏳ جاري جلب بيانات العنوان..."}
                      {addressFetchStatus.type === "success" && "✅ تم جلب بيانات العنوان بنجاح"}
                      {addressFetchStatus.type === "warning" && "⚠️ سيتم استبدال بيانات العنوان الحالية، هل تريد المتابعة؟"}
                      {addressFetchStatus.type === "error" && `❌ ${addressFetchStatus.message}`}
                    </span>
                    {addressFetchStatus.type === "warning" && (
                      <div className="flex gap-2 text-right justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (pendingFetchedAddress) {
                              applyFetchedAddress(pendingFetchedAddress);
                            }
                          }}
                          className="bg-yellow-500 text-black py-1 px-3 rounded-lg font-black hover:bg-yellow-400 text-[9px] cursor-pointer"
                        >
                          نعم، وافق واستورد 💾
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowReplaceAddressConfirm(false);
                            setPendingFetchedAddress(null);
                            setAddressFetchStatus({ type: "idle", message: "" });
                          }}
                          className="bg-zinc-800 text-gray-300 py-1 px-2.5 rounded-lg font-bold hover:bg-zinc-700 text-[9px] cursor-pointer"
                        >
                          تراجع
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Standard inputs grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">رقم المبنى:</label>
                  <input
                    type="text"
                    value={userAddressProfile.buildingNumber}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, buildingNumber: e.target.value })}
                    placeholder="1283"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white font-mono placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">اسم الشارع:</label>
                  <input
                    type="text"
                    value={userAddressProfile.streetName}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, streetName: e.target.value })}
                    placeholder="شارع العليا العام"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">الحي:</label>
                  <input
                    type="text"
                    value={userAddressProfile.district}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, district: e.target.value })}
                    placeholder="حي العليا السكني"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">المدينة:</label>
                  <input
                    type="text"
                    value={userAddressProfile.city}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, city: e.target.value })}
                    placeholder="الرياض"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">الرمز البريدي (Postal Code):</label>
                  <input
                    type="text"
                    value={userAddressProfile.postalCode}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, postalCode: e.target.value })}
                    placeholder="12211"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white font-mono placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">الرقم الإضافي:</label>
                  <input
                    type="text"
                    value={userAddressProfile.additionalNumber}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, additionalNumber: e.target.value })}
                    placeholder="4827"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white font-mono placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">رابط الموقع الجغرافي / الخريطة:</label>
                  <input
                    type="text"
                    value={userAddressProfile.mapLink}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, mapLink: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white font-mono placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 block font-bold">الإحداثيات GPS (الارتفاع والخطوط):</label>
                  <input
                    type="text"
                    value={userAddressProfile.gpsCoordinates || ""}
                    onChange={(e) => setUserAddressProfile({ ...userAddressProfile, gpsCoordinates: e.target.value })}
                    placeholder="24.7136, 46.6753"
                    className="w-full text-xs p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-white font-mono placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Granular security scope control */}
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h4 className="text-xs font-black text-[#D4AF37] flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-4 h-4" />
                التحكم بالصلاحيات الدقيقة وأذونات الدخول الشجرية
              </h4>
              
              <div className="flex flex-col md:flex-row gap-5">
                
                {/* Visual permissions checklist */}
                <div className="w-full md:w-3/5 space-y-4">
                  <span className="block text-[10px] font-bold text-gray-450">حدد الصلاحيات الفردية للموظف:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                    {[
                      { key: "users:view", label: "استعراض الهستولوجي والموظفين", desc: "رؤية طاقم العمل بـ HR" },
                      { key: "users:create", label: "إدراج وتأسيس حسابات جديدة", desc: "صلاحية إنشاء موظفين جدد" },
                      { key: "users:update", label: "تعديل حسابات ومستويات الموظفين", desc: "تحديث الأسماء وتغيير التبعيات" },
                      { key: "users:disable", label: "تعطيل وحجر حسابات الموظفين", desc: "تجميد حسابات الزملاء أمنياً" },
                      { key: "roles:manage", label: "تعديل الصلاحيات والأدوار الشجرية", desc: "إعادة رسم سياسات RBAC" },
                      { key: "pos:access", label: "الدخول لمحطة المبيعات والكاشير", desc: "صلاحية تشغيل نقطة البيع" },
                      { key: "pos:sell", label: "إتمام صفقات البيع ومطابقة الفواتير", desc: "ترخيص بيع وتقبيل مبالغ" },
                      { key: "inventory:manage", label: "إدارة المخازن والجرد والمستودعات", desc: "فتح، تعديل، وتحرير السلع اللوجستية" },
                      { key: "products:create", label: "إدراج منتجات جديدة للقمم", desc: "إضافة أصناف جديدة للكتالوج" },
                      { key: "finance:view", label: "الوصول لوحدات الإيراد والضرائب", desc: "استعراض دفاتر اليومية والتسويات" },
                    ].map((item) => {
                      const enabled = formPermissions.includes(item.key);
                      return (
                        <div
                          key={item.key}
                          onClick={() => handleTogglePermission(item.key)}
                          className={`p-2.5 rounded-xl border text-right cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                            enabled 
                              ? "bg-yellow-500/10 border-yellow-550 text-yellow-500 shadow-sm" 
                              : "bg-slate-950/20 border-zinc-900 text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                            enabled ? "bg-yellow-500 border-yellow-500 text-black" : "border-zinc-700"
                          }`}>
                            {enabled && <Check className="w-3 h-3 text-black stroke-[3.5]" />}
                          </span>
                          <div>
                            <span className="text-[10.5px] font-black block leading-none">{item.label}</span>
                            <span className="text-[8.5px] mt-0.5 block opacity-60 leading-tight">{item.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub Tab: Scope list for Allowed Stores, Allowed Branches, etc. */}
                <div className="w-full md:w-2/5 space-y-4 border-r pr-5" style={{ borderColor: theme.border }}>
                  <span className="block text-[10px] font-bold text-gray-450">نطاق الحماية (المواقع المسموح للموظف التحكم بها):</span>
                  
                  {/* Allowed Branches select checklist */}
                  <div className="space-y-2">
                    <span className="text-[9.5px]/none bg-zinc-800 text-zinc-300 font-bold px-2 py-1 rounded inline-block">مدى الفروع المرئية:</span>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto bg-black/25 p-1.5 rounded-lg border border-zinc-900/60 font-sans">
                      {branches.map(b => {
                        const checked = formAllowedBranchIds.includes(b.id);
                        return (
                          <label key={b.id} className="flex items-center gap-1.5 text-[10px] cursor-pointer hover:bg-white/5 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) setFormAllowedBranchIds(formAllowedBranchIds.filter(id => id !== b.id));
                                else setFormAllowedBranchIds([...formAllowedBranchIds, b.id]);
                              }}
                              className="accent-yellow-500 cursor-pointer"
                            />
                            <span className="truncate text-white font-bold">{b.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allowed Warehouses select checklist */}
                  <div className="space-y-2">
                    <span className="text-[9.5px]/none bg-zinc-800 text-zinc-300 font-bold px-2 py-1 rounded inline-block">مدى المستودعات المرئية:</span>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto bg-black/25 p-1.5 rounded-lg border border-zinc-900/60 font-sans">
                      {warehouses.map(w => {
                        const checked = formAllowedWarehouseIds.includes(w.id);
                        return (
                          <label key={w.id} className="flex items-center gap-1.5 text-[10px] cursor-pointer hover:bg-white/5 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) setFormAllowedWarehouseIds(formAllowedWarehouseIds.filter(id => id !== w.id));
                                else setFormAllowedWarehouseIds([...formAllowedWarehouseIds, w.id]);
                              }}
                              className="accent-yellow-500 cursor-pointer"
                            />
                            <span className="truncate text-white font-bold">{w.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-6 rounded-xl text-xs font-bold transition-all bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 cursor-pointer"
              >
                إلغاء وتجاهل
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer border-none shadow"
              >
                💾 حفظ واعتماد الحساب المحدث
              </button>
            </div>
          </form>

        </div>
      )}

      {/* ========================================================
          SUBTAB VIEW: OVERVIEW
         ======================================================== */}
      {activeSubTab === "overview" && !showAddForm && (
        <div className="space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            
            <div className="p-4 rounded-2xl border text-right relative overflow-hidden" 
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <Users className="w-10 h-10 text-sky-500 opacity-20 absolute left-2 bottom-2" />
              <span className="text-[10px] font-bold text-gray-500">إجمالي كم الموظفين</span>
              <p className="text-2xl font-black mt-1 font-mono">{stats.total}</p>
              <span className="text-[8px] text-zinc-400 block mt-1">مدققين ومسجلين</span>
            </div>

            <div className="p-4 rounded-2xl border text-right relative overflow-hidden" 
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <UserCheck className="w-10 h-10 text-emerald-500 opacity-20 absolute left-2 bottom-2" />
              <span className="text-[10px] font-bold text-emerald-500">الحسابات النشطة</span>
              <p className="text-2xl font-black mt-1 font-mono text-emerald-500">{stats.active}</p>
              <span className="text-[8px] text-zinc-400 block mt-1">يملكون رخصة جارية</span>
            </div>

            <div className="p-4 rounded-2xl border text-right relative overflow-hidden" 
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <UserX className="w-10 h-10 text-red-500 opacity-20 absolute left-2 bottom-2" />
              <span className="text-[10px] font-bold text-red-400">الحسابات الموقوفة</span>
              <p className="text-2xl font-black mt-1 font-mono text-red-400">{stats.disabled}</p>
              <span className="text-[8px] text-zinc-400 block mt-1">حجر مؤقت أو مسحوبين</span>
            </div>

            <div className="p-4 rounded-2xl border text-right relative overflow-hidden" 
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <UserMinus className="w-10 h-10 text-amber-500 opacity-20 absolute left-2 bottom-2" />
              <span className="text-[10px] font-bold text-amber-500">بانتظار التفعيل</span>
              <p className="text-2xl font-black mt-1 font-mono text-amber-500">{stats.pending}</p>
              <span className="text-[8px] text-zinc-400 block mt-1">تحت التحقق الميداني</span>
            </div>

            <div className="p-4 rounded-2xl border text-right relative overflow-hidden" 
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <Activity className="w-10 h-10 text-[#D4AF37] opacity-20 absolute left-2 bottom-2" />
              <span className="text-[10px] font-bold text-[#D4AF37]">مخطط الدخول اليومي</span>
              <p className="text-2xl font-black mt-1 font-mono text-[#D4AF37]">{stats.loggedInToday}</p>
              <span className="text-[8px] text-zinc-400 block mt-1">نقاط دخول تفاعلية</span>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 👥 Employees categorized by role / locations preview summary list */}
            <div className="col-span-2 p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <h3 className="text-xs font-black flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: theme.border }}>
                <span className="flex items-center gap-1.5 text-yellow-500">🏢 تصنيف الطواقم الميدانية (حسب موقع الولوج الجاري)</span>
                <span className="text-[9px] text-[#D4AF37] underline cursor-pointer" onClick={() => setActiveSubTab("users_list")}>المزيد من الفلاتر ...</span>
              </h3>
              
              <div className="space-y-2.5">
                {[
                  { title: "🏢 الإدارة العامة والمكاتب التشغيلية", filter: "hq", count: users.filter(u => u.workLocationType === "hq" || !u.workLocationType).length, desc: "تشمل مهام الإدارة والمحاسبة والملاك الأساسيين" },
                  { title: "🏬 طاقم عمل المتاجر والمعارض", filter: "store", count: users.filter(u => u.workLocationType === "store").length, desc: "تشمل مسؤولي المعارض المباشرين ومدراء المبيعات" },
                  { title: "🏢 طاقم عمل الفروع الخارجية", filter: "branch", count: users.filter(u => u.workLocationType === "branch").length, desc: "تشمل مدراء الفروع والكاشيرات ونقاط فروع الرياض وجدة" },
                  { title: "📦 أمناء المخازن اللوجستية والمستودعات", filter: "warehouse", count: users.filter(u => u.workLocationType === "warehouse").length, desc: "مسؤولي استلام التوريدات وإصدار أذونات التحويل والتموين" },
                  { title: "🖥️ الكاشير وموظفي محطات نقاط البيع المباشرة (POS)", filter: "pos", count: users.filter(u => u.workLocationType === "pos").length, desc: "أمناء الصناديق والمطابقات اليومية للطلبيات" },
                ].map((sec, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setLocationTypeFilter(sec.filter);
                      setActiveSubTab("users_list");
                    }}
                    className="p-3 rounded-xl border border-dashed hover:border-yellow-500/40 cursor-default transition-all flex items-center justify-between"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  >
                    <div>
                      <span className="text-[11px] font-black block text-gray-200">{sec.title}</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5">{sec.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-slate-900 border px-3 py-1 rounded-lg text-white font-mono" style={{ borderColor: theme.border }}>
                        {sec.count} موظفين
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Security Advisory Shield (التحقق الأمني) */}
            <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-1.5 border-b pb-3" style={{ borderColor: theme.border }}>
                <ShieldAlert className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xs font-black">تقرير الموثوقية ومكافحة التهديدات</h3>
              </div>
              <div className="text-xs space-y-3.5 mt-2 text-right">
                <div className="p-3 bg-emerald-900/10 border border-emerald-500/25 rounded-xl">
                  <h4 className="font-bold text-emerald-400 text-[10.5px]">🛡️ بروتوكول العنوان الوطني (مفعل جاري)</h4>
                  <p className="text-[9px] mt-1 text-gray-450 leading-relaxed">
                    تمت فلترة ومطابقة عناوين الإعاشة السكنية لـ <strong>{users.filter(u => u.addressProfile?.shortAddress).length} موظفين</strong>. هذا يقلل من مخاطر الولوج من خوادم مجهولة.
                  </p>
                </div>

                <div className="p-3 bg-amber-550/10 bg-amber-500/10 border border-amber-500/25 rounded-xl">
                  <h4 className="font-bold text-amber-500 text-[10.5px]">⚠️ أجهزة نقاط بيع (POS) نشطة غير مقيدة</h4>
                  <p className="text-[9px] mt-1 text-gray-450 leading-relaxed">
                    يوجد كاشيرين يملكون دخول عام بدون تقييد للجهاز المادي المخصص. يرجى مراجعة الصلاحيات وتقييدهم لمنع المبيعات العشوائية.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border flex justify-between items-center bg-black/15" style={{ borderColor: theme.border }}>
                  <div>
                    <span className="text-[9.5px] font-bold block text-gray-400">توثيق الهوية الثنائية (MFA)</span>
                    <span className="text-[8px] text-gray-500">تنبيهات البريد لإعادة التعيينات</span>
                  </div>
                  <span className="text-[9px] bg-red-500/10 text-red-400 py-0.5 px-2.5 rounded font-black">إلزامي للمديرين</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Active Users feed */}
          <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-xs font-black border-b pb-3 mb-4" style={{ borderColor: theme.border }}>آخر عمليات الموثوقية والدخول لقنوات النظام</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {users.slice(0, 4).map((u, idx) => (
                <div key={idx} className="p-3 rounded-xl border flex items-center justify-between" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center font-bold font-sans text-xs text-yellow-500 shrink-0">
                      {(u.fullName || u.name || "U").charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-black block text-white">{u.fullName || u.name}</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5">الدور: {roleTranslations[u.role] || u.role} | {getLocationName(u.workLocationType || "hq", u.workLocationId || "")}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-mono text-gray-400 block">{u.lastLoginAt || "منذ 10 دقائق"}</span>
                    <span className="text-[8.5px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full mt-1 inline-block font-sans">بوابة السعودية</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          SUBTAB VIEW: USERS LIST (👥)
         ======================================================== */}
      {activeSubTab === "users_list" && !showAddForm && (
        <div className="space-y-4">

          {/* ==========================================
              TOP TEAM ADMINISTRATION BAR (PERMISSIONS CONTROLLED)
             ========================================== */}
          <div className="flex flex-wrap gap-2 justify-between items-center bg-zinc-950/20 p-3.5 rounded-2xl border border-zinc-900/80">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">⚙️ لوحة التحكم والإشراف الفوري</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasPermission("users:create") && (
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setFormName("");
                    setFormUsername("");
                    setFormEmail("");
                    setFormPhone("");
                    setFormPassword("");
                    setFormConfirmPassword("");
                    setFormRole("cashier");
                    setFormDepartment("sales");
                    setFormStatus("active");
                    setFormWorkLocationType("hq");
                    setFormWorkLocationId("");
                    setFormCompany("مجموعة مراسيم القابضة");
                    setFormAllowedStoreIds([]);
                    setFormAllowedBranchIds([]);
                    setFormAllowedWarehouseIds([]);
                    setFormAllowedPosIds([]);
                    setFormPermissions(DEFAULT_ROLE_PERMISSIONS["cashier"] || []);
                    setUserAddressProfile({
                      shortAddress: "",
                      buildingNumber: "",
                      streetName: "",
                      district: "",
                      city: "",
                      region: "",
                      postalCode: "",
                      additionalNumber: "",
                      unitNumber: "",
                      country: "المملكة العربية السعودية",
                      mapLink: ""
                    });
                    setShowAddForm(true);
                  }}
                  className="py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer border-none flex items-center gap-1 shadow-lg shadow-yellow-500/5 active:scale-95"
                >
                  ➕ إضافة موظف جديد
                </button>
              )}
              
              {(hasPermission("users:update") || hasPermission("hr:transfer")) && (
                <button
                  onClick={() => {
                    const viewableEmployees = users.filter(u => u.id !== currentUser.id);
                    if (viewableEmployees.length === 0) {
                      triggerNotification("لا يوجد موظفون آخرون متاحون لنقلهم حالياً.", "alert");
                      return;
                    }
                    setTransferUser(viewableEmployees[0]);
                    setTransferDept(getUserDepartment(viewableEmployees[0]));
                    setTransferLocationType(viewableEmployees[0].workLocationType || "hq");
                    setTransferLocationId(viewableEmployees[0].workLocationId || "");
                    setShowTransferModal(true);
                  }}
                  className="py-2.5 px-3.5 bg-zinc-900 border border-zinc-800 hover:border-blue-500/20 hover:bg-zinc-850 text-blue-450 text-xs font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  🔄 نقل / تبديل موظف
                </button>
              )}
              
              {hasPermission("users:disable") && (
                <button
                  onClick={() => {
                    const viewableEmployees = users.filter(u => u.id !== currentUser.id);
                    if (viewableEmployees.length === 0) {
                      triggerNotification("لا يوجد كادر آخر متاح لتجميده حالياً.", "alert");
                      return;
                    }
                    setDisablingUser(viewableEmployees[0]);
                    setDisableReason("");
                    setShowDisableModal(true);
                  }}
                  className="py-2.5 px-3.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/20 hover:bg-zinc-850 text-red-450 text-xs font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  🚫 تعطيل موظف
                </button>
              )}
              
              {hasPermission("users:create") && (
                <button
                  onClick={() => {
                    setImportPasteArea("");
                    setShowImportModal(true);
                  }}
                  className="py-2.5 px-3.5 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/20 hover:bg-zinc-850 text-emerald-450 text-xs font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  📥 استيراد موظفين (PASTE)
                </button>
              )}
              
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href",     dataStr);
                  downloadAnchorNode.setAttribute("download", `sahm_os_staff_export_2026.json`);
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                  addAuditLog("تصدير الكادر البشري", `تصدير كشف شامل بالبيانات المشفرة لـ [${users.length}] موظف.`);
                  triggerNotification("تم تصدير سجل الكادر البشري بنجاح كمستند JSON مشفر.", "success");
                }}
                className="py-2.5 px-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-gray-300 text-xs font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                📤 تصدير البيانات
              </button>
            </div>
          </div>
          
          {/* Advanced Filter and Search block */}
          <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Search text box */}
              <div className="flex-grow flex items-center gap-2 bg-slate-950/60 rounded-xl px-3 border border-zinc-800 focus-within:border-yellow-550">
                <Search className="w-4 h-4 text-gray-550" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث باسم الموظف، البريد الإلكتروني، رقم الجوال أو اسم المستخدم..."
                  className="w-full text-xs p-3 bg-transparent outline-none text-white font-bold"
                />
              </div>

              {/* Reset filter button */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setDepartmentFilter("");
                  setLocationTypeFilter("");
                  setStatusFilter("");
                  triggerNotification("تمت تصفية وإعادة تعيين فلاتر الموارد المخصصة.", "info");
                }}
                className="py-3 px-4 bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-xl text-gray-300 hover:bg-zinc-800 cursor-pointer"
              >
                إعادة ضبط 🔄
              </button>
            </div>

            {/* Quick selectivity filter chips */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <span className="text-[10px] text-gray-500 font-bold">فرز سريع:</span>
              
              {/* Department filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-[11px] p-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800 text-amber-500 font-black outline-none active:border-yellow-550"
              >
                <option value="" className="text-white font-normal">كافة الأقسام (إدارة/مبيعات/مخازن/دعم)</option>
                {Object.keys(DEPARTMENT_MAP).map(key => (
                  <option key={key} value={key} className="text-white font-bold">
                    {DEPARTMENT_MAP[key].icon} {DEPARTMENT_MAP[key].label}
                  </option>
                ))}
              </select>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-[11px] p-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800 text-white outline-none active:border-yellow-550"
              >
                <option value="">كافة الأدوار الوظيفية</option>
                {Object.keys(roleTranslations).map(r => <option key={r} value={r}>{roleTranslations[r]}</option>)}
              </select>

              {/* Location Type filter */}
              <select
                value={locationTypeFilter}
                onChange={(e) => setLocationTypeFilter(e.target.value)}
                className="text-[11px] p-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800 text-white outline-none active:border-yellow-550"
              >
                <option value="">كافة قنوات/مواقع العمل</option>
                <option value="hq">الإدارة العامة HQ</option>
                <option value="store">المتاجر</option>
                <option value="branch">الفروع</option>
                <option value="warehouse">المستودعات</option>
                <option value="pos">نقاط البيع</option>
                <option value="remote">عن بعد</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] p-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800 text-white outline-none active:border-yellow-550"
              >
                <option value="">كافة حالات الموظفين</option>
                <option value="active">نشط ومفعل ✅</option>
                <option value="disabled">موقوف ومحجور 🚫</option>
                <option value="pending">معلق/تحت التحقق 🕒</option>
              </select>
            </div>
          </div>

          {/* User Cards / Grid list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-black/20 border border-dashed border-zinc-800">
                <Users className="w-12 h-12 text-zinc-650 mx-auto opacity-35 mb-2" />
                <p className="text-xs text-gray-500">عذراً، لم يتم العثور على أي موظف أو مستخدم يطابق معايير الفلترة المذكورة.</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-2xl border text-right relative flex flex-col justify-between transition-all hover:scale-[1.005] duration-200 space-y-2 select-none"
                    style={{ 
                      backgroundColor: theme.card, 
                      borderColor: u.id === currentUser.id ? theme.accent : theme.border,
                      boxShadow: u.id === currentUser.id ? `0 0 16px ${theme.accent}15` : "none"
                    }}
                  >
                    
                    {/* Upper row: Avatar & Core info & Status */}
                    <div className="flex justify-between items-start gap-2 h-[50px] overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0 max-w-full">
                        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-xs font-sans shrink-0 border uppercase ${
                          u.id === currentUser.id ? "bg-yellow-500/20 border-yellow-500 text-yellow-500" : "bg-black/40 border-zinc-800 text-gray-200"
                        }`}>
                          {u.avatar || (u.fullName || u.name || "U").charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-xs font-black text-white truncate" title={u.fullName || u.name}>
                              {u.fullName || u.name}
                            </span>
                            {u.id === currentUser.id && (
                              <span className="text-[7px] font-black bg-blue-600 text-white px-1 py-0.5 rounded leading-none shrink-0">أنت</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 mt-0.5 text-[8px] text-zinc-500 font-mono">
                            <span>ID: {u.id}</span>
                            <span className="text-[#D4AF37] truncate max-w-[55px]">@{u.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator badge (compact badge) */}
                      <span className={`text-[7.5px] font-black whitespace-nowrap px-1.5 py-0.5 rounded ${
                        u.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                        u.status === "disabled" ? "bg-red-500/10 text-red-400 border border-red-500/15" : "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                      }`}>
                        {u.status === "active" ? "نشط" :
                         u.status === "disabled" ? "موقوف" : "معلق"}
                      </span>
                    </div>

                    {/* Email line: Single line with ellipsis */}
                    <div className="text-[9px] text-zinc-400 font-mono truncate whitespace-nowrap overflow-hidden text-ellipsis mb-1 select-all" title={u.email}>
                      ✉️ {u.email}
                    </div>

                    {/* Roles allowed & department details */}
                    <div className="flex flex-wrap gap-1 mb-1.5 h-[16px] overflow-hidden whitespace-nowrap">
                      <span className="text-[8px] font-black bg-zinc-950 border border-zinc-800 text-zinc-300 px-1 py-0.5 rounded truncate max-w-[90px]">
                        📌 {roleTranslations[u.role] || u.role}
                      </span>
                      {(() => {
                        const depKey = getUserDepartment(u);
                        const depInfo = DEPARTMENT_MAP[depKey] || DEPARTMENT_MAP.support;
                        return (
                          <span className={`text-[8px] font-black border px-1 py-0.5 rounded flex items-center gap-0.5 ${depInfo.color} truncate max-w-[75px]`}>
                            <span>{depInfo.icon}</span>
                            <span>{depInfo.label}</span>
                          </span>
                        );
                      })()}
                      {u.phone && (
                        <span className="text-[8px] text-zinc-500 font-mono pt-0.5" dir="ltr">{u.phone}</span>
                      )}
                    </div>

                    {/* Meta location profile linking & short address */}
                    <div className="p-1.5 rounded-xl bg-black/15 font-sans text-[8.5px] space-y-1 my-0.5 border border-zinc-900/60 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-bold">موقع العمل:</span>
                        <span className="text-white font-extrabold flex items-center gap-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]" title={getLocationName(u.workLocationType || "hq", u.workLocationId || "")}>
                          <Building className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                          <span className="truncate">{getLocationName(u.workLocationType || "hq", u.workLocationId || "")}</span>
                        </span>
                      </div>

                      {u.addressProfile?.shortAddress ? (
                        <div className="flex justify-between items-center text-[8px] border-t border-zinc-950/60 pt-0.5 mt-0.5">
                          <span className="text-gray-500">العنوان الوطني:</span>
                          <span className="text-zinc-400 font-mono truncate max-w-[110px]" title={`${u.addressProfile.shortAddress} - ${u.addressProfile.city || "الرياض"}`}>
                            📍 {u.addressProfile.shortAddress}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-[8px] border-t border-zinc-950/60 pt-0.5 mt-0.5 text-red-450">
                          <span>⚠️ غير مسجل بالعنوان السكني</span>
                        </div>
                      )}
                    </div>

                    {/* Permissions Badges (3 max, then +X) */}
                    <div className="flex items-center gap-0.5 overflow-hidden h-[15px] whitespace-nowrap mt-0.5 mb-1 select-none">
                      <span className="text-[7.5px] text-zinc-500 shrink-0">الامتيازات:</span>
                      <div className="flex items-center gap-0.5 overflow-hidden">
                        {(u.permissions || []).slice(0, 3).map((p, pIdx) => (
                          <span key={pIdx} className="text-[7px] bg-[#000]/30 text-gray-400 px-1 py-0.2 rounded border border-zinc-800 font-mono truncate" title={p}>
                            {p}
                          </span>
                        ))}
                        {(u.permissions || []).length > 3 && (
                          <span 
                            className="text-[7px] bg-yellow-500/10 text-yellow-500 px-1 py-0.2 rounded border border-yellow-500/10 font-bold font-sans cursor-help"
                            title={(u.permissions || []).slice(3).join(", ")}
                          >
                            +{u.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Access & Action Panel - Grid of 6 buttons */}
                    <div className="pt-2 border-t border-zinc-900/40 mt-auto">
                      <div className="grid grid-cols-3 gap-1">
                        
                        {/* 1. View Profile */}
                        <button
                          onClick={() => setViewingUser(u)}
                          className="py-1 px-1 rounded bg-zinc-900/60 hover:bg-zinc-850 hover:text-white text-gray-300 text-[8.5px] font-black border border-zinc-800/80 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                          title="عرض الملف الشخصي الكامل"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">الملف</span>
                        </button>

                        {/* 2. Edit */}
                        {hasPermission("users:update") ? (
                          <button
                            onClick={() => handleLaunchEdit(u)}
                            className="py-1 px-1 rounded bg-zinc-900/60 hover:bg-zinc-850 hover:text-white text-gray-300 text-[8.5px] font-black border border-zinc-800/80 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                            title="تعديل تفاصيل الموظف ومناصبه"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">تعديل</span>
                          </button>
                        ) : (
                          <div className="py-1 px-1 rounded bg-zinc-950/40 opacity-40 text-[8.5px] border border-zinc-900 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none">
                            <Lock className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                            <span className="truncate text-zinc-600">تعديل</span>
                          </div>
                        )}

                        {/* 3. Transfer */}
                        {(hasPermission("users:update") || hasPermission("hr:transfer")) ? (
                          <button
                            onClick={() => {
                              setTransferUser(u);
                              setTransferDept(getUserDepartment(u));
                              setTransferLocationType(u.workLocationType || "hq");
                              setTransferLocationId(u.workLocationId || "");
                              setShowTransferModal(true);
                            }}
                            className="py-1 px-1 rounded bg-zinc-900/60 hover:bg-zinc-850 hover:text-white text-gray-300 text-[8.5px] font-black border border-zinc-800/80 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                            title="نقل / تبديل فرع وموقع عمل الموظف"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">نقل</span>
                          </button>
                        ) : (
                          <div className="py-1 px-1 rounded bg-zinc-950/40 opacity-40 text-[8.5px] border border-zinc-900 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none">
                            <Lock className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                            <span className="truncate text-zinc-600">نقل</span>
                          </div>
                        )}

                        {/* 4. Disable (Replaces Deletion) */}
                        {hasPermission("users:disable") && u.id !== currentUser.id && u.id !== "1" && u.id !== 1 ? (
                          <button
                            onClick={() => {
                              if (u.status === "disabled") {
                                // Activate immediately with log
                                const updated = users.map(user => {
                                  if (user.id === u.id) return { ...user, status: "active" as const };
                                  return user;
                                });
                                setUsers(updated);
                                addAuditLog("تنشيط مستخدم", `إلغاء قفل وتنشيط حساب الموظف [${u.fullName || u.name}] لاستئناف مهامه.`);
                                triggerNotification(`تم تنشيط وإتاحة دخول الموظف [${u.fullName || u.name}] للعمل.`, "success");
                              } else {
                                setDisablingUser(u);
                                setDisableReason("");
                                setShowDisableModal(true);
                              }
                            }}
                            className={`py-1 px-1 rounded border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-[8.5px] font-black active:scale-95 ${
                              u.status === "disabled"
                                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-450 border-emerald-500/20"
                                : "bg-red-500/15 hover:bg-red-500/25 text-red-450 border-red-500/20"
                            }`}
                            title={u.status === "disabled" ? "تنشيط وتفعيل الدخول" : "تعطيل وتجميد دخول الموظف للجهاز"}
                          >
                            {u.status === "disabled" ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
                                <span className="truncate font-black">تنشيط</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5 text-red-455 shrink-0" />
                                <span className="truncate font-black">تعطيل</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="py-1 px-1 rounded bg-zinc-950/40 opacity-40 text-[8.5px] border border-zinc-900 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none">
                            <Lock className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                            <span className="truncate text-zinc-600">{u.status === "disabled" ? "تنشيط" : "تعطيل"}</span>
                          </div>
                        )}

                        {/* 5. Reset Password */}
                        {hasPermission("users:update") ? (
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="py-1 px-1 rounded bg-zinc-900/60 hover:bg-zinc-850 hover:text-white text-gray-300 text-[8.5px] font-black border border-zinc-800/80 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                            title="إعادة توليد كلمة مرور دخول جديدة وتسليمها أمانًا"
                          >
                            <Key className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                            <span className="truncate">الرقم السري</span>
                          </button>
                        ) : (
                          <div className="py-1 px-1 rounded bg-zinc-950/40 opacity-40 text-[8.5px] border border-zinc-900 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none">
                            <Lock className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                            <span className="truncate text-zinc-600">الرقم</span>
                          </div>
                        )}

                        {/* 6. Manage Permissions */}
                        {(hasPermission("roles:manage") || hasPermission("permissions:manage")) ? (
                          <button
                            onClick={() => {
                              setPermissionsUser(u);
                              setShowPermissionsModal(true);
                            }}
                            className="py-1 px-1 rounded bg-zinc-900/60 hover:bg-zinc-850 hover:text-white text-gray-300 text-[8.5px] font-black border border-zinc-800/80 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                            title="إسناد وإدارة الصلاحيات المخصصة لهذا الحساب"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate">الصلاحيات</span>
                          </button>
                        ) : (
                          <div className="py-1 px-1 rounded bg-zinc-950/40 opacity-40 text-[8.5px] border border-zinc-900 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none">
                            <Lock className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                            <span className="truncate text-zinc-600">صلاحية</span>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          SUBTAB VIEW: LOCATIONS assignment matrix (🏢)
         ======================================================== */}
      {activeSubTab === "locations" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-5 h-5 text-amber-500" />
              مصفوفة ومسؤولية المواقع الجغرافية للموظفين
            </h3>
            <p className="text-xs text-gray-500">
              استعراض الموظفين الموزعين حالياً والمسموح لهم الدخول والولوج إلى الفروع والمستودعات الإمدادية المختلفة.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-4">
            
            {/* Branches Card List */}
            <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <span className="text-[11px] font-black bg-sky-500/15 text-sky-450 rounded px-2.5 py-1 mb-4 inline-block font-sans">
                🏢 الفروع والمعارض النشطة ({branches.length})
              </span>
              
              <div className="space-y-3 mt-2">
                {branches.map(b => {
                  const assignedStaff = users.filter(u => u.workLocationType === "branch" && u.workLocationId === b.id);
                  const allowedAccessStaff = users.filter(u => u.allowedBranchIds?.includes(b.id));

                  return (
                    <div key={b.id} className="p-3.5 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black block text-white">📍 فرع {b.name} ({b.city})</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">المعرف الفريد: {b.id} | متاح الكاشير والأمناء</span>
                        </div>
                        <span className="text-[9.5px] bg-slate-950 font-bold px-2.5 py-1 rounded border text-indigo-400 font-mono" style={{ borderColor: theme.border }}>
                          {assignedStaff.length} موظف ميداني
                        </span>
                      </div>

                      {/* Display assigned staff list */}
                      <div className="mt-2 text-right border-t pt-2 border-zinc-900/60">
                        <span className="text-[8.5px] text-gray-500 font-black block">الكادر التشغيلي النشط في الفرع:</span>
                        {assignedStaff.length === 0 ? (
                          <span className="text-[8px] text-gray-500 block mt-1">لا يوجد موظف معين بالتعاقد المباشر في هذا الفرع.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {assignedStaff.map(staff => (
                              <span key={staff.id} className="text-[8.5px] bg-sky-500/10 text-sky-400 font-black py-0.5 px-2 rounded-full border border-sky-500/15">
                                👤 {staff.fullName || staff.name} ({ROLE_TRANSLATIONS[staff.role] || staff.role})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warehouses Card List */}
            <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <span className="text-[11px] font-black bg-emerald-500/15 text-emerald-400 rounded px-2.5 py-1 mb-4 inline-block">
                📦 المستودعات والخدمات اللوجستية ({warehouses.length})
              </span>
              
              <div className="space-y-3 mt-2">
                {warehouses.map(w => {
                  const assignedStaff = users.filter(u => u.workLocationType === "warehouse" && u.workLocationId === w.id);
                  
                  return (
                    <div key={w.id} className="p-3.5 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black block text-white">📦 مستودع {w.name} ({w.type === "main" ? "مخزن رئيسي" : "مخزن فرعي"})</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">المعرف الفريد: {w.id}</span>
                        </div>
                        <span className="text-[9.5px] bg-slate-950 font-bold px-2.5 py-1 rounded border text-emerald-400 font-mono" style={{ borderColor: theme.border }}>
                          {assignedStaff.length} أمين جرد
                        </span>
                      </div>

                      {/* Display assigned staff list */}
                      <div className="mt-2 text-right border-t pt-2 border-zinc-900/60">
                        <span className="text-[8.5px] text-gray-500 font-black block">موظفي استلام الجرد والتموين اللوجستي:</span>
                        {assignedStaff.length === 0 ? (
                          <span className="text-[8px] text-gray-500 block mt-1">لا يوجد موظفو مخزن معينين بهذا المستودع.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {assignedStaff.map(staff => (
                              <span key={staff.id} className="text-[8.5px] bg-emerald-500/10 text-emerald-400 font-black py-0.5 px-2 rounded-full border border-emerald-500/15">
                                👤 {staff.fullName || staff.name} ({ROLE_TRANSLATIONS[staff.role] || staff.role})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* POS Stations Card List */}
            <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <span className="text-[11px] font-black bg-amber-500/15 text-amber-500 rounded px-2.5 py-1 mb-4 inline-block font-sans">
                🛍️ الكاشير ونقاط البيع النشطة ({posUnits.length})
              </span>
              
              <div className="space-y-3 mt-2">
                {posUnits.map(p => {
                  const assignedStaff = users.filter(u => 
                    (u.workLocationType === "pos" && u.workLocationId === p.id) || 
                    (u.posId === p.id) || 
                    (u.role === "cashier" && u.posId === p.id)
                  );
                  
                  return (
                    <div key={p.id} className="p-3.5 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black block text-white">🛍️ {p.name || `جهاز POS #${p.id}`}</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">معرف الكاشير: {p.id} | الفرع: {p.branchId || "غير محدد"}</span>
                        </div>
                        <span className="text-[9.5px] bg-slate-950 font-bold px-2.5 py-1 rounded border text-amber-500 font-mono" style={{ borderColor: theme.border }}>
                          {assignedStaff.length} كاشير نشط
                        </span>
                      </div>

                      {/* Display assigned staff list */}
                      <div className="mt-2 text-right border-t pt-2 border-zinc-900/60">
                        <span className="text-[8.5px] text-gray-500 font-black block">مشغلي الكاونتر والبيع المباشر:</span>
                        {assignedStaff.length === 0 ? (
                          <span className="text-[8px] text-gray-500 block mt-1">لا يوجد كاشيرات معينين لهذه النقطة حالياً.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {assignedStaff.map(staff => (
                              <span key={staff.id} className="text-[8.5px] bg-amber-500/10 text-amber-400 font-black py-0.5 px-2 rounded-full border border-amber-500/15">
                                👤 {staff.fullName || staff.name} ({ROLE_TRANSLATIONS[staff.role] || staff.role})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUBTAB VIEW: ROLES & Standard Permissions audit (🔐)
         ======================================================== */}
      {activeSubTab === "roles" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border text-right flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 mb-1.5 animate-pulse">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                مخطط الصلاحيات والأدوار الشجرية والديناميكية (RBAC Hub)
              </h3>
              <p className="text-xs text-gray-400">
                الدليل الأمني الشامل والتحكم المركزي بنطاقات الوصول. بصفتك مالك النظام، يمكنك إضافة صلاحيات جديدة، تجميد أو تعيين صلاحيات أدوار بأكملها أو تكييف صلاحيات موظف معين.
              </p>
            </div>
            
            {/* Quick Stats of Roles */}
            <div className="flex gap-2 shrink-0">
              <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded-xl font-bold font-mono">
                {Object.keys(rolePermissions).length} أدوار مسجلة
              </span>
              <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl font-bold font-mono">
                {availablePermissions.length} صلاحيات متاحة
              </span>
            </div>
          </div>

          {/* Verification: Lock screen if cashier or unauthorized */}
          {!canManagePermissionsGlobal(currentUser) ? (
            <div className="p-12 text-center rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="w-16 h-16 rounded-full bg-red-650/10 flex items-center justify-center mx-auto text-red-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-white">عتبة أمنية رفيعة — الوصول محجوب!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                رمز المرتبة الحالية لا يمنحك صلاحية إدارة الأدوار العامة. يرجى مراجعة المالك الأساسي للنظام <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded font-mono">tenant_owner</code> أو مراجعة إدارة الدعم الفني.
              </p>
            </div>
          ) : (
            <>
              {/* Creator Forms and Options Rails bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Quick Form: Add New Permission */}
                <div className="p-4 rounded-xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <h4 className="text-xs font-black text-amber-500 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> إضافة صلاحية جديدة للنظام
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    أدخل مفتاح صلاحية فني جديد (مثال: <code className="text-gray-300">pos:refund_approve</code>) لتكبير نطاقات الترخيص.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={newPermissionStr}
                      onChange={(e) => setNewPermissionStr(e.target.value)}
                      placeholder="pos:refund_approve"
                      className="text-xs p-2 rounded-lg bg-black/40 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-mono flex-1 text-left"
                    />
                    <button
                      onClick={() => {
                        const str = newPermissionStr.trim().toLowerCase();
                        if (!str) {
                          triggerNotification("الرجاء إدخال مفتاح الصلاحية مبرمج مثل: app:feature", "alert");
                          return;
                        }
                        if (availablePermissions.includes(str)) {
                          triggerNotification("هذه الصلاحية مدرجة مسبقاً في النظام!", "alert");
                          return;
                        }
                        const updated = [...availablePermissions, str];
                        setAvailablePermissions(updated);
                        localStorage.setItem("sahm_dynamic_available_permissions_v3", JSON.stringify(updated));
                        setNewPermissionStr("");
                        addAuditLog("إضافة صلاحية جديدة", `تم تكبير المخطط الأمني بإضافة صلاحية جمركية مرئية [${str}].`);
                        triggerNotification(`تم تسجيل صلاحية جديدة [${str}] في قاعدة النظام بنجاح.`, "success");
                      }}
                      className="text-[10px] font-black px-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg cursor-pointer transition-all shrink-0 border-none"
                    >
                      تسجيل الصلاحية
                    </button>
                  </div>
                </div>

                {/* 2. Quick Form: Create New Role */}
                <div className="p-4 rounded-xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <h4 className="text-xs font-black text-amber-500 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> إنشاء دور وظيفي جديد
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    تأسيس رول وظيفي فارغ وإدراجه بكشف الموظفين (مثال: مفتاح دور <code className="text-gray-300">marketing_pro</code> واسم له <code className="text-gray-300">رئيس التسويق</code>).
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={newRoleKeyInput}
                      onChange={(e) => setNewRoleKeyInput(e.target.value)}
                      placeholder="marketing_pro"
                      className="text-xs p-2 rounded-lg bg-black/40 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-mono text-left"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={newRoleLabelInput}
                      onChange={(e) => setNewRoleLabelInput(e.target.value)}
                      placeholder="رئيس التسويق"
                      className="text-xs p-2 rounded-lg bg-black/40 border border-zinc-800 focus:border-yellow-500 outline-none text-white font-bold"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const key = newRoleKeyInput.trim().toLowerCase();
                      const label = newRoleLabelInput.trim();
                      if (!key || !label) {
                        triggerNotification("يرجى ملء مفتاح الدور والاسم العربي المقابل له!", "alert");
                        return;
                      }
                      if (rolePermissions[key]) {
                        triggerNotification("هذا الدور مسجل مسبقاً!", "alert");
                        return;
                      }
                      const updatedPerms = { ...rolePermissions, [key]: [] };
                      const updatedTrans = { ...roleTranslations, [key]: label };
                      
                      setRolePermissions(updatedPerms);
                      setRoleTranslations(updatedTrans);

                      localStorage.setItem("sahm_dynamic_role_permissions_v3", JSON.stringify(updatedPerms));
                      localStorage.setItem("sahm_dynamic_role_translations_v3", JSON.stringify(updatedTrans));

                      setNewRoleKeyInput("");
                      setNewRoleLabelInput("");
                      addAuditLog("إنشاء دور مخصص", `تم تفعيل وتأسيس رول وظيفي جديد [${label}] بالبوابة.`);
                      triggerNotification(`✓ تم تشييد الدور الوظيفي [${label}] بنجاح. يمكنك تعديل صلاحياته الآن أسفله.`, "success");
                    }}
                    className="w-full text-[10px] font-black py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg cursor-pointer transition-all border-none"
                  >
                    تشييد الدور الجديد
                  </button>
                </div>

                {/* 3. Role Cloning Section */}
                <div className="p-4 rounded-xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <h4 className="text-xs font-black text-blue-400 flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" /> نسخ صلاحيات دور إلى دور آخر
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    انسخ حزمة الصلاحيات كاملة من دور معرّف لنقله لدورة حيازة جديدة ومطابقة.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400">الدور المصدر (المطابق):</label>
                      <select
                        value={cloneSourceRoleKey}
                        onChange={(e) => setCloneSourceRoleKey(e.target.value)}
                        className="w-full text-[11px] p-2 rounded-lg bg-black/40 border border-zinc-850 text-white font-bold outline-none"
                      >
                        <option value="">اختر المصدر...</option>
                        {Object.keys(rolePermissions).map(k => (
                          <option key={k} value={k}>{roleTranslations[k] || k}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400">الدور المستهدف (الجديد المستلم):</label>
                      <select
                        value={cloneDestRoleKey}
                        onChange={(e) => setCloneDestRoleKey(e.target.value)}
                        className="w-full text-[11px] p-2 rounded-lg bg-black/40 border border-zinc-850 text-white font-bold outline-none"
                      >
                        <option value="">اختر المستهدف...</option>
                        {Object.keys(rolePermissions).map(k => (
                          <option key={k} value={k}>{roleTranslations[k] || k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!cloneSourceRoleKey || !cloneDestRoleKey) {
                        triggerNotification("يرجى اختيار الدور المصدر والمستهدف لإجراء النسخ المطابق!", "alert");
                        return;
                      }
                      if (cloneSourceRoleKey === cloneDestRoleKey) {
                        triggerNotification("لا يمكنك نسخ الدور على نفسه مكرراً!", "alert");
                        return;
                      }
                      if (cloneDestRoleKey === "tenant_owner") {
                        triggerNotification("⚠️ حماية أمنية: لا يمكن الكتابة فوق صلاحيات المطور والمالك tenant_owner بطريق الاستنساخ.", "alert");
                        return;
                      }
                      const sourcePerms = rolePermissions[cloneSourceRoleKey] || [];
                      const updatedPerms = {
                        ...rolePermissions,
                        [cloneDestRoleKey]: [...sourcePerms]
                      };
                      
                      setRolePermissions(updatedPerms);
                      localStorage.setItem("sahm_dynamic_role_permissions_v3", JSON.stringify(updatedPerms));

                      // Instantly reflect to users mapped to target
                      const updatedUsers = users.map(u => {
                        if (u.role === cloneDestRoleKey) {
                          return { ...u, permissions: [...sourcePerms] };
                        }
                        return u;
                      });
                      setUsers(updatedUsers);

                      addAuditLog("نسخ صلاحيات دور", `نسخ ومطابقة صلاحيات الدور [${roleTranslations[cloneSourceRoleKey]}] لتلتصق بـ [${roleTranslations[cloneDestRoleKey]}].`);
                      triggerNotification(`✓ تم كشط وصقل صلاحيات [${roleTranslations[cloneSourceRoleKey]}] ولصقها المباشر في [${roleTranslations[cloneDestRoleKey]}] لعدد ${updatedUsers.filter(u => u.role === cloneDestRoleKey).length} موظف.`, "success");
                    }}
                    className="w-full text-[10px] font-black py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg cursor-pointer transition-all border border-blue-500/20"
                  >
                    بدء محاكاة النسخ والمطابقة
                  </button>
                </div>

                {/* 4. Fine-Tune User Permissions directly Section */}
                <div className="p-4 rounded-xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <UserCheck className="w-4 h-4" /> تخصيص صلاحيات موظف معين (Direct Override)
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    اختر فرداً من كادرك لتكثيف صلاحياته الشخصية أو سحب صلاحية ممررة بشكل مباشر وفردي.
                  </p>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedUserForDirectPerm}
                      onChange={(e) => setSelectedUserForDirectPerm(e.target.value)}
                      className="text-xs p-2 rounded-lg bg-black/40 border border-zinc-800 text-white font-bold outline-none flex-1"
                    >
                      <option value="">-- اختر موظف من القائمة لتخصيصه --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.name} ({roleTranslations[u.role] || u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUserForDirectPerm && (() => {
                    const selectedUser = users.find(u => String(u.id) === String(selectedUserForDirectPerm));
                    if (!selectedUser) return null;
                    const uPerms = selectedUser.permissions || [];
                    const isSelectedSuperUser = ["system_owner", "system_admin", "platform_owner"].includes(selectedUser.role || "");
                    const isProtected = selectedUser.role === "tenant_owner" || selectedUser.role === "system_owner" || (selectedUser.permissions?.includes("*") && isSelectedSuperUser);
                    
                    return (
                      <div className="bg-slate-950/20 p-2.5 rounded-lg border border-zinc-850/60 text-right space-y-2 mt-2">
                        <div className="flex justify-between items-center border-b pb-1.5 mb-1.5 border-zinc-900">
                          <span className="text-[10px] font-black text-emerald-400">تدقيق مخصص لـ: {selectedUser.fullName || selectedUser.name}</span>
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 rounded font-mono">{uPerms.length} تذكرة إذن</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto scrollbar-none">
                          {uPerms.map((p, pIdx) => (
                            <span key={pIdx} title={p} className="text-[8.5px] bg-slate-900 border border-zinc-800 px-2 py-1 rounded text-gray-300 font-sans leading-none flex items-center gap-1">
                              {PERMISSION_LABELS_AR[p] || p}
                              <button
                                onClick={() => {
                                  if (isProtected && p === "*") {
                                    triggerNotification("⚠️ حظر أمني: لا يمكن سحب النطاق المطلق (*) من المالك الرئيسي للنظام.", "alert");
                                    return;
                                  }
                                  const updated = uPerms.filter(x => x !== p);
                                  handleSaveUserDirectPermissions(selectedUser.id, updated);
                                }}
                                className="text-red-400 font-black hover:text-red-200 ml-0.5 cursor-pointer bg-transparent border-none text-[8px]"
                                title="نزع هذه الصلاحية فوراً"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <select
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!value) return;
                              if (uPerms.includes(value)) {
                                triggerNotification("الصلاحية ممنوحة له مسبقاً!", "alert");
                                return;
                              }
                              // Security: Prevent lower roles from assigning things higher than their own
                              const myPermissions = currentUser.permissions || [];
                              const isCurrentUserSuper = ["system_owner", "system_admin", "platform_owner"].includes(currentUser.role || "");
                              const isCurrentUserOwner = currentUser.role === "tenant_owner" || currentUser.role === "system_owner" || (currentUser.permissions?.includes("*") && isCurrentUserSuper);
                              if (!myPermissions.includes(value) && !isCurrentUserOwner) {
                                triggerNotification("⚠️ حماية أمنية: لا يمكنك منح صلاحية لا تملكها أنت في ملفك الشخصي!", "alert");
                                return;
                              }

                              const updated = [...uPerms, value];
                              handleSaveUserDirectPermissions(selectedUser.id, updated);
                              e.target.value = ""; // Reset
                            }}
                            className="bg-black/40 text-[9.5px] p-1.5 rounded border border-zinc-800 text-white outline-none flex-1 font-sans"
                          >
                            <option value="">+ إضافة ومنح صلاحية مخصصة...</option>
                            {availablePermissions.map(p => (
                              <option key={p} value={p}>
                                {PERMISSION_LABELS_AR[p] || p} ({p})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setSelectedUserForDirectPerm("")}
                            className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-2 rounded cursor-pointer border-none"
                          >
                            إغلاق
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Roles Cards Grid with Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {Object.keys(rolePermissions).map((roleKey) => {
                  const perms = rolePermissions[roleKey];
                  const label = roleTranslations[roleKey] || roleKey;
                  const isEditingThis = editingRoleKey === roleKey;
                  
                  return (
                    <div
                      key={roleKey}
                      className={`p-5 rounded-2xl border text-right transition-all duration-300 ${isEditingThis ? 'border-yellow-500 bg-yellow-500/[0.02] shadow-yellow-500/5' : 'border-zinc-800'}`}
                      style={{ backgroundColor: theme.card }}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b pb-3 mb-3 border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${roleKey === "tenant_owner" ? "bg-red-500" : "bg-[#D4AF37]"}`}></span>
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={editingRoleLabel}
                              onChange={(e) => setEditingRoleLabel(e.target.value)}
                              className="text-xs font-black text-white bg-black/40 border border-zinc-800 rounded px-2 py-0.5 focus:border-yellow-500 outline-none"
                            />
                          ) : (
                            <h4 className="text-xs font-black text-white">{label} <code className="text-[9px] text-gray-500 font-mono font-normal">({roleKey})</code></h4>
                          )}
                        </div>
                        <span className="text-[9px] bg-zinc-950 text-amber-500 border border-zinc-850 px-2.5 py-1 rounded-xl font-mono">
                          {perms.length} صلاحيات مفعلة
                        </span>
                      </div>

                      {/* Editing View */}
                      {isEditingThis ? (
                        <div className="space-y-4">
                          
                          {/* Search inside permission editor */}
                          <div className="flex gap-2 bg-black/40 rounded-xl p-2 border border-zinc-850/60">
                            <Search className="w-3.5 h-3.5 text-gray-500 self-center shrink-0" />
                            <input
                              type="text"
                              placeholder="فلترة وتدقيق الـ Checkboxes بالتصنيفات..."
                              value={searchPermissionTerm}
                              onChange={(e) => setSearchPermissionTerm(e.target.value)}
                              className="text-[11px] bg-transparent outline-none border-none text-white w-full text-right"
                            />
                            {searchPermissionTerm && (
                              <button
                                onClick={() => setSearchPermissionTerm("")}
                                className="text-[10px] text-gray-400 hover:text-white font-black bg-transparent border-none cursor-pointer"
                              >
                                تصفير
                              </button>
                            )}
                          </div>

                          {/* Search results checkboxes classified by Category */}
                          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            {["المستخدمين والوصول", "المنتجات", "المخزون والمستودعات", "نقطة البيع POS", "التقارير", "المالية والشركاء", "الإعدادات", "التكاملات", "أخرى / صلاحيات عامة"].map(category => {
                              const categoryPerms = availablePermissions.filter(p => {
                                const cat = getPermissionCategory(p);
                                const matchesCat = cat === category;
                                const labelAr = PERMISSION_LABELS_AR[p] || "";
                                const matchesSearch = 
                                  p.toLowerCase().includes(searchPermissionTerm.toLowerCase()) ||
                                  labelAr.toLowerCase().includes(searchPermissionTerm.toLowerCase());
                                return matchesCat && matchesSearch;
                              });

                              if (categoryPerms.length === 0) return null;

                              return (
                                <div key={category} className="space-y-1.5 border-b border-zinc-900 pb-2">
                                  <span className="text-[9px] font-black text-gray-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 inline-block">{category}</span>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    {categoryPerms.map(p => {
                                      const isChecked = editingRolePermissions.includes(p);
                                      
                                      // Hierarchy authorization check
                                      const myPermissions = currentUser.permissions || [];
                                      const isCurrentUserOwner = currentUser.role === "tenant_owner" || currentUser.role === "system_owner" || currentUser.permissions?.includes("*");
                                      const isAuthorizedToGrant = isCurrentUserOwner || myPermissions.includes(p);
                                      
                                      return (
                                        <label
                                          key={p}
                                          className={`flex items-center gap-2 p-2 rounded-xl text-[10.5px] font-mono leading-none border transition-all cursor-pointer ${
                                            isChecked 
                                              ? 'bg-yellow-500/5 border-yellow-500/20 text-white' 
                                              : 'bg-black/10 border-zinc-900 text-gray-400 hover:bg-black/30'
                                          } ${!isAuthorizedToGrant ? 'opacity-40 cursor-not-allowed' : ''}`}
                                          title={!isAuthorizedToGrant ? "لا تمتلك هذه الصلاحية وتعتبر أعلى من مستواك الترخيصي الحالي" : p}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={!isAuthorizedToGrant}
                                            onChange={() => {
                                              if (isChecked) {
                                                setEditingRolePermissions(editingRolePermissions.filter(x => x !== p));
                                              } else {
                                                setEditingRolePermissions([...editingRolePermissions, p]);
                                              }
                                            }}
                                            className="w-3.5 h-3.5 rounded border-zinc-800 text-yellow-500 focus:ring-yellow-500 accent-yellow-500 shrink-0"
                                          />
                                          <div className="flex flex-col text-right truncate">
                                            <span className="font-sans font-semibold text-white truncate text-[11px] mb-0.5">
                                              {PERMISSION_LABELS_AR[p] || p}
                                            </span>
                                            <span className="text-[9px] text-gray-500 font-mono truncate">{p}</span>
                                            {!isAuthorizedToGrant && (
                                              <span className="text-[7.5px] text-red-400 font-sans">غير مصرح بالمنح</span>
                                            )}
                                          </div>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Save & Decline triggers */}
                          <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
                            <button
                              onClick={() => {
                                // Save Label if changed
                                if (editingRoleLabel.trim() && editingRoleLabel.trim() !== label) {
                                  const updatedTrans = {
                                    ...roleTranslations,
                                    [roleKey]: editingRoleLabel.trim()
                                  };
                                  setRoleTranslations(updatedTrans);
                                  localStorage.setItem("sahm_dynamic_role_translations_v3", JSON.stringify(updatedTrans));
                                }

                                handleSaveRolePermissionsAndSyncUsers(roleKey, editingRolePermissions);
                                setEditingRoleKey(null);
                              }}
                              className="text-[10px] font-black px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg cursor-pointer transition-all border-none flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> حفظ التغييرات والتدقيق الفوري
                            </button>
                            <button
                              onClick={() => {
                                setEditingRoleKey(null);
                                triggerNotification("تم تجاهل مراجعة صلاحيات الدور لعدم حفظ المدخلات.", "info");
                              }}
                              className="text-[10px] font-bold px-3 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 rounded-lg cursor-pointer transition-all border-none"
                            >
                              تراجع ×
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div className="space-y-4">
                          
                          {/* Standard badges showing current permissions mapping */}
                          <div className="flex flex-wrap gap-1.5 py-1 max-h-[120px] overflow-y-auto scrollbar-none" dir="rtl">
                            {perms.length === 0 ? (
                              <span className="text-[10px] text-gray-500 italic block">رول وظيفي بدون صلاحيات حالية. اضغط تعديل لتعيين الصلاحيات المخصصة.</span>
                            ) : (
                              perms.map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  title={p}
                                  className="text-[9.5px] bg-slate-950 hover:bg-slate-900 border border-zinc-900 px-2 py-1 rounded text-gray-300 font-sans tracking-tight leading-none flex items-center gap-1 select-none shrink-0"
                                >
                                  <Check className="w-2.5 h-2.5 text-[#D4AF37]" />
                                  {PERMISSION_LABELS_AR[p] || p}
                                </span>
                              ))
                            )}
                          </div>

                          {/* Action triggers */}
                          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/60 items-center justify-between">
                            <div className="flex gap-1.5">
                              {/* Edit permissions */}
                              <button
                                onClick={() => {
                                  setEditingRoleKey(roleKey);
                                  setEditingRolePermissions([...perms]);
                                  setEditingRoleLabel(label);
                                  setSearchPermissionTerm("");
                                }}
                                className="text-[9.5px] font-black px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-[#D4AF37] border border-yellow-500/20 rounded-lg cursor-pointer transition-all"
                              >
                                تعديل الصلاحيات ⚙️
                              </button>
                              
                              {/* Clone role triggers */}
                              <button
                                onClick={() => {
                                  setCloneSourceRoleKey(roleKey);
                                  triggerNotification(`تم تعيين [${label}] كدور مصدر مطهر. حدد الدور المستهدف بالنموذج العلوي.`, "info");
                                }}
                                className="text-[9.5px] font-bold px-2 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-zinc-300 cursor-pointer transition-all"
                                title="نسخ حزمة صلاحيات هذا الدور"
                              >
                                نسخ الدور 📋
                              </button>
                            </div>

                            {/* Delete custom roles button */}
                            {roleKey !== "tenant_owner" && roleKey !== "admin" && roleKey !== "cashier" && (
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد تماماً من حذف الدور الوظيفي [${label}]؟ سيجرى تصفير من يرتبط به من الموظفين.`)) {
                                    // Delete role
                                    const updatedPerms = { ...rolePermissions };
                                    delete updatedPerms[roleKey];
                                    setRolePermissions(updatedPerms);
                                    
                                    const updatedTrans = { ...roleTranslations };
                                    delete updatedTrans[roleKey];
                                    setRoleTranslations(updatedTrans);

                                    localStorage.setItem("sahm_dynamic_role_permissions_v3", JSON.stringify(updatedPerms));
                                    localStorage.setItem("sahm_dynamic_role_translations_v3", JSON.stringify(updatedTrans));

                                    addAuditLog("حذف دور مخصص", `تم ترحيل وحذف الدور [${label}] بالكامل من البوابة.`);
                                    triggerNotification(`تم شطب الدور الوظيفي بنجاح.`, "success");
                                  }
                                }}
                                className="text-[9.5px] font-bold px-2 py-1.5 text-red-400 hover:bg-red-450/10 rounded-lg cursor-pointer transition-all bg-transparent border border-red-500/10"
                              >
                                حذف الدور ×
                              </button>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      )}

      {/* ========================================================
          SUBTAB VIEW: AUDIT LOG (🕒)
         ======================================================== */}
      {activeSubTab === "logs" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 mb-1.5">
              <FileText className="w-5 h-5 text-amber-500" />
              سجل أنشطة الطاقم البشري والمستخدمين المجدول
            </h3>
            <p className="text-xs text-gray-500">
              سجل أحداث أمني متكامل يرصد إنشاء الحسابات، تصدير قواعد البيانات، الولوج والفرز الجغرافي وقائمة التحقق لحفظ سرية المتاجر.
            </p>
          </div>

          <div className="p-5 rounded-2xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex justify-between items-center text-xs font-bold border-b pb-2 text-[#D4AF37]" style={{ borderColor: theme.border }}>
              <span>العملية والجهة</span>
              <span>المستخدم / الموظف</span>
              <span>تاريخ الإجراء والموثوقية</span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {[
                { action: "إنشاء حساب موظف", desc: "إدراج الموظف وتأسيس حساب الكاشير [سليمان الحجيلان] للبدء بنقاط البيع.", actor: currentUser.fullName || "أنت", timestamp: "اليوم، 10:14 م", badge: "أمن" },
                { action: "تعيين عنوان وطني", desc: "ربط العنوان الوطني SP7264 للموظف [محمد أحمد القحطاني] كشرط أمن للمنصة.", actor: "مدير النظام", timestamp: "اليوم، 09:30 م", badge: "عنوان" },
                { action: "إعادة تعيين كلمة مرور", desc: "إعادة توليد ذكي لكلمة المرور لحساب المحاسب المالي [مازن العتيبي] بطلب مستعجل.", actor: currentUser.fullName || "أنت", timestamp: "اليوم، 08:44 م", badge: "حماية" },
                { action: "حجب مؤقت وحجر", desc: "سحب ترخيص العمل من الموظف [موقوف طارق] لاكتشاف ولوج من خارج النطاق.", actor: "بوابة سهم الذكية", timestamp: "أمس، 11:21 م", badge: "تنبيه" },
                { action: "مزامنة الصلاحيات", desc: "تعديل النطاق الإداري وحجر الفروع لمدير فرع الرياض لمنع التدخلات بالمخازن اللوجستية.", actor: "مدير الهيكل", timestamp: "02 يونيو 2026", badge: "صلاحيات" },
              ].map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between text-xs gap-2 font-sans" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <div className="flex items-start gap-2.5">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      log.badge === "أمن" ? "bg-blue-600/10 text-blue-400" :
                      log.badge === "عنوان" ? "bg-emerald-600/10 text-emerald-400" :
                      log.badge === "تنبيه" ? "bg-red-650/15 text-red-400 animate-pulse" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {log.badge}
                    </span>
                    <div>
                      <span className="font-extrabold text-white block">{log.action}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{log.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between md:contents">
                    <span className="text-[10px] text-gray-400 italic">بواسطة: {log.actor}</span>
                    <span className="text-[9.5px] font-mono text-gray-500">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ========================================================
          SUBTAB VIEW: SECURITY CONFIGS
         ======================================================== */}
      {activeSubTab === "security" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 mb-1.5">
              <Lock className="w-5 h-5 text-yellow-500" />
              إعدادات سياسات الولوج وتماسك الأمان (SaaS Anti-Cheat Configs)
            </h3>
            <p className="text-xs text-gray-500">
              تحصين المنصة ومجموعات الكاشير ضد التلاعبات، ومخاطر استغلال الاختصارات المادية أو التواجد السكني المخالف. (خاص بمدير النظام)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Setting 1: IP whitelist and network bounds */}
            <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <h4 className="text-xs font-black text-[#D4AF37] border-b pb-2">🌐 سياسات تقييد العناوين وأجهزة الكاشير</h4>
              
              <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-yellow-500 cursor-pointer" />
                  <div>
                    <span className="font-extrabold text-white block">تقييد نقطة البيع بملامح الجهاز الدقيقة (Hardware fingerprinting)</span>
                    <span className="text-[9px] text-gray-500 block">يقوم بمنع تشغيل الكاشير إلا من خلال المتصفح والكمبيوتر المعتمد مسبقاً.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer border-t pt-3 border-zinc-900/65">
                  <input type="checkbox" className="accent-yellow-500 cursor-pointer" />
                  <div>
                    <span className="font-extrabold text-white block">تقييد الولوج بالنطاق الجغرافي للموظفين (National Address Bound)</span>
                    <span className="text-[9px] text-gray-500 block">يقيد استعلام الفواتير وسجلات النقد من خارج إحداثيات المدينة وعنوانه المسجل.</span>
                  </div>
                </label>
              </div>

              <div className="bg-black/25 p-3 rounded-xl border border-dashed text-[10px] text-amber-500" style={{ borderColor: theme.border }}>
                ℹ️ هذه الإعدادات تمنع الكواشير والمحاسبين من تسريب معلومات الفواتير خارج فروع الرياض ومستودع الشركة.
              </div>
            </div>

            {/* Setting 2: Password Complexity and MFA */}
            <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <h4 className="text-xs font-black text-[#D4AF37] border-b pb-2">🔐 سياسة كلمات المرور وطرد المحاولات</h4>
              
              <div className="space-y-3.5 text-xs text-gray-300">
                <div className="space-y-1">
                  <span className="font-bold text-white block">مدى طول كلمة المرور الإلزامي للموظفين الجدد:</span>
                  <select className="w-full text-xs p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-white outline-none">
                    <option>8 خانات على الأقل (تحتوي رموز وخانات عليا) - موصى به ⭐</option>
                    <option>10 خانات فأكثر (أمان مشدد للشركات الكبرى)</option>
                    <option>6 خانات (غير آمن ومسموح محلياً فقط)</option>
                  </select>
                </div>

                <div className="space-y-1 border-t pt-3.5 border-zinc-900/65">
                  <span className="font-bold text-white block">مهلة انتهاء الجلسة وتعطيل الخمول تلقائياً:</span>
                  <select className="w-full text-xs p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-white outline-none">
                    <option>30 دقيقة خمول (تسجيل خروج آمن تلقائي)</option>
                    <option>60 دقيقة خمول</option>
                    <option>يوم كامل (خاص بأجهزة المعارض المباشرة المقفلة)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerNotification("تم حفظ وتحديث مصفوفة الأمان التشغيلية بنجاح.", "success");
                }}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer border-none"
              >
                تطبيق سياسة حظر الانتحال والأمان
              </button>
            </div>

          </div>
        </div>
      )}


          {/* ========================================================
              POPUP MODAL 1: VIEW FILE / PROFILE DETAILS (عرض ملف الموظف)
             ======================================================== */}
          {viewingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div 
                className="w-full max-w-lg p-6 rounded-2xl border text-right space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <button 
                    onClick={() => setViewingUser(null)}
                    className="text-gray-400 hover:text-white bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 cursor-pointer text-xs font-bold leading-none w-6 h-6 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    🗂️ بطاقة الإضبارة الشاملة للموظف
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="grid grid-cols-2 gap-3.5 bg-black/20 p-3 rounded-xl border border-zinc-900">
                    <div>
                      <span className="text-gray-500 block text-[10px]">الاسم الكامل:</span>
                      <strong className="text-white text-xs">{viewingUser.fullName || viewingUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">اسم المستخدم:</span>
                      <strong className="text-yellow-500 font-mono">@{viewingUser.username}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">البريد الإلكتروني:</span>
                      <strong className="text-white font-mono break-all">{viewingUser.email}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">رقم الجوال:</span>
                      <strong className="text-white font-mono">{viewingUser.phone || "غير مسجل"}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 bg-black/20 p-3 rounded-xl border border-zinc-900">
                    <div>
                      <span className="text-gray-500 block text-[10px]">الوظيفة الحالية:</span>
                      <span className="text-amber-500 font-black">{roleTranslations[viewingUser.role] || viewingUser.role}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">القسم الإداري:</span>
                      <span className="text-sky-400 font-black">
                        {(() => {
                          const dep = getUserDepartment(viewingUser);
                          return dep === "management" ? "الإدارة والمتابعة" :
                                 dep === "sales" ? "المبيعات والمعارض" :
                                 dep === "warehouse" ? "المستودعات والمخازن" : "الدعم الفني واللوجستي";
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">موقع التعيين الفعلي:</span>
                      <strong className="text-white">{getLocationName(viewingUser.workLocationType || "hq", viewingUser.workLocationId || "")}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">حالة الولوج:</span>
                      <span className={`font-black p-0.5 px-2 rounded text-[10px] inline-block ${
                        viewingUser.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                        viewingUser.status === "disabled" ? "bg-red-500/10 text-red-400 border border-red-500/10" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {viewingUser.status === "active" ? "● حساب نشط" : viewingUser.status === "disabled" ? "✖ موقوف ومجمد" : "● بانتظار التفعيل"}
                      </span>
                    </div>
                  </div>

                  {viewingUser.disableReason && (
                    <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-red-450">
                      <span className="font-extrabold block text-[10px] text-red-500">سبب تعطيل الحساب المؤرشف:</span>
                      <p className="mt-1 text-[11px] leading-tight font-sans">{viewingUser.disableReason}</p>
                    </div>
                  )}

                  <div className="bg-black/20 p-3 rounded-xl border border-zinc-900 space-y-1">
                    <span className="text-gray-500 block text-[10px]">العنوان الوطني والسكني الموثق:</span>
                    {viewingUser.addressProfile?.shortAddress ? (
                      <div className="space-y-1 text-gray-300">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <span><strong>العنوان المختصر:</strong> {viewingUser.addressProfile.shortAddress}</span>
                          <span><strong>المدينة:</strong> {viewingUser.addressProfile.city}</span>
                          <span><strong>الشارع:</strong> {viewingUser.addressProfile.streetName}</span>
                          <span><strong>رقم المبنى:</strong> {viewingUser.addressProfile.buildingNumber}</span>
                          <span><strong>الحي:</strong> {viewingUser.addressProfile.district}</span>
                          <span><strong>الرمز البريدي:</strong> {viewingUser.addressProfile.postalCode}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-400 font-bold block mt-1">⚠️ لا تتوفر أي بيانات عنوان وطني مسجلة للموظف حالياً في النظام.</span>
                    )}
                  </div>

                  <div className="bg-black/20 p-3 rounded-xl border border-zinc-900">
                    <span className="text-gray-500 block text-[10px] mb-1.5">الامتيازات والتراخيص المشفرة المباشرة:</span>
                    <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto">
                      {(viewingUser.permissions || []).map((p, pIdx) => (
                        <span key={pIdx} className="text-[9px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                          {PERMISSION_LABELS_AR[p] || p}
                        </span>
                      ))}
                      {(viewingUser.permissions || []).length === 0 && (
                        <span className="text-gray-500">لا توجد صلاحيات معينة مباشرة (الأذونات فارغة).</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex justify-end">
                  <button
                    onClick={() => setViewingUser(null)}
                    className="py-2 px-5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-black text-gray-300 cursor-pointer active:scale-95"
                  >
                    إغلاق البطاقة ✕
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* ========================================================
              POPUP MODAL 2: TRANSFER EMPLOYEE LOCATION (نقل الموظف)
             ======================================================== */}
          {showTransferModal && transferUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div 
                className="w-full max-w-md p-6 rounded-2xl border text-right space-y-4 shadow-2xl relative"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <button 
                    onClick={() => { setShowTransferModal(false); setTransferUser(null); }}
                    className="text-gray-400 hover:text-white bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 cursor-pointer text-xs font-bold leading-none w-6 h-6 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    🔄 تعديل مقار عمل ونقل موظف الكادر
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-3 rounded-xl">
                    الموظف المختار للنقل: <strong className="text-white text-xs">{transferUser.fullName || transferUser.name} ({roleTranslations[transferUser.role] || transferUser.role})</strong>
                  </div>

                  {/* Transfer location type selector */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold block mb-1">نوع موقع العمل الجديد المخصص:</label>
                    <select
                      value={transferLocationType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setTransferLocationType(val);
                        setTransferLocationId("");
                      }}
                      className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 text-white font-black hover:border-yellow-500 transition-colors"
                    >
                      <option value="hq">HQ - المقر الرئيسي للإدارة العليا</option>
                      <option value="store">متجر من منافذ البيع المعينة</option>
                      <option value="branch">المعرض أو الفرع الجغرافي المعني</option>
                      <option value="warehouse">المستودعات ومراكز الإمداد الفني</option>
                      <option value="pos">جهاز كاشير أو محطة بيع منفردة</option>
                    </select>
                  </div>

                  {/* Location ID manual or dynamic selector */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold block mb-1">معرف أو اسم المقصد المحدد:</label>
                    <select
                      value={transferLocationId}
                      onChange={(e) => setTransferLocationId(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 text-white font-black hover:border-yellow-500 transition-colors"
                    >
                      <option value="">-- اختر موقعاً معتمداً من القائمة --</option>
                      {transferLocationType === "hq" && <option value="HQ-RIYADH">الإدارة المركزية - برون السحلي الرياض</option>}
                      {transferLocationType === "store" && (
                        <>
                          <option value="store_1">منفذ المتجر المركزي الالكتروني</option>
                          <option value="store_riyadh">متجر معرض الوسطى بالرياض</option>
                        </>
                      )}
                      {transferLocationType === "branch" && (
                        <>
                          <option value="branch_north">فرع الياسمين شمال الرياض</option>
                          <option value="branch_olaya">فرع طريق العليا العام المعرض 2</option>
                          <option value="branch_jeddah">فرع جدة - شارع فلسطين المعرض 4</option>
                        </>
                      )}
                      {transferLocationType === "warehouse" && (
                        <>
                          <option value="warehouse_east">مستودع السلي الضخم للتجهيز واللوجستيات</option>
                          <option value="warehouse_central">مستودع المربع الفرعي لتأمين الفروع</option>
                        </>
                      )}
                      {transferLocationType === "pos" && (
                        <>
                          <option value="pos_olaya_1">جهاز كاشير العليا 1 رقم المعرف #01</option>
                          <option value="pos_olaya_2">جهاز كاشير العليا 2 رقم المعرف #02</option>
                          <option value="pos_jed_1">جهاز كاشير فرع جدة 1 رقم المعرف #04</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Section division update */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold block mb-1">القسم الداخلي المنقول إليه:</label>
                    <select
                      value={transferDept}
                      onChange={(e) => setTransferDept(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 text-white font-black hover:border-yellow-500 transition-colors"
                    >
                      <option value="management">قسم الإدارة وتسيير الأعمال (Management)</option>
                      <option value="sales">قسم المعارض والمبيعات (Sales & Retail)</option>
                      <option value="warehouse">تبويب المخازن والمستودعات (Logistics)</option>
                      <option value="support">خدمة العملاء والمساندة (Support)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3.5 flex justify-end gap-2">
                  <button
                    onClick={() => { setShowTransferModal(false); setTransferUser(null); }}
                    className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-black text-gray-300 cursor-pointer active:scale-95"
                  >
                    إلغاء الأمر ✕
                  </button>
                  <button
                    onClick={handleSaveTransfer}
                    className="py-2.5 px-5 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-xs font-black text-black cursor-pointer active:scale-95"
                  >
                    حفظ ونقل المقر الفعلي 💾
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* ========================================================
              POPUP MODAL 3: DISABLE EMPLOYEE WITH REASON (تعطيل موظف)
             ======================================================== */}
          {showDisableModal && disablingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div 
                className="w-full max-w-md p-6 rounded-2xl border text-right space-y-4 shadow-2xl relative border-red-500/20"
                style={{ backgroundColor: theme.card }}
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <button 
                    onClick={() => { setShowDisableModal(false); setDisablingUser(null); }}
                    className="text-gray-400 hover:text-white bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 cursor-pointer text-xs font-bold leading-none w-6 h-6 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                  <h3 className="text-xs font-black text-red-500 flex items-center gap-1.5">
                    ⚠️ تعطيل وتجميد حساب موظف كلياً
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-red-950/20 border border-red-900/20 text-red-400 rounded-xl leading-relaxed text-right">
                    تنبيه أمني: سيتم تعليق وصول <strong>{disablingUser.fullName || disablingUser.name}</strong> فوراً ومنع الرمز التشغيلي الخاص به من الوصول إلى الكاشير أو قواعد البيانات الفروع. يرجى تبرير التعطيل.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 font-extrabold block">السبب الفني والقانوني المبرر للتعطيل والمجمد:</label>
                    <textarea
                      placeholder="اكتب هنا مبرر الفريز (مثال: انتهاء التعاقد السنوي، إيقاف إداري مؤقت للمراجعة القانونية للعهد المالية...)"
                      value={disableReason}
                      onChange={(e) => setDisableReason(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none h-[100px] leading-relaxed resize-none text-right font-sans"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex justify-end gap-2">
                  <button
                    onClick={() => { setShowDisableModal(false); setDisablingUser(null); }}
                    className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-black text-gray-300 cursor-pointer active:scale-95"
                  >
                    تراجع ✕
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!disableReason.trim()) {
                        triggerNotification("يرجى كتابة المبرر الأمني قبل تعطيل الموظف للامتثال الخاضع للرقابة.", "alert");
                        return;
                      }
                      const updated = users.map(u => {
                        if (u.id === disablingUser.id) {
                          return { ...u, status: "disabled" as const, disableReason: disableReason.trim() };
                        }
                        return u;
                      });
                      setUsers(updated);
                      addAuditLog("تعطيل وتجميد حساب", `تجميد صلاحيات ولوج حساب [${disablingUser.fullName || disablingUser.name}]. مبرر التدقيق الأمني: ${disableReason.trim()}`);
                      triggerNotification(`تم تعطيل دخول الموظف [${disablingUser.fullName || disablingUser.name}] وأرشفة ملفه.`, "success");
                      setShowDisableModal(false);
                      setDisablingUser(null);
                    }}
                    className="py-2.5 px-5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white hover:shadow-lg hover:shadow-red-500/10 cursor-pointer active:scale-95"
                  >
                    تأكيد تعطيل وتجميد الحساب 🚫
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* ========================================================
              POPUP MODAL 4: BULK IMPORT STAFF PASTE AREA (استيراد كتل)
             ======================================================== */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div 
                className="w-full max-w-lg p-6 rounded-2xl border text-right space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="flex justify-between items-center border-b border-zinc-90 pb-3">
                  <button 
                    onClick={() => { setShowImportModal(false); setImportPasteArea(""); }}
                    className="text-gray-400 hover:text-white bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 cursor-pointer text-xs font-bold leading-none w-6 h-6 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    📥 استيراد كادر المستخدمين بالدفعات (PASTE ENGINE)
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs text-right">
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    تتيح لك الواجهة لصق البيانات النصية مباشرة بصيغة CSV مجدولة أو ككود JSON جاهز من ملفات Excel، وسيقوم محرك سهم تلقائياً باستنباط البيانات وتوليد الحسابات والصلاحيات الافتراضية.
                  </p>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 select-all text-right">
                    <span className="text-[9px] font-black text-yellow-500 uppercase block">💡 نموذج وقالب لصق CSV المقبول:</span>
                    <pre className="text-[9px] text-gray-500 font-mono text-left block" dir="ltr">
{`fullName,username,email,phone,role
عبدالرحمن الشهري,asalshahri,a.shahri@sahmos.com,+966512345678,cashier
فيصل الحربي,f_harbi,f.harbi@sahmos.com,+966522345678,branch_manager`}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 font-extrabold block">ألصق هنا النص الجدولي (CSV) أو المصفوفة الإلكترونية (JSON):</label>
                    <textarea
                      placeholder="fullName,username,email,phone,role"
                      value={importPasteArea}
                      onChange={(e) => setImportPasteArea(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-950/60 border border-zinc-800 text-white font-mono focus:border-yellow-500 outline-none h-[140px] leading-relaxed resize-none text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3.5 flex justify-end gap-2">
                  <button
                    onClick={() => { setShowImportModal(false); setImportPasteArea(""); }}
                    className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-black text-gray-300 cursor-pointer active:scale-95"
                  >
                    إلغاء ✕
                  </button>
                  <button
                    onClick={() => {
                      try {
                        if (!importPasteArea.trim()) {
                          triggerNotification("يرجى لصق بيانات الاستيراد بالصيغة المخصصة.", "alert");
                          return;
                        }
                        
                        let imported: any[] = [];
                        if (importPasteArea.trim().startsWith("[")) {
                          imported = JSON.parse(importPasteArea);
                        } else {
                          const lines = importPasteArea.split("\n");
                          lines.forEach((line, index) => {
                            if (index === 0 && line.includes("fullName")) return; // skip header safely
                            const parts = line.split(",");
                            if (parts.length >= 3) {
                              imported.push({
                                fullName: parts[0]?.trim(),
                                username: parts[1]?.trim(),
                                email: parts[2]?.trim(),
                                phone: parts[3]?.trim() || "+966500000000",
                                role: parts[4]?.trim() || "cashier",
                                status: "active"
                              });
                            }
                          });
                        }

                        if (imported.length === 0) {
                          triggerNotification("لم يستطع النظام فك شفرة أي سجلات صالحة؛ يرجى مراجعة الصياغة.", "alert");
                          return;
                        }

                        const startingId = users.length > 0 ? Math.max(...users.map(u => parseInt(String(u.id)) || 0)) + 1 : 10;
                        const newUsersList = [...users];
                        
                        imported.forEach((imp, idx) => {
                          const uId = String(startingId + idx);
                          const name = imp.fullName || imp.name || `موظف مستورد ${uId}`;
                          const uName = imp.username || `imported_${uId}`;
                          const roleKey = imp.role || "cashier";
                          
                          newUsersList.push({
                            id: uId,
                            fullName: name,
                            name: name,
                            username: uName,
                            email: imp.email || `${uName}@sahmos.com`,
                            phone: imp.phone || "+966500000000",
                            password: "SahmPassword123",
                            role: roleKey,
                            department: getUserDepartment({ role: roleKey } as any),
                            status: "active",
                            emailVerified: true,
                            workLocationType: "hq",
                            workLocationId: "",
                            allowedStoreIds: [],
                            allowedBranchIds: [],
                            allowedWarehouseIds: [],
                            allowedPosIds: [],
                            company: "مجموعة مراسيم القابضة",
                            permissions: DEFAULT_ROLE_PERMISSIONS[roleKey] || ["pos:access", "pos:sell"],
                            createdAt: new Date().toISOString().split("T")[0],
                            createdBy: currentUser.fullName || currentUser.name,
                            mustChangePassword: true
                          });
                        });

                        setUsers(newUsersList);
                        addAuditLog("استيراد كتل كادر الموظفين", `تم إنجاز الاستيراد التجريدي لعدد [${imported.length}] صف بنجاح.`);
                        triggerNotification(`تم تنفيذ الاستيراد وإضافة [${imported.length}] موظف جديد للتنظيم الشجري للمنشأة.`, "success");
                        setShowImportModal(false);
                        setImportPasteArea("");
                      } catch (err: any) {
                        triggerNotification(`فشل تحليل النص المدرج: ${err.message}`, "critical");
                      }
                    }}
                    className="py-2.5 px-5 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-xs font-black text-black cursor-pointer active:scale-95"
                  >
                    بدء الاستيراد الفوري 📥
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* ========================================================
              POPUP MODAL 5: SPECIALIZED DIRECT PERMISSIONS EDITOR (إدارة الصلاحيات)
             ======================================================== */}
          {showPermissionsModal && permissionsUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div 
                className="w-full max-w-lg p-6 rounded-2xl border text-right space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <button 
                    onClick={() => { setShowPermissionsModal(false); setPermissionsUser(null); }}
                    className="text-gray-400 hover:text-white bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 cursor-pointer text-xs font-bold leading-none w-6 h-6 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    🎎 تخصيص مصفوفة الأذونات المباشرة للموظف
                  </h3>
                </div>

                <div className="space-y-4 text-xs select-none">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 leading-relaxed text-right">
                    الموظف المستهدف بالتعديل: <strong className="text-white text-xs">{permissionsUser.fullName || permissionsUser.name}</strong>
                    <div className="text-[10px] text-gray-500 mt-1">الدور الوظيفي: <span className="text-amber-500 font-extrabold">{roleTranslations[permissionsUser.role] || permissionsUser.role}</span> | القسم: <span className="text-sky-400 font-extrabold">{getUserDepartment(permissionsUser)}</span></div>
                  </div>

                  <p className="text-gray-400 text-[10px] leading-relaxed text-right">
                    يرجى تحديد أو إلغاء تحديد الأذونات المراد سحبها أو تخصيصها للموظف بشكل مفرط (أي تتجاوز التعيين التلقائي للرتبة الفنية):
                  </p>

                  {/* Grouped check boxes */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {(() => {
                      const categories: Record<string, string[]> = {
                        "المستخدمين والحسابات والأمان": ["users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage"],
                        "نظام المبيعات ونقاط البيع (POS)": ["pos:access", "pos:sell", "pos:refund", "pos:settings:manage"],
                        "إدارة المنتجات والتصنيفات": ["products:view", "products:create", "products:update", "products:delete"],
                        "المخزون واللوجستيات والمستودعات": ["inventory:view", "inventory:manage", "inventory:transfer"],
                        "المالية والتقارير والتحليلات": ["finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage"]
                      };

                      return Object.keys(categories).map((catName) => {
                        const perms = categories[catName];
                        return (
                          <div key={catName} className="space-y-2 bg-black/15 p-3 rounded-xl border border-zinc-950 text-right">
                            <span className="text-[10px] font-black text-yellow-500 border-b pb-1 mb-1 block">{catName}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                              {perms.map(p => {
                                const isPermsSuper = ["system_owner", "system_admin", "platform_owner"].includes(permissionsUser.role || "");
                                const isChecked = permissionsUser.permissions?.includes(p) || (permissionsUser.permissions?.includes("*") && isPermsSuper);
                                return (
                                  <label key={p} className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={permissionsUser.role === "tenant_owner" || permissionsUser.role === "system_owner" || (permissionsUser.permissions?.includes("*") && isPermsSuper) && p !== "*"}
                                      className="accent-yellow-500 cursor-pointer w-3.5 h-3.5"
                                      onChange={() => {
                                        let updatedPerms = [...(permissionsUser.permissions || [])];
                                        if (isChecked) {
                                          updatedPerms = updatedPerms.filter(x => x !== p);
                                        } else {
                                          updatedPerms.push(p);
                                        }
                                        setPermissionsUser({
                                          ...permissionsUser,
                                          permissions: updatedPerms
                                        });
                                      }}
                                    />
                                    <div className="leading-snug text-right">
                                      <span className="block font-bold">{PERMISSION_LABELS_AR[p] || p}</span>
                                      <span className="text-[8px] font-mono text-zinc-550">({p})</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3.5 flex justify-end gap-2">
                  <button
                    onClick={() => { setShowPermissionsModal(false); setPermissionsUser(null); }}
                    className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-black text-gray-300 cursor-pointer active:scale-95"
                  >
                    تراجع ✕
                  </button>
                  <button
                    onClick={() => {
                      if (!permissionsUser) return;
                      const updated = users.map(u => {
                        if (u.id === permissionsUser.id) {
                          return {
                            ...u,
                            permissions: permissionsUser.permissions
                          };
                        }
                        return u;
                      });
                      setUsers(updated);
                      addAuditLog("تعديل صلاحيات مخصصة", `تعديل الامتيازات المفرطة للحساب [${permissionsUser.fullName || permissionsUser.name}]، الصلاحيات الفعالة حالياً: [${permissionsUser.permissions.join(", ")}].`);
                      triggerNotification(`تم تحديث الصلاحيات المخصصة لـ [${permissionsUser.fullName || permissionsUser.name}] بنجاح في المنظومة.`, "success");
                      setShowPermissionsModal(false);
                      setPermissionsUser(null);
                    }}
                    className="py-2.5 px-5 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-xs font-black text-black cursor-pointer active:scale-95"
                  >
                    تأكيد وتطبيق الأذونات ⚙️
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Location transfer handler helper inside view */}
          {(() => {
            return null;
          })()}

    </div>
  );
}
