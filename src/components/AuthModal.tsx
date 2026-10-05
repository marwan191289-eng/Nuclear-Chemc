import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Atom, CheckCircle2, Mail, ShieldCheck, X } from "lucide-react";
import { apiFetch, appPath, setStoredSessionToken } from "../lib/app-path";

export interface AuthenticatedAccount {
  id: string;
  name: string;
  email: string;
  role: "admin" | "instructor" | "student" | "parent";
}

interface AuthModalProps {
  language: "ar" | "en";
  onClose: () => void;
  onAuthenticated: (user: AuthenticatedAccount) => void;
}

type SocialProvider = {
  id: "google" | "apple" | "facebook" | "twitter" | "github" | "linkedin" | "microsoft";
  labelAr: string;
  labelEn: string;
  defaultEmail: string;
  defaultNameAr: string;
  defaultNameEn: string;
  accentClass: string;
  icon: React.ReactNode;
};

const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: "google",
    labelAr: "Google / Gmail",
    labelEn: "Google / Gmail",
    defaultEmail: "student.nuclear@gmail.com",
    defaultNameAr: "طالب عبر Gmail",
    defaultNameEn: "Google Learner",
    accentClass: "hover:border-[#00e5ff] hover:shadow-[0_0_20px_rgba(0,229,255,0.25)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.8 8.1 22 12 22z"
        />
        <path
          fill="#4A90E2"
          d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.3-2.6z"
        />
        <path
          fill="#FBBC05"
          d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3.1 7.5l3.3 2.6c.8-2.3 3-4.2 5.6-4.2z"
        />
      </svg>
    ),
  },
  {
    id: "apple",
    labelAr: "Apple / iCloud",
    labelEn: "Apple / iCloud",
    defaultEmail: "student.nuclear@icloud.com",
    defaultNameAr: "طالب عبر iCloud",
    defaultNameEn: "iCloud Learner",
    accentClass: "hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-current" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    labelAr: "Facebook",
    labelEn: "Facebook",
    defaultEmail: "student.fb@gmail.com",
    defaultNameAr: "طالب عبر فيسبوك",
    defaultNameEn: "Facebook Learner",
    accentClass: "hover:border-[#1877F2] hover:shadow-[0_0_20px_rgba(24,119,242,0.3)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="#1877F2" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    labelAr: "X / Twitter",
    labelEn: "X / Twitter",
    defaultEmail: "student.x@gmail.com",
    defaultNameAr: "طالب عبر إكس",
    defaultNameEn: "X Learner",
    accentClass: "hover:border-[#00e5ff] hover:shadow-[0_0_20px_rgba(0,229,255,0.25)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "github",
    labelAr: "GitHub",
    labelEn: "GitHub",
    defaultEmail: "student.github@gmail.com",
    defaultNameAr: "طالب عبر GitHub",
    defaultNameEn: "GitHub Learner",
    accentClass: "hover:border-slate-400 hover:shadow-[0_0_20px_rgba(148,163,184,0.25)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-current" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    labelAr: "LinkedIn",
    labelEn: "LinkedIn",
    defaultEmail: "student.linkedin@gmail.com",
    defaultNameAr: "طالب عبر لينكد إن",
    defaultNameEn: "LinkedIn Learner",
    accentClass: "hover:border-[#0A66C2] hover:shadow-[0_0_20px_rgba(10,102,194,0.3)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="#0A66C2" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "microsoft",
    labelAr: "Microsoft / Outlook",
    labelEn: "Microsoft / Outlook",
    defaultEmail: "student.nuclear@outlook.com",
    defaultNameAr: "طالب عبر Microsoft",
    defaultNameEn: "Microsoft Learner",
    accentClass: "hover:border-[#00a4ef] hover:shadow-[0_0_20px_rgba(0,164,239,0.25)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
        <path fill="#f25022" d="M1 1h10v10H1z" />
        <path fill="#00a4ef" d="M1 13h10v10H1z" />
        <path fill="#7fba00" d="M13 1h10v10H13z" />
        <path fill="#ffb900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
];

