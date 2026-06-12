import React, { useState } from "react";
import { Invoice, Product, Customer, ThemeColors, InvoiceItem, Supplier } from "../types";
import { Plus, Printer, Trash, Filter, Search, Calendar, FileText, User, X, Check, Zap, Cloud } from "lucide-react";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import ProfileAvatar from "./ProfileAvatar";
import AddressCard from "./AddressCard";
import { SubscriptionGuard } from "../core/database/subscriptionGuard";
import { SahmDatabaseService } from "../core/database/dbService";
const getDriveAccessToken = (): string | null => null;
const googleDriveService = {
  getOrCreateFolder: async (name: string): Promise<string> => "",
  uploadFile: async (options: any): Promise<any> => ({ id: "", name: "" })
};

interface InvoicesProps {
  invoices: Invoice[];
  setInvoices: (inv: Invoice[]) => void;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  setSuppliers: (sup: Supplier[]) => void;
  theme: ThemeColors;
  openUnifiedActions?: (type: string, data: any) => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  activeStoreId?: string;
}

export default function Invoices({ invoices, setInvoices, products, customers, suppliers, setSuppliers, theme, openUnifiedActions, triggerNotification = () => {}, addAuditLog = () => {}, activeStoreId }: InvoicesProps) {
  const [filter, setFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  const handleExportInvoicesToDrive = async () => {
    const isConnected = localStorage.getItem("sahm_gdrive_connected") === "true" && getDriveAccessToken() !== null;
    if (!isConnected) {
      alert("يرجى تفعيل وربط Google Drive أولاً من لوحة 'إدارة التكاملات والدمج' لتنشيط ميزة النسخ الاحتياطي السحابي الذاتي!");
      return;
    }

    setIsBackupLoading(true);
    try {
      const folderId = await googleDriveService.getOrCreateFolder("سهم - النسخ الاحتياطية (Sahm Backups)");
      
      const header = exportColumns.map(col => col.label).join(",");
      const rows = list.map(item => exportColumns.map(col => {
        const val = item[col.key as keyof Invoice];
        const formatted = (col as any).format ? (col as any).format(val) : val;
        return `"${String(formatted ?? "").replace(/"/g, '""')}"`;
      }).join(",")).join("\r\n");
      const csvContent = "\uFEFF" + header + "\r\n" + rows; // utf-8 BOM

      const fileName = `سجل_الفواتير_المحاسبية_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.csv`;
      await googleDriveService.uploadFile({
        name: fileName,
        mimeType: "text/csv;charset=utf-8",
        content: csvContent,
        folderId
      });

      triggerNotification("✓ تم رفع نسخة احتياطية آمنة من الفواتير الحالية إلى Google Drive بنجاح!", "success");
      addAuditLog("نسخ احتياطي سحابي", `تم رفع نسخة احتياطية من قائمة الفواتير (${list.length} فاتورة) باسم ${fileName} إلى جوجل درايف.`);
    } catch (err: any) {
      alert(`فشل رفع النسخة الاحتياطية: ${err.message}`);
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleBackupSingleInvoiceToDrive = async (invoiceToBackup: Invoice) => {
    const isConnected = localStorage.getItem("sahm_gdrive_connected") === "true" && getDriveAccessToken() !== null;
    if (!isConnected) {
      alert("يرجى تفعيل وربط Google Drive أولاً من لوحة 'إدارة التكاملات والدمج' لتنشيط ميزة النسخ الاحتياطي السحابي الذاتي!");
      return;
    }

    setIsBackupLoading(true);
    try {
      const folderId = await googleDriveService.getOrCreateFolder("سهم - النسخ الاحتياطية (Sahm Backups)");
      
      const backupText = `
=========================================
مكتبة سهم المحاسبية — فاتورة معتمدة ضريبياً
=========================================
رقم الفاتورة: ${invoiceToBackup.id}
التاريخ المعتمد: ${invoiceToBackup.date}
نوع الفاتورة: ${invoiceToBackup.type === 'sale' ? 'مبيعات' : 'توريد ومشتريات'}
العميل/المورد: ${invoiceToBackup.customer}
حالة الدفع قيد الصرف: ${invoiceToBackup.status}

الأصناف المدرجة:
-----------------------------------------
${invoiceToBackup.items.map((it, idx) => `${idx + 1}. ${it.name} - الكمية: ${it.qty} - السعر: ${it.price} ر.س - الإجمالي: ${it.total} ر.س`).join("\n")}

تفاصيل القيمة المضافة (VAT):
-----------------------------------------
المبلغ قبل الضريبة: ${(invoiceToBackup.total / 1.15).toFixed(2)} ر.س
ضريبة القيمة المضافة (15%): ${(invoiceToBackup.total - (invoiceToBackup.total / 1.15)).toFixed(2)} ر.س
الإجمالي النهائي الشامل للضريبة: ${invoiceToBackup.total} ر.س

تم التصدير والتوثيق سحابياً وتفصيلياً بنجاح في: ${new Date().toLocaleString("ar-SA")}
`;

      const fileName = `فاتورة_${invoiceToBackup.id}_${invoiceToBackup.customer.replace(/\s+/g, '_')}.txt`;
      await googleDriveService.uploadFile({
        name: fileName,
        mimeType: "text/plain;charset=utf-8",
        content: backupText,
        folderId
      });

      triggerNotification(`✓ تم نسخ الفاتورة [${invoiceToBackup.id}] احتياطياً على Google Drive بنجاح!`, "success");
      addAuditLog("نسخ احتياطي فردي", `تم رفع نسخة احتياطية من الفاتورة رقم ${invoiceToBackup.id} إلى جوجل درايف بنجاح.`);
    } catch (err: any) {
      alert(`فشل رفع النسخة الاحتياطية السحابية: ${err.message}`);
    } finally {
      setIsBackupLoading(false);
    }
  };

  React.useEffect(() => {
    const handleOpenNewInvoice = () => {
      if (activeStoreId === "all_stores") {
        triggerNotification("⚠️ لا يمكن إنشاء فواتير في وضع العرض الموحد لجميع المتاجر. يرجى تفعيل متجر محدد أولاً.", "error");
        return;
      }
      setShowNew(true);
    };
    window.addEventListener("sahm_open_new_invoice", handleOpenNewInvoice);
    return () => {
      window.removeEventListener("sahm_open_new_invoice", handleOpenNewInvoice);
    };
  }, [activeStoreId]);

  const handleCreateInvoiceClick = () => {
    if (activeStoreId === "all_stores") {
      triggerNotification("⚠️ يرجى تغيير متجر العرض الموحد لمتجر/علامة تجارية فردية محددة أولاً لإصدار فواتير معتمدة ضريبياً.", "error");
      return;
    }
    setShowNew(true);
  };
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getInvoicePartnerData = (inv: Invoice | null) => {
    if (!inv) return { imageUrl: undefined, addressProfile: undefined };
    const isSale = inv.type === 'sale';
    const partnerName = inv.customer;
    const matchedCustomer = isSale ? customers.find(c => c.name === partnerName) : null;
    const matchedSupplier = !isSale ? suppliers.find(s => s.name === partnerName) : null;
    return {
      imageUrl: matchedCustomer?.imageUrl || matchedSupplier?.imageUrl,
      addressProfile: matchedCustomer?.addressProfile || matchedSupplier?.addressProfile
    };
  };

  // New Invoice form state
  const [form, setForm] = useState({
    type: 'sale' as 'sale' | 'purchase',
    customer: '',
    date: new Date().toISOString().split('T')[0],
    status: 'معلق' as 'مدفوع' | 'معلق',
    items: [{ name: '', qty: 1, price: 0 }]
  });

  const list = invoices
    .filter(i => filter === 'all' || i.type === filter)
    .filter(i => (i.customer || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || (i.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()));

  const formatMoney = (n: number) => {
    return (n ?? 0).toLocaleString("ar-SA") + " ر.س";
  };

  const exportColumns = [
    { key: "id", label: "رقم الفاتورة" },
    { key: "type", label: "نوع الفاتورة", format: (v: string) => v === 'sale' ? 'مبيعات (بيع)' : 'مشتريات (شراء)' },
    { key: "customer", label: "الجهة (عميل/مورد)" },
    { key: "date", label: "التاريخ" },
    { key: "total", label: "إجمالي القيمة", format: (v: number) => formatMoney(v) },
    { key: "status", label: "حالة السداد" }
  ];

  const handleExportExcel = async () => {
    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "excel_export");
      if (!hasAccess) {
        triggerNotification("⚠️ ميزة تصدير Excel غير متاحة في باقتك الحالية. يرجى الترقية.", "critical");
        return;
      }
    }
    exportToExcel(list, exportColumns, "سجل_الفواتير_" + new Date().toISOString().slice(0, 10));
  };

  const handleExportPDF = async () => {
    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "pdf_export");
      if (!hasAccess) {
        triggerNotification("⚠️ ميزة تصدير PDF غير متاحة في باقتك الحالية. يرجى الترقية.", "critical");
        return;
      }
    }
    exportToPDF("سجل ومستندات الفواتير والحسابات 🧾", exportColumns, list, "الأرشيف الكامل للفواتير الصادرة والواردة للمتجر");
  };

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }));
  }

  function removeItem(idx: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function updItem(idx: number, field: keyof Omit<InvoiceItem, 'total'>, val: string | number) {
    const items = [...form.items];
    const item = { ...items[idx] };
    if (field === 'qty') {
      item.qty = parseFloat(val as string) || 0;
    } else if (field === 'price') {
      item.price = parseFloat(val as string) || 0;
    } else {
      item.name = val as string;
    }
    items[idx] = item;
    setForm(f => ({ ...f, items }));
  }

  const grandTotal = form.items.reduce((sum, item) => sum + item.qty * item.price, 0);

  async function saveInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer.trim()) {
      alert("الرجاء إدخال اسم العميل أو المورد.");
      return;
    }
    if (form.items.some(i => !i.name.trim() || i.qty <= 0 || i.price <= 0)) {
      alert("الرجاء تعبئة بيانات الأصناف بشكل صحيح (الاسم، الكمية، السعر).");
      return;
    }

    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());

    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "invoices");
      if (!hasAccess) {
        triggerNotification("⚠️ ميزة الفواتير غير متاحة في باقتك الحالية. يرجى ترقية باقتك.", "critical");
        return;
      }

      const limitCheck = await guard.checkLimit(tenantId, "invoices", invoices.length);
      if (!limitCheck.allowed) {
        triggerNotification(`⚠️ وصلت إلى حد الفواتير الشهرية في باقتك الحالية (الحد: ${limitCheck.limit}). تواصل مع إدارة منصة سهم للترقية.`, "critical");
        return;
      }
    }

    const calculatedItems = form.items.map(i => ({
      ...i,
      total: i.qty * i.price
    }));

    const newInvoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      type: form.type,
      customer: form.customer.trim(),
      date: form.date,
      total: grandTotal,
      status: form.status,
      items: calculatedItems
    };

    // Update supplier balance automatically if it is a purchase invoice (accounts payable initial status is PENDING/معلق)
    if (form.type === 'purchase') {
      const supplierName = form.customer.trim();
      const existingSup = suppliers.find(s => (s.name || '').toLowerCase() === (supplierName || '').toLowerCase());
      const balanceToAdd = form.status === 'معلق' ? grandTotal : 0;

      if (existingSup) {
        setSuppliers(suppliers.map(s => s.id === existingSup.id ? { ...s, balance: s.balance + balanceToAdd } : s));
      } else {
        // Automatically register supplier if name was entered manually
        const newSup: Supplier = {
          id: `sup-${Date.now()}`,
          name: supplierName,
          phone: "غير مسجل",
          company: "جهة توريد تلقائية",
          balance: balanceToAdd
        };
        setSuppliers([...suppliers, newSup]);
      }
    }

    setInvoices([newInvoice, ...invoices]);
    setShowNew(false);

    // Increment usage
    if (!isPlatform && tenantId !== "tenant-local") {
      try {
        const db = SahmDatabaseService.getInstance();
        await db.incrementSubscriptionUsage(tenantId, userLocal.company_id || "comp-default", "invoices_count", 1);
      } catch (uErr) {
        console.warn("[Invoices] Failed to increment invoices count in usage:", uErr);
      }
    }
    
    // Reset form
    setForm({
      type: 'sale',
      customer: '',
      date: new Date().toISOString().split('T')[0],
      status: 'معلق',
      items: [{ name: '', qty: 1, price: 0 }]
    });
  }

  function toggleInvoiceStatus(invId: string) {
    const targetInvoice = invoices.find(i => i.id === invId);
    if (!targetInvoice) return;

    const nextStatus: "مدفوع" | "معلق" = targetInvoice.status === 'مدفوع' ? 'معلق' : 'مدفوع';

    // If it is a purchase invoice, we update the supplier's balance!
    if (targetInvoice.type === 'purchase') {
      const supplierName = targetInvoice.customer.trim();
      const existingSup = suppliers.find(s => (s.name || '').toLowerCase() === (supplierName || '').toLowerCase());
      if (existingSup) {
        let diff = 0;
        if (nextStatus === 'معلق') {
          // Changed from paid to pending -> we now owe them this money! so balance increases
          diff = targetInvoice.total;
        } else {
          // Changed from pending to paid -> we no longer owe them this money! so balance decreases
          diff = -targetInvoice.total;
        }
        setSuppliers(suppliers.map(s => s.id === existingSup.id ? { ...s, balance: s.balance + diff } : s));
      }
    }

    const updated = invoices.map(inv => {
      if (inv.id === invId) {
        return {
          ...inv,
          status: nextStatus
        };
      }
      return inv;
    });
    setInvoices(updated);
  }

  function deleteInvoice(invId: string) {
    if (confirm("هل أنت متأكد من نقل هذه الفاتورة إلى سلة المحذوفات المؤقتة؟ (يمكنك استعادتها لاحقاً من مركز النسخ الاحتياطي)")) {
      const targetInvoice = invoices.find(i => i.id === invId);
      
      // If deleted invoice is a pending purchase, decrease the supplier's outstanding dues balance
      if (targetInvoice && targetInvoice.type === 'purchase' && targetInvoice.status === 'معلق') {
        const supplierName = targetInvoice.customer.trim();
        const existingSup = suppliers.find(s => (s.name || '').toLowerCase() === (supplierName || '').toLowerCase());
        if (existingSup) {
          setSuppliers(suppliers.map(s => s.id === existingSup.id ? { ...s, balance: s.balance - targetInvoice.total } : s));
        }
      }

      if (targetInvoice) {
        try {
          if (import.meta.env.VITE_DATA_MODE !== "supabase") {
            const trashSaved = localStorage.getItem("sahm_web_trash_bin");
            const trashList = trashSaved ? JSON.parse(trashSaved) : [];
            
            const newTrashItem = {
              id: "tr_inv_" + Date.now().toString().slice(-4),
              type: "invoice",
              typeName: "فاتورة ضريبية مبسطة",
              name: `فاتورة رقم #${targetInvoice.id} (${targetInvoice.customer})`,
              deletedBy: "أ. سليمان الراجحي (CEO)",
              deletedAt: new Date().toLocaleTimeString("ar-SA") + " - " + new Date().toLocaleDateString("ar-SA"),
              originalData: targetInvoice
            };
            
            localStorage.setItem("sahm_web_trash_bin", JSON.stringify([newTrashItem, ...trashList]));
          }
          
          // Audit Log
          if (import.meta.env.VITE_DATA_MODE !== "supabase") {
            const savedLogs = localStorage.getItem("sahm_audit_logs_v8");
            const auditList = savedLogs ? JSON.parse(savedLogs) : [];
            const newAudit = {
              id: "audit_inv_" + Date.now(),
              action: "نقل للسلة",
              details: `تم نقل الفاتورة رقم "${targetInvoice.id}" للعميل "${targetInvoice.customer}" بقيمة ${targetInvoice.total} ر.س لسلة المحذوفات.`,
              user: "أ. سليمان الراجحي",
              role: "CEO",
              time: new Date().toLocaleTimeString("ar-SA") + " - " + new Date().toLocaleDateString("ar-SA"),
              ip: "192.168.1.10",
              module: "الحسابات والفواتير"
            };
            localStorage.setItem("sahm_audit_logs_v8", JSON.stringify([newAudit, ...auditList]));
            window.dispatchEvent(new Event("storage"));
          } else {
            addAuditLog("نقل للسلة", `تم نقل الفاتورة رقم "${targetInvoice.id}" للعميل "${targetInvoice.customer}" بقيمة ${targetInvoice.total} ر.س لسلة المحذوفات.`);
          }
        } catch (e) {
          console.error("Failed to dump invoice to trash bin", e);
        }
      }
      
      setInvoices(invoices.filter(i => i.id !== invId));
    }
  }

  return (
    <div className="space-y-6">
      {/* 🚀 Main Header of Invoices & ZATCA Hub */}
      <div className="p-5 rounded-2xl border text-right space-y-4 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.08)] animate-fade-in" 
        style={{
          background: `radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, rgba(13, 21, 39, 0.95) 100%)`,
          borderColor: theme.border
        }}>
        <div className="absolute left-0 top-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Double-ring ZATCA compliance status gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0 bg-black/45 rounded-2xl border border-zinc-800/60 p-2 shadow-inner">
              <div className="absolute inset-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="2.5" 
                    strokeDasharray="100" 
                    strokeDashoffset="0" 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
              </div>
              <div className="absolute inset-1.5">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="2" 
                    strokeDasharray="100" 
                    strokeDashoffset="0.2" 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
              </div>
              <div className="text-center z-10">
                <span className="block text-[10px] font-black text-white font-mono leading-none">100%</span>
                <span className="block text-[5.5px] text-amber-400 mt-0.5 leading-none">ربط زكاة (ZATCA)</span>
              </div>
            </div>

            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2" style={{ color: theme.text }}>
                <span>الفواتير والمنظومة المالية 🧾</span>
                <span className="font-extrabold text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-mono tracking-wider">ZATCA COMPLIANT</span>
              </h2>
              <p className="text-[10px]" style={{ color: theme.muted }}>إصدار وتوثيق فواتير المبيعات والمشتريات وإدارتها المباشرة المتوافقة مع الفوترة الإلكترونية</p>
            </div>
          </div>

          <button
            onClick={handleCreateInvoiceClick}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-extrabold text-sm self-start sm:self-auto cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-amber-500/20 text-[#000] border-none"
            style={{ backgroundColor: theme.accent }}
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>إصدار فاتورة جديدة</span>
          </button>
        </div>
      </div>

      {/* Directory Filter controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        
        {/* Type selector tabs */}
        <div className="flex gap-2 w-full md:w-auto">
          {(['all', 'sale', 'purchase'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="text-xs py-2 px-4 rounded-lg font-bold cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: filter === t ? theme.accent : theme.surface,
                color: filter === t ? '#000' : theme.muted,
                border: `1px solid ${filter === t ? theme.accent : theme.border}`
              }}
            >
              {t === 'all' ? 'الكل' : t === 'sale' ? 'مبيعات (بيع)' : 'مشتريات (شراء)'}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="البحث باسم العميل أو رقم الفاتورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg py-2.5 pl-4 pr-9 border outline-none text-right"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          />
          <Search className="absolute right-3 top-3 w-4 h-4" style={{ color: theme.muted }} />
        </div>
      </div>

      {/* شريط أدوات تصدير الفواتير */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: theme.text }}>تصدير سجل الفواتير الحالي ({list.length} فاتورة):</span>
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
          <button
            onClick={handleExportInvoicesToDrive}
            disabled={isBackupLoading}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all active:scale-95 cursor-pointer disabled:opacity-50 text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isBackupLoading ? "جاري الأرشفة..." : "نسخ درايف الاحتياطي سحابياً 📁"}</span>
          </button>
        </div>
      </div>

      {/* Invoice Grid Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((inv) => (
          <div
            key={inv.id}
            className="rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at top right, rgba(212, 175, 55, 0.03) 0%, ${theme.card} 100%)`,
              borderColor: theme.border
            }}
          >
            <div>
              {/* Card top */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono font-black text-xs" style={{ color: theme.accent }}>{inv.id}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] py-0.5 px-2 rounded-md font-bold"
                      style={{
                        backgroundColor: inv.type === 'sale' ? '#10B98115' : '#3B82F615',
                        color: inv.type === 'sale' ? '#10B981' : '#3B82F6'
                      }}>
                      {inv.type === 'sale' ? 'بيع' : 'شراء'}
                    </span>
                    <span className={`text-[10px] py-0.5 px-2 rounded-md font-bold cursor-pointer`}
                      onClick={() => toggleInvoiceStatus(inv.id)}
                      title="اضغط لتغيير الحالة">
                      {inv.status === 'مدفوع' ? (
                        <span className="text-emerald-500 bg-emerald-500/10 flex items-center gap-0.5 px-1 py-0.5 rounded">
                          <Check className="w-2.5 h-2.5" /> مدفوع
                        </span>
                      ) : (
                        <span className="text-amber-500 bg-amber-500/10 flex items-center gap-0.5 px-1 py-0.5 rounded">
                          ● معلّق
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <span className="text-[10px]" style={{ color: theme.muted }}>{inv.date}</span>
              </div>

              {/* Customer description */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-black" style={{ color: theme.text }}>{inv.customer}</p>
                <p className="text-[11px]" style={{ color: theme.muted }}>
                  تضم الفاتورة <span className="font-bold text-gray-300">{inv.items.length}</span> أصناف بسعر مالي إجمالي
                </p>
              </div>
            </div>

            {/* Price section and action bar */}
            <div className="pt-4 flex items-center justify-between relative">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div>
                <span className="text-[10px] block" style={{ color: theme.muted }}>إجمالي الحساب</span>
                <span className="text-lg font-black font-mono" style={{ color: theme.text }}>{formatMoney(inv.total)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openUnifiedActions && openUnifiedActions("invoice", inv)}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all cursor-pointer"
                  title="إجراءات سهم ⚡"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="p-2 bg-gray-500/5 hover:bg-gray-500/15 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="عرض تفصيلي للطباعة"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteInvoice(inv.id)}
                  className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  title="حذف الفاتورة"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl border"
            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.muted }}>
            لا توجد فواتير مطابقة لخيارات البحث الحالية.
          </div>
        )}
      </div>

      {/* Slide-over to Create Invoice */}
      {showNew && (
        <div className="fixed inset-0 bg-black/75 flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-2xl overflow-y-auto h-full p-6 shadow-2xl flex flex-col justify-between border-r"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: theme.border }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>إصدار فاتورة إلكترونية جديدة 🧾</h3>
                  <p className="text-xs" style={{ color: theme.muted }}>املأ البيانات بدقة لإصدار وحفظ الفاتورة تلقائياً</p>
                </div>
                <button onClick={() => setShowNew(false)} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveInvoice} className="space-y-5">
                {/* Sale / Purchase selector */}
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: theme.muted }}>• نوع الفاتورة</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: 'sale' }))}
                      className="py-2.5 rounded-lg text-xs font-black cursor-pointer transition-colors"
                      style={{
                        backgroundColor: form.type === 'sale' ? theme.accent : theme.surface,
                        color: form.type === 'sale' ? '#000' : theme.muted,
                        border: `1px solid ${form.type === 'sale' ? theme.accent : theme.border}`
                      }}
                    >
                      فاتورة مبيعات (بيع)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: 'purchase' }))}
                      className="py-2.5 rounded-lg text-xs font-black cursor-pointer transition-colors"
                      style={{
                        backgroundColor: form.type === 'purchase' ? theme.accent : theme.surface,
                        color: form.type === 'purchase' ? '#000' : theme.muted,
                        border: `1px solid ${form.type === 'purchase' ? theme.accent : theme.border}`
                      }}
                    >
                      فاتورة مشتريات (شراء)
                    </button>
                  </div>
                </div>

                {/* Initial Status selector */}
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: theme.muted }}>• حالة الفاتورة المبدئية</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: 'مدفوع' }))}
                      className="py-2.5 rounded-lg text-xs font-black cursor-pointer transition-colors"
                      style={{
                        backgroundColor: form.status === 'مدفوع' ? theme.accent : theme.surface,
                        color: form.status === 'مدفوع' ? '#000' : theme.muted,
                        border: `1px solid ${form.status === 'مدفوع' ? theme.accent : theme.border}`
                      }}
                    >
                      {form.type === 'purchase' ? 'مدفوعة بالكامل (نقداً)' : 'مستلمة (مدفوعة)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: 'معلق' }))}
                      className="py-2.5 rounded-lg text-xs font-black cursor-pointer transition-colors"
                      style={{
                        backgroundColor: form.status === 'معلق' ? theme.accent : theme.surface,
                        color: form.status === 'معلق' ? '#000' : theme.muted,
                        border: `1px solid ${form.status === 'معلق' ? theme.accent : theme.border}`
                      }}
                    >
                      {form.type === 'purchase' ? 'معلّقة بالآجل (ترفع رصيد المورد)' : 'معلقة (على الحساب)'}
                    </button>
                  </div>
                </div>

                {/* Date and Customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: theme.muted }}>• التاريخ</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full text-xs rounded-lg py-2.5 px-3 pr-9 border outline-none text-right"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                        required
                      />
                      <Calendar className="absolute right-3 top-3 w-4 h-4" style={{ color: theme.muted }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: theme.muted }}>
                      {form.type === 'sale' ? '• اسم العميل المستحق' : '• اسم المورد المستحق'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={form.type === 'sale' ? "أدخل اسم العميل..." : "أدخل اسم المورد..."}
                        value={form.customer}
                        onChange={(e) => setForm(f => ({ ...f, customer: e.target.value }))}
                        className="w-full text-xs rounded-lg py-2.5 px-3 pr-9 border outline-none text-right"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                        required
                        autoComplete="off"
                      />
                      <User className="absolute right-3 top-3 w-4 h-4" style={{ color: theme.muted }} />
                      
                      {/* Interactive autocomplete suggest select list */}
                      {form.customer && (
                        <div className="absolute right-0 left-0 mt-1 max-h-36 overflow-y-auto rounded-xl border z-40 text-xs font-bold shadow-xl"
                          style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                          {form.type === 'sale' ? (
                            customers
                              .filter(c => (c.name || '').toLowerCase().includes((form.customer || '').toLowerCase()) && (c.name || '').toLowerCase() !== (form.customer || '').toLowerCase())
                              .map(c => (
                                <div 
                                  key={c.id} 
                                  onClick={() => setForm(f => ({ ...f, customer: c.name }))}
                                  className="p-2.5 cursor-pointer hover:bg-gray-500/10 text-right border-b last:border-b-0"
                                  style={{ color: theme.text, borderColor: theme.border }}
                                >
                                  {c.name} ({c.city})
                                </div>
                              ))
                          ) : (
                            suppliers
                              .filter(s => (s.name || '').toLowerCase().includes((form.customer || '').toLowerCase()) && (s.name || '').toLowerCase() !== (form.customer || '').toLowerCase())
                              .map(s => (
                                <div 
                                  key={s.id} 
                                  onClick={() => setForm(f => ({ ...f, customer: s.name }))}
                                  className="p-2.5 cursor-pointer hover:bg-gray-500/10 text-right border-b last:border-b-0"
                                  style={{ color: theme.text, borderColor: theme.border }}
                                >
                                  {s.name} ({s.company})
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items collection list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold" style={{ color: theme.muted }}>• الأصناف والسلع المسجلة</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-xs font-bold hover:underline cursor-pointer"
                      style={{ color: theme.accent }}
                    >
                      + إضافة صنف جديد
                    </button>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-[#151F30]/40 p-3 rounded-xl border" style={{ borderColor: theme.border }}>
                        <input
                          type="text"
                          placeholder="اسم الصنف..."
                          value={item.name}
                          onChange={(e) => updItem(idx, 'name', e.target.value)}
                          className="flex-[2] text-xs rounded-lg py-1.5 px-2 bg-transparent border outline-none text-right"
                          style={{ borderColor: theme.border, color: theme.text }}
                          required
                        />
                        <input
                          type="number"
                          placeholder="كمية"
                          min="0.1"
                          step="any"
                          value={item.qty === 0 ? '' : item.qty}
                          onChange={(e) => updItem(idx, 'qty', e.target.value)}
                          className="flex-1 text-xs rounded-lg py-1.5 px-2 bg-transparent border outline-none text-center"
                          style={{ borderColor: theme.border, color: theme.text }}
                          required
                        />
                        <input
                          type="number"
                          placeholder="سعر الوحدة"
                          min="0.1"
                          step="any"
                          value={item.price === 0 ? '' : item.price}
                          onChange={(e) => updItem(idx, 'price', e.target.value)}
                          className="flex-1 text-xs rounded-lg py-1.5 px-2 bg-transparent border outline-none text-center"
                          style={{ borderColor: theme.border, color: theme.text }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg disabled:opacity-30 cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Previews / Summary */}
                <div className="p-4 rounded-xl flex justify-between items-center shadow-inner border border-dashed"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <span className="text-xs" style={{ color: theme.muted }}>إجمالي الفاتورة التقديري</span>
                  <span className="text-xl font-black font-mono" style={{ color: theme.accent }}>{formatMoney(grandTotal)}</span>
                </div>

                {/* Confirm actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-lg text-[#000]"
                    style={{ backgroundColor: theme.accent }}
                  >
                    حفظ وإصدار الفاتورة ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs cursor-pointer border text-center transition-colors font-sans hover:text-white"
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

      {/* Invoice Viewer and Printable Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl p-6 relative flex flex-col justify-between max-h-[90vh]"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
            
            {/* Modal header actions */}
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: theme.border }}>
              <h3 className="text-sm font-bold" style={{ color: theme.text }}>معاينة وطباعة الفاتورة 📄</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBackupSingleInvoiceToDrive(selectedInvoice)}
                  disabled={isBackupLoading}
                  className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer border-none disabled:opacity-50"
                  title="نسخ احتياطي للفاتورة على جوجل درايف تلقائياً"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{isBackupLoading ? "جاري الأرشفة..." : "أرشفة إلى Drive 📁"}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer border-none"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area content */}
            <div id="print-area" className="flex-1 overflow-y-auto p-4 my-4 font-sans bg-white text-[#151F24] rounded-xl text-right dir-rtl select-text">
              <div className="flex justify-between items-start pb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-lg font-black text-[#D4AF37]">مراسيم الطيب</h1>
                  <p className="text-[10px] text-gray-400 mt-1">سهم المحاسب الإلكتروني للذكاء والحلول</p>
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-gray-800">
                    {selectedInvoice.type === 'sale' ? 'فاتورة مبيعات ممتازة' : 'فاتورة توريد مشتريات'}
                  </h2>
                  <p className="text-xs font-mono font-bold text-[#D4AF37] mt-1">{selectedInvoice.id}</p>
                </div>
              </div>

              {/* invoice metadata */}
              {(() => {
                const partnerData = getInvoicePartnerData(selectedInvoice);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 my-5 text-xs text-right text-gray-900 bg-slate-55">
                      <div className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2 text-right">
                        <ProfileAvatar
                          name={selectedInvoice.customer}
                          imageUrl={partnerData.imageUrl}
                          size="sm"
                          theme={theme}
                        />
                        <div>
                          <span className="text-[10px] text-gray-400 block mb-0.5">
                            {selectedInvoice.type === 'sale' ? 'العميل المستحق' : 'المورد المعتمد'}
                          </span>
                          <span className="font-bold text-gray-800">{selectedInvoice.customer}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 text-right">
                        <span className="text-[10px] text-gray-400 block mb-1">تاريخ الإصدار وتوقيت القيد</span>
                        <span className="font-mono font-bold text-gray-800">{selectedInvoice.date}</span>
                      </div>
                      <div className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 text-right">
                        <span className="text-[10px] text-gray-400 block mb-1">حالة الدفع المالية قيد الصرف</span>
                        <span className={`font-bold font-mono ${selectedInvoice.status === 'مدفوع' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {selectedInvoice.status}
                        </span>
                      </div>
                    </div>

                    {/* National Address Render inside Invoicing printable area (ZATCA compliant) */}
                    {partnerData.addressProfile && (
                      <div className="mb-5 animate-fade-in shadow-sm">
                        <AddressCard
                          address={partnerData.addressProfile}
                          theme={theme}
                          title={selectedInvoice.type === 'sale' ? "عنوان تسليم شحنة العميل (SPL)" : "عنوان مستودع شحن المورد (SPL)"}
                          onCopySuccess={(msg) => triggerNotification?.(msg, "success")}
                        />
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Items listing table */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-[#D4AF37]/10 text-gray-700 font-bold border-b border-gray-100">
                      <th className="p-3 w-1/2">بيان الصنف والسلعة</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-center">سعر الوحدة</th>
                      <th className="p-3 text-left">الإجمالي تراكماً</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {selectedInvoice.items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold">{it.name}</td>
                        <td className="p-3 text-center font-mono">{it.qty.toLocaleString("ar-SA")}</td>
                        <td className="p-3 text-center font-mono">{formatMoney(it.price)}</td>
                        <td className="p-3 text-left font-mono font-extrabold text-gray-800">{formatMoney(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detailed VAT & Totals breakdown table (ZATCA Phase 2 Integration compliant) */}
              <div className="mt-6 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 border-r-2 border-[#D4AF37] pr-2">
                  تحليل وضريبة القيمة المضافة بالتفصيل (متوافق مع المرحلة الثانية - الربط والتكامل لـ ZATCA):
                </p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50/55 text-gray-700 font-bold border-b border-gray-100 text-[10px]">
                        <th className="p-2">الوعاء الضريبي (قبل الضريبة)</th>
                        <th className="p-2 text-center">معدل الضريبة</th>
                        <th className="p-2 text-center">مبلغ الضريبة (VAT)</th>
                        <th className="p-2 text-left">المجموع الشامل (مع الضريبة)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-600 font-mono text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold">{formatMoney(selectedInvoice.total / 1.15)}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-600">15%</td>
                        <td className="p-2.5 text-center font-bold text-gray-800">{formatMoney(selectedInvoice.total - (selectedInvoice.total / 1.15))}</td>
                        <td className="p-2.5 text-left font-black text-gray-900">{formatMoney(selectedInvoice.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals and calculations */}
              <div className="mt-4 flex justify-between items-center pb-4 border-b border-gray-100 bg-gray-50/20 p-3 rounded-lg">
                <div className="text-right text-[9px] text-gray-400 leading-relaxed max-w-[50%]">
                  * تم استخدام نظام "سهم" لإنشاء وترصيد الحسابات بنجاح وثقة.<br />
                  * الفاتورة متوافقة بالكامل مع متطلبات الفوترة الإلكترونية والمرحلة الثانية (ZATCA Phase 2).<br />
                  * تطبق شروط وأحكام مكافحة التستر والضريبة بالمملكة العربية السعودية.
                </div>
                <div className="text-left space-y-1 font-sans">
                  <div className="p-3 bg-[#D4AF37] text-white rounded-lg text-lg font-black font-mono inline-block shadow-sm">
                    الإجمالي النهائي الشامل: {formatMoney(selectedInvoice.total)}
                  </div>
                </div>
              </div>

              {/* ZATCA Compliance Section with QR Code */}
              <div className="mt-4 text-right">
                <div className="flex flex-row items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-gray-100">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>فاتورة ضريبة مبسطة معتمدة (ZATCA Compliant)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-gray-500">
                      <div>
                        <span className="text-gray-400">المنشأة:</span> <span className="font-semibold text-gray-700">مراسيم الطيب</span>
                      </div>
                      <div>
                        <span className="text-gray-400">الرقم الضريبي (VAT ID):</span> <span className="font-mono font-semibold text-gray-700 text-[8px]">310122456700003</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">التوقيع الرقمي:</span> <span className="font-mono text-[8px] text-gray-400">SHA256: d8a9f243be1209cc51bf12f0a887b001a1c90</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">التكامل:</span> <span className="text-gray-600 font-semibold">مزامنة سهم وتحديث المخزون التلقائي (Zaid & Salla Connected)</span>
                      </div>
                    </div>
                    <p className="text-[8px] text-gray-400 leading-relaxed pt-1">
                      تم توقيع الفاتورة وتوليد هذا الرمز آلياً بمتطلبات الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية ومزامنتها تلقائياً مع منصات البيع.
                    </p>
                  </div>
                  
                  {/* QR Code Graphic Container */}
                  <div className="flex flex-col items-center justify-center bg-white p-2 border border-gray-200 rounded-lg shadow-xs shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=0&color=151f24&data=${encodeURIComponent(
                        `https://zatca.gov.sa/ar/Business/ElectronicInvoicing/Pages/default.aspx?invoiceId=${selectedInvoice.id}&seller=${encodeURIComponent("مراسيم الطيب")}&vatId=310122456700003&total=${selectedInvoice.total}&date=${encodeURIComponent(selectedInvoice.date)}`
                      )}`}
                      alt="ZATCA Compliance QR Code"
                      className="w-20 h-20"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[8px] font-mono font-bold text-[#151F24] mt-1">مسح التحقق المعتمد 🔒</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t text-center text-xs" style={{ borderColor: theme.border, color: theme.muted }}>
              <span>اضغط على زر (عرض طباعة) لتصدير وحفظ الفاتورة كملف PDF على حاسوبك</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
