import React from "react";
import { ThemeColors } from "../types";

export interface ProfileAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: ThemeColors;
  className?: string;
  ringColor?: string;
}

export default function ProfileAvatar({
  name,
  imageUrl,
  size = "md",
  theme,
  className = "",
  ringColor,
}: ProfileAvatarProps) {
  // Helper to construct initials
  const getInitials = (fullName: string) => {
    if (!fullName) return "👤";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: "w-7 h-7 text-[9px]",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const actualRingColor = ringColor || (theme ? theme.accent : "#D4AF37");

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover shrink-0 ${sizeClasses[size]} ${className}`}
        style={{
          border: `2px solid ${actualRingColor}`,
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-extrabold select-none shrink-0 border uppercase font-sans ${sizeClasses[size]} ${className}`}
      style={{
        background: theme
          ? `linear-gradient(135deg, ${theme.surface} 0%, rgba(212,175,55,0.08) 100%)`
          : "linear-gradient(135deg, #1e1e2e 0%, #2e2e42 100%)",
        borderColor: actualRingColor,
        color: actualRingColor,
      }}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
}
