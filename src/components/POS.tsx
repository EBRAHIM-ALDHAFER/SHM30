import React, { useState, useEffect } from "react";
import { Product, Invoice, Customer, ThemeColors, User } from "../types";
import { 
  Search, Tablet, Coins, CreditCard, Apple, CheckCircle2, 
  Printer, X, Send, Sparkles, ShoppingCart, Plus, Minus, Trash2, ShieldAlert,
  Heart, Star, Bookmark, Award, Share2, Download, RefreshCw, Flame, Users, 
  Landmark, Layers, ToggleLeft, ToggleRight, Database, TrendingUp, Calendar, 
  DollarSign, Eye, Play, Lock, Shield, Coffee, ChevronDown, CheckCircle,
  Minimize, Maximize, Minimize2, Maximize2, Package, Settings, Store,
  LockOpen, UserCheck, Check, Edit3, Camera, PlusCircle, FileSpreadsheet, Scale
} from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import AIProductBuilder from "./AIProductBuilder";

import { productService } from "../core/database/productService";
import { posService, POSSettings, getDefaultSettings } from "../core/database/posService";
import { SahmDatabaseService } from "../core/database/dbService";
import { SubscriptionGuard } from "../core/database/subscriptionGuard";
import PosSettingsModal from "./PosSettingsModal";
import ShiftHandoverModal, { Shift } from "./ShiftHandoverModal";
import CameraBarcodeScanner from "./CameraBarcodeScanner";
import { printInvoiceDirect, exportInvoiceToPDF, runInvoiceShareWhatsApp, CompanyInfo } from "../utils/invoiceService";

interface POSProps {
  products: Product[];
  setProducts: (prods: Product[]) => void;
  invoices: Invoice[];
  setInvoices: (invs: Invoice[]) => void;
  customers: Customer[];
  setCustomers: (custs: Customer[]) => void;
  theme: ThemeColors;
  user: User;
  isPosFullscreen?: boolean;
  setIsPosFullscreen?: (val: boolean) => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  // Workspace Environment Settings
  activeBranchId?: string;
  activeWarehouseId?: string;
  activePosId?: string;
  branches?: any[];
  warehouses?: any[];
  posUnits?: any[];
}

interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number; // custom item-level discount if any
}

interface SuspendedBill {
  id: string;
  cart: CartItem[];
  customer: string;
  additionalDiscount: number;
  time: string;
  date: string;
  total: number;
  notes?: string;
}

// Map each product to high-res beautiful Arabesque-themed Unsplash photos for a realistic look
const getProductImage = (product: Product): string => {
  if (product && (product as any).image) {
    return (product as any).image;
  }
  const name = product.name.toLowerCase();
  const cat = product.category.toLowerCase();
  
  if (name.includes("قهوة") || cat.includes("مشروبات") || name.includes("شاي") || name.includes("مشروب")) {
    if (name.includes("شاي") || name.includes("أخضر")) {
      return "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=350"; // Premium organic green tea cup
    }
    return "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=350"; // Arabic coffee flatlay
  }
  if (name.includes("تمر") || name.includes("سكري") || name.includes("غذائية")) {
    if (name.includes("زيت") || name.includes("زيتون")) {
      return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=350"; // olive oil
    }
    return "https://images.unsplash.com/photo-1569870499705-504209102861?auto=format&fit=crop&q=80&w=350"; // Dates bowl
  }
  if (name.includes("بخور") || name.includes("كلمنتان") || cat.includes("بخور") || cat.includes("الطيب")) {
    return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=350"; // Luxury incense burner
  }
  if (name.includes("زعفران") || cat.includes("زعفران") || name.includes("بهار")) {
    return "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=350"; // Saffron threads
  }
  if (name.includes("دهن") || name.includes("عطر") || name.includes("سيوفي") || cat.includes("عطور") || cat.includes("دهن عود")) {
    return "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=350"; // Perfume bottle
  }
  return "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=350"; // Amber liquid mockup
};

