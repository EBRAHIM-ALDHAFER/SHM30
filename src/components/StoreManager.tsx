import React, { useState, useEffect } from "react";
import { StoreProfile, AddressProfile, StoreBankAccount, StoreDocument, ThemeColors, User, CompanyProfile } from "../types";
import { CompanyTabPanels } from "./CompanyTabPanels";
import NationalAddressForm from "./NationalAddressForm";
import { 
  Store, Plus, Search, Building, CheckCircle, Upload, Trash2, 
  AlertTriangle, CreditCard, Link, MapPin, Phone, Mail, 
  FileText, Check, X, Layers, Users, Sliders, Eye, Archive, 
  RefreshCw, TrendingUp, DollarSign, ShoppingBag, Award, 
  Globe, ShieldAlert, AlertCircle, FileWarning, Clock, Video
} from "lucide-react";
import { storeService } from "../core/database/storeService";
import { sahmIconPngUrl, sahmMiniMarkPngUrl } from "../assets/brand/sahm-brand-assets";
import { CustomIconRenderer } from "../lib/customIcons";

interface StoreManagerProps {
  theme: ThemeColors;
  allowedStores: StoreProfile[];
  setStores: (stores: StoreProfile[]) => void;
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  branches: any[];
  setBranches?: (branches: any[]) => void;
  warehouses: any[];
  setWarehouses?: (warehouses: any[]) => void;
  posUnits?: any[];
  setPosUnits?: (posUnits: any[]) => void;
  users: User[];
  triggerNotification?: (text: string, type?: "success" | "error" | "info" | "warning" | "ai") => void;
  addAuditLog?: (event: string, text: string) => void;
  onClose?: () => void;
  isInline?: boolean;
  initialActiveTab?: string;
  tenantId?: string;
  rawCompanies?: CompanyProfile[];
  setRawCompanies?: (comps: CompanyProfile[]) => void;
  userRole?: string;
}

