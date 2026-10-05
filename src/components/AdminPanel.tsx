import React, { useEffect, useState } from "react";
import { Role, UserProfile } from "../types";
import { apiFetch, appPath, setStoredSessionToken } from "../lib/app-path";
import {
  AppNotificationItem,
  buildEmailDispatchUrl,
  buildWhatsAppDispatchUrl,
  emitAppNotification,
  saveLocalNotification,
} from "../lib/notifications";
import type { BookingRecordItem, BookingScheduleConfig } from "./BookingAndMeetingRoom";
import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  DatabaseBackup,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Languages,
  LockKeyhole,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

interface AdminPanelProps {
  currentUser: UserProfile;
  onRoleSwitch: (role: Role, identity?: Partial<Pick<UserProfile, "id" | "name" | "email">>) => void;
  language: "ar" | "en";
}
interface StudentRecord {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  attendance: number;
  quizAvg: number;
  status: string;
}
interface StatsResponse {
  studentsCount: number;
  baseDisplay: string;
  lastHourIncrease: number;
  nextIncrementMinutes: number;
  coursesCount: number;
  experienceYears: string;
}
interface ParentReport {
  studentName: string;
  attendance: number;
  quizAvg: number;
  week: number;
  remarks: string;
  recommendations: string[];
}
interface ManagedAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  disabled: boolean;
  createdAt?: string;
}
interface AnnouncementItem {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  priority: "normal" | "important" | "urgent";
  createdAt: string;
  author: string;
}
interface DailyAnalyticsEntry {
  date: string;
  activeLearners: number;
  lessonsCompleted: number;
  simulatorRuns: number;
  quizAccuracy: number;
  studyPlansGenerated: number;
  securityEventsBlocked: number;
}
interface BackupRecord {
  id: string;
  timestamp: string;
  sizeBytes: number;
  accountsCount: number;
  checksum: string;
}

const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const copy = {
  ar: {
    title: "إدارة المنصة — لوحة التحكم",
    eyebrow: "إدارة أكاديمية آمنة — المهندس والمشرف والأدمين",
    intro:
      "مساحة تشغيلية محمية للمهندس محمود شلتوت والمشرفين المعتمدين لتأكيد وقبول الحجوزات، وإدارة المواعيد والعطلات، والصلاحيات، والمحتوى، والتقارير اليومية.",
    loginTitle: "تسجيل دخول المشرف",
    login: "كلمة مرور الإدارة",
    unlock: "متابعة آمنة إلى لوحة التحكم",
    locked: "جارٍ التحقق من الجلسة…",
    checking: "جارٍ التحقق من جلسة الإدارة…",
    loginError: "تعذر تسجيل الدخول. تحقق من كلمة المرور وحاول مجدداً.",
    sessionError: "تعذر التحقق من جلسة الإدارة. أعد المحاولة.",
    signout: "تسجيل الخروج",
    overview: "نظرة عامة",
    bookings: "تأكيد وقبول الحجوزات",
    schedule: "المواعيد والعطلات",
    students: "سجل الطلاب",
    accounts: "الحسابات والصلاحيات",
    parent: "تقارير أولياء الأمور",
    announcements: "الإعلانات والمحتوى",
    analytics: "التحليلات اليومية",
    backups: "الأمان والنسخ الاحتياطي",
    search: "ابحث بالاسم أو البريد أو المقرر",
    name: "الطالب",
    course: "المقرر",
    progress: "التقدم",
    attendance: "الحضور",
    score: "متوسط الاختبارات",
    status: "الحالة",
    empty: "لا توجد سجلات طلاب لعرضها.",
    statsError: "تعذر تحميل الإحصاءات.",
    studentsError: "تعذر تحميل سجل الطلاب.",
    studentsCount: "تقدير عدد المتعلمين",
    coursesCount: "المقررات المتاحة",
    languages: "لغات المنصة",
    experience: "سنوات الخبرة",
    roleNotice:
      "التسجيل العام ينشئ حساب طالب فقط. يمنح المهندس صلاحية الإدارة، ويمكن للمهندس والمشرف والأدمين قبول وتأكيد الحجوزات وإدارة المواعيد والعطلات وصلاحيات الفريق.",
    retry: "إعادة المحاولة",
    show: "إظهار كلمة المرور",
    hide: "إخفاء كلمة المرور",
    loading: "جارٍ تحميل البيانات…",
    noMatch: "لا توجد نتائج مطابقة.",
    accountIntro:
      "حسابات مسجلة فعلياً في المنصة. يراجع المهندس والمشرف صلاحيات الفريق هنا ويتم منح وترتيب الصلاحيات بأمان.",
    role: "الدور والصلاحية",
    created: "تاريخ التسجيل",
    roleSaved: "تم تحديث الصلاحية بنجاح.",
    roleError: "تعذر تحديث الصلاحية.",
    accountEmpty: "لا توجد حسابات مسجلة بعد. يمكنك تسجيل حساب جديد من نافذة الدخول في الأعلى.",
    accountsError: "تعذر تحميل الحسابات المسجلة.",
    roles: {
      admin: "مشرف (Admin)",
      instructor: "مهندس / مدرّب (Instructor)",
      student: "طالب (Student)",
      parent: "ولي أمر (Parent)",
    },
  },
  en: {
    title: "Platform Administration",
    eyebrow: "Secure Academic Operations — Engineer, Supervisor & Admin",
    intro:
      "Protected workspace for Eng. Mahmoud Shaltoot and authorized supervisors to approve bookings, manage schedules & holidays, permissions, content, analytics, and backups.",
    loginTitle: "Administrator sign in",
    login: "Administrator password",
    unlock: "Continue securely",
    locked: "Checking session…",
    checking: "Verifying administrator session…",
    loginError: "Sign-in failed. Check the password and try again.",
    sessionError: "Could not verify the administrator session. Please retry.",
    signout: "Sign out",
    overview: "Overview",
    bookings: "Booking Approvals",
    schedule: "Schedule & Holidays",
    students: "Student roster",
    accounts: "Accounts & permissions",
    parent: "Parent reports",
    announcements: "Content & announcements",
    analytics: "Daily analytics",
    backups: "Security & backups",
    search: "Search name, email, or course",
    name: "Student",
    course: "Course",
    progress: "Progress",
    attendance: "Attendance",
    score: "Quiz average",
    status: "Status",
    empty: "There are no student records to display.",
    statsError: "Could not load platform statistics.",
    studentsError: "Could not load the student roster.",
    studentsCount: "Estimated learners",
    coursesCount: "Available courses",
    languages: "Interface languages",
    experience: "Years of experience",
    roleNotice:
      "Public sign-ups create student accounts only. The system engineer grants administrator access; engineers, supervisors, and admins can approve bookings and manage schedules & holidays.",
    retry: "Try again",
    show: "Show password",
    hide: "Hide password",
    loading: "Loading records…",
    noMatch: "No matching records.",
    accountIntro:
      "Real registered accounts. The system engineer and administrators can assign and organize roles here.",
    role: "Role",
    created: "Joined",
    roleSaved: "Role updated.",
    roleError: "Could not update the role.",
    accountEmpty: "No registered accounts yet. Create a learner account from the top Sign In button.",
    accountsError: "Could not load registered accounts.",
    roles: {
      admin: "Administrator",
      instructor: "Engineer / Instructor",
      student: "Student",
      parent: "Parent",
    },
  },
} as const;

type AdminTabId =
  | "overview"
  | "bookings"
  | "schedule"
  | "students"
  | "accounts"
  | "parent"
  | "announcements"
  | "analytics"
  | "backups";

