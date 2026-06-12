import React, { useState } from "react";
import { 
  Building, 
  Store, 
  MapPin, 
  Package, 
  Cpu, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Link,
  Shield,
  HelpCircle
} from "lucide-react";
import { storeService } from "../core/database/storeService";
import { branchService } from "../core/database/branchService";
import { warehouseService } from "../core/database/warehouseService";
import { posService } from "../core/database/posService";

interface FacilitySetupProps {
  themeColors: any;
  stores: any[];
  onStoreCreated: (store: any) => void;
  branches: any[];
  onBranchCreated: (branch: any) => void;
  warehouses: any[];
  onWarehouseCreated: (warehouse: any) => void;
  posUnits: any[];
  onPosCreated: (pos: any) => void;
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  activeWarehouseId: string;
  setActiveWarehouseId: (id: string) => void;
  activePosId: string;
  setActivePosId: (id: string) => void;
  addAuditLog: (event: string, text: string) => void;
  triggerNotification: (msg: string, type: "success" | "info" | "error" | "warning" | "critical") => void;
}

export default function FacilitySetup({
  themeColors,
  stores,
  onStoreCreated,
  branches,
  onBranchCreated,
  warehouses,
  onWarehouseCreated,
  posUnits,
  onPosCreated,
  activeStoreId,
  setActiveStoreId,
  activeBranchId,
  setActiveBranchId,
  activeWarehouseId,
  setActiveWarehouseId,
  activePosId,
  setActivePosId,
  addAuditLog,
  triggerNotification
}: FacilitySetupProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Main Legal Company Form State
  const [companyName, setCompanyName] = useState("شركة سهم النخبة القابضة");
  const [companyCr, setCompanyCr] = useState("10108849402");
  const [companyTax, setCompanyTax] = useState("302004509800003");
  const [companyAddress, setCompanyAddress] = useState("المبنى الرئيسي، الرياض 12211 - طريق الملك فهد");
  const [companyManager, setCompanyManager] = useState("حمد بن راشد آل سهم");

  // STEP 2: Store / Brand Form State
  const [storeName, setStoreName] = useState("متجر سهم دهن العود الفاخر");
  const [storeId, setStoreId] = useState(`store_${Date.now().toString().slice(-4)}`);
  const [storeCategory, setStoreCategory] = useState("دهن العود والزعفران وبخور النخبة");
  const [storeCurrency, setStoreCurrency] = useState("ر.س");
  const [storeTheme, setStoreTheme] = useState("luxury");

  // STEP 3: Branch / Showroom Form State
  const [branchName, setBranchName] = useState("معرض سهم - فرع العليا الرئيسي");
  const [branchCity, setBranchCity] = useState("الرياض");
  const [branchAddress, setBranchAddress] = useState("العليا العام، تقاطع العروبة");
  const [branchManager, setBranchManager] = useState("عبد العزيز الشمري");
  const [branchPhone, setBranchPhone] = useState("0502233949");
  const [branchStoreId, setBranchStoreId] = useState(storeId);
  const [branchStatus, setBranchStatus] = useState("نشط");

  // STEP 4: Warehouse / Storage Form State
  const [whName, setWhName] = useState("مستودع سهم المركزي - السلي");
  const [whCity, setWhCity] = useState("الرياض");
  const [whAddress, setWhAddress] = useState("حي السلي اللوجستي، مخرج 17");
  const [whManager, setWhManager] = useState("عبد الرحمن الدوسري");
  const [whCapacity, setWhCapacity] = useState(5000);
  const [whType, setWhType] = useState<"main" | "sub">("main");
  const [whStatus, setWhStatus] = useState("نشط");

  // STEP 5: Relationship Link Form State
  const [linkBranchId, setLinkBranchId] = useState("");
  const [linkWarehouseId, setLinkWarehouseId] = useState("");

  // STEP 6: POS Device Form State
  const [posName, setPosName] = useState("جهاز كاشير العليا - الصالة الرئيسية");
  const [posBranchId, setPosBranchId] = useState("");
  const [posWarehouseId, setPosWarehouseId] = useState("");
  const [posCashier, setPosCashier] = useState("بندر الجهني");
  const [posPayMethods, setPosPayMethods] = useState<string[]>(["cash", "card"]);
  const [posStatus, setPosStatus] = useState("نشط");

  // STEP 7: Application Defaults
  const [defStoreId, setDefStoreId] = useState("");
  const [defBranchId, setDefBranchId] = useState("");
  const [defWarehouseId, setDefWarehouseId] = useState("");
  const [defPosId, setDefPosId] = useState("");

  const stepsList = [
    { title: "الشركة الرئيسية", subtitle: "الكيان القانوني الموحد", icon: Building },
    { title: "قناة البيع / المتجر", subtitle: "تأسيس هوية الفرع التجاري", icon: Store },
    { title: "الفرع / المعرض", subtitle: "موقع التشغيل والبيع الميداني", icon: MapPin },
    { title: "المستودع اللوجستي", subtitle: "بيئة تخزين وجرد البضائع", icon: Package },
    { title: "ربط بيئة الموقع", subtitle: "توجيه الفروع لمخازن التوريد", icon: Link },
    { title: "جهاز كاشير POS", subtitle: "نقطة تحصيل المبيعات", icon: Cpu },
    { title: "تعميد الافتراضيات", subtitle: "تجهيز جلسة العمل الفورية", icon: CheckCircle },
  ];

  // STEP Validations & Transition
  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        if (!companyName.trim()) throw new Error("يرجى إدخال اسم الشركة الرئيسية");
        if (!companyCr.trim()) throw new Error("يرجى إدخال السجل التجاري");
        triggerNotification("✓ تم حفظ بيانات الكيان القانوني بنجاح", "success");
        addAuditLog("تأسيس المنشأة", `تم تأسيس الكيان القانوني: ${companyName} بسجل رقم [${companyCr}]`);
      }

      if (currentStep === 2) {
        if (!storeName.trim()) throw new Error("يرجى إدخال اسم المتجر");
        if (!storeId.trim()) throw new Error("يرجى إدخال كود تعريفي للمتجر");
        
        // Save in service
        const newStore = {
          id: storeId.trim(),
          name: storeName.trim(),
          domain: `${storeId.trim()}.sahm.os`,
          industry: storeCategory,
          currency: storeCurrency,
          theme: storeTheme,
          address: companyAddress,
          crNumber: companyCr,
          taxNumber: companyTax,
          status: "active",
          isActive: true
        };
        const created = await storeService.create(newStore as any);
        onStoreCreated(created);

        // Prepopulate next values
        setBranchStoreId(created.id);
        setDefStoreId(created.id);
        
        triggerNotification(`✓ تم إنشاء المتجر وقناة البيع [${created.name}] في النظام`, "success");
        addAuditLog("تأسيس المنشأة", `تم تأسيس المتجر الموحد: ${created.name} (ID: ${created.id})`);
      }

      if (currentStep === 3) {
        if (!branchName.trim()) throw new Error("يرجى إدخال اسم الفرع");
        if (!branchAddress.trim()) throw new Error("يرجى إدخال العنوان");
        
        const newBranch = {
          id: `branch_${Date.now().toString().slice(-4)}`,
          name: branchName.trim(),
          city: branchCity,
          address: branchAddress.trim(),
          manager: branchManager.trim() || "مدير فرع العليا",
          phone: branchPhone.trim() || "0500000000",
          storeId: branchStoreId || storeId || activeStoreId || "store_1",
          store_id: branchStoreId || storeId || activeStoreId || "store_1",
          status: branchStatus,
          isActive: branchStatus === "نشط",
          associatedWh: whName ? `wh_${Date.now().toString().slice(-4)}` : "" // populated later
        };
        const created = await branchService.create(newBranch as any);
        onBranchCreated(created);

        // Prepopulate step 5 and defaults
        setLinkBranchId(created.id);
        setPosBranchId(created.id);
        setDefBranchId(created.id);

        triggerNotification(`✓ تم تأسيس فرع البيع [${created.name}] بنجاح`, "success");
        addAuditLog("تأسيس المنشأة", `تم تأسيس الفرع الفعلي: ${created.name} في مدينة ${created.city}`);
      }

      if (currentStep === 4) {
        if (!whName.trim()) throw new Error("يرجى إدخال اسم المستودع");
        if (!whAddress.trim()) throw new Error("يرجى إدخال العنوان التفصيلي للمستودع");
        
        const newWh = {
          id: `wh_${Date.now().toString().slice(-4)}`,
          name: whName.trim(),
          city: whCity,
          location: whAddress.trim(),
          manager: whManager.trim() || "أمين مستودع السلي",
          capacity: Number(whCapacity) || 3000,
          type: whType,
          status: whStatus,
          isActive: whStatus === "نشط",
          storeId: defStoreId || storeId || activeStoreId || "store_1",
          store_id: defStoreId || storeId || activeStoreId || "store_1"
        };
        const created = await warehouseService.create(newWh as any);
        onWarehouseCreated(created);

        // Prepopulate step 5 & 6 and defaults
        setLinkWarehouseId(created.id);
        setPosWarehouseId(created.id);
        setDefWarehouseId(created.id);

        triggerNotification(`✓ تم تسجيل المستودع التخزيني [${created.name}]`, "success");
        addAuditLog("تأسيس المنشأة", `تم تسجيل المستودع: ${created.name} بسعة ${created.capacity} وحدة`);
      }

      if (currentStep === 5) {
        // Associate Branch to Warehouse
        const bId = linkBranchId || (branches[0] ? branches[0].id : "");
        const wId = linkWarehouseId || (warehouses[0] ? warehouses[0].id : "");
        
        if (bId && wId) {
          const targetBranch = branches.find(b => b.id === bId);
          if (targetBranch) {
            let updatedBranch = await branchService.update(bId, { associatedWh: wId });
            if (!updatedBranch) {
              const fallback = { ...targetBranch, associatedWh: wId };
              updatedBranch = await branchService.create(fallback);
            }
            onBranchCreated(updatedBranch);
            
            triggerNotification("✓ تم ربط الفرع بالمستودع الإمدادي وتزامن الأرصدة بنجاح", "success");
            addAuditLog("تأسيس المنشأة", `تم ربط الفرع [${targetBranch.name}] بالمستودع الإمدادي [${wId}]`);
          }
        } else {
          triggerNotification("تحمل تخطي! تم تخطي الربط، سيستخدم النظام مستند المستودع الافتراضي للمبيعات", "warning");
        }
      }

      if (currentStep === 6) {
        if (!posName.trim()) throw new Error("يرجى تسمية جهاز الكاشير POS");
        
        const defaultBranch = posBranchId || linkBranchId || (branches[0] ? branches[0].id : "branch_riyadh_main");
        const defaultWh = posWarehouseId || linkWarehouseId || (warehouses[0] ? warehouses[0].id : "warehouse_1");

        const targetStore = defStoreId || storeId || activeStoreId || "store_1";
        const newPos = {
          id: `pos_${Date.now().toString().slice(-4)}`,
          name: posName.trim(),
          branchId: defaultBranch,
          warehouseId: defaultWh,
          storeId: targetStore,
          store_id: targetStore,
          cashier: posCashier.trim() || "كاشير مناوب",
          status: posStatus,
          isActive: posStatus === "نشط",
          isDefault: true,
          payMethods: posPayMethods
        };
        const created = await posService.create(newPos);
        onPosCreated(created);

        // Prepopulate defaults
        setDefPosId(created.id);

        triggerNotification(`✓ تم تخليق جهاز الكاشير الرقمي [${created.name}] وطرق الدفع`, "success");
        addAuditLog("تأسيس المنشأة", `تم إدراج جهاز الكاشير: ${created.name} للفرع كود [${defaultBranch}]`);
      }

      if (currentStep === 7) {
        // Enforce application defaults setting
        const sId = defStoreId || activeStoreId || (stores[0] ? stores[0].id : "store_1");
        const bId = defBranchId || (branches[0] ? branches[0].id : "branch_riyadh_main");
        const wId = defWarehouseId || (warehouses[0] ? warehouses[0].id : "warehouse_1");
        const pId = defPosId || (posUnits[0] ? posUnits[0].id : "pos_1");

        // Set the active env variables
        setActiveStoreId(sId);
        setActiveBranchId(bId);
        setActiveWarehouseId(wId);
        setActivePosId(pId);

        localStorage.setItem("sahm_active_store_id", sId);
        localStorage.setItem("sahm_active_branch_id", bId);
        localStorage.setItem("sahm_active_warehouse_id", wId);
        localStorage.setItem("sahm_active_pos_id", pId);

        triggerNotification("🎉 نجاح المعايدة الشاملة! تم تأسيس وهيكلة بيئة التشغيل المتكاملة بنجاح.", "success");
        addAuditLog("تأسيس المنشأة", "تمت تصفية المعجل الشامل للمنشأة وتنصيب العمدة والافتراضيات بنجاح!");
        
        // Reset step
        setCurrentStep(1);
        return;
      }

      // Move forward
      setCurrentStep(prev => prev + 1);
    } catch (err: any) {
      triggerNotification(err.message || "فشلت خطوة التأسيس، تأكد من المدخلات.", "error");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const activeTheme = "luxury";
  const bgStyle = "bg-slate-950 border border-slate-800 text-slate-100";

  return (
    <div className="w-full space-y-6 text-right font-sans min-h-[500px]" dir="rtl">
      
      {/* Title & Banner Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600/15 to-slate-900 border border-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-md bg-amber-500/10 text-amber-400 font-mono font-bold text-xs">Sahm OS Elite Wizard</span>
            <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-550/10 font-bold border border-emerald-500/20">جاهز للتشغيل والترخيص 🗄️</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
            🏗️ بوابة معالج التأسيس الشامل للمنشأة (نسخة 30 المعتمدة)
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            البوابة الذكية الموحدة لتعدين وهيكلة الأصول القانونية والتجارية والتشغيلية في ثوان معدودة. قم بتوليد الشركة والمتاجر والفروع والمخازن ونقاط البيع وربطها بالكامل لتوليف بيئة الكاشير وعمليات الـ ERP الآمنة.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="text-center p-2.5 px-3.5 bg-slate-900/80 rounded-xl border border-slate-800 shrink-0">
            <span className="block text-gray-500 text-[9px] font-bold uppercase">الخطوة الحالية</span>
            <span className="font-mono font-black text-amber-400 text-lg">{currentStep} من 7</span>
          </div>
        </div>
      </div>

      {/* Steps Horizontal Bar Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {stepsList.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;
          const IconComponent = step.icon;

          return (
            <div 
              key={idx}
              onClick={() => {
                // allow navigating to completed steps
                if (isDone) setCurrentStep(stepNum);
              }}
              className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer select-none ${
                isActive 
                  ? "bg-amber-500/10 border-amber-500/35 shadow-lg shadow-amber-950/20 scale-[1.02]" 
                  : isDone 
                    ? "bg-slate-900/60 border-emerald-500/20 text-emerald-400 hover:bg-slate-900" 
                    : "bg-slate-900/20 border-slate-900 text-gray-400 opacity-60 pointer-events-none"
              }`}
            >
              <div className={`p-1.5 rounded-xl mb-1 ${
                isActive ? "bg-amber-500/10 text-amber-400" : isDone ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-950 text-gray-500"
              }`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black block truncate">{step.title}</span>
              <span className="text-[8px] text-gray-500 block truncate mt-0.5">{step.subtitle}</span>
            </div>
          );
        })}
      </div>

      {/* Body Area & Step Panels */}
      <div className={`p-6 rounded-2xl ${bgStyle} min-h-[350px] flex flex-col justify-between`}>
        
        {/* STEP 1 PANEL: Main Corporate Entity */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">🏢 الخطوة 1: تأسيس الشركة الشقيقة القابضة (الكيان الرئيسي)</h4>
                <p className="text-[10px] text-gray-400">تعتبر الشركة الحاضنة للمنظومة القانونية، والمظلة للتراخيص والربط الزكوي ومحاضر الجلسات.</p>
              </div>
              <span className="text-[10px] bg-slate-900 text-slate-300 p-1 px-2.5 rounded-lg border border-slate-800">كيان الشركة الرئيسي</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الاسم التجاري القانوني للشركة</label>
                <input 
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="شركة سهم الموحدة للتجارة"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• رقم السجل التجاري القائم (CR)</label>
                <input 
                  type="text"
                  value={companyCr}
                  onChange={(e) => setCompanyCr(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
                  placeholder="1010XXXXXX"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الرقم الضريبي الموحد (VAT / 15 خانة)</label>
                <input 
                  type="text"
                  value={companyTax}
                  onChange={(e) => setCompanyTax(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
                  placeholder="3XXXXXXXXXXXXXXXX"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• المدير التنفيذي / المالك العام للمجموعة</label>
                <input 
                  type="text"
                  value={companyManager}
                  onChange={(e) => setCompanyManager(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="المدير العام المسؤول"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10.5px] text-gray-400 block font-bold">• العنوان الرقمي وبلدية التأسيس</label>
                <input 
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="العنوان الوطني الرياض الرئيسي"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-gray-400 leading-normal flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>توجيه إداري:</strong> يرمز الكيان الموحد إلى رأس الهرم في الهيكل التنظيمي المعتمد من سهم (الشركة ← المتاجر ← الفروع ← المستودعات ← نقاط البيع ← الكاشير). سيتم تلقائياً تذييل الفواتير وعصمة التقارير الضريبية والمالية وفق مخرجات هذا الكيان.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 PANEL: Store channels */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">🏬 الخطوة 2: تهيئة المتجر / العلامة التجارية المعتمدة</h4>
                <p className="text-[10px] text-gray-400">تستخدم العلامة كفرع تسوق وقناة بيع سحابية لربط واجهات العملاء ببرنامج المخزون والمحاسبة.</p>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 p-1 px-2.5 rounded-lg border border-amber-500/20">توليد قناة البيع</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• اسم المتجر / العلامة التجارية <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="مثال: سهم للعود والزعفران الملكي"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• كود المعرف للمتجر (Store ID فريد) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
                  placeholder="ID فريد مثال: store_oud"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• تصنيف ونوع المنتجات البارزة</label>
                <select
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="دهن العود والزعفران وبخور النخبة">دهن العود والزعفران وبخور النخبة</option>
                  <option value="العطور والتجميل والهدايا الفاخرة">العطور والتجميل والهدايا الفاخرة</option>
                  <option value="تجارة التجزئة والموضة الجلود">تجارة التجزئة والموضة الجلود</option>
                  <option value="المقاهي ومستلزمات الضيافة الفخمة">المقاهي ومستلزمات الضيافة الفخمة</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• واجهة تنسيق السمات (Theme Branding Theme)</label>
                <select
                  value={storeTheme}
                  onChange={(e) => setStoreTheme(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="luxury">سمة النخبة الذهبية (Luxury Gold)</option>
                  <option value="royal">سمة الوقار الملكية الكلاسيكية (Royal Blue)</option>
                  <option value="saudi">سمة سهم الخضراء الوطنية (Saudi Green)</option>
                  <option value="dark">سمة الحمم السوداء الداكنة (Void Charcoal)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 PANEL: Branch / Showroom Setup */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">🏢 الخطوة 3: تأسيس موقع تشغيل فعلي (الفرع / المعرض الميداني)</h4>
                <p className="text-[10px] text-gray-450">يمثل المعرض موقع تواجد ومباشرة مبيعات واستلام بضائع وتعيين الموظفين والمعدات.</p>
              </div>
              <span className="text-[10px] bg-slate-900 text-sky-400 p-1 px-2.5 rounded-lg border border-slate-800">تأسيس الفروع</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• اسم الفرع / المعرض الجغرافي <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="مثال: فرع العليا التخصصي"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• عاصمة الموقع / المدينة <span className="text-red-500">*</span></label>
                <select
                  value={branchCity}
                  onChange={(e) => setBranchCity(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="الرياض">الرياض (مقر النواة)</option>
                  <option value="جدة">جدة (منفذ الساحل)</option>
                  <option value="الدمام">الدمام (المنطقة الشرقية)</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• مدير الفرع المسؤول (Authorized Manager)</label>
                <input 
                  type="text"
                  value={branchManager}
                  onChange={(e) => setBranchManager(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="اسم مدير الموقع"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• رقم التواصل والفاكس المباشر</label>
                <input 
                  type="text"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
                  placeholder="050XXXXXXXX"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• المتجر التابع (مجموعة المبيعات)</label>
                <select
                  value={branchStoreId}
                  onChange={(e) => setBranchStoreId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value={storeId}>{storeName}</option>
                  {stores.filter(s => s.id !== storeId).map((s, i) => (
                    <option key={i} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الحالة التشغيلية الفورية للفرع</label>
                <select
                  value={branchStatus}
                  onChange={(e) => setBranchStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="نشط">نشط وجاهز للبيع (Active) 🟢</option>
                  <option value="معطل">معطل وقيد الإعداد (Inactive) 🔴</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10.5px] text-gray-400 block font-bold">• العنوان الجغرافي والبلدي لوحة المعرض <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="شارع الملك فهد، تقاطع العليا العام، الرياض"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 PANEL: Warehouse Storage Setup */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">📦 الخطوة 4: تطوير مستودع لوجستي لتخزين وحصر البضائع</h4>
                <p className="text-[10px] text-gray-400">تعتمد المستودعات كحواضرة للرصيد الفعلي والجهوزية، ويشهد من خلالها إمداد وتوريد الفروع أو معارض سهم.</p>
              </div>
              <span className="text-[10px] bg-slate-900 text-emerald-400 p-1 px-2.5 rounded-lg border border-slate-800 font-bold">بنية المستودعات</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• اسم المستودع التعريفي <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="مثال: مستودع السلي الإمدادي الرئيسي"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• عاصمة المستودع / المدينة <span className="text-red-500">*</span></label>
                <select
                  value={whCity}
                  onChange={(e) => setWhCity(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• المسؤول المباشر عن المخازن والجرد</label>
                <input 
                  type="text"
                  value={whManager}
                  onChange={(e) => setWhManager(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="أمين العهدة والمستودع"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• السعة الاستيعابية القصوى (وحدات التخزين)</label>
                <input 
                  type="number"
                  value={whCapacity}
                  onChange={(e) => setWhCapacity(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
                  placeholder="5000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• نوع بيئة المستودع التخزينية</label>
                <select
                  value={whType}
                  onChange={(e) => setWhType(e.target.value as "main" | "sub")}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="main">مستودع رئيسي مركزي (Distribution Hub)</option>
                  <option value="sub">مستودع فرعي ثانوي (Spoke Warehousing)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الحالة التشغيلية الفورية للمستودع</label>
                <select
                  value={whStatus}
                  onChange={(e) => setWhStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="نشط">نشط ويستقبل المخزون وتوريد الموردين 🔴🟢</option>
                  <option value="معطل">معطل وتحت الصيانة أو مغلق 🔴</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10.5px] text-gray-400 block font-bold">• العنوان الجغرافي والدليل <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="منطقة السلي الصناعية، تقاطع اسطنبول العام، الرياض"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 PANEL: Link Showroom to Storage */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">🔗 الخطوة 5: ربط قنوات الإمداد وعقد الفروع للمستودعات</h4>
                <p className="text-[10px] text-gray-400">يقوم هذا الإجراء بمنح تراخيص الصرف الآلي للفرع ليسحب مخزونه فورياً من المستودع المحدد تلقائياً.</p>
              </div>
              <span className="text-[10px] bg-slate-900 text-teal-400 p-1 px-2.5 rounded-lg border border-slate-800 font-sans font-bold">ربط منافذ المواقع</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-2xl border border-slate-900 text-xs">
              
              <div className="space-y-2">
                <label className="text-[10.5px] text-gray-400 block font-bold">• حدد الفرع المستهدف بالربط</label>
                <select
                  value={linkBranchId}
                  onChange={(e) => setLinkBranchId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="">-- اضغط للاختيار من الفروع --</option>
                  {branches.map((b, i) => (
                    <option key={i} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
                <p className="text-[9.5px] text-gray-400">سيتم ربط هذا المعرض بمستودعه للحصول على رصيد تلقائي بدون مغالاة.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10.5px] text-gray-400 block font-bold">• المستودع الإمدادي الافتراضي المغذي</label>
                <select
                  value={linkWarehouseId}
                  onChange={(e) => setLinkWarehouseId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="">-- اضغط للاختيار من المستودعات --</option>
                  {warehouses.map((w, i) => (
                    <option key={i} value={w.id}>{w.name} ({w.city})</option>
                  ))}
                </select>
                <p className="text-[9.5px] text-gray-450">المستودع المغذي وصاحب رصيد العهد المالي المعتمد.</p>
              </div>

            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 text-amber-500 text-[10.5px] border border-amber-500/10 leading-relaxed font-sans font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>ميزة الذكاء السحابي النشطة: يقوم نظام سهم تلقائياً بحساب مسافات التوريد واحتساب التوصيات التلقائية للنقل اللوجيستي بناء على المدينة والموقع المختار.</span>
            </div>
          </div>
        )}

        {/* STEP 6 PANEL: POS cash register machine setup */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">🖥️ الخطوة 6: إنشاء وتكليف وحدة الكاشير الرقمية (جلسة POS)</h4>
                <p className="text-[10px] text-gray-400">محطة ونقطة البيع النهائية التي يتم من خلالها معالجة المبيعات الميدانية وإصدار الفواتير المبسطة للعملاء.</p>
              </div>
              <span className="text-[10px] bg-slate-900 text-yellow-500 p-1 px-2.5 rounded-lg border border-slate-800 font-bold">جهاز كاشير POS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• اسم جهاز الكاشير / المعرف المالي <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={posName}
                  onChange={(e) => setPosName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold"
                  placeholder="كاشير جهاز رقم 01 - الصالة"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الموظف المسؤول (اختياري)</label>
                <input 
                  type="text"
                  value={posCashier}
                  onChange={(e) => setPosCashier(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="الموظف المسؤول عن العهدة الكاشير"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الفرع التابع <span className="text-red-500">*</span></label>
                <select
                  value={posBranchId}
                  onChange={(e) => setPosBranchId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="">-- اختر الفرع --</option>
                  {branches.map((b, i) => (
                    <option key={i} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• المستودع الافتراضي للصرف والمزامنة <span className="text-red-500">*</span></label>
                <select
                  value={posWarehouseId}
                  onChange={(e) => setPosWarehouseId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="">-- اختر المستودع --</option>
                  {warehouses.map((w, i) => (
                    <option key={i} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• طرق الدفع المسموح بقبولها في نقطة البيع</label>
                <div className="flex gap-4 p-2 bg-slate-900 rounded-xl border border-slate-850 mt-1">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={posPayMethods.includes("cash")}
                      onChange={(e) => {
                        if (e.target.checked) setPosPayMethods([...posPayMethods, "cash"]);
                        else setPosPayMethods(posPayMethods.filter(p => p !== "cash"));
                      }}
                      className="accent-amber-500"
                    />
                    <span>نقدي (Cash)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={posPayMethods.includes("card")}
                      onChange={(e) => {
                        if (e.target.checked) setPosPayMethods([...posPayMethods, "card"]);
                        else setPosPayMethods(posPayMethods.filter(p => p !== "card"));
                      }}
                      className="accent-amber-500"
                    />
                    <span>بطاقة مدى/فيزا (Card)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={posPayMethods.includes("bank")}
                      onChange={(e) => {
                        if (e.target.checked) setPosPayMethods([...posPayMethods, "bank"]);
                        else setPosPayMethods(posPayMethods.filter(p => p !== "bank"));
                      }}
                      className="accent-amber-500"
                    />
                    <span>تحويل بنكي (Bank Transfer)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400 block font-bold">• الحالة والجاهزية لجلسة الكاشير</label>
                <select
                  value={posStatus}
                  onChange={(e) => setPosStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="نشط">نشط ويستقبل الفواتير الفورية 🟢</option>
                  <option value="معطل">معطل وخارج أوقات التشغيل 🔴</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7 PANEL: Final Defaults confirmation review */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-amber-500 flex items-center gap-1.5 font-bold">👑 الخطوة 7: تعميد بيئة العمل وتوكيل الافتراضيات</h4>
                <p className="text-[10px] text-gray-400">الخطوة النهائية لتعيين هوية الجرد ومساحة الكاشير النشطة، وتفويض الوصول الموحد بـ ERP سهم.</p>
              </div>
              <span className="text-[10px] bg-emerald-550/15 text-emerald-400 p-1 px-2.5 rounded-lg border border-emerald-500/20 font-bold">تعميد واكتمال</span>
            </div>

            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-xs text-white font-black">📋 مراجعة وتعيين عهدة بيئة العمل المباشرة والافتراضيات:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-gray-500 block">المتجر الافتراضي المعتمد للـ ERP</span>
                  <select
                    value={defStoreId}
                    onChange={(e) => setDefStoreId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1 text-xs font-bold focus:border-amber-500"
                  >
                    {stores.map((s, i) => (
                      <option key={i} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-gray-500 block">الفرع المباشر النشط للتحصيل والمبيعات</span>
                  <select
                    value={defBranchId}
                    onChange={(e) => setDefBranchId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1 text-xs font-bold focus:border-amber-500"
                  >
                    {branches.map((b, i) => (
                      <option key={i} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-gray-500 block">المستودع المغذي الافتراضي في ساحة الجرد</span>
                  <select
                    value={defWarehouseId}
                    onChange={(e) => setDefWarehouseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1 text-xs font-bold focus:border-amber-500"
                  >
                    {warehouses.map((w, i) => (
                      <option key={i} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-gray-500 block">جهاز كاشير POS المعتمد للجلسات</span>
                  <select
                    value={defPosId}
                    onChange={(e) => setDefPosId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1 text-xs font-bold focus:border-amber-500"
                  >
                    {posUnits.map((p, i) => (
                      <option key={i} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            <div className="p-4 bg-emerald-950/15 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
              <div className="text-xs space-y-1 text-right">
                <span className="font-bold text-white block">صيحة التأسيس الموحد كاملة وجاهزة 🟢</span>
                <p className="text-gray-400 leading-normal">بالضغط على "تعميد وحفظ بيئة التأسيس الموحدة"، سيقوم النظام بنزع أي ملامح تهيئة عشوائية وتنشيط المعايير المعتمدة لشركتك الجديدة، وحقن البيانات بسلاسل القنوات اللوجستية فورياً ومزامنتها لحظياً.</p>
              </div>
            </div>
          </div>
        )}

        {/* Prev / Next Bottom Ribbon */}
        <div className="pt-6 border-t border-slate-850 flex justify-between items-center gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              currentStep === 1 
                ? "bg-slate-950 border border-slate-900 text-gray-650 opacity-40 cursor-not-allowed" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white"
            }`}
          >
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span>السابق للخطوة</span>
          </button>

          <button
            onClick={handleNext}
            className="py-2.5 px-7 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 hover:shadow-lg hover:shadow-amber-500/10 text-black border-none font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 select-none"
          >
            <span>{currentStep === 7 ? "تعميد وحفظ بيئة التأسيس الموحدة 💾" : "حفظ وقبول الخطوة التالية"}</span>
            <ArrowLeft className="w-4 h-4 text-black" />
          </button>
        </div>

      </div>

      {/* Info Badge Helpline */}
      <div className="p-3 bg-slate-900 rounded-xl text-[10px] text-gray-400 border border-slate-850/80 leading-normal flex items-center gap-1.5">
        <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
        <p>نصيحة سهم: يمكنك دائماً استيراد وتخصيص الفروع وتخويل المبيعات تحت صلاحياتك من خلال تبويبات "إدارة وتهيئة بيئة العمل الموحدة" في لوحة التحكم في أي وقت.</p>
      </div>

    </div>
  );
}
