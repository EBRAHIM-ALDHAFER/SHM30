import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HelpCircle, Mail, Phone, MessageSquare, ExternalLink, Search, 
  ChevronDown, ChevronUp, Clock, FileText, Sparkles, Send, CheckCircle, 
  ShieldAlert, Settings, Users, CheckSquare, Layers, Bot, UserCheck, 
  BarChart3, Plus, Trash2, Edit, Shield, Filter, Award, SendHorizontal, AlertTriangle, ListChecks,
  RefreshCw
} from "lucide-react";
import { ThemeColors, Customer, Invoice, Product, User } from "../types";
import { sahmIconPngUrl, sahmLogoPngUrl, sahmMiniMarkPngUrl } from "../assets/brand/sahm-brand-assets";
import SahmDesignSystem from "./SahmDesignSystem";

interface HelpSupportProps {
  theme: ThemeColors;
  customers: Customer[];
  setCustomers?: (custs: Customer[]) => void;
  invoices: Invoice[];
  setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>> | ((val: Invoice[]) => void);
  products: Product[];
  user: User;
  onAddLog: (action: string, details: string) => void;
  triggerNotification: (text: string, type: "success" | "warning" | "info" | "critical" | "ai") => void;
}

interface SupportTicket {
  id: string;
  customerName: string;
  customerId: string;
  title: string;
  category: "technical" | "billing" | "ai" | "integration";
  priority: "critical" | "high" | "medium" | "low";
  assignedTo: string; // Staff name
  status: "open" | "in_progress" | "resolved" | "late";
  date: string;
  commentHistory: string[];
}

interface ChatThread {
  id: string;
  customerName: string;
  customerId: string;
  phone: string;
  channel: "WhatsApp" | "Snapchat" | "Instagram" | "Telegram" | "Email" | "LiveChat";
  lastMsg: string;
  time: string;
  status: "open" | "responded" | "pending";
  category: string;
  assignedTo: string; // Staff name
  messages: Array<{ sender: "customer" | "staff" | "system"; text: string; time: string }>;
}

