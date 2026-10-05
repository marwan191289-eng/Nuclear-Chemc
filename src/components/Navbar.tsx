import React, { useEffect, useState } from "react";
import { UserProfile } from "../types";
import {
  Bell,
  Sparkles,
  Menu,
  X,
  Lock,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  language: "ar" | "en";
  onLanguageToggle: () => void;
  isOnline: boolean;
  onOpenStudyPlan: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
}

export function Navbar({
  currentTab,
  onTabChange,
  currentUser,
  isAuthenticated,
  onOpenAuth,
  onSignOut,
  language,
  onLanguageToggle,
  onOpenStudyPlan,
  unreadNotificationsCount,
  onOpenNotifications,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const isEn = language === "en";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("nuclear_hub_theme", theme);
    } catch {
      // Theme remains active for current session
    }
  }, [theme]);

  const scrollToOrNavigate = (tab: string, anchorId?: string) => {
    if (anchorId && currentTab === "home") {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    onTabChange(tab);
    if (anchorId) {
      window.setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" });
      }, 180);
    }
  };

  const userInitial =
    currentUser.email?.trim()?.[0]?.toLowerCase() ||
    currentUser.name?.trim()?.[0]?.toLowerCase() ||
    "m";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#060911]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between gap-4 px-5 lg:px-10">
        {/* Brand & Logo matching Screenshot 1 */}
        <button
          type="button"
          aria-label={isEn ? "Go to home" : "الانتقال إلى الرئيسية"}
          className="flex items-center gap-3 text-start group cursor-pointer shrink-0"
          onClick={() => onTabChange("home")}
        >
          <div className="relative flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-[#0b111d] shadow-[0_0_20px_rgba(0,229,255,0.18)] group-hover:border-[#00e5ff]/60 transition">
            <svg viewBox="0 0 36 36" className="size-6" aria-hidden="true">
              <ellipse
                cx="18"
                cy="18"
                rx="14"
                ry="6"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1.6"
                transform="rotate(-28 18 18)"
              />
              <ellipse
                cx="18"
                cy="18"
                rx="14"
                ry="6"
                fill="none"
                stroke="#f02a98"
                strokeWidth="1.6"
                transform="rotate(28 18 18)"
              />
              <circle cx="18" cy="18" r="2.8" fill="#00e5ff" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold text-white group-hover:text-[#00e5ff] transition">
              {isEn ? "Mahmoud Ismail Shaltoot" : "محمود إسماعيل شلتوت"}
            </div>
            <div
              className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00e5ff]"
              dir="ltr"
            >
              NUCLEAR CHEMISTRY
            </div>
          </div>
        </button>

        {/* Center Navigation Links matching Screenshot 1 + all platform tabs */}
        <nav className="hidden xl:flex items-center gap-6 text-[13.5px] font-medium text-slate-300">
          <button
            type="button"
            onClick={() => onTabChange("home")}
            className={`transition cursor-pointer ${
              currentTab === "home" ? "text-[#00e5ff] font-semibold" : "hover:text-[#00e5ff]"
            }`}
          >
            {isEn ? "Home" : "الرئيسية"}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("courses")}
            className={`transition cursor-pointer ${
              currentTab === "courses" ? "text-[#00e5ff] font-semibold" : "hover:text-[#00e5ff]"
            }`}
          >
            {isEn ? "Courses" : "الدورات"}
          </button>
          <button
            type="button"
            onClick={() => scrollToOrNavigate("home", "placement-quiz")}
            className="transition hover:text-[#00e5ff] cursor-pointer"
          >
            {isEn ? "Placement test" : "اختبار المستوى"}
          </button>
          <button
            type="button"
            onClick={() => scrollToOrNavigate("home", "articles")}
            className="transition hover:text-[#00e5ff] cursor-pointer"
          >
            {isEn ? "Articles" : "المقالات"}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("instructor")}
            className={`transition cursor-pointer ${
              currentTab === "instructor" ? "text-[#00e5ff] font-semibold" : "hover:text-[#00e5ff]"
            }`}
          >
            {isEn ? "About" : "من أنا"}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("booking")}
            className={`transition cursor-pointer ${
              currentTab === "booking" ? "text-[#00e5ff] font-semibold" : "hover:text-[#00e5ff]"
            }`}
          >
            {isEn ? "Booking" : "الحجز"}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("simulator")}
            className={`transition cursor-pointer ${
              currentTab === "simulator" ? "text-[#00e5ff] font-semibold" : "hover:text-[#00e5ff]"
            }`}
          >
            {isEn ? "Simulator" : "المحاكي"}
          </button>
          <button
            type="button"
            onClick={onOpenStudyPlan}
            className="inline-flex items-center gap-1 text-[#00e5ff] hover:brightness-110 transition cursor-pointer font-semibold"
          >
            <Sparkles className="size-3.5" />
            <span>{isEn ? "AI Plan" : "خطة ذكية"}</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("admin")}
            className={`inline-flex items-center gap-1 transition cursor-pointer ${
              currentTab === "admin" ? "text-[#f02a98] font-semibold" : "text-slate-400 hover:text-[#f02a98]"
            }`}
          >
            <Lock className="size-3" />
            <span>{isEn ? "Admin" : "الإدارة"}</span>
          </button>
        </nav>

        {/* Left Action Pills matching Screenshot 1 */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={onLanguageToggle}
            className="rounded-full border border-slate-800 bg-[#0b111d]/80 px-3.5 py-2 font-display text-[12px] font-medium text-slate-300 transition hover:border-[#00e5ff]/50 hover:text-[#00e5ff] cursor-pointer"
            title="تبديل اللغة / Toggle Language"
          >
            {isEn ? "العربية" : "EN"}
          </button>

          {/* Book a Session Outlined Cyan Pill matching Screenshot 1 */}
          <button
            type="button"
            onClick={() => onTabChange("booking")}
            className="hidden sm:inline-flex items-center rounded-full border border-[#00e5ff]/45 bg-[#00e5ff]/8 px-5 py-2 text-[13px] font-semibold text-[#00e5ff] transition hover:bg-[#00e5ff]/15 hover:shadow-[0_0_20px_rgba(0,229,255,0.25)] cursor-pointer"
          >
            {isEn ? "Book a session" : "احجز جلسة"}
          </button>

          {/* Account / Auth Buttons matching Screenshot 1 ("حسابي" + "m" circle + "خروج") */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTabChange(currentUser.role === "admin" ? "admin" : "portal")}
                className="hidden md:inline-flex items-center rounded-full border border-slate-800 bg-[#0b111d] px-4 py-2 text-[13px] font-medium text-white transition hover:border-[#00e5ff]/60 hover:text-[#00e5ff] cursor-pointer"
                aria-label={isEn ? `Open ${currentUser.name}'s account` : `فتح حساب ${currentUser.name}`}
              >
                {isEn ? "My account" : "حسابي"}
              </button>
              <button
                type="button"
                onClick={() => onTabChange(currentUser.role === "admin" ? "admin" : "portal")}
                title={currentUser.name}
                className="grid size-9 place-items-center rounded-full border border-[#00e5ff]/50 bg-[#00e5ff]/12 font-display text-sm font-bold text-[#00e5ff] cursor-pointer"
              >
                {userInitial}
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-full border border-slate-800 bg-[#0b111d] px-3.5 py-2 text-[12px] text-slate-300 transition hover:border-[#f02a98]/50 hover:text-[#f02a98] cursor-pointer"
                aria-label={isEn ? "Sign out" : "تسجيل الخروج"}
              >
                {isEn ? "Sign out" : "خروج"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#00e5ff] px-4 py-2 text-xs font-bold text-[#041017] shadow-[0_0_20px_rgba(0,229,255,0.35)] transition hover:brightness-110 cursor-pointer"
              data-testid="button-open-auth"
            >
              <span>{isEn ? "Sign in / Join" : "دخول / إنشاء حساب"}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            aria-label={
              theme === "light"
                ? isEn
                  ? "Switch to dark theme"
                  : "التبديل إلى المظهر الداكن"
                : isEn
                  ? "Switch to light theme"
                  : "التبديل إلى المظهر الفاتح"
            }
            aria-pressed={theme === "dark"}
            className="rounded-full border border-slate-800 bg-[#0b111d] p-2 text-slate-300 transition hover:border-[#00e5ff]/50 hover:text-[#00e5ff] cursor-pointer"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative rounded-full border border-slate-800 bg-[#0b111d] p-2 text-slate-300 hover:text-[#00e5ff] hover:border-[#00e5ff]/50 transition cursor-pointer"
            title={isEn ? "Smart Notifications" : "التنبيهات الذكية"}
          >
            <Bell className="size-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -start-1 flex size-4 items-center justify-center rounded-full bg-[#f02a98] text-[9px] font-bold text-white shadow-[0_0_10px_#f02a98]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              mobileMenuOpen
                ? isEn
                  ? "Close navigation"
                  : "إغلاق قائمة التنقل"
                : isEn
                  ? "Open navigation"
                  : "فتح قائمة التنقل"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="xl:hidden rounded-full border border-slate-800 bg-[#0b111d] p-2 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label={isEn ? "Mobile navigation" : "التنقل"}
          className="xl:hidden border-t border-slate-800 bg-[#060911]/95 px-5 py-4 space-y-2"
        >
          <button
            onClick={() => {
              onTabChange("home");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "Home" : "الرئيسية"}
          </button>
          <button
            onClick={() => {
              onTabChange("courses");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "Courses" : "الدورات المتاحة"}
          </button>
          <button
            onClick={() => {
              scrollToOrNavigate("home", "placement-quiz");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "Placement Test" : "اختبار تحديد المستوى"}
          </button>
          <button
            onClick={() => {
              scrollToOrNavigate("home", "articles");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "Articles & Summaries" : "المقالات والملخصات"}
          </button>
          <button
            onClick={() => {
              onOpenStudyPlan();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-[#00e5ff]"
          >
            {isEn ? "AI Study Plan" : "خطة المذاكرة الذكية بالذكاء الاصطناعي"}
          </button>
          <button
            onClick={() => {
              onTabChange("simulator");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "Reactor Simulator" : "محاكي المفاعل"}
          </button>
          <button
            onClick={() => {
              onTabChange("instructor");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "About Eng. Mahmoud" : "من أنا — المهندس محمود"}
          </button>
          <button
            onClick={() => {
              if (isAuthenticated) onTabChange("portal");
              else onOpenAuth();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn
              ? isAuthenticated
                ? "Student Portal & Lessons"
                : "Sign in or create an account"
              : isAuthenticated
                ? "بوابة الطالب والدروس"
                : "تسجيل الدخول أو إنشاء حساب"}
          </button>
          <button
            onClick={() => {
              onTabChange("booking");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-slate-200 hover:text-[#00e5ff]"
          >
            {isEn ? "Booking & 1-on-1 Sessions" : "الحجز والجلسات الخاصة"}
          </button>
          <button
            onClick={() => {
              onTabChange("admin");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 text-sm font-medium text-[#f02a98]"
          >
            {isEn ? "Admin (Protected)" : "لوحة الإدارة (محمية)"}
          </button>
        </nav>
      )}
    </header>
  );
}
