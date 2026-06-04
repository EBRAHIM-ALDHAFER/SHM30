import React, { useState } from "react";
import { ThemeColors } from "../types";
import { 
  Sparkles, ShieldCheck, Code, Layers, Type, Trash, Zap, CheckCircle2, 
  HelpCircle, ChevronRight, Copy, Check, Palette, Palette as Paintbrush,
  Sliders, Move, Play, RefreshCw, Star
} from "lucide-react";

interface SahmDesignSystemProps {
  theme: ThemeColors;
}

export default function SahmDesignSystem({ theme }: SahmDesignSystemProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [testToasts, setTestToasts] = useState<{ id: string; text: string; type: string }[]>([]);

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const triggerTestToast = (text: string, type: "success" | "danger" | "warning" | "info") => {
    const id = Date.now().toString();
    setTestToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setTestToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <div className="space-y-8 select-text text-right" dir="rtl">
      
      {/* 🔮 Brand Aesthetics Disclaimer */}
      <div className="p-6 rounded-3xl border relative overflow-hidden transition-all"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 animate-pulse">
                <Palette className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">مستندات الهندسة الإبداعية</span>
            </div>
            <h3 className="text-base font-black text-white">نظام تصميم سهم الموحد • Sahm Design System</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
              دليل اللغة البصرية الموحدة المتبع في كافة مكونات منصة سهم. يجمع بين البساطة السويسرية، والشفافية التقنية الفاخرة، مع كتل تصميم متناسقة ومتحركة تضمن أسرع تنفيذ للمستخدم.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-bold text-gray-300">
              الإصدار v2.4 (مستقر) 🛡️
            </span>
          </div>
        </div>
      </div>

      {/* Grid containing Palette and Typography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Color Palette Playground */}
        <div className="p-6 rounded-3xl border space-y-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
            <Paintbrush className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-black text-white">لوحة الألوان المعتمدة (Color Tokens)</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "العنبر الملكي (Accent)", hex: theme.accent, desc: "لهجات الواجهة والأزرار الرئيسية" },
              { name: "أرضية النظام (BG)", hex: theme.bg, desc: "خلفية الشاشات الشاملة للمنصة" },
              { name: "الأسطح الثانوية (Surface)", hex: theme.surface, desc: "الألواح الجانبية والقوائم الفرعية" },
              { name: "البطاقات المدمجة (Card)", hex: theme.card, desc: "المحتوى، الجداول، والمساحات الحرة" },
              { name: "الخط الرئيسي (Text)", hex: theme.text, desc: "النصوص ذات التباين اللوني العالي" },
              { name: "الخط الخافت (Muted)", hex: theme.muted, desc: "العناوين المساعدة ونصوص التفاصيل" },
            ].map((color, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-2xl border flex flex-col justify-between h-28 text-right cursor-pointer group active:scale-95 transition-all"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                onClick={() => handleCopy(color.hex, color.name)}
              >
                <div className="flex justify-between items-start">
                  <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color.hex }}></div>
                  <Copy className="w-3" style={{ color: theme.muted }} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-white truncate">{color.name}</div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: theme.accent }}>{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Design Pairs */}
        <div className="p-6 rounded-3xl border space-y-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
            <Type className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-black text-white">الهرم الطبوغرافي ونوع الخط (Typography Scale)</h4>
          </div>

          <div className="space-y-3.5">
            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-mono text-gray-500">font-black leading-tight</span>
              <div className="text-right">
                <span className="text-sm block">عناوين العروض الكبرى • Display Headings</span>
                <span className="text-[11px] block mt-0.5 text-rose-400 font-extrabold">مراسيم الطيب البخورية الفاخرة</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-mono text-gray-500">font-extrabold text-xs</span>
              <div className="text-right">
                <span className="text-xs block">عناوين الأقسام والمكونات • Section Headers</span>
                <span className="text-[11px] block mt-0.5 text-amber-500 font-bold">مركز التحكم والربط المبرمج</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-mono text-gray-500">text-xs font-medium</span>
              <div className="text-right">
                <span className="text-xs block">نص الفقرات والجداول • Standard Content Lines</span>
                <span className="text-[11px] block mt-0.5 text-gray-400">يجري تصدير هذه البيانات آلياً إلى سلة ومستودعات التوزيع بجدة.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="text-[10px] font-mono text-gray-500">text-[10px] font-mono</span>
              <div className="text-right">
                <span className="text-[10px] block">البيانات الرقمية ومفاتيح الرموز • Mono Data</span>
                <span className="text-[10px] font-mono text-sky-400 mt-0.5 block">JE-AUTO-CG-INV-002 • 1010778844</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive UI components showroom */}
      <div className="p-6 rounded-3xl border space-y-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
          <Layers className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-black text-white">معرض عناصر الواجهة التفاعلية (The Interactive Component Showroom)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Buttons Showroom */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">الأزرار التفاعلية (Buttons)</span>
            
            <div className="space-y-2.5">
              <button className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-black text-center cursor-pointer active:scale-95 transition-all"
                style={{ backgroundColor: theme.accent }}>
                زر رئيسي (Primary Accent)
              </button>

              <button className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center border cursor-pointer active:scale-95 transition-all"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
                زر ثانوي (Surface Outline)
              </button>

              <button className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 cursor-pointer active:scale-95 transition-all">
                <Trash className="w-3.5" />
                <span>زر التحذير أو الحذف (Danger Action)</span>
              </button>

              <button className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/35 cursor-pointer animate-pulse">
                <Zap className="w-3.5" />
                <span>زر النيون المتوهج (Glowing Alert)</span>
              </button>
            </div>
          </div>

          {/* Badges and tags */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">الشارات وحالات البيانات (Began Badges)</span>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <span className="text-[11px] font-black text-white">مكتمل أو مدفوع</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-400">مكتمل 🟢</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <span className="text-[11px] font-black text-white">قيد المراجعة أو معلق</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400">معلق 🟠</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <span className="text-[11px] font-black text-white">ملغي أو حرج ومحذوف</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-red-500/15 text-red-400">ملغي 🔴</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <span className="text-[11px] font-black text-white">ربط سحابي سري</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/15 text-indigo-400 font-mono">Cloud-Ready</span>
              </div>
            </div>
          </div>

          {/* Fields and interactive inputs */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">حقول الإدخال والتحقق (Form Fields)</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">حقل كتابة نصي عادي</label>
                <input 
                  type="text" 
                  className="w-full text-xs rounded-xl py-2 px-3 border outline-none text-right"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  placeholder="مثال: الرياض، العليا"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">قائمة برقم مالي (مونو)</label>
                <select 
                  className="w-full text-xs rounded-xl py-2 px-3 border outline-none text-right font-mono"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                >
                  <option>101000 - الأصول المتداولة</option>
                  <option>201000 - المطلوبات الجارية</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toasts and micro-interactions sandbox */}
      <div className="p-6 rounded-3xl border space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
          <Sliders className="w-4 h-4 text-sky-500" />
          <h4 className="text-xs font-black text-white">مختبر التنبيهات وصناديق التفاعل المباشرة (Toasts Testing Sandbox)</h4>
        </div>

        <p className="text-xs text-gray-400">انقر على الأزرار لاختبار كتل الاستشعار المنبثقة للطلب والرد التلقائي بنماذجها الحية المعتمدة:</p>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => triggerTestToast("🎉 تم تحديث مصفوفة الأرباح آلياً!", "success")}
            className="py-1.5 px-3 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
          >
            تنبيه نجاح العملية (Success)
          </button>

          <button 
            onClick={() => triggerTestToast("❌ رصيد المنتج بالفرع المستهدف حرج!", "danger")}
            className="py-1.5 px-3 rounded-lg text-xs font-bold text-red-400 bg-red-400/10 border border-red-500/20 cursor-pointer"
          >
            تنبيه فشل أو خطر (Danger)
          </button>

          <button 
            onClick={() => triggerTestToast("⚠️ جاري إعادة تهيئة مستودع جدة المركزي...", "warning")}
            className="py-1.5 px-3 rounded-lg text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 cursor-pointer"
          >
            تنبيه تحذير مالي (Warning)
          </button>

          <button 
            onClick={() => triggerTestToast("📡 تم مزامنة تفاصيل الربط مع متجر سلة بنجاح.", "info")}
            className="py-1.5 px-3 rounded-lg text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 cursor-pointer"
          >
            تنبيه إعلامي عام (Info)
          </button>
        </div>

        {/* Floating container for sample toasts */}
        <div className="fixed bottom-20 left-6 z-50 flex flex-col gap-2.5 max-w-sm">
          {testToasts.map(toast => (
            <div 
              key={toast.id} 
              className={`p-3.5 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md animate-fadeIn transition-all text-xs font-bold text-right`}
              style={{ 
                backgroundColor: theme.card, 
                borderColor: toast.type === "success" ? "#10B98150" : toast.type === "danger" ? "#EF444450" : toast.type === "warning" ? "#F59E0B50" : "#3B82F650"
              }}
              dir="rtl"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ 
                  backgroundColor: toast.type === "success" ? "#10B981" : toast.type === "danger" ? "#EF4444" : toast.type === "warning" ? "#F59E0B" : "#3B82F6"
                }}
              ></span>
              <span style={{ color: theme.text }}>{toast.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
