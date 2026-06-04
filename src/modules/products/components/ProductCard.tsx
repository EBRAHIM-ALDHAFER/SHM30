import React from "react";
import { Product, ThemeColors } from "../../../types";
import { Sparkles } from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  theme: ThemeColors;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({
  product,
  theme,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}: ProductCardProps) {
  const isLow = product.stock > 0 && product.stock < 50;
  const isOut = product.stock === 0;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-4 border flex flex-col justify-between transition-all cursor-pointer relative ${
        isSelected
          ? "bg-slate-900 border-amber-500 ring-1 ring-amber-500/20"
          : "bg-slate-950/60 hover:bg-slate-900 border-slate-800"
      }`}
    >
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-bold py-0.5 px-2 rounded bg-slate-900 border border-slate-800 text-gray-400 font-mono">
            {product.sku}
          </span>
          <span
            className={`text-[9px] font-black py-0.5 px-2 rounded-full ${
              isOut
                ? "bg-red-500/10 text-red-400"
                : isLow
                ? "bg-amber-500/10 text-amber-505"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {isOut ? "نفدت الكمية ⚠️" : isLow ? "مخزون منخفض ⚠️" : "متوفر ونشط ✓"}
          </span>
        </div>

        <h4 className="text-xs font-black text-white hover:underline">{product.name}</h4>
        <span className="text-[10px] text-gray-500 block mt-1">{product.category}</span>
      </div>

      {/* Money figures */}
      <div className="border-t border-slate-800/80 pt-3 mt-4 flex justify-between items-center">
        <div>
          <span className="text-[9px] text-gray-500 block">سعر البيع</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">{formatMoney(product.price)}</span>
        </div>
        <div>
          <span className="text-[9px] text-gray-500 block">تكلفة الشراء</span>
          <span className="text-xs font-bold text-gray-400 font-mono">{formatMoney(product.cost)}</span>
        </div>
        <div>
          <span className="text-[9px] text-gray-500 block">كمية المخزن</span>
          <span className="text-xs font-black text-white font-mono">{product.stock}</span>
        </div>
      </div>

      {/* Interactive promotion indicators */}
      <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-slate-800/60">
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent("sahm_promote_product", { detail: product }));
          }}
          className="text-[9px] py-1 px-2 rounded bg-violet-600/15 text-violet-400 border border-violet-500/20 active:scale-95 cursor-pointer flex items-center gap-1 font-bold"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>إنشاء ترويج ✨</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-[9px] py-1 px-2 rounded bg-slate-900 text-blue-400 border border-slate-800 active:scale-95 cursor-pointer font-bold"
        >
          تعديل ⚙️
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-[9px] py-1 px-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer font-bold mr-auto"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
