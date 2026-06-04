import React, { useState } from "react";
import { Product, ThemeColors } from "../../../types";
import { 
  Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Compass, 
  BarChart, ClipboardList, BookOpen, Layers
} from "lucide-react";
import { getProductHealth, formatMoney } from "../services/productUiService";
import { ProductTimeline } from "./ProductTimeline";
import { ProductCampaignsTab } from "./ProductCampaignsTab";
import { ProductCompetitorsTab } from "./ProductCompetitorsTab";

interface ProductDetailsProps {
  product: Product | null;
  theme: ThemeColors;
  triggerNotification?: (text: string, type: any) => void;
  onOpenCatalog?: (p: Product) => void;
  user?: any;
}

type DetailTab = "stages" | "timeline" | "campaigns" | "competitors";

export function ProductDetails({
  product,
  theme,
  triggerNotification,
  onOpenCatalog,
  user
}: ProductDetailsProps) {
  const [detailTab, setDetailTab] = useState<DetailTab>("stages");

  if (!product) {
    return (
      <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-950 text-gray-500 text-xs">
        لم يتم تحديد أي صنف لإظهار مؤشرات دورة حياته والـ Health Score.
      </div>
    );
  }

  const health = getProductHealth(product);

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-6 relative overflow-hidden text-right font-sans">
      <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Sidebar Header */}
      <div className="border-b border-slate-800 pb-3">
        <div className="text-right font-sans">
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded inline-block">وثيقة تفصيل الصنف الذكية</span>
          <h4 className="text-sm font-black text-white mt-2 leading-relaxed">{product.name}</h4>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">باركود SKU: {product.sku}</p>
        </div>
      </div>

      {/* Health score dashboard */}
      <div>
        <h5 className="text-[10px] font-black text-gray-400">• مؤشر سلامة دوران الصنف (Product Health Score)</h5>
        
        <div className="bg-slate-950 rounded-xl p-3.5 mt-2 flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#1E293B" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke={health > 75 ? "#10B981" : health > 30 ? "#F59E0B" : "#EF4444"} strokeWidth="5" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - health / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{health}%</span>
          </div>

          <div className="space-y-1">
            <span className="font-black text-xs block text-white">
              {health > 75 ? "مرحلة ممتازة ومثالية" : health > 30 ? "تحتاج لمراجعة المخزون" : "حالة صحيّة حرجة للطلب!"}
            </span>
            <span className="text-[9px] text-gray-500 leading-normal block">
              درجة الأمان المالي واللوجيستي للسلعة استناداً إلى كميات المستودع وسرعة دوران البيع وهامش الربحية المقررة.
            </span>
          </div>
        </div>
      </div>

      {/* Internal subtab switches */}
      <div className="flex border-b border-slate-800 p-0.5 bg-slate-950 rounded-lg">
        {[
          { id: "stages", label: "دورة الحياة ⚙️" },
          { id: "timeline", label: "سجل التدقيق 📅" },
          { id: "campaigns", label: "الحملات 📢" },
          { id: "competitors", label: "المنافسة ⚖️" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDetailTab(tab.id as DetailTab)}
            className={`flex-1 text-[9px] py-1.5 rounded-md font-bold transition-all text-center cursor-pointer border-none ${detailTab === tab.id ? 'bg-amber-500 text-black font-black' : 'text-gray-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active detail sub-tab router rendering */}
      <div className="transition-all duration-300">
        
        {/* Stages View */}
        {detailTab === "stages" && (
          <div className="space-y-2">
            <h5 className="text-[10px] font-black text-gray-400">• دورة الحياة ومراحل السلعة (Product Lifecycle)</h5>
            
            <div className="space-y-2 mt-2 bg-slate-950 p-3 rounded-lg">
              {[
                { stageId: 1, label: "صناعة الفكرة والتصميم (AI Builder)", done: true, desc: "توليف صفات العطر أو الصنف الإبداعي" },
                { stageId: 2, label: "التوريد ومطابقة الجودة (Supply Line)", done: true, desc: "اعتماد سعر التكلفة والوارد بالمستودع" },
                { stageId: 3, label: "العرض والنشاط العالي (POS Live)", done: product.stock > 0, desc: "إتاحة السلعة في شاشات الكاشير لـ سهم" },
                { stageId: 4, label: "نضوج الأرباح الصافية (Growth Stage)", done: product.price - product.cost > 40, desc: "استقرار الهامش وتحقيق العوائد المستهدفة" },
                { stageId: 5, label: "الأرشفة وبديل التحديث (Archive Phase)", done: false, desc: "المرحلة اللانهائية للتحديث والدمج الترويجي" }
              ].map((stage, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-mono leading-none ${stage.done ? "bg-emerald-500 border-emerald-500 text-black" : "bg-slate-900 border-slate-800 text-gray-500"}`}>
                      {stage.done ? "✓" : idx + 1}
                    </div>
                    {idx < 4 && <div className="w-0.5 h-5 bg-slate-800" />}
                  </div>
                  <div className="pb-1">
                    <span className={`text-[10px] font-bold block ${stage.done ? 'text-white' : 'text-gray-500'}`}>{stage.label}</span>
                    <span className="text-[8px] text-gray-600 block leading-tight">{stage.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Component */}
        {detailTab === "timeline" && (
          <ProductTimeline product={product} />
        )}

        {/* Campaigns Tab Component */}
        {detailTab === "campaigns" && (
          <ProductCampaignsTab 
            product={product} 
            theme={theme} 
            triggerNotification={triggerNotification} 
          />
        )}

        {/* Competitors Tab Component */}
        {detailTab === "competitors" && (
          <ProductCompetitorsTab 
            product={product} 
            theme={theme} 
            triggerNotification={triggerNotification}
          />
        )}

      </div>
    </div>
  );
}
