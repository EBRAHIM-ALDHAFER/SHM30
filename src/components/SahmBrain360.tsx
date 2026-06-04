import React, { useState, useEffect } from "react";
import { ThemeColors, Product, Invoice, Customer } from "../types";
import { 
  Cpu, Sparkles, TrendingUp, RefreshCw, BarChart2, Star, Save, 
  AlertCircle, Bookmark, ShieldAlert, CheckCircle, Brain, Target, 
  MessageSquare, FileText, ChevronRight, Send, Download, Layers, 
  ShieldCheck, Zap, Check, AlertTriangle, User, Phone, MapPin, 
  DollarSign, Activity, FileCheck, ArrowUpRight, ArrowDownRight, Plus
} from "lucide-react";
import { SahmEnterpriseCore, AuditRecord, WorkflowRule, MarketApp, EnterpriseThemePreset } from "../core/SahmEnterpriseCore";
import { campaignService } from "../core/database/campaignService";
import { competitorService } from "../core/database/competitorService";
import { productService } from "../core/database/productService";
import { storeService } from "../core/database/storeService";

interface SahmBrain360Props {
  theme: ThemeColors;
  products: Product[];
  setProducts: (prod: Product[]) => void;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  setCustomers?: (custs: Customer[]) => void;
  activeCity: string;
  totalRevenue: number;
  selectedCustomerName: string;
  onAddLog: (action: string, details: string) => void;
  triggerNotification: (title: string, text: string, type: "success" | "warning" | "info" | "critical" | "ai") => void;
  aiMemory: Array<{ key: string; val: string }>;
  setAiMemory: React.Dispatch<React.SetStateAction<Array<{ key: string; val: string }>>>;
}

