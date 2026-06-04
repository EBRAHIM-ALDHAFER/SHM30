import React, { createContext, useContext, useState, useEffect } from "react";
import { StoreProfile } from "../../types";
import { storeService } from "../database/storeService";
import { auditService } from "../database/auditService";
import { notificationService } from "../database/notificationService";

interface StoreContextType {
  activeStoreId: string;
  activeStore: StoreProfile | null;
  stores: StoreProfile[];
  loading: boolean;
  changeStore: (id: string) => Promise<void>;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeStoreId, setActiveStoreIdState] = useState<string>(() => {
    return storeService.getActiveStoreId() || "store_1";
  });
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [activeStore, setActiveStore] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStores = async () => {
    try {
      setLoading(true);
      const allStores = await storeService.getAll();
      setStores(allStores);
      
      // Determine active store
      const currentId = storeService.getActiveStoreId();
      let found = allStores.find(s => s.id === currentId);
      
      // Default fallback if not found or empty
      if (!found && allStores.length > 0) {
        found = allStores[0];
        storeService.setActiveStoreId(found.id);
        setActiveStoreIdState(found.id);
      }
      setActiveStore(found || null);
    } catch (e) {
      console.error("فشل تحميل المتاجر:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStores();
  }, []);

  const changeStore = async (id: string) => {
    try {
      storeService.setActiveStoreId(id);
      setActiveStoreIdState(id);
      const found = stores.find(s => s.id === id) || null;
      setActiveStore(found);

      // Log the event to both Notifications and Audit service
      if (found) {
        await auditService.createAuditLog(
          "تغيير المتجر النشط",
          `تم الانتقال إلى العمل على متجر: ${found.name}`,
          "المدير العام",
          id
        );
        await notificationService.createNotification({
          title: "تم تغيير المتجر",
          text: `أنت الآن تتصفح وتدير متجر "${found.name}"`,
          type: "info",
          store_id: id
        });
      }
    } catch (error) {
      console.error("خطأ أثناء تحويل المتجر:", error);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        activeStoreId,
        activeStore,
        stores,
        loading,
        changeStore,
        refreshStores
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
