import React, { useState, useEffect } from "react";
import { Product, Invoice, ThemeColors, User, Branch, Warehouse, StockTransfer, RolePermission, AddressProfile } from "../types";
import { 
  Building2, Warehouse as WarehouseIcon, ArrowLeftRight, ShieldCheck, 
  MapPin, Users, TrendingUp, AlertTriangle, Cpu, Plus, Edit3, Trash2, 
  ToggleLeft, Check, RefreshCw, BarChart3, Info, Eye, ClipboardList, Copy
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import ImageUploader from "./ImageUploader";
import NationalAddressForm from "./NationalAddressForm";

interface BranchWarehouseManagerProps {
  products: Product[];
  setProducts: (prods: Product[]) => void;
  invoices: Invoice[];
  setInvoices: (invs: Invoice[]) => void;
  theme: ThemeColors;
  user: User;
}

// Initial default branches
const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "br_riyadh_main",
    name: "فرع الرياض الرئيسي",
    city: "الرياض",
    address: "طريق الملك فهد، حي المروج",
    phone: "0112445566",
    manager: "عبدالله بن فهد",
    employees: ["صالح الشمري", "محمد العتيبي", "خالد الحربي", "نورة القحطاني"],
    workingHours: "08:00 ص - 11:00 م",
    sales: 145000,
    profits: 48000,
    expenses: 12000,
    customersCount: 380,
    isActive: true
  },
  {
    id: "br_jeddah_int",
    name: "فرع جدة - ردسي مول",
    city: "جدة",
    address: "طريق الملك عبدالعزيز، ردسي مول",
    phone: "0123554433",
    manager: "أنس القرني",
    employees: ["مازن السهلي", "سهام القحطاني", "بدر الغامدي"],
    workingHours: "10:00 ص - 12:00 م",
    sales: 98000,
    profits: 31000,
    expenses: 15000,
    customersCount: 220,
    isActive: true
  },
  {
    id: "br_dammam",
    name: "فرع مجمع مارينا مول",
    city: "الدمام",
    address: "طريق الخليج العريق، حي الكورنيش",
    phone: "0134442211",
    manager: "رائد المطيري",
    employees: ["سمير الدوسري", "سلطان العتيبي"],
    workingHours: "09:00 ص - 11:00 م",
    sales: 42000,
    profits: 11000,
    expenses: 7000,
    customersCount: 95,
    isActive: true
  },
  {
    id: "br_makkah",
    name: "فرع العتبيات - مكة المكرمة",
    city: "مكة المكرمة",
    address: "أبراج البيت، الحرم",
    phone: "0128889988",
    manager: "شرف الهذلي",
    employees: ["عمار الصاعدي", "هيثم الحربي"],
    workingHours: "24 ساعة / متواصل",
    sales: 185000,
    profits: 62000,
    expenses: 19000,
    customersCount: 520,
    isActive: false // suspended branch example
  }
];

// Initial default warehouses
const DEFAULT_WAREHOUSES: Warehouse[] = [
  {
    id: "wh_central_riyadh",
    name: "مستودع سهم المركزي - الرياض",
    type: "main",
    location: "صناعية السلي الجديدة، الرياض",
    manager: "صالح الفهيد",
    capacity: 10000,
    items: [
      { productId: "1", stock: 150 },
      { productId: "2", stock: 200 },
      { productId: "3", stock: 12 },
      { productId: "4", stock: 45 }
    ]
  },
  {
    id: "wh_jeddah_sub",
    name: "مستودع الساحل الغربي - جدة",
    type: "sub",
    location: "حي الخمرة، جدة",
    manager: "سعيد باوزير",
    capacity: 5000,
    items: [
      { productId: "1", stock: 80 },
      { productId: "2", stock: 95 },
      { productId: "3", stock: 40 },
      { productId: "4", stock: 18 }
    ]
  },
  {
    id: "wh_dammam_sub",
    name: "مستودع فرع المنطقة الشرقية",
    type: "branch",
    location: "حي الأثير، الدمام",
    manager: "رائد المطيري",
    capacity: 2500,
    items: [
      { productId: "1", stock: 45 },
      { productId: "2", stock: 50 },
      { productId: "3", stock: 10 },
      { productId: "4", stock: 15 }
    ]
  }
];

// Initial default stock transfers
const DEFAULT_TRANSFERS: StockTransfer[] = [
  {
    id: "tr_001",
    transferNo: "STK-TRN-9844",
    fromType: "warehouse",
    fromId: "wh_central_riyadh",
    fromName: "مستودع سهم المركزي - الرياض",
    toType: "warehouse",
    toId: "wh_jeddah_sub",
    toName: "مستودع الساحل الغربي - جدة",
    productId: "1",
    productName: "قهوة عربية فاخرة",
    qty: 50,
    status: "approved",
    date: "2026-05-18",
    notes: "الموازنة الدورية لمستودع المنطقة الغربية لتلبية طلبات الكاشير لردسي مول.",
    historyLogs: [
      "2026-05-18: تم إنشاء طلب التحويل بواسطه عبدالله الفهد الرئيسي",
      "2026-05-18: تم اعتماد وتمرير الشحنة بواسطة أمين مستودع الرياض سعيد الفهد",
      "2026-05-18: تم استلام وحصر البضاعة بنجاح بمخازن جدة"
    ]
  },
  {
    id: "tr_002",
    transferNo: "STK-TRN-5541",
    fromType: "warehouse",
    fromId: "wh_central_riyadh",
    fromName: "مستودع سهم المركزي - الرياض",
    toType: "warehouse",
    toId: "wh_dammam_sub",
    toName: "مستودع فرع المنطقة الشرقية",
    productId: "3",
    productName: "تمر مجدول سكري",
    qty: 15,
    status: "pending",
    date: "2026-06-01",
    notes: "تحويل عاجل لتغطية عجز التمر في فرع مارينا مول بالدمام.",
    historyLogs: [
      "2026-06-01: تم التوجيه والطلب بواسطة نظام الأتمتة المتقدم (الذكاء الاصطناعي لسهم)"
    ]
  }
];

// Default permissions setup for the 8 roles listed (الوحدة الرابعة)
const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    role: "مالك النظام",
    roleNameAr: "مالك النظام (Owner)",
    modules: { dashboard: true, invoices: true, products: true, customers: true, suppliers: true, branches: true, warehouses: true, aiHub: true, settings: true },
    actions: { canAddInvoice: true, canAddProduct: true, canDeleteProduct: true, canDoTransfer: true, canApproveTransfer: true }
  },
  {
    role: "مدير عام",
    roleNameAr: "المدير العام (General Manager)",
    modules: { dashboard: true, invoices: true, products: true, customers: true, suppliers: true, branches: true, warehouses: true, aiHub: true, settings: true },
    actions: { canAddInvoice: true, canAddProduct: true, canDeleteProduct: true, canDoTransfer: true, canApproveTransfer: true }
  },
  {
    role: "مدير فرع",
    roleNameAr: "مدير الفرع (Branch Manager)",
    modules: { dashboard: true, invoices: true, products: true, customers: true, suppliers: false, branches: true, warehouses: true, aiHub: false, settings: false },
    actions: { canAddInvoice: true, canAddProduct: false, canDeleteProduct: false, canDoTransfer: true, canApproveTransfer: false }
  },
  {
    role: "محاسب",
    roleNameAr: "المحاسب المالي (Accountant)",
    modules: { dashboard: true, invoices: true, products: true, customers: true, suppliers: true, branches: false, warehouses: false, aiHub: false, settings: false },
    actions: { canAddInvoice: true, canAddProduct: false, canDeleteProduct: false, canDoTransfer: false, canApproveTransfer: false }
  },
  {
    role: "كاشير",
    roleNameAr: "الكاشير POS (Cashier)",
    modules: { dashboard: false, invoices: true, products: true, customers: true, suppliers: false, branches: false, warehouses: false, aiHub: false, settings: false },
    actions: { canAddInvoice: true, canAddProduct: false, canDeleteProduct: false, canDoTransfer: false, canApproveTransfer: false }
  },
  {
    role: "أمين مستودع",
    roleNameAr: "أمين المستودع (Warehouse Keeper)",
    modules: { dashboard: false, invoices: false, products: true, customers: false, suppliers: true, branches: false, warehouses: true, aiHub: false, settings: false },
    actions: { canAddInvoice: false, canAddProduct: true, canDeleteProduct: false, canDoTransfer: true, canApproveTransfer: true }
  },
  {
    role: "موظف خدمة عملاء",
    roleNameAr: "خدمة العملاء (Customer Support)",
    modules: { dashboard: false, invoices: true, products: false, customers: true, suppliers: false, branches: false, warehouses: false, aiHub: false, settings: false },
    actions: { canAddInvoice: false, canAddProduct: false, canDeleteProduct: false, canDoTransfer: false, canApproveTransfer: false }
  },
  {
    role: "مسوق",
    roleNameAr: "مدير تسويق (Marketer)",
    modules: { dashboard: true, invoices: false, products: true, customers: true, suppliers: false, branches: false, warehouses: false, aiHub: true, settings: false },
    actions: { canAddInvoice: false, canAddProduct: false, canDeleteProduct: false, canDoTransfer: false, canApproveTransfer: false }
  }
];

