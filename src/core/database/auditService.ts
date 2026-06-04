import { SahmDatabaseService } from "./dbService";

export interface AuditLog {
  id: string;
  event: string;
  text: string;
  user: string;
  time: string;
  date: string;
  store_id?: string;
  created_at: string;
}

const LS_KEY = "sahm_audit_logs_v9";

const getMode = () => {
  return (import.meta as any).env?.VITE_DATA_MODE || (typeof localStorage !== "undefined" && localStorage.getItem("sahm_supabase_connected") === "true" ? "production" : "demo");
};

export const auditService = {
  getAll: async (activeStoreId?: string): Promise<AuditLog[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.getAuditLogs(activeStoreId);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: AuditLog[] = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter(l => !l.store_id || l.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<AuditLog | null> => {
    const list = await auditService.getAll();
    return list.find(l => l.id === id) || null;
  },

  create: async (item: AuditLog): Promise<AuditLog> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.saveAuditLog(item);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: AuditLog[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(l => l.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    } catch {}
    return item;
  },

  createAuditLog: async (event: string, text: string, username = "المدير العام", storeId?: string): Promise<AuditLog> => {
    const fresh: AuditLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      event,
      text,
      user: username,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      date: "اليوم",
      store_id: storeId,
      created_at: new Date().toISOString()
    };
    return auditService.create(fresh);
  },

  update: async (id: string, updates: Partial<AuditLog>): Promise<AuditLog | null> => {
    const item = await auditService.getById(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.saveAuditLog(updated);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      let list: AuditLog[] = saved ? JSON.parse(saved) : [];
      list = list.map(l => l.id === id ? updated : l);
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production" && db.isSupabaseConnected()) {
      return db.deleteAuditLog(id);
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: AuditLog[] = JSON.parse(saved);
        const filtered = list.filter(l => l.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id: string): Promise<AuditLog | null> => {
    return auditService.update(id, { date: "مؤرشف" });
  },

  restore: async (id: string): Promise<AuditLog | null> => {
    return auditService.update(id, { date: "اليوم" });
  }
};
