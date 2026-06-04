import React, { useState } from "react";
import { ThemeColors, Customer, Invoice } from "../types";
import { User, ShieldAlert, BadgeInfo, CheckCircle, FileText, Send, HelpCircle, Phone, Award } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import AddressCard from "./AddressCard";

interface CustomerTimeline360Props {
  theme: ThemeColors;
  customers: Customer[];
  invoices: Invoice[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
  triggerNotification: (title: string, text: string, type: "success" | "warning" | "info" | "critical" | "ai") => void;
}

export default function CustomerTimeline360({
  theme,
  customers,
  invoices,
  selectedCustomerId,
  setSelectedCustomerId,
  onAddLog,
  triggerNotification
}: CustomerTimeline360Props) {
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("sahm_crm_customer_notes_v9");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [noteInput, setNoteInput] = useState("");

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  if (!activeCustomer) {
    return (
      <div className="p-6 text-center text-xs text-gray-500">
        ⏳ لم يتم العثور على أية عملاء مسجلين حالياً بالمنظومة لتجهيز الملف التعريفي.
      </div>
    );
  }

  const linkedInvoices = invoices.filter((i) => i.customer === activeCustomer.name);
  const totalSalesSpent = linkedInvoices.filter((i) => i.type === "sale").reduce((sum, i) => sum + i.total, 0);

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const updated = { ...internalNotes, [activeCustomer.id]: noteInput.trim() };
    setInternalNotes(updated);
    localStorage.setItem("sahm_crm_customer_notes_v9", JSON.stringify(updated));
    setNoteInput("");
    onAddLog("مذكرة سهم CRM", `تحديث ملاحظات العقد السرية لتوليد توصية للعميل: ${activeCustomer.name}`);
    triggerNotification("💾 تم الحفظ بنجاح", `تم تحديث ملف الملاحظات السرية للعميل ${activeCustomer.name} بالمنظومة الحية.`, "success");
  };

