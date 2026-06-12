/**
 * Sahm OS Native IndexedDB Persistence & Offline Sync Engine
 * Strictly typed, lightweight, with zero external dependency footprints.
 */

const DB_NAME = "SahmOfflineDB_v2";
const DB_VERSION = 2;

export interface OfflineSyncItem {
  id: string;
  action: "create" | "update" | "delete";
  entity: "product" | "catalog" | "invoice" | "store";
  payload: any;
  timestamp: string;
  status: "pending" | "processing" | "synced" | "failed";
  errorMessage?: string;
}

export interface OfflineSyncLog {
  id: string;
  timestamp: string;
  operation: string;
  status: "success" | "warning" | "error";
  message: string;
}

export function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser/environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;

      // 1. Products store
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }

      // 2. Catalogs store
      if (!db.objectStoreNames.contains("catalogs")) {
        db.createObjectStore("catalogs", { keyPath: "id" });
      }

      // 3. Images Cache store
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }

      // 4. Invoices store (for offline invoice tracker)
      if (!db.objectStoreNames.contains("invoices")) {
        db.createObjectStore("invoices", { keyPath: "id" });
      }

      // 5. Operations Sync Queue (For Offline changes)
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id" });
      }

      // 6. Detailed Sync Logs
      if (!db.objectStoreNames.contains("syncLogs")) {
        db.createObjectStore("syncLogs", { keyPath: "id" });
      }

      // 7. Cashier Shifts
      if (!db.objectStoreNames.contains("shifts")) {
        db.createObjectStore("shifts", { keyPath: "id" });
      }

      // 8. Shift Balances
      if (!db.objectStoreNames.contains("shift_balances")) {
        db.createObjectStore("shift_balances", { keyPath: "id" });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(new Error("Failed to open Offline Database: " + event.target.error?.message));
    };
  });
}

/**
 * Generic Read/Write operations
 */
export async function saveToIndexedDB(storeName: string, item: any): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(transaction.objectStoreNames[0] || storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = (e: any) => reject(e.target.error);
  });
}

export async function saveAllToIndexedDB(storeName: string, items: any[]): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(transaction.objectStoreNames[0] || storeName);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = (e: any) => reject(e.target.error);

    items.forEach((item) => {
      store.put(item);
    });
  });
}

export async function getAllFromIndexedDB<T = any>(storeName: string): Promise<T[]> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(transaction.objectStoreNames[0] || storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

export async function getFromIndexedDB<T = any>(storeName: string, id: string): Promise<T | null> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(transaction.objectStoreNames[0] || storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

export async function deleteFromIndexedDB(storeName: string, id: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(transaction.objectStoreNames[0] || storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (e: any) => reject(e.target.error);
  });
}

/**
 * Offline Sync Queue helper operations
 */
export async function addToSyncQueue(
  action: "create" | "update" | "delete",
  entity: "product" | "catalog" | "invoice" | "store",
  payload: any
): Promise<OfflineSyncItem> {
  const queueItem: OfflineSyncItem = {
    id: `${entity}_sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    entity,
    payload,
    timestamp: new Date().toISOString(),
    status: "pending"
  };
  await saveToIndexedDB("syncQueue", queueItem);
  await addSyncLog(
    `إضافة مهمة مزامنة (${action === "create" ? "إنشاء" : action === "update" ? "تعديل" : "حذف"})`,
    "warning",
    `تم تسجيل عملية offline لـ ${entity === "product" ? "المنتج" : entity === "catalog" ? "الكتالوج" : "الفاتورة"} : ${payload?.name || payload?.title || payload?.id || ""}. بانتظار عودة الشبكة.`
  );
  return queueItem;
}

export async function getSyncQueue(): Promise<OfflineSyncItem[]> {
  try {
    return await getAllFromIndexedDB<OfflineSyncItem>("syncQueue");
  } catch {
    return [];
  }
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  await deleteFromIndexedDB("syncQueue", id);
}

export async function updateSyncQueueStatus(
  id: string,
  status: "pending" | "processing" | "synced" | "failed",
  errorMessage?: string
): Promise<void> {
  const item = await getFromIndexedDB<OfflineSyncItem>("syncQueue", id);
  if (item) {
    item.status = status;
    item.errorMessage = errorMessage;
    await saveToIndexedDB("syncQueue", item);
  }
}

/**
 * Audit Sync Logs helper operations
 */
export async function addSyncLog(
  operation: string,
  status: "success" | "warning" | "error",
  message: string
): Promise<OfflineSyncLog> {
  const log: OfflineSyncLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    operation,
    status,
    message
  };
  try {
    await saveToIndexedDB("syncLogs", log);
    
    // Prune logs if they exceed 50 entries to keep DB lightweight
    const logs = await getAllFromIndexedDB<OfflineSyncLog>("syncLogs");
    if (logs.length > 50) {
      logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const toDelete = logs.slice(0, logs.length - 50);
      for (const t of toDelete) {
        await deleteFromIndexedDB("syncLogs", t.id);
      }
    }
  } catch (err) {
    console.warn("Could not save sync audit log to IndexedDB: ", err);
  }
  return log;
}

export async function getSyncLogs(): Promise<OfflineSyncLog[]> {
  try {
    const logs = await getAllFromIndexedDB<OfflineSyncLog>("syncLogs");
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
}

export async function clearAllLocalCaches(): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const storeNames = Array.from(db.objectStoreNames);
    const transaction = db.transaction(storeNames, "readwrite");
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = (e: any) => reject(e.target.error);

    storeNames.forEach((s) => {
      transaction.objectStore(s).clear();
    });
  });
}
