import React, { useState, useEffect, useMemo } from "react";
import { Account, JournalEntry, ThemeColors, Invoice, Product, Customer, Supplier } from "../types";

// Import modular accounting sub-components
import AccountList from "./accounting/AccountList";
import JournalEntries from "./accounting/JournalEntries";
import GeneralLedger from "./accounting/GeneralLedger";
import FinancialStatements from "./accounting/FinancialStatements";
import OperationsAccounting from "./accounting/OperationsAccounting";
import CustomStatements from "./accounting/CustomStatements";

// Import export helpers
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

// Lucide icons
import {
  Sparkles,
  Bot,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRightLeft,
  BookOpen,
  PieChart,
  Hammer,
  Printer,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  FileText
} from "lucide-react";

interface AccountingERPProps {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  theme: ThemeColors;
  openUnifiedActions?: (type: string, data: any) => void;
}

export default function AccountingERP({
  invoices,
  products,
  customers,
  suppliers,
  theme,
  openUnifiedActions
}: AccountingERPProps) {
  const [activeMainTab, setActiveMainTab] = useState<"coa" | "journal" | "ledger" | "final_sheets" | "ops" | "statements" | "ai_analyst">("coa");

  // ----------- 1. CENTRAL LEDGER DATABASE STATES -----------
  const [accounts, setAccounts] = useState<Account[]>([
    // Assets (1xxx)
    { code: "1101", name: "الصندوق المالي (Cash)", type: "assets", status: "active", descriptionAr: "النقد الفعلي المتاح بالصندوق الكاش لعمليات البيع اليومية" },
    { code: "1102", name: "حساب البنك الراجحي الجاري", type: "assets", status: "active", descriptionAr: "الحساب الجاري الرئيسي للموازنات البنكية والتحويلات" },
    { code: "1103", name: "حساب البنك الأهلي SNB", type: "assets", status: "active", descriptionAr: "الحساب البنكي الاحتياطي لتلقي التحويلات والرواتب" },
    { code: "1104", name: "العهد النقدية مبيعات", type: "assets", status: "active", descriptionAr: "العهد المؤقتة المسلمة للمناديب والمديرين للتشغيل" },
    { code: "1105", name: "ذمم العملاء المدينة (AR)", type: "assets", status: "active", descriptionAr: "المستحقات الأجلة والمطلوبة سدادها من قبل المشترين" },
    { code: "1106", name: "مخزون بضاعة سلع", type: "assets", status: "active", descriptionAr: "قيمة المواد الغذائية والسلع باللوجستيات والمستودعات" },
    { code: "1201", name: "سيارات الحركة والمعدات", type: "assets", status: "active", descriptionAr: "الأصول الثابتة المتمثلة في مركبات شحن وتوريد البضاعة" },
    { code: "1202", name: "آلات وأجهزة حوسبة", type: "assets", status: "active", descriptionAr: "الحواسيب وشاشات نقاط البيع وغيرها من الأصول المكتبية" },
    // Liabilities (2xxx)
    { code: "2101", name: "ذمم الموردين الدائنة (AP)", type: "liabilities", status: "active", descriptionAr: "ديون الموردين ومقابلات التمويل من فواتير المشتريات" },
    { code: "2102", name: "مجمع إهلاك الأصول الثابتة", type: "liabilities", status: "active", descriptionAr: "حساب الاحتياطي المقابل لقيم تآكل واندثار أصول المنشأة" },
    { code: "2103", name: "ضريبة القيمة المضافة VAT (15%)", type: "liabilities", status: "active", descriptionAr: "الوعاء الضريبي المتبادل بين هيئة الزكاة مبيعات ومشتريات" },
    { code: "2104", name: "قروض وتمويلات تشغيلية", type: "liabilities", status: "active", descriptionAr: "ديون القروض التجارية قصيرة الأجل للتمويل الهيكلي" },
    // Equity (3xxx)
    { code: "3101", name: "رأس مال التأسيس", type: "equity", status: "active", descriptionAr: "رأس المال المدفوع من الشركاء لتأسيس وتسيير الأعمال" },
    { code: "3102", name: "الأرباح المحتجزة / المبقاة", type: "equity", status: "active", descriptionAr: "الأرباح المدورة السابقة غير الموزعة للتكامل المالي" },
    // Revenues (4xxx)
    { code: "4101", name: "إيرادات المبيعات التجزئة (POS)", type: "revenues", status: "active", descriptionAr: "عوائد نقاط البيع الفورية الصادرة من الكاشير" },
    { code: "4102", name: "إيرادات مبايعات صفقة الجملة", type: "revenues", status: "active", descriptionAr: "مبيعات صفقات فروع الجملة وعقود الموردين" },
    { code: "4103", name: "إيرادات خدمات واستشارات مرافقة", type: "revenues", status: "active", descriptionAr: "أي عوائد مرافقة لتقديم النصائح وشحن اللوجستيات" },
    // Expenses (5xxx)
    { code: "5101", name: "تكلفة البضاعة المباعة (COGS)", type: "expenses", status: "active", descriptionAr: "تكلفة شراء وتوليد البضاعة المنسوبة للمبيعات المرحلة" },
    { code: "5102", name: "الرواتب والأجور الأساسية", type: "expenses", status: "active", descriptionAr: "المرتبات الأساسية للموظفين والمصروفة شهرياً" },
    { code: "5103", name: "البدلات وعقود المكافآت", type: "expenses", status: "active", descriptionAr: "البدلات الممنوحة كالمعايير الميدانية والمميزات المرافقة" },
    { code: "5104", name: "إيجار المعارض والفرع", type: "expenses", status: "active", descriptionAr: "مصاريف إيجار الصالات والفرع التشغيلي الرئيسي" },
    { code: "5105", name: "مصاريف التسويق والإعلانات", type: "expenses", status: "active", descriptionAr: "الحملات الدعائية سنابشات وجوجل بلس لترويج الصلاحيات" },
    { code: "5106", name: "تكاليف الشحن واللوجستيات", type: "expenses", status: "active", descriptionAr: "مصروفات النقل الداخلي والتوزيع للمستودعات" },
    { code: "5107", name: "مرافق كهرباء ومياه خدمات", type: "expenses", status: "active", descriptionAr: "دفعات الكهرباء والماء وموارد صيانة الأثاث" },
    { code: "5108", name: "إهلاك ومصاريف نثرية متنوعة", type: "expenses", status: "active", descriptionAr: "إثباتات إهلاكات سنوية وضيافة المكتب العام" }
  ]);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    // Baseline Capital Opening Entry
    {
      id: "JE-10001",
      date: "2026-01-01",
      description: "افتتاح النشاط التجاري وإثبات رأس المال التأسيسي بالراجحي",
      ref: "سند تأسيس #1",
      lines: [
        { accountCode: "1102", accountName: "حساب البنك الراجحي الجاري", debit: 200000, credit: 0 },
        { accountCode: "3101", accountName: "رأس مال التأسيس", debit: 0, credit: 200000 }
      ],
      isPosted: true
    },
    // Mock general journal entry: Pay some marketing
    {
      id: "JE-10002",
      date: "2026-03-12",
      description: "صرف دفعة تسويقية للترويج بجوجل وأدووردز",
      ref: "مستخرج فاتورة #3391",
      lines: [
        { accountCode: "5105", accountName: "مصاريف التسويق والإعلانات", debit: 4500, credit: 0 },
        { accountCode: "1102", accountName: "حساب البنك الراجحي الجاري", debit: 0, credit: 4500 }
      ],
      isPosted: true
    }
  ]);

  // ----------- 2. DYNAMIC BROAD INTER-TAB INTEGRATION ROUTER -----------
  // Reads all global invoices (sale / purchase) and maps active double entries inside central journal ledger in real time!
  useEffect(() => {
    // Collect all automatic JE from current invoices that aren't already represented inside journalEntries list.
    const currentInvoiceIdsInJournal = new Set(
      journalEntries.map(je => je.ref)
    );

    const generatedAutoEntries: JournalEntry[] = [];

    invoices.forEach((inv) => {
      const invoiceRefLabel = `فاتورة #${inv.id}`;
      // Skip if already logged to prevent duplicates
      if (currentInvoiceIdsInJournal.has(invoiceRefLabel)) return;

      const total = inv.total;
      if (total <= 0) return;

      if (inv.type === "sale") {
        // --- SALE AUTO posting (المبيعات) ---
        // 1. Double Entry for Sales:
        // Debit: Alrajhi Bank (1102) if 'مدفوع' OR Receivables (1105) if 'معلق' = total
        // Credit: Retail Sales Revenue (4101) = total / 1.15 (exclude VAT)
        // Credit: VAT Payable (2103) = total - (total / 1.15) (output VAT)
        const itemRevenue = Number((total / 1.15).toFixed(2));
        const vatPayAmt = Number((total - itemRevenue).toFixed(2));
        const finalReceiptAcc = inv.status === "مدفوع" ? "1102" : "1105";

        const journalSales: JournalEntry = {
          id: `JE-AUTO-SL-${inv.id}`,
          date: inv.date || new Date().toISOString().slice(0, 10),
          description: `قيد مبيعات تلقائي: إثبات مبيعات ${inv.status === "مدفوع" ? 'نقدية' : 'آجلة'} للعميل (${inv.customer})`,
          ref: invoiceRefLabel,
          lines: [
            {
              accountCode: finalReceiptAcc,
              accountName: finalReceiptAcc === "1102" ? "حساب البنك الراجحي الجاري" : "ذمم العملاء المدينة (AR)",
              debit: total,
              credit: 0
            },
            {
              accountCode: "4101",
              accountName: "إيرادات المبيعات التجزئة (POS)",
              debit: 0,
              credit: itemRevenue
            },
            {
              accountCode: "2103",
              accountName: "ضريبة القيمة المضافة VAT (15%)",
              debit: 0,
              credit: vatPayAmt
            }
          ],
          isPosted: true // Auto posts instantly
        };

        // 2. Double Entry for COGS (تكلفة البضاعة) - simulated at 55% of price
        const cogsAmt = Number((itemRevenue * 0.55).toFixed(2));
        const journalCOGS: JournalEntry = {
          id: `JE-AUTO-CG-${inv.id}`,
          date: inv.date || new Date().toISOString().slice(0, 10),
          description: `قيد مخزون تلقائي: تخفيض المخزون وإثبات وتكلفة البضاعة لـ ${invoiceRefLabel}`,
          ref: `تكلفة ${invoiceRefLabel}`,
          lines: [
            {
              accountCode: "5101",
              accountName: "تكلفة البضاعة المباعة (COGS)",
              debit: cogsAmt,
              credit: 0
            },
            {
              accountCode: "1106",
              accountName: "مخزون بضاعة سلع",
              debit: 0,
              credit: cogsAmt
            }
          ],
          isPosted: true
        };

        generatedAutoEntries.push(journalSales, journalCOGS);
      } else if (inv.type === "purchase") {
        // --- PURCHASE AUTO posting (المشتريات) ---
        // Debit: Inventory (1106) = total / 1.15
        // Debit: Input VAT (VAT Payable 2103) = total - total / 1.15
        // Credit: Alrajhi bank (1102) if 'مدفوع' OR Accounts Payable (2101) if 'معلق' = total
        const inventoryCost = Number((total / 1.15).toFixed(2));
        const inputVatAmt = Number((total - inventoryCost).toFixed(2));
        const finalPayeeAcc = inv.status === "مدفوع" ? "1102" : "2101";

        const journalPurchase: JournalEntry = {
          id: `JE-AUTO-PR-${inv.id}`,
          date: inv.date || new Date().toISOString().slice(0, 10),
          description: `قيد مشتريات تلقائي: شراء وتوريد مخزون من المورد (${inv.customer})`,
          ref: invoiceRefLabel,
          lines: [
            {
              accountCode: "1106",
              accountName: "مخزون بضاعة سلع",
              debit: inventoryCost,
              credit: 0
            },
            {
              accountCode: "2103",
              accountName: "ضريبة القيمة المضافة VAT (15%)", // debiting reduces total liability (مقاصة مدخلات)
              debit: inputVatAmt,
              credit: 0
            },
            {
              accountCode: finalPayeeAcc,
              accountName: finalPayeeAcc === "1102" ? "حساب البنك الراجحي الجاري" : "ذمم الموردين الدائنة (AP)",
              debit: 0,
              credit: total
            }
          ],
          isPosted: true
        };

        generatedAutoEntries.push(journalPurchase);
      }
    });

    if (generatedAutoEntries.length > 0) {
      setJournalEntries((prev) => {
        const existingRefs = new Set(prev.map(je => je.ref));
        const existingIds = new Set(prev.map(je => je.id));
        const nonDuplicateGenerated = generatedAutoEntries.filter(
          item => !existingRefs.has(item.ref) && !existingIds.has(item.id)
        );
        if (nonDuplicateGenerated.length === 0) return prev;
        return [...prev, ...nonDuplicateGenerated];
      });
    }
  }, [invoices]);

  // ----------- 3. CENTRAL ACTIONS HANDLERS -----------
  const handleAddAccount = (acc: Account) => {
    // Check if code exists
    if (accounts.some(a => a.code === acc.code)) {
      alert("عذراً، رقم الحساب أو الكود المالي مسجل مسبقاً بشجرة الحسابات!");
      return;
    }
    setAccounts([...accounts, acc]);
  };

  const handleUpdateAccount = (updated: Account) => {
    setAccounts(accounts.map(a => a.code === updated.code ? updated : a));
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries([...journalEntries, entry]);
  };

  const handlePostJournalEntry = (id: string) => {
    setJournalEntries(journalEntries.map(e => e.id === id ? { ...e, isPosted: true } : e));
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(journalEntries.filter(e => e.id !== id));
  };

  const handleAddAutomaticJournal = (entry: JournalEntry) => {
    setJournalEntries(prev => [...prev, entry]);
  };

  // ----------- 4. INTERACTIVE AI FINANCIAL ANALYST CHAT SYSTEM -----------
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: "مرحباً بك يا تاجرنا الكريم 🏛️! أنا مستشارك المالي الذكي سهم AI Financial Analyst. لقد قمت بتحليل دليل حساباتك وحركات المبيعات والرواتب والمصروفات حياً. هل ترغب في معرفة مستوى كفاءة التسويق، أو تقصي الهدر بالمصروفات، أو توقعات التدفقات النقدية؟"
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Compute stats metrics dynamically to pass as context structure to our server-side API!
  const liveFinancialMetrics = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let equity = 0;
    let revenues = 0;
    let expenses = 0;
    let cogs = 0;

    // Direct aggregation for prompt context
    const lines: any[] = [];
    journalEntries.filter(e => e.isPosted).forEach(e => {
      e.lines.forEach(l => { lines.push(l); });
    });

    accounts.forEach(acc => {
      let db = 0;
      let cr = 0;
      lines.forEach(l => {
        if (l.accountCode === acc.code) {
          db += l.debit;
          cr += l.credit;
        }
      });

      const isDebitNormal = acc.type === "assets" || acc.type === "expenses";
      const totalBalance = isDebitNormal ? (db - cr) : (cr - db);

      if (acc.type === "assets") assets += totalBalance;
      if (acc.type === "liabilities") liabilities += totalBalance;
      if (acc.type === "equity") equity += totalBalance;
      if (acc.type === "revenues") revenues += totalBalance;
      if (acc.type === "expenses") {
        if (acc.code === "5101") cogs += totalBalance;
        expenses += totalBalance;
      }
    });

    const netProfit = revenues - expenses;
    const cash = accounts.filter(a => a.code === "1101" || a.code === "1102").reduce((sum, a) => {
      let db = 0, cr = 0;
      lines.forEach(l => { if (l.accountCode === a.code) { db += l.debit; cr += l.credit; } });
      return sum + (db - cr);
    }, 0);

    const zakat = Math.max((cash + 42000 + 18500 - 12400) * 0.025, 0);

    return {
      assets,
      liabilities,
      equity,
      revenues,
      expenses,
      cogs,
      netProfit,
      cash,
      zakat,
      ar: 18500,
      ap: 12400
    };
  }, [journalEntries, accounts]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/accounting-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: liveFinancialMetrics,
          query: userText
        })
      });

      const data = await res.json();
      if (data.error) {
        setChatMessages(prev => [...prev, { sender: "ai", text: `⚠️ خطأ المستشار المالي: ${data.error}` }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "ai", text: data.response }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: "ai", text: "⚠️ فضل الاتصال بالخادم المالي حياً لتلقي الاستشارة، جرب لاحقاً." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Pre-calculated Recommendations on load (الوحدة 19)
  const recommendationsDaily = [
    { text: "نفقات التسويق الرقمية ارتفعت بنسبة 28% لعام 2026. ينصح بالتركيز على الترويج العفوي في منصة تيك توك لتقليص الانحراف الحاصل.", type: "warning" },
    { text: "السيولة الحالية بحساب الراجحي وصندوق الصيانة تعتبر ممتازة وتغطي رواتب ومصاريف الـ 6 أشهر القادمة بمستوى ثقة 96%.", type: "success" },
    { text: "المخزون الراكد ذراعيًا يربط قرابة 17% من رأس مالك التأسيسي. يفضل عمل خصم مبيعات POS بنسبة 15% بفرع جدة والرياض.", type: "tip" }
  ];

  // Export functions to leverage centralized Excel/PDF logic under reports (الوحدة 18)
  const handleExportExcelAllLedgers = () => {
    const exportCols = [
      { key: "code", label: "كود الحساب" },
      { key: "name", label: "اسم الحساب الطويل" },
      { key: "type", label: "نوع الحساب" },
      { key: "status", label: "الحالة التشغيلية" }
    ];
    exportToExcel(accounts, exportCols, "شجرة_الحسابات_سهم_" + new Date().toISOString().slice(0, 10));
  };

  const handlePrintPDFReport = () => {
    const exportCols = [
      { key: "code", label: "كود الحساب" },
      { key: "name", label: "اسم الحساب الطويل" },
      { key: "type", label: "نوع الحساب" },
      { key: "status", label: "حالة الحظر" }
    ];
    exportToPDF("الدليل المحاسبي وشجرة الحسابات المعتمدة - سهم ERP", exportCols, accounts, "تقرير مالي رسمي معتمد ومصدق");
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. TOP HEADER WITH STAT METRICS BANNER */}
      <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white"
            style={{ backgroundColor: theme.accent, color: "#000" }}>
            <Briefcase className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-sm font-black flex items-center gap-1.5" style={{ color: theme.text }}>
              <span>لوحة تحكم النظام المحاسبي المتكامل ERP Accounting</span>
              <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-black">
                بمستوى معايير هيئة زاتكا 🇸🇦
              </span>
            </h2>
            <p className="text-[10px]" style={{ color: theme.muted }}>دورة مالية مدمجة بالكامل مع مبيعات الكاشير واللوجستيات والمشتريات والفروع</p>
          </div>
        </div>

        {/* Action button grouping */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrintPDFReport}
            className="px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors hover:bg-slate-800"
            style={{ color: theme.text, borderColor: theme.border }}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة وتصدير PDF 📄</span>
          </button>
          <button
            onClick={handleExportExcelAllLedgers}
            className="px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors hover:bg-slate-800"
            style={{ color: theme.text, borderColor: theme.border }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تصدير إكسل الشجرة 📊</span>
          </button>
          <button
            onClick={() => alert("معاينة سريعة: تم إرسال مخلص الموازنة والتدفق بالبريد للمدير المالي والاجتماعي بنجاح! 📧")}
            className="px-3 py-1.5 rounded-xl text-[10px] font-black text-black flex items-center gap-1 cursor-pointer hover:brightness-110 transition-colors"
            style={{ backgroundColor: theme.accent }}
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span> إرسال التقارير بريداً 📬</span>
          </button>
        </div>
      </div>

      {/* QUICK FINANCIAL MINI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border space-y-1 text-right bg-gradient-to-tr from-slate-900 via-gray-900 to-slate-900" style={{ borderColor: theme.border }}>
          <span className="text-[10px] text-gray-400 block font-bold">السيولة النقدية المتاحة (Cash/Banks):</span>
          <span className="text-base font-black font-mono text-emerald-400">
            {liveFinancialMetrics.cash.toLocaleString("ar-SA")} ر.س
          </span>
        </div>
        <div className="p-4 rounded-xl border space-y-1 text-right bg-gradient-to-tr from-slate-900 via-gray-900 to-slate-900" style={{ borderColor: theme.border }}>
          <span className="text-[10px] text-gray-400 block font-bold">إجمالي الأرباح الدورية (Incomes):</span>
          <span className={`text-base font-black font-mono ${liveFinancialMetrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {liveFinancialMetrics.netProfit.toLocaleString("ar-SA")} ر.س
          </span>
        </div>
        <div className="p-4 rounded-xl border space-y-1 text-right bg-gradient-to-tr from-slate-900 via-gray-900 to-slate-900" style={{ borderColor: theme.border }}>
          <span className="text-[10px] text-gray-400 block font-bold">ضريبة VAT المستحقة الصرف:</span>
          <span className="text-base font-black font-mono text-indigo-400">
            {liveFinancialMetrics.zakat.toLocaleString("ar-SA")} ر.س
          </span>
        </div>
        <div className="p-4 rounded-xl border space-y-1 text-right bg-gradient-to-tr from-slate-900 via-gray-900 to-slate-900" style={{ borderColor: theme.border }}>
          <span className="text-[10px] text-gray-400 block font-bold">الربط والقيود المرحلة (Journal Entries):</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-black" style={{ color: theme.text }}>
              {journalEntries.length} حركات منجزة
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono">تلقائي ⚡</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY TAB SELECTOR SYSTEM */}
      <div className="flex flex-wrap gap-2 border-b pb-1" style={{ borderColor: theme.border }}>
        {[
          { id: "coa", label: "شجرة الحسابات (COA) 🌳", icon: Layers },
          { id: "journal", label: "القيود اليومية 📝", icon: ArrowRightLeft },
          { id: "ledger", label: "الأستاذ وميزان المراجعة 📚", icon: BookOpen },
          { id: "final_sheets", label: "القوائم المالية الختامية 📊", icon: PieChart },
          { id: "ops", label: "تفويض الرواتب، الأصول والموازنات ⚙️", icon: Hammer },
          { id: "statements", label: "كشف حساب تفصيلي 📋", icon: FileText },
          { id: "ai_analyst", label: "مستشار سهم المالي الذكي (AI Analyst) 🧠⚡", icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-t-xl text-xs font-black cursor-pointer transition-colors select-none"
              style={{
                backgroundColor: isActive ? theme.card : "transparent",
                borderBottom: isActive ? `3px solid ${theme.accent}` : "none",
                color: isActive ? theme.text : theme.muted
              }}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? theme.accent : theme.muted }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SUB-TABS VIEWER INJECTOR */}
      <div className="p-2">
        {activeMainTab === "coa" && (
          <AccountList
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            theme={theme}
          />
        )}

        {activeMainTab === "journal" && (
          <JournalEntries
            entries={journalEntries}
            accounts={accounts}
            onAddEntry={handleAddJournalEntry}
            onPostEntry={handlePostJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            theme={theme}
          />
        )}

        {activeMainTab === "ledger" && (
          <GeneralLedger
            entries={journalEntries}
            accounts={accounts}
            theme={theme}
          />
        )}

        {activeMainTab === "final_sheets" && (
          <FinancialStatements
            entries={journalEntries}
            accounts={accounts}
            theme={theme}
          />
        )}

        {activeMainTab === "ops" && (
          <OperationsAccounting
            accounts={accounts}
            onAddAutomaticJournal={handleAddAutomaticJournal}
            theme={theme}
            customers={customers}
            suppliers={suppliers}
          />
        )}

        {activeMainTab === "statements" && (
          <CustomStatements
            customers={customers}
            suppliers={suppliers}
            invoices={invoices}
            theme={theme}
          />
        )}

        {activeMainTab === "ai_analyst" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
            {/* Daily advisory panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <h4 className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>توصيات وتقارير الهدر الفورية (Daily Diagnostics)</span>
                </h4>
                <div className="space-y-3">
                  {recommendationsDaily.map((rec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg text-[11px] font-bold border"
                      style={{
                        backgroundColor: rec.type === 'warning' ? 'rgba(239, 68, 68, 0.08)' : rec.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(14, 165, 233, 0.08)',
                        borderColor: rec.type === 'warning' ? 'rgba(239, 68, 68, 0.15)' : rec.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                        color: rec.type === 'warning' ? '#F87171' : rec.type === 'success' ? '#10B981' : '#38BDF8'
                      }}>
                      {rec.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Interactive Chat Console */}
            <div className="lg:col-span-8 flex flex-col h-[520px] rounded-2xl border overflow-hidden"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: theme.border }}>
                <Bot className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-black" style={{ color: theme.text }}>استشير سهم AI Analyst حياً</h4>
                  <p className="text-[9px] text-gray-500">يقوم الذكاء الاصطناعي بقراءة المؤشرات والنسب وحركات القيود وتقديم الاستشارة</p>
                </div>
              </div>

              {/* Chat Message Scroll list */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}>
                    <div className={`p-3 max-w-[85%] rounded-2xl text-xs font-bold leading-relaxed border shadow-sm ${msg.sender === "user" ? "bg-slate-900 border-gray-700 text-white" : "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-end p-2">
                    <span className="text-[11px] text-gray-500 animate-pulse font-bold">⚡ جاري قراءة المؤشرات المالية وبث الرد حياً من سهم مال...</span>
                  </div>
                )}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendChat} className="p-3 border-t flex gap-2" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <input
                  type="text"
                  required
                  placeholder="اسأل سهم مالي: 'ما توقع البنك الراجحي للشهر القادم؟' أو 'كيف أمنع الهدر؟'..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-grow text-xs p-2.5 rounded-xl border focus:outline-none bg-slate-950 border-gray-700 text-white"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl font-black text-xs text-black cursor-pointer bg-emerald-400"
                  disabled={aiLoading}
                >
                  استعلم حياً
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