export default function StoreManager({
  theme,
  allowedStores,
  setStores,
  activeStoreId,
  setActiveStoreId,
  branches,
  setBranches = () => {},
  warehouses,
  setWarehouses = () => {},
  posUnits = [],
  setPosUnits = () => {},
  users,
  triggerNotification = () => {},
  addAuditLog = () => {},
  onClose,
  isInline = false,
  initialActiveTab,
  tenantId,
  rawCompanies: propsRawCompanies,
  setRawCompanies: propsSetRawCompanies,
  userRole
}: StoreManagerProps) {
  const finalTenantId = tenantId;
  const isLocalMode = import.meta.env.VITE_DATA_MODE !== "supabase";
  const isPlatformUser = (() => {
    try {
      const u = localStorage.getItem("sahm_web_user") || localStorage.getItem("sahm_web_user3");
      if (u) {
        const userObj = JSON.parse(u);
        const PLATFORM_ROLES = ["platform_owner", "system_owner", "system_admin"];
        return PLATFORM_ROLES.includes(String(userObj.role || "").trim()) || userObj.username === "admin" || userObj.email === "admin@sahm.com";
      }
    } catch {}
    return false;
  })();

  if (!isPlatformUser) {
    const isInvalid = isLocalMode ? !finalTenantId : (!finalTenantId || finalTenantId === "tenant-local");
    if (isInvalid) {
      throw new Error("Security Error: Invalid or missing tenant_id.");
    }
  }
  const stores = allowedStores;
  const [searchTerm, setSearchTerm] = useState("");
  
  // Overlays / Modals for Hierarchy Management
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [branchFormName, setBranchFormName] = useState("");
  const [branchFormCity, setBranchFormCity] = useState("الرياض");
  const [branchFormAddress, setBranchFormAddress] = useState("");
  const [branchFormAddressProfile, setBranchFormAddressProfile] = useState<AddressProfile | undefined>(undefined);
  const [branchFormManager, setBranchFormManager] = useState("");
  const [branchFormPhone, setBranchFormPhone] = useState("");
  const [branchFormWh, setBranchFormWh] = useState("");
  const [branchFormType, setBranchFormType] = useState("فرع بيع");
  const [branchFormStatus, setBranchFormStatus] = useState("نشط");
  const [branchFormCompanyId, setBranchFormCompanyId] = useState("");
  const [branchFormStoreId, setBranchFormStoreId] = useState("");

  const [showPosModal, setShowPosModal] = useState(false);
  const [currentPosBranchId, setCurrentPosBranchId] = useState("");
  const [posFormName, setPosFormName] = useState("");
  const [posFormCashier, setPosFormCashier] = useState("");
  const [posFormWh, setPosFormWh] = useState("");
  const [posFormPayMethods, setPosFormPayMethods] = useState<string[]>(["cash", "card"]);
  const [posFormStatus, setPosFormStatus] = useState("نشط");

  const [showWhModal, setShowWhModal] = useState(false);
  const [whFormName, setWhFormName] = useState("");
  const [whFormType, setWhFormType] = useState("sub");
  const [whFormLocation, setWhFormLocation] = useState("");
  const [whFormCapacity, setWhFormCapacity] = useState(3000);
  const [whFormBranch, setWhFormBranch] = useState("");
  const [whFormCompanyId, setWhFormCompanyId] = useState("");

  // Handler functions for new hierarchy items
  const handleSaveBranch = () => {
    if (!branchFormName.trim()) {
      triggerNotification("يرجى إدخال اسم الفرع! ⚠️", "warning");
      return;
    }
    if (!branchFormCompanyId) {
      triggerNotification("يرجى اختيار المنشأة المرتبطة! ⚠️", "warning");
      return;
    }

    if (editingBranch) {
      const oldStoreId = editingBranch.storeId || editingBranch.store_id;
      const newStoreId = branchFormStoreId;

      const updated = branches.map(b => b.id === editingBranch.id ? {
        ...b,
        name: branchFormName,
        city: branchFormCity,
        address: branchFormAddress,
        manager: branchFormManager,
        phone: branchFormPhone,
        associatedWh: branchFormWh,
        type: branchFormType,
        status: branchFormStatus,
        companyId: branchFormCompanyId,
        company_id: branchFormCompanyId,
        storeId: newStoreId,
        store_id: newStoreId,
        addressProfile: branchFormAddressProfile,
      } : b);
      setBranches(updated);

      // Sync stores
      let updatedStores = [...stores];
      if (oldStoreId !== newStoreId) {
        updatedStores = updatedStores.map(st => {
          if (st.id === oldStoreId) {
            return {
              ...st,
              branches: (st.branches || []).filter((id: string) => id !== editingBranch.id)
            };
          }
          return st;
        });
      }
      updatedStores = updatedStores.map(st => {
        if (st.id === newStoreId) {
          const brs = st.branches || [];
          if (!brs.includes(editingBranch.id)) {
            return {
              ...st,
              branches: [...brs, editingBranch.id]
            };
          }
        }
        return st;
      });
      setStores(updatedStores);

      if (viewingStore360Id === oldStoreId || viewingStore360Id === newStoreId) {
        const currentViewedStore = updatedStores.find(st => st.id === viewingStore360Id);
        setSelectedBranches(currentViewedStore?.branches || []);
      }

      triggerNotification(`تم تحديث الفرع [${branchFormName}] بنجاح!`, "success");
    } else {
      const newBId = "br_" + Date.now();
      const newB = {
        id: newBId,
        name: branchFormName,
        city: branchFormCity,
        address: branchFormAddress,
        manager: branchFormManager,
        phone: branchFormPhone,
        associatedWh: branchFormWh,
        type: branchFormType,
        status: branchFormStatus,
        companyId: branchFormCompanyId,
        company_id: branchFormCompanyId,
        storeId: branchFormStoreId,
        store_id: branchFormStoreId,
        employees: [],
        addressProfile: branchFormAddressProfile,
        tenantId: finalTenantId,
        tenant_id: finalTenantId
      };
      setBranches([...branches, newB]);

      // Add to new store
      const updatedStores = stores.map(st => {
        if (st.id === branchFormStoreId) {
          const brs = st.branches || [];
          if (!brs.includes(newBId)) {
            return {
              ...st,
              branches: [...brs, newBId]
            };
          }
        }
        return st;
      });
      setStores(updatedStores);

      if (viewingStore360Id === branchFormStoreId) {
        setSelectedBranches([...selectedBranches, newBId]);
      }

      triggerNotification(`تمت إضافة الفرع الجديد [${branchFormName}] بنجاح!`, "success");
    }
    setShowBranchModal(false);
    setEditingBranch(null);
    setBranchFormAddressProfile(undefined);
  };

  const handleSavePos = () => {
    if (!posFormName.trim()) {
      triggerNotification("يرجى إدخال اسم نقطة البيع! ⚠️", "warning");
      return;
    }
    const targetBranchId = currentPosBranchId || branches[0]?.id;
    if (!targetBranchId) {
      triggerNotification("عذراً، يجب ربط نقطة البيع بفرع نشط! ⚠️", "warning");
      return;
    }
    const storeIdVal = (activeStoreId && activeStoreId !== "all_stores") ? activeStoreId : (stores[0]?.id || "store_1");
    const newPosId = "pos_" + Date.now();
    const newPos = {
      id: newPosId,
      name: posFormName,
      branchId: targetBranchId,
      storeId: storeIdVal,
      store_id: storeIdVal,
      cashier: posFormCashier || "موظف مالي متاح",
      defaultWh: posFormWh,
      paymentMethods: posFormPayMethods,
      status: posFormStatus || "نشط",
      isDefault: posUnits.filter((p: any) => p.branchId === targetBranchId).length === 0,
      tenantId: finalTenantId,
      tenant_id: finalTenantId
    };
    setPosUnits([...posUnits, newPos]);
    triggerNotification(`تمت إضافة نقطة البيع [${posFormName}] بنجاح!`, "success");
    setShowPosModal(false);
    setPosFormName("");
    setPosFormCashier("");
    setPosFormWh("");
  };

  const handleSaveWh = () => {
    if (!whFormName.trim()) {
      triggerNotification("يرجى إدخال اسم المستودع! ⚠️", "warning");
      return;
    }
    if (!whFormCompanyId) {
      triggerNotification("يرجى اختيار المنشأة المرتبطة بالمستودع! ⚠️", "warning");
      return;
    }
    const storeIdVal = (activeStoreId && activeStoreId !== "all_stores") ? activeStoreId : (stores[0]?.id || "store_1");
    const newWhId = "wh_" + Date.now();
    const newWh = {
      id: newWhId,
      name: whFormName,
      type: whFormType,
      location: whFormLocation || "حي عام",
      capacity: whFormCapacity || 3000,
      associatedBranch: whFormBranch,
      manager: "مسؤول اللوجستيات",
      companyId: whFormCompanyId,
      company_id: whFormCompanyId,
      storeId: storeIdVal,
      store_id: storeIdVal,
      items: [],
      tenantId: finalTenantId,
      tenant_id: finalTenantId
    };
    setWarehouses([...warehouses, newWh]);
    
    if (whFormBranch) {
      const updatedBranches = branches.map(b => b.id === whFormBranch ? {
        ...b,
        associatedWh: newWhId
      } : b);
      setBranches(updatedBranches);
    }
    
    if (viewingStore360Id && !selectedWarehouses.includes(newWhId)) {
      const updatedSWh = [...selectedWarehouses, newWhId];
      setSelectedWarehouses(updatedSWh);
      const updatedStores = stores.map(st => st.id === viewingStore360Id ? {
        ...st,
        warehouses: updatedSWh
      } : st);
      setStores(updatedStores);
    }
    
    triggerNotification(`تمت إضافة المستودع اللوجستي [${whFormName}] بنجاح!`, "success");
    setShowWhModal(false);
    setWhFormName("");
    setWhFormLocation("");
  };

  const handleEditBranch = (b: any) => {
    setEditingBranch(b);
    setBranchFormName(b.name || "");
    setBranchFormCity(b.city || "الرياض");
    setBranchFormAddress(b.address || "");
    setBranchFormManager(b.manager || "");
    setBranchFormPhone(b.phone || "");
    setBranchFormWh(b.associatedWh || "");
    setBranchFormType(b.type || "فرع بيع");
    setBranchFormStatus(b.status || "نشط");
    setBranchFormCompanyId(b.companyId || b.company_id || "");
    setBranchFormStoreId(b.storeId || b.store_id || "");
    setBranchFormAddressProfile(b.addressProfile || undefined);
    setShowBranchModal(true);
  };

  const handleArchiveBranch = (b: any) => {
    const isCurrentlyArchived = b.status === "غير نشط" || b.status === "مؤرشف";
    const nextStatus = isCurrentlyArchived ? "نشط" : "مؤرشف";
    const updated = branches.map(item => item.id === b.id ? { ...item, status: nextStatus } : item);
    setBranches(updated);
    triggerNotification(
      isCurrentlyArchived 
        ? `تم تعيين الفرع [${b.name}] كنشط مفعّل` 
        : `تمت أرشفة الفرع [${b.name}] بنجاح، لن يظهر كخيار محدد تلقائيّاً`, 
      "info"
    );
  };

  const handleLinkWarehouse = (branchId: string) => {
    const b = branches.find(item => item.id === branchId);
    if (b) {
      handleEditBranch(b);
      triggerNotification(`يرجى تحديد المستودع لربطه بالفرع [${b.name}] وحفظ التعديلات. 📦`, "info");
    }
  };

  const [expandedBranchPosIds, setExpandedBranchPosIds] = useState<string[]>([]);
  const [viewingStore360Id, setViewingStore360Id] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"general" | "legal" | "contact" | "address" | "bank" | "docs" | "platforms" | "relations">("general");
  const [store360ActiveTab, setStore360ActiveTab] = useState<"overview" | "legal_docs" | "relations" | "platforms" | "performance" | "edit" | "cameras">("overview");

  // Branch Camera States for premium feature demo/sim
  const [storeCameras, setStoreCameras] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_branch_cameras");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [cameraSelectedBranchId, setCameraSelectedBranchId] = useState("");
  const [editingCameraId, setEditingCameraId] = useState<string | null>(null);
  const [cameraFormName, setCameraFormName] = useState("");
  const [cameraFormUrl, setCameraFormUrl] = useState("");

  // Top-level View Tab State
  const [mainActiveTab, setMainActiveTab] = useState<"overview" | "companies" | "stores" | "branches" | "warehouses" | "connections">("overview");

  useEffect(() => {
    if (initialActiveTab && ["overview", "companies", "stores", "branches", "warehouses", "connections"].includes(initialActiveTab)) {
      setMainActiveTab(initialActiveTab as any);
    }
  }, [initialActiveTab]);

  // Company management states (isolated per tenant_id)
  const [localRawCompanies, setLocalRawCompanies] = useState<CompanyProfile[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_companies");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    
    // Seed initial default company
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
      tenant_id: finalTenantId
    };
    try {
      localStorage.setItem("sahm_web_companies", JSON.stringify([defaultCompany]));
    } catch {}
    return [defaultCompany];
  });

  const rawCompanies = propsRawCompanies !== undefined ? propsRawCompanies : localRawCompanies;
  const setRawCompanies = propsSetRawCompanies !== undefined ? propsSetRawCompanies : setLocalRawCompanies;

  const companies = rawCompanies.filter(item => {
    const itemTenant = item.tenant_id;
    if (!isPlatformUser) {
      const isInvalid = isLocalMode ? !itemTenant : (!itemTenant || itemTenant === "tenant-local");
      if (isInvalid) {
        throw new Error("Security Error: Invalid or missing tenant_id.");
      }
    }
    return (isPlatformUser && !finalTenantId) ? true : (itemTenant === finalTenantId);
  });

  const saveCompaniesToStorage = (comps: CompanyProfile[]) => {
    const otherTenants = rawCompanies.filter(item => {
      const itemTenant = item.tenant_id;
      if (!isPlatformUser) {
        const isInvalid = isLocalMode ? !itemTenant : (!itemTenant || itemTenant === "tenant-local");
        if (isInvalid) {
          throw new Error("Security Error: Invalid or missing tenant_id.");
        }
      }
      return (isPlatformUser && !finalTenantId) ? false : (itemTenant !== finalTenantId);
    });
    const updated = comps.map(item => ({ ...item, tenant_id: finalTenantId || "tenant-local" }));
    const finalVal = (isPlatformUser && !finalTenantId) ? comps : [...otherTenants, ...updated];
    setRawCompanies(finalVal);
    try {
      localStorage.setItem("sahm_web_companies", JSON.stringify(finalVal));
    } catch (e) {}
  };

  const [viewingCompany360Id, setViewingCompany360Id] = useState<string | null>(null);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [company360ActiveTab, setCompany360ActiveTab] = useState<"overview" | "legal" | "stores" | "branches" | "warehouses" | "users" | "docs" | "timeline">("overview");

  // Company Form States
  const [compFormName, setCompFormName] = useState("");
  const [compFormLegalName, setCompFormLegalName] = useState("");
  const [compFormCrNumber, setCompFormCrNumber] = useState("");
  const [compFormCrDate, setCompFormCrDate] = useState("");
  const [compFormCrExpiryDate, setCompFormCrExpiryDate] = useState("");
  const [compFormVatNumber, setCompFormVatNumber] = useState("");
  const [compFormUnified700, setCompFormUnified700] = useState("");
  const [compFormAddress, setCompFormAddress] = useState("");
  const [compFormManager, setCompFormManager] = useState("");
  const [compFormPhone, setCompFormPhone] = useState("");
  const [compFormEmail, setCompFormEmail] = useState("");
  const [compFormBankAccount, setCompFormBankAccount] = useState("");
  const [compFormStatus, setCompFormStatus] = useState<"active" | "suspended" | "draft">("active");
  const [compFormSubscription, setCompFormSubscription] = useState("الباقة الاحترافية الذهبية");
  const [compFormLogo, setCompFormLogo] = useState("");
  const [compFormCover, setCompFormCover] = useState("");
  const [compFormInvoiceLogo, setCompFormInvoiceLogo] = useState("");
  const [compFormStamp, setCompFormStamp] = useState("");

  const handleOpenCreateCompany = () => {
    setCompFormName("");
    setCompFormLegalName("");
    setCompFormCrNumber("");
    setCompFormCrDate("");
    setCompFormCrExpiryDate("");
    setCompFormVatNumber("");
    setCompFormUnified700("");
    setCompFormAddress("");
    setCompFormManager("");
    setCompFormPhone("");
    setCompFormEmail("");
    setCompFormBankAccount("");
    setCompFormStatus("active");
    setCompFormSubscription("الباقة الاحترافية الذهبية");
    setCompFormLogo("");
    setCompFormCover("");
    setCompFormInvoiceLogo("");
    setCompFormStamp("");
    
    setIsCreatingCompany(true);
    setViewingCompany360Id(null);
  };

  const handleEditCompany = (c: CompanyProfile) => {
    setCompFormName(c.name);
    setCompFormLegalName(c.companyLegalName);
    setCompFormCrNumber(c.crNumber);
    setCompFormCrDate(c.crDate);
    setCompFormCrExpiryDate(c.crExpiryDate);
    setCompFormVatNumber(c.vatNumber || "");
    setCompFormUnified700(c.unifiedNumber700 || "");
    setCompFormAddress(c.address || "");
    setCompFormManager(c.managerName || "");
    setCompFormPhone(c.phone || "");
    setCompFormEmail(c.email || "");
    setCompFormBankAccount(c.bankAccount || "");
    setCompFormStatus(c.status);
    setCompFormSubscription(c.subscriptionPlan || "الباقة الاحترافية الذهبية");
    setCompFormLogo(c.logoUrl || "");
    setCompFormCover(c.coverUrl || "");
    setCompFormInvoiceLogo((c as any).invoiceLogoUrl || "");
    setCompFormStamp((c as any).stampUrl || "");
    
    setIsCreatingCompany(true);
    setViewingCompany360Id(c.id);
    setCompany360ActiveTab("overview"); // reset tab back to overview so when they return it's on overview tab
  };

  const handleSaveCompany = () => {
    if (!compFormName.trim()) {
      triggerNotification("يرجى إدخال اسم المنشأة! ⚠️", "warning");
      return;
    }
    if (!compFormCrNumber.trim()) {
      triggerNotification("يرجى إدخال السجل التجاري الرسمي! ⚠️", "warning");
      return;
    }

    if (viewingCompany360Id) {
      const updated = companies.map(c => {
        if (c.id === viewingCompany360Id) {
          return {
            ...c,
            name: compFormName,
            companyLegalName: compFormLegalName,
            crNumber: compFormCrNumber,
            crDate: compFormCrDate,
            crExpiryDate: compFormCrExpiryDate,
            vatNumber: compFormVatNumber,
            unifiedNumber700: compFormUnified700,
            address: compFormAddress,
            managerName: compFormManager,
            phone: compFormPhone,
            email: compFormEmail,
            bankAccount: compFormBankAccount,
            status: compFormStatus,
            subscriptionPlan: compFormSubscription,
            logoUrl: compFormLogo,
            coverUrl: compFormCover,
            invoiceLogoUrl: compFormInvoiceLogo,
            stampUrl: compFormStamp
          } as any;
        }
        return c;
      });
      saveCompaniesToStorage(updated);
      triggerNotification(`تم تحديث بيانات منشأة [${compFormName}] بنجاح!`, "success");
      setIsCreatingCompany(false);
    } else {
      const newCompId = "comp_" + Date.now();
      const newComp: CompanyProfile = {
        id: newCompId,
        name: compFormName,
        companyLegalName: compFormLegalName || compFormName,
        crNumber: compFormCrNumber,
        crDate: compFormCrDate || "١٤٤٥-٠١-٠١",
        crExpiryDate: compFormCrExpiryDate || "١٤٥٠-٠١-٠١",
        vatNumber: compFormVatNumber,
        unifiedNumber700: compFormUnified700,
        address: compFormAddress,
        managerName: compFormManager,
        phone: compFormPhone,
        email: compFormEmail,
        bankAccount: compFormBankAccount,
        status: compFormStatus,
        subscriptionPlan: compFormSubscription,
        logoUrl: compFormLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop",
        coverUrl: compFormCover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
        invoiceLogoUrl: compFormInvoiceLogo,
        stampUrl: compFormStamp,
        createdAt: new Date().toISOString().split("T")[0]
      } as any;
      const updated = [...companies, newComp];
      saveCompaniesToStorage(updated);
      triggerNotification(`تم تسجيل وتأسيس المنشأة [${compFormName}] بنجاح! 🏢✨`, "success");
      setIsCreatingCompany(false);
      setViewingCompany360Id(newCompId);
      setCompany360ActiveTab("overview");
    }
  };

  const [formCompanyId, setFormCompanyId] = useState("company_1");

  const [storesFilter, setStoresFilter] = useState<"active" | "archived">("active");
  const [storeToDelete, setStoreToDelete] = useState<{ id: string; name: string } | null>(null);
  const [customTimelineEvents, setCustomTimelineEvents] = useState<Record<string, { id: string; date: string; icon: any; text: string; type: string }[]>>({});

  const addTimelineEvent = (storeId: string, text: string, type: string) => {
    const newEvt = {
      id: String(Date.now() + Math.random()),
      date: new Date().toISOString().split("T")[0],
      icon: ShieldAlert,
      text,
      type
    };
    setCustomTimelineEvents(prev => ({
      ...prev,
      [storeId]: [newEvt, ...(prev[storeId] || [])]
    }));
  };

  // FORM STATES
  const [formName, setFormName] = useState("");
  const [formTradeName, setFormTradeName] = useState("");
  const [formCompanyLegalName, setFormCompanyLegalName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  const [formCrNumber, setFormCrNumber] = useState("");
  const [formCrDate, setFormCrDate] = useState("");
  const [formCrExpiryDate, setFormCrExpiryDate] = useState("");
  const [formVatNumber, setFormVatNumber] = useState("");
  const [formUnified700, setFormUnified700] = useState("");
  const [formZakatNumber, setFormZakatNumber] = useState("");
  const [formMaroofNumber, setFormMaroofNumber] = useState("");
  const [formLaborNumber, setFormLaborNumber] = useState("");
  const [formEstablishmentNumber, setFormEstablishmentNumber] = useState("");

  const [formPhone, setFormPhone] = useState("");
  const [formSupportPhone, setFormSupportPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSupportEmail, setFormSupportEmail] = useState("");
  const [formWebsite, setFormWebsite] = useState("");

  // Address
  const [formShortAddress, setFormShortAddress] = useState("");
  const [formBuildingNum, setFormBuildingNum] = useState("");
  const [formStreetName, setFormStreetName] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formPostalCode, setFormPostalCode] = useState("");
  const [formAdditionalNum, setFormAdditionalNum] = useState("");
  const [formUnitNum, setFormUnitNum] = useState("");
  const [formCountry, setFormCountry] = "المملكة العربية السعودية";
  const [formMapLink, setFormMapLink] = useState("");
  const [formGpsCoords, setFormGpsCoords] = useState("");

  // Lists
  const [bankAccountsList, setBankAccountsList] = useState<StoreBankAccount[]>([]);
  const [newBankName, setNewBankName] = useState("");
  const [newBankIban, setNewBankIban] = useState("");
  const [newBankAccNum, setNewBankAccNum] = useState("");
  const [newBankBeneficiary, setNewBankBeneficiary] = useState("");

  const [documentsList, setDocumentsList] = useState<StoreDocument[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<any>("cr");

  // Multi-Relations Linkages (Ids)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Platforms State
  const [sallaConnected, setSallaConnected] = useState(false);
  const [sallaTax, setSallaTax] = useState("");
  const [sallaApiKey, setSallaApiKey] = useState("");
  const [zidConnected, setZidConnected] = useState(false);
  const [zidStoreId, setZidStoreId] = useState("");
  const [zidToken, setZidToken] = useState("");
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [shopifyUrl, setShopifyUrl] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");
  const [wooConnected, setWooConnected] = useState(false);
  const [wooKey, setWooKey] = useState("");
  const [wooSecret, setWooSecret] = useState("");
  const [amazonConnected, setAmazonConnected] = useState(false);
  const [noonConnected, setNoonConnected] = useState(false);

  // Logos/Stamps simulation URLs
  const [uploadedLogo, setUploadedLogo] = useState("");
  const [uploadedCover, setUploadedCover] = useState("");
  const [uploadedInvoiceLogo, setUploadedInvoiceLogo] = useState("");
  const [uploadedStamp, setUploadedStamp] = useState("");

  // Quick direct image edit overlay states
  const [quickImageStoreObj, setQuickImageStoreObj] = useState<any | null>(null);
  const [quickImageField, setQuickImageField] = useState<"logoUrl" | "coverUrl" | null>(null);
  const [quickImageValue, setQuickImageValue] = useState("");
  const [quickImageUploadBase64, setQuickImageUploadBase64] = useState("");

  const handleTriggerQuickImageUpdate = (stObj: any, field: "logoUrl" | "coverUrl") => {
    setQuickImageStoreObj(stObj);
    setQuickImageField(field);
    setQuickImageValue(stObj[field] || "");
    setQuickImageUploadBase64("");
  };

  const handleSaveQuickImageUpdate = () => {
    if (!quickImageStoreObj || !quickImageField) return;
    const finalVal = quickImageUploadBase64 || quickImageValue.trim();
    
    // Update the store in memory & database list
    const targetStore = stores.find(s => s.id === quickImageStoreObj.id);
    if (targetStore) {
      targetStore[quickImageField] = finalVal;
      // If we currently view or selected this store, sync standard form states too
      if (targetStore.id === activeStoreId) {
        if (quickImageField === "logoUrl") setUploadedLogo(finalVal);
        if (quickImageField === "coverUrl") setUploadedCover(finalVal);
      }
      
      // Save
      storeService.create(targetStore);
      triggerNotification(`تم تحديث ${quickImageField === "logoUrl" ? "شعار" : "غلاف"} المتجر بنجاح ✓`, "success");
    }
    
    setQuickImageStoreObj(null);
    setQuickImageField(null);
    setQuickImageUploadBase64("");
  };

  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  // Address lookup DB
  const saudiAddressDecoder: Record<string, Partial<AddressProfile>> = {
    "RDOD1194": {
      buildingNumber: "1194",
      streetName: "طريق الملك فهد الفرعي",
      district: "حي الصحافة",
      city: "الرياض",
      region: "منطقة الرياض",
      postalCode: "13321",
      additionalNumber: "3491",
      unitNumber: "12",
      mapLink: "https://maps.google.com/?q=24.7942,46.6581",
      gpsCoordinates: "24.7942, 46.6581"
    },
    "JMDD9951": {
      buildingNumber: "9951",
      streetName: "شارع هارون الرشيد الموازي لشارع إسكان الفوزان",
      district: "حي السلي الصناعي",
      city: "الرياض",
      region: "منطقة الرياض",
      postalCode: "14321",
      additionalNumber: "5521",
      unitNumber: "3",
      mapLink: "https://maps.google.com/?q=24.6342,46.8211",
      gpsCoordinates: "24.6342, 46.8211"
    }
  };

  const currentStoreObjOn360 = stores.find(s => s.id === viewingStore360Id);

  // Store timeline simulated events logs (which we persist with a local registry or mock dynamically)
  const getSimulatedTimelineForStore = (id: string, name: string) => {
    const base = [
      { id: "1", date: "٢٠٢٦-٠٥-١٤", icon: ShieldAlert, text: `تم فحص وتحديث رخصة السجل التجاري والاعتراف بالرمز الضريبي للمنشأة والضريبة الموحدة`, type: "system" },
      { id: "2", date: "٢٠٢٦-٠٤-٠٢", icon: Link, text: `تم ربط وتوثيق منصة سلة (Salla) وبدء جرد ومزامنة ١٥٠ منتجاً وقراءة حركات المبيعات للمتجر [${name}]`, type: "integration" },
      { id: "3", date: "٢٠٢٦-٠٣-١٥", icon: CreditCard, text: `تم تعيين الحساب البنكي لمصرف الراجحي كحساب رئيسي ومستفيد معتمد للتسويات`, type: "finance" },
      { id: "4", date: "٢٠٢٦-٠٢-٢٠", icon: MapPin, text: `تم جرد العنوان الوطني السكني المشفر المعتمد وفك تكويد بوابة سبل SPL الجغرافية بنجاح`, type: "address" },
      { id: "5", date: "٢٠٢٦-٠١-١٠", icon: Store, text: `تم تأسيس الكيان القانوني لمتجر [${name}] وإلحاقه تحت مظومة سهم ERP بنظام المتاجر المتعددة الشامل`, type: "init" }
    ];
    const custom = customTimelineEvents[id] || [];
    return [...custom, ...base];
  };

  // Switch store instantly
  const handleActiveStoreSwitch = (id: string, name: string) => {
    setActiveStoreId(id);
    triggerNotification(`تم تفعيل وتحويل المتجر الحالي إلى [${name}] بنجاح! 🔄👑`, "success");
  };

  const handleFetchAddressDetails = () => {
    const code = formShortAddress.trim().toUpperCase();
    if (!code) {
      triggerNotification("الرجاء إدخال كود العنوان السريع المكون من 8 أحرف وأرقام معاً (مثال: RDOD1194).", "error");
      return;
    }
    setIsFetchingAddress(true);
    triggerNotification("جاري معالجة الكود والاتصال بالنظام الوطني الموحد سبل SPL...", "info");
    
    setTimeout(() => {
      const found = saudiAddressDecoder[code];
      if (found) {
        setFormBuildingNum(found.buildingNumber || "");
        setFormStreetName(found.streetName || "");
        setFormDistrict(found.district || "");
        setFormCity(found.city || "");
        setFormRegion(found.region || "");
        setFormPostalCode(found.postalCode || "");
        setFormAdditionalNum(found.additionalNumber || "");
        setFormUnitNum(found.unitNumber || "");
        setFormMapLink(found.mapLink || "");
        setFormGpsCoords(found.gpsCoordinates || "");
        triggerNotification(`🎉 نجاح: وجدنا العنوان السكني المعتمد لـ ${code} وفك ترميزه بالكامل!`, "success");
      } else {
        // Fallback generator
        setFormBuildingNum("2312");
        setFormStreetName("طريق الملك عبدالعزيز الفرعي");
        setFormDistrict("حي الياسمين");
        setFormCity("الرياض");
        setFormRegion("منطقة الرياض");
        setFormPostalCode("13322");
        setFormAdditionalNum("9912");
        setFormUnitNum("5");
        setFormMapLink(`https://maps.google.com/?q=24.81,46.64`);
        setFormGpsCoords("24.8112, 46.6432");
        triggerNotification(`🇸🇦 تم التوقيع والترخيص التلقائي للموقع الجديد على خرائط سبل الوطنية بنجاح!`, "info");
      }
      setIsFetchingAddress(false);
    }, 1000);
  };

  const handleAutoFetchCrData = (crCode: string) => {
    const cleanCr = crCode.trim();
    if (!cleanCr) {
      triggerNotification("عذراً: الرجاء إدخال رقم السجل التجاري أولاً لنظام الاستعلام.", "error");
      return;
    }
    if (cleanCr.length < 5 || isNaN(Number(cleanCr))) {
      triggerNotification("رقم السجل التجاري غير صالح. يجب أن يتكون من أرقام فقط (مثال: 1010345678).", "warning");
      return;
    }

    setIsFetchingAddress(true);
    triggerNotification("جاري الاتصال والتحقق من منصة الاستعلام الموحد بوزارة التجارة والربط مع الهيئة الوطنية للبيانات... ⚡", "info");

    setTimeout(() => {
      let name = "";
      let tradeName = "";
      let legalName = "";
      let desc = "";
      let expiry = "١٤٥٢-٠٨-٢١";
      let issue = "١٤٤٧-٠٨-٢١";
      let vat = "310" + Math.floor(100000000000 + Math.random() * 900000000000);
      let unified700 = "701" + Math.floor(1000000 + Math.random() * 900000);
      let labor = "21-" + Math.floor(100000 + Math.random() * 900000) + "-" + Math.floor(10 + Math.random() * 90);
      let establishmentNum = "705" + Math.floor(100000 + Math.random() * 900000);
      
      // National Address
      let shortAddr = "RDOD" + Math.floor(1000 + Math.random() * 9000);
      let buildNum = String(Math.floor(1000 + Math.random() * 9000));
      let street = "طريق الملك عبدالعزيز الفرعي";
      let district = "حي الياسمين";
      let city = "الرياض";
      let region = "منطقة الرياض";
      let postal = String(Math.floor(10000 + Math.random() * 90000));
      let addNum = String(Math.floor(1000 + Math.random() * 9000));
      let unit = String(Math.floor(1 + Math.random() * 15));
      let map = `https://maps.google.com/?q=24.8212,46.6345`;
      let gps = "24.8212, 46.6345";

      if (cleanCr === "1010345678" || cleanCr.startsWith("1010")) {
        name = "مراسيم الطيب";
        tradeName = "مؤسسة مراسيم الطيب للعود والعطور";
        legalName = "شركة لؤلؤة مراسيم التجارية ذ.م.م";
        desc = "المتجر السعودي الأول المتخصص بزيوت العود الفاخرة والبخور والمسك المعتمد بوزارة التجارة.";
        shortAddr = "RDOD1194";
        buildNum = "1194";
        street = "طريق الملك فهد الفرعي";
        district = "حي الصحافة";
        city = "الرياض";
        region = "منطقة الرياض";
        postal = "13321";
        addNum = "3491";
        unit = "12";
        map = "https://maps.google.com/?q=24.7942,46.6581";
        gps = "24.7942, 46.6581";
      } else if (cleanCr === "4030567890" || cleanCr.startsWith("4030")) {
        name = "عطور الجزيرة";
        tradeName = "شركة الجزيرة لإنتاج واستيراد دهن العود";
        legalName = "شركة عطور الجزيرة ذ.م.م";
        desc = "فخامة الطيب الشرقي والأعواد الطبيعية المستوردة من غابات كمبوديا الراقية.";
        shortAddr = "JMDD9951";
        buildNum = "9951";
        street = "شارع هارون الرشيد الموازي لشارع إسكان الفوزان";
        district = "حي السلي الصناعي";
        city = "الرياض";
        region = "منطقة الرياض";
        postal = "14321";
        addNum = "5521";
        unit = "3";
        map = "https://maps.google.com/?q=24.6342,46.8211";
        gps = "24.6342, 46.8211";
      } else {
        const seed = Number(cleanCr.substring(0, 4)) || 1234;
        const brandNames = ["أنفاس العود", "روائع الطيب", "مسك ونخبة", "سدرة البخور", "قصور العود", "عطر ومبخرة"];
        const index = seed % brandNames.length;
        name = brandNames[index];
        tradeName = `شركة ${name} للتجارة المحدودة`;
        legalName = `شركة ${name} والمقاولات القابضة`;
        desc = `أجود أنواع البخور والعطور المستخرجة محلياً بعناية فائقة لتلائم أصحاب الذوق الرفيع.`;
      }

      setFormName(name);
      setFormTradeName(tradeName);
      setFormCompanyLegalName(legalName);
      setFormDescription(desc);
      setFormCrDate(issue);
      setFormCrExpiryDate(expiry);
      setFormVatNumber(vat);
      setFormUnified700(unified700);
      setFormLaborNumber(labor);
      setFormEstablishmentNumber(establishmentNum);

      // National Address states
      setFormShortAddress(shortAddr);
      setFormBuildingNum(buildNum);
      setFormStreetName(street);
      setFormDistrict(district);
      setFormCity(city);
      setFormRegion(region);
      setFormPostalCode(postal);
      setFormAdditionalNum(addNum);
      setFormUnitNum(unit);
      setFormMapLink(map);
      setFormGpsCoords(gps);

      setIsFetchingAddress(false);
      triggerNotification(`🎉 نجاح: وجدنا بيانات السجل التجاري ${cleanCr} وتم تعبئة العنوان الوطني بالكامل!`, "success");
    }, 1200);
  };

  // CRUD Actions
  const handleAddBankAccount = () => {
    if (!newBankName || !newBankIban) {
      triggerNotification("الرجاء تحديد البنك ورقم الآيبان (IBAN) مسبقاً لحفظه لمتطلبات التسوية.", "error");
      return;
    }
    if (!newBankIban.toUpperCase().startsWith("SA") || newBankIban.length !== 24) {
      triggerNotification("خطأ هيكلي بالآيبان: يجب أن يبدأ بـ SA ويتألف من 24 رمزاً تماماً.", "error");
      return;
    }
    const acc: StoreBankAccount = {
      id: "ba_" + Date.now(),
      bankName: newBankName,
      iban: newBankIban.toUpperCase(),
      accountNumber: newBankAccNum || String(Math.floor(100000000000 + Math.random() * 900000000000)),
      beneficiaryName: newBankBeneficiary || formTradeName || formName || "مراسيم الطيب"
    };
    setBankAccountsList([...bankAccountsList, acc]);
    setNewBankName("");
    setNewBankIban("");
    setNewBankAccNum("");
    setNewBankBeneficiary("");
    triggerNotification("تم إدراج وقيد الحساب المالي الجديد بالمتجر بنجاح ✨", "success");
  };

  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const newDoc: StoreDocument = {
      id: "doc_" + Date.now(),
      name: newDocName || file.name,
      category: newDocCategory,
      uploadedAt: new Date().toISOString().substring(0, 10),
      fileSize: (file.size / 1024).toFixed(1) + " KB"
    };
    setDocumentsList([...documentsList, newDoc]);
    setNewDocName("");
    triggerNotification(`🔒 تم مسح الملف ورفعه بأمان مشفر كلياً SSL وتوثيقه: ${file.name}`, "success");
  };

  // Open Edit Modes
  const handleOpenEdit = (s: StoreProfile) => {
    setViewingStore360Id(s.id);
    setStore360ActiveTab("overview");
    setIsCreatingNew(false);
    setActiveFormTab("general");
    
    // Fill states
    setFormCompanyId(s.companyId || "company_1");
    setFormName(s.name);
    setFormTradeName(s.tradeName);
    setFormCompanyLegalName(s.companyLegalName);
    setFormDescription(s.description);
    setFormCrNumber(s.crNumber);
    setFormCrDate(s.crDate);
    setFormCrExpiryDate(s.crExpiryDate);
    setFormVatNumber(s.vatNumber);
    setFormUnified700(s.unifiedNumber700);
    setFormZakatNumber(s.zakatNumber || "");
    setFormMaroofNumber(s.maroofNumber || "");
    setFormLaborNumber(s.ministryOfLaborNumber || "");
    setFormEstablishmentNumber(s.establishmentNumber || "");
    setFormPhone(s.phone);
    setFormSupportPhone(s.supportPhone || "");
    setFormEmail(s.email);
    setFormSupportEmail(s.supportEmail || "");
    setFormWebsite(s.website || "");

    setFormShortAddress(s.address.shortAddress || "");
    setFormBuildingNum(s.address.buildingNumber || "");
    setFormStreetName(s.address.streetName || "");
    setFormDistrict(s.address.district || "");
    setFormCity(s.address.city || "");
    setFormRegion(s.address.region || "");
    setFormPostalCode(s.address.postalCode || "");
    setFormAdditionalNum(s.address.additionalNumber || "");
    setFormUnitNum(s.address.unitNumber || "");
    setFormMapLink(s.address.mapLink || "");
    setFormGpsCoords(s.address.gpsCoordinates || "");

    setBankAccountsList(s.bankAccounts || []);
    setDocumentsList(s.documents || []);
    setSelectedBranches(s.branches || []);
    setSelectedWarehouses(s.warehouses || []);
    setSelectedUsers(s.users || []);

    setSallaConnected(s.platforms?.salla?.isConnected || false);
    setSallaTax(s.platforms?.salla?.taxNumber || "");
    setSallaApiKey(s.platforms?.salla?.apiKey || "");
    setZidConnected(s.platforms?.zid?.isConnected || false);
    setZidStoreId(s.platforms?.zid?.storeId || "");
    setZidToken(s.platforms?.zid?.managerToken || "");
    setShopifyConnected(s.platforms?.shopify?.isConnected || false);
    setShopifyUrl(s.platforms?.shopify?.storeUrl || "");
    setShopifyToken(s.platforms?.shopify?.accessToken || "");
    setWooConnected(s.platforms?.wooCommerce?.isConnected || false);
    setWooKey(s.platforms?.wooCommerce?.consumerKey || "");
    setWooSecret(s.platforms?.wooCommerce?.consumerSecret || "");
    setAmazonConnected(!!(s as any).amazonConnected);
    setNoonConnected(!!(s as any).noonConnected);

    setUploadedLogo(s.logoUrl || "");
    setUploadedCover(s.coverUrl || "");
    setUploadedInvoiceLogo(s.invoiceLogoUrl || "");
    setUploadedStamp(s.stampUrl || "");
  };

  const handleOpenCreateNew = () => {
    if (activeStoreId === "all_stores") {
      triggerNotification("⚠️ لا يمكن إنشاء وتأسيس منشأة جديدة في وضع العرض الموحد لجميع المتاجر. يرجى اختيار متجر محدد أولاً.", "error");
      return;
    }
    setViewingStore360Id(null);
    setIsCreatingNew(true);
    setActiveFormTab("general");

    setFormName("");
    setFormTradeName("");
    setFormCompanyLegalName("");
    setFormDescription("");
    setFormCrNumber("");
    setFormCrDate("");
    setFormCrExpiryDate("");
    setFormVatNumber("");
    setFormUnified700("");
    setFormZakatNumber("");
    setFormMaroofNumber("");
    setFormLaborNumber("");
    setFormEstablishmentNumber("");
    setFormPhone("");
    setFormSupportPhone("");
    setFormEmail("");
    setFormSupportEmail("");
    setFormWebsite("");

    setFormShortAddress("");
    setFormBuildingNum("");
    setFormStreetName("");
    setFormDistrict("");
    setFormCity("");
    setFormRegion("");
    setFormPostalCode("");
    setFormAdditionalNum("");
    setFormUnitNum("");
    setFormMapLink("");
    setFormGpsCoords("");

    setBankAccountsList([]);
    setDocumentsList([]);
    setSelectedBranches([]);
    setSelectedWarehouses([]);
    setSelectedUsers([]);

    setSallaConnected(false);
    setZidConnected(false);
    setShopifyConnected(false);
    setWooConnected(false);
    setAmazonConnected(false);
    setNoonConnected(false);

    setUploadedLogo("");
    setUploadedCover("");
    setUploadedInvoiceLogo("");
    setUploadedStamp("");
  };

  const handleSaveStore = () => {
    if (activeStoreId === "all_stores") {
      triggerNotification("⚠️ لا يمكن تعديل أو حفظ تفاصيل المنشآت والبيانات القانونية والبنكية في وضع العرض الموحد لجميع المتاجر. يرجى تفعيل متجر محدد أولاً.", "error");
      return;
    }
    if (!formName.trim() || !formCrNumber.trim()) {
      triggerNotification("عذراً: حقل اسم المتجر ورقم السجل التجاري الرسمي إلزامي التوافر لحفظ المنشأة.", "error");
      return;
    }

    const addr: AddressProfile = {
      shortAddress: formShortAddress,
      buildingNumber: formBuildingNum,
      streetName: formStreetName,
      district: formDistrict,
      city: formCity,
      region: formRegion,
      postalCode: formPostalCode,
      additionalNumber: formAdditionalNum,
      unitNumber: formUnitNum,
      country: "المملكة العربية السعودية",
      mapLink: formMapLink,
      gpsCoordinates: formGpsCoords
    };

    const plat = {
      salla: { isConnected: sallaConnected, taxNumber: sallaTax, apiKey: sallaApiKey },
      zid: { isConnected: zidConnected, storeId: zidStoreId, managerToken: zidToken },
      shopify: { isConnected: shopifyConnected, storeUrl: shopifyUrl, accessToken: shopifyToken },
      wooCommerce: { isConnected: wooConnected, consumerKey: wooKey, consumerSecret: wooSecret }
    };

    if (isCreatingNew) {
      const newSid = "store_" + Date.now();
      const newStore: StoreProfile & { company_id: string; store_id: string; amazonConnected?: boolean; noonConnected?: boolean } = {
        id: newSid,
        company_id: formCompanyId,
        companyId: formCompanyId,
        store_id: newSid,
        name: formName,
        tradeName: formTradeName || formName,
        companyLegalName: formCompanyLegalName || formName,
        description: formDescription,
        logoUrl: uploadedLogo || "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=120&auto=format&fit=crop",
        coverUrl: uploadedCover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
        invoiceLogoUrl: uploadedInvoiceLogo,
        stampUrl: uploadedStamp,
        crNumber: formCrNumber,
        crDate: formCrDate || "١٤٤٥-٠٥-١٢",
        crExpiryDate: formCrExpiryDate || "١٤٥٠-٠٥-١٢",
        vatNumber: formVatNumber,
        unifiedNumber700: formUnified700 || "700" + Math.floor(1000000 + Math.random() * 9000000),
        zakatNumber: formZakatNumber,
        maroofNumber: formMaroofNumber,
        ministryOfLaborNumber: formLaborNumber,
        establishmentNumber: formEstablishmentNumber,
        phone: formPhone,
        supportPhone: formSupportPhone,
        email: formEmail,
        supportEmail: formSupportEmail,
        website: formWebsite,
        address: addr,
        bankAccounts: bankAccountsList,
        documents: documentsList,
        branches: selectedBranches,
        warehouses: selectedWarehouses,
        users: selectedUsers,
        platforms: plat,
        isActive: true,
        isDefault: stores.length === 0,
        amazonConnected: amazonConnected,
        noonConnected: noonConnected
      };

      const newList = [...stores, newStore];
      setStores(newList);
      storeService.create(newStore); // Unified database persistence
      addAuditLog("تأسيس متجر جديد كلياً", `تم قيد السجل الضريبي والهوية الوطنية للمتجر الجديد: ${formName}`);
      triggerNotification(`تم قيد وتأسيس المتجر المؤسسي [${formName}] بنجاح في قاعدة سهم دقة! 🎯🎉`, "success");
      
      setIsCreatingNew(false);
      setViewingStore360Id(newSid);
    } else if (viewingStore360Id) {
      const updatedList = stores.map(st => {
        if (st.id === viewingStore360Id) {
          return {
            ...st,
            company_id: formCompanyId,
            companyId: formCompanyId,
            store_id: st.id,
            name: formName,
            tradeName: formTradeName,
            companyLegalName: formCompanyLegalName,
            description: formDescription,
            logoUrl: uploadedLogo,
            coverUrl: uploadedCover,
            invoiceLogoUrl: uploadedInvoiceLogo,
            stampUrl: uploadedStamp,
            crNumber: formCrNumber,
            crDate: formCrDate,
            crExpiryDate: formCrExpiryDate,
            vatNumber: formVatNumber,
            unifiedNumber700: formUnified700,
            zakatNumber: formZakatNumber,
            maroofNumber: formMaroofNumber,
            ministryOfLaborNumber: formLaborNumber,
            establishmentNumber: formEstablishmentNumber,
            phone: formPhone,
            supportPhone: formSupportPhone,
            email: formEmail,
            supportEmail: formSupportEmail,
            website: formWebsite,
            address: addr,
            bankAccounts: bankAccountsList,
            documents: documentsList,
            branches: selectedBranches,
            warehouses: selectedWarehouses,
            users: selectedUsers,
            platforms: plat,
            amazonConnected: amazonConnected,
            noonConnected: noonConnected
          } as any;
        }
        return st;
      });

      setStores(updatedList);
      const stUpdated = updatedList.find(st => st.id === viewingStore360Id);
      if (stUpdated) {
        storeService.create(stUpdated); // Unified database persistence
      }
      addAuditLog("تعديل هوية متجر 360", `تم تحديث حزمة الهوية الوطنية والاعتماد لـ ${formName}`);
      triggerNotification(`تم دمج وحفظ تعديلات [${formName}] بنجاح! 💾🖤`, "success");
      setStore360ActiveTab("overview");
    }
  };

  const handleToggleActive = (id: string, current: boolean) => {
    const list = stores.map(s => s.id === id ? { ...s, isActive: !current } : s);
    setStores(list);
    const targetStore = list.find(s => s.id === id);
    if (targetStore) {
      storeService.create(targetStore); // Unified database persistence
    }
    triggerNotification(current ? "🔴 تم تعطيل المتجر وتسكين المزامنة السحابية" : "🟢 تم إعادة تنشيط المتجر للعمليات اللوجستية", "info");
  };

  const handleToggleArchive = (id: string, current: boolean) => {
    const list = stores.map(s => s.id === id ? { ...s, isArchived: !current } : s);
    setStores(list);
    const targetStore = list.find(s => s.id === id);
    if (targetStore) {
      storeService.create(targetStore); // Unified database persistence
    }
    triggerNotification(current ? "📥 تم تجميد وأرشفة المتجر في الأرشيف المالي" : "📤 تم تحرير المتجر من الأرشيف", "success");
  };

  const handleSetDefault = (id: string) => {
    const list = stores.map(s => ({ ...s, isDefault: s.id === id }));
    setStores(list);
    list.forEach(st => storeService.create(st)); // Unified database persistence
    setActiveStoreId(id);
    triggerNotification("👑 تم تعيين المتجر كالوجهة الافتراضية الرئيسية لكافة شاشات سهم!", "success");
  };

  const handleDeleteStore = (id: string, name: string) => {
    const target = stores.find(s => s.id === id);
    if (!target) return;
    if (target.isDefault || id === activeStoreId) {
      triggerNotification("لا يمكن حذف المتجر النشط أو الافتراضي", "error");
      return;
    }
    setStoreToDelete({ id, name });
  };

  const confirmDeleteArchiveStore = (id: string) => {
    const findSt = stores.find(s => s.id === id);
    if (!findSt) return;

    if (findSt.isDefault || id === activeStoreId) {
      triggerNotification("لا يمكن حذف المتجر النشط أو الافتراضي", "error");
      return;
    }

    // Archive and Deactivate
    const updated = stores.map(s => s.id === id ? { ...s, isArchived: true, isActive: false } : s);
    setStores(updated);
    const targetStore = updated.find(s => s.id === id);
    if (targetStore) {
      storeService.create(targetStore); // persistence
    }

    // Record events
    addAuditLog("أرشفة وتعطيل متجر", `تم نقل المتجر ${findSt.name} إلى أرشيف المؤسسات وتعطيل عملياته.`);
    addTimelineEvent(id, `📥 تم تجميد المتجر بالكامل ونقل عملياته للأرشيف التاريخي، مع الحفاظ على الفروع والمستندات بوضع مجمد.`, "archive");

    triggerNotification("تم أرشفة المتجر بنجاح", "success");
    setStoreToDelete(null);
    if (viewingStore360Id === id) setViewingStore360Id(null);
  };

  const handleRestoreStore = (id: string, name: string) => {
    const updated = stores.map(s => s.id === id ? { ...s, isArchived: false, isActive: true } : s);
    setStores(updated);
    const targetStore = updated.find(s => s.id === id);
    if (targetStore) {
      storeService.create(targetStore);
    }
    addAuditLog("استعادة متجر مؤرشف", `تم إلغاء أرشفة المتجر [${name}] واستعادة كافّة الأنشطة المتصلة.`);
    addTimelineEvent(id, `📤 تم تفكيك الأرشيف واستعادة المتجر بنجاح لجميع قنوات البيع النشطة وجرد الفروع والمستودعات.`, "restore");
    triggerNotification(`تم استعادة متجر [${name}] بنجاح من الأرشيف! 🟢🎉`, "success");
  };

  const simulateImageUpload = (type: "logo" | "cover" | "invoice" | "stamp") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64 = event.target.result as string;
            if (type === "logo") setUploadedLogo(base64);
            if (type === "cover") setUploadedCover(base64);
            if (type === "invoice") setUploadedInvoiceLogo(base64);
            if (type === "stamp") setUploadedStamp(base64);
            triggerNotification("📸 تم رفع وحفظ الملف بنجاح!", "success");
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Filters
  const filtered = stores.filter(s => {
    const isMatched = (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (s.tradeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (s.crNumber || "").includes(searchTerm);
    if (!isMatched) return false;
    if (storesFilter === "active") {
      return !s.isArchived;
    } else {
      return !!s.isArchived;
    }
  });

  return (
    <div className={isInline ? "w-full text-right animate-fade-in font-sans" : "fixed inset-0 z-50 bg-[#070b13]/90 backdrop-blur-md flex items-center justify-center p-4 text-right animate-fade-in font-sans"}>
      <div 
        className={isInline ? "w-full rounded-3xl border shadow-xl overflow-hidden flex flex-col min-h-[80vh] bg-slate-950/20" : "w-full max-w-6xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col h-[92vh]"}
        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
      >
        
        {/* HEADER BAR */}
        <div 
          className="p-5 border-b flex items-center justify-between"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <Store className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-white">
                {isInline ? "إدارة المتاجر والمنشآت والمؤسسات المعتمدة 🏬" : "🏆 مركز ومحيط المتجر 360 & إدارة الهويات المتعددة"}
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">تحويل المتاجر لعقد قانونية متكاملة تشتمل على الفروع والمزامنة والمستودعات والوثائق الرسمية والحسابات البنكية.</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-slate-800 text-gray-450 hover:text-white transition-all cursor-pointer border-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* CONTAINER WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          
          {activeStoreId === "all_stores" && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold leading-relaxed flex items-center justify-between gap-3 animate-fade-in shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-base">ℹ️</span>
                <span>
                  <strong>وضع العرض الموحد نشط:</strong> يمكنك استعراض الملف التعريفي والوثائق المرخصة لكل متجر من المنشآت التابعة. لكن أي إجراءات تعديل، ربط حسابات بنكية، أو تغيير قنوات وتراخيص الربط يتطلب تفعيل متجر فردي محدد أولاً من القائمة أو مبدل البيئة العلوي.
                </span>
              </div>
              <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-1 rounded-md shrink-0 uppercase tracking-widest font-mono">وضع العرض فقط</span>
            </div>
          )}

          {/* Top Main Navigation Tabs */}
          {!isInline && !viewingStore360Id && !isCreatingNew && !viewingCompany360Id && !isCreatingCompany && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-850 shadow-md" dir="rtl">
                {[
                  { id: "overview", label: "نظرة عامة 📊" },
                  { id: "companies", label: "المنشآت والشركات 🏢" },
                  { id: "branches", label: "الفروع والمواقع 📍" },
                  { id: "warehouses", label: "المستودعات 📦" },
                  { id: "stores", label: "المتاجر التابعة 🏬" },
                  { id: "connections", label: "الربط والعلاقات 🔗" }
                ].map(tb => (
                  <button
                    key={tb.id}
                    onClick={() => setMainActiveTab(tb.id as any)}
                    className={`py-2 px-4 rounded-xl text-xs font-black transition-all border-none font-sans cursor-pointer whitespace-nowrap ${
                      mainActiveTab === tb.id 
                        ? "bg-amber-500 text-black shadow-lg font-extrabold scale-102" 
                        : "text-gray-450 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Unified Multi-tenant Panels Segment */}
          {(!viewingStore360Id && !isCreatingNew) ? (
            <CompanyTabPanels
              userRole={userRole}
              mainActiveTab={mainActiveTab}
              setMainActiveTab={setMainActiveTab}
              companies={companies}
              stores={allowedStores}
              setStores={setStores}
              branches={branches}
              warehouses={warehouses}
              users={users}
              theme={theme}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              storesFilter={storesFilter}
              setStoresFilter={setStoresFilter}
              filteredStores={filtered}
              handleOpenCreateCompany={handleOpenCreateCompany}
              handleOpenCreateNew={handleOpenCreateNew}
              handleOpenEdit={handleOpenEdit}
              handleToggleActive={handleToggleActive}
              handleToggleArchive={handleToggleArchive}
              handleRestoreStore={handleRestoreStore}
              handleSetDefault={handleSetDefault}
              handleDeleteStore={handleDeleteStore}
              activeStoreId={activeStoreId}
              setActiveStoreId={setActiveStoreId}
              
              // Company State
              viewingCompany360Id={viewingCompany360Id}
              setViewingCompany360Id={setViewingCompany360Id}
              isCreatingCompany={isCreatingCompany}
              setIsCreatingCompany={setIsCreatingCompany}
              company360ActiveTab={company360ActiveTab}
              setCompany360ActiveTab={setCompany360ActiveTab}
              handleSaveCompany={handleSaveCompany}
              handleEditCompany={handleEditCompany}

              // Company Inputs
              compFormName={compFormName}
              setCompFormName={setCompFormName}
              compFormLegalName={compFormLegalName}
              setCompFormLegalName={setCompFormLegalName}
              compFormCrNumber={compFormCrNumber}
              setCompFormCrNumber={setCompFormCrNumber}
              compFormCrDate={compFormCrDate}
              setCompFormCrDate={setCompFormCrDate}
              compFormCrExpiryDate={compFormCrExpiryDate}
              setCompFormCrExpiryDate={setCompFormCrExpiryDate}
              compFormVatNumber={compFormVatNumber}
              setCompFormVatNumber={setCompFormVatNumber}
              compFormUnified700={compFormUnified700}
              setCompFormUnified700={setCompFormUnified700}
              compFormAddress={compFormAddress}
              setCompFormAddress={setCompFormAddress}
              compFormManager={compFormManager}
              setCompFormManager={setCompFormManager}
              compFormPhone={compFormPhone}
              setCompFormPhone={setCompFormPhone}
              compFormEmail={compFormEmail}
              setCompFormEmail={setCompFormEmail}
              compFormBankAccount={compFormBankAccount}
              setCompFormBankAccount={setCompFormBankAccount}
              compFormStatus={compFormStatus}
              setCompFormStatus={setCompFormStatus}
              compFormSubscription={compFormSubscription}
              setCompFormSubscription={setCompFormSubscription}
              compFormLogo={compFormLogo}
              setCompFormLogo={setCompFormLogo}
              compFormCover={compFormCover}
              setCompFormCover={setCompFormCover}
              compFormInvoiceLogo={compFormInvoiceLogo}
              setCompFormInvoiceLogo={setCompFormInvoiceLogo}
              compFormStamp={compFormStamp}
              setCompFormStamp={setCompFormStamp}

              // Modals
              setShowBranchModal={setShowBranchModal}
              setEditingBranch={setEditingBranch}
              setBranchFormName={setBranchFormName}
              setBranchFormCity={setBranchFormCity}
              setBranchFormAddress={setBranchFormAddress}
              setBranchFormManager={setBranchFormManager}
              setBranchFormPhone={setBranchFormPhone}
              setBranchFormWh={setBranchFormWh}
              setBranchFormType={setBranchFormType}
              setBranchFormStatus={setBranchFormStatus}
              branchFormCompanyId={branchFormCompanyId}
              setBranchFormCompanyId={setBranchFormCompanyId}
              branchFormStoreId={branchFormStoreId}
              setBranchFormStoreId={setBranchFormStoreId}
              setBranchFormAddressProfile={setBranchFormAddressProfile}

              setShowWhModal={setShowWhModal}
              setWhFormName={setWhFormName}
              setWhFormType={setWhFormType}
              setWhFormLocation={setWhFormLocation}
              setWhFormCapacity={setWhFormCapacity}
              setWhFormBranch={setWhFormBranch}
              whFormCompanyId={whFormCompanyId}
              setWhFormCompanyId={setWhFormCompanyId}
            />
          ) : null}

          {/* 2. THE GRAND STORE 360 UNIFIED PORTAL (WHEN VIEWING STORE PROFILE) */}
          {viewingStore360Id && currentStoreObjOn360 && (
            <div className="space-y-6">
              
              {/* Cover card */}
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
                <div className="h-28 md:h-36 bg-gradient-to-r from-amber-600/30 to-[#0e1626] relative flex items-center justify-between p-6">
                  <div 
                    onClick={() => handleTriggerQuickImageUpdate(currentStoreObjOn360, "coverUrl")}
                    title="انقر لتعديل غلاف المتجر فوراً 📷"
                    className="absolute inset-0 w-full h-full cursor-pointer group/cover overflow-hidden"
                  >
                    {currentStoreObjOn360.coverUrl ? (
                      <img src={currentStoreObjOn360.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-25 group-hover/cover:scale-105 transition-all" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-slate-950 opacity-25" />
                    )}
                    <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity z-20">
                      <span className="bg-black/90 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-black px-2.5 py-1 rounded-lg">تغيير صورة الغلاف 📷</span>
                    </div>
                  </div>
                  {/* Quick toggle list button */}
                  <div className="z-10 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-right">
                    <span className="text-[9.5px] text-amber-500 font-extrabold block">قناة المتجر الحالية:</span>
                    <h3 className="text-xs md:text-sm font-black text-white">{currentStoreObjOn360.name}</h3>
                  </div>

                  <div className="z-10 flex gap-2">
                    <button
                      onClick={() => setViewingStore360Id(null)}
                      className="py-2 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-gray-300 cursor-pointer"
                    >
                      ↩️ العودة للمتاجر الأخرى
                    </button>
                    {currentStoreObjOn360.id !== activeStoreId && (
                      <button
                        onClick={() => handleActiveStoreSwitch(currentStoreObjOn360.id, currentStoreObjOn360.name)}
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black cursor-pointer border-none"
                      >
                        👑 تعيين كمتجر نشط حالياً
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity profile metadata line */}
                <div className="p-4 md:p-5 bg-[#0e1525] border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => handleTriggerQuickImageUpdate(currentStoreObjOn360, "logoUrl")}
                      title="انقر لتعديل شعار المتجر فوراً 📷"
                      className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-slate-800 hover:border-amber-500 hover:scale-105 shadow-lg -mt-10 overflow-hidden shrink-0 z-10 cursor-pointer relative group"
                    >
                      <img src={currentStoreObjOn360.logoUrl || "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=120&auto=format&fit=crop"} alt="Logo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="bg-[#D4AF37] text-black text-[7.5px] font-black px-1.5 py-0.5 rounded leading-none shadow">تغيير 📷</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#D4AF37] tracking-tight">{currentStoreObjOn360.companyLegalName}</span>
                        <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 py-0.5 px-2 rounded-md">موثق ميثاق 🇸🇦</span>
                      </div>
                      <p className="text-[10.5px] text-gray-400 leading-normal">{currentStoreObjOn360.description || "لا يوجد وصف مدخل لهذا الكيان التجاري."}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-center font-sans">
                    <div className="px-3 border-r border-slate-800">
                      <span className="text-[9.5px] text-gray-400 block uppercase font-bold">رصيد السجل الضريبي</span>
                      <span className="text-xs font-black text-emerald-400 block mt-0.5">موثق بالزكاة</span>
                    </div>
                    <div className="px-3 border-r border-slate-800">
                      <span className="text-[9.5px] text-gray-400 block uppercase font-bold">الفروع المرتبطة</span>
                      <span className="text-xs font-black text-amber-500 block mt-0.5">{(currentStoreObjOn360.branches || []).length} فروع قانونية</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 360 Tab Selectors */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
                {[
                  { id: "overview", label: "بيان 360 العام 📊" },
                  { id: "legal_docs", label: "المستندات والتراخيص 📂" },
                  { id: "relations", label: "الفروع والمخازن والعمالة 🧱" },
                  { id: "platforms", label: "المنصات ومزامنة القنوات 🔗" },
                  { id: "performance", label: "لوحة الأداء المالي (KPIs) 📈" },
                  { id: "edit", label: "تعديل الهوية والبيانات ⚙️" },
                  { id: "cameras", label: "بث الكاميرات المباشر 🎥" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStore360ActiveTab(tab.id as any)}
                    className={`py-2 px-3.5 rounded-xl text-xs transition-all border-none font-bold cursor-pointer whitespace-nowrap ${
                      store360ActiveTab === tab.id ? "bg-amber-500 text-black font-extrabold" : "bg-slate-900 text-gray-400 hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB WORKSPACE */}
              <div className="space-y-6">
                
                {/* 360 Tab 1: OVERVIEW */}
                {store360ActiveTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Official Registration details (Zakat, CR, conocido, etc.) */}
                    <div className="md:col-span-2 space-y-6">
                      
                      {/* Technical Details Grid */}
                      <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
                        <h4 className="text-xs font-black text-amber-500 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4" />
                          <span>البيانات الرسمية وهوية المنشأة الوطنية:</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-gray-300">
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-[9.5px] text-gray-400 block">• الرقم الضريبي الموحد (VAT):</span>
                            <span className="font-extrabold text-white text-[11px] font-mono">{currentStoreObjOn360.vatNumber || "بانتظار قيد الشهادة الضريبية"}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-[9.5px] text-gray-400 block">• السجل التجاري (CR):</span>
                            <span className="font-extrabold text-white text-[11px] font-mono">{currentStoreObjOn360.crNumber}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-[9.5px] text-gray-400 block">• الرقم الوطني الموحد 700:</span>
                            <span className="font-extrabold text-white text-[11px] font-mono">{currentStoreObjOn360.unifiedNumber700 || "70019482910"}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-[9.5px] text-gray-400 block">• تاريخ الإصدار / انتهاء السجل:</span>
                            <span className="font-extrabold text-white text-[11px] font-mono">من {currentStoreObjOn360.crDate || "١٤٤٥/٠١/٠١"} إلى {currentStoreObjOn360.crExpiryDate || "١٤٥٠/٠١/٠١"}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-[9.5px] text-gray-400 block">• شهادة معروف / توثيق رقمي:</span>
                            <span className="font-extrabold text-white text-[11px] font-mono">{currentStoreObjOn360.maroofNumber ? `رقم معروف: ${currentStoreObjOn360.maroofNumber}` : "غير متاح"}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-[9.5px] text-gray-400 block">• رقم وزارة الموارد البشرية والعمل:</span>
                            <span className="font-extrabold text-white text-[11px] font-mono">{currentStoreObjOn360.ministryOfLaborNumber || "21-491-0982-1"}</span>
                          </div>
                        </div>
                      </div>

                      {/* National Address Card */}
                      <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h4 className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>العنوان الوطني السعودي المشفر (البريد السعودي سبل):</span>
                          </h4>
                          {currentStoreObjOn360.address?.shortAddress && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold px-2 py-0.5 rounded">
                              موقع جغرافي محدد مطهر
                            </span>
                          )}
                        </div>

                        {currentStoreObjOn360.address?.shortAddress ? (
                          <div className="font-sans space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-300">
                              <p>• <span className="text-gray-400">العنوان القصير:</span> <strong className="text-white font-mono">{currentStoreObjOn360.address.shortAddress}</strong></p>
                              <p>• <span className="text-gray-400">المبنى:</span> <strong className="text-white font-mono">{currentStoreObjOn360.address.buildingNumber}</strong></p>
                              <p>• <span className="text-gray-400">الشارع:</span> <strong className="text-white">{currentStoreObjOn360.address.streetName}</strong></p>
                              <p>• <span className="text-gray-400">الحي والمدينة:</span> <strong className="text-white">{currentStoreObjOn360.address.district}، {currentStoreObjOn360.address.city}</strong></p>
                              <p>• <span className="text-gray-400">الرمز البريدي/الإضافي:</span> <strong className="text-white font-mono">{currentStoreObjOn360.address.postalCode} / {currentStoreObjOn360.address.additionalNumber}</strong></p>
                              <p>• <span className="text-gray-400">رقم الشقة/الوحدة:</span> <strong className="text-white font-mono">{currentStoreObjOn360.address.unitNumber || "١"}</strong></p>
                            </div>

                            {currentStoreObjOn360.address.gpsCoordinates && (
                              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-mono font-bold leading-normal">
                                <span className="text-gray-400 truncate">الإحداثيات الجغرافية: {currentStoreObjOn360.address.gpsCoordinates}</span>
                                <a 
                                  href={currentStoreObjOn360.address.mapLink || "https://maps.google.com"} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-amber-500 hover:underline shrink-0 block"
                                >
                                  فتح خرائط Google 🗺️
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">بانتظار قيد وتكويد العنوان الوطني المختصر للمتجر لضمان السحب اللوجستي السليم فواتيرياً.</p>
                        )}
                      </div>

                      {/* Financial Accounts Settlement Block */}
                      <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
                        <h4 className="text-xs font-black text-amber-500 border-b border-slate-800 pb-2 flex items-center gap-1.5 animate-pulse">
                          <CreditCard className="w-4 h-4" />
                          <span>الحسابات البنكية المعتمدة للتسويات المالية والربط:</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                          {(!currentStoreObjOn360.bankAccounts || currentStoreObjOn360.bankAccounts.length === 0) ? (
                            <p className="text-xs text-gray-400 italic text-center py-4">لا توجد حسابات بنكية مسجلة للمتجر.</p>
                          ) : (
                            currentStoreObjOn360.bankAccounts.map(b => (
                              <div key={b.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[11.5px] text-white font-extrabold">{b.bankName}</span>
                                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">IBAN: {b.iban}</p>
                                  <p className="text-[9.5px] text-gray-500">رقم الحساب: {b.accountNumber} | المستفيد: {b.beneficiaryName}</p>
                                </div>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold font-mono">
                                  ● نشط معتمد
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Left Panel: Contact info & Corporate Timeline log */}
                    <div className="space-y-6">
                      
                      {/* Contacts detail cards */}
                      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3.5 text-xs text-gray-300">
                        <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-sky-400" />
                          <span>قنوات التواصل الرسمية:</span>
                        </h4>
                        
                        <div className="space-y-2.5">
                          <p className="flex justify-between">
                            <span className="text-gray-400">الهاتف الأساسي:</span>
                            <span className="font-mono text-white font-semibold">{currentStoreObjOn360.phone || "٠٥٠٠٠٠٠٠٠٠"}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">دعم العملاء السريع:</span>
                            <span className="font-mono text-white font-semibold">{currentStoreObjOn360.supportPhone || "+966 5..."}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">البريد الإلكتروني:</span>
                            <span className="text-white hover:underline">{currentStoreObjOn360.email || "store@domain.sa"}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">بريد المشاكل والشكاوى:</span>
                            <span className="text-white hover:underline">{currentStoreObjOn360.supportEmail || "support@domain.sa"}</span>
                          </p>
                          {currentStoreObjOn360.website && (
                            <p className="flex justify-between">
                              <span className="text-gray-400">رابط الموقع الإلكتروني:</span>
                              <a href={currentStoreObjOn360.website} target="_blank" rel="noopener noreferrer" className="text-amber-500 underline font-mono">
                                {currentStoreObjOn360.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Store Timeline History */}
                      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                        <h4 className="text-xs font-black text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>سجل المخطط الزمني للمتجر 360:</span>
                        </h4>

                        <div className="space-y-4 relative pr-4 border-r border-slate-800 py-1 font-sans">
                          {getSimulatedTimelineForStore(currentStoreObjOn360.id, currentStoreObjOn360.name).map(evt => {
                            const IconC = evt.icon;
                            return (
                              <div key={evt.id} className="relative space-y-0.5">
                                <span className="absolute -right-[23px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                                  <IconC className="w-2.5 h-2.5 text-amber-500" />
                                </span>
                                <span className="text-[9.5px] text-gray-500 block font-mono">{evt.date}</span>
                                <p className="text-[10px] text-gray-300 leading-normal font-bold">{evt.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 360 Tab 2: DOCUMENTS */}
                {store360ActiveTab === "legal_docs" && (
                  <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-black text-amber-500 border-b border-slate-800 pb-2">📂 المستندات والأوراق الرسمية للمتجر (Store Documents Box):</h3>

                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 block mb-1 font-extrabold">• اسم المستند / السند القانوني:</label>
                        <input
                          type="text"
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          placeholder="مثال: السجل التجاري المطبوع لشركة مراسيم"
                          className="w-full text-xs rounded-lg p-2 bg-slate-950 border border-slate-850 text-white focus:outline-none text-right font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">• نوع وتبويب المستند:</label>
                        <select
                          value={newDocCategory}
                          onChange={(e) => setNewDocCategory(e.target.value as any)}
                          className="w-full text-xs rounded-lg p-2 bg-slate-950 border border-slate-850 text-white focus:outline-none text-right font-sans"
                        >
                          <option value="cr">السجل التجاري (Commercial Registry)</option>
                          <option value="vat">الشهادة الضريبية وبراءة الذمة</option>
                          <option value="zakat">شهادة الزكاة والدخل والمكلف</option>
                          <option value="maroof">شهادة توثيق منصة معروف الموحدة</option>
                          <option value="contract">العقود والاتفاقيات والبلدية</option>
                          <option value="license">التراخيص والصيدلية والهيئات</option>
                          <option value="other">ملفات إضافية ووثائق أخرى</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end relative">
                        <input 
                          type="file" 
                          id="store_doc_file_360" 
                          className="hidden" 
                          onChange={handleAddDocument}
                        />
                        <label
                          htmlFor="store_doc_file_360"
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5 border-none text-center"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع المستند الآن 📤</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4 font-sans text-xs text-right">
                      {documentsList.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-slate-800 rounded-xl">
                          <FileWarning className="w-8 h-8 text-gray-650 mx-auto animate-bounce" />
                          <p className="text-gray-400 mt-2">لا توجد اوراق رسمية مقيدة لهذا المتجر. يرجى رفع شهادة السجل وتوظيفها للـ ERP.</p>
                        </div>
                      ) : (
                        documentsList.map((doc) => (
                          <div key={doc.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-right">
                            <div className="flex items-center gap-3 text-right">
                              <div className="p-2 bg-slate-950 text-amber-500 rounded-lg shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="text-right font-sans">
                                <p className="font-extrabold text-white text-[11.5px] font-sans">{doc.name}</p>
                                <p className="text-[9.5px] text-gray-400 font-sans">
                                  التصنيف: {
                                    doc.category === "cr" ? "السجل التجاري 📜" :
                                    doc.category === "vat" ? "الشهادة الضريبية 💳" :
                                    doc.category === "zakat" ? "شهادة الزكاة والجمارك 💰" :
                                    doc.category === "maroof" ? "شهادة معروف الرقمية ⭐" :
                                    doc.category === "contract" ? "اتفاقيات مشورة وعقود 📁" :
                                    doc.category === "license" ? "تراخيص الهيئات والبلديات 🛡️" : "مستند إضافي آخر"
                                  } | الحجم: {doc.fileSize || "180 KB"} | تاريخ الرفع: {doc.uploadedAt}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 font-sans">
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded font-mono font-bold">موثق SSL</span>
                              <button
                                type="button"
                                onClick={() => setDocumentsList(documentsList.filter(d => d.id !== doc.id))}
                                className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-red-500/10 cursor-pointer border-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 360 Tab 3: RELATIONS (Logistic network: Branches, Warehouses, Users) */}
                {store360ActiveTab === "relations" && (
                  <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-6">
                    {/* Explanation header - Requirement 1 */}
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs font-bold leading-relaxed flex items-center gap-3">
                      <span className="text-base shrink-0">ℹ️</span>
                      <span>هذه الصفحة تحدد الفروع والمخازن والمستخدمين المرتبطين بهذا المتجر.</span>
                    </div>

                    {/* Quick Action Buttons - Requirement 5 */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBranch(null);
                          setBranchFormName("");
                          setBranchFormCity("الرياض");
                          setBranchFormAddress("");
                          setBranchFormManager("");
                          setBranchFormPhone("");
                          setBranchFormWh("");
                          setBranchFormType("فرع بيع");
                          setBranchFormStatus("نشط");
                          const currentStore = stores.find(s => s.id === viewingStore360Id);
                          setBranchFormCompanyId(currentStore?.companyId || currentStore?.company_id || companies[0]?.id || "");
                          setBranchFormStoreId(viewingStore360Id || "");
                          setShowBranchModal(true);
                        }}
                        className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer border-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة فرع</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWhFormName("");
                          setWhFormLocation("");
                          setWhFormCapacity(3000);
                          setWhFormType("sub");
                          setWhFormBranch("");
                          const currentStore = stores.find(s => s.id === viewingStore360Id);
                          setWhFormCompanyId(currentStore?.companyId || currentStore?.company_id || companies[0]?.id || "");
                          setShowWhModal(true);
                        }}
                        className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer border-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة مستودع</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPosFormName("");
                          setPosFormCashier("");
                          setPosFormWh("");
                          setPosFormPayMethods(["cash", "card"]);
                          setPosFormStatus("نشط");
                          setCurrentPosBranchId(branches[0]?.id || "");
                          setShowPosModal(true);
                        }}
                        className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 transition-all cursor-pointer border-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة نقطة بيع</span>
                      </button>
                    </div>

                    {/* Section: Organizational Hierarchy View */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Layers className="w-4 h-4 text-[#D4AF37]" />
                        <span>الهيكل الجغرافي والتشغيلي للمتجر (الفروع ونقاط البيع المستندة):</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-4 font-sans text-right">
                        {branches.filter(b => !b.storeId || b.storeId === currentStoreObjOn360.id || selectedBranches.includes(b.id)).length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border border-dashed border-slate-800 rounded-xl">
                            <Building className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                            <p className="text-xs">لم يتم إنشاء أو ربط أي فروع لهذا المتجر حتى الآن.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBranch(null);
                                setBranchFormName("");
                                setBranchFormCity("الرياض");
                                setBranchFormAddress("");
                                setBranchFormManager("");
                                setBranchFormPhone("");
                                setBranchFormWh("");
                                setBranchFormType("فرع بيع");
                                setBranchFormStatus("نشط");
                                const currentStore = stores.find(s => s.id === viewingStore360Id);
                                setBranchFormCompanyId(currentStore?.companyId || currentStore?.company_id || companies[0]?.id || "");
                                setBranchFormStoreId(viewingStore360Id || "");
                                setShowBranchModal(true);
                              }}
                              className="mt-3 text-xs text-amber-500 underline hover:text-amber-400 bg-transparent border-0 cursor-pointer"
                            >
                              إضافة أول فرع تشغيلي الآن 🏬
                            </button>
                          </div>
                        ) : (
                          branches
                            .filter(b => !b.storeId || b.storeId === currentStoreObjOn360.id || selectedBranches.includes(b.id))
                            .map(b => {
                              const associatedPOS = posUnits.filter((p: any) => p.branchId === b.id);
                              const isExpanded = expandedBranchPosIds.includes(b.id);
                              const linkedWh = warehouses.find(w => w.id === b.associatedWh || w.associatedBranch === b.id);
                              const assignedUsers = users.filter((u: any) => u.branchId === b.id || u.workspaces?.includes(b.id) || b.employees?.includes(u.name));
                              const isArchived = b.status === "غير نشط" || b.status === "مؤرشف";

                              return (
                                <div 
                                  key={b.id} 
                                  className={`p-5 rounded-2xl border transition-all ${isArchived ? "opacity-60 border-slate-850 bg-slate-950/20" : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/60"}`}
                                >
                                  {/* Branch Card Header */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-905 bg-slate-950/20 p-2 rounded-xl">
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-black text-white flex items-center gap-1.5">
                                          <span>🏢</span>
                                          {b.name}
                                        </span>
                                        <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                                          {b.city}
                                        </span>
                                        <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded">
                                          {b.type || "فرع بيع"}
                                        </span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${!isArchived ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                          {!isArchived ? "نشط" : "مؤرشف / غير نشط"}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-gray-400 leading-normal">
                                        📍 عنوان: {b.address || "غير مسجل"} | 👤 مدير: {b.manager || "غير معين"} | 📞 جوال: {b.phone || "غير مسجل"}
                                      </p>
                                    </div>

                                    {/* Action Buttons for this Branch - Requirement 4 & 5 */}
                                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleEditBranch(b)}
                                        className="py-1 px-2.5 rounded-lg text-[10px] font-black bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white transition-all cursor-pointer border border-slate-800"
                                        title="تعديل الفرع"
                                      >
                                        ⚙️ تعديل الفرع
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPosFormName("");
                                          setPosFormCashier("");
                                          setPosFormWh(b.associatedWh || "");
                                          setPosFormPayMethods(["cash", "card"]);
                                          setPosFormStatus("نشط");
                                          setCurrentPosBranchId(b.id);
                                          setShowPosModal(true);
                                        }}
                                        className="py-1 px-2.5 rounded-lg text-[10px] font-black bg-sky-950 text-sky-450 hover:bg-sky-900 transition-all cursor-pointer border border-sky-900/30"
                                        title="إضافة نقطة بيع"
                                      >
                                        🖥️ إضافة نقطة بيع
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleLinkWarehouse(b.id)}
                                        className="py-1 px-2.5 rounded-lg text-[10px] font-black bg-emerald-950 text-emerald-450 hover:bg-emerald-900 transition-all cursor-pointer border border-emerald-900/30"
                                        title="ربط مستودع"
                                      >
                                        🔗 ربط مستودع
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (expandedBranchPosIds.includes(b.id)) {
                                            setExpandedBranchPosIds(expandedBranchPosIds.filter(id => id !== b.id));
                                          } else {
                                            setExpandedBranchPosIds([...expandedBranchPosIds, b.id]);
                                          }
                                        }}
                                        className="py-1 px-2.5 rounded-lg text-[10px] font-black bg-slate-900 text-[#D4AF37] hover:bg-slate-800 transition-all cursor-pointer border border-slate-850"
                                        title="عرض نقاط البيع"
                                      >
                                        👁️ {isExpanded ? "إخفاء نقاط البيع" : `عرض نقاط البيع (${associatedPOS.length})`}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleArchiveBranch(b)}
                                        className="p-1 px-2 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-red-950/20 text-red-500 border border-slate-800 hover:border-red-500/20 transition-all cursor-pointer"
                                        title="أرشفة"
                                      >
                                        🗑️ أرشفة
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inner Branch Network / Content */}
                                  <div className="pt-3.5 space-y-3 font-sans">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {/* Linked Warehouse Detail */}
                                      <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-900/40 text-xs text-right">
                                        <span className="text-gray-400 font-bold block mb-1">📦 المستودعات ومحطات المخازن المرتبطة بالفرع:</span>
                                        {linkedWh ? (
                                          <div className="flex items-center justify-between mt-1 text-white">
                                            <span className="font-semibold text-emerald-400">📦 {linkedWh.name} ({linkedWh.type === "main" ? "مستودع رئيسي" : "مستودع فرعي"})</span>
                                            <span className="text-[10px] text-gray-400">السعة: {linkedWh.capacity || 3000} صندوق</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between text-amber-500 text-[10px] font-bold mt-1">
                                            <span>⚠️ لا يوجد مستودع ارتباط تزويد حالياً</span>
                                            <button
                                              onClick={() => handleLinkWarehouse(b.id)}
                                              className="text-[9.5px] py-0.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded font-bold cursor-pointer"
                                            >
                                              إنشاء رابط تزويد 🔗
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Assigned Staff and Users */}
                                      <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-900/40 text-xs text-right">
                                        <span className="text-gray-400 block mb-1 font-bold">👥 فريق العمل والمديرون المفوضون للفرع:</span>
                                        {assignedUsers.length === 0 ? (
                                          <p className="text-[10px] text-gray-500 italic mt-1">لم يتم ربط أي مستخدمين بهذا الفرع حتى الآن.</p>
                                        ) : (
                                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {assignedUsers.map(u => (
                                              <span key={u.id} className="inline-flex items-center gap-1 text-[10px] py-0.5 px-2 bg-slate-900/45 rounded-md border border-slate-850 text-white font-medium">
                                                <span className="text-[9px]">{u.avatar || "👤"}</span>
                                                {u.name} ({u.role || "موظف"})
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Sub-section: Points of Sale (Requirement 7) */}
                                    {isExpanded && (
                                      <div className="mt-3 p-4 rounded-xl border border-dashed border-sky-500/20 bg-sky-500/5 space-y-2.5 select-text animate-fade-in text-right">
                                        <h5 className="text-[11px] font-black text-sky-400 flex items-center gap-1">
                                          <span>🖥️</span>
                                          <span>نقاط البيع الصالحة وأجهزة الكاشير الخاصة بالفرع:</span>
                                        </h5>

                                        {associatedPOS.length === 0 ? (
                                          <div className="py-4 text-center rounded-lg bg-slate-950/30 border border-slate-900 space-y-2">
                                            <p className="text-[10.5px] text-amber-500 font-extrabold">⚠️ لا توجد نقطة بيع لهذا الفرع</p>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPosFormName("");
                                                setPosFormCashier("");
                                                setPosFormWh(b.associatedWh || "");
                                                setPosFormPayMethods(["cash", "card"]);
                                                setPosFormStatus("نشط");
                                                setCurrentPosBranchId(b.id);
                                                setShowPosModal(true);
                                              }}
                                              className="py-1 px-2.5 bg-sky-600 hover:bg-sky-550 text-white font-extrabold text-[10px] rounded transition-all cursor-pointer border-none"
                                            >
                                              + إضافة نقطة بيع للفرع 🖥️
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {associatedPOS.map(p => (
                                              <div key={p.id} className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-xs flex items-center justify-between gap-2">
                                                <div className="space-y-0.5 text-right">
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-white font-sans">{p.name}</span>
                                                    {p.isDefault && <span className="text-[8.5px] bg-[#D4AF37]/15 text-[#D4AF37] font-bold py-0.5 px-1 rounded">الافتراضية</span>}
                                                  </div>
                                                  <p className="text-[9.5px] text-gray-400">
                                                    👤 الكاشير: <span className="text-gray-200">{p.cashier}</span>
                                                  </p>
                                                  <div className="text-[9px] text-gray-500 flex flex-wrap gap-1 mt-1 justify-start">
                                                    <span>الدفع:</span>
                                                    {p.paymentMethods?.map((m: string) => (
                                                      <span key={m} className="bg-slate-900 text-gray-300 font-sans px-1 rounded text-[8.5px]">{m === "cash" ? "كاش" : m === "card" ? "شبكة" : "تحويل"}</span>
                                                    )) || <span className="text-red-405 text-[8.5px]">شبكة / كاش</span>}
                                                  </div>
                                                </div>
                                                
                                                <div className="text-left shrink-0">
                                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === "نشط" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                                    {p.status || "نشط"}
                                                  </span>
                                                  <input
                                                    type="button"
                                                    value="حذف 🗑️"
                                                    onClick={() => {
                                                      if (confirm(`هل أنت متأكد من حذف نقطة البيع [${p.name}]؟`)) {
                                                        setPosUnits(posUnits.filter((item: any) => item.id !== p.id));
                                                        triggerNotification(`تم حذف نقطة البيع [${p.name}]`, "info");
                                                      }
                                                    }}
                                                    className="block text-[8.5px] text-red-400 hover:text-red-300 font-bold bg-transparent border-none cursor-pointer mt-2"
                                                  />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 360 Tab 4: CHANNELS & SYNC Salla, Zid, Shopify, Woo, Noon, Amazon */}
                {store360ActiveTab === "platforms" && (
                  <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-5 font-sans">
                    <h3 className="text-xs font-black text-amber-500 border-b border-slate-800 pb-2">🔗 ربط ومزامنة الكتالوجات والقنوات لكل منشأة مستقلة:</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-gray-300">
                      
                      {/* Salla card */}
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-3 text-right">
                        <div className="flex justify-between">
                          <span className="text-xs font-extrabold text-white">منصة سة (Salla)</span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${sallaConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-800 text-gray-500"}`}>
                            {sallaConnected ? "متصل فعال" : "مفصول"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">مزامنة تلقائية للأسناد والمخزون وحركات السداد.</p>
                        {sallaConnected && <span className="text-[9px] text-[#D4AF37] block font-mono">آخر مزامنة للتحديث قبل ١٢ دقيقة</span>}
                      </div>

                      {/* Zid card */}
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-3 text-right">
                        <div className="flex justify-between">
                          <span className="text-xs font-extrabold text-white">منصة زد (Zid)</span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${zidConnected ? "bg-orange-500/10 text-orange-400" : "bg-gray-800 text-gray-500"}`}>
                            {zidConnected ? "متصل فعال" : "مفصول"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">جلب الطلبات وبوابات الفواتير الضريبية وتحديثات السلة.</p>
                        {zidConnected && <span className="text-[9px] text-orange-400 block font-mono">متجر زد متزامن بالكامل</span>}
                      </div>

                      {/* Shopify card */}
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-3 text-right">
                        <div className="flex justify-between">
                          <span className="text-xs font-extrabold text-white">منصة شوبيفاي (Shopify)</span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${shopifyConnected ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                            {shopifyConnected ? "متصل فعال" : "مفصول"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">نظام المزامنة الدولي، دعم العملات المتعددة والمواقع الجغرافية.</p>
                        {shopifyConnected && <span className="text-[9px] text-emerald-405 block font-mono">Webhooks معتمدة حية</span>}
                      </div>

                      {/* WooCommerce card */}
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-3 text-right">
                        <div className="flex justify-between">
                          <span className="text-xs font-extrabold text-white">منصة الووكومرس (WooCommerce)</span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${wooConnected ? "bg-indigo-500/10 text-indigo-400" : "bg-gray-800 text-gray-500"}`}>
                            {wooConnected ? "متصل فعال" : "مفصول"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">ربط ووردبريس ومزامنة الفئات والأسعار التفضيلية.</p>
                      </div>

                      {/* Amazon card */}
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-3 text-right">
                        <div className="flex justify-between">
                          <span className="text-xs font-extrabold text-white">أمازون السعودية (Amazon Seller API)</span>
                          <button 
                            onClick={() => {
                              setAmazonConnected(!amazonConnected);
                              triggerNotification(amazonConnected ? "تم فصل القناة الموحدة لأمازون" : "تم فتح موثوقية أمازون بنجاح! 🇸🇦", "info");
                            }}
                            className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border-0 cursor-pointer ${amazonConnected ? "bg-amber-500 text-black" : "bg-slate-900 text-gray-400"}`}
                          >
                            {amazonConnected ? "● متصل فعال" : "أنقر للربط"}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500">مزامنة الطلبات والمخازن المشتركة (FBA & FBM).</p>
                      </div>

                      {/* Noon card */}
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-3 text-right">
                        <div className="flex justify-between">
                          <span className="text-xs font-extrabold text-white">منصة نون (Noon Seller Hub)</span>
                          <button 
                            onClick={() => {
                              setNoonConnected(!noonConnected);
                              triggerNotification(noonConnected ? "تم فك ارتباط نون" : "تم تكوين جسر نون بنجاح! 🇸🇦", "info");
                            }}
                            className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border-0 cursor-pointer ${noonConnected ? "bg-amber-500 text-black" : "bg-slate-900 text-gray-400"}`}
                          >
                            {noonConnected ? "● متصل فعال" : "أنقر للربط"}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500">مزامنة تلقائية مع نون لطلبات الـ ERP وبوليصات الشحن الموحدة.</p>
                      </div>

                    </div>
                  </div>
                )}

                {/* 360 Tab 5: PERFORMANCE KPIs AND GRAPHICS */}
                {store360ActiveTab === "performance" && (
                  <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-6">
                    <h3 className="text-xs font-black text-amber-500 border-b border-slate-800 pb-2">📈 مؤشرات الأداء والتحليلات البيعية للمتجر:</h3>

                    {/* Performance Bento Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-medium text-gray-300">
                      
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                        <div className="flex items-center justify-between text-gray-400 text-[10px]">
                          <span>إجمالي مبيعات المتجر</span>
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-lg font-black text-white block mt-1">١,٨٤٢,٥٠٠ ر.س</span>
                        <div className="text-[9px] text-emerald-400 mt-1">▲ +١٤.٢٪ مبيعات تراكمية</div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                        <div className="flex items-center justify-between text-gray-400 text-[10px]">
                          <span>صافي الأرباح (الربحية)</span>
                          <TrendingUp className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-lg font-black text-white block mt-1">٦٤٤,٨٠٠ ر.س</span>
                        <div className="text-[9px] text-[#D4AF37] mt-1">معدل صافي الهامش: ٣٥٪</div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                        <div className="flex items-center justify-between text-gray-400 text-[10px]">
                          <span>متوسط قيمة الفواتير السند</span>
                          <ShoppingBag className="w-4 h-4 text-sky-400" />
                        </div>
                        <span className="text-lg font-black text-white block mt-1">٣٦٠ ر.س / طلب</span>
                        <div className="text-[9px] text-gray-400 mt-1">ارتفاع بمعدل ٣٥ ر.س عن الشهر المنصرم</div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                        <div className="flex items-center justify-between text-gray-400 text-[10px]">
                          <span>العملاء النشطون</span>
                          <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-lg font-black text-white block mt-1">٢,٨٩٠ عميل</span>
                        <div className="text-[9px] text-purple-400 mt-1">معدل عودة العميل للتسوق: ٧٦٪</div>
                      </div>

                    </div>

                    {/* Responsive SVG custom mini chart */}
                    <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-850 space-y-4">
                      <h4 className="text-xs font-black text-white">مخطط المبيعات ربع السنوية للمتجر (موجّز):</h4>
                      
                      <div className="h-28 flex items-end gap-3.5 pt-4 pr-4 border-r border-b border-slate-800">
                        {[
                          { month: "يناير", val: 50, label: "١٢٠ ألف" },
                          { month: "فبراير", val: 80, label: "٢١٠ ألف" },
                          { month: "مارس", val: 65, label: "١٦٠ ألف" },
                          { month: "أبريل", val: 95, label: "٢٩٠ ألف" },
                          { month: "مايو", val: 100, label: "٣٨٠ ألف" },
                          { month: "يونيو", val: 120, label: "٤٢٠ ألف" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <span className="text-[8px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                            <div 
                              className="w-full bg-amber-500 hover:bg-amber-400 rounded-t-sm transition-all duration-300 shadow-lg shadow-amber-500/10 cursor-pointer" 
                              style={{ height: `${item.val}%` }}
                            ></div>
                            <span className="text-[9px] text-gray-500 font-bold font-sans">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top products table simulation */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-white flex items-center gap-1">• أفضل المنتجات رواجاً وربحية في هذا المتجر:</h4>
                      
                      <div className="space-y-1.5 font-sans">
                        {[
                          { name: "دهن عود كلمنتان غابات (سبيشل)", sales: "٢٤٢ عبوة", revenue: "٦٠,٥٠٠ ر.س" },
                          { name: "رقائق عود مروكي طبيعي سوبر", sales: "١٩١ كيس", revenue: "٣٨,٢٠٠ ر.س" },
                          { name: "بخور مبخرة دقة المزيون الملكية", sales: "٣٠٥ صندوق", revenue: "٩١,٥٠٠ ر.س" }
                        ].map((prod, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-extrabold text-[#D4AF37]">{prod.name}</span>
                            <div className="flex gap-4 font-mono">
                              <span className="text-gray-400">{prod.sales}</span>
                              <span className="text-emerald-400 font-extrabold">{prod.revenue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 360 Tab 6: ORIGINAL MULTI-TAB FORMS FOR COMPATIBILITY */}
                {store360ActiveTab === "edit" && (
                  <div className="space-y-6">
                    
                    {/* Interior Form Nav Tabs */}
                    <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
                      {[
                        { id: "general", label: "البيانات العامة والهوية 🏢" },
                        { id: "legal", label: "البيانات القانونية والضرائب 📜" },
                        { id: "contact", label: "بيانات التواصل 📞" },
                        { id: "address", label: "العنوان لـ سبل 📍" },
                        { id: "bank", label: "الحسابات المصرفية 💳" },
                        { id: "docs", label: "ملف المستندات 📂" },
                        { id: "platforms", label: "ربط المنصات 🔗" },
                        { id: "relations", label: "الفروع والمخازن 🧱" }
                      ].map(tb => (
                        <button
                          key={tb.id}
                          type="button"
                          onClick={() => setActiveFormTab(tb.id as any)}
                          className={`py-1.5 px-3 rounded-lg text-[10.5px] font-bold border-none transition-all cursor-pointer ${
                            activeFormTab === tb.id ? "bg-amber-500 text-black" : "bg-slate-900 text-gray-400 hover:bg-slate-800"
                          }`}
                        >
                          {tb.label}
                        </button>
                      ))}
                    </div>

                    {/* Render Form Tabs */}
                    <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
                      
                      {/* Sub-general form fields */}
                      {activeFormTab === "general" && (
                        <div className="space-y-4 font-sans text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-400 mb-1.5">• اسم المتجر الأساسي بالـ ERP:</label>
                              <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
                                placeholder="الاسم للتداول، مثال: مراسيم الطيب"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 mb-1.5">• الاسم التجاري للمنشأة بفولدر الفواتير:</label>
                              <input
                                type="text"
                                value={formTradeName}
                                onChange={(e) => setFormTradeName(e.target.value)}
                                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
                                placeholder="مثال: شركة مراسيم الطيب للعود"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-400 mb-1.5">• الاسم القانوني بوزارة التجارة للفرع الرئيسي:</label>
                              <input
                                type="text"
                                value={formCompanyLegalName}
                                onChange={(e) => setFormCompanyLegalName(e.target.value)}
                                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                                placeholder="مثال: شركة لؤلؤة مراسيم للتجارة المحدودة"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 mb-1.5">• حقل الوصف / التعريف العام:</label>
                              <input
                                type="text"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                                placeholder="اكتب وصفاً مختصراً للهوية البصرية والرسالة..."
                              />
                            </div>
                          </div>

                          {/* Real Uploads */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-850/60">
                            <div>
                              <span className="block text-[10px] text-gray-500 mb-1">الشعار الرسمي (Logo):</span>
                              <div className="space-y-1.5">
                                {uploadedLogo && (
                                  <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                                    <img src={uploadedLogo} className="h-full w-full object-cover" />
                                    <button 
                                      type="button" 
                                      onClick={() => setUploadedLogo("")}
                                      className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                                    >
                                      حذف الشعار
                                    </button>
                                  </div>
                                )}
                                <button type="button" onClick={() => simulateImageUpload("logo")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                                  <span>📂</span>
                                  <span>{uploadedLogo ? "تغيير الشعار" : "رفع الشعار"}</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-500 mb-1">صورة الغلاف (Cover):</span>
                              <div className="space-y-1.5">
                                {uploadedCover && (
                                  <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                                    <img src={uploadedCover} className="h-full w-full object-cover" />
                                    <button 
                                      type="button" 
                                      onClick={() => setUploadedCover("")}
                                      className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                                    >
                                      حذف الغلاف
                                    </button>
                                  </div>
                                )}
                                <button type="button" onClick={() => simulateImageUpload("cover")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                                  <span>📂</span>
                                  <span>{uploadedCover ? "تغيير الغلاف" : "رفع الغلاف"}</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-500 mb-1">شعار الفاتورة (Invoice):</span>
                              <div className="space-y-1.5">
                                {uploadedInvoiceLogo && (
                                  <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                                    <img src={uploadedInvoiceLogo} className="h-full w-full object-cover" />
                                    <button 
                                      type="button" 
                                      onClick={() => setUploadedInvoiceLogo("")}
                                      className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                                    >
                                      حذف الشعار
                                    </button>
                                  </div>
                                )}
                                <button type="button" onClick={() => simulateImageUpload("invoice")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                                  <span>📂</span>
                                  <span>{uploadedInvoiceLogo ? "تغيير الفاتورة" : "رفع الفاتورة"}</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-500 mb-1">ختم المؤسسة الملون (Stamp):</span>
                              <div className="space-y-1.5">
                                {uploadedStamp && (
                                  <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                                    <img src={uploadedStamp} className="h-full w-full object-cover" />
                                    <button 
                                      type="button" 
                                      onClick={() => setUploadedStamp("")}
                                      className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                                    >
                                      حذف الختم
                                    </button>
                                  </div>
                                )}
                                <button type="button" onClick={() => simulateImageUpload("stamp")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                                  <span>📂</span>
                                  <span>{uploadedStamp ? "تغيير الختم" : "رفع الختم"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Official Registration fields */}
                      {activeFormTab === "legal" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-right">
                          <div>
                            <label className="block text-gray-400 mb-1 flex items-center justify-between">
                              <span>• السجل التجاري الرسمي (CR Number):</span>
                            </label>
                            <div className="relative flex items-center">
                              <input 
                                type="text" 
                                value={formCrNumber} 
                                onChange={e => setFormCrNumber(e.target.value)} 
                                placeholder="مثال: 1010345678"
                                className="w-full p-2.5 pl-20 rounded-lg bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right pr-2.5" 
                              />
                              <button
                                type="button"
                                onClick={() => handleAutoFetchCrData(formCrNumber)}
                                className="absolute left-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black rounded flex items-center gap-1 transition-all border-none cursor-pointer"
                                title="جلب تلقائي لبيانات السجل والعنوان الوطني"
                              >
                                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                <span>جلب ⚡</span>
                              </button>
                            </div>
                            <span className="text-[9px] text-[#D4AF37] mt-1 block">أدخل رقم السجل التجاري واضغط جلب لتعبئة الملف وتوثيقه تلقائياً.</span>
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">• تاريخ إصدار السجل:</label>
                            <input type="text" value={formCrDate} onChange={e => setFormCrDate(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" placeholder="١٤٤٥-٠٥-١٢" />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">• تاريخ انتهاء صلاحية السجل:</label>
                            <input type="text" value={formCrExpiryDate} onChange={e => setFormCrExpiryDate(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" placeholder="١٤٥٠-٠٥-١٢" />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">• الرقم الضريبي الموحد (Vat - 15 رمزاً):</label>
                            <input type="text" value={formVatNumber} onChange={e => setFormVatNumber(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">• الرقم الوطني الموحد للمنشأة 700:</label>
                            <input type="text" value={formUnified700} onChange={e => setFormUnified700(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">• رقم المنشأة ومكتب العمل:</label>
                            <input type="text" value={formLaborNumber} onChange={e => setFormLaborNumber(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" />
                          </div>
                        </div>
                      )}

                      {/* National Address Verification TAB */}
                      {activeFormTab === "address" && (
                        <div className="space-y-4 text-xs font-sans">
                          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex-1 text-right">
                              <span className="text-[10px] text-amber-500 font-extrabold block">🇸🇦 ميزة تفكيك العنوان السريع SPL لسبل والمطابقة الجغرافية:</span>
                              <p className="text-[10px] text-gray-400 leading-normal mt-0.5">ادخل رمز العنوان المختصر (مكون من ٨ رموز مثل: RDOD1194 أو JMDD9951) لجلب ومعايرة الإحداثيات الوطنية بالكامل.</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                              <input
                                type="text"
                                value={formShortAddress}
                                onChange={e => setFormShortAddress(e.target.value)}
                                className="w-28 text-center uppercase font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-550"
                                placeholder="RDOD1194"
                              />
                              <button
                                type="button"
                                onClick={handleFetchAddressDetails}
                                disabled={isFetchingAddress}
                                className="py-2 px-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 text-black font-extrabold rounded-lg cursor-pointer transition-all border-none"
                              >
                                {isFetchingAddress ? "جاري المطابقة..." : "جلب البيانات تلقائياً ⚡"}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                            <div>
                              <label className="text-gray-450 text-[10px] block mb-1">رقم المبنى:</label>
                              <input type="text" value={formBuildingNum} onChange={e => setFormBuildingNum(e.target.value)} className="w-full p-2 rounded bg-slate-950 border border-slate-850 text-white text-center font-mono" />
                            </div>
                            <div>
                              <label className="text-gray-450 text-[10px] block mb-1">الشارع:</label>
                              <input type="text" value={formStreetName} onChange={e => setFormStreetName(e.target.value)} className="w-full p-2 rounded bg-slate-950 border border-slate-850 text-white" />
                            </div>
                            <div>
                              <label className="text-gray-450 text-[10px] block mb-1">الحي والموقع:</label>
                              <input type="text" value={formDistrict} onChange={e => setFormDistrict(e.target.value)} className="w-full p-2 rounded bg-slate-950 border border-slate-850 text-white" />
                            </div>
                            <div>
                              <label className="text-gray-450 text-[10px] block mb-1">المدينة والرمز البريدي:</label>
                              <input type="text" value={formCity} onChange={e => setFormCity(e.target.value)} className="w-full p-2 rounded bg-slate-950 border border-slate-850 text-white font-mono" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contacts Form */}
                      {activeFormTab === "contact" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-right">
                          <div>
                            <label className="block text-gray-450 mb-1">الهاتف الرئيسي للمتجر:</label>
                            <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-850 text-white font-mono" />
                          </div>
                          <div>
                            <label className="block text-gray-450 mb-1">البريد المعتمد للمقترحات:</label>
                            <input type="text" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-850 text-white font-mono" />
                          </div>
                          <div>
                            <label className="block text-gray-450 mb-1">الموقع الإلكتروني:</label>
                            <input type="text" value={formWebsite} onChange={e => setFormWebsite(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-850 text-white font-mono" placeholder="https://..." />
                          </div>
                        </div>
                      )}

                      {/* Bank Ledger management */}
                      {activeFormTab === "bank" && (
                        <div className="space-y-4">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">اسم مصرف التسويات:</label>
                              <input type="text" value={newBankName} onChange={e => setNewBankName(e.target.value)} className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white text-xs" placeholder="مصرف الراجحي" />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">الآيبان IBAN الدولي:</label>
                              <input type="text" value={newBankIban} onChange={e => setNewBankIban(e.target.value)} className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white text-center font-mono text-xs" placeholder="SA..." />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">اسم المستفيد المعتمد:</label>
                              <input type="text" value={newBankBeneficiary} onChange={e => setNewBankBeneficiary(e.target.value)} className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white text-xs" placeholder="اسم المنشأة" />
                            </div>
                            <div className="flex flex-col justify-end">
                              <button type="button" onClick={handleAddBankAccount} className="bg-amber-500 hover:bg-amber-400 text-black py-1.5 px-3 rounded text-xs font-black cursor-pointer border-none">إضافة حساب 💳</button>
                            </div>
                          </div>

                          <div className="space-y-1 mt-2">
                            {bankAccountsList.map(b => (
                              <div key={b.id} className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg flex justify-between items-center text-xs">
                                <span className="font-bold">{b.bankName} - {b.iban}</span>
                                <button type="button" onClick={() => setBankAccountsList(bankAccountsList.filter(x => x.id !== b.id))} className="text-red-400 hover:text-red-500 cursor-pointer border-0"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* E-com Platforms setup */}
                      {activeFormTab === "platforms" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-right">
                          <label className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl cursor-pointer">
                            <input type="checkbox" checked={sallaConnected} onChange={e => setSallaConnected(e.target.checked)} className="accent-amber-500 cursor-pointer" />
                            <div>
                              <p className="font-extrabold text-white">تفويض منصة سلة (Salla API Gateway)</p>
                              <span className="text-[10px] text-gray-500">مزامنة فواتير العملاء تلقائياً لدفتر اليومية.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl cursor-pointer">
                            <input type="checkbox" checked={zidConnected} onChange={e => setZidConnected(e.target.checked)} className="accent-amber-500 cursor-pointer" />
                            <div>
                              <p className="font-extrabold text-white">ارتباط متجر زد (Zid Integrations)</p>
                              <span className="text-[10px] text-gray-500">تحديث الأسعار مع مستودع السلي والملز الكترونياً.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl cursor-pointer">
                            <input type="checkbox" checked={shopifyConnected} onChange={e => setShopifyConnected(e.target.checked)} className="accent-amber-500 cursor-pointer" />
                            <div>
                              <p className="font-extrabold text-white">أسناد منصة شوبيفاي الموحدة (Shopify)</p>
                              <span className="text-[10px] text-gray-500">توصيل المخطط الدولي ونقاط البيع المشتركة.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl cursor-pointer">
                            <input type="checkbox" checked={wooConnected} onChange={e => setWooConnected(e.target.checked)} className="accent-amber-500 cursor-pointer" />
                            <div>
                              <p className="font-extrabold text-white">اتصال ووردبريس WooCommerce</p>
                              <span className="text-[10px] text-gray-500">تمكين التصدير وحالة الطلب بـ ERP سهم.</span>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Relations Linkage checkboxes */}
                      {activeFormTab === "relations" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-right text-xs">
                          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
                            <span className="font-black text-white block mb-2">• ربط فروع الكيان:</span>
                            <div className="space-y-1 max-h-44 overflow-y-auto">
                              {branches.map(b => (
                                <label key={b.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded cursor-pointer leading-tight">
                                  <input type="checkbox" checked={selectedBranches.includes(b.id)} onChange={() => setSelectedBranches(selectedBranches.includes(b.id) ? selectedBranches.filter(x => x !== b.id) : [...selectedBranches, b.id])} />
                                  <span>{b.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
                            <span className="font-black text-white block mb-2">• ربط مخازن الجرد:</span>
                            <div className="space-y-1 max-h-44 overflow-y-auto">
                              {warehouses.map(w => (
                                <label key={w.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded cursor-pointer leading-tight">
                                  <input type="checkbox" checked={selectedWarehouses.includes(w.id)} onChange={() => setSelectedWarehouses(selectedWarehouses.includes(w.id) ? selectedWarehouses.filter(x => x !== w.id) : [...selectedWarehouses, w.id])} />
                                  <span>{w.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
                            <span className="font-black text-white block mb-2">• تفويض العاملين والمديرين:</span>
                            <div className="space-y-1 max-h-44 overflow-y-auto">
                              {users.map(u => (
                                <label key={u.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded cursor-pointer leading-tight">
                                  <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => setSelectedUsers(selectedUsers.includes(u.id) ? selectedUsers.filter(x => x !== u.id) : [...selectedUsers, u.id])} />
                                  <span>{u.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. ORIGINAL FORM CREATION MODE (DENSE RENDER COMPACT) */}
          {isCreatingNew && (
            <div className="space-y-6">
              
              {/* Form title controls */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] text-amber-500 block font-black uppercase">منظومة تأسيس كيان مرخص جديد:</span>
                  <h3 className="text-sm font-black text-white">{formName || "يرجى كتابة اسم المتجر الجديد..."}</h3>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className="flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-gray-400 hover:bg-slate-900 cursor-pointer"
                  >
                    إلغاء وتراجع 🛑
                  </button>
                  <button
                    onClick={handleSaveStore}
                    className="flex-1 sm:flex-initial py-2 px-5 rounded-xl text-xs font-black bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer border-none"
                  >
                    حفظ وتدشين المتجر 💾
                  </button>
                </div>
              </div>

              {/* Form Tab selectors */}
              <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
                {[
                  { id: "general", label: "البيانات العامة والهوية 🏢" },
                  { id: "legal", label: "البيانات الرسمية والضرائب 📜" },
                  { id: "contact", label: "بيانات التواصل والمواقع 📞" },
                  { id: "address", label: "العنوان الوطني لسبل 📍" },
                  { id: "bank", label: "الحسابات البنكية المعتمدة 💳" },
                  { id: "platforms", label: "ربط القنوات والمنصات 🔗" },
                  { id: "relations", label: "الفروع والمخازن والعمالة 🧱" }
                ].map(tb => (
                  <button
                    key={tb.id}
                    onClick={() => setActiveFormTab(tb.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs transition-all border-none font-bold cursor-pointer font-sans whitespace-nowrap ${
                      activeFormTab === tb.id ? "bg-amber-500 text-black font-extrabold" : "bg-slate-900 text-gray-400 hover:bg-slate-800"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* Render creation inputs */}
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800">
                {activeFormTab === "general" && (
                  <div className="space-y-4 font-sans text-xs">
                    
                    <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/20 mb-2 text-right">
                      <label className="block text-amber-400 font-extrabold text-[11px] mb-1.5 font-sans">
                        🏢 المنشأة / الشركة الأم التابع لها هذا المتجر التابع (إلزامي):
                      </label>
                      <select
                        value={formCompanyId}
                        onChange={(e) => setFormCompanyId(e.target.value)}
                        className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium cursor-pointer"
                      >
                        {companies.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} - {comp.companyLegalName} (سجل: {comp.crNumber})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">
                        سيتم ربط هذا المتجر (علامة وقناة بيع) بالكيان القانوني المحدد لتسهيل دمج الفروع والوثائق والضرائب بشكل هرمي متصل.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right pr-1">
                      <div>
                        <label className="block text-gray-400 mb-1.5">• اسم المتجر الأساسي (الداخلي بالـ ERP):</label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
                          placeholder="مثال: مراسيم الطيب للعود"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1.5">• الاسم التجاري للمنشأة للمستندات والفواتير:</label>
                        <input
                          type="text"
                          value={formTradeName}
                          onChange={(e) => setFormTradeName(e.target.value)}
                          className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
                          placeholder="مثال: مؤسسة مراسيم الطيب للتجارة"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right pr-1">
                      <div>
                        <label className="block text-gray-400 mb-1.5">• الاسم القانوني الموثق بوزارة التجارة للشركة الأم:</label>
                        <input
                          type="text"
                          value={formCompanyLegalName}
                          onChange={(e) => setFormCompanyLegalName(e.target.value)}
                          className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                          placeholder="مثال: شركة لؤلؤة مراسيم التجارية ذ.م.م"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1.5">• وصف المتجر ورسالته:</label>
                        <input
                          type="text"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                          placeholder="تعريف عام بالنشاط..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === "legal" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-right">
                    <div>
                      <label className="block text-gray-400 mb-1 flex items-center justify-between">
                        <span>• السجل التجاري (Commercial CR):</span>
                      </label>
                      <div className="relative flex items-center">
                        <input 
                          type="text" 
                          value={formCrNumber} 
                          onChange={e => setFormCrNumber(e.target.value)} 
                          placeholder="مثال: 1010345678"
                          className="w-full p-2.5 pl-20 rounded-lg bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right pr-2.5" 
                        />
                        <button
                          type="button"
                          onClick={() => handleAutoFetchCrData(formCrNumber)}
                          className="absolute left-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black rounded flex items-center gap-1 transition-all border-none cursor-pointer"
                          title="جلب تلقائي لبيانات السجل والعنوان الوطني"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin-slow" />
                          <span>جلب ⚡</span>
                        </button>
                      </div>
                      <span className="text-[9px] text-[#D4AF37] mt-1 block">أدخل رقم السجل التجاري واضغط جلب لتعبئة الملف وتوثيقه تلقائياً.</span>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">• تاريخ إصدار السجل التجاري:</label>
                      <input type="text" value={formCrDate} onChange={e => setFormCrDate(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" placeholder="١٤٤٥-٠٥-١٢" />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">• تاريخ انتهاء صلاحية السجل:</label>
                      <input type="text" value={formCrExpiryDate} onChange={e => setFormCrExpiryDate(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" placeholder="١٤٥٠-٠٥-١٢" />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">• الرقم الضريبي الموحد (VAT):</label>
                      <input type="text" value={formVatNumber} onChange={e => setFormVatNumber(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">• الرقم الوطني الموحد للمنشأة 700:</label>
                      <input type="text" value={formUnified700} onChange={e => setFormUnified700(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-white" />
                    </div>
                  </div>
                )}

                {activeFormTab === "contact" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-right">
                    <div>
                      <label className="block text-gray-450 mb-1">هاتف المتجر:</label>
                      <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full p-2.5 rounded bg-slate-950 border border-slate-850 text-white" />
                    </div>
                    <div>
                      <label className="block text-gray-450 mb-1">البريد الإلكتروني المعتمد:</label>
                      <input type="text" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full p-2.5 rounded bg-slate-950 border border-slate-850 text-white" />
                    </div>
                  </div>
                )}

                {activeFormTab === "address" && (
                  <div className="space-y-4 text-xs font-sans">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex-1 text-right">
                        <span className="text-[10px] text-amber-500 font-extrabold block">🇸🇦 معالج العنوان الوطني سبل:</span>
                        <p className="text-[10px] text-gray-400">مثال كود الصحافة بالرياض: RDOD1194</p>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={formShortAddress} onChange={e => setFormShortAddress(e.target.value)} className="w-28 p-2 rounded bg-slate-950 border border-slate-800 text-white text-center font-mono" placeholder="RDOD1194" />
                        <button type="button" onClick={handleFetchAddressDetails} className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded">جلب العنوان الوطني تزامناً</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === "bank" && (
                  <div className="p-3 bg-slate-950/40 rounded-xl space-y-3">
                    <p className="text-gray-400 text-xs">يمكنك قيد الحسابات البنكية عقب تدشين المتجر وتأسيسه تتبعاً للشاشات.</p>
                  </div>
                )}

                {activeFormTab === "platforms" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-right">
                    <label className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={sallaConnected} onChange={e => setSallaConnected(e.target.checked)} className="accent-amber-500" />
                      <div>
                        <p className="font-extrabold text-white">تفويض منصة سلة (Salla API)</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={zidConnected} onChange={e => setZidConnected(e.target.checked)} className="accent-amber-500" />
                      <div>
                        <p className="font-extrabold text-white">اتصال متجر زد (Zid API)</p>
                      </div>
                    </label>
                  </div>
                )}

                {activeFormTab === "relations" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-right text-xs">
                    <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
                      <span className="font-black text-white block mb-2">• فروع الكيان:</span>
                      <div className="space-y-1">
                        {branches.map(b => (
                          <label key={b.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded cursor-pointer">
                            <input type="checkbox" checked={selectedBranches.includes(b.id)} onChange={() => setSelectedBranches(selectedBranches.includes(b.id) ? selectedBranches.filter(x => x !== b.id) : [...selectedBranches, b.id])} />
                            <span>{b.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
                      <span className="font-black text-white block mb-2">• مستودعات الجرد:</span>
                      <div className="space-y-1">
                        {warehouses.map(w => (
                          <label key={w.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded cursor-pointer font-sans">
                            <input type="checkbox" checked={selectedWarehouses.includes(w.id)} onChange={() => setSelectedWarehouses(selectedWarehouses.includes(w.id) ? selectedWarehouses.filter(x => x !== w.id) : [...selectedWarehouses, w.id])} />
                            <span>{w.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {store360ActiveTab === "cameras" && currentStoreObjOn360 && (
                  <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="text-right">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 justify-end">
                          <span>مركز التحكم ورصد كاميرات المراقبة 🎥⚡</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1">بث حي ومباشر للفروع التابعة ومراقبة الصندوق والمخازن وسجل الأحداث للذكاء الاصطناعي.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] text-gray-400">الفرع النشط للمشاهدة:</span>
                        <select 
                          value={cameraSelectedBranchId}
                          onChange={(e) => {
                            setCameraSelectedBranchId(e.target.value);
                            setEditingCameraId(null);
                          }}
                          className="rounded-xl p-2.5 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans text-xs"
                        >
                          <option value="">-- اختر الفرع --</option>
                          {branches
                            .filter(b => b.storeId === currentStoreObjOn360.id || b.store_id === currentStoreObjOn360.id)
                            .map(b => (
                              <option key={b.id} value={b.id}>
                                📍 {b.name} ({b.city})
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    {/* Empty state or Cam Grid */}
                    {!cameraSelectedBranchId ? (
                      <div className="text-center py-12 text-gray-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                        <Video className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                        <p className="text-xs">يرجى تحديد فرع نشط لعرض بث كاميرات المراقبة الخاصة به.</p>
                      </div>
                    ) : (
                      (() => {
                        const activeBranchObj = branches.find(b => b.id === cameraSelectedBranchId);
                        // Filter or seed default cameras
                        const activeBranchCams = (() => {
                          const filtered = storeCameras.filter(c => c.branchId === cameraSelectedBranchId);
                          if (filtered.length > 0) return filtered;
                          
                          // Initialize 4 defaults
                          return [
                            { id: `cam_${cameraSelectedBranchId}_1`, branchId: cameraSelectedBranchId, name: "بوابة الدخول الرئيسية (Entrance)", streamUrl: "", status: "online" },
                            { id: `cam_${cameraSelectedBranchId}_2`, branchId: cameraSelectedBranchId, name: "منطقة المحاسبة POS 1 (Cashier)", streamUrl: "", status: "online" },
                            { id: `cam_${cameraSelectedBranchId}_3`, branchId: cameraSelectedBranchId, name: "ممر المنتجات الرئيسي (Aisle)", streamUrl: "", status: "online" },
                            { id: `cam_${cameraSelectedBranchId}_4`, branchId: cameraSelectedBranchId, name: "مستودع الجرد والتحميل (Logistics)", streamUrl: "", status: "online" }
                          ];
                        })();

                        const handleSaveCameraSettings = (camId: string) => {
                          let updated = [...storeCameras];
                          const idx = updated.findIndex(c => c.id === camId);
                          const camObj = activeBranchCams.find(c => c.id === camId);
                          if (camObj) {
                            const newCam = {
                              ...camObj,
                              name: cameraFormName,
                              streamUrl: cameraFormUrl
                            };
                            if (idx !== -1) {
                              updated[idx] = newCam;
                            } else {
                              updated.push(newCam);
                            }
                          }
                          setStoreCameras(updated);
                          try {
                            localStorage.setItem("sahm_branch_cameras", JSON.stringify(updated));
                          } catch {}
                          setEditingCameraId(null);
                          if (triggerNotification) {
                            triggerNotification("تم تحديث إعدادات الكاميرا بنجاح! ⚙️🎥", "success");
                          }
                        };

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeBranchCams.map((cam: any) => {
                              const isEditing = editingCameraId === cam.id;
                              return (
                                <div key={cam.id} className="p-4 rounded-3xl bg-slate-950/40 border border-slate-800 hover:border-amber-500/20 transition-all flex flex-col justify-between gap-3">
                                  {/* Live Simulated / Real Video Player */}
                                  <CCTVFeedSimulator 
                                    cameraName={cam.name} 
                                    branchName={activeBranchObj?.name || "فرع تشغيلي"} 
                                    streamUrl={cam.streamUrl} 
                                  />
                                  
                                  {/* Camera settings Form or Info */}
                                  {isEditing ? (
                                    <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-2.5 text-right font-sans text-xs">
                                      <div>
                                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">• اسم وموضع الكاميرا:</label>
                                        <input 
                                          type="text" 
                                          value={cameraFormName} 
                                          onChange={(e) => setCameraFormName(e.target.value)} 
                                          className="w-full rounded-xl py-2 px-3 bg-slate-900 border border-slate-800 text-white text-[11px] outline-none focus:border-amber-500 text-right"
                                          placeholder="مثال: البوابة الخلفية"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">• رابط البث السحابي (HLS / WebRTC / HTTP Video):</label>
                                        <input 
                                          type="text" 
                                          value={cameraFormUrl} 
                                          onChange={(e) => setCameraFormUrl(e.target.value)} 
                                          className="w-full rounded-xl py-2 px-3 bg-slate-900 border border-slate-800 text-white text-[11px] outline-none focus:border-amber-500 text-left font-mono"
                                          placeholder="https://example.com/stream/playlist.m3u8"
                                        />
                                      </div>
                                      <div className="flex gap-2 justify-end pt-1">
                                        <button 
                                          type="button"
                                          onClick={() => setEditingCameraId(null)}
                                          className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold border-none cursor-pointer"
                                        >
                                          إلغاء
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => handleSaveCameraSettings(cam.id)}
                                          className="py-1 px-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-[10px] border-none cursor-pointer"
                                        >
                                          حفظ التعديل ✓
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between items-center p-1 bg-slate-950/20 rounded-xl border border-slate-900/50">
                                      <div className="text-right">
                                        <span className="text-xs text-white font-extrabold block">🎥 {cam.name}</span>
                                        <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">
                                          {cam.streamUrl ? "المصدر: بث مخصص" : "المصدر: محاكاة أمنية ذكية"}
                                        </span>
                                      </div>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setEditingCameraId(cam.id);
                                          setCameraFormName(cam.name);
                                          setCameraFormUrl(cam.streamUrl || "");
                                        }}
                                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-500 hover:text-amber-400 rounded-lg text-[10px] font-extrabold border-none cursor-pointer flex items-center gap-1 font-sans"
                                      >
                                        <span>تعديل المصدر ⚙️</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div 
          className="p-4 border-t flex items-center justify-between"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <span className="text-[10.5px] text-gray-500 font-mono">SAHM HUB MULTI-TENANT ARCH v9.5 PRO | SECURE SSL CERTIFIED</span>
          
          <div className="flex gap-2">
            {viewingStore360Id && !isCreatingNew && (
              <button
                onClick={() => setViewingStore360Id(null)}
                className="py-1.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-gray-300 cursor-pointer"
              >
                رجوع لقائمة المتاجر ↩️
              </button>
            )}
            {isCreatingNew && (
              <button
                onClick={() => setIsCreatingNew(false)}
                className="py-1.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-gray-300 cursor-pointer"
              >
                رجوع ↩️
              </button>
            )}
            
            {/* Save Buttons dynamic */}
            {(isCreatingNew || (viewingStore360Id && store360ActiveTab === "edit")) ? (
              <button
                onClick={handleSaveStore}
                className="py-1.5 px-5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg cursor-pointer border-none"
              >
                تأكيد واعتماد المستندات 💾✅
              </button>
            ) : (
              onClose ? (
                <button
                  onClick={onClose}
                  className="py-1.5 px-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-black text-white hover:bg-slate-900 cursor-pointer"
                >
                  إغلاق المنصة 🚪
                </button>
              ) : null
            )}
          </div>
        </div>

      </div>

      {/* ⚠️ ARCHIVE / DELETE CONFIRMATION MODAL */}
      {storeToDelete && (
        <div id="store-delete-confirm-modal" className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg rounded-2xl border p-6 text-right space-y-5 animate-fade-in-up shadow-2xl"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25">
                <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-black text-white">
                  هل تريد حذف/أرشفة هذا المتجر؟
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">تأكيد عملية تجميد كيان المنشأة ونقلها إلى سجل الأرشيف المالي والتنظيمي.</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-200 font-sans leading-relaxed">
                هل أنت متأكد من رغبتك في أرشفة المتجر <strong className="text-amber-400">[{storeToDelete.name}]</strong>؟ سيتم تعطيل المتجر وإخفائه من القوائم النشطة ونقله إلى تبويب الأرشيف ليبقى محفوظاً للرجوع إليه أو استعادته لاحقاً.
              </p>

              {(() => {
                const storeToArchiveObj = stores.find(s => s.id === storeToDelete.id);
                const storeProductsCount = (() => {
                  if (import.meta.env.VITE_DATA_MODE === "supabase") return 0;
                  try {
                    const localProducts = JSON.parse(localStorage.getItem("sahm_web_products") || "[]");
                    return localProducts.filter((p: any) => p.store_id === storeToDelete.id).length;
                  } catch {
                    return 0;
                  }
                })();
                const storeInvoicesCount = (() => {
                  if (import.meta.env.VITE_DATA_MODE === "supabase") return 0;
                  try {
                    const localInvoices = JSON.parse(localStorage.getItem("sahm_web_invoices") || "[]");
                    return localInvoices.filter((inv: any) => inv.store_id === storeToDelete.id).length;
                  } catch {
                    return 0;
                  }
                })();
                const hasAssociatedData = storeToArchiveObj && (
                  (storeToArchiveObj.branches?.length || 0) > 0 ||
                  (storeToArchiveObj.warehouses?.length || 0) > 0 ||
                  (storeToArchiveObj.users?.length || 0) > 0 ||
                  storeProductsCount > 0 ||
                  storeInvoicesCount > 0
                );

                if (!hasAssociatedData) return null;

                return (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25 text-right space-y-2.5 font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-amber-500 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>تنبيه: يحتوي هذا المتجر على بيانات وعناصر مرتبطة به:</span>
                    </div>
                    <ul className="list-disc pr-5 space-y-1 text-[11px] text-gray-300">
                      {storeToArchiveObj && (storeToArchiveObj.branches?.length || 0) > 0 && (
                        <li>فروع رسمية تابعة: <strong className="text-white font-mono">{storeToArchiveObj.branches.length} فروع</strong></li>
                      )}
                      {storeToArchiveObj && (storeToArchiveObj.warehouses?.length || 0) > 0 && (
                        <li>مستودعات جرد نشطة: <strong className="text-white font-mono">{storeToArchiveObj.warehouses.length} مستودعات</strong></li>
                      )}
                      {storeToArchiveObj && (storeToArchiveObj.users?.length || 0) > 0 && (
                        <li>موظفون ومديرون مفوضون: <strong className="text-white font-mono">{storeToArchiveObj.users.length} مستخدمين</strong></li>
                      )}
                      {storeProductsCount > 0 && (
                        <li>منتجات بالكتالوج: <strong className="text-white font-mono">{storeProductsCount} منتجات</strong></li>
                      )}
                      {storeInvoicesCount > 0 && (
                        <li>سجلات فواتير مالية: <strong className="text-white font-mono">{storeInvoicesCount} فواتير</strong></li>
                      )}
                    </ul>
                    <p className="text-[10px] text-amber-500 font-black">
                      ⚠️ ننصح بالتحقق من ربط هذه العناصر بقنوات تشغيلية بديلة قبل التنفيذ السريع.
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t font-sans" style={{ borderColor: theme.border }}>
              <button
                type="button"
                onClick={() => setStoreToDelete(null)}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-gray-400 hover:text-white cursor-pointer transition-all"
              >
                إلغاء التراجع ↩️
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteArchiveStore(storeToDelete.id)}
                className="py-2 px-5 rounded-xl text-xs font-black bg-red-500 text-white hover:bg-red-600 cursor-pointer border-none shadow-lg shadow-red-500/10 flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4" />
                <span>تأكيد الأرشفة والتعطيل ✅</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏬 ADD / EDIT BRANCH MODAL */}
      {showBranchModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-xl rounded-2xl border p-6 text-right space-y-5 animate-scale-up shadow-2xl relative"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Building className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-black text-white">
                    {editingBranch ? `تعديل معلومات الفرع: ${editingBranch.name}` : "إضافة فرع تشغيلي جديد"}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">تحديد النطاقات الجغرافية والمسؤول لخدمات نقاط البيع والـ ERP.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowBranchModal(false); setEditingBranch(null); setBranchFormAddressProfile(undefined); }}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Grid Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              {/* Company Select */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• الشركة/المنشأة المرتبطة <span className="text-rose-500">*</span></label>
                <select 
                  value={branchFormCompanyId}
                  onChange={(e) => {
                    const newCompId = e.target.value;
                    setBranchFormCompanyId(newCompId);
                    setBranchFormStoreId("");
                  }}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                >
                  <option value="">-- اختر المنشأة المرتبطة --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Select */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• المتجر المرتبط (اختياري)</label>
                <select 
                  value={branchFormStoreId}
                  onChange={(e) => setBranchFormStoreId(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                >
                  <option value="">-- بدون متجر مرتبط (اختياري) --</option>
                  {stores
                    .filter(s => s.companyId === branchFormCompanyId || s.company_id === branchFormCompanyId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Branch Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• اسم الفرع <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: فرع السليمانية"
                  value={branchFormName}
                  onChange={(e) => setBranchFormName(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-medium text-right"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• المدينة</label>
                <select 
                  value={branchFormCity}
                  onChange={(e) => setBranchFormCity(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-medium"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="الخبر">الخبر</option>
                  <option value="أبها">أبها</option>
                  <option value="تبوك">تبوك</option>
                </select>
              </div>

              {/* Address */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• العنوان بالكامل</label>
                <input 
                  type="text"
                  placeholder="مثال: طريق الملك عبد العزيز، تقاطع العروبة"
                  value={branchFormAddress}
                  onChange={(e) => setBranchFormAddress(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                />
              </div>

              {/* National Address (Optional) */}
              <div className="sm:col-span-2 pt-1">
                <NationalAddressForm 
                  initialAddress={branchFormAddressProfile} 
                  onChange={(addr) => {
                    setBranchFormAddressProfile(addr);
                    // Auto-fill full address from National Address details if present
                    const formatted = `${addr.buildingNumber} ${addr.streetName}، ${addr.district}، ${addr.city} ${addr.postalCode}`;
                    if (addr.buildingNumber || addr.streetName || addr.district) {
                      setBranchFormAddress(formatted);
                    }
                  }} 
                  theme={theme} 
                />
              </div>

              {/* Branch Manager */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• مدير الفرع المسؤول</label>
                <input 
                  type="text"
                  placeholder="مثال: أ. محمد القحطاني"
                  value={branchFormManager}
                  onChange={(e) => setBranchFormManager(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• رقم التواصل</label>
                <input 
                  type="text"
                  placeholder="9665xxxxxxxx"
                  value={branchFormPhone}
                  onChange={(e) => setBranchFormPhone(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-left font-mono"
                />
              </div>

              {/* Default Warehouse Link */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• المستودع الافتراضي للتزويد</label>
                <select 
                  value={branchFormWh}
                  onChange={(e) => setBranchFormWh(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                >
                  <option value="">-- بدون مستودع مرتبط --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.type === "main" ? "رئيسي" : "فرعي"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Type */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• نوع وتبويب الفرع <span className="text-rose-500">*</span></label>
                <select 
                  value={branchFormType}
                  onChange={(e) => setBranchFormType(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                >
                  <option value="فرع بيع">فرع بيع (فوري بالتجزئة)</option>
                  <option value="معرض">معرض رئيسي (Showroom)</option>
                  <option value="نقطة تشغيل">نقطة تشغيل وسحابي (Kitchen/Cloud)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1 sm:col-span-2 font-sans">
                <label className="text-[10px] text-gray-400 block font-bold">• حالة النشاط والربط</label>
                <select 
                  value={branchFormStatus}
                  onChange={(e) => setBranchFormStatus(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                >
                  <option value="نشط">🟢 نشط ومتاح للتحويل والبيع المباشر</option>
                  <option value="غير نشط">🔴 غير نشط مؤقتاً</option>
                  <option value="مؤرشف">📁 مؤرشف في الأرشيف</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t font-sans" style={{ borderColor: theme.border }}>
              <button
                type="button"
                onClick={() => { setShowBranchModal(false); setEditingBranch(null); setBranchFormAddressProfile(undefined); }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-gray-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveBranch}
                className="py-2.5 px-5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black cursor-pointer border-none shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ بيانات الفرع ✅</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ ADD POS MODAL */}
      {showPosModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-xl rounded-2xl border p-6 text-right space-y-5 animate-scale-up shadow-2xl relative"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-black text-white">
                    إضافة جهاز كاشير أو محطة بيع (POS) جديدة
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">تسجيل نقاط الدفع الفوري الفعالة المربوطة بالفرع ومستنده المالي.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowPosModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              {/* POS Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• اسم نقطة البيع <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: كاشير الاستقبال الرئيسي"
                  value={posFormName}
                  onChange={(e) => setPosFormName(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 font-medium text-right font-sans"
                />
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• الفرع التابع لها <span className="text-rose-500">*</span></label>
                <select 
                  value={currentPosBranchId}
                  onChange={(e) => setCurrentPosBranchId(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 text-right font-medium font-sans"
                >
                  <option value="">-- اختر الفرع بالهيكل --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Staff (Cashier in charge) */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• الموظف المسؤول / الكاشير المفوض</label>
                <select 
                  value={posFormCashier}
                  onChange={(e) => setPosFormCashier(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 text-right font-medium font-sans"
                >
                  <option value="">-- كاشير مالي متاح --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.name}>
                      👤 {u.name} ({u.role || "موظف"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Warehouse for Dispensing */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• المستودع الافتراضي للصرف</label>
                <select 
                  value={posFormWh}
                  onChange={(e) => setPosFormWh(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-805 text-white focus:outline-none focus:border-sky-500 text-right font-sans"
                >
                  <option value="">-- سحب تلقائي من مستودع الفرع --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.type === "main" ? "رئيسي" : "فرعي"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Allowed Payment Methods */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• طرق الدفع المسموحة في النقطة</label>
                <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                    <input 
                      type="checkbox"
                      checked={posFormPayMethods.includes("cash")}
                      onChange={(e) => {
                        if (e.target.checked) setPosFormPayMethods([...posFormPayMethods, "cash"]);
                        else setPosFormPayMethods(posFormPayMethods.filter(m => m !== "cash"));
                      }}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                    <span>💵 نقد (Cash)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                    <input 
                      type="checkbox"
                      checked={posFormPayMethods.includes("card")}
                      onChange={(e) => {
                        if (e.target.checked) setPosFormPayMethods([...posFormPayMethods, "card"]);
                        else setPosFormPayMethods(posFormPayMethods.filter(m => m !== "card"));
                      }}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                    <span>💳 مدى / فيزا (Card)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                    <input 
                      type="checkbox"
                      checked={posFormPayMethods.includes("transfer")}
                      onChange={(e) => {
                        if (e.target.checked) setPosFormPayMethods([...posFormPayMethods, "transfer"]);
                        else setPosFormPayMethods(posFormPayMethods.filter(m => m !== "transfer"));
                      }}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                    <span>🏦 تحويل بنكي (Bank Transfer)</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• حالة نشاط الكاشير</label>
                <select 
                  value={posFormStatus}
                  onChange={(e) => setPosFormStatus(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 text-right font-medium font-sans"
                >
                  <option value="نشط">🟢 نشطة وجاهزة لاستقبال ومزامنة جلسات اليومية</option>
                  <option value="غير نشط">🔴 معطلة مؤقتاً</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t font-sans" style={{ borderColor: theme.border }}>
              <button
                type="button"
                onClick={() => setShowPosModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-gray-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSavePos}
                className="py-2.5 px-5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-550 text-white cursor-pointer border-none shadow-lg shadow-sky-600/10 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتفعيل جهاز الكاشير POS 🖥️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 ADD WAREHOUSE MODAL */}
      {showWhModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-xl rounded-2xl border p-6 text-right space-y-5 animate-scale-up shadow-2xl relative"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-black text-white">
                    إضافة مستودع جرد لوجستي جديد
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">تسجيل مركز مخزني أو مستودع فرعي لحفظ السلع والصرف لنقاط البيع.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowWhModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              {/* Company Select */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• الشركة/المنشأة المرتبطة <span className="text-rose-500">*</span></label>
                <select 
                  value={whFormCompanyId}
                  onChange={(e) => {
                    setWhFormCompanyId(e.target.value);
                    setWhFormBranch(""); // Reset branch when company changes
                  }}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-right font-sans"
                >
                  <option value="">-- اختر المنشأة المرتبطة --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• اسم المستودع <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: مستودع جدة المركزي"
                  value={whFormName}
                  onChange={(e) => setWhFormName(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-medium text-right font-sans"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• تصنيف المستودع <span className="text-rose-500">*</span></label>
                <select 
                  value={whFormType}
                  onChange={(e) => setWhFormType(e.target.value as any)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-right font-medium font-sans"
                >
                  <option value="main">رئيسي للتوزيع (Main Distribution)</option>
                  <option value="sub">فرعي جرد محلي (Retail Shelf/Stockroom)</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• الموقع الجغرافي</label>
                <input 
                  type="text"
                  placeholder="مثال: المنطقة الصناعية الثانية"
                  value={whFormLocation}
                  onChange={(e) => setWhFormLocation(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-right font-sans"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">• السعة الاستيعابية القصوى (وحدة)</label>
                <input 
                  type="number"
                  placeholder="مثال: 5000"
                  value={whFormCapacity}
                  onChange={(e) => setWhFormCapacity(Number(e.target.value))}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-left font-mono"
                />
              </div>

              {/* Associated Branch */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-gray-400 block font-bold">• ربطه بالفرع التابع له فوراً (اختياري)</label>
                <select 
                  value={whFormBranch}
                  onChange={(e) => setWhFormBranch(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-right font-medium font-sans"
                >
                  <option value="">-- لا يوجد فرع/مستودع غير مرتبط --</option>
                  {branches
                    .filter(b => b.companyId === whFormCompanyId || b.company_id === whFormCompanyId)
                    .map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t font-sans" style={{ borderColor: theme.border }}>
              <button
                type="button"
                onClick={() => setShowWhModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-gray-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveWh}
                className="py-2.5 px-5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer border-none shadow-lg shadow-emerald-600/10 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>إنشاء وتخزين المستودع 📦✅</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK LOGO / COVER IMAGE MODAL ON CLICK */}
      {quickImageStoreObj && quickImageField && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800 shadow-[0_0_30px_rgba(212,175,55,0.15)] rounded-2xl overflow-hidden text-right select-none animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-zinc-950">
              <span className="text-[9px] bg-[#D4AF37] text-black px-2 py-0.5 rounded font-black">التبديل الفوري للصور 📷</span>
              <h3 className="text-sm font-black text-white">تحديث صورة {quickImageField === "logoUrl" ? "شعار الكيان" : "غلاف المعرض"}</h3>
              <button 
                onClick={() => { setQuickImageStoreObj(null); setQuickImageField(null); }}
                className="text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 font-sans">
              <p className="text-[11px] text-zinc-400 leading-normal font-medium">
                المنشأة: <strong className="text-white">{quickImageStoreObj.name}</strong>. يمكنك تحميل ملف صورة جديد من جهازك، أو لصق رابط مباشر للصورة أدناه لحفظ التعديلات فوراً.
              </p>

              {/* Preview */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-slate-900 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[8.5px] text-zinc-500 font-bold block">معاينة الصورة الجديدة</span>
                <div className="w-24 h-16 rounded-lg bg-zinc-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  {(quickImageUploadBase64 || quickImageValue) ? (
                    <img 
                      src={quickImageUploadBase64 || quickImageValue} 
                      alt="Brand Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-bold">لا توجد صورة</span>
                  )}
                </div>
              </div>

              {/* Local upload input */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] text-amber-500 font-extrabold block">الخيار الأول: ارفع ملف صورة من جهازك:</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setQuickImageUploadBase64(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-zinc-950 text-gray-300 border border-slate-900 rounded-xl p-2.5 text-xs focus:outline-none cursor-pointer"
                />
              </div>

              {/* Paste URL */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] text-amber-500 font-extrabold block">الخيار الثاني: أو الصق رابط صورة مباشر (URL):</label>
                <input 
                  type="text"
                  value={quickImageValue}
                  onChange={(e) => {
                    setQuickImageValue(e.target.value);
                    setQuickImageUploadBase64(""); // reset file upload to prefer typed url
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-zinc-950 text-gray-300 border border-slate-900 rounded-xl p-2.5 text-left font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950 border-t border-slate-850 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => { setQuickImageStoreObj(null); setQuickImageField(null); }}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-transparent hover:bg-slate-900 text-gray-400 hover:text-white border-none cursor-pointer"
              >
                إلغاء التعديل
              </button>
              <button
                type="button"
                onClick={handleSaveQuickImageUpdate}
                className="py-2 px-5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black cursor-pointer border-none shadow"
              >
                حفظ التغييرات فوراً ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

interface CCTVFeedProps {
  cameraName: string;
  branchName: string;
  streamUrl?: string;
}

function CCTVFeedSimulator({ cameraName, branchName, streamUrl }: CCTVFeedProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (streamUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const w = (canvas.width = 320);
      const h = (canvas.height = 180);

      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(0, 255, 128, 0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(0, 255, 128, 0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 40 + Math.sin(time) * 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(0, 255, 128, 0.12)";
      ctx.lineWidth = 1.5;
      const sweepY = (Math.sin(time * 0.7) * 0.5 + 0.5) * h;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(w, sweepY);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (Math.random() < 0.05) {
          const noise = Math.random() * 20;
          d[i] = Math.min(255, d[i] + noise);
          d[i + 1] = Math.min(255, d[i + 1] + noise);
          d[i + 2] = Math.min(255, d[i + 2] + noise);
        }
      }
      ctx.putImageData(imgData, 0, 0);

      ctx.font = "bold 9px monospace";
      if (Math.floor(time * 2.5) % 2 === 0) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(15, 18, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      }
      ctx.fillText("LIVE  REC", 24, 21);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`CAM: ${cameraName}`, 12, h - 25);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText(`LOC: ${branchName}`, 12, h - 12);

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(`${dateStr} ${timeStr}`, w - 125, 21);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cameraName, branchName, streamUrl]);

  if (streamUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-900 shadow-inner bg-black">
        <video 
          src={streamUrl} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-red-500/20 border border-red-500/30 text-red-400 py-0.5 px-2 rounded text-[8px] font-black uppercase tracking-wider">
          LIVE FEED
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-900 shadow-inner bg-black">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
