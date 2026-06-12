/**
 * Safe Storage helper to prevent localStorage QuotaExceededError when storing large files
 * (like generated PDF base64 streams or high-resolution canvas data URI templates).
 * Automatically caches large elements in-memory for the current browser session.
 */

const LARGE_FILE_THRESHOLD = 50000; // 50KB

const getMemoryCache = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  if (!(window as any).__sahm_file_url_cache) {
    (window as any).__sahm_file_url_cache = {};
  }
  return (window as any).__sahm_file_url_cache;
};

export interface MediaFile {
  id: string;
  name: string;
  type: "image" | "pdf" | "qr" | "logo";
  category: "product" | "documents" | "templates";
  url: string;
  size: string;
  date: string;
}

/**
 * Loads media files safely from localStorage, merging them with the high-resolution memory cache if available.
 */
export function getMediaCenterFiles(): MediaFile[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("sahm_media_center_files");
    
    // Create base default files if store is clean
    if (!raw) {
      return [
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
          date: "٢٠٢٦/٠٥/١5"
        }
      ];
    }
    
    const parsed: MediaFile[] = JSON.parse(raw);
    const cache = getMemoryCache();
    
    return parsed.map((file) => {
      if (file.id && cache[file.id]) {
        return { ...file, url: cache[file.id] };
      }
      return file;
    });
  } catch (err) {
    console.error("Error reading media files:", err);
    return [];
  }
}

/**
 * Saves media files safely by stripping large Base64 URLs, caching them in memory,
 * and storing light placeholder values to localStorage.
 */
export function saveMediaCenterFiles(files: MediaFile[]): void {
  try {
    if (typeof window === "undefined") return;
    const cache = getMemoryCache();
    
    const optimizedFiles = files.map((file) => {
      // If the url is a large Base64 representation (typically generated catalog previews or loaded assets)
      if (typeof file.url === "string" && file.url.startsWith("data:") && file.url.length > LARGE_FILE_THRESHOLD) {
        // Intact caching in-memory
        cache[file.id] = file.url;
        
        // Return thin object to prevent Quota Exceeded error
        if (file.type === "image") {
          return {
            ...file,
            // Fallback placeholder image URL
            url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200"
          };
        } else {
          return {
            ...file,
            url: "#"
          };
        }
      }
      return file;
    });
    
    localStorage.setItem("sahm_media_center_files", JSON.stringify(optimizedFiles));
  } catch (err: any) {
    console.warn("Storage Quota Exceeded during main write. Engaging recovery filter...", err);
    
    // Recovery path: if somehow writing still fails, try trimming files cache forcefully
    try {
      const criticallyOptimized = files.slice(0, 10).map((file) => {
        if (typeof file.url === "string" && file.url.startsWith("data:")) {
          return {
            ...file,
            url: file.type === "image" 
              ? "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200" 
              : "#"
          };
        }
        return file;
      });
      localStorage.setItem("sahm_media_center_files", JSON.stringify(criticallyOptimized));
    } catch (fallbackErr) {
      console.error("Critical fallback save failure:", fallbackErr);
    }
  }
}
