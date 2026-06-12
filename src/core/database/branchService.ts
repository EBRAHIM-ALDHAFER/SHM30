import { Branch } from "../../types";
import { SahmDatabaseService } from "./dbService";

const db = SahmDatabaseService.getInstance();

export const branchService = {
  getAll: async (): Promise<Branch[]> => {
    return db.getBranches();
  },

  create: async (branch: Branch): Promise<Branch> => {
    return db.saveBranch(branch);
  },

  update: async (id: string, updates: Partial<Branch>): Promise<Branch | null> => {
    const list = await db.getBranches();
    const item = list.find(b => b.id === id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    return db.saveBranch(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    return db.deleteBranch(id);
  }
};
