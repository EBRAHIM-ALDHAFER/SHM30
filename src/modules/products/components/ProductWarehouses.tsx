import React, { useState } from "react";
import { Product, ThemeColors, Warehouse, StockTransfer, Branch } from "../../../types";
import { 
  Warehouse as WarehouseIcon, 
  ArrowLeftRight, 
  ClipboardList, 
  MoreVertical, 
  Edit, 
  Link2, 
  Plus, 
  Archive, 
  X, 
  Check, 
  PlusCircle, 
  Settings, 
  AlertCircle,
  HelpCircle,
  Store,
  ChevronDown
} from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductWarehousesProps {
  products: Product[];
  theme: ThemeColors;
  warehouses: Warehouse[];
  setWarehouses: (val: Warehouse[]) => void;
  branches: Branch[];
  setBranches: (val: Branch[]) => void;
  transfers: StockTransfer[];
  setTransfers: (val: any) => void;
  transferForm: any;
  setTransferForm: (val: any) => void;
  handleStockTransfer: (e: React.FormEvent) => void;
  auditScores: Record<string, number>;
  setAuditScores: (val: any) => void;
  auditDone: boolean;
  setAuditDone: (val: boolean) => void;
  triggerNotification?: (text: string, type: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  activeWarehouseId?: string;
  onAddWarehouse?: () => void;
}

export function ProductWarehouses({
  products,
  theme,
  warehouses,
  setWarehouses,
  branches,
  setBranches,
  transfers,
  setTransfers,
  transferForm,
  setTransferForm,
  handleStockTransfer,
  auditScores,
  setAuditScores,
  auditDone,
  setAuditDone,
  triggerNotification,
  addAuditLog,
  activeWarehouseId,
  onAddWarehouse
}: ProductWarehousesProps) {
  
  const [selectedWhId, setSelectedWhId] = React.useState<string>(activeWarehouseId || warehouses[0]?.id || "warehouse_1");
  const [activeMenuWhId, setActiveMenuWhId] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeWarehouseId) {
      setSelectedWhId(activeWarehouseId);
    }
  }, [activeWarehouseId]);

  // Modal active states
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [linkingWh, setLinkingWh] = useState<Warehouse | null>(null);
  const [addingProdWh, setAddingProdWh] = useState<Warehouse | null>(null);
  const [transferringWh, setTransferringWh] = useState<Warehouse | null>(null);

  // Dynamic movement timeline logs state. Updates instantly.
  const [timeline, setTimeline] = useState<Array<{
    date: string;
    title: string;
    desc: string;
  }>>([
    { date: "اليوم - شحن وارد للمخازن الأساسية", title: "ترقية عهدة الكاشير", desc: "تم استلام +120 قطعة بخور كلمنتان من دار الطيب، ترفيغ عهدة الكاشير." },
    { date: "أمس - قيد وإرجاع بالصراف والباركود", title: "تعديل تاريخ انتهاء العهود", desc: "تم جرد التمور السكرية وتعديل الدورة الصالحة بنجاح." }
  ]);

  // Form inputs states
  const [editForm, setEditForm] = useState({
    name: "",
    city: "الرياض",
    address: "",
    manager: "",
    capacity: 5000,
    type: "sub" as "main" | "sub" | "branch",
    isActive: true
  });

  const [linkForm, setLinkForm] = useState({
    branchId: ""
  });

  const [addProdForm, setAddProdForm] = useState({
    productId: "",
    qty: 50,
    minLimit: 10,
    locationCode: "القسم الرئيسي"
  });

  const [transferFormCustom, setTransferFormCustom] = useState({
    toType: "warehouse" as "warehouse" | "branch",
    toId: "",
    productId: "",
    qty: 20,
    notes: ""
  });

  // Toggle drop down item trigger helper
  const handleDropdownToggle = (whId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuWhId(activeMenuWhId === whId ? null : whId);
  };

  // Archive / Disable quick action
  const handleToggleActiveWarehouse = (wh: Warehouse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuWhId(null);
    const updatedStatus = !(wh as any).isActive !== false; // toggling isActive (custom prop or default helper)
    const isNowActive = (wh as any).isActive === false;

    const updated = warehouses.map(w => {
      if (w.id === wh.id) {
        return { ...w, isActive: isNowActive };
      }
      return w;
    });
    setWarehouses(updated);

    if (triggerNotification) {
      triggerNotification(
        isNowActive 
          ? `تم إعادة تنشيط مستودع "${wh.name}" بنجاح 🟢` 
          : `تم تعطيل وأرشفة مستودع "${wh.name}" مؤقتاً 🗄️`, 
        "info"
      );
    }

    if (addAuditLog) {
      addAuditLog(
        isNowActive ? "تنشيط مستودع" : "أرشفة مستودع", 
        `تم تعديل حالة مستودع ${wh.name} إلى: ${isNowActive ? "نشط" : "مؤرشف"}`
      );
    }

    setTimeline(prev => [
      {
        date: "الآن - تغيير الحالة والتوثيق",
        title: isNowActive ? `تنشيط مستودع ${wh.name}` : `أرشفة مستودع ${wh.name}`,
        desc: `تم تعديل وتعميم حالة تشغيل المستودع في الدليل المحاسبي ومنافذ سهم.`
      },
      ...prev
    ]);
  };

  // Submissions

  const openEditModal = (wh: Warehouse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuWhId(null);
    setEditingWh(wh);
    
    // Parse City and Address
    const rawLoc = wh.location || "";
    let city = "الرياض";
    let address = rawLoc;
    if (rawLoc.includes("،")) {
      const parts = rawLoc.split("،");
      city = parts[0].trim();
      address = parts.slice(1).join("،").trim();
    } else if (rawLoc.includes(",")) {
      const parts = rawLoc.split(",");
      city = parts[0].trim();
      address = parts.slice(1).join(",").trim();
    }

    setEditForm({
      name: wh.name,
      city: city || "الرياض",
      address: address || wh.location || "",
      manager: wh.manager,
      capacity: wh.capacity || 5000,
      type: wh.type || "sub",
      isActive: (wh as any).isActive !== false
    });
  };

  const handleEditWhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWh) return;

    const updatedWarehouses = warehouses.map(w => {
      if (w.id === editingWh.id) {
        return {
          ...w,
          name: editForm.name.trim(),
          type: editForm.type,
          location: `${editForm.city}، ${editForm.address.trim()}`,
          manager: editForm.manager.trim(),
          capacity: editForm.capacity,
          isActive: editForm.isActive
        } as any;
      }
      return w;
    });

    setWarehouses(updatedWarehouses);
    if (triggerNotification) triggerNotification(`تم تحديث بيانات مستودع "${editForm.name}" بنجاح ✨`, "success");
    if (addAuditLog) addAuditLog("تعديل مستودع", `تم تعديل بيانات مستودع ${editForm.name} بسعة ${editForm.capacity}`);

    // Push style to timeline
    setTimeline(prev => [
      {
        date: "الآن - تعديل دليل السعة",
        title: `تحديث بيانات ${editForm.name}`,
        desc: `تغيير المسؤول: ${editForm.manager}، السعة الجديدة: ${editForm.capacity} قطعة، بنطاق الفلترة.`
      },
      ...prev
    ]);

    setEditingWh(null);
  };

  const openLinkModal = (wh: Warehouse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuWhId(null);
    setLinkingWh(wh);
    setLinkForm({
      branchId: branches[0]?.id || ""
    });
  };

  const handleLinkWhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingWh || !linkForm.branchId) return;

    const targetBranch = branches.find(b => b.id === linkForm.branchId);
    if (!targetBranch) return;

    // Update branches state
    const updatedBranches = branches.map(b => {
      if (b.id === linkForm.branchId) {
        return { ...b, associatedWh: linkingWh.id };
      }
      return b;
    });
    setBranches(updatedBranches);

    if (triggerNotification) {
      triggerNotification(`تم ربط صالة المعرض "${targetBranch.name}" بالمستودع اللوجستي "${linkingWh.name}" بنجاح 🔗`, "success");
    }
    if (addAuditLog) {
      addAuditLog("ربط مستودع بفرع", `تم ربط المستودع اللوجستي ${linkingWh.name} كـ خيار إمداد مع الفرع ${targetBranch.name}`);
    }

    setTimeline(prev => [
      {
        date: "الآن - توثيق سلاسل الإمداد",
        title: "ربط المسار اللوجستي",
        desc: `تم إسناد ورسم إمداد فرع "${targetBranch.name}" من مستودع "${linkingWh.name}" بمعدل مزامنة فوري.`
      },
      ...prev
    ]);

    setLinkingWh(null);
  };

  const openAddProdModal = (wh: Warehouse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuWhId(null);
    setAddingProdWh(wh);
    setAddProdForm({
      productId: products[0]?.id || "",
      qty: 50,
      minLimit: 10,
      locationCode: "الرف A-12"
    });
  };

  const handleAddProdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingProdWh || !addProdForm.productId) return;

    const targetProduct = products.find(p => p.id === addProdForm.productId);
    if (!targetProduct) return;

    const qtyToAdd = parseInt(addProdForm.qty as any) || 0;
    const minLimit = parseInt(addProdForm.minLimit as any) || 10;
    const locationCode = addProdForm.locationCode.trim() || "القسم الرئيسي";

    // Update warehouses items
    const updatedWhs = warehouses.map(w => {
      if (w.id === addingProdWh.id) {
        const existingIdx = w.items.findIndex(item => item.productId === addProdForm.productId);
        let items = [...w.items];

        if (existingIdx > -1) {
          items[existingIdx] = {
            ...items[existingIdx],
            stock: items[existingIdx].stock + qtyToAdd,
            // Assign custom tags
            minLimit,
            locationCode
          } as any;
        } else {
          items.push({
            productId: addProdForm.productId,
            stock: qtyToAdd,
            minLimit,
            locationCode
          } as any);
        }
        return { ...w, items };
      }
      return w;
    });

    setWarehouses(updatedWhs);

    if (triggerNotification) {
      triggerNotification(`تم تسجيل وتوريد +${qtyToAdd} وحدة من صنف "${targetProduct.name}" لـ ${addingProdWh.name}`, "success");
    }
    if (addAuditLog) {
      addAuditLog("شحن منتج للمستودع", `شحن وتوريد ${qtyToAdd} وحدة للمنتج ${targetProduct.name} داخل مستودع ${addingProdWh.name}`);
    }

    setTimeline(prev => [
      {
        date: "الآن - تغذية لوجستية",
        title: `توريد منتجات إلى ${addingProdWh.name}`,
        desc: `تم توريد صنف [${targetProduct.name}] بكمية (${qtyToAdd} وحدة)، وتنسيقه في (${locationCode}) بحد أدنى ${minLimit}.`
      },
      ...prev
    ]);

    setAddingProdWh(null);
  };

  const openTransferModal = (wh: Warehouse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuWhId(null);
    setTransferringWh(wh);

    // Filter products actually in this warehouse
    const whItems = wh.items || [];
    const firstAvailableProdId = whItems.length > 0 ? whItems[0].productId : (products[0]?.id || "");

    const restWhs = warehouses.filter(w => w.id !== wh.id);
    const defaultToId = restWhs.length > 0 ? restWhs[0].id : (branches[0]?.id || "");

    setTransferFormCustom({
      toType: restWhs.length > 0 ? "warehouse" : "branch",
      toId: defaultToId,
      productId: firstAvailableProdId,
      qty: 10,
      notes: "إعادة توزيع الفائض لتغطية نقاط الكاشير"
    });
  };

  const handleTransferCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringWh || !transferFormCustom.productId) return;

    const sourceWhItem = transferringWh.items.find(item => item.productId === transferFormCustom.productId);
    if (!sourceWhItem || sourceWhItem.stock < transferFormCustom.qty) {
      alert(`عذراً! الكمية المطلوبة للتحويل (${transferFormCustom.qty}) غير متوفرة في المستودع الحالي. المتوفر: ${sourceWhItem?.stock || 0}`);
      return;
    }

    const qty = parseInt(transferFormCustom.qty as any) || 0;
    const targetId = transferFormCustom.toId;
    const isTargetBranch = transferFormCustom.toType === "branch";
    
    const productObj = products.find(p => p.id === transferFormCustom.productId);
    if (!productObj) return;

    // Deduct from source warehouse, adding to target warehouse if target is warehouse
    const updatedWarehouses = warehouses.map(w => {
      let items = [...w.items];
      // 1. Deduct from source
      if (w.id === transferringWh.id) {
        items = items.map(item => {
          if (item.productId === transferFormCustom.productId) {
            return { ...item, stock: Math.max(0, item.stock - qty) };
          }
          return item;
        });
      }
      // 2. Add to target (if it's a warehouse)
      if (!isTargetBranch && w.id === targetId) {
        const found = items.find(item => item.productId === transferFormCustom.productId);
        if (found) {
          items = items.map(item => item.productId === transferFormCustom.productId ? { ...item, stock: item.stock + qty } : item);
        } else {
          items.push({ productId: transferFormCustom.productId, stock: qty });
        }
      }
      return { ...w, items };
    });

    setWarehouses(updatedWarehouses);

    // Determine targets name
    let destName = "غير محدد";
    if (isTargetBranch) {
      destName = branches.find(b => b.id === targetId)?.name || "فرع المبيعات المعرض";
    } else {
      destName = warehouses.find(w => w.id === targetId)?.name || "مستودع لوجستي";
    }

    // Add to stock transfers history logs
    const newTr: StockTransfer = {
      id: "tr_" + Date.now().toString().slice(-4),
      transferNo: "STK-TRN-" + Math.floor(1000 + Math.random() * 9000),
      fromType: "warehouse",
      fromId: transferringWh.id,
      fromName: transferringWh.name,
      toType: isTargetBranch ? "branch" : "warehouse",
      toId: targetId,
      toName: destName,
      productId: transferFormCustom.productId,
      productName: productObj.name,
      qty: qty,
      status: "approved",
      date: new Date().toISOString().split('T')[0],
      notes: transferFormCustom.notes || "تحويل لدعم حركة البيع",
      historyLogs: [
        `${new Date().toLocaleString("ar-SA")}: تم إكمال وعزيمة النقل من ${transferringWh.name} إلى ${destName}`
      ]
    };
    setTransfers((prev: any) => [newTr, ...prev]);

    if (triggerNotification) {
      triggerNotification(`تم تحويل ${qty} وحدة من "${productObj.name}" إلى "${destName}" بنجاح! 🚚`, "success");
    }
    if (addAuditLog) {
      addAuditLog("تحويل لوجستي", `تم ترحيل عينات بوزن ${qty} وحدة من "${productObj.name}" لجهة "${destName}" لسبب: ${transferFormCustom.notes}`);
    }

    setTimeline(prev => [
      {
        date: "الآن - ترحيل مخزني فوري",
        title: "تحويل مخزون رسمي",
        desc: `تم تحويل ${qty} قطعة من [${productObj.name}] من مستودع [${transferringWh.name}] إلى جهة التغذية [${destName}].`
      },
      ...prev
    ]);

    setTransferringWh(null);
  };

  const selectedWh = warehouses.find(w => w.id === selectedWhId) || warehouses[0];

  return (
    <div className="space-y-6 text-right font-sans relative">
      
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 relative z-20">
        <div className="border-r-4 border-amber-500 pr-4">
          <h3 className="text-base font-black text-white font-sans">إدارة وحركة المستودعات وجرد السلع</h3>
          <p className="text-xs text-gray-400">إدارة الجرد المحاسبي المعملي، الربط اللوجيستي للفروع الذكية، ونقل السلع المبرمج</p>
        </div>

        {/* Unified Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          
          {/* Active Warehouse Dropdown Selector */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-gray-400 font-bold pr-1">المستودع النشط:</span>
            <select
              value={selectedWhId}
              onChange={(e) => setSelectedWhId(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-amber-400 outline-none cursor-pointer pr-4 pl-1 font-sans"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id} className="bg-slate-950 text-white font-sans">
                  {w.name} {w.type === 'main' ? '★' : ''} {(w as any).isActive === false ? '(مؤرشف)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {onAddWarehouse && (
              <button
                type="button"
                onClick={onAddWarehouse}
                className="py-2 px-3 rounded-xl text-[11px] font-black bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer border-none font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة مستودع</span>
              </button>
            )}
            
            {selectedWh && (
              <>
                <button
                  type="button"
                  onClick={() => openAddProdModal(selectedWh)}
                  className="py-2 px-3 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-black flex items-center gap-1 transition-all active:scale-95 border-none font-sans"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ إضافة منتج</span>
                </button>

                <button
                  type="button"
                  onClick={() => openTransferModal(selectedWh)}
                  className="py-2 px-3 rounded-xl text-[11px] font-black bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 transition-all active:scale-95 border-none font-sans"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>🔄 نقل مخزون</span>
                </button>

                <button
                  type="button"
                  onClick={() => openLinkModal(selectedWh)}
                  className="py-2 px-3 rounded-xl text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-gray-200 flex items-center gap-1 transition-all active:scale-95 border border-slate-750 font-sans"
                >
                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>🔗 ربط بفرع</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(selectedWh)}
                  className="py-2 px-3 rounded-xl text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-gray-200 flex items-center gap-1 transition-all active:scale-95 border border-slate-750 font-sans"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-400" />
                  <span>📝 تعديل البيانات</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleActiveWarehouse(selectedWh, e)}
                  className={`py-2 px-3 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 border font-sans ${
                    (selectedWh as any).isActive === false
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40"
                      : "bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-900/40"
                  }`}
                >
                  <span>{(selectedWh as any).isActive === false ? "🟢 تنشيط" : "🗄️ أرشفة"}</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 📦 Warehouse contents section */}
      {selectedWh && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden space-y-5">
          <div className="absolute left-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Compact horizontal selected warehouse details status widget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-850/80 text-xs">
            <div>
              <span className="text-gray-500 block font-bold mb-1 font-sans">👤 المسؤول الأمين:</span>
              <span className="font-black text-white text-[13px] font-sans">{selectedWh.manager || "غير معين"}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-bold mb-1 font-sans">📍 الموقع الجغرافي:</span>
              <span className="text-gray-300 text-[13px] font-sans">{selectedWh.location || "غير محدد"}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-bold mb-1 font-sans">🟢 حالة التشغيل:</span>
              <span className={`font-black text-[13px] font-sans ${(selectedWh as any).isActive !== false ? "text-emerald-400" : "text-red-400"}`}>
                {(selectedWh as any).isActive !== false ? "نشط ومستقر" : "معطل / مؤرشف مؤقتاً"}
              </span>
            </div>
            <div>
              {(() => {
                const totalStockInWh = selectedWh.items ? selectedWh.items.reduce((sum, i) => sum + i.stock, 0) : 0;
                const capacityPercentage = Math.min(100, Math.round((totalStockInWh / (selectedWh.capacity || 5000)) * 100));
                return (
                  <>
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 font-sans">
                      <span>سعة التخزين:</span>
                      <span>{totalStockInWh} / {selectedWh.capacity || 5000} وحدة ({capacityPercentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${capacityPercentage}%`, backgroundColor: theme.accent }} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 text-xs text-right">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] text-gray-400 font-sans tracking-wide">
                  <th className="p-3 text-right">صورة المنتج</th>
                  <th className="p-3 text-right">اسم المنتج والتصنيف</th>
                  <th className="p-3 text-right">رمز SKU</th>
                  <th className="p-3 text-right">الرف / موقع التخزين</th>
                  <th className="p-3 text-center">الحد الأدنى</th>
                  <th className="p-3 text-center">المقدار المتوفر</th>
                  <th className="p-3 text-left pl-4">حالة المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80 text-xs">
                {selectedWh.items && selectedWh.items.map((item) => {
                  const prod = products.find(p => p.id === item.productId);
                  if (!prod) return null;
                  const isLow = item.stock > 0 && item.stock < ((item as any).minLimit || 50);
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-850/60 transition-all duration-150">
                      {/* Image */}
                      <td className="p-3">
                        {prod.image ? (
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-850"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-gray-500">
                            <WarehouseIcon className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </td>

                      {/* Name and category */}
                      <td className="p-3 font-sans">
                        <strong className="text-white block font-bold">{prod.name}</strong>
                        <span className="text-[10px] text-gray-400">{prod.category}</span>
                      </td>

                      {/* SKU */}
                      <td className="p-3 font-mono text-gray-400 text-[11px]">{prod.sku}</td>

                      {/* Store location tag inside warehouse */}
                      <td className="p-3 font-sans text-gray-300">
                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {(item as any).locationCode || "القسم الرئيسي"}
                        </span>
                      </td>

                      {/* Minimum Stock Limit */}
                      <td className="p-3 text-center font-mono text-gray-400 text-[11px]">
                        {(item as any).minLimit || 10} قطعة
                      </td>

                      {/* Stock */}
                      <td className="p-3 text-center font-mono">
                        <span className={`font-black text-sm ${isOut ? "text-red-500 animate-pulse" : isLow ? "text-amber-500" : "text-emerald-400"}`}>
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-gray-550 font-sans mr-1">وحدة</span>
                      </td>

                      {/* Low stock alerts */}
                      <td className="p-3 text-left pl-4 animate-fade-in">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                          isOut 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                            : isLow 
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {isOut ? "خالٍ تماماً ⚠️" : isLow ? "مستوى منخفض ⚠️" : "متوفر ومستقر ✓"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {(!selectedWh.items || selectedWh.items.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-500 text-xs font-sans">
                      لا توجد سلع مسجلة في هذا المستودع حالياً. اضغط على "+ إضافة منتج للمستودع" لتنزيل الكمية الأولى!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer & Auditing Forms ( Requirements 3: Stock transfers & Audits ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Product stock transfer utility form */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>بروتوكول تحويل المخزون الآمن (Stock Transfer Hub)</span>
          </h4>
          <p className="text-[10px] text-gray-400 leading-normal">
            تحويل السلع من المستودع المركزي الرئيسي لتغذية نقاط البيع في فروع جدة والشرقية:
          </p>

          <form onSubmit={handleStockTransfer} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-300 font-bold mb-1">• من مستودع المصدر:</label>
                <select value={transferForm.fromWh} onChange={(e) => setTransferForm((f: any) => ({ ...f, fromWh: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2 px-3 border border-slate-800 bg-slate-950 text-white outline-none">
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-300 font-bold mb-1">• إلى مستودع الهدف:</label>
                <select value={transferForm.toWh} onChange={(e) => setTransferForm((f: any) => ({ ...f, toWh: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2 px-3 border border-slate-800 bg-slate-950 text-white outline-none">
                  {warehouses.filter(w => w.id !== transferForm.fromWh).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-300 font-bold mb-1">• صنف البضاعة المحولة:</label>
                <select value={transferForm.productId} onChange={(e) => setTransferForm((f: any) => ({ ...f, productId: e.target.value }))}
                  className="w-full text-xs rounded-lg py-2 px-3 border border-slate-800 bg-slate-950 text-white outline-none font-bold">
                  <option value="">-- اختر البضاعة للتحويل --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (متوفر: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-300 font-bold mb-1">• كمية التحويل (وحدة):</label>
                <input type="number" min="1" value={transferForm.qty} onChange={(e) => setTransferForm((f: any) => ({ ...f, qty: parseInt(e.target.value) || 0 }))}
                  className="w-full text-xs rounded-lg py-2 px-3 border border-slate-800 bg-slate-950 text-white text-center font-mono outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-300 font-bold mb-1">• ملاحظات التحويل الرسمي:</label>
              <input type="text" placeholder="مثال: ترقية مخزون الكاشير لطلبات الصيف..." value={transferForm.notes} onChange={(e) => setTransferForm((f: any) => ({ ...f, notes: e.target.value }))}
                className="w-full text-xs rounded-lg py-2 px-3 border border-slate-800 bg-slate-950 text-white outline-none" />
            </div>

            <button type="submit" className="w-full py-2.5 font-black text-xs text-black border-none rounded-xl cursor-pointer bg-amber-500 shadow-md">
              اعتماد وتفويض مستند النقل المخزني ✓
            </button>
          </form>
        </div>

        {/* Inventory Auditing system logic ( Requirement 3: Inventory Audits ) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span>منظومة جرد المطابقة المعملية السنوية (Stock Audit Hub)</span>
          </h4>
          <p className="text-[10px] text-gray-400">
            مقارنة الكميات الحقيقية الممسوحة فعلياً في المستودع بالكميات المبرمجة بالدفاتر المحاسبية:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg text-xs space-y-3 max-h-56 overflow-y-auto">
            {products.slice(0, 3).map(p => {
              const savedScore = auditScores[p.id] !== undefined ? auditScores[p.id] : p.stock;
              return (
                <div key={p.id} className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span>{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-mono">الدفتر: {p.stock}</span>
                    <input type="number" value={savedScore} onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setAuditScores((prev: any) => ({ ...prev, [p.id]: val }));
                    }} className="w-16 bg-slate-900 border border-slate-800 text-white rounded text-center text-xs py-0.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={() => {
              setAuditDone(true);
              if (triggerNotification) triggerNotification("تمت عملية الجرد والتدقيق اللوجيستي بنجاح ✓", "success");
              if (addAuditLog) addAuditLog("جرد المستودع", "تم الانتهاء من مطابقة الجرد الفعلي مع الدفتري للمخازن الحية.");
            }} className="flex-1 py-2 rounded-lg bg-emerald-600 font-bold text-[10px] text-black cursor-pointer shadow">
              اعتماد وإقرار الجرد للعموم 📋
            </button>
            <button onClick={() => {
              setAuditScores({});
              setAuditDone(false);
            }} className="py-2 px-3 rounded-lg border border-slate-800 bg-black text-gray-400 text-[10px] cursor-pointer">
              تصفير
            </button>
          </div>

          {auditDone && (
            <div className="p-2 text-[10px] bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-center font-bold font-sans">
              ✓ إقرار التدقيق اللوجستي بنسبة تباين صفريّة تم إرسالها لوزارة التجارة ماليّاً!
            </div>
          )}
        </div>

      </div>

      {/* Transfers log and Movement timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Transfers Log */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
          <h4 className="text-xs font-black text-white">سجل طلبات التحويل وتفويضات المخازن الموثّقة 📜</h4>
          
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {transfers && transfers.length > 0 ? transfers.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-900 text-xs flex justify-between items-center font-mono">
                <div>
                  <span className="text-gray-400 block font-sans text-right">{t.productName} ({t.qty} وحدة)</span>
                  <span className="text-[10px] text-gray-550 block leading-tight text-right">{t.fromName} ← {t.toName}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 py-0.5 px-2 rounded-full">
                  {t.status === 'approved' ? 'موافق عليه' : t.status.toUpperCase()}
                </span>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-[11px] font-sans">
                لا توجد تحويلات سابقة في الـ Ledger للمستودعات.
              </div>
            )}
          </div>
        </div>

        {/* Movement timeline */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
          <h4 className="text-xs font-black text-white">حركة المخزون وتنبيه قنوات التوريد 🚚 (Inventory Timeline)</h4>
          
          <div className="space-y-3 text-[10px] text-gray-400 leading-relaxed max-h-48 overflow-y-auto pr-1">
            {timeline.map((event, index) => (
              <div key={index} className="border-r border-amber-500/30 pr-3 relative pb-1">
                <div className="absolute right-[-3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[9px] text-gray-500 block font-mono">{event.date}</span>
                <strong className="text-white text-xs block mt-0.5">{event.title}:</strong>
                <p className="text-[10px] text-gray-400 mt-0.5">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ======================= POPUP MODAL: UPDATE WAREHOUSE (تعديل المستودع) ======================= */}
      {editingWh && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-amber-500" />
                  <span>تعديل بيانات وبيئة المستودع: 📝</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">تحديث سجل الدليل المحاسبي لـ <span className="text-white font-bold">{editingWh.name}</span></p>
              </div>
              <button
                onClick={() => setEditingWh(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditWhSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اسم المستودع بالدليل:</label>
                <input
                  type="text"
                  placeholder="مثال: مستودع سهم الوسط..."
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المدينة المحلية:</label>
                  <select
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    {["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "القصيم", "تبوك", "أبها"].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• نوع تصنيف التخزين:</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="main">رئيسي / مركزي (Main)</option>
                    <option value="sub">فرعي لوجستي (Sub)</option>
                    <option value="branch">مرتبط بفرع معرض (Branch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• العنوان الجغرافي التفصيلي:</label>
                <input
                  type="text"
                  placeholder="مثال: طريق الخرج، المخرج الثاني..."
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• أمين المستودع المسؤول:</label>
                  <input
                    type="text"
                    placeholder="فواز العتيبي"
                    value={editForm.manager}
                    onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• السعة القصوى (قطعة):</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5000"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 5000 })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-center font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• حالة التنشيط والربط في سهم:</label>
                <select
                  value={editForm.isActive ? "true" : "false"}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                >
                  <option value="true" className="text-emerald-400">نشط ويستقبل التوريد والتحويل ✓</option>
                  <option value="false" className="text-red-400">مغلق مؤقتاً للعموم والصيانة ⚠️</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-amber-500 hover:bg-amber-400 transition-colors border-none"
                >
                  حفظ وتطبيق التعديل ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWh(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP MODAL: LINK TO BRANCH (ربط المستودع بفرع) ======================= */}
      {linkingWh && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  <span>ربط المستودع بفرع بيع معرض 🔗</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">المستودع الرئيسي: <span className="text-white font-bold">{linkingWh.name}</span></p>
              </div>
              <button
                onClick={() => setLinkingWh(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkWhSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اختر فرع المعرض المرتبط:</label>
                <select
                  value={linkForm.branchId}
                  onChange={(e) => setLinkForm({ branchId: e.target.value })}
                  className="w-full text-xs rounded-lg py-3 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  required
                >
                  <option value="">-- اختر الفرع للاعتماد --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-2">
                  * سيتم مزامنة عينات نقطة البيع لهذا المعرض وتحديث قنوات سلاسل الربط لتبادل السلع تلقائياً.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-white bg-blue-600 hover:bg-blue-500 transition-colors border-none"
                >
                  تأكيد توثيق الربط اللوجستي ✓
                </button>
                <button
                  type="button"
                  onClick={() => setLinkingWh(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  تراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP MODAL: ADD PRODUCT TO WAREHOUSE (إضافة منتج للمستودع) ======================= */}
      {addingProdWh && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>تخزين وإضافة بضائع للمستودع 📥</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">تغذية مستودع: <span className="text-white font-bold">{addingProdWh.name}</span></p>
              </div>
              <button
                onClick={() => setAddingProdWh(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اختر السلعة من دليل المنتجات:</label>
                <select
                  value={addProdForm.productId}
                  onChange={(e) => setAddProdForm({ ...addProdForm, productId: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-slate-950 text-white outline-none text-right font-bold"
                  required
                >
                  <option value="">-- اختر السلعة --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• الكمية الإضافية (قطعة):</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={addProdForm.qty}
                    onChange={(e) => setAddProdForm({ ...addProdForm, qty: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• حد الأمان الأدنى للتنبيه:</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={addProdForm.minLimit}
                    onChange={(e) => setAddProdForm({ ...addProdForm, minLimit: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• موقع التخزين (الرف / القسم):</label>
                <input
                  type="text"
                  placeholder="مثال: الرف A-14 / ممر 3"
                  value={addProdForm.locationCode}
                  onChange={(e) => setAddProdForm({ ...addProdForm, locationCode: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-emerald-500 hover:bg-emerald-450 transition-colors border-none"
                >
                  تنزيل الشحنة بالدفاتر ✓
                </button>
                <button
                  type="button"
                  onClick={() => setAddingProdWh(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP MODAL: TRANSFER STOCK (نقل مخزون) ======================= */}
      {transferringWh && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <span>تأمين تحويل ونقل مخزون بضائع 🔄</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">من مستودع المصدر: <span className="text-white font-bold">{transferringWh.name}</span></p>
              </div>
              <button
                onClick={() => setTransferringWh(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferCustomSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• إلى وجهة الإمداد:</label>
                  <select
                    value={transferFormCustom.toType}
                    onChange={(e) => {
                      const type = e.target.value as "warehouse" | "branch";
                      const defaultToId = type === "warehouse" 
                        ? (warehouses.filter(w => w.id !== transferringWh.id)[0]?.id || "")
                        : (branches[0]?.id || "");
                      setTransferFormCustom({ ...transferFormCustom, toType: type, toId: defaultToId });
                    }}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="warehouse">مستودع لوجستي آخر 🏢</option>
                    <option value="branch">فرع صالة عرض 🏬</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• اختر الجهة المحددة:</label>
                  <select
                    value={transferFormCustom.toId}
                    onChange={(e) => setTransferFormCustom({ ...transferFormCustom, toId: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                    required
                  >
                    {transferFormCustom.toType === "warehouse" 
                      ? warehouses.filter(w => w.id !== transferringWh.id).map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))
                      : branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                        ))
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اختر المنتج المراد ترحيله:</label>
                <select
                  value={transferFormCustom.productId}
                  onChange={(e) => setTransferFormCustom({ ...transferFormCustom, productId: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  required
                >
                  <option value="">-- الأجهزة والأصناف المتوفرة --</option>
                  {transferringWh.items && transferringWh.items.map(item => {
                    const prod = products.find(p => p.id === item.productId);
                    if (!prod) return null;
                    return (
                      <option key={item.productId} value={item.productId}>
                        {prod.name} (المتوفر بالقسم اللوجستي: {item.stock} عينة)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• كمية النقل الرسمية (وحدة):</label>
                <input
                  type="number"
                  min="1"
                  placeholder="20"
                  value={transferFormCustom.qty}
                  onChange={(e) => setTransferFormCustom({ ...transferFormCustom, qty: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-slate-950 text-white outline-none text-center font-mono focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• سبب النقل للتسجيل المحاسبي:</label>
                <input
                  type="text"
                  placeholder="مثال: تغذية مبيعات افتتاح معرض حي النخيل أو تغطية النقص"
                  value={transferFormCustom.notes}
                  onChange={(e) => setTransferFormCustom({ ...transferFormCustom, notes: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-amber-500 hover:bg-amber-400 transition-colors border-none"
                >
                  تفويض واعتماد النقل اللوجستي ✓
                </button>
                <button
                  type="button"
                  onClick={() => setTransferringWh(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
