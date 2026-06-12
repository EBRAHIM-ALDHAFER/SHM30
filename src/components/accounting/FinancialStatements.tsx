import React, { useState, useMemo } from "react";
import { JournalEntry, Account, ThemeColors } from "../../types";
import { TrendingUp, FileText, ArrowRight, Wallet, CheckSquare, Coins } from "lucide-react";

interface FinancialStatementsProps {
  entries: JournalEntry[];
  accounts: Account[];
  theme: ThemeColors;
}

export default function FinancialStatements({ entries, accounts, theme }: FinancialStatementsProps) {
  const [statementTab, setStatementTab] = useState<"income" | "balance_sheet" | "cash_flow">("income");

  const postedLines = useMemo(() => {
    const lines: any[] = [];
    entries.filter(e => e.isPosted).forEach(e => {
      e.lines.forEach(l => {
        lines.push({ ...l, date: e.date });
      });
    });
    return lines;
  }, [entries]);

  // Aggregate balance function
  const getAccountBalance = (code: string) => {
    const acc = accounts.find(a => a.code === code);
    if (!acc) return 0;
    
    let dbSum = 0;
    let crSum = 0;
    postedLines.forEach(l => {
      if (l.accountCode === code) {
        dbSum += l.debit;
        crSum += l.credit;
      }
    });

    const isDebitNormal = acc.type === "assets" || acc.type === "expenses";
    if (isDebitNormal) {
      return dbSum - crSum;
    } else {
      return crSum - dbSum;
    }
  };

  // 1. INCOME STATEMENT CALCULATIONS
  const incomeStmt = useMemo(() => {
    const saleRetail = getAccountBalance("4101");
    const saleWholesale = getAccountBalance("4102");
    const saleServices = getAccountBalance("4103");
    const totalRevenues = saleRetail + saleWholesale + saleServices;

    const cogs = getAccountBalance("5101");
    const grossProfit = totalRevenues - cogs;

    const expSalaries = getAccountBalance("5102");
    const expAllowances = getAccountBalance("5103");
    const expRent = getAccountBalance("5104");
    const expMarketing = getAccountBalance("5105");
    const expShipping = getAccountBalance("5106");
    const expUtilities = getAccountBalance("5107");
    const expHospitality = getAccountBalance("5108");

    const totalExpenses = expSalaries + expAllowances + expRent + expMarketing + expShipping + expUtilities + expHospitality;
    const netProfit = grossProfit - totalExpenses;

    return {
      saleRetail,
      saleWholesale,
      saleServices,
      totalRevenues,
      cogs,
      grossProfit,
      expenses: {
        salaries: expSalaries,
        allowances: expAllowances,
        rent: expRent,
        marketing: expMarketing,
        shipping: expShipping,
        utilities: expUtilities,
        hospitality: expHospitality
      },
      totalExpenses,
      netProfit
    };
  }, [postedLines, accounts]);

  // 2. BALANCE SHEET CALCULATIONS
  const balanceSheet = useMemo(() => {
    const cashBox = getAccountBalance("1101");
    const bankAlrajhi = getAccountBalance("1102");
    const bankSnb = getAccountBalance("1103");
    const advances = getAccountBalance("1104");
    const ar = getAccountBalance("1105");
    const inventory = getAccountBalance("1106");
    
    const fixedAssetsVehicles = getAccountBalance("1201");
    const fixedAssetsMachinery = getAccountBalance("1202");
    const accumDepr = getAccountBalance("2102");
    
    const totalCurrentAssets = cashBox + bankAlrajhi + bankSnb + advances + ar + inventory;
    // Accumulated depreciation is a contra-asset subtracted from fixed assets
    const totalFixedAssets = fixedAssetsVehicles + fixedAssetsMachinery - accumDepr;
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const ap = getAccountBalance("2101");
    const vatPayable = getAccountBalance("2103");
    const loans = getAccountBalance("2104");

    // Accumulated depreciation has been moved to contra-assets
    const totalLiabilities = ap + vatPayable + loans;

    const capital = getAccountBalance("3101");
    const retainedPrev = getAccountBalance("3102");
    const currentPeriodNet = incomeStmt.netProfit;
    const totalEquity = capital + retainedPrev + currentPeriodNet;

    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.1;

    return {
      cashBox,
      bankAlrajhi,
      bankSnb,
      advances,
      ar,
      inventory,
      totalCurrentAssets,
      totalFixedAssets,
      totalAssets,
      ap,
      accumDepr,
      vatPayable,
      loans,
      totalLiabilities,
      capital,
      retainedPrev,
      currentPeriodNet,
      totalEquity,
      isBalanced
    };
  }, [postedLines, accounts, incomeStmt]);

  // 3. CASH FLOW STATEMENT
  const cashFlow = useMemo(() => {
    const cashInSales = incomeStmt.totalRevenues;
    const cashOutCogs = -incomeStmt.cogs;
    const cashOutExps = -incomeStmt.totalExpenses;
    const operatingFlows = cashInSales + cashOutCogs + cashOutExps;

    const purchaseAssetsVehicles = -getAccountBalance("1201");
    const purchaseAssetsMach = -getAccountBalance("1202");
    const investingFlows = purchaseAssetsVehicles + purchaseAssetsMach;

    const loansIn = getAccountBalance("2104");
    const capitalIn = getAccountBalance("3101");
    const financingFlows = loansIn + capitalIn;

    const netChange = operatingFlows + investingFlows + financingFlows;

    return {
      cashInSales,
      cashOutCogs,
      cashOutExps,
      operatingFlows,
      investingFlows,
      financingFlows,
      netChange
    };
  }, [incomeStmt, postedLines, accounts]);

  return (
    <div className="space-y-6 text-right">
      
      {/* Visual Indicator of statements tabs */}
      <div className="flex gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
        {(["income", "balance_sheet", "cash_flow"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatementTab(tab)}
            className="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 border"
            style={{
              backgroundColor: statementTab === tab ? theme.accent : "transparent",
              borderColor: statementTab === tab ? theme.accent : theme.border,
              color: statementTab === tab ? "#000" : theme.text
            }}
          >
            {tab === "income" && "قائمة الدخل والأرباح والشركات (Income Statement) 📈"}
            {tab === "balance_sheet" && "الميزانية العمومية والمركز المالي (Balance Sheet) ⚖️"}
            {tab === "cash_flow" && "قائمة التدفقات النقدية والسيولة (Cash Flow) 🪙"}
          </button>
        ))}
      </div>

      {statementTab === "income" && (
        <div className="p-5 rounded-2xl border text-right space-y-4 max-w-2xl mx-auto" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="border-b pb-2 flex justify-between items-center" style={{ borderColor: theme.border }}>
            <h4 className="text-xs font-black" style={{ color: theme.accent }}>قائمة الأرباح والخسائر التلقائية (الأرقام حية)</h4>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-2 text-xs font-bold">
            <div className="flex justify-between p-1 bg-gray-500/5 rounded">
              <span style={{ color: theme.text }}>إيرادات البيع التجزئة (4101):</span>
              <span className="font-mono text-emerald-400">{incomeStmt.saleRetail.toLocaleString("ar-SA")} ر.س</span>
            </div>
            <div className="flex justify-between p-1 bg-gray-500/5 rounded">
              <span style={{ color: theme.text }}>إيرادات مبايعات صفقة الجملة (4102):</span>
              <span className="font-mono text-emerald-400">{incomeStmt.saleWholesale.toLocaleString("ar-SA")} ر.س</span>
            </div>
            <div className="flex justify-between p-1 bg-gray-500/5 rounded">
              <span style={{ color: theme.text }}>إيرادات خدمات واستشارات (4103):</span>
              <span className="font-mono text-emerald-400">{incomeStmt.saleServices.toLocaleString("ar-SA")} ر.س</span>
            </div>
            <div className="flex justify-between p-1.5 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20 font-extrabold">
              <span>إجمالي المبيعات والإيرادات:</span>
              <span className="font-mono">{incomeStmt.totalRevenues.toLocaleString("ar-SA")} ر.س</span>
            </div>

            <div className="flex justify-between p-1.5 text-rose-400 font-extrabold border-b" style={{ borderColor: theme.border }}>
              <span>تكلفة البضاعة المباعة (COGS 5101) (-) :</span>
              <span className="font-mono">{incomeStmt.cogs.toLocaleString("ar-SA")} ر.س</span>
            </div>

            <div className="flex justify-between p-2 bg-emerald-500/10 text-emerald-500 font-black rounded border border-emerald-500/20 text-sm">
              <span>مجمل الربح التجاري (Gross Profit):</span>
              <span className="font-mono">{incomeStmt.grossProfit.toLocaleString("ar-SA")} ر.س</span>
            </div>

            {/* Operating Expenses list */}
            <div className="mt-3 pt-3 border-t " style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-400 block mb-2 font-black">المصروفات التشغيلية والخدمات:</span>
              <div className="space-y-1 text-[11px] px-3">
                <div className="flex justify-between">
                  <span>الرواتب والأجور (5102):</span>
                  <span>{incomeStmt.expenses.salaries.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>البدلات والمكافآت (5103):</span>
                  <span>{incomeStmt.expenses.allowances.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>إيجار المعارض والمقرات (5104):</span>
                  <span>{incomeStmt.expenses.rent.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>مصاريف التسويق والإعلانات (5105):</span>
                  <span>{incomeStmt.expenses.marketing.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>تكاليف الشحن اللوجستي والتوصيل (5106):</span>
                  <span>{incomeStmt.expenses.shipping.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>مرافق مياه وصيانة وإنترنت (5107):</span>
                  <span>{incomeStmt.expenses.utilities.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>مصاريف الضيافة والاتصالات (5108):</span>
                  <span>{incomeStmt.expenses.hospitality.toLocaleString("ar-SA")} ر.س</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-1.5 text-rose-400 font-extrabold border-t" style={{ borderColor: theme.border }}>
              <span>إجمالي المصروفات التشغيلية (-) :</span>
              <span className="font-mono">{incomeStmt.totalExpenses.toLocaleString("ar-SA")} ر.س</span>
            </div>

            <div className="flex justify-between p-3 rounded-2xl font-black text-white text-base"
              style={{ backgroundColor: incomeStmt.netProfit >= 0 ? "#10B981" : "#EF4444" }}>
              <span>صافي الربح / الخسارة الدوري (Net Profit):</span>
              <span className="font-mono">{incomeStmt.netProfit.toLocaleString("ar-SA")} ر.س</span>
            </div>
          </div>
        </div>
      )}

      {statementTab === "balance_sheet" && (
        <div className="p-5 rounded-2xl border text-right space-y-4 max-w-3xl mx-auto" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="border-b pb-2 flex justify-between items-center" style={{ borderColor: theme.border }}>
            <h4 className="text-xs font-black" style={{ color: theme.accent }}>الميزانية والمركز المالي للمنشأة (RTL)</h4>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${balanceSheet.isBalanced ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {balanceSheet.isBalanced ? "الميزانية متوازنة تماماً ❇️" : "الميزانية غير متطابقة ⚠️"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
            {/* Column A: Assets */}
            <div className="space-y-3 p-3 bg-gray-500/5 rounded-xl border border-gray-700/20">
              <span className="text-[11px] font-black text-emerald-400 block border-b pb-1">الأصول (Assets)</span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>الصندوق المحاسبي (1101):</span>
                  <span>{balanceSheet.cashBox.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>البنك الراجحي (1102):</span>
                  <span>{balanceSheet.bankAlrajhi.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>البنك الأهلي SNB (1103):</span>
                  <span>{balanceSheet.bankSnb.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>العهد النقدية مبيعات (1104):</span>
                  <span>{balanceSheet.advances.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between text-yellow-500">
                  <span>ذمم العملاء المدينة (AR 1105):</span>
                  <span>{balanceSheet.ar.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>مخزون بضاعة سلع (1106):</span>
                  <span>{balanceSheet.inventory.toLocaleString("ar-SA")} ر.s</span>
                </div>
                <div className="flex justify-between font-black pt-1 border-t text-sky-400">
                  <span>إجمالي الأصول المتداولة:</span>
                  <span>{balanceSheet.totalCurrentAssets.toLocaleString("ar-SA")} ر.س</span>
                </div>
                
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between text-purple-400">
                    <span>ثابتة - مركبات وأجهزة (1201+1202):</span>
                    <span>{balanceSheet.totalFixedAssets.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-sm pt-2 border-t mt-2" style={{ color: theme.text }}>
                  <span>إجمالي الأصول بالكامل:</span>
                  <span className="text-emerald-400">{balanceSheet.totalAssets.toLocaleString("ar-SA")} ر.س</span>
                </div>
              </div>
            </div>

            {/* Column B: Liabilities & Equity */}
            <div className="space-y-3 p-3 bg-gray-500/5 rounded-xl border border-gray-700/20">
              <span className="text-[11px] font-black text-rose-400 block border-b pb-1">الخصوم وحقوق الملكية (Liabilities & Equity)</span>
              
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-yellow-500">
                  <span>ذمم الموردين الدائنة (AP 2101):</span>
                  <span>{balanceSheet.ap.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>مجمع إهلاك مركبات (2102) [-]:</span>
                  <span>({balanceSheet.accumDepr.toLocaleString("ar-SA")}) ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة VAT (2103):</span>
                  <span>{balanceSheet.vatPayable.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>قروض وتمويلات (2104):</span>
                  <span>{balanceSheet.loans.toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between font-black pt-1 border-t text-rose-400">
                  <span>إجمالي الخصوم والديون:</span>
                  <span>{balanceSheet.totalLiabilities.toLocaleString("ar-SA")} ر.س</span>
                </div>
                
                {/* Equity */}
                <div className="pt-2 border-t mt-2">
                  <span className="text-[10px] font-black text-sky-400 block mb-1">حقوق الملكية (Equity):</span>
                  <div className="flex justify-between">
                    <span>رأس مال المنشأة (3101):</span>
                    <span>{balanceSheet.capital.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>أرباح محتجزة سابقة (3102):</span>
                    <span>{balanceSheet.retainedPrev.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>أرباح الفترة الجارية:</span>
                    <span>{balanceSheet.currentPeriodNet.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="flex justify-between font-black pt-1 border-t text-sky-400">
                    <span>إجمالي حقوق الملكية:</span>
                    <span>{balanceSheet.totalEquity.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-sm pt-2 border-t mt-2" style={{ color: theme.text }}>
                  <span>الخصوم وحقوق الملكية:</span>
                  <span className="text-emerald-400">{(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString("ar-SA")} ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statementTab === "cash_flow" && (
        <div className="p-5 rounded-2xl border text-right space-y-4 max-w-2xl mx-auto" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="border-b pb-2 flex justify-between items-center" style={{ borderColor: theme.border }}>
            <h4 className="text-xs font-black" style={{ color: theme.text }}>بيان التدفقات النقدية (Cash Flow Statement)</h4>
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>

          <div className="space-y-3 text-xs font-bold">
            <div className="p-2.5 bg-gray-500/5 rounded-xl space-y-1.5">
              <span className="text-[10px] text-emerald-400 block font-black">أولاً: الأنشطة التشغيلية (Operating Activities)</span>
              <div className="flex justify-between text-[11px] px-2">
                <span>المتحصلات النقدية من مبيعات السلع والخدمات:</span>
                <span>+{cashFlow.cashInSales.toLocaleString("ar-SA")} ريال</span>
              </div>
              <div className="flex justify-between text-[11px] px-2 text-rose-400">
                <span>المدفوعات النقدية لتأمين وتوريد المخازن (COGS):</span>
                <span>({Math.abs(cashFlow.cashOutCogs).toLocaleString("ar-SA")}) ريال</span>
              </div>
              <div className="flex justify-between text-[11px] px-2 text-rose-400">
                <span>المدفوعات النقدية للمصروفات، الإيجار ورواتب (OpEx):</span>
                <span>({Math.abs(cashFlow.cashOutExps).toLocaleString("ar-SA")}) ريال</span>
              </div>
              <div className="flex justify-between font-black border-t pt-1 px-1" style={{ color: theme.text }}>
                <span>صافي النقد الموفر من التشغيل:</span>
                <span className={cashFlow.operatingFlows >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {cashFlow.operatingFlows.toLocaleString("ar-SA")} ر.س
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-500/5 rounded-xl space-y-1.5">
              <span className="text-[10px] text-purple-400 block font-black">ثانياً: الأنشطة الاستثمارية (Investing Activities)</span>
              <div className="flex justify-between text-[11px] px-2 text-rose-400">
                <span>شراء أصول ثابتة (معدات سيارات مكاتب):</span>
                <span>({Math.abs(cashFlow.investingFlows).toLocaleString("ar-SA")}) ريال</span>
              </div>
              <div className="flex justify-between font-black border-t pt-1 px-1" style={{ color: theme.text }}>
                <span>صافي التدفقات من الاستثمار:</span>
                <span className={cashFlow.investingFlows >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {cashFlow.investingFlows.toLocaleString("ar-SA")} ر.س
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-500/5 rounded-xl space-y-1.5">
              <span className="text-[10px] text-sky-400 block font-black">ثالثاً: الأنشطة التمويلية (Financing Activities)</span>
              <div className="flex justify-between text-[11px] px-2">
                <span>الحصول على تمويل أو قروض أو زيادة هبر رأس المال:</span>
                <span>+{cashFlow.financingFlows.toLocaleString("ar-SA")} ريال</span>
              </div>
              <div className="flex justify-between font-black border-t pt-1 px-1" style={{ color: theme.text }}>
                <span>صافي النقد من التمويل ومقابلاته:</span>
                <span className={cashFlow.financingFlows >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {cashFlow.financingFlows.toLocaleString("ar-SA")} ر.س
                </span>
              </div>
            </div>

            {/* Sum change */}
            <div className="flex justify-between p-3 rounded-2xl text-base font-black text-white"
              style={{ backgroundColor: cashFlow.netChange >= 0 ? "#10B981" : "#EF4444" }}>
              <span>صافي التغير الكلي في النقدية وما يعادلها:</span>
              <span>{cashFlow.netChange.toLocaleString("ar-SA")} ر.س</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
