import React from "react";
import { Product, ThemeColors } from "../../../types";
import { ProductCard } from "./ProductCard";
import { 
  Plus, Search, Sparkles, Package2, CheckCircle2, Pause, ShieldAlert, TrendingUp, Inbox 
} from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductListProps {
  products: Product[];
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
  
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter(p => p.stock > 0).length;
  const inactiveProductsCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 50).length;
  const bestSellersCount = products.filter(p => p.price >= 200 || (p.price - p.cost) >= 100).length;
  const stagnantCount = products.filter(p => p.stock >= 80 && p.price < 350).length;

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-6">
      {/* Action buttons header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-right" style={{ color: theme.text }}>معروض السلع ووثائق المنتجات 🎁</h3>
          <p className="text-[10px] text-right text-gray-400" >انقر على أي صنف بالأسفل لتفعيل وعرض شاشة دورة حياة المنتج والخط الزمني ومؤشرات السلامة.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onAddNew}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs select-none cursor-pointer transition-all active:scale-[0.98] border shadow hover:shadow-black/5 bg-slate-900 text-white border-slate-800"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>إدخال صنف يدوي</span>
          </button>

          <button
            onClick={onOpenAIBuilder}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-black text-xs select-none cursor-pointer transition-all active:scale-[0.98] shadow-lg text-black bg-amber-500"
            style={{ backgroundColor: theme.accent }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>صياغة صنف بالذكاء الاصطناعي ✨🤖</span>
          </button>
        </div>
      </div>

      {/* Top Stats Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: "all", label: "جميع السلع", count: totalProductsCount, icon: Package2, color: "text-amber-500" },
          { id: "active", label: "النشطة متوفرة", count: activeProductsCount, icon: CheckCircle2, color: "text-emerald-400" },
          { id: "inactive", label: "الخالية والراكدة", count: inactiveProductsCount, icon: Pause, color: "text-gray-400" },
          { id: "low_stock", label: "المنبهة ومنخفضة", count: lowStockCount, icon: ShieldAlert, color: "text-rose-400 animate-pulse" },
          { id: "best_seller", label: "الأكثر مبيعاً ورواجاً", count: bestSellersCount, icon: TrendingUp, color: "text-blue-400" },
          { id: "stagnant", label: "البضائع الراكدة", count: stagnantCount, icon: Inbox, color: "text-amber-600" }
        ].map(kpi => {
          const Icon = kpi.icon;
          const isSelected = activeKpiFilter === kpi.id;
          return (
            <div
              key={kpi.id}
              onClick={() => setActiveKpiFilter(kpi.id as any)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/20" : "bg-slate-950/60 border-slate-800 hover:border-slate-700"}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-gray-400 leading-tight block">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black font-mono text-white">{kpi.count}</span>
                <span className="text-[8px] text-gray-500 font-bold">صنف</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`text-[10px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all shrink-0 ${selectedCategory === c ? "bg-amber-500 text-black font-black" : "bg-slate-950 text-gray-400 hover:text-white"}`}
            >
              {c === 'all' ? 'جميع التصنيفات' : c}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ابحث بالاسم أو رمز الباركود SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg py-2 pl-4 pr-9 border border-slate-800 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
          />
          <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
        </div>
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
