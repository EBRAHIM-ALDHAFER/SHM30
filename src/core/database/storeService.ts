import { StoreProfile } from "../../types";
import { SahmDatabaseService } from "./dbService";

const LS_KEY = "sahm_web_stores";

const getMode = () => {
  return (import.meta as any).env?.VITE_DATA_MODE || (typeof localStorage !== "undefined" && localStorage.getItem("sahm_supabase_connected") === "true" ? "production" : "demo");
};

export const storeService = {
  getAll: async (): Promise<StoreProfile[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.getStores();
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<StoreProfile | null> => {
    const list = await storeService.getAll();
    return list.find(s => s.id === id) || null;
  },

  create: async (item: StoreProfile): Promise<StoreProfile> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.saveStore(item);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: StoreProfile[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(s => s.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    } catch {}
    return item;
  },

  update: async (id: string, updates: Partial<StoreProfile>): Promise<StoreProfile | null> => {
    const item = await storeService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    return storeService.create(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: StoreProfile[] = JSON.parse(saved);
        const filtered = list.filter(s => s.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<StoreProfile | null> => {
    return storeService.update(id, { isArchived: true });
  },

  restore: async (id: string): Promise<StoreProfile | null> => {
    return storeService.update(id, { isArchived: false, isActive: true });
  },

  // Active Store Helpers
  getActiveStoreId: (): string => {
    return localStorage.getItem("sahm_active_store_id") || "store_1";
  },

  setActiveStoreId: (id: string): void => {
    localStorage.setItem("sahm_active_store_id", id);
  }
};
