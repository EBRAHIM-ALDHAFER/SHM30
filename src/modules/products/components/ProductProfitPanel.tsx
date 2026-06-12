import React from "react";
import { Product, ThemeColors } from "../../../types";
import { formatMoney } from "../services/productUiService";

interface ProductProfitPanelProps {
  products: Product[];
  theme: ThemeColors;
  applyAIMarkupMultiplier: (percentage: number) => void;
}

export function ProductProfitPanel({
  products,
  theme,
  applyAIMarkupMultiplier
}: ProductProfitPanelProps) {
  
  const totalCapitalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const totalExpectedSaleValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalProjectedProfit = totalExpectedSaleValue - totalCapitalValue;

  return (
    <div className="space-y-6 text-right font-sans">
      
      <div className="border-r-4 border-amber-500 pr-4">
        <h3 className="text-base font-black text-white">تدقيق التكلفة وهوامش الأرباح الإدارية للكاشير</h3>
        <p className="text-xs text-gray-400">المركز المحاسبي لتحليل الأداء الاستثماري وقيمة السلع الرأسمالية بالمستودعات</p>
      </div>

      {/* Global Cost summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1 font-sans">إجمالي تكلفة المخزون الرأسمالية</span>
          <span className="text-xl text-white font-black">{formatMoney(totalCapitalValue)}</span>
          <p className="text-[9px] text-gray-500 mt-2 font-sans leading-normal">القيمة الإجمالية المدفوعة في خط التوريد لامتلاك المخزون الحالي.</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1 font-sans">العائد الكلي المقدر للبيع</span>
          <span className="text-xl text-emerald-400 font-black">{formatMoney(totalExpectedSaleValue)}</span>
          <p className="text-[9px] text-gray-500 mt-2 font-sans leading-normal">القيمة المتوقع استلامها مع خصم ضريبة القيمة المضافة ومستحقات الشركاء.</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1 font-sans">الأرباح التشغيلية المتوقعة الصافية</span>
          <span className="text-xl font-black" style={{ color: theme.accent }}>{formatMoney(totalProjectedProfit)}</span>
          <p className="text-[9px] text-gray-400 mt-2 leading-relaxed font-sans leading-normal">الأرباح المستقبلية المضمونة بعد تصريف جميع وحدات المستودعات.</p>
        </div>

      </div>

      {/* Interactive pricing simulator and multiplier */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-black text-amber-500 bg-amber-500/10 py-1 px-2.5 rounded inline-block">محاكاة الأسعار والزيادات التضخمية في سهم</h4>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal font-sans">
              تحكم بتعديل سعر البيع بنسب مبرمجة لمواجهة ارتفاع تكاليف الموردين وتوريد العطور:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => applyAIMarkupMultiplier(10)} className="py-1.5 px-3 rounded-lg text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold cursor-pointer">
              +10% AI زيادة
            </button>
            <button onClick={() => applyAIMarkupMultiplier(15)} className="py-1.5 px-3 rounded-lg text-[10px] bg-amber-500 hover:bg-amber-400 text-black font-black cursor-pointer" style={{ backgroundColor: theme.accent }}>
              +15% تضخم سهم
            </button>
          </div>
        </div>

        {/* Products table list with calculated profits ( Requirement 5: Expected margins, costs & selling prices list ) */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950 text-xs">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-gray-400 font-bold">
                <th className="p-3 text-right">المنتج</th>
                <th className="p-3 text-center">تكلفة الشراء</th>
                <th className="p-3 text-center">سعر البيع المقدر</th>
                <th className="p-3 text-center">هامش الربح المطلق</th>
                <th className="p-3 text-center">عائد الهامش نسبة %</th>
                <th className="p-3 text-center">المخرون</th>
                <th className="p-3 text-left">الأرباح المتوقعة</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 10).map(p => {
                const absoluteMargin = p.price - p.cost;
                const percentage = p.cost > 0 ? Math.round((absoluteMargin / p.cost) * 100) : 100;
                return (
                  <tr key={p.id} className="border-b border-slate-900/60 hover:bg-slate-900 duration-150 font-mono">
                    <td className="p-3 font-black text-white font-sans text-right">{p.name}</td>
                    <td className="p-3 text-center text-gray-400">{formatMoney(p.cost)}</td>
                    <td className="p-3 text-center text-white font-black">{formatMoney(p.price)}</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">+{formatMoney(absoluteMargin)}</td>
                    <td className="p-3 text-center text-emerald-500">
                      <span className="bg-emerald-500/10 py-0.5 px-2 rounded-full font-black text-[10px]">
                        %{percentage}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-300">{p.stock}</td>
                    <td className="p-3 text-left font-black" style={{ color: theme.accent }}>
                      {formatMoney(absoluteMargin * p.stock)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* High profit margin vs low warning margins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Product with highest profit yields ( Requirement 5: High profitable products ) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 relative overflow-hidden">
          <span className="absolute left-3 top-3 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded font-black">
            مستوى ربحية مجزٍ
          </span>
          <h4 className="text-xs font-black text-emerald-400">• أعلى سلع معروضة ربحيةً (Top Profitable Products)</h4>
          
          <div className="space-y-2 mt-4 font-mono">
            {products.filter(p => p.price - p.cost >= 120).slice(0, 3).map(p => (
              <div key={p.id} className="p-2.5 rounded bg-slate-950 flex justify-between items-center text-xs">
                <span className="font-sans text-gray-300">{p.name}</span>
                <strong className="text-emerald-400">+{formatMoney(p.price - p.cost)} كسب صافي</strong>
              </div>
            ))}
            {products.filter(p => p.price - p.cost >= 120).length === 0 && (
              <div className="text-[11px] text-gray-500 py-6 text-center font-sans">لا توجد سلع تتخطى معيار هامش الـ ١٢٠ ر.س حالياً.</div>
            )}
          </div>
        </div>

        {/* Product with warning low profit margins ( Requirement 5: warning low-margin review ) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 relative overflow-hidden">
          <span className="absolute left-3 top-3 text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 py-0.5 px-2 rounded font-black">
            مكسب منخفض (متحفّظ)
          </span>
          <h4 className="text-xs font-black text-amber-500 font-sans">• سلع بضالة هوامش الربح تدعو للمراجعة (Low Profit Margins)</h4>
          
          <div className="space-y-2 mt-4 font-mono">
            {products.filter(p => p.price - p.cost <= 50).slice(0, 3).map(p => (
              <div key={p.id} className="p-2.5 rounded bg-amber-500/5 border border-amber-500/10 flex justify-between items-center text-xs">
                <span className="font-sans text-gray-300">{p.name}</span>
                <strong className="text-amber-500">+{formatMoney(p.price - p.cost)} فقط</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