export default function POS({
  products: rawProducts,
  setProducts,
  invoices: rawInvoices,
  setInvoices,
  customers,
  setCustomers,
  theme,
  user,
  isPosFullscreen = false,
  setIsPosFullscreen = () => {},
  triggerNotification = () => {},
  addAuditLog = () => {},
  activeBranchId = "branch_riyadh_main",
  activeWarehouseId = "warehouse_1",
  activePosId = "pos_1",
  branches = [],
  warehouses = [],
  posUnits = []
}: POSProps) {
  // Overriding product stock based on selected Warehouse (Requirement 7)
  const currentWarehouseObj = warehouses?.find(w => w.id === activeWarehouseId);
  const products = rawProducts.map(p => {
    if (currentWarehouseObj && currentWarehouseObj.items) {
      const whItem = currentWarehouseObj.items.find((item: any) => item.productId === p.id);
      if (whItem) {
        return { ...p, stock: whItem.stock };
      }
    }
    return p;
  });

  // Overriding invoices to only include active branch (Requirement 6)
  const db = SahmDatabaseService.getInstance();
  const resolvedActiveBranch = db.resolveActiveBranchId(activeBranchId, activeWarehouseId ? undefined : (user.storeId || "store_1"));

  const invoices = rawInvoices.filter(inv => {
    const invBranch = db.resolveActiveBranchId(inv.branch_id || (inv as any).branchId || undefined, inv.store_id || (inv as any).storeId || undefined);
    return !resolvedActiveBranch || !invBranch || invBranch === resolvedActiveBranch;
  });

  // Get active selected environment references
  const activeBranchRef = branches.find(b => b.id === activeBranchId);
  const activeWarehouseRef = warehouses.find(w => w.id === activeWarehouseId);
  const activePosRef = posUnits.find(p => p.id === activePosId);

  const isPosDeactivated = activePosRef && (
    activePosRef.status === "غير نشط" || 
    activePosRef.status === "غير نشطة" || 
    activePosRef.status === "متوقف" || 
    activePosRef.status === "متوقفة" || 
    activePosRef.is_active === false || 
    activePosRef.isActive === false
  );

  // POS Settings & Permissions state
  const [posSettings, setPosSettings] = useState<POSSettings>(() => posService.getSettings(activePosId, activeWarehouseId));
  const [selectedTemplate, setSelectedTemplate] = useState<string>("حراري - 80مم");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [busyCheckout, setBusyCheckout] = useState(false);

  const [hasPOSAccessState, setHasPOSAccessState] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPOSAccess = async () => {
      const tenantId = user?.tenant_id || localStorage.getItem("sahm_impersonate_tenant_id") || "tenant-default";
      const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(user?.role || "").trim());
      if (isPlatform || tenantId === "tenant-local") {
        setHasPOSAccessState(true);
        return;
      }
      const guard = SubscriptionGuard.getInstance();
      const hasAccess = await guard.canUseFeature(tenantId, "pos");
      setHasPOSAccessState(hasAccess);
    };
    checkPOSAccess();
  }, [user, activePosId]);

  // Daily Balancing & Shift Handover state
  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    db.getActiveShift(String(user.id), activePosId)
      .then((shift) => {
        if (shift) {
          setActiveShift(shift);
          const event = new CustomEvent("sahm_active_shift_changed", { detail: shift });
          window.dispatchEvent(event);
        } else {
          setActiveShift(null);
          const event = new CustomEvent("sahm_active_shift_changed", { detail: null });
          window.dispatchEvent(event);
          setPOSView("shift_opening_balance");
        }
      })
      .catch((err) => {
        console.error("Failed to load active shift:", err);
        triggerNotification("تعذر جلب الوردية الحالية من قاعدة البيانات", "error");
      });
  }, [user.id, activePosId]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // UI View state for shift transitions
  const [posView, setPOSView] = useState<"shift_opening_balance" | "cashier" | "shift_handover" | "shift_closed" | "shift_pending_approval">("shift_opening_balance");

  // Shift Handover Input States (Closings)
  const [actualCash, setActualCash] = useState<string>("");
  const [actualCard, setActualCard] = useState<string>("");
  const [actualTransfers, setActualTransfers] = useState<string>("");
  const [actualExpenses, setActualExpenses] = useState<string>("");
  const [handoverNotes, setHandoverNotes] = useState<string>("");
  const [receiverManagerName, setReceiverManagerName] = useState<string>("");

  useEffect(() => {
    if (!activeShift) {
      setPOSView("shift_opening_balance");
    } else if (activeShift.status === "open") {
      setPOSView("cashier");
    } else if (activeShift.status === "closed" || activeShift.status === "approved" || activeShift.status === "has_discrepancy") {
      setPOSView("shift_closed");
    } else if (activeShift.status === "pending_approval") {
      setPOSView("shift_pending_approval");
    }
  }, [activeShift]);

  // Open Shift Form States
  const [openingStartingCash, setOpeningStartingCash] = useState<number>(500);
  const [openingGiverManager, setOpeningGiverManager] = useState<string>("");
  const [openingNotes, setOpeningNotes] = useState<string>("");

  const getShiftSystemStats = (shift: Shift) => {
    const db = SahmDatabaseService.getInstance();
    const resolvedActiveBranch = db.resolveActiveBranchId(activeBranchId, activeWarehouseId ? undefined : (user.storeId || "store_1"));
    const shiftInvoices = rawInvoices.filter(inv => {
      const invBranch = db.resolveActiveBranchId(inv.branch_id || (inv as any).branchId || undefined, inv.store_id || (inv as any).storeId || undefined);
      if (resolvedActiveBranch && invBranch !== resolvedActiveBranch) return false;
      const shiftStartStr = shift.startTime.split('T')[0];
      return inv.date >= shiftStartStr;
    });

    const systemSalesCount = shiftInvoices.length;
    const systemTotalSales = shiftInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Smart distribution matching payment method simulations
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

    const sumRefills = (shift.refills || []).reduce((s, r) => s + r.amount, 0);
    const sumExpenses = (shift.expenses || []).reduce((s, e) => s + e.amount, 0);

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

  const closeShift = async (actualCashVal: number, actualCardVal: number, actualTransferVal: number, actualExpenseVal: number, notesVal: string) => {
    if (!activeShift) return;

    const stats = getShiftSystemStats(activeShift);
    
    // Differences
    const cashDiff = actualCashVal - stats.expectedCashValue;
    const cardDiff = actualCardVal - stats.expectedCardValue;
    const transferDiff = actualTransferVal - stats.systemTransferSales;
    const totalDiff = cashDiff + cardDiff + transferDiff;

    const hasDifference = (cashDiff !== 0) || (cardDiff !== 0) || (transferDiff !== 0);
    const finalStatus = hasDifference ? "pending_approval" : "closed";

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
      actualCash: actualCashVal,
      actualCard: actualCardVal,
      actualTransfers: actualTransferVal,
      actualExpenses: actualExpenseVal,
      notes: notesVal,
      receiverManagerName: receiverManagerName || "المدير المناوب",

      // differences
      cashDiscrepancy: cashDiff,
      cardDiscrepancy: cardDiff,
      totalDiscrepancy: totalDiff,
      
      signatureCashier: user.name || user.fullName
    };

    const db = SahmDatabaseService.getInstance();
    try {
      await db.saveShift(updatedShift);
    } catch (err: any) {
      addToast(`❌ فشل إقفال الوردية: ${err.message || err}`, "error");
      return;
    }

    // Update state and dispatch event
    setActiveShift(updatedShift);
    window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: updatedShift }));

    // Clear cart and extra discounts
    setCart([]);
    setAdditionalDiscount(0);

    if (hasDifference) {
      setPOSView("shift_pending_approval");
      addToast("⚠️ تم تصدير موازنة الوردية بنجاح ونظراً لوجود فروقات جيبية فهي بانتظار موافقة المشرف.", "warning");
    } else {
      setPOSView("shift_closed");
      addToast("✅ تم إقفال الوردية بالكامل وإغلاق الصناديق الكاشيرية لشهادة تطابقها!", "success");
    }

    if (addAuditLog) {
      addAuditLog("إنهاء وردية", `تم جرد وتسليم الوردية #${updatedShift.id} بواسطة الكاشير ${user.name}`);
    }
  };

  // Manager Inline Approval States
  const [managerApprovalNotes, setManagerApprovalNotes] = useState<string>("");
  const [managerSignature, setManagerSignature] = useState<string>("");

  const handleInlineOpenShift = async () => {
    if (isPosDeactivated) {
      addToast("⚠️ هذا الجهاز / نقطة البيع معطل حالياً من قبل الإدارة. يرجى تفعيله أولاً من إدارة المنشأة.", "error");
      return;
    }
    if (!openingGiverManager.trim()) {
      addToast("⚠️ يرجى كتابة اسم المدير أو الشخص الذي سلّم العهدة لتسجيل الوردية تاريخياً!", "error");
      return;
    }
    
    const shiftId = `SHFT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newShift: Shift = {
      id: shiftId,
      cashierId: user.id,
      cashierName: user.name || user.fullName,
      branchId: activeBranchId || "BRCH-01",
      branchName: activeBranchRef?.name || "الفرع المعتمد",
      posId: activePosId || "POS-01",
      posName: activePosRef?.name || "نقطة بيع افتراضية",
      startTime: new Date().toISOString(),
      startingCash: openingStartingCash,
      status: 'open',
      systemSalesCount: 0,
      systemTotalSales: 0,
      systemCashSales: 0,
      systemCardSales: 0,
      systemTransferSales: 0,
      systemWalletSales: 0,
      systemRefunds: 0,
      systemDiscounts: 0,
      systemTax: 0,
      expectedNet: openingStartingCash,
      refills: [],
      expenses: [],
      actualCash: 0,
      actualCard: 0,
      actualTransfers: 0,
      actualExpenses: 0,
      notes: openingNotes,
      receiverManagerName: "",
      giverManagerName: openingGiverManager,
      entryNotes: openingNotes,
      cashDiscrepancy: 0,
      cardDiscrepancy: 0,
      totalDiscrepancy: 0
    };

    const db = SahmDatabaseService.getInstance();
    try {
      await db.saveShift(newShift);
    } catch (err: any) {
      addToast(`❌ فشل فتح الوردية: ${err.message || err}`, "error");
      return;
    }

    setActiveShift(newShift);
    window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: newShift }));

    addToast("🔓 تم استلام الوردية وبدء العمل الفعلي بنجاح!", "success");
    if (addAuditLog) {
      addAuditLog("استلام وردية", `تم استلام الوردية الميدانية ${shiftId} بعهد بداية قدرها ${openingStartingCash} ر.س ومسؤولية المدير ${openingGiverManager}`);
      addAuditLog("فتح وردية", `تم إطلاق الوردية الكاشيرية ${shiftId} بنجاح للكاشير ${user.name}`);
    }
  };

  const handleInlineApproveShift = async () => {
    if (!activeShift) return;
    const finalStatus = (activeShift.cashDiscrepancy !== 0 || activeShift.cardDiscrepancy !== 0) ? "has_discrepancy" : "approved";
    
    const approvedShift: Shift = {
      ...activeShift,
      status: finalStatus,
      approvedBy: user.name || user.fullName,
      approvedTime: new Date().toISOString(),
      approvalNotes: managerApprovalNotes || "تم تدقيق الحسابات والاعتماد الفوري بنجاح من الشاشة الموصولة.",
      signatureManager: managerSignature || user.name || user.fullName
    };

    const db = SahmDatabaseService.getInstance();
    try {
      await db.saveShift(approvedShift);
    } catch (err: any) {
      addToast(`❌ فشل اعتماد الوردية: ${err.message || err}`, "error");
      return;
    }

    setActiveShift(null);
    window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: null }));

    setManagerApprovalNotes("");
    setManagerSignature("");
    addToast("✅ تم اعتماد موازنة الوردية وإقفالها نهائياً بالصناديق السحابية!", "success");
    if (addAuditLog) {
      addAuditLog("اعتماد الموازنة", `المدير ${user.name} اعتمد تسوية عهدة الوردية #${approvedShift.id} بنتيجة (${finalStatus === "approved" ? "متطابقة" : "يوجد فوارق"})`);
      addAuditLog("إغلاق الوردية", `تم مراجعة وإقفال الوردية الكاشيرية #${approvedShift.id} رسمياً بمحاسبة سهم`);
    }
  };

  const handleInlineReopenShift = async () => {
    if (!activeShift) return;
    const reopenedShift: Shift = {
      ...activeShift,
      status: 'open',
      endTime: undefined,
      approvedBy: undefined,
      approvedTime: undefined
    };

    const db = SahmDatabaseService.getInstance();
    try {
      await db.saveShift(reopenedShift);
    } catch (err: any) {
      addToast(`❌ فشل إعادة فتح الوردية: ${err.message || err}`, "error");
      return;
    }

    setActiveShift(reopenedShift);
    window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: reopenedShift }));

    addToast("📂 تم فتح الوردية وتصحيحها مرة أخرى لإتاحة البيع ومعالجة الموازنة للكاشير.", "info");
    if (addAuditLog) {
      addAuditLog("إعادة فتح وردية", `قام المدير ${user.name} بإلغاء التسجيل المؤقت وإعادة فتح الوردية #${reopenedShift.id} لتعديلها مجهرياً`);
    }
  };

  useEffect(() => {
    const s = posService.getSettings(activePosId, activeWarehouseId);
    setPosSettings(s);
    setSelectedTemplate(s.invoiceTemplate || "حراري - 80مم");
  }, [activePosId, activeWarehouseId]);

  useEffect(() => {
    const handleForceModal = () => {
      setIsShiftModalOpen(true);
    };
    window.addEventListener("sahm_pos_force_shift_modal", handleForceModal);
    return () => {
      window.removeEventListener("sahm_pos_force_shift_modal", handleForceModal);
    };
  }, []);

  const canManagePOSSettings =
    user.role === "tenant_owner" ||
    user.role === "admin" ||
    user.role === "system_admin" ||
    user.role === "مالك" ||
    user.role === "مدير" ||
    user.role === "مالك النظام" ||
    user.role === "مدير عام" ||
    user.role === "مدير فرع" ||
    (user as any).permissions?.includes("pos:settings:manage");

  // Screen and Mode States
  const initialPosMode = (() => {
    const role = user.role;
    if (role === "كاشير") return "cashier";
    if (role === "مشرف") return "supervisor";
    if (role === "مدير" || role === "مالك النظام" || role === "مدير عام" || role === "مدير فرع" || role === "محاسب") return "manager";
    return "cashier";
  })();

  const [posMode] = useState<"cashier" | "supervisor" | "manager">(initialPosMode);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<"all" | "bestseller" | "favorites" | "new">("all");

  // Cart & Customers
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("عميل نقدي سريع");
  const [favorites, setFavorites] = useState<string[]>(["1", "3"]); // static initial favorites IDs
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // New Customer Modal
  const [isNewCustomerModal, setIsNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustCity, setNewCustCity] = useState("الرياض");

  // Suspended (Held) Bills State
  const [suspendedBills, setSuspendedBills] = useState<SuspendedBill[]>([]);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [holdNotes, setHoldNotes] = useState("");

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<string>("نقدي");
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0); // Flat discount r.s
  const [splitAmounts, setSplitAmounts] = useState<{ [key: string]: number }>({
    "نقدي": 0,
    "شبكة مدى": 0
  });

  // Safeguard paymentMethod selection based on allowed methods
  useEffect(() => {
    if (posSettings.allowedPaymentMethods && posSettings.allowedPaymentMethods.length > 0) {
      if (!posSettings.allowedPaymentMethods.includes(paymentMethod)) {
        setPaymentMethod(posSettings.allowedPaymentMethods[0]);
      }
    }
  }, [posSettings, paymentMethod]);

  // Completed Order Modal
  const [completedOrder, setCompletedOrder] = useState<Invoice | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" | "warning" } | null>(null);
  const [variantPromptProduct, setVariantPromptProduct] = useState<Product | null>(null);

  // Synthesize positive "beep" sound for barcode success scanning (Requirement 7)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, ctx.currentTime); // Crisp, positive high beep
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Audio Context beep ignored/blocked by browser user interaction policy", e);
    }
  };

  const addToast = (text: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const categories = ["الكل", ...Array.from(new Set(products.map(p => p.category)))];

  // Get active selected customer stats (عدد الطلبات ، إجمالي المشتريات ، آخر زيارة ، الرصيد)
  const getCustomerStats = () => {
    const custInvs = invoices.filter(inv => inv.customer.trim().toLowerCase() === selectedCustomer.trim().toLowerCase());
    const ordersCount = custInvs.length;
    const totalSpent = custInvs.reduce((sum, inv) => sum + (inv.total ?? 0), 0);
    const lastVisit = custInvs[0]?.date || "لا توجد زيارة سابقة";
    
    // Find customer object to get actual accounting ledger balance
    const activeCustObj = customers.find(c => c.name.trim().toLowerCase() === selectedCustomer.trim().toLowerCase());
    const balance = activeCustObj ? (activeCustObj.balance ?? 0) : 0;

    return {
      ordersCount,
      totalSpent,
      lastVisit,
      balance
    };
  };

  const customerStats = getCustomerStats();

  // Live filtered products matching Search, Category, and Quick Filters (Best sellers, Favorites, New)
  const filteredProducts = products.filter(p => {
    const query = searchQuery.trim().toLowerCase();
    
    // Search by Name, SKU / BarCode
    const matchQuery = !query || 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
      
    const matchCategory = selectedCategory === "الكل" || p.category === selectedCategory;

    // Filter by Quick Filter
    let matchQuick = true;
    if (selectedQuickFilter === "favorites") {
      matchQuick = favorites.includes(p.id);
    } else if (selectedQuickFilter === "bestseller") {
      // Products with stock below 100 or special IDs are popular
      matchQuick = parseInt(p.id) % 2 !== 0 || p.stock < 100;
    } else if (selectedQuickFilter === "new") {
      // Simulate latest arrivals
      matchQuick = parseInt(p.id) >= 3;
    }

    return matchQuery && matchCategory && matchQuick;
  });

  // Adding product by clicking
  const addToCart = (product: Product, customQty = 1, selectedVariant?: any) => {
    if (!activeShift || activeShift.status !== "open") {
      addToast("⚠️ يجب فتح الوردية قبل البيع وإضافة المنتجات للسلة!", "error");
      setIsShiftModalOpen(true);
      return;
    }

    if (product.stock <= 0) {
      addToast(`⚠️ المنتج "${product.name}" غير متوفر بالمخزن حالياً!`, "error");
      return;
    }

    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setVariantPromptProduct(product);
      return;
    }

    let finalProduct = product;
    if (selectedVariant) {
      const variantName = `${product.name} (${selectedVariant.optionType}: ${selectedVariant.optionValue})`;
      finalProduct = {
        ...product,
        id: `${product.id}_var_${selectedVariant.id}`,
        name: variantName,
        price: selectedVariant.price || product.price,
        sku: selectedVariant.sku || product.sku,
        stock: selectedVariant.stock || product.stock,
      };
    }

    const existingIndex = cart.findIndex(item => item.product.id === finalProduct.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + customQty > finalProduct.stock) {
        addToast(`⚠️ الكمية المطلوبة تتجاوز المخزون المتوفر (${finalProduct.stock})`, "error");
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += customQty;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product: finalProduct, quantity: customQty, discountPercent: 0 }]);
    }
    
    setVariantPromptProduct(null);
    addToast(`🛒 أضيف للعربة: ${finalProduct.name}`, "success");
  };

  // Barcode input simulator helper
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift || activeShift.status !== "open") {
      addToast("⚠️ يجب فتح الوردية قبل البيع ومحاكاة الباركود!", "error");
      setIsShiftModalOpen(true);
      return;
    }
    if (!searchQuery.trim()) return;
    
    // Exact or partial match with SKU or name
    const foundProduct = products.find(p => p.sku.toLowerCase() === searchQuery.trim().toLowerCase());
    if (foundProduct) {
      addToCart(foundProduct);
      setSearchQuery("");
      playBeep();
      addToast(`🎯 تم كشف الباركود لـ "${foundProduct.name}" وإضافته تلقائياً`, "success");
    } else {
      // Look for a close partial match too to make scanning flexible
      const closeProduct = products.find(p => p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
      if (closeProduct) {
        addToCart(closeProduct);
        setSearchQuery("");
        playBeep();
        addToast(`🎯 قراءة مرنة للرمز: تم إقران "${closeProduct.name}"`, "success");
      } else {
        addToast("🔍 لم يُعثر على منتج مطابق تماماً لرمز الباركود SKU", "error");
      }
    }
  };

  // Camera live scanning success handler
  const handleCameraScanSuccess = (decodedBarcode: string) => {
    if (!activeShift || activeShift.status !== "open") {
      addToast("⚠️ يجب فتح الوردية قبل البيع والمسح بالكاميرا!", "error");
      setIsShiftModalOpen(true);
      return;
    }
    const code = decodedBarcode.trim();
    if (!code) return;

    // Direct search by SKU or custom Barcode
    const foundProduct = products.find(p => 
      p.sku.toLowerCase() === code.toLowerCase() || 
      (p.barcode && p.barcode.toLowerCase() === code.toLowerCase())
    );

    if (foundProduct) {
      addToCart(foundProduct);
      addToast(`🎯 تم كشف الباركود لـ "${foundProduct.name}" بنجاح وإضافته للسلة!`, "success");
    } else {
      // Flexible lookup: partial contains search
      const closeProduct = products.find(p => 
        p.sku.toLowerCase().includes(code.toLowerCase()) || 
        p.name.toLowerCase().includes(code.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(code.toLowerCase()))
      );

      if (closeProduct) {
        addToCart(closeProduct);
        addToast(`🎯 قراءة مرنة: تم التعرف على صلة وضم صنف "${closeProduct.name}"`, "success");
      } else {
        addToast(`🔍 الباركود (${code}) مجهول أو غير مسجل في المخزن!`, "error");
      }
    }
  };

  // Toggle favorite state
  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
      addToast("Removed from quick favorites", "info");
    } else {
      setFavorites([...favorites, productId]);
      addToast("Added to quick favorites", "success");
    }
  };

  // Update quantity
  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      return;
    }
    const item = cart.find(i => i.product.id === productId);
    if (item && newQty > item.product.stock) {
      addToast(`⚠️ أقصى كمية متاحة بالمخازن للمنتج هي ${item.product.stock}`, "error");
      return;
    }
    setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item));
  };

  // Cart totals
  const subtotal = cart.reduce((acc, item) => {
    const finalPrice = item.product.price * (1 - item.discountPercent / 100);
    return acc + (finalPrice * item.quantity);
  }, 0);

  const taxRate = posSettings.isTaxEnabled ? (posSettings.taxPercentage / 100) : 0;
  const totalWithDiscountAndTax = Math.max(0, (subtotal - additionalDiscount) * (1 + taxRate));
  const calculatedTax = Math.max(0, (subtotal - additionalDiscount) * taxRate);

  // Initialize split values when selection switches to multi-payment
  useEffect(() => {
    if (paymentMethod === "دفع متعدد") {
      const flatHalf = Math.round(totalWithDiscountAndTax / 2);
      setSplitAmounts({
        "نقدي": flatHalf,
        "شبكة مدى": Math.max(0, totalWithDiscountAndTax - flatHalf)
      });
    }
  }, [paymentMethod, totalWithDiscountAndTax]);

  // AI Upsell Recommendations Generator
  const getAiRecommendations = () => {
    if (cart.length === 0) {
      return {
        title: "التوصيات الذكية من سهم 🧠",
        text: "أضف منتجاً لتفعيل التوصيات الذكية لرفع قيمة المبيعات فوراً.",
        suggestedProduct: null,
        potentialValue: 0
      };
    }

    // Complementary recommendation of tea / coffee or sweets
    const hasBeverage = cart.some(item => item.product.category === "مشروبات");
    const hasFood = cart.some(item => item.product.category === "غذائية");
    
    if (hasBeverage && !cart.some(item => item.product.id === "3")) { // Dates complement
      const dateProduct = products.find(p => p.id === "3") || products[2];
      if (dateProduct && dateProduct.stock > 0) {
        return {
          title: "💡 فرصة بيع متبادل (Cross-Sell) سريعة",
          text: `العميل يضيف حالياً مشروبات ساخنة. اعرض عليه إضافة "تمر مجدول سكري" لتقديم ضيافة متكاملة بخصم 15% إضافي.`,
          suggestedProduct: dateProduct,
          potentialValue: Math.round(dateProduct.price * 0.85),
          badge: "الأكثر مبيعاً وتكاملاُ 🔥"
        };
      }
    }

    if (hasFood && !cart.some(item => item.product.category === "مشروبات")) {
      const coffeeProduct = products.find(p => p.category === "مشروبات" && p.stock > 0);
      if (coffeeProduct) {
        return {
          title: "🎯 اقتراح المشروب المكمل للوجبات",
          text: `بما أن السلة تحتوي على منتجات تمور أو زيتون، اقترح تجربة "${coffeeProduct.name}" السريعة والفاخرة بخصم 10%.`,
          suggestedProduct: coffeeProduct,
          potentialValue: Math.round(coffeeProduct.price * 0.9),
          badge: "مشروب الضيافة ☕"
        };
      }
    }

    // High margin luxury products upsell suggestion
    const luxuryProduct = products.find(p => p.price >= 80 && !cart.some(item => item.product.id === p.id) && p.stock > 1);
    if (luxuryProduct) {
      return {
        title: "💎 ترقية ذكية للفاتورة (Upsell Premium)",
        text: `عرض خاص على المنتج الفاخر "${luxuryProduct.name}" لزبونك بخصم مميز 10% حافز لرفع قيمة الصفقة.`,
        suggestedProduct: luxuryProduct,
        potentialValue: Math.round(luxuryProduct.price * 0.9),
        badge: "الأعلى تقييماً ✨"
      };
    }

    return {
      title: "🚀 ذكاء الكاشير نشط ومستعد",
      text: "سلة التسوق متوازنة تماماً والخيارات مثيرة لاهتمام العميل الحالي!",
      suggestedProduct: null,
      potentialValue: 0
    };
  };

  const aiRecommendation = getAiRecommendations();

  const addRecommendedOffer = () => {
    if (!aiRecommendation.suggestedProduct) return;
    const prod = aiRecommendation.suggestedProduct;
    const existingIndex = cart.findIndex(item => item.product.id === prod.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product: prod, quantity: 1, discountPercent: 15 }]);
    }
    addToast(`⚡ تم تفعيل العرض الذكي وإضافة "${prod.name}" بنجاح للزبون بخصم خاص!`, "success");
  };

  // Suspended Bill handlers (تعليق/استعادة الفاتورة)
  const suspendCurrentBill = () => {
    if (!posSettings.isSuspensionAllowed) {
      addToast("⚠️ عذراً، خيار تعليق الفواتير معطل حالياً من إعدادات نقطة البيع", "error");
      return;
    }
    if (cart.length === 0) {
      addToast("⚠️ لا يمكن تعليق فاتورة فارغة! أضف منتجات أولاً.", "error");
      return;
    }
    const holdId = `SUSP-${Date.now().toString().slice(-4)}`;
    const newHold: SuspendedBill = {
      id: holdId,
      cart: [...cart],
      customer: selectedCustomer,
      additionalDiscount: additionalDiscount,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      total: totalWithDiscountAndTax,
      notes: holdNotes || "فاتورة معلقة قيد التعديل"
    };

    setSuspendedBills([newHold, ...suspendedBills]);
    setCart([]);
    setAdditionalDiscount(0);
    setHoldNotes("");
    addToast(`📥 تم تعليق الفاتورة بنجاح باسم: ${selectedCustomer} برقم ${holdId}`, "success");
  };

  const recallDelayedBill = (bill: SuspendedBill) => {
    if (!posSettings.isRefundAllowed) {
      addToast("⚠️ عذراً، خيار استعادة الفواتير المعلقة معطل حالياً من إعدادات نقطة البيع", "error");
      return;
    }
    setCart(bill.cart);
    setSelectedCustomer(bill.customer);
    setAdditionalDiscount(bill.additionalDiscount);
    setSuspendedBills(suspendedBills.filter(b => b.id !== bill.id));
    setIsRecallModalOpen(false);
    addToast(`🔓 تم استرجاع الفاتورة المعلقة ${bill.id} وإعادتها لكاشير البيع`, "success");
  };

  const saveDraftOrder = () => {
    if (cart.length === 0) {
      addToast("⚠️ لا توجد منتجات لحفظها كمسودة!", "error");
      return;
    }
    const draftId = `DRAFT-${Date.now().toString().slice(-4)}`;
    const newHold: SuspendedBill = {
      id: draftId,
      cart: [...cart],
      customer: selectedCustomer,
      additionalDiscount: additionalDiscount,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      total: totalWithDiscountAndTax,
      notes: "مسودة حجز مسبقة"
    };
    setSuspendedBills([newHold, ...suspendedBills]);
    addToast(`💾 تم حفظ العربة الحالية كمسودة معلقة برقم ${draftId}`, "info");
  };

  // Create New Customer
  const addNewCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: "cust_" + Date.now().toString() + "_" + Math.floor(Math.random() * 1000),
      name: newCustName.trim(),
      phone: newCustPhone.trim() || "غير مسجل",
      city: newCustCity,
      balance: 0
    };

    setCustomers([newCust, ...customers]);
    setSelectedCustomer(newCust.name);
    setIsNewCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
    addToast(`👤 تم تسجيل الزبون الجديد "${newCust.name}" بنجاح في السجل الوطني وبوابة البيع`, "success");
  };

  // Process & Checkout Final
  const processCheckout = async () => {
    if (isPosDeactivated) {
      addToast("⚠️ هذا الجهاز / نقطة البيع معطل حالياً من قبل الإدارة. يرجى تفعيله أولاً من إدارة المنشأة.", "error");
      return;
    }
    if (!activeShift || activeShift.status !== 'open') {
      addToast("⚠️ يرجى فتح الوردية الكاشيرية وبدء العمل الفعلي أولاً لتتمكن من البيع وإصدار الفواتير!", "error");
      setIsShiftModalOpen(true);
      return;
    }

    if (cart.length === 0) {
      addToast("⚠️ العربة فارغة! اضغط على المنتجات لإضافتها.", "error");
      return;
    }

    const tenantId = user?.tenant_id || localStorage.getItem("sahm_impersonate_tenant_id") || "tenant-default";
    const isPlatform = ["platform_owner", "system_owner", "system_admin"].includes(String(user?.role || "").trim());

    if (!isPlatform && tenantId !== "tenant-local") {
      const guard = SubscriptionGuard.getInstance();
      const hasPOSAccess = await guard.canUseFeature(tenantId, "pos");
      if (!hasPOSAccess) {
        addToast("⚠️ ميزة نقطة البيع (POS) غير متاحة في باقتك الحالية. يرجى الترقية.", "error");
        return;
      }

      const hasInvoicesAccess = await guard.canUseFeature(tenantId, "invoices");
      if (!hasInvoicesAccess) {
        addToast("⚠️ ميزة إصدار الفواتير غير متاحة في باقتك الحالية. يرجى الترقية.", "error");
        return;
      }

      const tenantInvoicesCount = rawInvoices.filter(inv => inv.tenant_id === tenantId).length;
      const limitCheck = await guard.checkLimit(tenantId, "invoices", tenantInvoicesCount);
      if (!limitCheck.allowed) {
        addToast(`⚠️ وصلت إلى حد الفواتير الشهرية في باقتك الحالية (الحد: ${limitCheck.limit}). تواصل مع إدارة منصة سهم للترقية.`, "error");
        if (triggerNotification) {
          triggerNotification(`⚠️ وصلت إلى حد الفواتير الشهرية في باقتك الحالية (الحد: ${limitCheck.limit}).`, "critical");
        }
        return;
      }
    }

    // Max discount safety based on POS Mode
    if (posMode === "cashier" && additionalDiscount > (subtotal * 0.15)) {
      addToast("❌ عذراً! تجاوزت الحد الأقصى للخصم المسموح للكاشير (15%). اطلب تفويض المشرف أو المدير.", "error");
      return;
    }

    // Stock verification
    for (const item of cart) {
      if (item.product.stock < item.quantity) {
        addToast(`❌ نفاد المخزون لمنتج "${item.product.name}" (المتاح حالياً: ${item.product.stock})`, "error");
        return;
      }
    }

    // Verify product IDs
    for (const item of cart) {
      if (!item.product || !item.product.id || item.product.id === "prod-default") {
        addToast("❌ خطأ! لا يمكن إتمام عملية البيع لوجود منتج بدون معرف صحيح (product_id).", "error");
        return;
      }
    }

    const checkCompanyId = user.organization_id || user.company_id || "";
    if (import.meta.env.VITE_DATA_MODE === "supabase" && (!checkCompanyId || checkCompanyId === "comp-default")) {
      addToast("تعذر تنفيذ العملية: لا يوجد معرف منشأة صالح.", "error");
      if (triggerNotification) {
        triggerNotification("تعذر تنفيذ العملية: لا يوجد معرف منشأة صالح.", "error");
      }
      return;
    }

    setBusyCheckout(true);

    try {
      const db = SahmDatabaseService.getInstance();
      let seq = posSettings.startingInvoiceNumber || 1000;
      
      const regex = new RegExp(`^INV-POS-${activePosId}-(\\d+)$`);
      const matchedSeqs = rawInvoices
        .map(inv => {
          const match = inv.id ? inv.id.match(regex) : null;
          return match ? parseInt(match[1]) : null;
        })
        .filter((num): num is number => num !== null);

      const savedLastSeqStr = localStorage.getItem(`sahm_web_last_invoice_seq_${activePosId}`);
      const savedSeq = savedLastSeqStr ? parseInt(savedLastSeqStr) : 0;

      if (matchedSeqs.length > 0) {
        seq = Math.max(seq, Math.max(...matchedSeqs) + 1, savedSeq + 1);
      } else if (savedSeq > 0) {
        seq = Math.max(seq, savedSeq + 1);
      }

      localStorage.setItem(`sahm_web_last_invoice_seq_${activePosId}`, seq.toString());
      const invoiceId = `INV-POS-${activePosId}-${seq}`;

      // Deduct stocks globally
      const updatedProducts = [];
      for (const p of products) {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          const newStock = p.stock - cartItem.quantity;

          // Requirement: Trigger alerts/notifications/audit logic for depleted or low stock
          if (newStock === 0) {
            const alertMsg = `🚨 نفاد كامل المخزون كلياً للمنتج "${p.name}"! الرجاء تفويض إمداد عاجل.`;
            addToast(alertMsg, "error");
            if (triggerNotification) {
              triggerNotification(alertMsg, "error");
            }
            if (addAuditLog) {
              addAuditLog("نفاد مخزون", `نفد مخزون المنتج "${p.name}" كلياً إثر عملية البيع رقم ${invoiceId}`);
            }
          } else if (newStock > 0 && newStock < 50) {
            const alertMsg = `⚠️ تنبيه بقرب نفاد المخزون: هبط مخزون "${p.name}" إلى ${newStock} وحدة فقط!`;
            addToast(alertMsg, "error");
            if (triggerNotification) {
              triggerNotification(alertMsg, "warning");
            }
            if (addAuditLog) {
              addAuditLog("تنبيه مخزون منخفض", `انخفض مخزون المنتج "${p.name}" إلى مستوى ${newStock} وحدة إثر عملية بيع رقم ${invoiceId}`);
            }
          }

          // Await stock update database write
          await productService.update(p.id, { stock: newStock });

          updatedProducts.push({
            ...p,
            stock: newStock
          });
        } else {
          updatedProducts.push(p);
        }
      }

      const newInvoiceTotal = Math.round(totalWithDiscountAndTax);

      // Calculate real payment method amounts
      let cashAmt = 0;
      let cardAmt = 0;
      let transferAmt = 0;
      let walletAmt = 0;

      if (paymentMethod === "نقدي") {
        cashAmt = newInvoiceTotal;
      } else if (paymentMethod === "شبكة مدى" || paymentMethod === "Apple Pay") {
        cardAmt = newInvoiceTotal;
      } else if (paymentMethod === "STC Pay") {
        walletAmt = newInvoiceTotal;
      } else if (paymentMethod === "دفع متعدد") {
        cashAmt = splitAmounts["نقدي"] || 0;
        cardAmt = splitAmounts["شبكة مدى"] || 0;
      } else {
        cashAmt = newInvoiceTotal;
      }

      const newInvoice: Invoice = {
        id: invoiceId,
        type: "sale",
        customer: selectedCustomer,
        date: new Date().toISOString().split('T')[0],
        total: newInvoiceTotal,
        status: "مدفوع",
        items: cart.map(item => {
          const finalPrice = item.product.price * (1 - item.discountPercent / 100);
          return {
            name: item.product.name,
            qty: item.quantity,
            price: finalPrice,
            total: Math.round(finalPrice * item.quantity),
            product_id: item.product.id,
            sku: item.product.sku
          };
        }),
        tenant_id: user.tenant_id,
        company_id: user.organization_id || user.company_id || "comp-default",
        store_id: user.storeId || "store_1",
        branch_id: activeBranchId,
        pos_id: activePosId,
        warehouse_id: activeWarehouseId || "warehouse_1",
        shift_id: activeShift?.id || undefined,
        payment_method: paymentMethod,
        cash_amount: cashAmt,
        card_amount: cardAmt,
        transfer_amount: transferAmt,
        wallet_amount: walletAmt,
        sale_id: invoiceId
      };

      // Await saving invoice in database (saves sale, sale_items, and invoice)
      await db.saveInvoice(newInvoice);

      // Increment usage
      if (!isPlatform && tenantId !== "tenant-local") {
        try {
          await db.incrementSubscriptionUsage(tenantId, user.organization_id || user.company_id || "comp-default", "invoices_count", 1);
        } catch (uErr) {
          console.warn("[POS] Failed to increment invoices count in usage:", uErr);
        }
      }

      // Calculate and save shift stats in database
      let updatedShift = activeShift;
      if (activeShift) {
        const newSalesCount = (activeShift.systemSalesCount || 0) + 1;
        const newTotalSales = (activeShift.systemTotalSales || 0) + newInvoiceTotal;

        const newCashSales = (activeShift.systemCashSales || 0) + cashAmt;
        const newCardSales = (activeShift.systemCardSales || 0) + cardAmt;
        const newTransferSales = (activeShift.systemTransferSales || 0) + transferAmt;
        const newWalletSales = (activeShift.systemWalletSales || 0) + walletAmt;

        const newExpectedCash = activeShift.startingCash + newCashSales;
        const newExpectedNet = newExpectedCash + newCardSales + newTransferSales + newWalletSales;

        updatedShift = {
          ...activeShift,
          systemSalesCount: newSalesCount,
          systemTotalSales: newTotalSales,
          systemCashSales: newCashSales,
          systemCardSales: newCardSales,
          systemTransferSales: newTransferSales,
          systemWalletSales: newWalletSales,
          expectedNet: newExpectedNet
        };

        // Await saving updated shift database write
        await db.saveShift(updatedShift);
      }

      // Sync React States after all writes successfully completed
      setProducts(updatedProducts);
      setInvoices([newInvoice, ...rawInvoices]);
      if (updatedShift) {
        setActiveShift(updatedShift);
        window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: updatedShift }));
      }
      setCompletedOrder(newInvoice);
      setShowReceipt(true);
      setCart([]);
      setAdditionalDiscount(0);
      addToast(`🚀 تم اعتماد وحفظ قيمة الفاتورة وإصدار سند قبض الكتروني ${invoiceId}`, "success");
    } catch (err: any) {
      console.error("Checkout transaction error: ", err);
      addToast(`❌ فشل تحصيل الفاتورة: ${err.message || err}`, "error");
    } finally {
      setBusyCheckout(false);
    }
  };

  // WhatsApp simulation text formatter
  const getWhatsAppMessageRaw = (inv: Invoice) => {
    let msg = `✨ فاتورة رقم: ${inv.id} من متجر مراسيم الطيب الفاخرة ✨\n\n`;
    msg += `مرحباً ${inv.customer}، طاب يومك!\n`;
    msg += `تفاصيل مبيعاتك المسجلة عبر Touch POS الكاشير الذكي:\n`;
    inv.items.forEach(item => {
      msg += `- ${item.name} | الكمية: ${item.qty} | القيمة: ${item.price} ر.س | الإجمالي: ${item.total} ر.س\n`;
    });
    msg += `\n💵 الضريبة المضافة (15%): مشمولة بالسعر\n`;
    msg += `💰 الإجمالي النهائي المعتمد: *${inv.total} ريال سعودي*\n\n`;
    msg += `طريقة السداد: *${paymentMethod}*\n`;
    msg += `نسعد بخدمتك ونتطلع لزيارتك القادمة! 🌸`;
    return encodeURIComponent(msg);
  };

  // POS Analytics inside Cashier
  const getPosAnalytics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayInvs = invoices.filter(inv => inv.date === todayStr);
    const todaySales = todayInvs.reduce((sum, inv) => sum + inv.total, 0);
    const todayBillsCount = todayInvs.length;
    const avgBill = todayBillsCount > 0 ? Math.round(todaySales / todayBillsCount) : 0;

    // Best-selling analysis based on active invoices
    const salesVolume: { [key: string]: number } = {};
    invoices.forEach(inv => {
      inv.items.forEach(it => {
        salesVolume[it.name] = (salesVolume[it.name] || 0) + it.qty;
      });
    });
    const popularProducts = Object.entries(salesVolume)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, qty]) => ({ name, qty }));

    return {
      todaySales,
      todayBillsCount,
      avgBill,
      popularProducts
    };
  };

  const analytics = getPosAnalytics();
  const posObj = activePosRef;

  if (hasPOSAccessState === false) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center space-y-4 border rounded-2xl"
        style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h3 className="text-xl font-bold text-white">هذه الميزة غير متاحة في باقتك الحالية</h3>
        <p className="text-sm text-gray-400 max-w-md">وصلت إلى حدود باقتك الحالية أو أن ميزة نقطة البيع (POS) غير مفعلة. يرجى التواصل مع إدارة منصة سهم للترقية.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-4 left-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm border"
          style={{ 
            backgroundColor: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : toast.type === "error" ? "rgba(239, 68, 68, 0.95)" : toast.type === "warning" ? "rgba(245, 158, 11, 0.95)" : "rgba(59, 130, 246, 0.95)",
            borderColor: theme.border,
            color: "#fff"
          }}
        >
          <div className="text-xs font-black">{toast.text}</div>
        </div>
      )}

      {/* POS Screen Header Header Banner Area */}
      <div className="p-4 rounded-2xl border flex flex-col xl:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        
        {/* Left Side: Store Identity */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              <span>{posObj?.name || "بوابة مبيعات الكاشير الفورية Touch POS"}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">نشط</span>
            </h1>
            <p className="text-[10px]" style={{ color: theme.muted }}>
              نظام الفواتير المطور المتزامن مع هيئة الزكاة والضريبة والجمارك (ZATCA)
            </p>
          </div>
        </div>

        {/* Middle: POS Mode Actions (Compact / Non-manual role) */}
        <div className="flex items-center gap-2 flex-wrap justify-center w-full xl:w-auto">
          {canManagePOSSettings && (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="py-1.5 px-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-black text-[10.5px] rounded-lg flex items-center gap-1.5 shadow cursor-pointer border border-[#D4AF37]/30 transition-all duration-200"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات نقطة البيع ⚙️</span>
            </button>
          )}


          <button
            onClick={() => setPOSView("shift_handover")}
            className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black text-[10.5px] rounded-lg flex items-center gap-1.5 shadow cursor-pointer border border-emerald-500/30 transition-all duration-200"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>إنهاء الوردية (موازنة التسليم) ⚖️</span>
          </button>

          <button
            onClick={() => {
              setIsShiftModalOpen(true);
              addToast("💡 يمكنك استخدام شاشة تزويد النقد أو سحب المصروفات من الصندوق مباشرة", "info");
            }}
            className="py-1.5 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-black text-[10.5px] rounded-lg flex items-center gap-1 shadow cursor-pointer border border-sky-500/30"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>تزويد نقطة البيع 💵</span>
          </button>

          {/* Fullscreen Button toggles */}
          {!isPosFullscreen ? (
            <button
              onClick={() => { setIsPosFullscreen(true); addToast("🖥️ تم الدخول في وضع الكاشير ملء الشاشة المستقل", "success"); }}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] rounded-lg flex items-center gap-1 shadow cursor-pointer border border-none transition-all duration-200"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>تفعيل ملء الشاشة 🖥️</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (activeShift && activeShift.status === "open") {
                  const stats = getShiftSystemStats(activeShift);
                  if (stats.systemSalesCount > 0) {
                    setPOSView("shift_handover");
                    addToast("⚖️ يمنع الخروج بدون عمل موازنة لوجود مبيعات مسجلة في الوردية. تم تحويلك للموازنة.", "error");
                    return;
                  }
                }
                if (setIsPosFullscreen) {
                  setIsPosFullscreen(false);
                }
                addToast("🖥️ تم الخروج والعودة للوحة تحكم سهم العامة", "info");
              }}
              className="py-1.5 px-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer border border-none transition-all duration-200"
            >
              <Minimize className="w-3.5 h-3.5" />
              <span>خروج من نقطة البيع ➔</span>
            </button>
          )}
        </div>

        {/* Right Side: Top-Right Quick Stats Trigger & Cashier Info */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className="p-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black transition-all cursor-pointer select-none"
            style={{ 
              backgroundColor: showAnalyticsPanel ? theme.border : "rgba(212,175,55,0.06)", 
              color: theme.text,
              border: `1px solid ${theme.border}`
            }}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>إحصائيات المبيعات الحية</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAnalyticsPanel ? "rotate-180" : ""}`} />
          </button>

          <div className="flex items-center gap-2">
            <ProfileAvatar name={user.name} size="sm" theme={theme} />
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-black block" style={{ color: theme.text }}>{user.name}</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-yellow-400/10 text-yellow-500 rounded font-extrabold">
                {user.role}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* POS Realtime Analytics Collapsible Panel */}
      {showAnalyticsPanel && (
        <div className="p-5 rounded-2xl border grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in shadow-inner bg-slate-950/40"
          style={{ borderColor: theme.border }}>
          
          <div className="p-3.5 rounded-xl bg-black/20 border border-slate-900 text-right">
            <span className="text-[10px] block" style={{ color: theme.muted }}>مبيعات كاشير اليوم التاريخي</span>
            <span className="text-sm font-black font-mono tracking-tight block mt-0.5 text-emerald-400">
              {(analytics.todaySales ?? 0).toLocaleString("ar-SA")} ر.س
            </span>
            <span className="text-[8px] text-gray-400 mt-1 block">محدث بالربط السحابي 📡</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/20 border border-slate-900 text-right">
            <span className="text-[10px] block" style={{ color: theme.muted }}>عدد الفواتير الصادرة</span>
            <span className="text-sm font-black font-mono tracking-tight block mt-0.5 text-blue-400">
              {analytics.todayBillsCount} فاتورة
            </span>
            <span className="text-[8px] text-gray-400 mt-1 block">من فروع صالة الطيب</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/20 border border-slate-900 text-right">
            <span className="text-[10px] block" style={{ color: theme.muted }}>متوسط الفاتورة الحالية</span>
            <span className="text-sm font-black font-mono tracking-tight block mt-0.5 text-yellow-500">
              {(analytics.avgBill ?? 0).toLocaleString("ar-SA")} ر.س
            </span>
            <span className="text-[8px] text-gray-400 mt-1 block">يقيس كفاءة زيادة المبيعات</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/20 border border-slate-900 text-right col-span-2 md:col-span-1">
            <span className="text-[10px] block" style={{ color: theme.muted }}>أكثر الأصناف بيعاً اليوم</span>
            <div className="space-y-1 mt-1 font-sans text-[9px] text-gray-300">
              {analytics.popularProducts.length === 0 ? (
                <span className="text-gray-500 block">لا يوجد مبيعات كافية اليوم</span>
              ) : (
                analytics.popularProducts.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] border-b border-zinc-900 pb-0.5">
                    <span className="font-extrabold text-white truncate max-w-[100px]">{p.name}</span>
                    <span className="font-mono bg-zinc-800 px-1 py-0.2 rounded text-amber-500 font-bold">{p.qty} قطع</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Main Touch Grid Layout / Shift Guards */}
      {posView !== "cashier" ? (
        <div id="pos-lock-screen" className="w-full max-w-4xl mx-auto my-6 space-y-6 text-right" style={{ direction: "rtl" }}>
          
          {/* Case A: Awaiting Open (No active shift, or status is resolved/closed) */}
          {posView === "shift_opening_balance" && (
            <div className="w-full text-right p-8 rounded-3xl border shadow-xl space-y-6 animate-fade-in"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              
              <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Play className="w-6 h-6 fill-amber-500" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white">بدء تسلم الوردية الجديدة • Open Cashier Shift 🔓</h2>
                  <p className="text-[11px] text-gray-400 font-sans">
                    يتطلب من الكاشير تسجيل ومطابقة البيانات المالية وبقايا الخزن قبل تمكين السداد وإصدار الفواتير.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-xs">
                
                {/* Right col: Fixed contextual fields */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-950/45 border border-zinc-900 grid grid-cols-1 gap-3">
                    <span className="text-[10px] text-zinc-400 font-black tracking-tight block">• بيانات بيئة العمل النشطة:</span>
                    
                    <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                      <span className="text-gray-400">الكاشير المستلم:</span>
                      <span className="font-bold text-amber-500">{user.name || user.fullName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                      <span className="text-gray-400">الفرع الميداني:</span>
                      <span className="font-black text-white">{activeBranchRef?.name || "الفرع المعتمد"}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                      <span className="text-gray-400">رقم جهاز الـ POS:</span>
                      <span className="font-mono text-zinc-300 font-bold">{activePosRef?.name || "نقطة بيع افتراضية"}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-400">وقت البدء وتدشين العمليات:</span>
                      <span className="font-mono text-emerald-400 font-bold">{new Date().toLocaleDateString("ar-SA")} - {new Date().toLocaleTimeString("ar-SA")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-gray-300 font-bold block">• ملاحظات الاستلام الإضافية:</label>
                    <textarea
                      rows={3}
                      value={openingNotes}
                      onChange={(e) => setOpeningNotes(e.target.value)}
                      placeholder="امتداد لملحوظات الفواتير أو تسليم العهدة..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl text-xs outline-none focus:border-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Left col: Required inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-gray-300 font-bold block flex items-center gap-1">
                      <span className="text-red-500 font-black">*</span>
                      الرصيد الافتتاحي في الصندوق (Float/Starting Cash):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={openingStartingCash}
                        onChange={(e) => setOpeningStartingCash(parseFloat(e.target.value) || 0)}
                        placeholder="أدخل مبلغ العهدة لبدء الجرد..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-3 pr-4 pl-12 rounded-xl text-xs font-mono font-black outline-none focus:border-amber-500"
                      />
                      <span className="absolute left-4 top-3 text-[10px] text-gray-500 font-bold">ر.س</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block">المبلغ الفعلي للكاش المودع بالصندوق كفكة أو عهدة أولية.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-gray-300 font-bold block flex items-center gap-1">
                      <span className="text-red-500 font-black">*</span>
                      اسم المدير أو الشخص الذي سلّم العهدة (Handed by):
                    </label>
                    <input
                      type="text"
                      value={openingGiverManager}
                      onChange={(e) => setOpeningGiverManager(e.target.value)}
                      placeholder="مثال: م. أحمد المطيري أو المشرف المناوب"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-gray-500 block">الشخص المناوب الذي سلمك الصندوق المالي اليوم للمساءلة الرقابية.</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      id="submit-inline-open-shift-btn"
                      onClick={handleInlineOpenShift}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-[#090b12] font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all border-none"
                    >
                      <LockOpen className="w-4 h-4 animate-bounce" />
                      <span>تأكيد استلام الوردية وبدء العمل الفعلي 🔓</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* New Case: Shift Handover Form */}
          {posView === "shift_handover" && activeShift && (
            <div className="w-full text-right p-8 rounded-3xl border shadow-xl space-y-6 animate-fade-in"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              
              <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Scale className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white">موازنة تسليم الوردية الحالية • Shift Handover & End Balancing ⚖️</h2>
                  <p className="text-[11px] text-gray-400 font-sans">
                    يرجى جرد الصندوق بجميع محتوياته وتدوين المبالغ الفعلية قبل إنهاء وموازنة الدورة المالية بنجاح.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-xs">
                
                {/* Snapshot Column: Expected/System values */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-950/45 border border-zinc-900 grid grid-cols-1 gap-2.5">
                    <span className="text-[10px] text-cyan-400 font-black tracking-tight block">• المبالغ المتوقعة حسب النظام (System Balance Snapshot):</span>
                    
                    {(() => {
                      const stats = getShiftSystemStats(activeShift);
                      return (
                        <div className="space-y-2 font-sans">
                          <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                            <span className="text-gray-400">إجمالي المبيعات الكاملة:</span>
                            <span className="font-bold text-white font-mono">{stats.systemTotalSales.toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                            <span className="text-gray-400">عدد الفواتير المصدرة:</span>
                            <span className="font-bold text-emerald-400 font-mono">{stats.systemSalesCount} فاتورة</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                            <span className="text-gray-400">النقد الرياضي المتوقع بالدرج:</span>
                            <span className="font-black text-amber-500 font-mono">{stats.expectedCashValue.toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                            <span className="text-gray-400">مبيعات مدى (الشبكة) المتوقعة:</span>
                            <span className="font-bold text-zinc-300 font-mono">{stats.expectedCardValue.toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-zinc-900/60">
                            <span className="text-gray-400">مبيعات التحويلات المتوقعة:</span>
                            <span className="font-bold text-zinc-300 font-mono">{stats.systemTransferSales.toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-200 font-bold">الصافي الإجمالي المتوقع (Net):</span>
                            <span className="font-black text-emerald-400 text-sm font-mono">{stats.expectedNet.toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-yellow-400/90 leading-relaxed">
                    💡 تذكر أن النظام يقوم تلقائياً بفرز وتوزيع عمليات الدفع (كاش، شبكة، تحويلات) فور إصدار وإقرار كل فاتورة مبيعات في ورديتك الحالية.
                  </div>
                </div>

                {/* Input Column: Actual cash count */}
                <div className="space-y-4">
                  <span className="text-[10px] text-amber-400 font-black tracking-tight block">• جرد الصندوق الفعلي (Actual Physical Count):</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                        <span className="text-red-500 font-black">*</span>
                        النقد الفعلي في صندوق الكاش المالي (Actual Cash):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={actualCash}
                          onChange={(e) => setActualCash(e.target.value)}
                          placeholder="أدخل مبلغ الكاش الجبلي الفعلي..."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 pr-4 pl-12 rounded-xl text-xs font-mono font-black outline-none focus:border-amber-500"
                        />
                        <span className="absolute left-4 top-2.5 text-[9px] text-gray-500 font-bold">ر.س</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                        <span className="text-red-500 font-black">*</span>
                        مجموع وعمليات مدى (Actual mada/Card):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={actualCard}
                          onChange={(e) => setActualCard(e.target.value)}
                          placeholder="أدخل الكشف الإجمالي للشبكة..."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 pr-4 pl-12 rounded-xl text-xs font-mono font-black outline-none focus:border-amber-500"
                        />
                        <span className="absolute left-4 top-2.5 text-[9px] text-gray-500 font-bold">ر.س</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">مجموع التحويلات الفعلية إن وجد (Actual Transfers):</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={actualTransfers}
                          onChange={(e) => setActualTransfers(e.target.value)}
                          placeholder="أدخل التحويلات البنكية المجمعة..."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 pr-4 pl-12 rounded-xl text-xs font-mono outline-none focus:border-amber-500"
                        />
                        <span className="absolute left-4 top-2.5 text-[9px] text-gray-500 font-bold">ر.س</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-gray-400 font-bold block col-span-1">المصروفات النثرية:</label>
                        <input
                          type="number"
                          value={actualExpenses}
                          onChange={(e) => setActualExpenses(e.target.value)}
                          placeholder="تفصيل النثرية..."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-gray-400 font-bold block col-span-1">اسم المسؤول المتسلم:</label>
                        <input
                          type="text"
                          value={receiverManagerName}
                          onChange={(e) => setReceiverManagerName(e.target.value)}
                          placeholder="المدير المستلم..."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">ملاحظات الفرق أو التسليم:</label>
                      <input
                        type="text"
                        value={handoverNotes}
                        onChange={(e) => setHandoverNotes(e.target.value)}
                        placeholder="لماذا يوجد فرق كاش إن وجد، أو أي تفسير مالي..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2 px-3 rounded-xl text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const cashVal = parseFloat(actualCash);
                        const cardVal = parseFloat(actualCard);
                        if (isNaN(cashVal) || isNaN(cardVal)) {
                          addToast("⚠️ يرجى تعبئة حقلي الكاش الفعلي والشبكة الفعلية على الأقل للموازنة والتدقيق!", "error");
                          return;
                        }
                        const transferVal = parseFloat(actualTransfers) || 0;
                        const expenseVal = parseFloat(actualExpenses) || 0;
                        closeShift(cashVal, cardVal, transferVal, expenseVal, handoverNotes);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all border-none"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>تأكيد موازنة وتسليم الوردية وإغلاق الصناديق 🔒</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPOSView("cashier")}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      العودة للبيع ➔
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* New Case: Shift Closed (POS Locked Screen) */}
          {posView === "shift_closed" && (
            <div className="w-full text-right p-8 rounded-3xl border shadow-xl space-y-6 animate-fade-in"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              
              <div className="w-20 h-20 rounded-full bg-red-650/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <Lock className="w-9 h-9 text-red-500" />
              </div>

              <div className="space-y-2 text-center">
                <h1 className="text-xl font-black text-red-500">نقطة البيع مقفلة • POS Closed & Locked 🔒</h1>
                <div className="h-0.5 w-1/4 bg-red-500/25 mx-auto rounded-full"></div>
                <p className="text-xs text-white font-extrabold max-w-sm mx-auto mt-2">
                  الوردية مسواة ومغلقة بالكامل. الكاشير معطل!
                </p>
                <p className="text-[11px] text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                  لا يمكن البيع حتى فتح وردية جديدة. لا تتوفر أي إمكانيات سداد حالياً لحين تدشين الإجراءات الافتتاحية للمناوبة اللاحقة.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/55 border border-zinc-900 text-right text-xs space-y-2.5 font-sans">
                <span className="text-[10px] text-cyan-400 font-black block">• آخر وردية تم إغلاقها في هذا المتصفح:</span>
                {activeShift ? (
                  <div className="space-y-1.5 text-zinc-300">
                    <div className="flex justify-between">
                      <span>رقم الوردية المغلقة:</span>
                      <span className="font-mono text-white font-bold">#{activeShift.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الكاشير المغلق:</span>
                      <span className="font-bold text-white">{activeShift.cashierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>وقت الإغلاق والتسوية:</span>
                      <span className="font-mono text-emerald-400">{new Date(activeShift.endTime || "").toLocaleString("ar-SA")}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-1 font-black">
                      <span className="text-zinc-200">الصافي الجرد المودع:</span>
                      <span className="text-emerald-400 font-mono">{((activeShift.actualCash || 0) + (activeShift.actualCard || 0) + (activeShift.actualTransfers || 0)).toLocaleString()} {activeShift.currency || "ر.س"}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 block text-center">لا توجد تفاصيل وردية نشطة مسجلة في محرك هذا المتصفح.</span>
                )}
              </div>

              <div className="flex gap-4 pt-3 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveShift(null);
                    window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: null }));
                    setPOSView("shift_opening_balance");
                    addToast("🔓 تم تهيئة النظام لفتح وردية تسلم كاش كاشير دائرية جديدة", "success");
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all border-none"
                >
                  <PlusCircle className="w-4 h-4 animate-bounce" />
                  <span>فتح وردية جديدة 🔓</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeShift) {
                      setIsShiftModalOpen(true);
                      addToast("📄 فتح التقرير الكامل لعناصر ومبيعات الوردية", "info");
                    } else {
                      addToast("⚠️ لا يوجد أرشيف وردية حية ومقيدة لعرضه حالياً.", "warning");
                    }
                  }}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-755 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>عرض تقرير الوردية 📊</span>
                </button>
              </div>
            </div>
          )}

          {/* Case B: Pending Approval (Shift is closed and waiting manager review) */}
          {posView === "shift_pending_approval" && activeShift && (
            <div className="w-full text-right p-8 rounded-3xl border shadow-xl space-y-6 animate-fade-in"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              
              <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-orange-400">الوردية بانتظار الاعتماد المالي والتحقق من الموازنة ⚠️</h2>
                  <p className="text-[11px] text-gray-400 font-sans">
                    تم إرسال موازنة الوردية بواسطة الكاشير بنجاح. لا يسمح بإجراء مبيعات جديدة حتى يقوم المشرف أو المدير بمطابقة الفروقات والمصادقة.
                  </p>
                </div>
              </div>

              {/* Stats & Differences preview */}
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                <div className="space-y-3.5">
                  <span className="text-[10px] text-cyan-400 font-black block">• تقارير موازنة كاشير الوردية:</span>
                  
                  <div className="space-y-2 text-zinc-300">
                    <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                      <span>الوردية المغلقة:</span>
                      <span className="font-mono text-white font-bold">#{activeShift.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                      <span>الكاشير المسؤول:</span>
                      <span className="font-bold text-white">{activeShift.cashierName}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                      <span>عهدة البداية الافتتاحية:</span>
                      <span className="font-mono text-zinc-100">{activeShift.startingCash} ر.س</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                      <span>إجمالي المبيعات الفعلي للوردية:</span>
                      <span className="font-mono text-white font-bold">{activeShift.systemTotalSales} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الصافي المتوقع بنقدي الصندوق:</span>
                      <span className="font-mono text-amber-500 font-bold">{activeShift.expectedNet} ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 border-r md:pr-6 border-zinc-900 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] text-rose-400 font-black block">• فوارق المطابقة والجرد (Discrepancies Matrix):</span>
                    
                    <div className="grid grid-cols-2 gap-3 leading-tight font-mono">
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/80">
                        <span className="text-[9.5px] text-gray-500 block">فرق النقد (Cash):</span>
                        <span className={`text-xs font-black block mt-1 ${activeShift.cashDiscrepancy === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {activeShift.cashDiscrepancy > 0 ? "+" : ""}{activeShift.cashDiscrepancy} ر.س
                        </span>
                      </div>

                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/80">
                        <span className="text-[9.5px] text-gray-500 block">فرق الشبكة (Mada):</span>
                        <span className={`text-xs font-black block mt-1 ${activeShift.cardDiscrepancy === 0 ? "text-emerald-400" : "text-rose-405"}`}>
                          {activeShift.cardDiscrepancy > 0 ? "+" : ""}{activeShift.cardDiscrepancy} ر.س
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-center text-[10.5px]">
                    {activeShift.cashDiscrepancy === 0 && activeShift.cardDiscrepancy === 0 ? (
                      <span className="text-emerald-400 font-black">✔ الصندوق متطابق بالكامل وصافي من الفروقات!</span>
                    ) : (
                      <span className="text-rose-400 font-black">⚠️ يوجد فرق جرد يرجى من الإدارة أو المشرف دراسته والاعتماد المالي.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Manager UI Actions vs Cashier blocked prompt */}
              {canManagePOSSettings ? (
                <div className="p-5 rounded-2xl border bg-amber-500/5 text-right space-y-4" style={{ borderColor: `${theme.border}` }}>
                  <span className="text-[11px] font-black text-amber-400 block flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    بوابة مصادقة واعتماد موازنة الكاشير (صلاحيات الإشراف):
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold block">• ملاحظات اعتماد وتدقيق المدير:</label>
                      <input
                        type="text"
                        value={managerApprovalNotes}
                        onChange={(e) => setManagerApprovalNotes(e.target.value)}
                        placeholder="تم مضاهاة الخزن مع السحوبات وهو مقبول..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold block">• توقيع إمضاء المدير المسؤول:</label>
                      <input
                        type="text"
                        value={managerSignature}
                        onChange={(e) => setManagerSignature(e.target.value)}
                        placeholder="أدخل اسمك كـ مدير معتب للاستلام..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleInlineApproveShift}
                      className="flex-1 py-3 bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border-none"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعتماد الموازنة للمطابقة وإقفال الوردية نهائياً ✅</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInlineReopenShift}
                      className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>إعادة فتح الوردية لمراجعة مبيعات الكاشير 📂</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-orange-500/5 text-slate-400 border border-slate-900 text-center text-[11px] leading-relaxed">
                  🛡️ حسابك مقيد بمركز الكاشير التسويقي. يتوجب عليك استدعاء المشرف العام للفترة المناوبة أو مالك النظام للتحقق واعتماد موازنة دورتك المالية لإتاحة الأجهزة اللاحقة.
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Catalog panel of Large Image Cards (7 Columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Quick filter selection tabs (Square Quick Bar) */}
          <div className="p-2.5 rounded-2xl flex flex-wrap gap-2 items-center justify-between border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black shrink-0 ml-2" style={{ color: theme.muted }}>شريط فرز الكاشير:</span>
              
              <button
                type="button"
                onClick={() => setSelectedQuickFilter("all")}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-black transition-all cursor-pointer border-none bg-transparent ${selectedQuickFilter === "all" ? "bg-amber-500/10 text-amber-400 font-bold" : "text-gray-400 hover:text-white"}`}
              >
                🪐 الكل
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuickFilter("bestseller")}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-black transition-all cursor-pointer border-none bg-transparent ${selectedQuickFilter === "bestseller" ? "bg-red-500/10 text-red-400 font-bold animate-pulse" : "text-gray-400 hover:text-white"}`}
              >
                🔥 الأكثر مبيعات
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuickFilter("favorites")}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-black transition-all cursor-pointer border-none bg-transparent ${selectedQuickFilter === "favorites" ? "bg-pink-500/10 text-pink-400 font-bold" : "text-gray-400 hover:text-white"}`}
              >
                💖 المفضلة ({favorites.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuickFilter("new")}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-black transition-all cursor-pointer border-none bg-transparent ${selectedQuickFilter === "new" ? "bg-blue-500/10 text-blue-400 font-bold" : "text-gray-400 hover:text-white"}`}
              >
                🆕 أحدث المنتجات
              </button>
            </div>

            <span className="text-[10px] font-mono font-bold text-gray-500 hidden sm:block">
              {filteredProducts.length} صنف متاح
            </span>

          </div>

          {/* Search, SKU & Barcode scanner simulation form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <form onSubmit={handleBarcodeSubmit} className="relative col-span-1 sm:col-span-9 md:col-span-10">
              <input
                type="text"
                placeholder="ابحث باسم السلعة، الباركود أو SKU... واضغط Enter لمحاكاة ماسح الباركود سريعاُ"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl py-3.5 pr-11 pl-32 border outline-none font-sans"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              />
              <Search className="w-5 h-5 absolute right-4 top-3.5 text-gray-400" />
              <button
                type="submit"
                className="absolute left-2.5 top-2 py-1.5 px-3 rounded-lg text-xs font-black text-black cursor-pointer shadow-md bg-amber-500 border-none"
                style={{ backgroundColor: theme.accent }}
              >
                محاكاة الباركود
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                if (!activeShift || activeShift.status !== "open") {
                  addToast("⚠️ يجب فتح الوردية وتفعيل الكاشير قبل بدء مسح الباركود بالكاميرا!", "error");
                  setIsShiftModalOpen(true);
                  return;
                }
                setIsCameraScannerOpen(true);
              }}
              className="col-span-1 sm:col-span-3 md:col-span-2 py-3 px-4 rounded-xl text-xs font-black text-white hover:text-black hover:bg-amber-500 cursor-pointer transition-all flex items-center justify-center gap-2 border shadow-lg border-amber-500/30"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" }}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>مسح بالكاميرا 📷</span>
            </button>
          </div>

          {/* Categories Carousel Tab links */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="py-2.5 px-4 rounded-xl text-[10px] font-black tracking-tight transition-all whitespace-nowrap cursor-pointer shrink-0"
                style={{
                  backgroundColor: selectedCategory === cat ? theme.accent : theme.surface,
                  color: selectedCategory === cat ? "#000" : theme.text,
                  border: `1px solid ${selectedCategory === cat ? theme.accent : theme.border}`
                }}
              >
                {cat === "الكل" ? "🏷️ جميع التصنيفات" : cat}
              </button>
            ))}
          </div>

          {/* Giant Products Grid: optimized for touch with Unsplash illustration (Square POS flavor) */}
          {filteredProducts.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-dashed"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.muted }}>
              <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="font-black text-xs">لا توجد سلع تطابق بحث الكاشير الحالي!</p>
              <p className="text-[10px] text-gray-500 mt-1">امسح الكلمة أو غير التصنيف لمنتج آخر</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {filteredProducts.map((p) => {
                const inStock = p.stock > 0;
                const isLowStock = p.stock > 0 && p.stock < 15;
                const cartCount = cart.find(item => item.product.id === p.id)?.quantity || 0;
                const isFav = favorites.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!inStock) return;
                      if (cartCount === 0) {
                        addToCart(p);
                      } else {
                        if (cartCount + 1 > p.stock) {
                          addToast(`⚠️ الكمية المطلوبة تتجاوز المخزون المتوفر (${p.stock})`, "error");
                          return;
                        }
                        updateCartQty(p.id, cartCount + 1);
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailProduct(p);
                    }}
                    className={`rounded-2xl border transition-all relative overflow-hidden select-none cursor-pointer flex flex-col justify-between h-[135px] shadow-sm bg-zinc-950/40 ${
                      inStock ? "hover:scale-[1.01] hover:shadow-md active:scale-[0.99]" : "opacity-45 cursor-not-allowed"
                    }`}
                    style={{ 
                      borderColor: cartCount > 0 ? theme.accent : theme.border,
                    }}
                  >
                    {/* Unsplash beautiful placeholder overlay */}
                    <div className="relative w-full h-[40%]">
                      <img 
                        src={getProductImage(p)}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover select-none"
                      />
                      {/* Gradient over image for text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-between p-1.5">
                        
                        {/* Favorite & Details buttons */}
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-1 z-20">
                            <button
                              onClick={(e) => toggleFavorite(p.id, e)}
                              className="p-1 rounded-lg bg-black/60 hover:bg-black text-gray-300 hover:text-pink-500 cursor-pointer border-none flex items-center justify-center animate-fade-in"
                              title="حفظ في المفضلة"
                            >
                              <Heart className={`w-3 h-3 ${isFav ? "fill-pink-500 text-pink-500" : ""}`} />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailProduct(p);
                              }}
                              className="py-0.5 px-1 rounded-lg bg-zinc-900 border border-slate-800 text-teal-400 font-extrabold text-[8px] cursor-pointer"
                              title="عرض التفاصيل ومخازن الفروع"
                            >
                              🔍 التفاصيل
                            </button>
                          </div>
                        </div>

                        {/* Stock indicator inside image frame */}
                        <div className="text-right">
                          {!inStock ? (
                            <span className="text-[7px] text-red-400 font-extrabold bg-red-500/10 px-1 py-0.5 rounded-md">
                              نفد
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[7px] text-red-400 font-bold bg-red-600/30 px-1.5 py-0.5 rounded-md animate-pulse">
                              ⚠️ حرج ({p.stock})
                            </span>
                          ) : (
                            <span className="text-[7px] text-emerald-300 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                              المخزون: {p.stock}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Cart count overlay badge */}
                      {cartCount > 0 && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-black animate-pulse shadow-lg"
                          style={{ backgroundColor: theme.accent }}>
                          {cartCount}
                        </div>
                      )}
                    </div>

                    {/* Lower Description detail panel */}
                    <div className="p-2 flex flex-col justify-between flex-1" style={{ backgroundColor: theme.surface }}>
                      
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-extrabold uppercase text-gray-500 block">
                          {p.category}
                        </span>
                        <h3 className="text-[11px] font-black truncate text-right block leading-tight" style={{ color: theme.text }}>
                          {p.name}
                        </h3>
                      </div>

                      {/* Touch point prices grid bottom */}
                      {cartCount > 0 ? (
                        <div className="pt-1 flex justify-between items-center border-t border-dashed w-full" style={{ borderColor: theme.border }}>
                          <span className="font-extrabold text-[10px] text-amber-500">
                            {((p.price ?? 0) * cartCount).toLocaleString("ar-SA")} ر.س
                          </span>
                          
                          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQty(p.id, cartCount - 1);
                              }}
                              className="w-4 h-4 rounded bg-zinc-800 hover:bg-red-950 text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer"
                              title="تقليل الكمية"
                            >
                              <Minus className="w-2.5 h-2.5 text-red-400" />
                            </button>
                            
                            <span className="text-[9px] font-extrabold text-white px-0.5">{cartCount}</span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (cartCount + 1 > p.stock) {
                                  addToast(`⚠️ الكمية المطلوبة تتجاوز المخزون المتوفر (${p.stock})`, "error");
                                  return;
                                }
                                updateCartQty(p.id, cartCount + 1);
                              }}
                              className="w-4 h-4 rounded bg-zinc-800 hover:bg-emerald-950 text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer"
                              title="زيادة الكمية"
                            >
                              <Plus className="w-2.5 h-2.5 text-emerald-400" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 flex justify-between items-end border-t border-dashed" style={{ borderColor: theme.border }}>
                          <span className="text-[8px] text-emerald-500 font-extrabold">بند سريع 🛒</span>
                          <span className="text-[11px] font-black" style={{ color: theme.accent }}>
                            {(p.price ?? 0).toLocaleString("ar-SA")} ر.س
                          </span>
                        </div>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Smart Checkout: Recommends complementary products (Upselling) */}
          <div className="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all animate-fade-in shadow-sm bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-transparent"
            style={{ 
              borderColor: aiRecommendation.suggestedProduct ? theme.accent : theme.border 
            }}>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <h4 className="text-xs font-black text-white">
                  {aiRecommendation.title}
                </h4>
                {aiRecommendation.badge && (
                  <span className="text-[8px] font-extrabold py-0.5 px-2 rounded-full bg-amber-400 text-black">
                    {aiRecommendation.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold leading-relaxed text-gray-300">
                {aiRecommendation.text}
              </p>
            </div>
            
            {aiRecommendation.suggestedProduct && (
              <button
                onClick={addRecommendedOffer}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl cursor-pointer shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap border-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بخصم التوصية (15%)</span>
              </button>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Order Summary & Checkout Panel (4 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl border space-y-4 shadow-sm"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            {/* Header: Shopping Cart info */}
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" style={{ color: theme.accent }} />
                <h3 className="text-xs font-black text-white">سلة الطلب الكاشير السريعة</h3>
              </div>
              
              <button
                type="button"
                onClick={() => { setCart([]); addToast("🛒 تم إفراغ محتويات السلة بالكامل", "info"); }}
                disabled={cart.length === 0}
                className="text-[9.5px] font-black text-red-400 hover:text-red-500 disabled:opacity-30 cursor-pointer border-none bg-transparent"
              >
                إلغاء السلة (إفراغ)
              </button>
            </div>

             {/* Customer Selector & Add quick customer button */}
             <div className="space-y-2 pt-1 border-t" style={{ borderColor: theme.border }}>
               <div className="flex justify-between items-center">
                 <label className="block text-[11px] font-black text-amber-500">
                   👤 منطقة ملف العميل الموثق
                 </label>
                 <button
                   type="button"
                   onClick={() => { setSelectedCustomer("عميل نقدي سريع"); setCustomerSearchQuery(""); addToast("🔄 تم تبديل ملف العميل لعميل زائر نقدي", "info"); }}
                   className="text-[9.5px] font-black bg-zinc-900 hover:bg-zinc-800 text-gray-300 px-2 py-1 rounded-lg border border-slate-800"
                 >
                   إلغاء وتعيين كـ "عميل زائر" 👤
                 </button>
               </div>

               {/* Mobile/Phone Search Bar */}
               <div className="relative">
                 <input
                   type="text"
                   placeholder="🔍 ابحث برقم الجوال أو اسم العميل..."
                   value={customerSearchQuery}
                   onChange={(e) => {
                     setCustomerSearchQuery(e.target.value);
                     // Automatically select customer if exact matched name or phone
                     const matched = customers.find(c => 
                       c.name.toLowerCase() === e.target.value.trim().toLowerCase() ||
                       c.phone.trim() === e.target.value.trim()
                     );
                     if (matched) {
                       setSelectedCustomer(matched.name);
                       addToast(`👤 تم العبث والتعرف التلقائي على الزبون: ${matched.name}`, "success");
                     }
                   }}
                   className="w-full text-xs rounded-xl py-2.5 pr-8 pl-3 border outline-none font-sans"
                   style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                 />
                 <Search className="w-3.5 h-3.5 absolute right-2.5 top-3.5 text-gray-500" />
               </div>
               
               <div className="flex gap-2">
                 <select
                   value={selectedCustomer}
                   onChange={(e) => setSelectedCustomer(e.target.value)}
                   className="flex-1 text-[11px] px-3 py-2.5 rounded-lg border outline-none font-bold"
                   style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                 >
                   <option value="عميل نقدي سريع">عميل نقدي سريع</option>
                   {customers.filter(c => {
                     const q = customerSearchQuery.trim().toLowerCase();
                     if (!q) return true;
                     return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
                   }).map(c => (
                     <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>
                   ))}
                 </select>
                 
                 <button
                   type="button"
                   onClick={() => setIsNewCustomerModal(true)}
                   className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg cursor-pointer border shrink-0 font-bold text-xs flex items-center gap-1"
                   style={{ borderColor: theme.border }}
                   title="تسجيل عميل جديد الكتروني"
                 >
                   <Plus className="w-3.5 h-3.5 text-black" />
                   <span className="text-[10px] font-black">إضافة سريع</span>
                 </button>
               </div>
             </div>

            {/* Customer Quick View Widget (عدد الطلبات ، إجمالي المشتريات ، آخر زيارة ، الرصيد) */}
            <div className="p-3.5 rounded-xl border space-y-2 text-right text-[10px] bg-slate-950/40"
              style={{ borderColor: theme.border }}>
              
              <div className="flex items-center gap-1.5 border-b pb-2 border-slate-900 justify-between">
                <span className="font-extrabold text-[#D4AF37]">📊 إحصائيات ملف العميل الحالي:</span>
                <span className="text-[8px] text-gray-400">قاعدة بيانات سهم</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div className="bg-black/20 p-1.5 rounded">
                  <span className="text-[8px] block text-gray-500">حجم الفواتير</span>
                  <span className="font-bold text-white">{customerStats.ordersCount} طلبات</span>
                </div>
                
                <div className="bg-black/20 p-1.5 rounded">
                  <span className="text-[8px] block text-gray-500 font-sans">إجمالي الاستهلاك</span>
                  <span className="font-black text-emerald-400">{(customerStats.totalSpent ?? 0).toLocaleString("ar-SA")} ر.س</span>
                </div>

                <div className="bg-black/20 p-1.5 rounded">
                  <span className="text-[8px] block text-gray-500">آخر زيارة</span>
                  <span className="font-bold text-white truncate max-w-full block">{customerStats.lastVisit}</span>
                </div>

                <div className="bg-black/20 p-1.5 rounded">
                  <span className="text-[8px] block text-gray-500">الرصيد المحاسبي</span>
                  <span className={`font-black ${(customerStats.balance ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {customerStats.balance === 0 ? "متعادل 0" : `${(customerStats.balance ?? 0).toLocaleString("ar-SA")} ر.س`}
                  </span>
                </div>
              </div>

            </div>

            {/* List of Cart Items */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-14 text-center space-y-2">
                  <ShoppingCart className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-500">عربة الكاشير فارغة حالياً</p>
                  <p className="text-[8px] text-gray-600">انقر على بطاقات المنتجات في اليسار لتسجيل مبيعات الزبون</p>
                </div>
              ) : (
                cart.map((item) => {
                  const finalPrice = item.product.price * (1 - item.discountPercent / 100);
                  return (
                    <div key={item.product.id} className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                      style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                      
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-xs font-black truncate block text-white" style={{ color: theme.text }}>
                          {item.product.name}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] text-gray-500 font-mono">
                            {item.product.sku}
                          </span>
                          <span className="text-[10px] font-black" style={{ color: theme.accent }}>
                            {finalPrice} ر.س
                          </span>
                          {item.discountPercent > 0 && (
                            <span className="text-[8px] px-1 py-0.2 bg-red-400/10 text-red-400 font-bold rounded">
                              خصم {item.discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Touch Controls for quantity adjustment */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="hover:scale-105 active:scale-95 cursor-pointer w-6 h-6 rounded bg-zinc-800 text-white font-black text-[11px] flex items-center justify-center border-none"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        
                        <span className="text-xs font-black min-w-[15px] text-center text-white">
                          {item.quantity}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="hover:scale-105 active:scale-95 cursor-pointer w-6 h-6 rounded bg-zinc-800 text-white font-black text-[11px] flex items-center justify-center border-none"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, 0)}
                          className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded cursor-pointer shrink-0 border-none bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations summaries */}
            <div className="space-y-2 border-t pt-3" style={{ borderColor: theme.border }}>
              
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span>المجموع الكلي المبدئي</span>
                <span>{subtotal.toLocaleString("ar-SA")} ر.س</span>
              </div>

              {/* Direct flat cashier discount */}
              <div className="flex gap-2 items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400">تخفيض الكاشير المباشر (ر.س)</span>
                <input
                  type="number"
                  min="0"
                  disabled={!posSettings.isDiscountAllowed}
                  max={posSettings.maxDiscountLimit}
                  placeholder={posSettings.isDiscountAllowed ? "0.0" : "الخصم معطل"}
                  value={additionalDiscount || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (val > posSettings.maxDiscountLimit) {
                      addToast(`⚠️ عذراً، تجاوزت حد الخصم الأقصى المسموح به (${posSettings.maxDiscountLimit} ر.س)`, "error");
                      return;
                    }
                    setAdditionalDiscount(val);
                  }}
                  className="w-24 text-left text-xs py-1 px-2.5 rounded-lg border font-bold font-mono outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span>ضريبة القيمة المضافة (15% VAT)</span>
                <span>{calculatedTax.toLocaleString("ar-SA")} ر.س</span>
              </div>

              <div className="flex justify-between items-center font-black pt-2 pb-1 text-sm border-t border-dashed"
                style={{ borderColor: theme.border, color: theme.text }}>
                <span>المطلوب دفعه نهائياً</span>
                <span className="text-lg font-black text-amber-500" style={{ color: theme.accent }}>
                  {totalWithDiscountAndTax.toLocaleString("ar-SA")} ر.س
                </span>
              </div>

            </div>

            {/* Mega Touch Buttons Payment Method Selection (نقدي، شبكة، Apple Pay...) */}
            <div className="space-y-2 border-t pt-2" style={{ borderColor: theme.border }}>
              <label className="block text-[11px] font-black text-amber-500">
                💵 أزرار الدفع السريع والتحصيل (Touch Payment Pads)
              </label>
              
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "نقدي", label: "💵 نقدي (كاش)", color: "hover:bg-emerald-500/10" },
                  { id: "شبكة مدى", label: "💳 شبكة (مدى)", color: "hover:bg-blue-500/10" },
                  { id: "Apple Pay", label: "🍎 Apple Pay", color: "hover:bg-gray-100/10" },
                  { id: "STC Pay", label: "📱 STC Pay", color: "hover:bg-purple-500/10" },
                  { id: "دفع متعدد", label: "🧩 دفع مختلط (متعدد)", color: "hover:bg-indigo-500/10" },
                ].filter(item => posSettings.allowedPaymentMethods.includes(item.id))
                 .map((item) => {
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setPaymentMethod(item.id)}
                      className={`py-3.5 px-2 text-[11px] font-extrabold rounded-xl border text-center cursor-pointer transition-all truncate border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed ${item.color} ${
                        isSel ? "!bg-amber-500 !text-black border-yellow-500 font-extrabold scale-[1.02] shadow-md" : "text-gray-300"
                      }`}
                      style={{ 
                        backgroundColor: isSel ? theme.accent : theme.card,
                        color: isSel ? "#000" : ""
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Multi split payments editor if enabled */}
              {paymentMethod === "دفع متعدد" && (
                <div className="p-3 rounded-xl border space-y-2 mt-1 bg-black/50 animate-fade-in" style={{ borderColor: theme.border }}>
                  <span className="text-[8.5px] font-extrabold text-[#D4AF37] block">توزيع أنصبة السداد المختلط:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-bold text-gray-400">رصيد الكاشير (نقدي)</label>
                      <input
                        type="number"
                        value={splitAmounts["نقدي"]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts({
                            "نقدي": val,
                            "شبكة مدى": Math.max(0, totalWithDiscountAndTax - val)
                          });
                        }}
                        className="w-full text-xs p-1.5 text-center font-mono border rounded outline-none"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                      />
                    </div>
                    
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-bold text-gray-400">حساب الشبكة والمدى</label>
                      <input
                        type="number"
                        value={splitAmounts["شبكة مدى"]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts({
                            "شبكة مدى": val,
                            "نقدي": Math.max(0, totalWithDiscountAndTax - val)
                          });
                        }}
                        className="w-full text-xs p-1.5 text-center font-mono border rounded outline-none"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Dynamic Cashier main checkout button */}
            <button
              onClick={processCheckout}
              disabled={cart.length === 0 || busyCheckout}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs rounded-xl cursor-pointer text-white shadow-lg active:scale-[0.98] transition-all text-center mt-2.5 border-none flex items-center justify-center gap-2"
            >
              {busyCheckout ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>جاري تسجيل الفاتورة والمخزون سحابياً...</span>
                </>
              ) : (
                <>
                  <span>🚀 اعتماد وتحصيل قيمة الفاتورة فوراً ({paymentMethod})</span>
                </>
              )}
            </button>

            {/* POS COMMANDS SUB GRID (تعليق ، استرجاع معلق ، مسودة ، PDF ، طباعة ، مشاركة واتس) */}
            <div className="space-y-1.5 border-t pt-3" style={{ borderColor: theme.border }}>
              <label className="block text-[8.5px] font-bold text-gray-500">
                الأوامر الثانوية والعمليات المتطورة للكاشير
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={suspendCurrentBill}
                  disabled={cart.length === 0 || !posSettings.isSuspensionAllowed}
                  className="py-2.5 px-1 bg-zinc-800 hover:bg-zinc-700 text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[9px] font-black cursor-pointer border-none flex flex-col items-center gap-1"
                  title="تعليق الفاتورة الحالية لخدمة عميل آخر"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعليق الفاتورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!posSettings.isRefundAllowed) {
                      addToast("⚠️ خيار استرجاع وإدارة المعلقات معطل من الإعدادات", "error");
                      return;
                    }
                    setIsRecallModalOpen(true);
                  }}
                  disabled={!posSettings.isRefundAllowed}
                  className="py-2.5 px-1 bg-zinc-800 hover:bg-zinc-700 text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[9px] font-black cursor-pointer border-none flex flex-col items-center gap-1 relative"
                  title="عرض واستعادة الفواتير المعلقة"
                >
                  {suspendedBills.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-600 rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-bounce">
                      {suspendedBills.length}
                    </span>
                  )}
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                  <span>استرجاع المعلقة</span>
                </button>

                <button
                  type="button"
                  onClick={saveDraftOrder}
                  disabled={cart.length === 0 || !posSettings.isSuspensionAllowed}
                  className="py-2.5 px-1 bg-zinc-800 hover:bg-zinc-700 text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[9px] font-black cursor-pointer border-none flex flex-col items-center gap-1"
                  title="حفظ الفاتورة كمسودة مؤقتة"
                >
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span>حفظ مسودة</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
      )}

      {/* RECALL SUSPENDED BILLS MODAL PANEL */}
      {isRecallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl border space-y-4 shadow-2xl"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
              <h3 className="text-xs font-black flex items-center gap-2 text-white">
                <RefreshCw className="w-4 h-4 text-amber-500" />
                <span>شاشة الفواتير المعلقة والمسودات قيد المعالجة</span>
              </h3>
              <button 
                onClick={() => setIsRecallModalOpen(false)} 
                className="text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {suspendedBills.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-[10px] space-y-1">
                  <p>لا توجد فواتير معلقة حالياً في حافظة الكاشير.</p>
                  <p className="text-[8.5px] text-gray-600">يمكنك تعليق أي فاتورة عمل عبر زر "تعليق الفاتورة"</p>
                </div>
              ) : (
                suspendedBills.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl border flex justify-between items-center bg-zinc-950/40"
                    style={{ borderColor: theme.border }}>
                    
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.2 bg-yellow-400/10 text-yellow-400 rounded font-bold">{b.id}</span>
                        <span className="text-[10px] font-black text-white">{b.customer}</span>
                      </div>
                      <p className="text-[8px] text-gray-500">توقيت التعليق: {b.time} | إجمالي القيمة: {b.total} ر.س</p>
                      <p className="text-[8px] text-amber-500 leading-relaxed font-bold">{b.notes}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => recallDelayedBill(b)}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-black text-[9px] font-black rounded-lg cursor-pointer border-none"
                      >
                        استعادة للبيع 🔓
                      </button>
                      <button
                        onClick={() => {
                          setSuspendedBills(suspendedBills.filter(bill => bill.id !== b.id));
                          addToast("تم حذف وإتلاف المسودة المعلقة", "info");
                        }}
                        className="p-1 px-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded hover:text-red-500 cursor-pointer text-[10px] bg-transparent"
                        title="حذف نهائي"
                      >
                        حذف نهائي
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* NEW CUSTOMER REGISTRATION MODAL */}
      {isNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl animate-scale-up"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
              <h3 className="text-xs font-black flex items-center gap-2 text-white">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>إضافة وتسجيل عميل فوري معتمد</span>
              </h3>
              <button 
                onClick={() => setIsNewCustomerModal(false)} 
                className="text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addNewCustomerSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold" style={{ color: theme.muted }}>اسم العميل بالكامل *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: صالح الودعاني"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full text-xs rounded-xl py-2.5 px-3 border outline-none font-sans"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold" style={{ color: theme.muted }}>رقم الهاتف السعودي</label>
                  <input
                    type="tel"
                    placeholder="05xxxxxxx"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full text-xs rounded-xl py-2.5 px-3 border outline-none font-mono"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold" style={{ color: theme.muted }}>المدينة الأساسية</label>
                  <select
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full text-xs rounded-xl py-2.5 px-3 border outline-none font-sans"
                    style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all border-none"
              >
                تحديث وحفظ العميل بالفاتورة الحالية
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ======================= PRODUCT VARIANT SELECTION POPUP MODAL ======================= */}
      {variantPromptProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-md p-6 rounded-3xl border space-y-5 shadow-2xl relative"
            style={{ backgroundColor: theme.surface || "#111827", borderColor: theme.border || "#374151" }}>
            
            <button
              onClick={() => setVariantPromptProduct(null)}
              className="absolute top-5 left-5 text-gray-400 hover:text-white cursor-pointer hover:bg-zinc-800 p-1.5 rounded-full border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-500 block">⚙️ خيارات ومواصفات المنتج الإلزامية</span>
              <h3 className="text-sm font-black text-white">
                يرجى تحديد الخيار المطلوب لـ "{variantPromptProduct.name}" قبل الإضافة للسلة:
              </h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {variantPromptProduct.variants?.map((v: any) => {
                const varInStock = (v.stock ?? variantPromptProduct.stock) > 0;
                return (
                  <button
                    key={v.id}
                    disabled={!varInStock}
                    onClick={() => {
                      addToCart(variantPromptProduct, 1, v);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-right border transition-all flex justify-between items-center ${
                      varInStock 
                        ? "bg-zinc-900 border-slate-800 hover:border-amber-550 active:scale-98 cursor-pointer" 
                        : "opacity-40 cursor-not-allowed bg-zinc-955 border-none"
                    }`}
                  >
                    <div>
                      <strong className="block text-xs font-black text-white">{v.optionType}: {v.optionValue}</strong>
                      <span className="text-[9px] font-mono text-gray-400">SKU: {v.sku || variantPromptProduct.sku}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-mono font-black text-xs">{(v.price ?? variantPromptProduct.price).toLocaleString("ar-SA")} ر.س</span>
                      <span className="text-[10px] text-gray-400 font-mono">({v.stock ?? 10} متوفر)</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setVariantPromptProduct(null)}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-zinc-800 text-gray-300 hover:bg-zinc-700 cursor-pointer border-none"
              >
                إلغاء التحديد
              </button>
            </div>
            
          </div>
        </div>
      )}

      {showReceipt && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right" dir="rtl">
          <div className="w-full max-w-xl p-6 rounded-3xl border space-y-4 shadow-2xl relative"
            style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}>
            
            <button
              onClick={() => { setShowReceipt(false); setCompletedOrder(null); }}
              className="absolute top-5 left-5 text-gray-400 hover:text-white cursor-pointer hover:bg-zinc-800 p-1.5 rounded-full border-none bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-lg font-black">
                ✓
              </div>
              <h3 className="text-sm font-black text-white">تم الدفع وحفظ الفاتورة بالربط السحابي المعتمد</h3>
              <p className="text-[10px] text-gray-400 font-mono">رقم القيد: {completedOrder.id} | تاريخ الصفقة: {completedOrder.date}</p>
            </div>

            {/* Template dynamic selector on the fly */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-black text-[#D4AF37] flex items-center gap-1">
                🎨 اختر قالب الفاتورة للمعاينة والطباعة:
              </span>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  addToast(`🔄 تم تبديل عرض الفاتورة إلى قالب: ${e.target.value}`, "info");
                }}
                className="text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white p-2 outline-none focus:border-amber-500 font-bold"
              >
                <option value="حراري - 80مم">حراري مبسط للصالات - 80مم 🖨️</option>
                <option value="A4 رسمي">نموذج ضريبي معتمد A4 📄</option>
                <option value="فاخر ذهبي">قالب فاخر ذهبي وطيب 👑✨</option>
                <option value="حديث بسيط">قالب حديث بسيط ونظيف ⬜</option>
                <option value="تسويقي">قالب تسويقي مع هدايا وخصومات 🎁🏷️</option>
              </select>
            </div>

            {/* Active Rendered Live Template Preview container on UI */}
            <div className="p-4 rounded-2xl max-h-[290px] overflow-y-auto shadow-inner select-text border"
              style={{
                backgroundColor: selectedTemplate === "فاخر ذهبي" ? "#171717" : selectedTemplate === "تسويقي" ? "#fbfdfa" : selectedTemplate === "حديث بسيط" ? "#f9fafb" : "#ffffff",
                borderColor: selectedTemplate === "فاخر ذهبي" ? "#D4AF37/30" : "#e5e7eb",
                color: selectedTemplate === "فاخر ذهبي" ? "#f5f5f5" : "#1f2937"
              }}
            >
              {/* Template: Luxury Gold */}
              {selectedTemplate === "فاخر ذهبي" && (
                <div className="space-y-4 text-center font-sans text-xs">
                  <div className="border-b border-amber-500/20 pb-3 space-y-1">
                    {posSettings.invoiceLogoUrl ? (
                      <img src={posSettings.invoiceLogoUrl} className="mx-auto h-14 object-contain mb-2 rounded" />
                    ) : (
                      <span className="block text-xl">👑</span>
                    )}
                    <span className="font-black text-sm text-amber-500 block">مراسيم الطيب الفاخرة المحدودة</span>
                    <span className="text-[9px] text-amber-500/70 block">سجل تجاري: 1010887645 | الرقم الضريبي: 310455896200003</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-right text-gray-400 border-b border-amber-500/20 pb-2">
                    <div>رقم الحساب: <b className="text-white font-mono">{completedOrder.id}</b></div>
                    <div>المحاسب: <b className="text-white">{user.name}</b></div>
                    <div>تاريخ الفرز: <b className="text-white font-sans">{completedOrder.date}</b></div>
                    <div>العميل: <b className="text-white">{completedOrder.customer || "عميل طيب كريم"}</b></div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 text-[10px] text-right pb-3 border-b border-amber-500/10">
                    <div className="flex justify-between font-black text-amber-400 border-b border-amber-500/20 pb-1">
                      <span className="flex-1">السلعة الفاخرة</span>
                      <span className="w-8 text-center">الكمية</span>
                      <span className="w-16 text-left">شامل القيمة</span>
                    </div>
                    {completedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-gray-200">
                        <span className="flex-1 truncate">{it.name}</span>
                        <span className="w-8 text-center font-bold">{it.qty}</span>
                        <span className="w-16 text-left font-mono font-bold">{it.total.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals info */}
                  <div className="space-y-1 text-right text-[10px] text-gray-400">
                    <div className="flex justify-between">
                      <span>صافي القيمة قبل الضريبة:</span>
                      <span>{(completedOrder.total / 1.15).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ضريبة مضافة (15%):</span>
                      <span>{(completedOrder.total - (completedOrder.total / 1.15)).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between font-black text-xs text-amber-400 pt-1.5 border-t border-amber-500/30">
                      <span>الإجمالي الفاخر المدفوع:</span>
                      <span className="font-mono">{completedOrder.total.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/10 text-center text-[10px] text-amber-500 font-bold">
                    <p>{posSettings.customThankYouText || "شكراً لثقتكم بمراسيم الطيب الملكي!"}</p>
                    {posSettings.optionalDiscountCode && (
                      <div className="mt-2 bg-amber-500/10 p-2 rounded-lg border border-dashed border-amber-500/20">
                        <span className="block text-[8px] text-gray-400 font-normal">هديتكم العطرية لزيارتكم القادمة:</span>
                        <span className="text-amber-400 font-mono tracking-wider font-bold">[ {posSettings.optionalDiscountCode} ]</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Template: Simple Modern */}
              {selectedTemplate === "حديث بسيط" && (
                <div className="space-y-4 text-gray-800 font-sans text-xs">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div className="text-right">
                      <h4 className="font-black text-gray-900">مراسيم الطيب للتجارة المحدودة</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">سجل: 1010887645 | ضريبة: 310455896200003</p>
                    </div>
                    {posSettings.invoiceLogoUrl ? (
                      <img src={posSettings.invoiceLogoUrl} className="h-10 object-contain rounded" />
                    ) : (
                      <span className="text-lg">⬜</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[9.5px] text-gray-500 pb-2 border-b border-gray-100">
                    <div>رقم الحساب: <span className="font-mono text-gray-800 font-bold">{completedOrder.id}</span></div>
                    <div>المحاسب: <span className="text-gray-800 font-bold">{user.name}</span></div>
                    <div>تاريخ الفرز: <span className="text-gray-800 font-bold">{completedOrder.date}</span></div>
                    <div>العميل: <span className="text-gray-800 font-bold">{completedOrder.customer || "عميل نقدي"}</span></div>
                  </div>

                  {/* Items List */}
                  <table className="w-full text-[10px] text-right">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-semibold">
                        <th className="py-1">الصنف</th>
                        <th className="py-1 text-center">الكمية</th>
                        <th className="py-1 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrder.items.map((it, idx) => (
                        <tr key={idx} className="border-b border-gray-50 text-gray-700">
                          <td className="py-1.5 font-bold truncate">{it.name}</td>
                          <td className="py-1.5 text-center font-mono">{it.qty}</td>
                          <td className="py-1.5 text-left font-mono font-bold">{it.total.toFixed(2)} ر.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals info */}
                  <div className="space-y-1 text-right text-[10px] text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex justify-between">
                      <span>المبلغ غير شامل الضريبة:</span>
                      <span>{(completedOrder.total / 1.15).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الضريبة المضافة (15%):</span>
                      <span>{(completedOrder.total - (completedOrder.total / 1.15)).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between font-black text-xs text-slate-900 border-t border-gray-200 pt-1 mt-1">
                      <span>الإجمالي النهائي:</span>
                      <span className="font-mono">{completedOrder.total.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-gray-500 font-semibold">{posSettings.customThankYouText || "شكراً لكم ونراكم قريباً!"}</p>
                </div>
              )}

              {/* Template: Marketing */}
              {selectedTemplate === "تسويقي" && (
                <div className="space-y-4 text-emerald-950 font-sans text-xs">
                  <div className="text-center border-b border-emerald-900/10 pb-3 space-y-1">
                    <span className="block text-2xl">🛍️✨🎁</span>
                    <span className="font-black text-sm text-emerald-900 block">مراسيم الطيب • عائلة العطور الرائعة</span>
                    <p className="text-[9.5px] text-emerald-800/80 leading-normal">نسعد بمشاركتكم لحظات الضيافة الملكية!</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-900/10 p-3 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1">🎁 هدية وقسيمة خصم ممتازة:</span>
                    <p className="text-[9.5px] text-gray-600 leading-normal">يسرنا تزويدكم بكوبون خصم 10% لتقدير ثقتكم بمراسيم الطيب الملكية. استخدمه في فروعنا لزيارتكم القادمة!</p>
                    <div className="bg-white border-2 border-dashed border-emerald-500/30 p-2 text-center rounded-xl font-bold font-mono text-emerald-700 select-all">
                      {posSettings.optionalDiscountCode || "WELCOME10"}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 text-[10px] text-right">
                    <div className="flex justify-between font-extrabold text-emerald-900 border-b border-emerald-900/10 pb-1">
                      <span>المنتج الأنيق</span>
                      <span className="w-8 text-center">الكمية</span>
                      <span>الإجمالي</span>
                    </div>
                    {completedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span className="font-bold truncate">{it.name}</span>
                        <span className="w-8 text-center font-mono">{it.qty}</span>
                        <span className="font-mono font-bold text-slate-800">{it.total.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="flex justify-between font-black text-xs text-emerald-950 pt-2 border-t border-dashed border-emerald-900/10">
                    <span>الإجمالي الإجمالي المدفوع:</span>
                    <span className="font-mono" style={{ color: posSettings.invoicePrimaryColor || "#10B981" }}>{completedOrder.total.toFixed(2)} ر.س</span>
                  </div>

                  <p className="text-center text-[10px] font-bold text-emerald-800 italic">{posSettings.customThankYouText || "نشكر تسوقكم معنا ونهيب بزيارتكم مجدداً!"}</p>
                </div>
              )}

              {/* Template: Official Tax Invoice A4 */}
              {selectedTemplate === "A4 رسمي" && (
                <div className="space-y-3.5 text-slate-900 font-sans text-xs">
                  <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center text-right">
                    <div className="space-y-0.5">
                      <span className="font-black text-gray-900 block">مراسيم الطيب للتجارة المحدودة</span>
                      <span className="text-[8.5px] text-slate-500 leading-none">Simplified Tax Invoice | فاتورة ضريبية مبسطة معتمدة</span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-slate-900">ID: {completedOrder.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[9px] pb-2 border-b">
                    <div>
                      <span className="text-gray-400 block">بيانات المتجر:</span>
                      <span>الرقم الضريبي: <b>310455896200003</b></span><br />
                      <span>سجل تجاري: <b>1010887645</b></span><br />
                      <span>الهاتف: <b>920033221</b></span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">سجل الفاتورة:</span>
                      <span>التاريخ والوقت: <b>{completedOrder.date}</b></span><br />
                      <span>العميل الموثق: <b>{completedOrder.customer || "سفري نقدي"}</b></span><br />
                      <span>المحاسب المفوض: <b>{user.name}</b></span>
                    </div>
                  </div>

                  {/* High Quality List */}
                  <div className="space-y-1.5 text-[9px]">
                    <div className="font-bold grid grid-cols-4 bg-slate-100 p-1 rounded-md text-right">
                      <span>السلعة / الصنف</span>
                      <span className="text-center">الكمية</span>
                      <span className="text-left">سعر المفرد</span>
                      <span className="text-left">الإجمالي</span>
                    </div>
                    {completedOrder.items.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-4 px-1 py-0.5 border-b text-slate-700">
                        <span className="truncate font-bold">{it.name}</span>
                        <span className="text-center font-mono">{it.qty}</span>
                        <span className="text-left font-mono">{it.price.toFixed(2)} ر.س</span>
                        <span className="text-left font-mono font-bold text-slate-950">{it.total.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals table */}
                  <div className="w-1/2 mr-auto text-left text-[9.5px] space-y-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex justify-between">
                      <span>المبلغ الخاضع للضريبة:</span>
                      <span>{(completedOrder.total / 1.15).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <span>{(completedOrder.total - (completedOrder.total / 1.15)).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-[#111827] border-t pt-0.5">
                      <span>الإجمالي شامل الضريبة:</span>
                      <span className="font-mono text-emerald-700">{completedOrder.total.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <p className="text-center text-[9px] text-slate-500 border-t pt-1.5">{posSettings.customThankYouText || "شاكرين ثقتكم، ونسعد بخدمتكم الدائمة!"}</p>
                </div>
              )}

              {/* Template: Standard POS Thermal (Compact 80mm) */}
              {selectedTemplate === "حراري - 80مم" && (
                <div className="space-y-3.5 text-zinc-900 font-mono text-[10px] text-right">
                  <div className="text-center space-y-0.5 border-b pb-2 border-dashed border-gray-300">
                    <span className="font-black text-xs block">مراسيم الطيب للتجارة</span>
                    <span className="text-[8.5px] text-gray-500 block">سجل تجاري: 1010887645 | فرع الرياض الموحد</span>
                    <span className="text-[8.5px] text-gray-400 block bg-zinc-100 py-0.5 rounded inline-block px-1.5 mt-1 font-sans">فاتورة مبيعات تبسيطية</span>
                  </div>

                  <div className="space-y-0.5 border-b pb-2 border-dashed border-gray-200 text-[8.5px] text-gray-600 font-sans">
                    <div className="flex justify-between">
                      <span>رقم الحصيلة:</span>
                      <span className="font-bold font-mono">{completedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>العميل:</span>
                      <span className="font-bold">{completedOrder.customer || "عميل سفري"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المحاسب المفوض:</span>
                      <span>{user.name}</span>
                    </div>
                  </div>

                  {/* Table details */}
                  <div className="space-y-1.5 border-b pb-2 border-dashed border-gray-200 text-[9.5px]">
                    <div className="flex justify-between font-black border-b pb-1 text-gray-900 font-sans">
                      <span className="flex-1 text-right">الصنف / السلعة</span>
                      <span className="w-10 text-center">الكمية</span>
                      <span className="w-14 text-left">شامل ضريبة</span>
                    </div>
                    {completedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-800">
                        <span className="flex-1 text-right truncate font-bold">{it.name}</span>
                        <span className="w-10 text-center font-bold font-mono">{it.qty}</span>
                        <span className="w-14 text-left font-bold font-mono">{it.total.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-0.5 text-[9px] text-zinc-700">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{(completedOrder.total / 1.15).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الضريبة المضافة (15%):</span>
                      <span>{(completedOrder.total - (completedOrder.total / 1.15)).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-xs text-black border-t pt-1 border-gray-400">
                      <span>الإجمالي المدفوع:</span>
                      <span className="font-mono">{completedOrder.total.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  {/* QR details & verification */}
                  {posSettings.showQrCode !== false && (
                    <div className="text-center pt-2 border-t border-dashed border-gray-300 space-y-1">
                      <div className="mx-auto w-24 h-24 bg-white p-1 border rounded-xl flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://sahm-erp.com/verify-invoice?id=${completedOrder.id}&total=${completedOrder.total}&vat=${(completedOrder.total - (completedOrder.total / 1.15)).toFixed(2)}&date=${encodeURIComponent(completedOrder.date)}`)}`} 
                          alt="قيد مبيعات معتمد" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[7.5px] text-gray-400 font-mono tracking-wider block">{completedOrder.id}-SAHM-ZATCA</span>
                      <p className="text-[7.5px] text-emerald-600 font-bold leading-none">✓ معتمد من البوابة الوطنية ومحصل سحابياً</p>
                    </div>
                  )}

                  <p className="text-center text-[9px] text-zinc-500 font-sans mt-2">{posSettings.customThankYouText || "شكراً لكم لمساهمتكم!"}</p>
                </div>
              )}
            </div>

            {/* Print action bottom grid - fully restored and updated with high fidelity actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-sans">
              <button
                type="button"
                onClick={() => {
                  try {
                    const compInfo: CompanyInfo = {
                      name: "شركة مراسيم الطيب للتجارة المحدودة",
                      crNumber: "1010887645",
                      taxNumber: "310455896200003",
                      phone: "920033221",
                      address: activeBranchRef?.name ? `المملكة العربية السعودية، الرياض، فرع ${activeBranchRef.name}` : "الرياض، شارع العليا العام، المملكة العربية السعودية"
                    };
                    const settingsOverride = { ...posSettings, invoiceTemplate: selectedTemplate };
                    printInvoiceDirect(
                      completedOrder,
                      settingsOverride,
                      compInfo,
                      (msg, type) => addToast(msg, type || "success"),
                      () => {
                        // Callback runs instantly after print window completes or is dismissed
                        setShowReceipt(false);
                        setCompletedOrder(null);
                        setCart([]);
                        setAdditionalDiscount(0);
                        setSelectedCategory("الكل");
                        addToast("🎉 تمت الطباعة وتهيئة السلة واسترجاع واجهة الكاشير تلقائياً بنجاح!", "success");
                      }
                    );
                  } catch (e) {
                    addToast("⚠️ تعذر تشغيل معالج الطباعة فوراً.", "error");
                  }
                }}
                className="py-2.5 px-2 rounded-xl text-[9.5px] font-black bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 border border-[#D4AF37]/30 text-white cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                <span>طباعة الفاتورة 🖨️</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const compInfo: CompanyInfo = {
                      name: "شركة مراسيم الطيب للتجارة المحدودة",
                      crNumber: "1010887645",
                      taxNumber: "310455896200003",
                      phone: "920033221",
                      address: activeBranchRef?.name ? `المملكة العربية السعودية، الرياض، فرع ${activeBranchRef.name}` : "الرياض، شارع العليا العام، المملكة العربية السعودية"
                    };
                    const settingsOverride = { ...posSettings, invoiceTemplate: selectedTemplate };
                    const success = await exportInvoiceToPDF(completedOrder, settingsOverride, compInfo, (msg, type) => addToast(msg, type || "success"));
                    if (success) {
                      setShowReceipt(false);
                      setCompletedOrder(null);
                      setCart([]);
                      setAdditionalDiscount(0);
                      setSelectedCategory("الكل");
                    } else {
                      addToast("تعذر إنشاء ملف PDF، حاول مرة أخرى", "error");
                    }
                  } catch (e) {
                    addToast("تعذر إنشاء ملف PDF، حاول مرة أخرى", "error");
                  }
                }}
                className="py-2.5 px-2 rounded-xl text-[9.5px] font-black bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer flex flex-col items-center justify-center gap-1.5 border-none transition-all text-center"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>تصدير PDF 📄</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    const compInfo: CompanyInfo = {
                      name: "شركة مراسيم الطيب للتجارة المحدودة",
                      crNumber: "1010887645",
                      taxNumber: "310455896200003",
                      phone: "920033221",
                      address: activeBranchRef?.name ? `المملكة العربية السعودية، الرياض، فرع ${activeBranchRef.name}` : "الرياض، شارع العليا العام، المملكة العربية السعودية"
                    };
                    const settingsOverride = { ...posSettings, invoiceTemplate: selectedTemplate };
                    runInvoiceShareWhatsApp(completedOrder, settingsOverride, compInfo, (msg, type) => addToast(msg, type || "success"));
                  } catch (e: any) {
                    addToast("تم إنشاء الفاتورة، يمكنك تنزيلها ومشاركتها يدويًا", "info");
                  }
                }}
                className="py-2.5 px-2 rounded-xl text-[9.5px] font-black bg-emerald-700/20 hover:bg-emerald-700/35 border border-emerald-500/30 text-emerald-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>مشاركة واتساب 💬</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToast("✓ تم إرسال رابط تحميل الفاتورة بالـ SMS المعتمد للعميلสำเร็จ!", "success");
                }}
                className="py-2.5 px-2 rounded-xl text-[9.5px] font-black bg-teal-850/25 hover:bg-teal-800/25 border border-teal-500/30 text-teal-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>إرسال للعميل 📱</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReceipt(false);
                  setCompletedOrder(null);
                  setCart([]);
                  setAdditionalDiscount(0);
                  setSelectedCategory("الكل");
                  addToast("↩️ تم قفل السند المبيعات وتفريغ السلة والعودة لصالة الكاشير بنجاح.", "info");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-200 hover:bg-slate-300 text-slate-900 border-none cursor-pointer transition-all text-center flex items-center justify-center gap-2"
              >
                <span>الرجوع للكاشير ↩️</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📦 Product Detail View Modal (Requirements 6, 9) */}
      {selectedDetailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl border space-y-4 shadow-2xl"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
              <h3 className="text-xs font-black flex items-center gap-2 text-white">
                <Package className="w-4 h-4 text-teal-400" />
                <span>تفاصيل الصنف النشط ومخزون الفروع الموارد</span>
              </h3>
              <button 
                onClick={() => setSelectedDetailProduct(null)} 
                className="text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3 h-36 rounded-xl overflow-hidden relative border border-slate-800 shrink-0">
                <img 
                  src={getProductImage(selectedDetailProduct)} 
                  alt={selectedDetailProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-grow space-y-2">
                <div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold uppercase">
                    {selectedDetailProduct.category}
                  </span>
                  <h2 className="text-sm font-black text-white mt-1 mb-0.5">{selectedDetailProduct.name}</h2>
                  <p className="text-[10px] text-gray-400 font-mono">SKU: {selectedDetailProduct.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-black/30 p-2 rounded-lg text-right">
                    <span className="text-[8px] font-bold text-gray-500 block">سعر مبيع التجزئة</span>
                    <span className="text-xs font-black text-emerald-400">{(selectedDetailProduct.price ?? 0).toLocaleString("ar-SA")} ر.س</span>
                  </div>

                  <div className="bg-black/30 p-2 rounded-lg text-right">
                    <span className="text-[8px] font-bold text-gray-500 block">تكلفة الشراء والمردود</span>
                    {user.role === "كاشير" ? (
                      <span className="text-[9.5px] font-black text-red-400">🔒 محجوب وصلاحية مقيدة</span>
                    ) : (
                      <span className="text-xs font-black text-teal-400">{selectedDetailProduct.cost ? Number(selectedDetailProduct.cost).toLocaleString("ar-SA") : "لا توجد"} ر.س</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-slate-900 space-y-1.5 text-right">
                <span className="text-[9px] font-black text-[#D4AF37] block">🏢 توزيع مخزون الفروع والمستودعات العامة:</span>
                <div className="grid grid-cols-3 gap-2 text-[9px] text-gray-300">
                  <div className="bg-black/25 p-1.5 rounded text-center">
                    <span className="text-gray-500 block">الفرع الرئيسي</span>
                    <span className="font-extrabold text-emerald-400">{selectedDetailProduct.stock} قطعة</span>
                  </div>
                  <div className="bg-black/25 p-1.5 rounded text-center">
                    <span className="text-gray-500 block">معرض جدة</span>
                    <span className="font-bold text-gray-400">{Math.round(selectedDetailProduct.stock * 0.4)} قطعة</span>
                  </div>
                  <div className="bg-black/25 p-1.5 rounded text-center">
                    <span className="text-gray-500 block">المستودع الرئيسي</span>
                    <span className="font-bold text-gray-400">{Math.round(selectedDetailProduct.stock * 1.5)} قطعة</span>
                  </div>
                </div>
              </div>

              {selectedDetailProduct.description && (
                <div className="p-3 rounded-lg bg-zinc-900 text-[10px] text-gray-400 text-right">
                  <strong className="text-white block mb-0.5">وصف الصنف والمكونات:</strong>
                  {selectedDetailProduct.description}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (selectedDetailProduct.stock <= 0) {
                    addToast("⚠️ المنتج غير متوفر بالكامل في المخزن الأساسي!", "error");
                    return;
                  }
                  addToCart(selectedDetailProduct);
                  setSelectedDetailProduct(null);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all text-center border-none cursor-pointer"
              >
                📥 إضافة لعربة الكاشير فوراً
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Smart Product Builder modal wrapper for POS view (Requirements 1, 9) */}
      {showAIBuilder && (
        <AIProductBuilder
          products={products}
          setProducts={setProducts}
          theme={theme}
          onClose={() => {
            setShowAIBuilder(false);
            setEditingProductId(null);
          }}
          triggerNotification={(text, type) => addToast(text, type === "error" ? "error" : "success")}
          addAuditLog={() => {}}
          editingProductId={editingProductId}
          currentUser={user}
        />
      )}

      {/* POS Settings Modal */}
      {isSettingsModalOpen && (
        <PosSettingsModal
          currentPosId={activePosId}
          posUnits={posUnits}
          warehouses={warehouses}
          theme={theme}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={(updatedSettings) => {
            setPosSettings(updatedSettings);
            // Additionally refresh page state or component lists in background
            if (activePosRef) {
              activePosRef.status = updatedSettings.posStatus === "نشطة" ? "نشطة" : "متوقفة";
              activePosRef.warehouseId = updatedSettings.associatedWarehouseId;
            }
          }}
          triggerNotification={(text, type) => addToast(text, type === "error" ? "error" : "success")}
          addAuditLog={addAuditLog}
        />
      )}

      {/* POS Shift Handover & Daily Balancing Modal */}
      {isShiftModalOpen && (
        <ShiftHandoverModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          theme={theme}
          user={user}
          invoices={rawInvoices}
          activeBranchId={activeBranchId}
          branches={branches}
          activePosId={activePosId}
          posUnits={posUnits}
          triggerNotification={(text, type) => addToast(text, type === "error" ? "error" : "success")}
          addAuditLog={addAuditLog}
          onShiftStateChange={(currentShift) => {
            const db = SahmDatabaseService.getInstance();
            setActiveShift(currentShift);
            window.dispatchEvent(new CustomEvent("sahm_active_shift_changed", { detail: currentShift }));
            if (currentShift) {
              db.saveShift(currentShift).catch(console.error);
              if (currentShift.status === "open") {
                setIsShiftModalOpen(false); // Transition automatically to POS Cashier interface
                addToast("تم فتح الوردية، يمكنك بدء البيع", "success");
              } else {
                // Closed or pending_approval: Prevent sales, clear cart, go to lock screen
                setCart([]);
                setAdditionalDiscount(0);
                setIsShiftModalOpen(false);
                addToast("تم إقفال الوردية الحالية بنجاح ونقل الحالة.", "success");
              }
            } else {
              setCart([]);
              setAdditionalDiscount(0);
              setIsShiftModalOpen(false);
              addToast("تم إغلاق الوردية والعودة لوضع الإقفال.", "info");
            }
          }}
          activeShift={activeShift}
        />
      )}

      {/* Real-time Camera Barcode Scanner component */}
      {isCameraScannerOpen && (
        <CameraBarcodeScanner
          onScanSuccess={handleCameraScanSuccess}
          onClose={() => setIsCameraScannerOpen(false)}
          playBeep={playBeep}
          theme={theme}
        />
      )}

      {/* POS status suspended overlay */}
      {posSettings.posStatus === "متوقفة" && (
        <div className="fixed inset-0 z-40 bg-zinc-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none" dir="rtl">
          <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-900 bg-zinc-950/90 space-y-5 shadow-2xl relative">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-black text-white">نقطة البيع متوقفة حالياً 🚫</h2>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                عذراً، حالة نقطة البيع الحالية [{activePosRef?.name || activePosId}] غير نشطة. تم تعليق كافة صلاحيات الكاشير والمعاملات المالية بقرار إداري.
              </p>
            </div>
            {canManagePOSSettings ? (
              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <p className="text-[9px] text-amber-500 font-bold">لأنك مشرف/مدير نظام، يمكنك تعديل الإعدادات لإعادة التفعيل:</p>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-1 mx-auto border-none"
                >
                  <Settings className="w-4 h-4" />
                  <span>فتح بوابة الإعدادات الفورية ⚙️</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-900/70 text-[9px] text-zinc-500">
                يرجى مراجعة مشرف الفروع أو مدير عام نظام سهم ERP لإعطاء الأذونات التشغيلية اللازمة.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
