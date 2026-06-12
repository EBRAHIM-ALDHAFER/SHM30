import React, { useEffect } from "react";
import { 
  Building, MapPin, Package, Store, Cpu, 
  Phone, Mail, Landmark
} from "lucide-react";
import { CompanyProfile, StoreProfile, Branch, Warehouse } from "../types";

interface OrganizationHubProps {
  themeColors: any;
  company: CompanyProfile | null;
  branches: Branch[];
  warehouses: Warehouse[];
  stores: StoreProfile[];
  posUnits: any[];
}

export default function OrganizationHub({
  company,
  branches = [],
  warehouses = [],
  stores = [],
  posUnits = []
}: OrganizationHubProps) {
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("sahm_web_user");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      const impersonateTenantId = localStorage.getItem("sahm_impersonate_tenant_id");
      const impersonateOrgId = localStorage.getItem("sahm_impersonate_org_id");

      const isPlatformOwner = currentUser && ["platform_owner", "system_owner", "system_admin"].includes(currentUser.role || "");
      const tenantId = isPlatformOwner ? impersonateTenantId : (currentUser?.tenant_id || "");
      const companyId = isPlatformOwner ? impersonateOrgId : (currentUser?.organization_id || currentUser?.company_id || "");

      console.log("ORG_HUB_CONTEXT", {
        currentUserRole: currentUser?.role || null,
        tenantId: tenantId || null,
        companyId: companyId || null,
        impersonateTenantId: impersonateTenantId || null,
        impersonateOrgId: impersonateOrgId || null
      });
    } catch (e) {
      console.error("Error logging ORG_HUB_CONTEXT:", e);
    }
  }, []);

  if (!company) {
    return (
      <div className="p-6 text-center border rounded-3xl" style={{ backgroundColor: "#0b1329", borderColor: "rgba(212,175,55,0.25)" }}>
        <p className="text-xs text-gray-400">يرجى تسجيل المنشأة أو الدخول لاستعراض الهيكل التنظيمي</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right font-sans select-none animate-fade-in" dir="rtl">
      {/* Root Company Node */}
      <div 
        className="p-6 rounded-3xl border relative overflow-hidden transition-all shadow-2xl"
        style={{ 
          backgroundColor: "#0b1329", 
          borderColor: "rgba(212,175,55,0.3)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div className="absolute left-4 top-4 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black">
          {company.subscriptionPlan || "الباقة الاحترافية"}
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
            ) : (
              <Building className="w-8 h-8 text-amber-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block">سهم OS • مركز إدارة المنشأة</span>
              <h2 className="text-lg font-black text-white">{company.name}</h2>
              <p className="text-[11px] text-gray-400 leading-normal">{company.companyLegalName}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-500" />
                <span>السجل التجاري: {company.crNumber}</span>
              </span>
              <span className="flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-gray-500" />
                <span>الرقم الضريبي: {company.vatNumber || "غير متوفر"}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>الهاتف: {company.phone || "غير متوفر"}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>البريد: {company.email || "غير متوفر"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Tree Connector */}
      <div className="flex flex-col items-center py-2">
        <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500/40 to-slate-800" />
        <div className="px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-[9px] text-amber-500 font-black">
          الهيكل الهرمي للقنوات
        </div>
        <div className="w-0.5 h-8 bg-gradient-to-b from-slate-800 to-transparent" />
      </div>

      {/* Three Main Columns (Branches & POS, Warehouses, Stores) */}
      {(!stores || stores.length === 0) && (!branches || branches.length === 0) && (!warehouses || warehouses.length === 0) ? (
        <div className="p-12 text-center border-2 border-dashed border-amber-500/20 rounded-3xl bg-[#0b1329]/80 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl blur-2xl pointer-events-none"></div>
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 text-2xl font-bold animate-pulse">
            📋
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black text-amber-400 font-sans">بنية المنشأة فارغة</h3>
            <p className="text-xs text-gray-450 max-w-md mx-auto leading-relaxed">
              لا توجد بيانات بعد، ابدأ بإنشاء فرع/مستودع/متجر
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Branches & Nested POS */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 flex items-center justify-between">
              <span className="text-[10px] bg-slate-900 text-gray-400 px-2 py-0.5 rounded font-black">{(branches || []).length}</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>الفروع ونقاط البيع</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(!branches || branches.length === 0) ? (
                <div className="p-6 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl">
                  <p className="text-[11px] text-gray-500">لا توجد فروع مسجلة</p>
                </div>
              ) : (
                branches.map(branch => {
                  const branchPosList = (posUnits || []).filter(
                    pos => pos && (pos.branchId === branch.id || pos.branch_id === branch.id)
                  );
                  return (
                    <div 
                      key={branch.id} 
                      className="p-4 rounded-2xl border bg-slate-950/40 border-slate-900 space-y-3 hover:border-emerald-500/20 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {branch.city || "الرياض"}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-white">{branch.name || "فرع غير مسمى"}</h4>
                          <span className="text-[10px] text-gray-400">{branch.address || "العنوان غير متوفر"}</span>
                        </div>
                      </div>

                      {/* POS Tree Connector */}
                      <div className="pt-2 border-t border-slate-900/60 space-y-2">
                        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mb-1">
                          <span>أجهزة كاشير نقاط البيع التابعة:</span>
                          <span>{branchPosList.length} أجهزة</span>
                        </div>

                        {branchPosList.length === 0 ? (
                          <p className="text-[10px] text-gray-600 italic">لا توجد نقاط بيع مرتبطة بهذا الفرع</p>
                        ) : (
                          <div className="space-y-1.5 pr-2 border-r border-slate-900">
                            {branchPosList.map(pos => (
                              <div 
                                key={pos.id} 
                                className="p-2 rounded-xl bg-slate-900/40 border border-slate-900 flex items-center justify-between"
                              >
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-450 px-1.5 py-0.5 rounded font-black">
                                  {pos.status || "نشط"}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-[10.5px] text-gray-300 font-bold">{pos.name || "كاشير"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Warehouses */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 flex items-center justify-between">
              <span className="text-[10px] bg-slate-900 text-gray-400 px-2 py-0.5 rounded font-black">{(warehouses || []).length}</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-500" />
                <span>المستودعات ومراكز التخزين</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(!warehouses || warehouses.length === 0) ? (
                <div className="p-6 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl">
                  <p className="text-[11px] text-gray-500">لا توجد مستودعات مسجلة</p>
                </div>
              ) : (
                warehouses.map(wh => (
                  <div 
                    key={wh.id} 
                    className="p-4 rounded-2xl border bg-slate-950/40 border-slate-900 space-y-3 hover:border-amber-500/20 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                        {wh.type === "main" ? "رئيسي" : "فرعي"}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-white">{wh.name || "مستودع غير مسمى"}</h4>
                        <span className="text-[10px] text-gray-400">{wh.location || "الموقع غير محدد"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 pt-2 border-t border-slate-900/60">
                      <div>
                        <span className="text-gray-550 block">المدير المسؤول:</span>
                        <span className="text-white font-bold">{wh.manager || "غير محدد"}</span>
                      </div>
                      <div>
                        <span className="text-gray-550 block">السعة الاستيعابية:</span>
                        <span className="text-white font-bold">{wh.capacity || 0} طرد</span>
                      </div>
                    </div>

                    {/* POS Tree Connector for Warehouse */}
                    {(() => {
                      const whPosList = (posUnits || []).filter(
                        pos => pos && (pos.defaultWh === wh.id || pos.warehouse_id === wh.id)
                      );
                      return (
                        <div className="pt-2 border-t border-slate-900/60 space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-gray-550 font-bold mb-1">
                            <span>أجهزة كاشير نقاط البيع التابعة:</span>
                            <span>{whPosList.length} أجهزة</span>
                          </div>

                          {whPosList.length === 0 ? (
                            <p className="text-[10px] text-gray-655 italic">لا توجد نقاط بيع مرتبطة بهذا المستودع</p>
                          ) : (
                            <div className="space-y-1.5 pr-2 border-r border-slate-900">
                              {whPosList.map(pos => (
                                <div 
                                  key={pos.id} 
                                  className="p-2 rounded-xl bg-slate-900/40 border border-slate-900 flex items-center justify-between"
                                >
                                  <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black">
                                    {pos.status || "نشط"}
                                  </span>
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <Cpu className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10.5px] text-gray-300 font-bold">{pos.name || "كاشير"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Linked Stores */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 flex items-center justify-between">
              <span className="text-[10px] bg-slate-900 text-gray-400 px-2 py-0.5 rounded font-black">{(stores || []).length}</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Store className="w-4 h-4 text-cyan-400" />
                <span>المتاجر والعلامات التجارية</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(!stores || stores.length === 0) ? (
                <div className="p-6 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl">
                  <p className="text-[11px] text-gray-500">لا توجد متاجر تابعة</p>
                </div>
              ) : (
                stores.map(store => (
                  <div 
                    key={store.id} 
                    className="p-4 rounded-2xl border bg-slate-950/40 border-slate-900 space-y-3 hover:border-cyan-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                        {store.logoUrl ? (
                          <img src={store.logoUrl} alt="Store Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Store className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{store.name || "متجر غير مسمى"}</h4>
                        <span className="text-[10px] text-gray-400">سجل رقم: {store.crNumber || "غير متوفر"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[10px] text-gray-400">
                      <span>حالة النشاط التجاري:</span>
                      <span className="text-emerald-400 font-extrabold">نشط</span>
                    </div>

                    {/* POS Tree Connector for Store */}
                    {(() => {
                      const storePosList = (posUnits || []).filter(
                        pos => pos && (pos.storeId === store.id || pos.store_id === store.id)
                      );
                      return (
                        <div className="pt-2 border-t border-slate-900/60 space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-gray-550 font-bold mb-1">
                            <span>أجهزة كاشير نقاط البيع التابعة:</span>
                            <span>{storePosList.length} أجهزة</span>
                          </div>

                          {storePosList.length === 0 ? (
                            <p className="text-[10px] text-gray-655 italic">لا توجد نقاط بيع مرتبطة بهذا المتجر</p>
                          ) : (
                            <div className="space-y-1.5 pr-2 border-r border-slate-900">
                              {storePosList.map(pos => (
                                <div 
                                  key={pos.id} 
                                  className="p-2 rounded-xl bg-slate-900/40 border border-slate-900 flex items-center justify-between"
                                >
                                  <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-black">
                                    {pos.status || "نشط"}
                                  </span>
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="text-[10.5px] text-gray-300 font-bold">{pos.name || "كاشير"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
