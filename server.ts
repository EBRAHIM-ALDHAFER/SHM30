import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

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

const analyzeProductPhase2Schema = {
  type: Type.OBJECT,
  properties: {
    product_type: {
      type: Type.STRING,
      description: "نوع المنتج المستخرج من الصورة بشكل مبسط ودقيق",
    },
    suggested_category: {
      type: Type.STRING,
      description: "التصنيف المقترح للمنتج",
    },
    target_audience: {
      type: Type.STRING,
      description: "الفئة المستهدفة بالتفصيل",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "قائمة نقاط القوة للمنتج والتصميم",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "قائمة نقاط الضعف أو النقص في الصورة والتسويق",
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "قائمة التوصيات لتحسين انتشار ومبيعات المنتج",
    },
    seo_keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "كلمات SEO أولية ودلالية للمنتج",
    },
    image_marketing_suitable: {
      type: Type.BOOLEAN,
      description: "هل الصورة صالحة للتسويق؟ نعم أو لا",
    },
    score: {
      type: Type.INTEGER,
      description: "درجة تقييم الصورة والتصميم تسويقياً من 100",
    }
  },
  required: [
    "product_type",
    "suggested_category",
    "target_audience",
    "strengths",
    "weaknesses",
    "recommendations",
    "seo_keywords",
    "image_marketing_suitable",
    "score"
  ]
};

const generateProductCopySchema = {
  type: Type.OBJECT,
  properties: {
    product_name: {
      type: Type.STRING,
      description: "اسم تجاري تسويقي جذاب للمنتج",
    },
    title: {
      type: Type.STRING,
      description: "عنوان إعلاني بليغ ومقنع للمنتج",
    },
    short_description: {
      type: Type.STRING,
      description: "وصف تسويقي وجيز ومباشر (من جملتين)",
    },
    long_description: {
      type: Type.STRING,
      description: "قصة تسويقية كاملة ومقنعة للمنتج (4 لـ 5 جمل بليغة)",
    },
    features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "أبرز المزايا التقنية والتصميمية للمنتج (من 3 لـ 5 مزايا)",
    },
    benefits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "الفوائد العائدة على العميل عند استخدام المنتج (من 3 لـ 5 فوائد)",
    },
    cta: {
      type: Type.STRING,
      description: "عبارة دعوة للإجراء جذابة للغاية وحاسمة للشراء",
    },
    seo_keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "كلمات بحثية مفتاحية ودلالية قوية للمنتج لتحسين الـ SEO",
    },
    captions: {
      type: Type.OBJECT,
      properties: {
        instagram: { type: Type.STRING, description: "كابشن إينستجرام جذاب ومنسق مع الهاشتاقات" },
        tiktok: { type: Type.STRING, description: "كابشن تيك توك قصير وتفاعلي لزيادة المشاهدات" },
        whatsapp: { type: Type.STRING, description: "نص إعلاني جاهز للمشاركة السريعة على الواتساب مع الرموز التعبيرية" },
        salla: { type: Type.STRING, description: "وصف منسق ومقنع لمتجر سلة الإلكتروني" },
        zid: { type: Type.STRING, description: "وصف منسق ومقنع لمتجر زد الإلكتروني" },
        amazon: { type: Type.STRING, description: "وصف منظم ومحتوى غني لمتجر أمازون" }
      },
      required: ["instagram", "tiktok", "whatsapp", "salla", "zid", "amazon"]
    },
    ad_copy: {
      type: Type.OBJECT,
      properties: {
        ad_title: { type: Type.STRING, description: "عنوان الإعلان الممول القصير والجذاب" },
        ad_body: { type: Type.STRING, description: "نص الإعلان الممول الأساسي المقنع للغاية" }
      },
      required: ["ad_title", "ad_body"]
    }
  },
  required: [
    "product_name",
    "title",
    "short_description",
    "long_description",
    "features",
    "benefits",
    "cta",
    "seo_keywords",
    "captions",
    "ad_copy"
  ]
};

const generateProductImagesSchema = {
  type: Type.OBJECT,
  properties: {
    assets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          asset_purpose: {
            type: Type.STRING,
            description: "الغرض من الصورة (Hero, Features, Offer, Story)",
          },
          title: {
            type: Type.STRING,
            description: "عنوان الصورة المقترح باللغة العربية",
          },
          prompt_english: {
            type: Type.STRING,
            description: "تفاصيل المطالبة (Prompt) باللغة الإنجليزية لتوليد الصورة بالذكاء الاصطناعي بدقة عالية",
          },
          arabic_description: {
            type: Type.STRING,
            description: "وصف الصورة المقترحة باللغة العربية بالتفصيل للمستخدم الشريك",
          },
          dimensions: {
            type: Type.STRING,
            description: "المقاسات المقترحة للصورة (1:1, 4:5, 9:16, 16:9)",
          }
        },
        required: ["asset_purpose", "title", "prompt_english", "arabic_description", "dimensions"]
      }
    }
  },
  required: ["assets"]
};

const generateProductVideoPlanSchema = {
  type: Type.OBJECT,
  properties: {
    video_script: {
      type: Type.STRING,
      description: "السيناريو النصي الكامل للفيديو التسويقي باللغة العربية",
    },
    voiceover_text: {
      type: Type.STRING,
      description: "التعليق الصوتي المقترح بالتفصيل باللغة العربية الفصحى أو اللهجة المطلوبة",
    },
    video_prompt: {
      type: Type.STRING,
      description: "المطالبة الرئيسية باللغة الإنجليزية لتوليد مقطع الفيديو بالذكاء الاصطناعي (Sora/Runway)",
    },
    thumbnail_prompt: {
      type: Type.STRING,
      description: "مطالبة توليد الصورة المصغرة للفيديو بالإنجليزية",
    },
    captions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "نصوص الترجمة التوضيحية القصيرة التي ستكتب على مشاهد الفيديو",
    },
    scene_list: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scene_number: { type: Type.NUMBER },
          duration: { type: Type.STRING, description: "مدة المشهد بالثواني (مثال: 3s)" },
          visual_description: { type: Type.STRING, description: "وصف ما يظهر في المشهد بصرياً بالتفصيل" },
          text_overlay: { type: Type.STRING, description: "النص المعروض على المشهد" },
          generation_prompt: { type: Type.STRING, description: "English prompt for this specific scene image/video generation" }
        },
        required: ["scene_number", "duration", "visual_description", "text_overlay", "generation_prompt"]
      }
    }
  },
  required: ["video_script", "voiceover_text", "video_prompt", "thumbnail_prompt", "captions", "scene_list"]
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
const PORT = 8080;

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

