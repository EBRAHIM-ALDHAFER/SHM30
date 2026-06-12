import React from "react";
import { Invoice, ThemeColors } from "../types";
import { POSSettings } from "../core/database/posService";
import { Printer, MapPin, Phone, Award, Sparkles, Receipt, Percent } from "lucide-react";

// ZATCA TLV encoding helper to generate base64 representation of the invoice data
function getZatcaTlvBase64(seller: string, vatNo: string, timestamp: string, totalStr: string, vatStr: string): string {
  const stringToUtf8ByteArray = (str: string): number[] => {
    const utf8: number[] = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      } else {
        i++;
        charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      }
    }
    return utf8;
  };

  const getTlvRecord = (tag: number, val: string): number[] => {
    const bytes = stringToUtf8ByteArray(val);
    return [tag, bytes.length, ...bytes];
  };

  const sellerBytes = getTlvRecord(1, seller);
  const vatNoBytes = getTlvRecord(2, vatNo);
  const timestampBytes = getTlvRecord(3, timestamp);
  const totalBytes = getTlvRecord(4, totalStr);
  const vatBytes = getTlvRecord(5, vatStr);

  const tlvBuffer = [...sellerBytes, ...vatNoBytes, ...timestampBytes, ...totalBytes, ...vatBytes];
  
  let binary = "";
  for (let i = 0; i < tlvBuffer.length; i++) {
    binary += String.fromCharCode(tlvBuffer[i]);
  }
  return btoa(binary);
}

interface InvoicePrintViewProps {
  invoice: Invoice | null;
  settings: POSSettings;
  activeBranchName?: string;
  activePosName?: string;
}

