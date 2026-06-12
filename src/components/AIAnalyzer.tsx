import React, { useState, useRef, useEffect } from "react";
import { Product, ThemeColors } from "../types";
import { 
  Sparkles, AlertCircle, Copy, Check, RefreshCw, ChevronLeft, 
  Save, Database, Send, Trash2, Archive, X, TrendingUp, Zap, 
  MessageSquare, DollarSign, Calendar, Eye, ShieldAlert, BadgePercent, 
  BarChart3, Award, Flame, UserCheck, Play, ArrowRight, UploadCloud, 
  HelpCircle, Image as ImageIcon, BookOpen, Clock, Activity, ShoppingBag, CheckCircle2
} from "lucide-react";
import AIProductStudio from "./AIProductStudio";

interface AIAnalyzerProps {
  theme: ThemeColors;
  products: Product[];
  setProducts: (prod: Product[]) => void;
  setActiveTab: (tab: string) => void;
  setPrefillPublish: (prefill: {
    name: string;
    price: string;
    image: { uri: string; base64: string; mimeType: string } | null;
  } | null) => void;
  mode?: 'full' | 'recommendations' | 'store_analysis';
}

export default function AIAnalyzer({ 
  theme, 
  products, 
  setProducts, 
  setActiveTab, 
  setPrefillPublish,
  mode = 'full'
}: AIAnalyzerProps) {
  // Navigation for AI Modules
  const [currentSubTab, setCurrentSubTab] = useState<'product_studio' | 'ceo_feed' | 'opportunities' | 'forecasting' | 'support_bot' | 'profit_health'>(() => {
    if (mode === 'recommendations') return 'ceo_feed';
    if (mode === 'store_analysis') return 'profit_health';
    return 'product_studio';
  });

  useEffect(() => {
    if (mode === 'recommendations') {
      setCurrentSubTab('ceo_feed');
    } else if (mode === 'store_analysis') {
      setCurrentSubTab('profit_health');
    } else {
      setCurrentSubTab('product_studio');
    }
  }, [mode]);

  // Multi-purpose States
  const [image, setImage] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Preset Products for easy simulation
  const [presetProduct, setPresetProduct] = useState<string>("دهن عود كلمنتان فاخر");
  const presets = [
    { name: "دهن عود كلمنتان فاخر", price: 350, cost: 120, stock: 35, cat: "عطور ودهن عود", sku: "OUD-KLM-92" },
    { name: "زعفران ناقيل سوبر فاخر", price: 180, cost: 70, stock: 12, cat: "زعفران وهدايا", sku: "ZAF-NQL-31" },
    { name: "مبخرة النقش السيراميك", price: 95, cost: 30, stock: 150, cat: "مباخر واكسسوارات", sku: "CR-MKB-45" },
    { name: "ورد طائفي نخب أول", price: 420, cost: 180, stock: 5, cat: "عطور ودهن عود", sku: "WRD-TIF-88" }
  ];

  // ==========================================
  // TAB 1 STATES: AI CEO FEED & COMMAND CHAMBER
  // ==========================================
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; details?: any }>>([
    {
      sender: 'ai',
      text: "مرحباً بك في غرفة قيادة المدير التنفيذي الذكي! 🤖 طاقم وكلاء الذكاء الاصطناعي يقوم الآن بمراقبة مخزنك وإيراداتك بشكل لحظي. يمكنك توجيه أي سؤال مالي أو تسويقي وسأجيبك فوراً بالاستناد على الأرقام الحقيقية لمتجرك."
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Morning Executive feed state defaults
  const [feedApproved, setFeedApproved] = useState<Record<string, boolean>>({});

  // ==========================================
  // TAB 2 STATES: OPPORTUNITIES & COMPETITORS
  // ==========================================
  const [selectedPricingProd, setSelectedPricingProd] = useState(presets[0]);
  const [competitorBasePrice, setCompetitorBasePrice] = useState(365);
  const [oppApproved, setOppApproved] = useState<Record<string, boolean>>({});

  // ==========================================
  // TAB 3 STATES: STORE CONSTRUCTOR & CONTENT FACTORY
  // ==========================================
  const [constructorImage, setConstructorImage] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const [constructorName, setConstructorName] = useState("دهن عود كلمنتان فاخر");
  const [isConstructing, setIsConstructing] = useState(false);
  const [constructionResult, setConstructionResult] = useState<any>(null);
  const [graderResults, setGraderResults] = useState<any>(null);
  const constructorFilesRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // TAB 4 STATES: SALES FORECAST & SAUDI ZAKATH
  // ==========================================
  const [calcCash, setCalcCash] = useState<number>(45000);
  const [calcReceivables, setCalcReceivables] = useState<number>(12000);
  const [calcStockValue, setCalcStockValue] = useState<number>(55000);
  const [zakathResults, setZakathResults] = useState<any>(null);

  // ==========================================
  // TAB 5 STATES: SUPPORT CHAT SIMULATOR
  // ==========================================
  const [supportChats, setSupportChats] = useState([
    {
      id: "c1",
      customerName: "سعد الودعاني (الرياض)",
      customerPhone: "96650381****",
      lastMsg: "يا الغالي ليش الشحنة طولت؟ أبي أعرف وضع الطلبية الحين الله يعافيك",
      dialect: "نجدي / سعودي عام",
      orderId: "SA-90122",
      paymentStatus: "مدفوع (مدى)",
      replyText: "",
      history: [
        { sender: 'customer', text: "السلام عليكم، طلبت من يمين 3 أيام دهن عود كلمنتان وما وصلني أي رقم تتبع" },
        { sender: 'customer', text: "يا الغالي ليش الشحنة طولت؟ أبي أعرف وضع الطلبية الحين الله يعافيك" }
      ]
    },
    {
      id: "c2",
      customerName: "خلود الحربي (خميس مشيط)",
      customerPhone: "96655110****",
      lastMsg: "لو سمحتوا الزعفران ناقيل سوبر أصلي طبيعي وإلا عليه إضافات؟ وهل عليه خصم لو أخذت تولتين؟",
      dialect: "جنوبي / خليجي",
      orderId: "مستفسر قبل الشراء",
      paymentStatus: "قيد اتخاذ قرار",
      replyText: "",
      history: [
        { sender: 'customer', text: "لو سمحتوا الزعفران ناقيل سوبر أصلي طبيعي وإلا عليه إضافات؟ وهل عليه خصم لو أخذت تولتين؟" }
      ]
    },
    {
      id: "c3",
      customerName: "بو فهد المري (الدمام)",
      customerPhone: "96654921****",
      lastMsg: "مرحبا، أبي أغير كوبون الخصم حق متجري، هل فيه دفع عند الاستلام؟",
      dialect: "شرقاوي",
      orderId: "غياب دفع",
      paymentStatus: "يبحث عن دفع عند الاستلام",
      replyText: "",
      history: [
        { sender: 'customer', text: "مرحبا، أبي أغير كوبون الخصم حق متجري، هل فيه دفع عند الاستلام؟" }
      ]
    }
  ]);
  const [activeSupportChatId, setActiveSupportChatId] = useState("c1");
  const [isReplyingIndex, setIsReplyingIndex] = useState<string | null>(null);

  // ==========================================
  // TAB 6 STATES: ACADEMY PROGRESS & HEALTH CHECK
  // ==========================================
  const [healthScore, setHealthScore] = useState(82);
  const [academyQuizAnswers, setAcademyQuizAnswers] = useState<Record<string, string>>({});
  const [academyQuizPassed, setAcademyQuizPassed] = useState<Record<string, boolean>>({});

  // ==========================================
  // LOGIC & SIMULATORS HANDLERS
  // ==========================================

  // Chat agent response simulator
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const updatedMsgs = [...chatMessages, { sender: 'user' as const, text: userText }];
    setChatMessages(updatedMsgs);
    setChatInput("");
    setIsChatLoading(true);

    setTimeout(() => {
      let aiText = "";
      let details = null;

      const lowerText = userText.toLowerCase();

      if (lowerText.includes("ربح") || lowerText.includes("كم ربحي") || lowerText.includes("الأرباح")) {
        aiText = "طال عمرك، بمسح السجلات المالية لمتجركم 'مراسيم الطيب' هذا الشهر: أرباحكم الصافية بلغت 28,420 ريال سعودي من إجمالي مبيعات 74,500 ريال. هامش الربح الإجمالي ممتاز ويقف عند 38%، والمنتج الأكثر ربحية هو 'دهن عود كلمنتان فاخر'.";
        details = {
          type: "stats",
          headers: ["صافي الأرباح", "معدل المبيعات", "هامش الأرباح"],
          values: ["28,420 ريال", "74,500 ريال", "%38"]
        };
      } else if (lowerText.includes("منتج") || lowerText.includes("ناجح") || lowerText.includes("أكثر منتج")) {
        aiText = "المنتج الأقوى أداءً حالياً هو 'دهن عود كلمنتان فاخر'. يمثّل وحده 45% من سعة التدفقات المالية لـ 'مراسيم الطيب' هذا الشهر بمبيعات بلغت 33,525 ريال، والجمهور الأفضل استقطاباً هم فئة عملاء سناب شات بالرياض.";
        details = {
          type: "product",
          name: "دهن عود كلمنتان فاخر",
          sales: "95 تولة",
          revenue: "33,525 ريال",
          growth: "+22% نمو أسبوعي"
        };
      } else if (lowerText.includes("حملة") || lowerText.includes("سناب") || lowerText.includes("إعلان") || lowerText.includes("سناب شات")) {
        aiText = "أبشر! تم تصميم حملة ترويجية لمنتج 'دهن عود كلمنتان فاخر' موجهة خصيصاً لمنصة سناب شات تستهدف فئة المهتمين بالـ LUXURY والهدايا الفاخرة بالمنطقة الوسطى والرياض:";
        details = {
          type: "campaign",
          channel: "سناب شات (Snapchat Ads)",
          targeting: "الرياض، جدة، الدمام | الفئة: رجال ونساء (25-54 سنة) المهتمين بالعطور الفخمة والعود والمناسبات",
          hook: "✨ إذا كنت تبحث عن فخامة تبقى طوال اليوم لتثبت جدارتك بالمجالس المرموقة، وفرنا لك كلمنتان الأصلي!",
          caption: "دهن عود كلمنتان طبيعي فاخر 100% بنكهته البخورية السويتية الساحرة. ثبات يدوم طويلاً وشحن فوري لباب البيت. اطلب الحين بخصم 15% الحصري لعملاء الطقس الحار 🔗👇",
          estimate: "العائد المتوقع للإنتاج الإعلاني (ROAS): 4.5x - 5.2x"
        };
      } else {
        aiText = `فهمت استفسارك بخصوص: "${userText}". بالتحليل الذكي لبيانات متجرك ومقارنتها بالسوق السعودي، يتضح أن تعديل السياسة التسعيرية وتكثيف برودكاست الواتساب للعملاء السابقين سيزيد من مبيعاتك بنسبة 18% طوال الـ 14 يوماً القادمة. هل تود أن أصمم لك رمز كوبون ترويحي مخصص؟`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai' as const, text: aiText, details }]);
      setIsChatLoading(false);
    }, 1200);
  };

  // Preset button clicking helper for Chat chamber
  const triggerPresetChat = (promptText: string) => {
    setChatInput(promptText);
    setTimeout(() => {
      // Small timeout to allow input to render
    }, 50);
  };

  // Opportunistic pricing calculations
  const calculatePricingRates = (prod: typeof presets[0]) => {
    const cost = prod.cost;
    const currentPrice = prod.price;

    return {
      optimal: {
        price: Math.round(cost * 2.85),
        profit: Math.round(cost * 2.85 - cost),
        margin: "65%",
        reason: "بناءً على تزايد معدل الإضافة للسلة بنسبة 40% هذا الأسبوع واستقرار الأسعار المنافسة بمتوسط 360 ريال."
      },
      promo: {
        price: Math.round(cost * 1.95),
        profit: Math.round(cost * 1.95 - cost),
        margin: "49%",
        reason: "سعر ترويجي مثالي لحملات نهاية الأسبوع يضمن زيادة حجم المبيعات الإجمالي الحجمي (Volume Surge) دون حرق السعر العام."
      },
      clearance: {
        price: Math.round(cost * 1.3),
        profit: Math.round(cost * 1.3 - cost),
        margin: "23%",
        reason: "يُقترح للاستخدام فقط إذا كانت أيام المخزون المتبقية تتجاوز 180 يوماً؛ لتحرير رأس المال وإبراء ركود المنتج السيراميكي."
      }
    };
  };

  const pricingResults = calculatePricingRates(selectedPricingProd);

  // Saudi Zakath liability calculation compliant with ZATCA and Islamic guidelines
  const calculateSaudiZakath = () => {
    const totalAssets = calcCash + calcReceivables + calcStockValue;
    const zakathBase = totalAssets; // simplified Zakath pool assuming no long-term liabilities deduction
    const amountDue = Math.round(zakathBase * 0.025); // 2.5% Hijri year Zakath base

    setZakathResults({
      totalAssets,
      zakathBase,
      amountDue,
      advice: "إن نصاب الزكاة الشرعي لعام 1447هـ ومقدار الذهب المكافئ تم تلبيته بمتجركم بالكامل. يُوصى بإخراج مبلغ زكاة عروض التجارة البالغ " + amountDue.toLocaleString() + " ريال سعودي للجمعيات المعتمدة بمنصة إحسان السعودية لإبراء ذمتكم المالية ومباركة تجارتكم."
    });
  };

  // Execute AI Full Store Constructor simulation
  const handleFullStoreConstruction = () => {
    setIsConstructing(true);
    setConstructionResult(null);
    setGraderResults(null);

    setTimeout(() => {
      setIsConstructing(false);
      setConstructionResult({
        name: constructorName,
        category: "عطور ومراسيم الطيب فاخرة",
        seoTitle: `${constructorName} | دهن العود الطبيعي الفاخر بالمملكة`,
        seoKeywords: "دهن عود, كلمنتان, عطور المراسم, عطور سعودية فاخرة, زاد الطيب",
        description: "انغمس في عبير الكلمنتان الفاخر المستخرج يدوياً من أعماق الغابات السنديان بإندونيسيا. دهن عطور سويتية ذات لمسة بخورية تتخطى أزمنة الموضة لتخلد مهابة تواجدكم ببروتوكولات وصالات الضيافة الرفيعة.",
        suggestedCategories: ["مبيعات ملكية", "دهن عود كلمنتان", "أصالة شرقية"],
        banners: [
          "✨ شعور المهابة بالمسك الملوكي لتجارتكم العظيمة",
          "🌟 كلمنتان الأصلي: دفء العراقة برائحة تثبت طوال اليوم"
        ]
      });

      // Grade product image quality dynamically
      setGraderResults({
        score: 94,
        details: {
          brightness: "ممتازة (إضاءة بيضاء معتدلة تبرز تفاصيل زجاجة العود الفخمة)",
          composition: "متمركِزة بالمنتصف ببروز 80% من مساحة العرض الإجمالية",
          resolution: "فائقة الدقة والوضوح (HD Ready)",
          background: "خلفية رمادية محايدة (أفضل خيار لزيادة معدل تحويل الشراء بطبيعتها)",
          tips: [
            "أضف علامة مائية ناعمة جداً تبرز شعار متجرك بالطرف الأيسر السفلي لحمايتها.",
            "يفضل توفير لقطة فيديو ميكروسكوبية بؤرية لتدفق زيت دهن الكلمنتان اللزج لرفع مصداقية المظهر."
          ]
        }
      });
    }, 1500);
  };

  // AI customer support auto reply trigger simulator
  const handleReplyOnWhatsApp = (chatId: string) => {
    setIsReplyingIndex(chatId);

    const chat = supportChats.find(c => c.id === chatId);
    if (!chat) return;

    setTimeout(() => {
      let response = "";
      if (chatId === "c1") {
        response = "أبشر بعزك طال عمرك! 🌸 بالنسبة لطلبك رقم #SA-90122 الحين شيكت لك السيستم، تم التجهيز وتسليمها لشركة سمسا (SMSA Express)، ورقم تتبع شحنتك المباشر هو: SMSA-882190. الحين هي بمركز فرز الرياض وبإذن الله بتوصلك لباب بيتك خلال 24 ساعة فقط. هل تبي يرسل لك الكابتن لوكيشن؟";
      } else if (chatId === "c2") {
        response = "يا هلا بالشيخة خلود! 💎 بالنسبة لزعفران ناقيل سوبر، نضمن لك إنه نخب أول طبيعي وخالص 100% بدون أي ألوان أو هباء صناعي، ومفحوص بمختبرات الجودة. وأبشري بسعدك، لو أخذتي تولتين الحين، راح أفعل لك كوبون مخصص يخصم لك 20% إضافية مع شحن مجاني، كود الخصم هو: OUD20 🎁 اطلبي الحين والطلب يوصلك مغلف بشنطة فاخرة مناسبة للاهداء.";
      } else {
        response = "يا هلا ومسهلا فيك يا غالي! بخصوص التغيير والخصومات، حنا نوفر بمتجر 'مراسيم الطيب' ميزة الدفع عند الاستلام لكافة مدن المملكة عبر شريك التوصيل السريع (أرامكس Express) وبرسوم رمزية لا تتجاوز 15 ريال فقط تختارها مباشرة بصفحة اتمام الطلب بكل بساطة وسرعة، وبنرسل لك اللوكيشن تفاعلي لتسهيل العملية.";
      }

      setSupportChats(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            replyText: response,
            history: [...c.history, { sender: 'ai' as const, text: response }]
          };
        }
        return c;
      }));

      setIsReplyingIndex(null);
    }, 1000);
  };

  // Apply visual Morning CEO recommendations in state
  const handleApproveFeed = (id: string) => {
    setFeedApproved(prev => ({ ...prev, [id]: true }));
    // If lifting price, apply directly in the products array
    if (id === "rec_1") {
      const targetName = "دهن عود كلمنتان فاخر";
      const hasProd = products.find(p => p.name.includes("كلمنتان"));
      if (hasProd) {
        const updated = products.map(p => {
          if (p.name.includes("كلمنتان")) {
            return { ...p, price: Math.round(p.price * 1.1) };
          }
          return p;
        });
        setProducts(updated);
        alert(`🚀 تم بنجاح تطبيق قرار المدير التنفيذي: زيادة سعر المنتج 'دهن عود كلمنتان' 10% بمخازن تجارة سلة المزامنة!`);
      } else {
        alert(`🚀 تم تفعيل التوصية ورفع سعر 'دهن عود كلمنتان' على قناة سلة وزد المتزامنة!`);
      }
    } else if (id === "rec_2") {
      alert("📦 تم إرسال أمر شراء فوري ومؤتمت للمورد بالمنطقة الشرقية لشحن 100 وحدة من الزعفران النادر!");
    } else if (id === "rec_4") {
      alert("📢 تم بنجاح رفع ميزانية حملة سناب شات النشطة بقيمة 300 ريال بالتعاون مع لوحة Meta Ads!");
    }
  };

  return (
    <div className="space-y-6 text-right dir-rtl select-text" style={{ color: theme.text }}>
      
      {/* 🚀 Main Hub Title with Premium Visual Upgrades */}
      <div className="p-6 rounded-2xl border text-right space-y-4 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(212,175,55,0.1)]" 
        style={{
          background: `radial-gradient(circle at top right, rgba(212, 175, 55, 0.09) 0%, rgba(13, 21, 39, 0.98) 100%)`,
          borderColor: theme.border
        }}>
        <div className="absolute left-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4 text-right">
            {/* Double-ring AI Insights Gauge */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0 bg-slate-950/80 rounded-2xl border border-zinc-800 p-2 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer Gauge: 94.8% */}
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(212, 175, 55, 0.05)" strokeWidth="2" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.5" 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="2.0" 
                    strokeDasharray="97.39" 
                    strokeDashoffset="5.06" 
                    strokeLinecap="round"
                  />
                  {/* Inner Gauge: 91.2% */}
                  <circle cx="18" cy="18" r="11.5" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="2" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="11.5" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="2.0" 
                    strokeDasharray="72.26" 
                    strokeDashoffset="6.36" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-center z-10 select-none">
                <span className="block text-[11px] font-black text-amber-400 font-mono leading-none">94.8%</span>
                <span className="block text-[6px] text-gray-400 mt-1 leading-none">ثقة التوصيات</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-extrabold border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-amber-500 animate-spin-slow" />
                <span>غرفة قيادة الذكاء الاصطناعي التنفيذي (AI E-commerce CEO) 🤖⚔️</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: theme.text }}>
                المدير التنفيذي للذكاء الاصطناعي والنمو (Sahm AI-Powered Executive Suite)
              </h1>
              <p className="text-xs text-gray-450 leading-relaxed max-w-xl">
                تخطي كولسات الإدارة الروتينية والمحاسبة المجردة؛ استعن بأقوى وكلاء ذكاء اصطناعي لقيادة التسعير والمخزون والمبيعات والحملات تلقائياً بدقة تحليل %91.2.
              </p>
            </div>
          </div>

          {/* Global Stats bar top */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 self-start md:self-auto shrink-0 shadow-lg">
            <div className="text-center px-4 border-l border-slate-800 last:border-0">
              <span className="text-[9px] text-gray-400 block font-bold">مؤشر صحة المتجر 🩺</span>
              <span className="text-xs font-black text-amber-500 font-mono">82 / 100</span>
            </div>
            <div className="text-center px-4 border-l border-slate-800 last:border-0">
              <span className="text-[9px] text-gray-400 block font-bold">قرارات مقترحة اليوم</span>
              <span className="text-xs font-black text-emerald-400 font-mono">4 توصيات حية</span>
            </div>
          </div>
        </div>

        {/* Gold gradient divider inside card */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-1" />
      </div>

      {/* 🧭 Horizontal navigation for modules */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-1" style={{ borderColor: theme.border }}>
        {[
          { id: 'product_studio', label: 'استوديو المنتجات AI Product Studio 🧠✨', icon: Sparkles, roles: ['full'] },
          { id: 'ceo_feed', label: 'توصيات المدير التنفيذي والدردشة 🚀', icon: MessageSquare, roles: ['full', 'recommendations'] },
          { id: 'opportunities', label: 'فرص الأرباح والتسعير الرشيق 📈', icon: TrendingUp, roles: ['full', 'recommendations'] },
          { id: 'forecasting', label: 'التنبؤ والمبيعات والزكاة 🕋', icon: Calendar, roles: ['full', 'store_analysis'] },
          { id: 'support_bot', label: 'الرد التلقائي وصحة العملاء 💬', icon: ShieldAlert, roles: ['full', 'store_analysis'] },
          { id: 'profit_health', label: 'مركز الأرباح وصحة المتجر 💎', icon: Award, roles: ['full', 'store_analysis'] },
        ].filter(item => {
          if (!mode || mode === 'full') return true;
          return item.roles.includes(mode);
        }).map((subTab) => {
          const Icon = subTab.icon;
          const isActive = currentSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setCurrentSubTab(subTab.id as any)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-all"
              style={{
                backgroundColor: isActive ? theme.accent : theme.surface,
                color: isActive ? "#000" : theme.text,
                border: `1px solid ${isActive ? theme.accent : theme.border}`
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{subTab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      <div className="space-y-6">

        {/* ==========================================
            SUBTAB 1: MANAGING CEO INBOX & LIVE CHAT
            ========================================== */}
        {currentSubTab === 'ceo_feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Morning Executive Daily brief (Left 7-columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-6 rounded-2xl border space-y-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <div>
                      <h2 className="text-sm font-black text-white">الملخص التنفيذي الصباحي اليومي (Daily CEO Briefing)</h2>
                      <p className="text-[10px] text-gray-400 mt-0.5">تم التحديث الإجمالي اليوم هجري 1447/12/15 - ميلادي 2026/06/01</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-gray-300 font-extrabold py-1 px-2.5 rounded-lg border border-slate-705">
                    الوضع مستقر ⚡
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Recommendation 1 */}
                  <div className={`p-4 rounded-xl border space-y-2 transition-all ${feedApproved.rec_1 ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>توصية تسعير عاجلة</span>
                      </span>
                      {feedApproved.rec_1 ? (
                        <span className="text-[9px] text-emerald-400 font-bold">تم الرفع الفوري ✓</span>
                      ) : (
                        <span className="text-[9px] text-gray-400">تطبيق يحفظ 13,400 ر.س</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white relative leading-relaxed pr-3">
                      <span className="absolute right-0 top-0.5 text-amber-500">•</span>
                      "بناءً على تزايد حجم الطلب على 'دهن عود كلمنتان فاخر' وانفصال المنافسين بمتجر النخبة، يجب رفع السعر بنسبة <span className="text-amber-400 font-extrabold">10% الحين</span> لتحقيق هامش ربح وفير وتجنب نفاد الصنف مبكراً."
                    </p>
                    {!feedApproved.rec_1 && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApproveFeed("rec_1")}
                          className="py-1 px-3 rounded bg-amber-500 text-black font-extrabold text-[10px] cursor-pointer hover:bg-amber-600 transition-colors"
                        >
                          الموافقة والرفع التلقائي بالسوق
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recommendation 2 */}
                  <div className={`p-4 rounded-xl border space-y-2 transition-all ${feedApproved.rec_2 ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-[#EF4444] flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>تحذير نفاد مخزون وشيك</span>
                      </span>
                      {feedApproved.rec_2 ? (
                        <span className="text-[9px] text-emerald-400 font-bold">تم طلب التوريد الآمن ✓</span>
                      ) : (
                        <span className="text-[9px] text-gray-400">معدل الحرق مرتفع</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white relative leading-relaxed pr-3">
                      <span className="absolute right-0 top-0.5 text-[#EF4444]">•</span>
                      "رصيد صنف 'زعفران ناقيل سوبر فاخر' <span className="text-[#EF4444] font-black">سينفد بالكامل خلال 6 أيام</span> فقط بمعدل الحرق اليومي. ننصح بإرسال طلب شراء للمورد بمبلغ 4,500 ريال فورا."
                    </p>
                    {!feedApproved.rec_2 && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApproveFeed("rec_2")}
                          className="py-1 px-3 rounded bg-slate-800 border border-slate-700 text-gray-200 font-extrabold text-[10px] cursor-pointer hover:bg-slate-700 transition-colors"
                        >
                          تفويض إعادة طلب المخزن 📦
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recommendation 3 */}
                  <div className="p-4 rounded-xl border space-y-2 bg-slate-900/40 border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>طفرة أداء حملة إعلانية</span>
                      </span>
                      <span className="text-[9px] text-gray-400">ROAS: 4.8x</span>
                    </div>
                    <p className="text-xs font-bold text-white relative leading-relaxed pr-3">
                      <span className="absolute right-0 top-0.5 text-emerald-400">•</span>
                      "إعلان 'بخور العود الفاخر' على ميتا حقق أعلى عائد وقيمة مبيعات بالقطاع الغربي. العائد على الإنفاق (ROAS) ممتاز ويبلغ 4.8."
                    </p>
                  </div>

                  {/* Recommendation 4 */}
                  <div className={`p-4 rounded-xl border space-y-2 transition-all ${feedApproved.rec_4 ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-blue-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>توصية توسيع ترويجي</span>
                      </span>
                      {feedApproved.rec_4 ? (
                        <span className="text-[9px] text-emerald-400 font-bold">تمت زيادة الميزانية ✓</span>
                      ) : (
                        <span className="text-[9px] text-gray-400">زيادة سريعة</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white relative leading-relaxed pr-3">
                      <span className="absolute right-0 top-0.5 text-blue-400">•</span>
                      "ننصح بزيادة ميزانية إعلانات سناب شات بقيمة <span className="text-blue-400 font-black">300 ريال سعودي إضافية اليوم</span> لاستهداف المهتمين بمناسبات حفلات الضيافة الراقية بالرياض."
                    </p>
                    {!feedApproved.rec_4 && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApproveFeed("rec_4")}
                          className="py-1 px-3 rounded bg-blue-500 text-white font-extrabold text-[10px] cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          توسيع الصرف بالحملة تلقائياً 👍
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* AI Room Interactive Arab Chat Command (Right 5-columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-5 rounded-2xl border space-y-4 flex flex-col h-[480px]" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <MessageSquare className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-black" style={{ color: theme.text }}>مستشار القيادة ووكيل سهم الذكي 🇸🇦</h3>
                    <p className="text-[9px] text-gray-400 mt-0.5">تحدّث مع متجرك مباشرة باللغة العربية والخليجية</p>
                  </div>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto space-y-3 p-1 text-right">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="space-y-1.5 step-target-chat">
                      <div className={`p-3 rounded-xl text-xs max-w-[85%] inline-block text-right leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-amber-500 text-black font-extrabold float-left rounded-bl-none' 
                          : 'bg-slate-900 border border-slate-800 text-gray-100 float-right rounded-br-none'
                      }`}>
                        {msg.text}
                      </div>
                      
                      {/* Clear floating element */}
                      <div className="clear-both"></div>

                      {/* Render extra details if present in AI answers */}
                      {msg.details && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-sans mt-1">
                          {msg.details.type === 'stats' && (
                            <div className="grid grid-cols-3 gap-1 text-center">
                              {msg.details.headers.map((h: string, i: number) => (
                                <div key={i} className="p-1 text-[9px] border-l border-slate-900 last:border-0">
                                  <span className="text-gray-400 block font-bold mb-0.5">{h}</span>
                                  <span className="text-[10px] font-black text-amber-500">{msg.details.values[i]}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.details.type === 'product' && (
                            <div className="space-y-1 text-right">
                              <span className="text-[10px] text-amber-400 font-black block">📦 المنتج الرائد: {msg.details.name}</span>
                              <div className="flex justify-between text-[9px] text-gray-400">
                                <span>المبيعات: {msg.details.sales}</span>
                                <span>الإيرادات: {msg.details.revenue}</span>
                                <span className="text-emerald-400 font-bold">{msg.details.growth}</span>
                              </div>
                            </div>
                          )}

                          {msg.details.type === 'campaign' && (
                            <div className="space-y-1.5 text-right text-[10px] leading-relaxed">
                              <span className="text-[10px] text-amber-500 font-black block">📢 التوصية الإعلانية: {msg.details.channel}</span>
                              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[9px]">السيناريو:</span>
                                <p className="text-white italic">"{msg.details.caption}"</p>
                              </div>
                              <span className="text-[9px] text-emerald-400 font-bold block bg-emerald-500/5 p-1 rounded">
                                {msg.details.estimate}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-gray-400 float-right w-fit">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      <span>جاري تشاور الملقم وحساب الأرقام...</span>
                    </div>
                  )}
                </div>

                {/* Preset Fast triggers buttons */}
                <div className="space-y-1 pt-2 border-t" style={{ borderColor: theme.border }}>
                  <span className="text-[8px] text-gray-500 uppercase font-black tracking-wide block mb-1">استفسارات مقترحة سريعة:</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => triggerPresetChat("كم ربحي هذا الشهر؟")}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-gray-300 font-semibold py-1 px-2.5 rounded-lg border border-slate-820 cursor-pointer"
                    >
                      💰 كم ربحي هذا الشهر؟
                    </button>
                    <button
                      onClick={() => triggerPresetChat("ما أكثر منتج ناجح؟")}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-gray-300 font-semibold py-1 px-2.5 rounded-lg border border-slate-820 cursor-pointer"
                    >
                      🔥 ما أكثر منتج ناجح؟
                    </button>
                    <button
                      onClick={() => triggerPresetChat("أنشئ حملة سناب للعود الملكي")}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-gray-300 font-semibold py-1 px-2.5 rounded-lg border border-slate-820 cursor-pointer"
                    >
                      📢 حملة سناب للعود الملكي
                    </button>
                  </div>
                </div>

                {/* Input form */}
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اسأل سهم: 'كم ربحي هذا الشهر؟' أو اطلب حملة حية..."
                    className="flex-1 text-xs py-2 px-3.5 rounded-xl border outline-none bg-slate-950 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    style={{ borderColor: theme.border }}
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-black cursor-pointer active:scale-95 transition-all text-xs font-black inline-flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SUBTAB 2: OPPORTUNITIES & COMPETITORS SPY
            ========================================== */}
        {currentSubTab === 'opportunities' && (
          <div className="space-y-6">
            
            {/* Opportunity Engine (نظام اكتشاف الفرص تلقائياً) */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-white">محرك اكتشاف الفرص التسويقية والربحية (Opportunity Scanner)</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">يقوم بالمسح المستمر لمخزونك وسلة الشراء والطلب لابتكار مبيعات ذكية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Opp 1 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-right ${oppApproved.opp_1 ? 'bg-emerald-500/5 border-emerald-500/25 opacity-80' : 'bg-slate-900/50 border-slate-800'}`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-emerald-400 py-0.5 px-2 bg-emerald-500/10 rounded-full inline-block">💎 فرصة ربح أعلى (+25%)</span>
                    <h4 className="text-xs font-bold text-white">تكلفة توريد دهن كلمنتان انخفضت</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                      عرض المورد الحالي يمنحك انخفاض 15 ريال للتولة. هامش ربح إضافي متاح بمقدار 18% لو طلبت التوريد الآن.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOppApproved(prev => ({ ...prev, opp_1: true }));
                      alert("💸 تم قبول الفرصة وهامش الربح سيتعدل تلقائياً بفواتير توريد 'مراسيم الطيب'!");
                    }}
                    disabled={oppApproved.opp_1}
                    className="w-full py-1.5 bg-emerald-500 text-black text-[10px] rounded-lg font-black mt-2 cursor-pointer transition-colors hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {oppApproved.opp_1 ? "تم التفعيل بنجاح ✓" : "استغلال الفرصة والتوريد 💸"}
                  </button>
                </div>

                {/* Opp 2 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-right ${oppApproved.opp_2 ? 'bg-emerald-500/5 border-emerald-500/25 opacity-80' : 'bg-slate-900/50 border-slate-800'}`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-blue-400 py-0.5 px-2 bg-blue-500/10 rounded-full inline-block">👥 إعادة استهداف ذكي</span>
                    <h4 className="text-xs font-bold text-white">سلات متروكة لـ 143 عميلاً</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                      هناك 143 عميلاً أضافوا دهن كلمنتان للسلة ولم يكملوا الدفع في الـ 48 ساعة الماضية. ننصح ببرودكاست واتساب تلقائي بخصم 10% الحين.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOppApproved(prev => ({ ...prev, opp_2: true }));
                      alert("💬 تم تشغيل روبوت الواتساب البرودكاست لإرسال خصم 10% لكافة العملاء الـ 143!");
                    }}
                    disabled={oppApproved.opp_2}
                    className="w-full py-1.5 bg-blue-500 text-white text-[10px] rounded-lg font-black mt-2 cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-50"
                  >
                    {oppApproved.opp_2 ? "تم إرسال برودكاست الخصم ✓" : "إطلاق حملة الاستعادة الذكية 🚀"}
                  </button>
                </div>

                {/* Opp 3 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-right ${oppApproved.opp_3 ? 'bg-emerald-500/5 border-emerald-500/25 opacity-80' : 'bg-slate-900/50 border-slate-800'}`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-[#EF4444] py-0.5 px-2 bg-red-500/10 rounded-full inline-block">🧊 بضائع وسلع راكدة</span>
                    <h4 className="text-xs font-bold text-white">مبخرة السيراميك مستقرة بالمخزن</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                      هذا الصنف راكد منذ 32 يوماً ويستوعب تكاليف تخزين غير مبررة. اقترح دمج مبخرة مجانية كهدية مع كل عبوة تولة دهن عود كلمنتان.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOppApproved(prev => ({ ...prev, opp_3: true }));
                      alert("🎁 تم إنشاء عرض ديناميكي مدمج بالمتجر ومزامنة العرض التلقائي!");
                    }}
                    disabled={oppApproved.opp_3}
                    className="w-full py-1.5 bg-amber-500 text-black text-[10px] rounded-lg font-black mt-2 cursor-pointer transition-colors hover:bg-amber-600 disabled:opacity-50"
                  >
                    {oppApproved.opp_3 ? "العرض فعال ومتاح الحين ✓" : "تجميع العرض وتطهير المخزن 📦"}
                  </button>
                </div>

                {/* Opp 4 */}
                <div className="p-4 rounded-xl border flex flex-col justify-between gap-3 text-right bg-slate-900/50 border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-purple-400 py-0.5 px-2 bg-purple-500/10 rounded-full inline-block">🍂 موسمية ومناسبات</span>
                    <h4 className="text-xs font-bold text-white">اقتراب موسم تداول الهدايا</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                      المؤشرات الوطنية تظهر صعود بنسبة 300% لطلب هدايا العود بالقرن الحالي. نوصي بتجهيز باقة هدايا مغلقة بشنطة خشبية فاخرة.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert("✨ تم بدء تصميم بوكس الهدايا وإلحاقه بمنتجات 'سلة'!");
                    }}
                    className="w-full py-1.5 bg-purple-500 text-white text-[10px] rounded-lg font-black mt-2 cursor-pointer transition-colors hover:bg-purple-600"
                  >
                    تجهيز بوكس هدايا وتوليد بالـ AI 🎁
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Pricing Assistant & Competitors Spy Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Product Pricing Assistant (Left 7-columns) */}
              <div className="lg:col-span-7 p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <BadgePercent className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-black text-white">مساعد التسعير الذكي والديناميكي (SaaSMaster Dynamic Pricing)</h3>
                    <p className="text-[10px] text-gray-405">يقوم باقتراح مستويات سعرية مدروسة بالمنحنى الاقتصادي لزيادة الإيرادات وهامش الأرباح</p>
                  </div>
                </div>

                {/* Pricing calculators widget */}
                <div className="space-y-4 text-right">
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold block">اختر الصنف المستهدف بالتسعير:</label>
                      <select
                        value={selectedPricingProd.name}
                        onChange={(e) => {
                          const matched = presets.find(p => p.name === e.target.value) || presets[0];
                          setSelectedPricingProd(matched);
                        }}
                        className="w-full text-xs py-2 px-3.5 rounded-xl border outline-none bg-slate-950 text-white"
                        style={{ borderColor: theme.border }}
                      >
                        {presets.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold block">تكلفة التوريد للتولة / الوحدة:</label>
                      <div className="py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-gray-300">
                        {selectedPricingProd.cost} ريال سعودي
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold block">السعر المستقر الحالي بكتالوج سلة:</label>
                      <div className="py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400">
                        {selectedPricingProd.price} ريال سعودي
                      </div>
                    </div>
                  </div>

                  {/* Suggestion outcomes boards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {/* Optimal Price */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2 text-right">
                      <span className="text-[9px] text-emerald-400 uppercase font-bold block">🎯 السعر المثالي (Optimal)</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-emerald-400 font-mono">{pricingResults.optimal.price} ريال</span>
                        <span className="text-[9px] text-gray-400">الربح +{pricingResults.optimal.profit} ر.س</span>
                      </div>
                      <p className="text-[9px] text-gray-400 leading-relaxed pt-1 border-t border-slate-900">
                        {pricingResults.optimal.reason}
                      </p>
                    </div>

                    {/* Promo Price */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/20 space-y-2 text-right">
                      <span className="text-[9px] text-blue-400 uppercase font-bold block">⚡ سعر العرض الترويجي</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-blue-400 font-mono">{pricingResults.promo.price} ريال</span>
                        <span className="text-[9px] text-gray-400">الربح +{pricingResults.promo.profit} ر.س</span>
                      </div>
                      <p className="text-[9px] text-gray-400 leading-relaxed pt-1 border-t border-slate-900">
                        {pricingResults.promo.reason}
                      </p>
                    </div>

                    {/* Clearance Price */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-red-500/20 space-y-2 text-right">
                      <span className="text-[9px] text-red-400 uppercase font-bold block">🧊 سعر صفقة التصفية</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-red-400 font-mono">{pricingResults.clearance.price} ريال</span>
                        <span className="text-[9px] text-gray-400">الربح +{pricingResults.clearance.profit} ر.س</span>
                      </div>
                      <p className="text-[9px] text-gray-400 leading-relaxed pt-1 border-t border-slate-900">
                        {pricingResults.clearance.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1.5">
                    <button
                      onClick={() => {
                        const updated = products.map(p => {
                          if (p.name === selectedPricingProd.name) {
                            return { ...p, price: pricingResults.optimal.price };
                          }
                          return p;
                        });
                        setProducts(updated);
                        alert(`💸 تم دمج وتعديل السعر لـ '${selectedPricingProd.name}' ليصبح ${pricingResults.optimal.price} ريال بمخزن سلة!`);
                      }}
                      className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 font-black text-xs text-black cursor-pointer active:scale-95 transition-all text-center"
                    >
                      🚀 تطبيق سعر البيع الأمثل بالمتجر
                    </button>
                  </div>
                </div>
              </div>

              {/* Competitor Spy Tracking Simulator (Right 5-columns) */}
              <div className="lg:col-span-5 p-5 rounded-2xl border space-y-4 flex flex-col justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                    <Eye className="w-4.5 h-4.5 text-[#EF4444]" />
                    <div>
                      <h3 className="text-xs font-black text-white">تحليل مقارنة الأسعار (Pricing Competitor Audit)</h3>
                      <p className="text-[9px] text-gray-400 mt-0.5">رصد فوري ذكي لتغير أسعار المتاجر وتنافسية عروض المنتجات</p>
                    </div>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2 text-right relative overflow-hidden">
                    <p className="text-xs font-black text-red-300">🚨 تم رصد نشاط ترويجي من المنافسين</p>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-bold">
                      أطلق "متجر النخبة للعود" حملة خصومات حية معلنة للتأثير على مبيعات قنوات العود بالمنطقة.
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("sahm_navigate_command_center", { detail: { subTab: "competitors" } }));
                    }}
                    className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-rose-300 hover:text-white rounded-xl text-xs font-black cursor-pointer transition-all border border-red-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>تحليل سعر المنافس 📡</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SUBTAB 3: AI PRODUCT STUDIO (REBUILT)
            ========================================== */}
        {currentSubTab === 'product_studio' && (
          <AIProductStudio 
            theme={theme}
            products={products}
            setProducts={setProducts}
            setActiveTab={setActiveTab}
            setPrefillPublish={setPrefillPublish}
            onSubTabNavigate={(subTab: string) => setCurrentSubTab(subTab as any)}
          />
        )}

        {/* Legacy store constructor safely deactivated */}
        {false && currentSubTab === 'store_constructor' && (
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black text-white">منشئ ومصنع المنتجات والمتاجر الذكية المتكامل (AI Full E-store Constructor)</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">برفع مسودة تصميم أو صورة منتج واحدة، يتم صياغة متجرك وحملاتك وإعلاناتك بالكامل دفعة واحدة في حزمة ذكاء موحدة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Upload or Choose presets column (Left 4-cols) */}
                <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4 text-right">
                  <h4 className="text-xs font-bold text-white">الخطوة 1: ارفع صورة الصنف أو الشعار</h4>

                  <div
                    onClick={() => constructorFilesRef.current?.click()}
                    className="border-2 border-dashed border-slate-755 rounded-xl h-44 bg-slate-950 flex flex-col justify-center items-center p-3 text-center cursor-pointer transition-all hover:bg-slate-900 relative overflow-hidden group"
                  >
                    {constructorImage ? (
                      <>
                        <img src={constructorImage.uri} className="absolute inset-0 w-full h-full object-cover" alt="Uploaded" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-gray-200">تغيير الملف 🔄</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-center text-gray-500">
                        <UploadCloud className="w-8 h-8 mx-auto text-amber-500 animate-bounce-slow" />
                        <p className="text-xs text-white font-bold">انقر أو اسحب صورة المنتج/الشعار</p>
                        <span className="text-[9px] block">يدعم JPG, JPEG, PNG</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={constructorFilesRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setConstructorImage({
                          uri: URL.createObjectURL(file),
                          base64: "", // simulation
                          mimeType: file.type
                        });
                      }
                    }}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold block">الخطوة 2: اكتب اسم الصنف المخطط له:</label>
                    <input
                      type="text"
                      value={constructorName}
                      onChange={(e) => setConstructorName(e.target.value)}
                      placeholder="مثل: دهن عود كلمنتان طبيعي"
                      className="w-full text-xs py-2 px-3.5 rounded-xl border outline-none bg-slate-950 text-white"
                      style={{ borderColor: theme.border }}
                    />
                  </div>

                  <button
                    onClick={handleFullStoreConstruction}
                    disabled={isConstructing}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl text-black cursor-pointer text-xs font-black transition-all flex items-center justify-center gap-1"
                  >
                    {isConstructing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري صب وتحويل الكتالوج بالـ AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>الإنشاء الفوري الكامل للمتجر الإعلاني 🚀</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Construction and Content Factory Outcome panel (Right 8-cols) */}
                <div className="lg:col-span-8 space-y-5">
                  {constructionResult ? (
                    <div className="space-y-6 animate-fade-in text-right">
                      
                      {/* Grader Metrics display */}
                      {graderResults && (
                        <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-3">
                          <div className="flex justify-between items-center border-b pb-2 border-emerald-500/10">
                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>تحليل جودة وتكوين الصورة (AI Image Quality Grader)</span>
                            </span>
                            <span className="text-xs bg-emerald-500 text-black font-black py-0.5 px-2.5 rounded">
                              الدرجة: {graderResults.score} / 100
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-gray-300">
                            <div>• <span className="font-bold text-white">إضاءة اللقطة:</span> {graderResults.details.brightness}</div>
                            <div>• <span className="font-bold text-white">التركيب والمحاذاة:</span> {graderResults.details.composition}</div>
                            <div>• <span className="font-bold text-white">الخلفية:</span> {graderResults.details.background}</div>
                            <div>• <span className="font-bold text-white">درجة التباين والوضوح:</span> {graderResults.details.resolution}</div>
                          </div>

                          <div className="border-t pt-2 border-emerald-500/10 text-[9px] text-gray-400 space-y-1">
                            <span className="font-black text-emerald-400 block mb-0.5">🛠️ نصائح مجربة لتحسين الصورة لزيادة الشراء:</span>
                            {graderResults.details.tips.map((tip: string, i: number) => (
                              <p key={i}>— {tip}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content Factory Outputs - Snapchat, TikTok, etc */}
                      <div className="p-5 rounded-xl border bg-slate-950 border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                          <span className="text-xs font-black text-white">مصنع المحتوى الإعلاني الموحد (AI Content Factory — 7 Channels Output in 1 Click)</span>
                          <span className="text-[9px] font-bold py-0.5 px-2 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                            جاهز للنشر ⚡
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-[9px] font-extrabold text-amber-500 block">📱 إعلان سناب شات (Snapchat Ad Caption)</span>
                            <p className="text-[10px] text-gray-300 italic">"فخامتك تبدأ من هيبتك بالمجالس! 👑 كلمنتان الأصلي الطبيعي بنكهته البخورية الساحرة. اطلب الحين بخصم 15%."</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-[9px] font-extrabold text-[#EF4444] block">🎵 سيناريو فيديو تيك توك الخطاف (TikTok Script)</span>
                            <p className="text-[10px] text-gray-300 italic">"سجل أول 3 ثواني: تظهر توله العود والزيت يقطر ببطء! الصوت الخلفي: تبون دهن عود يقلب ريحة المجلس بالضيافة الفخمة وبسعر منافس؟"</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 space-y-1">
                            <span className="text-[9px] font-extrabold text-pink-500 block">📸 كابشن إنستغرام (Instagram Post Caption)</span>
                            <p className="text-[10px] text-gray-300 italic">"عبر عن أصالتك بأجود مراسيم الطيب السعودي. دهن عود كلمنتان فاخر فواح وثبات مذهل يدوم طوال اليوم. مناسب للإهداء والمناسبات 🌸✨"</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 space-y-1">
                            <span className="text-[9px] font-extrabold text-blue-400 block">🔍 إعلان محركات بحث جوجل (Google Search Ad Copy)</span>
                            <p className="text-[10px] text-gray-300 italic">"دهن عود كلمنتان فاخر 100% | متجر مراسيم الطيب | شحن وتوصيل فوري ودفع آمن تماماً بمدى وأبل باي. اطلب طال عمرك الحين بخصم 15%"</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 space-y-1 md:col-span-2">
                            <span className="text-[9px] font-extrabold text-emerald-400 block">💬 رسالة برودكاست الواتساب للعملاء السابقين (WhatsApp Broadcaster Copy)</span>
                            <p className="text-[10px] text-gray-300 italic">"يا هلا بالغالي! 🌸 عميلنا المتميز بمتجر مراسيم الطيب، وفرنا لك دهن كلمنتان الطبيعي الفاخر بنسخته الملوكية الحصرية. بمناسبة عودتك، نقدم لك خصماً فريداً بقيمة 15% مع شحن مجاني لأرامكس لطلبك القادم. كود التفعيل: GO15 🔗🚚"</p>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Frontend Landing page preview */}
                      <div className="p-5 rounded-xl border bg-slate-950 border-slate-800 space-y-4">
                        <span className="text-xs font-black text-white block border-b pb-2 border-slate-800">
                          🖥️ معاينة صفحة هبوط المتجر على منصة سلة (Live Salla Product Page Preview Mockup)
                        </span>

                        <div className="bg-white text-[#151F24] p-5 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-5 font-sans">
                          {/* Image preview in salla web (left 4-cols) */}
                          <div className="md:col-span-5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-center">
                            {constructorImage ? (
                              <img src={constructorImage.uri} className="w-full max-h-56 object-contain rounded-lg" alt="Salla Preview" />
                            ) : (
                              <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                                تولة العود الفاخرة
                              </div>
                            )}
                          </div>

                          {/* Options in salla web (right 7-cols) */}
                          <div className="md:col-span-7 space-y-3 text-right">
                            <span className="text-[9px] bg-[#EAF2F6] text-[#006699] font-bold py-0.5 px-2 rounded">
                              فئة: {constructionResult.category}
                            </span>
                            <h2 className="text-base font-black text-gray-900 leading-snug">{constructionResult.name}</h2>
                            
                            <div className="flex justify-start gap-2.5 items-baseline">
                              <span className="text-lg font-bold text-emerald-600">350 ر.س</span>
                              <span className="text-xs text-gray-400 line-through">420 ر.س</span>
                            </div>

                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {constructionResult.description}
                            </p>

                            <div className="border-t pt-2.5 flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-500">الضمان الحصري:</span>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold py-0.5 px-1.5 rounded">
                                استرجاع مجاني 100% لو ريحته ما جازت لك ✓
                              </span>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button className="flex-grow py-2.5 bg-[#D4AF37] hover:bg-[#C29F2E] text-black font-extrabold text-xs rounded-lg cursor-pointer">
                                إضـافة للسـلّة 🛒
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="p-8 border border-dashed text-center rounded-xl text-gray-500 space-y-2">
                      <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-400">يرجى رفع أو كتابة بيانات الصنف وبدء الإنشاء الذكي بالذكاء الاصطناعي لمشاهدة المخرجات المتكاملة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            SUBTAB 4: FORECASTING,Restock & SAUDI ZAKATH
            ========================================== */}
        {currentSubTab === 'forecasting' && (
          <div className="space-y-6">
            
            {/* Sales forecasting & Predictive limits */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">محرك التنبؤ بالمبيعات ومؤشرات الاستهلاك الذكية (Sales Forecasting Engine)</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">يتوقع مبيعات المخزن للأسبوع القادم والشهر القادم استناداً على التعلم الآلي والأنماط التاريخية</p>
                  </div>
                </div>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 font-bold py-0.5 px-2.5 rounded border border-sky-500/20">
                  الحقبة: عروض الصيف 2026 🍦
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Visual Chart Graphic (Left 7-columns) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[9px] text-gray-400 block font-bold">المخطط التنبؤي المتوقع للمبيعات (ريال سعودي / يوم بالـ 7 أيام القادمة)</span>
                    
                    {/* Beautiful manual SVG Line Chart */}
                    <div className="h-44 w-full flex items-end justify-between px-4 pb-2 pt-6 relative font-mono text-[9px]">
                      {/* Vertical line guidelines */}
                      <span className="absolute bottom-0 left-0 w-full mb-10 border-b border-slate-900 border-dashed pointer-events-none"></span>
                      <span className="absolute bottom-0 left-0 w-full mb-20 border-b border-slate-900 border-dashed pointer-events-none"></span>
                      <span className="absolute bottom-0 left-0 w-full mb-30 border-b border-slate-900 border-dashed pointer-events-none"></span>

                      {/* Line paths and chart points */}
                      <div className="flex-grow flex justify-around items-end h-32 relative z-10">
                        {/* Day 1: 1500 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-amber-505 font-bold text-gray-400">1,500</span>
                          <div className="w-3 rounded bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" style={{ height: "40px" }}></div>
                          <span className="text-gray-500 text-[8px]">السبت</span>
                        </div>
                        {/* Day 2: 1750 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-amber-505 font-bold text-gray-400">1,750</span>
                          <div className="w-3 rounded bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" style={{ height: "50px" }}></div>
                          <span className="text-gray-500 text-[8px]">الأحد</span>
                        </div>
                        {/* Day 3: 2200 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-amber-305 font-bold text-amber-500 font-extrabold">2,200</span>
                          <div className="w-3 rounded bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" style={{ height: "65px" }}></div>
                          <span className="text-gray-500 text-[8px]">الاثنين</span>
                        </div>
                        {/* Day 4: 1900 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-amber-505 font-bold text-gray-400">1,900</span>
                          <div className="w-3 rounded bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" style={{ height: "55px" }}></div>
                          <span className="text-gray-500 text-[8px]">الثلاثاء</span>
                        </div>
                        {/* Day 5: 3100 (Peak weekend start) */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-emerald-400 font-black">3,100 🔥</span>
                          <div className="w-3 rounded bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer animate-pulse" style={{ height: "92px" }}></div>
                          <span className="text-gray-200 text-[8px] font-bold">الأربعاء</span>
                        </div>
                        {/* Day 6: 2800 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-amber-505 font-bold text-gray-400">2,800</span>
                          <div className="w-3 rounded bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" style={{ height: "82px" }}></div>
                          <span className="text-gray-500 text-[8px]">الخميس</span>
                        </div>
                        {/* Day 7: 3500 (Full peak weekend) */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-emerald-400 font-black">3,500 🚀</span>
                          <div className="w-3 rounded bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer animate-pulse" style={{ height: "105px" }}></div>
                          <span className="text-gray-200 text-[8px] font-bold">الجمعة</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Analytical Foreseeing details cards (Right 5-columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-3 text-right">
                    <span className="text-[10px] text-sky-400 font-black uppercase block">مؤشرات التنبؤ للفترة القادمة</span>
                    
                    <div className="flex justify-between border-b pb-2 border-slate-900 text-[10px]">
                      <span className="text-gray-400">توقع مبيعات الأسبوع القادم:</span>
                      <span className="text-white font-black">17,000 ريال سعودي</span>
                    </div>

                    <div className="flex justify-between border-b pb-2 border-slate-900 text-[10px]">
                      <span className="text-gray-400">توقع المبيعات الشهر القادم:</span>
                      <span className="text-white font-black font-mono">72,500 ريال سعودي (+12%)</span>
                    </div>

                    <div className="flex justify-between border-b pb-2 border-slate-900 text-[10px]">
                      <span className="text-gray-400">أيام الذروة والمواسم الأقوى:</span>
                      <span className="text-emerald-400 font-bold">نهاية الأسبوع (الجمعة والأربعاء)</span>
                    </div>

                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400 font-bold">توقعات العائد المالي الإجمالي:</span>
                      <span className="text-amber-500 font-black">متنامي وسليم 📈</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Restock alarm & Saudi ZATCA Zakath Advisor Dual System */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Supplier restock purchase assistant */}
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-xs font-black text-white">مساعد شراء الموردين والطلب الاستباقي (Supplier Restock Co-pilot)</h3>
                </div>

                <div className="space-y-3.5 text-right font-sans text-xs">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    يقوم الروبوت بتحليل سرعة استهلاك رصيد الصنف وتخمين زمن شحن المورد، ليقترح اللحظة المناسبة لإعادة الطلب دون مجهود:
                  </p>

                  <div className="p-3 bg-slate-950 rounded-lg space-y-1.5 border border-slate-900 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">الصنف المهدد بالنفاذ:</span>
                      <span className="text-white font-bold">زعفران ناقيل سوبر فاخر</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المخزن الحالي:</span>
                      <span className="text-[#EF4444] font-bold">12 وحدة فقط 🚨</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">تاريخ النفاد التقديري:</span>
                      <span className="text-amber-400 font-bold">2026-06-07 (خلال 6 أيام)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-1.5">
                      <span className="text-gray-400 font-bold">أمر شراء مقترح:</span>
                      <span className="text-emerald-400 font-black">طلب توريد 100 وحدة الحين</span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("📦 تم تحضير قيد التوريد وإرساله لشركة الشحن الشريكة بالمنطقة الوسطى!")}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 font-bold text-[10px] text-white rounded-lg cursor-pointer transition-colors"
                  >
                    تفويض أمر شراء المورد التلقائي الحين 📦
                  </button>
                </div>
              </div>

              {/* Saudi Zakath AI Advisor for Merchants (مستشار الزكاة الشرعي للتجار بالسعودية) */}
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-black text-white">مستشار الزكاة الشرعي والضريبي للتاجر 🇸🇦</h3>
                    <p className="text-[9px] text-gray-400 mt-0.5">حساب زكاة عروض التجارة والتدفقات النقدية وفق إملاءات الشريعة وهيئة الزكاة الزكوية</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-right font-sans text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-bold block">السيولة/الكاش المتاح:</span>
                      <input
                        type="number"
                        value={calcCash}
                        onChange={(e) => setCalcCash(Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold py-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-bold block">مستحقات على الزبائن:</span>
                      <input
                        type="number"
                        value={calcReceivables}
                        onChange={(e) => setCalcReceivables(Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold py-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-bold block">القيمة السوقية للمخزون:</span>
                      <input
                        type="number"
                        value={calcStockValue}
                        onChange={(e) => setCalcStockValue(Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold py-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calculateSaudiZakath}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 font-black text-[10px] text-black rounded-lg cursor-pointer transition-colors"
                  >
                    حساب وعاء الزكاة ومقدار الاستحقاق الشرعي 🕋
                  </button>

                  {zakathResults && (
                    <div className="p-3 bg-slate-950 rounded-lg space-y-1.5 border border-amber-500/10 text-[9px] leading-relaxed animate-fade-in text-right">
                      <div className="flex justify-between text-[10px] border-b border-slate-900 pb-1.5">
                        <span className="text-gray-400 font-bold">إجمالي الوعاء الزكوي لعروض التجارة:</span>
                        <span className="text-white font-black font-mono">{(zakathResults.zakathBase).toLocaleString()} ريال سعودي</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-amber-400 pt-0.5">
                        <span>مقدار الزكاة المستحقة شرعاً (2.5%):</span>
                        <span>{(zakathResults.amountDue).toLocaleString()} ر.س</span>
                      </div>
                      <p className="text-gray-400 mt-1">{zakathResults.advice}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SUBTAB 5: AUTOMATED CUSTOMER RESPONSE SIMULATOR
            ========================================== */}
        {currentSubTab === 'support_bot' && (
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
                <MessageSquare className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white">وكيل خدمة عملاء بالذكاء الاصطناعي (AI Customer Support Broker Simulator)</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">محاكي متكامل لاستقبال رسائل الواتساب والويب لزبائن الخليج والرد التلقائي عليها بلهجات واثقة ومرحِبة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Active Chat lists (Left 4-columns) */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-[9px] text-gray-550 block font-black uppercase tracking-wide">الرسائل الحية المتلقاة:</span>
                  
                  {supportChats.map(chat => {
                    const isSelected = activeSupportChatId === chat.id;
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setActiveSupportChatId(chat.id)}
                        className={`p-3 rounded-xl border cursor-pointer hover:border-emerald-400/40 transition-all text-right space-y-1 ${
                          isSelected ? 'bg-slate-950 border-emerald-500' : 'bg-slate-900/50 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-white text-xs truncate max-w-[130px]">{chat.customerName}</span>
                          <span className="text-[9px] text-gray-500">لهجة: {chat.dialect}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate text-right">
                          {chat.lastMsg}
                        </p>
                        <div className="flex justify-between items-center text-[9px] pt-1">
                          <span className="bg-slate-800 text-gray-300 py-0.5 px-1.5 rounded text-[8px]">
                            رقم الطلب: {chat.orderId}
                          </span>
                          <span className="text-emerald-400 font-bold">{chat.paymentStatus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Chat Interface (Right 8-columns) */}
                <div className="lg:col-span-8 p-5 rounded-xl bg-slate-950 border border-slate-850 h-[400px] flex flex-col justify-between">
                  
                  {/* Whatsapp Greenish header */}
                  <div className="bg-[#075E54] text-white p-3 rounded-t-lg flex justify-between items-center shrink-0 -m-5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                        {supportChats.find(c => c.id === activeSupportChatId)?.customerName.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{supportChats.find(c => c.id === activeSupportChatId)?.customerName}</span>
                        <span className="text-[9px] text-emerald-200 block">نشط الآن بالوتساب 📞</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat logs body */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-1 text-right mt-3">
                    {supportChats.find(c => c.id === activeSupportChatId)?.history.map((msg, i) => (
                      <div key={i} className="space-y-1">
                        <div className={`p-2.5 rounded-xl text-xs max-w-[75%] inline-block text-right ${
                          msg.sender === 'customer' 
                            ? 'bg-[#E1FFC7] text-gray-900 font-medium float-left rounded-bl-none' 
                            : 'bg-slate-900 border border-slate-800 text-gray-100 float-right rounded-br-none'
                        }`}>
                          {msg.text}
                        </div>
                        <div className="clear-both"></div>
                      </div>
                    ))}

                    {isReplyingIndex === activeSupportChatId && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-gray-400 float-right w-fit">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 inline-block ml-1.5" />
                        <span>الروبوت يقرأ سجل طلبات العميل الحقيقي ويكتب رداً حنوناً...</span>
                      </div>
                    )}
                  </div>

                  {/* Reply button area */}
                  <div className="border-t pt-3 flex gap-2" style={{ borderColor: theme.border }}>
                    <button
                      onClick={() => handleReplyOnWhatsApp(activeSupportChatId)}
                      disabled={isReplyingIndex !== null}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>توليد والرد التلقائي بالـ AI على هذا المشتري 🚀</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            SUBTAB 6: SMART PROFIT CENTER & STORE HEALTH
            ========================================== */}
        {currentSubTab === 'profit_health' && (
          <div className="space-y-6">
            
            {/* Health parameters out of 100 with steps checklist */}
            <div className="p-6 rounded-2xl border space-y-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3.5" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-black text-white">مؤشر ومقياس صحة متجر مراسيم الطيب (Store E-Commerce Health Score)</h3>
                    <p className="text-[10px] text-gray-405">تقييم شامل وصارم من 100 لمتجرك بالتسويق والمخازن والأرباح و خدمة التوصيل</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-955 p-1 px-3 border border-slate-800 rounded-xl text-xs font-black text-amber-500">
                  <span>المستوى: ممتاز وريادي 🌟</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-right">
                
                {/* Circular indicator out of 100 (Left 4-cols) */}
                <div className="lg:col-span-4 text-center p-5 bg-slate-950 rounded-xl border border-slate-900 space-y-3 flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 block font-bold">نقاط صحة متجرك</span>
                  
                  {/* Gauge representation */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="50" stroke={`${theme.border}`} strokeWidth="8" fill="transparent" />
                      <circle cx="64" cy="64" r="50" stroke="#D4AF37" strokeWidth="8" fill="transparent" strokeDasharray="314" strokeDashoffset={`${314 - (314 * healthScore) / 100}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-2xl font-black text-white font-mono">{healthScore} %</span>
                  </div>

                  <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed mx-auto">
                    متجرك يتفوق على 86% من متاجر العود بالرياض هذا الربع بمعدل توصيل سريع وبث تسويقي مرن.
                  </p>
                </div>

                {/* Actionable checklist plans for growth (Right 8-cols) */}
                <div className="lg:col-span-8 space-y-3">
                  <h4 className="text-xs font-black text-white">خطة التحسين المقترحة تلقائياً لمعدل 100% المثالي:</h4>
                  
                  <div className="space-y-2">
                    {/* Item 1 */}
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-right">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-200">1. تعزيز الاستهداف وإضافة برودكاست سريعة للواتساب</span>
                        <p className="text-[9px] text-gray-400">يرفع من درجة التسويق بنسبة +8 نقاط إضافية على المقياس</p>
                      </div>
                      <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 py-1 px-2.5 rounded border border-amber-500/20">
                        اقتراح معلق
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-right">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-200">2. توريد المزيد من 'زعفران ناقيل سوبر' لتفادي النفاد المبكر</span>
                        <p className="text-[9px] text-gray-400">يرفع من درجة المخازن بنسبة +5 نقاط على مقياس السلامة</p>
                      </div>
                      <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 py-1 px-2.5 rounded border border-amber-500/20">
                        قيد التنفيذ
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3 text-right">
                      <div className="space-y-0.5 opacity-80">
                        <span className="text-xs font-bold text-white line-through">3. تفعيل الربط التلقائي والشهادات المحمية لـ ZATCA</span>
                        <p className="text-[9px] text-gray-400">اكتمل التفعيل الضريبي بنجاح تام ✓</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500 text-black font-extrabold py-0.5 px-2 rounded">
                        مكتمل ✓
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Smart profit center (مركز الأرباح الذكي للأصناف والعملاء والشبكات) */}
            <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">مركز الأرباح المتقدم (Smart Profit Analytics Hub)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-right">
                
                {/* Metric Profit 1 */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">الأكثر مبيعاً وربحية للتولة</span>
                  <span className="text-sm font-bold text-white block">دهن عود كلمنتان فاخر</span>
                  <div className="flex justify-between items-center text-[9px] text-emerald-400 font-bold pt-1 border-t border-slate-950 mt-1">
                    <span>هامش التولة: 62%</span>
                    <span>صافي مبيعات: 33K ر.س</span>
                  </div>
                </div>

                {/* Metric Profit 2 */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">العميل الأعلى قيمة متراكمة (Highest LTV)</span>
                  <span className="text-sm font-bold text-white block">أ. عبدالرحمن الزامل</span>
                  <div className="flex justify-between items-center text-[9px] text-gray-400 pt-1 border-t border-slate-950 mt-1">
                    <span>حجم الشراء: 12 طلبيات</span>
                    <span className="text-amber-500 font-bold">LTV: 4,800 ريال</span>
                  </div>
                </div>

                {/* Metric Profit 3 */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">القنوات الأعلى تحويلاً بالشراء (CR)</span>
                  <span className="text-sm font-bold text-white block">حملات سناب شات</span>
                  <div className="flex justify-between items-center text-[9px] text-emerald-400 font-bold pt-1 border-t border-slate-950 mt-1">
                    <span>معدل التحويل: 4.8%</span>
                    <span>ROAS متوسط: 5.1x</span>
                  </div>
                </div>

                {/* Metric Profit 4 */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">تكلفة الاستحواذ للزبون الجديد (CAC)</span>
                  <span className="text-sm font-bold text-white block">38 ريال سعودي / عميل</span>
                  <div className="flex justify-between items-center text-[9px] text-gray-400 pt-1 border-t border-slate-950 mt-1">
                    <span>حجم التدفق سليم ✓</span>
                    <span className="text-emerald-400">CAC:LTV ratio 1:8</span>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Academy learning section */}
            <div className="p-5 rounded-2xl border space-y-4 font-sans text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.border }}>
                <BookOpen className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-xs font-black text-white">أكاديمية سهم الرقمية والنمو (Sahm AI Academy for Merchants)</h3>
                  <p className="text-[9px] text-gray-400 mt-0.5">دروس واقتراحات تعليمية حية مخصصة استناداً لبيانات مخزنك الحالية لزيادة مبيعاتك وأرباحك</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 text-[10px] space-y-2 text-right border border-slate-900">
                  <span className="text-amber-500 font-black text-[11px] block">📚 كيف تقلل تكلفة الاستحواذ على الزبون CAC لعطور العود؟</span>
                  <p className="text-gray-400 leading-relaxed">
                    من خلال رصدنا لعملاء الرياض، يتضح أن كابشن الفيديو الذي يبدأ بخطاف ترويحي يمس قيمة 'الإهداء وكتابة الأسماء بالليزر على علبة العود' يحقق مبيعات عظمى بتكلفة صرف أقل بنسبة 45%.
                  </p>
                  <span className="text-[9px] text-emerald-400 block font-bold">الفائدة المتوقعة: خفض تكاليف الصرف الإعلاني بنسبة 20%</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 text-[10px] space-y-2 text-right border border-slate-900">
                  <span className="text-amber-500 font-black text-[11px] block">📚 استراتيجية رفع أسعار الأصناف موسمياً دون فقدان التاجر</span>
                  <p className="text-gray-400 leading-relaxed">
                    الحكمة تملي ألا ترفع أسعار جميع المنتجات في آن واحد. فقط ركز على المنتجات الحاصلة على إضافة مرتفعة بسلة المشتري مثل 'العود الكلمنتان'، ثم ألحقها بمبخرة النقش السيراميكي المجانية كعرض هدايا متكامل.
                  </p>
                  <span className="text-[9px] text-[#EF4444] block font-bold">الفائدة المتوقعة: زيادة هوامش الأرباح بنسبة 18%</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
