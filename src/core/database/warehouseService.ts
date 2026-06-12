import { Warehouse } from "../../types";
import { SahmDatabaseService } from "./dbService";

const db = SahmDatabaseService.getInstance();

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    return db.getWarehouses();
  },

  create: async (warehouse: Warehouse): Promise<Warehouse> => {
    return db.saveWarehouse(warehouse);
  },

  update: async (id: string, updates: Partial<Warehouse>): Promise<Warehouse | null> => {
    const list = await db.getWarehouses();
    const item = list.find(w => w.id === id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    return db.saveWarehouse(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    return db.deleteWarehouse(id);
  }
};