export default function InvoicePrintView({
  invoice,
  settings,
  activeBranchName = "فرع الرياض الرئيسي",
  activePosName = "كاشير 1"
}: InvoicePrintViewProps) {
  if (!invoice) {
    return (
      <div className="p-8 text-center text-red-500 font-bold font-sans">
        ⚠️ لا توجد فاتورة جاهزة للطباعة
      </div>
    );
  }

  // Calculate taxes and totals
  const total = invoice.total || 0;
  const isTaxEnabled = settings.isTaxEnabled !== false;
  const taxRate = isTaxEnabled ? (settings.taxPercentage || 15) : 0;
  
  // Back-calculate subtotal and VAT
  const subtotal = taxRate > 0 ? total / (1 + taxRate / 100) : total;
  const vatAmount = total - subtotal;

  const sellerName = "شركة مراسيم الطيب للتجارة";
  const vatNumber = "310455678300003"; // ZATCA Valid standard tax number
  const nationalAddress = "العنوان الوطني: 7241 طريق الملك فهد، حي الصحافة، الرياض 13321، المملكة العربية السعودية";

  // Create ZATCA TLV Timestamp (ISO 8601 representation)
  const invoiceTimestamp = invoice.date ? (invoice.date.includes("T") ? invoice.date : `${invoice.date}T12:00:00Z`) : new Date().toISOString();
  
  // Base64 TLV code
  const base64Tlv = getZatcaTlvBase64(sellerName, vatNumber, invoiceTimestamp, total.toFixed(2), vatAmount.toFixed(2));
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(base64Tlv)}`;

  const primaryColor = settings.primaryColor || "#D4AF37";

  // CSS inline classes derived depending on template
  const template = settings.invoiceTemplate || "pos_receipt";

  // Fallback default logo if none is attached
  const logoSrc = settings.invoiceLogo || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=150&auto=format&fit=crop";

  // --- Render Templates ---

  // 1. ✨ Luxury Gold Template (Saudi Royal Edition)
  if (template === "luxury_gold") {
    return (
      <div 
        dir="rtl" 
        className="p-8 bg-slate-950 text-white border-double border-8 min-h-[880px] font-sans relative flex flex-col justify-between"
        style={{ borderColor: primaryColor }}
      >
        {/* Subtle background luxury pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div>
          {/* Elegant Gold Header */}
          <div className="border-b pb-6 flex justify-between items-start" style={{ borderBottomColor: primaryColor }}>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Award className="w-4 h-4" />
                </span>
                <h1 className="text-2xl font-black tracking-tight text-[#D4AF37]">
                  {sellerName}
                </h1>
              </div>
              <span className="inline-block px-3 py-1 text-[9px] font-black text-black rounded bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500 uppercase tracking-wider">
                فاتورة مبيعات ضريبية مبسطة • SIMPLIFIED TAX INVOICE
              </span>
              <p className="text-[11px] text-slate-350 font-bold">{activeBranchName} | {activePosName}</p>
              {settings.showTaxId !== false && (
                <p className="text-[11px] text-slate-300 font-bold">الرقم الضريبي: <span className="font-mono text-[#D4AF37] text-xs">{vatNumber}</span></p>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {settings.invoiceLogo ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border p-1 bg-white flex items-center justify-center shadow-lg border-[#D4AF37]/45">
                  <img src={logoSrc} alt="Brand Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-[#D4AF37]/45 flex items-center justify-center text-[#D4AF37] text-xs font-black">
                  مراسيم
                </div>
              )}
            </div>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b text-xs border-slate-900">
            <div className="space-y-2">
              <p className="text-[#D4AF37] font-extrabold text-[9px] uppercase tracking-wider">• بيانات التوثيق والسند</p>
              <p className="font-extrabold text-white">رقم الفاتورة: <span className="font-mono text-sm tracking-wider text-[#D4AF37]">#{invoice.id}</span></p>
              <p className="text-slate-300">تاريخ الإصدار: <span className="font-mono font-medium">{invoice.date}</span></p>
              <p className="text-slate-300 font-medium">الحالة: <span className="text-emerald-400 font-black px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{invoice.status === 'مدفوع' ? 'مسددة بالكامل' : 'معلقة'}</span></p>
            </div>
            <div className="space-y-2 text-left pl-2">
              <p className="text-[#D4AF37] font-extrabold text-[9px] uppercase tracking-wider text-left">• العميل المستلم</p>
              <p className="font-extrabold text-white text-sm">{invoice.customer || "عميل متميز عابر"}</p>
              <p className="text-[10px] text-slate-400">جهة التسليم: الرياض، المملكة العربية السعودية</p>
              <p className="text-[10px] text-emerald-400 font-bold">معاملة موثقة بنجاح ✓</p>
            </div>
          </div>

          {/* National Address Block */}
          {settings.showNationalAddress !== false && (
            <div className="p-3 bg-[#D4AF37]/5 border rounded-lg border-[#D4AF37]/10 text-[10px] text-slate-300 my-5 flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#D4AF37]" />
              <span>{nationalAddress}</span>
            </div>
          )}

          {/* Table */}
          <div className="mt-4">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b uppercase tracking-wider text-[10px] text-[#D4AF37]" style={{ borderBottomColor: primaryColor }}>
                  <th className="py-3 text-right">المنتج / الصنف المعرّف</th>
                  <th className="py-3 text-center w-16">الكمية</th>
                  <th className="py-3 text-left w-24">السعر الفردي</th>
                  <th className="py-3 text-left w-24">شامل الضريبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-medium text-slate-200">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 text-white font-bold">{item.name}</td>
                    <td className="py-3.5 text-center font-bold font-mono">{item.qty}</td>
                    <td className="py-3.5 text-left font-mono">{(item.price || 0).toFixed(2)} ر.س</td>
                    <td className="py-3.5 text-left font-bold font-mono text-white">{(item.total || 0).toFixed(2)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="mt-6 border-t pt-4 flex justify-end border-slate-900">
            <div className="w-64 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-slate-400">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {isTaxEnabled && (
                <div className="flex justify-between text-slate-400">
                  <span>ضريبة القيمة المضافة ({taxRate}%):</span>
                  <span className="font-mono">{vatAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t text-white border-slate-900">
                <span>الإجمالي النهائي المستحق:</span>
                <span className="font-mono text-base text-[#D4AF37]">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Luxurious Footer with Custom Coupon and QR */}
        <div className="border-t pt-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-slate-900">
          <div className="text-right space-y-2.5 md:col-span-2">
            <h4 className="text-xs font-black text-white flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span>{settings.customThankYouMessage || "شكراً لاختياركم المراسيم الطيبة الفاخرة!"}</span>
            </h4>
            {settings.optionalDiscountCode && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/15 text-[10px] font-bold text-[#D4AF37]">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>خصم خاص لزيارتكم القادمة بكود: <span className="font-mono tracking-wider text-xs underline text-white">{settings.optionalDiscountCode}</span></span>
              </div>
            )}
            <p className="text-[9px] text-slate-500 font-mono">نظام سهم المعتمد للفوترة والتحصيل السحابي 2026</p>
          </div>
          {settings.showQr !== false && (
            <div className="flex justify-center md:justify-end">
              <div className="p-2 border rounded-xl bg-white flex flex-col items-center gap-1 shadow-xl border-[#D4AF37]/40">
                <img src={qrCodeUrl} alt="ZATCA QR" className="w-20 h-20" />
                <span className="text-[7.5px] font-black text-slate-800 font-mono leading-none tracking-widest mt-1">ZATCA COMPLIANT</span>
                <span className="text-[6.5px] font-bold text-emerald-600 font-mono leading-none mt-0.5">✓ TLV BASE64 SECURE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. 📄 Modern Simple Template
  if (template === "modern_simple") {
    return (
      <div 
        dir="rtl" 
        className="p-8 bg-white text-slate-800 min-h-[820px] font-sans flex flex-col justify-between"
      >
        <div>
          {/* Minimalist Topline Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-widest text-blue-600 uppercase">فاتورة مبيعات معتمدة</span>
              <h1 className="text-2xl font-black text-slate-950">{sellerName}</h1>
              <p className="text-xs text-slate-500">{activeBranchName} • كاشير سحابي ({activePosName})</p>
              {settings.showTaxId !== false && (
                <p className="text-xs text-slate-600">الرقم الضريبي: <span className="font-mono font-bold text-slate-900">{vatNumber}</span></p>
              )}
            </div>
            <div className="text-left space-y-1">
              {settings.invoiceLogo ? (
                <div className="w-16 h-16 rounded overflow-hidden flex items-center justify-center p-0.5 border border-slate-100 ml-auto bg-slate-50">
                  <img src={logoSrc} alt="Store Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="text-right text-xs bg-slate-100 py-1 px-3 text-slate-700 rounded font-bold">مبيعات مبسطة</div>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-6 py-5 border-b border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">رقم المستند والفوترة</p>
              <p className="font-extrabold text-slate-900 mt-1 font-mono text-sm leading-none">INV-{invoice.id}</p>
              <p className="text-slate-500 mt-1.5 font-mono">تاريخ التوثيق: {invoice.date}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">الـمـشتـري</p>
              <p className="font-bold text-slate-800 mt-1">{invoice.customer || "عميل غير مسجل"}</p>
              <p className="text-slate-500 mt-1">طريقة السداد المعتمدة: نقدي وسحابي</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">جهة الإصدار والتوثيق</p>
              <p className="text-slate-800 font-medium mt-1">منصة سهم لنقاط البيع</p>
              <p className="text-[10px] text-green-600 font-bold mt-1">✓ مسجلة بهيئة الجمارك والزكاة</p>
            </div>
          </div>

          {/* National Address */}
          {settings.showNationalAddress !== false && (
            <div className="mt-4 p-3 bg-slate-50 rounded text-[10px] text-slate-600 flex items-center gap-1.5 border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{nationalAddress}</span>
            </div>
          )}

          {/* Table block */}
          <div className="mt-6">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[9.5px] uppercase font-bold">
                  <th className="py-2 text-right">الصنف التفصيلي</th>
                  <th className="py-2 text-center w-16">الكمية</th>
                  <th className="py-2 text-left w-24">السعر الفردي</th>
                  <th className="py-2 text-left w-24">الإجمالي شامل VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-slate-900 font-semibold">{item.name}</td>
                    <td className="py-3 text-center font-mono font-bold">{item.qty}</td>
                    <td className="py-3 text-left font-mono">{(item.price || 0).toFixed(2)} ر.س</td>
                    <td className="py-3 text-left font-mono text-slate-900 font-bold">{(item.total || 0).toFixed(2)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary calculations */}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>المجموع الفرعي (غير شامل للضريبة):</span>
                <span className="font-mono">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {isTaxEnabled && (
                <div className="flex justify-between text-slate-500">
                  <span>قيمة الضريبة المضافة ({taxRate}%):</span>
                  <span className="font-mono">{vatAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>الإجمالي النهائي المستحق:</span>
                <span className="font-mono text-sm inline-block">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer with QR code on Left, custom text on right */}
        <div className="border-t border-slate-100 pt-6 mt-12 flex justify-between items-end">
          <div className="space-y-1.5 text-right max-w-md">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <Receipt className="w-4 h-4 text-slate-400" />
              <span>{settings.customThankYouMessage || "شكراً لكم لتسوقكم من متاجرنا!"}</span>
            </p>
            {settings.optionalDiscountCode && (
              <p className="text-[10px] text-slate-600 font-medium">
                🎁 رمز قسيمة خصم الزيارة القادمة: <b className="font-mono text-slate-900 font-black px-1.5 py-0.5 bg-slate-100 rounded">{settings.optionalDiscountCode}</b>
              </p>
            )}
            <p className="text-[9px] text-slate-400">سند عهدة وتوثيق إداري فوري عبر سهم POS • جميع الحقوق محفوظة</p>
          </div>
          {settings.showQr !== false && (
            <div className="p-0.5 border border-slate-100 rounded bg-white">
              <img src={qrCodeUrl} alt="ZATCA QR Code" className="w-14 h-14" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. 📈 Marketing-focused Template
  if (template === "marketing_focused") {
    return (
      <div 
        dir="rtl" 
        className="p-8 bg-gradient-to-b from-white to-slate-50 text-slate-800 min-h-[850px] font-sans relative flex flex-col justify-between border-t-8"
        style={{ borderTopColor: primaryColor }}
      >
        <div>
          {/* Promo Focused Header Banner */}
          <div className="flex justify-between items-start border-b pb-6 border-slate-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black text-rose-600 bg-rose-50 rounded-full">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>عروض حصرية وفوترة ترويجية ذكية</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950">{sellerName}</h1>
              <p className="text-xs text-gray-500 font-medium">{activeBranchName} | الهاتف: 0501234567</p>
              {settings.showTaxId !== false && (
                <p className="text-[11px] text-gray-600 font-semibold">الرقم الضريبي الموحد للمنشأة: <span className="font-mono text-slate-950 font-bold">{vatNumber}</span></p>
              )}
            </div>
            <div className="text-left space-y-1.5">
              {settings.invoiceLogo && (
                <div className="w-16 h-16 rounded-full overflow-hidden border p-1 bg-white flex items-center justify-center shadow-lg mx-auto">
                  <img src={logoSrc} alt="Logos" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
              <span className="block text-[9px] text-slate-400 font-bold">فاتورة مبيعات ترويجية</span>
            </div>
          </div>

          {/* Marketing Highlight Banner */}
          <div className="my-5 p-4 rounded-xl bg-slate-900 text-white space-y-1 shadow-md">
            <h3 className="text-xs font-black text-amber-400 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>انضم لعائلة نادي عملاء المراسيم الطيب المميزين!</span>
            </h3>
            <p className="text-[9.5px] text-gray-350 leading-relaxed font-medium">
              احصل على خصومات حصرية فورية تصل حتى 25٪ بفتح حسابك المجاني اليوم. امسح الكود ذيل الفاتورة للاشتراك والانغماس في عالم الطيب والهدايا العطرية الفاخرة!
            </p>
          </div>

          {/* Info Details of transaction */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100 text-xs">
            <div className="space-y-1">
              <p className="text-gray-400 text-[9px] font-bold">تفاصيل السند الفوري</p>
              <p className="font-black text-slate-900 text-sm">رقم الفاتورة: #{invoice.id}</p>
              <p className="text-gray-600 font-mono">تاريخ التوثيق: {invoice.date}</p>
            </div>
            <div className="space-y-1 text-left pl-2">
              <p className="text-gray-400 text-[9px] font-bold">العميل السعيد</p>
              <p className="font-black text-slate-900">{invoice.customer || "عميل متميز عابر"}</p>
              <p className="text-[10px] text-emerald-600 font-bold">مبيعات معتمدة وصالحة للاسترجاع</p>
            </div>
          </div>

          {/* National Address */}
          {settings.showNationalAddress !== false && (
            <div className="mt-3 p-2 bg-slate-100 text-[9px] text-gray-500 rounded border border-gray-200">
              {nationalAddress}
            </div>
          )}

          {/* Merchandises lists */}
          <div className="mt-4">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b uppercase font-bold text-slate-500 text-[9.5px]">
                  <th className="py-2 text-right">الصنف التفصيلي</th>
                  <th className="py-2 text-center w-16">الكمية</th>
                  <th className="py-2 text-left w-24">السعر الفردي</th>
                  <th className="py-2 text-left w-24">الإجمالي شامل VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-slate-900 font-bold">{item.name}</td>
                    <td className="py-3 text-center font-mono font-bold">{item.qty}</td>
                    <td className="py-3 text-left font-mono">{(item.price || 0).toFixed(2)} ر.س</td>
                    <td className="py-3 text-left font-mono font-bold text-slate-900">{(item.total || 0).toFixed(2)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {isTaxEnabled && (
                <div className="flex justify-between text-gray-500">
                  <span>الضريبة المضافة ({taxRate}%):</span>
                  <span className="font-mono">{vatAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-2 border-t text-rose-600 border-gray-200">
                <span>الإجمالي الكلي شامل الضريبة:</span>
                <span className="font-mono text-base font-extrabold">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Marketing Footer with Coupon highlighted & QR */}
        <div className="border-t pt-6 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-gray-100/60 p-4 rounded-xl border border-gray-200">
          <div className="col-span-2 space-y-2">
            <h4 className="text-xs font-black text-rose-700 flex items-center gap-1">
              <Percent className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>{settings.customThankYouMessage || "تسوق عطورك ونقاط مبيعاتك الفاخرة بحب دائم!"}</span>
            </h4>
            {settings.optionalDiscountCode ? (
              <div className="p-3 rounded-lg bg-white border border-rose-100 space-y-1">
                <p className="text-[10px] font-bold text-slate-700">🎁 كود خصم خاص لزيارتك الموالية:</p>
                <p className="text-xs font-black text-rose-600 font-mono tracking-widest uppercase">{settings.optionalDiscountCode} <span className="text-[10px] text-gray-400 font-normal shadow-none font-sans mr-2">(خصم 15% إضافي في المتجر والفرع)</span></p>
              </div>
            ) : (
              <p className="text-[9.5px] text-gray-500">مرحباً بكم دائماً، احصل على كود التخفيض لزيارة الصالات في رسالتك الواتساب القادمة.</p>
            )}
            <p className="text-[8.5px] text-gray-400 leading-none">محرر آلياً ومنصة التحصيل المعتمدة ZATCA • سهم ويب كود 2026</p>
          </div>
          {settings.showQr !== false && (
            <div className="flex justify-center sm:justify-end">
              <div className="p-1 border bg-white rounded shadow-md flex flex-col items-center gap-1 border-gray-250">
                <img src={qrCodeUrl} alt="ZATCA COMPLIANT QR" className="w-16 h-16" />
                <span className="text-[7px] font-bold text-zinc-400 font-mono">ZATCA SECURE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. 🖨️ Classic POS Receipt (80mm) default fallback
  return (
    <div 
      dir="rtl" 
      className="p-4 bg-white text-slate-900 border max-w-sm mx-auto font-mono text-[10.5px] select-text"
      style={{ borderColor: "#e2e8f0" }}
    >
      {/* Simulation Receipt Paper header */}
      <div className="text-center space-y-1.5 border-b pb-3 border-dashed border-gray-300">
        {settings.invoiceLogo && (
          <div className="w-14 h-14 rounded-full overflow-hidden border p-0.5 bg-white flex items-center justify-center mx-auto mb-1">
            <img src={logoSrc} alt="Brand Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
        <span className="font-extrabold text-xs block text-slate-950 uppercase">{sellerName}</span>
        <span className="text-[9px] text-slate-500 block leading-tight">
          سجل تجاري: 1010887645 | {activeBranchName} <br /> ({activePosName})
        </span>
        <span className="text-[9px] text-slate-500 block font-medium">هاتف الاتصال والشكاوي: 0501234567</span>
        
        {settings.showTaxId !== false && (
          <span className="text-[9px] font-bold text-slate-800 block">الرقم الضريبي للمتجر: {vatNumber}</span>
        )}

        <span className="text-[9.5px] font-black uppercase text-slate-900 bg-slate-100 py-1 rounded px-2 mt-1 inline-block">
          فاتورة مبيعات تبسيطية ومبسطة ZATCA
        </span>
      </div>

      {/* Metadata layout */}
      <div className="space-y-0.5 py-2 border-b border-dashed border-gray-300 text-[9.5px] text-slate-700">
        <div className="flex justify-between">
          <span>رقم الفاتورة:</span>
          <span className="font-bold text-slate-950">INV-{invoice.id}</span>
        </div>
        <div className="flex justify-between">
          <span>تاريخ الإصدار والوقت:</span>
          <span className="font-mono">{invoice.date}</span>
        </div>
        <div className="flex justify-between">
          <span>العميل:</span>
          <span className="font-bold text-slate-950">{invoice.customer || "عميل نقدي"}</span>
        </div>
        <div className="flex justify-between">
          <span>طريقة الدفع المعمدة:</span>
          <span className="font-bold text-slate-950">مسددة بالكامل</span>
        </div>
      </div>

      {/* Items list */}
      <div className="py-2.5 border-b border-dashed border-gray-300 text-[10px]">
        <div className="flex justify-between font-black border-b border-gray-200 pb-1 text-slate-950 mb-1.5">
          <span className="flex-1 text-right">البند / الصنف</span>
          <span className="w-10 text-center">كمية</span>
          <span className="w-16 text-left">الإجمالي شامل</span>
        </div>
        
        {invoice.items && invoice.items.map((it, idx) => (
          <div key={idx} className="flex justify-between text-slate-850 py-0.5">
            <span className="flex-1 text-right truncate font-medium">{it.name}</span>
            <span className="w-10 text-center font-bold font-mono">{it.qty}</span>
            <span className="w-16 text-left font-bold font-mono text-slate-900">{(it.total || 0).toFixed(2)} ر.س</span>
          </div>
        ))}
      </div>

      {/* Math section */}
      <div className="py-2 space-y-0.5 text-[9.5px] text-slate-800">
        <div className="flex justify-between">
          <span>المجموع الفرعي (قبل الضريبة):</span>
          <span>{subtotal.toFixed(2)} ر.س</span>
        </div>
        {isTaxEnabled && (
          <div className="flex justify-between">
            <span>قيمة ضريبة المبيعات المضافة ({taxRate}%):</span>
            <span>{vatAmount.toFixed(2)} ر.س</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold text-xs text-slate-950 border-t border-dashed border-gray-400 pt-1.5 mt-1">
          <span>المجموع النهائي المدفوع:</span>
          <span>{total.toFixed(2)} ر.س</span>
        </div>
      </div>

      {/* Bottom QR and custom message */}
      <div className="text-center pt-3 space-y-2 border-t border-dashed border-gray-300">
        {settings.showQr !== false && (
          <div className="mx-auto p-1 bg-white inline-block border border-gray-200 rounded">
            <img src={qrCodeUrl} alt="ZATCA QR Code" className="w-20 h-20 mx-auto" />
          </div>
        )}
        
        <div className="space-y-1 text-[8.5px] text-slate-550 leading-tight">
          <p className="font-extrabold text-slate-800 text-[9px]">{settings.customThankYouMessage || "شكراً لزيارتكم! طوّر علاقاتك التجارية معنا."}</p>
          {settings.optionalDiscountCode && (
            <p className="font-bold text-rose-600 bg-rose-50/50 py-1 rounded my-1 border border-rose-100/40">
              🎁 كود قسيمة الزيارة القادمة: <span className="font-mono text-slate-900 underline">{settings.optionalDiscountCode}</span>
            </p>
          )}
          <p className="text-[7.5px] font-mono tracking-wider">{invoice.id}-SAHM-ZATCA</p>
          <p className="text-[7.5px] font-bold text-emerald-600 leading-none">✓ معتمد من البوابات الوطنية وموثق سحابياً</p>
        </div>
      </div>
    </div>
  );
}
