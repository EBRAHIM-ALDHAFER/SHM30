import React, { useState, useEffect } from "react";
import { Product, ThemeColors, Branch, Warehouse, StockTransfer } from "../../../types";
import { 
  Store, 
  Layers, 
  BarChart, 
  MoreVertical, 
  Edit, 
  Link2, 
  Plus, 
  ArrowLeftRight, 
  X, 
  Check, 
  PlusCircle, 
  Settings, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  ArrowUpRight, 
  FileText, 
  Phone, 
  Briefcase, 
  Archive, 
  ShieldAlert,
  ChevronDown
} from "lucide-react";
import { formatMoney } from "../services/productUiService";

interface ProductBranchesProps {
  products: Product[];
  theme: ThemeColors;
  branches: Branch[];
  setBranches: (val: Branch[]) => void;
  warehouses: Warehouse[];
  setWarehouses: (val: Warehouse[]) => void;
  transfers: StockTransfer[];
  setTransfers: (val: any) => void;
  triggerNotification?: (text: string, type: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  activeStoreId?: string;
}

export function ProductBranches({
  products,
  theme,
  branches,
  setBranches,
  warehouses,
  setWarehouses,
  transfers,
  setTransfers,
  triggerNotification,
  addAuditLog,
  activeStoreId
}: ProductBranchesProps) {
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [activeMenuBranchId, setActiveMenuBranchId] = useState<string | null>(null);
  
  // High fidelity active store filtering & toggle settings
  const currentStoreId = activeStoreId || localStorage.getItem("sahm_active_store_id") || "store_1";
  const [showAllBranches, setShowAllBranches] = useState<boolean>(false);

  // Filter branches based on store_id or show all (do not hide branches whether linked or not)
  const displayedBranches = branches.filter(b => {
    if (showAllBranches || currentStoreId === "all_stores") return true;
    const bStoreId = b.store_id || "store_1";
    return bStoreId === currentStoreId;
  });

  // Guarantee selectedBranchId is updated based on displayed branches
  useEffect(() => {
    if (displayedBranches.length > 0) {
      const exists = displayedBranches.some(b => b.id === selectedBranchId || b.branch_id === selectedBranchId);
      if (!exists) {
        setSelectedBranchId(displayedBranches[0].id || displayedBranches[0].branch_id || "");
      }
    } else {
      setSelectedBranchId("");
    }
  }, [displayedBranches, selectedBranchId]);

  // Tabs for the selected branch details
  const [activeTab, setActiveTab] = useState<"inventory" | "supply" | "sales" | "staff">("inventory");

  // Dynamic branch & inventory movement timelines
  const [branchTimeline, setBranchTimeline] = useState<Array<{
    date: string;
    title: string;
    desc: string;
  }>>([
    { date: "اليوم - ترفيع جمركي محلي", title: "ربط المسار بمستودع سهم", desc: "تفعيل التزامن الفوري واستقبال دفعات العطور لمبيعات موسم الصيف." },
    { date: "أمس - جرد منتصف الأسبوع", title: "التحقق من الحد الأدنى للفرع", desc: "تم مراجعة الأصناف المعروضة وضبط المنخفض منها تلقائياً." }
  ]);

  // Modal active states
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [linkingWhBranch, setLinkingWhBranch] = useState<Branch | null>(null);
  const [addingProdBranch, setAddingProdBranch] = useState<Branch | null>(null);
  const [transferringBranch, setTransferringBranch] = useState<Branch | null>(null);

  // Form Inputs states
  const [editForm, setEditForm] = useState({
    name: "",
    city: "الرياض",
    address: "",
    manager: "",
    phone: "",
    associatedWh: "",
    isActive: true,
    workingHours: "08:00 ص - 11:00 م"
  });

  const [linkForm, setLinkForm] = useState({
    warehouseId: ""
  });

  const [addProdForm, setAddProdForm] = useState({
    productId: "",
    qty: 30,
    minLimit: 10,
    locationCode: "صالة العرض الرئيسية"
  });

  const [transferForm, setTransferForm] = useState({
    fromType: "warehouse" as "warehouse" | "branch",
    fromId: "", // select source ID
    productId: "",
    qty: 15,
    notes: ""
  });

  // Guarantee reactive "items" are seeded/initialized if they do not exist
  useEffect(() => {
    let changed = false;
    const updatedBranches = branches.map(b => {
      if (!b.items || b.items.length === 0) {
        const isRiyadh = b.id === "br_riyadh_main";
        const isJeddah = b.id.includes("jeddah") || b.id === "br_jeddah_redsea" || b.id === "br_jeddah_int";
        const ratio = isRiyadh ? 0.4 : isJeddah ? 0.25 : 0.15;

        const seededItems = products.slice(0, 5).map(p => ({
          productId: p.id,
          stock: Math.max(5, Math.round((p.stock || 120) * ratio)),
          minLimit: 10,
          locationCode: isRiyadh ? "جناح البخور الرئيسي" : "الجناح الأمامي الرف B"
        }));

        changed = true;
        return {
          ...b,
          items: seededItems
        };
      }
      return b;
    });

    if (changed) {
      setBranches(updatedBranches);
    }
  }, [branches, products, setBranches]);

  const selectedBranch = branches.find(b => b.id === selectedBranchId || b.branch_id === selectedBranchId) || displayedBranches[0] || branches[0];

  // Helper action: toggle menu
  const handleDropdownToggle = (brId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuBranchId(activeMenuBranchId === brId ? null : brId);
  };

  // Helper action: Enable / Disable Branch
  const handleToggleActiveBranch = (br: Branch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuBranchId(null);
    if (activeStoreId === "all_stores") {
      if (triggerNotification) {
        triggerNotification("⚠️ لا يمكن تعديل حالة تشغيل الفروع أو أرشفتها في وضع العرض الموحد لجميع المتاجر. يرجى تفعيل متجر محدد أولاً.", "error");
      }
      return;
    }
    const updatedStatus = !br.isActive;

    const updated = branches.map(b => {
      if (b.id === br.id) {
        return { ...b, isActive: updatedStatus };
      }
      return b;
    });
    setBranches(updated);

    if (triggerNotification) {
      triggerNotification(
        updatedStatus 
          ? `تم إعادة تنشيط وتشغيل فرع "${br.name}" بنجاح 🟢` 
          : `تم تعطيل وأرشفة فرع "${br.name}" مؤقتاً بالكامل 🗄️`, 
        "info"
      );
    }

    if (addAuditLog) {
      addAuditLog(
        updatedStatus ? "تنشيط فرع" : "أرشفة فرع", 
        `تعديل حالة فرع ${br.name} بالدليل التشغيلي إلى: ${updatedStatus ? "نشط" : "معطل ومؤرشف"}`
      );
    }

    setBranchTimeline(prev => [
      {
        date: "الآن - تغيير حالة التشغيل",
        title: updatedStatus ? `تنشيط فرع ${br.name}` : `أرشفة فرع ${br.name}`,
        desc: `تم توثيق وضع التشغيل للفرع وإصدار إشعار الفوترة الضريبية السحابي.`
      },
      ...prev
    ]);
  };

  // 3. Edit branch submit handler
  const openEditModal = (br: Branch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuBranchId(null);
    setEditingBranch(br);
    setEditForm({
      name: br.name,
      city: br.city,
      address: br.address,
      manager: br.manager,
      phone: br.phone || "0501112223",
      associatedWh: br.associatedWh || "",
      isActive: br.isActive,
      workingHours: br.workingHours || "08:00 ص - 11:00 م"
    });
  };

  const handleEditBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    const updatedBranches = branches.map(b => {
      if (b.id === editingBranch.id) {
        return {
          ...b,
          name: editForm.name.trim(),
          city: editForm.city,
          address: editForm.address.trim(),
          manager: editForm.manager.trim(),
          phone: editForm.phone.trim(),
          associatedWh: editForm.associatedWh || undefined,
          isActive: editForm.isActive,
          workingHours: editForm.workingHours
        };
      }
      return b;
    });

    setBranches(updatedBranches);
    if (triggerNotification) triggerNotification(`تم تحديث بيانات المعرض "${editForm.name}" بنجاح ✨`, "success");
    if (addAuditLog) addAuditLog("تعديل معرض فرعي", `تم تعديل بيانات منفذ بيع ${editForm.name} والمسئول ${editForm.manager}`);

    setBranchTimeline(prev => [
      {
        date: "الآن - تعديل البيانات التشغيلية",
        title: `تحديث بيانات ${editForm.name}`,
        desc: `تعديل المسؤول: ${editForm.manager}، الهاتف: ${editForm.phone}، ساعات العمل: ${editForm.workingHours}`
      },
      ...prev
    ]);

    setEditingBranch(null);
  };

