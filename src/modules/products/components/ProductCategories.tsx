import React, { useState } from "react";
import { Product, ThemeColors } from "../../../types";
import { Layers, Eye, Edit3, Plus, Package, ShoppingBag, X, AlertCircle } from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductCategoriesProps {
  products: Product[];
  theme: ThemeColors;
  setSearchTerm: (val: string) => void;
  triggerNotification?: (text: string, type: any) => void;
  selectedProduct?: Product | null;
  setSelectedProduct?: (p: Product) => void;
  onEditProduct?: (pId: string) => void;
  onAddNew?: () => void;
  user?: any;
  onOpenCatalog?: (catName: string) => void;
}

export function ProductCategories({
  products,
  theme,
  setSearchTerm,
  triggerNotification,
  selectedProduct,
  setSelectedProduct,
  onEditProduct,
  onAddNew,
  user,
  onOpenCatalog
}: ProductCategoriesProps) {
  
  // Track activated category. Defaulting to "عطور ودخون" to keep the screen active and instantly populated
  const [activeCategory, setActiveCategory] = useState<string | null>("عطور ودخون");
  
  // Track specific product preview modal state
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const categoriesList = ["عطور ودخون", "غذائية", "مشروبات", "حلويات وهدايا", "كماليات وهدايا", "أزياء وملبوسات"];

  // Filter products matching activeCategory
  const filteredProducts = activeCategory 
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Section info */}
      <div className="border-r-4 border-amber-500 pr-4">
        <h3 className="text-base font-black text-white">الأصناف والتصنيفات والعلامات التجارية المعتمدة 🏷️👑</h3>
        <p className="text-xs text-gray-400">تحجيم أصناف المستودع الموحد، تفقد فئات السلع والتنقل السريع لمراجعتها</p>
      </div>

      {/* 1. Classification breakdown interactive selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
        {categoriesList.map((cat) => {
          const countInCat = products.filter(p => p.category === cat).length;
          const valueInCat = products.filter(p => p.category === cat).reduce((sum, p) => sum + (p.price * p.stock), 0);
          const isActive = activeCategory === cat;

          return (
            <div 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden select-none active:scale-[0.98] ${
                isActive 
                  ? "bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10" 
                  : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
              )}
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-400 uppercase font-bold">مجموع التوزيع</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
              </div>
              
              <h4 className="text-sm font-black text-white mt-1">{cat}</h4>
              
              <div className="flex justify-between items-center mt-6">
                <div>
                  <span className="text-[9px] text-gray-500 block">عدد السلع</span>
                  <span className="text-xs font-bold text-white font-mono">{countInCat} صنف</span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-[9px] text-gray-500 block font-sans">القيمة السوقية</span>
                  <span className="text-xs font-bold text-emerald-400">{formatMoney(valueInCat)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Category Products Master Hub */}
      <div className="p-5 rounded-2xl border border-slate-850 bg-slate-900/90 relative overflow-hidden space-y-4">
        
        {/* Header section with category title & reset button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>
                {activeCategory 
                  ? `منتجات تصنيف: ${activeCategory}` 
                  : "دليل كافة منتجات الفئات المتاحة"}
              </span>
            </h3>
            <p className="text-[10px] text-gray-400 font-sans">
              تصفح سريع لمنتجات المستودعات والأصناف في نقاط البيع والتوريد
            </p>
          </div>

          <div className="flex gap-2">
            {activeCategory && (
              <button
                onClick={() => {
                  setActiveCategory(null);
                  if (triggerNotification) triggerNotification("تم إلغاء التصفية - عرض كافة المنتجات", "info");
                }}
                className="py-1.5 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-gray-400 hover:text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <X className="w-3 h-3 text-rose-500" />
                <span>عرض كل المنتجات</span>
              </button>
            )}
            
            <button
              onClick={() => onAddNew && onAddNew()}
              className="py-1.5 px-3.5 bg-amber-505 hover:bg-amber-400 text-black rounded-lg text-[11px] font-black cursor-pointer transition-all flex items-center gap-1.5 bg-amber-500"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة صنف مخصص</span>
            </button>
          </div>
        </div>

        {/* The Product List */}
        {filteredProducts.length === 0 ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-gray-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 font-sans">لا توجد منتجات داخل هذا التصنيف</p>
              <p className="text-[10px] text-gray-500">جرب إضافة صنف جديد لهذا التصنيف عبر الضغط على الزر أدناه</p>
            </div>
            <button
              onClick={() => onAddNew && onAddNew()}
              className="py-2 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-black cursor-pointer transition-all inline-block"
            >
              إضافة منتج لهذا التصنيف +
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-gray-400 font-sans tracking-wide">
                  <th className="pb-3 text-right pr-2">صورة المنتج</th>
                  <th className="pb-3 text-right">اسم المنتج</th>
                  <th className="pb-3 text-right">رمز SKU</th>
                  <th className="pb-3 text-right">سعر البيع</th>
                  <th className="pb-3 text-right font-sans">المخزون الحالي</th>
                  <th className="pb-3 text-right">الحالة</th>
                  <th className="pb-3 text-left pl-2">الإجراءات والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80 text-xs">
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock < 50;
                  const isOut = p.stock === 0;
                  const isCashier = user?.role === "كاشير";

                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setPreviewProduct(p)}
                      className="group hover:bg-slate-850/60 transition-all cursor-pointer"
                    >
                      {/* Product Image */}
                      <td className="py-3 pr-2">
                        {p.image ? (
                          <img 
                            src={p.image.startsWith("data:") && p.image.includes("[مضغوطة]") ? "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200" : p.image} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-850"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-gray-500">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="py-3 font-bold text-white group-hover:text-amber-400 group-hover:underline transition-all font-sans">
                        {p.name}
                      </td>

                      {/* SKU */}
                      <td className="py-3 text-gray-400 font-mono text-[10.5px]">
                        {p.sku}
                      </td>

                      {/* Price */}
                      <td className="py-3 text-emerald-400 font-bold font-mono">
                        {formatMoney(p.price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3 font-mono">
                        <span className={`font-bold ${isOut ? "text-red-500 animate-pulse" : isLow ? "text-amber-500" : "text-white"}`}>
                          {p.stock}
                        </span>
                        <span className="text-[9px] text-gray-500 font-sans mr-1">وحدة</span>
                      </td>

                      {/* Status */}
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          isOut 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                            : isLow 
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {isOut ? "نفدت الكمية ⚠️" : isLow ? "شحيح ⚠️" : "متوفر ونشط ✓"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-2 text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setPreviewProduct(p)}
                            className="p-1 px-2.5 rounded bg-slate-950 hover:bg-slate-800 text-gray-300 font-bold hover:text-white transition-all text-[10px] cursor-pointer flex items-center gap-1 border border-slate-800"
                          >
                            <Eye className="w-3 h-3 text-amber-500" />
                            <span>عرض المنتج</span>
                          </button>

                          <button
                            disabled={isCashier}
                            onClick={() => onEditProduct && onEditProduct(p.id)}
                            className={`p-1 px-2.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 border ${
                              isCashier 
                                ? "bg-slate-950/40 text-gray-600 border-slate-900 cursor-not-allowed opacity-50" 
                                : "bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border-blue-500/20"
                            }`}
                            title={isCashier ? "صلاحيات التعديل محجوبة عن كاشير" : "تعديل الصنف"}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>تعديل {isCashier && "🔒"}</span>
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

      {/* 3. Product Detail Preview Slideover/Modal inside ProductCategories */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right">
          <div 
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-6 text-right font-sans relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">تفاصيل كرت الصنف المطور</h3>
                  <p className="text-[10px] text-gray-500 font-sans font-mono">{previewProduct.sku}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-all border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image side */}
              <div className="md:col-span-1 space-y-3 text-center">
                {previewProduct.image ? (
                  <img 
                    src={previewProduct.image.startsWith("data:") && previewProduct.image.includes("[مضغوطة]") ? "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200" : previewProduct.image} 
                    alt={previewProduct.name} 
                    className="w-full aspect-square rounded-2xl object-cover bg-slate-900 border border-slate-800 mx-auto"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200";
                    }}
                  />
                ) : (
                  <div className="w-full aspect-square rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500 mx-auto">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <span className="text-[10px] font-bold font-sans py-0.5 px-2 bg-slate-900 text-gray-400 rounded-full border border-slate-800">
                  {previewProduct.category}
                </span>
              </div>

              {/* Data side */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[9px] text-gray-500 block">اسم صنف بضائع سهم الموفرة</span>
                  <h4 className="text-sm font-black text-white">{previewProduct.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-gray-500 block font-sans">سعر البيع النهائي</span>
                    <strong className="text-sm font-mono text-emerald-400 block mt-0.5">{formatMoney(previewProduct.price)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block font-sans">تكلفة الشراء الأساسي</span>
                    <strong className="text-sm font-mono text-gray-400 block mt-0.5">{formatMoney(previewProduct.cost)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-gray-500 block">كمية المخزن الكلي</span>
                    <strong className="text-sm font-mono block text-white mt-0.5">{previewProduct.stock} وحدة</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block font-sans">حالة توافر الصنف</span>
                    <span className={`text-[10px] font-black mt-1 inline-block rounded-full ${
                      previewProduct.stock === 0 
                        ? "text-red-400" 
                        : previewProduct.stock < 50 
                        ? "text-amber-500" 
                        : "text-emerald-400"
                    }`}>
                      {previewProduct.stock === 0 ? "⚠️ نفدت الكمية" : previewProduct.stock < 50 ? "⚠️ مخزون شحيح" : "✓ متوفر ومستقر"}
                    </span>
                  </div>
                </div>

                {previewProduct.description && (
                  <div>
                    <span className="text-[9px] text-gray-500 block">سيناريو ووصف مخصص للنشر</span>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans">{previewProduct.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-slate-850">
              <button
                onClick={() => {
                  if (onEditProduct && user?.role !== "كاشير") {
                    onEditProduct(previewProduct.id);
                    setPreviewProduct(null);
                  }
                }}
                disabled={user?.role === "كاشير"}
                className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  user?.role === "كاشير"
                    ? "bg-slate-900 border border-slate-850/80 text-gray-600 cursor-not-allowed"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                تعديل الصنف {user?.role === "كاشير" ? "🔒 (محجوب)" : "✨"}
              </button>
              <button
                onClick={() => setPreviewProduct(null)}
                className="py-2 px-5 bg-slate-900 border border-slate-850 text-gray-450 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Elegant side statistics from original view (Tag filtration, prestige brands, highlight metrics) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Prestige brands list */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <h4 className="text-xs font-black text-amber-500 bg-amber-500/10 py-1 px-2.5 rounded inline-block" style={{ color: theme.accent }}>العلامات التجارية للشركاء (Prestige Brands)</h4>
          <p className="text-[10px] text-gray-400 leading-normal">توزيع المنتجات والمستودعات حسب براند التصنيع لشركاء مراسيم سهم:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { name: "مراسيم الطيب للنخبة 👑", count: 8, origin: "الرياض، المملكة العربية السعودية" },
              { name: "دهن العود الكلمنتان الفاخر 🌿", count: 4, origin: "جاكرتا، إندونيسيا" },
              { name: "مباخر ميثاق الزخرفية ✨", count: 3, origin: "الشارقة، جبل علي" },
              { name: "سهم الخاص المحدود 💎", count: 5, origin: "الرياض، السلي للإنتاج" }
            ].map((brand, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-850 bg-slate-950 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">{brand.name}</span>
                  <span className="text-[8px] text-gray-500 block font-sans leading-relaxed mt-0.5">{brand.origin}</span>
                </div>
                <span className="text-[10px] py-0.5 px-2 rounded bg-amber-500/10 text-amber-505 font-bold" style={{ color: theme.accent }}>{brand.count} قطع</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags filtration cloud */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <h4 className="text-xs font-black text-blue-400 bg-blue-500/10 py-1 px-2.5 rounded inline-block font-sans">الوسوم وتوزيع المبيعات (Product Tags)</h4>
          <p className="text-[10px] text-gray-400">انقر لتصفية قائمة السلع مباشرة حسب وسم التصنيف الذكي:</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { text: "#صيفي_منعش", color: "bg-teal-500/10 text-teal-400 border border-teal-500/20" },
              { text: "#الأكثر_إهداءً_الملكي", color: "bg-blue-500/10 text-blue-400 border border-blue-500/25" },
              { text: "#طويل_الأمد", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
              { text: "#عرض_محدود_سهم", color: "bg-amber-500/15 text-amber-500 border border-amber-500/20" },
              { text: "#ضريبة_الصفر", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
              { text: "#نادر_طبيعي", color: "bg-red-500/10 text-red-400 border border-red-500/20" }
            ].map((tag, idx) => (
              <button key={idx} onClick={() => {
                setSearchTerm(tag.text.split('_')[0]);
                if (triggerNotification) {
                  triggerNotification(`تم حصر السلع المرتبطة بالوسم ${tag.text} 🏷️`, "info");
                }
              }} className={`text-xs py-1 px-3 rounded-full font-bold cursor-pointer transition-all hover:scale-105 ${tag.color}`}>
                {tag.text}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-1000 mt-4 text-[9px] text-gray-500 leading-normal bg-slate-950">
            💡 ترمز الأوسام الذكية إلى الخصائح المستخدمة بالمنصة الذكية AI وذكاء روبوت سهم في محتوى الحملات والبريد الإلكتروني المبرمج تلقائياً.
          </div>
        </div>

      </div>

      {/* Highlights metrics (Low stock, stagnant and top sellers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Low Stock Checklist */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-red-400 font-sans">المنتجات منخفضة المخزون (&lt; 50) ⏰</h4>
            <span className="text-[10px] text-gray-500 font-mono">{products.filter(p => p.stock > 0 && p.stock < 50).length} تنبيه</span>
          </div>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {products.filter(p => p.stock > 0 && p.stock < 50).map(p => (
              <div key={p.id} className="p-2.5 rounded bg-slate-950 flex justify-between items-center text-xs">
                <span>{p.name}</span>
                <strong className="text-red-400 font-mono">{p.stock} وحدة</strong>
              </div>
            ))}
          </div>

          <button onClick={() => {
            alert("تم إرسال بلاغ فوري لأمين المستودع 'صالح الفهيد' لإعادة طلب الكميات القصوى من المورد!");
            if (triggerNotification) triggerNotification("تم إرسال بلاغ التوريد العاجل 🚀", "success");
          }} className="w-full text-[10px] py-2 bg-red-650 font-bold rounded-lg text-white hover:bg-red-500 bg-red-600 border-none cursor-pointer">
            توجيه طلب إمداد فوري لخط التوريد 🚀
          </button>
        </div>

        {/* Stagnant products discount suggester */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-amber-500 font-sans">المنتجات الراكدة للبيع ⏳</h4>
            <span className="text-[10px] text-gray-500 font-mono">{products.filter(p => p.stock >= 80).length} سلع</span>
          </div>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {products.filter(p => p.stock >= 80).map(p => (
              <div key={p.id} className="p-2.5 rounded bg-slate-950 flex justify-between items-center text-xs">
                <span>{p.name}</span>
                <strong className="text-amber-500 font-mono">{p.stock} قطعة</strong>
              </div>
            ))}
          </div>

          <button onClick={() => {
            alert("اقترح الذكاء الاصطناعي كود خصم SAHM20 بنسبة 20% لتصريف السلع الراكدة.");
            if (triggerNotification) triggerNotification("تم نشر وتوليد كوبون خصم 20% للراكد 🪄", "success");
          }} className="w-full text-[10px] py-2 bg-amber-505 font-bold rounded-lg text-black hover:bg-amber-400 bg-amber-500 border-none cursor-pointer">
            تنشيط الصنف بالخصم الذكي 🪄
          </button>
        </div>

        {/* Top Selling Badges */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-blue-400 font-sans">المنتجات الأكثر مبيعاً 🏆</h4>
            <span className="text-[10px] text-emerald-400 font-bold font-sans">بطل الكاشير</span>
          </div>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {products.filter(p => p.price >= 200).map((p, idx) => (
              <div key={p.id} className="p-2.5 rounded bg-slate-950 flex justify-between items-center text-xs border border-slate-850/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] flex items-center justify-center font-bold font-mono">
                    {idx + 1}
                  </span>
                  {p.name}
                </span>
                <strong className="text-emerald-400 font-mono">{formatMoney(p.price)}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
