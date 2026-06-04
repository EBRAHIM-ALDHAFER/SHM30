import React, { useState } from "react";
import { Product, ThemeColors } from "../../../types";
import { Sparkles, Megaphone, CheckCircle2, TrendingUp } from "lucide-react";

interface ProductCampaignsTabProps {
  product: Product;
  theme: ThemeColors;
  triggerNotification?: (text: string, type: any) => void;
}

export function ProductCampaignsTab({
  product,
  theme,
  triggerNotification
}: ProductCampaignsTabProps) {
  const [campaigns, setCampaigns] = useState([
    { id: "c1", name: "صيف كاشير سهم ٢٠٢٦ ☀️", budget: 4500, state: "active", revenue: 12000, reach: 14000 },
    { id: "c2", name: "عيد الأضحى المبارك 🐑", budget: 8000, state: "scheduled", revenue: 0, reach: 0 }
  ]);

  const [campaignName, setCampaignName] = useState("");
  const [budget, setBudget] = useState("1000");

  const createCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    const newCampaign = {
      id: Date.now().toString(),
      name: campaignName.trim(),
      budget: parseFloat(budget) || 1000,
      state: "scheduled",
      revenue: 0,
      reach: 0
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setCampaignName("");
    if (triggerNotification) {
      triggerNotification(`تم قيد وجدولة الحملة الترويجية "${newCampaign.name}" للمبيعات 🚀`, "success");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-950 rounded-lg space-y-2">
        <h6 className="text-[10px] font-black text-amber-500">حملات التسويق والذكاء الترويجي المجدولة 📢</h6>
        <p className="text-[9px] text-gray-500 leading-normal">تابع أداء حملات سهم التي تروّج وصياغة هذا الصنف لزيادة معدل دوران السلعة:</p>

        <div className="space-y-2 mt-2">
          {campaigns.map(c => (
            <div key={c.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-[10px]">
              <div>
                <span className="text-white font-bold block">{c.name}</span>
                <span className="text-gray-500 text-[9px] block">الميزانية: {c.budget.toLocaleString()} ر.س</span>
              </div>
              <div className="text-left">
                <span className={`py-0.5 px-2 rounded-full font-black text-[8px] ${c.state === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {c.state === 'active' ? 'نشطة ومتفاعلة 🟢' : 'مجدولة 📅'}
                </span>
                {c.revenue > 0 && <span className="text-emerald-400 block font-mono text-[9px] mt-1">+{c.revenue.toLocaleString()} ر.س</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Form */}
      <form onSubmit={createCampaign} className="p-3 bg-slate-950 rounded-lg space-y-2.5">
        <h6 className="text-[10px] font-black text-white flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>توليد حملة ترويجية سريعة بالذكاء</span>
        </h6>
        
        <input
          type="text"
          placeholder="مثال: خصم ٢٠٪ ومباخر هدية..."
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          className="w-full text-[10px] rounded p-2 bg-slate-900 border border-slate-800 text-white outline-none"
        />

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="الميزانية"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="w-24 text-[10px] rounded p-2 bg-slate-900 border border-slate-800 text-white text-center"
          />
          <button
            type="submit"
            className="flex-1 py-1.5 rounded bg-amber-500 text-black text-[10px] font-black cursor-pointer"
          >
            جدولة وإطلاق فوري 🚀
          </button>
        </div>
      </form>
    </div>
  );
}
