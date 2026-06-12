import { SahmDatabaseService } from "./dbService";

export interface ProductTimelineEvent {
  event_id: string;
  product_id: string;
  store_id: string;
  event_type: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  metadata?: any;
  
  // Backward compatibility with older systems
  id?: string;
}

const LS_KEY = "sahm_product_timeline_events";

const getMode = () => {
  const mode = import.meta.env.VITE_DATA_MODE;
  if (mode === "supabase" || mode === "production") return "production";
  return "demo";
};

export const productTimelineService = {
  getAll: async (activeStoreId?: string): Promise<ProductTimelineEvent[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.getProductTimelineEvents(activeStoreId);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: ProductTimelineEvent[] = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter(e => !e.store_id || e.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<ProductTimelineEvent | null> => {
    const list = await productTimelineService.getAll();
    return list.find(e => e.event_id === id || e.id === id) || null;
  },

  create: async (item: ProductTimelineEvent): Promise<ProductTimelineEvent> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveProductTimelineEvent(item);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: ProductTimelineEvent[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(e => e.event_id !== item.event_id && e.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    } catch {}
    return item;
  },

  createEvent: async (event: ProductTimelineEvent): Promise<ProductTimelineEvent> => {
    return productTimelineService.create(event);
  },

  update: async (id: string, updates: Partial<ProductTimelineEvent>): Promise<ProductTimelineEvent | null> => {
    const item = await productTimelineService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveProductTimelineEvent(updated);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      let list: ProductTimelineEvent[] = saved ? JSON.parse(saved) : [];
      list = list.map(e => (e.event_id === id || e.id === id) ? updated : e);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.deleteProductTimelineEvent(id);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: ProductTimelineEvent[] = JSON.parse(saved);
        const filtered = list.filter(e => e.event_id !== id && e.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<ProductTimelineEvent | null> => {
    return productTimelineService.update(id, { event_type: "archived" });
  },

  restore: async (id: string): Promise<ProductTimelineEvent | null> => {
    return productTimelineService.update(id, { event_type: "standard" });
  },

  getEventsByProduct: async (productId: string): Promise<ProductTimelineEvent[]> => {
    const list = await productTimelineService.getAll();
    return list.filter(e => e.product_id === productId);
  }
};
