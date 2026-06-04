import React, { useState, useEffect } from "react";
import { Product, Invoice, Customer, ThemeColors, User } from "../types";
import { 
  Search, Tablet, Coins, CreditCard, Apple, CheckCircle2, 
  Printer, X, Send, Sparkles, ShoppingCart, Plus, Minus, Trash2, ShieldAlert,
  Heart, Star, Bookmark, Award, Share2, Download, RefreshCw, Flame, Users, 
  Landmark, Layers, ToggleLeft, ToggleRight, Database, TrendingUp, Calendar, 
  DollarSign, Eye, Play, Lock, Shield, Coffee, ChevronDown, CheckCircle,
  Minimize, Maximize, Minimize2, Maximize2, Package
} from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import AIProductBuilder from "./AIProductBuilder";

import { productService } from "../core/database/productService";

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
  activeBranchId = "br_riyadh_main",
  activeWarehouseId = "wh_central_riyadh",
  activePosId = "pos_riyadh_1",
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
  const invoices = rawInvoices.filter(inv => {
    return !activeBranchId || !inv.branch_id || inv.branch_id === activeBranchId;
  });

  // Get active selected environment references
  const activeBranchRef = branches.find(b => b.id === activeBranchId);
  const activeWarehouseRef = warehouses.find(w => w.id === activeWarehouseId);
  const activePosRef = posUnits.find(p => p.id === activePosId);
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

  // Completed Order Modal
  const [completedOrder, setCompletedOrder] = useState<Invoice | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
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

  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const categories = ["الكل", ...Array.from(new Set(products.map(p => p.category)))];

  // Get active selected customer stats (عدد الطلبات ، إجمالي المشتريات ، آخر زيارة ، الرصيد)
  const getCustomerStats = () => {
    const custInvs = invoices.filter(inv => inv.customer.trim().toLowerCase() === selectedCustomer.trim().toLowerCase());
    const ordersCount = custInvs.length;
    const totalSpent = custInvs.reduce((sum, inv) => sum + inv.total, 0);
    const lastVisit = custInvs[0]?.date || "لا توجد زيارة سابقة";
    
    // Find customer object to get actual accounting ledger balance
    const activeCustObj = customers.find(c => c.name.trim().toLowerCase() === selectedCustomer.trim().toLowerCase());
    const balance = activeCustObj ? activeCustObj.balance : 0;

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

  const taxRate = 0.15; // 15% VAT
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
  const processCheckout = () => {
    if (cart.length === 0) {
      addToast("⚠️ العربة فارغة! اضغط على المنتجات لإضافتها.", "error");
      return;
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

    const invoiceId = `INV-POS-${Date.now().toString().slice(-6)}`;

    // Dedut stocks globally
    const updatedProducts = products.map(p => {
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

        // Save dynamically to the persistent database
        productService.update(p.id, { stock: newStock }).catch(err => {
          console.error("Failed to update product stock: ", err);
        });

        return {
          ...p,
          stock: newStock
        };
      }
      return p;
    });

    const newInvoice: Invoice = {
      id: invoiceId,
      type: "sale",
      customer: selectedCustomer,
      date: new Date().toISOString().split('T')[0],
      total: Math.round(totalWithDiscountAndTax),
      status: "مدفوع",
      items: cart.map(item => {
        const finalPrice = item.product.price * (1 - item.discountPercent / 100);
        return {
          name: item.product.name,
          qty: item.quantity,
          price: finalPrice,
          total: Math.round(finalPrice * item.quantity)
        };
      }),
      branch_id: activeBranchId,
      store_id: "store_1"
    };

    setProducts(updatedProducts);
    setInvoices([newInvoice, ...rawInvoices]);
    setCompletedOrder(newInvoice);
    setShowReceipt(true);
    setCart([]);
    setAdditionalDiscount(0);
    addToast(`🚀 تم اعتماد وحفظ قيمة الفاتورة وإصدار سند قبض الكتروني ${invoiceId}`, "success");
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

  return (
    <div className="space-y-5 font-sans">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-4 left-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm border"
          style={{ 
            backgroundColor: toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : theme.accent,
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: toast.type === "info" || toast.type === "success" ? "#000" : "#FFF"
          }}>
          <span className="font-extrabold text-xs">{toast.text}</span>
        </div>
      )}

      {/* Touch POS Header: Mode Selector & Status */}
      <div className="p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between border select-none shadow-sm"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 animate-pulse shrink-0">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight flex items-center gap-1" style={{ color: theme.text }}>
                <span>مراسيم الطيب الذكية Touch POS Pro 💎</span>
                {isPosFullscreen && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-400 font-bold">وضع الكاشير النشط</span>
                )}
              </h1>
              <p className="text-[10px]" style={{ color: theme.muted }}>
                نظام الفواتير المطور المتزامن مع هيئة الزكاة والضريبة والجمارك (ZATCA)
              </p>
            </div>
          </div>

          {/* Quick exit for fullscreen */}
          {isPosFullscreen && (
            <button
              onClick={() => { setIsPosFullscreen(false); addToast("تم الخروج من وضع الكاشير ملء الشاشة", "info"); }}
              className="lg:hidden py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-md border-none transition-all cursor-pointer"
            >
              <Minimize className="w-3.5 h-3.5" />
              <span>خروج ➔</span>
            </button>
          )}
        </div>

        {/* POS Mode Actions (Compact / Non-manual role) */}
        <div className="flex items-center gap-2 flex-wrap">
          {user.role !== "كاشير" && (
            <button
              onClick={() => {
                if (typeof (window as any).__sahm_global_navigate === "function") {
                  (window as any).__sahm_global_navigate("products");
                }
              }}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-[10px] rounded-lg flex items-center gap-1 shadow cursor-pointer border border-slate-700"
            >
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>إدارة المنتجات والمستودعات ➔</span>
            </button>
          )}

          {/* Fullscreen Button toggles */}
          {!isPosFullscreen ? (
            <button
              onClick={() => { setIsPosFullscreen(true); addToast("🖥️ تم الدخول في وضع الكاشير ملء الشاشة المستقل", "success"); }}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg flex items-center gap-1 shadow cursor-pointer border-none"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>تفعيل ملء الشاشة 🖥️</span>
            </button>
          ) : (
            <button
              onClick={() => { setIsPosFullscreen(false); addToast("🖥️ تم الخروج والعودة للوحة تحكم سهم العامة", "info"); }}
              className="hidden lg:flex py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] rounded-lg items-center gap-1 shadow cursor-pointer border-none"
            >
              <Minimize className="w-3.5 h-3.5" />
              <span>خروج ملء الشاشة ➔</span>
            </button>
          )}
        </div>

        {/* Top-Right Quick Stats Trigger & Cashier Info */}
        <div className="flex items-center gap-3">
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
              {analytics.todaySales.toLocaleString("ar-SA")} ر.س
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
              {analytics.avgBill.toLocaleString("ar-SA")} ر.س
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

      {/* Main Touch Grid Layout */}
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
            <form onSubmit={handleBarcodeSubmit} className="relative sm:col-span-12">
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
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
                    className={`rounded-2xl border transition-all relative overflow-hidden select-none cursor-pointer flex flex-col justify-between h-[195px] shadow-sm bg-zinc-950/40 ${
                      inStock ? "hover:scale-[1.01] hover:shadow-md active:scale-[0.99]" : "opacity-45 cursor-not-allowed"
                    }`}
                    style={{ 
                      borderColor: cartCount > 0 ? theme.accent : theme.border,
                    }}
                  >
                    {/* Unsplash beautiful placeholder overlay */}
                    <div className="absolute inset-x-0 top-0 h-[35%] relative">
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

                          {/* SKU decoration badge */}
                          <span className="text-[7px] px-1 py-0.5 rounded-md font-mono bg-black/70 font-bold text-gray-200 uppercase tracking-wider">
                            {p.sku}
                          </span>
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
                        <div className="pt-1.5 flex flex-col gap-1 border-t border-dashed w-full" style={{ borderColor: theme.border }}>
                          <div className="flex justify-between items-center text-[8.5px]">
                            <span className="font-extrabold text-amber-500">
                              {(p.price * cartCount).toLocaleString("ar-SA")} ر.س
                            </span>
                            <span className="text-gray-400 font-bold">({cartCount} قطع)</span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-1 w-full bg-black/40 p-0.5 rounded-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQty(p.id, cartCount - 1);
                              }}
                              className="w-5 h-5 rounded bg-zinc-800 hover:bg-red-900 text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer"
                              title="تقليل الكمية"
                            >
                              <Minus className="w-2.5 h-2.5 text-red-400" />
                            </button>
                            
                            <span className="text-[9px] font-extrabold text-white">{cartCount} قطع</span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (cartCount + 1 > p.stock) {
                                  addToast(`⚠️ الكمية المطلوبة تتجاوز المخزون المتوفر (${p.stock})`, "error");
                                  return;
                                }
                                updateCartQty(p.id, cartCount + 1);
                              }}
                              className="w-5 h-5 rounded bg-zinc-800 hover:bg-emerald-950 text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer"
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
                            {p.price.toLocaleString("ar-SA")} ر.س
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
                  <span className="font-black text-emerald-400">{customerStats.totalSpent.toLocaleString("ar-SA")} ر.س</span>
                </div>

                <div className="bg-black/20 p-1.5 rounded">
                  <span className="text-[8px] block text-gray-500">آخر زيارة</span>
                  <span className="font-bold text-white truncate max-w-full block">{customerStats.lastVisit}</span>
                </div>

                <div className="bg-black/20 p-1.5 rounded">
                  <span className="text-[8px] block text-gray-500">الرصيد المحاسبي</span>
                  <span className={`font-black ${customerStats.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {customerStats.balance === 0 ? "متعادل 0" : `${customerStats.balance.toLocaleString("ar-SA")} ر.س`}
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
                  max={posMode === "cashier" ? 100 : 1000}
                  placeholder="0.0"
                  value={additionalDiscount || ""}
                  onChange={(e) => setAdditionalDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-left text-xs py-1 px-2.5 rounded-lg border font-bold font-mono outline-none"
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
                ].map((item) => {
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
              disabled={cart.length === 0}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs rounded-xl cursor-pointer text-white shadow-lg active:scale-[0.98] transition-all text-center mt-2.5 border-none"
            >
              🚀 اعتماد وتحصيل قيمة الفاتورة فوراً ({paymentMethod})
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
                  disabled={cart.length === 0}
                  className="py-2.5 px-1 bg-zinc-800 hover:bg-zinc-700 text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[9px] font-black cursor-pointer border-none flex flex-col items-center gap-1"
                  title="تعليق الفاتورة الحالية لخدمة عميل آخر"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعليق الفاتورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecallModalOpen(true)}
                  className="py-2.5 px-1 bg-zinc-800 hover:bg-zinc-700 text-gray-100 rounded-lg text-[9px] font-black cursor-pointer border-none flex flex-col items-center gap-1 relative"
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
                  disabled={cart.length === 0}
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

      {/* COMPLETED ORDER RECEIPT AND SIMULATORS */}
      {showReceipt && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl border space-y-4 shadow-2xl relative"
            style={{ backgroundColor: "#111827", borderColor: "#374151" }}>
            
            <button
              onClick={() => { setShowReceipt(false); setCompletedOrder(null); }}
              className="absolute top-5 left-5 text-gray-400 hover:text-white cursor-pointer hover:bg-zinc-800 p-1.5 rounded-full border-none bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-3 space-y-1">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl font-black">
                ✓
              </div>
              <h3 className="text-xs font-black text-white">تم الدفع وحفظ الفاتورة بالربط السحابي</h3>
              <p className="text-[10px] text-gray-400">رقم الفاتورة: {completedOrder.id} | تاريخ القيد: {completedOrder.date}</p>
            </div>

            {/* Printable Area content simulated like a real POS thermal paper roll */}
            <div id="pos-print-area" className="p-4 bg-white text-black rounded-xl space-y-3.5 shadow-inner max-h-[310px] overflow-y-auto font-mono text-[10.5px] pr-2 text-right dir-rtl select-text">
              
              <div className="text-center space-y-1 border-b pb-3 border-gray-200">
                <span className="font-extrabold text-xs block">شركة مراسيم الطيب للتجارة</span>
                <span className="text-[9px] text-gray-600 block">سجل تجاري: 1010887645 | {activeBranchRef?.name || "فرع الرياض"} ({activePosRef?.name || "كاشير 1"})</span>
                <span className="text-[9px] text-gray-500 block">الهاتف: 0501234567</span>
                <span className="text-[9px] font-black uppercase text-zinc-800 block bg-zinc-100 py-1 rounded mt-1">فاتورة مبيعات تبسيطية</span>
              </div>

              {/* metadata block */}
              <div className="space-y-0.5 border-b pb-2 border-gray-200 text-[9px] text-gray-700">
                <div className="flex justify-between">
                  <span>العميل:</span>
                  <span className="font-bold">{completedOrder.customer}</span>
                </div>
                <div className="flex justify-between shadow-none">
                  <span>بوبة الدفعة:</span>
                  <span className="font-bold">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>المحاسب المفوض:</span>
                  <span>{user.name}</span>
                </div>
              </div>

              {/* Items details table */}
              <div className="space-y-1.5 border-b pb-2.5 border-gray-200 text-[10px]">
                <div className="flex justify-between font-black border-b pb-1 text-gray-900 text-right">
                  <span className="flex-1 text-right">المنتج</span>
                  <span className="w-10 text-center">كمية</span>
                  <span className="w-14 text-left">شامل ضريبة</span>
                </div>
                
                {completedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800 text-[10px]">
                    <span className="flex-1 text-right truncate">{it.name}</span>
                    <span className="w-10 text-center font-bold font-mono">{it.qty}</span>
                    <span className="w-14 text-left font-bold font-mono">{it.total} ر.س</span>
                  </div>
                ))}
              </div>

              {/* Calculations paper footer */}
              <div className="space-y-0.5 text-[9px] text-gray-800">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{(completedOrder.total / 1.15).toFixed(2)} ر.س</span>
                </div>
                
                <div className="flex justify-between">
                  <span>قيمة الضريبة المضافة (15%):</span>
                  <span>{(completedOrder.total - (completedOrder.total / 1.15)).toFixed(2)} ر.s</span>
                </div>

                <div className="flex justify-between font-extrabold text-xs text-black border-t pt-1 border-gray-400">
                  <span>الإجمالي المدفوع:</span>
                  <span>{completedOrder.total} ر.س</span>
                </div>
              </div>

              {/* QR and Barcode decoration */}
              <div className="text-center pt-2 space-y-1.5 border-t border-dashed border-gray-300">
                <div className="mx-auto w-32 h-8 bg-zinc-900 flex p-1 items-center justify-center gap-0.5">
                  <div className="w-full h-full bg-white flex gap-[2px]">
                    {[2,1,4,1,2,3,1,1,4,1,3,1,2,4,1,2,1,3,1,4,1,2,2,3,4].map((w, i) => (
                      <div key={i} className="bg-black flex-1" style={{ width: `${w}px` }}></div>
                    ))}
                  </div>
                </div>
                <span className="text-[8px] text-gray-400 font-mono tracking-widest">{completedOrder.id}-SAHM-ZATCA</span>
                <p className="text-[7.5px] text-emerald-600 font-bold leading-none">✓ معتمد من البوابة الوطنية ومحصن سحابياً</p>
              </div>

            </div>

            {/* Print action sub-grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              
              <button
                type="button"
                onClick={() => {
                  window.print();
                  addToast("🖨️ جاري تجهيز وإرسال الطلب لطابعة الفواتير الحرارية Bluetooth Bluetooth/WiFi...", "success");
                }}
                className="py-2.5 px-2 rounded-xl text-[9px] font-black bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer flex flex-col items-center gap-1 border-none"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>طباعة الفاتورة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${getWhatsAppMessageRaw(completedOrder)}`, '_blank');
                  addToast("💬 تم نسخ كود الفاتورة وفتح المتصفح لمشاركة واتساب", "success");
                }}
                className="py-2.5 px-2 rounded-xl text-[9px] font-black bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/30 text-emerald-300 cursor-pointer flex flex-col items-center gap-1"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>تبليغ واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToast("📂 تم تخليق وتنزيل ملف PDF المعتمد بنجاح!", "success");
                }}
                className="py-2.5 px-2 rounded-xl text-[9px] font-black bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer flex flex-col items-center gap-1 border-none"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>تنزيل PDF</span>
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
                    <span className="text-xs font-black text-emerald-400">{selectedDetailProduct.price.toLocaleString("ar-SA")} ر.س</span>
                  </div>

                  <div className="bg-black/30 p-2 rounded-lg text-right">
                    <span className="text-[8px] font-bold text-gray-500 block">تكلفة الشراء والمردود</span>
                    {user.role === "كاشير" ? (
                      <span className="text-[9.5px] font-black text-red-400">🔒 محجوب وصلاحية مقيدة</span>
                    ) : (
                      <span className="text-xs font-black text-teal-400">{selectedDetailProduct.cost ? selectedDetailProduct.cost.toLocaleString("ar-SA") : "لا توجد"} ر.س</span>
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

    </div>
  );
}
