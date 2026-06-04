import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Robust JSON extractor to handle any potential surrounding formatting text
function extractJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  // Remove markdown blocks if present
  let cleaned = trimmed.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // Extract from the first '{' to last '}'
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }

  // Extract from the first '[' to last ']'
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    const candidate = cleaned.slice(arrStart, arrEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }

  throw new Error("Failed to parse JSON validation structure from model response: " + trimmed.slice(0, 200));
}

// Strictly typed JSON Schema for the analyze product endpoint
const analyzeProductSchema = {
  type: Type.OBJECT,
  properties: {
    product_name: {
      type: Type.STRING,
      description: "اسم تجاري جذاب بالكامل للمنتج بناءً على الصورة والمظهر",
    },
    category: {
      type: Type.STRING,
      description: "الفئة الرئيسية (مثل: عطور، مشروبات، سلع استهلاكية، أزياء)",
    },
    description: {
      type: Type.STRING,
      description: "وصف تسويقي استثنائي ومقنع بأسلوب السرد لزيادة مبيعات هذا المنتج (3 لـ 4 جمل بليغة)",
    },
    features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "أهم المزايا والخصائص التشريحية للمنتج",
    },
    target_audience: {
      type: Type.STRING,
      description: "تحديد الجمهور المستهدف في السوق السعودي والخليجي بالتفصيل",
    },
    suggested_price_min: {
      type: Type.INTEGER,
      description: "الحد الأدنى للسعر المقترح بالريال كعدد صحيح",
    },
    suggested_price_max: {
      type: Type.INTEGER,
      description: "الحد الأقصى للسعر المقترح بالريال كعدد صحيح",
    },
    market_analysis: {
      type: Type.STRING,
      description: "تحليل شامل لواقع المنافسة على هذا المنتج في الأسواق السعودية وطريقة التميز عنهم",
    },
    marketing_tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "نصائح ترويجية لرفع معدلات التحويل",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "هاشتاقات مروّجة جاهزة ومناسبة للمملكة",
    },
    platforms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "المنصات التسويقية والشبكات المقترحة",
    },
  },
  required: [
    "product_name",
    "category",
    "description",
    "features",
    "target_audience",
    "suggested_price_min",
    "suggested_price_max",
    "market_analysis",
    "marketing_tips",
    "hashtags",
    "platforms",
  ],
};

// Strictly typed JSON Schema for the prepare advertising post endpoint
const preparePostSchema = {
  type: Type.OBJECT,
  properties: {
    product_name: {
      type: Type.STRING,
      description: "اسم المنتج الاحترافي المقترح أو المطور بناء على التفاصيل",
    },
    short_description: {
      type: Type.STRING,
      description: "عبارة رنانة موجزة لا تتجاوز جملتين تلخص الجاذبية والصفقة لمتجرك",
    },
    instagram_caption: {
      type: Type.STRING,
      description: "كابشن متكامل وحيوي لمنصة إنستغرام يجمع الفائدة مع رموز تعبيرية (emojis) منسقة لتحقيق مظهر أنيق وإثارة رغبة الشراء وحض على الشراء",
    },
    tiktok_caption: {
      type: Type.STRING,
      description: "سيناريو خطاف (Video Hook Video Script Idea) لتصوير في تيك توك، مع نص ترويجي جذاب للمقطع لجعل المشاهد ينجذب في أول 3 ثواني",
    },
    twitter_caption: {
      type: Type.STRING,
      description: "تغريدة دعائية مثيرة وعصرية لمنصة X، تختزل القوة والجاذبية في كبسولة ترويجية سريعة مع هاشتاقات ذكية",
    },
    whatsapp_message: {
      type: Type.STRING,
      description: "رسالة تسويق برودكاست ممتازة جداً للواتساب للبيع المباشر للزبائن تصف روعة المنتج والتوصيل وكيفية الدفع والطلب ومعدلة للعواطف والخدمة الفائقة",
    },
    amazon_description: {
      type: Type.STRING,
      description: "وصف مفصل لمتجر أمازون بلهجة موثوقة ومحترفة، يحتوي على مميزات مفصلة كشكل نقاط واضحة تزيد الثقة (Bullet points)",
    },
    salla_description: {
      type: Type.STRING,
      description: "وصف كامل وطويل مهيأ بجدارة لصديق محركات البحث (SEO) لمتجر سلة لإقناع المتصفح بالشراء المباشر مع توفير مبررات القيمة وجودة المنتج",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "هاشتاقات إعلانية مناسبة",
    },
    suggested_price: {
      type: Type.INTEGER,
      description: "رقم للسعر المناسب المقترح بالريال وهو رقم صحيح",
    },
  },
  required: [
    "product_name",
    "short_description",
    "instagram_caption",
    "tiktok_caption",
    "twitter_caption",
    "whatsapp_message",
    "amazon_description",
    "salla_description",
    "hashtags",
    "suggested_price",
  ],
};