  // 4. Link warehouse submit handler
  const openLinkModal = (br: Branch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuBranchId(null);
    setLinkingWhBranch(br);
    setLinkForm({
      warehouseId: br.associatedWh || warehouses[0]?.id || ""
    });
  };

  const handleLinkBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingWhBranch || !linkForm.warehouseId) return;

    const selectedWh = warehouses.find(w => w.id === linkForm.warehouseId);
    if (!selectedWh) return;

    const updatedBranches = branches.map(b => {
      if (b.id === linkingWhBranch.id) {
        return { ...b, associatedWh: linkForm.warehouseId };
      }
      return b;
    });
    setBranches(updatedBranches);

    if (triggerNotification) {
      triggerNotification(`تم ربط المعرض "${linkingWhBranch.name}" بمستودع الإسناد "${selectedWh.name}" 🔗`, "success");
    }
    if (addAuditLog) {
      addAuditLog("ربط الفرع بمستودع", `ربط الفرع ${linkingWhBranch.name} لوجستياً بمستودع ${selectedWh.name}`);
    }

    setBranchTimeline(prev => [
      {
        date: "الآن - تعيين خريطة الإمداد",
        title: `ربط ${linkingWhBranch.name} بمستودع لوجستي`,
        desc: `تخصيص مستودع [${selectedWh.name}] كمزود رئيسي لإمدادات البضائع والشحنات المباشرة.`
      },
      ...prev
    ]);

    setLinkingWhBranch(null);
  };

  // 5. Add products to branch submit handler
  const openAddProdModal = (br: Branch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuBranchId(null);
    setAddingProdBranch(br);
    setAddProdForm({
      productId: products[0]?.id || "",
      qty: 40,
      minLimit: 12,
      locationCode: "الرف الرئيسي A2"
    });
  };

  const handleAddProdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingProdBranch || !addProdForm.productId) return;

    const productObj = products.find(p => p.id === addProdForm.productId);
    if (!productObj) return;

    const qtyToAdd = parseInt(addProdForm.qty as any) || 0;
    const minLimit = parseInt(addProdForm.minLimit as any) || 10;
    const locationCode = addProdForm.locationCode.trim() || "صالة العرض";

    const updatedBranches = branches.map(b => {
      if (b.id === addingProdBranch.id) {
        const items = b.items ? [...b.items] : [];
        const existingIdx = items.findIndex(item => item.productId === addProdForm.productId);

        if (existingIdx > -1) {
          items[existingIdx] = {
            ...items[existingIdx],
            stock: items[existingIdx].stock + qtyToAdd,
            minLimit,
            locationCode
          };
        } else {
          items.push({
            productId: addProdForm.productId,
            stock: qtyToAdd,
            minLimit,
            locationCode
          });
        }
        return { ...b, items };
      }
      return b;
    });

    setBranches(updatedBranches);
    if (triggerNotification) {
      triggerNotification(`تم تسجيل وتوريد +${qtyToAdd} وحدة من "${productObj.name}" إلى فرع "${addingProdBranch.name}"`, "success");
    }
    if (addAuditLog) {
      addAuditLog("إيداع بضائع بالفرع", `إضافة ${qtyToAdd} وحدة من صنف "${productObj.name}" لفرع ${addingProdBranch.name}`);
    }

    setBranchTimeline(prev => [
      {
        date: "الآن - زيادة مخزون المعرض",
        title: `توريد بضاعة إلى ${addingProdBranch.name}`,
        desc: `إيداع ${qtyToAdd} قطعة من [${productObj.name}] وتنسيق تشغيلها بالرف: ${locationCode}.`
      },
      ...prev
    ]);

    setAddingProdBranch(null);
  };

  // 6. Stock transfer submit handler (from warehouse or branch to branch/warehouse)
  const openTransferModal = (br: Branch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuBranchId(null);
    setTransferringBranch(br);

    const defaultSourceId = br.associatedWh || warehouses[0]?.id || "";
    setTransferForm({
      fromType: "warehouse",
      fromId: defaultSourceId,
      productId: products[0]?.id || "",
      qty: 20,
      notes: "إعادة توازن مخزون لدعم ارتفاع حجم المبيعات"
    });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStoreId === "all_stores") {
      if (triggerNotification) {
        triggerNotification("⚠️ لا يمكن إتمام تحويلات المخزون أو نقل المنتجات بين المستودعات والفروع في وضع العرض الموحد. يرجى تفعيل متجر محدد أولاً.", "error");
      }
      return;
    }
    if (!transferringBranch || !transferForm.fromId || !transferForm.productId) return;

    const qty = parseInt(transferForm.qty as any) || 0;
    const isSourceWarehouse = transferForm.fromType === "warehouse";
    const productObj = products.find(p => p.id === transferForm.productId);
    if (!productObj) return;

    // Check inventory availability in source
    let availableInSource = 0;
    if (isSourceWarehouse) {
      const srcWh = warehouses.find(w => w.id === transferForm.fromId);
      const whItem = srcWh?.items?.find(item => item.productId === transferForm.productId);
      availableInSource = whItem?.stock || 0;
    } else {
      const srcBr = branches.find(b => b.id === transferForm.fromId);
      const brItem = srcBr?.items?.find(item => item.productId === transferForm.productId);
      availableInSource = brItem?.stock || 0;
    }

    if (availableInSource < qty) {
      alert(`عذراً! الكمية المطلوبة للتحويل (${qty}) تتجاوز المتاح في المصدر المحدد (${availableInSource} وحدة).`);
      return;
    }

    // Deduct from source
    if (isSourceWarehouse) {
      const updatedWhs = warehouses.map(w => {
        if (w.id === transferForm.fromId) {
          const items = w.items.map(item => {
            if (item.productId === transferForm.productId) {
              return { ...item, stock: Math.max(0, item.stock - qty) };
            }
            return item;
          });
          return { ...w, items };
        }
        return w;
      });
      setWarehouses(updatedWhs);
    } else {
      const updatedBranches = branches.map(b => {
        if (b.id === transferForm.fromId) {
          const items = b.items ? b.items.map(item => {
            if (item.productId === transferForm.productId) {
              return { ...item, stock: Math.max(0, item.stock - qty) };
            }
            return item;
          }) : [];
          return { ...b, items };
        }
        return b;
      });
      setBranches(updatedBranches);
    }

    // Add to target branch
    const updatedBranchesWithTarget = branches.map(b => {
      if (b.id === transferringBranch.id) {
        const items = b.items ? [...b.items] : [];
        const existingIdx = items.findIndex(item => item.productId === transferForm.productId);

        if (existingIdx > -1) {
          items[existingIdx] = {
            ...items[existingIdx],
            stock: items[existingIdx].stock + qty
          };
        } else {
          items.push({
            productId: transferForm.productId,
            stock: qty,
            minLimit: 10,
            locationCode: "صالة مخصصة"
          });
        }
        return { ...b, items };
      }
      return b;
    });
    setBranches(updatedBranchesWithTarget);

    // Get source name
    let sourceName = "";
    if (isSourceWarehouse) {
      sourceName = warehouses.find(w => w.id === transferForm.fromId)?.name || "مستودع";
    } else {
      sourceName = branches.find(b => b.id === transferForm.fromId)?.name || "معرض منافس";
    }

    // Append to transactions ledger
    const newTr: StockTransfer = {
      id: "tr_" + Date.now().toString().slice(-4),
      transferNo: "STK-TRN-" + Math.floor(1000 + Math.random() * 9000),
      fromType: isSourceWarehouse ? "warehouse" : "branch",
      fromId: transferForm.fromId,
      fromName: sourceName,
      toType: "branch",
      toId: transferringBranch.id,
      toName: transferringBranch.name,
      productId: transferForm.productId,
      productName: productObj.name,
      qty: qty,
      status: "approved",
      date: new Date().toISOString().split("T")[0],
      notes: transferForm.notes || "توسعة عهدة الفرع الذكي",
      historyLogs: [
        `${new Date().toLocaleString("ar-SA")}: تم تفويض النقل اللوجستي ومزامنته بمجمع منافذ سهم.`
      ]
    };

    setTransfers((prev: any) => [newTr, ...prev]);

    if (triggerNotification) {
      triggerNotification(`تم تحويل ونقل ${qty} قطعة من "${productObj.name}" لـ "${transferringBranch.name}" بنجاح! 🚚`, "success");
    }
    if (addAuditLog) {
      addAuditLog("تحويل مخزني للفرع", `نقل ${qty} وحدة من "${productObj.name}" من جهة "${sourceName}" لجهة "${transferringBranch.name}"`);
    }

    setBranchTimeline(prev => [
      {
        date: "الآن - تحويل لوجستي بنجاح",
        title: "بروتوكول تفريغ الشحن",
        desc: `استلام +{qty} وحدة من صنف [${productObj.name}] من [${sourceName}] لدعم مستودعات البيع بالموقع.`
      },
      ...prev
    ]);

    setTransferringBranch(null);
  };

  // Jump to specific tab action helper (e.g. from dropdown)
  const jumpToTab = (tab: "inventory" | "supply" | "sales" | "staff", brId: string) => {
    setSelectedBranchId(brId);
    setActiveTab(tab);
    setActiveMenuBranchId(null);
  };

  const branchItems = selectedBranch?.items || [];
  const lowStockItems = branchItems.filter(item => item.stock > 0 && item.stock < (item.minLimit || 12));
  const totalItemsCount = branchItems.reduce((sum, item) => sum + item.stock, 0);

  // High fidelity recent invoices data based on chosen branch
  const mockInvoices = [
    { id: "INV-2026-9051", customer: "مروان الجهني", date: "2026-06-03", total: Math.round(selectedBranch.sales * 0.01) || 980, status: "مدفوع" },
    { id: "INV-2026-8842", customer: "فاطمة الشمري", date: "2026-06-02", total: Math.round(selectedBranch.sales * 0.005) || 450, status: "مدفوع" },
    { id: "INV-2026-8153", customer: "سلطان الحربي", date: "2026-05-31", total: Math.round(selectedBranch.sales * 0.02) || 1200, status: "مدفوع" },
    { id: "INV-2026-7910", customer: "عبدالرحمن البقمي", date: "2026-05-30", total: Math.round(selectedBranch.sales * 0.015) || 750, status: "مدفوع" }
  ];

  return (
    <div className="space-y-6 text-right font-sans relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800 no-print">
        <div className="border-r-4 border-emerald-500 pr-4">
          <h3 className="text-base font-black text-white">إدارية المعارض والفروع وربط منافذ التوزيع 🏬</h3>
          <p className="text-xs text-gray-400">إدارة حركة العهد ومراسات البيع واستعراض الأداء ومخزون كل معرض حياً بالتفصيل (اضغط على الفروع للتغيير)</p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowAllBranches(val => !val)}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              showAllBranches
                ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                : "bg-slate-950 text-gray-300 border-slate-800 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>{showAllBranches ? "📱 عرض فروع المتجر النشط فقط" : "🌐 عرض كل الفروع والمنافذ"}</span>
          </button>
        </div>
      </div>

      {/* List of branches with Actions list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedBranches.map((b) => {
          const isSelected = selectedBranchId === b.id || selectedBranchId === b.branch_id;
          const isArchived = !b.isActive;
          const totalStock = b.items ? b.items.reduce((sum, i) => sum + i.stock, 0) : 0;

          return (
            <div 
              key={b.id || b.branch_id} 
              onClick={() => setSelectedBranchId(b.id || b.branch_id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none active:scale-[0.98] ${
                isArchived ? "opacity-60 grayscale-[25%]" : ""
              } ${
                isSelected 
                  ? "bg-slate-850 border-emerald-500 shadow-xl shadow-emerald-500/10" 
                  : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700"
              }`}
              style={{ borderColor: isSelected ? theme.accent || "#059669" : "" }}
            >
              {isSelected && (
                <span className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: theme.accent || "#059669" }} />
              )}
              
              <div className="flex justify-between items-center mb-3">
                {/* Actions Popup Dropdown Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => handleDropdownToggle(b.id, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 border-none bg-slate-950 text-gray-400 hover:text-white cursor-pointer transition-all active:scale-95"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuBranchId === b.id && (
                    <div 
                      className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-25 text-right space-y-1 text-xs"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <button
                        onClick={(e) => openEditModal(b, e)}
                        className="w-full text-right flex items-center justify-between gap-2 px-3 py-1.8 text-gray-200 hover:text-white hover:bg-slate-900 rounded-lg border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span>📝 تعديل الفرع</span>
                      </button>
                      <button
                        onClick={(e) => openLinkModal(b, e)}
                        className="w-full text-right flex items-center justify-between gap-2 px-3 py-1.8 text-blue-400 hover:text-blue-300 hover:bg-slate-900 rounded-lg border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span>🔗 ربط بمستودع</span>
                      </button>
                      <button
                        onClick={(e) => openAddProdModal(b, e)}
                        className="w-full text-right flex items-center justify-between gap-2 px-3 py-1.8 text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 rounded-lg border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span>📥 إضافة منتجات للفرع</span>
                      </button>
                      <button
                        onClick={(e) => openTransferModal(b, e)}
                        className="w-full text-right flex items-center justify-between gap-2 px-3 py-1.8 text-amber-500 hover:text-amber-400 hover:bg-slate-900 rounded-lg border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span>🔄 نقل مخزون للفرع</span>
                      </button>
                      <button
                        onClick={() => jumpToTab("sales", b.id)}
                        className="w-full text-right flex items-center justify-between gap-2 px-3 py-1.8 text-purple-400 hover:text-purple-300 hover:bg-slate-900 rounded-lg border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span>📊 عرض مبيعات الفرع</span>
                      </button>
                      
                      <div className="h-px bg-slate-900 my-1" />
                      
                      <button
                        onClick={(e) => handleToggleActiveBranch(b, e)}
                        className={`w-full text-right flex items-center justify-between gap-2 px-3 py-1.8 rounded-lg border-none bg-transparent cursor-pointer font-sans ${
                          isArchived ? "text-emerald-400 hover:text-emerald-300" : "text-red-400 hover:text-red-300"
                        }`}
                      >
                        <span>{isArchived ? "🟢 إعادة تشغيل" : "🗄️ تعطيل / أرشفة"}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    isArchived ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {isArchived ? "مغلق ومؤرشف 🗄️" : "نشط ومستمر ✓"}
                  </span>
                  <span className="text-[9px] text-gray-500">{totalStock} وحدة</span>
                </div>
              </div>

              <h4 className="text-sm font-black text-white flex items-center gap-2 justify-end">
                <span>{b.name}</span>
                <Store className="w-4 h-4 text-emerald-400" style={{ color: theme.accent || "#059669" }} />
              </h4>
              <p className="text-[10px] text-gray-400 mt-1">📍 المدينة: {b.city} | {b.address}</p>
              <p className="text-[10px] text-gray-400">👤 المدير المفوّض: <span className="font-bold text-gray-300">{b.manager}</span></p>

              {!(b.associatedWh || b.linked_warehouse_id) ? (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    openLinkModal(b, e);
                  }}
                  className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 flex items-center justify-between gap-2 text-right transition-all"
                >
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                    <span>⚠️ غير مربوط بمستودع</span>
                  </span>
                  <span className="py-1 px-2.5 bg-amber-500 hover:bg-amber-450 text-black text-[9px] font-black rounded-lg cursor-pointer font-sans">
                    ربط بمستودع
                  </span>
                </div>
              ) : (
                <p className="text-[9.5px] text-gray-400 mt-2 flex items-center justify-end gap-1 font-sans">
                  <span className="text-gray-500">🔗 مرتبط بمستودع:</span>
                  <span className="font-black text-emerald-400">
                    {warehouses.find(w => w.id === (b.associatedWh || b.linked_warehouse_id))?.name || "مستودع خارجي"}
                  </span>
                </p>
              )}

              <div className="border-t border-slate-800/80 pt-3 mt-3 flex justify-between text-xs font-bold leading-normal font-mono">
                <div>
                  <span className="text-[9px] text-gray-500 block font-sans">المبيعات الإجمالية</span>
                  <span className="text-white text-xs">{formatMoney(b.sales)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block font-sans">الأرباح الصافية</span>
                  <span className="text-emerald-400 text-xs">{formatMoney(b.profits)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail dashboard section inside branch details (Requirement 2 & 7) */}
      {selectedBranch && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-450" style={{ color: theme.accent || "#059669" }} />
                <span>إدارية المعرض: <span className="text-emerald-400" style={{ color: theme.accent }}>{selectedBranch.name}</span> ({selectedBranch.city})</span>
              </h3>
              <p className="text-[10px] text-gray-400">طريقة التشغيل الحالية: {selectedBranch.workingHours} | هاتف: {selectedBranch.phone || "0501112223"}</p>
            </div>

            {/* CLEAR action buttons inside details (Requirement 2) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(selectedBranch)}
                className="py-1.5 px-3 rounded-lg text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-gray-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-755"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-400" />
                <span>✏️ تعديل الفرع</span>
              </button>
              <button
                type="button"
                onClick={() => openLinkModal(selectedBranch)}
                className="py-1.5 px-3 rounded-lg text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-gray-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-755"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span>🔗 ربط بمستودع</span>
              </button>
              <button
                type="button"
                onClick={() => openAddProdModal(selectedBranch)}
                className="py-1.5 px-3 rounded-lg text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 border-none shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>📥 إضافة منتجات</span>
              </button>
              <button
                type="button"
                onClick={() => openTransferModal(selectedBranch)}
                className="py-1.5 px-3 rounded-lg text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-gray-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-755"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>🚚 نقل مخزون</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sales")}
                className="py-1.5 px-3 rounded-lg text-[11px] font-black bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 border-none shadow"
              >
                <BarChart className="w-3.5 h-3.5" />
                <span>📊 عرض المبيعات</span>
              </button>
            </div>
          </div>

          {/* Sub-tabs Selection for specific branch details */}
          <div className="flex border-b border-slate-800/60 pb-px gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`pb-2.5 px-4 text-xs font-black bg-transparent border-b-2 cursor-pointer transition-all outline-none font-sans flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "inventory" 
                  ? "border-emerald-500 text-white" 
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              style={{ borderBottomColor: activeTab === "inventory" ? (theme.accent || "#059669") : "" }}
            >
              <span>📦 مخزون ومنتجات المعرض ({branchItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`pb-2.5 px-4 text-xs font-black bg-transparent border-b-2 cursor-pointer transition-all outline-none font-sans flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "sales" 
                  ? "border-emerald-500 text-white" 
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              style={{ borderBottomColor: activeTab === "sales" ? (theme.accent || "#059669") : "" }}
            >
              <span>💰 مبيعات وأداء المعرض</span>
            </button>
            <button
              onClick={() => setActiveTab("supply")}
              className={`pb-2.5 px-4 text-xs font-black bg-transparent border-b-2 cursor-pointer transition-all outline-none font-sans flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "supply" 
                  ? "border-emerald-500 text-white" 
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              style={{ borderBottomColor: activeTab === "supply" ? (theme.accent || "#059669") : "" }}
            >
              <span>🔗 مسارات التوريد والتحويلات</span>
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`pb-2.5 px-4 text-xs font-black bg-transparent border-b-2 cursor-pointer transition-all outline-none font-sans flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "staff" 
                  ? "border-emerald-500 text-white" 
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              style={{ borderBottomColor: activeTab === "staff" ? (theme.accent || "#059669") : "" }}
            >
              <span>👥 الكادر والموظفين المتاحين ({selectedBranch.employees?.length || 0})</span>
            </button>
          </div>

          {/* ============= TAB 1: BRANCH SPECIFIC STOCK / INVENTORY ============= */}
          {activeTab === "inventory" && (
            <div className="space-y-4 animate-fade-in text-right">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-gray-400 text-xs">إحصائيات استهلاك وسعة العرض:</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-300 font-bold">إجمالي كمية المخزون بالفرع: <span className="font-mono text-emerald-400 font-black">{totalItemsCount} قطعة</span></span>
                  <span className="text-gray-300 font-bold">أصناف منخفضة المخزون: <span className="font-mono text-amber-500 font-black">{lowStockItems.length}</span></span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 text-right text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] text-gray-400 tracking-wide font-sans">
                      <th className="p-3 text-right">صورة و اسم السلعة</th>
                      <th className="p-3 text-right">رمز التكويد SKU</th>
                      <th className="p-3 text-right">موقع عرض السلعة بالمعرض</th>
                      <th className="p-3 text-center">الحد الأدنى للفرع</th>
                      <th className="p-3 text-center">الكمية المتوفرة بالمعرض</th>
                      <th className="p-3 text-left pl-4">مستوى الاستقرار والوفرة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs font-sans">
                    {branchItems.map((item) => {
                      const prod = products.find(p => p.id === item.productId);
                      if (!prod) return null;
                      const isLow = item.stock > 0 && item.stock < (item.minLimit || 12);
                      const isOut = item.stock === 0;

                      return (
                        <tr key={item.productId} className="hover:bg-slate-850/60 transition-all duration-150">
                          {/* Image & name */}
                          <td className="p-3 flex items-center gap-3">
                            {prod.image ? (
                              <img 
                                src={prod.image} 
                                alt={prod.name} 
                                className="w-9 h-9 rounded object-cover border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500">
                                <Store className="w-4 h-4 text-emerald-450" />
                              </div>
                            )}
                            <div>
                              <strong className="text-white block font-bold text-xs">{prod.name}</strong>
                              <span className="text-[10px] text-gray-400">{prod.category}</span>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="p-3 font-mono text-gray-400 text-[11px]">{prod.sku}</td>

                          {/* Section code / Shelf code */}
                          <td className="p-3">
                            <span className="bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded text-[10px] font-bold text-gray-300">
                              {item.locationCode || "صالة العرض الرئيسية"}
                            </span>
                          </td>

                          {/* Min limit */}
                          <td className="p-3 text-center font-mono text-gray-400 text-[11px]">
                            {item.minLimit || 10} وحدة
                          </td>

                          {/* Stock amount */}
                          <td className="p-3 text-center font-mono">
                            <span className={`font-black text-sm ${isOut ? "text-red-500 animate-pulse" : isLow ? "text-amber-500 font-bold" : "text-emerald-400"}`}>
                              {item.stock}
                            </span>
                            <span className="text-[10px] text-gray-500 mr-1 font-sans">قطعة</span>
                          </td>

                          {/* Status Badge */}
                          <td className="p-3 text-left pl-4 font-sans text-xs">
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full inline-block ${
                              isOut 
                                ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                : isLow 
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                            }`}>
                              {isOut ? "غير متوفر بالفرع ✕" : isLow ? "مستوى منخفض للسلعة ⚠️" : "متوفر ومستقر ✓"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {branchItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-gray-500 text-xs">
                          لا توجد سلع مخصصة لهذا المعرض حالياً. اضغط على "+ إضافة منتجات" لتوريد أول كمية لهذا المعرض حياً!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============= TAB 2: SALES & PERFORMANCE (Requirement 7) ============= */}
          {activeTab === "sales" && (
            <div className="space-y-5 animate-fade-in text-right">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <span className="text-[9px] text-gray-500 block font-bold">إجمالي المبيعات المحققة</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-white font-mono">{formatMoney(selectedBranch.sales)}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">حالة مستقرة 📈</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <span className="text-[9px] text-gray-500 block font-bold">المنتجات المباعة والأرباح الصافية</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-emerald-400 font-mono">{formatMoney(selectedBranch.profits)}</span>
                    <span className="text-[10px] text-gray-400">هامش ربحي 33%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <span className="text-[9px] text-gray-500 block font-bold">المصاريف التشغيلية والإيجارية</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-red-400 font-mono">
                      {formatMoney(selectedBranch.expenses || Math.round(selectedBranch.sales * 0.12))}
                    </span>
                    <span className="text-[10px] text-gray-500">تم جرد الرواتب</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <span className="text-[9px] text-gray-500 block font-bold">إجمالي زوار المعرض المنجز</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-blue-400 font-mono">{selectedBranch.customersCount || 342} زبون</span>
                    <span className="text-[10px] text-emerald-400 font-mono">+{Math.round(selectedBranch.customersCount * 0.1)}%</span>
                  </div>
                </div>
              </div>

              {/* Latest invoices (Requirement 7) */}
              <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5 mb-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>سجل ودفتر آخر فواتير مبيعات المعرض (Recent Branch Invoices Ledger)</span>
                </h4>

                <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950 text-xs">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-[10px] text-gray-500">
                        <th className="p-3 text-right">رقم الفاتورة الضريبية</th>
                        <th className="p-3 text-right">العميل والمستفيد</th>
                        <th className="p-3 text-right">تاريخ الإصدار</th>
                        <th className="p-3 text-center">القيمة الإجمالية</th>
                        <th className="p-3 text-left pl-4">حالة الفاتورة وعقد البيع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs text-gray-300">
                      {mockInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-900/60">
                          <td className="p-3 font-mono text-white text-[11px] font-bold">{inv.id}</td>
                          <td className="p-3 font-sans text-xs">{inv.customer}</td>
                          <td className="p-3 font-mono text-gray-400 text-[11px]">{inv.date}</td>
                          <td className="p-3 text-center font-mono text-emerald-400 font-black">{formatMoney(inv.total)}</td>
                          <td className="p-3 text-left pl-4">
                            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded-full">
                              ✓ مدفوعة ومسددة بالكامل
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============= TAB 3: SUPPLY ROUTE AND TIMELINE (Requirement 7 & 8) ============= */}
          {activeTab === "supply" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-right">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/65 space-y-4">
                <h4 className="text-xs font-black text-[#D4AF37] flex items-center gap-1.5 font-sans">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>طاقم الربط اللوجستي وقنوات التزويد الفعالة (Active Supply Route)</span>
                </h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  تحديد مسار التوريد المحاسبي واللوجستي لهذا المعرض المعتم بالإمداد الشامل والذاتي للمنتجات:
                </p>

                {selectedBranch.associatedWh ? (
                  (() => {
                    const linkedWhName = warehouses.find(w => w.id === selectedBranch.associatedWh)?.name || "مستودع خارجي";
                    return (
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between text-xs animate-pulse">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-gray-400 block font-sans">المستودع الرئيسي المغذي:</span>
                          <span className="font-black text-white">{linkedWhName} ⚙️</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          🔗 خط توريد متصل
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 flex items-center justify-between text-xs text-right">
                    <div className="space-y-1">
                      <span className="font-bold text-amber-500 block">⚠️ لا يوجد مستودع ربط لوجستي مخصص</span>
                      <p className="text-[9px] text-gray-400">يرجى الضغط على "ربط بمستودع" لإنشاء قناة إمدادية معتمدة ومباشرة.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-4 text-[11px] text-gray-300">
                  <span className="text-[10px] font-bold text-gray-400 block">تتبع تفويضات الشحن السابقة للفرع:</span>
                  {transfers.filter(tr => tr.toId === selectedBranch.id).slice(0, 3).map((tr, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-850 flex justify-between items-center font-mono">
                      <div>
                        <span className="text-gray-200 block font-sans">{tr.productName} ({tr.qty} قطعة)</span>
                        <span className="text-[10px] text-gray-500 block">{tr.fromName} ⟶ {tr.toName}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 py-0.5 px-2 rounded-full font-sans font-bold">
                        تكامل تام
                      </span>
                    </div>
                  ))}
                  {transfers.filter(tr => tr.toId === selectedBranch.id).length === 0 && (
                    <span className="text-[11px] text-gray-500 block text-center py-4 font-sans">لا توجد عمليات نقل بضائع سابقة مسجلة لجهة هذا معرض.</span>
                  )}
                </div>
              </div>

              {/* Branch Timeline (Requirement 8) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/65 space-y-3">
                <h4 className="text-xs font-black text-white">سجل تشغيل وجرد المعرض الحيزي (Branch Active Timeline)</h4>
                
                <div className="space-y-3.5 text-[10px] leading-relaxed max-h-60 overflow-y-auto pr-1">
                  {branchTimeline.map((event, index) => (
                    <div key={index} className="border-r border-emerald-500/30 pr-3 relative pb-2 animate-fade-in">
                      <div className="absolute right-[-3px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-gray-550 block font-mono">{event.date}</span>
                      <strong className="text-white text-xs block mt-0.5 font-sans">{event.title}:</strong>
                      <p className="text-[10.5px] text-gray-400 mt-1">{event.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============= TAB 4: STAFF / ASSOCIATED EMPLOYEES (Requirement 7) ============= */}
          {activeTab === "staff" && (
            <div className="space-y-4 animate-fade-in text-right">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs">
                <span className="text-gray-400">المدير المسؤول بالفرع حالياً:</span>
                <span className="text-white font-bold block">{selectedBranch.manager} (هاتف: {selectedBranch.phone || "0501112223"})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedBranch.employees || ["صالح الشمري", "محمد العتيبي", "خالد الحربي", "نورة القحطاني"]).map((emp, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-sans font-bold flex items-center justify-center text-xs">
                        {emp.slice(0, 1)}
                      </div>
                      <div>
                        <strong className="text-white block font-sans text-xs">{emp}</strong>
                        <span className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-emerald-400" />
                          <span>خبير وبائع سهم مرخص</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 bg-slate-900 border border-slate-800 py-0.5 px-2 rounded font-sans font-bold">
                      ✓ بقفص الكاشير
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= POPUP MODAL: UPDATE BRANCH (تعديل بيانات الفرع) (Requirement 3) ======================= */}
      {editingBranch && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-emerald-400" />
                  <span>تعديل بيانات وبيئة الفرع المحدد 🏬</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">تحديث سجل الدليل التشغيلي والمحاسبي لـ <span className="text-white font-bold">{editingBranch.name}</span></p>
              </div>
              <button
                onClick={() => setEditingBranch(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اسم الفرع بالدليل:</label>
                <input
                  type="text"
                  placeholder="مثال: فرع الرياض الرئيسي..."
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المدينة الفلكية:</label>
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
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• ساعات المبيعات والعمل:</label>
                  <input
                    type="text"
                    value={editForm.workingHours}
                    onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-center font-bold"
                    placeholder="08:00 ص - 11:00 م"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• العنوان التفصيلي للمعرض:</label>
                <input
                  type="text"
                  placeholder="مثال: طريق الملك فهد، المعرض رقم 13..."
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• مدير الفرع المسؤول:</label>
                  <input
                    type="text"
                    placeholder="عبدالله العوضي"
                    value={editForm.manager}
                    onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• رقم التواصل المباشر:</label>
                  <input
                    type="text"
                    placeholder="05XXXXXXXX"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-center font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• المستودع اللوجستي المرتبط:</label>
                  <select
                    value={editForm.associatedWh}
                    onChange={(e) => setEditForm({ ...editForm, associatedWh: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="">-- لا يوجد ربط مستودع --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• حالة التشغيل الحالية:</label>
                  <select
                    value={editForm.isActive ? "true" : "false"}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  >
                    <option value="true">نشط ومستقبل للمبيعات ✓</option>
                    <option value="false">مغلق وتحت الصيانة ⚠️</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-emerald-505 hover:bg-emerald-500 bg-emerald-500 transition-colors border-none"
                  style={{ backgroundColor: theme.accent || "#059669" }}
                >
                  حفظ وتطبيق تعديلات الفرع ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP MODAL: LINK TO WAREHOUSE (ربط بمستودع) (Requirement 4) ======================= */}
      {linkingWhBranch && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  <span>ربط المعرض بمستودع الإمداد 🔗</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">تحديد حلقة إمداد مخصصة للمعرض: <span className="text-white font-bold">{linkingWhBranch.name}</span></p>
              </div>
              <button
                onClick={() => setLinkingWhBranch(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• اختر المستودع المغذي المعتمد:</label>
                <select
                  value={linkForm.warehouseId}
                  onChange={(e) => setLinkForm({ warehouseId: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold font-sans"
                  required
                >
                  <option value="">-- اختر مستودع إمداد --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (الموقع: {w.location})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-emerald-500 hover:bg-emerald-450 transition-colors border-none"
                >
                  اعتماد وربط المسار 🔗
                </button>
                <button
                  type="button"
                  onClick={() => setLinkingWhBranch(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP MODAL: ADD PRODUCT TO STORE (إضافة بضائع للفرع) (Requirement 5) ======================= */}
      {addingProdBranch && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>إيداع وتوريد بضاعة بالمعرض 📥</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">توريد مباشر لرفوف المعرض: <span className="text-white font-bold">{addingProdBranch.name}</span></p>
              </div>
              <button
                onClick={() => setAddingProdBranch(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProdSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• صنف البضاعة للفرع:</label>
                <select
                  value={addProdForm.productId}
                  onChange={(e) => setAddProdForm({ ...addProdForm, productId: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-right font-bold"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (رمز: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• الكمية في الفرع:</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={addProdForm.qty}
                    onChange={(e) => setAddProdForm({ ...addProdForm, qty: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• حد إعادة الجرد:</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={addProdForm.minLimit}
                    onChange={(e) => setAddProdForm({ ...addProdForm, minLimit: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• موقع التثبيت بالصالة أو الجناح:</label>
                <input
                  type="text"
                  placeholder="مثال: رف العود الأول، الصالة الأمامية..."
                  value={addProdForm.locationCode}
                  onChange={(e) => setAddProdForm({ ...addProdForm, locationCode: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-emerald-500 text-right"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-emerald-500 hover:bg-emerald-450 transition-colors border-none animate-bounce-short"
                >
                  تأكيد الإدخال والتخزين ✓
                </button>
                <button
                  type="button"
                  onClick={() => setAddingProdBranch(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP MODAL: STOCK TRANSFER (نقل وتحويل مخزون المعرض/المستودعات) (Requirement 6) ======================= */}
      {transferringBranch && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50 animate-fade-in text-right">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-5 bg-slate-900 border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans">
                  <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                  <span>بروتوكول تفويض نقل مخزون 🚚</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">الفرع المستلم النهائي: <span className="text-emerald-400 font-bold">{transferringBranch.name}</span></p>
              </div>
              <button
                onClick={() => setTransferringBranch(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold mb-1.5 text-gray-300">• مصدر النقل:</label>
                  <select
                    value={transferForm.fromType}
                    onChange={(e) => {
                      const type = e.target.value as "warehouse" | "branch";
                      const defaultId = type === "warehouse" ? (warehouses[0]?.id || "") : (branches.filter(b => b.id !== transferringBranch.id)[0]?.id || "");
                      setTransferForm({ ...transferForm, fromType: type, fromId: defaultId });
                    }}
                    className="w-full text-xs rounded-lg py-2.2 px-2.5 border border-slate-700 bg-slate-950 text-white outline-none font-bold"
                  >
                    <option value="warehouse">מستودع رئيسي</option>
                    <option value="branch">فرع آخر منافس</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold mb-1.5 text-gray-300">• اختر جهة المصدر:</label>
                  <select
                    value={transferForm.fromId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromId: e.target.value })}
                    className="w-full text-xs rounded-lg py-2.2 px-2.5 border border-slate-700 bg-slate-950 text-white outline-none font-bold"
                  >
                    {transferForm.fromType === "warehouse" ? (
                      warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))
                    ) : (
                      branches.filter(b => b.id !== transferringBranch.id).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• السلعة البلاستيكية المراد نقلها:</label>
                <select
                  value={transferForm.productId}
                  onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none font-bold text-right"
                  required
                >
                  <option value="">-- اختر السلعة --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (المتوفر بالدولة: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-300">• كمية النقل الرسمية (قطعة):</label>
                  <input
                    type="number"
                    min="1"
                    value={transferForm.qty}
                    onChange={(e) => setTransferForm({ ...transferForm, qty: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-300">• سبب وبند النقل بالمستند التشغيلي:</label>
                <input
                  type="text"
                  placeholder="مثال: سد عجز بالفرع، طلبية زبون خاصة..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer text-black bg-amber-550 hover:bg-amber-450 bg-amber-500 transition-colors border-none shadow-md"
                >
                  اعتماد الشحن والترحيل المخزني 🚚
                </button>
                <button
                  type="button"
                  onClick={() => setTransferringBranch(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer border border-slate-800 text-center text-gray-400 bg-slate-950 hover:bg-slate-900"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
