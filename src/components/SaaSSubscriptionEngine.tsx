import React, { useState, useEffect } from "react";
import { 
  ThemeColors, CompanyProfile, SubscriptionPlan, PlanFeature, 
  TenantSubscription, SubscriptionUsage, TenantFeatureOverride 
} from "../types";
import {
  CreditCard, ShieldAlert, Check, RefreshCw, Star, Users, Building,
  FileText, ToggleLeft, ToggleRight, Gift, Calendar, HelpCircle, Award,
  Search, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Settings,
  DollarSign, Key, Cpu, Trash, Percent
} from "lucide-react";
import { SahmDatabaseService } from "../core/database/dbService";
import { SubscriptionGuard } from "../core/database/subscriptionGuard";

interface SaaSSubscriptionEngineProps {
  theme: ThemeColors;
  subscription: {
    tier: "A" | "B" | "C";
    limit: number;
    currentUsed: number;
    renewsAt: string;
  };
  onUpgrade: (tier: "A" | "B" | "C", limit: number) => void;
  onAddLog: (action: string, details: string) => void;
  triggerNotification: (title: string, text: string, type: "success" | "warning" | "info" | "critical" | "ai") => void;
  rawCompanies?: CompanyProfile[];
  rawInvoices?: any[];
  rawStores?: any[];
  onRefreshCompanies?: () => Promise<void>;
}

type TabType = "tenants" | "plans" | "features" | "custom" | "alerts";

