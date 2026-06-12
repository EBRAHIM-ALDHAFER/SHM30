import React from "react";

export type QuickActionsBarProps = {
  onOpenPOS: () => void;
  onOpenInventory: () => void;
  onOpenReports: () => void;
  onSwitchBranch: () => void;
  onSyncData: () => void;
  canOpenPOS?: boolean;
  canManageInventory?: boolean;
  canViewReports?: boolean;
};

export default function QuickActionsBar({
  onOpenPOS,
  onOpenInventory,
  onOpenReports,
  onSwitchBranch,
  onSyncData,
  canOpenPOS = true,
  canManageInventory = true,
  canViewReports = true,
}: QuickActionsBarProps) {
  return (
    <section className="mt-4 text-right" dir="rtl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-yellow-200">
          أوامر التشغيل السريعة
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {canOpenPOS && (
          <button
            onClick={onOpenPOS}
            className="rounded-2xl bg-yellow-400 hover:bg-yellow-300 px-5 py-3 text-sm font-bold text-black transition-all cursor-pointer active:scale-95"
          >
            🧾 نقطة بيع الشاشة الكاملة
          </button>
        )}

        {canManageInventory && (
          <button
            onClick={onOpenInventory}
            className="rounded-2xl border border-yellow-500/20 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-yellow-500/10 transition-all cursor-pointer active:scale-95"
          >
            📦 إدارة المخزون
          </button>
        )}

        {canViewReports && (
          <button
            onClick={onOpenReports}
            className="rounded-2xl border border-yellow-500/20 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-yellow-500/10 transition-all cursor-pointer active:scale-95"
          >
            📊 غرفة تحليلات التقارير
          </button>
        )}

        <button
          onClick={onSwitchBranch}
          className="rounded-2xl border border-yellow-500/20 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-yellow-500/10 transition-all cursor-pointer active:scale-95"
        >
          🔀 تبديل الفرع الحالي
        </button>

        <button
          onClick={onSyncData}
          className="rounded-2xl border border-yellow-500/20 bg-black/30 px-4 py-3 text-sm font-bold text-yellow-200 hover:bg-yellow-500/10 transition-all cursor-pointer active:scale-95"
        >
          🔄 مزامنة البيانات
        </button>
      </div>
    </section>
  );
}
