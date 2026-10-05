import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ClickGlowLayer } from "./components/ClickGlowLayer";
import { NuclearBackgroundCanvas } from "./components/NuclearBackgroundCanvas";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { SupportWidget } from "./components/SupportWidget";
import { Footer } from "./components/Footer";
import mahmoudLabCoatImg from "./assets/mahmoud-lab-coat.png";

const CoursesSection = lazy(() =>
  import("./components/CoursesSection").then((module) => ({ default: module.CoursesSection })),
);
const ReactorSimulator = lazy(() =>
  import("./components/ReactorSimulator").then((module) => ({ default: module.ReactorSimulator })),
);
const InstructorPage = lazy(() =>
  import("./components/InstructorPage").then((module) => ({ default: module.InstructorPage })),
);
const StudentPortal = lazy(() =>
  import("./components/StudentPortal").then((module) => ({ default: module.StudentPortal })),
);
const BookingAndMeetingRoom = lazy(() =>
  import("./components/BookingAndMeetingRoom").then((module) => ({ default: module.BookingAndMeetingRoom })),
);
const AdminPanel = lazy(() =>
  import("./components/AdminPanel").then((module) => ({ default: module.AdminPanel })),
);
const AuthModal = lazy(() =>
  import("./components/AuthModal").then((module) => ({ default: module.AuthModal })),
);
const GamificationSection = lazy(() =>
  import("./components/GamificationSection").then((module) => ({ default: module.GamificationSection })),
);
const PlacementQuizSection = lazy(() =>
  import("./components/PlacementQuizSection").then((module) => ({ default: module.PlacementQuizSection })),
);
const ChatAndResources = lazy(() =>
  import("./components/ChatAndResources").then((module) => ({ default: module.ChatAndResources })),
);
const ArticlesSection = lazy(() =>
  import("./components/ArticlesSection").then((module) => ({ default: module.ArticlesSection })),
);
const AIStudyPlanModal = lazy(() =>
  import("./components/AIStudyPlanModal").then((module) => ({ default: module.AIStudyPlanModal })),
);
const SpacedRepetitionModal = lazy(() =>
  import("./components/SpacedRepetitionModal").then((module) => ({ default: module.SpacedRepetitionModal })),
);
const PaymentModal = lazy(() =>
  import("./components/PaymentModal").then((module) => ({ default: module.PaymentModal })),
);
const NotificationsModal = lazy(() =>
  import("./components/NotificationsModal").then((module) => ({ default: module.NotificationsModal })),
);

import { INITIAL_COURSES } from "./data/coursesData";
import { Course, Role, StudyPlan, UserProfile } from "./types";
import { apiFetch, appPath, setStoredSessionToken } from "./lib/app-path";
import {
  AppNotificationItem,
  buildEmailDispatchUrl,
  buildWhatsAppDispatchUrl,
  emitAppNotification,
} from "./lib/notifications";
import { Bell, Mail, MessageSquare, X } from "lucide-react";

const TAB_ROUTES: Record<string, string> = {
  home: "",
  courses: "courses",
  simulator: "simulator",
  instructor: "instructor",
  portal: "student-portal",
  booking: "booking",
  admin: "admin",
};

