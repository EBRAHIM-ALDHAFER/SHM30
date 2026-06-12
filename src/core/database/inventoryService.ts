import { Branch, Warehouse, StockTransfer } from "../../types";
import { SahmDatabaseService } from "./dbService";

const LS_KEYS = {
  BRANCHES: "sahm_web_branches_v2",
  WAREHOUSES: "sahm_web_warehouses_v2",
  TRANSFERS: "sahm_web_transfers_v2",
  CATEGORIES: "sahm_custom_categories_v2",
};

const getMode = () => {
  const mode = import.meta.env.VITE_DATA_MODE;
  if (mode === "supabase" || mode === "production") return "production";
  return "demo";
};

let memoryTransfers: StockTransfer[] | null = null;

export const inventoryService = {
  // --- CATEGORIES ---
  getCategories: async (activeStoreId?: string): Promise<any[]> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.getCategories(activeStoreId);
    }
    try {
      const saved = localStorage.getItem(LS_KEYS.CATEGORIES);
      const list = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter((c: any) => !c.store_id || c.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveCategory: async (category: any): Promise<any> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveCategory(category);
    }
    try {
      const saved = localStorage.getItem(LS_KEYS.CATEGORIES);
      const list = saved ? JSON.parse(saved) : [];
      const filtered = list.filter((c: any) => c.id !== category.id);
      filtered.unshift(category);
      localStorage.setItem(LS_KEYS.CATEGORIES, JSON.stringify(filtered));
    } catch {}
    return category;
  },

  // --- BRANCHES ---
  getBranches: async (activeStoreId?: string): Promise<Branch[]> => {
    const db = SahmDatabaseService.getInstance();
    let list: Branch[] = [];
    if (getMode() === "production") {
      list = await db.getBranches();
    } else {
      try {
        const saved = localStorage.getItem(LS_KEYS.BRANCHES);
        list = saved ? JSON.parse(saved) : [];
      } catch {}
    }
    if (activeStoreId) {
      return list.filter(b => !b.store_id || b.store_id === activeStoreId);
    }
    return list;
  },

  saveBranch: async (branch: Branch): Promise<Branch> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveBranch(branch);
    }
    try {
      const saved = localStorage.getItem(LS_KEYS.BRANCHES);
      let list: Branch[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(b => b.id === branch.id);
      if (idx > -1) {
        list[idx] = branch;
      } else {
        list.push(branch);
      }
      localStorage.setItem(LS_KEYS.BRANCHES, JSON.stringify(list));
    } catch {}
    return branch;
  },

  // --- WAREHOUSES ---
  getWarehouses: async (activeStoreId?: string): Promise<Warehouse[]> => {
    const db = SahmDatabaseService.getInstance();
    let list: Warehouse[] = [];
    if (getMode() === "production") {
      list = await db.getWarehouses();
    } else {
      try {
        const saved = localStorage.getItem(LS_KEYS.WAREHOUSES);
        list = saved ? JSON.parse(saved) : [];
      } catch {}
    }
    if (activeStoreId) {
      return list.filter(w => !w.store_id || w.store_id === activeStoreId);
    }
    return list;
  },

  saveWarehouse: async (warehouse: Warehouse): Promise<Warehouse> => {
    const db = SahmDatabaseService.getInstance();
    if (getMode() === "production") {
      return db.saveWarehouse(warehouse);
    }
    try {
      const saved = localStorage.getItem(LS_KEYS.WAREHOUSES);
      let list: Warehouse[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(w => w.id === warehouse.id);
      if (idx > -1) {
        list[idx] = warehouse;
      } else {
        list.push(warehouse);
      }
      localStorage.setItem(LS_KEYS.WAREHOUSES, JSON.stringify(list));
    } catch {}
    return warehouse;
  },

  // --- TRANSFERS ---
  getTransfers: async (activeStoreId?: string): Promise<StockTransfer[]> => {
    if (getMode() === "production") {
      if (!memoryTransfers) memoryTransfers = [];
      if (activeStoreId) {
        return memoryTransfers.filter((t: any) => !t.store_id || t.store_id === activeStoreId);
      }
      return memoryTransfers;
    }
    try {
      const saved = localStorage.getItem(LS_KEYS.TRANSFERS);
      const list = saved ? JSON.parse(saved) : [];
      if (activeStoreId) {
        return list.filter((t: any) => !t.store_id || t.store_id === activeStoreId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveTransfer: async (transfer: StockTransfer): Promise<StockTransfer> => {
    if (getMode() === "production") {
      if (!memoryTransfers) memoryTransfers = [];
      const idx = memoryTransfers.findIndex(t => t.id === transfer.id);
      if (idx > -1) {
        memoryTransfers[idx] = transfer;
      } else {
        memoryTransfers.push(transfer);
      }
      return transfer;
    }
    try {
      const saved = localStorage.getItem(LS_KEYS.TRANSFERS);
      let list: StockTransfer[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex(t => t.id === transfer.id);
      if (idx > -1) {
        list[idx] = transfer;
      } else {
        list.push(transfer);
      }
      localStorage.setItem(LS_KEYS.TRANSFERS, JSON.stringify(list));
    } catch {}
    return transfer;
  }
};
