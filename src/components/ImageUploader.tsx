import React, { useRef, useState } from "react";
import { ThemeColors } from "../types";
import { Camera, Trash2, ShieldAlert, Image as ImageIcon, Search, Check, X } from "lucide-react";

interface ImageUploaderProps {
  imageUrl?: string;
  name: string;
  onChange: (base64: string | undefined) => void;
  theme: ThemeColors;
  maxSizeMB?: number;
}

export default function ImageUploader({
  imageUrl,
  name,
  onChange,
  theme,
  maxSizeMB = 2,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionMetrics, setCompressionMetrics] = useState<{
    originalSize: string;
    compressedSize: string;
  } | null>(null);

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaFiles] = useState(() => {
    try {
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
    } catch {
      return [];
    }
  });

  // Helper to construct initials
  const getInitials = (fullName: string) => {
    if (!fullName) return "👤";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const compressImage = (file: File) => {
    // Validate types JPG / PNG / WebP
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("يرجى اختيار ملف صورة صالح بصيغة (JPG, PNG, WebP) فقط.");
      return;
    }

    // Validate original size limit (before compression, as precaution)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`حجم الصورة كبير جداً. الحد الأقصى المسموح به هو ${maxSizeMB} ميجابايت.`);
      return;
    }

    setError(null);
    const originalKB = (file.size / 1024).toFixed(1);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Limit dimensions for compression e.g. Max 350x350
        const MAX_WIDTH = 350;
        const MAX_HEIGHT = 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image and extract as compressed base64
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height); // background in case of transparent png
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality compression jpeg
        const compressedSizeKB = (
          (compressedDataUrl.length - 814) /
          1.37 /
          1024
        ).toFixed(1);

        setCompressionMetrics({
          originalSize: `${originalKB} KB`,
          compressedSize: `${compressedSizeKB} KB`,
        });

        onChange(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressImage(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressImage(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setCompressionMetrics(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 text-right">
      <label className="block text-xs font-black" style={{ color: theme.muted }}>
        • الصورة الشخصية أو الشعار (اختياري)
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group h-28 w-full rounded-2xl border-2 border-dashed flex items-center justify-between px-4 transition-all cursor-pointer ${
          isDragActive
            ? "border-amber-500 bg-amber-500/5 scale-[1.01]"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/20"
        }`}
        style={{ borderColor: isDragActive ? theme.accent : undefined }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action icons / remove */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-[11px] font-extrabold text-white group-hover:text-amber-400 transition-colors">
            {imageUrl ? "تغيير الصورة 🔄" : "اسحب الصورة هنا أو انقر للرفع"}
          </span>
          <span className="text-[9px] text-gray-500">
            JPG, PNG, WebP (الحد الأقصى {maxSizeMB}MB)
          </span>
          {compressionMetrics && (
            <span className="text-[8.5px] text-emerald-400 font-mono font-bold mt-1">
              ضغط ذكي: {compressionMetrics.originalSize} ➔ {compressionMetrics.compressedSize} (نجاح)
            </span>
          )}
        </div>

        {/* Preview aspect / initials */}
        <div className="relative shrink-0 flex items-center gap-3">
          {imageUrl ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt="معاينة"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 bg-slate-900"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full transition-all border-none cursor-pointer hover:scale-110 shadow"
                title="حذف الصورة"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-white text-base border border-slate-800"
              style={{
                background: `linear-gradient(135deg, ${theme.surface} 0%, rgba(212,175,55,0.08) 100%)`,
                color: theme.accent,
              }}
            >
              {getInitials(name)}
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-all">
            <Camera className="w-4 h-4" />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold bg-rose-500/5 p-2 rounded-lg border border-rose-500/20">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMediaModal(true);
          }}
          className="py-1 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-550 font-bold text-[10.5px] rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95 self-end"
        >
          <ImageIcon className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>اختيار من مكتبة الوسائط 🖼️</span>
        </button>
      </div>

      {showMediaModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999] text-right backdrop-blur-sm">
          <div className="p-6 rounded-2xl border w-full max-w-2xl space-y-4 relative"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <button
              type="button"
              onClick={() => setShowMediaModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-900 border text-gray-400 border-slate-700 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-white" style={{ color: theme.text }}>مكتبة الوسائط - اختر ملفاً أو صورة 🖼️</h3>
            <p className="text-[10px] text-gray-400">اختر أحد الأصول والملفات المستضافة لتضمينها فورياً في صفحتك الحالية.</p>

            <div className="relative">
              <input
                type="text"
                placeholder="ابحث باسم الملف..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full text-xs py-2 pr-9 pl-3 rounded-xl border outline-none font-bold placeholder-gray-500 text-right"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              />
              <Search className="absolute top-2.5 right-3 w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
              {mediaFiles
                .filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                .map((file) => {
                  const isImg = file.type === "image" || file.type === "qr" || file.type === "logo";
                  const isSelected = imageUrl === file.url;
                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        onChange(file.url);
                        setShowMediaModal(false);
                      }}
                      className={`p-2 rounded-xl border cursor-pointer hover:border-amber-500/50 transition-all space-y-2 relative flex flex-col justify-between ${isSelected ? 'border-amber-500 bg-amber-500/5' : 'bg-slate-900/60 border-slate-800'}`}
                    >
                      <div className="h-20 rounded-lg overflow-hidden bg-black flex items-center justify-center relative">
                        {isImg ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-[10px] font-mono text-rose-500 uppercase">PDF</span>
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-amber-500 text-black rounded-full p-0.5 shadow">
                            <Check className="w-3 h-3 stroke-[3px]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold truncate block text-gray-300 text-center px-1">
                        {file.name}
                      </span>
                    </div>
                  );
                })}
              {mediaFiles.filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase())).length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500 text-xs">
                  لا توجد ملفات تطابق البحث.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