export function AuthModal({ language, onClose, onAuthenticated }: AuthModalProps) {
  const isEn = language === "en";
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Social OAuth quick-connect state
  const [selectedProvider, setSelectedProvider] = useState<SocialProvider | null>(null);
  const [socialEmail, setSocialEmail] = useState("");
  const [socialName, setSocialName] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const handleSelectProvider = (provider: SocialProvider) => {
    setError("");
    setSelectedProvider(provider);
    setSocialEmail(provider.defaultEmail);
    setSocialName(isEn ? provider.defaultNameEn : provider.defaultNameAr);
  };

  const handleConfirmSocialAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(appPath("/api/auth/social"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider.id,
          email: socialEmail.trim(),
          name: socialName.trim(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        user?: AuthenticatedAccount;
        token?: string;
        error?: string;
      };
      if (!response.ok || !data.user) {
        setError(
          data.error ||
            (isEn
              ? "Could not complete social sign-in. Please try again."
              : "تعذر إتمام الدخول السريع. حاول مرة أخرى."),
        );
        return;
      }
      if (data.token) setStoredSessionToken(data.token);
      onAuthenticated(data.user);
      onClose();
    } catch {
      setError(
        isEn
          ? "Connection failed. Check your internet and retry."
          : "تعذر الاتصال. تحقق من الإنترنت وحاول مجدداً.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(
        appPath(mode === "register" ? "/api/auth/register" : "/api/auth/login"),
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...(mode === "register" ? { name } : {}), email, password }),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        user?: AuthenticatedAccount;
        token?: string;
      };
      if (!response.ok || !data.user) {
        if (response.status === 409) {
          setError(
            isEn
              ? "An account with this email already exists."
              : "يوجد حساب مسجل بهذا البريد الإلكتروني.",
          );
        } else if (response.status === 503) {
          setError(
            isEn
              ? "Accounts are temporarily unavailable. Please try again shortly."
              : "خدمة الحسابات غير متاحة مؤقتاً. حاول مرة أخرى بعد قليل.",
          );
        } else if (mode === "register" && password.length < 12) {
          setError(
            isEn
              ? "Use a password with at least 12 characters."
              : "استخدم كلمة مرور لا تقل عن 12 حرفاً.",
          );
        } else {
          setError(
            isEn
              ? "We could not verify those details. Please check them and try again."
              : "تعذر التحقق من البيانات. راجعها وحاول مرة أخرى.",
          );
        }
        return;
      }
      if (data.token) setStoredSessionToken(data.token);
      onAuthenticated(data.user);
      onClose();
    } catch {
      setError(
        isEn
          ? "Connection failed. Check your internet and retry."
          : "تعذر الاتصال. تحقق من الإنترنت وحاول مجدداً.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        aria-labelledby="account-dialog-title"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#080d18] text-white shadow-[0_0_80px_-15px_rgba(0,229,255,0.3)] my-4"
        dir={isEn ? "ltr" : "rtl"}
        role="dialog"
      >
        <header className="relative border-b border-slate-800/80 bg-[#060a13] px-7 pb-5 pt-6 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close" : "إغلاق"}
            className="absolute end-5 top-5 rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
            data-testid="button-close-auth"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <Atom size={22} />
            </div>
            <div>
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#00e5ff]">
                {isEn ? "NUCLEAR KNOWLEDGE HUB" : "مركز المعرفة النووية"}
              </p>
              <h2 id="account-dialog-title" className="mt-0.5 text-xl sm:text-2xl font-bold text-white">
                {mode === "register"
                  ? isEn
                    ? "Create your learner account"
                    : "أنشئ حسابك الدراسي"
                  : isEn
                    ? "Welcome back"
                    : "مرحباً بعودتك"}
              </h2>
            </div>
          </div>
          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-400">
            {mode === "register"
              ? isEn
                ? "Sign up in seconds via your favorite platform or email to save your progress."
                : "سجّل في ثوانٍ عبر حساباتك المفضلة أو بالبريد الإلكتروني لحفظ تقدمك ودروسك."
              : isEn
                ? "Sign in with one click using your social account or email."
                : "سجّل الدخول بضغطة واحدة عبر منصات التواصل أو البريد الإلكتروني."}
          </p>
        </header>

        <div className="px-7 py-6 sm:px-8 space-y-5">
          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200"
            >
              <AlertCircle className="mt-0.5 shrink-0 text-rose-400" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Social Login Providers Grid */}
          {!selectedProvider ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <span>
                  {isEn
                    ? "Instant Sign-In / Registration via"
                    : "الدخول أو التسجيل السريع عبر"}
                </span>
                <span className="inline-flex items-center gap-1 text-[#00e5ff]">
                  <ShieldCheck className="size-3.5" />
                  <span>OAuth 2.0</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SOCIAL_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    disabled={busy}
                    onClick={() => handleSelectProvider(provider)}
                    data-testid={`button-social-${provider.id}`}
                    className={`flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0b1220] px-3 py-2.5 text-xs font-semibold text-slate-200 transition-all cursor-pointer ${provider.accentClass} hover:-translate-y-0.5`}
                  >
                    {provider.icon}
                    <span className="truncate">
                      {isEn ? provider.labelEn : provider.labelAr}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 1-Step Social Identity Confirmation Box */
            <form
              onSubmit={handleConfirmSocialAuth}
              className="rounded-2xl border border-cyan-500/40 bg-[#0b1324] p-4 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  {selectedProvider.icon}
                  <span>
                    {isEn
                      ? `Continue with ${selectedProvider.labelEn}`
                      : `المتابعة باستخدام ${selectedProvider.labelAr}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  {isEn ? "Change provider" : "تغيير الوسيلة"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1 text-xs">
                  <span className="text-slate-300 font-medium">
                    {isEn ? "Display Name" : "الاسم في المنصة"}
                  </span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#060a13] px-3 py-2 text-xs text-white focus:border-[#00e5ff] focus:outline-none"
                  />
                </label>
                <label className="block space-y-1 text-xs">
                  <span className="text-slate-300 font-medium">
                    {isEn ? "Account Email" : "البريد المرتبط بالحساب"}
                  </span>
                  <input
                    type="email"
                    required
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-700 bg-[#060a13] px-3 py-2 text-xs text-white focus:border-[#00e5ff] focus:outline-none"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                data-testid="button-confirm-social-auth"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00e5ff] py-2.5 text-xs font-bold text-[#041017] shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:brightness-110 transition cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                <span>
                  {busy
                    ? isEn
                      ? "Connecting account..."
                      : "جارٍ ربط الحساب والدخول..."
                    : isEn
                      ? `Continue as ${socialName || selectedProvider.labelEn}`
                      : `متابعة ودخول باسم ${socialName || selectedProvider.labelAr}`}
                </span>
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="relative bg-[#080d18] px-3 text-[11px] text-slate-500 font-medium shrink-0">
              {isEn ? "OR WITH EMAIL & PASSWORD" : "أو عبر البريد الإلكتروني وكلمة المرور"}
            </span>
            <div className="w-full border-t border-slate-800" />
          </div>

          {/* Standard Email & Password Form */}
          <form onSubmit={submit} className="space-y-3.5">
            {mode === "register" && (
              <label className="block space-y-1 text-xs font-semibold text-slate-300">
                <span>{isEn ? "Full name" : "الاسم الكامل"}</span>
                <input
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-800 bg-[#060a13] px-3.5 py-2.5 text-sm font-normal text-white focus:border-[#00e5ff] focus:outline-none"
                  data-testid="input-account-name"
                  maxLength={100}
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </label>
            )}
            <label className="block space-y-1 text-xs font-semibold text-slate-300">
              <span>{isEn ? "Email" : "البريد الإلكتروني"}</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute end-3.5 top-3 size-4 text-slate-500" />
                <input
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-800 bg-[#060a13] px-3.5 py-2.5 text-sm font-normal text-white focus:border-[#00e5ff] focus:outline-none"
                  data-testid="input-account-email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </div>
            </label>
            <label className="block space-y-1 text-xs font-semibold text-slate-300">
              <span>{isEn ? "Password" : "كلمة المرور"}</span>
              <input
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="w-full rounded-xl border border-slate-800 bg-[#060a13] px-3.5 py-2.5 text-sm font-normal text-white focus:border-[#00e5ff] focus:outline-none"
                data-testid="input-account-password"
                minLength={mode === "register" ? 12 : 1}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              {mode === "register" && (
                <span className="block text-[11px] font-normal text-slate-400">
                  {isEn ? "Use at least 12 characters." : "استخدم 12 حرفاً على الأقل."}
                </span>
              )}
            </label>
            <button
              className="w-full rounded-full bg-[#00e5ff] px-5 py-3 text-sm font-bold text-[#041017] shadow-[0_10px_28px_-10px_rgba(0,229,255,0.65)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              data-testid="button-submit-auth"
              disabled={busy}
              type="submit"
            >
              {busy
                ? isEn
                  ? "Please wait…"
                  : "يرجى الانتظار…"
                : mode === "register"
                  ? isEn
                    ? "Create student account"
                    : "إنشاء حساب طالب"
                  : isEn
                    ? "Sign in"
                    : "تسجيل الدخول"}
            </button>
            <p className="text-center text-xs text-slate-400 pt-1">
              {mode === "register"
                ? isEn
                  ? "Already have an account?"
                  : "لديك حساب بالفعل؟"
                : isEn
                  ? "New to the platform?"
                  : "جديد في المنصة؟"}{" "}
              <button
                className="font-bold text-[#00e5ff] underline-offset-4 hover:underline cursor-pointer"
                data-testid="button-switch-auth-mode"
                onClick={() => {
                  setMode(mode === "register" ? "login" : "register");
                  setError("");
                }}
                type="button"
              >
                {mode === "register"
                  ? isEn
                    ? "Sign in"
                    : "تسجيل الدخول"
                  : isEn
                    ? "Create an account"
                    : "إنشاء حساب"}
              </button>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
