import { Branch } from "../../types";

const LS_KEY = "sahm_web_branches";
const LS_KEY_V2 = "sahm_web_branches_v2";

export const branchService = {
  getAll: async (): Promise<Branch[]> => {
    try {
      const saved = localStorage.getItem(LS_KEY) || localStorage.getItem(LS_KEY_V2);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  create: async (branch: Branch): Promise<Branch> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: Branch[] = saved ? JSON.parse(saved) : [];
      
      // Make sure we update or insert
      const idx = list.findIndex(b => b.id === branch.id);
      if (idx > -1) {
        list[idx] = branch;
      } else {
        list.push(branch);
      }
      
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      localStorage.setItem(LS_KEY_V2, JSON.stringify(list));
      return branch;
    } catch (e: any) {
      throw new Error(`تعذر حفظ الفرع: ${e.message}`);
    }
  },

  update: async (id: string, updates: Partial<Branch>): Promise<Branch | null> => {
    try {
      const list = await branchService.getAll();
      const item = list.find(b => b.id === id);
      if (!item) return null;
      const updated = { ...item, ...updates };
      return branchService.create(updated);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: Branch[] = JSON.parse(saved);
        const filtered = list.filter(b => b.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
        localStorage.setItem(LS_KEY_V2, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  }
};
