import React from "react";
import { AddressProfile, ThemeColors } from "../types";
import { MapPin, Copy, Calendar, Navigation } from "lucide-react";

export interface AddressCardProps {
  address?: AddressProfile;
  theme: ThemeColors;
  title?: string;
  onCopySuccess?: (msg: string) => void;
  className?: string;
}

export default function AddressCard({
  address,
  theme,
  title = "العنوان الوطني المعتمد (SPL)",
  onCopySuccess,
  className = "",
}: AddressCardProps) {
  if (!address) return null;

  const handleCopy = () => {
    const full = `العنوان الوطني: مبنى ${address.buildingNumber}، ${address.streetName}، حي ${address.district}، ${address.city} ${address.postalCode}، الرقم الإضافي ${address.additionalNumber}، المملكة العربية السعودية`;
    navigator.clipboard.writeText(full);
    if (onCopySuccess) {
      onCopySuccess("تم نسخ العنوان الوطني بنجاح! 📋");
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 text-right ${className}`}
      style={{
        backgroundColor: theme.card,
        borderColor: `${theme.border}90`,
      }}
    >
      <div className="flex justify-between items-center">
        {address.shortAddress && (
          <span
            className="text-[9px] font-mono font-black border px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse"
            style={{
              borderColor: "rgba(212, 175, 55, 0.25)",
              color: theme.accent,
              backgroundColor: `${theme.accent}10`,
            }}
          >
            {address.shortAddress}
          </span>
        )}
        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
          <Navigation className="w-3 h-3 text-amber-500" />
          {title}
        </span>
      </div>

      <p className="text-[10.5px] text-gray-200 leading-relaxed font-sans font-medium">
        مبنى {address.buildingNumber}، {address.streetName}،{' '}
        {address.district ? `حي ${address.district}` : ''}، {address.city}،{' '}
        الرمز البريدي {address.postalCode}{' '}
        {address.additionalNumber ? `، الرقم الإضافي ${address.additionalNumber}` : ''}
        {address.unitNumber ? `، وحدة ${address.unitNumber}` : ''}، المملكة العربية السعودية
      </p>

      {/* Lat/Lng information */}
      {(address.latitude || address.longitude) && (
        <p className="text-[9px] font-mono text-gray-400">
          📍 الإحداثيات: {address.latitude || 'N/A'}, {address.longitude || 'N/A'}
        </p>
      )}

      <div className="flex gap-2 justify-start pt-1.5 border-t border-dashed" style={{ borderColor: theme.border }}>
        <button
          onClick={handleCopy}
          type="button"
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-[9px] hover:text-white rounded-lg font-extrabold text-gray-400 transition-all border-none cursor-pointer flex items-center gap-1.5"
        >
          <Copy className="w-3 h-3" />
          <span>نسخ العنوان 📋</span>
        </button>

        {address.mapLink && (
          <a
            href={address.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-[9px] hover:text-blue-300 rounded-lg font-extrabold text-blue-400 transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-3 h-3" />
            <span>عرض الخريطة 📍</span>
          </a>
        )}
      </div>
    </div>
  );
}
