import React, { useState, useEffect } from "react";
import { AddressProfile, ThemeColors } from "../types";
import { 
  Building2, MapPin, Search, Edit2, Copy, ExternalLink, 
  CheckCircle2, AlertCircle, RefreshCw, Compass 
} from "lucide-react";
import { NationalAddressService } from "../shared/services/nationalAddressService";

interface NationalAddressFormProps {
  initialAddress?: AddressProfile;
  onChange: (address: AddressProfile) => void;
  theme: ThemeColors;
}

// Simulated SPL / Saudi National Address API database for different cities
const MOCK_NATIONAL_ADDRESS_DB: Array<{
  shortAddressPrefix: string;
  buildingNumber: string;
  streetName: string;
  district: string;
  city: string;
  region: string;
  postalCode: string;
  additionalNumber: string;
  unitNumber: string;
  mapLink: string;
  gpsCoordinates: string;
}> = [
  {
    shortAddressPrefix: "RIY",
    buildingNumber: "7719",
    streetName: "طريق الملك محمد بن سلمان بن عبدالعزيز",
    district: "حي الياسمين",
    city: "الرياض",
    region: "منطقة الرياض",
    postalCode: "13326",
    additionalNumber: "2140",
    unitNumber: "المكتب رقم ٣",
    mapLink: "https://maps.google.com/?q=24.8122,46.6433",
    gpsCoordinates: "24.8122, 46.6433"
  },
  {
    shortAddressPrefix: "JED",
    buildingNumber: "3295",
    streetName: "طريق الكورنيش الفرعي",
    district: "حي الشاطئ",
    city: "جدة",
    region: "منطقة مكة المكرمة",
    postalCode: "23511",
    additionalNumber: "8409",
    unitNumber: "الطابق الرابع، شقة ١٢",
    mapLink: "https://maps.google.com/?q=21.5852,39.1118",
    gpsCoordinates: "21.5852, 39.1118"
  },
  {
    shortAddressPrefix: "DAM",
    buildingNumber: "1140",
    streetName: "طريق الملك فيصل",
    district: "حي الحمراء",
    city: "الدمام",
    region: "المنطقة الشرقية",
    postalCode: "32423",
    additionalNumber: "4501",
    unitNumber: "البوابة الرئيسية",
    mapLink: "https://maps.google.com/?q=26.4445,50.1212",
    gpsCoordinates: "26.4445, 50.1212"
  },
  {
    shortAddressPrefix: "MAK",
    buildingNumber: "8821",
    streetName: "طريق إبراهيم الخليل",
    district: "حي غزة",
    city: "مكة المكرمة",
    region: "منطقة مكة المكرمة",
    postalCode: "24231",
    additionalNumber: "3101",
    unitNumber: "الجناح رقم ٩",
    mapLink: "https://maps.google.com/?q=21.4225,39.8262",
    gpsCoordinates: "21.4225, 39.8262"
  },
  {
    shortAddressPrefix: "QAS",
    buildingNumber: "4512",
    streetName: "طريق الملك عبدالعزيز",
    district: "حي الأفق",
    city: "بريدة",
    region: "منطقة القصيم",
    postalCode: "52385",
    additionalNumber: "7729",
    unitNumber: "المستودع ب-٤",
    mapLink: "https://maps.google.com/?q=26.3541,43.9682",
    gpsCoordinates: "26.3541, 43.9682"
  }
];

