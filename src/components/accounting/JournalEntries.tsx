import React, { useState } from "react";
import { JournalEntry, Account, ThemeColors, JournalLine } from "../../types";
import { Plus, Trash, CheckCircle, ShieldAlert, Sparkles, FileText } from "lucide-react";

interface JournalEntriesProps {
  entries: JournalEntry[];
  accounts: Account[];
  onAddEntry: (entry: JournalEntry) => void;
  onPostEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  theme: ThemeColors;
}

export default function JournalEntries({
  entries,
  accounts,
  onAddEntry,
  onPostEntry,
  onDeleteEntry,
  theme
}: JournalEntriesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<JournalLine[]>([
    { accountCode: "", accountName: "", debit: 0, credit: 0 },
    { accountCode: "", accountName: "", debit: 0, credit: 0 }
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLineAccountChange = (idx: number, code: string) => {
    const acc = accounts.find(a => a.code === code);
    if (!acc) return;
    const updated = [...lines];
    updated[idx].accountCode = code;
    updated[idx].accountName = acc.name;
    setLines(updated);
  };

  const handleLineAmountChange = (idx: number, field: "debit" | "credit", val: number) => {
    const updated = [...lines];
    updated[idx][field] = val;
    // For single line, clear the opposite field to prevent both debit and credit (تنظيم محاسبي سليم)
    if (field === "debit" && val > 0) updated[idx].credit = 0;
    if (field === "credit" && val > 0) updated[idx].debit = 0;
    setLines(updated);
  };

  const addNewLine = () => {
    setLines([...lines, { accountCode: "", accountName: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !ref) {
      setErrorMsg("الرجاء إدخال البيان ورقم المرجع المحاسبي.");
      return;
    }

    // Verify all lines have a selected account
    const hasUnselected = lines.some(l => !l.accountCode);
    if (hasUnselected) {
      setErrorMsg("الرجاء اختيار حساب مالي صالح لجميع السطور.");
      return;
    }

    // Check balance
    const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    if (totalDebit <= 0 || totalCredit <= 0) {
      setErrorMsg("يجب أن تكون مبالغ السحب أو الإيداع أكبر من صفر.");
      return;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setErrorMsg(`القيد غير متزن! إجمالي المدين (${totalDebit} ر.س) يجب أن يتطابق مع الدائن (${totalCredit} ر.س). الفارق: ${Math.abs(totalDebit - totalCredit).toFixed(2)} ر.س`);
      return;
    }

    setErrorMsg(null);

    const newEntry: JournalEntry = {
      id: "JE-" + Math.floor(Math.random() * 90000 + 10000),
      date,
      description: desc,
      ref,
      lines: lines.map(l => ({ ...l, debit: Number(l.debit), credit: Number(l.credit) })),
      isPosted: false
    };

    onAddEntry(newEntry);
    setDesc("");
    setRef("");
    setDate(new Date().toISOString().slice(0, 10));
    setLines([
      { accountCode: "", accountName: "", debit: 0, credit: 0 },
      { accountCode: "", accountName: "", debit: 0, credit: 0 }
    ]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4" style={{ borderColor: theme.border }}>
        <div>
          <h3 className="text-sm font-black" style={{ color: theme.text }}>دفتر القيود اليومية (General Journal Entries)</h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>مراجعة القيود اليومية، إضافة قيد يدوي مركب، واعتماد وترحيل الحسابات</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all hover:brightness-110 active:scale-95 cursor-pointer text-black"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قيد يومي مركب ✍️</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl border text-right space-y-4 shadow-md"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <h4 className="text-xs font-black text-rose-400">إضافة قيد قيد يومي مزدوج / مركب جديد</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold block" style={{ color: theme.text }}>تاريخ القيد:</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border focus:outline-none"
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold block" style={{ color: theme.text }}>اسم أو بيان القيد (الوصف):</label>
              <input
                type="text"
                required
                placeholder="مثال: سداد مصروف التسويق أو رواتب شهر مايو"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border focus:outline-none"
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold block" style={{ color: theme.text }}>المرجع المالي / رقم الإثبات:</label>
              <input
                type="text"
                required
                placeholder="مثال: سند صرف #331"
                value={ref}
                onChange={e => setRef(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border focus:outline-none"
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-3" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black" style={{ color: theme.text }}>بنود الحسابات والسطور الثنائية:</span>
              <button
                type="button"
                onClick={addNewLine}
                className="px-2 py-1 text-[10px] rounded bg-gray-500/10 text-sky-400 font-bold hover:bg-gray-500/20"
              >
                + إضافة سطر محاسبي
              </button>
            </div>

            {lines.map((ln, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-gray-500/5 p-2 rounded-xl">
                <div className="md:col-span-5 space-y-1 text-right">
                  <span className="text-[9px] block text-gray-400">الحساب المالي:</span>
                  <select
                    value={ln.accountCode}
                    required
                    onChange={e => handleLineAccountChange(idx, e.target.value)}
                    className="w-full text-xs p-1.5 rounded border focus:outline-none bg-slate-900 border-gray-700 text-white"
                  >
                    <option value="">-- اختر الحساب المالي من الشجرة --</option>
                    {accounts.map(a => (
                      <option key={a.code} value={a.code} disabled={a.status !== "active"}>
                        {a.code} - {a.name} {a.status !== "active" ? "[مجمد]" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3 space-y-1 text-right">
                  <span className="text-[9px] block text-gray-400">المدين (Debit - سحب):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ln.debit || ""}
                    onChange={e => handleLineAmountChange(idx, "debit", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full text-xs font-mono p-1.5 rounded border focus:outline-none bg-slate-900 border-gray-700 text-emerald-400"
                  />
                </div>
                <div className="md:col-span-3 space-y-1 text-right">
                  <span className="text-[9px] block text-gray-400">الدائن (Credit - إيداع):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ln.credit || ""}
                    onChange={e => handleLineAmountChange(idx, "credit", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full text-xs font-mono p-1.5 rounded border focus:outline-none bg-slate-900 border-gray-700 text-rose-400"
                  />
                </div>
                <div className="md:col-span-1 pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length <= 2}
                    className="p-1.5 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-20"
                    title="حذف هذا السطر"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end border-t pt-3" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:bg-gray-500/5"
            >
              إلغاء الأمر
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-black text-black"
              style={{ backgroundColor: theme.accent }}
            >
              حفظ القيد بالدفتر 💾
            </button>
          </div>
        </form>
      )}

      {/* Journal Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="p-8 rounded-xl border text-center font-bold" style={{ borderColor: theme.border, backgroundColor: theme.card }}>
            <FileText className="w-8 h-8 mx-auto text-gray-500 mb-2" />
            <p className="text-xs" style={{ color: theme.muted }}>لا توجد قيود يومية مسجلة بالدفتر حالياً</p>
          </div>
        ) : (
          [...entries].reverse().filter((entry, idx, self) => self.findIndex(e => e.id === entry.id) === idx).map(entry => {
            const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
            return (
              <div
                key={entry.id}
                className="p-4 rounded-xl border text-right space-y-3 relative overflow-hidden transition-all"
                style={{ backgroundColor: theme.card, borderColor: entry.isPosted ? theme.border : "rgba(224, 130, 0, 0.25)" }}
              >
                {!entry.isPosted && (
                  <div className="absolute right-0 top-0 h-full w-1.5 bg-amber-500" title="قيد مسودة - غير معتمد" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold" style={{ color: theme.text }}>{entry.description}</span>
                    <span className="text-[10px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded font-mono">{entry.id}</span>
                    <span className="text-[10px] text-gray-500">المرجع: {entry.ref}</span>
                    <span className="text-[9px] text-gray-400 font-mono">[{entry.date}]</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.isPosted ? (
                      <span className="px-2 py-0.5 text-[8px] bg-emerald-500/10 text-emerald-500 font-bold rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>مرحّل ومقفل 🔒</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[8px] bg-amber-500/10 text-amber-500 font-bold rounded">
                          مسودة معلقة ✏️
                        </span>
                        <button
                          onClick={() => onPostEntry(entry.id)}
                          className="px-2 py-1 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-black rounded cursor-pointer active:scale-95 transition-all"
                        >
                          اعتماد وترحيل القيد 🔓
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                          title="حذف المسودة"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lines Visual Matrix */}
                <div className="overflow-x-auto bg-gray-500/5 p-2 rounded-lg">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700/30">
                        <th className="py-1 px-2">الحساب المالي (الكود)</th>
                        <th className="py-1 px-2 text-center md:text-right">مدين (Debit)</th>
                        <th className="py-1 px-2 text-center md:text-right">دائن (Credit)</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {entry.lines.map((l, i) => (
                        <tr key={i} className="hover:bg-tableToggle">
                          <td className="py-1 px-2" style={{ color: theme.text }}>
                            <span className="font-mono text-emerald-400 text-[11px] ml-1.5">({l.accountCode})</span>
                            <span>{l.accountName}</span>
                          </td>
                          <td className="py-1 px-2 font-mono" style={{ color: l.debit > 0 ? "#10B981" : "transparent" }}>
                            {l.debit > 0 ? l.debit.toLocaleString("ar-SA") + " ر.س" : "-"}
                          </td>
                          <td className="py-1 px-2 font-mono" style={{ color: l.credit > 0 ? "#F87171" : "transparent" }}>
                            {l.credit > 0 ? l.credit.toLocaleString("ar-SA") + " ر.س" : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center text-[9px]" style={{ color: theme.muted }}>
                  <span>القيمة الإجمالية المتزنة: <b className="font-mono">{totalDebit.toLocaleString("ar-SA")} ريال</b></span>
                  <span>منشأ القيد: {entry.id.startsWith("JE-") ? "إثبات يدوي" : "ربط مالي تلقائي ⚡"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
