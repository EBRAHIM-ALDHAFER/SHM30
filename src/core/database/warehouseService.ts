import { Warehouse } from "../../types";

const LS_KEY = "sahm_web_warehouses";
const LS_KEY_V2 = "sahm_web_warehouses_v2";

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    try {
      const saved = localStorage.getItem(LS_KEY) || localStorage.getItem(LS_KEY_V2);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  create: async (warehouse: Warehouse): Promise<Warehouse> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: Warehouse[] = saved ? JSON.parse(saved) : [];
      
      const idx = list.findIndex(w => w.id === warehouse.id);
      if (idx > -1) {
        list[idx] = warehouse;
      } else {
        list.push(warehouse);
      }
      
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      localStorage.setItem(LS_KEY_V2, JSON.stringify(list));
      return warehouse;
    } catch (e: any) {
      throw new Error(`تعذر حفظ المستودع: ${e.message}`);
    }
  },

  update: async (id: string, updates: Partial<Warehouse>): Promise<Warehouse | null> => {
    try {
      const list = await warehouseService.getAll();
      const item = list.find(w => w.id === id);
      if (!item) return null;
      const updated = { ...item, ...updates };
      return warehouseService.create(updated);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: Warehouse[] = JSON.parse(saved);
        const filtered = list.filter(w => w.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
        localStorage.setItem(LS_KEY_V2, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  }
};
