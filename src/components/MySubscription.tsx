import React, { useState, useEffect } from "react";
import { ThemeColors, CompanyProfile } from "../types";
import { CreditCard, Award, Calendar, Package, Building, HardDrive, PhoneCall, Users, ShieldAlert, Cpu, RefreshCw, FileText } from "lucide-react";
import { SahmDatabaseService } from "../core/database/dbService";
import { SubscriptionGuard } from "../core/database/subscriptionGuard";

interface MySubscriptionProps {
  theme: ThemeColors;
  subscription: {
    tier: "A" | "B" | "C";
    limit: number;
    currentUsed: number;
    renewsAt: string;
    billing?: string;
  };
  rawCompanies: CompanyProfile[];
  currentUser: any;
  invoicesCount: number;
  productsCount: number;
  branchesCount: number;
  warehousesCount: number;
  triggerNotification: (msg: string, type?: any) => void;
}

export default function MySubscription({
  theme,
  subscription,
  rawCompanies,
  currentUser,
  invoicesCount,
  productsCount,
  branchesCount,
  warehousesCount,
  triggerNotification
}: MySubscriptionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [planName, setPlanName] = useState("الباقة المجانية 👑");
  const [planStatus, setPlanStatus] = useState("active");
  const [renewsAt, setRenewsAt] = useState("٢٠٢٧/٠١/٠١");
  const [billingCycle, setBillingCycle] = useState("monthly");
  
  // Resource counts & limits
  const [usageStats, setUsageStats] = useState({
    invoices: { used: invoicesCount, limit: 1000, isUnlimited: false },
    products: { used: productsCount, limit: 100, isUnlimited: false },
    users: { used: 0, limit: 1, isUnlimited: false },
    branches: { used: branchesCount, limit: 1, isUnlimited: false },
    pos: { used: 0, limit: 1, isUnlimited: false },
    warehouses: { used: warehousesCount, limit: 1, isUnlimited: false },
    aiRequests: { used: 0, limit: 0, isUnlimited: false }
  });

  const tenantId = currentUser?.tenant_id || "";

  useEffect(() => {
    loadSubscriptionData();
  }, [currentUser, invoicesCount, productsCount, branchesCount, warehousesCount]);

  const loadSubscriptionData = async () => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const db = SahmDatabaseService.getInstance();
      const guard = SubscriptionGuard.getInstance();
      const currentMonth = new Date().toISOString().substring(0, 7);

      // 1. Get Plan & Subscription Details
      const planInfo = await guard.getCurrentPlan(tenantId);
      setPlanName(planInfo.planName);
      setPlanStatus(planInfo.status);

      const subs = await db.getTenantSubscriptions();
      const mySub = subs.find(s => s.tenant_id === tenantId);
      if (mySub) {
        setRenewsAt(mySub.current_period_end ? mySub.current_period_end.substring(0, 10) : "٢٠٢٧/٠١/٠١");
        setBillingCycle(mySub.billing_cycle || "monthly");
      } else {
        const myComp = rawCompanies.find(c => c.tenant_id === tenantId);
        if (myComp && myComp.createdAt) {
          setRenewsAt(new Date(myComp.createdAt).toLocaleDateString("ar-SA"));
        }
      }

      // 2. Fetch dynamic usage counts
      const usersList = await db.getUsers();
      const myUsers = usersList.filter(u => u.tenant_id === tenantId).length;

      const posList = await db.getPosTerminals();
      // Filter POS dynamically if tenantId is available, otherwise default fallback
      const myPos = posList.length; 

      const usageObj = await db.getSubscriptionUsage(tenantId, currentMonth);
      const myAiRequests = usageObj ? usageObj.ai_requests_count : 0;

      // 3. Resolve Limits using subscription guard
      const limitInvoices = await guard.checkLimit(tenantId, "invoices", invoicesCount);
      const limitProducts = await guard.checkLimit(tenantId, "products", productsCount);
      const limitUsers = await guard.checkLimit(tenantId, "users", myUsers);
      const limitBranches = await guard.checkLimit(tenantId, "branches", branchesCount);
      const limitPos = await guard.checkLimit(tenantId, "pos", myPos);
      const limitWarehouses = await guard.checkLimit(tenantId, "warehouses", warehousesCount);
      const limitAi = await guard.checkLimit(tenantId, "ai_requests", myAiRequests);

      setUsageStats({
        invoices: { used: invoicesCount, limit: limitInvoices.limit, isUnlimited: limitInvoices.isUnlimited },
        products: { used: productsCount, limit: limitProducts.limit, isUnlimited: limitProducts.isUnlimited },
        users: { used: myUsers, limit: limitUsers.limit, isUnlimited: limitUsers.isUnlimited },
        branches: { used: branchesCount, limit: limitBranches.limit, isUnlimited: limitBranches.isUnlimited },
        pos: { used: myPos, limit: limitPos.limit, isUnlimited: limitPos.isUnlimited },
        warehouses: { used: warehousesCount, limit: limitWarehouses.limit, isUnlimited: limitWarehouses.isUnlimited },
        aiRequests: { used: myAiRequests, limit: limitAi.limit, isUnlimited: limitAi.isUnlimited }
      });

    } catch (err) {
      console.error("Error loading MySubscription details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactAdmin = () => {
    triggerNotification("📞 يمكنك التواصل مع إدارة منصة سهم مباشرة عبر الرقم الموحد: 920033482 أو البريد: support@sahm-os.com", "info");
  };

  // Helper to render consumption progress bar
  const renderProgressBar = (
    title: string, 
    used: number, 
    limit: number, 
    isUnlimited: boolean, 
    icon: React.ReactNode
  ) => {
    const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
    
    // Choose status colors
    let barColor = "bg-amber-500";
    let textColor = "text-white";
    if (pct >= 100) {
      barColor = "bg-rose-500";
      textColor = "text-rose-400 font-black";
    } else if (pct >= 85) {
      barColor = "bg-amber-400";
      textColor = "text-amber-300 font-bold";
    } else {
      barColor = "bg-emerald-500";
    }

    return (
      <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/45 border border-slate-900 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-1.5 text-gray-300">
            {icon}
            <span>{title}</span>
          </div>
          <span className={textColor}>
            {used.toLocaleString()} / {isUnlimited ? "∞" : limit.toLocaleString()}
          </span>
        </div>
        
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mt-1">
          {isUnlimited ? (
            <div className="bg-gradient-to-r from-violet-500 to-sky-500 h-full rounded-full w-full" />
          ) : (
            <div 
              className={`${barColor} h-full rounded-full transition-all duration-500`} 
              style={{ width: `${pct}%` }} 
            />
          )}
        </div>

        <div className="flex justify-between text-[9px] text-gray-500 font-bold mt-1">
          <span>{isUnlimited ? "باقة غير محدودة" : `${pct}% مستهلك`}</span>
          <span>{isUnlimited ? "مفتوح" : `المتبقي: ${Math.max(0, limit - used).toLocaleString()}`}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-white flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-xs text-gray-400 font-bold">جاري تحميل تفاصيل ترخيص المنشأة...</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl border text-right space-y-6 shadow-xl font-sans text-white max-w-4xl mx-auto"
         style={{ backgroundColor: theme.card || "#0F1724", borderColor: theme.border || "#1C2A40" }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1C2A40] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">اشتراك منشأتي التجاري</h2>
            <p className="text-[10px] text-gray-400">تفاصيل ترخيص المنصة والحدود الاستهلاكية والتحكم بنقاط البيع</p>
          </div>
        </div>
        
        {planStatus === "suspended" ? (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
            الحالة: معطل مؤقتاً
          </span>
        ) : planStatus === "trial" ? (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            الحالة: فترة تجريبية مجانية
          </span>
        ) : (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            الحالة: باقة نشطة وتلقائية
          </span>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Package Card */}
        <div className="bg-[#152338] border border-[#1C2A40] rounded-2xl p-5 space-y-4 md:col-span-2">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider">📦 الباقة والترخيص الحالي</h3>
          <div className="space-y-2">
            <div className="text-xl font-black text-[#EDF2FF]">{planName}</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              تتمتع منشأتك بصلاحيات الباقة النشطة والربط الكامل بقنوات البيع ومستودعات التخزين الذكية.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <div className="text-right">
                <span className="block text-[9px] text-gray-500 font-bold">تاريخ التجديد القادم</span>
                <span className="text-xs font-bold text-gray-200 font-mono">{renewsAt}</span>
              </div>
            </div>
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <div className="text-right">
                <span className="block text-[9px] text-gray-500 font-bold">دورة الفوترة الحالية</span>
                <span className="text-xs font-bold text-gray-200">
                  {billingCycle === "yearly" ? "اشتراك سنوي" : "اشتراك شهري"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-[#152338] border border-[#1C2A40] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-black text-sky-400 uppercase tracking-wider">📞 طلب ترقية أو حزم إضافية</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              هل ترغب في تغيير الباقة الحالية، تمديد الترخيص، أو ترقية الصلاحيات واستخدام Gemini AI؟
            </p>
          </div>
          <button
            onClick={handleContactAdmin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-[#D4AF37] hover:bg-yellow-400 text-slate-950 border-none cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-95 shadow font-bold"
          >
            <PhoneCall className="w-4 h-4" />
            <span>تواصل مع الإدارة للترقية</span>
          </button>
        </div>
      </div>

      {/* Resource Limits with Progress Bars */}
      <div className="bg-[#152338] border border-[#1C2A40] rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider border-b border-[#1C2A40] pb-2">📊 استهلاك الموارد المحددة</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderProgressBar(
            "الفواتير المالية شهرياً", 
            usageStats.invoices.used, 
            usageStats.invoices.limit, 
            usageStats.invoices.isUnlimited, 
            <FileText className="w-4 h-4 text-amber-500" />
          )}

          {renderProgressBar(
            "المنتجات المضافة للكتالوج", 
            usageStats.products.used, 
            usageStats.products.limit, 
            usageStats.products.isUnlimited, 
            <Package className="w-4 h-4 text-sky-400" />
          )}

          {renderProgressBar(
            "المستخدمين والموظفين", 
            usageStats.users.used, 
            usageStats.users.limit, 
            usageStats.users.isUnlimited, 
            <Users className="w-4 h-4 text-emerald-400" />
          )}

          {renderProgressBar(
            "الفروع التجارية النشطة", 
            usageStats.branches.used, 
            usageStats.branches.limit, 
            usageStats.branches.isUnlimited, 
            <Building className="w-4 h-4 text-amber-400" />
          )}

          {renderProgressBar(
            "نقاط بيع الكاشير POS", 
            usageStats.pos.used, 
            usageStats.pos.limit, 
            usageStats.pos.isUnlimited, 
            <CreditCard className="w-4 h-4 text-purple-400" />
          )}

          {renderProgressBar(
            "المستودعات اللوجستية", 
            usageStats.warehouses.used, 
            usageStats.warehouses.limit, 
            usageStats.warehouses.isUnlimited, 
            <HardDrive className="w-4 h-4 text-pink-400" />
          )}

          {renderProgressBar(
            "طلبات الذكاء الاصطناعي AI", 
            usageStats.aiRequests.used, 
            usageStats.aiRequests.limit, 
            usageStats.aiRequests.isUnlimited, 
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
