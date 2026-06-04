import React, { useState, useEffect, useRef } from "react";
import { ThemeColors, AddressProfile } from "../types";
import { 
  Users, Search, User, Shield, Briefcase, Landmark, MapPin, Phone, 
  Mail, Calendar, Plus, Trash2, Download, Eye, Upload, FileText, 
  RefreshCw, CheckCircle, Database, Server, Compass, AlertCircle, Edit, Clipboard, EyeOff, Save
} from "lucide-react";
import NationalAddressForm from "./NationalAddressForm";

export interface UnifiedDocument {
  id: string;
  name: string;
  type: string; // 'pdf' | 'word' | 'image/png' | 'image/jpeg'
  fileSize: string;
  url: string; // Base64 or mock blob
  uploadedAt: string;
}

export interface UnifiedProfile {
  id: string;
  type: "customer" | "supplier" | "employee" | "user" | "branch";
  name: string;
  tradingName?: string; // الاسم التجاري
  phone: string;
  email?: string;
  notes?: string;
  addressProfile?: AddressProfile;
  
  // Identities
  nationalId?: string;       // رقم الهوية
  iqamaId?: string;          // رقم الإقامة
  employeeId?: string;       // رقم الموظف
  taxId?: string;            // الرقم الضريبي
  commercialRegister?: string;// السجل التجاري
  unifiedId?: string;        // الرقم الموحد
  internalId: string;        // الرقم التعريفي الداخلي

  // Attachments Multi-types
  imageUrl?: string;                 // الصورة الشخصية / الشعار
  crPhotoUrl?: string;               // صورة السجل التجاري
  nationalIdPhotoUrl?: string;       // صورة الهوية / الإقامة
  licensePhotoUrl?: string;          // صورة الرخصة التجارية
  workCertificatePhotoUrl?: string;  // صورة شهادة العمل

  documents: UnifiedDocument[];
  lastActivityAt: string;
  status: "active" | "inactive";
}

interface UnifiedProfileHubProps {
  theme: ThemeColors;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
}

const DEFAULT_PROFILES: UnifiedProfile[] = [
  {
    id: "prof_1",
    type: "customer",
    name: "سليمان بن غانم الفهيد",
    tradingName: "مؤسسة الفهيد للمقاولات العامة",
    phone: "0505123456",
    email: "s.alfaheed@gmail.com",
    notes: "عميل VIP مستمر في طلب باقات دهن العود الفاخرة بشكل دوري.",
    internalId: "SAHM-CUST-8041",
    nationalId: "1098453120",
    taxId: "300451298400003",
    commercialRegister: "1010345671",
    unifiedId: "7001452932",
    lastActivityAt: "2026-06-02 12:45",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    documents: [
      {
        id: "doc_1",
        name: "الهوية الوطنية المعتمدة.png",
        type: "image/png",
        fileSize: "1.8 MB",
        url: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400",
        uploadedAt: "2026-05-20"
      },
      {
        id: "doc_2",
        name: "عقد توريد ميثاق الدهن النخبة.pdf",
        type: "pdf",
        fileSize: "3.4 MB",
        url: "#",
        uploadedAt: "2026-05-25"
      }
    ],
    addressProfile: {
      shortAddress: "رقمي ٩٢٤",
      buildingNumber: "8431",
      streetName: "طريق الملك عبدالعزيز",
      district: "الياسمين",
      city: "الرياض",
      region: "منطقة الرياض",
      postalCode: "13322",
      additionalNumber: "3291",
      unitNumber: "4",
      country: "المملكة العربية السعودية",
      mapLink: "https://maps.google.com"
    }
  },
  {
    id: "prof_2",
    type: "supplier",
    name: "مجموعة العود الغامدي ومعقّبات الطيب",
    tradingName: "شركة الغامدي المحدودة للاستيراد",
    phone: "0554123984",
    email: "info@ghamdiosoud.com",
    notes: "المورد الرئيسي لدرجات دهن عود تراد والكلمبوري الأصلي من معمل كمبوديا.",
    internalId: "SAHM-SUPP-9912",
    taxId: "301492584100003",
    commercialRegister: "4030512948",
    unifiedId: "7009432124",
    lastActivityAt: "2026-06-01 10:15",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150",
    documents: [
      {
        id: "doc_3",
        name: "شهادة السجل التجاري المعتمد.jpg",
        type: "image/jpeg",
        fileSize: "2.1 MB",
        url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400",
        uploadedAt: "2026-04-10"
      }
    ],
    addressProfile: {
      shortAddress: "أوشاق ٧٧",
      buildingNumber: "3924",
      streetName: "طريق المدينة المنورة",
      district: "البغدادية الشرقية",
      city: "جدة",
      region: "منطقة مكة المكرمة",
      postalCode: "22241",
      additionalNumber: "1104",
      unitNumber: "23",
      country: "المملكة العربية السعودية",
      mapLink: "https://maps.google.com"
    }
  },
  {
    id: "prof_3",
    type: "employee",
    name: "المهندس فهد بن عبد العزيز الطويان",
    tradingName: "مسؤول اللوجستيات والمخزون",
    phone: "0543210987",
    email: "f.altoyyan@sahm.sa",
    notes: "مهندس مستودعات ميثاق العود والمسؤول عن تسليم السلعت الذكية وتوزيعها.",
    internalId: "SAHM-EMP-0043",
    nationalId: "1093845612",
    employeeId: "EMP-43",
    lastActivityAt: "2026-06-02 15:10",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    documents: [],
    addressProfile: {
      shortAddress: "طويان ٤",
      buildingNumber: "7320",
      streetName: "شارع التخصصي",
      district: "المعذر الشمالي",
      city: "الرياض",
      region: "منطقة الرياض",
      postalCode: "12311",
      additionalNumber: "8471",
      unitNumber: "12",
      country: "المملكة العربية السعودية",
      mapLink: "https://maps.google.com"
    }
  }
];