  const getLoyaltyTier = (spent: number) => {
    if (spent >= 15000) return { name: "البلاتينية الملكية ROYAL ELITE PLATINUM", color: "text-[#D4AF37] bg-yellow-500/10 border-[#D4AF37]/30" };
    if (spent >= 6000) return { name: "الذهبية الفاخرة GOLD LUXURY", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { name: "الفئة الفضية SILVER EXECUTIVE", color: "text-sky-400 bg-indigo-500/10 border-indigo-500/20" };
  };

  const loyalty = getLoyaltyTier(totalSalesSpent);

  return (
    <div
      className="p-6 rounded-3xl border text-right space-y-5 shadow-xl font-sans"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-3 self-start md:self-center">
          <span className="text-xs font-black text-gray-400">العميل الفعال:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-xs py-2 px-4 rounded-xl border outline-none font-bold transition-all cursor-pointer shadow hover:border-amber-500"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} • VIP
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-sm font-black flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
            <Award className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span>نظام ملفات كبار العملاء واسترجاع الولاء (Customer Profile Hub 360 & Loyalty Index)</span>
          </h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>
            تحليل شامل لنشاط المبيعات، ومطابقة الرصيد المفتوح، وصيانة تعليقات الوكلاء السرية لمتجر مراسيم الطيب
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Profile Card Sidebar */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-950/20 border border-slate-900 space-y-5">
          <div className="text-center space-y-3 border-b border-slate-900 pb-4">
            <div className="relative inline-block">
              <ProfileAvatar 
                name={activeCustomer.name} 
                imageUrl={activeCustomer.imageUrl} 
                size="lg" 
                theme={theme}
              />
              <span className="absolute -bottom-1 -right-1 bg-black border border-[#D4AF37] px-2 py-0.5 rounded-full text-[8px] font-black text-[#D4AF37] select-none">
                VIP
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">{activeCustomer.name}</h3>
              <p className="text-[10.5px] font-mono text-gray-400 mt-1">📞 {activeCustomer.phone}</p>
              <span className="inline-block text-[9px] font-bold py-1 px-2.5 rounded-full bg-slate-900 text-amber-500 border border-[#D4AF37]/20 mt-1">
                📍 {activeCustomer.city} • المنطقة السعودية
              </span>
            </div>

            {/* AddressCard rendering inside sidebar */}
            {activeCustomer.addressProfile && (
              <div className="mt-3">
                <AddressCard 
                  address={activeCustomer.addressProfile} 
                  theme={theme} 
                  onCopySuccess={(msg) => triggerNotification("📋 نسخ العنوان", msg, "success")}
                />
              </div>
            )}
          </div>

          {/* Loyalty Level widget */}
          <div className="space-y-2 text-right">
            <span className="text-[9.5px] text-gray-400 block font-bold">مستوى ولاء العميل التفاعلي:</span>
            <div className={`p-3 rounded-2xl border text-center font-black text-[10.5px] ${loyalty.color}`}>
              {loyalty.name}
            </div>
          </div>

          {/* Key Financial KPIs */}
          <div className="space-y-2.5 text-xs font-bold pt-1">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-900 flex justify-between items-center whitespace-nowrap">
              <span className="text-gray-400 font-bold">إجمالي المشتريات المالية:</span>
              <span className="font-extrabold text-emerald-400 font-mono">{(totalSalesSpent ?? 0).toLocaleString()} ر.س</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-900 flex justify-between items-center whitespace-nowrap">
              <span className="text-gray-400 font-bold">عدد الفواتير الصادرة:</span>
              <span className="font-extrabold text-sky-400 font-mono">{linkedInvoices.length} فواتير</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-900 flex justify-between items-center whitespace-nowrap">
              <span className="text-gray-400 font-bold">رصيد المطالبة الذاتية:</span>
              <span className={`font-extrabold font-mono ${activeCustomer.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {activeCustomer.balance === 0 ? "0.00 ر.س (متطابق)" : `${(activeCustomer.balance ?? 0).toLocaleString()} ر.س`}
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Timelines and Agency Notes */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-slate-950/20 border border-slate-900 space-y-5">
          {/* Linked Invoices Scroll timeline */}
          <div>
            <h4 className="text-xs font-black pb-2.5 text-right border-b border-slate-900 text-white flex items-center justify-between">
              <span className="text-gray-500 font-normal">مطابقة مستندية دقيقة</span>
              <span className="text-amber-500">📜 عقد وسجلات العمليات المالية</span>
            </h4>

            <div className="space-y-2 mt-3 max-h-[160px] overflow-y-auto pr-1">
              {linkedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 flex items-center justify-between text-[11px] font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-amber-500 text-center">{inv.id}</span>
                    <span className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 text-[8px] rounded border border-emerald-500/20">
                      ثقة مغلقة ✅
                    </span>
                  </div>
                  <span className="font-mono text-gray-400 text-[10px]">{inv.date}</span>
                  <div className="text-left font-bold text-gray-200">
                    <span className="font-mono block text-xs">{inv.total} ر.س</span>
                    <span className="text-[8px] text-emerald-400 font-black tracking-wider uppercase">{inv.status}</span>
                  </div>
                </div>
              ))}

              {linkedInvoices.length === 0 && (
                <div className="text-center py-6 text-[10.5px] text-gray-500 font-medium bg-slate-900/10 rounded-xl border border-slate-900/40">
                  ⌛ لا توجد صفقات أو فواتير توريد مفعّلة باسم هذا المستخدم المسجل مطلقاً.
                </div>
              )}
            </div>
          </div>

          {/* Internal Private Notes Notebook */}
          <div className="space-y-3.5 pt-2 border-t border-slate-900">
            <h4 className="text-xs font-black text-white text-right flex items-center justify-between">
              <span className="text-[9px] font-normal text-amber-500 font-mono">بيانات سرية مشفرة لخدمة العملاء</span>
              <span>🔒 سجل المذكرات والتعليمات الإدارية الخاصة</span>
            </h4>

            <textarea
              rows={3}
              placeholder="اكتب هنا أية تفاصيل خاصة بصوت لزبون، عينات البخور والأدهان المفضلة لديه، نبرة اللباقة والتعامل، فترات الزيارة أو جدول شحن Aramex الخاص..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full text-xs p-3.5 rounded-2xl border outline-none font-bold"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            />

            <div className="flex justify-between items-center">
              <div className="text-[10px] text-gray-500 max-w-xs">
                {internalNotes[activeCustomer.id] ? (
                  <span className="text-amber-500/90 font-bold block truncate max-w-xs text-right">
                    المفكرة الحالية: "{internalNotes[activeCustomer.id]}"
                  </span>
                ) : (
                  <span>* لا توجد مذكرات نشطة حالياً لهذا العقد.</span>
                )}
              </div>

              <button
                onClick={handleSaveNote}
                className="py-2 px-5 text-xs font-black rounded-xl text-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow border-0"
                style={{ backgroundColor: theme.accent }}
              >
                تحديث وحفظ مفكرة العميل 💾
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
