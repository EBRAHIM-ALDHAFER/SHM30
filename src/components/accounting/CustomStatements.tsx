import React, { useState, useMemo } from "react";
import { Customer, Supplier, Invoice, ExpenseTransaction, ThemeColors, PayrollEmployee } from "../../types";
import { Search, Calendar, User, Truck, Briefcase, MapPin, Printer, FileSpreadsheet, ArrowLeftRight, FileText, CheckCircle } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

interface CustomStatementsProps {
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  theme: ThemeColors;
}

// Default employees matching operations payroll configuration
const DEFAULT_EMPLOYEES: PayrollEmployee[] = [
  { id: "EMP-01", name: "أحمد بن عبدالمحسن", role: "مدير الحسابات", basicSalary: 8500, allowances: 1500, deductions: 200, status: "paid" },
  { id: "EMP-02", name: "سارة الغامدي", role: "أخصائية تسويق", basicSalary: 6000, allowances: 1000, deductions: 0, status: "paid" },
  { id: "EMP-03", name: "خالد الحربي", role: "مشرف مبيعات كاشير", basicSalary: 4500, allowances: 500, deductions: 100, status: "paid" }
];

// Default branches matching system configuration
const DEFAULT_BRANCHES = [
  { id: "br_riyadh_main", name: "فرع الرياض الرئيسي", city: "الرياض", manager: "عبدالله بن فهد" },
  { id: "br_jeddah_int", name: "فرع جدة - ردسي مول", city: "جدة", manager: "أنس القرني" },
  { id: "br_dammam", name: "فرع مجمع مارينا مول", city: "الدمام", manager: "رائد المطيري" },
  { id: "br_makkah", name: "فرع العتبيات - مكة المكرمة", city: "مكة المكرمة", manager: "شرف الهذلي" }
];

