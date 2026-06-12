import React, { Component, useState } from "react";
import { Product, ThemeColors } from "../types";
import { 
  Sparkles, X, Image as ImageIcon, Copy, Check, Megaphone, 
  Smartphone, BookOpen, MessageSquare, Share2, 
  AlertTriangle, RefreshCw, Volume2, ArrowLeft, Layers
} from "lucide-react";

interface BoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Robust Error Boundary wrapper
export class ProductPromotionBoundary extends Component<BoundaryProps, BoundaryState> {
  props: BoundaryProps;
  state: BoundaryState;

  constructor(props: BoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ProductPromotionBuilder Error Block caught]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 rounded-3xl border text-center space-y-6 max-w-xl mx-auto my-12 bg-slate-900 border-red-500/30 text-right">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500 text-3xl">
            ⚠️
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-black text-white">حدث خطأ أثناء فتح أداة الترويج</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              واجه التطبيق خطأً غير متوقع أثناء معالجة تفاصيل هذا الصنف ترويجياً. يرجى التأكد من اكتمال معلومات المنتج بالمخزون والمحاولة لاحقاً.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="py-2.5 px-6 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-all cursor-pointer border-0"
            >
              العودة للمنتجات
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProductPromotionBuilderProps {
  product: Product | null;
  theme: ThemeColors;
  onClose: () => void;
  triggerNotification?: (text: string, type?: any) => void;
}

type PromoType = "social" | "story" | "banner" | "whatsapp" | "catalog";

export default function ProductPromotionBuilder({
  product,
  theme,
  onClose,
  triggerNotification
}: ProductPromotionBuilderProps) {
  const [selectedType, setSelectedType] = useState<PromoType>("social");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customPrice, setCustomPrice] = useState(product?.price ? String(product.price) : "");
  const [customNote, setCustomNote] = useState("");
  const [simulatedError, setSimulatedError] = useState(false);

  // Simulated output content for the selected promotion type
  const [generatedContent, setGeneratedContent] = useState<string>("");

  if (simulatedError) {
    throw new Error("Simulated failure in ProductPromotionBuilder");
  }

  if (!product) {
    return (
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 text-right"
        dir="rtl"
      >
        <div className="bg-slate-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-black text-white">خطأ في استيراد البيانات</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              لم يتم العثور على المنتج المطلوب لتعديل أو توليد ترويجه الذكي. يرجى الاختيار من قائمة المنتجات المتاحة مجدداً.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all cursor-pointer border-0"
          >
            العودة للمنتجات
          </button>
        </div>
      </div>
    );
  }

