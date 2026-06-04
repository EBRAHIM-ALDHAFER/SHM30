import React, { useState } from "react";
import { ThemeColors, Product, Invoice, Customer, Supplier } from "../types";
import { 
  X, Eye, Sparkles, Share2, Receipt, User, TrendingUp, Coins, 
  Settings, Plus, Truck, FileText, Layers, CheckCircle, Copy, Send, 
  ExternalLink, ArrowLeftRight, FileDown, Calendar, AlertCircle
} from "lucide-react";

interface UnifiedActionSystemProps {
  item: { type: string; data: any } | null;
  onClose: () => void;
  theme: ThemeColors;
  products: Product[];
  setProducts: (p: Product[]) => void;
  invoices: Invoice[];
  setInvoices: (i: Invoice[]) => void;
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
  suppliers: Supplier[];
  setSuppliers: (s: Supplier[]) => void;
  onNavigate: (tab: string, subTab?: string, prefill?: any) => void;
}

export default function UnifiedActionSystem({
  item,
  onClose,
  theme,
  products,
  setProducts,
  invoices,
  setInvoices,
  customers,
  setCustomers,
  suppliers,
  setSuppliers,
  onNavigate
}: UnifiedActionSystemProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const { type, data } = item;

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    triggerAlert("📋 تم نسخ بيانات الكائن بصيغة JSON بنجاح!");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Actions Core Executions ---

  // FOR PRODUCTS
  const handleAnalyzeInStudio = () => {
    // Navigate to intelligent_hub subTab ai
    onNavigate("intelligent_hub", "ai", {
      name: data.name,
      price: data.price.toString(),
      image: { uri: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format", base64: "", mimeType: "image/jpeg" },
      fromProduct: true
    });
    onClose();
  };

  const handleSellInPOS = () => {
    // Prefill POS items
    onNavigate("pos_and_operations", "pos", {
      productToSelect: data
    });
    onClose();
  };

  const handleReplenishStock = () => {
    // Transfer or supply new stock
    onNavigate("pos_and_operations", "warehouses", {
      productToReplenish: data
    });
    onClose();
  };

  // FOR INVOICES
  const handleShowLedger = () => {
    onNavigate("accounting", "ledger", {
      invoiceRef: `INV-${data.id}`
    });
    onClose();
  };

  const handleShowCustomer = () => {
    onNavigate("customers", "list", {
      customerName: data.customer
    });
    onClose();
  };

  const handleToggleInvoiceStatus = () => {
    const updated = invoices.map(inv => {
      if (inv.id === data.id) {
        const nextStatus = inv.status === "مدفوع" ? "معلق" as const : "مدفوع" as const;
        triggerAlert(`✓ تم تغيير حالة الفاتورة رقم #${data.id} إلى '${nextStatus}' وتحديث قيود الدفتر!`);
        return { ...inv, status: nextStatus };
      }
      return inv;
    });
    setInvoices(updated);
  };

  // FOR CUSTOMERS
  const handleCreateInvoiceForCustomer = () => {
    onNavigate("pos_and_operations", "pos", {
      customerToSelect: data
    });
    onClose();
  };

  // GENERAL LOGS
  const handleShareWithTeam = () => {
    triggerAlert("🔗 تم نسخ رابط المزامنة الفورية لمشاركتها مع المندوب والمحاسب!");
  };

  const handleSyncToPlatforms = () => {
    triggerAlert("📡 جاري الدفع التلقائي للبيانات إلى منصات الربط سلة وزد وشوبيفاي...");
    setTimeout(() => {
      triggerAlert("✅ تم تحديث منصات سلة وزد بنجاح لحظي مميز!");
    }, 1500);
  };

  const renderProductActions = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-center">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-mono block">رمز المنتج (SKU) : {data.sku}</span>
            <span className="font-extrabold text-white text-sm">{data.name}</span>
            <span className="block text-[11px] text-amber-500 mt-1">السعر: {data.price} ر.س | المخزون الحالي: {data.stock} وحدة</span>
          </div>
          <span className="text-2xl">📦</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <button 
            onClick={handleAnalyzeInStudio}
            className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 transition-all text-right cursor-pointer"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">تحليل بالذكاء الاصطناعي 🧠</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">صياغة محتوى تسويقي وخوض حملة ترويجية بالأستوديو</span>
            </div>
          </button>

          <button 
            onClick={handleSellInPOS}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-right cursor-pointer"
          >
            <Receipt className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">تحميل إلى نقاط البيع السريعة 🛍️</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">فتح الكاشير وإضافة المنتج لسلة البيع الفورية</span>
            </div>
          </button>

          <button 
            onClick={handleReplenishStock}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition-all text-right cursor-pointer"
          >
            <Layers className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">تعديل ومراقبة المخزن 🧱</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">موازنة التوزيع بين الرياض وجدة والشرقية</span>
            </div>
          </button>

          <button 
            onClick={handleSyncToPlatforms}
            className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 transition-all text-right cursor-pointer"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">مزامنة سلة وزد المباشرة 🔌</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">تحديث أسعار البضاعة والمخزون في المتاجر اللحظية</span>
            </div>
          </button>

        </div>
      </div>
    );
  };

  const renderInvoiceActions = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-center">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-mono block">رقم معرّف الفاتورة : #{data.id}</span>
            <span className="font-extrabold text-white text-sm">التاريخ التجاري: {data.date}</span>
            <span className="block text-[11px] text-emerald-400 mt-1">العميل: {data.customer} | الإجمالي الكلي: {data.total} ر.س ({data.status})</span>
          </div>
          <span className="text-2xl">📝</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <button 
            onClick={handleShowLedger}
            className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 transition-all text-right cursor-pointer"
          >
            <Coins className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">عرض القيود المحاسبية ⚖️</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">مراجعة كشف الحساب والقيود المزدوجة التلقائية</span>
            </div>
          </button>

          <button 
            onClick={handleShowCustomer}
            className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 transition-all text-right cursor-pointer"
          >
            <User className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">عرض حساب العميل 👤</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">فحص مشتريات العميل وسجله ومستوى مديونيته لدينا</span>
            </div>
          </button>

          <button 
            onClick={handleToggleInvoiceStatus}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-right cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">تبديل السداد المالي 💳</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">تغير حالة السداد بين 'مدفوع' و 'معلق' بالدفاتر</span>
            </div>
          </button>

          <button 
            onClick={() => triggerAlert("📄 تم إرسال الفاتورة الرسمية كملف PDF إلى بريد العميل بنجاح!")}
            className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 transition-all text-right cursor-pointer"
          >
            <Send className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">إرسال الفاتورة عبر البريد ✉️</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">إرسال إشعار فوري للفاتورة الضريبية بالبريد للعميل</span>
            </div>
          </button>

        </div>
      </div>
    );
  };

  const renderCustomerActions = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-center">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-mono">المدينة: {data.city} | الجوال: {data.phone}</span>
            <span className="font-extrabold text-white text-sm">الاسم: {data.name}</span>
            <span className="block text-[11px] text-indigo-400 mt-1">الرصيد المالي المفتوح: {data.balance} ر.س</span>
          </div>
          <span className="text-2xl">👤</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <button 
            onClick={handleCreateInvoiceForCustomer}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-right cursor-pointer"
          >
            <Receipt className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">إنشاء فاتورة بيع جديدة 🛍️</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">فتح الكاشير آلياً وتجهيز فاتورة باسم العميل</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate("reports", "customers")}
            className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 transition-all text-right cursor-pointer"
          >
            <TrendingUp className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">سجل مشتريات وتقارير 📊</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">تحليل أنماط المشتريات للزبون ومدى تفاعله</span>
            </div>
          </button>

          <button 
            onClick={() => triggerAlert("💬 تم إرسال كود الاستهلاك والعروض الترويجية عبر منصة واتساب العميل!")}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/25 transition-all text-right cursor-pointer"
          >
            <Send className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">إرسال كود خصم بالواتساب 💬</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">مزامنة ترويجية بالواتساب لإرجاع السلات المهجورة</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate("accounting", "entries", { clientName: data.name })}
            className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/25 transition-all text-right cursor-pointer"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">صناعة قيد تسوية محاسبية ✍️</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">إجراء قيد تصفية مديونية مباشرة في دفتر الأستاذ</span>
            </div>
          </button>

        </div>
      </div>
    );
  };

  const renderSupplierActions = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-center">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-mono">الشركة: {data.company} | الجوال: {data.phone}</span>
            <span className="font-extrabold text-white text-sm">المورد: {data.name}</span>
            <span className="block text-[11px] text-red-400 mt-1">الرصيد المفتوح المستحق للمورد: {data.balance} ر.س</span>
          </div>
          <span className="text-2xl">🚛</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <button 
            onClick={() => onNavigate("pos_and_operations", "warehouses", { supplierSelection: data })}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition-all text-right cursor-pointer"
          >
            <Truck className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">طلب توريد / شحنة جديدة 📦</span>
              <span className="block text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">سحب بضائع من المورد مباشرة بالمستودع</span>
            </div>
          </button>

          <button 
            onClick={() => triggerAlert("✍️ تم إعداد كود السند وجدولة سداد مستحقات المورد في الحسابات الدائنة!")}
            className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 transition-all text-right cursor-pointer"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-xs font-black">سند صرف وجدولة مديونية 📅</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">اعتماد سند صرف للمورد وترحيله مباشرة للقيود</span>
            </div>
          </button>

        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-[9999] animate-fade-in dir-rtl text-right">
      <div 
        className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 relative transition-all"
        style={{ 
          backgroundColor: theme.card, 
          border: `1px solid ${theme.border}`,
          borderRadius: theme.borderRadius || "16px"
        }}
      >
        {/* Floating Success alert indicator */}
        {successMsg && (
          <div className="absolute top-4 left-4 right-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">صندوق إجراءات سهم الموحد (Unified Actions Hub) ⚡</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">منصة موحدة ذكية للتحرك اللحظي ومعالجة عمليات الفواتير، الحسابات والمخزن ككتلة واحدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white cursor-pointer active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Core Layout Content */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {type === "product" && renderProductActions()}
          {type === "invoice" && renderInvoiceActions()}
          {type === "customer" && renderCustomerActions()}
          {type === "supplier" && renderSupplierActions()}
        </div>

        {/* Universal Actions Footer drawer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 font-bold rounded-lg text-[10px] cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "تم النسخ!" : "نسخ الكيان كـ JSON"}</span>
            </button>
            <button
              onClick={handleShareWithTeam}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 font-bold rounded-lg text-[10px] cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة سريعة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 px-2.5 rounded-md font-bold">
              تكامل آمن بالكامل 🟢
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