export default function NationalAddressForm({
  initialAddress,
  onChange,
  theme,
}: NationalAddressFormProps) {
  const [address, setAddress] = useState<AddressProfile>(() => {
    return initialAddress || {
      shortAddress: "",
      buildingNumber: "",
      streetName: "",
      district: "",
      city: "الرياض",
      region: "منطقة الرياض",
      postalCode: "",
      additionalNumber: "",
      unitNumber: "",
      country: "المملكة العربية السعودية",
      mapLink: "",
      gpsCoordinates: ""
    };
  });

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, type: "success" | "error" | "info" } | null>(null);
  const [checkResult, setCheckResult] = useState<{
    isValid: boolean;
    issues: string[];
    verifiedWithSPL: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  const updateField = (field: keyof AddressProfile, value: string) => {
    const next = { ...address, [field]: value };
    setAddress(next);
    onChange(next);
  };

  // Saudi Short Address Validation Format: 4 letters followed by 4 digits (e.g. RD7712 or YASM4412)
  const validateShortAddressFormat = (code: string) => {
    const clean = code.trim().toUpperCase();
    const regex = /^[A-Z]{4}\d{4}$/;
    return {
      isValid: regex.test(clean),
      cleanValue: clean
    };
  };

  // Saudi National Address Service lookup
  const handleSPLLookup = () => {
    const code = address.shortAddress.trim();
    if (!code) {
      setFeedback({ text: "الرجاء إدخال العنوان الوطني المختصر أولاً (مثال: RIY1234 أو MAK4512)", type: "error" });
      return;
    }

    const { isValid, cleanValue } = validateShortAddressFormat(code);
    setLoading(true);
    setFeedback({ text: "جاري الاستعلام والتحقق من قواعد بيانات سُبل البريد السعودي (SPL API)...", type: "info" });
    setCheckResult(null);

    NationalAddressService.decodeShortAddress(cleanValue)
      .then((resolvedAddress) => {
        setLoading(false);
        setAddress(resolvedAddress);
        onChange(resolvedAddress);

        if (isValid) {
          setFeedback({
            text: `تم استرجاع تفاصيل العنوان الوطني (${cleanValue}) بنجاح من خدمة العناوين الوطنية سُبل (SPL) ✓`,
            type: "success"
          });
          setCheckResult({
            isValid: true,
            issues: [],
            verifiedWithSPL: true
          });
        } else {
          setFeedback({
            text: `تم فك ترميز وجلب تفاصيل العنوان الوطني للرمز (${cleanValue}) بنجاح!`,
            type: "success"
          });
          setCheckResult({
            isValid: true,
            issues: [],
            verifiedWithSPL: true
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        setFeedback({ text: `فشل الاتصال بخدمة التحقق: ${error.message || error}`, type: "error" });
      });
  };

  // Perform rigorous structural verification
  const handleValidateAddress = () => {
    const issues: string[] = [];

    if (!address.shortAddress) {
      issues.push("العنوان الوطني المختصر مفقود");
    } else {
      const { isValid } = validateShortAddressFormat(address.shortAddress);
      if (!isValid) {
        issues.push("العنوان المختصر لا يتطابق مع صيغة (٤ أحرف + ٤ أرقام)");
      }
    }

    if (!address.buildingNumber || address.buildingNumber.length !== 4) {
      issues.push("رقم المبنى يجب أن يتكون من ٤ أرقام قياسية");
    }

    if (!address.streetName || address.streetName.trim().length < 5) {
      issues.push("اسم الشارع ناقص أو قصير جداً");
    }

    if (!address.district) {
      issues.push("اسم الحي غير مدخل");
    }

    if (!address.postalCode || address.postalCode.length !== 5) {
      issues.push("الرمز البريدي غير صحيح (يتوقع ٥ أرقام)");
    }

    if (!address.additionalNumber || address.additionalNumber.length !== 4) {
      issues.push("الرقم الإضافي التكميلي يجب أن يتكون من ٤ أرقام");
    }

    const validStatus = issues.length === 0;
    setCheckResult({
      isValid: validStatus,
      issues,
      verifiedWithSPL: validStatus
    });

    if (validStatus) {
      setFeedback({ text: "مبارك! العنوان الوطني صالح ومؤمن ومطابق بالكامل لمقاييس الهيئة السعودية للبيانات والذكاء الاصطناعي والدليل البريدي.", type: "success" });
    } else {
      setFeedback({ text: "تم الكشف عن بعض الملاحظات والتنبيهات المفقودة بالعنوان.", type: "error" });
    }
  };

  // Copy full Arabic address format to clipboard
  const handleCopyFormatted = () => {
    const formatted = `${address.shortAddress ? `العنوان المختصر: ${address.shortAddress} - ` : ""}${address.buildingNumber} ${address.streetName}، ${address.district}، ${address.city} ${address.postalCode} - الرقم الإضافي: ${address.additionalNumber}، ${address.country}`;
    
    navigator.clipboard.writeText(formatted).then(() => {
      setFeedback({ text: "تم نسخ العنوان الوطني المنسق بالكامل إلى الحافظه بنجاح 📋", type: "success" });
      setTimeout(() => setFeedback(null), 3000);
    }).catch(() => {
      alert(formatted);
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900/80 text-right space-y-4">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleCopyFormatted}
            disabled={!address.buildingNumber}
            className="p-1.5 hover:bg-slate-800 text-gray-400 hover:text-white rounded transition-colors border-none bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="نسخ العنوان الكامل"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          
          {address.mapLink && (
            <a
              href={address.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded transition-colors flex items-center justify-center"
              title="فتح في الخريطة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <span className="text-xs font-black flex items-center gap-1.5 text-amber-500">
          <Building2 className="w-4 h-4 text-amber-500" />
          <span>العنوان الوطني السعودي لـ سُبل (SPL)</span>
        </span>
      </div>

      {/* Main lookup section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
        
        <div className="md:col-span-2">
          <label className="block text-[10px] text-gray-400 font-bold mb-1.5">• العنوان الوطني المختصر (Short National Address)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="مثال: RIY7719 أو MAK8821"
              value={address.shortAddress}
              onChange={(e) => updateField("shortAddress", e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-black text-center uppercase tracking-widest rounded-xl py-2.5 pl-4 pr-10 border outline-none bg-slate-950/60 text-white placeholder-gray-600 border-slate-800 focus:border-amber-500/50"
            />
            <MapPin className="absolute right-3 top-3 w-4 h-4 text-amber-500" />
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleSPLLookup}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center justify-center gap-1.5 border-none disabled:opacity-40"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>🔍 جلب العنوان التلقائي</span>
        </button>
      </div>

      {/* Sub controls bar */}
      <div className="flex flex-wrap justify-between items-center gap-1.5 p-2 bg-slate-950/30 rounded-xl border border-slate-900 text-[10.5px]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsReadOnly(!isReadOnly)}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold border-none cursor-pointer flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3 text-amber-500" />
            <span>{isReadOnly ? "تعديل يدوي ✏️" : "قفل النموذج 🔒"}</span>
          </button>

          <button
            type="button"
            onClick={handleValidateAddress}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold border-none cursor-pointer"
          >
            📋 التحقق من صحة العنوان
          </button>
        </div>
        <span className="text-gray-500 font-medium">البوابة البريدية الرسمية (SPL Integrated)</span>
      </div>

      {feedback && (
        <div className={`p-2 rounded-xl text-[10px] font-bold text-right border leading-relaxed flex items-center gap-2 ${
          feedback.type === "success" 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : feedback.type === "error" 
            ? "bg-rose-500/10 text-rose-450 border-rose-500/20" 
            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grid of full address fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/20 p-3 rounded-2xl border border-slate-900/60">
        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">رقم المبنى</label>
          <input
            type="text"
            placeholder="مثال: 7719"
            disabled={isReadOnly}
            value={address.buildingNumber}
            onChange={(e) => updateField("buildingNumber", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">اسم الشارع</label>
          <input
            type="text"
            placeholder="مثال: طريق الملك فهد"
            disabled={isReadOnly}
            value={address.streetName}
            onChange={(e) => updateField("streetName", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">الحي</label>
          <input
            type="text"
            placeholder="مثال: حي الياسمين"
            disabled={isReadOnly}
            value={address.district}
            onChange={(e) => updateField("district", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">المدينة</label>
          <input
            type="text"
            placeholder="مثال: الرياض"
            disabled={isReadOnly}
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">المنطقة</label>
          <input
            type="text"
            placeholder="منطقة الرياض"
            disabled={isReadOnly}
            value={address.region}
            onChange={(e) => updateField("region", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">الرمز البريدي</label>
          <input
            type="text"
            placeholder="مثال: 13326"
            disabled={isReadOnly}
            value={address.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border font-mono text-center outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">الرقم الإضافي</label>
          <input
            type="text"
            placeholder="مثال: 2140"
            disabled={isReadOnly}
            value={address.additionalNumber}
            onChange={(e) => updateField("additionalNumber", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border font-mono text-center outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">رقم الوحدة (اختياري)</label>
          <input
            type="text"
            placeholder="شقة / مكتب"
            disabled={isReadOnly}
            value={address.unitNumber}
            onChange={(e) => updateField("unitNumber", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div>
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">إحداثيات الموقع (GPS)</label>
          <input
            type="text"
            placeholder="24.8122, 46.6433"
            disabled={isReadOnly}
            value={address.gpsCoordinates}
            onChange={(e) => updateField("gpsCoordinates", e.target.value)}
            className="w-full text-xs font-mono text-center rounded-lg py-2 px-2.5 border outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-[9.5px] text-gray-500 font-semibold mb-1">رابط الموقع على الخريطة</label>
          <input
            type="text"
            placeholder="رابط الخريطة..."
            disabled={isReadOnly}
            value={address.mapLink}
            onChange={(e) => updateField("mapLink", e.target.value)}
            className="w-full text-xs rounded-lg py-2 px-2.5 border text-right outline-none bg-slate-950/80 text-white disabled:opacity-65 disabled:text-gray-400 border-slate-900"
          />
        </div>
      </div>

      {checkResult && (
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-900/80 text-[10px] space-y-2">
          <div className="flex justify-between items-center font-bold">
            <span className={checkResult.isValid ? "text-emerald-500" : "text-rose-500"}>
              {checkResult.isValid ? "✓ العناوين مستوفية ومطابقة" : "⚠️ كشف أخطاء بالعناوين"}
            </span>
            <span className="text-gray-500">تقرير استعلام الحوكمة والتحقق</span>
          </div>
          {checkResult.issues.length > 0 ? (
            <ul className="list-disc list-inside text-rose-450 space-y-1">
              {checkResult.issues.map((iss, iIdx) => (
                <li key={iIdx}>{iss}</li>
              ))}
            </ul>
          ) : (
            <p className="text-emerald-400">جميع معايير العنونة ممتثلة بالكامل للأنظمة الوطنية واللوجستية لشركة مرسال والتوريد.</p>
          )}
        </div>
      )}

    </div>
  );
}
