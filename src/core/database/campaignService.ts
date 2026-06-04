import { SahmDatabaseService } from "./dbService";

export interface Campaign {
  campaign_id: string;
  product_id: string;
  store_id: string;
  created_by: string;
  selected_channels: string[];
  campaign_price: number;
  campaign_quantity: number;
  campaign_content: string;
  campaign_status: string;
  created_at: string;
  updated_at?: string;
  performance_metrics?: any;
  
  // Older fields backward compatibility
  id?: string;
  campaign_name?: string;
  platforms?: string[];
  clicks?: number;
  orders?: number;
  performance?: string;
  adText?: string;
}

const LS_KEY = "sahm_product_campaigns";

const getMode = () => {
  return (import.meta as any).env?.VITE_DATA_MODE || (typeof localStorage !== "undefined" && localStorage.getItem("sahm_supabase_connected") === "true" ? "production" : "demo");
};

export const campaignService = {
  getAll: async (activeStoreId?: string): Promise<Campaign[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.getCampaigns(activeStoreId);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: Campaign[] = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter(c => !c.store_id || c.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<Campaign | null> => {
    const list = await campaignService.getAll();
    return list.find(c => c.campaign_id === id || c.id === id) || null;
  },

  create: async (item: Campaign): Promise<Campaign> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.saveCampaign(item);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: Campaign[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(c => c.campaign_id !== item.campaign_id && c.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    } catch {}
    return item;
  },

  update: async (id: string, updates: Partial<Campaign>): Promise<Campaign | null> => {
    const item = await campaignService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates, updated_at: new Date().toISOString() };
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.saveCampaign(updated);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      let list: Campaign[] = saved ? JSON.parse(saved) : [];
      list = list.map(c => (c.campaign_id === id || c.id === id) ? updated : c);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.deleteCampaign(id);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: Campaign[] = JSON.parse(saved);
        const filtered = list.filter(c => c.campaign_id !== id && c.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<Campaign | null> => {
    return campaignService.update(id, { campaign_status: "مؤرشفة" });
  },

  restore: async (id: string): Promise<Campaign | null> => {
    return campaignService.update(id, { campaign_status: "نشطة" });
  },

  getCampaignsByProduct: async (productId: string): Promise<Campaign[]> => {
    const list = await campaignService.getAll();
    return list.filter(c => c.product_id === productId || c.id === productId);
  }
};
