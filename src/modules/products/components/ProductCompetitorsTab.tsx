import React from "react";
import { Product, ThemeColors } from "../../../types";

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
  return (
    <div className="space-y-4 font-sans text-right">
      <div className="p-4 bg-slate-950 rounded-xl space-y-3 border border-slate-900">
        <h6 className="text-[11px] font-black text-amber-500">مراقبة الأسعار والمنافسة السوقية الذكية ⚖️</h6>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          يقوم سهم بمسح وحساب فوارق الأسعار الفورية عبر المتاجر المنافسة (مثل سلة وزد وأمازون) لضمان تحقيق أعلى ربحية لمنتجاتك ومطابفتها مع عروض السوق.
        </p>
        
        <div className="pt-2">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("sahm_navigate_command_center", { detail: { subTab: "competitors" } }));
              if (triggerNotification) {
                triggerNotification("جاري انتقالك لمنظومة رصد المنافسين المستقلة 📡", "info");
              }
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white hover:text-amber-400 font-extrabold text-[10.5px] cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>قارن هذا المنتج بالمنافسين ⚖️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
