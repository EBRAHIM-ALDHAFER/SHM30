import React, { useState, useEffect } from "react";
import { 
  Building, Store, MapPin, Package, Cpu, Link, FileText, 
  CheckCircle2, Search, Plus, Trash2, Clock, Landmark, 
  Sliders, ShieldCheck, HelpCircle, ArrowLeftRight, Settings, Info, AlertTriangle
} from "lucide-react";
import FacilitySetup from "./FacilitySetup";
import StoreManager from "./StoreManager";
import OrganizationHub from "./OrganizationHub";
import { posService } from "../core/database/posService";

interface FacilityAndEstablishmentHubProps {
  themeColors: any;
  allowedStores: any[];
  setStores: (val: any[]) => void;
  branches: any[];
  setBranches: React.Dispatch<React.SetStateAction<any[]>>;
  warehouses: any[];
  setWarehouses: React.Dispatch<React.SetStateAction<any[]>>;
  posUnits: any[];
  setPosUnits: React.Dispatch<React.SetStateAction<any[]>>;
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  activeWarehouseId: string;
  setActiveWarehouseId: (id: string) => void;
  activePosId: string;
  setActivePosId: (id: string) => void;
  addAuditLog: (event: string, text: string) => void;
  triggerNotification: (msg: string, type?: any) => void;
  users: any[];
  rawCompanies?: any[];
  setRawCompanies?: (comps: any[]) => void;
  tenantId?: string;
}

