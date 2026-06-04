import React, { useState, useRef, useEffect } from "react";
import { 
  Image as ImageIcon, UploadCloud, Search, Trash2, Link as LinkIcon, FileText, Check, 
  Layers, Database, BarChart, Download, Sparkles, FolderPlus, Info, ZoomIn, Eye, ShieldCheck, Settings, Lock
} from "lucide-react";
import { ThemeColors, User } from "../types";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "pdf" | "qr" | "logo";
  category: "product" | "documents" | "templates";
  url: string;
  size: string;
  date: string;
}

interface MediaCenterProps {
  theme: ThemeColors;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  currentUser?: User | null;
}

export default function MediaCenter({ 
  theme, 
  triggerNotification = () => {}, 
  addAuditLog = () => {},
  currentUser = null
}: MediaCenterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'product' | 'documents' | 'templates'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'pdf' | 'qr'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);

  // Dynamic permissions state with localStorage fallback
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem("sahm_media_permissions");
      return saved ? JSON.parse(saved) : {
        "مدير": { view: true, upload: true, delete: true, manage_folders: true, copy_url: true },
        "محاسب": { view: true, upload: true, delete: false, manage_folders: false, copy_url: true },
        "كاشير": { view: false, upload: false, delete: false, manage_folders: false, copy_url: false }
      };
    } catch {
      return {
        "مدير": { view: true, upload: true, delete: true, manage_folders: true, copy_url: true },
        "محاسب": { view: true, upload: true, delete: false, manage_folders: false, copy_url: true },
        "كاشير": { view: false, upload: false, delete: false, manage_folders: false, copy_url: false }
      };
    }
  });

  const savePermissions = (newPerms: any) => {
    setRolePermissions(newPerms);
    localStorage.setItem("sahm_media_permissions", JSON.stringify(newPerms));
    triggerNotification("تم تحديث صلاحيات الوصول للوسائط بنجاح 🛡️", "success");
  };

  const userRole = currentUser?.role || "مدير";
  // Fallback to full permissions if role unrecognized (e.g. system owner)
  const perms = rolePermissions[userRole] || { view: true, upload: true, delete: true, manage_folders: true, copy_url: true };

  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(() => {
    const saved = localStorage.getItem("sahm_media_center_files");
    return saved ? JSON.parse(saved) : [
      {
        id: "m1",
        name: "دهن عود كلمنتان الملكي.jpg",
        type: "image",
        category: "product",
        url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=300",
        size: "١.٢ ميجابايت",
        date: "٢٠٢٦/٠٦/٠٢"
      },
      {
        id: "m2",
        name: "زعفران ناقيل سوبر فاخر.jpg",
        type: "image",
        category: "product",
        url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=300",
        size: "٨٥٠ كيلوبايت",
        date: "٢٠٢٦/٠٦/٠١"
      },
      {
        id: "m3",
        name: "سند استلام ضريبة القيمة المضافة Zakat.pdf",
        type: "pdf",
        category: "documents",
        url: "#",
        size: "٢.٤ ميجابايت",
        date: "٢٠٢٦/٠٥/٢٨"
      },
      {
        id: "m4",
        name: "رمز استجابة الفاتورة الضريبية المعتمد Zatca QR.png",
        type: "qr",
        category: "documents",
        url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SahmERP-310499221100003",
        size: "٤٥ كيلوبايت",
        date: "٢٠٢٦/٠٦/٠٢"
      },
      {
        id: "m5",
        name: "شعار متجر مراسيم الطيب الرسمي.png",
        type: "image",
        category: "templates",
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200",
        size: "٣٢٠ كيلوبايت",
        date: "٢٠٢٦/٠٥/١٥"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sahm_media_center_files", JSON.stringify(mediaFiles));
  }, [mediaFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (!perms.upload) {
      triggerNotification("⚠️ عذراً، لا تمتلك صلاحية رفع ملفات بمركز الأصول والوسائط.", "error");
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const fileType = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "logo";
        const newFile: MediaFile = {
          id: `m_${Date.now()}_${i}`,
          name: file.name,
          type: fileType as any,
          category: fileType === "image" ? "product" : "documents",
          url: reader.result as string || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت`,
          date: new Date().toLocaleDateString("ar-SA")
        };

        setMediaFiles(prev => {
          const updated = [newFile, ...prev];
          localStorage.setItem("sahm_media_center_files", JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`تم رفع واستضافة ملف الوسائط: ${file.name} بنجاح 🖼️`, "success");
        addAuditLog("رفع ملف وسائط", `تم استضافة الملف ${file.name} في مستودع سهم السحابي للملفات.`);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!perms.delete) {
      triggerNotification("⚠️ عذراً، رتبتك الحالية محظورة من تفريغ أو حذف أصول المتجر.", "error");
      return;
    }
    setMediaFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      localStorage.setItem("sahm_media_center_files", JSON.stringify(updated));
      return updated;
    });
    triggerNotification(`تم حذف ملف الوسائط: ${name} نهائياً`, "alert");
    addAuditLog("حذف وسائط", `قام العميل بحذف المادة ${name} من مستودع الأصول.`);
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  const handleCopyLink = (text: string, id: string) => {
    if (!perms.copy_url) {
      triggerNotification("⚠️ رتبتك محظورة من نسخ روابط الأصول بهدف حماية الملكية الفكرية.", "error");
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    triggerNotification("تم نسخ رابط الأصول السحابية للملف بنجاح 🔗", "success");
  };

  const filteredList = mediaFiles.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalSizeUsed = (mediaFiles.length * 0.85).toFixed(1);

  if (!perms.view) {
    return (
      <div className="p-8 text-center rounded-3xl border border-red-950 bg-gradient-to-br from-red-950/20 to-slate-950 font-sans space-y-4 max-w-xl mx-auto my-12 text-right">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
          <Lock className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-base font-black text-white">الوصول لمركز الأصول والوسائط محدود 🔒</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          عذراً، لا تمتلك رتبتك الحالية ({currentUser?.role || "مستخدم عادي"}) الصلاحيات الكافية لاستعراض أو تحديث الأصول المشتركة بملفات النظام. الرجاء التواصل مع مدير عام المنصة لمنحك الصلاحية المعتمدة <span className="font-mono text-amber-500">media:view</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right font-sans animate-fade-in">
      
      {/* 🔮 Header Section */}
      <div className="p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-2 justify-end md:justify-start flex-wrap">
            <span className="text-[10px] bg-sky-500/10 text-sky-400 py-0.5 px-2 rounded-md font-black">CDN واستضافة سحابية خضراء</span>
            {(currentUser?.role === "مدير" || currentUser?.role === "مدير عام" || !currentUser) && (
              <button
                type="button"
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-550 py-0.5 px-2.5 rounded-md font-black border border-amber-500/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Settings className="w-3 h-3 text-amber-500 animate-spin" />
                <span>إعداد صلاحيات الرتب ({showConfigPanel ? "إغلاق" : "تعديل الصلاحيات"}) 🛡️</span>
              </button>
            )}
            <h2 className="text-sm font-black flex items-center gap-2 w-full mt-1" style={{ color: theme.text }}>
              <span>مركز سهم للوسائط والأصول السحابية • Media Center 🖼️</span>
            </h2>
          </div>
          <p className="text-[10px]" style={{ color: theme.muted }}>
            مستودع أصول علامتك التجارية الفاخرة لربط صور المنتجات، الفواتير الضريبية، والأدلة التسويقية بكافة دورات المبيعات.
          </p>
        </div>

        {/* Storage Telemetry Counter */}
        <div className="p-3.5 rounded-2xl bg-black/40 border shrink-0 text-right space-y-2 w-full md:w-56" style={{ borderColor: theme.border }}>
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="font-mono text-gray-400">{totalSizeUsed} ميجابايت / ٥٠٠ ميجابايت</span>
            <span style={{ color: theme.text }}>مساحة الاستضافة السحابية</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(parseFloat(totalSizeUsed) / 500) * 100}%` }}></div>
          </div>
          <div className="flex justify-between items-center text-[8px] text-gray-400">
            <span>{mediaFiles.length} ملفات مؤرشفة حياً</span>
            <span>باقة سهم السحابية ⚡</span>
          </div>
        </div>
      </div>

      {showConfigPanel && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 text-right animate-fade-in relative">
          <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 justify-start">
            <ShieldCheck className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>لوحة تخصيص صلاحيات الوصول للوسائط والأرشيف الفني (مدير عام المنصة)</span>
          </h4>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            تحكم بالرتب الفرعية والموظفين من الكاشير والمحاسبين داخل مستودع أصول المتجر بهدف حظر الحذف وحماية المحتوى الفني والتسويقي.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(rolePermissions).map((role) => (
              <div key={role} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/2 rounded-full blur-lg" />
                <span className="text-xs font-black text-white block border-b border-slate-800 pb-1.5">{role}</span>
                <div className="space-y-2 text-[10px]">
                  {[
                    { id: "view", label: "رؤية واستخدام الملفات (media:view)" },
                    { id: "upload", label: "شحن واستيراد أصول جديدة (media:upload)" },
                    { id: "delete", label: "حذف وإتلاف أصول المتجر (media:delete)" },
                    { id: "manage_folders", label: "إدارة الفئات والمصنفات (media:manage_folders)" },
                    { id: "copy_url", label: "نسخ الرابط السحابي المباشر (media:copy_url)" }
                  ].map((field) => {
                    const hasPerm = rolePermissions[role]?.[field.id] ?? false;
                    return (
                      <label key={field.id} className="flex items-center gap-2 cursor-pointer select-none text-gray-400 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={hasPerm}
                          onChange={(e) => {
                            const updated = {
                              ...rolePermissions,
                              [role]: {
                                ...rolePermissions[role],
                                [field.id]: e.target.checked
                              }
                            };
                            savePermissions(updated);
                          }}
                          className="rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-900"
                        />
                        <span>{field.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left side: Upload area + Categories */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 📂 Drag & Drop Upload Block */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-6 border-2 border-dashed rounded-3xl text-center select-none transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative min-h-[180px] ${
              dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-900/40'
            }`}
            style={{ borderColor: dragActive ? '#D4AF37' : theme.border }}
            onClick={onButtonClick}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              onChange={handleFileInput}
              className="hidden" 
              accept="image/*,application/pdf"
            />
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-amber-500 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-black" style={{ color: theme.text }}>اسحب وأفلت ملفات علامتك التجارية هنا</h4>
              <p className="text-[10px] text-gray-400">يدعم الصور عالية الدقة (JPEG, PNG) ومستندات الـ PDF</p>
            </div>
            
            <button 
              type="button" 
              className="py-1.5 px-4 text-[10px] bg-amber-500 text-black font-black rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              تصفح ملفاتك المحلية 📁
            </button>
          </div>

          {/* Filters card */}
          <div className="p-5 rounded-3xl border text-right space-y-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <h3 className="text-xs font-black pb-2 border-b flex items-center gap-1.5 justify-end" style={{ color: theme.text, borderColor: theme.border }}>
              <span>تصنيف المجلدات والأصول</span>
              <Layers className="w-4 h-4 text-emerald-500" />
            </h3>

            {/* Category filter list */}
            <div className="space-y-2">
              {[
                { k: 'all', label: "كل الأصول والملفات 📦", count: mediaFiles.length },
                { k: 'product', label: "صور سلع ومنتجات مبيعاتك 🛍️", count: mediaFiles.filter(m => m.category === 'product').length },
                { k: 'documents', label: "فواتير ومستندات ضريبية معتمدة 📜", count: mediaFiles.filter(m => m.category === 'documents').length },
                { k: 'templates', label: "قوالب طباعة وشعارات العلامات 🎨", count: mediaFiles.filter(m => m.category === 'templates').length },
              ].map(cat => (
                <button
                  key={cat.k}
                  onClick={() => setCategoryFilter(cat.k as any)}
                  className="w-full text-right p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                  style={{
                    backgroundColor: categoryFilter === cat.k ? theme.accent + "15" : "transparent",
                    color: categoryFilter === cat.k ? theme.text : theme.muted
                  }}
                >
                  <span className="text-[9.5px] font-mono select-none opacity-80 bg-slate-800 px-1.5 py-0.5 rounded-md" style={{ color: theme.text }}>
                    {cat.count} ملف
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right side: Search toolbar + Files Grid */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Toolbar search & dynamic type pills */}
          <div className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            
            {/* Search inputs */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="ابحث باسم الملف أو الأصل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs py-2 pr-9 pl-3 rounded-xl border outline-none font-bold placeholder-gray-500 text-right"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              />
              <Search className="absolute top-2.5 right-3 w-4 h-4 text-gray-500" />
            </div>

            {/* Type selector pills */}
            <div className="flex gap-1.5 overflow-x-auto self-start md:self-center">
              {[
                { k: 'all', label: "كل الصيغ" },
                { k: 'image', label: "صور 🖼️" },
                { k: 'pdf', label: "مستندات 📜" },
                { k: 'qr', label: "رموز QR 🔗" }
              ].map((pill) => (
                <button
                  key={pill.k}
                  onClick={() => setTypeFilter(pill.k as any)}
                  className="py-1 px-3 text-[10px] rounded-lg font-black shrink-0 transition-all select-none cursor-pointer"
                  style={{
                    backgroundColor: typeFilter === pill.k ? theme.accent : theme.surface,
                    color: typeFilter === pill.k ? "#000" : theme.text,
                    border: `1px solid ${typeFilter === pill.k ? theme.accent : theme.border}`
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((file) => {
              const isImg = file.type === 'image' || file.type === 'qr';
              return (
                <div 
                  key={file.id} 
                  className="p-4 rounded-2xl border flex flex-col justify-between gap-3 relative transition-all duration-300 hover:shadow-lg group"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  
                  {/* Visual Preview Box */}
                  <div className="w-full h-32 rounded-xl overflow-hidden relative border bg-slate-950 border-slate-800 flex items-center justify-center">
                    {isImg ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center space-y-1">
                        <FileText className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
                        <span className="text-[10px] font-black font-sans uppercase text-rose-400">PDF Document</span>
                      </div>
                    )}

                    {/* Quick Preview modal button overlay */}
                    {isImg && (
                      <button 
                        type="button"
                        onClick={() => setSelectedImage(file)}
                        className="absolute bottom-2 left-2 bg-black/80 hover:bg-amber-500 hover:text-black p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>
                    )}
                  </div>

                  {/* Metadata labels */}
                  <div className="text-right">
                    <h4 className="text-xs font-extrabold truncate" style={{ color: theme.text }}>{file.name}</h4>
                    <div className="flex justify-between items-center text-[8.5px] mt-2" style={{ color: theme.muted }}>
                      <span className="font-mono">{file.size}</span>
                      <span>تاريخ الأرشفة: {file.date}</span>
                    </div>
                  </div>

                  {/* Operations Buttons bottom line */}
                  <div className="flex items-center gap-1.5 border-t pt-2.5" style={{ borderColor: theme.border }}>
                    
                    <button
                      type="button"
                      onClick={() => handleCopyLink(file.url, file.id)}
                      className="flex-1 py-1 px-1.5 rounded-lg text-[9px] font-black border flex items-center justify-center gap-1 hover:bg-slate-800 cursor-pointer"
                      style={{ color: theme.text, borderColor: theme.border }}
                    >
                      {copiedId === file.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">تم نسخ الرابط!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>رابط الأصول (URL)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(file.id, file.name)}
                      className="p-1 px-1.5 rounded-lg text-[9px] text-red-500 hover:bg-red-500/10 cursor-pointer border border-transparent hover:border-red-500/25 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-12 text-center rounded-3xl border text-xs"
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.muted }}>
                <ImageIcon className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                <span>لا يوجد أي ملفات بمستودع الوسائط تطابق خيارات الفرز والبحث الحالية.</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🔮 Visual Overlay Gallery Modal for full-view details */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 text-right backdrop-blur-md">
          <div className="p-6 rounded-3xl border w-full max-w-lg space-y-4 relative"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-900 border text-gray-400 border-slate-700 text-xs hover:text-white cursor-pointer"
            >
              إغلاق المعاينة ✕
            </button>

            <h3 className="text-xs font-black" style={{ color: theme.text }}>{selectedImage.name}</h3>
            
            <div className="w-full max-h-[380px] rounded-2xl overflow-hidden border bg-black flex items-center justify-center" style={{ borderColor: theme.border }}>
              <img src={selectedImage.url} alt={selectedImage.name} className="max-w-full max-h-[350px] object-contain" referrerPolicy="no-referrer" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 text-[10px] space-y-1 font-bold">
              <div className="flex justify-between border-b pb-1.5 border-slate-800">
                <span className="font-mono text-gray-400">{selectedImage.id}</span>
                <span className="text-gray-500">معرف المادة الفني:</span>
              </div>
              <div className="flex justify-between border-b py-1.5 border-slate-800">
                <span className="font-mono text-gray-400">{selectedImage.size}</span>
                <span className="text-gray-500">حجم الاستضافة الكلي:</span>
              </div>
              <div className="flex justify-between py-1 border-slate-800">
                <span className="text-emerald-400">{selectedImage.category === 'product' ? "صور سلع ومنتجات" : "شعارات ومستندات"}</span>
                <span className="text-gray-500">التوجيه الافتراضي للوسائط:</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 bg-amber-500 text-black font-black text-xs rounded-xl hover:brightness-110 active:scale-95 cursor-pointer text-center"
                onClick={() => {
                  navigator.clipboard.writeText(selectedImage.url);
                  triggerNotification("تم نسخ رابط الوسائط السحابي للمنتج!", "success");
                }}
              >
                نسخ وتضمين رابط الربط المحاسبي 🔗
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