const app = express();
const PORT = 3000;

// Enable larger body parser limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google GenAI Client with User-Agent set for telemetry
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust fallback & retry mechanism to handle transient 503 (high demand) and other service errors
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: { contents: any; config?: any },
  initialModel = "gemini-3.5-flash"
): Promise<any> {
  const modelsToTry = [initialModel, "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        console.log(`[Sahm AI] Attempting content generation with model: ${model} (attempt ${attempts + 1}/3)...`);
        const response = await ai.models.generateContent({
          ...params,
          model: model,
        });
        console.log(`[Sahm AI] Successfully generated content using ${model}`);
        return response;
      } catch (error: any) {
        attempts++;
        lastError = error;

        // Safely extract error message string and JSON context to avoid crash inside catch block
        let errorMessage = "";
        let errorStringified = "";
        try {
          if (error && typeof error === "object") {
            errorStringified = JSON.stringify(error);
            errorMessage = typeof error.message === "string" ? error.message : JSON.stringify(error.message || "");
          } else if (error) {
            errorMessage = String(error);
            errorStringified = String(error);
          }
        } catch (e) {
          errorMessage = error?.message ? String(error.message) : "Unknown Error";
          errorStringified = "Failed to stringify error context";
        }

        console.warn(`[Sahm AI] Attempt ${attempts}/3 failed for model ${model}:`, errorMessage || error);
        
        // Helper function for safe substring search
        const checkContains = (searchTerm: string) => {
          const lowerSearch = searchTerm.toLowerCase();
          return (
            errorMessage.toLowerCase().includes(lowerSearch) ||
            errorStringified.toLowerCase().includes(lowerSearch)
          );
        };

        // If it is a key error or unauthorized bad request, don't keep retrying, switch to next or throw
        const isKeyError = error.status === 400 || 
                           checkContains("API_KEY_INVALID") || 
                           checkContains("key") ||
                           checkContains("unauthorized") ||
                           checkContains("forbidden");
        if (isKeyError) {
          break;
        }

        // If the model is currently experiencing high demand (503 UNAVAILABLE), fall back to the next model immediately
        const isUnavailable = error.status === 503 || 
                            error.status === 429 ||
                            checkContains("503") || 
                            checkContains("429") ||
                            checkContains("high demand") || 
                            checkContains("UNAVAILABLE") ||
                            checkContains("overloaded") ||
                            checkContains("quota");
        if (isUnavailable) {
          console.log(`[Sahm AI] Model ${model} is UNAVAILABLE/experiencing high demand. Swapping to next model immediately...`);
          break; // break the attempt loop to try the next model in the outer list
        }

        // Wait a bit before retrying (exponential backoff)
        if (attempts < maxAttempts) {
          const delay = Math.pow(2, attempts) * 500; // 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  throw lastError;
}

// REST API endpoint: Analyzer image with Gemini LLM (multimodal)
app.post("/api/analyze-product", async (req, res) => {
  try {
    const { base64, mimeType } = req.body;
    if (!base64) {
      return res.status(400).json({ error: "الصورة مطلوبة لإجراء التحليل." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "رمز الوصول (GEMINI_API_KEY) غير متاح. يرجى إضافته في إعدادات Secrets لتشغيل ذكاء سهم الاصطناعي.",
        });
      }
      throw e;
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64,
      },
    };

    const prompt = `أنت خبير تسويق وتجارة إلكترونية ودراسات جدوى متميز جداً ومتخصص في منصات البيع والأسواق في المملكة العربية السعودية والخليج العربي.
قم بتحليل صورة منتج التجارة الإلكترونية هذا المرفق، وقدّم تقريراً شاملاً واحترافياً لتسويقه باللغة العربية.
يجب أن ترجع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
بنية كائن JSON المطلوبة:
{
  "product_name": "اسم تجاري جذاب بالكامل للمنتج بناءً على الصورة والمظهر",
  "category": "الفئة الرئيسية (مثل: عطور، مشروبات، سلع استهلاكية، أزياء)",
  "description": "وصف تسويقي استثنائي ومقنع بأسلوب السرد لزيادة مبيعات هذا المنتج (3 لـ 4 جمل بليغة)",
  "features": [
    "ميزة تنافسية رئيسية 1 للمنتج من جودة وتصميم وتأثير",
    "ميزة تنافسية رئيسية 2",
    "ميزة تنافسية رئيسية 3",
    "ميزة تنافسية رئيسية 4",
    "ميزة تنافسية رئيسية 5"
  ],
  "target_audience": "تحديد الجمهور المستهدف في السوق السعودي والخليجي بالتفصيل",
  "suggested_price_min": 100,
  "suggested_price_max": 250,
  "market_analysis": "تحليل شامل لواقع المنافسة على هذا المنتج في الأسواق السعودية وطريقة التميز عنهم",
  "marketing_tips": [
    "نصيحة مبيعات تكتيكية لبيع هذا المنتج بنجاح وتوفير عينات أو كوبونات",
    "نصيحة ثانية لإنتاج فيديوهات تسويقية ريادية على تيك توك",
    "نصيحة ثالثة للاحتفاظ بالعميل ورضا المشتري"
  ],
  "hashtags": [
    "#هاشتاق_رائج_1",
    "#هاشتاق_رائج_2",
    "#هاشتاق_رائج_3",
    "#هاشتاق_رائج_4",
    "#هاشتاق_رائج_5"
  ],
  "platforms": [
    "منصة تواصل ومحتوى مناسبة (مثل سناب شات وإنستغرام)",
    "بيئة مبيعات مفضلة (مثل متجر سلة الخاص أو زد أو أمازون)"
  ]
}
يرجى التأكد من أن قيم أسعار suggested_price_min و suggested_price_max هي أرقام صحيحة (integers).`;

    const response = await generateContentWithRetry(ai, {
      contents: [imagePart, prompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: analyzeProductSchema,
      },
    });

    const responseText = response.text || "{}";
    const resultObj = extractJson(responseText);

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error analyzing product image:", error);
    return res.status(500).json({
      error: "فشل تحليل الصورة بالذكاء الاصطناعي. يرجى تجربة صورة أخرى أو التحقق من الإعدادات.",
      details: error.message,
    });
  }
});

