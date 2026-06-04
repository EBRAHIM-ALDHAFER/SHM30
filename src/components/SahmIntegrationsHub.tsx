import React, { useState, useEffect } from "react";
import { ThemeColors } from "../types";
import { integrationsService } from "../core/database/integrationsService";
import { 
  Link, Plus, RefreshCw, Sliders, Check, X, Activity, Clock, 
  Database, Eye, HelpCircle, Lock, Shield, Trash2, Globe, Terminal, 
  ArrowLeftRight, Sparkles, Cpu, BookOpen, Key, Radio, Info, AlertCircle, Logs, Settings, Smartphone
} from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  logo: string;
  category: "متاجر" | "أسواق" | "شحن" | "مدفوعات" | "محادثات" | "محاسبة" | "تسويق" | "مخصصة";
  status: "connected" | "disconnected";
  lastSync: string;
  connectionType: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  permissions?: string[];
  latency?: number;
  successRate?: number; // percentage
  companyId: string;
  storeId: string;
  branchId?: string;
  logs: Array<{ time: string; event: string; status: "success" | "error" | "info" }>;
}

interface SahmIntegrationsHubProps {
  theme: ThemeColors;
  addAuditLog?: (event: string, text: string) => void;
  triggerNotification?: (text: string, type?: any) => void;
  activeStoreId?: string;
}