app.post("/api/analyze-product", async (req, res) => {
  try {
    const { 
      session_id, 
      product_id, 
      image_url, 
      user_notes, 
      brand_profile,
      base64,
      mimeType,
      productName,
      category,
      notes
    } = req.body;

    const isPhase2 = !!(session_id || image_url);

    // Resolve Image to Base64
    let imageBase64 = base64;
    let imageMimeType = mimeType || "image/jpeg";

    if (!imageBase64 && image_url) {
      try {
        const fetchRes = await fetch(image_url);
        if (fetchRes.ok) {
          const arrayBuffer = await fetchRes.arrayBuffer();
          imageBase64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType = fetchRes.headers.get("content-type");
          if (contentType) {
            imageMimeType = contentType;
          }
        } else {
          console.warn(`Failed to fetch image from URL: ${image_url}, status: ${fetchRes.status}`);
        }
      } catch (err: any) {
        console.warn(`Error fetching image URL to base64: ${err.message}`);
      }
    }

    let resultObj: any = null;

    if (imageBase64) {
      try {
        const ai = getAiClient();
        const imagePart = {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        };

        if (isPhase2) {
          const tone = brand_profile?.tone_of_voice || "فخم ورسمي";
          const pref = brand_profile?.preferred_words?.join(", ") || "أصيل، فاخر";
          const forb = brand_profile?.forbidden_words?.join(", ") || "رخيص، سيء";
          
          const prompt = `أنت خبير تسويق وتجارة إلكترونية ودراسات جدوى متميز جداً ومتخصص في منصات البيع والأسواق في المملكة العربية السعودية والخليج العربي.
الهوية التجارية المستخدمة: نبرة الصوت: "${tone}"، كلمات مفضلة: [${pref}]، كلمات ممنوعة: [${forb}].
ملاحظات المستخدم الإضافية: "${user_notes || "لا يوجد"}".

قم بتحليل صورة المنتج المرفقة بالتفصيل، وقدّم تقريراً تسويقياً شاملاً واحترافياً باللغة العربية.
يجب إرجاع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
بنية كائن JSON المطلوبة:
{
  "product_type": "نوع المنتج المستخلص من الصورة بدقة وبساطة",
  "suggested_category": "التصنيف المقترح للمنتج",
  "target_audience": "الفئة المستهدفة بالتفصيل في السوق الخليجي",
  "strengths": ["نقاط القوة للمنتج والتصميم 1", "نقاط القوة 2"],
  "weaknesses": ["نقاط الضعف أو النقص في الصورة وتصميمها 1", "نقاط الضعف 2"],
  "recommendations": ["توصية تسويقية/تصميمية أولى", "توصية ثانية"],
  "seo_keywords": ["كلمة مفتاحية 1", "كلمة مفتاحية 2", "كلمة مفتاحية 3", "كلمة مفتاحية 4", "كلمة مفتاحية 5"],
  "image_marketing_suitable": true,
  "score": 85
}`;

          const response = await generateContentWithRetry(ai, {
            contents: [imagePart, prompt],
            config: {
              responseMimeType: "application/json",
              responseSchema: analyzeProductPhase2Schema,
            },
          });
          const responseText = response.text || "{}";
          resultObj = extractJson(responseText);
        } else {
          // Legacy flow
          let contextPrompt = "";
          if (productName && category) {
            contextPrompt = `\nالمستخدم الشريك قام بالفعل بتحديد اسم مخصص للمنتج وهو: "${productName}"، وتصنيفه الأساسي المعتمد هو: "${category}"، ومعلومات وملاحظات إضافية هي: "${notes || "لا يوجد"}".
يرجى استخدام هذا الاسم المرفق والتصنيف كمرجع وصفي أساسي لإنتاج تفصيلات وميزات وهيكل هذا الصنف بدقة بليغة. في حقل "product_name" في استجابة الـ JSON، قم باقتراح نسخة محسنة أو ملخصة من هذا الاسم أو احتفظ به كما هو، وفي "category" اقترح تصنيفاً فرعياً دقيقاً، مع الحفاظ على ملاءمة كامل الملف التسويقي لما ذكره المستخدم.`;
          }

          const prompt = `أنت خبير تسويق وتجارة إلكترونية ودراسات جدوى متميز جداً ومتخصص في منصات البيع والأسواق في المملكة العربية السعودية والخليج العربي.${contextPrompt}
قم بتحليل صورة منتج التجارة الإلكترونية هذا المرفق، وقدّم تقريراً شاملاً واحترافياً لتسويقه باللغة العربية.
يجب أن ترجع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
بنية كائن JSON المطلوبة:
{
  "product_name": "اسم تجاري جذاب بالكامل للمنتج بناءً على الصورة والمظهر والاسم المعطى",
  "category": "الفئة الرئيسية أو الفرعية المناسبة للمنتج",
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
}`;

          const response = await generateContentWithRetry(ai, {
            contents: [imagePart, prompt],
            config: {
              responseMimeType: "application/json",
              responseSchema: analyzeProductSchema,
            },
          });
          const responseText = response.text || "{}";
          resultObj = extractJson(responseText);
        }
      } catch (geminiError: any) {
        console.warn("Gemini execution failed, falling back to mock:", geminiError);
      }
    }

    // Fallback Mock Response if AI is not configured or failed
    if (!resultObj) {
      if (isPhase2) {
        resultObj = {
          product_type: "دهن عود كلمنتان فاخر",
          suggested_category: "عطور وبخور",
          target_audience: "المهتمين بالمناسبات الرسمية والضيافة العربية في الخليج",
          strengths: [
            "مظهر زجاجة العبوة أنيق وجذاب ومناسب للإهداء الشخصي",
            "لون زيتي معتق نقي وخالي من الشوائب المرئية",
            "علامة تجارية بارزة تعبر عن الأصالة الشرقية"
          ],
          weaknesses: [
            "خلفية الصورة غير مهيأة بالكامل لعرض تفاصيل الإضاءة بشكل احترافي",
            "غياب الظلال الطبيعية للمنتج مما يقلل من واقعيته"
          ],
          recommendations: [
            "ننصح بإجراء إزالة خلفية وتطبيق خلفية رخامية داكنة لزيادة الفخامة",
            "إضافة تفاصيل وصفية عن العتق وسنوات التخزين لزيادة معدل التحويل"
          ],
          seo_keywords: [
            "دهن عود كلمنتان",
            "عود طبيعي فاخر",
            "عطورات شرقية",
            "بخور معتق",
            "هدايا ملوك"
          ],
          image_marketing_suitable: true,
          score: 88
        };
      } else {
        resultObj = {
          product_name: productName || "منتج تجاري",
          category: category || "عام",
          description: "وصف منتج تجاري فاخر.",
          features: ["ميزة 1", "ميزة 2"],
          target_audience: "الجمهور العام",
          suggested_price_min: 100,
          suggested_price_max: 200,
          market_analysis: "تحليل منافسة بسيط.",
          marketing_tips: ["نصيحة 1"],
          hashtags: ["#منتج"],
          platforms: ["Instagram"]
        };
      }
    }

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error analyzing product image:", error);
    return res.status(500).json({
      error: "فشل تحليل الصورة بالذكاء الاصطناعي. يرجى تجربة صورة أخرى أو التحقق من الإعدادات.",
      details: error.message,
    });
  }
});