export default function CustomStatements({
  customers,
  suppliers,
  invoices,
  theme
}: CustomStatementsProps) {
  // Statement category states
  const [statementType, setStatementType] = useState<"customer" | "supplier" | "employee" | "branch">("customer");
  
  // Selection states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // --- 1. DYNAMIC DATA PREFETCH & CLASSIFICATION ---
  
  // Active Customer selector list
  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Active Supplier selector list
  const activeSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
  }, [suppliers, selectedSupplierId]);

  // Active Employee selector list
  const activeEmployee = useMemo(() => {
    return DEFAULT_EMPLOYEES.find(e => e.id === selectedEmployeeId) || DEFAULT_EMPLOYEES[0];
  }, [selectedEmployeeId]);

  // Active Branch selector list
  const activeBranch = useMemo(() => {
    return DEFAULT_BRANCHES.find(b => b.id === selectedBranchId) || DEFAULT_BRANCHES[0];
  }, [selectedBranchId]);

  // Set default selection on mount if empty
  React.useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) setSelectedCustomerId(customers[0].id);
    if (suppliers.length > 0 && !selectedSupplierId) setSelectedSupplierId(suppliers[0].id);
    if (!selectedEmployeeId) setSelectedEmployeeId(DEFAULT_EMPLOYEES[0].id);
    if (!selectedBranchId) setSelectedBranchId(DEFAULT_BRANCHES[0].id);
  }, [customers, suppliers]);

  // --- 2. LEDGER STATEMENT TRANSACTION GENERATORS ---

  // 1. CUSTOMER LEDGER STATEMENT GENERATOR
  const customerStatementLines = useMemo(() => {
    if (!activeCustomer) return [];

    let balance = 0;
    const lines: any[] = [];

    // Filter sale invoices for this customer
    const customerInvoices = invoices.filter(inv => 
      inv.type === "sale" && 
      (inv.customer === activeCustomer.name || activeCustomer.name.includes(inv.customer) || inv.customer.includes(activeCustomer.name))
    );

    customerInvoices.forEach(inv => {
      // 1. Debit Entry: Sale Invoice creation (Customer Account debited because they owe us)
      const date = inv.date || "2026-05-10";
      balance += inv.total;
      lines.push({
        date,
        type: "فاتورة مبيعات 📦",
        txId: `SL-${inv.id}`,
        description: `شراء بضاعة بموجب فاتورة مبيعات تفصيلية #${inv.id}`,
        ref: `فاتورة #${inv.id}`,
        debit: inv.total,
        credit: 0,
        runningBalance: balance
      });

      // 2. Credit Entry: Payment (If paid, customer paid us so we credit their account)
      if (inv.status === "مدفوع") {
        balance -= inv.total;
        lines.push({
          date,
          type: "سند قبض تحصيل 💵",
          txId: `PMT-${inv.id}`,
          description: `دفعة مستلمة نقداً/بنكاً لتسوية فاتورة مبيعات #${inv.id}`,
          ref: `تحصيل #${inv.id}`,
          debit: 0,
          credit: inv.total,
          runningBalance: balance
        });
      }
    });

    // Sort by date
    return lines.sort((a, b) => a.date.localeCompare(b.date));
  }, [activeCustomer, invoices]);

  // 2. SUPPLIER LEDGER STATEMENT GENERATOR
  const supplierStatementLines = useMemo(() => {
    if (!activeSupplier) return [];

    let balance = 0;
    const lines: any[] = [];

    // Filter purchase invoices for this supplier
    const supplierInvoices = invoices.filter(inv => 
      inv.type === "purchase" && 
      (inv.customer === activeSupplier.company || inv.customer === activeSupplier.name || activeSupplier.company.includes(inv.customer) || inv.customer.includes(activeSupplier.company))
    );

    supplierInvoices.forEach(inv => {
      // 1. Credit Entry: Purchase invoice (We owe the supplier, Accounts Payable is credited)
      const date = inv.date || "2026-05-12";
      balance += inv.total; // Outstanding payable balance
      lines.push({
        date,
        type: "فاتورة مشتريات 🚚",
        txId: `PR-${inv.id}`,
        description: `توريد وتخزين بضاعة بموجب فاتورة مشتريات #${inv.id}`,
        ref: `فاتورة #${inv.id}`,
        debit: 0,
        credit: inv.total,
        runningBalance: balance
      });

      // 2. Debit Entry: Payment (We paid the supplier, Accounts Payable is debited)
      if (inv.status === "مدفوع") {
        balance -= inv.total;
        lines.push({
          date,
          type: "سند صرف تسوية 💸",
          txId: `PAY-${inv.id}`,
          description: `تسوية حساب المورد وسداد قيمة فاتورة مشتريات #${inv.id}`,
          ref: `سداد #${inv.id}`,
          debit: inv.total,
          credit: 0,
          runningBalance: balance
        });
      }
    });

    return lines.sort((a, b) => a.date.localeCompare(b.date));
  }, [activeSupplier, invoices]);

  // 3. EMPLOYEE LEDGER STATEMENT GENERATOR
  const employeeStatementLines = useMemo(() => {
    if (!activeEmployee) return [];

    let balance = 0;
    const lines: any[] = [];

    // Simulate payroll cycles (Jan, Feb, Mar, Apr, May 2026)
    const months = [
      { num: "01", name: "يناير" },
      { num: "02", name: "فبراير" },
      { num: "03", name: "مارس" },
      { num: "04", name: "أبريل" },
      { num: "05", name: "مايو" }
    ];

    months.forEach((m) => {
      const cycleDate = `2026-${m.num}-28`;
      const netSalary = activeEmployee.basicSalary + activeEmployee.allowances - activeEmployee.deductions;

      // 1. Salaries Accrual (Credit): Employee account is credited for what they earned
      balance += (activeEmployee.basicSalary + activeEmployee.allowances);
      lines.push({
        date: cycleDate,
        type: "مستحق راتب شهري 🤵",
        txId: `ACR-${m.num}-${activeEmployee.id}`,
        description: `مستحقات راتب شهر ${m.name} 2026 (أساسي + بدلات)`,
        ref: `مسير ${m.name}`,
        debit: 0,
        credit: activeEmployee.basicSalary + activeEmployee.allowances,
        runningBalance: balance
      });

      // 2. Deductions (Debit): Deduct custom deductions if any
      if (activeEmployee.deductions > 0) {
        balance -= activeEmployee.deductions;
        lines.push({
          date: cycleDate,
          type: "استقطاع/جزاءات ❌",
          txId: `DED-${m.num}-${activeEmployee.id}`,
          description: `حسميات وتأخير ومسترد عهد راتب شهر ${m.name}`,
          ref: `استقطاع ${m.name}`,
          debit: activeEmployee.deductions,
          credit: 0,
          runningBalance: balance
        });
      }

      // 3. Bank Payout Transfer (Debit): We pay their net salary, reducing balance back to 0
      balance -= netSalary;
      lines.push({
        date: cycleDate,
        type: "صرف وتحويل بنكي 🏦",
        txId: `TRF-${m.num}-${activeEmployee.id}`,
        description: `حوالة مصرفية راتب شهر ${m.name} الصافية لحساب الموظف بالراجحي`,
        ref: `حوالة #${m.num}982`,
        debit: netSalary,
        credit: 0,
        runningBalance: balance
      });
    });

    return lines;
  }, [activeEmployee]);

  // 4. BRANCH LEDGER STATEMENT GENERATOR
  const branchStatementLines = useMemo(() => {
    if (!activeBranch) return [];

    let balance = 0;
    const lines: any[] = [];

    // MOCK EXPENSES list related to the branch or generalized
    const sampleExpenses: ExpenseTransaction[] = [
      { id: "EXP-101", category: "تسويق", amount: 1500, date: "2026-05-15", description: "إعلانات جوجل بلس وسنابشات لترويج صفقات الفروع", paymentMethod: "bank" },
      { id: "EXP-102", category: "إيجار", amount: 5000, date: "2026-05-01", description: "شيك إيجار المعارض الرئيسي للفرع الحالي", paymentMethod: "bank" },
      { id: "EXP-103", category: "خدمات", amount: 480, date: "2026-05-20", description: "شحن باقة إنترنت صالة الانتظار والفرع الذكي", paymentMethod: "cash" }
    ];

    // MOCK BRANCH ALLOCATION: 
    // Sales are distributed. If ID hash matches, or we simulate realistic distribution
    invoices.forEach((inv) => {
      // We decide branch allocation based on customer name string hash
      const hash = inv.customer.charCodeAt(0) + inv.id.charCodeAt(inv.id.length - 1);
      const branchesList = ["br_riyadh_main", "br_jeddah_int", "br_dammam", "br_makkah"];
      const allocatedBranchId = branchesList[hash % 4];

      if (allocatedBranchId === activeBranch.id) {
        if (inv.type === "sale") {
          // Sale is Credit to Revenue / Debit to Cash
          balance += inv.total;
          lines.push({
            date: inv.date || "2026-05-15",
            type: "مبيعات للفرع 🏥",
            txId: `INV-${inv.id}`,
            description: `إثبات فاتورة مبيعات الكاشير صالة ${activeBranch.name} (#${inv.id})`,
            ref: `فاتورة #${inv.id}`,
            debit: inv.total,
            credit: 0,
            runningBalance: balance
          });
        }
      }
    });

    // Allocate expenses based on branch description
    sampleExpenses.forEach((exp, idx) => {
      const expHash = exp.description.charCodeAt(0) + idx;
      const branchesList = ["br_riyadh_main", "br_jeddah_int", "br_dammam", "br_makkah"];
      const allocatedBranchId = branchesList[expHash % 4];

      if (allocatedBranchId === activeBranch.id) {
        balance -= exp.amount;
        lines.push({
          date: exp.date,
          type: "مصاريف تشغيلية 💸",
          txId: exp.id,
          description: `${exp.description} [تصنيف: ${exp.category}]`,
          ref: `سند صرف`,
          debit: 0,
          credit: exp.amount,
          runningBalance: balance
        });
      }
    });

    return lines.sort((a, b) => a.date.localeCompare(b.date));
  }, [activeBranch, invoices]);

  // --- 3. FILTERING STATEMENTS ---
  const filteredLines = useMemo(() => {
    let currentLines: any[] = [];
    if (statementType === "customer") currentLines = customerStatementLines;
    if (statementType === "supplier") currentLines = supplierStatementLines;
    if (statementType === "employee") currentLines = employeeStatementLines;
    if (statementType === "branch") currentLines = branchStatementLines;

    return currentLines.filter(line => {
      // Date constraints
      if (startDate && line.date < startDate) return false;
      if (endDate && line.date > endDate) return false;

      // Search Query constraint
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          line.type.toLowerCase().includes(query) ||
          line.txId.toLowerCase().includes(query) ||
          line.description.toLowerCase().includes(query) ||
          line.ref.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [statementType, customerStatementLines, supplierStatementLines, employeeStatementLines, branchStatementLines, startDate, endDate, searchQuery]);

  // Financial totals computation
  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    filteredLines.forEach(ln => {
      totalDebit += ln.debit;
      totalCredit += ln.credit;
    });

    return {
      debit: totalDebit,
      credit: totalCredit,
      balance: filteredLines.length > 0 ? filteredLines[filteredLines.length - 1].runningBalance : 0
    };
  }, [filteredLines]);

  // --- 4. EXPORT HANDLERS ---
  const handlePrintPDF = () => {
    const subtitleName = 
      statementType === "customer" ? `كشف حساب العميل: ${activeCustomer?.name}` :
      statementType === "supplier" ? `كشف حساب المورد: ${activeSupplier?.company || activeSupplier?.name}` :
      statementType === "employee" ? `كشف حساب الموظف: ${activeEmployee?.name} (${activeEmployee?.role})` :
      `كشف حساب وموازنة فرع: ${activeBranch?.name}`;

    const cols = [
      { key: "date", label: "التاريخ" },
      { key: "txId", label: "رقم الحركة" },
      { key: "type", label: "النوع" },
      { key: "description", label: "البيان والعملية التفصيلية" },
      { key: "ref", label: "المرجع" },
      { key: "debit", label: "مدين (+)", format: (v: number) => v > 0 ? v.toLocaleString() + " ر.س" : "-" },
      { key: "credit", label: "دائن (-)", format: (v: number) => v > 0 ? v.toLocaleString() + " ر.س" : "-" },
      { key: "runningBalance", label: "الرصيد الجاري", format: (v: number) => v.toLocaleString() + " ر.س" }
    ];

    exportToPDF(`كشف حساب تفصيلي - سهم ERP`, cols, filteredLines, subtitleName);
  };

  const handleExportExcel = () => {
    const filename = `كشف_حساب_${statementType}_${new Date().toISOString().slice(0, 10)}`;
    const cols = [
      { key: "date", label: "التاريخ" },
      { key: "txId", label: "رقم الحركة" },
      { key: "type", label: "النوع" },
      { key: "description", label: "البيان" },
      { key: "ref", label: "المرجع" },
      { key: "debit", label: "مدين" },
      { key: "credit", label: "دائن" },
      { key: "runningBalance", label: "الرصيد الجاري" }
    ];
    exportToExcel(filteredLines, cols, filename);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* STATEMENT CATEGORY SELECTOR TABS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-500/5 p-2 rounded-xl border" style={{ borderColor: theme.border }}>
        {[
          { id: "customer", label: "العملاء (Customers)", icon: User },
          { id: "supplier", label: "الموردين (Suppliers)", icon: Truck },
          { id: "employee", label: "الموظفين (Employees)", icon: Briefcase },
          { id: "branch", label: "الفروع (Branches)", icon: MapPin }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = statementType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatementType(tab.id as any);
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${isActive ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: SELECTOR & CARDS (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl border space-y-4 shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 border-b pb-2" style={{ borderColor: theme.border }}>
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              <span>
                {statementType === "customer" && "تحديد العميل للتقرير:"}
                {statementType === "supplier" && "تحديد المورد للتقرير:"}
                {statementType === "employee" && "تحديد الموظف للتقرير:"}
                {statementType === "branch" && "تحديد معرض/فرع النشاط:"}
              </span>
            </h4>

            {/* DYNAMIC SELECTORS */}
            {statementType === "customer" && (
              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block">اختر العميل المالي:</span>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>

                {activeCustomer && (
                  <div className="bg-gray-500/5 p-3 rounded-lg border space-y-2 text-[11px] font-bold" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between">
                      <span className="text-gray-400">كود العميل:</span>
                      <span style={{ color: theme.text }}>{activeCustomer.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">الهاتف:</span>
                      <span className="font-mono text-gray-300">{activeCustomer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">الفرع المربوط:</span>
                      <span className="text-sky-400">{activeCustomer.city}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: theme.border }}>
                      <span className="text-gray-400">الرصيد في شجرة الذمم:</span>
                      <span className="text-emerald-400 font-mono">{activeCustomer.balance.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {statementType === "supplier" && (
              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block">اختر المورد المعتمد:</span>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.company || s.name}</option>
                  ))}
                </select>

                {activeSupplier && (
                  <div className="bg-gray-500/5 p-3 rounded-lg border space-y-2 text-[11px] font-bold" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between">
                      <span className="text-gray-400">الشركة:</span>
                      <span style={{ color: theme.text }}>{activeSupplier.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المسؤول:</span>
                      <span style={{ color: theme.text }}>{activeSupplier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">الهاتف:</span>
                      <span className="font-mono text-gray-300">{activeSupplier.phone}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: theme.border }}>
                      <span className="text-gray-400">الرصيد الدائن المستحق:</span>
                      <span className="text-rose-400 font-mono">{activeSupplier.balance.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {statementType === "employee" && (
              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block">اختر الموظف أو الكاشير:</span>
                <select
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  {DEFAULT_EMPLOYEES.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>

                {activeEmployee && (
                  <div className="bg-gray-500/5 p-3 rounded-lg border space-y-2 text-[11px] font-bold" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المسمى الوظيفي:</span>
                      <span style={{ color: theme.text }}>{activeEmployee.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">الراتب الأساسي:</span>
                      <span style={{ color: theme.text }}>{activeEmployee.basicSalary.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">البدلات الشهرية:</span>
                      <span className="text-emerald-400">+{activeEmployee.allowances.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between text-rose-400 border-t pt-2 mt-2" style={{ borderColor: theme.border }}>
                      <span className="text-gray-400">الاستقطاعات والتأمينات:</span>
                      <span>-{activeEmployee.deductions.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {statementType === "branch" && (
              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block">اختر الفرع التجاري:</span>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  {DEFAULT_BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                {activeBranch && (
                  <div className="bg-gray-500/5 p-3 rounded-lg border space-y-2 text-[11px] font-bold" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المدينة:</span>
                      <span style={{ color: theme.text }}>{activeBranch.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">مدير الفرع:</span>
                      <span style={{ color: theme.text }}>{activeBranch.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">حالة الفرع:</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400">مصل ومفعلون</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: STATEMENT LISTING TABLE (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            
            {/* Header / Title bar with buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4" style={{ borderColor: theme.border }}>
              <div>
                <h3 className="text-xs font-black" style={{ color: theme.text }}>
                  {statementType === "customer" && `كشف حساب العميل التراكمي: ${activeCustomer?.name}`}
                  {statementType === "supplier" && `كشف حساب المورد: ${activeSupplier?.company || activeSupplier?.name}`}
                  {statementType === "employee" && `مستخلص مسير رواتب وحساب: ${activeEmployee?.name}`}
                  {statementType === "branch" && `الأستاذ التحليلي لإيرادات ونفقات فرع: ${activeBranch?.name}`}
                </h3>
                <p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>دقة محاسبية كاملة للعمليات التاريخية والترحيل المزدوج</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPDF}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة كشف الحساب 📄</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تصدير إكسل 📊</span>
                </button>
              </div>
            </div>

            {/* Live Filter inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="ابحث تصفية للبيانات"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs p-2 pr-9 rounded-lg border focus:outline-none focus:ring-1"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex gap-1.5 items-center">
                  <span className="text-[9px] text-gray-500 font-bold">من:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-[10px] p-2 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  />
                  <span className="text-[9px] text-gray-500 font-bold">إلى:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-[10px] p-2 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              {/* Status banner */}
              <div className="p-2 rounded-lg bg-indigo-500/5 text-center text-[10px] border flex items-center justify-center font-bold" style={{ borderColor: theme.border, color: theme.text }}>
                <span>كلي القيود: {filteredLines.length} حركات</span>
              </div>
            </div>

            {/* TABLE GRID */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700/30">
                    <th className="py-2.5 px-2">التاريخ</th>
                    <th className="py-2.5 px-2">رقم العملي</th>
                    <th className="py-2.5 px-2">نوع الحركة</th>
                    <th className="py-2.5 px-2">البيان والعملية</th>
                    <th className="py-2.5 px-2">المرجع</th>
                    <th className="py-2.5 px-2 text-emerald-400">مدين (+)</th>
                    <th className="py-2.5 px-2 text-rose-400">دائن (-)</th>
                    <th className="py-2.5 px-2 text-left">الرصيد الجاري</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                  {filteredLines.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 font-medium">
                        لا توجد حركات مطابقة للفلترة أو نطاق التاريخ المحدد حالياً
                      </td>
                    </tr>
                  ) : (
                    filteredLines.map((line, index) => (
                      <tr key={index} className="border-b hover:bg-slate-800/10 transition-colors" style={{ borderColor: theme.border }}>
                        <td className="py-2 px-2 text-[11px] text-gray-400 font-mono">{line.date}</td>
                        <td className="py-2 px-2 font-mono text-indigo-400">{line.txId}</td>
                        <td className="py-2 px-2">
                          <span className="px-2 py-0.5 rounded font-black text-[9px] bg-sky-500/10 text-sky-400">
                            {line.type}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[11px]" style={{ color: theme.text }}>{line.description}</td>
                        <td className="py-2 px-2 font-mono text-[10px] text-gray-400">{line.ref}</td>
                        <td className="py-2 px-2 text-emerald-400 font-mono">
                          {line.debit > 0 ? line.debit.toLocaleString("ar-SA") + " ر.س" : "-"}
                        </td>
                        <td className="py-2 px-2 text-rose-400 font-mono">
                          {line.credit > 0 ? line.credit.toLocaleString("ar-SA") + " ر.س" : "-"}
                        </td>
                        <td className="py-2 px-2 text-left font-mono text-gray-300">
                          {line.runningBalance.toLocaleString("ar-SA")} ر.س
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* LEDGER FOOTER MATRIX SUMMARY */}
            {filteredLines.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: theme.border }}>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-center">
                  <span className="text-[9px] text-gray-400 block font-bold">إجمالي المطالبات المدينة (Debit Pool):</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {totals.debit.toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-center">
                  <span className="text-[9px] text-gray-400 block font-bold">إجمالي الدفعات والتنزيلات (Credit Pool):</span>
                  <span className="text-sm font-black text-rose-400 font-mono">
                    {totals.credit.toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
                <div className="p-3 rounded-xl text-center bg-gray-500/10">
                  <span className="text-[9px] text-gray-400 block font-bold">رصيد الحساب الختامي المتداول:</span>
                  <span className="text-sm font-black text-indigo-400 font-mono">
                    {totals.balance.toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
