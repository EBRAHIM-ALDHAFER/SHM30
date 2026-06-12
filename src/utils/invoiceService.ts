import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Invoice } from "../types";
import { POSSettings } from "../core/database/posService";

export interface CompanyInfo {
  name: string;
  crNumber: string; // سجل تجاري
  taxNumber: string; // الرقم الضريبي
  phone: string;
  address: string;
}

// Helper to reverse Arabic words individually for standard jsPDF Western rendering compatibility if needed, or draw clean bilingual indicators
export function formatArabicForPdf(text: string): string {
  if (!text) return "";
  // Simple check if text contains Arabic. If so, we can offer bilingual translations or clean representation
  return text;
}

// Generates an elegant PDF document natively via HTML and html2canvas to achieve flawless Arabic shaping and RTL support
export async function generateInvoicePDFBlob(
  invoice: Invoice,
  settings: POSSettings,
  company: CompanyInfo
): Promise<Blob> {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  const template = settings.invoiceTemplate || "حراري - 80مم";
  const isThermal = template === "حراري - 80مم";
  container.style.width = isThermal ? "380px" : "800px";
  container.style.zIndex = "-9999";
  
  container.innerHTML = generateInvoiceHTML(invoice, settings, company);
  document.body.appendChild(container);
  
  // Wait to ensure rendering completes
  await new Promise((resolve) => setTimeout(resolve, 350));
  
  const canvas = await html2canvas(container, {
    scale: 2.0,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff"
  });
  
  document.body.removeChild(container);
  
  const imgData = canvas.toDataURL("image/jpeg", 0.98);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
  
  return pdf.output("blob");
}

export async function exportInvoiceToPDF(
  invoice: Invoice,
  settings: POSSettings,
  company: CompanyInfo,
  triggerNotification?: (text: string, type?: any) => void
): Promise<boolean> {
  try {
    if (triggerNotification) {
      triggerNotification("⏳ جاري تكوين وتصدير الفاتورة باللغة العربية الرسمية...", "info");
    }

    const pdfBlob = await generateInvoicePDFBlob(invoice, settings, company);
    const url = URL.createObjectURL(pdfBlob);
    
    // Download the PDF
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", `invoice-${invoice.id}.pdf`);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    
    if (triggerNotification) {
      triggerNotification(`🟢 تم تصدير وتحميل ملف الفاتورة المعتمدة بنجاح! invoice-${invoice.id}.pdf`, "success");
    }
    return true;
  } catch (error: any) {
    console.error("PDF generator exception captured:", error);
    if (triggerNotification) {
      triggerNotification("❌ تعذر إصدار وتكوين ملف PDF، يرجى المحاولة لاحقاً.", "error");
    }
    return false;
  }
}


