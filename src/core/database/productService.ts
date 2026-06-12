import { Product } from "../../types";
import { SahmDatabaseService, freeUpLocalStorageSpace } from "./dbService";

const LS_KEY = "sahm_web_products";

const getMode = () => {
  const mode = import.meta.env.VITE_DATA_MODE;
  if (mode === "supabase" || mode === "production") return "production";
  return "demo";
};

export const productService = {
  getAll: async (activeStoreId?: string): Promise<Product[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.getProducts(activeStoreId);
    }
    // Demo Mode
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: Product[] = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter(p => !p.store_id || p.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<Product | null> => {
    const list = await productService.getAll();
    return list.find(p => p.id === id) || null;
  },

  create: async (item: Product): Promise<Product> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveProduct(item);
    }
    // Demo Mode
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: Product[] = saved ? JSON.parse(saved) : [];
      
      // Sanitize the product being added/updated before saving
      const sanitizedItem: Product = {
        ...item,
        backups: [],
        image: (item.image && item.image.startsWith("data:") && item.image.length > 30000)
          ? item.image.substring(0, 5000) + "...[مضغوطة]"
          : item.image,
        assets: Array.isArray(item.assets) ? item.assets.map(a => {
          if (a && a.url && a.url.startsWith("data:") && a.url.length > 20000) {
            return { ...a, url: a.url.substring(0, 2000) + "...[مضغوطة]" };
          }
          return a;
        }) : item.assets
      };

      const filtered = list.filter(p => p.id !== item.id);
      filtered.unshift(sanitizedItem);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      } catch (e: any) {
        if (e.name === "QuotaExceededError" || e.code === 22) {
          console.warn("Storage full in productService.create! Cleaning backups and truncating huge imagery...");
          freeUpLocalStorageSpace();
          
          const simplified = filtered.map(p => ({
            ...p,
            backups: [],
            image: (p.image && p.image.startsWith("data:") && p.image.length > 100)
              ? p.image.substring(0, 500) + "...[مضغوطة]"
              : p.image,
            assets: Array.isArray(p.assets) ? p.assets.map((asset: any) => {
              if (asset && asset.url && asset.url.startsWith("data:")) {
                return { ...asset, url: "[ملف قاعدة بيانات مخزن]" };
              }
              return asset;
            }) : p.assets
          }));
          try {
            localStorage.setItem(LS_KEY, JSON.stringify(simplified));
          } catch {
            const truncated = filtered.map(p => ({
              ...p,
              backups: [],
              image: (p.image && p.image.startsWith("data:")) ? "[صورة مفرغة]" : p.image,
              assets: undefined
            }));
            localStorage.setItem(LS_KEY, JSON.stringify(truncated));
          }
        } else {
          throw e;
        }
      }
    } catch {}
    return item;
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const item = await productService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    return productService.create(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.deleteProduct(id);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: Product[] = JSON.parse(saved);
        const filtered = list.filter(p => p.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<Product | null> => {
    return productService.update(id, { productStatus: "archived" });
  },

  restore: async (id: string): Promise<Product | null> => {
    return productService.update(id, { productStatus: "published" });
  }
};
