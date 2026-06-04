import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { ProductsProps } from "./types";
import { useProducts } from "./hooks/useProducts";
import { ProductList } from "./components/ProductList";
import { ProductCategories } from "./components/ProductCategories";
import { ProductWarehouses } from "./components/ProductWarehouses";
import { ProductBranches } from "./components/ProductBranches";
import { ProductProfitPanel } from "./components/ProductProfitPanel";
import { ProductDetails } from "./components/ProductDetails";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import { formatMoney } from "./services/productUiService";

import { 
  Plus, Search, Tag, DollarSign, Package2, ShieldAlert, BarChart, 
  Layers, Zap, Sparkles, Eye, TrendingUp, AlertTriangle, Play, Pause, Inbox, CheckCircle2,
  Warehouse as WarehouseIcon, Store, ArrowLeftRight, ClipboardList, ShieldCheck, ChevronDown, Trash2, Edit3, Heart, Star, MapPin, X, BarChart3, TrendingDown, RefreshCw
} from "lucide-react";
import AIProductBuilder from "../../components/AIProductBuilder";
import SmartCatalogBuilder from "../../components/SmartCatalogBuilder";

const DEFAULT_CATEGORIES = ["عطور ودخون", "غذائية", "مشروبات", "كماليات وهدايا", "أزياء وملبوسات", "حلويات وهدايا"];