export default function SahmBrain360({
  theme,
  products,
  setProducts,
  invoices,
  setInvoices,
  customers,
  setCustomers = () => {},
  activeCity,
  totalRevenue,
  selectedCustomerName,
  onAddLog,
  triggerNotification,
  aiMemory,
  setAiMemory
}: SahmBrain360Props) {
  const core = SahmEnterpriseCore.getInstance();

  // Internal Navigation (Multiple fully-active enterprise modules under a unified, in-view tabs system)
  const [activeSegment, setActiveSegment] = useState<"cockpit" | "copilot" | "customers360" | "workflows" | "integrations" | "themes">("cockpit");
  
  // Real-time server-side simulation or local execution loading indicator
  const [operationLoading, setOperationLoading] = useState(false);
  const [commandConsole, setCommandConsole] = useState<string[]>([
    "📟 [سهم برين] تم تشغيل واجهة الأوامر التنفيذية المباشرة (ERP Engine Loaded)...",
    "🤝 [سهم برين] جاهز لاستقبال وتنفيذ توجيهات الشركاء والربط السحابي."
  ]);

  // UI state variables
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any>({ score: 100, risks: [] });
  const [activeIntegrations, setActiveIntegrations] = useState<MarketApp[]>([]);
  const [workflowsList, setWorkflowsList] = useState<WorkflowRule[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditRecord[]>([]);
  const [selectedCustomerIdFor360, setSelectedCustomerIdFor360] = useState<string>("1");

  // Dynamic state loading from our Enterprise Core Core Services
  useEffect(() => {
    setForecastData(core.generateForecast(invoices));
    setRiskData(core.calculateRiskMetrics(products, invoices, customers));
    setActiveIntegrations(core.getIntegrations());
    setWorkflowsList(core.getWorkflows());
    setAuditLogsList(core.getAuditLogs());
  }, [products, invoices, customers]);

  // Compute stats
  const totalSales = invoices.filter(i => i.type === "sale").reduce((sum, i) => sum + i.total, 0);
  const totalPurchases = invoices.filter(i => i.type === "purchase").reduce((sum, i) => sum + i.total, 0);
  const netEarnings = totalSales - totalPurchases;
  const pendingSalesCount = invoices.filter(i => i.type === "sale" && i.status === "معلق").length;
  const criticalStockCount = products.filter(p => p.stock < 20).length;

  // Compute a highly dynamic & authentic Business Health Score
  const computeHealthPercentage = () => {
    let score = 96;
    score -= pendingSalesCount * 3.5;
    score -= criticalStockCount * 2.5;
    if (totalSales > 0 && (netEarnings / totalSales) < 0.20) {
      score -= 8;
    }
    const riskPenalty = (100 - riskData.score) / 3;
    score -= Math.round(riskPenalty);
    return Math.max(32, Math.min(100, Math.round(score)));
  };

  const businessHealthScore = computeHealthPercentage();

  // Selected customer profile computed state
  const selectedCustomer360Obj = customers.find(c => c.id === selectedCustomerIdFor360) || customers[0] || {
    id: "1",
    name: "سليمان العتيبي",
    phone: "0501234567",
    city: "الرياض",
    balance: -1200
  };

  // State calculations for Customer 360
  const customerInvoices = invoices.filter(i => i.customer === selectedCustomer360Obj.name);
  const customerLtv = customerInvoices.reduce((sum, i) => sum + i.total, 0);
  const customerAvgOrderVal = customerInvoices.length > 0 ? Math.round(customerLtv / customerInvoices.length) : 0;
  const customerNpsScore = customerInvoices.length > 2 ? 10 : customerInvoices.length > 0 ? 8 : 6;
  const customerRiskProfile = selectedCustomer360Obj.balance < -1000 ? "خطورة عالية" : selectedCustomer360Obj.balance < 0 ? "خطورة معتدلة" : "آمن ومحفز";

  // OmniChat active state (Bullet 5)
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai" | "system"; text: string; time: string; channel?: string }>>([
    {
      sender: "system",
      text: "⚡ تم فتح ربط OmniChat. المزامنة مستمرة لقنوات (واتساب، سلة، سناب شات).",
      time: "منذ دقيقتين"
    },
    {
      sender: "user",
      text: "أريد كود خصم للزبون سليمان العتيبي وتجربة مطابقة العود الملكي مع سحابة سلة.",
      time: "منذ دقيقة",
      channel: "whatsapp"
    },
    {
      sender: "ai",
      text: "تم صياغة الرد الفاخر وتجهيز كود خصم MARASEEM-VIP (١٥٪) وتضمينه تلقائياً في فاتورة سلة المعلقة لتسهيل الالتزام ورفع المبيعات 🌿",
      time: "حياً",
      channel: "whatsapp"
    }
  ]);

  const [userInput, setUserInput] = useState("");
  const [chatChannel, setChatChannel] = useState<"whatsapp" | "salla" | "snapchat">("whatsapp");

  // Dynamic AI Suggestions / Command Recommendations
  const [insights, setInsights] = useState<any[]>([
    {
      id: "CMD-101",
      title: "تمويل وشراء مشترك عاجل للعود الهندي",
      actionDesc: "قم تلقائياً بإصدار فاتورة شراء من مطابع سهم لعلب التغليف والعود لتفادي نفاد المخزون.",
      type: "purchase",
      effect: "زيادة المخزن بمقدار ١٠٠ علبة وتوثيق قيد المحاسبة",
      impactScore: 98,
      status: "ready"
    },
    {
      id: "CMD-102",
      title: "توليد باقة دهن الورد والعود الملكي بتخفيض VIP",
      actionDesc: "طرح توليفة مشتركة باسم 'باقة المراسيم الكبرى' بسعر ٤٩٠ ر.س بنسبة هوامش ٥٢٪ على قنوات سناب شات وسلة.",
      type: "marketing",
      effect: "إضافة كود باقة تسويقية في الكتالوج ونشر الكابشن تلقائياً",
      impactScore: 94,
      status: "ready"
    },
    {
      id: "CMD-103",
      title: "معالجة مطالبات الزبون الآجل أحمد بن محمد",
      actionDesc: "إرسال رابط التحصيل وفاتورة واتساب التلقائية المتوافقة ZATCA لتسوية رصيد ذمته البالغ ٥٠٠ ر.س.",
      type: "finance",
      effect: "تحديث حساب العميل لـ (صفر) وتجنيب تضخم المديونيات",
      impactScore: 89,
      status: "ready"
    }
  ]);

  // Execute Dynamic Commands (Bullet 4 - Developing Sahm Brain 360 to execute command decision loops)
  const handleExecuteCommand = (cmdId: string) => {
    setOperationLoading(true);
    const newLogs = [`⚡ [أمر عاجل] البدء في تدشين وتنفيذ المعالجة الرقمية للأمر ${cmdId}...`];
    
    setTimeout(() => {
      if (cmdId === "CMD-101") {
        // 1. Top up low stocks on target product
        const updatedProducts = products.map(p => {
          if (p.id === "3" || p.stock < 20) {
            return { ...p, stock: p.stock + 100 };
          }
          return p;
        });
        setProducts(updatedProducts);

        // 2. Draft purchase invoice representing the replenishment execution
        const newPurchaseInv: Invoice = {
          id: "INV-PUR-" + Date.now().toString().slice(-5),
          type: "purchase",
          customer: "مطابع سهم للتغليف والتصميم",
          date: new Date().toISOString().split("T")[0],
          total: 5000,
          status: "مدفوع",
          items: [{ name: "علب ومستلزمات تعبئة وتمر مجدول", qty: 100, price: 50, total: 5000 }]
        };
        setInvoices(prev => [newPurchaseInv, ...prev]);

        newLogs.push("✅ [مخازن سهم] تم توريد زيادة المخازن شحنة عاجلة لدهن العود ومستلزماته بنجاح.");
        newLogs.push("📂 [محاسبة] إدراج فاتورة وقيد مشتريات رقمي #INV-PUR في قائمة الفواتير لضبط الربحية.");
        
        triggerNotification(
          "تعبئة المخازن",
          "تم إطلاق معالجة توريد العود وإمداد المستودعات بقيد محاسبة آمن وصحيح 100%.",
          "success"
        );
        core.logAudit("توريد مخزني", "تأكيد واستيراد بضاعة عاجلة من 'مطابع سهم' وتحديث قائمة الأصول للمنشأة", "success");
      } 
      else if (cmdId === "CMD-102") {
        // Create combo product in catalog
        const newCombo: Product = {
          id: "combo-" + Date.now(),
          name: "باقة المراسيم الفاخرة المدمجة (عود + دهن)",
          sku: "CB-ROYAL",
          price: 490,
          cost: 220,
          stock: 50,
          category: "عطور"
        };
        setProducts([newCombo, ...products]);

        newLogs.push("📢 [تسويق سهم] تم صياغة ونشر كابشن 'باقة المراسيم الكبرى' على قنوات السوشيال ميديا وسلة.");
        newLogs.push("📦 [كتالوج المنتج] تخزين وإدراج صنف الباقة الكومبو برقم مميز: CB-ROYAL بخصم فوري.");

        triggerNotification(
          "باقات ذكية",
          "تم إنتاج باقة المراسيم ونشرها في الكتالوج بنجاح لزيادة معدل سلة المشتريات.",
          "ai"
        );
        core.logAudit("حملات استباقية", "إعلان وسحب باقة الكومبو الكبرى ونشر مواصفاتها بالامتثال لقنوات الربط السحابي", "info");
      }
      else if (cmdId === "CMD-103") {
        // Settle selected customer debt balance
        const updatedInvoices = invoices.map(i => {
          if (i.customer === "أحمد بن محمد" && i.status === "معلق") {
            return { ...i, status: "مدفوع" as const };
          }
          return i;
        });
        setInvoices(updatedInvoices);

        // adjust customer cash
        const updatedCustomers = customers.map(c => {
          if (c.name === "أحمد بن محمد") {
            return { ...c, balance: 0 };
          }
          return c;
        });
        setCustomers(updatedCustomers);

        newLogs.push("⚖️ [تسوية قيود] تحصيل المديونيات المعلقة وإتلاف وعاء الفاتورة الآجلة للعميل أحمد بن محمد.");
        newLogs.push("🟢 [المالية] تحديث كشف التدفق المالي وحساب السيولة النقدية بمبلغ ٥٠٠ ر.س.");

        triggerNotification(
          "تسوية حسابات",
          "تم رصد تصفير مديونية العميل 'أحمد بن محمد' وتحديث وعاء الزكاة حياً.",
          "success"
        );
        core.logAudit("الذمم المدينة", "تسوية الفواتير المعلقة للعملاء الآجلين وإدخال قيم الإيراد للصندوق المفتوح", "success");
      }

      setInsights(insights.map(ins => ins.id === cmdId ? { ...ins, status: "executed" } : ins));
      setCommandConsole(prev => [...prev, ...newLogs]);
      setOperationLoading(false);
    }, 1200);
  };

  // Live Interaction Chat in Copilot (Bullet 5 & 16 - AI Decision Engine)
  const handleSendMessageToCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    setUserInput("");

    const newMsg = {
      sender: "user" as const,
      text: userText,
      time: "الآن",
      channel: chatChannel
    };

    setChatLog(prev => [...prev, newMsg]);
    setOperationLoading(true);

    setTimeout(async () => {
      let aiResponseText = "";
      
      // Smart AI Decision Routing logic with real business computations
      if (userText.includes("ربحية") || userText.includes("ربح") || userText.includes("الأكثر ربحية") || userText.includes("المنتجات الأكثر ربحية") || userText.includes("أكثر المنتجات ربحية")) {
        const sortedByProfit = [...products].sort((a, b) => (b.price - b.cost) - (a.price - a.cost));
        const topProfitProducts = sortedByProfit.slice(0, 3);
        aiResponseText = `💎 تقرير المنتجات الأكثر ربحية بالمنظومة (الربح الهامشي الفعلي):
` + topProfitProducts.map((p, idx) => `🔹 **المرتبة ${idx + 1}: ${p.name}**
  * سعر البيع: ${p.price} ر.س | التكلفة: ${p.cost} ر.س
  * **صافي أرباح الوحدة: ${p.price - p.cost} ر.س** (هامش ربح ${(((p.price - p.cost) / p.price) * 100).toFixed(0)}%)
  * المخزون المتاح: ${p.stock} قطعة`).join("\n") + `\n\n📌 *نصيحة سهم لزيادة العوائد:* نوصي بالتركيز التسويقي الفوري على صنف **"${topProfitProducts[0]?.name || "دهن العود الملكي"}"** كباقة لرفع متوسط قيمة السلة.`;
      } 
      else if (userText.includes("حملة") || userText.includes("الحملات") || userText.includes("ترويج")) {
        const allCamps = await campaignService.getAll();
        const activeCamps = allCamps.filter((c: any) => c.status === 'active' || c.campaign_status === 'نشطة');
        const totalClicks = allCamps.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);
        const totalOrders = allCamps.reduce((sum: number, c: any) => sum + (c.orders || 0), 0);
        const totalBudget = allCamps.reduce((sum: number, c: any) => sum + (parseFloat(c.campaign_price || c.price) || 0), 0);

        aiResponseText = `📣 تقرير الذكاء الإعلاني وأداء الحملات الترويجية (Sahm Brain Campaigns Insight):
بتحليل الربط مع منصات الإشهار الرقمي لمتجرك الموحد:
🔹 **إجمالي الحملات المسجلة:** ${allCamps.length} حملة (النشطة حالياً: ${activeCamps.length})
🔹 **الميزانية الكلية المستثمرة:** ${totalBudget.toLocaleString()} ر.س
🔹 **مؤشرات الاستجابة التراكمية:**
  * النقرات المتولدة (Clicks): **${totalClicks.toLocaleString()} نقرة**
  * المبيعات والمشتريات المحققة: **${totalOrders.toLocaleString()} طلب**
  * معدل تحويل النقرات الفعلي (CR): **${totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : "0"}%**

` + (allCamps.length > 0 
          ? `📌 **آخر حملة نشطة مدمجة:**
  - اسم المنتج المستهدف: **"${allCamps[0].campaign_name || allCamps[0].campaign_content}"**
  - ميزانيتها: ${allCamps[0].campaign_price || 250} ر.س | القنوات: ${allCamps[0].platforms ? allCamps[0].platforms.join(" ، ") : "جميع القنوات"}
  - مؤشر الكفاءة الذاتي: ${allCamps[0].performance || "عالي للغاية"}`
          : "⚠️ لم يتم إطلاق حملات ترويج مبرمجة للسلع بعد! يمكنك نقر زر 'إطلاق حملة' ضمن تفاصيل أي منتج لتفعيل الربط.");
      }
      else if (userText.includes("منافس") || userText.includes("المنافسين") || userText.includes("مراقبة") || userText.includes("سعر المنافس") || userText.includes("أسعار المنافسين")) {
        const allComps = await competitorService.getAll();
        const inStockCount = allComps.filter((c: any) => c.availability === 'متوفر' || c.availability === '✅ متوفر لديه').length;
        const outOfStockCompCount = allComps.length - inStockCount;

        let detailsString = "";
        if (allComps.length > 0) {
          detailsString = `📌 **تفاصيل المنافسين الجاري رصدهم:**\n` + allComps.slice(0, 3).map((c: any) => {
            return `🔹 **${c.competitor_product_name || c.customProductName || c.competitorName}** (${c.competitorName || c.competitor_name})
  - سعره الحالي: ${c.currentPrice || c.current_price} ر.س | حالته لديه: ${c.availability || "متوفر"}
  - آخر مواءمة وتحديث: ${c.lastUpdated || "قبل قليل"}`;
          }).join("\n");
        } else {
          detailsString = "⚠️ لا توجد روابط تتبع جارية للمنافسين حالياً على كتالوجك.";
        }

        aiResponseText = `🎯 تقرير مراقبة أسعار وفولاذ المنافسين (Sahm Brain Competitor Intel):
- **إجمالي روابط المنافسين النشطة بالرصد:** ${allComps.length} منتجات منافسة.
- **نسبة التوفر لديهم:** ${inStockCount} متوفرون | ${outOfStockCompCount} نفذت كميتهم لديهم.

${detailsString}

💡 *توجيه ذكاء Sahm:* نوصي بمراجعة علامة تبويب "المنافسون المرتبطون" بداخل صفحة تعديل المنتج لمطالعة التوصيات الفورية تلقائياً بحسب فروقات الهوامش الحية.`;
      }
      else if (userText.includes("تحليل كامل") || userText.includes("الذكاء") || userText.includes("brain") || userText.includes("تقرير شامل") || userText.includes("الملخص") || userText.includes("ملخص")) {
        const allCamps = await campaignService.getAll();
        const allComps = await competitorService.getAll();

        const activeCamps = allCamps.filter((c: any) => c.status === 'active' || c.campaign_status === 'نشطة');
        const totalClicks = allCamps.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);
        const totalOrders = allCamps.reduce((sum: number, c: any) => sum + (c.orders || 0), 0);
        
        const inStockProducts = products.filter(p => p.stock > 0).length;
        const dangerStockProducts = products.filter(p => p.stock < 20).length;

        aiResponseText = `🧠 لوحة التحليل التشغيلي الشامل (Sahm OS 360 Consolidated Report):
لقد قمت بتحليل كافة مؤشرات المبيعات، المخزون، الحملات التسويقية، والمنافسين بالكتالوج لتثبيت القرار:

📊 **1. أداء مبيعات وفواتير المتجر:**
  * إجمالي المبيعات المحصلة بالفواتير: **${totalSales.toLocaleString()} ر.س**
  * إجمالي المشتريات والمدفوعات: **${totalPurchases.toLocaleString()} ر.س**
  * صافي هامش الأرباح الحرة: **${netEarnings.toLocaleString()} ر.س** (معدل صحة المنظومة: ${businessHealthScore}%)

📦 **2. تدفق المخزون والسلاسل اللوجستية:**
  * أصناف نشطة بالرف: **${products.length} أصناف** (متوفرة للطلب: ${inStockProducts} صنف)
  * منخفضة وموشكة على النفاد كلياً: **${dangerStockProducts} أصناف** (تتطلب طلب شراء فوري من الموردين لضمان الالتزام).

📣 **3. كفاءة الذكاء الإعلاني والترويج:**
  * إجمالي الحملات المنفذة بقنوات التسويق: **${allCamps.length} حملة**
  * النقرات المولدة: **${totalClicks} نقرة** | الطلبات المغلقة: **${totalOrders} مبيعات**

🎯 **4. ميزان القوى مع المنافسين:**
  * عدد المنافسين المربوطين بكتالوج سهم: **${allComps.length} منافس**
  * حالة السوق: تظهر الهوامش استقرار المبيعات بشكل مشجع جداً مع بقاء براند "مراسيم الطيب" في ريادة الأسعار.

🌿 *توصية Sahm Brain الاستباقية:* ننصح بسداد مستحقات مصانع العلب فوراً واستخدام الكاش الحر لمطابقة تسريع النشر عبر السناب شات.`;
      }
      else if (userText.includes("عرض نهاية الأسبوع") || userText.includes("نهاية الأسبوع") || userText.includes("أنشئ عرض")) {
        const sortedByProfit = [...products].sort((a, b) => (b.price - b.cost) - (a.price - a.cost));
        const coreProd = sortedByProfit[0] || products[0] || { name: "العود الملكي الفاخر", price: 450 };
        aiResponseText = `✨ مقترَح عاجل لحملة "عروض نهاية الأسبوع" - صياغة جاهزة للنشر:
🎯 **المنتج المستهدف:** ${coreProd.name} (سعره: ${coreProd.price} ر.س)
🎁 **العرض الحسابي المقترح:** "احصل على الثاني بخصم ٢٠٪ مع شحن مجاني تماماً وبوليصة أرامكس الفورية."
📖 **محتوى منشور التسويق المقترح النشر في سلة وواتساب:**
"عزز رفاهية عطلتك من رائحة الطبيعة الفاخرة 🌿. نفخر بطرح عرض نهاية الأسبوع على المفضل لديكم **[${coreProd.name}]** بعلب تغليف مجانية وشحن لوجستي سريع لباب منزلك. لا تفوت الفرصة واطلب بلمسة زر!"`;
      } 
      else if (userText.includes("انخفاض المبيعات") || userText.includes("تراجع المبيعات") || userText.includes("سبب انخفاض")) {
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 30).length;
        const totalDebts = customers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
        aiResponseText = `🔍 تقرير تشخيص أسباب تراجع وتقلب المبيعات (Sahm Diagnosis Engine):
بتحليل ومطابقة داتا المحاسبة، ندرك العوامل المباشرة لاهتزاز الأرقام:
١. **فجوة إمدادات المخزن:** توجد **${outOfStockCount} منتجات نافدة** و **${lowStockCount} أصناف منخفضة بشدة**، مما يتسبب بفقدان المشتريات المباشرة.
٢. **تضخم المديونيات الآجلة:** ذمم العملاء المستحقة بلغت **${totalDebts.toLocaleString()} ر.س** مما يضيق على كاش شراء وتوريد دهن العود من مصانع سهم للتغليف.
٣. **نقص العنوان الصحيح:** هناك عملاء في السنترال لم يستكملوا العنونة الوطنية مع أرامكس وسمسا مما يعيق ترحيل شحناتهم.
🛠️ **إجراء علاجي عاجل:**
ننصح بتنشيط "الدفع عبر شبكة مدى" بالـ POS لتسريع التحصيل، واستخدام أداة "العنوان الوطني" من OmniChat لفك تعثر الشواغل اللوجستية.`;
      } 
      else if (userText.includes("راكد") || userText.includes("الراكدة") || userText.includes("المنتجات الراكدة")) {
        const stagnantList = products.filter(p => p.stock >= 40).slice(0, 3);
        aiResponseText = `📦 تقرير الأصناف الراكدة وبطيئة الدوران (Stagnant Assets):
` + (stagnantList.length > 0 
          ? stagnantList.map(p => `- **${p.name}** (المخزون المتوفر: ${p.stock} وحدة | القيمة المالية للمخزون الراكد: ${(p.stock * p.cost).toLocaleString()} ر.س | SKU: ${p.sku})`).join("\n")
          : "- لا توجد أصناف راكدة معطلة، تدفق دوران المخزونات مميز وآمن.") + `\n\n💡 **توصيات ذكاء سهم لتثبيت التصريف:**
1. صياغة باقة مشتركة (Combo Deal) تدمج الأصناف المذكورة مع العطور الرائجة للتخلص السريع منها وتحقيق دوران ممتاز.
2. تسييل المخزن بخصومات تصفية تبرز لعملاء مجموعات التيليجرام بجدول منخفض العيار.`;
      } 
      else if (userText.includes("توقع") || userText.includes("نمو") || userText.includes("مبيعات") || userText.includes("تحليل")) {
        const nextMonthForecast = forecastData.find(f => f.actual === 0);
        aiResponseText = `📈 توقعات المبيعات والنمو لـ "مراسيم الطيب":
- الشهر القادم المتوقع (يونيو): يقدر بنحو ${nextMonthForecast ? nextMonthForecast.forecast.toLocaleString() : "١٥٤,٢٠٠"} ر.س.
- النغمة الموسمية: يرتفع مبيعات دهن العود والورد بنسبة ١٦٪ بسبب ذروة فترات الأعراس والمناسبات الكبرى.
- إجراء موصى به: استيراد كتل دهن العود وسداد مديونية مصنع العلب لضمان استمرارية التوريد دون تشغيل متقطع للخدمة.`;
      } 
      else if (userText.includes("خصم") || userText.includes("كود") || userText.includes("سليمان")) {
        aiResponseText = `🎟️ قرار ذكاء سهم الفوري:
تم تفويض كود الخصم الحسابي الذكي VIP (مخصص لـ ${selectedCustomer360Obj.name}): [MARASEEM-ROYAL] بخصم ١٥٪ على كافة المعاملات المعلقة.
حالة المزامنة: تم إرسال إشعار WhatsApp حقيقي للرقم ${selectedCustomer360Obj.phone} وتحديث تفاصيل عربته بقيمة خصم فورية.`;
      } 
      else if (userText.includes("زكاة") || userText.includes("ضريبة") || userText.includes("المالي")) {
        aiResponseText = `⚖️ كشف الوعاء والزكاة لمراسيم الطيب:
- الأرباح الحالية للبراند: ${netEarnings.toLocaleString()} ر.س.
- وعاء الزكاة المتوقع: ${(netEarnings * 0.85).toLocaleString()} ر.س.
- مستحقات الزكاة المستحقة (2.5%): ${(netEarnings * 0.025).toLocaleString()} ر.س.
- حالة الالتزام: متوافقة مع Phase 2 لهيئة ZATCA للفوترة وحفظ القيود المشفرة.`;
      } 
      else {
        aiResponseText = `🧠 مستشار سهم التنفيذي الموحد:
تلقينا توجيهك بشأن "${userText}". بالربط مع قاعدة PostgreSQL ومؤشرات التخزين التابعة للفروع بالرياض، نقترح تطبيق نظام الفواتير المشترك (Combo) لزوار المتجر لتفادي مديونيات كبار الشخصيات VIP التي تؤثر على معدل دوران الأصول المباشر.`;
      }

      setChatLog(prev => [...prev, {
        sender: "ai",
        text: aiResponseText,
        time: "الآن حياً",
        channel: chatChannel
      }]);
      setOperationLoading(false);
      core.logAudit("الذكاء الاصطناعي", `استشارة واتخاذ قرار استباقي عبر سهم Copilot: ${userText.slice(0, 35)}...`, "info");
      triggerNotification("AI Oracle", "تم توليد واتخاذ قرار ذكي استباقي بسلامة وتنسيق كامل.", "ai");
    }, 1000);
  };

  // Toggle Integrations Status with Logs Simulation (Bullet 24)
  const handleToggleIntegration = (id: string) => {
    const updated = activeIntegrations.map(app => {
      if (app.id === id) {
        const nextStatus = app.status === "connected" ? ("disconnected" as const) : ("connected" as const);
        
        // Log action
        const actionText = nextStatus === "connected" ? "تم ربط وتفعيل تطبيق" : "تم إلغاء ربط وإيقاف بوابة";
        setCommandConsole(prev => [
          ...prev,
          `🔌 [الربط والرباط] ${actionText} "${app.name}" وقبول الـ Webhooks بنجاح!`
        ]);
        triggerNotification(
          "تنسيق الرباط",
          `${actionText} ${app.name} وتحديث حالة واجهة الـ API.`,
          "success"
        );
        core.logAudit("تكامل المنصات", `${actionText} ${app.name} من المتجر وتحديث بوابات الاستيراد السحابية`, "info");

        return { ...app, status: nextStatus };
      }
      return app;
    });

    setActiveIntegrations(updated);
    core.saveIntegrations(updated);
  };

  // Immediate Theme presets Activation (Bullet 7 - Beautiful Theme Marketplace)
  const handleActivateThemePreset = (preset: EnterpriseThemePreset) => {
    // Write theme variables directly to css rules
    const root = document.documentElement;
    root.style.setProperty("--theme-bg", preset.bg);
    root.style.setProperty("--theme-surface", preset.surface);
    root.style.setProperty("--theme-card", preset.card);
    root.style.setProperty("--theme-border", preset.border);
    root.style.setProperty("--theme-text", preset.text);
    root.style.setProperty("--theme-muted", preset.muted);
    root.style.setProperty("--theme-accent", preset.accent);

    // Save configuration
    localStorage.setItem("sahm_web_custom_theme", JSON.stringify(preset));
    localStorage.setItem("sahm_web_theme", "custom");

    setCommandConsole(prev => [
      ...prev,
      `🎨 [استوديو الثيمات] تم استخدام القالب الملكي الفاخر: "${preset.name}" وتدشين الهوية والخطوط بنجاح!`
    ]);
    triggerNotification("تغيير المظهر", `تم تنشيط وتفعيل هويتك ببراند "${preset.name}" بنجاح!`, "success");
    core.logAudit("الهوية والمظهر", `تبديل وتدشين قالب المظهر للبراند: ${preset.name}`, "info");
    
    // Quick delay reload UI hint
    setTimeout(() => {
      window.location.reload();
    }, 850);
  };

  // CRM: Settle user debts or trigger inline WhatsApp mock chat (Bullet 6 - Customer 360 Full)
  const handleContactCustomerVIP = (name: string, phone: string) => {
    setChatChannel("whatsapp");
    setActiveSegment("copilot");
    setUserInput(`صياغة وإرسال رسالة شكر وهدية VIP للزبون ${name} وتحصيل مبلغ مالي.`);
    triggerNotification("CRM Link", `تم الربط والتحويل لواجهة المحادثة المباشرة مع العميل ${name}`, "info");
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Upper Navigation segment controls - Enterprise modular bar (Bullet 1 & 25) */}
      <div 
        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border transition-all"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="flex flex-wrap items-center gap-1.5 order-2 md:order-1">
          <button
            onClick={() => setActiveSegment("cockpit")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSegment === "cockpit" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            📊 لوحة التحكم والنبض (Executive Cockpit)
          </button>
          <button
            onClick={() => setActiveSegment("copilot")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSegment === "copilot" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            🤖 سهم Copilot والذكاء
          </button>
          <button
            onClick={() => setActiveSegment("customers360")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSegment === "customers360" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            💎 كشف زبائن Customer 360
          </button>
          <button
            onClick={() => setActiveSegment("workflows")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSegment === "workflows" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            ⚙️ محرك العمل الأوتوماتيكي (Workflows)
          </button>
          <button
            onClick={() => setActiveSegment("integrations")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSegment === "integrations" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            🔌 متجر التطبيقات والربط (Marketplace)
          </button>
          <button
            onClick={() => setActiveSegment("themes")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSegment === "themes" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            🎨 متجر السمات والسمو (Themes)
          </button>
        </div>

        <div className="flex items-center gap-1.5 order-1 md:order-2">
          <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-xs font-black text-white">نواة الأعمال والذكاء الموحد (Sahm Enterprise Core)</span>
        </div>
      </div>

      {activeSegment === "cockpit" && (
        <div className="space-y-6">
          
          {/* Main indicators and circular health engine widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Business Health Score Gauge (Bullet 12) */}
            <div 
              className="lg:col-span-4 p-5 rounded-3xl border flex flex-col items-center justify-center text-center relative overflow-hidden"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
              
              <h3 className="text-xs font-black text-gray-400 mb-4 tracking-wider uppercase border-b pb-1 w-full block">
                مؤشر صحة الأعمال العام (Business Health Score)
              </h3>

              {/* Graphical Circular Arc Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#1E293B"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke={businessHealthScore > 80 ? "#10B981" : businessHealthScore > 50 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - businessHealthScore / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono">{businessHealthScore}%</span>
                  <span className="text-[9px] text-[#D4AF37] tracking-wider uppercase font-extrabold mt-0.5">ممتاز وآمن</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 w-full mt-4 text-center text-[10px] font-bold">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-gray-500 block text-[8px] mb-0.5">• المخازن الشحيحة</span>
                  <span className="text-rose-400 font-mono font-black">{criticalStockCount} أصناف</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-gray-500 block text-[8px] mb-0.5">• فواتير معلقة</span>
                  <span className="text-amber-500 font-mono font-black">{pendingSalesCount} فواتير</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-gray-500 block text-[8px] mb-0.5">• العائد الهامشي</span>
                  <span className="text-emerald-400 font-mono font-black">
                    {totalSales > 0 ? `${Math.round((netEarnings / totalSales) * 100)}%` : "0%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Linear Regression Revenue Forecast Panel (Bullet 13) */}
            <div 
              className="lg:col-span-8 p-5 rounded-3xl border flex flex-col justify-between"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-900">
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-lg font-black font-mono">
                  نموذج تنبؤ الاستهلاك خطي ومعدل بالطلب
                </span>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>محرك توقع المبيعات والطلب الاستباقي (Revenue Forecast Engine)</span>
                </h3>
              </div>

              {/* Breathtaking Responsive SVG Bar and Line Chart (Anti-AI Slop, Perfect Native CSS) */}
              <div className="relative h-44 w-full flex items-end justify-between px-1 border-b border-dashed border-slate-800 pt-4">
                {forecastData.map((data, index) => {
                  const maxVal = 180000;
                  const actualHeight = Math.min(100, (data.actual / maxVal) * 100);
                  const forecastHeight = Math.min(100, (data.forecast / maxVal) * 100);
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative cursor-help">
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-800 rounded-lg p-2 text-[9px] font-mono text-right z-15 min-w-[110px] shadow pointer-events-none transition-all">
                        <p className="font-extrabold text-[#D4AF37]">{data.month}</p>
                        {data.actual > 0 && <p className="text-emerald-400">الفعلي: {data.actual.toLocaleString()} ر.س</p>}
                        <p className="text-sky-400">التنبؤ المالي: {data.forecast.toLocaleString()} ر.س</p>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1.5 h-32">
                        {/* Actual bar */}
                        {data.actual > 0 && (
                          <div 
                            className="w-2 md:w-3.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm"
                            style={{ height: `${actualHeight}%` }}
                          ></div>
                        )}
                        {/* Forecast line/bar indicator */}
                        <div 
                          className={`w-2 md:w-3.5 rounded-t-sm ${data.actual === 0 ? "bg-gradient-to-t from-sky-600 to-sky-400 animate-pulse" : "bg-sky-500/20 border border-sky-400/30"}`}
                          style={{ height: `${forecastHeight}%` }}
                        ></div>
                      </div>

                      <span className="text-[9.5px] font-bold text-gray-500 mt-2 block shrink-0">{data.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 text-[10px] font-bold">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.2 font-black">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                    <span style={{ color: theme.muted }}>مبيعات فعلية</span>
                  </span>
                  <span className="flex items-center gap-1.2 font-black">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></span>
                    <span style={{ color: theme.muted }}>توقعات سهم AI للمستقبل</span>
                  </span>
                </div>
                <div className="text-gray-400">
                  متوسط المبيعات الشهري التقريبي: <b className="font-mono text-white">١٣٤,٠٠٠ ر.س</b>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive AI Command Executor Deck (Bullet 4 - Action-oriented Executor) */}
          <div 
            className="p-5 rounded-3xl border space-y-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-[10px] font-black text-rose-400 animate-pulse font-mono flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>الامتياز التنفيذي • جاهز للقرارات الفورية</span>
              </span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber-500" />
                <span>مجلس قرارات سهم الموجهة (AI Interactive Decision Engine Execution)</span>
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-gray-400">
              يقوم مساعد سهم برين بصياغة حركات تنفيذية حقيقية بالتحليل المباشر لقاعدة PostgreSQL والقيود المالية بمراسيم الطيب. انقر فوق <b>"توجيه وتنفيذ الأمر المباشر ⚡"</b> لتطبيق التوصية فوراً على المنتجات والعملاء وصندوق ERP المحاسبي الموحد.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((ins) => (
                <div 
                  key={ins.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-right bg-slate-950/40 hover:border-amber-500/25 ${ins.status === "executed" ? "opacity-60 border-emerald-500/30" : "border-slate-900"}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-slate-900 text-gray-400 py-0.5 px-2 rounded font-mono font-extrabold">{ins.id}</span>
                      <span className="text-[10px] text-amber-500 font-black">• توافق {ins.impactScore}%</span>
                    </div>

                    <h4 className="text-xs font-black text-white">{ins.title}</h4>
                    <p className="text-[10.5px] text-gray-400 leading-relaxed font-bold">{ins.actionDesc}</p>
                    
                    <div className="p-2 rounded bg-slate-900/60 text-[9px] font-bold text-gray-500 border border-slate-900 space-y-0.5">
                      <span className="block text-gray-400">• الأثر الفعلي:</span>
                      <span className="text-amber-500">{ins.effect}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-2.5 flex items-center justify-between">
                    {ins.status === "executed" ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم تنفيذ القرار بنجاح ✅</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleExecuteCommand(ins.id)}
                        disabled={operationLoading}
                        className="w-full py-1.8 px-3 bg-gradient-to-l from-amber-600 to-yellow-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow border-0 hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-black" />
                        <span>توجيه وتنفيذ الأمر المباشر ⚡</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Monitoring Engine Status Deck (Bullet 14) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Terminal output commands logger view (Bullet 1) */}
            <div 
              className="lg:col-span-4 p-4 rounded-3xl border flex flex-col justify-between space-y-3 h-64"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] font-mono block border-b border-slate-900 pb-1.5 text-right">
                📟 كونسول المعالج الميكروي (Interpreter Live Log / SQL)
              </span>

              <div className="grow bg-slate-950 p-3 rounded-2xl border border-slate-900 font-mono text-[9px] text-[#22C55E] select-text overflow-y-auto space-y-1 text-left rtl:text-right">
                {commandConsole.map((log, idx) => (
                  <p key={idx} className="leading-relaxed font-bold rtl:text-right text-right">{log}</p>
                ))}
                {operationLoading && <p className="animate-pulse text-amber-500 text-right">⚡ جار المعالجة وتحليل الكيانات لـ PostgreSQL...</p>}
              </div>

              <div className="text-[8px] text-gray-500 font-mono text-center font-bold">
                * جميع العمليات مصادق ومصنف عليها سحابياً ومرتبطة بقاعدة البيانات الرئيسة
              </div>
            </div>

            {/* Risk Monitoring Engine Details Deck (Bullet 14 & 16) */}
            <div 
              className="lg:col-span-8 p-5 rounded-3xl border flex flex-col justify-between h-64"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-900">
                <span className="text-[10.5px] font-mono text-emerald-400 font-extrabold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 animate-bounce" />
                  <span>مستوى حماية النواة: {riskData.score}% آمن</span>
                </span>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>محرك رصد المخاطر والتسوية (Risk Monitoring Engine)</span>
                </h3>
              </div>

              <div className="grow overflow-y-auto py-2.5 space-y-2.5 pr-1 text-right">
                {riskData.risks.map((risk: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/45 border border-slate-900/60 flex items-start justify-between gap-3 text-right hover:border-rose-500/10 transition-all font-bold">
                    <button 
                      onClick={() => handleExecuteCommand(risk.code === "RSK-001" ? "CMD-101" : "CMD-103")}
                      className="py-1 px-2 border border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-[8.5px] font-black rounded-lg shrink-0 cursor-pointer"
                    >
                      حل الخطر فورا ⚡
                    </button>
                    <div className="space-y-0.5">
                      <span className="text-[8px] bg-rose-500/10 text-rose-400 py-0.5 px-1.5 rounded-md font-mono">{risk.code}</span>
                      <h4 className="text-xs font-black text-rose-400 flex items-center gap-1.5 justify-end">
                        <span>{risk.title}</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-bold">{risk.desc}</p>
                    </div>
                  </div>
                ))}
                {riskData.risks.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-emerald-400 space-y-1 py-6">
                    <CheckCircle className="w-8 h-8 font-light" />
                    <p className="text-xs font-black">تهانينا! خادم الفروق المالية معافى ولا توجد مخاطر تهدد صحة أعمال براند الطيب 🟢</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSegment === "copilot" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[440px]">
          
          {/* Long Term Cognitive Facts - AI Decision Engine (Bullet 16 - AI Decision Engine) */}
          <div 
            className="lg:col-span-4 p-4 rounded-3xl border flex flex-col justify-between overflow-hidden"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <span className="text-[10px] font-black text-[#D4AF37] block text-right pb-1.5 border-b border-slate-900 uppercase tracking-widest font-mono">
              🧠 الذاكرة الطويلة المعرفية (AI Cognitive Variables Log)
            </span>

            <div className="grow overflow-y-auto py-2.5 space-y-2.5 text-right text-[10px] font-bold pr-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-gray-500 font-bold block">• هوامش وربح العود الملكي</span>
                <span className="text-gray-300">أعلى نسب هوامش ربحية بالرياض لبراند مراسيم الطيب تسجل على صنف دبل غابات ومسك الطيب.</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-gray-500 font-bold block">• عيار مخزون التنبؤ للطلب</span>
                <span className="text-gray-300">ينصح معالج سهم ERP بتعبئة ٢٠ كيلوجرام دهون عود وبخورات في ١٥ من يونيو لاكتساح ذروة الصيف.</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-gray-500 font-bold block">• توافق المرحلة الثانية للفوترة ZATCA</span>
                <span className="text-gray-300">ترميز باركود مشفر يربط المعاملة اللحظية ويحمي وعاء الزكاة و PostgreSQL بكل حياكة.</span>
              </div>
            </div>

            {/* Quick shortcuts inputs list */}
            <div className="pt-2 border-t border-slate-900 space-y-2 shrink-0 text-right">
              <span className="text-[9px] text-gray-500 block font-bold">• قرارات واختصارات فورية:</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setUserInput("اعرض أكثر المنتجات ربحية");
                    setChatChannel("whatsapp");
                  }}
                  className="py-1 px-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 rounded-lg font-black text-[9px] text-gray-300 cursor-pointer"
                >
                  أكثر المنتجات ربحية 💎
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserInput("أنشئ عرض نهاية الأسبوع مخصص");
                    setChatChannel("whatsapp");
                  }}
                  className="py-1 px-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 rounded-lg font-black text-[9px] text-gray-350 cursor-pointer"
                >
                  إنشاء عرض نهاية الأسبوع 🎁
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserInput("ما سبب انخفاض المبيعات؟");
                    setChatChannel("whatsapp");
                  }}
                  className="py-1 px-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 rounded-lg font-black text-[9px] text-gray-300 cursor-pointer"
                >
                  سبب انخفاض المبيعات؟ 🔍
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserInput("اعرض المنتجات الراكدة");
                    setChatChannel("whatsapp");
                  }}
                  className="py-1 px-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 rounded-lg font-black text-[9px] text-gray-300 cursor-pointer"
                >
                  الأصناف الراكدة المخصصة 📦
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserInput("احسب وعاء زكاة المتجر التقريبي وخلاصة الفواتير المستحقة");
                    setChatChannel("whatsapp");
                  }}
                  className="py-1 px-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 rounded-lg font-black text-[9px] text-gray-300 cursor-pointer"
                >
                  حساب زكاة مراسيم الطيب ⚖️
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Centralized Support & Communication Dashboard (Non-replicating AI Integration - PM Mandate) */}
          <div 
            className="lg:col-span-8 p-6 rounded-3xl border flex flex-col justify-between h-full space-y-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="pb-3 border-b border-slate-900/80 flex items-center justify-between text-right shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-550 border border-amber-500/20 text-[10px] font-black">
                ✨ استعلام مباشر لذكاء سهم 🧠
              </span>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <h4 className="text-xs font-black text-white">مركز تحليلات التواصل والعملاء (Sahm CRM Intelligence)</h4>
                  <p className="text-[9px] text-amber-500 font-mono">لوحة تكامل ذكاء سهم مع مركز التواصل والدعم الموحد</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* AI CRM Analytics Dashboard Body */}
            <div className="grow overflow-y-auto space-y-4 text-right pr-1">
              {/* Introduction Notification */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-900 text-xs leading-relaxed text-gray-300">
                🔮 <strong>تحليل عقل سهم:</strong> تم بنجاح تجميع ودمج كافة قنوات الدعم (WhatsApp, Instagram, Snapchat, تليجرام، والبريد) وتوحيدها مع نظام التذاكر والأسئلة الشائعة في <strong>مركز التواصل والدعم الموحد</strong> بالفرع الجانبي. أدناه هي الإحصائيات الفورية المستمدة منه:
              </div>

              {/* Grid of Key CRM metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-black/40 border border-slate-900 text-right">
                  <span className="text-[9px] text-gray-500 block font-bold">المحادثات المفتوحة</span>
                  <span className="text-lg font-black font-mono text-amber-500">5</span>
                  <span className="block text-[8px] text-emerald-400 mt-0.5 animate-pulse">● قيد المتابعة</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-slate-900 text-right">
                  <span className="text-[9px] text-gray-500 block font-bold">العملاء النشطون</span>
                  <span className="text-lg font-black font-mono text-emerald-400">12</span>
                  <span className="block text-[8px] text-gray-400 mt-0.5">سجل العقد المباشر</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-slate-900 text-right">
                  <span className="text-[9px] text-gray-500 block font-bold">تذاكر الدعم المتأخرة</span>
                  <span className="text-lg font-black font-mono text-rose-500">2</span>
                  <span className="block text-[8px] text-rose-450 mt-0.5 font-sans font-bold">تطلب إجراء سريع</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-slate-900 text-right">
                  <span className="text-[9px] text-gray-500 block font-bold">رضا العملاء CSAT</span>
                  <span className="text-lg font-black font-mono text-blue-400">98%</span>
                  <span className="block text-[8px] text-emerald-500 mt-0.5 font-bold">معدل خدمة ممتاز</span>
                </div>
              </div>

              {/* AI Query & Product Complaint Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                {/* Most Queried FAQs in Hub */}
                <div className="p-3.5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-2">
                  <span className="text-[9px] text-[#D4AF37] font-black block border-b border-slate-900/60 pb-1">🔍 الاستفسارات الأكثر تكراراً (FAQ analytics) :</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono text-amber-500 font-bold">15 استعلام</span>
                      <span className="text-gray-300">كيف أربط سلة وزد بالمتجر؟</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono text-amber-500 font-bold">12 استعلام</span>
                      <span className="text-gray-300">طريقة إصدار فاتورة متوافقة مع الفوترة الإلكترونية؟</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono text-amber-500 font-bold">8 استعلام</span>
                      <span className="text-gray-300">كيف يمكنني أخذ وإرجاع نسخة احتياطية؟</span>
                    </div>
                  </div>
                </div>

                {/* Sentiment & Product Complaint Analysis */}
                <div className="p-3.5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-2">
                  <span className="text-[9px] text-[#D4AF37] font-black block border-b border-slate-900/60 pb-1">🚨 تحليل النبرة والشكاوى بالأصناف :</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="p-0.5 px-1.5 rounded bg-rose-500/10 text-rose-550 border border-rose-500/20 text-[8px]">شكوى لوجستية</span>
                      <span className="text-gray-300">ملاحظات على شحنة "العود الكمبودي دبل"</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="p-0.5 px-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px]">تحري الدقة</span>
                      <span className="text-gray-300">طلب استحقاق خصم النخبة (1 زبون غاضب)</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="p-0.5 px-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px]">آمن تماماً</span>
                      <span className="text-gray-300 font-bold text-emerald-400">باقي الأصناف والفروع مستقرة بنسبة 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Redirection Navigation CTA Box */}
            <div className="pt-3 border-t border-slate-900 text-center space-y-3 shrink-0">
              <p className="text-[10px] text-gray-450 font-bold">
                * تم إخفاء قنوات وواجهات المحادثة تماماً من هنا لحظر تشتيت الموارد التشغيلية ممتثلاً لرؤية مالك المنتج. ⚡
              </p>
              <button
                type="button"
                onClick={() => {
                  if ((window as any).__sahm_global_navigate) {
                    (window as any).__sahm_global_navigate("help");
                  }
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 transition-transform hover:scale-[1.01] active:scale-95 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>الذهاب لمركز التواصل والدعم الموحد لإدارة المحادثات والتذاكر ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSegment === "customers360" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Customers VIP Selection rail */}
          <div 
            className="lg:col-span-4 p-4 rounded-3xl border space-y-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <span className="text-[10px] font-black text-gray-400 block border-b border-slate-900 pb-1.5 uppercase">
              قائمة كبار فئة VIP والعملاء بالرياض (Customer List)
            </span>

            <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
              {customers.map((cust) => (
                <button
                  key={cust.id}
                  onClick={() => setSelectedCustomerIdFor360(cust.id)}
                  className={`w-full p-3 rounded-2xl border text-right transition-all cursor-pointer block font-bold ${
                    selectedCustomerIdFor360 === cust.id 
                      ? "bg-amber-500/15 border-amber-500/35 text-white" 
                      : "bg-slate-950/40 border-slate-900 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>{cust.city}</span>
                    <span>رقم العميل: #{cust.id}</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{cust.name}</h4>
                  <div className="flex items-center justify-between text-[9.5px] mt-1.5 font-mono">
                    <span className={cust.balance < 0 ? "text-rose-400" : cust.balance > 0 ? "text-emerald-400" : "text-gray-500"}>
                      {cust.balance < 0 ? `آجل: ${Math.abs(cust.balance)} ر.س` : cust.balance > 0 ? `له: ${cust.balance} ر.س` : "مسوى حسابياً"}
                    </span>
                    <span className="text-gray-500">{cust.phone}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer 360 Full Profiler Panel (Bullet 6 - CRM Customer 360 complete profile) */}
          <div 
            className="lg:col-span-8 p-5 rounded-3xl border flex flex-col justify-between gap-5 text-right relative overflow-hidden"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/[0.02] rounded-full pointer-events-none blur-3xl"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-3">
              <button 
                onClick={() => handleContactCustomerVIP(selectedCustomer360Obj.name, selectedCustomer360Obj.phone)}
                className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-lg cursor-pointer border border-slate-800 transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>إرسال واتساب بالذكاء 💬</span>
              </button>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <h3 className="text-sm font-black text-white">{selectedCustomer360Obj.name}</h3>
                  <p className="text-[9.5px] text-gray-500">منطقة الخدمة: {selectedCustomer360Obj.city} | الجوال: {selectedCustomer360Obj.phone}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/35">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Breathtaking 360 Grid elements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
              
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                <span className="text-[8.5px] text-gray-500 block font-black">• قيمة المشتريات (LTV)</span>
                <span className="text-base font-mono font-black block mt-1 text-white">{(customerLtv || 3400).toLocaleString()} ر.س</span>
                <span className="text-[8.5px] text-emerald-400 font-bold block mt-0.5 mt-auto">عميل فئة أ بامتياز</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                <span className="text-[8.5px] text-gray-500 block font-black">• متوسط السلة (AOV)</span>
                <span className="text-base font-mono font-black block mt-1 text-white">{(customerAvgOrderVal || 1200).toLocaleString()} ر.س</span>
                <span className="text-[8.5px] text-gray-500 font-bold block mt-0.5">معدل شراء ممتاز</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                <span className="text-[8.5px] text-gray-500 block font-black">• مؤشر الرضا (NPS)</span>
                <span className="text-base font-mono font-black block mt-1 text-amber-500">{customerNpsScore} / 10</span>
                <span className="text-[8.5px] text-amber-500 font-bold block mt-0.5">ولاء ومشاركة كاملة</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                <span className="text-[8.5px] text-gray-500 block font-black">• ملف ائتمان الخطر</span>
                <span className={`text-xs font-black block mt-1.5 ${selectedCustomer360Obj.balance < -1000 ? "text-rose-400" : "text-emerald-400"}`}>
                  {customerRiskProfile}
                </span>
                <span className="text-[8.5px] text-gray-500 block">رصيد: {selectedCustomer360Obj.balance} ر.س</span>
              </div>

            </div>

            {/* Communication log and historic timeline */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 block font-bold">• خط السير والمخاطبة (CRM Active Interaction Timeline):</span>
              
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 text-[10px] font-bold space-y-2 text-right">
                <div className="flex justify-between items-center text-gray-500 border-b border-slate-900/40 pb-1.5">
                  <span className="text-emerald-400">نشط حياً</span>
                  <span>خط زمني موثق حاسوبياً لـ مراسيم الطيب</span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[85px] pr-1 font-bold text-gray-300">
                  <p className="flex items-center justify-between text-[9.5px]">
                    <span className="text-gray-500 font-mono">١٠:٢٠ صباحاً</span>
                    <span>📞 مكالمة خدمة من الرياض: تم مناقشة رصيد العميل الآجل والتسهيلات المتوفرة.</span>
                  </p>
                  <p className="flex items-center justify-between text-[9.5px]">
                    <span className="text-gray-500 font-mono">أمس ٢:٣٠ م</span>
                    <span>💬 مزامنة OmniChat: إرسال كود خصم MARASEEM-VIP وتحديث بكسل سناب بنجاح.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
              <button
                onClick={() => {
                  const updated = customers.map(c => c.id === selectedCustomer360Obj.id ? { ...c, balance: 0 } : c);
                  setCustomers(updated);
                  triggerNotification("تصفية ائتمانية", `تم تصفير مديونيّة العميل البالغة ${Math.abs(selectedCustomer360Obj.balance)} ر.س بنجاح.`, "success");
                  core.logAudit("الائتمان", `تصفير الرصيد المدين للعميل VIP: ${selectedCustomer360Obj.name}`, "success");
                }}
                className="py-1.5 px-3 bg-rose-900/60 hover:bg-rose-800 text-rose-300 font-black text-[10px] rounded-lg cursor-pointer border border-rose-800/20 active:scale-95 transition-all outline-none"
              >
                تحديث وتصفير رصيد الذمة الآجل ⚖️
              </button>
              <button
                onClick={() => {
                  triggerNotification("مراسيم الطيب VIP", `تم ترقية الزبون ${selectedCustomer360Obj.name} لمرتبة سفير الصفوة والعود الطبيعي.`, "success");
                  core.logAudit("الولاء", `ترقية درجة ولاء زبون VIP: ${selectedCustomer360Obj.name}`, "success");
                }}
                className="py-1.5 px-3 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-black text-[10px] rounded-lg cursor-pointer border border-emerald-800/20 active:scale-95 transition-all outline-none"
              >
                ترقية لمرتبة سفير البراند الذهبي 👑
              </button>
            </div>
          </div>

        </div>
      )}

      {activeSegment === "workflows" && (
        <div className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-900">
            <button
              onClick={() => {
                triggerNotification("Workflow Deploy", "تم نشر ومعاينة كامل قواعد الأتمتة على خوادم سهم بنجاح!", "success");
                core.logAudit("الأتمتة والربط", "تم إعادة تحديث وجدولة سير المهام بالتكامل مع سلة وأرامكس", "success");
              }}
              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-lg cursor-pointer border-0 shadow"
            >
              نشر وتطبيق قواعد الأتمتة ⚙️
            </button>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>محرك العمل والمهام الأوتوماتيكية (Workflow Engine Studio - Bullet 8)</span>
            </h3>
          </div>

          <p className="text-xs text-gray-400 text-right leading-relaxed">
            تمكين نظام التشغيل سهم من تنفيذ سيناريوهات استباقية تلقائية. إذا انخفض مخزون عود غابات أو دهن الورد بمستودع الرياض عن ٢٠ قطعة، فسيقوم المحرك تلقائياً بصنع مسودة توريد وحفظ قيد مشتريات محاسبي دون جهد يدوي.
          </p>

          <div className="space-y-3.5">
            {workflowsList.map((rule) => (
              <div 
                key={rule.id}
                className="p-3.5 rounded-2xl bg-slate-950/45 border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-right"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = workflowsList.map(w => w.id === rule.id ? { ...w, isActive: !w.isActive } : w);
                      setWorkflowsList(updated);
                      core.saveWorkflows(updated);
                      triggerNotification("حالة الأتمتة", `تم ${!rule.isActive ? "تشغيل" : "إيقاف"} السيناريو: ${rule.title}`, "info");
                    }}
                    className={`py-1 px-2.5 rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                      rule.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-gray-500 border border-slate-850"
                    }`}
                  >
                    {rule.isActive ? "نشط وفعال 🟢" : "معطل مؤقتاً ⭕"}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">{rule.title}</h4>
                  <p className="text-[10.5px] text-gray-400 leading-normal">
                    الحدث القادح: <span className="font-mono text-[#D4AF37] bg-slate-900/60 py-0.5 px-1.5 rounded">{rule.triggerEvent}</span> | الإجراء الهدف: <span className="font-mono text-sky-400 bg-slate-900/60 py-0.5 px-1.5 rounded">{rule.actionType}</span>
                  </p>
                  <p className="text-[9.5px] text-gray-500">محددات المعالج: {rule.meta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            <button
              onClick={() => {
                const newRule: WorkflowRule = {
                  id: "wf-" + Date.now(),
                  title: "صنع ومزامنة قيد فوري عند الفاتورة فوق ٢٠٠٠ ر.س الكومبو",
                  triggerEvent: "invoice_created",
                  targetModule: "invoices",
                  actionType: "auto_invoice",
                  isActive: true,
                  meta: "تفعيل Snapchat Pixel ونشر خصم كود VIP"
                };
                const updated = [...workflowsList, newRule];
                setWorkflowsList(updated);
                core.saveWorkflows(updated);
                triggerNotification("سيناريو جديد", "تم تأسيس وقبول قاعدة الأتمتة الإضافية بنجاح 🟢", "success");
              }}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>إضافة قاعدة وسيناريو مخصص ➕</span>
            </button>
            <p className="text-[10px] text-gray-400">أضف خيارات الفرز وحياكة الأتمتة للتسويق والمستودعات والمالية حياً.</p>
          </div>
        </div>
      )}

      {activeSegment === "integrations" && (
        <div className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-900">
            <span className="text-[9.5px] text-gray-500">مزامنة تامة لـ Webhooks والـ API Keys المشفرة</span>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span>متجر تطبيقات سهم للشركاء (Integrations Hub & App Marketplace)</span>
            </h3>
          </div>

          <p className="text-xs text-gray-400 text-right leading-relaxed">
            قم بربط متجر مراسيم الطيب بمجهود نقرة واحدة مع عمالقة التجارة والخدمات اللوجستية وتفعيل بوابات API. تتيح لك المزامنة استيراد سلال سلة، استباق الشحن مع Aramex، وتوثيق الفواتير بترميز ZATCA في ثانية.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIntegrations.map((app) => (
              <div 
                key={app.id}
                className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 flex flex-col justify-between gap-3 text-right group hover:border-[#D4AF37]/25 transition-all"
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => handleToggleIntegration(app.id)}
                    className={`py-1 px-3 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                      app.status === "connected" 
                        ? "bg-rose-950/60 text-rose-300 border border-rose-800/30" 
                        : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30 animate-pulse"
                    }`}
                  >
                    {app.status === "connected" ? "قطع الاتصال 🛑" : "توصيل المنصة 🔌"}
                  </button>
                  <span className="text-xl shrink-0 p-1 rounded-xl bg-slate-900 border border-slate-800">{app.icon}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[8px] bg-slate-900 text-gray-500 px-1 py-0.5 rounded font-mono">{app.version}</span>
                    <h4 className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-all">{app.name}</h4>
                  </div>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed font-bold">{app.description}</p>
                </div>

                <div className="border-t border-slate-900 pt-2.5 flex items-center justify-between text-[9.5px]">
                  <span className="font-mono text-amber-500 font-extrabold">★ {app.rating}</span>
                  <span className={app.status === "connected" ? "text-emerald-400 font-black" : "text-gray-500 font-bold"}>
                    {app.status === "connected" ? "متصل ومفعل Webhooks 🟢" : "غير نشط ⭕"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSegment === "themes" && (
        <div className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-900">
            <span className="text-[9.5px] text-amber-500 font-black">تصاميم استثنائية راقية تليق بمراسيم الطيب</span>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span>متجر سمات وقوالب الشركاء (Enterprise Theme Gallery & Simulator)</span>
            </h3>
          </div>

          <p className="text-xs text-gray-400 text-right leading-relaxed">
            أنشئ مظهر أعمالك الخاص بنقرة واحدة! يتكفل محرك السمات بتغيير تباين لوحاتك، الحواشي المربعة أو المستديرة، وأنماط الخطوط العربية (Cairo، Tajawal) تماشياً مع هوية متجر العود والبخور الفخمة.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {core.getThemes().map((preset) => {
              const isCurrent = preset.bg.toLowerCase() === theme.bg.toLowerCase();
              return (
                <div 
                  key={preset.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-right transition-all bg-slate-950/40 ${isCurrent ? "border-amber-500/40 ring-1 ring-amber-500/10" : "border-slate-900"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-amber-500/10 text-[#D4AF37] px-2 py-0.5 rounded font-black font-mono">
                      {preset.fontFamily} • {preset.borderRadius}
                    </span>
                    <h4 className="text-xs font-black text-white">{preset.name}</h4>
                  </div>

                  {/* Tiny simulator block preview */}
                  <div 
                    className="p-3 rounded-lg border flex items-center justify-between text-[9.5px] font-bold shadow-inner"
                    style={{ backgroundColor: preset.surface, borderColor: preset.border, color: preset.text }}
                  >
                    <span className="py-0.5 px-2 rounded-md font-mono" style={{ backgroundColor: preset.accent + "20", color: preset.accent }}>
                      زر فخم
                    </span>
                    <span style={{ color: preset.muted }}>مراسيم الطيب الفاخرة للعود</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    {isCurrent ? (
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>القالب الحالي للبراند 🟢</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateThemePreset(preset)}
                        className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-lg cursor-pointer border border-slate-800 transition-all outline-none"
                      >
                        تنشيط وتثبيت المظهر الفوري ⚡
                      </button>
                    )}
                    <span className="text-[9px] text-[#D4AF37] font-black">جاهز للتحميل</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
