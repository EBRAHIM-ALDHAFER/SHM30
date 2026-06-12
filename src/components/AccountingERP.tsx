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
  FileText,
  ArrowRight,
  ChevronRight,
  Receipt,
  TrendingUp
} from "lucide-react";

interface AccountingERPProps {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  theme: ThemeColors;
  openUnifiedActions?: (type: string, data: any) => void;
  initialTab?: "dashboard" | "coa" | "journal" | "invoices_erp" | "statements" | "final_sheets" | "ops" | "ledger" | "ai_analyst";
}

export default function AccountingERP({
  invoices,
  products,
  customers,
  suppliers,
  theme,
  openUnifiedActions,
  initialTab = "dashboard"
}: AccountingERPProps) {
  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "coa" | "journal" | "invoices_erp" | "statements" | "final_sheets" | "ops" | "ledger" | "ai_analyst">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Invoices Sub-view Filters
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<"all" | "sale" | "purchase">("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<"all" | "paid" | "pending">("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = (inv.id || "").toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.customer || "").toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchType = invoiceTypeFilter === "all" ? true : inv.type === invoiceTypeFilter;
      const matchStatus = invoiceStatusFilter === "all" ? true : 
                          invoiceStatusFilter === "paid" ? inv.status === "مدفوع" : 
                          inv.status === "معلق";
      return matchSearch && matchType && matchStatus;
    });
  }, [invoices, invoiceSearch, invoiceTypeFilter, invoiceStatusFilter]);

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

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const base = [
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
    ];

    try {
      const saved = localStorage.getItem("sahm_journal_entries_manual");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const baseIds = new Set(base.map(e => e.id));
          const filtered = parsed.filter(e => !baseIds.has(e.id));
          return [...base, ...filtered];
        }
      }
    } catch {}
    return base;
  });

  // Persist manual entries to localStorage on updates
  useEffect(() => {
    try {
      const staticIds = new Set(["JE-10001", "JE-10002"]);
      const manualOnly = journalEntries.filter(
        e => !staticIds.has(e.id) && !e.id.startsWith("JE-AUTO-")
      );
      localStorage.setItem("sahm_journal_entries_manual", JSON.stringify(manualOnly));
    } catch {}
  }, [journalEntries]);

  // Voucher Modal States
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherType, setVoucherType] = useState<"receipt" | "payment">("receipt");
  const [voucherAmount, setVoucherAmount] = useState("");
  const [voucherDate, setVoucherDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [voucherPayeeOrPayer, setVoucherPayeeOrPayer] = useState("");
  const [voucherAccountCode, setVoucherAccountCode] = useState("");
  const [voucherPaymentMethod, setVoucherPaymentMethod] = useState<"cash" | "bank">("bank");
  const [voucherDescription, setVoucherDescription] = useState("");

  const counterpartAccounts = useMemo(() => {
    return accounts.filter(acc => !["1101", "1102", "1103", "1104"].includes(acc.code));
  }, [accounts]);

  useEffect(() => {
    if (counterpartAccounts.length > 0 && !voucherAccountCode) {
      setVoucherAccountCode(counterpartAccounts[0].code);
    }
  }, [counterpartAccounts, voucherAccountCode]);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(voucherAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("يرجى إدخال مبلغ مالي صحيح أكبر من الصفر.");
      return;
    }
    if (!voucherAccountCode) {
      alert("يرجى اختيار الحساب المقابل لإتمام القيد.");
      return;
    }
    if (!voucherPayeeOrPayer.trim()) {
      alert(voucherType === "receipt" ? "يرجى تحديد اسم دافع المبلغ." : "يرجى تحديد اسم مستلم المبلغ.");
      return;
    }

    const cashAccCode = voucherPaymentMethod === "cash" ? "1101" : "1102";
    const cashAccName = voucherPaymentMethod === "cash" ? "الصندوق المالي (Cash)" : "حساب البنك الراجحي الجاري";
    
    const selectedAcc = accounts.find(a => a.code === voucherAccountCode);
    const selectedAccName = selectedAcc ? selectedAcc.name : "حساب غير محدد";

    const entryLines = voucherType === "receipt" ? [
      { accountCode: cashAccCode, accountName: cashAccName, debit: amt, credit: 0 },
      { accountCode: voucherAccountCode, accountName: selectedAccName, debit: 0, credit: amt }
    ] : [
      { accountCode: voucherAccountCode, accountName: selectedAccName, debit: amt, credit: 0 },
      { accountCode: cashAccCode, accountName: cashAccName, debit: 0, credit: amt }
    ];

    const newEntry: JournalEntry = {
      id: `JE-VOUCHER-${Date.now()}`,
      date: voucherDate || new Date().toISOString().slice(0, 10),
      description: `${voucherType === "receipt" ? "سند قبض" : "سند صرف"} - ${voucherPayeeOrPayer.trim()}: ${voucherDescription.trim() || "بدون تفاصيل إضافية"}`,
      ref: `${voucherType === "receipt" ? "قبض" : "صرف"} #${Date.now().toString().slice(-6)}`,
      lines: entryLines,
      isPosted: true
    };

    setJournalEntries(prev => [...prev, newEntry]);
    
    // Reset Form
    setVoucherAmount("");
    setVoucherPayeeOrPayer("");
    setVoucherDescription("");
    setShowVoucherModal(false);

    alert(`✓ تم تسجيل وترحيل ${voucherType === "receipt" ? "سند القبض" : "سند الصرف"} بنجاح!`);
  };

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
      text: "مرحباً بك يا تاجرنا الكريم! أنا مستشارك المالي الذكي سهم AI Financial Analyst. لقد قمت بتحليل دليل حساباتك وحركات المبيعات والرواتب والمصروفات حياً. هل ترغب في معرفة مستوى كفاءة التسويق، أو تقصي الهدر بالمصروفات، أو توقعات التدفقات النقدية؟"
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

    const getBalance = (code: string) => {
      const acc = accounts.find(a => a.code === code);
      if (!acc) return 0;
      let db = 0, cr = 0;
      lines.forEach(l => {
        if (l.accountCode === code) {
          db += l.debit;
          cr += l.credit;
        }
      });
      return acc.type === "assets" || acc.type === "expenses" ? (db - cr) : (cr - db);
    };

    const cashBox = getBalance("1101");
    const bankAlrajhi = getBalance("1102");
    const bankSnb = getBalance("1103");
    const cash = cashBox + bankAlrajhi + bankSnb;

    const inventory = getBalance("1106");
    const ar = getBalance("1105");
    const ap = getBalance("2101");
    const vatPayable = getBalance("2103");

    const zakat = Math.max((cash + inventory + ar - ap) * 0.025, 0);

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
      vatPayable,
      ar,
      ap
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
        setChatMessages(prev => [...prev, { sender: "ai", text: `خطأ المستشار المالي: ${data.error}` }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "ai", text: data.response }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: "ai", text: "فضل الاتصال بالخادم المالي حياً لتلقي الاستشارة، جرب لاحقاً." }]);
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
      
      {activeMainTab === "dashboard" ? (
        <div className="space-y-6 animate-fade-in">
          {/* 2. FINANCIAL SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border space-y-1.5 text-right bg-slate-950/40 backdrop-blur-md" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-400 block font-bold">السيولة المتوفرة (كاش وبنوك):</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {liveFinancialMetrics.cash.toLocaleString("ar-SA")} ر.س
              </span>
            </div>
            <div className="p-4 rounded-2xl border space-y-1.5 text-right bg-slate-950/40 backdrop-blur-md" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-400 block font-bold">صافي الأرباح (النشاط الحالي):</span>
              <span className={`text-base font-black font-mono ${liveFinancialMetrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {liveFinancialMetrics.netProfit.toLocaleString("ar-SA")} ر.س
              </span>
            </div>
            <div className="p-4 rounded-2xl border space-y-1.5 text-right bg-slate-950/40 backdrop-blur-md" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-400 block font-bold">الضرائب المستحقة (الهيئة):</span>
              <span className="text-base font-black font-mono text-indigo-400">
                {liveFinancialMetrics.vatPayable.toLocaleString("ar-SA")} ر.س
              </span>
            </div>
            <div className="p-4 rounded-2xl border space-y-1.5 text-right bg-slate-950/40 backdrop-blur-md" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-400 block font-bold">الحركات المعلقة للترحيل:</span>
              <span className="text-base font-black font-mono text-amber-500">
                {journalEntries.filter(e => !e.isPosted).length} حركات
              </span>
            </div>
          </div>

                    {/* 3. QUICK ACTIONS */}
          <div className="p-5 rounded-2xl border bg-slate-950/40 backdrop-blur-md" style={{ borderColor: theme.border }}>
            <h3 className="text-xs font-black text-white mb-4">لوحة العمليات السريعة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <button
                onClick={() => {
                  setVoucherType("receipt");
                  setShowVoucherModal(true);
                }}
                className="py-3.5 px-4 rounded-xl text-xs font-black text-gray-300 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 hover:text-amber-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm"
              >
                <Receipt className="w-5 h-5 text-gray-400 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-200" />
                <span>قبض</span>
              </button>
              <button
                onClick={() => {
                  setVoucherType("payment");
                  setShowVoucherModal(true);
                }}
                className="py-3.5 px-4 rounded-xl text-xs font-black text-gray-300 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 hover:text-amber-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm"
              >
                <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-200" />
                <span>صرف</span>
              </button>
              <button
                onClick={() => {
                  setActiveMainTab("journal");
                }}
                className="py-3.5 px-4 rounded-xl text-xs font-black text-gray-300 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 hover:text-amber-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm"
              >
                <ArrowRightLeft className="w-5 h-5 text-gray-400 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-200" />
                <span>قيد</span>
              </button>
              <button
                onClick={() => {
                  if (openUnifiedActions) {
                    openUnifiedActions("invoice_create", {});
                  } else {
                    setActiveMainTab("invoices_erp");
                  }
                }}
                className="py-3.5 px-4 rounded-xl text-xs font-black text-gray-300 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 hover:text-amber-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm"
              >
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-200" />
                <span>فاتورة</span>
              </button>
              <button
                onClick={() => {
                  if (openUnifiedActions) {
                    openUnifiedActions("shift_close", {});
                  } else {
                    alert("تمت تسوية ومطابقة الأرصدة البنكية بنجاح!");
                  }
                }}
                className="py-3.5 px-4 rounded-xl text-xs font-black text-gray-300 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 hover:text-amber-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm col-span-2 sm:col-span-1"
              >
                <Hammer className="w-5 h-5 text-gray-400 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-200" />
                <span>تسوية</span>
              </button>
            </div>
          </div>

          {/* 4. MODULES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: coa */}
            <div className="p-6 rounded-2xl border bg-slate-950/30 hover:bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between h-52 group"
              style={{ borderColor: theme.border }}>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300 shrink-0">
                    <Layers className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h4 className="text-base font-black text-white">الخزائن وبنود الحسابات</h4>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">الدليل المحاسبي وشجرة الحسابات العامة وأرصدة الصناديق.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[10px] text-gray-500 font-bold">{accounts.length} حساب مالي نشط</span>
                <button
                  onClick={() => setActiveMainTab("coa")}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </div>

            {/* Card 2: journal */}
            <div className="p-6 rounded-2xl border bg-slate-950/30 hover:bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between h-52 group"
              style={{ borderColor: theme.border }}>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300 shrink-0">
                    <ArrowRightLeft className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h4 className="text-base font-black text-white">القيود والعمليات اليومية</h4>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">سجل حركات القيود المزدوجة اليومية والعمليات المرحلة للدفاتر.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[10px] text-gray-500 font-bold">{journalEntries.length} قيود مسجلة</span>
                <button
                  onClick={() => setActiveMainTab("journal")}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </div>

            {/* Card 3: invoices */}
            <div className="p-6 rounded-2xl border bg-slate-950/30 hover:bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between h-52 group"
              style={{ borderColor: theme.border }}>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300 shrink-0">
                    <FileText className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h4 className="text-base font-black text-white">الفواتير والمشتريات</h4>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">فواتير المبيعات والشراء ومطابقة دورة الضريبة المضافة.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[10px] text-gray-500 font-bold">{invoices.length} فواتير مصدرة</span>
                <button
                  onClick={() => setActiveMainTab("invoices_erp")}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </div>

            {/* Card 4: statements */}
            <div className="p-6 rounded-2xl border bg-slate-950/30 hover:bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between h-52 group"
              style={{ borderColor: theme.border }}>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300 shrink-0">
                    <Briefcase className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h4 className="text-base font-black text-white">العملاء والموردين</h4>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">كشوفات الحساب التفصيلية ومطابقات الأرصدة للمتعاملين.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[10px] text-gray-500 font-bold">{customers.length + suppliers.length} عملاء وموردين</span>
                <button
                  onClick={() => setActiveMainTab("statements")}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </div>

            {/* Card 5: final_sheets */}
            <div className="p-6 rounded-2xl border bg-slate-950/30 hover:bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between h-52 group"
              style={{ borderColor: theme.border }}>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300 shrink-0">
                    <PieChart className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h4 className="text-base font-black text-white">التقارير المالية والأرباح</h4>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">قائمة الدخل والمركز المالي والتقارير المحاسبية الختامية.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[10px] text-gray-500 font-bold">مكتملة ومطابقة</span>
                <button
                  onClick={() => setActiveMainTab("final_sheets")}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </div>

            {/* Card 6: ops */}
            <div className="p-6 rounded-2xl border bg-slate-950/30 hover:bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between h-52 group"
              style={{ borderColor: theme.border }}>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300 shrink-0">
                    <Hammer className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h4 className="text-base font-black text-white">المصاريف والرواتب</h4>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">إدارة نفقات التشغيل والأجور الشهرية والمستندات البنكية.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                <span className="text-[10px] text-gray-500 font-bold">مسيرات الرواتب نشطة</span>
                <button
                  onClick={() => setActiveMainTab("ops")}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SUB-MODULE VIEW HEADER & INJECTION */
        <div className="space-y-6 animate-fade-in">
          {/* Sub Header */}
          <div className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold">النظام المحاسبي ERP / </span>
              <h3 className="text-xs font-black text-white">
                {activeMainTab === "coa" && "الخزائن وبنود الحسابات"}
                {activeMainTab === "journal" && "القيود والعمليات اليومية"}
                {activeMainTab === "invoices_erp" && "الفواتير والمشتريات"}
                {activeMainTab === "statements" && "كشوفات العملاء والموردين"}
                {activeMainTab === "final_sheets" && "التقارير المالية والأرباح"}
                {activeMainTab === "ledger" && "دفتر الأستاذ العام"}
                {activeMainTab === "ops" && "المصاريف والرواتب التشغيلية"}
                {activeMainTab === "ai_analyst" && "مستشار الذكاء المالي AI"}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Add export buttons inside modules where logical */}
              {activeMainTab === "coa" && (
                <>
                  <button
                    onClick={handlePrintPDFReport}
                    className="px-3 py-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors hover:bg-slate-800"
                    style={{ color: theme.text, borderColor: theme.border }}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>تصدير PDF</span>
                  </button>
                  <button
                    onClick={handleExportExcelAllLedgers}
                    className="px-3 py-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors hover:bg-slate-800"
                    style={{ color: theme.text, borderColor: theme.border }}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>تصدير إكسل الشجرة</span>
                  </button>
                </>
              )}
              
              <button
                onClick={() => setActiveMainTab("dashboard")}
                className="px-4 py-2 rounded-xl text-xs font-black text-amber-500 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للوحة الرئيسية</span>
              </button>
            </div>
          </div>

          {/* Module Content */}
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

            {activeMainTab === "invoices_erp" && (
              /* invoices tables */
              <div className="space-y-4 text-right" dir="rtl">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-xl border"
                     style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <input
                    type="text"
                    placeholder="البحث برقم الفاتورة أو اسم الطرف الثاني..."
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    className="w-full md:max-w-md text-xs p-2.5 rounded-xl border focus:outline-none bg-slate-900 border-slate-800 text-white text-right"
                  />
                  <div className="flex gap-2 w-full md:w-auto">
                    <select
                      value={invoiceTypeFilter}
                      onChange={e => setInvoiceTypeFilter(e.target.value as any)}
                      className="text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="all">كل الأنواع</option>
                      <option value="sale">مبيعات</option>
                      <option value="purchase">مشتريات</option>
                    </select>
                    <select
                      value={invoiceStatusFilter}
                      onChange={e => setInvoiceStatusFilter(e.target.value as any)}
                      className="text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="all">كل الحالات</option>
                      <option value="paid">مدفوعة</option>
                      <option value="pending">معلقة</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: theme.border }}>
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/60" style={{ color: theme.muted }}>
                        <th className="p-3 border-b border-slate-800">رقم الفاتورة</th>
                        <th className="p-3 border-b border-slate-800">النوع</th>
                        <th className="p-3 border-b border-slate-800">الطرف الثاني</th>
                        <th className="p-3 border-b border-slate-800">التاريخ</th>
                        <th className="p-3 border-b border-slate-800">القيمة الإجمالية</th>
                        <th className="p-3 border-b border-slate-800">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-gray-500 font-bold">لا توجد فواتير مطابقة للبحث حالياً.</td>
                        </tr>
                      ) : (
                        filteredInvoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-900/40 border-b border-slate-900" style={{ color: theme.text }}>
                            <td className="p-3 font-mono font-bold">#{inv.id}</td>
                            <td className="p-3 font-bold">
                              {inv.type === "sale" ? (
                                <span className="text-emerald-400">مبيعات</span>
                              ) : (
                                <span className="text-indigo-400">مشتريات</span>
                              )}
                            </td>
                            <td className="p-3 font-bold">{inv.customer || "غير محدد"}</td>
                            <td className="p-3 font-mono text-gray-400">{inv.date || "-"}</td>
                            <td className="p-3 font-mono font-bold text-white">{(inv.total || 0).toLocaleString("ar-SA")} ر.س</td>
                            <td className="p-3">
                              {inv.status === "مدفوع" || inv.status === "paid" ? (
                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">مدفوع</span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">معلق</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeMainTab === "statements" && (
              <CustomStatements
                customers={customers}
                suppliers={suppliers}
                invoices={invoices}
                theme={theme}
              />
            )}

            {activeMainTab === "final_sheets" && (
              <div className="space-y-4">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setActiveMainTab("ledger")}
                    className="px-3 py-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 cursor-pointer bg-slate-900 border-slate-800 text-white"
                  >
                    <span>دفتر الأستاذ العام</span>
                  </button>
                </div>
                <FinancialStatements
                  entries={journalEntries}
                  accounts={accounts}
                  theme={theme}
                />
              </div>
            )}

            {activeMainTab === "ledger" && (
              <div className="space-y-4">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setActiveMainTab("final_sheets")}
                    className="px-3 py-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 cursor-pointer bg-slate-900 border-slate-800 text-white"
                  >
                    <span>القوائم المالية والتقارير</span>
                  </button>
                </div>
                <GeneralLedger
                  entries={journalEntries}
                  accounts={accounts}
                  theme={theme}
                />
              </div>
            )}

            {activeMainTab === "ops" && (
              <OperationsAccounting
                accounts={accounts}
                entries={journalEntries}
                onAddAutomaticJournal={handleAddAutomaticJournal}
                theme={theme}
                customers={customers}
                suppliers={suppliers}
              />
            )}

            {activeMainTab === "ai_analyst" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
                {/* Daily advisory panel */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <h4 className="text-xs font-black text-rose-450 flex items-center gap-1.5">
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
                        <span className="text-[11px] text-gray-500 animate-pulse font-bold">جاري قراءة المؤشرات المالية وبث الرد حياً من سهم مال...</span>
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
      )}

      {/* VOUCHER CREATION MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 text-right shadow-2xl relative overflow-hidden"
            style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{voucherType === "receipt" ? "تسجيل سند قبض مالي جديد" : "تسجيل سند صرف مالي جديد"}</span>
              </h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-black text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
              {/* Type info block */}
              <div className={`p-3 rounded-xl border text-[11px] font-bold ${
                voucherType === "receipt" 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/5 border-rose-500/20 text-rose-450"
              }`}>
                {voucherType === "receipt" 
                  ? "• سيقوم هذا السند بإيداع المبلغ في الصندوق/البنك (مدين) وقيد الحساب المقابل (دائن)."
                  : "• سيقوم هذا السند بسحب المبلغ من الصندوق/البنك (دائن) وقيد الحساب المقابل (مدين)."
                }
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">القيمة المالية (ر.س) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">تاريخ المعاملة *</label>
                  <input
                    type="date"
                    required
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                  />
                </div>
              </div>

              {/* Payment Method and Payee/Payer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">طريقة السداد / الحساب المالي *</label>
                  <select
                    value={voucherPaymentMethod}
                    onChange={(e) => setVoucherPaymentMethod(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans font-bold"
                  >
                    <option value="bank">البنك الراجحي الجاري (1102)</option>
                    <option value="cash">الصندوق المالي النقدي (1101)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">
                    {voucherType === "receipt" ? "الدافع / الطرف الثاني *" : "المستلم / الطرف الثاني *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={voucherPayeeOrPayer}
                    onChange={(e) => setVoucherPayeeOrPayer(e.target.value)}
                    placeholder={voucherType === "receipt" ? "مثال: العميل شركة أحمد التجارية" : "مثال: المورد مؤسسة المواد الغذائية"}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                  />
                </div>
              </div>

              {/* Counterpart Account */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">الحساب المقابل في دليل الحسابات *</label>
                <select
                  value={voucherAccountCode}
                  onChange={(e) => setVoucherAccountCode(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans font-bold"
                >
                  {counterpartAccounts.map(acc => (
                    <option key={acc.code} value={acc.code}>
                      ({acc.code}) {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-bold">الوصف والتفاصيل</label>
                <textarea
                  rows={2}
                  value={voucherDescription}
                  onChange={(e) => setVoucherDescription(e.target.value)}
                  placeholder="الغرض من المعاملة..."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="submit"
                  className={`py-2.5 px-6 rounded-xl text-xs font-black cursor-pointer border-none text-zinc-950 flex items-center gap-1.5`}
                  style={{ backgroundColor: voucherType === "receipt" ? "#34d399" : "#f87171" }}
                >
                  <span>ترحيل وحفظ السند</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
