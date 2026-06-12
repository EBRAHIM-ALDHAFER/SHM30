import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Invoice, Product, Customer, User, ThemeColors, Supplier } from "../types";
import { 
  Bot, MessagesSquare, Zap, Check, Plus, Search, Sparkles, Trash2, Edit2, Copy, 
  Download, User as UserIcon, Clock, PlusCircle, Filter, ArrowRight, Lock, 
  CheckCircle, TrendingUp, ShoppingCart, DollarSign, AlertCircle, ArrowUp, 
  ArrowDown, HelpCircle, Send, SendHorizontal, LayoutList, ToggleLeft, ToggleRight, 
  Settings as SettingsIcon, Store, ShieldAlert, BadgeCent, Star, Link, BellRing, Eye, EyeOff, CheckSquare, ChevronDown,
  LayoutDashboard, LineChart, Lightbulb, Radio, Brain, ClipboardList, Cpu, Sliders
} from "lucide-react";
import Dashboard from "./Dashboard";
import CustomerTimeline360 from "./CustomerTimeline360";
import ConversationCRM from "./ConversationCRM";
import WorkflowEngine from "./WorkflowEngine";
import ExecutiveHeroCard from "./ExecutiveHeroCard";
import SahmBrain360 from "./SahmBrain360";
import AIAnalyzer from "./AIAnalyzer";
import CompetitorMonitor from "./CompetitorMonitor";
import AutoPublish from "./AutoPublish";
import SaaSBlueprint from "./SaaSBlueprint";
import IntelligentHub from "./IntelligentHub";

interface WorkflowRule {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
  count: number;
}

interface MockMessage {
  id: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'snapchat' | 'x' | 'telegram' | 'tiktok' | 'email' | 'livechat';
  customerName: string;
  text: string;
  time: string;
  category: 'شكوى' | 'طلب' | 'استفسار' | 'شحن' | 'استرجاع';
  sentiment: 'إيجابي' | 'محايد' | 'سلبي';
  avatar: string;
  messages: { sender: 'customer' | 'agent'; text: string; time: string }[];
}

interface SahmCommandCenterProps {
  invoices: Invoice[];
  setInvoices: (val: Invoice[]) => void;
  products: Product[];
  setProducts: (val: Product[]) => void;
  customers: Customer[];
  setCustomers: (val: Customer[]) => void;
  suppliers: Supplier[];
  theme: ThemeColors;
  user: User;
  // SaaS enterprise enhancements (Bullet 10, 18, 19, 8)
  workspaces?: any[];
  activeWorkspaceId?: string;
  setActiveWorkspaceId?: (id: string) => void;
  activeWorkspace?: any;
  subscription?: any;
  setSubscription?: (s: any) => void;
  enabledModules?: Record<string, boolean>;
  setEnabledModules?: (m: Record<string, boolean>) => void;
  notificationsList?: any[];
  setNotificationsList?: (l: any[]) => void;
  triggerNotification?: (text: string, type?: any) => void;
  auditLogs?: any[];
  addAuditLog?: (event: string, text: string) => void;
  aiMemory?: any[];
  setAiMemory?: (m: any[]) => void;
  
  // Real dynamic structures
  allowedStores?: any[];
  activeStoreId?: string;
  setActiveStoreId?: (id: string) => void;
  branches?: any[];
  activeBranchId?: string;
  setActiveBranchId?: (id: string) => void;
  warehouses?: any[];
  activeWarehouseId?: string;
  setActiveWarehouseId?: (id: string) => void;
  setActiveTab?: (tab: string) => void;
  prefillPublish?: any;
  setPrefillPublish?: (val: any) => void;

  activeSubTab?: 'overview' | 'analytics' | 'assistant' | 'recommendations' | 'competitors' | 'alerts' | 'operations' | 'forecasts' | 'performance' | 'cabin_customize' | 'intelligent_hub';
  setActiveSubTab?: (tab: 'overview' | 'analytics' | 'assistant' | 'recommendations' | 'competitors' | 'alerts' | 'operations' | 'forecasts' | 'performance' | 'cabin_customize' | 'intelligent_hub') => void;

  intelligentHubSubTab?: "sahm-brain" | "ai" | "publish" | "saas" | "competitors" | "catalog-health";
  setIntelligentHubSubTab?: (tab: "sahm-brain" | "ai" | "publish" | "saas" | "competitors" | "catalog-health") => void;
  rawCompanies?: any[];
  impersonatedTenantId?: string | null;
  onImpersonate?: (tenantId: string, orgId: string, companyName: string) => void;
  onStopImpersonating?: () => void;
}

