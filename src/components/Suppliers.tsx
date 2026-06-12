import React, { useState } from "react";
import { Supplier, Invoice, ThemeColors, AddressProfile } from "../types";
import { 
  Plus, Search, Phone, Building, DollarSign, Trash2, 
  Truck, ArrowUpRight, ArrowDownLeft, CheckCircle, AlertTriangle, FileText, X, Zap, MapPin, Copy
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import ImageUploader from "./ImageUploader";
import NationalAddressForm from "./NationalAddressForm";
import ProfileAvatar from "./ProfileAvatar";
import AddressCard from "./AddressCard";

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: (sup: Supplier[]) => void;
  invoices: Invoice[];
  theme: ThemeColors;
  openUnifiedActions?: (type: string, data: any) => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
}

export default function Suppliers({ suppliers, setSuppliers, invoices, theme, openUnifiedActions, triggerNotification = () => {}, addAuditLog = () => {} }: SuppliersProps) {
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'has_balance' | 'zero' | 'prepaid'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [addressProfile, setAddressProfile] = useState<AddressProfile | undefined>(undefined);

  // Find current supplier in the list dynamically to remain fully reactive to external changes
  const activeSupplier = selectedSupplier
    ? suppliers.find(s => s.id === selectedSupplier.id) || selectedSupplier
    : null;

  // Record Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: "",
    balance: ""
  });

  // Filter list
  const list = suppliers
    .filter(s => {
      if (balanceFilter === 'has_balance') return s.balance > 0;
      if (balanceFilter === 'zero') return s.balance === 0;
      if (balanceFilter === 'prepaid') return s.balance < 0;
      return true;
    })
    .filter(s => 
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.company || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.phone || "").includes(searchTerm)
    );

  const formatMoney = (n: number) => {
    return Math.abs(n ?? 0).toLocaleString("ar-SA") + " ر.س";
  };

  const exportColumns = [
    { key: "id", label: "مُعرّف المورد" },
    { key: "name", label: "اسم المورد" },
    { key: "company", label: "الشركة / المؤسسة" },
    { key: "phone", label: "رقم الجوال" },
    { key: "balance", label: "المستحقات المتبقية / الرصيد", format: (v: number) => {
        if (v > 0) return `مطلوب سداد له: ${formatMoney(v)}`;
        if (v < 0) return `رصيد مسبق الدفع لنا: ${formatMoney(Math.abs(v))}`;
        return "مصفّر";
      }
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(list, exportColumns, "دليل_الموردين_" + new Date().toISOString().slice(0, 10));
  };

  const handleExportPDF = () => {
    exportToPDF("تقرير دليل حسابات الموردين 👥", exportColumns, list, "سجل الديون والمستحقات والشركات الموردة للمتجر");
  };

  const genId = () => `sup-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  function saveSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("اسم المورد مطلوب.");
      return;
    }

    const balNum = parseFloat(form.balance) || 0;

    const newSupplier: Supplier = {
      id: genId(),
      name: form.name.trim(),
      phone: form.phone.trim() || "غير مسجل",
      company: form.company.trim() || "جهة مستقلة",
      balance: balNum,
      imageUrl: imageUrl,
      addressProfile: addressProfile
    };

    setSuppliers([...suppliers, newSupplier]);
    setShowNew(false);
    setImageUrl(undefined);
    setAddressProfile(undefined);
    
    setForm({
      name: "",
      phone: "",
      company: "",
      balance: ""
    });
  }

  function deleteSupplier(supId: string) {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟ سيتم حذفه من دليل الموردين ولكن فواتيره السابقة ستبقى مسجلة باسمه في الأرشيف.")) {
      setSuppliers(suppliers.filter(s => s.id !== supId));
      if (selectedSupplier?.id === supId) {
        setSelectedSupplier(null);
      }
    }
  }

  // Handle recording a cash payout to a supplier (reduces the outstanding balance we owe them)
  function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSupplier) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) {
      alert("الرجاء إدخال مبلغ دفع صالح.");
      return;
    }

    // Update state
    const updatedSuppliers = suppliers.map(s => {
      if (s.id === activeSupplier.id) {
        const nextBalance = s.balance - amount;
        return {
          ...s,
          balance: nextBalance
        };
      }
      return s;
    });

    setSuppliers(updatedSuppliers);
    
    // Also update selected supplier view details
    setSelectedSupplier({
      ...activeSupplier,
      balance: activeSupplier.balance - amount
    });

    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentNote("");

    alert(`تم تسديد دفعة مالية بقيمة ${amount} ر.س للمورد: ${activeSupplier.name} بنجاح وقيدها في السجلات.`);
  }

  return (
    <div className="space-y-6">
      {/* Header tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: theme.text }}>إدارة الموردين والجهات الموردة 🚛</h2>
          <p className="text-xs mt-1" style={{ color: theme.muted }}>
            متابعة حسابات الموردين، رصد دفعات التوريد، والتحقق المستمر لمدفوعات فواتير المشتريات المعلقة
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-extrabold text-sm self-start sm:self-auto cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-black/10 text-[#000]"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div>
            <span className="text-[10px] block" style={{ color: theme.muted }}>إجمالي الموردين</span>
            <span className="text-xl font-black font-mono mt-0.5" style={{ color: theme.text }}>{suppliers.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div>
            <span className="text-[10px] block" style={{ color: theme.muted }}>المستحقات المعلقة علينا للموردين</span>
            <span className="text-xl font-black font-mono mt-0.5 text-red-500">
              {suppliers.filter(s => s.balance > 0).reduce((sum, s) => sum + s.balance, 0).toLocaleString("ar-SA")} ر.س
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div>
            <span className="text-[10px] block" style={{ color: theme.muted }}>إجمالي دفعات المشتريات المستوردة</span>
            <span className="text-xl font-black font-mono mt-0.5 text-emerald-500 font-bold">
              {invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.total, 0).toLocaleString("ar-SA")} ر.س
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {(['all', 'has_balance', 'zero', 'prepaid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setBalanceFilter(f)}
              className="text-xs py-2 px-4 rounded-lg font-bold cursor-pointer transition-all shrink-0"
              style={{
                backgroundColor: balanceFilter === f ? theme.accent : theme.surface,
                color: balanceFilter === f ? '#000' : theme.muted,
                border: `1px solid ${balanceFilter === f ? theme.accent : theme.border}`
              }}
            >
              {f === 'all' ? 'جميع الموردين' : f === 'has_balance' ? 'له مستحقات معلقة' : f === 'zero' ? 'حسابات مصفّرة' : 'مدفوع له مقدمًا'}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="البحث باسم المورد، الشركة، أو رقم الجوال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg py-2.5 pl-4 pr-9 border outline-none text-right"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          />
          <Search className="absolute right-3 top-3 w-4 h-4" style={{ color: theme.muted }} />
        </div>
      </div>

      {/* شريط أدوات تصدير حسابات الموردين */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: theme.text }}>تصدير دليل حسابات الموردين الحالي ({list.length} مورد):</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: `${theme.surface}`, border: `1px solid ${theme.border}`, color: theme.text }}
          >
            <span>PDF 📄</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: theme.accent, color: "#000" }}
          >
            <span>Excel 📊</span>
          </button>
        </div>
      </div>

      {/* Main Grid View split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List Card */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black px-1" style={{ color: theme.muted }}>دليل الموردين النشطين ({list.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((sup) => {
              const outstanding = sup.balance > 0;
              const prepaid = sup.balance < 0;
              
              // Count linked invoices of type 'purchase'
              const linkedInvoices = invoices.filter(i => i.type === 'purchase' && i.customer.toLowerCase().trim() === sup.name.toLowerCase().trim());
              const totalPurchased = linkedInvoices.reduce((sum, inv) => sum + inv.total, 0);

              return (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplier(sup)}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-md cursor-pointer relative overflow-hidden ${activeSupplier?.id === sup.id ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''}`}
                  style={{ 
                    backgroundColor: theme.card, 
                    borderColor: activeSupplier?.id === sup.id ? theme.accent : theme.border,
                  }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex gap-3 items-center mb-4 border-b pb-3" style={{ borderColor: theme.border }}>
                      {sup.imageUrl ? (
                        <img 
                          src={sup.imageUrl} 
                          alt={sup.name} 
                          referrerPolicy="no-referrer" 
                          className="w-10 h-10 rounded-full object-cover border border-slate-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0"
                          style={{ 
                            backgroundColor: outstanding ? "rgba(239, 68, 68, 0.15)" : prepaid ? "rgba(16, 185, 129, 0.15)" : theme.muted + "15", 
                            color: outstanding ? "#EF4444" : prepaid ? "#10B981" : theme.muted 
                          }}
                        >
                          <span>{sup.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black truncate" style={{ color: theme.text }}>{sup.name}</h4>
                          {sup.addressProfile?.shortAddress && (
                            <span className="text-[8.5px] font-mono font-black border border-amber-500/20 text-amber-550 bg-amber-500/10 px-1 rounded uppercase tracking-wider">
                              {sup.addressProfile.shortAddress}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] truncate mt-0.5 flex items-center gap-1" style={{ color: theme.muted }}>
                          <Building className="w-3 h-3 shrink-0" /> {sup.company}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px] mb-4">
                      <div className="flex justify-between">
                        <span style={{ color: theme.muted }}>رقم الهاتف / الجوال:</span>
                        <span className="font-mono font-bold" style={{ color: theme.text }}>{sup.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.muted }}>الفواتير المربوطة:</span>
                        <span className="font-bold text-gray-300" style={{ color: theme.text }}>{linkedInvoices.length} فواتير</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.muted }}>حجم المشتريات كلياً:</span>
                        <span className="font-bold text-gray-300 font-mono" style={{ color: theme.text }}>{totalPurchased.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance ledger indicators */}
                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: theme.border }}>
                    <div>
                      <span className="text-[9px] block mb-0.5" style={{ color: theme.muted }}>حساب المورد المتبقي</span>
                      <span className={`text-xs font-mono font-black ${outstanding ? 'text-red-500' : prepaid ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {outstanding ? "مطلوب له: " : prepaid ? "دائن له (مدفوع سابقاً): " : "مسوى بالتكامل: "} 
                        {formatMoney(sup.balance)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUnifiedActions && openUnifiedActions("supplier", sup);
                        }}
                        className="p-1.5 rounded hover:bg-amber-500/10 text-amber-500 transition-colors cursor-pointer"
                        title="إجراءات سهم ⚡"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSupplier(sup.id);
                        }}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"
                        title="حذف المورد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="py-16 text-center rounded-2xl border border-dashed"
              style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.muted }}>
              لا يوجد موردون يطابقون تصفية البحث الحالية. يمكنك إضافة واحد جديد كلياً.
            </div>
          )}
        </div>

        {/* Highlighted Selected Supplier card - Detailed Invoice history log */}
        <div className="lg:col-span-1">
          {activeSupplier ? (
            <div className="rounded-2xl border p-5 space-y-5 sticky top-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-3">
                  <ProfileAvatar 
                    name={activeSupplier.name} 
                    imageUrl={activeSupplier.imageUrl} 
                    size="md" 
                    theme={theme}
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold" style={{ color: theme.accent }}>تفاصيل وسجلات المورد</span>
                    <h3 className="text-sm font-black mt-0.5" style={{ color: theme.text }}>{activeSupplier.name}</h3>
                    <p className="text-[10px]" style={{ color: theme.muted }}>شركة: {activeSupplier.company}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSupplier(null)}
                  className="p-1 rounded-full hover:bg-gray-500/10 text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* National Address Verification Render inside active supplier panel */}
              {activeSupplier.addressProfile && (
                <div className="animate-fade-in font-sans">
                  <AddressCard
                    address={activeSupplier.addressProfile}
                    theme={theme}
                    title="العنوان الوطني المعتمد للمورد (SPL)"
                    onCopySuccess={(msg) => triggerNotification && triggerNotification(msg)}
                  />
                </div>
              )}

              {/* Outstanding dues overview */}
              <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: theme.surface }}>
                <div>
                  <span className="text-[10px] block" style={{ color: theme.muted }}>الرصيد المستحق</span>
                  <span className={`text-sm font-black font-mono mt-0.5 block ${activeSupplier.balance > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                    {activeSupplier.balance > 0 ? `له مستحقات بذمتنا: ` : `دفعات مقدمة له: `}
                    {formatMoney(activeSupplier.balance)}
                  </span>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors cursor-pointer select-none"
                >
                  تسجيل سداد مالي 💸
                </button>
              </div>

              {/* Linked Purchase Invoices lists */}
              <div className="space-y-3">
                <span className="text-[10px] font-black block" style={{ color: theme.muted }}>الربط التلقائي لفواتير المشتريات:</span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {invoices
                    .filter(i => i.type === 'purchase' && i.customer.toLowerCase().trim() === activeSupplier.name.toLowerCase().trim())
                    .map((inv) => (
                      <div 
                        key={inv.id} 
                        className="p-3 rounded-lg border text-xs flex justify-between items-center transition-colors hover:brightness-110"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                          <div>
                            <span className="font-mono font-black block" style={{ color: theme.text }}>{inv.id}</span>
                            <span className="text-[9px]" style={{ color: theme.muted }}>{inv.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold block" style={{ color: theme.text }}>
                            {inv.total.toLocaleString("ar-SA")} ر.س
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${inv.status === 'مدفوع' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}

                  {invoices.filter(i => i.type === 'purchase' && i.customer.toLowerCase().trim() === activeSupplier.name.toLowerCase().trim()).length === 0 && (
                    <p className="text-[10px] text-center py-6" style={{ color: theme.muted }}>
                      لا توجد فواتير مشتريات مربوطة بهذا المورد بعد. عند إصدار أي فاتورة شراء باسم هذا المورد، سيتم ربطها تلقائياً بالقسم المالي هنا وتحديث رصيده.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-center"
              style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.muted }}>
              <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black" style={{ color: theme.text }}>حدد مورداً لاستعراض البيانات المتقدمة</h4>
              <p className="text-[11px] mt-1">
                اضغط على أي مورد في القائمة لعرض تاريخ المشتريات المترتبة وتعديل الحسابات وتسجيل دفعات السداد المستلمة.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over create supplier form */}
      {showNew && (
        <div className="fixed inset-0 bg-black/75 flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-xl overflow-y-auto h-full p-6 shadow-2xl flex flex-col border-l cursor-default"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: theme.border }}>
                <div>
                  <h3 className="text-sm font-black" style={{ color: theme.text }}>إدراج مورد جديد بجهات التوريد 🚛</h3>
                  <p className="text-[10px] mt-1" style={{ color: theme.muted }}>تعبئة بيانات الشركة، صورتها، وعنوانها الوطني للتكامل والربط الذكي</p>
                </div>
                <button 
                  onClick={() => {
                    setShowNew(false);
                    setImageUrl(undefined);
                    setAddressProfile(undefined);
                  }} 
                  className="p-2 rounded-full hover:bg-red-500/10 text-red-500 cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveSupplier} className="space-y-5 text-xs font-bold text-right">
                
                {/* Reusable Image uploader */}
                <ImageUploader 
                  imageUrl={imageUrl} 
                  name={form.name || form.company || "مورد جديد"} 
                  onChange={setImageUrl} 
                  theme={theme} 
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>• الاسم الكامل للمورد / جهة الاتصال</label>
                    <input
                      type="text"
                      placeholder="مثال: صالح الودعاني..."
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg py-2.5 px-3 border outline-none text-right"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>• اسم الشركة / المصنع المورد</label>
                    <input
                      type="text"
                      placeholder="مثال: مصنع الزجاج المحدودة..."
                      value={form.company}
                      onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full rounded-lg py-2.5 px-3 border outline-none text-right"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>• رقم الهاتف / الجوال</label>
                    <input
                      type="tel"
                      placeholder="مثال: +966501234567..."
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-lg py-2.5 px-3 border outline-none text-right font-mono"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>
                      • الرصيد الابتدائي المستحق (له بذمتنا ر.س)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.balance}
                      onChange={(e) => setForm(f => ({ ...f, balance: e.target.value }))}
                      className="w-full rounded-lg py-2.5 px-3 border outline-none text-right font-mono text-xs"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                </div>

                {/* Refactored NationalAddressForm */}
                <NationalAddressForm 
                  initialAddress={addressProfile} 
                  onChange={setAddressProfile} 
                  theme={theme} 
                />

                <span className="text-[9px] font-normal block text-gray-500">
                  سيتم تخزين تفاصيل العنوان الوطني لموردين سهم OS لتوفير إمكانية تتبع مسار سلاسل التوريد وتخطيط المهل اللوجستية لكل شحنة.
                </span>

                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: theme.border }}>
                  <button
                    type="submit"
                    className="flex-grow py-3 px-4 rounded-xl font-bold cursor-pointer text-[#000]"
                    style={{ backgroundColor: theme.accent }}
                  >
                    حفظ وإضافة المورد ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNew(false);
                      setImageUrl(undefined);
                      setAddressProfile(undefined);
                    }}
                    className="flex-grow py-3 px-4 rounded-xl border text-center cursor-pointer transition-colors"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.muted }}
                  >
                    إلغاء الأمر
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Payout / Payment dialog Modal */}
      {showPaymentModal && activeSupplier && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 relative space-y-4 border"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
              <h4 className="text-xs font-black" style={{ color: theme.text }}>تسجيل تسديد مالي للمورد 💸</h4>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded-full hover:bg-gray-500/10 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px]" style={{ color: theme.muted }}>
              سيتم إنقاص المبلغ المسدد من كامل حساب المورد المستحق لدى المتجر.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>اسم المورد</label>
                <input
                  type="text"
                  value={activeSupplier.name}
                  disabled
                  className="w-full rounded-lg py-2 px-3 border outline-none text-right opacity-60"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <div>
                <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>المبلغ المدفوع كاش (ر.س)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-lg py-2.5 px-3 border outline-none text-right font-mono"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  required
                  min="0.1"
                  step="any"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] mb-1.5" style={{ color: theme.muted }}>ملاحظة المستند أو التحويل (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: تحويل بنكي لمصرف الراجحي..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full rounded-lg py-2 px-3 border outline-none text-right"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer hover:bg-gray-500/10"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold cursor-pointer text-[#000]"
                  style={{ backgroundColor: theme.accent }}
                >
                  تأكيد سداد المبلغ للذمم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
