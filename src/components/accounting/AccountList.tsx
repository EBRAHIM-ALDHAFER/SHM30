import React, { useState } from "react";
import { Account, ThemeColors } from "../../types";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";

interface AccountListProps {
  accounts: Account[];
  onAddAccount: (acc: Account) => void;
  onUpdateAccount: (updated: Account) => void;
  theme: ThemeColors;
}

export default function AccountList({ accounts, onAddAccount, onUpdateAccount, theme }: AccountListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAcc, setNewAcc] = useState<Partial<Account>>({
    code: "",
    name: "",
    type: "assets",
    status: "active",
    descriptionAr: ""
  });

  const categories = [
    { key: "assets", label: "الأموال المتوفرة والخزائن المتاحة 🏦", desc: "حسابات السيولة كصناديق الكاش، الحسابات البنكية، والمستودعات السلعية" },
    { key: "liabilities", label: "الالتزامات والديون المستحقة للغير 💳", desc: "المبالغ المطلوب سدادها للموردين، القروض، ومستحقات الضرائب والرواتب" },
    { key: "equity", label: "رأس المال وحقوق الملاك والشركاء 💼", desc: "رأس مال التأسيس والأرباح المحتجزة التي تعود ملكيتها للمؤسسين" },
    { key: "revenues", label: "مصادر الدخل والمبيعات اليومية 💰", desc: "الإيرادات المحققة من نقاط البيع (POS)، الصفقات وعقود الخدمات" },
    { key: "expenses", label: "المصاريف والتكاليف التشغيلية 📉", desc: "تكاليف التشغيل المتنوعة، الرواتب، إيجارات المعارض، والتسويق" }
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.code || !newAcc.name || !newAcc.type) return;
    onAddAccount({
      code: newAcc.code,
      name: newAcc.name,
      type: newAcc.type as any,
      status: (newAcc.status as any) || "active",
      descriptionAr: newAcc.descriptionAr || ""
    });
    setNewAcc({ code: "", name: "", type: "assets", status: "active", descriptionAr: "" });
    setShowAddForm(false);
  };

  const toggleStatus = (acc: Account) => {
    onUpdateAccount({
      ...acc,
      status: acc.status === "active" ? "suspended" : "active"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4" style={{ borderColor: theme.border }}>
        <div>
          <h3 className="text-sm font-black" style={{ color: theme.text }}>بنود الحسابات والخزائن المالية 🏦</h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>إدارة الخزائن النقدية، الحسابات البنكية، وبنود المصروفات والإيرادات للنشاط</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all hover:brightness-110 active:scale-95 cursor-pointer text-black"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بند حساب / خزينة جديدة ➕</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-right"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold block" style={{ color: theme.text }}>كود البند الجديد (الرقم التعريفي):</label>
            <input
              type="text"
              required
              placeholder="مثال: 1104"
              value={newAcc.code}
              onChange={e => setNewAcc({ ...newAcc, code: e.target.value })}
              className="w-full text-xs font-mono p-2 rounded-lg border focus:outline-none"
              style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold block" style={{ color: theme.text }}>اسم بند الحساب / الخزينة:</label>
            <input
              type="text"
              required
              placeholder="مثال: عهد المندوبين"
              value={newAcc.name}
              onChange={e => setNewAcc({ ...newAcc, name: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border focus:outline-none"
              style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold block" style={{ color: theme.text }}>نوع التصنيف للمصادقة:</label>
            <select
              value={newAcc.type}
              onChange={e => setNewAcc({ ...newAcc, type: e.target.value as any })}
              className="w-full text-xs p-2 rounded-lg border focus:outline-none font-bold"
              style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
            >
              <option value="assets">الأموال والخزائن 🏦</option>
              <option value="liabilities">الالتزامات والديون 💳</option>
              <option value="equity">رأس مال وحقوق ملاك 💼</option>
              <option value="revenues">المبيعات والإيرادات 💰</option>
              <option value="expenses">المصاريف والتكاليف 📉</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold block" style={{ color: theme.text }}>التوضيح والاستخدام الموصى به:</label>
            <input
              type="text"
              placeholder="وصف مبسط لطبيعة استخدام هذا البند"
              value={newAcc.descriptionAr}
              onChange={e => setNewAcc({ ...newAcc, descriptionAr: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border focus:outline-none"
              style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
            />
          </div>
          <div className="flex items-end justify-start">
            <button
              type="submit"
              className="px-4 py-2 w-full rounded-lg text-xs font-bold transition-all hover:bg-emerald-600 cursor-pointer text-white bg-emerald-500"
            >
              تأكيد إضافة البند / الخزينة 💾
            </button>
          </div>
        </form>
      )}

      {/* Grid of Classification Categories */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const matched = accounts.filter((acc) => acc.type === cat.key);
          return (
            <div key={cat.key} className="p-4 rounded-xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 gap-2" style={{ borderColor: theme.border }}>
                <div>
                  <h4 className="text-xs font-black" style={{ color: theme.accent }}>{cat.label}</h4>
                  <p className="text-[9px]" style={{ color: theme.muted }}>{cat.desc}</p>
                </div>
                <span className="text-[9px] bg-slate-500/10 text-slate-400 py-0.5 px-2 rounded-full font-mono">{matched.length} بنود حسابية مدمجة</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-bold border-collapse">
                  <thead>
                    <tr style={{ color: theme.muted, borderBottom: `1px solid ${theme.border}` }}>
                      <th className="py-2 px-3 text-right">كود البند</th>
                      <th className="py-2 px-3 text-right">اسم بند الحساب / الخزينة</th>
                      <th className="py-2 px-3 text-right">الوصف والتفاصيل</th>
                      <th className="py-2 px-3 text-center">حالة البند</th>
                      <th className="py-2 px-3 text-left">تغيير الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((acc) => (
                      <tr key={acc.code} className="hover:bg-gray-500/5 transition-colors" style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td className="py-2 px-3 font-mono text-emerald-400 text-xs">{acc.code}</td>
                        <td className="py-2 px-3" style={{ color: theme.text }}>{acc.name}</td>
                        <td className="py-2 px-3 text-[10px]" style={{ color: theme.muted }}>{acc.descriptionAr || "لا يوجد وصف إضافي مثبت"}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${acc.status === "active" ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {acc.status === "active" ? "نشط وفعال" : "معطل مؤقتاً"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-left">
                          <button
                            onClick={() => toggleStatus(acc)}
                            className="p-1 px-1.5 rounded text-[9px] font-black cursor-pointer transition-all hover:bg-gray-500/10"
                            style={{ color: acc.status === "active" ? theme.muted : theme.accent }}
                            title={acc.status === "active" ? "تعطيل البند" : "تنشيط البند"}
                          >
                            {acc.status === "active" ? (
                              <div className="flex items-center gap-1">
                                <ToggleRight className="w-4.5 h-4.5 text-emerald-500" />
                                <span>إيقاف العمل</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <ToggleLeft className="w-4.5 h-4.5 text-red-400" />
                                <span>تنشيط البند</span>
                              </div>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
