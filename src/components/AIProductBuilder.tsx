import React, { useState, useRef, useEffect } from "react";
import { Product, ThemeColors, User } from "../types";
import { 
  Sparkles, Upload, RotateCcw, Check, X, Camera, Zap, FileText, 
  ArrowRight, MessageSquare, Megaphone, Copy, CheckCheck, Landmark, 
  Package, Layers, Info, Trash2, Eye, Download, Percent, Globe, Truck,
  HelpCircle, Settings, ShieldAlert, BadgeInfo, FileSpreadsheet, Plus, Clock, CopyCheck, Coins,
  Image as ImageIcon, Search
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import { productService } from "../core/database/productService";
import { campaignService } from "../core/database/campaignService";
import { competitorService } from "../core/database/competitorService";
import { productTimelineService } from "../core/database/productTimelineService";
import { auditService } from "../core/database/auditService";
import { integrationsService } from "../core/database/integrationsService";

interface AIProductBuilderProps {
  products: Product[];
  setProducts: (prod: Product[]) => void;
  theme: ThemeColors;
  onClose: () => void;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  editingProductId?: string | null;
  currentUser?: User | null;
}

// Full Extended Product Schema for AI Lifecycle Engine
interface EngineProductVariant {
  id: string;
  optionType: string; // Size, Color, Weight, etc.
  optionValue: string; // Large, Black, 500g, Oud
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

interface EngineTimelineEvent {
  id: string;
  title: string;
  details: string;
  user: string;
  time: string;
  iconType: "create" | "price" | "stock" | "image" | "publish" | "campaign" | "sale" | "export";
}

interface EngineAssetFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  url: string;
  isPrimary: boolean;
}

interface EnginePlatformSpecific {
  sallaTaxNumber?: string;
  zidStoreId?: string;
  shopifyCollection?: string;
  wooCommerceSkuFormat?: string;
  amazonAsin?: string;
  noonSellerSku?: string;
}

export default function AIProductBuilder({
  products,
  setProducts,
  theme,
  onClose,
  triggerNotification = () => {},
  addAuditLog = () => {},
  editingProductId = null,
  currentUser = null
}: AIProductBuilderProps) {
  
  // Platform update strategy sync selection state (Requirement 7)
  const [syncOption, setSyncOption] = useState<"local" | "sync" | "schedule">("sync");

  // Local backups list for this product (Requirement 8)
  const [backups, setBackups] = useState<any[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  // Simulation role selector for easier active review and demonstration of permissions (Requirement 5)
  const [activeRoleForTesting, setActiveRoleForTesting] = useState<string>(() => {
    return currentUser?.role || "مدير";
  });

  // Role permissions mapping
  const rolePermissionsMap: Record<string, { editProduct: boolean; editPrice: boolean; editStock: boolean; editSeo: boolean; editImages: boolean; deleteProduct: boolean }> = {
    "مالك النظام": { editProduct: true, editPrice: true, editStock: true, editSeo: true, editImages: true, deleteProduct: true },
    "CEO": { editProduct: true, editPrice: true, editStock: true, editSeo: true, editImages: true, deleteProduct: true },
    "مدير": { editProduct: true, editPrice: true, editStock: true, editSeo: true, editImages: true, deleteProduct: true },
    "محاسب": { editProduct: true, editPrice: true, editStock: true, editSeo: false, editImages: false, deleteProduct: false },
    "أمين مستودع": { editProduct: true, editPrice: false, editStock: true, editSeo: false, editImages: true, deleteProduct: false },
    "مسوق": { editProduct: true, editPrice: false, editStock: false, editSeo: true, editImages: true, deleteProduct: false },
    "كاشير": { editProduct: false, editPrice: false, editStock: false, editSeo: false, editImages: false, deleteProduct: false },
  };

  const currentRolePerms = rolePermissionsMap[activeRoleForTesting] || {
    editProduct: true, editPrice: true, editStock: true, editSeo: true, editImages: true, deleteProduct: true
  };
  
  // Processor status: "idle" | "analyzing" | "review" | "done"
  const [status, setStatus] = useState<"idle" | "analyzing" | "review" | "done">("idle");
  const [loadingMsg, setLoadingMsg] = useState("جاري تشغيل محرك سهم الذكي لدراسة الصورة...");
  
  const [images, setImages] = useState<{ base64: string; mimeType: string; previewUrl: string }[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("sahm_media_center_files");
      return saved ? JSON.parse(saved) : [
        {
          id: "m1",
          name: "دهن عود كلمنتان الملكي.jpg",
          type: "image",
          category: "product",
          url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=300",
          size: "١.٢ ميجابايت",
          date: "٢٠٢٦/٠٦/٠٢"
        },
        {
          id: "m2",
          name: "زعفران ناقيل سوبر فاخر.jpg",
          type: "image",
          category: "product",
          url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=300",
          size: "٨٥٠ كيلوبايت",
          date: "٢٠٢٦/٠٦/٠١"
        },
        {
          id: "m3",
          name: "سند استلام ضريبة القيمة المضافة Zakat.pdf",
          type: "pdf",
          category: "documents",
          url: "#",
          size: "٢.٤ ميجابايت",
          date: "٢٠٢٦/٠٥/٢٨"
        },
        {
          id: "m4",
          name: "رمز استجابة الفاتورة الضريبية المعتمد Zatca QR.png",
          type: "qr",
          category: "documents",
          url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SahmERP-310499221100003",
          size: "٤٥ كيلوبايت",
          date: "٢٠٢٦/٠٦/٠٢"
        },
        {
          id: "m5",
          name: "شعار متجر مراسيم الطيب الرسمي.png",
          type: "image",
          category: "templates",
          url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200",
          size: "٣٢٠ كيلوبايت",
          date: "٢٠٢٦/٠٥/١٥"
        }
      ];
    } catch {
      return [];
    }
  });
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [productExternalLink, setProductExternalLink] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Core Product Lifecycle State
  const [productStatus, setProductStatus] = useState<"draft" | "review_needed" | "ready_to_publish" | "published" | "archived">("draft");
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState<boolean>(false);
  const [selectedApprovalType, setSelectedApprovalType] = useState<"only" | "publish" | "draft">("only");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  
  // All Extensive review fields proposed by AI
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    subtitle: "",
    category: "عطور ودخون",
    localCategory: "مكحلة الطيب الفاخرة",
    brand: "ميثاق الطيب",
    shortDescription: "",
    longDescription: ""
  });

  const [prices, setPrices] = useState({
    price: "450",
    cost: "180",
    discountPrice: "399",
    discountStart: "2026-06-01",
    discountEnd: "2026-06-15"
  });

  const [stockInfo, setStockInfo] = useState({
    sku: "",
    barcode: "6281100345672",
    gtin: "06281100345672",
    mpn: "MPN-OUD-099",
    stock: "100",
    warehouse: "مستودع الرياض الرئيسي (الشرق)",
    alertLimit: "15"
  });

  const [shipping, setShipping] = useState({
    requiresShipping: true,
    weight: "0.45",
    weightUnit: "kg",
    length: "12",
    width: "8",
    height: "15"
  });

  const [taxes, setTaxes] = useState({
    isTaxable: true,
    taxType: "ضريبة القيمة المضافة العامة",
    taxRate: "15"
  });

  const [seo, setSeo] = useState({
    title: "",
    slug: "",
    description: "",
    keywords: "دهن عود, كمبودي ملكي, ميثاق الطيب, عطور نخبة الرياض"
  });

  const [platforms, setPlatforms] = useState({
    publishSalla: true,
    publishZid: false,
    publishShopify: false,
    publishWoo: true,
    publishNoon: false,
    publishAmazon: false,
    platformFields: {
      sallaTaxNumber: "VAT-300184-SA",
      zidStoreId: "ZID-99521",
      shopifyCollection: "الملكي النادر",
      wooCommerceSkuFormat: "WOO-OUD-ROYAL",
      amazonAsin: "B08Z11O5X4",
      noonSellerSku: "NOON-SAHM-OUD"
    } as EnginePlatformSpecific
  });

  const [marketing, setMarketing] = useState({
    shortAd: "شذى الأجداد يفوح مجدداً ✨ احصل على دهن الكلمبوري الملكي مع علبة مخملية مطعمة بالذهب بخصم حصري!",
    adDescription: "ندعو النخبة ومحبي اقتناء صكوك الطيب الفارهة لاقتناص تحفة ميثاق الأولى في عروض هذا الربع. عود نقي خالص يدوم أكثر من 36 ساعة على الثياب وضمان ذهبي كامل للاسترجاع.",
    hashtags: "#عود_كلمبوري_ملكي #ميثاق_الطيب #سهم_المتكامل #عطور_مبخرة",
    targetAudience: "أصحاب الأعمال، محبي الإهداءات الرسمية والاجتماعات، المداومين على الطيب في الخليج",
    recommendedChannels: "سناب شات فلاتر، إعلانات تيك توك، برودكاست واتساب الفئات النخبة"
  });

  // Assets files
  const [assets, setAssets] = useState<EngineAssetFile[]>([]);
  
  // Variants
  const [variants, setVariants] = useState<EngineProductVariant[]>([
    { id: "var_1", optionType: "الحجم", optionValue: "ربع تولة (3 جم)", price: 450, stock: 70, sku: "SKU-OUD-ROYAL-1/4" },
    { id: "var_2", optionType: "الحجم", optionValue: "نصف تولة (6 جم)", price: 820, stock: 30, sku: "SKU-OUD-ROYAL-1/2" }
  ]);

  // Brand new Variant Form State
  const [newVarType, setNewVarType] = useState("اللون أو الحجم");
  const [newVarValue, setNewVarValue] = useState("");
  const [newVarPrice, setNewVarPrice] = useState("");
  const [newVarStock, setNewVarStock] = useState("");

  // Timeline history logs
  const [timeline, setTimeline] = useState<EngineTimelineEvent[]>([
    { id: "ev_1", title: "تم مسح الصورة بالذكاء الاصطناعي", details: "رصد المعالج زجاجة دهن مذهبة ورائحة كلمبورية ثقيلة واقترح الكلاس الصالح للتجارة.", user: "محرك سهم السحابي", time: "2026-06-02 16:15", iconType: "create" },
    { id: "ev_2", title: "توليد الخطة التسويقية الفورية", details: "صياغة إعلان واتساب وبرودكاست سناب شات وحساب النطاق السعري.", user: "وكيل التسويق الذكي", time: "2026-06-02 16:15", iconType: "campaign" }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaCenterInputRef = useRef<HTMLInputElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeProduct = products.find(p => p.id === editingProductId) || null;

  const [loadedCamps, setLoadedCamps] = useState<any[]>([]);
  const [loadedComps, setLoadedComps] = useState<any[]>([]);

  useEffect(() => {
    if (activeProduct) {
      campaignService.getCampaignsByProduct(activeProduct.id).then(setLoadedCamps);
      competitorService.getCompetitorsByProduct(activeProduct.id).then(setLoadedComps);
    }
  }, [activeProduct?.id, products]);

  // Load existing product values when editing (Requirements 1, 2, 3, 4, 8)
  useEffect(() => {
    if (editingProductId) {
      const prod = products.find(p => p.id === editingProductId);
      if (prod) {
        setStatus("review"); // Skip uploading screen, open straight to the review tabs!
        
        setBasicInfo({
          name: prod.name || "",
          subtitle: prod.subtitle || "",
          category: prod.category || "عطور ودخون",
          localCategory: prod.localCategory || "مكحلة الطيب الفاخرة",
          brand: prod.brand || "ميثاق الطيب",
          shortDescription: prod.description || "",
          longDescription: prod.longDescription || ""
        });
        
        setPrices({
          price: String(prod.price ?? "0"),
          cost: String(prod.cost ?? "0"),
          discountPrice: prod.discountPrice || String(prod.price ?? "0"),
          discountStart: prod.discountStart || "2026-06-01",
          discountEnd: prod.discountEnd || "2026-06-15"
        });
        
        setStockInfo({
          sku: prod.sku || "",
          barcode: prod.barcode || "6281100345672",
          gtin: prod.gtin || "06281100345672",
          mpn: prod.mpn || "MPN-OUD-099",
          stock: String(prod.stock ?? "0"),
          warehouse: prod.warehouse || "مستودع الرياض الرئيسي (الشرق)",
          alertLimit: prod.alertLimit || "15"
        });
        
        if (prod.image) {
          setImages([{ base64: "", mimeType: "image/jpeg", previewUrl: prod.image }]);
        } else {
          setImages([]);
        }
        
        setShipping({
          requiresShipping: prod.requiresShipping ?? true,
          weight: prod.weight || "0.45",
          weightUnit: prod.weightUnit || "kg",
          length: prod.length || "12",
          width: prod.width || "8",
          height: prod.height || "15"
        });
        
        setTaxes({
          isTaxable: prod.isTaxable ?? true,
          taxType: prod.taxType || "ضريبة القيمة المضافة العامة",
          taxRate: prod.taxRate || "15"
        });
        
        setSeo({
          title: prod.seoTitle || prod.name || "",
          slug: prod.seoSlug || prod.sku || "",
          description: prod.seoDescription || prod.description || "",
          keywords: prod.seoKeywords || "دهن عود, كمبودي ملكي, ميثاق الطيب"
        });
        
        setPlatforms({
          publishSalla: prod.publishSalla ?? true,
          publishZid: prod.publishZid ?? false,
          publishShopify: prod.publishShopify ?? false,
          publishWoo: prod.publishWoo ?? true,
          publishNoon: prod.publishNoon ?? false,
          publishAmazon: prod.publishAmazon ?? false,
          platformFields: prod.platformSpecificFields || {
            sallaTaxNumber: "VAT-300184-SA",
            zidStoreId: "ZID-99521",
            shopifyCollection: "الملكي النادر",
            wooCommerceSkuFormat: "WOO-OUD-ROYAL",
            amazonAsin: "B08Z11O5X4",
            noonSellerSku: "NOON-SAHM-OUD"
          }
        });
        
        if (prod.variants) {
          setVariants(prod.variants);
        }
        
        if (prod.assets) {
          setAssets(prod.assets);
        }
        
        if (prod.timeline) {
          setTimeline(prod.timeline);
        } else {
          setTimeline([
            { id: "ev_init", title: "تم إنشاء المنتج لأول مرة", details: "تأسيس معرّفات الصنف في الكتالوج الأساسي.", user: "نظام سهم", time: "2026-06-02 16:15", iconType: "create" }
          ]);
        }
        
        setProductStatus(prod.productStatus || "draft");
        
        setMarketing({
          shortAd: prod.marketingShortAd || "شذى الأجداد يفوح مجدداً ✨ احصل على عطر ميثاق بخصم حصري!",
          adDescription: prod.marketingAdDescription || "خصومات كاشير متوفر الآن للتسليم الفوري من المعارض الفاخرة.",
          hashtags: prod.marketingHashtags || "#عطور_مبادرة #ميثاق #كاشير",
          targetAudience: prod.marketingTargetAudience || "رواد ومحبي الطيب والدهن ومقتني النوادر",
          recommendedChannels: prod.marketingRecommendedChannels || "سناب شات، برودكاست واتساب"
        });

        if (prod.backups) {
          setBackups(prod.backups);
        }
      }
    }
  }, [editingProductId, products]);

  // Trigger loading message cycle
  const cycleAnalyzingMsg = (step: number) => {
    const msgs = [
      "جاري تحليل الصورة واستخلاص المكونات والتركيب البصري... 👁️",
      "جاري حساب النطاقات السعرية المربحة وتحديد التكلفة التقريبية بالذكاء المالي... 💰",
      "جاري توليد الكلمات المفتاحية واقتراحات الـ SEO والترميز الدولي... 🔍",
      "جاري صياغة السندات الترويجية والحملة التسويقية لرفع المبيعات... 🚀",
      "يرتب سهم الآن التبويبات والمستشعرات لتسهيل القبول والمراجعة الفورية... 👑"
    ];
    setLoadingMsg(msgs[step % msgs.length]);
  };

  const handlePrimaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUploaded: { base64: string; mimeType: string; previewUrl: string }[] = [];
    
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const item = {
          base64: (reader.result as string).split(",")[1],
          mimeType: file.type,
          previewUrl: reader.result as string
        };
        newUploaded.push(item);
        if (newUploaded.length === files.length) {
          setImages([...images, ...newUploaded]);
          // Auto add to assets center too
          const fileAssets = newUploaded.map((img, index) => ({
            id: "asset_img_" + Date.now() + "_" + index,
            name: file.name,
            mimeType: file.type,
            size: "1.2 MB",
            url: img.previewUrl,
            isPrimary: index === 0 && assets.length === 0
          }));
          setAssets(prev => [...prev, ...fileAssets]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const executeAIAnalysis = () => {
    if (images.length === 0 && !productExternalLink) {
      triggerNotification("الرجاء إمداد المحرك بصورة واحدة على الأقل أو رابط منتج للتحليل السحابي ⚡", "error");
      return;
    }

    setStatus("analyzing");
    let count = 0;
    const interval = setInterval(() => {
      count++;
      cycleAnalyzingMsg(count);
    }, 2800);

    setTimeout(() => {
      clearInterval(interval);
      
      // Auto-populate detailed proposals
      const randomSku = "SKU-OUD-" + Math.floor(1000 + Math.random() * 9000);
      
      setBasicInfo({
        name: "دهن عود كلمبوري ميثاق النخبة ✨ Custom",
        subtitle: "عود كلمبوري صافي ١٠٠٪ معتق للفاخرين والوجهاء",
        category: "عطور ودخون",
        localCategory: "مكحلة الطيب الفاخرة",
        brand: "ميثاق الطيب",
        shortDescription: "مستخلص غابات كمبوديا العتيقة بعبق ملكي فواح وثبات متناهي.",
        longDescription: "عود غني مصفى بإنضاج طبيعي يتجاوز ٨ أشهر في قوارير رصاصية معزولة عن النور ليدوم عبقه الفاخر طويلاً على الثياب والمجالس الفارهة."
      });

      setPrices({
        price: "450",
        cost: "180",
        discountPrice: "375",
        discountStart: "2026-06-03",
        discountEnd: "2026-06-25"
      });

      setStockInfo({
        sku: randomSku,
        barcode: "6282003918231",
        gtin: "06282003918231",
        mpn: "MPN-KO-10",
        stock: "150",
        warehouse: "مستودع الرياض الرئيسي (الشرق)",
        alertLimit: "20"
      });

      setSeo({
        title: "دهن عود كلمبوري ملكي صافي وفاخر | متجر ميثاق الطيب",
        slug: "royal-khambodi-oud-mithaq",
        description: "اشترِ دهن عود كلمبوري ملكي معتق بنقاء مذهل وثبات مضمون 36 ساعة. شحن سري ومجاني لكافة مدن السعودية وضمان استرجاع كامل.",
        keywords: "دهن عود, كلمبوري, عود كمبودي, ميثاق الطيب, عطور الرياض, بخور نخبة"
      });

      addTimelineEvent("تحليل بصري AI", "أنهى معالج سهم قراءة ملامح الصورة واقترح 48 حقلاً ذكياً للمنتج والماركة والـ SEO بنجاح.", "create");
      setStatus("review");
      triggerNotification("تم اقتراح حقول وبيانات دورة حياة المنتج بالكامل من محرك سهم الذكي! 🤖", "success");
    }, 4500);
  };

  const addTimelineEvent = (title: string, details: string, iconType: any) => {
    const newEv: EngineTimelineEvent = {
      id: "ev_" + Date.now(),
      title,
      details,
      user: "الرئيس التنفيذي المساعد (AI)",
      time: new Date().toISOString().replace("T", " ").slice(0, 16),
      iconType
    };
    setTimeline(prev => [newEv, ...prev]);
  };

  // Score Calculators
  const calculateCompleteness = () => {
    let score = 0;
    const listMissing: string[] = [];

    if (basicInfo.name) score += 15; else listMissing.push("الاسم التجاري للمنتج");
    if (basicInfo.longDescription) score += 10; else listMissing.push("وصف تفصيلي طويل");
    if (prices.price && prices.cost) score += 15; else listMissing.push("التسعير والتكلفة");
    if (stockInfo.sku) score += 10; else listMissing.push("رمز التخزين الأساسي SKU");
    if (stockInfo.gtin) score += 10; else listMissing.push("الترميز الدولي ومطابقة الباركود GTIN");
    if (images.length > 0) score += 15; else listMissing.push("أصول وصور المنتج الرئيسية");
    if (seo.slug && seo.description) score += 15; else listMissing.push("روابط السيو المخصصة وميتا السيو SEO Settings");
    if (variants.length > 0) score += 10; else listMissing.push("تحديد خيارات المنتج (الألوان والأحجام)");

    return { val: score, missing: listMissing };
  };

  const calculateHealthScore = () => {
    let health = 100;
    
    // Low images
    if (images.length < 2) health -= 15;
    // Missing SEO Description
    if (!seo.description) health -= 15;
    // No Brand
    if (!basicInfo.brand) health -= 10;
    // Margins issues (cost is higher than half selling price, or price negative)
    const prVal = parseFloat(prices.price) || 0;
    const cVal = parseFloat(prices.cost) || 0;
    if (prVal && cVal) {
      const marginRatio = (prVal - cVal) / prVal;
      if (marginRatio < 0.25) health -= 25; // low margin!
    }
    // Out of Stock check
    if ((parseInt(stockInfo.stock) || 0) <= 0) health -= 20;

    return Math.max(10, health);
  };

  const completeness = calculateCompleteness();
  const healthScore = calculateHealthScore();

  // Custom Variant Addition
  const addNewVariantInline = () => {
    if (!newVarValue.trim() || !newVarPrice.trim()) {
      triggerNotification("يرجى ملء خصائص ومقدار الخيار والوزن والنوع والسعر أولاً.", "error");
      return;
    }

    const priceNum = parseFloat(newVarPrice) || 0;
    const stockNum = parseInt(newVarStock) || 0;
    const randId = "var_" + Date.now();
    const generatedSku = (stockInfo.sku || "SKU-PROD") + "-" + newVarValue.toUpperCase().replace(/\s+/g, '-');

    const newVarObj: EngineProductVariant = {
      id: randId,
      optionType: newVarType,
      optionValue: newVarValue,
      price: priceNum,
      stock: stockNum,
      sku: generatedSku
    };

    setVariants([...variants, newVarObj]);
    setNewVarValue("");
    setNewVarPrice("");
    setNewVarStock("");
    triggerNotification(`تم إضافة خيار المنتج الجديد: ${newVarValue} بنجاح ✨`, "success");
    addTimelineEvent("إضافة خيار (Variant)", `تم استيلاد وتعيين خيار جديد من النمط [${newVarType}] بقيمة (${newVarValue}) وتكلفتها بمخزون ${stockNum}.`, "stock");
  };

  const deleteVariantInline = (id: string, name: string) => {
    setVariants(variants.filter(v => v.id !== id));
    triggerNotification("تم إزالة خيار السعة والمقدار بنجاح.");
    addTimelineEvent("مسح خيار", `تم إتلاف وحذف خيار المنتج (${name}) من بطاقة المتجر والمستودعات.`, "stock");
  };

  // Asset multi support functions
  const handleAssetMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const isImg = file.type.startsWith("image/");
      const assetFile: EngineAssetFile = {
        id: "asset_inline_" + Date.now(),
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: (file.size / 1024 > 1024) ? (file.size / (1024 * 1024)).toFixed(1) + " MB" : Math.round(file.size / 1024) + " KB",
        url: isImg ? (reader.result as string) : "#",
        isPrimary: false
      };
      setAssets([...assets, assetFile]);
      if (isImg) {
        setImages([...images, { base64: (reader.result as string).split(",")[1], mimeType: file.type, previewUrl: reader.result as string }]);
      }
      triggerNotification(`تم رفع وحفظ وثيقة الأصول للمورد: ${file.name} بقاعدة الأصول 🏆`, "success");
      addTimelineEvent("رفع مستند بالوسائط", `قام المستخدم بشحن المستند والوثيقة لملفات المنتج بمسمى: ${file.name}`, "image");
    };
    reader.readAsDataURL(file);
  };

  const setPrimaryImg = (id: string) => {
    setAssets(assets.map(a => ({ ...a, isPrimary: a.id === id })));
    triggerNotification("تم تعيين الصورة المصورة كواجهة وصورة رئيسية للمنتج!");
    addTimelineEvent("تعيين واجهة بصرية", "تغيير الصورة الأساسية لبضاعة المتجر وقنوات البيع كاشير.", "image");
  };

  const deleteAsset = (id: string, name: string) => {
    setAssets(assets.filter(a => a.id !== id));
    triggerNotification("تم جرف وحذف الملف بالكامل ومزامنة المستودعات.");
    addTimelineEvent("حذف أصل أو مستند", `تم تفريغ وإسقاط الملف الملحق: ${name}`, "image");
  };

  // SEO Optimizer Smart Assist
  const handleAIOptimizeSEO = () => {
    const slugGen = (basicInfo.name || "product")
      .toLowerCase()
      .trim()
      .replace(/[^\u0621-\u064A0-9a-zA-Z\s-]/g, "")
      .replace(/\s+/g, "-");

    setSeo({
      title: `${basicInfo.name || "صنف ذكي فخم"} | معتمد بأقوى ضمان من ميثاق الطيب`,
      slug: slugGen,
      description: `اكتشف سعر ومزايا ${basicInfo.name || "هذا المنتج الفريد"}. ${basicInfo.shortDescription || "وصف حصري متميز"}. توصيل مجاني وسريع ودفع آمن عبر تمارا والبطاقات.`,
      keywords: `${basicInfo.category}, ${basicInfo.brand}, عطر فواح, منتج ميثاق الرياض, صفقات سعودية`
    });

    triggerNotification("تم تحسين صياغة الـ SEO و Slug وعناوين الباور بمستشعرات محركات البحث! 🚀🔍", "success");
    addTimelineEvent("إصلاح وتحسين SEO", "تشغيل أداة ذكاء سهم لتحسين أوسمة البحث وميتا الاستجابة لقوقل سيرش.", "publish");
  };

  // Smart advertising campaigns engine modal
  const handleAICreateCampaign = () => {
    setMarketing({
      shortAd: `فرصة دهن النخبة الكبرى 👑 عطر ${basicInfo.name || "الكلمبوري الفاخر"} متوفر بخصم ${prices.discountPrice} ر.س ومخزون حصري!`,
      adDescription: `تألق بحضور فريد يجتذب الأنظار مع عبق ميثاق الاستثنائي المصنع يدوياً بالكامل. توصيل مجاني لباب المنزل وضمان مالي ذهبي عالي الثقة.`,
      hashtags: "#إعلان_ميثاق #سهم_المتكامل #أكواد_عطور #خصومات_السعودية #الامتداد_الذهبي",
      targetAudience: "رجال الأعمال، رواد المجالس الخاصة والزوار في دول الخليج والمملكة فوق 25 سنة",
      recommendedChannels: "إعلانات جوجل، حملة برودكاست سناب شات التفاعلية، رسائل الواتساب الدائرية"
    });

    triggerNotification("تم تأسيس وصياغة حملة ترويجية ذكية منسجمة مع فئات السعر الحالية! 📣💹", "success");
    addTimelineEvent("توليد حملة ترويجية", "طرح وهندسة هيكل إعلان تسويقي جاهز للنسخ المباشر عبر السناپ وواتساب.", "campaign");
  };

  // Copy to Clipboard Assist
  const handleCopyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2500);
    triggerNotification("تم نسخ النص الإعلاني إلى حافظة الجهاز بنجاح! 📋", "success");
  };

  // Draft Cloning
  const handleCloneProduct = () => {
    setBasicInfo({
      ...basicInfo,
      name: `${basicInfo.name} - نسخة مكررة`
    });
    setStockInfo({
      ...stockInfo,
      sku: (stockInfo.sku || "SKU") + "-COPY"
    });
    triggerNotification("تم استنساخ خصائص ومقادير ومستندات وصور الصنف في مسودة متطابقة جديدة 📁✨");
    addTimelineEvent("استنساخ صنف", "توليد نسخة كربونية كاملة للمنتج تجنباً لإعادة كتابة الحقول مجدداً.", "create");
  };

  // Archive draft product
  const handleArchiveDraft = () => {
    setProductStatus("archived");
    triggerNotification("تم نقل المنتج وحفظه كملف مؤرشف ومستبعد من منشآت العرض النشط 📦🗃️");
    addTimelineEvent("أرشفة الصنف", "تبديل حالة دورة حياة المنتج إلى [مؤرشف] وتجميده بكتالوج سهم.", "publish");
  };

  // Restore previous backup (Requirement 8)
  const handleRestoreBackup = (bk: any) => {
    if (confirm(`هل أنت متأكد من استعادة النسخة الاحتياطية المؤرشفة بتاريخ ${bk.timeFormatted}؟`)) {
      const data = bk.data;
      setBasicInfo({
        name: data.name || "",
        subtitle: data.subtitle || "",
        category: data.category || "عطور ودخون",
        localCategory: data.localCategory || "",
        brand: data.brand || "",
        shortDescription: data.description || "",
        longDescription: data.longDescription || ""
      });
      setPrices({
        price: String(data.price ?? "0"),
        cost: String(data.cost ?? "0"),
        discountPrice: data.discountPrice || String(data.price ?? "0"),
        discountStart: data.discountStart || "2026-06-01",
        discountEnd: data.discountEnd || "2026-06-15"
      });
      setStockInfo({
        sku: data.sku || "",
        barcode: data.barcode || "",
        gtin: data.gtin || "",
        mpn: data.mpn || "",
        stock: String(data.stock ?? "0"),
        warehouse: data.warehouse || "",
        alertLimit: data.alertLimit || "15"
      });
      setShipping({
        requiresShipping: data.requiresShipping ?? true,
        weight: data.weight || "0.45",
        weightUnit: "kg",
        length: "12",
        width: "8",
        height: "15"
      });
      setSeo({
        title: data.seoTitle || "",
        slug: data.seoSlug || "",
        description: data.seoDescription || "",
        keywords: data.seoKeywords || ""
      });
      if (data.variants) setVariants(data.variants);
      if (data.assets) setAssets(data.assets);
      if (data.timeline) setTimeline(data.timeline);
      
      triggerNotification("تم استرجاع وإعادة تحميل النسخة الاحتياطية المحددة بنجاح! 🔄📦", "success");
      addTimelineEvent("استرجاع نسخة احتياطية", `تم استعادة النسخة الاحتياطية المؤرشفة بنجاح بواسطة ${currentUser ? currentUser.name : "المدير العام"}.`, "publish");
    }
  };

  // Final Commit Save / Edit with Confirmation Workflow
  const handleFinalPublishSave = () => {
    if (!basicInfo.name) {
      if (triggerNotification) {
        triggerNotification("الاسم التجاري للمجسم أساسي ولا بد من كتابته لاعتماد وإنشاء السجل.", "error");
      }
      return;
    }
    setApproveError(null);
    setShowApproveConfirmModal(true);
  };

  const commitFinalApproveSave = async (approvalType: "only" | "publish" | "draft") => {
    setIsApproving(true);
    setApproveError(null);
    try {
      // 7. Strict Validation of required fields
      if (!basicInfo.name || !basicInfo.name.trim()) {
        throw new Error("اسم المنتج متطلب أساسي ومفقود.");
      }
      
      const priceNum = parseFloat(prices.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error("سعر بيع المنتج متطلب أساسي ويجب أن يكون رقماً أكبر من صفر.");
      }
      
      if (!basicInfo.category || !basicInfo.category.trim()) {
        throw new Error("تصنيف المنتج متطلب أساسي ومفقود.");
      }
      
      if (!images || images.length === 0 || !images[0]?.previewUrl) {
        throw new Error("صورة المنتج الأساسية متطلبة ومفقودة.");
      }
      
      const stockNum = parseInt(stockInfo.stock);
      if (isNaN(stockNum) || stockNum < 0) {
        throw new Error("كمية أو حالة مخزون الصنف متطلبة ومفقودة أو قيمتها خاطئة.");
      }

      const costNum = parseFloat(prices.cost) || 0;
      const finalSku = stockInfo.sku.trim() || `SKU-${basicInfo.category.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`;

      const activeUserLabel = currentUser ? currentUser.name : "المدير العام";

      // Product statuses: "draft" | "review_needed" | "ready_to_publish" | "published" | "archived"
      const targetStatus: "draft" | "review_needed" | "ready_to_publish" | "published" | "archived" = 
        approvalType === "draft" ? "draft" : "published";

      setProductStatus(targetStatus);

      // Create event inside Product's internal timeline
      const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 16);
      const approveDetails = approvalType === "only" 
        ? "تم اعتماد المنتج كـ [نشط معتمد] بنجاح في قاعدة نظام سهم للوجستيات والمخازن."
        : approvalType === "publish" 
          ? "تم القبول والاعتماد النهائي مع نشر متزامن وحي لكافة المنصات الخارجية الفورية."
          : "تم حفظ وتسيير هذا المنتج كمسودة معتمدة مؤقتة لحين مراجعتها لاحقاً.";

      const newTimelineItem = {
        id: "ev_app_" + Date.now(),
        title: approvalType === "draft" ? "حفظ كمسودة معتمدة" : "تم اعتماد المنتج نهائياً",
        details: approveDetails,
        user: activeUserLabel,
        time: timestampStr,
        iconType: (approvalType === "draft" ? "create" : "publish") as any
      };

      const updatedTimeline = [newTimelineItem, ...timeline];

      let savedProduct: Product;

      if (editingProductId) {
        const oldProd = products.find(p => p.id === editingProductId);
        if (!oldProd) {
          throw new Error("عذراً، لم نتمكن من العثور على المنتج الأصلي لتعديله بقاعدة السجلات.");
        }

        // Permission Validation (الصلاحيات)
        if (!currentRolePerms.editProduct) {
          throw new Error("خطأ أمني: ليس لديك صلاحية تعديل المنتجات لـ رتبتك الحالية!");
        }
        if (priceNum !== oldProd.price && !currentRolePerms.editPrice) {
          throw new Error(`خطأ: لا تملك صلاحية لتعديل الأسعار [رتبتك: ${activeRoleForTesting}]`);
        }
        if (stockNum !== oldProd.stock && !currentRolePerms.editStock) {
          throw new Error(`خطأ: لا تملك صلاحية لتعديل الكمية والمخزون [رتبتك: ${activeRoleForTesting}]`);
        }
        const hasImageChanged = (images[0]?.previewUrl || "") !== (oldProd.image || "");
        if (hasImageChanged && !currentRolePerms.editImages) {
          throw new Error(`خطأ: لا تملك صلاحية لتعديل صور ووسائط المنتج [رتبتك: ${activeRoleForTesting}]`);
        }

        // Check SKU update confirmation
        if (oldProd.sku && finalSku !== oldProd.sku) {
          const confirmSku = confirm(`تنبيه أمني وحفظ آمن: أنت تقوم بتغيير رمز SKU الفرعي من "${oldProd.sku}" إلى "${finalSku}". تغيير هذا الرمز قد يربك عمليات نقاط البيع السابقة. هل تريد الاستمرار بحفظ الرمز الجديد للتوريد؟`);
          if (!confirmSku) return;
        }

        // Automatic Backup Snapshots prior to large changes (النسخ الاحتياطي)
        const previousSnapshot = {
          id: "bk_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          timeFormatted: new Date().toLocaleTimeString("ar-SA") + " - " + new Date().toLocaleDateString("ar-SA"),
          user: activeUserLabel,
          data: {
            name: oldProd.name,
            price: oldProd.price,
            cost: oldProd.cost,
            stock: oldProd.stock,
            category: oldProd.category,
            description: oldProd.description,
            image: (oldProd.image && oldProd.image.startsWith("data:") && oldProd.image.length > 5000) 
              ? "[تم تفريغ الصورة لتوفير المساحة]" 
              : oldProd.image,
            subtitle: oldProd.subtitle,
            brand: oldProd.brand,
            sku: oldProd.sku,
            longDescription: oldProd.longDescription,
            barcode: oldProd.barcode,
            gtin: oldProd.gtin,
            mpn: oldProd.mpn,
            warehouse: oldProd.warehouse,
            alertLimit: oldProd.alertLimit,
            requiresShipping: oldProd.requiresShipping,
            weight: oldProd.weight,
            seoTitle: oldProd.seoTitle,
            seoSlug: oldProd.seoSlug,
            seoDescription: oldProd.seoDescription,
            seoKeywords: oldProd.seoKeywords,
            variants: oldProd.variants,
            assets: undefined,
            timeline: undefined
          }
        };

        const sanitizedBackups = (oldProd.backups || []).map((bk: any) => {
          if (bk && bk.data) {
            return {
              ...bk,
              data: {
                ...bk.data,
                image: (bk.data.image && bk.data.image.startsWith("data:") && bk.data.image.length > 5000)
                  ? "[تم تفريغ الصورة لتوفير المساحة]"
                  : bk.data.image,
                assets: undefined,
                timeline: undefined
              }
            };
          }
          return bk;
        });

        const newBackupsList = [previousSnapshot, ...sanitizedBackups].slice(0, 5);

        savedProduct = {
          ...oldProd,
          name: basicInfo.name,
          sku: finalSku,
          price: priceNum,
          cost: costNum,
          stock: stockNum,
          category: basicInfo.category,
          description: basicInfo.shortDescription || basicInfo.subtitle,
          image: images[0]?.previewUrl || undefined,
          subtitle: basicInfo.subtitle,
          localCategory: basicInfo.localCategory,
          brand: basicInfo.brand,
          longDescription: basicInfo.longDescription,
          discountPrice: prices.discountPrice,
          discountStart: prices.discountStart,
          discountEnd: prices.discountEnd,
          barcode: stockInfo.barcode,
          gtin: stockInfo.gtin,
          mpn: stockInfo.mpn,
          warehouse: stockInfo.warehouse,
          alertLimit: stockInfo.alertLimit,
          requiresShipping: shipping.requiresShipping,
          weight: shipping.weight,
          weightUnit: shipping.weightUnit,
          length: shipping.length,
          width: shipping.width,
          height: shipping.height,
          isTaxable: taxes.isTaxable,
          taxType: taxes.taxType,
          taxRate: taxes.taxRate,
          seoTitle: seo.title,
          seoSlug: seo.slug,
          seoDescription: seo.description,
          seoKeywords: seo.keywords,
          publishSalla: approvalType === "publish" ? true : platforms.publishSalla,
          publishZid: approvalType === "publish" ? true : platforms.publishZid,
          publishShopify: platforms.publishShopify,
          publishWoo: platforms.publishWoo,
          publishNoon: platforms.publishNoon,
          publishAmazon: platforms.publishAmazon,
          platformSpecificFields: platforms.platformFields,
          marketingShortAd: marketing.shortAd,
          marketingAdDescription: marketing.adDescription,
          marketingHashtags: marketing.hashtags,
          marketingTargetAudience: marketing.targetAudience,
          marketingRecommendedChannels: marketing.recommendedChannels,
          variants,
          assets,
          timeline: updatedTimeline,
          productStatus: targetStatus,
          backups: newBackupsList
        };

        const updatedProducts = products.map(p => p.id === editingProductId ? savedProduct : p);
        setProducts(updatedProducts);
      } else {
        savedProduct = {
          id: "prod_engine_" + Date.now(),
          name: basicInfo.name,
          sku: finalSku,
          price: priceNum,
          cost: costNum,
          stock: stockNum,
          category: basicInfo.category,
          description: basicInfo.shortDescription || basicInfo.subtitle,
          image: images[0]?.previewUrl || undefined,
          subtitle: basicInfo.subtitle,
          localCategory: basicInfo.localCategory,
          brand: basicInfo.brand,
          longDescription: basicInfo.longDescription,
          discountPrice: prices.discountPrice,
          discountStart: prices.discountStart,
          discountEnd: prices.discountEnd,
          barcode: stockInfo.barcode,
          gtin: stockInfo.gtin,
          mpn: stockInfo.mpn,
          warehouse: stockInfo.warehouse,
          alertLimit: stockInfo.alertLimit,
          requiresShipping: shipping.requiresShipping,
          weight: shipping.weight,
          weightUnit: shipping.weightUnit,
          length: shipping.length,
          width: shipping.width,
          height: shipping.height,
          isTaxable: taxes.isTaxable,
          taxType: taxes.taxType,
          taxRate: taxes.taxRate,
          seoTitle: seo.title,
          seoSlug: seo.slug,
          seoDescription: seo.description,
          seoKeywords: seo.keywords,
          publishSalla: approvalType === "publish" ? true : platforms.publishSalla,
          publishZid: approvalType === "publish" ? true : platforms.publishZid,
          publishShopify: platforms.publishShopify,
          publishWoo: platforms.publishWoo,
          publishNoon: platforms.publishNoon,
          publishAmazon: platforms.publishAmazon,
          platformSpecificFields: platforms.platformFields,
          marketingShortAd: marketing.shortAd,
          marketingAdDescription: marketing.adDescription,
          marketingHashtags: marketing.hashtags,
          marketingTargetAudience: marketing.targetAudience,
          marketingRecommendedChannels: marketing.recommendedChannels,
          variants,
          assets,
          timeline: [
            { id: "ev_basis_" + Date.now(), title: "تأسيس الصنف الأساسي", details: "توليد كرت الصنف بالذكاء وربطه بنظام سهم للوجستيات والمخازن.", user: activeUserLabel, time: timestampStr, iconType: "create" },
            ...updatedTimeline
          ],
          productStatus: targetStatus,
          backups: []
        };

        const updatedProducts = [savedProduct, ...products];
        setProducts(updatedProducts);
      }

      // 2. productService persistence call (using await)
      await productService.create(savedProduct);

      // 6. create timeline event in productTimelineService
      await productTimelineService.createEvent({
        event_id: "evt_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        product_id: savedProduct.id,
        store_id: localStorage.getItem("sahm_active_store_id") || "store_1",
        event_type: "standard",
        title: "تم اعتماد المنتج نهائياً",
        description: `تم اعتماد وقبول الصنف المطور "${savedProduct.name}" بنجاح في قاعدة مركز سهم للربط الروحي. القرار والترقير: ${approveDetails}`,
        created_by: activeUserLabel,
        created_at: new Date().toISOString()
      });

      // 7. create Audit Log with auditService
      await auditService.createAuditLog(
        "user approved product",
        `تم اعتماد منتج جديد "${savedProduct.name}" بنجاح. القرار: ${approveDetails}`,
        activeUserLabel,
        localStorage.getItem("sahm_active_store_id") || "store_1"
      );

      // Optional Audit log callback from parent if exists
      if (addAuditLog) {
        addAuditLog("user approved product", `تم اعتماد وموالاة منتج الكتالوج المطور "${savedProduct.name}" (SKU: ${savedProduct.sku}) بنجاح.`);
      }

      // 3. E-commerce platforms publishing check via integrationsService
      if (approvalType === "publish") {
        const storeId = localStorage.getItem("sahm_active_store_id") || "store_1";
        const connectedAll = await integrationsService.getConnectedIntegrations("company_maraseem_group", storeId);
        
        // E-commerce store or marketplace integrations
        const publishChannels = connectedAll.filter(item => 
          ["salla", "zid", "shopify", "woocommerce", "amazon", "noon"].includes(item.id) || 
          item.category === "متاجر" || 
          item.category === "أسواق"
        );

        if (publishChannels.length === 0) {
          if (triggerNotification) {
            triggerNotification("لا توجد قنوات نشر متصلة. تم اعتماد المنتج فقط.", "error");
          }
        } else {
          const namesStr = publishChannels.map(c => c.name).join("، ");
          const confirmSync = window.confirm(`توجد قنوات نشر متصلة نشطة (${namesStr}). هل ترغب في بدء نشر المنتج ومزامنته معها فورا؟`);
          if (confirmSync) {
            if (triggerNotification) {
              triggerNotification(`تم النشر الفوري ومزامنة كرت الصنف مع (${namesStr}) بنجاح! 🔄🚀`, "sync");
            }
          }
        }
      }

      // 8. Toast notification
      if (triggerNotification) {
        triggerNotification("تم اعتماد المنتج بنجاح", "success");
      }

      // Hide Modals/Dialogs
      setShowApproveConfirmModal(false);
      setStatus("done");
      onClose();

    } catch (error: any) {
      console.error("Error approving product:", error);
      // 9. If save/validation fails, keep the modal open and show clean error message
      setApproveError(error?.message || String(error));
      if (triggerNotification) {
        triggerNotification(`تعذر اعتماد المنتج، حاول مرة أخرى: ${error?.message || error}`, "error");
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleExportDetailsPDF = () => {
    const rawData = [
      { key: "الاسم", value: basicInfo.name },
      { key: "SKU", value: stockInfo.sku },
      { key: "سعر البيع", value: prices.price + " ر.س" },
      { key: "سعر التكلفة", value: prices.cost + " ر.س" },
      { key: "التصنيف والماركة", value: `${basicInfo.category} - ${basicInfo.brand}` },
      { key: "مخزون الرياض الفرعي", value: stockInfo.stock + " حبة" }
    ];
    exportToPDF("وثيقة مبيعات وتفاصيل حياة المنتج 📄", [
      { key: "key", label: "الحقل" },
      { key: "value", label: "البيان المسجل بقاعدة سهم" }
    ], rawData, `تم الإعداد السحابي للمنتج ${basicInfo.name} بواسطة ذكاء سهم.`);
    triggerNotification("تم استصدار وثيقة الصنف وتصديرها بصيغة PDF معتمدة 📄", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right font-sans overflow-y-auto">
      
      <div 
        className="w-full max-w-6xl rounded-3xl border shadow-2xl relative my-8"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* UPPER TITLE RIBBON PANEL */}
        <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl text-black shadow-lg shadow-amber-500/10">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/15 text-amber-500 font-black px-2 py-0.5 rounded-full uppercase border border-amber-500/25">
                  ERP AI Engine v9.4
                </span>
                <span className="text-[10px] bg-[#10B98120] text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  قواعد Supabase & Postgres نشطة
                </span>
              </div>
              <h1 className="text-base md:text-lg font-black text-white mt-1">
                محرك سهم الذكي لدورة حياة المنتجات والمبيعات 👑📦
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                تأمين براءات الاختراع، مطابقة بقع الأسعار، التغليف، حساب الربحية والمحتوى التسويقي من صورة واحدة أو مسودة مبدئية.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-500/15 text-rose-500 cursor-pointer self-start sm:self-auto border-none transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS STEP BAR */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] md:text-xs p-4 bg-slate-900/40 border-b border-slate-800 select-none">
          {[
            { id: "idle", label: "مستكشف المستندات والصور" },
            { id: "analyzing", label: "معايرة وموازنة AI" },
            { id: "review", label: "طاولات المراجعة المتقاطعة (9 تبويبات)" },
            { id: "done", label: "اكتمال الدورة ومذكرة النشر" }
          ].map((step, idx) => {
            const isCurrent = status === step.id;
            const isPassed = 
              (status === "analyzing" && idx < 1) ||
              (status === "review" && idx < 2) ||
              (status === "done" && idx < 3);
            return (
              <div 
                key={step.id}
                className={`py-2 rounded-xl font-black border transition-all ${
                  isCurrent 
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10" 
                    : isPassed 
                      ? "text-amber-400 border-amber-500/30 bg-amber-500/5"
                      : "text-gray-500 border-slate-800/80 bg-black/10"
                }`}
              >
                <span>{idx + 1}. {step.label}</span>
              </div>
            );
          })}
        </div>

        {/* MAIN BODY WORKSPACE */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          
          {/* STATE: IDLE (UPLOAD STARTER PANEL) */}
          {status === "idle" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/25 text-amber-400 text-xs text-right leading-relaxed font-semibold">
                💡 يمكنك البدء مباشرة برفع صور منتجاتك من الأستوديو أو إدخال روابط لمنتجات سابقة بقناة سلة أو شوبيفاي، وسيتولى معالج دورة الحياة المالي للـ AI تنظيمها ورصفها عبر ٤٨ حقلاً للنشاط والتخزين والمبيعات فورياً.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Visual Image Drag Zone */}
                <div className="p-8 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all bg-slate-900/30 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-950/60 border border-slate-800 flex items-center justify-center shadow">
                    <Camera className="w-7 h-7 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-200">الرفع المتعدد لصور وبوسترات المنتج</h3>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      ارفع لقطة وحيدة أو باقة صور للتعبئة ومزامنتها بمركز الأصول وتوليد الخصائص البصرية.
                    </p>
                  </div>

                  {images.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {images.map((img, i) => (
                          <img 
                            key={i}
                            src={img.previewUrl} 
                            alt="مركبة" 
                            className="w-16 h-16 object-cover rounded-xl border border-slate-700 shadow" 
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <button 
                          onClick={() => setImages([])}
                          className="py-1 px-2.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-[9px] rounded-lg cursor-pointer"
                        >
                          تصفير الملفات
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold text-[9px] rounded-lg cursor-pointer"
                        >
                          أضف لقطات إضافية
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full justify-center items-center">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2.5 px-6 bg-[#0B1528] hover:bg-[#0F223D] border border-[#1E3A8A] text-gray-200 font-black text-xs rounded-xl cursor-pointer transition-all hover:scale-102 flex items-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        <span>اختيار باقة الصور</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowMediaModal(true)}
                        className="py-2.5 px-4 bg-slate-950/40 hover:bg-slate-900 border border-slate-800 text-amber-500 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>اختيار من مكتبة الوسائط 🖼️</span>
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handlePrimaryUpload} 
                  />
                </div>

                {/* Alternative sources Inputs */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/20 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-3 text-right">
                    <h4 className="text-xs font-black text-white">🔗 استيراد بديل من رابط منتج أو فيديو:</h4>
                    
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">رابط المنتج (سلة/زد/شوبيفاي):</label>
                      <input 
                        type="url"
                        placeholder="https://salla.sa/mithaq-store/p-984..."
                        value={productExternalLink}
                        onChange={(e) => setProductExternalLink(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950/90 text-left font-mono outline-none text-white focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">رابط فيديو الصنف (تيك توك/يوتيوب):</label>
                      <input 
                        type="url"
                        placeholder="https://tiktok.com/@mithaq/video/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-left font-mono outline-none text-white focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-4 flex gap-2 justify-end">
                    <button
                      onClick={executeAIAnalysis}
                      className="py-2.5 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>بدء ميكانيكية وتعبئة الحقول ➔</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {showMediaModal && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] text-right backdrop-blur-sm">
              <div className="p-6 rounded-2xl border w-full max-w-2xl space-y-4 relative"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-900 border text-gray-400 border-slate-700 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-sm font-black text-white" style={{ color: theme.text }}>مكتبة الوسائط - اختر ملفاً أو صورة لمنتجك 🖼️</h3>
                <p className="text-[10px] text-gray-400">اختر أحد الأصول والملفات المستضافة لتضمينها في صور المنتج فورياً.</p>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم الملف..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full text-xs py-2 pr-9 pl-3 rounded-xl border outline-none font-bold placeholder-gray-500 text-right"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                  />
                  <Search className="absolute top-2.5 right-3 w-4 h-4 text-gray-500" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {mediaFiles
                    .filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                    .map((file) => {
                      const isImg = file.type === "image" || file.type === "qr" || file.type === "logo";
                      const isSelected = images.some(img => img.previewUrl === file.url);
                      return (
                        <div
                          key={file.id}
                          onClick={() => {
                            setImages([...images, { base64: "", mimeType: "image/jpeg", previewUrl: file.url }]);
                            setShowMediaModal(false);
                          }}
                          className={`p-2 rounded-xl border cursor-pointer hover:border-amber-500/50 transition-all space-y-2 relative flex flex-col justify-between ${isSelected ? 'border-amber-500 bg-amber-500/5' : 'bg-slate-900/60 border-slate-800'}`}
                        >
                          <div className="h-20 rounded-lg overflow-hidden bg-black flex items-center justify-center relative">
                            {isImg ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] font-mono text-rose-500 uppercase">PDF</span>
                            )}
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-amber-500 text-black rounded-full p-0.5 shadow">
                                <Check className="w-3 h-3 stroke-[3px]" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-bold truncate block text-gray-300 text-center px-1">
                            {file.name}
                          </span>
                        </div>
                      );
                    })}
                  {mediaFiles.filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase())).length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-500 text-xs">
                      لا توجد ملفات تطابق البحث.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STATE: ANALYZING SENSE */}
          {status === "analyzing" && (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin"></div>
                <div className="absolute top-5 right-5 font-black text-xs text-amber-500 animate-pulse">AI</div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">برمجيات سهم تفلتر مخرجات صورة المنتج...</h3>
                <p className="text-xs text-amber-500 animate-pulse font-mono font-bold">{loadingMsg}</p>
              </div>
            </div>
          )}

          {/* STATE: REVIEW ENGINE WITH TAB CONTROLS */}
          {status === "review" && (
            <div className="space-y-6">
              
              {/* COMPLETENESS & HEALTH TRACKER */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 shadow-lg">
                
                {/* Score meters */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Completeness Score */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-gray-300">
                      <span>اكتمال حقول المنتج بالـ AI:</span>
                      <span className="font-mono text-amber-400 font-black">{completeness.val}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500" style={{ width: `${completeness.val}%` }}></div>
                    </div>
                    {completeness.missing.length > 0 ? (
                      <p className="text-[9px] text-gray-500 leading-normal truncate">
                        ⚠️ النواقص: {completeness.missing.join(" • ")}
                      </p>
                    ) : (
                      <p className="text-[9px] text-emerald-400 font-bold">✓ كافة الحقول الأساسية والنخبوية مستوفية بالكامل.</p>
                    )}
                  </div>

                  {/* Health Score */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-gray-300 animate-pulse">
                      <span>مؤشر صحة المنتج وجاذبيته (Health Score):</span>
                      <span className="font-mono text-emerald-400 font-black">{healthScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${healthScore}%` }}></div>
                    </div>
                    <span className="text-[9px] block text-gray-500">
                      يعتمد على: نقاء الاسماء، التكلفة، دقة الباركود، صور الأصول وحجم الهوامش الربحية.
                    </span>
                  </div>

                </div>

                {/* Status selector */}
                <div className="md:col-span-4 p-3 rounded-xl bg-black/30 border border-slate-800 space-y-1.5 text-right font-sans">
                  <label className="block text-[10px] text-amber-500 font-bold">وضع دورة حياة المنتج الحالية:</label>
                  <select
                    value={productStatus}
                    onChange={(e) => setProductStatus(e.target.value as any)}
                    className="w-full text-xs font-black rounded-lg py-1.5 px-2.5 border border-slate-800 bg-slate-950 text-white outline-none focus:border-amber-500 appearance-none text-right"
                  >
                    <option value="draft">📁 مسودة مؤقتة (Draft)</option>
                    <option value="review_needed">⚠️ معلق للتصنيف والمراجعة (Review needed)</option>
                    <option value="ready_to_publish">🟢 جاهز للاعتماد والنشر (Ready)</option>
                    <option value="published">🚀 منشور ومزامن بقنوات الكاشير (Published)</option>
                    <option value="archived">🗄️ مؤرشف ومجمد من العرض (Archived)</option>
                  </select>
                </div>

              </div>

              {/* TABS SELECTOR SPLITTING (11 TABS BAR) */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none select-none">
                {[
                  { id: "basic", label: "📝 الأساسيات", desc: "وصف واسم الماركة" },
                  { id: "prices", label: "💰 السعر والربح", desc: "سعر وتكلفة اللائحة" },
                  { id: "inventory", label: "📦 المخزون والأكواد", desc: "رمز ومكان التخزين" },
                  { id: "shipping", label: "🚚 الشحن والمقاييس", desc: "أوزان وأبعاد الباقة" },
                  { id: "taxes", label: "⚖️ الضريبة والقيمة", desc: "مخضع ضريبي ونسب" },
                  { id: "seo", label: "🔍 SEO وبايو البحث", desc: "روابط وميتا الرصد" },
                  { id: "platforms", label: "🌐 القنوات والمنافذ", desc: "ربط سلة وزد ونون" },
                  { id: "marketing", label: "📣 الذكاء الإعلاني", desc: "برودكاست وحملات مبيعات" },
                  { id: "media", label: "🖼️ مركز الأصول ({x})", desc: "مستندات وصور المورد", count: assets.length },
                  { id: "campaigns", label: "📣 حملات الإشهار", desc: "أرشفة وبنك الحملات" },
                  { id: "competitors", label: "🎯 المنافسون المرتبطون", desc: "رصد ومقارنة أسعار المنافسين" }
                ].map(t => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex flex-col text-right p-2.5 px-4 rounded-xl border cursor-pointer whitespace-nowrap transition-all ${
                        isActive 
                          ? "bg-amber-500 text-black border-amber-500 shadow" 
                          : "bg-slate-900/40 text-gray-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-black">{t.label.replace("{x}", String(t.count || 0))}</span>
                      <span className={`text-[8px] block mt-0.5 ${isActive ? "text-slate-950" : "text-gray-500"}`}>{t.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left side Form Area (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* TAB 1: BASIC INFO */}
                  {activeTab === "basic" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <h4 className="text-xs font-black text-amber-500">📝 معلومات وصفية وهوية الصنف البدنية:</h4>
                      
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• المسمى التجاري الرئيسي للمنتج:</label>
                          <input 
                            type="text"
                            value={basicInfo.name}
                            onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                            className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none focus:border-amber-500"
                            placeholder="تمر خلاص ملكي زجاجة فاخرة..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• العنوان الإعلاني الفرعي (Subtitle):</label>
                          <input 
                            type="text"
                            value={basicInfo.subtitle}
                            onChange={(e) => setBasicInfo({ ...basicInfo, subtitle: e.target.value })}
                            className="w-full text-xs rounded-lg py-2 px-3 border border-slate-705 bg-black text-white outline-none focus:border-amber-500"
                            placeholder="سيد المائدة وحليف القهوة العربية الفخمة..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">• التصنيف السحابي:</label>
                            <select 
                              value={basicInfo.category}
                              onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                              className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none text-right"
                            >
                              {["عطور ودخون", "غذائية", "مشروبات", "كماليات وهدايا", "أزياء وملبوسات", "حلويات وهدايا"].map(catName => (
                                <option key={catName} value={catName}>{catName}</option>
                              ))}
                              {(() => {
                                try {
                                  const saved = localStorage.getItem("sahm_web_custom_categories");
                                  const customCats = saved ? JSON.parse(saved) : [];
                                  return customCats.filter((c: any) => c.isActive).map((c: any) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                  ));
                                } catch {
                                  return null;
                                }
                              })()}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">• التصنيف المحلي بالأرفف:</label>
                            <input 
                              type="text"
                              value={basicInfo.localCategory}
                              onChange={(e) => setBasicInfo({ ...basicInfo, localCategory: e.target.value })}
                              className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">• اسم الماركة والبراند:</label>
                            <input 
                              type="text"
                              value={basicInfo.brand}
                              onChange={(e) => setBasicInfo({ ...basicInfo, brand: e.target.value })}
                              className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• وصف توجيهي مختصر:</label>
                          <input 
                            type="text"
                            value={basicInfo.shortDescription}
                            onChange={(e) => setBasicInfo({ ...basicInfo, shortDescription: e.target.value })}
                            className="w-full text-xs rounded-lg py-2 px-3 border border-slate-700 bg-black text-white outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• سيناريو ووصف طويل للمتجر:</label>
                          <textarea 
                            value={basicInfo.longDescription}
                            onChange={(e) => setBasicInfo({ ...basicInfo, longDescription: e.target.value })}
                            rows={4}
                            className="w-full text-xs rounded-lg p-3 border border-slate-700 bg-black text-white outline-none focus:border-amber-500"
                            placeholder="اكتب التكوين والمميزات وكيفية الاستعمال هنا..."
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: PRICES & DISCOUNTS */}
                  {activeTab === "prices" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <h4 className="text-xs font-black text-amber-500">💰 تسعير صفقات الصنف وهوامش الأرباح:</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• سعر البيع الأساسي (ر.س):</label>
                          <input 
                            type="number"
                            value={prices.price}
                            onChange={(e) => setPrices({ ...prices, price: e.target.value })}
                            className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none text-center font-mono focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• سعر شراء التكلفة (ر.س):</label>
                          <input 
                            type="number"
                            value={prices.cost}
                            onChange={(e) => setPrices({ ...prices, cost: e.target.value })}
                            className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none text-center font-mono focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex justify-between items-center text-xs">
                        <span className="font-extrabold text-amber-400">هامش الربح الإجمالي الصافي:</span>
                        <div className="text-left">
                          <span className="font-mono text-white font-black">
                            {(parseFloat(prices.price) - parseFloat(prices.cost) || 0).toLocaleString()} ر.س
                          </span>
                          <span className="text-[10px] text-gray-400 mr-2">
                            ({prices.price && prices.cost ? Math.round(((parseFloat(prices.price) - parseFloat(prices.cost)) / parseFloat(prices.price)) * 100) : 0}%)
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-800 bg-black/40 space-y-3">
                        <span className="text-[10px] text-[#D4AF37] font-bold block">🏷️ جدول الخصومات ومواسم العروض:</span>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">سعر الخصم المقترح:</label>
                            <input 
                              type="number"
                              value={prices.discountPrice}
                              onChange={(e) => setPrices({ ...prices, discountPrice: e.target.value })}
                              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-800 bg-black text-white outline-none font-mono text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">بداية الخصم:</label>
                            <input 
                              type="date"
                              value={prices.discountStart}
                              onChange={(e) => setPrices({ ...prices, discountStart: e.target.value })}
                              className="w-full text-xs py-2 px-2 rounded-lg border border-slate-800 bg-black text-white outline-none text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">نهاية الخصم الكلي:</label>
                            <input 
                              type="date"
                              value={prices.discountEnd}
                              onChange={(e) => setPrices({ ...prices, discountEnd: e.target.value })}
                              className="w-full text-xs py-2 px-2 rounded-lg border border-slate-800 bg-black text-white outline-none text-center"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: INVENTORY & CODES */}
                  {activeTab === "inventory" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <h4 className="text-xs font-black text-amber-500">📦 ترميز المخازن وتوزيع مستويات الأمان:</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-right">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• رمز SKU (الترميز):</label>
                          <input 
                            type="text"
                            value={stockInfo.sku}
                            onChange={(e) => setStockInfo({ ...stockInfo, sku: e.target.value })}
                            className="w-full text-xs font-mono font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• الباركود المباشر Barcode:</label>
                          <input 
                            type="text"
                            value={stockInfo.barcode}
                            onChange={(e) => setStockInfo({ ...stockInfo, barcode: e.target.value })}
                            className="w-full text-xs font-mono rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• الرمز العالمي للسلع GTIN:</label>
                          <input 
                            type="text"
                            value={stockInfo.gtin}
                            onChange={(e) => setStockInfo({ ...stockInfo, gtin: e.target.value })}
                            className="w-full text-xs font-mono rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white text-center outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-right pt-2">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• الكمية المتوفرة بالمستودع:</label>
                          <input 
                            type="number"
                            value={stockInfo.stock}
                            onChange={(e) => setStockInfo({ ...stockInfo, stock: e.target.value })}
                            className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white text-center font-mono focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• فرع أو مستودع الحفظ:</label>
                          <input 
                            type="text"
                            value={stockInfo.warehouse}
                            onChange={(e) => setStockInfo({ ...stockInfo, warehouse: e.target.value })}
                            className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">• حد التنبيه عند الانخفاض:</label>
                          <input 
                            type="number"
                            value={stockInfo.alertLimit}
                            onChange={(e) => setStockInfo({ ...stockInfo, alertLimit: e.target.value })}
                            className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white text-center font-mono focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* DETAILED VARIANTS (خيارات وأحجام السلعة الدقيقة) */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-black/40 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-black text-[#D4AF37]">⚙️ خيارات ومقاسات المنتج المتقدمة (Variants):</span>
                          <span className="text-[10px] text-gray-500">يدعم تسعير، وSKU ومقادير تخزين مستقلة لـ سلة وزد</span>
                        </div>

                        {/* List current Variants */}
                        <div className="space-y-2">
                          {variants.map(v => (
                            <div key={v.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span className="bg-slate-900 border border-slate-800 font-bold px-2.5 py-1 rounded text-[10px] text-[#D4AF37]">
                                  {v.optionType}: {v.optionValue}
                                </span>
                                <span className="text-gray-400 font-mono text-[10px]">{v.sku}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-400 font-mono font-bold text-[10.5px]">{v.price} ر.س</span>
                                <span className="text-gray-500 font-mono font-medium">({v.stock} حبة)</span>
                                <button 
                                  onClick={() => deleteVariantInline(v.id, v.optionValue)}
                                  className="text-[10px] text-rose-500 hover:text-rose-400 cursor-pointer hover:underline border-none bg-transparent"
                                >
                                  إزالة الخيار
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quick Variant Creator form with nice inputs */}
                        <div className="p-3 rounded-lg border border-dashed border-slate-800 bg-[#0F172A]/40 space-y-3">
                          <span className="text-[10px] text-gray-300 font-black block">✦ إضافة نمط خيار وتمايز جديد:</span>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <input 
                              type="text" 
                              placeholder="النمط (مثال: الحجم، اللون)" 
                              value={newVarType}
                              onChange={(e) => setNewVarType(e.target.value)}
                              className="p-1.5 rounded border border-slate-800 bg-black text-white text-right"
                            />
                            <input 
                              type="text" 
                              placeholder="القيمة (مثال: أحمر، لتر)" 
                              value={newVarValue}
                              onChange={(e) => setNewVarValue(e.target.value)}
                              className="p-1.5 rounded border border-slate-800 bg-black text-white text-right"
                            />
                            <input 
                              type="number" 
                              placeholder="السعر الخاص (ر.س)" 
                              value={newVarPrice}
                              onChange={(e) => setNewVarPrice(e.target.value)}
                              className="p-1.5 rounded border border-slate-800 bg-black text-white text-center"
                            />
                            <input 
                              type="number" 
                              placeholder="الكمية بالخيار" 
                              value={newVarStock}
                              onChange={(e) => setNewVarStock(e.target.value)}
                              className="p-1.5 rounded border border-slate-800 bg-black text-white text-center"
                            />
                          </div>

                          <div className="text-left">
                            <button
                              onClick={addNewVariantInline}
                              className="py-1 px-4 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] rounded cursor-pointer transition-all active:scale-[0.98]"
                            >
                              إدراج خيار جديد +
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 4: SHIPPING & DIMENSIONS */}
                  {activeTab === "shipping" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4 text-right">
                      <h4 className="text-xs font-black text-amber-500">🚚 حقول الشحن، والتوصيل وخصائص الطرد:</h4>
                      
                      <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Truck className="w-4 h-4 text-[#D4AF37]" />
                          <span>المنتج يتطلب شحن فعلي وتوصيل لباب العميل:</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={shipping.requiresShipping}
                          onChange={(e) => setShipping({ ...shipping, requiresShipping: e.target.checked })}
                          className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                        />
                      </div>

                      {shipping.requiresShipping && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-400 mb-1">الوزن التقريبي للطرد:</label>
                              <input 
                                type="text"
                                value={shipping.weight}
                                onChange={(e) => setShipping({ ...shipping, weight: e.target.value })}
                                className="w-full text-xs font-mono rounded-lg py-2.5 px-3 border border-slate-700 bg-black text-white text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 mb-1">وحدة قياس الوزن:</label>
                              <select
                                value={shipping.weightUnit}
                                onChange={(e) => setShipping({ ...shipping, weightUnit: e.target.value })}
                                className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-black text-white font-bold select-none text-right"
                              >
                                <option value="kg">كيلوجرام (kg)</option>
                                <option value="g">جرام فوري (g)</option>
                              </select>
                            </div>
                          </div>

                          <span className="text-[10px] text-amber-500 font-bold block pb-1 border-b border-slate-800">• أشكال وأبعاد العلب الصديقة للشحن البري (سم):</span>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[9px] text-gray-400 mb-1">الطول (Length):</label>
                              <input 
                                type="number"
                                value={shipping.length}
                                onChange={(e) => setShipping({ ...shipping, length: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-black text-white text-center font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-400 mb-1">العرض (Width):</label>
                              <input 
                                type="number"
                                value={shipping.width}
                                onChange={(e) => setShipping({ ...shipping, width: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-black text-white text-center font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-400 mb-1">الارتفاع (Height):</label>
                              <input 
                                type="number"
                                value={shipping.height}
                                onChange={(e) => setShipping({ ...shipping, height: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-black text-white text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 5: TAX MATRIX */}
                  {activeTab === "taxes" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <h4 className="text-xs font-black text-amber-500">⚖️ لوحة تنظيم الضريبة والفواتير:</h4>
                      
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <span className="text-xs text-gray-300">هل يخضع صنف البضاعة للضرائب السعودية الحالية؟</span>
                        <input 
                          type="checkbox"
                          checked={taxes.isTaxable}
                          onChange={(e) => setTaxes({ ...taxes, isTaxable: e.target.checked })}
                          className="w-4.5 h-4.5 text-amber-500 focus:ring-amber-500 rounded cursor-pointer"
                        />
                      </div>

                      {taxes.isTaxable && (
                        <div className="grid grid-cols-2 gap-4 font-sans text-right animate-scale-up">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">نوع وتصنيف المعاملة الضريبية:</label>
                            <input 
                              type="text"
                              value={taxes.taxType}
                              onChange={(e) => setTaxes({ ...taxes, taxType: e.target.value })}
                              className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-black text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">نسبة ضريبة المبيعات المقررة (%):</label>
                            <input 
                              type="number"
                              value={taxes.taxRate}
                              onChange={(e) => setTaxes({ ...taxes, taxRate: e.target.value })}
                              className="w-full text-xs font-bold rounded-lg py-2.5 px-3 border border-slate-705 bg-black text-amber-400 text-center font-mono"
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 6: SEO SETTINGS */}
                  {activeTab === "seo" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <h4 className="text-xs font-black text-amber-500">🔍 تهيئة محركات البحث وقواطع أوسمة قوقل سيرش (SEO):</h4>
                        <button
                          onClick={handleAIOptimizeSEO}
                          className="py-1 px-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-black font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                          تحسين ومواءمة SEO بالـ AI ✨
                        </button>
                      </div>

                      <div className="space-y-3 text-right">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">عنوان الصفحة المقروء بقوقل (Meta Title):</label>
                          <input 
                            type="text"
                            value={seo.title}
                            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                            className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-black text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">الرابط المخصص القصير (URL Slug):</label>
                          <input 
                            type="text"
                            value={seo.slug}
                            onChange={(e) => setSeo({ ...seo, slug: e.target.value })}
                            className="w-full text-xs font-mono text-left rounded-lg py-2.5 px-3 border border-slate-705 bg-black text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">وصف الميتا الشامل لمحركات البحث (Meta Description):</label>
                          <textarea 
                            value={seo.description}
                            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                            rows={3}
                            className="w-full text-xs leading-relaxed rounded-lg p-3 border border-slate-705 bg-black text-white text-right outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">الكلمات المفتاحية والهاشتاجات الفهرسية:</label>
                          <input 
                            type="text"
                            value={seo.keywords}
                            onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                            className="w-full text-xs font-mono text-amber-400 rounded-lg py-2.5 px-3 border border-slate-705 bg-black"
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 7: STORE CHANNELS CLOUD ROUTING */}
                  {activeTab === "platforms" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <h4 className="text-xs font-black text-amber-500">🌐 النشر المتقاطع وقنوات ومتاجر المبيعات المتصلة:</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        
                        {[
                          { id: "publishSalla", label: "سلة Salla 🛒", checked: platforms.publishSalla },
                          { id: "publishZid", label: "زد Zid 📦", checked: platforms.publishZid },
                          { id: "publishShopify", label: "شوبيفاي Shopify 🌐", checked: platforms.publishShopify },
                          { id: "publishWoo", label: "ووكومرس WooCommerce ⚙️", checked: platforms.publishWoo },
                          { id: "publishNoon", label: "نون Noon 🏷️", checked: platforms.publishNoon },
                          { id: "publishAmazon", label: "أمازون Amazon 📦", checked: platforms.publishAmazon }
                        ].map(plat => (
                          <div 
                            key={plat.id}
                            className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-gray-300">{plat.label}</span>
                            <input 
                              type="checkbox"
                              checked={plat.checked}
                              onChange={(e) => setPlatforms({ ...platforms, [plat.id]: e.target.checked })}
                              className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 rounded clickable"
                            />
                          </div>
                        ))}

                      </div>

                      <div className="p-4 rounded-xl border border-slate-800/80 bg-black/40 space-y-3 text-right">
                        <span className="text-[10px] font-black text-amber-400 block">• حقول الربط المخصصة بالمنصات (Platform Specific Fields):</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">الرقم الضريبي لسلة:</label>
                            <input 
                              type="text"
                              value={platforms.platformFields.sallaTaxNumber}
                              onChange={(e) => setPlatforms({ ...platforms, platformFields: { ...platforms.platformFields, sallaTaxNumber: e.target.value }})}
                              className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">مجموعة شوبيفاي المخصصة:</label>
                            <input 
                              type="text"
                              value={platforms.platformFields.shopifyCollection}
                              onChange={(e) => setPlatforms({ ...platforms, platformFields: { ...platforms.platformFields, shopifyCollection: e.target.value }})}
                              className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">رمز ASIN في مستودع أمازون:</label>
                            <input 
                              type="text"
                              value={platforms.platformFields.amazonAsin}
                              onChange={(e) => setPlatforms({ ...platforms, platformFields: { ...platforms.platformFields, amazonAsin: e.target.value }})}
                              className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 8: ADVERTISING & MARKETING BRAIN */}
                  {activeTab === "marketing" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4 text-right">
                      
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-black text-amber-500 animate-bounce">📣 محاكي وتأسيس الحملة الإعلانية والنصوص المكتوبة:</h4>
                        
                        <button
                          onClick={handleAICreateCampaign}
                          className="py-1 px-3 bg-[#D4AF37] hover:bg-amber-600 text-black font-extrabold text-[10px] rounded transition-all cursor-pointer"
                        >
                          توليد وصياغة محتوى التسويق الـ AI ✨
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-[#D4AF37] font-bold mb-1">إرسالية برودكاست واتساب وتغريدة تويتر (المقترحة):</label>
                          <div className="relative">
                            <textarea 
                              value={marketing.shortAd}
                              onChange={(e) => setMarketing({ ...marketing, shortAd: e.target.value })}
                              rows={2}
                              className="w-full text-xs rounded-lg p-3 pr-4 border border-slate-800 bg-slate-950 text-white focus:border-amber-500"
                            />
                            <button
                              onClick={() => handleCopyText(marketing.shortAd, "shortAd")}
                              className="absolute top-2.5 left-2.5 p-1.5 bg-slate-900 rounded border border-slate-800 text-gray-400 hover:text-amber-500"
                            >
                              {copiedField === "shortAd" ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">وصف الصفحة والجمهور المستهدف بالتفصيل:</label>
                          <textarea 
                            value={marketing.adDescription}
                            onChange={(e) => setMarketing({ ...marketing, adDescription: e.target.value })}
                            rows={3}
                            className="w-full text-xs rounded-lg p-3 border border-slate-800 bg-slate-950 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">الجمهور والعملاء المستهدفين:</label>
                            <input 
                              type="text"
                              value={marketing.targetAudience}
                              onChange={(e) => setMarketing({ ...marketing, targetAudience: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">قنوات التسويق الموصى بالنشر عليها:</label>
                            <input 
                              type="text"
                              value={marketing.recommendedChannels}
                              onChange={(e) => setMarketing({ ...marketing, recommendedChannels: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-white"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 9: ASSETS AND DOCUMENTS REGISTER */}
                  {activeTab === "media" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <h4 className="text-xs font-black text-amber-500">🖼️ مركز الأصول والوثائق الموثقة (Assets System):</h4>
                        
                        <button
                          onClick={() => mediaCenterInputRef.current?.click()}
                          className="py-1 px-3 bg-slate-950 hover:bg-slate-900 text-gray-300 font-bold text-[10.5px] rounded border border-slate-700 hover:border-amber-500 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>رفع سند / صورة / ملف PDF</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {assets.map(asset => {
                          const isImg = asset.mimeType.startsWith("image/");
                          return (
                            <div 
                              key={asset.id}
                              className={`p-3 rounded-xl border flex items-center justify-between font-sans ${
                                asset.isPrimary 
                                  ? "bg-slate-900/95 border-amber-500/80" 
                                  : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                  {isImg ? (
                                    <img src={asset.url} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[9.5px] font-black text-rose-500">DOC</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <h5 className="text-[10.5px] font-black text-white truncate max-w-[150px]">{asset.name}</h5>
                                  <span className="text-[9px] text-[#D4AF37] font-bold block mt-0.5">{asset.size} • {asset.mimeType.split("/")[1]}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isImg && !asset.isPrimary && (
                                  <button
                                    onClick={() => setPrimaryImg(asset.id)}
                                    className="py-0.5 px-1.5 bg-black hover:bg-slate-850 rounded text-[9.5px] text-amber-500 font-bold border-none"
                                  >
                                    تثبيت رئيسية
                                  </button>
                                )}
                                {asset.isPrimary && (
                                  <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.25 rounded shrink-0">
                                    الواجهة
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteAsset(asset.id, asset.name)}
                                  className="p-1 text-rose-500 hover:text-rose-400 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {assets.length === 0 && (
                          <div className="col-span-full py-12 text-center text-xs text-gray-500 border border-dashed border-slate-800 rounded-xl leading-relaxed">
                            لم تلحق أي ملفات أو فواتير توريد بالصنف الحالي. يمكنك رفع بوليصة المورد للتأمين.
                          </div>
                        )}
                      </div>

                      <input 
                        type="file"
                        ref={mediaCenterInputRef}
                        onChange={handleAssetMediaUpload}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* TAB 10: ASSOCIATED PRODUCT CAMPAIGNS */}
                  {activeTab === "campaigns" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <div>
                          <h4 className="text-xs font-black text-amber-500">📣 الأرشيف التاريخي للحملات الإعلانية المرتبطة:</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">الحملات الترويجية والمنصات التي تم تفعيلها وتسويقها لهذا المنتج</p>
                        </div>
                        <button
                          onClick={() => {
                            // Close product builder modal and dispatch custom event to trigger direct campaign creation
                            if (activeProduct) {
                              if (typeof (window as any).sahm_close_product_modal === "function") {
                                (window as any).sahm_close_product_modal();
                              }
                              const promoteEvent = new CustomEvent("sahm_promote_product", { detail: activeProduct });
                              window.dispatchEvent(promoteEvent);
                            }
                          }}
                          className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10.5px] rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>إطلاق حملة جديدة 📣</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(() => {
                          const linkedCamps = loadedCamps;

                          if (linkedCamps.length === 0) {
                            return (
                              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-slate-800 rounded-xl leading-relaxed">
                                <span className="text-2xl block mb-2">📣</span>
                                لا توجد حملات ترويجية مسجلة لهذا المنتج بعد. 
                                <br />
                                انقر على زر "إطلاق حملة جديدة" لتجربة الترويج الذكي متعدد القنوات.
                              </div>
                            );
                          }

                          return linkedCamps.map((camp: any) => (
                            <div 
                              key={camp.campaign_id}
                              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-right space-y-3.5"
                            >
                              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                                <div>
                                  <h5 className="text-[11px] font-black text-white leading-normal">{camp.campaign_name}</h5>
                                  <span className="text-[8.5px] text-gray-500 font-mono block mt-0.5">المعرف الفرعي: {camp.campaign_id} • {camp.date}</span>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                  camp.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                                }`}>
                                  {camp.status === 'active' ? "نشطة ومراقبة" : "مكتملة"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-right">
                                <div className="p-2 rounded bg-black/30 border border-slate-900 col-span-2 sm:col-span-1">
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5">القنوات والمنصات 🌐</span>
                                  <span className="text-[10px] font-bold text-gray-300 block truncate">{camp.platforms ? camp.platforms.join(" ، ") : (camp.selected_channels ? camp.selected_channels.join(" ، ") : "عام")}</span>
                                </div>
                                <div className="p-2 rounded bg-black/30 border border-slate-900">
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5">السعر/ميزانية الحملة 💰</span>
                                  <span className="text-[10px] font-bold text-indigo-400 font-mono block">{camp.campaign_price || 250} ر.س</span>
                                </div>
                                <div className="p-2 rounded bg-black/30 border border-slate-900">
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5 font-mono">النقرات (Clicks) 📈</span>
                                  <span className="text-[10px] font-bold text-amber-500 font-mono block">{camp.clicks || 0} نقرة</span>
                                </div>
                                <div className="p-2 rounded bg-black/30 border border-slate-900">
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5 font-mono">الطلبات والمبيعات 🛍️</span>
                                  <span className="text-[10px] font-bold text-emerald-400 font-mono block">{camp.orders || 0} طلب</span>
                                </div>
                                <div className="p-2 rounded bg-black/30 border border-slate-900">
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5 font-mono">مؤشر الأداء AI 🏆</span>
                                  <span className="text-[10px] font-black text-blue-400 block">{camp.performance || "ممتاز 🚀"}</span>
                                </div>
                              </div>

                              {camp.adText && (
                                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60">
                                  <span className="block text-[8px] text-gray-500 font-bold mb-1">• كابشن النشر المعتمد:</span>
                                  <p className="text-[10px] text-gray-300 leading-normal font-sans line-clamp-3">{camp.adText}</p>
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {activeTab === "competitors" && (
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4 text-right font-sans">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <div>
                          <h4 className="text-xs font-black text-amber-500">🎯 روابط وأسعار المنافسين المرتبطين بهذا المنتج:</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">مقارنة الأسعار الفورية، فروقات الهوامش، وحالة توفر السلعة بصفحات المنافسين</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(() => {
                          const linkedComps = loadedComps;

                          if (linkedComps.length === 0) {
                            return (
                              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-slate-800 rounded-xl leading-relaxed">
                                <span className="text-2xl block mb-2">🎯</span>
                                لا يوجد منافسون مرتبطون بهذا المنتج حالياً.
                                <br />
                                <span className="text-[10px] text-gray-500 block mt-1">
                                  اربط المنافسين بهذا المنتج من واجهة "مراقبة المنافسين" بالربط الذكي أو أضف رابط المنافس المباشر لتسجيله.
                                </span>
                              </div>
                            );
                          }

                          return linkedComps.map((comp: any) => {
                            const ourPrice = parseFloat(prices.price) || 0;
                            const compPrice = parseFloat(comp.currentPrice || comp.current_price) || 0;
                            const priceDiff = ourPrice - compPrice;
                            const isWeAreDearer = priceDiff > 0;
                            const isWeAreCheaper = priceDiff < 0;

                            return (
                              <div 
                                key={comp.id || comp.competitor_product_id}
                                className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 text-right space-y-3.5"
                              >
                                <div className="flex justify-between items-start pb-2 border-b border-slate-900/60">
                                  <div>
                                    <h5 className="text-[11px] font-black text-white leading-normal">{comp.competitor_product_name || comp.product_name || comp.customProductName || "دهن عود منافس"}</h5>
                                    <span className="text-[8.5px] text-gray-500 font-mono block mt-0.5">
                                      المتجر: <b className="text-[#D4AF37]">{comp.competitor_name || comp.competitorName}</b> • آخر رصد: {comp.lastUpdated || comp.last_checked_at || "الآن حياً"}
                                    </span>
                                  </div>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                    comp.availability === 'متوفر' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                  }`}>
                                    {comp.availability === 'متوفر' ? "✅ متوفر لديه" : "🚫 نفذت الكمية"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-right">
                                  <div className="p-2 rounded bg-black/40 border border-slate-900">
                                    <span className="block text-[8px] text-gray-500 font-bold mb-0.5">سعرك الحالي</span>
                                    <span className="text-[10px] font-black text-indigo-400 font-mono block">{ourPrice} ر.س</span>
                                  </div>
                                  <div className="p-2 rounded bg-black/40 border border-slate-900">
                                    <span className="block text-[8px] text-gray-500 font-bold mb-0.5">سعر المنافس</span>
                                    <span className="text-[10px] font-black text-amber-500 font-mono block">{compPrice} ر.س</span>
                                  </div>
                                  <div className="p-2 rounded bg-black/40 border border-[#D4AF37]/10">
                                    <span className="block text-[8px] text-gray-500 font-bold mb-0.5">فرق السعر الفعلي</span>
                                    <span className={`text-[10px] font-black font-mono block ${priceDiff === 0 ? "text-gray-400" : isWeAreDearer ? "text-rose-400" : "text-emerald-400"}`}>
                                      {priceDiff === 0 ? "متطابق" : priceDiff > 0 ? `أنت أغلى (+${priceDiff} ر.س)` : `أنت أرخص (${priceDiff} ر.س)`}
                                    </span>
                                  </div>
                                  <div className="p-2 rounded bg-black/40 border border-slate-900">
                                    <span className="block text-[8px] text-gray-500 font-bold mb-0.5">الحالة الرصدية</span>
                                    <span className="text-[10px] font-bold text-gray-300 block">{comp.monitoring_status || (comp.status === 'price_dropped' ? "انخفاض سعر 📉" : comp.status === 'price_raised' ? "ارتفاع سعر 📈" : "مستقرة ومطابقة")}</span>
                                  </div>
                                </div>

                                <div className="bg-indigo-950/15 p-2.5 rounded-lg border border-indigo-950/20 text-[10px] text-gray-300 leading-relaxed">
                                  <span className="font-extrabold text-indigo-400 block mb-1">🤖 توصية الذكاء الاصطناعي للمواءمة (Sahm Brain Recommendation):</span>
                                  {
                                    comp.initialComparison ? comp.initialComparison :
                                    isWeAreDearer ? `سعر المنافس أقل بـ ${priceDiff} ر.س. نوصي بتفعيل كوبون خصم جزئي بنسبة ٥٪ مخصص للعملاء المحالين من الواتساب للحفاظ على هامش ربحك العالي البالغ ${prices.price && prices.cost ? Math.round(((parseFloat(prices.price) - parseFloat(prices.cost)) / parseFloat(prices.price)) * 100) : 0}% دون تعديل معلن بالكتالوج.` :
                                    `أنت تتفوق ترويجياً بسعر مميز أقل بـ ${Math.abs(priceDiff)} ر.س من المنافس. يمكنك تكثيف الحملات الموجهة لتوسيع حصتك السوقية وحرق مخزونك الراكد.`
                                  }
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right side Metadata column: Primary Portrait preview & Timeline Event Log (4 Cols) */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Photo Display Card */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#1e293b]/25 relative overflow-hidden text-center space-y-3">
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] font-black py-0.5 px-3 rounded-full border border-[#D4AF37]/30 inline-block">
                      مظهر الرف والبطاقة
                    </span>
                    
                    {images.length > 0 ? (
                      <div className="relative group">
                        <img 
                          src={images[0].previewUrl} 
                          alt="رقعة الطيب" 
                          className="w-full h-44 object-cover rounded-xl border border-slate-800 shadow" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
                          <span className="text-[10px] text-white font-bold">صورة المظهر النشط</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-gray-500">
                        لا يوجد وسيط وصورة للمنتج
                      </div>
                    )}

                    <div className="text-right space-y-1.5">
                      <h4 className="text-xs font-black text-white">{basicInfo.name || "لم يكتب الاسم بعد"}</h4>
                      <p className="text-[10px] text-[#D4AF37] truncate">{basicInfo.subtitle || "العنوان الفرعي المقترح"}</p>
                      <div className="flex justify-between items-center text-[10.5px] border-t border-slate-800/80 pt-2 mt-2">
                        <span className="text-emerald-400 font-mono font-bold">{prices.price} ر.س</span>
                        <span className="text-gray-500">الكمية: {stockInfo.stock} حبة</span>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL HISTORIC TIMELINE PORTAL */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0F172A] space-y-3 text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold block border-b border-slate-800 pb-1.5">
                      🕰️ السجل التاريخي والزمني للمنتج (Timeline):
                    </span>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {timeline.map((ev, idx) => (
                        <div key={`${ev.id || 'ev'}-${idx}`} className="relative pl-2 text-xs border-r border-[#D4AF37]/20 pr-3 pb-1">
                          <span className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
                          <div className="flex justify-between text-[9.5px]">
                            <span className="font-extrabold text-white">{ev.title}</span>
                            <span className="text-gray-500 font-mono">{ev.time}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-normal mt-0.5 select-text">
                            {ev.details}
                          </p>
                          <span className="text-[8px] block text-[#D4AF37] mt-0.5">بواسطة: {ev.user}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7. Platform Synching Settings Dashboard (تحديث المنصات) */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0F172A] space-y-3 text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold block border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>🔗 تحديث ومزامنة المنصات والقنوات:</span>
                      <span className="text-[9px] text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/20">مفعل</span>
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-1 gap-1.5 mt-2">
                        <label className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${syncOption === "local" ? "bg-slate-900 border-amber-500/50 text-white" : "border-slate-800 text-gray-400 hover:bg-slate-900/50"}`}>
                          <input 
                            type="radio" 
                            name="sync_opt" 
                            checked={syncOption === "local"} 
                            onChange={() => setSyncOption("local")}
                            className="mt-0.5 accent-amber-500" 
                          />
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-[11px] flex items-center gap-1">
                              <span>💾 حفظ محلي فقط (Local Keep)</span>
                            </div>
                            <p className="text-[9.5px] text-gray-400 leading-relaxed">تحديث البيانات بكتالوج ERP الداخلي في سهم دون تحديث واجهة المتجر.</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${syncOption === "sync" ? "bg-slate-900 border-emerald-500/50 text-white" : "border-slate-800 text-gray-400 hover:bg-slate-900/50"}`}>
                          <input 
                            type="radio" 
                            name="sync_opt" 
                            checked={syncOption === "sync"} 
                            onChange={() => setSyncOption("sync")}
                            className="mt-0.5 accent-emerald-500" 
                          />
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-[11px] flex items-center gap-1">
                              <span>🔄 حفظ ومزامنة فورية (Live Sync)</span>
                            </div>
                            <p className="text-[9.5px] text-gray-400 leading-relaxed">تحديث الصنف مع شبكات المتاجر (سلة، زد، Shopify، WooCommerce) في اللحظة نفسها.</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${syncOption === "schedule" ? "bg-slate-900 border-indigo-500/50 text-white" : "border-slate-800 text-gray-400 hover:bg-slate-900/50"}`}>
                          <input 
                            type="radio" 
                            name="sync_opt" 
                            checked={syncOption === "schedule"} 
                            onChange={() => setSyncOption("schedule")}
                            className="mt-0.5 accent-indigo-500" 
                          />
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-[11px] flex items-center gap-1">
                              <span>⏱️ جدولة المزامنة لاحقاً (Deferred)</span>
                            </div>
                            <p className="text-[9.5px] text-gray-400 leading-relaxed">إتاحة تعديل الأسعار وتخصيص دورة المعالجة وإرسالها بميقات ليلي مجدول.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 5. Permission & Multi-role Simulated Controller Dashboard (الصلاحيات) */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0F172A] space-y-3 text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold block border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>🛡️ صلاحيات وحوكمة أمن المنتجات:</span>
                      <span className="text-[9px] text-[#D4AF37] font-mono">رتبتك: {activeRoleForTesting}</span>
                    </span>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">تصفح الرتب لاختبار ومراجعة تراخيص الحفظ والتعديل (محاكاة):</label>
                        <select
                          value={activeRoleForTesting}
                          onChange={(e) => {
                            setActiveRoleForTesting(e.target.value);
                            triggerNotification(`تم محاكاة وتحويل رتبة الجلسة الحالية إلى [${e.target.value}] لمراجعة الصلاحيات! ✨🔒`, "info");
                          }}
                          className="w-full text-xs font-bold text-white bg-slate-900 border border-slate-800 p-2 rounded-lg focus:outline-none focus:border-amber-500/50 font-sans"
                        >
                          <option value="المدير العام">المدير العام (صلاحية كاملة)</option>
                          <option value="مالك النظام">مالك النظام (صلاحية كاملة)</option>
                          <option value="محاسب">محاسب (لا يمكنه تعديل الـ SEO أو الحذف)</option>
                          <option value="أمين مستودع">أمين مستودع (تعديل المخزون والعمليات فقط)</option>
                          <option value="مسوق">مسوق محرك بحث (تعديل SEO وتوصيف فقط)</option>
                          <option value="كاشير">كاشير صالة السهم (صلاحية الاطلاع والعرض فقط)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className={`w-2 h-2 rounded-full ${currentRolePerms.editProduct ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 font-sans">تعديل الصنف</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className={`w-2 h-2 rounded-full ${currentRolePerms.editPrice ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 font-sans">تعديل التسعير</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className={`w-2 h-2 rounded-full ${currentRolePerms.editStock ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 font-sans">تعديل المخزون</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className={`w-2 h-2 rounded-full ${currentRolePerms.editSeo ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 font-sans">تعديل الـ SEO</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className={`w-2 h-2 rounded-full ${currentRolePerms.editImages ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 font-sans">إدارة الصور</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className={`w-2 h-2 rounded-full ${currentRolePerms.deleteProduct ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 font-sans">حذف الأصناف</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8. Backups and Restore Historical Versions Controller (النسخ الاحتياطي واستعادة نسخة سابقة) */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0F172A] space-y-3 text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold block border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>🗄️ نسخ الحفظ الاحتياطية والتأمين:</span>
                      <span className="text-[9px] text-[#D4AF37] font-mono">{backups.length} محفوظات</span>
                    </span>

                    {backups.length === 0 ? (
                      <p className="text-[10px] text-gray-500 leading-normal">
                        لا توجد نسخ سابقة محفوظة لهذا الصنف بعد. سيقوم سهم بتوليد نسخة آمنة تلقائياً فور تعديل الحقول لتأمين بياناتك وسجلات السحب.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {backups.map((bk, bIdx) => (
                          <div key={`${bk.id || 'bk'}-${bIdx}`} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-sans">
                            <div className="space-y-0.5 text-right w-3/4">
                              <p className="text-[9.5px] text-gray-400 block font-mono leading-none">{bk.timeFormatted}</p>
                              <p className="text-[10px] text-white truncate">تعديل: {bk.user} | {bk.data?.name}</p>
                            </div>
                            <button
                              onClick={() => handleRestoreBackup(bk)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] rounded cursor-pointer transition-all"
                            >
                              استعادة 🔄
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* ACTION COMMAND CONTROLS BASEBOARD */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-wrap gap-2 justify-between items-center font-sans">
                
                <div className="flex gap-2">
                  <button
                    onClick={handleFinalPublishSave}
                    className="py-2.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-[0.98]"
                  >
                    ✓ تم القبول والاعتماد النهائي
                  </button>

                  <button
                    onClick={handleCloneProduct}
                    className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-gray-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    نسخ السلعة
                  </button>

                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => setShowRestoreDialog(true)}
                      className="py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>استعادة نسخة سابقة 🔄</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleArchiveDraft}
                    className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-gray-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    أرشفة المسودة
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExportDetailsPDF}
                    className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-gray-200 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    تصدير PDF 📄
                  </button>
                  <button
                    onClick={() => {
                      setStatus("idle");
                    }}
                    className="py-2 px-3.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    رفض والبدء من جديد
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* STATE: FINAL PUBLISHED NOTE DONE */}
          {status === "done" && (
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/25 text-emerald-400 flex items-center justify-center text-4xl mx-auto select-none animate-bounce">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white">تم تسيير واعتماد دورة حياة المنتج بالكامل! 🏆🌟</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  تم حفظ الخصائص، وتأسيس الحملة الإعلانية، وربط الصنف بالمستودعات ونقاط الكاشير النشطة، وتوثيق السجل في PostgreSQL السحابية بنجاح.
                </p>
              </div>

              <div className="flex gap-2.5 justify-center">
                <button
                  onClick={() => setStatus("review")}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-850 text-gray-200 font-bold text-xs rounded-xl cursor-pointer border border-slate-800"
                >
                  استمر في تعديل الخصائص
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl cursor-pointer"
                >
                  قفل المعالج والعودة للدليل
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RESTORE PREVIOUS STATE DIALOG MODAL */}
        {showRestoreDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div 
              className="w-full max-w-2xl rounded-3xl border p-6 space-y-6 text-right"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <RotateCcw className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">استعادة نسخة سابقة للمنتج 🔄</h2>
                    <p className="text-[10px] text-gray-400">اختر أحد النسخ الاحتياطية المسجلة بقاعدة بيانات سهم للمنتج واستعد معلوماتها بضغطة واحدة</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRestoreDialog(false)}
                  className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-all border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <Clock className="w-8 h-8 text-amber-500/30 mx-auto animate-pulse" />
                  <p className="text-xs font-bold">لا توجد نسخ سابقة محفوظة لهذا الصنف حالياً</p>
                  <p className="text-[10px] text-gray-600">سيتم تلقائياً تدوين وحفظ النسخ السابقة عند قيامك بتعديل أي منتج نشط وحفظه.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {backups.map((bk, bIdx) => (
                    <div 
                      key={bk.id || bIdx} 
                      className="p-4 rounded-2xl border border-slate-850 bg-[#0F172A]/40 hover:bg-[#0F172A]/80 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          نسخة #{backups.length - bIdx}
                        </span>
                        <div className="text-right flex-1 space-y-1">
                          <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                            <span className="text-amber-500">عدلها: {bk.user || "مستخدم غير معرف"}</span>
                            <span className="text-gray-500">•</span>
                            <span className="font-mono text-[10px] text-gray-300">{bk.timeFormatted}</span>
                          </div>
                          {bk.data && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-gray-400 font-sans border-t border-slate-900 pt-2 mt-2">
                              <div>
                                <span className="block text-gray-500 text-[9px]">الاسم:</span>
                                <span className="text-white font-bold">{bk.data.name}</span>
                              </div>
                              <div>
                                <span className="block text-gray-500 text-[9px]">سعر البيع:</span>
                                <span className="text-emerald-400 font-bold font-mono">{bk.data.price} ر.س</span>
                              </div>
                              <div>
                                <span className="block text-gray-500 text-[9px]">المخزون الحالي:</span>
                                <span className="text-amber-500 font-bold font-mono">{bk.data.stock} حبة</span>
                              </div>
                              {bk.data.sku && (
                                <div className="col-span-full">
                                  <span className="text-gray-500 text-[9px]">رقم SKU: </span>
                                  <span className="font-mono text-gray-300 text-[9.5px]">{bk.data.sku}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleRestoreBackup(bk);
                            setShowRestoreDialog(false);
                            triggerNotification(`تم بنجاح الرجوع إلى نسخة سابقة محفوظة من (${bk.timeFormatted}) وملاءمة جميع الحقول! 🔄💾`, "success");
                          }}
                          className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10.5px] rounded-xl flex items-center gap-1 cursor-pointer border-none transition-all active:scale-[0.98]"
                        >
                          <RotateCcw className="w-3 h-3 text-black" />
                          <span>استعادة هذا الملف بضغطة واحدة ⚡</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRestoreDialog(false)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-gray-400 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer"
                >
                  إلغاء وإغلاق النوافذ
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* APPROVAL / CONFIRMATION PROCESS MODAL */}
        {showApproveConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
            <div 
              className="relative w-full max-w-lg rounded-3xl border p-6 space-y-6 text-right font-sans overflow-hidden"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Core Loading State Cover Overlay */}
              {isApproving && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in bg-slate-950/95">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin"></div>
                    <CheckCheck className="w-5 h-5 text-amber-400 absolute animate-pulse" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h3 className="text-sm font-bold text-white">جاري اعتماد المنتج...</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      نقوم بمزامنة مستندات الصنف وتأمين السجلات ضمن قاعدة بيانات سهم للربط الحي واللوجستيات.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">تأكيد واستصدار الاعتماد النهائي للمنتج 🏆</h2>
                    <p className="text-[10px] text-gray-400">يرجى تحديد مسار الحفظ والاعتماد المناسب للمنتج في الكتالوج:</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowApproveConfirmModal(false);
                    setApproveError(null);
                  }}
                  disabled={isApproving}
                  className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-all border-none bg-transparent cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Explicit Error Display */}
              {approveError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-right space-y-1 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-xs font-bold font-sans">تعذر حفظ واعتماد الصنف:</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed pr-3.5 font-sans break-words">{approveError}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* 1. APPROVE ONLY */}
                <button
                  type="button"
                  onClick={() => setSelectedApprovalType("only")}
                  className={`w-full text-right p-4 rounded-2xl border transition-all space-y-1 block cursor-pointer group ${
                    selectedApprovalType === "only"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                      : "border-slate-800 bg-[#0F172A]/40 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedApprovalType === "only" ? "bg-emerald-500 text-white" : "text-emerald-400 bg-emerald-500/10"
                    }`}>اعتماد فوري</span>
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      <span>1. اعتماد المنتج فقط 📦</span>
                      {selectedApprovalType === "only" && <Check className="w-4 h-4 text-emerald-400 font-bold" />}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-gray-400">سيتم تفعيل حالة الصنف كـ <span className="text-emerald-400 font-bold">[نشط]</span> وإدراجه فوراً بالمخازن، المنتجات، الكاشير (POS)، التقارير، وذاكرة السهم دون مزامنة حيّة للمنصات الخارجية.</p>
                </button>

                {/* 2. APPROVE & PUBLISH */}
                <button
                  type="button"
                  onClick={() => setSelectedApprovalType("publish")}
                  className={`w-full text-right p-4 rounded-2xl border transition-all space-y-1 block cursor-pointer group ${
                    selectedApprovalType === "publish"
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                      : "border-slate-800 bg-[#0F172A]/40 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedApprovalType === "publish" ? "bg-amber-500 text-white" : "text-amber-400 bg-amber-500/10"
                    }`}>نشر حي ومتزامن</span>
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      <span>2. اعتماد ونشر فوري 🚀</span>
                      {selectedApprovalType === "publish" && <Check className="w-4 h-4 text-amber-400 font-bold" />}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-gray-400">تنشيط حالة الصنف ورفعه فوراً مع مزامنة كامل الحقول والصور والأسعار بشكل آلي في قنوات البيع النشطة (سلة، زد، الخ) المتصلة بـ نظام سهم.</p>
                </button>

                {/* 3. SAVE AS DRAFT */}
                <button
                  type="button"
                  onClick={() => setSelectedApprovalType("draft")}
                  className={`w-full text-right p-4 rounded-2xl border transition-all space-y-1 block cursor-pointer group ${
                    selectedApprovalType === "draft"
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5"
                      : "border-slate-800 bg-[#0F172A]/40 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedApprovalType === "draft" ? "bg-indigo-500 text-white" : "text-indigo-400 bg-indigo-500/10"
                    }`}>غير مفعل</span>
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      <span>3. اعتماد كمسودة مؤقتة 📁</span>
                      {selectedApprovalType === "draft" && <Check className="w-4 h-4 text-indigo-400 font-bold" />}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-gray-400">إدراج الصنف في النظام كمسودة غير نشطة لاستكمال التدقيق على الأسعار أو المراجعة البصرية للوسائط لاحقاً.</p>
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <p className="text-[9px] text-gray-500 font-serif">● نظام سهم الذكي للربط المتكامل</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveConfirmModal(false);
                      setApproveError(null);
                    }}
                    disabled={isApproving}
                    className="py-2.5 px-5 bg-transparent hover:bg-slate-900 text-gray-400 hover:text-white text-xs font-black rounded-xl border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
                  >
                    إلغاء وتراجع
                  </button>
                  <button
                    type="button"
                    onClick={() => commitFinalApproveSave(selectedApprovalType)}
                    disabled={isApproving}
                    className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer text-white border-none ${
                      selectedApprovalType === "only"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/10"
                        : selectedApprovalType === "publish"
                          ? "bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-500/10"
                          : "bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10"
                    }`}
                  >
                    {isApproving ? (
                      <>
                        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                        <span>جاري اعتماد المنتج...</span>
                      </>
                    ) : (
                      <span>تأكيد الاعتماد 🏆</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
