import React, { useState, useEffect } from "react";
import { Product, ThemeColors } from "../../../types";
import { ProductCard } from "./ProductCard";
import { 
  Plus, Search, Sparkles, Package2, CheckCircle2, Pause, ShieldAlert, TrendingUp, Inbox, ChevronDown 
} from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductListProps {
  products: Product[];
  customCategories?: any[];
  theme: ThemeColors;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  activeKpiFilter: "all" | "active" | "inactive" | "low_stock" | "best_seller" | "stagnant";
  setActiveKpiFilter: (val: any) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product) => void;
  onAddNew: () => void;
  onOpenAIBuilder: () => void;
  onEditProduct: (pId: string) => void;
  onDeleteProduct: (pId: string) => void;
  handleExportPDF: () => void;
  handleExportExcel: () => void;
  filteredList: Product[];
  onOpenCatalog?: (p?: Product) => void;
  user?: any;
}

export function ProductList({
  products,
  customCategories = [],
  theme,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  activeKpiFilter,
  setActiveKpiFilter,
  selectedProduct,
  setSelectedProduct,
  onAddNew,
  onOpenAIBuilder,
  onEditProduct,
  onDeleteProduct,
  handleExportPDF,
  handleExportExcel,
  filteredList,
  onOpenCatalog,
  user
}: ProductListProps) {
  
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");

  const totalProductsCount = products.length;
  const activeProductsCount = products.filter(p => p.stock > 0).length;
  const inactiveProductsCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 50).length;
  const bestSellersCount = products.filter(p => p.price >= 200 || (p.price - p.cost) >= 100).length;
  const stagnantCount = products.filter(p => p.stock >= 80 && p.price < 350).length;

  const DEFAULT_CATEGORIES = [
    "عطور ودخون",
    "غذائية",
    "مشروبات",
    "أزياء وملبوسات",
    "جماليات وهدايا",
    "حلويات وهدايا",
    "كماليات وهدايا",
    "أدوات ومستلزمات",
    "براندات حصرية"
  ];

  const productCategoriesSet = new Set(products.map(p => p.category).filter(Boolean));
  
  const categories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((c: any) => c.name),
    ...Array.from(productCategoriesSet)
  ]));

  const visibleCategories = categories.slice(0, 6);
  const hiddenCategories = categories.slice(6);
  const showMoreButton = hiddenCategories.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMoreDropdown(false);
      }
    };
    if (showMoreDropdown) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMoreDropdown]);

  const getCategoryProductCount = (categoryName: string) => {
    if (categoryName === "all") {
      return products.length;
    }
    return products.filter(p => p.category === categoryName).length;
  };

  const dropdownFilteredCategories = dropdownSearch.trim() === ""
    ? hiddenCategories
    : categories.filter(c => c.toLowerCase().includes(dropdownSearch.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Stats Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: "all", label: "جميع السلع", count: totalProductsCount, icon: Package2, color: "text-amber-500", sparklinePath: "M0,15 Q20,10 40,18 T80,12 T100,15", sparkColor: "#D4AF37" },
          { id: "active", label: "النشطة متوفرة", count: activeProductsCount, icon: CheckCircle2, color: "text-emerald-400", sparklinePath: "M0,20 Q20,8 40,15 T80,5 T100,8", sparkColor: "#10B981" },
          { id: "inactive", label: "الخالية والراكدة", count: inactiveProductsCount, icon: Pause, color: "text-gray-400", sparklinePath: "M0,8 Q20,15 40,10 T80,22 T100,20", sparkColor: "#94A3B8" },
          { id: "low_stock", label: "المنبهة ومنخفضة", count: lowStockCount, icon: ShieldAlert, color: "text-rose-400 animate-pulse", sparklinePath: "M0,5 Q20,20 40,12 T80,23 T100,24", sparkColor: "#F43F5E" },
          { id: "best_seller", label: "الأكثر مبيعاً ورواجاً", count: bestSellersCount, icon: TrendingUp, color: "text-blue-400", sparklinePath: "M0,22 Q20,18 40,10 T80,5 T100,3", sparkColor: "#60A5FA" },
          { id: "stagnant", label: "البضائع الراكدة", count: stagnantCount, icon: Inbox, color: "text-amber-600", sparklinePath: "M0,12 Q20,12 40,13 T80,12 T100,13", sparkColor: "#D97706" }
        ].map(kpi => {
          const Icon = kpi.icon;
          const isSelected = activeKpiFilter === kpi.id;
          return (
            <div
              key={kpi.id}
              onClick={() => setActiveKpiFilter(kpi.id as any)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[88px] hover:scale-[1.03] ${
                isSelected
                  ? "border-amber-500 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  : "border-slate-800/80 hover:border-slate-700/80"
              }`}
              style={{
                background: isSelected
                  ? `radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, rgba(13, 21, 39, 0.95) 100%)`
                  : `radial-gradient(circle at top right, rgba(255, 255, 255, 0.01) 0%, rgba(9, 15, 29, 0.9) 100%)`
              }}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 leading-tight block">{kpi.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-black font-mono text-white">{kpi.count}</span>
                  <span className="text-[7.5px] text-gray-500 font-bold">صنف</span>
                </div>
              </div>
              {/* Wavy inline SVG sparkline */}
              <div className="h-3 w-full mt-1 opacity-70">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d={kpi.sparklinePath}
                    fill="none"
                    stroke={kpi.sparkColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 relative" 
        style={{ direction: "rtl", borderColor: theme.border, zIndex: 30 }}
      >
        {/* 1. [بحث باسم المنتج أو SKU] */}
        <div className="relative w-full md:w-64 min-w-[180px] shrink-0">
          <input
            type="text"
            placeholder="ابحث بالاسم أو رمز الباركود SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg py-2 pl-4 pr-9 border border-slate-800 bg-slate-950 text-white outline-none focus:border-amber-500 text-right font-sans"
          />
          <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
        </div>

        {/* 2 & 3. Categories scrollable element (NO flex-wrap, overflow-x-auto, whitespace-nowrap) */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden pr-1 select-none" style={{ scrollbarWidth: "none" }}>
          {/* 2. [جميع التصنيفات] */}
          <button
            key="all"
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setShowMoreDropdown(false);
            }}
            className={`text-[10px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all shrink-0 ${
              selectedCategory === "all" ? "border border-amber-500 text-amber-500 bg-amber-500/10 font-black shadow-md" : "bg-slate-950 text-gray-400 hover:text-white border border-slate-900"
            }`}
            style={{ 
              borderColor: selectedCategory === "all" ? theme.accent || "#D4AF37" : "",
              color: selectedCategory === "all" ? theme.accent || "#D4AF37" : ""
            }}
          >
            جميع التصنيفات
          </button>

          {/* 3. [تصنيف 1] [تصنيف 2] [تصنيف 3] [تصنيف 4] [تصنيف 5] [تصنيف 6] */}
          {visibleCategories.map(c => {
            const isSelected = selectedCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedCategory(c);
                  setShowMoreDropdown(false);
                }}
                className={`text-[10px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all shrink-0 ${
                  isSelected ? "border border-amber-500 text-amber-500 bg-amber-500/10 font-black shadow-md" : "bg-slate-950 text-gray-400 hover:text-white border border-slate-900"
                }`}
                style={{ 
                  borderColor: isSelected ? theme.accent || "#D4AF37" : "",
                  color: isSelected ? theme.accent || "#D4AF37" : ""
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* 4. [المزيد] - Positioned outside categories scroll boundary to ensure the dropdown menu never gets clipped or has layout bugs */}
        {showMoreButton && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowMoreDropdown(!showMoreDropdown);
                setDropdownSearch("");
              }}
              className={`text-[10px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
                hiddenCategories.includes(selectedCategory)
                  ? "border border-amber-500 text-amber-550 bg-amber-555 bg-amber-500/10 font-black shadow-md text-amber-500"
                  : "bg-slate-950 text-gray-400 hover:text-white border border-slate-900"
              }`}
              style={{
                borderColor: hiddenCategories.includes(selectedCategory) ? theme.accent || "#D4AF37" : "",
                color: hiddenCategories.includes(selectedCategory) ? theme.accent || "#D4AF37" : ""
              }}
            >
              <span>{hiddenCategories.includes(selectedCategory) ? `المزيد: ${selectedCategory}` : "المزيد"}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showMoreDropdown && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => {
                  setShowMoreDropdown(false);
                  setDropdownSearch("");
                }} />
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 flex flex-col gap-1 text-right animate-fade-in" style={{ direction: "rtl", whiteSpace: "normal" }}>
                  
                  {/* بحث داخل التصنيفات */}
                  <div className="p-1 border-b border-slate-900 pb-2 mb-1.5">
                    <input
                      type="text"
                      placeholder="ابحث عن تصنيف..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      className="w-full text-[10px] rounded-lg py-1.5 px-2.5 border border-slate-800 bg-slate-900 text-white outline-none focus:border-amber-500 text-right font-sans"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  
                  {/* خيار "جميع التصنيفات" داخل dropdown */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      setShowMoreDropdown(false);
                      setDropdownSearch("");
                    }}
                    className={`text-[10px] py-2 px-3 rounded-lg font-bold flex justify-between items-center cursor-pointer transition-all ${
                      selectedCategory === "all"
                        ? "bg-amber-500/10 text-amber-500 font-extrabold"
                        : "text-gray-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded leading-none bg-slate-900 text-gray-500">
                      {getCategoryProductCount("all")}
                    </span>
                    <span>جميع التصنيفات</span>
                  </button>

                  <div className="border-t border-slate-900/60 my-1"></div>
                  
                  {/* قائمة التصنيفات مع عدد المنتجات */}
                  <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 mt-1">
                    {dropdownFilteredCategories.map(c => {
                      const isSelected = selectedCategory === c;
                      const count = getCategoryProductCount(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(c);
                            setShowMoreDropdown(false);
                            setDropdownSearch("");
                          }}
                          className={`text-[10px] py-2 px-3 rounded-lg font-bold flex justify-between items-center cursor-pointer transition-all ${
                            isSelected
                              ? "bg-amber-500/10 text-amber-500 font-extrabold"
                              : "text-gray-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                            isSelected ? "bg-amber-600/30 text-amber-400 font-black" : "bg-slate-900 text-gray-500"
                          }`}>
                            {count}
                          </span>
                          <span>{c}</span>
                        </button>
                      );
                    })}
                    {dropdownFilteredCategories.length === 0 && (
                      <div className="py-4 text-center text-gray-600 text-[10px]">
                        لا توجد تصنيفات مطابقة.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Export and action triggers */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border border-slate-800 bg-slate-950">
        <span className="text-xs text-gray-400">
          تصدير كتالوج الـ ERP الحالي (المحدد: <strong className="text-amber-500">{filteredList.length}</strong> صنف):
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="py-1 px-3 rounded-lg text-[10px] font-extrabold bg-slate-900 text-red-400 border border-slate-800 hover:bg-slate-800 cursor-pointer"
          >
            PDF 📄
          </button>
          <button
            onClick={handleExportExcel}
            className="py-1 px-3 rounded-lg text-[10px] font-extrabold bg-amber-505 text-black hover:bg-amber-400 hover:text-black hover:bg-opacity-95 cursor-pointer bg-amber-500"
          >
            Excel 📊
          </button>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredList.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            theme={theme}
            isSelected={selectedProduct?.id === p.id}
            onSelect={() => setSelectedProduct(p)}
            onEdit={() => onEditProduct(p.id)}
            onDelete={() => onDeleteProduct(p.id)}
          />
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-950 text-gray-500 text-xs">
          لا توجد منتجات تناسب التصنيفات أو شروط البحث المدخلة.
        </div>
      )}
    </div>
  );
}
