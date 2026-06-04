import React, { useState } from "react";
import { ThemeColors, User } from "../types";
import { 
  Cpu, Layers, Calendar, Database, Code, CreditCard, TrendingUp, Bot, Zap, 
  Workflow, Clock, CheckCircle2, ChevronRight, Play, RefreshCw, Send,
  Globe, Server, Cloud, Smartphone, Users, Check, AlertCircle, HelpCircle, Activity,
  ChevronDown, BookOpen
} from "lucide-react";

interface SaaSBlueprintProps {
  theme: ThemeColors;
  user: User;
}

export default function SaaSBlueprint({ theme, user }: SaaSBlueprintProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "db_folder" | "api_play" | "roadmap">("overview");

  // Overview states: pricing calculator & plans
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | "business" | "enterprise">("professional");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
  const [storeCountSim, setStoreCountSim] = useState<number>(2);

  // Db states: active table detail
  const [selectedTable, setSelectedTable] = useState<string>("stores");

  // API states: selected endpoint & tester triggering
  const [apiMethod, setApiMethod] = useState<"salla_sync" | "ai_marketing" | "customer_agent" | "inventory_forecast">("salla_sync");
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Interactive Pricing plans
  const plansData = {
    starter: {
      name: "الباقة الأساسية (Starter)",
      price: 299,
      limitStores: "متجر واحد (سلة أو زد)",
      limitOrders: "حتى 1,000 طلب / شهرياً",
      aiFeatures: "توليد نصوص تسويقية مبسطة",
      inventoryMode: "مزامنة يدوية وتحديث يومي",
      badge: "للمتاجر الناشئة"
    },
    professional: {
      name: "الباقة الاحترافية (Professional)",
      price: 699,
      limitStores: "حتى 3 متاجر متزامنة",
      limitOrders: "حتى 10,000 طلب / شهرياً",
      aiFeatures: "الوكيل الإعلاني المتكامل + مولد صور السوشيال ميديا",
      inventoryMode: "مزامنة لحظية فورية (Real-Time Loop)",
      badge: "الأكثر مبيعاً 🔥"
    },
    business: {
      name: "باقة الأعمال والنمو (Business)",
      price: 1499,
      limitStores: "حتى 8 متاجر (سلة، زد، شوبيفاي، ووكومرس)",
      limitOrders: "حتى 50,000 طلب / شهرياً",
      aiFeatures: "الوكيل التسويقي الكامل + بوت الواتساب التلقائي",
      inventoryMode: "ذكاء التنبؤ بـالاستهلاك + الموردين",
      badge: "لقطاع الأعمال"
    },
    enterprise: {
      name: "باقة النخبة والربط المخصص (Enterprise)",
      price: 2999,
      limitStores: "متاجر وقنوات غير محدودة",
      limitOrders: "مبيعات وطلبيات غير محدودة",
      aiFeatures: "تكييف نماذج الذكاء الاصطناعي على بياناتك",
      inventoryMode: "توزيع مخازن ذكي متعدد المواقع والربط",
      badge: "للعمليات الكبرى"
    }
  };

  // Directory Tree structure
  const folderTree = [
    { 
      name: "sahm-saas-monorepo/", 
      type: "dir", 
      children: [
        { 
          name: "apps/", 
          type: "dir", 
          children: [
            { name: "web-portal/", type: "dir", desc: "لوحة تحكم SaaS الموحدة بتصميم Notion & Stripe (React/Next.js Layout)" },
            { name: "expo-mobile/", type: "dir", desc: "تطبيق المحمول الهجين للآيفون والأندرويد (React Native Expo App)" },
            { name: "whatsapp-worker/", type: "dir", desc: "خدمة معالجة واستلام رسائل العملاء عبر WhatsApp Cloud API" }
          ]
        },
        { 
          name: "packages/", 
          type: "dir", 
          children: [
            { name: "database-schema/", type: "dir", desc: "ملفات التعريف والترحيل المشتركة لـ PostgreSQL و Supabase Drizzle ORM" },
            { name: "ai-agents-core/", type: "dir", desc: "محرك وكلاء الذكاء الاصطناعي (منشورات، ردود، تحليل مخزون، Gemini SDK)" },
            { name: "integrations-sdk/", type: "dir", desc: "مكتبة الاتصال والويب هوك الموحدة للربط مع سلة وزد وشوبيفاي" }
          ]
        },
        { 
          name: "services/", 
          type: "dir", 
          children: [
            { name: "backend-api/", type: "dir", desc: "خادم NestJS السحابي Core API - يخدم الاشتراكات وعمليات الدفع والتحليلات" },
            { name: "sync-scheduler/", type: "dir", desc: "خادم مصغر لإدارة طوابير التحديث والرسائل باستخدام BullMQ و Redis" }
          ]
        },
        { name: ".env.example", type: "file", desc: "توصيف المتغيرات البيئية لـ Supabase Key و OpenAI Token و APIs" },
        { name: "docker-compose.yml", type: "file", desc: "توصيف تشغيل واجهات الأنظمة والشبكة المشتركة" }
      ]
    }
  ];

  // SQL tables structures
  const tablesSchema: Record<string, { desc: string; columns: { name: string; type: string; constraints: string; comment: string }[] }> = {
    stores: {
      desc: "جدول المتاجر المربوطة بالمنصة ومفاتيح ترخيص تفويض الربط الآمن الخاص بها (OAuth tokens)",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", comment: "المعرف الفريد للمتجر المربوط" },
        { name: "user_id", type: "UUID", constraints: "REFERENCES auth.users(id) ON DELETE CASCADE", comment: "المستخدم المالك بـ Supabase Auth" },
        { name: "platform", type: "VARCHAR(20)", constraints: "NOT NULL /* salla | zid | shopify | woocommerce */", comment: "نوع المنصة الإلكترونية المربوطة" },
        { name: "store_name", type: "VARCHAR(150)", constraints: "NOT NULL", comment: "اسم المتجر الظاهري المستهدف" },
        { name: "merchant_id", type: "VARCHAR(100)", constraints: "UNIQUE NOT NULL", comment: "رقم التاجر المرجعي لتجنيب التكرار" },
        { name: "access_token", type: "TEXT", constraints: "NOT NULL", comment: "رمز الوصول المشفر للقيام بالعمليات" },
        { name: "refresh_token", type: "TEXT", constraints: "NULL", comment: "رمز تجديد تسجيل الدخول التلقائي" },
        { name: "sync_status", type: "VARCHAR(20)", constraints: "DEFAULT 'active'", comment: "حالة الربط المتزامنة" },
        { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT now()", comment: "تاريخ ربط وتدشين المتجر بسهم" }
      ]
    },
    products: {
      desc: "جدول المنتجات وقوائم الأسعار والمخزون الموحد ومطابقتها مع المتاجر النشطة",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", comment: "المعرف الفريد للمنتج" },
        { name: "store_id", type: "UUID", constraints: "REFERENCES stores(id) ON DELETE CASCADE", comment: "رابط المتجر المشغل" },
        { name: "sku", type: "VARCHAR(100)", constraints: "NOT NULL", comment: "رمز الباركود الموحد للمنتج" },
        { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", comment: "اسم المنتج بلغة العميل (عربي)" },
        { name: "stock", type: "INTEGER", constraints: "NOT NULL DEFAULT 0", comment: "كمية رصيد المخزن المتبقية" },
        { name: "price", type: "NUMERIC(12,2)", constraints: "NOT NULL", comment: "سعر بيع المنتج النهائي شامل الضريبة" },
        { name: "cost", type: "NUMERIC(12,2)", constraints: "NOT NULL", comment: "سعر تكلفة المنتج لحساب توازن فائض الأرباح" },
        { name: "category", type: "VARCHAR(100)", constraints: "DEFAULT 'general'", comment: "تصنيف الصنف الأساسي" },
        { name: "ai_description", type: "TEXT", constraints: "NULL", comment: "الوصف التسويقي المولد بالكامل بواسطة الذكاء الاصطناعي" }
      ]
    },
    orders_and_invoices: {
      desc: "جدول معالجة المبيعات الموحد وفواتير ضريبة القيمة المضافة المتوافقة مع متطلبات هيئة الزكاة (ZATCA Phase 2)",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", comment: "رقم الفاتورة أو الطلب المشترك" },
        { name: "store_id", type: "UUID", constraints: "REFERENCES stores(id) ON DELETE CASCADE", comment: "رابط متجر المبيعات" },
        { name: "invoice_number", type: "VARCHAR(50)", constraints: "UNIQUE NOT NULL", comment: "رقم الفاتورة الضريبية المبسطة" },
        { name: "customer_name", type: "VARCHAR(150)", constraints: "DEFAULT 'عميل عام'", comment: "اسم العميل المشتري" },
        { name: "subtotal", type: "NUMERIC(12,2)", constraints: "NOT NULL", comment: "المجموع قبل حساب ضريبة القيمة المضافة" },
        { name: "vat_amount", type: "NUMERIC(12,2)", constraints: "NOT NULL", comment: "قيمة ضريبة القيمة المضافة المحددة (15%)" },
        { name: "total_amount", type: "NUMERIC(12,2)", constraints: "NOT NULL", comment: "المجموع المالي الإجمالي المطلوب سداده" },
        { name: "zatca_qr_payload", type: "TEXT", constraints: "NOT NULL", comment: "الترميز والتوقيع الرقمي المشفر المتوافق مع الفاتورة" }
      ]
    },
    ai_marketing_campaigns: {
      desc: "جدول حملات التسويق الذكي وتحليل المحتوى والمنشورات الموجهة لوسائل التواصل الاجتماعي وسناب شات وميتا",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", comment: "المعرف الفريد للحملة التسويقية" },
        { name: "user_id", type: "UUID", constraints: "REFERENCES auth.users(id)", comment: "المستخدم المشغل للحملة" },
        { name: "product_id", type: "UUID", constraints: "REFERENCES products(id)", comment: "المنتج المستهدف للتسويق" },
        { name: "channel", type: "VARCHAR(30)", constraints: "NOT NULL /* meta_ads | snapchat_ads | tiktok | content_x */", comment: "قناة النشر المستهدفة" },
        { name: "generated_text", type: "TEXT", constraints: "NOT NULL", comment: "النص والوصف التسويقي المهيكل بالـ AI" },
        { name: "performance_score", type: "DECIMAL(3,2)", constraints: "NULL", comment: "معدل التفاعل المقدر والمقترح ذكياً" }
      ]
    }
  };

  // Run mock API triggers inside the SaaS app
  const triggerApiSimulator = () => {
    setIsApiLoading(true);
    setApiResponse(null);

    setTimeout(() => {
      setIsApiLoading(false);
      
      switch (apiMethod) {
        case "salla_sync":
          setApiResponse({
            status: "success",
            execution_time_ms: 124,
            gateway: "https://api.salla.dev/v2/products/sync",
            payload: {
              synced_items_count: 48,
              merchant_id: "salla_mer_88291",
              sync_loop: {
                status: "ACTIVE_AND_LISTENING",
                real_time_webhooks: ["product.created", "product.updated", "order.status.updated"]
              },
              matched_skus: ["BKR-KLM-11", "ZAF-SUP-22", "AUD-MLK-99"],
              inventory_adjustments: "تحديث مخزون كافة الفروع والمنصات المتصلة آلياً والتطبيق متصل بالكامل."
            }
          });
          break;
        case "ai_marketing":
          setApiResponse({
            status: "success",
            execution_time_ms: 382,
            engine: "Google Gemini 2.5 Flash & Vision",
            payload: {
              product_analyzed: "دهن عود كلمنتان فاخر",
              detected_attributes: ["عود إندونيسي طبيعي", "ثبات ممتاز ونكهة بخورية سويتية"],
              social_media_assets: {
                snapchat_ad: {
                  hook_text: "✨ فخامة الماضي بهيبة الحاضر بلمسة ملوكية!",
                  body: "تألق بدهن عود كلمنتان فاخر من غابات إندونيسيا الطبيعية يمنحك ثباتاً طوال اليوم لجميع المراسيم. اطلب الآن بخصم 15% 🔗👇"
                },
                instagram_post: {
                  caption: "عبر عن أصالتك بمزيج بخوري متميز وخصومات حصرية لمتجركم المتكامل. الشحن والتوصيل سريع جداً لكافة مناطق الخليج بالدفع السهل والآمن 🇸🇦✨"
                },
                seo_meta: {
                  title: "دهن عود كلمنتان طبيعي فاخر 100% | متجر مراسيم الطيب",
                  keywords: "دهن عود, كلمنتان طبيعي, عود فاخر, افضل دهن عود, عطور سعودية"
                }
              }
            }
          });
          break;
        case "customer_agent":
          setApiResponse({
            status: "success",
            execution_time_ms: 145,
            channel: "WhatsApp Cloud API Service Broker",
            payload: {
              customer_phone: "+966555123456",
              detected_metadata: {
                name: "عبدالمحسن الشهري",
                recent_order_id: "ORD-99812",
                payment_status: "Paid",
                shipping_carrier: "Aramex Express"
              },
              ai_intent: "order_tracking_query (الاستعلام عن شحن الطلب وحالته)",
              agent_generated_reply: "أهلاً بك يا أستاذ عبدالمحسن، نسعد بخدمتك بمتجر مراسيم الطيب! 🌸\n\nبخصوص طلبيتك رقم #ORD-99812 المكونة من 'دهن عود كلمنتان'، نود إفادتك بأنها تم شحنها مع شركة أرامكس ورقم تتبعها السريع هو: ARX-77621102. يمكنك متابعة حالة التحديث المباشر للشحنة من هنا: https://aramex.com/track/ARX-77621102 🚚\n\nهل يمكننا مساعدتك بأي استفسار مالي أو تسويقي آخر؟"
            }
          });
          break;
        case "inventory_forecast":
          setApiResponse({
            status: "success",
            execution_time_ms: 210,
            engine: "SaaSMaster Stock Forecasting Modeler",
            payload: {
              product_sku: "BKR-KLM-11",
              analysis_period: "الشهور الثلاثة الماضية",
              metrics: {
                daily_burn_rate: 2.1,
                days_of_stock_left: 9,
                out_of_stock_estimated_date: "2026-06-11"
              },
              forecast_status: "CRITICAL_LOW_STOCK_RISK_DETECTED 🚨 (خطر نفاد وشيك للمخزون)",
              automated_replenishment_recommendation: {
                suggested_supplier: "مورد العود الإندونيسي بالشرقية",
                reorder_quantity_level: 150,
                estimated_lead_time_days: 7,
                lead_time_adjusted_savings: "حماية 4,200 ريال سعودي من الأرباح المهددة بالفقد جراء نفاد الصنف"
              }
            }
          });
          break;
      }
    }, 800);
  };

  // Render directory node recursive function
  const renderFolderNode = (node: any, depth = 0) => {
    const isDir = node.type === "dir";
    return (
      <div key={node.name} style={{ marginRight: `${depth * 18}px` }} className="space-y-1">
        <div className="flex items-center gap-2 hover:bg-slate-800/40 rounded py-0.5 px-2 transition-all group">
          <span className="font-mono text-xs select-none">
            {isDir ? "📁" : "📄"}
          </span>
          <span className={`font-mono text-xs ${isDir ? "font-bold text-sky-400" : "text-gray-300"}`}>
            {node.name}
          </span>
          {node.desc && (
            <span className="text-[10px] text-gray-500 opacity-80 group-hover:opacity-100 transition-opacity">
              — {node.desc}
            </span>
          )}
        </div>
        {node.children && node.children.map((child: any) => renderFolderNode(child, depth + 1))}
      </div>
    );
  };

  const calculatedPrice = billingCycle === "annually" 
    ? Math.round(plansData[selectedPlan].price * 0.8) 
    : plansData[selectedPlan].price;

  return (
    <div className="space-y-6 text-right dir-rtl select-text" style={{ color: theme.text }}>
      
      {/* 🚀 Header banner section */}
      <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-500/10 to-amber-500/10 rounded-full filter blur-2xl pointer-events-none select-none"></div>

        <div className="space-y-2 relative z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>بناء معايير SaaS الاحترافية الكبرى للشركات والمنصات 🔌</span>
          </div>
          <h2 className="text-xl font-black md:text-2xl tracking-tight leading-snug">رؤية سهم كشركة SaaS متكاملة للهيئات والتجارة الذكية (Sahm AI Engine)</h2>
          <p className="text-xs leading-relaxed max-w-4xl text-gray-400">
            أنت تنظر على مخطط إعادة البناء والهيكلة الكاملة لمنصة <span className="text-emerald-400 font-bold">ERP سهم الذكي</span> لتصبح منصة SaaS جماهيرية جاهزة لخدمة آلاف المتاجر الإلكترونية في السعودية وحول الخليج العربي بالمدفوعات المتكاملة والمزامنة الفورية وتحليلي الزكاة.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <span className="text-xs text-gray-500 font-bold">المشغّل الحالي:</span>
          <span className="text-xs py-1 px-3 bg-slate-800 border border-slate-700/50 rounded-xl font-semibold text-gray-200">
            {user.name} ({user.role})
          </span>
        </div>
      </div>

      {/* 🧭 Interactive presentation sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-1.5" style={{ borderColor: theme.border }}>
        <button
          onClick={() => setActiveTab("overview")}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-all"
          style={{
            backgroundColor: activeTab === "overview" ? theme.accent : theme.surface,
            color: activeTab === "overview" ? "#000" : theme.text,
            border: `1px solid ${activeTab === "overview" ? theme.accent : theme.border}`
          }}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>النموذج الربحي والاشتراكات السحابية 💎</span>
        </button>

        <button
          onClick={() => setActiveTab("architecture")}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-all"
          style={{
            backgroundColor: activeTab === "architecture" ? theme.accent : theme.surface,
            color: activeTab === "architecture" ? "#000" : theme.text,
            border: `1px solid ${activeTab === "architecture" ? theme.accent : theme.border}`
          }}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>مخطط المعمارية السحابية والانتشار (9-13) 🔌</span>
        </button>

        <button
          onClick={() => setActiveTab("db_folder")}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-all"
          style={{
            backgroundColor: activeTab === "db_folder" ? theme.accent : theme.surface,
            color: activeTab === "db_folder" ? "#000" : theme.text,
            border: `1px solid ${activeTab === "db_folder" ? theme.accent : theme.border}`
          }}
        >
          <Database className="w-4 h-4 shrink-0" />
          <span>قاعدة البيانات Supabase وهيكل الملفات (4-9) 🗄️</span>
        </button>

        <button
          onClick={() => setActiveTab("api_play")}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-all"
          style={{
            backgroundColor: activeTab === "api_play" ? theme.accent : theme.surface,
            color: activeTab === "api_play" ? "#000" : theme.text,
            border: `1px solid ${activeTab === "api_play" ? theme.accent : theme.border}`
          }}
        >
          <Code className="w-4 h-4 shrink-0" />
          <span>التكامل الرقمي العريض ومحاكاة الـ API 🎯</span>
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-all"
          style={{
            backgroundColor: activeTab === "roadmap" ? theme.accent : theme.surface,
            color: activeTab === "roadmap" ? "#000" : theme.text,
            border: `1px solid ${activeTab === "roadmap" ? theme.accent : theme.border}`
          }}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>خريطة طريق سهم (6-7-8) والانتشار لـ MVP 🚀</span>
        </button>
      </div>

      {/* 🚀 WORKSPACE PANEL RENDERER */}
      <div className="space-y-6">
        
        {/* TAB 1: OVERVIEW AND SaaS BUSINESS PLANS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SaaS Pricing Plans Comparison Card (Left 2-columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4.5 h-4.5 text-amber-500" />
                    <div>
                      <h3 className="text-sm font-black" style={{ color: theme.text }}>خطط الاشتراك السحابي المحتسبة للعملاء (SaaS Subscriptions)</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">تفصيل حدود خطط مستخدمي متاجر سلة وزد لتمويل العائدات لشركة سهم الرقمية</p>
                    </div>
                  </div>
                  
                  {/* Monthly / Yearly cycle selector toggle */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setBillingCycle("annually")}
                      className={`text-[9px] font-extrabold py-1 px-2.5 rounded cursor-pointer transition-all ${billingCycle === "annually" ? "bg-amber-500 text-black" : "text-gray-400"}`}
                    >
                      سنوي (خصم 20%) 🎁
                    </button>
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`text-[9px] font-extrabold py-1 px-2.5 rounded cursor-pointer transition-all ${billingCycle === "monthly" ? "bg-amber-500 text-black" : "text-gray-400"}`}
                    >
                      شهري ميسر
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(plansData).map(([key, item]) => {
                    const isSelected = selectedPlan === key;
                    const calculatedPlanPrice = billingCycle === "annually" 
                      ? Math.round(item.price * 0.8) 
                      : item.price;

                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedPlan(key as any)}
                        className="p-4 rounded-xl border flex flex-col justify-between gap-4 cursor-pointer hover:border-amber-400/40 transition-all active:scale-98 relative text-right"
                        style={{
                          backgroundColor: isSelected ? theme.surface : "transparent",
                          borderColor: isSelected ? theme.accent : theme.border,
                        }}
                      >
                        {/* Selector indicator */}
                        {isSelected && (
                          <span className="absolute top-2.5 left-2.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">
                            ✓
                          </span>
                        )}

                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold py-0.5 px-2 rounded-full border bg-emerald-500/10 text-emerald-400 inline-block mb-1">
                            {item.badge}
                          </span>
                          <h4 className="text-xs font-black text-white">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                            • {item.limitStores}
                          </p>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            • {item.limitOrders}
                          </p>
                        </div>

                        {/* Visual breakdown details metrics */}
                        <div className="border-t pt-2.5 space-y-1" style={{ borderColor: theme.border }}>
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-gray-400">ميزة الذكاء:</span>
                            <span className="text-gray-200 font-bold max-w-[125px] truncate">{item.aiFeatures}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] pt-0.5">
                            <span className="text-gray-400">نمط المخازن:</span>
                            <span className="text-gray-200 font-bold truncate max-w-[125px]">{item.inventoryMode}</span>
                          </div>
                        </div>

                        {/* Price footer calculated tags */}
                        <div className="flex justify-between items-baseline pt-2">
                          <span className="text-[9px] text-gray-500">
                            {billingCycle === "annually" ? "/ شهر بالدفع السنوي" : "/ شهر"}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-emerald-400" style={{ color: theme.accent }}>
                              {calculatedPlanPrice}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">ريال</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Saudi/GCC SaaS Localization Checkpoints (Value props) */}
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <Globe className="w-4.5 h-4.5 text-emerald-500" />
                  <h3 className="text-xs font-black" style={{ color: theme.text }}>مواءمة وتوطين سهم للنظام المالي والضريبي السعودي 🇸🇦</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right animate-fade-in">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-black text-[11px] block">1. الفوترة الضريبية 🔒</span>
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      متوافقة بالكامل مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA Phase 2) بالتوقيع الرقمي والربط التلقائي.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-black text-[11px] block">2. بوابات الدفع المحلية 💳</span>
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      تصنيف وحساب عمولات الدفع المباشر لخدمات (مدى mada, Apple Pay, تمارا، وتابي) وفهرستها بالقيود اليومية آلياً.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-black text-[11px] block">3. تكامل المتاجر بلمسة زر 🔌</span>
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      ربط وتفويض آمن فوري مع تطبيقات سلة (Salla App Store) وزد للخدمات اللحظية عبر البروتوكول المحمي OAuth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SaaS Simulation Calculator Widget (Right 1-column) */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                  <h3 className="text-xs font-black" style={{ color: theme.text }}>حاسبة عوائد واشتراك SaaS التفاعلية</h3>
                </div>

                <p className="text-[10px] text-gray-400 leading-relaxed">
                  احسب تكلفة واشتراك متجرك أو شبكة الفروع متضمنة خطة الدفع لتفصيل معدلات استهلاك موارد السيرفر والتطوير السحابي.
                </p>

                <div className="space-y-4 pt-1">
                  {/* Slider 1: Store Integrations */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400">عدد المتاجر المطلوب ربطها:</span>
                      <span className="font-mono text-emerald-400 font-black text-[11px]">{storeCountSim} متاجر نشطة</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={storeCountSim}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setStoreCountSim(val);
                        if (val <= 1) setSelectedPlan("starter");
                        else if (val <= 3) setSelectedPlan("professional");
                        else if (val <= 7) setSelectedPlan("business");
                        else setSelectedPlan("enterprise");
                      }}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>1 متجر</span>
                      <span>5 متاجر</span>
                      <span>10 متاجر</span>
                    </div>
                  </div>

                  {/* Pricing dynamic estimate result */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wide">الخطة التقديرية المقترحة</span>
                    <h4 className="text-xs font-black text-amber-500" style={{ color: theme.accent }}>
                      {plansData[selectedPlan].name}
                    </h4>
                    
                    <div className="flex items-baseline justify-center gap-1.5 py-1">
                      <span className="text-2xl font-black text-white">{calculatedPrice * storeCountSim}</span>
                      <span className="text-[10px] text-gray-400 font-bold">ريال سعودي / شهر</span>
                    </div>

                    <p className="text-[8px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                      القيمة تشمل إدارة ومزامنة {storeCountSim} قنوات تداول وبث للبيانات والتحليل الذكائي بأسلوب الدفعة المختارة.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(`🚀 تهانينا تم تفعيل محطة SaaS وخيار الباقة المالي المقرون بخصم {billingCycle === "annually" ? "20%" : "بدون خصم"} لـ ${storeCountSim} متاجر!`);
                    }}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-xl text-black cursor-pointer active:scale-95 transition-all"
                  >
                    🚀 اعتماد ترخيص وباقة التشغيل السحابية
                  </button>
                </div>
              </div>

              {/* Target SaaS Business KPI metric box */}
              <div className="p-4 rounded-2xl border bg-slate-900/30 border-slate-800 flex justify-between items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-500 uppercase block font-bold">معدل العائد السنوي المقدر (LTV / ARR)</span>
                  <span className="text-xs font-black text-emerald-400">8,388 ريال سنوي / لكل عميل</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAAS ARCHITECTURE & MOOD LAYOUT SYSTEM */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            
            {/* Visual Interactive Architecture Diagram with flow points */}
            <div className="p-5 rounded-2xl border space-y-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                <Layers className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="text-xs font-black" style={{ color: theme.text }}>مخطط المعمارية السحابية الموزعة (Highly Scalable Cloud Architecture)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                
                {/* Layer 1 */}
                <div className="p-4 rounded-xl border space-y-3 bg-slate-900/60 border-slate-800 hover:border-amber-400/40 transition-all text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-amber-400 font-bold block uppercase">الطبقة 1: واجهات المستخدم</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">Next.js & React Native Client Portal</h4>
                    <p className="text-[9px] text-gray-400 leading-relaxed mt-1">
                      واجهات سريعة التجاوب والتكامل تتيح أسرع زمن تحميل بالخليج ومطورة بالكامل لخدمة الجوال والويب.
                    </p>
                  </div>
                </div>

                {/* Layer 2 */}
                <div className="p-4 rounded-xl border space-y-3 bg-slate-900/60 border-slate-800 hover:border-emerald-400/40 transition-all text-center relative">
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-600 hidden md:inline-block">
                    ◀
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-400 font-bold block uppercase">الطبقة 2: النواة والمعالجة</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">NestJS Core Application Servers</h4>
                    <p className="text-[9px] text-gray-400 leading-relaxed mt-1">
                      إدارة القوانين المحاسبية والتحوط الضريبي بالذكاء الاصطناعي مع معالجة الطوابير بـ BullMQ و Redis.
                    </p>
                  </div>
                </div>

                {/* Layer 3 */}
                <div className="p-4 rounded-xl border space-y-3 bg-slate-900/60 border-slate-800 hover:border-sky-400/40 transition-all text-center relative">
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-600 hidden md:inline-block">
                    ◀
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-sky-400 font-bold block uppercase">الطبقة 3: البيانات والملفات</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">PostgreSQL Supabase Instance</h4>
                    <p className="text-[9px] text-gray-400 leading-relaxed mt-1">
                      فهرسة وحفظ المنتجات، حركة التدفق النقدي، العمليات، والمستخدمين بـ Row Level Security (RLS) صارم.
                    </p>
                  </div>
                </div>

                {/* Layer 4 */}
                <div className="p-4 rounded-xl border space-y-3 bg-slate-900/60 border-slate-800 hover:border-purple-400/40 transition-all text-center relative">
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-600 hidden md:inline-block">
                    ◀
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-purple-400 font-bold block uppercase">الطبقة 4: قنوات التزامن</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">Salla/Zid Connected APIs</h4>
                    <p className="text-[9px] text-gray-400 leading-relaxed mt-1">
                      ويب هوك لحظي يستقبل المبيعات من سلة وزد وشوبيفاي ليعيد حساب مستويات الأمان بالمخازن كحلقة ملقم واحدة.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Production Deployment Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                  <Cloud className="w-4.5 h-4.5 text-blue-400" />
                  <h3 className="text-xs font-black">حزمة وخطة النشر الحية والسحابية (Production Deployment Mode)</h3>
                </div>

                <div className="space-y-3 text-right">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-200">الاستضافة الإقليمية (AWS me-central-1 Jeddah)</span>
                      <p className="text-[9px] text-gray-400">
                        لتقليل زمن الاستجابة لملايين الزبائن بالمملكة إلى ما دون 25 مللي ثانية وضمان تلبية قيود معالجة البيانات الوطنية.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-200">الأتمتة وتدفق النشر المستمر (CI/CD Pipeline)</span>
                      <p className="text-[9px] text-gray-400">
                        استخدام GitHub Actions لإجراء الفحص الآلي وبناء حاويات Docker ورفعها لـ Google Cloud Run بانسابية ودون توقف دقيقة واحدة.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-200">نظام المراقبة والرصد وسجلات الأحداث (Monitoring & Logging)</span>
                      <p className="text-[9px] text-gray-400">
                        دمج Sentry لتتبع الأخطاء البرمجية الفورية وحساب معدل تواجد الخدمة (SLA) المستمر بنسبة 99.95% لاستدامة مبيعات التجار.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Design Language Specs (Stripe/Notion Style UI Spec) */}
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                  <Globe className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-xs font-black">سمات ولغة التصميم المعيارية الكبرى (UX/UI Design System)</h3>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <p className="leading-relaxed">
                    تم بناء منصة سهم الرقمية لتلائم معايير <span className="text-amber-400 font-bold">Stripe & Notion</span> العالمية بالبساطة والعمق وتقديم أعلى درجات الراحة البصرية للأعمال:
                  </p>
                  
                  <ul className="space-y-2 mt-2 font-medium text-[10px] text-gray-400">
                    <li className="flex items-center gap-1.5 justify-end">
                      <span>• خطوط عربية محسنة وحيادية تعتمد على عائلة "Cairo" و "Cairo Bold" للمقروئية الكبرى.</span>
                      <span className="text-emerald-400">✔</span>
                    </li>
                    <li className="flex items-center gap-1.5 justify-end">
                      <span>• التوافق الإجمالي الكامل للغات والاتجاهات اليمينية RTL لكل التفاصيل والتقارير المالية والتحليلية.</span>
                      <span className="text-emerald-400">✔</span>
                    </li>
                    <li className="flex items-center gap-1.5 justify-end">
                      <span>• ألوان داكنة ترابية بلمسة ذهبية تليق بصفوة أعمال عطور ومواد العود الفاخرة بالمملكة.</span>
                      <span className="text-emerald-400">✔</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: SUPABASE DATABASE SCHEMA & MONOREPO DIRS */}
        {activeTab === "db_folder" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Supabase Schema (Left 2-columns) */}
            <div className="lg:col-span-2 p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-sky-400" />
                  <div>
                    <h3 className="text-xs font-black">بنية ومخطط جداول قاعدة بيانات Supabase (PostgreSQL Schema)</h3>
                    <p className="text-[9px] text-gray-400">استبدال الذاكرة المحلية (LocalStorage) بجداول وقوانين حقيقية مهيكلة للـ Enterprise SaaS</p>
                  </div>
                </div>

                {/* DB Select switcher */}
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="text-[10px] font-bold py-1.5 px-3 rounded-lg border outline-none cursor-pointer bg-slate-905 text-white"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                  <option value="stores">جدول المتاجر المتصلة (stores)</option>
                  <option value="products">جدول المنتجات الموحد (products)</option>
                  <option value="orders_and_invoices">جدول الفواتير والزكاة (orders_and_invoices)</option>
                  <option value="ai_marketing_campaigns">جدول حملات التسويق (ai_marketing_campaigns)</option>
                </select>
              </div>

              {/* Table details display */}
              <div className="space-y-3 animate-fade-in">
                <div className="p-3 bg-sky-950/10 border border-sky-900/30 rounded-xl">
                  <span className="text-[9px] text-sky-400 font-bold block mb-1">وصف الجدول وغرضه الأساسي:</span>
                  <p className="text-[10px] leading-relaxed text-gray-300">{tablesSchema[selectedTable].desc}</p>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-right text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-gray-400 font-bold">
                        <th className="p-2.5">اسم الحقل (Column)</th>
                        <th className="p-2.5">النوع (DataType)</th>
                        <th className="p-2.5 text-left">القيود (Constraints)</th>
                        <th className="p-2.5 text-center">البيان والوظيفة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-gray-300">
                      {tablesSchema[selectedTable].columns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10">
                          <td className="p-2.5 font-mono font-bold text-emerald-400">{col.name}</td>
                          <td className="p-2.5 font-mono text-gray-400">{col.type}</td>
                          <td className="p-2.5 font-mono text-left text-gray-500 overflow-hidden max-w-[150px] truncate" title={col.constraints}>
                            {col.constraints || "—"}
                          </td>
                          <td className="p-2.5 text-center text-gray-400">{col.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Row level security (RLS) enforcement notice */}
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[9px] text-gray-400 leading-relaxed">
                    💡 <span className="font-bold text-gray-300">تطبيق حماية البيانات الصارمة (RLS):</span> تم تفعيل صياغات RLS على هذا الجدول بحيث يتم عزل العمليات بشكل كامل على مستوى معرّف المسؤول <code className="text-amber-400 font-mono">user_id = auth.uid()</code> لضمان أمان البيانات.
                  </p>
                </div>
              </div>
            </div>

            {/* Folder layout structures (Right 1-column) */}
            <div className="p-5 rounded-2xl border space-y-4 text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="text-xs font-black" style={{ color: theme.text }}>منظور وحيز هيكل مجلدات مشروع الـ SaaS</h3>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed">
                هيكل الملفات المعياري المبني بأسلوب مستودع الأدوات الأحادي (Monorepo) لفصل الواجهات والتطبيق الخلفي ووكلاء الذكاء الاصطناعي:
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-y-auto max-h-96">
                {folderTree.map(k => renderFolderNode(k))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: API PLAYGROUND SIMULATOR */}
        {activeTab === "api_play" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Selector panel */}
            <div className="lg:col-span-1 p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                <Code className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="text-xs font-black">مختبر ووحدات الربط والذكاء التفاعلي (Live API Tester)</h3>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed pb-2">
                اختر الواجهة والبروتوكول المراد محاكاته لتجربة فعالية محرك سهم (Sahm Engine) المكتوب بلغة TypeScript ومراقبته:
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  { id: "salla_sync", label: "مزامنة المنتجات المخزنية (سلة وزد API)", detail: "HTTP POST /api/v1/integrations/sync", icon: RefreshCw },
                  { id: "ai_marketing", label: "توليد أدوات التسويق (Gemini Engine)", detail: "HTTP POST /api/v1/ai/marketing", icon: Bot },
                  { id: "customer_agent", label: "مساعد خدمة العملاء (WhatsApp API)", detail: "HTTP POST /api/v1/support/webhook", icon: Zap },
                  { id: "inventory_forecast", label: "التقارير وسلاسل الإمداد (AI Forecast)", detail: "HTTP GET /api/v1/inventory/forecast", icon: TrendingUp }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setApiMethod(item.id as any);
                      setApiResponse(null);
                    }}
                    className="p-3 rounded-xl border flex items-center justify-between gap-3 text-right cursor-pointer hover:border-amber-400/40 transition-colors"
                    style={{
                      backgroundColor: apiMethod === item.id ? theme.surface : "transparent",
                      borderColor: apiMethod === item.id ? theme.accent : theme.border
                    }}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black text-white">{item.label}</span>
                      <span className="font-mono text-[8px] text-gray-500 block text-left">{item.detail}</span>
                    </div>
                    <item.icon className="w-4 h-4 shrink-0 text-amber-500" style={{ color: apiMethod === item.id ? theme.accent : theme.muted }} />
                  </button>
                ))}
              </div>

              <button
                onClick={triggerApiSimulator}
                disabled={isApiLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-gray-600 font-bold text-xs rounded-xl text-black cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isApiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاتصال والطلب من الخادم السحابي...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>إرسال طلب تجربة الـ API المحاكي 📡</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Output (Right 2-columns) */}
            <div className="lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between gap-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>منفذ سجلات وتتبع الاستجابة (Console Response Log)</span>
                </div>
                <span className="font-mono text-[9px] text-gray-500">Status Code: 200 OK</span>
              </div>

              <div className="flex-1 min-h-[250px] bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-emerald-400 overflow-y-auto text-left dir-ltr">
                {isApiLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <p className="font-mono text-[11px]">Connecting to Sahm AI SaaS NestJS Clusters ...</p>
                  </div>
                ) : apiResponse ? (
                  <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-gray-600">
                    <Code className="w-8 h-8 text-slate-800" />
                    <p className="font-mono text-[11px]">No request sent yet. Click 'إرسال طلب تجربة' on the left to test the integration flow.</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-900 rounded-xl text-[9px] text-gray-400 leading-relaxed text-right">
                🔒 <span className="font-bold text-gray-300">أمن وسلامة الربط:</span> كافة ترويسات الطلب محصنة بـ JWT Tokens وتوقيع التاجر وتمر خوادمنا تلقائياً عبر مصافي جدران الحماية للـ Cloud DNS لحماية حساباتكم.
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: MVP ROADMAP & PRODUCTION TIMELINE */}
        {activeTab === "roadmap" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product Roadmap Steps */}
              <div className="lg:col-span-2 p-5 rounded-2xl border space-y-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <Calendar className="w-4.5 h-4.5 text-emerald-500" />
                  <h3 className="text-xs font-black" style={{ color: theme.text }}>خارطة الطريق وتأسيس منصة سهم المتكاملة بالكامل</h3>
                </div>

                <div className="space-y-5 relative pl-4 text-right animate-fade-in">
                  
                  {/* Step 1 */}
                  <div className="border-r-2 relative pr-5 pb-1" style={{ borderColor: theme.accent }}>
                    <span className="absolute -right-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] text-white">1</span>
                    <span className="text-[9px] font-extrabold uppercase py-0.5 px-2.5 rounded bg-emerald-500/10 text-emerald-400">الربع الأول 2026: باقة التأسيس الفوري (MVP Base)</span>
                    <h4 className="text-xs font-bold text-white mt-1">البناء الأولي ومعمارية قواعد البيانات وقوانين الفوترة</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                      دمج لوحة التحكم بجداول Supabase Auth وبدء بناء حلقة مزامنة المبيعات لسلة وزد وعرض الفواتير الاحترافية المعتمدة لـ ZATCA لتفادي القضايا المحاسبية للتجار والناشئين.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="border-r-2 relative pr-5 pb-1" style={{ borderColor: theme.accent }}>
                    <span className="absolute -right-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] text-white">2</span>
                    <span className="text-[9px] font-extrabold uppercase py-0.5 px-2.5 rounded bg-amber-500/10 text-amber-500">الربع الثاني 2026: التوسع والتحليل (V2 Scale)</span>
                    <h4 className="text-xs font-bold text-white mt-1">إدراج الذكاء الاصطناعي ومساعد خدمة العملاء التلقائي</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                      إطلاق وكيل مبيعات واتس اب متكامل وبناء نموذج التحليل الإعلاني من صور الصنف المباشرة مع دمج قنوات سناب شات وإنستغرام وميتا في لوحة تحكم سهم.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative pr-5 pb-1">
                    <span className="absolute -right-[9px] top-1.3 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[9px] text-gray-400">3</span>
                    <span className="text-[9px] font-extrabold uppercase py-0.5 px-2.5 rounded bg-slate-800 text-gray-400">الربع الثالث 2026: باقة قطاع الأعمال المخصص (V3 Enterprise)</span>
                    <h4 className="text-xs font-bold text-gray-450 mt-1">التنبؤ المتقدم لسلسلة الإمداد واستيراد المعطيات والمحاسبة الذكية</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                      ربط خوارزميات التنبؤ بنفاد رصيد المخزن المتقدم، تنبيهات الاستهلاك التلقائية، تصفح أرصدة الموردين، ودعم مخرجات الزكاة والضرائب لقطاع السلع المتكاملة.
                    </p>
                  </div>

                </div>
              </div>

              {/* Startup MVP Core Launch Plan */}
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                  <Zap className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-xs font-black">تفصيل وخطة إطلاق منتج الـ SaaS الأولي (MVP Objective)</h3>
                </div>

                <div className="space-y-3.5 text-xs text-gray-300">
                  <p className="leading-relaxed">
                    من أجل التحقق السريع من ملاءمة المنتج للسوق وحل الصداع المالي للتجار، فإن خطة MVP تركز على تقديم القيم التالية:
                  </p>
                  
                  <div className="space-y-2 border-t pt-2" style={{ borderColor: theme.border }}>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-gray-400">لوصف الفواتير السريع ومزامنة منصة سلة والضرائب الوطنية.</span>
                      <strong className="text-amber-400">1. البساطة المحاسبية:</strong>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-gray-400">لتنظيم تدفق الإمدادات وحمايتها بقرارات تفحص فوري.</span>
                      <strong className="text-amber-400">2. سلاسل التوريد:</strong>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-gray-400">مع ردود عملاء واتساب مدمجة لخفض مصاريف التشغيل اليومية.</span>
                      <strong className="text-amber-400">3. وكيل مبيعات آلي:</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-emerald-400 font-extrabold text-[11px] block text-center mb-0.5">جاهزية سهم المعيارية الحالية</span>
                    <p className="text-[9px] text-gray-400">
                      النظام الحالي يتضمن واجهات متلائمة مع سيناريوهات التجربة ليربطكم مع Supabase و APIs حقيقية لتفعيل المنتج بمجرد وضع مفاتيح الربط.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