const TAB_SEO: Record<string, { ar: string; en: string; descriptionAr: string; descriptionEn: string }> = {
  home: {
    ar: "الكيمياء النووية وهندسة المفاعلات | مركز المعرفة",
    en: "Nuclear Chemistry & Reactor Engineering | Knowledge Hub",
    descriptionAr: "تعلم الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية مع المهندس محمود شلتوت عبر مقررات ودروس عربية وإنجليزية.",
    descriptionEn: "Learn nuclear chemistry, reactor engineering, and radiation safety with Eng. Mahmoud Shaltoot through bilingual courses and lessons.",
  },
  courses: {
    ar: "دورات الكيمياء النووية وهندسة المفاعلات",
    en: "Nuclear Chemistry & Reactor Engineering Courses",
    descriptionAr: "استكشف دورات الكيمياء النووية والمفاعلات والسلامة الإشعاعية لطلاب الجامعات في السعودية والخليج.",
    descriptionEn: "Explore nuclear chemistry, reactor engineering, and radiation safety courses for university learners across Saudi Arabia and the Gulf.",
  },
  simulator: {
    ar: "محاكاة المفاعل النووي التعليمية",
    en: "Interactive Nuclear Reactor Simulator",
    descriptionAr: "جرّب محاكاة تعليمية مبسطة للمفاعل النووي وعوامل التحكم والتفاعلات المتسلسلة.",
    descriptionEn: "Explore an educational reactor simulation covering control systems and nuclear chain reactions.",
  },
  instructor: {
    ar: "المهندس محمود شلتوت | مدرب الكيمياء النووية",
    en: "Eng. Mahmoud Shaltoot | Nuclear Chemistry Instructor",
    descriptionAr: "تعرّف على خبرة المهندس محمود شلتوت ومجالات تدريسه في الكيمياء النووية والمفاعلات والسلامة الإشعاعية.",
    descriptionEn: "Meet Eng. Mahmoud Shaltoot and learn about his teaching in nuclear chemistry, reactor engineering, and radiation safety.",
  },
  portal: {
    ar: "بوابة الطالب والدروس النووية",
    en: "Student Portal & Nuclear Science Lessons",
    descriptionAr: "تابع الدروس والمقررات والتقدم الدراسي في بوابة مركز المعرفة النووية.",
    descriptionEn: "Continue lessons, courses, and study progress in the Nuclear Knowledge Hub student portal.",
  },
  booking: {
    ar: "حجز جلسة تعليمية في الكيمياء النووية",
    en: "Book a Nuclear Chemistry Learning Session",
    descriptionAr: "احجز جلسة تعليمية فردية في الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية.",
    descriptionEn: "Book an individual learning session in nuclear chemistry, reactor engineering, and radiation safety.",
  },
  admin: {
    ar: "دخول الإدارة | مركز المعرفة النووية",
    en: "Administration Sign In | Nuclear Knowledge Hub",
    descriptionAr: "دخول آمن لإدارة مركز المعرفة النووية.",
    descriptionEn: "Secure sign in for Nuclear Knowledge Hub administrators.",
  },
};

function getInitialTab(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathname = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length)
    : window.location.pathname;
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return Object.entries(TAB_ROUTES).find(([, route]) => route === slug)?.[0] ?? "home";
}

function SectionPlaceholder({ minHeight }: { minHeight: number }) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-[1240px] px-6 py-10 lg:px-10"
      style={{ minHeight }}
    >
      <div
        className="animate-pulse rounded-2xl bg-[#0b111d]/70 border border-slate-800/60"
        style={{ height: Math.min(minHeight, 220) }}
      />
    </div>
  );
}

function DeferredSection({
  children,
  minHeight = 280,
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight }}>
      {shouldLoad ? (
        <Suspense fallback={<SectionPlaceholder minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        <SectionPlaceholder minHeight={minHeight} />
      )}
    </div>
  );
}

function PageLoading({ language }: { language: "ar" | "en" }) {
  return (
    <div
      className="mx-auto flex min-h-[48vh] max-w-[1240px] items-center justify-center gap-3 px-6 text-sm text-[#60736a]"
      role="status"
      aria-live="polite"
    >
      <span className="size-7 animate-pulse rounded-full bg-[#dbe5dc]" />
      <span>{language === "ar" ? "جارٍ تجهيز الصفحة…" : "Loading this page…"}</span>
    </div>
  );
}