// REST API endpoint: AI prepares complete advertising content for multiple platforms
app.post("/api/prepare-post", async (req, res) => {
  try {
    const { base64, mimeType, productName, price, quantity } = req.body;
    if (!productName) {
      return res.status(400).json({ error: "اسم المنتج مطلوب لتجهيز الإعلانات." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "رمز الوصول (GEMINI_API_KEY) غير متاح. يرجى إضافته في إعدادات Secrets لتشغيل ذكاء سهم الاصطناعي.",
        });
      }
      throw e;
    }

    const contentsArray: any[] = [];
    if (base64) {
      contentsArray.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64,
        },
      });
    }

    const prompt = `أنت خبير إعلانات رقمية وصناعة محتوى ترويجي استثنائي ومتقن للكتابة بأسلوب عربي خليجي فصيح ومحبب للجمهور السعودي.
مهمتك هي تجهيز نصوص وكابشن جاهزة للنشر الفوري لحملة ترويجية لمنتج باسم "${productName}"، بسعر البيع المدخل "${price || "تلقائي"}" ريال سعودي، والكمية المتوفرة "${quantity || "محدودة"}".
يجب تحليل الصورة المرفقة (إن وجدت) لتدعيم المحتوى بالتفاصيل الدقيقة والفوائد الحقيقية للمنتج.
الناتج يجب أن يمثل كائن JSON حصراً ومخرجاته مكتوبة بالعربية الاحترافية الجذابة:
{
  "product_name": "اسم المنتج الاحترافي المقترح أو المطور بناء على التفاصيل",
  "short_description": "عبارة رنانة موجزة لا تتجاوز جملتين تلخص الجاذبية والصفقة لمتجرك",
  "instagram_caption": "كابشن متكامل وحيوي لمنصة إنستغرام يجمع الفائدة مع رموز تعبيرية (emojis) منسقة لتحقيق مظهر أنيق وإثارة رغبة الشراء وحض على الشراء",
  "tiktok_caption": "سيناريو خطاف (Video Hook Video Script Idea) لتصوير في تيك توك، مع نص ترويجي جذاب للمقطع لجعل المشاهد ينجذب في أول 3 ثواني",
  "twitter_caption": "تغريدة دعائية مثيرة وعصرية لمنصة X، تختزل القوة والجاذبية في كبسولة ترويجية سريعة مع هاشتاقات ذكية",
  "whatsapp_message": "رسالة تسويق برودكاست ممتازة جداً للواتساب للبيع المباشر للزبائن تصف روعة المنتج والتوصيل وكيفية الدفع والطلب ومعدلة للعواطف والخدمة الفائقة",
  "amazon_description": "وصف مفصل لمتجر أمازون بلهجة موثوقة ومحترفة، يحتوي على مميزات مفصلة كشكل نقاط واضحة تزيد الثقة (Bullet points)",
  "salla_description": "وصف كامل وطويل مهيأ بجدارة لصديق محركات البحث (SEO) لمتجر سلة لإقناع المتصفح بالشراء المباشر مع توفير مبررات القيمة وجودة المنتج",
  "hashtags": [
    "#هاشتاق_إعلاني_مناسب_1",
    "#هاشتاق_إعلاني_مناسب_2"
  ],
  "suggested_price": "رقم للسعر المناسب المقترح بالريال وهو رقم صحيح"
}
لا تدع مجرد علامات ترميز إضافية في مخرجاتك، أرسل الكود بصيغة JSON نظيف تماماً.`;

    contentsArray.push(prompt);

    const response = await generateContentWithRetry(ai, {
      contents: contentsArray,
      config: {
        responseMimeType: "application/json",
        responseSchema: preparePostSchema,
      },
    });

    const responseText = response.text || "{}";
    const resultObj = extractJson(responseText);

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error preparing post content:", error);
    return res.status(500).json({
      error: "فشل تجهيز المحتوى الإعلاني بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});
app.post("/api/omnichat-reply", async (req, res) => {
  try {
    const { chatContent, customerName, category, aiMemoryContext, copilotMode, products, invoices } = req.body;
    if (!chatContent && !copilotMode) {
      return res.status(400).json({ error: "محتوى الرسالة مطلوب لتوليد الرد." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "GEMINI_API_KEY_MISSING",
        });
      }
      throw e;
    }

    const brandTone = aiMemoryContext?.find((m: any) => m.key && m.key.indexOf("نبرة") !== -1)?.val || "ملكية راقية وفخمة لمنتجات العود الطبيعي والبخور";
    const target = aiMemoryContext?.find((m: any) => m.key && m.key.indexOf("السوق") !== -1)?.val || "التركيز على الفئة الفاخرة وساعات الذروة";

    let prompt = "";

    if (copilotMode) {
      // Formulate a beautiful Copilot prompt containing the actual database products and invoices
      const prodContext = Array.isArray(products) && products.length > 0 
        ? products.map(p => `- المنتج: ${p.name} | SKU: ${p.sku} | السعر: ${p.price} ر.س | التكلفة: ${p.cost} ر.س | المخزون المتاح: ${p.stock}`).join("\n")
        : "- لا يوجد بيانات منتجات.";

      const linkedInvoicesList = Array.isArray(invoices) && invoices.length > 0
        ? invoices.filter((i: any) => i.customer === customerName).map((i: any) => `- فاتورة بقيمة ${i.total} ر.س بتاريخ ${i.date} (الحالة: ${i.status})`).join("\n")
        : "- لا يوجد فواتير تاريخية للعميل.";

      if (copilotMode === "profit") {
        prompt = `أنت العقل اللوجستي والمستشار التسويقي الذكي "سهم كوبايلوت الذكي - Sahm Copilot Pro".
نقوم حالياً بالاستعداد لمحادثة العميل النخبة "${customerName}".
نريد صياغة عرض فخم ومغري جداً لمنتج "فائق الربحية بالمنظومة" بأسلوب محادثة واتساب مباشر، بليغ ومقنع.

قائمة منتجات المتجر الفعلية المتوفرة:
${prodContext}

الفواتير التاريخية لهذا العميل:
${linkedInvoicesList}

المطلوب:
1. ارصد المنتج الأعلى ربحية (يعني أعلى فارق بين سعر البيع والتكلفة) المتوفر بمخزون كافٍ (> 5 قطع).
2. صغ رسالة موجهة للعميل "${customerName}" عبر واتساب بنبرة "${brandTone}" تعرض عليه هذا الصنف كنوع من التقدير وتوفير باقة مخصصة مع شحن فوري.
3. اكتب الرسالة المقترحة مباشرة بدون مقدمات أو شرح؛ رسالة فخمة مستعدّين لإرسالها فوراً تظهر فخامة العود ورائحته الفخمة وتوفير الخصم المبدئي له.`;
      } else if (copilotMode === "weekend") {
        prompt = `أنت مساعد التسويق بمشروع "مراسيم الطيب". العميل "${customerName}" نشط حالياً بالسنترال.
نريد اقتراح عرض عطلة نهاية الأسبوع (Weekend Double Combo) له.

البيانات الحالية لمتجرنا:
${prodContext}

المطلوب:
1. صغ توليفة ثنائية (باقة) بأفكار فخمة تدمج منتجاً عالي التقييم بالمخزن مع بوليصة شحن أرامكس السريعة.
2. اعرض خصماً رمزياً (مثلاً خصم ١٥٪ إلى ٢٠٪) واستخدم الاسم المخصص للعميل.
3. صغ الرد بنبرة ملكية ورمزية مريحة لإبهار العميل حياً. اكتب الرسالة المراد نسخها مباشرة بدون أي تعليق جانبي.`;
      } else if (copilotMode === "diagnosis") {
        prompt = `أنت نظام الرصد والتشخيص الاستباقي "Sahm OS Diagnosis Engine". العميل "${customerName}" لديه تواصل مفتوح.
نريد تحليل سبب تقلب مبيعاته أو ركود تفاعله ومصادقته بمسودة رد علاجي حاسم.

تفاصيل ومعاملات العميل الحالية:
${linkedInvoicesList}

المخزون والمنتجات الحالية:
${prodContext}

المطلوب:
1. بتحليل الداتا، حدد العوامل المحتملة (تأخر بالتوريد، فواتير معلقة مع بلنس سلبي، أو تكرار طلب صنف معين).
2. صغ اعتذاراً استباقياً لطيفاً ومبتكراً أو طمأنة بالحديث عن التحسينات في العنونة الوطنية مع أرامكس وتسهيلات الدفع. Put the solution directly.
3. قدم له رمز خصم تقديري خاص بالـ VIP باسمه. اكتب نص الرسالة الملكية البليغة مباشرة للنشر.`;
      } else if (copilotMode === "clearance") {
        prompt = `أنت العقل اللوجستي والمخزني "Sahm Inventory Copilot". العميل "${customerName}" في السنترال ونريد تصريف "الأصناف الراكدة" (أي بضائع بمخزون مرتفع مثل > 35 قطعة).

إليك بيانات المنتجات الحقيقية:
${prodContext}

المطلوب:
1. ابحث في القائمة عن صنف راكد بمخزون مرتفع جداً.
2. صغ عرض تصفية استثنائي (خصم حاد ومغري للتسييل السريع) للعميل "${customerName}" عبر واتساب يدق على وتر الفخامة والفرصة التي لا تتكرر.
3. اكتب الرد النهائي الفخم مباشرة لنسخه للعميل.`;
      } else {
        prompt = `أنت مساعد الذكاء الاصطناعي "Sahm OmniChat Copilot". صمم رداً بليغاً للعميل "${customerName}" يحيط بكامل تفاصيل مخزوننا وتفاهماتنا.
المنتجات:
${prodContext}
الرسالة:
"${chatContent}"`;
      }
    } else {
      prompt = `أنت مساعد الذكاء الاصطناعي الذكي "Sahm OmniChat AI" الخاص بمتجر "مراسيم الطيب" الراقي بالمملكة العربية السعودية.
مهمتك هي صياغة رد احترافي مذهل، لبق، ويحقق الفخامة والولاء الفوري، للعميل "${customerName}" الذي أرسل رسالة ومصنف تحت فئة "${category}".

سياق الذاكرة التنظيمية للبراند:
- نبرة الهوية البراند: ${brandTone}
- تركيز السوق والجمهور: ${target}

الرسالة الأخيرة من العميل:
"${chatContent}"

المطلوب: صياغة الرد المقترح للعميل مباشرة بأسلوب ملكي فاخر، فخم، بليغ ومعزز بالرموز التعبيرية المناسبة لإعطاء الإحساس بالفخامة والتميز الفوري.
اكتب الرد المقترح مباشرة وبدون أي مقدمات أو علامات ترميز إضافية.`;
    }

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
    });

    return res.json({ response: response.text || "أهلاً بك يا فندم، يسعدنا خدمتك بأعلى معايير الرقي والتميز والضيافة الملكية الكريمة." });
  } catch (error: any) {
    console.error("Error in OmniChat Reply:", error);
    return res.status(500).json({
      error: "فشل توليد رد المحادثة بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});

app.post("/api/accounting-analyst", async (req, res) => {
  try {
    const { metrics, query } = req.body;
    if (!metrics) {
      return res.status(400).json({ error: "البيانات المالية مطلوبة للتحليل." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "رمز الوصول (GEMINI_API_KEY) غير متاح. يرجى إضافته في إعدادات Secrets لتشغيل ذكاء سهم الاصطناعي وجلب المحلل المالي.",
        });
      }
      throw e;
    }

    const systemPrompt = `أنت الخبير والمستشار المالي الذكي "سهم AI Financial Analyst" لـ نظام سهم ERP المحاسبي الاحترافي بالشرق الأوسط.
المطلوب منك هو توضيح الواقع المالي وتحليل الربحية وحجم الهدر بدقة وإيجاز شديد لأصحاب المحلات التجارية والمصانع والعيادات المتوسطة والمنضمين للنظام.
اكتب باللغة العربية بلهجة متمكنة، وقدم نصائح وإجابات واضحة تخاطب التاجر السعودي والخليجي بأريحية وشمول واقترح ممارسات عملية لرفع المبيعات وضبط المصاريف وزكاة النقد.

تفاصيل الواقع المالي للشركة حالياً:
- الأصول (نشطة وسيولة): ${metrics.assets || 0} ريال
- الخصوم والديون: ${metrics.liabilities || 0} ريال
- حقوق الملكية: ${metrics.equity || 0} ريال
- المبيعات الإجمالية: ${metrics.revenues || 0} ريال
- تكلفة البضاعة (COGS): ${metrics.cogs || 0} ريال
- المصروفات التشغيلية (الرواتب، الكهرباء، التسويق، الإهلاك): ${metrics.expenses || 0} ريال
- صافي الأرباح: ${metrics.netProfit || 0} ريال
- السيولة والعهد والصندوق المتاح: ${metrics.cash || 0} ريال
- زكاة المال التقريبية (النقد + بضاعة المخزون - الديون المدفوعة) * 2.5%: ${metrics.zakat || 0} ريال
- مستحقات الموردين المتأخرة (AP): ${metrics.ap || 0} ريال
- مستحقات مبيعات العملاء (AR): ${metrics.ar || 0} ريال

سؤال التاجر أو استفساره المالي:
"${query || "أعطني تقريراً تشخيصياً شاملاً ومقترحات خفض الهدر الفورية"}"

أجب باقتضاب (3-5 جمل بليغة) مركزة ومباشرة ومصحوبة برقم أو نصيحة عملية ملموسة لدعم التاجر وتخسيس التكاليف الزائدة.`;

    const response = await generateContentWithRetry(ai, {
      contents: systemPrompt,
    });

    return res.json({ response: response.text || "عذراً، لم تنجح عملية المحاكاة المالية حياً." });
  } catch (error: any) {
    console.error("Error in AI Financial Analyst:", error);
    return res.status(500).json({
      error: "فشل استدعاء المحلل المالي الذكي بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});

// REST API endpoint: Sahm Brain Executive Intelligence Console (Focus Point 4)
app.post("/api/sahm-brain", async (req, res) => {
  try {
    const { storeName, activeCity, totalRevenue, productsCount, customerNameSelected, aiMemoryContext } = req.body;

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "GEMINI_API_KEY_MISSING",
        });
      }
      throw e;
    }

    const brandMemory = JSON.stringify(aiMemoryContext || []);

    const prompt = `أنت العقل المدبر والمحلل الافتراضي الخبير "سهم برين - Sahm Brain" للشركات والمتاجر الفاخرة بالمملكة.
قم بتحليل المؤشرات الحية الآتية لمتجر "${storeName || "مراسيم الطيب"}" في مدينة "${activeCity || "الرياض"}":
- إجمالي إيرادات المبيعات: ${totalRevenue || 0} ريال
- عدد المنتجات الحالية بالكتالوج: ${productsCount || 0} منتج
- العميل النشط الفاخر المختار: ${customerNameSelected || "بدون"}
- ذاكرة البراند المسجلة: ${brandMemory}

المطلوب: توليد 3 توصيات ورؤى استراتيجية عميقة وملموسة تسمى "رؤى سهم برين الفاخرة" (Sahm Brain Royal Insights) لرفع المبيعات والتميز الملكي في السوق الخليجي.
يجب أن ترجع المخرجات ككائن JSON نظيف تماماً بالصيغة التالية (ويجب ألا تحتوي على علامات ترميزية إضافية):
{
  "insights": [
    {
      "title": "عنوان ذكي ومبتكر للتوصية الفخمة",
      "text": "تفصيل مالي وتسويقي ذكي وعملي من 1-2 جمل رنانة ومقنعة للغاية تليق بصفوة الاستثمار ومراسيم الطيب.",
      "score": 98
    },
    {
      "title": "عنوان التوصية الثانية",
      "text": "تفصيل مالي وتسويقي ذكي وعملي لزيادة هوامش الأرباح لمنتجات العود الملكية تيك توك وسناب شات.",
      "score": 95
    },
    {
      "title": "عنوان التوصية الثالثة",
      "text": "فرز الهدر وتحفيز استهداف الرياض وجدة برباط أرامكس السريع.",
      "score": 90
    }
  ]
}
أرسل مخرجاتك كـ JSON فقط دون وضع أي كود تسويقي أو علامات ماركداون إضافية.`;

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
    });

    const responseText = response.text || "{}";
    const resultObj = extractJson(responseText);

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error in Sahm Brain:", error);
    return res.status(500).json({
      error: "فشل استدعاء عقل سهم برين بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});

// Strictly typed JSON Schema for the competitor scraping & analysis endpoint
const scrapeCompetitorSchema = {
  type: Type.OBJECT,
  properties: {
    product_name: {
      type: Type.STRING,
      description: "اسم المنتج المستخرج الدقيق",
    },
    image: {
      type: Type.STRING,
      description: "صورة المنتج المستقاة من الويب أو الصورة التوضيحية الافتراضية عالية الجودة",
    },
    price: {
      type: Type.NUMBER,
      description: "السعر الحالي المكتشف كرقم صحيح بالداتا",
    },
    original_price: {
      type: Type.NUMBER,
      description: "السعر الأصلي قبل التخفيض، إن وجد، وإلا null أو تساوي السعر الأساسي",
    },
    currency: {
      type: Type.STRING,
      description: "العملة، افتراضياً ريال سعودي (ر.س)",
    },
    description: {
      type: Type.STRING,
      description: "الوصف المختصر للمنتج تسويقياً من الموقع",
    },
    availability: {
      type: Type.STRING,
      description: "حالة توفر المنتج: 'متوفر' أو 'غير متوفر'",
    },
    store_name: {
      type: Type.STRING,
      description: "اسم متجر المنافس أو هوية البراند المكتشفة",
    },
    category: {
      type: Type.STRING,
      description: "التصنيف الرئيسي للمنتج",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "الكلمات المفتاحية للمنتج",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "نقاط قوة المنافس في هذا الصنف",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "نقاط ضعف المنافس في هذا الصنف",
    },
    initial_comparison: {
      type: Type.STRING,
      description: "مقارنة مبدئية مع منتجنا أو ترشيحات للتنافس والتميز عليه",
    },
  },
  required: [
    "product_name",
    "image",
    "price",
    "original_price",
    "currency",
    "description",
    "availability",
    "store_name",
    "category",
    "keywords",
    "strengths",
    "weaknesses",
    "initial_comparison",
  ],
};

// REST API endpoint: Scrape competitor product details via URL + AI fallback
app.post("/api/scrape-competitor-product", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "الرابط مطلوب للبدء بعملية الجلب والتتبع تلقائياً." });
    }

    let htmlContent = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const text = await response.text();
        htmlContent = text.slice(0, 8000); // Excerpt to remain friendly to token parameters
      }
    } catch (err) {
      console.warn("[Sahm Scraper] Direct fetch failed or timed out. Falling back to LLM heuristic mapping:", err);
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "رمز الوصول (GEMINI_API_KEY) غير متاح. يرجى إضافته في إعدادات Secrets لتشغيل ذكاء سهم الاصطناعي وجلب المنافسين وتوليد التحليلات.",
        });
      }
      throw e;
    }

    // Comprehensive instruction prompt
    const prompt = `أنت العقل المدبر لنظام ذكاء الأسواق (Market intelligence Engine) في منصة "سهم ERP" الذكية بالشرق الأوسط.
مهمتك هي استقصاء وجلب بيانات منتج المنافس بدقة تامة من الرابط: "${url}".

تفاصيل المحتوى المسترجع من الصفحة (قد يكون فارغاً أو مقتصراً بسبب حظر حماية المواقع):
"""
${htmlContent || "(تعذر جلب محتوى الويب مباشرة لتواجد جدار حماية Cloudflare أو حظر إقليمي، اعتمد على تفاصيل الرابط والاسم المستخلص والذكاء المعرفي التنبئي)"}
"""

التعليمات الهامة:
1. استخلص بدقة فائقة: اسم المنتج المنافس، السعر الحالي، السعر المكتشف قبل الخصم (إن وجد)، العملة (ر.س)، التوفر، واسم المتجر.
2. إذا تعذر الجلب المباشر، فكر بذكاء تنبئي بالاعتماد على تركيبة الرابط (مثلاً Salla, Zid, Amazon, Noon, Shopify) وصنف بيانات واقعية متزنة ومطابقة تماماً لمتوسط أسعار المملكة.
3. قم بإجراء مقارنة مبدئية تفصيلية واستنتج نقاط قوة وضعف المنافس في هذا المنتج والكلمات المفتاحية وتصنيف المنتج.
4. بالنسبة للصورة: ابحث في كود HTML عن رابط صورة المنتج (مثل og:image, twitter:image) أو ولّد رابط صورة افتراضي جذاب ورائع يناسب المنتج المكتشف (ودهن العود ومراسيم الطيب).

يجب إرجاع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
تأكد من أن جميع الحقول المطلوبة متواجدة والقيم المادية هي أرقام (numbers).`;

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scrapeCompetitorSchema,
      },
    });

    const responseText = response.text || "{}";
    const resultObj = extractJson(responseText);

    // Append standard tracking metadata
    const nowStr = new Date().toLocaleString("ar-SA");
    resultObj.fetched_at = nowStr;
    resultObj.last_updated = nowStr;
    resultObj.competitor_url = url;

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error scraping competitor URL:", error);
    return res.status(500).json({
      error: "فشل استخلاص وتحليل بيانات صفحة المنافس بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});


// Strictly typed schemas for Smart Catalog Builder
const catalogProductSchema = {
  type: Type.OBJECT,
  properties: {
    productId: { type: Type.STRING },
    title: { type: Type.STRING, description: "عنوان جذاب وقصير للمنتج يناسب الكتالوج" },
    desc: { type: Type.STRING, description: "وصف تسويقي استثنائي وموجز ومغر للشراء" },
    features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "أهم 3 إلى 5 مزايا حقيقية للمنتج مكتوبة بأسلوب شيق ومقنع"
    },
    whatsapp_text: { type: Type.STRING, description: "صيغة رسالة واتساب رائعة ومنسقة تشمل إيموجي وعلامات تمييز للمنتج وسعره ورابط الطلب المفترض" },
    instagram_text: { type: Type.STRING, description: "نص مخصص لإنستجرام مع هاشتاقات ذكية وعبارات تفاعل مميزة" },
    print_text: { type: Type.STRING, description: "وصف رسمي وبليغ جداً ومختصر يلائم الطباعة على الكروت التعريفية" }
  },
  required: ["productId", "title", "desc", "features", "whatsapp_text", "instagram_text", "print_text"]
};

const catalogBatchSchema = {
  type: Type.OBJECT,
  properties: {
    generations: {
      type: Type.ARRAY,
      items: catalogProductSchema,
      description: "قائمة التوليدات التسويقية والترويجية للمنتجات المعطاة"
    }
  },
  required: ["generations"]
};

// REST API endpoint: Smart Catalog Builder copy generator
app.post("/api/generate-catalog-marketing", async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "قائمة المنتجات مطلوبة لصياغة الكتالوج التسويقي." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(400).json({
          error: "رمز الوصول (GEMINI_API_KEY) غير متاح. يرجى إضافته في إعدادات Secrets لتشغيل معالج صانع الكتالوجات الذكي بالذكاء الاصطناعي.",
        });
      }
      throw e;
    }

    const prompt = `أنت الخبير الإستراتيجي التسويقي لـ "سهم ERP" ووكيل الذكاء الاصطناعي الأبرز في صناعة المبيعات الإعلانية والكتالوجات الراقية بالشرق الأوسط والمملكة العربية السعودية.
مهمتك هي صياغة وتوليد المحتوى الترويجي، والميزات الفارقة، ونصوص ترويجية غنية (واتساب، إنستقرام، كتالوج مطبوع) بجودة احترافية مبهرة وجذابة للغاية لكل منتج من المنتجات المعطاة بالأسفل.

المنتجات المطلوب توليد محتواها الإعلاني:
${JSON.stringify(products, null, 2)}

التعليمات الهامة لكل منتج فريد (تأكد من مطابقة الـ productId المار لكل توليد بشكل دقيق تماماً):
1. "title": صغ عنوانًا جذابًا واحترافيًا وقصيرًا جدًا للمنتج (مثال: "عبق الأصالة — كلمنتان فاخر").
2. "desc": اكتب وصفًا تسويقيًا استثنائيًا مكثفًا يثير الحواس ورغبة الاقتناء (2-3 جمل بليغة بطابع خليجي راقٍ وعطور عود).
3. "features": استخلص أهم 3 ميزات حقيقية للمنتج على شكل جمل قصيرة وقوية جداً (مثل: "تقطير طبيعي معتق"، "أمان تام للأطفال والملابس").
4. "whatsapp_text": صيغة واتساب جاهزة ومريحة للعيون مع إيموجي منسق (مثل 👑, 🛍️, ✨, 📦, 🏷️) توضح الفوائد، السعر الأساسي، وعبارة تحفيزية للشراء الفوري.
5. "instagram_text": منشور إنستغرام بأسلوب عصري ملفت، مع هاشتاقات سعودية متصدرة ملائمة للمنتج (مثل #عطور_سهم #فخامة).
6. "print_text": وصف رسمي وبليغ وموجز جداً مخصص ليطبع على الكروت الورقية الفاخرة المرفقة بالمنتج.

يجب إرجاع النتيجة ككائن JSON تمامًا وبدون أي علامات خارج نطاق الكود الخاص بالـ JSON، ويكون مطابقًا للمخطط المعطى (Schema).`;

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: catalogBatchSchema,
      },
    });

    const responseText = response.text || "{}";
    const resultObj = extractJson(responseText);

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error generating catalog marketing copy:", error);
    return res.status(500).json({
      error: "فشل توليد نصوص الكتالوج الذكي بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});


// Configure Vite middleware in development or serve built files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files from dist directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