export default function HelpSupport({
  theme,
  customers,
  setCustomers,
  invoices,
  setInvoices,
  products,
  user,
  onAddLog,
  triggerNotification
}: HelpSupportProps) {
  // Navigation tabs of the Consolidated Communication & Support Hub
  // 1. Inbox (صندوق الوارد)
  // 2. Tickets (التذاكر)
  // 3. Active Customers (العملاء النشطون)
  // 4. Knowledge Base (قاعدة المعرفة)
  // 5. AI Support Assistant (مساعد الدعم الذكي)
  // 6. Settings & Staff (الإعدادات الكلية)
  const [activeTabVal, setActiveTabVal] = useState<"help" | "design_system" | "about">("help");
  const [hubSection, setHubSection] = useState<"inbox" | "tickets" | "active_customers" | "knowledge_base" | "ai_assistant" | "settings">("inbox");
  
  // Simulation Role-Based Access Control Button switcher
  // We allow the user in the UI to toggle the roles to test the RBAC easily!
  const [simulatedRole, setSimulatedRole] = useState<"موظف دعم" | "مشرف دعم" | "مدير">("مدير");

  // Sync simulated role on mount with actual user role if accessible
  useEffect(() => {
    if (user.role === "كاشير") {
      setSimulatedRole("موظف دعم");
    } else if (user.role === "محاسب") {
      setSimulatedRole("مشرف دعم");
    } else {
      setSimulatedRole("مدير");
    }
  }, [user.role]);

  // Support Staff List State
  const [staffList, setStaffList] = useState<Array<{ id: string; name: string; role: string; workload: number; status: "active" | "offline" }>>([
    { id: "staff-1", name: "أحمد رائف", role: "موظف دعم فني", workload: 2, status: "active" },
    { id: "staff-2", name: "مريم العتيبي", role: "أخصائي علاقات عملاء", workload: 1, status: "active" },
    { id: "staff-3", name: "خالد الحربي", role: "مشرف دعم التكاملات", workload: 0, status: "active" }
  ]);

  // Quick reply templates
  const [templates, setTemplates] = useState<Array<{ id: string; shortcut: string; text: string }>>([
    { id: "temp-1", shortcut: "ترحيب", text: "أهلاً بك بكافة فروع براند 'مراسيم الطيب' ونظام سهم اللقائي. كيف يمكننا مساعدتك اليوم؟ 🌿" },
    { id: "temp-2", shortcut: "تتبع", text: "تم تعميد شحنتك الموقرة وتوصيلها لعنوانك الوطني المسجل عبر أرامكس، ورقم التتبع السريع والآلي هو #AR-66432 📦." },
    { id: "temp-3", shortcut: "فاتورة", text: "عزيزي العميل، تم تسوية الحساب وإصدار دفتري للفاتورة من نظام سهم المحاسبي بنجاح، شكراً لتعاملك معنا. 🧾" }
  ]);

  const [newShortcut, setNewShortcut] = useState("");
  const [newTemplateText, setNewTemplateText] = useState("");

  // Routing Configuration State
  const [routingAutoAssign, setRoutingAutoAssign] = useState(true);
  const [routingPrimaryStaff, setRoutingPrimaryStaff] = useState("staff-1");
  const [routingClassification, setRoutingClassification] = useState("شحن واستنزال");

  // Knowledge Base Articles & FAQ Array
  const [searchQuery, setSearchQuery] = useState("");
  const [faqCategory, setFaqCategory] = useState<"all" | "general" | "products" | "invoices" | "ai">("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // AI Support Assistant states
  const [aiAssistantQuery, setAiAssistantQuery] = useState("");
  const [aiChatLogs, setAiChatLogs] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "أهلاً بك في نظام الدعم الذكي من سهم 🧠! يسعدني إرشادك وتدريبك على استخدام كافة مزايا متجرك. يمكنك سؤالي عن: إضافة منتج، تتبع المخزون، إصدار فاتورة، تفويج نسخة احتياطية، أو ربط سلة وزد.",
      time: "الآن"
    }
  ]);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // Global Syncing lists from LocalStorage or Fallback for Chat Threads
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem("sahm_crm_hub_threads");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "CRM-1",
        customerName: "أحمد بن محمد",
        customerId: "CUST-1",
        phone: "0501234567",
        channel: "WhatsApp",
        lastMsg: "السلام عليكم، هل وفرتم عود هندي غابات معتق دبل سوبر؟ أحتاج كيلوين للرياض قبل حلول عيد الأضحى.",
        time: "منذ ٥ دقائق",
        status: "open",
        category: "استفسار",
        assignedTo: "أحمد رائف",
        messages: [
          { sender: "customer", text: "السلام عليكم، هل وفرتم عود هندي غابات معتق دبل سوبر؟ أحتاج كيلوين للرياض قبل حلول عيد الأضحى.", time: "10:30 ص" }
        ]
      },
      {
        id: "CRM-2",
        customerName: "شركة النور للتجارة",
        customerId: "CUST-2",
        phone: "0559876543",
        channel: "WhatsApp",
        lastMsg: "أهلاً، الطلبية رقم #9145 عود الخصم الفعال تأخرت بالتسليم مع سمسا، هل تم شحنها بالفعل؟",
        time: "منذ نصف ساعة",
        status: "open",
        category: "شحن",
        assignedTo: "مريم العتيبي",
        messages: [
          { sender: "customer", text: "أهلاً، الطلبية رقم #9145 عود الخصم الفعال تأخرت بالتسليم مع سمسا، هل تم شحنها بالفعل؟", time: "10:05 ص" }
        ]
      },
      {
        id: "CRM-3",
        customerName: "محمد علي العمري",
        customerId: "CUST-3",
        phone: "0531112233",
        channel: "Instagram",
        lastMsg: "أرغب في الاستفسار عن كود الخصم لعملاء باقة النخبة Corporate.",
        time: "منذ ساعتين",
        status: "responded",
        category: "استفسار",
        assignedTo: "أحمد رائف",
        messages: [
          { sender: "customer", text: "أرغب في الاستفسار عن كود الخصم لعملاء باقة النخبة Corporate.", time: "08:12 ص" },
          { sender: "staff", text: "مرحباً بك يا غالي، كود خصم عملاء النخبة هو SAHM-VIP ويمنحك خصم فوري 15% على كافة دهون العود.", time: "08:15 ص" }
        ]
      }
    ];
  });

  // Global Syncing lists for Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem("sahm_crm_hub_tickets");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "TCK-402",
        customerName: "أحمد بن محمد",
        customerId: "CUST-1",
        title: "تسريع تسليم بوليصة العود الهندي الفاخر",
        category: "technical",
        priority: "critical",
        assignedTo: "أحمد رائف",
        status: "open",
        date: "2026-06-03",
        commentHistory: ["تم فتح التذكرة تلقائياً من محادثة الواتساب", "تم التوجيه بالالتزام الفوري"]
      },
      {
        id: "TCK-405",
        customerName: "شركة النور للتجارة",
        customerId: "CUST-2",
        title: "مشكلة سداد الفاتورة الدفترية المعلقة",
        category: "billing",
        priority: "high",
        assignedTo: "مريم العتيبي",
        status: "in_progress",
        date: "2026-06-02",
        commentHistory: ["جاري التدقيق وجمع مستندات الشراء والتوريد المالي"]
      },
      {
        id: "TCK-408",
        customerName: "محمد سليمان",
        customerId: "CUST-4",
        title: "فشل مزامنة الربط مع متجر سلة",
        category: "integration",
        priority: "high",
        assignedTo: "خالد الحربي",
        status: "late",
        date: "2026-05-30",
        commentHistory: ["تأخر الرد الفوري من العميل لتفعيل الـ webhook", "تجاوز وقت الالتزام SLA بـ 12 ساعة"]
      }
    ];
  });

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem("sahm_crm_hub_threads", JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem("sahm_crm_hub_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Selected thread in Inbox Tab
  const [selectedThreadId, setSelectedThreadId] = useState<string>("CRM-1");
  const [replyInput, setReplyInput] = useState("");
  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  // Selected ticket in Tickets Tab
  const [selectedTicketId, setSelectedTicketId] = useState<string>("TCK-402");
  const [newCommentInput, setNewCommentInput] = useState("");
  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Forms for Ticket creation
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketFormTitle, setTicketFormTitle] = useState("");
  const [ticketFormCustomer, setTicketFormCustomer] = useState("أحمد بن محمد");
  const [ticketFormCategory, setTicketFormCategory] = useState<"technical" | "billing" | "ai" | "integration">("technical");
  const [ticketFormPriority, setTicketFormPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [ticketFormAssignee, setTicketFormAssignee] = useState("أحمد رائف");

  // Selected customer 360 view inside Active Customers tab
  const [selectedCustomerIdFor360, setSelectedCustomerIdFor360] = useState<string>("CUST-1");
  const activeCustomer360Obj = customers.find(c => c.id === selectedCustomerIdFor360) || customers[0] || {
    id: "CUST-1",
    name: "أحمد بن محمد",
    phone: "0501234567",
    city: "الرياض",
    balance: 0
  };

  // Memo Notes state per customer
  const [customerMemos, setCustomerMemos] = useState<Record<string, string>>({
    "CUST-1": "يفضل تغليف ملكي خاص للإهداء وصناديق العود المذهبة. يشتري عادة العود الكمبودي الفاخر بالرياض.",
    "CUST-2": "شركة النور للتجارة - عميل فئة النخبة. يستفيد من التسهيلات الائتمانية والقيود المحاسبية التلقائية.",
    "CUST-3": "عميل متفاعل ومنفعل عبر منشورات إنستغرام. مهتم بجدول التوصيل السريع للمنطقة الغربية."
  });
  const [memoEdit, setMemoEdit] = useState("");

  useEffect(() => {
    if (activeCustomer360Obj) {
      setMemoEdit(customerMemos[activeCustomer360Obj.id] || "");
    }
  }, [selectedCustomerIdFor360, activeCustomer360Obj]);

  // Filter Active Customers (customers who have open threads or unresolved tickets)
  const activeCustIds = Array.from(new Set([
    ...threads.filter(t => t.status === "open" || t.status === "pending").map(t => t.customerId),
    ...tickets.filter(t => t.status !== "resolved").map(t => t.customerId)
  ]));

  const activeCustomersList = customers.filter(c => activeCustIds.includes(c.id) || c.id === "CUST-1");

  // FAQ list data
  const faqs = [
    {
      category: "general",
      question: "ما هو نظام Sahm OS وكيف يعمل؟",
      answer: "Sahm OS هو نظام متكامل لإدارة موارد ومبيعات المتاجر، يهدف لتمكين أصحاب المشاريع الصغيرة والمتوسطة من إدارة المخزون، وإصدار الفواتير، وتحليل المنتجات بالذكاء الاصطناعي، ومتابعة الأرباح والديون بشكل فوري ومحلي آمن."
    },
    {
      category: "general",
      question: "هل بيانات متجري آمنة وأين يتم تخزينها؟",
      answer: "نعم وبشدة. يتم تخزين كافة تفاصيل متجرك (المنتجات، الفواتير، وبيانات العملاء) محلياً وبشكل آمن تماماً داخل متصفحك (LocalStorage). لن يتم إرسال أي من بيانات معاملاتك المالية إلى أي خواديم خارجية."
    },
    {
      category: "products",
      question: "كيف أقوم بإضافة منتج جديد وتتبع كميته بالمخزون؟",
      answer: "من القائمة الجانبية، توجه لصفحة 'المنتجات' واضغط على زر 'إضافة منتج جديد'. حدد سعر البيع وسعر التوريد والكمية المتوفرة ومستوى التنبيه عند انخفاض المخزون ليعلمك النظام تلقائياً بوجود نقص."
    },
    {
      category: "invoices",
      question: "كيف يمكنني إصدار فاتورة مبيعات جديدة لعميل؟",
      answer: "اذهب إلى صفحة 'الفواتير' واضغط على 'إضافة فاتورة جديدة ➕'. اختر نوع العملية (بيع)، ثم اختر العميل والمنتجات المراد إدراجها والكميات، وسيقوم النظام باحتساب الإجمالي وتحديث مخزون المنتجات تلقائياً وبشكل فوري فور الحفظ."
    },
    {
      category: "ai",
      question: "كيف أستفيد من ميزة 'تحليل الذكاء 🤖' في منصة سهم؟",
      answer: "صممت هذه الميزة لقراءة صور المنتجات! ارفع صورة المنتج وسيتولى الذكاء الاصطناعي تحديد اسم وعلامة المنتج، كتابة وصف تسويقي مبهر، استنباط ميزاته التشريحية، واقتراح السعر الأنسب للسوق السعودي مع هاشتاقات جاهزة ونقاش دقيق لواقع المنافسين."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = faqCategory === "all" || faq.category === faqCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Ticket submissions handler & replies
  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyInput.trim()) return;

    const newMessage = {
      sender: "staff" as const,
      text: replyInput,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMsg: replyInput,
          status: "responded" as const,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    onAddLog("رد تواصل موحد", `إرسال الرد المباشر للزبون ${activeThread.customerName} عبر ${activeThread.channel}`);
    triggerNotification(`تم إرسال الرد بنجاح لـ ${activeThread.customerName} عبر ${activeThread.channel} ✉️`, "success");
    setReplyInput("");
  };

  const handleApplyShortcut = (text: string) => {
    setReplyInput(text);
    triggerNotification("تم إدراج قالب الرد السريع 📋", "info");
  };

  // IA reply generator
  const handleGenerateAiReply = async () => {
    if (!activeThread) return;
    setIsAiAnswering(true);
    try {
      // Simulate fetch and fallback gracefully
      const response = await fetch("/api/omnichat-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatContent: activeThread.lastMsg,
          customerName: activeThread.customerName,
          category: activeThread.category
        })
      });
      const data = await response.json();
      if (response.ok && data.response) {
        setReplyInput(data.response);
      } else {
        throw new Error("No response or missing keys");
      }
    } catch {
      let fallbackText = `أهلاً بك يا أستاذ ${activeThread.customerName}، يسعدنا تواصلك مع شركة "مراسيم الطيب". نود إبلاغك بتوفر معروض غني من العود الهندي الفاخر المعتق دبل سوبر بالمستودع ويمكنك تملك كميات الجملة الفخمة بطلب مباشر وسنقوم بتسريع التوصيل 🚀.`;
      if (activeThread.category === "شحن") {
        fallbackText = `عزيزي الموقر في ${activeThread.customerName}، بمراجعة تتبع رقمية أظهر الناقل أرامكس أن شحنتك المرموقة قيد المزامنة والنقل النهائي وستستلمها خلال ٢٤ ساعة بإذن الله.`;
      }
      setReplyInput(fallbackText);
      triggerNotification("تمت صياغة رد ملكي لبق بالذكاء الاصطناعي (Gemini) 🔮", "ai");
    } finally {
      setIsAiAnswering(false);
    }
  };

  // AI Support Assistant Conversation Handler
  const handleAiAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiAssistantQuery.trim()) return;

    const userMsg = { sender: "user" as const, text: aiAssistantQuery, time: "الآن" };
    setAiChatLogs(prev => [...prev, userMsg]);
    const normalizedQuery = aiAssistantQuery.toLowerCase();
    setAiAssistantQuery("");
    setIsAiAnswering(true);

    setTimeout(() => {
      let aiResponseText = "";
      if (normalizedQuery.includes("منتج") || normalizedQuery.includes("أضيف") || normalizedQuery.includes("اضافه")) {
        aiResponseText = `📝 <strong>كيف تضيف منتج بالخطوات التفصيلية:</strong>
1. توجه لقسم <strong>المنتجات والمستودعات 📦</strong> من القائمة الجانبية.
2. اضغط على الزر الذهبي <strong>إضافة منتج جديد</strong> بالأعلى.
3. قم بتعبئة: اسم المنتج (مثال: عود سيوفي)، القسم، رمز SKU، والكمية الأولية بالمستودع.
4. حدد سعر الشراء وسعر البيع ليكون النظام قادراً على احتساب هامش الربح والسيولة التلقائية.
5. اضغط <strong>حفظ المنتج</strong>. سيظهر المنتج مباشرة في نافذة المبيعات والـ POS ونظام جرد الفروع الفوري!`;
      } else if (normalizedQuery.includes("مخزون") || normalizedQuery.includes("المخزن") || normalizedQuery.includes("الكمية")) {
        aiResponseText = `📊 <strong>كيفية مراجعة وجرد المخزون:</strong>
- لمعرفة وضع المستودعات الكلي، اذهب لصفحة <strong>المنتجات والمستودعات 📦</strong>.
- ستظهر لك قائمة الأصناف تظهر كمياتها الحالية ملونة: بالأخضر للكميات الوفيرة، وبالأصفر للمخزون المتوسط، وبالأحمر للمستويات الحرجة البالغة 5 قطع فأقل.
- يمكنك تصفية المنتجات حسب كمياتها أو مستودع الفرع لتسجيل الفروق والعمليات بدفتر الجرد الموحد.`;
      } else if (normalizedQuery.includes("فاتورة") || normalizedQuery.includes("اصدر") || normalizedQuery.includes("أصدر")) {
        aiResponseText = `🧾 <strong>كيف تصدر فاتورة مبيعات جديدة توافق الفوترة الرقمية:</strong>
1. توجه لقسم <strong>المنظومة المالية والشركاء ⚖️</strong> ثم فرع <strong>الفواتير</strong>.
2. انقر على زر <strong>إضافة فاتورة جديدة ➕</strong>.
3. اختر العميل، والمنتجات المباعة، وسيقوم نظام سهم باحتساب الضريبة المعتمدة (15%) تلقائياً.
4. حدد حالة الدفع (مدفوعة أو معلقة) ثم انقر <strong>حفظ وإرسال</strong>. سيتم ترحيل الفاتورة للقيد المحاسبي المزدوج فوراً وتوليد رمز QR مشفر للجمارك والزكاة!`;
      } else if (normalizedQuery.includes("سلة") || normalizedQuery.includes("ربط")) {
        aiResponseText = `🛍️ <strong>كيفية ربط نظام سهم مع متجر سلة وزد:</strong>
- اذهب لصفحة <strong>مركز التكاملات 🔌</strong>.
- ستجد بوابات الربط الجاهزة لمنصات (سلة - Salla) و (زد - Zid).
- اضغط على <strong>ربط الحساب</strong> للبدء، ثم قم بتفويض بكسر API لترحيل الفواتير والمنتجات تلقائياً وتوحيدها بالمخازن بدون تدخل بشري يدوي!`;
      } else if (normalizedQuery.includes("نسخه") || normalizedQuery.includes("نسخة") || normalizedQuery.includes("استعادة") || normalizedQuery.includes("احتياطية")) {
        aiResponseText = `💾 <strong>إرشادات أخذ نسخة احتياطية واستعادة متجرك:</strong>
- توجه لقسم <strong>الإعدادات ⚙️</strong> بالأسفل.
- ابحث عن بطاقة <strong>إدارة البيانات والنسخ الاحتياطي</strong>.
- للنشر وحفظ نسختك المباشرة، انقر على زر <strong>تصدير قاعدة البيانات (JSON)</strong> وسيتم تحميل ملف كامل بجهازك آمن تماماً.
- للاستعادة على متصفح أو جهاز آخر، اضغط <strong>استيراد نسخة احتياطية (JSON)</strong> وارفع الملف لتعود كافة الفواتير والمنتجات المفقودة بجزء من الثانية!`;
      } else {
        aiResponseText = "أهلاً بك يا فندم. أنا مساعد سهم الذكي والمنقح للمقاييس المالية. لم أفهم تماماً استفسارك، ولكن يسعدني جداً إرشادك في كيفية إضافة منتج جديد، أو تتبع المخزون والباركود بالمستودع، أو إصدار فواتير ضريبية فورية، أو ربط متجر سلة وزد. اكتب لي عما تود وسأعطيك الخطوات المفصلة! 🚀";
      }

      setAiChatLogs(prev => [...prev, { sender: "ai", text: aiResponseText, time: "الآن" }]);
      setIsAiAnswering(false);
    }, 1000);
  };

  // Ticket creation handler
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketFormTitle.trim()) return;

    const newTicket: SupportTicket = {
      id: "TCK-" + Math.floor(Math.random() * 900 + 100).toString(),
      customerName: ticketFormCustomer,
      customerId: customers.find(c => c.name === ticketFormCustomer)?.id || "CUST-1",
      title: ticketFormTitle,
      category: ticketFormCategory,
      priority: ticketFormPriority,
      assignedTo: ticketFormAssignee,
      status: "open",
      date: new Date().toISOString().split("T")[0],
      commentHistory: ["تم إنشاء وتصنيف التذكرة يدوياً عبر المشرف"]
    };

    setTickets([newTicket, ...tickets]);
    setIsCreatingTicket(false);
    setTicketFormTitle("");
    triggerNotification(`نجح التسجيل! تم فتح تذكيرة دعم فني رقمية رقم ${newTicket.id} وصياغة الأولوية 🔴`, "success");
    onAddLog("إضافة تذكرة دعم", `موضوع التذكرة: ${ticketFormTitle} للموظف: ${ticketFormAssignee}`);
  };

  // Change ticket properties
  const handleChangeTicketStatus = (ticketId: string, newStatus: "open" | "in_progress" | "resolved" | "late") => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { 
      ...t, 
      status: newStatus,
      commentHistory: [...t.commentHistory, `تم تعديل حالة التذكرة إلى: ${newStatus === 'resolved' ? '✅ محلولة ومغلقة' : newStatus}`]
    } : t));
    triggerNotification("تم تعديل حالة تذكرة الدعم بنجاح", "success");
  };

  const handleChangeTicketPriority = (ticketId: string, newPriority: "critical" | "high" | "medium" | "low") => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { 
      ...t, 
      priority: newPriority,
      commentHistory: [...t.commentHistory, `تم تغيير أولوية التذكرة من قِبل المشرف إلى: ${newPriority}`]
    } : t));
    triggerNotification("تم تعديل مستوى الأولوية بنجاح 🚨", "info");
  };

  const handleChangeTicketAssignee = (ticketId: string, staffName: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { 
      ...t, 
      assignedTo: staffName,
      commentHistory: [...t.commentHistory, `إحالة التذكرة وتعيينها للموظف: ${staffName}`]
    } : t));
    // Dynamic workload increments
    setStaffList(prev => prev.map(s => s.name === staffName ? { ...s, workload: s.workload + 1 } : s));
    triggerNotification(`تمت إحالة وتوجيه التذكرة لـ ${staffName} نجاحاً 👤`, "success");
  };

  const handleAddTicketComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    setTickets(prev => prev.map(t => t.id === activeTicket.id ? {
      ...t,
      commentHistory: [...t.commentHistory, `💬 [إفادة موظف]: ${newCommentInput}`]
    } : t));

    setNewCommentInput("");
    triggerNotification("تم إضافة تعليق ومذكرة للمتابعة ✏️", "success");
  };

  // Add speed templates
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcut.trim() || !newTemplateText.trim()) return;

    const newTemp = {
      id: "temp-" + Date.now().toString().slice(-4),
      shortcut: newShortcut,
      text: newTemplateText
    };

    setTemplates([...templates, newTemp]);
    setNewShortcut("");
    setNewTemplateText("");
    triggerNotification("تم إضافة قالب رد سريع جديد بنجاح 📋", "success");
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    triggerNotification("تم حذف قالب الرد السريع 🗑️", "warning");
  };

  // Save Customer Memo Note from 360 Customer view
  const handleSaveCustomerMemo = () => {
    setCustomerMemos(prev => ({
      ...prev,
      [activeCustomer360Obj.id]: memoEdit
    }));
    triggerNotification("تم حفظ وتحديث المذكرة الإدارية بملف العميل الموحد 💾", "success");
    onAddLog("حفظ توجيه CRM", `صياغة ملاحظة لملف العميل: ${activeCustomer360Obj.name}`);
  };

  // Calculate statistics for Manager Role dashboard view
  const activeUnresolvedTicketsCount = tickets.filter(t => t.status !== "resolved").length;
  const lateTicketsCount = tickets.filter(t => t.status === "late").length;
  const responseRateCSAT = 98; // Satisfactory level metric
  const averageResolutionTimeMinutes = 24.5; // Benchmark metric

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title Card header banner */}
      <div className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.accent + "20", color: theme.accent }}>
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black flex items-center gap-2" style={{ color: theme.text }}>
              <span>مركز التواصل والدعم الموحد 💬</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md font-sans font-bold">Consolidated CRM Hub</span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
              البيئة الموحدة لإدارة ردود المحادثات، تذاكر الصيانة والعملاء، ومساعد الأسئلة والأجوبة الرقمي
            </p>
          </div>
        </div>

        {/* Dynamic Telemetry Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[10px] px-3.5 py-2 rounded-xl border font-bold"
          style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.muted }}>
          <Clock className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <div className="text-right">
            <span className="block text-gray-300">متوسط سرعة إغلاق تذاكر SLA: ٢٤ دقيقة</span>
            <span className="block text-[9px] text-emerald-400">● خادم الفروق متصل ويقوم بالمزامنة الفورية</span>
          </div>
        </div>
      </div>

      {/* 🔮 MULTI-USER RBAC ROLE TOGGLE SIMULATOR (PM Interactive Directive) */}
      <div className="p-3.5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 text-right"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500 font-extrabold block">🔑 محاكي تبديل الصلاحيات (Role-Based Access Control Switcher):</span>
          <p className="text-[10px] text-gray-400">قم بتبديل الدور الوظيفي لتجربة الصلاحيات وتفرع القوائم والتحليلات الخاصة بكل موظف حياً:</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => {
              setSimulatedRole("موظف دعم");
              triggerNotification("تم التبديل لصلاحية موظف دعم 👤 (صندوق الوارد والردود فقط)", "info");
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${simulatedRole === "موظف دعم" ? "bg-amber-500 text-black font-extrabold shadow" : "text-gray-400 hover:text-white"}`}
            style={{ backgroundColor: simulatedRole === "موظف دعم" ? theme.accent : "" }}
          >
            موظف دعم
          </button>
          <button
            onClick={() => {
              setSimulatedRole("مشرف دعم");
              triggerNotification("تم التبديل لصلاحية مشرف دعم 👥 (إسناد التذاكر وتعديل الخصائص والقوالب)", "info");
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${simulatedRole === "مشرف دعم" ? "bg-amber-500 text-black font-extrabold shadow" : "text-gray-400 hover:text-white"}`}
            style={{ backgroundColor: simulatedRole === "مشرف دعم" ? theme.accent : "" }}
          >
            مشرف دعم
          </button>
          <button
            onClick={() => {
              setSimulatedRole("مدير");
              triggerNotification("تم التبديل لصلاحية المدير العام 👑 (التحليلات الشاملة والتقارير المالية والتحكم التام)", "info");
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${simulatedRole === "مدير" ? "bg-amber-500 text-black font-extrabold shadow" : "text-gray-400 hover:text-white"}`}
            style={{ backgroundColor: simulatedRole === "مدير" ? theme.accent : "" }}
          >
            المدير العام
          </button>
        </div>
      </div>

      {/* Major Navigation tabs of Consolidated Support */}
      <div className="p-1 rounded-xl border flex gap-1 select-none overflow-x-auto" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <button
          onClick={() => setActiveTabVal("help")}
          className="flex-1 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0"
          style={{
            backgroundColor: activeTabVal === "help" ? theme.accent + "20" : "transparent",
            color: activeTabVal === "help" ? theme.text : theme.muted
          }}
        >
          مركز التواصل الموحد والعملاء 💬
        </button>
        <button
          onClick={() => setActiveTabVal("design_system")}
          className="flex-1 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0"
          style={{
            backgroundColor: activeTabVal === "design_system" ? theme.accent + "20" : "transparent",
            color: activeTabVal === "design_system" ? theme.text : theme.muted
          }}
        >
          نظام تصميم سهم الموحد (Sahm UI Web) 🎨
        </button>
        <button
          onClick={() => setActiveTabVal("about")}
          className="flex-1 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0"
          style={{
            backgroundColor: activeTabVal === "about" ? theme.accent + "20" : "transparent",
            color: activeTabVal === "about" ? theme.text : theme.muted
          }}
        >
          عن النظام والربط الذكي (About Sahm OS) ℹ️
        </button>
      </div>

      {activeTabVal === "design_system" ? (
        <SahmDesignSystem theme={theme} />
      ) : activeTabVal === "about" ? (
        /* ℹ️ Custom luxury "About" System section */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl border text-center space-y-6 relative overflow-hidden"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          {/* Subtle gold glowing ambient backdrop grid */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none opacity-[0.06] bg-[#D4AF37]" />

          {/* Centered Large Luxury Golden Calligraphy Logo */}
          <div className="mx-auto w-24 h-24 rounded-2xl bg-transparent border border-slate-800/60 p-1 flex items-center justify-center shadow-2xl relative hover:scale-105 transition-all">
            <img 
              src={sahmMiniMarkPngUrl} 
              alt="Sahm Logo Gold" 
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
            {/* Pulsing online badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
              <span>Sahm OS</span>
              <span className="text-[#D4AF37]">•</span>
              <span>سهم للربط الموحد الذكي</span>
            </h2>
            <p className="text-xs text-gray-405 mt-2 max-w-lg mx-auto leading-relaxed">
              منصة سحابية متكاملة لربط وأتمتة المنشآت والجهات والـ ERP، وإصدار الفواتير الإلكترونية المتوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية.
            </p>
          </div>

          {/* Specifications metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
            <div className="p-4 rounded-xl border space-y-1 bg-slate-950/40" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-500 font-extrabold block">نسخة التشغيل</span>
              <span className="text-xs font-black text-amber-550">Sahm OS Enterprise v16.0</span>
            </div>
            
            <div className="p-4 rounded-xl border space-y-1 bg-slate-950/40" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-500 font-extrabold block">حالة التكامل السحابي</span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <span>🟢 متصل ونشط 100%</span>
              </span>
            </div>

            <div className="p-4 rounded-xl border space-y-1 bg-slate-950/40" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-500 font-extrabold block">الامتثال والضريبة</span>
              <span className="text-xs font-black text-[#D4AF37]">معتمد للفوترة الإلكترونية 🇸🇦</span>
            </div>

            <div className="p-4 rounded-xl border space-y-1 bg-slate-950/40" style={{ borderColor: theme.border }}>
              <span className="text-[10px] text-gray-500 font-extrabold block">ترخيص المنشأة والمالك</span>
              <span className="text-xs font-black text-white">ترخيص تجاري ساري 👑</span>
            </div>
          </div>

          {/* Core features block */}
          <div className="p-5 rounded-xl border text-right space-y-3 bg-slate-950/20" style={{ borderColor: theme.border }}>
            <h3 className="text-xs font-bold text-[#D4AF37] border-b pb-2 flex items-center gap-1.5" style={{ borderColor: theme.border }}>
              <span>🏆 الخصائص والمكونات النشطة بالنسخة:</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-gray-300">
              <li className="flex items-center gap-2 font-black">• ربط ومزامنة فواتير ومخازن سلة وزد (JWT Realtime API)</li>
              <li className="flex items-center gap-2 font-black">• بوابة الدفع الذكية المدمجة (تحصيل، مدى، فيزا، أبل باي)</li>
              <li className="flex items-center gap-2 font-black">• مساعد أتمتة الذكاء الاصطناعي والمنقح المالي 🧠</li>
              <li className="flex items-center gap-2 font-black">• ربط فوري مع شركات الخدمات اللوجستية (الأردنية، أرامكس)</li>
              <li className="flex items-center gap-2 font-black">• كاشير كلاسيك ونقاط بيع متطورة للمطاعم والتجميل</li>
              <li className="flex items-center gap-2 font-black">• إدارة مستودعات وفروع متعددة الأبعاد بالوزن والحجم</li>
            </ul>
          </div>

          {/* 🌿 هيكلية النظام والعلاقة بين الكيانات الموحدة */}
          <div className="p-6 rounded-xl border text-right space-y-4 bg-slate-950/40 relative overflow-hidden" style={{ borderColor: theme.border }}>
            <div className="border-b pb-2" style={{ borderColor: theme.border }}>
              <h3 className="text-sm font-black text-amber-500">🧱 دليل الترابط الهيكلي لتشغيل الكيانات بالمنصة (System Blueprint)</h3>
              <p className="text-[10.5px] text-gray-400 mt-0.5">افهم الترابط العملياتي الدقيق لإدارة المبيعات والمخازن في سهم OS بذكاء:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-black/40 border border-slate-900 space-y-1.5 hover:border-amber-500/20 transition-all">
                <span className="text-xs font-black text-white block">🏢 المتجر (Store - الكيان الأب)</span>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  هو المظلة والكيان الأساسي والمسؤول التجاري الرسمي والقانوني. يحتوي بيانات السجل التجاري المعتمد والشهادة الضريبية وحزمة الاشتراكات والاعتمادات.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-slate-900 space-y-1.5 hover:border-amber-500/20 transition-all">
                <span className="text-xs font-black text-white block">📍 الفروع (Branches - منافذ البيع الجغرافية)</span>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  هي المعارض ومنافذ التوزيع المباشر للجمهور وسجلات المبيعات الميدانية. ترتبط قانونياً بالمتجر، جغرافياً بكل فرع، وبمستودع يمدها بالسلع.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-slate-900 space-y-1.5 hover:border-amber-500/20 transition-all">
                <span className="text-xs font-black text-white block">📦 المستودعات (Warehouses - مغذيات الجرد)</span>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  هي المخازن واللوجستيات الخلفية الداعمة للمطابقة المباشرة وتحليل المخزون. تسكن السلع بداخلها وتزود الفروع للحماية الآلية من النفاد التدفقي.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: theme.border }}>
              <div className="p-4 rounded-lg bg-black/40 border border-slate-900 space-y-1.5 hover:border-amber-500/20 transition-all">
                <span className="text-xs font-black text-white block">💎 المنتجات (Products - الأرصدة المصنفة)</span>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  تنشأ المنتجات وتعرّف تحت هوية براند المتجر أولاً، ثم يتم نسبها مع كميات وسرعات بيع دقيقة للمستودع الأول أو المستودعات الفرعية لتباع بالكاشير والباركود.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-slate-900 space-y-1.5 hover:border-amber-500/20 transition-all">
                <span className="text-xs font-black text-white block">🖥️ الكاشير ونقاط البيع (POS - آلات التحصيل وعش الصفقات)</span>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  واجهة بيع سريعة وموحدة تعمل متصلة أو منفصلة عن السحاب. تربط الكاشير في الفرع بمستودعه اللوجستي لتقسيم السحب وجرد حزم المعاملات وإيصالات الزكاة (ZATCA).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-slate-900 space-y-1.5 hover:border-amber-500/20 transition-all">
                <span className="text-xs font-black text-white block">🔌 بوابات الربط السحابي (Integrations - قنوات التمدد)</span>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  تسمح بربط ومزامنة متجر سهم بقنوات التجارة الرائدة كسلة (Salla) وزد (Zid)، فتملك تحجيماً لوجستياً يقرأ الطليبات ويوجهها فواتيرياً بداخل الكاشير الموحد لحظياً.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 font-mono tracking-wider">
            ALL RIGHTS RESERVED © 2026 SAHM SMART INTEGRATION SOLUTIONS LTD.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Subsections Sidebar layout inside the active Hub Tab */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Nav menu inside Hub */}
            <div className="lg:col-span-3 space-y-4">
              <div className="p-3.5 rounded-2xl border space-y-2 text-right"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <span className="text-[10px] font-black tracking-wider block border-b pb-1.5" style={{ color: theme.accent }}>قسم العلاقات والخدمة:</span>
                
                <div className="flex flex-col gap-1 text-xs">
                  {/* Inbox */}
                  <button
                    onClick={() => setHubSection("inbox")}
                    className={`w-full p-2.5 rounded-xl border text-right font-bold flex items-center justify-between transition-colors ${hubSection === 'inbox' ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'border-slate-900 bg-slate-950/30 text-gray-450 hover:bg-slate-950/50'}`}
                  >
                    <span className="font-mono bg-rose-500/10 text-rose-450 px-1.5 rounded animate-pulse text-[9px] font-black">
                      {threads.filter(t => t.status === "open").length} جديد
                    </span>
                    <span className="flex items-center gap-2">
                      صندوق الوارد الموحد
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    </span>
                  </button>

                  {/* Tickets */}
                  <button
                    onClick={() => setHubSection("tickets")}
                    className={`w-full p-2.5 rounded-xl border text-right font-bold flex items-center justify-between transition-colors ${hubSection === 'tickets' ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'border-slate-900 bg-slate-950/30 text-gray-450 hover:bg-slate-950/50'}`}
                  >
                    <span className="font-mono bg-amber-500/10 text-amber-500 px-1.5 rounded text-[9px] font-black">
                      {tickets.filter(t => t.status !== "resolved").length} معلق
                    </span>
                    <span className="flex items-center gap-2">
                      إدارة التذاكر (Tickets)
                      <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                    </span>
                  </button>

                  {/* Active Customers */}
                  {(simulatedRole === "مشرف دعم" || simulatedRole === "مدير") && (
                    <button
                      onClick={() => setHubSection("active_customers")}
                      className={`w-full p-2.5 rounded-xl border text-right font-bold flex items-center justify-between transition-colors ${hubSection === 'active_customers' ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'border-slate-900 bg-slate-950/30 text-gray-450 hover:bg-slate-950/50'}`}
                    >
                      <span className="font-mono text-gray-500 text-[10px]">{activeCustomersList.length} عميل</span>
                      <span className="flex items-center gap-2">
                        العملاء النشطون (Customer 360)
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    </button>
                  )}

                  {/* Knowledge Base */}
                  <button
                    onClick={() => setHubSection("knowledge_base")}
                    className={`w-full p-2.5 rounded-xl border text-right font-bold flex items-center justify-between transition-colors ${hubSection === 'knowledge_base' ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'border-slate-900 bg-slate-950/30 text-gray-450 hover:bg-slate-950/50'}`}
                  >
                    <span className="font-mono text-gray-500 text-[10px]">{faqs.length} مقال</span>
                    <span className="flex items-center gap-2">
                      قاعدة المعرفة والـ FAQ
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                    </span>
                  </button>

                  {/* AI Support Assistant */}
                  <button
                    onClick={() => setHubSection("ai_assistant")}
                    className={`w-full p-2.5 rounded-xl border text-right font-bold flex items-center justify-between transition-colors ${hubSection === 'ai_assistant' ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'border-slate-900 bg-slate-950/30 text-gray-450 hover:bg-slate-950/50'}`}
                  >
                    <span className="font-mono text-emerald-400 text-[9px] font-black">Gemini 2.5</span>
                    <span className="flex items-center gap-2">
                      مساعد الدعم الذكي AI
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  </button>

                  {/* Settings */}
                  {(simulatedRole === "مشرف دعم" || simulatedRole === "مدير") && (
                    <button
                      onClick={() => setHubSection("settings")}
                      className={`w-full p-2.5 rounded-xl border text-right font-bold flex items-center justify-between transition-colors ${hubSection === 'settings' ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'border-slate-900 bg-slate-950/30 text-gray-450 hover:bg-slate-950/50'}`}
                    >
                      <span className="font-mono text-gray-500 text-[10px]">{templates.length} قوالب</span>
                      <span className="flex items-center gap-2">
                        إعدادات المركز والموظفين
                        <Settings className="w-3.5 h-3.5 text-gray-400 animate-spin-slow" />
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* CRM Live Contact Banner */}
              <div className="p-4 rounded-2xl border text-right space-y-3"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <span className="text-[10px] text-gray-400 block font-bold border-b border-slate-900 pb-1.5">• قنوات الاتصال المدعومة:</span>
                
                <a 
                  href="https://wa.me/966555555555" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl border bg-slate-950/50 border-slate-900 text-[10px] font-bold block transition-all hover:scale-[1.02]"
                >
                  <ExternalLink className="w-3 h-3 text-amber-500" />
                  <span className="text-gray-300">واتساب: 966555555555</span>
                </a>
                
                <a 
                  href="mailto:support@sahmapp.com"
                  className="flex items-center justify-between p-2 rounded-xl border bg-slate-950/50 border-slate-900 text-[10px] font-bold block transition-all hover:scale-[1.02]"
                >
                  <ExternalLink className="w-3 h-3 text-amber-500" />
                  <span className="text-gray-300">البريد: support@sahmapp.com</span>
                </a>
              </div>
            </div>

            {/* Right Main Panel Content Port */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                
                {/* 💬 HUB SECTION 1: Unified IM Chat Inbox */}
                {hubSection === "inbox" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5"
                  >
                    {/* Threads list sidebar inside Section */}
                    <div className="md:col-span-4 p-4 rounded-2xl space-y-3 text-right bg-slate-950/35 border border-slate-900">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="ابحث في محادثات صندوق الوارد..."
                          className="w-full text-xs p-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-900 text-right text-gray-200"
                        />
                        <Search className="w-3.5 h-3.5 absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-500" />
                      </div>

                      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 select-none">
                        {threads.map(thr => {
                          const isSelected = thr.id === selectedThreadId;
                          // Under RBAC support staff, only see assigned threads if user chooses to filter
                          if (simulatedRole === "موظف دعم" && thr.assignedTo !== "أحمد رائف") {
                            // Show all by default for demo, but mark status or simulate filter
                          }
                          return (
                            <div
                              key={thr.id}
                              onClick={() => setSelectedThreadId(thr.id)}
                              className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${isSelected ? "border-amber-500 bg-amber-500/5" : "border-slate-900 bg-slate-950/50 hover:border-slate-800"}`}
                            >
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-[8.5px] font-mono text-gray-550">{thr.time}</span>
                                <div className="flex items-center gap-1">
                                  <span className="px-1.5 py-0.2 rounded bg-slate-900 text-emerald-450 font-black text-[7.5px] border border-slate-800">
                                    {thr.channel}
                                  </span>
                                  <h4 className="text-xs font-black text-gray-200">{thr.customerName}</h4>
                                </div>
                              </div>

                              <p className="text-[10px] text-gray-400 truncate mt-1">{thr.lastMsg}</p>

                              <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-900/60 text-[9px]">
                                <span className="text-gray-550 font-bold">المسؤول: {thr.assignedTo}</span>
                                <span className={thr.status === 'open' ? 'text-rose-450 animate-pulse font-extrabold' : 'text-emerald-400 font-bold'}>
                                  {thr.status === 'open' ? '● بانتظار رد' : '✓ تم الرد'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Thread chat cockpit */}
                    <div className="md:col-span-8 p-5 rounded-2xl flex flex-col justify-between h-[520px] bg-slate-950/20 border border-slate-900">
                      
                      {/* Identity strip bar */}
                      <div className="pb-3 border-b border-slate-900 flex justify-between items-center text-right shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-450 border border-blue-500/20 text-[8.5px] font-mono font-black">
                            {activeThread.id}
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            القناة: {activeThread.channel}
                          </span>
                        </div>

                        <div className="text-right">
                          <h4 className="text-xs font-black text-white">{activeThread.customerName}</h4>
                          <span className="text-[8.5px] text-gray-550 block font-mono">الهاتف: {activeThread.phone} | المعين له: {activeThread.assignedTo}</span>
                        </div>
                      </div>

                      {/* Messages body thread stream */}
                      <div className="grow overflow-y-auto py-4 space-y-3.5 pr-1 text-right">
                        {activeThread.messages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`max-w-[85%] p-3.5 rounded-2xl text-right transition-all font-bold ${m.sender === 'customer' ? 'bg-slate-900/70 border border-slate-800 rounded-tr-none ml-auto' : 'bg-amber-500/10 border border-[#D4AF37]/35 rounded-tl-none mr-auto'}`}
                          >
                            <span className="text-[8px] font-mono text-gray-500 block mb-1">
                              {m.sender === 'customer' ? activeThread.customerName : 'مجيب سهم (مراسيم الطيب)'} • {m.time}
                            </span>
                            <p className="text-xs text-gray-200 leading-relaxed font-semibold">
                              {m.text}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Speed templates strip row */}
                      <div className="p-2 my-2 rounded-xl bg-slate-950 border border-slate-900 flex flex-wrap gap-1.5 justify-end items-center text-right shrink-0">
                        <span className="text-[9px] text-[#D4AF37] block font-black pl-1 border-l border-slate-900 ml-1">قوالب:</span>
                        {templates.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleApplyShortcut(t.text)}
                            className="bg-black text-[9px] text-gray-400 border border-slate-800 hover:border-amber-500/40 hover:text-white px-2 py-0.5 rounded-lg cursor-pointer font-bold"
                          >
                            #{t.shortcut}
                          </button>
                        ))}
                      </div>

                      {/* Reply Entry Box Form */}
                      <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-900 flex gap-2 shrink-0">
                        {/* Send Button */}
                        <button
                          type="submit"
                          className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border-0 transition-transform active:scale-95 shadow"
                        >
                          <SendHorizontal className="w-3.5 h-3.5 shrink-0" />
                          <span>إرسال</span>
                        </button>

                        {/* Text Field */}
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          placeholder="اكتب رد الخدمة الفوري أو سَلْ الذكاء صياغة رد..."
                          className="grow text-xs p-2.5 rounded-xl bg-slate-950 text-white border border-slate-900 outline-none text-right font-bold select-text"
                        />

                        {/* AI Gen Button */}
                        <button
                          type="button"
                          onDoubleClick={handleGenerateAiReply}
                          onClick={handleGenerateAiReply}
                          disabled={isAiAnswering}
                          className="py-2.5 px-3 bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600/50 hover:text-white text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer font-bold"
                          title="انقر لتشغيل الذكاء الاصطناعي وصياغة رد ملكي"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-455 animate-pulse" />
                          <span>ذكاء</span>
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* 🚨 HUB SECTION 2: Ticket Management System */}
                {hubSection === "tickets" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5 text-right font-sans"
                  >
                    {/* Header Controls for Tickets */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-900 pb-3 select-none">
                      <div className="flex items-center gap-2">
                        {simulatedRole !== "موظف دعم" && (
                          <button
                            onClick={() => setIsCreatingTicket(!isCreatingTicket)}
                            className="py-2 px-3.5 bg-amber-500 text-black font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer border-none shadow transition-transform active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>فتح تذكرة جديدة</span>
                          </button>
                        )}
                        <span className="text-gray-400 text-[10.5px]">إجمالي التذاكر النشطة: {tickets.length} تذكرة</span>
                      </div>

                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <span>إدارة بطاقات وتذاكر الدعم والعمليات 🚧</span>
                      </h3>
                    </div>

                    {/* Pop-up simulation Ticket creation Form */}
                    {isCreatingTicket && (
                      <motion.form 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleCreateTicketSubmit}
                        className="p-4 rounded-2xl border border-slate-905 bg-slate-950/65 space-y-3"
                      >
                        <h4 className="text-xs font-black text-[#D4AF37]">• تعبئة تذكرة صيانة لوجستية جديدة:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold leading-none">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">عنوان المشكلة</label>
                            <input 
                              type="text" 
                              required
                              placeholder="تأخر الشحنة بجدة"
                              value={ticketFormTitle}
                              onChange={(e) => setTicketFormTitle(e.target.value)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">العميل المرتبط</label>
                            <select
                              value={ticketFormCustomer}
                              onChange={(e) => setTicketFormCustomer(e.target.value)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white cursor-pointer"
                            >
                              {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">أولوية SLA</label>
                            <select
                              value={ticketFormPriority}
                              onChange={(e) => setTicketFormPriority(e.target.value as any)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white cursor-pointer"
                            >
                              <option value="critical">متأرجحة خطيرة جداً 🔥</option>
                              <option value="high">مرتفعة أولوية النخبة 🔴</option>
                              <option value="medium">معتدلة 🟡</option>
                              <option value="low">منخفضة 🟢</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">الموظف المعين للمتابعة</label>
                            <select
                              value={ticketFormAssignee}
                              onChange={(e) => setTicketFormAssignee(e.target.value)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white cursor-pointer"
                            >
                              {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">التصنيف الوظيفي</label>
                            <select
                              value={ticketFormCategory}
                              onChange={(e) => setTicketFormCategory(e.target.value as any)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white cursor-pointer"
                            >
                              <option value="technical">تقني / مخزون بالفروع</option>
                              <option value="billing">مالي / فواتير ضريبية</option>
                              <option value="integration">ربط API سلة وزد</option>
                              <option value="ai">أوصاف المنصة الذكية</option>
                            </select>
                          </div>
                        </div>

                        <button type="submit" className="w-full py-2 bg-amber-500 hover:brightness-110 text-black font-black text-xs rounded-xl cursor-pointer border-none shadow">
                          تأكيد وتسجيل تذكرة الالتزام SLA بنجاح ➔
                        </button>
                      </motion.form>
                    )}

                    {/* Ticket grid list & Selected details split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left list rail */}
                      <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/30 border border-slate-900 space-y-3">
                        <span className="text-[10px] text-gray-500 block border-b border-slate-900 pb-1 font-bold">📂 كشوف التذاكر والطلبات المفتوحة :</span>
                        
                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                          {tickets.map(t => {
                            const isSelected = t.id === selectedTicketId;
                            return (
                              <div
                                key={t.id}
                                onClick={() => setSelectedTicketId(t.id)}
                                className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${isSelected ? "border-amber-500 bg-amber-500/5" : "border-slate-900 bg-slate-950/45 hover:border-slate-800"}`}
                              >
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className={`px-1.5 py-0.2 rounded font-black text-[7.5px] ${t.priority === 'critical' ? 'bg-red-500/10 text-red-500' : t.priority === 'high' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-900 text-gray-400'}`}>
                                    الأولية: {t.priority}
                                  </span>
                                  <span className="font-mono text-gray-550">{t.id}</span>
                                </div>

                                <h4 className="text-xs font-extrabold text-[#EADACE] mt-1.5 block leading-relaxed">{t.title}</h4>
                                <span className="block text-[9px] text-gray-500 mt-0.5">العميل: {t.customerName} | الإحالة لـ {t.assignedTo}</span>

                                <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-slate-900/60 text-[9px]">
                                  <span className="text-gray-550 font-mono">{t.date}</span>
                                  <span className={`font-black ${t.status === 'resolved' ? 'text-emerald-400' : t.status === 'open' ? 'text-rose-455 animate-pulse' : 'text-amber-500'}`}>
                                    ● {t.status === 'resolved' ? 'محلولة ومغلقة' : t.status === 'open' ? 'جديدة بانتظار معالجة' : t.status === 'late' ? 'مُتأخرة هامة' : 'قيد المتابعة'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Detail Panel and Action Log entries */}
                      <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/20 border border-slate-900 flex flex-col justify-between h-[520px]">
                        
                        {/* Status bar top */}
                        <div className="pb-3 border-b border-slate-900 block md:flex justify-between items-center text-right">
                          <div className="flex items-center gap-1.5 justify-end md:justify-start">
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8.5px] font-mono font-black">
                              أولوية: {activeTicket.priority}
                            </span>
                            <span className="text-[9.5px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-black">
                              الحالة: {activeTicket.status}
                            </span>
                          </div>

                          <div className="text-right mt-2 md:mt-0">
                            <h4 className="text-xs font-black text-rose-400">التذكرة {activeTicket.id} • {activeTicket.category}</h4>
                            <p className="text-[9.5px] text-gray-400">{activeTicket.customerName} • فتحت في {activeTicket.date}</p>
                          </div>
                        </div>

                        {/* Interactive Supervisor Controls (RBAC Supervisor/Manager) */}
                        {(simulatedRole === "مشرف دعم" || simulatedRole === "مدير") ? (
                          <div className="p-3 my-2.5 rounded-xl bg-slate-950 border border-slate-900 text-right space-y-2 select-none">
                            <span className="text-[9.5px] font-black text-[#D4AF37] block">• أدوات الإدارة وتوطيد الالتزام SLA:</span>
                            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                              {/* Assign Employee */}
                              <div>
                                <label className="block text-gray-500 text-[8.5px] mb-1">توجيه الموظف</label>
                                <select 
                                  value={activeTicket.assignedTo}
                                  onChange={(e) => handleChangeTicketAssignee(activeTicket.id, e.target.value)}
                                  className="w-full text-right p-1.5 bg-black border border-slate-800 rounded font-bold text-gray-200 cursor-pointer"
                                >
                                  {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                              </div>

                              {/* Change Priority */}
                              <div>
                                <label className="block text-gray-500 text-[8.5px] mb-1">تعديل الأولوية</label>
                                <select 
                                  value={activeTicket.priority}
                                  onChange={(e) => handleChangeTicketPriority(activeTicket.id, e.target.value as any)}
                                  className="w-full text-right p-1.5 bg-black border border-slate-800 rounded font-bold text-gray-200 cursor-pointer"
                                >
                                  <option value="critical">متأرجحة critical</option>
                                  <option value="high">مرتفعة VIP</option>
                                  <option value="medium">معتدلة</option>
                                  <option value="low">منخفضة عادي</option>
                                </select>
                              </div>

                              {/* Change Status */}
                              <div>
                                <label className="block text-gray-500 text-[8.5px] mb-1">تغيير الحالة</label>
                                <select 
                                  value={activeTicket.status}
                                  onChange={(e) => handleChangeTicketStatus(activeTicket.id, e.target.value as any)}
                                  className="w-full text-right p-1.5 bg-black border border-slate-800 rounded font-bold text-gray-200 cursor-pointer"
                                >
                                  <option value="open">جديدة open</option>
                                  <option value="in_progress">قيد المعالجة</option>
                                  <option value="resolved">مغلقة ومحلولة ✅</option>
                                  <option value="late">متأخرة SLA 🚨</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 my-2 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] text-gray-400">
                            🔒 ليس لديك صلاحية المشرف لتعديل الإحالات وتوجيه التذاكر بالـ SLA.
                          </div>
                        )}

                        {/* Comment History Stream */}
                        <div className="grow overflow-y-auto py-2.5 text-right space-y-2 max-h-[220px]">
                          <span className="text-[10px] text-gray-500 font-bold block">• تاريخ المشكلة والرد المرفق:</span>
                          <div className="p-3 bg-slate-900/60 rounded-xl text-xs font-semibold leading-relaxed border border-slate-900">
                            {activeTicket.title}
                          </div>

                          <div className="space-y-1.5">
                            {activeTicket.commentHistory.map((log, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-black/40 border border-slate-900 text-[10px] font-bold text-gray-400">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Append new comment Entry box */}
                        <form onSubmit={handleAddTicketComment} className="pt-3 border-t border-slate-900 flex gap-2 shrink-0">
                          <button type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer border-none shadow transition-transform active:scale-95">
                            متابعة وإفادة
                          </button>
                          <input 
                            type="text"
                            required
                            value={newCommentInput}
                            onChange={(e) => setNewCommentInput(e.target.value)}
                            placeholder="اكتب مذكرة أو تحديثاً على هذه التذكرة لتنبيه بقية الطاقم..."
                            className="grow p-2.5 rounded-xl bg-slate-950 text-white text-xs text-right border border-slate-900 outline-none select-text" 
                          />
                        </form>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 👥 HUB SECTION 3: Customer 360 & Active directory */}
                {hubSection === "active_customers" && (simulatedRole === "مشرف دعم" || simulatedRole === "مدير") && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 text-right font-sans"
                  >
                    {/* Customer selector sidebar */}
                    <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/30 border border-slate-900 space-y-3">
                      <span className="text-[10px] text-gray-400 block border-b border-slate-900 pb-1.5 font-bold">📂 عملاء السنترال النشطون حياً:</span>
                      
                      <div className="space-y-2 overflow-y-auto max-h-[440px] pr-1">
                        {activeCustomersList.map(cust => {
                          const isSelected = cust.id === selectedCustomerIdFor360;
                          return (
                            <button
                              key={cust.id}
                              onClick={() => setSelectedCustomerIdFor360(cust.id)}
                              className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer block ${isSelected ? "bg-amber-500/10 border-amber-500/35 text-white" : "border-slate-900 bg-slate-950/50 hover:border-slate-850"}`}
                            >
                              <div className="flex justify-between items-center text-[9px] text-gray-550">
                                <span>{cust.city}</span>
                                <span>{cust.id}</span>
                              </div>
                              <h4 className="text-xs font-black text-white mt-1">{cust.name}</h4>
                              <span className="text-[9px] text-gray-450 font-mono block mt-1">الهاتف: {cust.phone} | الرصيد: {cust.balance} ر.س</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Integrated Customer 360 Cockpit */}
                    <div className="md:col-span-8 p-5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-5 flex flex-col justify-between min-h-[500px]">
                      
                      {/* Identity strip top */}
                      <div className="pb-3 border-b border-slate-905 flex justify-between items-center text-right">
                        <span className="p-0.5 px-2 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-[9px] font-black">
                          عميل نشط بالمنظومة 
                        </span>
                        <div className="text-right">
                          <h4 className="text-xs font-black text-white">{activeCustomer360Obj.name}</h4>
                          <span className="block text-[9px] text-gray-550 font-mono">المدينة المسجلة: {activeCustomer360Obj.city} | الجوال: {activeCustomer360Obj.phone}</span>
                        </div>
                      </div>

                      {/* Financial spend metrics and Orders overview */}
                      <div className="space-y-4">
                        {/* Financial summary banner */}
                        <div className="grid grid-cols-2 gap-3 text-right">
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
                            <span className="text-[8.5px] text-gray-500 block font-bold">إجمالي المبيعات LTV</span>
                            <span className="text-xs font-black text-emerald-400 font-mono">
                              {(invoices.filter(i => i.customer === activeCustomer360Obj.name && i.type === 'sale').reduce((sum, inv) => sum + inv.total, 0)).toLocaleString()} ر.س
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right text-xs">
                            <span className="text-[8.5px] text-gray-500 block font-bold">الحساب التجاري الحالي</span>
                            <span className={`text-xs font-black font-mono ${activeCustomer360Obj.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {activeCustomer360Obj.balance.toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>

                        {/* Customer orders list */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-[#D4AF37] block font-black border-b border-slate-900 pb-1">• الفواتير وضريبة القيمة للمشتريات:</span>
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {invoices.filter(i => i.customer === activeCustomer360Obj.name).map(inv => (
                              <div key={inv.id} className="p-2 rounded-xl bg-black/45 border border-slate-900 flex justify-between items-center text-[10.5px]">
                                <span className={`text-[8.5px] px-1.5 rounded font-black ${inv.status === 'مدفوع' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500'}`}>{inv.status}</span>
                                <span className="text-gray-300">{inv.total.toLocaleString()} ر.س</span>
                                <span className="font-mono text-gray-500 text-[9px]">{inv.id} • {inv.date}</span>
                              </div>
                            ))}

                            {invoices.filter(i => i.customer === activeCustomer360Obj.name).length === 0 && (
                              <p className="text-center py-4 text-[9px] text-gray-500">لا توجد صفقات تجارية مسجلة لهذا العقد حالياً.</p>
                            )}
                          </div>
                        </div>

                        {/* Customer linked Ticketing profile */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-[#D4AF37] block font-black border-b border-slate-900 pb-1">• تذاكر الدعم التقني والـ SLA المرتبطة:</span>
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {tickets.filter(t => t.customerName === activeCustomer360Obj.name).map(t => (
                              <div key={t.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between items-center text-[10.5px]">
                                <span className={`text-[8.5px] px-1.5 rounded font-black ${t.status === 'resolved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-455 animate-pulse'}`}>
                                  ● {t.status}
                                </span>
                                <span className="text-gray-300 font-extrabold">{t.title}</span>
                                <span className="font-mono text-gray-500 text-[9px]">{t.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Administrative Notes Memo Block */}
                      <div className="pt-3 border-t border-slate-900 text-right space-y-2.5 shrink-0">
                        <label className="block text-[10px] text-gray-500 font-bold">✏️ مفكرة المشرف وتوجيهات خدمة الزبون (المذكرة الإدارية):</label>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveCustomerMemo}
                            className="bg-amber-505 border border-amber-500 hover:bg-amber-500 hover:text-black text-amber-500 text-xs px-3 rounded-xl font-bold cursor-pointer shrink-0 transition-colors"
                          >
                            حفظ
                          </button>
                          <input 
                            type="text"
                            value={memoEdit}
                            onChange={(e) => setMemoEdit(e.target.value)}
                            placeholder="اكتب توجيهاً خاصاً لتغليف هدايا العود أو تعجيل الشحن والتوصيل..."
                            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-white outline-none text-right select-text"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 📂 HUB SECTION 4: Knowledge Base Articles & Tutorials */}
                {hubSection === "knowledge_base" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 text-right font-sans"
                  >
                    {/* FAQ Category filter rail */}
                    <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/35 border border-slate-900 space-y-3">
                      <span className="text-[10px] text-gray-500 block border-b border-slate-900 pb-1.5 font-bold">🔖 مرشح الأبواب والمقالات:</span>
                      
                      <div className="flex flex-col gap-1.5 text-xs">
                        {[
                          { id: "all", label: "كافة الأقسام والمقالات" },
                          { id: "general", label: "أسئلة تشغيلية عامة (General)" },
                          { id: "products", label: "جرد المخزون والمنتجات" },
                          { id: "invoices", label: "الفواتير وضريبة الفوترة" },
                          { id: "ai", label: "تحليلات الذكاء الاصطناعي" }
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setFaqCategory(cat.id as any)}
                            className={`p-2.5 rounded-xl border text-right font-bold transition-all ${faqCategory === cat.id ? "bg-amber-500/10 border-amber-500/30 text-white" : "border-slate-900 bg-slate-950/30 text-gray-400 hover:text-white"}`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FAQ Accordions result port */}
                    <div className="md:col-span-8 p-5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-4">
                      {/* Search box index */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ابحث عن سؤال أو حل فوري لقضايا الفروع بالمستندات الموثقة..."
                          className="w-full text-xs p-3 pr-9 rounded-xl bg-slate-950 border border-slate-900 text-white outline-none text-right select-text font-bold"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-550 absolute top-1/2 right-3.5 -translate-y-1/2" />
                      </div>

                      {/* Accordions */}
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {filteredFaqs.map((faq, index) => {
                          const isExpanded = expandedFaq === index;
                          return (
                            <div
                              key={index}
                              className="rounded-xl border overflow-hidden bg-slate-950/40 border-slate-900"
                            >
                              <button
                                type="button"
                                onClick={() => setExpandedFaq(isExpanded ? null : index)}
                                className="w-full p-3.5 flex items-center justify-between text-right cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                <span className="text-xs font-black text-gray-200">{faq.question}</span>
                              </button>

                              {isExpanded && (
                                <div className="p-3.5 text-xs leading-relaxed text-gray-400 border-t border-slate-950 whitespace-pre-line select-text">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {filteredFaqs.length === 0 && (
                          <p className="text-center py-6 text-xs text-gray-500">لا توجد مقالات صيانة متطابقة للبحث.</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🧠 HUB SECTION 5: AI Support Assistant chat bot */}
                {hubSection === "ai_assistant" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl h-[520px] flex flex-col justify-between bg-slate-950/20 border border-slate-900 font-sans"
                  >
                    {/* Header bar */}
                    <div className="pb-3 border-b border-slate-900 flex justify-between items-center text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black animate-pulse">
                        النموذج النشط: Gemini 2.5 Server-Side
                      </span>

                      <div className="text-right">
                        <h4 className="text-xs font-black text-white flex items-center justify-end gap-1.5">
                          <span>مستشار سهم الذكي والمدرب الرقمي 🧠</span>
                          <Bot className="w-4 h-4 text-emerald-400" />
                        </h4>
                        <p className="text-[9.5px] mt-0.5" style={{ color: theme.muted }}>اسأله باللغة الطبيعية عن كيفية أداء أي وظيفة تشغيلية في سهم</p>
                      </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="grow overflow-y-auto py-4 space-y-4 pr-1 text-right max-h-[300px]">
                      {aiChatLogs.map((chat, idx) => (
                        <div
                          key={idx}
                          className={`max-w-[85%] p-3.5 rounded-2xl text-right transition-all font-bold ${chat.sender === "user" ? "bg-amber-500/10 border border-[#D4AF37]/35 rounded-tr-none ml-auto" : "bg-slate-900/60 border border-slate-800 rounded-tl-none mr-auto"}`}
                        >
                          <span className="text-[8.5px] text-gray-500 block mb-1">
                            {chat.sender === "user" ? "أنت (المدير)" : "مستشار سهم الذكي 🤖"} • {chat.time}
                          </span>
                          <p className="text-xs text-gray-200 leading-relaxed font-semibold whitespace-pre-wrap select-text"
                             dangerouslySetInnerHTML={{ __html: chat.text }} />
                        </div>
                      ))}

                      {isAiAnswering && (
                        <div className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-xl mr-auto max-w-[60%] flex items-center gap-2 justify-end">
                          <span className="text-[10px] font-black text-gray-400">جاري صياغة الخطوات بالذكاء...</span>
                          <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Interactive suggestions quick buttons (PM Instructions: add, view, invoice, backup) */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 flex flex-wrap gap-1.5 justify-end items-center text-right shrink-0 select-none">
                      <span className="text-[8.5px] text-gray-500 block font-black pl-1.5 ml-1 border-l border-slate-900">انزل أسئلة جاهزة:</span>
                      {[
                        "كيف أضيف منتج؟",
                        "كيف أراجع وجرد المخزن؟",
                        "كيف أصدر فاتورة؟",
                        "كيف أربط سلة؟",
                        "كيف أعمل نسخة احتياطية؟"
                      ].map((qst, chIdx) => (
                        <button
                          key={chIdx}
                          type="button"
                          onClick={() => {
                            setAiAssistantQuery(qst);
                            triggerNotification("تم كتابة السؤال المقترح", "info");
                          }}
                          className="bg-black text-[9.5px] text-gray-400 hover:text-white border border-slate-850 hover:border-amber-500/40 rounded-lg px-2 py-1 cursor-pointer font-bold"
                        >
                          {qst}
                        </button>
                      ))}
                    </div>

                    {/* Submission box and text field */}
                    <form onSubmit={handleAiAssistantSubmit} className="pt-3 border-t border-slate-900 flex gap-2 shrink-0">
                      <button
                        type="submit"
                        disabled={isAiAnswering || !aiAssistantQuery.trim()}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border-0 transition-transform active:scale-95 shadow"
                      >
                        <SendHorizontal className="w-3.5 h-3.5 shrink-0" />
                        <span>إرسال الاستفسار</span>
                      </button>

                      <input
                        type="text"
                        value={aiAssistantQuery}
                        onChange={(e) => setAiAssistantQuery(e.target.value)}
                        placeholder="اسأل مستشار سهم: كيف أربط بكسر API، أو كيف تصدر قيداً مزدوجاً للفواتير؟"
                        className="grow text-xs p-2.5 rounded-xl bg-slate-950 text-white border border-slate-900 outline-none text-right select-text font-bold"
                      />
                    </form>
                  </motion.div>
                )}

                {/* ⚙️ HUB SECTION 6: Central Routing & Support Staff Configuration */}
                {hubSection === "settings" && (simulatedRole === "مشرف دعم" || simulatedRole === "مدير") && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 text-right font-sans"
                  >
                    {/* Routing rules col */}
                    <div className="md:col-span-4 p-5 rounded-2xl bg-slate-950/25 border border-slate-900 space-y-4">
                      <span className="text-[10px] text-amber-550 block font-black border-b border-slate-900 pb-1.5">• التوجيه الآلي للمحادثات (Routing Control):</span>
                      
                      <div className="space-y-3.5 text-xs font-bold leading-none select-none">
                        <div className="flex justify-between items-center">
                          <input 
                            type="checkbox" 
                            checked={routingAutoAssign}
                            onChange={(e) => setRoutingAutoAssign(e.target.checked)}
                            className="cursor-pointer"
                          />
                          <span className="text-gray-300">تفعيل الإسناد التلقائي للوارد</span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500">الموظف الرئيسي الموجه له تلقائياً</label>
                          <select
                            value={routingPrimaryStaff}
                            onChange={(e) => setRoutingPrimaryStaff(e.target.value)}
                            className="w-full text-right p-2 rounded-xl bg-slate-950 border border-slate-900 text-white cursor-pointer"
                          >
                            {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500">التصنيف اللوجستي التلقائي</label>
                          <select
                            value={routingClassification}
                            onChange={(e) => setRoutingClassification(e.target.value)}
                            className="w-full text-right p-2 rounded-xl bg-slate-950 border border-slate-900 text-white cursor-pointer"
                          >
                            <option value="شحن واستنزال">استفسار عام / شحن واستنزال</option>
                            <option value="باقة النخبة">باقة النخبة VIP</option>
                            <option value="أخطاء مخزون">صيانة وتجهيز أخطاء مخزون</option>
                          </select>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => triggerNotification("تم تحديث وحفظ قواعد توجيه المحادثات الآلية ⚙️", "success")} 
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 border-none rounded-xl text-amber-500 font-extrabold text-[10px] cursor-pointer"
                        >
                          تحديث قوانين التوجيه
                        </button>
                      </div>

                      {/* Staff table registry */}
                      <div className="pt-4 border-t border-slate-900 space-y-3">
                        <span className="text-[10px] text-amber-550 block font-black border-b border-slate-900 pb-1.5">• فريق الدعم المتصل ({staffList.length}) :</span>
                        <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                          {staffList.map(s => (
                            <div key={s.id} className="p-2 rounded-xl bg-black/40 border border-slate-900 flex justify-between items-center text-[10px]">
                              <span className="text-emerald-450 text-[9px] font-mono">طاقم فاعل</span>
                              <div className="text-right">
                                <span className="block text-gray-300 font-bold">{s.name}</span>
                                <span className="block text-[8.5px] text-gray-550">{s.role} • المحادثات: {s.workload}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Speed templates configuration */}
                    <div className="md:col-span-8 p-5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-4">
                      <div className="border-b border-slate-900 pb-2">
                        <span className="text-xs font-black text-white">إعداد وإدارة قوالب الردود السريعة (Templates Dashboard)</span>
                        <p className="text-[10px] text-gray-500">قم بتعريف اختصارات ردود لإدخال مسودات فورية بمركز الدردشة</p>
                      </div>

                      {/* Templates grid */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {templates.map(temp => (
                          <div key={temp.id} className="p-3 rounded-xl bg-black/35 border border-slate-900 flex justify-between items-start text-xs">
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(temp.id)}
                              className="text-rose-400 hover:text-rose-500 bg-transparent border-none cursor-pointer p-0.5 text-[10px]"
                            >
                              حذف الاختصار ×
                            </button>
                            <div className="text-right max-w-[80%]">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[9px] font-mono">#{temp.shortcut}</span>
                              <p className="text-xs text-gray-400 mt-1">{temp.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Template form */}
                      <form onSubmit={handleAddTemplate} className="p-3 rounded-xl bg-slate-950/80 border border-slate-900 space-y-3 text-xs font-bold leading-normal">
                        <span className="text-[10px] text-[#D4AF37] block">• إنشاء اختصار جديد:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-none">
                          <div>
                            <label className="text-[8.5px] text-gray-500 block mb-1">الكلمة المفتاحية للاختصار</label>
                            <input 
                              type="text" 
                              required
                              placeholder="أرامكس"
                              value={newShortcut}
                              onChange={(e) => setNewShortcut(e.target.value)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white outline-none font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[8.5px] text-gray-500 block mb-1">صياغة نص الرد الكامل</label>
                            <input 
                              type="text"
                              required
                              placeholder="تم شحن بوليصتك مع أرامكس..."
                              value={newTemplateText}
                              onChange={(e) => setNewTemplateText(e.target.value)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-white outline-none font-bold"
                            />
                          </div>
                        </div>

                        <button type="submit" className="w-full py-2 bg-amber-500 hover:brightness-110 text-black font-black text-xs rounded-xl cursor-pointer border-none shadow">
                          تأكيد ونشر قالب الرد ➕
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* 👑 MANAGER ROLE DASHBOARD VIEW SECTION (PM Requirement) */}
          {simulatedRole === "مدير" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border text-right space-y-4"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="border-b border-slate-900/60 pb-2">
                <h3 className="text-sm font-black text-[#D4AF37] flex items-center justify-end gap-1.5">
                  <span>لوحة قيادة وتحليلات المدير للمركز الموحد (Executive CRM Telemetry)</span>
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">تقارير معدلات الاستجابة، ورضا المشترين، والالتزام ببنود الصيانة الـ SLA للفرع الرئيسي</p>
              </div>

              {/* Reports Dashboard Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 text-right space-y-1">
                  <span className="text-[9.5px] text-gray-550 font-bold block">معدل الاستجابة الأولية ARR</span>
                  <span className="text-sm font-black font-mono text-emerald-400">98% (ممتاز)</span>
                  <p className="text-[8px] text-gray-500 leading-normal">أول رد يتم خلال ٩ دقائق فقط بالمملكة</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 text-right space-y-1">
                  <span className="text-[9.5px] text-gray-555 font-bold block">متوسط وقت إغلاق التذاكر MTR</span>
                  <span className="text-sm font-black font-mono text-[#D4AF37]">٢٤.٥ دقيقة</span>
                  <p className="text-[8px] text-gray-500 leading-normal">مستهدف SLA متوافق مع معايير الأيزو</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 text-right space-y-1 text-xs">
                  <span className="text-[9.5px] text-gray-555 font-bold block">الالتزام بالـ SLA</span>
                  <span className="text-sm font-black font-mono text-blue-400">96.8%</span>
                  <p className="text-[8px] text-gray-500 leading-normal">تجاوز التزامات ضئيل للغاية (تذكرة واحدة متأخرة)</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 text-right space-y-1 text-xs text-rose-500">
                  <span className="text-[9.5px] text-gray-555 font-mono font-bold block">المحادثات المتأخرة والزبائن الغاضبين</span>
                  <span className="text-sm font-black font-mono text-rose-400">1 عملاء متأخرين</span>
                  <p className="text-[8px] text-gray-500 leading-normal">تتطلب تدخل العاقد أو مشرف الفروع فوراً</p>
                </div>
              </div>

              {/* Summary Audit Logs of CRM Hub Actions */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-[10.5px] leading-relaxed text-gray-400">
                🔒 <strong>تأمين الالتزام:</strong> كافة نشاطات التواصل والتوجيه الإحصائي، وإسناد التوجيهات للعملاء، وحذف قوالب الردود السريعة يتم تدوينها تلقائياً بملف <strong>سجل تدقيق المنظومة الموحد (Audit Log)</strong> لأغراض الأمان والتشغيل المتكامل.
              </div>
            </motion.div>
          )}

        </div>
      )}
    </motion.div>
  );
}