export default function SahmCommandCenter({
  invoices,
  setInvoices,
  products,
  setProducts,
  customers,
  setCustomers,
  suppliers,
  theme,
  user,
  workspaces = [],
  activeWorkspaceId = "riyadh",
  setActiveWorkspaceId = () => {},
  activeWorkspace = { rate: 1.0, currency: "ر.س" },
  subscription = { tier: 'B', limit: 10000, currentUsed: 4945, renewsAt: "٢٠٢٧/٠١/٠١" },
  setSubscription = () => {},
  enabledModules = {},
  setEnabledModules = () => {},
  notificationsList = [],
  setNotificationsList = () => {},
  triggerNotification = () => {},
  auditLogs = [],
  addAuditLog = () => {},
  aiMemory = [],
  setAiMemory = () => {},
  
  // Destructure dynamic resources
  allowedStores = [],
  activeStoreId = "store_1",
  setActiveStoreId = () => {},
  branches = [],
  activeBranchId = "",
  setActiveBranchId = () => {},
  warehouses = [],
  activeWarehouseId = "",
  setActiveWarehouseId = () => {},
  setActiveTab = () => {},
  prefillPublish,
  setPrefillPublish = () => {},

  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,

  intelligentHubSubTab,
  setIntelligentHubSubTab,
  rawCompanies = [],
  impersonatedTenantId = null,
  onImpersonate = () => {},
  onStopImpersonating = () => {},
}: SahmCommandCenterProps) {
  // Navigation active tab inside Command Center
  const [localActiveSubTab, setLocalActiveSubTab] = useState<'overview' | 'analytics' | 'assistant' | 'recommendations' | 'competitors' | 'alerts' | 'operations' | 'forecasts' | 'performance' | 'cabin_customize' | 'intelligent_hub'>('overview');

  const activeSubTab = propActiveSubTab || localActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab || setLocalActiveSubTab;

  const subTabsList = [
    { id: 'overview', label: 'لوحة القيادة التنفيذية', icon: LayoutDashboard, color: 'text-emerald-400' },
    { id: 'analytics', label: 'التحليلات والمؤشرات', icon: LineChart, color: 'text-cyan-400' },
    { id: 'recommendations', label: 'التوصيات الذكية', icon: Lightbulb, color: 'text-amber-400' },
    { id: 'competitors', label: 'رصد المنافسين', icon: Radio, color: 'text-indigo-400' },
    { id: 'intelligent_hub', label: 'المنصة الذكية AI Studio', icon: Brain, color: 'text-pink-400' },
    { id: 'assistant', label: 'مساعد سهم الذكي', icon: Bot, color: 'text-sky-400' },
    { id: 'alerts', label: 'التنبيهات الحرجة', icon: AlertCircle, color: 'text-rose-500' },
    { id: 'forecasts', label: 'توقعات المبيعات والمخزون', icon: TrendingUp, color: 'text-violet-400' },
    { id: 'performance', label: 'ملخص الأداء اليومي', icon: ClipboardList, color: 'text-teal-400' },
    { id: 'operations', label: 'أوامر التشغيل والأتمتة', icon: Cpu, color: 'text-orange-400' },
    { id: 'cabin_customize', label: 'تخصيص الكابينة', icon: Sliders, color: 'text-yellow-400' },
  ] as const;

  const [cabinDisplayMode, setCabinDisplayMode] = useState<'compact' | 'expanded'>('expanded');
  const [assistantInnerTab, setAssistantInnerTab] = useState<'chat' | 'recommendations' | 'analyzer' | 'saas'>('chat');

  // Listen to external triggers to swap subtabs / go to competitors
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.subTab) {
        setActiveSubTab(customEvent.detail.subTab);
        if (setActiveTab) {
          setActiveTab("command_center");
        }
      }
    };
    const handleOpenSaaS2030 = () => {
      setActiveSubTab("assistant");
      setAssistantInnerTab("saas");
      if (setActiveTab) {
        setActiveTab("command_center");
      }
    };
    window.addEventListener("sahm_navigate_command_center", handleNavigate);
    window.addEventListener("sahm_open_saas_2030", handleOpenSaaS2030);
    window.addEventListener("sahm_open_saas", handleOpenSaaS2030);
    window.addEventListener("sahm_open_saas_blueprint", handleOpenSaaS2030);
    return () => {
      window.removeEventListener("sahm_navigate_command_center", handleNavigate);
      window.removeEventListener("sahm_open_saas_2030", handleOpenSaaS2030);
      window.removeEventListener("sahm_open_saas", handleOpenSaaS2030);
      window.removeEventListener("sahm_open_saas_blueprint", handleOpenSaaS2030);
    };
  }, [setActiveTab]);

  // Control Cabin Card (ExecutiveHeroCard) open/close under command center
  const [isCommandPanelOpen, setIsCommandPanelOpen] = useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsCommandPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Unified Notification alerts state
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  const triggerAlert = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // --- Actions & Recommendations Cockpit ---
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleExecuteAction = (actId: string, toastMsg: string, feedbackMsg: string) => {
    if (completedActions.includes(actId)) return;
    setCompletedActions([...completedActions, actId]);
    setActionFeedback(feedbackMsg);
    triggerAlert(toastMsg, "success");
    
    // Auto clear feedback after 6s
    setTimeout(() => {
      setActionFeedback(null);
    }, 6000);
  };

  // --- Dynamic Dashboard Builder State ---
  const [dbCards, setDbCards] = useState([
    { id: 'sales', label: 'إجمالي المبيعات والصفقات', visible: true, size: 'medium' as 'small' | 'medium' | 'large', color: 'indigo' },
    { id: 'orders', label: 'الطلبات المكتملة', visible: true, size: 'small' as 'small' | 'medium' | 'large', color: 'emerald' },
    { id: 'profits', label: 'صافي الأرباح المحاسبية', visible: true, size: 'medium' as 'small' | 'medium' | 'large', color: 'gold' },
    { id: 'inventory', label: 'تنبيهات المخزون الحرج', visible: true, size: 'medium' as 'small' | 'medium' | 'large', color: 'rose' },
    { id: 'omnichat', label: 'صندوق المحادثات الموحد', visible: true, size: 'small' as 'small' | 'medium' | 'large', color: 'purple' },
    { id: 'customers_count', label: 'العملاء المستهدفين', visible: true, size: 'small' as 'small' | 'medium' | 'large', color: 'teal' },
  ]);
  const [isDbCustomizing, setIsDbCustomizing] = useState(false);

  // --- Sahm OmniChat State ---
  const [mockChats, setMockChats] = useState<MockMessage[]>([
    {
      id: "chat-1",
      channel: "whatsapp",
      customerName: "سليمان العتيبي",
      text: "استفسار عن أسعار شحنات الجملة للعود الملكي وهل التوصيل مجاني للرياض؟",
      time: "قبل ٥ دقائق",
      category: "استفسار",
      sentiment: "محايد",
      avatar: "س",
      messages: [
        { sender: 'customer', text: "مرحباً بكم، رأيت إعلانكم عن عود الملكي الفاخر.", time: "4:15 م" },
        { sender: 'customer', text: "استفسار عن أسعار شحنات الجملة للعود الملكي وهل التوصيل مجاني للرياض؟", time: "4:17 م" },
      ]
    },
    {
      id: "chat-2",
      channel: "instagram",
      customerName: "ليلى الحربي",
      text: "بلييييز متى بيوصل طلبي لجدة؟ طلبت قبل ٣ أيام وما وصلتني رسالة شركة الشحن",
      time: "قبل ١٢ دقيقة",
      category: "شحن",
      sentiment: "سلبي",
      avatar: "ل",
      messages: [
        { sender: 'customer', text: "لقد أتممت الطلب والدفع بالفيزا ورقم الطلب هو #Sahm-9218", time: "1:02 م" },
        { sender: 'customer', text: "بلييييز متى بيوصل طلبي لجدة؟ طلبت قبل ٣ أيام وما وصلتني رسالة شركة الشحن", time: "1:05 م" },
      ]
    },
    {
      id: "chat-3",
      channel: "snapchat",
      customerName: "عبدالرحمن الراجحي",
      text: "تقدروا توفروا تغليف هدية فاخر للعريس؟ أريد تقديمه كهدية زواج فخمة جداً",
      time: "قبل ساعة",
      category: "طلب",
      sentiment: "إيجابي",
      avatar: "ع",
      messages: [
        { sender: 'customer', text: "أريد شراء ٣ كرتون تمر مجدول سكري مع توزيعات قهوة ملكية", time: "12:15 م" },
        { sender: 'customer', text: "تقدروا توفروا تغليف هدية فاخر للعريس؟ أريد تقديمه كهدية زواج فخمة جداً", time: "12:20 م" },
      ]
    },
    {
      id: "chat-4",
      channel: "x",
      customerName: "خالد الشمري",
      text: "عندي مشكلة في كود الخصم المتاح بالمتجر لا يشتغل، تظهر لي رسالة كود منتهي الصلاحية!",
      time: "قبل ساعتين",
      category: "شكوى",
      sentiment: "سلبي",
      avatar: "خ",
      messages: [
        { sender: 'customer', text: "جربت كود SAHM20 المكتوب بالصفحة الرسمية", time: "11:30 ص" },
        { sender: 'customer', text: "عندي مشكلة في كود الخصم المتاح بالمتجر لا يشتغل، تظهر لي رسالة كود منتهي الصلاحية!", time: "11:35 ص" },
      ]
    },
    {
      id: "chat-5",
      channel: "telegram",
      customerName: "سارة الغامدي",
      text: "أريد إلغاء طلب التمر والقهوة واسترجاع المبلغ المدفوع بالفيزا لظرف طارئ وشكراً لكم",
      time: "أمس",
      category: "استرجاع",
      sentiment: "سلبي",
      avatar: "س",
      messages: [
        { sender: 'customer', text: "السلام عليكم ورحمة الله", time: "الأربعاء ٢:٠٠ م" },
        { sender: 'customer', text: "أريد إلغاء طلب التمر والقهوة واسترجاع المبلغ المدفوع بالفيزا لظرف طارئ وشكراً لكم", time: "الأربعاء ٢:١٥ م" },
      ]
    }
  ]);

  const [selectedChatId, setSelectedChatId] = useState<string>("chat-1");
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiGeneratingReply, setIsAiGeneratingReply] = useState<boolean>(false);

  const selectedChat = mockChats.find(c => c.id === selectedChatId) || mockChats[0];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const updated = mockChats.map(c => {
      if (c.id === selectedChat.id) {
        return {
          ...c,
          text: chatInput,
          messages: [...c.messages, { sender: 'agent' as const, text: chatInput, time: "الآن" }]
        };
      }
      return c;
    });
    setMockChats(updated);
    setChatInput("");
    triggerAlert("تم إرسال الرد بنجاح عبر قناة " + selectedChat.channel, "success");
  };

  const generateAiReply = async () => {
    setIsAiGeneratingReply(true);
    try {
      const response = await fetch("/api/omnichat-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatContent: selectedChat.text,
          customerName: selectedChat.customerName,
          category: selectedChat.category,
          aiMemoryContext: aiMemory
        })
      });
      const data = await response.json();
      if (response.ok && data.response) {
        setChatInput(data.response);
        triggerAlert("تم صياغة رد حي بالذكاء الاصطناعي (Gemini) بنجاح 🚀", "success");
      } else {
        throw new Error(data.error || "Missing API secret key");
      }
    } catch (e: any) {
      console.warn("Falling back to local high-fidelity presets: ", e.message);
      let replyText = "";
      if (selectedChat.category === "استفسار") {
        replyText = `أهلاً بك يا أستاذ ${selectedChat.customerName}، يسعدنا جداً تواصلك معنا بمتجر سهم وشركة "مراسيم الطيب". نعم لدينا بيع بالجملة للعود الملكي الفاخر بأسعار خاصة جداً للكميات الكبيرة بخصومات تصل إلى ٢٥٪ والتوصيل مجاني تماماً لكافة مناطق الرياض عبر فريق شحن سهم التلقائي 📦. هل تحب أن نرسل لك كتالوج أسعار الجملة؟`;
      } else if (selectedChat.category === "شحن") {
        replyText = `أهلاً بكِ أختي الكريمة ${selectedChat.customerName}. نعتذر جداً عن هذا التأخير الخارج عن إرادتنا، لقد بحثنا برقم طلبك #Sahm-9218 وتبين أنه جاهز وتم تسليمه لشركة الأوتوميشن اللوجستية شريك سهم (أرامكس) ومتبقي التوزيع النهائي فقط بجدة غداً صباحاً 🚚 متاح لكِ تتبع مسار الشحنة بالكامل الآن. شكراً لرحابة صدرك وسنتابع معك لحظة بلحظة!`;
      } else if (selectedChat.category === "طلب") {
        replyText = `أهلاً ومرحباً بك يا أستاذ ${selectedChat.customerName}، يسعدنا تلبية طلبك الفاخر. نوفر خدمة التغليف الملكي الفاخر المخصص للمناسبات والعروس مع بطاقة إهداء مخصصة ومصممة بالذكاء الاصطناعي وبخور مجاني للعلبة الملكية كهدية منا 🎁. تم تثبيت الملاحظة وقام الذكاء الاصطناعي بتعديل طلبك لتضمين باقة "التهنئة الذهبية".`;
      } else if (selectedChat.category === "شكوى") {
        replyText = `أهلاً بك يا غالي.. نأسف جداً بخصوص هذه المشكلة التقنية بكود الخصم المروج. الكود SAHM20 تم تعويضه فوراً بكود جديد نشط وحصري لك وهو (SAHM25) يعطيك خصم ٢٥٪ بدلاً من ٢٠٪ ممتد المفعول لـ ١٠ أيام تقدديراً لتجاوبك معنا ⚡ نرجو تجربته وتأكيد زوال الإشكالية.`;
      } else {
        replyText = `أهلاً ومرحباً بكِ في سهم يا فندم. نتفهم ظرفكم تماماً، وقمنا بعمل إلغاء فوري للطلب بكل رحابة صدر ومصداقية. تم تفويض عملية استرداد المبلغ بقيمة طلبك لحساب الفيزا المرتبط وستصلك رسالة مصرفية لتأكيد استرجاع كامل المبالغ بدون غرامات خلال ٢٤ ساعة عمل 💳. نأمل تفرغكم للشراء مجدداً قريباً بمراسيم الطيب.`;
      }
      setChatInput(replyText);
      triggerAlert("أنتج سهم رداً ملكياً فاخراً عبر الذكاء الاصطناعي مسبق التثبيت", "success");
    } finally {
      setIsAiGeneratingReply(false);
    }
  };

  const handleUpdateCategory = (cat: 'شكوى' | 'طلب' | 'استفسار' | 'شحن' | 'استرجاع') => {
    const updated = mockChats.map(c => c.id === selectedChat.id ? { ...c, category: cat } : c);
    setMockChats(updated);
    triggerAlert(`تم إعادة تصنيف المحادثة تصنيفاً ذكياً إلى: ${cat}`, "info");
  };

  const handleUpdateSentiment = (sent: 'إيجابي' | 'محايد' | 'سلبي') => {
    const updated = mockChats.map(c => c.id === selectedChat.id ? { ...c, sentiment: sent } : c);
    setMockChats(updated);
    triggerAlert(`تم تعديل مؤشر الانطباع بنجاح: ${sent}`, "info");
  };


  // --- AI Executive Assistant State ---
  const [assistantMessages, setAssistantMessages] = useState<{ sender: 'user' | 'assistant'; text: string; elements?: React.ReactNode }[]>([
    { sender: 'assistant', text: "أهلاً بك يا صاحب القرار! أنا وكيلك التنفيذي الذكي سهم AI 🤖. يمكنني سحب وتحليل كافة بيانات مبيعاتك وأرباحك ومخزونك واقتراح حملات تسويقية وخطط تحسين بالأرقام الفورية للخليج. تفضل باختيار أحد التحليلات الرائدة بالأسفل:" }
  ]);
  const [isAssistantTyping, setIsAssistantTyping] = useState<boolean>(false);
  const [customAssistantText, setCustomAssistantText] = useState<string>("");

  const runAssistantCommand = async (command: string, label: string) => {
    setAssistantMessages(prev => [...prev, { sender: 'user', text: label }]);
    setIsAssistantTyping(true);

    try {
      let responseText = "";
      let customElements: React.ReactNode = null;

      // Handle preset offline-first actions
      if (command === "best_product") {
        const best = [...products].sort((a, b) => (b.price - b.cost) - (a.price - a.cost))[0] || products[0];
        responseText = `بناءً على مطابقة التكلفة مع سعر البيع بالذكاء الاصطناعي المالي، فإن المنتج ذو هامش الربحية والصدارة الأكبر لديك هو: "${best.name}".`;
        customElements = (
          <div className="mt-4 p-4 rounded-xl border space-y-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-emerald-400">🏆 الأكثر ربحية بالمتجر</span>
              <span className="font-mono text-[10px]" style={{ color: theme.muted }}>معامل الربحية: %{Math.round(((best.price - best.cost) / best.price) * 100)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-right">
              <div className="p-2.5 rounded bg-gray-500/5">
                <span className="block text-[10px]" style={{ color: theme.muted }}>سعر المبيع</span>
                <span className="font-bold text-gray-200" style={{ color: theme.text }}>{best.price} ر.س</span>
              </div>
              <div className="p-2.5 rounded bg-gray-500/5">
                <span className="block text-[10px]" style={{ color: theme.muted }}>تكلفة التوريد</span>
                <span className="font-bold text-gray-200" style={{ color: theme.text }}>{best.cost} ر.س</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => {
                  triggerAlert("تم مضاعفة ميزانية عرض السلعة وتوليد حملة فورية بالذكاء الاصطناعي", "success");
                }}
                className="py-1 px-3 rounded text-[10px] font-bold text-black cursor-pointer active:scale-95" 
                style={{ backgroundColor: theme.accent }}
              >
                تنشيط حملة ترويجية للمنتج 🚀
              </button>
            </div>
          </div>
        );
        setAssistantMessages(prev => [...prev, { sender: 'assistant', text: responseText, elements: customElements }]);
      } else if (command === "sales_decline") {
        responseText = `تشير التقارير اللحظية أن مبيعات فواتيرك الصادرة تبلغ ${invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0)} ر.س. هناك انخفاض بنسبة ٤.٥٪ مقارنة بالأيام الـ ٧ السابقة لسببين رئيسيين: ⚠️ قلّة الحملات التسويقية النشطة على شبكة سناب شات، و نفاد بعض الأصناف الغذائية المكملة مثل تمر مجدول سكري (الكمية الحالية المتوفرة: ١٢ علبة فقط).`;
        customElements = (
          <div className="mt-4 p-4 rounded-xl border space-y-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <span className="text-[11px] font-black border-r-2 border-[#D4AF37] pr-2 text-[#D4AF37]">خطة التعافي المقترحة فورا بالمنظومة:</span>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>إمداد فوري لمنتج (تمر مجدول سكري) لرفع المبيعات التشاركية.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>إعادة إطلاق حملة سناب شات الترويجية بالاستهداف الجغرافي بالرياض.</span>
              </li>
            </ul>
            <div className="flex gap-2 justify-end pt-1">
              <button 
                onClick={() => {
                  const updatedProducts = products.map(p => p.id === "3" ? { ...p, stock: 120 } : p);
                  setProducts(updatedProducts);
                  triggerAlert("تم ربط طلب توريد مؤتمت مع المورد الذهبي ورفع مستودع التمر لـ ١٢٠ علبة!", "success");
                }}
                className="py-1 px-3 rounded text-[10px] font-bold text-black cursor-pointer active:scale-95"
                style={{ backgroundColor: theme.accent }}
              >
                تنفيذ إعادة التعبئة الفورية 📦
              </button>
            </div>
          </div>
        );
        setAssistantMessages(prev => [...prev, { sender: 'assistant', text: responseText, elements: customElements }]);
      } else if (command === "campaign_oud") {
        responseText = `تم إنشاء وتنسيق سيناريو حملة استباقية متكاملة لمنتج "العود الملكي الفاخر" بميزانية افتراضية ٥٠٠ ريال لدول الخليج وحالة استهداف دقيقة:`;
        customElements = (
          <div className="mt-4 p-4 rounded-xl border space-y-3.5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="space-y-2 text-xs">
              <p>🎯 <strong style={{ color: theme.accent }}>العنوان الإعلاني:</strong> "تاج المراسيم بطلة العود الملكي المذهب"</p>
              <p>📱 <strong style={{ color: theme.accent }}>الجمهور المستهدف:</strong> عشاق الطيب الملكي ومخططي حفلات الزفاف بالرياض، جدة، الدمام، دبي والمنامة.</p>
              <p>💬 <strong style={{ color: theme.accent }}>محتوى سناب وإكس:</strong> "اجعل حضورك هيبة تدوم عبقاً مع عود المراسيم الأصيل. خصم خاص وحصري ٢٥٪ وعلبة بخور فاخرة هدية مجانية 🎁 لفترة محدودة بالأوتوميت"</p>
            </div>
            <div className="flex gap-2 justify-end border-t pt-2.5" style={{ borderColor: theme.border }}>
              <button 
                onClick={() => {
                  triggerAlert("تم تصدير الإعلان الذكي لمدير الحملات بسلة بنجاح!", "success");
                }}
                className="py-1 px-3 rounded text-[10px] font-bold text-black cursor-pointer active:scale-95"
                style={{ backgroundColor: theme.accent }}
              >
                تحديث وتصدير لـ Snapchat Ads ✅
              </button>
            </div>
          </div>
        );
        setAssistantMessages(prev => [...prev, { sender: 'assistant', text: responseText, elements: customElements }]);
      } else if (command === "profit_analysis") {
        const totalSales = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0);
        const totalCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
        responseText = `منظومة سهم تفخر بعرض الربحية المحاصرة حالياً حياً على مستوى المتجر ومطابقتها المباشرة بالهياكل الـ SaaS لضمان الكفاءة:`;
        customElements = (
          <div className="mt-4 p-4 rounded-xl border space-y-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="p-2 rounded bg-gray-500/5">
                <span className="block text-[10px]" style={{ color: theme.muted }}>إجمالي المبيعات</span>
                <span className="font-bold text-emerald-400 font-mono text-center">{totalSales} ر.س</span>
              </div>
              <div className="p-2 rounded bg-gray-500/5">
                <span className="block text-[10px]" style={{ color: theme.muted }}>قيمة المخزون الحالي</span>
                <span className="font-bold text-sky-400 font-mono text-center">{totalCost} ر.س</span>
              </div>
              <div className="p-2 rounded bg-gray-500/5">
                <span className="block text-[10px]" style={{ color: theme.muted }}>هامش الربح المتوقع</span>
                <span className="font-bold text-amber-400 font-mono text-center">%48</span>
              </div>
            </div>
          </div>
        );
        setAssistantMessages(prev => [...prev, { sender: 'assistant', text: responseText, elements: customElements }]);
      } else {
        // Dynamic Full-Stack API calling with financial metrics parameters
        const totalSales = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0);
        const stockCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
        const calculatedMetrics = {
          assets: 300000 + totalSales + stockCost,
          liabilities: 34000,
          equity: 300000 + totalSales + stockCost - 34000,
          revenues: totalSales,
          cogs: totalSales * 0.42,
          expenses: 12400,
          netProfit: totalSales - (totalSales * 0.42) - 12400,
          cash: 145000 + totalSales,
          zakat: (145000 + totalSales + stockCost) * 0.025,
          ap: 14000,
          ar: totalSales * 0.15
        };

        const response = await fetch("/api/accounting-analyst", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: calculatedMetrics,
            query: command
          })
        });
        const data = await response.json();
        if (response.ok && data.response) {
          responseText = `🔮 [استشارة ماليّة حيّة من سهم AI-Gemini]: \n ${data.response}`;
        } else {
          throw new Error("Missing parameters or server API offline");
        }
        setAssistantMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
        triggerAlert("تم معالجة استشارتك حياً بالذكاء الاصطناعي 🧠", "success");
      }
    } catch (e: any) {
      console.warn("Falling back to simulated dynamic executive advisor response: ", e.message);
      const responseText = `تم تحليل العيوب والمؤشرات الحية لمتجرك بالذكاء الخاص في سناء سهم (مراسيم الطيب). بناء على سؤالك المطروح: "${command}"، يوصيكم عقل سهم برين بزيادة الاستهداف في مدينة الرياض ومتابعة بؤر الطلب على البخور الذكي وعود الخصم الفعال لرفع المبيعات وتحقيق هامش استقرار.`;
      setAssistantMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
      triggerAlert("أنتج المعالج الذاتي رداً ماليًا تشخيصيًا دقيقًا", "info");
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const handleCustomAssistantSend = () => {
    if (!customAssistantText.trim()) return;
    const txt = customAssistantText;
    setCustomAssistantText("");
    runAssistantCommand(txt, txt);
  };


  // --- Workflow Automation Builder State ---
  const [automationRules, setAutomationRules] = useState<WorkflowRule[]>([
    { id: "rule-1", trigger: "إذا انخفض المخزون عن 20 قطع", action: "أرسل إشعار واتساب تلقائي للمالك وتنبيه المورد", enabled: true, count: 4 },
    { id: "rule-2", trigger: "إذا تم إنشاء منتج جديد بالمتجر", action: "توليد أوصاف وإعلانات السناب التلقائية بواسطة AI", enabled: true, count: 12 },
    { id: "rule-3", trigger: "إذا وصل عميل تسجيلي جديد بالـ CRM", action: "إرسال قسيمة ترحيبية فورية خصم %15 بالبريد", enabled: false, count: 0 },
    { id: "rule-4", trigger: "إذا تجاوزت قيمة الفاتورة الصادرة 1000 ر.س", action: "منحه فوريا تصنيف التميز الذهبي وبخور هدية", enabled: true, count: 8 }
  ]);

  const [newTrigger, setNewTrigger] = useState<string>("إذا انخفض المخزون عن 20 قطع");
  const [newAction, setNewAction] = useState<string>("أرسل إشعار واتساب تلقائي للمالك وتنبيه المورد");
  const [automationLogs, setAutomationLogs] = useState([
    { id: "log-1", rule: "إذا انخفض المخزون", text: "تم رصد تمر مجدول سكري بـ ١٢ حبة، إشعار WhatsApp مرسل لـ سليمان العتيبي المورد الذهبي", time: "قبل ساعة" },
    { id: "log-2", rule: "إذا تم إنشاء منتج جديد", text: "تم رصد توليد إعلان تيك توك تلقائي لـ قهوة عربية بمراسيم الطيب", time: "قبل ٣ ساعات" },
    { id: "log-3", rule: "قسيمة الفاتورة الذهبية", text: "فاتورة INV-002 بقيمة ١٢٠٠ ر.س نالت ترقية التميز الذهبي تلقائياً", time: "أمس" }
  ]);

  const handleAddAutomationRule = () => {
    const newRule: WorkflowRule = {
      id: "rule-" + Date.now(),
      trigger: newTrigger,
      action: newAction,
      enabled: true,
      count: 0
    };
    setAutomationRules([newRule, ...automationRules]);
    setAutomationLogs([
      { id: "log-" + Date.now(), rule: newTrigger, text: `تم تفعيل وتأسيس قاعدة الأتمتة المبرمجة: "${newAction}"`, time: "الآن" },
      ...automationLogs
    ]);
    triggerAlert("تم تصميم وتنشيط قاعدة الأتمتة الإجرائية بنجاح ⚡", "success");
  };

  const handleToggleRule = (id: string) => {
    setAutomationRules(automationRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    triggerAlert("تم تغيير حالة تفعيل مسار الأتمتة المحدد", "info");
  };

  const handleDeleteRule = (id: string) => {
    setAutomationRules(automationRules.filter(r => r.id !== id));
    triggerAlert("تم حذف مسار الأتمتة الذكي", "warning");
  };


  // --- Customer 360 State ---
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("1");
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>({
    "1": "عميل متميز يفضل عطور دهن العود والقهوة الشقراء الملكية، يشتري بشكل متكرر بالرياض.",
    "2": "شركة كبرى، تفضل التوزيعات المغلفة بمناسبات الأعياد والموظفين. لديهم تسهيلات بالدفع.",
    "3": "عميل جديد مهتم جداً بمنتجات كود الخصم والمتابعة وتحديث مستوى الشحنات لجدة."
  });
  const [tempNoteText, setTempNoteText] = useState<string>("");

  useEffect(() => {
    // Sync note draft on selection change
    setTempNoteText(customerNotes[selectedCustomerId] || "");
  }, [selectedCustomerId]);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleSaveCustomerNote = () => {
    setCustomerNotes({
      ...customerNotes,
      [selectedCustomerId]: tempNoteText
    });
    triggerAlert(`تم حفظ الملاحظات السرية والسجل الداخلي للعميل: ${activeCustomer.name}`, "success");
  };

  // Calculates customer spending parameters
  const getCustomerTotalPaid = (custName: string) => {
    return invoices
      .filter(i => i.customer === custName && i.type === 'sale')
      .reduce((sum, i) => sum + i.total, 0);
  };

  const getCustomerOrdersCount = (custName: string) => {
    return invoices
      .filter(i => i.customer === custName && i.type === 'sale').length;
  };


  // --- Marketplace State ---
  const [marketplaceAddons, setMarketplaceAddons] = useState([
    { id: "salla-sync", title: "تكامل منصة سلة الذكي", desc: "ربط فوري ومزامنة حية لكل من المنتجات، الفواتير، المخزون والعملاء مع سلة حياً وعملاقا.", active: true, cost: "مجاناً بالدخول" },
    { id: "zid-sync", title: "تكامل منصة زد (JWT API)", desc: "سحب وتتبع مسار الطلبات وأوكال الشحن وإصدار كشوفات الزكاة والضريبة المعتمدة فورياً.", active: true, cost: "مجاناً بالدخول" },
    { id: "sms-gateway", title: "بوابة رسائل WhatsApp وسهام SMS", desc: "أتمتة إرسال رسائل الفواتير الجاهزة ورموز التحقق والعروض للعملاء عبر خط أعمالك التشاركي.", active: false, cost: "٩٩ ر.س / شهرياً" },
    { id: "aramex-ai", title: "بوابة الشحن أرامكس & سمسا AI Tracker", desc: "توليد بوليصات الشحن الآلية الذكية وتتبع المسارات بالذكاء الاصطناعي وإرسال تحديثات العبور.", active: false, cost: "مجاناً للشركاء" },
    { id: "google-ads", title: "قائد إعلانات جوجل الذكي AI Ads Pilot", desc: "توليد وإيقاف وضبط ميزانيات الحملات التسويقية على قنوات بحث وتصفح Google تلقائياً للـ ROAS.", active: false, cost: "١٤٩ ر.س / شهرياً" },
    { id: "madapay", title: "بوابة دفع سهم الذكية (مدى، فيزا، آبل باي)", desc: "خصومات مالية وتسويات لحظية لحساب متجرك مع إصدار القيود المحاسبية التلقائية بدون تداخل.", active: true, cost: "مجاناً بالكامل" }
  ]);

  const handleToggleAddon = (id: string) => {
    setMarketplaceAddons(marketplaceAddons.map(a => {
      if (a.id === id) {
        const nextState = !a.active;
        triggerAlert(nextState ? `تم تفعيل وتكوين إضافة: ${a.title}` : `تم إيقاف إضافة: ${a.title}`, nextState ? "success" : "warning");
        return { ...a, active: nextState };
      }
      return a;
    }));
  };

  // --- Global Floating Quick Actions ---
  const [showQuickLauncher, setShowQuickLauncher] = useState<boolean>(false);
  const [launcherModalType, setLauncherModalType] = useState<'invoice' | 'product' | 'customer' | null>(null);

  // States for Quick Creation forms
  const [quickInvCustomer, setQuickInvCustomer] = useState<string>("");
  const [quickInvTotal, setQuickInvTotal] = useState<string>("");
  const [quickProdName, setQuickProdName] = useState<string>("");
  const [quickProdPrice, setQuickProdPrice] = useState<string>("");
  const [quickCustName, setQuickCustName] = useState<string>("");
  const [quickCustPhone, setQuickCustPhone] = useState<string>("");

  const handleCreateQuickInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInvCustomer.trim() || !quickInvTotal.trim()) return;
    const priceVal = parseFloat(quickInvTotal) || 0;

    const newInv: Invoice = {
      id: "INV-" + (invoices.length + 101),
      type: 'sale',
      customer: quickInvCustomer,
      date: new Date().toISOString().split('T')[0],
      total: priceVal,
      status: 'مدفوع',
      items: [{ name: "طلب سريع عبر مركز سهم القيادي", qty: 1, price: priceVal, total: priceVal }]
    };

    setInvoices([newInv, ...invoices]);
    setLauncherModalType(null);
    setQuickInvCustomer("");
    setQuickInvTotal("");
    triggerAlert(`تم إصدار فاتورة بيع سريعة بقيمة ${priceVal} ر.س ومزامنتها حياً!`, "success");
  };

  const handleCreateQuickProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProdName.trim() || !quickProdPrice.trim()) return;
    const priceVal = parseFloat(quickProdPrice) || 0;

    const newProd: Product = {
      id: String(products.length + 1),
      name: quickProdName,
      sku: "PROD-" + (1000 + products.length),
      price: priceVal,
      cost: priceVal * 0.45,
      stock: 100,
      category: "منتجات رئيسية"
    };

    setProducts([newProd, ...products]);
    setLauncherModalType(null);
    setQuickProdName("");
    setQuickProdPrice("");
    triggerAlert(`تم إدخال وتمرير السلعة "${quickProdName}" للمستودع حياً!`, "success");
  };

  const handleCreateQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustName.trim()) return;

    const newCust: Customer = {
      id: String(customers.length + 1),
      name: quickCustName,
      phone: quickCustPhone || "0500000000",
      city: "الرياض",
      balance: 0
    };

    setCustomers([newCust, ...customers]);
    setLauncherModalType(null);
    setQuickCustName("");
    setQuickCustPhone("");
    triggerAlert(`تم إضافت العميل الأخير ${quickCustName} لجدول أعمال CRM سهم!`, "success");
  };


  // Helpers for calculations
  const totalSales = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.total, 0);
  const totalPurchases = invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.total, 0);
  const calculatedProfit = totalSales - totalPurchases;
  const lowStockCount = products.filter(p => p.stock < 50).length;

  return (
    <div className="relative space-y-6">

      {/* Persistent Beautiful Alerts Header Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3.5 rounded-xl text-center text-xs font-black shadow-lg flex items-center justify-center gap-2.5 z-50 border`}
            style={{
              backgroundColor: alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: alertMsg.type === 'success' ? '#10B911' : '#EF4444',
              color: alertMsg.type === 'success' ? '#10B981' : '#EF4444'
            }}
          >
            {alertMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 animate-bounce" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            )}
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Cabin Card (ExecutiveHeroCard) displayed only on لوحة القيادة التنفيذية */}
      <AnimatePresence>
        {activeSubTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <ExecutiveHeroCard 
              themeColors={theme}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              stores={allowedStores}
              activeStoreId={activeStoreId}
              setActiveStoreId={setActiveStoreId}
              branches={branches}
              activeBranchId={activeBranchId}
              setActiveBranchId={setActiveBranchId}
              warehouses={warehouses}
              activeWarehouseId={activeWarehouseId}
              setActiveWarehouseId={setActiveWarehouseId}
              user={user}
              triggerNotification={triggerNotification || ((m, t) => triggerAlert(m, t === "success" ? "success" : "warning"))}
              setActiveTab={setActiveTab}
              displayMode={cabinDisplayMode}
              rawCompanies={rawCompanies}
              impersonatedTenantId={impersonatedTenantId}
              onImpersonate={onImpersonate}
              onStopImpersonating={onStopImpersonating}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧠 SMART COMMAND CENTER - PRIMARY NAVIGATION ROW */}
      <div 
        id="sahm_command_header_container"
        className="relative z-10"
      >
        {/* Center Sub-Navigation Tabs / Header bar */}
        <div 
          className="flex flex-col gap-5 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden"
          style={{ 
            backgroundColor: theme.card, 
            borderColor: theme.border,
          }}
        >
          {/* Header row with Title and Connection Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <h2 className="text-sm font-black flex items-center gap-2" style={{ color: theme.text }}>
                  مركز القيادة الذكي
                  <span className="text-[9px] py-0.5 px-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">نظام التحكم الموحد</span>
                </h2>
                <p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>المنصة الذكية الموحدة لإدارة التحليلات والتوصيات وأوامر التشغيل والأتمتة</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-900/40 px-2.5 py-1.5 rounded-lg border border-zinc-800/40 self-start sm:self-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>الذكاء الاصطناعي متصل وجاهز</span>
            </div>
          </div>

          {/* Elegant Horizontal Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

          {/* Interactive Equal-Sized Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2 w-full font-sans">
            {subTabsList.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab && setActiveSubTab(tab.id)}
                  className={`group relative flex flex-col items-center justify-center h-16 p-1.5 rounded-xl border text-[10px] font-black transition-all duration-300 cursor-pointer active:scale-95 overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 border-none shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-[#0a0d18]/70 hover:bg-[#121626]/90 text-zinc-400 hover:text-zinc-100 hover:-translate-y-0.5'
                  }`}
                  style={{
                    borderColor: isActive ? 'transparent' : `${theme.border}80`,
                  }}
                >
                  {/* Glassmorphic inner hover glow for inactive */}
                  {!isActive && (
                    <span className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  <IconComponent 
                    className={`w-4.5 h-4.5 mb-1.5 transition-all duration-300 ${
                      isActive 
                        ? 'text-zinc-950 scale-110' 
                        : `${tab.color} group-hover:scale-110 group-hover:filter group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]`
                    }`} 
                  />
                  <span className="text-[10px] tracking-wide text-center leading-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>



      {/* TAB CONTENT 1: Unified Dashboard & Dynamic Builder */}
      {activeSubTab === 'overview' && (
        <Dashboard 
          invoices={invoices} 
          products={products} 
          customers={customers} 
          user={user} 
          theme={theme} 
          currentBranchId={activeBranchId}
          branches={branches}
          setActiveSubTab={setActiveSubTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* TAB CONTENT: Sales and Inventory Forecasts (🔮) */}
      {activeSubTab === 'forecasts' && (
        <div className="space-y-6 text-right font-sans animate-fade-in" dir="rtl">
          <div className="p-6 rounded-2xl border text-right flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(129,140,248,0.08)]" 
               style={{ 
                 background: `radial-gradient(circle at top right, rgba(99, 102, 241, 0.06) 0%, ${theme.surface} 100%)`, 
                 borderColor: theme.border 
               }}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-5 relative z-10 w-full">
              {/* Double-ring compliance gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0 bg-black/45 rounded-2xl border border-zinc-800/60 p-2 shadow-inner">
                <div className="absolute inset-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#818CF8" 
                      strokeWidth="2.5" 
                      strokeDasharray="100" 
                      strokeDashoffset="5.2" 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                </div>
                <div className="absolute inset-1.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="2" 
                      strokeDasharray="100" 
                      strokeDashoffset="12" 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                </div>
                <div className="text-center z-10">
                  <span className="block text-[11px] font-black text-white font-mono leading-none">94.8%</span>
                  <span className="block text-[7.5px] text-indigo-400 mt-0.5 leading-none">دقة النموذج</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm md:text-base font-black text-white flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
                  توقعات المبيعات والمخزون الذكية (Predictive Analytics)
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  باستخدام خوارزميات الذكاء الاصطناعي من سهم، نقوم بمحاكاة سلوك المشتريات ومعدل حرق المخازن لتوفير رؤى مستقبلية للأيام الثلاثين القادمة.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Forecast Model status */}
            <div className="p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                 style={{ 
                   background: `radial-gradient(circle at bottom left, rgba(129, 140, 248, 0.02) 0%, ${theme.surface} 100%)`, 
                   borderColor: theme.border 
                 }}>
              <div>
                <span className="text-[10px] font-black bg-indigo-500/15 text-indigo-400 rounded px-2.5 py-1 inline-block font-sans mb-3 text-right">
                  🧠 حالة نموذج ديسكفري الاستباقي
                </span>
                <h4 className="text-xs font-black text-white mb-2">تقدير الطلب الكلي للشهر الحالي</h4>
                <p className="text-[10.5px] leading-relaxed text-zinc-400">
                  يتوقع نموذج التعلم المقارن زيادة في الطلبيات بنسبة <strong className="text-emerald-400 font-mono font-black">+14.2%</strong> خلال منتصف الأسبوع مدفوعة بالحملات التسويقية المجدولة.
                </p>
              </div>

              <div className="mt-5 space-y-2 border-t border-zinc-800/60 pt-4">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">دقة التنبؤ المالي:</span>
                  <span className="text-emerald-400 font-bold font-mono">94.8%</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">العينات المحللة:</span>
                  <span className="text-zinc-300 font-mono">{invoices.length} فاتورة</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">الفروع المغطاة بالتوقع:</span>
                  <span className="text-zinc-300">كافة الفروع النشطة</span>
                </div>
              </div>
            </div>

            {/* Sales Prediction Chart Area */}
            <div className="lg:col-span-2 p-5 rounded-2xl border transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                 style={{ 
                   background: `radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.02) 0%, ${theme.surface} 100%)`, 
                   borderColor: theme.border 
                 }}>
              <h4 className="text-xs font-black text-white mb-2">📈 منحنى المبيعات المتوقع للأيام الـ 5 القادمة (رؤية يومية)</h4>
              
              {/* Premium Area Chart Wave */}
              <div className="h-16 w-full opacity-90 my-3.5 relative overflow-hidden bg-zinc-950/40 rounded-xl border border-zinc-800/30 p-2 shadow-inner">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <path 
                    d="M0,25 C15,18 20,5 40,20 C60,10 70,5 80,18 L100,5 L100,30 L0,30 Z" 
                    fill="url(#forecastAreaGrad)"
                  />
                  {/* Curve stroke */}
                  <path 
                    d="M0,25 C15,18 20,5 40,20 C60,10 70,5 80,18 L100,5" 
                    fill="none" 
                    stroke="#818CF8" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  {/* Pulse dots */}
                  <circle cx="40" cy="20" r="1.5" fill="#10B981" className="animate-pulse" />
                  <circle cx="40" cy="20" r="1" fill="#10B981" />
                  <circle cx="100" cy="5" r="1" fill="#818CF8" />
                </svg>
              </div>

              <div className="grid grid-cols-5 gap-2.5 pt-1">
                {[
                  { day: "غداً (السبت)", amount: "12,450 ر.س", percentage: "+5.1%", status: "up" },
                  { day: "الأحد", amount: "14,800 ر.س", percentage: "+18.4%", status: "up" },
                  { day: "الإثنين", amount: "11,200 ر.س", percentage: "-1.5%", status: "down" },
                  { day: "الثلاثاء", amount: "13,900 ر.س", percentage: "+12.1%", status: "up" },
                  { day: "الأربعاء", amount: "16,500 ر.س", percentage: "+24.8%", status: "up" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/25 border border-zinc-800/60 text-center flex flex-col justify-between transition-all duration-300 hover:border-zinc-700/60">
                    <span className="text-[9.5px] font-bold text-gray-400 block">{item.day}</span>
                    <span className="text-xs font-black text-white block mt-2 font-mono">{item.amount}</span>
                    <span className={`text-[9px] font-extrabold mt-1 inline-block ${item.status === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.percentage} {item.status === 'up' ? '▲' : '▼'}
                    </span>
                    {/* Micro Sparkline */}
                    <div className="h-4 w-full mt-2 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                        {item.status === 'up' ? (
                          <path d="M0,20 Q25,5 50,15 T100,5" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                        ) : (
                          <path d="M0,5 Q25,20 50,10 T100,22" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                        )}
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Inventory burn rate / Out-of-Stock Risk Forecast */}
          <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 mb-2">
              🚨 إنذار مبكر: توقعات نفاد السلع والمستودعات
            </h3>
            <p className="text-[10.5px] text-zinc-400 mb-4">
              نظم تخطيط المتطلبات (MRP) تقدر تاريخ نفاد المنتجات التالية بناءً على معدل الصرف والمبيعات والكميات المتوفرة.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter(p => (p.stock || 0) <= 25).slice(0, 6).map((p, pIdx) => {
                const stockVal = p.stock || 0;
                const daysLeft = Math.max(1, Math.round(stockVal / 1.5));
                return (
                  <div key={pIdx} className="p-4 rounded-xl bg-red-950/10 border border-red-500/20 text-right flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-black text-white truncate max-w-[170px]" title={p.name}>{p.name}</h4>
                        <span className="text-[8.5px] font-mono text-zinc-500">الباركود: {p.barcode || p.sku || "N/A"}</span>
                      </div>
                      <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">
                        نفاد وشيك ⚠️
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">الرصيد المتبقي:</span>
                        <strong className="text-xs font-mono text-white">{stockVal} قطعة</strong>
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] text-zinc-500 block">النفاد المتوقع بعد:</span>
                        <strong className="text-xs font-black text-red-400 font-mono">{daysLeft} أيام</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
              {products.filter(p => (p.stock || 0) <= 25).length === 0 && (
                <div className="col-span-full p-8 text-center text-gray-400 text-xs">
                  🟢 كافة السلع المتوفرة لديها مستويات إمداد آمنة وتغطي الـ 30 يوماً القادمة بشكل كامل.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Daily Performance Summary (📋) */}
      {activeSubTab === 'performance' && (
        <div className="space-y-6 text-right font-sans">
          <div className="p-5 rounded-2xl border text-right" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              ملخص الأداء اليومي والتقارير التنفيذية (Executive Report)
            </h3>
            <p className="text-xs text-gray-400">
              ملخص إحصائي فوري لأهم العمليات المبيعات النشطة والتحليلات النقدية عبر الفروع وقنوات المتجر المختلفة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            {[
              { id: "1", title: "معدل تحويل الزوار الإلكترونيين", desc: "نسبة الطلبات للزيارات بالمتجر", value: "3.84%", change: "+0.45% منذ أمس", status: "up" },
              { id: "2", title: "كفاءة تحصيل المدفوعات", desc: "مطابقة فواتير نقاط البيع الفورية", value: "99.98%", change: "تطابق كامل ومصادق", status: "up" },
              { id: "3", title: "سرعة شحن وتوصيل الطلبات", desc: "متوسط المعالجة بالمستودعات", value: "48 دقيقة", change: "-12 دقيقة تقليص زمني", status: "up" }
            ].map(col => (
              <div key={col.id} className="p-4 rounded-xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <span className="text-[9.5px] font-bold text-gray-400 block">{col.title}</span>
                <h4 className="text-lg font-black text-white mt-1.5 font-mono">{col.value}</h4>
                <p className="text-[10px] text-emerald-400 mt-2 font-bold">{col.change}</p>
                <span className="text-[8.5px] text-zinc-500 mt-0.5 block">{col.desc}</span>
              </div>
            ))}
          </div>

          {/* Daily Sales Channel Performance breakdown */}
          <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-xs font-black text-white border-b pb-3.5 mb-4" style={{ borderColor: theme.border }}>
              🏢 مساهمة القنوات والفروع النشطة في سلة الأداء اليومي
            </h3>

            <div className="space-y-3.5">
              {[
                { name: "فرع الرياض الرئيسي VIP (سليمانية)", share: "45%", count: `${invoices.length} صفقة`, label: "الأعلى مبيعاً واستباقية" },
                { name: "متجر الويب وتجارة الـ WooCommerce", share: "30%", count: "65 طلب إلكتروني", label: "مستويات إقبال عالية" },
                { name: "فرع جدة (الحمراء)", share: "15%", count: "12 طلب ميداني", label: "نمو معتدل" },
                { name: "مستودع التوزيع والنقل اللوجستي", share: "10%", count: "مستودع إسناد", label: "كفاءة تسليم ممتازة" }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/15 border border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{item.name}</span>
                    <span className="text-[9.5px] text-gray-500 block mt-0.5">{item.label}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-xs font-black text-amber-500 block">{item.share} من الإيرادات</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Analytics & Sahm Brain 360 */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <SahmBrain360
            theme={theme}
            products={products}
            setProducts={setProducts}
            invoices={invoices}
            setInvoices={setInvoices}
            customers={customers}
            setCustomers={setCustomers}
            activeCity="الرياض"
            totalRevenue={totalSales}
            selectedCustomerName="سليمان العتيبي"
            aiMemory={aiMemory}
            setAiMemory={setAiMemory}
            onAddLog={(action, details) => addAuditLog?.(action, details)}
            triggerNotification={(title, text, type) => triggerNotification?.(`[${title}] ${text}`, type)}
          />
          
          {/* Customer Behavioral Intelligence 360 */}
          <div className="pt-6 border-t border-slate-800/40">
            <CustomerTimeline360
              theme={theme}
              customers={customers}
              invoices={invoices}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              onAddLog={(action, details) => addAuditLog?.(action, details)}
              triggerNotification={(title, text, type) => triggerNotification?.(text, type)}
            />
          </div>
        </div>
      )}

      {false && activeSubTab === 'omnichat' && (
        <div className="space-y-4 animate-slide-in">
          
          {/* Omnichannel Telemetry Connection Badges */}
          <div className="p-3.5 rounded-2xl border text-right space-y-2" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <span className="block text-[10px] font-black text-amber-500">• قنوات الربط المباشرة الفعّالة لبريد سهم الموحد (Omnichannel Channels Status)</span>
            <div className="flex flex-wrap gap-2.5 justify-end">
              {[
                { name: "واتساب المتجر 💬", status: "متصل", col: "text-emerald-500", bg: "bg-emerald-500/10" },
                { name: "سناب شات DM 👻", status: "نشط تلقائياً", col: "text-yellow-500", bg: "bg-yellow-500/10" },
                { name: "إنستغرام شات 📸", status: "مربوط بالـ API", col: "text-pink-500", bg: "bg-pink-500/10" },
                { name: "تليغرام سهم ✈️", status: "متصل عبر وكيل سهم", col: "text-sky-400", bg: "bg-sky-400/10" },
                { name: "ربط سلة وزد 🏬", status: "مزامنة دورية", col: "text-purple-400", bg: "bg-purple-500/10" },
                { name: "الرسائل النصية SMS 📱", status: "مفعل ومزدوج", col: "text-gray-300", bg: "bg-gray-500/10" }
              ].map((chan, chIdx) => (
                <div key={chIdx} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1.5 border border-slate-800 ${chan.bg} ${chan.col}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{chan.name}</span>
                  <span className="opacity-70">({chan.status})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
            
            {/* Left panel: Channels Chat Catalog */}
            <div className="lg:col-span-4 p-4 rounded-2xl border flex flex-col gap-3 h-[520px] overflow-y-auto"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="border-b pb-2.5 mb-1" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black" style={{ color: theme.text }}>صندوق وارد البريد الموحد</h3>
                  <span className="text-[9px] bg-purple-500/15 text-purple-400 py-0.5 px-2 rounded font-bold animate-pulse">مباشر وموحد ⚡</span>
                </div>
                <p className="text-[10px] mt-1" style={{ color: theme.muted }}>فرز وانتقاء تلقائي لتجربة مستخدم ممتازة</p>
              </div>

              <div className="space-y-2">
                {mockChats.map(chat => {
                  const isActive = selectedChat.id === chat.id;
                  
                  // Platforms Color Badges mapping
                  let channelIconBg = "bg-emerald-500/10 text-emerald-500";
                  if (chat.channel === "instagram") channelIconBg = "bg-pink-500/10 text-pink-500";
                  else if (chat.channel === "snapchat") channelIconBg = "bg-yellow-500/10 text-yellow-500";
                  else if (chat.channel === "x") channelIconBg = "bg-gray-500/15 text-gray-300";
                  else if (chat.channel === "telegram") channelIconBg = "bg-sky-500/10 text-sky-400";

                  let catColor = "bg-amber-500/10 text-amber-500";
                  if (chat.category === "شكوى") catColor = "bg-red-500/10 text-red-500";
                  else if (chat.category === "شحن") catColor = "bg-blue-500/10 text-blue-500";
                  else if (chat.category === "استرجاع") catColor = "bg-indigo-500/10 text-indigo-500";

                  let sentimentDot = "bg-emerald-500";
                  if (chat.sentiment === "سلبي") sentimentDot = "bg-red-500";
                  else if (chat.sentiment === "محايد") sentimentDot = "bg-slate-400";

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className="w-full text-right p-3 rounded-xl border flex gap-3 transition-all relative overflow-hidden text-xs font-bold transition-all hover:translate-x-0.5 cursor-pointer block"
                      style={{
                        backgroundColor: isActive ? theme.accent + "15" : theme.surface,
                        borderColor: isActive ? theme.accent : theme.border
                      }}
                    >
                      <div className="flex flex-col items-center justify-between shrink-0 gap-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${channelIconBg}`}>
                          {chat.channel[0].toUpperCase()}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: sentimentDot === "bg-red-500" ? "#EF4444" : "#10B981" }}></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold truncate" style={{ color: theme.text }}>{chat.customerName}</span>
                          <span className="text-[8px] font-normal" style={{ color: theme.muted }}>{chat.time}</span>
                        </div>
                        <p className="text-[10px] mt-1.5 truncate" style={{ color: theme.muted }}>{chat.text}</p>
                        
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${catColor}`}>
                            {chat.category}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold bg-gray-500/10" style={{ color: theme.text }}>
                            قالب {chat.sentiment}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right panel split: Active thread + Integrated Customer 360 Mini-Sidebar */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-4 h-[520px]">
              
              {/* Chat thread Workspace (8 cols in full, 9 cols in grid) */}
              <div className="md:col-span-8 p-5 rounded-2xl border flex flex-col justify-between h-full text-right"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                
                {/* Header chat info */}
                <div className="border-b pb-3.5 flex items-center justify-between gap-2" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-[#000]"
                      style={{ backgroundColor: theme.accent }}>
                      {selectedChat.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold" style={{ color: theme.text }}>محادثة {selectedChat.customerName}</h4>
                      <p className="text-[9px] text-emerald-500 animate-pulse">● العميل نشط ويتحدث الآن</p>
                    </div>
                  </div>

                  {/* Classification controllers */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold" style={{ color: theme.muted }}>التصنيف الذكي:</span>
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black rounded">{selectedChat.category}</span>
                  </div>
                </div>

                {/* Conversational bubble timeline */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 px-1">
                  <div className="bg-sky-500/5 text-center py-1.5 px-3 rounded-xl text-[9px] border border-sky-500/10 mb-2 font-bold" style={{ color: theme.muted }}>
                    🔒 محادثة مشفرة ومصنفة تلقائياً عبر Sahm OmniChat AI (مراسيم الطيب)
                  </div>

                  {selectedChat.messages.map((m, mIdx) => {
                    const isCust = m.sender === 'customer';
                    return (
                      <div key={mIdx} className={`flex ${isCust ? 'justify-start' : 'justify-end'} text-xs font-bold`}>
                        <div className={`p-2.5 max-w-[85%] rounded-xl ${isCust ? 'rounded-tr-none bg-gray-500/5' : 'rounded-tl-none text-white'}`}
                          style={{ 
                            backgroundColor: isCust ? theme.surface : theme.accent, 
                            color: isCust ? theme.text : "#000" 
                          }}>
                          <p className="leading-relaxed whitespace-pre-line text-[10.5px]">{m.text}</p>
                          <span className="block text-left text-[8px] mt-1 opacity-70 font-normal">{m.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Interactive Snippets / Response Templates */}
                <div className="p-2 bg-slate-900/50 rounded-xl space-y-1 my-1 text-right border border-slate-800">
                  <span className="text-[8.5px] text-amber-500 font-black block">• قوالب ردود تسهّيلية سريعة بنقرة واحدة:</span>
                  <div className="flex flex-wrap gap-1 md:justify-end">
                    {[
                      { l: "كوبون تعويض 🎟️", r: "أهلاً بك يا فندم، نعتذر منك وتم إصدار كود خصم خاص لك بقيمة ٢٥٪: SAHM25 ممتد الصلاحية تقدديراً لك." },
                      { l: "تأكيد فوري للشحن 🚚", r: "أهلاً بك يا غالي، شحنتك تم تغليفها تغليفاً ملكياً وتوجيهها للمورد لشحنها مع أرامكس صباح اليوم." },
                      { l: "استرجاع المبلغ 💳", r: "أهلاً بك يا فندم، تم إلغاء طلبك بكل رحابة صدر وإرجاع كامل المبلغ لحساب الفيزا المرتبط، شكراً لك." }
                    ].map((tpl, tIdx) => (
                      <button
                        type="button"
                        key={tIdx}
                        onClick={() => setChatInput(tpl.r)}
                        className="text-[9px] px-2 py-1 rounded bg-slate-950 hover:bg-amber-500 hover:text-black cursor-pointer text-gray-400 font-bold border border-slate-800"
                      >
                        {tpl.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat bottom controls with AI Auto Reply */}
                <div className="border-t pt-2 flex flex-col gap-2" style={{ borderColor: theme.border }}>
                  
                  <div className="flex items-center gap-2 justify-between">
                    <p className="text-[8.5px] text-gray-500 font-bold">
                      أقر قسائم الأتمتة الموثقة لتوليد المرفقات
                    </p>

                    <button
                      type="button"
                      onClick={generateAiReply}
                      disabled={isAiGeneratingReply}
                      className="px-2.5 py-1 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white transition-all text-[9px] font-black flex items-center gap-1 rounded-md border border-purple-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                      <span>{isAiGeneratingReply ? "يجري التحليل والصياغة..." : "توليد الرد بالـ AI 🤖"}</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أدخل الرد المناسب للتواصل مباشرة..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      className="flex-1 text-xs py-2 px-3 rounded-lg border outline-none font-bold tracking-tight transition-all"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                    />

                    <button
                      type="button"
                      onClick={handleSendChat}
                      className="p-1.5 py-2 px-3 rounded-lg text-black hover:brightness-110 active:scale-95 transition-all text-xs font-black shrink-0 inline-flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
              
              {/* 👥 INTEGRATED CUSTOMER 360 PROFILE SIDEBAR (Focus Point 8) */}
              <div className="md:col-span-4 p-4 rounded-2xl border flex flex-col gap-2.5 justify-start text-right select-none h-full overflow-y-auto"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div className="border-b pb-2" style={{ borderColor: theme.border }}>
                  <span className="text-[10px] font-black block text-amber-500">سجل ميلاد العميل • Customer 360</span>
                  <p className="text-[8px] text-gray-400">ملخص حي لقيمة العميل في المنظومة</p>
                </div>

                {/* Patient / customer avatar info card */}
                <div className="text-center space-y-1">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-xs text-[#000] mx-auto"
                    style={{ backgroundColor: theme.accent }}>
                    {selectedChat.customerName[0]}
                  </div>
                  <h5 className="text-[11px] font-extrabold" style={{ color: theme.text }}>{selectedChat.customerName}</h5>
                  <span className="text-[8px] block text-yellow-500 font-extrabold">⭐⭐⭐⭐⭐ GOLD CUSTOMER</span>
                </div>

                {/* Essential metrics stack */}
                <div className="space-y-1.5 text-[8.5px] font-bold">
                  <div className="p-2 rounded bg-slate-900 flex justify-between items-center border border-slate-800">
                    <span className="text-emerald-400 font-mono">١,٤٥٠ ر.س</span>
                    <span className="text-gray-400">إجمالي المشتريات:</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 flex justify-between items-center border border-slate-800">
                    <span className="font-mono" style={{ color: theme.text }}>٣ فواتير صيد</span>
                    <span className="text-gray-400">عقود منتهية:</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 flex justify-between items-center border border-slate-800">
                    <span className="text-red-400 font-mono">لا يوجد ديون</span>
                    <span className="text-gray-400">الذمم المستحقة:</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 flex justify-between items-center border border-slate-800">
                    <span className="text-sky-400 font-mono">الرياض الملقا</span>
                    <span className="text-gray-400">المدينة والمقر:</span>
                  </div>
                </div>

                {/* Internal Notepad for Agent inside OmniChat */}
                <div className="mt-1 space-y-1 text-right">
                  <span className="text-[8.5px] font-black text-gray-400 block">• ملاحظات الموظف الخاصة:</span>
                  <textarea
                    rows={2}
                    className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-[9.5px] text-gray-300 outline-none"
                    placeholder="اكتب ملاحظة استباقية سريعة هنا..."
                    defaultValue="تفضيل التغليف الملكي ومناسبات الأعياد دائمًا."
                  />
                </div>

                <div className="pt-2 border-t text-[8px] text-gray-400 flex justify-between items-center" style={{ borderColor: theme.border }}>
                  <span>نظام سهم الموحد</span>
                  <span>الرمز التعريفي: #CRM-9051</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Executive AI Assistant (Focus Point 5 - AI Memory System) */}
      {activeSubTab === 'assistant' && (
        <div className="p-5 rounded-2xl border space-y-5 text-right animate-fade-in" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          {/* Inner Navigation Tabs - Redesigned Grid Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pb-3 border-b" style={{ borderColor: theme.border }}>
            <button
              onClick={() => setAssistantInnerTab('chat')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                assistantInnerTab === 'chat' 
                  ? 'border-amber-500 bg-amber-500/5 text-amber-500 font-extrabold' 
                  : 'border-slate-800 bg-slate-900/10 text-gray-400 hover:text-gray-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <span>محادثة المساعد 💬</span>
              </div>
              <span className="block text-[9px] text-gray-400 mt-1 font-medium">الدردشة والذكاء اليومي المتكامل</span>
            </button>

            <button
              onClick={() => setAssistantInnerTab('recommendations')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                assistantInnerTab === 'recommendations' 
                  ? 'border-amber-500 bg-amber-500/5 text-amber-500 font-extrabold' 
                  : 'border-slate-800 bg-slate-900/10 text-gray-400 hover:text-gray-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <span>التوصيات الذكية 💡</span>
              </div>
              <span className="block text-[9px] text-gray-400 mt-1 font-medium">توصيات مخصصة وحلول النمو لمتجرك</span>
            </button>

            <button
              onClick={() => setAssistantInnerTab('analyzer')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                assistantInnerTab === 'analyzer' 
                  ? 'border-amber-500 bg-amber-500/5 text-amber-500 font-extrabold' 
                  : 'border-slate-800 bg-slate-900/10 text-gray-400 hover:text-gray-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <span>تحليل المتجر 📈</span>
              </div>
              <span className="block text-[9px] text-gray-400 mt-1 font-medium">الملخص التنفيذي الفوري وفحص الصحة</span>
            </button>

            <button
              onClick={() => setAssistantInnerTab('saas')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                assistantInnerTab === 'saas' 
                  ? 'border-amber-500 bg-amber-500/5 text-amber-500 font-extrabold' 
                  : 'border-slate-800 bg-slate-900/10 text-gray-400 hover:text-gray-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs text-amber-400">
                <span>سهم 2030 🇸🇦</span>
              </div>
              <span className="block text-[9.5px] text-white mt-1 font-black leading-tight">رؤية سهم الذكية للتحول التجاري والرقمي</span>
            </button>
          </div>

          {/* Tab Render Switchers */}
          {assistantInnerTab === 'chat' && (
            <div className="space-y-4">
              <div className="border-b pb-2.5 mb-1" style={{ borderColor: theme.border }}>
                <span className="text-[10px] font-black block text-amber-500">• مساعد سهم الذكي للشارات والذاكرة اليومية (Executive Intelligence)</span>
                <p className="text-[8px] text-gray-400">اطرح التوصيات أو استفسر عن مؤشرات فروعك وتفاعلات الذاكرة تلقائياً</p>
              </div>

              <div className="space-y-4">
                {/* Chat timeline for analysis results */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto px-1.5 py-2 border rounded-xl bg-gray-500/5" style={{ borderColor: theme.border }}>
                  {assistantMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} text-xs font-bold leading-relaxed`}>
                      <div className={`p-3.5 max-w-[85%] rounded-2xl ${msg.sender === 'user' ? 'bg-sky-500/10 text-sky-400' : 'bg-gray-500/10 text-gray-200'}`}
                        style={{ 
                          backgroundColor: msg.sender === 'user' ? theme.surface : theme.surface + "aa",
                          borderColor: theme.border 
                        }}>
                        <p className="whitespace-pre-line text-xs font-bold leading-relaxed">{msg.text}</p>
                        {msg.elements}
                      </div>
                    </div>
                  ))}

                  {isAssistantTyping && (
                    <div className="flex justify-start text-xs font-bold">
                      <div className="p-3 bg-gray-500/10 rounded-2xl text-amber-500 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                        <span>يقوم وكيل سهم AI بسحب ومراجعة قنوات سلة وزد وتحديث الفواتير حياً...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 border-t pt-4 mt-3" style={{ borderColor: theme.border }}>
                <input
                  type="text"
                  placeholder="اطرح استشارة أو سؤالاً تنفيذاً على سهم AI (مثال: ما هي نسبة النمو في مبيعاتي؟)..."
                  value={customAssistantText}
                  onChange={(e) => setCustomAssistantText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomAssistantSend()}
                  className="flex-1 text-xs py-2 px-3.5 rounded-xl border outline-none font-bold"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                />
                <button
                  onClick={handleCustomAssistantSend}
                  className="py-2.5 px-4 rounded-xl text-black hover:brightness-110 active:scale-95 text-xs font-bold shrink-0 cursor-pointer"
                  style={{ backgroundColor: theme.accent }}
                >
                  استشر سهم 🔮
                </button>
              </div>
            </div>
          )}

          {assistantInnerTab === 'recommendations' && (
            <div className="space-y-4 animate-fade-in text-right">
              <div className="pb-2.5 border-b mb-4" style={{ borderColor: theme.border }}>
                <span className="text-[12px] font-black block text-amber-500">التوصيات الذكية 💡</span>
                <p className="text-[10px] text-gray-400 mt-0.5">توصيات مخصصة وحلول نمو متكاملة لزيادة مبيعاتك وأرباحك تلقائياً</p>
              </div>
              <AIAnalyzer 
                theme={theme} 
                products={products}
                setProducts={setProducts}
                setActiveTab={setActiveTab}
                setPrefillPublish={setPrefillPublish}
                mode="recommendations"
              />
            </div>
          )}

          {assistantInnerTab === 'analyzer' && (
            <div className="space-y-4 animate-fade-in text-right">
              <div className="pb-2.5 border-b mb-4" style={{ borderColor: theme.border }}>
                <span className="text-[12px] font-black block text-amber-500">تحليل المتجر وفحص الصحة الذكي 📈</span>
                <p className="text-[10px] text-gray-400 mt-0.5">شاشة التحليل والملخصات التنفيذية وحالة الربحية الحية من قنوات التجارة</p>
              </div>
              <AIAnalyzer 
                theme={theme} 
                products={products}
                setProducts={setProducts}
                setActiveTab={setActiveTab}
                setPrefillPublish={setPrefillPublish}
                mode="store_analysis"
              />
            </div>
          )}

          {assistantInnerTab === 'saas' && (
            <div className="space-y-4 animate-fade-in text-right">
              <div className="pb-2.5 border-b mb-4" style={{ borderColor: theme.border }}>
                <span className="text-[13px] font-black block text-amber-400 font-sans">سهم 2030 🇸🇦</span>
                <p className="text-[11px] text-gray-300 mt-0.5 font-black font-sans">رؤية سهم الذكية للتحول التجاري والرقمي</p>
              </div>
              <SaaSBlueprint theme={theme} user={user} />
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-6 text-right font-sans animate-fade-in" dir="rtl">
          {/* Actionable Feedback message if any action executed */}
          <AnimatePresence>
            {actionFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs font-bold leading-relaxed flex items-center justify-between gap-3 text-right shadow-md"
              >
                <div>
                  <span className="text-amber-500 font-black block text-[10px] mb-0.5">✓ تم اتخاذ وتطبيق القرار التنفيذي اللحظي:</span>
                  <span>{actionFeedback}</span>
                </div>
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested Actions Widget */}
          <div 
            className="p-5 rounded-2xl border flex flex-col justify-between space-y-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-900/60 text-right">
              <span className="text-[10px] font-black text-rose-450 animate-pulse font-mono flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3 text-rose-450" />
                <span>معزز بالذكاء وربح الأعمال</span>
              </span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>أهم ٥ إجراءات مقترحة لاتخاذ قرار فوري</span>
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-bold">
              مبني على أحدث المتغيرات في قاعدة البيانات ومكاملة رصيد العود والواتساب والعنوان الوطني. اضغط على أي ميزة لتطبيقها بسلامة وسرعة فائقة:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  id: "act-1",
                  title: "📦 أمر شراء عاجل ومؤتمت",
                  desc: `طلب توريد ١٠٠ عبوة لتغذية رصيد العود الناقص.`,
                  longDesc: "تم إرسال أمر الشراء لـ 'مطابع سهم للتغليف'، وتحديث المخزون بنجاح لتفادي إغلاق طلبات سلة!",
                  successToast: "تم توريد ١٠٠ عبوة إشعار شراء عاجل مضاف للفواتير بنجاح!"
                },
                {
                  id: "act-2",
                  title: "💬 رد سريع وكود خصم العميل",
                  desc: "توججه رد ترويجي فاخر للعميل العتيبي عبر واتساب لإنقاذ السلة المتروكة.",
                  longDesc: "تم توليد رد فاخر بالذكاء الاصطناعي مع كود MARASEEM-VIP (خصم ١٥٪) وإرساله مباشرة!",
                  successToast: "تم توليد وإرسال كود خصم VIP للعميل سليمان العتيبي بنجاح!"
                },
                {
                  id: "act-3",
                  title: "🚚 بوليصة شحن أرامكس",
                  desc: "تصدير الفاتورة المعلقة رقم #9145 وتجهيز بوليصة الشحن اللوجستية.",
                  longDesc: "تم إنشاء شحنة وتأكيد العنوان الوطني للعميل وإرسال الرابط للبريد الإلكتروني!",
                  successToast: "تم إصدار بوليصة أرامكس وتتبع الشحنة رقم TRK-8824 بنجاح!"
                },
                {
                  id: "act-4",
                  title: "⚡ مزامنة Supabase / ZATCA",
                  desc: "ترحيل وتدبيج معاملات اليوم لمنع تضارب التقارير الضريبية.",
                  longDesc: "تم تشفير ونشر كتل الداتا الموحدة لـ PostgreSQL واكتساب شهادة هيئة الزكاة رقم Phase-2!",
                  successToast: "تم ترحيل فواتير الرياض بنجاح لـ Supabase وهيئة الزكاة (ZATCA)!"
                },
                {
                  id: "act-5",
                  title: "🗺️ تسجيل العنوان الوطني",
                  desc: "استكمال وتثبيت العنوان لـ ٣ عملاء بالرياض للحيلولة دون إلغاء الطلبات.",
                  longDesc: "تم تدقيق المباني والأحياء تلقائياً وتفعيل الكرت الوطني اللوجستي الموحد للعملاء!",
                  successToast: "تم تطهير وتثبيت العنونة المشفرة لعملاء الرياض بنجاح!"
                }
              ].map((act) => {
                const isExecuted = completedActions.includes(act.id);
                return (
                  <div 
                    key={act.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 text-right bg-slate-950/40 hover:border-amber-500/25 transition-all ${isExecuted ? "border-emerald-500/30 opacity-70" : "border-slate-900"}`}
                  >
                    <div className="space-y-0.5 text-right flex-1">
                      <h4 className="text-xs font-black text-white leading-normal">{act.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{act.desc}</p>
                    </div>

                    <div className="flex items-center shrink-0 w-full mt-2">
                      {isExecuted ? (
                        <span className="w-full py-1.5 rounded-lg text-emerald-400 font-black text-[10px] flex items-center justify-center gap-1 border border-emerald-500/10 bg-emerald-500/5">
                          <Check className="w-3.5 h-3.5" />
                          <span>تم بنجاح ✓</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleExecuteAction(act.id, act.successToast, act.longDesc)}
                          className="w-full py-2 bg-gradient-to-l from-amber-600 to-yellow-500 text-black font-black text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer border-none shadow hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Zap className="w-3 h-3" />
                          <span>اتخاذ قرار فوري ⚡</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-bold text-gray-500">
              <span>* التعديلات تدعم التحديث بالوقت الحقيقي والتكامل الخلفي</span>
              <span>مستشار سهم للقرارات السريعة v2.10</span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          {/* AI Analyzer page content */}
          <AIAnalyzer 
            theme={theme} 
            products={products}
            setProducts={setProducts}
            setActiveTab={setActiveTab}
            setPrefillPublish={setPrefillPublish}
          />
        </div>
      )}

      {/* TAB CONTENT: Competitor Monitor */}
      {activeSubTab === 'competitors' && (
        <CompetitorMonitor
          theme={theme}
          products={products}
          setProducts={setProducts}
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
        />
      )}

      {/* TAB CONTENT: Intelligent Hub (AI Studio) */}
      {activeSubTab === 'intelligent_hub' && (
        <IntelligentHub
          theme={theme}
          user={user}
          products={products}
          setProducts={setProducts}
          invoices={invoices}
          setInvoices={setInvoices}
          customers={customers}
          setCustomers={setCustomers}
          prefillPublish={prefillPublish || null}
          setPrefillPublish={setPrefillPublish || (() => {})}
          setActiveTab={setActiveTab}
          triggerNotification={triggerNotification}
          addAuditLog={addAuditLog}
          initialSubTab={intelligentHubSubTab}
          setSubTab={setIntelligentHubSubTab}
        />
      )}

      {/* TAB CONTENT 5: Alerts & Monitor */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-6 text-right font-sans animate-fade-in" dir="rtl">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl border text-right flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]" 
               style={{ 
                 background: `radial-gradient(circle at top right, rgba(239, 68, 68, 0.06) 0%, ${theme.surface} 100%)`, 
                 borderColor: theme.border 
               }}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-5 relative z-10 w-full">
              {/* SVG Radar Sweep Widget */}
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0 bg-black/45 rounded-2xl border border-zinc-800/60 p-2 shadow-inner">
                <span className="absolute w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 animate-ping"></span>
                <span className="absolute w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/30 animate-pulse"></span>
                <div className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </div>
                <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '8s' }}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(239, 68, 68, 0.04)" strokeWidth="1" />
                  <line x1="28" y1="28" x2="28" y2="4" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm md:text-base font-black text-white flex items-center gap-1.5">
                  🚨 نظام المراقبة الأمنية والتحذيرات اللحظية (Security & Alert Console)
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  يقوم الذكاء الاصطناعي بمراقبة حركات المخزون المعلقة، والورديات، وتسجيل عمليات التدقيق والامتثال الضريبي بشكل مستمر لضمان نزاهة التعاملات اليومية.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Critical Inventory Column */}
            <div className="lg:col-span-4 p-5 rounded-2xl border space-y-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="border-b pb-3" style={{ borderColor: theme.border }}>
                <span className="text-[10px] font-extrabold text-rose-500 block">• تحذيرات المخزون الحرجة (Inventory Alerts)</span>
                <p className="text-[9px] text-gray-400">المنتجات التي قاربت على النفاد (أقل من ٥٠ قطعة)</p>
              </div>
              
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto">
                {products.filter(p => p.stock < 50).length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 font-bold">
                    🟢 كافة مستويات المخزون في الفروع والمغازن ممتازة ومكتملة!
                  </div>
                ) : (
                  products.filter(p => p.stock < 50).map(p => (
                    <div key={p.id} className="p-3 rounded-xl border flex justify-between items-center bg-rose-500/5 transition-all text-xs font-bold leading-normal" style={{ borderColor: theme.border }}>
                      <div className="space-y-1">
                        <span className="text-gray-400 text-[10px] block">الباركود: {p.sku || `#SKU-${p.id}`}</span>
                        <span className="text-rose-500 font-black font-mono">{p.stock} قطعة متبقية</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-extrabold block">{p.name}</span>
                        <span className="text-gray-400 text-[10px] block">السعر الأساسي: {p.price} ر.س</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: أهم التنبيهات ونبض النظام (Critical Alerts & System Pulse) */}
            <div className="lg:col-span-4 p-5 rounded-2xl border space-y-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="border-b pb-3" style={{ borderColor: theme.border }}>
                <span className="text-[10px] font-extrabold text-amber-500 block">• أهم التنبيهات ونبض النظام (Alarms)</span>
                <p className="text-[9px] text-gray-400">تحذيرات رادار الأسعار والذمم المعلقة اللحظية</p>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-1 mt-2">
                {/* 📡 Competitor Price Drop Alert Card */}
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex flex-col gap-2.5 text-right relative overflow-hidden transition-all hover:scale-[1.005]">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/[0.03] rounded-full blur pointer-events-none"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-red-500/10 text-red-400 font-extrabold px-2 py-0.5 rounded border border-red-500/20">رادار الأسعار 📡</span>
                    <span className="text-[9.5px] text-gray-500 font-mono">الآن حياً</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white leading-normal">
                      تنبيه: منافس خفّض سعر منتج مشابه
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      قام "متجر النخبة للعود" بتخفيض سعر "دهن عود كلمنتان دبل سوبر" إلى ٣٨٠ ر.س (خصم ١٢٪).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab && setActiveSubTab("competitors")}
                    className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-[10.5px] font-black cursor-pointer transition-all border border-red-500/15"
                  >
                    فتح رصد المنافسين ⚡
                  </button>
                </div>

                {/* Other alerts */}
                {[
                  {
                    id: "alt-1",
                    title: "نفاد مخزني وشيك",
                    desc: `صنف "${products.filter(p => p.stock < 50)[0]?.name || "العود الملكي الفاخر"}" قارب على النفاد التام من مستودع الشفا.`,
                    type: "critical",
                    time: "منذ ٥ د"
                  },
                  {
                    id: "alt-2",
                    title: "مديونية معلقة كبيرة",
                    desc: "فاتورة بقيمة ١,٢٠٠ ر.س للعميل سليمان العتيبي تجاوزت فترة السداد المسموحة لفرع الرياض الرئيسي.",
                    type: "warning",
                    time: "منذ ٣٠ د"
                  },
                  {
                    id: "alt-3",
                    title: "مكاملة منصة سبل (SPL)",
                    desc: "التحقق من العنونة الوطنية لاستلام طلبيات سلة بنجاح.",
                    type: "info",
                    time: "منذ ساعة"
                  }
                ].map((alt) => (
                  <div 
                    key={alt.id}
                    className={`p-3 rounded-xl bg-slate-950/45 border flex items-start gap-3 text-right hover:scale-[1.005] transition-all ${
                      alt.type === "critical" 
                        ? "border-rose-500/40" 
                        : alt.type === "warning" 
                        ? "border-amber-500/30" 
                        : "border-sky-500/20"
                    }`}
                  >
                    <div className="grow space-y-1">
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="text-[8.5px] text-gray-500 font-mono font-normal">{alt.time}</span>
                        <h4 className={`text-xs font-black ${
                          alt.type === "critical" 
                            ? "text-rose-400" 
                            : alt.type === "warning" 
                            ? "text-amber-500" 
                            : "text-sky-450"
                        }`}>{alt.title}</h4>
                      </div>
                      <p className="text-[10.5px] text-gray-300 leading-normal font-bold">
                        {alt.desc}
                      </p>
                    </div>
                    
                    <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                      alt.type === "critical" 
                        ? "bg-rose-500/10 text-rose-450" 
                        : alt.type === "warning" 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "bg-sky-500/10 text-sky-400"
                    }`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unified System Logs & Audit Timeline Column */}
            <div className="lg:col-span-4 p-5 rounded-2xl border space-y-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="border-b pb-3 flex justify-between items-center" style={{ borderColor: theme.border }}>
                <span className="text-[10px] font-extrabold text-[#D4AF37] block">• سجل النشاط وحركات مركز المراقبة والتحكم بالـ AI</span>
                <span className="text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded font-black font-mono">النشاط متصل حياً</span>
              </div>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 font-semibold">
                    📋 لا توجد حركات تدقيق تالفة أو تعديل حالياً في هذا الجزء.
                  </div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border bg-[#000]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" style={{ borderColor: theme.border }}>
                      <span className="text-[10px] text-gray-400 font-bold shrink-0">{log.time || "قبل دقيقة"}</span>
                      <div className="text-right flex-1 select-all">
                        <span className="font-extrabold text-white block text-amber-400">{log.action || log.event}</span>
                        <p className="text-[10.5px] text-gray-300 mt-1 font-bold leading-relaxed">{log.details || log.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: Operations & Configurations */}
      {activeSubTab === 'operations' && (
        <div className="space-y-8 text-right font-sans">
          {/* Automated rule constructor */}
          <WorkflowEngine
            theme={theme}
            onAddLog={(action, details) => addAuditLog?.(action, details)}
            triggerNotification={(title, text, type) => triggerNotification?.(text, type)}
          />

          {/* Ad copy publisher system */}
          <AutoPublish 
            theme={theme} 
            prefill={prefillPublish}
            onClearPrefill={() => setPrefillPublish?.(null)}
            invoices={invoices}
            setInvoices={setInvoices}
            products={products}
            setProducts={setProducts}
            setActiveTab={setActiveTab}
          />

          {/* System modules & ERP permissions */}
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="border-b pb-3" style={{ borderColor: theme.border }}>
              <span className="text-[11px] font-black text-[#D4AF37] block">📦 موديولات النظم والـ ERP الأساسية</span>
              <p className="text-[10px] text-gray-400 mt-0.5">تبديل وحجب صلاحيات المستخدمين والوصول المباشر بنقرة واحدة</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { k: 'pos_and_operations', name: 'العمليات نقاط بيع (POS) 🛍️🏢', desc: 'استعراض بوابة نقاط البيع وتجهيز بيئات عمل الفواتير المتكاملة.' },
                { k: 'accounting', name: 'الدفاتر ونظام الحسابات المحاسبي ERP ⚖️', desc: 'دليل الحسابات الشامل، السندات اليومية، كشوفات ضريبة القيمة المضافة.' },
                { k: 'intelligent_hub', name: 'استوديو الذكاء الاصطناعي والتسويق 🧠⚡', desc: 'نمر الأعلانات، تقييم المنافسين، الربط الفوري بقنوات النشر.' },
                { k: 'reports', name: 'التقارير وسرعات البيع الخضراء 📊', desc: 'رسوميات تفاعلية تفصيلية للأرباح والاستهلاك والنمو في الفروع.' },
                { k: 'customers', name: 'إدارة علاقات العملاء CRM 👥', desc: 'سجل الاتصال، الفواتير، متوسط الصرف وتقييم الولاء للعلامة.' },
                { k: 'suppliers', name: 'سلاسل التوريد والموردين 🚚', desc: 'إدارة الموردين، طلبات الشراء، كشوفات الديون، وحساب المخازن.' }
              ].map(mod => {
                const isEnabled = enabledModules[mod.k] !== false;
                return (
                  <div
                    key={mod.k}
                    className="p-5 rounded-2xl border flex flex-col justify-between gap-4 bg-slate-900 border-slate-800"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black" style={{ color: theme.text }}>{mod.name}</h4>
                        <span className="text-[8.5px] bg-amber-500/10 text-amber-500 py-0.5 px-1.5 rounded font-bold">باقة SaaS الحية</span>
                      </div>
                      <p className="text-[10px] leading-relaxed mt-2" style={{ color: theme.muted }}>{mod.desc}</p>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: theme.border }}>
                      <span className="text-[10px] font-bold text-sky-400">
                        الحالة: {isEnabled ? "🟢 نشط بالجانب الأيمن" : "🔴 غير نشط"}
                      </span>

                      <button
                        onClick={() => {
                          const updated = { ...enabledModules, [mod.k]: !isEnabled };
                          setEnabledModules?.(updated);
                          triggerNotification?.(isEnabled ? `تم إلغاء موديول: ${mod.name}` : `تم تشغيل وتفعيل موديول: ${mod.name}`, isEnabled ? "warning" : "success");
                          addAuditLog?.("تعديل حزم النظام", `قام المستخدم بتعديل حالة تفعيل ووصول موديول: ${mod.name}`);
                        }}
                        className="py-1 px-3 text-[10px] font-black rounded-lg transition-all cursor-pointer active:scale-95"
                        style={{
                          backgroundColor: isEnabled ? 'rgba(239, 68, 68, 0.15)' : theme.accent,
                          color: isEnabled ? '#EF4444' : '#000',
                          border: isEnabled ? '1px solid #EF4444' : 'none',
                        }}
                      >
                        {isEnabled ? "تعطيل الموديول 🔌" : "تفعيل فوري 🔗"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Integrations */}
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="border-b pb-3" style={{ borderColor: theme.border }}>
              <span className="text-[11px] font-black text-[#D4AF37] block">🔌 بيئة الربط الخارجي وبوابات الشحن والدفع (API Integration)</span>
              <p className="text-[10px] text-gray-400 mt-0.5">ربط خدمات الطرف الثالث والتكامل المزدوج من خلال الـ Webhook و REST API</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceAddons.map(addon => (
                <div
                  key={addon.id}
                  className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group hover:shadow-md"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-black" style={{ color: theme.text }}>{addon.title}</h4>
                      <span className="text-[9px] bg-slate-500/10 p-1 rounded font-bold" style={{ color: theme.muted }}>{addon.cost}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed mt-2" style={{ color: theme.muted }}>{addon.desc}</p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: theme.border }}>
                    <span className="text-[10px] font-bold text-sky-400">
                      الحالة: {addon.active ? "🟢 نشط بالكامل" : "🔴 غير نشط"}
                    </span>

                    <button
                      onClick={() => handleToggleAddon(addon.id)}
                      className="py-1 px-3 text-[10px] font-black rounded-lg transition-all cursor-pointer active:scale-95"
                      style={{
                        backgroundColor: addon.active ? 'rgba(239, 68, 68, 0.15)' : theme.accent,
                        border: addon.active ? '1px solid #EF4444' : 'none',
                        color: addon.active ? '#EF4444' : '#000'
                      }}
                    >
                      {addon.active ? "إيقاف التشغيل 🔌" : "ربط وتفعيل 🔗"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Cabin Customization Style Dashboard (⚙️👑) */}
      {activeSubTab === 'cabin_customize' && (
        <div className="space-y-6 text-right font-sans animate-fade-in relative z-10">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-500 shrink-0">
                <SettingsIcon className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">تخصيص كابينة القيادة التنفيذية 👑⭐</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  بصفتك مديراً تنفيذاً، يمكنك تهيئة وتخصيص تجربة عرض وتصميم الكابينة الذكية بما يتناسب مع دقة شاشتك وتفضيلاتك البصرية.
                </p>
              </div>
            </div>

            {/* Selection Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Option 1: Compact View */}
              <div 
                onClick={() => {
                  setCabinDisplayMode('compact');
                  triggerAlert("تم تغيير نمط كابينة القيادة إلى النمط المدمج بنجاح.", "success");
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  cabinDisplayMode === 'compact' 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs md:text-sm font-black text-white">النمط المدمج الكثيف (Compact Layout) 📱</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    cabinDisplayMode === 'compact' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-zinc-650 bg-zinc-900'
                  }`}>
                    {cabinDisplayMode === 'compact' && <Check className="w-3.5 h-3.5 text-black font-black" />}
                  </div>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                  هيكل ذكي ومدمج عالي الكثافة (Density) مصمم للشاشات المتوسطة والصغيرة والمتحركة. يوفر مساحة رأسية هائلة من خلال الضغط الرأسي للمؤشرات والساعات اللحظية للفرع وإخفاء إرشادات التأسيس بالكامل.
                </p>
              </div>

              {/* Option 2: Expanded View */}
              <div 
                onClick={() => {
                  setCabinDisplayMode('expanded');
                  triggerAlert("تم تغيير نمط كابينة القيادة إلى النمط الموسع الفاخر.", "success");
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  cabinDisplayMode === 'expanded' 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs md:text-sm font-black text-white">النمط الموسع المكتمل (Expanded Layout) 🖥️</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    cabinDisplayMode === 'expanded' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-zinc-650 bg-zinc-900'
                  }`}>
                    {cabinDisplayMode === 'expanded' && <Check className="w-3.5 h-3.5 text-black font-black" />}
                  </div>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                  الكابينة الكلاسيكية الفاخرة المكتملة لشركة سهم. تعرض مرشد معالج التأسيس المكون من 7 خطوات، شعار وميدالية سهم الذهبية التفاعلية، والنبضات اللحظية الموزعة والوقت بطابع مبتكر فريد وثلاثي التقسيم.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time preview */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3.5">معاينة حية تفاعلية للنمط المختار للكابينة:</h4>
            <div className="rounded-xl overflow-hidden p-1 bg-black/30 border border-zinc-900/60 shadow-inner">
              <ExecutiveHeroCard 
                themeColors={theme}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                stores={allowedStores}
                activeStoreId={activeStoreId}
                setActiveStoreId={setActiveStoreId}
                branches={branches}
                activeBranchId={activeBranchId}
                setActiveBranchId={setActiveBranchId}
                warehouses={warehouses}
                activeWarehouseId={activeWarehouseId}
                setActiveWarehouseId={setActiveWarehouseId}
                user={user}
                triggerNotification={(m, t) => triggerAlert(m, t === "success" ? "success" : "info")}
                setActiveTab={setActiveTab}
                displayMode={cabinDisplayMode}
                rawCompanies={rawCompanies}
                impersonatedTenantId={impersonatedTenantId}
                onImpersonate={onImpersonate}
                onStopImpersonating={onStopImpersonating}
              />
            </div>
          </div>
        </div>
      )}

      {false && activeSubTab === 'automation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px] animate-fade-in text-right">
          
          {/* visual connections rule creator */}
          <div className="lg:col-span-6 p-5 rounded-2xl border flex flex-col justify-between space-y-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="border-b pb-3" style={{ borderColor: theme.border }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black flex items-center gap-1.5" style={{ color: theme.text }}>
                  <Zap className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                  <span>لوحة مصمم مسارات التوجيه البصري (Sahm Visual Workflows)</span>
                </h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-500 py-0.5 px-2 rounded font-black font-mono">Visual v2.5</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: theme.muted }}>اربط أحداث عملاء المتجر والتحذيرات بالإجراءات المآتمتة بمسار تدفق تفاعلي</p>
            </div>

            {/* HIGH-FIDELITY AUTOMATION CONNECTOR FLOWCHART DIAGRAM */}
            <div className="p-4 rounded-xl border relative space-y-3.5 select-none" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[9px] text-gray-400 font-extrabold block text-right">مخطط الربط التلقائي الفوري (Live Automation Pipeline Map):</span>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
                
                {/* Visual Node 1: TRIGGER */}
                <div className="p-3.5 rounded-lg border border-emerald-500 text-center w-full md:w-[30%] space-y-1 bg-emerald-950/20 shadow-md">
                  <span className="text-[8px] text-emerald-400 font-black block">TRIGGER (الحدث المشغّل)</span>
                  <p className="text-[9.5px] font-black break-words truncate" style={{ color: theme.text }}>{newTrigger.substring(0, 24) || "حدث العميل"}</p>
                  <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1 rounded animate-pulse">مستمر</span>
                </div>

                {/* Arrow Connector 1 */}
                <div className="flex flex-col items-center justify-center text-amber-500 font-bold text-xs shrink-0 py-1 font-mono">
                  <span>➡️</span>
                  <span className="text-[8px] text-amber-500">مراكم الذكاء</span>
                </div>

                {/* Visual Node 2: AI BRAIN CLASSIFIER */}
                <div className="p-3.5 rounded-lg border border-purple-500 text-center w-full md:w-[30%] space-y-1 bg-purple-950/20 shadow-md relative group">
                  <span className="text-[8px] text-purple-400 font-black block">AI FILTERS (تصفية سهم)</span>
                  <p className="text-[9.5px] font-extrabold text-[#D4AF37] leading-relaxed truncate">توجيه ذكي بالـ AI</p>
                  <span className="text-[8px] bg-purple-500/15 text-purple-400 px-1 rounded font-normal">Gemini Engine</span>
                </div>

                {/* Arrow Connector 2 */}
                <div className="flex flex-col items-center justify-center text-amber-500 font-bold text-xs shrink-0 py-1 font-mono">
                  <span>➡️</span>
                  <span className="text-[8px] text-amber-500">توجيه فوري</span>
                </div>

                {/* Visual Node 3: ACTION */}
                <div className="p-3.5 rounded-lg border border-sky-500 text-center w-full md:w-[30%] space-y-1 bg-sky-950/20 shadow-md">
                  <span className="text-[8px] text-sky-400 font-black block">ACTION (الإجراء التنفيذي)</span>
                  <p className="text-[9.5px] font-black break-words truncate" style={{ color: theme.text }}>{newAction.substring(0, 22) || "التحرك التلقائي"}</p>
                  <span className="text-[8px] bg-sky-500/15 text-sky-400 px-1 rounded">نشط</span>
                </div>

              </div>
            </div>

            {/* Dropdown parameters inside flowchart */}
            <div className="space-y-3.5">
              
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-emerald-400 block mb-1">١. اختر الحدث المشرف للمستودع والعميل (Trigger):</label>
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 rounded-lg border outline-none font-bold"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  <option value="إذا انخفض المخزون عن 20 قطع">إذا قل مخزون عينة دهن الطيب عن الحد الآمن (20 قطعة)</option>
                  <option value="إذا تم إنشاء منتج جديد بالمتجر">إذا أرسل الموظف صنفاً جديداً للمستودع الرئيسي</option>
                  <option value="إذا وصل عميل تسجيلي جديد بالـ CRM">إذا تم تسجيل مستفيد في سهم العميل 360</option>
                  <option value="إذا تجاوزت قيمة الفاتورة الصادرة 1000 ر.س">إذا تجاوزت قيمة المبيعات الحية ١,٠٠٠ ر.س</option>
                </select>
              </div>

              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-sky-400 block mb-1">٢. اختر الإجراء الفوري الواجب استجابة له (Action):</label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 rounded-lg border outline-none font-bold"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  <option value="أرسل إشعار واتساب تلقائي للمالك وتنبيه المورد">قم فوراً بإرسال تنبيه واتساب مباشر للمالك والعميل</option>
                  <option value="توليد أوصاف وإعلانات السناب التلقائية بواسطة AI">قم بنشر أوصاف تسويقية وإعلانات سناب وتيك توك بالـ AI</option>
                  <option value="إرسال قسيمة ترحيبية فورية خصم %15 بالبريد">منح العميل كوبون ترحيب بخصم ١٥٪ برقم الخلية</option>
                  <option value="منحه فوريا تصنيف التميز الذهبي وبخور هدية">منحه فوريا تصنيف التميز الذهبي وبخور ملكي هدية</option>
                </select>
              </div>

            </div>

            <button
              onClick={handleAddAutomationRule}
              className="w-full py-2.5 mt-2 rounded-xl text-black hover:brightness-110 active:scale-95 transition-all text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: theme.accent }}
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>تسجيل وتفعيل تدفق الأتمتة التلقائي 🚀</span>
            </button>
          </div>

          {/* Right panel: Active Rules list & execution history */}
          <div className="lg:col-span-6 p-5 rounded-2xl border space-y-5 text-right font-bold"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            
            <div>
              <h3 className="text-xs font-black flex items-center justify-between" style={{ color: theme.text }}>
                <span>قواعد الأتمتة النشطة لمتجرك</span>
                <span className="text-[10px] text-emerald-400">مراقبة التكرار الكلي</span>
              </h3>

              <div className="space-y-3 mt-3">
                {automationRules.map(rule => (
                  <div key={rule.id} className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className="flex-1 min-w-0 pr-1 border-r-2" style={{ borderColor: rule.enabled ? theme.accent : "#555" }}>
                      <div className="flex items-center gap-1">
                        <span className="text-red-400">الشرط:</span>
                        <span className="truncate" style={{ color: theme.text }}>{rule.trigger}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px]" style={{ color: theme.muted }}>
                        <span className="text-emerald-400">الإجراء:</span>
                        <span className="truncate">{rule.action}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[9px] bg-slate-500/10 p-1 rounded font-mono" style={{ color: theme.muted }}>
                        تم التشغيل: {rule.count}
                      </span>
                      
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className="p-1 rounded cursor-pointer transition-colors"
                        style={{ color: rule.enabled ? theme.accent : '#EF4444' }}
                      >
                        {rule.enabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7 text-gray-500" />}
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automation system executed logs */}
            <div className="border-t pt-4" style={{ borderColor: theme.border }}>
              <h4 className="text-[11px] font-black pb-2.5 flex items-center justify-between" style={{ color: theme.text }}>
                <span>سجل الأتمتة والعمليات الخلفية (Audit Logs)</span>
                <span className="text-[9px] opacity-70 font-normal">تحديث مباشر</span>
              </h4>

              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {automationLogs.map(log => (
                  <div key={log.id} className="p-2.5 rounded bg-gray-500/5 text-[10px] font-bold flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1 shrink-0"></span>
                      <div>
                        <span className="text-sky-400 shrink-0">[{log.rule}]</span>
                        <p className="mt-0.5" style={{ color: theme.text }}>{log.text}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-normal shrink-0" style={{ color: theme.muted }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 5: Customer 360 Profile */}
      {activeSubTab === 'customer360' && (
        <CustomerTimeline360
          theme={theme}
          customers={customers}
          invoices={invoices}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          onAddLog={(action, details) => addAuditLog(action, details)}
          triggerNotification={(title, text, type) => triggerNotification?.(text, type)}
        />
      )}

      {false && activeSubTab === 'customer360' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-right animate-luxury-glow"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-[#D4AF37]/30">
                <UserIcon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight" style={{ color: theme.text }}>الملف التعريفي الملكي المتكامل (Customer 360 High-Intelligence Hub)</h3>
                <p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>مزامنة الفواتير، ونشاط قنوات البيع، وذكاء سهم الاستباقي لكل منفذ من السحابة</p>
              </div>
            </div>

            {/* Quick searchable customer dropdown list */}
            <div className="flex items-center gap-2.5 self-start md:self-center">
              <span className="text-xs font-black" style={{ color: theme.muted }}>العميل النشط بالذكاء:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="text-xs py-2 px-4 rounded-xl border outline-none font-bold transition-all cursor-pointer shadow-lg hover:border-[#D4AF37]"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Sidebar parameters on Customer - Elite Luxury Theme styling */}
            <div className="lg:col-span-4 p-6 rounded-3xl border space-y-6 luxury-card-hover animate-fade-in-up"
              style={{ backgroundColor: theme.card, borderColor: "rgba(212, 175, 55, 0.25)" }}>
              
              <div className="text-center pb-5 border-b space-y-3" style={{ borderColor: theme.border }}>
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mx-auto text-black shadow-inner border border-white/10 animate-pulse"
                    style={{ background: "linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)" }}>
                    {activeCustomer.name[0]}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-black border border-[#D4AF37] px-1.5 py-0.5 rounded-full text-[8px] font-black text-[#D4AF37]">👑 VIP</span>
                </div>
                
                <div>
                  <h3 className="text-base font-black" style={{ color: theme.text }}>{activeCustomer.name}</h3>
                  <span className="inline-block mt-1 text-[9px] font-mono leading-none py-1 px-2.5 rounded-full bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20">
                    رقم الهوية: {activeCustomer.id || "CRM-102"}
                  </span>
                </div>
                
                <p className="text-[10.5px] font-mono" style={{ color: theme.muted }}>رقم الهاتف المحمي: {activeCustomer.phone}</p>
                <div className="text-[10px] font-black text-amber-500 flex items-center justify-center gap-1">
                  <span>📍 {activeCustomer.city}</span>
                  <span className="opacity-40">•</span>
                  <span>المنطقة الغربية والوسطى</span>
                </div>
              </div>

              {/* Loyalty progression metrics (NEW luxury interactive widget) */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-black">
                  <span style={{ color: theme.muted }}>الترقي للفئة الملكية القادمة (VVIP Extreme)</span>
                  <span className="text-[#D4AF37] font-mono">%{Math.min(100, Math.round((getCustomerTotalPaid(activeCustomer.name) / 10000) * 100))}</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-600 via-[#D4AF37] to-yellow-300"
                    style={{ width: `${Math.min(100, Math.round((getCustomerTotalPaid(activeCustomer.name) / 10000) * 100))}%` }}
                  ></div>
                </div>
                <p className="text-[8px] text-gray-400 text-center">الإنقاذ الملكي المستهدف: 10,000 ر.س للاشتراك السنوي المجاني</p>
              </div>

              {/* Multi financial indicators with custom glowing metrics */}
              <div className="space-y-3 pt-2 text-xs font-bold">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/55 flex justify-between items-center hover:border-emerald-500/30 transition-all">
                  <span style={{ color: theme.muted }}>إجمالي المبيعات والإنفاق حياً:</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-xs">{getCustomerTotalPaid(activeCustomer.name)} ر.س</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/55 flex justify-between items-center hover:border-sky-500/30 transition-all">
                  <span style={{ color: theme.muted }}>مجموع الفواتير المغلقة:</span>
                  <span className="font-extrabold text-sky-400 font-mono text-xs">{getCustomerOrdersCount(activeCustomer.name)} فاتورة</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/55 flex justify-between items-center hover:border-rose-500/30 transition-all">
                  <span style={{ color: theme.muted }}>الرصيد المالي المتبقي:</span>
                  <span className={`font-extrabold font-mono text-xs ${activeCustomer.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeCustomer.balance === 0 ? "متطابق تماماً " : activeCustomer.balance > 0 ? `${activeCustomer.balance}+` : `${activeCustomer.balance}`} ر.س
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex justify-between items-center">
                  <span className="text-[10px] text-[#D4AF37] font-black">وسام التصنيف الإجرائي:</span>
                  <span className="text-[9px] text-[#D4AF37] font-black py-0.5 px-2 bg-amber-500/10 rounded-full border border-[#D4AF37]/30">⭐⭐⭐⭐⭐ GOLD ROYAL VIP</span>
                </div>
              </div>
            </div>

            {/* Connected timelines, Invoices & internal notepad */}
            <div className="lg:col-span-8 p-6 rounded-3xl border space-y-6 luxury-card-hover animate-fade-in-up"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              
              {/* Linked Invoices segment */}
              <div>
                <h4 className="text-xs font-black pb-3 text-right border-b font-sans flex items-center justify-between" style={{ borderColor: theme.border }}>
                  <span className="text-gray-400 font-normal">سجلات الشراء ومطابقة الفواتير المالية</span>
                  <span className="text-[#D4AF37]">📦 تاريخ العقود والصفقات الصادرة</span>
                </h4>
                
                <div className="space-y-2.5 mt-3 max-h-[220px] overflow-y-auto pr-1">
                  {invoices
                    .filter(i => i.customer === activeCustomer.name)
                    .map(inv => (
                      <div key={inv.id} className="p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all hover:bg-slate-950/40 hover:border-amber-500/40"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#D4AF37] font-mono text-center shrink-0">{inv.id}</span>
                          <span className={`p-1 px-2 text-[8px] rounded font-black shrink-0 ${inv.type === 'sale' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-[#D4AF37] border border-[#D4AF37]/20'}`}>
                            {inv.type === 'sale' ? 'مبيعات حية ✅' : 'مرتجع أو مخازن'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] shrink-0" style={{ color: theme.muted }}>{inv.date}</span>
                        <div className="text-left font-bold shrink-0">
                          <span className="font-mono block text-xs" style={{ color: theme.text }}>{inv.total} ر.س</span>
                          <span className="text-[8px] font-black uppercase text-emerald-400 mt-0.5 block">{inv.status}</span>
                        </div>
                      </div>
                    ))}

                  {invoices.filter(i => i.customer === activeCustomer.name).length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500 font-medium bg-slate-950/20 rounded-xl" style={{ color: theme.muted }}>
                      ⏳ لم يسجل سهم أي فواتير بيع أو توريد سابقة بهذا العقد حتى الآن بالمنظومة.
                    </div>
                  )}
                </div>
              </div>

              {/* Private interactive store logs notebook (ملاحظات خاصة) */}
              <div className="border-t pt-5" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-black pb-3 text-right flex items-center justify-between" style={{ color: theme.text }}>
                  <span className="text-[10px] font-normal text-amber-500 font-mono">تحديث استباقي لحظي للوكلاء والمدراء</span>
                  <span>🔒 سجل الملاحظات والمذكرات الإدارية السرية والتشخيصية</span>
                </h4>
                
                <div className="space-y-3 mt-1.5 text-right">
                  <textarea
                    rows={3}
                    placeholder="اكتب ملاحظات تسويقية خاصة أو نبرة التعامل أو ساعات ذروة التوصيل الشائعة لهذا العميل..."
                    value={tempNoteText}
                    onChange={(e) => setTempNoteText(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-2xl border outline-none font-bold transition-all focus:border-[#D4AF37]/60"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  />
                  <div className="flex justify-end gap-2 text-right">
                    <button
                      onClick={handleSaveCustomerNote}
                      className="py-2.5 px-5 text-xs font-black rounded-xl text-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    >
                      حفظ السجل بمفكرة العقد 💾
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: Marketplace Addaddons Store */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border text-right"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-xs font-black flex items-center gap-1.5" style={{ color: theme.text }}>
              <span>Sahm API Marketplace — متجر إضافات ونظم المنظومة الموسع 🔌</span>
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>
              قم بتوسيع تجارب ERP سهم المحاسبية والتسويقية حياً من خلال تنشيط بوابات الشحن، تكامل سلة وزد، أو كتم وإظهار موديولات متجرك الأساسية بنقرة واحدة.
            </p>
          </div>

          {/* 💼 Section 1: قنوات وموديلات سهم الأساسية */}
          <div className="space-y-3 text-right">
            <h4 className="text-[11px] font-black text-[#D4AF37]">📦 موديولات النظم والـ ERP الأساسية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { k: 'pos_and_operations', name: 'العمليات نقاط بيع (POS) 🛍️🏢', desc: 'استعراض بوابة نقاط البيع وتجهيز بيئات عمل الفواتير المتكاملة.' },
                { k: 'accounting', name: 'الدفاتر ونظام الحسابات المحاسبي ERP ⚖️', desc: 'دليل الحسابات الشامل، السندات اليومية، كشوفات ضريبة القيمة المضافة.' },
                { k: 'intelligent_hub', name: 'استوديو الذكاء الاصطناعي والتسويق 🧠⚡', desc: 'نمر الأعلانات، تقييم المنافسين، الربط الفوري بقنوات النشر.' },
                { k: 'reports', name: 'التقارير وسرعات البيع الخضراء 📊', desc: 'رسوميات تفاعلية تفصيلية للأرباح والاستهلاك والنمو في الفروع.' },
                { k: 'customers', name: 'إدارة علاقات العملاء CRM 👥', desc: 'سجل الاتصال، الفواتير، متوسط الصرف وتقييم الولاء للعلامة.' },
                { k: 'suppliers', name: 'سلاسل التوريد والموردين 🚚', desc: 'إدارة الموردين، طلبات الشراء، كشوفات الديون، وحساب المخازن.' }
              ].map(mod => {
                const isEnabled = enabledModules[mod.k] !== false;
                return (
                  <div
                    key={mod.k}
                    className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 relative bg-slate-900 border-slate-800"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black" style={{ color: theme.text }}>{mod.name}</h4>
                        <span className="text-[8.5px] bg-amber-500/10 text-amber-500 py-0.5 px-1.5 rounded font-bold font-sans">باقة SaaS الحية</span>
                      </div>
                      <p className="text-[10px] leading-relaxed mt-2" style={{ color: theme.muted }}>{mod.desc}</p>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: theme.border }}>
                      <span className="text-[10px] font-bold text-sky-400">
                        الحالة: {isEnabled ? "🟢 نشط بالجانب الأيمن" : "🔴 غير نشط"}
                      </span>

                      <button
                        onClick={() => {
                          const updated = { ...enabledModules, [mod.k]: !isEnabled };
                          setEnabledModules(updated);
                          triggerNotification(isEnabled ? `تم إلغاء موديول: ${mod.name}` : `تم تشغيل وتفعيل موديول: ${mod.name}`, isEnabled ? "warning" : "success");
                          addAuditLog("تعديل حزم النظام", `قام المستخدم بتعديل حالة تفعيل ووصول موديول: ${mod.name}`);
                        }}
                        className="py-1 px-3 text-[10px] font-black rounded-lg transition-all cursor-pointer active:scale-95"
                        style={{
                          backgroundColor: isEnabled ? 'rgba(239, 68, 68, 0.15)' : theme.accent,
                          color: isEnabled ? '#EF4444' : '#000',
                          border: isEnabled ? '1px solid #EF4444' : 'none',
                        }}
                      >
                        {isEnabled ? "تعطيل الموديول 🔌" : "تفعيل فوري 🔗"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔌 Section 2: الربط الخارجي وبوابات الدفع */}
          <div className="space-y-3 text-right pt-4 border-t border-slate-800/50">
            <h4 className="text-[11px] font-black text-[#D4AF37]">🔌 الربط الخارجي، بوابات الشحن والدفع (API Integration)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceAddons.map(addon => (
                <div
                  key={addon.id}
                  className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group hover:shadow-md"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-black" style={{ color: theme.text }}>{addon.title}</h4>
                      <span className="text-[9px] bg-slate-500/10 p-1 rounded font-bold" style={{ color: theme.muted }}>{addon.cost}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed mt-2" style={{ color: theme.muted }}>{addon.desc}</p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: theme.border }}>
                    <span className="text-[10px] font-bold text-sky-400">
                      الحالة: {addon.active ? "🟢 نشط بالكامل" : "🔴 غير نشط"}
                    </span>

                    <button
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`py-1 px-3 text-[10px] font-black rounded-lg transition-all cursor-pointer active:scale-95`}
                      style={{
                        backgroundColor: addon.active ? 'rgba(239, 68, 68, 0.15)' : theme.accent,
                        border: addon.active ? '1px solid #EF4444' : 'none',
                        color: addon.active ? '#EF4444' : '#000'
                      }}
                    >
                      {addon.active ? "إيقاف التشغيل 🔌" : "ربط وتفعيل 🔗"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL FLOATING LAUNCHER CENTER BUTTON */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowQuickLauncher(!showQuickLauncher)}
          className="w-12 h-12 rounded-full flex items-center justify-center font-black text-black shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
          style={{ backgroundColor: theme.accent }}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </button>

        {/* Global floating floating menu options */}
        <AnimatePresence>
          {showQuickLauncher && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="absolute bottom-16 right-0 w-56 rounded-2xl border p-3 flex flex-col gap-1.5 shadow-xl text-right font-sans"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <p className="text-[10px] font-black border-b pb-1.5 mb-1 mr-1 text-center" style={{ color: theme.muted }}>
                ⚡ اختصارات مركز قيادة سهم
              </p>
              
              <button
                onClick={() => {
                  setLauncherModalType('invoice');
                  setShowQuickLauncher(false);
                }}
                className="w-full text-right py-2 px-3 rounded-lg text-xs font-bold hover:bg-gray-500/10 transition-colors cursor-pointer block"
                style={{ color: theme.text }}
              >
                📄 فاتورة مبيعات جديدة
              </button>

              <button
                onClick={() => {
                  setLauncherModalType('product');
                  setShowQuickLauncher(false);
                }}
                className="w-full text-right py-2 px-3 rounded-lg text-xs font-bold hover:bg-gray-500/10 transition-colors cursor-pointer block"
                style={{ color: theme.text }}
              >
                📦 إضافة ومزامنة سلعة
              </button>

              <button
                onClick={() => {
                  setLauncherModalType('customer');
                  setShowQuickLauncher(false);
                }}
                className="w-full text-right py-2 px-3 rounded-lg text-xs font-bold hover:bg-gray-500/10 transition-colors cursor-pointer block"
                style={{ color: theme.text }}
              >
                👥 إضافة عميل للـ CRM
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('assistant');
                  setShowQuickLauncher(false);
                  triggerAlert("تم تفعيل مساعد اتخاذ القرار الذكي", "success");
                }}
                className="w-full text-right py-2 px-3 rounded-lg text-xs font-black text-amber-500 hover:bg-amber-500/5 transition-colors cursor-pointer block border-t border-dashed mt-1"
                style={{ borderColor: theme.border }}
              >
                🤖 استشارة الذكاء الاصطناعي
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QUICK WORKSPACE MODALS (Add/Edit items anywhere on-screen without navigation) */}
      <AnimatePresence>
        {launcherModalType && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 text-right backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-2xl border space-y-4 max-w-sm w-full font-sans shadow-2xl"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              
              {/* Header switcher modal */}
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
                <h3 className="text-xs font-black" style={{ color: theme.text }}>
                  {launcherModalType === 'invoice' && "إصدار ومزامنة فاتورة مبيعات جديدة"}
                  {launcherModalType === 'product' && "إضافة سلعة للمستودع الكلي"}
                  {launcherModalType === 'customer' && "ربط وتسجيل عميل بال CRM"}
                </h3>
                <button
                  onClick={() => setLauncherModalType(null)}
                  className="p-1 rounded bg-gray-500/5 hover:bg-gray-500/15 text-gray-400 font-extrabold cursor-pointer text-xs"
                >
                  إغلاق ✕
                </button>
              </div>

              {/* Form 1: Invoice */}
              {launcherModalType === 'invoice' && (
                <form onSubmit={handleCreateQuickInvoice} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.muted }}>اسم العميل الموثق:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد بن محمد"
                      value={quickInvCustomer}
                      onChange={(e) => setQuickInvCustomer(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border outline-none font-bold"
                      style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.muted }}>القيمة الإجمالية شاملة الضريبة (VAT):</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 550"
                      value={quickInvTotal}
                      onChange={(e) => setQuickInvTotal(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border outline-none font-bold font-mono"
                      style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-black hover:brightness-110 text-xs font-black cursor-pointer active:scale-95 transition-all text-center block"
                    style={{ backgroundColor: theme.accent }}
                  >
                    تأكيد وإصدار الفاتورة والمزامنة ⚡
                  </button>
                </form>
              )}

              {/* Form 2: Product */}
              {launcherModalType === 'product' && (
                <form onSubmit={handleCreateQuickProduct} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.muted }}>اسم السلعة الجديد:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: دهن عود ملكي هندي"
                      value={quickProdName}
                      onChange={(e) => setQuickProdName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border outline-none font-bold"
                      style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.muted }}>سعر البيع المقترح:</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 120"
                      value={quickProdPrice}
                      onChange={(e) => setQuickProdPrice(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border outline-none font-bold font-mono"
                      style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-black hover:brightness-110 text-xs font-black cursor-pointer active:scale-95 transition-all text-center block"
                    style={{ backgroundColor: theme.accent }}
                  >
                    إمداد المستودع بالمادة ⚡
                  </button>
                </form>
              )}

              {/* Form 3: Customer */}
              {launcherModalType === 'customer' && (
                <form onSubmit={handleCreateQuickCustomer} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.muted }}>اسم العميل بالكامل:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سارة محمد الغامدي"
                      value={quickCustName}
                      onChange={(e) => setQuickCustName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border outline-none font-bold"
                      style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.muted }}>رقم جوال العميل:</label>
                    <input
                      type="text"
                      placeholder="مثال: 0501112222"
                      value={quickCustPhone}
                      onChange={(e) => setQuickCustPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border outline-none font-bold font-mono"
                      style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-black hover:brightness-110 text-xs font-black cursor-pointer active:scale-95 transition-all text-center block"
                    style={{ backgroundColor: theme.accent }}
                  >
                    تسجيل وربط بالـ CRM الكلي ⚡
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