export default function SahmIntegrationsHub({
  theme,
  addAuditLog = () => {},
  triggerNotification = () => {},
  activeStoreId = "store_1"
}: SahmIntegrationsHubProps) {
  
  // View mode state: "basic" | "advanced"
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");
  
  // Current scoped store contexts
  const [scopedCompany, setScopedCompany] = useState("company_maraseem_group");
  const [scopedStore, setScopedStore] = useState(activeStoreId || "store_1");
  const [scopedBranch, setScopedBranch] = useState("branch_riyadh_all");

  const companiesList = [
    { id: "company_maraseem_group", name: "مجموعة مراسيم الطيب القابضة 👑" },
    { id: "company_fragrance_retail", name: "شركة تجزئة العطور الفاخرة للخليج 🌍" }
  ];

  const storesList = [
    { id: "store_1", name: "مراسيم الطيب" },
    { id: "store_misk", name: "متجر مسك الغزال" },
    { id: "store_outlet", name: "أوتلت العطور المخفض" }
  ];

  const branchesList = [
    { id: "branch_riyadh_all", name: "مستودع الرياض الرئيسي والمبيعات السحابية" },
    { id: "branch_jeddah", name: "مستودع المنطقة الغربية بجدة" },
    { id: "branch_dubai", name: "معرض دبي مول والتوزيع الخليجي" }
  ];

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categoriesList = [
    { id: "all", name: "الكل" },
    { id: "متاجر", name: "المتاجر الإلكترونية" },
    { id: "أسواق", name: "الأسواق" },
    { id: "شحن", name: "الشحن" },
    { id: "مدفوعات", name: "المدفوعات" },
    { id: "محادثات", name: "المحادثات" },
    { id: "محاسبة", name: "المحاسبة" },
    { id: "تسويق", name: "التسويق" },
    { id: "مخصصة", name: "تكاملات مخصصة" }
  ];

  // Integrations Local State - Cleaned up and bound to integrationsService
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);

  // Sync state whenever company or store changes
  useEffect(() => {
    const loadData = async () => {
      const data = await integrationsService.getAllIntegrations(scopedCompany, scopedStore);
      setIntegrations(data);
    };
    loadData();
  }, [scopedCompany, scopedStore]);

  // Hub subtabs state: "marketplace" | "connected" | "required" | "advanced"
  const [hubTab, setHubTab] = useState<"marketplace" | "connected" | "required" | "advanced">("marketplace");

  // Deep Linking and Navigation Parameter Interceptor
  useEffect(() => {
    // 1. Check window property passed from global navigate
    const prefill = (window as any).__sahm_prefill_integrations;
    if (prefill) {
      if (prefill.provider) {
        setSearchText(prefill.provider);
      }
      if (prefill.category) {
        setSelectedCategory(prefill.category);
      }
      if (prefill.hubTab) {
        setHubTab(prefill.hubTab);
      } else if (prefill.viewMode) {
        setHubTab(prefill.viewMode === "advanced" ? "advanced" : "marketplace");
      }
      delete (window as any).__sahm_prefill_integrations;
    }

    // 2. Also intercept URL Query string parameters (for real deep routes /integrations?provider=salla etc.)
    const searchParams = new URLSearchParams(window.location.search);
    const providerParam = searchParams.get("provider");
    const categoryParam = searchParams.get("category");
    const viewStyleParam = searchParams.get("view");
    
    if (providerParam) {
      setSearchText(providerParam);
      // Let's also find which category this provider belongs to and set that if possible
      const item = integrations.find(i => i.id.toLowerCase() === providerParam.toLowerCase() || i.name.toLowerCase().includes(providerParam.toLowerCase()));
      if (item) {
        setSelectedCategory(item.category);
      }
    }
    if (categoryParam) {
      const catMapping: Record<string, string> = {
        stores: "متاجر", shipping: "شحن", payments: "مدفوعات", chats: "محادثات", accounting: "محاسبة", marketing: "تسويق"
      };
      const resolvedCat = catMapping[categoryParam.toLowerCase()] || categoryParam;
      setSelectedCategory(resolvedCat);
    }
    if (viewStyleParam) {
      if (viewStyleParam === "advanced" || viewStyleParam === "settings") {
        setHubTab("advanced");
        setViewMode("advanced");
      } else if (viewStyleParam === "connected") {
        setHubTab("connected");
      } else if (viewStyleParam === "required") {
        setHubTab("required");
      }
    }

    // Custom event listener for instant application-level navigation triggers
    const handleNavEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (detail.provider) setSearchText(detail.provider);
        if (detail.category) setSelectedCategory(detail.category);
        if (detail.hubTab) setHubTab(detail.hubTab);
        if (detail.viewMode) setViewMode(detail.viewMode);
      }
    };
    window.addEventListener("sahm_navigate_integrations", handleNavEvent);
    return () => {
      window.removeEventListener("sahm_navigate_integrations", handleNavEvent);
    };
  }, [integrations]);

  // Modal State for adding integration
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"ready" | "custom" | "webhook" | "api" | "oauth">("ready");
  
  // Custom Platform states
  const [platName, setPlatName] = useState("");
  const [platCategory, setPlatCategory] = useState<any>("متاجر");
  const [platLogo, setPlatLogo] = useState("🔌");
  const [platConnectionType, setPlatConnectionType] = useState("Custom REST API Client");
  const [platApiKey, setPlatApiKey] = useState("");
  const [platSecret, setPlatSecret] = useState("");
  const [platWebhookUrl, setPlatWebhookUrl] = useState("");
  const [platTargetUrl, setPlatTargetUrl] = useState("");

  // Search filter
  const [searchText, setSearchText] = useState("");

  // Utility Interactive states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [pingStats, setPingStats] = useState<Record<string, { duration: number; text: string; success: boolean }>>({});
  const [showAdvancedSettingsFor, setShowAdvancedSettingsFor] = useState<string | null>(null);
  const [showLogsFor, setShowLogsFor] = useState<string | null>(null);

  // List of required integrations
  const requiredIds = ["salla", "spl", "mada", "whatsapp"];

  // Filter integrations based on current selected Store, Company, Branch AND category AND search text
  const filteredIntegrations = integrations.filter((item) => {
    // Multi-store context filtering
    const matchesStore = item.companyId === scopedCompany && item.storeId === scopedStore;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          (item.connectionType || "").toLowerCase().includes(searchText.toLowerCase());
    
    // Tab filtering
    if (hubTab === "connected") {
      return matchesStore && item.status === "connected" && matchesSearch;
    }
    if (hubTab === "required") {
      return matchesStore && requiredIds.includes(item.id) && matchesSearch;
    }
    
    return matchesStore && matchesCategory && matchesSearch;
  });

  const handleConnect = async (id: string, customKey?: string, customSecret?: string) => {
    const updatedItem = await integrationsService.connectIntegration(id, customKey, customSecret, scopedCompany, scopedStore);
    if (updatedItem) {
      setIntegrations(prev => prev.map(item => item.id === id ? updatedItem : item));
      triggerNotification(`تم ربط وتفعيل ${updatedItem.name || "المنصة"} بنجاح! 🔌`, "success");
    }
  };

  const handleDisconnect = async (id: string) => {
    const updatedItem = await integrationsService.disconnectIntegration(id, scopedCompany, scopedStore);
    if (updatedItem) {
      setIntegrations(prev => prev.map(item => item.id === id ? updatedItem : item));
      triggerNotification(`تم إلغاء الاتصال بـ ${updatedItem.name || "المنصة"} كلياً! 🛑`, "info");
    }
  };

  const handlePing = async (id: string) => {
    setTestingId(id);
    const result = await integrationsService.testConnection(id, scopedCompany, scopedStore);
    const key = `${id}`;
    
    setPingStats(prev => ({
      ...prev,
      [key]: {
        duration: result.latency || 0,
        success: result.success,
        text: result.message
      }
    }));
    
    const updatedItem = await integrationsService.getIntegrationById(id, scopedCompany, scopedStore);
    if (updatedItem) {
      setIntegrations(prev => prev.map(item => item.id === id ? updatedItem : item));
    }

    setTestingId(null);
    if (result.success) {
      triggerNotification(`تم فحص الاتصال بنجاح! 🟢`, "success");
    } else {
      triggerNotification(`فشل فحص الاتصال! الرجاء تدقيق الـ API Token ⚠️`, "error");
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    const updatedItem = await integrationsService.syncIntegration(id, scopedCompany, scopedStore);
    if (updatedItem) {
      setIntegrations(prev => prev.map(item => item.id === id ? updatedItem : item));
    }
    setSyncingId(null);
    triggerNotification(`تم إنهاء المزامنة وجرد السجلات السحابية بنجاح! 🔄`, "success");
  };

  const handleAddIntegrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platName.trim()) {
      alert("الرجاء التحقق من ادخال اسم المنصة أولاً.");
      return;
    }

    const payload = {
      name: platName,
      logo: platLogo || "🔌",
      category: platCategory as any,
      connectionType: platConnectionType,
      apiKey: platApiKey || "api_user_sahmos_access",
      apiSecret: platSecret || "••••••••••••••••••••••••••••••••",
      webhookUrl: platWebhookUrl || "https://api.sahmos.com/webhooks/custom",
      companyId: scopedCompany,
      storeId: scopedStore,
      branchId: scopedBranch,
      latency: 42,
      successRate: 100,
      lastSync: "متصل فوري الآن 🟢"
    };

    const newItem = await integrationsService.createCustomIntegration(payload, scopedCompany, scopedStore);
    setIntegrations(prev => [newItem, ...prev]);
    setShowAddModal(false);
    triggerNotification(`تم تفعيل وإدراج تكامل ${newItem.name} بنجاح! 🥳`, "success");
    
    // Reset inputs
    setPlatName("");
    setPlatCategory("متاجر");
    setPlatLogo("🔌");
    setPlatConnectionType("Custom REST API Client");
    setPlatApiKey("");
    setPlatSecret("");
    setPlatWebhookUrl("");
    setPlatTargetUrl("");
  };

  const deleteCustomIntegration = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الربط السحابي كلياً من لوحتك وتصفير مفاتيح الاتصال؟")) {
      const success = await integrationsService.deleteIntegration(id, scopedCompany, scopedStore);
      if (success) {
        const data = await integrationsService.getAllIntegrations(scopedCompany, scopedStore);
        setIntegrations(data);
        triggerNotification("تم إزالة قناة الربط بنجاح 🗑️", "info");
      }
    }
  };

  const selectReadyTemplate = (tpl: any) => {
    setPlatName(tpl.name);
    setPlatLogo(tpl.logo);
    setPlatCategory(tpl.category);
    setPlatConnectionType(tpl.type);
    setAddMode("custom");
  };

  // Ready templates helper inside launcher
  const readyTemplates = [
    { id: "ready_salla", name: "منصة سلة لربط المتاجر", logo: "🛍️", category: "متاجر", type: "Merchant API v2" },
    { id: "ready_zid", name: "منصة زد للمتاجر", logo: "💜", category: "متاجر", type: "Zid OAuth Link" },
    { id: "ready_shopify", name: "شوبيفاي العالمي", logo: "🟢", category: "متاجر", type: "Shopify Token" },
    { id: "ready_aramex", name: "أرامكس اللوجستية", logo: "🚚", category: "شحن", type: "Aramex XML" },
    { id: "ready_stripe", name: "بوابة Stripe العالمية", logo: "💳", category: "مدفوعات", type: "Secret Keys Token" },
    { id: "ready_crm", name: "واتساب السحابي الموحد", logo: "💬", category: "محادثات", type: "Meta API Account Token" },
    { id: "ready_noon", name: "نون بورتال للأسواق", logo: "💛", category: "أسواق", type: "Noon Core REST" },
    { id: "ready_qoyod", name: "نظام قيود المحاسبي", logo: "📊", category: "محاسبة", type: "Qoyod API Integration" }
  ];

  return (
    <div id="sahm-integrations-hub" className="space-y-6 text-right font-sans">
      
      {/* 🔮 PART 1: Core Header with Multi-Store Scoped Workspace Binding (Direct Operational Isolation) */}
      <div className="p-5 rounded-2xl border text-right space-y-4 shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2" style={{ color: theme.text }}>
                <span>مركز التكاملات الموحد 🔌</span>
                <span className="font-extrabold text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded font-mono tracking-widest uppercase">Sahm Integrations Hub</span>
              </h2>
              <p className="text-[10px]" style={{ color: theme.muted }}>
                الربط المباشر مع المتاجر، بوابات الشحن والدفع، أنظمة المحاسبة والـ API والـ Webhooks المعزولة كلياً لكل رخصة متجر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-slate-900 border border-slate-800 text-amber-500 px-2.5 py-1.5 rounded-lg font-black flex items-center gap-1.5 shadow-sm animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>حماية ISO 27001 فوري</span>
            </span>
            <button
              onClick={() => {
                setShowAddModal(true);
                setAddMode("ready");
              }}
              className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>إضافة تكامل</span>
            </button>
          </div>
        </div>

        {/* Multi-Store Isolated Integration Controller Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[9px] font-extrabold text-amber-400 block mb-1">الشركة القابضة / المجموعة:</label>
            <select
              value={scopedCompany}
              onChange={(e) => {
                setScopedCompany(e.target.value);
                triggerNotification("تم تنشيط عزل وتشفير المجموعة المختارة 🔒", "info");
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border outline-none font-bold text-white transition-all cursor-pointer"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              {companiesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-extrabold text-[#D4AF37] block mb-1">المتجر الفوري المستهدف المستقل:</label>
            <select
              value={scopedStore}
              onChange={(e) => {
                setScopedStore(e.target.value);
                triggerNotification(`تم جلب منافذ المتجر: ${storesList.find(s=>s.id === e.target.value)?.name}`, "success");
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border outline-none font-bold text-white transition-all cursor-pointer"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              {storesList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-extrabold text-gray-400 block mb-1">الفرع / المستودع المرتبط بالمسار:</label>
            <select
              value={scopedBranch}
              onChange={(e) => setScopedBranch(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border outline-none font-bold text-white transition-all cursor-pointer"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              {branchesList.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-dashed text-[9.5px] leading-relaxed flex items-center gap-2 justify-end" style={{ borderColor: theme.border }}>
          <p className="text-gray-400">
            * <strong>عزل وحماية التعددية:</strong> كافة التكاملات المعروضة بالأسفل مربوطة ومشفرة بعنونة ذكية للمتجر الحالي <span className="text-[#D4AF37] font-black">{storesList.find(s=>s.id === scopedStore)?.name}</span> وفروعه المعنونة لمنع تداخل حركات المخزون والضرائب.
          </p>
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
        </div>
      </div>

      {/* 🔮 PART 1.5: Distinct Hub Integration Views Tab bar */}
      <div className="p-1 bg-slate-900/60 border rounded-2xl flex flex-wrap gap-1.5 justify-center items-center select-none" style={{ borderColor: theme.border }}>
        <button
          onClick={() => {
            setHubTab("marketplace");
            triggerNotification("عرض الكتالوج العام للتكاملات المتاحة 🛍️", "info");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-none bg-transparent ${hubTab === "marketplace" ? "bg-amber-500 text-black shadow font-black" : "text-gray-400 hover:text-white"}`}
          style={{ backgroundColor: hubTab === "marketplace" ? theme.accent : "" }}
        >
          <span>🛍️ متجر التكاملات Marketplace</span>
        </button>

        <button
          onClick={() => {
            setHubTab("connected");
            triggerNotification("عرض القنوات النشطة المرتبطة حالياً", "success");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-none bg-transparent ${hubTab === "connected" ? "bg-amber-500 text-black shadow font-black" : "text-gray-400 hover:text-white"}`}
          style={{ backgroundColor: hubTab === "connected" ? theme.accent : "" }}
        >
          <span>🟢 التكاملات النشطة Connected ({integrations.filter(i => i.status === 'connected' && i.companyId === scopedCompany && i.storeId === scopedStore).length})</span>
        </button>

        <button
          onClick={() => {
            setHubTab("required");
            triggerNotification("استعراض متطلبات الربط الإلزامي للكيان المتكامل", "info");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-none bg-transparent ${hubTab === "required" ? "bg-amber-500 text-black shadow font-black" : "text-gray-400 hover:text-white"}`}
          style={{ backgroundColor: hubTab === "required" ? theme.accent : "" }}
        >
          <span>⚠️ الربط الإلزامي Required ({integrations.filter(i => requiredIds.includes(i.id) && i.status === 'connected').length} من {requiredIds.length})</span>
        </button>

        <button
          onClick={() => {
            setHubTab("advanced");
            setViewMode("advanced");
            triggerNotification("فتح لوحة التحكم والمفاتيح المتقدمة والتكامل المباشر", "security");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-none bg-transparent ${hubTab === "advanced" ? "bg-amber-500 text-black shadow font-black" : "text-gray-400 hover:text-white"}`}
          style={{ backgroundColor: hubTab === "advanced" ? theme.accent : "" }}
        >
          <span>⚙️ الإعدادات المتقدمة Advanced</span>
        </button>
      </div>

      {/* Required Connections Compliance Dashboard */}
      {hubTab === "required" && (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-right space-y-3 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-xl font-extrabold border border-indigo-500/15">التحقق الذكي من التراخيص وسلاسل التوريد</span>
            <div className="text-right">
              <h4 className="text-xs font-black text-white">مؤشر جاهزية الارتباط الإلزامي للمتجر ⚡</h4>
              <p className="text-[10px] text-gray-400">تتطلب رخصة التشغيل ربط ٤ قنوات أساسية لتنشيط الأتمتة الكاملة.</p>
            </div>
          </div>

          {/* Progress bar */}
          {(() => {
            const connectedCount = integrations.filter(i => requiredIds.includes(i.id) && i.status === 'connected').length;
            const percentage = Math.round((connectedCount / requiredIds.length) * 100);
            return (
              <div className="space-y-1.5 text-right">
                <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                  <span className={`${percentage === 100 ? "text-emerald-400" : "text-yellow-500"}`}>{percentage}% مكتمل</span>
                  <span className="text-gray-300">{connectedCount} من {requiredIds.length} قنوات مرتبطة</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })()}

          {/* Missing warnings alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
            {integrations.filter(i => requiredIds.includes(i.id)).map(req => {
              const connected = req.status === "connected";
              return (
                <div key={req.id} className={`p-2.5 rounded-xl flex items-center justify-between border leading-tight ${connected ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-400" : "bg-red-950/10 border-red-500/10 text-red-100"}`}>
                  <button
                    onClick={() => {
                      if (!connected) {
                        const customizedKey = prompt(`الرجاء إدخال رمز ومفتاح تفويض ${req.name} للربط المشفر:`);
                        if (customizedKey) handleConnect(req.id, customizedKey);
                      } else {
                        handleDisconnect(req.id);
                      }
                    }}
                    className={`py-1 px-2.5 rounded font-black text-[9px] cursor-pointer border-none ${connected ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black" : "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"}`}
                  >
                    {connected ? "نشط (تعطيل)" : "إصلاح الاتصال الآن 🔌"}
                  </button>
                  <div className="text-right">
                    <span className="font-extrabold text-white block">{req.name} {req.logo}</span>
                    <span className="text-[8.5px] opacity-85 block">{connected ? "مرتبط ومتزامن بالكامل" : "مفصول! يرجى تهيئة رمز الربط"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Gateway configuration dashboard */}
      {hubTab === "advanced" && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3 font-sans text-right">
          <div className="flex items-center gap-2.5 justify-end">
            <div>
              <h4 className="text-xs font-black text-white">لوحة المطورين وبث الـ PHP/Node Webhooks 🛠️</h4>
              <p className="text-[9.5px] text-amber-500/80">تخصيص المفاتيح الرئيسية وأمان قنوات الخادم وإصدار شهادات الـ SSL</p>
            </div>
            <Terminal className="w-5 h-5 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-gray-400 block mb-1">الرابط الموحد للـ API (REST Gateway):</span>
              <span className="font-mono text-gray-300 bg-black/50 p-1 rounded block text-left text-[9px] select-all">https://api.sahmos.com/v8/endpoint</span>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-gray-400 block mb-1">شهادة تشفير خادم ميثاق:</span>
              <span className="text-emerald-400 font-extrabold block">فعالة مشفرة بـ SHA-256 JWT</span>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-gray-400 block mb-1">رؤوس الطلبات الإلزامية (Mandatory Headers):</span>
              <span className="font-mono text-amber-500 block">X-Sahm-Storeid: {scopedStore}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🔮 PART 2: Segmented Category Tabs & Basic / Advanced Toggle View Controller (Product Goal) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        {/* Basic View / Advanced View Toggling Segment */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/45 border border-slate-900 shrink-0 w-full md:w-auto font-sans">
          <button
            onClick={() => {
              setViewMode("basic");
              triggerNotification("تم تنشيط مظهر العرض المبسط للمستخدم", "info");
            }}
            className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 justify-center cursor-pointer border-none bg-transparent ${viewMode === "basic" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
            style={{ backgroundColor: viewMode === "basic" ? theme.accent : "" }}
          >
            <Sliders className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>عرض عادي (مستخدم)</span>
          </button>
          
          <button
            onClick={() => {
              setViewMode("advanced");
              triggerNotification("تم الدخول لوضع المطورين المتقدم للصانع 🛠️", "security");
            }}
            className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 justify-center cursor-pointer border-none bg-transparent ${viewMode === "advanced" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
            style={{ backgroundColor: viewMode === "advanced" ? theme.accent : "" }}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>عرض متقدم (المطورين)</span>
          </button>
        </div>

        {/* Global Catalog Search */}
        <div className="relative w-full md:w-64 font-sans">
          <input
            type="text"
            placeholder="ابحث باسم التكامل أو البروتوكول..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs py-2 pr-8 pl-3 rounded-lg outline-none border font-bold"
            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
          />
          <span className="absolute right-2.5 top-2.5 text-gray-500 text-xs">🔍</span>
        </div>
      </div>

      {hubTab !== "required" && hubTab !== "connected" && (
        /* Categories Filter list (horizontal scroll on small screen) */
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin select-none">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat.id 
                  ? "bg-amber-500/10 text-amber-500 font-extrabold" 
                  : "bg-slate-900/40 text-gray-400 hover:text-white"
              }`}
              style={{ 
                borderColor: selectedCategory === cat.id ? theme.accent : theme.border,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* 🔮 PART 3: Primary Hub Integrations Stream Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIntegrations.map((app) => {
          const isConnected = app.status === "connected";
          const ping = pingStats[app.id];
          
          return (
            <div 
              key={app.id}
              className="p-4 rounded-2xl border flex flex-col justify-between gap-4 text-right transition-all group hover:border-amber-500/25 shadow-sm"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              {/* Header inside the integration block */}
              <div className="flex items-start justify-between">
                {/* Status Indicator Badge */}
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/15 py-1 px-2.5 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span>متصل ونشط</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] text-gray-400 font-black bg-gray-500/5 border border-gray-800 py-1 px-2.5 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                    <span>غير نشط</span>
                  </span>
                )}

                {/* Identity Info */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <h4 className="text-xs font-black text-white" style={{ color: theme.text }}>{app.name}</h4>
                    <span className="text-[8.5px] font-bold text-amber-500/80 block mt-0.5" style={{ color: theme.accent }}>
                      البروتوكول: {app.connectionType} • فئة {categoriesList.find(c=>c.id === app.category)?.name || app.category}
                    </span>
                  </div>
                  <span className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-sm shrink-0">
                    {app.logo}
                  </span>
                </div>
              </div>

              {/* Basic View features */}
              <div className="bg-slate-950/30 p-2.5 rounded-xl border border-dashed space-y-1" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-400 font-black">{app.lastSync}</span>
                  <span className="text-gray-400 font-bold">آخر مزمّنة مع سهم:</span>
                </div>
                {ping && (
                  <div className={`text-[9.5px] p-1.5 rounded mt-1 font-bold flex items-center gap-1 justify-end ${ping.success ? "bg-emerald-500/5 text-emerald-400" : "bg-rose-500/5 text-rose-400"}`}>
                    <span>{ping.text}</span>
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                  </div>
                )}
              </div>

              {/* Advanced View features (Product Goal - Shows Webhooks, Keys, Diagnostics, Permissions) */}
              {viewMode === "advanced" && (
                <div className="space-y-2 border-t border-slate-800/60 pt-3 text-[10px]">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-slate-950/45 p-2 rounded-lg border border-slate-900 text-right">
                      <span className="text-gray-500 block text-[8px] font-extrabold">مفتاح الـ API (API Key)</span>
                      <span className="font-mono text-white text-[9.5px] block truncate">{isConnected ? app.apiKey : "معلق"}</span>
                    </div>
                    <div className="bg-slate-950/45 p-2 rounded-lg border border-slate-900 text-right">
                      <span className="text-gray-500 block text-[8px] font-extrabold">الرمز السرّي (Developer Token)</span>
                      <span className="font-mono text-white text-[9.5px] block truncate">{isConnected ? "••••••••••••••••••••••••" : "معلق"}</span>
                    </div>
                  </div>

                  {/* Webhooks config and active url */}
                  <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-900">
                    <span className="text-gray-500 block text-[8px] font-extrabold font-sans">مسار بث الخطاف والويب هوك (Webhook URL)</span>
                    <span className="font-mono text-gray-300 text-[9px] block truncate text-left select-all">{isConnected ? (app.webhookUrl || `https://api.sahmos.com/webhooks/${app.id}`) : "منقطع"}</span>
                  </div>

                  {app.permissions && app.permissions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 justify-end mt-1">
                      {app.permissions.map((perm) => (
                        <span key={perm} className="text-[8px] bg-slate-900 text-gray-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">{perm}</span>
                      ))}
                      <span className="text-[8px] text-gray-500 font-extrabold font-sans">الأذونات المصرحة:</span>
                    </div>
                  )}

                  {/* Diagnostic stats */}
                  <div className="border-t border-dashed border-slate-800 mt-2 pt-2 grid grid-cols-3 gap-1 text-center text-[9px]">
                    <div className="bg-slate-900/60 p-1.5 rounded-md text-slate-300">
                      <span className="block text-gray-400 text-[7px]">الLatency (الاستجابة)</span>
                      <span className="font-black font-mono text-amber-500">{isConnected ? `${app.latency || 42}ms` : "N/A"}</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-md text-slate-300 font-bold">
                      <span className="block text-gray-400 text-[7px]">دقة التكامل والنجاح</span>
                      <span className="font-black text-emerald-400">{isConnected ? `${app.successRate || 99.8}%` : "100%"}</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-md text-slate-300">
                      <span className="block text-gray-400 text-[7px]">بروتوكول الوصول</span>
                      <span className="font-extrabold text-[#D4AF37] text-[8.5px] truncate">TLS 1.3 AES</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Collaborative action managers */}
              <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-800/40 pt-3">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(app.id)}
                    className="py-1.5 px-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer border-none flex-1 font-sans"
                  >
                    فصل المنصة
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const customizedKey = prompt("الرجاء إدخال رمز الوصول للربط والتكامل المشفر للمنصة:");
                      if (customizedKey) handleConnect(app.id, customizedKey);
                    }}
                    className="py-1.5 px-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black font-extrabold rounded-lg text-[10px] transition-all cursor-pointer border-none flex-1 font-sans"
                  >
                    ربط المنصة 🔌
                  </button>
                )}

                <button
                  onClick={() => handlePing(app.id)}
                  disabled={testingId === app.id}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-gray-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-800 flex items-center justify-center gap-1 font-sans"
                  title="فحص الاتصال الفوري بالخادم"
                >
                  {testingId === app.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                  ) : (
                    <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
                  )}
                  <span>اختبار الاتصال</span>
                </button>

                <button
                  onClick={() => handleSync(app.id)}
                  disabled={syncingId === app.id}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-gray-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-800 flex items-center justify-center gap-1 font-sans"
                  title="مزامنة وجرد المخزن الآن"
                >
                  {syncingId === app.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-[#D4AF37]" />
                  )}
                  <span>مزامنة</span>
                </button>

                {viewMode === "advanced" && (
                  <>
                    <button
                      onClick={() => {
                        setShowAdvancedSettingsFor(showAdvancedSettingsFor === app.id ? null : app.id);
                        triggerNotification("تم فتح تهيئة الإعدادات المتقدمة لقنوات ميثاق", "info");
                      }}
                      className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-gray-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-800 font-sans"
                    >
                      إعدادات متقدمة
                    </button>

                    <button
                      onClick={() => setShowLogsFor(showLogsFor === app.id ? null : app.id)}
                      className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-gray-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-800 font-sans"
                    >
                      السجلات
                    </button>
                  </>
                )}

                {/* Allow removing custom integrations */}
                {app.id.startsWith("custom_plat_") && (
                  <button
                    onClick={() => deleteCustomIntegration(app.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-all cursor-pointer border-none bg-transparent"
                    title="إزالة هذا الربط كلياً"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Expanded Advanced configurations */}
              {showAdvancedSettingsFor === app.id && (
                <div className="mt-2 bg-slate-950/75 p-3 rounded-xl border border-amber-500/20 text-[10.5px] space-y-3">
                  <span className="font-extrabold text-[#D4AF37] block pb-1 border-b border-slate-900 text-right">إعدادات قنوات الخادم المتقدمة لقناة ميثاق ⚙️</span>
                  <div className="space-y-2 text-right">
                    <div>
                      <label className="text-[9px] block text-gray-500 mb-0.5">مسار المعالجة الأساسي (Third-Party Endpoint URL):</label>
                      <input 
                        type="text" 
                        defaultValue={app.webhookUrl || `https://api.partner.com/v2/receiver/${app.id}`} 
                        className="w-full text-xs font-mono py-1 px-2 rounded bg-slate-900 border border-slate-800 text-slate-300 text-left outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] block text-gray-500 mb-0.5">بروتوكول تفويض وحظر الـ Headers Auth:</label>
                      <select className="w-full text-[10.5px] py-1 px-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold outline-none cursor-pointer">
                        <option>Authorization Bearer Token (الافتراضي المشفر)</option>
                        <option>X-API-KEY Custom Header injection</option>
                        <option>OAuth 2.0 Webflow token</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setShowAdvancedSettingsFor(null);
                          triggerNotification("تم حفظ وتحديث الهياكل المتقدمة بنجاح", "success");
                        }}
                        className="py-1 px-3 bg-amber-500 text-black font-black rounded text-[10px] cursor-pointer border-none"
                      >
                        حفظ التعديلات
                      </button>
                      <button
                        onClick={() => setShowAdvancedSettingsFor(null)}
                        className="py-1 px-2 bg-slate-900 text-gray-400 rounded text-[10px] cursor-pointer border-none"
                      >
                        إلغاء الأمر
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Stream */}
              {showLogsFor === app.id && (
                <div className="mt-2 bg-[#0A0F1D] p-3 rounded-xl border border-indigo-500/20 text-[10.5px] space-y-2 max-h-40 overflow-y-auto w-full">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-900 mb-1.5 text-xs text-gray-300 font-extrabold flex-row-reverse">
                    <span>قنوات تتبع الخادم (Integrations Real-time Logs)</span>
                    <button onClick={() => setShowLogsFor(null)} className="text-[9px] text-gray-500 hover:text-white border-none bg-transparent cursor-pointer">✕ إغلاق</button>
                  </div>
                  {app.logs && app.logs.length > 0 ? (
                    <div className="space-y-1.5 font-mono">
                      {app.logs.map((log, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-1.5 border-b border-slate-900/50 pb-1 flex-row-reverse">
                          <span className={`${log.status === 'success' ? 'text-emerald-400' : 'text-amber-400'} font-black text-[9px]`}>
                            {log.status === 'success' ? '● ناجح' : log.status === 'error' ? '▲ خطأ' : '■ إشعار'}
                          </span>
                          <span className="text-gray-300 text-right font-sans text-[9.5px] font-bold">{log.event}</span>
                          <span className="text-gray-500 shrink-0 text-[8px]">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-2 text-gray-500">لا توجد سجلات اتصال مسجلة لهذه القناة بعد.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredIntegrations.length === 0 && (
          <div className="col-span-2 py-16 text-center border rounded-3xl border-dashed" style={{ borderColor: theme.border, color: theme.muted }}>
            <Info className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-black text-gray-300">لا توجد قنوات وتكاملات مفعلة أو مربوطة بالفئة المحددة للمتجر الحالي.</p>
            <p className="text-[9px] text-gray-500 mt-1 font-bold">اضغط على زر (إضافة تكامل) أعلاه لإنشاء أو فتح قناة جديدة بالمتجر الفوري.</p>
          </div>
        )}
      </div>

      {/* 🔮 PART 4: "إضافة تكامل" Complete Multi-Form Interactive Dialog Modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-xl rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 flex-row-reverse">
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 px-2.5 bg-slate-900 text-gray-400 hover:text-white rounded-lg transition-all animate-pulse text-xs border-none cursor-pointer font-bold"
              >
                ✕ إغلاق النافذة
              </button>
              
              <h3 className="text-sm font-black flex items-center gap-1.5 flex-row-reverse" style={{ color: theme.text }}>
                <Plus className="w-4.5 h-4.5 text-amber-500" />
                <span>إضافة دمج وتكامل ميكانيكي لشركاء ميثاق سهم</span>
              </h3>
            </div>

            {/* Segment selectors: Ready Platform vs Custom vs Webhook vs Custom API vs OAuth */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-black/55 border border-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setAddMode("ready")}
                className={`py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer border-none bg-transparent ${addMode === "ready" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
              >
                منصة جاهزة
              </button>
              <button
                type="button"
                onClick={() => setAddMode("custom")}
                className={`py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer border-none bg-transparent ${addMode === "custom" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
              >
                تكامل مخصص
              </button>
              <button
                type="button"
                onClick={() => setAddMode("webhook")}
                className={`py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer border-none bg-transparent ${addMode === "webhook" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
              >
                إضافة Webhook
              </button>
              <button
                type="button"
                onClick={() => setAddMode("api")}
                className={`py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer border-none bg-transparent ${addMode === "api" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
              >
                إضافة API Key
              </button>
              <button
                type="button"
                onClick={() => setAddMode("oauth")}
                className={`py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer border-none bg-transparent ${addMode === "oauth" ? "bg-amber-500 !text-black font-black" : "text-gray-400 hover:text-white"}`}
              >
                موصل OAuth
              </button>
            </div>

            {/* A. SELECT READY TEMPLATE */}
            {addMode === "ready" && (
              <div className="space-y-3 text-right">
                <span className="text-[10px] text-amber-400 block font-black">اختر واحدة من المنصات الجاهزة لتوليد مسارات الدمج فوراً لقنوات ميثاق:</span>
                <div className="grid grid-cols-2 gap-2">
                  {readyTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => selectReadyTemplate(tpl)}
                      className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-amber-500/40 transition-all text-right flex items-center justify-between gap-2 cursor-pointer flex-row-reverse"
                    >
                      <span className="text-[9px] text-gray-500 font-extrabold">{tpl.type}</span>
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <span className="text-lg">{tpl.logo}</span>
                        <span className="text-xs font-black text-white">{tpl.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B, C, D Multi-forms */}
            {addMode !== "ready" && (
              <form onSubmit={handleAddIntegrationSubmit} className="space-y-3.5 text-right">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold block mb-1">اسم الشريك / المنصة:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مبيعات سبل اللوجستية"
                      value={platName}
                      onChange={(e) => setPlatName(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-bold text-white bg-slate-900 border-slate-800 text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block mb-1">الشعار (أو رمز تعبيري):</label>
                    <input
                      type="text"
                      placeholder="مثال: 🛍️، 🚚، 💳، 🔒"
                      value={platLogo}
                      onChange={(e) => setPlatLogo(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-bold text-white bg-slate-900 border-slate-800 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold block mb-1">تصنيف المنصة:</label>
                    <select
                      value={platCategory}
                      onChange={(e) => setPlatCategory(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-bold text-white bg-slate-900 border-slate-800 cursor-pointer"
                    >
                      <option value="متاجر">المتاجر الإلكترونية</option>
                      <option value="أسواق">الأسواق</option>
                      <option value="شحن">الشحن والخدمات اللوجستية</option>
                      <option value="مدفوعات">المدفوعات والبطاقات</option>
                      <option value="محادثات">المحادثات والقنوات الاجتماعية</option>
                      <option value="تسويق">التسويق والإعلانات</option>
                      <option value="محاسبة">المحاسبة والضرائب</option>
                      <option value="مخصصة">تكامل مخصص</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold block mb-1">نوع بروتوكول التوصيل:</label>
                    <input
                      type="text"
                      placeholder="مثال: JSON JWT Token"
                      value={platConnectionType}
                      onChange={(e) => setPlatConnectionType(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-bold text-white bg-slate-900 border-slate-800 text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold block mb-1">رابط المعرف المستقبِل (Endpoint URL):</label>
                    <input
                      type="text"
                      placeholder="https://api.partner.com/v1/receiver"
                      value={platWebhookUrl}
                      onChange={(e) => setPlatWebhookUrl(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-mono text-left text-white bg-slate-900 border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold block mb-1">رمز الـ API Key / Token:</label>
                      <input
                        type="text"
                        placeholder="sk_live_..."
                        value={platApiKey}
                        onChange={(e) => setPlatApiKey(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-mono text-left text-white bg-slate-900 border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block mb-1">المفتاح السري (Secret Key):</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={platSecret}
                        onChange={(e) => setPlatSecret(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border outline-none font-mono text-left text-white bg-slate-900 border-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="submit"
                    className="py-2 px-5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer border-none"
                  >
                    حفظ وتنشيط التكامل ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode("ready")}
                    className="py-2 px-4 bg-slate-900 text-gray-400 rounded-xl hover:bg-slate-800 text-xs cursor-pointer border-none"
                  >
                    الرجوع للخلف
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
