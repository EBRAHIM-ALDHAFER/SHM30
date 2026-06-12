/**
 * Elegant creative starter ideas and prompts to inspire the developer on a blank canvas.
 */

export interface IdeaSpark {
  id: string;
  titleAr: string;
  titleEn: string;
  questionAr: string;
  questionEn: string;
  category: "Business" | "Tech" | "Design";
}

export const IDEA_SPARKS: IdeaSpark[] = [
  {
    id: "audience",
    titleAr: "من هو المستخدم المستهدف؟",
    titleEn: "Who is the primary user?",
    questionAr: "حدد تماماً من الذي سيستفيد من هذا التطبيق. ما هي معاناته الحالية؟",
    questionEn: "Define exactly who will benefit from this app. What is their pain point?",
    category: "Business",
  },
  {
    id: "mvp",
    titleAr: "تبسيط النطاق الأولي (MVP)",
    titleEn: "Define the MVP Scope",
    questionAr: "ما هي الميزة الفردية التي لو حذفت كل شيء آخر سيظل التطبيق ذا قيمة؟",
    questionEn: "What is the single core feature without which the app loses its core value?",
    category: "Business",
  },
  {
    id: "aesthetic",
    titleAr: "سمة التصميم ومزاجه",
    titleEn: "Design Theme and Mood",
    questionAr: "هل السمة داكنة وهادئة؟ أم فاتحة ونشيطة؟ اختر لوحة ألوان من لونين أساسيين فقط.",
    questionEn: "Is the vibe dark & cosmic or light & energetic? Choose a neat palette of 2 primary colors.",
    category: "Design",
  },
  {
    id: "architecture",
    titleAr: "معمارية البيانات والمدخلات",
    titleEn: "Data Architecture and Inputs",
    questionAr: "كيف ستتحرك البيانات في التطبيق؟ هل ستحتاج تخزين دائم أم محلي يكفي لفترة التجريب؟",
    questionEn: "How will data flow inside the app? Do you need cloud DB or local storage is enough for MVP?",
    category: "Tech",
  },
];

export const CREATIVE_STARTER_IDEAS = [
  {
    titleAr: "منصة تواصل للقراء",
    titleEn: "Reader's Corner Community",
    descAr: "تطبيق بسيط لمشاركة الاقتباسات المفضلة ومناقشة الكتب بشكل يومي في غرف مخصصة.",
    descEn: "A minimal space to share favorite quotes, rate finished books, and chat with local readers.",
  },
  {
    titleAr: "متتبع العادات الصامت",
    titleEn: "Zen Habit Tracker",
    descAr: "متتبع عادات بدون تنبيهات مزعجة، يعتمد على المساحات الملونة والنقاط المتراكمة لراحة العين.",
    descEn: "A zero-notification habit builder using beautiful colored metrics and minimalist grids.",
  },
  {
    titleAr: "مولد مخطط الأكواد",
    titleEn: "Code Blueprint Sketcher",
    descAr: "أداة بصرية لبناء المخططات وبنية قواعد البيانات التخيلية قبل كتابة الكود الفعلي.",
    descEn: "A high-fidelity layout builder to map DB schemas and flowcharts before active coding.",
  },
  {
    titleAr: "منظم ميزانية السفر التقشفية",
    titleEn: "Backpacker Budget planner",
    descAr: "أداة سريعة لحساب تكاليف الرحلات البرية ومصروفات الطوارئ مع تحويل العملات تلقائياً.",
    descEn: "A rapid expense tracker for remote travel routes with lightweight offline multi-currency calculations.",
  }
];

export const DEV_TIPS_AR = [
  "ابدأ بالبنية الأساسية أولاً، والتفاصيل الجمالية تأتي في خطوة تالية.",
  "احرص على ألا تزيد ميزات تطبيقك الأول عن ٣ ميزات رئيسية مصممة بعناية فائقة.",
  "الكود الأكثر نظافة هو الكود الذي لم تضطر لكتابته. ابحث دائماً عن أبسط فكرة لحل المشكلة.",
  "جرب الكود باستمرار أثناء كتابته، لا تنتظر حتى ينتهي المشروع كاملاً لتكتشف وجود خطأ.",
  "استمع للمستخدم الافتراضي وراعِ البساطة في رحلته داخل الشاشة الواحدة."
];
