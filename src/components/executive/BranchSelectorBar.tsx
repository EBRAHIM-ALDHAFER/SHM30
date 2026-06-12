import React from "react";

export type BranchItem = {
  id: string;
  name: string;
  city?: string;
  storeName?: string;
  isActive?: boolean;
  status?: "active" | "inactive";
};

export type BranchSelectorBarProps = {
  branches: BranchItem[];
  currentBranchId?: string;
  onSelectBranch: (branchId: string) => void;
  onShowAllBranches: () => void;
  showAllState?: boolean;
};

export default function BranchSelectorBar({
  branches,
  currentBranchId,
  onSelectBranch,
  onShowAllBranches,
  showAllState = false,
}: BranchSelectorBarProps) {
  return (
    <section className="mt-5 border-t border-yellow-500/10 pt-4 text-right" dir="rtl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-yellow-250 text-yellow-250 text-yellow-200">
          الفروع النشطة المرتبطة
        </h3>

        <button
          onClick={onShowAllBranches}
          className="rounded-xl border border-yellow-500/20 px-3 py-1.5 text-xs text-yellow-200 hover:bg-yellow-500/10 transition-colors cursor-pointer"
        >
          {showAllState ? "تصغير ▲" : "عرض الكل"}
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-yellow-500/20">
        {branches.map((branch) => {
          const active = branch.id === currentBranchId;

          return (
            <button
              key={branch.id}
              onClick={() => onSelectBranch(branch.id)}
              className={[
                "min-w-[165px] max-w-[190px] rounded-2xl border px-4 py-3 text-right transition cursor-pointer shrink-0 select-none",
                active
                  ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_18px_rgba(234,179,8,0.18)]"
                  : "border-white/10 bg-black/20 hover:border-yellow-500/30 hover:bg-yellow-500/5",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-white">
                  {branch.name}
                </span>

                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    branch.status === "inactive" ? "bg-red-400" : "bg-emerald-400",
                  ].join(" ")}
                />
              </div>

              <div className="mt-1 truncate text-[11px] text-white/50">
                {branch.city || branch.storeName || "فرع نشط"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