export default function FacilityAndEstablishmentHub({
  themeColors,
  allowedStores,
  setStores,
  branches,
  setBranches,
  warehouses,
  setWarehouses,
  posUnits,
  setPosUnits,
  activeStoreId,
  setActiveStoreId,
  activeBranchId,
  setActiveBranchId,
  activeWarehouseId,
  setActiveWarehouseId,
  activePosId,
  setActivePosId,
  addAuditLog,
  triggerNotification,
  users,
  rawCompanies,
  setRawCompanies,
  tenantId
}: FacilityAndEstablishmentHubProps) {
  // Tabs of "التأسيس والمنشآت"
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");
  const [isPosOperating, setIsPosOperating] = useState<boolean>(false);
  const [posFilterStatus, setPosFilterStatus] = useState<"active" | "inactive_archived">("active");

  const activeCompanyId = (() => {
    try {
      const savedUser = localStorage.getItem("sahm_web_user");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      const impersonateOrgId = localStorage.getItem("sahm_impersonate_org_id");
      const isPlatformOwner = currentUser && ["platform_owner", "system_owner", "system_admin"].includes(currentUser.role || "");
      return isPlatformOwner ? impersonateOrgId : (currentUser?.organization_id || currentUser?.company_id || "");
    } catch {
      return "";
    }
  })();

  const displayedPos = posUnits.filter(pos => {
    // 1. tenant_id filter
    const tId = pos.tenantId || pos.tenant_id;
    const tenantFilterFailed = tenantId && tId && tId !== tenantId;

    // 2. company_id filter
    const cId = pos.companyId || pos.company_id;
    const companyFilterFailed = activeCompanyId && cId && cId !== activeCompanyId;

    // We do not filter the POS management list by the cashier's active branch/store
    const isMatched = !tenantFilterFailed && !companyFilterFailed;

    const isArchived = !!(pos.archived_at || pos.archivedAt);
    const isInactive = pos.is_active === false || pos.isActive === false || pos.status === "غير نشط" || pos.status === "inactive" || pos.status === "متوقف" || pos.status === "متوقفة";

    console.log(`[POS_FILTER_DEBUG] pos:${pos.name} id:${pos.id} tenantId:${tenantId} tId:${tId} activeCompanyId:${activeCompanyId} matches:${isMatched} isArchived:${isArchived} isInactive:${isInactive}`);

    if (posFilterStatus === "active") {
      return isMatched && !isArchived && !isInactive;
    } else {
      return isMatched && (isArchived || isInactive);
    }
  });

  const filteredUsers = users.filter(user => {
    const tId = user.tenantId || user.tenant_id;
    if (tenantId && tId && tId !== tenantId) return false;

    const cId = user.companyId || user.company_id || user.organization_id;
    if (activeCompanyId && cId && cId !== activeCompanyId) return false;

    return true;
  });

  // Local state for unified POS units management screen
  const [showAddPosModal, setShowAddPosModal] = useState(false);
  const [newPosName, setNewPosName] = useState("");
  const [newPosBranch, setNewPosBranch] = useState("");
  const [newPosWh, setNewPosWh] = useState("");
  const [newPosCashier, setNewPosCashier] = useState("");

  // Local state for editing POS
  const [showEditPosModal, setShowEditPosModal] = useState(false);
  const [editingPosId, setEditingPosId] = useState("");
  const [editPosName, setEditPosName] = useState("");
  const [editPosBranch, setEditPosBranch] = useState("");
  const [editPosWh, setEditPosWh] = useState("");
  const [editPosStore, setEditPosStore] = useState("");
  const [editPosCashier, setEditPosCashier] = useState("");
  const [editPosStatus, setEditPosStatus] = useState("نشط");

  const [newPosStore, setNewPosStore] = useState("");

  useEffect(() => {
    // Select default branch and warehouse for new POS creation
    if (branches.length > 0 && !newPosBranch) {
      setNewPosBranch(branches[0].id);
    }
    if (warehouses.length > 0 && !newPosWh) {
      setNewPosWh(warehouses[0].id);
    }
    if (allowedStores.length > 0 && !newPosStore) {
      setNewPosStore(allowedStores[0].id);
    }
  }, [branches, warehouses, allowedStores, newPosBranch, newPosWh, newPosStore]);

  const handleCreatePos = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[POS_CREATE_DEBUG] Entering handleCreatePos. Name:", newPosName, "Branch:", newPosBranch, "Warehouse:", newPosWh, "Store:", newPosStore);
    if (!newPosName.trim()) {
      triggerNotification("⚠️ يرجى تزويد اسم جهاز الكاشير لنقطة البيع الكاشيرية بوضوح", "warning");
      return;
    }
    if (!newPosBranch && !newPosWh && !newPosStore) {
      triggerNotification("⚠️ يجب ربط نقطة البيع بجهة واحدة على الأقل (فرع، مستودع، أو متجر)", "warning");
      return;
    }

    const selectedUser = filteredUsers.find(u => (u.name || u.fullName || u.email) === newPosCashier);
    const assignedUserId = selectedUser ? selectedUser.id : undefined;

    const newUnit: any = {
      id: `pos_${Date.now().toString().slice(-4)}`,
      name: newPosName.trim(),
      branchId: newPosBranch,
      branch_id: newPosBranch,
      defaultWh: newPosWh,
      warehouse_id: newPosWh,
      cashier: newPosCashier.trim() || "موظف كاشير معتمد",
      status: "نشط",
      is_active: true,
      isActive: true,
      assignedUserId: assignedUserId,
      assigned_user_id: assignedUserId,
      paymentMethods: ["cash", "card"],
      isDefault: newPosBranch ? posUnits.filter((p: any) => p.branchId === newPosBranch).length === 0 : false,
      storeId: newPosStore,
      store_id: newPosStore,
      companyId: activeCompanyId,
      company_id: activeCompanyId,
      tenantId: tenantId,
      tenant_id: tenantId
    };

    console.log("[POS_CREATE_DEBUG] newUnit payload:", newUnit);

    setIsPosOperating(true);
    try {
      console.log("[POS_CREATE_DEBUG] Calling posService.create...");
      await posService.create(newUnit);
      console.log("[POS_CREATE_DEBUG] posService.create succeeded!");
      addAuditLog("نقاط البيع", `تم تأسيس نقطة بيع POS جديدة باسم: ${newUnit.name}`);
      triggerNotification(`✓ تم إنشاء وتخصيص نقطة البيع [${newUnit.name}] بنجاح`, "success");
      
      const fresh = await posService.getAll();
      console.log("[POS_CREATE_DEBUG] fresh posUnits length:", fresh.length);
      await setPosUnits(fresh);
      
      // Select it as active POS and align active environment context
      setActivePosId(newUnit.id);
      localStorage.setItem("sahm_active_pos_id", newUnit.id);
      if (newPosBranch) {
        setActiveBranchId(newPosBranch);
        localStorage.setItem("sahm_active_branch_id", newPosBranch);
      }
      if (newPosWh) {
        setActiveWarehouseId(newPosWh);
        localStorage.setItem("sahm_active_warehouse_id", newPosWh);
      }
      if (newPosStore) {
        setActiveStoreId(newPosStore);
        localStorage.setItem("sahm_active_store_id", newPosStore);
      }

      // reset form
      setNewPosName("");
      setNewPosCashier("");
      setShowAddPosModal(false);
    } catch (err: any) {
      console.error("[POS_CREATE_DEBUG] Error in handleCreatePos:", err);
      triggerNotification(`⚠️ خطأ أثناء إنشاء نقطة البيع: ${err.message || err}`, "error");
    } finally {
      setIsPosOperating(false);
    }
  };

  const handleUpdatePos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPosName.trim()) {
      triggerNotification("⚠️ يرجى تزويد اسم جهاز الكاشير لنقطة البيع الكاشيرية بوضوح", "warning");
      return;
    }
    if (!editPosBranch && !editPosWh && !editPosStore) {
      triggerNotification("⚠️ يجب ربط نقطة البيع بجهة واحدة على الأقل (فرع، مستودع، أو متجر)", "warning");
      return;
    }

    const selectedUser = filteredUsers.find(u => (u.name || u.fullName || u.email) === editPosCashier);
    const assignedUserId = selectedUser ? selectedUser.id : undefined;

    const originalPos = posUnits.find(p => p.id === editingPosId) || {};

    const updatedUnit: any = {
      ...originalPos,
      name: editPosName.trim(),
      branchId: editPosBranch,
      branch_id: editPosBranch,
      defaultWh: editPosWh,
      warehouse_id: editPosWh,
      storeId: editPosStore,
      store_id: editPosStore,
      cashier: editPosCashier.trim() || "موظف كاشير معتمد",
      status: editPosStatus,
      is_active: editPosStatus === "نشط" || editPosStatus === "نشطة",
      isActive: editPosStatus === "نشط" || editPosStatus === "نشطة",
      assignedUserId: assignedUserId,
      assigned_user_id: assignedUserId,
      companyId: activeCompanyId,
      company_id: activeCompanyId,
      tenantId: tenantId,
      tenant_id: tenantId
    };

    setIsPosOperating(true);
    try {
      await posService.update(editingPosId, updatedUnit);
      addAuditLog("نقاط البيع", `تم تحديث بيانات جهاز نقطة البيع: ${editPosName}`);
      triggerNotification(`✓ تم تحديث بيانات نقطة البيع [${editPosName}] بنجاح`, "success");
      
      const fresh = await posService.getAll();
      await setPosUnits(fresh);
      
      setShowEditPosModal(false);
    } catch (err: any) {
      console.error("Error updating POS:", err);
      triggerNotification(`⚠️ خطأ أثناء تحديث نقطة البيع: ${err.message || err}`, "error");
    } finally {
      setIsPosOperating(false);
    }
  };

  const handleDeletePos = async (id: string, name: string) => {
    try {
      setIsPosOperating(true);
      const hasOperations = await posService.checkOperationalUsage(id);
      
      let confirmMsg = `هل أنت متأكد من رغبتك في حذف وإلغاء ترخيص نقطة البيع [${name}] نهائياً؟`;
      if (hasOperations) {
        confirmMsg = `تنبيه: نقطة البيع [${name}] تحتوي على عمليات مالية أو نوبات نشطة مرتبطة بها. سيتم إلغاء تنشيطها وأرصفتها تلقائياً بدلاً من حذفها نهائياً للحفاظ على سلامة الفواتير والتقارير. هل ترغب في الاستمرار؟`;
      }
      
      if (window.confirm(confirmMsg)) {
        await posService.delete(id);
        
        if (hasOperations) {
          addAuditLog("نقاط البيع", `تم تعطيل وأرشفة نقطة البيع بسبب وجود عمليات مرتبطة: ${name}`);
          triggerNotification(`✓ تم تعطيل وأرشفة نقطة البيع [${name}] بنجاح`, "success");
        } else {
          addAuditLog("نقاط البيع", `تم إلغاء ترخيص وحذف جهاز نقطة البيع نهائياً: ${name}`);
          triggerNotification(`✓ تم حذف وإلغاء ترخيص نقطة البيع [${name}] بنجاح`, "success");
        }
        
        const fresh = await posService.getAll();
        await setPosUnits(fresh);
      }
    } catch (err: any) {
      console.error("Error deleting POS:", err);
      triggerNotification(`⚠️ خطأ أثناء معالجة الحذف: ${err.message || err}`, "error");
    } finally {
      setIsPosOperating(false);
    }
  };

  const navFilters = [
    { id: "overview", label: "الهيكل التنظيمي", icon: Info, color: "text-blue-400" },
    { id: "branches", label: "الفروع والمواقع", icon: MapPin, color: "text-rose-400" },
    { id: "warehouses", label: "المستودعات", icon: Package, color: "text-amber-400" },
    { id: "stores", label: "المتاجر التابعة", icon: Store, color: "text-cyan-400" },
    { id: "pos", label: "نقاط البيع", icon: Cpu, color: "text-purple-400" },
    { id: "connections", label: "الربط والعلاقات", icon: Link, color: "text-sky-400" },
    { id: "docs", label: "الوثائق والسجلات", icon: FileText, color: "text-teal-400" }
  ];

  return (
    <div className="space-y-6 text-right font-sans select-none animate-fade-in">
      
      {/* Unified Executive Header & Control Container */}
      <div 
        className="p-6 rounded-3xl border relative overflow-hidden flex flex-col gap-6 transition-all shadow-2xl animate-fade-in-up"
        style={{ 
          backgroundColor: '#0b1329', 
          borderColor: 'rgba(212,175,55,0.25)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212,175,55,0.08)'
        }}
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        {/* Header content and Stats Row */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block">سهم OS • وحدة الربط والتحسين الهيكلي الهرمي</span>
            <h2 className="text-lg font-black text-white">التأسيس والمنشآت المعتمدة الموحدة</h2>
            <p className="text-[11px] text-gray-400 leading-normal max-w-2xl font-bold">
              هيكل إدارة قنوات البيع الإلكترونية والميدانية، المستودعات الغذائية واللوجستية، وثائق الاستحقاق الضريبي والربط مع هيئة الزكاة والضريبة والجمارك (ZATCA).
            </p>
          </div>
          
          <div className="bg-black/25 border border-zinc-800/60 p-3.5 px-5 rounded-2xl shrink-0 flex items-center gap-4 shadow-lg">
            <div className="text-right">
              <span className="text-[9px] text-gray-400 block font-bold">الفروع النشطة</span>
              <span className="text-sm font-black text-white">{branches.length} فرع</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-right">
              <span className="text-[9px] text-gray-400 block font-bold">المستودعات</span>
              <span className="text-sm font-black text-white">{warehouses.length} مخزن</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-right">
              <span className="text-[9px] text-gray-400 block font-bold">أجهزة الـ POS</span>
              <span className="text-sm font-black text-[#D4AF37]">{posUnits.length} كاشير</span>
            </div>
          </div>
        </div>

        {/* Gradient divider line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

        {/* Equal-Sized Premium Navigation Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2 w-full font-sans relative z-10" dir="rtl">
          {navFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeSubTab === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveSubTab(filter.id)}
                className={`group relative flex flex-col items-center justify-center h-16 p-1.5 rounded-xl border text-[10px] font-black transition-all duration-300 cursor-pointer active:scale-95 overflow-hidden ${
                  isActive 
                    ? "bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 border-none shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                    : "bg-[#0a0d18]/70 hover:bg-[#121626]/90 text-zinc-400 hover:text-zinc-100 hover:-translate-y-0.5"
                }`}
                style={{
                  borderColor: isActive ? 'transparent' : 'rgba(212,175,55,0.1)'
                }}
              >
                {/* Glassmorphic inner hover glow for inactive */}
                {!isActive && (
                  <span className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                <Icon className={`w-4.5 h-4.5 mb-1.5 transition-all duration-300 ${
                  isActive ? "text-zinc-955 scale-110" : `${filter.color} group-hover:scale-110`
                }`} />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Tab Panels Selector Router */}
      <div className="space-y-4">
        {/* 1. WIZARD STEP BY STEP */}
        {activeSubTab === "wizard" && (
          <FacilitySetup 
            themeColors={themeColors}
            stores={allowedStores}
            onStoreCreated={(newStore) => {
              const idx = allowedStores.findIndex(s => s.id === newStore.id);
              let updated;
              if (idx > -1) {
                updated = [...allowedStores];
                updated[idx] = newStore;
              } else {
                updated = [...allowedStores, newStore];
              }
              setStores(updated);
            }}
            branches={branches}
            onBranchCreated={(newBranch) => {
              setBranches(prev => {
                const idx = prev.findIndex(b => b.id === newBranch.id);
                if (idx > -1) {
                  const updated = [...prev];
                  updated[idx] = newBranch;
                  return updated;
                }
                return [...prev, newBranch];
              });
            }}
            warehouses={warehouses}
            onWarehouseCreated={(newWh) => {
              setWarehouses(prev => {
                const idx = prev.findIndex(w => w.id === newWh.id);
                if (idx > -1) {
                  const updated = [...prev];
                  updated[idx] = newWh;
                  return updated;
                }
                return [...prev, newWh];
              });
            }}
            posUnits={posUnits}
            onPosCreated={(newPos) => {
              setPosUnits(prev => {
                const idx = prev.findIndex(p => p.id === newPos.id);
                if (idx > -1) {
                  const updated = [...prev];
                  updated[idx] = newPos;
                  return updated;
                }
                return [...prev, newPos];
              });
            }}
            activeStoreId={activeStoreId}
            setActiveStoreId={setActiveStoreId}
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

        {/* 2. COMPANIES OR STORES OR BRANCHES OR WAREHOUSES OR RELATIONS */}
        {activeSubTab === "overview" && (
          <OrganizationHub
            themeColors={themeColors}
            company={
              (rawCompanies || []).find(c => c.id === activeCompanyId) || 
              (rawCompanies || []).find(c => c.tenant_id === tenantId) || 
              (rawCompanies && rawCompanies[0]) || 
              null
            }
            branches={branches}
            warehouses={warehouses}
            stores={allowedStores}
            posUnits={posUnits}
          />
        )}

        {["companies", "stores", "branches", "warehouses", "connections"].includes(activeSubTab) && (
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
            isInline={true}
            initialActiveTab={activeSubTab}
            rawCompanies={rawCompanies}
            setRawCompanies={setRawCompanies}
            tenantId={tenantId}
          />
        )}

        {/* 3. DEDICATED POS UNITS VIEW */}
        {activeSubTab === "pos" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800 gap-4">
              <div className="space-y-1 text-right">
                <h3 className="text-sm font-black text-white">أجهزة الكاشير ومحطات نقاط البيع (POS)</h3>
                <p className="text-[11px] text-gray-400">إدارة التراخيص والتسجيل للأجهزة والمستخدمين الماليين لكل صالة عرض وفرع نشط.</p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setPosFilterStatus("active")}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition border-none ${
                      posFilterStatus === "active"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    النشطة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosFilterStatus("inactive_archived")}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition border-none ${
                      posFilterStatus === "inactive_archived"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    المعطلة / المؤرشفة
                  </button>
                </div>

                <button
                  onClick={() => setShowAddPosModal(true)}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs border-none flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>إضافة نقطة بيع POS</span>
                </button>
              </div>
            </div>

            {displayedPos.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-slate-950/20 rounded-2xl border border-dashed border-slate-850 w-full col-span-full">
                <p className="text-sm font-bold">
                  {posFilterStatus === "active" 
                    ? "لا توجد نقاط بيع مضافة أو نشطة لهذا الفرز حالياً." 
                    : "لا توجد نقاط بيع معطلة أو مؤرشفة حالياً."}
                </p>
                {posFilterStatus === "active" && (
                  <p className="text-[11px] text-gray-500 mt-1">اضغط على زر "إضافة نقطة بيع POS" بالأعلى لإضافة واحدة جديدة.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {displayedPos.map(pos => {
                  const brObj = branches.find(b => b.id === pos.branchId || b.id === pos.branch_id);
                  const whObj = warehouses.find(w => w.id === pos.defaultWh || w.id === pos.warehouse_id);
                  const activeStore = allowedStores.find(s => s.id === pos.storeId || s.id === pos.store_id);

                  const isArchived = !!(pos.archived_at || pos.archivedAt);
                  const isInactive = pos.is_active === false || pos.isActive === false || pos.status === "غير نشط" || pos.status === "inactive" || pos.status === "متوقف" || pos.status === "متوقفة";

                  return (
                    <div key={pos.id} data-testid="pos-card" className="p-4 rounded-2xl border bg-slate-950/60 border-slate-900 transition-all hover:bg-slate-950/80 hover:border-slate-800 relative group flex flex-col justify-between text-right animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] bg-slate-800 text-slate-300 font-extrabold px-1.5 py-0.5 rounded font-mono truncate">
                            ID: {pos.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${(isInactive || isArchived) ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                            <span className={`text-[9.5px] font-extrabold ${(isInactive || isArchived) ? "text-red-400" : "text-emerald-400"}`}>
                              {isArchived ? "مؤرشفة" : (pos.status || "نشط")}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-white flex items-center gap-1.5 justify-end">
                            <span>🖥️</span>
                            {pos.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-sans">
                            💼 المتجر: {pos.storeId || pos.store_id ? (activeStore?.name || "متجر غير معروف") : "بدون ارتباط بمتجر ❌"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-900 text-right">
                          <div className="p-2 rounded bg-slate-900/60">
                            <span className="text-[9px] text-gray-450 block font-bold">الفرع التابع</span>
                            <span className="text-[10px] text-white font-bold block truncate">
                              📍 {pos.branchId || pos.branch_id ? (brObj?.name || "فرع غير معروف") : "بدون ارتباط ❌"}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-slate-900/60">
                            <span className="text-[9px] text-gray-450 block font-bold">مستودع التوريد</span>
                            <span className="text-[10px] text-amber-500 font-bold block truncate">
                              📦 {pos.defaultWh || pos.warehouse_id ? (whObj?.name || "مستودع غير معروف") : "بدون ارتباط ❌"}
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-900/30">
                          <span className="text-[9px] text-gray-450 block font-bold">الكاشير / الموظف المسؤول</span>
                          <span className="text-[10px] text-sky-400 font-extrabold block">👤 {pos.cashier || "موظف نوبة الكاشير"}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-900">
                        <button
                          onClick={() => {
                            setEditingPosId(pos.id);
                            setEditPosName(pos.name);
                            setEditPosBranch(pos.branchId || pos.branch_id || "");
                            setEditPosWh(pos.defaultWh || pos.warehouse_id || "");
                            setEditPosStore(pos.storeId || pos.store_id || "");
                            setEditPosCashier(pos.cashier || "");
                            setEditPosStatus(pos.status || "نشط");
                            setShowEditPosModal(true);
                          }}
                          className="py-1.5 px-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black cursor-pointer transition flex items-center gap-1"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>إدارة وتعديل</span>
                        </button>

                        <button
                          onClick={() => handleDeletePos(pos.id, pos.name)}
                          className="py-1.5 px-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black cursor-pointer transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>إلغاء الترخيص</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal for adding POS device License */}
            {showAddPosModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <button
                      onClick={() => setShowAddPosModal(false)}
                      className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
                    >
                      ✕
                    </button>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      <span>تأسيس وترخيص جهاز كاشير (POS) جديد</span>
                    </h3>
                  </div>

                  <form onSubmit={handleCreatePos} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">اسم محطة نقطة البيع أو رقم الكاشير *</label>
                      <input
                        type="text"
                        required
                        value={newPosName}
                        onChange={(e) => setNewPosName(e.target.value)}
                        placeholder="مثال: جهاز كاشير صالة العليا - الصندوق ١"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الفرع التابع المرتبط</label>
                      <select
                        value={newPosBranch}
                        onChange={(e) => setNewPosBranch(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">بدون ارتباط بفرع (لا يوجد) ❌</option>
                        {branches.map(br => (
                          <option key={br.id} value={br.id}>{br.name} ({br.city})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">مستودع الصرف الافتراضي للبضائع</label>
                      <select
                        value={newPosWh}
                        onChange={(e) => setNewPosWh(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">بدون ارتباط بمستودع (لا يوجد) ❌</option>
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">المتجر المرتبط</label>
                      <select
                        value={newPosStore}
                        onChange={(e) => setNewPosStore(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">بدون ارتباط بمتجر (لا يوجد) ❌</option>
                        {allowedStores.map(store => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الموظف / الكاشير المسؤول المالي (اختياري)</label>
                      <select
                        value={newPosCashier}
                        onChange={(e) => setNewPosCashier(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">اختر الموظف / الكاشير... 👤</option>
                        {filteredUsers.map(user => (
                          <option key={user.id} value={user.name || user.fullName || user.email}>
                            {user.name || user.fullName || user.email} ({user.role === 'cashier' ? 'كاشير' : user.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 pt-4 justify-end">
                      <button
                        type="button"
                        disabled={isPosOperating}
                        onClick={() => setShowAddPosModal(false)}
                        className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                      >
                        إلغاء وتراجع
                      </button>
                      <button
                        type="submit"
                        disabled={isPosOperating}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-none disabled:opacity-50"
                      >
                        {isPosOperating ? "جاري التأسيس..." : "تأسيس وترخيص محطة البيع"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal for editing POS device */}
            {showEditPosModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <button
                      onClick={() => setShowEditPosModal(false)}
                      className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
                    >
                      ✕
                    </button>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      <span>إدارة وتعديل بيانات جهاز كاشير (POS)</span>
                    </h3>
                  </div>

                  <form onSubmit={handleUpdatePos} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">اسم محطة نقطة البيع أو رقم الكاشير *</label>
                      <input
                        type="text"
                        required
                        value={editPosName}
                        onChange={(e) => setEditPosName(e.target.value)}
                        placeholder="مثال: جهاز كاشير صالة العليا - الصندوق ١"
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الفرع التابع المرتبط</label>
                      <select
                        value={editPosBranch}
                        onChange={(e) => setEditPosBranch(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">بدون ارتباط بفرع (لا يوجد) ❌</option>
                        {branches.map(br => (
                          <option key={br.id} value={br.id}>{br.name} ({br.city})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">مستودع الصرف الافتراضي للبضائع</label>
                      <select
                        value={editPosWh}
                        onChange={(e) => setEditPosWh(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">بدون ارتباط بمستودع (لا يوجد) ❌</option>
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">المتجر المرتبط</label>
                      <select
                        value={editPosStore}
                        onChange={(e) => setEditPosStore(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">بدون ارتباط بمتجر (لا يوجد) ❌</option>
                        {allowedStores.map(store => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الموظف / الكاشير المسؤول المالي (اختياري)</label>
                      <select
                        value={editPosCashier}
                        onChange={(e) => setEditPosCashier(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                      >
                        <option value="">اختر الموظف / الكاشير... 👤</option>
                        {filteredUsers.map(user => (
                          <option key={user.id} value={user.name || user.fullName || user.email}>
                            {user.name || user.fullName || user.email} ({user.role === 'cashier' ? 'كاشير' : user.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">الحالة التشغيلية</label>
                      <select
                        value={editPosStatus}
                        onChange={(e) => setEditPosStatus(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-bold"
                      >
                        <option value="نشط">نشط</option>
                        <option value="نشطة">نشطة</option>
                        <option value="متوقف">متوقف</option>
                        <option value="متوقفة">متوقفة</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-4 justify-end">
                      <button
                        type="button"
                        disabled={isPosOperating}
                        onClick={() => setShowEditPosModal(false)}
                        className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                      >
                        إلغاء وتراجع
                      </button>
                      <button
                        type="submit"
                        disabled={isPosOperating}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-none disabled:opacity-50"
                      >
                        {isPosOperating ? "جاري الحفظ..." : "حفظ التعديلات"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. DEDICATED REGISTER / DOCS VIEW */}
        {activeSubTab === "docs" && (
          <div className="p-6 rounded-3xl border text-right space-y-6"
            style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
            <div className="space-y-1 pb-4 border-b border-slate-850">
              <h3 className="text-sm font-black text-white flex items-center justify-end gap-1.5">
                <span>ملف السجلات والوثائق التنظيمية والضريبية الموحدة</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-[11px] text-gray-400 leading-normal">
                حالة الامتثال القانوني والترخيص وحالة الشهادات الأمنية للربط الإلكتروني المباشر (FATOORA) تحت متطلبات الفوترة الضريبية لهوية المتاجر.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "شهادة السجل التجاري الرئيسي للشركة القابضة", issuer: "وزارة التجارة • معتمد", num: "10108849402", date: "٢٠٢٦-١٢-١٥", status: "نشط • موثق" },
                { name: "شهادة تسجيل الضريبة على القيمة المضافة (VAT Certificate)", issuer: "هيئة الزكاة والضريبة والجمارك", num: "302004509800003", date: "مستمر", status: "نشط • موثق" },
                { name: "شهادة شهادة التسجيل في الغرفة التجارية بالرياض", issuer: "اتحاد الغرف السعودية", num: "2204958", date: "٢٠٢٧-٠٥-١١", status: "نشط • موثق" },
                { name: "ترخيص التشغيل التجاري الميداني للبلدية", issuer: "وزارة الشؤون البلدية والقروية والإسكان", num: "4401229584", date: "٢٠٢٦-٠٩-٣٠", status: "نشط • موثق" },
                { name: "وثيقة ترخيص ربط نقاط البيع (ZATCA Integration Key)", issuer: "وحدة الفوترة الذكية سهم OS AI", num: "Z-KEY-00984", date: "بلا انتهاء", status: "مربوط نشط" },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 transition-all text-right space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">
                      {doc.status}
                    </span>
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">{doc.name}</h4>
                    <p className="text-[10px] text-gray-400">{doc.issuer}</p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/60 font-mono text-[10px] text-slate-350 flex justify-between items-center">
                    <span>{doc.num}</span>
                    <span className="text-gray-500 text-[9px] font-sans">الرقم المرجعي:</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">تاريخ الصلاحية / الانتهاء:</span>
                    <span className="font-extrabold text-amber-500">{doc.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-right flex items-center justify-between gap-3">
              <p className="text-[10px] text-amber-500 font-extrabold flex items-center gap-1.5 justify-end">
                <span>⚠️ حالة الربط الضريبي مع منصة الفاتورة (FATOORA) مهيأة ١٠٠٪ في مرحلة الإنتاج وتصدير الفواتير ذاتية الرمز (ZATCA QR Code).</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