export default function BranchWarehouseManager({
  products,
  setProducts,
  invoices,
  setInvoices,
  theme,
  user
}: BranchWarehouseManagerProps) {
  // Tabs Definition
  const [managerTab, setManagerTab] = useState<"map" | "dashboard" | "branches" | "warehouses" | "transfers" | "permissions" | "ai">("map");

  // Dynamic stores
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem("sahm_web_branches");
    return saved ? JSON.parse(saved) : DEFAULT_BRANCHES;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem("sahm_web_warehouses");
    return saved ? JSON.parse(saved) : DEFAULT_WAREHOUSES;
  });

  const [transfers, setTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem("sahm_web_transfers");
    return saved ? JSON.parse(saved) : DEFAULT_TRANSFERS;
  });

  const [permissions, setPermissions] = useState<RolePermission[]>(() => {
    const saved = localStorage.getItem("sahm_web_role_permissions");
    return saved ? JSON.parse(saved) : DEFAULT_PERMISSIONS;
  });

  // Persist states helper
  useEffect(() => {
    localStorage.setItem("sahm_web_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("sahm_web_warehouses", JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem("sahm_web_transfers", JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem("sahm_web_role_permissions", JSON.stringify(permissions));
  }, [permissions]);

  // States for Modals/Creators
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  // Branch state management
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCity, setBranchCity] = useState("الرياض");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchManager, setBranchManagerName] = useState("");
  const [branchHours, setBranchHours] = useState("09:00 ص - 11:00 م");
  const [branchImageUrl, setBranchImageUrl] = useState<string | undefined>(undefined);
  const [branchAddressProfile, setBranchAddressProfile] = useState<AddressProfile | undefined>(undefined);

  // Transfer Employees State
  const [showTransferEmployee, setShowTransferEmployee] = useState(false);
  const [employeeToMove, setEmployeeToMove] = useState("");
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");

  // Warehouse state management
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [whName, setWhName] = useState("");
  const [whType, setWhType] = useState<'main' | 'sub' | 'branch'>("sub");
  const [whLocation, setWhLocation] = useState("");
  const [whManager, setWhManager] = useState("");
  const [whCapacity, setWhCapacity] = useState(5000);

  // Stock Transfer state management
  const [showAddTransfer, setShowAddTransfer] = useState(false);
  const [trnFrom, setTrnFrom] = useState("");
  const [trnTo, setTrnTo] = useState("");
  const [trnProduct, setTrnProduct] = useState("");
  const [trnQty, setTrnQty] = useState(1);
  const [trnNotes, setTrnNotes] = useState("");

  // Map state interactive helper
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>("br_riyadh_main");

  // Active selected warehouse and custom tools
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("wh_central_riyadh");
  const [whProductFilter, setWhProductFilter] = useState<"all" | "low" | "out" | "available" | "active">("all");
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Dynamic Branch Workspace state additions
  const [selectedBranchId, setSelectedBranchId] = useState<string>("br_riyadh_main");
  const [branchProductFilter, setBranchProductFilter] = useState<"all" | "low" | "top" | "slow" | "out">("all");
  const [branchStocks, setBranchStocks] = useState<{[branchId: string]: {[productId: string]: number}}>(() => {
    const saved = localStorage.getItem("sahm_web_branch_stocks");
    if (saved) return JSON.parse(saved);
    return {
      "br_riyadh_main": {
        "1": 120, // Cafe
        "2": 45,  // Dates
        "3": 0,   // Accessories
        "4": 65
      },
      "br_jeddah_int": {
        "1": 35,
        "2": 110,
        "3": 12
      },
      "br_dammam": {
        "1": 0,
        "2": 6
      },
      "br_makkah": {
        "1": 180,
        "2": 200,
        "3": 55
      }
    };
  });

  useEffect(() => {
    localStorage.setItem("sahm_web_branch_stocks", JSON.stringify(branchStocks));
  }, [branchStocks]);

  const [showAddProductToBranchModal, setShowAddProductToBranchModal] = useState(false);
  const [newBranchProductId, setNewBranchProductId] = useState("");
  const [newBranchProductStock, setNewBranchProductStock] = useState<number>(50);

  const [showPOSModal, setShowPOSModal] = useState(false);
  const [posProduct, setPosProduct] = useState("");
  const [posQty, setPosQty] = useState(1);
  const [posCustomer, setPosCustomer] = useState("عميل نقدي سريع");
  
  // States for Inventory physical count (جرد) and product inclusion
  const [showDirectAdjustModal, setShowDirectAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQtyRaw, setAdjustQtyRaw] = useState<number>(100);

  const [showAddProductToWhModal, setShowAddProductToWhModal] = useState(false);
  const [newWhProductId, setNewWhProductId] = useState("");
  const [newWhProductStock, setNewWhProductStock] = useState<number>(50);

  // States for editing product specs (تعديل مواصفات المنتج)
  const [editingWhProduct, setEditingWhProduct] = useState<Product | null>(null);
  const [editWhProductName, setEditWhProductName] = useState("");
  const [editWhProductSku, setEditWhProductSku] = useState("");
  const [editWhProductPrice, setEditWhProductPrice] = useState(0);
  const [editWhProductCost, setEditWhProductCost] = useState(0);
  const [editWhProductCategory, setEditWhProductCategory] = useState("");
  const [editWhProductStock, setEditWhProductStock] = useState(0);

  // AI Daily generated reports content state
  const [aiReportType, setAiReportType] = useState<"branch" | "warehouse">("branch");
  const [aiReportOutput, setAiReportOutput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ----------------------------------------------------
  // تصدير المعارض / الفروع
  // ----------------------------------------------------
  const branchExportColumns = [
    { key: "id", label: "مُعرّف الفرع" },
    { key: "name", label: "اسم المعرض / الفرع" },
    { key: "city", label: "المدينة" },
    { key: "address", label: "العنوان" },
    { key: "phone", label: "رقم الجوال" },
    { key: "manager", label: "المدير المسؤول" },
    { key: "sales", label: "المبيعات (ر.س)", format: (v: number) => (v ?? 0).toLocaleString("ar-SA") + " ر.س" },
    { key: "profits", label: "الأرباح (ر.س)", format: (v: number) => (v ?? 0).toLocaleString("ar-SA") + " ر.س" },
    { key: "isActive", label: "شغال / معلق", format: (v: boolean) => v ? "نشط" : "معلق" }
  ];

  const exportBranchesExcel = () => {
    exportToExcel(branches, branchExportColumns, "دليل_الفروع_" + new Date().toISOString().slice(0, 10));
  };
  const exportBranchesPDF = () => {
    exportToPDF("سجل المعارض والصالات والبيانات التشغيلية 🏢", branchExportColumns, branches, "الأداء الكلي ومسؤولي وعناوين الفروع");
  };

  // ----------------------------------------------------
  // تصدير المستودعات والمخازن
  // ----------------------------------------------------
  const warehouseExportColumns = [
    { key: "id", label: "رمز المستودع" },
    { key: "name", label: "اسم المستودع" },
    { key: "type", label: "النوع", format: (v: string) => v === 'main' ? "رئيسي" : "فرعي" },
    { key: "location", label: "الموقع الجغرافي" },
    { key: "manager", label: "المدير المسؤول" },
    { key: "capacity", label: "السعة التخزينية القصوى" }
  ];

  const exportWarehousesExcel = () => {
    exportToExcel(warehouses, warehouseExportColumns, "دليل_المستودعات_" + new Date().toISOString().slice(0, 10));
  };
  const exportWarehousesPDF = () => {
    exportToPDF("سجل مخازن ومستودعات التوريد الرسمية 📦", warehouseExportColumns, warehouses, "السعات الكلية والمدراء وعناوين المستودعات التابعة");
  };

  // ----------------------------------------------------
  // تصدير الحركة ومناقلة البضائع
  // ----------------------------------------------------
  const transferExportColumns = [
    { key: "id", label: "رقم المناقلة" },
    { key: "productId", label: "معرّف المنتج" },
    { key: "qty", label: "الكمية المنقولة" },
    { key: "fromLocation", label: "من موقع" },
    { key: "toLocation", label: "إلى موقع" },
    { key: "date", label: "التاريخ" },
    { key: "status", label: "الحالة الحالية" },
    { key: "notes", label: "ملاحظات المناقلة" }
  ];

  const exportTransfersExcel = () => {
    exportToExcel(transfers, transferExportColumns, "المناقلات_المخزنية_" + new Date().toISOString().slice(0, 10));
  };
  const exportTransfersPDF = () => {
    exportToPDF("سجل حركة مناقلات البضائع بين الفروع والمخازن 🔄", transferExportColumns, transfers, "جدول التحويلات والتوريدات الدورية المرصودة بنجاح");
  };

  // ━━━━━━━ CORE LOGIC ACTIONS ━━━━━━━

  // POS Complete Integration Hook - recalculates summary totals instantly from invoices list (الوحدة العاشرة)
  const calculateLiveTotals = () => {
    const totalSalesFromPOSAndInvoices = invoices.reduce((acc, inv) => acc + (inv.type === 'sale' ? inv.total : 0), 0);
    return {
      sales: totalSalesFromPOSAndInvoices + 470000, // static offset + live invoices
      profits: Math.round((totalSalesFromPOSAndInvoices + 470000) * 0.35),
      ordersCount: invoices.length + 1220,
    };
  };

  const totals = calculateLiveTotals();

  // Create branch
  const handleAddNewBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    const newBr: Branch = {
      id: "br_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
      name: branchName.trim(),
      city: branchCity,
      address: branchAddress || "غير محدد",
      phone: branchPhone || "0500000000",
      manager: branchManager || "بانتظار التعيين",
      employees: [],
      workingHours: branchHours,
      sales: 0,
      profits: 0,
      expenses: 0,
      customersCount: 0,
      isActive: true,
      imageUrl: branchImageUrl,
      addressProfile: branchAddressProfile
    };

    setBranches([...branches, newBr]);
    setShowAddBranch(false);
    setBranchName("");
    setBranchAddress("");
    setBranchPhone("");
    setBranchManagerName("");
    setBranchImageUrl(undefined);
    setBranchAddressProfile(undefined);
    addToast(`🏢 تم إنشاء فرع جديد بنجاح: "${newBr.name}"`, "success");
  };

  // Suspend or Toggle Branch Status
  const handleToggleBranchActive = (id: string) => {
    setBranches(branches.map(b => {
      if (b.id === id) {
        const nextState = !b.isActive;
        addToast(
          nextState ? `🟢 تم تفعيل وإطلاق خدمات فرع "${b.name}"` : `🔴 تم تعليق وإيقاف خدمات فرع "${b.name}" مؤقتاً`,
          "info"
        );
        return { ...b, isActive: nextState };
      }
      return b;
    }));
  };

  // Delete Branch
  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف فرع "${name}" بشكل نهائي؟`)) {
      setBranches(branches.filter(b => b.id !== id));
      addToast(`🗑️ تم إزالة بيانات الفرع نهائياً.`, "error");
    }
  };

  // Transfer Employee
  const handleTransferEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeToMove || !fromBranchId || !toBranchId) {
      addToast("⚠️ يرجى تعبئة كافة حقول نقل الكادر.", "error");
      return;
    }
    if (fromBranchId === toBranchId) {
      addToast("⚠️ لا يمكن نقل الموظف لنفس الفرع المتواجد به حالياً.", "error");
      return;
    }

    // Process fromBranch removal and toBranch insertion
    setBranches(branches.map(b => {
      if (b.id === fromBranchId) {
        return {
          ...b,
          employees: b.employees.filter(emp => emp !== employeeToMove)
        };
      }
      if (b.id === toBranchId) {
        return {
          ...b,
          employees: [...b.employees, employeeToMove]
        };
      }
      return b;
    }));

    setShowTransferEmployee(false);
    setEmployeeToMove("");
    addToast(`🎓 تم نقل الموظف "${employeeToMove}" وتحديث جداول المناوبات فوراً!`, "success");
  };

  // Add Warehouse
  const handleAddNewWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim()) return;

    const newWh: Warehouse = {
      id: "wh_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
      name: whName.trim(),
      type: whType,
      location: whLocation || "المنطقة الصناعية",
      manager: whManager || "غير محدد",
      capacity: whCapacity,
      items: products.map(p => ({ productId: p.id, stock: 0 }))
    };

    setWarehouses([...warehouses, newWh]);
    setShowAddWarehouse(false);
    setWhName("");
    setWhLocation("");
    setWhManager("");
    addToast(`📦 تم تدشين مستودع جديد وسيعمل بالطاقة المقررة: "${newWh.name}"`, "success");
  };

  // Create Stock Transfer
  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trnFrom || !trnTo || !trnProduct || trnQty <= 0) {
      addToast("⚠️ يرجى التأكد من اختيار جهات النقل والكمية الصحيحة.", "error");
      return;
    }

    const prod = products.find(p => p.id === trnProduct);
    if (!prod) return;

    // Retrieve Source to verify stock
    const sourceWh = warehouses.find(w => w.id === trnFrom);
    const sourceBr = branches.find(b => b.id === trnFrom);
    
    if (sourceWh) {
      const sourceItem = sourceWh.items.find(i => i.productId === trnProduct);
      if (!sourceItem || sourceItem.stock < trnQty) {
        addToast(`❌ رصيد المنتج غير كافي في المستودع المصدري (المتوفر: ${sourceItem ? sourceItem.stock : 0})`, "error");
        return;
      }
    } else if (sourceBr) {
      const sourceBrStock = branchStocks[trnFrom]?.[trnProduct] || 0;
      if (sourceBrStock < trnQty) {
        addToast(`❌ رصيد المنتج غير كافي في المعرض المصدري (المتوفر: ${sourceBrStock})`, "error");
        return;
      }
    }

    const targetWh = warehouses.find(w => w.id === trnTo);
    const targetBr = branches.find(b => b.id === trnTo);
    const destName = targetWh ? targetWh.name : (targetBr ? targetBr.name : "الفرع المحدد");

    const newTrn: StockTransfer = {
      id: "trn_" + Date.now().toString(),
      transferNo: "STK-TRN-" + Math.floor(1000 + Math.random() * 9000),
      fromType: sourceWh ? "warehouse" : "branch",
      fromId: trnFrom,
      fromName: sourceWh ? sourceWh.name : (sourceBr ? sourceBr.name : "جهة الشحن المصدرية"),
      toType: targetWh ? "warehouse" : "branch",
      toId: trnTo,
      toName: destName,
      productId: trnProduct,
      productName: prod.name,
      qty: trnQty,
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      notes: trnNotes,
      historyLogs: [
        `${new Date().toLocaleDateString("ar-SA")}: تم تقديم طلب مناقلة بضاعة للفرع لتعزيز الأرصدة.`
      ]
    };

    setTransfers([newTrn, ...transfers]);
    setShowAddTransfer(false);
    setTrnNotes("");
    setTrnQty(1);
    addToast(`🔄 تم تسجيل طلب المناقلة ${newTrn.transferNo} بانتظار الاعتماد.`, "info");
  };

  // Approve Stock Transfer
  const handleApproveTransfer = (id: string) => {
    const trn = transfers.find(t => t.id === id);
    if (!trn || trn.status !== "pending") return;

    // Verify stock at source
    let sourceStock = 0;
    const isSourceWh = warehouses.some(w => w.id === trn.fromId);
    if (isSourceWh) {
      const sourceWh = warehouses.find(w => w.id === trn.fromId);
      const item = sourceWh?.items.find(i => i.productId === trn.productId);
      sourceStock = item ? item.stock : 0;
    } else {
      // from branch
      const branchSList = branchStocks[trn.fromId] || {};
      sourceStock = branchSList[trn.productId] || 0;
    }

    if (sourceStock < trn.qty) {
      addToast("❌ فشل الاعتماد: رصيد البضائع نفد من الجهة المصدرية قبل تمرير الطلب!", "error");
      return;
    }

    // Deduct from source
    let updatedWarehouses = [...warehouses];
    let updatedBranchStocks = { ...branchStocks };

    if (isSourceWh) {
      updatedWarehouses = warehouses.map(w => {
        if (w.id === trn.fromId) {
          return {
            ...w,
            items: w.items.map(i => i.productId === trn.productId ? { ...i, stock: i.stock - trn.qty } : i)
          };
        }
        return w;
      });
    } else {
      // from branch
      const fromBStocks = { ...(updatedBranchStocks[trn.fromId] || {}) };
      fromBStocks[trn.productId] = (fromBStocks[trn.productId] || 0) - trn.qty;
      updatedBranchStocks[trn.fromId] = fromBStocks;
    }

    // Add to destination
    const isTargetWh = warehouses.some(w => w.id === trn.toId);
    if (isTargetWh) {
      updatedWarehouses = updatedWarehouses.map(w => {
        if (w.id === trn.toId) {
          const itemExists = w.items.some(i => i.productId === trn.productId);
          if (itemExists) {
            return {
              ...w,
              items: w.items.map(i => i.productId === trn.productId ? { ...i, stock: i.stock + trn.qty } : i)
            };
          } else {
            return {
              ...w,
              items: [...w.items, { productId: trn.productId, stock: trn.qty }]
            };
          }
        }
        return w;
      });
    } else {
      // to branch
      const toBStocks = { ...(updatedBranchStocks[trn.toId] || {}) };
      toBStocks[trn.productId] = (toBStocks[trn.productId] || 0) + trn.qty;
      updatedBranchStocks[trn.toId] = toBStocks;

      // Also add to global product stock if transferred directly to branch
      const updatedProducts = products.map(p => {
        if (p.id === trn.productId) {
          return { ...p, stock: p.stock + trn.qty };
        }
        return p;
      });
      setProducts(updatedProducts);
    }

    // Update states & persist
    setWarehouses(updatedWarehouses);
    setBranchStocks(updatedBranchStocks);
    localStorage.setItem("sahm_web_branch_stocks", JSON.stringify(updatedBranchStocks));

    setTransfers(transfers.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: "approved",
          historyLogs: [
            ...t.historyLogs,
            `${new Date().toLocaleDateString("ar-SA")}: تم اعتماد الشحنة رسمياً وتحديث الأرصدة اللوجستية.`
          ]
        };
      }
      return t;
    }));

    addToast(`✓ تم مطابقة البضائع واعتماد حركة المخزون رقم ${trn.transferNo}!`, "success");
  };

  // Reject Stock Transfer
  const handleRejectTransfer = (id: string) => {
    setTransfers(transfers.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: "rejected",
          historyLogs: [
            ...t.historyLogs,
            `${new Date().toLocaleDateString("ar-SA")}: تم رفض العملية وإيداع الطلب تحت المراجعة الفنية.`
          ]
        };
      }
      return t;
    }));
    addToast("🔄 تم رفض طلب التحويل وإرجاع المستند للمسؤول.", "info");
  };

  // Add a product with initial stock directly inside a warehouse
  const handleAddProductToWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhProductId || newWhProductStock < 0) return;
    
    // Check if the product is already linked to the current warehouse
    const wh = warehouses.find(w => w.id === selectedWarehouseId);
    if (!wh) return;
    
    const exists = wh.items.some(i => i.productId === newWhProductId);
    if (exists) {
      addToast("⚠️ هذا المنتج مسجل بالفعل في المستودع المحدد. يمكنك تعديل الكمية مباشرة.", "error");
      return;
    }
    
    const updated = warehouses.map(w => {
      if (w.id === selectedWarehouseId) {
        return {
          ...w,
          items: [...w.items, { productId: newWhProductId, stock: newWhProductStock }]
        };
      }
      return w;
    });
    
    setWarehouses(updated);
    setShowAddProductToWhModal(false);
    setNewWhProductId("");
    setNewWhProductStock(50);
    addToast("✓ تم إضافة الصنف بنجاح إلى رصيد المستودع وتنبيه الموظفين.", "success");
  };

  // Add a product with initial stock directly inside a branch
  const handleAddProductToBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !newBranchProductId) return;

    setBranchStocks(prev => {
      const currentBranch = prev[selectedBranchId] || {};
      const updated = {
        ...prev,
        [selectedBranchId]: {
          ...currentBranch,
          [newBranchProductId]: newBranchProductStock
        }
      };
      localStorage.setItem("sahm_web_branch_stocks", JSON.stringify(updated));
      return updated;
    });

    setShowAddProductToBranchModal(false);
    setNewBranchProductId("");
    setNewBranchProductStock(50);
    addToast("✓ تم ربط الصنف بنجاح بنظام جرد المعرض وتحديث الأرصدة.", "success");
  };

  // Perform quick POS sale inside selected branch (Requirement 8)
  const handleBranchSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !posProduct || posQty <= 0) {
      addToast("⚠️ يرجى تعبئة كافة الحقول بشكل صحيح للبيع.", "error");
      return;
    }

    const prod = products.find(p => p.id === posProduct);
    if (!prod) return;

    const currentBranchStock = branchStocks[selectedBranchId]?.[posProduct] || 0;
    if (currentBranchStock < posQty) {
      addToast(`❌ رصيد غير كافي بالمعرض الحالي (المتوفر: ${currentBranchStock} وحدة)`, "error");
      return;
    }

    // Deduct stock quantity
    const updatedStocks = { ...branchStocks };
    updatedStocks[selectedBranchId] = {
      ...updatedStocks[selectedBranchId],
      [posProduct]: currentBranchStock - posQty
    };
    setBranchStocks(updatedStocks);
    localStorage.setItem("sahm_web_branch_stocks", JSON.stringify(updatedStocks));

    // Calculate sum
    const totalAmount = prod.price * posQty;

    // Register dynamic sale invoice linked to branch
    const newInvoice: Invoice = {
      id: "INV-" + (invoices.length + 101) + "_" + Math.floor(Math.random() * 100),
      type: "sale",
      customer: posCustomer || "عميل نقدي سريع",
      date: new Date().toISOString().split('T')[0],
      total: totalAmount,
      status: "مدفوع",
      branch_id: selectedBranchId,
      items: [
        {
          name: prod.name,
          qty: posQty,
          price: prod.price,
          total: totalAmount
        }
      ]
    };

    setInvoices([newInvoice, ...invoices]);

    // Fast-track add sales/profits metrics to the custom branch object
    const updatedBranches = branches.map(b => {
      if (b.id === selectedBranchId) {
        return {
          ...b,
          sales: b.sales + totalAmount,
          profits: b.profits + (totalAmount * 0.35)
        };
      }
      return b;
    });
    setBranches(updatedBranches);

    setShowPOSModal(false);
    setPosProduct("");
    setPosQty(1);
    addToast(`✓ تم حفظ فاتورة المبيعات الفورية بمبلغ ${totalAmount.toLocaleString()} ر.س وتحديث المخازن بالفرع.`, "success");
  };

  // Real inventory physical adjustment count (جرد مادي فوري)
  const handleInventoryAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) return;
    
    const updated = warehouses.map(w => {
      if (w.id === selectedWarehouseId) {
        return {
          ...w,
          items: w.items.map(i => i.productId === adjustProductId ? { ...i, stock: adjustQtyRaw } : i)
        };
      }
      return w;
    });
    
    setWarehouses(updated);
    setShowDirectAdjustModal(false);
    setAdjustProductId("");
    addToast("✓ تم مطابقة صنف المخزن ومزامنة الجرد التجاري للمستودع.", "success");
  };

  // Open modal with current product specifications
  const handleOpenEditProductSpec = (prod: Product) => {
    setEditingWhProduct(prod);
    setEditWhProductName(prod.name);
    setEditWhProductSku(prod.sku);
    setEditWhProductPrice(prod.price);
    setEditWhProductCost(prod.cost);
    setEditWhProductCategory(prod.category);
    setEditWhProductStock(prod.stock);
  };

  // Save product specs changes to parent state and warehouse items
  const handleSaveEditProductSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWhProduct) return;

    // 1. Update in the global products list
    const updatedProducts = products.map(p => {
      if (p.id === editingWhProduct.id) {
        return {
          ...p,
          name: editWhProductName,
          sku: editWhProductSku,
          price: editWhProductPrice,
          cost: editWhProductCost,
          category: editWhProductCategory,
          stock: editWhProductStock
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    // 2. Also keep the warehouse's own quantity value synchronized
    const updatedWarehouses = warehouses.map(w => {
      if (w.id === selectedWarehouseId) {
        const itemExists = w.items.some(i => i.productId === editingWhProduct.id);
        if (itemExists) {
          return {
            ...w,
            items: w.items.map(i => i.productId === editingWhProduct.id ? { ...i, stock: editWhProductStock } : i)
          };
        }
      }
      return w;
    });
    setWarehouses(updatedWarehouses);

    setEditingWhProduct(null);
    addToast("✓ تم تحديث مواصفات الصنف ومزامنة أرصدة المخازن بنجاح.", "success");
  };

  // Toggle Custom Role permission (الوحدة الرابعة)
  const handleTogglePermission = (roleIndex: number, area: 'modules' | 'actions', key: string) => {
    const updated = [...permissions];
    const targetObj: any = updated[roleIndex][area];
    targetObj[key] = !targetObj[key];
    setPermissions(updated);
    addToast("🔐 تم تعديل وحفظ مصفوفة الصلاحيات فوراً!", "success");
  };

  // 🧠 GENERATE AI INTELLIGENT ADVISOR REPORTS (الوحدة السادسة والسابعة)
  const triggerAiAnalysis = () => {
    setIsAiLoading(true);
    setAiReportOutput("");
    
    setTimeout(() => {
      if (aiReportType === "branch") {
        setAiReportOutput(`تقرير الأداء الذكي ومعالجة أداء الفروع - AI Branch Manager
