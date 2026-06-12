import { SahmDatabaseService } from "./dbService";

const LS_KEY = "sahm_web_terminals_local";

export interface POSUnit {
  id: string;
  name: string;
  branchId: string;
  branch_id?: string;
  isDefault: boolean;
  status: string;
  isActive?: boolean;
  is_active?: boolean;
  assignedUserId?: string;
  assigned_user_id?: string;
  archivedAt?: string;
  archived_at?: string;
  storeId?: string;
  store_id?: string;
  tenantId?: string;
  tenant_id?: string;
  companyId?: string;
  company_id?: string;
  cashier?: string;
  warehouseId?: string;
  warehouse_id?: string;
  payMethods?: string[];
}

export interface POSSettings {
  defaultPosId: string;
  associatedWarehouseId: string;
  allowedPaymentMethods: string[];
  isTaxEnabled: boolean;
  taxPercentage: number;
  isDiscountAllowed: boolean;
  maxDiscountLimit: number;
  isSuspensionAllowed: boolean;
  isRefundAllowed: boolean;
  printingEnabled: boolean;
  invoiceTemplate: string; // "حراري - 80مم" | "A4 رسمي" | "فاخر ذهبي" | "حديث بسيط" | "تسويقي"
  startingInvoiceNumber: number;
  posStatus: "نشطة" | "متوقفة";
  
  // Custom Invoice & Print configuration
  invoiceLogoUrl?: string;
  showQrCode?: boolean;
  showTaxNumber?: boolean;
  showNationalAddress?: boolean;
  customThankYouText?: string;
  optionalDiscountCode?: string;
  invoicePrimaryColor?: string;

  // Visual/receipt settings compatibility fallbacks
  primaryColor?: string;
  invoiceLogo?: string;
  showTaxId?: boolean;
  customThankYouMessage?: string;
  showQr?: boolean;
}

export const getDefaultSettings = (posId: string, associatedWhId?: string): POSSettings => {
  return {
    defaultPosId: posId,
    associatedWarehouseId: associatedWhId || "warehouse_1",
    allowedPaymentMethods: ["نقدي", "شبكة مدى", "Apple Pay", "STC Pay", "دفع متعدد"],
    isTaxEnabled: true,
    taxPercentage: 15,
    isDiscountAllowed: true,
    maxDiscountLimit: 1000,
    isSuspensionAllowed: true,
    isRefundAllowed: true,
    printingEnabled: true,
    invoiceTemplate: "حراري - 80مم",
    startingInvoiceNumber: 1001,
    posStatus: "نشطة",

    // Defaults for the new parameters
    invoiceLogoUrl: "",
    showQrCode: true,
    showTaxNumber: true,
    showNationalAddress: false,
    customThankYouText: "شكراً لزيارتكم! طيّب الله أوقاتكم بكل خير ونراكم قريباً.",
    optionalDiscountCode: "MABROOK10",
    invoicePrimaryColor: "#D4AF37" // Elegant Gold default
  };
};