  const promoTypesInfo = [
    { id: "social", label: "إعلان سوشيال ميديا", icon: Megaphone, desc: "بوست انستقرام وتويتر جذاب وهاشتاقات حيوية" },
    { id: "story", label: "ستوري", icon: Smartphone, desc: "نص لقصص السناب شات والإنستقرام سريعة الالتهام" },
    { id: "banner", label: "بانر", icon: Layers, desc: "منشور صوري طويل للإعلانات الممولة" },
    { id: "whatsapp", label: "نص واتساب", icon: MessageSquare, desc: "برودكاست ترحيبي مع خطاف مبيعات واقتباس مباشر" },
    { id: "catalog", label: "كتالوج مصغر", icon: BookOpen, desc: "عرض مبسط بملامح الصنف وقائمة الأسعار والتواصل" },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setCopied(false);
    setTimeout(() => {
      const priceStr = customPrice || String(product.price);
      let content = "";

      const notesSection = customNote.trim() ? `✨ ملحوظة خاصة: ${customNote.trim()}\n` : "";

      switch (selectedType) {
        case "social":
          content = `💎 جديد وحصري من مراسيم الطيب! 💎\n\nنقدم لكم ملك الأناقة والجاذبية: 【 ${product.name} 】✨\n\n${product.description || "لمسة ساحرة تعبّر عن هويتك الراقية وتطبع أثرك الفاتن بكل مكان."}\n\n🏷️ سعر العرض المحدود: ${priceStr} ر.س فقط! (شامل الضريبة)\n${notesSection}\n⚡ سارع بالاقتناء فوراً قبل نفاد الكمية من الفروع.\n\n📱 للطلب والاستفسار يرجى مراسلتنا بالخاص أو زيارة متجرنا المعتمد!\n#مراسيم_الطيب #فخامة_العود #ترويج_سهم #تخفيضات_الموسم #تجارة_سعودية`;
          break;
        case "story":
          content = `🔥 عاااجل لعشاق الفخامة! 🔥\n\nوصل حديثاً: ${product.name} 🤩\n✨ فخامة طبيعية وجاذبية لا تقاوم تدوم طويلاً...\n\n💰 السعر الخرافي: ${priceStr} ر.س فقط!\n\n👇 اسحب الشاشة الآن للحجز السريع قبل نهاية عرض الـ 24 ساعة! 🤳`;
          break;
        case "banner":
          content = `┌────────────────────────────┐\n  🌟 عرض خاص من صالة عرض مراسيم الطيب 🌟\n└────────────────────────────┘\n\n   🔥  【 ${product.name} 】  🔥\n\n  ✅ ثبات عالي ونفحات عطرية ملكية فريدة\n  ✅ ضمان الجودة الذهبية بنسبة 100%\n  \n  🏷️ سعر استثنائي للمترددين: ${priceStr} ر.س\n  ${customNote ? `✨ ملاحظة: ${customNote}\n` : ""}\n  📍 متاح في كافة فروعنا وعبر كاشير سهم\n  🛒 اضغط هنا للطلب الفوري ومعاينة المزايا!`;
          break;
        case "whatsapp":
          content = `السلام عليكم ورحمة الله وبركاته 🌸✨\n\nيسر أسرة *مراسيم الطيب* أن تضع بين أيديكم أحدث ابتكاراتنا العطرية الفاخرة:\n\n👑 *${product.name}*\n\n🔹 *الوصف:* ${product.description || "أصالة طبيعية تجسد الكرم والأناقة العربية بأسلوب متفرد."}\n🔹 *سعر العرض المميز:* ${priceStr} ر.س فقط!\n${notesSection}\n🎁 مناسب جداً للإهداء الشخصي والمناسبات المرموقة.\n\n🛒 *للحجز الفوري والتوصيل لموقعكم:* يرجى تزويدنا بالاسم والموقع عبر الرد على هذه الرسالة مباشرة 🚗👇`;
          break;
        case "catalog":
          content = `📋 كتيب العرض السريع لمجموعة الطيب 📋\n\n● الصنف: ${product.name}\n● التصنيف الأساسي: ${product.category || "منتج فاخر"}\n● رقم السلعة (SKU): ${product.sku || "N/A"}\n● السعر الأساسي المعين: ${priceStr} ر.س\n● تفاصيل المكونات: ${product.description || "مطابق للمواصفات الطبيعية المعتمدة."}\n\n🔍 تمت الصياغة عبر محرك سهم للذكاء التسويقي الموحد ERP v9.\n📞 اطلب الآن من الكاشير أو الوكيل المعتمد.`;
          break;
      }
      setGeneratedContent(content);
      setGenerating(false);
      if (triggerNotification) {
        triggerNotification("تم توليد النص الترويجي والمحتوى الإعلاني بنجاح! ✨", "success");
      }
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    if (triggerNotification) {
      triggerNotification("تم نسخ النص الترويجي إلى الحافظة! 📋", "success");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto text-right font-sans"
      dir="rtl"
    >
      <div 
        className="bg-slate-900 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col my-4 max-h-[92vh] overflow-hidden"
        style={{ color: theme.text }}
      >
        {/* Header bar */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white">صانع ومولّد الترويجات الذكي ✨📣</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">صياغة محتوى دعائي ذكي متعدد القنوات مخصص لهذا المنتج</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/60 text-gray-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body with custom grid */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Right side: Product Overview & Settings */}
            <div className="md:col-span-5 space-y-5">
              
              {/* Product Info Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-zinc-800/80 space-y-4">
                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-wider">📦 معاينة السلعة المستهدفة:</h3>
                
                <div className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-zinc-800/80 flex items-center justify-center overflow-hidden shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="space-y-1 text-right">
                    <h4 className="text-xs font-black text-white leading-snug">{product.name}</h4>
                    <span className="text-[10px] bg-slate-800/80 text-gray-400 px-2 py-0.5 rounded font-mono">
                      {product.sku || "N/A"}
                    </span>
                    <div className="text-[11px] font-bold text-emerald-400 font-mono mt-1">
                      {product.price} ر.س
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div className="text-[10px] text-gray-400 border-t border-zinc-800/60 pt-2 leading-relaxed">
                    <span className="text-gray-500 font-bold block mb-0.5">وصف مختصر للسلعة:</span>
                    {product.description.length > 100 ? `${product.description.slice(0, 100)}...` : product.description}
                  </div>
                )}
              </div>

              {/* Custom Marketing Modifiers */}
              <div className="p-4 rounded-2xl bg-slate-955 border border-zinc-800/50 space-y-3.5 text-right">
                <h3 className="text-[11px] font-black text-amber-500">⚙️ إعدادات الصياغة الترويجية:</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">سعر العرض المستهدف (ر.س)</label>
                  <input 
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder={String(product.price)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 border border-zinc-800 text-xs font-mono text-white outline-none focus:border-violet-500 transition-all font-black text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-bold">ملحوظة أو ميزة خاصة بالإعلان (اختياري)</label>
                  <textarea 
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="مثال: شحن مجاني اليوم، كود الخصم MOM20..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-slate-950/50 border border-zinc-800 text-xs text-white outline-none focus:border-violet-500 transition-all text-right resize-none"
                  />
                </div>
              </div>

              {/* Trigger Fail Safe Checkbox for accept criteria */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-red-950/45 bg-red-950/10 text-right mt-2 justify-between">
                <div>
                  <span className="text-[10px] text-red-400 font-bold block">اختبار الحماية ضد الانهيار (Failsafe)</span>
                  <p className="text-[8.5px] text-gray-500 leading-none">تفعيل لمحاكاة خطأ برمجي ورؤية Error State البديل</p>
                </div>
                <input 
                  type="checkbox"
                  checked={simulatedError}
                  onChange={(e) => setSimulatedError(e.target.checked)}
                  className="accent-red-500 cursor-pointer h-3.5 w-3.5"
                />
              </div>

            </div>

            {/* Left side: Promotion Select & Output */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              
              {/* Type Select Row */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-amber-500 block">📢 اختر نمط الحملة الإعلانية:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {promoTypesInfo.map(pt => {
                    const Icon = pt.icon;
                    const isSelected = selectedType === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(pt.id as PromoType);
                          // Clear previous output so they generate again
                          setGeneratedContent("");
                        }}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between h-20 active:scale-[0.98] cursor-pointer ${
                          isSelected 
                            ? "bg-violet-600/15 border-violet-500 text-white" 
                            : "bg-slate-950/40 border-zinc-800 hover:border-zinc-700 text-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-violet-400" : "text-gray-500"}`} />
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                        </div>
                        <div>
                          <span className="block text-xs font-black">{pt.label}</span>
                          <span className="block text-[8px] opacity-80 mt-0.5 leading-none overflow-hidden text-ellipsis whitespace-nowrap">{pt.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Generation & Copy Box */}
              <div className="flex-grow p-4 bg-slate-950/70 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-3 min-h-[220px]">
                
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2 mb-2">
                    <span className="text-[9.5px] font-extrabold tracking-widest text-sky-400 uppercase">مخرجات الصياغة الإعلانية المقترحة 🪄</span>
                    {generatedContent && (
                      <button
                        onClick={handleCopy}
                        type="button"
                        className="py-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all border-0"
                      >
                        {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-gray-400" />}
                        <span>{copied ? "تم النسخ!" : "نسخ النص"}</span>
                      </button>
                    )}
                  </div>
                  
                  {generating ? (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-2 text-center py-12">
                      <RefreshCw className="w-7 h-7 text-violet-500 animate-spin" />
                      <div>
                        <span className="text-xs font-black block">جاري تحليل تفاصيل السلعة صياغة حملة... ✨</span>
                        <span className="text-[9.5px] text-gray-500 font-mono">SAHM INTELLIGENCE AD GENERATION ACTIVE</span>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <textarea
                      readOnly
                      value={generatedContent}
                      className="w-full flex-grow bg-transparent text-xs text-slate-200 outline-none resize-none font-sans leading-relaxed text-right p-0"
                      rows={8}
                    />
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-12 text-gray-500 space-y-2">
                      <span className="text-2xl">🧠🪄</span>
                      <div>
                        <span className="text-xs font-bold block text-gray-400">مستعد للصياغة التكتيكية الفورية!</span>
                        <p className="text-[9px] text-gray-500 max-w-sm mx-auto leading-normal mt-1 font-sans">
                          حدد أسلوب ونمط الإعلان المنشور المناسب، واحصل على نص دعائي جذاب مُعزز بالهاشتاقات والتخفيضات ومُصاغ باللهجة الخليجية المحببة للجمهور المحلي.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 border-t border-zinc-800/40 pt-3">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-grow py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد نص الترويج بالذكاء ✨</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/60 border-t border-zinc-800/80 flex justify-between items-center shrink-0">
          <p className="text-[9px] text-gray-500 font-sans">صناعة إمكانيات عصرية تنافسية • Sahm Promotion Hub 2026</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              type="button"
              className="py-1.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>إغلاق والرجوع للقائمة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
