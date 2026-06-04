import React, { useState, useEffect } from "react";
import { ThemeColors, ThemeType } from "../types";
import { Palette, Layers, RefreshCw, Star, Sliders, Layout, Check, Sparkles } from "lucide-react";

interface ThemeStudioMarketplaceProps {
  theme: ThemeColors;
  themeKey: ThemeType;
  accentKey: string;
  setThemeKey: (val: ThemeType) => void;
  setAccentKey: (val: string) => void;
  onSaveCustomTheme: (customDetails: any) => void;
  customThemeDetails: any;
  onAddLog: (action: string, details: string) => void;
}

export default function ThemeStudioMarketplace({
  theme,
  themeKey,
  accentKey,
  setThemeKey,
  setAccentKey,
  onSaveCustomTheme,
  customThemeDetails,
  onAddLog
}: ThemeStudioMarketplaceProps) {
  // Local state initialized with current custom details or fallbacks
  const [localCustom, setLocalCustom] = useState<any>({
    bg: customThemeDetails?.bg || "#080D17",
    surface: customThemeDetails?.surface || "#0F1724",
    card: customThemeDetails?.card || "#151F30",
    border: customThemeDetails?.border || "#1C2A40",
    text: customThemeDetails?.text || "#EDF2FF",
    muted: customThemeDetails?.muted || "#5A6E8C",
    fontFamily: customThemeDetails?.fontFamily || "Cairo",
    borderRadius: customThemeDetails?.borderRadius || "12px",
    shadow: customThemeDetails?.shadow || "none"
  });

  const [activeTab, setActiveTab] = useState<"marketplace" | "studio">("marketplace");
  const [applyCustomSuccess, setApplyCustomSuccess] = useState(false);

  useEffect(() => {
    if (customThemeDetails) {
      setLocalCustom({ ...customThemeDetails });
    }
  }, [customThemeDetails]);

  // Inject CSS style element dynamically to reflect the current chosen font in real-time
  useEffect(() => {
    let styleTag = document.getElementById("sahm-applied-font-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.setAttribute("id", "sahm-applied-font-style");
      document.head.appendChild(styleTag);
    }
    const font = theme.fontFamily || "Cairo";
    styleTag.innerHTML = `
      body, select, button, input, textarea {
        font-family: "${font}", "Inter", sans-serif !important;
      }
    `;
  }, [theme]);

  const marketPresets = [
    { key: "royal" as const, name: "سهم رويال الملكي 👑", desc: "أجواء فخمة باللون البرونزي والأسود المطفي وخط أميري كلاسيكي أصيل.", color: "#332614" },
    { key: "executive" as const, name: "سهم التنفيذي الرائد 💼", desc: "مظهر رسمي حاد بزوايا حادة خالية من الانحناء مع خط تجوال الفاخر.", color: "#171717" },
    { key: "luxury" as const, name: "سهم الفاخر ترف ✨", desc: "أعلى درجات الفخامة والأناقة للأعواد الثمينة بدوائر منفرجة ناعمة.", color: "#3A2A20" },
    { key: "saudi" as const, name: "مراسيم سهم الخضراء 🇸🇦", desc: "أجواء ملوكية بلون الوطن الأخضر الجميل والتدرجات العربية.", color: "#082415" },
    { key: "neon_ai" as const, name: "سهم المستقبل نيون 🤖", desc: "شخصية جريئة مضيئة بالبنفسجي النيون مخصصة لعصر الرقمنة والذكاء.", color: "#030207" }
  ];

  const handleApplyPreset = (key: ThemeType, name: string) => {
    setThemeKey(key);
    onAddLog("تحديث الهوية البصرية", `تم تثبيت الهوية الملكية الجاهزة: ${name}`);
  };

  const handleApplyStudioCustom = () => {
    onSaveCustomTheme(localCustom);
    setThemeKey("custom");
    onAddLog("تسمية ثيم مخصص", `تم تصميم واسترجاع ثيم شخصي مخصص بالكامل عبر مخرج Theme Studio Pro`);
    setApplyCustomSuccess(true);
    setTimeout(() => setApplyCustomSuccess(false), 2500);
  };

  return (
    <div
      className="p-6 rounded-3xl border text-right space-y-5 shadow-xl font-sans"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-3.5" style={{ borderColor: theme.border }}>
        {/* Toggle Controls */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab("studio")}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === "studio" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            استوديو التصميم الحر 🛠️
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === "marketplace" ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            سوق القوالب والهوية 🎨
          </button>
        </div>

        <div>
          <h3 className="text-sm font-black flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
            <Palette className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>نظام تخصيص الواجهات والسمات الاستباقي (Theme Studio Pro & Marketplace)</span>
          </h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>
            تعديل نمط الانحناء، الخط، الظلال الملونة، أو اختيار طراز فخم لمتجر مراسيم الطيب بضغطة واحدة
          </p>
        </div>
      </div>

      {activeTab === "marketplace" && (
        <div className="space-y-4">
          <p className="text-[10.5px] text-gray-400 leading-relaxed text-right">
            اختر أحد الهويات والسمات المعتمدة من فريق مصممي سهم لتعزيز تجربة المستخدم وإعطاء المتجر إحساس الفخامة الملكية الفوري:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketPresets.map((preset) => {
              const isSelected = themeKey === preset.key;
              return (
                <div
                  key={preset.key}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-right bg-slate-950/25 transition-all luxury-card-hover ${
                    isSelected ? "border-amber-500 ring-1 ring-amber-500/20" : "border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.color }} />
                      <h4 className="text-xs font-black text-white">{preset.name}</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal">{preset.desc}</p>
                  </div>

                  <button
                    onClick={() => handleApplyPreset(preset.key, preset.name)}
                    className={`w-full py-2 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 font-extrabold cursor-default"
                        : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>الهوية النشطة حالياً</span>
                      </>
                    ) : (
                      <span>تطبيق هذه الهوية فوراً</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-4">
            <h4 className="text-xs font-black text-white border-b pb-2 flex items-center justify-end gap-1.5 border-slate-800">
              <span>خيارات البنية الجرافيكية</span>
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
            </h4>

            <div className="space-y-3.5 text-xs font-bold text-right text-gray-200">
              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400">عائلة الخطوط العربية الشقراء:</label>
                <select
                  value={localCustom.fontFamily}
                  onChange={(e) => setLocalCustom({ ...localCustom, fontFamily: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-900 text-white border border-slate-800 cursor-pointer"
                >
                  <option value="Cairo">خط القاهرة الحديثCairo (مساحات ناصعة)</option>
                  <option value="Tajawal">خط تجوال الرشيق الأنيق Tajawal</option>
                  <option value="Amiri">خط أميري الكلاسيكي للعود والبث الفاخر Amiri</option>
                  <option value="JetBrains Mono">خط نيون تكويدي تكنولوجي JetBrains Mono</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400">حواف البطاقات والمستندات (Curve radius):</label>
                <select
                  value={localCustom.borderRadius}
                  onChange={(e) => setLocalCustom({ ...localCustom, borderRadius: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-900 text-white border border-slate-800 cursor-pointer"
                >
                  <option value="0px">زوايا حادة خشنة (Brutalist style - 0px)</option>
                  <option value="6px">شطب خفيف كلاسيكي متناظر (Subtle Sharp - 6px)</option>
                  <option value="12px">انحناء عصري ناعم متوازن (Standard - 12px)</option>
                  <option value="20px">انحناء ملوكي سهمي فاخر (Luxury Curve - 20px)</option>
                  <option value="30px">الدوائر الكلية والانسجام الكامل (Ultra Rounded - 30px)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-gray-400">كثافة ولون الظلال ثلاثية الأبعاد (Subtle shadows):</label>
                <select
                  value={localCustom.shadow}
                  onChange={(e) => setLocalCustom({ ...localCustom, shadow: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-900 text-white border border-slate-800 cursor-pointer"
                >
                  <option value="none">تصوير مسطح كلياً (Flat Flat - none)</option>
                  <option value="0 4px 12px rgba(0,0,0,0.2)">ظلال عميقة طبيعية (Classic Cozy Shadow)</option>
                  <option value="0 8px 24px rgba(212,175,55,0.15)">وهج ذهبي ملوكي خافت (Glow Royal Gold)</option>
                  <option value="0 0 16px rgba(139,101,246,0.3)">وهج نيون مستقبلي أرجواني (Glow Neon Cyber)</option>
                </select>
              </div>

              {/* Color picks */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">الخلفية الكلية:</label>
                  <input
                    type="color"
                    value={localCustom.bg}
                    onChange={(e) => setLocalCustom({ ...localCustom, bg: e.target.value })}
                    className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">خلفية الكروت:</label>
                  <input
                    type="color"
                    value={localCustom.card}
                    onChange={(e) => setLocalCustom({ ...localCustom, card: e.target.value })}
                    className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">النص الأساسي:</label>
                  <input
                    type="color"
                    value={localCustom.text}
                    onChange={(e) => setLocalCustom({ ...localCustom, text: e.target.value })}
                    className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">لون الحدود (Border):</label>
                  <input
                    type="color"
                    value={localCustom.border}
                    onChange={(e) => setLocalCustom({ ...localCustom, border: e.target.value })}
                    className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyStudioCustom}
              className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all border-0"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{applyCustomSuccess ? "تم حفظ الثيم وتفعيله بنجاح! ✓" : "تطبيق وحفظ التصميم والسمة"}</span>
            </button>
          </div>

          {/* Sandbox Live Viewport Column */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-4 flex flex-col justify-between">
            <h4 className="text-xs font-black text-white border-b pb-2 flex items-center justify-end gap-1.5 border-slate-800">
              <span>لعبة ومعاينة حية للمتجر (Theme Studio Live Viewport Sandbox)</span>
              <Layout className="w-3.5 h-3.5 text-sky-400" />
            </h4>

            {/* Mock Dashboard Element styled in real-time with state values */}
            <div
              className="p-5 border text-right space-y-3 shadow-md"
              style={{
                backgroundColor: localCustom.card,
                borderColor: localCustom.border,
                borderRadius: localCustom.borderRadius,
                boxShadow: localCustom.shadow,
                fontFamily: localCustom.fontFamily
              }}
            >
              <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: localCustom.border }}>
                <span className="text-[8.5px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
                  مكتمل ومصرح
                </span>
                <span className="text-[10px] font-black" style={{ color: localCustom.text }}>
                  مراسيم الطيب • فاتورة بيع #9145
                </span>
              </div>

              <div className="space-y-1.5 text-[9.5px]">
                <div className="flex justify-between">
                  <span style={{ color: localCustom.muted }}>٥٢٠ ر.س</span>
                  <span style={{ color: localCustom.text }}>عود هندي دبل غابات ملوكي مصفى</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: localCustom.muted }}>١٢٠ ر.س</span>
                  <span style={{ color: localCustom.text }}>بخور دوسري عتيق ملكي بالعلبة</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-black pt-2 border-t" style={{ borderColor: localCustom.border, color: localCustom.text }}>
                <span className="text-[#D4AF37] font-mono">٦٤٠ ر.س</span>
                <span>الإجمالي</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-gray-400 text-center leading-relaxed">
              💡 <span className="text-amber-500 font-bold">تلميح السهم الأصيل:</span> عند الضغط على زر تطبيق التصميم الحفظ، سيتم تفويض نظام سهم لتعديل طراز الخط وإعادة توجيه كامل المنصة والأحجام تلقائياً.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