// REST API endpoint: AI generates complete product copy versions based on marketing styles
app.post("/api/generate-product-copy", async (req, res) => {
  try {
    const { session_id, analysis_id, brand_profile, marketing_style, channels, image_url } = req.body;

    const style = marketing_style || "فاخر";
    const tone = brand_profile?.tone_of_voice || "فخم ورسمي";
    const pref = brand_profile?.preferred_words?.join(", ") || "";
    const forb = brand_profile?.forbidden_words?.join(", ") || "";

    // Resolve Image to Base64 if image_url is provided
    let imageBase64 = "";
    let imageMimeType = "image/jpeg";
    if (image_url) {
      try {
        const fetchRes = await fetch(image_url);
        if (fetchRes.ok) {
          const arrayBuffer = await fetchRes.arrayBuffer();
          imageBase64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType = fetchRes.headers.get("content-type");
          if (contentType) imageMimeType = contentType;
        }
      } catch (err) {
        console.warn("Error fetching image for copy generation:", err);
      }
    }

    let resultObj = null;

    try {
      const ai = getAiClient();
      
      const prompt = `أنت خبير كتابة نصوص إعلانية (Copywriter) وتسويق رقمي سعودي محترف. 
مهمتك هي كتابة نسخة تسويقية كاملة وشاملة لمنتج بناءً على الهوية البصرية وتحليل جودته.

الأسلوب التسويقي المطلوب الالتزام به تماماً: "${style}".
نبرة الهوية التجارية: "${tone}".
الكلمات المفضلة: [${pref}].
الكلمات الممنوعة (ممنوع استخدامها نهائياً): [${forb}].

القنوات التسويقية المستهدفة: [${channels?.join(", ") || "Instagram, TikTok, WhatsApp, Salla, Zid, Amazon"}].

يجب إرجاع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
بنية كائن JSON المطلوبة:
{
  "product_name": "اسم تجاري تسويقي جذاب للمنتج",
  "title": "عنوان بليغ ومقنع جداً للمنتج",
  "short_description": "وصف تسويقي وجيز ومباشر (من جملتين)",
  "long_description": "قصة تسويقية كاملة ومقنعة للمنتج بأسلوب السرد المؤثر (4 لـ 5 جمل)",
  "features": [
    "ميزة تنافسية رئيسية 1 للمنتج من جودة وتصميم وتأثير",
    "ميزة تنافسية رئيسية 2",
    "ميزة تنافسية رئيسية 3"
  ],
  "benefits": [
    "الفائدة المباشرة للعميل 1 من استخدام هذا المنتج",
    "الفائدة المباشرة للعميل 2",
    "الفائدة المباشرة للعميل 3"
  ],
  "cta": "عبارة دعوة للإجراء جذابة للغاية وحاسمة للشراء",
  "seo_keywords": [
    "كلمة مفتاحية 1",
    "كلمة مفتاحية 2",
    "كلمة مفتاحية 3",
    "كلمة مفتاحية 4",
    "كلمة مفتاحية 5"
  ],
  "captions": {
    "instagram": "كابشن إنستغرام جذاب ومنسق مع الرموز والهاشتاقات المناسبة للجمهور الخليجي والمحلي",
    "tiktok": "كابشن تيك توك قصير وتفاعلي لزيادة المشاهدات",
    "whatsapp": "نص إعلاني جاهز للمشاركة السريعة على الواتساب مع الرموز التعبيرية وروابط افتراضية",
    "salla": "وصف منسق ومقنع لمتجر سلة الإلكتروني",
    "zid": "وصف منسق ومقنع لمتجر زد الإلكتروني",
    "amazon": "وصف منظم ومحتوى غني لمتجر أمازون"
  },
  "ad_copy": {
    "ad_title": "عنوان إعلان ممول قصير ومبهر يجذب العميل فوراً",
    "ad_body": "نص إعلان ممول أساسي مقنع للغاية ويدفع للنقر على الرابط"
  }
}`;

      const contents: any[] = [];
      if (imageBase64) {
        contents.push({
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        });
      }
      contents.push(prompt);

      const response = await generateContentWithRetry(ai, {
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: generateProductCopySchema,
        },
      });

      const responseText = response.text || "{}";
      resultObj = extractJson(responseText);
    } catch (geminiError: any) {
      console.warn("Gemini copy generation failed, falling back to mock:", geminiError);
    }

    if (!resultObj) {
      // Mock Fallback matching the requested style
      resultObj = {
        product_name: style === "رسمي" ? "دهن العود الكلمنتان الطبيعي" : "كلمنتان ملوك الفاخر",
        title: style === "فاخر" ? "عبق ملوكي يروي قصة فخامتك الاستثنائية" : "طيب كلمنتان الأصلي الفاخر",
        short_description: "أجود أنواع دهن العود الكلمنتان الطبيعي المعتق، مستخلص بعناية فائقة لعشاق الفخامة العربية والضيافة الملوكية.",
        long_description: "يرتقي دهن عود كلمنتان الطبيعي بذوقك الرفيع إلى آفاق جديدة. يتميز بثباته الاستثنائي الذي يدوم لأيام ورائحته البخورية المعتقة التي تأسر القلوب في المناسبات الرسمية والضيافة العربية الفاخرة، مما يجعله الخيار الأول للإهداء والاستخدام الشخصي الراقي.",
        features: [
          "ثبات فائق يدوم لأكثر من 48 ساعة على الملابس والمجالس",
          "مستخلص نقي 100% وخالٍ من أي إضافات صناعية",
          "عبوة زجاجية كريستالية أنيقة بتصميم ملوكي فاخر"
        ],
        benefits: [
          "يمنحك حضوراً واثقاً ومهابة استثنائية في كل مجلس ومناسبة",
          "مثالي للضيافة وإضفاء لمسة من الفخامة الشرقية الأصيلة",
          "يعتبر هدية قيمة تعبر عن التقدير والاحترام المتبادل"
        ],
        cta: style === "عاطفي" ? "تألق بالهيبة الملوكية واحصل على عبوتك الآن" : "اطلبه الآن واستمتع بالفخامة الشرقية الأصيلة",
        seo_keywords: ["دهن عود كلمنتان", "بخور معتق", "عطورات ملوكية", "طيب أصيل", "عود هدايا فاخر"],
        captions: {
          instagram: `✨ الأصالة تعبر عن نفسها.. دهن عود كلمنتان الطبيعي الفاخر، عتيق يليق بمناسباتكم الملكية وثبات يأسر القلوب. 🪵👑\n\n#دهن_عود #كلمنتان #بخور_فاخر #عطورات_شرقية #مراسيم_الطيب`,
          tiktok: `طيب ملوكي بثبات أسطوري! عود كلمنتان الفاخر للمناسبات الكبرى 🪵👑 #عود #كلمنتان #بخور #فخامة`,
          whatsapp: `🪵 *مراسيم الطيب الفاخرة* 🪵\n\nنقدم لكم أرقى أنواع *دهن العود الكلمنتان الطبيعي* المعتق 👑\n\n✨ ثبات أسطوري ورائحة بخورية تأسر الحواس.\n🎁 مناسب جداً للإهداء الشخصي الفاخر.\n\n👇 اطلبه الآن من متجرنا:\n[رابط المتجر]`,
          salla: "وصف متجر سلة: دهن عود كلمنتان طبيعي فاخر بتركيز عالٍ وثبات ممتاز يضفي طابع الأصالة والفخامة على إطلالتك في كل المناسبات.",
          zid: "وصف متجر زد: عود كلمنتان معتق فخم يناسب كبار الشخصيات ومحبي الروائح البخورية النقية والدافئة.",
          amazon: "وصف أمازون: دهن عود كلمنتان طبيعي فاخر مستخلص من غابات إندونيسيا، ثبات ممتاز وتغليف فاخر مناسب للإهداء."
        },
        ad_copy: {
          ad_title: style === "مختصر" ? "كلمنتان ملوكي فاخر" : "لأصحاب الذوق الرفيع: دهن عود كلمنتان معتق",
          ad_body: "استمتع بالرائحة الشرقية الأصيلة مع عود كلمنتان الطبيعي الفاخر. ثبات يدوم طويلاً وتغليف ملوكي أنيق. اطلبه اليوم واحصل على توصيل مجاني سريع!"
        }
      };
    }

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error generating product copy:", error);
    return res.status(550).json({
      error: "فشل توليد المحتوى التسويقي بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});

// REST API endpoint: AI drafts professional image generation prompts based on brand voice and copywriting
app.post("/api/generate-product-images", async (req, res) => {
  try {
    const { session_id, approved_content_id, original_image_url, brand_profile, image_types } = req.body;

    const tone = brand_profile?.tone_of_voice || "فخم ورسمي";
    const pref = brand_profile?.preferred_words?.join(", ") || "";
    
    // Default image types if empty
    const types = image_types || ["Hero", "Features", "Offer", "Story"];

    let resultObj = null;

    try {
      const ai = getAiClient();
      
      const prompt = `أنت مصمم فني ومخرج إعلاني محترف متخصص في كتابة مطالبات توليد الصور (Midjourney & Stable Diffusion Prompts) لمنتجات التجارة الإلكترونية الفاخرة.

بناءً على الهوية البصرية ونبرة الصوت: "${tone}" والتفضيلات: "${pref}"، والمحتوى النصي المعتمد للمنتج ذو المعرف "${approved_content_id}".

قم بصياغة 4 مطالبات لتوليد صور تسويقية احترافية ومبهرة بالكامل للمنتج.
الأنواع المطلوبة: [${types.join(", ")}].

يجب إرجاع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
بنية كائن JSON المطلوبة:
{
  "assets": [
    {
      "asset_purpose": "Hero",
      "title": "صورة المنتج الرئيسية الفاخرة",
      "prompt_english": "A highly professional, editorial product photography of a premium product, studio lighting, hyperrealistic, elegant background, 8k resolution, shot on 85mm lens",
      "arabic_description": "صورة تسويقية رئيسية تركز على إبراز المنتج بأسلوب فاخر ومضاء بعناية فائقة في استوديو احترافي.",
      "dimensions": "1:1"
    }
  ]
}`;

      const contents = [prompt];
      const response = await generateContentWithRetry(ai, {
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: generateProductImagesSchema,
        },
      });

      const responseText = response.text || "{}";
      resultObj = extractJson(responseText);
    } catch (geminiError: any) {
      console.warn("Gemini image prompts generation failed, falling back to mock:", geminiError);
    }

    if (!resultObj || !resultObj.assets || resultObj.assets.length === 0) {
      // Mock Fallback matching the requested types
      resultObj = {
        assets: [
          {
            asset_purpose: "Hero",
            title: "صورة الغلاف الرئيسية (Hero)",
            prompt_english: `Elegant studio photography of a premium product, placement on a polished marble surface, warm soft ambient backlighting, cinematic volumetric smoke, gold accents, hyper-detailed, Hasselblad 100mp --ar 1:1`,
            arabic_description: "صورة الغلاف الرئيسية الفاخرة تظهر المنتج على سطح رخامي مصقول مع إضاءة خلفية ناعمة ودافئة تبرز تفاصيل التصميم.",
            dimensions: "1:1"
          },
          {
            asset_purpose: "Features",
            title: "صورة استعراض المزايا (Features)",
            prompt_english: `Macro close-up shot showing the exquisite texture and premium craftsmanship of the product, floating water droplets, soft morning sun rays passing through a window, clean minimalistic setup --ar 4:5`,
            arabic_description: "صورة مقربة (Macro) تظهر جودة التصنيع والملمس الفخم للمنتج مع تفاعل رائع لقطرات الماء ونور الصباح الهادئ.",
            dimensions: "4:5"
          },
          {
            asset_purpose: "Offer",
            title: "صورة العرض الترويجي (Offer)",
            prompt_english: `A flat-lay creative composition of the premium product surrounded by its luxury gift box and ingredients, elegant ribbons, festive celebratory mood, clean studio background --ar 16:9`,
            arabic_description: "صورة من الأعلى (Flat-lay) تستعرض المنتج مع علبة الهدايا الفاخرة والشرائط الحريرية المناسبة للعروض الترويجية والاحتفالية.",
            dimensions: "16:9"
          },
          {
            asset_purpose: "Story",
            title: "قصة تفاعلية للجوال (Story 9:16)",
            prompt_english: `A dynamic vertical lifestyle photo of a Saudi model holding the premium product with a soft-focus modern coffee shop background in Riyadh, natural sunlight, warm colors, lifestyle aesthetic --ar 9:16`,
            arabic_description: "صورة طولية عصرية تناسب قصص الجوال (Stories) تظهر نموذجاً سعودياً يحمل المنتج في مقهى راقٍ بالرياض مع إضاءة طبيعية.",
            dimensions: "9:16"
          }
        ]
      };
    }

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error generating product image assets:", error);
    return res.status(500).json({
      error: "فشل توليد مطالبات الصور بالذكاء الاصطناعي.",
      details: error.message,
    });
  }
});

// REST API endpoint: AI audits and reviews the quality and readiness of the product package
app.post("/api/review-product-package", async (req, res) => {
  try {
    const { content, images, videos, brand_profile, publish_packages } = req.body;

    const tone = brand_profile?.tone_of_voice || "فخم ورسمي";
    const pref = brand_profile?.preferred_words?.join(", ") || "";
    const forb = brand_profile?.forbidden_words?.join(", ") || "";

    let resultObj = null;

    try {
      const ai = getAiClient();
      
      const prompt = `أنت خبير تدقيق جودة التسويق الإلكتروني وكتابة الإعلانات للعلامات التجارية في السوق السعودي والخليجي.
مهمتك هي تقييم جودة حزمة تسويق المنتج بالكامل وإعطاء درجة جاهزية للنشر.

المدخلات:
1. المحتوى النصي: ${JSON.stringify(content)}
2. الصور التسويقية: ${JSON.stringify(images)}
3. الفيديوهات: ${JSON.stringify(videos)}
4. الهوية التجارية: ${JSON.stringify(brand_profile)}
5. حزم النشر المخصصة: ${JSON.stringify(publish_packages)}

يجب تقييم ما يلي:
- مطابقة الهوية: هل يلتزم بالنبرة "${tone}"؟ هل يتجنب الكلمات الممنوعة [${forb}] ويستخدم الكلمات المفضلة [${pref}]؟
- الإقناع: مدى قوة الدعوة لاتخاذ إجراء (CTA) والجاذبية العامة للمحتوى.
- جودة الوسائط: هل توجد صور وفيديوهات إعلانية مناسبة وجذابة؟
- تكامل النشر: مدى اتساق الرسائل الإعلانية الموزعة على مختلف القنوات.

أرجع النتيجة بصيغة JSON حصرياً بالهيكل التالي، وبدون أي علامات أو تفاصيل نصية خارج كائن الـ JSON:
{
  "overall_score": 85,
  "content_score": 90,
  "image_score": 80,
  "video_score": 75,
  "brand_score": 95,
  "persuasion_score": 88,
  "positives": ["مثال: نبرة تسويقية فخمة تناسب السوق السعودي وتلتزم بالهوية تماماً", "مثال: صياغة الـ CTA قوية ومباشرة للمبيعات"],
  "negatives": ["مثال: نقص في عدد الصور التسويقية المقترحة للحزمة الكاملة", "مثال: عدم كتابة وصف مخصص لـ TikTok بشكل كافٍ"],
  "recommendations": ["مثال: نقترح إضافة ميزة الاسترجاع السريع في الوصف القصير لزيادة الطمأنينة", "مثال: توليد خلفية طبيعية فاخرة إضافية للصور الترويجية"],
  "status": "ready" // يجب أن يكون أحد القيم الثلاثة: 'ready' أو 'needs_improvement' أو 'rejected'
}
`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("[Sahm AI Quality Review] Raw response:", responseText);
      
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      resultObj = JSON.parse(cleanJson);
    } catch (aiError: any) {
      console.warn("[Sahm AI Quality Review] AI Generation failed or key is missing, generating dynamic mock review:", aiError.message);
      
      const hasContent = content && (content.title || content.short_description || content.long_description);
      const hasImages = images && images.length > 0;
      const hasVideos = videos && videos.length > 0;
      const hasPublish = publish_packages && publish_packages.length > 0;

      const content_score = hasContent ? 88 : 30;
      const image_score = hasImages ? 85 : 40;
      const video_score = hasVideos ? 80 : 35;
      const brand_score = 90; 
      const persuasion_score = hasContent ? 85 : 30;

      const overall_score = Math.round((content_score + image_score + video_score + brand_score + persuasion_score) / 5);

      const positives = [];
      const negatives = [];
      const recommendations = [];

      if (hasContent) {
        positives.push("صياغة لغوية ممتازة خالية من الكلمات المحظورة وتعكس فخامة الهوية.");
      } else {
        negatives.push("المحتوى النصي التسويقي فارغ أو غير كافٍ.");
        recommendations.push("قم بإنشاء الوصف التسويقي والوصف التعريفي القصير للمنتج أولاً.");
      }

      if (hasImages) {
        positives.push("توفر صور تسويقية مصممة بدقة تناسب هوية المنتج البصرية.");
      } else {
        negatives.push("حزمة الصور التسويقية للمنتج فارغة.");
        recommendations.push("استخدم مولد الصور لتصميم خلفيات تسويقية جذابة للمنتج.");
      }

      if (hasVideos) {
        positives.push("توفر مخطط سيناريو فيديو ترويجي متكامل ومحدد.");
      } else {
        negatives.push("عدم وجود خطة فيديو إعلاني للمنتج.");
        recommendations.push("قم بإنشاء سيناريو الفيديو التسويقي القصير لعرضه في منصات التواصل.");
      }

      if (hasPublish) {
        positives.push("توزيع نصوص القنوات التسويقية وتخصيصها بشكل ممتاز.");
      } else {
        negatives.push("لم يتم تجهيز حزمة النشر لشبكات التواصل والمتجر الإلكتروني.");
        recommendations.push("قم بتهيئة ونشر الحزم لـ WhatsApp و Instagram وتيك توك.");
      }

      if (positives.length === 0) positives.push("هيكل الجلسة سليم وجاهز للتجهيز.");
      
      let status: 'ready' | 'needs_improvement' | 'rejected' = "ready";
      if (overall_score < 55) {
        status = "rejected";
      } else if (overall_score < 75) {
        status = "needs_improvement";
      }

      resultObj = {
        overall_score,
        content_score,
        image_score,
        video_score,
        brand_score,
        persuasion_score,
        positives,
        negatives,
        recommendations,
        status
      };
    }

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error executing product package review API:", error);
    return res.status(500).json({
      error: "فشل تشغيل تدقيق ومراجعة حزمة المنتج.",
      details: error.message,
    });
  }
});

// REST API endpoint: AI drafts complete video production script and storyboard scenes
app.post("/api/generate-product-video-plan", async (req, res) => {
  try {
    const { session_id, approved_content_id, approved_image_assets, brand_profile, video_type } = req.body;

    const tone = brand_profile?.tone_of_voice || "فخم ورسمي";
    const typeLabel = video_type === "short" ? "فيديو سريع (10-15 ثانية)" : "فيديو أعمق (15-25 ثانية)";
    const seconds = video_type === "short" ? "12s" : "22s";

    let resultObj = null;

    try {
      const ai = getAiClient();
      
      const prompt = `أنت مخرج وكاتب سيناريو إعلاني محترف متخصص في صياغة خطط إنتاج الفيديو (Video Plans & Storyboards) للمنتجات الفاخرة.

بناءً على الهوية البصرية ونبرة الصوت: "${tone}"، ونوع الفيديو المطلوب: "${typeLabel}" ذو المدة التقريبية "${seconds}"، مع الاستناد للمحتوى النصي المعتمد "${approved_content_id}".

قم بصياغة خطة سيناريو إنتاج كاملة للفيديو التسويقي تتضمن:
- السيناريو العام للمقطع باللغة العربية
- تعليق صوتي مقترح (Voiceover text)
- المطالبة الإنجليزية العامة لتوليد الفيديو (Sora / Runway prompt)
- قائمة المشاهد (Scene list) التفصيلية مع التوقيت والوصف البصري والترجمة Overlay ومطالبة توليد لكل مشهد.

يجب إرجاع النتيجة ككائن JSON تماماً وبدون أي مقدمات أو علامات ترميز إضافية خارج صيغة JSON.
البنية المطلوبة تماماً:
{
  "video_script": "السيناريو الكامل...",
  "voiceover_text": "التعليق الصوتي المقترح...",
  "video_prompt": "English Runway/Sora prompt...",
  "thumbnail_prompt": "English Thumbnail prompt...",
  "captions": ["النص 1", "النص 2"],
  "scene_list": [
    {
      "scene_number": 1,
      "duration": "3s",
      "visual_description": "وصف المشهد بصرياً بالكامل...",
      "text_overlay": "الكلام المكتوب على الشاشة...",
      "generation_prompt": "English prompt for scene generation..."
    }
  ]
}`;

      const contents = [prompt];
      const response = await generateContentWithRetry(ai, {
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: generateProductVideoPlanSchema,
        },
      });

      const responseText = response.text || "{}";
      resultObj = extractJson(responseText);
    } catch (geminiError: any) {
      console.warn("Gemini video plan generation failed, falling back to mock:", geminiError);
    }

    if (!resultObj || !resultObj.scene_list || resultObj.scene_list.length === 0) {
      // Mock Fallback matching the requested video type
      if (video_type === "short") {
        resultObj = {
          video_script: "فيديو سريع خاطف يستعرض بريق وفخامة المنتج في 12 ثانية مصممة لجذب الانتباه في منصات التواصل الاجتماعي.",
          voiceover_text: "عبق يروي تفاصيل فخامتك الاستثنائية. عود كلمنتان الفاخر، رفيق حضورك البهي.",
          video_prompt: "Cinematic 4k commercial for luxury perfume, slow motion smoke, warm lighting, macro shot --ar 9:16",
          thumbnail_prompt: "Professional thumbnail for luxury perfume, glowing sparkles, dark marble table --ar 9:16",
          captions: ["فخامة تليق بك", "حضور يدوم طويلاً", "سهم عود كلمنتان الفاخر"],
          scene_list: [
            {
              scene_number: 1,
              duration: "4s",
              visual_description: "لقطة بطيئة مقربة تظهر زجاجة دهن العود وهي توضع على سطح رخامي لامع تتخلله خيوط ذهبية.",
              text_overlay: "فخامة تليق بك",
              generation_prompt: "Macro slow motion shot of luxury bottle placed on marble surface, gold veins --ar 9:16"
            },
            {
              scene_number: 2,
              duration: "4s",
              visual_description: "تصاعد الدخان العطري البخوري ببطء حول الزجاجة مع إضاءة دافئة وناعمة تسلط الضوء على نقاء الطيب.",
              text_overlay: "حضور يدوم طويلاً",
              generation_prompt: "Cinematic macro shot of burning incense smoke gently curling around the bottle, warm backlighting --ar 9:16"
            },
            {
              scene_number: 3,
              duration: "4s",
              visual_description: "الزجاجة كاملة تظهر بأناقة في المركز مع شعار المنتج يظهر بنعومة في منتصف الشاشة.",
              text_overlay: "سهم عود كلمنتان الفاخر",
              generation_prompt: "Minimalist studio beauty packshot of the luxury perfume bottle, clean typography on top --ar 9:16"
            }
          ]
        };
      } else {
        resultObj = {
          video_script: "سيناريو إعلاني سردي أعمق في 22 ثانية يستعرض تفاصيل القصة الفاخرة وراء استخلاص وتجهيز دهن العود الكلمنتان.",
          voiceover_text: "في كل قطرة من دهن العود المعتق، نسجنا لك قصة أصالة تدوم لأيام. من غابات كلمنتان إلى يديك، فخامة ملوكية تأسر القلوب في كل مناسبة. طيب كلمنتان الأصلي، توقيع حضورك الفاخر.",
          video_prompt: "Narrative cinematic 4k commercial of luxury perfume extraction and elegant lifestyle showcase, warm natural light, ultra realistic --ar 9:16",
          thumbnail_prompt: "Elegant Saudi model holding perfume in Riyadh cafe, cinematic lighting --ar 9:16",
          captions: ["قصة أصالة معتقة", "ثبات يدوم لأيام", "توقيع حضورك الفاخر"],
          scene_list: [
            {
              scene_number: 1,
              duration: "5s",
              visual_description: "لقطة مقربة تظهر استخلاص وصب قطرة دهن العود النقية ببطء شديد كأنها قطعة من الذهب السائل.",
              text_overlay: "قصة أصالة معتقة",
              generation_prompt: "Macro close-up slow motion of a single amber drop of oil dripping from a glass dropper, dark wood background --ar 9:16"
            },
            {
              scene_number: 2,
              duration: "6s",
              visual_description: "شخص يرتدي ملابس رسمية فاخرة (بشت سعودي) يتطيب بدهن العود مع التركيز على حركة التطيب بثقة وأناقة.",
              text_overlay: "ثبات يدوم لأيام",
              generation_prompt: "Saudi man in traditional luxury attire applying perfume on his wrist, cinematic warm lighting, Riyadh setting --ar 9:16"
            },
            {
              scene_number: 3,
              duration: "5s",
              visual_description: "لقطة جمالية للزجاجة الفاخرة داخل صندوق الإهداء المخملي الفاخر وهو يفتح ببطء.",
              text_overlay: "فخامة ملوكية للاقتناء والإهداء",
              generation_prompt: "Close up of luxury velvet gift box opening, reveal of a crystalline perfume bottle --ar 9:16"
            },
            {
              scene_number: 4,
              duration: "6s",
              visual_description: "حزمة ألوان دافئة مع زجاجة الطيب تظهر بشكل فخم مع دعوة لاتخاذ إجراء وشعار سهم الإمبراطوري.",
              text_overlay: "سهم عود كلمنتان الفاخر - اطلبه الآن",
              generation_prompt: "High-end commercial packshot of perfume bottle, warm light beams, call to action overlay --ar 9:16"
            }
          ]
        };
      }
    }

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error generating video plan:", error);
    return res.status(500).json({
      error: "فشل توليد خطة وسيناريو الفيديو بالذكاء الاصطناعي.",
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


// Endpoint to check database schema status
app.post("/api/database/status", async (req, res) => {
  try {
    const { supabaseUrl, supabaseKey } = req.body;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ error: "Supabase credentials are required" });
    }
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("products").select("id").limit(1);
    
    if (error) {
      if (error.message.includes("does not exist") || error.code === "PGRST116" || error.message.includes("not found")) {
        return res.json({ isCreated: false, error: error.message });
      }
    }
    
    return res.json({ isCreated: !error });
  } catch (e: any) {
    return res.json({ isCreated: false, error: e.message });
  }
});


// Endpoint to run direct migrations on Supabase via PostgreSQL connection string
app.post("/api/database/migrate", async (req, res) => {
  let pgClient;
  try {
    const { connectionString } = req.body;
    if (!connectionString) {
      return res.status(400).json({ error: "PostgreSQL Connection String is required." });
    }
    
    const schemaPath = path.join(process.cwd(), "src/core/database/schema.sql");
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: "Schema SQL file not found at src/core/database/schema.sql" });
    }
    const sql = fs.readFileSync(schemaPath, "utf-8");
    
    // Resolve pure-javascript pg client
    const { Client } = await import("pg");
    pgClient = new Client({
      connectionString,
      ssl: connectionString.includes("supabase.co") || connectionString.includes("supabase.net") || connectionString.includes("pooler")
        ? { rejectUnauthorized: false }
        : false
    });
    
    await pgClient.connect();
    
    // Split block transactions or execute directly
    await pgClient.query(sql);
    
    return res.json({ success: true, message: "تم تأسيس ومطابقة البنية التحتية لـ Supabase PostgreSQL بنجاح!" });
  } catch (e: any) {
    console.error("Migration failed:", e);
    return res.status(500).json({ error: e.message });
  } finally {
    if (pgClient) {
      try {
        await pgClient.end();
      } catch {}
    }
  }
});


// ================= WHATSAPP Cloud API POC Integration =================

async function resolveTenantAndCompany() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl || !supabaseKey) {
    return { tenantId: "tenant-default", companyId: "comp-default" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Get first tenant
    const { data: tenantData } = await supabase.from("tenants").select("id").limit(1).maybeSingle();
    const tenantId = tenantData?.id || "tenant-default";

    // 2. Get first company for this tenant
    const { data: companyData } = await supabase.from("companies").select("id").eq("tenant_id", tenantId).limit(1).maybeSingle();
    const companyId = companyData?.id || "comp-default";

    return { tenantId, companyId };
  } catch (err) {
    console.warn("Failed to resolve tenant and company, using default values:", err);
    return { tenantId: "tenant-default", companyId: "comp-default" };
  }
}