// Generates a beautiful HTML for the print window representing the invoice, accommodating all 5 requested templates
export function generateInvoiceHTML(
  invoice: Invoice,
  settings: POSSettings,
  company: CompanyInfo
): string {
  const primaryColor = settings.invoicePrimaryColor || "#D4AF37";
  const showQr = settings.showQrCode !== false;
  const showTax = settings.showTaxNumber !== false;
  const showAddress = settings.showNationalAddress === true;
  const thankYou = settings.customThankYouText || "شكراً لتسوقكم من فروعنا!";
  const couponCode = settings.optionalDiscountCode || "";

  // Calculating tax elements (assumed included 15% VAT)
  const subTotal = (invoice.total / 1.15);
  const vatAmount = invoice.total - subTotal;

  // Render QR Code via api.qrserver.com
  const qrInvoiceData = `https://sahm-erp.com/verify-invoice?id=${invoice.id}&total=${invoice.total}&vat=${vatAmount.toFixed(2)}&date=${encodeURIComponent(invoice.date)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrInvoiceData)}&color=000000&bgcolor=ffffff`;

  // Determine design template stylesheets and layouts
  const template = settings.invoiceTemplate || "حراري - 80مم";
  let bodyClass = "bg-[#f8fafc] text-slate-800 font-sans cursor-default min-h-screen p-4 sm:p-6";
  let containerStyle = "max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl relative";
  let headerHTML = "";
  let footerHTML = "";
  let tableHeaderClass = "bg-slate-50 text-slate-700 font-bold border-b border-slate-200";
  let tableRowClass = "border-b border-slate-105 hover:bg-slate-50/50 transition-colors";
  let customStyles = "";

  if (template === "فاخر ذهبي") {
    bodyClass = "bg-[#0b0c10] text-neutral-100 font-sans p-4 sm:p-8 min-h-screen flex flex-col justify-center items-center";
    containerStyle = "max-w-xl w-full bg-[#111217] p-8 sm:p-10 rounded-3xl border-2 border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative text-right overflow-hidden";
    tableHeaderClass = "bg-[#1f2026] text-[#D4AF37] font-black border-b border-[#D4AF37]/30";
    tableRowClass = "border-b border-[#D4AF37]/10 hover:bg-[#1a1b22] transition-colors";
    
    // Luxury custom background style
    customStyles = `
      #invoice-doc::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 6px;
        background: linear-gradient(90deg, #b89733, #f3e19c, #d4af37, #b89733);
      }
      .luxury-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent);
      }
    `;

    headerHTML = `
      <div class="text-center space-y-4 pb-6 border-b border-[#D4AF37]/20 relative">
        <div class="absolute top-0 right-0 left-0 flex justify-center opacity-10">
          <span class="text-9xl font-serif">⚜</span>
        </div>
        ${settings.invoiceLogoUrl ? `<img src="${settings.invoiceLogoUrl}" class="mx-auto h-24 w-auto object-contain rounded-2xl mb-2 border border-[#D4AF37]/30 p-1 bg-[#1a1b22]" />` : `
        <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-[#8a6f27] to-[#e4c975] flex items-center justify-center text-neutral-950 text-3xl font-black mb-3 shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse">⚜</div>`}
        <h1 class="text-lg font-black tracking-widest text-[#D4AF37] uppercase font-serif">${company.name}</h1>
        <p class="text-xs text-[#D4AF37]/75 font-medium tracking-wide">مَعْرَضْ صِيَاغَةُ الرَّوَائِحِ الفَاخِرَةُ وَالعُودْ المَلَكِي</p>
        <div class="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-xs text-[#e4c975] font-bold px-4 py-1.5 rounded-full border border-[#D4AF37]/35 shadow-inner">
          <span class="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
          <span>فاتورة صفقات عطرية متميزة</span>
        </div>
      </div>
    `;
    
    footerHTML = `
      <div class="mt-8 pt-6 border-t border-[#D4AF37]/20 text-center space-y-5">
        <div class="luxury-divider"></div>
        <p class="text-sm font-bold text-[#D4AF37] tracking-wider italic font-serif">✨ ${thankYou} ✨</p>
        ${couponCode ? `
        <div class="bg-gradient-to-b from-[#1a1b22] to-[#121319] border border-dashed border-[#D4AF37]/30 p-5 rounded-2xl max-w-sm mx-auto shadow-inner relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-xl"></div>
          <span class="text-[10px] text-[#e4c975] block font-bold mb-1.5 tracking-widest uppercase">🎁 قسيمة العود والنفحات الذهبية لزيارتكم القادمة:</span>
          <span class="text-lg font-black text-[#D4AF37] tracking-widest font-mono select-all">[ ${couponCode} ]</span>
          <span class="block text-[8px] text-neutral-400 mt-1">تمنحكم خصم خاص عند الدفع في أي معرض محلي بمملكتنا</span>
        </div>` : ""}
      </div>
    `;
  } else if (template === "حديث بسيط") {
    bodyClass = "bg-[#f3f4f6] text-slate-800 font-sans p-4 sm:p-6 min-h-screen flex items-center justify-center";
    containerStyle = "max-w-xl w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-right relative";
    tableHeaderClass = "bg-slate-50 text-slate-500 font-semibold border-b border-slate-100";
    tableRowClass = "border-b border-slate-50 hover:bg-slate-50/50 transition-colors";

    customStyles = `
      #invoice-doc::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 4px;
        background-color: #3b82f6;
      }
    `;

    headerHTML = `
      <div class="flex justify-between items-start pb-6 border-b border-slate-100">
        <div class="space-y-1.5">
          <h1 class="text-lg font-black text-slate-900">${company.name}</h1>
          <p class="text-xs text-slate-400 font-medium">فاتورة ضريبية مبسطة معتمدة</p>
        </div>
        ${settings.invoiceLogoUrl ? `<img src="${settings.invoiceLogoUrl}" class="h-14 w-auto object-contain rounded-xl p-0.5 border border-slate-100" />` : `
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-sm text-lg">💡</div>`}
      </div>
    `;
    
    footerHTML = `
      <div class="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
        <span class="text-xs font-semibold text-slate-700 block">${thankYou}</span>
        ${couponCode ? `<p class="text-[10px] text-slate-400">بروموكود الزيارة القادمة: <b class="font-mono text-slate-900 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-xs select-all">${couponCode}</b></p>` : ""}
      </div>
    `;
  } else if (template === "تسويقي") {
    bodyClass = "bg-[#faf8f5] text-[#1e3a2f] font-sans p-4 sm:p-6 min-h-screen flex items-center justify-center";
    containerStyle = "max-w-xl w-full bg-white p-8 rounded-3xl border-2 border-emerald-900/10 shadow-xl text-right relative";
    tableHeaderClass = "bg-[#f1fcf6] text-emerald-800 font-bold border-b border-emerald-100";
    tableRowClass = "border-b border-emerald-50/50 hover:bg-[#fcfdfc] transition-colors";

    customStyles = `
      #invoice-doc::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 5px;
        background: linear-gradient(90deg, #10b981, #059669);
      }
    `;

    headerHTML = `
      <div class="text-center space-y-3 pb-6 border-b border-emerald-100/80 relative">
        <div class="text-3xl block filter drop-shadow">🌸🛍️✨</div>
        <h1 class="text-base font-black text-emerald-950">${company.name}</h1>
        <p class="text-xs text-emerald-700 font-medium leading-relaxed max-w-xs mx-auto">روائح من الطبيعة تجلب البهجة، ونسعد بمشاركتكم اللحظات والشغف العريض!</p>
        <div class="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-full shadow-sm">سند شراء معتمد عالي الجودة</div>
      </div>
    `;
    
    footerHTML = `
      <div class="mt-8 pt-6 border-t border-dashed border-emerald-100 text-center space-y-5">
        <div class="p-5 rounded-2xl bg-gradient-to-br from-[#f8fdf9] to-[#f3fbf6] border-2 border-dashed border-emerald-500/25 text-center space-y-3 shadow-inner relative">
          <div class="absolute -top-3 left-4 bg-emerald-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <span>✂️ كود الهدايا والمفاجآت</span>
          </div>
          <span class="text-xs font-black text-emerald-950 block">🎉 هدية خاصة وتقدير متميز:</span>
          <p class="text-[10px] text-slate-500 leading-relaxed">يسرنا تقديم كود ترويجي بخصم مميز كتقدير لثقتكم الغالية بنا. شارك عائلتك الرائحة العطرية الأنيقة قريباً ونلقاك لتسوق دائم!</p>
          <span class="inline-block px-5 py-2 rounded-xl bg-amber-400/20 text-amber-800 font-extrabold text-sm tracking-widest font-mono border border-amber-400/30 shadow-sm select-all">${couponCode || "SAHM2026"}</span>
        </div>
        <p class="text-xs font-semibold text-emerald-900">${thankYou}</p>
      </div>
    `;
  } else if (template === "A4 رسمي") {
    bodyClass = "bg-slate-100 text-slate-800 font-sans p-6 sm:p-12 min-h-screen flex items-center justify-center";
    containerStyle = "max-w-4xl w-full bg-white p-10 shadow-2xl border border-slate-200 text-right min-h-[1100px] flex flex-col justify-between relative";
    tableHeaderClass = "bg-slate-100 text-slate-800 font-black border-b-2 border-slate-900";
    tableRowClass = "border-b border-slate-200 hover:bg-slate-50 transition-colors";

    customStyles = `
      #invoice-doc {
        border-top: 8px solid #0f172a;
      }
    `;

    headerHTML = `
      <div class="grid grid-cols-2 pb-6 border-b-2 border-slate-900/60 items-center justify-between">
        <div class="space-y-2 text-right">
          <h1 class="text-xl font-black text-slate-900 tracking-tight">${company.name}</h1>
          <p class="text-xs text-slate-500 leading-normal font-semibold">Simplified Tax Invoice | فاتورة مبيعات ضريبية مبسطة معتمدة</p>
          <span class="text-[10px] text-slate-400 block leading-relaxed max-w-sm">مرجع الفرز والربط الوطني السحابي ومقيدة آلياً لدى هيئة الزكاة والجمارك الضريبية ZATCA</span>
        </div>
        <div class="text-left flex flex-col items-end">
          ${settings.invoiceLogoUrl ? `<img src="${settings.invoiceLogoUrl}" class="h-20 w-auto object-contain rounded-xl p-1 border border-slate-100 mb-2 b bg-white" />` : `
          <div class="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">سهم</div>`}
        </div>
      </div>
    `;
    
    footerHTML = `
      <div class="mt-16 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
        <p class="font-bold text-slate-800 text-sm mb-1">${thankYou}</p>
        <p class="text-[10px]">هذه فاتورة ضريبية منشأة وموثقة آلياً بقيد الربط السحابي الموحد "سهم سحاب" ولا تتطلب توقيعاً خطياً.</p>
        <p class="text-[9px] text-slate-300 font-mono">SAHM CLOUD OS • LICENSE #9887-2026-VAT</p>
      </div>
    `;
  } else {
    // Standard ISO Thermal 80mm Receipt (Default styling with gorgeous print layout)
    bodyClass = "bg-[#eceef2] text-zinc-900 font-mono p-2 flex justify-center items-center min-h-screen";
    containerStyle = "max-w-[340px] w-full p-4 text-right bg-white shadow-lg rounded-xl border border-zinc-200 relative overflow-hidden";
    tableHeaderClass = "border-b-2 border-dashed border-zinc-800 text-zinc-900 font-black py-1.5";
    tableRowClass = "border-b border-dashed border-zinc-100 py-1";

    customStyles = `
      #invoice-doc {
        border-top: 4px dashed #333333;
      }
    `;

    headerHTML = `
      <div class="text-center space-y-1.5 pb-3 border-b border-dashed border-zinc-300">
        ${settings.invoiceLogoUrl ? `<img src="${settings.invoiceLogoUrl}" class="mx-auto h-16 w-auto object-contain mb-2 rounded p-0.5 bg-neutral-50" />` : ""}
        <span class="font-black text-sm text-zinc-950 block tracking-tight">${company.name}</span>
        <span class="text-[10px] text-zinc-500 font-bold block bg-zinc-50 py-1 rounded-md px-2 max-w-max mx-auto font-sans">فاتورة تبسيطية - إيصال بيع سريع</span>
      </div>
    `;
    
    footerHTML = `
      <div class="mt-6 pt-4 border-t border-dashed border-zinc-200 text-center text-[10px] text-zinc-650 space-y-2 font-sans">
        <span class="font-bold block text-zinc-900">${thankYou}</span>
        ${couponCode ? `
        <div class="bg-zinc-50 border border-dashed border-zinc-300 p-2.5 rounded-lg text-center font-mono text-[9px]">
          <span class="block text-[8px] opacity-75">سند الرمز الترويجي للزيارة القادمة:</span>
          <b class="text-zinc-800 text-[10px] block mt-0.5 select-all">[ ${couponCode} ]</b>
        </div>` : ""}
      </div>
    `;
  }

  // Render uniform table item rows with pristine typography matching template
  const itemRows = invoice.items.map((item, idx) => {
    const itemPriceWithVat = item.price; 
    const itemSubtotalWithVat = item.total;
    return `
      <tr class="${tableRowClass}">
        <td class="text-right p-3.5 font-bold text-slate-800 ${template === "فاخر ذهبي" ? "text-neutral-200" : ""}">${item.name}</td>
        <td class="text-center p-3.5 font-mono ${template === "فاخر ذهبي" ? "text-[#D4AF37]" : "text-slate-600"}">${item.qty}</td>
        <td class="text-left p-3.5 font-mono ${template === "فاخر ذهبي" ? "text-neutral-300" : "text-slate-500"}">${itemPriceWithVat.toFixed(2)} ر.س</td>
        <td class="text-left p-3.5 font-mono font-black ${template === "فاخر ذهبي" ? "text-[#D4AF37]" : "text-slate-900"}">${itemSubtotalWithVat.toFixed(2)} ر.س</td>
      </tr>
    `;
  }).join("");

  // Build the complete structural HTML page
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة مبيعات - رقم ${invoice.id}</title>
      <!-- Tailwind CSS CDN for instant robust compilation inside popups -->
      <script src="https://cdn.tailwindcss.com"></script>
      <!-- Cairo custom elegant Arabic font and digital/serif fonts -->
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        }
        ${customStyles}
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
        }
      </style>
    </head>
    <body class="${bodyClass}">
      
      <!-- Top actions bar invisible during printing -->
      <div class="no-print max-w-2xl mx-auto mb-6 bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-right shadow-2xl border border-slate-800">
        <div>
          <span class="font-black text-sm sm:text-base text-amber-500 block">بوابة طباعة وتصدير الفواتير الرسمية من سهم 🖨️</span>
          <span class="text-[10.5px] text-slate-350 block mt-0.5">لحفظ الفاتورة بصيغة PDF؛ اختر (Save as PDF) من وجهات الطباعة لتخزين النسخة الرقمية المعتمدة.</span>
        </div>
        <button onclick="window.print()" class="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 shadow-lg shadow-amber-500/10">
          <span>طباعة الفاتورة 📄</span>
        </button>
      </div>

      <!-- Main Invoice Document Frame -->
      <div class="${containerStyle} print-full-width" id="invoice-doc">
        
        <!-- Header Section -->
        ${headerHTML}

        <!-- Invoice Meta Details Block -->
        <div class="mt-6 grid grid-cols-2 gap-4 text-xs pb-5 border-b ${template === "فاخر ذهبي" ? "border-[#D4AF37]/20 text-neutral-300" : "border-slate-100 text-slate-600"}">
          <div class="space-y-1.5 text-right">
            <div><span class="${template === "فاخر ذهبي" ? "text-neutral-450" : "text-slate-400"}">رقم الفاتورة:</span> <span class="font-bold font-mono ${template === "فاخر ذهبي" ? "text-neutral-100" : "text-slate-900"}">${invoice.id}</span></div>
            <div><span class="${template === "فاخر ذهبي" ? "text-neutral-450" : "text-slate-400"}">تاريخ الصفقة:</span> <span class="font-bold font-mono ${template === "فاخر ذهبي" ? "text-neutral-105" : "text-slate-900"}">${invoice.date}</span></div>
            <div><span class="${template === "فاخر ذهبي" ? "text-neutral-450" : "text-slate-400"}">العميل المعتمد:</span> <span class="font-black ${template === "فاخر ذهبي" ? "text-[#D4AF37]" : "text-slate-950"}">${invoice.customer || "عميل طيب رائع"}</span></div>
          </div>
          <div class="space-y-1.5 text-left flex flex-col items-end">
            ${showTax ? `<div><span class="${template === "فاخر ذهبي" ? "text-neutral-450" : "text-slate-400"}">الرقم الضريبي للمتجر:</span> <span class="font-bold font-mono ${template === "فاخر ذهبي" ? "text-[#D4AF37]" : "text-slate-900"}">${company.taxNumber}</span></div>` : ""}
            <div><span class="${template === "فاخر ذهبي" ? "text-neutral-450" : "text-slate-400"}">سجل السلعة المالي:</span> <span class="font-bold font-mono ${template === "فاخر ذهبي" ? "text-neutral-100" : "text-slate-900"}">${company.crNumber}</span></div>
            ${showAddress ? `<div><span class="${template === "فاخر ذهبي" ? "text-neutral-450" : "text-slate-400"}">العنوان الوطني الموحد:</span> <span class="font-bold text-[10px] leading-snug block ${template === "فاخر ذهبي" ? "text-neutral-200" : "text-slate-800"}">${company.address}</span></div>` : ""}
          </div>
        </div>

        <!-- Order Items Detail Table -->
        <div class="mt-6 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="${tableHeaderClass}">
                <th class="text-right p-3.5 font-bold rounded-r-xl">السلعة / المنتج</th>
                <th class="text-center p-3.5 font-bold">الكمية</th>
                <th class="text-left p-3.5 font-bold">سعر المفرد</th>
                <th class="text-left p-3.5 font-bold rounded-l-xl">الإجمالي شامل الضريبة</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </div>

        <!-- Calculations and QR Code Block -->
        <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-6 pt-5 border-t ${template === "فاخر ذهبي" ? "border-[#D4AF37]/20" : "border-slate-100"}">
          
          <!-- Column 1: ZATCA compliant dynamic QR Code -->
          ${showQr ? `
          <div class="text-center space-y-1.5 shrink-0 p-2 bg-white border ${template === "فاخر ذهبي" ? "border-[#D4AF37]/30 bg-neutral-900 text-white" : "border-slate-200 text-slate-700"} rounded-2xl shadow-sm">
            <img src="${qrCodeUrl}" alt="رمز الفاتورة الضريبية" class="w-24 h-24 mx-auto object-contain rounded-lg shadow-inner" referrerPolicy="no-referrer" />
            <span class="text-[7.5px] font-bold text-slate-450 uppercase font-mono tracking-widest block">ZATCA VERIFIED SYSTEM</span>
            <p class="text-[7.5px] text-emerald-600 font-extrabold leading-none pb-0.5">✓ معتمدة من البوابة الوطنية ومصن في سهم</p>
          </div>` : `<div></div>`}

          <!-- Column 2: Total Summaries -->
          <div class="w-full md:w-72 space-y-2 text-xs p-4 rounded-2xl border ${template === "فاخر ذهبي" ? "bg-neutral-950/50 border-[#D4AF37]/20 text-neutral-300" : "bg-slate-50/60 border-slate-100 text-slate-600"}">
            <div class="flex justify-between">
              <span>المجموع الفرعي (قبل الضريبة):</span>
              <span class="font-mono font-bold">${subTotal.toFixed(2)} ر.س</span>
            </div>
            <div class="flex justify-between opacity-80">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span class="font-mono font-bold">${vatAmount.toFixed(2)} ر.س</span>
            </div>
            <div class="flex justify-between font-black text-base border-t pt-2 mt-2 ${template === "فاخر ذهبي" ? "border-[#D4AF37]/30 text-[#D4AF37]" : "border-slate-200 text-slate-950"}">
              <span>الإجمالي المدفوع:</span>
              <span class="font-mono" style="color: ${template === "فاخر ذهبي" ? "#D4AF37" : primaryColor}">${invoice.total.toFixed(2)} ر.س</span>
            </div>
          </div>

        </div>

        <!-- Custom templates dynamic footers -->
        ${footerHTML}

        <!-- Contact channels metadata -->
        <div class="mt-8 pt-5 border-t ${template === "فاخر ذهبي" ? "border-[#D4AF37]/10 text-neutral-550" : "border-slate-150 text-slate-400"} text-center text-[10px] space-y-1 font-sans">
          <div>مراسيم الطيب • سهم سحابي للربط التسويقي والتقييد المالي</div>
          <div>هاتف الدعم الموحد: ${company.phone} | ${invoice.id}-SAHM-ERP-V9</div>
        </div>

      </div>

    </body>
    </html>
  `;
}

// Generates a local PDF and invokes Web Share API if available to send to whatsapp, otherwise triggers simple download and redirects
export async function runInvoiceShareWhatsApp(
  invoice: Invoice,
  settings: POSSettings,
  company: CompanyInfo,
  triggerNotification: (text: string, type?: any) => void
) {
  try {
    triggerNotification("⏳ جاري إنشاء ملف الفاتورة PDF باللغة العربية...", "info");
    
    const pdfBlob = await generateInvoicePDFBlob(invoice, settings, company);
    const pdfFile = new File([pdfBlob], `invoice-${invoice.id}.pdf`, { type: "application/pdf" });
    
    const textMessage = `مرحباً بك عميلنا العزيز من مراسيم الطيب! 🌸✨\n\nتجدون بالأسفل فاتورة الشراء الرقمية المرتبطة بطلبكم:\n📌 رقم الفاتورة: ${invoice.id}\n📍 تاريخ الصفقة: ${invoice.date}\n💰 الإجمالي المدفوع: ${invoice.total} ر.س\n\nحمل نسختك بصيغة PDF وأعد إرسالها إلينا لأي استفسارات عن الضمان أو التصنيع.\nطاب يومك بكل خير! 💎🛍️`;
    const encodedMessage = encodeURIComponent(textMessage);

    // Check if navigator.share and file sharing are supported
    const canShareFiles = navigator.canShare && navigator.canShare({ files: [pdfFile] });

    if (navigator.share && canShareFiles) {
      navigator.share({
        title: `فاتورة مبيعات - ${invoice.id}`,
        text: textMessage,
        files: [pdfFile]
      })
      .then(() => {
        triggerNotification("✓ تم تشغيل نافذة المشاركة ومشاركة الفاتورة بنجاح! 📣", "success");
      })
      .catch((err) => {
        console.warn("Share files declined fallback to browser trigger:", err);
        // Fallback: download PDF and redirect to WhatsApp Web
        downloadInvoiceFallback(invoice, pdfBlob);
        window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, "_blank");
        triggerNotification("📥 تم تنزيل الفاتورة بصيغة PDF، يرجى إرفاقها للعميل في واتساب يدوياً.", "success");
      });
    } else {
      downloadInvoiceFallback(invoice, pdfBlob);
      window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, "_blank");
      triggerNotification("📥 تم تنزيل الفاتورة بصيغة PDF، يرجى إرفاقها للعميل في واتساب يدوياً.", "success");
    }
  } catch (error) {
    console.error("WhatsApp integration crashed:", error);
    triggerNotification("⚠️ تم صياغة الرسالة بنجاح، يرجى تحميل الفاتورة ومشاركتها مع العميل.", "info");
  }
}

function downloadInvoiceFallback(invoice: Invoice, pdfBlob: Blob) {
  const url = URL.createObjectURL(pdfBlob);
  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.setAttribute("download", `invoice-${invoice.id}.pdf`);
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}

// Function to handle printing natively inside a beautiful clean blank window popup
export function printInvoiceDirect(
  invoice: Invoice,
  settings: POSSettings,
  company: CompanyInfo,
  triggerNotification: (text: string, type?: any) => void,
  onPrintComplete?: () => void
) {
  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      triggerNotification("⚠️ عذراً، يُرجى السماح بالنوافذ المنبثقة (Popups) في متصفحك لبدء طباعة الفاتورة.", "info");
      return;
    }
    const html = generateInvoiceHTML(invoice, settings, company);
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Auto initiate print after short delay to let Tailwind render CDN
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close the print screen pop up after print command resolves or is cancelled
      try {
        printWindow.close();
      } catch (e) {}

      if (onPrintComplete) {
        onPrintComplete();
      }
    }, 450);
  } catch (err: any) {
    console.error("Error printing invoice:", err);
    triggerNotification("❌ تعذر تهيئة معالج الطباعة الفورية الفاتورة.", "error");
  }
}