export function AdminPanel({ currentUser, onRoleSwitch, language }: AdminPanelProps) {
  const t = copy[language];
  const isEn = language === "en";
  const [auth, setAuth] = useState<"checking" | "locked" | "authenticated" | "error">("checking");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState<AdminTabId>("overview");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);
  const [parentReportState, setParentReportState] = useState<"loading" | "ready" | "error">("loading");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [studentsState, setStudentsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [query, setQuery] = useState("");
  const [studentsRefresh, setStudentsRefresh] = useState(0);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const [parentRefresh, setParentRefresh] = useState(0);
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [accountsState, setAccountsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [accountsRefresh, setAccountsRefresh] = useState(0);
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null);

  // Bookings & Approval state
  const [bookings, setBookings] = useState<BookingRecordItem[]>([]);
  const [bookingsNotice, setBookingsNotice] = useState("");
  const [lastBookingNotif, setLastBookingNotif] = useState<AppNotificationItem | null>(null);

  // Schedule & Holidays state
  const [schedule, setSchedule] = useState<BookingScheduleConfig>({
    timeSlots: [
      "04:00 PM (KSA)",
      "05:30 PM (KSA)",
      "07:00 PM (KSA)",
      "08:30 PM (KSA)",
      "10:00 PM (KSA)",
    ],
    disabledDates: [],
    disabledDateSlots: [],
    weeklyHolidays: [5],
    officialHolidays: [],
  });
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [newDisabledDate, setNewDisabledDate] = useState("");
  const [newDisabledDateReason, setNewDisabledDateReason] = useState("إجازة / غير متاح للحجز");
  const [newDisabledSlotDate, setNewDisabledSlotDate] = useState("2026-10-08");
  const [newDisabledSlotTime, setNewDisabledSlotTime] = useState("07:00 PM (KSA)");
  const [newHolidayTitle, setNewHolidayTitle] = useState("");
  const [newHolidayStart, setNewHolidayStart] = useState("");
  const [newHolidayEnd, setNewHolidayEnd] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<"official" | "annual">("official");
  const [scheduleNotice, setScheduleNotice] = useState("");

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnBody, setNewAnnBody] = useState("");
  const [newAnnPriority, setNewAnnPriority] = useState<"normal" | "important" | "urgent">("important");

  // Analytics & Backups state
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalyticsEntry[]>([]);
  const [securitySummary, setSecuritySummary] = useState<{
    totalActiveWeek: number;
    avgQuizAccuracy: number;
    totalSimulatorSessions: number;
    securityStatus: string;
    failedLoginsBlocked: number;
  } | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<unknown>(null);
  const [backupNotice, setBackupNotice] = useState("");

  const verifySession = async () => {
    setAuth("checking");
    setMessage("");
    try {
      const response = await apiFetch(appPath("/api/admin/session"));
      if (!response.ok) throw new Error("session");
      const data = (await response.json()) as {
        authenticated: boolean;
        user?: { id: string; name: string; email: string; role: Role };
      };
      onRoleSwitch(data.authenticated ? (data.user?.role ?? "admin") : "student", data.user);
      setAuth(data.authenticated ? "authenticated" : "locked");
    } catch {
      setAuth("error");
      setMessage(t.sessionError);
    }
  };

  useEffect(() => {
    void verifySession();
  }, []);

  useEffect(() => {
    if (auth !== "authenticated") {
      setStudents([]);
      setStudentsState("idle");
      return;
    }
    const controller = new AbortController();
    setStudentsState("loading");
    apiFetch(appPath("/api/admin/students"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("students");
        return response.json() as Promise<StudentRecord[]>;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setStudents(Array.isArray(data) ? data : []);
          setStudentsState("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStudentsState("error");
      });
    return () => controller.abort();
  }, [auth, studentsRefresh]);

  useEffect(() => {
    if (auth !== "authenticated") return;
    const controller = new AbortController();
    apiFetch(appPath("/api/stats"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("stats");
        return response.json() as Promise<StatsResponse>;
      })
      .then(setStats)
      .catch(() => {
        if (!controller.signal.aborted) setStatsError(true);
      });
    return () => controller.abort();
  }, [auth, statsRefresh]);

  useEffect(() => {
    if (auth !== "authenticated") {
      setParentReport(null);
      return;
    }
    const controller = new AbortController();
    setParentReportState("loading");
    apiFetch(appPath("/api/admin/parent-report"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("parent_report");
        return response.json() as Promise<ParentReport>;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setParentReport(data);
          setParentReportState("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setParentReportState("error");
      });
    return () => controller.abort();
  }, [auth, parentRefresh]);

  useEffect(() => {
    if (auth !== "authenticated") return;
    apiFetch(appPath("/api/admin/bookings"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BookingRecordItem[] | null) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(() => undefined);

    apiFetch(appPath("/api/booking/schedule"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BookingScheduleConfig | null) => {
        if (data && Array.isArray(data.timeSlots)) {
          setSchedule(data);
          if (data.timeSlots[0]) setNewDisabledSlotTime(data.timeSlots[0]);
        }
      })
      .catch(() => undefined);
  }, [auth, active]);

  useEffect(() => {
    if (auth !== "authenticated" || active !== "accounts") return;
    const controller = new AbortController();
    setAccountsState("loading");
    apiFetch(appPath("/api/admin/users"), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("accounts");
        return (await response.json()) as ManagedAccount[];
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setAccounts(Array.isArray(data) ? data : []);
          setAccountsState("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccountsState("error");
      });
    return () => controller.abort();
  }, [auth, active, accountsRefresh]);

  useEffect(() => {
    if (auth !== "authenticated" || active !== "announcements") return;
    apiFetch(appPath("/api/announcements"))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => undefined);
  }, [auth, active]);

  useEffect(() => {
    if (auth !== "authenticated" || active !== "analytics") return;
    apiFetch(appPath("/api/admin/analytics"))
      .then((r) => r.json())
      .then((data) => {
        if (data?.daily) setDailyAnalytics(data.daily);
        if (data?.summary) setSecuritySummary(data.summary);
      })
      .catch(() => undefined);
  }, [auth, active]);

  useEffect(() => {
    if (auth !== "authenticated" || active !== "backups") return;
    apiFetch(appPath("/api/admin/backups"))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.backups)) setBackups(data.backups);
        if (data?.latestSnapshot) setLatestSnapshot(data.latestSnapshot);
      })
      .catch(() => undefined);
  }, [auth, active]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await apiFetch(appPath("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error("login");
      const data = (await response.json()) as {
        authenticated: boolean;
        token?: string;
        user?: { id: string; name: string; email: string; role: Role };
      };
      if (!data.authenticated) throw new Error("login");
      if (data.token) {
        setStoredSessionToken(data.token);
      }
      onRoleSwitch("admin", data.user);
      setPassword("");
      setAuth("authenticated");
    } catch {
      setMessage(t.loginError);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setStoredSessionToken(null);
    setAuth("locked");
    setStudents([]);
    setStats(null);
    onRoleSwitch("student");
    setPassword("");
    setMessage("");
    try {
      await apiFetch(appPath("/api/admin/logout"), { method: "POST" });
    } catch {
      // Signed out locally
    }
  };

  // Approve & Confirm Booking + Dispatch Multi-Channel Confirmation & 15-Minute Reminder
  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await apiFetch(
        appPath(`/api/admin/bookings/${encodeURIComponent(bookingId)}/approve`),
        { method: "POST" },
      );
      if (!response.ok) return;
      const data = (await response.json()) as {
        booking: BookingRecordItem;
        confirmationNotification?: AppNotificationItem;
        reminderNotification?: AppNotificationItem;
      };
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      if (data.confirmationNotification) {
        saveLocalNotification(data.confirmationNotification);
        window.dispatchEvent(
          new CustomEvent("nkh:notification", { detail: data.confirmationNotification }),
        );
        setLastBookingNotif(data.confirmationNotification);
      }
      if (data.reminderNotification) {
        saveLocalNotification(data.reminderNotification);
        window.dispatchEvent(
          new CustomEvent("nkh:notification", { detail: data.reminderNotification }),
        );
      }
      setBookingsNotice(
        isEn
          ? `Booking for ${data.booking.studentName} confirmed! Confirmation and 15-minute reminder sent via In-App, WhatsApp, and Email.`
          : `تم تأكيد وقبول حجز (${data.booking.studentName}) رسمياً! تم إرسال إشعار التأكيد الكامل وتذكير قبل الموعد بـ 15 دقيقة على التطبيق والواتساب والبريد الإلكتروني.`,
      );
    } catch {
      // Ignore transient error
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await apiFetch(
        appPath(`/api/admin/bookings/${encodeURIComponent(bookingId)}/reject`),
        { method: "POST" },
      );
      if (!response.ok) return;
      const data = (await response.json()) as {
        booking: BookingRecordItem;
        notification?: AppNotificationItem;
      };
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      if (data.notification) {
        saveLocalNotification(data.notification);
        window.dispatchEvent(new CustomEvent("nkh:notification", { detail: data.notification }));
      }
      setBookingsNotice(
        isEn
          ? `Booking marked as unavailable and student notified.`
          : `تم تحديث حالة الحجز وإبلاغ الطالب باختيار موعد بديل.`,
      );
    } catch {
      // Ignore
    }
  };

  const handleSend15MinReminder = async (bookingId: string) => {
    try {
      const response = await apiFetch(
        appPath(`/api/admin/bookings/${encodeURIComponent(bookingId)}/remind`),
        { method: "POST" },
      );
      if (!response.ok) return;
      const data = (await response.json()) as {
        booking: BookingRecordItem;
        reminderNotification?: AppNotificationItem;
      };
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      if (data.reminderNotification) {
        saveLocalNotification(data.reminderNotification);
        window.dispatchEvent(
          new CustomEvent("nkh:notification", { detail: data.reminderNotification }),
        );
        setLastBookingNotif(data.reminderNotification);
      }
      setBookingsNotice(
        isEn
          ? `15-Minute pre-session reminder dispatched to ${data.booking.studentName} via App, WhatsApp & Email.`
          : `تم إرسال تذكير ما قبل الموعد بـ 15 دقيقة للطالب (${data.booking.studentName}) على التطبيق والواتساب والبريد الإلكتروني.`,
      );
    } catch {
      // Ignore
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await apiFetch(appPath(`/api/admin/bookings/${encodeURIComponent(bookingId)}`), {
        method: "DELETE",
      });
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch {
      // Ignore
    }
  };

  // Save Booking Schedule & Holidays Configuration
  const saveScheduleConfig = async (nextConfig: BookingScheduleConfig, summaryTextAr: string) => {
    setSchedule(nextConfig);
    try {
      const res = await apiFetch(appPath("/api/admin/booking/schedule"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextConfig),
      });
      if (res.ok) {
        const saved = (await res.json()) as BookingScheduleConfig;
        setSchedule(saved);
        setScheduleNotice(summaryTextAr);
        void emitAppNotification({
          category: "admin",
          titleAr: "تحديث جدول مواعيد الحجز والعطلات الرسمية",
          titleEn: "Booking Schedule & Holidays Updated by Admin",
          bodyAr: summaryTextAr,
          bodyEn: summaryTextAr,
          recipientEmail: currentUser.email || "Mahmoudshaltoot.cemc@gmail.com",
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleAccountRoleChange = async (accountId: string, role: Role) => {
    setUpdatingAccountId(accountId);
    try {
      const response = await apiFetch(
        appPath(`/api/admin/users/${encodeURIComponent(accountId)}/role`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        },
      );
      if (!response.ok) throw new Error("role_update");
      const data = (await response.json()) as { user: ManagedAccount };
      setAccounts((existing) =>
        existing.map((account) =>
          account.id === accountId ? { ...account, ...data.user } : account,
        ),
      );
      setMessage(t.roleSaved);
    } catch {
      setMessage(t.roleError);
    } finally {
      setUpdatingAccountId(null);
    }
  };

  const handleCreateAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newAnnTitle.trim() || !newAnnBody.trim()) return;
    try {
      const response = await apiFetch(appPath("/api/admin/announcements"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: newAnnTitle,
          titleEn: newAnnTitle,
          bodyAr: newAnnBody,
          bodyEn: newAnnBody,
          priority: newAnnPriority,
        }),
      });
      if (!response.ok) return;
      const created = (await response.json()) as AnnouncementItem;
      setAnnouncements((prev) => [created, ...prev]);
      void emitAppNotification({
        category: "admin",
        titleAr: `إعلان أكاديمي جديد: ${newAnnTitle}`,
        titleEn: `New Academic Announcement: ${newAnnTitle}`,
        bodyAr: newAnnBody,
        bodyEn: newAnnBody,
        recipientEmail: currentUser.email || "Mahmoudshaltoot.cemc@gmail.com",
      });
      setNewAnnTitle("");
      setNewAnnBody("");
    } catch {
      // Ignore transient error
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await apiFetch(appPath(`/api/admin/announcements/${encodeURIComponent(id)}`), {
        method: "DELETE",
      });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // Ignore
    }
  };

  const handleTriggerBackup = async () => {
    try {
      const response = await apiFetch(appPath("/api/admin/backups"), {
        method: "POST",
      });
      if (!response.ok) return;
      const created = (await response.json()) as BackupRecord;
      setBackups((prev) => [created, ...prev]);
      setBackupNotice(
        isEn
          ? `Backup snapshot ${created.id} created and verified (${created.checksum}).`
          : `تم إنشاء النسخة الاحتياطية الدورية (${created.id}) والتحقق من بصمة التشفير بنجاح.`,
      );
    } catch {
      // Ignore
    }
  };

  const handleDownloadSnapshot = () => {
    const dataStr = JSON.stringify(
      latestSnapshot ?? { backups, exportedAt: new Date().toISOString() },
      null,
      2,
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nuclear-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter((student) =>
    [student.name, student.email, student.course].some((value) =>
      String(value ?? "").toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    ),
  );

  // 1. Checking Session View (Dark Neon Theme)
  if (auth === "checking")
    return (
      <section className="mx-auto max-w-5xl px-5 py-20" aria-live="polite">
        <div className="nuclear-glow flex items-center gap-4 rounded-2xl border border-[#162334] bg-[#090e18] p-6">
          <div className="size-8 animate-pulse rounded-full bg-[#00e8f5]/20 border border-[#00e8f5]/40" />
          <p className="text-sm text-[#f4f7fb]">{t.checking}</p>
        </div>
      </section>
    );

  // 2. Admin Sign-In Page (Dark Neon Cherenkov Cyan & Plasma Magenta Theme matching rest of site)
  if (auth !== "authenticated")
    return (
      <section className="mx-auto max-w-5xl px-5 py-14" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="nuclear-glow mx-auto max-w-lg overflow-hidden rounded-[28px] border border-[#162334] bg-[#090e18]/95 shadow-[0_24px_80px_rgba(0,232,245,0.12)] backdrop-blur-md">
          <div className="border-b border-[#162334] bg-[#060a12] px-8 py-7">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-[#00e8f5]/40 bg-[#00e8f5]/15 text-[#00e8f5] shadow-[0_0_20px_rgba(0,232,245,0.25)]">
              <LockKeyhole size={22} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#00e8f5]">
              {t.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#f4f7fb]">{t.loginTitle}</h1>
            <p className="mt-3 text-sm leading-7 text-[#78879b]">{t.intro}</p>
          </div>
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-5 px-8 py-7">
            {auth === "error" && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-200"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{message}</span>
              </div>
            )}
            <label htmlFor="admin-password" className="block text-sm font-semibold text-[#f4f7fb]">
              {t.login}
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder={isEn ? "Enter administrator password" : "أدخل كلمة مرور المهندس / المشرف"}
                required
                className="w-full rounded-xl border border-[#192536] bg-[#05080f] px-4 py-3 pe-12 text-sm text-[#f4f7fb] placeholder:text-[#64748b] focus:border-[#00e8f5] focus:outline-none focus:ring-2 focus:ring-[#00e8f5]/25"
              />
              <button
                type="button"
                aria-label={passwordVisible ? t.hide : t.show}
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 end-0 flex items-center px-4 text-[#78879b] hover:text-[#00e8f5] cursor-pointer"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {message && auth !== "error" && (
              <p role="alert" className="text-sm text-rose-400">
                {message}
              </p>
            )}
            {auth === "error" && (
              <button
                type="button"
                onClick={() => void verifySession()}
                className="w-full text-sm font-semibold text-[#00e8f5] underline underline-offset-4 cursor-pointer"
              >
                {t.retry}
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn-primary nuclear-glow flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:cursor-wait disabled:opacity-60 cursor-pointer"
            >
              {busy ? (
                <span>{t.locked}</span>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  <span>{t.unlock}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    );

  // 3. Authenticated Admin Dashboard (Dark Neon Cherenkov Cyan & Plasma Magenta Theme)
  const pendingBookingsCount = bookings.filter((b) => b.status === "pending").length;

  const tabs: Array<{ id: AdminTabId; label: string; badge?: number }> = [
    { id: "overview", label: t.overview },
    { id: "bookings", label: t.bookings, badge: pendingBookingsCount },
    { id: "schedule", label: t.schedule },
    { id: "students", label: t.students },
    { id: "accounts", label: t.accounts },
    { id: "parent", label: t.parent },
    { id: "announcements", label: t.announcements },
    { id: "analytics", label: t.analytics },
    { id: "backups", label: t.backups },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] space-y-8 px-5 py-12 lg:px-8"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <header className="nuclear-glow flex flex-wrap items-start justify-between gap-5 rounded-3xl border border-[#162334] bg-[#090e18]/90 p-6 sm:p-8">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#00e8f5]">
            <ShieldCheck size={15} />
            <span>{t.eyebrow}</span>
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#f4f7fb] sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#78879b]">{t.intro}</p>
        </div>
        <button
          onClick={() => void handleSignOut()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#ef2b88]/40 bg-[#ef2b88]/10 px-4 py-2.5 text-sm font-semibold text-[#ef2b88] transition hover:bg-[#ef2b88]/20 cursor-pointer"
        >
          <LogOut size={16} />
          <span>{t.signout}</span>
        </button>
      </header>

      <div
        className="flex flex-wrap gap-2 border-b border-[#162334] pb-2"
        role="tablist"
        aria-label={t.title}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              active === tab.id
                ? "bg-[#00e8f5] text-[#041019] shadow-[0_0_20px_rgba(0,232,245,0.35)]"
                : "border border-[#162334] bg-[#090e18] text-[#94a3b8] hover:border-[#00e8f5]/40 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  active === tab.id
                    ? "bg-[#041019] text-[#00e8f5]"
                    : "bg-[#ef2b88] text-white"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {active === "overview" && (
        <div className="space-y-6">
          {statsError ? (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200"
            >
              <AlertCircle size={18} />
              <span>{t.statsError}</span>
              <button
                onClick={() => {
                  setStatsError(false);
                  setStatsRefresh((value) => value + 1);
                }}
                className="ms-auto underline text-[#00e8f5]"
              >
                {t.retry}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t.studentsCount, value: stats?.studentsCount, icon: Users, color: "text-[#00e8f5]" },
                { label: t.coursesCount, value: Math.max(12, stats?.coursesCount ?? 12), icon: BookOpen, color: "text-white" },
                { label: t.languages, value: "AR + EN", icon: Languages, color: "text-white" },
                { label: t.experience, value: stats?.experienceYears ?? "12+", icon: GraduationCap, color: "text-[#ef2b88]" },
              ].map(({ label, value, icon: Icon, color }) => (
                <article
                  key={label}
                  className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-5"
                >
                  <div className="flex items-center justify-between text-sm text-[#78879b]">
                    <span>{label}</span>
                    <Icon size={17} className="text-[#00e8f5]" />
                  </div>
                  {value === undefined ? (
                    <div className="mt-4 h-8 w-24 animate-pulse rounded bg-[#142033]" />
                  ) : (
                    <div
                      className={`mt-3 font-display text-3xl font-bold tracking-tight tabular-nums ${color}`}
                      dir="ltr"
                    >
                      {value}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Quick Pending Bookings Callout */}
          <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="size-4 text-[#00e8f5]" />
                <span>
                  {isEn
                    ? `Booking Requests Awaiting Approval (${pendingBookingsCount} Pending)`
                    : `طلبات الحجز بانتظار موافقة المهندس أو المشرف (${pendingBookingsCount} طلب معلق)`}
                </span>
              </div>
              <p className="text-xs text-[#78879b]">
                {isEn
                  ? "No booking is confirmed until approved here. Approving dispatches instant confirmation + 15-minute reminders via WhatsApp, Email, and In-App."
                  : "لا يتم تأكيد أي حجز إلا بعد قبوله من لوحة التحكم، حيث يتم إرسال إشعار التأكيد الكامل والتذكير قبل الموعد بـ 15 دقيقة على الواتساب والإيميل والتطبيق."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActive("bookings")}
                className="btn-primary nuclear-glow text-xs py-2.5 px-4 cursor-pointer"
              >
                {isEn ? "Review & Confirm Bookings" : "مراجعة وتأكيد الحجوزات"}
              </button>
              <button
                type="button"
                onClick={() => setActive("schedule")}
                className="btn-ghost nuclear-glow text-xs py-2.5 px-4 cursor-pointer"
              >
                {isEn ? "Manage Schedule & Holidays" : "إدارة المواعيد والعطلات"}
              </button>
            </div>
          </div>

          <p className="rounded-xl border border-[#162334] bg-[#060a12] px-4 py-3 text-xs leading-6 text-[#94a3b8]">
            {t.roleNotice}
          </p>
        </div>
      )}

      {/* TAB 2: BOOKING APPROVALS & 15-MINUTE REMINDERS */}
      {active === "bookings" && (
        <div className="space-y-6">
          <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#162334] pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="size-5 text-[#00e8f5]" />
                  <span>
                    {isEn
                      ? "Booking Approvals & 15-Minute Multi-Channel Reminders"
                      : "اعتماد وتأكيد الحجوزات وإرسال التذكير قبل الموعد بـ 15 دقيقة"}
                  </span>
                </h2>
                <p className="text-xs text-[#78879b] mt-1">
                  {isEn
                    ? "Approve student session requests to confirm their booking and dispatch WhatsApp, Email, and In-App notifications."
                    : "عند الضغط على «تأكيد وقبول الحجز» يتم اعتماد الموعد رسمياً وإرسال كافة التفاصيل (التاريخ، التوقيت، نوع الحجز، الموضوع، رابط القاعة) مع تذكير قبل الموعد بـ 15 دقيقة عبر التطبيق والواتساب والبريد الإلكتروني."}
                </p>
              </div>
            </div>

            {bookingsNotice && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-200 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{bookingsNotice}</span>
                </div>
                {lastBookingNotif && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={buildWhatsAppDispatchUrl(lastBookingNotif, isEn)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-900/50 px-3 py-1.5 text-[11px] font-bold text-emerald-200 hover:bg-emerald-800/60"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>
                        {isEn ? "Send Confirmation via WhatsApp" : "إرسال إشعار التأكيد والتذكير عبر واتساب"}
                      </span>
                    </a>
                    <a
                      href={buildEmailDispatchUrl(lastBookingNotif, isEn)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#00e8f5]/50 bg-cyan-950/60 px-3 py-1.5 text-[11px] font-bold text-[#00e8f5] hover:bg-cyan-900/60"
                    >
                      <Mail className="size-3.5" />
                      <span>
                        {isEn ? "Send Confirmation via Email" : "إرسال إشعار التأكيد والتذكير عبر الإيميل"}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {bookings.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#78879b]">
                {isEn ? "No booking requests yet." : "لا توجد طلبات حجز مسجلة حالياً."}
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((bk) => {
                  const isApproved = bk.status === "approved";
                  const isRejected = bk.status === "rejected";
                  const phoneDigits = bk.whatsappPhone.replace(/[^\d]/g, "");
                  const studentWhatsappUrl = `https://wa.me/${phoneDigits || "966594756878"}?text=${encodeURIComponent(
                    `مرحباً ${bk.studentName}، تم تأكيد وقبول حجزك رسمياً مع المهندس محمود إسماعيل شلتوت!\n• نوع الحجز: ${bk.bookingType}\n• الموضوع: ${bk.topic}\n• التاريخ: ${bk.date}\n• التوقيت: ${bk.timeSlot}\n• الدولة: ${bk.countryName}\n• البريد المسجل: ${bk.studentEmail}\n• رابط القاعة المباشرة: https://knowledge-hub-nuclear.app/meeting/${bk.meetingId}\n(ملاحظة: سيصلك أيضاً تذكير قبل الموعد بـ 15 دقيقة).`,
                  )}`;
                  const studentReminder15Url = `https://wa.me/${phoneDigits || "966594756878"}?text=${encodeURIComponent(
                    `[تذكير قبل الموعد بـ 15 دقيقة]\nمرحباً ${bk.studentName}، تبدأ جلستك المؤكدة (${bk.bookingType}) مع المهندس محمود شلتوت بعد 15 دقيقة!\n• التاريخ: ${bk.date}\n• التوقيت: ${bk.timeSlot}\n• الموضوع: ${bk.topic}\n• رابط الدخول الفوري للقاعة: https://knowledge-hub-nuclear.app/meeting/${bk.meetingId}`,
                  )}`;
                  const studentEmailUrl = `mailto:${encodeURIComponent(bk.studentEmail)}?cc=Mahmoudshaltoot.cemc@gmail.com&subject=${encodeURIComponent(
                    `تأكيد الحجز الرسمي + تذكير قبل الموعد بـ 15 دقيقة: ${bk.bookingType} (${bk.date})`,
                  )}&body=${encodeURIComponent(
                    `مرحباً ${bk.studentName}،\n\nتم تأكيد وقبول حجزك رسمياً في منصة الكيمياء النووية (المهندس محمود إسماعيل شلتوت):\n\n- نوع الحجز: ${bk.bookingType}\n- الموضوع والتفاصيل: ${bk.topic}\n- التاريخ: ${bk.date}\n- التوقيت: ${bk.timeSlot}\n- الدولة: ${bk.countryName}\n- رقم الواتساب: ${bk.whatsappPhone}\n- البريد الإلكتروني: ${bk.studentEmail}\n- معرف القاعة الافتراضية: ${bk.meetingId}\n\nتذكير تلقائي: يرجى التواجد قبل الموعد بـ 15 دقيقة للدخول إلى القاعة الافتراضية.`,
                  )}`;

                  return (
                    <article
                      key={bk.id}
                      className={`rounded-2xl border p-5 space-y-4 ${
                        isApproved
                          ? "border-emerald-500/40 bg-[#071520]"
                          : isRejected
                            ? "border-rose-500/30 bg-[#140912]"
                            : "border-amber-500/40 bg-[#121008]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-white">{bk.studentName}</h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                isApproved
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : isRejected
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              }`}
                            >
                              {isApproved
                                ? isEn
                                  ? "Confirmed & Approved ✓"
                                  : "حجز مؤكد ومعتمد ✓"
                                : isRejected
                                  ? isEn
                                    ? "Declined"
                                    : "معتذر عنه"
                                  : isEn
                                    ? "Pending Approval"
                                    : "بانتظار تأكيد المهندس / المشرف"}
                            </span>
                            <span className="rounded-lg bg-[#00e8f5]/15 border border-[#00e8f5]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#00e8f5]">
                              {bk.bookingType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{bk.topic}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {bk.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() => void handleApproveBooking(bk.id)}
                              className="nuclear-glow inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
                            >
                              <CheckCircle2 className="size-4" />
                              <span>
                                {isEn ? "Approve & Confirm Booking" : "تأكيد وقبول الحجز وإرسال الإشعارات"}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleSend15MinReminder(bk.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#00e8f5]/40 bg-[#00e8f5]/15 px-3 py-2 text-xs font-bold text-[#00e8f5] hover:bg-[#00e8f5]/25 transition cursor-pointer"
                          >
                            <Bell className="size-3.5" />
                            <span>
                              {isEn ? "Send 15-Min Reminder" : "إرسال تذكير قبل الموعد بـ 15 دقيقة"}
                            </span>
                          </button>
                          {bk.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => void handleRejectBooking(bk.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition cursor-pointer"
                            >
                              <XCircle className="size-3.5" />
                              <span>{isEn ? "Decline" : "اعتذار"}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleDeleteBooking(bk.id)}
                            aria-label="Delete booking"
                            className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-2 text-rose-300 hover:bg-rose-900/50 transition cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl border border-slate-800/80 bg-[#050912] p-3.5 text-xs">
                        <div>
                          <span className="text-[#78879b] block">
                            {isEn ? "Date & Time:" : "التاريخ والتوقيت:"}
                          </span>
                          <strong className="text-white font-mono" dir="ltr">
                            {bk.date} · {bk.timeSlot}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#78879b] block">
                            {isEn ? "WhatsApp & Country:" : "الواتساب والدولة:"}
                          </span>
                          <strong className="text-[#00e8f5] font-mono" dir="ltr">
                            {bk.whatsappPhone}
                          </strong>{" "}
                          <span className="text-slate-400">({bk.countryName})</span>
                        </div>
                        <div>
                          <span className="text-[#78879b] block">
                            {isEn ? "Registered Email:" : "البريد الإلكتروني:"}
                          </span>
                          <strong className="text-slate-200 font-mono" dir="ltr">
                            {bk.studentEmail}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#78879b] block">
                            {isEn ? "Virtual Room ID:" : "معرف القاعة الافتراضية:"}
                          </span>
                          <strong className="text-[#ef2b88] font-mono" dir="ltr">
                            {bk.meetingId}
                          </strong>
                        </div>
                      </div>

                      {/* Multi-Channel Direct Dispatch Links for Student */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400">
                          {isEn
                            ? "Direct Multi-Channel Dispatch to Student:"
                            : "إرسال مباشر للطالب عبر الواتساب والإيميل المسجل:"}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={studentWhatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-3 py-1.5 font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
                          >
                            <MessageSquare className="size-3.5" />
                            <span>{isEn ? "WhatsApp Confirmation" : "واتساب تأكيد الحجز"}</span>
                          </a>
                          <a
                            href={studentReminder15Url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/50 px-3 py-1.5 font-bold text-amber-300 hover:bg-amber-900/60 transition"
                          >
                            <Clock className="size-3.5" />
                            <span>{isEn ? "WhatsApp 15-Min Reminder" : "واتساب تذكير 15 دقيقة"}</span>
                          </a>
                          <a
                            href={studentEmailUrl}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#00e8f5]/40 bg-cyan-950/50 px-3 py-1.5 font-bold text-[#00e8f5] hover:bg-cyan-900/60 transition"
                          >
                            <Mail className="size-3.5" />
                            <span>{isEn ? "Email Confirmation & Reminder" : "إرسال للبريد الإلكتروني"}</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE, TIME SLOTS, DISABLED DATES & HOLIDAYS MANAGEMENT */}
      {active === "schedule" && (
        <div className="space-y-6">
          {scheduleNotice && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs text-emerald-200"
            >
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>{scheduleNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Booking Time Slots Management */}
            <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="size-5 text-[#00e8f5]" />
                <span>
                  {isEn
                    ? "Manage Booking Time Slots (Add / Delete)"
                    : "إدارة وحذف التوقيتات والمواعيد من صفحة الحجز"}
                </span>
              </h2>
              <p className="text-xs text-[#78879b]">
                {isEn
                  ? "Add or delete daily time slots displayed on the student booking page."
                  : "يمكن للمهندس والمشرف والأدمين حذف أي توقيت أو إضافة توقيت جديد ليظهر فوراً في صفحة الحجز."}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newTimeSlot.trim();
                  if (!trimmed || schedule.timeSlots.includes(trimmed)) return;
                  const next = { ...schedule, timeSlots: [...schedule.timeSlots, trimmed] };
                  setNewTimeSlot("");
                  void saveScheduleConfig(next, `تمت إضافة التوقيت (${trimmed}) إلى صفحة الحجز.`);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  placeholder="مثال: 09:00 PM (KSA)"
                  dir="ltr"
                  className="flex-1 rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2 text-xs text-white font-mono focus:border-[#00e8f5] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#00e8f5] px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 cursor-pointer"
                >
                  {isEn ? "Add Slot" : "إضافة توقيت"}
                </button>
              </form>

              <div className="space-y-2">
                {schedule.timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#050912] px-4 py-2.5 text-xs"
                  >
                    <span className="font-mono font-semibold text-white" dir="ltr">
                      {slot}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = {
                          ...schedule,
                          timeSlots: schedule.timeSlots.filter((s) => s !== slot),
                        };
                        void saveScheduleConfig(next, `تم حذف التوقيت (${slot}) من صفحة الحجز.`);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-900/50 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>{isEn ? "Delete" : "حذف التوقيت"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Weekly Holidays Management */}
            <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="size-5 text-[#ef2b88]" />
                <span>
                  {isEn
                    ? "Weekly Recurring Holidays"
                    : "تحديد العطلات الأسبوعية الثابتة"}
                </span>
              </h2>
              <p className="text-xs text-[#78879b]">
                {isEn
                  ? "Select which days of the week are closed for bookings."
                  : "اضغط على أي يوم لتفعيله أو إلغاء تفعيله كعطلة أسبوعية ثابتة يتوقف فيها الحجز تلقائياً."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {WEEKDAYS_AR.map((dayAr, idx) => {
                  const isHoliday = schedule.weeklyHolidays.includes(idx);
                  return (
                    <button
                      key={dayAr}
                      type="button"
                      onClick={() => {
                        const nextWeekly = isHoliday
                          ? schedule.weeklyHolidays.filter((d) => d !== idx)
                          : [...schedule.weeklyHolidays, idx];
                        void saveScheduleConfig(
                          { ...schedule, weeklyHolidays: nextWeekly },
                          `تم تحديث العطلات الأسبوعية (${dayAr}: ${isHoliday ? "متاح للحجز" : "عطلة أسبوعية"}).`,
                        );
                      }}
                      className={`rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                        isHoliday
                          ? "border-[#ef2b88] bg-[#ef2b88]/20 text-[#ef2b88]"
                          : "border-slate-800 bg-[#050912] text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>{isEn ? WEEKDAYS_EN[idx] : dayAr}</div>
                      <div className="mt-1 text-[10px] font-normal">
                        {isHoliday
                          ? isEn
                            ? "Weekly Holiday"
                            : "عطلة أسبوعية"
                          : isEn
                            ? "Available"
                            : "متاح للحجز"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Disable Specific Date or Specific Time Slot on a Specific Date */}
            <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-5">
              <h2 className="text-base font-bold text-white">
                {isEn
                  ? "Deactivate Specific Date or Specific Time on a Date"
                  : "إلغاء تفعيل تاريخ يوم معين أو توقيت معين في يوم معين"}
              </h2>

              {/* Disable Entire Date */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newDisabledDate) return;
                  const next = {
                    ...schedule,
                    disabledDates: [
                      ...schedule.disabledDates.filter((d) => d.date !== newDisabledDate),
                      { date: newDisabledDate, reason: newDisabledDateReason || "غير متاح للحجز" },
                    ],
                  };
                  setNewDisabledDate("");
                  void saveScheduleConfig(
                    next,
                    `تم إلغاء تفعيل الحجز في تاريخ (${newDisabledDate}).`,
                  );
                }}
                className="space-y-2 border-b border-[#162334] pb-4"
              >
                <label className="block text-xs font-semibold text-slate-300">
                  {isEn ? "Deactivate an Entire Day:" : "١. إلغاء تفعيل يوم كامل:"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    required
                    value={newDisabledDate}
                    onChange={(e) => setNewDisabledDate(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newDisabledDateReason}
                    onChange={(e) => setNewDisabledDateReason(e.target.value)}
                    placeholder="السبب (مثال: ارتباط أكاديمي)"
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ef2b88] px-4 py-2 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
                  >
                    {isEn ? "Disable Date" : "إيقاف هذا التاريخ"}
                  </button>
                </div>
                {schedule.disabledDates.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {schedule.disabledDates.map((d) => (
                      <div
                        key={d.date}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#050912] px-3 py-1.5 text-xs"
                      >
                        <span>
                          <strong className="font-mono text-rose-300">{d.date}</strong> — {d.reason}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = {
                              ...schedule,
                              disabledDates: schedule.disabledDates.filter((x) => x.date !== d.date),
                            };
                            void saveScheduleConfig(next, `تم إعادة تفعيل التاريخ (${d.date}).`);
                          }}
                          className="text-emerald-400 hover:underline text-[11px] font-bold cursor-pointer"
                        >
                          {isEn ? "Re-enable" : "إعادة التفعيل"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Disable Specific Slot on Specific Date */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newDisabledSlotDate || !newDisabledSlotTime) return;
                  const exists = schedule.disabledDateSlots.some(
                    (s) => s.date === newDisabledSlotDate && s.slot === newDisabledSlotTime,
                  );
                  if (exists) return;
                  const next = {
                    ...schedule,
                    disabledDateSlots: [
                      ...schedule.disabledDateSlots,
                      { date: newDisabledSlotDate, slot: newDisabledSlotTime },
                    ],
                  };
                  void saveScheduleConfig(
                    next,
                    `تم إلغاء تفعيل التوقيت (${newDisabledSlotTime}) في يوم (${newDisabledSlotDate}).`,
                  );
                }}
                className="space-y-2"
              >
                <label className="block text-xs font-semibold text-slate-300">
                  {isEn
                    ? "Deactivate a Specific Time Slot on a Specific Date:"
                    : "٢. إلغاء تفعيل توقيت معين في تاريخ يوم معين:"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    required
                    value={newDisabledSlotDate}
                    onChange={(e) => setNewDisabledSlotDate(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={newDisabledSlotTime}
                    onChange={(e) => setNewDisabledSlotTime(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white font-mono"
                  >
                    {schedule.timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#ef2b88]/50 bg-[#ef2b88]/20 px-4 py-2 text-xs font-bold text-[#ef2b88] hover:bg-[#ef2b88]/30 cursor-pointer"
                  >
                    {isEn ? "Disable Slot on Date" : "إلغاء تفعيل التوقيت"}
                  </button>
                </div>
                {schedule.disabledDateSlots.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {schedule.disabledDateSlots.map((item) => (
                      <div
                        key={`${item.date}-${item.slot}`}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#050912] px-3 py-1.5 text-xs"
                      >
                        <span className="font-mono text-amber-300" dir="ltr">
                          {item.date} — {item.slot}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = {
                              ...schedule,
                              disabledDateSlots: schedule.disabledDateSlots.filter(
                                (x) => !(x.date === item.date && x.slot === item.slot),
                              ),
                            };
                            void saveScheduleConfig(
                              next,
                              `تمت إعادة تفعيل التوقيت (${item.slot}) ليوم (${item.date}).`,
                            );
                          }}
                          className="text-emerald-400 hover:underline text-[11px] font-bold cursor-pointer"
                        >
                          {isEn ? "Re-enable" : "إعادة التفعيل"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* 4. Official & Annual Holidays Management */}
            <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4">
              <h2 className="text-base font-bold text-white">
                {isEn
                  ? "Official & Annual Holidays Management"
                  : "إدارة العطلات الرسمية والسنوية والمواسم الأكاديمية"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newHolidayTitle.trim() || !newHolidayStart) return;
                  const next = {
                    ...schedule,
                    officialHolidays: [
                      ...schedule.officialHolidays,
                      {
                        id: `hol-${Date.now()}`,
                        title: newHolidayTitle.trim(),
                        startDate: newHolidayStart,
                        endDate: newHolidayEnd || newHolidayStart,
                        type: newHolidayType,
                      },
                    ],
                  };
                  setNewHolidayTitle("");
                  setNewHolidayStart("");
                  setNewHolidayEnd("");
                  void saveScheduleConfig(
                    next,
                    `تمت إضافة العطلة (${newHolidayTitle.trim()}) إلى جدول الحجوزات.`,
                  );
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newHolidayTitle}
                    onChange={(e) => setNewHolidayTitle(e.target.value)}
                    placeholder={isEn ? "Holiday title (e.g., Eid Holiday)" : "اسم العطلة (مثال: إجازة عيد الفطر / إجازة سنوية)"}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={newHolidayType}
                    onChange={(e) => setNewHolidayType(e.target.value as "official" | "annual")}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  >
                    <option value="official">{isEn ? "Official Holiday" : "عطلة رسمية"}</option>
                    <option value="annual">{isEn ? "Annual Holiday" : "عطلة سنوية"}</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    required
                    value={newHolidayStart}
                    onChange={(e) => setNewHolidayStart(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={newHolidayEnd}
                    onChange={(e) => setNewHolidayEnd(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#050912] px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#00e8f5] px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 cursor-pointer"
                  >
                    {isEn ? "Add Holiday" : "إضافة عطلة"}
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {schedule.officialHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#050912] p-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {h.title}{" "}
                        <span className="text-[10px] text-[#00e8f5]">
                          ({h.type === "annual" ? (isEn ? "Annual" : "سنوية") : isEn ? "Official" : "رسمية"})
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-[#78879b]" dir="ltr">
                        {h.startDate} → {h.endDate}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = {
                          ...schedule,
                          officialHolidays: schedule.officialHolidays.filter((x) => x.id !== h.id),
                        };
                        void saveScheduleConfig(next, `تم حذف العطلة (${h.title}).`);
                      }}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-950/50 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS */}
      {active === "students" && (
        <div className="nuclear-glow overflow-hidden rounded-2xl border border-[#162334] bg-[#090e18]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#162334] p-5">
            <div>
              <h2 className="text-lg font-bold text-white">{t.students}</h2>
              <p className="mt-1 text-xs text-[#78879b]">
                {language === "ar"
                  ? "سجلات الطلاب والمتابعة الأكاديمية المحمية."
                  : "Protected student roster and academic progress."}
              </p>
            </div>
            <label className="relative w-full sm:max-w-sm">
              <Search size={16} className="absolute start-3 top-3 text-[#64748b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
                className="w-full rounded-xl border border-slate-700 bg-[#050912] py-2.5 ps-9 pe-3 text-sm text-white placeholder:text-[#64748b] focus:border-[#00e8f5] focus:outline-none"
              />
            </label>
          </div>
          {studentsState === "loading" ? (
            <div aria-live="polite" className="space-y-3 p-6">
              <div className="h-4 w-44 animate-pulse rounded bg-slate-800" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-900" />
              <p className="text-sm text-[#78879b]">{t.loading}</p>
            </div>
          ) : studentsState === "error" ? (
            <div role="alert" className="flex items-center gap-3 p-6 text-sm text-rose-400">
              <AlertCircle size={18} />
              <span>{t.studentsError}</span>
              <button
                onClick={() => setStudentsRefresh((value) => value + 1)}
                className="ms-auto underline text-[#00e8f5]"
              >
                {t.retry}
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-[#78879b]">
              {students.length ? t.noMatch : t.empty}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-start text-sm">
                <thead className="bg-[#060a12] text-xs text-[#78879b] border-b border-[#162334]">
                  <tr>
                    {[t.name, t.course, t.progress, t.attendance, t.score, t.status].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 text-start font-semibold">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162334]">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#0d1424]">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="mt-1 font-mono text-xs text-[#78879b]" dir="ltr">
                          {student.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#00e8f5]">{student.course}</td>
                      <td className="px-4 py-4 font-mono tabular-nums text-slate-200">
                        {student.progress}%
                      </td>
                      <td className="px-4 py-4 font-mono tabular-nums text-slate-200">
                        {student.attendance}%
                      </td>
                      <td className="px-4 py-4 font-mono tabular-nums text-emerald-400 font-bold">
                        {student.quizAvg}%
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-300">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ACCOUNTS & PERMISSIONS */}
      {active === "accounts" && (
        <section className="nuclear-glow overflow-hidden rounded-2xl border border-[#162334] bg-[#090e18]">
          <header className="border-b border-[#162334] p-5">
            <h2 className="text-lg font-bold text-white">{t.accounts}</h2>
            <p className="mt-1 text-xs leading-6 text-[#78879b]">{t.accountIntro}</p>
            {message && (
              <p role="status" className="mt-3 text-sm text-[#00e8f5]">
                {message}
              </p>
            )}
          </header>
          {accountsState === "loading" ? (
            <p className="p-6 text-sm text-[#78879b]" role="status">
              {t.loading}
            </p>
          ) : accountsState === "error" ? (
            <div className="flex items-center gap-3 p-6 text-sm text-rose-400" role="alert">
              <AlertCircle size={18} />
              <span>{t.accountsError}</span>
              <button
                type="button"
                onClick={() => setAccountsRefresh((value) => value + 1)}
                className="ms-auto underline text-[#00e8f5]"
              >
                {t.retry}
              </button>
            </div>
          ) : accounts.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-[#78879b]">{t.accountEmpty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-start text-sm">
                <thead className="bg-[#060a12] text-xs text-[#78879b] border-b border-[#162334]">
                  <tr>
                    {[t.name, t.role, t.created].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-start font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162334]">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-[#0d1424]">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{account.name}</div>
                        <div className="mt-1 font-mono text-xs text-[#78879b]" dir="ltr">
                          {account.email}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          aria-label={`${t.role}: ${account.name}`}
                          className="min-w-44 rounded-lg border border-slate-700 bg-[#050912] px-3 py-2 text-sm text-white focus:border-[#00e8f5] focus:outline-none"
                          disabled={updatingAccountId === account.id}
                          onChange={(event) =>
                            void handleAccountRoleChange(account.id, event.target.value as Role)
                          }
                          value={account.role}
                        >
                          {(currentUser.id === "root-admin" || account.role === "admin"
                            ? (["student", "instructor", "parent", "admin"] as Role[])
                            : (["student", "instructor", "parent"] as Role[])
                          ).map((role) => (
                            <option
                              key={role}
                              value={role}
                              disabled={role === "admin" && currentUser.id !== "root-admin"}
                            >
                              {t.roles[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-[#78879b] font-mono text-xs">
                        {account.createdAt
                          ? new Date(account.createdAt).toLocaleDateString(
                              language === "ar" ? "ar-SA" : "en-US",
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 6: PARENT REPORT */}
      {active === "parent" && (
        <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === "ar" ? "تقرير ولي الأمر" : "Parent report"}
              </h2>
              <p className="mt-1 text-xs text-[#78879b]">
                {language === "ar"
                  ? "تقرير متابعة أسبوعي شامل."
                  : "Comprehensive weekly academic report."}
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#00e8f5]">
              {language === "ar"
                ? `الأسبوع ${parentReport?.week ?? "—"}`
                : `Week ${parentReport?.week ?? "—"}`}
            </span>
          </div>
          {parentReportState === "loading" ? (
            <div aria-live="polite" className="h-24 animate-pulse rounded-xl bg-slate-900" />
          ) : parentReportState === "error" ? (
            <div role="alert" className="text-sm text-rose-400">
              {language === "ar"
                ? "تعذر تحميل تقرير ولي الأمر."
                : "Could not load the parent report."}
              <button
                onClick={() => setParentRefresh((value) => value + 1)}
                className="ms-3 underline text-[#00e8f5]"
              >
                {t.retry}
              </button>
            </div>
          ) : (
            parentReport && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-[#050912] p-4">
                    <p className="text-xs text-[#78879b]">{t.name}</p>
                    <p className="mt-2 font-semibold text-white">{parentReport.studentName}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-[#050912] p-4">
                    <p className="text-xs text-[#78879b]">{t.attendance}</p>
                    <p className="mt-2 font-mono text-xl font-bold text-[#00e8f5] tabular-nums">
                      {parentReport.attendance}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-[#050912] p-4">
                    <p className="text-xs text-[#78879b]">{t.score}</p>
                    <p className="mt-2 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                      {parentReport.quizAvg}%
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#050912] p-4">
                  <h3 className="text-sm font-bold text-white">
                    {language === "ar" ? "ملاحظات" : "Remarks"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{parentReport.remarks}</p>
                </div>
                {parentReport.recommendations.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-white">
                      {language === "ar" ? "التوصيات" : "Recommendations"}
                    </h3>
                    <ul className="list-inside list-disc space-y-2 text-sm text-slate-300">
                      {parentReport.recommendations.map((recommendation, index) => (
                        <li key={`${index}-${recommendation}`}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 7: ANNOUNCEMENTS */}
      {active === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => void handleCreateAnnouncement(e)}
            className="nuclear-glow lg:col-span-5 rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Megaphone size={18} className="text-[#00e8f5]" />
              <h2>{isEn ? "Publish New Academic Notice" : "نشر إعلان أو تحديث محتوى جديد"}</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isEn ? "Announcement Title" : "عنوان الإعلان أو التحديث"}
              </label>
              <input
                type="text"
                required
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                placeholder={
                  isEn
                    ? "e.g., New Reactor Kinetics Lecture Added"
                    : "مثال: إضافة محاضرة جديدة في كينيتيكا المفاعلات"
                }
                className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isEn ? "Details & Instructions" : "التفاصيل والتوجيهات للطلاب"}
              </label>
              <textarea
                rows={3}
                required
                value={newAnnBody}
                onChange={(e) => setNewAnnBody(e.target.value)}
                placeholder={
                  isEn
                    ? "Write full announcement details..."
                    : "اكتب تفاصيل الإعلان ليظهر للطلاب في الإشعارات الذكية..."
                }
                className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isEn ? "Priority" : "الأهمية"}
              </label>
              <select
                value={newAnnPriority}
                onChange={(e) =>
                  setNewAnnPriority(e.target.value as "normal" | "important" | "urgent")
                }
                className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2 text-sm text-white"
              >
                <option value="normal">{isEn ? "Normal" : "عادي"}</option>
                <option value="important">{isEn ? "Important" : "مهم"}</option>
                <option value="urgent">{isEn ? "Urgent" : "عاجل"}</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary nuclear-glow w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-bold cursor-pointer"
            >
              <Plus size={16} />
              <span>{isEn ? "Publish Announcement" : "نشر التحديث فوراً"}</span>
            </button>
          </form>

          <div className="nuclear-glow lg:col-span-7 rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isEn ? "Active Platform Announcements" : "الإعلانات والتحديثات المنشورة حالياً"}
            </h3>
            <div className="space-y-3">
              {announcements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-[#050912] p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#78879b]">
                      <span className="font-semibold text-[#00e8f5]">{item.author}</span>
                      <span>·</span>
                      <span className="font-mono">
                        {new Date(item.createdAt).toLocaleDateString(isEn ? "en-US" : "ar-SA")}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {isEn ? item.titleEn : item.titleAr}
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {isEn ? item.bodyEn : item.bodyAr}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteAnnouncement(item.id)}
                    aria-label={isEn ? "Delete announcement" : "حذف الإعلان"}
                    className="rounded-lg p-2 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ANALYTICS */}
      {active === "analytics" && (
        <div className="space-y-6">
          {securitySummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-5">
                <div className="text-xs text-[#78879b]">
                  {isEn ? "Weekly Active Learners" : "إجمالي التفاعل الأسبوعي"}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-[#00e8f5] tabular-nums">
                  {securitySummary.totalActiveWeek}
                </div>
              </div>
              <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-5">
                <div className="text-xs text-[#78879b]">
                  {isEn ? "Average Quiz Accuracy" : "متوسط دقة حل الاختبارات"}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-emerald-400 tabular-nums">
                  {securitySummary.avgQuizAccuracy}%
                </div>
              </div>
              <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-5">
                <div className="text-xs text-[#78879b]">
                  {isEn ? "Reactor Lab Runs (7 Days)" : "تجارب محاكي المفاعل (7 أيام)"}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-[#ef2b88] tabular-nums">
                  {securitySummary.totalSimulatorSessions}
                </div>
              </div>
            </div>
          )}

          <div className="nuclear-glow overflow-hidden rounded-2xl border border-[#162334] bg-[#090e18]">
            <div className="border-b border-[#162334] p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#00e8f5]" />
                  <span>
                    {isEn
                      ? "Daily Platform Performance Report"
                      : "التقرير التحليلي اليومي لأداء المنصة"}
                  </span>
                </h2>
                <p className="mt-1 text-xs text-[#78879b]">
                  {isEn
                    ? "Daily metrics tracking active learners, completed lessons, reactor simulations, and AI study plans."
                    : "إحصاءات يومية دقيقة لعدد المتعلمين النشطين، الدروس المنجزة، تجارب المحاكاة، وخطط المذاكرة الذكية."}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-start text-sm">
                <thead className="bg-[#060a12] text-xs text-[#78879b] border-b border-[#162334]">
                  <tr>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Date" : "التاريخ"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Active Learners" : "المتعلمون النشطون"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Lessons Completed" : "الدروس المكتملة"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Simulator Runs" : "تجارب المحاكي"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Quiz Accuracy" : "دقة الاختبارات"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Study Plans" : "خطط المذاكرة"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162334] font-mono text-xs tabular-nums">
                  {dailyAnalytics.map((row) => (
                    <tr key={row.date} className="hover:bg-[#0d1424]">
                      <td className="px-4 py-3.5 font-semibold text-white">{row.date}</td>
                      <td className="px-4 py-3.5 text-slate-200">{row.activeLearners}</td>
                      <td className="px-4 py-3.5 text-slate-200">{row.lessonsCompleted}</td>
                      <td className="px-4 py-3.5 text-slate-200">{row.simulatorRuns}</td>
                      <td className="px-4 py-3.5 text-[#00e8f5] font-bold">{row.quizAccuracy}%</td>
                      <td className="px-4 py-3.5 text-slate-200">{row.studyPlansGenerated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: BACKUPS */}
      {active === "backups" && (
        <div className="space-y-6">
          <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DatabaseBackup size={20} className="text-[#00e8f5]" />
                  <span>
                    {isEn
                      ? "Security Architecture & Periodic Backups"
                      : "النظام الأمني والنسخ الاحتياطي الدوري للبيانات"}
                  </span>
                </h2>
                <p className="text-xs leading-6 text-[#78879b] max-w-2xl">
                  {isEn
                    ? "All user passwords use Scrypt cryptographic derivation with random salts. Admin sessions use HMAC-SHA256 HTTP-Only cookies & signed tokens. Generate or export a verified JSON snapshot anytime."
                    : "كافة كلمات المرور مشفرة بخوارزمية Scrypt مع Salt عشوائي، والجلسات موقعة رقمياً بـ HMAC-SHA256. يمكنك إنشاء أو تنزيل نسخة احتياطية كاملة في أي وقت."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleTriggerBackup()}
                  className="btn-primary nuclear-glow inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <RefreshCw size={15} />
                  <span>{isEn ? "Create Snapshot Now" : "إنشاء نسخة احتياطية فورية"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="btn-ghost nuclear-glow inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <Download size={15} />
                  <span>
                    {isEn ? "Download Encrypted JSON Backup" : "تنزيل ملف النسخة الاحتياطية (JSON)"}
                  </span>
                </button>
              </div>
            </div>

            {backupNotice && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300"
              >
                <CheckCircle2 size={16} />
                <span>{backupNotice}</span>
              </div>
            )}

            <div className="overflow-x-auto border-t border-[#162334] pt-4">
              <table className="w-full min-w-[640px] text-start text-sm">
                <thead className="bg-[#060a12] text-xs text-[#78879b] border-b border-[#162334]">
                  <tr>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Backup ID" : "معرف النسخة"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Timestamp" : "توقيت الإنشاء"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Records" : "عدد السجلات"}
                    </th>
                    <th className="px-4 py-3 text-start font-semibold">
                      {isEn ? "Integrity Checksum" : "بصمة التحقق الرقمية"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162334] font-mono text-xs tabular-nums">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-[#0d1424]">
                      <td className="px-4 py-3.5 font-bold text-white">{b.id}</td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {new Date(b.timestamp).toLocaleString(isEn ? "en-US" : "ar-SA")}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{b.accountsCount}</td>
                      <td className="px-4 py-3.5 text-[#00e8f5]" dir="ltr">
                        {b.checksum}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
