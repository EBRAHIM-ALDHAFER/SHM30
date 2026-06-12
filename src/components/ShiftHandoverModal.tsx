import React, { useState, useEffect } from "react";
import { ThemeColors, User, Invoice } from "../types";
import { 
 X, Coins, CreditCard, Clock, CheckCircle2, ShieldAlert, FileText, 
 Printer, Share2, Download, Check, Save, Play, PlusCircle, History, 
 Trash2, AlertTriangle, ArrowLeftRight, UserCheck, Lock, Edit3
} from "lucide-react";
import { SahmDatabaseService, getRequiredTenantId } from "../core/database/dbService";

export interface ShiftRefill {
 amount: number;
 reason: string;
 timestamp: string;
}

export interface ShiftExpense {
 amount: number;
 reason: string;
 timestamp: string;
}

export interface Shift {
 id: string; // e.g. "SHFT-1002"
 cashierId: string | number;
 cashierName: string;
 branchId: string;
 branchName: string;
 posId: string;
 posName: string;
 startTime: string; // ISO
 endTime?: string; // ISO
 startingCash: number; // عهدة البداية النقدية
 status: 'open' | 'pending_approval' | 'approved' | 'has_discrepancy' | 'closed';
 tenant_id?: string;
 company_id?: string;
 
 // System values (at moment of closure)
 systemSalesCount: number;
 systemTotalSales: number;
 systemCashSales: number;
 systemCardSales: number;
 systemTransferSales: number;
 systemWalletSales: number;
 systemRefunds: number;
 systemDiscounts: number;
 systemTax: number;
 expectedNet: number;

 refills: ShiftRefill[];
 expenses: ShiftExpense[];

 // Actual values input by Cashier
 actualCash: number;
 actualCard: number;
 actualTransfers: number;
 actualExpenses: number;
 notes: string;
 receiverManagerName: string;

 // Discrepancy
 cashDiscrepancy: number; // actualCash - (startingCash + systemCashSales + refills - actualExpenses)
 cardDiscrepancy: number; // actualCard - systemCardSales
 totalDiscrepancy: number;

 // Approval
 approvedBy?: string;
 approvedTime?: string;
 approvalNotes?: string;
 signatureCashier?: string;
 signatureManager?: string;
 giverManagerName?: string;
 entryNotes?: string;

 // Closure details
 opening_cash?: number;
 cash_sales?: number;
 card_sales?: number;
 transfer_sales?: number;
 wallet_sales?: number;
 expected_cash?: number;
 difference?: number;
 closed_at?: string;
 closed_by?: string;
}

interface ShiftHandoverModalProps {
 isOpen: boolean;
 onClose: () => void;
 theme: ThemeColors;
 user: User;
 invoices: Invoice[];
 activeBranchId: string;
 branches: any[];
 activePosId: string;
 posUnits: any[];
 triggerNotification: (text: string, type?: any) => void;
 addAuditLog: (event: string, text: string) => void;
 // Handler called when shift changes
 onShiftStateChange: (currentShift: Shift | null) => void;
 // Current active shift passed down
 activeShift: Shift | null;
}

