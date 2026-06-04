import React, { useState, useMemo } from "react";
import { JournalEntry, Account, ThemeColors } from "../../types";
import { Search, Calendar, Landmark, CheckSquare, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface GeneralLedgerProps {
  entries: JournalEntry[];
  accounts: Account[];
  theme: ThemeColors;
}

export default function GeneralLedger({ entries, accounts, theme }: GeneralLedgerProps) {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const postedEntries = useMemo(() => entries.filter(e => e.isPosted), [entries]);

  // General Ledger logic for SELECTED account
  const ledgerLines = useMemo(() => {
    if (!selectedAccountCode) return [];
    
    let balance = 0;
    const lines: any[] = [];

    // Filter ledger entries
    const matched = postedEntries.filter(e => {
      // Date bounds
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      
      // Select account
      return e.lines.some(l => l.accountCode === selectedAccountCode);
    });

    // Stagger ledger logic
    matched.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.accountCode === selectedAccountCode) {
          // Calculate cumulative balances dynamically based on account type
          const acc = accounts.find(a => a.code === selectedAccountCode);
          const isDebitNormal = acc?.type === "assets" || acc?.type === "expenses";
          
          if (isDebitNormal) {
            balance += (line.debit - line.credit);
          } else {
            balance += (line.credit - line.debit);
          }

          lines.push({
            id: entry.id,
            date: entry.date,
            description: entry.description,
            ref: entry.ref,
            debit: line.debit,
            credit: line.credit,
            runningBalance: balance
          });
        }
      });
    });

    return lines;
  }, [postedEntries, selectedAccountCode, startDate, endDate, accounts]);

  // TRIAL BALANCE (ميزان المراجعة) CALCULATIONS IN ONE GO
  const trialBalance = useMemo(() => {
    let totalDebitMovement = 0;
    let totalCreditMovement = 0;

    const rows = accounts.map(acc => {
      let debitSum = 0;
      let creditSum = 0;

      // Scan posted entries
      postedEntries.forEach(entry => {
        entry.lines.forEach(line => {
          if (line.accountCode === acc.code) {
            debitSum += line.debit;
            creditSum += line.credit;
          }
        });
      });

      totalDebitMovement += debitSum;
      totalCreditMovement += creditSum;

      // Net Balances
      const isDebitNormal = acc.type === "assets" || acc.type === "expenses";
      let debitBalance = 0;
      let creditBalance = 0;

      if (isDebitNormal) {
        const net = debitSum - creditSum;
        if (net > 0) debitBalance = net;
        else if (net < 0) creditBalance = Math.abs(net);
      } else {
        const net = creditSum - debitSum;
        if (net > 0) creditBalance = net;
        else if (net < 0) debitBalance = Math.abs(net);
      }

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debitSum,
        creditSum,
        debitBalance,
        creditBalance
      };
    });

    const totalDebitBalance = rows.reduce((s, r) => s + r.debitBalance, 0);
    const totalCreditBalance = rows.reduce((s, r) => s + r.creditBalance, 0);
    const isBalanced = Math.abs(totalDebitBalance - totalCreditBalance) < 0.05;

    return {
      rows,
      totalDebitMovement,
      totalCreditMovement,
      totalDebitBalance,
      totalCreditBalance,
      isBalanced
    };
  }, [postedEntries, accounts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
      
      {/* LEFT AREA: GENERAL LEDGER ACCOUNT CARD (8 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="border-b pb-2.5 flex items-center justify-between" style={{ borderColor: theme.border }}>
            <div>
              <h4 className="text-xs font-black" style={{ color: theme.text }}>دفتر الأستاذ العام (General Ledger)</h4>
              <p className="text-[10px]" style={{ color: theme.muted }}>تتبع حركات حساب بعينه حياً من الحساب المدين/الدائن</p>
            </div>
            <Landmark className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold block" style={{ color: theme.muted }}>اختر الحساب المالي:</span>
              <select
                value={selectedAccountCode}
                onChange={e => setSelectedAccountCode(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              >
                <option value="">-- اختر من الحسابات الخاضعة للجدولة --</option>
                {accounts.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold block" style={{ color: theme.muted }}> نطاق التاريخ:</span>
              <div className="flex gap-1.5 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full text-[10px] p-2 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                />
                <span className="text-xs">إلى</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full text-[10px] p-2 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                />
              </div>
            </div>
          </div>

          {selectedAccountCode ? (
            <div className="space-y-3">
              {ledgerLines.length === 0 ? (
                <div className="p-6 text-center text-xs" style={{ color: theme.muted }}>
                  لا توجد قيود يومية معتمدة ومرحّلة لهذا الحساب حالياً
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700/30">
                        <th className="py-2 px-1 text-right">القيد</th>
                        <th className="py-2 px-1 text-right">التاريخ والبيان</th>
                        <th className="py-2 px-1 text-right">المرجع</th>
                        <th className="py-2 px-1">مدين (+)</th>
                        <th className="py-2 px-1">دائن (-)</th>
                        <th className="py-2 px-1 text-left">الرصيد الجاري</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {ledgerLines.map((ln, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-500/5 transition-colors" style={{ borderColor: theme.border }}>
                          <td className="py-2 px-1 font-mono text-emerald-400">{ln.id}</td>
                          <td className="py-2 px-1 text-[11px]">
                            <div style={{ color: theme.text }}>{ln.description}</div>
                            <div className="text-[9px]" style={{ color: theme.muted }}>[{ln.date}]</div>
                          </td>
                          <td className="py-2 px-1 text-[10px] text-gray-500">{ln.ref}</td>
                          <td className="py-2 px-1 text-emerald-400 font-mono">
                            {ln.debit > 0 ? ln.debit.toLocaleString("ar-SA") : "-"}
                          </td>
                          <td className="py-2 px-1 text-rose-400 font-mono">
                            {ln.credit > 0 ? ln.credit.toLocaleString("ar-SA") : "-"}
                          </td>
                          <td className="py-2 px-1 text-left font-mono" style={{ color: theme.text }}>
                            {ln.runningBalance.toLocaleString("ar-SA")} ر.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500" style={{ color: theme.muted }}>
              👈 يرجى اختيار حساب مالي من القائمة العلوية لعرض كشف حساب الأستاذ الجاري حياً
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: TRIAL BALANCE GRID (4 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="border-b pb-2.5 flex items-center justify-between" style={{ borderColor: theme.border }}>
            <div>
              <h4 className="text-xs font-black" style={{ color: theme.text }}>ميزان المراجعة بالأرصدة (Trial Balance)</h4>
              <p className="text-[10px]" style={{ color: theme.muted }}>التحقق المالي من توازن العمليات السالفة بالكامل</p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
          </div>

          {trialBalance.isBalanced ? (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center gap-2">
              <CheckSquare className="w-4.5 h-4.5 shrink-0" />
              <span>ميزان المراجعة متوازن ومكتمل تماماً! الأرصدة وإثباتاتها متطابقة ✅</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              <span>فروقات محاسبية بسيطة! ربما بسبب تحركات لم ترحل أو مبيعات POS معلقة ⚠️</span>
            </div>
          )}

          <div className="overflow-y-auto max-h-[380px] p-1 bg-gray-500/5 rounded-xl">
            <table className="w-full text-[10px] text-right border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700/45 font-bold">
                  <th className="py-1 px-1">الحساب المالي</th>
                  <th className="py-1 px-1">مدين (Deb)</th>
                  <th className="py-1 px-1">دائن (Cred)</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {trialBalance.rows.map(row => (
                  <tr key={row.code} className="hover:bg-slate-800/20" style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td className="py-1.5 px-1 truncate max-w-[120px]">
                      <span className="text-emerald-400 font-mono ml-1">({row.code})</span>
                      <span style={{ color: theme.text }}>{row.name}</span>
                    </td>
                    <td className="py-1.5 px-1 text-emerald-400 font-mono">
                      {row.debitBalance > 0 ? row.debitBalance.toLocaleString("ar-SA") : "-"}
                    </td>
                    <td className="py-1.5 px-1 text-rose-400 font-mono">
                      {row.creditBalance > 0 ? row.creditBalance.toLocaleString("ar-SA") : "-"}
                    </td>
                  </tr>
                ))}
                
                {/* Total Summary Row */}
                <tr className="bg-gray-500/10 uppercase" style={{ color: theme.text }}>
                  <td className="py-2 px-1 font-extrabold text-xs">إجمالي الأرصدة المحسوبة:</td>
                  <td className="py-2 px-1 font-mono text-[11px] text-emerald-400 font-black">
                    {trialBalance.totalDebitBalance.toLocaleString("ar-SA")} ريال
                  </td>
                  <td className="py-2 px-1 font-mono text-[11px] text-rose-400 font-black">
                    {trialBalance.totalCreditBalance.toLocaleString("ar-SA")} ريال
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
