import React, { useState, useEffect } from "react";
import { Invoice, Product, Customer, User, ThemeColors } from "../types";
import { posService, POSSettings } from "../core/database/posService";
import PosSettingsModal from "./PosSettingsModal";
import POS from "./POS";
import { 
  Store as StoreIcon, MapPin, Package, Monitor, ShieldAlert, 
  User as UserIcon, Keyboard, FileText, CheckCircle, ArrowLeftRight, CreditCard, ChevronRight, Settings, Layout
} from "lucide-react";

interface PosAndOperationsProps {
  products: Product[];
  setProducts: (val: Product[]) => void;
  invoices: Invoice[];
  setInvoices: (val: Invoice[]) => void;
  customers: Customer[];
  setCustomers: (val: Customer[]) => void;
  theme: ThemeColors;
  user: User;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  isPosFullscreen?: boolean;
  setIsPosFullscreen?: (val: boolean) => void;
  
  // Workspace Environment Settings
  activeBranchId?: string;
  activeWarehouseId?: string;
  activePosId?: string;
  activeStoreId?: string;
  branches?: any[];
  warehouses?: any[];
  posUnits?: any[];
  setActiveTab?: (tab: string) => void;
}

export default function PosAndOperations({
  products,
  setProducts,
  invoices,
  setInvoices,
  customers,
  setCustomers,
  theme,
  user,
  triggerNotification = () => {},
  addAuditLog = () => {},
  isPosFullscreen = false,
  setIsPosFullscreen = () => {},
  activeBranchId = "",
  activeWarehouseId = "",
  activePosId = "",
  activeStoreId = "",
  branches = [],
  warehouses = [],
  posUnits = [],
  setActiveTab = () => {}
}: PosAndOperationsProps) {

  // Check if we are missing either branch or POS Unit context
  const isEnvironmentUnset = !activeBranchId || !activePosId;

  // POS Settings & Permissions state
  const [posSettings, setPosSettings] = useState<POSSettings>(() => posService.getSettings(activePosId, activeWarehouseId));
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    setPosSettings(posService.getSettings(activePosId, activeWarehouseId));
  }, [activePosId, activeWarehouseId]);

  const canManagePOSSettings =
    user.role === "tenant_owner" ||
    user.role === "admin" ||
    user.role === "system_admin" ||
    user.role === "مالك" ||
    user.role === "مدير" ||
    user.role === "مالك النظام" ||
    user.role === "مدير عام" ||
    user.role === "مدير فرع" ||
    (user as any).permissions?.includes("pos:settings:manage");

  // Retrieve current active entities
  const activeBranch = branches.find(b => b.id === activeBranchId);
  const activeWarehouse = warehouses.find(w => w.id === activeWarehouseId);
  const activePosUnit = posUnits.find(p => p.id === activePosId);

  // Filter invoices belonging to this branch/POS for statistical summary
  const branchInvoices = invoices.filter(inv => !activeBranchId || inv.branch_id === activeBranchId);
  const totalSalesAmount = branchInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  // If in fullscreen mode, render the actual full-featured interactive POS interface directly
  if (isPosFullscreen) {
    return (
      <POS
        products={products}
        setProducts={setProducts}
        invoices={invoices}
        setInvoices={setInvoices}
        customers={customers}
        setCustomers={setCustomers}
        theme={theme}
        user={user}
        isPosFullscreen={isPosFullscreen}
        setIsPosFullscreen={setIsPosFullscreen}
        triggerNotification={triggerNotification}
        addAuditLog={addAuditLog}
        activeBranchId={activeBranchId}
        activeWarehouseId={activeWarehouseId}
        activePosId={activePosId}
        branches={branches}
        warehouses={warehouses}
        posUnits={posUnits}
      />
    );
  }

  // Render POS Operational Portal Dashboard when standard nested tab is active
  return (
    <div dir="rtl" className="space-y-6 text-right select-none animate-fade-in font-sans">
      
      {/* 🔮 Elegant Premium Header Banner */}
      <div 
        className="p-6 rounded-2xl border relative overflow-hidden text-right space-y-2 transition-all"
        style={{ 
          background: "linear-gradient(135deg, #090B1E 0%, #030408 100%)",
          borderColor: "rgba(212, 175, 55, 0.15)",
          boxShadow: "0 10px 30px -15px rgba(0,0,0,0.8)"
        }}
      >
        <div className="absolute top-0 left-0 w-44 h-44 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#E2C974] to-[#B08F26] text-slate-900 shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-1.5 leading-tight">
              بوابة نقاط البيع والتشغيل السحابي الموحد • Sahm POS
              <span className="text-[9px] bg-amber-500/15 text-amber-400 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/20">
                قناة بيع نشطة 🏬
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5 max-w-2xl leading-relaxed">
              منصة سهم المتكاملة للمبيعات وإصدار الفواتير الفورية. تحويل محطات العمل وقوارئ الباركود إلى واجهات بيع فوتونية مترابطة وممتثلة لشروط هيئة الزكاة والضريبة والجمارك حياً.
            </p>
          </div>
        </div>
      </div>

      {/* ⚠️ ENVIRONMENT OR CONFIGURATION WARNINGS BLOCK */}
      {isEnvironmentUnset ? (
        <div 
          className="p-8 rounded-2xl border text-center space-y-6 max-w-xl mx-auto my-6 shadow-xl transition-all"
          style={{ backgroundColor: theme.card, borderColor: "rgba(239, 68, 68, 0.25)" }}
        >
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse text-3xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black text-white">حدد الفرع ونقطة البيع قبل بدء البيع</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
              لصرف المنتجات ومتابعة عهدة الخزانة وضمان تصدير السندات المالية بشكل صحيح متوافق مع الفرع والـ POS المعتمد، يرجى تهيئة بيئة العمل واختيار الفرع النشط أولاً.
            </p>
          </div>
          
          <button
            onClick={() => {
              setActiveTab("setup_organizations");
              triggerNotification("تم تحويلك إلى مسار التأسيس والمنشآت لإعداد الفرع ونقاط البيع الفورية.", "info");
            }}
            className="w-full max-w-xs p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md mx-auto border-none"
          >
            <Settings className="w-4 h-4" />
            <span>إعداد بيئة العمل وتفتيح الفروع 🛠️</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Action area: launch full screen POS */}
          <div className="lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl border space-y-6 select-none bg-slate-900/45"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            
            <div className="space-y-2 text-right">
              <span className="text-[10px] bg-amber-550/10 text-amber-400 border border-amber-550/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                عمليات الكاشير الجاهزة
              </span>
              <h3 className="text-sm font-black text-white">محاكاة واجهة البيع التفاعلية ملء الشاشة</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                بمجرد الضغط على زر "نقطة بيع" بالأسفل، سيتم التبديل الفوري لتجربة البيع المستقلة. سيتم حجب القوائم الجانبية بالكامل والترويسات لتوفير مساحة تشغيل قصوى تمنح الكاشير أعلى معدلات كفاءة وسرعة بالعمل اليومي.
              </p>
            </div>

            {/* Launch points */}
            <div className="p-6 rounded-xl bg-[#05060b] border border-zinc-900 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
                <Monitor className="w-8 h-8 animate-pulse" />
                <span className="text-lg font-black tracking-widest font-mono">SAHM OS POS PANEL</span>
              </div>
              
              <button
                onClick={() => {
                  setIsPosFullscreen(true);
                  triggerNotification("⚡ تم دخول وضع نقطة البيع ملء الشاشة بنجاح.", "success");
                  addAuditLog("فتح نقطة بيع", `تم فتح شاشة الكاشير التفاعلية ملء الشاشة لجهاز [${activePosUnit?.name || "عام"}] فرع [${activeBranch?.name || "عام"}]`);
                }}
                className="w-full max-w-md mx-auto p-4 bg-gradient-to-r from-[#E2C974] to-[#B08F26] hover:from-[#f3da85] hover:to-[#c1a037] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all transform hover:scale-[1.02] duration-200 shadow-lg"
              >
                <Monitor className="w-5 h-5" />
                <span>دخول نقطة بيع (شاشة كاملة) 🖥️</span>
              </button>

              <p className="text-[9.5px] text-zinc-500 font-sans">
                يمكنك التبديل والخروج من شاشة الكاشير في أي وقت والرجوع لإجراء التعديلات والتقارير التنفيذية من خلال زر "خروج من نقطة البيع".
              </p>
            </div>

            {/* Statistics summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
              
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 text-right space-y-1">
                <span className="text-[9.5px] text-gray-450 font-bold block">مجموع فواتير الـ POS لهذا اليوم</span>
                <span className="text-sm font-black text-white block truncate leading-none">
                  {branchInvoices.length} فواتير
                </span>
              </div>
              
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 text-right space-y-1">
                <span className="text-[9.5px] text-gray-450 font-bold block">إجمالي مبيعات المعرض</span>
                <span className="text-sm font-black text-teal-400 block truncate leading-none font-mono">
                  {totalSalesAmount.toLocaleString("ar-SA")} ر.س
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 text-right space-y-1">
                <span className="text-[9.5px] text-gray-450 font-bold block">حالة الطابعة السريعة</span>
                <span className="text-sm font-black text-emerald-400 block truncate leading-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  متصل وجاهز
                </span>
              </div>

            </div>

          </div>

          {/* Environmental parameters status sidebar */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-5 rounded-2xl border space-y-4 select-none"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              
              <h4 className="text-xs font-black text-white pb-2.5 border-b border-zinc-800 flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-[#D4AF37]" />
                معايير ومحددات بيئة العمل الحالية:
              </h4>

              <div className="space-y-3">
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
                  <span className="text-[10px] text-gray-400">🏢 الفرع النشط:</span>
                  <span className="text-[10px] font-black text-amber-400 font-sans">
                    {activeBranch?.name || "غير محدد"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
                  <span className="text-[10px] text-gray-400">📦 المستودع الإمدادي:</span>
                  <span className="text-[10px] font-black text-emerald-400 font-sans">
                    {activeWarehouse?.name || "غير مربوط بمستودع"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
                  <span className="text-[10px] text-gray-400">🖥️ جهاز نقطة البيع (POS):</span>
                  <span className="text-[10px] font-black text-blue-400 font-sans">
                    {activePosUnit?.name || "غير محدد"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
                  <span className="text-[10px] text-gray-400">👤 الكاشير الحالي:</span>
                  <div className="text-left font-sans">
                    <span className="text-[10px] font-black text-gray-200 block">{user.name}</span>
                    <span className="text-[8px] text-gray-500 font-bold block">{user.role}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
                  <span className="text-[10px] text-gray-400">🇸🇦 الامتثال المالي:</span>
                  <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 py-0.5 px-2 rounded font-black border border-emerald-500/15">
                    الربط متوافق ZATCA Fase 2
                  </span>
                </div>

              </div>

              {/* Edit Context CTA */}
              <div className="space-y-2">
                {canManagePOSSettings && (
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="w-full py-2 bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 border-none"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>إعدادات نقطة البيع (الـ POS) ⚙️</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab("setup_organizations");
                    triggerNotification("تم تحويلك إلى صفحة التأسيس والمنشآت.", "info");
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 text-[10px] text-gray-300 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  تحديث أجهزة قنوات الفروع والمستودعات 🏢
                </button>
              </div>

            </div>

            {/* Security Audit Log mini list */}
            <div className="p-5 rounded-2xl border space-y-3"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <h4 className="text-xs font-black text-white">آخر فواتير POS المنجزة اليوم</h4>
              {branchInvoices.length === 0 ? (
                <p className="text-[10px] text-zinc-500 py-3 text-center">لا توجد عمليات مبيعات مسجلة للفرع الحالي المكتمل اليوم.</p>
              ) : (
                <div className="space-y-1.5 font-sans max-h-40 overflow-y-auto">
                  {branchInvoices.slice(-3).reverse().map((inv) => (
                    <div key={inv.id} className="p-2 rounded bg-zinc-950/90 border border-zinc-900 flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-[9.5px] font-extrabold text-[#D4AF37] block leading-tight">فاتورة #{inv.id.substring(0, 6).toUpperCase()}</span>
                        <span className="text-[8px] text-gray-500 font-medium block mt-0.5">{inv.customer || "عميل عام"} • دفع الكتروني</span>
                      </div>
                      <span className="text-[11px] font-black text-emerald-400 font-mono">
                        {(inv.total || 0).toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Ported POS Settings Modal for Operations Tab Dashboard */}
      {isSettingsModalOpen && (
        <PosSettingsModal
          currentPosId={activePosId}
          posUnits={posUnits}
          warehouses={warehouses}
          theme={theme}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={(updatedSettings) => {
            setPosSettings(updatedSettings);
            // Refresh parent status if activePosUnit exists
            if (activePosUnit) {
              activePosUnit.status = updatedSettings.posStatus === "نشطة" ? "نشطة" : "متوقفة";
              activePosUnit.warehouseId = updatedSettings.associatedWarehouseId;
            }
            triggerNotification("تم تعديل وحفظ إعدادات نقطة البيع بنجاح.", "success");
          }}
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
        />
      )}

    </div>
  );
}
