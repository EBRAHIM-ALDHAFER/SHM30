import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, Store, MapPin, Package, Users, Compass, 
  CreditCard, ShieldCheck, CheckCircle2, Check, ArrowRight, 
  ArrowLeft, Laptop, Play, Plus, Trash2, Rocket, HelpCircle
} from "lucide-react";
import { User, CompanyProfile, StoreProfile, Product, ThemeColors } from "../types";

interface OnboardingWizardProps {
  theme: ThemeColors;
  currentUser: User;
  onComplete: (data: {
    selectedPlan: "A" | "B" | "C";
    company: CompanyProfile;
    store: StoreProfile;
    branch: any;
    warehouse: any;
    posUnit: any;
    product?: Product;
    employee?: User;
  }) => void;
  onLogout: () => void;
}

export default function OnboardingWizard({ theme, currentUser, onComplete, onLogout }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;
  const [errorText, setErrorText] = useState<string | null>(null);

  // Step 1: Subscription Tier
  const [selectedPlan, setSelectedPlan] = useState<"A" | "B" | "C">("B");

  // Step 2: First Company / Establishment
  const [compName, setCompName] = useState("مؤسسة سهام الغد لبيع التجزئة");
  const [compLegalName, setCompLegalName] = useState("شركة سهام الغد ش.م.م");
  const [compCrNumber, setCompCrNumber] = useState("1010884977");
  const [compVatNumber, setCompVatNumber] = useState("311223344500003");
  const [compUnified700, setCompUnified700] = useState("7009491822");
  const [compPhone, setCompPhone] = useState("0502049211");
  const [compEmail, setCompEmail] = useState(currentUser.email);
  const [compAddress, setCompAddress] = useState("الرياض، حي المروج، طريق الملك عبد العزيز");

  // Step 3: First Store
  const [storeName, setStoreName] = useState("معرض المذاق الفاخر للعود");
  const [storeDesc, setStoreDesc] = useState("متجر متخصص في العطور والزيوت العطرية والعود الصافي");

  // Step 4: First Branch
  const [branchName, setBranchName] = useState("فرع الرياض الرئيسي السلي");
  const [branchCity, setBranchCity] = useState("الرياض");
  const [branchAddress, setBranchAddress] = useState("صناعية السلي، مخرج 17");
  const [branchPhone, setBranchPhone] = useState("0112445588");
  const [branchHrs, setBranchHrs] = useState("09:00 ص - 11:00 م");

  // Step 5: First Warehouse
  const [whName, setWhName] = useState("مستودع الرياض المركزي للتجهيز");
  const [whLocation, setWhLocation] = useState("حي السلي، شارع اسطنبول");
  const [whCapacity, setWhCapacity] = useState("5000");

  // Step 6: First POS Unit
  const [posName, setPosName] = useState("كاشير البيع الرئيسي 🖥️");

  // Step 7: First Product
  const [prodName, setProdName] = useState("عود كلمنتان طبيعي فاخر");
  const [prodSku, setProdSku] = useState("P-KAL-1");
  const [prodPrice, setProdPrice] = useState("150");
  const [prodCost, setProdCost] = useState("80");
  const [prodStock, setProdStock] = useState("100");
  const [prodCategory, setProdCategory] = useState("بخور وعود");

  // Step 8: Invite First Employee
  const [empName, setEmpName] = useState("صالح الحربي");
  const [empUser, setEmpUser] = useState("salah.cashier");
  const [empEmail, setEmpEmail] = useState("salah@sahm.com");
  const [empPhone, setEmpPhone] = useState("0554412233");
  const [empPass, setEmpPass] = useState("1234");
  const [empRole, setEmpRole] = useState("cashier");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepsDetails = [
    { title: "باقة الاشتراك", desc: "اختيار الباقة التجارية الأنسب لحجم تجارتك" },
    { title: "المنشأة الأولى", desc: "الاسم الرسمي، السجل، الرقم الضريبي" },
    { title: "المتجر الأول", desc: "قناة البيع وعرض السلع الرقمية والـ ERP" },
    { title: "الفرع الأول", desc: "تحديد صالة عرض المبيعات وعناوين التفعيل" },
    { title: "المستودع الأول", desc: "مركز التخزين والتحكم بالكميات المتاحة" },
    { title: "نقطة البيع الأولى", desc: "ترخيص جهاز الكاشير وطباعة الفواتير اللحظية" },
    { title: "إضافة المنتج الأول", desc: "أول سلعة بالكتالوج، السعر والتكلفة ومستوى المخزون" },
    { title: "دعوة الزملاء", desc: "تأسيس حسابات للكادر والمحاسبين بنظام سهم الصارم للـ RBAC" },
  ];

  const handleNextStep = () => {
    setErrorText(null);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleCompleteAll();
    }
  };

  const handlePrevStep = () => {
    setErrorText(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteAll = async () => {
    setIsSubmitting(true);
    setErrorText(null);
    
    // Simulate compilation of multi-tenant structures
    const tenantId = currentUser.tenant_id;
    const isLocalMode = import.meta.env.VITE_DATA_MODE !== "supabase";
    const isInvalid = isLocalMode ? !tenantId : (!tenantId || tenantId === "tenant-local");
    if (isInvalid) {
      const errStr = "Security Error: Invalid or missing tenant_id.";
      setErrorText(errStr);
      setIsSubmitting(false);
      return;
    }
    
    const company: CompanyProfile = {
      id: `company_${Date.now()}`,
      name: compName,
      companyLegalName: compLegalName,
      crNumber: compCrNumber,
      crDate: new Date().toISOString().split("T")[0],
      crExpiryDate: "1450-01-01",
      vatNumber: compVatNumber,
      unifiedNumber700: compUnified700,
      address: compAddress,
      managerName: currentUser.fullName,
      phone: compPhone,
      email: compEmail,
      bankAccount: "SA830400000000000000000",
      status: "active",
      subscriptionPlan: selectedPlan === "A" ? "باقة البداية المجانية" : selectedPlan === "B" ? "سهم الاحترافي Pro" : "سهم النخبة Corporate",
      createdAt: new Date().toISOString().split("T")[0]
    };

    const store: StoreProfile = {
      id: `store_${Date.now()}`,
      name: storeName,
      tradeName: storeName,
      companyLegalName: compLegalName,
      description: storeDesc,
      crNumber: compCrNumber,
      crDate: new Date().toISOString().split("T")[0],
      crExpiryDate: "1450-01-01",
      vatNumber: compVatNumber,
      unifiedNumber700: compUnified700,
      zakatNumber: "",
      maroofNumber: "",
      ministryOfLaborNumber: "",
      establishmentNumber: "",
      phone: compPhone,
      supportPhone: compPhone,
      email: compEmail,
      supportEmail: compEmail,
      website: "",
      address: {
        shortAddress: "RDOD1100",
        buildingNumber: "1100",
        streetName: "طريق الملك عبدالعزيز",
        district: "الصحافة",
        city: branchCity,
        region: "الرياض",
        postalCode: "13321",
        additionalNumber: "1111",
        unitNumber: "1",
        country: "المملكة العربية السعودية",
        mapLink: "https://maps.google.com",
      },
      bankAccounts: [],
      documents: [],
      branches: [],
      warehouses: [],
      users: [Number(currentUser.id) || Date.now()],
      platforms: {
        salla: { isConnected: false, taxNumber: "" },
        zid: { isConnected: false, storeId: "" },
        shopify: { isConnected: false, storeUrl: "" },
        wooCommerce: { isConnected: false, consumerKey: "", consumerSecret: "" }
      },
      isActive: true,
      isDefault: true,
      companyId: company.id
    };

    const branch = {
      id: `br_${Date.now()}`,
      name: branchName,
      city: branchCity,
      address: branchAddress,
      phone: branchPhone,
      manager: currentUser.fullName,
      employees: [currentUser.fullName, empName],
      workingHours: branchHrs,
      associatedWh: `wh_${Date.now()}`,
      storeId: store.id,
      status: "نشط",
      sales: 0,
      profits: 0,
      expenses: 0,
      customersCount: 0,
      isActive: true,
      tenant_id: tenantId
    };

    const warehouse = {
      id: branch.associatedWh,
      name: whName,
      type: "main",
      location: whLocation,
      manager: currentUser.fullName,
      capacity: Number(whCapacity) || 5000,
      store_id: store.id,
      isActive: true,
      items: [
        { productId: `prod_${Date.now()}`, stock: Number(prodStock) || 100 }
      ],
      tenant_id: tenantId
    };

    const posUnit = {
      id: `pos_${Date.now()}`,
      name: posName,
      branchId: branch.id,
      isDefault: true,
      status: "نشط",
      tenant_id: tenantId,
      storeId: store.id,
      store_id: store.id,
      warehouseId: warehouse.id,
      warehouse_id: warehouse.id
    };

    const product: Product = {
      id: warehouse.items[0].productId,
      name: prodName,
      sku: prodSku,
      price: Number(prodPrice) || 120,
      cost: Number(prodCost) || 60,
      stock: Number(prodStock) || 100,
      category: prodCategory,
      store_id: store.id,
      branch_id: branch.id,
      warehouse: warehouse.name,
      productStatus: "published"
    };

    const employee: User = {
      id: `emp_${Date.now()}`,
      fullName: empName,
      username: empUser,
      email: empEmail,
      phone: empPhone,
      password: empPass,
      passwordHash: empPass,
      role: empRole,
      status: "active",
      emailVerified: true,
      mustChangePassword: false,
      allowedStoreIds: [store.id],
      allowedBranchIds: [branch.id],
      allowedWarehouseIds: [warehouse.id],
      allowedPosIds: [posUnit.id],
      permissions: empRole === "cashier"
        ? ["pos:access", "pos:sell", "products:view"]
        : [
            "dashboard:view", "setup:view", "integrations:view", "help:view",
            "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
            "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
            "products:view", "products:create", "products:update", "products:delete",
            "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
            "settings:manage", "integrations:manage"
          ],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.fullName,
      tenant_id: tenantId
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await onComplete({
        selectedPlan,
        company,
        store,
        branch,
        warehouse,
        posUnit,
        product,
        employee
      });
    } catch (err: any) {
      console.error("Error completing onboarding wizard:", err);
      setErrorText(err.message || "حدث خطأ غير متوقع أثناء تفعيل المنشأة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D17] text-white flex flex-col font-sans select-none antialiased">
      {/* Upper Navigation Header */}
      <header className="border-b border-[#1C2A40]/80 bg-[#0F1724]/90 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-[#D4AF37] animate-spin-slow" />
          <div>
            <h1 className="text-sm font-black tracking-tight flex items-center gap-2">
              <span>Sahm OS • مرشد التأسيس والتجهيز</span>
              <span className="text-[9px] bg-yellow-500/10 text-yellow-500 font-extrabold px-1.5 py-0.5 rounded-full uppercase border border-yellow-500/20">Founding Mode</span>
            </h1>
            <p className="text-[10px] text-gray-400 mt-0.5">خطوات مبرمجة خطوة بخطوة لبدء عمل تجاري متعدد الفروع ومؤتمت كلياً</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-gray-400">الشريك المسجل</p>
            <p className="text-xs font-black text-white">{currentUser.fullName}</p>
          </div>
          <button 
            type="button"
            onClick={onLogout}
            className="text-[10px] bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          >
            تسجيل خروج من الجلسة
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* RIGHT SIDEBAR: Steps Progress Panel */}
        <aside className="lg:w-80 shrink-0 bg-[#0F1724] border border-[#1C2A40] rounded-3xl p-5 space-y-4">
          <div className="space-y-1 pb-3 border-b border-[#1C2A40]" dir="rtl">
            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider">التقدم العام للدورة</span>
            <h3 className="text-sm font-bold text-white">اكتمال تهيئة الكيان التجارى</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
          </div>

          <nav className="space-y-2 mt-4" dir="rtl">
            {stepsDetails.map((s, idx) => {
              const itemStep = idx + 1;
              const isActive = step === itemStep;
              const isCompleted = step > itemStep;

              return (
                <div 
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    isActive ? "bg-amber-500/10 border border-amber-500/30" : "border border-transparent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5 ${
                    isCompleted ? "bg-[#D4AF37] text-slate-950" : isActive ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-slate-900 text-gray-500"
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : itemStep}
                  </div>
                  <div>
                    <h4 className={`text-xs font-black transition-colors ${
                      isCompleted ? "text-slate-300 line-through" : isActive ? "text-[#D4AF37]" : "text-gray-400"
                    }`}>
                      {s.title}
                    </h4>
                    <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* LEFT WORKSPACE: Form Wizards */}
        <main className="flex-1 bg-[#0F1724] border border-[#1C2A40] rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
          <div dir="rtl">
            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider">الخطوة {step} من {totalSteps}</span>
            <h2 className="text-xl font-extrabold mt-1 text-[#EDF2FF]">{stepsDetails[step - 1].title}</h2>
            <p className="text-xs text-gray-400 mt-1">{stepsDetails[step - 1].desc}</p>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#1C2A40] to-transparent my-5"></div>

            {/* STEP 1: SUBSCRIPTION PACKAGE SELECTION */}
            {step === 1 && (
              <div className="space-y-6">
                <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                  تتطلب تراخيص منصة سهم OS تحديد باقة للاستهلاك. نحن ندعم البداية المجانية للشركاء الجدد حتى تكتمل مبيعاتك وتثق بنظامنا كلياً.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Free Plan */}
                  <div 
                    onClick={() => setSelectedPlan("A")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === "A" ? "border-[#D4AF37] bg-yellow-500/5 shadow-lg" : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-extrabold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full">باقة مجانية</span>
                      <Compass className="w-5 h-5 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-black text-white">سهم الأساسي Basic</h3>
                    <div className="text-lg font-black text-[#D4AF37] my-2">0 ر.س <span className="text-[10px] text-gray-400">/ شهرياً</span></div>
                    <ul className="space-y-1.5 text-[10px] text-gray-400 mt-3 border-t border-[#1C2A40] pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> كاشير فردي ومحاسب واحد</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> لغاية 1,000 فاتورة ومستند</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> نسخ احتياطي محلي</li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div 
                    onClick={() => setSelectedPlan("B")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      selectedPlan === "B" ? "border-amber-500 bg-amber-500/5 shadow-xl scale-[1.02]" : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                    }`}
                  >
                    <div className="absolute -top-3 left-4 bg-amber-500 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full shadow">الأكثر اختياراً 🔥</div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">الاحترافية</span>
                      <Rocket className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-black text-white">سهم الاحترافي Pro</h3>
                    <div className="text-lg font-black text-[#D4AF37] my-2">199 ر.س <span className="text-[10px] text-gray-400">/ شهرياً</span></div>
                    <ul className="space-y-1.5 text-[10px] text-gray-400 mt-3 border-t border-[#1C2A40] pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> فروع متعددة ومستودعات غير محدودة</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> لغاية 10,000 فاتورة ومستند</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> تحليلات الذكاء المالي وسهم برين</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> مزامنة وتكامل Salla و Zid</li>
                    </ul>
                  </div>

                  {/* Corporate Plan */}
                  <div 
                    onClick={() => setSelectedPlan("C")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === "C" ? "border-purple-500 bg-purple-500/5 shadow-lg" : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-extrabold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">النخبة</span>
                      <Laptop className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-black text-white">سهم النخبة Corporate</h3>
                    <div className="text-lg font-black text-[#D4AF37] my-2">799 ر.س <span className="text-[10px] text-gray-400">/ شهرياً</span></div>
                    <ul className="space-y-1.5 text-[10px] text-gray-400 mt-3 border-t border-[#1C2A40] pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> فواتير ومستخدمين بلا سقف قيود</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> بث كاميرات الفروع الفيدرالي</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-lime-400 shrink-0" /> ربط API مخصص، دعم 24 ساعة</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FIRST COMPANY */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  البيانات القانونية والمنشأة الرئيسية لمجموعتك. يتم ربط هذا السجل في النظام لإصدار المستندات والفوترة الضريبية وإرسال تقارير الهيئة.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم المنشأة التجاري</label>
                    <input 
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الاسم القانوني للشركة</label>
                    <input 
                      type="text"
                      value={compLegalName}
                      onChange={(e) => setCompLegalName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">رقم السجل التجاري CR</label>
                    <input 
                      type="text"
                      value={compCrNumber}
                      onChange={(e) => setCompCrNumber(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الرقم الضريبي الموحد VAT</label>
                    <input 
                      type="text"
                      value={compVatNumber}
                      onChange={(e) => setCompVatNumber(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الرقم الوطني 700 للمجموعات</label>
                    <input 
                      type="text"
                      value={compUnified700}
                      onChange={(e) => setCompUnified700(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">رقم هاتف التواصل الاجتماعي للمؤسسة</label>
                    <input 
                      type="text"
                      value={compPhone}
                      onChange={(e) => setCompPhone(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">العنوان الوطني المختصر الصافي للمنشأة</label>
                    <input 
                      type="text"
                      value={compAddress}
                      onChange={(e) => setCompAddress(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: STORE DETAILS */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  يعد المتجر بمثابة هوية البيع المباشر أو الربط مع السيرفرات التجارية الإلكترونية والقنوات السحابية لفرعك الأول.
                </p>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم المتجر / العلامة التجارية للمبيعات</label>
                    <input 
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full max-w-xl bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-3 text-xs text-white font-bold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">وصف المتجر ونشاطه الرئيسي</label>
                    <textarea 
                      value={storeDesc}
                      onChange={(e) => setStoreDesc(e.target.value)}
                      rows={3}
                      className="w-full max-w-xl bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-3 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FIRST BRANCH */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  الفروع هي صالات عرض البيع بالتجزئة الملموسة. يحتاج الكاشير للتسجيل بفرع محدد لبيع المخزون والحسابات الفرعية.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم الفرع الأول</label>
                    <input 
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">المدينة</label>
                    <select 
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none select-dark"
                    >
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="مكة المكرمة">مكة المكرمة</option>
                      <option value="المدينة المنورة">المدينة المنورة</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">عنوان الفرع وموقعه التفصيلي</label>
                    <input 
                      type="text"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">رقم هاتف الفرع</label>
                    <input 
                      type="text"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">ساعات العمل الرسمية</label>
                    <input 
                      type="text"
                      value={branchHrs}
                      onChange={(e) => setBranchHrs(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: FIRST WAREHOUSE */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  يرتبط كل فرع بمستودع لتخزين السلع وسحب المنتجات أثناء عمليات البيع بالباركود.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم المستودع الأول</label>
                    <input 
                      type="text"
                      value={whName}
                      onChange={(e) => setWhName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">السعة الاستيعابية للمستودع (قطعة)</label>
                    <input 
                      type="number"
                      value={whCapacity}
                      onChange={(e) => setWhCapacity(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">موقع المستودع أو كود الموقع</label>
                    <input 
                      type="text"
                      value={whLocation}
                      onChange={(e) => setWhLocation(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: WAREHOUSE & POS */}
            {step === 6 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  تسمح نقاط البيع (POS) للكاشير بفتح أدراج النقد وإغلاق الورديات اليومية والربط السريع مع الطابعات الحرارية الموصولة.
                </p>

                <div className="space-y-4 pt-2 max-w-xl">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">مسمى جهاز نقطة البيع الأول</label>
                    <input 
                      type="text"
                      value={posName}
                      onChange={(e) => setPosName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-3 text-xs text-white font-bold outline-none"
                      required
                    />
                  </div>
                  <div className="bg-slate-900/60 border border-[#1C2A40] rounded-2xl p-4 flex gap-3.5">
                    <span className="text-2xl mt-0.5">📟</span>
                    <div className="text-xs">
                      <h4 className="font-bold text-white mb-1">الترخيص الفوري للجهاز</h4>
                      <p className="text-gray-400 leading-relaxed text-[11px]">
                        عند تفعيل المتجر والفرع، تمنحك هذه الصلاحية ترخيصاً تجريبياً تلقائياً يربط جهاز البيع مباشرة بسجل فواتير الهيئة المحمي (مبسطة).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: FIRST PRODUCT */}
            {step === 7 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  البوابة السحرية لمجموعة منتجاتك. أدخل أول منتج في كتالوج الأرفف والمخزن لتبدأ تجربة الكاشير وإصدار فاتورتك الأولى!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم المنتج</label>
                    <input 
                      type="text"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none font-bold"
                      placeholder="مثال: دهن عود هندي فاخر"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الرمز التعريفي / الباركود SKU</label>
                    <input 
                      type="text"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">سعر البيع النهائي (شامل الضريبة)</label>
                    <input 
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">تكلفة الشراء / تكلفة السلعة</label>
                    <input 
                      type="number"
                      value={prodCost}
                      onChange={(e) => setProdCost(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الكمية الأولى المدخلة بالمستودع</label>
                    <input 
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الفئة / التصنيف</label>
                    <input 
                      type="text"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: INVITE EMPLOYEES */}
            {step === 8 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  أنشئ أول حساب لموظفيك (كاشير، محاسب، أو مدير فرع) ليتمكنوا من ولوج النظام وتحميل البيانات الخاصة بفرعهم دون تداخل أو تخطي الصلاحيات.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم الموظف الأول الكامل</label>
                    <input 
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">اسم المستخدم للدخول</label>
                    <input 
                      type="text"
                      value={empUser}
                      onChange={(e) => setEmpUser(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">البريد الإلكتروني التجاري</label>
                    <input 
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">كلمة المرور الافتراضية</label>
                    <input 
                      type="text"
                      value={empPass}
                      onChange={(e) => setEmpPass(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">الدور الوظيفي والصلاحيات الأولى</label>
                    <select 
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white outline-none select-dark"
                    >
                      <option value="cashier">كاشير مبيعات (POS Operator)</option>
                      <option value="accountant">محاسب المنشأة (Accountant)</option>
                      <option value="branch_manager">مدير الفرع المباشر (Branch Manager)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">رقم الهاتف الجوال</label>
                    <input 
                      type="text"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      className="w-full bg-[#151F30] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorText && (
            <div className="mt-6 p-4 rounded-2xl bg-red-950/35 border border-red-800/40 text-red-200 text-xs leading-relaxed flex items-start gap-3" dir="rtl">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <h4 className="font-bold text-red-400 mb-1">فشلت عملية حفظ وتأسيس البيانات:</h4>
                <p>{errorText}</p>
              </div>
            </div>
          )}

          {/* LOWER WORKSPACE ACTIONS - Prev/Next Controllers */}
          <div className="mt-8 pt-4 border-t border-[#1C2A40]/50 flex justify-between items-center" dir="rtl">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={step === 1 || isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-slate-900 border border-[#1C2A40] hover:bg-slate-800 disabled:opacity-30 cursor-pointer text-xs font-bold text-gray-300 transition-all flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#E2C974] to-[#B08F26] hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 border-none"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>جاري تسجيل وتعميد المنشأة...</span>
                </>
              ) : (
                <>
                  <span>{step === totalSteps ? "حفظ وتفعيل دورة سهم بالكامل 👑 🔒" : "المتابعة والخطوة التالية"}</span>
                  {step !== totalSteps && <ArrowLeft className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
