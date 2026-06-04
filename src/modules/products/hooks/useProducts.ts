import React, { useState, useEffect } from "react";
import { Product, Branch, Warehouse, StockTransfer } from "../../../types";
import { productService } from "../../../core/database/productService";
import { auditService } from "../../../core/database/auditService";

const INITIAL_BRANCHES: Branch[] = [
  {
    id: "br_riyadh_main",
    name: "فرع الرياض الرئيسي",
    city: "الرياض",
    address: "طريق الملك فهد، حي المروج",
    phone: "0112445566",
    manager: "عبدالله بن فهد",
    employees: ["صالح الشمري", "محمد العتيبي", "خالد الحربي", "نورة القحطاني"],
    workingHours: "08:00 ص - 11:00 م",
    sales: 145000,
    profits: 48000,
    expenses: 12000,
    customersCount: 380,
    isActive: true
  },
  {
    id: "br_jeddah_int",
    name: "فرع جدة - ردسي مول",
    city: "جدة",
    address: "طريق الملك عبدالعزيز، ردسي مول",
    phone: "0123554433",
    manager: "أنس القرني",
    employees: ["مازن السهلي", "سهام القحطاني", "بدر الغامدي"],
    workingHours: "10:00 ص - 12:00 م",
    sales: 98000,
    profits: 31000,
    expenses: 15000,
    customersCount: 220,
    isActive: true
  },
  {
    id: "br_dammam",
    name: "فرع مجمع مارينا مول",
    city: "الدمام",
    address: "طريق الخليج العريق، حي الكورنيش",
    phone: "0134442211",
    manager: "رائد المطيري",
    employees: ["سمير الدوسري", "سلطان العتيبي"],
    workingHours: "09:00 ص - 11:00 م",
    sales: 42000,
    profits: 11000,
    expenses: 7000,
    customersCount: 95,
    isActive: true
  }
];

const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: "wh_central_riyadh",
    name: "مستودع سهم المركزي - الرياض",
    type: "main",
    location: "صناعية السلي الجديدة، الرياض",
    manager: "صالح الفهيد",
    capacity: 10000,
    items: [
      { productId: "1", stock: 150 },
      { productId: "2", stock: 200 },
      { productId: "3", stock: 12 },
      { productId: "4", stock: 45 }
    ]
  },
  {
    id: "wh_jeddah_sub",
    name: "مستودع الساحل الغربي - جدة",
    type: "sub",
    location: "حي الخمرة، جدة",
    manager: "سعيد باوزير",
    capacity: 5000,
    items: [
      { productId: "1", stock: 80 },
      { productId: "2", stock: 95 },
      { productId: "3", stock: 40 },
      { productId: "4", stock: 18 }
    ]
  },
  {
    id: "wh_dammam_sub",
    name: "مستودع فرع المنطقة الشرقية",
    type: "branch",
    location: "حي الأثير، الدمام",
    manager: "رائد المطيري",
    capacity: 2500,
    items: [
      { productId: "1", stock: 45 },
      { productId: "2", stock: 50 },
      { productId: "3", stock: 10 },
      { productId: "4", stock: 15 }
    ]
  }
];

