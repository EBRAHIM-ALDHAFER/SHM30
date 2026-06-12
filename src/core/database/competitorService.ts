import { SahmDatabaseService } from "./dbService";

export interface CompetitorProduct {
  competitor_product_id: string;
  linked_product_id?: string;
  store_id: string;
  competitor_name: string;
  competitor_url: string;
  competitor_product_name: string;
  competitor_image?: string;
  current_price: number;
  old_price?: number;
  currency: string;
  availability: string;
  category: string;
  last_checked_at: string;
  monitoring_status: string;
  created_at: string;
  updated_at?: string;
  fetch_source?: 'real_scrape' | 'ai_estimate' | 'manual_entry';
  autoRepriceRule?: 'none' | 'match' | 'undercut' | 'margin';
  autoRepriceValue?: number;
  minRepricePrice?: number;
  
  // Older fields for backward compatibility
  id?: string;
  customProductName?: string;
  competitorName?: string;
  myProductId?: string;
  initialComparison?: string;
  priceHistory?: CompetitorPriceHistory[];
}

export interface CompetitorPriceHistory {
  history_id: string;
  competitor_product_id: string;
  price: number;
  old_price?: number;
  availability: string;
  checked_at: string;
  change_type: 'انخفاض سعر' | 'ارتفاع سعر' | 'نفاد' | 'عودة التوفر' | 'تعديل محتوى';
  source: string;
}

const LS_KEY = "sahm_competitor_tracks_v2";
const HISTORY_LS_KEY = "sahm_competitor_price_history";

const getMode = () => {
  const mode = import.meta.env.VITE_DATA_MODE;
  if (mode === "supabase" || mode === "production") return "production";
  return "demo";
};

export const competitorService = {
  getAll: async (activeStoreId?: string): Promise<CompetitorProduct[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.getCompetitorProducts(activeStoreId);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: CompetitorProduct[] = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter(c => !c.store_id || c.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<CompetitorProduct | null> => {
    const list = await competitorService.getAll();
    return list.find(c => c.competitor_product_id === id || c.id === id) || null;
  },

  create: async (item: CompetitorProduct): Promise<CompetitorProduct> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveCompetitorProduct(item);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: CompetitorProduct[] = saved ? JSON.parse(saved) : [];
      // Prevent duplicates
      const filtered = list.filter(c => c.competitor_product_id !== item.competitor_product_id && c.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    } catch {}
    return item;
  },

  update: async (id: string, updates: Partial<CompetitorProduct>): Promise<CompetitorProduct | null> => {
    const item = await competitorService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates, updated_at: new Date().toISOString() };
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveCompetitorProduct(updated);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      let list: CompetitorProduct[] = saved ? JSON.parse(saved) : [];
      list = list.map(c => (c.competitor_product_id === id || c.id === id) ? updated : c);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.deleteCompetitorProduct(id);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: CompetitorProduct[] = JSON.parse(saved);
        const filtered = list.filter(c => c.competitor_product_id !== id && c.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<CompetitorProduct | null> => {
    return competitorService.update(id, { monitoring_status: "archived" });
  },

  restore: async (id: string): Promise<CompetitorProduct | null> => {
    return competitorService.update(id, { monitoring_status: "normal" });
  },

  getCompetitorsByProduct: async (productId: string): Promise<CompetitorProduct[]> => {
    const list = await competitorService.getAll();
    return list.filter(c => c.linked_product_id === productId || c.myProductId === productId);
  },

  // Price history operations
  getPriceHistory: async (competitorProductId: string): Promise<CompetitorPriceHistory[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.getCompetitorPriceHistory(competitorProductId);
    }
    try {
      const saved = localStorage.getItem(HISTORY_LS_KEY);
      const list: CompetitorPriceHistory[] = saved ? JSON.parse(saved) : [];
      return list.filter(h => h.competitor_product_id === competitorProductId);
    } catch {
      return [];
    }
  },

  savePriceHistory: async (historyEntry: CompetitorPriceHistory): Promise<CompetitorPriceHistory> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveCompetitorPriceHistory(historyEntry);
    }
    try {
      const saved = localStorage.getItem(HISTORY_LS_KEY);
      const list: CompetitorPriceHistory[] = saved ? JSON.parse(saved) : [];
      list.unshift(historyEntry);
      localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(list));
    } catch {}
    return historyEntry;
  }
};
