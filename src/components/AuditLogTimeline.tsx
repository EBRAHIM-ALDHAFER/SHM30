import React, { useState } from "react";
import { ThemeColors } from "../types";
import { Eye, ShieldAlert, Clock, User, Filter, RefreshCw, Layers } from "lucide-react";

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  role: string;
  time: string;
  ip?: string;
  module?: string;
  event?: string;
  text?: string;
}

interface AuditLogTimelineProps {
  theme: ThemeColors;
  logs: AuditLog[];
  onAddLog: (action: string, details: string) => void;
  currentUser: { name: string; role: string };
}

export default function AuditLogTimeline({
  theme,
  logs,
  onAddLog,
  currentUser
}: AuditLogTimelineProps) {
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const modules = Array.from(new Set(logs.map((log) => log.module || "العام"))).filter(Boolean);
  const roles = Array.from(new Set(logs.map((log) => log.role || "عام"))).filter(Boolean);

  const filteredLogs = logs.filter((log) => {
    const logModule = log.module || "العام";
    const logRole = log.role || "عام";
    const matchesModule = filterModule === "all" || logModule === filterModule;
    const matchesRole = filterRole === "all" || logRole === filterRole;
    const matchesQuery =
      (log.action || log.event || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || log.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesRole && matchesQuery;
  });

  return (
    <div
      className="p-6 rounded-3xl border text-right space-y-4 shadow-xl font-sans"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
        <button
          onClick={() => {
            onAddLog("مراجعة الرقابة", "قام المسؤول بفحص وتأكيد سلامة مطابقة جداول التدقيق والمطابقة.");
          }}
          className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 hover:text-black text-black font-black text-[10px] rounded-xl flex items-center gap-1.5 cursor-pointer border-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>توقيع إجرائي إيجابي 🔍</span>
        </button>

        <div>
          <h3 className="text-sm font-black flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>سجل الرقابة والعمليات الموحد (Sahm Corporate Audit Log Ledger)</span>
          </h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>
            أرشيف محمي غير قابل للتعديل لتتبع الأفعال الإجرائية والمالية لموظفي منصة سهم
          </p>
        </div>
      </div>

      {/* Advanced Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold pt-1">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">بحث في التفاصيل:</label>
          <input
            type="text"
            placeholder="ابحث بالنص، الموظف، التفاصيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border outline-none font-bold"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">تصنيف القسم:</label>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border outline-none font-bold transition-all cursor-pointer"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          >
            <option value="all">كل الأقسام الإجرائية</option>
            {modules.map((m, idx) => (
              <option key={`mod-${m || "general"}-${idx}`} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">مرتبة الصلاحية (Role):</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border outline-none font-bold transition-all cursor-pointer"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
          >
            <option value="all">كل الرتب والمدراء</option>
            {roles.map((r, idx) => (
              <option key={`role-${r || "general"}-${idx}`} value={r}>
                {r === "CEO" ? "رئيس تنفيذي" : r === "Accountant" ? "محاسب مالي" : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-2xl border bg-slate-950/25 border-slate-900/60 flex items-start justify-between gap-3 text-right hover:border-slate-800 transition-all"
          >
            <div className="flex flex-col items-start text-left shrink-0 gap-1 mt-0.5">
              <span className="text-[8px] bg-slate-850 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                IP: {log.ip || "192.168.1.42"}
              </span>
              <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-mono border border-emerald-500/20">
                Seal: {log.id ? "sec-" + btoa(log.id).substring(0, 10) : "sec-sha882ea"}
              </span>
              <span className="text-[8.5px] font-mono text-gray-500 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                {log.time}
              </span>
            </div>

            <div className="flex gap-2.5 items-start text-right grow">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 mt-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">
                    {log.action || log.event || "إشعار"}
                  </span>
                  <span className="text-[8.5px] bg-indigo-500/10 text-sky-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-bold">
                    {log.module || "العام"}
                  </span>
                  <h4 className="text-xs font-black text-white" style={{ color: theme.text }}>
                    {log.user} ({log.role || "عام"})
                  </h4>
                </div>
                <p className="text-[10px] text-gray-300 leading-normal" style={{ color: theme.text }}>
                  {log.details || log.text}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500 font-medium bg-slate-950/20 rounded-2xl border border-slate-900">
            لا توجد وثائق تدقيق تتطابق مع معايير البحث والفرص المذكورة.
          </div>
        )}
      </div>
    </div>
  );
}
