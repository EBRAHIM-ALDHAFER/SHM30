import React from "react";
import { ThemeColors } from "../types";
import { CreditCard, Rocket, ShieldAlert, Check, RefreshCw, Star } from "lucide-react";

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
}

export default function SaaSSubscriptionEngine({
  theme,
  subscription,
  onUpgrade,
  onAddLog,
  triggerNotification
}: SaaSSubscriptionEngineProps) {
  const plans = [
    {
      k: "A" as const,
      name: "سهم الأساسي Basic",
      desc: "مثالية لتجربة الأدوات وفهم لوحات التحكم ونقاط المبيعات السريعة.",
      price: "مـجـانـاً",
      limit: 1000,
      features: [
        "بـ POS كاشير فردي ومحاسب واحد",
        "إصدار فواتير لغاية ١,٠٠٠ مستند",
        "نسخ احتياطي واستعادة محلي",
        "تكامل بريد داخلي بسيط"
      ],
      notIncluded: [
        "تحليلات الذكاء الاصطناعي الفائقة وسهم برين",
        "صلاحيات مخصصة وحماية RBAC متعددة",
        "مزامنة متقدمة لقنوات Salla, Zid, Amazon"
      ],
      color: "border-slate-800 text-gray-400 bg-slate-950/20"
    },
    {
      k: "B" as const,
      name: "سهم الاحترافي Pro SaaS",
      desc: "الأعلى طلباً ومناسبة تماماً للمحلات ومتاجر العطور والعود ذات الفروع المتعددة كلياً.",
      price: "٢٤٩ ر.س / شهرياً",
      limit: 10000,
      features: [
        "كل ميزات الأساسية + ٣ مستخدمين منسقين",
        "إصدار فواتير لغاية ١٠,٠٠٠ مستند شهرياً",
        "تفعيل ذكاء سهم الاصطناعي (Gemini Core)",
        "مزامنة سحابية مع Salla, Zid وتعديل الكتالوج",
        "تقرير الزكاة التلقائي ودفتر اليومية"
      ],
      notIncluded: [
        "مستخدمون غير محدودين وتراخيص فروع ضخمة",
        "دعم هاتفي فني خاص ٢٤ ساعة"
      ],
      color: "border-amber-500/80 text-amber-500 bg-amber-500/5",
      badge: "الباقة النشطة الأكثر مبيعاً ⭐"
    },
    {
      k: "C" as const,
      name: "سهم النخبة Corporate Enterprise",
      desc: "مخصصة للشركات والمصانع وسلاسل معارض التزيين والتوزيع الكبرى بالخليج.",
      price: "٧٩٩ ر.س / شهرياً",
      limit: 999999, // Unlim
      features: [
        "مستخدمون ومحاسبون غير محدودين بلا قيود",
        "إصدار فواتير وعقود غير محدودة شهرياً",
        "بث كاميرات الفروع، وتفعيل مستودع رب والتخزين",
        "إعداد كامل لخيارات الصلاحيات المتقدمة RBAC",
        "دعم خط ساخن هاتفي ومهندس دمج مخصص"
      ],
      notIncluded: [],
      color: "border-purple-500 text-purple-400 bg-purple-500/5"
    }
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    onUpgrade(plan.k, plan.limit);
    onAddLog("ترقية الاشتراك", `تم اختيار باقة ${plan.name} بمعدل فواتير استهلاك كحد أقصى ${plan.limit.toLocaleString()}`);
    triggerNotification(
      "💳 تم تعديل رخصة SaaS",
      `تم نقل حساب متجرك إلى باقة ${plan.name} وتحديث كافة ميزات المنصة والمزامنة بنجاح.`,
      "success"
    );
  };

  const usagePercent = Math.round((subscription.currentUsed / subscription.limit) * 100);

  return (
    <div
      className="p-6 rounded-3xl border text-right space-y-5 shadow-xl font-sans"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-3.5" style={{ borderColor: theme.border }}>
        <div className="text-[10px] text-gray-400 bg-slate-950/30 px-3 py-1.5 rounded-xl border border-slate-900 flex items-center gap-1.5 font-mono shrink-0">
          <span>التجديد الروتيني التالي:</span>
          <span className="text-[#D4AF37] font-bold">{subscription.renewsAt}</span>
        </div>

        <div>
          <h3 className="text-sm font-black flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>بوابة وتراخيص خدمات الموزع (SaaS Subscription Management Panel)</span>
          </h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>
            تتبع استهلاك فواتير الكاشير، ترقيات الباقات، وضمان الميزات المتصلة بالذكاء الاصطناعي للمتجر
          </p>
        </div>
      </div>

      {/* Interactive Usage progress */}
      <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-900/60 space-y-2.5">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-gray-400">استهلاك فواتير العمليات الحالي:</span>
          <span className="font-mono text-[#D4AF37]">
            {subscription.currentUsed.toLocaleString()} /{" "}
            {subscription.limit > 500000 ? "بلا حدود" : subscription.limit.toLocaleString()}{" "}
            ({usagePercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              usagePercent > 85 ? "bg-rose-500" : usagePercent > 50 ? "bg-amber-500" : "bg-[#D4AF37]"
            }`}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          ></div>
        </div>
        <p className="text-[9px] text-gray-500 leading-normal">
          * يتم تصفير الاستهلاك تلقائياً بتاريخ ١ من كل شهر ميلادي وبدء دورة احتساب فواتير جديدة لمتجر مراسيم الطيب.
        </p>
      </div>

      {/* Subscription cards layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isActive = subscription.tier === plan.k;
          return (
            <div
              key={plan.k}
              className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 relative transition-all luxury-card-hover ${
                plan.color
              } ${isActive ? "ring-2 ring-amber-500/80" : ""}`}
              style={{ backgroundColor: theme.surface }}
            >
              {plan.badge && (
                <div className="absolute top-0 left-0 bg-[#D4AF37] text-black font-black text-[8px] px-3.5 py-1 rounded-br-2xl select-none">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[8px] bg-slate-900/80 text-gray-400 py-0.5 px-2 rounded font-black w-max block">
                    {plan.k === "A" ? "باقة أساسية" : plan.k === "B" ? "باقة احترافية 🚀" : "باقة النخبة 👑"}
                  </span>
                  <h4 className="text-xs font-black text-white" style={{ color: theme.text }}>
                    {plan.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{plan.desc}</p>
                </div>

                <div className="py-2.5 border-t border-b border-slate-800/40 text-center">
                  <span className="text-lg font-black text-white" style={{ color: theme.text }}>
                    {plan.price}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start justify-end gap-1 text-gray-200">
                      <span className="leading-tight">{feat}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>
                  ))}
                  {plan.notIncluded.map((feat, i) => (
                    <div key={i} className="flex items-start justify-end gap-1 text-gray-500 line-through">
                      <span className="leading-tight">{feat}</span>
                      <ShieldAlert className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-2 bg-gradient-to-l from-amber-600 to-yellow-500 text-black text-xs font-extrabold rounded-xl cursor-default opacity-90 border-0"
                  >
                    الباقة النشطة الحالية ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border text-white text-xs font-semibold rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    تثبيت وترقية المزايا
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