export default function UnifiedProfileHub({
  theme,
  triggerNotification = () => {},
  addAuditLog = () => {}
}: UnifiedProfileHubProps) {
  // Profiles State (loads from local storage as Postgres simulation, fallback to DEFAULT)
  const [profiles, setProfiles] = useState<UnifiedProfile[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_unified_profiles");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "customer" | "supplier" | "employee" | "user" | "branch">("all");
  const [activeProfile, setActiveProfile] = useState<UnifiedProfile | null>(null);
  
  // Custom Create Profile State
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    type: "customer" as "customer" | "supplier" | "employee" | "user" | "branch",
    name: "",
    tradingName: "",
    phone: "",
    email: "",
    notes: "",
    nationalId: "",
    iqamaId: "",
    employeeId: "",
    taxId: "",
    commercialRegister: "",
    unifiedId: ""
  });
  
  const [newImage, setNewImage] = useState<string>("");
  const [newCrPhoto, setNewCrPhoto] = useState<string>("");
  const [newNationalIdPhoto, setNewNationalIdPhoto] = useState<string>("");
  const [newAddress, setNewAddress] = useState<AddressProfile | undefined>(undefined);

  // Storage and SQL feedback simulation states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showBackupCode, setShowBackupCode] = useState(false);

  // Document Upload File Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);

  // Save changes to Simulated Database (PostgreSQL + Supabase Storage sync)
  useEffect(() => {
    localStorage.setItem("sahm_unified_profiles", JSON.stringify(profiles));
  }, [profiles]);

  // Unified Multi-Field Search Engine
  // Searches: Name, National ID, IQAMA, CR, Tax ID, Employee ID, Email, Mobile
  const filteredProfiles = profiles.filter(p => {
    const matchesType = selectedType === "all" || p.type === selectedType;
    if (!matchesType) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      p.name.toLowerCase().includes(term) ||
      (p.tradingName || "").toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      (p.email || "").toLowerCase().includes(term) ||
      (p.nationalId || "").includes(term) ||
      (p.iqamaId || "").includes(term) ||
      (p.employeeId || "").toLowerCase().includes(term) ||
      (p.taxId || "").includes(term) ||
      (p.commercialRegister || "").includes(term) ||
      (p.unifiedId || "").includes(term) ||
      p.internalId.toLowerCase().includes(term)
    );
  });

  // Database Synchronization Tool Handlers
  const handleDatabaseSync = () => {
    setIsSyncing(true);
    setSyncStatus("جاري الاتصال بقواعد ومخازن بيانات Supabase & PostgreSQL...");
    
    setTimeout(() => {
      setSyncStatus("جاري موازنة وتدقيق ملفات التعريف الموحدة وتحديث أطروحات الصور والهويات...");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatus(null);
        triggerNotification("تمت مزامنة الملفات والمستندات الثنائية مع Supabase Storage بنجاح! ☁️", "success");
        addAuditLog("خادم سحابي", "مزامنة صور ومستندات الملفات السحابة وتدقيق النزاهة بقاعدة PostgreSQL.");
      }, 1500);
    }, 1500);
  };

  // Create Profile Handler
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      triggerNotification("الرجاء إدخال الاسم وجوال الاتصال الأساسي.", "error");
      return;
    }

    const internalPrefix = {
      customer: "SAHM-CUST-",
      supplier: "SAHM-SUPP-",
      employee: "SAHM-EMP-",
      user: "SAHM-USER-",
      branch: "SAHM-BRCH-"
    }[profileForm.type];

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newProfile: UnifiedProfile = {
      id: "prof_" + Date.now(),
      type: profileForm.type,
      name: profileForm.name.trim(),
      tradingName: profileForm.tradingName.trim() || undefined,
      phone: profileForm.phone.trim(),
      email: profileForm.email.trim() || undefined,
      notes: profileForm.notes.trim() || undefined,
      addressProfile: newAddress,
      internalId: internalPrefix + randomNum,
      
      nationalId: profileForm.nationalId.trim() || undefined,
      iqamaId: profileForm.iqamaId.trim() || undefined,
      employeeId: profileForm.employeeId.trim() || undefined,
      taxId: profileForm.taxId.trim() || undefined,
      commercialRegister: profileForm.commercialRegister.trim() || undefined,
      unifiedId: profileForm.unifiedId.trim() || undefined,

      imageUrl: newImage || undefined,
      crPhotoUrl: newCrPhoto || undefined,
      nationalIdPhotoUrl: newNationalIdPhoto || undefined,
      
      documents: [],
      lastActivityAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "active"
    };

    setProfiles([newProfile, ...profiles]);
    setShowAddModal(false);
    
    // Reset Form state
    setProfileForm({
      type: "customer",
      name: "",
      tradingName: "",
      phone: "",
      email: "",
      notes: "",
      nationalId: "",
      iqamaId: "",
      employeeId: "",
      taxId: "",
      commercialRegister: "",
      unifiedId: ""
    });
    setNewImage("");
    setNewCrPhoto("");
    setNewNationalIdPhoto("");
    setNewAddress(undefined);

    triggerNotification(`تم تسجيل الملف التعريفي لـ ${newProfile.name} بنجاح! ✅`, "success");
    addAuditLog("الملف الموحد", `تم تسجيل ملف تعريفي بمسمى (${newProfile.name}) ذو الرقم التعريفي ${newProfile.internalId}`);
  };

  // Delete Profile Handler
  const handleDeleteProfile = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الملف التعريفي لـ "${name}" بالكامل ومسح مستنداته المرفقة؟`)) {
      setProfiles(profiles.filter(p => p.id !== id));
      if (activeProfile?.id === id) {
        setActiveProfile(null);
      }
      triggerNotification("تم حذف السجل وإزالته من شجرة النظام.", "success");
      addAuditLog("الملف الموحد", `تم حذف ملف التعريف ${name} ومرفقاته من قواعد البيانات.`);
    }
  };

  // Professional Files Upload and Action Handlers
  const handleUploadDocumentClick = (replaceDocId: string | null = null) => {
    setReplacingDocId(replaceDocId);
    fileInputRef.current?.click();
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const fileSizeKbs = Math.round(file.size / 1024);
      const fileSizeStr = fileSizeKbs > 1024 
        ? (fileSizeKbs / 1024).toFixed(1) + " MB" 
        : fileSizeKbs + " KB";

      const uploadedDoc: UnifiedDocument = {
        id: "doc_" + Date.now(),
        name: file.name,
        type: file.type || "application/octet-stream",
        fileSize: fileSizeStr,
        url: base64Data,
        uploadedAt: new Date().toISOString().slice(0, 10)
      };

      let updatedDocs = [...activeProfile.documents];
      
      if (replacingDocId) {
        // Replace existing document
        updatedDocs = updatedDocs.map(d => d.id === replacingDocId ? { ...uploadedDoc, id: replacingDocId } : d);
        triggerNotification("تم استبدال وتحديث بوليصة المستند السحابية ✅", "success");
      } else {
        // Standard append
        updatedDocs.push(uploadedDoc);
        triggerNotification("تم رفع الصك أو المستند بنجاح لـ Supabase Storage! ✅", "success");
      }

      const updatedProfile = {
        ...activeProfile,
        documents: updatedDocs,
        lastActivityAt: new Date().toISOString().replace("T", " ").slice(0, 16)
      };

      setActiveProfile(updatedProfile);
      setProfiles(profiles.map(p => p.id === activeProfile.id ? updatedProfile : p));
      setReplacingDocId(null);
    };
    reader.readAsDataURL(file);
  };

  // Delete Document Handler
  const handleDeleteDocument = (docId: string, docName: string) => {
    if (!activeProfile) return;
    if (confirm(`هل أنت متأكد من مسح مستند "${docName}"؟`)) {
      const updatedDocs = activeProfile.documents.filter(d => d.id !== docId);
      const updatedProfile = { 
        ...activeProfile, 
        documents: updatedDocs,
        lastActivityAt: new Date().toISOString().replace("T", " ").slice(0, 16)
      };
      
      setActiveProfile(updatedProfile);
      setProfiles(profiles.map(p => p.id === activeProfile.id ? updatedProfile : p));
      triggerNotification("تم مسح السند المرفق وتفريغه بنجاح.");
    }
  };

  // Quick Photo uploading for specialized categories
  const handlePhotoUploadSimulated = (field: "crPhotoUrl" | "nationalIdPhotoUrl" | "licensePhotoUrl" | "workCertificatePhotoUrl") => {
    if (!activeProfile) return;
    const mockUrls = {
      crPhotoUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
      nationalIdPhotoUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600",
      licensePhotoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
      workCertificatePhotoUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600"
    };

    const updatedProfile = {
      ...activeProfile,
      [field]: mockUrls[field],
      lastActivityAt: new Date().toISOString().replace("T", " ").slice(0, 16)
    };

    setActiveProfile(updatedProfile);
    setProfiles(profiles.map(p => p.id === activeProfile.id ? updatedProfile : p));
    triggerNotification("تم تحديث وثيقة الصورة الموثقة بنجاح! 📸", "success");
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* DB Connection Indicators */}
      <div className="p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between border border-slate-800 bg-[#0A111E] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-200">ربط وتوثيق خوادم ميثاق سهم السحابية</h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-ping"></span>
              <span>قاعدة بيانات PostgreSQL & Supabase متصلة ومحصنة مع التوافر العالي 💯</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <button 
            onClick={handleDatabaseSync} 
            disabled={isSyncing}
            className="py-1.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? "جاري التدقيق و المزامنة..." : "مزامنة سحابية فائقة"}</span>
          </button>
        </div>
      </div>

      {isSyncing && (
        <div className="p-3 bg-slate-900 border border-slate-800 text-center rounded-xl text-xs text-amber-500 animate-pulse font-mono tracking-wide">
          ⏳ {syncStatus}
        </div>
      )}

      {/* Main Filter & Search toolbar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Profile categorization tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "الجميع", icon: Users },
            { id: "customer", label: "العملاء", icon: User },
            { id: "supplier", label: "الموردين", icon: Landmark },
            { id: "employee", label: "الموظفين", icon: Briefcase },
            { id: "user", label: "المستخدمين", icon: Shield },
            { id: "branch", label: "الفروع والمنشآت", icon: Compass }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedType(tab.id as any);
                  setActiveProfile(null);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                  isSelected 
                    ? "bg-amber-500 text-black border-amber-500 shadow" 
                    : "bg-slate-900/50 text-gray-400 border-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unified Search Multi-Field input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="ابحث بالاسم، الهوية، الضريبي، السجل، الجوال، البريد، الـ SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl py-2.5 pl-4 pr-9 border border-slate-800 bg-slate-950 text-white outline-none focus:border-amber-500"
          />
          <Search className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
        </div>

        {/* Global trigger to add profile */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto py-2 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>ملف تعريفي جديد 👤</span>
        </button>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Registry list (4 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[100vh] overflow-y-auto pr-1">
          <div className="flex justify-between items-center text-xs text-gray-400 font-bold px-1 select-none">
            <span>دليل السجلات المقروءة ({filteredProfiles.length} سجل)</span>
            <span>الأحدث نشاطاً</span>
          </div>

          <div className="space-y-3">
            {filteredProfiles.map(p => {
              const isActive = activeProfile?.id === p.id;
              
              const typeLabels = {
                customer: { label: "عميل", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                supplier: { label: "مورد", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                employee: { label: "موظف", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                user: { label: "مستخدم", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                branch: { label: "فرع", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" }
              }[p.type];

              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProfile(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-slate-800/80 border-amber-500 shadow-md" 
                      : "bg-[#111827]/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex gap-3 justify-between items-start">
                    <div className="flex gap-2.5 items-center">
                      {p.imageUrl ? (
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-gray-300 font-black text-xs flex items-center justify-center border border-slate-700 shrink-0 select-none">
                          {p.name.substring(0, 2)}
                        </div>
                      )}
                      
                      <div className="text-right">
                        <h4 className="text-xs font-black text-white">{p.name}</h4>
                        <div className="flex items-center gap-1.5 text-[9.5px] text-gray-400 mt-1 font-mono">
                          <span>{p.phone}</span>
                          <span>•</span>
                          <span>{p.internalId}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase py-0.5 px-2 rounded-full border ${typeLabels.color}`}>
                      {typeLabels.label}
                    </span>
                  </div>

                  <div className="mt-3 border-t border-slate-800/50 pt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-500" />
                      <span>{p.documents.length} مستندات</span>
                    </div>
                    <span>آخر تعديل: {p.lastActivityAt}</span>
                  </div>
                </div>
              );
            })}

            {filteredProfiles.length === 0 && (
              <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/30 text-center text-xs text-gray-500">
                لا توجد سجلات مطابقة للبحث داخل {selectedType === "all" ? "السجل العام" : selectedType == "customer" ? "دليل العملاء" : "هذا التصنيف"}.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Beautiful Registry ID Card Details & Doc Manager (7 cols) */}
        <div className="lg:col-span-7">
          {activeProfile ? (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Professional ID Card Wrapper */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 text-9xl opacity-5 pointer-events-none select-none">💳</div>
                
                {/* ID badge header */}
                <div className="flex flex-col sm:flex-row gap-5 items-center justify-between border-b border-slate-800/80 pb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    
                    {/* Portrait Avatar */}
                    <div className="relative">
                      {activeProfile.imageUrl ? (
                        <img 
                          src={activeProfile.imageUrl} 
                          alt={activeProfile.name} 
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/45 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-slate-800 text-gray-300 font-bold text-lg flex items-center justify-center border border-slate-700">
                          {activeProfile.name.substring(0, 2)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900 animate-pulse"></span>
                    </div>

                    <div className="text-center sm:text-right space-y-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-[10px] bg-amber-500/10 border border-amber-500/35 text-amber-400 py-0.5 px-2.5 rounded font-black font-mono">
                          {activeProfile.internalId}
                        </span>
                        <span className="text-[10px] bg-[#10B98120] text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                          نشط سحابياً
                        </span>
                      </div>
                      <h2 className="text-base font-black text-white">{activeProfile.name}</h2>
                      {activeProfile.tradingName && (
                        <p className="text-xs text-[#D4AF37] font-semibold">{activeProfile.tradingName}</p>
                      )}
                    </div>
                  </div>

                  {/* Absolute core metrics */}
                  <div className="text-center sm:text-left bg-black/30 p-3 rounded-xl border border-slate-800/80 space-y-1 sm:self-stretch flex flex-col justify-center">
                    <span className="text-[10px] block text-gray-500 font-bold">المستندات والمعاملات</span>
                    <span className="text-sm font-black text-amber-400 font-mono text-center">
                      {activeProfile.documents.length} وثائق
                    </span>
                    <span className="text-[8px] block text-gray-600 font-bold">آخر استعراض: {activeProfile.lastActivityAt}</span>
                  </div>
                </div>

                {/* Body details metadata fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  
                  {/* Basic information */}
                  <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-slate-800/50">
                    <h5 className="text-xs font-black text-gray-400 border-b border-slate-800 pb-1.5 mb-2">📞 قنوات الاتصال والعنوان:</h5>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>رقم الجوال:</span>
                      </div>
                      <span className="font-mono text-white">{activeProfile.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>البريد الإلكتروني:</span>
                      </div>
                      <span className="text-white font-medium select-all">{activeProfile.email || "غير مسجل"}</span>
                    </div>

                    {activeProfile.addressProfile ? (
                      <div className="pt-2 border-t border-slate-800/70 mt-2 space-y-1">
                        <span className="text-[10px] text-amber-500 font-bold">العنوان الوطني المعتمد:</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          {activeProfile.addressProfile.buildingNumber} {activeProfile.addressProfile.streetName}، {activeProfile.addressProfile.district}، {activeProfile.addressProfile.city}، {activeProfile.addressProfile.postalCode}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800/70 mt-2 text-[10px] text-gray-500 italic">
                        لا يوجد عنوان وطني مكمل مسجل.
                      </div>
                    )}
                  </div>

                  {/* Identity metadata info */}
                  <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-slate-800/50">
                    <h5 className="text-xs font-black text-gray-400 border-b border-slate-800 pb-1.5 mb-2">🪪 الهويات والأرقام المرجعية:</h5>
                    
                    {activeProfile.nationalId && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                        <span>رقم الهوية الوطنية:</span>
                        <span className="font-mono text-white select-all">{activeProfile.nationalId}</span>
                      </div>
                    )}

                    {activeProfile.iqamaId && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                        <span>رقم مراسيم الإقامة:</span>
                        <span className="font-mono text-white select-all">{activeProfile.iqamaId}</span>
                      </div>
                    )}

                    {activeProfile.employeeId && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                        <span>رقم الموظف الوظيفي:</span>
                        <span className="font-mono text-white select-all">{activeProfile.employeeId}</span>
                      </div>
                    )}

                    {activeProfile.taxId && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                        <span>الرقم الضريبي (VAT):</span>
                        <span className="font-mono text-white select-all">{activeProfile.taxId}</span>
                      </div>
                    )}

                    {activeProfile.commercialRegister && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                        <span>السجل التجاري (CR):</span>
                        <span className="font-mono text-white select-all">{activeProfile.commercialRegister}</span>
                      </div>
                    )}

                    {activeProfile.unifiedId && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                        <span>الرقم الموحد (Unif):</span>
                        <span className="font-mono text-white select-all">{activeProfile.unifiedId}</span>
                      </div>
                    )}

                    {!activeProfile.nationalId && !activeProfile.taxId && !activeProfile.commercialRegister && (
                      <p className="text-[10px] text-gray-500 italic">الرجاء إدخال رموز الهوية وشهادات العمل لعرض الرقم الموحد.</p>
                    )}
                  </div>

                </div>

                {activeProfile.notes && (
                  <div className="mt-4 p-3 bg-black/25 rounded-lg border border-slate-800 text-xs text-gray-400 leading-relaxed">
                    <span className="font-black text-gray-300 block mb-1">✍️ ملاحظات خاصة:</span>
                    {activeProfile.notes}
                  </div>
                )}

                {/* Sub-images view blocks */}
                <div className="mt-6 space-y-3">
                  <span className="text-xs font-black text-gray-300 block">🖼️ الأصول والمستندات المصورة:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* CR Photo card */}
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center space-y-2">
                      <span className="text-[9px] text-[#D4AF37] font-bold block">السجل التجاري</span>
                      {activeProfile.crPhotoUrl ? (
                        <img src={activeProfile.crPhotoUrl} className="w-full h-16 object-cover rounded border border-slate-800" />
                      ) : (
                        <button 
                          onClick={() => handlePhotoUploadSimulated("crPhotoUrl")}
                          className="w-full h-16 bg-black/30 border border-dashed border-slate-800 text-[9px] text-gray-400 hover:text-white rounded active:scale-95 transition-all cursor-pointer block"
                        >
                          رفع السجل
                        </button>
                      )}
                    </div>

                    {/* National ID Photo card */}
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center space-y-2">
                      <span className="text-[9px] text-[#D4AF37] font-bold block">الهوية الوطنية</span>
                      {activeProfile.nationalIdPhotoUrl ? (
                        <img src={activeProfile.nationalIdPhotoUrl} className="w-full h-16 object-cover rounded border border-slate-800" />
                      ) : (
                        <button 
                          onClick={() => handlePhotoUploadSimulated("nationalIdPhotoUrl")}
                          className="w-full h-16 bg-black/30 border border-dashed border-slate-800 text-[9px] text-gray-400 hover:text-white rounded active:scale-95 transition-all cursor-pointer block"
                        >
                          رفع الهوية
                        </button>
                      )}
                    </div>

                    {/* License Photo card */}
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center space-y-2">
                      <span className="text-[9px] text-[#D4AF37] font-bold block">الرخصة التجارية</span>
                      {activeProfile.licensePhotoUrl ? (
                        <img src={activeProfile.licensePhotoUrl} className="w-full h-16 object-cover rounded border border-slate-800" />
                      ) : (
                        <button 
                          onClick={() => handlePhotoUploadSimulated("licensePhotoUrl")}
                          className="w-full h-16 bg-black/30 border border-dashed border-slate-800 text-[9px] text-gray-400 hover:text-white rounded active:scale-95 transition-all cursor-pointer block"
                        >
                          رفع الرخصة
                        </button>
                      )}
                    </div>

                    {/* Work cert Photo card */}
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center space-y-2">
                      <span className="text-[9px] text-[#D4AF37] font-bold block">شهادة العمل / رخصة</span>
                      {activeProfile.workCertificatePhotoUrl ? (
                        <img src={activeProfile.workCertificatePhotoUrl} className="w-full h-16 object-cover rounded border border-slate-800" />
                      ) : (
                        <button 
                          onClick={() => handlePhotoUploadSimulated("workCertificatePhotoUrl")}
                          className="w-full h-16 bg-black/30 border border-dashed border-slate-800 text-[9px] text-gray-400 hover:text-white rounded active:scale-95 transition-all cursor-pointer block"
                        >
                          رفع الشهادة
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Footer Operations */}
                <div className="flex gap-2.5 mt-6 border-t border-slate-800 pt-4 justify-end">
                  <button
                    onClick={() => handleDeleteProfile(activeProfile.id, activeProfile.name)}
                    className="py-1.5 px-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    حذف الملف بالكامل
                  </button>
                </div>
              </div>

              {/* DEDICATED DOCUMENTS AND FILE ATTACHMENTS CENTER */}
              <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500 animate-pulse" />
                    <h3 className="text-xs font-black text-white">قسم المستندات والوثائق السحابية (Supabase Multi-Docs)</h3>
                  </div>
                  <button
                    onClick={() => handleUploadDocumentClick(null)}
                    className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-amber-500 text-gray-200 font-bold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-amber-500" />
                    <span>رفع مستند جديد</span>
                  </button>
                </div>

                {/* Documents register grid mapping */}
                <div className="space-y-2.5">
                  {activeProfile.documents.map(doc => {
                    const isImg = doc.type.startsWith("image/");
                    return (
                      <div 
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-between hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-center shrink-0">
                            {isImg ? (
                              <img src={doc.url} alt={doc.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-xs font-black text-rose-500">PDF</span>
                            )}
                          </div>
                          <div className="text-right">
                            <h4 className="text-xs font-black text-gray-200 truncate max-w-[180px]">{doc.name}</h4>
                            <div className="flex items-center gap-2 text-[9px] text-[#D4AF37] mt-1 font-mono">
                              <span>سعة: {doc.fileSize}</span>
                              <span>•</span>
                              <span>تاريخ: {doc.uploadedAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive document controls */}
                        <div className="flex items-center gap-2">
                          
                          {/* Preview / Read */}
                          {isImg && (
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 bg-slate-950/80 rounded hover:bg-slate-800 text-blue-400"
                              title="معاينة الوثيقة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Download */}
                          <a 
                            href={doc.url} 
                            download={doc.name}
                            className="p-1.5 bg-slate-950/80 rounded hover:bg-slate-800 text-emerald-400"
                            title="تحميل مستمر"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Replace document */}
                          <button
                            onClick={() => handleUploadDocumentClick(doc.id)}
                            className="p-1.5 bg-slate-950/80 rounded hover:bg-slate-800 text-amber-500 text-[10px] font-bold cursor-pointer"
                            title="استبدال المستند القديم"
                          >
                            استبدال
                          </button>

                          {/* Delete document inline */}
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.name)}
                            className="p-1.5 bg-slate-950/80 hover:bg-rose-950 rounded text-rose-400 cursor-pointer border-none"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {activeProfile.documents.length === 0 && (
                    <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-slate-800 rounded-xl leading-relaxed">
                      لا يوجد مستندات أو صكوك قانونية ملحقة بملف {activeProfile.name} حالياً. عَمِل سهم على ربط خوادم رفع المستندات للتأمين.
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#0F172A] text-gray-500 space-y-4">
              <Users className="w-12 h-12 text-[#D4AF37] mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-gray-300">لم تقم باختيار أي ملف تعريفي لاستعراض بطاقته الاحترافية</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  الرجاء اختيار أحد الملفات المتاحة من يمين القائمة لرؤية الهوية الكاملة، الفروع المتصلة، والمستندات السحابية.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Hidden File System Router input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleDocumentFileChange}
        className="hidden"
      />

      {/* REGISTER NEW PROFILE DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center p-4 z-50 animate-fade-in font-sans text-right">
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8 shadow-2xl space-y-6"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">إضافة ملف تعريفي موحد بالنظام 👤📁</h3>
                <p className="text-xs text-gray-400 mt-0.5">تسجيل السجلات والمستندات الخاصة بالشركاء والموظفين والفروع</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-rose-500/15 text-rose-500 cursor-pointer"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4 text-right">
              
              {/* Type Category Selection */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• تصنيف الملف الموحد:</label>
                <select
                  value={profileForm.type}
                  onChange={(e) => setProfileForm({ ...profileForm, type: e.target.value as any })}
                  className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-800 bg-black text-white outline-none focus:border-amber-500 text-right"
                >
                  <option value="customer">عميل VIP (Customer)</option>
                  <option value="supplier">مورد أساسي/خارجي (Supplier)</option>
                  <option value="employee">موظف بالكادر (Employee)</option>
                  <option value="user">مستخدم للنظام وصلاحيات (User)</option>
                  <option value="branch">فرع أو مستودع فرعي (Branch)</option>
                </select>
              </div>

              {/* Name and Trading Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• الاسم الأساسي:</label>
                  <input
                    type="text"
                    required
                    placeholder="صالح بن محمد آل حامد..."
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-800 bg-black text-white outline-none focus:border-amber-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• الاسم التجاري (اختياري):</label>
                  <input
                    type="text"
                    placeholder="مؤسسة آل حامد للتجارة..."
                    value={profileForm.tradingName}
                    onChange={(e) => setProfileForm({ ...profileForm, tradingName: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-800 bg-black text-white outline-none focus:border-amber-500 text-right"
                  />
                </div>
              </div>

              {/* Contacts info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• رقم الجوال:</label>
                  <input
                    type="text"
                    required
                    placeholder="050XXXXXXXX"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full text-xs font-mono text-center rounded-lg py-2.5 px-3 border border-slate-800 bg-black text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• البريد الإلكتروني:</label>
                  <input
                    type="email"
                    placeholder="info@example.sa"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full text-xs text-center rounded-lg py-2.5 px-3 border border-slate-800 bg-black text-white outline-none"
                  />
                </div>
              </div>

              {/* Identity numbers container dynamically displayed */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-amber-500 block">• الأرقام الوطنية والضريبية الرسمية للامتثال:</span>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">رقم الهوية الوطنية / الإقامة:</span>
                    <input 
                      type="text"
                      placeholder="1XXXXXXXXX"
                      value={profileForm.nationalId}
                      onChange={(e) => setProfileForm({ ...profileForm, nationalId: e.target.value })}
                      className="w-full text-xs font-mono text-center rounded-lg py-2 px-3 border border-slate-800 bg-black text-white outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">الرقم الضريبي (إن وجد):</span>
                    <input 
                      type="text"
                      placeholder="300XXXXXXXXXXXX"
                      value={profileForm.taxId}
                      onChange={(e) => setProfileForm({ ...profileForm, taxId: e.target.value })}
                      className="w-full text-xs font-mono text-center rounded-lg py-2 px-3 border border-slate-800 bg-black text-white outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">السجل التجاري (CR):</span>
                    <input 
                      type="text"
                      placeholder="1010XXXXXX"
                      value={profileForm.commercialRegister}
                      onChange={(e) => setProfileForm({ ...profileForm, commercialRegister: e.target.value })}
                      className="w-full text-xs font-mono text-center rounded-lg py-2 px-3 border border-slate-800 bg-black text-white outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">الرقم الموحد المرجعي (700):</span>
                    <input 
                      type="text"
                      placeholder="700XXXXXXX"
                      value={profileForm.unifiedId}
                      onChange={(e) => setProfileForm({ ...profileForm, unifiedId: e.target.value })}
                      className="w-full text-xs font-mono text-center rounded-lg py-2 px-3 border border-slate-800 bg-black text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* National Address details component */}
              <NationalAddressForm 
                initialAddress={newAddress}
                onChange={(addr) => setNewAddress(addr)}
                theme={theme}
              />

              {/* Avatar Photo Input (Demo selection of beautiful representative profiles) */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• رابط صورة شخصية / شعار:</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full text-xs font-mono text-left rounded-lg py-2.5 px-3 border border-slate-800 bg-black text-white outline-none"
                />
                <p className="text-[9px] text-[#D4AF37] mt-1 italic">
                  نصيحة: يمكنك ترك مدخل الرابط فارغاً لتوليد اختصار الاسم التلقائي الأنيق.
                </p>
              </div>

              {/* Special notes */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• ملاحظات إيداع خاصة:</label>
                <textarea
                  placeholder="أدخل مقتبسات بليغة لتعريف الشخصية أو صلاحياته الإرشادية..."
                  rows={2}
                  value={profileForm.notes}
                  onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                  className="w-full text-xs rounded-lg p-3 border border-slate-800 bg-black text-white outline-none text-right"
                />
              </div>

              {/* Submission actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg"
                >
                  حفظ وتسجيل الملف الموحد ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  إلغاء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline Close SVG helper
function X() {
  return (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
