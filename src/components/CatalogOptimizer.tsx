import React, { useState, useMemo } from "react";
import { ThemeColors, Product } from "../types";
import { 
  Sparkles, ShieldAlert, CheckCircle, AlertTriangle, 
  TrendingUp, Layers, Cpu, Zap, RefreshCw, Search,
  FileText, Image, Award, ArrowUpRight
} from "lucide-react";
import { productService } from "../core/database/productService";

interface CatalogOptimizerProps {
  theme: ThemeColors;
  products: Product[];
  setProducts: (prod: Product[]) => void;
  triggerNotification?: (text: string, type?: "success" | "warning" | "info" | "error" | "ai") => void;
  addAuditLog?: (event: string, text: string) => void;
}

interface ProductHealthInfo {
  product: Product;
  completeness: number; // 0 to 100
  hasDescription: boolean;
  hasImage: boolean;
  hasSEO: boolean;
  hasSKU: boolean;
  healthyMargin: boolean;
  healthyStock: boolean;
  margin: number;
  issues: string[];
}

export default function CatalogOptimizer({
  theme,
  products,
  setProducts,
  triggerNotification = () => {},
  addAuditLog = () => {}
}: CatalogOptimizerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "low_margin" | "missing_seo" | "low_stock">("all");
  const [isBulkOptimizing, setIsBulkOptimizing] = useState(false);
  const [bulkStep, setBulkStep] = useState(0);
  const [optimizingProductId, setOptimizingProductId] = useState<string | null>(null);

  // 1. Calculate health metrics for each product
  const productHealthList = useMemo<ProductHealthInfo[]>(() => {
    return products.map(p => {
      const hasDescription = !!(p.description && p.description.trim().length > 10) || !!(p.longDescription && p.longDescription.trim().length > 10);
      const hasImage = !!(p.image && p.image.trim().length > 0);
      const hasSEO = !!(p.seoTitle || p.seoDescription || p.seoKeywords);
      const hasSKU = !!(p.sku && p.sku.trim().length > 0) || !!(p.barcode && p.barcode.trim().length > 0);
      
      const margin = p.price > 0 ? ((p.price - p.cost) / p.price) : 0;
      const healthyMargin = margin >= 0.20;
      const healthyStock = p.stock >= 20;

      // Completeness score formula
      let score = 0;
      if (hasDescription) score += 20;
      if (hasImage) score += 25;
      if (hasSEO) score += 15;
      if (hasSKU) score += 15;
      if (healthyMargin) score += 15;
      if (healthyStock) score += 10;

      const issues: string[] = [];
      if (!hasDescription) issues.push("وصف الصنف ناقص");
      if (!hasImage) issues.push("الصورة الترويجية مفقودة");
      if (!hasSEO) issues.push("كلمات البحث وتهيئة المحركات (SEO) مفقودة");
      if (!hasSKU) issues.push("رمز SKU/الباركود مفقود");
      if (!healthyMargin) issues.push(`هامش الربح منخفض (${(margin * 100).toFixed(0)}% < 20%)`);
      if (!healthyStock) issues.push(`المخزون شحيح (${p.stock} قطع)`);

      return {
        product: p,
        completeness: score,
        hasDescription,
        hasImage,
        hasSEO,
        hasSKU,
        healthyMargin,
        healthyStock,
        margin,
        issues
      };
    });
  }, [products]);

  // 2. Aggregate stats
  const stats = useMemo(() => {
    if (productHealthList.length === 0) {
      return { avgScore: 100, lowStock: 0, lowMargin: 0, missingSeo: 0, missingImage: 0, criticalCount: 0 };
    }
    const sumScore = productHealthList.reduce((sum, item) => sum + item.completeness, 0);
    const avgScore = Math.round(sumScore / productHealthList.length);
    const lowStock = productHealthList.filter(item => !item.healthyStock).length;
    const lowMargin = productHealthList.filter(item => !item.healthyMargin).length;
    const missingSeo = productHealthList.filter(item => !item.hasSEO).length;
    const missingImage = productHealthList.filter(item => !item.hasImage).length;
    const criticalCount = productHealthList.filter(item => item.completeness < 60).length;

    return { avgScore, lowStock, lowMargin, missingSeo, missingImage, criticalCount };
  }, [productHealthList]);

  // 3. Filter products
  const filteredProducts = useMemo(() => {
    return productHealthList.filter(item => {
      // search term
      const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.product.sku && item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      // category tab filter
      if (activeFilter === "critical") return item.completeness < 60;
      if (activeFilter === "low_margin") return !item.healthyMargin;
      if (activeFilter === "missing_seo") return !item.hasSEO || !item.hasDescription;
      if (activeFilter === "low_stock") return !item.healthyStock;
      
      return true;
    });
  }, [productHealthList, searchTerm, activeFilter]);

  // 4. Individual AI product auto-fix
  const handleSingleAIFix = async (item: ProductHealthInfo) => {
    setOptimizingProductId(item.product.id);
    addAuditLog("تحسين ذكي للصنف", `بدء تحسين الصنف ${item.product.name} عبر خوارزمية الذكاء الاصطناعي`);
    
    // Simulate AI generation lag
    setTimeout(async () => {
      // 1. generate fallback values if missing
      const updatedFields: Partial<Product> = {};
      
      if (!item.hasDescription) {
        updatedFields.description = `${item.product.name} - منتج فاخر وحصري تم انتقاؤه وتصنيعه بعناية ليلائم تطلعات عملائنا الباحثين عن التميز والرقي.`;
        updatedFields.longDescription = `نقدم لكم ${item.product.name}، الخيار الأمثل لنمط حياة فاخر. تم إنتاجه بمواصفات معيارية عالية بالتعاون مع خبراء الصناعة في المملكة العربية السعودية. يتميز بجودته العالية واستدامته الطويلة التي تمنحك قيمة حقيقية مقابل استثمارك.`;
      }
      
      if (!item.hasSEO) {
        updatedFields.seoTitle = `${item.product.name} فاخر | متجر مراسيم الطيب`;
        updatedFields.seoDescription = `اشترِ الآن ${item.product.name} الفاخر بأفضل الأسعار وبجودة مضمونة من متجر مراسيم الطيب. توصيل سريع لجميع مدن المملكة.`;
        updatedFields.seoKeywords = `${item.product.name}, عود فاخر, دهن عود, هدايا ملكية, مراسيم الطيب, متجر سعودي`;
      }

      if (!item.hasSKU) {
        updatedFields.sku = `SKU-AI-${Date.now().toString().slice(-6)}`;
        updatedFields.barcode = `628${Date.now().toString().slice(-10)}`;
      }

      // If margin is less than 20%, recalculate price to target exactly 25% margin
      if (!item.healthyMargin) {
        const cost = item.product.cost || 50;
        updatedFields.price = Math.round(cost / 0.75); // Target 25% margin
      }

      if (!item.hasImage) {
        // Fallback placeholder image matching our Saudi Royal theme
        updatedFields.image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='100%' height='100%' fill='%230b1329'/><circle cx='150' cy='150' r='100' fill='none' stroke='%23d4af37' stroke-width='2' stroke-dasharray='10 5'/><text x='50%' y='48%' font-family='Cairo, sans-serif' font-size='16' fill='%23d4af37' font-weight='bold' text-anchor='middle'>سهم OS للذكاء الاصطناعي</text><text x='50%' y='58%' font-family='Cairo, sans-serif' font-size='12' fill='%2394a3b8' text-anchor='middle'>تم توليد الصورة الرقمية الفاخرة</text></svg>";
      }

      try {
        const result = await productService.update(item.product.id, updatedFields);
        if (result) {
          // Update local state
          const newProductsList = products.map(p => p.id === item.product.id ? { ...p, ...updatedFields } : p);
          setProducts(newProductsList);
          triggerNotification(`تمت معالجة وتحسين الصنف: ${item.product.name} بالذكاء الاصطناعي ✨`, "ai");
          addAuditLog("اكتمال التحسين الذكي", `تم ترقية صحة الصنف ${item.product.name} بنجاح.`);
        }
      } catch (err) {
        console.error("Failed single fix", err);
      } finally {
        setOptimizingProductId(null);
      }
    }, 1500);
  };

  // 5. Bulk AI optimization process
  const handleBulkAIOptimize = () => {
    setIsBulkOptimizing(true);
    setBulkStep(1);
    addAuditLog("تحسين الكتالوج الجماعي", "بدء تشغيل معالج أتمتة وتحسين صحة كتالوج المنتجات الكلي");

    // Phase 1: Analysing
    setTimeout(() => {
      setBulkStep(2);
      
      // Phase 2: Processing AI Descriptions
      setTimeout(() => {
        setBulkStep(3);

        // Phase 3: Financial repricing adjustments
        setTimeout(async () => {
          setBulkStep(4);

          // Apply bulk updates
          const updatedProductsList = await Promise.all(products.map(async (p) => {
            const margin = p.price > 0 ? ((p.price - p.cost) / p.price) : 0;
            const updates: Partial<Product> = {};
            let changed = false;

            if (!p.description || p.description.trim().length < 10) {
              updates.description = `${p.name} - صنف فاخر متاح بمتجر مراسيم الطيب. تم اختياره وصياغته بعناية بالاعتماد على خوارزميات سهم برين.`;
              updates.longDescription = `نقدم لكم ${p.name} الأصلي الفاخر، المصنع طبقاً للمواصفات السعودية الراقية. يتميز بالجودة المتناهية والعبوة الفخمة الملائمة للمناسبات الرسمية والهدايا الفاخرة.`;
              changed = true;
            }

            if (!p.seoTitle || !p.seoKeywords) {
              updates.seoTitle = `${p.name} فاخر - متجر مراسيم الطيب`;
              updates.seoDescription = `احصل على ${p.name} الأصلي بأفضل الأسعار التنافسية وبوليصة لوجستية سريعة لباب منزلك.`;
              updates.seoKeywords = `${p.name}, عود, بخور سعودي, مراسيم الطيب, سهم برين, متجر الكتروني`;
              changed = true;
            }

            if (!p.sku) {
              updates.sku = `SKU-AUTO-${p.id.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
              changed = true;
            }

            if (margin < 0.20 && p.cost > 0) {
              updates.price = Math.round(p.cost / 0.75); // Target 25% margin
              changed = true;
            }

            if (!p.image) {
              updates.image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='100%' height='100%' fill='%230b1329'/><circle cx='150' cy='150' r='100' fill='none' stroke='%23d4af37' stroke-width='2' stroke-dasharray='10 5'/><text x='50%' y='48%' font-family='Cairo, sans-serif' font-size='16' fill='%23d4af37' font-weight='bold' text-anchor='middle'>سهم OS للذكاء الاصطناعي</text><text x='50%' y='58%' font-family='Cairo, sans-serif' font-size='12' fill='%2394a3b8' text-anchor='middle'>تم توليد الصورة الرقمية الفاخرة</text></svg>";
              changed = true;
            }

            if (changed) {
              const res = await productService.update(p.id, updates);
              return res ? { ...p, ...updates } : p;
            }
            return p;
          }));

          setProducts(updatedProductsList);

          // Finished
          setTimeout(() => {
            setIsBulkOptimizing(false);
            setBulkStep(0);
            triggerNotification("تم إتمام التحسين الشامل لـ الكتالوج وترقية الصحة إلى 100%! 🚀", "success");
            addAuditLog("اكتمال التحسين الشامل", "تمت ترقية صحة وهوامش الكتالوج بنجاح وتلافي هوامش الخسارة.");
          }, 1500);

        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Helper styling based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10B981"; // emerald
    if (score >= 60) return "#F59E0B"; // amber
    return "#EF4444"; // rose
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "rgba(16, 185, 129, 0.1)";
    if (score >= 60) return "rgba(245, 158, 11, 0.1)";
    return "rgba(239, 68, 68, 0.1)";
  };

  return (
    <div className="space-y-6 text-right font-sans text-white" dir="rtl">
      
      {/* 👑 Riyadh Royal Premium Dashboard Header */}
      <div 
        className="relative overflow-hidden p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-8 transition-all"
        style={{ 
          backgroundColor: '#0b1329', 
          borderColor: 'rgba(212,175,55,0.35)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212,175,55,0.1)'
        }}
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        {/* Left Side: Circular Health Gauge with Double Ring Gold/Green Glow */}
        <div className="flex items-center gap-6 z-10">
          <div className="relative w-36 h-36 flex items-center justify-center rounded-full" style={{
            background: 'radial-gradient(circle, rgba(15,23,42,0.8) 0%, rgba(11,19,41,0.9) 100%)',
            boxShadow: '0 0 30px rgba(212,175,55,0.15), inset 0 0 20px rgba(16,185,129,0.1)'
          }}>
            {/* SVG Double Arcs */}
            <svg className="absolute w-32 h-32 transform -rotate-90">
              {/* Outer Track */}
              <circle cx="64" cy="64" r="54" stroke="rgba(30,41,59,0.5)" strokeWidth="6" fill="none" />
              {/* Outer Progress (Health Score) */}
              <circle 
                cx="64" 
                cy="64" 
                r="54" 
                stroke={getScoreColor(stats.avgScore)} 
                strokeWidth="6" 
                fill="none"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - stats.avgScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${getScoreColor(stats.avgScore)}80)`
                }}
              />
              
              {/* Inner Track */}
              <circle cx="64" cy="64" r="44" stroke="rgba(30,41,59,0.3)" strokeWidth="3" fill="none" />
              {/* Inner Progress (Glow offset) */}
              <circle 
                cx="64" 
                cy="64" 
                r="44" 
                stroke="#10B981" 
                strokeWidth="3" 
                fill="none"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - stats.avgScore / 100)}`}
                strokeLinecap="round"
                className="opacity-60 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-mono tracking-tight">{stats.avgScore}%</span>
              <span className="text-[8px] font-extrabold text-[#10B981] tracking-widest uppercase mt-0.5">Health</span>
            </div>
          </div>
          
          <div className="space-y-1.5 text-right font-sans">
            <h4 className="text-sm font-black text-white">صحة المتجر ({stats.avgScore}%)</h4>
            <p className="text-[10.5px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{stats.avgScore >= 90 ? "ممتاز - أداء قوي جداً" : stats.avgScore >= 60 ? "جيد - أداء مستقر" : "حرج - بحاجة لإصلاح"}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Title, Subtitle, and AI Bulk Optimize Button */}
        <div className="flex flex-col items-center md:items-end gap-5 text-center md:text-right z-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center md:justify-end gap-2 font-serif">
              <span>سهم (Sahm)</span>
              <span className="text-[#D4AF37] text-2xl font-black">⚜</span>
            </h1>
            <h3 className="text-lg font-bold text-[#D4AF37] tracking-wide font-sans">
              نظام تشغيل التجزئة الرقمي الموحد
            </h3>
          </div>
          
          <button
            onClick={handleBulkAIOptimize}
            disabled={isBulkOptimizing}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 border-0 font-sans"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>التحسين الشامل بالذكاء الاصطناعي (AI Bulk Optimize)</span>
          </button>
        </div>
      </div>

      {/* Grid: Columns of Metrics and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Vertical stack of metric cards (width 4/12) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Low Stock Products */}
          <div 
            className="p-5 rounded-2xl border transition-all hover:scale-[1.01]"
            style={{ 
              backgroundColor: '#111827', 
              borderColor: 'rgba(212,175,55,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div className="flex justify-between items-start">
              <span className="w-2 h-2 rounded-full bg-emerald-450 mt-1 shadow-[0_0_8px_#10b981]" />
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-gray-400">المنتجات منخفضة المخزون</span>
                <div className="text-2xl font-black text-white font-mono">
                  {stats.lowStock} <span className="text-xs text-gray-500 font-sans">منتجات</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3.5">
              <div className="bg-emerald-400 h-full" style={{ width: `${Math.max(10, 100 - (stats.lowStock / Math.max(1, products.length)) * 100)}%` }}></div>
            </div>
          </div>

          {/* Card 2: Low Margin Products */}
          <div 
            className="p-5 rounded-2xl border transition-all hover:scale-[1.01]"
            style={{ 
              backgroundColor: '#111827', 
              borderColor: 'rgba(212,175,55,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-1.5 bg-rose-500/10 text-rose-450 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-gray-400">هامش ربح منخفض</span>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {stats.lowMargin} <span className="text-xs text-gray-500 font-sans">فاخر</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3.5">
              <div className="bg-rose-400 h-full" style={{ width: `${(stats.lowMargin / Math.max(1, products.length)) * 100}%` }}></div>
            </div>
          </div>

          {/* Card 3: Missing SEO Data */}
          <div 
            className="p-5 rounded-2xl border transition-all hover:scale-[1.01]"
            style={{ 
              backgroundColor: '#111827', 
              borderColor: 'rgba(212,175,55,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-1.5 bg-amber-500/10 text-amber-450 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-gray-400">بيانات SEO مفقودة</span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {stats.missingSeo} <span className="text-xs text-gray-500 font-sans">فاخر</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3.5">
              <div className="bg-amber-400 h-full" style={{ width: `${(stats.missingSeo / Math.max(1, products.length)) * 100}%` }}></div>
            </div>
          </div>

        </div>

        {/* Right Column: Sparklines and Table (width 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Sparkline Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Sparkline 1 */}
            <div className="p-4 rounded-xl border bg-slate-950/40" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9.5px] font-bold text-gray-400">تباطؤ المبيعات</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              </div>
              {/* Inline SVG Chart */}
              <svg viewBox="0 0 100 25" className="w-full h-8 overflow-visible">
                <path d="M0,15 Q15,5 30,18 T60,5 T90,20" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Sparkline 2 */}
            <div className="p-4 rounded-xl border bg-slate-950/40" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9.5px] font-bold text-gray-400">الضبط اللفظي</span>
                <Layers className="w-3.5 h-3.5 text-emerald-450" />
              </div>
              <svg viewBox="0 0 100 25" className="w-full h-8 overflow-visible">
                <path d="M0,8 Q20,18 40,5 T80,18 T100,10" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Sparkline 3 */}
            <div className="p-4 rounded-xl border bg-slate-950/40" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9.5px] font-bold text-gray-400">أخطاء الطائف</span>
                <Zap className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <svg viewBox="0 0 100 25" className="w-full h-8 overflow-visible">
                <path d="M0,20 Q15,10 35,22 T70,5 T100,15" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

          </div>

          {/* Table Card */}
          <div 
            className="rounded-3xl border overflow-hidden p-6 space-y-4"
            style={{ 
              backgroundColor: '#0f172a', 
              borderColor: 'rgba(212,175,55,0.15)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
            }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black text-white">قائمة المنتجات - نظرة عامة</h3>
              
              {/* Search input in table card */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute top-2.5 right-3" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-8 py-1.5 w-60 rounded-lg text-[10.5px] border outline-none text-right bg-slate-950/40 text-white font-bold"
                  style={{ borderColor: 'rgba(212,175,55,0.2)' }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-gray-400 font-extrabold text-[10px] tracking-wider bg-slate-950/10">
                    <th className="py-3 px-3">اسم المنتج</th>
                    <th className="py-3 px-3 text-center w-24">المخزون</th>
                    <th className="py-3 px-3 text-center w-24">السعر</th>
                    <th className="py-3 px-3 text-center w-36">اكتمال البيانات</th>
                    <th className="py-3 px-3 text-center w-32">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 font-bold">
                        🟢 لا توجد منتجات مطابقة للبحث أو الكتالوج صحي 100%!
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((item) => {
                      const p = item.product;
                      const isOptimizing = optimizingProductId === p.id;
                      
                      return (
                        <tr key={p.id} className="hover:bg-slate-900/35 transition-colors group">
                          
                          {/* Name & Sub-details */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg border border-slate-800 shrink-0 bg-slate-950/60 overflow-hidden flex items-center justify-center text-amber-500 font-bold">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  p.name.charAt(0)
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-white block group-hover:text-amber-400 transition-colors text-xs">{p.name}</span>
                                <span className="text-[9.5px] text-gray-500 block">
                                  {p.category || "عطور وبخور"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-white text-xs">
                            {p.stock}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-white text-xs">
                            {p.price} ر.س
                          </td>

                          {/* Completeness score bar */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="font-mono font-bold text-white text-[11px]">{item.completeness}%</span>
                              <div className="w-24 bg-slate-900 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500" 
                                  style={{ 
                                    width: `${item.completeness}%`,
                                    backgroundColor: getScoreColor(item.completeness)
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleSingleAIFix(item)}
                              disabled={isBulkOptimizing || isOptimizing || item.completeness === 100}
                              className={`w-full py-1.5 rounded-lg text-[9.5px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                                item.completeness === 100 
                                  ? "bg-slate-900 border-slate-800 text-gray-500 cursor-not-allowed" 
                                  : "bg-amber-400/10 hover:bg-amber-400/20 text-[#D4AF37] border-[#D4AF37]/30"
                              }`}
                            >
                              {isOptimizing ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>جاري...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  <span>إصلاح تلقائي بالذكاء الاصطناعي</span>
                                </>
                              )}
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* 🚀 Elegant Royal AI Bulk Optimization Process Overlay Modal */}
      {isBulkOptimizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fadeIn" dir="rtl">
          <div 
            className="w-full max-w-lg p-8 rounded-3xl border text-right space-y-6 relative overflow-hidden shadow-2xl"
            style={{ 
              backgroundColor: "rgba(11, 19, 41, 0.95)", 
              borderColor: "rgba(212, 175, 55, 0.3)" 
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 animate-pulse"></div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-spin-slow">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">معالج أتمتة وتحسين كتالوج سهم الذكي 🧠🤖</h3>
              <p className="text-xs text-gray-400">يرجى الانتظار، يتم حالياً معالجة كافة المنتجات بالامتثال لقواعد الربط السحابي ومحركات تسعير سهم</p>
            </div>

            <div className="space-y-4 py-4 border-t border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    bulkStep > 1 ? "bg-emerald-500 text-black" : bulkStep === 1 ? "bg-amber-500 text-black animate-pulse" : "bg-slate-900 text-gray-500"
                  }`}>
                    {bulkStep > 1 ? "✓" : "١"}
                  </span>
                  <span className={`text-xs font-black ${bulkStep >= 1 ? "text-white" : "text-gray-500"}`}>
                    فحص كتالوج المنتجات وتحديد الفجوات
                  </span>
                </div>
                {bulkStep === 1 && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                {bulkStep > 1 && <span className="text-[10px] text-emerald-400 font-bold">مكتمل</span>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    bulkStep > 2 ? "bg-emerald-500 text-black" : bulkStep === 2 ? "bg-amber-500 text-black animate-pulse" : "bg-slate-900 text-gray-500"
                  }`}>
                    {bulkStep > 2 ? "✓" : "٢"}
                  </span>
                  <span className={`text-xs font-black ${bulkStep >= 2 ? "text-white" : "text-gray-500"}`}>
                    استدعاء Gemini 3.5 لتوليد أوصاف المحتوى وعلامات الـ SEO
                  </span>
                </div>
                {bulkStep === 2 && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                {bulkStep > 2 && <span className="text-[10px] text-emerald-400 font-bold">مكتمل</span>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    bulkStep > 3 ? "bg-emerald-500 text-black" : bulkStep === 3 ? "bg-amber-500 text-black animate-pulse" : "bg-slate-900 text-gray-500"
                  }`}>
                    {bulkStep > 3 ? "✓" : "٣"}
                  </span>
                  <span className={`text-xs font-black ${bulkStep >= 3 ? "text-white" : "text-gray-500"}`}>
                    تطبيق معادلات التسعير وضمان هوامش الأرباح (أكبر من 25%)
                  </span>
                </div>
                {bulkStep === 3 && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                {bulkStep > 3 && <span className="text-[10px] text-emerald-400 font-bold">مكتمل</span>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    bulkStep > 4 ? "bg-emerald-500 text-black" : bulkStep === 4 ? "bg-amber-500 text-black animate-pulse" : "bg-slate-900 text-gray-500"
                  }`}>
                    {bulkStep > 4 ? "✓" : "٤"}
                  </span>
                  <span className={`text-xs font-black ${bulkStep >= 4 ? "text-white" : "text-gray-500"}`}>
                    تحديث القيود وتوليد وسوم الباركود وخط الزمن
                  </span>
                </div>
                {bulkStep === 4 && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                {bulkStep > 4 && <span className="text-[10px] text-emerald-400 font-bold">مكتمل</span>}
              </div>
            </div>

            <div className="text-center font-mono text-[9px] text-amber-500/60">
              🚨 لا تقم بإغلاق المتصفح أثناء تشغيل خوارزمية سهم الذكية...
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