export function useProducts(
  products: Product[],
  setProducts: (prods: Product[]) => void,
  user?: any,
  triggerNotification?: (text: string, type: any) => void,
  addAuditLog?: (event: string, text: string) => void,
  activeWarehouseId?: string
) {
  // Local/Synced states from/to localStorage through service layers
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem("sahm_web_branches");
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem("sahm_web_warehouses");
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [transfers, setTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem("sahm_web_transfers");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("sahm_web_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("sahm_web_warehouses", JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem("sahm_web_transfers", JSON.stringify(transfers));
  }, [transfers]);

  // Modals & UI States
  const [showNew, setShowNew] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // KPI Interactive filter state
  const [activeKpiFilter, setActiveKpiFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock' | 'best_seller' | 'stagnant'>('all');

  // Selected Product for detailed panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    category: "عطور ودخون"
  });

  // Transfer Form state
  const [transferForm, setTransferForm] = useState({
    productId: "",
    qty: 10,
    fromWh: activeWarehouseId || "wh_central_riyadh",
    toWh: "wh_jeddah_sub",
    notes: ""
  });

  // Synchronize Transfer default warehouse from active environment
  useEffect(() => {
    if (activeWarehouseId) {
      setTransferForm(prev => ({
        ...prev,
        fromWh: activeWarehouseId
      }));
    }
  }, [activeWarehouseId]);

  // Audit state
  const [auditScores, setAuditScores] = useState<Record<string, number>>({});
  const [auditDone, setAuditDone] = useState(false);

  // Auto-select first product by default
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  // Handle Create Product
  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("الرجاء إدخال اسم المنتج.");
      return;
    }

    const priceNum = parseFloat(form.price) || 0;
    const costNum = parseFloat(form.cost) || 0;
    const stockNum = parseInt(form.stock) || 0;
    const skuCode = form.sku.trim() || `P${String(products.length + 1).padStart(3, '0')}`;

    const newProduct: Product = {
      id: (Date.now().toString() + "_" + Math.floor(Math.random() * 100000)),
      name: form.name.trim(),
      sku: skuCode,
      price: priceNum,
      cost: costNum,
      stock: stockNum,
      category: form.category
    };

    const newProductsList = [...products, newProduct];
    setProducts(newProductsList);
    productService.create(newProduct);
    setShowNew(false);
    
    if (triggerNotification) {
      triggerNotification(`تم تسجيل وإدراج صنف البضاعة ${newProduct.name} بنجاح ✅`, "success");
    }
    if (addAuditLog) {
      addAuditLog("إنشاء يدوي", `تم تسجيل صنف جديد يدوياً بمسمى "${newProduct.name}" ومخزون مبدئي ${newProduct.stock}`);
    }

    // Reset form
    setForm({
      name: "",
      sku: "",
      price: "",
      cost: "",
      stock: "",
      category: "عطور ودخون"
    });
  };

  // Handle Delete Product
  const deleteProduct = (prodId: string) => {
    if (confirm("هل تريد بالتأكيد نقل هذا الصنف إلى سلة المحذوفات المؤقتة؟")) {
      const prodToDelete = products.find(p => p.id === prodId);
      if (prodToDelete) {
        try {
          const trashSaved = localStorage.getItem("sahm_web_trash_bin");
          const trashList = trashSaved ? JSON.parse(trashSaved) : [];
          
          const newTrashItem = {
            id: "tr_prod_" + Date.now().toString().slice(-4),
            type: "product",
            typeName: "منتج مستودع",
            name: prodToDelete.name,
            deletedBy: user?.username || "مدير النظام",
            deletedAt: new Date().toLocaleTimeString("ar-SA") + " - " + new Date().toLocaleDateString("ar-SA"),
            originalData: prodToDelete
          };
          
          localStorage.setItem("sahm_web_trash_bin", JSON.stringify([newTrashItem, ...trashList]));
          auditService.createAuditLog(
            "نقل للمهملات",
            `تم حقل صنف "${prodToDelete.name}" مؤقتاً لسلة المحذوفات.`,
            user?.username || "مدير النظام"
          );
        } catch (e) {
          console.error(e);
        }
      }
      
      const filtered = products.filter(p => p.id !== prodId);
      setProducts(filtered);
      productService.delete(prodId);
      if (triggerNotification) {
        triggerNotification("تم نقل الصنف إلى سلة المحذوفات 🗑️", "success");
      }
    }
  };

  // Stock Transfer flow
  const handleStockTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, qty, fromWh, toWh, notes } = transferForm;
    if (!productId || qty <= 0) {
      alert("الرجاء اختيار منتج وتحديد كمية النقل.");
      return;
    }

    const productObj = products.find(p => p.id === productId);
    if (!productObj) return;

    if (productObj.stock < qty) {
      alert(`الكمية المطلوبة للتحويل (${qty}) تتجاوز المتوفر بالمستودع (${productObj.stock})`);
      return;
    }

    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: p.stock - qty };
      }
      return p;
    });

    setProducts(updatedProducts);
    
    const fromWarehouse = warehouses.find(w => w.id === fromWh);
    const toWarehouse = warehouses.find(w => w.id === toWh);

    const newTransfer: StockTransfer = {
      id: "tr_" + Date.now().toString().slice(-4),
      transferNo: "STK-TRN-" + Math.floor(1000 + Math.random() * 9000),
      fromType: "warehouse",
      fromId: fromWh,
      fromName: fromWarehouse?.name || "المستودع الرئيسي",
      toType: "warehouse",
      toId: toWh,
      toName: toWarehouse?.name || "مستودع فرعي",
      productId: productId,
      productName: productObj.name,
      qty: qty,
      status: "approved",
      date: new Date().toISOString().split('T')[0],
      notes: notes || "تم التحويل لإعادة توازن قنوات البيع",
      historyLogs: [
        `${new Date().toLocaleString("ar-SA")}: تم ترحيل الشحنة بنجاح من ${fromWarehouse?.name} إلى ${toWarehouse?.name}`
      ]
    };

    setTransfers(prev => [newTransfer, ...prev]);

    const updatedWh = warehouses.map(w => {
      let items = [...w.items];
      if (w.id === fromWh) {
        items = items.map(item => item.productId === productId ? { ...item, stock: Math.max(0, item.stock - qty) } : item);
      }
      if (w.id === toWh) {
        const found = items.find(item => item.productId === productId);
        if (found) {
          items = items.map(item => item.productId === productId ? { ...item, stock: item.stock + qty } : item);
        } else {
          items.push({ productId, stock: qty });
        }
      }
      return { ...w, items };
    });

    setWarehouses(updatedWh);

    if (triggerNotification) {
      triggerNotification(`تم تحويل ${qty} قطعة من المنتج "${productObj.name}" بنجاح 🚚`, "success");
    }

    if (addAuditLog) {
      addAuditLog("تحويل مخزني", `تم تحويل ${qty} وحدة من "${productObj.name}" من ${fromWarehouse?.name} لـ ${toWarehouse?.name}`);
    }
  };

  // Markup Multiplier Simulator
  const applyAIMarkupMultiplier = (percentage: number) => {
    if (confirm(`هل تريد تطبيق رفع تلقائي ذكي لأسعار البيع لكافة السلع بنسبة +${percentage}% لمواكبة تضخم خط التوريد؟`)) {
      const updated = products.map(p => {
        const adjustment = p.price * (percentage / 100);
        return { ...p, price: Math.round((p.price + adjustment) * 10) / 10 };
      });
      setProducts(updated);
      
      updated.forEach(p => productService.update(p.id, p));

      if (triggerNotification) {
        triggerNotification(`تم تطبيق زيادة ذكية بنسبة +${percentage}% على أسعار جميع المنتجات والمخازن 🪄⚡`, "success");
      }
      if (addAuditLog) {
        addAuditLog("تعديل سعر ذكي", `تمت زيادة سعر البيع بنسبة ${percentage}% لكافة المعروض بالمستردات والتكاملات.`);
      }
    }
  };

  return {
    branches,
    setBranches,
    warehouses,
    setWarehouses,
    transfers,
    setTransfers,
    showNew,
    setShowNew,
    showAIBuilder,
    setShowAIBuilder,
    editingProductId,
    setEditingProductId,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    activeKpiFilter,
    setActiveKpiFilter,
    selectedProduct,
    setSelectedProduct,
    form,
    setForm,
    transferForm,
    setTransferForm,
    auditScores,
    setAuditScores,
    auditDone,
    setAuditDone,
    saveProduct,
    deleteProduct,
    handleStockTransfer,
    applyAIMarkupMultiplier
  };
}