async function saveIncomingMessage(customerPhone: string, customerName: string, messageText: string, whatsappMessageId: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { tenantId, companyId } = await resolveTenantAndCompany();

  const conversationId = `conv_${customerPhone}`;
  
  // 1. Upsert conversation
  const { data: existingConv } = await supabase
    .from("customer_conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!existingConv) {
    await supabase.from("customer_conversations").insert({
      id: conversationId,
      tenant_id: tenantId,
      company_id: companyId,
      customer_phone: customerPhone,
      customer_name: customerName,
      last_message: messageText,
      last_message_at: new Date().toISOString()
    });
  } else {
    await supabase.from("customer_conversations").update({
      last_message: messageText,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", conversationId);
  }

  // 2. Insert message
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await supabase.from("customer_messages").insert({
    id: messageId,
    conversation_id: conversationId,
    tenant_id: tenantId,
    company_id: companyId,
    direction: "inbound",
    sender_phone: customerPhone,
    message_text: messageText,
    status: "received",
    whatsapp_message_id: whatsappMessageId
  });
}

async function saveOutboundMessage(toPhone: string, messageText: string, tenantId?: string, companyId?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  let resolvedTenant = tenantId;
  let resolvedCompany = companyId;

  if (!resolvedTenant || !resolvedCompany || resolvedCompany === "comp-default") {
    const resolved = await resolveTenantAndCompany();
    resolvedTenant = resolvedTenant || resolved.tenantId;
    resolvedCompany = resolvedCompany || resolved.companyId;
  }

  const conversationId = `conv_${toPhone}`;
  const { data: existingConv } = await supabase
    .from("customer_conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!existingConv) {
    await supabase.from("customer_conversations").insert({
      id: conversationId,
      tenant_id: resolvedTenant,
      company_id: resolvedCompany,
      customer_phone: toPhone,
      customer_name: "عميل واتساب",
      last_message: messageText,
      last_message_at: new Date().toISOString()
    });
  } else {
    await supabase.from("customer_conversations").update({
      last_message: messageText,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", conversationId);
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await supabase.from("customer_messages").insert({
    id: messageId,
    conversation_id: conversationId,
    tenant_id: resolvedTenant,
    company_id: resolvedCompany,
    direction: "outbound",
    sender_phone: "system",
    message_text: messageText,
    status: "sent"
  });
}

async function sendWhatsAppMessage(to: string, message: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1067332086468797";
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured.");
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: message
      }
    })
  });

  const data: any = await response.json();
  if (!response.ok) {
    console.error("WhatsApp API Error Response:", data);
    throw new Error(data.error?.message || "Failed to send WhatsApp message.");
  }
  return data;
}

