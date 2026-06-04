import React, { useState } from "react";
import { Customer, ThemeColors, AddressProfile } from "../types";
import { Plus, Search, User, Phone, MapPin, DollarSign, ListFilter, Trash2, Zap, Copy } from "lucide-react";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import NationalAddressForm from "./NationalAddressForm";
import ImageUploader from "./ImageUploader";

interface CustomersProps {
  customers: Customer[];
  setCustomers: (cust: Customer[]) => void;
  theme: ThemeColors;
  openUnifiedActions?: (type: string, data: any) => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
}

export default function Customers({ customers, setCustomers, theme, openUnifiedActions, triggerNotification = () => {}, addAuditLog = () => {} }: CustomersProps) {
  const [showNew, setShowNew] = useState(false);

  React.useEffect(() => {
    const handleOpenNewCustomer = () => {
      setShowNew(true);
    };
    window.addEventListener("sahm_open_new_customer", handleOpenNewCustomer);
    return () => {
      window.removeEventListener("sahm_open_new_customer", handleOpenNewCustomer);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'debtor' | 'creditor' | 'zero'>('all');

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [addressProfile, setAddressProfile] = useState<AddressProfile | undefined>(undefined);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "الرياض",
    balance: ""
  });

  const list = customers
    .filter(c => {
      if (balanceFilter === 'debtor') return c.balance < 0;
      if (balanceFilter === 'creditor') return c.balance > 0;
      if (balanceFilter === 'zero') return c.balance === 0;
      return true;
    })
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));

  const formatMoney = (n: number) => {
    return n.toLocaleString("ar-SA") + " ر.س";
  };

  const exportColumns = [
    { key: "id", label: "مُعرّف العميل" },
    { key: "name", label: "اسم العميل" },
    { key: "phone", label: "رقم الجوال" },
    { key: "city", label: "المنطقة / المدينة" },
    { key: "balance", label: "الحساب المتبقي / الرصيد", format: (v: number) => {
        if (v < 0) return `عليه (مدين): ${formatMoney(Math.abs(v))}`;
        if (v > 0) return `له (دائن): ${formatMoney(Math.abs(v))}`;
        return "مصفّر";
      } 
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(list, exportColumns, "دليل_العملاء_" + new Date().toISOString().slice(0, 10));
  };

  const handleExportPDF = () => {
    exportToPDF("تقرير دليل حسابات العملاء 👥", exportColumns, list, "سجل أرصدة وعناوين وصافي ذمم العملاء");
  };

  const genId = () => Date.now().toString() + "_" + Math.floor(Math.random() * 1000000);

  function saveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("اسم العميل مطلوب.");
      return;
    }

    const balNum = parseFloat(form.balance) || 0;

    const newCustomer: Customer = {
      id: genId(),
      name: form.name.trim(),
      phone: form.phone.trim() || "غير مسجل",
      city: form.city,
      balance: balNum,
      imageUrl: imageUrl,
      addressProfile: addressProfile
    };

    setCustomers([...customers, newCustomer]);
    setShowNew(false);
    setImageUrl(undefined);
    setAddressProfile(undefined);
    
    setForm({
      name: "",
      phone: "",
      city: "الرياض",
      balance: ""
    });
  }

  function deleteCustomer(custId: string) {
    if (confirm("هل أنت متأكد من نقل العميل إلى سلة المحذوفات المؤقتة؟ (يمكنك استعادته لاحقاً من مركز النسخ الاحتياطي)")) {
      const custToDelete = customers.find(c => c.id === custId);
      if (custToDelete) {
        try {
          const trashSaved = localStorage.getItem("sahm_web_trash_bin");
          const trashList = trashSaved ? JSON.parse(trashSaved) : [];
          
          const newTrashItem = {
            id: "tr_cust_" + Date.now().toString().slice(-4),
            type: "customer",
            typeName: "ملف عميل VIP",
            name: `${custToDelete.name} (${custToDelete.city || "الرياض"})`,
            deletedBy: "أ. سليمان الراجحي (CEO)",
            deletedAt: new Date().toLocaleTimeString("ar-SA") + " - " + new Date().toLocaleDateString("ar-SA"),
            originalData: custToDelete
          };
          
          localStorage.setItem("sahm_web_trash_bin", JSON.stringify([newTrashItem, ...trashList]));
          
          // Audit Log integration
          const savedLogs = localStorage.getItem("sahm_audit_logs_v8");
          const auditList = savedLogs ? JSON.parse(savedLogs) : [];
          const newAudit = {
            id: "audit_cust_" + Date.now(),
            action: "نقل للسلة",
            details: `قام الرئيس التنفيذي بنقل العميل "${custToDelete.name}" لسلة المحذوفات المؤقتة لتسوية الحساب الفيدرالي.`,
            user: "أ. سليمان الراجحي",
            role: "CEO",
            time: new Date().toLocaleTimeString("ar-SA") + " - " + new Date().toLocaleDateString("ar-SA"),
            ip: "192.168.1.10",
            module: "إدارة العملاء والـ CRM"
          };
          localStorage.setItem("sahm_audit_logs_v8", JSON.stringify([newAudit, ...auditList]));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {
          console.error("Failed to dump customer to trash bin", e);
        }
      }
      setCustomers(customers.filter(c => c.id !== custId));
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: theme.text }}>دليل حسابات العملاء 👥</h2>
          <p className="text-xs mt-1" style={{ color: theme.muted }}>إدارة سجلات العملاء والموردين وتدقيق الديون والذمم المسجلة على المتجر أو له</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-extrabold text-sm self-start sm:self-auto cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-black/10 text-[#000]"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Directory controllers bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        
        {/* Balance status filter controls */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {(['all', 'debtor', 'creditor', 'zero'] as const).map(f => (
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
              {f === 'all' ? 'جميع الحسابات' : f === 'debtor' ? 'مطلوب ذمم مديون (عليه)' : f === 'creditor' ? 'له مستحقات (له)' : 'حسابات مصفّرة'}
            </button>
          ))}
        </div>

        {/* Live Search inputs */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="البحث باسم العميل أو جواله..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg py-2.5 pl-4 pr-9 border outline-none text-right"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          />
          <Search className="absolute right-3 top-3 w-4 h-4" style={{ color: theme.muted }} />
        </div>
      </div>

      {/* شريط أدوات تصدير حسابات العملاء */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: theme.text }}>تصدير دليل العملاء الحالي ({list.length} عميل):</span>
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

      {/* Customers List grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c) => {
          const isDebtor = c.balance < 0; // translation: they owe us (عليه)
          const isCreditor = c.balance > 0; // translation: we owe them (له)
          
          return (
            <div
              key={c.id}
              className="rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div>
                {/* Header */}
                <div className="flex gap-3 items-center mb-5 border-b pb-4" style={{ borderColor: theme.border }}>
                  {c.imageUrl ? (
                    <img 
                      src={c.imageUrl} 
                      alt={c.name} 
                      referrerPolicy="no-referrer" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-800" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-xs"
                      style={{ backgroundColor: isDebtor ? "#EF444420" : isCreditor ? "#10B98120" : theme.muted + "20", color: isDebtor ? "#EF4444" : isCreditor ? "#10B981" : theme.muted }}>
                      <span>{c.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-black" style={{ color: theme.text }}>{c.name}</h3>
                    <div className="flex gap-3 items-center text-[10px] mt-1" style={{ color: theme.muted }}>
                      <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {c.phone}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {c.city}</span>
                    </div>
                  </div>
                </div>

                {/* National Address details (Renders if user added it) */}
                {c.addressProfile && (
                  <div className="mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 text-right space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-amber-500 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                        {c.addressProfile.shortAddress || "العناوين"}
                      </span>
                      <span className="text-gray-500 font-bold">العنوان الوطني المعتمد</span>
                    </div>
                    <p className="text-gray-400 font-medium">
                      {c.addressProfile.buildingNumber} {c.addressProfile.streetName}، {c.addressProfile.district}، {c.addressProfile.city}، {c.addressProfile.postalCode}
                    </p>
                    <div className="flex justify-start gap-2.5 pb-0.5 pt-1">
                      <button
                        onClick={() => {
                          const formatted = `${c.addressProfile?.buildingNumber || ""} ${c.addressProfile?.streetName || ""}، ${c.addressProfile?.district || ""}، ${c.addressProfile?.city || ""}`;
                          navigator.clipboard.writeText(formatted);
                          triggerNotification && triggerNotification("تم نسخ العنوان 📋");
                        }}
                        className="py-1 px-2 hover:bg-slate-800 rounded font-bold text-gray-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1 text-[9px]"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>نسخ</span>
                      </button>
                      
                      {c.addressProfile.mapLink && (
                        <a
                          href={c.addressProfile.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1 px-2 hover:bg-slate-800 rounded font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-[9px]"
                        >
                          <MapPin className="w-2.5 h-2.5 text-blue-400 animate-pulse" />
                          <span>الخريطة</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Balance layout status */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-[10px] block" style={{ color: theme.muted }}>رصيد الحساب المالي</span>
                  <span className="text-sm font-extrabold font-mono"
                    style={{ color: isDebtor ? "#EF4444" : isCreditor ? "#10B981" : theme.muted }}>
                    {c.balance === 0 ? "صفر (مطهر)" : formatMoney(Math.abs(c.balance))}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openUnifiedActions && openUnifiedActions("customer", c)}
                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg cursor-pointer transition-all flex items-center justify-center"
                    title="إجراءات سهم ⚡"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                    title="حذف العميل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl border"
            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.muted }}>
            لا يوجد عملاء مسجلين يطابقون خيارات التصفية هذه.
          </div>
        )}
      </div>

      {/* Create Customer modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl space-y-6 scrollbar-none"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
            
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: theme.border }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: theme.text }}>إدراج سجل عميل جديد 👤</h3>
                <p className="text-[11px]" style={{ color: theme.muted }}>املأ تفاصيل العميل وصورته وعنوانه الموطد المعياري</p>
              </div>
              <button
                onClick={() => {
                  setShowNew(false);
                  setImageUrl(undefined);
                  setAddressProfile(undefined);
                }}
                className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="space-y-4 text-right">
              {/* Optional Custom Image Uploader */}
              <ImageUploader 
                imageUrl={imageUrl} 
                name={form.name || "عميل جديدة"} 
                onChange={setImageUrl} 
                theme={theme} 
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: theme.muted }}>• الاسم الكامل للعميل</label>
                  <input
                    type="text"
                    placeholder="مثال: صالح العلي..."
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right placeholder-gray-500"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: theme.muted }}>• رقم الجوال (الاتصال المباشر)</label>
                  <input
                    type="text"
                    placeholder="مثال: 050XXXXXXX..."
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-center font-mono placeholder-gray-500"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: theme.muted }}>• المدينة الافتراضية</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-right appearance-none"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="بريدة">بريدة</option>
                    <option value="مكة">مكة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: theme.muted }}>• الرصيد الافتتاحي (ر.س)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="له: إيجابي، عليه: سلبي"
                    value={form.balance}
                    onChange={(e) => setForm(f => ({ ...f, balance: e.target.value }))}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border outline-none text-center font-mono placeholder-gray-500"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </div>

              {/* National Address Verification integration inside overlay */}
              <NationalAddressForm 
                initialAddress={addressProfile} 
                onChange={(addr) => setAddressProfile(addr)} 
                theme={theme} 
              />

              <div className="p-3 bg-amber-500/5 text-amber-500 rounded-lg text-[10px] text-right leading-relaxed border border-amber-500/10">
                ملاحظة: عند الاستعلام عن العنوان الوطني المختصر وجلبه، ستتم إضافة التفاصيل تلقائياً إلى سجل هذا العميل لدعم بوليصة الشحن وحساب تعرفة الشحن وتحديد الفروع المجاورة.
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-lg text-[#000]"
                  style={{ backgroundColor: theme.accent }}
                >
                  حفظ إضافة العميل ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNew(false);
                    setImageUrl(undefined);
                    setAddressProfile(undefined);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border text-center transition-colors"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.muted }}
                >
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Custom Close Icon
function X({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