export const posService = {
  getAll: async (): Promise<POSUnit[]> => {
    const db = SahmDatabaseService.getInstance();
    const isSupabase = import.meta.env.VITE_DATA_MODE === "supabase" || db.isSupabaseModeOnly() || db.isSupabaseConnected();

    if (isSupabase) {
      try {
        const terminals = await db.getPosTerminals();
        console.log("[POS_GETALL_DEBUG] Retrieved terminals from Supabase (strict mode), count:", terminals.length);
        const mapped = terminals.map(t => {
          return {
            id: t.id,
            name: t.name,
            branchId: t.branchId || t.branch_id || "",
            branch_id: t.branchId || t.branch_id || "",
            isDefault: t.isDefault || false,
            status: t.status || (t.is_active === false ? "غير نشط" : "نشط"),
            isActive: t.is_active !== undefined ? t.is_active : (t.isActive !== undefined ? t.isActive : true),
            is_active: t.is_active !== undefined ? t.is_active : (t.isActive !== undefined ? t.isActive : true),
            assignedUserId: t.assigned_user_id || t.assignedUserId || undefined,
            assigned_user_id: t.assigned_user_id || t.assignedUserId || undefined,
            archivedAt: t.archived_at || t.archivedAt || undefined,
            archived_at: t.archived_at || t.archivedAt || undefined,
            storeId: t.store_id || t.storeId || undefined,
            store_id: t.store_id || t.storeId || undefined,
            tenantId: t.tenant_id || t.tenantId || undefined,
            tenant_id: t.tenant_id || t.tenantId || undefined,
            companyId: t.company_id || t.companyId || undefined,
            company_id: t.company_id || t.companyId || undefined,
            cashier: t.cashier || undefined,
            warehouseId: t.warehouseId || t.warehouse_id || undefined,
            warehouse_id: t.warehouseId || t.warehouse_id || undefined,
            payMethods: t.payMethods || t.pay_methods || []
          };
        });
        return mapped;
      } catch (e) {
        console.error("[POS_GETALL_DEBUG] Failed to get terminals via Supabase in strict mode", e);
        if (db.isSupabaseModeOnly() || import.meta.env.VITE_DATA_MODE === "supabase") {
          throw e;
        }
      }
    }

    let localList: POSUnit[] = [];
    try {
      const saved = localStorage.getItem(LS_KEY);
      localList = saved ? JSON.parse(saved) : [];
      console.log("[POS_GETALL_DEBUG] Retrieved localList from localStorage (demo/fallback):", localList);
    } catch {}
    return localList;
  },

  checkOperationalUsage: async (id: string): Promise<boolean> => {
    try {
      const db = SahmDatabaseService.getInstance();
      if (db.isSupabaseConnected() || db.isSupabaseModeOnly()) {
        const client = db.supabaseClient;
        if (client) {
          // Check shifts table
          const { data: shifts, error: shiftsError } = await client
            .from("shifts")
            .select("id")
            .eq("pos_id", id)
            .limit(1);
          if (shiftsError) {
            console.warn("Error checking shifts usage:", shiftsError);
          } else if (shifts && shifts.length > 0) {
            return true;
          }

          // Check sales table
          const { data: sales, error: salesError } = await client
            .from("sales")
            .select("id")
            .eq("pos_id", id)
            .limit(1);
          if (salesError) {
            console.warn("Error checking sales usage:", salesError);
          } else if (sales && sales.length > 0) {
            return true;
          }

          // Check invoices table
          const { data: invoices, error: invoicesError } = await client
            .from("invoices")
            .select("id")
            .eq("pos_id", id)
            .limit(1);
          if (invoicesError) {
            console.warn("Error checking invoices usage:", invoicesError);
          } else if (invoices && invoices.length > 0) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn("Error in checkOperationalUsage:", e);
    }

    try {
      const activeShiftStr = localStorage.getItem("sahm_pos_active_shift");
      if (activeShiftStr) {
        const activeShift = JSON.parse(activeShiftStr);
        if (activeShift && (activeShift.pos_id === id || activeShift.posId === id)) {
          return true;
        }
      }
    } catch {}

    return false;
  },

  create: async (pos: POSUnit): Promise<POSUnit> => {
    const db = SahmDatabaseService.getInstance();
    try {
      if (db.isSupabaseConnected() || db.isSupabaseModeOnly()) {
        try {
          await db.savePosTerminal(pos);
        } catch (e: any) {
          throw e; // Bubble exact database connection/write errors
        }
      }
    } catch (e: any) {
      if (db.isSupabaseModeOnly()) {
        throw new Error(`تعذر حفظ جهاز الكاشير في السحاب: ${e.message}`);
      }
    }

    try {
      const saved = localStorage.getItem(LS_KEY);
      const list: POSUnit[] = saved ? JSON.parse(saved) : [];
      console.log("[POS_CREATE_DEBUG] Read from LS before push:", list);
      
      const idx = list.findIndex(p => p.id === pos.id);
      if (idx > -1) {
        list[idx] = pos;
      } else {
        list.push(pos);
      }
      
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      console.log("[POS_CREATE_DEBUG] Saved to LS after push:", localStorage.getItem(LS_KEY));
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
    console.log("[POS_DELETE_DEBUG] delete method called for ID:", id);
    const db = SahmDatabaseService.getInstance();
    
    // Check operational usage first
    const hasUsage = await posService.checkOperationalUsage(id);
    
    if (hasUsage) {
      console.log(`[POS_DELETE_DEBUG] POS terminal ${id} has operational usage. Performing soft delete / archive...`);
      await posService.update(id, {
        status: "inactive",
        is_active: false,
        isActive: false,
        archivedAt: new Date().toISOString(),
        archived_at: new Date().toISOString()
      });
      return true;
    }
    
    // If no usage, delete permanently
    try {
      if (db.isSupabaseConnected() || db.isSupabaseModeOnly()) {
        const client = (db as any).supabaseClient;
        if (client) {
          console.log("[POS_DELETE_DEBUG] Deleting from Supabase table 'pos_terminals' permanently...");
          const { data, error, status, statusText } = await client.from("pos_terminals").delete().eq("id", id).select();
          console.log("[POS_DELETE_DEBUG] Supabase delete response status:", status, "statusText:", statusText, "data:", data, "error:", error);
          if (error) throw error;
        }
      }
    } catch (e: any) {
      console.error("[POS_DELETE_DEBUG] Failed to delete POS terminal from Supabase permanently", e);
      if (db.isSupabaseModeOnly()) {
        throw new Error(e.message || "تعذر حذف جهاز نقاط البيع من السحاب.");
      }
    }

    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const list: POSUnit[] = JSON.parse(saved);
        const filtered = list.filter(p => p.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(filtered));
        console.log("[POS_DELETE_DEBUG] Deleted permanently from localStorage key", LS_KEY);
      }
      return true;
    } catch (e: any) {
      console.error("[POS_DELETE_DEBUG] Failed to delete from localStorage permanently", e);
      return false;
    }
  },

  getSettings: (posId: string, associatedWhId?: string): POSSettings => {
    try {
      const saved = localStorage.getItem(`sahm_web_pos_settings_${posId}`);
      if (saved) {
        return { ...getDefaultSettings(posId, associatedWhId), ...JSON.parse(saved) };
      }
      return getDefaultSettings(posId, associatedWhId);
    } catch {
      return getDefaultSettings(posId, associatedWhId);
    }
  },

  saveSettings: async (posId: string, settings: POSSettings): Promise<void> => {
    try {
      localStorage.setItem(`sahm_web_pos_settings_${posId}`, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving POS settings", e);
    }
  }
};