function ModalLoading({ language }: { language: "ar" | "en" }) {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#1b302b]/20 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <span className="rounded-xl bg-[#fffefa] px-5 py-3 text-sm font-medium text-[#304c43] shadow-xl">
        {language === "ar" ? "جارٍ فتح النافذة…" : "Opening…"}
      </span>
    </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navigateTab = (tab: string) => {
    const route = TAB_ROUTES[tab] ?? "";
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const nextPath = `${base}${route}`;
    setCurrentTab(tab);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "anonymous",
    name: "طالب",
    email: "",
    role: "student",
    xp: 0,
    level: "المستوى التمهيدي",
    badges: [],
    enrolledCourseIds: [],
    attendanceRate: 0,
    avgQuizScore: 0,
  });

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressOwnerId, setProgressOwnerId] = useState<string | null>(null);

  // Modal open states
  const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false);
  const [isSpacedRepetitionOpen, setIsSpacedRepetitionOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPaymentCourse, setSelectedPaymentCourse] = useState<Course | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [liveToast, setLiveToast] = useState<AppNotificationItem | null>(null);
  const [isAuthStateLoading, setIsAuthStateLoading] = useState(true);

  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const custom = event as CustomEvent<AppNotificationItem>;
      if (custom.detail) {
        setUnreadNotificationsCount((prev) => prev + 1);
        setLiveToast(custom.detail);
      }
    };
    window.addEventListener("nkh:notification", handleNewNotification);
    return () => window.removeEventListener("nkh:notification", handleNewNotification);
  }, []);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync RTL / LTR based on language
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const handlePopState = () => setCurrentTab(getInitialTab());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const content = TAB_SEO[currentTab] ?? TAB_SEO.home;
    const title = language === "en" ? content.en : content.ar;
    const description = language === "en" ? content.descriptionEn : content.descriptionAr;
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        const [key, val] = selector.match(/\[(name|property)="([^"]+)"\]/)?.slice(1) ?? [];
        if (key && val) element.setAttribute(key, val);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="keywords"]', "content", language === "ar"
      ? "الكيمياء النووية، هندسة المفاعلات، السلامة الإشعاعية، دورات نووية، تعليم جامعي، السعودية، الخليج"
      : "nuclear chemistry, reactor engineering, radiation safety, nuclear courses, university learning, Saudi Arabia, Gulf");
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('meta[property="og:image"]', "content", new URL(appPath("/og-image.png"), window.location.origin).href);
    setMeta('meta[name="twitter:image"]', "content", new URL(appPath("/og-image.png"), window.location.origin).href);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="robots"]', "content", currentTab === "admin" || currentTab === "portal" ? "noindex, nofollow" : "index, follow");
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const route = TAB_ROUTES[currentTab] ?? "";
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${base}${route}`;
  }, [currentTab, language]);

  // The signed server session is the only source of account identity and role.
  useEffect(() => {
    const controller = new AbortController();
    apiFetch(appPath("/api/courses"), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as {
          courses?: Array<{
            id: string;
            title: string;
            titleEn: string;
            category: string;
            level: string;
            price: number;
            duration: string;
            lessonsCount: number;
            studentsCount: number;
            rating: number;
            description: string;
          }>;
        };
        if (!data.courses || controller.signal.aborted) return;
        setCourses((prev) => {
          const byId = new Map(prev.map((c) => [c.id, c]));
          return data.courses!.map((sc): Course => {
            const existing = byId.get(sc.id);
            if (existing) {
              return {
                ...existing,
                title: sc.title,
                titleEn: sc.titleEn,
                tag: sc.category || existing.tag,
                level: sc.level,
                price: sc.price,
                duration: sc.duration,
                desc: sc.description || existing.desc,
                descEn: sc.description || existing.descEn,
                lessonsCount: sc.lessonsCount || existing.lessonsCount,
              };
            }
            return {
              id: sc.id,
              title: sc.title,
              titleEn: sc.titleEn,
              tag: sc.category || "الكيمياء النووية",
              tagTone: "primary",
              desc: sc.description,
              descEn: sc.description,
              duration: sc.duration,
              durationEn: sc.duration,
              mode: "مسجل + مباشر",
              modeEn: "Recorded + Live",
              level: sc.level || "متوسط",
              price: sc.price,
              lessonsCount: sc.lessonsCount || 8,
              image: INITIAL_COURSES[0]?.image ?? "",
              topics: ["الكيمياء النووية", "المفاعلات النووية", "السلامة الإشعاعية"],
              topicsEn: ["Nuclear Chemistry", "Nuclear Reactors", "Radiation Safety"],
              lessons: INITIAL_COURSES[0]?.lessons ?? [],
            };
          });
        });
      })
      .catch(() => {
        // Fallback to static courses if offline
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(appPath("/api/auth/me"), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as {
          user?: { id: string; name: string; email: string; role: Role } | null;
        };
        const user = data.user;
        if (!user || controller.signal.aborted) {
          if (!controller.signal.aborted) setIsAuthStateLoading(false);
          return;
        }
        setCurrentUser((previous) => ({
          ...previous,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }));
        setIsAuthenticated(true);
        setIsAuthStateLoading(false);
      })
      .catch(() => {
        // A missing account session is the normal signed-out state.
        if (!controller.signal.aborted) setIsAuthStateLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedLessonIds([]);
      setProgressOwnerId(null);
      return;
    }
    const key = `nuclear_hub_completed_lessons:${currentUser.id}`;
    let completed: string[] = [];
    try {
      const saved = localStorage.getItem(key);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        completed = parsed.filter((lessonId): lessonId is string => typeof lessonId === "string");
      }
    } catch {
      // A malformed progress record is ignored without affecting the account session.
    }
    setCompletedLessonIds(completed);
    setProgressOwnerId(currentUser.id);
  }, [currentUser.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || progressOwnerId !== currentUser.id) return;
    try {
      localStorage.setItem(
        `nuclear_hub_completed_lessons:${currentUser.id}`,
        JSON.stringify(completedLessonIds),
      );
    } catch {
      // Progress remains available in memory for this session if storage is unavailable.
    }
  }, [completedLessonIds, currentUser.id, isAuthenticated, progressOwnerId]);

  const handleRoleChange = (
    newRole: Role,
    identity?: Partial<Pick<UserProfile, "id" | "name" | "email">>,
  ) => {
    setCurrentUser((prev) => {
      let name = identity?.name ?? prev.name;
      if (!identity?.name && newRole === "admin") name = language === "en" ? "Administrator" : "مشرف";
      else if (!identity?.name && newRole === "instructor") name = language === "en" ? "Instructor" : "مدرّب";
      else if (!identity?.name && newRole === "parent") name = language === "en" ? "Parent" : "ولي أمر";
      else if (!identity?.name && newRole === "student") name = language === "en" ? "Student" : "طالب";
      return {
        ...prev,
        id: identity?.id ?? prev.id,
        email: identity?.email ?? prev.email,
        role: newRole,
        name,
      };
    });
    setIsAuthenticated(newRole === "admin");
  };

  const handleAccountAuthenticated = (user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  }) => {
    setCurrentUser((previous) => ({
      ...previous,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    void emitAppNotification({
      category: "system",
      titleAr: `تسجيل دخول ناجح: ${user.name}`,
      titleEn: `Signed In Successfully: ${user.name}`,
      bodyAr: `تم تفعيل الجلسة وإرسال تنبيه الأمان إلى التطبيق والواتساب والبريد المسجل (${user.email}).`,
      bodyEn: `Session active. Security notice dispatched to In-App, WhatsApp, and registered email (${user.email}).`,
      recipientEmail: user.email,
    });
    navigateTab(user.role === "admin" ? "admin" : "portal");
  };

  const handleSignOut = async () => {
    try {
      await apiFetch(appPath("/api/auth/logout"), {
        method: "POST",
      });
    } finally {
      setStoredSessionToken(null);
      setIsAuthenticated(false);
      setIsAuthStateLoading(false);
      navigateTab("home");
      setCurrentUser({
        id: "anonymous",
        name: language === "en" ? "Student" : "طالب",
        email: "",
        role: "student",
        xp: 0,
        level: "المستوى التمهيدي",
        badges: [],
        enrolledCourseIds: [],
        attendanceRate: 0,
        avgQuizScore: 0,
      });
    }
  };

  const handleLessonCompleted = (lessonId: string, earnedXp: number) => {
    if (!completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds((prev) => [...prev, lessonId]);
      setCurrentUser((prev) => ({
        ...prev,
        xp: prev.xp + earnedXp,
      }));
      void emitAppNotification({
        category: "course",
        titleAr: `إنجاز درس جديد (+${earnedXp} XP)`,
        titleEn: `Lesson Completed (+${earnedXp} XP)`,
        bodyAr: `أتممت الدرس (${lessonId}) بنجاح وتم تحديث تقدمك الدراسي وإرسال إشعار للتطبيق والواتساب والبريد (${currentUser.email || "Mahmoudshaltoot.cemc@gmail.com"}).`,
        bodyEn: `Completed lesson (${lessonId}) and notified via In-App, WhatsApp, and Email (${currentUser.email || "Mahmoudshaltoot.cemc@gmail.com"}).`,
        recipientEmail: currentUser.email,
      });
    }
  };

  const handleCardReviewed = (earnedXp: number) => {
    setCurrentUser((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
    }));
    void emitAppNotification({
      category: "course",
      titleAr: `مراجعة بطاقة تكرار متباعد (+${earnedXp} XP)`,
      titleEn: `Spaced Repetition Card Reviewed (+${earnedXp} XP)`,
      bodyAr: `تم تسجيل مراجعة البطاقة وإرسال إشعار للتطبيق والواتساب والبريد المسجل.`,
      bodyEn: `Flashcard review logged and notified via In-App, WhatsApp, and Registered Email.`,
      recipientEmail: currentUser.email,
    });
  };

  const handleEnrollInitiated = (course: Course) => {
    setSelectedPaymentCourse(course);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (courseId: string) => {
    const enrolledCourse = courses.find((c) => c.id === courseId);
    setCurrentUser((prev) => ({
      ...prev,
      enrolledCourseIds: Array.from(new Set([...prev.enrolledCourseIds, courseId])),
      xp: prev.xp + 100, // enrollment bonus
    }));
    void emitAppNotification({
      category: "course",
      titleAr: `تفعيل اشتراك دورة: ${enrolledCourse?.title || courseId}`,
      titleEn: `Course Enrollment Activated: ${enrolledCourse?.titleEn || courseId}`,
      bodyAr: `تم تفعيل اشتراكك في (${enrolledCourse?.title || courseId}) وإرسال الإيصال والتفاصيل للتطبيق والواتساب والبريد الإلكتروني المسجل (${currentUser.email || "Mahmoudshaltoot.cemc@gmail.com"}).`,
      bodyEn: `Your enrollment in (${enrolledCourse?.titleEn || courseId}) is active. Receipt dispatched via In-App, WhatsApp, and Email (${currentUser.email || "Mahmoudshaltoot.cemc@gmail.com"}).`,
      recipientEmail: currentUser.email,
    });
    setTimeout(() => {
      setIsPaymentOpen(false);
      navigateTab("portal");
    }, 1500);
  };

  const handleSaveStudyPlan = (plan: StudyPlan) => {
    localStorage.setItem(`nuclear_hub_active_plan:${currentUser.id}`, JSON.stringify(plan));
    setCurrentUser((prev) => ({
      ...prev,
      xp: prev.xp + 75,
    }));
    void emitAppNotification({
      category: "study_plan",
      titleAr: `حفظ خطة المذاكرة الذكية: ${plan.planTitle}`,
      titleEn: `Saved AI Study Plan: ${plan.planTitle}`,
      bodyAr: `تم حفظ خطة المذاكرة وإرسال نسخة للتطبيق والواتساب والبريد الإلكتروني المسجل.`,
      bodyEn: `Study plan saved and dispatched to In-App, WhatsApp, and Registered Email.`,
      recipientEmail: currentUser.email,
    });
  };

  return (
    <div className="relative min-h-[100dvh] bg-[var(--bg-main)] text-[var(--ink)] flex flex-col font-sans selection:bg-[#00e5ff]/30 selection:text-white">
      {/* Animated Nuclear Chemistry Background Layer */}
      <NuclearBackgroundCanvas />

      {/* Click & Touch Neon Glow Effect Layer */}
      <ClickGlowLayer />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={navigateTab}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => void handleSignOut()}
        language={language}
        onLanguageToggle={() => setLanguage(language === "ar" ? "en" : "ar")}
        isOnline={isOnline}
        onOpenStudyPlan={() => setIsStudyPlanOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setUnreadNotificationsCount(0);
        }}
      />

      {/* Main Pages Container */}
      <main className="relative z-10 flex-1">
        {currentTab === "home" && (
          <>
            {/* Hero + 4-Column Stats Strip (Screenshots 1 & 2) */}
            <HeroSection
              onStartJourney={() => {
                if (!isAuthenticated) setIsAuthModalOpen(true);
                else setIsStudyPlanOpen(true);
              }}
              onBrowseCourses={() => {
                const el = document.getElementById("courses-anchor");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else navigateTab("courses");
              }}
              onOpenSimulator={() => navigateTab("simulator")}
              language={language}
            />

            {/* Courses Catalogue (Screenshot 2) */}
            <div id="courses-anchor" className="scroll-mt-24">
              <DeferredSection minHeight={560}>
                <CoursesSection
                  courses={courses}
                  onEnroll={handleEnrollInitiated}
                  language={language}
                />
              </DeferredSection>
            </div>

            {/* Private Lessons Section matching Screenshot 3 */}
            <section className="mx-auto max-w-[1240px] px-6 py-20 lg:px-10">
              <div className="grid items-center gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <div className="glow-accent overflow-hidden rounded-2xl border border-slate-800 bg-[#0b111d]">
                    <img
                      src={mahmoudLabCoatImg}
                      alt={
                        language === "en"
                          ? "Eng. Mahmoud Ismail Shaltoot"
                          : "المهندس محمود إسماعيل شلتوت"
                      }
                      width={912}
                      height={1104}
                      loading="lazy"
                      className="aspect-[3/3.65] w-full object-cover"
                    />
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="eyebrow mb-3" dir="ltr">
                    PRIVATE LESSONS
                  </div>
                  <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
                    {language === "en" ? (
                      <>
                        One-to-one lessons,{" "}
                        <span className="text-[#f02a98]">built for you</span>
                      </>
                    ) : (
                      <>
                        دروس خاصة <span className="text-[#f02a98]">فردية</span>،
                        مصمّمة لك
                      </>
                    )}
                  </h2>
                  <p className="mb-8 text-[16px] leading-relaxed text-slate-400">
                    {language === "en"
                      ? "Live online sessions shaped around your level and goals — exam revision, a graduation project, or preparing for a career in the nuclear sector."
                      : "جلسات أونلاين وجهاً لوجه، تُبنى حول مستواك وأهدافك الدراسية. تختار أنت المحور — مراجعة للاختبارات، بحث تخرّج، أو إعداد لوظيفة في المجال النووي."}
                  </p>
                  <div className="mb-9 space-y-4">
                    {(language === "en"
                      ? [
                          "A free assessment session to map your level and goals",
                          "A flexible weekly plan that fits your schedule",
                          "Summaries, exercises and homework between sessions",
                        ]
                      : [
                          "جلسة تقييم مجانية لتحديد مستواك وأهدافك",
                          "خطة أسبوعية مرنة بجدول يناسب وقتك",
                          "ملخصات وتمارين وواجبات بين الجلسات",
                        ]
                    ).map((step, i) => (
                      <div
                        key={step}
                        className="neon-card nuclear-glow flex items-center gap-4 rounded-xl border border-[#162334] bg-[#090e18]/80 p-4"
                      >
                        <span
                          className="font-display text-lg font-bold text-[#00e8f5]"
                          dir="ltr"
                        >
                          0{i + 1}
                        </span>
                        <span className="text-[15px] text-white">{step}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTab("booking")}
                    className="btn-accent nuclear-glow cursor-pointer"
                  >
                    {language === "en"
                      ? "Book your first session"
                      : "احجز جلستك الأولى"}
                  </button>
                </div>
              </div>
            </section>

            {/* Free Placement Test Section */}
            <DeferredSection minHeight={340}>
              <PlacementQuizSection
                onOpenStudyPlan={() => setIsStudyPlanOpen(true)}
                onSelectCourse={(courseId) => {
                  const found = courses.find((c) => c.id === courseId);
                  if (found) handleEnrollInitiated(found);
                  else navigateTab("courses");
                }}
                onBookPrivate={() => navigateTab("booking")}
                language={language}
              />
            </DeferredSection>

            {/* Virtual Reactor Simulator */}
            <div className="py-8 px-6 lg:px-10 max-w-[1240px] mx-auto">
              <DeferredSection minHeight={520}>
                <ReactorSimulator language={language} />
              </DeferredSection>
            </div>

            {/* Gamification & Leaderboard */}
            <DeferredSection minHeight={360}>
              <GamificationSection
                currentUser={currentUser}
                language={language}
              />
            </DeferredSection>

            {/* Q&A Chat & File Sharing */}
            <DeferredSection minHeight={360}>
              <ChatAndResources
                language={language}
                userEmail={currentUser.email}
                userName={currentUser.name}
              />
            </DeferredSection>

            {/* Educational Articles & Solved Problems */}
            <DeferredSection minHeight={420}>
              <ArticlesSection
                language={language}
                onSelectCourse={(courseId) => {
                  const found = courses.find((c) => c.id === courseId);
                  if (found) handleEnrollInitiated(found);
                  else navigateTab("courses");
                }}
                onOpenPlacement={() => {
                  const el = document.getElementById("placement-quiz");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </DeferredSection>

            {/* Get Started CTA Banner matching Screenshot 4 */}
            <section className="mx-auto max-w-[1240px] px-6 py-20 lg:px-10">
              <div className="glow-primary rounded-3xl border border-slate-800/90 bg-[#0b111d]/85 p-10 text-center lg:p-16">
                <div className="eyebrow mb-4" dir="ltr">
                  GET STARTED
                </div>
                <h2 className="mb-4 text-3xl font-bold leading-tight text-white lg:text-5xl">
                  {language === "en" ? (
                    <>
                      Ready to build understanding{" "}
                      <span className="text-[#00e5ff]">from the roots</span>?
                    </>
                  ) : (
                    <>
                      جاهز تبني فهمك{" "}
                      <span className="text-[#00e5ff]">من الجذر</span>؟
                    </>
                  )}
                </h2>
                <p className="mx-auto max-w-xl text-[15px] text-slate-400">
                  {language === "en"
                    ? "Join the new cohort or book a free assessment session. We start from where you are."
                    : "انضم إلى الدفعة الجديدة أو احجز جلسة تقييم مجانية. نبدأ من حيث أنت."}
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigateTab("booking")}
                    className="btn-primary cursor-pointer"
                  >
                    {language === "en" ? "Start now" : "ابدأ الآن"}
                  </button>
                  <a
                    href={`https://wa.me/966594756878?text=${encodeURIComponent(
                      language === "en"
                        ? "Hello Eng. Mahmoud, I have a question about your nuclear chemistry courses"
                        : "مرحباً بشمهندس محمود، لدي استفسار بخصوص دورات الكيمياء النووية",
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                  >
                    {language === "en" ? "Talk to the instructor" : "تحدّث مع المدرّب"}
                  </a>
                </div>
              </div>
            </section>
          </>
        )}

        {currentTab === "courses" && (
          <Suspense fallback={<PageLoading language={language} />}>
            <div className="py-6">
              <h1 className="sr-only">{language === "en" ? "Nuclear chemistry and reactor engineering courses" : "دورات الكيمياء النووية وهندسة المفاعلات"}</h1>
              <CoursesSection
                courses={courses}
                onEnroll={handleEnrollInitiated}
                language={language}
              />
            </div>
          </Suspense>
        )}

        {currentTab === "simulator" && (
          <Suspense fallback={<PageLoading language={language} />}>
            <div className="py-12 px-6 lg:px-10 max-w-[1240px] mx-auto">
              <h1 className="sr-only">{language === "en" ? "Interactive nuclear reactor simulator" : "محاكاة المفاعل النووي التعليمية"}</h1>
              <ReactorSimulator language={language} />
            </div>
          </Suspense>
        )}

        {currentTab === "instructor" && (
          <Suspense fallback={<PageLoading language={language} />}>
            <InstructorPage
              onBookSession={() => navigateTab("booking")}
              language={language}
            />
          </Suspense>
        )}

        {currentTab === "portal" && !isAuthenticated && (
          <section className="mx-auto flex min-h-[52vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
            <h1 className="text-3xl font-bold">
              {language === "en" ? "Sign in to open your student portal" : "سجّل الدخول لفتح بوابة الطالب"}
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
              {language === "en" ? "Your courses and learning progress are available after you sign in." : "تظهر مقرراتك وتقدمك الدراسي بعد تسجيل الدخول."}
            </p>
            {isAuthStateLoading ? (
              <p role="status" className="mt-6 text-sm text-[var(--muted)]">{language === "en" ? "Checking your session…" : "جارٍ التحقق من جلستك…"}</p>
            ) : (
              <button
                className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-[var(--button-ink)]"
                onClick={() => setIsAuthModalOpen(true)}
                type="button"
              >
                {language === "en" ? "Sign in or create an account" : "تسجيل الدخول أو إنشاء حساب"}
              </button>
            )}
          </section>
        )}
        {currentTab === "portal" && isAuthenticated && (
          <Suspense fallback={<PageLoading language={language} />}>
            <StudentPortal
              currentUser={currentUser}
              courses={courses}
              completedLessonIds={completedLessonIds}
              onCompleteLesson={handleLessonCompleted}
              onOpenSpacedRepetition={() => setIsSpacedRepetitionOpen(true)}
              language={language}
            />
          </Suspense>
        )}

        {currentTab === "booking" && (
          <Suspense fallback={<PageLoading language={language} />}>
            <h1 className="sr-only">{language === "en" ? "Book a nuclear chemistry learning session" : "حجز جلسة تعليمية في الكيمياء النووية"}</h1>
            <BookingAndMeetingRoom
              language={language}
              userEmail={currentUser.email}
              userName={currentUser.name}
            />
          </Suspense>
        )}

        {currentTab === "admin" && (
          <Suspense fallback={<PageLoading language={language} />}>
            <AdminPanel
              currentUser={currentUser}
              onRoleSwitch={handleRoleChange}
              language={language}
            />
          </Suspense>
        )}
      </main>

      {/* Floating Support & Cloud Sync Widget */}
      <SupportWidget language={language} />

      {/* Live Multi-Channel Notification Toast (In-App + WhatsApp + Email) */}
      {liveToast && (
        <div
          role="status"
          aria-live="polite"
          className="nuclear-glow fixed bottom-20 right-6 z-50 w-[340px] sm:w-[390px] rounded-2xl border border-[#00e8f5]/50 bg-[#070e1c]/95 p-4 shadow-[0_16px_50px_rgba(0,232,245,0.28)] backdrop-blur-md space-y-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00e8f5]">
              <Bell className="size-4 shrink-0 text-[#ef2b88]" />
              <span>{language === "en" ? liveToast.titleEn : liveToast.titleAr}</span>
            </div>
            <button
              type="button"
              onClick={() => setLiveToast(null)}
              aria-label="Close notification toast"
              className="rounded p-0.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
            {language === "en" ? liveToast.bodyEn : liveToast.bodyAr}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setLiveToast(null);
                setIsNotificationsOpen(true);
                setUnreadNotificationsCount(0);
              }}
              className="font-bold text-[#00e8f5] hover:underline cursor-pointer"
            >
              {language === "en" ? "Open Notifications →" : "عرض في الإشعارات ←"}
            </button>
            <div className="flex items-center gap-1.5">
              <a
                href={buildWhatsAppDispatchUrl(liveToast, language === "en")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-2 py-1 font-bold text-emerald-300 hover:bg-emerald-900/60"
              >
                <MessageSquare className="size-3" />
                <span>{language === "en" ? "WhatsApp" : "واتساب"}</span>
              </a>
              <a
                href={buildEmailDispatchUrl(liveToast, language === "en")}
                className="inline-flex items-center gap-1 rounded-lg border border-[#00e8f5]/40 bg-cyan-950/50 px-2 py-1 font-bold text-[#00e8f5] hover:bg-cyan-900/60"
              >
                <Mail className="size-3" />
                <span>{language === "en" ? "Email" : "البريد"}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer onTabChange={navigateTab} language={language} />

      {/* Modals */}
      {isStudyPlanOpen && (
        <Suspense fallback={<ModalLoading language={language} />}>
          <AIStudyPlanModal
            isOpen={isStudyPlanOpen}
            onClose={() => setIsStudyPlanOpen(false)}
            onSavePlan={handleSaveStudyPlan}
            onEnrollCourse={(courseId) => {
              setIsStudyPlanOpen(false);
              const found = courses.find((c) => c.id === courseId);
              if (found) handleEnrollInitiated(found);
            }}
            language={language}
          />
        </Suspense>
      )}

      {isSpacedRepetitionOpen && (
        <Suspense fallback={<ModalLoading language={language} />}>
          <SpacedRepetitionModal
            isOpen={isSpacedRepetitionOpen}
            onClose={() => setIsSpacedRepetitionOpen(false)}
            onCardReviewed={handleCardReviewed}
            language={language}
          />
        </Suspense>
      )}

      {isPaymentOpen && selectedPaymentCourse && (
        <Suspense fallback={<ModalLoading language={language} />}>
          <PaymentModal
            course={selectedPaymentCourse}
            onClose={() => {
              setIsPaymentOpen(false);
              setSelectedPaymentCourse(null);
            }}
            onSuccess={handlePaymentSuccess}
            language={language}
          />
        </Suspense>
      )}

      {isNotificationsOpen && (
        <Suspense fallback={<ModalLoading language={language} />}>
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onNavigateToBooking={() => navigateTab("booking")}
            onNavigateToSpacedRepetition={() => setIsSpacedRepetitionOpen(true)}
            language={language}
          />
        </Suspense>
      )}
      {isAuthModalOpen && (
        <Suspense fallback={<ModalLoading language={language} />}>
          <AuthModal
            language={language}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthenticated={handleAccountAuthenticated}
          />
        </Suspense>
      )}
    </div>
  );
}
