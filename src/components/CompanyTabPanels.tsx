import React from "react";
import { 
  Building, MapPin, Archive, Users, Search, Plus, Trash2, Clock, Eye, Layers, CreditCard, ChevronRight, FileText, Check 
} from "lucide-react";
import { CompanyProfile, StoreProfile, Branch, Warehouse } from "../types";

interface CompanyTabPanelsProps {
  mainActiveTab: "overview" | "companies" | "stores" | "branches" | "warehouses" | "connections";
  setMainActiveTab: (tab: "overview" | "companies" | "stores" | "branches" | "warehouses" | "connections") => void;
  companies: CompanyProfile[];
  stores: StoreProfile[];
  setStores: React.Dispatch<React.SetStateAction<StoreProfile[]>>;
  branches: Branch[];
  warehouses: Warehouse[];
  users: any[];
  theme: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  storesFilter: "active" | "archived";
  setStoresFilter: (filter: "active" | "archived") => void;
  filteredStores: StoreProfile[];
  handleOpenCreateCompany: () => void;
  handleOpenCreateNew: () => void;
  handleOpenEdit: (s: StoreProfile) => void;
  handleToggleActive: (id: string, current: boolean) => void;
  handleToggleArchive: (id: string, force: boolean) => void;
  handleRestoreStore: (id: string, name: string) => void;
  handleSetDefault: (id: string) => void;
  handleDeleteStore: (id: string, name: string) => void;
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  
  // Company state
  viewingCompany360Id: string | null;
  setViewingCompany360Id: (id: string | null) => void;
  isCreatingCompany: boolean;
  setIsCreatingCompany: (b: boolean) => void;
  company360ActiveTab: "overview" | "legal" | "stores" | "branches" | "warehouses" | "users" | "docs" | "timeline";
  setCompany360ActiveTab: (tab: "overview" | "legal" | "stores" | "branches" | "warehouses" | "users" | "docs" | "timeline") => void;
  handleSaveCompany: () => void;
  handleEditCompany: (c: CompanyProfile) => void;
  userRole?: string;

  // Company inputs
  compFormName: string;
  setCompFormName: (v: string) => void;
  compFormLegalName: string;
  setCompFormLegalName: (v: string) => void;
  compFormCrNumber: string;
  setCompFormCrNumber: (v: string) => void;
  compFormCrDate: string;
  setCompFormCrDate: (v: string) => void;
  compFormCrExpiryDate: string;
  setCompFormCrExpiryDate: (v: string) => void;
  compFormVatNumber: string;
  setCompFormVatNumber: (v: string) => void;
  compFormUnified700: string;
  setCompFormUnified700: (v: string) => void;
  compFormAddress: string;
  setCompFormAddress: (v: string) => void;
  compFormManager: string;
  setCompFormManager: (v: string) => void;
  compFormPhone: string;
  setCompFormPhone: (v: string) => void;
  compFormEmail: string;
  setCompFormEmail: (v: string) => void;
  compFormBankAccount: string;
  setCompFormBankAccount: (v: string) => void;
  compFormStatus: "active" | "suspended" | "draft";
  setCompFormStatus: (v: "active" | "suspended" | "draft") => void;
  compFormSubscription: string;
  setCompFormSubscription: (v: string) => void;
  compFormLogo: string;
  setCompFormLogo: (v: string) => void;
  compFormCover: string;
  setCompFormCover: (v: string) => void;
  compFormInvoiceLogo: string;
  setCompFormInvoiceLogo: (v: string) => void;
  compFormStamp: string;
  setCompFormStamp: (v: string) => void;

  // Branch and warehouse modals
  setShowBranchModal: (b: boolean) => void;
  setEditingBranch: (b: any) => void;
  setBranchFormName: (v: string) => void;
  setBranchFormCity: (v: string) => void;
  setBranchFormAddress: (v: string) => void;
  setBranchFormManager: (v: string) => void;
  setBranchFormPhone: (v: string) => void;
  setBranchFormWh: (v: string) => void;
  setBranchFormType: (v: string) => void;
  setBranchFormStatus: (v: string) => void;
  branchFormCompanyId?: string;
  setBranchFormCompanyId?: (v: string) => void;
  branchFormStoreId?: string;
  setBranchFormStoreId?: (v: string) => void;
  setBranchFormAddressProfile?: (v: any) => void;

  setShowWhModal: (b: boolean) => void;
  setWhFormName: (v: string) => void;
  setWhFormType: (v: string) => void;
  setWhFormLocation: (v: string) => void;
  setWhFormCapacity: (v: number) => void;
  setWhFormBranch: (v: string) => void;
  whFormCompanyId?: string;
  setWhFormCompanyId?: (v: string) => void;
}