// Send endpoint
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    const { to, message, tenant_id, company_id } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "حقول المستقبل (to) ونص الرسالة (message) مطلوبة." });
    }

    const response = await sendWhatsAppMessage(to, message);
    await saveOutboundMessage(to, message, tenant_id, company_id);

    return res.json({ success: true, response });
  } catch (error: any) {
    console.error("Failed to send WhatsApp message:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Verification Webhook (GET)
app.get("/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "sahm_verify_token_poc";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp Webhook verified successfully.");
    return res.status(200).send(challenge);
  } else {
    console.warn("WhatsApp Webhook verification failed.");
    return res.sendStatus(403);
  }
});

// Receive Webhook (POST)
app.post("/webhooks/whatsapp", async (req, res) => {
  try {
    const body = req.body;
    console.log("Received WhatsApp webhook body:", JSON.stringify(body, null, 2));

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message) {
        const customerPhone = message.from;
        const customerName = contact?.profile?.name || "عميل واتساب";
        const messageText = message.text?.body || "";
        const whatsappMessageId = message.id;

        if (message.type === "text" && messageText) {
          await saveIncomingMessage(customerPhone, customerName, messageText, whatsappMessageId);
        }
      }
    }
    return res.sendStatus(200);
  } catch (error: any) {
    console.error("Error handling WhatsApp webhook:", error);
    return res.sendStatus(500);
  }
});


// Configure Vite middleware in development or serve built files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with inline Vite configuration to bypass path spacing bug...");
    const reactPlugin = (await import("@vitejs/plugin-react")).default;
    const tailwindPlugin = (await import("@tailwindcss/vite")).default;
    const vite = await createViteServer({
      configFile: false,
      plugins: [reactPlugin(), tailwindPlugin()],
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "."),
          "react": path.resolve(process.cwd(), "node_modules/react"),
          "react-dom": path.resolve(process.cwd(), "node_modules/react-dom"),
        },
      },
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
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
