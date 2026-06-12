import React, { useState } from "react";
import { CompanyProfile, User, StoreProfile, ThemeColors } from "../types";
import { 
  Building, Users, UserCheck, ShieldAlert, Plus, Search, 
  Trash2, CreditCard, Activity, HelpCircle, ArrowLeftRight, 
  ShieldCheck, Smartphone, Mail, Lock, CheckCircle2, AlertTriangle, KeyRound, Edit2, ToggleLeft, ToggleRight,
  Eye
} from "lucide-react";
import { SahmDatabaseService } from "../core/database/dbService";

const COUNTRIES_PRESETS = [
  { name: "السعودية", name_en: "Saudi Arabia", code: "SA", dialCode: "+966" },
  { name: "الإمارات", name_en: "UAE", code: "AE", dialCode: "+971" },
  { name: "الكويت", name_en: "Kuwait", code: "KW", dialCode: "+965" },
  { name: "قطر", name_en: "Qatar", code: "QA", dialCode: "+974" },
  { name: "البحرين", name_en: "Bahrain", code: "BH", dialCode: "+973" },
  { name: "عمان", name_en: "Oman", code: "OM", dialCode: "+968" },
  { name: "مصر", name_en: "Egypt", code: "EG", dialCode: "+20" },
  { name: "الأردن", name_en: "Jordan", code: "JO", dialCode: "+962" }
];

