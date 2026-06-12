import React from "react";
import * as Lucide from "lucide-react";

// Normalizes kebab-case ("layout-dashboard") to PascalCase ("LayoutDashboard") for Lucide
export function kebabToPascal(str: string): string {
  if (!str) return "";
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Default system-wide fallback module icons mapping
export const DEFAULT_MODULE_ICONS: Record<string, string> = {
  sahm_brand_logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><defs><linearGradient id="goldTop" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFEFA6" /><stop offset="50%" stop-color="#D4AF37" /><stop offset="100%" stop-color="#A17A16" /></linearGradient><linearGradient id="goldSide" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B88E23" /><stop offset="100%" stop-color="#6E5005" /></linearGradient><linearGradient id="glowRing" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D4AF37" stop-opacity="0.8" /><stop offset="100%" stop-color="#8E6F1B" stop-opacity="0.1" /></linearGradient><filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-color="#000" flood-opacity="0.65" /></filter></defs><circle cx="50" cy="50" r="42" stroke="url(#glowRing)" stroke-width="2" stroke-dasharray="160 40" style="transform-origin: center; animation: spin 20s linear infinite;" /><circle cx="50" cy="50" r="38" stroke="url(#glowRing)" stroke-width="0.75" opacity="0.3" /><g filter="url(#shadow3d)"><path d="M22 62 L42 42 L52 48 L80 20 L80 40 L70 42 L65 38 L42 58 L46 62 Z" fill="#4B3B0A" /><path d="M22 60 L42 40 L42 44 L22 64 Z" fill="url(#goldSide)" /><path d="M42 40 L52 46 L52 50 L42 44 Z" fill="url(#goldSide)" opacity="0.8" /><path d="M52 46 L80 18 L80 22 L52 50 Z" fill="url(#goldSide)" /><path d="M80 18 L80 38 L76 38 L80 18 Z" fill="url(#goldSide)" /><path d="M22 60 L42 40 L52 46 L80 18 L80 38 L72 39 L66 35 L42 56 L46 60 Z" fill="url(#goldTop)" /><path d="M23 60 L42 41 L52 47 L78 20" fill="none" stroke="#FFF" stroke-width="0.75" opacity="0.6" stroke-linecap="round" /><circle cx="52" cy="46" r="2.5" fill="#FFEFA6" /><circle cx="52" cy="46" r="1.5" fill="#FFF" /></g></svg>`,
  dashboard: "LayoutDashboard",
  product_studio: "Sparkles",
  sales_commerce: "ShoppingBag",
  operations: "Truck",
  marketing_growth: "TrendingUp",
  intelligence_analytics: "Brain",
  automation_integration: "Cpu",
  management_settings: "Settings",
  command_center: "Bot",
  system_clients: "ShieldCheck",
  intelligent_hub: "Sparkles",
  facility_setup: "Landmark",
  store_management: "Building",
  setup_organizations: "Building",
  products: "Package",
  inventory: "Boxes",
  pos: "Receipt",
  pos_and_operations: "Store",
  integrations: "Link",
  financial_hub: "Landmark",
  reports: "BarChart3",
  help: "HelpCircle",
  hr: "Users",
  human_resources: "Users",
  settings: "Settings"
};

// Ready-made icons library with Arabic descriptions for picker selection
export const AVAILABLE_LIBRARY_ICONS = [
  { name: "LayoutDashboard", kebab: "layout-dashboard", label: "كابينة قيادة (LayoutDashboard)", category: "عام" },
  { name: "Bot", kebab: "bot", label: "مساعد ذكي (Bot)", category: "ذكاء اصطناعي" },
  { name: "Sparkles", kebab: "sparkles", label: "منصة ذكية (Sparkles)", category: "ذكاء اصطناعي" },
  { name: "Boxes", kebab: "boxes", label: "مخزون وبضائع (Boxes)", category: "مخازن" },
  { name: "Package", kebab: "package", label: "شحنات ومنتجات (Package)", category: "مخازن" },
  { name: "Store", kebab: "store", label: "متجر فرعي (Store)", category: "مبيعات" },
  { name: "Receipt", kebab: "receipt", label: "فاتورة مبيعات (Receipt)", category: "مبيعات" },
  { name: "FileText", kebab: "file-text", label: "مستند تقرير (FileText)", category: "مالية" },
  { name: "Landmark", kebab: "landmark", label: "منظومة مالية (Landmark)", category: "مالية" },
  { name: "Building", kebab: "building", label: "منشأة تجارية (Building)", category: "فروع" },
  { name: "MapPin", kebab: "map-pin", label: "موقع فرع (MapPin)", category: "فروع" },
  { name: "Users", kebab: "users", label: "موارد بشرية (Users)", category: "إدارة" },
  { name: "Link", kebab: "link", label: "ربط وتكامل (Link)", category: "عام" },
  { name: "BarChart3", kebab: "bar-chart-3", label: "رسم بياني للتقارير (BarChart3)", category: "إحصائيات" },
  { name: "HelpCircle", kebab: "help-circle", label: "دعم فني ومساعدة (HelpCircle)", category: "عام" },
  { name: "Settings", kebab: "settings", label: "قائمة إعدادات (Settings)", category: "عام" },
  { name: "Truck", kebab: "truck", label: "تموين وموردين (Truck)", category: "مخازن" },
  { name: "Database", kebab: "database", label: "قاعدة بيانات (Database)", category: "مالية" },
  { name: "Layers", kebab: "layers", label: "طبقات وأقسام (Layers)", category: "عام" },
  { name: "Sliders", kebab: "sliders", label: "لوحة تحكم (Sliders)", category: "عام" },
  { name: "Zap", kebab: "zap", label: "مؤشر فوري (Zap)", category: "إحصائيات" },
  { name: "Activity", kebab: "activity", label: "نشاط فوري (Activity)", category: "إحصائيات" },
  { name: "Bell", kebab: "bell", label: "تنبيهات (Bell)", category: "عام" },
];

/**
 * Loads Custom Icons from localStorage.
 */
export function getSavedCustomIcons(): Record<string, string> {
  try {
    const saved = localStorage.getItem("sahm_custom_icons_config");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading custom icons metadata:", e);
  }
  return {};
}

/**
 * Saves Custom Icon selection for a specific moduleId.
 */
export function saveCustomIcon(moduleId: string, iconValue: string): void {
  try {
    const current = getSavedCustomIcons();
    current[moduleId] = iconValue;
    localStorage.setItem("sahm_custom_icons_config", JSON.stringify(current));
    // Dispatch global event so all instances update immediately
    window.dispatchEvent(new CustomEvent("sahm_icons_updated", { detail: { moduleId, iconValue } }));
  } catch (e) {
    console.error("Error saving custom icon selection:", e);
  }
}

/**
 * Resets Custom Icon selection for a specific moduleId (back to default).
 */
export function resetCustomIcon(moduleId: string): void {
  try {
    const current = getSavedCustomIcons();
    delete current[moduleId];
    localStorage.setItem("sahm_custom_icons_config", JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("sahm_icons_updated", { detail: { moduleId, iconValue: null } }));
  } catch (e) {
    console.error("Error resetting custom icon selection:", e);
  }
}

/**
 * Retrieves the currently active icon value for a moduleId.
 */
export function getActiveIconValue(moduleId: string): string {
  const customList = getSavedCustomIcons();
  if (customList[moduleId]) {
    return customList[moduleId];
  }
  return DEFAULT_MODULE_ICONS[moduleId] || "HelpCircle";
}

interface CustomIconRendererProps {
  moduleId: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackIconName?: string; // Optional hard fallback
  iconSizeClass?: string;    // Override default size if needed (e.g. "w-5 h-5")
}

/**
 * Highly powerful React Component that dynamic-renders:
 * 1. Base64 / HTTP custom uploaded Image
 * 2. Raw SVG code
 * 3. Lucide element resolved dynamic string
 * 4. Fallback default matching icon
 */
export const CustomIconRenderer: React.FC<CustomIconRendererProps> = ({
  moduleId,
  className = "w-4 h-4 shrink-0",
  style,
  fallbackIconName,
  iconSizeClass
}) => {
  // Listen to updates using state
  const [iconValue, setIconValue] = React.useState(() => getActiveIconValue(moduleId));

  React.useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail && (ev.detail.moduleId === moduleId || !ev.detail.moduleId)) {
        setIconValue(getActiveIconValue(moduleId));
      }
    };
    window.addEventListener("sahm_icons_updated", handleUpdate);
    return () => window.removeEventListener("sahm_icons_updated", handleUpdate);
  }, [moduleId]);

  const targetIcon = iconValue || fallbackIconName || DEFAULT_MODULE_ICONS[moduleId] || "HelpCircle";

  // Check if it is a URL or Base64 (starts with http or data:)
  if (targetIcon.startsWith("http") || targetIcon.startsWith("data:")) {
    const hasObjectFit = className.includes("object-cover") || className.includes("object-fill") || className.includes("object-scale-down") || className.includes("object-none") || className.includes("object-contain");
    return (
      <img
        src={targetIcon}
        alt={`${moduleId} icon`}
        className={`${className} ${iconSizeClass || ""} ${hasObjectFit ? "" : "object-contain"}`}
        style={style}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Check if it is inline SVG markup
  if (targetIcon.trim().toLowerCase().startsWith("<svg")) {
    return (
      <div 
        className={`${className} ${iconSizeClass || ""} flex items-center justify-center`}
        style={style}
        dangerouslySetInnerHTML={{ __html: targetIcon }}
      />
    );
  }

  // Otherwise, match Lucide icon dynamically
  const normalizedName = kebabToPascal(targetIcon);
  const ImgIcon = (Lucide as any)[normalizedName] || (Lucide as any)[targetIcon] || Lucide.HelpCircle;

  return <ImgIcon className={`${className} ${iconSizeClass || ""}`} style={style} />;
};