export default function ShiftHandoverModal({
 isOpen,
 onClose,
 theme,
 user,
 invoices,
 activeBranchId,
 branches,
 activePosId,
 posUnits,
 triggerNotification,
 addAuditLog,
 onShiftStateChange,
 activeShift
}: ShiftHandoverModalProps) {
 const [activeSubTab, setActiveSubTab] = useState<'current' | 'history'>('current');
 const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
 
 // Open Shift Form States
 const [startingCash, setStartingCash] = useState<number>(500);
 
 // Close Handover States (Inputs)
 const [actualCash, setActualCash] = useState<string>("");
 const [actualCard, setActualCard] = useState<string>("");
 const [actualTransfers, setActualTransfers] = useState<string>("");
 const [actualExpenses, setActualExpenses] = useState<string>("");
 const [notes, setNotes] = useState<string>("");
 const [receiverManagerName, setReceiverManagerName] = useState<string>("");

 // Seeding/Replenishment state
 const [showRefillForm, setShowRefillForm] = useState(false);
 const [refillAmount, setRefillAmount] = useState<string>("");
 const [refillReason, setRefillReason] = useState<string>("");

 // Cash Expense state
 const [showExpenseForm, setShowExpenseForm] = useState(false);
 const [expenseAmount, setExpenseAmount] = useState<string>("");
 const [expenseReason, setExpenseReason] = useState<string>("");

 // Approval state
 const [approvalNotes, setApprovalNotes] = useState<string>("");
 const [signatureCashier, setSignatureCashier] = useState<string>("");
 const [signatureManager, setSignatureManager] = useState<string>("");

 // Historical view details modal/card reference
 const [selectedHistShift, setSelectedHistShift] = useState<Shift | null>(null);

 const [isSyncing, setIsSyncing] = useState(false);
 const [actionError, setActionError] = useState<string | null>(null);
 const handleSyncWorkspace = async () => {
 setIsSyncing(true);
 setActionError(null);
 try {
  const resolvedTenant = localStorage.getItem("sahm_impersonate_tenant_id") || user.tenant_id;
  const resolvedCompany = localStorage.getItem("sahm_impersonate_org_id") || user.organization_id || (user as any).company_id;
  await SahmDatabaseService.getInstance().ensureWorkspaceSeed(resolvedTenant || undefined, resolvedCompany || undefined);
  triggerNotification("تمت مزامنة وتأسيس بيئة العمل بنجاح", "success");
 } catch (err: any) {
 setActionError(err.message || String(err));
 triggerNotification(`فشل مزامنة بيئة العمل: ${err.message || err}`, "error");
 } finally {
 setIsSyncing(false);
 }
 };

 // User privileges
 const isManagerOrOwner = 
 user.role === "tenant_owner" ||
 user.role === "admin" ||
 user.role === "system_admin" ||
 user.role === "مالك" ||
 user.role === "مدير" ||
 user.role === "مالك النظام" ||
 user.role === "مدير عام" ||
 user.role === "مدير فرع" ||
 user.role === "أخصائي حسابات" ||
 user.permissions?.includes("pos:shift:approve") ||
 user.permissions?.includes("pos:shift:reopen");

 const branchObj = branches.find(b => b.id === activeBranchId);
 const posObj = posUnits.find(p => p.id === activePosId);

  // Load history on load
  useEffect(() => {
    if (!isOpen) return;
    const db = SahmDatabaseService.getInstance();
    db.getShiftsHistory().then(data => {
      if (data) {
        setShiftHistory(data);
      }
    }).catch(err => {
      console.warn("Failed to fetch shifts history from database:", err);
    });
  }, [isOpen]);

 // If there's an active shift, initialize form fields
 useEffect(() => {
 if (activeShift) {
 setActualCash(activeShift.actualCash > 0 ? String(activeShift.actualCash) : "");
 setActualCard(activeShift.actualCard > 0 ? String(activeShift.actualCard) : "");
 setActualTransfers(activeShift.actualTransfers > 0 ? String(activeShift.actualTransfers) : "");
 setActualExpenses(activeShift.actualExpenses > 0 ? String(activeShift.actualExpenses) : "");
 setNotes(activeShift.notes || "");
 setReceiverManagerName(activeShift.receiverManagerName || "");
 }
 }, [activeShift]);

 if (!isOpen) return null;

 // Math helper
 const getShiftSystemStats = (shift: Shift) => {
 // Collect invoices matching branch, pos created after shift.startTime
 const shiftInvoices = invoices.filter(inv => {
 // Must match branch if branch set
 if (activeBranchId && inv.branch_id !== activeBranchId) return false;
 
 // Filter by time: invoice creation date is just YYYY-MM-DD but we want to count total sales.
 // If the invoice id has a timestamp or if we match invoices created on same date
 const shiftStartStr = shift.startTime.split('T')[0];
 return inv.date >= shiftStartStr;
 });

 const systemSalesCount = shiftInvoices.length;
 const systemTotalSales = shiftInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

 // Sum according to payment status/methods
 // (Our invoices has custom strings in WhatsApp export)
 // To match realistically, we can split total sales or check custom props if available
 // Let's do a smart mockup: 
 // - 50% cash
 // - 35% Visa/Mada
 // - 15% bank
 // Wait! Let's calculate exactly based on how we know checkout works.
 // In our checkout, we support: "نقدي", "شبكة مدى", "Apple Pay", "STC Pay", "دفع متعدد".
 // We can distribute sales realistically based on the simulated checkout data.
 let systemCashSales = 0;
 let systemCardSales = 0;
 let systemTransferSales = 0;
 let systemWalletSales = 0;
 let systemRefunds = 0;
 let systemDiscounts = 0;

 shiftInvoices.forEach(inv => {
		systemCashSales += inv.cash_amount || 0;
		systemCardSales += inv.card_amount || 0;
		systemTransferSales += inv.transfer_amount || 0;
		systemWalletSales += inv.wallet_amount || 0;
	});

 const sumRefills = shift.refills.reduce((s, r) => s + r.amount, 0);
 const sumExpenses = shift.expenses.reduce((s, e) => s + e.amount, 0);

 const expectedCashValue = shift.startingCash + systemCashSales + sumRefills - sumExpenses;
 const expectedCardValue = systemCardSales;
 const expectedNet = expectedCashValue + expectedCardValue + systemTransferSales + systemWalletSales;

 return {
 systemSalesCount,
 systemTotalSales,
 systemCashSales,
 systemCardSales,
 systemTransferSales,
 systemWalletSales,
 systemRefunds,
 systemDiscounts,
 systemTax: Math.round(systemTotalSales * 0.15),
 expectedCashValue,
 expectedCardValue,
 expectedNet,
 sumRefills,
 sumExpenses
 };
 };

 // Start a new shift
 const handleOpenShift = async () => {
 if (!activeBranchId || !activePosId) {
 triggerNotification("���� ����� ����� ����� ������� ����� �� ���� ���� �������", "warning");
 return;
 }

 const shiftId = `SHFT-${Math.floor(1000 + Math.random() * 9000)}`;
 const newShift: Shift = {
 id: shiftId,
 cashierId: user.id,
 cashierName: user.name || user.fullName,
 branchId: activeBranchId,
 branchName: branchObj?.name || "��� ������ �������",
 posId: activePosId,
 posName: posObj?.name || "����� 1 ������",
 startTime: new Date().toISOString(),
 startingCash: startingCash,
 status: 'open',
 tenant_id: (() => {
    const resolvedTenant = localStorage.getItem("sahm_impersonate_tenant_id") || user.tenant_id;
    const isLocalMode = import.meta.env.VITE_DATA_MODE !== "supabase";
    const isInvalid = isLocalMode ? !resolvedTenant : (!resolvedTenant || resolvedTenant === "tenant-local");
    if (isInvalid) {
      throw new Error("Security Error: Invalid or missing tenant_id.");
    }
    return resolvedTenant;
  })(),
 company_id: localStorage.getItem("sahm_impersonate_org_id") || user.organization_id || (user as any).company_id || "comp-default",
 systemSalesCount: 0,
 systemTotalSales: 0,
 systemCashSales: 0,
 systemCardSales: 0,
 systemTransferSales: 0,
 systemWalletSales: 0,
 systemRefunds: 0,
 systemDiscounts: 0,
 systemTax: 0,
 expectedNet: startingCash,
 refills: [],
 expenses: [],
 actualCash: 0,
 actualCard: 0,
 actualTransfers: 0,
 actualExpenses: 0,
 notes: "",
 receiverManagerName: "",
 cashDiscrepancy: 0,
 cardDiscrepancy: 0,
 totalDiscrepancy: 0
 };

 // Save to Database
 try {
 setActionError(null);
 await SahmDatabaseService.getInstance().saveShift(newShift);
 
 onShiftStateChange(newShift);
  
  // Save to historical pool as open
  const updatedHistory = [newShift, ...shiftHistory];
  setShiftHistory(updatedHistory);

 triggerNotification(` تم فتح الوردية الجديدة رقم [${shiftId}] بعهدة بداية ${startingCash} ر.س. بالتوفيق!`, "success");
 addAuditLog("فتح وردية", `قام الكاشير ${user.name} ببدء وردية جديدة رقم [${shiftId}] لـ [${newShift.posName}] في [${newShift.branchName}]`);
 } catch (err: any) {
 console.error(err);
 setActionError(err.message || String(err));
 triggerNotification(`فشل فتح الوردية: ${err.message || err}`, "error");
 }
 };

 // Handle Seeding Counter Refill Cash
 const handleAddRefill = async () => {
 if (!activeShift) return;
 const amount = parseFloat(refillAmount) || 0;
 if (amount <= 0) {
 triggerNotification("يرجى إدخال مبلغ صحيح لتزويد الصندوق", "warning");
 return;
 }

 const refill: ShiftRefill = {
 amount,
 reason: refillReason || "تزويد نقدية عاجلة / صرف فكة",
 timestamp: new Date().toISOString()
 };

 const updatedShift: Shift = {
 ...activeShift,
 refills: [...activeShift.refills, refill]
 };

 // Save to Database
 try {
 setActionError(null);
 await SahmDatabaseService.getInstance().saveShift(updatedShift);

 onShiftStateChange(updatedShift);
 

 setRefillAmount("");
 setRefillReason("");
 setShowRefillForm(false);
 triggerNotification(`تم إيداع وتزويد الصندوق بمبلغ ${amount} ر.س. بنجاح`, "success");
 addAuditLog("تزويد نقدية", `تم تزويد الصندوق بمبلغ ${amount} ر.س. - السبب: ${refill.reason}`);
 } catch (err: any) {
 console.error(err);
 setActionError(err.message || String(err));
 triggerNotification(`فشل تسجيل الإيداع المالي: ${err.message || err}`, "error");
 }
 };

 // Handle Cash Expense Draw out of drawer
 const handleAddExpense = async () => {
 if (!activeShift) return;
 const amount = parseFloat(expenseAmount) || 0;
 if (amount <= 0) {
 triggerNotification("يرجى إدخال مبلع مصروف صحيح", "warning");
 return;
 }

 const expense: ShiftExpense = {
 amount,
 reason: expenseReason || "مصروف نثريات الصندوق",
 timestamp: new Date().toISOString()
 };

 const updatedShift: Shift = {
 ...activeShift,
 expenses: [...activeShift.expenses, expense]
 };

 // Save to Database
 try {
 setActionError(null);
 await SahmDatabaseService.getInstance().saveShift(updatedShift);

 onShiftStateChange(updatedShift);
 
 
 // update history pool
 const updatedHistory = shiftHistory.map(s => s.id === updatedShift.id ? updatedShift : s);
 setShiftHistory(updatedHistory);
 

 setExpenseAmount("");
 setExpenseReason("");
 setShowExpenseForm(false);
 triggerNotification(` تم خصم وتسجيل مصروف نثري من الصندوق بقيمة ${amount} ر.س.`, "success");
 addAuditLog("مصروف وردية", `تم سحب مصروف بقيمة ${amount} ر.س. من الصندوق لـ ${expense.reason}`);
 } catch (err: any) {
 console.error(err);
 setActionError(err.message || String(err));
 triggerNotification(`فشل تسجيل المصروف المالي: ${err.message || err}`, "error");
 }
 };

 // Submit Shift Handover for approval (Cashier End)
 const handleSubmitHandover = async () => {
 if (!activeShift) return;

 if (actualCash.trim() === "" || actualCard.trim() === "") {
 triggerNotification("يرجى إدخال المبالغ الفعلية لجميع طرق الدفع بالصندوق وحقن جهاز مدى قبل الإرسال لتأكيد الموازنة!", "error");
 return;
 }

 const stats = getShiftSystemStats(activeShift);
 
 const cashInHand = parseFloat(actualCash) || 0;
 const cardInHand = parseFloat(actualCard) || 0;
 const transferInHand = parseFloat(actualTransfers) || 0;
 const expensesInHand = parseFloat(actualExpenses) || 0;

 const cashDiff = cashInHand - stats.expectedCashValue;
 const cardDiff = cardInHand - stats.expectedCardValue;
 const totalDiff = cashDiff + cardDiff;

 const isMatched = cashDiff === 0 && cardDiff === 0;
 const finalStatus = isMatched ? "closed" : "pending_approval";

 const updatedShift: Shift = {
 ...activeShift,
 endTime: new Date().toISOString(),
 status: finalStatus,
 
 // stamp system snapshots
 systemSalesCount: stats.systemSalesCount,
 systemTotalSales: stats.systemTotalSales,
 systemCashSales: stats.systemCashSales,
 systemCardSales: stats.systemCardSales,
 systemTransferSales: stats.systemTransferSales,
 systemWalletSales: stats.systemWalletSales,
 systemRefunds: stats.systemRefunds,
 systemDiscounts: stats.systemDiscounts,
 systemTax: stats.systemTax,
 expectedNet: stats.expectedNet,

 // cashier inputs
 actualCash: cashInHand,
 actualCard: cardInHand,
 actualTransfers: transferInHand,
 actualExpenses: expensesInHand,
 notes: notes,
 receiverManagerName: receiverManagerName || "المدير المناوب",

 // differences
 cashDiscrepancy: cashDiff,
 cardDiscrepancy: cardDiff,
 totalDiscrepancy: totalDiff,
 
 signatureCashier: signatureCashier || user.name || user.fullName,
	opening_cash: activeShift.startingCash,
	cash_sales: stats.systemCashSales,
	card_sales: stats.systemCardSales,
	transfer_sales: stats.systemTransferSales,
	wallet_sales: stats.systemWalletSales,
	expected_cash: stats.expectedCashValue,
	difference: totalDiff,
	closed_at: new Date().toISOString(),
	closed_by: user.name || user.fullName || "الكاشير"
 };

 // Save to Database
 try {
 setActionError(null);
 await SahmDatabaseService.getInstance().saveShift(updatedShift);

 if (isMatched) {
 // Clear active shift from POS since it's fully closed and balanced
 onShiftStateChange(null);
 
 
 // add to history
 const prevHistory = [...shiftHistory];
 const existIdx = prevHistory.findIndex(s => s.id === updatedShift.id);
 if (existIdx >= 0) {
 prevHistory[existIdx] = updatedShift;
 } else {
 prevHistory.unshift(updatedShift);
 }
 setShiftHistory(prevHistory);
 

 triggerNotification(` تم إغلاق ومطابقة الوردية رقم [${updatedShift.id}] بنجاح تام لعدم وجود أي فروقات!`, "success");
 addAuditLog("تسليم وردية", `قام الكاشير ${user.name} بتسليم الوردية رقم [${activeShift.id}] مطابقة تماماً`);
 addAuditLog("إغلاق الوردية", `أغلقت الوردية رقم [${activeShift.id}] تلقائياً لمطابقة الموازنات في الصندوق`);
 } else {
 // Transition active shift state to pending_approval in POS
 onShiftStateChange(updatedShift);
 

 // add/update history
 const prevHistory = [...shiftHistory];
 const existIdx = prevHistory.findIndex(s => s.id === updatedShift.id);
 if (existIdx >= 0) {
 prevHistory[existIdx] = updatedShift;
 } else {
 prevHistory.unshift(updatedShift);
 }
 setShiftHistory(prevHistory);
 

 triggerNotification(`تم حفظ الموازنة وتقديم الوردية كحالة (بانتظار الموافقة) لوجود فروقات جردية.`, "warning");
 addAuditLog("تسليم وردية", `سلم الكاشير ${user.name} الوردية [${activeShift.id}] مع تسجيل فوارق نقدية`);
 addAuditLog("وجود فرق", `فارق جرد كاشير الوردية [${activeShift.id}] عجز/زيادة قدره: كاش (${cashDiff})ر.س، شبكة (${cardDiff})ر.س`);
 }
 } catch (err: any) {
 console.error(err);
 setActionError(err.message || String(err));
 triggerNotification(`فشل إغلاق/تسليم الوردية: ${err.message || err}`, "error");
 }
 };

 // Approve and Lock Shift (Manager Action)
 const handleApproveShift = async (shiftToApprove: Shift) => {
 const isHasDiff = shiftToApprove.cashDiscrepancy !== 0 || shiftToApprove.cardDiscrepancy !== 0;
 const finalStatus = isHasDiff ? 'has_discrepancy' : 'approved';

 const approvedShift: Shift = {
 ...shiftToApprove,
 status: finalStatus,
 approvedBy: user.name || user.fullName,
 approvedTime: new Date().toISOString(),
 approvalNotes: approvalNotes || "تمت المراجعة والمطابقة المباشرة والاعتماد بنجاح.",
 signatureManager: signatureManager || user.name || user.fullName
 };

 try {
 setActionError(null);
 await SahmDatabaseService.getInstance().saveShift(approvedShift);

 // If this was the active shift, clear it so they can open a new one
 if (activeShift && activeShift.id === approvedShift.id) {
 onShiftStateChange(null);
 
 }

 // Save history
 const updatedHistory = shiftHistory.map(s => s.id === approvedShift.id ? approvedShift : s);
 setShiftHistory(updatedHistory);
 

 setApprovalNotes("");
 setSignatureManager("");
 setSelectedHistShift(approvedShift);
 triggerNotification(`تم اعتماد الموازنة المالية وتسليم الوردية رقم [${approvedShift.id}] كـ (${finalStatus === 'approved' ? 'متطابقة بنجاح' : 'يوجد عجز/زيادة'}).`, "success");
 addAuditLog("اعتماد موازنة وردية", `المدير ${user.name} اعتمد تسليم الوردية رقم [${approvedShift.id}] بنتيجة: ${finalStatus === 'approved' ? 'متطابقة' : 'يوجد فارق ' + approvedShift.totalDiscrepancy + ' ريال'}`);
 } catch (err: any) {
 console.error(err);
 setActionError(err.message || String(err));
 triggerNotification(`فشل اعتماد الوردية: ${err.message || err}`, "error");
 }
 };

 // Re-open a Closed Shift (Manager Action)
 const handleReopenShift = async (shiftToReopen: Shift) => {
 const reopened: Shift = {
 ...shiftToReopen,
 status: 'open',
 endTime: undefined,
 approvedBy: undefined,
 approvedTime: undefined
 };

 try {
 setActionError(null);
 await SahmDatabaseService.getInstance().saveShift(reopened);

 // Make this the active shift again
 onShiftStateChange(reopened);
 

 const updatedHistory = shiftHistory.map(s => s.id === reopened.id ? reopened : s);
 setShiftHistory(updatedHistory);
 

 triggerNotification(`تم إعادة فتح الوردية رقم [${shiftToReopen.id}] لمتابعة العمليات وتعديل الفروقات.`, "info");
 addAuditLog("إعادة فتح وردية", `أعاد المدير ${user.name} فتح الوردية رقم [${shiftToReopen.id}] لتمكين التعديل والتشغيل المستمر`);
 } catch (err: any) {
 console.error(err);
 setActionError(err.message || String(err));
 triggerNotification(`فشل إعادة فتح الوردية: ${err.message || err}`, "error");
 }
 };

 // Formatter for WhatsApp share report
 const getWhatsAppShiftReport = (shift: Shift) => {
 let msg = ` *تقرير تسليم وموازنة الوردية الكاشيرية* \n\n`;
 msg += `• *رقم الوردية:* ${shift.id}\n`;
 msg += `• *الكاشير:* ${shift.cashierName}\n`;
 msg += `• *الفرع:* ${shift.branchName}\n`;
 msg += `• *نقطة البيع:* ${shift.posName}\n`;
 msg += `• *تاريخ وحين البدء:* ${new Date(shift.startTime).toLocaleString("ar-SA")}\n`;
 if (shift.endTime) {
 msg += `• *تاريخ وحين الانتهاء:* ${new Date(shift.endTime).toLocaleString("ar-SA")}\n`;
 }
 msg += `• *حالة المطابقة:* ${
 shift.status === 'approved' ? ' متطابقة ومعتمدة' : 
 shift.status === 'has_discrepancy' ? 'يوجد فروقات ومطابقة' : 
 shift.status === 'pending_approval' ? ' قيد المراجعة والاعتماد' : ' الوردية مفتوحة قيد البيع'
 }\n\n`;

 msg += `*الملخص المالي للنظام:* \n`;
 msg += `- عهدة البداية: ${shift.startingCash} ر.س\n`;
 msg += `- إجمالي مبيعات النظام: ${shift.systemTotalSales} ر.س (${shift.systemSalesCount} فواتير)\n`;
 msg += `- مبيعات نقدي المتوقعة: ${shift.systemCashSales} ر.س\n`;
 msg += `- مبيعات الكروت المتوقعة: ${shift.systemCardSales} ر.s\n`;
 msg += `- مجموع الإيداعات والتزويد: ${shift.refills.reduce((s, r) => s + r.amount, 0)} ر.س\n`;
 msg += `- مجموع المصروفات المسجلة: ${shift.expenses.reduce((s, e) => s + e.amount, 0)} ر.س\n`;
 msg += `- *الصافي النقدي المتوقع:* ${shift.startingCash + shift.systemCashSales + shift.refills.reduce((s, r) => s + r.amount, 0) - shift.expenses.reduce((s, e) => s + e.amount, 0)} ر.س\n\n`;

 msg += `*المبالغ الفعلية المدخلة:* \n`;
 msg += `- الكاش المودع فعلياً: ${shift.actualCash} ر.س\n`;
 msg += `- إجمالي الشبكة الفعلي: ${shift.actualCard} ر.س\n`;
 msg += `- فروق نقد الموازنة: *${shift.cashDiscrepancy} ريال سعودي*\n`;
 msg += `- فروق جهاز مدى والشبكة: *${shift.cardDiscrepancy} ريال سعودي*\n\n`;

 if (shift.approvedBy) {
 msg += `*الاعتماد والموثوقية:* \n`;
 msg += `- تم اعتماده بواسطة: ${shift.approvedBy}\n`;
 msg += `- توقيع الكاشير: ${shift.signatureCashier || 'موقع رقمياً'}\n`;
 msg += `- توقيع المدير المستلم: ${shift.signatureManager || 'موقع رقمياً'}\n`;
 msg += `- ملاحظات الإدارة: ${shift.approvalNotes || 'لا توجد'}\n`;
 }

 msg += `\n_مرسل تلقائياً عبر نظام سهم لإدارة نقاط البيع المعتمد 🇸🇦_`;
 return encodeURIComponent(msg);
 };

 // Direct print simulation
 const handlePrintReceipt = (shift: Shift) => {
 const printWindow = window.open('', '_blank');
 if (!printWindow) return;
 
 const refillHtml = shift.refills.map(r => `
 <tr>
 <td style="font-family: monospace; text-align: left;">+${r.amount}</td>
 <td>${r.reason}</td>
 </tr>
 `).join('');

 const expenseHtml = shift.expenses.map(e => `
 <tr>
 <td style="font-family: monospace; text-align: left; color: red;">-${e.amount}</td>
 <td>${e.reason}</td>
 </tr>
 `).join('');

 printWindow.document.write(`
 <html dir="rtl">
 <head>
 <title>تقرير موازنة الوردية #${shift.id}</title>
 <style>
 body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; line-height: 1.6; }
 .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 15px; }
 .title { font-size: 16px; font-weight: bold; margin: 5px 0; }
 .subtitle { font-size: 11px; color: #666; }
 table { width: 100%; border-collapse: collapse; margin-top: 10px; }
 th, td { padding: 6px 4px; text-align: right; font-size: 11px; border-bottom: 1px solid #eee; }
 th { font-weight: bold; background-color: #f9f9f9; }
 .section-title { font-size: 12px; font-weight: bold; margin-top: 15px; border-bottom: 1px solid #333; padding-bottom: 3px; }
 .total-row { font-weight: bold; font-size: 12px; background: #f5f5f5; }
 .discrepancy { font-weight: bold; color: red; }
 .green { color: green; }
 .footer { text-align: center; border-top: 2px dashed #333; margin-top: 20px; padding-top: 10px; font-size: 9px; }
 @media print {
 body { padding: 0; margin: 0; width: 80mm; }
 }
 </style>
 </head>
 <body>
 <div class="header">
 <div class="title">مراسيم الطيب الفاخرة</div>
 <div class="title" style="font-size: 13px;">تقرير موازنة و استلام الوردية</div>
 <div class="subtitle">الربط والتحقق والامتثال السحابي الموحد</div>
 </div>

 <div>
 <strong>رقم الوردية:</strong> ${shift.id}<br/>
 <strong>الكاشير:</strong> ${shift.cashierName}<br/>
 <strong>الفرع:</strong> ${shift.branchName}<br/>
 <strong>نقطة البيع:</strong> ${shift.posName}<br/>
 <strong>تاريخ البدء:</strong> ${new Date(shift.startTime).toLocaleString("ar-SA")}<br/>
 ${shift.endTime ? `<strong>تاريخ الانتهاء:</strong> ${new Date(shift.endTime).toLocaleString("ar-SA")}<br/>` : ''}
 <strong>حالة الموازنة:</strong> ${shift.status.toUpperCase()}
 </div>

 <div class="section-title">ملخص مبيعات المعرض (النظام)</div>
 <table>
 <thead>
 <tr>
 <th>المؤشر الفالي</th>
 <th style="text-align: left;">المبلغ</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td>العهدة البدئية المودعة كاش</td>
 <td style="font-family: monospace; text-align: left;">${shift.startingCash} ر.س</td>
 </tr>
 <tr>
 <td>فواتير المبيعات الكلية (${shift.systemSalesCount} فواتير)</td>
 <td style="font-family: monospace; text-align: left;">${shift.systemTotalSales} ر.س</td>
 </tr>
 <tr>
 <td>نقدي (كاش متوقع)</td>
 <td style="font-family: monospace; text-align: left;">${shift.systemCashSales} ر.س</td>
 </tr>
 <tr>
 <td>شبكة ومدى (متوقع)</td>
 <td style="font-family: monospace; text-align: left;">${shift.systemCardSales} ر.س</td>
 </tr>
 </tbody>
 </table>

 ${shift.refills.length > 0 ? `
 <div class="section-title">عمليات تزويد النقد بالصندوق</div>
 <table>
 <thead>
 <tr>
 <th style="text-align: left;">القيمة</th>
 <th>البيان وملاحظة الصرف</th>
 </tr>
 </thead>
 <tbody>
 ${refillHtml}
 </tbody>
 </table>
 ` : ''}

 ${shift.expenses.length > 0 ? `
 <div class="section-title font-bold">مصروفات الصندوق النثرية</div>
 <table>
 <thead>
 <tr>
 <th style="text-align: left;">القيمة</th>
 <th>البيان وملاحظة الصرف</th>
 </tr>
 </thead>
 <tbody>
 ${expenseHtml}
 </tbody>
 </table>
 ` : ''}

 <div class="section-title">عمليات المطابقة والتسليم الفعلي</div>
 <table>
 <tbody>
 <tr>
 <td>المبلغ الكاش المدخل بالصندوق</td>
 <td style="font-family: monospace; text-align: left; font-weight: bold;">${shift.actualCash} ر.س</td>
 </tr>
 <tr class="total-row">
 <td>إجمالي الكاش المتوقع بالصندوق</td>
 <td style="font-family: monospace; text-align: left;">${shift.startingCash + shift.systemCashSales + shift.refills.reduce((s, r) => s + r.amount, 0) - shift.expenses.reduce((s, e) => s + e.amount, 0)} ر.س</td>
 </tr>
 <tr>
 <td>فرق الكاش الملاحظ (عجز/زيادة)</td>
 <td style="font-family: monospace; text-align: left;" class="discrepancy ${shift.cashDiscrepancy === 0 ? 'green' : ''}">
 ${shift.cashDiscrepancy > 0 ? '+' : ''}${shift.cashDiscrepancy} ر.س
 </td>
 </tr>
 <tr>
 <td>شبكة مدى الفعلي (أوراق جهاز مدى)</td>
 <td style="font-family: monospace; text-align: left; font-weight: bold;">${shift.actualCard} ر.س</td>
 </tr>
 <tr>
 <td>شبكة مدى المتوقع بالنظام</td>
 <td style="font-family: monospace; text-align: left;">${shift.systemCardSales} ر.س</td>
 </tr>
 <tr>
 <td>الفرق في قراءات الشبكات مدى</td>
 <td style="font-family: monospace; text-align: left;" class="discrepancy ${shift.cardDiscrepancy === 0 ? 'green' : ''}">
 ${shift.cardDiscrepancy > 0 ? '+' : ''}${shift.cardDiscrepancy} ر.س
 </td>
 </tr>
 </tbody>
 </table>

 ${shift.approvedBy ? `
 <div class="section-title">اعتمادات الإدارة وتواقيعها</div>
 <div style="font-size: 10px; margin-top: 5px;">
 <strong>المدير المعتمد:</strong> ${shift.approvedBy}<br/>
 <strong>توقيع الكاشير المسلم:</strong> ${shift.signatureCashier || 'موقع إلكترونياً '}<br/>
 <strong>توقيع المدير المستلم:</strong> ${shift.signatureManager || 'موقع موازياً '}<br/>
 <strong>ملحوظة المدير:</strong> ${shift.approvalNotes || 'لا توجد ملاحظات تذكر.'}
 </div>
 ` : ''}

 <div class="footer">
 <p>شكراً لجهودكم المخلصة في خدمة عملاء مراسيم الطيب</p>
 <p>طبع من لوحة تحكم سهم بتاريخ حقيقي ${new Date().toLocaleString("ar-SA")}</p>
 </div>
 <script>
 window.onload = function() { window.print(); }
 </script>
 </body>
 </html>
 `);
 printWindow.document.close();
 triggerNotification(" تم إرسال تقرير الموازنة إلى طابعة فواتير المعرض بنجاح", "info");
 };

 // Get status class helper
 const getStatusBadge = (status: string) => {
 switch (status) {
 case 'open':
 return <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20"> مفتوحة ومستمرة للبيع</span>;
 case 'pending_approval':
 return <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20"> بانتظار الاعتماد المالي</span>;
 case 'approved':
 return <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">متطابقة ومعتمدة</span>;
 case 'has_discrepancy':
 return <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">يوجد عجز ومطابقة</span>;
 default:
 return <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-zinc-800 text-gray-400">مغلقة</span>;
 }
 };

 // Live expected system calculation derived from state
 const liveStats = activeShift ? getShiftSystemStats(activeShift) : null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none" dir="rtl">
 <div 
 className="w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden font-sans"
 style={{ backgroundColor: theme.card, borderColor: theme.border }}
 >
 
 {/* Modal Elegant Header Banner */}
 <div 
 className="p-5 border-b flex items-center justify-between"
 style={{ 
 background: "linear-gradient(90deg, #12182d 0%, #080a13 100%)",
 borderColor: theme.border 
 }}
 >
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
 <Coins className="w-5 h-5 animate-spin" />
 </div>
 <div>
 <h3 className="text-sm font-black text-white">منصة تسليم الوردية وموازنة النقدية الكاشيرية • End Shift Gate</h3>
 <p className="text-[10px] text-gray-400 mt-0.5">
 تطوير وتوثيق تسليم العهدة المالية وتصفير الصناديق طبقاً للائحة الموازنة الميدانية المعتمدة.
 </p>
 </div>
 </div>
 
 <button 
 onClick={onClose}
 className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-400 hover:text-white hover:bg-slate-850 cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Modal Navigation Menu Tabs */}
 <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-900 flex items-center gap-3 justify-between">
 <div className="flex items-center gap-2">
 <button
 onClick={() => { setActiveSubTab('current'); setSelectedHistShift(null); }}
 className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
 activeSubTab === 'current' ? "bg-[#D4AF37] text-slate-950" : "bg-slate-900 text-gray-400 hover:text-gray-200"
 }`}
 >
 وردية التشغيل الحالية 
 </button>
 <button
 onClick={() => { setActiveSubTab('history'); setSelectedHistShift(null); }}
 className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
 activeSubTab === 'history' ? "bg-[#D4AF37] text-slate-950" : "bg-slate-900 text-gray-400 hover:text-gray-200"
 }`}
 >
 <History className="w-3.5 h-3.5" />
 <span>جرد وسجل الوردية السابقة ({shiftHistory.length})</span>
 </button>
 </div>

 <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold">
 {import.meta.env.VITE_DATA_MODE === "supabase" && (
 <button
 onClick={handleSyncWorkspace}
 disabled={isSyncing}
 className="px-2.5 py-1 rounded bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] font-black cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed border-solid"
 >
 <span>{isSyncing ? "جاري المزامنة..." : "مزامنة بيئة العمل"}</span>
 </button>
 )}
 <div>
 جهاز الكاشير الرقمي: <span className="text-gray-300 font-black">{posObj?.name || "نقطة بيع غير محددة"}</span> • الفرع: <span className="text-gray-300 font-black">{branchObj?.name || "عام"}</span>
 </div>
 </div>
 </div>

 {/* Content Body */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6">
 {actionError && (
 <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-3 text-right text-xs text-red-300 animate-pulse border-solid">
 <ShieldAlert className="w-5 h-5 text-red-550 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <strong className="block font-black">خطأ في معالجة العملية:</strong>
 <p className="leading-relaxed font-mono">{actionError}</p>
 </div>
 </div>
 )}
 
 {activeSubTab === 'current' ? (
 
 !activeShift ? (
 /* CASE 1: NO ACTIVE SHIFT IN WORKSPACE (OPENING FLOW) */
 <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl border border-slate-800 bg-[#06080e] shadow-lg space-y-6">
 <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#D4AF37] text-3xl animate-bounce">
 
 </div>
 <div className="space-y-2">
 <h4 className="text-base font-black text-white">فتح وردية كاشير جديدة لإصدار فواتير نقاط البيع</h4>
 <p className="text-xs text-gray-400 leading-relaxed font-sans">
 يتطلب النظام وجود عهدة ميزانية مفتوحة لتتبع عمليات المبيعات النقدية والموثوقية الضريبية. يرجى إدخال مبلغ عهدة البداية (Starting Cash/Float) الموجود فعلياً بصندوق الكاشير حالياً:
 </p>
 </div>

 <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-900 text-right">
 <label className="text-[10px] text-gray-400 font-bold block">• قيمة العهدة النقدية للبداية (ر.س):</label>
 <div className="relative">
 <input 
 type="number"
 value={startingCash}
 onChange={(e) => setStartingCash(Math.max(0, parseFloat(e.target.value) || 0))}
 className="w-full bg-slate-900 border border-slate-800 text-white font-mono font-black text-xl py-2 px-3 rounded-lg focus:border-[#D4AF37] outline-none text-center"
 placeholder="500"
 />
 <span className="absolute left-3 top-3 text-gray-400 text-xs font-extrabold">ريال سعودي</span>
 </div>
 <span className="text-[9px] text-[#D4AF37] leading-tight block">
 * سيتحقق مدير الحسابات من مطابقة هذا الرقم مع عهدة إقفال الكاشير الوردية السابقة.
 </span>
 </div>

 <button
 onClick={handleOpenShift}
 className="w-full p-4 bg-gradient-to-r from-[#E2C974] to-[#B08F26] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md border-none"
 >
 <Play className="w-4 h-4 fill-slate-950" />
 <span>فتح الوردية وتفعيل شاشات البيع الآن </span>
 </button>
 </div>
 ) : (
 /* CASE 2: THERE IS AN OPEN/PENDING ACTIVE SHIFT */
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 
 {/* Right Area: System expect logs and cash replenishment tools */}
 <div className="lg:col-span-4 space-y-4">
 <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-right space-y-3">
 <h4 className="text-xs font-black text-white pb-2 border-b border-slate-800 flex items-center gap-2">
 <Clock className="w-4 h-4 text-[#D4AF37]" />
 <span>بيانات وجلسة الوردية الحالية:</span>
 </h4>
 
 <div className="space-y-2 text-[10.5px] font-sans">
 <div className="flex justify-between items-center bg-slate-950/80 p-2 rounded-lg border border-slate-900">
 <span className="text-gray-400"> رمز الوردية:</span>
 <span className="font-extrabold text-[#D4AF37] font-mono">{activeShift.id}</span>
 </div>
 <div className="flex justify-between items-center bg-slate-950/80 p-2 rounded-lg border border-slate-900">
 <span className="text-gray-400">كاشير الوردية:</span>
 <span className="font-black text-white">{activeShift.cashierName}</span>
 </div>
 <div className="flex justify-between items-center bg-slate-950/80 p-2 rounded-lg border border-slate-900">
 <span className="text-gray-400">الفرع الميداني:</span>
 <span className="font-bold text-gray-200">{activeShift.branchName}</span>
 </div>
 <div className="flex justify-between items-center bg-slate-950/80 p-2 rounded-lg border border-slate-900">
 <span className="text-gray-400"> وقت وتاريخ البدء:</span>
 <span className="font-mono text-gray-300 font-bold text-[9.5px]">
 {new Date(activeShift.startTime).toLocaleTimeString("ar-SA")} - {new Date(activeShift.startTime).toLocaleDateString("ar-SA")}
 </span>
 </div>
 <div className="flex justify-between items-center bg-slate-950/80 p-2 rounded-lg border border-slate-900">
 <span className="text-gray-400"> حالة الوردية:</span>
 <div>{getStatusBadge(activeShift.status)}</div>
 </div>
 </div>
 </div>

 {/* Seed Replenishment Buttons */}
 {activeShift.status === 'open' && (
 <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-right space-y-3">
 <h4 className="text-xs font-black text-white pb-2 border-b border-zinc-800">إدارة حركة السيولة النقدية بالخزنة</h4>
 
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => { setShowRefillForm(!showRefillForm); setShowExpenseForm(false); }}
 className="p-2.5 bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/20 text-sky-400 font-black text-[10px] rounded-lg cursor-pointer transition-all flex flex-col items-center gap-1 text-center"
 >
 <PlusCircle className="w-5 h-5 text-sky-400" />
 <span>تزويد نقطة البيع</span>
 </button>

 <button
 onClick={() => { setShowExpenseForm(!showExpenseForm); setShowRefillForm(false); }}
 className="p-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-black text-[10px] rounded-lg cursor-pointer transition-all flex flex-col items-center gap-1 text-center"
 >
 <Coins className="w-5 h-5 text-red-400" />
 <span>سحب مصروف كاش</span>
 </button>
 </div>

 {/* Cash Seeding Refill Form */}
 {showRefillForm && (
 <div className="p-3 rounded-lg bg-slate-950 border border-sky-500/10 text-right space-y-2 animate-fade-in">
 <label className="text-[9px] text-[#D4AF37] font-bold block">• قيمة التمويل نقدياً (ر.س):</label>
 <input
 type="number"
 value={refillAmount}
 onChange={(e) => setRefillAmount(e.target.value)}
 placeholder="مثال: 200"
 className="w-full p-1.5 text-xs font-mono bg-slate-900 text-white rounded border border-slate-800 outline-none text-center"
 />
 <label className="text-[9px] text-gray-400 font-bold block">• السبب / ملاحظة التزويد:</label>
 <input
 type="text"
 value={refillReason}
 onChange={(e) => setRefillReason(e.target.value)}
 placeholder="صرف فكة ريالات"
 className="w-full p-1.5 text-[10px] bg-slate-900 text-white rounded border border-slate-800 outline-none"
 />
 <button
 onClick={handleAddRefill}
 className="w-full py-1.5 bg-sky-500 text-slate-950 rounded font-black text-[10px] cursor-pointer"
 >
 تأكيد الإيداع بالوردية 
 </button>
 </div>
 )}

 {/* Expense Cash out Form */}
 {showExpenseForm && (
 <div className="p-3 rounded-lg bg-slate-950 border border-red-500/10 text-right space-y-2 animate-fade-in">
 <label className="text-[9px] text-red-400 font-bold block">• قيمة السحب مصروفاً (ر.س):</label>
 <input
 type="number"
 value={expenseAmount}
 onChange={(e) => setExpenseAmount(e.target.value)}
 placeholder="مثال: 50"
 className="w-full p-1.5 text-xs font-mono bg-slate-900 text-white rounded border border-slate-800 outline-none text-center"
 />
 <label className="text-[9px] text-gray-400 font-bold block">• السبب / المبرر المالي المصحوب:</label>
 <input
 type="text"
 value={expenseReason}
 onChange={(e) => setExpenseReason(e.target.value)}
 placeholder="شراء ضيافة للعملاء أو فواتير"
 className="w-full p-1.5 text-[10px] bg-slate-900 text-white rounded border border-slate-800 outline-none"
 />
 <button
 onClick={handleAddExpense}
 className="w-full py-1.5 bg-red-400 text-slate-950 rounded font-black text-[10px] cursor-pointer"
 >
 تأكيد صرف المصروف كاش 
 </button>
 </div>
 )}
 </div>
 )}

 {/* Operational Ledger Details of Seeding & Draw Out */}
 {(activeShift.refills.length > 0 || activeShift.expenses.length > 0) && (
 <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-right text-[10px] space-y-2">
 <span className="text-gray-400 font-bold block">• دفتر النقدية والصرف للوردية:</span>
 <div className="space-y-1 max-h-40 overflow-y-auto">
 {activeShift.refills.map((ref, idx) => (
 <div key={idx} className="p-1.5 rounded bg-sky-500/5 text-sky-400 flex justify-between">
 <span>{ref.reason}</span>
 <span className="font-mono font-bold">+{ref.amount} ر.س</span>
 </div>
 ))}
 {activeShift.expenses.map((exp, idx) => (
 <div key={idx} className="p-1.5 rounded bg-red-500/5 text-red-400 flex justify-between">
 <span>{exp.reason}</span>
 <span className="font-mono font-bold">-{exp.amount} ر.س</span>
 </div>
 ))}
 </div>
 </div>
 )}

 </div>

 {/* Left Area: expected system stats summary & actual handover inputs */}
 <div className="lg:col-span-8 space-y-6">
 
 {/* STEP 1: EXPECTED STATS FROM SYSTEM */}
 <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 text-right space-y-4">
 <h4 className="text-xs font-black text-white pb-2.5 border-b border-slate-800 flex items-center justify-between">
 <span className="block">• الإيرادات والمبيعات المقيدة بالنظام (System Ledger Match):</span>
 <span className="text-[10px] text-gray-400 font-normal">من واقع فواتير المبيعات الصادرة منذ بدء الوردية</span>
 </h4>

 {liveStats && (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 
 <div className="p-3.5 bg-slate-950 font-sans border border-slate-900 rounded-lg">
 <span className="text-[9px] text-gray-500 block leading-tight font-bold">العهدة البدئية المودعة كاش</span>
 <span className="text-sm font-black text-white block mt-1 font-mono">{activeShift.startingCash} <span className="text-[10px]">ر.س</span></span>
 </div>

 <div className="p-3.5 bg-slate-950 font-sans border border-slate-900 rounded-lg">
 <span className="text-[9px] text-[#D4AF37] block leading-tight font-bold">فواتير الـ POS الصادرة</span>
 <span className="text-sm font-black text-[#D4AF37] block mt-1 font-mono">{liveStats.systemSalesCount} <span className="text-[10px]">فواتير</span></span>
 </div>

 <div className="p-3.5 bg-slate-950 font-sans border border-slate-900 rounded-lg">
 <span className="text-[9px] text-sky-400 block leading-tight font-bold">المبيعات الإجمالية المكتملة</span>
 <span className="text-sm font-black text-sky-400 block mt-1 font-mono">{liveStats.systemTotalSales} <span className="text-[10px]">ر.س</span></span>
 </div>

 <div className="p-3.5 bg-slate-950 font-sans border border-slate-900 rounded-lg">
 <span className="text-[9px] text-teal-400 block leading-tight font-bold">الضريبة المضافة المشمولة</span>
 <span className="text-sm font-black text-emerald-400 block mt-1 font-mono">{liveStats.systemTax} <span className="text-[10px]">ر.س</span></span>
 </div>

 </div>
 )}

 {liveStats && (
 <div className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-900 space-y-3 font-sans">
 <span className="text-[10px] text-[#D4AF37] font-extrabold block uppercase tracking-wider">• تفاصيل توقعات طرائق السداد والالتزام المالي:</span>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
 <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-1.5">
 <span className="text-gray-400">النقد المتوقع بالصندوق (عهدة + مبيعات نقدي + تزويد - مصروف):</span>
 <span className="font-extrabold text-white font-mono">{liveStats.expectedCashValue} ر.س</span>
 </div>
 
 <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-1.5">
 <span className="text-gray-400"> شبكة ومدى المتوقعة (أجهزة التحصيل):</span>
 <span className="font-extrabold text-white font-mono">{liveStats.expectedCardValue} ر.س</span>
 </div>

 <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-1.5">
 <span className="text-gray-400"> تحويلات بنكية مباشرة مستهدفة:</span>
 <span className="font-extrabold text-gray-300 font-mono">{liveStats.systemTransferSales} ر.س</span>
 </div>

 <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-1.5">
 <span className="text-gray-400"> محافظ الكترونية وبوابات:</span>
 <span className="font-extrabold text-gray-300 font-mono">{liveStats.systemWalletSales} ر.س</span>
 </div>
 </div>

 <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-center flex items-center justify-between">
 <span className="text-[10.5px] font-bold text-gray-400">إجمالي النقدية السحابية المتوقعة بالوردية (Net Expected):</span>
 <span className="text-sm font-black text-emerald-400 font-mono">{liveStats.expectedNet} ريال سعودي</span>
 </div>
 </div>
 )}
 </div>

 {/* STEP 2: ACTUAL ENTRY BY CASHIER */}
 {activeShift.status === 'open' ? (
 <div className="p-5 rounded-xl border border-slate-800 bg-[#070912] text-right space-y-4">
 <h4 className="text-xs font-black text-white pb-1 border-b border-indigo-950/20 flex items-center justify-between">
 <span className="block">• الإدخال المالي الفعلي والتسوية (Manual Cash Count):</span>
 <span className="text-[10px] text-[#D4AF37] font-extrabold">خطوة إقفال الكاشير</span>
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• النقد والورق الفعلي بالصندوق (ر.س):</label>
 <input
 type="number"
 value={actualCash}
 onChange={(e) => setActualCash(e.target.value)}
 placeholder="قم بعد الكاش بالدرج وإدخاله هنا..."
 className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-black py-2.5 px-3 rounded-lg text-lg outline-none focus:border-[#D4AF37] text-center"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• إجمالي الشبكة الفعلي (من ماكينة مدى) (ر.س):</label>
 <input
 type="number"
 value={actualCard}
 onChange={(e) => setActualCard(e.target.value)}
 placeholder="اطبع تقرير الإقفال من جهاز مدى وأدخله..."
 className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono font-black py-2.5 px-3 rounded-lg text-lg outline-none focus:border-[#D4AF37] text-center"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• التحويلات الفعلية المستلمة بالبنك (ر.س):</label>
 <input
 type="number"
 value={actualTransfers}
 onChange={(e) => setActualTransfers(e.target.value)}
 placeholder="التحويلات المقروءة بكشوف الإيبان..."
 className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono py-2 px-3 rounded-lg text-xs outline-none text-center"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• مصروفات عهد مسحوبة (نثريات مصغرة):</label>
 <input
 type="number"
 value={actualExpenses}
 onChange={(e) => setActualExpenses(e.target.value)}
 placeholder="المصروف الكلي الفعلي..."
 className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono py-2 px-3 rounded-lg text-xs outline-none text-center"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• اسم المدير/المستلم المخول للوردية:</label>
 <input
 type="text"
 value={receiverManagerName}
 onChange={(e) => setReceiverManagerName(e.target.value)}
 placeholder="اسم المستلم المسؤول..."
 className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg text-xs outline-none"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• توقيع الكاشير الرقمي برقم الهوية أو الاسم:</label>
 <input
 type="text"
 value={signatureCashier}
 onChange={(e) => setSignatureCashier(e.target.value)}
 placeholder="ادخل اسمك كإمضاء وتسوية للجمارك..."
 className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg text-xs outline-none"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-[10px] text-gray-400 font-bold block">• ملحوظة كاشير الوردية (سبب الفروقات إن وجدت):</label>
 <textarea
 rows={2}
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="مثال: يوجد زيادة كاش بسبب استلام مبالغ مسبقة لطلبات حجز..."
 className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-lg text-xs outline-none"
 />
 </div>

 {/* LIVE MATCH RECONCILIATION PREVIEW */}
 {liveStats && (actualCash !== "" || actualCard !== "") && (
 <div className="p-4 rounded-xl space-y-3 animate-fade-in border border-slate-800 bg-[#0c101c]">
 <span className="text-[10px] font-black text-rose-400 block">• قراءة ومطابقة الموازنة الحية الفورية (Live Reconciliation Match):</span>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px] font-mono leading-none">
 <div className="bg-slate-950 p-2.5 rounded border border-slate-900 flex justify-between items-center">
 <span className="text-gray-400">فرق الكاش اليدوي (Cash Diff):</span>
 <span className={`font-black ${(parseFloat(actualCash) || 0) - liveStats.expectedCashValue === 0 ? "text-emerald-400" : "text-red-400"}`}>
 {((parseFloat(actualCash) || 0) - liveStats.expectedCashValue).toLocaleString("ar-SA")} ر.س
 </span>
 </div>

 <div className="bg-slate-950 p-2.5 rounded border border-slate-900 flex justify-between items-center">
 <span className="text-gray-400">فرق الشبكة/مدى (Device Diff):</span>
 <span className={`font-black ${(parseFloat(actualCard) || 0) - liveStats.expectedCardValue === 0 ? "text-emerald-400" : "text-rose-400"}`}>
 {((parseFloat(actualCard) || 0) - liveStats.expectedCardValue).toLocaleString("ar-SA")} ر.س
 </span>
 </div>
 </div>

 <div className="text-center p-2 rounded bg-slate-900 text-xs font-black">
 {((parseFloat(actualCash) || 0) - liveStats.expectedCashValue === 0) && ((parseFloat(actualCard) || 0) - liveStats.expectedCardValue === 0) ? (
 <span className="text-emerald-400 flex items-center justify-center gap-1.5">
 <CheckCircle2 className="w-4 h-4 animate-bounce" />
 موازنة الصندوق متطابقة وصافية تماماً! 
 </span>
 ) : (
 <span className="text-red-400 flex items-center justify-center gap-1.5">
 <AlertTriangle className="w-4 h-4 text-red-400" />
 يوجد فوارق جردية نقدية/شبكة (يتوجب مراجعة وتعديل الـ POS) ️
 </span>
 )}
 </div>
 </div>
 )}

 <button
 onClick={handleSubmitHandover}
 className="w-full p-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
 >
 <Save className="w-4 h-4" />
 <span>إنهاء عهدتي وتسليم الوردية للمدير المراجع </span>
 </button>
 </div>
 ) : (
 /* CASE 3: SHIFT CLOSED / PENDING APPROVAL (APPROVAL WORKFLOW) */
 <div className="p-5 rounded-xl border border-slate-800 bg-[#090b12] text-right space-y-4">
 
 <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-start gap-3">
 <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
 <div className="space-y-1 font-sans">
 <h5 className="text-xs font-black text-white">الوردية بانتظار الاعتماد المالي والتحقق من الموازنة:</h5>
 <p className="text-[10px] text-gray-300 leading-relaxed">
 تم تسليم الوردية بنجاح وهي مغلقة الآن لعمليات البيع. بانتظار المدير أو مالك المنظومة لاعتماد البيانات ومطابقتها للتأكد من نزاهة الصناديق وربط مبيعات اليوم مع منظومة المحاسبة سهم.
 </p>
 </div>
 </div>

 <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div className="space-y-2">
 <span className="text-gray-400 block font-bold">• المبالغ المقيدة فعلياً (تقرير الكاشير):</span>
 <span className="text-[11px] block font-mono text-amber-400 font-black">- كاش الصندوق الفعلي: {activeShift.actualCash} ر.س</span>
 <span className="text-[11px] block font-mono text-gray-200 font-bold">- إجمالي جهاز مدى الفعلي: {activeShift.actualCard} ر.س</span>
 <span className="text-[11px] block text-gray-300">- تعليقات الكاشير: {activeShift.notes || "لا توجد ملحوظة كاشير"}</span>
 </div>

 <div className="space-y-2">
 <span className="text-gray-400 block font-bold">• فروقات الموازنة وجدول الجرد:</span>
 <span className={`text-[11px] block font-mono font-black ${activeShift.cashDiscrepancy === 0 ? "text-emerald-400" : "text-rose-400"}`}>
 - فرق الخزن النقدية: {activeShift.cashDiscrepancy} ر.س {activeShift.cashDiscrepancy === 0 ? "" : "️"}
 </span>
 <span className={`text-[11px] block font-mono font-black ${activeShift.cardDiscrepancy === 0 ? "text-emerald-400" : "text-rose-400"}`}>
 - فرق مدى والشبكات: {activeShift.cardDiscrepancy} ر.س {activeShift.cardDiscrepancy === 0 ? "" : "️"}
 </span>
 <span className="text-[11px] block font-bold text-gray-400">- المدير المستهدف للاستلام: {activeShift.receiverManagerName}</span>
 </div>
 </div>

 {/* MANAGER EXCLUSIVE SECTIONS & PERMISSIONS */}
 {isManagerOrOwner ? (
 <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-900/60 text-right space-y-3">
 <span className="text-[10px] font-black text-[#D4AF37] block flex items-center gap-1.5">
 <UserCheck className="w-4 h-4 text-amber-500" />
 بوابة المصادقة والاعتماد المالي (منظومة الرقابة المالية):
 </span>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[9.5px] text-gray-400 font-bold block">• ملاحظات اعتماد وتدقيق المدير:</label>
 <input
 type="text"
 value={approvalNotes}
 onChange={(e) => setApprovalNotes(e.target.value)}
 placeholder="مضبوط، تم مراجعة الصرف والوديعة..."
 className="w-full bg-slate-950 border border-slate-800 text-white py-1.5 px-2.5 rounded-lg text-xs outline-none focus:border-amber-500"
 />
 </div>

 <div className="space-y-1">
 <label className="text-[9.5px] text-gray-400 font-bold block">• توقيع وإمضاء المدير المعتمد:</label>
 <input
 type="text"
 value={signatureManager}
 onChange={(e) => setSignatureManager(e.target.value)}
 placeholder="ادخل اسمك كمدير معتمد..."
 className="w-full bg-slate-950 border border-slate-800 text-white py-1.5 px-2.5 rounded-lg text-xs outline-none focus:border-amber-500"
 />
 </div>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => handleApproveShift(activeShift)}
 className="flex-1 py-3 bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
 >
 <Check className="w-4 h-4" />
 <span>اعتماد الموازنة وإغلاق تسليم الوردية نهائياً </span>
 </button>

 <button
 onClick={() => handleReopenShift(activeShift)}
 className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
 >
 <Edit3 className="w-3.5 h-3.5" />
 <span>إعادة الفتح للتصحيح </span>
 </button>
 </div>
 </div>
 ) : (
 <div className="p-3.5 rounded-xl bg-orange-500/5 text-slate-400 border border-slate-900 text-center text-[10px]">
 حسابك مقيد كأخصائي كاشير. يرجى إبلاغ المدير المناوب أو المحاسب القانوني للدراسة والاعتماد المالي النهائي للوردية وإغلاق التقرير.
 </div>
 )}

 {/* Printing and exporting triggers */}
 <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
 <button
 onClick={() => handlePrintReceipt(activeShift)}
 className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-gray-300 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <Printer className="w-3.5 h-3.5 text-sky-400" />
 <span>طباعة المباشر </span>
 </button>
 
 <a
 href={`https://api.whatsapp.com/send?text=${getWhatsAppShiftReport(activeShift)}`}
 target="_blank"
 rel="noreferrer"
 className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <Share2 className="w-3.5 h-3.5 text-emerald-400" />
 <span>إرسال واتساب للمدير </span>
 </a>

 <button
 onClick={() => {
 window.print();
 triggerNotification("جاري تصدير ومطابقة PDF بجودة عالية...", "success");
 }}
 className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-500 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <Download className="w-3.5 h-3.5 text-amber-500" />
 <span>تقرير PDF </span>
 </button>
 </div>

 </div>
 )}

 </div>

 </div>
 )

 ) : (
 
 /* CASE 4: HISTORICAL SHIFTS ARCHIVE LOG */
 <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
 
 {/* Right panel: directory/list of old shifts */}
 <div className="md:col-span-5 space-y-3">
 <span className="text-[10px] font-black text-[#D4AF37] block">• قائمة الفهارس القديمة وموازنات الصناديق:</span>
 
 {shiftHistory.length === 0 ? (
 <p className="text-center p-8 bg-slate-950/40 rounded-xl border border-slate-900 text-[10.5px] text-gray-500">
 لا تتوفر أي تسويات أو ورديات سابقة مغلّقة ومؤرشفة بالصندوق بعد.
 </p>
 ) : (
 <div className="space-y-2 max-h-[58vh] overflow-y-auto">
 {shiftHistory.map((shift) => (
 <button
 key={shift.id}
 onClick={() => setSelectedHistShift(shift)}
 className={`w-full p-3 rounded-lg border text-right transition-all flex justify-between items-center cursor-pointer font-sans select-none block ${
 selectedHistShift?.id === shift.id 
 ? "bg-slate-900 border-amber-500" 
 : "bg-slate-950 border-slate-900 hover:border-slate-800"
 }`}
 >
 <div className="space-y-1.5 text-right">
 <span className="text-[11px] font-black text-[#D4AF37] block font-mono">وردية #{shift.id}</span>
 <span className="text-[9.5px] text-gray-400 block font-normal">{shift.cashierName} • {shift.branchName}</span>
 <span className="text-[8px] text-gray-500 block font-medium">
 {new Date(shift.startTime).toLocaleDateString("ar-SA")} • {new Date(shift.startTime).toLocaleTimeString("ar-SA")}
 </span>
 </div>

 <div className="text-left space-y-1">
 <div className="text-[9px] block font-bold text-gray-400">
 الفرق: {(shift.cashDiscrepancy + shift.cardDiscrepancy).toLocaleString("ar-SA")} ر.س
 </div>
 <div>{getStatusBadge(shift.status)}</div>
 </div>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Left panel: Detailed single historical shift view */}
 <div className="md:col-span-7">
 {selectedHistShift ? (
 <div className="p-5 rounded-xl border border-slate-800 bg-[#090c14] space-y-5 animate-fade-in text-right">
 
 <div className="flex justify-between items-start border-b border-slate-800 pb-3">
 <div>
 <h4 className="text-xs font-black text-white font-mono">تفاصيل موازنة و إقفال الوردية #{selectedHistShift.id}</h4>
 <span className="text-[10px] text-gray-400 font-normal">تاريخ التسوية: {new Date(selectedHistShift.startTime).toLocaleDateString("ar-SA")}</span>
 </div>
 
 <div className="flex items-center gap-1">
 {selectedHistShift.status === 'pending_approval' && isManagerOrOwner && (
 <button
 onClick={() => handleApproveShift(selectedHistShift)}
 className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] py-1.5 px-3 rounded cursor-pointer leading-none"
 >
 اعتماد الاستلام الآن 
 </button>
 )}
 {getStatusBadge(selectedHistShift.status)}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 text-[11px] font-sans">
 <div className="p-2.5 rounded bg-slate-950 border border-slate-900 space-y-1 text-right">
 <span className="text-gray-400 block font-bold">معلومات البيع بالفرع:</span>
 <span>• الكاشير: <span className="text-[#D4AF37] font-bold">{selectedHistShift.cashierName}</span></span><br/>
 <span>• جهاز الـ POS: {selectedHistShift.posName}</span><br/>
 <span>• الفرع والجغرافيا: {selectedHistShift.branchName}</span><br/>
 <span>• عهدة البداية المودعة: {selectedHistShift.startingCash} ر.س</span>
 </div>

 <div className="p-2.5 rounded bg-slate-950 border border-slate-900 space-y-1 text-right">
 <span className="text-gray-500 block font-bold">قراءات النظام السحابية:</span>
 <span>• إجمالي المبيعات: {selectedHistShift.systemTotalSales} ر.س ({selectedHistShift.systemSalesCount} فواتير)</span><br/>
 <span>• المرتجعات / الخصومات: 0 / 0 ر.س</span><br/>
 <span>• ضريبة المحاسبة (15%): {selectedHistShift.systemTax} ر.س</span><br/>
 <span>• الصافي المتوقع: {selectedHistShift.expectedNet} ر.س</span>
 </div>
 </div>

 {/* RECONCILIATION SUMMARY BOX */}
 <div className="p-4 rounded-lg bg-slate-950 border border-slate-900 space-y-2 text-right">
 <span className="text-[10px] text-[#D4AF37] font-black block">• جدول المراجعة والفرق المالي:</span>
 
 <div className="space-y-1.5 text-xs font-mono">
 <div className="flex justify-between items-center border-b border-slate-900 pb-1">
 <span className="text-gray-400">إجمالي الكاش المودع فعلياً:</span>
 <span className="font-bold text-white text-right">{selectedHistShift.actualCash} ر.س</span>
 </div>

 <div className="flex justify-between items-center border-b border-slate-900 pb-1 font-bold">
 <span className="text-gray-400">الكاش المتوقع بنقدي الصندوق:</span>
 <span>
 {selectedHistShift.startingCash + selectedHistShift.systemCashSales + selectedHistShift.refills.reduce((s, r) => s + r.amount, 0) - selectedHistShift.expenses.reduce((s, e) => s + e.amount, 0)} ر.س
 </span>
 </div>

 <div className="flex justify-between items-center border-b border-slate-900 pb-1">
 <span className="text-gray-400">عجز / زيادة الكاش (Cash Discrepancy):</span>
 <span className={selectedHistShift.cashDiscrepancy === 0 ? "text-emerald-400" : "text-rose-400"}>
 {selectedHistShift.cashDiscrepancy > 0 ? "+" : ""}{selectedHistShift.cashDiscrepancy} ر.س
 </span>
 </div>

 <div className="flex justify-between items-center border-b border-slate-900 pb-1">
 <span className="text-gray-400"> إجمالي مدى والشبكات الفعلي:</span>
 <span className="font-bold text-slate-100">{selectedHistShift.actualCard} ر.س</span>
 </div>

 <div className="flex justify-between items-center border-b border-slate-900 pb-1">
 <span className="text-gray-400"> شبكة مدى المتوقعة بالنظام:</span>
 <span>{selectedHistShift.systemCardSales} ر.س</span>
 </div>

 <div className="flex justify-between items-center border-b border-slate-900 pb-1">
 <span className="text-gray-400"> عجز / زيادة الشبكة والمكينات:</span>
 <span className={selectedHistShift.cardDiscrepancy === 0 ? "text-emerald-400" : "text-rose-400"}>
 {selectedHistShift.cardDiscrepancy > 0 ? "+" : ""}{selectedHistShift.cardDiscrepancy} ر.s
 </span>
 </div>
 </div>

 <div className="pt-2 text-center text-xs font-black border-t border-slate-900">
 {selectedHistShift.cashDiscrepancy === 0 && selectedHistShift.cardDiscrepancy === 0 ? (
 <span className="text-emerald-400"> متطابقة وخالية من الأخطاء </span>
 ) : (
 <span className="text-red-400">يوجد عجز مالي بمقدار {Math.abs(selectedHistShift.cashDiscrepancy + selectedHistShift.cardDiscrepancy)} ريال سعودي</span>
 )}
 </div>
 </div>

 {/* MANAGER AND AUDIT DISCLOSURE */}
 {selectedHistShift.approvedBy && (
 <div className="p-3 bg-[#D4AF37]/5 rounded border border-amber-500/10 text-xs text-right text-gray-300">
 <strong>تفاصيل المصادقة والاعتماد المالي:</strong><br/>
 <span>• اعتمدت الموازنة بواسطة: {selectedHistShift.approvedBy} ({new Date(selectedHistShift.approvedBy ? selectedHistShift.approvedTime || '' : '').toLocaleString("ar-SA")})</span><br/>
 <span>• توقيع الكاشير المسؤل: {selectedHistShift.signatureCashier}</span><br/>
 <span>• توقيع المدير المستلم: {selectedHistShift.signatureManager}</span><br/>
 <span>• ملخص رقابة الإدارة: {selectedHistShift.approvalNotes}</span>
 </div>
 )}

 {/* Actions bar */}
 <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
 <button
 onClick={() => handlePrintReceipt(selectedHistShift)}
 className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-gray-300 font-bold text-[10px] rounded flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <Printer className="w-3.5 h-3.5 text-sky-400" />
 <span>طباعة التقرير الكاشيري </span>
 </button>
 
 <a
 href={`https://api.whatsapp.com/send?text=${getWhatsAppShiftReport(selectedHistShift)}`}
 target="_blank"
 rel="noreferrer"
 className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-[10px] rounded flex items-center justify-center gap-1.5 cursor-pointer text-center"
 >
 <Share2 className="w-3.5 h-3.5 text-emerald-400" />
 <span>مشاركة المدير واتساب </span>
 </a>

 {(user.role === 'tenant_owner' || user.role === 'admin' || user.role === 'system_admin' || user.permissions?.includes("pos:shift:close")) && (
 <button
 onClick={() => {
 if (window.confirm(`هل أنت متأكد من رغبتك بحذف تقرير موازنة الوردية #${selectedHistShift.id} نهائياً؟`)) {
 const updated = shiftHistory.filter(s => s.id !== selectedHistShift.id);
 setShiftHistory(updated);
 
 setSelectedHistShift(null);
 triggerNotification("تم حذف موازنة الوردية من الأرشيف الميداني بنجاح.", "success");
 }
 }}
 className="p-1 px-3 bg-red-650 hover:bg-red-700 border border-red-500/10 text-white font-bold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 </div>
 ) : (
 <div className="p-12 text-center border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/30 rounded-xl">
 <History className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
 <p className="text-xs text-gray-500">الرجاء اختيار وردية جرد مالي سابقة من اليمين لعرض تقارير الموازنة والمطابقات الحية تفصيلاً</p>
 </div>
 )}
 </div>

 </div>

 )}

 </div>

 </div>
 </div>
 );
}
