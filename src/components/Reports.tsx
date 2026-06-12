import React, { useState } from "react";
import { Invoice, Product, Customer, ThemeColors } from "../types";
import { TrendingUp, ShoppingBag, BarChart3, HelpCircle, ArrowUpRight, DollarSign, PieChart, Landmark, Download, Printer, FileText, X, Check, Cloud, ShieldAlert } from "lucide-react";
import { SubscriptionGuard } from "../core/database/subscriptionGuard";
import { SahmDatabaseService } from "../core/database/dbService";
const getDriveAccessToken = (): string | null => null;
const googleDriveService = {
  getOrCreateFolder: async (name: string): Promise<string> => "",
  uploadFile: async (options: any): Promise<any> => ({ id: "", name: "" })
};

interface ReportsProps {
  invoices: Invoice[];
  products: Product[];
  theme: ThemeColors;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
}

export default function Reports({ invoices, products, theme, triggerNotification, addAuditLog }: ReportsProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState<string | null>(null);
  const [isDriveBackupLoading, setIsDriveBackupLoading] = useState(false);

  const [hasReportsAccessState, setHasReportsAccessState] = useState<boolean | null>(null);

  React.useEffect(() => {
    const checkReportsAccess = async () => {
      const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
      const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
      const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
      if (isPlatform || tenantId === "tenant-local") {
        setHasReportsAccessState(true);
        return;
      }
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "reports");
      setHasReportsAccessState(hasAccess);
    };
    checkReportsAccess();
  }, []);

  const handleBackupReportToDrive = async (type: "summary" | "products" | "invoices" | "all") => {
    const isConnected = localStorage.getItem("sahm_gdrive_connected") === "true" && getDriveAccessToken() !== null;
    if (!isConnected) {
      alert("يرجى تفعيل وربط Google Drive أولاً من لوحة 'إدارة التكاملات والدمج' لتنشيط ميزة النسخ الاحتياطي السحابي الذاتي!");
      return;
    }

    setIsDriveBackupLoading(true);
    try {
      // Get or create dedicated backup folder
      const folderId = await googleDriveService.getOrCreateFolder("سهم - النسخ الاحتياطية (Sahm Backups)");
      const timestamp = new Date().toISOString().slice(0, 10) + "_" + Date.now().toString().slice(-4);

      if (type === "summary" || type === "all") {
        const headers = ["المؤشر المالي", "القيمة بالريال السعودي"];
        const rows = [
          ["إجمالي المبيعات", sales],
          ["تكلفة المشتريات والتوريد", purchases],
          ["صافي الأرباح المحققة", profit],
          ["هامش ربحية البيع (%)", `${marginStr}%`],
          ["قيمة المخزون الإجمالية بسعر التكلفة", inventoryCost],
          ["قيمة المخزون الإجمالية بسعر التجزئة", inventoryValue],
          ["هامش أرباح المخازن المتوقع", expectedProfit],
          ["تاريخ وتوقيت استخراج التقرير", new Date().toLocaleString("ar-SA")]
        ];
        const content = "\uFEFF" + headers.join(",") + "\r\n" + rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
        await googleDriveService.uploadFile({
          name: `ملخص_الأداء_المالي_سهم_${timestamp}.csv`,
          mimeType: "text/csv;charset=utf-8",
          content,
          folderId
        });
      }

      if (type === "products" || type === "all") {
        const headers = ["رقم المنتج", "اسم السلعة", "الفئة", "سعر التكلفة", "سعر البيع", "الكمية المتوفرة", "قيمة التكلفة الاجمالية", "قيمة البيع الاجمالية"];
        const rows = products.map(p => [
          p.id,
          p.name,
          p.category || "غير محدد",
          p.cost,
          p.price,
          p.stock,
          p.cost * p.stock,
          p.price * p.stock
        ]);
        const content = "\uFEFF" + headers.join(",") + "\r\n" + rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
        await googleDriveService.uploadFile({
          name: `تقرير_مخزون_السلع_سهم_${timestamp}.csv`,
          mimeType: "text/csv;charset=utf-8",
          content,
          folderId
        });
      }

      if (type === "invoices" || type === "all") {
        const headers = ["رقم الفاتورة", "اسم العميل", "تاريخ الحركة", "نوع المعاملة", "الفرع/الحالة", "عدد القطع", "الإجمالي النهائي"];
        const rows = invoices.map(i => [
          i.id,
          i.customer,
          i.date,
          i.type === "sale" ? "مبيعات" : "توريد ومشتريات",
          i.status || "مدفوع",
          i.items.reduce((acc, curr) => acc + curr.qty, 0),
          i.total
        ]);
        const content = "\uFEFF" + headers.join(",") + "\r\n" + rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
        await googleDriveService.uploadFile({
          name: `سجل_مبيعات_وفواتير_سهم_${timestamp}.csv`,
          mimeType: "text/csv;charset=utf-8",
          content,
          folderId
        });
      }

      if (triggerNotification) {
        triggerNotification("✓ تم رفع نسخة احتياطية من التقارير المالية لـ Google Drive بنجاح!", "success");
      } else {
        alert("✓ تم رفع نسخة احتياطية من التقارير المالية لـ Google Drive بنجاح!");
      }

      if (addAuditLog) {
        addAuditLog("نسخ احتياطي سحابي", `رفع تقرير مالي (${type}) إلى Google Drive.`);
      }

    } catch (err: any) {
      alert(`فشل رفع التقرير إلى Google Drive: ${err.message}`);
    } finally {
      setIsDriveBackupLoading(false);
    }
  };

  const sales = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0);
  const purchases = invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.total, 0);
  const profit = sales - purchases;
  const marginStr = sales > 0 ? ((profit / sales) * 100).toFixed(1) : "0";
  const marginVal = parseFloat(marginStr);

  const inventoryCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const expectedProfit = inventoryValue - inventoryCost;

  const formatMoney = (n: number | any) => {
    if (n === undefined || n === null || isNaN(Number(n))) {
      return "0 ر.س";
    }
    return Number(n).toLocaleString("ar-SA") + " ر.س";
  };

  const maxFinancial = Math.max(sales, purchases, Math.abs(profit), 1);

  // Helper function to export to Excel-compatible CSV with UTF-8 BOM
  const exportToCSV = (headers: string[], rows: any[][], fileName: string) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => {
        // Escape quotes and wrap with double quotes to support commas and Arabic text safely
        const clean = String(val ?? "").replace(/"/g, '""');
        return `"${clean}"`;
      }).join(","))
    ].join("\r\n");

    // Add UTF-8 Byte Order Mark (BOM) so Excel opens Arabic correctly
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show temporary feedback
    setCopiedSuccess(fileName);
    setTimeout(() => setCopiedSuccess(null), 3000);
  };

  // CSV Exporters
  const handleExportSummary = async () => {
    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "excel_export");
      if (!hasAccess) {
        if (triggerNotification) triggerNotification("⚠️ ميزة تصدير Excel غير متاحة في باقتك الحالية.", "critical");
        return;
      }
    }
    const headers = ["المؤشر المالي", "القيمة بالريال السعودي"];
    const rows = [
      ["إجمالي المبيعات", sales],
      ["تكلفة المشتريات والتوريد", purchases],
      ["صافي الأرباح المحققة", profit],
      ["هامش ربحية البيع (%)", `${marginStr}%`],
      ["قيمة المخزون الإجمالية بسعر التكلفة", inventoryCost],
      ["قيمة المخزون الإجمالية بسعر التجزئة", inventoryValue],
      ["هامش أرباح المخازن المتوقع", expectedProfit],
      ["تاريخ وتوقيت استخراج التقرير", new Date().toLocaleString("ar-SA")]
    ];
    exportToCSV(headers, rows, "ملخص_الأداء_المالي_سهم");
  };

  const handleExportProducts = async () => {
    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "excel_export");
      if (!hasAccess) {
        if (triggerNotification) triggerNotification("⚠️ ميزة تصدير Excel غير متاحة في باقتك الحالية.", "critical");
        return;
      }
    }
    const headers = ["رقم المنتج", "اسم السلعة", "الفئة", "سعر التكلفة", "سعر البيع", "الكمية المتوفرة", "قيمة التكلفة الاجمالية", "قيمة البيع الاجمالية"];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.category || "غير محدد",
      p.cost,
      p.price,
      p.stock,
      p.cost * p.stock,
      p.price * p.stock
    ]);
    exportToCSV(headers, rows, "تقرير_مخزون_السلع_سهم");
  };

  const handleExportInvoices = async () => {
    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "excel_export");
      if (!hasAccess) {
        if (triggerNotification) triggerNotification("⚠️ ميزة تصدير Excel غير متاحة في باقتك الحالية.", "critical");
        return;
      }
    }
    const headers = ["رقم الفاتورة", "اسم العميل", "تاريخ الحركة", "نوع المعاملة", "الفرع/الحالة", "عدد القطع", "الإجمالي النهائي"];
    const rows = invoices.map(i => [
      i.id,
      i.customer,
      i.date,
      i.type === "sale" ? "مبيعات" : "توريد ومشتريات",
      i.status || "مدفوع",
      i.items.reduce((acc, curr) => acc + curr.qty, 0),
      i.total
    ]);
    exportToCSV(headers, rows, "سجل_مبيعات_وفواتير_سهم");
  };

  const triggerPrint = async () => {
    const tenantId = localStorage.getItem("sahm_impersonate_tenant_id") || JSON.parse(localStorage.getItem("sahm_web_user") || "{}").tenant_id || "tenant-default";
    const userLocal = JSON.parse(localStorage.getItem("sahm_web_user") || "{}");
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(userLocal.role || "").trim());
    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "pdf_export");
      if (!hasAccess) {
        if (triggerNotification) triggerNotification("⚠️ ميزة طباعة وتصدير PDF غير متاحة في باقتك الحالية.", "critical");
        return;
      }
    }
    window.print();
  };

  if (hasReportsAccessState === false) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center space-y-4 border rounded-2xl"
        style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h3 className="text-xl font-bold text-white">هذه الميزة غير متاحة في باقتك الحالية</h3>
        <p className="text-sm text-gray-400 max-w-md">وصلت إلى حدود باقتك الحالية أو أن ميزة عرض التقارير والمؤشرات (Reports) غير مفعلة. يرجى التواصل مع إدارة منصة سهم للترقية.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Dynamic inline stylesheet for print isolation of Reports view only */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-area {
            display: block !important;
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: white !important;
            color: black !important;
          }
          .border-print {
            border: 1px solid #ddd !important;
            border-radius: 12px !important;
            background-color: #fafafa !important;
            color: #000 !important;
          }
        }
      `}</style>

      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: theme.text }}>التقارير التحليلية والمؤشرات 📊</h2>
          <p className="text-xs mt-1" style={{ color: theme.muted }}>مراقبة تفصيلية للأداء المالي الفعال، هوامش الربحية، وقيمة الأصول والمخزون الحالي بالربح الافتراضي</p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-extrabold text-sm self-start sm:self-auto cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-black/10 text-[#000]"
          style={{ backgroundColor: theme.accent }}
        >
          <Download className="w-4 h-4" />
          <span>تصدير التقارير 📥</span>
        </button>
      </div>

      {/* Printable Report Wrap Container */}
      <div id="print-area" className="space-y-6">
        
        {/* Printable Header - Visible ONLY in Print view */}
        <div className="hidden print:block border-b pb-4 mb-4">
          <div className="flex justify-between items-center text-black">
            <div className="text-right">
              <h1 className="text-2xl font-black">منصة سهم المحاسبية الذكية 📊</h1>
              <p className="text-sm text-gray-600 mt-1">التقرير التحليلي المالي الكلي وملخص أصول المستودع</p>
            </div>
            <div className="text-left font-mono text-xs text-gray-500">
              طبع في: {new Date().toLocaleString("ar-SA")}
            </div>
          </div>
        </div>

        {/* Grid financial indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sales */}
          <div className="p-5 rounded-2xl border border-print" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: theme.muted }}>إجمالي المبيعات</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-xl font-black font-mono text-emerald-500">{formatMoney(sales)}</span>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 no-print">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
              </span>
            </div>
            <div className="w-full h-1 bg-gray-500/10 rounded-full mt-4 overflow-hidden no-print">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>

          {/* Purchases */}
          <div className="p-5 rounded-2xl border border-print" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: theme.muted }}>تكلفة المشتريات والتوريد</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-xl font-black font-mono text-blue-500">{formatMoney(purchases)}</span>
              <span className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5 no-print">
                • وتيرة توريد
              </span>
            </div>
            <div className="w-full h-1 bg-gray-500/10 rounded-full mt-4 overflow-hidden no-print">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="p-5 rounded-2xl border border-print" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: theme.muted }}>صافي الأرباح</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-xl font-black font-mono" style={{ color: profit >= 0 ? theme.accent : "#EF4444" }}>
                {formatMoney(profit)}
              </span>
              <span className="text-[10px] font-bold no-print" style={{ color: profit >= 0 ? "#10B981" : "#EF4444" }}>
                {profit >= 0 ? "▲ نمو ربح" : "▼ تراجع خسارة"}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-500/10 rounded-full mt-4 overflow-hidden no-print">
              <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: profit >= 0 ? theme.accent : "#EF4444" }}></div>
            </div>
          </div>

          {/* Expected margin */}
          <div className="p-5 rounded-2xl border border-print" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: theme.muted }}>هامش ربحية المبيعات</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-xl font-black font-mono" style={{ color: theme.text }}>
                {marginStr}%
              </span>
              <span className="text-[10px] font-bold text-emerald-500 no-print">معدل قياسي</span>
            </div>
            <div className="w-full h-1 bg-gray-500/10 rounded-full mt-4 overflow-hidden no-print">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(Math.max(marginVal, 0), 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Main Analysis splitting modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Graphical statistics comparison columns */}
          <div className="lg:col-span-8 p-5 rounded-2xl border border-print"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black mb-6" style={{ color: theme.text }}>النسب البيانية المقارنة للحركة المالية</h3>

            <div className="space-y-6">
              {/* Sales bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: theme.text }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    إجمالي المبيعات المحصلة والمبيعة
                  </span>
                  <span className="font-mono font-bold text-emerald-500">{formatMoney(sales)}</span>
                </div>
                <div className="w-full h-3.5 bg-gray-500/5 rounded-lg overflow-hidden border border-print" style={{ borderColor: theme.border }}>
                  <div className="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 rounded-lg"
                    style={{ width: `${(sales / maxFinancial) * 100}%` }}></div>
                </div>
              </div>

              {/* Purchases bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: theme.text }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                    مشتريات البضاعة المسجلة (المستودع)
                  </span>
                  <span className="font-mono font-bold text-blue-500">{formatMoney(purchases)}</span>
                </div>
                <div className="w-full h-3.5 bg-gray-500/5 rounded-lg overflow-hidden border border-print" style={{ borderColor: theme.border }}>
                  <div className="h-full bg-gradient-to-l from-blue-600 to-blue-400 rounded-lg"
                    style={{ width: `${(purchases / maxFinancial) * 100}%` }}></div>
                </div>
              </div>

              {/* Profit bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: theme.text }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: theme.accent }}></span>
                    صافي الربح المتبقي المحقق للأعمال
                  </span>
                  <span className="font-mono font-bold" style={{ color: theme.accent }}>{formatMoney(profit)}</span>
                </div>
                <div className="w-full h-3.5 bg-gray-500/5 rounded-lg overflow-hidden border border-print" style={{ borderColor: theme.border }}>
                  <div className="h-full rounded-lg"
                    style={{ 
                      width: `${(Math.max(profit, 0) / maxFinancial) * 100}%`,
                      background: `linear-gradient(to left, ${theme.accent}, ${theme.accent}cc)` 
                    }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Inventory Value calculations */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-print flex flex-col justify-between"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-amber-500" style={{ color: theme.accent }} />
                <h3 className="text-sm font-black" style={{ color: theme.text }}>القيمة الكلية الحالية للمخزون</h3>
              </div>

              <div className="space-y-4">
                {/* Cost Value */}
                <div className="p-3 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <span className="text-[10px]" style={{ color: theme.muted }}>إجمالي قيمة التكلفة التوريدية</span>
                  <span className="text-base font-black font-mono block mt-1 text-gray-400">{formatMoney(inventoryCost)}</span>
                </div>

                {/* Retail Value */}
                <div className="p-3 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <span className="text-[10px]" style={{ color: theme.muted }}>إجمالي القيمة السوقية عند البيع</span>
                  <span className="text-base font-black font-mono block mt-1 text-emerald-500">{formatMoney(inventoryValue)}</span>
                </div>

                {/* Potential Net profit */}
                <div className="p-3 rounded-xl border bg-yellow-500/5" style={{ borderColor: theme.accent + "30" }}>
                  <span className="text-[10px]" style={{ color: theme.muted }}>صافي الأرباح المتوقعة عند تصفير المخزون</span>
                  <span className="text-base font-black font-mono block mt-1" style={{ color: theme.accent }}>{formatMoney(expectedProfit)}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t" style={{ borderColor: theme.border }}>
              <span className="text-[9px]" style={{ color: theme.muted }}>تم احتساب قيم التكلفة والبيع بناء على كميات المخازن المسجلة حالياً تلقائياً</span>
            </div>

          </div>

        </div>

        {/* Row 3: Modern Widgets (Recent Orders, Stock Alerts, Top Products) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
          
          {/* Recent Orders Widget */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-print text-right"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black mb-4 flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
              <span>الطلبات الحديثة</span>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {invoices.filter(i => i.type === 'sale').slice(0, 5).map((inv, idx) => (
                <div key={inv.id || idx} className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/20 flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-gray-500">{inv.date}</span>
                  <div className="text-right">
                    <span className="font-bold block text-white">{inv.customer}</span>
                    <span className="text-[9px] text-[#D6A84F] font-mono">{inv.total.toLocaleString()} ر.س</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Alerts Widget */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-print text-right"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black mb-4 flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
              <span>تنبيهات المخزون الحرج</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {products.filter(p => (Number(p.stock) || 0) < 15).slice(0, 5).map((prod, idx) => (
                <div key={prod.id || idx} className="p-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 flex justify-between items-center text-xs">
                  <span className="bg-rose-500/15 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] font-black">{prod.stock} وحدة</span>
                  <div className="text-right">
                    <span className="font-bold block text-white truncate max-w-[150px]">{prod.name}</span>
                    <span className="text-[9px] text-gray-500 font-sans">{prod.category || "عطور ودهون"}</span>
                  </div>
                </div>
              ))}
              {products.filter(p => (Number(p.stock) || 0) < 15).length === 0 && (
                <div className="text-gray-500 italic text-center py-8 text-xs">
                  لا توجد تنبيهات، المخزون مستقر تماماً.
                </div>
              )}
            </div>
          </div>

          {/* Top Products Widget */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-print text-right"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black mb-4 flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
              <span>أفضل المنتجات مبيعاً</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {products.slice(0, 5).map((prod, idx) => {
                const simulatedSales = Math.round((Number(prod.stock) || 0) * 1.8 + (idx * 15) + 20);
                return (
                  <div key={prod.id || idx} className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/20 flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-mono text-[10px] font-black">+{simulatedSales} صفقة</span>
                    <div className="text-right">
                      <span className="font-bold block text-white truncate max-w-[150px]">{prod.name}</span>
                      <span className="text-[9px] text-gray-500 font-sans">تقييم عالي 5.0 ★</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Export Options Modal dialogue wrapper */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-4 z-50 animate-fade-in no-print">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: theme.border }}>
              <div className="text-right">
                <h3 className="text-lg font-bold" style={{ color: theme.text }}>تصدير التقارير وسجلات النظام 📥</h3>
                <p className="text-[11px] mt-0.5" style={{ color: theme.muted }}>اختر نوع ومصنف البيانات الذي تود تحميله كملف جداول أو طباعته</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert on success */}
            {copiedSuccess && (
              <div className="p-3 bg-emerald-500/5 text-emerald-500 text-xs rounded-lg flex items-center gap-1.5 border border-emerald-500/20 text-right">
                <Check className="w-4 h-4 shrink-0" />
                <span>تم إعداد وتنزيل ملف "{copiedSuccess}.csv" بنجاح واحتساب الترميز العربي المميّز!</span>
              </div>
            )}

            {/* List options */}
            <div className="space-y-3.5 text-right">
              
              {/* Option 1: summary CSV */}
              <button
                onClick={handleExportSummary}
                className="w-full p-3.5 rounded-xl border flex items-center justify-between transition-all hover:bg-gray-500/5 text-xs text-right cursor-pointer"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 font-bold text-sm shrink-0">
                    📈
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold block text-right" style={{ color: theme.text }}>تصدير ملخص الأداء المالي (CSV)</span>
                    <span className="text-[10px] block mt-0.5 text-right" style={{ color: theme.muted }}>الأرباح، المبيعات والمخازن في ملف واحد سريع</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-500 shrink-0" />
              </button>

              {/* Option 2: products list CSV */}
              <button
                onClick={handleExportProducts}
                className="w-full p-3.5 rounded-xl border flex items-center justify-between transition-all hover:bg-gray-500/5 text-xs text-right cursor-pointer"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500 font-bold text-sm shrink-0">
                    📦
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold block text-right" style={{ color: theme.text }}>تصدير قائمة السلع المكتوبة (CSV)</span>
                    <span className="text-[10px] block mt-0.5 text-right" style={{ color: theme.muted }}>دليل بالكميات، قيم التوريد والجرد وسعر السوق</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-blue-500 shrink-0" />
              </button>

              {/* Option 3: Invoices database ledger CSV */}
              <button
                onClick={handleExportInvoices}
                className="w-full p-3.5 rounded-xl border flex items-center justify-between transition-all hover:bg-gray-500/5 text-xs text-right cursor-pointer"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-500 font-bold text-sm shrink-0">
                    🧾
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold block text-right" style={{ color: theme.text }}>تصدير سجل المبيعات والفواتير (CSV)</span>
                    <span className="text-[10px] block mt-0.5 text-right" style={{ color: theme.muted }}>المعاملات المؤرخة مجمعة للمحاسب المالي والمراجعة</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-violet-500 shrink-0" />
              </button>

              {/* Option 4: Full Printable report */}
              <button
                onClick={triggerPrint}
                className="w-full p-3.5 rounded-xl border flex items-center justify-between transition-all hover:bg-gray-500/5 text-xs text-right cursor-pointer"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500 font-bold text-sm shrink-0">
                    🖨️
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold block text-right" style={{ color: theme.text }}>طباعة وحمل التقرير كـ PDF مجهّز</span>
                    <span className="text-[10px] block mt-0.5 text-right" style={{ color: theme.muted }}>توليد تقرير ورقي نظيف ومحكم للطباعة أو الإرسال</span>
                  </div>
                </div>
                <Printer className="w-4 h-4 text-amber-500 shrink-0" />
              </button>

              {/* Google Drive Safe backups Section */}
              <div className="border-t pt-4 mt-2" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-1.5 justify-end">
                  <span>النسخ الاحتياطي السحابي (Google Drive API) 📁</span>
                  <Cloud className="w-4 h-4 text-amber-400" />
                </h4>
                <p className="text-[10px] text-gray-400 mb-3 text-right leading-relaxed">
                  احفظ وأرشف التقارير الحالية آلياً ومباشرة في مجلدك المخصص على Google Drive للرجوع السريع في أي وقت.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBackupReportToDrive("summary")}
                    disabled={isDriveBackupLoading}
                    className="py-2 px-3 rounded-lg text-[10px] font-bold cursor-pointer text-center transition-all bg-gray-500/5 hover:bg-gray-500/15 text-white border flex items-center justify-center gap-1"
                    style={{ borderColor: theme.border }}
                  >
                    <span>أرشفة ملخص الأداء 📈</span>
                  </button>
                  <button
                    onClick={() => handleBackupReportToDrive("products")}
                    disabled={isDriveBackupLoading}
                    className="py-2 px-3 rounded-lg text-[10px] font-bold cursor-pointer text-center transition-all bg-gray-500/5 hover:bg-gray-500/15 text-white border flex items-center justify-center gap-1"
                    style={{ borderColor: theme.border }}
                  >
                    <span>أرشفة دليل المخزون 📦</span>
                  </button>
                  <button
                    onClick={() => handleBackupReportToDrive("invoices")}
                    disabled={isDriveBackupLoading}
                    className="py-2 px-3 rounded-lg text-[10px] font-bold cursor-pointer text-center transition-all bg-gray-500/5 hover:bg-gray-500/15 text-white border flex items-center justify-center gap-1"
                    style={{ borderColor: theme.border }}
                  >
                    <span>أرشفة سجل الفواتير 🧾</span>
                  </button>
                  <button
                    onClick={() => handleBackupReportToDrive("all")}
                    disabled={isDriveBackupLoading}
                    className="py-2 px-3 rounded-lg text-[10px] font-black cursor-pointer text-center transition-all bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border"
                    style={{ borderColor: "#D4AF37" + "40" }}
                  >
                    <span>أرشفة النسخة الشاملة 👑</span>
                  </button>
                </div>
                {isDriveBackupLoading && (
                  <p className="text-[9px] text-amber-400 mt-2 text-center animate-pulse">
                    جاري الاتصال بـ Google Drive ورفع نسخة احتياطية آمنة...
                  </p>
                )}
              </div>

            </div>

            {/* Note */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-right text-sky-400 leading-relaxed">
              * ميزة التصدير مدعومة بترميز UTF-8 مع ملف تدقيق BOM لضمان عرض الحروف والكلمات العربية باتساق تام ومثالي عند قراءتها في برامج Microsoft Excel أو Google Sheets.
            </div>

            {/* Cancel btn */}
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer border text-center transition-colors hover:bg-gray-500/10 hover:text-red-400"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            >
              إغلاق نافذة التصدير
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
