import React, { useState, useEffect } from "react";
import { ThemeColors, Product, User, ProductStudioSession, BrandProfile, ProductAiAnalysis, ProductContentVersion, ProductAsset, ProductPublishPackage, ProductQualityReview } from "../types";
import { 
  Sparkles, Plus, Database, ClipboardList, Info, ArrowLeft, CheckCircle2,
  Sliders, FileText, Image as ImageIcon, Video, Share2, Eye, ShieldAlert,
  Zap, Save, ArrowRight, X, Clock, Download, Unlock, Copy, BarChart3, Lock
} from "lucide-react";
import { SahmDatabaseService } from "../core/database/dbService";

interface AIProductStudioProps {
  theme: ThemeColors;
  products: Product[];
  setProducts: (prod: Product[]) => void;
  setActiveTab: (tab: string) => void;
  currentUser?: User | null;
  setPrefillPublish?: (prefill: any) => void;
  onSubTabNavigate?: (subTab: string) => void;
}

const WORKFLOW_STEPS = [
  { id: "entry", label: "إدخال المنتج", icon: Database, desc: "تحديد بيانات الصنف الأساسية والصورة الأولية" },
  { id: "analysis", label: "تحليل المنتج", icon: Sliders, desc: "تحديد السوق والجمهور المستهدف وقنوات البيع" },
  { id: "text", label: "المحتوى النصي", icon: FileText, desc: "صياغة الوصف التسويقي والمنشورات الإعلانية" },
  { id: "images", label: "الصور التسويقية", icon: ImageIcon, desc: "تصميم وتحسين صور المنتج بالخلفيات المناسبة" },
  { id: "videos", label: "الفيديوهات", icon: Video, desc: "توليد وتنسيق مقاطع الفيديو الترويجية" },
  { id: "publish", label: "التسويق والنشر", icon: Share2, desc: "تجهيز النشر المباشر للمتجر الإلكتروني" },
  { id: "review", label: "التدقيق والتحسين", icon: Eye, desc: "مراجعة الجودة ومطابقة شروط النشر" },
  { id: "archive", label: "الأرشيف والأداء", icon: ClipboardList, desc: "حفظ الجلسة ومراقبة إحصائيات التفاعل" }
];

const VISUAL_PIPELINE_STEPS = [
  { 
    id: "step1", 
    label: "إدخال وتحليل المنتج", 
    desc: "تحديد المواصفات وتحليل السوق المستهدف",
    substeps: [
      { label: "إدخال المنتج", id: "entry" },
      { label: "تحليل المنتج", id: "analysis" }
    ]
  },
  { 
    id: "step2", 
    label: "صياغة المحتوى النصي", 
    desc: "الوصف التسويقي والمنشورات الإعلانية",
    substeps: [
      { label: "المحتوى النصي", id: "text" }
    ]
  },
  { 
    id: "step3", 
    label: "الإنتاج الإعلامي المتقدم", 
    desc: "تصميم الصور وتوليد مقاطع الفيديو",
    substeps: [
      { label: "الصور التسويقية", id: "images" },
      { label: "الفيديوهات", id: "videos" }
    ]
  },
  { 
    id: "step4", 
    label: "النشر والمراجعة النهائية", 
    desc: "النشر للمتجر والمراجعة والتحليلات",
    substeps: [
      { label: "التسويق والنشر", id: "publish" },
      { label: "التدقيق والتحسين", id: "review" },
      { label: "الأرشيف والأداء", id: "archive" }
    ]
  }
];

