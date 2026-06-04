import React, { useState } from "react";
import { USERS } from "../data";
import { User } from "../types";
import { ArrowLeft, KeyRound, UserRound } from "lucide-react";
import { sahmIconPngUrl } from "../assets/brand/sahm-brand-assets";

interface LoginProps {
  onLogin: (user: User) => void;
  users?: User[];
}

export default function Login({ onLogin, users }: LoginProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const systemUsers = users || USERS;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    setTimeout(() => {
      const u = systemUsers.find(
        (user) => user.username.trim().toLowerCase() === username.trim().toLowerCase() && "1234" === password
      );
      if (u) {
        onLogin(u);
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة!");
        setBusy(false);
      }
    }, 700);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#080D17] text-white p-4 font-sans select-none antialiased">
      <div className="w-full max-w-md">
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={sahmIconPngUrl} 
            alt="Sahm OS Icon" 
            className="w-20 h-20 object-contain shadow-2xl shadow-yellow-500/5 mb-4 transform hover:scale-105 transition-transform duration-300 pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3xl font-extrabold text-[#EDF2FF] tracking-tight">Sahm OS</h1>
          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-wider mt-1">الربط الذكي وأتمتة التجارة والـ ERP</p>
          <p className="text-[#5A6E8C] text-xs mt-1.5 font-medium">ذكاء اصطناعي يحرك مبيعاتك وتجارتك إلى الأمام</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0F1724] border border-[#1C2A40] rounded-3xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#EDF2FF] mb-6">سررنا بعودتك، سجّل الدخول</h2>
          
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#5A6E8C] mb-2 mr-1">• اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم..."
                  className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 pr-11 text-sm outline-none transition-all duration-200 text-right"
                  required
                />
                <UserRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#5A6E8C]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A6E8C] mb-2 mr-1">• كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور..."
                  className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 pr-11 text-sm outline-none transition-all duration-200 text-right"
                  required
                />
                <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#5A6E8C]" />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 text-red-400 text-xs text-center font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#D4AF37] hover:bg-[#E5BF48] active:scale-[0.98] disabled:opacity-50 text-[#080D17] font-bold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-lg shadow-[#D4AF37]/15 mt-6"
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#080D17] border-t-transparent rounded-full animate-spin"></span>
                  <span>جاري الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4 transition-transform duration-200 transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Credential Helper Box */}
        <div className="bg-[#0A1628]/40 border border-[#1C2A40]/50 rounded-2xl p-4 mt-6">
          <p className="text-[#5A6E8C] text-xs font-bold mb-3 mr-1">💡 للتجربة السريعة والمحاكاة:</p>
          <div className="space-y-2">
            {systemUsers.map((user) => (
              <div key={user.id} className="flex justify-between items-center text-xs bg-[#111C2E]/60 rounded-lg p-2 px-3 border border-[#1C2A40]/20">
                <span className="text-[#EDF2FF]">
                  رتبة: <span className="font-bold text-gray-300">{user.role}</span>
                </span>
                <span className="text-right">
                  <span className="text-[#D4AF37] font-semibold">{user.username}</span> / <span className="text-gray-400">1234</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
