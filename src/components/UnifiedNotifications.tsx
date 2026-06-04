import React from "react";
import { ThemeColors } from "../types";
import { Bell, Check, Trash2, Shield, Info, AlertTriangle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface SystemNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  type: "success" | "warning" | "info" | "critical" | "ai";
  read: boolean;
  module?: string;
}

interface UnifiedNotificationsProps {
  theme: ThemeColors;
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onAddNotification: (title: string, text: string, type: SystemNotification["type"], module?: string) => void;
}

export default function UnifiedNotifications({
  theme,
  notifications,
  onMarkRead,
  onClearAll,
  onAddNotification
}: UnifiedNotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeStyles = (type: SystemNotification["type"]) => {
    switch (type) {
      case "success":
        return {
          icon: <Check className="w-4 h-4 text-emerald-400" />,
          bg: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-400"
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          bg: "bg-amber-500/10 border-amber-500/20",
          text: "text-amber-500"
        };
      case "critical":
        return {
          icon: <Shield className="w-4 h-4 text-rose-500" />,
          bg: "bg-rose-500/15 border-rose-500/35 animate-pulse",
          text: "text-rose-400 font-extrabold"
        };
      case "ai":
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />,
          bg: "bg-purple-500/10 border-purple-500/20",
          text: "text-purple-400"
        };
      case "info":
      default:
        return {
          icon: <Info className="w-4 h-4 text-sky-400" />,
          bg: "bg-sky-500/10 border-sky-500/20",
          text: "text-sky-400"
        };
    }
  };

  return (
    <div
      className="p-6 rounded-3xl border text-right space-y-4 shadow-xl font-sans"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClearAll}
            className="p-1 px-2.5 rounded-lg bg-gray-500/15 hover:bg-rose-500/20 hover:text-rose-400 text-[10.5px] font-black tracking-tight text-gray-400 transition-all flex items-center gap-1 cursor-pointer select-none border-0"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح الكل</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black animate-bounce">
              {unreadCount} جديد
            </span>
          )}
          <div>
            <h3 className="text-sm font-black flex items-center gap-1.5" style={{ color: theme.text }}>
              <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>مركز الإشعارات الموحد (Sahm Unified Notification Center)</span>
            </h3>
            <p className="text-[10px]" style={{ color: theme.muted }}>
              بث تنبيهات مبيعات الفروع المباشرة، حركة المخزون، وذكاء سهم برين
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => {
            const styles = getTypeStyles(notif.type);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-right transition-all luxury-card-hover ${
                  styles.bg
                } ${!notif.read ? "ring-1 ring-amber-500/10" : ""}`}
                style={{ backgroundColor: theme.surface }}
              >
                <div className="flex items-center gap-1">
                  {!notif.read && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      className="p-1 rounded-lg bg-gray-500/10 hover:bg-emerald-500/35 transition-all text-gray-400 hover:text-white cursor-pointer border-0"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2.5 items-start text-right grow">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 mt-0.5">
                    {styles.icon}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 justify-end">
                      {notif.module && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/20 px-1.5 py-0.5 rounded bg-amber-500/5">
                          {notif.module}
                        </span>
                      )}
                      <h4 className="text-xs font-black" style={{ color: theme.text }}>
                        {notif.title}
                      </h4>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-gray-300" style={{ color: theme.text }}>
                      {notif.text}
                    </p>
                    <span className="block text-[8px] font-mono text-gray-400 mt-1">
                      ⌛ {notif.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-500 font-medium bg-slate-950/20 rounded-2xl border border-slate-900">
            ⏳ صندوق الإشعارات فارغ بالكامل حالياً. جرب إحداث طلبات POS لتلقي البث المباشر.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-right">
        <button
          onClick={() =>
            onAddNotification(
              "تنبيه ذكي",
              "ارتفعت نسبة زيارات متجر مراسيم الطيب بالرياض بنسبة ١٢٪ في النصف ساعة الأخيرة.",
              "success",
              "TRAFFIC"
            )
          }
          className="p-2 bg-slate-900 border border-slate-800 hover:border-amber-500/20 rounded-xl text-[9px] font-black text-gray-300 cursor-pointer"
        >
          ⚡ محاكاة إشعار مبيعات
        </button>
        <button
          onClick={() =>
            onAddNotification(
              "تحذير مخزوني حرج",
              "تجاوز صنف عود هندي سوبر التخزين الأدنى المسموح به في مستودع الرياض الرئيسي.",
              "warning",
              "STOCKS"
            )
          }
          className="p-2 bg-slate-900 border border-slate-800 hover:border-rose-500/20 rounded-xl text-[9px] font-black text-gray-300 cursor-pointer"
        >
          ⚠️ محاكاة إنذار مخزون
        </button>
      </div>
    </div>
  );
}