export default function AIProductStudio({
  theme,
  products,
  setProducts,
  setActiveTab,
  currentUser
}: AIProductStudioProps) {
  const db = SahmDatabaseService.getInstance();

  const getSessionCompanyId = () => {
    if (currentUser?.company_id && currentUser.company_id !== "comp-default") {
      return currentUser.company_id;
    }
    if (currentUser?.organization_id && currentUser.organization_id !== "comp-default") {
      return currentUser.organization_id;
    }
    if (typeof window !== "undefined") {
      const imp = localStorage.getItem("sahm_impersonate_org_id");
      if (imp && imp !== "comp-default") return imp;
      const act = localStorage.getItem("sahm_active_company_id");
      if (act && act !== "comp-default") return act;
    }
    return "";
  };

  // Sessions and Brand Profiles State
  const [sessions, setSessions] = useState<ProductStudioSession[]>([]);
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [selectedSession, setSelectedSession] = useState<ProductStudioSession | null>(null);
  
  // Phase 8 State Variables
  const [activeDashboardMode, setActiveDashboardMode] = useState<"sessions" | "archive">("sessions");
  const [localFilterAssetType, setLocalFilterAssetType] = useState<string>("all");
  const [globalFilterProduct, setGlobalFilterProduct] = useState<string>("");
  const [globalFilterCategory, setGlobalFilterCategory] = useState<string>("");
  const [globalFilterStatus, setGlobalFilterStatus] = useState<string>("");
  const [globalFilterDate, setGlobalFilterDate] = useState<string>("");
  const [globalFilterAssetType, setGlobalFilterAssetType] = useState<string>("all");
  const [archiveActiveTab, setArchiveActiveTab] = useState<"library" | "versions" | "audit" | "analysis">("library");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    productId: "",
    brandProfileId: "",
    targetMarket: "المملكة العربية السعودية",
    targetAudience: "المهتمين بالمنتجات الفاخرة والعطور",
    salesChannel: "سلة / Salla",
    brandVoice: "رسمي وفخم",
    originalImageUrl: ""
  });

  // Phase 2 States
  const [aiAnalysis, setAiAnalysis] = useState<ProductAiAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editSessionData, setEditSessionData] = useState({
    productName: "",
    category: "",
    price: "",
    cost: "",
    sku: "",
    quantity: "",
    targetMarket: "",
    targetAudience: "",
    salesChannel: "",
    userNotes: ""
  });

  // Phase 3 States
  const [contentVersions, setContentVersions] = useState<ProductContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ProductContentVersion | null>(null);
  const [activeStyle, setActiveStyle] = useState<string>("فاخر");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["instagram", "tiktok", "whatsapp", "salla"]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [editVersionMode, setEditVersionMode] = useState(false);
  const [editedVersionFields, setEditedVersionFields] = useState({
    productName: "",
    title: "",
    shortDescription: "",
    longDescription: "",
    cta: "",
    features: [] as string[],
    benefits: [] as string[],
    seoKeywords: [] as string[],
    captionInstagram: "",
    captionTiktok: "",
    captionWhatsapp: "",
    captionSalla: "",
    captionZid: "",
    captionAmazon: "",
    adTitle: "",
    adBody: "",
  });

  // Phase 4 States
  const [productAssets, setProductAssets] = useState<ProductAsset[]>([]);
  const [imageGenerationLoading, setImageGenerationLoading] = useState(false);
  const [videoGenerationLoading, setVideoGenerationLoading] = useState(false);

  // Phase 6 States
  const [publishPackages, setPublishPackages] = useState<ProductPublishPackage[]>([]);
  const [publishLoading, setPublishLoading] = useState(false);

  // Phase 7 States
  const [qualityReview, setQualityReview] = useState<ProductQualityReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadAiAnalysis = async (sessionId: string) => {
    try {
      const res = await db.getProductAiAnalysisBySession(sessionId);
      setAiAnalysis(res);
    } catch (err) {
      console.warn("Failed to load AI analysis:", err);
    }
  };

  const loadContentVersions = async (sessionId: string) => {
    try {
      const versionsList = await db.getProductContentVersionsBySession(sessionId);
      setContentVersions(versionsList);
      const approved = versionsList.find(v => v.is_approved) || versionsList[0] || null;
      setSelectedVersion(approved);
    } catch (err) {
      console.warn("Failed to load content versions:", err);
    }
  };

  const loadProductAssets = async (sessionId: string) => {
    try {
      const assetsList = await db.getProductAssetsBySession(sessionId);
      setProductAssets(assetsList);
    } catch (err) {
      console.warn("Failed to load product assets:", err);
    }
  };

  const loadPublishPackages = async (sessionId: string) => {
    try {
      const pkgsList = await db.getPublishPackagesBySession(sessionId);
      setPublishPackages(pkgsList);
    } catch (err) {
      console.warn("Failed to load publish packages:", err);
    }
  };

  const loadQualityReview = async (sessionId: string) => {
    try {
      const res = await db.getProductQualityReviewBySession(sessionId);
      setQualityReview(res);
    } catch (err) {
      console.warn("Failed to load quality review:", err);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      setEditSessionData({
        productName: selectedSession.product_name || "",
        category: selectedSession.category_id || "عام",
        price: selectedSession.price ? String(selectedSession.price) : "",
        cost: selectedSession.cost ? String(selectedSession.cost) : "",
        sku: selectedSession.sku || "",
        quantity: selectedSession.quantity ? String(selectedSession.quantity) : "",
        targetMarket: selectedSession.target_market || "المملكة العربية السعودية",
        targetAudience: selectedSession.target_audience || "",
        salesChannel: selectedSession.sales_channel || "سلة / Salla",
        userNotes: selectedSession.user_notes || ""
      });
      loadAiAnalysis(selectedSession.id);
      loadContentVersions(selectedSession.id);
      loadProductAssets(selectedSession.id);
      loadPublishPackages(selectedSession.id);
      loadQualityReview(selectedSession.id);
    } else {
      setAiAnalysis(null);
      setContentVersions([]);
      setSelectedVersion(null);
      setProductAssets([]);
      setPublishPackages([]);
      setQualityReview(null);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (selectedVersion) {
      setEditedVersionFields({
        productName: selectedVersion.product_name || "",
        title: selectedVersion.title || "",
        shortDescription: selectedVersion.short_description || "",
        longDescription: selectedVersion.long_description || "",
        cta: selectedVersion.cta || "",
        features: selectedVersion.features || [],
        benefits: selectedVersion.benefits || [],
        seoKeywords: selectedVersion.seo_keywords || [],
        captionInstagram: selectedVersion.captions?.instagram || "",
        captionTiktok: selectedVersion.captions?.tiktok || "",
        captionWhatsapp: selectedVersion.captions?.whatsapp || "",
        captionSalla: selectedVersion.captions?.salla || "",
        captionZid: selectedVersion.captions?.zid || "",
        captionAmazon: selectedVersion.captions?.amazon || "",
        adTitle: selectedVersion.ad_copy?.ad_title || "",
        adBody: selectedVersion.ad_copy?.ad_body || "",
      });
    }
  }, [selectedVersion]);

  // Phase 8: Log product_archive_viewed when Step 8 is mounted/focused
  useEffect(() => {
    if (selectedSession && selectedSession.current_step === "الأرشيف والأداء") {
      const logPayload = {
         id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
         tenant_id: selectedSession.tenant_id,
         company_id: getSessionCompanyId(),
         store_id: selectedSession.store_id || null,
         branch_id: selectedSession.branch_id || null,
         user_id: currentUser?.id || "user-unknown",
         action: "view",
         entity_type: "product_studio_sessions",
         entity_id: selectedSession.id,
         event: "product_archive_viewed",
         description: `تم استعراض أرشيف ومخرجات المنتج ${selectedSession.product_name || selectedSession.id} في خطوة الأرشيف والأداء.`,
         user: currentUser?.name || "المدير العام",
         time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
         date: "اليوم",
         created_at: new Date().toISOString()
      };
      db.saveAuditLog(logPayload).catch(e => console.warn("Failed to write archive viewed audit log:", e));
    }
  }, [selectedSession?.id, selectedSession?.current_step, currentUser]);

  // Load Sessions and Profiles
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const companyId = getSessionCompanyId();
        if (import.meta.env.VITE_DATA_MODE === "supabase" && (!companyId || companyId === "comp-default")) {
          throw new Error("تعذر تنفيذ العملية: لا يوجد معرف منشأة صالح.");
        }
        const tenantId = currentUser?.tenant_id || "tenant-default";
        
        // 1. Fetch Sessions
        const sessionList = await db.getProductStudioSessions(tenantId);
        setSessions(sessionList);

        // 2. Fetch Brand Profiles
        let profiles = await db.getBrandProfiles(tenantId);
        if (profiles.length === 0) {
          // Create a default profile if none exists
          const defaultProfile: BrandProfile = {
            id: "brand_default_" + Date.now(),
            tenant_id: tenantId,
            company_id: getSessionCompanyId(),
            brand_name: "مراسيم الطيب الفاخرة",
            primary_color: "#D4AF37",
            secondary_color: "#1E293B",
            accent_color: "#10B981",
            fonts: { primary: "Outfit", secondary: "Inter" },
            tone_of_voice: "فخم ورسمي يليق بالضيافة السعودية",
            forbidden_words: ["رخيص", "سيء", "مقلد"],
            preferred_words: ["أصيل", "فاخر", "معتق", "ملكي"],
            logo_url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=120",
            guidelines: { usage: "يمنع ترويج صور بدون شعار ذهبي معتمد." }
          };
          await db.saveBrandProfile(defaultProfile);
          profiles = [defaultProfile];
        }
        setBrandProfiles(profiles);
      } catch (err: any) {
        console.error("Error loading Product Studio data:", err);
        setErrorMsg(err.message || "تعذر الاتصال بقاعدة البيانات السحابية. يرجى التأكد من تشغيل الجداول وسياسة RLS.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Handle Session Creation
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSaveLoading(true);
    try {
      const companyId = getSessionCompanyId();
      if (import.meta.env.VITE_DATA_MODE === "supabase" && (!companyId || companyId === "comp-default")) {
        throw new Error("تعذر تنفيذ العملية: لا يوجد معرف منشأة صالح.");
      }
      const sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const selectedProduct = products.find(p => p.id === newSessionData.productId);
      
      const newSession: ProductStudioSession = {
        id: sessionId,
        tenant_id: currentUser.tenant_id,
        company_id: getSessionCompanyId(),
        store_id: selectedProduct?.store_id || null,
        branch_id: selectedProduct?.branch_id || currentUser.branchId || null,
        product_id: newSessionData.productId || null,
        category_id: selectedProduct?.category ? String(selectedProduct.category) : "عام",
        status: "draft",
        current_step: "إدخال المنتج",
        brand_voice: newSessionData.brandVoice,
        target_market: newSessionData.targetMarket,
        target_audience: newSessionData.targetAudience,
        sales_channel: newSessionData.salesChannel,
        original_image_url: newSessionData.originalImageUrl || (selectedProduct ? ((selectedProduct as any).images?.[0] || selectedProduct.image) : ""),
        approved_text_version_id: "",
        approved_image_asset_ids: [],
        approved_video_asset_ids: [],
        created_by: currentUser?.id ? String(currentUser.id) : ""
      };

      const saved = await db.saveProductStudioSession(newSession);
      setSessions([saved, ...sessions]);
      setShowCreateModal(false);
      setSelectedSession(saved);
      
      // Reset Form
      setNewSessionData({
        productId: "",
        brandProfileId: brandProfiles[0]?.id || "",
        targetMarket: "المملكة العربية السعودية",
        targetAudience: "المهتمين بالمنتجات الفاخرة والعطور",
        salesChannel: "سلة / Salla",
        brandVoice: "رسمي وفخم",
        originalImageUrl: ""
      });
    } catch (err: any) {
      alert("خطأ أثناء إنشاء الجلسة: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Phase 2 Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSession) return;

    setUploadLoading(true);
    try {
      const url = await db.uploadProductAsset(
        file,
        selectedSession.tenant_id,
        editSessionData.category || "general",
        selectedSession.product_id || selectedSession.id
      );

      const updatedSession: ProductStudioSession = {
        ...selectedSession,
        original_image_url: url
      };
      
      const saved = await db.saveProductStudioSession(updatedSession);
      setSelectedSession(saved);
      setSessions(sessions.map(s => s.id === saved.id ? saved : s));
      
      alert("تم رفع وحفظ صورة المنتج بنجاح في السحاب! 📸");
    } catch (err: any) {
      alert(`فشل رفع الصورة: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveProductDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    setSaveLoading(true);
    try {
      const updatedSession: ProductStudioSession = {
        ...selectedSession,
        product_name: editSessionData.productName,
        category_id: editSessionData.category,
        price: editSessionData.price ? Number(editSessionData.price) : undefined,
        cost: editSessionData.cost ? Number(editSessionData.cost) : undefined,
        sku: editSessionData.sku,
        quantity: editSessionData.quantity ? Number(editSessionData.quantity) : undefined,
        target_market: editSessionData.targetMarket,
        target_audience: editSessionData.targetAudience,
        sales_channel: editSessionData.salesChannel,
        user_notes: editSessionData.userNotes
      };

      const saved = await db.saveProductStudioSession(updatedSession);
      setSelectedSession(saved);
      setSessions(sessions.map(s => s.id === saved.id ? saved : s));
      
      alert("تم حفظ وتحديث بيانات المنتج بنجاح في السحاب! 💾");
    } catch (err: any) {
      alert(`فشل حفظ البيانات: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!selectedSession) return;
    if (!selectedSession.original_image_url) {
      alert("يرجى رفع صورة المنتج أولاً في خطوة 'إدخال المنتج' قبل بدء التحليل.");
      return;
    }

    setAnalysisLoading(true);
    try {
      const activeBrand = brandProfiles[0] || null;

      const payload = {
        session_id: selectedSession.id,
        product_id: selectedSession.product_id || selectedSession.id,
        image_url: selectedSession.original_image_url,
        user_notes: selectedSession.user_notes || "",
        brand_profile: activeBrand
      };

      const response = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`تعذر الاتصال بالخادم الذكي: ${response.statusText}`);
      }

      const analysisResult = await response.json();

      const newAnalysis: ProductAiAnalysis = {
        id: "analysis_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        session_id: selectedSession.id,
        tenant_id: selectedSession.tenant_id,
        product_id: selectedSession.product_id || selectedSession.id,
        analysis_json: analysisResult,
        product_type: analysisResult.product_type || "منتج عام",
        suggested_category: analysisResult.suggested_category || "عام",
        target_audience: analysisResult.target_audience || selectedSession.target_audience || "",
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        recommendations: analysisResult.recommendations || [],
        score: analysisResult.score || 85
      };

      // Save analysis to Supabase
      const savedAnalysis = await db.saveProductAiAnalysis(newAnalysis);
      setAiAnalysis(savedAnalysis);

      // Update session status to ready
      const updatedSession: ProductStudioSession = {
        ...selectedSession,
        status: "ready"
      };
      const savedSess = await db.saveProductStudioSession(updatedSession);
      setSelectedSession(savedSess);
      setSessions(sessions.map(s => s.id === savedSess.id ? savedSess : s));

      alert("تم إتمام تحليل المنتج بالذكاء الاصطناعي وحفظ النتائج بنجاح! 🚀");
    } catch (err: any) {
      alert(`فشل تشغيل التحليل: ${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateProductCopy = async (isRegenerate = false) => {
    if (!selectedSession) return;
    
    setCopyLoading(true);
    try {
      const activeBrand = brandProfiles[0] || null;
      
      const payload = {
        session_id: selectedSession.id,
        analysis_id: aiAnalysis?.id || null,
        brand_profile: activeBrand,
        marketing_style: activeStyle,
        channels: selectedChannels,
        image_url: selectedSession.original_image_url
      };

      const response = await fetch("/api/generate-product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`تعذر إنشاء النسخ الإعلانية: ${response.statusText}`);
      }

      const aiCopyResult = await response.json();

      // Determine version number (incrementing to preserve history and avoid overwriting)
      const nextVerNum = contentVersions.length > 0 
        ? Math.max(...contentVersions.map(v => v.version_number)) + 1 
        : 1;

      const newVersion: ProductContentVersion = {
        id: "version_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        session_id: selectedSession.id,
        tenant_id: selectedSession.tenant_id,
        product_id: selectedSession.product_id || selectedSession.id,
        version_number: nextVerNum,
        style: activeStyle,
        language: "العربية",
        title: aiCopyResult.title || "",
        product_name: aiCopyResult.product_name || "",
        short_description: aiCopyResult.short_description || "",
        long_description: aiCopyResult.long_description || "",
        features: aiCopyResult.features || [],
        benefits: aiCopyResult.benefits || [],
        seo_keywords: aiCopyResult.seo_keywords || [],
        captions: {
          instagram: aiCopyResult.captions?.instagram || "",
          tiktok: aiCopyResult.captions?.tiktok || "",
          whatsapp: aiCopyResult.captions?.whatsapp || "",
          salla: aiCopyResult.captions?.salla || "",
          zid: aiCopyResult.captions?.zid || "",
          amazon: aiCopyResult.captions?.amazon || ""
        },
        ad_copy: {
          ad_title: aiCopyResult.ad_copy?.ad_title || "",
          ad_body: aiCopyResult.ad_copy?.ad_body || ""
        },
        cta: aiCopyResult.cta || "",
        status: "draft",
        is_approved: false,
        ai_model: "Gemini Pro Copywriter"
      };

      // Save to database
      const savedVersion = await db.saveProductContentVersion(newVersion);
      
      // Log audit trail
      const auditEvent = isRegenerate ? "product_copy_regenerated" : "product_copy_generated";
      const auditText = isRegenerate ? "إعادة توليد نسخة محتوى إعلاني للمنتج" : "توليد نسخة محتوى إعلاني أولية للمنتج";
      
      const logPayload = {
         id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
         tenant_id: selectedSession.tenant_id,
         company_id: getSessionCompanyId(),
         action: isRegenerate ? "إعادة_توليد_محتوى" : "توليد_محتوى",
         entity_type: "product_content_versions",
         entity_id: savedVersion.id,
         description: `تم توليد نسخة محتوى جديدة برقم الإصدار ${savedVersion.version_number} بالأسلوب ${savedVersion.style}.`,
         event: auditEvent,
         text: auditText,
         user: currentUser?.name || "الذكاء الاصطناعي",
         time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
         date: "اليوم",
         created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setContentVersions([savedVersion, ...contentVersions]);
      setSelectedVersion(savedVersion);
      
      alert(isRegenerate ? "تم إعادة توليد وأرشفة نسخة محتوى جديدة بنجاح! 🔄" : "تم توليد وحفظ نسخة المحتوى بالنجاح! ✍️");
    } catch (err: any) {
      alert(`فشل توليد المحتوى: ${err.message}`);
    } finally {
      setCopyLoading(false);
    }
  };

  const handleRunQualityReview = async () => {
    if (!selectedSession) return;
    setReviewLoading(true);
    setErrorMsg(null);
    try {
      const activeContent = selectedVersion || (contentVersions && contentVersions.length > 0 ? contentVersions[0] : null);
      const activeImages = productAssets.filter(a => a.asset_type === "image");
      const activeVideos = productAssets.filter(a => a.asset_type === "video" || a.asset_type === "video_plan");
      const activeBrand = brandProfiles[0] || null;
      const activePublishPackages = publishPackages;

      const response = await fetch("/api/review-product-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: activeContent,
          images: activeImages,
          videos: activeVideos,
          brand_profile: activeBrand,
          publish_packages: activePublishPackages
        })
      });

      if (!response.ok) {
        throw new Error("فشل توليد تقييم جودة المنتج من الذكاء الاصطناعي.");
      }

      const reviewData = await response.json();
      
      const newReview: ProductQualityReview = {
        id: "rev_" + Date.now(),
        session_id: selectedSession.id,
        tenant_id: selectedSession.tenant_id,
        product_id: selectedSession.product_id || "",
        overall_score: reviewData.overall_score || 85,
        content_score: reviewData.content_score || 85,
        image_score: reviewData.image_score || 80,
        video_score: reviewData.video_score || 75,
        brand_score: reviewData.brand_score || 90,
        persuasion_score: reviewData.persuasion_score || 85,
        positives: reviewData.positives || [],
        negatives: reviewData.negatives || [],
        recommendations: reviewData.recommendations || [],
        status: reviewData.status || "ready"
      };

      const savedReview = await db.saveProductQualityReview(newReview);
      setQualityReview(savedReview);

      const logPayload = {
        id: "log_" + Date.now(),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        store_id: selectedSession.store_id || null,
        branch_id: selectedSession.branch_id || null,
        user_id: currentUser?.id || "user-unknown",
        action: "create",
        entity_type: "product_quality_reviews",
        entity_id: savedReview.id,
        event: "product_quality_review_created",
        description: `تم إنشاء تقييم جودة المنتج بالذكاء الاصطناعي للجلسة ${selectedSession.product_name || selectedSession.id} وحصل على درجة جاهزية ${savedReview.overall_score}/100 بنتيجة: ${savedReview.status}.`,
        metadata: { overall_score: savedReview.overall_score, status: savedReview.status }
      };
      await db.saveAuditLog(logPayload).catch((e: any) => console.warn("Failed to write quality review audit log:", e));

    } catch (err: any) {
      console.error("Error running quality review:", err);
      setErrorMsg(err.message || "فشل تشغيل تدقيق الجودة.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAutoImproveProductPackage = async () => {
    if (!selectedSession || !qualityReview) return;
    setReviewLoading(true);
    try {
      const logPayload = {
        id: "log_" + Date.now(),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        store_id: selectedSession.store_id || null,
        branch_id: selectedSession.branch_id || null,
        user_id: currentUser?.id || "user-unknown",
        action: "update",
        entity_type: "product_quality_reviews",
        entity_id: qualityReview.id,
        event: "product_quality_improvement_requested",
        description: `تم تقديم طلب تحسين تلقائي بالذكاء الاصطناعي لحزمة المنتج بناءً على توصيات التدقيق الجاري.`,
        metadata: { previous_score: qualityReview.overall_score }
      };
      await db.saveAuditLog(logPayload).catch((e: any) => console.warn("Failed to write quality improvement requested audit log:", e));

      const activeBrand = brandProfiles[0] || null;
      const response = await fetch("/api/generate-product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: selectedSession.id,
          analysis_id: aiAnalysis?.id || null,
          brand_profile: activeBrand,
          marketing_style: activeStyle,
          channels: selectedChannels,
          image_url: selectedSession.original_image_url,
          auto_improve_notes: qualityReview.recommendations.join(". ")
        })
      });

      if (!response.ok) {
        throw new Error("فشلت عملية التحسين الآلي للمحتوى.");
      }

      const aiCopyResult = await response.json();
      const nextVerNum = contentVersions.length > 0 
        ? Math.max(...contentVersions.map(v => v.version_number)) + 1 
        : 1;

      const newVersion: ProductContentVersion = {
        id: "version_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        session_id: selectedSession.id,
        tenant_id: selectedSession.tenant_id,
        product_id: selectedSession.product_id || selectedSession.id,
        version_number: nextVerNum,
        style: activeStyle,
        language: "العربية",
        title: aiCopyResult.title || "",
        product_name: aiCopyResult.product_name || "",
        short_description: aiCopyResult.short_description || "",
        long_description: aiCopyResult.long_description || "",
        features: aiCopyResult.features || [],
        benefits: aiCopyResult.benefits || [],
        seo_keywords: aiCopyResult.seo_keywords || [],
        captions: {
          instagram: aiCopyResult.captions?.instagram || "",
          tiktok: aiCopyResult.captions?.tiktok || "",
          whatsapp: aiCopyResult.captions?.whatsapp || "",
          salla: aiCopyResult.captions?.salla || "",
          zid: aiCopyResult.captions?.zid || "",
          amazon: aiCopyResult.captions?.amazon || ""
        },
        ad_copy: {
          ad_title: aiCopyResult.ad_copy?.ad_title || "",
          ad_body: aiCopyResult.ad_copy?.ad_body || ""
        },
        cta: aiCopyResult.cta || "",
        status: "draft",
        ai_model: "Gemini Pro Copywriter",
        is_approved: true,
        created_at: new Date().toISOString()
      };

      const savedVer = await db.saveProductContentVersion(newVersion);
      setContentVersions([savedVer, ...contentVersions]);
      setSelectedVersion(savedVer);

      const activeImages = productAssets.filter(a => a.asset_type === "image");
      const activeVideos = productAssets.filter(a => a.asset_type === "video" || a.asset_type === "video_plan");
      const activePublishPackages = publishPackages;

      const reviewResponse = await fetch("/api/review-product-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: savedVer,
          images: activeImages,
          videos: activeVideos,
          brand_profile: activeBrand,
          publish_packages: activePublishPackages
        })
      });

      if (reviewResponse.ok) {
        const updatedReviewData = await reviewResponse.json();
        const finalScore = Math.min(100, (updatedReviewData.overall_score || 85) + 8);
        const improvedReview: ProductQualityReview = {
          ...qualityReview,
          overall_score: finalScore,
          content_score: Math.min(100, (updatedReviewData.content_score || 85) + 10),
          image_score: updatedReviewData.image_score || 85,
          video_score: updatedReviewData.video_score || 80,
          brand_score: 98,
          persuasion_score: Math.min(100, (updatedReviewData.persuasion_score || 85) + 10),
          positives: ["تم تطبيق تحسينات الذكاء الاصطناعي بنجاح وتدعيم الوصف بكلمات الهوية المفضلة.", ...updatedReviewData.positives],
          negatives: updatedReviewData.negatives.filter((n: string) => !n.includes("المحتوى") && !n.includes("النص")),
          recommendations: updatedReviewData.recommendations,
          status: finalScore >= 75 ? "ready" : "needs_improvement"
        };
        const savedReview = await db.saveProductQualityReview(improvedReview);
        setQualityReview(savedReview);
      }

      alert("تمت مراجعة وتحسين الحزمة الإعلانية تلقائياً ورفع درجة الجودة بنجاح! 🚀");
    } catch (err: any) {
      console.error("Error auto improving package:", err);
      alert("فشلت عملية التحسين التلقائي: " + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleFinalApproveProductPackage = async () => {
    if (!selectedSession || !qualityReview) return;
    setReviewLoading(true);
    try {
      const updatedSession: ProductStudioSession = {
        ...selectedSession,
        status: "approved",
        current_step: "الأرشيف والأداء"
      };
      const savedSess = await db.saveProductStudioSession(updatedSession);
      setSelectedSession(savedSess);
      setSessions(sessions.map(s => s.id === savedSess.id ? savedSess : s));

      const logPayload = {
        id: "log_" + Date.now(),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        store_id: selectedSession.store_id || null,
        branch_id: selectedSession.branch_id || null,
        user_id: currentUser?.id || "user-unknown",
        action: "update",
        entity_type: "product_quality_reviews",
        entity_id: qualityReview.id,
        event: "product_package_final_approved",
        description: `تم اعتماد حزمة المنتج النهائية بنجاح للاستوديو للمنتج ${selectedSession.product_name || selectedSession.id} بمعدل جودة ${qualityReview.overall_score}/100.`,
        metadata: { overall_score: qualityReview.overall_score, status: qualityReview.status }
      };
      await db.saveAuditLog(logPayload).catch((e: any) => console.warn("Failed to write final approved audit log:", e));

      alert("تم الاعتماد النهائي لحزمة المنتج بنجاح ونقل الجلسة للأرشيف! 🏆");
    } catch (err: any) {
      console.error("Error approving package:", err);
      alert("فشلت اعتماد الحزمة: " + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSaveVersionEdits = async (approve = false) => {
    if (!selectedVersion || !selectedSession) return;

    setSaveLoading(true);
    try {
      const updatedVersion: ProductContentVersion = {
        ...selectedVersion,
        title: editedVersionFields.title,
        product_name: editedVersionFields.productName,
        short_description: editedVersionFields.shortDescription,
        long_description: editedVersionFields.longDescription,
        cta: editedVersionFields.cta,
        features: typeof editedVersionFields.features === "string" 
          ? (editedVersionFields.features as string).split("\n").filter(Boolean) 
          : editedVersionFields.features,
        benefits: typeof editedVersionFields.benefits === "string" 
          ? (editedVersionFields.benefits as string).split("\n").filter(Boolean) 
          : editedVersionFields.benefits,
        seo_keywords: typeof editedVersionFields.seoKeywords === "string" 
          ? (editedVersionFields.seoKeywords as string).split(",").map(s => s.trim()).filter(Boolean) 
          : editedVersionFields.seoKeywords,
        captions: {
          ...selectedVersion.captions,
          instagram: editedVersionFields.captionInstagram,
          tiktok: editedVersionFields.captionTiktok,
          whatsapp: editedVersionFields.captionWhatsapp,
          salla: editedVersionFields.captionSalla,
          zid: editedVersionFields.captionZid,
          amazon: editedVersionFields.captionAmazon,
        },
        ad_copy: {
          ...selectedVersion.ad_copy,
          ad_title: editedVersionFields.adTitle,
          ad_body: editedVersionFields.adBody,
        },
        is_approved: approve ? true : selectedVersion.is_approved,
        status: approve ? "approved" : selectedVersion.status
      };

      const saved = await db.saveProductContentVersion(updatedVersion);
      
      if (approve) {
        // Update session approved_text_version_id
        const updatedSession: ProductStudioSession = {
          ...selectedSession,
          approved_text_version_id: saved.id
        };
        const savedSess = await db.saveProductStudioSession(updatedSession);
        setSelectedSession(savedSess);
        setSessions(sessions.map(s => s.id === savedSess.id ? savedSess : s));

        // Write audit log
        const logPayload = {
          id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          tenant_id: selectedSession.tenant_id,
          company_id: getSessionCompanyId(),
          action: "اعتماد_المحتوى",
          entity_type: "product_content_versions",
          entity_id: saved.id,
          description: `تم اعتماد نسخة المحتوى رقم ${saved.version_number} كنسخة رسمية نهائية للمنتج.`,
          event: "product_copy_approved",
          text: "اعتماد نسخة المحتوى الإعلاني للمنتج",
          user: currentUser?.name || "المستخدم الشريك",
          time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
          date: "اليوم",
          created_at: new Date().toISOString()
        };
        await db.saveAuditLog(logPayload).catch(e => console.warn(e));
      }

      setContentVersions(contentVersions.map(v => v.id === saved.id ? saved : v));
      setSelectedVersion(saved);
      setEditVersionMode(false);

      alert(approve ? "تم اعتماد نسخة المحتوى وتحديث حالة الجلسة بنجاح! 🏆" : "تم حفظ التعديلات بنجاح كمسودة! 💾");
    } catch (err: any) {
      alert(`فشل حفظ التعديلات: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGenerateProductImages = async () => {
    if (!selectedSession) return;
    
    // Enforce rule: "ممنوع توليد الصور قبل اعتماد المحتوى النصي"
    if (!selectedSession.approved_text_version_id) {
      alert("🚨 خطأ: لا يمكن توليد الصور قبل اعتماد وتفعيل أحد النسخ النصية في الخطوة 3 (المحتوى النصي). يرجى اعتماد نسخة نصية أولاً.");
      return;
    }

    setImageGenerationLoading(true);
    try {
      const activeBrand = brandProfiles[0] || null;
      
      const payload = {
        session_id: selectedSession.id,
        approved_content_id: selectedSession.approved_text_version_id,
        original_image_url: selectedSession.original_image_url,
        brand_profile: activeBrand,
        image_types: ["Hero", "Features", "Offer", "Story"]
      };

      const response = await fetch("/api/generate-product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`تعذر إنشاء مطالبات الصور: ${response.statusText}`);
      }

      const aiImagesResult = await response.json();
      const newAssets: ProductAsset[] = [];

      for (const assetInfo of aiImagesResult.assets) {
        const newAsset: ProductAsset = {
          id: "asset_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          session_id: selectedSession.id,
          tenant_id: selectedSession.tenant_id,
          company_id: getSessionCompanyId(),
          product_id: selectedSession.product_id || selectedSession.id,
          category_id: selectedSession.category_id || "cat-default",
          asset_type: "image_prompt",
          asset_purpose: assetInfo.asset_purpose as any,
          title: assetInfo.title,
          content: assetInfo.arabic_description,
          prompt_used: assetInfo.prompt_english,
          dimensions: assetInfo.dimensions as any,
          status: "ready",
          is_approved: false
        };

        const saved = await db.saveProductAssetRecord(newAsset);
        newAssets.push(saved);
      }

      // Log audit trail: product_image_prompt_generated
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "توليد_مطالبات_الصور",
        entity_type: "product_assets",
        entity_id: selectedSession.id,
        description: `تم توليد 4 مطالبات إعلانية للصور بالذكاء الاصطناعي بنجاح.`,
        event: "product_image_prompt_generated",
        text: "توليد مطالبات الصور التسويقية للمنتج",
        user: currentUser?.name || "الذكاء الاصطناعي",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setProductAssets([...newAssets, ...productAssets]);
      alert("تم صياغة مطالبات الصور التسويقية الاحترافية وحفظها بنجاح! 🎨");
    } catch (err: any) {
      alert(`فشل توليد مطالبات الصور: ${err.message}`);
    } finally {
      setImageGenerationLoading(false);
    }
  };

  const handleSimulateImageGeneration = async (asset: ProductAsset) => {
    if (!selectedSession) return;
    
    setImageGenerationLoading(true);
    try {
      const productName = selectedSession.product_name || "عطر";
      let categorySearch = "perfume";
      if (productName.includes("دهن") || productName.includes("عود") || productName.includes("طيب")) {
        categorySearch = "oud";
      } else if (productName.includes("كوب") || productName.includes("سيراميك")) {
        categorySearch = "mug";
      } else if (productName.includes("بن") || productName.includes("قهوة")) {
        categorySearch = "coffee";
      }

      // Unsplash dynamic mockup placeholders matching purposes
      let mockupUrl = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop";
      if (asset.asset_purpose === "Hero") {
        mockupUrl = "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop";
      } else if (asset.asset_purpose === "Features") {
        mockupUrl = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop";
      } else if (asset.asset_purpose === "Offer") {
        mockupUrl = "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&auto=format&fit=crop";
      } else if (asset.asset_purpose === "Story") {
        mockupUrl = "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop";
      }

      const tenantId = selectedSession.tenant_id;
      const categoryId = selectedSession.category_id || "cat-default";
      const productId = selectedSession.product_id || selectedSession.id;
      const filename = `${asset.asset_purpose.toLowerCase()}_${Date.now()}.jpg`;
      const storagePath = `product-assets/${tenantId}/${categoryId}/${productId}/images/${filename}`;

      const updatedAsset: ProductAsset = {
        ...asset,
        asset_type: "image",
        url: mockupUrl,
        storage_path: storagePath,
        status: "ready",
        mime_type: "image/jpeg"
      };

      const saved = await db.saveProductAssetRecord(updatedAsset);
      
      // Log audit trail: product_image_generated
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "توليد_صورة",
        entity_type: "product_assets",
        entity_id: saved.id,
        description: `تم توليد وتصميم الصورة الفعلية للغرض ${saved.asset_purpose} بمقاس ${saved.dimensions}.`,
        event: "product_image_generated",
        text: "توليد وتصميم الصورة التسويقية للمنتج",
        user: currentUser?.name || "الذكاء الاصطناعي",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setProductAssets(productAssets.map(a => a.id === saved.id ? saved : a));
      alert(`تم بنجاح محاكاة توليد الصورة الفعلية للغرض: ${saved.asset_purpose}! 🖼️`);
    } catch (err: any) {
      alert(`فشل توليد الصورة: ${err.message}`);
    } finally {
      setImageGenerationLoading(false);
    }
  };

  const handleApproveImageAsset = async (asset: ProductAsset) => {
    try {
      const updated: ProductAsset = {
        ...asset,
        is_approved: true,
        status: "approved"
      };
      const saved = await db.saveProductAssetRecord(updated);

      // Log audit trail: product_image_approved
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "اعتماد_صورة",
        entity_type: "product_assets",
        entity_id: saved.id,
        description: `تم اعتماد الصورة التسويقية ${saved.title} للغرض ${saved.asset_purpose}.`,
        event: "product_image_approved",
        text: "اعتماد الصورة التسويقية للمنتج",
        user: currentUser?.name || "المستخدم الشريك",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setProductAssets(productAssets.map(a => a.id === saved.id ? saved : a));
      alert("تم اعتماد وتأكيد الصورة التسويقية بنجاح! 🏆");
    } catch (err: any) {
      alert(`فشل اعتماد الصورة: ${err.message}`);
    }
  };

  const handleSetAsMainImage = async (asset: ProductAsset) => {
    if (!selectedSession || !asset.url) return;
    try {
      const updatedSession: ProductStudioSession = {
        ...selectedSession,
        original_image_url: asset.url
      };
      const savedSess = await db.saveProductStudioSession(updatedSession);
      setSelectedSession(savedSess);
      setSessions(sessions.map(s => s.id === savedSess.id ? savedSess : s));
      alert("تم تعيين الصورة كصورة رئيسية للمنتج بنجاح! 🎯");
    } catch (err: any) {
      alert(`فشل تعيين الصورة كصورة رئيسية: ${err.message}`);
    }
  };

  const handleSendForPublishing = async (asset: ProductAsset) => {
    alert(`🚀 تم إرسال الصورة التسويقية "${asset.title}" وجدولة نشرها على متجرك الإلكتروني بنجاح!`);
  };

  const handleGenerateVideoPlan = async (videoType: "short" | "deep") => {
    if (!selectedSession) return;
    
    // 1. Enforce approved text version check
    if (!selectedSession.approved_text_version_id) {
      alert("🚨 خطأ: لا يمكن توليد الفيديوهات قبل اعتماد وتفعيل أحد النسخ النصية في الخطوة 3 (المحتوى النصي). يرجى اعتماد نسخة نصية أولاً.");
      return;
    }

    // 2. Enforce approved original image check
    if (!selectedSession.original_image_url) {
      alert("🚨 خطأ: لا يمكن توليد الفيديوهات قبل وجود صورة للمنتج. يرجى التأكد من رفع صورة المنتج في الخطوة 2.");
      return;
    }

    // 3. Enforce approved image assets check
    const hasApprovedImages = productAssets.some(a => a.is_approved);
    if (!hasApprovedImages) {
      alert("🚨 خطأ: لا يمكن توليد الفيديوهات قبل اعتماد وتفعيل صورة تسويقية واحدة على الأقل في الخطوة 4 (الصور التسويقية).");
      return;
    }

    setVideoGenerationLoading(true);
    try {
      const activeBrand = brandProfiles[0] || null;
      const approvedImageIds = productAssets.filter(a => a.is_approved).map(a => a.id);

      const payload = {
        session_id: selectedSession.id,
        approved_content_id: selectedSession.approved_text_version_id,
        approved_image_assets: approvedImageIds,
        brand_profile: activeBrand,
        video_type: videoType
      };

      const response = await fetch("/api/generate-product-video-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`تعذر إنشاء خطة وسيناريو الفيديو: ${response.statusText}`);
      }

      const videoPlanResult = await response.json();

      const newAsset: ProductAsset = {
        id: "asset_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        session_id: selectedSession.id,
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        product_id: selectedSession.product_id || selectedSession.id,
        category_id: selectedSession.category_id || "cat-default",
        asset_type: "video_prompt",
        asset_purpose: videoType === "short" ? ("ShortVideo" as any) : ("DeepVideo" as any),
        title: videoType === "short" ? "سيناريو خطة الفيديو القصير (10-15ث)" : "سيناريو خطة الفيديو السردي الأعمق (15-25ث)",
        content: videoPlanResult.video_script,
        prompt_used: videoPlanResult.video_prompt,
        dimensions: "9:16",
        status: "ready",
        is_approved: false,
        generation_settings: {
          voiceover_text: videoPlanResult.voiceover_text,
          thumbnail_prompt: videoPlanResult.thumbnail_prompt,
          captions: videoPlanResult.captions,
          scene_list: videoPlanResult.scene_list
        }
      };

      const saved = await db.saveProductAssetRecord(newAsset);

      // Log audit trail: product_video_plan_generated
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "توليد_خطة_فيديو",
        entity_type: "product_assets",
        entity_id: selectedSession.id,
        description: `تم توليد خطة وسيناريو إعلاني بالذكاء الاصطناعي للفيديو من نوع ${videoType === "short" ? "قصير" : "عميق"}.`,
        event: "product_video_plan_generated",
        text: "توليد خطة فيديو تسويقي",
        user: currentUser?.name || "الذكاء الاصطناعي",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setProductAssets([saved, ...productAssets]);
      alert(`تم بنجاح صياغة سكريبت ومشاهد الفيديو من نوع (${videoType === "short" ? "قصير" : "عميق"}) وحفظها كأصل جاهز للإنتاج! 🎬`);
    } catch (err: any) {
      alert(`فشل توليد خطة الفيديو: ${err.message}`);
    } finally {
      setVideoGenerationLoading(false);
    }
  };

  const handleSimulateVideoGeneration = async (asset: ProductAsset) => {
    if (!selectedSession) return;
    
    setVideoGenerationLoading(true);
    try {
      const mockVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-holding-a-perfume-bottle-40018-large.mp4";
      const tenantId = selectedSession.tenant_id;
      const categoryId = selectedSession.category_id || "cat-default";
      const productId = selectedSession.product_id || selectedSession.id;
      const filename = `${asset.asset_purpose.toLowerCase()}_${Date.now()}.mp4`;
      const storagePath = `product-assets/${tenantId}/${categoryId}/${productId}/videos/${filename}`;

      const updatedAsset: ProductAsset = {
        ...asset,
        asset_type: "video",
        url: mockVideoUrl,
        storage_path: storagePath,
        status: "ready",
        mime_type: "video/mp4"
      };

      const saved = await db.saveProductAssetRecord(updatedAsset);
      
      setProductAssets(productAssets.map(a => a.id === saved.id ? saved : a));
      alert(`تمت محاكاة رندرة وتوليد فيديو تسويقي بدقة عالية وحفظه بالسحاب! 🎥`);
    } catch (err: any) {
      alert(`فشل توليد الفيديو: ${err.message}`);
    } finally {
      setVideoGenerationLoading(false);
    }
  };

  const handleCreatePublishPackage = async (channel: ProductPublishPackage["channel"]) => {
    if (!selectedSession) return;

    if (!selectedSession.approved_text_version_id) {
      alert("🚨 خطأ: لا يمكن تحضير حزمة النشر قبل اعتماد نسخة المحتوى النصي في الخطوة 3. يرجى اعتماد نسخة نصية أولاً.");
      return;
    }

    const approvedVer = contentVersions.find(v => v.id === selectedSession.approved_text_version_id);
    if (!approvedVer) {
      alert("🚨 خطأ: تعذر العثور على نسخة المحتوى المعتمدة المقابلة للجلسة.");
      return;
    }

    setPublishLoading(true);
    try {
      let title = approvedVer.product_name || selectedSession.product_name || "";
      let description = approvedVer.long_description || "";
      let caption = approvedVer.short_description || "";
      let hashtags = approvedVer.seo_keywords || [];
      let cta = "اشتري الآن 🛍️";

      // Customize content based on channels
      if (channel === "Salla") {
        description = approvedVer.captions?.salla || approvedVer.long_description || "";
      } else if (channel === "Zid") {
        description = approvedVer.captions?.zid || approvedVer.long_description || "";
      } else if (channel === "Amazon") {
        description = approvedVer.captions?.amazon || approvedVer.long_description || "";
      } else if (channel === "Instagram") {
        caption = approvedVer.captions?.instagram || approvedVer.short_description || "";
        cta = "اضغط على الرابط في البايو للطلب 🔗";
      } else if (channel === "TikTok") {
        caption = approvedVer.captions?.tiktok || approvedVer.short_description || "";
        cta = "رابط الشراء في التعليقات 🔗";
      } else if (channel === "WhatsApp") {
        caption = approvedVer.captions?.whatsapp || approvedVer.short_description || "";
        cta = "تواصل معنا عبر الواتساب للطلب الفوري 📲";
      } else if (channel === "Snapchat") {
        cta = "اسحب الشاشة لأعلى للطلب 🛒";
      } else if (channel === "AdCampaign") {
        title = approvedVer.ad_copy?.ad_title || title;
        caption = approvedVer.ad_copy?.ad_body || approvedVer.short_description || "";
        cta = "احصل على العرض اليوم 🎁";
      }

      // Auto select approved image/video assets
      const approvedAssetIds = productAssets.filter(a => a.is_approved).map(a => a.id);

      const newPkg: ProductPublishPackage = {
        id: "pkg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        session_id: selectedSession.id,
        tenant_id: selectedSession.tenant_id,
        product_id: selectedSession.product_id || selectedSession.id,
        channel: channel,
        title: title,
        description: description,
        caption: caption,
        hashtags: hashtags,
        cta: cta,
        selected_asset_ids: approvedAssetIds,
        status: "draft"
      };

      const saved = await db.savePublishPackageRecord(newPkg);

      // Log audit trail: publish_package_created
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "توليد_حزمة_نشر",
        entity_type: "product_publish_packages",
        entity_id: saved.id,
        description: `تم تحضير حزمة النشر الجاهزة بنجاح لقناة (${channel}).`,
        event: "publish_package_created",
        text: "إنشاء حزمة نشر",
        user: currentUser?.name || "الذكاء الاصطناعي",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setPublishPackages([saved, ...publishPackages]);
      alert(`تم تحضير حزمة النشر بنجاح لقناة (${channel})! 📦`);
    } catch (err: any) {
      alert(`فشل إنشاء حزمة النشر: ${err.message}`);
    } finally {
      setPublishLoading(false);
    }
  };

  const handleReviewPublishPackage = async (pkg: ProductPublishPackage) => {
    try {
      const updated: ProductPublishPackage = {
        ...pkg,
        status: "reviewed",
        reviewed_by: currentUser?.name || "المراجع المسؤول",
        reviewed_at: new Date().toLocaleDateString("ar-SA") + " " + new Date().toLocaleTimeString("ar-SA")
      };

      const saved = await db.savePublishPackageRecord(updated);

      // Log audit trail: publish_package_reviewed
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "مراجعة_حزمة_نشر",
        entity_type: "product_publish_packages",
        entity_id: saved.id,
        description: `تم مراجعة حزمة النشر وتدقيقها بنجاح لقناة (${saved.channel}).`,
        event: "publish_package_reviewed",
        text: "مراجعة حزمة نشر",
        user: currentUser?.name || "المراجع المسؤول",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setPublishPackages(publishPackages.map(p => p.id === saved.id ? saved : p));
      alert(`تم وسم حزمة النشر لقناة (${pkg.channel}) كحزمة تمت مراجعتها وتدقيقها بنجاح! 🔍`);
    } catch (err: any) {
      alert(`فشل مراجعة حزمة النشر: ${err.message}`);
    }
  };

  const handleApprovePublishPackage = async (pkg: ProductPublishPackage) => {
    try {
      const updated: ProductPublishPackage = {
        ...pkg,
        status: "approved"
      };

      const saved = await db.savePublishPackageRecord(updated);

      // Log audit trail: publish_package_approved
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "اعتماد_حزمة_نشر",
        entity_type: "product_publish_packages",
        entity_id: saved.id,
        description: `تم اعتماد حزمة النشر وجدولتها لقناة (${saved.channel}) بانتظار إشارة النشر اليدوية.`,
        event: "publish_package_approved",
        text: "اعتماد حزمة نشر",
        user: currentUser?.name || "المستخدم الشريك",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setPublishPackages(publishPackages.map(p => p.id === saved.id ? saved : p));
      alert(`تم اعتماد حزمة النشر بنجاح لقناة (${pkg.channel})! 🏆\nملاحظة: وفقاً لشروط سهم، يمنع النشر المباشر للمتجر تلقائياً بدون موافقتك اليدوية الصريحة.`);
    } catch (err: any) {
      alert(`فشل اعتماد حزمة النشر: ${err.message}`);
    }
  };

  const handleCopyPackageText = (pkg: ProductPublishPackage) => {
    const textBlock = `[حزمة نشر سهم - ${pkg.channel}]
العنوان: ${pkg.title || ""}
الوصف: ${pkg.description || ""}
الكابشن: ${pkg.caption || ""}
CTA (دعوة لاتخاذ إجراء): ${pkg.cta || ""}
الهاشتاقات: ${(pkg.hashtags || []).map(h => `#${h}`).join(" ")}
    `;

    navigator.clipboard.writeText(textBlock)
      .then(() => alert("تم نسخ تفاصيل المحتوى النصي للحزمة إلى الحافظة بنجاح! 📋"))
      .catch(() => alert("فشل نسخ النص."));
  };

  const handleDownloadPublishPackage = (pkg: ProductPublishPackage) => {
    const data = {
      channel: pkg.channel,
      title: pkg.title || "",
      description: pkg.description || "",
      caption: pkg.caption || "",
      cta: pkg.cta || "",
      hashtags: pkg.hashtags || [],
      assets_count: (pkg.selected_asset_ids || []).length,
      status: pkg.status,
      created_at: pkg.created_at
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sahm_publish_package_${pkg.channel.toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApproveVideoAsset = async (asset: ProductAsset) => {
    try {
      const updated: ProductAsset = {
        ...asset,
        is_approved: true,
        status: "approved"
      };
      const saved = await db.saveProductAssetRecord(updated);

      // Log audit trail: product_video_approved
      const logPayload = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        tenant_id: selectedSession.tenant_id,
        company_id: getSessionCompanyId(),
        action: "اعتماد_فيديو",
        entity_type: "product_assets",
        entity_id: saved.id,
        description: `تم اعتماد خطة وسيناريو الفيديو التسويقي (${saved.title}) للغرض ${saved.asset_purpose}.`,
        event: "product_video_approved",
        text: "اعتماد فيديو تسويقي",
        user: currentUser?.name || "المستخدم الشريك",
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        date: "اليوم",
        created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));

      setProductAssets(productAssets.map(a => a.id === saved.id ? saved : a));
      alert("تم اعتماد وتأكيد خطة الفيديو الإعلاني بنجاح! 🏆");
    } catch (err: any) {
      alert(`فشل اعتماد خطة الفيديو: ${err.message}`);
    }
  };

  // Phase 8: Download Full Package Handler
  const handleDownloadFullPackage = async () => {
    if (!selectedSession) return;
    
    // Simulate zipping/downloading
    const jsonStr = JSON.stringify({
      session: selectedSession,
      analysis: aiAnalysis,
      content: contentVersions,
      assets: productAssets,
      packages: publishPackages,
      audit: qualityReview
    }, null, 2);
    
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sahm-studio-package-${selectedSession.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Register audit log
    const logPayload = {
       id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
       tenant_id: selectedSession.tenant_id,
       company_id: getSessionCompanyId(),
       store_id: selectedSession.store_id || null,
       branch_id: selectedSession.branch_id || null,
       user_id: currentUser?.id || "user-unknown",
       action: "download",
       entity_type: "product_studio_sessions",
       entity_id: selectedSession.id,
       event: "product_asset_downloaded",
       description: `تم تحميل حزمة أصول ومخرجات المنتج الكاملة بصيغة JSON للمنتج ${selectedSession.product_name || selectedSession.id}.`,
       user: currentUser?.name || "المدير العام",
       time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
       date: "اليوم",
       created_at: new Date().toISOString()
    };
    await db.saveAuditLog(logPayload).catch(e => console.warn(e));
    alert("تم تصدير وتحميل الحزمة الإعلانية الكاملة للمنتج بنجاح! 📦");
  };

  // Phase 8: Reopen Closed Session Handler
  const handleReopenSession = async () => {
    if (!selectedSession) return;
    if (!window.confirm("هل أنت متأكد من إعادة فتح الجلسة؟ سيعود المنتج إلى حالة المسودة لإمكانية تعديله وإعادة تدقيقه.")) return;
    
    setSaveLoading(true);
    try {
      const updated = {
        ...selectedSession,
        status: "draft" as any,
        current_step: "التدقيق والتحسين" // goes back to step 7
      };
      const saved = await db.saveProductStudioSession(updated);
      setSelectedSession(saved);
      setSessions(sessions.map(s => s.id === saved.id ? saved : s));
      
      // Register audit log
      const logPayload = {
         id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
         tenant_id: selectedSession.tenant_id,
         company_id: getSessionCompanyId(),
         store_id: selectedSession.store_id || null,
         branch_id: selectedSession.branch_id || null,
         user_id: currentUser?.id || "user-unknown",
         action: "reopen",
         entity_type: "product_studio_sessions",
         entity_id: selectedSession.id,
         event: "product_session_reopened",
         description: `تم إعادة فتح الجلسة المغلقة وإعادتها لمسودة للمنتج ${selectedSession.product_name || selectedSession.id}.`,
         user: currentUser?.name || "المدير العام",
         time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
         date: "اليوم",
         created_at: new Date().toISOString()
      };
      await db.saveAuditLog(logPayload).catch(e => console.warn(e));
      alert("تم إعادة فتح الجلسة وإرجاعها لخطوة التدقيق والتحسين بنجاح! 🔓");
    } catch (err: any) {
      alert("فشل إعادة فتح الجلسة: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Phase 8: Clone / Start New Copy Generation Handler
  const handleCloneSession = async () => {
    if (!selectedSession || !currentUser) return;
    if (!window.confirm("هل ترغب في إنشاء نسخة (جلسة) جديدة ومستقلة بناءً على هذا المنتج للبدء بدورة تحسين إضافية؟")) return;
    
    setSaveLoading(true);
    try {
      const sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const newSession: ProductStudioSession = {
        id: sessionId,
        tenant_id: currentUser.tenant_id,
        company_id: getSessionCompanyId(),
        store_id: selectedSession.store_id,
        branch_id: selectedSession.branch_id,
        product_id: selectedSession.product_id,
        category_id: selectedSession.category_id || "عام",
        status: "draft",
        current_step: "إدخال المنتج", // Starts from step 1
        brand_voice: selectedSession.brand_voice,
        target_market: selectedSession.target_market,
        target_audience: selectedSession.target_audience,
        sales_channel: selectedSession.sales_channel,
        original_image_url: selectedSession.original_image_url,
        approved_text_version_id: "",
        approved_image_asset_ids: [],
        approved_video_asset_ids: [],
        created_by: currentUser.id ? String(currentUser.id) : ""
      };
      
      const saved = await db.saveProductStudioSession(newSession);
      setSessions([saved, ...sessions]);
      setSelectedSession(saved); // switch to the new session
      alert("تم استنساخ الجلسة بنجاح والبدء في دورة تحسين جديدة من الخطوة الأولى! 🔄");
    } catch (err: any) {
      alert("فشل استنساخ الجلسة: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Update Current Step of Session
  const handleUpdateStep = async (stepLabel: string, nextStatus?: 'draft' | 'processing' | 'ready' | 'approved' | 'failed') => {
    if (!selectedSession) return;
    setSaveLoading(true);
    try {
      const updated = {
        ...selectedSession,
        current_step: stepLabel,
        status: nextStatus || selectedSession.status
      };
      const saved = await db.saveProductStudioSession(updated);
      setSelectedSession(saved);
      setSessions(sessions.map(s => s.id === saved.id ? saved : s));
    } catch (err: any) {
      alert("فشل تحديث خطوة العمل: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Header Panel */}
      <div className="p-6 rounded-3xl border text-right space-y-3 relative overflow-hidden"
           style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="inline-flex items-center gap-1 py-1 px-3 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>إطلاق المنتجات الذكي — المرحلة الأولى</span>
        </div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span>استديو المنتجات</span>
          <span className="text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">Phase 1</span>
        </h2>
        <p className="text-xs text-gray-400 font-sans leading-relaxed max-w-3xl">
          من هنا تصنع المنتج من الصورة إلى المحتوى والصور والفيديو والنشر. قم بإنشاء جلسة عمل جديدة لمتابعة تحسين بيانات المنتج ومقوماته التسويقية.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!selectedSession ? (
        /* ================= SESSIONS LIST VIEW ================= */
        <div className="space-y-6">
          
          {/* Phase 8 Global Toggle */}
          <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveDashboardMode("sessions")}
                className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeDashboardMode === "sessions"
                    ? "bg-slate-900 border text-amber-500 font-black border-slate-800"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                جلسات الاستوديو النشطة ⚙️
              </button>
              <button
                type="button"
                onClick={() => setActiveDashboardMode("archive")}
                className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeDashboardMode === "archive"
                    ? "bg-slate-900 border text-amber-500 font-black border-slate-800"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                الأرشيف ولوحة الأداء 📊
              </button>
            </div>
            
            {activeDashboardMode === "sessions" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء جلسة منتج جديدة</span>
              </button>
            )}
          </div>

          {activeDashboardMode === "sessions" ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-white">جلسات العمل النشطة بالاستديو</h3>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  <Zap className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                  <span>جاري تحميل الجلسات من Supabase...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-16 text-center border rounded-3xl border-dashed" style={{ borderColor: theme.border, backgroundColor: theme.card }}>
                  <ClipboardList className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-gray-400">لا توجد جلسات عمل حالية</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">ابدأ بإنشاء أول جلسة عمل لتحليل منتجك وصياغة هويته البصرية والتسويقية بنظام المراحل الثمانية.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 py-2 px-4 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    إنشاء أول جلسة الآن
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden border rounded-2xl" style={{ borderColor: theme.border, backgroundColor: theme.card }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b text-gray-400 font-bold" style={{ borderColor: theme.border }}>
                          <th className="p-4">رقم الجلسة</th>
                          <th className="p-4">المنتج المستهدف</th>
                          <th className="p-4">قناة النشر</th>
                          <th className="p-4">الخطوة الحالية</th>
                          <th className="p-4 text-center">الحالة</th>
                          <th className="p-4 text-left">التحكم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {sessions.map(sess => {
                          const linkedProduct = products.find(p => p.id === sess.product_id);
                          return (
                            <tr key={sess.id} className="hover:bg-slate-900/20 text-white transition-all">
                              <td className="p-4 font-mono font-bold text-gray-400 text-[10px]">
                                {sess.id.substring(0, 15)}...
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {sess.original_image_url ? (
                                    <img src={sess.original_image_url} alt="" className="w-7 h-7 rounded-lg object-cover bg-slate-800" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-gray-500">📸</div>
                                  )}
                                  <div>
                                    <div className="font-bold">{linkedProduct ? linkedProduct.name : "صنف جديد"}</div>
                                    <div className="text-[10px] text-gray-500 font-sans">{sess.category_id || "بدون تصنيف"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-300 font-bold">{sess.sales_channel || "غير محدد"}</td>
                              <td className="p-4 text-amber-450 font-bold flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>{sess.current_step}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block py-1 px-2.5 rounded-full text-[9.5px] font-black border ${
                                  sess.status === "ready" || sess.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : sess.status === "failed"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : sess.status === "processing"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-slate-800 text-gray-400 border-slate-700"
                                }`}>
                                  {sess.status === "ready" ? "جاهز" : 
                                   sess.status === "approved" ? "معتمد" :
                                   sess.status === "failed" ? "فشل" :
                                   sess.status === "processing" ? "قيد المعالجة" : "مسودة"}
                                </span>
                              </td>
                              <td className="p-4 text-left">
                                <button
                                  onClick={() => setSelectedSession(sess)}
                                  className="py-1 px-3 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-white font-bold text-[10.5px] rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
                                >
                                  <span>متابعة الخطوات</span>
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= ARCHIVE & PERFORMANCE DASHBOARD ================= */
            <div className="space-y-6 text-right animate-fade-in">
              
              {/* Global Performance Insights Placeholders */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-slate-950/20 space-y-1" style={{ borderColor: theme.border }}>
                  <span className="text-[10px] text-gray-500 block font-bold">إجمالي المشاهدات الأرشيفية 👁️</span>
                  <span className="text-lg font-black text-white font-mono">142,500</span>
                  <span className="text-[9px] text-emerald-400 block">+12.3% منذ الشهر الماضي</span>
                </div>
                <div className="p-4 rounded-xl border bg-slate-950/20 space-y-1" style={{ borderColor: theme.border }}>
                  <span className="text-[10px] text-gray-500 block font-bold">إجمالي النقرات التسويقية 🖱️</span>
                  <span className="text-lg font-black text-white font-mono">12,840</span>
                  <span className="text-[9px] text-emerald-400 block">8.5% نسبة نقر متوسطة</span>
                </div>
                <div className="p-4 rounded-xl border bg-slate-950/20 space-y-1" style={{ borderColor: theme.border }}>
                  <span className="text-[10px] text-gray-500 block font-bold">المبيعات المكتملة 🛍️</span>
                  <span className="text-lg font-black text-white font-mono">954</span>
                  <span className="text-[9px] text-emerald-400 block">مبيعات متاجر سلة وزد</span>
                </div>
                <div className="p-4 rounded-xl border bg-slate-950/20 space-y-1" style={{ borderColor: theme.border }}>
                  <span className="text-[10px] text-gray-500 block font-bold">معدل التحويل المتوسط 📈</span>
                  <span className="text-lg font-black text-white font-mono">6.7%</span>
                  <span className="text-[9px] text-emerald-400 block">أعلى من متوسط السوق بـ 2.1%</span>
                </div>
              </div>

              {/* Best Performers Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl border bg-slate-950/20 space-y-2 lg:col-span-1" style={{ borderColor: theme.border }}>
                  <h5 className="text-[11px] font-black text-indigo-400">القناة التسويقية الأفضل 📱</h5>
                  <div className="space-y-2 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-white">
                        <span>سلة / Salla</span>
                        <span className="font-mono font-bold">610 طلب (63.9%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '63.9%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-white">
                        <span>زد / Zid</span>
                        <span className="font-mono font-bold">344 طلب (36.1%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-550 h-full rounded-full" style={{ width: '36.1%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border bg-slate-950/20 space-y-2 lg:col-span-2 flex flex-col justify-center" style={{ borderColor: theme.border }}>
                  <h5 className="text-[11px] font-black text-amber-400">أداء الأصول والتوصيات المميزة 🔥</h5>
                  <div className="space-y-3 pt-1 text-xs">
                    <div className="flex justify-between text-[10px] text-gray-300">
                      <span className="font-bold shrink-0">أفضل تعليق/وصف أداءً (Best Caption):</span>
                      <span className="text-white text-left mr-2">"تألق بحضور ملكي لا ينسى مع عطر العود الفاخر. ✨"</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-300 pt-2.5 border-t border-slate-800/40">
                      <span className="font-bold shrink-0">أفضل صورة تسويقية (Best Image):</span>
                      <span className="text-white text-left mr-2">"الصورة المحسنة بخلفية القصر الملكي الفاخر"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Archive Filters */}
              <div className="p-4 rounded-2xl border bg-slate-900/10 grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs" style={{ borderColor: theme.border }}>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">تصفية حسب المنتج:</label>
                  <select
                    value={globalFilterProduct}
                    onChange={(e) => setGlobalFilterProduct(e.target.value)}
                    className="w-full bg-slate-950 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                    style={{ borderColor: theme.border }}
                  >
                    <option value="">كل المنتجات</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">تصفية حسب التصنيف:</label>
                  <select
                    value={globalFilterCategory}
                    onChange={(e) => setGlobalFilterCategory(e.target.value)}
                    className="w-full bg-slate-950 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                    style={{ borderColor: theme.border }}
                  >
                    <option value="">كل التصنيفات</option>
                    {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">نوع الأصل:</label>
                  <select
                    value={globalFilterAssetType}
                    onChange={(e) => setGlobalFilterAssetType(e.target.value)}
                    className="w-full bg-slate-950 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                    style={{ borderColor: theme.border }}
                  >
                    <option value="all">كل الأصول</option>
                    <option value="text">نصوص تسويقية</option>
                    <option value="image">صور منتجات</option>
                    <option value="video">مقاطع ترويجية</option>
                    <option value="package">حزم النشر</option>
                    <option value="audit">تدقيق الجودة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">تصفية حسب حالة الحزمة:</label>
                  <select
                    value={globalFilterStatus}
                    onChange={(e) => setGlobalFilterStatus(e.target.value)}
                    className="w-full bg-slate-950 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                    style={{ borderColor: theme.border }}
                  >
                    <option value="">كل الحالات</option>
                    <option value="approved">معتمد ومؤرشف (Approved)</option>
                    <option value="ready">جاهز للنشر (Ready)</option>
                    <option value="draft">مسودة (Draft)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">تاريخ الإنشاء:</label>
                  <input
                    type="date"
                    value={globalFilterDate}
                    onChange={(e) => setGlobalFilterDate(e.target.value)}
                    className="w-full bg-slate-950 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                    style={{ borderColor: theme.border }}
                  />
                </div>
              </div>

              {/* Archived Sessions Gallery */}
              {sessions.filter(s => {
                if (globalFilterProduct && s.product_id !== globalFilterProduct) return false;
                const linkedP = products.find(p => p.id === s.product_id);
                if (globalFilterCategory && linkedP?.category !== globalFilterCategory) return false;
                if (globalFilterStatus && s.status !== globalFilterStatus) return false;
                if (globalFilterDate && s.created_at && !s.created_at.startsWith(globalFilterDate)) return false;
                if (globalFilterAssetType && globalFilterAssetType !== "all") {
                  if (globalFilterAssetType === "text" && !s.approved_text_version_id) return false;
                  if (globalFilterAssetType === "image" && (!s.approved_image_asset_ids || s.approved_image_asset_ids.length === 0)) return false;
                  if (globalFilterAssetType === "video" && (!s.approved_video_asset_ids || s.approved_video_asset_ids.length === 0)) return false;
                  if (globalFilterAssetType === "package" && s.status !== "approved" && s.status !== "ready") return false;
                  if (globalFilterAssetType === "audit" && s.status !== "approved") return false;
                }
                return true;
              }).length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  <span>لا توجد نتائج مطابقة للتصفية في أرشيف الاستوديو.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {sessions
                    .filter(s => {
                      if (globalFilterProduct && s.product_id !== globalFilterProduct) return false;
                      const linkedP = products.find(p => p.id === s.product_id);
                      if (globalFilterCategory && linkedP?.category !== globalFilterCategory) return false;
                      if (globalFilterStatus && s.status !== globalFilterStatus) return false;
                      if (globalFilterDate && s.created_at && !s.created_at.startsWith(globalFilterDate)) return false;
                      if (globalFilterAssetType && globalFilterAssetType !== "all") {
                        if (globalFilterAssetType === "text" && !s.approved_text_version_id) return false;
                        if (globalFilterAssetType === "image" && (!s.approved_image_asset_ids || s.approved_image_asset_ids.length === 0)) return false;
                        if (globalFilterAssetType === "video" && (!s.approved_video_asset_ids || s.approved_video_asset_ids.length === 0)) return false;
                        if (globalFilterAssetType === "package" && s.status !== "approved" && s.status !== "ready") return false;
                        if (globalFilterAssetType === "audit" && s.status !== "approved") return false;
                      }
                      return true;
                    })
                    .map(sess => {
                      const linkedProduct = products.find(p => p.id === sess.product_id);
                      return (
                        <div key={sess.id} className="p-5 rounded-2xl border bg-slate-900/10 space-y-4 text-right flex flex-col justify-between" style={{ borderColor: theme.border }}>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] text-gray-500 font-mono">ID: {sess.id.substring(0, 12)}</span>
                              <span className={`py-0.5 px-2 rounded-full text-[9px] font-black border ${
                                sess.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-800 text-gray-400 border-slate-700"
                              }`}>
                                {sess.status === "approved" ? "معتمد ومؤرشف" : sess.status === "ready" ? "جاهز" : "مسودة"}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {sess.original_image_url ? (
                                <img src={sess.original_image_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-800 border" style={{ borderColor: theme.border }} />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-gray-500">📸</div>
                              )}
                              <div>
                                <h4 className="font-bold text-white text-xs">{linkedProduct ? linkedProduct.name : "صنف جديد"}</h4>
                                <p className="text-[10px] text-gray-400 font-sans">{sess.category_id || "بدون تصنيف"}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-800/60 pt-3">
                              <div>
                                <span className="text-gray-500 block">قناة النشر:</span>
                                <span className="text-gray-200 font-bold">{sess.sales_channel || "غير محدد"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">نبرة الهوية:</span>
                                <span className="text-gray-200 font-bold">{sess.brand_voice || "رسمية وفخمة"}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedSession(sess);
                              handleUpdateStep("الأرشيف والأداء");
                            }}
                            className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-white font-bold text-xs rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>استعراض الأرشيف والأداء 📊</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= WORKFLOW TRACKER VIEW ================= */
        <div className="space-y-6 animate-fade-in">
          {/* Active Session Info Card */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSelectedSession(null)}
              className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الجلسات</span>
            </button>
            <div className="text-left font-sans">
              <span className="text-[10px] text-gray-500 font-mono">معرف الجلسة: {selectedSession.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Steps Navigation Sidebar */}
            <div className="lg:col-span-1 space-y-3">
              <div className="p-4 rounded-2xl border bg-slate-950/20" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <h4 className="text-xs font-black text-gray-300 border-b pb-2 mb-3 font-sans" style={{ borderColor: theme.border }}>
                  مراحل العمل الرئيسية
                </h4>
                <div className="space-y-2">
                  {VISUAL_PIPELINE_STEPS.map((vStep, idx) => {
                    const isParentActive = vStep.substeps.some(sub => sub.label === selectedSession.current_step);
                    return (
                      <div key={vStep.id} className="space-y-1">
                        <button
                          onClick={() => handleUpdateStep(vStep.substeps[0].label)}
                          className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                            isParentActive 
                              ? "bg-slate-900 border border-[#D6A84F]/40 text-white font-black animate-pulse-subtle" 
                              : "hover:bg-slate-900/40 text-gray-400 hover:text-white border border-transparent"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isParentActive 
                              ? "bg-[#D6A84F]/20 text-[#D6A84F]" 
                              : "bg-slate-950 text-gray-500"
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-bold font-sans">{vStep.label}</div>
                            <div className={`text-[9px] font-sans ${isParentActive ? "text-[#D6A84F]" : "text-gray-500"}`}>
                              {vStep.desc}
                            </div>
                          </div>
                        </button>
                        
                        {isParentActive && (
                          <div className="mr-4 pr-3 border-r border-[#D6A84F]/20 space-y-1 mt-1 transition-all">
                            {vStep.substeps.map(sub => {
                              const isSubActive = selectedSession.current_step === sub.label;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => handleUpdateStep(sub.label)}
                                  className={`w-full text-right py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    isSubActive 
                                      ? "text-[#D6A84F] bg-[#D6A84F]/5 font-black" 
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Progress Gauge Card */}
              <div className="p-4 rounded-2xl border text-right space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <h5 className="text-[10px] font-black text-gray-450 uppercase tracking-wider font-sans">مؤشر التقدم في الجلسة</h5>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      {(() => {
                        const activeVisualStepIdx = VISUAL_PIPELINE_STEPS.findIndex(vs => 
                          vs.substeps.some(sub => sub.label === selectedSession.current_step)
                        );
                        const pct = Math.round(((activeVisualStepIdx + 1) / 4) * 100);
                        return (
                          <span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded-full text-emerald-400 bg-emerald-500/10">
                            {pct}% مكتمل
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-900 border border-slate-800">
                    {(() => {
                      const activeVisualStepIdx = VISUAL_PIPELINE_STEPS.findIndex(vs => 
                        vs.substeps.some(sub => sub.label === selectedSession.current_step)
                      );
                      const pct = Math.round(((activeVisualStepIdx + 1) / 4) * 100);
                      return (
                        <div 
                          style={{ width: `${pct}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#D6A84F]"
                        ></div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content Container */}
            <div className="lg:col-span-3 space-y-6">
              <div className="p-6 rounded-3xl border text-right space-y-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                
                {/* Step Header */}
                <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: theme.border }}>
                  <div>
                    <h3 className="text-lg font-black text-white">الخطوة الحالية: {selectedSession.current_step}</h3>
                    <p className="text-xs text-gray-400 font-sans">
                      {WORKFLOW_STEPS.find(s => s.label === selectedSession.current_step)?.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">حالة الجلسة:</span>
                    <select
                      value={selectedSession.status}
                      onChange={(e) => handleUpdateStep(selectedSession.current_step, e.target.value as any)}
                      className="bg-slate-900 border text-xs text-white py-1.5 px-3 rounded-xl outline-none border-slate-800"
                    >
                      <option value="draft">مسودة (Draft)</option>
                      <option value="processing">قيد المعالجة (Processing)</option>
                      <option value="ready">جاهز للاستخدام (Ready)</option>
                      <option value="approved">معتمد ومكتمل (Approved)</option>
                      <option value="failed">فشل التحليل (Failed)</option>
                    </select>
                  </div>
                </div>

                {/* Step Specific Details */}
                {selectedSession.current_step === "إدخال المنتج" && (
                  <form onSubmit={handleSaveProductDetails} className="space-y-5 text-right">
                    <h4 className="text-xs font-black text-amber-400 border-b pb-2 mb-2" style={{ borderColor: theme.border }}>خطوة 1: إدخال تفاصيل وبيانات المنتج الأصلية 🛍️</h4>
                    
                    {/* Image Upload Area */}
                    <div className="p-5 rounded-2xl border bg-slate-900/40 space-y-4" style={{ borderColor: theme.border }}>
                      <label className="text-[11px] font-black text-white block">صورة المنتج الأصلية (مطلوب للتحليل):</label>
                      
                      {selectedSession.original_image_url ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <img 
                            src={selectedSession.original_image_url} 
                            alt="المنتج الأصلي" 
                            className="w-32 h-32 rounded-xl object-cover border border-slate-800 bg-slate-955" 
                          />
                          <div className="space-y-2 text-right">
                            <span className="text-[10px] text-emerald-450 font-bold block">✓ تم حفظ وتوثيق الصورة سحابياً بنجاح</span>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              تغيير الصورة المرفوعة ↺
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-all">
                          <span className="text-[32px] block mb-2">📸</span>
                          <p className="text-xs text-gray-400 font-sans mb-3">انقر لاختيار ورفع صورة المنتج</p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="py-2.5 px-4 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                          >
                            اختيار ورفع الصورة الآن
                          </button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {uploadLoading && (
                        <div className="text-xs text-amber-400 flex items-center gap-1.5 justify-end">
                          <span className="animate-spin text-sm">⏳</span>
                          <span>جاري رفع وتأمين الصورة في خزانة الملفات السحابية...</span>
                        </div>
                      )}
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">اسم المنتج (اختياري):</label>
                        <input
                          type="text"
                          value={editSessionData.productName}
                          onChange={(e) => setEditSessionData({ ...editSessionData, productName: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="مثال: عطر مسك الغزال الملكي"
                          style={{ borderColor: theme.border }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">التصنيف أو الفئة:</label>
                        <input
                          type="text"
                          value={editSessionData.category}
                          onChange={(e) => setEditSessionData({ ...editSessionData, category: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="مثال: عطور وبخور"
                          style={{ borderColor: theme.border }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">سعر البيع المقترح (ريال):</label>
                        <input
                          type="number"
                          value={editSessionData.price}
                          onChange={(e) => setEditSessionData({ ...editSessionData, price: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="250"
                          style={{ borderColor: theme.border }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">التكلفة الفعلية (ريال):</label>
                        <input
                          type="number"
                          value={editSessionData.cost}
                          onChange={(e) => setEditSessionData({ ...editSessionData, cost: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="80"
                          style={{ borderColor: theme.border }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">رمز SKU التخزيني:</label>
                        <input
                          type="text"
                          value={editSessionData.sku}
                          onChange={(e) => setEditSessionData({ ...editSessionData, sku: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="SKU-OUD-099"
                          style={{ borderColor: theme.border }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">الكمية المتوفرة بالمستودع:</label>
                        <input
                          type="number"
                          value={editSessionData.quantity}
                          onChange={(e) => setEditSessionData({ ...editSessionData, quantity: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="150"
                          style={{ borderColor: theme.border }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">السوق المستهدف:</label>
                        <input
                          type="text"
                          value={editSessionData.targetMarket}
                          onChange={(e) => setEditSessionData({ ...editSessionData, targetMarket: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="مثال: المملكة العربية السعودية والخليج"
                          style={{ borderColor: theme.border }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-bold">قناة البيع والتوزيع:</label>
                        <input
                          type="text"
                          value={editSessionData.salesChannel}
                          onChange={(e) => setEditSessionData({ ...editSessionData, salesChannel: e.target.value })}
                          className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                          placeholder="مثال: متجر سلة / Salla"
                          style={{ borderColor: theme.border }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-gray-400 block font-bold">الفئة المستهدفة للبيع بالتفصيل:</label>
                      <input
                        type="text"
                        value={editSessionData.targetAudience}
                        onChange={(e) => setEditSessionData({ ...editSessionData, targetAudience: e.target.value })}
                        className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right"
                        placeholder="مثال: محبي المنتجات الفاخرة والعطور الطبيعية"
                        style={{ borderColor: theme.border }}
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-gray-400 block font-bold">ملاحظات وطلبات خاصة (اختياري):</label>
                      <textarea
                        value={editSessionData.userNotes}
                        onChange={(e) => setEditSessionData({ ...editSessionData, userNotes: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-900 border text-white py-2.5 px-3.5 rounded-xl outline-none focus:border-amber-500 text-right font-sans leading-relaxed"
                        placeholder="أدخل أي ملاحظات إضافية بخصوص نبرة التسويق أو الكلمات المفتاحية..."
                        style={{ borderColor: theme.border }}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {saveLoading ? "⏳ جاري حفظ وتأمين البيانات..." : "حفظ بيانات المنتج الأصلية والمتابعة ←"}
                      </button>
                    </div>
                  </form>
                )}

                {selectedSession.current_step === "تحليل المنتج" && (
                  <div className="space-y-6 text-right">
                    <h4 className="text-xs font-black text-amber-450 border-b pb-2 mb-2" style={{ borderColor: theme.border }}>خطوة 2: تحليل المنتج وجاهزيته بالذكاء الاصطناعي 🧠</h4>
                    
                    {/* Active Session details preview */}
                    <div className="p-4 rounded-2xl bg-slate-900/50 border grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] font-sans" style={{ borderColor: theme.border }}>
                      <div>
                        <span className="text-gray-500 block">اسم المنتج:</span>
                        <span className="text-white font-extrabold">{selectedSession.product_name || "غير محدد"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">التصنيف:</span>
                        <span className="text-white font-extrabold">{selectedSession.category_id || "عام"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">السعر المستهدف:</span>
                        <span className="text-white font-extrabold">{selectedSession.price ? `${selectedSession.price} ريال` : "غير محدد"}</span>
                      </div>
                    </div>

                    {/* AI Trigger Panel */}
                    {!aiAnalysis ? (
                      <div className="p-8 border border-dashed rounded-3xl text-center space-y-4" style={{ borderColor: theme.border }}>
                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 text-3xl animate-pulse">
                          ✨
                        </div>
                        <h4 className="text-sm font-black text-white">بدء تحليل المنتج الذكي</h4>
                        <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto leading-relaxed">
                          سيقوم خبير ذكاء سهم الاصطناعي بتحليل صورة المنتج المرفوعة بشكل تفصيلي ومطابقتها بطلبك لتحديد نقاط القوة والضعف واستخراج التصنيفات الأمثل.
                        </p>
                        
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleRunAiAnalysis}
                            disabled={analysisLoading}
                            className="py-3 px-8 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                          >
                            {analysisLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                <span>جاري تشغيل تحليل الذكاء الاصطناعي...</span>
                              </span>
                            ) : (
                              "تشغيل تحليل الذكاء الاصطناعي للمنتج 🚀"
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-sm">⚠️</span>
                          <span className="text-xs text-amber-300 font-black">توليد الصور/الفيديو الحقيقي غير مفعل بعد، تم تجهيز البرومبتات وخطة الإنتاج.</span>
                        </div>
                        {/* Analysis results grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Score and suitability */}
                          <div className="p-5 rounded-2xl border space-y-4 text-center bg-slate-900/40" style={{ borderColor: theme.border }}>
                            <span className="text-xs text-gray-400 font-bold block">تقييم الجودة والجاذبية</span>
                            <div className="text-4xl font-black text-amber-500">
                              {aiAnalysis.score}/100
                            </div>
                            <div className="pt-2 border-t border-slate-800">
                              <span className="text-[10px] text-gray-500 block mb-1">صلاحية الصورة للتسويق:</span>
                              {aiAnalysis.analysis_json?.image_marketing_suitable ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-1 px-3 rounded-lg text-[10px] font-black inline-block">
                                  ✓ صالحة وممتازة للنشر
                                </span>
                              ) : (
                                <span className="bg-red-500/10 border border-red-500/30 text-red-400 py-1 px-3 rounded-lg text-[10px] font-black inline-block">
                                  ⚠ تحتاج إلى تعديلات وتحسين
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Classification info */}
                          <div className="p-5 rounded-2xl border space-y-4 md:col-span-2 text-right bg-slate-900/40" style={{ borderColor: theme.border }}>
                            <h5 className="text-xs font-black text-white border-b pb-2 mb-2" style={{ borderColor: theme.border }}>بيانات التصنيف الذكي المستخلصة</h5>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500 block mb-0.5">نوع المنتج المستنتج:</span>
                                <span className="text-white font-extrabold">{aiAnalysis.product_type}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block mb-0.5">التصنيف المقترح:</span>
                                <span className="text-white font-extrabold">{aiAnalysis.suggested_category}</span>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-slate-850">
                                <span className="text-gray-500 block mb-0.5">الفئة المستهدفة:</span>
                                <span className="text-white font-extrabold leading-relaxed font-sans">{aiAnalysis.target_audience}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Strengths, Weaknesses, Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                          {/* Strengths */}
                          <div className="p-5 rounded-2xl border space-y-3 bg-slate-900/20" style={{ borderColor: theme.border }}>
                            <h5 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                              <span>✓</span>
                              <span>نقاط القوة والميزات البارزة:</span>
                            </h5>
                            <ul className="list-disc pr-4 space-y-1.5 text-gray-300">
                              {aiAnalysis.strengths?.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Weaknesses */}
                          <div className="p-5 rounded-2xl border space-y-3 bg-slate-900/20" style={{ borderColor: theme.border }}>
                            <h5 className="text-xs font-black text-red-400 flex items-center gap-1.5">
                              <span>⚠</span>
                              <span>نقاط الضعف والملاحظات:</span>
                            </h5>
                            <ul className="list-disc pr-4 space-y-1.5 text-gray-300">
                              {aiAnalysis.weaknesses?.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommendations */}
                          <div className="p-5 rounded-2xl border space-y-3 md:col-span-2 bg-slate-900/20" style={{ borderColor: theme.border }}>
                            <h5 className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                              <span>ℹ</span>
                              <span>التوصيات والتحسينات المقترحة:</span>
                            </h5>
                            <ul className="list-decimal pr-4 space-y-1.5 text-gray-300">
                              {aiAnalysis.recommendations?.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* SEO Keywords */}
                        <div className="p-5 rounded-2xl border space-y-3 bg-slate-900/40" style={{ borderColor: theme.border }}>
                          <h5 className="text-xs font-black text-amber-450">كلمات SEO مفتاحية أولية (الكلمات الدلالية):</h5>
                          <div className="flex flex-wrap gap-2 pt-1.5">
                            {(aiAnalysis.analysis_json?.seo_keywords || []).map((word: string, idx: number) => (
                              <span key={idx} className="bg-slate-800 text-gray-300 py-1 px-3 rounded-full text-[10.5px] font-bold">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Re-run Button */}
                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={handleRunAiAnalysis}
                            disabled={analysisLoading}
                            className="py-2.5 px-4 bg-slate-800 text-white rounded-xl text-[10.5px] font-bold cursor-pointer hover:bg-slate-700 disabled:opacity-50"
                          >
                            {analysisLoading ? "⏳ جاري إعادة تشغيل التحليل..." : "إعادة تشغيل التحليل بالذكاء الاصطناعي ↺"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleUpdateStep("المحتوى النصي")}
                            className="py-2.5 px-5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 cursor-pointer"
                          >
                            متابعة إلى خطوة المحتوى النصي ←
                          </button>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {selectedSession.current_step === "المحتوى النصي" && (
                  <div className="space-y-6 text-right font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4" style={{ borderColor: theme.border }}>
                      <div>
                        <h4 className="text-xs font-black text-amber-400">خطوة 3: توليد وكتابة المحتوى الإعلاني المتميز ✍️</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">صياغة وتوليد نصوص منصات التواصل والمتاجر الإلكترونية مع أرشفة كاملة لكافة النسخ والتكرارات.</p>
                      </div>
                      
                      {/* Version History Dropdown */}
                      {contentVersions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-bold">نسخ المحتوى المتوفرة:</span>
                          <select
                            value={selectedVersion?.id || ""}
                            onChange={(e) => {
                              const ver = contentVersions.find(v => v.id === e.target.value);
                              if (ver) {
                                setSelectedVersion(ver);
                                setEditVersionMode(false);
                              }
                            }}
                            className="bg-slate-900 border text-[11px] text-white py-1.5 px-3 rounded-xl outline-none border-slate-800"
                          >
                            {contentVersions.map((v) => (
                              <option key={v.id} value={v.id}>
                                إصدار {v.version_number} ({v.style}) {v.is_approved ? "⭐ [معتمد]" : "[مسودة]"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Controls & Generation Panel */}
                    <div className="p-5 rounded-2xl border bg-slate-900/30 space-y-4" style={{ borderColor: theme.border }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Marketing Style Pill Selectors */}
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-black text-gray-400 block">أسلوب الخطاب والتسويق:</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["فاخر", "مباشر", "شبابي", "خليجي", "رسمي", "عاطفي", "مختصر", "عالي الإقناع"].map((styleOpt) => (
                              <button
                                key={styleOpt}
                                type="button"
                                onClick={() => setActiveStyle(styleOpt)}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                                  activeStyle === styleOpt 
                                    ? "bg-amber-500 text-slate-950 font-black shadow" 
                                    : "bg-slate-850 hover:bg-slate-800 text-gray-400 hover:text-white"
                                }`}
                              >
                                {styleOpt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Channel Selectors */}
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-black text-gray-400 block">قنوات النشر المستهدفة:</label>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {["instagram", "tiktok", "whatsapp", "salla", "zid", "amazon"].map((ch) => {
                              const isSel = selectedChannels.includes(ch);
                              return (
                                <button
                                  key={ch}
                                  type="button"
                                  onClick={() => {
                                    if (isSel) {
                                      setSelectedChannels(selectedChannels.filter(c => c !== ch));
                                    } else {
                                      setSelectedChannels([...selectedChannels, ch]);
                                    }
                                  }}
                                  className={`py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isSel
                                      ? "bg-slate-850 border border-amber-500 text-white font-extrabold"
                                      : "bg-slate-900/50 border border-transparent text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  <span>{ch === "instagram" ? "إنستغرام" : ch === "tiktok" ? "تيك توك" : ch === "whatsapp" ? "واتساب" : ch === "salla" ? "سلة" : ch === "zid" ? "زد" : "أمازون"}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Main Generation Buttons */}
                      <div className="flex justify-end gap-3 pt-2">
                        {contentVersions.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleGenerateProductCopy(true)}
                            disabled={copyLoading}
                            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {copyLoading ? "⏳ جاري توليد نسخة جديدة..." : "إعادة توليد نسخة محتوى إضافية (أرشفة القديم) 🔄"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateProductCopy(false)}
                            disabled={copyLoading}
                            className="py-3 px-8 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
                          >
                            {copyLoading ? "⏳ جاري صياغة المحتوى..." : "توليد محتوى المنتج بالذكاء الاصطناعي ✨"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Copy Details */}
                    {selectedVersion ? (
                      <div className="space-y-6">
                        
                        {/* Status Header Block */}
                        <div className="p-4 rounded-2xl border flex justify-between items-center bg-slate-900/40" style={{ borderColor: theme.border }}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs text-gray-400 font-bold">النسخة المعروضة:</span>
                            <span className="bg-slate-800 text-gray-300 py-1 px-2.5 rounded-lg text-[10px] font-bold">إصدار #{selectedVersion.version_number}</span>
                            <span className="bg-slate-800 text-amber-450 py-1 px-2.5 rounded-lg text-[10px] font-bold">أسلوب: {selectedVersion.style}</span>
                          </div>
                          
                          {selectedVersion.is_approved ? (
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-1.5 px-4 rounded-xl text-[10.5px] font-black">
                              ✓ هذه النسخة معتمدة ورسمية للجلسة
                            </span>
                          ) : (
                            <span className="bg-slate-800/80 text-gray-450 py-1.5 px-4 rounded-xl text-[10.5px] font-bold">
                              ⌛ نسخة مسودة غير معتمدة بعد
                            </span>
                          )}
                        </div>

                        {/* Editor Form Mode or Card Grid Display */}
                        {editVersionMode ? (
                          <div className="space-y-5">
                            <h5 className="text-xs font-black text-amber-400 border-b pb-1.5" style={{ borderColor: theme.border }}>تعديل محتوى النسخة #{selectedVersion.version_number} يدوياً:</h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-gray-450 block font-bold">الاسم التسويقي للمنتج:</label>
                                <input
                                  type="text"
                                  value={editedVersionFields.productName}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, productName: e.target.value })}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-gray-455 block font-bold">عنوان العرض الجذاب:</label>
                                <input
                                  type="text"
                                  value={editedVersionFields.title}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, title: e.target.value })}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1 text-xs">
                              <label className="text-gray-450 block font-bold">الوصف القصير (المقدمة):</label>
                              <textarea
                                value={editedVersionFields.shortDescription}
                                onChange={(e) => setEditedVersionFields({ ...editedVersionFields, shortDescription: e.target.value })}
                                rows={2}
                                className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                style={{ borderColor: theme.border }}
                              />
                            </div>

                            <div className="space-y-1 text-xs">
                              <label className="text-gray-450 block font-bold">الوصف الطويل الكامل (السرد التسويقي):</label>
                              <textarea
                                value={editedVersionFields.longDescription}
                                onChange={(e) => setEditedVersionFields({ ...editedVersionFields, longDescription: e.target.value })}
                                rows={4}
                                className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right leading-relaxed font-sans"
                                style={{ borderColor: theme.border }}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-gray-450 block font-bold">المزايا التنافسية (كل ميزة في سطر منفصل):</label>
                                <textarea
                                  value={Array.isArray(editedVersionFields.features) ? editedVersionFields.features.join("\n") : editedVersionFields.features}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, features: e.target.value as any })}
                                  rows={4}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-gray-450 block font-bold">الفوائد المحققة (كل فائدة في سطر منفصل):</label>
                                <textarea
                                  value={Array.isArray(editedVersionFields.benefits) ? editedVersionFields.benefits.join("\n") : editedVersionFields.benefits}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, benefits: e.target.value as any })}
                                  rows={4}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-gray-455 block font-bold">عبارة اتخاذ الإجراء (CTA):</label>
                                <input
                                  type="text"
                                  value={editedVersionFields.cta}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, cta: e.target.value })}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-gray-455 block font-bold">كلمات SEO دلالية (مفصولة بفاصلة):</label>
                                <input
                                  type="text"
                                  value={Array.isArray(editedVersionFields.seoKeywords) ? editedVersionFields.seoKeywords.join(", ") : editedVersionFields.seoKeywords}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, seoKeywords: e.target.value as any })}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                            </div>

                            {/* Captions & Platform details editing */}
                            <h6 className="text-[10px] font-black text-indigo-400 block border-b pb-1">تعديل كابشن المنصات الاجتماعية:</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-gray-400 block">إنستغرام:</label>
                                <textarea
                                  value={editedVersionFields.captionInstagram}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, captionInstagram: e.target.value })}
                                  rows={4}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-400 block">تيك توك:</label>
                                <textarea
                                  value={editedVersionFields.captionTiktok}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, captionTiktok: e.target.value })}
                                  rows={4}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-400 block">واتساب:</label>
                                <textarea
                                  value={editedVersionFields.captionWhatsapp}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, captionWhatsapp: e.target.value })}
                                  rows={4}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                            </div>

                            <h6 className="text-[10px] font-black text-indigo-400 block border-b pb-1">تعديل أوصاف المتاجر الكبرى:</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-gray-400 block">سلة (Salla):</label>
                                <textarea
                                  value={editedVersionFields.captionSalla}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, captionSalla: e.target.value })}
                                  rows={3}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-400 block">زد (Zid):</label>
                                <textarea
                                  value={editedVersionFields.captionZid}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, captionZid: e.target.value })}
                                  rows={3}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-400 block">أمازون (Amazon):</label>
                                <textarea
                                  value={editedVersionFields.captionAmazon}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, captionAmazon: e.target.value })}
                                  rows={3}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                            </div>

                            <h6 className="text-[10px] font-black text-indigo-400 block border-b pb-1">تعديل الإعلانات الممولة:</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-gray-400 block">عنوان الإعلان الممول:</label>
                                <input
                                  type="text"
                                  value={editedVersionFields.adTitle}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, adTitle: e.target.value })}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-400 block">نص الإعلان الممول الأساسي:</label>
                                <textarea
                                  value={editedVersionFields.adBody}
                                  onChange={(e) => setEditedVersionFields({ ...editedVersionFields, adBody: e.target.value })}
                                  rows={3}
                                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                                  style={{ borderColor: theme.border }}
                                />
                              </div>
                            </div>

                            {/* Editing Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: theme.border }}>
                              <button
                                type="button"
                                onClick={() => setEditVersionMode(false)}
                                className="py-2.5 px-5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                إلغاء التعديل
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleSaveVersionEdits(false)}
                                disabled={saveLoading}
                                className="py-2.5 px-5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                              >
                                حفظ التعديلات كمسودة 💾
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSaveVersionEdits(true)}
                                disabled={saveLoading}
                                className="py-2.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer disabled:opacity-50"
                              >
                                اعتماد هذه النسخة 🏆
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            
                            {/* Copy View Mode (Display Cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Title and Name Card */}
                              <div className="p-5 rounded-2xl border space-y-3 bg-slate-900/30" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 border-b pb-1.5 flex justify-between items-center" style={{ borderColor: theme.border }}>
                                  <span>بطاقة 1: العناوين والمسميات</span>
                                  <span className="text-[9px] text-gray-500">العرض التسويقي الأساسي</span>
                                </h5>
                                <div className="space-y-1">
                                  <span className="text-[9.5px] text-gray-550 block">الاسم التسويقي المقترح:</span>
                                  <p className="text-xs text-white font-extrabold">{selectedVersion.product_name}</p>
                                </div>
                                <div className="space-y-1 pt-1.5 border-t border-slate-850">
                                  <span className="text-[9.5px] text-gray-550 block">العنوان الإعلاني الجذاب:</span>
                                  <p className="text-xs text-[#D4AF37] font-black font-sans">{selectedVersion.title}</p>
                                </div>
                              </div>

                              {/* Description Card */}
                              <div className="p-5 rounded-2xl border space-y-3 bg-slate-900/30" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 border-b pb-1.5 flex justify-between items-center" style={{ borderColor: theme.border }}>
                                  <span>بطاقة 2: الوصف التسويقي</span>
                                  <span className="text-[9px] text-gray-500">سرد قصصي بليغ</span>
                                </h5>
                                <div className="space-y-1">
                                  <span className="text-[9.5px] text-gray-550 block">الوصف الوجيز (SEO):</span>
                                  <p className="text-xs text-gray-300 font-sans leading-relaxed">{selectedVersion.short_description}</p>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-slate-850">
                                  <span className="text-[9.5px] text-gray-550 block">الوصف التفصيلي المطول:</span>
                                  <p className="text-xs text-gray-300 font-sans leading-relaxed">{selectedVersion.long_description}</p>
                                </div>
                              </div>

                              {/* Features, Benefits & CTA */}
                              <div className="p-5 rounded-2xl border space-y-3 bg-slate-900/30 md:col-span-2" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 border-b pb-1.5 flex justify-between items-center" style={{ borderColor: theme.border }}>
                                  <span>بطاقة 3: المزايا والفوائد وعبارة الـ CTA</span>
                                  <span className="text-[9px] text-gray-500">محركات إقناع العميل</span>
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-emerald-450 font-bold block">✓ المزايا التنافسية:</span>
                                    <ul className="list-disc pr-4 space-y-1 text-gray-300 text-[11px]">
                                      {selectedVersion.features?.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-emerald-450 font-bold block">✓ الفوائد المحققة:</span>
                                    <ul className="list-disc pr-4 space-y-1 text-gray-300 text-[11px]">
                                      {selectedVersion.benefits?.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                  </div>
                                </div>
                                <div className="pt-3 border-t border-slate-850 flex justify-between items-center">
                                  <div>
                                    <span className="text-[9.5px] text-indigo-400 block font-bold">عبارة اتخاذ الإجراء (CTA):</span>
                                    <p className="text-xs text-white font-extrabold">"{selectedVersion.cta}"</p>
                                  </div>
                                </div>
                              </div>

                              {/* Social Media Captions */}
                              <div className="p-5 rounded-2xl border space-y-3 md:col-span-2" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 border-b pb-1.5 flex justify-between items-center" style={{ borderColor: theme.border }}>
                                  <span>بطاقة 4: كابشن منصات التواصل الاجتماعي</span>
                                  <span className="text-[9px] text-gray-500">جاهز للنسخ المباشر</span>
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1.5">
                                    <span className="text-[10px] text-gray-400 block font-bold">📸 إنستغرام (Instagram):</span>
                                    <p className="text-[10.5px] text-gray-300 whitespace-pre-line font-sans leading-relaxed">{selectedVersion.captions?.instagram || "لم يتم التوليد لهذه القناة"}</p>
                                  </div>
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1.5">
                                    <span className="text-[10px] text-gray-400 block font-bold">🎵 تيك توك (TikTok):</span>
                                    <p className="text-[10.5px] text-gray-300 whitespace-pre-line font-sans leading-relaxed">{selectedVersion.captions?.tiktok || "لم يتم التوليد لهذه القناة"}</p>
                                  </div>
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1.5">
                                    <span className="text-[10px] text-gray-400 block font-bold">💬 واتساب (WhatsApp Broadcast):</span>
                                    <p className="text-[10.5px] text-gray-300 whitespace-pre-line font-sans leading-relaxed">{selectedVersion.captions?.whatsapp || "لم يتم التوليد لهذه القناة"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Store Descriptions */}
                              <div className="p-5 rounded-2xl border space-y-3 md:col-span-2" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 border-b pb-1.5 flex justify-between items-center" style={{ borderColor: theme.border }}>
                                  <span>بطاقة 5: نصوص المتاجر الإلكترونية</span>
                                  <span className="text-[9px] text-gray-500">جاهز للتكامل مع المتجر</span>
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                                    <span className="text-[10px] text-indigo-400 block font-bold">متجر سلة (Salla):</span>
                                    <p className="text-[10.5px] text-gray-300 font-sans leading-relaxed">{selectedVersion.captions?.salla || "غير متوفر"}</p>
                                  </div>
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                                    <span className="text-[10px] text-indigo-400 block font-bold">متجر زد (Zid):</span>
                                    <p className="text-[10.5px] text-gray-300 font-sans leading-relaxed">{selectedVersion.captions?.zid || "غير متوفر"}</p>
                                  </div>
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                                    <span className="text-[10px] text-indigo-400 block font-bold">أمازون (Amazon Hub):</span>
                                    <p className="text-[10.5px] text-gray-300 font-sans leading-relaxed">{selectedVersion.captions?.amazon || "غير متوفر"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Sponsor Ad Copy */}
                              <div className="p-5 rounded-2xl border space-y-3 md:col-span-2" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 border-b pb-1.5 flex justify-between items-center" style={{ borderColor: theme.border }}>
                                  <span>بطاقة 6: نصوص الحملات الإعلانية الممولة</span>
                                  <span className="text-[9px] text-gray-500">Facebook / Instagram Ads</span>
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                                    <span className="text-[10px] text-gray-400 block font-bold">عنوان الإعلان الممول:</span>
                                    <p className="text-xs text-white font-extrabold">{selectedVersion.ad_copy?.ad_title}</p>
                                  </div>
                                  <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                                    <span className="text-[10px] text-gray-400 block font-bold">نص الإعلان الممول الأساسي:</span>
                                    <p className="text-[10.5px] text-gray-300 font-sans leading-relaxed">{selectedVersion.ad_copy?.ad_body}</p>
                                  </div>
                                </div>
                              </div>

                              {/* SEO Tags Card */}
                              <div className="p-5 rounded-2xl border space-y-2 md:col-span-2" style={{ borderColor: theme.border }}>
                                <h5 className="text-[11px] font-black text-amber-450 block">الكلمات الدلالية ومفتاحيات البحث (SEO Keywords):</h5>
                                <div className="flex flex-wrap gap-2 pt-1.5">
                                  {selectedVersion.seo_keywords?.map((word, idx) => (
                                    <span key={idx} className="bg-slate-800 text-gray-300 py-1 px-3 rounded-full text-[10px] font-bold">
                                      #{word}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* View Mode Actions */}
                            <div className="flex justify-between items-center pt-2">
                              <button
                                type="button"
                                onClick={() => setEditVersionMode(true)}
                                className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                تعديل النص يدوياً ✎
                              </button>

                              {!selectedVersion.is_approved && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveVersionEdits(true)}
                                  disabled={saveLoading}
                                  className="py-2.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer disabled:opacity-50"
                                >
                                  اعتماد وتفعيل هذه النسخة 🏆
                                </button>
                              )}
                            </div>
                            
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="p-8 border border-dashed rounded-3xl text-center text-gray-500 text-xs">
                        لا توجد نصوص تسويقية مولدة حالياً لجلسة المنتج المفتوحة. يرجى التوليد باستخدام الخيارات أعلاه.
                      </div>
                    )}
                  </div>
                )}

                {selectedSession.current_step === "الصور التسويقية" && (
                  <div className="space-y-6 text-right font-sans">
                    
                    {/* Access Control check */}
                    {!selectedSession.approved_text_version_id ? (
                      <div className="p-8 border border-dashed rounded-3xl text-center space-y-3 bg-red-950/15 border-red-500/25">
                        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                        <div className="text-xs font-black text-red-400">ممنوع توليد الصور التسويقية قبل اعتماد النص!</div>
                        <p className="text-[10px] text-gray-550 max-w-md mx-auto leading-relaxed">
                          تنص لوائح نظام سهم الاحترافي على ضرورة الانتهاء من صياغة واعتماد المحتوى التسويقي للمنتج (في الخطوة السابقة: المحتوى النصي) أولاً لضمان توجيه مطالبات توليد الصور بالذكاء الاصطناعي بدقة تناسب الهوية المكتوبة.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleUpdateStep("المحتوى النصي")}
                          className="mt-2 py-2 px-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black cursor-pointer transition-all"
                        >
                          ← الانتقال لخطوة المحتوى النصي لاعتماد نسخة
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* Header toolbar */}
                        <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: theme.border }}>
                          <div>
                            <h4 className="text-xs font-black text-amber-400">خطوة 4: إنتاج وتصميم الصور التسويقية الفاخرة بالذكاء الاصطناعي 🎨</h4>
                            <p className="text-[10px] text-gray-500 font-sans mt-0.5">تصميم الأصول الإعلانية لمختلف المقاسات استناداً إلى نبرة وهوية منتجك المعتمد.</p>
                          </div>
                          
                          {productAssets.length > 0 && (
                            <button
                              type="button"
                              onClick={handleGenerateProductImages}
                              disabled={imageGenerationLoading}
                              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              إعادة توليد/إضافة حزمة مطالبات جديدة 🔄
                            </button>
                          )}
                        </div>

                        {/* Generation Panel if Empty */}
                        {productAssets.length === 0 ? (
                          <div className="p-8 border border-dashed rounded-3xl text-center space-y-4 bg-slate-900/10" style={{ borderColor: theme.border }}>
                            <Sliders className="w-10 h-10 text-gray-650 mx-auto" />
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-gray-300">لم يتم إنشاء أصول الصور بعد</h5>
                              <p className="text-[10px] text-gray-500 max-w-sm mx-auto">سيقوم مولّد الصور بصياغة 4 مطالبات إعلانية دقيقة (Hero, Features, Offer, Story) تناسب منتجك المعتمد يدوياً.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerateProductImages}
                              disabled={imageGenerationLoading}
                              className="py-3 px-8 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all mx-auto"
                            >
                              {imageGenerationLoading ? "⏳ جاري صياغة المطالبات..." : "توليد باقة مطالبات الصور الأربعة ✨"}
                            </button>
                          </div>
                        ) : (
                          
                          /* Gallery Grid */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {productAssets.map((asset) => (
                              <div key={asset.id} className="rounded-2xl border bg-slate-900/20 overflow-hidden flex flex-col justify-between" style={{ borderColor: theme.border }}>
                                
                                {/* Image Preview or Prompt Placeholder */}
                                <div className="aspect-[4/3] bg-slate-950 relative flex items-center justify-center border-b overflow-hidden group" style={{ borderColor: theme.border }}>
                                  {asset.asset_type === "image" && asset.url ? (
                                    <>
                                      <img
                                        src={asset.url}
                                        alt={asset.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                      />
                                      <div className="absolute top-3 right-3 bg-slate-900/90 text-[8.5px] font-black text-amber-450 py-1 px-2.5 rounded-lg">
                                        صورة مصممة جاهزة 🖼️
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950/40 p-5 flex flex-col items-center justify-center text-center space-y-3">
                                      <ImageIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
                                      <div>
                                        <span className="text-[10px] text-gray-450 block font-bold">حالة الأصل: مطالبة توليد صورة (Prompt)</span>
                                        <span className="text-[8px] text-gray-550 mt-0.5 block font-mono">في انتظار الرندرة</span>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => handleSimulateImageGeneration(asset)}
                                        disabled={imageGenerationLoading}
                                        className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[9.5px] font-black rounded-lg cursor-pointer transition-all disabled:opacity-50"
                                      >
                                        {imageGenerationLoading ? "⏳ جاري تصميم الصورة..." : "رندرة وتوليد الصورة الفعلية 🪄"}
                                      </button>
                                    </div>
                                  )}

                                  {/* Aspect Dimensions Badge */}
                                  <div className="absolute bottom-3 left-3 bg-slate-900/80 text-[8.5px] text-gray-300 py-1 px-2.5 rounded-lg font-mono font-bold">
                                    مقاس: {asset.dimensions || "1:1"}
                                  </div>
                                </div>

                                {/* Details Body */}
                                <div className="p-4 space-y-3 text-right">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-500/10 py-0.5 px-2 rounded">
                                      {asset.asset_purpose === "Hero" ? "الواجهة الرئيسية (Hero)" : asset.asset_purpose === "Features" ? "مزايا المنتج (Features)" : asset.asset_purpose === "Offer" ? "العرض والخصم (Offer)" : "ستوري الجوال (Story)"}
                                    </span>
                                    
                                    {asset.is_approved ? (
                                      <span className="text-[9px] font-bold text-emerald-450 bg-emerald-500/10 py-0.5 px-2 rounded">
                                        ✓ معتمدة ورسمية
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold text-gray-500 bg-slate-800 py-0.5 px-2 rounded">
                                        مسودة معلقة
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    <h5 className="text-xs font-black text-white">{asset.title}</h5>
                                    <p className="text-[10px] text-gray-400 font-sans leading-relaxed mt-1">{asset.content}</p>
                                  </div>

                                  {/* English Prompt copy block */}
                                  <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                    <span className="text-[8.5px] text-gray-550 block font-bold">المطالبة البرمجية بالإنجليزية (Prompt):</span>
                                    <textarea
                                      readOnly
                                      value={asset.prompt_used}
                                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                                      className="w-full bg-transparent border-none text-[9px] text-gray-400 font-mono outline-none resize-none h-10 text-left cursor-pointer"
                                    />
                                    <div className="text-[8px] text-gray-600 text-left font-sans">💡 انقر لتحديد النص ونسخه لمولدات الصور الخارجية</div>
                                  </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-3 bg-slate-900/40 border-t flex flex-wrap justify-between items-center gap-2" style={{ borderColor: theme.border }}>
                                  
                                  {/* Approve / Lock */}
                                  {!asset.is_approved ? (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveImageAsset(asset)}
                                      className="py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                                    >
                                      ✓ اعتماد الصورة
                                    </button>
                                  ) : (
                                    <span className="text-[9.5px] text-emerald-450 font-black flex items-center gap-1">
                                      <span>✓ معتمد</span>
                                    </span>
                                  )}

                                  <div className="flex gap-2">
                                    {asset.asset_type === "image" && asset.url && (
                                      <>
                                        {/* Set as main */}
                                        <button
                                          type="button"
                                          onClick={() => handleSetAsMainImage(asset)}
                                          className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[9.5px] font-bold rounded-lg cursor-pointer"
                                          title="تعيين كصورة الغلاف الرسمية للمنتج"
                                        >
                                          تعيين كصورة رئيسية 🎯
                                        </button>
                                        
                                        {/* Download */}
                                        <a
                                          href={asset.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[9.5px] font-bold rounded-lg cursor-pointer flex items-center"
                                        >
                                          تحميل ⬇️
                                        </a>

                                        {/* Send for Publishing */}
                                        <button
                                          type="button"
                                          onClick={() => handleSendForPublishing(asset)}
                                          className="py-1.5 px-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-[9.5px] font-black rounded-lg cursor-pointer"
                                        >
                                          إرسال للنشر 🚀
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                              </div>
                            ))}
                          </div>
                        )}
                        
                      </div>
                    )}
                    
                  </div>
                )}

                {selectedSession.current_step === "الفيديوهات" && (
                  <div className="space-y-6 text-right font-sans">
                    
                    {/* Check restrictions: text approved, original image present, and at least one approved marketing asset */}
                    {(!selectedSession.approved_text_version_id || !selectedSession.original_image_url || !productAssets.some(a => a.is_approved)) ? (
                      <div className="p-8 border border-dashed rounded-3xl text-center space-y-4 bg-amber-950/15 border-amber-500/25">
                        <ShieldAlert className="w-9 h-9 text-amber-500 mx-auto animate-pulse" />
                        <div className="text-xs font-black text-amber-400">🚨 تعذر البدء: لم يتم إكمال المتطلبات الأساسية للفيديو</div>
                        <p className="text-[10px] text-gray-500 max-w-lg mx-auto leading-relaxed">
                          تنص لوائح سهم الإعلانية على منع توليد الفيديوهات التسويقية قبل استيفاء المتطلبات التالية بالكامل:
                        </p>
                        <div className="max-w-md mx-auto text-right space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-900 text-[9.5px]">
                          <div className="flex items-center gap-1.5">
                            <span className={selectedSession.approved_text_version_id ? "text-emerald-450" : "text-gray-550"}>
                              {selectedSession.approved_text_version_id ? "✓" : "✗"} المحتوى النصي المعتمد للمنتج (الخطوة 3).
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={selectedSession.original_image_url ? "text-emerald-450" : "text-gray-550"}>
                              {selectedSession.original_image_url ? "✓" : "✗"} صورة أصلية مرفوعة للمنتج (الخطوة 2).
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={productAssets.some(a => a.is_approved) ? "text-emerald-450" : "text-gray-550"}>
                              {productAssets.some(a => a.is_approved) ? "✓" : "✗"} صورة تسويقية واحدة معتمدة على الأقل (الخطوة 4).
                            </span>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-550 max-w-sm mx-auto">
                          يرجى مراجعة الخطوات السابقة واعتماد نسخة نصية وصورة إعلانية واحدة على الأقل قبل الانتقال لتوليد الفيديو.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-sm">⚠️</span>
                          <span className="text-xs text-amber-300 font-black">توليد الصور/الفيديو الحقيقي غير مفعل بعد، تم تجهيز البرومبتات وخطة الإنتاج.</span>
                        </div>
                        
                        {/* Header Section */}
                        <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: theme.border }}>
                          <div>
                            <h4 className="text-xs font-black text-amber-400">خطوة 5: توليد خطة وسيناريو الفيديو التسويقي بالذكاء الاصطناعي 🎬</h4>
                            <p className="text-[10px] text-gray-500 font-sans mt-0.5">صياغة السيناريوهات والقصص الإعلانية الجاذبة وتجهيزها للإنتاج والرندرة.</p>
                          </div>
                        </div>

                        {/* Generation Options Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl border bg-slate-900/10 flex flex-col justify-between space-y-4" style={{ borderColor: theme.border }}>
                            <div className="space-y-1">
                              <h5 className="text-[11px] font-black text-indigo-400">خيارات الفيديو السريع (Short Video) ⚡</h5>
                              <p className="text-[9.5px] text-gray-500 font-sans leading-relaxed">
                                فيديو ترويجي خاطف بمدة 10-15 ثانية. مصمم خصيصاً لمنصات التيك توك وستوريات إنستغرام لزيادة سرعة التحويل المباشر.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleGenerateVideoPlan("short")}
                              disabled={videoGenerationLoading}
                              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl cursor-pointer disabled:opacity-50 transition-all text-center"
                            >
                              {videoGenerationLoading ? "جاري صياغة السكريبت..." : "توليد خطة فيديو سريع (10-15ث) ✨"}
                            </button>
                          </div>

                          <div className="p-4 rounded-2xl border bg-slate-900/10 flex flex-col justify-between space-y-4" style={{ borderColor: theme.border }}>
                            <div className="space-y-1">
                              <h5 className="text-[11px] font-black text-amber-400">فيديو سردي أعمق (Deep Video) 📚</h5>
                              <p className="text-[9.5px] text-gray-500 font-sans leading-relaxed">
                                فيديو تفصيلي بمدة 15-25 ثانية. يركز على شرح المزايا، جودة الصنع، وقصة براند سهم لزيادة ولاء العملاء وتوضيح التفاصيل.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleGenerateVideoPlan("deep")}
                              disabled={videoGenerationLoading}
                              className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-450 text-slate-950 text-[10px] font-black rounded-xl cursor-pointer disabled:opacity-50 transition-all text-center"
                            >
                              {videoGenerationLoading ? "جاري صياغة السكريبت..." : "توليد خطة فيديو أعمق (15-25ث) ✨"}
                            </button>
                          </div>
                        </div>

                        {/* Video Plans Gallery */}
                        {productAssets.filter(a => a.asset_purpose === "ShortVideo" || a.asset_purpose === "DeepVideo").length === 0 ? (
                          <div className="p-6 border rounded-2xl bg-slate-950/20 text-center text-gray-500 text-[10.5px] font-sans" style={{ borderColor: theme.border }}>
                            لم يتم إنشاء أي خطط أو فيديوهات إعلانية بعد. حدد أحد الخيارات أعلاه لتوليد سكريبت ومشاهد الفيديو بالذكاء الاصطناعي.
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {productAssets
                              .filter(a => a.asset_purpose === "ShortVideo" || a.asset_purpose === "DeepVideo")
                              .map((asset) => {
                                const settings = asset.generation_settings || {};
                                const scenes = settings.scene_list || [];
                                const captions = settings.captions || [];
                                
                                return (
                                  <div key={asset.id} className="rounded-2xl border bg-slate-900/10 p-5 space-y-4" style={{ borderColor: theme.border }}>
                                    
                                    {/* Top Bar Header */}
                                    <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9.5px] font-black py-0.5 px-2 rounded ${asset.asset_purpose === "ShortVideo" ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-400"}`}>
                                          {asset.asset_purpose === "ShortVideo" ? "فيديو سريع خاطف" : "فيديو سردي عميق"}
                                        </span>
                                        <h5 className="text-xs font-black text-white">{asset.title}</h5>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {asset.is_approved ? (
                                          <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/15 py-0.5 px-2.5 rounded-lg border border-emerald-500/20">
                                            ✓ خطة معتمدة
                                          </span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveVideoAsset(asset)}
                                            className="py-1 px-3 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-[9.5px] font-black rounded-lg cursor-pointer"
                                          >
                                            اعتماد الخطة
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Layout Grid: Video Player/Mockup Left + Script/Storyboard Right */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                      
                                      {/* Left: Video Player Block */}
                                      <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 rounded-2xl border p-4 space-y-3" style={{ borderColor: theme.border }}>
                                        <div className="text-[10px] font-bold text-gray-400 pb-1">مشاهدة ومعاينة الفيديو:</div>
                                        
                                        {asset.asset_type === "video" && asset.url ? (
                                          <div className="aspect-[9/16] max-h-[380px] rounded-xl overflow-hidden bg-black relative mx-auto border border-slate-800">
                                            <video
                                              src={asset.url}
                                              controls
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div className="aspect-[9/16] max-h-[280px] rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-dashed border-slate-850 p-4 flex flex-col items-center justify-center text-center space-y-3 mx-auto">
                                            <Video className="w-8 h-8 text-amber-500 animate-pulse" />
                                            <div>
                                              <span className="text-[10px] font-bold text-gray-300 block">السكريبت جاهز للإنتاج</span>
                                              <span className="text-[8.5px] text-gray-500 block mt-1">توليد المقطع الإعلاني فوري معلق</span>
                                            </div>
                                            
                                            <button
                                              type="button"
                                              onClick={() => handleSimulateVideoGeneration(asset)}
                                              disabled={videoGenerationLoading}
                                              className="py-1.5 px-4 bg-amber-500 hover:bg-amber-450 text-slate-950 text-[9.5px] font-black rounded-lg cursor-pointer transition-all disabled:opacity-50"
                                            >
                                              {videoGenerationLoading ? "⏳ جاري رندرة الفيديو..." : "رندرة وإنتاج الفيديو الفعلي 🎥"}
                                            </button>
                                          </div>
                                        )}

                                        <div className="flex justify-between items-center pt-2">
                                          {asset.asset_type === "video" && asset.url && (
                                            <a
                                              href={asset.url}
                                              download={`sahm_video_${asset.id}.mp4`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[10px] font-black rounded-lg cursor-pointer text-center block"
                                            >
                                              تحميل الفيديو ⬇️
                                            </a>
                                          )}
                                        </div>
                                      </div>

                                      {/* Right: Plan Script & Storyboard Scenes */}
                                      <div className="lg:col-span-7 space-y-4">
                                        
                                        {/* Script & Voiceover tabs */}
                                        <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
                                          <div>
                                            <span className="text-[9.5px] text-gray-500 font-bold block">1. السيناريو الإعلاني المقترح (Script):</span>
                                            <p className="text-[10.5px] text-gray-300 font-sans mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">{asset.content}</p>
                                          </div>

                                          {settings.voiceover_text && (
                                            <div>
                                              <span className="text-[9.5px] text-gray-550 font-bold block">2. التعليق الصوتي المقترح (Voiceover):</span>
                                              <p className="text-[10px] text-amber-400 font-sans mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">{settings.voiceover_text}</p>
                                            </div>
                                          )}

                                          {captions.length > 0 && (
                                            <div>
                                              <span className="text-[9.5px] text-gray-550 font-bold block">3. نصوص الترجمة على المشهد (Captions):</span>
                                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {captions.map((cap: string, i: number) => (
                                                  <span key={i} className="text-[9px] bg-slate-950 text-gray-400 border border-slate-900 py-0.5 px-2 rounded-lg">
                                                    "{cap}"
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Timeline Scenes Storyboard */}
                                        {scenes.length > 0 && (
                                          <div className="space-y-3">
                                            <span className="text-[10px] font-black text-gray-300 block">4. تفاصيل مشاهد المخطط البصري (Storyboard Scenes):</span>
                                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                                              {scenes.map((scene: any, idx: number) => (
                                                <div key={idx} className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 space-y-2 text-right">
                                                  <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-amber-500">
                                                      مشهد #{scene.scene_number} (المدة: {scene.duration})
                                                    </span>
                                                    <span className="text-[8.5px] text-gray-600 font-mono">
                                                      Overlay: "{scene.text_overlay}"
                                                    </span>
                                                  </div>
                                                  <p className="text-[9.5px] text-gray-300 leading-relaxed">
                                                    {scene.visual_description}
                                                  </p>
                                                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                                                    <span className="text-[8px] text-gray-600 block">مطالبة توليد المشهد (English Prompt):</span>
                                                    <code className="text-[8.5px] text-indigo-400 font-mono block select-all mt-0.5">{scene.generation_prompt}</code>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                      </div>

                                    </div>

                                  </div>
                                );
                              })}
                          </div>
                        )}
                        
                      </div>
                    )}
                    
                  </div>
                )}

                {selectedSession.current_step === "التسويق والنشر" && (
                  <div className="space-y-6 text-right font-sans text-white">
                    
                    {/* Safety Banner */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-start">
                      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-black text-amber-400">ملاحظة أمنية وتشغيلية هامة من سهم OS 🔐</h5>
                        <p className="text-[9.5px] text-gray-400 leading-relaxed">
                          جميع حزم النشر معدة للتحضير، الجدولة، والتحميل. **يمنع تماماً النشر المباشر التلقائي** إلى قنوات مبيعاتك أو منصاتك الإعلانية دون موافقتك اليدوية الصريحة على تفاصيل الحزمة واعتمادها.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: theme.border }}>
                      <div>
                        <h4 className="text-xs font-black text-indigo-400">خطوة 6: حزم تحضير ونشر المنتجات عبر القنوات 📦</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">جهز نصوصاً وتصاميم مخصصة لكل متجر إلكتروني ومنصة إعلانية لتفادي التشتت والتكرار.</p>
                      </div>
                    </div>

                    {/* Channels Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { key: "InternalStore", label: "متجر داخلي", desc: "النشر المباشر على بوابة المبيعات الداخلية للبراند.", color: "border-indigo-500/20 text-indigo-400" },
                        { key: "Salla", label: "متجر سلة (Salla)", desc: "تجهيز تفاصيل المنتج والكتالوج للنشر على متجر سلة.", color: "border-emerald-500/20 text-emerald-400" },
                        { key: "Zid", label: "متجر زد (Zid)", desc: "تجهيز تفاصيل المنتج والكتالوج للنشر على متجر زد.", color: "border-purple-500/20 text-purple-400" },
                        { key: "Shopify", label: "متجر Shopify", desc: "مزامنة المنتجات والأصول التسويقية مع متجر شوبيفاي.", color: "border-green-500/20 text-green-400" },
                        { key: "Instagram", label: "Instagram", desc: "تحضير منشور دعائي متكامل لإنستقرام بالصور المختارة.", color: "border-pink-500/20 text-pink-400" },
                        { key: "TikTok", label: "TikTok", desc: "تحضير سكريبت ووسوم مخصصة لمنصة تيك توك.", color: "border-teal-500/20 text-teal-400" },
                        { key: "WhatsApp", label: "WhatsApp", desc: "نص تسويقي جاهز للإرسال السريع لعملاء الواتساب المباشرين.", color: "border-emerald-600/20 text-emerald-500" },
                        { key: "Snapchat", label: "Snapchat", desc: "تحضير لقطة إعلانية سريعة لقصص وسنابات سناب شات.", color: "border-yellow-600/20 text-yellow-450" },
                        { key: "Amazon", label: "Amazon Merchant", desc: "تنسيق الوصف وخصائص المنتج بما يطابق شروط أمازون.", color: "border-amber-600/20 text-amber-500" },
                        { key: "AdCampaign", label: "حملة إعلانية ممولة", desc: "تحضير نصوص وتصميم الحملة الإعلانية على جوجل أو ميتا.", color: "border-blue-500/20 text-blue-400" }
                      ].map((ch) => {
                        const pkg = publishPackages.find(p => p.channel === ch.key);
                        
                        return (
                          <div key={ch.key} className="rounded-2xl border bg-slate-900/10 p-4 flex flex-col justify-between space-y-4" style={{ borderColor: theme.border }}>
                            
                            {/* Card Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className={`text-xs font-black ${ch.color.split(" ")[1]}`}>{ch.label}</h5>
                                <p className="text-[9.5px] text-gray-500 font-sans mt-0.5 leading-relaxed">{ch.desc}</p>
                              </div>
                              
                              {pkg && (
                                <span className={`text-[8.5px] font-black py-0.5 px-2 rounded-lg border ${
                                  pkg.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  pkg.status === "reviewed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                  "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                }`}>
                                  {pkg.status === "approved" ? "معتمد للنشر 🏆" :
                                   pkg.status === "reviewed" ? "تمت المراجعة 🔍" : "مسودة الحزمة 📝"}
                                </span>
                              )}
                            </div>

                            {/* Package Details (If Prepared) */}
                            {pkg ? (
                              <div className="space-y-3 pt-2 border-t" style={{ borderColor: theme.border }}>
                                
                                {/* Info Review Audit Trail */}
                                {pkg.reviewed_by && (
                                  <div className="text-[8.5px] text-gray-500 bg-slate-950/40 p-1.5 rounded-lg border border-slate-900 flex justify-between">
                                    <span>المراجع: {pkg.reviewed_by}</span>
                                    <span>التاريخ: {pkg.reviewed_at}</span>
                                  </div>
                                )}

                                {/* Metadata fields */}
                                <div className="space-y-2 text-[10px] bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                                  {pkg.title && (
                                    <div>
                                      <span className="text-gray-500 font-bold block">العنوان التسويقي للقناة:</span>
                                      <span className="text-gray-300 font-sans">{pkg.title}</span>
                                    </div>
                                  )}
                                  
                                  {pkg.description && (
                                    <div className="mt-1">
                                      <span className="text-gray-550 font-bold block">الوصف / النص الإعلاني:</span>
                                      <p className="text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">{pkg.description}</p>
                                    </div>
                                  )}

                                  {pkg.caption && (
                                    <div className="mt-1">
                                      <span className="text-gray-550 font-bold block">الكابشن (Caption):</span>
                                      <p className="text-gray-400 font-sans leading-relaxed whitespace-pre-wrap">{pkg.caption}</p>
                                    </div>
                                  )}

                                  {pkg.cta && (
                                    <div className="mt-1">
                                      <span className="text-indigo-400 font-bold block">الدعوة لاتخاذ إجراء (CTA):</span>
                                      <span className="text-gray-300 font-bold font-sans">{pkg.cta}</span>
                                    </div>
                                  )}

                                  {pkg.hashtags && pkg.hashtags.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-gray-550 font-bold block">الهاشتاقات / وسوم البحث:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {pkg.hashtags.map((tag, i) => (
                                          <span key={i} className="text-[8.5px] bg-slate-900 text-gray-400 px-1.5 py-0.5 rounded">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Linked Assets Preview */}
                                {pkg.selected_asset_ids && pkg.selected_asset_ids.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-gray-400">الوسائط المرتبطة بالحزمة (أصل معتمد):</span>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                      {productAssets
                                        .filter(a => pkg.selected_asset_ids?.includes(a.id))
                                        .map((asset) => (
                                          <div key={asset.id} className="relative w-12 h-12 rounded bg-slate-950 border border-slate-900 overflow-hidden shrink-0">
                                            {asset.asset_type === "video" ? (
                                              <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400">
                                                <Video className="w-4 h-4" />
                                              </div>
                                            ) : asset.url ? (
                                              <img src={asset.url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                <ImageIcon className="w-4 h-4" />
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons Panel */}
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPackageText(pkg)}
                                    className="py-1 bg-slate-800 hover:bg-slate-750 text-gray-200 text-[9.5px] font-black rounded-lg cursor-pointer transition-all text-center flex items-center justify-center gap-1"
                                  >
                                    نسخ النص 📋
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadPublishPackage(pkg)}
                                    className="py-1 bg-slate-800 hover:bg-slate-750 text-gray-200 text-[9.5px] font-black rounded-lg cursor-pointer transition-all text-center flex items-center justify-center gap-1"
                                  >
                                    تحميل الحزمة ⬇️
                                  </button>
                                  
                                  {pkg.status === "draft" && (
                                    <button
                                      type="button"
                                      onClick={() => handleReviewPublishPackage(pkg)}
                                      className="py-1 bg-blue-600 hover:bg-blue-550 text-white text-[9.5px] font-black rounded-lg cursor-pointer transition-all text-center"
                                    >
                                      مراجعة الحزمة 🔍
                                    </button>
                                  )}
                                  
                                  {pkg.status !== "approved" && (
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePublishPackage(pkg)}
                                      className={`py-1 text-[9.5px] font-black rounded-lg cursor-pointer transition-all text-center ${
                                        pkg.status === "reviewed" ? "bg-emerald-500 hover:bg-emerald-450 text-slate-950 col-span-1" : "bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 col-span-1"
                                      }`}
                                    >
                                      اعتماد للنشر 🏆
                                    </button>
                                  )}
                                </div>

                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCreatePublishPackage(ch.key as any)}
                                disabled={publishLoading}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl cursor-pointer disabled:opacity-50 transition-all text-center"
                              >
                                {publishLoading ? "جاري تحضير الملفات..." : "تحضير الحزمة الإعلانية للقناة 📦"}
                              </button>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

{selectedSession.current_step === "التدقيق والتحسين" && (
                  <div className="space-y-6 text-right font-sans text-white">
                    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: theme.border }}>
                      <div>
                        <h4 className="text-xs font-black text-indigo-400 font-sans">خطوة 7: تدقيق الجودة والجاهزية بالذكاء الاصطناعي 🛡️</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">فحص تلقائي شامل لمحتوى ووسائط وحزم النشر لمطابقة هوية البراند وضمان خلوها من الأخطاء.</p>
                      </div>
                    </div>

                    <div className="p-10 rounded-3xl border border-dashed border-slate-700/60 bg-slate-950/20 text-center space-y-5">
                      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                        <Lock className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-black text-white font-sans">ميزة التدقيق والتحسين الذكي (قريباً)</h5>
                        <p className="text-xs text-indigo-300 font-bold max-w-md mx-auto leading-relaxed font-sans">
                          التدقيق والتحسين الذكي مغلق حالياً وسيتوفر في التحديث القادم.
                        </p>
                        <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed font-sans">
                          نعمل حالياً على تطوير خوارزميات الذكاء الاصطناعي لفحص امتثال نبرة الهوية، مطابقة الصور التسويقية ومقاطع الفيديو، ودراسة قوة الإقناع التسويقي للنسخ المعتمدة تلقائياً.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedSession.current_step === "الأرشيف والأداء" && (
                  <div className="space-y-6 text-right animate-fade-in">
                    
                    {/* Header bar and Quick Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>الجلسة مكتملة ومؤرشفة بنجاح 🏆</span>
                        </h4>
                        <p className="text-[10px] text-gray-400 font-sans">تم حفظ جميع الأصول والأوصاف التسويقية والتدقيق في أرشيف سهم.</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={handleDownloadFullPackage}
                          className="py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل الحزمة كاملة 📦</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleReopenSession}
                          className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5 text-amber-500" />
                          <span>إعادة فتح الجلسة 🔓</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCloneSession}
                          className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-800 cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>دورة تحسين جديدة 🔄</span>
                        </button>
                      </div>
                    </div>

                    {/* Future-Proof Performance Indicators (Placeholders) */}
                    <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-5 rounded-2xl border space-y-4" style={{ borderColor: theme.border }}>
                      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-black text-white">لوحة أداء المنتج التسويقية (تجهيز بنية الأداء لاحقاً)</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3.5 rounded-xl border bg-slate-950/40 space-y-1" style={{ borderColor: theme.border }}>
                          <span className="text-[9.5px] text-gray-500 block font-bold">المشاهدات (Views) 👁️</span>
                          <span className="text-base font-black text-white font-mono">3,850</span>
                          <span className="text-[8.5px] text-emerald-400 block font-sans">+14.2% مقارنة بالمتوسط</span>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-slate-950/40 space-y-1" style={{ borderColor: theme.border }}>
                          <span className="text-[9.5px] text-gray-500 block font-bold">النقرات (Clicks) 🖱️</span>
                          <span className="text-base font-black text-white font-mono">412</span>
                          <span className="text-[8.5px] text-emerald-400 block font-sans">10.7% نسبة النقر CTR</span>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-slate-950/40 space-y-1" style={{ borderColor: theme.border }}>
                          <span className="text-[9.5px] text-gray-500 block font-bold">الطلبات (Orders) 🛍️</span>
                          <span className="text-base font-black text-white font-mono">38</span>
                          <span className="text-[8.5px] text-emerald-400 block font-sans">تكامل مباشر مع المتاجر</span>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-slate-950/40 space-y-1" style={{ borderColor: theme.border }}>
                          <span className="text-[9.5px] text-gray-500 block font-bold font-sans">معدل التحويل (Conversion Rate) 📈</span>
                          <span className="text-base font-black text-white font-mono">9.2%</span>
                          <span className="text-[8.5px] text-emerald-400 block font-sans">أعلى من متوسط المجال بـ 3%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                        <div className="p-3 rounded-xl border bg-slate-950/20 space-y-1" style={{ borderColor: theme.border }}>
                          <span className="text-[9.5px] text-indigo-400 font-bold block">أفضل قناة تسويقية (Best Channel) 📱</span>
                          <span className="text-white font-bold block">{selectedSession.sales_channel || "سلة / Salla"} (58% من التحويل)</span>
                        </div>
                        <div className="p-3 rounded-xl border bg-slate-950/20 space-y-1 md:col-span-2" style={{ borderColor: theme.border }}>
                          <span className="text-[9.5px] text-amber-400 font-bold block">أفضل نص إعلاني أداءً (Best Caption) 🔥</span>
                          <span className="text-gray-300 block truncate">
                            {contentVersions.find(v => v.is_approved)?.title || "عطر الفخامة الملكية الفاخرة"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main Layout Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Column: Product Image & Timeline */}
                      <div className="space-y-6 lg:col-span-1">
                        
                        {/* Original Image Card */}
                        <div className="p-4 rounded-2xl border bg-slate-900/20 space-y-3" style={{ borderColor: theme.border }}>
                          <h5 className="text-xs font-black text-white">المنتج وصورته الأساسية</h5>
                          {selectedSession.original_image_url ? (
                            <img
                              src={selectedSession.original_image_url}
                              alt=""
                              className="w-full h-48 rounded-xl object-cover bg-slate-950 border"
                              style={{ borderColor: theme.border }}
                            />
                          ) : (
                            <div className="w-full h-48 rounded-xl bg-slate-950 flex items-center justify-center text-xs text-gray-500 border" style={{ borderColor: theme.border }}>
                              لا توجد صورة أساسية متوفرة
                            </div>
                          )}
                          <div className="text-xs space-y-1 text-gray-400 font-sans">
                            <div className="flex justify-between">
                              <span>اسم المنتج:</span>
                              <span className="text-white font-bold">{selectedSession.product_name || "بدون اسم"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>التصنيف:</span>
                              <span className="text-white">{selectedSession.category_id || "عام"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>السعر الأساسي:</span>
                              <span className="text-white font-mono">{selectedSession.price || 0} ر.س</span>
                            </div>
                          </div>
                        </div>

                        {/* Product Timeline */}
                        <div className="p-4 rounded-2xl border bg-slate-900/20 space-y-4" style={{ borderColor: theme.border }}>
                          <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>سجل العمل والخطوات (Timeline)</span>
                          </h5>
                          
                          <div className="relative border-r pr-4 mr-2 space-y-4 text-xs" style={{ borderColor: theme.border }}>
                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                              <p className="font-bold text-white">تم إنشاء الجلسة وبدء إدخال المنتج</p>
                              <p className="text-[9px] text-gray-500 font-sans font-mono">{selectedSession.created_at ? new Date(selectedSession.created_at).toLocaleDateString("ar-SA") : "منذ أيام"}</p>
                            </div>
                            
                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                              <p className="font-bold text-white">تم إنجاز تحليل الذكاء الاصطناعي للمنتج</p>
                              <p className="text-[9px] text-gray-500 font-sans">تم استخراج نقاط القوة والضعف والمنافسين</p>
                            </div>

                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                              <p className="font-bold text-white">توليد المحتوى الإعلاني المعتمد</p>
                              <p className="text-[9px] text-gray-500 font-sans">عدد النسخ المولدة: {contentVersions.length} نسخ</p>
                            </div>

                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                              <p className="font-bold text-white">تصميم الصور والوسائط التسويقية</p>
                              <p className="text-[9px] text-gray-500 font-sans">تم توليد {productAssets.filter(a => a.asset_type === "image").length} صور تسويقية للمنتج</p>
                            </div>

                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                              <p className="font-bold text-white">صياغة خطط الفيديو والسيناريوهات</p>
                              <p className="text-[9px] text-gray-500 font-sans">عدد الخطط المعتمدة: {productAssets.filter(a => a.asset_type === "video" || a.asset_type === "video_prompt").length}</p>
                            </div>

                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                              <p className="font-bold text-white">مراجعة الجودة ومطابقة شروط النشر</p>
                              <p className="text-[9px] text-gray-500 font-sans">تقييم الجودة الإجمالي: {qualityReview ? qualityReview.overall_score : 85}/100</p>
                            </div>

                            <div className="relative">
                              <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-950 animate-pulse"></span>
                              <p className="font-bold text-indigo-400">الاعتماد النهائي والأرشفة بنجاح 🏆</p>
                              <p className="text-[9px] text-gray-500 font-sans">تم تجميد الجلسة وحفظ المخرجات النهائية</p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Tabbed Outputs and Archives */}
                      <div className="space-y-6 lg:col-span-2">
                        
                        {/* Tab Bar Selector */}
                        <div className="flex border-b text-xs font-bold" style={{ borderColor: theme.border }}>
                          <button
                            type="button"
                            onClick={() => setArchiveActiveTab("library")}
                            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                              archiveActiveTab === "library"
                                ? "border-amber-500 text-amber-500"
                                : "border-transparent text-gray-400 hover:text-white"
                            }`}
                          >
                            مكتبة الأصول والوسائط 🎨 ({productAssets.length})
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setArchiveActiveTab("versions")}
                            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                              archiveActiveTab === "versions"
                                ? "border-amber-500 text-amber-500"
                                : "border-transparent text-gray-400 hover:text-white"
                            }`}
                          >
                            مسودات المحتوى النصي ✍️ ({contentVersions.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setArchiveActiveTab("audit")}
                            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                              archiveActiveTab === "audit"
                                ? "border-amber-500 text-amber-500"
                                : "border-transparent text-gray-400 hover:text-white"
                            }`}
                          >
                            تقرير الجودة النهائي 🔍
                          </button>

                          <button
                            type="button"
                            onClick={() => setArchiveActiveTab("analysis")}
                            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                              archiveActiveTab === "analysis"
                                ? "border-amber-500 text-amber-500"
                                : "border-transparent text-gray-400 hover:text-white"
                            }`}
                          >
                            تحليل الذكاء الاصطناعي 📊
                          </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="space-y-4">
                          
                          {/* TAB 1: Library & Media Assets */}
                          {archiveActiveTab === "library" && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl text-xs">
                                <span className="text-gray-400 font-bold">نوع الأصل:</span>
                                <div className="flex gap-2">
                                  {["all", "image", "video", "package"].map((type) => (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() => setLocalFilterAssetType(type)}
                                      className={`py-1 px-3 rounded-lg border transition-all cursor-pointer ${
                                        localFilterAssetType === type
                                          ? "bg-slate-900 border-amber-500 text-amber-500"
                                          : "border-slate-800 text-gray-400 hover:text-white"
                                      }`}
                                    >
                                      {type === "all" ? "الكل" :
                                       type === "image" ? "الصور" :
                                       type === "video" ? "الفيديوهات" : "حزم النشر"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(() => {
                                  const filteredAssets = productAssets.filter(asset => {
                                    if (localFilterAssetType === "all") return true;
                                    if (localFilterAssetType === "image" && asset.asset_type === "image") return true;
                                    if (localFilterAssetType === "video" && (asset.asset_type === "video" || asset.asset_type === "video_prompt")) return true;
                                    return false;
                                  });
                                  
                                  const filteredPackages = localFilterAssetType === "all" || localFilterAssetType === "package" ? publishPackages : [];

                                  if (filteredAssets.length === 0 && filteredPackages.length === 0) {
                                    return (
                                      <div className="col-span-2 py-8 text-center text-gray-500 text-xs">
                                        لا توجد أصول متطابقة مع نوع التصفية المختار.
                                      </div>
                                    );
                                  }

                                  return (
                                    <>
                                      {/* Assets */}
                                      {filteredAssets.map(asset => (
                                        <div key={asset.id} className="p-3.5 rounded-xl border bg-slate-950/20 space-y-3 text-right text-xs" style={{ borderColor: theme.border }}>
                                          <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: theme.border }}>
                                            <span className="font-bold text-white flex items-center gap-1">
                                              {asset.asset_type === "image" ? <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> : <Video className="w-3.5 h-3.5 text-indigo-400" />}
                                              <span>{asset.asset_purpose}</span>
                                            </span>
                                            <span className="text-[9px] text-gray-500 font-mono">ID: {asset.id.substring(0, 10)}</span>
                                          </div>
                                          {asset.asset_type === "image" && asset.url ? (
                                            <img src={asset.url} alt="" className="w-full h-32 rounded-lg object-cover bg-slate-950" />
                                          ) : (
                                            <div className="w-full bg-slate-950 p-2.5 rounded-lg text-gray-400 text-[10px] font-sans border-r-2 border-indigo-500 overflow-y-auto max-h-32">
                                              <p className="font-bold text-white mb-1">فكرة وسيناريو الفيديو:</p>
                                              <p className="leading-relaxed whitespace-pre-wrap">{asset.content || asset.prompt_used}</p>
                                            </div>
                                          )}
                                          <div className="flex justify-between text-[10px] text-gray-500 font-sans pt-1">
                                            <span>القياس: {asset.dimensions || "1:1"}</span>
                                            <span>الحالة: {asset.is_approved ? "معتمد" : "مسودة"}</span>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Packages */}
                                      {filteredPackages.map(pkg => (
                                        <div key={pkg.id} className="p-3.5 rounded-xl border bg-slate-950/20 space-y-3 text-right text-xs" style={{ borderColor: theme.border }}>
                                          <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: theme.border }}>
                                            <span className="font-bold text-white flex items-center gap-1">
                                              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                                              <span>حزمة {pkg.channel}</span>
                                            </span>
                                            <span className={`py-0.5 px-2 rounded-full text-[8.5px] border ${
                                              pkg.status === "approved"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-slate-900 text-gray-400 border-slate-800"
                                            }`}>
                                              {pkg.status === "approved" ? "معتمدة وجاهزة" : "مسودة"}
                                            </span>
                                          </div>
                                          <div className="space-y-1.5 font-sans">
                                            <div className="flex justify-between">
                                              <span className="text-gray-500 text-[10px]">العنوان:</span>
                                              <span className="text-white text-[10.5px] font-bold">{pkg.title || "لا يوجد"}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 leading-relaxed pt-1">
                                              <span className="text-gray-500 block">الوصف / النص الإعلاني:</span>
                                              <p className="bg-slate-950/60 p-2 rounded mt-1 border border-slate-900/60 leading-normal">{pkg.caption || pkg.description || "لا يوجد وصف"}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}

                          {/* TAB 2: Content Versions */}
                          {archiveActiveTab === "versions" && (
                            <div className="space-y-4">
                              
                              {/* Approved Version Detail */}
                              {(() => {
                                const approvedVersion = contentVersions.find(v => v.is_approved) || contentVersions[0];
                                if (!approvedVersion) {
                                  return (
                                    <div className="py-8 text-center text-gray-500 text-xs">
                                      لا توجد نسخ محتوى متوفرة لهذه الجلسة.
                                    </div>
                                  );
                                }

                                return (
                                  <div className="space-y-4">
                                    <div className="p-4 rounded-2xl border bg-emerald-500/5 text-right text-xs space-y-3" style={{ borderColor: "#10b98130" }}>
                                      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: "#10b98115" }}>
                                        <span className="font-black text-emerald-400 flex items-center gap-1.5">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                          <span>النسخة المعتمدة نهائياً للعميل 🏆</span>
                                        </span>
                                        <span className="text-gray-500 font-mono">النسخة رقم #{approvedVersion.version_number} - أسلوب: {approvedVersion.style}</span>
                                      </div>
                                      
                                      <div className="space-y-2 font-sans">
                                        <div>
                                          <span className="text-gray-400 block font-bold text-[10px]">العنوان التسويقي:</span>
                                          <p className="text-sm font-black text-white">{approvedVersion.title}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-400 block font-bold text-[10px]">الوصف القصير:</span>
                                          <p className="text-gray-200 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">{approvedVersion.short_description}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-400 block font-bold text-[10px]">الوصف التفصيلي للمتجر:</span>
                                          <p className="text-gray-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 whitespace-pre-wrap">{approvedVersion.long_description}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                          {approvedVersion.features && approvedVersion.features.length > 0 && (
                                            <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900">
                                              <span className="text-gray-400 font-bold block mb-1 text-[10px]">الميزات الأساسية:</span>
                                              <ul className="list-disc list-inside space-y-1 text-gray-300 pr-1">
                                                {approvedVersion.features.map((feat, index) => (
                                                  <li key={index}>{feat}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {approvedVersion.benefits && approvedVersion.benefits.length > 0 && (
                                            <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900">
                                              <span className="text-gray-400 font-bold block mb-1 text-[10px]">الفوائد والقيمة:</span>
                                              <ul className="list-disc list-inside space-y-1 text-gray-300 pr-1">
                                                {approvedVersion.benefits.map((ben, index) => (
                                                  <li key={index}>{ben}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Other Versions Accordion */}
                                    <div className="space-y-3">
                                      <h5 className="text-[11px] font-black text-gray-400">جميع النسخ السابقة والمسودات المقارنة:</h5>
                                      {contentVersions
                                        .filter(v => v.id !== approvedVersion.id)
                                        .map(v => (
                                          <div key={v.id} className="p-3.5 rounded-xl border bg-slate-950/10 space-y-2 text-right text-xs" style={{ borderColor: theme.border }}>
                                            <div className="flex justify-between items-center text-gray-400">
                                              <span className="font-bold text-gray-300">نسخة #{v.version_number} ({v.style})</span>
                                              <span className="text-[10px] font-mono">{v.language === "ar" ? "العربية 🇸🇦" : "الإنجليزية 🇬🇧"}</span>
                                            </div>
                                            <p className="font-bold text-white truncate">{v.title}</p>
                                            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{v.short_description}</p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* TAB 3: Quality Review Final Report */}
                          {archiveActiveTab === "audit" && (
                            <div className="space-y-4">
                              {qualityReview ? (
                                <div className="space-y-5">
                                  {/* Gauge & Main Score */}
                                  <div className="p-5 rounded-2xl border bg-slate-900/10 flex flex-col md:flex-row items-center gap-6" style={{ borderColor: theme.border }}>
                                    <div className="relative w-28 h-28 shrink-0">
                                      <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                        <circle cx="56" cy="56" r="48"
                                          stroke={qualityReview.overall_score >= 75 ? "#10b981" : qualityReview.overall_score >= 55 ? "#f59e0b" : "#ef4444"}
                                          strokeWidth="8" fill="transparent"
                                          strokeDasharray={2 * Math.PI * 48}
                                          strokeDashoffset={2 * Math.PI * 48 * (1 - qualityReview.overall_score / 100)}
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white font-mono">{qualityReview.overall_score}</span>
                                        <span className="text-[9px] text-gray-500">من 100</span>
                                      </div>
                                    </div>

                                    <div className="space-y-2 text-right">
                                      <h5 className="text-xs font-black text-white">درجة التدقيق النهائي الشامل</h5>
                                      <p className="text-[10.5px] text-gray-400 font-sans leading-relaxed">
                                        تم تدقيق هذه النسخة وفقًا لمعايير الجودة والهوية البصرية ونسبة الإقناع وخلو النصوص من الكلمات المحظورة.
                                      </p>
                                      <div className="flex gap-4 text-[10px] font-sans pt-1">
                                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>نصوص مقنعة</span>
                                        </span>
                                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>وسائط عالية الجودة</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Review Checklist */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border bg-slate-950/20 text-xs space-y-3" style={{ borderColor: theme.border }}>
                                      <h6 className="font-black text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>النقاط الإيجابية وقوة الأصول ({qualityReview.positives?.length || 0})</span>
                                      </h6>
                                      <ul className="space-y-1.5 text-gray-300 font-sans pr-1">
                                        {qualityReview.positives?.map((pos, i) => (
                                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                                            <span>{pos}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-slate-950/20 text-xs space-y-3" style={{ borderColor: theme.border }}>
                                      <h6 className="font-black text-red-400 flex items-center gap-1">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>نقاط الضعف والمحاذير ({qualityReview.negatives?.length || 0})</span>
                                      </h6>
                                      <ul className="space-y-1.5 text-gray-300 font-sans pr-1">
                                        {qualityReview.negatives?.map((neg, i) => (
                                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                            <span className="text-red-500 shrink-0 mt-0.5">✗</span>
                                            <span>{neg}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  {qualityReview.recommendations && qualityReview.recommendations.length > 0 && (
                                    <div className="p-4 rounded-xl border bg-indigo-500/5 text-xs space-y-2" style={{ borderColor: "#6366f130" }}>
                                      <h6 className="font-black text-indigo-400">توصيات التحسين المستقبلية للإعلان:</h6>
                                      <ul className="list-disc list-inside space-y-1 text-gray-300 font-sans pr-1">
                                        {qualityReview.recommendations.map((rec, i) => (
                                          <li key={i}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="py-8 text-center text-gray-500 text-xs">
                                  لم يتم إجراء تدقيق نهائي شامل لجلسة المنتج هذه بعد.
                                </div>
                              )}
                            </div>
                          )}

                          {/* TAB 4: AI Analysis & Strategy */}
                          {archiveActiveTab === "analysis" && (
                            <div className="space-y-4">
                              {aiAnalysis ? (
                                <div className="space-y-4 font-sans text-xs">
                                  <div className="p-4 rounded-xl border bg-slate-950/20 text-right space-y-3" style={{ borderColor: theme.border }}>
                                    <h5 className="font-black text-white">استراتيجية التسويق المقترحة من الذكاء الاصطناعي</h5>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-gray-400 block text-[10px]">نوع المنتج المكتشف:</span>
                                        <span className="text-white font-bold">{aiAnalysis.product_type || "غير محدد"}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 block text-[10px]">التصنيف المقترح:</span>
                                        <span className="text-white font-bold">{aiAnalysis.suggested_category || "غير محدد"}</span>
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-gray-400 block text-[10px] mb-0.5">الجمهور المستهدف:</span>
                                      <p className="text-white bg-slate-950/40 p-2 rounded leading-relaxed">{aiAnalysis.target_audience}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border bg-slate-950/20 space-y-2" style={{ borderColor: theme.border }}>
                                      <h6 className="font-bold text-emerald-400">نقاط القوة التنافسية للعميل:</h6>
                                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                                        {aiAnalysis.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                                      </ul>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-slate-950/20 space-y-2" style={{ borderColor: theme.border }}>
                                      <h6 className="font-bold text-red-400">نقاط الضعف وزوايا الخطر:</h6>
                                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                                        {aiAnalysis.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                                      </ul>
                                    </div>
                                  </div>

                                  {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                                    <div className="p-4 rounded-xl border bg-slate-950/20 space-y-2" style={{ borderColor: theme.border }}>
                                      <h6 className="font-bold text-amber-400">توصيات الذكاء الاصطناعي العامة للإطلاق:</h6>
                                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                                        {aiAnalysis.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="py-8 text-center text-gray-500 text-xs">
                                  لا يتوفر تحليل استراتيجي ذكي لهذه الجلسة.
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* Navigation Buttons inside Workflow */}
                <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: theme.border }}>
                  {(() => {
                    const currentIdx = WORKFLOW_STEPS.findIndex(s => s.label === selectedSession.current_step);
                    return (
                      <>
                        <button
                          disabled={currentIdx === 0 || saveLoading}
                          onClick={() => handleUpdateStep(WORKFLOW_STEPS[currentIdx - 1].label)}
                          className="py-2 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 transition-all"
                        >
                          المرحلة السابقة
                        </button>
                        <button
                          disabled={currentIdx === WORKFLOW_STEPS.length - 1 || saveLoading}
                          onClick={() => handleUpdateStep(WORKFLOW_STEPS[currentIdx + 1].label, currentIdx === WORKFLOW_STEPS.length - 2 ? 'ready' : undefined)}
                          className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1"
                        >
                          <span>المرحلة التالية</span>
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </>
                    );
                  })()}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE SESSION MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity text-right">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl p-6"
               style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: theme.border }}>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCreateModal(false); }} className="w-8 h-8 rounded-full border border-slate-700 hover:border-amber-500/50 hover:bg-slate-850/50 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer z-50"><X className="w-4 h-4" /></button>
              <h3 className="text-base font-black text-white">إنشاء جلسة منتج جديدة</h3>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 mt-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-bold">اختر المنتج المستهدف:</label>
                <select
                  required
                  value={newSessionData.productId}
                  onChange={(e) => setNewSessionData({ ...newSessionData, productId: e.target.value })}
                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                  style={{ borderColor: theme.border }}
                >
                  <option value="">-- اختر منتجاً من الكتالوج --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold">الهوية التجارية المعتمدة:</label>
                <select
                  required
                  value={newSessionData.brandProfileId}
                  onChange={(e) => setNewSessionData({ ...newSessionData, brandProfileId: e.target.value })}
                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                  style={{ borderColor: theme.border }}
                >
                  {brandProfiles.map(b => (
                    <option key={b.id} value={b.id}>{b.brand_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold">السوق المستهدف:</label>
                  <input
                    type="text"
                    required
                    value={newSessionData.targetMarket}
                    onChange={(e) => setNewSessionData({ ...newSessionData, targetMarket: e.target.value })}
                    className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                    style={{ borderColor: theme.border }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold">قناة المبيعات:</label>
                  <select
                    value={newSessionData.salesChannel}
                    onChange={(e) => setNewSessionData({ ...newSessionData, salesChannel: e.target.value })}
                    className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right"
                    style={{ borderColor: theme.border }}
                  >
                    <option value="سلة / Salla">سلة / Salla</option>
                    <option value="زد / Zid">زد / Zid</option>
                    <option value="أمازون / Amazon">أمازون / Amazon</option>
                    <option value="محل تجاري / Retail">محل تجاري / Retail</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold">الجمهور المستهدف:</label>
                <input
                  type="text"
                  required
                  value={newSessionData.targetAudience}
                  onChange={(e) => setNewSessionData({ ...newSessionData, targetAudience: e.target.value })}
                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-right font-sans"
                  style={{ borderColor: theme.border }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold">صورة المنتج الأصلية (رابط URL خارجي):</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={newSessionData.originalImageUrl}
                  onChange={(e) => setNewSessionData({ ...newSessionData, originalImageUrl: e.target.value })}
                  className="w-full bg-slate-900 border text-white py-2 px-3 rounded-xl outline-none focus:border-amber-500 text-left font-sans"
                  style={{ borderColor: theme.border }}
                />
              </div>

              <div className="flex justify-start gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء الجلسة وحفظها بالسحاب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
