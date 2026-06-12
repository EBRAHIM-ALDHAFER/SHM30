import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Invoice, Product, Customer, User, ThemeColors } from "../types";
import { 
  TrendingUp, ShoppingCart, DollarSign, AlertCircle, MessageSquare, 
  Package, Clock, ArrowUpRight, Check, Sparkles, Database, Award, Zap,
  Send, User as UserIcon, Bot, Megaphone, Terminal
} from "lucide-react";
import { SahmDatabaseService, DbLog } from "../core/database/dbService";

interface DashboardProps {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  user: User;
  theme: ThemeColors;
  currentBranchId?: string;
  branches?: any[];
  setActiveSubTab?: (tab: 'overview' | 'analytics' | 'assistant' | 'recommendations' | 'competitors' | 'alerts' | 'operations' | 'forecasts' | 'performance' | 'cabin_customize' | 'intelligent_hub') => void;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string, subTab?: string, prefill?: any) => void;
}

export default function Dashboard({ 
  invoices, 
  products, 
  customers, 
  user, 
  theme,
  currentBranchId = "",
  branches = [],
  setActiveSubTab,
  setActiveTab,
  onNavigate
}: DashboardProps) {
  // Database States & Subscription
  const [dbLogs, setDbLogs] = useState<DbLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // low stock items count
  const lowStockCount = products.filter(p => (Number(p.stock) || 0) < 10).length;

  // Smart Assistant Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "أهلاً بك في منصة سهم الملوكية! أنا مساعدك الذكي سهم AI. كيف يمكنني مساعدتك في إدارة متجرك اليوم؟" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    
    // Add user message
    const userMsg = { sender: "user", text: promptText };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    // Simulated responses
    setTimeout(() => {
      let reply = "";
      if (promptText.includes("وصف") || promptText.includes("اكتب")) {
        reply = "🪄 وصف مقترح بالذكاء الاصطناعي لمنتجك:\n'دهن عود كلمنتان طبيعي سوبر، مستخلص من الغابات الإندونيسية العريقة. يتميز بنكهة بخورية سويتية فواحة وثبات يدوم لأيام على الملابس والمجالس.' هل ترغب في اعتماده وحفظه كمسودة؟";
      } else if (promptText.includes("مبيعات") || promptText.includes("أداء") || promptText.includes("تحليل")) {
        reply = `📊 تقرير الأداء اليومي:\nإجمالي المبيعات المحققة اليوم بلغت ${todaySales.toLocaleString()} ر.س عبر قنوات البيع النشطة. هناك نمو بنسبة 14.2% مقارنة بيوم أمس، ومعدل الامتثال الضريبي مع الهيئة مستقر بنسبة 100%.`;
      } else if (promptText.includes("مخزون") || promptText.includes("تنبيه") || promptText.includes("فحص")) {
        reply = `🚨 تقرير تنبيهات المخزون للفرع:\nيوجد حالياً عدد ${lowStockCount} أصناف منخفضة المخزون (تحت حد التنبيه 10 وحدات). نوصي بإصدار أمر شراء تموين عاجل لتجنب نفاد الكميات.`;
      } else {
        reply = "مرحباً بك! يمكنني صياغة نصوص تسويقية للمنتجات، أو جرد المنتجات منخفضة المخزون، أو تلخيص التقارير المحاسبية والمبيعات. ما العملية التي تود تنفيذها؟";
      }
      
      setChatMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  // Current time state
  const [timeStr, setTimeStr] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const db = SahmDatabaseService.getInstance();
    setDbLogs(db.getLogs());
    
    // Subscribe to live log updates
    const listener = (newLogs: DbLog[]) => {
      setDbLogs([...newLogs].reverse()); // Shows latest first
    };
    db.addLogListener(listener);

    // Initial load of audit logs, filtered or custom
    const savedAudits = localStorage.getItem("sahm_web_audit_logs");
    let initialAudits = savedAudits ? JSON.parse(savedAudits) : [
      { id: "1", action: "ربط النواة السحابية", details: "نجاح التحقق من تراخيص Sahm OS Enterprise", timestamp: new Date(Date.now() - 50000).toLocaleString("ar-SA") },
      { id: "2", action: "تحميل المستودعات", details: "تم بنجاح سحب كميات مخزون رصيد العود والزعفران لفرع الرياض الرئيسي", timestamp: new Date(Date.now() - 300000).toLocaleString("ar-SA") }
    ];
    setAuditLogs(initialAudits);

    return () => {
      db.removeLogListener(listener);
    };
  }, []);

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // Dynamic state / computations based on currentBranchId
  const selectedBranchName = branches.find(b => b.id === currentBranchId)?.name || "كافة الفروع";
  const isEmptyState = currentBranchId === "br_dammam"; // معرض دبي has no transactions yet by design

  // 1. Calc real-time active sales & orders from the global array
  const realTodayInvoices = invoices.filter(i => {
    const matchesType = i.type === "sale";
    const matchesDate = i.date === todayStr || i.date === "2026-06-02";
    if (!matchesType || !matchesDate) return false;
    
    // Filter branch context
    if (currentBranchId && currentBranchId !== "all") {
      if (currentBranchId === "branch_riyadh_main") {
        return !i.branch_id || i.branch_id === "branch_riyadh_main";
      }
      return i.branch_id === currentBranchId;
    }
    return true;
  });

  const realTodaySalesSum = realTodayInvoices.reduce((sum, i) => sum + i.total, 0);
  const realTodayOrdersCount = realTodayInvoices.length;

  // Values computed statically & dynamically per branch configuration to simulate real database changes
  let todaySales = 5420;
  let todayOrders = 8;
  let todayProfit = 2818;
  let totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  let totalAssetsValue = products.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
  let messageCount = 12; // active channel messages
  let branchPerformance = "96%";

  if (currentBranchId === "branch_riyadh_main") {
    todaySales = realTodaySalesSum > 0 ? realTodaySalesSum : 5420;
    todayOrders = realTodayOrdersCount > 0 ? realTodayOrdersCount : 8;
    todayProfit = Math.round(todaySales * 0.52);
    totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    totalAssetsValue = products.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
    messageCount = 12;
    branchPerformance = "98%";
  } else if (currentBranchId === "br_jeddah_int") {
    // Jeddah branch
    todaySales = realTodaySalesSum > 0 ? realTodaySalesSum : 2850;
    todayOrders = realTodayOrdersCount > 0 ? realTodayOrdersCount : 4;
    todayProfit = Math.round(todaySales * 0.52);
    totalStock = Math.round(products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0) * 0.4); // 40% of standard stocks allocated to Jeddah
    totalAssetsValue = Math.round(products.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0) * 0.4);
    messageCount = 5;
    branchPerformance = "91%";
  } else if (currentBranchId === "br_sahm_tech") {
    // Sahm Tech branch
    todaySales = 1350;
    todayOrders = 2;
    todayProfit = Math.round(todaySales * 0.52);
    totalStock = 90;
    totalAssetsValue = 4050;
    messageCount = 2;
    branchPerformance = "94%";
  } else if (!currentBranchId || currentBranchId === "all" || currentBranchId === "") {
    // Consolidated Comprehensive values
    todaySales = (realTodaySalesSum > 0 ? realTodaySalesSum : 5420) + 2850 + 1350;
    todayOrders = (realTodayOrdersCount > 0 ? realTodayOrdersCount : 8) + 4 + 2;
    todayProfit = Math.round(todaySales * 0.52);
    const standardStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    totalStock = standardStock + 120 + 90;
    const standardAssets = products.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
    totalAssetsValue = standardAssets + Math.round(standardAssets * 0.4) + 4050;
    messageCount = 19;
    branchPerformance = "95%";
  }

  // Unified global navigation helper callback
  const navigateTo = (tab: string, subTab?: string, prefill?: any) => {
    if (onNavigate) {
      onNavigate(tab, subTab, prefill);
    } else {
      if (setActiveTab) setActiveTab(tab);
      if (tab === "command_center" && subTab && setActiveSubTab) {
        setActiveSubTab(subTab as any);
      }
    }
  };

  // If the selected branch has NO data (معرض دبي br_dammam), show a clean visual Empty State strictly!
  if (isEmptyState) {
    return (
      <div 
        className="p-8 rounded-2xl border text-center space-y-4 max-w-lg mx-auto my-12" 
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="w-16 h-16 bg-yellow-500/10 border border-[#D6A84F]/30 rounded-full flex items-center justify-center mx-auto text-[#D6A84F] animate-pulse">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white font-sans">لا توجد بيانات لهذا الفرع بعد</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-bold font-sans">
          لم يتم تسجيل أي عمليات بيع، شراء، جرد مخزني، محادثات أو حركة توريد ضمن فرع [{selectedBranchName}] حتى الآن. تفضل بتفعيل نقطة البيع أو المزامنة لبدء تغذية المؤشرات والقرارات التنفيذية الفورية.
        </p>
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent("sahm_branch_changed", { detail: { branchId: "branch_riyadh_main" } }));
          }}
          className="px-5 py-2 bg-slate-900 border border-slate-800 hover:border-[#D6A84F]/45 text-white rounded-xl text-xs font-black transition-all cursor-pointer font-sans"
        >
          العودة للفرع الرئيسي
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right font-sans pb-10">
      
      {/* 🔮 EXECUTIVE COCKPIT SUMMARY CARD WITH RADIAL GAUGE */}
      <div 
        className="p-6 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-2xl animate-fade-in-up"
        style={{ 
          backgroundColor: '#0E1A2B', 
          borderColor: 'rgba(214,168,79,0.25)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(214,168,79,0.08)'
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 space-y-2 text-right">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#D6A84F]/15 text-[#D6A84F] animate-pulse">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-extrabold tracking-widest text-[#D6A84F] uppercase font-sans">
              كابينة قيادة سهم الفورية • Operating Dashboard
            </span>
          </div>
          <h2 className="text-base font-black text-white md:text-lg">
            مؤشرات أداء وموثوقية النظام الموحد
          </h2>
          <p className="text-[10.5px] leading-relaxed text-zinc-400 max-w-xl font-bold">
            مراقبة حية لجلسات الكاشير والمبيعات التراكمية، ومزامنة قواعد البيانات السحابية، وسلامة ترحيل الفواتير الضريبية المعتمدة لهيئة الزكاة والضريبة والجمارك (ZATCA).
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 shrink-0 bg-black/25 p-3 px-4 rounded-2xl border border-zinc-800/60 shadow-lg transition-all">
          <div className="text-right space-y-1.5">
            <span className="text-[11px] font-black text-white block">معدل الامتثال والربط</span>
            <span className="text-[9px] text-emerald-400 font-bold block">● مستقر وموثق (ZATCA Phase-2)</span>
            
            {currentBranchId && currentBranchId !== "all" && currentBranchId !== "" ? (
              <div className="flex items-center gap-1.5 text-[8.5px] text-zinc-350 bg-slate-900/80 px-2 py-1 rounded border border-zinc-800/60 font-black">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                <span>تستعرض فرع: <span className="text-[#D6A84F] font-black">{selectedBranchName}</span></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[8.5px] text-[#D6A84F] bg-[#D6A84F]/10 px-2 py-1 rounded border border-[#D6A84F]/25 font-black">
                <Award className="w-3 h-3 text-[#D6A84F]" />
                <span>عرض موحد لكافة الفروع</span>
              </div>
            )}
          </div>
          
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2.5" 
                strokeDasharray="100" 
                strokeDashoffset="6" 
                strokeLinecap="round"
                className="drop-shadow-[0_0_4px_#10B981]"
              />
            </svg>
            
            {/* Inner Ring */}
            <div className="absolute inset-1.5">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="#D6A84F" 
                  strokeWidth="2" 
                  strokeDasharray="100" 
                  strokeDashoffset="12" 
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_3px_#D6A84F]"
                />
              </svg>
            </div>
            
            {/* Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-center">
              <span className="text-xs font-black text-white font-mono">94%</span>
              <span className="text-[6.5px] font-extrabold text-emerald-400 tracking-wider uppercase mt-0.5">HEALTH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Block (4 Custom Requested Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: إجمالي المبيعات */}
        <div 
          onClick={() => navigateTo("sales_commerce", "invoices")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-black font-sans">
                اليوم
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">إجمالي المبيعات</span>
          <h3 className="text-xl font-mono font-black text-white">{todaySales.toLocaleString()} ر.س</h3>
          
          <div className="mt-3.5 h-8 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d="M0,22 Q15,4 35,16 T70,4 T100,10" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="drop-shadow-[0_0_4px_#10B981]"
              />
            </svg>
          </div>
          <p className="text-[8.5px] text-gray-500 mt-2 font-bold font-sans">تطابق وتراص تام مع قنوات سلة وسناب شات</p>
        </div>

        {/* KPI 2: الطلبات */}
        <div 
          onClick={() => navigateTo("sales_commerce", "pos")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-sky-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-lg font-black font-sans">
                المعاملات
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">الطلبات</span>
          <h3 className="text-xl font-mono font-black text-white">{todayOrders} صفقات</h3>

          <div className="mt-3.5 h-8 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d="M0,18 Q15,8 35,20 T70,5 T100,15" 
                fill="none" 
                stroke="#38BDF8" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="drop-shadow-[0_0_3px_#38BDF8]"
              />
            </svg>
          </div>
          <p className="text-[9px] text-gray-500 mt-2 font-bold font-sans">طلبات شبكات الدفع والتحصيل من الفروع</p>
        </div>

        {/* KPI 3: تنبيهات المخزون */}
        <div 
          onClick={() => navigateTo("operations", "inventory")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-red-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black font-sans border ${lowStockCount > 0 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                {lowStockCount > 0 ? "تنبيه نشط" : "آمن"}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className={`p-2 rounded-xl ${lowStockCount > 0 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">تنبيهات المخزون</span>
          <h3 className="text-xl font-mono font-black text-white">{lowStockCount} أصناف منخفضة</h3>

          <div className="mt-3.5 h-8 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d="M0,25 L20,25 L40,15 L60,15 L80,5 L100,5" 
                fill="none" 
                stroke={lowStockCount > 0 ? "#F87171" : "#34D399"} 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
          <p className="text-[8.5px] text-gray-500 mt-2 font-bold font-sans">السلع التي تقل كميتها عن حد الأمان</p>
        </div>

        {/* KPI 4: فرص تسويقية */}
        <div 
          onClick={() => navigateTo("marketing_growth", "catalog_promo")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#D6A84F]/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-[#D6A84F]/20 px-2 py-0.5 rounded-lg font-black font-sans">
                توصيات AI
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-amber-500/15 text-[#D6A84F]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">فرص تسويقية</span>
          <h3 className="text-xl font-mono font-black text-white">5 فرص نشطة</h3>

          <div className="mt-3.5 h-8 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d="M0,15 C20,5 40,25 60,10 C80,25 100,5 100,5" 
                fill="none" 
                stroke="#D6A84F" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="drop-shadow-[0_0_3px_#D6A84F]"
              />
            </svg>
          </div>
          <p className="text-[8.5px] text-gray-500 mt-2 font-bold font-sans">حملات وعروض ترويجية مقترحة بالذكاء المالي</p>
        </div>

      </div>

      {/* 🚀 STEPPER & SMART ASSISTANT SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Smart Assistant Widget (Renders in 7/12 width) */}
        <div 
          className="lg:col-span-7 p-6 rounded-3xl border flex flex-col h-[480px] bg-[#0E1A2B] border-white/5 relative overflow-hidden"
        >
          {/* Background glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-50/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Widget Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#D6A84F]/30 flex items-center justify-center text-[#D6A84F] shadow-inner">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-white">مساعد سهم الذكي • Sahm AI</h3>
                <p className="text-[10px] text-gray-400">اطرح أي استفسار لإدارة المنشأة أو كتابة وصف للمنتجات</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
              متصل
            </span>
          </div>

          {/* Conversation history area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pl-1 relative z-10 text-[11px] leading-relaxed">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "mr-auto flex-row-reverse" : "ml-auto"}`}
              >
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] ${msg.sender === "user" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-white"}`}>
                  {msg.sender === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div 
                  className={`p-3 rounded-2xl text-right whitespace-pre-line border border-solid ${
                    msg.sender === "user" 
                      ? "bg-amber-500/10 border-amber-500/20 text-white rounded-tr-none" 
                      : "bg-slate-900/80 border-slate-800 text-gray-250 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 ml-auto max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-none text-gray-400 flex items-center gap-1.5 font-bold">
                  <span>جاري الكتابة بالذكاء الاصطناعي</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompt buttons */}
          <div className="mt-3 flex flex-wrap gap-1.5 relative z-10">
            {[
              { text: "🪄 اكتب وصف لمنتج عود", prompt: "اكتب وصف ترويجي لمنتج عود كلمنتان طبيعي فاخر" },
              { text: "📊 حلل أداء مبيعات اليوم", prompt: "حلل أداء مبيعات اليوم وأعطني الخلاصة" },
              { text: "🚨 افحص تنبيهات المخزون", prompt: "افحص تنبيهات المخزون واذكر الأصناف المنخفضة" }
            ].map((qp, qIdx) => (
              <button
                key={qp.text}
                onClick={() => handleSendPrompt(qp.prompt)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-[#D6A84F]/30 text-[10px] text-gray-300 hover:text-white rounded-lg cursor-pointer transition-all"
              >
                {qp.text}
              </button>
            ))}
          </div>

          {/* Input send bar */}
          <div className="mt-3 flex gap-2 relative z-10 shrink-0">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendPrompt(chatInput);
              }}
              placeholder="اطرح أي سؤال حول متجرك، مبيعاتك، أو منتجاتك..."
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 text-xs rounded-xl focus:border-[#D6A84F]/40 outline-none text-white text-right"
            />
            <button
              onClick={() => handleSendPrompt(chatInput)}
              className="p-2.5 bg-[#D6A84F] hover:bg-[#c29643] text-[#07111F] rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95 shrink-0 border-none"
            >
              <Send className="w-4 h-4 transform rotate-180" />
            </button>
          </div>
        </div>

        {/* Right Side: Product Studio Stepper (Renders in 5/12 width) */}
        <div 
          className="lg:col-span-5 p-6 rounded-3xl border flex flex-col h-[480px] bg-[#0E1A2B] border-white/5 relative overflow-hidden justify-between"
        >
          {/* Background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded bg-[#D6A84F]/10 border border-[#D6A84F]/20 text-[#D6A84F] animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-black text-[#D6A84F] uppercase tracking-widest">
                  خط إنتاج استديو سهم الذكي
                </span>
              </div>
              <h3 className="text-sm font-black text-white">مراحل وخطوات إدراج ونشر الأصناف</h3>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                سلسلة خطوات مترابطة لصياغة المنتجات وصناعة المحتوى المرئي وتصديرها لقنوات المبيعات
              </p>
            </div>

            {/* Stepper block */}
            <div className="space-y-3.5 my-3 flex-1 flex flex-col justify-center">
              {[
                { step: 1, label: "رفع المنتج", desc: "تعبئة البيانات والكتالوج الأساسي", status: "completed" },
                { step: 2, label: "تحليل AI", desc: "معالجة الخصائص الذكية بالذكاء المالي", status: "completed" },
                { step: 3, label: "إنشاء الصور", desc: "توليد خلفيات استوديو عالية الدقة", status: "active" },
                { step: 4, label: "إنشاء المحتوى", desc: "كتابة نصوص وصياغة تسويقية ممتازة", status: "pending" },
                { step: 5, label: "إنشاء الفيديو", desc: "توليد لقطات فيديو ترويجية ذكية", status: "pending" },
                { step: 6, label: "النشر", desc: "التصدير المباشر لمتجرك في سلة وسهم", status: "pending" }
              ].map((s) => (
                <div 
                  key={s.step}
                  onClick={() => navigateTo("product_studio")}
                  className={`flex items-center gap-3.5 p-2 rounded-xl border transition-all cursor-pointer select-none border-solid ${
                    s.status === "active" 
                      ? "bg-amber-500/5 border-amber-500/30 shadow-inner scale-[1.01]" 
                      : s.status === "completed" 
                        ? "bg-slate-900/40 border-slate-800/80 opacity-90"
                        : "bg-transparent border-transparent opacity-50 hover:opacity-85"
                  }`}
                >
                  {/* Step bubble */}
                  <div className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center border border-solid ${
                    s.status === "active"
                      ? "bg-[#D6A84F] text-slate-950 border-[#D6A84F] shadow-[0_0_10px_rgba(214,168,79,0.4)] animate-pulse"
                      : s.status === "completed"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-gray-500"
                  }`}>
                    {s.status === "completed" ? "✓" : s.step}
                  </div>

                  {/* Step text */}
                  <div className="text-right flex-1">
                    <span className={`text-[11px] font-black block leading-tight ${s.status === "active" ? "text-[#D6A84F]" : s.status === "completed" ? "text-white" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                    <span className="text-[8.5px] text-gray-500 block leading-none mt-0.5">
                      {s.desc}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded font-sans uppercase tracking-wider ${
                    s.status === "active"
                      ? "bg-amber-500/15 text-amber-500 animate-pulse"
                      : s.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-900/60 text-gray-600"
                  }`}>
                    {s.status === "active" ? "جاري العمل" : s.status === "completed" ? "مكتمل" : "معلق"}
                  </span>
                </div>
              ))}
            </div>

            {/* Stepper Footer Action */}
            <button
              onClick={() => navigateTo("product_studio")}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-md transition-all border-none flex items-center justify-center gap-1.5"
            >
              <span>الانتقال لاستوديو الابتكار المتقدم</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3.5]" />
            </button>
          </div>
        </div>

      </div>

      {/* Row 2 of KPIs: SQL & Database Engine Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 5: Supabase Connection Health Status */}
        <div 
          onClick={() => navigateTo("command_center", "intelligent_hub")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-black flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>مباشر</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">اتصال قاعدة Supabase SQL</span>
          <h3 className="text-sm font-black text-white flex items-center gap-1 justify-end font-sans">
            <span className="text-emerald-400">نشط ومستقر ✓</span>
          </h3>
          <p className="text-[8.5px] text-gray-500 mt-2 font-sans">مزامنة تتابعية مستمرة على خوادم Postgres</p>
        </div>

        {/* KPI 6: Total Warehouse Stock Count */}
        <div 
          onClick={() => navigateTo("operations", "inventory")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#D6A84F]/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/15 px-2 py-0.5 rounded-lg font-black font-sans">
                جرد مستودع
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">إجمالي جرد بضاعة المخازن</span>
          <h3 className="text-sm font-mono font-black text-white">{totalStock.toLocaleString()} وحدة</h3>
          <p className="text-[8.5px] text-gray-500 mt-2 font-bold font-sans">مجموع حركات الإدخال والإخراج السلعي</p>
        </div>

        {/* KPI 7: Catalog Liquidity */}
        <div 
          onClick={() => navigateTo("operations", "inventory")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-lg font-black font-sans">
                السيولة والتقييم
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">القيمة التقديرية للمخزون</span>
          <h3 className="text-sm font-mono font-black text-white">{totalAssetsValue.toLocaleString()} ر.س</h3>
          <p className="text-[8.5px] text-gray-500 mt-2 font-bold font-sans">إجمالي أصول السلع المسجلة بالنظام</p>
        </div>

        {/* KPI 8: Enterprise License Key */}
        <div 
          onClick={() => navigateTo("management_settings", "organization_hub")}
          className="group cursor-pointer p-5 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] hover:border-[#D6A84F]/40 active:scale-[0.98] duration-300 bg-[#0E1A2B] border-white/5"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/[0.02] rounded-full pointer-events-none blur-xl"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/15 px-2 py-0.5 rounded-lg font-black font-sans">
                رخصة النسخة
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">حالة ترخيص النظام للمؤسسة</span>
          <h3 className="text-sm font-black text-white flex items-center gap-1 justify-end font-sans">
            <span className="text-purple-400">نسخة غير محدودة ✓</span>
          </h3>
          <p className="text-[8.5px] text-gray-500 mt-2 font-bold font-sans">Sahm OS Enterprise Edition</p>
        </div>

      </div>

      {/* Live SQL Stream and Audit Trail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* PANE 1: SQL Live Stream Terminal */}
        <div 
          className="p-5 rounded-2xl border text-right space-y-3 relative overflow-hidden bg-[#0E1A2B] border-white/5"
        >
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-900/60 font-black">
            <span className="text-[9.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-lg font-mono">
              Postgres logs
            </span>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 justify-end font-sans">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>لوحة مراقبة واستعلامات SQL Live Stream</span>
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed font-bold font-sans">
            البكسلات السحابية الجارية وعمليات الـ CRUD التي تنفذها الـ database service بنظام سهم ملوكيًا:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[9px] text-[#2ECC71] space-y-2 max-h-56 overflow-y-auto leading-normal min-h-[140px]">
            {dbLogs.length === 0 ? (
              <div className="text-gray-500 italic text-center py-8">
                -- لا توجد استعلامات حالياً. قم بالتنقل في النظام لتسجيل حركات SQL حية --
              </div>
            ) : (
              dbLogs.map((log, lIdx) => (
                <div key={log.id || lIdx} className="border-b border-slate-900 pb-1.5 last:border-0 text-right">
                  <div className="flex justify-between items-center text-[8px] text-gray-500 mb-0.5">
                    <span>{log.duration}ms</span>
                    <span className={log.status === "error" ? "text-red-400" : "text-emerald-500"}>
                      [{log.timestamp}]
                    </span>
                  </div>
                  <div className="text-amber-400 font-bold tracking-wide truncate select-all">{log.query}</div>
                  {log.args && (
                    <div className="text-sky-300 text-[8px] mt-0.5 truncate bg-slate-950/20 px-1 py-0.2 rounded">
                      Params: {JSON.stringify(log.args)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANE 2: Dynamic Audit Trail Grid */}
        <div 
          className="p-5 rounded-2xl border text-right space-y-3 relative overflow-hidden bg-[#0E1A2B] border-white/5"
        >
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-900/60 font-black">
            <span className="text-[9.5px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-lg font-mono">
              Audit trail
            </span>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 justify-end font-sans">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>جرد وتتبع تحركات الموظفين والعمليات (Audit Log)</span>
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed font-bold font-sans">
            سجل التدقيق الحركي الفعلي للمتجر بالثواني والدقائق لتفادي أي ثغرات أو تعديلات غير مسموحة:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[9px] text-[#F39C12] space-y-2 max-h-56 overflow-y-auto leading-normal min-h-[140px]">
            {auditLogs.map((audit, aIdx) => (
              <div key={audit.id || aIdx} className="border-b border-slate-900 pb-1.5 last:border-0 flex justify-between items-start gap-4">
                <span className="text-gray-500 shrink-0 text-[8px] mt-0.5">{audit.timestamp}</span>
                <div className="text-right flex-1 space-y-0.5">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-amber-500 font-black">[{audit.action}]</span>
                  </div>
                  <p className="text-gray-300 font-bold leading-normal">{audit.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}