التاريخ: لليوم الحالي من عام 2026

تحليلات أداء الفروع المقارن:
1. "فرع الرياض الرئيسي" يتصدر الأداء بمبيعات تعادل ${(branches[0]?.sales ?? 0).toLocaleString()} ر.س. يساهم بنسبة 45% من مجمل الأرباح.
2. "فرع مكة المكرمة" معطل مؤقتاً، مما يؤدي إلى هدر عوائد متوقعة بنحو 3,000 ريال يومياً من قطاع السياحة والضيافة. يوصى بإنهاء صيانة الرفوف فوراً وإعادة التفعيل.
3. "فرع مجمع مارينا مول بالدمام" هو الأقل أداءً حالياً بمبيعات تعادل ${(branches[2]?.sales ?? 0).toLocaleString()} ر.س.

اكتشاف الهدر والمقترحات الذكية:
- يوجد فائض في الكادر البشري بفرع الرياض (4 موظيفن) بنسبة إشغال منخفضة صباحاً.
- يوصى بـ: نقل الموظف "محمد العتيبي" من فرع الرياض إلى فرع الدمام لتغطية النقص وحل أزمة تباعد الكادر وتحسين الخدمة.
- تم رصد زيادة في معدل مصروفات فرع جدة إلى 15,000 ر.س بسبب إعلانات ورقية قديمة؛ يوصى باستبدالها بالحملات السحابية المؤتمتة لسهم.`);
      } else {
        setAiReportOutput(`تقرير الذكاء الاصطناعي للمستودعات والدعم اللوجستي - Warehouse AI
التاريخ: لليوم الفعلي من عام 2026

توقعات وتحليل نفاد المخزون:
⚠️ مؤشر منخفض حرج: "تمر مجدول سكري" وصل رصيده بالمستودع المركزي إلى 12 عبوة فقط وهو على وشك النفاد التام من قنوات البيع والكاشير خلال 48 ساعة القادمة بحسب الإحصائيات الساكنة.