export default function ProductsPage({
  products,
  setProducts,
  theme,
  openUnifiedActions,
  triggerNotification,
  addAuditLog,
  invoices,
  setInvoices,
  user,
  activeBranchId,
  activeWarehouseId,
  activePosId,
  activeStoreId
}: ProductsProps) {
  
  const [activeSegment, setActiveSegment] = useState<"products_categories" | "inventory_branches" | "costs_profits">(() => {
    try {
      return (localStorage.getItem("products_active_segment") as any) || "products_categories";
    } catch {
      return "products_categories";
    }
  });

  useEffect(() => {
    localStorage.setItem("products_active_segment", activeSegment);
  }, [activeSegment]);
  const [showCatalogBuilder, setShowCatalogBuilder] = useState(false);
  const [catalogInitialProduct, setCatalogInitialProduct] = useState<Product | null>(null);
  const [catalogInitialCategory, setCatalogInitialCategory] = useState<string | null>(null);

  // Modal and form states for Category, Warehouse, and Branch additions
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  const [customCategories, setCustomCategories] = useState<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    parent?: string;
    isActive: boolean;
  }[]>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_custom_categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sahm_web_custom_categories", JSON.stringify(customCategories));
  }, [customCategories]);

  // Form structure initial states
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    icon: "🏷️",
    color: "#D4AF37",
    parent: "",
    isActive: true
  });

  const [whForm, setWhForm] = useState({
    name: "",
    city: "الرياض",
    address: "",
    manager: "",
    capacity: "5000",
    type: "sub" as "main" | "sub" | "branch",
    isActive: true
  });

  const hook = useProducts(
    products,
    setProducts,
    user,
    triggerNotification,
    addAuditLog,
    activeWarehouseId
  );

  const [brForm, setBrForm] = useState({
    name: "",
    city: "الرياض",
    address: "",
    manager: "",
    phone: "",
    associatedWh: "",
    isActive: true
  });

  // Dynamically set default associated warehouse once hook is ready
  useEffect(() => {
    if (hook.warehouses && hook.warehouses.length > 0 && !brForm.associatedWh) {
      setBrForm(f => ({ ...f, associatedWh: hook.warehouses[0].id }));
    }
  }, [hook.warehouses, brForm.associatedWh]);

  // Add handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      alert("الرجاء إدخال اسم التصنيف.");
      return;
    }
    // Duplicate check
    const isDuplicate = [...DEFAULT_CATEGORIES, ...customCategories.map(c => c.name)].some(
      n => n.toLowerCase() === catForm.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      triggerNotification("هذا التصنيف مسجل مسبقاً في النظام 🌟", "warning");
      return;
    }

    const newCat = {
      id: "cat_" + Date.now(),
      name: catForm.name.trim(),
      description: catForm.description.trim(),
      icon: catForm.icon,
      color: catForm.color,
      parent: catForm.parent || undefined,
      isActive: catForm.isActive
    };
    setCustomCategories(prev => [...prev, newCat]);
    triggerNotification(`تم تسجيل التصنيف الجديد "${newCat.name}" بنجاح 🏷️`, "success");
    if (addAuditLog) {
      addAuditLog("إضافة تصنيف", `تم إنشاء تصنيف يدوي باسم: ${newCat.name}`);
    }
    setIsAddCategoryOpen(false);
    setCatForm({
      name: "",
      description: "",
      icon: "🏷️",
      color: "#D4AF37",
      parent: "",
      isActive: true
    });
  };

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whForm.name.trim()) {
      alert("الرجاء إدخال اسم المستودع.");
      return;
    }
    const newWh = {
      id: "wh_" + Date.now(),
      name: whForm.name.trim(),
      type: whForm.type,
      location: whForm.city + "، " + whForm.address.trim(),
      manager: whForm.manager.trim() || "غير معين",
      capacity: parseInt(whForm.capacity) || 5000,
      items: [], // Start empty
      isActive: whForm.isActive
    };
    hook.setWarehouses([...hook.warehouses, newWh]);
    triggerNotification(`تم تسجيل وتوثيق مستودع ${newWh.name} بنجاح 🏢`, "success");
    if (addAuditLog) {
      addAuditLog("إنشاء مستودع", `تم إنشاء مستودع باسم: ${newWh.name} بسعة استيعابية ${newWh.capacity}`);
    }
    setIsAddWarehouseOpen(false);
    setWhForm({
      name: "",
      city: "الرياض",
      address: "",
      manager: "",
      capacity: "5000",
      type: "sub",
      isActive: true
    });
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!brForm.name.trim()) {
        throw new Error("الرجاء إدخال اسم فرع المعرض.");
      }
      if (!brForm.phone.trim()) {
        throw new Error("الرجاء إدخال رقم تواصل المعرض.");
      }
      if (!brForm.address.trim()) {
        throw new Error("الرجاء إدخال العنوان الجغرافي للفرع.");
      }

      const activeStoreId = localStorage.getItem("sahm_active_store_id") || "store_1";
      const activeCompanyId = localStorage.getItem("sahm_active_company_id") || "company_1";
      const branchId = "br_" + Date.now();

      const newBr = {
        // Standard expected properties
        id: branchId,
        name: brForm.name.trim(),
        city: brForm.city,
        address: brForm.address.trim(),
        phone: brForm.phone.trim(),
        manager: brForm.manager.trim() || "غير معين",
        employees: [],
        workingHours: "09:00 ص - 10:00 م",
        sales: 0,
        profits: 0,
        expenses: 0,
        customersCount: 0,
        isActive: brForm.isActive,
        associatedWh: brForm.associatedWh || undefined,
        
        // Exact requested fields
        branch_id: branchId,
        store_id: activeStoreId,
        company_id: activeCompanyId,
        branch_name: brForm.name.trim(),
        linked_warehouse_id: brForm.associatedWh || undefined,
        status: brForm.isActive ? "active" : "inactive"
      };

      // Direct update of the branches list state
      hook.setBranches([...hook.branches, newBr]);

      // Success notification
      if (triggerNotification) {
        triggerNotification("تم إضافة الفرع بنجاح 🏬", "success");
      } else {
        alert("تم إضافة الفرع بنجاح 🏬");
      }
      
      if (addAuditLog) {
        addAuditLog("إنشاء فرع", `تم إنشاء فرع باسم: ${newBr.name} بمدينة ${newBr.city} للمتجر ${activeStoreId}`);
      }

      setIsAddBranchOpen(false);

      // Reset form
      setBrForm({
        name: "",
        city: "الرياض",
        address: "",
        manager: "",
        phone: "",
        associatedWh: hook.warehouses[0]?.id || "wh_central_riyadh",
        isActive: true
      });

    } catch (error: any) {
      // Failure feedback
      if (triggerNotification) {
        triggerNotification(`عذراً، فشل حفظ الفرع: ${error.message || error}`, "error");
      } else {
        alert(`عذراً، فشل حفظ الفرع: ${error.message || error}`);
      }
    }
  };

  // Global window listeners
  useEffect(() => {
    const handleOpenNewProduct = () => {
      if (activeStoreId === "all_stores") {
        if (triggerNotification) {
          triggerNotification("⚠️ قوانين التشغيل تمنع إضافة منتجات جديدة في وضع العرض الموحد. يرجى تفعيل متجر محدد أولاً.", "error");
        }
        return;
      }
      hook.setShowNew(true);
    };

    const handleOpenSmartProduct = () => {
      if (activeStoreId === "all_stores") {
        if (triggerNotification) {
          triggerNotification("⚠️ لا يمكن استخدام صانع المنتجات الذكي في وضع العرض الموحد لجميع المتاجر. يرجى تفعيل متجر أولاً.", "error");
        }
        return;
      }
      hook.setShowAIBuilder(true);
    };

    const handleOpenCatalogBuilder = () => {
      if (activeStoreId === "all_stores") {
        if (triggerNotification) {
          triggerNotification("⚠️ نشر الكتالوجات غير متاح في وضع العرض الموحد. يرجى اختيار متجر/فرع محدد.", "error");
        }
        return;
      }
      setCatalogInitialProduct(null);
      setCatalogInitialCategory(null);
      setShowCatalogBuilder(true);
    };
    
    (window as any).sahm_close_product_modal = () => {
      hook.setShowAIBuilder(false);
      hook.setEditingProductId(null);
    };

    window.addEventListener("sahm_open_new_product", handleOpenNewProduct);
    window.addEventListener("sahm_open_smart_product", handleOpenSmartProduct);
    window.addEventListener("sahm_open_catalog_builder", handleOpenCatalogBuilder);

    return () => {
      window.removeEventListener("sahm_open_new_product", handleOpenNewProduct);
      window.removeEventListener("sahm_open_smart_product", handleOpenSmartProduct);
      window.removeEventListener("sahm_open_catalog_builder", handleOpenCatalogBuilder);
      delete (window as any).sahm_close_product_modal;
    };
  }, [hook, activeStoreId]);

  // Filtering products list
  const filteredList = products
    .filter(p => {
      if (hook.activeKpiFilter === 'active') return p.stock > 0;
      if (hook.activeKpiFilter === 'inactive') return p.stock === 0;
      if (hook.activeKpiFilter === 'low_stock') return p.stock > 0 && p.stock < 50;
      if (hook.activeKpiFilter === 'best_seller') return p.price >= 200 || (p.price - p.cost) >= 100;
      if (hook.activeKpiFilter === 'stagnant') return p.stock >= 80 && p.price < 350;
      return true;
    })
    .filter(p => hook.selectedCategory === "all" || p.category === hook.selectedCategory)
    .filter(p => p.name.toLowerCase().includes(hook.searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(hook.searchTerm.toLowerCase()));

  // Export callbacks
  const handleExportExcel = () => {
    const exportColumns = [
      { key: "sku", label: "رمز المنتج (SKU)" },
      { key: "name", label: "اسم المنتج" },
      { key: "category", label: "التصنيف" },
      { key: "price", label: "سعر البيع", format: (v: number) => formatMoney(v) },
      { key: "cost", label: "التكلفة", format: (v: number) => formatMoney(v) },
      { key: "stock", label: "المخزون الحالي" },
    ];
    exportToExcel(filteredList, exportColumns, "دليل_المنتجات_" + new Date().toISOString().slice(0, 10));
  };

  const handleExportPDF = () => {
    const exportColumns = [
      { key: "sku", label: "رمز المنتج (SKU)" },
      { key: "name", label: "اسم المنتج" },
      { key: "category", label: "التصنيف" },
      { key: "price", label: "سعر البيع", format: (v: number) => formatMoney(v) },
      { key: "cost", label: "التكلفة", format: (v: number) => formatMoney(v) },
      { key: "stock", label: "المخزون الحالي" },
    ];
    exportToPDF("تقرير دليل المنتجات والمخزون 📦", exportColumns, filteredList, "مستودع السلع والمنتجات بمخازن سهم");
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {activeStoreId === "all_stores" && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold leading-relaxed flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>
              <strong>وضع العرض الموحد نشط:</strong> يمكنك تصفح دليل المنتجات الموحد، مستودعات فروع سهم، ومؤشرات التكاليف والأرباح لكافة المتاجر. لإجراء تعديلات تشغيلية مثل: (إضافة أصناف، تعديل المخزون، نشر المنتجات المباشرة، أو إتمام التحويلات بين الفروع)، يرجى تحديد متجر أو علامة تجارية مخصصة من شريط البحث العلوي.
            </span>
          </div>
          <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-1 rounded-md shrink-0 uppercase tracking-widest font-mono">وضع العرض فقط</span>
        </div>
      )}
      
      {/* 🚀 Main Header of Products and Warehouses Navigation Hub */}
      <div className="p-4 rounded-2xl border text-right space-y-4 shadow-sm relative overflow-hidden" 
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="absolute left-0 top-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
          <div className="flex flex-row-reverse md:flex-row items-center justify-between w-full md:w-auto gap-4">
            <div className="text-right">
              <h2 className="text-lg font-black flex items-center gap-2 justify-end animate-fade-in" style={{ color: theme.text }}>
                <Package2 className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>إدارة المنتجات والمستودعات الموحدة 📦🏢</span>
              </h2>
              <p className="text-[11px] mt-1" style={{ color: theme.muted }}>
                مستودعات فروع سهم، جرد المخزون المركزي، تصنيف البضائع وحساب تكاليف وهوامش الأرباح الإدارية
              </p>
            </div>
 
            {/* Smart Catalog Builder Master Hub Button */}
            {!(user?.role === "كاشير" || user?.role === "موظف خدمة عملاء") && (
              <button
                onClick={() => {
                  if (activeStoreId === "all_stores") {
                    if (triggerNotification) {
                      triggerNotification("⚠️ صناعة الكتالوجات ونشر المنتجات غير متاح في وضع العرض الموحد. يرجى اختيار متجر أولاً.", "error");
                    }
                    return;
                  }
                  setCatalogInitialProduct(null);
                  setCatalogInitialCategory(null);
                  setShowCatalogBuilder(true);
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-550/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-none font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
                <span>+ صناعة كتالوج 📚✨</span>
              </button>
            )}
          </div>

          {/* Master Segment Tabs Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/95 border border-slate-800">
            {[
              { id: "products_categories", label: "المنتجات والتصنيفات 🏷️", icon: Layers },
              { id: "inventory_branches", label: "المخزون والفروع 🏢", icon: WarehouseIcon },
              { id: "costs_profits", label: "التكلفة والأرباح ⚖️", icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSegment === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSegment(tab.id as any)}
                  className={`py-2 px-3.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${isActive ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
                  style={{ backgroundColor: isActive ? theme.accent : "" }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔮 Active Router Contents */}
      <div className="transition-all duration-300">
        
        {/* ======================= 1. PRODUCTS & CATEGORIES SUB-TAB ======================= */}
        {activeSegment === "products_categories" && (
          <div className="space-y-6">
            
            {/* Action Bar for Adding Categories */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 justify-end">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>دليل الأصناف والفئات السحابية 🏷️</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">اضغط على أي تصنيف بالأسفل لفلترة السلع وعرض محتوياته فوراً، أو أضف تصنيفاً جديداً لدليل الـ ERP</p>
              </div>
              {!(user?.role === "كاشير" || user?.role === "موظف خدمة عملاء") && (
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-none shadow-md shadow-emerald-500/10 shrink-0 font-sans"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ إضافة تصنيف جديد</span>
                </button>
              )}
            </div>

            {/* 1. Classification breakdown interactive selector cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-2 select-none">
              {[
                ...DEFAULT_CATEGORIES.map(name => ({ id: name, name, icon: "✨", color: "#D4AF37", isActive: true })),
                ...customCategories
              ].map((cat) => {
                const countInCat = products.filter(p => p.category === cat.name).length;
                const valueInCat = products.filter(p => p.category === cat.name).reduce((sum, p) => sum + (p.price * p.stock), 0);
                const isActive = hook.selectedCategory === cat.name;

                return (
                  <div 
                    key={cat.id} 
                    onClick={() => hook.setSelectedCategory(isActive ? "all" : cat.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden select-none active:scale-[0.98] text-right ${
                      isActive 
                        ? "bg-amber-955/40 bg-amber-950/20 shadow-md shadow-amber-500/10" 
                        : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                    style={{ borderColor: isActive ? theme.accent || "#FBBF24" : "" }}
                  >
                    {isActive && (
                      <span className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: theme.accent || "#FBBF24" }} />
                    )}
                    <div className="flex justify-between items-start">
                      <span className="text-[17px]">{cat.icon || "🏷️"}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-550 animate-pulse" style={{ backgroundColor: theme.accent }} />}
                    </div>
                    <h4 className="text-xs font-black text-white mt-2 truncate" title={cat.name}>{cat.name}</h4>
                    <div className="flex justify-between items-center mt-3 font-mono">
                      <span className="text-[9px] text-gray-500 font-sans">القيمة المادية</span>
                      <span className="text-[10px] text-amber-500 font-extrabold">{formatMoney(valueInCat)}</span>
                    </div>
                    <div className="text-left mt-0.5">
                      <span className="text-[9px] font-bold text-gray-400 font-mono">{countInCat} صنف مسجل</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Products grid columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Products list card container */}
              <div className="lg:col-span-2">
                <ProductList
                  products={products}
                  theme={theme}
                  searchTerm={hook.searchTerm}
                  setSearchTerm={hook.setSearchTerm}
                  selectedCategory={hook.selectedCategory}
                  setSelectedCategory={hook.setSelectedCategory}
                  activeKpiFilter={hook.activeKpiFilter}
                  setActiveKpiFilter={hook.setActiveKpiFilter}
                  selectedProduct={hook.selectedProduct}
                  setSelectedProduct={hook.setSelectedProduct}
                  onAddNew={() => {
                    if (activeStoreId === "all_stores") {
                      if (triggerNotification) triggerNotification("⚠️ لا يمكن إضافة منتجات يدوية في وضع العرض الموحد لجميع المتاجر. يرجى اختيار متجر أولاً.", "error");
                      return;
                    }
                    hook.setShowNew(true);
                  }}
                  onOpenAIBuilder={() => {
                    if (activeStoreId === "all_stores") {
                      if (triggerNotification) triggerNotification("⚠️ استخدام صانع المنتجات الذكي معطل في وضع العرض الموحد.", "error");
                      return;
                    }
                    hook.setShowAIBuilder(true);
                  }}
                  onEditProduct={(pId) => {
                    if (activeStoreId === "all_stores") {
                      if (triggerNotification) triggerNotification("⚠️ تعديل تفاصيل وصور المنتجات غير مسموح في وضع العرض الموحد.", "error");
                      return;
                    }
                    hook.setEditingProductId(pId);
                    hook.setShowAIBuilder(true);
                  }}
                  onDeleteProduct={(pId) => {
                    if (activeStoreId === "all_stores") {
                      if (triggerNotification) triggerNotification("⚠️ حذف وحذف أصناف المنتجات متاح فقط بعد تفعيل متجر محدد.", "error");
                      return;
                    }
                    hook.deleteProduct(pId);
                  }}
                  handleExportPDF={handleExportPDF}
                  handleExportExcel={handleExportExcel}
                  filteredList={filteredList}
                  onOpenCatalog={(p?: Product) => {
                    if (activeStoreId === "all_stores") {
                      if (triggerNotification) triggerNotification("⚠️ تزويد ونشر السلع بالكتالوجات معطل في وضع العرض الموحد.", "error");
                      return;
                    }
                    setCatalogInitialProduct(p || null);
                    setCatalogInitialCategory(null);
                    setShowCatalogBuilder(true);
                  }}
                  user={user}
                />
              </div>

              {/* Sidebar product details preview column */}
              <div>
                <ProductDetails
                  product={hook.selectedProduct}
                  theme={theme}
                  triggerNotification={triggerNotification}
                  onOpenCatalog={(p?: Product) => {
                    if (activeStoreId === "all_stores") {
                      if (triggerNotification) triggerNotification("⚠️ نشر وعرض الكتالوجات الفورية معطل في وضع العرض الموحد لجميع المتاجر.", "error");
                      return;
                    }
                    setCatalogInitialProduct(p || hook.selectedProduct);
                    setCatalogInitialCategory(null);
                    setShowCatalogBuilder(true);
                  }}
                  user={user}
                />
              </div>

            </div>

            {/* Prestige Brands & Custom Tags Footer segment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/80" style={{ borderColor: theme.border }}>
              
              {/* Prestige Brands */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 text-right space-y-3">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5 justify-end">
                  <Star className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <span>العلامات التجارية والشركاء المعتمدة (Prestige Brands)</span>
                </h4>
                <p className="text-[10px] text-gray-400">توزيع السلع في الأنظمة وعقد التوزيع للبراندات الموثقة للعود والبخور المحاسبي:</p>
                <div className="flex flex-wrap gap-2 justify-end pt-1">
                  {["درعة للعطور", "عبد الصمد القرشي", "الماجد للعود", "العربية للعود", "ابراهيم القرشي"].map((brand) => (
                    <span key={brand} className="text-[10px] py-1 px-2.5 rounded bg-slate-950 border border-slate-850 text-gray-300 font-bold hover:text-white transition-colors cursor-default">
                      {brand} ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Tag Cloud */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 text-right space-y-3">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5 justify-end">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  <span>الوسوم وتوزيع المبيعات المخصصة (Product Tags)</span>
                </h4>
                <p className="text-[10px] text-gray-400">الوسوم المحاسبية والضريبية المعتمدة لخصومات وسلات الربط الذكي:</p>
                <div className="flex flex-wrap gap-2 justify-end pt-1">
                  {["عود طبيعي", "دخون مسك", "هدايا فاخرة", "عبوة توفيرية", "الأكثر طلباً 🔥", "العودة للمدارس", "تخفيضات كبرى 🏷️"].map((tag) => (
                    <span key={tag} className="text-[10px] py-1 px-2.5 rounded-full bg-slate-950 border border-slate-850 text-amber-400/90 font-bold hover:scale-105 transition-all cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================= 2. INVENTORY & BRANCHES SUB-TAB ======================= */}
        {activeSegment === "inventory_branches" && (
          <div className="space-y-12">
            
            {/* Top Action Buttons for Inventories & Branches */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 justify-end">
                  <WarehouseIcon className="w-4 h-4 text-amber-550" style={{ color: theme.accent }} />
                  <span>لوحة تحكم منافذ التوزيع والجرد المركزي 🏬🏢</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">قم بإدارة مستودعات فروع سهم الإدارية وتوزيع حزم المنتجات أو تسجيل فروع ومعارض إضافية</p>
              </div>
              {!(user?.role === "كاشير" || user?.role === "موظف خدمة عملاء") && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddWarehouseOpen(true)}
                    className="py-2.5 px-4 rounded-xl text-xs font-black bg-blue-500 hover:bg-blue-400 text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-none shadow-md shadow-blue-550/10 shrink-0 font-sans"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ إضافة مستودع 🏢</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddBranchOpen(true)}
                    className="py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-none shadow-md shadow-emerald-550/10 shrink-0 font-sans"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ إضافة فرع 🏬</span>
                  </button>
                </div>
              )}
            </div>

            {/* Warehouses section */}
            <div className="space-y-6">
              <ProductWarehouses
                products={products}
                theme={theme}
                warehouses={hook.warehouses}
                setWarehouses={hook.setWarehouses}
                branches={hook.branches}
                setBranches={hook.setBranches}
                transfers={hook.transfers}
                setTransfers={hook.setTransfers}
                transferForm={hook.transferForm}
                setTransferForm={hook.setTransferForm}
                handleStockTransfer={hook.handleStockTransfer}
                auditScores={hook.auditScores}
                setAuditScores={hook.setAuditScores}
                auditDone={hook.auditDone}
                setAuditDone={hook.setAuditDone}
                triggerNotification={triggerNotification}
                addAuditLog={addAuditLog}
                activeWarehouseId={activeWarehouseId}
              />
            </div>

            {/* Branches section */}
            <div className="space-y-6 border-t border-slate-800 pt-8" style={{ borderColor: theme.border }}>
              <ProductBranches
                products={products}
                theme={theme}
                branches={hook.branches}
                setBranches={hook.setBranches}
                warehouses={hook.warehouses}
                setWarehouses={hook.setWarehouses}
                transfers={hook.transfers}
                setTransfers={hook.setTransfers}
                triggerNotification={triggerNotification}
                addAuditLog={addAuditLog}
                activeStoreId={activeStoreId}
              />
            </div>

          </div>
        )}

        {/* ======================= 3. COSTS & PROFITS SUB-TAB ======================= */}
        {activeSegment === "costs_profits" && (
          <ProductProfitPanel
            products={products}
            theme={theme}
            applyAIMarkupMultiplier={hook.applyAIMarkupMultiplier}
          />
        )}

      </div>

      {/* ======================= CREATE NEW CARD DISH VIEW FORM MODAL ======================= */}
      {hook.showNew && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 bg-slate-900 border border-slate-800">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">إدخل وقيد صنف جديد بالـ ERP 📦</h3>
                <p className="text-xs text-gray-400 mt-0.5">تسجيل الصنف وإدراجه مباشرة لدليل المستودعات لتنشيط مبيعات الكاشير</p>
              </div>
              <button
                onClick={() => hook.setShowNew(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={hook.saveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اسم ووصف السلعة المعتمد:</label>
                <input
                  type="text"
                  placeholder="مثال: دهن عود سيوفي معتق ملوكي..."
                  value={hook.form.name}
                  onChange={(e) => hook.setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• التصنيف العام:</label>
                  <select
                    value={hook.form.category}
                    onChange={(e) => hook.setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    {[...DEFAULT_CATEGORIES, ...customCategories.map(c => c.name)].map((catName) => (
                      <option key={catName} value={catName}>{catName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• باركود SKU المنتج:</label>
                  <input
                    type="text"
                    placeholder="سيتم إنشاء باركود تلقائي..."
                    value={hook.form.sku}
                    onChange={(e) => hook.setForm(f => ({ ...f, sku: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• سعر البيع النهائي (ر.س):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={hook.form.price}
                    onChange={(e) => hook.setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• تكلفة الشراء الأصلي (ر.س):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={hook.form.cost}
                    onChange={(e) => hook.setForm(f => ({ ...f, cost: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• كمية التوريد ومخزون المستودع الأول:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="مثال: 100"
                  value={hook.form.stock}
                  onChange={(e) => hook.setForm(f => ({ ...f, stock: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white text-center font-mono focus:border-amber-500"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-lg text-black bg-amber-500 hover:bg-amber-400"
                >
                  قيد وإدراج السلعة ✓
                </button>
                <button
                  type="button"
                  onClick={() => hook.setShowNew(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  تراجع عن القرار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART AI PRODUCT BUILDER INTERACTIVE COMPONENT */}
      {hook.showAIBuilder && (
        <AIProductBuilder
          products={products}
          setProducts={setProducts}
          theme={theme}
          onClose={() => {
            hook.setShowAIBuilder(false);
            hook.setEditingProductId(null);
          }}
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
          editingProductId={hook.editingProductId}
        />
      )}

      {/* SMART CATALOG BUILDER COMPONENT WIZARD */}
      {showCatalogBuilder && (
        <SmartCatalogBuilder
          products={products}
          setProducts={setProducts}
          theme={theme}
          onClose={() => {
            setShowCatalogBuilder(false);
            setCatalogInitialProduct(null);
            setCatalogInitialCategory(null);
          }}
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
          user={user}
          initialSelectedProduct={catalogInitialProduct}
          initialSelectedCategory={catalogInitialCategory}
        />
      )}

      {/* ======================= ADD NEW CATEGORY POPUP MODAL ======================= */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>إضافة تصنيف عام جديد 🏷️</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">قيد وتعميم فئة تصنيف جديدة للسلع والبضائع لإدارة الفلترة في الكاشير</p>
              </div>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اسم التصنيف:</label>
                <input
                  type="text"
                  placeholder="مثال: بخور ملكي فاخر..."
                  value={catForm.name}
                  onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• وصف وتوصيف التصنيف:</label>
                <textarea
                  placeholder="وصف مختصر لمحتويات هذا التصنيف..."
                  value={catForm.description}
                  onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full text-xs rounded-lg h-16 py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• أيقونة تعبيرية:</label>
                  <select
                    value={catForm.icon}
                    onChange={(e) => setCatForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="✨">✨ بريق وجمال</option>
                    <option value="🏷️">🏷️ علامة ووسم</option>
                    <option value="🧴">🧴 عطور وبخور</option>
                    <option value="🎁">🎁 هدايا وكماليات</option>
                    <option value="🍎">🍎 سلع غذائية</option>
                    <option value="☕">☕ مشروبات وبن</option>
                    <option value="👗">👗 أزياء وملبوسات</option>
                    <option value="📦">📦 حزم وبضائع عامة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• لون السمة:</label>
                  <select
                    value={catForm.color}
                    onChange={(e) => setCatForm(f => ({ ...f, color: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="#D4AF37">ذهبي ملكي 👑</option>
                    <option value="#3b82f6">أزرق سماوي 🔵</option>
                    <option value="#10b981">أخضر زمردي 🟢</option>
                    <option value="#ef4444">أحمر قاني 🔴</option>
                    <option value="#8b5cf6">بنفسجي فاخر 🟣</option>
                    <option value="#ec4899">وردي دافئ 🌸</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• تصنيف أب (اختياري):</label>
                  <select
                    value={catForm.parent}
                    onChange={(e) => setCatForm(f => ({ ...f, parent: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right"
                  >
                    <option value="">لا يوجد (تصنيف رئيسي)</option>
                    {[...DEFAULT_CATEGORIES, ...customCategories.map(c => c.name)].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• حالة التنشيط:</label>
                  <select
                    value={catForm.isActive ? "true" : "false"}
                    onChange={(e) => setCatForm(f => ({ ...f, isActive: e.target.value === "true" }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="true" className="text-emerald-500">نشط وفعال ✓</option>
                    <option value="false" className="text-red-500">غير نشط ⚠️</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-md text-black bg-emerald-550 hover:bg-emerald-450 transition-colors border-none bg-emerald-500"
                >
                  حفظ وتصميم التصنيف ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD NEW WAREHOUSE POPUP MODAL ======================= */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <WarehouseIcon className="w-4 h-4 text-blue-400" />
                  <span>تسجيل مستودع لوجستي جديد 🏢</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">إضافة مخزن مركزي أو مستودع فرعي لدورة الشحن والتوريد المالي ومطابقة المخزون</p>
              </div>
              <button
                onClick={() => setIsAddWarehouseOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWarehouse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اسم المستودع بالدليل المحاسبي:</label>
                <input
                  type="text"
                  placeholder="مثال: مستودع سهم الشمال المركزي..."
                  value={whForm.name}
                  onChange={(e) => setWhForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المدينة:</label>
                  <select
                    value={whForm.city}
                    onChange={(e) => setWhForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    {["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "القصيم", "تبوك", "أبها"].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• نوع المستودع:</label>
                  <select
                    value={whForm.type}
                    onChange={(e) => setWhForm(f => ({ ...f, type: e.target.value as any }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="main">رئيسي / مركزي (Main)</option>
                    <option value="sub">فرعي لوجستي (Sub)</option>
                    <option value="branch">مرتبط بفرع معرض (Branch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• العنوان الجغرافي التفصيلي:</label>
                <input
                  type="text"
                  placeholder="الملقى، طريق الملك سلمان، تقاطع طريق الملك عبدالعزيز..."
                  value={whForm.address}
                  onChange={(e) => setWhForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• أمين المستودع المسؤول (الموظف):</label>
                  <input
                    type="text"
                    placeholder="مثال: فواز العتيبي..."
                    value={whForm.manager}
                    onChange={(e) => setWhForm(f => ({ ...f, manager: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• السعة التخزينية القصوى (قطعة):</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5000"
                    value={whForm.capacity}
                    onChange={(e) => setWhForm(f => ({ ...f, capacity: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 text-center font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• حالة تشغيل المستودع:</label>
                <select
                  value={whForm.isActive ? "true" : "false"}
                  onChange={(e) => setWhForm(f => ({ ...f, isActive: e.target.value === "true" }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                >
                  <option value="true" className="text-emerald-400">نشط ويستقبل شحنات توريد ✓</option>
                  <option value="false" className="text-red-400">مغلق للصيانة أو جرد دوري ⚠️</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-md text-white bg-blue-600 hover:bg-blue-500 transition-colors border-none"
                >
                  تسجيل وربط المستودع ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD NEW BRANCH POPUP MODAL ======================= */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>تسجيل صالة عرض / فرع مبيعات جديد 🏬</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">تجهيز نقطة بيع أو معرض مبيعات متكامل وربطه بالمستودع المناسب</p>
              </div>
              <button
                onClick={() => setIsAddBranchOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اسم المعرض / الفرع بالدليل:</label>
                <input
                  type="text"
                  placeholder="مثال: معرض الرياض - حي النخيل..."
                  value={brForm.name}
                  onChange={(e) => setBrForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المدينة:</label>
                  <select
                    value={brForm.city}
                    onChange={(e) => setBrForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    {["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "القصيم", "تبوك", "أبها"].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• رقم تواصل المعرض:</label>
                  <input
                    type="tel"
                    placeholder="05xxxxxxx"
                    value={brForm.phone}
                    onChange={(e) => setBrForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-center font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• العنوان الجغرافي للفرع:</label>
                <input
                  type="text"
                  placeholder="شارع التخصصي، حي النخيل، بجانب مجمع البلازا..."
                  value={brForm.address}
                  onChange={(e) => setBrForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المدير المسؤول عن الفرع:</label>
                  <input
                    type="text"
                    placeholder="مثال: يوسف الدوسري..."
                    value={brForm.manager}
                    onChange={(e) => setBrForm(f => ({ ...f, manager: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المستودع اللوجستي المرتبط:</label>
                  <select
                    value={brForm.associatedWh}
                    onChange={(e) => setBrForm(f => ({ ...f, associatedWh: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    {hook.warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• حالة الفرع الافتتاحية:</label>
                <select
                  value={brForm.isActive ? "true" : "false"}
                  onChange={(e) => setBrForm(f => ({ ...f, isActive: e.target.value === "true" }))}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                >
                  <option value="true" className="text-emerald-400">نشط ويستقبل عملاء المبيعات ✓</option>
                  <option value="false" className="text-red-400">مغلق مؤقتاً للتجهيز والترميم ⚠️</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-md text-black bg-emerald-500 hover:bg-emerald-400 transition-colors border-none"
                >
                  تسجيل المعرض والربط ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
