import React, { useState } from "react";
import { Product, ThemeColors } from "../../../types";
import { TrendingDown, Percent, Sparkles, Check } from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductCompetitorsTabProps {
  product: Product;
  theme: ThemeColors;
  triggerNotification?: (text: string, type: any) => void;
}

export function ProductCompetitorsTab({
  product,
  theme,
  triggerNotification
}: ProductCompetitorsTabProps) {
  const [competitors, setCompetitors] = useState([
    { id: "comp_1", name: "متجر الفخامة المنافس", price: product.price + 15, delivery: "3 أيام", rating: "4.2" },
    { id: "comp_2", name: "أمازون السعودية", price: product.price - 5, delivery: "يوم واحد", rating: "4.5" },
    { id: "comp_3", name: "نون سنترال بالرياض", price: product.price + 8, delivery: "يومين", rating: "3.9" }
  ]);

  const avgPrice = Math.round(competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length);
  const isSahmCheaper = product.price < avgPrice;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-950 rounded-lg space-y-2">
        <h6 className="text-[10px] font-black text-blue-400">تحليل الأسعار والمنافسة السوقية الذكية ⚖️</h6>
        <p className="text-[9px] text-gray-400 leading-normal">
          يقارن سهم أسعار المنصات والمنافسين المحليين لضمان بقاء عروضك في الصدارة:
        </p>

        {/* Competitor list */}
        <div className="space-y-2 mt-3">
          {competitors.map(c => (
            <div key={c.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between items-center text-[10px]">
              <div>
                <span className="text-white font-bold block">{c.name}</span>
                <span className="text-gray-500 text-[8px] block">الشحن: {c.delivery} | التقويم: {c.rating}⭐</span>
              </div>
              <div className="text-left font-mono">
                <span className="text-gray-300 block font-bold">{formatMoney(c.price)}</span>
                <span className={`text-[8px] font-bold ${c.price > product.price ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {c.price > product.price ? `أغلى بـ +${c.price - product.price} ر.س` : `أرخص بـ -${product.price - c.price} ر.س`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Advice Summary Card */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex gap-3 items-start">
        <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs text-blue-400 shrink-0">
          ⚖️
        </div>
        <div className="space-y-1">
          <strong className="text-[10px] text-white block">نصيحة التسعير من سهم AI:</strong>
          
          <p className="text-[8px] text-gray-400 leading-normal">
            متوسط سعر السوق هو <strong className="text-white font-mono">{formatMoney(avgPrice)}</strong>. 
            أنت {isSahmCheaper ? "أرخص ومبيعاتك ذات أفضلية عالية بقنوات الكاشير ✓" : "أعلى بنسب بسيطة ويمكن تفعيل الخصم التلقائي لكاشير سهم لمطابقة المنافسة."}
          </p>

          {!isSahmCheaper && (
            <button
              onClick={() => {
                triggerNotification && triggerNotification(`تم مواءمة سعر السلعة مع متوسط السوق لـ ${formatMoney(avgPrice)} ✅`, "success");
              }}
              className="text-[8px] mt-1.5 py-1 px-2.5 rounded bg-blue-600/15 text-blue-400 border border-blue-500/20 active:scale-95 cursor-pointer font-bold inline-block"
            >
              مواءمة السعر الذكي وتحديث الكارتية 🪄
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
