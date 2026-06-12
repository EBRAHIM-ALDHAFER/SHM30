import { SahmDatabaseService } from "./dbService";

export interface SahmNotification {
  id: string;
  title: string;
  text: string;
  read: boolean;
  time: string;
  type: "sync" | "alert" | "sale" | "security" | "success" | "warning" | "critical" | "info" | "ai";
  store_id?: string;
  created_at: string;
}

const LS_KEY = "sahm_notifications_hub";

const getMode = () => {
  const mode = import.meta.env.VITE_DATA_MODE;
  if (mode === "supabase" || mode === "production") return "production";
  return "demo";
};

export const notificationService = {
  getAll: async (activeStoreId?: string): Promise<SahmNotification[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.getNotifications(activeStoreId);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: SahmNotification[] = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter(n => !n.store_id || n.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<SahmNotification | null> => {
    const list = await notificationService.getAll();
    return list.find(n => n.id === id) || null;
  },

  create: async (item: SahmNotification): Promise<SahmNotification> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveNotification(item);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: SahmNotification[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(n => n.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    } catch {}
    return item;
  },

  createNotification: async (notification: Omit<SahmNotification, "id" | "created_at" | "read" | "time"> & { id?: string; time?: string }): Promise<SahmNotification> => {
    const fresh: SahmNotification = {
      id: notification.id || "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: notification.title,
      text: notification.text,
      read: false,
      time: notification.time || "الآن حياً",
      type: notification.type,
      store_id: notification.store_id,
      created_at: new Date().toISOString()
    };
    return notificationService.create(fresh);
  },

  update: async (id: string, updates: Partial<SahmNotification>): Promise<SahmNotification | null> => {
    const item = await notificationService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveNotification(updated);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      let list: SahmNotification[] = saved ? JSON.parse(saved) : [];
      list = list.map(n => n.id === id ? updated : n);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.deleteNotification(id);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: SahmNotification[] = JSON.parse(saved);
        const filtered = list.filter(n => n.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<SahmNotification | null> => {
    return notificationService.update(id, { read: true });
  },

  restore: async (id: string): Promise<SahmNotification | null> => {
    return notificationService.update(id, { read: false });
  }
};