توصيات إعادة الطلب الذكي:
- يوصى بـ: إعادة طلب فورية قدرها 150 كجم من "تمر مجدول سكري" بالربط مع المورد رقم 1 (مورد العطور الفرنسي والمأكولات المكملة).
- رصد بضائع راكدة: "شاي أخضر ملكي" في مستودع الدمام متراكم منذ شهر بمجموع 50 علبة وبدون أي عمليات كاشير نشطة.
- خطة الموازنة: اقتراح تحويل 30 علبة منه فوراً من "مستودع فرع المنطقة الشرقية" إلى "فرع الرياض" لتلبية سحب الطلب المتنامي هناك وتنشيط دورة رصيد المخزون.`);
      }
      setIsAiLoading(false);
      addToast("🧠 تم الانتهاء من فحص وتحديث الذكاء الاصطناعي بنجاح!", "success");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-4 left-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm border"
          style={{ 
            backgroundColor: toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : theme.accent,
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: toast.type === "info" ? "#000" : "#FFF"
          }}>
          <span className="font-extrabold text-xs">{toast.text}</span>
        </div>
      )}

      {/* Header controls layout toggles */}
      <div className="flex flex-wrap gap-2 pb-2 border-b" style={{ borderColor: theme.border }}>
        {[
          { id: "map", label: "الخريطة التشغيلية 🗺️", icon: MapPin },
          { id: "dashboard", label: "لوحة مراقبة الفروع 📊", icon: BarChart3 },
          { id: "branches", label: "الفروع والموظفين 🏢", icon: Building2 },
          { id: "warehouses", label: "المستودعات والمخازن 📦", icon: WarehouseIcon },
          { id: "transfers", label: "تحويلات المخزون 🔄", icon: ArrowLeftRight },
          { id: "permissions", label: "الصلاحيات والمستخدمين 🔐", icon: ShieldCheck },
          { id: "ai", label: "مستشار الفروع والذكاء 🧠", icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = managerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setManagerTab(tab.id as any);
                if (tab.id === "ai") triggerAiAnalysis();
              }}
              className="py-2.5 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
              style={{
                backgroundColor: isSel ? theme.accent : theme.surface,
                color: isSel ? "#000" : theme.text,
                border: `1px solid ${isSel ? theme.accent : theme.border}`
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ━━━━━━━ VIEW 1: OPERATIONAL MAP (الخريطة التشغيلية) ━━━━━━━ */}
      {managerTab === "map" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl flex items-center justify-between border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="space-y-1">
              <h3 className="text-xs font-black" style={{ color: theme.text }}>الخريطة التشغيلية التفاعلية لـ Sahm OS</h3>
              <p className="text-[10px] text-gray-500">تمثيل جغرافي وهيكلي تفاعلي لعرض مواقع الفروع والمستودعات في السعودية ومراقبة التنبيهات ونسب المخزون وحالة المناوبات فوراً.</p>
            </div>
            <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-extrabold text-[10px] animate-pulse">
              ● تحديث جغرافي حي
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Interactive Vector Graphic Map (8 columns) */}
            <div className="lg:col-span-8 p-6 rounded-3xl border relative min-h-[460px] flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: "#060A13", borderColor: theme.border }}>
              
              {/* Background Saudi Arabia Blueprint Grid Design */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-500 select-none">
                خرائط سهم الجغرافية لغرف العمليات
              </div>

              {/* Graphical Saudi Map representation with regional coordinate nodes */}
              <div className="relative w-full max-w-[500px] h-[360px] select-none">
                
                {/* Visual outlines representing bounds */}
                <div className="absolute inset-0 border border-slate-800/40 rounded-full scale-[0.8] border-dashed"></div>
                <div className="absolute inset-0 border border-slate-700/20 rounded-full scale-[0.6]"></div>

                {/* Region indicator texts */}
                <div className="absolute top-8 left-16 text-[9px] font-black text-slate-600">المنطقة الشمالية</div>
                <div className="absolute bottom-10 right-20 text-[9px] font-black text-slate-600 font-mono">المنطقة الجنوبية</div>
                <div className="absolute top-1/2 left-10 text-[9px] font-black text-slate-600">الساحل الغربي للبحر الأحمر</div>

                {/* NODE 1: Riyadh Main (Central Node) */}
                <button 
                  onClick={() => setSelectedMapNode("br_riyadh_main")}
                  className={`absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10`}
                >
                  <span className="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping"></span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-900/90 text-white py-0.5 px-2 rounded-md border border-emerald-500 shadow-md">
                    فرع الرياض الرئيسي 🏢
                  </span>
                </button>

                {/* NODE 2: Jeddah ردسي (Western Node) */}
                <button 
                  onClick={() => setSelectedMapNode("br_jeddah_int")}
                  className="absolute top-[52%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10"
                >
                  <span className="absolute -inset-2 bg-emerald-400/25 rounded-full animate-ping"></span>
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-900/90 text-white py-0.5 px-2 rounded-md border border-slate-700">
                    فرع ردسي مول بجدة 🛒
                  </span>
                </button>

                {/* NODE 3: Dammam الظهران (East Node) */}
                <button 
                  onClick={() => setSelectedMapNode("br_dammam")}
                  className="absolute top-[35%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10"
                >
                  <span className="absolute -inset-2 bg-amber-500/20 rounded-full"></span>
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg shadow-amber-500/40">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-900/90 text-white py-0.5 px-2 rounded-md border border-amber-500">
                    فرع مارينا بالدمام 🏢
                  </span>
                </button>

                {/* NODE 4: Makkah (Suspended Alert Region) */}
                <button 
                  onClick={() => setSelectedMapNode("br_makkah")}
                  className="absolute top-[65%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10"
                >
                  <span className="absolute -inset-1 bg-red-500/30 rounded-full animate-pulse"></span>
                  <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-lg shadow-red-500/50">
                    <span className="text-[8px] text-white font-extrabold font-mono">!</span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-900/90 text-white py-0.5 px-2 rounded-md border border-red-500">
                    فرع مكة المكرمة ⚠️ (معلق)
                  </span>
                </button>

                {/* WAREHOUSE NODE Central Riyadh */}
                <button 
                  onClick={() => setSelectedMapNode("wh_central_riyadh")}
                  className="absolute top-[28%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10"
                >
                  <div className="w-5.5 h-5.5 rounded-lg bg-teal-500 border-2 border-zinc-900 flex items-center justify-center shadow-lg">
                    <WarehouseIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[9px] font-bold bg-[#000] text-teal-300 py-0.5 px-1.5 rounded border border-teal-500">
                    المستودع الرئيسي بالرياض 📦
                  </span>
                </button>

                {/* WAREHOUSE NODE West Jeddah */}
                <button 
                  onClick={() => setSelectedMapNode("wh_jeddah_sub")}
                  className="absolute top-[42%] left-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10"
                >
                  <div className="w-5.5 h-5.5 rounded-lg bg-teal-600 border-2 border-zinc-900 flex items-center justify-center shadow-lg">
                    <WarehouseIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[9px] font-bold bg-[#000] text-teal-300 py-0.5 px-1.5 rounded border border-teal-500">
                    مستودع جدة الإقليمي 📦
                  </span>
                </button>

              </div>
            </div>

            {/* Selected Node Details side panel (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Selected Node Info Card */}
              {(() => {
                const isBranch = selectedMapNode?.startsWith("br_");
                const currentBr = branches.find(b => b.id === selectedMapNode);
                const currentWh = warehouses.find(w => w.id === selectedMapNode);

                if (!currentBr && !currentWh) {
                  return (
                    <div className="p-6 rounded-3xl border text-center font-bold text-gray-500" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      انقر على أي نقطة على الخريطة لعرض تفاصيل التشغيل الفورية.
                    </div>
                  );
                }

                return (
                  <div className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isBranch ? 'bg-indigo-500/10 text-indigo-400' : 'bg-teal-500/10 text-teal-400'}`}>
                          {isBranch ? 'معرض / فرع بيع POS' : 'مستودع تخزين مركزي'}
                        </span>
                        <h4 className="text-xs font-black" style={{ color: theme.text }}>
                          {isBranch ? currentBr?.name : currentWh?.name}
                        </h4>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${
                        isBranch 
                          ? (currentBr?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500') 
                          : 'bg-emerald-500'
                      }`}></span>
                    </div>

                    <div className="space-y-2 text-xs border-t pt-3 border-dashed" style={{ borderColor: theme.border }}>
                      
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-400">المدينة / الموقع:</span>
                        <span className="font-bold" style={{ color: theme.text }}>
                          {isBranch ? currentBr?.city : currentWh?.location}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-400">المدير المسؤول:</span>
                        <span className="font-bold whitespace-nowrap" style={{ color: theme.text }}>
                          {isBranch ? currentBr?.manager : currentWh?.manager}
                        </span>
                      </div>

                      {isBranch ? (
                        <>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">حجم المبيعات الفورية:</span>
                            <span className="font-bold text-emerald-400">
                              {(currentBr?.sales ?? 0).toLocaleString()} ر.س
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">صافي الأرباح:</span>
                            <span className="font-bold text-amber-500">
                              {(currentBr?.profits ?? 0).toLocaleString()} ر.س
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">الموظفين المتصلين الآن:</span>
                            <span className="font-mono bg-zinc-800 text-[10px] px-2 py-0.5 rounded font-bold text-white">
                              {currentBr?.employees.length} موظفين مناوبين
                            </span>
                          </div>
                          {currentBr?.employees && currentBr.employees.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-zinc-900/30 text-[10px] text-gray-400 space-y-1">
                              <span className="font-bold text-[9px] text-gray-500 block">الكادر النشط:</span>
                              <p className="leading-relaxed">{currentBr.employees.join(" • ")}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">سعة التخزين المستغلة:</span>
                            <span className="font-bold" style={{ color: theme.text }}>
                              {currentWh?.items.reduce((s,i) => s + i.stock, 0)} / {currentWh?.capacity} قطعة
                            </span>
                          </div>
                          
                          <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: theme.border }}>
                            <span className="text-[10px] font-bold text-gray-400 block">أرصدة البضائع المسجلة بالمستودع:</span>
                            <div className="space-y-1">
                              {currentWh?.items.map(item => {
                                const pName = products.find(p => p.id === item.productId)?.name || "منتج مجهول";
                                return (
                                  <div key={item.productId} className="flex justify-between text-[10px] py-1 border-b last:border-0 border-slate-800">
                                    <span className="text-gray-500 truncate max-w-[120px]">{pName}</span>
                                    <span className={`font-mono font-bold ${item.stock < 30 ? 'text-amber-500 animate-pulse' : 'text-emerald-400'}`}>
                                      {item.stock} قطعة
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                );
              })()}

              {/* Real Operational Warnings Alert Box (التنبيهات الفورية) */}
              <div className="p-4 rounded-3xl bg-zinc-900 border space-y-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[11px] font-black">غرفة تنبيهات سهم اللوجستية 🚨</span>
                </div>
                <div className="space-y-2 text-[10px] max-h-[140px] overflow-y-auto pr-1">
                  <div className="p-2 rounded bg-red-500/10 border-r-2 border-red-500 text-red-400">
                    فرع مكة المكرمة معطل مؤقتاً بسبب تحديثات الرفوف والنظام المحدث.
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border-r-2 border-amber-500 text-amber-400">
                    نقص بالمرشحات بمخازن جدة لمنتج "تمر مجدول سكري" (أقل من الحد الآمن).
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border-r-2 border-emerald-500 text-emerald-400">
                    تم الانتهاء بنجاح من اعتماد وثيقة المناقلة STK-TRN-9844.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ━━━━━━━ VIEW 2: BRANCH DASHBOARD MONITOR (لوحة مراقبة الفروع) ━━━━━━━ */}
      {managerTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-bold block" style={{ color: theme.muted }}>إجمالي مبيعات الفروع المدمجة</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-emerald-400">{(totals.sales).toLocaleString()} ر.س</span>
                <span className="text-[9px] text-emerald-400 font-bold">↑ 14% مبيعات POS</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-bold block" style={{ color: theme.muted }}>صافي أرباح العمليات السحابية</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-amber-500">{(totals.profits).toLocaleString()} ر.س</span>
                <span className="text-[9px] text-gray-400 font-bold">هامش ذكي: 35%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-bold block" style={{ color: theme.muted }}>معدل مصروفات الفروع ومخزن الخمرة</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-red-400">53,000 ر.س</span>
                <span className="text-[9px] text-red-400 font-bold">ضمناً إيجار مارينا</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-bold block" style={{ color: theme.muted }}>إجمالي عدد عملاء الفروع الفريدين</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-blue-400">{(totals.ordersCount).toLocaleString()} عميل</span>
                <span className="text-[9px] text-blue-400 font-bold">معدل تكرار رائع</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Branches Performance Bar indicators */}
            <div className="lg:col-span-2 p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h3 className="text-xs font-black" style={{ color: theme.text }}>ترتيب الفروع المحققة لأعلى مبيعات وأفضل أداء</h3>
              
              <div className="space-y-4 pt-2">
                {branches.map((b) => {
                  const maxBrSales = Math.max(...branches.map(br => br.sales ?? 0));
                  const percentage = maxBrSales > 0 ? ((b.sales ?? 0) / maxBrSales) * 100 : 0;
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span style={{ color: theme.text }}>{b.name} ({b.city})</span>
                        <span className="text-emerald-400">{(b.sales ?? 0).toLocaleString()} ر.س</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: b.isActive ? theme.accent : "#EF4444" 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stock balance logs (حركة المخزون) */}
            <div className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h3 className="text-xs font-black" style={{ color: theme.text }}>حركة تتبع المخزون واللوجستيات</h3>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-zinc-900/30 text-[10px] space-y-1 border" style={{ borderColor: theme.border }}>
                  <span className="font-bold text-emerald-400 block">مستودع الرياض المركزي:</span>
                  <p className="text-gray-400 text-[9px]">تم تمويل مستودع جدة بـ 50 علبة قهوة عربية.</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/30 text-[10px] space-y-1 border" style={{ borderColor: theme.border }}>
                  <span className="font-bold text-amber-500 block">فرع الدمام مارينا مول:</span>
                  <p className="text-gray-400 text-[9px]">تم تفعيل مناقلة طارئة لـ 15 عبوة تمر للتغطية.</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/30 text-[10px] space-y-1 border" style={{ borderColor: theme.border }}>
                  <span className="font-bold text-indigo-400 block">عربة كاشير ردسي مول:</span>
                  <p className="text-gray-400 text-[9px]">تحديث رصيد المبيعات الفورية تلقائياً +980 ر.س.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ━━━━━━━ VIEW 3: BRANCHES MANAGEMENT (الوحدة الأولى الفروع) ━━━━━━━ */}
      {managerTab === "branches" && (
        <div className="space-y-6">
          
          <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
            <div className="space-y-1">
              <span className="text-xs font-black block text-white">إدارة صالات العرض والمعارض التقليدية</span>
              <p className="text-[10px] text-gray-400">تأسيس الفروع، وتعيين المدراء والموظفين، ومراقبة جودة النشاط التجاري الفعلي.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowTransferEmployee(true)}
                className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black cursor-pointer border"
                style={{ borderColor: theme.border }}
              >
                نقل موظف بين الفروع 🔄
              </button>
              <button
                onClick={() => setShowAddBranch(true)}
                className="py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer text-black flex items-center gap-1.5"
                style={{ backgroundColor: theme.accent }}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة معرض / فرع جديد</span>
              </button>
            </div>
          </div>

          {/* شريط أدوات تصدير الفروع */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border bg-zinc-900/10"
            style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: theme.text }}>تصدير قائمة صالات العرض ({branches.length} معرض):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportBranchesPDF}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer bg-zinc-800 text-white border border-zinc-700"
              >
                <span>PDF 📄</span>
              </button>
              <button
                type="button"
                onClick={exportBranchesExcel}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: theme.accent, color: "#000" }}
              >
                <span>Excel 📊</span>
              </button>
            </div>
          </div>

          {/* Form Create Branch */}
          {showAddBranch && (
            <form onSubmit={handleAddNewBranch} className="p-6 rounded-3xl border space-y-5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: theme.border }}>
                <span className="text-xs font-black text-white">تأسيس صالة عرض / فرع فوري</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddBranch(false);
                    setBranchImageUrl(undefined);
                    setBranchAddressProfile(undefined);
                  }} 
                  className="text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  إلغاء
                </button>
              </div>

              {/* Added Image uploader for the brand branch */}
              <ImageUploader 
                imageUrl={branchImageUrl} 
                name={branchName || "المعرض الجديد"} 
                onChange={setBranchImageUrl} 
                theme={theme} 
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">اسم الفرع *</label>
                  <input
                    required
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="مثال: معرض الظهران الكبير"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">المدينة</label>
                  <select
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">رقم هاتف الفرع</label>
                  <input
                    type="text"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="05xxxxxxx"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-mono"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">العنوان التفصيلي</label>
                  <input
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="مثال: ياسمين سكوير، مخرج 5"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">المدير المسؤول</label>
                  <input
                    type="text"
                    value={branchManager}
                    onChange={(e) => setBranchManagerName(e.target.value)}
                    placeholder="اسم مدير الصالة"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">ساعات الدوام المقررة</label>
                  <input
                    type="text"
                    value={branchHours}
                    onChange={(e) => setBranchHours(e.target.value)}
                    placeholder="مثال: 08:00 ص - 11:00 م"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              {/* Added NationalAddressForm for Branch */}
              <NationalAddressForm 
                initialAddress={branchAddressProfile} 
                onChange={setBranchAddressProfile} 
                theme={theme} 
              />

              <button
                type="submit"
                className="py-3 px-6 rounded-xl font-black text-xs text-black cursor-pointer shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                تأسيس المعرض والفرع فوراً 🏢
              </button>
            </form>
          )}

          {/* Transfer Employee Modal */}
          {showTransferEmployee && (
            <form onSubmit={handleTransferEmployeeSubmit} className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: theme.border }}>
                <span className="text-xs font-black text-white">تحويل كادر مناوبات المبيعات والشركاء</span>
                <button type="button" onClick={() => setShowTransferEmployee(false)} className="text-gray-400 hover:text-white cursor-pointer">إلغاء</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">اسم الموظف المراد نقله</label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: محمد العتيبي"
                    value={employeeToMove}
                    onChange={(e) => setEmployeeToMove(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">من المعرض الحالي</label>
                  <select
                    value={fromBranchId}
                    onChange={(e) => setFromBranchId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="">-- اختر فرع المغادرة --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">إلى المعرض الجديد</label>
                  <select
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="">-- اختر فرع الوصول المستهدف --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-xs text-white cursor-pointer shadow-lg"
              >
                تحديث جداول دوامات الموظفين وإطلاق التحويل 🚀
              </button>
            </form>
          )}

          {/* Branches list cards hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div 
                key={b.id} 
                onClick={() => setSelectedBranchId(b.id)}
                className="p-5 rounded-3xl border space-y-4 cursor-pointer transition-all hover:scale-[1.01] text-right" 
                style={{ 
                  backgroundColor: theme.surface, 
                  borderColor: selectedBranchId === b.id ? theme.accent : theme.border,
                  boxShadow: selectedBranchId === b.id ? `0 0 12px ${theme.accent}15` : "none"
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 items-start">
                    {b.imageUrl ? (
                      <img 
                        src={b.imageUrl} 
                        alt={b.name} 
                        referrerPolicy="no-referrer" 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-500/20">
                        <span>{b.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-white">{b.name}</h4>
                        {b.addressProfile?.shortAddress && (
                          <span className="text-[8px] font-mono font-black border border-amber-500/20 text-amber-400 bg-amber-500/10 px-1 rounded uppercase tracking-wider">
                            {b.addressProfile.shortAddress}
                          </span>
                        )}
                        {selectedBranchId === b.id && (
                          <span className="text-[8px] font-black border border-indigo-500/35 text-indigo-300 bg-indigo-500/20 px-1 rounded">
                            محدد حالياً 🌟
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] block text-gray-450">الدوام: {b.workingHours} | {b.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleBranchActive(b.id)}
                      className={`text-[9px] py-1 px-2.5 rounded-full font-black select-none cursor-pointer border-none ${
                        b.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {b.isActive ? "🟢 نشط" : "🔴 معطل"}
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b.id, b.name)}
                      className="p-1 text-red-400 hover:text-red-500 hover:bg-zinc-800 rounded cursor-pointer border-none bg-transparent"
                      title="حذف الفرع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Styled National Address for Branches */}
                {b.addressProfile && (
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900/80 space-y-2 text-right">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 font-bold">العنوان الوطني (توصيل فوري)</span>
                      <span className="text-[8px] font-mono text-amber-500 font-bold bg-amber-500/10 px-1 rounded">
                        SPL Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
                      مبنى {b.addressProfile.buildingNumber}، {b.addressProfile.streetName}، حي {b.addressProfile.district}، {b.addressProfile.city}، {b.addressProfile.postalCode}
                    </p>
                    <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          const formatted = `العنوان الوطني للفرع (${b.name}): مبنى ${b.addressProfile?.buildingNumber} ${b.addressProfile?.streetName}، ${b.addressProfile?.district}، ${b.addressProfile?.city}`;
                          navigator.clipboard.writeText(formatted);
                          addToast(`📋 تم نسخ تفاصيل العنوان لصالونات الشحن واللوجستيات`, "success");
                        }}
                        className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] rounded font-bold text-gray-400 hover:text-white transition-colors border-none cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>نسخ العنوان 📋</span>
                      </button>

                      {b.addressProfile.mapLink && (
                        <a
                          href={b.addressProfile.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] rounded font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>خريطة الفرع 📍</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub performance statistics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-dashed pt-3.5" style={{ borderColor: theme.border }}>
                  <div className="p-2 rounded bg-zinc-900/30">
                    <span className="text-[9px] text-gray-500 block">المبيعات</span>
                    <span className="font-extrabold text-emerald-400">{(b.sales ?? 0).toLocaleString()} ر.س</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/30">
                    <span className="text-[9px] text-gray-500 block">الأرباح</span>
                    <span className="font-extrabold text-amber-500">{(b.profits ?? 0).toLocaleString()} ر.س</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/30">
                    <span className="text-[9px] text-gray-500 block">المصروفات</span>
                    <span className="font-extrabold text-red-400">{(b.expenses ?? 0).toLocaleString()} ر.س</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>المدير: <strong className="text-white">{b.manager}</strong></span>
                  <span>الكادر الحركي: <strong>{(b.employees || []).length} موظفين</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Granular interactive products inventory list of selected branch */}
          {(() => {
            const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
            if (!activeBranch) return null;

            // Compute dynamic invoices count and total sales/profits
            const activeBranchInvoices = invoices.filter(inv => inv.branch_id === activeBranch.id || (activeBranch.id === "br_riyadh_main" && !inv.branch_id));
            const distinctProductsCount = Object.keys(branchStocks[activeBranch.id] || {}).length;
            const totalStockSum = (Object.values(branchStocks[activeBranch.id] || {}) as number[]).reduce((sum: number, qty: number) => sum + qty, 0);
            
            // Resolve products with metadata
            const resolvedItems = (Object.entries(branchStocks[activeBranch.id] || {}) as [string, number][]).map(([productId, stock]) => {
              const p = products.find(prod => prod.id === productId);
              return {
                productId,
                stock: stock as number,
                name: p?.name || "منتج غير معروف",
                sku: p?.sku || "SKU-XXX",
                image: p?.image,
                price: p?.price || 0,
                cost: p?.cost || 0,
                category: p?.category || "غير مصنف",
                alertLimit: p?.alertLimit ? parseInt(p.alertLimit) : 50
              };
            });

            // Filter items according to branchProductFilter
            const filteredItems = resolvedItems.filter(item => {
              if (branchProductFilter === "all") return true;
              if (branchProductFilter === "low") return item.stock > 0 && item.stock < 50;
              if (branchProductFilter === "top") return item.productId === "1" || item.productId === "2" || item.stock > 100;
              if (branchProductFilter === "slow") return item.stock >= 150;
              if (branchProductFilter === "out") return item.stock === 0;
              return true;
            });

            const ordersCount = activeBranchInvoices.length > 0 ? activeBranchInvoices.length : Math.round(activeBranch.sales / 350);
            const dynamicSales = activeBranch.sales + activeBranchInvoices.reduce((sum, i) => sum + i.total, 0);
            const dynamicProfits = activeBranch.profits + activeBranchInvoices.reduce((sum, i) => sum + i.total * 0.35, 0);

            return (
              <div id="active-branch-workspace" className="p-6 rounded-3xl border space-y-6 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden" style={{ borderColor: theme.border }}>
                
                {/* 1. Header with Title & Action tools */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5" style={{ borderColor: theme.border }}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400" style={{ color: theme.accent }}>محطة التوزيع الفورية (POS)</span>
                    <h3 className="text-sm font-black text-white flex items-center gap-2 font-sans">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span>تفاصيل فرع: {activeBranch.name}</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans">
                      إدارة جرد المعرض، مبيعات مباشر، فلاتر المنتجات، جرد الأرصدة والتحويلات اللوجستية الفورية
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowAddProductToBranchModal(true)}
                      className="py-1.5 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-[11px] font-black cursor-pointer transition-all flex items-center gap-1 font-sans"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة منتجات للفرع</span>
                    </button>

                    <button
                      onClick={() => {
                        if (distinctProductsCount === 0 || totalStockSum === 0) {
                          addToast("⚠️ يجب توفر منتجات رصيدها أكبر من الصفر بالمعرض للشروع بالبيع السريع.", "error");
                          return;
                        }
                        setShowPOSModal(true);
                      }}
                      className="py-1.5 px-3.5 rounded-lg text-[11px] font-black cursor-pointer transition-all flex items-center gap-1 font-sans"
                      style={{ backgroundColor: theme.accent, color: "#000" }}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>📝 مبيعات فورية (POS المعرض)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Bento Statistics Cards (معلومات الفرع) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-zinc-950/40 border space-y-1 text-right" style={{ borderColor: theme.border }}>
                    <span className="text-[9px] text-gray-400 font-bold block">المدينة والموقع</span>
                    <span className="text-xs font-black text-white block">{activeBranch.city}</span>
                    <span className="text-[9px] text-gray-400 truncate block">{activeBranch.address}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950/40 border space-y-1 text-right" style={{ borderColor: theme.border }}>
                    <span className="text-[9px] text-gray-400 font-bold block">المدير المسؤول</span>
                    <span className="text-xs font-black text-indigo-400 block">{activeBranch.manager}</span>
                    <span className="text-[9px] text-emerald-400 font-bold">دوام: {activeBranch.workingHours}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950/40 border space-y-1 text-right" style={{ borderColor: theme.border }}>
                    <span className="text-[9px] text-gray-400 font-bold block">حالة الفرع</span>
                    <span className={`text-xs font-black block ${activeBranch.isActive ? "text-emerald-400" : "text-red-400"}`}>
                      {activeBranch.isActive ? "🟢 نشط بالشبكة" : "🔴 معطل للتحسين"}
                    </span>
                    <span className="text-[9px] text-gray-400 block font-mono">ID: {activeBranch.id}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950/40 border space-y-1 text-right" style={{ borderColor: theme.border }}>
                    <span className="text-[9px] text-gray-400 font-bold block">إحصاءات المناوبات</span>
                    <span className="text-xs font-black text-amber-500 block">{ordersCount} طلب فواتير</span>
                    <span className="text-[9px] text-gray-400 block">{activeBranch.employees.length} موظفين مبيعات</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950/40 border space-y-1 text-right col-span-2 md:col-span-4 lg:col-span-1" style={{ borderColor: theme.border }}>
                    <span className="text-[9px] text-gray-400 font-bold block">المالية التشغيلية</span>
                    <span className="text-xs font-black text-emerald-400 block font-mono">{dynamicSales.toLocaleString()} ر.س</span>
                    <span className="text-[9px] text-amber-500 block font-mono">الأرباح: {dynamicProfits.toLocaleString()} ر.س</span>
                  </div>
                </div>

                {/* 3. Empty Products Warning Section */}
                {distinctProductsCount === 0 ? (
                  <div className="p-8 rounded-3xl border border-dashed border-zinc-800 text-center space-y-4 bg-zinc-950/20">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="text-xs font-black text-white">لا توجد منتجات مرتبطة بهذا الفرع</h4>
                      <p className="text-[10px] text-gray-400 font-sans">
                        لم يتم تعيين أو شحن بضائع لهذا الفرع حتى الآن. يرجى إضافة أصناف يدوياً أو إنشاء طلب مناقلة بضاعة من المستودع المركزي لزيادة الرصيد.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddProductToBranchModal(true)}
                      className="py-2.5 px-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black cursor-pointer transition-all border-none shadow-lg font-sans"
                    >
                      إضافة منتج للمستودع
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 4. Products Sub-Filters & Table section */}
                    <div className="space-y-4">
                      
                      {/* Filter Pills */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { id: "all", label: "الكل", count: distinctProductsCount },
                            { id: "low", label: "منخفض المخزون", count: resolvedItems.filter(i => i.stock > 0 && i.stock < 50).length },
                            { id: "top", label: "الأكثر مبيعاً", count: resolvedItems.filter(i => i.productId === "1" || i.productId === "2" || i.stock > 100).length },
                            { id: "slow", label: "المنتجات الراكدة", count: resolvedItems.filter(i => i.stock >= 150).length },
                            { id: "out", label: "منتهي", count: resolvedItems.filter(i => i.stock === 0).length }
                          ].map(pill => (
                            <button
                              key={pill.id}
                              onClick={() => setBranchProductFilter(pill.id as any)}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                branchProductFilter === pill.id 
                                  ? "text-black shadow active:scale-95 border-transparent" 
                                  : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                              }`}
                              style={{ 
                                backgroundColor: branchProductFilter === pill.id ? theme.accent : undefined,
                                borderColor: branchProductFilter === pill.id ? "transparent" : theme.border
                              }}
                            >
                              <span>{pill.label} ({pill.count})</span>
                            </button>
                          ))}
                        </div>

                        <span className="text-[10px] text-gray-400">
                          بضائع الفرع: <strong>{totalStockSum} وحدة</strong> موزعة على <strong>{distinctProductsCount} صنف</strong>
                        </span>
                      </div>

                      {/* Products Grid Table */}
                      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: theme.border }}>
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="bg-zinc-950/70 text-gray-400 text-[10px] uppercase font-black tracking-wider border-b" style={{ borderColor: theme.border }}>
                              <th className="p-3.5">صورة وهوية المنتج</th>
                              <th className="p-3.5">SKU</th>
                              <th className="p-3.5">الكمية المتوفرة في هذا الفرع</th>
                              <th className="p-3.5">الحد الأدنى</th>
                              <th className="p-3.5">حالة المخزون</th>
                              <th className="p-3.5">آخر بيع بالفرع</th>
                              <th className="p-3.5 text-center">إجراءات التحكم</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-xs font-sans text-gray-300" style={{ divideColor: theme.border }}>
                            {filteredItems.map(item => {
                              const isLow = item.stock > 0 && item.stock < 50;
                              const isOut = item.stock === 0;

                              const prodInvs = activeBranchInvoices.filter(inv => inv.items.some(it => it.name === item.name));
                              const lastSaleStr = prodInvs.length > 0 ? prodInvs[0].date : (item.stock > 0 ? "أمس" : "-");

                              return (
                                <tr key={item.productId} className="hover:bg-zinc-900/40 transition-colors" style={{ backgroundColor: theme.surface }}>
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-2.5">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-lg object-cover border border-slate-800" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-gray-500 font-bold text-[9px]">
                                          IMG
                                        </div>
                                      )}
                                      <div>
                                        <h5 className="font-sans font-black text-white text-[11px]">{item.name}</h5>
                                        <span className="text-[9px] text-gray-500 block">{item.category}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5 font-mono text-[10px] text-zinc-400">{item.sku}</td>
                                  <td className="p-3.5 font-mono font-black text-[11px]" style={{ color: isOut ? "#f87171" : isLow ? "#fbbf24" : "#34d399" }}>
                                    {item.stock} وحدة
                                  </td>
                                  <td className="p-3.5 font-mono text-[10px] text-zinc-400">{item.alertLimit} وحدة</td>
                                  <td className="p-3.5">
                                    {isOut ? (
                                      <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/10 font-bold">🛑 نفدت الكمية</span>
                                    ) : isLow ? (
                                      <span className="text-[10px] bg-amber-500/10 text-amber-550 px-2 py-0.5 rounded border border-amber-500/10 font-bold">⚠️ مخزون منخفض</span>
                                    ) : (
                                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">✓ متوفر</span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-zinc-400 text-[10px] font-sans">{lastSaleStr}</td>
                                  <td className="p-3.5">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          const parentProd = products.find(p => p.id === item.productId);
                                          if (parentProd) {
                                            setSelectedProductForDetail(parentProd);
                                          } else {
                                            addToast("❌ يتعذر العثور على المنتج في سهم الموحد", "error");
                                          }
                                        }}
                                        className="py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold border-none cursor-pointer tracking-wide"
                                      >
                                        عرض المنتج
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          setTrnFrom(activeBranch.id);
                                          setTrnTo("");
                                          setTrnProduct(item.productId);
                                          setTrnQty(Math.min(10, item.stock > 0 ? item.stock : 1));
                                          setManagerTab("transfers");
                                          setShowAddTransfer(true);
                                          addToast(`🔄 تم تحديد بضائع الفرع كخط مغادرة. اختر الجهة المستلمة للتوجيه والتحويل.`, "info");
                                        }}
                                        className="py-1 px-2.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-300 rounded text-[10px] font-bold border-none cursor-pointer tracking-wide"
                                      >
                                        نقل مخزون
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 5. Branch Sales, stagnant products & logs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-3.5">
                      
                      {/* Section 5.1: Sales Metrics */}
                      <div className="p-4 rounded-2xl border space-y-3 bg-zinc-950/20" style={{ borderColor: theme.border }}>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-black text-white">مبيعات الفروع والمعارض</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-3 rounded-xl bg-zinc-900/40 border" style={{ borderColor: theme.border }}>
                            <span className="text-[9px] text-gray-400 block pb-1">مبيعات اليوم</span>
                            <span className="text-xs font-bold font-mono text-emerald-400">
                              {(activeBranchInvoices.filter(i => i.date === new Date().toISOString().split('T')[0]).reduce((sum, i) => sum + i.total, 0) || Math.round(activeBranch.sales * 0.05)).toLocaleString()} ر.س
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-900/40 border" style={{ borderColor: theme.border }}>
                            <span className="text-[9px] text-gray-400 block pb-1">مبيعات الأسبوع</span>
                            <span className="text-xs font-bold font-mono text-white">
                              {(activeBranchInvoices.reduce((sum, i) => sum + i.total, 0) || Math.round(activeBranch.sales * 0.35)).toLocaleString()} ر.s
                            </span>
                          </div>
                        </div>
                        <p className="text-[8.5px] text-zinc-500 text-right leading-relaxed font-sans">
                          المبيعات تشمل الفواتير الفورية المحصلة بالفرع وفواتير التسليم والبيع الفوري.
                        </p>
                      </div>

                      {/* Section 5.2: Top selling & Stagnant products */}
                      <div className="p-4 rounded-2xl border space-y-3 bg-zinc-950/20" style={{ borderColor: theme.border }}>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-black text-white">السلع والأصناف الأعلى مبيعاً والراكدة</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-zinc-900/40 border flex justify-between items-center text-[10px]" style={{ borderColor: theme.border }}>
                            <span className="font-bold text-gray-400">المنتجات الأعلى مبيعاً 🔥</span>
                            <span className="text-emerald-400 font-bold">{resolvedItems[0]?.name || "عطور فاخرة سهم"}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-zinc-900/40 border flex justify-between items-center text-[10px]" style={{ borderColor: theme.border }}>
                            <span className="font-bold text-gray-400">المنتجات الراكدة ⏳</span>
                            <span className="text-amber-500 font-bold">
                              {resolvedItems.find(i => i.stock >= 150)?.name || (resolvedItems.length > 2 ? resolvedItems[resolvedItems.length - 1]?.name : "البند الحركي الثالث")}
                            </span>
                          </div>
                        </div>
                        <p className="text-[8px] text-zinc-500 text-center leading-tight">
                          * يتم احتساب الأصناف الراكدة على أساس معدل السحب من الفروع شهرياً.
                        </p>
                      </div>

                      {/* Section 5.3: Last Invoice Logs */}
                      <div className="p-4 rounded-2xl border space-y-3 bg-zinc-950/20 col-span-1 md:col-span-2 lg:col-span-1" style={{ borderColor: theme.border }}>
                        <div className="flex items-center gap-1.5">
                          <ClipboardList className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-black text-white">آخر فواتير تسوية الفرع</h4>
                        </div>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {activeBranchInvoices.length > 0 ? (
                            activeBranchInvoices.slice(0, 3).map(inv => (
                              <div key={inv.id} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10px] flex justify-between items-center">
                                <div className="space-y-0.5 text-right">
                                  <span className="font-mono text-zinc-300 font-bold">{inv.id}</span>
                                  <span className="text-zinc-500 block text-[9px]">{inv.date} | {inv.customer}</span>
                                </div>
                                <span className="font-mono font-black text-emerald-400 text-xs">
                                  +{inv.total.toLocaleString()} ر.س
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-[10px] text-gray-500">
                              لا توجد فواتير نشطة حالية للفرع.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </>
                )}

              </div>
            );
          })()}

        </div>
      )}

      {/* ━━━━━━━ VIEW 4: WAREHOUSE MANAGEMENT (الوحدة الثانية المستودعات) ━━━━━━━ */}
      {managerTab === "warehouses" && (
        <div className="space-y-6">
          
          <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
            <div className="space-y-1">
              <span className="text-xs font-black block text-white">مراكز التخزين والخدمات اللوجستية لسهم</span>
              <p className="text-[10px] text-gray-400">مراقبة سعة البضائع المستغلة، وتفعيل المستودعات الفرعية ومخازن الفروع لمنع العجز والراكد.</p>
            </div>
            
            <button
              onClick={() => setShowAddWarehouse(true)}
              className="py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer text-black flex items-center gap-1.5"
              style={{ backgroundColor: theme.accent }}
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مستودع جديد</span>
            </button>
          </div>

          {/* شريط أدوات تصدير المستودعات */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border bg-zinc-900/10"
            style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: theme.text }}>تصدير قائمة المستودعات والمخازن ({warehouses.length} مستودع):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportWarehousesPDF}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer bg-zinc-800 text-white border border-zinc-700"
              >
                <span>PDF 📄</span>
              </button>
              <button
                type="button"
                onClick={exportWarehousesExcel}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-extrabold transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: theme.accent, color: "#000" }}
              >
                <span>Excel 📊</span>
              </button>
            </div>
          </div>

          {/* Form Add Warehouse */}
          {showAddWarehouse && (
            <form onSubmit={handleAddNewWarehouse} className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: theme.border }}>
                <span className="text-xs font-black text-white">تدشين مستودع تجاري جديد</span>
                <button type="button" onClick={() => setShowAddWarehouse(false)} className="text-gray-400 hover:text-white">إلغاء</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">اسم المستودع بالكامل *</label>
                  <input
                    required
                    type="text"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    placeholder="مثال: مستودع سهم - صناعية الدمام"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">النوع والصفة التشغيلية</label>
                  <select
                    value={whType}
                    onChange={(e) => setWhType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="main">مستودع مركزي رئيسي</option>
                    <option value="sub">مستودع إقليمي فرعي</option>
                    <option value="branch">مستودع ملحق بصالة عرض</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">الموقع الجغرافي</label>
                  <input
                    type="text"
                    value={whLocation}
                    onChange={(e) => setWhLocation(e.target.value)}
                    placeholder="مثال: صناعية السلي، الرياض"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">أمين العهدة المسؤول</label>
                  <input
                    type="text"
                    value={whManager}
                    onChange={(e) => setWhManager(e.target.value)}
                    placeholder="اسم أمين المستودع"
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">أقصى سعة استعابية (عدد القطع)</label>
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(parseInt(e.target.value) || 2000)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-mono"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl font-black text-xs text-black cursor-pointer shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                تدشين المستودع والبدء بالعهد 📦
              </button>
            </form>
          )}

          {/* Warehouses catalog list Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {warehouses.map(w => {
              const currentLoad = (w.items || []).reduce((s, it) => s + it.stock, 0);
              const occupationRate = Math.min(100, Math.round((currentLoad / w.capacity) * 100));
              const isSelected = selectedWarehouseId === w.id;
              
              return (
                <div 
                  key={w.id} 
                  onClick={() => setSelectedWarehouseId(w.id)}
                  className={`p-5 rounded-3xl border space-y-4 cursor-pointer transition-all active:scale-[0.98] select-none hover:shadow-lg relative overflow-hidden ${
                    isSelected 
                      ? "border-amber-500 ring-2 ring-amber-550/20 bg-zinc-900 shadow-md shadow-amber-550/5" 
                      : "hover:border-zinc-700 bg-zinc-900/40"
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : theme.surface, borderColor: isSelected ? undefined : theme.border }}
                >
                  {isSelected && (
                    <span className="absolute top-0 left-0 w-full h-[4px] bg-amber-500" />
                  )}
                  
                  <div className="space-y-1.5 pb-2 border-b" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isSelected 
                          ? "bg-amber-500 text-black font-black" 
                          : "text-teal-400 bg-teal-500/10"
                      }`}>
                        {w.type === 'main' ? '🎯 مستودع مركزي' : w.type === 'sub' ? '💡 مستودع فرعي' : '📦 مستودع فرع'}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-black text-amber-500 flex items-center gap-1">المستودع النشط ✓</span>
                      ) : (
                        <span className="text-[10px] text-gray-500">سجل: {w.id.slice(-5)}</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-white">{w.name}</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                        <span>نسبة الإشغال الاستيعابية:</span>
                        <span>{occupationRate}% ({currentLoad} / {w.capacity} قطعة)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isSelected ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${occupationRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-gray-400 space-y-1 bg-zinc-900/40 p-2.5 rounded-xl">
                      <div className="flex justify-between">
                        <span>أمين المستودع:</span>
                        <strong className="text-white">{w.manager}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>الموقع الجغرافي:</span>
                        <span className="text-white">{w.location}</span>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Granular interactive products inventory list of selected warehouse */}
          {(() => {
            const currentWh = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0] || null;
            if (!currentWh) return null;

            // Compute math
            const distinctProductsCount = currentWh.items ? currentWh.items.length : 0;
            const totalStockSum = currentWh.items ? currentWh.items.reduce((sum, item) => sum + item.stock, 0) : 0;
            const lowStockCount = currentWh.items ? currentWh.items.filter(item => item.stock > 0 && item.stock < 50).length : 0;

            // Last transfer related to this warehouse
            const relevantTransfer = transfers.find(t => t.fromId === currentWh.id || t.toId === currentWh.id);
            const lastTransferText = relevantTransfer 
              ? `${relevantTransfer.transferNo} - ${relevantTransfer.date}` 
              : "لا توجد مناقلات حديثة";

            // Resolve items to include products spec attributes
            const resolvedItems = (currentWh.items || []).map(item => {
              const p = products.find(prod => prod.id === item.productId);
              return {
                ...item,
                name: p?.name || "صنف غير مسمى",
                sku: p?.sku || "SKU-MOCK",
                image: p?.image,
                price: p?.price || 0,
                cost: p?.cost || 0,
                category: p?.category || "غير مصنف",
                description: p?.description || ""
              };
            });

            // Filter items according to whProductFilter selector
            const filteredWhItems = resolvedItems.filter(item => {
              if (whProductFilter === 'all') return true;
              if (whProductFilter === 'low') return item.stock > 0 && item.stock < 50;
              if (whProductFilter === 'out') return item.stock === 0;
              if (whProductFilter === 'available') return item.stock >= 50;
              if (whProductFilter === 'active') return item.stock > 0;
              return true;
            });

            const isCashier = user?.role === "كاشير";

            return (
              <div className="p-6 rounded-3xl border space-y-6 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden" style={{ borderColor: theme.border }}>
                
                {/* 1. Header with Title & Action tools */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5" style={{ borderColor: theme.border }}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-550" style={{ color: theme.accent }}>محتويات المستودع الفعلي</span>
                    <h3 className="text-sm font-black text-white flex items-center gap-2 font-sans">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>محتويات مستودع: {currentWh.name}</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans">
                      عرض متكامل للكميات، الجرد الدوري والمناقلة البينية المرتبطة بنقاط التوزيع
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowAddProductToWhModal(true)}
                      className="py-1.5 px-3.5 bg-sky-655 hover:bg-sky-500 text-black hover:text-black rounded-lg text-[11px] font-black cursor-pointer transition-all flex items-center gap-1 bg-sky-400 font-sans"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة منتج للمستودع</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (distinctProductsCount === 0) {
                          addToast("⚠️ لا توجد أصناف في هذا المستودع لبدء جردها.", "error");
                          return;
                        }
                        setAdjustProductId(currentWh.items[0]?.productId || "");
                        setAdjustQtyRaw(currentWh.items[0]?.stock || 0);
                        setShowDirectAdjustModal(true);
                      }}
                      className="py-1.5 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-black cursor-pointer transition-all flex items-center gap-1 font-sans"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>بدء جرد مادي فوري</span>
                    </button>
                  </div>
                </div>

                {/* 2. Bento Summary Grid (ملخص المستودع) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-gray-400 block font-sans">عدد المنتجات</span>
                    <strong className="text-xs font-bold text-white font-mono">{distinctProductsCount} صنف</strong>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-gray-400 block font-sans">إجمالي الكمية</span>
                    <strong className="text-xs font-bold text-emerald-400 font-mono">{totalStockSum} قطعة</strong>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-gray-400 block font-sans">المنتجات منخفضة المخزون</span>
                    <strong className={`text-xs font-bold font-mono ${lowStockCount > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`}>
                      {lowStockCount} سلع
                    </strong>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-gray-400 block font-sans">آخر عملية جرد</span>
                    <span className="text-xs font-black text-cyan-400 font-sans">منذ ساعات (مكتمل)</span>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 col-span-2 md:col-span-1">
                    <span className="text-[9px] text-gray-400 block font-sans">آخر تحويل مخزون</span>
                    <span className="text-[10px] font-mono text-gray-300 truncate block mt-0.5">{lastTransferText}</span>
                  </div>
                </div>

                {/* 3. Products Sub-Filters bar (فلترة المنتجات داخل المستودع) */}
                <div className="flex flex-wrap gap-1.5 items-center bg-zinc-950/50 p-2 rounded-xl border border-zinc-850">
                  <span className="text-[10px] font-bold text-gray-400 ml-2 font-sans">فلترة السلع بالمستودع:</span>
                  {[
                    { key: "all", label: "الكل" },
                    { key: "low", label: "منخفض المخزون ⚠️" },
                    { key: "out", label: "منتهي 🛑" },
                    { key: "available", label: "متوفر ✓" },
                    { key: "active", label: "منتجات نشطة ✨" }
                  ].map(btn => (
                    <button
                      key={btn.key}
                      onClick={() => setWhProductFilter(btn.key as any)}
                      className={`py-1 px-3.5 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all font-sans ${
                        whProductFilter === btn.key 
                          ? "bg-amber-500 text-black font-black font-bold" 
                          : "bg-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* 4. Products list Table View */}
                {filteredWhItems.length === 0 ? (
                  <div className="py-12 text-center space-y-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                    <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center mx-auto text-gray-500">📦</div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-400 font-sans">لا توجد منتجات في هذا المستودع تناسب الفلترة المحددة</p>
                      <p className="text-[9.5px] text-gray-500">يمكنك ربط وإقحام صنف بضائع جديد فوراً بالضغط على الزر أدناه</p>
                    </div>
                    <button
                      onClick={() => setShowAddProductToWhModal(true)}
                      className="py-1.5 px-3.5 bg-blue-600/15 hover:bg-blue-600/35 text-blue-400 border border-blue-500/20 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all inline-block"
                    >
                      إضافة منتج للمستودع +
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] text-gray-400 font-sans tracking-wide">
                          <th className="pb-3 text-right pr-2">الصورة</th>
                          <th className="pb-3 text-right">اسم صنف السلعة</th>
                          <th className="pb-3 text-right">رمز التوريد (SKU)</th>
                          <th className="pb-3 text-right font-sans">الكمية المسجلة مسبقاً</th>
                          <th className="pb-3 text-right font-sans">الحد الأدنى آمن</th>
                          <th className="pb-3 text-right">حالة التوفر بالمخزون</th>
                          <th className="pb-3 text-right">آخر حركة متعلقة</th>
                          <th className="pb-3 text-left pl-2">التحكم والإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/60 text-xs">
                        {filteredWhItems.map(item => {
                          const isLow = item.stock > 0 && item.stock < 50;
                          const isOut = item.stock === 0;
                          
                          // Look up movements
                          const productLastTrn = transfers.find(t => t.productId === item.productId && (t.fromId === currentWh.id || t.toId === currentWh.id));
                          const itemMovementLabel = productLastTrn 
                            ? `مناقلة: ${productLastTrn.transferNo} (${productLastTrn.status === 'approved' ? 'معتمدة' : 'معلقة'})` 
                            : "جرد مخازن دوري ورسمي";

                          return (
                            <tr 
                              key={item.productId}
                              className="group hover:bg-zinc-850/40 transition-all cursor-pointer"
                              onClick={() => setSelectedProductForDetail(item as any)}
                            >
                              {/* Option Image */}
                              <td className="py-3 pr-2">
                                {item.image ? (
                                  <img 
                                    src={item.image.startsWith("data:") && item.image.includes("[مضغوطة]") ? "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200" : item.image} 
                                    alt={item.name} 
                                    className="w-9 h-9 rounded-lg object-cover bg-slate-950 border border-slate-850"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.src = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200";
                                    }}
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-slate-1000 border border-slate-850 flex items-center justify-center text-zinc-500 font-bold bg-slate-950">📦</div>
                                )}
                              </td>

                              {/* Item Name */}
                              <td className="py-3 font-bold text-white group-hover:text-amber-400 group-hover:underline transition-all">
                                {item.name}
                              </td>

                              {/* SKU */}
                              <td className="py-3 text-gray-500 font-mono text-[10px]">
                                {item.sku}
                              </td>

                              {/* Qty */}
                              <td className="py-3 font-mono">
                                <span className={`text-[12.5px] font-bold ${isOut ? 'text-red-500 animate-pulse' : isLow ? 'text-amber-500 font-black' : 'text-emerald-450 text-emerald-400'}`}>
                                  {item.stock}
                                </span>
                                <span className="text-[9px] text-gray-500 mr-1">وحدة</span>
                              </td>

                              {/* Target min */}
                              <td className="py-3 font-mono text-gray-400">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-[10px]">50 وحدة</span>
                              </td>

                              {/* Stock status indicator */}
                              <td className="py-3">
                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                  isOut 
                                    ? "bg-red-500/15 text-red-500 border border-red-500/20" 
                                    : isLow 
                                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/20 animate-pulse" 
                                    : "bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 text-emerald-400"
                                }`}>
                                  {isOut ? "منتهي 🛑" : isLow ? "منخفض المخزون ⚠️" : "متوفر ومدرج ✓"}
                                </span>
                              </td>

                              {/* Last Movement label */}
                              <td className="py-3 text-[10px] text-gray-400 font-sans">
                                {itemMovementLabel}
                              </td>

                              {/* Controller buttons and modifiers */}
                              <td className="py-3 pl-2 text-left" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => setSelectedProductForDetail(item as any)}
                                    className="p-1 px-2 rounded bg-zinc-950 hover:bg-zinc-800 text-gray-300 hover:text-white transition-all text-[10px] font-sans"
                                  >
                                    معاينة
                                  </button>

                                  <button
                                    disabled={isCashier}
                                    onClick={() => handleOpenEditProductSpec(item as any)}
                                    className={`p-1 px-2 rounded text-[10.5px] font-bold transition-all border font-sans ${
                                      isCashier 
                                        ? "bg-zinc-950/20 text-gray-600 border-zinc-900 cursor-not-allowed opacity-40" 
                                        : "bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 border-blue-500/20"
                                    }`}
                                    title={isCashier ? "صلاحيات كاشير محجوبة عن التعديل" : "تعديل الصنف وقيمته ماليًا"}
                                  >
                                    تعديل {isCashier && "🔒"}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setTrnFrom(currentWh.id);
                                      setTrnProduct(item.productId);
                                      setTrnQty(15);
                                      setManagerTab("transfers");
                                      setShowAddTransfer(true);
                                      addToast("🔄 تم الانتقال لإعداد طلب النقل وتم تحديد المستودع والصنف الحالي الثاني تلقائياً.", "info");
                                    }}
                                    className="p-1 px-2 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/25 text-[10.5px] font-bold text-amber-500 hover:text-amber-400 font-sans"
                                  >
                                    نقل مخزون
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            );
          })()}

          {/* A. Product Specifications Editor Modal popup */}
          {editingWhProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right">
              <form 
                onSubmit={handleSaveEditProductSpec}
                className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4 text-right"
              >
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3" style={{ borderColor: theme.border }}>
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>تعديل مواصفات وبيانات الصنف التجاري</span>
                  </span>
                  <button type="button" onClick={() => setEditingWhProduct(null)} className="text-gray-400 hover:text-white text-sm">✕</button>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">اسم صنف السلعة *</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                      value={editWhProductName}
                      onChange={(e) => setEditWhProductName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">رمز SKU للتوريد *</label>
                      <input
                        required
                        type="text"
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none font-mono"
                        value={editWhProductSku}
                        onChange={(e) => setEditWhProductSku(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">التصنيف العائلي</label>
                      <select
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                        value={editWhProductCategory}
                        onChange={(e) => setEditWhProductCategory(e.target.value)}
                      >
                        <option value="عطور ودخون">عطور ودخون</option>
                        <option value="غذائية">غذائية</option>
                        <option value="مشروبات">مشروبات</option>
                        <option value="حلويات وهدايا">حلويات وهدايا</option>
                        <option value="كماليات وهدايا">كماليات وهدايا</option>
                        <option value="أزياء وملبوسات">أزياء وملبوسات</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">سعر البيع الافتراضي *</label>
                      <input
                        required
                        type="number"
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none font-mono text-left font-bold"
                        value={editWhProductPrice}
                        onChange={(e) => setEditWhProductPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">تكلفة شراء الصنف *</label>
                      <input
                        required
                        type="number"
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none font-mono text-left font-bold"
                        value={editWhProductCost}
                        onChange={(e) => setEditWhProductCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">الكمية المسجلة بالمخزن *</label>
                      <input
                        required
                        type="number"
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none font-mono text-left font-bold"
                        value={editWhProductStock}
                        onChange={(e) => setEditWhProductStock(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <p className="text-[9.5px] text-amber-500 leading-normal font-sans">
                    ⚠️ تذكر: تعديل مواصفات الصنف سيتأصل فورياً بكافة قنوات البيع والكاشير والمخازن المرتبطة.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-zinc-800 flex-row-reverse" style={{ borderColor: theme.border }}>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                  >
                    حفظ وإقرار مواصفات الصنف ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingWhProduct(null)}
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-850 text-gray-300 hover:text-white"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B. Specific Product detail preview popup inside warehouses page */}
          {selectedProductForDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right animate-fade-in">
              <div 
                className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-slate-950 p-6 space-y-5 text-right relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3" style={{ borderColor: theme.border }}>
                  <span className="text-xs font-black text-white flex items-center gap-1.5 font-sans">
                    <span>كرت صنف المنتج: {selectedProductForDetail.name}</span>
                  </span>
                  <button 
                    onClick={() => setSelectedProductForDetail(null)}
                    className="p-1 px-2 text-sm rounded bg-transparent text-zinc-400 hover:text-rose-500 cursor-pointer border-none"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    {selectedProductForDetail.image ? (
                      <img 
                        src={selectedProductForDetail.image.startsWith("data:") && selectedProductForDetail.image.includes("[مضغوطة]") ? "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200" : selectedProductForDetail.image} 
                        alt={selectedProductForDetail.name} 
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xs">لا توجد صورة</div>
                    )}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white">{selectedProductForDetail.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">{selectedProductForDetail.sku}</p>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-gray-400 font-bold font-sans">
                        {selectedProductForDetail.category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-sans pt-2 bg-zinc-900/30 p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-gray-500 block">سعر البيع الافتراضي</span>
                      <strong className="text-emerald-400 font-mono text-sm block mt-0.5">{selectedProductForDetail.price} ريال</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-sans">تكلفة شراء المصنع</span>
                      <strong className="text-gray-300 font-mono text-sm block mt-0.5">{selectedProductForDetail.cost} ريال</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">الأرصدة المشتركة الكلية</span>
                      <strong className="text-white font-mono text-sm block mt-0.5">{selectedProductForDetail.stock} وحدة</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">توافر المخزون النظري</span>
                      <strong className={`text-xs block mt-0.5 ${selectedProductForDetail.stock === 0 ? 'text-red-400' : 'text-emerald-450 text-emerald-400'}`}>
                        {selectedProductForDetail.stock === 0 ? "🛑 منتهي" : "✓ متوفر آمن"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-zinc-850 flex-row-reverse" style={{ borderColor: theme.border }}>
                  <button
                    onClick={() => {
                      if (user?.role !== "كاشير") {
                        handleOpenEditProductSpec(selectedProductForDetail);
                        setSelectedProductForDetail(null);
                      }
                    }}
                    disabled={user?.role === "كاشير"}
                    className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      user?.role === "كاشير"
                        ? "bg-zinc-900 text-gray-600 cursor-not-allowed border border-zinc-850"
                        : "bg-amber-500 text-black hover:bg-amber-400"
                    }`}
                  >
                    تعديل مواصفات الصنف {user?.role === "كاشير" ? "🔒 (محجوب)" : ""}
                  </button>
                  <button
                    onClick={() => setSelectedProductForDetail(null)}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C. Direct Adjust Modal for Inventory Adjustments (جرد مادي) */}
          {showDirectAdjustModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right">
              <form 
                onSubmit={handleInventoryAdjustmentSubmit}
                className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4 text-right"
              >
                <div className="space-y-1">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black text-white font-sans">تسجيل مطابقة الجرد المادي الفوري 📊</h3>
                  <p className="text-[9.5px] text-gray-500">
                    جرد سريع للكميات الفعلية المتواجدة على الرفوف بداخل المستودع المختار لمطابقة النظام
                  </p>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">قم باختيار صنف المنتج للمطابقة</label>
                    <select
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                      value={adjustProductId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setAdjustProductId(pid);
                        // Pre-fill current stock
                        const currentWhObj = warehouses.find(w => w.id === selectedWarehouseId);
                        const match = currentWhObj?.items.find(i => i.productId === pid);
                        setAdjustQtyRaw(match ? match.stock : 0);
                      }}
                    >
                      <option value="">-- اختر منتج لمجاراته --</option>
                      {(() => {
                        const activeWh = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
                        const activeItemsWh = activeWh ? activeWh.items : [];
                        return activeItemsWh.map(item => {
                          const p = products.find(prod => prod.id === item.productId);
                          return (
                            <option key={item.productId} value={item.productId}>
                              {p?.name || "منتج غير معروف"} ({p?.sku || "SKU"})
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">الكميات المادية الفعلية المرصودة بالرفوف</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none font-mono font-bold text-left"
                      value={adjustQtyRaw}
                      onChange={(e) => setAdjustQtyRaw(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-[9px] text-gray-500 block">تعديل هذه القيمة سيغير تلقائياً أرصدة نظام المستودع المعزول.</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-zinc-850 flex-row-reverse" style={{ borderColor: theme.border }}>
                  <button
                    type="submit"
                    disabled={!adjustProductId}
                    className="flex-1 py-2 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    حفظ ومزامنة ورقة الجرد 💾
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDirectAdjustModal(false)}
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 text-gray-300"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* D. Add product in active warehouse modal */}
          {showAddProductToWhModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right">
              <form 
                onSubmit={handleAddProductToWarehouseSubmit}
                className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4 text-right"
              >
                <div className="space-y-1 border-b border-zinc-850 pb-3" style={{ borderColor: theme.border }}>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5 font-sans">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>تسجيل وإحصاء صنف جديد بالمستودع</span>
                  </h3>
                  <p className="text-[9.5px] text-gray-400 font-sans">قم بربط بضاعة مدرجة من أصناف سهم الموحدة بعهد هذا المستودع وتأصيله.</p>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">اختر الصنف المطلوب ربطه</label>
                    <select
                      required
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                      value={newWhProductId}
                      onChange={(e) => setNewWhProductId(e.target.value)}
                    >
                      <option value="">-- اختر صنف للربط --</option>
                      {products.map(p => {
                        const currentWhObj = warehouses.find(w => w.id === selectedWarehouseId);
                        const isAssociatedInWh = currentWhObj?.items.some(i => i.productId === p.id);
                        return (
                          <option key={p.id} value={p.id} disabled={isAssociatedInWh}>
                            {p.name} ({p.sku}) {isAssociatedInWh ? " [مرتبط بالفعل]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">الكميات الافتتاحية المدخلة كحيازة</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-mono font-bold text-left outline-none"
                      value={newWhProductStock}
                      onChange={(e) => setNewWhProductStock(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-zinc-800 flex-row-reverse" style={{ borderColor: theme.border }}>
                  <button
                    type="submit"
                    disabled={!newWhProductId}
                    className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    تسجيل عهدة الصنف ومطابقتها 📦
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductToWhModal(false);
                      setNewWhProductId("");
                    }}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-gray-450"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* E. Add product to active branch modal */}
          {showAddProductToBranchModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right">
              <form 
                onSubmit={handleAddProductToBranchSubmit}
                className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4 text-right"
              >
                <div className="space-y-1 border-b border-zinc-850 pb-3" style={{ borderColor: theme.border }}>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5 font-sans">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>تغذية وربط منتج جديد بالفرع المعني</span>
                  </h3>
                  <p className="text-[9.5px] text-gray-400 font-sans">تخصيص صنف من منتجات سهم لتفعيل نقاط البيع وجرده يدوياً بالمعرض.</p>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">اختر الصنف المراد ربطه</label>
                    <select
                      required
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                      value={newBranchProductId}
                      onChange={(e) => setNewBranchProductId(e.target.value)}
                    >
                      <option value="">-- اختر صنف للربط --</option>
                      {products.map(p => {
                        const isAssociatedInBr = branchStocks[selectedBranchId] && (p.id in branchStocks[selectedBranchId]);
                        return (
                          <option key={p.id} value={p.id} disabled={isAssociatedInBr}>
                            {p.name} ({p.sku}) {isAssociatedInBr ? " [مرتبط بالفروع]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">الكميات الافتتاحية لرفوف الفرع</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-mono font-bold text-left outline-none"
                      value={newBranchProductStock}
                      onChange={(e) => setNewBranchProductStock(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-zinc-800 flex-row-reverse" style={{ borderColor: theme.border }}>
                  <button
                    type="submit"
                    disabled={!newBranchProductId}
                    className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    إدخال المنتج لمخزن الفرع 📦
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductToBranchModal(false);
                      setNewBranchProductId("");
                    }}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-gray-450"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* F. POS Sale Simulator Modal (Requirement 8) */}
          {showPOSModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right">
              {(() => {
                const availableProds = (Object.entries(branchStocks[selectedBranchId] || {}) as [string, number][])
                  .filter(([_, stock]) => stock > 0)
                  .map(([productId, stock]) => {
                    const foundP = products.find(p => p.id === productId);
                    return {
                      id: productId,
                      stock: stock as number,
                      name: foundP?.name || "صنف مجهول",
                      price: foundP?.price || 0
                    };
                  });

                const currentSelection = availableProds.find(p => p.id === posProduct) || availableProds[0];
                const totalCalculation = currentSelection ? currentSelection.price * posQty : 0;

                return (
                  <form 
                    onSubmit={handleBranchSaleSubmit}
                    className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4 text-right"
                  >
                    <div className="space-y-1 border-b border-zinc-850 pb-3" style={{ borderColor: theme.border }}>
                      <h3 className="text-xs font-black text-white flex items-center gap-1.5 font-sans">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span>📝 بيع فوري للمستهلك بالفرع (POS)</span>
                      </h3>
                      <p className="text-[9.5px] text-gray-400 font-sans">محاكاة عملية بيع سريعة تخصم من أرصدة المعرض الحالي وتُحدث مبيعات الفرع.</p>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold block">الزبون / العميل المستلم</label>
                        <input
                          type="text"
                          className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                          placeholder="عميل نقدي سريع"
                          value={posCustomer}
                          onChange={(e) => setPosCustomer(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold block">اختر المنتج المتوفر بالمعرض</label>
                        <select
                          required
                          className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white outline-none"
                          value={posProduct}
                          onChange={(e) => {
                            setPosProduct(e.target.value);
                            setPosQty(1);
                          }}
                        >
                          <option value="">-- اختر صنف متوفر بالفرع --</option>
                          {availableProds.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (متوفر: {p.stock} وحدة) - {p.price} ر.س
                            </option>
                          ))}
                        </select>
                      </div>

                      {currentSelection && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-gray-400 font-bold block font-sans">الكمية المطلوبة</label>
                            <span className="text-[9px] text-amber-550">الحد الأقصى بالمعرض: {currentSelection.stock} وحده</span>
                          </div>
                          <input
                            required
                            type="number"
                            min="1"
                            max={currentSelection.stock}
                            className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-mono font-bold text-left outline-none"
                            value={posQty}
                            onChange={(e) => setPosQty(Math.min(currentSelection.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                          />
                        </div>
                      )}

                      {currentSelection && (
                        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400">سعر الوحدة:</span>
                            <span className="font-mono text-white font-bold">{currentSelection.price} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-black border-t border-dashed mt-2 pt-2" style={{ borderColor: theme.border }}>
                            <span className="text-white">إجمالي الفاتورة:</span>
                            <span className="font-mono text-emerald-400 text-sm font-black">{totalCalculation.toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-zinc-800 flex-row-reverse" style={{ borderColor: theme.border }}>
                      <button
                        type="submit"
                        disabled={!posProduct}
                        className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-sans"
                      >
                        قيد فاتورة البيع والخصم 📝
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPOSModal(false);
                          setPosProduct("");
                        }}
                        className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-gray-450"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                );
              })()}
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━ VIEW 5: STOCK TRANSFERS (تحويلات وتحركات المنتجات) ━━━━━━━ */}
      {managerTab === "transfers" && (
        <div className="space-y-6">
          
          <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
            <div className="space-y-1">
              <span className="text-xs font-black block text-white">إدار وتسجيل التحويلات البينية ومطابقة الأرصدة (Stock Transfer)</span>
              <p className="text-[10px] text-gray-400">توجيه المنتجات بين الفروع والمستودعات بشكل قانوني وموثق في السجلات المفتوحة لسهم.</p>
            </div>
            
            <button
              onClick={() => setShowAddTransfer(true)}
              className="py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer text-black flex items-center gap-1.5"
              style={{ backgroundColor: theme.accent }}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>إنشاء طلب تحويل بضائع</span>
            </button>
          </div>

          {/* شريط أدوات تصدير مناقلات البضائع */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border bg-zinc-900/10"
            style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: theme.text }}>تصدير سجل المعاملات والتحويلات ({transfers.length} عملية):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportTransfersPDF}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer bg-zinc-800 text-white border border-zinc-700"
              >
                <span>PDF 📄</span>
              </button>
              <button
                type="button"
                onClick={exportTransfersExcel}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-extrabold transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: theme.accent, color: "#000" }}
              >
                <span>Excel 📊</span>
              </button>
            </div>
          </div>

          {/* Form Create Transfer (تحويل البضائع البينية) */}
          {showAddTransfer && (
            <form onSubmit={handleCreateTransferSubmit} className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: theme.border }}>
                <span className="text-xs font-black text-white">تحرير وتوقيع طلب نقل بضائع بيني</span>
                <button type="button" onClick={() => setShowAddTransfer(false)} className="text-gray-400 hover:text-white">إلغاء</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">المستودع المصدري *</label>
                  <select
                    required
                    value={trnFrom}
                    onChange={(e) => setTrnFrom(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="">-- اختر مستودع الشحن --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">الوجهة المستلمة *</label>
                  <select
                    required
                    value={trnTo}
                    onChange={(e) => setTrnTo(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="">-- اختر المستودع أو الفرع المستهدف --</option>
                    <optgroup label="المستودعات الإقليمية">
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="صالات الفروع والمعارض (POS)">
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">المنتج المراد نقله *</label>
                  <select
                    required
                    value={trnProduct}
                    onChange={(e) => setTrnProduct(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="">-- اختر صنف المنتج --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">الكمية المطلوبة للنقل *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="5000"
                    value={trnQty}
                    onChange={(e) => setTrnQty(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 rounded-lg border outline-none font-mono font-bold text-left"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">مبررات ووثائق النقل وملاحظات التوجيه</label>
                <input
                  type="text"
                  value={trnNotes}
                  onChange={(e) => setTrnNotes(e.target.value)}
                  placeholder="مثال: موازنة دورية لمبيعات نهاية الأسبوع وردسي مول بجدة..."
                  className="w-full text-xs p-2.5 rounded-lg border outline-none font-sans"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl font-black text-xs text-black cursor-pointer shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                إطلاق وحفظ وثيقة المناقلة البينية 🚀
              </button>
            </form>
          )}

          {/* Transfers History list */}
          <div className="space-y-4">
            {transfers.map(trn => (
              <div key={trn.id} className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black font-mono bg-zinc-800 text-gray-300 py-1 px-2.5 rounded">
                      {trn.transferNo}
                    </span>
                    <h4 className="text-xs font-black text-white pt-1">
                      مناقلة {trn.productName} ({trn.qty} قطعة)
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      من: <strong>{trn.fromName}</strong> ← إلى: <strong>{trn.toName}</strong> | التاريخ: {trn.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black py-1 px-3 rounded-full ${
                      trn.status === "approved" 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : trn.status === "rejected"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-500 animate-pulse"
                    }`}>
                      {trn.status === "approved" ? "✓ معتمد وبالمخازن" : trn.status === "rejected" ? "❌ مرفوض" : "⚡ بانتظار الاعتماد"}
                    </span>
                    
                    {trn.status === "pending" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApproveTransfer(trn.id)}
                          className="py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] rounded cursor-pointer"
                        >
                          اعتماد وموافقة
                        </button>
                        <button
                          onClick={() => handleRejectTransfer(trn.id)}
                          className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] rounded cursor-pointer"
                        >
                          رفض الطلب
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {trn.notes && (
                  <p className="text-[10px] text-gray-500 leading-relaxed border-t border-dashed pt-2" style={{ borderColor: theme.border }}>
                    * مبررات العملية: {trn.notes}
                  </p>
                )}

                {/* Tracking logs */}
                <div className="p-3 rounded-xl bg-zinc-900/40 text-[9px] text-gray-400 space-y-1 font-sans">
                  <span className="font-bold text-[9px] text-gray-500 block">تتبع سلسلة التوريد والمطابقة (Audit Log):</span>
                  {trn.historyLogs.map((log, idx) => (
                    <p key={idx}>{log}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ━━━━━━━ VIEW 6: MEMBERS & ROLE PERMISSIONS (الوحدة الرابعة الصلاحيات) ━━━━━━━ */}
      {managerTab === "permissions" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border space-y-1" style={{ borderColor: theme.border }}>
            <h3 className="text-xs font-black text-white">إدار وتوريث الصلاحيات والأدوار المتقدمة (الوحدة الرابعة)</h3>
            <p className="text-[10px] text-gray-400">تحكم كامل وتخصيص دقيق لصلاحيات مالك النظام، طائفة المدراء الماليين والفروع، الكاشيرز، المارة وأمناء التخزين بمرونة تامة.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {permissions.map((p, idx) => (
              <div key={p.role} className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                
                <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs">
                      🔐
                    </div>
                    <span className="text-xs font-black text-white">{p.roleNameAr}</span>
                  </div>
                  <span className="text-[9px] bg-zinc-800 text-gray-400 py-1 px-2.5 rounded font-mono">ROLE_SECURITY_LEVEL: {idx + 1}</span>
                </div>

                {/* Modules switches */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-gray-500 block">الأقسام والوحدات المتاحة للقراءة والعرض (Module Access):</span>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.keys(p.modules).map((modKey) => {
                      const enabled = (p.modules as any)[modKey];
                      return (
                        <button
                          key={modKey}
                          onClick={() => handleTogglePermission(idx, 'modules', modKey)}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1.5 border`}
                          style={{
                            backgroundColor: enabled ? theme.accent + "15" : "transparent",
                            borderColor: enabled ? theme.accent : theme.border,
                            color: enabled ? theme.text : theme.muted
                          }}
                        >
                          <Check className={`w-3.5 h-3.5 ${enabled ? 'opacity-100' : 'opacity-20'}`} />
                          <span>{
                            modKey === 'dashboard' ? 'لوحة القيادة والمؤشرات' :
                            modKey === 'invoices' ? 'الفواتير والحسابات' :
                            modKey === 'products' ? 'المنتجات والـ SKU' :
                            modKey === 'customers' ? 'قوائم وسجلات العملاء' :
                            modKey === 'suppliers' ? 'عقود الموردين' :
                            modKey === 'branches' ? 'تشغيل وإضافة الفروع' :
                            modKey === 'warehouses' ? 'مساحات المستودعات' :
                            modKey === 'aiHub' ? 'الذكاء ومقاييس الأداء' :
                            'الإعدادات والتهيئات'
                          }</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions rules switches */}
                <div className="space-y-2 pt-2 border-t border-dashed" style={{ borderColor: theme.border }}>
                  <span className="text-[10px] font-extrabold text-gray-500 block">الإجراءات والعمليات القانونية المصرحة (Action Permissions):</span>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.keys(p.actions).map((actKey) => {
                      const enabled = (p.actions as any)[actKey];
                      return (
                        <button
                          key={actKey}
                          onClick={() => handleTogglePermission(idx, 'actions', actKey)}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1.5 border`}
                          style={{
                            backgroundColor: enabled ? "rgba(16, 185, 129, 0.1)" : "transparent",
                            borderColor: enabled ? "#10B981" : theme.border,
                            color: enabled ? "#10B981" : theme.muted
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: enabled ? "#10B981" : "#4B5563" }}></span>
                          <span>{
                            actKey === 'canAddInvoice' ? 'إصدار واعتماد الفواتير والكاشير' :
                            actKey === 'canAddProduct' ? 'إضافة وتسجيل منتجات جديدة' :
                            actKey === 'canDeleteProduct' ? 'حذف بضائع واستبعاد عهد' :
                            actKey === 'canDoTransfer' ? 'إنشاء طلبات مناقلة مخزون' :
                            'اعتماد وتخريج المناقلات'
                          }</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ━━━━━━━ VIEW 7: AI MANAGERS REPORTS (الوحدة السادسة والسابعة) ━━━━━━━ */}
      {managerTab === "ai" && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl border scale-3d transition-all"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4"
              style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-amber-500 animate-spin-slow" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-white">المستشار الإداري اللوجستي المدعوم بالذكاء الاصطناعي 🧠</h3>
                  <p className="text-[10px] text-gray-400">اختر نوع المستشار المطلوب لتوليد تقارير أتمتة وتنبؤات كشف الهدر وتوازن البضائع الفوري.</p>
                </div>
              </div>

              {/* Selector toggler */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAiReportType("branch"); }}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    aiReportType === "branch" ? "bg-amber-500 text-black border border-amber-500" : "bg-zinc-800 text-gray-400"
                  }`}
                >
                  AI Branch Manager 🏢
                </button>
                <button
                  type="button"
                  onClick={() => { setAiReportType("warehouse"); }}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    aiReportType === "warehouse" ? "bg-amber-500 text-black border border-amber-500" : "bg-zinc-800 text-gray-400"
                  }`}
                >
                  Warehouse AI 📦
                </button>
              </div>
            </div>

            {/* Run Action */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/30 p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
              <div className="space-y-1 text-right">
                <span className="text-[11px] font-black block text-gray-300">تحديث دورة الذكاء الاصطناعي وفحص المستودعات</span>
                <p className="text-[9px] text-gray-400">يقوم الذكاء الاصطناعي بقراءة معدلات فواتير POS المتسارعة ونسب عجز التمور للموازنة التلقائية.</p>
              </div>
              <button
                type="button"
                onClick={triggerAiAnalysis}
                disabled={isAiLoading}
                className="py-2.5 px-6 rounded-xl text-xs font-black cursor-pointer text-black flex items-center gap-2"
                style={{ backgroundColor: theme.accent }}
              >
                <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'جاري الفحص المتقدم...' : 'إعادة توليد الفحص والتقارير الذكية 🔄'}</span>
              </button>
            </div>

            {/* Report Display Container */}
            <div className="mt-5 p-5 bg-[#070D18] rounded-2xl border border-dashed font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-line text-right"
              style={{ borderColor: theme.border }}>
              
              {isAiLoading ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-[11px] font-bold text-gray-400">جاري قراءة سجل الخريطة التشغيلية وتحليل الهدر المعرضي...</p>
                </div>
              ) : aiReportOutput ? (
                <div>{aiReportOutput}</div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  انقر على زر الفحص لتوجيه الذكاء الاصطناعي وتلخيص أداء الفروع والمخازن.
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
