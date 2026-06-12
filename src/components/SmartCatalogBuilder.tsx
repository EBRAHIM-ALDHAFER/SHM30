import React, { useState, useEffect, useRef } from "react";
import { Product, ThemeColors, User } from "../types";
import { getMediaCenterFiles, saveMediaCenterFiles } from "../utils/safeStorage";
import { 
  Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Printer, Download, Share2, X, 
  ChevronRight, ChevronLeft, Search, Layers, Settings, RefreshCw, FileText, Image as ImageIcon, 
  Tag, Plus, Check, ExternalLink, Eye, ArrowUp, ArrowDown, HelpCircle, Save, Loader2, Send
} from "lucide-react";
import { productTimelineService } from "../core/database/productTimelineService";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Helper to convert modern CSS colors (oklch, oklab, lch, lab) to html2canvas-compatible hsl(...) or hsla(...) format.
 */
function replaceModernColorsWithHsl(cssText: string): string {
  if (!cssText) return "";
  
  const colorFnRegex = /\b(oklch|oklab|lch|lab)\s*\(/gi;
  let result = "";
  let i = 0;
  
  while (i < cssText.length) {
    colorFnRegex.lastIndex = i;
    const match = colorFnRegex.exec(cssText);
    if (!match) {
      result += cssText.substring(i);
      break;
    }
    
    const matchIndex = match.index;
    const fnName = match[1].toLowerCase();
    
    // Add everything before the match
    result += cssText.substring(i, matchIndex);
    
    // Find matching closing parenthesis
    let parenCount = 1;
    let j = matchIndex + fnName.length + 1; // index after the opening '('
    while (j < cssText.length && parenCount > 0) {
      if (cssText[j] === "(") {
        parenCount++;
      } else if (cssText[j] === ")") {
        parenCount--;
      }
      j++;
    }
    
    const innerText = cssText.substring(matchIndex + fnName.length + 1, j - 1).trim();
    
    if (innerText.includes("var(")) {
      // html2canvas cannot resolve custom property references nested inside,
      // map to neutral gray to avoid parse crash
      result += "hsl(0, 0%, 50%)";
    } else {
      const parts = innerText.split(/[\s,/]+/);
      if (parts.length >= 3) {
        try {
          const first = parts[0];
          const second = parts[1];
          const third = parts[2];
          const alphaPart = parts[3] || null;
          
          // Lightness (L) is first for all of them
          let l = first.endsWith("%") ? parseFloat(first) : parseFloat(first) * 100;
          if (isNaN(l)) l = 50;
          
          let h = 0;
          let s = 100;
          
          if (fnName === "oklch" || fnName === "lch") {
            const c = parseFloat(second);
            const maxC = fnName === "oklch" ? 0.4 : 150;
            s = isNaN(c) ? 0 : (c / maxC) * 100;
            if (s > 100) s = 100;
            if (s < 0) s = 0;
            
            h = parseFloat(third);
            if (isNaN(h)) h = 0;
          } else if (fnName === "oklab" || fnName === "lab") {
            const a = parseFloat(second);
            const b = parseFloat(third);
            if (!isNaN(a) && !isNaN(b)) {
              const c = Math.sqrt(a * a + b * b);
              const maxC = fnName === "oklab" ? 0.4 : 125;
              s = (c / maxC) * 100;
              if (s > 100) s = 100;
              if (s < 0) s = 0;
              
              h = Math.atan2(b, a) * (180 / Math.PI);
              if (h < 0) h += 360;
            } else {
              s = 0;
              h = 0;
            }
          }
          
          if (alphaPart) {
            let a = alphaPart.endsWith("%") ? parseFloat(alphaPart) / 100 : parseFloat(alphaPart);
            if (isNaN(a)) a = 1;
            result += `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%, ${a})`;
          } else {
            result += `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
          }
        } catch (e) {
          result += "hsl(0, 0%, 50%)";
        }
      } else {
        result += "hsl(0, 0%, 50%)";
      }
    }
    
    i = j;
  }
  return result;
}

/**
 * Helper to get CSS text from a stylesheet element (style or same-origin link).
 */
function getStyleElementCss(el: Element): string {
  try {
    if (el.tagName.toLowerCase() === "style") {
      return el.textContent || "";
    }
    if (el.tagName.toLowerCase() === "link") {
      const linkEl = el as HTMLLinkElement;
      const sheet = linkEl.sheet as CSSStyleSheet | null;
      if (sheet && sheet.cssRules) {
        let cssText = "";
        const rules = Array.from(sheet.cssRules);
        for (const rule of rules) {
          cssText += rule.cssText + "\n";
        }
        return cssText;
      }
    }
  } catch (e) {
    // Cross-origin CSS files throw security errors if accessed directly
  }
  return "";
}

/**
 * Safe onclone hook for html2canvas to intercept custom computed styles and
 * sanitize element properties within the decoupled rendering iframe.
 */
function handleHtml2CanvasClone(clonedDoc: Document): void {
  const clonedWin = clonedDoc.defaultView;
  if (!clonedWin) return;

  // Intercept computation lookups so html2canvas never receives raw "oklab", "oklch" etc.
  const originalGetComputedStyle = clonedWin.getComputedStyle;
  clonedWin.getComputedStyle = function(elt: Element, pseudoElt?: string | null) {
    const style = originalGetComputedStyle.call(clonedWin, elt, pseudoElt);
    if (!style) return style;
    return new Proxy(style, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return function(propertyName: string) {
            const val = target.getPropertyValue(propertyName);
            if (typeof val === 'string' && (
              val.toLowerCase().includes('oklch') || 
              val.toLowerCase().includes('oklab') || 
              val.toLowerCase().includes('lch') || 
              val.toLowerCase().includes('lab')
            )) {
              return replaceModernColorsWithHsl(val);
            }
            return val;
          };
        }
        
        const val = target[prop as any];
        if (typeof val === 'function') {
          return val.bind(target);
        }
        if (typeof prop === 'string' && typeof val === 'string' && (
          val.toLowerCase().includes('oklch') || 
          val.toLowerCase().includes('oklab') || 
          val.toLowerCase().includes('lch') || 
          val.toLowerCase().includes('lab')
        )) {
          return replaceModernColorsWithHsl(val);
        }
        return val;
      }
    });
  };

  // Safe patch CSSStyleDeclaration prototype inside the cloned environment
  if (clonedWin.CSSStyleDeclaration) {
    const originalGetPropertyValue = clonedWin.CSSStyleDeclaration.prototype.getPropertyValue;
    clonedWin.CSSStyleDeclaration.prototype.getPropertyValue = function(propertyName: string) {
      const val = originalGetPropertyValue.call(this, propertyName);
      if (typeof val === 'string' && (
        val.toLowerCase().includes('oklch') || 
        val.toLowerCase().includes('oklab') || 
        val.toLowerCase().includes('lch') || 
        val.toLowerCase().includes('lab')
      )) {
        return replaceModernColorsWithHsl(val);
      }
      return val;
    };
  }

  // Sanitize inline styles of cloned elements
  const elements = clonedDoc.getElementsByTagName("*");
  const checkNames = ["oklch", "oklab", "lch", "lab"];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const styleAttr = el.getAttribute("style");
    if (styleAttr && checkNames.some(name => styleAttr.toLowerCase().includes(name + "("))) {
      el.setAttribute("style", replaceModernColorsWithHsl(styleAttr));
    }
  }
}

/**
 * Strips unsupported modern colors from style elements, replaces same-origin stylesheets 
 * temporarily with a clean and fully mapped HSL duplicate, and intercepts window.getComputedStyle
 * so fallback CSS colors are returned transparently to html2canvas.
 */
function sanitizeOklchStyles(): () => void {
  const backups: Array<{ element: Element; parent: Node; nextSibling: Node | null }> = [];
  const originalInlineStyles = new Map<Element, string>();
  let tempStyleElement: HTMLStyleElement | null = null;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // Backup getComputedStyle functions
  const originalGetComputedStyle = window.getComputedStyle;
  const originalDefaultViewGetComputedStyle = window.document?.defaultView?.getComputedStyle;
  
  try {
    // Intercept computation lookups so html2canvas never receives raw "oklab", "oklch" etc.
    const wrapGetComputedStyle = (originalFn: typeof window.getComputedStyle) => {
      return function(elt: Element, pseudoElt?: string | null) {
        const style = originalFn.call(window, elt, pseudoElt);
        if (!style) return style;
        return new Proxy(style, {
          get(target, prop, receiver) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string' && (
                  val.toLowerCase().includes('oklch') || 
                  val.toLowerCase().includes('oklab') || 
                  val.toLowerCase().includes('lch') || 
                  val.toLowerCase().includes('lab')
                )) {
                  return replaceModernColorsWithHsl(val);
                }
                return val;
              };
            }
            
            const val = Reflect.get(target, prop);
            if (typeof val === 'function') {
              return val.bind(target);
            }
            if (typeof prop === 'string' && typeof val === 'string' && (
              val.toLowerCase().includes('oklch') || 
              val.toLowerCase().includes('oklab') || 
              val.toLowerCase().includes('lch') || 
              val.toLowerCase().includes('lab')
            )) {
              return replaceModernColorsWithHsl(val);
            }
            return val;
          }
        });
      };
    };

    window.getComputedStyle = wrapGetComputedStyle(originalGetComputedStyle);
    if (window.document?.defaultView) {
      (window.document.defaultView as any).getComputedStyle = wrapGetComputedStyle(originalGetComputedStyle);
    }

    let combinedCssText = "";

    // Find and backup/remove all stylesheet elements from DOM so document.styleSheets becomes empty
    const styleEls = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
    for (const el of styleEls) {
      if (el.id === "sahm-html2canvas-safe-styles") continue;
      
      const parent = el.parentNode;
      if (!parent) continue;

      // Extract original CSS content
      const cssText = getStyleElementCss(el);
      if (cssText) {
        combinedCssText += replaceModernColorsWithHsl(cssText) + "\n";
      }

      // Record DOM position details for exact restoration
      backups.push({
        element: el,
        parent: parent,
        nextSibling: el.nextSibling
      });

      // Physically remove from DOM so html2canvas doesn't traverse it
      parent.removeChild(el);
    }

    // Inject our perfectly mapped, sanitized single fallback stylesheet
    tempStyleElement = document.createElement("style");
    tempStyleElement.id = "sahm-html2canvas-safe-styles";
    tempStyleElement.textContent = combinedCssText;
    document.head.appendChild(tempStyleElement);

    // Recursively clean up inline-style properties
    const elements = document.getElementsByTagName("*");
    const checkNames = ["oklch", "oklab", "lch", "lab"];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const styleAttr = el.getAttribute("style");
      if (styleAttr && checkNames.some(name => styleAttr.toLowerCase().includes(name + "("))) {
        originalInlineStyles.set(el, styleAttr);
        el.setAttribute("style", replaceModernColorsWithHsl(styleAttr));
      }
    }
  } catch (globalErr) {
    console.warn("Stylesheet sanitization pipeline crashed:", globalErr);
  }

  // Restore function invoked right after html2canvas completes
  return () => {
    // Restore getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
    if (window.document?.defaultView) {
      (window.document.defaultView as any).getComputedStyle = originalDefaultViewGetComputedStyle || originalGetComputedStyle;
    }

    try {
      if (tempStyleElement && tempStyleElement.parentNode) {
        tempStyleElement.parentNode.removeChild(tempStyleElement);
      }
    } catch (e) {
      // Ignore
    }

    // Restore original stylesheet elements back into their exact DOM positions in reverse order
    for (let i = backups.length - 1; i >= 0; i--) {
      const item = backups[i];
      try {
        item.parent.insertBefore(item.element, item.nextSibling);
      } catch (e) {
        console.warn("Could not restore stylesheet element:", e);
      }
    }

    // Restore inline element styles
    originalInlineStyles.forEach((val, el) => {
      try {
        el.setAttribute("style", val);
      } catch (e) {
        // Ignore
      }
    });
  };
}

interface CatalogGenerationItem {
  productId: string;
  title: string;
  desc: string;
  features: string[];
  whatsapp_text: string;
  instagram_text: string;
  print_text: string;
  image?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  category: string;
}

interface SmartCatalogBuilderProps {
  products: Product[];
  setProducts: (updatedList: Product[]) => void;
  theme: ThemeColors;
  onClose: () => void;
  triggerNotification?: (text: string, type?: "success" | "info" | "alert" | "error") => void;
  addAuditLog?: (event: string, text: string) => void;
  user: User | null;
  initialSelectedProduct?: Product | null;
  initialSelectedCategory?: string | null;
}

type Step = "select" | "settings" | "generate" | "export";

export default function SmartCatalogBuilder({
  products,
  setProducts,
  theme,
  onClose,
  triggerNotification = () => {},
  addAuditLog = () => {},
  user,
  initialSelectedProduct = null,
  initialSelectedCategory = null
}: SmartCatalogBuilderProps) {

  // 1. Role and Permissions mapping (Unit 11)
  const userRole = user?.role || "مدير";
  
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem("sahm_web_catalog_permissions");
      return saved ? JSON.parse(saved) : {
        "مالك النظام": { create: true, edit: true, export: true, delete: true, share: true },
        "مدير عام": { create: true, edit: true, export: true, delete: true, share: true },
        "المدير العام": { create: true, edit: true, export: true, delete: true, share: true },
        "مدير فرع": { create: true, edit: true, export: true, delete: true, share: true },
        "مدير": { create: true, edit: true, export: true, delete: true, share: true },
        "مسوق": { create: true, edit: true, export: true, delete: true, share: true },
        "محاسب": { create: true, edit: true, export: true, delete: false, share: true },
        "كاشير": { create: false, edit: false, export: false, delete: false, share: false },
        "أمين مستودع": { create: true, edit: false, export: true, delete: false, share: true },
        "موظف خدمة عملاء": { create: false, edit: false, export: false, delete: false, share: false }
      };
    } catch {
      return {
        "مالك النظام": { create: true, edit: true, export: true, delete: true, share: true },
        "مدير عام": { create: true, edit: true, export: true, delete: true, share: true },
        "مدير": { create: true, edit: true, export: true, delete: true, share: true },
        "مسوق": { create: true, edit: true, export: true, delete: true, share: true }
      };
    }
  });

  const perms = rolePermissions[userRole] || { create: true, edit: true, export: true, delete: true, share: true };

  // 2. Wizard & UI State
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Settings Options
  const [catalogTitle, setCatalogTitle] = useState("كتالوج سهم الترويجي الفاخر ✨");
  const [catalogFormat, setCatalogFormat] = useState<"pdf" | "images" | "print" | "whatsapp">("pdf");
  const [priceOption, setPriceOption] = useState<"with" | "without">("with");
  const [stockOption, setStockOption] = useState<"show" | "hide">("show");
  const [qrOption, setQrOption] = useState<"include" | "exclude">("include");
  const [activeTheme, setActiveTheme] = useState<"gold" | "white" | "black" | "green" | "offers" | "oud" | "food" | "corporate">("gold");
  const [catalogLanguage, setCatalogLanguage] = useState<"ar" | "en" | "bilingual">("ar");

  // Generations / Editor States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogGenerationItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CatalogGenerationItem>>({});
  const [syncToDb, setSyncToDb] = useState(true);

  // Download links state
  const [downloadPdfUrl, setDownloadPdfUrl] = useState<string | null>(null);
  const [downloadPdfName, setDownloadPdfName] = useState<string>("");
  const [downloadPngUrl, setDownloadPngUrl] = useState<string | null>(null);
  const [downloadPngName, setDownloadPngName] = useState<string>("");

  // Print layout override indicator
  const [isPrintMode, setIsPrintMode] = useState(false);

  // ReactRef representing the single source of truth for HTML-to-Canvas rendering
  const catalogRef = useRef<HTMLDivElement>(null);

  // Initialize pre-selections from incoming props
  useEffect(() => {
    if (initialSelectedProduct) {
      setSelectedProducts([initialSelectedProduct.id]);
    } else if (initialSelectedCategory) {
      const matchIds = products.filter(p => p.category === initialSelectedCategory).map(p => p.id);
      setSelectedProducts(matchIds);
    }
  }, [initialSelectedProduct, initialSelectedCategory, products]);

  // Categories list extracted from local state
  const categoriesList = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  // Filters selector helper
  const filteredProductsToSelect = products
    .filter(p => selectedCategoryFilter === "all" || p.category === selectedCategoryFilter)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

  // Dynamic quick-selector handlers
  const handleSelectBulk = (type: "all" | "none" | "low_stock" | "best_seller" | "category", catName?: string) => {
    if (type === "all") {
      setSelectedProducts(products.map(p => p.id));
    } else if (type === "none") {
      setSelectedProducts([]);
    } else if (type === "low_stock") {
      const ids = products.filter(p => p.stock > 0 && p.stock < 50).map(p => p.id);
      setSelectedProducts(ids);
      triggerNotification(`تم تحديد ${ids.length} صنف منخض المخزون!`, "info");
    } else if (type === "best_seller") {
      const ids = products.filter(p => p.price >= 200 || (p.price - p.cost) >= 100).map(p => p.id);
      setSelectedProducts(ids);
      triggerNotification(`تم حصر وتحديد ${ids.length} برستيج بطل المبيعات!`, "info");
    } else if (type === "category" && catName) {
      const ids = products.filter(p => p.category === catName).map(p => p.id);
      setSelectedProducts(ids);
      triggerNotification(`تم تحديد كافة أصناف تصنيف: ${catName} (${ids.length} منتج)`, "info");
    }
  };

  const handleToggleProductSelection = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(prev => prev.filter(pId => pId !== id));
    } else {
      setSelectedProducts(prev => [...prev, id]);
    }
  };

  // Generate Catalog logic
  const handleStartGeneration = async () => {
    if (selectedProducts.length === 0) {
      triggerNotification("الرجاء اختيار منتج واحد على الأقل لتشغيل المولد التسويقي ⚠️", "alert");
      return;
    }

    setIsGenerating(true);
    setGenerationLogs(["تحليل المدخلات والبحث في دليل ERP المركزي...", "تبين العثور على أرقام المنتجات وملفاتها الشاملة..."]);

    const selectedDetails = products.filter(p => selectedProducts.includes(p.id));

    // Simulated staggered logs
    const interval = setInterval(() => {
      const logPool = [
        "جاري رصد الأوزان والأبعاد ووصف الكاشير المتاح...",
        "ربط الصور السحابية واستنباط سمات الجمال بالمذاق والروائح الراقية...",
        "استدعاء موجه الذكاء الاصطناعي بنموذج Gemini 3.5 Flash...",
        "تنسيق هيكل رسائل الواتساب مع إيموجيهات الإثارة للبيع الملكي...",
        "تجويد نصوص الإنستغرام وصياغة الهاشتاقات الموسمية المتصدرة بالمملكة #...",
        "تشكيل نماذج الكروت التعريفية المطبوعة لإبهار المشتري النهائي...",
        "إتمام عملية المزامنة وحفظ مصفوفات العروض في الأرشيف المؤقت..."
      ];
      setGenerationLogs(prev => {
        if (prev.length < logPool.length + 2) {
          const nextLog = logPool[prev.length - 2];
          return nextLog ? [...prev, nextLog] : prev;
        }
        return prev;
      });
    }, 900);

    try {
      // Call server end-point
      const parsedProductsForAi = selectedDetails.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        sku: p.sku,
        description: p.description || ""
      }));

      const res = await fetch("/api/generate-catalog-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: parsedProductsForAi })
      });

      clearInterval(interval);

      if (res.ok) {
        const data = await res.json();
        if (data && data.generations && Array.isArray(data.generations)) {
          // Merge AI results with local product attributes
          const items: CatalogGenerationItem[] = data.generations.map((gen: any) => {
            const orig = selectedDetails.find(p => p.id === gen.productId) || selectedDetails[0];
            return {
              productId: gen.productId,
              title: gen.title || orig.name,
              desc: gen.desc || orig.description || "",
              features: gen.features || ["منتج أصلي معتمد", "جودة سهم الفاخرة"],
              whatsapp_text: gen.whatsapp_text || `*${orig.name}* - سعر البيع وتوافر عالي!`,
              instagram_text: gen.instagram_text || `#عطور_سهم #فخامة_سهم`,
              print_text: gen.print_text || orig.name,
              image: orig.image || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200",
              price: orig.price,
              originalPrice: orig.price * 1.25, // Mock pre-discount price for sales theme
              stock: orig.stock,
              sku: orig.sku,
              category: orig.category
            };
          });
          setCatalogItems(items);
          triggerNotification("تم توليد محتوى الكتالوج بالذكاء الاصطناعي للمنتجات المحددة بنجاح 🔥🎓", "success");
          addAuditLog("توليد كتالوج ذكي", `تمت صياغة كتالوج ترويجي لـ ${items.length} منتج بنجاح عبر وكيل ذكاء سهم.`);
          setCurrentStep("generate");
        } else {
          throw new Error("Invalid format from server API");
        }
      } else {
        throw new Error("Server returned non-200 state");
      }
    } catch (err) {
      console.warn("[Catalog Builder LLM Fallback] Using offline-first rule heuristic engine...");
      // HEURISTIC OFFLINE PRETTY GENERATOR (Always elegant, fully localized and robust)
      setTimeout(() => {
        const fallbacks: CatalogGenerationItem[] = selectedDetails.map(p => {
          const mainFeature = p.category === "عطور ودخون" ? "تقطير خشبي أصيل معتق بنقاء ١٠٠٪" : "مذاق فريد محضر يدويًا بعناية فائقة";
          const thirdFeature = p.stock > 10 ? "متوفر بكمية وافرة بالمستودع الرئيسي" : "إصدار حصري محدود الكمية";
          
          return {
            productId: p.id,
            title: `💎 فخامة النخبة — ${p.name}`,
            desc: `عبّر عن الرقي المطلق واقتنِ هذا الصنف المبتكر بدورة المبيعات الأكثر مبيعاً بمخازن سهم. صُمّم لمطابقة أعلى معايير الجودة ومناسب جداً للتقديم كهدايا فاخرة بمناسبات النبلاء.`,
            features: [
              mainFeature,
              "مطابق لاختبارات الجودة ومواصفات ومعايير Zatca",
              thirdFeature
            ],
            whatsapp_text: `👑 *${p.name} — فخامة النخبة* 👑\n\nوصف ساحر يلامس الأحاسيس ونقاء عالي. لا تفوتوا فرصة الاقتناء من التشكيلة الأرقى على الإطلاق!\n\n🛍️ *السعر الاستثنائي الحالي:* ${p.price} ر.س\n📦 *المخزون المتوفر لدينا:* ${p.stock} وحدة فقط حياً!\n🏷️ *سعر التوريد والمطابقة:* ${p.sku}\n\n💬 اطلبوه الآن مباشرة بالضغط على رابط التواصل أو أرسلوا لنا تأكيد الشراء لتجهيزه لكم بمراسيم الطيب الملكية فورياً! ✨`,
            instagram_text: `بروح الأصالة ولمسة العصر، نقدّم لكم الأيقونة ${p.name} 💎\n\nأغمض عينيك ودع الشغف يسافر بك إلى ثقافة الذوق الرفيع والخلطات النادرة.\n\n✨ التوصيل مباشر لكافة مناطق ومدن المملكة 🇸🇦\n💬 للمزيد من المعلومات والطلب تفضلوا بزيارة الدايركت مسج الخاص بالمتجر.\n\n#مراسيم_سهم #فخامة_سعودية #براند_النخبة #عطر_الطيب #دهن_العود #التسويق_الذكي`,
            print_text: `الطيب بصمة لا تزول والاسم يتجسد بقيمة الأصالة والجودة — ${p.name}. سعر البيع: ${p.price} ر.س. شكراً لاختياركم منتجاتنا.`,
            image: p.image || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200",
            price: p.price,
            originalPrice: p.price * 1.35,
            stock: p.stock,
            sku: p.sku,
            category: p.category
          };
        });
        setCatalogItems(fallbacks);
        triggerNotification("تم توليد محتوى الكتالوج بهندسة القواعد البديلة بنجاح 📐✨", "info");
        setCurrentStep("generate");
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Editing items handlers
  const handleOpenEditItem = (index: number) => {
    if (!perms.edit) {
      triggerNotification("⚠️ عذراً، لا تملك رتبتك الصلاحية لتعديل وتغيير نصوص البطاقات.", "error");
      return;
    }
    setEditingIndex(index);
    setEditForm({ ...catalogItems[index] });
  };

  const handleSaveItemEdit = () => {
    if (editingIndex === null) return;
    
    const updated = [...catalogItems];
    updated[editingIndex] = {
      ...updated[editingIndex],
      ...editForm
    } as CatalogGenerationItem;
    setCatalogItems(updated);

    // Sync database option
    if (syncToDb) {
      const targetId = updated[editingIndex].productId;
      const originalProductsUpdated = products.map(p => {
        if (p.id === targetId) {
          return {
            ...p,
            name: editForm.title || p.name,
            description: editForm.desc || p.description,
            price: editForm.price || p.price
          };
        }
        return p;
      });
      setProducts(originalProductsUpdated);
      triggerNotification("تم حفظ التعديلات ملموسة ومطابقتها بمركز الـ ERP ✓", "success");
    } else {
      triggerNotification("تم تحديث الكبائن والبطاقة مؤقتاً للكتالوج الحالي فقط ✓", "info");
    }

    setEditingIndex(null);
  };

  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === catalogItems.length - 1) return;

    const updated = [...catalogItems];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCatalogItems(updated);
    triggerNotification("تم إعادة ترتيب تسلسل عرض الصنف بالكتالوج!", "info");
  };

  const handleDeleteCatalogItem = (index: number) => {
    if (!perms.delete) {
      triggerNotification("⚠️ ليس لديك صلاحية إتلاف أو حذف أوراق من المسودة.", "error");
      return;
    }
    const filtered = catalogItems.filter((_, idx) => idx !== index);
    setCatalogItems(filtered);
    triggerNotification("تم استبعاد ورقة المنتج من الكتالوج بنجاح", "alert");
    if (filtered.length === 0) {
      setCurrentStep("select");
    }
  };

  // Final actions triggers:
  // 1. Share through WhatsApp with precompiled template text
  const handleWhatsAppShare = (item: CatalogGenerationItem) => {
    if (!perms.share) {
      triggerNotification("⚠️ رتبتك لا تمتلك صلاحية المشاركة الخارجية.", "error");
      return;
    }
    const encodedText = encodeURIComponent(item.whatsapp_text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    triggerNotification("تم فتح نافذة WhatsApp ومشاركة نصوص الدعاية! 💬✨", "success");
    addTimelineEvent(item.productId, "تمت مشاركة بطاقة المنتج الترويجية عبر الواتساب بنجاح.");
  };

  // 2. Add Event inside the product history timeline
  const addTimelineEvent = async (productId: string, desc: string) => {
    try {
      await productTimelineService.createEvent({
        event_id: `evt_catalog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        product_id: productId,
        store_id: localStorage.getItem("sahm_active_store_id") || "store_1",
        event_type: "standard",
        title: "صناعة كتالوج ونشاط إعلاني 🎁",
        description: desc,
        created_by: user?.name || "مدير تسويق ذكي",
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Failed saving timeline event:", e);
    }
  };

  // 3. Save inside the Media file and documents catalog system (Requirement 8)
  const handleSaveToMediaCenter = (item: CatalogGenerationItem) => {
    try {
      const savedFiles = getMediaCenterFiles();
      
      const newFile = {
        id: `media_catalog_${Date.now()}`,
        name: `بطاقة كتالوج - ${item.title}.png`,
        type: "image" as const,
        category: "templates" as const,
        url: item.image || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200",
        size: "٣٨٠ كيلوبايت",
        date: new Date().toLocaleDateString("ar-SA")
      };

      const updated = [newFile, ...savedFiles];
      saveMediaCenterFiles(updated);
      triggerNotification(`تم تصدير وحفظ كرت العطر والأصل الإعلاني بمركز وسائط سهم! 🖼️🗂️`, "success");
      if (item.productId) {
        addTimelineEvent(item.productId, "تم تصدير كرت الكتالوج واللوحة وتخزينها بمكتبة وسائط الأرشيف.");
      }
    } catch {
      triggerNotification("عذراً، فشل التصدير السحابي للوسائط.", "error");
    }
  };

  // 4. Save entire catalog state as draft in localStorage
  const handleSaveAsDraft = () => {
    try {
      const savedDraftsRaw = localStorage.getItem("sahm_stored_catalogs") || "[]";
      const savedDrafts = JSON.parse(savedDraftsRaw);

      const newDraft = {
        id: `cat_${Date.now()}`,
        title: catalogTitle,
        format: catalogFormat,
        theme: activeTheme,
        itemsCount: catalogItems.length,
        items: catalogItems,
        lang: catalogLanguage,
        date: new Date().toLocaleDateString("ar-SA")
      };

      savedDrafts.unshift(newDraft);
      localStorage.setItem("sahm_stored_catalogs", JSON.stringify(savedDrafts));
      triggerNotification("تم حفظ كتيب الكتالوج كمسودة ذكية جاهزة للاستدعاء 💾📦", "success");
    } catch {
      triggerNotification("فشل الحفظ المحلي للكتالوج.", "error");
    }
  };

  // 5. Trigger PDF Real high-fidelity download and store inside Media Library
  const handleExportPdfReal = async () => {
    if (!perms.export) {
      triggerNotification("⚠️ لا تمتلك رتبتك الصلاحيات الكافية لتصدير ملفات PDF.", "error");
      return;
    }

    if (catalogItems.length === 0) {
      triggerNotification("الرجاء إضافة منتجات أولاً لتوليد ملف PDF ⚠️", "error");
      return;
    }
    
    triggerNotification("جاري معالجة الكتالوج وتوليد ملف PDF بالخط العربي المعتمد (Cairo/Tajawal)... 📜", "info");
    
    try {
      const targetElement = catalogRef.current;
      if (!targetElement) {
        throw new Error("لم يتم العثور على لوحة المعاينة بالموجز. يرجى التأكد من استعراض تبويب خطوة التصدير والمشاركة.");
      }
      
      let imgData = "";
      const restoreStyles = sanitizeOklchStyles();
      try {
        const canvas = await html2canvas(targetElement, {
          useCORS: true,
          allowTaint: true,
          scale: 2, // 2x scale for higher quality reading and anti-blur
          backgroundColor: activeTheme === "white" ? "#ffffff" : "#020617",
          onclone: handleHtml2CanvasClone
        });
        imgData = canvas.toDataURL("image/png"); // PNG handles sharp fonts better
      } catch (canvasErr: any) {
        throw new Error(`تعذر التقاط صورة المعاينة بالمتصفح: ${canvasErr.message || "html2canvas failed"}`);
      } finally {
        restoreStyles();
      }
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const safeTitle = catalogTitle.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, "_");
      const fileName = `كتالوج_${safeTitle}_${Date.now()}.pdf`;

      if (imgData) {
        const imgWidth = 210;
        const pageHeight = 297;
        const canvasHeight = targetElement.clientHeight || 500;
        const canvasWidth = targetElement.clientWidth || 800;
        const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        throw new Error("فشل التقاط محتويات الكتالوج لعدم توفر معالجة الصورة الرسمية.");
      }

      pdf.save(fileName);
      
      const pdfDataUri = pdf.output("datauristring");
      setDownloadPdfUrl(pdfDataUri);
      setDownloadPdfName(fileName);
      
      const savedFiles = getMediaCenterFiles();
      
      const newMediaId = `media_pdf_${Date.now()}`;
      const newFile = {
        id: newMediaId,
        name: fileName,
        type: "pdf" as const,
        category: "documents" as const,
        url: pdfDataUri,
        size: `${Math.round(pdfDataUri.length / 1300)} كيلوبايت`,
        date: new Date().toLocaleDateString("ar-SA")
      };
      
      saveMediaCenterFiles([newFile, ...savedFiles]);
      
      triggerNotification("تم إنشاء ملف PDF وتحميله وحفظه بمكتبة الوسائط بنجاح! 📥📄", "success");
      addTimelineEvent(catalogItems[0].productId, `تم تصدير وحفظ كتالوج PDF بعنوان ${catalogTitle}`);
    } catch (err: any) {
      console.error("PDF Export Crash:", err);
      triggerNotification(`❌ فشل تصدير الكتالوج بصيغة PDF الكلي: ${err.message || "خطأ غير متوقع"}`, "error");
    }
  };

  // 6. Real Images export and store inside Media Library
  const handleExportImagesReal = async () => {
    if (!perms.export) {
      triggerNotification("⚠️ لا تمتلك رتبتك الصلاحيات الكافية لتصدير الصور.", "error");
      return;
    }

    if (catalogItems.length === 0) {
      triggerNotification("الرجاء إضافة منتجات أولاً لتوليد الصور ⚠️", "error");
      return;
    }
    
    triggerNotification("جاري تصوير وتجميع بطاقات العرض والخطوط بألوان متناسقة... 🖼️", "info");
    
    try {
      const targetElement = catalogRef.current;
      if (!targetElement) {
        throw new Error("برجاء الانتقال لتبويب المعاينة أولاً للتصوير الجرافيكي.");
      }
      
      const restoreStyles = sanitizeOklchStyles();
      let canvas;
      try {
        canvas = await html2canvas(targetElement, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: activeTheme === "white" ? "#ffffff" : "#020617",
          onclone: handleHtml2CanvasClone
        });
      } finally {
        restoreStyles();
      }
      
      const dataUrl = canvas.toDataURL("image/png");
      
      const safeTitle = catalogTitle.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, "_");
      const fileName = `بطاقات_${safeTitle}_${Date.now()}.png`;
      
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadPngUrl(dataUrl);
      setDownloadPngName(fileName);
      
      const savedFiles = getMediaCenterFiles();
      
      const newMediaId = `media_img_${Date.now()}`;
      const newFile = {
        id: newMediaId,
        name: fileName,
        type: "image" as const,
        category: "templates" as const,
        url: dataUrl,
        size: `${Math.round(dataUrl.length / 1300)} كيلوبايت`,
        date: new Date().toLocaleDateString("ar-SA")
      };
      
      saveMediaCenterFiles([newFile, ...savedFiles]);
      
      triggerNotification("تم إنشاء وتحميل صورة الكتالوج وحفظها بمكتبة الوسائط! 🖼️💾", "success");
      addTimelineEvent(catalogItems[0].productId, `تم حفظ وتحميل صورة الكتالوج ${catalogTitle}`);
    } catch (err: any) {
      console.error("Image Export error:", err);
      triggerNotification(`❌ فشل في تصوير وتوليد الكتالوج لصور بطاقات العرض لخلل: ${err.message || "فشل توليد Canvas"}`, "error");
    }
  };

  // Saved whole catalog into media library helper
  const handleSaveWholeCatalogToMedia = async () => {
    if (catalogItems.length === 0) {
      triggerNotification("الرجاء إضافة منتجات أولاً لحفظ الكتالوج", "error");
      return;
    }
    
    triggerNotification("جاري إعداد وحفظ الكتالوج بمركز وثائق وسائط سهم... 📁", "info");
    
    try {
      let pdfDataUri = downloadPdfUrl;
      let imgDataUri = downloadPngUrl;
      const safeTitle = catalogTitle.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, "_");
      
      const targetElement = catalogRef.current;
      if (targetElement) {
        if (!imgDataUri) {
          try {
            const restoreStyles = sanitizeOklchStyles();
            let canvas;
            try {
              canvas = await html2canvas(targetElement, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                backgroundColor: activeTheme === "white" ? "#ffffff" : "#020617",
                onclone: handleHtml2CanvasClone
              });
            } finally {
              restoreStyles();
            }
            imgDataUri = canvas.toDataURL("image/png");
            setDownloadPngUrl(imgDataUri);
            setDownloadPngName(`بطاقات_${safeTitle}_${Date.now()}.png`);
          } catch (e) {
            console.warn("Could not capture PNG catalog for Media Center:", e);
          }
        }
        
        if (!pdfDataUri) {
          try {
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4"
            });
            if (imgDataUri) {
              const imgWidth = 210;
              const pageHeight = 297;
              const canvasHeight = targetElement.clientHeight || 500;
              const canvasWidth = targetElement.clientWidth || 800;
              const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
              let heightLeft = imgHeight;
              let position = 0;
              
              pdf.addImage(imgDataUri, "PNG", 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
              
              while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgDataUri, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
              }
            } else {
              throw new Error("عذراً، لم تتوفر الصورة الملتقطة لإنشاء PDF");
            }
            pdfDataUri = pdf.output("datauristring");
            setDownloadPdfUrl(pdfDataUri);
            setDownloadPdfName(`كتالوج_${safeTitle}_${Date.now()}.pdf`);
          } catch (e) {
            console.warn("Could not generate PDF for Media Center:", e);
          }
        }
      }
      
      const savedFiles = getMediaCenterFiles();
      
      const fileId = `media_catalog_${Date.now()}`;
      const newFile = {
        id: fileId,
        name: `كتالوج_${safeTitle}_${Date.now()}.pdf`,
        type: "pdf" as const,
        category: "documents" as const,
        url: pdfDataUri || imgDataUri || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200",
        size: "٥٢٠ كيلوبايت",
        date: new Date().toLocaleDateString("ar-SA")
      };

      const updated = [newFile, ...savedFiles];
      saveMediaCenterFiles(updated);
      
      triggerNotification("✓ تم حفظ الكتالوج بمركز وسائط سهم بنجاح! يمكن رؤيتها بتبويب وسائط الـ ERP.", "success");
      addTimelineEvent(catalogItems[0].productId, `تم حفظ الكتالوج ${catalogTitle} بمركز وسائط سهم.`);
    } catch (err: any) {
      triggerNotification(`عذراً، فشل تخزين الكتالوج بمكتبة المعاينة: ${err.message}`, "error");
    }
  };

  // Helper theme color classes
  const getThemeClass = () => {
    switch(activeTheme) {
      case "gold":
        return {
          bg: "bg-slate-900 border-amber-500/40 text-white",
          heading: "text-amber-500",
          border: "border-amber-500/20",
          badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
          priceColor: "text-amber-400 font-black",
          accText: "text-gray-300"
        };
      case "white":
        return {
          bg: "bg-white border-slate-200 text-slate-900",
          heading: "text-slate-900",
          border: "border-slate-100",
          badge: "bg-slate-100 text-slate-800 border border-slate-250",
          priceColor: "text-emerald-600 font-extrabold",
          accText: "text-slate-600"
        };
      case "black":
        return {
          bg: "bg-black border-slate-850 text-white",
          heading: "text-white font-serif",
          border: "border-slate-900",
          badge: "bg-slate-900 text-slate-300 border border-slate-800",
          priceColor: "text-white font-extrabold font-mono",
          accText: "text-gray-400"
        };
      case "green":
        return {
          bg: "bg-slate-950 border-emerald-500/30 text-white",
          heading: "text-emerald-400",
          border: "border-emerald-500/10",
          badge: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
          priceColor: "text-emerald-300 font-bold",
          accText: "text-slate-300"
        };
      case "offers":
        return {
          bg: "bg-slate-900 border-rose-500/40 text-white animate-pulse-slow",
          heading: "text-rose-500",
          border: "border-rose-500/20",
          badge: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
          priceColor: "text-rose-450 text-base font-black font-mono",
          accText: "text-gray-300"
        };
      case "oud":
        return {
          bg: "bg-orange-950/20 border-orange-850/40 text-orange-100",
          heading: "text-orange-400",
          border: "border-orange-900/30",
          badge: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
          priceColor: "text-amber-500 font-black",
          accText: "text-orange-200/80"
        };
      case "food":
        return {
          bg: "bg-stone-900 border-yellow-600/30 text-stone-100",
          heading: "text-yellow-400",
          border: "border-stone-800",
          badge: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
          priceColor: "text-yellow-500",
          accText: "text-stone-300"
        };
      case "corporate":
        return {
          bg: "bg-slate-900 border-sky-500/30 text-white",
          heading: "text-sky-400",
          border: "border-sky-500/10",
          badge: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
          priceColor: "text-sky-400",
          accText: "text-slate-300"
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-800 text-white",
          heading: "text-white",
          border: "border-slate-800",
          badge: "bg-slate-800 text-slate-300 border border-slate-700",
          priceColor: "text-emerald-400",
          accText: "text-gray-300"
        };
    }
  };

  const currentThemeClasses = getThemeClass();

  // If user role is cashier or support, they should be fully barred from catalog crafting (Unit 11)
  if (!perms.create) {
    return (
      <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 text-right backdrop-blur-sm">
        <div className="p-8 rounded-3xl border border-red-950 bg-slate-950 max-w-xl text-right space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-black text-white">الوصول لصانع الكتالوجات محظور! 🔒</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            عذراً، رتبة عملك الحالية ({userRole === "كاشير" ? "الكاشير POS 💸" : "خدمة العملاء 📞"}) محجوبة ومستبعدة من حق صناعة المطبوعات والتسويق الخارجي وتوجيه منشورات البضائع لحماية سرية وحقوق الهوية التسويقية للمتجر.
          </p>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-red-650 text-white hover:bg-red-600 rounded-xl font-bold text-xs cursor-pointer bg-red-600 border-none"
            >
              مفهوم وموافق، الرجوع للخلف ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center p-4 z-50 animate-fade-in text-right font-sans overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" style={{ borderColor: theme.border }}>
        
        {/* Modal Top Ribbon Header */}
        <div className="p-5 border-b border-slate-850 flex items-center justify-between bg-slate-900/40 relative">
          <div className="absolute right-4 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/15 text-amber-500 rounded-2xl">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[9px] bg-amber-500/10 text-amber-500 font-extrabold px-2 py-0.5 rounded">الذكاء التوليدي سهم AI 🪄</span>
              <h3 className="text-sm font-black text-white mt-1">صانع الكتالوجات والبطاقات الترويجية الذكي ✨📱</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 hidden md:inline">صلاحية المستخدم: <strong className="text-emerald-400">{userRole}</strong></span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="bg-slate-900/50 p-3 px-6 border-b border-slate-850 flex items-center justify-center gap-2 md:gap-10 text-xs">
          {[
            { id: "select", label: "١. اختيار المنتجات 📦" },
            { id: "settings", label: "٢. نوع وتنسيق الكتالوج 📐" },
            { id: "generate", label: "٣. توليد ومراجعة محتوى AI 🪄" },
            { id: "export", label: "٤. تصدير ومشاركة الأوراق 📢" }
          ].map((s) => {
            const isCompleted = ["export", "generate", "settings"].indexOf(currentStep) > ["export", "generate", "settings"].indexOf(s.id as any);
            const isActive = currentStep === s.id;
            return (
              <div 
                key={s.id} 
                className={`flex items-center gap-1.5 font-bold ${
                  isActive 
                    ? "text-amber-505 border-b-2 border-amber-500 pb-1 font-black" 
                    : isCompleted 
                    ? "text-emerald-450" 
                    : "text-gray-650"
                }`}
                style={{ color: isActive ? theme.accent : isCompleted ? "#529b63" : "" }}
              >
                {isCompleted && <Check className="w-3.5 h-3.5" />}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Scrollable Container Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ======================= STEP 1: SELECT PRODUCTS ======================= */}
          {currentStep === "select" && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs leading-normal">
                👋 أهلاً بك في <strong>صانع الكتالوجات الذكي</strong>. حدد المنتجات أو التصنيف العام بالأسفل ليتكفل الذكاء الاصطناعي بصياغة بطاقات واتساب وإنستغرام وعروض أسعار تجارية بلمح البصر!
              </div>

              {/* Bulk selector tags cloud */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-gray-400 font-extrabold ml-1">تحديد سريع للأصناف:</span>
                <button 
                  onClick={() => handleSelectBulk("all")}
                  className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg text-[10.5px] font-bold border border-slate-800 cursor-pointer"
                >
                  تحديد الكل (تضمين كافة البضائع)
                </button>
                <button 
                  onClick={() => handleSelectBulk("none")}
                  className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-gray-350 hover:text-white rounded-lg text-[10.5px] font-bold border border-slate-800 cursor-pointer"
                >
                  إلغاء التحديد الكلي
                </button>
                <button 
                  onClick={() => handleSelectBulk("low_stock")}
                  className="py-1 px-3 bg-rose-950/45 hover:bg-rose-900/60 text-rose-450 rounded-lg text-[10.5px] font-bold border border-rose-900/30 cursor-pointer flex items-center gap-1"
                >
                  <span>كافة الكميات منخفضة المخزون (&lt;50) ⚠️</span>
                </button>
                <button 
                  onClick={() => handleSelectBulk("best_seller")}
                  className="py-1 px-3 bg-teal-950/45 hover:bg-teal-900/60 text-teal-450 rounded-lg text-[10.5px] font-bold border border-teal-900/30 cursor-pointer flex items-center gap-1"
                >
                  <span>كافة السلع الأكثر مبيعاً ورواجاً 🏆</span>
                </button>
              </div>

              {/* Selection with search and category list filter wrapper */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-850 bg-slate-900/30">
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto">
                  {categoriesList.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategoryFilter(cat);
                        if (cat !== "all") {
                          handleSelectBulk("category", cat);
                        }
                      }}
                      className={`text-[10.5px] py-1.5 px-3 rounded-lg font-black shrink-0 cursor-pointer ${selectedCategoryFilter === cat ? "bg-amber-500 text-black" : "bg-slate-950 text-gray-400 hover:text-white"}`}
                    >
                      {cat === "all" ? "تصفية: جميع الفئات" : `تصنيف: ${cat}`}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو باركود SKU لتوجيه دقيق..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs rounded-xl py-2 pl-4 pr-9 border border-slate-800 bg-slate-950 text-white outline-none focus:border-amber-500 text-right font-sans font-bold"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Selected counter banner */}
              <div className="p-3 px-4 bg-slate-900 rounded-xl flex items-center justify-between text-xs border border-slate-850">
                <span className="text-gray-450">مجموع الأصناف المحددة للكتالوج الترويجي:</span>
                <strong className="text-amber-505 text-sm font-black font-mono bg-amber-500/10 px-3 py-1 rounded inline-block" style={{ color: theme.accent }}>
                  {selectedProducts.length} منتجات ممتازة
                </strong>
              </div>

              {/* Grid selectors list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredProductsToSelect.map(p => {
                  const isChecked = selectedProducts.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleProductSelection(p.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${isChecked ? "bg-amber-950/20 border-amber-500/85 ring-1 ring-amber-500/25" : "bg-slate-950/80 border-slate-850 hover:border-slate-800"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? "bg-amber-500 border-amber-500" : "border-slate-700 bg-slate-900"}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                        
                        {p.image ? (
                          <img 
                            src={p.image.startsWith("data:") && p.image.includes("[مضغوطة]") ? "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200" : p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}

                        <div className="text-right">
                          <span className="text-xs font-black text-white hover:text-amber-400 block">{p.name}</span>
                          <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">رمز SKU: {p.sku} | السعر: <span className="font-mono text-emerald-400">{p.price} ر.س</span></span>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.stock < 50 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                          {p.stock} قطعة بالفرع
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProductsToSelect.length === 0 && (
                <div className="py-12 border border-slate-850 bg-slate-950 rounded-2xl text-center text-xs text-gray-400">
                  ⚠️ لم يتم العثور على أي كروت تطابق خيار الفلترة أو الحصر والبحث الحالي.
                </div>
              )}
            </div>
          )}

          {/* ======================= STEP 2: CATALOG FORMATS & SETTINGS ======================= */}
          {currentStep === "settings" && (
            <div className="space-y-6 animate-fade-in pb-4">
              <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl text-xs text-right leading-relaxed text-gray-300">
                ✨ هاهنا، ممر إعداد هيكل الكتالوج وقنوات تواصل الدعاية والتصميم والمظهر لإبهار المستهلكين بالمرحلة القادمة.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Right col: Form settings */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-amber-500 pb-2 border-b border-slate-850">● هيدر وعنوان الكتالوج الإعلاني</h4>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-300">• العنوان الرئيسي للكتّيب / العرض:</label>
                    <input
                      type="text"
                      value={catalogTitle}
                      onChange={(e) => setCatalogTitle(e.target.value)}
                      placeholder="أدخل عنواناً جذاباً مثل: تشكيلة مراسيم الطيب الرويال للعام الجديد..."
                      className="w-full text-xs rounded-xl py-3 px-3.5 border border-slate-800 bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <h4 className="text-xs font-black text-amber-500 pb-2 border-b border-slate-850 pt-2">● قوالب النشر والنماذج المستهدفة (نوع مخرجات الكتالوج)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "pdf", label: "📄 ملف PDF المتناظر للطباعة (A4)", sub: "كتالوج إلكتروني متكامل وقابل للتحميل والتخزين" },
                      { id: "images", label: "🖼️ صور الكروت واللوحات الإعلانية", sub: "بطاقات إعلانية مستقلة مفرغة للنشر بالسوشيال" },
                      { id: "print", label: "🖨️ طباعة ورقية مباشرة للعملاء", sub: "ملائم للمعاينة والطباعة الفورية بمقاس A4 بالنظام" },
                      { id: "whatsapp", label: "💬 منشورات نصوص واتساب الذكية", sub: "معد للمشاركة النصية المصحوبة برموز QR وتفاصيل الخصم" }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setCatalogFormat(fmt.id as any)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                          catalogFormat === fmt.id 
                            ? "bg-amber-500/10 border-amber-500 text-amber-505" 
                            : "border-slate-850 bg-slate-950 hover:bg-slate-900"
                        }`}
                      >
                        <span className="text-xs font-black block text-white">{fmt.label}</span>
                        <span className="text-[8.5px] text-gray-500 block mt-1 leading-normal">{fmt.sub}</span>
                      </button>
                    ))}
                  </div>

                  <h4 className="text-xs font-black text-amber-500 pb-2 border-b border-slate-850 pt-2">● لغة الكتابة والتوليد</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "ar", label: "العربية الفصحى (مطعم بالخليجي)" },
                      { id: "en", label: "English" },
                      { id: "bilingual", label: "ثنائي اللغة (Ar+En)" }
                    ].map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setCatalogLanguage(lang.id as any)}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          catalogLanguage === lang.id 
                            ? "bg-amber-550 bg-amber-500 text-black" 
                            : "border-slate-850 bg-slate-950 text-gray-400"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Left col: Visual Settings */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-amber-500 pb-2 border-b border-slate-850">● الأنماط وثيم المظهر العام</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "gold", label: "فاخر ذهبي (Royal Gold)", color: "from-amber-600 to-slate-900" },
                      { id: "white", label: "بسيط أبيض (White Luxe)", color: "from-slate-100 to-slate-300 text-slate-900" },
                      { id: "black", label: "أسود ملكي (Obsidian)", color: "from-black to-slate-950" },
                      { id: "green", label: "سعودي أخضر (Saudi Emerald)", color: "from-emerald-700 to-emerald-950" },
                      { id: "offers", label: "تخفيضات وعروض عاجلة", color: "from-red-650 to-red-950 bg-red-600" },
                      { id: "oud", label: "عطور وعود تراثي", color: "from-amber-900 to-yellow-950" },
                      { id: "food", label: "مأكولات وغذائية دافئة", color: "from-teal-900 to-stone-900" },
                      { id: "corporate", label: "كتالوج الجملة والشركات", color: "from-sky-700 to-slate-900" }
                    ].map((thm) => (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => setActiveTheme(thm.id as any)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
                          activeTheme === thm.id 
                            ? "border-amber-500" 
                            : "border-slate-850 bg-slate-950"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block text-white">{thm.label}</span>
                          <span className="text-[9px] text-gray-500 block mt-1">تطبيق المظهر الفني</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${thm.color} border border-slate-800 shrink-0`} />
                      </button>
                    ))}
                  </div>

                  <h4 className="text-xs font-black text-amber-500 pb-2 border-b border-slate-850 pt-2">● خيارة الـ Layout والمكونات الترويجية</h4>
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-900/40 border border-slate-850 text-xs">
                    
                    <div className="flex items-center justify-between border-b border-slate-850/80 pb-2">
                      <span className="text-gray-300 font-bold">• إدراج وعرض أسعار الأصناف:</span>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                        <button type="button" onClick={() => setPriceOption("with")} className={`py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer ${priceOption === "with" ? "bg-amber-500 text-black":"text-gray-400"}`}>مع أسعار</button>
                        <button type="button" onClick={() => setPriceOption("without")} className={`py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer ${priceOption === "without" ? "bg-amber-550 bg-amber-500 text-black":"text-gray-400"}`}>بدون أسعار</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-850/80 py-2">
                      <span className="text-gray-300 font-bold">• إظهار عداد المخزون المتبقي:</span>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                        <button type="button" onClick={() => setStockOption("show")} className={`py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer ${stockOption === "show" ? "bg-emerald-500 text-black":"text-gray-400"}`}>عرض المتوفر</button>
                        <button type="button" onClick={() => setStockOption("hide")} className={`py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer ${stockOption === "hide" ? "bg-amber-505 bg-amber-500 text-black":"text-gray-400"}`}>إخفاء المخزون</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-300 font-bold">• تضمين باركود ورمز الاستجابة QR:</span>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                        <button type="button" onClick={() => setQrOption("include")} className={`py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer ${qrOption === "include" ? "bg-amber-500 text-black":"text-gray-400"}`}>إدراج الرمز</button>
                        <button type="button" onClick={() => setQrOption("exclude")} className={`py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer ${qrOption === "exclude" ? "bg-amber-500 text-black":"text-gray-400"}`}>حجب الرمز</button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= STEP 3: PLAY GENERATION / LOADER ======================= */}
          {isGenerating && (
            <div className="py-12 flex flex-col justify-center items-center gap-5 text-center font-sans animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">جاري توليد صياغات الكتالوج الإعلانية بالذكاء الاصطناعي... 🪄</h3>
                <p className="text-xs text-gray-450 leading-relaxed max-w-md mx-auto">
                  يقوم محرك سهم AI الآن بتحليل المنتجات المحددة وتوليد أوضاع الكبائن والنصوص الترويجية الملائمة للواتساب والسوشيال ميديا.
                </p>
              </div>

              {/* Staggered detailed progress logs */}
              <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[10.5px] text-right space-y-1.5 h-44 overflow-y-auto text-gray-300">
                {generationLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1 items-start">
                    <span className="text-emerald-400 select-none">SahmAI&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= STEP 3: REVIEW & INLINE EDITING ======================= */}
          {currentStep === "generate" && !isGenerating && (
            <div className="space-y-6 animate-fade-in pb-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs flex justify-between items-center flex-wrap gap-2 text-right">
                <span className="text-gray-300 leading-normal">
                  🔥 <strong>تم استكمال التوليد السحري بنجاح!</strong> انقر على أي لوحة / بطاقة عطر إعلانية بالأسفل للقيام بـ <strong className="text-amber-500">مراجعتها وتعديلها فورياً</strong> وتعديل المزايا قبل مرحلة التصدير النهائية.
                </span>
                <span className="font-mono text-emerald-450 text-[10.5px] bg-slate-900 py-1 px-3 rounded font-black border border-slate-800">الحالة: مسودة جاهزة</span>
              </div>

              {/* Dynamic Theme Ribbon Banner */}
              <div className="p-3.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs bg-slate-900/20">
                <span className="text-gray-450">العنوان العام النشط: <strong className="text-white">{catalogTitle}</strong></span>
                <span className="text-gray-450">التنسيق المستهدف الحالي: <strong className="text-amber-505 font-black uppercase text-[10.5px]">{catalogFormat}</strong></span>
              </div>

              {/* Items presentation sheets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                {catalogItems.map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => handleOpenEditItem(index)}
                    className={`p-6 rounded-3xl border transition-all relative overflow-hidden group select-none hover:shadow-2xl flex flex-col justify-between gap-5 cursor-pointer max-w-full ${currentThemeClasses.bg}`}
                    style={{ borderWidth: "2px" }}
                  >
                    {/* Catalog item Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className={`text-[9px] uppercase font-mono tracking-wider font-extrabold px-2 py-0.5 rounded ${currentThemeClasses.badge}`}>
                          {item.category}
                        </span>
                        <h3 className={`text-sm font-black leading-snug mt-1 ${currentThemeClasses.heading}`}>
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-mono">باركود SKU: {item.sku}</p>
                      </div>

                      {/* Sorting and delete quick toolbar inside card */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveOrder(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-950 text-gray-400 hover:text-white hover:bg-slate-900 border-none cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(index, "down")}
                          disabled={index === catalogItems.length - 1}
                          className="p-1 rounded bg-slate-950 text-gray-400 hover:text-white hover:bg-slate-900 border-none cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCatalogItem(index)}
                          className="p-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 border-none cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Image and core characteristics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left col: Image and QR concept mock */}
                      <div className="md:col-span-1 space-y-2 flex flex-col justify-items-center">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full aspect-square rounded-2xl object-cover bg-black/40 border-none"
                          referrerPolicy="no-referrer"
                        />
                        {qrOption === "include" && (
                          <div className={`p-1.5 rounded-lg flex items-center justify-center bg-white border mx-auto ${currentThemeClasses.border}`}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://sahmerp.com/product/${item.sku}`} 
                              alt="QR code" 
                              className="w-12 h-12 inline-block object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right col: Description lines & bullet features */}
                      <div className="md:col-span-2 space-y-3">
                        <p className={`text-[11px] leading-relaxed font-sans ${currentThemeClasses.accText}`}>
                          {item.desc}
                        </p>
                        
                        {/* Features checklist bullets */}
                        <div className="space-y-1.5 pt-1">
                          {item.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex gap-1.5 items-start text-[10px]">
                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                              <span className="text-gray-400 leading-tight">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card footer metrics pricing */}
                    <div className="border-t pt-3 flex justify-between items-center flex-wrap gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      {priceOption === "with" ? (
                        <div className="flex items-baseline gap-2">
                          <span className={`text-sm ${currentThemeClasses.priceColor}`}>
                            {item.price} ر.س
                          </span>
                          {activeTheme === "offers" && item.originalPrice && (
                            <span className="text-[10px] text-gray-500 line-through font-mono">
                              {item.originalPrice} ر.س
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[9.5px] text-gray-500 font-bold">السعر: متوفر عند الدفع</div>
                      )}

                      {stockOption === "show" ? (
                        <span className="text-[9.5px] text-gray-500">
                          الكمية المتاحة: <strong className="text-white font-mono">{item.stock} قطع</strong>
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-450 font-bold font-sans">✓ نشط حياً بالـ ERP</span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 text-[8px] bg-sky-500/10 text-sky-400 font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      اضغط للتعديل 🖋️
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= EDIT MODAL OVERLAY (INLINE FOR STEP 3) ======================= */}
          {editingIndex !== null && (
            <div className="fixed inset-0 bg-black/90 flex justify-center items-center p-4 z-[60] animate-fade-in text-right">
              <div className="w-full max-w-lg rounded-2xl p-6 bg-slate-900 border border-slate-800 space-y-5 text-xs text-white">
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-amber-500">تعديل ومراجعة بطاقة الصنف بالكتالوج 🖋️</h3>
                    <p className="text-[9.5px] text-gray-400 leading-normal mt-0.5">يمكنك تغيير العناوين، الميزات، والوصف التسويقي الذكي وسعر الإعلان.</p>
                  </div>
                  <button onClick={() => setEditingIndex(null)} className="p-1 rounded-full hover:bg-slate-800 text-gray-400 border-none bg-transparent cursor-pointer">
                    ✕
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-300">• عنوان المنتج التسويقي بالكتالوج:</label>
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-300">• الوصف التسويقي المفسر والملهم:</label>
                    <textarea
                      rows={3}
                      value={editForm.desc || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, desc: e.target.value }))}
                      className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-slate-950 text-white outline-none focus:border-amber-500 text-right font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-300">• السعر المعروض (ر.س):</label>
                      <input
                        type="number"
                        value={editForm.price || 0}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-700 bg-slate-950 text-white outline-none text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-300">• السعر الأصلي قبل الخصم (ر.س):</label>
                      <input
                        type="number"
                        value={editForm.originalPrice || 0}
                        onChange={(e) => setEditForm(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs rounded-lg py-2.5 px-3 border border-slate-705 bg-slate-950 text-white outline-none text-center font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-300">• رابط صورة المنتج التوضيحية:</label>
                    <input
                      type="text"
                      value={editForm.image || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full text-xs rounded-lg py-2 px-3 border border-slate-700 bg-slate-950 text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-300">• الميزات البليغة المستهدفة (3 بنود كحد أقصى):</label>
                    <div className="space-y-1.5">
                      {[0, 1, 2].map((idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`الميزة رقم ${idx + 1}`}
                          value={editForm.features?.[idx] || ""}
                          onChange={(e) => {
                            const f = [...(editForm.features || [])];
                            f[idx] = e.target.value;
                            setEditForm(prev => ({ ...prev, features: f }));
                          }}
                          className="w-full text-[10.5px] rounded-lg py-2 px-3 border border-slate-800 bg-slate-950 text-white outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Custom text template editable */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-300">• محتوى نص رسالة الـ WhatsApp المولد تلقائياً:</label>
                    <textarea
                      rows={4}
                      value={editForm.whatsapp_text || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp_text: e.target.value }))}
                      className="w-full text-[10.5px] rounded-lg py-2 px-3 border border-slate-700 bg-slate-950 text-white outline-none font-sans"
                    />
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="syncDbCheck"
                      checked={syncToDb}
                      onChange={(e) => setSyncToDb(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                    />
                    <label htmlFor="syncDbCheck" className="text-[10px] text-gray-300 cursor-pointer select-none">
                      تطبيق وتحديث هذه البيانات الدقيقة وتعديل المسمى/الأسعار أيضاً في <strong>الأصل والـ ERP</strong> العام.
                    </label>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleSaveItemEdit}
                    type="button"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 font-black text-black text-xs rounded-xl cursor-pointer"
                  >
                    حفظ وتطبيق التغييرات ✓
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    type="button"
                    className="py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-gray-400 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    تراجع
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ======================= STEP 4: EXPORT & SHARE ======================= */}
          {currentStep === "export" && (
            <div className="space-y-6 animate-fade-in pb-4 text-right">
              
              {/* CSS Print Stylesheet injected precisely during export page presentation */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  /* Hide all default layout components */
                  body {
                    background: white !important;
                    color: #000000 !important;
                  }
                  #root, header, nav, footer, sidebar, .no-print, button, .lucide {
                    display: none !important;
                    visibility: hidden !important;
                  }
                  /* Expose ONLY the printable outer box */
                  #sahm-printable-catalog-outer-wrap, #sahm-printable-catalog-outer-wrap * {
                    visibility: visible !important;
                    display: block !important;
                  }
                  #sahm-printable-catalog-outer-wrap {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    background: white !important;
                    color: #000000 !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                }
              `}} />

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-xs leading-normal">
                🙌 تهانينا! أوراق وكتالوجات حملتك الترويجية لـ <strong>{catalogItems.length} سلع</strong> جاهزة تماماً بكافة أشكالها. اختر قنوات النشر والتصدير والتشغيل بالأسفل لدعم دورة مبيعات الكاشير الموحدة!
              </div>

              {/* Dynamic download links block */}
              {(downloadPdfUrl || downloadPngUrl) && (
                <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl space-y-3 text-right animate-fade-in no-print">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم إنشاء الكتالوج وتوليد الملفات بنجاح! جاهز تماماً للتشغيل والتحميل الفوري:</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {downloadPdfUrl && (
                      <a
                        href={downloadPdfUrl}
                        download={downloadPdfName}
                        className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl inline-flex items-center gap-2 border-none cursor-pointer transition-all active:scale-95 no-underline shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>تم إنشاء الكتالوج — تحميل الملف PDF 📄</span>
                      </a>
                    )}
                    {downloadPngUrl && (
                      <a
                        href={downloadPngUrl}
                        download={downloadPngName}
                        className="py-2.5 px-5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl inline-flex items-center gap-2 border-none cursor-pointer transition-all active:scale-95 no-underline shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>تم إنشاء الكتالوج — تحميل الملف PNG 🖼️</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visual live layout preview card */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between no-print">
                    <span className="text-xs font-black text-white">👁️ معاينة شكل أوراق الكتالوج الفني المستهدفة:</span>
                    <button 
                      onClick={() => {
                        triggerNotification("جاري تهيئة معالج الطباعة الفورية... 🖨️", "info");
                        window.print();
                      }} 
                      className="py-1 px-3 text-[10.5px] bg-slate-900 text-amber-400 border border-slate-800 hover:bg-slate-800 rounded-lg font-black flex items-center gap-1.5 cursor-pointer no-print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>معاينة وتصدير الطباعة الفورية 🖨️</span>
                    </button>
                  </div>

                  {/* 📥 ACTUAL DOWNLOAD ACTION RIBBONS FOR TRUE EXPORTS */}
                  {downloadPdfUrl && (
                    <div className="p-4 bg-emerald-505/10 bg-slate-900/60 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right animate-fade-in no-print">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">✓ تم تجهيز الكتالوج بصيغة PDF بنجاح! 📜</span>
                        <span className="text-[10px] text-gray-400 block leading-relaxed">الملف متاح للتحميل الفوري على القرص الصلب لديك بجودة طباعة A4 دقيقة ومتطابقة الأبعاد.</span>
                      </div>
                      <a 
                        href={downloadPdfUrl} 
                        download={downloadPdfName || "كتالوج_سهم_المعتمد.pdf"}
                        className="p-2 px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer no-print flex items-center justify-center gap-1 shrink-0 select-none border-none text-center"
                      >
                        📥 تنزيل ملف PDF الفعلي
                      </a>
                    </div>
                  )}

                  {downloadPngUrl && (
                    <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right animate-fade-in no-print">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1">✓ تم توليد بطاقة الكتالوج الشامل بصيغة PNG! 🖼️</span>
                        <span className="text-[10px] text-gray-400 block leading-relaxed">الصورة الترويجية المجمعة من نفس لوحة العرض جاهزة لمشاركتها فورياً في منصات التواصل أو الاحتفاظ بها.</span>
                      </div>
                      <a 
                        href={downloadPngUrl} 
                        download={downloadPngName || "بطاقات_سهم_المعتمدة.png"}
                        className="p-2 px-5 bg-amber-500 hover:bg-amber-450 text-black font-black text-xs rounded-xl transition-all cursor-pointer no-print flex items-center justify-center gap-1 shrink-0 select-none border-none text-center"
                      >
                        🖼️ تنزيل بطاقة PNG الفعلية
                      </a>
                    </div>
                  )}

                  {/* Outer Wrap target for clean print stylesheet */}
                  <div id="sahm-printable-catalog-outer-wrap" className="w-full">
                    <CatalogPreview
                      ref={catalogRef}
                      catalogTitle={catalogTitle}
                      catalogLanguage={catalogLanguage}
                      catalogItems={catalogItems}
                      activeTheme={activeTheme}
                      currentThemeClasses={currentThemeClasses}
                      priceOption={priceOption}
                      stockOption={stockOption}
                    />
                  </div>
                </div>

                {/* Vertical Export actions toolbar list */}
                <div className="space-y-4 no-print">
                  <h4 className="text-xs font-black text-amber-500 pb-2 border-b border-slate-850">● تنشيط ونشر كتيبك الترويجي</h4>
                  
                  {/* Whatsapp export line */}
                  <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/20 text-xs space-y-3">
                    <span className="font-extrabold text-teal-400 block">• تفعيل ونشر عبر الواتساب (WhatsApp Cloud):</span>
                    <p className="text-[10px] text-gray-400 leading-normal">يقوم بنسخ الصيغة المولد وتوجيه المحتوى في رسائل الدردشة أو الاستوري والقروبات مباشرة بنقرة واحدة.</p>
                    
                    <button
                      onClick={() => handleWhatsAppShare(catalogItems[0])}
                      className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black font-sans rounded-xl text-center cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>مشاركة الورقة الأولى عبر الواتساب 💬</span>
                    </button>
                  </div>

                  {/* Save to media center & system documents */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs space-y-3">
                    <span className="font-extrabold text-amber-400 block">• الحفظ الدائم لوسائط الـ ERP:</span>
                    <p className="text-[10px] text-gray-400 leading-normal">تصدير اللوحة كشعار/منشور فني وتخزينها واستيرادها بمركز سهم للملفات لاستخدامها في الكاشير والفواتير.</p>
                    
                    <button
                      onClick={handleExportImagesReal}
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-extrabold rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-yellow-500" />
                      <span>تنزيل وصناعة صور الكتالوج (PNG) 🖼️💾</span>
                    </button>
                  </div>

                  {/* Standard file download items */}
                  <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-850 text-xs space-y-3">
                    <span className="font-extrabold text-white block">• تصدير وتنزيل الملفات المحلية:</span>
                    
                    <div className="space-y-2">
                      <button
                        onClick={handleExportPdfReal}
                        className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 border-none text-white font-bold rounded-xl text-center cursor-pointer text-xs flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>تصدير PDF المتناظر للطباعة (A4) 📄</span>
                      </button>

                      <button
                        onClick={handleSaveWholeCatalogToMedia}
                        className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border-none text-black font-extrabold rounded-xl text-center cursor-pointer text-xs flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>حفظ الكتالوج في مكتبة الوسائط 📁💾</span>
                      </button>

                      <button
                        onClick={handleSaveAsDraft}
                        className="w-full py-2 px-3 bg-slate-950 border border-slate-850 text-gray-300 hover:text-white rounded-xl text-center cursor-pointer text-xs flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5 text-sky-400" />
                        <span>حفظ المسودة ككتالوج نشط بالبرنامج 💾</span>
                      </button>
                    </div>
                  </div>

                  {/* Audit logs timeline link indicator */}
                  <div className="p-3 rounded-xl bg-slate-950 text-[9px] text-gray-400 space-y-1 border border-slate-900 leading-normal">
                    <div className="flex gap-1 text-emerald-400 items-center font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>تم توثيق الكتالوج بسجل النشاطات 📅</span>
                    </div>
                    <p>تم تعليق بطاقة التدبير والتسويق لعدد {catalogItems.length} بضائع على الخطوط الزمنية المخصصة للمراجعة الإدارية.</p>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom control buttons ribbon */}
        <div className="p-5 border-t border-slate-850 bg-slate-950 flex justify-between items-center flex-wrap gap-3">
          
          {/* Left corner: back or close buttons */}
          <div>
            {currentStep === "select" && (
              <button
                onClick={onClose}
                className="py-2.5 px-6 border border-slate-800 text-gray-400 hover:text-white bg-slate-900 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                إغلاق وإيقاف المعالج
              </button>
            )}

            {currentStep === "settings" && (
              <button
                onClick={() => setCurrentStep("select")}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق: اختيار السلع</span>
              </button>
            )}

            {currentStep === "generate" && (
              <button
                onClick={() => setCurrentStep("settings")}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                disabled={isGenerating}
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق: تعديل التنسيقات</span>
              </button>
            )}

            {currentStep === "export" && (
              <button
                onClick={() => setCurrentStep("generate")}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق: كبائن الـ AI</span>
              </button>
            )}
          </div>

          {/* Right corner: Next step triggers */}
          <div>
            {currentStep === "select" && (
              <button
                onClick={() => {
                  if (selectedProducts.length === 0) {
                    triggerNotification("⚠️ يرجى تحديد سلع ومنتجات أولاً للمتابعة.", "alert");
                    return;
                  }
                  setCurrentStep("settings");
                }}
                className="py-2.5 px-6 bg-amber-505 hover:bg-amber-400 text-black font-black rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5 bg-amber-500"
              >
                <span>المتابعة لاختيار التنسيق</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === "settings" && (
              <button
                onClick={handleStartGeneration}
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs cursor-pointer transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>صناعة الكتالوج بالذكاء الاصطناعي 🪄✨</span>
              </button>
            )}

            {currentStep === "generate" && (
              <button
                onClick={() => setCurrentStep("export")}
                className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>الذهاب لصفحة التصدير والمشاركة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === "export" && (
              <button
                onClick={() => {
                  triggerNotification("🎉 تم إنهاء كتيب الكتالوج واللوحة بنجاح رائع!", "success");
                  onClose();
                }}
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs cursor-pointer transition-all"
              >
                إنهاء المعالج وإغلاق النافذة ✓
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// ======================= SINGLE SOURCE OF TRUTH CATALOG PREVIEW =======================
interface CatalogPreviewProps {
  catalogTitle: string;
  catalogLanguage: string;
  catalogItems: CatalogGenerationItem[];
  activeTheme: string;
  currentThemeClasses: any;
  priceOption: string;
  stockOption: string;
}

const CatalogPreview = React.forwardRef<HTMLDivElement, CatalogPreviewProps>(({
  catalogTitle,
  catalogLanguage,
  catalogItems,
  activeTheme,
  currentThemeClasses,
  priceOption,
  stockOption
}, ref) => {
  return (
    <div 
      ref={ref}
      id="sahm-printable-catalog-inner" 
      className={`p-8 rounded-3xl border space-y-6 ${currentThemeClasses.bg}`} 
      style={{ 
        borderWidth: "2px", 
        direction: "rtl", 
        textAlign: "right",
        fontFamily: "'Tajawal', 'Cairo', 'Inter', system-ui, sans-serif" 
      }}
      dir="rtl"
    >
      {/* Catalog Custom Header Banner inside Preview */}
      <div 
        className="border-b pb-4 flex justify-between items-center" 
        style={{ borderColor: activeTheme === "white" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }}
      >
        <div>
          <h2 className={`text-lg font-black ${currentThemeClasses.heading}`}>{catalogTitle}</h2>
          <p className="text-[10px] text-gray-500 font-sans">العلامة التجارية: سهم النخبة الموحد • {new Date().toLocaleDateString("ar-SA")}</p>
        </div>
        <div className="text-left no-print">
          <span className={`text-[9.5px] uppercase font-mono font-black ${currentThemeClasses.badge}`}>
            {catalogLanguage === "ar" ? "اللغة: العربية" : catalogLanguage === "en" ? "English Version" : "بين الثقافات Ar/En"}
          </span>
        </div>
      </div>

      <div className="space-y-6 divide-y divide-slate-800/15">
        {catalogItems.map((item, index) => (
          <div key={index} className="pt-4 flex flex-col md:flex-row gap-5 items-start">
            <img src={item.image} alt={item.title} className="w-24 h-24 rounded-2xl object-cover bg-black/40 border-none shrink-0" referrerPolicy="no-referrer" />
            <div className="space-y-2 w-full text-right">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${currentThemeClasses.badge}`}>{item.category}</span>
              <h4 className={`text-sm font-black ${currentThemeClasses.heading}`}>{item.title}</h4>
              <p className={`text-xs leading-relaxed ${currentThemeClasses.accText}`}>{item.desc}</p>
              
              {/* 🌸 المميزات الإعلانية للمنتج */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[8.5px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">✓ عالي الجودة والموثوقية ومعزز بالكامل</span>
                <span className="text-[8.5px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✓ تغليف فاخر مخصص للهدايا</span>
                <span className="text-[8.5px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">✓ ضمان سهم المعتمد لمدة سنتين</span>
              </div>

              <div className={`flex flex-wrap gap-4 text-[10.5px] pt-1.5 ${activeTheme === "white" ? "text-slate-500" : "text-gray-400"}`}>
                {priceOption === "with" && (
                  <span>السعر: <strong className={currentThemeClasses.priceColor}>{item.price} ر.س</strong> {activeTheme === "offers" && item.originalPrice && <span className="line-through text-gray-500 font-mono text-[9px]">{item.originalPrice} ر.س</span>}</span>
                )}
                <span>رمز SKU: {item.sku}</span>
                {stockOption === "show" && <span>الكمية: {item.stock} وحدات</span>}
              </div>

              {/* 🏬 بيانات المتجر المعتمد */}
              <div className="border-t border-dashed border-gray-800/20 pt-1.5 mt-1 flex flex-wrap items-center gap-2 text-[9px] text-gray-450 leading-none">
                <span className="font-bold">🏬 المتجر والمشغل المعتمد:</span>
                <span>سهم النخبة الموحد للتجارة</span>
                <span className="text-gray-600">•</span>
                <span>الرقم الموحد: 920033033</span>
                <span className="text-gray-600">•</span>
                <span>الرقم الضريبي الموحد: 302004509800003</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 text-center text-[9px] text-gray-500" style={{ borderColor: activeTheme === "white" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)" }}>
        صُمّم وصيغ تلقائياً تحت إهداء برعاية منصة سهم الرقمية المعتمدة 👑
      </div>
    </div>
  );
});

CatalogPreview.displayName = "CatalogPreview";

