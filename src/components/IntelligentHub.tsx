import React, { useState, useEffect } from "react";
import { ThemeColors, User, Product, Invoice, Customer } from "../types";
import { Sparkles, Cpu, Send, Zap, Bot, Share2, Award, ArrowRight, Brain, Globe } from "lucide-react";
import AIAnalyzer from "./AIAnalyzer";
import AutoPublish from "./AutoPublish";
import SaaSBlueprint from "./SaaSBlueprint";
import SahmBrain360 from "./SahmBrain360";
import CompetitorMonitor from "./CompetitorMonitor";

interface IntelligentHubProps {
  theme: ThemeColors;
  user: User;
  products: Product[];
  setProducts: (prod: Product[]) => void;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers?: Customer[];
  setCustomers?: (custs: Customer[]) => void;
  prefillPublish: {
    name: string;
    price: string;
    image: { uri: string; base64: string; mimeType: string } | null;
  } | null;
  setPrefillPublish: (prefill: {
    name: string;
    price: string;
    image: { uri: string; base64: string; mimeType: string } | null;
  } | null) => void;
  setActiveTab: (tab: string) => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
}

export default function IntelligentHub({
  theme,
  user,
  products,
  setProducts,
  invoices,
  setInvoices,
  customers = [],
  setCustomers = () => {},
  prefillPublish,
  setPrefillPublish,
  setActiveTab,
  triggerNotification = () => {},
  addAuditLog = () => {}
}: IntelligentHubProps) {
  // Local sub-tabs matching the combined features
  const [subTab, setSubTab] = useState<"sahm-brain" | "ai" | "publish" | "saas" | "competitors">("sahm-brain");

  const totalRevenue = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0);

  // Local Brand Memory state
  const [aiMemory, setAiMemory] = useState(() => {
    try {
      const saved = localStorage.getItem("sahm_brain_memory_v9");
      return saved ? JSON.parse(saved) : [
        { key: "نبرة البراند السهمية", val: "ملكية راقية وفخمة لمنتجات العود الطبيعي والبخور" },
        { key: "نبرة السوق والجمهور", val: "التركيز على الفئة الفاخرة وساعات الذروة" }
      ];
    } catch {
      return [
        { key: "نبرة البراند السهمية", val: "ملكية راقية وفخمة لمنتجات العود الطبيعي والبخور" },
        { key: "نبرة السوق والجمهور", val: "التركيز على الفئة الفاخرة وساعات الذروة" }
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem("sahm_brain_memory_v9", JSON.stringify(aiMemory));
  }, [aiMemory]);

  // Automatically switch sub-tab to publish when a prefilled product becomes available from AI Analyzer
  useEffect(() => {
    if (prefillPublish) {
      setSubTab("publish");
    }
  }, [prefillPublish]);

  useEffect(() => {
    const handleOpenNewCampaign = () => {
      setSubTab("publish");
    };
    window.addEventListener("sahm_open_new_campaign", handleOpenNewCampaign);
    return () => {
      window.removeEventListener("sahm_open_new_campaign", handleOpenNewCampaign);
    };
  }, []);

  // Intercepting downstream setActiveTab calls to switch local sub-tabs when appropriate
  const handleIntelligentSetActiveTab = (targetTab: string) => {
    if (targetTab === "publish" || targetTab === "publication") {
      setSubTab("publish");
    } else if (targetTab === "ai" || targetTab === "analyzer") {
      setSubTab("ai");
    } else if (targetTab === "saas_blueprint" || targetTab === "saas") {
      setSubTab("saas");
    } else {
      setActiveTab(targetTab);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔮 Elegant Unified Platform Header */}
      <div 
        className="relative overflow-hidden p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-2 text-right">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500 animate-pulse">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">المركز الذكي الموحد • Sahm Intelligence Hub</span>
          </div>
          <h2 className="text-xl font-black md:text-2xl" style={{ color: theme.text }}>
            المنصة الذكية المتكاملة للأتمتة والنشر 🧠🚀
          </h2>
          <p className="text-xs max-w-2xl leading-relaxed" style={{ color: theme.muted }}>
            دمجنا لك رؤية SaaS وهندسة قواعد البيانات، وأدوات تحليل المنتجات بالذكاء الاصطناعي، مع منصة النشر السحابي التلقائي في واجهة العمل الموحدة لتسريع العمليات وتجربة العملاء.
          </p>
        </div>

        {/* Action Button/Badge */}
        <div className="relative z-10 flex flex-wrap gap-2.5 self-start md:self-center shrink-0">
          <span 
            className="flex items-center gap-2 py-1.5 px-3 rounded-xl border text-[11px] font-bold"
            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
          >
            <Bot className="w-4 h-4 text-emerald-500 animate-bounce" />
            <span>٣ منصات متكاملة في تبويب واحد</span>
          </span>
        </div>
      </div>

      {/* 🧭 Horizontal Navigation Sub-tabs bar */}
      <div 
        className="p-1.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 transition-all text-sm font-bold"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <button
          type="button"
          onClick={() => setSubTab("sahm-brain")}
          className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none active:scale-[0.98]"
          style={{
            backgroundColor: subTab === "sahm-brain" ? theme.accent + "15" : "transparent",
            color: subTab === "sahm-brain" ? theme.text : theme.muted,
            border: subTab === "sahm-brain" ? `1px solid ${theme.accent}30` : "1px solid transparent"
          }}
        >
          <Brain className={`w-4 h-4 ${subTab === "sahm-brain" ? "text-amber-500 animate-pulse" : "text-gray-400"}`} />
          <div className="text-right">
            <span className="block text-xs font-black">عقل سهم برين 360 🧠</span>
            <span className="block text-[9px] font-medium opacity-80">تحليلات استباقية دقيقة وجاذبية المنتج</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("ai")}
          className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none active:scale-[0.98]"
          style={{
            backgroundColor: subTab === "ai" ? theme.accent + "15" : "transparent",
            color: subTab === "ai" ? theme.text : theme.muted,
            border: subTab === "ai" ? `1px solid ${theme.accent}30` : "1px solid transparent"
          }}
        >
          <Sparkles className={`w-4 h-4 ${subTab === "ai" ? "text-[#D4AF37] animate-spin-slow" : "text-gray-400"}`} />
          <div className="text-right">
            <span className="block text-xs font-black">تحليل وقدرات الذكاء 🤖</span>
            <span className="block text-[9px] font-medium opacity-80">صياغة محتوى، فحص أرباح وصورة المنتج</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("publish")}
          className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none active:scale-[0.98]"
          style={{
            backgroundColor: subTab === "publish" ? theme.accent + "15" : "transparent",
            color: subTab === "publish" ? theme.text : theme.muted,
            border: subTab === "publish" ? `1px solid ${theme.accent}30` : "1px solid transparent"
          }}
        >
          <Send className={`w-4 h-4 ${subTab === "publish" ? "text-sky-500 animate-pulse" : "text-gray-400"}`} />
          <div className="text-right">
            <span className="block text-xs font-black">النشر والربط السحابي 🔌</span>
            <span className="block text-[9px] font-medium opacity-80">تصدير الفواتير، ونشر المنتجات تلقائياً</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("saas")}
          className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none active:scale-[0.98]"
          style={{
            backgroundColor: subTab === "saas" ? theme.accent + "15" : "transparent",
            color: subTab === "saas" ? theme.text : theme.muted,
            border: subTab === "saas" ? `1px solid ${theme.accent}30` : "1px solid transparent"
          }}
        >
          <Cpu className={`w-4 h-4 ${subTab === "saas" ? "text-emerald-500" : "text-gray-400"}`} />
          <div className="text-right">
            <span className="block text-xs font-black">رؤية SaaS والمنصات 🌐</span>
            <span className="block text-[9px] font-medium opacity-80">هيكل قواعد البيانات وريديس واختبار API</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("competitors")}
          className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none active:scale-[0.98]"
          style={{
            backgroundColor: subTab === "competitors" ? theme.accent + "15" : "transparent",
            color: subTab === "competitors" ? theme.text : theme.muted,
            border: subTab === "competitors" ? `1px solid ${theme.accent}30` : "1px solid transparent"
          }}
        >
          <Globe className={`w-4 h-4 ${subTab === "competitors" ? "text-amber-500 animate-pulse" : "text-gray-400"}`} />
          <div className="text-right">
            <span className="block text-xs font-black">مراقبة المنافسين 🔍</span>
            <span className="block text-[9px] font-medium opacity-80">مراقبة أسعار وتنبيهات حية لمناديبك</span>
          </div>
        </button>
      </div>

      {/* 🖥️ Lazy load or conditionally render sub-tabs with cached state */}
      <div className="transition-all animate-fadeIn">
        {subTab === "sahm-brain" && (
          <SahmBrain360
            theme={theme}
            products={products}
            setProducts={setProducts}
            invoices={invoices}
            setInvoices={setInvoices}
            customers={customers}
            setCustomers={setCustomers}
            activeCity="الرياض"
            totalRevenue={totalRevenue}
            selectedCustomerName="سليمان العتيبي"
            aiMemory={aiMemory}
            setAiMemory={setAiMemory}
            onAddLog={(action, details) => addAuditLog?.(action, details)}
            triggerNotification={(title, text, type) => triggerNotification?.(`[${title}] ${text}`, type)}
          />
        )}

        {subTab === "ai" && (
          <AIAnalyzer 
            theme={theme} 
            products={products}
            setProducts={setProducts}
            setActiveTab={handleIntelligentSetActiveTab}
            setPrefillPublish={setPrefillPublish}
          />
        )}
        
        {subTab === "publish" && (
          <AutoPublish 
            theme={theme} 
            prefill={prefillPublish}
            onClearPrefill={() => setPrefillPublish(null)}
            invoices={invoices}
            setInvoices={setInvoices}
            products={products}
            setProducts={setProducts}
            setActiveTab={setActiveTab}
          />
        )}

        {subTab === "saas" && (
          <SaaSBlueprint 
            theme={theme} 
            user={user}
          />
        )}

        {subTab === "competitors" && (
          <CompetitorMonitor
            theme={theme}
            products={products}
            triggerNotification={triggerNotification}
            addAuditLog={addAuditLog}
          />
        )}
      </div>
    </div>
  );
}
