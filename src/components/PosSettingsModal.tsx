import React, { useState } from "react";
import { ThemeColors, User } from "../types";
import { posService, POSSettings } from "../core/database/posService";
import { 
 X, Shield, Check, DollarSign, Settings, Sliders, Warehouse, CreditCard, 
 Percent, FileText, Printer, ToggleLeft, ToggleRight, CheckCircle2
} from "lucide-react";

interface PosSettingsModalProps {
 currentPosId: string;
 posUnits?: any[];
 warehouses?: any[];
 theme: ThemeColors;
 isOpen: boolean;
 onClose: () => void;
 onSave: (updatedSettings: POSSettings) => void;
 triggerNotification?: (text: string, type?: any) => void;
 addAuditLog?: (event: string, text: string) => void;
}

export default function PosSettingsModal({
 currentPosId,
 posUnits = [],
 warehouses = [],
 theme,
 isOpen,
 onClose,
 onSave,
 triggerNotification = () => {},
 addAuditLog = () => {}
}: PosSettingsModalProps) {
 
 // Load settings initially
 const [settings, setSettings] = useState<POSSettings>(() => 
 posService.getSettings(currentPosId)
 );

 if (!isOpen) return null;

 const paymentMethodsList = ["نقدي", "شبكة مدى", "Apple Pay", "STC Pay", "دفع متعدد"];

 const handleTogglePaymentMethod = (method: string) => {
 let list = [...settings.allowedPaymentMethods];
 if (list.includes(method)) {
 list = list.filter(m => m !== method);
 } else {
 list.push(method);
 }
 setSettings(s => ({ ...s, allowedPaymentMethods: list }));
 };

 const handleSave = async () => {
 if (settings.allowedPaymentMethods.length === 0) {
 triggerNotification("يجب تحديد طريقة دفع مسموحة واحدة على الأقل", "error");
 return;
 }
 if (settings.isTaxEnabled && (settings.taxPercentage < 0 || settings.taxPercentage > 100)) {
 triggerNotification("نسبة الضريبة يجب أن تفوق الصفر وألا تتخطى 100٪", "error");
 return;
 }
 if (settings.maxDiscountLimit < 0) {
 triggerNotification("حد الخصم الأقصى يجب أن يكون قيمة موجبة", "error");
 return;
 }

 try {
 // 1. Save locally in service
 await posService.saveSettings(currentPosId, settings);

 // 2. Sync with posUnits master list in localStorage
 // We update the associated warehouse and status of the current POS unit in the list
 const allUnits = await posService.getAll();
 const unitIdx = allUnits.findIndex(p => p.id === currentPosId);
 if (unitIdx > -1) {
 allUnits[unitIdx].status = settings.posStatus === "نشطة" ? "نشطة" : "متوقفة";
 allUnits[unitIdx].warehouseId = settings.associatedWarehouseId;
 localStorage.setItem("sahm_web_terminals_local", JSON.stringify(allUnits));
 }

 // 3. Callback
 onSave(settings);

 // 4. Audit Log
 if (addAuditLog) {
 addAuditLog(
 "تعديل إعدادات نقطة البيع", 
 `تم تعديل إعدادات الـ POS [ID: ${currentPosId}] - الضريبة: ${settings.isTaxEnabled ? `${settings.taxPercentage}%` : "معطلة"}, الحالة: ${settings.posStatus}`
 );
 }

 triggerNotification(" تم حفظ وتطبيق إعدادات نقطة البيع بنجاح!", "success");
 onClose();
 } catch (err: any) {
 triggerNotification(`حدث خطأ أثناء الحفظ: ${err.message}`, "error");
 }
 };

 return (
 <div dir="rtl" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
 <div 
 className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right"
 style={{ backgroundColor: theme.surface, borderColor: theme.border }}
 >
 {/* Header Ribbon */}
 <div className="p-5 border-b flex justify-between items-center bg-[#090B1E]" style={{ borderColor: theme.border }}>
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
 <Settings className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-sm font-black text-white flex items-center gap-2">
 إعدادات نقطة بيع سهم المتقدمة (Sahm POS Settings)
 </h3>
 <p className="text-[10px] text-zinc-450 mt-0.5">
 تعديل القواعد المباشرة والتراخيص لـ POS النشطة المعرّفة • حساب المشرف والمالك
 </p>
 </div>
 </div>
 <button 
 onClick={onClose} 
 className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer border-none bg-transparent transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Scrollable Form Body */}
 <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300">
 
 {/* Section 1: Core Identities */}
 <div className="space-y-4">
 <h4 className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 pb-1 border-b border-zinc-900">
 <Sliders className="w-4 h-4 text-[#D4AF37]" />
 <span>أجهزة الفروع والربط المستودعي </span>
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold text-gray-400 mb-1.5">أجهزة نقطة البيع الافتراضية:</label>
 <select 
 value={settings.defaultPosId}
 onChange={(e) => setSettings(s => ({ ...s, defaultPosId: e.target.value }))}
 className="w-full text-xs py-2.5 px-3 rounded-lg border bg-zinc-950 font-bold outline-none text-right"
 style={{ borderColor: theme.border, color: theme.text }}
 >
 {posUnits.map(unit => (
 <option key={unit.id} value={unit.id}>{unit.name} ({unit.id})</option>
 ))}
 </select>
 <span className="text-[9px] text-zinc-550 block mt-1">تحديد الجهاز المستهدف بتعديل الإعدادات والامتثال المالي</span>
 </div>

 <div>
 <label className="block text-[10px] font-bold text-gray-400 mb-1.5">المستودع المغذي الفوري لرصيد البضائع:</label>
 <select 
 value={settings.associatedWarehouseId}
 onChange={(e) => setSettings(s => ({ ...s, associatedWarehouseId: e.target.value }))}
 className="w-full text-xs py-2.5 px-3 rounded-lg border bg-zinc-950 font-bold outline-none text-right"
 style={{ borderColor: theme.border, color: theme.text }}
 >
 {warehouses.map(wh => (
 <option key={wh.id} value={wh.id}>{wh.name}</option>
 ))}
 </select>
 <span className="text-[9px] text-zinc-550 block mt-1">تفريغ وسحب الأرصدة تلقائياً من المستودع المحدد عند التحصيل</span>
 </div>
 </div>
 </div>

 {/* Section 2: Payments & Taxes */}
 <div className="space-y-4">
 <h4 className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 pb-1 border-b border-zinc-900">
 <CreditCard className="w-4 h-4 text-[#D4AF37]" />
 <span>التحصيل المالي والضريبة المضافة </span>
 </h4>

 <div className="space-y-3">
 <div>
 <label className="block text-[10px] font-bold text-gray-400 mb-2">طرق الدفع والتحصيل المقبولة:</label>
 <div className="flex flex-wrap gap-2">
 {paymentMethodsList.map((m) => {
 const isAllowed = settings.allowedPaymentMethods.includes(m);
 return (
 <button
 key={m}
 type="button"
 onClick={() => handleTogglePaymentMethod(m)}
 className={`py-2 px-3.5 text-[10px] font-black rounded-lg border cursor-pointer transition-all flex items-center gap-1.5 ${
 isAllowed 
 ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow" 
 : "bg-zinc-950 border-zinc-800 text-slate-400 hover:text-white"
 }`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${isAllowed ? "bg-amber-500" : "bg-zinc-600"}`}></span>
 {m}
 </button>
 );
 })}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
 <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-gray-400">تفعيل احتساب الضريبة (ZATCA VAT)</span>
 <button
 type="button"
 onClick={() => setSettings(s => ({ ...s, isTaxEnabled: !s.isTaxEnabled }))}
 className="cursor-pointer border-none bg-transparent p-0 text-amber-500"
 >
 {settings.isTaxEnabled ? (
 <ToggleRight className="w-8 h-8 text-amber-500" />
 ) : (
 <ToggleLeft className="w-8 h-8 text-gray-500" />
 )}
 </button>
 </div>

 {settings.isTaxEnabled && (
 <div className="space-y-1.5 animate-fade-in">
 <span className="text-[9.5px] text-gray-400 block font-semibold">نسبة ضريبة القيمة المضافة المحددة (%):</span>
 <div className="relative">
 <input
 type="number"
 min="0"
 max="100"
 value={settings.taxPercentage}
 onChange={(e) => setSettings(s => ({ ...s, taxPercentage: parseInt(e.target.value) || 0 }))}
 className="w-full text-xs rounded-lg py-2 px-3 border border-zinc-800 bg-zinc-900 text-white outline-none pl-8 font-mono text-left"
 />
 <Percent className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
 </div>
 </div>
 )}
 </div>

 <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-gray-400">السماح بتنزيل الخصومات والتخفيضات</span>
 <button
 type="button"
 onClick={() => setSettings(s => ({ ...s, isDiscountAllowed: !s.isDiscountAllowed }))}
 className="cursor-pointer border-none bg-transparent p-0 text-amber-500"
 >
 {settings.isDiscountAllowed ? (
 <ToggleRight className="w-8 h-8 text-amber-500" />
 ) : (
 <ToggleLeft className="w-8 h-8 text-gray-500" />
 )}
 </button>
 </div>

 {settings.isDiscountAllowed && (
 <div className="space-y-1.5 animate-fade-in">
 <span className="text-[9.5px] text-gray-400 block font-semibold">سقف وحد الخصم النقدي الأقصى المسموح (ر.س):</span>
 <div className="relative">
 <input
 type="number"
 min="0"
 value={settings.maxDiscountLimit}
 onChange={(e) => setSettings(s => ({ ...s, maxDiscountLimit: parseInt(e.target.value) || 0 }))}
 className="w-full text-xs rounded-lg py-2 px-3 border border-zinc-800 bg-zinc-900 text-white outline-none pl-12 font-mono text-left"
 />
 <span className="absolute left-3 top-2 text-[9.5px] font-bold text-zinc-500">ر.س</span>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Section 3: Operations & Printing */}
 <div className="space-y-4">
 <h4 className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 pb-1 border-b border-zinc-900">
 <ToggleRight className="w-4 h-4 text-[#D4AF37]" />
 <span>محددات الفواتير والعمليات والصلاحيات </span>
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-900">
 <span className="text-[10px] font-bold text-gray-450 block">صلاحيات التعليق والاسترجاع:</span>
 
 <div className="flex justify-between items-center py-1">
 <span className="text-[10px] text-gray-300">السماح بتعليق وحفظ مسودات سلال الشراء</span>
 <input
 type="checkbox"
 checked={settings.isSuspensionAllowed}
 onChange={(e) => setSettings(s => ({ ...s, isSuspensionAllowed: e.target.checked }))}
 className="w-4 h-4 rounded border-zinc-800 accent-amber-500 cursor-pointer"
 />
 </div>

 <div className="flex justify-between items-center py-1">
 <span className="text-[10px] text-gray-300">السماح باسترجاع أو سحب الفواتير المعلقة والمسودات</span>
 <input
 type="checkbox"
 checked={settings.isRefundAllowed}
 onChange={(e) => setSettings(s => ({ ...s, isRefundAllowed: e.target.checked }))}
 className="w-4 h-4 rounded border-zinc-800 accent-amber-500 cursor-pointer"
 />
 </div>
 </div>

 <div className="space-y-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-900">
 <span className="text-[10px] font-bold text-gray-450 block">طباعة بون الفواتير والقوالب:</span>
 
 <div className="flex items-center justify-between pb-1">
 <span className="text-[10px] text-gray-300">تفعيل الطباعة الفورية وإصدار PDF</span>
 <input
 type="checkbox"
 checked={settings.printingEnabled}
 onChange={(e) => setSettings(s => ({ ...s, printingEnabled: e.target.checked }))}
 className="w-4 h-4 rounded border-zinc-800 accent-amber-500 cursor-pointer"
 />
 </div>

 <div className="space-y-3.5">
 <span className="text-[10px] text-gray-400 block font-semibold">قالب بون الفواتير المعتمد:</span>
 <select
 value={settings.invoiceTemplate}
 onChange={(e) => setSettings(s => ({ ...s, invoiceTemplate: e.target.value }))}
 className="w-full text-[10.5px] rounded border border-zinc-800 bg-zinc-900 p-2 focus:outline-none focus:border-amber-500 text-white"
 >
 <option value="حراري - 80مم">حراري مبسط للصالات - 80مم </option>
 <option value="A4 رسمي">نموذج ضريبي معتمد A4 </option>
 <option value="فاخر ذهبي">قالب فاخر ذهبي وطيب </option>
 <option value="حديث بسيط">قالب حديث بسيط ونظيف </option>
 <option value="تسويقي">قالب تسويقي مع هدايا وخصومات </option>
 </select>
 </div>

 <div className="space-y-2 border-t border-zinc-900 pt-3 mt-3">
 <span className="text-[10px] font-black text-amber-500 block">مظهر وإعدادات الفاتورة الفنية:</span>

 <div className="grid grid-cols-2 gap-2">
 <div className="space-y-1">
 <span className="text-[8.5px] text-gray-400 block font-bold">شعار الفاتورة (رابط الصورة/Base64):</span>
 <div className="flex gap-1.5">
 <input 
 type="text" 
 value={settings.invoiceLogoUrl || ""}
 onChange={(e) => setSettings(s => ({ ...s, invoiceLogoUrl: e.target.value }))}
 placeholder="رابط الشعار المخصص للطباعة"
 className="flex-1 text-[10px] rounded border border-zinc-800 bg-zinc-900 p-1.5 focus:outline-none focus:border-amber-500 text-white font-mono"
 />
 <button
 type="button"
 onClick={() => {
 const input = document.createElement("input");
 input.type = "file";
 input.accept = "image/*";
 input.onchange = (e: any) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (event) => {
 if (event.target?.result) {
 setSettings(s => ({ ...s, invoiceLogoUrl: event.target.result as string }));
 triggerNotification(" تم رفع شعار الفاتورة بنجاح!", "success");
 }
 };
 reader.readAsDataURL(file);
 }
 };
 input.click();
 }}
 className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] rounded text-gray-300 cursor-pointer"
 >
 رفع 
 </button>
 </div>
 </div>
 
 <div className="space-y-1">
 <span className="text-[8.5px] text-gray-400 block font-bold">اللون الرئيسي للفاتورة:</span>
 <div className="flex gap-1.5 items-center">
 <input 
 type="color" 
 value={settings.invoicePrimaryColor || "#D4AF37"}
 onChange={(e) => setSettings(s => ({ ...s, invoicePrimaryColor: e.target.value }))}
 className="w-8 h-7 rounded bg-transparent border-0 cursor-pointer"
 />
 <input 
 type="text"
 value={settings.invoicePrimaryColor || "#D4AF37"}
 onChange={(e) => setSettings(s => ({ ...s, invoicePrimaryColor: e.target.value }))}
 className="flex-1 text-[10px] text-center rounded border border-zinc-805 bg-zinc-900 p-1 font-mono text-white"
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2 py-1.5">
 <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-900 p-1.5 rounded border border-zinc-850">
 <input 
 type="checkbox"
 checked={settings.showQrCode ?? true}
 onChange={(e) => setSettings(s => ({ ...s, showQrCode: e.target.checked }))}
 className="w-3.5 h-3.5 accent-amber-500"
 />
 <span className="text-[9.5px] text-zinc-300">عرض QR الضريبي</span>
 </label>

 <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-900 p-1.5 rounded border border-zinc-850">
 <input 
 type="checkbox"
 checked={settings.showTaxNumber ?? true}
 onChange={(e) => setSettings(s => ({ ...s, showTaxNumber: e.target.checked }))}
 className="w-3.5 h-3.5 accent-amber-500"
 />
 <span className="text-[9.5px] text-zinc-300">عرض الرقم الضريبي</span>
 </label>

 <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-900 p-1.5 rounded border border-zinc-850">
 <input 
 type="checkbox"
 checked={settings.showNationalAddress ?? false}
 onChange={(e) => setSettings(s => ({ ...s, showNationalAddress: e.target.checked }))}
 className="w-3.5 h-3.5 accent-amber-500"
 />
 <span className="text-[9.5px] text-zinc-300">العنوان الوطني</span>
 </label>
 </div>

 <div className="space-y-1">
 <span className="text-[8.5px] text-gray-400 block font-bold">عبارة الشكر والتذييل (Thank You string):</span>
 <input 
 type="text" 
 value={settings.customThankYouText || ""}
 onChange={(e) => setSettings(s => ({ ...s, customThankYouText: e.target.value }))}
 placeholder="شكراً لتسوقكم من فروعنا..."
 className="w-full text-[10px] rounded border border-zinc-800 bg-zinc-900 p-1.5 focus:outline-none focus:border-amber-500 text-white"
 />
 </div>

 <div className="space-y-1">
 <span className="text-[8.5px] text-gray-400 block font-bold">كود خصم الزيارة القادمة (اختياري):</span>
 <input 
 type="text" 
 value={settings.optionalDiscountCode || ""}
 onChange={(e) => setSettings(s => ({ ...s, optionalDiscountCode: e.target.value }))}
 placeholder="أدخل الرمز الترويجي للعميل"
 className="w-full text-[10px] rounded border border-zinc-800 bg-zinc-900 p-1.5 focus:outline-none focus:border-amber-500 text-white font-mono"
 />
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold text-gray-400 mb-1.5">رقم بداية الرقم المسلسل للفواتير:</label>
 <input
 type="number"
 min="1"
 value={settings.startingInvoiceNumber}
 onChange={(e) => setSettings(s => ({ ...s, startingInvoiceNumber: parseInt(e.target.value) || 1001 }))}
 className="w-full text-xs rounded-lg py-2 px-3 border border-zinc-850 bg-zinc-950 text-white outline-none font-mono font-bold"
 />
 <span className="text-[9px] text-zinc-550 block mt-1">تحديد نقطة البداية لتسجيل السلاسل الرقمية لعقود المبيعات</span>
 </div>

 <div>
 <label className="block text-[10px] font-bold text-gray-400 mb-1.5">الحالة التشغيلية الفورية لنقطة البيع:</label>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => setSettings(s => ({ ...s, posStatus: "نشطة" }))}
 className={`py-2 px-3 text-xs font-black rounded-lg border cursor-pointer transition-all ${
 settings.posStatus === "نشطة"
 ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
 : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white"
 }`}
 >
 نشطة ومفعلة
 </button>
 <button
 type="button"
 onClick={() => setSettings(s => ({ ...s, posStatus: "متوقفة" }))}
 className={`py-2 px-3 text-xs font-black rounded-lg border cursor-pointer transition-all ${
 settings.posStatus === "متوقفة"
 ? "bg-red-500/15 border-red-500 text-red-400"
 : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white"
 }`}
 >
 متوقفة / تعليق
 </button>
 </div>
 <span className="text-[9px] text-zinc-550 block mt-1">تعطيل نقطة الـ POS يمنع الكاشيرية فورياً من إجراء العمليات</span>
 </div>
 </div>
 </div>

 </div>

 {/* Footer actions */}
 <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: theme.border }}>
 <button
 type="button"
 onClick={onClose}
 className="py-2.5 px-5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-gray-400 hover:text-white font-bold text-xs cursor-pointer transition-all"
 >
 إلغاء والتجاهل
 </button>
 
 <button
 type="button"
 onClick={handleSave}
 className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg transition-all flex items-center gap-1.5 border-none"
 >
 <Check className="w-4 h-4" />
 <span>حفظ القواعد وتطبيق التغييرات </span>
 </button>
 </div>

 </div>
 </div>
 );
}