export default function SaaSSubscriptionEngine({
  theme,
  subscription,
  onUpgrade,
  onAddLog,
  triggerNotification,
  rawCompanies = [],
  rawInvoices = [],
  rawStores = [],
  onRefreshCompanies
}: SaaSSubscriptionEngineProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tenants");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data states from DB
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [tenantSubscriptions, setTenantSubscriptions] = useState<TenantSubscription[]>([]);
  const [allTenantOverrides, setAllTenantOverrides] = useState<Record<string, TenantFeatureOverride[]>>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan_free");
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Plans Form Modal
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlan>>({
    id: "",
    name_ar: "",
    name_en: "",
    description: "",
    monthly_price: 0,
    yearly_price: 0,
    currency: "SAR",
    status: "active",
    is_featured: false,
    sort_order: 1
  });

  // Custom Pricing & Overrides Form
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customPeriodEnd, setCustomPeriodEnd] = useState<string>("");
  const [newOverride, setNewOverride] = useState<Partial<TenantFeatureOverride>>({
    feature_key: "pos",
    enabled: true,
    limit_value: 0,
    is_unlimited: false,
    reason: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "features") {
      loadPlanFeatures(selectedPlanId);
    }
  }, [selectedPlanId, activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const db = SahmDatabaseService.getInstance();
      
      const plansList = await db.getSubscriptionPlans();
      const subsList = await db.getTenantSubscriptions();
      
      setPlans(plansList);
      setTenantSubscriptions(subsList);

      // Load overrides for all companies in parallel
      const overridesMap: Record<string, TenantFeatureOverride[]> = {};
      await Promise.all(
        rawCompanies.map(async (comp) => {
          if (comp.tenant_id) {
            const list = await db.getTenantFeatureOverrides(comp.tenant_id);
            overridesMap[comp.tenant_id] = list;
          }
        })
      );
      setAllTenantOverrides(overridesMap);
    } catch (err) {
      console.error("Error loading SaaS engine data:", err);
      triggerNotification("❌ خطأ نظام", "فشل جلب بيانات الاشتراكات من الخادم.", "critical");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanFeatures = async (planId: string) => {
    try {
      const db = SahmDatabaseService.getInstance();
      const list = await db.getPlanFeatures(planId);
      setPlanFeatures(list);
    } catch (err) {
      console.error("Error loading plan features:", err);
    }
  };

  const handleToggleSuspension = async (comp: CompanyProfile) => {
    const isCurrentlyActive = comp.status !== "suspended";
    const nextStatus = isCurrentlyActive ? "suspended" : "active";
    const nextStoreActive = !isCurrentlyActive;

    if (isCurrentlyActive) {
      const confirmDisable = window.confirm(`هل تريد تعطيل هذه المنشأة [${comp.name}]؟ سيتم منع المالك ومستخدميه من الدخول مؤقتًا.`);
      if (!confirmDisable) return;
    }

    try {
      setIsUpdating(comp.id);
      const db = SahmDatabaseService.getInstance();

      // 1. Update company status
      const updatedComp = { ...comp, status: nextStatus as any };
      await db.saveCompany(updatedComp);

      // 2. Update all stores of this company
      const compStores = rawStores.filter(s => s.tenant_id === comp.tenant_id);
      for (const store of compStores) {
        const updatedStore = { ...store, isActive: nextStoreActive };
        await db.saveStore(updatedStore);
      }

      // 3. Update subscription status
      const existingSub = tenantSubscriptions.find(s => s.tenant_id === comp.tenant_id);
      if (existingSub) {
        const updatedSub = { ...existingSub, status: (nextStatus === "active" ? "active" : "suspended") as any };
        await db.saveTenantSubscription(updatedSub);
      }

      await loadData();
      if (onRefreshCompanies) {
        await onRefreshCompanies();
      }

      onAddLog("إدارة الاشتراكات", `تم تغيير حالة اشتراك المنشأة [${comp.name}] إلى ${nextStatus === "active" ? "نشط" : "موقف مؤقتاً"}`);
      triggerNotification(
        nextStatus === "active" ? "تم تفعيل الاشتراك بنجاح" : "تم إيقاف الاشتراك بنجاح",
        `تم تحديث حالة المنشأة [${comp.name}] ومتاجرها بنجاح.`,
        "success"
      );
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ في النظام", `تعذر تعديل حالة الاشتراك: ${err.message}`, "critical");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleChangePackage = async (comp: CompanyProfile, newPlanId: string) => {
    try {
      setIsUpdating(comp.id);
      const db = SahmDatabaseService.getInstance();
      const selectedPlan = plans.find(p => p.id === newPlanId);
      if (!selectedPlan) return;

      // 1. Update company subscriptionPlan field
      const updatedComp = { ...comp, subscriptionPlan: selectedPlan.name_ar };
      await db.saveCompany(updatedComp);

      // 2. Update tenant subscription table
      const existingSub = tenantSubscriptions.find(s => s.tenant_id === comp.tenant_id);
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);

      const subObj: TenantSubscription = {
        id: existingSub?.id || "sub-" + Math.random().toString(36).substring(2, 9),
        tenant_id: comp.tenant_id || "",
        company_id: comp.id,
        plan_id: newPlanId,
        status: existingSub?.status || "active",
        start_date: existingSub?.start_date || now.toISOString().split("T")[0],
        trial_ends_at: existingSub?.trial_ends_at || now.toISOString().split("T")[0],
        current_period_start: now.toISOString().split("T")[0],
        current_period_end: nextMonth.toISOString().split("T")[0],
        billing_cycle: existingSub?.billing_cycle || "monthly",
        notes: "تم تغيير الباقة من لوحة التحكم"
      };
      await db.saveTenantSubscription(subObj);

      await loadData();
      if (onRefreshCompanies) {
        await onRefreshCompanies();
      }

      onAddLog("إدارة الاشتراكات", `تم تغيير باقة المنشأة [${comp.name}] إلى: ${selectedPlan.name_ar}`);
      triggerNotification(
        "تم تغيير الباقة بنجاح",
        `تم نقل المنشأة [${comp.name}] إلى [${selectedPlan.name_ar}] بنجاح وتحديث الصلاحيات.`,
        "success"
      );
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ في تغيير الباقة", `تعذر تغيير الباقة: ${err.message}`, "critical");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleExtendTrial = async (comp: CompanyProfile) => {
    try {
      setIsUpdating(comp.id);
      const db = SahmDatabaseService.getInstance();
      
      const existingSub = tenantSubscriptions.find(s => s.tenant_id === comp.tenant_id);
      const now = new Date();
      const extensionDate = new Date();
      extensionDate.setDate(now.getDate() + 30); // Extend by 30 days

      // Update company
      const updatedComp = { ...comp, status: "active" as any };
      await db.saveCompany(updatedComp);

      // Update tenant subscription
      const subObj: TenantSubscription = {
        id: existingSub?.id || "sub-" + Math.random().toString(36).substring(2, 9),
        tenant_id: comp.tenant_id || "",
        company_id: comp.id,
        plan_id: existingSub?.plan_id || "plan_free",
        status: "active",
        start_date: existingSub?.start_date || now.toISOString().split("T")[0],
        trial_ends_at: extensionDate.toISOString().split("T")[0],
        current_period_start: now.toISOString().split("T")[0],
        current_period_end: extensionDate.toISOString().split("T")[0],
        billing_cycle: existingSub?.billing_cycle || "monthly",
        notes: "تمديد فترة تجربة مجانية من لوحة التحكم"
      };
      await db.saveTenantSubscription(subObj);

      await loadData();
      if (onRefreshCompanies) {
        await onRefreshCompanies();
      }

      onAddLog("إدارة الاشتراكات", `تم تمديد فترة تجربة المنشأة [${comp.name}] وتفعيل الكيان`);
      triggerNotification(
        "تم تمديد التجربة بنجاح",
        `تم تمديد فترة تجربة المنشأة [${comp.name}] وتفعيل الكيان بنجاح لـ 30 يوماً إضافية.`,
        "success"
      );
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ تمديد", `فشل تمديد التجربة: ${err.message}`, "critical");
    } finally {
      setIsUpdating(null);
    }
  };

  // Plans Management handlers
  const handleOpenPlanModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({ ...plan });
    } else {
      setEditingPlan(null);
      setPlanForm({
        id: "plan_" + Math.random().toString(36).substring(2, 7),
        name_ar: "",
        name_en: "",
        description: "",
        monthly_price: 0,
        yearly_price: 0,
        currency: "SAR",
        status: "active",
        is_featured: false,
        sort_order: plans.length + 1
      });
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.id || !planForm.name_ar) {
      alert("الرجاء ملء المعرف والاسم العربي للباقة");
      return;
    }

    try {
      const db = SahmDatabaseService.getInstance();
      await db.saveSubscriptionPlan(planForm as SubscriptionPlan);

      // Create default standard features for the new plan if it's new
      if (!editingPlan) {
        const defaultFeatures: PlanFeature[] = [
          { id: `f_${planForm.id}_pos`, plan_id: planForm.id!, feature_key: "pos", enabled: true, limit_value: 0, is_unlimited: false },
          { id: `f_${planForm.id}_products`, plan_id: planForm.id!, feature_key: "products", enabled: true, limit_value: 0, is_unlimited: false },
          { id: `f_${planForm.id}_invoices`, plan_id: planForm.id!, feature_key: "invoices", enabled: true, limit_value: 0, is_unlimited: false },
          { id: `l_${planForm.id}_invoices`, plan_id: planForm.id!, feature_key: "limit_invoices", enabled: true, limit_value: 1000, is_unlimited: false },
          { id: `l_${planForm.id}_products`, plan_id: planForm.id!, feature_key: "limit_products", enabled: true, limit_value: 100, is_unlimited: false },
          { id: `l_${planForm.id}_users`, plan_id: planForm.id!, feature_key: "limit_users", enabled: true, limit_value: 1, is_unlimited: false },
          { id: `l_${planForm.id}_branches`, plan_id: planForm.id!, feature_key: "limit_branches", enabled: true, limit_value: 1, is_unlimited: false }
        ];
        await db.savePlanFeatures(planForm.id!, defaultFeatures);
      }

      setIsPlanModalOpen(false);
      await loadData();
      triggerNotification("تم حفظ الباقة", `تم حفظ باقة [${planForm.name_ar}] بنجاح في النظام.`, "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ حفظ", `فشل حفظ الباقة: ${err.message}`, "critical");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الباقة؟ قد يؤثر ذلك على المنشآت المشتركة بها.")) return;
    try {
      const db = SahmDatabaseService.getInstance();
      await db.deleteSubscriptionPlan(id);
      await loadData();
      triggerNotification("تم حذف الباقة", "تم إزالة الباقة من قوالب النظام بنجاح.", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ حذف", `فشل حذف الباقة: ${err.message}`, "critical");
    }
  };

  // Features and Limits handlers
  const handleFeatureToggle = (featureKey: string, currentVal: boolean) => {
    const updated = planFeatures.map(f => {
      if (f.feature_key === featureKey) {
        return { ...f, enabled: !currentVal };
      }
      return f;
    });
    // Check if feature key exists in list, if not add it
    if (!updated.some(f => f.feature_key === featureKey)) {
      updated.push({
        id: `f_${selectedPlanId}_${featureKey}`,
        plan_id: selectedPlanId,
        feature_key: featureKey,
        enabled: true,
        limit_value: 0,
        is_unlimited: false
      });
    }
    setPlanFeatures(updated);
  };

  const handleLimitChange = (limitKey: string, value: number, isUnlimited: boolean) => {
    const featureKey = `limit_${limitKey}`;
    const updated = planFeatures.map(f => {
      if (f.feature_key === featureKey) {
        return { ...f, limit_value: value, is_unlimited: isUnlimited };
      }
      return f;
    });

    if (!updated.some(f => f.feature_key === featureKey)) {
      updated.push({
        id: `l_${selectedPlanId}_${limitKey}`,
        plan_id: selectedPlanId,
        feature_key: featureKey,
        enabled: true,
        limit_value: value,
        is_unlimited: isUnlimited
      });
    }
    setPlanFeatures(updated);
  };

  const handleSavePlanFeatures = async () => {
    try {
      const db = SahmDatabaseService.getInstance();
      await db.savePlanFeatures(selectedPlanId, planFeatures);
      triggerNotification("تم حفظ الصلاحيات", "تم تحديث وحفظ ميزات وحدود الباقة بنجاح.", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ حفظ", `فشل حفظ الصلاحيات والحدود: ${err.message}`, "critical");
    }
  };

  // Custom Pricing & Override handlers
  const handleAddOverride = async () => {
    if (!selectedTenantId || !newOverride.feature_key) {
      alert("يرجى اختيار المنشأة والميزة الاستثنائية.");
      return;
    }
    try {
      const db = SahmDatabaseService.getInstance();
      const comp = rawCompanies.find(c => c.tenant_id === selectedTenantId);
      
      const overrideObj: TenantFeatureOverride = {
        id: "ovr-" + Math.random().toString(36).substring(2, 9),
        tenant_id: selectedTenantId,
        company_id: comp?.id || "comp-default",
        feature_key: newOverride.feature_key,
        enabled: newOverride.enabled !== undefined ? newOverride.enabled : true,
        limit_value: newOverride.limit_value || 0,
        is_unlimited: newOverride.is_unlimited || false,
        reason: newOverride.reason || "استثناء مبيعات خاص"
      };

      await db.saveTenantFeatureOverride(overrideObj);
      
      // Reset form & reload
      setNewOverride({
        feature_key: "pos",
        enabled: true,
        limit_value: 0,
        is_unlimited: false,
        reason: ""
      });
      await loadData();
      triggerNotification("تم حفظ الاستثناء", "تم إضافة وتطبيق الاستثناء الخاص للعميل.", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ استثناء", `فشل إضافة الاستثناء: ${err.message}`, "critical");
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      const db = SahmDatabaseService.getInstance();
      await db.deleteTenantFeatureOverride(id);
      await loadData();
      triggerNotification("تم حذف الاستثناء", "تم إلغاء الاستثناء وعاد العميل للحدود المعيارية للباقة.", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ حذف", `فشل إلغاء الاستثناء: ${err.message}`, "critical");
    }
  };

  const handleSaveCustomPricing = async () => {
    if (!selectedTenantId) {
      alert("الرجاء اختيار المنشأة لتخصيص السعر.");
      return;
    }
    try {
      const db = SahmDatabaseService.getInstance();
      const existingSub = tenantSubscriptions.find(s => s.tenant_id === selectedTenantId);
      const comp = rawCompanies.find(c => c.tenant_id === selectedTenantId);

      const subObj: TenantSubscription = {
        id: existingSub?.id || "sub-" + Math.random().toString(36).substring(2, 9),
        tenant_id: selectedTenantId,
        company_id: comp?.id || "comp-default",
        plan_id: existingSub?.plan_id || "plan_custom",
        status: existingSub?.status || "active",
        start_date: existingSub?.start_date || new Date().toISOString().split("T")[0],
        trial_ends_at: existingSub?.trial_ends_at || new Date().toISOString().split("T")[0],
        current_period_start: existingSub?.current_period_start || new Date().toISOString().split("T")[0],
        current_period_end: customPeriodEnd || existingSub?.current_period_end || new Date().toISOString().split("T")[0],
        billing_cycle: existingSub?.billing_cycle || "monthly",
        custom_price: customPrice,
        notes: "عرض مخصص وسعر تعاقدي خاص"
      };

      await db.saveTenantSubscription(subObj);
      await loadData();
      triggerNotification("تم حفظ العرض المخصص", "تم تعديل السعر ومدة العقد بنجاح للمنشأة.", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ خطأ حفظ", `فشل حفظ العرض: ${err.message}`, "critical");
    }
  };

  // Calculate statistics
  const activeCompsCount = rawCompanies.filter(c => c.status === "active").length;
  const trialCompsCount = rawCompanies.filter(c => c.status === "draft" || (c.status as string) === "trial" || !c.status).length;
  const totalInvoicesCount = rawInvoices.length;

  // Filtered companies based on search
  const filteredCompanies = rawCompanies.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (comp.companyLegalName && comp.companyLegalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (comp.crNumber && comp.crNumber.includes(searchTerm))
  );

  // Load selected tenant custom configurations when selectedTenantId changes
  useEffect(() => {
    if (selectedTenantId) {
      const sub = tenantSubscriptions.find(s => s.tenant_id === selectedTenantId);
      if (sub) {
        setCustomPrice(sub.custom_price || 0);
        setCustomPeriodEnd(sub.current_period_end ? sub.current_period_end.substring(0, 10) : "");
      } else {
        setCustomPrice(0);
        setCustomPeriodEnd("");
      }
    }
  }, [selectedTenantId, tenantSubscriptions]);

  // Compute resource warning alerts
  const alertTenants: Array<{
    comp: CompanyProfile;
    resource: string;
    used: number;
    limit: number;
    pct: number;
  }> = [];

  rawCompanies.forEach(comp => {
    const tenantId = comp.tenant_id || "";
    const overrides = allTenantOverrides[tenantId] || [];

    // Check invoices count
    const invoicesUsed = rawInvoices.filter(i => i.tenant_id === tenantId).length;
    let invoiceLimit = 1000; // default plan_free
    const planName = comp.subscriptionPlan || "الباقة المجانية 👑";
    
    // Resolve standard limits
    if (planName.includes("الاحترافية") || planName.toLowerCase().includes("pro")) {
      invoiceLimit = 10000;
    } else if (planName.includes("الشركات") || planName.toLowerCase().includes("corporate") || planName.toLowerCase().includes("enterprise")) {
      invoiceLimit = 999999;
    }

    // Resolve overrides
    const invoiceOverride = overrides.find(o => o.feature_key === "limit_invoices");
    if (invoiceOverride) {
      invoiceLimit = invoiceOverride.is_unlimited ? 999999 : invoiceOverride.limit_value;
    }

    if (invoiceLimit < 999999) {
      const pct = Math.round((invoicesUsed / invoiceLimit) * 100);
      if (pct >= 85) {
        alertTenants.push({
          comp,
          resource: "الفواتير المالية",
          used: invoicesUsed,
          limit: invoiceLimit,
          pct
        });
      }
    }
  });

  return (
    <div className="space-y-6 text-right font-sans text-white">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-500 animate-pulse" />
            <span>لوحة تحكم اشتراكات وباقات سهم SaaS</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إدارة كاملة لباقات المنصة، المزايا الفنية والمالية، الاستثناءات الخاصة بالعملاء، ومراقبة معدلات الاستهلاك.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadData}
            className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-gray-300 hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Companies */}
        <div className="bg-[#0F1724]/90 border border-[#1C2A40]/80 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-5 -mt-5 transition-all group-hover:scale-155" />
          <div className="space-y-1 z-10">
            <span className="text-xs text-gray-400 block font-bold">المنشآت النشطة</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{activeCompsCount}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 z-10">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Trial Companies */}
        <div className="bg-[#0F1724]/90 border border-[#1C2A40]/80 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-5 -mt-5 transition-all group-hover:scale-155" />
          <div className="space-y-1 z-10">
            <span className="text-xs text-gray-400 block font-bold">الاشتراكات التجريبية</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{trialCompsCount}</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 z-10">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-[#0F1724]/90 border border-[#1C2A40]/80 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl -mr-5 -mt-5 transition-all group-hover:scale-155" />
          <div className="space-y-1 z-10">
            <span className="text-xs text-gray-400 block font-bold">إجمالي فواتير المنصة شهرياً</span>
            <span className="text-2xl font-black text-sky-400 font-mono">{totalInvoicesCount}</span>
          </div>
          <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 z-10">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#1C2A40] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`py-2 px-4 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "tenants"
              ? "border-amber-500 text-amber-400 bg-slate-900/55"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>المنشآت والاشتراكات</span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`py-2 px-4 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "plans"
              ? "border-amber-500 text-amber-400 bg-slate-900/55"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>إدارة الباقات</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`py-2 px-4 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "features"
              ? "border-amber-500 text-amber-400 bg-slate-900/55"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>الصلاحيات والحدود</span>
        </button>

        <button
          onClick={() => setActiveTab("custom")}
          className={`py-2 px-4 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "custom"
              ? "border-amber-500 text-amber-400 bg-slate-900/55"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>العروض الخاصة والاستثناءات</span>
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`py-2 px-4 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer relative ${
            activeTab === "alerts"
              ? "border-amber-500 text-amber-400 bg-slate-900/55"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>تنبيهات الاستهلاك</span>
          {alertTenants.length > 0 && (
            <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
              {alertTenants.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panel Content */}
      <div className="bg-[#0F1724] border border-[#1C2A40] rounded-2xl p-5 shadow-lg min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs text-gray-400 font-bold">جاري تحميل بيانات الاشتراك...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: Tenants List */}
            {activeTab === "tenants" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>📋</span>
                    <span>قائمة اشتراكات منشآت سهم</span>
                  </h2>
                  {/* Search */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-500 absolute top-2.5 right-3" />
                    <input
                      type="text"
                      placeholder="ابحث باسم المنشأة، المالك أو رقم السجل..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-1.5 pr-9 pl-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-[#1C2A40] text-gray-400 text-[10px] uppercase font-black">
                        <th className="pb-3 text-right">المنشأة والكيان التجاري</th>
                        <th className="pb-3 text-right">الباقة النشطة</th>
                        <th className="pb-3 text-right">حالة الحساب</th>
                        <th className="pb-3 text-right">تاريخ التجديد</th>
                        <th className="pb-3 text-left">الإجراءات والتحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2A40]/30 text-xs">
                      {filteredCompanies.map(comp => {
                        const tenantId = comp.tenant_id || "";
                        const tenantSub = tenantSubscriptions.find(s => s.tenant_id === tenantId);
                        
                        // Find standard plan details
                        const currentPlan = plans.find(p => p.id === tenantSub?.plan_id) || 
                                            plans.find(p => p.name_ar === comp.subscriptionPlan) ||
                                            plans[0];

                        const status = (comp.status as string) || "active";
                        const isSuspended = status === "suspended";

                        return (
                          <tr key={comp.id} className="hover:bg-slate-900/30 transition-colors">
                            {/* Name */}
                            <td className="py-3.5 pr-1">
                              <div className="font-bold text-gray-200">{comp.name}</div>
                              <div className="text-[9.5px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span>س.ت: {comp.crNumber || "غير متوفر"}</span>
                                <span>•</span>
                                <span>المدير: {comp.managerName || "غير محدد"}</span>
                              </div>
                            </td>

                            {/* Plan */}
                            <td className="py-3.5">
                              <select
                                disabled={isUpdating === comp.id}
                                value={tenantSub?.plan_id || currentPlan?.id || "plan_free"}
                                onChange={(e) => handleChangePackage(comp, e.target.value)}
                                className="py-1 px-2 rounded bg-slate-950 border border-slate-800 text-[10.5px] text-gray-300 focus:outline-none focus:border-amber-500 text-right cursor-pointer"
                              >
                                {plans.map(p => (
                                  <option key={p.id} value={p.id}>{p.name_ar}</option>
                                ))}
                              </select>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5">
                              {isSuspended ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  معطل مؤقتاً
                                </span>
                              ) : status === "active" ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  نشط
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  تجريبي
                                </span>
                              )}
                            </td>

                            {/* Renewal Date */}
                            <td className="py-3.5 text-gray-400 font-mono text-[11px]">
                              {tenantSub?.current_period_end 
                                ? new Date(tenantSub.current_period_end).toLocaleDateString("ar-SA")
                                : comp.createdAt ? new Date(comp.createdAt).toLocaleDateString("ar-SA") : "غير محدد"}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 pl-1 text-left">
                              <div className="flex items-center gap-1.5 justify-end">
                                {/* Extend Trial */}
                                {(status === "draft" || status === "trial" || !tenantSub) && (
                                  <button
                                    disabled={isUpdating === comp.id}
                                    onClick={() => handleExtendTrial(comp)}
                                    className="py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 text-[9.5px] font-black cursor-pointer flex items-center gap-1 transition"
                                    title="تمديد التجربة 30 يوماً"
                                  >
                                    <Gift className="w-3 h-3" />
                                    <span>تمديد</span>
                                  </button>
                                )}

                                {/* Special override link */}
                                <button
                                  onClick={() => {
                                    setSelectedTenantId(comp.tenant_id || "");
                                    setActiveTab("custom");
                                  }}
                                  className="py-1 px-2 rounded bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-400 text-[9.5px] font-black cursor-pointer"
                                  title="تعديل الاستثناءات الخاصة والأسعار"
                                >
                                  استثناءات خاصة
                                </button>

                                {/* Suspend/Activate */}
                                <button
                                  disabled={isUpdating === comp.id}
                                  onClick={() => handleToggleSuspension(comp)}
                                  className={`py-1 px-2 rounded text-[9.5px] font-black cursor-pointer flex items-center gap-1 transition ${
                                    isSuspended 
                                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                                      : "bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                                  }`}
                                >
                                  {isSuspended ? (
                                    <>
                                      <ToggleLeft className="w-3 h-3" />
                                      <span>تفعيل</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="w-3 h-3" />
                                      <span>إيقاف</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Plans Management */}
            {activeTab === "plans" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>باقات النظام المعتمدة</span>
                  </h2>
                  <button
                    onClick={() => handleOpenPlanModal()}
                    className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1 shadow transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء باقة جديدة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map(p => (
                    <div 
                      key={p.id} 
                      className={`bg-slate-950/40 border rounded-2xl p-4 flex flex-col justify-between space-y-4 transition ${
                        p.is_featured ? "border-amber-500 shadow-md shadow-amber-500/5 relative" : "border-[#1C2A40]"
                      }`}
                    >
                      {p.is_featured && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[8.5px] font-black px-2 py-0.5 rounded-full">
                          موصى بها
                        </span>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-white">{p.name_ar}</span>
                          <span className="text-[10px] text-gray-500 font-mono">({p.id})</span>
                        </div>
                        <p className="text-[10.5px] text-gray-400 leading-relaxed min-h-[35px]">
                          {p.description}
                        </p>
                        <div className="border-t border-[#1C2A40] pt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">السعر الشهري:</span>
                            <span className="font-black text-emerald-400">{p.monthly_price} {p.currency}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">السعر السنوي:</span>
                            <span className="font-black text-emerald-400">{p.yearly_price} {p.currency}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">حالة الباقة:</span>
                            <span className={`font-bold ${p.status === "active" ? "text-emerald-400" : "text-rose-400"}`}>
                              {p.status === "active" ? "نشطة للعموم" : p.status === "hidden" ? "مخفية" : "غير نشطة"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-[#1C2A40] pt-3">
                        <button
                          onClick={() => handleOpenPlanModal(p)}
                          className="flex-1 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] font-bold text-gray-300 flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDeletePlan(p.id)}
                          className="py-1.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/25 text-[11px] font-bold text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Features and Limits */}
            {activeTab === "features" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#1C2A40] pb-3">
                  <div>
                    <h2 className="text-sm font-black text-white">تفصيل ميزات وحدود الباقات</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">اختر باقة معينة لإدارة حدود إصدار الفواتير، عدد الفروع، المزامنة، والوصول للذكاء الاصطناعي.</p>
                  </div>
                  {/* Select Plan */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold shrink-0">اختر الباقة:</span>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="py-1 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right cursor-pointer"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name_ar}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Features Switch Grid */}
                  <div className="bg-slate-950/20 border border-[#1C2A40]/60 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-black text-amber-400 border-b border-[#1C2A40] pb-2 flex items-center gap-1.5">
                      <Key className="w-4 h-4" />
                      <span>الميزات والخدمات المفعّلة</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: "pos", label: "نقاط البيع الكاشير POS" },
                        { key: "inventory", label: "إدارة المخازن والمستودعات" },
                        { key: "invoices", label: "إصدار الفواتير الإلكترونية" },
                        { key: "erp", label: "المحاسبة المالية ERP والزكاة" },
                        { key: "crm", label: "إدارة علاقات العملاء CRM" },
                        { key: "ai_product", label: "ذكاء سهم الاصطناعي للمنتجات" },
                        { key: "whatsapp_support", label: "تنبيهات ودعم واتساب المباشر" },
                        { key: "pdf_export", label: "تصدير تقارير PDF المتقدمة" },
                        { key: "excel_export", label: "تصدير جداول البيانات Excel" },
                        { key: "salla", label: "الربط ومزامنة متجر سلة" },
                        { key: "zid", label: "الربط ومزامنة متجر زد" },
                        { key: "backup", label: "النسخ الاحتياطي السحابي" },
                      ].map(feat => {
                        const dbFeat = planFeatures.find(f => f.feature_key === feat.key);
                        const isEnabled = dbFeat ? dbFeat.enabled : false;

                        return (
                          <div 
                            key={feat.key} 
                            onClick={() => handleFeatureToggle(feat.key, isEnabled)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:bg-slate-900/40 transition cursor-pointer select-none"
                          >
                            <span className="font-bold text-gray-300">{feat.label}</span>
                            <div className="w-8 h-4 rounded-full bg-slate-800 relative transition-all duration-300">
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
                                isEnabled ? "bg-emerald-400 left-0.5" : "bg-gray-500 right-0.5"
                              }`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Limits Input Grid */}
                  <div className="bg-slate-950/20 border border-[#1C2A40]/60 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-black text-amber-400 border-b border-[#1C2A40] pb-2 flex items-center gap-1.5">
                      <Percent className="w-4 h-4" />
                      <span>الحدود القصوى للموارد</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      {[
                        { key: "invoices", label: "الحد الأقصى للفواتير شهرياً" },
                        { key: "products", label: "الحد الأقصى للمنتجات المضافة" },
                        { key: "users", label: "الحد الأقصى للمستخدمين المضافين" },
                        { key: "branches", label: "الحد الأقصى للفروع النشطة" },
                        { key: "pos", label: "الحد الأقصى لنقاط الكاشير POS" },
                        { key: "warehouses", label: "الحد الأقصى للمستودعات" },
                        { key: "ai_requests", label: "الحد الأقصى لطلبات AI شهرياً" },
                        { key: "storage_mb", label: "حد السعة التخزينية (ميجابايت)" }
                      ].map(lim => {
                        const dbLim = planFeatures.find(f => f.feature_key === `limit_${lim.key}`);
                        const isUnlimited = dbLim ? dbLim.is_unlimited : false;
                        const limitValue = dbLim ? dbLim.limit_value : 0;

                        return (
                          <div 
                            key={lim.key} 
                            className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                          >
                            <span className="font-bold text-gray-300">{lim.label}</span>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                              <label className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isUnlimited}
                                  onChange={(e) => handleLimitChange(lim.key, limitValue, e.target.checked)}
                                  className="rounded border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-950"
                                />
                                <span className="text-[10px] text-gray-400 font-bold">بلا حدود</span>
                              </label>

                              <input
                                type="number"
                                disabled={isUnlimited}
                                value={isUnlimited ? "" : limitValue}
                                onChange={(e) => handleLimitChange(lim.key, parseInt(e.target.value) || 0, false)}
                                className="w-20 py-0.5 px-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-center text-white focus:outline-none focus:border-amber-500 disabled:opacity-30"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleSavePlanFeatures}
                    className="py-2 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ ميزات وحدود الباقة</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Custom Pricing & Special Overrides */}
            {activeTab === "custom" && (
              <div className="space-y-4">
                <div className="border-b border-[#1C2A40] pb-3">
                  <h2 className="text-sm font-black text-white">العروض الخاصة واستثناءات العملاء</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">يمكنك هنا تخصيص سعر تعاقدي خاص بالمنشأة، تمديد دورة الفوترة، أو إضافة استثناء لميزة أو حد استهلاكي بعيداً عن حدود الباقة المعيارية.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select Tenant & Custom Price */}
                  <div className="bg-slate-950/20 border border-[#1C2A40]/60 rounded-2xl p-4 space-y-4 md:col-span-1">
                    <h3 className="text-xs font-black text-amber-400 border-b border-[#1C2A40] pb-2 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>سعر العقد وتاريخ التجديد</span>
                    </h3>

                    {/* Tenant selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">اختر المنشأة المستهدفة:</label>
                      <select
                        value={selectedTenantId}
                        onChange={(e) => setSelectedTenantId(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right cursor-pointer"
                      >
                        <option value="">-- اختر منشأة تجارية --</option>
                        {rawCompanies.map(c => (
                          <option key={c.id} value={c.tenant_id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedTenantId && (
                      <>
                        {/* Custom Price input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold block">سعر مخصص شهري/سنوي (SAR):</label>
                          <input
                            type="number"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                            className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-right focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        {/* Custom Expiry Date */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold block">تاريخ نهاية الفترة / التجديد:</label>
                          <input
                            type="date"
                            value={customPeriodEnd}
                            onChange={(e) => setCustomPeriodEnd(e.target.value)}
                            className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <button
                          onClick={handleSaveCustomPricing}
                          className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition cursor-pointer"
                        >
                          تعديل السعر والمدة للعميل
                        </button>
                      </>
                    )}
                  </div>

                  {/* Overrides Management */}
                  <div className="bg-slate-950/20 border border-[#1C2A40]/60 rounded-2xl p-4 space-y-4 md:col-span-2">
                    <h3 className="text-xs font-black text-sky-400 border-b border-[#1C2A40] pb-2 flex items-center gap-1.5">
                      <Key className="w-4 h-4" />
                      <span>إدارة الاستثناءات الحالية وعنواين التجاوز</span>
                    </h3>

                    {selectedTenantId ? (
                      <div className="space-y-4">
                        {/* Add Override Form */}
                        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 space-y-3">
                          <div className="text-[11px] font-black text-gray-300">إضافة استثناء/تجاوز جديد للعميل:</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {/* Key */}
                            <select
                              value={newOverride.feature_key}
                              onChange={(e) => setNewOverride({ ...newOverride, feature_key: e.target.value })}
                              className="py-1 px-2 rounded bg-slate-950 border border-slate-800 text-xs text-white text-right cursor-pointer focus:outline-none"
                            >
                              <option value="pos">ميزة POS</option>
                              <option value="inventory">ميزة إدارة المستودعات</option>
                              <option value="erp">ميزة ERP والمحاسبة</option>
                              <option value="ai_product">ميزة AI للمنتجات</option>
                              <option value="salla">ميزة ربط متجر سلة</option>
                              <option value="limit_invoices">حد الفواتير</option>
                              <option value="limit_products">حد المنتجات</option>
                              <option value="limit_users">حد المستخدمين</option>
                              <option value="limit_branches">حد الفروع</option>
                              <option value="limit_pos">حد أجهزة الكاشير</option>
                              <option value="limit_ai_requests">حد طلبات AI</option>
                            </select>

                            {/* Val / Enable */}
                            {newOverride.feature_key?.startsWith("limit_") ? (
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={newOverride.is_unlimited || false}
                                    onChange={(e) => setNewOverride({ ...newOverride, is_unlimited: e.target.checked })}
                                  />
                                  <span>بلا حدود</span>
                                </label>
                                {!newOverride.is_unlimited && (
                                  <input
                                    type="number"
                                    placeholder="الحد الأقصى"
                                    value={newOverride.limit_value || 0}
                                    onChange={(e) => setNewOverride({ ...newOverride, limit_value: parseInt(e.target.value) || 0 })}
                                    className="w-16 py-0.5 px-2 rounded bg-slate-950 border border-slate-800 text-xs text-center text-white font-mono"
                                  />
                                )}
                              </div>
                            ) : (
                              <select
                                value={newOverride.enabled ? "true" : "false"}
                                onChange={(e) => setNewOverride({ ...newOverride, enabled: e.target.value === "true" })}
                                className="py-1 px-2 rounded bg-slate-950 border border-slate-800 text-xs text-white text-right cursor-pointer focus:outline-none"
                              >
                                <option value="true">تفعيل الخدمة</option>
                                <option value="false">تعطيل الخدمة</option>
                              </select>
                            )}

                            {/* Reason */}
                            <input
                              type="text"
                              placeholder="السبب (مثال: خصم تعاقدي)"
                              value={newOverride.reason || ""}
                              onChange={(e) => setNewOverride({ ...newOverride, reason: e.target.value })}
                              className="py-1 px-2 rounded bg-slate-950 border border-slate-800 text-xs text-white text-right focus:outline-none"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={handleAddOverride}
                              className="py-1 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10.5px] font-black shadow transition cursor-pointer"
                            >
                              إضافة وتطبيق الاستثناء
                            </button>
                          </div>
                        </div>

                        {/* Overrides list */}
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-gray-400">الاستثناءات المفعلة حالياً للعميل:</div>
                          {allTenantOverrides[selectedTenantId]?.length > 0 ? (
                            <div className="divide-y divide-[#1C2A40]/40 text-[11px]">
                              {allTenantOverrides[selectedTenantId].map(ovr => (
                                <div key={ovr.id} className="py-2 flex items-center justify-between gap-3 text-right">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-gray-200 font-mono">
                                      {ovr.feature_key === "pos" ? "كاشير POS" :
                                       ovr.feature_key === "inventory" ? "إدارة المستودعات" :
                                       ovr.feature_key === "erp" ? "ERP والمحاسبة" :
                                       ovr.feature_key === "ai_product" ? "AI المنتجات" :
                                       ovr.feature_key === "limit_invoices" ? "حد الفواتير" :
                                       ovr.feature_key === "limit_products" ? "حد المنتجات" :
                                       ovr.feature_key === "limit_users" ? "حد المستخدمين" :
                                       ovr.feature_key === "limit_branches" ? "حد الفروع" :
                                       ovr.feature_key === "limit_pos" ? "حد نقاط البيع" :
                                       ovr.feature_key === "limit_ai_requests" ? "حد طلبات AI" : ovr.feature_key}
                                    </span>
                                    <span className="text-gray-500 mr-2">({ovr.reason})</span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-black font-mono text-emerald-400">
                                      {ovr.feature_key.startsWith("limit_") 
                                        ? (ovr.is_unlimited ? "بلا حدود" : `${ovr.limit_value} مستند`)
                                        : (ovr.enabled ? "نشط" : "معطل")}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteOverride(ovr.id)}
                                      className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                                      title="حذف الاستثناء"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic py-2">لا توجد استثناءات مخصصة، العميل يعمل بالحدود الافتراضية للباقة الحالية.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-1.5 italic text-xs">
                        <span>الرجاء اختيار المنشأة من القائمة لعرض وإدارة استثناءات الخدمة الفنية.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Usage & Alerts */}
            {activeTab === "alerts" && (
              <div className="space-y-4">
                <div className="border-b border-[#1C2A40] pb-3">
                  <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>تنبيهات استهلاك حدود الباقات للعملاء</span>
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">يعرض هذا القسم المنشآت التي استهلكت أكثر من 85% من حدود الفواتير أو الموارد للحد من التجاوزات وضمان الترقية المناسبة.</p>
                </div>

                {alertTenants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alertTenants.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-slate-950/40 border rounded-2xl p-4 flex items-center justify-between shadow transition ${
                          alert.pct >= 100 
                            ? "border-rose-500/40 bg-rose-500/5" 
                            : "border-amber-500/40 bg-amber-500/5"
                        }`}
                      >
                        <div className="space-y-1.5 text-right">
                          <div className="font-bold text-gray-200 text-xs">{alert.comp.name}</div>
                          <div className="text-[10px] text-gray-400">
                            استهلاك مورد <span className="font-black text-gray-300">{alert.resource}</span>
                          </div>
                          <div className="text-[11px] font-mono font-bold text-gray-300">
                            {alert.used.toLocaleString()} / {alert.limit.toLocaleString()} مستند
                          </div>
                        </div>

                        <div className="text-left flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            alert.pct >= 100 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {alert.pct >= 100 ? "تم تجاوز الحد" : "اقترب من الحد"} ({alert.pct}%)
                          </span>
                          <button
                            onClick={() => {
                              setSelectedTenantId(alert.comp.tenant_id || "");
                              setActiveTab("custom");
                            }}
                            className="py-1 px-2 bg-slate-900 border border-slate-800 text-[9px] font-black text-sky-400 rounded-lg hover:bg-slate-800"
                          >
                            تعديل الحد المخصص
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-bold text-gray-400">جميع العملاء والمنشآت داخل النطاق الآمن للاستهلاك المعياري.</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Plans Modal Form */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0F1724] border border-[#1C2A40] rounded-2xl max-w-md w-full p-5 shadow-2xl text-right space-y-4 my-8">
            <div className="border-b border-[#1C2A40] pb-2 flex justify-between items-center">
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
              <h3 className="text-xs font-black text-amber-400">
                {editingPlan ? `تعديل باقة: ${editingPlan.name_ar}` : "إنشاء باقة جديدة للنظام"}
              </h3>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              {/* ID */}
              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">معرف الباقة (ID فريد بالإنجليزية):</label>
                <input
                  type="text"
                  disabled={editingPlan !== null}
                  value={planForm.id}
                  onChange={(e) => setPlanForm({ ...planForm, id: e.target.value })}
                  placeholder="plan_enterprise"
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 text-left font-mono"
                  required
                />
              </div>

              {/* Name AR */}
              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">اسم الباقة (عربي):</label>
                <input
                  type="text"
                  value={planForm.name_ar}
                  onChange={(e) => setPlanForm({ ...planForm, name_ar: e.target.value })}
                  placeholder="باقة سهم اللوجستية"
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              {/* Name EN */}
              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">اسم الباقة (إنجليزي):</label>
                <input
                  type="text"
                  value={planForm.name_en}
                  onChange={(e) => setPlanForm({ ...planForm, name_en: e.target.value })}
                  placeholder="Sahm Logistic Plan"
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-left font-mono"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">وصف الباقة بالكامل:</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  rows={2}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                  required
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">السعر الشهري (SAR):</label>
                  <input
                    type="number"
                    value={planForm.monthly_price}
                    onChange={(e) => setPlanForm({ ...planForm, monthly_price: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">السعر السنوي (SAR):</label>
                  <input
                    type="number"
                    value={planForm.yearly_price}
                    onChange={(e) => setPlanForm({ ...planForm, yearly_price: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center font-mono"
                    required
                  />
                </div>
              </div>

              {/* Status & Featured & Sort order */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">ترتيب الظهور:</label>
                  <input
                    type="number"
                    value={planForm.sort_order}
                    onChange={(e) => setPlanForm({ ...planForm, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">الحالة:</label>
                  <select
                    value={planForm.status}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as any })}
                    className="w-full py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-white text-right cursor-pointer"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">غير نشطة</option>
                    <option value="hidden">مخفية</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer justify-end select-none">
                    <input
                      type="checkbox"
                      checked={planForm.is_featured}
                      onChange={(e) => setPlanForm({ ...planForm, is_featured: e.target.checked })}
                      className="rounded border-slate-800 text-amber-500 bg-slate-950 focus:ring-0"
                    />
                    <span className="text-[10px] text-gray-400 font-black">باقة مميزة</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition cursor-pointer"
                >
                  حفظ الباقة
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-gray-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
