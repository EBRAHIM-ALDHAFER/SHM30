const LS_KEY = "sahm_web_pos_units";

export interface POSUnit {
  id: string;
  name: string;
  branchId: string;
  isDefault: boolean;
  status: string;
  cashier?: string;
  warehouseId?: string;
  payMethods?: string[];
}

export const posService = {
  getAll: async (): Promise<POSUnit[]> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  create: async (pos: POSUnit): Promise<POSUnit> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: POSUnit[] = saved ? JSON.parse(saved) : [];
      
      const idx = list.findIndex(p => p.id === pos.id);
      if (idx > -1) {
        list[idx] = pos;
      } else {
        list.push(pos);
      }
      
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      return pos;
    } catch (e: any) {
      throw new Error(`تعذر حفظ جهاز الكاشير: ${e.message}`);
    }
  },

  update: async (id: string, updates: Partial<POSUnit>): Promise<POSUnit | null> => {
    try {
      const list = await posService.getAll();
      const item = list.find(p => p.id === id);
      if (!item) return null;
      const updated = { ...item, ...updates };
      return posService.create(updated);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: POSUnit[] = JSON.parse(saved);
        const filtered = list.filter(p => p.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  }
};