function normalizePhoneNumber(phone: string, dialCode: string): string {
  let cleaned = phone.trim().replace(/\s/g, '').replace(/-/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  const dialDigits = dialCode.replace('+', '');
  if (dialDigits && cleaned.startsWith(dialDigits)) {
    cleaned = cleaned.slice(dialDigits.length);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return dialCode + cleaned;
}

function formatPhoneForDisplay(phoneValue?: string): string {
  if (!phoneValue) return "غير محدد";
  if (phoneValue.startsWith('+966') && phoneValue.length === 13) {
    return `+966 ${phoneValue.substring(4, 7)} ${phoneValue.substring(7, 10)} ${phoneValue.substring(10)}`;
  }
  if (phoneValue.startsWith('+971') && phoneValue.length === 13) {
    return `+971 ${phoneValue.substring(4, 6)} ${phoneValue.substring(6, 9)} ${phoneValue.substring(9)}`;
  }
  if (phoneValue.startsWith('+965') && phoneValue.length === 12) {
    return `+965 ${phoneValue.substring(4, 8)} ${phoneValue.substring(8)}`;
  }
  if (phoneValue.startsWith('+20') && phoneValue.length === 13) {
    return `+20 ${phoneValue.substring(3, 6)} ${phoneValue.substring(6, 9)} ${phoneValue.substring(9)}`;
  }
  return phoneValue;
}

interface SystemClientsManagerProps {
  theme: ThemeColors;
  rawCompanies: CompanyProfile[];
  setCompanies: (comps: CompanyProfile[]) => void;
  rawUsers: User[];
  setRawUsers: (users: User[]) => void;
  rawStores: StoreProfile[];
  rawBranches: any[];
  rawWarehouses: any[];
  rawPosUnits: any[];
  rawProducts: any[];
  rawInvoices: any[];
  triggerNotification: (msg: string, type?: any) => void;
  addAuditLog: (event: string, text: string) => void;
  onImpersonate: (tenantId: string, orgId: string, companyName: string) => void;
  onRefreshCompanies: () => Promise<void>;
  currentUser?: User;
}

export default function SystemClientsManager({
  theme,
  rawCompanies,
  setCompanies,
  rawUsers,
  setRawUsers,
  rawStores,
  rawBranches,
  rawWarehouses,
  rawPosUnits,
  rawProducts,
  rawInvoices,
  triggerNotification,
  addAuditLog,
  onImpersonate,
  onRefreshCompanies,
  currentUser
}: SystemClientsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewCompany, setSelectedViewCompany] = useState<CompanyProfile | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Owner Edit States
  const [showOwnerEditModal, setShowOwnerEditModal] = useState(false);
  const [selectedOwnerEditCompany, setSelectedOwnerEditCompany] = useState<CompanyProfile | null>(null);
  const [ownerEditName, setOwnerEditName] = useState("");
  const [ownerEditEmail, setOwnerEditEmail] = useState("");
  const [ownerEditPhone, setOwnerEditPhone] = useState("");
  const [isSavingOwnerEdit, setIsSavingOwnerEdit] = useState(false);

  // Temporary Password States
  const [showTempPassModal, setShowTempPassModal] = useState(false);
  const [generatedTempPass, setGeneratedTempPass] = useState("");

  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [sendingResetLinkId, setSendingResetLinkId] = useState<string | null>(null);
  const [generatingTempPassId, setGeneratingTempPassId] = useState<string | null>(null);
  const [creatingOwnerAccountId, setCreatingOwnerAccountId] = useState<string | null>(null);

  const isPlatformOwner = !!(currentUser && (currentUser.role === "platform_owner" || currentUser.role === "system_owner" || currentUser.role === "system_admin"));
  
  // New Client Form States
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [tenant_ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("باقة سهم الاحترافية Pro ⚡");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("1234");
  const [vatNumber, setVatNumber] = useState("311223344500003");
  const [unified700, setUnified700] = useState("7009491822");
  const [address, setAddress] = useState("الرياض، طريق الملك فهد");

  // Edit Client Form States
  const [editCompanyId, setEditCompanyId] = useState("");
  const [editTenantId, setEditTenantId] = useState("");
  const [editName, setEditName] = useState("");
  const [editLegalName, setEditLegalName] = useState("");
  const [editCrNumber, setEditCrNumber] = useState("");
  const [editVatNumber, setEditVatNumber] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editManagerName, setEditManagerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBankAccount, setEditBankAccount] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editCountry, setEditCountry] = useState("Saudi Arabia");
  const [editCountryCode, setEditCountryCode] = useState("SA");
  const [editPhoneCountryCode, setEditPhoneCountryCode] = useState("+966");

  const filteredCompanies = rawCompanies.filter(comp => {
    if (!comp) return false;

    // Role-based visibility check: non-platform owners only see their own tenant/company
    if (!isPlatformOwner && currentUser) {
      if (comp.tenant_id !== currentUser.tenant_id) {
        return false;
      }
    }

    const name = comp.name || "";
    const legalName = comp.companyLegalName || "";
    const cr = comp.crNumber || "";
    const manager = comp.managerName || "";
    const term = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(term) ||
      legalName.toLowerCase().includes(term) ||
      cr.includes(searchTerm) ||
      manager.toLowerCase().includes(term);
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreatingClient) return;

    if (!companyName.trim() || !tenant_ownerName.trim() || !email.trim() || !phone.trim()) {
      triggerNotification("⚠️ يرجى ملء كافة الحقول الأساسية لإنشاء العميل والمنشأة", "warning");
      return;
    }

    const emailInput = email.trim().toLowerCase();
    const exists = rawUsers.some(u => {
      if (!u) return false;
      const uUsername = typeof u.username === 'string' ? u.username : String(u.username || '');
      const uEmail = typeof u.email === 'string' ? u.email : String(u.email || '');
      return uUsername.toLowerCase() === emailInput || uEmail.toLowerCase() === emailInput;
    });
    if (exists) {
      triggerNotification("⚠️ البريد الإلكتروني مسجل بالفعل لمستخدم آخر", "error");
      return;
    }

    setIsCreatingClient(true);

    // 1. Generate new IDs
    const newTenantId = "tenant_" + Math.random().toString(36).substring(2, 8);
    const newCompanyId = "company_" + Date.now();
    const newUserId = "tenant_owner_" + Math.random().toString(36).substring(2, 8);

    // 2. Create the CompanyProfile object
    const newCompany: CompanyProfile = {
      id: newCompanyId,
      tenant_id: newTenantId,
      name: companyName.trim(),
      companyLegalName: legalName.trim() || companyName.trim() + " ش.م.م",
      crNumber: crNumber.trim() || "1010" + Math.floor(100000 + Math.random() * 900000),
      crDate: new Date().toISOString().split("T")[0],
      crExpiryDate: "1455-01-01",
      vatNumber: vatNumber.trim(),
      unifiedNumber700: unified700.trim(),
      address: address.trim(),
      managerName: tenant_ownerName.trim(),
      phone: phone.trim(),
      email: emailInput,
      bankAccount: "SA83" + Math.floor(1000000000000000 + Math.random() * 9000000000000000),
      status: "active",
      subscriptionPlan: plan,
      createdAt: new Date().toISOString().split("T")[0]
    };

    // 3. Create the Owner User object
    const newOwner: User = {
      id: newUserId,
      tenant_id: newTenantId,
      organization_id: newCompanyId, 
      fullName: tenant_ownerName.trim(),
      name: tenant_ownerName.trim(),
      username: username.trim() || emailInput,
      email: emailInput,
      phone: phone.trim(),
      // ⚠️ WARNING: Storing plain password and passwordHash here is a temporary workaround for the pilot stage only.
      // Not suitable for production. We must use hashed passwords or integrate with a secure auth provider like Supabase Auth.
      password: password,
      passwordHash: password,
      role: "tenant_owner",
      status: "active",
      emailVerified: true,
      mustChangePassword: false,
      allowedStoreIds: [],
      allowedBranchIds: [],
      allowedWarehouseIds: [],
      allowedPosIds: [],
      permissions: [
        "dashboard:view", "setup:view", "integrations:view", "help:view",
        "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
        "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
        "products:view", "products:create", "products:update", "products:delete",
        "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
        "settings:manage", "integrations:manage"
      ],
      createdAt: new Date().toISOString(),
      createdBy: "مدير النظام"
    };

    const db = SahmDatabaseService.getInstance();
    db.createTenantAndCompanyAndUser({ id: newTenantId, name: companyName.trim() }, newCompany, newOwner)
      .then(async (res) => {
        // Update raw users state
        const updatedUsers = [...rawUsers, newOwner];
        setRawUsers(updatedUsers);
        localStorage.setItem("sahm_web_users_list3", JSON.stringify(updatedUsers));

        // Refresh companies directly from Supabase
        await onRefreshCompanies();

        addAuditLog("إدارة العملاء", `تم تأسيس منشأة جديدة [${newCompany.name}] وتعيين المالك [${newOwner.fullName}] بنجاح.`);
        triggerNotification(`✓ تم تأسيس العميل والمنشأة [${newCompany.name}] بنجاح تام!`, "success");

        // Clear form
        setCompanyName("");
        setLegalName("");
        setCrNumber("");
        setOwnerName("");
        setEmail("");
        setPhone("");
        setUsername("");
        setShowAddModal(false);
      })
      .catch((err) => {
        console.error("Error creating tenant & company:", err);
        triggerNotification(`❌ فشل الإنشاء: ${err.message}`, "error");
      })
      .finally(() => {
        setIsCreatingClient(false);
      });
  };

  const handleEditClick = (comp: CompanyProfile) => {
    const compStores = rawStores.filter(s => s.tenant_id === comp.tenant_id);
    const defaultStore = compStores[0];
    const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");

    setEditCompanyId(comp.id);
    setEditTenantId(comp.tenant_id || "");
    setEditName(comp.name || "");
    setEditLegalName(comp.companyLegalName || defaultStore?.companyLegalName || comp.name || "");
    setEditCrNumber(comp.crNumber || defaultStore?.crNumber || "");
    setEditVatNumber(comp.vatNumber || defaultStore?.vatNumber || "");
    setEditAddress(comp.address || defaultStore?.address?.shortAddress || "");
    setEditManagerName(comp.managerName || tenant_ownerUser?.fullName || "");

    const cCode = comp.country_code || "SA";
    const pDial = comp.phone_country_code || "+966";
    const cName = comp.country || "Saudi Arabia";
    setEditCountry(cName);
    setEditCountryCode(cCode);
    setEditPhoneCountryCode(pDial);

    let rawPhone = comp.phone || tenant_ownerUser?.phone || "";
    if (rawPhone.startsWith('+')) {
      if (rawPhone.startsWith(pDial)) {
        rawPhone = rawPhone.slice(pDial.length);
      }
    } else if (rawPhone.startsWith('00')) {
      const pDialDigits = pDial.replace('+', '');
      if (rawPhone.substring(2).startsWith(pDialDigits)) {
        rawPhone = rawPhone.substring(2 + pDialDigits.length);
      }
    } else {
      const pDialDigits = pDial.replace('+', '');
      if (rawPhone.startsWith(pDialDigits)) {
        rawPhone = rawPhone.slice(pDialDigits.length);
      }
    }
    setEditPhone(rawPhone);

    setEditEmail(comp.email || tenant_ownerUser?.email || "");
    setEditBankAccount(comp.bankAccount || "");
    setEditPlan(comp.subscriptionPlan || "باقة سهم الاحترافية Pro ⚡");
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    const errors: Record<string, string> = {};
    if (!editName.trim()) errors.editName = "اسم المنشأة التجاري مطلوب";
    if (!editLegalName.trim()) errors.editLegalName = "الاسم القانوني للمؤسسة مطلوب";
    if (!editCrNumber.trim()) errors.editCrNumber = "رقم السجل التجاري CR مطلوب";
    if (!editManagerName.trim()) errors.editManagerName = "اسم المدير المسؤول مطلوب";
    if (!editEmail.trim()) {
      errors.editEmail = "البريد الإلكتروني للاتصال مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      errors.editEmail = "صيغة البريد الإلكتروني غير صالحة";
    }

    // Phone validation & normalization
    let phone_e164 = "";
    let localPhone = "";
    if (!editPhone.trim()) {
      errors.editPhone = "رقم الجوال للتواصل مطلوب";
    } else {
      if (!editCountryCode || !editPhoneCountryCode) {
        errors.editPhone = "اختر دولة المنشأة أو مفتاح الاتصال قبل حفظ رقم الجوال.";
      } else {
        const localPhoneCleaned = editPhone.trim().replace(/\s/g, '').replace(/-/g, '').replace(/^\+/, '');
        const dialDigits = editPhoneCountryCode.replace('+', '');
        let localDigits = localPhoneCleaned;
        if (localDigits.startsWith(dialDigits)) {
          localDigits = localDigits.slice(dialDigits.length);
        }
        if (localDigits.startsWith('0')) {
          localDigits = localDigits.slice(1);
        }

        const isDigitsOnly = /^\d+$/.test(localDigits);
        const isValidLength = localDigits.length >= 7 && localDigits.length <= 12;

        if (!isDigitsOnly || !isValidLength) {
          errors.editPhone = "رقم الجوال غير صحيح. تأكد من اختيار الدولة وكتابة الرقم بدون مفتاح الدولة.";
        } else {
          phone_e164 = normalizePhoneNumber(editPhone.trim(), editPhoneCountryCode);
          localPhone = localDigits;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.editPhone) {
        if (errors.editPhone.includes("اختر دولة")) {
          triggerNotification("اختر دولة المنشأة أو مفتاح الاتصال قبل حفظ رقم الجوال.", "error");
        } else {
          triggerNotification("تعذر الحفظ: رقم الجوال يجب أن يكون بصيغة دولية مثل +9665XXXXXXXX", "error");
        }
      } else {
        triggerNotification("⚠️ يرجى ملء كافة الحقول الإلزامية وتصحيح الأخطاء", "warning");
      }
      return;
    }

    setIsSavingEdit(true);
    const db = SahmDatabaseService.getInstance();

    try {
      // 1. Prepare Company update
      const targetCompany = rawCompanies.find(c => c.id === editCompanyId);
      if (!targetCompany) throw new Error("المنشأة غير موجودة");

      const updatedCompany: CompanyProfile = {
        ...targetCompany,
        name: editName.trim(),
        crNumber: editCrNumber.trim(),
        companyLegalName: editLegalName.trim(),
        vatNumber: editVatNumber.trim(),
        address: editAddress.trim(),
        managerName: editManagerName.trim(),
        phone: localPhone,
        email: editEmail.trim().toLowerCase(),
        bankAccount: editBankAccount.trim(),
        subscriptionPlan: editPlan,
        country: editCountry,
        country_code: editCountryCode,
        phone_country_code: editPhoneCountryCode,
        phone_e164: phone_e164
      };

      // 2. Prepare Store update
      const compStores = rawStores.filter(s => s.tenant_id === editTenantId);
      const defaultStore = compStores[0] || {
        id: "store_" + Math.random().toString(36).substring(2, 8),
        tenant_id: editTenantId,
        company_id: editCompanyId,
        isActive: true,
        isArchived: false
      };
      
      const updatedStore: any = {
        ...defaultStore,
        name: editName.trim() + " - الفرع الرئيسي",
        tradeName: editName.trim(),
        companyLegalName: editLegalName.trim(),
        crNumber: editCrNumber.trim(),
        vatNumber: editVatNumber.trim(),
        phone: phone_e164,
        address: {
          shortAddress: editAddress.trim(),
          buildingNumber: "",
          streetName: "",
          district: "",
          city: "الرياض",
          region: "منطقة الرياض",
          postalCode: "",
          additionalNumber: "",
          unitNumber: "",
          country: editCountryCode,
          mapLink: ""
        },
        bankAccounts: [
          { id: "ba_" + Date.now(), bankName: "مصرف الراجحي", iban: editBankAccount.trim(), accountNumber: "", beneficiaryName: editLegalName.trim() }
        ]
      };

      // 3. Prepare User update
      const defaultOwner = rawUsers.find(u => u.tenant_id === editTenantId && u.role === "tenant_owner") || {
        id: "user_" + Math.random().toString(36).substring(2, 8),
        tenant_id: editTenantId,
        organization_id: editCompanyId,
        role: "tenant_owner",
        status: "active"
      };

      const updatedUser: any = {
        ...defaultOwner,
        fullName: editManagerName.trim(),
        name: editManagerName.trim(),
        email: editEmail.trim().toLowerCase(),
        username: editEmail.trim().toLowerCase(),
        phone: phone_e164,
        emailVerified: true,
        mustChangePassword: false,
        allowedStoreIds: [],
        allowedBranchIds: [],
        allowedWarehouseIds: [],
        allowedPosIds: [],
        permissions: (defaultOwner as any).permissions || [
          "dashboard:view", "setup:view", "integrations:view", "help:view",
          "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
          "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
          "products:view", "products:create", "products:update", "products:delete",
          "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
          "settings:manage", "integrations:manage"
        ]
      };

      // 4. Save to Supabase
      await db.saveCompany(updatedCompany);
      await db.saveStore(updatedStore as StoreProfile);
      await db.saveUser(updatedUser as User);

      // Update local states
      const updatedCompaniesList = rawCompanies.map(c => c.id === editCompanyId ? updatedCompany : c);
      setCompanies(updatedCompaniesList);

      const updatedUsersList = rawUsers.map(u => u.tenant_id === editTenantId && u.role === "tenant_owner" ? (updatedUser as User) : u);
      setRawUsers(updatedUsersList);
      localStorage.setItem("sahm_web_users_list3", JSON.stringify(updatedUsersList));

      await onRefreshCompanies();

      addAuditLog("إدارة العملاء", `تم تعديل بيانات المنشأة [${editName}] بنجاح.`);
      triggerNotification("تم حفظ بيانات المنشأة بنجاح", "success");
      setFormErrors({});
      setShowEditModal(false);
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "تعذر حفظ البيانات، حاول مرة أخرى", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleStatus = async (comp: CompanyProfile) => {
    if (togglingStatusId) return;

    const db = SahmDatabaseService.getInstance();
    const compStores = rawStores.filter(s => s.tenant_id === comp.tenant_id);
    
    // Toggle active state on all stores of this company
    const currentlyActive = comp.status !== "suspended";
    const nextActive = !currentlyActive;

    if (currentlyActive) {
      const confirmDisable = window.confirm("هل تريد تعطيل هذه المنشأة؟ سيتم منع مالك المنشأة من الدخول مؤقتًا.");
      if (!confirmDisable) return;
    }

    setTogglingStatusId(comp.id);

    try {
      if (compStores.length === 0) {
        // Create a default store if none exists
        const defaultStore: any = {
          id: "store_" + Math.random().toString(36).substring(2, 8),
          tenant_id: comp.tenant_id,
          company_id: comp.id,
          name: comp.name + " - الفرع الرئيسي",
          tradeName: comp.name,
          companyLegalName: comp.companyLegalName || comp.name,
          isActive: nextActive,
          isArchived: false,
          crNumber: comp.crNumber || "",
          vatNumber: comp.vatNumber || "",
          address: {
            shortAddress: comp.address || "",
            buildingNumber: "",
            streetName: "",
            district: "",
            city: "الرياض",
            region: "منطقة الرياض",
            postalCode: "",
            additionalNumber: "",
            unitNumber: "",
            country: "المملكة العربية السعودية",
            mapLink: ""
          }
        };
        await db.saveStore(defaultStore as StoreProfile);
      } else {
        for (const store of compStores) {
          const updatedStore = { ...store, isActive: nextActive };
          await db.saveStore(updatedStore);
        }
      }

      // Also update the company status
      const nextStatus = nextActive ? "active" : "suspended";
      const updatedCompany = { ...comp, status: nextStatus as any };
      await db.saveCompany(updatedCompany);

      await onRefreshCompanies();
      triggerNotification(nextActive ? "تم تفعيل المنشأة بنجاح" : "تم تعطيل المنشأة بنجاح", "success");
      addAuditLog("إدارة العملاء", `تم تغيير حالة تشغيل منشأة [${comp.name}] إلى ${nextActive ? "نشطة" : "معطلة/موقوفة"}`);
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "تعذر تغيير الحالة، حاول مرة أخرى", "error");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleDeleteClient = (companyId: string, companyName: string, tenantId?: string) => {
    if (deletingClientId) return;

    if (!tenantId || tenantId === "tenant-local" || tenantId === "tenant-default") {
      triggerNotification("⚠️ لا يمكن حذف المستأجر المرجعي أو الافتراضي للنظام.", "error");
      return;
    }

    // Check if data exists for this client
    const compStores = rawStores.filter(s => s.tenant_id === tenantId);
    const branchesCount = rawBranches.filter(b => b.tenant_id === tenantId).length;
    const warehousesCount = rawWarehouses.filter(w => w.tenant_id === tenantId).length;
    const posCount = (rawPosUnits || []).filter(p => p.tenant_id === tenantId).length;
    const usersCount = rawUsers.filter(u => u.tenant_id === tenantId).length;
    const productsCount = rawProducts.filter(pr => pr.tenant_id === tenantId).length;
    const invoicesCount = rawInvoices.filter(i => i.tenant_id === tenantId).length;

    const hasData = compStores.length > 0 || branchesCount > 0 || warehousesCount > 0 || posCount > 0 || usersCount > 0 || productsCount > 0 || invoicesCount > 0;

    let confirmMsg = `⚠️ تحذير حرج: هل أنت متأكد من حذف المنشأة [${companyName}]؟ سيؤدي ذلك لمسح كافة بياناتها نهائياً من السحاب!`;
    if (hasData) {
      confirmMsg = `⚠️ تنبيه أمني حرج جداً: المنشأة [${companyName}] تحتوي على بيانات نشطة:\n` +
        `- متاجر: ${compStores.length}\n` +
        `- فروع: ${branchesCount}\n` +
        `- مستودعات: ${warehousesCount}\n` +
        `- مستخدمين: ${usersCount}\n` +
        `- منتجات: ${productsCount}\n` +
        `- فواتير: ${invoicesCount}\n` +
        `حذف المنشأة سيقوم بمسح وتدمير كافة هذه البيانات نهائياً! هل أنت متأكد من الحذف بدلاً من تعطيل المنشأة مؤقتاً؟`;
    }

    if (window.confirm(confirmMsg)) {
      setDeletingClientId(companyId);
      const db = SahmDatabaseService.getInstance();
      db.deleteTenantAndAllData(tenantId, companyId)
        .then(async () => {
          setCompanies(rawCompanies.filter(c => c.id !== companyId));
          setRawUsers(rawUsers.filter(u => u.tenant_id !== tenantId));
          addAuditLog("إدارة العملاء", `تم حذف وإلغاء ترخيص المنشأة وتصفيتها: ${companyName}`);
          triggerNotification(`✓ تم حذف المنشأة وتصفير كافة بيانات السحاب التابعة لها`, "success");
          await onRefreshCompanies();
        })
        .catch((err) => {
          console.error("Error deleting tenant:", err);
          triggerNotification(`❌ فشل حذف بيانات المنشأة: ${err.message}`, "error");
        })
        .finally(() => {
          setDeletingClientId(null);
        });
    }
  };

  const handleCopyEmail = (email: string, comp: CompanyProfile) => {
    const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
    if (!tenant_ownerUser) {
      triggerNotification("⚠️ لا يمكن نسخ البريد لعدم إنشاء حساب دخول بعد للمالك", "error");
      return;
    }
    const realEmail = tenant_ownerUser.email || email;
    if (!realEmail) {
      triggerNotification("⚠️ لا يوجد بريد إلكتروني لنسخه", "warning");
      return;
    }
    navigator.clipboard.writeText(realEmail);
    triggerNotification("✓ تم نسخ البريد الإلكتروني بنجاح", "success");
  };

  const handleCopyLoginDetails = (comp: CompanyProfile) => {
    const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
    if (!tenant_ownerUser) {
      triggerNotification("⚠️ لا يمكن نسخ بيانات الدخول لعدم إنشاء حساب دخول بعد للمالك", "error");
      return;
    }
    const ownerName = comp.managerName || tenant_ownerUser.fullName || "غير محدد";
    const loginEmail = tenant_ownerUser.email || comp.email || "غير محدد";
    const loginUrl = window.location.origin;

    const text = `اسم المنشأة:\n${comp.name}\nاسم المالك:\n${ownerName}\nبريد الدخول:\n${loginEmail}\nرابط الدخول:\n${loginUrl}\nملاحظة: استخدم رابط إعادة تعيين كلمة المرور إذا نسيت كلمة المرور.`;
    
    navigator.clipboard.writeText(text);
    triggerNotification("✓ تم نسخ بيانات الدخول بنجاح", "success");
  };

  const handleSendResetLink = async (comp: CompanyProfile) => {
    if (sendingResetLinkId) return;

    const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
    if (!tenant_ownerUser) {
      triggerNotification("⚠️ لا يمكن إرسال الرابط لعدم إنشاء حساب دخول بعد للمالك", "error");
      return;
    }
    const email = tenant_ownerUser.email || comp.email;
    if (!email) {
      triggerNotification("⚠️ لا يمكن إرسال الرابط لعدم توفر بريد إلكتروني", "warning");
      return;
    }

    setSendingResetLinkId(comp.id);

    try {
      const db = SahmDatabaseService.getInstance();
      const client = db.getRawSupabaseClient();
      if (client && navigator.onLine) {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
      }
      
      addAuditLog("إدارة العملاء", `تم إرسال رابط إعادة تعيين كلمة المرور للمنشأة [${comp.name}]، البريد: [${email}]`);
      triggerNotification(`✓ تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد: ${email}`, "success");
    } catch (err: any) {
      console.error("Error sending reset password link:", err);
      addAuditLog("إدارة العملاء", `محاكاة: تم إرسال رابط إعادة تعيين كلمة المرور للمنشأة [${comp.name}]، البريد: [${email}]`);
      triggerNotification(`✓ (محاكاة) تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد: ${email}`, "success");
    } finally {
      setSendingResetLinkId(null);
    }
  };

  const handleGenerateTempPassword = async (comp: CompanyProfile) => {
    if (generatingTempPassId) return;

    const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
    if (!tenant_ownerUser) {
      triggerNotification("⚠️ لم يتم العثور على حساب المالك لتحديث كلمة مروره", "error");
      return;
    }

    setGeneratingTempPassId(comp.id);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomStr = "";
    for (let i = 0; i < 8; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const tempPass = `sahm_${randomStr}`;

    try {
      const db = SahmDatabaseService.getInstance();
      const updatedUser: User = {
        ...tenant_ownerUser,
        // ⚠️ WARNING: Storing plain password and passwordHash here is a temporary workaround for the pilot stage only.
        // Not suitable for production. We must use hashed passwords or integrate with a secure auth provider like Supabase Auth.
        password: tempPass,
        passwordHash: tempPass,
      };

      await db.saveUser(updatedUser);

      const updatedUsersList = rawUsers.map(u => u.id === tenant_ownerUser.id ? updatedUser : u);
      setRawUsers(updatedUsersList);
      localStorage.setItem("sahm_web_users_list3", JSON.stringify(updatedUsersList));

      setGeneratedTempPass(tempPass);
      setShowTempPassModal(true);

      addAuditLog("إدارة العملاء", `تم إنشاء كلمة مرور مؤقتة لمالك المنشأة [${comp.name}]`);
      triggerNotification("✓ تم تعيين كلمة المرور المؤقتة بنجاح", "success");
    } catch (err: any) {
      console.error("Error setting temporary password:", err);
      triggerNotification(`❌ فشل تعيين كلمة المرور المؤقتة: ${err.message}`, "error");
    } finally {
      setGeneratingTempPassId(null);
    }
  };

  const handleCreateOwnerAccount = async (comp: CompanyProfile) => {
    if (creatingOwnerAccountId) return;
    
    const ownerEmail = comp.email;
    if (!ownerEmail) {
      triggerNotification("⚠️ لا يمكن إنشاء حساب لعدم توفر بريد إلكتروني للمنشأة. يرجى تعديل المنشأة وإضافة البريد الإلكتروني للمالك أولاً.", "warning");
      return;
    }

    setCreatingOwnerAccountId(comp.id);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomStr = "";
    for (let i = 0; i < 8; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const tempPass = `sahm_${randomStr}`;
    const newUserId = "owner_" + Math.random().toString(36).substring(2, 15);

    try {
      const db = SahmDatabaseService.getInstance();
      
      // Attempt best effort Auth signup
      try {
        await db.signUpWithoutLoggingOut(ownerEmail, tempPass);
      } catch (authErr: any) {
        console.warn("Supabase Auth signup error (might already exist):", authErr);
      }

      // Create owner user profile
      const newOwner: User = {
        id: newUserId,
        tenant_id: comp.tenant_id,
        organization_id: comp.id,
        company_id: comp.id,
        fullName: comp.managerName || "مالك المنشأة",
        name: comp.managerName || "مالك المنشأة",
        username: ownerEmail,
        email: ownerEmail,
        phone: comp.phone || "",
        password: tempPass,
        passwordHash: tempPass,
        role: "tenant_owner",
        status: "active",
        emailVerified: true,
        mustChangePassword: false,
        allowedStoreIds: [],
        allowedBranchIds: [],
        allowedWarehouseIds: [],
        allowedPosIds: [],
        permissions: [
          "dashboard:view", "setup:view", "integrations:view", "help:view",
          "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
          "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
          "products:view", "products:create", "products:update", "products:delete",
          "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
          "settings:manage", "integrations:manage"
        ],
        createdAt: new Date().toISOString(),
        createdBy: "مدير النظام"
      };

      await db.saveUser(newOwner);

      const updatedUsersList = [...rawUsers, newOwner];
      setRawUsers(updatedUsersList);
      localStorage.setItem("sahm_web_users_list3", JSON.stringify(updatedUsersList));

      setGeneratedTempPass(tempPass);
      setShowTempPassModal(true);

      addAuditLog("إدارة العملاء", `تم إنشاء حساب مالك جديد للمنشأة [${comp.name}]، البريد: [${ownerEmail}]`);
      triggerNotification("✓ تم إنشاء حساب المالك وتعيين كلمة المرور المؤقتة بنجاح", "success");
    } catch (err: any) {
      console.error("Error creating owner account:", err);
      triggerNotification(`❌ فشل إنشاء حساب المالك: ${err.message}`, "error");
    } finally {
      setCreatingOwnerAccountId(null);
    }
  };

  const handleOpenOwnerEdit = (comp: CompanyProfile) => {
    const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
    setSelectedOwnerEditCompany(comp);
    setOwnerEditName(comp.managerName || tenant_ownerUser?.fullName || "");
    setOwnerEditEmail(comp.email || tenant_ownerUser?.email || "");
    setOwnerEditPhone(comp.phone || tenant_ownerUser?.phone || "");
    setShowOwnerEditModal(true);
  };

  const handleSaveOwnerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwnerEditCompany) return;

    if (!ownerEditName.trim() || !ownerEditEmail.trim() || !ownerEditPhone.trim()) {
      triggerNotification("⚠️ يرجى ملء كافة الحقول المطلوبة", "warning");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(ownerEditEmail)) {
      triggerNotification("⚠️ صيغة البريد الإلكتروني غير صالحة", "warning");
      return;
    }

    setIsSavingOwnerEdit(true);
    const db = SahmDatabaseService.getInstance();
    const tenantId = selectedOwnerEditCompany.tenant_id;

    try {
      const updatedCompany: CompanyProfile = {
        ...selectedOwnerEditCompany,
        managerName: ownerEditName.trim(),
        email: ownerEditEmail.trim().toLowerCase(),
        phone: ownerEditPhone.trim()
      };

      let tenant_ownerUser = rawUsers.find(u => u.tenant_id === tenantId && u.role === "tenant_owner");
      if (tenant_ownerUser) {
        const updatedUser: User = {
          ...tenant_ownerUser,
          fullName: ownerEditName.trim(),
          name: ownerEditName.trim(),
          email: ownerEditEmail.trim().toLowerCase(),
          username: ownerEditEmail.trim().toLowerCase(),
          phone: ownerEditPhone.trim()
        };
        
        await db.saveUser(updatedUser);

        const updatedUsersList = rawUsers.map(u => u.id === tenant_ownerUser.id ? updatedUser : u);
        setRawUsers(updatedUsersList);
        localStorage.setItem("sahm_web_users_list3", JSON.stringify(updatedUsersList));
      } else {
        // Create new owner account on the fly
        const newUserId = "owner_" + Math.random().toString(36).substring(2, 15);
        const tempPass = "sahm_1234"; // Default temp password

        try {
          await db.signUpWithoutLoggingOut(ownerEditEmail.trim().toLowerCase(), tempPass);
        } catch (authErr: any) {
          console.warn("Supabase Auth signup error during edit owner creation:", authErr);
        }

        const newOwner: User = {
          id: newUserId,
          tenant_id: tenantId,
          organization_id: selectedOwnerEditCompany.id,
          company_id: selectedOwnerEditCompany.id,
          fullName: ownerEditName.trim(),
          name: ownerEditName.trim(),
          username: ownerEditEmail.trim().toLowerCase(),
          email: ownerEditEmail.trim().toLowerCase(),
          phone: ownerEditPhone.trim(),
          password: tempPass,
          passwordHash: tempPass,
          role: "tenant_owner",
          status: "active",
          emailVerified: true,
          mustChangePassword: false,
          allowedStoreIds: [],
          allowedBranchIds: [],
          allowedWarehouseIds: [],
          allowedPosIds: [],
          permissions: [
            "dashboard:view", "setup:view", "integrations:view", "help:view",
            "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
            "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
            "products:view", "products:create", "products:update", "products:delete",
            "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
            "settings:manage", "integrations:manage"
          ],
          createdAt: new Date().toISOString(),
          createdBy: "مدير النظام"
        };

        await db.saveUser(newOwner);

        const updatedUsersList = [...rawUsers, newOwner];
        setRawUsers(updatedUsersList);
        localStorage.setItem("sahm_web_users_list3", JSON.stringify(updatedUsersList));
      }

      await db.saveCompany(updatedCompany);

      const updatedCompaniesList = rawCompanies.map(c => c.id === selectedOwnerEditCompany.id ? updatedCompany : c);
      setCompanies(updatedCompaniesList);

      await onRefreshCompanies();

      addAuditLog("إدارة العملاء", `تم تعديل بيانات المالك للمنشأة [${updatedCompany.name}] بنجاح.`);
      triggerNotification("✓ تم حفظ بيانات المالك بنجاح", "success");
      setShowOwnerEditModal(false);
    } catch (err: any) {
      console.error("Error saving owner edit:", err);
      triggerNotification(`❌ فشل حفظ التعديلات: ${err.message}`, "error");
    } finally {
      setIsSavingOwnerEdit(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans select-none animate-fade-in" dir="rtl">
      {/* Upper Executive Info Header */}
      <div className="p-6 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl" />
        <div className="space-y-1">
          <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block">لوحة تحكم مالك النظام - سهم OS</span>
          <h2 className="text-lg font-black text-white">مركز إدارة المنصة</h2>
          <p className="text-[11px] text-gray-400 leading-normal max-w-2xl">
            تأسيس منشآت تجارية معزولة بالكامل، تعديل الملفات القانونية، التحكم في حالة التشغيل (تفعيل/تعطيل)، والمراقبة والدخول الفني لحل مشاكل المشتركين.
          </p>
        </div>

        <button
          onClick={() => { setAddStep(1); setShowAddModal(true); }}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs border-none flex items-center gap-1.5 cursor-pointer shadow-md justify-center shrink-0"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>تأسيس منشأة جديدة</span>
        </button>
      </div>

      {/* Control panel: Search filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن منشأة بالاسم، السجل التجاري، أو اسم مالك المنشأة..."
            className="w-full py-2.5 pr-10 pl-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
          />
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-center">
          <button
            onClick={() => setViewMode("cards")}
            className={`py-1.5 px-3 rounded-lg text-xs font-black cursor-pointer transition-all ${
              viewMode === "cards" 
                ? "bg-amber-500 text-slate-950" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎴 بطاقات ذكية
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`py-1.5 px-3 rounded-lg text-xs font-black cursor-pointer transition-all ${
              viewMode === "table" 
                ? "bg-amber-500 text-slate-950" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            📋 جدول البيانات
          </button>
        </div>

        <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-gray-400 whitespace-nowrap text-center">
          إجمالي المنشآت: <span className="text-white font-black">{rawCompanies.length} منشأة</span>
        </div>
      </div>

      {/* Main Client List Views */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-3xl border bg-slate-950/45 border-slate-900 shadow-xl">
          <table className="w-full text-right border-collapse text-xs select-text">
            <thead>
              <tr className="bg-slate-950 text-gray-400 font-bold border-b border-slate-900">
                <th className="p-4 text-right">اسم المنشأة الكيان القانوني</th>
                <th className="p-4 text-right">مالك المنشأة</th>
                <th className="p-4 text-right">الاتصال والتفاصيل</th>
                <th className="p-4 text-right">الباقة والاشتراك</th>
                <th className="p-4 text-center">عدادات المنشأة السحابية</th>
                <th className="p-4 text-right">آخر نشاط</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(comp => {
                const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
                const compStores = rawStores.filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                );
                const storesCount = compStores.length;
                const branchesCount = rawBranches.filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                ).length;
                const warehousesCount = rawWarehouses.filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                ).length;
                const posCount = (rawPosUnits || []).filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                ).length;
                const usersCount = rawUsers.filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                ).length;
                const productsCount = rawProducts.filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                ).length;
                const invoicesCount = rawInvoices.filter(
                  (item: any) => item.tenant_id === comp.tenant_id
                ).length;

                const isCompanyActive = comp.status !== "suspended";

                return (
                  <tr 
                    key={comp.id} 
                    onClick={() => {
                      const targetTenant = comp.tenant_id;
                      if (!targetTenant || targetTenant === "tenant-local") {
                        triggerNotification("لا يمكن تصفح المستأجر الافتراضي.", "error");
                        return;
                      }
                      onImpersonate(targetTenant, comp.id, comp.name);
                    }}
                    className="border-b border-slate-900/60 hover:bg-slate-900/10 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="text-right">
                          <span>{comp.name}</span>
                          <span className="block text-[10px] text-gray-500 font-mono mt-0.5">{comp.companyLegalName || comp.name} | CR: {comp.crNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-300">
                      {comp.managerName || tenant_ownerUser?.fullName || "غير محدد"}
                    </td>
                    <td className="p-4 font-mono text-[10.5px] text-gray-400">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1.5 justify-end">
                          <span>{comp.email || tenant_ownerUser?.email}</span>
                          <Mail className="w-3 h-3 text-gray-500" />
                        </span>
                        <span className="flex items-center gap-1.5 justify-end text-[10px] text-gray-500">
                          <span>{formatPhoneForDisplay(comp.phone_e164 || comp.phone || tenant_ownerUser?.phone)}</span>
                          <Smartphone className="w-3 h-3 text-gray-500" />
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-[#D4AF37] border border-amber-500/20 rounded-full font-bold text-[10px] block w-fit">
                          {comp.subscriptionPlan || "باقة سهم الاحترافية Pro"}
                        </span>
                        <span className={`flex items-center gap-1 text-[9.5px] font-extrabold ${isCompanyActive ? "text-emerald-400" : "text-rose-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompanyActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                          <span>{isCompanyActive ? "نشط وتشغيلي" : "موقف مؤقتاً"}</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {storesCount} متجر
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {branchesCount} فرع
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {warehousesCount} مستودع
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {posCount} POS
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {usersCount} مستخدم
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {productsCount} منتج
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded border border-slate-805 whitespace-nowrap">
                          {invoicesCount} فاتورة
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-[10.5px]">
                      {tenant_ownerUser?.lastLoginAt ? new Date(tenant_ownerUser.lastLoginAt).toLocaleString("ar-SA") : "لم يسجل دخول بعد"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetTenant = comp.tenant_id;
                            if (!targetTenant || targetTenant === "tenant-local") {
                              triggerNotification("لا يمكن تصفح المستأجر الافتراضي.", "error");
                              return;
                            }
                            onImpersonate(targetTenant, comp.id, comp.name);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black border-none cursor-pointer flex items-center gap-1 shadow transition-all active:scale-95 whitespace-nowrap"
                          title="دخول كطرف"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-slate-950" />
                          <span>دخول كطرف</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedViewCompany(comp);
                            setShowViewModal(true);
                          }}
                          className="py-1 px-2 rounded-lg border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 cursor-pointer transition animate-fade-in flex items-center gap-1 text-[10px] font-black"
                          title="عرض تفاصيل المنشأة"
                        >
                          <Eye className="w-3 h-3" />
                          <span>عرض</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(comp);
                          }}
                          className="py-1 px-2 rounded-lg border border-sky-500/30 hover:border-sky-500/50 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 cursor-pointer transition flex items-center gap-1 text-[10px] font-black"
                          title="تعديل المنشأة"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                        {isPlatformOwner && (
                          <button
                            disabled={togglingStatusId !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(comp);
                            }}
                            className={`py-1 px-2 rounded-lg border cursor-pointer transition flex items-center gap-1 text-[10px] font-black ${
                              togglingStatusId === comp.id
                                ? "border-gray-500/30 bg-gray-500/5 text-gray-400 cursor-not-allowed"
                                : isCompanyActive 
                                  ? "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400" 
                                  : "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
                            }`}
                            title={isCompanyActive ? "تعطيل المنشأة" : "تفعيل المنشأة"}
                          >
                            {togglingStatusId === comp.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-gray-450 border-t-transparent rounded-full animate-spin" />
                                <span>جاري...</span>
                              </>
                            ) : isCompanyActive ? (
                              <>
                                <ToggleRight className="w-3.5 h-3.5 text-amber-500" />
                                <span>إيقاف</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5 text-emerald-400" />
                                <span>تفعيل</span>
                              </>
                            )}
                          </button>
                        )}
                        {isPlatformOwner && (
                          <button
                            disabled={deletingClientId !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(comp.id, comp.name, comp.tenant_id);
                            }}
                            className={`py-1 px-2 rounded-lg border cursor-pointer transition flex items-center gap-1 text-[10px] font-black ${
                              deletingClientId === comp.id
                                ? "border-gray-550/30 bg-gray-500/5 text-gray-400 cursor-not-allowed"
                                : "border-red-500/30 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                            }`}
                            title="حذف وتصفية المنشأة"
                          >
                            {deletingClientId === comp.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                <span>جاري...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                <span>حذف</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredCompanies.map(comp => {
            const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
            const compStores = rawStores.filter(
              (item: any) => item.tenant_id === comp.tenant_id
            );
            const storesCount = compStores.length;
            const branchesCount = rawBranches.filter(
              (item: any) => item.tenant_id === comp.tenant_id
            ).length;
            const warehousesCount = rawWarehouses.filter(
              (item: any) => item.tenant_id === comp.tenant_id
            ).length;
            const posCount = (rawPosUnits || []).filter(
              (item: any) => item.tenant_id === comp.tenant_id
            ).length;
            const usersCount = rawUsers.filter(
              (item: any) => item.tenant_id === comp.tenant_id
            ).length;
            const productsCount = rawProducts.filter(
              (item: any) => item.tenant_id === comp.tenant_id
            ).length;
            const invoicesCount = rawInvoices.filter(
              (item: any) => item.tenant_id === comp.tenant_id
            ).length;

            const isCompanyActive = comp.status !== "suspended";

            return (
              <div 
                key={comp.id} 
                onClick={() => {
                  const targetTenant = comp.tenant_id;
                  if (!targetTenant || targetTenant === "tenant-local") {
                    triggerNotification("لا يمكن تصفح المستأجر الافتراضي.", "error");
                    return;
                  }
                  onImpersonate(targetTenant, comp.id, comp.name);
                }}
                className="backdrop-blur-md border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between gap-5 cursor-pointer"
                style={{ 
                  borderColor: isCompanyActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                  backgroundColor: theme.card,
                  boxShadow: isCompanyActive ? '0 10px 30px rgba(212,175,55,0.02)' : 'none'
                }}
              >
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-[0.03] pointer-events-none"
                  style={{ backgroundColor: isCompanyActive ? '#D4AF37' : '#EF4444' }} 
                />

                {/* Company Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-amber-500 shrink-0" />
                      <div className="text-right">
                        <h4 className="font-black text-white text-sm leading-tight">{comp.name}</h4>
                        <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{comp.companyLegalName || comp.name}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] whitespace-nowrap ${
                      isCompanyActive 
                        ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                    }`}>
                      {isCompanyActive ? "نشط وتشغيلي" : "موقف مؤقتاً"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono bg-slate-900/40 p-2 rounded-xl border border-slate-800/40">
                    <span>السجل: {comp.crNumber}</span>
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-[#D4AF37] border border-amber-500/20 rounded font-black text-[9px]">
                      {comp.subscriptionPlan || "باقة Pro ⚡"}
                    </span>
                  </div>
                </div>

                {/* Owner info & Login Credentials */}
                <div className="space-y-3 border-t border-slate-900/60 pt-3 text-[11px] text-gray-300">
                  {isPlatformOwner ? (
                    <div className="space-y-2.5">
                      <div className="bg-slate-900/30 p-3 rounded-2xl border border-slate-900/80 space-y-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-500 font-bold text-[10px]">مالك المنشأة:</span>
                          <span className="text-white font-black text-xs">{comp.managerName || tenant_ownerUser?.fullName || "غير محدد"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-500 font-bold text-[10px]">بريد الدخول:</span>
                          {tenant_ownerUser ? (
                            <span className="text-white font-mono text-xs">{tenant_ownerUser.email}</span>
                          ) : (
                            <span className="text-rose-400 font-bold text-[11px]">لم يتم إنشاء حساب دخول بعد</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-500 font-bold text-[10px]">الجوال:</span>
                          <span className="text-white font-mono text-xs">{formatPhoneForDisplay(comp.phone_e164 || comp.phone || tenant_ownerUser?.phone)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-900/50 text-[10px]">
                          <div>
                            <span className="text-gray-500">الحساب:</span>{' '}
                            <span className={`font-bold ${tenant_ownerUser ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tenant_ownerUser ? 'موجود' : 'غير موجود في نظام الدخول'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">حالة الحساب:</span>{' '}
                            <span className={`font-bold ${!tenant_ownerUser ? 'text-amber-400' : (tenant_ownerUser.status !== 'disabled' ? 'text-emerald-400' : 'text-rose-400')}`}>
                              {!tenant_ownerUser ? 'غير مكتمل' : (tenant_ownerUser.status !== 'disabled' ? 'نشط' : 'معطل')}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 pt-0.5">
                          <span>آخر دخول:</span>{' '}
                          <span className="text-gray-400 font-mono">
                            {tenant_ownerUser?.lastLoginAt ? new Date(tenant_ownerUser.lastLoginAt).toLocaleString("ar-SA") : "لا يوجد"}
                          </span>
                        </div>
                      </div>

                      {/* Platform Owner Credential Actions */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleCopyEmail(comp.email || tenant_ownerUser?.email || "", comp); }}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-gray-300 hover:text-white cursor-pointer transition text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <span>نسخ البريد</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleCopyLoginDetails(comp); }}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-gray-300 hover:text-white cursor-pointer transition text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <span>نسخ بيانات الدخول</span>
                        </button>
                        {tenant_ownerUser ? (
                          <>
                            <button
                              type="button"
                              disabled={sendingResetLinkId !== null}
                              onClick={(e) => { e.stopPropagation(); handleSendResetLink(comp); }}
                              className={`py-1.5 px-2 rounded-xl border transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2 ${
                                sendingResetLinkId === comp.id
                                  ? "bg-amber-500/5 border-amber-500/10 text-gray-500 cursor-not-allowed"
                                  : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[#D4AF37] cursor-pointer"
                              }`}
                            >
                              {sendingResetLinkId === comp.id ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                                  <span>جاري إرسال الرابط...</span>
                                </>
                              ) : (
                                <span>إرسال رابط تعيين كلمة مرور</span>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={generatingTempPassId !== null}
                              onClick={(e) => { e.stopPropagation(); handleGenerateTempPassword(comp); }}
                              className={`py-1.5 px-2 rounded-xl border transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2 ${
                                generatingTempPassId === comp.id
                                  ? "bg-sky-500/5 border-sky-500/10 text-gray-500 cursor-not-allowed"
                                  : "bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 cursor-pointer"
                              }`}
                            >
                              {generatingTempPassId === comp.id ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                                  <span>جاري...</span>
                                </>
                              ) : (
                                <span>تعيين كلمة مرور مؤقتة</span>
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={creatingOwnerAccountId !== null}
                            onClick={(e) => { e.stopPropagation(); handleCreateOwnerAccount(comp); }}
                            className={`py-1.5 px-2 rounded-xl border transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2 ${
                              creatingOwnerAccountId === comp.id
                                ? "bg-emerald-500/5 border-emerald-500/10 text-gray-500 cursor-not-allowed"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 cursor-pointer"
                            }`}
                          >
                            {creatingOwnerAccountId === comp.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                <span>جاري إنشاء الحساب...</span>
                              </>
                            ) : (
                              <span>إنشاء حساب دخول للمالك</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Merchant View (Restricted/Normal) */
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span>المالك: <strong className="text-white">{comp.managerName || tenant_ownerUser?.fullName || "غير محدد"}</strong></span>
                      </div>
                      <div className="space-y-1 font-mono text-[10px] text-gray-400 pr-5.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-600" />
                          <span>{comp.email || tenant_ownerUser?.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-gray-600" />
                          <span>{formatPhoneForDisplay(comp.phone_e164 || comp.phone || tenant_ownerUser?.phone)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cloud metrics grid */}
                <div className="border-t border-slate-900/60 pt-3">
                  <span className="text-[9px] text-gray-500 font-bold block mb-2">عدادات السحاب:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-850">
                      <span className="block text-white font-black">{storesCount}</span>
                      <span className="text-[8px] text-gray-500">متاجر</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-850">
                      <span className="block text-white font-black">{branchesCount}</span>
                      <span className="text-[8px] text-gray-500">فروع</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-850">
                      <span className="block text-white font-black">{warehousesCount}</span>
                      <span className="text-[8px] text-gray-500">مستودعات</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-850">
                      <span className="block text-white font-black">{posCount}</span>
                      <span className="text-[8px] text-gray-500">POS</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-850">
                      <span className="block text-white font-black">{productsCount}</span>
                      <span className="text-[8px] text-gray-500">منتجات</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-850">
                      <span className="block text-white font-black">{invoicesCount}</span>
                      <span className="text-[8px] text-gray-500">فواتير</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-slate-900/60 pt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetTenant = comp.tenant_id;
                      if (!targetTenant || targetTenant === "tenant-local") {
                        triggerNotification("لا يمكن تصفح المستأجر الافتراضي.", "error");
                        return;
                      }
                      onImpersonate(targetTenant, comp.id, comp.name);
                    }}
                    className="flex-grow py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black border-none cursor-pointer flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 whitespace-nowrap"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-950" />
                    <span>دخول كطرف</span>
                  </button>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedViewCompany(comp);
                        setShowViewModal(true);
                      }}
                      className="py-1.5 px-2 rounded-xl border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 cursor-pointer transition flex items-center gap-1 text-[10px] font-black"
                      title="عرض تفاصيل المنشأة"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>عرض</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(comp);
                      }}
                      className="py-1.5 px-2 rounded-xl border border-sky-500/30 hover:border-sky-500/50 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 cursor-pointer transition flex items-center gap-1 text-[10px] font-black"
                      title="تعديل المنشأة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    {isPlatformOwner && (
                      <button
                        disabled={togglingStatusId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(comp);
                        }}
                        className={`py-1.5 px-2 rounded-xl border cursor-pointer transition flex items-center gap-1 text-[10px] font-black ${
                          togglingStatusId === comp.id
                            ? "border-gray-500/30 bg-gray-550/5 text-gray-400 cursor-not-allowed"
                            : isCompanyActive 
                              ? "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500" 
                              : "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-450"
                        }`}
                        title={isCompanyActive ? "تعطيل المنشأة" : "تفعيل المنشأة"}
                      >
                        {togglingStatusId === comp.id ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            <span>جاري...</span>
                          </>
                        ) : isCompanyActive ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5 text-amber-500" />
                            <span>إيقاف</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5 text-emerald-455" />
                            <span>تفعيل</span>
                          </>
                        )}
                      </button>
                    )}
                    {isPlatformOwner && (
                      <button
                        disabled={deletingClientId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(comp.id, comp.name, comp.tenant_id);
                        }}
                        className={`py-1.5 px-2 rounded-xl border cursor-pointer transition flex items-center gap-1 text-[10px] font-black ${
                          deletingClientId === comp.id
                            ? "border-gray-550/30 bg-gray-550/5 text-gray-400 cursor-not-allowed"
                            : "border-red-500/30 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                        }`}
                        title="حذف وتصفية المنشأة"
                      >
                        {deletingClientId === comp.id ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            <span>جاري...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add new Establishment and Client Owner */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
              >
                ✕
              </button>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-500" />
                <span>تأسيس منشأة سهم OS جديدة</span>
              </h3>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              {/* Stepper Header Indicator */}
              <div className="flex items-center justify-center gap-6 pb-2 border-b border-slate-900 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${addStep === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-gray-400 border border-slate-800'}`}>1</span>
                  <span className={addStep === 1 ? 'text-white font-black' : 'text-gray-500'}>المنشأة القانونية</span>
                </div>
                <div className="w-8 h-[1px] bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${addStep === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-gray-400 border border-slate-800'}`}>2</span>
                  <span className={addStep === 2 ? 'text-white font-black' : 'text-gray-500'}>بيانات المالك والدخول</span>
                </div>
              </div>

              {addStep === 1 ? (
                /* Company Details */
                <div className="space-y-4 py-2">
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>🏢 بيانات المنشأة القانونية</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">اسم المنشأة التجاري *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="مثال: شركة سهم الغد للتجارة"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الاسم القانوني للمؤسسة</label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="مثال: شركة سهم الغد للتجارة والمقاولات ش.م.م"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">رقم السجل التجاري CR *</label>
                      <input
                        type="text"
                        required
                        value={crNumber}
                        onChange={(e) => setCrNumber(e.target.value)}
                        placeholder="1010XXXXXX"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">باقة الاشتراك المخصصة *</label>
                      <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="باقة البداية المجانية 👑">باقة البداية المجانية 👑</option>
                        <option value="باقة سهم الاحترافية Pro ⚡">باقة سهم الاحترافية Pro ⚡</option>
                        <option value="باقة النخبة والربط المخصص Corporate 💎">باقة النخبة والربط المخصص Corporate 💎</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الرقم الضريبي الموحد VAT</label>
                      <input
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">العنوان والمدينة</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 justify-end border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-850 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!companyName.trim() || !crNumber.trim()) {
                          triggerNotification("⚠️ يرجى تعبئة الحقول الأساسية للمنشأة أولاً.", "warning");
                          return;
                        }
                        setAddStep(2);
                      }}
                      className="py-2.5 px-6 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-none"
                    >
                      التالي: بيانات المالك 👤
                    </button>
                  </div>
                </div>
              ) : (
                /* Owner User Details */
                <div className="space-y-4 py-2">
                  <h4 className="text-xs font-black text-sky-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>👤 بيانات مالك المنشأة والدخول</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الاسم الكامل للمالك *</label>
                      <input
                        type="text"
                        required
                        value={tenant_ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="مثال: فهد بن عبد العزيز الحربي"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">البريد الإلكتروني (اسم مستخدم الدخول) *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tenant_owner@company.com"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">رقم الجوال للتواصل *</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">اسم مستخدم مخصص (اختياري)</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="fahad.owner"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">كلمة المرور الافتراضية *</label>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 justify-end border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setAddStep(1)}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-850 cursor-pointer"
                    >
                      السابق 🏢
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingClient}
                      className={`py-2.5 px-6 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCreatingClient 
                          ? "bg-amber-500/50 text-slate-950/50 cursor-not-allowed" 
                          : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      }`}
                    >
                      {isCreatingClient ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>جاري تأسيس الكيان...</span>
                        </>
                      ) : (
                        <span>تأسيس الكيان وحفظ المالك ✓</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Modal: Edit Establishment Profile */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
              >
                ✕
              </button>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-sky-400" />
                <span>تعديل ملف المنشأة والمالك</span>
              </h3>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Details */}
                <div className="space-y-4 border-l border-slate-900 pl-4">
                  <h4 className="text-xs font-black text-sky-400 border-b border-slate-900 pb-1.5">🏢 بيانات المنشأة القانونية</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">اسم المنشأة التجاري *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    {formErrors.editName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.editName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">الاسم القانوني للمؤسسة *</label>
                    <input
                      type="text"
                      required
                      value={editLegalName}
                      onChange={(e) => setEditLegalName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    {formErrors.editLegalName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.editLegalName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">رقم السجل التجاري CR *</label>
                    <input
                      type="text"
                      required
                      value={editCrNumber}
                      onChange={(e) => setEditCrNumber(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                    />
                    {formErrors.editCrNumber && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.editCrNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">الرقم الضريبي الموحد VAT</label>
                    <input
                      type="text"
                      value={editVatNumber}
                      onChange={(e) => setEditVatNumber(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">العنوان الوطني</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                  </div>
                </div>

                {/* Owner User Details & Plan */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-amber-400 border-b border-slate-900 pb-1.5">👤 بيانات المالك ورخصة المنصة</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">الاسم الكامل للمدير المسؤول *</label>
                    <input
                      type="text"
                      required
                      value={editManagerName}
                      onChange={(e) => setEditManagerName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    {formErrors.editManagerName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.editManagerName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">البريد الإلكتروني للاتصال *</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                    />
                    {formErrors.editEmail && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.editEmail}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">رقم الجوال للتواصل *</label>
                    <div className="flex gap-2" dir="ltr">
                      <select
                        value={editCountryCode}
                        onChange={(e) => {
                          const selected = COUNTRIES_PRESETS.find(c => c.code === e.target.value);
                          if (selected) {
                            setEditCountryCode(selected.code);
                            setEditPhoneCountryCode(selected.dialCode);
                            setEditCountry(selected.name_en);
                          }
                        }}
                        className="w-1/3 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-left"
                      >
                        {COUNTRIES_PRESETS.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.dialCode})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="554412233"
                        className="w-2/3 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-left"
                      />
                    </div>
                    {formErrors.editPhone && <p className="text-[10px] text-red-500 mt-0.5 text-right">{formErrors.editPhone}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">رقم الآيبان البنكي IBAN</label>
                    <input
                      type="text"
                      value={editBankAccount}
                      onChange={(e) => setEditBankAccount(e.target.value)}
                      placeholder="SAXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold">باقة الاشتراك الحالية *</label>
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      disabled={!isPlatformOwner}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right disabled:opacity-50"
                    >
                      <option value="باقة البداية المجانية 👑">باقة البداية المجانية 👑</option>
                      <option value="باقة سهم الاحترافية Pro ⚡">باقة سهم الاحترافية Pro ⚡</option>
                      <option value="باقة النخبة والربط المخصص Corporate 💎">باقة النخبة والربط المخصص Corporate 💎</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 justify-end border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-850 cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-slate-950 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    "حفظ وتحديث البيانات"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Establishment Profile Details */}
      {showViewModal && selectedViewCompany && (() => {
        const comp = selectedViewCompany;
        const tenant_ownerUser = rawUsers.find(u => u.tenant_id === comp.tenant_id && u.role === "tenant_owner");
        const compStores = rawStores.filter(s => s.tenant_id === comp.tenant_id);
        const compBranches = rawBranches.filter(b => b.tenant_id === comp.tenant_id);
        const compWarehouses = rawWarehouses.filter(w => w.tenant_id === comp.tenant_id);
        const compPosUnits = (rawPosUnits || []).filter(p => p.tenant_id === comp.tenant_id);
        const compUsers = rawUsers.filter(u => u.tenant_id === comp.tenant_id);
        const compProducts = rawProducts.filter(p => p.tenant_id === comp.tenant_id);
        const compInvoices = rawInvoices.filter(i => i.tenant_id === comp.tenant_id);
        const isCompanyActive = comp.status !== "suspended";

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
                >
                  ✕
                </button>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-500" />
                  <span>تفاصيل المنشأة: {comp.name}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Section A: Legal & Contact */}
                <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
                  <h4 className="text-xs font-black text-amber-400 border-b border-slate-800 pb-1">🏢 البيانات القانونية والاتصال</h4>
                  <div className="space-y-2 text-xs text-right">
                    <div><span className="text-gray-400">الاسم القانوني:</span> <span className="text-white font-bold">{comp.companyLegalName || comp.name}</span></div>
                    <div><span className="text-gray-400">رقم السجل:</span> <span className="text-white font-mono font-bold">{comp.crNumber || "غير متوفر"}</span></div>
                    <div><span className="text-gray-400">الرقم الضريبي:</span> <span className="text-white font-mono font-bold">{comp.vatNumber || "غير متوفر"}</span></div>
                    <div><span className="text-gray-400">الحساب البنكي:</span> <span className="text-white font-mono">{comp.bankAccount || "غير متوفر"}</span></div>
                    <div><span className="text-gray-400">العنوان:</span> <span className="text-white">{comp.address || "غير متوفر"}</span></div>
                    <div><span className="text-gray-400">البريد الإلكتروني:</span> <span className="text-white font-mono">{comp.email || "غير متوفر"}</span></div>
                    <div><span className="text-gray-400">رقم الجوال:</span> <span className="text-white font-mono">{formatPhoneForDisplay(comp.phone_e164 || comp.phone)}</span></div>
                  </div>
                </div>

                {/* Section B: Subscription & Owner */}
                <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-amber-400 border-b border-slate-800 pb-1.5 mb-2">💳 اشتراك المنصة والمالك</h4>
                    {isPlatformOwner ? (
                      <div className="space-y-2 text-xs text-right">
                        <div>
                          <span className="text-gray-500 block font-bold text-[10px] mb-0.5">مالك المنشأة:</span>
                          <span className="text-white font-black text-xs">{comp.managerName || tenant_ownerUser?.fullName || "غير محدد"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block font-bold text-[10px] mb-0.5">بريد الدخول:</span>
                          {tenant_ownerUser ? (
                            <span className="text-white font-mono text-xs">{tenant_ownerUser.email}</span>
                          ) : (
                            <span className="text-rose-400 font-bold text-[11px]">لم يتم إنشاء حساب دخول بعد</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500 block font-bold text-[10px] mb-0.5">الجوال:</span>
                          <span className="text-white font-mono text-xs">{formatPhoneForDisplay(comp.phone_e164 || comp.phone || tenant_ownerUser?.phone)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/60 mt-2">
                          <div>
                            <span className="text-gray-400">الحساب:</span>{' '}
                            <span className={`font-bold ${tenant_ownerUser ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tenant_ownerUser ? 'موجود' : 'غير موجود في نظام الدخول'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">حالة الحساب:</span>{' '}
                            <span className={`font-bold ${!tenant_ownerUser ? 'text-amber-400' : (tenant_ownerUser.status !== 'disabled' ? 'text-emerald-400' : 'text-rose-400')}`}>
                              {!tenant_ownerUser ? 'غير مكتمل' : (tenant_ownerUser.status !== 'disabled' ? 'نشط' : 'معطل')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">آخر دخول:</span>{' '}
                          <span className="text-white font-mono">
                            {tenant_ownerUser?.lastLoginAt ? new Date(tenant_ownerUser.lastLoginAt).toLocaleString("ar-SA") : "لا يوجد"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">باقة الاشتراك:</span> 
                          <span className="px-2 py-0.5 bg-amber-500/10 text-[#D4AF37] border border-amber-500/20 rounded font-black text-[10px] mr-1.5 inline-block">
                            {comp.subscriptionPlan || "باقة سهم الاشتراكية"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">الحالة التشغيلية:</span> 
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 inline-block ${isCompanyActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {isCompanyActive ? "نشط وتشغيلي" : "موقف مؤقتاً"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs text-right">
                        <div><span className="text-gray-400">مالك المنشأة:</span> <span className="text-white font-bold">{comp.managerName || tenant_ownerUser?.fullName || "غير محدد"}</span></div>
                        <div>
                          <span className="text-gray-400">باقة الاشتراك:</span> 
                          <span className="px-2 py-0.5 bg-amber-500/10 text-[#D4AF37] border border-amber-500/20 rounded font-black text-[10px] mr-1.5 inline-block">
                            {comp.subscriptionPlan || "باقة سهم الاشتراكية"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">الحالة التشغيلية:</span> 
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 inline-block ${isCompanyActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {isCompanyActive ? "نشط وتشغيلي" : "موقف مؤقتاً"}
                          </span>
                        </div>
                        <div><span className="text-gray-400">تاريخ التأسيس:</span> <span className="text-white font-mono">{comp.createdAt || "غير محدد"}</span></div>
                        <div><span className="text-gray-400">آخر تسجيل دخول للمالك:</span> <span className="text-white font-mono">{tenant_ownerUser?.lastLoginAt ? new Date(tenant_ownerUser.lastLoginAt).toLocaleString("ar-SA") : "لم يسجل دخول"}</span></div>
                      </div>
                    )}
                  </div>

                  {isPlatformOwner && (
                    <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-800/60 mt-3">
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(comp.email || tenant_ownerUser?.email || "", comp)}
                        className="py-1.5 px-2 rounded-xl bg-slate-955 hover:bg-slate-900 border border-slate-800 text-gray-300 hover:text-white cursor-pointer transition text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <span>نسخ البريد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyLoginDetails(comp)}
                        className="py-1.5 px-2 rounded-xl bg-slate-955 hover:bg-slate-900 border border-slate-800 text-gray-300 hover:text-white cursor-pointer transition text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <span>نسخ بيانات الدخول</span>
                      </button>
                      {tenant_ownerUser ? (
                        <>
                          <button
                            type="button"
                            disabled={sendingResetLinkId !== null}
                            onClick={() => handleSendResetLink(comp)}
                            className={`py-1.5 px-2 rounded-xl border transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2 ${
                              sendingResetLinkId === comp.id
                                ? "bg-amber-500/5 border-amber-500/10 text-gray-500 cursor-not-allowed"
                                : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[#D4AF37] cursor-pointer"
                            }`}
                          >
                            {sendingResetLinkId === comp.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                                <span>جاري إرسال الرابط...</span>
                              </>
                            ) : (
                              <span>إرسال رابط تعيين كلمة مرور</span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={generatingTempPassId !== null}
                            onClick={() => handleGenerateTempPassword(comp)}
                            className={`py-1.5 px-2 rounded-xl border transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2 ${
                              generatingTempPassId === comp.id
                                ? "bg-sky-500/5 border-sky-500/10 text-gray-500 cursor-not-allowed"
                                : "bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 cursor-pointer"
                            }`}
                          >
                            {generatingTempPassId === comp.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                                <span>جاري...</span>
                              </>
                            ) : (
                              <span>تعيين كلمة مرور مؤقتة</span>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={creatingOwnerAccountId !== null}
                          onClick={() => handleCreateOwnerAccount(comp)}
                          className={`py-1.5 px-2 rounded-xl border transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2 ${
                            creatingOwnerAccountId === comp.id
                              ? "bg-emerald-500/5 border-emerald-500/10 text-gray-500 cursor-not-allowed"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 cursor-pointer"
                          }`}
                        >
                          {creatingOwnerAccountId === comp.id ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                              <span>جاري إنشاء الحساب...</span>
                            </>
                          ) : (
                            <span>إنشاء حساب دخول للمالك</span>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenOwnerEdit(comp)}
                        className="py-1.5 px-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 cursor-pointer transition text-[10px] font-bold flex items-center justify-center gap-1 col-span-2"
                      >
                        <span>تعديل بيانات المالك</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section C: Cloud Metrics */}
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                <h4 className="text-xs font-black text-amber-400 border-b border-slate-800 pb-1">📊 إحصائيات الموارد والبيانات السحابية</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compStores.length}</span>
                    <span className="text-[10px] text-gray-400">متاجر</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compBranches.length}</span>
                    <span className="text-[10px] text-gray-400">فروع نشطة</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compWarehouses.length}</span>
                    <span className="text-[10px] text-gray-400">مستودعات</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compPosUnits.length}</span>
                    <span className="text-[10px] text-gray-400">نقاط بيع (POS)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compUsers.length}</span>
                    <span className="text-[10px] text-gray-400">مستخدمين وموظفين</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compProducts.length}</span>
                    <span className="text-[10px] text-gray-400">منتجات مخزنة</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
                    <span className="block text-white font-black text-sm">{compInvoices.length}</span>
                    <span className="text-[10px] text-gray-400">فواتير صادرة</span>
                  </div>
                </div>
              </div>

              {/* Section D: User Accounts details */}
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 space-y-2">
                <h4 className="text-xs font-black text-amber-400 border-b border-slate-800 pb-1">👥 مستخدمي المنشأة ومستويات صلاحياتهم</h4>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {compUsers.map(u => (
                    <div key={u.id} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                      <div className="text-right">
                        <span className="font-bold text-white block">{u.fullName || u.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono block">{u.email || u.username}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] bg-slate-800 text-gray-300 px-2 py-0.5 rounded font-mono">
                          {u.role}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} title={u.status} />
                      </div>
                    </div>
                  ))}
                  {compUsers.length === 0 && (
                    <p className="text-[11px] text-gray-500 text-center py-2">لا يوجد مستخدمون حالياً في هذه المنشأة</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-none"
                >
                  إغلاق التفاصيل
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Edit Owner Details */}
      {showOwnerEditModal && selectedOwnerEditCompany && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <button
                onClick={() => setShowOwnerEditModal(false)}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
              >
                ✕
              </button>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-400" />
                <span>تعديل بيانات مالك المنشأة</span>
              </h3>
            </div>

            <form onSubmit={handleSaveOwnerEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">اسم مالك المنشأة / المدير المسؤول *</label>
                <input
                  type="text"
                  required
                  value={ownerEditName}
                  onChange={(e) => setOwnerEditName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">بريد الدخول الرئيسي (اسم المستخدم) *</label>
                <input
                  type="email"
                  required
                  value={ownerEditEmail}
                  onChange={(e) => setOwnerEditEmail(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">رقم الجوال *</label>
                <input
                  type="text"
                  required
                  value={ownerEditPhone}
                  onChange={(e) => setOwnerEditPhone(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-right"
                />
              </div>

              <div className="flex gap-2 pt-4 justify-end border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowOwnerEditModal(false)}
                  className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-850 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingOwnerEdit}
                  className="py-2 px-6 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-slate-950 cursor-pointer border-none disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingOwnerEdit ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Show Temporary Password Once */}
      {showTempPassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in" dir="rtl">
          <div className="w-full max-w-md bg-slate-950 border-2 border-sky-500/30 rounded-3xl p-6 text-center space-y-5 shadow-2xl animate-fade-in">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/20 animate-pulse">
                <Lock className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-black text-white">تم تعيين كلمة مرور مؤقتة للمالك بنجاح!</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-sm mx-auto">
                يرجى نسخ كلمة المرور وحفظها في مكان آمن الآن. لن تتمكن من رؤية هذه الكلمة مرة أخرى بعد إغلاق هذه النافذة.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center justify-between gap-3">
              <span className="text-white font-mono text-sm font-extrabold select-all tracking-wider">{generatedTempPass}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedTempPass);
                  triggerNotification("✓ تم نسخ كلمة المرور المؤقتة بنجاح", "success");
                }}
                className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-slate-950 text-[10px] font-black border-none cursor-pointer transition"
              >
                نسخ
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTempPassModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-gray-300 cursor-pointer border border-slate-800"
              >
                لقد حفظت كلمة المرور، إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
