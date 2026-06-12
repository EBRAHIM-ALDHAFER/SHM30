import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, Clock, Calendar, RefreshCw, BarChart2, Shield, 
  MapPin, Sliders, ShoppingCart, Plus, HelpCircle, Link as LinkIcon, 
  ChevronDown, ExternalLink, ShieldCheck, Database, Landmark, Layers
} from "lucide-react";
import BranchSelectorBar, { BranchItem } from "./executive/BranchSelectorBar";
import QuickActionsBar from "./executive/QuickActionsBar";

interface ExecutiveCommandHeaderProps {
  themeColors: any;
  activeSubTab: string;
  setActiveSubTab: (tab: 'dashboard' | 'omnichat' | 'assistant' | 'automation' | 'customer360' | 'marketplace') => void;
  
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
}

export default function ExecutiveCommandHeader({
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
  setActiveTab
}: ExecutiveCommandHeaderProps) {
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllBranches, setShowAllBranches] = useState(false);
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Auto-close when active values or active tabs/subtabs change
  useEffect(() => {
    setShowDropdown(false);
  }, [activeBranchId, activeStoreId, activeWarehouseId, activeSubTab]);

  // Global event listners to implement robust click-outside & Escape dismissal
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

  const { timeStr, ampm } = formatArabicTime(time);
  const gregorianDate = formatGregorianDate(time);
  const hijriDate = formatHijriDate(time);

  // Checks user switching permission constraints
  const hasSwitchPermission = () => {
    if (!user) return true;
    const role = user.role;
    return role === "مالك" || role === "مدير" || role === "مشرف";
  };

  // Handle active branch switching logic
  const handleBranchClick = (branch: any) => {
    if (!hasSwitchPermission()) {
      triggerNotification("⚠️ عذراً، لا تمتلك الصلاحية الإدارية [workspace:switch] لتغيير فرع التشغيل الميداني الحالي.", "warning");
      return;
    }

    // Switch branch in parent state
    setActiveBranchId(branch.id);
    
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
  };

  // Trigger rapid data re-fetch animation
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

  const currentBranchesToRender = branches.length > 0 ? branches.map((b, i) => {
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

  const visibleBranches = showAllBranches ? currentBranchesToRender : currentBranchesToRender.slice(0, 5);

  return (
    <div 
      dir="rtl"
      id="executive-command-header"
      className="w-full rounded-2xl border p-5 md:p-6 space-y-4.5 text-right select-none transition-all duration-300 relative overflow-hidden max-w-7xl mx-auto shadow-2xl flex flex-col justify-between"
      style={{ 
        background: "linear-gradient(135deg, #05060d 0%, #090b1c 65%, #020306 100%)",
        borderColor: "rgba(212, 175, 55, 0.35)", 
        boxShadow: "0 12px 36px -12px rgba(0, 0, 0, 0.95), inset 0 1px 2px rgba(212, 175, 55, 0.15)"
      }}
    >
      {/* Golden visual ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-20 bg-[#D4AF37]/5 rounded-full blur-[70px] pointer-events-none"></div>

      {/* THREE-COLUMN TRI-PARTITE GRID (Luxurious Proportions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* 1. RIGHT COLUMN: Sahm OS Premium Logo (يمين: شعار سهم والهوية البصرية) */}
        <div className="lg:col-span-3 flex flex-col items-center lg:items-start space-y-2 lg:border-l lg:border-zinc-800/40 lg:pl-5 text-center lg:text-right">
          <div 
            onClick={() => {
              setActiveSubTab('dashboard');
              triggerNotification("تم تنشيط لوحة كابينة المبيعات التنفيذية.", "info");
            }}
            className="flex items-center gap-3.5 group cursor-pointer select-none"
          >
            {/* Custom crafted golden logo medallion */}
            <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#F5D883] via-[#D4AF37] to-[#8E6F1B] rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.25)] border border-[#D4AF37]/30 transform transition-transform group-hover:scale-105 active:scale-95 duration-200 shrink-0">
              <div className="absolute inset-x-[1.5px] inset-y-[1.5px] bg-[#05060b] rounded-[10px] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(212,175,55,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8L6 21" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 14l3-3 3 3" />
                </svg>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-base md:text-lg font-black tracking-wider text-white flex items-center gap-1.5 group-hover:text-[#D4AF37] font-sans leading-none">
                <span>SAHM</span>
                <span className="text-[10px] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black px-1.5 py-0.5 rounded-md font-black font-mono">OS</span>
              </h1>
              <span className="text-[9.5px] text-zinc-400 font-bold block mt-1.5 font-sans leading-none uppercase tracking-wide">
                كفاءة ذكية. تسارع مستمر.
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-1.5 mt-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <span className="text-[8px] text-[#D4AF37] font-extrabold tracking-wider font-mono">WORKSPACE CORE v3.1 PRO</span>
          </div>
        </div>

        {/* 2. CENTER COLUMN: Header titles & Description (وسط: عنوان الكابينة + الوصف) */}
        <div className="lg:col-span-6 space-y-2 lg:px-2 text-center lg:text-right">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              مباشر وسحابي
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-mono font-black uppercase tracking-wider">
              EXECUTIVE COMMAND DOCK
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm md:text-base font-black text-white flex items-center justify-center lg:justify-start gap-1.5">
              <span>🚀</span>
              كابينة القيادة التنفيذية السحابية MTR
            </h2>
            <p className="text-[10.5px] md:text-[11px] text-zinc-400 leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
              المرصد السيادي المتكامل وقناة التحكم الموحدة لشركة سهم المتطورة. إدارة مرنة لقنوات فروع ومتاجر التجزئة بالمجموعة، والنبض المباشر للتقارير المالية المفلترة وحركة المستودعات المتزامنة فوريًا مع السحاب.
            </p>
          </div>
        </div>

        {/* 3. LEFT COLUMN: Clock Card (يسار: الساعة والتاريخ) */}
        <div className="lg:col-span-3 lg:border-r lg:border-zinc-800/40 lg:pr-5 flex flex-col justify-center">
          <div 
            className="rounded-xl border p-3 space-y-2 shadow-2xl relative overflow-hidden"
            style={{
              background: "rgba(3, 4, 8, 0.85)",
              borderColor: "rgba(212, 175, 55, 0.25)"
            }}
          >
            {/* Ambient gold glow on background */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5">
              <span className="text-[10px] text-gray-300 font-extrabold flex items-center gap-1 leading-none uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                الوقت والتاريخ اللحظي
              </span>
              <span className="inline-flex items-center gap-1 text-[8.5px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-black animate-pulse font-sans">
                <span className="w-1 h-1 rounded-full bg-red-500"></span>
                حي
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="text-2xl md:text-3xl font-black font-mono text-white tracking-widest bg-zinc-950/90 px-3 py-1 rounded-lg border border-zinc-900 leading-none text-center shadow-inner flex-1 select-all font-semibold">
                {timeStr}
              </div>
              <div className="bg-gradient-to-br from-[#E2C974] to-[#B08F26] text-slate-950 font-black px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-center min-w-[28px] h-9 leading-none shadow-md shrink-0">
                <span>{ampm}</span>
              </div>
            </div>

            <div className="space-y-1 text-right font-sans text-[10px] md:text-[10.5px] leading-none pt-0.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-400 font-semibold">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  الميلادي
                </span>
                <span className="text-[#D4AF37] font-black font-mono text-[11px]">{gregorianDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-400 font-semibold">
                  <span>🌙</span>
                  الهجري
                </span>
                <span className="text-teal-400 font-black font-mono text-[11px]">{hijriDate}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 1) BranchSelectorBar */}
      <BranchSelectorBar
        branches={(showAllBranches ? currentBranchesToRender : currentBranchesToRender.slice(0, 5)).map((b) => ({
          id: b.id,
          name: b.name,
          city: b.city,
          storeName: b.desc,
          isActive: activeBranchId === b.id,
          status: ((b.id === "branch_riyadh_main" || b.id === "br_jeddah_int" || b.id === "br_sahm_tech" || b.isActive) ? "active" : "inactive") as "active" | "inactive"
        }))}
        currentBranchId={activeBranchId}
        onSelectBranch={(branchId) => {
          const matched = currentBranchesToRender.find(b => b.id === branchId);
          if (matched) {
            handleBranchClick(matched);
          }
        }}
        onShowAllBranches={() => {
          setShowAllBranches(!showAllBranches);
          triggerNotification(
            !showAllBranches 
              ? "تم عرض كافة الفروع الإمدادية النشطة." 
              : "تم تصغير قائمة الفروع المتاحة.", 
            "info"
          );
        }}
        showAllState={showAllBranches}
      />

      {unlinkedBranch && (
        <div className="p-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-right flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-black text-amber-400 flex items-center gap-1">
              <span>⚠️</span>
              فرع [{unlinkedBranch.name}] غير مربوط بمستودع للتوريد!
            </h5>
            <p className="text-[8.5px] text-gray-400 leading-none">
              لا يمكنك إجراء مبيعات فورية أو جرد بضاعة بدون مستودع إمدادي مربوط بـ ERP سهم.
            </p>
          </div>
          
          <button
            onClick={() => {
              setActiveTab("setup_organizations");
              triggerNotification("تم تحويلك إلى مسار التأسيس والمنشآت لإتمام ربط الفرع والمستودع.", "info");
            }}
            className="p-1 px-2 bg-amber-500 hover:bg-amber-400 text-black border-none text-[8.5px] font-black rounded cursor-pointer transition-all flex items-center gap-1 self-end sm:self-auto"
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>ربط وتأسيس القنوات 🔗</span>
          </button>
        </div>
      )}

      {/* 2) QuickActionsBar */}
      <QuickActionsBar
        onOpenPOS={() => {
          window.dispatchEvent(new Event("sahm_enter_pos_fullscreen"));
          const currentActiveName = currentBranchesToRender.find(b => b.id === activeBranchId)?.name || "الفرع النشط";
          triggerNotification(`تم تشغيل واجهة نقطة بيع الكاشير لـ [${currentActiveName}] ملء الشاشة.`, "success");
        }}
        onOpenInventory={() => {
          localStorage.setItem("products_active_segment", "inventory_branches");
          setActiveTab("products");
          window.dispatchEvent(new Event("products_tab_change"));
          triggerNotification("تم الانتقال إلى المنتجات والمخزون > المخزون وإدارة المستودعات والفروع.", "info");
        }}
        onOpenReports={() => {
          setActiveTab("reports");
          const currentActiveName = currentBranchesToRender.find(b => b.id === activeBranchId)?.name || "كافة الفروع";
          triggerNotification(`تم تحميل غرفة التحليلات والتقارير المالية المفلترة لفرع [${currentActiveName}] بنجاح.`, "info");
        }}
        onSwitchBranch={handleToggleBranchDropdown}
        onSyncData={handleRefreshData}
        canOpenPOS={!user || !user.permissions || user.permissions.includes("pos:access") || ["مالك", "مدير", "كاشير", "مشرف"].includes(user?.role)}
        canManageInventory={!user || !user.permissions || user.permissions.includes("inventory:manage") || ["مالك", "مدير", "مشرف", "موظف مخزون"].includes(user?.role)}
        canViewReports={!user || !user.permissions || user.permissions.includes("reports:view") || ["مالك", "مدير"].includes(user?.role)}
      />

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-12 left-2.5 w-60 rounded-lg border border-[#D4AF37]/35 bg-[#0e111d] p-1.5 shadow-2xl z-[999]"
          >
            <h5 className="text-[8.5px] text-gray-400 font-extrabold px-1.5 pb-1 border-b border-zinc-800 mb-1.5">
              اختر أحد الفروع المتاحة في المجموعة:
            </h5>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {currentBranchesToRender.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    handleBranchClick(b);
                    setShowDropdown(false);
                  }}
                  className="w-full text-right p-1.5 rounded hover:bg-zinc-900 flex items-center justify-between text-gray-200 hover:text-white border-none bg-transparent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{b.icon || "🏬"}</span>
                    <div>
                      <span className="font-extrabold block text-white text-[10px] leading-none mb-0.5">{b.name}</span>
                      <span className="text-[7.5px] text-gray-450 block font-normal leading-none">{b.city}</span>
                    </div>
                  </div>
                  {activeBranchId === b.id && (
                    <span className="text-[7.5px] bg-[#D4AF37]/20 text-[#D4AF37] px-1 py-0.2 rounded font-black font-mono">نشط</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
