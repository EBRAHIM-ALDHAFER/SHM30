import React, { useState, useEffect, useRef } from "react";
import { ThemeColors, Product, Customer, Invoice } from "../types";
import { Search, Command, ArrowRight, ArrowLeft, Package, User, FileText, Settings, Sparkles } from "lucide-react";

interface GlobalUnifiedSearchProps {
  theme: ThemeColors;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  onSelectProduct: (product: Product) => void;
  onSelectCustomer: (customer: Customer) => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onNavigateTab: (tabId: string, sub?: string) => void;
}

export default function GlobalUnifiedSearch({
  theme,
  products,
  customers,
  invoices,
  onSelectProduct,
  onSelectCustomer,
  onSelectInvoice,
  onNavigateTab
}: GlobalUnifiedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Key Listener for Ctrl+K / Cmd+K to toggle the palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Unified indexing search logic
  const searchResults = {
    products: query
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 4)
      : [],
    customers: query
      ? customers.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query) ||
            c.city.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 4)
      : [],
    invoices: query
      ? invoices.filter(
          (i) =>
            i.id.toLowerCase().includes(query.toLowerCase()) ||
            i.customer.toLowerCase().includes(query.toLowerCase()) ||
            i.total.toString().includes(query)
        ).slice(0, 4)
      : [],
    shortcuts: query
      ? [
          { name: "مركز المبيعات ولوحة كاشير POS", tab: "pos", sub: "" },
          { name: "إدارة المخازن والفروع الحية", tab: "warehouses", sub: "" },
          { name: "أداة ذكاء سهم برين ومراسيم الطيب", tab: "intelligent-hub", sub: "sahm-brain" },
          { name: "مركز خدمة العملاء OmniChat CRM", tab: "intelligent-hub", sub: "omnichat" },
          { name: "الحسابات ودفاتر القيود المحاسبية ERP", tab: "accounting", sub: "dashboard" },
          { name: "استوديو تخصيص الواجهات والـ Theme Studio", tab: "settings", sub: "themes" }
        ].filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      : []
  };

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.invoices.length > 0 ||
    searchResults.shortcuts.length > 0;

  const handleSelectShortcut = (s: { tab: string; sub?: string }) => {
    onNavigateTab(s.tab, s.sub);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="font-sans relative">
      {/* Search Input Trigger in Navbar/Sidebar */}
      <div className="relative">
        <input
          type="text"
          readOnly
          onClick={() => setIsOpen(true)}
          placeholder="ابحث حياً في المنصة (Ctrl + K) ..."
          className="w-full max-w-sm text-xs py-2 pr-9 pl-4 rounded-xl border font-bold text-right cursor-pointer shadow hover:border-amber-500/80 transition-all select-none"
          style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-3" />
        <span className="absolute left-3 top-2 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black bg-slate-900 text-gray-400 border border-slate-800">
          ⌘K
        </span>
      </div>

      {/* Full Screen Interactive Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 p-4 sm:p-10 flex justify-center items-start overflow-y-auto backdrop-blur-md">
          <div
            className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden mt-10 transition-all text-right animate-scale-up"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            {/* Search Input Box */}
            <div className="p-4 border-b flex items-center justify-between gap-3" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setIsOpen(false)}
                className="py-1 px-3 text-[10px] bg-slate-900 border text-gray-400 border-slate-700 hover:text-white rounded-lg cursor-pointer"
              >
                إغلاق النافذة ✕
              </button>

              <div className="flex items-center gap-3 Grow justify-end">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="ابحث بالنص، تصنيف، هاتف، فواتير أو اختصار إجرائي..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-80 text-right outline-none bg-transparent font-bold text-sm text-white"
                />
                <Search className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>

            {/* Content Output Sandbox */}
            <div className="p-5 space-y-4 max-h-[450px] overflow-y-auto">
              {!query && (
                <div className="text-center py-10 space-y-3">
                  <Command className="w-10 h-10 text-[#D4AF37] mx-auto animate-pulse" />
                  <h4 className="text-sm font-black text-white">محرك البحث الشامل والمنصي لـ Sahm OS</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    اكتب أي استفسار أو اسم زبون وسيقوم سهم بمطابقة الحقل مباشرة عبر المخازن والمبيعات ودفاتر الرقابة واليومية.
                  </p>
                </div>
              )}

              {query && !hasResults && (
                <div className="text-center py-10 text-xs text-gray-500 font-bold">
                  لم يتم العثور على أية مطابقات للعبارة المدخلة بالذكاء: "{query}". تأكد من التهجئة.
                </div>
              )}

              {query && hasResults && (
                <div className="space-y-4 text-right text-xs">
                  {/* Shortcut section */}
                  {searchResults.shortcuts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-[#D4AF37] tracking-wider uppercase block">
                        ⚙️ اختصارات تنقل المنصة الجاهزة:
                      </span>
                      {searchResults.shortcuts.map((sh, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectShortcut(sh)}
                          className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-between text-right cursor-pointer hover:border-amber-500/40 transition-all font-bold group"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
                          <span className="text-gray-200 group-hover:text-[#D4AF37] flex items-center gap-2">
                            <span>{sh.name}</span>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500/60" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer Matches */}
                  {searchResults.customers.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-sky-400 tracking-wider uppercase block">
                        👥 عملاء VIP متطابقون حياً:
                      </span>
                      {searchResults.customers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            onSelectCustomer(c);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-between text-right cursor-pointer hover:border-sky-500/40 transition-all font-bold"
                        >
                          <span className="font-mono text-gray-400">هاتف: {c.phone} | {c.city}</span>
                          <span className="text-white flex items-center gap-2">
                            <span>{c.name}</span>
                            <User className="w-4 h-4 text-sky-400" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Product Matches */}
                  {searchResults.products.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase block">
                        📦 الكتالوج ومخزون المنتجات:
                      </span>
                      {searchResults.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProduct(p);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-between text-right cursor-pointer hover:border-emerald-500/40 transition-all font-bold"
                        >
                          <span className="font-mono text-emerald-400 font-extrabold">{p.price} ر.س • الكمية: {p.stock}</span>
                          <span className="text-white flex items-center gap-2">
                            <span>{p.name} ({p.sku})</span>
                            <Package className="w-4 h-4 text-emerald-400" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Invoice Matches */}
                  {searchResults.invoices.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-rose-400 tracking-wider uppercase block">
                        📜 فواتير معقودة مسبقاً:
                      </span>
                      {searchResults.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => {
                            onSelectInvoice(inv);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-between text-right cursor-pointer hover:border-rose-500/40 transition-all font-bold"
                        >
                          <span className="font-mono font-extrabold text-white">{inv.total} ر.س | {inv.status}</span>
                          <span className="text-[#D4AF37] font-mono flex items-center gap-2">
                            <span>{inv.id} • العميل: {inv.customer}</span>
                            <FileText className="w-4 h-4 text-amber-500" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer status tip */}
            <div className="p-3 border-t bg-slate-950/60 border-slate-900 text-center text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
              <span>تلميح: اضغط Esc لإغلاق المنفذ • تم تجميع وفهرسة المحتوى لـ 2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
