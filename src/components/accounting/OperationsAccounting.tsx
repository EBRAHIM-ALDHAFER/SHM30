import React, { useState, useMemo } from "react";
import { FixedAsset, PayrollEmployee, ExpenseTransaction, BudgetItem, Account, ThemeColors, JournalEntry, Customer, Supplier, AddressProfile } from "../../types";
import { Plus, Trash, CheckCircle2, TrendingUp, DollarSign, Calendar, ChevronRight, ShieldCheck, Mail, Send, Printer, User, Copy, MapPin, X, Edit2, Briefcase } from "lucide-react";
import ImageUploader from "../ImageUploader";
import NationalAddressForm from "../NationalAddressForm";

interface OperationsAccountingProps {
  accounts: Account[];
  onAddAutomaticJournal: (entry: JournalEntry) => void;
  theme: ThemeColors;
  customers?: Customer[];
  suppliers?: Supplier[];
}

export default function OperationsAccounting({
  accounts,
  onAddAutomaticJournal,
  theme,
  customers = [],
  suppliers = []
}: OperationsAccountingProps) {
  const [activeSubTab, setActiveSubTab] = useState<"expenses" | "payroll" | "fixed_assets" | "zakat_tax" | "budgets" | "aging_ar_ap">("expenses");

  // ----------- STATE & PRELOADS -----------
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([
    { id: "EXP-101", category: "تسويق", amount: 1500, date: "2026-05-15", description: "إعلانات جوجل بلس وسنابشات", paymentMethod: "bank", attachmentName: "google_invoice_55.pdf", accountCode: "5105", payeeType: "other", payeeName: "منصة سنابشات وجوجل العالمية" },
    { id: "EXP-102", category: "إيجار", amount: 5000, date: "2026-05-01", description: "دفعة إيجار فرع جادة الرياض الأول", paymentMethod: "bank", attachmentName: "jaddah_rent_contract.pdf", accountCode: "5104", payeeType: "supplier", payeeName: "الشركة الوطنية العقارية" },
    { id: "EXP-103", category: "خدمات", amount: 480, date: "2026-05-20", description: "شحن باقة إنترنت صالة الانتظار بفرع جدة", paymentMethod: "cash", attachmentName: "stc_receipt_882.png", accountCode: "5107", payeeType: "branch", payeeId: "br_jeddah_int", payeeName: "فرع جدة - ردسي مول" }
  ]);
  const [newExp, setNewExp] = useState<Partial<ExpenseTransaction>>({
    category: "رواتب",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: "",
    paymentMethod: "cash",
    accountCode: "",
    payeeType: "employee",
    payeeId: "EMP-01",
    payeeName: "أحمد بن عبدالمحسن"
  });
  const [selectedExpenseForPrint, setSelectedExpenseForPrint] = useState<ExpenseTransaction | null>(null);

  const [employees, setEmployees] = useState<PayrollEmployee[]>([
    { id: "EMP-01", name: "أحمد بن عبدالمحسن", role: "مدير الحسابات", basicSalary: 8500, allowances: 1500, deductions: 200, status: "pending" },
    { id: "EMP-02", name: "سارة الغامدي", role: "أخصائية تسويق", basicSalary: 6000, allowances: 1000, deductions: 0, status: "pending" },
    { id: "EMP-03", name: "خالد الحربي", role: "مشرف مبيعات كاشير", basicSalary: 4500, allowances: 500, deductions: 100, status: "pending" }
  ]);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    role: "أخصائي مبيعات",
    basicSalary: 4000,
    allowances: 0,
    deductions: 0,
  });
  const [employeeImageUrl, setEmployeeImageUrl] = useState<string | undefined>(undefined);
  const [employeeAddressProfile, setEmployeeAddressProfile] = useState<AddressProfile | undefined>(undefined);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name.trim()) return;

    if (editingEmployeeId !== null) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployeeId ? {
        ...emp,
        name: employeeForm.name,
        role: employeeForm.role,
        basicSalary: Number(employeeForm.basicSalary),
        allowances: Number(employeeForm.allowances),
        deductions: Number(employeeForm.deductions),
        imageUrl: employeeImageUrl,
        addressProfile: employeeAddressProfile
      } : emp));
    } else {
      const newId = `EMP-0${employees.length + 1}`;
      const newEmp: PayrollEmployee = {
        id: newId,
        name: employeeForm.name,
        role: employeeForm.role,
        basicSalary: Number(employeeForm.basicSalary),
        allowances: Number(employeeForm.allowances),
        deductions: Number(employeeForm.deductions),
        status: "pending",
        imageUrl: employeeImageUrl,
        addressProfile: employeeAddressProfile
      };
      setEmployees(prev => [...prev, newEmp]);
    }

    // Reset Form
    setEmployeeForm({
      name: "",
      role: "أخصائي مبيعات",
      basicSalary: 4000,
      allowances: 0,
      deductions: 0,
    });
    setEmployeeImageUrl(undefined);
    setEmployeeAddressProfile(undefined);
    setShowAddEmployee(false);
    setEditingEmployeeId(null);
  };

  const handleEditEmployee = (emp: PayrollEmployee) => {
    setEmployeeForm({
      name: emp.name,
      role: emp.role,
      basicSalary: emp.basicSalary,
      allowances: emp.allowances,
      deductions: emp.deductions,
    });
    setEmployeeImageUrl(emp.imageUrl);
    setEmployeeAddressProfile(emp.addressProfile);
    setEditingEmployeeId(emp.id);
    setShowAddEmployee(true);
  };

  const [assets, setAssets] = useState<FixedAsset[]>([
    { id: "AST-82", name: "سيارة نقل البضائع فورد", category: "vehicles", cost: 95000, purchaseDate: "2025-01-10", usefulLifeYears: 5, depreciationRate: 0.20, accumulatedDepreciation: 19000 },
    { id: "AST-83", name: "أجهزة كاشير مع حواسيب الصالة", category: "computers", cost: 12000, purchaseDate: "2025-06-15", usefulLifeYears: 3, depreciationRate: 0.33, accumulatedDepreciation: 4000 }
  ]);
  const [newAsset, setNewAsset] = useState<Partial<FixedAsset>>({ name: "", category: "vehicles", cost: 0, usefulLifeYears: 5, purchaseDate: new Date().toISOString().slice(0, 10) });

  const [budgets, setBudgets] = useState<BudgetItem[]>([
    { category: "رواتب وموظفين", planned: 25000, actual: 23200 },
    { category: "التسويق وعام", planned: 10000, actual: 8200 },
    { category: "الخدمات والمرافق", planned: 3000, actual: 3480 },
    { category: "المناقلات واللوجستيات", planned: 5000, actual: 4800 }
  ]);

  const expenseAccounts = useMemo(() => {
    return accounts.filter(a => a.type === "expenses" || a.code.startsWith("5"));
  }, [accounts]);

  // Aging columns (simulated receivables)
  const agingReceivables = [
    { client: "شركة الميدان للحلول اللوجستية", total: 42000, agingRange: "30_days", unpaidInvoices: "فاتورة #329" },
    { client: "متجر الفريج للتجارة والتوريد", total: 18500, agingRange: "60_days", unpaidInvoices: "فاتورة #334" },
    { client: "سلسلة مطاعم الذواقة السعودية", total: 6400, agingRange: "90_plus_days", unpaidInvoices: "محول معلق #200" }
  ];

  // ----------- TRIGGERS & LOGS -----------
  
  // Submit Expense Transaction & Generate Automatic Double Entry!
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.amount || !newExp.description) return;

    // Map expense category to COA Account Code default fallback
    const expenseCodeMap: Record<string, string> = {
      "رواتب": "5102",
      "إيجار": "5104",
      "تسويق": "5105",
      "شحن": "5106",
      "خدمات": "5107",
      "أخرى": "5108"
    };

    const expAccountCode = newExp.accountCode || expenseCodeMap[newExp.category || "رواتب"] || "5108";

    const formattedExpense: ExpenseTransaction = {
      id: "EXP-" + Math.floor(Math.random() * 900 + 100),
      category: newExp.category || "رواتب",
      amount: Number(newExp.amount),
      date: newExp.date || new Date().toISOString().slice(0, 10),
      description: newExp.description,
      paymentMethod: newExp.paymentMethod as any,
      attachmentName: "receipt_" + Math.floor(Math.random() * 9000) + ".png",
      accountCode: expAccountCode,
      payeeType: newExp.payeeType || "other",
      payeeId: newExp.payeeId || "",
      payeeName: newExp.payeeName || "أخرى / متفرقة"
    };

    setExpenses([...expenses, formattedExpense]);

    const paymentAccountCode = formattedExpense.paymentMethod === "cash" ? "1101" : "1102"; // Cash vs Bank SNB Alrajhi
    
    // Create Auto Double-Entry Post
    const automaticPost: JournalEntry = {
      id: "AUTO-EXP-" + formattedExpense.id.split("-")[1],
      date: formattedExpense.date,
      description: `قيد تلقائي: إثبات دفع مصروف [${formattedExpense.category}] - ${formattedExpense.description} (المستفيد: ${formattedExpense.payeeName})`,
      ref: `مصروف ${formattedExpense.id}`,
      lines: [
        {
          accountCode: expAccountCode,
          accountName: accounts.find(a => a.code === expAccountCode)?.name || formattedExpense.category,
          debit: formattedExpense.amount,
          credit: 0
        },
        {
          accountCode: paymentAccountCode,
          accountName: accounts.find(a => a.code === paymentAccountCode)?.name || "الصندوق/البنك",
          debit: 0,
          credit: formattedExpense.amount
        }
      ],
      isPosted: true // Auto posts instantly
    };

    onAddAutomaticJournal(automaticPost);
    setNewExp({
      category: "رواتب",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      description: "",
      paymentMethod: "cash",
      accountCode: "",
      payeeType: "employee",
      payeeId: "EMP-01",
      payeeName: "أحمد بن عبدالمحسن"
    });
  };

  // Run Payroll Runs & Generate Auto Journal Entry!
  const handleApprovePayroll = (emp: PayrollEmployee) => {
    if (emp.status === "paid") return;

    // Update status
    setEmployees(employees.map(e => e.id === emp.id ? { ...e, status: "paid" } : e));

    const totalSalaryPaid = emp.basicSalary + emp.allowances - emp.deductions;

    // Auto Double-Entry:
    // Debit Basic Salaries Expense (5102) = basicSalary + allowances
    // Credit Cash Bank SNB (1102) = totalSalaryPaid
    // Credit Cash Advances / العهد (1104) = deductions (Advances returned)
    const automaticPost: JournalEntry = {
      id: "AUTO-PAY-" + emp.id.split("-")[1],
      date: new Date().toISOString().slice(0, 10),
      description: `قيد تلقائي: اعتماد مسير رواتب الموظف [${emp.name}] رتبة [${emp.role}]`,
      ref: `مسير كاشير ${emp.id}`,
      lines: [
        {
          accountCode: "5102",
          accountName: accounts.find(a => a.code === "5102")?.name || "الرواتب والأجور الأساسية",
          debit: emp.basicSalary + emp.allowances,
          credit: 0
        },
        {
          accountCode: "1102",
          accountName: accounts.find(a => a.code === "1102")?.name || "حساب البنك الراجحي",
          debit: 0,
          credit: totalSalaryPaid
        },
        emp.deductions > 0 ? {
          accountCode: "1104",
          accountName: accounts.find(a => a.code === "1104")?.name || "العهد النقدية",
          debit: 0,
          credit: emp.deductions
        } : null
      ].filter(Boolean) as any,
      isPosted: true
    };

    onAddAutomaticJournal(automaticPost);
  };

  // Add Fixed Asset with auto-calculated accumulated depr based on Straight Line
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.cost || !newAsset.usefulLifeYears) return;

    const rate = 1 / Number(newAsset.usefulLifeYears);
    const cost = Number(newAsset.cost);
    const addedAsset: FixedAsset = {
      id: "AST-" + Math.floor(Math.random() * 90 + 10),
      name: newAsset.name,
      category: newAsset.category as any,
      cost,
      purchaseDate: newAsset.purchaseDate || new Date().toISOString().slice(0, 10),
      usefulLifeYears: Number(newAsset.usefulLifeYears),
      depreciationRate: Number(rate.toFixed(3)),
      accumulatedDepreciation: 0 // fresh asset
    };

    setAssets([...assets, addedAsset]);

    // Debit Fixed Asset category account (e.g. 1201 السيارات والمعدات)
    // Credit Bank SNB/Alrajhi (1102)
    const assetAccount = addedAsset.category === "vehicles" ? "1201" : "1202";
    const automaticPost: JournalEntry = {
      id: "AUTO-AST-" + addedAsset.id.split("-")[1],
      date: addedAsset.purchaseDate,
      description: `قيد تلقائي: اقتناء وشراء أصل ثابت جديد [${addedAsset.name}]`,
      ref: `أصل ${addedAsset.id}`,
      lines: [
        {
          accountCode: assetAccount,
          accountName: accounts.find(a => a.code === assetAccount)?.name || "الأصول والسيارات",
          debit: addedAsset.cost,
          credit: 0
        },
        {
          accountCode: "1102",
          accountName: accounts.find(a => a.code === "1102")?.name || "حساب البنك الراجحي",
          debit: 0,
          credit: addedAsset.cost
        }
      ],
      isPosted: true
    };

    onAddAutomaticJournal(automaticPost);
    setNewAsset({ name: "", category: "vehicles", cost: 0, usefulLifeYears: 5, purchaseDate: new Date().toISOString().slice(0, 10) });
  };

  // Manual Trigger for Annual Depreciation Post
  const handleDepreciateAsset = (asset: FixedAsset) => {
    const annualDepreciationValue = Math.round(asset.cost * asset.depreciationRate);
    if (asset.accumulatedDepreciation + annualDepreciationValue > asset.cost) return;

    // Update locally
    setAssets(assets.map(a => a.id === asset.id ? { ...a, accumulatedDepreciation: a.accumulatedDepreciation + annualDepreciationValue } : a));

    // Double entry posting:
    // Debit Depreciation Expense (5108) = values
    // Credit Accumulated Depreciation Reserve (2102) = values
    const automaticPost: JournalEntry = {
      id: "AUTO-DEP-" + asset.id.split("-")[1],
      date: new Date().toISOString().slice(0, 10),
      description: `قيد تلقائي: تسجيل قسط الإهلاك السنوي للأصل الثابت [${asset.name}] بمعدل ${(asset.depreciationRate * 100).toFixed(0)}%`,
      ref: `إهلاك ${asset.id}`,
      lines: [
        {
          accountCode: "5108",
          accountName: accounts.find(a => a.code === "5108")?.name || "مصاريف الإهلاك والاتصالات",
          debit: annualDepreciationValue,
          credit: 0
        },
        {
          accountCode: "2102",
          accountName: accounts.find(a => a.code === "2102")?.name || "مجمع إهلاك الأصول الثابتة",
          debit: 0,
          credit: annualDepreciationValue
        }
      ],
      isPosted: true
    };

    onAddAutomaticJournal(automaticPost);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Sub tabs configuration */}
      <div className="flex flex-wrap gap-1 border-b pb-2" style={{ borderColor: theme.border }}>
        {(["expenses", "payroll", "fixed_assets", "zakat_tax", "budgets", "aging_ar_ap"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubTab === tab ? 'bg-indigo-500/10 text-indigo-400 font-extrabold' : 'text-gray-400 hover:bg-slate-500/5'}`}
          >
            {tab === "expenses" && "💸 سجل المصروفات ومرفقاتها"}
            {tab === "payroll" && "🤵 مسير رواتب الموظفين"}
            {tab === "fixed_assets" && "🚚 الأصول الثابتة والإهلاك"}
            {tab === "zakat_tax" && "🕌 الزكاة والضرائب"}
            {tab === "budgets" && "📊 مقارنة الموازنات المستهدفة"}
            {tab === "aging_ar_ap" && "📜 كشف الذمم والمديونيات"}
          </button>
        ))}
      </div>

      {activeSubTab === "expenses" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            {/* 1. Category */}
            <div className="space-y-1 md:col-span-3 col-span-1">
              <span className="text-[10px] block text-gray-400">تصنيف المصروف:</span>
              <select
                value={newExp.category}
                onChange={e => {
                  const cat = e.target.value;
                  let pType: 'employee' | 'supplier' | 'customer' | 'branch' | 'other' = 'other';
                  let pId = "";
                  let pName = "";
                  
                  if (cat === "رواتب") {
                    pType = 'employee';
                    pId = employees[0]?.id || "";
                    pName = employees[0]?.name || "";
                  } else if (cat === "إيجار") {
                    pType = 'supplier';
                    pName = "الشركة الوطنية العقارية";
                  } else if (cat === "تسويق") {
                    pType = 'other';
                    pName = "منصة سنابشات وجوجل العالمية";
                  } else if (cat === "شحن") {
                    pType = 'supplier';
                    pId = suppliers[0]?.id || "";
                    pName = suppliers[0]?.company || suppliers[0]?.name || "شركة شحن وسامي اللوجستية";
                  } else if (cat === "خدمات") {
                    pType = "other";
                    pName = "شركة الخدمات الوطنية";
                  }
                  
                  setNewExp({
                    ...newExp,
                    category: cat,
                    payeeType: pType,
                    payeeId: pId,
                    payeeName: pName
                  });
                }}
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="رواتب">رواتب وأجور موظفين</option>
                <option value="إيجار">إيجار المعارض والفرع</option>
                <option value="تسويق">تسويق وإعلانات رقمية</option>
                <option value="شحن">شحن ونقل بضائع</option>
                <option value="خدمات">مرافق كهرباء ومياه وصيانة</option>
                <option value="أخرى">ضيافة ومصاريف نثرية متنوعة</option>
              </select>
            </div>

            {/* 2. Account */}
            <div className="space-y-1 md:col-span-3 col-span-1">
              <span className="text-[10px] block text-gray-400">الحساب المحاسبي المربوط:</span>
              <select
                value={newExp.accountCode}
                onChange={e => setNewExp({ ...newExp, accountCode: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- ربط آلي حسب الصنف --</option>
                {expenseAccounts.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Amount */}
            <div className="space-y-1 md:col-span-3 col-span-1">
              <span className="text-[10px] block text-gray-400">القيمة بالريال (SAR):</span>
              <input
                type="number"
                value={newExp.amount || ""}
                onChange={e => setNewExp({ ...newExp, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 4. Payment Method */}
            <div className="space-y-1 md:col-span-3 col-span-1">
              <span className="text-[10px] block text-gray-400">طريقة الدفع الفاعلة:</span>
              <select
                value={newExp.paymentMethod}
                onChange={e => setNewExp({ ...newExp, paymentMethod: e.target.value as any })}
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="cash">الصندوق النقد (1101)</option>
                <option value="bank">البنك الراجحي الجاري (1102)</option>
              </select>
            </div>

            {/* 5. Payee Type */}
            <div className="space-y-1 md:col-span-3 col-span-1">
              <span className="text-[10px] block text-gray-400">نوع المستفيد (جهة الصرف):</span>
              <select
                value={newExp.payeeType || "other"}
                onChange={e => {
                  const type = e.target.value as any;
                  let defaultId = "";
                  let defaultName = "";
                  if (type === "employee") {
                    defaultId = employees[0]?.id || "";
                    defaultName = employees[0]?.name || "";
                  } else if (type === "supplier") {
                    defaultId = suppliers[0]?.id || "";
                    defaultName = suppliers[0]?.company || suppliers[0]?.name || "";
                  } else if (type === "customer") {
                    defaultId = customers[0]?.id || "";
                    defaultName = customers[0]?.name || "";
                  } else if (type === "branch") {
                    defaultId = "br_riyadh_main";
                    defaultName = "فرع الرياض الرئيسي";
                  }
                  setNewExp({ ...newExp, payeeType: type, payeeId: defaultId, payeeName: defaultName });
                }}
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="other">جهة أخرى / متفرقة</option>
                <option value="employee">موظف (مسير رواتب) 🤵</option>
                <option value="supplier">مورد (حساب دائن) 🚚</option>
                <option value="customer">عميل مالي 👤</option>
                <option value="branch">فرع تشغيلي 🏢</option>
              </select>
            </div>

            {/* 6. Payee Selector/Input */}
            <div className="space-y-1 md:col-span-3 col-span-1">
              <span className="text-[10px] block text-gray-400">تحديد المستفيد بالأموال:</span>
              {newExp.payeeType === "employee" ? (
                <select
                  value={newExp.payeeId || ""}
                  onChange={e => {
                    const emp = employees.find(emp => emp.id === e.target.value);
                    setNewExp({ ...newExp, payeeId: e.target.value, payeeName: emp?.name || "" });
                  }}
                  className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              ) : newExp.payeeType === "supplier" ? (
                <select
                  value={newExp.payeeId || ""}
                  onChange={e => {
                    const sup = suppliers.find(s => s.id === e.target.value);
                    setNewExp({ ...newExp, payeeId: e.target.value, payeeName: sup?.company || sup?.name || "" });
                  }}
                  className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- اختر المورد --</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.company || sup.name}</option>
                  ))}
                  {suppliers.length === 0 && (
                    <option value="DEFAULT">شركة التوريد وسامي اللوجستية</option>
                  )}
                </select>
              ) : newExp.payeeType === "customer" ? (
                <select
                  value={newExp.payeeId || ""}
                  onChange={e => {
                    const cust = customers.find(c => c.id === e.target.value);
                    setNewExp({ ...newExp, payeeId: e.target.value, payeeName: cust?.name || "" });
                  }}
                  className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- اختر العميل --</option>
                  {customers.map(cust => (
                    <option key={cust.id} value={cust.id}>{cust.name}</option>
                  ))}
                  {customers.length === 0 && (
                    <option value="DEFAULT">عميل مالي عام</option>
                  )}
                </select>
              ) : newExp.payeeType === "branch" ? (
                <select
                  value={newExp.payeeId || "br_riyadh_main"}
                  onChange={e => {
                    const brList = [
                      { id: "br_riyadh_main", name: "فرع الرياض الرئيسي" },
                      { id: "br_jeddah_int", name: "فرع جدة - ردسي مول" },
                      { id: "br_dammam", name: "فرع مجمع مارينا مول" },
                      { id: "br_makkah", name: "فرع العتبيات - مكة المكرمة" }
                    ];
                    const br = brList.find(b => b.id === e.target.value);
                    setNewExp({ ...newExp, payeeId: e.target.value, payeeName: br?.name || "" });
                  }}
                  className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="br_riyadh_main">فرع الرياض الرئيسي</option>
                  <option value="br_jeddah_int">فرع جدة - ردسي مول</option>
                  <option value="br_dammam">فرع مجمع مارينا مول</option>
                  <option value="br_makkah">فرع العتبيات - مكة المكرمة</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={newExp.payeeName || ""}
                  onChange={e => setNewExp({ ...newExp, payeeName: e.target.value })}
                  placeholder="اسم المستلم يدويًا"
                  className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* 7. Description / Statement */}
            <div className="space-y-1 md:col-span-4 col-span-1">
              <span className="text-[10px] block text-gray-400">بيان وصنف الحركة:</span>
              <input
                type="text"
                value={newExp.description}
                onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                placeholder="مثال: فاتورة تسوية الوجبات النثرية"
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 8. Add button */}
            <div className="md:col-span-2">
              <button
                onClick={handleAddExpense}
                className="px-4 py-2.5 w-full text-xs font-black rounded-lg text-black bg-emerald-400 hover:brightness-115 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إثبات وصرف 💾</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-gray-500/5 p-3 rounded-xl border" style={{ borderColor: theme.border }}>
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700/30">
                  <th className="py-2 px-1">كود السند</th>
                  <th className="py-2 px-1">التصنيف</th>
                  <th className="py-2 px-1">المستفيد والجهة المربوطة 👤</th>
                  <th className="py-2 px-1">الحساب المربوط COA</th>
                  <th className="py-2 px-1 text-emerald-400 font-black">القيمة الكلية</th>
                  <th className="py-2 px-1">التاريخ والبيان</th>
                  <th className="py-2 px-1">قنوات المدفوعات</th>
                  <th className="py-2 px-1 text-center font-black">إصدار وإيصال 🧾</th>
                  <th className="py-2 px-1 text-center">حالة الربط</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {expenses.map(exp => {
                  const linkedAccount = accounts.find(a => a.code === exp.accountCode);
                  return (
                    <tr key={exp.id} className="border-b hover:bg-gray-500/5 transition-colors" style={{ borderColor: theme.border }}>
                      <td className="py-2 px-1 font-mono text-indigo-400">{exp.id}</td>
                      <td className="py-2 px-1">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 font-black">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2 px-1">
                        <div className="flex flex-col text-[11px]">
                          <span style={{ color: theme.text }} className="font-black text-slate-200">{exp.payeeName || "أخرى / متفرقة"}</span>
                          <span className="text-[9px] text-indigo-400">
                            {exp.payeeType === 'employee' ? '🤵 موظف رئيسي' :
                             exp.payeeType === 'supplier' ? '🚚 مورد معتمد' :
                             exp.payeeType === 'customer' ? '👤 عميل مالي' :
                             exp.payeeType === 'branch' ? '🏢 فرع تشغيلي' : '📜 جهة خارجية'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-1 font-mono text-[11px] text-gray-300">
                        {exp.accountCode ? (
                          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                            {exp.accountCode} - {linkedAccount?.name || exp.category}
                          </span>
                        ) : (
                          <span className="text-gray-500">منسق تلقائياً</span>
                        )}
                      </td>
                      <td className="py-2 px-1 text-emerald-400 font-mono text-xs">{exp.amount.toLocaleString("ar-SA")} ر.س</td>
                      <td className="py-2 px-1 text-[11px]">
                        <div style={{ color: theme.text }}>{exp.description}</div>
                        <div className="text-[9px]" style={{ color: theme.muted }}>[{exp.date}]</div>
                      </td>
                      <td className="py-2 px-1 text-[10px]">
                        {exp.paymentMethod === "cash" ? "الصرف الصندوق النقدى" : "حوالة بالبنك الراجحي"}
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          onClick={() => setSelectedExpenseForPrint(exp)}
                          className="px-2.5 py-1 text-[10px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold rounded flex items-center gap-1.5 mx-auto cursor-pointer transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة الإيصال 🧾</span>
                        </button>
                      </td>
                      <td className="py-2 px-1 text-center">
                        <span className="px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-500 font-black">
                          مرحل مالي متبادل ⚡
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "payroll" && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-between gap-3 rounded-xl">
            <span>💡 نصيحة ERP: عند النقر على "اعتماد الرواتب وإصدار المسير"، يقوم النظام تلقائياً بإنشاء القيد المزدوج المطابق في الفروع وإرسال إشعار للمصارف</span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingEmployeeId(null);
                  setEmployeeForm({ name: "", role: "أخصائي مبيعات", basicSalary: 4000, allowances: 0, deductions: 0 });
                  setEmployeeImageUrl(undefined);
                  setEmployeeAddressProfile(undefined);
                  setShowAddEmployee(true);
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-black cursor-pointer border-none flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة موظف جديد 👥</span>
              </button>
              <ShieldCheck className="w-5 h-5 shrink-0" />
            </div>
          </div>

          {/* Expanded Slide-over / Modal Form to Add/Edit Employee */}
          {showAddEmployee && (
            <form onSubmit={handleSaveEmployee} className="p-5 rounded-2xl border space-y-4 animate-fade-in text-right cursor-default" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: theme.border }}>
                <span className="text-xs font-black text-white">
                  {editingEmployeeId ? "📝 تعديل بيانات وموقع الموظف" : "👤 تسجيل موظف جديد بسجلات الصرف واللوجستيات"}
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddEmployee(false);
                    setEditingEmployeeId(null);
                  }}
                  className="p-1 hover:bg-slate-800 rounded-full text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Added ImageUploader for Employee */}
              <ImageUploader 
                imageUrl={employeeImageUrl} 
                name={employeeForm.name || "موظف جديد"} 
                onChange={setEmployeeImageUrl} 
                theme={theme} 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-right text-white">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">• الاسم الكامل للموظف:</label>
                  <input 
                    type="text" 
                    required 
                    value={employeeForm.name}
                    onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full rounded-lg p-2 bg-slate-900 border border-gray-700 text-white" 
                    placeholder="مثال: يوسف المقرن"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">• المسمى الوظيفي / الرتبة:</label>
                  <input 
                    type="text" 
                    required 
                    value={employeeForm.role}
                    onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    className="w-full rounded-lg p-2 bg-slate-900 border border-gray-700 text-white" 
                    placeholder="مثال: أخصائي مبيعات كاشير"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-white text-right">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">• الراتب الأساسي (ر.س):</label>
                  <input 
                    type="number" 
                    required 
                    value={employeeForm.basicSalary}
                    onChange={e => setEmployeeForm({ ...employeeForm, basicSalary: Number(e.target.value) })}
                    className="w-full rounded-lg p-2 bg-slate-900 border border-gray-700 text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">• البدلات السكنية والمكافآت (ر.س):</label>
                  <input 
                    type="number" 
                    value={employeeForm.allowances}
                    onChange={e => setEmployeeForm({ ...employeeForm, allowances: Number(e.target.value) })}
                    className="w-full rounded-lg p-2 bg-slate-900 border border-gray-700 text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">• الاستقطاعات والجزاءات التبادلية (ر.س):</label>
                  <input 
                    type="number" 
                    value={employeeForm.deductions}
                    onChange={e => setEmployeeForm({ ...employeeForm, deductions: Number(e.target.value) })}
                    className="w-full rounded-lg p-2 bg-slate-900 border border-gray-700 text-white font-mono" 
                  />
                </div>
              </div>

              {/* Added NationalAddressForm for Employee */}
              <NationalAddressForm 
                initialAddress={employeeAddressProfile} 
                onChange={setEmployeeAddressProfile} 
                theme={theme} 
              />

              <div className="flex gap-2 justify-end pt-3">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black cursor-pointer border-none"
                >
                  💾 حفظ بطاقة الموظف المالي
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employees.map(emp => (
              <div key={emp.id} className="p-4 rounded-xl border space-y-3 relative overflow-hidden text-right flex flex-col justify-between"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2 items-center">
                      {emp.imageUrl ? (
                        <img 
                          src={emp.imageUrl} 
                          alt={emp.name} 
                          referrerPolicy="no-referrer" 
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-xs shrink-0">
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flax-wrap">
                          <h5 className="text-xs font-black" style={{ color: theme.text }}>{emp.name}</h5>
                          {emp.addressProfile?.shortAddress && (
                            <span className="text-[7.5px] font-mono font-black border border-amber-500/20 text-amber-500 bg-amber-500/10 px-1 rounded uppercase tracking-wider shrink-0">
                              {emp.addressProfile.shortAddress}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px]" style={{ color: theme.muted }}>{emp.role} [{emp.id}]</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleEditEmployee(emp)}
                        className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
                        title="تعديل الموظف"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black ${emp.status === "paid" ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {emp.status === "paid" ? "تم الصرف" : "معلق"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold space-y-1 bg-gray-500/5 p-2 rounded">
                    <div className="flex justify-between">
                      <span>الراتب الأساسي:</span>
                      <span>{emp.basicSalary.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <div className="flex justify-between text-emerald-500">
                      <span>البدلات والمكافآت (+):</span>
                      <span>+{emp.allowances.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>الخصومات والجزاءات (-):</span>
                      <span>-{emp.deductions.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-black text-xs" style={{ color: theme.text }}>
                      <span>صافي الراتب المستحق:</span>
                      <span>{(emp.basicSalary + emp.allowances - emp.deductions).toLocaleString("ar-SA")} ر.س</span>
                    </div>
                  </div>

                  {/* Render Employee's National Address Details */}
                  {emp.addressProfile && (
                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900/60 space-y-1 text-right">
                      <div className="flex justify-between items-center text-[8.5px]">
                        <span className="text-gray-400 font-bold">العنوان الوطني المعتمد (SPL)</span>
                        <span className="text-[7px] font-mono text-amber-500 font-bold bg-amber-500/10 px-1 rounded">
                          Verified
                        </span>
                      </div>
                      <p className="text-[9.5px] text-gray-300 leading-normal font-sans">
                        مبنى {emp.addressProfile.buildingNumber}، {emp.addressProfile.streetName}، {emp.addressProfile.district}، {emp.addressProfile.city}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            const formatted = `العنوان الوطني للموظف (${emp.name}): مبنى ${emp.addressProfile?.buildingNumber} ${emp.addressProfile?.streetName}، ${emp.addressProfile?.district}، ${emp.addressProfile?.city}`;
                            navigator.clipboard.writeText(formatted);
                          }}
                          className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[8px] rounded font-bold text-gray-400 hover:text-white transition-colors border-none cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>نسخ العنوان 📋</span>
                        </button>

                        {emp.addressProfile.mapLink && (
                          <a
                            href={emp.addressProfile.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[8px] rounded font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>خريطة 📍</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {emp.status === "pending" && (
                  <button
                    onClick={() => handleApprovePayroll(emp)}
                    className="w-full mt-2 py-1.5 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-black text-xs rounded-lg cursor-pointer"
                  >
                    اعتماد الرواتب وإصدار المسير المالي  💵
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "fixed_assets" && (
        <div className="space-y-4">
          <form onSubmit={handleAddAsset} className="p-4 rounded-xl border grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="space-y-1">
              <span className="text-[10px] block text-gray-400">اسم أو صنف الأصل الثابت:</span>
              <input
                type="text"
                required
                value={newAsset.name}
                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="مثال: رافعة بضائع يابانية"
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] block text-gray-400">التصنيف:</span>
              <select
                value={newAsset.category}
                onChange={e => setNewAsset({ ...newAsset, category: e.target.value as any })}
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white"
              >
                <option value="vehicles">سيارات ووسائل نقل (1201)</option>
                <option value="computers">آلات وأجهزة حوسبة (1202)</option>
                <option value="machinery">معدات ومصانع فاعلة (1201)</option>
                <option value="furniture">أثاث ومكاتب الصالات (1202)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] block text-gray-400">تكلفة الشراء التاريخية:</span>
              <input
                type="number"
                required
                value={newAsset.cost || ""}
                onChange={e => setNewAsset({ ...newAsset, cost: parseFloat(e.target.value) || 0 })}
                placeholder="مثال: 45000"
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] block text-gray-400">العمر الإنتاجي بالسنوات:</span>
              <input
                type="number"
                required
                value={newAsset.usefulLifeYears || ""}
                onChange={e => setNewAsset({ ...newAsset, usefulLifeYears: parseInt(e.target.value) || 5 })}
                placeholder="مثال: 5"
                className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <button
                type="submit"
                className="px-4 py-2 w-full text-xs font-black rounded-lg text-black bg-emerald-400 hover:brightness-110 cursor-pointer text-center"
              >
                إثبات شراء أصل
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map(ast => {
              const bookValue = ast.cost - ast.accumulatedDepreciation;
              return (
                <div key={ast.id} className="p-4 rounded-xl border text-right space-y-3 relative"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: theme.border }}>
                    <div>
                      <h5 className="text-xs font-black" style={{ color: theme.text }}>{ast.name}</h5>
                      <span className="text-[9px] text-indigo-400 font-mono">رمز تسجيل الحصر: {ast.id} [{ast.purchaseDate}]</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] bg-slate-500/10 text-slate-400 font-mono">
                      معدل الإهلاك: {(ast.depreciationRate * 100).toFixed(0)}% سنوي قسط ثابت
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center bg-gray-500/5 p-2 rounded-lg">
                    <div>
                      <span className="text-gray-400 block">التكلفة التاريخية:</span>
                      <span style={{ color: theme.text }}>{ast.cost.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-rose-400">مجمع الإهلاك:</span>
                      <span className="text-rose-400">{ast.accumulatedDepreciation.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-emerald-400 font-black">القيمة الدفترية:</span>
                      <span className="text-emerald-400">{bookValue.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                  </div>

                  {bookValue > 0 && (
                    <button
                      onClick={() => handleDepreciateAsset(ast)}
                      className="w-full py-1 bg-yellow-500 hover:bg-yellow-600 font-black text-[10px] transition-colors rounded text-black cursor-pointer uppercase"
                    >
                      تسجيل قسط الإهلاك السنوي لقسط الدورة الحالية 🔄
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "zakat_tax" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1: Zakat calculation */}
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[11px] font-black text-emerald-400 block border-b pb-1">🕌 احتساب الوعاء والربط الزكوي الشرعي لعام 1447هـ</span>
            <div className="text-xs font-bold space-y-2">
              <p className="text-[10px]" style={{ color: theme.muted }}>
                يتم حساب الزكاة الشرعية للنشاط التجاري بنسبة 2.5% من الأصول المتاحة للزكاة (النقد، بضاعة المعدة للبيع، عهد العملاء مطروحة من الديون قصيرة الاستحقاق).
              </p>
              
              <div className="space-y-1.5 p-3 bg-gray-500/5 rounded-xl text-[11px]">
                <div className="flex justify-between">
                  <span>الأرصدة النقدية والبنكية المقررة للزكاة:</span>
                  <span>54,580 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>قيمة بضاعة المخزون بسعر الجملة للبيع:</span>
                  <span>42,000 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>عهد وذمم العملاء المستحقة سدادها:</span>
                  <span>18,500 ر.س</span>
                </div>
                <div className="flex justify-between text-rose-400 border-b pb-1.5 mb-1.5">
                  <span>ديون الموردين مستحقة الصرف للغير (-):</span>
                  <span>-12,400 ر.س</span>
                </div>
                <div className="flex justify-between font-black text-sky-400">
                  <span>الوعاء الشرعي الخاضع للزكاة:</span>
                  <span>102,680 ر.س</span>
                </div>
                <div className="flex justify-between font-black text-yellow-500 text-xs border-t pt-1.5 mt-1.5">
                  <span>مبلغ الزكاة الواجب إخراجها (2.5%):</span>
                  <span>2,567 ر.س</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-[9px] text-gray-400 bg-slate-900 p-2 rounded">
                <span>تنويه: يتم إعداد وعاء الزكاة تزامناً مع نظام هيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية للاعتمادات.</span>
              </div>
            </div>
          </div>

          {/* Module 2: TAX / VAT Management */}
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[11px] font-black text-rose-400 block border-b pb-1">🧾 ضريبة القيمة المضافة والإقرار الضريبي VAT (15%)</span>
            <div className="text-xs font-bold space-y-2">
              <span className="text-[9px]" style={{ color: theme.muted }}>تطابق المدخلات والمبيعات والمشتريات لحساب العوائد المجمعة</span>

              <div className="space-y-1.5 p-3 bg-gray-500/5 rounded-xl text-[11px]">
                <div className="flex justify-between text-emerald-400">
                  <span>الضريبة المحصلة من المبيعات (Output VAT 15%):</span>
                  <span>+6,240 ر.س</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>الضريبة المدفوعة للمشتريات والمصارف (Input VAT 15%):</span>
                  <span>-1,840 ر.س</span>
                </div>
                <div className="flex justify-between font-black text-indigo-400 border-t pt-1.5 mt-1.5">
                  <span>صافي ضريبة القيمة المضافة المستحقة للدفع:</span>
                  <span>4,400 ر.س</span>
                </div>
              </div>
              
              <button
                onClick={() => alert("تم ربط وإرسال الإقرار الضريبي الافتراضي لبوابة زاتكا بنجاح! 🇸🇦")}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black cursor-pointer transition-colors"
              >
                ربط وتقديم الإقرار الضريبي لبوابة زاتكا (ZATCA) 🇸🇦
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "budgets" && (
        <div className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="border-b pb-2 flex justify-between items-center" style={{ borderColor: theme.border }}>
            <div>
              <h4 className="text-xs font-black" style={{ color: theme.text }}>مقارنة الموازنات المستهدفة (Planning vs Actual)</h4>
              <p className="text-[9px]" style={{ color: theme.muted }}>مراقبة الانحراف والتجاوز المالي لتفادي النزيف المالي</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3">
            {budgets.map((bud, i) => {
              const ratio = Math.min((bud.actual / bud.planned) * 100, 100);
              const isOver = bud.actual > bud.planned;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span style={{ color: theme.text }}>{bud.category}</span>
                    <span className="font-mono text-gray-400">
                      الفعلي: {bud.actual.toLocaleString("ar-SA")} ريال / المخطط: {bud.planned.toLocaleString("ar-SA")} ريال
                    </span>
                  </div>
                  {/* Visual tracker bar */}
                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden relative border border-gray-700/30">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${ratio}%`,
                        backgroundColor: isOver ? "#EF4444" : "#10B981"
                      }}
                    />
                  </div>
                  {isOver && (
                    <span className="text-[9px] text-red-400 font-bold block">⚠️ تنبيه: تجاوز نسبة المصروف المخطط بمقدار {(bud.actual - bud.planned).toLocaleString("ar-SA")} ر.س!</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "aging_ar_ap" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AR Accounts */}
          <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[11px] font-black text-emerald-400 block border-b pb-1">ذمم المدائن والديون المدينة المستحقة (AR)</span>
            <div className="space-y-2">
              {agingReceivables.map((ar, i) => (
                <div key={i} className="p-3 bg-gray-500/5 rounded-xl text-xs font-bold space-y-1 border border-gray-700/20">
                  <div className="flex justify-between">
                    <span style={{ color: theme.text }}>{ar.client}</span>
                    <span className="text-emerald-400 font-mono">{ar.total.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span>المدفوعات المتأخرة مرجعاً: {ar.unpaidInvoices}</span>
                    <span className={`px-2 py-0.5 rounded ${ar.agingRange === '30_days' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                      {ar.agingRange === '30_days' && "متأخر 30 يوم"}
                      {ar.agingRange === '60_days' && "متأخر 60 يوم ⚠️"}
                      {ar.agingRange === '90_plus_days' && "حرج جداً +90 يوم 🚨"}
                    </span>
                  </div>
                  <div className="pt-2 border-t mt-1 border-gray-700/30 flex gap-2 justify-end">
                    <button
                      onClick={() => alert(`تم إرسال تنبيه SMS آلي بمطالبة السداد للعميل ${ar.client}`)}
                      className="px-2 py-1 text-[9px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>تنبيه آلي بالهاتف 📱</span>
                    </button>
                    <button
                      onClick={() => alert(`تم توليد مطالبة سداد PDF رسمية وإرسالها بريداً للعميل ${ar.client}`)}
                      className="px-2 py-1 text-[9px] bg-slate-500/20 hover:bg-slate-500/30 text-white rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>إرسال بريد 📧</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[11px] font-black text-rose-400 block border-b pb-1">ذمم الموردين والدائنين (Accounts Payable AP)</span>
            <div className="space-y-2">
              <div className="p-3 bg-gray-500/5 rounded-xl text-xs font-bold space-y-1.5 border border-gray-700/20">
                <div className="flex justify-between">
                  <span style={{ color: theme.text }}>شركة الخليج للتوريد واللوجستيات</span>
                  <span className="text-rose-400 font-mono">18,400 ر.س</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>تاريخ استحقاق المطالبة: 2026-06-15</span>
                  <span className="text-yellow-500 font-mono">يستحق قريباً</span>
                </div>
              </div>
              <div className="p-3 bg-gray-500/5 rounded-xl text-xs font-bold space-y-1.5 border border-gray-700/20">
                <div className="flex justify-between">
                  <span style={{ color: theme.text }}>مستودعات الرياض المركزية للسلع</span>
                  <span className="text-rose-400 font-mono">34,000 ر.س</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>تاريخ استحقاق المطالبة: 2026-06-28</span>
                  <span className="text-gray-400">آمن</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedExpenseForPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none text-right">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header control */}
            <div className="bg-slate-905 text-white px-5 py-3.5 flex justify-between items-center" style={{ backgroundColor: '#0f172a' }}>
              <span className="text-xs font-black">سند صرف مصاريف رسمي (Commercial Expense Cash Voucher)</span>
              <button
                onClick={() => setSelectedExpenseForPrint(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-bold bg-transparent border-0"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Voucher printable body */}
            <div id="arabic-expense-voucher" className="p-8 bg-white space-y-6 flex-1 text-slate-800">
              {/* Top Banner */}
              <div className="flex justify-between items-start border-b-2 border-slate-950 pb-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-black text-slate-950">مؤسسة سهم للتقنيات والاتصالات الذكية</h2>
                  <p className="text-[10px] text-gray-500 font-bold">المملكة العربية السعودية | الرقم الضريبي: 300482910400003</p>
                  <p className="text-[10px] text-gray-500 font-bold">هاتف: 920042781 | الرياض - طريق الملك فهد</p>
                </div>
                <div className="text-left space-y-1">
                  <h3 className="text-xs font-black text-slate-800">سند صرف مصاريف تشغيلية</h3>
                  <div className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    رقم السند: {selectedExpenseForPrint.id}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    التاريخ: {selectedExpenseForPrint.date}
                  </div>
                </div>
              </div>

              {/* Main Matrix Box */}
              <div className="border border-slate-950 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-950 text-xs font-black p-3 text-center">
                  <div className="col-span-2">البيان والعملية التفصيلية</div>
                  <div>طريقة الدفع</div>
                  <div>القيمة الكلية</div>
                </div>
                <div className="grid grid-cols-4 text-xs font-black p-4 text-center items-center">
                  <div className="col-span-2 text-right pr-2 text-slate-800 font-medium font-bold">
                    {selectedExpenseForPrint.description}
                  </div>
                  <div className="text-slate-600 font-bold">
                    {selectedExpenseForPrint.paymentMethod === "cash" ? "من نقدية الصندوق" : "تحويل بنكي مباشر (الراجحي)"}
                  </div>
                  <div className="text-slate-950 font-mono text-base font-black text-emerald-600 text-center">
                    {selectedExpenseForPrint.amount.toLocaleString("ar-SA")} ر.س
                  </div>
                </div>
              </div>

              {/* Beneficiary Details Box */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex justify-between items-center text-xs font-bold text-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">صرف لصالح / المقبوض لأمر (Paid To):</span>
                    <span className="text-slate-900 font-extrabold text-sm">{selectedExpenseForPrint.payeeName || "أخرى / متفرقة"}</span>
                  </div>
                </div>
                {selectedExpenseForPrint.payeeType && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-950 text-emerald-400 font-extrabold">
                    {selectedExpenseForPrint.payeeType === 'employee' ? '🤵 موظف رئيسي بموجب مسير' :
                     selectedExpenseForPrint.payeeType === 'supplier' ? '🚚 مورد معتمد بسجل COA' :
                     selectedExpenseForPrint.payeeType === 'customer' ? '👤 عميل معتمد بالدفعات' :
                     selectedExpenseForPrint.payeeType === 'branch' ? '🏢 فرع تشغيلي داخلي' : '📜 جهة تشغيلية متنوعة'}
                  </span>
                )}
              </div>

              {/* Accounting details Box */}
              <div className="bg-amber-50/45 border border-amber-900/10 rounded-xl p-4 space-y-2 text-xs font-bold text-slate-700">
                <h4 className="text-[10px] text-slate-400 font-black">تفاصيل الترحيل المزدوج في شجرة الحسابات (COA Double Entry):</h4>
                <div className="flex justify-between">
                  <span>من حساب (مدين - المصروف المرتبط):</span>
                  <span className="text-indigo-600">{selectedExpenseForPrint.accountCode || "5108"} - {accounts.find(a => a.code === (selectedExpenseForPrint.accountCode || "5108"))?.name || selectedExpenseForPrint.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>إلى حساب (دائن - وسيلة الدفع):</span>
                  <span className="text-emerald-600">{selectedExpenseForPrint.paymentMethod === "cash" ? "1101 - الصندوق المالي" : "1102 - البنك الجاري الرئيسي"}</span>
                </div>
              </div>

              {/* Signatures Area */}
              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs font-black">
                <div className="space-y-4">
                  <span className="text-slate-400 block font-bold border-b pb-1">توقيع محاسب الصرف:</span>
                  <div className="h-6 flex items-center justify-center">
                    <span className="font-mono text-[10px] italic text-slate-400">أحمد بن عبدالمحسن</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-slate-400 block font-bold border-b pb-1">توقيع المدير المالي للشركة:</span>
                  <div className="h-6 flex items-center justify-center">
                    <span className="font-mono text-[10px] italic text-slate-400">سهم للأجنحة الحسابية</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-slate-400 block font-bold border-b pb-1">اسم وتوقيع المستلم للدفعة:</span>
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-[11px] text-slate-900 font-black">{selectedExpenseForPrint.payeeName || "........................"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panel Actions */}
            <div className="bg-slate-50 border-t p-4 flex justify-between">
              <span className="text-[10px] text-gray-400 font-bold self-center">هذا السند مرحّل محاسبياً تلقائياً بموافقة نظام سهم ERP الأكاديمي</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const printContents = document.getElementById("arabic-expense-voucher")?.innerHTML;
                    if (printContents) {
                      const printW = window.open("", "_blank");
                      if (printW) {
                        printW.document.write(`
                          <html dir="rtl" lang="ar">
                            <head>
                              <title>سند صرف مصاريف - سهم ERP</title>
                              <meta charset="utf-8" />
                              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" />
                              <style>
                                body { font-family: 'Cairo', sans-serif; padding: 40px; background: white; color: black; line-height: 1.6; }
                                .border-slate-950 { border: 2px solid black !important; }
                                .bg-slate-100 { background-color: #f1f5f9 !important; }
                                .text-emerald-600 { color: #10b981 !important; }
                                .text-xs { font-size: 13px !important; }
                                .text-sm { font-size: 15px !important; }
                                .font-mono { font-family: monospace !important; }
                                .grid { display: flex; justify-content: space-between; }
                                .grid-cols-4 > div { width: 25%; text-align: center; }
                                .grid-cols-3 > div { width: 33%; text-align: center; }
                                .border-b-2 { border-bottom: 2px solid black; }
                                .p-4 { padding: 16px; }
                                .p-8 { padding: 32px; }
                                .rounded-xl { border-radius: 12px; }
                                .text-indigo-600 { color: #4f46e5; }
                                @media print {
                                  body { padding: 0; }
                                }
                              </style>
                            </head>
                            <body onload="window.print(); window.close();">
                              ${printContents}
                            </body>
                          </html>
                        `);
                        printW.document.close();
                      } else {
                        window.print();
                      }
                    }
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة من صالة الكاشير / حراري 🖨️</span>
                </button>
                <button
                  onClick={() => setSelectedExpenseForPrint(null)}
                  className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg text-xs font-black cursor-pointer border-0"
                >
                  إلغاء وإغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