export const CompanyTabPanels: React.FC<CompanyTabPanelsProps> = ({
  mainActiveTab,
  setMainActiveTab,
  companies,
  stores,
  userRole,
  setStores,
  branches,
  warehouses,
  users,
  theme,
  searchTerm,
  setSearchTerm,
  storesFilter,
  setStoresFilter,
  filteredStores,
  handleOpenCreateCompany,
  handleOpenCreateNew,
  handleOpenEdit,
  handleToggleActive,
  handleToggleArchive,
  handleRestoreStore,
  handleSetDefault,
  handleDeleteStore,
  activeStoreId,
  setActiveStoreId,

  viewingCompany360Id,
  setViewingCompany360Id,
  isCreatingCompany,
  setIsCreatingCompany,
  company360ActiveTab,
  setCompany360ActiveTab,
  handleSaveCompany,
  handleEditCompany,

  compFormName,
  setCompFormName,
  compFormLegalName,
  setCompFormLegalName,
  compFormCrNumber,
  setCompFormCrNumber,
  compFormCrDate,
  setCompFormCrDate,
  compFormCrExpiryDate,
  setCompFormCrExpiryDate,
  compFormVatNumber,
  setCompFormVatNumber,
  compFormUnified700,
  setCompFormUnified700,
  compFormAddress,
  setCompFormAddress,
  compFormManager,
  setCompFormManager,
  compFormPhone,
  setCompFormPhone,
  compFormEmail,
  setCompFormEmail,
  compFormBankAccount,
  setCompFormBankAccount,
  compFormStatus,
  setCompFormStatus,
  compFormSubscription,
  setCompFormSubscription,
  compFormLogo,
  setCompFormLogo,
  compFormCover,
  setCompFormCover,
  compFormInvoiceLogo,
  setCompFormInvoiceLogo,
  compFormStamp,
  setCompFormStamp,

  setShowBranchModal,
  setEditingBranch,
  setBranchFormName,
  setBranchFormCity,
  setBranchFormAddress,
  setBranchFormManager,
  setBranchFormPhone,
  setBranchFormWh,
  setBranchFormType,
  setBranchFormStatus,
  branchFormCompanyId,
  setBranchFormCompanyId,
  branchFormStoreId,
  setBranchFormStoreId,
  setBranchFormAddressProfile,

  setShowWhModal,
  setWhFormName,
  setWhFormType,
  setWhFormLocation,
  setWhFormCapacity,
  setWhFormBranch,
  whFormCompanyId,
  setWhFormCompanyId,
}) => {

  const handleCompanyImageUpload = (type: "logo" | "cover" | "invoice" | "stamp") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64 = event.target.result as string;
            if (type === "logo") setCompFormLogo(base64);
            if (type === "cover") setCompFormCover(base64);
            if (type === "invoice") setCompFormInvoiceLogo(base64);
            if (type === "stamp") setCompFormStamp(base64);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const sahmMiniMarkPngUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop";

  // Render Comp Form if Creating
  if (isCreatingCompany) {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[10px] text-[#D4AF37] block font-black uppercase">
              {viewingCompany360Id ? "• تعديل وتحديث بيانات المنشأة" : "• تسجيل وتأسيس منشأة جديدة"}
            </span>
            <h3 className="text-sm font-black text-white">{compFormName || "يرجى كتابة اسم المنشأة..."}</h3>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsCreatingCompany(false)}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-gray-400 hover:bg-slate-900 cursor-pointer"
            >
              إلغاء وتراجع 🛑
            </button>
            <button
              onClick={handleSaveCompany}
              className="py-2 px-5 rounded-xl text-xs font-black bg-amber-500 text-black hover:bg-amber-400 cursor-pointer border-none"
            >
              {viewingCompany360Id ? "حفظ التعديلات 🏢💾" : "حفظ وتأسيس المنشأة 🏢💾"}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
            <div>
              <label className="block text-gray-400 mb-1.5">• اسم المنشأة التجاري (المتداول):</label>
              <input
                type="text"
                value={compFormName}
                onChange={(e) => setCompFormName(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
                placeholder="مثال: مجموعة سهم لتقنية المعلومات"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• الاسم القانوني الرسمي للشركة (بالسجل):</label>
              <input
                type="text"
                value={compFormLegalName}
                onChange={(e) => setCompFormLegalName(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
                placeholder="مثال: شركة سهم لتقنية المعلومات وحلول الحاسوب ش.م.م"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div>
              <label className="block text-gray-400 mb-1.5">• رقم السجل التجاري الرسمي (C.R):</label>
              <input
                type="text"
                value={compFormCrNumber}
                onChange={(e) => setCompFormCrNumber(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-left font-mono"
                placeholder="1010xxxxxx"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• تاريخ إصدار السجل:</label>
              <input
                type="text"
                value={compFormCrDate}
                onChange={(e) => setCompFormCrDate(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                placeholder="١٤٤٥-٠٢-١٥"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• تاريخ انتهاء السجل:</label>
              <input
                type="text"
                value={compFormCrExpiryDate}
                onChange={(e) => setCompFormCrExpiryDate(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                placeholder="١٤٥٠-٠٢-١٥"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div>
              <label className="block text-gray-400 mb-1.5">• الرقم الضريبي الموحد (VAT):</label>
              <input
                type="text"
                value={compFormVatNumber}
                onChange={(e) => setCompFormVatNumber(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-left font-mono"
                placeholder="3022xxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• الرقم الموحد للمنشأة (700):</label>
              <input
                type="text"
                value={compFormUnified700}
                onChange={(e) => setCompFormUnified700(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-left font-mono"
                placeholder="7001xxxxxx"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• مالك الكيان / المدير المسؤول:</label>
              <input
                type="text"
                value={compFormManager}
                onChange={(e) => setCompFormManager(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right"
                placeholder="مثال: عبد الرحمن بن فهد"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right font-sans">
            <div>
              <label className="block text-gray-400 mb-1.5">• رقم هاتف المنشأة للتواصل:</label>
              <input
                type="text"
                value={compFormPhone}
                onChange={(e) => setCompFormPhone(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-left font-mono"
                placeholder="+966xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• البريد الإلكتروني للمنشأة:</label>
              <input
                type="text"
                value={compFormEmail}
                onChange={(e) => setCompFormEmail(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-left font-mono"
                placeholder="billing@company.com"
              />
            </div>
          </div>

          <div className="text-right">
            <label className="block text-gray-400 mb-1.5">• العنوان الوطني المعتمد (سبل):</label>
            <input
              type="text"
              value={compFormAddress}
              onChange={(e) => setCompFormAddress(e.target.value)}
              className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-sans"
              placeholder="مثال: الرياض، حي المروج، المبنى الإضافي 2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
            <div>
              <label className="block text-gray-400 mb-1.5">• حساب الإيبان البنكي للمنشأة (IBAN):</label>
              <input
                type="text"
                value={compFormBankAccount}
                onChange={(e) => setCompFormBankAccount(e.target.value)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-left font-mono"
                placeholder="SAxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5">• حالة الكيان الرسمي للمنشأة:</label>
              <select
                value={compFormStatus}
                onChange={(e) => setCompFormStatus(e.target.value as any)}
                className="w-full text-xs rounded-xl py-2.5 px-3 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
              >
                <option value="active">🟢 نشطة وموثقة بشكل قانوني كامل</option>
                <option value="suspended">🔴 موقوفة مؤقتاً ومقيدة حركياً</option>
                <option value="draft">🟡 قيد التأسيس وإعداد الوثائق</option>
              </select>
            </div>
          </div>

          {/* Visual Identity Uploads */}
          <div className="pt-4 border-t border-slate-800/60 font-sans text-right">
            <h4 className="text-xs font-black text-amber-500 mb-3 block">🎨 الهوية البصرية وشعارات المنشأة:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="block text-[10px] text-gray-500 mb-1">الشعار الرسمي للمنشأة (Logo):</span>
                <div className="space-y-1.5">
                  {compFormLogo && (
                    <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                      <img src={compFormLogo} className="h-full w-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setCompFormLogo("")}
                        className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                      >
                        حذف الشعار
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => handleCompanyImageUpload("logo")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>📂</span>
                    <span>{compFormLogo ? "تغيير الشعار" : "رفع الشعار"}</span>
                  </button>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 mb-1">صورة الغلاف (Cover):</span>
                <div className="space-y-1.5">
                  {compFormCover && (
                    <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                      <img src={compFormCover} className="h-full w-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setCompFormCover("")}
                        className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                      >
                        حذف الغلاف
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => handleCompanyImageUpload("cover")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>📂</span>
                    <span>{compFormCover ? "تغيير الغلاف" : "رفع الغلاف"}</span>
                  </button>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 mb-1">شعار الفواتير الموحد (Invoice):</span>
                <div className="space-y-1.5">
                  {compFormInvoiceLogo && (
                    <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                      <img src={compFormInvoiceLogo} className="h-full w-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setCompFormInvoiceLogo("")}
                        className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                      >
                        حذف الشعار
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => handleCompanyImageUpload("invoice")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>📂</span>
                    <span>{compFormInvoiceLogo ? "تغيير الفاتورة" : "رفع الفاتورة"}</span>
                  </button>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 mb-1">الختم الملون المعتمد (Stamp):</span>
                <div className="space-y-1.5">
                  {compFormStamp && (
                    <div className="relative w-full h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
                      <img src={compFormStamp} className="h-full w-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setCompFormStamp("")}
                        className="absolute inset-0 bg-red-950/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                      >
                        حذف الختم
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => handleCompanyImageUpload("stamp")} className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs rounded-xl text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>📂</span>
                    <span>{compFormStamp ? "تغيير الختم" : "رفع الختم"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Comp File 360 if Viewing Company
  if (viewingCompany360Id) {
    const currentComp = companies.find(c => c.id === viewingCompany360Id);
    if (!currentComp) return null;

    // Calculate details
    const linkedSts = stores.filter(s => (s.companyId === currentComp.id || s.company_id === currentComp.id));
    const linkedStIds = linkedSts.map(s => s.id);
    const linkedBrs = branches.filter(b => linkedStIds.includes(b.storeId || b.store_id || ""));
    const linkedWhs = warehouses.filter(w => linkedStIds.includes(w.storeId || w.store_id || ""));

    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        {/* Cover / Header Card */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          <div className="h-28 md:h-36 bg-gradient-to-r from-amber-500/20 to-[#0e1626] relative flex items-center justify-between p-6">
            <div className="absolute inset-0 w-full h-full object-cover opacity-10 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop')]" />
            
            <div className="z-10 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-right">
              <span className="text-[9.5px] text-amber-500 font-extrabold block">الباقة الحالية للمجموعة:</span>
              <span className="text-xs text-white font-black">{currentComp.subscriptionPlan || "باقة سهم البلاتينية 👑"}</span>
            </div>

            <div className="z-10 flex gap-2">
              <button 
                onClick={() => handleEditCompany(currentComp)}
                className="py-1.5 px-4 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#bfa032] text-black cursor-pointer border-none shadow transition-all font-sans"
              >
                تعديل بيانات المنشأة ✏️
              </button>
              <button 
                onClick={() => {
                  setViewingCompany360Id(null);
                  setMainActiveTab("companies");
                }}
                className="py-1.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-white cursor-pointer border border-slate-850 transition-all font-sans"
              >
                عودة للقائمة ↩️
              </button>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-[#0e1525] border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-500/50 shadow-lg -mt-12 overflow-hidden shrink-0 z-10 flex items-center justify-center">
                {currentComp.logoUrl ? (
                  <img src={currentComp.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Building className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{currentComp.name}</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded leading-none ${
                    currentComp.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                    currentComp.status === "suspended" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                    {currentComp.status === "active" ? "نشطة وموثقة" :
                     currentComp.status === "suspended" ? "موقوفة مؤقتاً" : "قيد التأسيس"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{currentComp.companyLegalName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2" dir="rtl">
          {[
            { id: "overview", label: "البيانات القانونية والمالية 📜" },
            { id: "branches", label: "الفروع الشغالة التابعة 📍" },
            { id: "warehouses", label: "مستودعات الإمداد السائل 📦" },
            { id: "stores", label: "المتاجر التابعة لهيكل المنشأة 🏬" },
            { id: "users", label: "المستخدمين والموظفين المعينين 👥" },
            { id: "docs", label: "ملف السجلات والوثائق الموثقة 📂" },
            { id: "timeline", label: "سجل العمليات والأنشطة ⏳" }
          ].map(tb => (
            <button
              key={tb.id}
              onClick={() => setCompany360ActiveTab(tb.id as any)}
              className={`py-2 px-3 rounded-lg text-xs transition-all border-none font-bold cursor-pointer font-sans whitespace-nowrap ${
                company360ActiveTab === tb.id ? "bg-amber-500 text-black font-extrabold" : "bg-slate-900 text-gray-400 hover:bg-slate-800"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Active Tab Panel */}
        <div className="p-5 md:p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          {company360ActiveTab === "overview" && (
            <div className="space-y-4 font-sans text-xs text-right pr-1">
              <h4 className="text-xs font-black text-amber-500 mb-3 block border-b border-slate-800 pb-1 flex items-center gap-1.5 justify-end">
                <span>الهيكل القانوني والبيانات المسجلة للمكتب الرئيسي</span>
                <Building className="w-3.5 h-3.5" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">اسم الكيان القانوني للمجموعة:</span>
                  <span className="text-white font-bold block text-xs">{currentComp.companyLegalName}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">السجل التجاري (C.R):</span>
                  <span className="text-white font-mono block text-xs font-bold text-left">{currentComp.crNumber}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">الرقم الضريبي الموحد VAT:</span>
                  <span className="text-white font-mono block text-xs font-bold text-left">{currentComp.vatNumber || "غير متوفر"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">تاريخ السجل التجاري:</span>
                  <span className="text-white font-mono block text-xs font-bold">{currentComp.crDate || "١٤٤٠-٠١-٠١"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">تاريخ انتهاء السجل:</span>
                  <span className="text-white font-mono block text-xs font-bold text-red-400">{currentComp.crExpiryDate || "١٤٥٠-٠٢-١٥"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">الرقم الموحد 700 للمنشأة:</span>
                  <span className="text-white font-mono block text-xs font-bold text-left">{currentComp.unifiedNumber700 || "7001452637"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 md:col-span-3">
                  <span className="text-gray-450 block mb-1">العنوان الوطني المعتمدة بسبل:</span>
                  <span className="text-white font-sans block text-xs">{currentComp.address || "المملكة العربية السعودية، الرياض"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">المالك / المدير المسؤول:</span>
                  <span className="text-white font-sans block text-xs font-black">{currentComp.managerName || "عبد الرحمن بن فهد السجيني"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">هاتف التواصل الرسمي:</span>
                  <span className="text-white font-mono block text-xs font-bold text-left">{currentComp.phone || "920011400"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-gray-450 block mb-1">البريد الإلكتروني للكيان:</span>
                  <span className="text-white font-mono block text-xs text-left">{currentComp.email || "info@sahm.group"}</span>
                </div>
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 md:col-span-3">
                  <span className="text-amber-500 font-extrabold block mb-1 flex items-center justify-end gap-1">
                    <span>تفاصيل الحساب البنكي المعتمد للمنشأة (IBAN)</span>
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-white block font-mono text-[13px] font-black tracking-widest text-left mt-2">{currentComp.bankAccount || "SA80000001010345678901"}</span>
                </div>

                {/* Visual Identity Showcase */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 md:col-span-3 text-right">
                  <span className="text-gray-400 font-black block mb-3 flex items-center justify-end gap-1">
                    <span>الهوية البصرية والرسومية المعتمدة للمنشأة</span>
                    <span>🎨</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">الشعار الرسمي:</span>
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-900">
                        {currentComp.logoUrl ? (
                          <img src={currentComp.logoUrl} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold">غير متوفر</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">صورة الغلاف:</span>
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-900">
                        {currentComp.coverUrl ? (
                          <img src={currentComp.coverUrl} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold">غير متوفر</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">شعار الفاتورة:</span>
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-900">
                        {(currentComp as any).invoiceLogoUrl ? (
                          <img src={(currentComp as any).invoiceLogoUrl} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold">غير متوفر</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">ختم المنشأة الملون:</span>
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-900">
                        {(currentComp as any).stampUrl ? (
                          <img src={(currentComp as any).stampUrl} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold">غير متوفر</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {company360ActiveTab === "stores" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] text-gray-500">متاجر جردية وعلامات بيع مربوطة</span>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-500" />
                  <span>المتاجر التابعة ({linkedSts.length})</span>
                </h4>
              </div>
              {linkedSts.length === 0 ? (
                <p className="text-xs text-gray-450 italic p-6 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800">لا توجد متاجر تابعة لهذه المنشأة بعد.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedSts.map(st => (
                    <div key={st.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                          <img src={st.logoUrl || "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=120&auto=format&fit=crop"} alt="Store Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <span className="text-white font-bold block text-xs">{st.name}</span>
                          <span className="text-[10px] text-gray-450 font-mono">سجل: {st.crNumber}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleOpenEdit(st)}
                        className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-slate-900 text-amber-500 hover:bg-slate-850 border border-slate-800 cursor-pointer font-sans"
                      >
                        فتح ملف المتجر 360 ⚙️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {company360ActiveTab === "branches" && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white flex items-center justify-end gap-1.5 border-b border-slate-800 pb-2">
                <span>الفروع التشغيلية التابعة ({linkedBrs.length})</span>
                <MapPin className="w-4 h-4 text-emerald-400" />
              </h4>
              {linkedBrs.length === 0 ? (
                <p className="text-xs text-gray-450 italic p-6 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800">لا توجد فروع مسجلة ملحقة بمتاجر هذه المنشأة القانونية.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedBrs.map(b => (
                    <div key={b.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 flex items-center justify-between text-right">
                      <div>
                        <span className="text-white font-bold block text-xs">{b.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{b.city} - {b.address || "موقع الفرع الفعلي"}</span>
                      </div>
                      <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{b.type || "فرع بيع بالتجزئة"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {company360ActiveTab === "warehouses" && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white flex items-center justify-end gap-1.5 border-b border-slate-800 pb-2">
                <span>مستودعات ومراكز التخزين اللوجستي ({linkedWhs.length})</span>
                <Archive className="w-4 h-4 text-indigo-400" />
              </h4>
              {linkedWhs.length === 0 ? (
                <p className="text-xs text-gray-450 italic p-6 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800">لا توجد مستودعات تخزين جردي ملحقة بالمتاجر الفاعلة.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {linkedWhs.map(w => (
                    <div key={w.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 text-right">
                      <span className="text-white font-bold block text-xs">{w.name}</span>
                      <span className="text-[9.5px] text-gray-400 block mt-1">السعة الاستيعابية: {w.capacity || 2000} طرد</span>
                      <span className="text-[9px] text-amber-500 font-bold block mt-1">النوع: {w.type === "main" ? "رئيسي مركزي" : "فرعي تجميعي"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {company360ActiveTab === "users" && (
            <div className="space-y-4 font-sans text-right">
              <h4 className="text-xs font-black text-white flex items-center justify-end gap-1.5 border-b border-slate-800 pb-2">
                <span>المستخدمين والموظفين النشطين ({users.length})</span>
                <Users className="w-4 h-4 text-purple-400" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map(u => (
                  <div key={u.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 text-right">
                    <span className="text-white font-extrabold block text-xs">{u.name}</span>
                    <span className="text-[10px] text-[#D4AF37] block mt-0.5 font-bold">{u.role === "admin" ? "مدير النظام العام" : "كاشير العمليات والتشغيل"}</span>
                    <span className="text-[9px] text-gray-500 block mt-1 font-mono">{u.email || "user@sahm.erp"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {company360ActiveTab === "docs" && (
            <div className="space-y-4 text-right">
              <h4 className="text-xs font-black text-white flex items-center justify-end gap-1.5 border-b border-slate-800 pb-2">
                <span>ملف السجلات والوثائق الضريبية والتجارية للمنشأة</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-between text-right">
                  <div>
                    <span className="text-white font-bold block text-[11px]">شهادة السجل التجاري الصادرة من وزارة التجارة</span>
                    <span className="text-[9.5px] text-gray-400">مستند الكتروني موثق | PDF</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold">موثق ✓</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-between text-right">
                  <div>
                    <span className="text-white font-bold block text-[11px]">شهادة تسجيل ضريبة القيمة المضافة (VAT)</span>
                    <span className="text-[9.5px] text-gray-400">هيئة الزكاة والضريبة والجمارك | PDF</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold">موثق ✓</span>
                </div>
              </div>
            </div>
          )}

          {company360ActiveTab === "timeline" && (
            <div className="space-y-4 text-right">
              <h4 className="text-xs font-black text-white flex items-center justify-end gap-1.5 border-b border-slate-800 pb-2">
                <span>سجل النشاط والتعديلات التاريخية للمنشأة</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </h4>
              <div className="relative border-r border-slate-800 pr-4 space-y-4">
                <div className="relative">
                  <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                  <span className="text-[10px] text-emerald-400 block font-bold font-mono">اليوم | 2026-06-05</span>
                  <p className="text-xs text-white font-bold mt-1">تحديث المنشأة القانونية وإلحاق متاجر وقنوات ERP</p>
                  <p className="text-[10px] text-gray-400">تحديث مجمع عبر خادم سهم الذكي.</p>
                </div>
                <div className="relative">
                  <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-4 ring-slate-950" />
                  <span className="text-[10px] text-amber-500 block font-bold font-mono">2024-01-01</span>
                  <p className="text-xs text-white font-bold mt-1">تأسيس منشأة مجموعة سهم القابضة للخدمات اللوجستية</p>
                  <p className="text-[10px] text-gray-400">تدشين السجل التجاري المعتمد وربط الحسابات البنكية.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // OVERVIEW TAB: SHOW BENO STATS AND HIER ARCHY TREE
  if (mainActiveTab === "overview") {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        {/* Quick statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] text-gray-400 font-extrabold block uppercase">عدد المنشآت القانونية:</span>
            <span className="text-xl font-black text-[#D4AF37] block mt-1">{companies.length} كيانات مرخصة</span>
            <p className="text-[9px] text-gray-500 leading-normal mt-1">شركات ومنشآت مرخصة وموثقة.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] text-gray-400 font-extrabold block uppercase">عدد قنوات ومتاجر البيع:</span>
            <span className="text-xl font-black text-amber-500 block mt-1">{stores.length} بوابات نشطة</span>
            <p className="text-[9px] text-gray-500 leading-normal mt-1">علامات وقنوات توزيع مبيعات مربوطة.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] text-gray-400 font-extrabold block uppercase">الفروع واللوجستيات:</span>
            <span className="text-xl font-black text-emerald-400 block mt-1">{branches.length} مواقع تشغيلية</span>
            <p className="text-[9px] text-gray-500 leading-normal mt-1">مواقع بيع ملموسة بنقاط جرد حية.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] text-gray-400 font-extrabold block uppercase">مراكز التخزين:</span>
            <span className="text-xl font-black text-indigo-400 block mt-1">{warehouses.length} مستودعات جرد</span>
            <p className="text-[9px] text-gray-500 leading-normal mt-1">مخازن جردية مغذية وقنوات التوزيع.</p>
          </div>
        </div>

        {/* Top Buttons bar for actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/20 p-4 rounded-2xl border border-slate-800/80">
          <div className="text-right flex-1">
            <h4 className="text-xs font-black text-white">التحكم والعمليات السريعة ⚡</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">أضف منشأة قانونية جديدة أم أو متجر تابع لربطهما هرمياً لتسهيل جرد الفروع وضرائب البيع.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenCreateCompany}
              className="flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#bfa032] text-black transition-all cursor-pointer border-none shadow-md flex items-center justify-center gap-1.5 font-sans"
            >
              <Building className="w-4 h-4" />
              <span>+ إضافة منشأة جديدة 🏢</span>
            </button>
            <button
              onClick={handleOpenCreateNew}
              className="flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer border-none shadow-md flex items-center justify-center gap-1.5 font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة متجر تابع 🏬</span>
            </button>
          </div>
        </div>

        {/* Hierarchy tree */}
        <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800">
          <h3 className="text-xs font-black text-white/95 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5 justify-end font-sans">
            <span>الهيكل التنظيمي الهرمي (منشآت ← متاجر ← فروع)</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </h3>
          
          <div className="space-y-6 pt-1">
            {companies.map(comp => {
              const linkedSts = stores.filter(s => (s.companyId === comp.id || s.company_id === comp.id));
              return (
                <div key={comp.id} className="relative pr-4 border-r-2 border-dashed border-slate-800 space-y-4 text-right">
                  {/* Company Root Node */}
                  <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-2.5 text-right w-full font-sans">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                        🏢
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{comp.name}</span>
                        <span className="text-[9.5px] text-[#D4AF37] font-semibold block">{comp.companyLegalName} • سجل: {comp.crNumber}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-lg whitespace-nowrap font-sans font-black">المنشأة الأم 👑</span>
                      <button 
                        onClick={() => {
                          setViewingCompany360Id(comp.id);
                          setCompany360ActiveTab("overview");
                        }}
                        className="py-1 px-2.5 bg-slate-900 hover:bg-slate-850 rounded font-bold text-[9px] text-white border-0 cursor-pointer whitespace-nowrap font-sans"
                      >
                        360 الكيان ⚙️
                      </button>
                    </div>
                  </div>

                  {/* Sub Stores level */}
                  <div className="mr-4 space-y-3">
                    {linkedSts.length === 0 ? (
                      <p className="text-[10px] text-gray-500 italic pr-4 font-sans">• لا توجد متاجر معينة تحت هذه المنشأة القانونية بعد.</p>
                    ) : (
                      linkedSts.map(st => {
                        const storeBrs = branches.filter(b => b.storeId === st.id || b.store_id === st.id);
                        return (
                          <div key={st.id} className="relative pr-4 border-r border-amber-500/20 space-y-2">
                            <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-850 hover:border-amber-500/30">
                              <div className="flex items-center gap-2 text-right">
                                <span className="text-base leading-none">🏬</span>
                                <div>
                                  <span className="text-xs font-semibold text-white block">{st.name}</span>
                                  <p className="text-[9.5px] text-gray-400 font-sans">قناة بيع فرعية مربوطة</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleOpenEdit(st)}
                                className="py-0.5 px-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-bold cursor-pointer font-sans"
                              >
                                ملف المتجر 360 📝
                              </button>
                            </div>

                            {/* Branches */}
                            <div className="mr-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {storeBrs.map(br => (
                                <div key={br.id} className="p-2 bg-slate-900/40 rounded border border-slate-850 text-right flex items-center justify-between font-sans">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-emerald-400 text-xs">📍</span>
                                    <div>
                                      <span className="text-[10px] font-bold text-gray-200 block">{br.name}</span>
                                      <span className="text-[8.5px] text-gray-400 block">{br.city} • {br.type}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${br.status === "نشط" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                    {br.status}
                                  </span>
                                </div>
                              ))}
                              {storeBrs.length === 0 && (
                                <span className="text-[9px] text-gray-500 italic pr-3 block font-sans">لم يتم تعيين فروع بيع لهذا المتجر بعد.</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // COMPANIES DIRECTORY TAB
  if (mainActiveTab === "companies") {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
          <div className="text-right">
            <h3 className="text-sm font-black text-white">المنشآت القانونية والشركات المؤسسة 🏢</h3>
            <p className="text-[10px] text-gray-400 mt-1">تتبع السجلات، الضرائب، العناوين الوطنية، والحسابات البنكية المستقلة لكل كيان مرخص.</p>
          </div>
          <button
            onClick={handleOpenCreateCompany}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-black bg-[#D4AF37] hover:bg-[#bfa032] text-black cursor-pointer border-none shadow-md transition-all font-sans"
          >
            <Building className="w-4 h-4" />
            <span>+ إضافة منشأة جديدة 🏢</span>
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 space-y-3 text-sans">
            <span className="text-4xl block">🏢</span>
            <h4 className="text-sm font-bold text-gray-300">لا توجد منشآت بعد — أضف أول منشأة</h4>
            <p className="text-xs text-gray-500">يتطلب النظام وجود منشأة قانونية واحدة على الأقل لربط المتاجر والفروع وقنوات التوزيع التابعة.</p>
            <button
              onClick={handleOpenCreateCompany}
              className="mt-2 py-2 px-4 rounded-xl text-xs font-black bg-[#D4AF37] text-black cursor-pointer border-none font-sans"
            >
              تأسيس أول منشأة الآن 🚀
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map(comp => {
              const linkedStsCount = stores.filter(s => (s.companyId === comp.id || s.company_id === comp.id)).length;
              return (
                <div 
                  key={comp.id} 
                  className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-amber-500/50 transition-all text-right space-y-4 hover:shadow-lg font-sans"
                >
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#D4AF37] flex items-center justify-center font-bold">
                        🏢
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{comp.name}</h4>
                        <span className="text-[10px] text-gray-400">{comp.companyLegalName}</span>
                      </div>
                    </div>
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded ${
                      comp.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      comp.status === "suspended" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {comp.status === "active" ? "نشطة وموثقة" : comp.status === "suspended" ? "موقوفة" : "قيد الإعداد"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-900">
                      <span className="text-gray-400 block mb-0.5">السجل التجاري:</span>
                      <span className="text-white font-mono font-bold">{comp.crNumber}</span>
                    </div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-900">
                      <span className="text-gray-400 block mb-0.5">الرقم الضريبي VAT:</span>
                      <span className="text-white font-mono font-bold">{comp.vatNumber || "غير مدخل"}</span>
                    </div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-900">
                      <span className="text-gray-400 block mb-0.5">المدير المسؤول:</span>
                      <span className="text-white font-semibold">{comp.managerName || "غير مدخل"}</span>
                    </div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-900">
                      <span className="text-gray-400 block mb-0.5">رقم هاتف التواصل:</span>
                      <span className="text-white font-mono">{comp.phone || "غير مدخل"}</span>
                    </div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-900 col-span-2">
                      <span className="text-gray-400 block mb-0.5">العنوان الوطني المعتمد:</span>
                      <span className="text-white">{comp.address || "غير متوفر"}</span>
                    </div>
                    <div className="p-2 bg-amber-500/5 rounded border border-amber-500/10 col-span-2">
                      <span className="text-amber-500 font-extrabold block mb-0.5">الحساب المالي IBAN للمبيعات:</span>
                      <span className="text-white font-mono tracking-wider font-bold text-left block text-[11px]">{comp.bankAccount || "SAxxxxxxxxxxxxxxxxxxxx"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                    <div className="flex gap-3 text-[10px] text-gray-500 font-sans">
                      <span>🏬 المتاجر التابعة: <strong className="text-white">{linkedStsCount}</strong></span>
                      <span>📍 الفروع والمواقع: <strong className="text-white">{branches.length}</strong></span>
                    </div>
                    <button
                      onClick={() => {
                        setViewingCompany360Id(comp.id);
                        setCompany360ActiveTab("overview");
                      }}
                      className="py-1.5 px-4 rounded-xl text-[10px] font-black bg-slate-900 text-[#D4AF37] hover:bg-slate-850 border border-slate-800 transition-all cursor-pointer font-sans"
                    >
                      فتح ملف المنشأة 360 ⚙️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // STORES INDEX TAB PANEL
  if (mainActiveTab === "stores") {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
          <div className="relative w-full sm:w-80">
            <span className="absolute right-3.5 top-3 text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم المتجر، السجل الضريبي أو التجاري..."
              className="w-full text-xs rounded-xl py-2.5 pr-10 pl-3.5 bg-slate-950 border border-slate-850 text-white outline-none focus:border-amber-500 text-right font-medium"
            />
          </div>
          <button
            onClick={handleOpenCreateNew}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-black bg-amber-500 text-black hover:bg-amber-400 transition-all cursor-pointer border-none shadow font-sans"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>+ إضافة متجر تابع 🏬</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-3" style={{ borderColor: theme.border }}>
            <h3 className="text-xs font-black text-white/90 flex items-center gap-1.5 pt-1">
              <Building className="w-4 h-4 text-amber-400" />
              <span>{storesFilter === "active" ? "المتاجر المعتمدة الحية النشطة" : "أرشيف المتاجر المؤرشفة"} ({filteredStores.length}):</span>
            </h3>
            
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStoresFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer border-0 ${
                  storesFilter === "active" 
                    ? "bg-amber-500 text-black shadow-sm font-sans font-extrabold" 
                    : "text-gray-400 hover:text-white bg-transparent font-sans"
                }`}
              >
                🟢 المتاجر النشطة ({stores.filter(s => !s.isArchived).length})
              </button>
              <button
                type="button"
                onClick={() => setStoresFilter("archived")}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer border-0 ${
                  storesFilter === "archived" 
                    ? "bg-amber-500 text-black shadow-sm font-sans font-extrabold" 
                    : "text-gray-400 hover:text-white bg-transparent font-sans"
                }`}
              >
                🗃️ المتاجر المؤرشفة ({stores.filter(s => !!s.isArchived).length})
              </button>
            </div>
          </div>

          {filteredStores.length === 0 ? (
            <p className="text-xs text-gray-405 italic text-center p-8 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">لم يتم العثور على أي متجر تابع يطابق معايير البحث.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {storesFilter === "active" && ["platform_owner", "system_admin", "system_owner"].includes(userRole || "") && (
                <div 
                  className={`p-4 md:p-5 rounded-2xl border transition-all text-right space-y-4 hover:shadow-lg ${
                    activeStoreId === "all_stores" ? "bg-amber-950/15 border-amber-500/60" : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-slate-800 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs md:text-sm font-black text-white leading-normal">جميع المتاجر (العرض الموحد)</h4>
                          {activeStoreId === "all_stores" && (
                            <span className="bg-amber-400 text-black text-[7.5px] font-black px-1.5 py-0.5 rounded font-sans leading-none">نشط باللوحة</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 font-sans">عرض شامل وموحد لكل المعاملات والمستندات بجميع الفروع والمتاجر التابعة.</p>
                      </div>
                    </div>
                    {activeStoreId !== "all_stores" && (
                      <button
                        onClick={() => setActiveStoreId("all_stores")}
                        className="py-1.5 px-3 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer font-sans"
                      >
                        تفعيل وضع العرض الموحد
                      </button>
                    )}
                  </div>
                </div>
              )}
              {filteredStores.map(st => {
                const isActive = st.isActive !== false;
                const hasPlatforms = Object.values(st.platforms || {}).some(p => (p as any).isConnected);
                const parentComp = companies.find(c => c.id === st.companyId || c.id === st.company_id);

                return (
                  <div 
                    key={st.id} 
                    className={`p-4 md:p-5 rounded-2xl border transition-all text-right space-y-4 hover:shadow-lg ${
                      st.id === activeStoreId ? "bg-amber-950/15 border-amber-500/60" : "bg-slate-950/40 border-slate-855 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-slate-850 shadow-inner flex items-center justify-center shrink-0 overflow-hidden">
                          <img src={st.logoUrl || "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=120&auto=format&fit=crop"} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs md:text-sm font-black text-white leading-normal">{st.name}</h4>
                            {st.id === activeStoreId && (
                              <span className="bg-amber-400 text-black text-[7.5px] font-black px-1.5 py-0.5 rounded font-sans leading-none">نشط باللوحة 👑</span>
                            )}
                            {st.isDefault && (
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/35 text-[7px] font-black px-1.5 py-0.5 rounded leading-none">افتراضي المبيعات 🏆</span>
                            )}
                          </div>
                          
                          {/* Parent Company badge */}
                          {parentComp ? (
                            <div className="mt-1 flex items-center gap-1 text-[9.5px] text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/10 w-fit">
                              <span>🏢 التبعية القانونية:</span>
                              <strong className="font-extrabold">{parentComp.name}</strong>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-1 text-[9.5px] text-gray-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850 w-fit">
                              <span>🏢 مستقل (يتبع إدارة النظام)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap sm:justify-end font-sans">
                        <div className="text-right text-xs pr-1 border-r border-slate-900 mr-2 sm:mr-0 pl-1">
                          <span className="text-[10px] text-slate-400 block font-bold leading-none">رقم السجل:</span>
                          <span className="text-white font-mono font-black text-[11px] block mt-1">{st.crNumber}</span>
                        </div>
                        <div className="text-right text-xs pr-1 border-r border-slate-900 pl-1">
                          <span className="text-[10px] text-slate-400 block font-bold leading-none">الرقم الموحد:</span>
                          <span className="text-amber-400 font-mono font-black text-[11px] block mt-1">{st.unifiedNumber700 || "70014234"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-950/30 p-3 rounded-xl border border-slate-900/40 text-[10px] font-sans">
                      <div>
                        <span className="text-gray-500 block">📞 الاتصال والاتفاقات:</span>
                        <span className="text-gray-300 font-medium block mt-0.5">{st.phone || "غير متوفر"} | {st.email || "غير متوفر"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">📍 الكيانات المرتبطة:</span>
                        <span className="text-gray-300 font-medium block mt-0.5">{st.branches?.length || 0} فروع | {st.warehouses?.length || 0} مستودعات جرد</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">🔗 قنوات التكامل الرقمية (E-Com Link):</span>
                        {hasPlatforms ? (
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {st.platforms?.salla?.isConnected && <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-black">سلة ✓</span>}
                            {st.platforms?.zid?.isConnected && <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-black">زد ✓</span>}
                            {st.platforms?.shopify?.isConnected && <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-black">شوبيفاي ✓</span>}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic block mt-0.5">تبادل البيانات محلي في النظام فقط</span>
                        )}
                      </div>
                    </div>

                    {/* Footers controls */}
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-900 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {st.id !== activeStoreId && (
                          <button
                            onClick={() => setActiveStoreId(st.id)}
                            className="py-1.5 px-3 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer font-sans"
                          >
                            تفعيل وإدارة باللوحة 💻⚙️
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all cursor-pointer font-sans"
                        >
                          بيان المتجر 360 Full Profile ⚙️
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(st.id, isActive)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                            isActive ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {isActive ? "تعطيل المتجر" : "تنشيط المتجر"}
                        </button>

                        {st.isArchived ? (
                          <button
                            onClick={() => handleRestoreStore(st.id, st.name)}
                            className="py-1.5 px-3 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer font-sans"
                          >
                            استعادة 📤
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleArchive(st.id, false)}
                            className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-900 text-purple-400 border border-slate-855 cursor-pointer font-sans"
                          >
                            أرشفة
                          </button>
                        )}

                        {!st.isDefault && (
                          <button
                            onClick={() => handleSetDefault(st.id)}
                            className="py-1.5 px-3 rounded-xl text-xs font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer font-sans"
                          >
                            تعيين رئيسي مالي 🏆
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStore(st.id, st.name);
                          }}
                          className="p-1.5 rounded-xl text-red-500 hover:text-white hover:bg-red-500/20 cursor-pointer border-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // BRANCHES VIEW TAB PANEL
  if (mainActiveTab === "branches") {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <h3 className="text-sm font-black text-white">المواقع والفروع اللوجستية 📍</h3>
            <p className="text-[10px] text-gray-400 mt-1">تتبع نقاط التوزيع التشغيلية، وصالات العرض، وتعيين المدراء لمزامنة كشوف المقاصّة والضرب بالتجزئة.</p>
          </div>
          <button
            onClick={() => {
              setEditingBranch(null);
              setBranchFormName("");
              setBranchFormCity("الرياض");
              setBranchFormAddress("");
              setBranchFormManager("");
              setBranchFormPhone("");
              setBranchFormWh("");
              setBranchFormType("فرع بيع");
              setBranchFormStatus("نشط");
              if (setBranchFormCompanyId && setBranchFormStoreId) {
                const defaultCompId = viewingCompany360Id || companies[0]?.id || "";
                setBranchFormCompanyId(defaultCompId);
                setBranchFormStoreId("");
              }
              if (setBranchFormAddressProfile) {
                setBranchFormAddressProfile(undefined);
              }
              setShowBranchModal(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer border-none shadow transition-all font-sans"
          >
            <span>+ إضافة فرع جديد 📍</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(br => (
            <div key={br.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between hover:border-emerald-500/40 transition-colors font-sans">
              <div>
                <span className="text-emerald-400 text-sm block">📍 {br.name}</span>
                <span className="text-[10px] text-gray-400 mt-1 block"><b>المدينة:</b> {br.city} • <b>العنوان الفعلي:</b> {br.address || "حي المروج، الشارع التجاري"}</span>
                <span className="text-[9.5px] text-gray-500 mt-1 block"><b>المدير المسؤول:</b> {br.manager || "غير معين"} • <b>هاتف الفرع:</b> {br.phone || "غير متوفر"}</span>
                <span className="text-[8.5px] bg-slate-900 border border-slate-800 text-amber-500 px-2 py-0.5 rounded inline-block mt-2 font-black leading-none">{br.type || "فرع بيع"}</span>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded leading-none ${br.status === "نشط" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-500"}`}>
                  {br.status || "نشط"}
                </span>
                <div className="flex gap-1.5 mt-2">
                  <button 
                    onClick={() => {
                      setEditingBranch(br);
                      setBranchFormName(br.name);
                      setBranchFormCity(br.city || "الرياض");
                      setBranchFormAddress(br.address || "");
                      setBranchFormManager(br.manager || "");
                      setBranchFormPhone(br.phone || "");
                      setBranchFormWh(br.associatedWh || "");
                      setBranchFormType(br.type || "فرع بيع");
                      setBranchFormStatus(br.status || "نشط");
                      if (setBranchFormCompanyId && setBranchFormStoreId) {
                        setBranchFormCompanyId(br.companyId || br.company_id || "");
                        setBranchFormStoreId(br.storeId || br.store_id || "");
                      }
                      if (setBranchFormAddressProfile) {
                        setBranchFormAddressProfile(br.addressProfile || undefined);
                      }
                      setShowBranchModal(true);
                    }}
                    className="py-1 px-2.5 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-slate-850 cursor-pointer border-none font-sans"
                  >
                    تعديل ✏️
                  </button>
                </div>
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <p className="text-xs text-gray-455 italic p-8 text-center bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 col-span-2">لا توجد فروع مسجلة بعد في الهيكل العام.</p>
          )}
        </div>
      </div>
    );
  }

  // WAREHOUSES TAB PANEL
  if (mainActiveTab === "warehouses") {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <h3 className="text-sm font-black text-white">المستودعات ومخازن التوريد والجرد 📦</h3>
            <p className="text-[10px] text-gray-400 mt-1">إعداد قنوات الشحن المادي، مخازن الجرد الموحدة، وسعات التعبئة المادية التابعة للمتاجر لتسريع التصدير.</p>
          </div>
          <button
            onClick={() => {
              setWhFormName("");
              setWhFormType("sub");
              setWhFormLocation("");
              setWhFormCapacity(3000);
              setWhFormBranch("");
              if (setWhFormCompanyId) {
                setWhFormCompanyId(viewingCompany360Id || companies[0]?.id || "");
              }
              setShowWhModal(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer border-none shadow transition-all font-sans"
          >
            <span>+ إضافة مستودع جديد 📦</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map(wh => (
            <div key={wh.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-right hover:border-indigo-500/40 transition-colors font-sans">
              <div>
                <span className="text-indigo-400 text-sm block">📦 {wh.name}</span>
                <span className="text-[10px] text-gray-400 mt-1.5 block"><b>الموقع الجغرافي:</b> {wh.location || "المدينة الصناعية"}</span>
                <span className="text-[9.5px] text-gray-500 mt-1 block"><b>السعة الاستيعابية:</b> {wh.capacity || 3000} طرد جردي بريدي</span>
                <span className="text-[9px] text-amber-500 font-semibold block mt-1">النوع: {wh.type === "main" ? "مستودع رئيسي مركزي" : "فرعي تجميعي محلي"}</span>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 text-[8.5px] font-black px-2 py-1 rounded border border-indigo-500/20 uppercase font-sans leading-none">
                نشط وغني بالجرد
              </span>
            </div>
          ))}
          {warehouses.length === 0 && (
            <p className="text-xs text-gray-455 italic p-8 text-center bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 col-span-2">لا توجد مستودعات جرد مسجلة بعد.</p>
          )}
        </div>
      </div>
    );
  }

  // PORTAL CONNECTIONS TAB PANEL
  if (mainActiveTab === "connections") {
    return (
      <div className="space-y-6 animate-fade-in text-right font-sans">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <h3 className="text-sm font-black text-white">الربط الإلكتروني وبوابات المزامنة الخارجية 🔗</h3>
          <p className="text-[10px] text-gray-400 mt-1">تكامل فوري في الخلفية لتمرير الطلبات وتعديل مستويات المنتجات والضرائب ومستويات الشحن.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          {[
            { name: "سلة Salla.sa", status: "متصلة وموثقة ✓", text: "مزامنة لحظية للمنتجات ومخازن الجرد والعملاء مع متجر سلة.", btnColor: "bg-emerald-500 text-black hover:bg-emerald-400" },
            { name: "زد Zid.sa", status: "متصلة وموثقة ✓", text: "تمرير فوري للمدفوعات وحسابات سحب البضائع مع بوابة زد.", btnColor: "bg-[#7c3aed] text-white hover:bg-[#6d28d9]" },
            { name: "شوبيفاي Shopify", status: "مهيأ للربط ⚡", text: "تصدير الفواتير للطلبات الدولية شوبيفاي مع سهم لوجستيكس.", btnColor: "bg-emerald-500 text-black hover:bg-emerald-400" },
            { name: "ووكومرس WooCommerce", status: "مهيأ للربط ⚡", text: "امتداد رسمي لوك كود جرد ومزامنة مبيعات ووردبريس.", btnColor: "bg-[#7c3aed] text-white hover:bg-[#6d28d9]" },
            { name: "أمازون Amazon Sync", status: "نشط 🔐", text: "إقران قنوات الشحن من قبل أمازون FBA.", btnColor: "bg-amber-500 text-black hover:bg-amber-400" },
            { name: "نون Noon Sync", status: "نشط 🔐", text: "ربط كميات مخازن المنصة وحسابات المقاصرة العامة.", btnColor: "bg-amber-500 text-black hover:bg-amber-400" }
          ].map((plat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/45 border border-slate-850 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[10.5px] font-bold text-white">{plat.name}</span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded leading-none font-bold">{plat.status}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">{plat.text}</p>
              </div>
              <button className={`py-1.5 px-3 rounded-lg text-[9.5px] font-black cursor-pointer border-none shadow transition-all ${plat.btnColor} font-sans`}>تعديل تراخيص الاتصال 🔐</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
