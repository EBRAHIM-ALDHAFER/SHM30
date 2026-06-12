import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  X, 
  CheckCircle2, 
  XCircle,
  FileText
} from "lucide-react";
import { 
  getSyncQueue, 
  getSyncLogs, 
  OfflineSyncItem, 
  OfflineSyncLog 
} from "../utils/indexedDB";
import { SahmDatabaseService } from "../core/database/dbService";

interface OfflineSyncHUDProps {
  themeColors?: any;
  triggerNotification?: (msg: string, type: any) => void;
}

export default function OfflineSyncHUD({ themeColors = {}, triggerNotification }: OfflineSyncHUDProps) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState<number>(0);
  const [pendingItems, setPendingItems] = useState<OfflineSyncItem[]>([]);
  const [logs, setLogs] = useState<OfflineSyncLog[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (triggerNotification) {
        triggerNotification("تم استرداد الاتصال بالإنترنت بنجاح! 🟢 جاري البدء بمزامنة البيانات سحابياً تلقائياً...", "success");
      }
      autoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (triggerNotification) {
        triggerNotification("أنت تعمل حالياً بالنمط المحلي (أوفلاين) 🟡 تم تأمين كافة مبيعاتك ومنتجاتك محلياً بدقة.", "warning");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial count & load logs
    refreshQueueState();

    const interval = setInterval(() => {
      refreshQueueState();
    }, 4000); // Poll and refresh periodically

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [triggerNotification]);

  const refreshQueueState = async () => {
    try {
      const q = await getSyncQueue();
      setQueueCount(q.length);
      setPendingItems(q);
      
      const l = await getSyncLogs();
      setLogs(l);
    } catch (e) {
      console.warn("Could not query IndexedDB tables inside HUD:", e);
    }
  };

  const autoSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const dbService = SahmDatabaseService.getInstance();
      const result = await dbService.executeOfflineSync();
      if (result.syncedCount > 0 && triggerNotification) {
        triggerNotification(`تم مزامنة ${result.syncedCount} معاملة مع السحابة بنجاح! 🚀`, "success");
      }
    } catch {
      // Ignored
    } finally {
      setIsSyncing(false);
      refreshQueueState();
    }
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      if (triggerNotification) {
        triggerNotification("عذراً، تحتاج للاتصال بالإنترنت لتتمكن من تفعيل المزامنة في الوقت الفعلي.", "error");
      }
      return;
    }

    setIsSyncing(true);
    if (triggerNotification) {
      triggerNotification("بدء إرسال البيانات وقائمة التعديلات لـ Supabase... 🔄", "info");
    }

    try {
      const dbService = SahmDatabaseService.getInstance();
      const result = await dbService.executeOfflineSync();
      
      if (result.success) {
        if (triggerNotification) {
          triggerNotification(`مزامنة تامة! تم رفع عدد (${result.syncedCount}) سجلات بكفاءة. ✨`, "success");
        }
      } else {
        if (triggerNotification) {
          triggerNotification(`اكتملت المزامنة جزئياً. تم رفع ${result.syncedCount}، وفشل ${result.errors.length} سجلات.`, "warning");
        }
      }
    } catch (err: any) {
      if (triggerNotification) {
        triggerNotification(`حدث خلل غير متوقع أثناء المزامنة: ${err.message}`, "error");
      }
    } finally {
      setIsSyncing(false);
      refreshQueueState();
    }
  };

  return (
    <div className="relative font-sans text-right" id="sahm-pwa-hud-root">
      {/* HUD Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-1 px-3.5 rounded-xl border transition-all text-[11px] font-extrabold cursor-pointer h-8 select-none ${
          isOnline
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
        }`}
        title={isOnline ? "النظام متصل بالسحابة" : "النظام يعمل محلياً (غير متصل)"}
      >
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 animate-bounce text-amber-400" />
        )}
        <span className="hidden md:inline">
          {isOnline ? "متصل سحابياً" : "الوضع المحلي (أوفلاين)"}
        </span>
        
        {queueCount > 0 && (
          <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] animate-pulse">
            {queueCount}
          </span>
        )}
      </button>

      {/* Sync Console Drawer panel */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
          
          <div 
            className="absolute left-0 mt-2 w-96 rounded-2xl border p-4 shadow-2xl z-50 animate-scale-up space-y-4 max-h-[85vh] overflow-y-auto text-right"
            style={{ 
              backgroundColor: themeColors.card || "#0F1724", 
              borderColor: themeColors.border || "#1C2A40",
              color: themeColors.text || "#EDF2FF"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: themeColors.border || "#1C2A40" }}>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">منظومة المزامنة الذكية</span>
              </div>
            </div>

            {/* Offline Alert Constraint Info Banner */}
            {!isOnline && (
              <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex gap-2 items-start text-xs text-amber-400 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block mb-0.5">حدود العمل بدون إنترنت (أوفلاين)</span>
                  تم الاحتفاظ بالمنتجات والمبيعات والفواتير بدقة في قاعدة IndexedDB المحلية. تم تعليق بعض الخدمات كصناعة الكتالوج بالذكاء الاصطناعي أو روابط السلات تلقائياً لسلامة المعطيات.
                </div>
              </div>
            )}

            {/* Pending Tasks Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold px-1">
                <span>{queueCount} عملية معلقة</span>
                <span>طابور المزامنة المؤجل</span>
              </div>

              {pendingItems.length === 0 ? (
                <div className="border border-dashed p-4 rounded-xl text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-1.5" style={{ borderColor: themeColors.border || "#1C2A40" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>جميع أعمالك ومنتجاتك مزامنة وآمنة بالسحابة!</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {pendingItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-2.5 rounded-xl border flex items-center justify-between text-[11px] bg-slate-900/40 border-slate-800"
                    >
                      <div className="flex items-center gap-1.5">
                        {item.status === "processing" ? (
                          <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                        ) : item.status === "failed" ? (
                          <XCircle className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-500" />
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold max-w-[140px] truncate">
                          {item.payload?.name || item.payload?.customer || item.payload?.id || "عنصر نظام"}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.entity === "product" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {item.entity === "product" ? "منتج" : "فاتورة"}
                        </span>
                        
                        <span className="text-gray-500">|</span>
                        
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          item.action === "create" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                        }`}>
                          {item.action === "create" ? "إضافة" : "تحديث"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sync Now Button Console */}
            <div className="pt-2 border-t" style={{ borderColor: themeColors.border || "#1C2A40" }}>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className={`w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md ${
                  isSyncing 
                    ? "bg-amber-600/60 text-white cursor-not-allowed"
                    : isOnline 
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold"
                      : "bg-slate-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-white" : "text-black"}`} />
                <span>
                  {isSyncing ? "جاري الاتصال والمزامنة..." : isOnline ? "مزامنة الآن سحابياً 🚀" : "لا يمكن المزامنة (وضع الأوفلاين)"}
                </span>
              </button>
            </div>

            {/* Historical Sync Audit Trail Logs */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 uppercase font-bold px-1 block text-right">سجل ونتائج آخر المزامنات</span>
              
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="text-center p-3 text-[10px] text-gray-500 italic">السجل فارغ. سيتم تسجيل تقارير دورتك التشغيلية للمزامنات لاحقاً هنا.</div>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-2 rounded-lg text-[10px] leading-relaxed border flex flex-col gap-1 text-right"
                      style={{ 
                        backgroundColor: "rgba(15,23,42,0.6)", 
                        borderColor: log.status === "error" ? "rgba(239,68,68,0.2)" : log.status === "warning" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"
                      }}
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="text-gray-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold ${
                            log.status === "error" ? "text-rose-400" : log.status === "warning" ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {log.operation}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "error" ? "bg-rose-500" : log.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                          }`}></span>
                        </div>
                      </div>
                      
                      <div className="text-gray-300 font-medium">
                        {log.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}
