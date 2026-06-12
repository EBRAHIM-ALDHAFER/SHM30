import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, Clock, Calendar, RefreshCw, BarChart2, Shield, 
  MapPin, Sliders, ShoppingCart, Plus, HelpCircle, Link as LinkIcon, 
  ChevronDown, ExternalLink, ShieldCheck, Database, Landmark, Layers, 
  Bot, Sparkles, AlertTriangle, BookOpen, ChevronUp
} from "lucide-react";
import BranchSelectorBar, { BranchItem } from "./executive/BranchSelectorBar";
import QuickActionsBar from "./executive/QuickActionsBar";
import { CustomIconRenderer, getActiveIconValue } from "../lib/customIcons";

interface ExecutiveHeroCardProps {
  themeColors: any;
  activeSubTab: string;
  setActiveSubTab: (tab: 'overview' | 'analytics' | 'assistant' | 'recommendations' | 'alerts' | 'operations') => void;
  
  // Real databases & status synced properties
  stores: any[];
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  
  branches: any[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  
  warehouses: any[];
  activeWarehouseId: string;
  setActiveWarehouseId: (id: string) => void;
  
  user: any;
  triggerNotification: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  setActiveTab: (tab: string) => void;
  displayMode?: 'compact' | 'expanded';
  rawCompanies?: any[];
  impersonatedTenantId?: string | null;
  onImpersonate?: (tenantId: string, orgId: string, companyName: string) => void;
  onStopImpersonating?: () => void;
}

export default function ExecutiveHeroCard({
  themeColors,
  activeSubTab,
  setActiveSubTab,
  stores = [],
  activeStoreId = "store_1",
  setActiveStoreId,
  branches = [],
  activeBranchId = "",
  setActiveBranchId,
  warehouses = [],
  activeWarehouseId = "",
  setActiveWarehouseId,
  user,
  triggerNotification,
  setActiveTab,
  displayMode = "expanded",
  rawCompanies = [],
  impersonatedTenantId = null,
  onImpersonate = () => {},
  onStopImpersonating = () => {}
}: ExecutiveHeroCardProps) {
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Resolve active company from localStorage
  const activeCompany = (() => {
    try {
      const savedCompanies = localStorage.getItem("sahm_web_companies");
      const list = savedCompanies ? JSON.parse(savedCompanies) : [];
      const savedUser = localStorage.getItem("sahm_web_user");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      const impersonateOrgId = localStorage.getItem("sahm_impersonate_org_id");
      const isPlatformOwner = currentUser && ["platform_owner", "system_owner", "system_admin"].includes(currentUser.role || "");
      const targetCompanyId = isPlatformOwner ? impersonateOrgId : (currentUser?.organization_id || currentUser?.company_id || "");
      const currentTenantId = currentUser?.tenant_id || currentUser?.tenantId || "";
      
      return list.find((c: any) => c.id === targetCompanyId) || 
             list.find((c: any) => (c.tenant_id || c.tenantId) === currentTenantId) || 
             list[0] || null;
    } catch {
      return null;
    }
  })();

  // Auto-close dropdown when active values or active tabs/subtabs change
  useEffect(() => {
    setShowDropdown(false);
  }, [activeBranchId, activeStoreId, activeWarehouseId, activeSubTab]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    const handleActiveDropdown = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail && ev.detail.id !== "branch_selector") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("active_dropdown_changed", handleActiveDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("active_dropdown_changed", handleActiveDropdown);
    };
  }, []);

  const handleToggleBranchDropdown = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowDropdown(prev => {
      const next = !prev;
      if (next) {
        window.dispatchEvent(new CustomEvent("active_dropdown_changed", { detail: { id: "branch_selector" } }));
      }
      return next;
    });
  };

  // Keep track of any unlinked branch simulation dialog state
  const [unlinkedBranch, setUnlinkedBranch] = useState<any | null>(null);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time in Arabic Style: "09:41:27 ص"
  const formatArabicTime = (date: Date) => {
    try {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? 'م' : 'ص';
      const displayHours = hours % 12 || 12;
      
      const pad = (n: number) => String(n).padStart(2, '0');
      
      return {
        timeStr: `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}`,
        ampm
      };
    } catch {
      return { timeStr: "09:41:27", ampm: "ص" };
    }
  };

  // Gregorian Date Formatting (Month in digits only: 2026/06/04)
  const formatGregorianDate = (date: Date) => {
    try {
      const formatted = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
      return formatted.replace(/-/g, "/");
    } catch {
      return "2026/06/04";
    }
  };

  // Hijri Date Formatting (Month in digits only with latn standard numerals: 1447/12/18 هـ)
  const formatHijriDate = (date: Date) => {
    try {
      const p = new Intl.DateTimeFormat("en-US-u-ca-islamic-nu-latn", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).formatToParts(date);
      const year = p.find(x => x.type === "year")?.value || "1447";
      const month = String(p.find(x => x.type === "month")?.value || "12").padStart(2, "0");
      const day = String(p.find(x => x.type === "day")?.value || "18").padStart(2, "0");
      return `${year}/${month}/${day} هـ`;
    } catch (e) {
      return "1447/12/18 هـ";
    }
  };

  const getArabicDayName = (date: Date) => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[date.getDay()];
  };

  const formatGregorianAr = (date: Date) => {
    try {
      const day = date.getDate();
      const year = date.getFullYear();
      const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      const month = monthNames[date.getMonth()];
      return `${day} ${month} ${year}`;
    } catch {
      return "27 مايو 2025";
    }
  };

  const formatHijriAr = (date: Date) => {
    try {
      const p = new Intl.DateTimeFormat("en-US-u-ca-islamic-nu-latn", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).formatToParts(date);
      const year = p.find(x => x.type === "year")?.value || "1447";
      const monthIdx = parseInt(p.find(x => x.type === "month")?.value || "12") - 1;
      const day = p.find(x => x.type === "day")?.value || "18";
      
      const hijriMonths = [
        "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
      ];
      const monthName = hijriMonths[monthIdx] || "ذو الحجة";
      return `${day} ${monthName} ${year} هـ`;
    } catch {
      return "29 ذو القعدة 1446 هـ";
    }
  };

  const { timeStr, ampm } = formatArabicTime(time);
  const gregorianDate = formatGregorianDate(time);
  const hijriDate = formatHijriDate(time);
  const arabicDayName = getArabicDayName(time);

  // Checks user switching permission constraints
  const hasSwitchPermission = () => {
    if (!user) return true;
    const role = user.role;
    return role === "tenant_owner" || role === "مالك" || role === "مدير" || role === "مشرف";
  };

  const [showDirectLogoModal, setShowDirectLogoModal] = useState(false);
  const [logoInputText, setLogoInputText] = useState("");
  const [logoFileBase64, setLogoFileBase64] = useState("");

  const triggerDirectLogoChange = () => {
    setShowDirectLogoModal(true);
    const currVal = localStorage.getItem("sahm_custom_icons_config") 
      ? JSON.parse(localStorage.getItem("sahm_custom_icons_config")!)["sahm_brand_logo"] || ""
      : "";
    setLogoInputText(currVal);
  };

  const handleSaveDirectLogo = () => {
    const valToSave = logoFileBase64 || logoInputText.trim();
    if (!valToSave) {
      // Restore default
      const conf = localStorage.getItem("sahm_custom_icons_config") ? JSON.parse(localStorage.getItem("sahm_custom_icons_config")!) : {};
      delete conf["sahm_brand_logo"];
      localStorage.setItem("sahm_custom_icons_config", JSON.stringify(conf));
      window.dispatchEvent(new CustomEvent("sahm_icons_updated", { detail: { moduleId: "sahm_brand_logo", iconValue: null } }));
    } else {
      const conf = localStorage.getItem("sahm_custom_icons_config") ? JSON.parse(localStorage.getItem("sahm_custom_icons_config")!) : {};
      conf["sahm_brand_logo"] = valToSave;
      localStorage.setItem("sahm_custom_icons_config", JSON.stringify(conf));
      window.dispatchEvent(new CustomEvent("sahm_icons_updated", { detail: { moduleId: "sahm_brand_logo", iconValue: valToSave } }));
    }
    setShowDirectLogoModal(false);
    setLogoFileBase64("");
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle active branch switching logic
  const handleBranchClick = (branch: any) => {
    if (!hasSwitchPermission()) {
      triggerNotification("⚠️ عذراً، لا تمتلك الصلاحية الإدارية [workspace:switch] لتغيير فرع التشغيل الميداني الحالي.", "warning");
      return;
    }

    // Switch branch in parent state
    setActiveBranchId(branch.id);

    // Call the workspace service to sync the entire workspace environments
    if ((window as any).workspaceService && typeof (window as any).workspaceService.setCurrentBranch === "function") {
      (window as any).workspaceService.setCurrentBranch(branch.id);
    }
    
    // Auto sync store context if branch has specific store link
    if (branch.storeId && branch.storeId !== activeStoreId) {
      setActiveStoreId(branch.storeId);
    }

    // Check warehouse association
    if (branch.associatedWh || branch.id === "branch_riyadh_main" || branch.id === "br_sahm_tech") {
      const whId = branch.associatedWh || "warehouse_1";
      setActiveWarehouseId(whId);
      
      const whName = warehouses.find(w => w.id === whId)?.name || "مستودع الرياض الرئيسي";
      triggerNotification(`✓ تم تحويل بيئة العمل إلى [${branch.name}] ومزامنة التوريد التلقائي لـ [${whName}] بنجاح.`, "success");
      setUnlinkedBranch(null);
    } else {
      triggerNotification(`⚠️ تنبيه: [${branch.name}] غير مربوط بمستودع إمدادي لتغذية المبيعات والمنتجات!`, "warning");
      setUnlinkedBranch(branch);
    }

    // Under branch changes, we also refresh/reload calculations
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Trigger data refresh simulation spinner
  const handleRefreshData = () => {
    setIsRefreshing(true);
    triggerNotification("🔄 جاري الاتصال بخوادم Sahm OS الفورية والمزامنة الثنائية مع السحاب...", "info");
    
    setTimeout(() => {
      setIsRefreshing(false);
      triggerNotification("⚡ تم تحديث ومزامنة مؤشرات كابينة القيادة، نقاط البيع، وحركة التوريد اللحظية بنجاح!", "success");
    }, 1200);
  };

  const mockDesignBranches = [
    { id: "branch_riyadh_main", name: "سهم الرياض", desc: "الرياض - الفرع الرئيسي", icon: "🇸🇦", city: "الرياض", storeId: "store_1", associatedWh: "warehouse_1" },
    { id: "br_jeddah_int", name: "سهم جدة", desc: "جدة - فرع التحلية", icon: "🌴", city: "جدة", storeId: "store_2", associatedWh: "wh_jeddah_sub" },
    { id: "br_dammam", name: "سهم دبي", desc: "دبي - فرع العزيزية", icon: "🏙️", city: "دبي", storeId: "store_3", associatedWh: "" },
    { id: "br_sahm_tech", name: "سهم تك", desc: "الرياض - فرع العليا", icon: "⚙️", city: "الرياض", storeId: "store_1", associatedWh: "warehouse_1" },
    { id: "br_sahm_life", name: "سهم لايف", desc: "جدة - فرع السلامة", icon: "🌸", city: "جدة", storeId: "store_2", associatedWh: "" }
  ];

  const currentBranchesToRender = branches.length > 0 ? branches.map((b) => {
    const matchedMock = mockDesignBranches.find(m => b.id === m.id || b.name.includes(m.city) || m.id.includes(b.id));
    return {
      id: b.id,
      name: b.name,
      city: b.city || matchedMock?.city || "الرياض",
      desc: b.address || matchedMock?.desc || "فرع معتمد",
      associatedWh: b.associatedWh,
      storeId: b.storeId || "store_1",
      icon: matchedMock?.icon || "🏬",
      isActive: b.status === "نشط" || b.isActive
    };
  }) : mockDesignBranches;

  const activeBranchObject = currentBranchesToRender.find(b => b.id === activeBranchId) || currentBranchesToRender[0];
  const activeBranchName = activeBranchObject?.name || "شامل الفروع";

  const isPlatformOwner = user?.role === "platform_owner";
  const activeImpersonatedCompany = rawCompanies.find(c => (c.tenant_id || c.tenantId) === impersonatedTenantId);
  const activeCompanyName = activeImpersonatedCompany?.name || activeCompany?.name || "سهم OS";
  const activeContextName = isPlatformOwner ? activeCompanyName : activeBranchName;

  const getBranchIcon = (branchId: string) => {
    switch (branchId) {
      case "branch_riyadh_main":
        return <Building className="w-4 h-4 text-[#D4AF37]" />;
      case "br_jeddah_int":
        return <Landmark className="w-4 h-4 text-[#D4AF37]" />;
      case "br_dammam":
        return <Layers className="w-4 h-4 text-[#D4AF37]" />;
      case "br_sahm_tech":
        return <Sliders className="w-4 h-4 text-[#D4AF37]" />;
      case "br_sahm_life":
        return <Sparkles className="w-4 h-4 text-[#D4AF37]" />;
      default:
        return <Building className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <div 
      dir="rtl"
      id="executive-hero-card"
      className="w-full rounded-3xl border text-right select-none transition-all duration-300 relative overflow-hidden max-w-7xl mx-auto shadow-2xl p-6 flex flex-col gap-4"
      style={{ 
        background: "radial-gradient(circle at 70% 30%, #0e1222 0%, #05060d 100%)",
        borderColor: "rgba(212, 175, 55, 0.35)", 
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(212, 175, 55, 0.15)"
      }}
    >
      {/* Golden Visual Ambient Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-20 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* MAIN LAYOUT GRID: Left (Time & Date), Center (Content & Branches), Right (Logo) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* 1. LEFT COLUMN: Digital Clock and Calendar Card */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-full">
          <motion.div 
            whileHover={{ y: -4, boxShadow: "0 15px 35px rgba(212, 175, 55, 0.08), 0 0 1px rgba(212, 175, 55, 0.25)" }}
            className="rounded-2xl border p-4 bg-[#080b16]/90 border-zinc-800/80 shadow-lg flex flex-col gap-4.5 w-full text-right relative overflow-hidden transition-all duration-300"
          >
            {/* Header: الوقت والتاريخ */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="text-[10.5px] text-zinc-300 font-extrabold flex items-center gap-1.5 leading-none">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                الوقت والتاريخ
              </span>
            </div>

            {/* Live Clock */}
            <div className="flex items-center justify-between py-1">
              <span className="text-2xl font-black font-mono text-[#D4AF37] tracking-wider drop-shadow-[0_0_10px_rgba(212,175,55,0.25)]">
                {timeStr}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#D4AF37] font-black">{ampm}</span>
                <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full bg-zinc-800/60" />

            {/* Gregorian Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-zinc-400 font-bold">التاريخ الميلادي</span>
              <span className="font-sans text-white font-extrabold">{formatGregorianAr(time)}</span>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full bg-zinc-800/60" />

            {/* Hijri Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-zinc-400 font-bold">التاريخ الهجري</span>
              <span className="font-sans text-white font-extrabold">{formatHijriAr(time)}</span>
            </div>
          </motion.div>
        </div>

        {/* 2. CENTER COLUMN: Cockpit details, active branch toggle, and branch buttons */}
        <div className="lg:col-span-6 flex flex-col justify-center text-right space-y-4 font-sans">
          {/* Top Badges: Executive Cockpit & Live indicator */}
          <div className="flex items-center justify-start gap-2.5">
            <span className="text-[8.5px] text-[#D4AF37] px-2 py-0.5 rounded-md border border-[#D4AF37]/40 bg-[#D4AF37]/5 font-black uppercase tracking-wider">
              EXECUTIVE COCKPIT
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9.5px] text-[#10B981] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              مباشر وآمن •
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 drop-shadow-sm leading-tight">
            <span>🚀</span>
            كابينة القيادة التنفيذية Sahm OS
          </h2>

          {/* Narrative description */}
          <p className="text-[11px] md:text-[11.5px] text-zinc-400 leading-relaxed max-w-xl">
            النبض المركزي الذكي للمتجر وشركته. تساعدك هذه اللوحة الذكية على توجيه قراراتك بثقة، وزيادة الكفاءة، وتعزيز نمو أعمالك في الوقت الفعلي.
          </p>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-900/60">
            <span className="text-[9px] text-zinc-500 font-bold ml-1.5">أوامر التشغيل:</span>
            
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 12px rgba(245, 158, 11, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.dispatchEvent(new Event("sahm_enter_pos_fullscreen"));
                triggerNotification(`تم تشغيل واجهة كاشير POS لـ [${activeContextName}] ملء الشاشة.`, "success");
              }}
              className="flex items-center gap-1 py-1 px-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black border-none text-[9.5px] font-black rounded-lg cursor-pointer transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-black" />
              <span>الكاشير POS</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 10px rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.setItem("products_active_segment", "inventory_branches");
                setActiveTab("products");
                window.dispatchEvent(new Event("products_tab_change"));
                triggerNotification("تم الانتقال إلى إدارة المخزون.", "info");
              }}
              className="flex items-center gap-1 py-1 px-2.5 bg-[#0c0f1d] hover:bg-zinc-900 text-white border border-zinc-800 rounded-lg text-[9.5px] font-black cursor-pointer transition-all"
            >
              <Database className="w-3.5 h-3.5 text-zinc-450" />
              <span>المخزون</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 10px rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab("reports");
                triggerNotification(`تم تحميل التقارير المالية لـ [${activeContextName}].`, "info");
              }}
              className="flex items-center gap-1 py-1 px-2.5 bg-[#0c0f1d] hover:bg-zinc-900 text-white border border-zinc-800 rounded-lg text-[9.5px] font-black cursor-pointer transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5 text-zinc-450" />
              <span>التقارير</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 18, boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefreshData}
              className="flex items-center justify-center p-1.5 bg-[#0c0f1d] hover:bg-zinc-900 text-white border border-zinc-800 rounded-lg cursor-pointer transition-all"
              title="مزامنة وتحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? "animate-spin" : ""}`} />
            </motion.button>
          </div>

          {/* Branches list section */}
          <div className="space-y-2 pt-2">
            <span className="text-[10.5px] text-amber-400 font-extrabold flex items-center justify-between gap-1.5 leading-none w-full">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                {isPlatformOwner ? "المنشآت والعملاء النشطين 🏢" : "فروع وشركات المجموعة"}
              </span>
              {isPlatformOwner && impersonatedTenantId && (
                <button
                  onClick={onStopImpersonating}
                  className="py-1 px-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[9px] rounded-lg border-none cursor-pointer transition shadow-md active:scale-95 flex items-center gap-1.5 animate-pulse"
                  title="إنهاء المراقبة والعودة كمالك نظام ↺"
                >
                  <span>إنهاء المراقبة والعودة كمالك نظام ↺</span>
                </button>
              )}
            </span>

            {/* Horizontal Flex Grid for branch/company items */}
            <div className="flex flex-wrap items-center gap-2 w-full max-w-full">
              {isPlatformOwner ? (
                rawCompanies.map((c) => {
                  const isActive = impersonatedTenantId === (c.tenant_id || c.tenantId);
                  return (
                    <motion.button
                      key={c.id}
                      whileHover={{ 
                        scale: 1.04, 
                        boxShadow: isActive 
                          ? "0 0 15px rgba(212, 175, 55, 0.35), inset 0 0 8px rgba(212, 175, 55, 0.2)" 
                          : "0 0 12px rgba(255, 255, 255, 0.08)" 
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onImpersonate(c.tenant_id || c.tenantId, c.id, c.name)}
                      className="flex items-center gap-2 p-2 rounded-xl text-right cursor-pointer transition-all duration-300 min-w-[105px] flex-1 max-w-[160px] relative overflow-hidden"
                      style={{
                        backgroundColor: isActive ? "rgba(212, 175, 55, 0.08)" : "#0c0f1d",
                        border: `1px solid ${isActive ? "#D4AF37" : "rgba(255,255,255,0.05)"}`,
                        boxShadow: isActive ? "0 0 12px rgba(212, 175, 55, 0.15), inset 0 0 4px rgba(212, 175, 55, 0.1)" : "none"
                      }}
                    >
                      {isActive && (
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping m-1" />
                      )}
                      <div className="flex items-center justify-center p-1.5 bg-black/45 rounded-lg shrink-0 border border-zinc-800/40">
                        {c.logoUrl ? (
                          <img src={c.logoUrl} alt={c.name} className="w-4 h-4 rounded object-cover" />
                        ) : (
                          <Building className="w-4 h-4 text-[#D4AF37]" />
                        )}
                      </div>
                      <div className="leading-tight">
                        <span className="font-extrabold block text-white text-[9.5px]">{c.name}</span>
                        <span className="text-[8px] text-zinc-450 block font-normal mt-0.5">{c.companyLegalName || "المنشأة"}</span>
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                currentBranchesToRender.map((b) => {
                  const isActive = activeBranchId === b.id;
                  return (
                    <motion.button
                      key={b.id}
                      whileHover={{ 
                        scale: 1.04, 
                        boxShadow: isActive 
                          ? "0 0 15px rgba(212, 175, 55, 0.35), inset 0 0 8px rgba(212, 175, 55, 0.2)" 
                          : "0 0 12px rgba(255, 255, 255, 0.08)" 
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleBranchClick(b)}
                      className="flex items-center gap-2 p-2 rounded-xl text-right cursor-pointer transition-all duration-300 min-w-[105px] flex-1 max-w-[160px] relative overflow-hidden"
                      style={{
                        backgroundColor: isActive ? "rgba(212, 175, 55, 0.08)" : "#0c0f1d",
                        border: `1px solid ${isActive ? "#D4AF37" : "rgba(255,255,255,0.05)"}`,
                        boxShadow: isActive ? "0 0 12px rgba(212, 175, 55, 0.15), inset 0 0 4px rgba(212, 175, 55, 0.1)" : "none"
                      }}
                    >
                      {isActive && (
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping m-1" />
                      )}
                      <div className="flex items-center justify-center p-1.5 bg-black/45 rounded-lg shrink-0 border border-zinc-800/40">
                        {getBranchIcon(b.id)}
                      </div>
                      <div className="leading-tight">
                        <span className="font-extrabold block text-white text-[9.5px]">{b.name}</span>
                        <span className="text-[8px] text-zinc-450 block font-normal mt-0.5">{b.city}</span>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: Hexagonal Company Logo and Subtitle */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-full lg:border-r lg:border-zinc-800/30 lg:pr-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            {/* Hexagonal Company Logo */}
            <div 
              onClick={triggerDirectLogoChange}
              title="انقر هنا لتخصيص الشعار 📷"
              className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
            >
              {(() => {
                const companyLogo = activeCompany?.logoUrl;
                const logoVal = companyLogo || getActiveIconValue("sahm_brand_logo");
                const isCustomImg = logoVal && (logoVal.startsWith("http") || logoVal.startsWith("data:") || logoVal.startsWith("/"));
                
                if (isCustomImg) {
                  return (
                    <div className="w-16 h-16 bg-[#05060b] rounded-2xl border-2 border-[#D4AF37] overflow-hidden p-0 shadow-lg flex items-center justify-center">
                      <img src={logoVal} alt="Company Logo" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                    </div>
                  );
                }
                
                return (
                  <svg className="w-16 h-16 drop-shadow-[0_0_15px_rgba(212,175,55,0.35)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F5D883" />
                        <stop offset="50%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#8E6F1B" />
                      </linearGradient>
                      <linearGradient id="goldGradInner" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#F3E5AB" />
                        <stop offset="100%" stopColor="#D4AF37" />
                      </linearGradient>
                    </defs>
                    {/* Hexagon */}
                    <path d="M50 5 L89.0 27.5 L89.0 72.5 L50 95 L11.0 72.5 L11.0 27.5 Z" stroke="url(#goldGrad)" strokeWidth="6" strokeLinejoin="round" fill="#070a13" />
                    <path d="M50 12 L82.9 31 L82.9 69 L50 88 L17.1 69 L17.1 31 Z" stroke="url(#goldGradInner)" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.5" />
                    {/* Golden S */}
                    <path d="M62 35 C62 30 57 28 50 28 C42 28 38 31 38 35 C38 41 62 43 62 52 C62 60 55 64 50 64 C42 64 38 59 38 55" stroke="url(#goldGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="50" cy="50" r="1.5" fill="#D4AF37" />
                  </svg>
                );
              })()}
            </div>

            {/* Company Titles */}
            <div className="space-y-1 select-none w-full max-w-[200px] text-center">
              <h1 className="text-sm font-black text-white truncate px-1">
                {activeCompany?.name || "سهم OS"}
              </h1>
              <p className="text-[9px] text-[#D4AF37] font-extrabold truncate px-1">
                {activeCompany?.companyLegalName || "نظام ذكي. قرارات أثر."}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ONBOARDING MAP SECTION REMOVED */}

      {/* SYSTEM ALERT BANNER FOR UNLINKED WAREHOUSE */}
      {unlinkedBranch && (
        <div className="p-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-right flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-black text-amber-450 text-amber-400 flex items-center gap-1.5">
              <span className="text-xs">⚠️</span>
              فرع [{unlinkedBranch.name}] غير مربوط بمستودع للتوريد!
            </h5>
            <p className="text-[9px] text-zinc-400 leading-none">
              لا يمكنك تشغيل جلسة كاشير POS لبيع المنتجات أو إدارة المخزون المالي لصالحه دون مستودع مربوط بـ ERP سهم.
            </p>
          </div>
          
          <button
            onClick={() => {
              setActiveTab("setup_organizations");
              triggerNotification("تم تحويلك إلى مسار التأسيس والمنشآت لإتمام ربط الفرع والمستودع.", "info");
            }}
            className="p-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-black border-none text-[9px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1 self-end sm:self-auto"
          >
            <LinkIcon className="w-3 h-3 text-black" />
            <span>ربط وتأسيس القنوات 🔗</span>
          </button>
        </div>
      )}


      {/* SWITCH BRANCH RAPID FLOATING DROPDOWN */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-14 left-5 w-64 rounded-xl border border-[#D4AF37]/35 bg-[#0e111d] p-2 shadow-2xl z-[999]"
          >
            <h5 className="text-[9px] text-gray-400 font-extrabold px-1.5 pb-1 border-b border-zinc-800 mb-1.5 text-right">
              {isPlatformOwner ? "اختر أحد المنشآت النشطة للمراقبة:" : "اختر أحد الفروع المتاحة في المجموعة:"}
            </h5>
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {isPlatformOwner ? (
                rawCompanies.map((c) => {
                  const isActive = impersonatedTenantId === (c.tenant_id || c.tenantId);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onImpersonate(c.tenant_id || c.tenantId, c.id, c.name);
                        setShowDropdown(false);
                      }}
                      className="w-full text-right p-2 rounded hover:bg-zinc-900 flex items-center justify-between text-gray-200 hover:text-white border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        {c.logoUrl ? (
                          <img src={c.logoUrl} alt={c.name} className="w-4 h-4 rounded object-cover" />
                        ) : (
                          <span className="text-xs">🏢</span>
                        )}
                        <div>
                          <span className="font-extrabold block text-white text-[10px] leading-none mb-1">{c.name}</span>
                          <span className="text-[7.5px] text-zinc-450 block font-normal leading-none">{c.companyLegalName || "منشأة نشطة"}</span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-[7.5px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded font-black font-mono">نشط</span>
                      )}
                    </button>
                  );
                })
              ) : (
                currentBranchesToRender.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      handleBranchClick(b);
                      setShowDropdown(false);
                    }}
                    className="w-full text-right p-2 rounded hover:bg-zinc-900 flex items-center justify-between text-gray-200 hover:text-white border-none bg-transparent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{b.icon || "🏬"}</span>
                      <div>
                        <span className="font-extrabold block text-white text-[10px] leading-none mb-1">{b.name}</span>
                        <span className="text-[7.5px] text-zinc-400 block font-normal leading-none">{b.city}</span>
                      </div>
                    </div>
                    {activeBranchId === b.id && (
                      <span className="text-[7.5px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded font-black font-mono">نشط</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIRECT BRAND LOGO CUSTOMIZER MODAL */}
      <AnimatePresence>
        {showDirectLogoModal && (
          <div className="fixed inset-0 bg-black/90 p-4 flex items-center justify-center z-[1000] backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-md rounded-2xl border border-amber-500/35 bg-[#0e111d] p-5 text-right space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <button 
                  type="button"
                  onClick={() => setShowDirectLogoModal(false)}
                  className="text-gray-400 hover:text-white text-md border-0 bg-transparent cursor-pointer font-extrabold"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500/15 text-amber-500 rounded-lg text-xs leading-none">📷 Custom Logo</span>
                  <h3 className="text-sm font-black text-white">تخصيص شعار سهم الموحد</h3>
                </div>
              </div>

              <p className="text-[10px] text-gray-300 font-sans leading-relaxed">
                💡 <strong>حرية التعديل وبث الهوية الشخصية:</strong> يمكنك بسهولة تبديل شعار ورمز SAHM OS الموجود في الأعلى هُنا. اختر ملف صورة من جهازك، أو الصق كود SVG، أو ضع رابط صورة مباشر لتخصيص كابينة القيادة.
              </p>

              {/* Preset preview if available */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 flex flex-col items-center justify-center gap-2 block max-w-full">
                <span className="text-[8px] text-zinc-500 font-bold block">معاينة الشعار الجديد</span>
                <div className={`w-16 h-16 flex items-center justify-center bg-[#05060b] rounded-xl border border-amber-500/25 ${ (logoFileBase64 || (logoInputText && !logoInputText.trim().toLowerCase().startsWith("<svg"))) ? "p-0 overflow-hidden" : "p-2"}`}>
                  {logoFileBase64 || logoInputText ? (
                    <img 
                      src={logoFileBase64 || logoInputText} 
                      alt="Logo Preview" 
                      className={`w-full h-full ${ (logoFileBase64 || (logoInputText && !logoInputText.trim().toLowerCase().startsWith("<svg"))) ? "object-cover rounded-xl" : "object-contain"}`}
                      onError={(e) => {
                        // If img fails, maybe it's raw SVG
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <CustomIconRenderer moduleId="sahm_brand_logo" className="text-[#D4AF37] w-10 h-10 object-contain" />
                  )}
                  
                  {/* SVG raw rendering fallback if no image file */}
                  {(!logoFileBase64 && logoInputText && logoInputText.trim().toLowerCase().startsWith("<svg")) && (
                    <div 
                      className="w-10 h-10 flex items-center justify-center text-amber-400"
                      dangerouslySetInnerHTML={{ __html: logoInputText }}
                    />
                  )}
                </div>
              </div>

              {/* Option A: Direct Local File Uploder */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 font-black block font-sans">الخيار الأول: ارفع ملف صورة مخصص (PNG / JPEG / SVG):</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="w-full bg-zinc-950 text-gray-300 border border-zinc-900 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
                />
                {logoFileBase64 && (
                  <span className="text-[9px] text-emerald-400 font-bold block">✓ تم تحميل وقراءة ملف الصورة بنجاح.</span>
                )}
              </div>

              {/* Option B: Web URL / SVG String Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 font-black block font-sans">الخيار الثاني: أو ضع رابط صورة مباشر أو كود SVG خام:</label>
                <textarea
                  value={logoInputText}
                  onChange={(e) => {
                    setLogoInputText(e.target.value);
                    setLogoFileBase64(""); // wipe local file so URL/string overrides
                  }}
                  placeholder="مثال: https://mywebsite.com/logo.png أو كود <svg>..."
                  rows={2}
                  className="w-full bg-zinc-950 text-gray-200 border border-zinc-900 rounded-lg p-2 text-[10px] font-mono leading-tight tracking-wider text-left"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    // Clear / reset back to default
                    setLogoInputText("");
                    setLogoFileBase64("");
                    handleSaveDirectLogo();
                  }}
                  className="py-1 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 border border-red-500/15 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                >
                  استعادة الافتراضي ↺
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDirectLogoModal(false);
                      setLogoFileBase64("");
                    }}
                    className="py-1 px-3 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDirectLogo}
                    className="py-1 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-[10px] font-black rounded-lg cursor-pointer transform active:scale-95 transition-all animate-pulse"
                  >
                    حفظ وتطبيق الشعار هُنا ✓
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
