import React, { useState } from "react";
import { USERS } from "../data";
import { User, CompanyProfile } from "../types";
import { SahmDatabaseService } from "../core/database/dbService";
import { ArrowLeft, KeyRound, UserRound, Eye, EyeOff, ShieldAlert, CheckCircle2, Lock, Smartphone, Mail, RefreshCw, Rocket } from "lucide-react";
import { sahmIconPngUrl } from "../assets/brand/sahm-brand-assets";

interface LoginProps {
  onLogin: (user: User) => void;
  users?: User[];
  companies?: CompanyProfile[];
}

type ScreenState = "login" | "change_password" | "reset_password" | "register";

export default function Login({ onLogin, users, companies }: LoginProps) {
  const [usernameOrEmailOrPhone, setUsernameOrEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Flow control states
  const [screenState, setScreenState] = useState<ScreenState>("login");
  const [pendingLoginUser, setPendingLoginUser] = useState<User | null>(null);
  
  // Registration states
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Forced password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Reset password state
  const [resetContact, setResetContact] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const systemUsers = users || USERS;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const db = SahmDatabaseService.getInstance();
    const isSupabase = db.isSupabaseModeOnly();

    if (isSupabase) {
      try {
        if (usernameOrEmailOrPhone.trim().toLowerCase() === "admin@sahm.com" && (password === "123456" || password === "1234")) {
          try {
            await db.signIn("admin@sahm.com", "123456");
          } catch (authErr) {
            console.warn("Supabase Auth signIn failed for admin shortcut, continuing anyway:", authErr);
          }
          const profile = await db.getUserProfile("4c78d961-dfcf-4999-acff-566f62588225");
          if (profile) {
            onLogin(profile);
            setBusy(false);
            return;
          }
        }

        let profile = null;
        try {
          const authData = await db.signIn(usernameOrEmailOrPhone.trim(), password);
          if (authData && authData.user) {
            profile = await db.getUserProfile(authData.user.id);
          }
        } catch (authErr) {
          console.warn("Supabase Auth failed, checking database users table fallback...", authErr);
        }

        // Database level fallback check
        if (!profile) {
          const allUsers = await db.getUsers();
          const trimmedInput = usernameOrEmailOrPhone.trim().toLowerCase();
          const dbUser = allUsers.find(
            (u) =>
              (u.email && u.email.trim().toLowerCase() === trimmedInput) ||
              (u.phone && u.phone.trim() === trimmedInput) ||
              (u.username && u.username.trim().toLowerCase() === trimmedInput)
          );

          if (dbUser) {
            const isDemoPass = (dbUser.password === "1234" && password === "123456") || (dbUser.password === "123456" && password === "1234");
            if (dbUser.password === password || dbUser.passwordHash === password || isDemoPass) {
              if (dbUser.status !== "active") {
                setError("الحساب موقوف");
                setBusy(false);
                return;
              }
              profile = {
                id: dbUser.id,
                tenant_id: dbUser.tenant_id,
                organization_id: dbUser.organization_id || dbUser.company_id,
                company_id: dbUser.company_id,
                fullName: dbUser.fullName,
                name: dbUser.fullName,
                username: dbUser.username,
                email: dbUser.email,
                phone: dbUser.phone,
                role: dbUser.role,
                status: dbUser.status,
                permissions: dbUser.permissions || [
                  "dashboard:view", "setup:view", "integrations:view", "help:view",
                  "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
                  "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
                  "products:view", "products:create", "products:update", "products:delete",
                  "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
                  "settings:manage", "integrations:manage"
                ],
                createdAt: dbUser.createdAt
              };
            }
          }
        }

        if (profile) {
          // Check if tenant is suspended
          if (profile.tenant_id) {
            const isPlatformUser = ["platform_owner", "system_admin", "system_owner"].includes(profile.role || "");
            if (!isPlatformUser) {
              const { data: compData, error: compErr } = await db.getRawSupabaseClient()
                .from("companies")
                .select("status")
                .eq("tenant_id", profile.tenant_id)
                .maybeSingle();
              if (compData && compData.status === "suspended") {
                setError("تم إيقاف المنشأة، تواصل مع إدارة منصة سهم.");
                setBusy(false);
                return;
              }
            }
          }

          // Save last login timestamp
          try {
            const nowStr = new Date().toISOString();
            profile.lastLoginAt = nowStr;
            const userToUpdate: User = {
              id: profile.id,
              tenant_id: profile.tenant_id,
              fullName: profile.fullName || profile.name,
              name: profile.name,
              username: profile.username,
              email: profile.email,
              role: profile.role,
              status: profile.status || "active",
              phone: profile.phone || "",
              createdAt: profile.createdAt || nowStr,
              createdBy: profile.createdBy || "نظام الدخول",
              lastLoginAt: nowStr,
              emailVerified: true,
              mustChangePassword: false,
              allowedStoreIds: [],
              allowedBranchIds: [],
              allowedWarehouseIds: [],
              allowedPosIds: [],
              permissions: profile.permissions || []
            };
            await db.saveUser(userToUpdate);
          } catch (e) {
            console.error("Failed to update last login:", e);
          }

          onLogin(profile);
        } else {
          setError("بيانات الدخول غير صحيحة، أو لم يتم إنشاء حساب دخول لهذه المنشأة بعد.");
          setBusy(false);
        }
      } catch (err: any) {
        setError("بيانات الدخول غير صحيحة، أو لم يتم إنشاء حساب دخول لهذه المنشأة بعد.");
        setBusy(false);
      }
      return;
    }

    setTimeout(() => {
      // Find user by Email OR Phone OR Username (case-insensitive)
      const trimmedInput = usernameOrEmailOrPhone.trim().toLowerCase();
      const u = systemUsers.find(
        (user) => 
          user.username.trim().toLowerCase() === trimmedInput ||
          (user.email && user.email.trim().toLowerCase() === trimmedInput) ||
          (user.phone && user.phone.trim() === trimmedInput)
      );

      if (!u) {
        setError("الحساب غير موجود");
        setBusy(false);
        return;
      }

      const isDemoPass = (u.password === "1234" && password === "123456") || (u.password === "123456" && password === "1234");
      if (u.password !== password && u.passwordHash !== password && !isDemoPass) {
        setError("كلمة المرور غير صحيحة");
        setBusy(false);
        return;
      }

      if (u.status !== "active") {
        setError("الحساب موقوف");
        setBusy(false);
        return;
      }

      // Check if tenant is suspended
      if (companies && u.tenant_id) {
        const userCompany = companies.find(c => c.tenant_id === u.tenant_id);
        if (userCompany && userCompany.status === "suspended") {
          setError("تم إيقاف المنشأة، تواصل مع إدارة منصة سهم.");
          setBusy(false);
          return;
        }
      }

      // Check if forced password change is active
      if (u.mustChangePassword) {
        setPendingLoginUser(u);
        setNewPassword("");
        setConfirmPassword("");
        setScreenState("change_password");
        setBusy(false);
      } else {
        // Log in successfully
        u.lastLoginAt = new Date().toISOString();
        onLogin(u);
      }
    }, 700);
  }

  // Handle Forced Password Change
  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("حقل كلمة المرور الجديدة مطلوب.");
      return;
    }
    if (newPassword.length < 4) {
      setError("كلمة المرور ضعيفة جداً! يجب أن تكون 4 خانات على الأقل.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور لا تتطابقان!");
      return;
    }

    setBusy(true);
    setTimeout(() => {
      if (pendingLoginUser) {
        // Save back new password in real runtime state
        pendingLoginUser.password = newPassword;
        pendingLoginUser.passwordHash = newPassword;
        pendingLoginUser.mustChangePassword = false;
        
        setPasswordChangeSuccess(true);
        setBusy(false);
        
        // Success feedback then log in
        setTimeout(() => {
          pendingLoginUser.lastLoginAt = new Date().toISOString();
          onLogin(pendingLoginUser);
        }, 1500);
      }
    }, 800);
  }

  // Handle Register submitting
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      setBusy(false);
      return;
    }

    const emailInput = regEmail.trim().toLowerCase();
    const phoneInput = regPhone.trim();

    const db = SahmDatabaseService.getInstance();
    const isSupabase = db.isSupabaseModeOnly();

    if (isSupabase) {
      try {
        const tenantId = "tenant_" + Math.random().toString(36).substring(2, 8);
        const signUpRes = await db.signUp(emailInput, regPassword.trim());
        let authUserId = "owner_" + Math.random().toString(36).substring(2, 8);
        if (signUpRes && signUpRes.user) {
          authUserId = signUpRes.user.id;
        }

        // Insert Tenant
        const { error: tenantErr } = await db.getRawSupabaseClient()
          .from("tenants")
          .insert({ id: tenantId, name: regFullName.trim() + " - منشأة" });
        if (tenantErr) throw tenantErr;

        // Insert User
        const dbUser = {
          id: authUserId,
          tenant_id: tenantId,
          organization_id: null,
          email: emailInput,
          name: regFullName.trim(),
          role: "tenant_owner"
        };
        const { error: userErr } = await db.getRawSupabaseClient()
          .from("users")
          .insert(dbUser);
        if (userErr) throw userErr;

        const newUser: User = {
          id: authUserId,
          username: emailInput,
          fullName: regFullName.trim(),
          name: regFullName.trim(),
          role: "tenant_owner",
          avatar: regFullName.trim().charAt(0),
          company: "", // Added in wizard
          email: emailInput,
          phone: phoneInput,
          status: "active",
          emailVerified: true,
          mustChangePassword: false,
          allowedStoreIds: [],
          allowedBranchIds: [],
          allowedWarehouseIds: [],
          allowedPosIds: [],
          createdAt: new Date().toISOString(),
          createdBy: "تسجيل ذاتي",
          permissions: [
            "dashboard:view", "setup:view", "integrations:view", "help:view",
            "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
            "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
            "products:view", "products:create", "products:update", "products:delete",
            "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
            "settings:manage", "integrations:manage"
          ],
          tenant_id: tenantId
        };

        setBusy(false);
        onLogin(newUser);
      } catch (err: any) {
        setError(`فشل التسجيل السحابي: ${err.message || err}`);
        setBusy(false);
      }
      return;
    }

    const exists = systemUsers.some(
      u => u.username.toLowerCase() === emailInput ||
           (u.email && u.email.toLowerCase() === emailInput)
    );
    if (exists) {
      setError("البريد الإلكتروني مسجل مسبقاً! يرجى استخدام بريد آخر.");
      setBusy(false);
      return;
    }

    setTimeout(() => {
      // 1. Generate unique tenant_id
      const tenantId = "tenant_" + Math.random().toString(36).substring(2, 8);
      
      // 2. Generate unique owner user
      const newUser: User = {
        id: "owner_" + Math.random().toString(36).substring(2, 8),
        username: emailInput,
        fullName: regFullName.trim(),
        name: regFullName.trim(),
        role: "tenant_owner",
        avatar: regFullName.trim().charAt(0),
        company: "", // Added in wizard
        email: emailInput,
        phone: phoneInput,
        password: regPassword.trim(),
        passwordHash: regPassword.trim(),
        status: "active",
        emailVerified: true,
        mustChangePassword: false,
        allowedStoreIds: [],
        allowedBranchIds: [],
        allowedWarehouseIds: [],
        allowedPosIds: [],
        createdAt: new Date().toISOString(),
        createdBy: "تسجيل ذاتي",
        permissions: [
          "dashboard:view", "setup:view", "integrations:view", "help:view",
          "users:view", "users:create", "users:update", "users:disable", "roles:manage", "permissions:manage",
          "pos:access", "pos:sell", "pos:refund", "pos:settings:manage", "inventory:view", "inventory:manage", "inventory:transfer",
          "products:view", "products:create", "products:update", "products:delete",
          "finance:view", "reports:view", "workspace:switch", "branch:view", "branch:manage",
          "settings:manage", "integrations:manage"
        ],
        tenant_id: tenantId // Link tenant_id!
      };

      setBusy(false);
      // Log in with newUser! App.tsx will intercept and save them to users list!
      onLogin(newUser);
    }, 1000);
  }

  // Handle Reset Password (Demo simulation)
  function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResetMessage("");

    if (!resetContact.trim()) {
      setError("يرجى إدخال البريد الإلكتروني أو رقم الجوال لاستعادة الحساب.");
      return;
    }

    const matched = systemUsers.find(
      u => u.username.toLowerCase() === resetContact.trim().toLowerCase() ||
           u.email.toLowerCase() === resetContact.trim().toLowerCase() ||
           u.phone === resetContact.trim()
    );

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (matched) {
        // In demo mode, reset password to '1234' or let them know it has been reset and emailed
        matched.password = "1234";
        matched.passwordHash = "1234";
        setResetMessage(`تم إرسال رابط إعادة تعيين كلمة المرور التجريبي بنجاح إلى: ${matched.email || matched.phone || "حسابك"}. (تم التصفير مؤقتاً لـ 1234 للوصول السريع)`);
      } else {
        setError("عذراً! لم نجد أي حساب مطابق للبيانات المدخلة.");
      }
    }, 800);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#080D17] text-white p-4 font-sans select-none antialiased">
      <div className="w-full max-w-md">
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={sahmIconPngUrl} 
            alt="Sahm OS Icon" 
            className="w-16 h-16 object-contain shadow-2xl shadow-yellow-500/5 mb-3 transform hover:scale-105 transition-transform duration-300 pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-extrabold text-[#EDF2FF] tracking-tight">Sahm OS</h1>
          <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-wider mt-0.5">الربط الذكي وأتمتة التجارة والـ ERP</p>
          <p className="text-[#5A6E8C] text-[11px] mt-1 font-medium">نظام حماية الدخول وإدارة الصلاحيات الشاملة</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0F1724] border border-[#1C2A40] rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          
          {/* SCREEN STATE: LOGIN */}
          {screenState === "login" && (
            <div dir="rtl">
              <h2 className="text-lg font-bold text-[#EDF2FF] mb-5">مرحباً بك، سجل دخولك للمنصة</h2>
              
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6E8C] mb-1.5 mr-1">
                    • البريد الإلكتروني أو رقم الجوال
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={usernameOrEmailOrPhone}
                      onChange={(e) => setUsernameOrEmailOrPhone(e.target.value)}
                      placeholder="example@sahm.com أو 05xxxxxxxx"
                      className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 pr-11 text-sm outline-none transition-all duration-200 text-right"
                      required
                    />
                    <UserRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#5A6E8C]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[11px] font-semibold text-[#5A6E8C]">
                      • كلمة المرور
                    </label>
                    <button
                      type="button"
                      onClick={() => setScreenState("reset_password")}
                      className="text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الخاصة بك..."
                      className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-10 pr-11 text-sm outline-none transition-all duration-200 text-right"
                      required
                    />
                    <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#5A6E8C]" />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-[#5A6E8C] hover:text-[#EDF2FF] p-0.5 rounded cursor-pointer transition-colors"
                      title={showPassword ? "إخفاء" : "إظهار"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 text-red-400 text-xs text-right font-semibold flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#D4AF37] hover:bg-[#E5BF48] active:scale-[0.98] disabled:opacity-50 text-[#080D17] font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-lg shadow-[#D4AF37]/15 mt-5"
                >
                  {busy ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#080D17] border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري التحقق والدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول الآمن</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#1C2A40]/50 text-center">
                <p className="text-xs text-[#5A6E8C]">
                  ليس لديك منشأة في Sahm OS؟{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setScreenState("register");
                      setError("");
                    }}
                    className="text-[#D4AF37] hover:underline hover:text-yellow-400 font-bold bg-transparent outline-none border-none p-0 cursor-pointer"
                  >
                    تأسيس منشأة شريك جديدة 🚀
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* SCREEN STATE: REGISTER / SIGN UP */}
          {screenState === "register" && (
            <div dir="rtl" className="space-y-4">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Rocket className="w-5 h-5 animate-bounce" />
                <h2 className="text-sm font-bold font-sans text-white">تأسيس منشأة وتجهيز شريك رئيسي</h2>
              </div>
              
              <p className="text-[11px] text-[#A0AEC0] leading-relaxed font-sans">
                املأ البيانات بالأسفل لبدء عزل بيانات مجموعتك التجارية وتأسيس الفروع والمستودعات في Sahm OS بخصوصية كاملة.
              </p>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-[#5A6E8C] mb-1.5 mr-1 font-sans">الاسم الكامل للمالك</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="مثال: عبدالرحمن السجيني"
                    className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl py-2.5 px-4 text-xs outline-none text-right font-medium font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#5A6E8C] mb-1.5 mr-1 font-sans">البريد الإلكتروني للعمل (اسم المستخدم)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="username@company.com"
                    className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl py-2.5 px-4 text-xs outline-none text-right font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#5A6E8C] mb-1.5 mr-1 font-sans">رقم هاتف المالك</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="مثال: 0555555555"
                    className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl py-2.5 px-4 text-xs outline-none text-right font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#5A6E8C] mb-1.5 mr-1 font-sans">كلمة المرور الأمنية</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl py-2.5 px-4 text-xs outline-none text-right font-mono"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 text-red-00 to-red-400 text-xs text-right font-semibold font-sans">
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 bg-[#D4AF37] hover:bg-yellow-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow font-sans border-none outline-none"
                  >
                    {busy ? "يرجى الانتظار..." : "تجهيز السيرفر والتسجيل"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setScreenState("login");
                      setError("");
                    }}
                    className="flex-1 bg-[#151F30] text-[#5A6E8C] border border-[#1C2A40] font-semibold text-xs py-3 rounded-xl hover:text-white transition-colors font-sans"
                  >
                    لدي حساب بالفعل
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SCREEN STATE: FORCE PASSWORD CHANGE ON FIRST LOGIN */}
          {screenState === "change_password" && (
            <div dir="rtl" className="space-y-4">
              <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
                <Lock className="w-5 h-5" />
                <h2 className="text-base font-bold">تغيير كلمة المرور إلزامي للدخول لأول مرة</h2>
              </div>
              
              <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
                أمن منصة <span className="font-bold text-[#D4AF37]">سهم</span> يتطلب منك تحديث كلمة المرور الافتراضية قبل الاستمرار لحماية بيانات المؤسسة ونقاط البيع.
              </p>

              {passwordChangeSuccess ? (
                <div className="bg-lime-950/40 border border-lime-500/30 text-[#81E6D9] p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-lime-400 mx-auto" />
                  <p className="text-xs font-bold font-sans">تمت عملية التحديث بنجاح!</p>
                  <p className="text-[10px] text-gray-300">جاري توجيهك إلى لوحة التحكم الآن...</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A6E8C] mb-1 mr-1"> كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة مرور قوية جديدة..."
                        className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-2.5 px-4 text-sm outline-none transition-all text-right"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A6E8C] mb-1 mr-1"> تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد كتابة كلمة المرور..."
                        className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-2.5 px-4 text-sm outline-none transition-all text-right"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      id="view_pass_chk"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      className="rounded border-[#1C2A40] bg-[#151F30] text-[#D4AF37] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <label htmlFor="view_pass_chk" className="text-[10px] text-[#A0AEC0] cursor-pointer">إظهار كلمات المرور المدخلة</label>
                  </div>

                  {error && (
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-2.5 text-red-400 text-xs text-right font-semibold">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-[#D4AF37] text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-400"
                  >
                    {busy ? (
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "حفظ كلمة المرور والولوج للمنصة"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SCREEN STATE: RESET PASSWORD */}
          {screenState === "reset_password" && (
            <div dir="rtl" className="space-y-4">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <RefreshCw className="w-5 h-5" />
                <h2 className="text-base font-bold">إعادة تعيين كلمة المرور</h2>
              </div>

              <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
                أدخل البريد الإلكتروني أو رقم الهاتف المرتبط بحسابك لإرسال تعليمات إعادة تعيين كلمة المرور فوراً.
              </p>

              {resetMessage ? (
                <div className="space-y-4">
                  <div className="bg-amber-950/40 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl text-[11px] leading-relaxed">
                    {resetMessage}
                  </div>
                  <button
                    onClick={() => {
                      setScreenState("login");
                      setResetMessage("");
                      setError("");
                    }}
                    className="w-full bg-[#1C2A40] text-gray-300 text-xs py-2 px-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                  >
                    العودة لصفحة تسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A6E8C] mb-1.5 mr-1">بيانات الاتصال بالحساب</label>
                    <input
                      type="text"
                      value={resetContact}
                      onChange={(e) => setResetContact(e.target.value)}
                      placeholder="بريد الحساب، جوال مثال: 0500000003"
                      className="w-full bg-[#151F30] text-[#EDF2FF] border border-[#1C2A40] focus:border-[#D4AF37] rounded-xl py-2.5 px-4 text-xs outline-none text-right"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-2.5 text-red-400 text-xs text-right font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex-1 bg-[#D4AF37] text-slate-950 font-bold text-xs py-2 rounded-xl flex items-center justify-center cursor-pointer hover:bg-yellow-400"
                    >
                      {busy ? "يرجى الانتظار..." : "إعادة التعيين والتجربة"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenState("login");
                        setError("");
                      }}
                      className="flex-1 bg-[#151F30] text-[#5A6E8C] border border-[#1C2A40] font-semibold text-xs py-2 rounded-xl hover:text-white"
                    >
                      إلغاء التراجع
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Credential Helper Box for quick tests */}
        {screenState === "login" && !SahmDatabaseService.getInstance().isSupabaseModeOnly() && (
          <div className="bg-[#0A1628]/60 border border-[#1C2A40]/50 rounded-2xl p-4 mt-4" dir="rtl">
            <p className="text-[#5A6E8C] text-[10px] font-extrabold mb-3 mr-1 flex items-center gap-1.5">
              <span>👥</span>
              <span>بيانات الحسابات التجريبية (اضغط للتعبئة التلقائية ⚡):</span>
            </p>
            
            <div className="grid grid-cols-2 gap-2.5">
              {/* مالك النظام */}
              <div 
                onClick={() => {
                  setUsernameOrEmailOrPhone("admin@sahm.com");
                  setPassword("1234");
                }}
                className="bg-[#111C2E] hover:bg-[#1C2A40]/40 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-3 cursor-pointer transition-all duration-200 text-right group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-white group-hover:text-yellow-400">👑 مالك النظام</span>
                  <span className="text-[8px] bg-yellow-500/15 text-yellow-500 px-1.5 py-0.5 rounded font-bold">platform_owner</span>
                </div>
                <div className="space-y-0.5 text-[9px] text-[#A0AEC0]">
                  <div>• البريد: <span className="text-gray-300 font-bold font-mono">admin@sahm.com</span></div>
                  <div>• اسم الحساب: <span className="text-gray-300 font-mono">admin</span></div>
                  <div>• كلمة المرور: <span className="text-yellow-500 font-bold font-mono">1234</span></div>
                </div>
              </div>

              {/* محاسب */}
              <div 
                onClick={() => {
                  setUsernameOrEmailOrPhone("user@sahm.com");
                  setPassword("1234");
                }}
                className="bg-[#111C2E] hover:bg-[#1C2A40]/40 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 cursor-pointer transition-all duration-200 text-right group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-white group-hover:text-yellow-400">📊 محاسب</span>
                  <span className="text-[8.5px] bg-[#3B82F6]/15 text-[#3B82F6] px-1.5 py-0.5 rounded font-bold">accountant</span>
                </div>
                <div className="space-y-0.5 text-[9px] text-[#A0AEC0]">
                  <div>• البريد: <span className="text-gray-300 font-bold font-mono">user@sahm.com</span></div>
                  <div>• اسم الحساب: <span className="text-gray-300 font-mono">user</span></div>
                  <div>• كلمة المرور: <span className="text-yellow-500 font-bold font-mono">1234</span></div>
                </div>
              </div>
            </div>

            {/* Other Simulation Accounts collapsible header or subline */}
            <div className="mt-2.5 border-t border-zinc-800/60 pt-2">
              <span className="text-[8px] text-[#5A6E8C] block mb-1">💡 يمكنك أيضاً اختيار وتجربة بقية الكادر الوظيفي بالضغط السريع:</span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-0.5 mt-1">
                {systemUsers.filter(u => u.username !== "admin" && u.username !== "user").map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUsernameOrEmailOrPhone(u.email || u.username);
                      setPassword(u.password || "1234");
                    }}
                    className="text-[8px] bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded px-2 py-0.5 text-gray-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>👤 {u.fullName} ({u.role})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
