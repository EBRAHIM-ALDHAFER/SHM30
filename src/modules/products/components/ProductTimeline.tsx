import React from "react";
import { Product } from "../../../types";

interface ProductTimelineProps {
  product: Product;
}

export function ProductTimeline({ product }: ProductTimelineProps) {
  return (
    <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl text-[9px] text-gray-400 font-mono leading-relaxed">
      <div className="border-r-2 border-amber-500 pr-2 relative">
        <strong className="text-white block text-[10px]">١ مايو ٢٠٢٦ (تهيئة الصنف):</strong>
        <span>تم ربط الصنف المركزي بنام كاشير سهم وحساب تمديد الضريبة.</span>
      </div>
      
      <div className="border-r-2 border-emerald-500 pr-2 relative">
        <strong className="text-white block text-[10px]">١٤ مايو ٢٠٢٦ (التوريد Base Stock):</strong>
        <span>توريد {product.stock + 40} وحدة مبدئياً بمستودع الرياض السلي للتدقيق والباركود.</span>
      </div>

      <div className="border-r-2 border-purple-500 pr-2 relative">
        <strong className="text-white block text-[10px]">النشاط والكميات الحالية:</strong>
        <span>تبقت بقنوات الكاشير والتحويلات والمستودعات {product.stock} وحدة نشطة.</span>
      </div>
    </div>
  );
}
