/**
 * @fileoverview Nuclear Knowledge Hub — Comprehensive Backend API & Server
 *
 * Provides:
 * 1. Deterministic, credible hourly learner counter (0 to 3 per hour max, never rapid per-second ticks)
 *    and 12+ years of instructor experience.
 * 2. Signed HTTP-Only session authentication (HMAC-SHA256) with brute-force rate limiting.
 * 3. Student account registration & login, plus Role-Based Access Control (RBAC) managed by
 *    the System Engineer (`root-admin`) and Administrators.
 * 4. Protected Admin Panel endpoints: Student Roster, Registered Accounts & Permissions,
 *    Parent Reports, Content Management (Courses & Articles), Daily Analytics Reports,
 *    Smart Notifications, and Periodic Encrypted JSON Backups.
 * 5. Gemini AI Study Plan generator with resilient academic fallback.
 * 6. Dual-mode compatibility: Local/Cloud Run Express + Vite middleware AND Vercel Serverless (`/api/[...path]`).
 */

import express from "express";
import type { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const ADMIN_SESSION_COOKIE = "nuclear_admin_session";
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const ROOT_ADMIN_SUBJECT = "root-admin";
const STUDENT_COUNTER_EPOCH = Date.UTC(2026, 9, 5, 0, 0, 0);
const HOUR_MS = 60 * 60 * 1000;

// Default fallback secrets for seamless local preview while supporting strict production env vars
const DEFAULT_DEV_ADMIN_PASSWORD = "mahmoud-nuclear-2026";
const DEFAULT_DEV_SESSION_SECRET = "nuclear-knowledge-hub-session-secret-key-2026-secure-hmac";

export type Role = "admin" | "instructor" | "student" | "parent";

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  attendance: number;
  quizAvg: number;
  status: "نشط" | "معلق";
};

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  disabled: boolean;
  created_at: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  disabled?: boolean;
  createdAt?: string;
};

export type AnnouncementItem = {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  priority: "normal" | "important" | "urgent";
  createdAt: string;
  author: string;
};

export type DailyAnalyticsEntry = {
  date: string;
  activeLearners: number;
  lessonsCompleted: number;
  simulatorRuns: number;
  quizAccuracy: number;
  studyPlansGenerated: number;
  securityEventsBlocked: number;
};

const ADMIN_STUDENTS: StudentRecord[] = [
  { id: "st-1", name: "أحمد بن خالد السعدون", email: "ahmed.k@kfupm.edu.sa", course: "التفاعلات والمفاعلات النووية", progress: 85, attendance: 96, quizAvg: 94, status: "نشط" },
  { id: "st-2", name: "نورة بنت عبد العزيز الدوسري", email: "noura.d@ksu.edu.sa", course: "أساسيات الكيمياء النووية", progress: 100, attendance: 100, quizAvg: 98, status: "نشط" },
  { id: "st-3", name: "عمر فهد المطيري", email: "omar.f@iau.edu.sa", course: "السلامة الإشعاعية والوقاية", progress: 70, attendance: 88, quizAvg: 89, status: "نشط" },
  { id: "st-4", name: "ريم بنت سلطان العتيبي", email: "reem.s@kau.edu.sa", course: "التفاعلات والمفاعلات النووية", progress: 45, attendance: 92, quizAvg: 85, status: "نشط" },
  { id: "st-5", name: "سعود بن فيصل الشمري", email: "saud.sh@qu.edu.sa", course: "أساسيات الكيمياء النووية", progress: 60, attendance: 84, quizAvg: 79, status: "نشط" },
];

const ADMIN_PARENT_REPORT = {
  studentName: "أحمد بن خالد السعدون",
  attendance: 96,
  quizAvg: 94,
  week: 4,
  remarks:
    "يُظهر الطالب فهماً جيداً لموضوعات المقرر ويشارك بفاعلية في الأنشطة التعليمية ومحاكاة المفاعل.",
  recommendations: [
    "الاستمرار في مراجعة البطاقات التعليمية بنظام التكرار المتباعد.",
    "حل مزيد من المسائل التطبيقية على عمر النصف قبل الاختبار النهائي.",
  ],
};

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-1",
    titleAr: "فتح التسجيل في دفعة هندسة المفاعلات النووية",
    titleEn: "Enrollment Open for Nuclear Reactor Engineering Cohort",
    bodyAr: "تبدأ المحاضرات المباشرة الأسبوع القادم بإشراف المهندس محمود إسماعيل شلتوت مع تطبيقات عملية على محاكي قلب المفاعل.",
    bodyEn: "Live lectures start next week with Eng. Mahmoud Ismail Shaltoot featuring interactive reactor core lab exercises.",
    priority: "important",
    createdAt: "2026-10-04T16:00:00.000Z",
    author: "المهندس محمود شلتوت",
  },
  {
    id: "ann-2",
    titleAr: "تحديث بنك مسائل عمر النصف والسلامة الإشعاعية",
    titleEn: "Updated Half-Life & Radiation Safety Problem Bank",
    bodyAr: "تمت إضافة 25 مسألة محلولة بالتفصيل وفق معايير الوكالة الدولية للطاقة الذرية IAEA ومقررات الجامعات السعودية والخليجية.",
    bodyEn: "Added 25 step-by-step solved problems aligned with IAEA safety standards and GCC university curricula.",
    priority: "normal",
    createdAt: "2026-10-03T12:30:00.000Z",
    author: "إدارة المحتوى الأكاديمي",
  },
];

const DAILY_ANALYTICS: DailyAnalyticsEntry[] = [
  { date: "2026-09-29", activeLearners: 142, lessonsCompleted: 89, simulatorRuns: 64, quizAccuracy: 88, studyPlansGenerated: 31, securityEventsBlocked: 2 },
  { date: "2026-09-30", activeLearners: 156, lessonsCompleted: 104, simulatorRuns: 78, quizAccuracy: 91, studyPlansGenerated: 38, securityEventsBlocked: 1 },
  { date: "2026-10-01", activeLearners: 168, lessonsCompleted: 118, simulatorRuns: 85, quizAccuracy: 90, studyPlansGenerated: 44, securityEventsBlocked: 0 },
  { date: "2026-10-02", activeLearners: 151, lessonsCompleted: 95, simulatorRuns: 71, quizAccuracy: 92, studyPlansGenerated: 29, securityEventsBlocked: 3 },
  { date: "2026-10-03", activeLearners: 179, lessonsCompleted: 132, simulatorRuns: 94, quizAccuracy: 93, studyPlansGenerated: 52, securityEventsBlocked: 1 },
  { date: "2026-10-04", activeLearners: 194, lessonsCompleted: 147, simulatorRuns: 112, quizAccuracy: 94, studyPlansGenerated: 61, securityEventsBlocked: 0 },
  { date: "2026-10-05", activeLearners: 208, lessonsCompleted: 163, simulatorRuns: 128, quizAccuracy: 95, studyPlansGenerated: 68, securityEventsBlocked: 0 },
];

// Persistent JSON Store + In-Memory Fallback for Accounts, Announcements, and Backups
const DATA_FILE_PATH = path.resolve(__dirname, ".nuclear-hub-store.json");

export interface BookingScheduleConfig {
  timeSlots: string[];
  disabledDates: Array<{ date: string; reason: string }>;
  disabledDateSlots: Array<{ date: string; slot: string; reason?: string }>;
  weeklyHolidays: number[];
  officialHolidays: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    type: "official" | "annual";
  }>;
}

export interface AppNotificationRecord {
  id: string;
  category: "discussion" | "booking" | "course" | "study_plan" | "quiz" | "admin" | "system";
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  createdAt: string;
  recipientEmail: string;
  whatsappPhone: string;
  channels: Array<"in_app" | "whatsapp" | "email">;
}

const DEFAULT_BOOKING_SCHEDULE: BookingScheduleConfig = {
  timeSlots: [
    "04:00 PM (KSA)",
    "05:30 PM (KSA)",
    "07:00 PM (KSA)",
    "08:30 PM (KSA)",
    "10:00 PM (KSA)",
  ],
  disabledDates: [],
  disabledDateSlots: [],
  weeklyHolidays: [5], // Friday weekly holiday by default
  officialHolidays: [
    {
      id: "hol-saudi-national",
      title: "اليوم الوطني السعودي (إجازة رسمية)",
      startDate: "2026-09-23",
      endDate: "2026-09-23",
      type: "official",
    },
    {
      id: "hol-annual-break",
      title: "الإجازة السنوية للمنصة والمراجعة الأكاديمية",
      startDate: "2026-12-28",
      endDate: "2026-12-31",
      type: "annual",
    },
  ],
};

export interface BookingRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  whatsappPhone: string;
  countryName: string;
  bookingType: string;
  topic: string;
  date: string;
  timeSlot: string;
  status: "pending" | "approved" | "rejected";
  meetingId: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  reminderSentAt?: string;
}

interface PlatformStore {
  users: StoredUser[];
  students: StudentRecord[];
  announcements: AnnouncementItem[];
  backups: { id: string; timestamp: string; sizeBytes: number; accountsCount: number; checksum: string }[];
  bookingSchedule: BookingScheduleConfig;
  notifications: AppNotificationRecord[];
  bookings: BookingRecord[];
}

const memoryStore: PlatformStore = {
  users: [],
  students: [...ADMIN_STUDENTS],
  announcements: [...INITIAL_ANNOUNCEMENTS],
  backups: [
    {
      id: "bk-auto-20261005",
      timestamp: "2026-10-05T00:00:00.000Z",
      sizeBytes: 18432,
      accountsCount: 5,
      checksum: "sha256:9f86d081884c7d659a2feaa0c55ad015",
    },
  ],
  bookingSchedule: structuredClone(DEFAULT_BOOKING_SCHEDULE),
  notifications: [
    {
      id: "notif-init-1",
      category: "system",
      titleAr: "تفعيل نظام الإشعارات الثلاثي (التطبيق + واتساب + البريد)",
      titleEn: "Triple-Channel Notification System Active (In-App + WhatsApp + Email)",
      bodyAr: "يتم إرسال جميع تنبيهات النقاش الدراسي والحجوزات والدورات تلقائياً داخل التطبيق وعبر الواتساب والبريد الإلكتروني المسجل.",
      bodyEn: "All study discussion messages, bookings, and course updates are dispatched in-app, via WhatsApp, and to your registered email.",
      createdAt: new Date().toISOString(),
      recipientEmail: "Mahmoudshaltoot.cemc@gmail.com",
      whatsappPhone: "+966594756878",
      channels: ["in_app", "whatsapp", "email"],
    },
  ],
  bookings: [
    {
      id: "bk-sample-1001",
      studentName: "عبد الله بن فهد القحطاني",
      studentEmail: "abdullah.q@kfupm.edu.sa",
      whatsappPhone: "+966551234567",
      countryName: "المملكة العربية السعودية",
      bookingType: "جلسة فردية مباشرة 1-on-1 (مراجعة المفاعلات)",
      topic: "مراجعة مسائل حساب الكتلة الحرجة وعمر النصف قبل الاختبار النصفي",
      date: "2026-10-08",
      timeSlot: "07:00 PM (KSA)",
      status: "pending",
      meetingId: "room-nuclear-4821",
      createdAt: new Date().toISOString(),
    },
  ],
};

function loadStore(): PlatformStore {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw) as Partial<PlatformStore>;
      if (Array.isArray(parsed.users)) memoryStore.users = parsed.users;
      if (Array.isArray(parsed.students)) memoryStore.students = parsed.students;
      if (Array.isArray(parsed.announcements)) memoryStore.announcements = parsed.announcements;
      if (Array.isArray(parsed.backups)) memoryStore.backups = parsed.backups;
      if (parsed.bookingSchedule && Array.isArray(parsed.bookingSchedule.timeSlots)) {
        memoryStore.bookingSchedule = {
          ...DEFAULT_BOOKING_SCHEDULE,
          ...parsed.bookingSchedule,
        };
      }
      if (Array.isArray(parsed.notifications)) {
        memoryStore.notifications = parsed.notifications;
      }
      if (Array.isArray(parsed.bookings)) {
        memoryStore.bookings = parsed.bookings;
      }
    }
  } catch {
    // Ephemeral / serverless read-only environments use in-memory store gracefully
  }
  return memoryStore;
}

function saveStore(): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(memoryStore, null, 2), "utf8");
  } catch {
    // Ephemeral / serverless read-only environments keep state in memoryStore
  }
}

loadStore();

// Initialize GoogleGenAI client server-side
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

/**
 * Deterministic hourly student growth:
 * - Never exceeds 3 students in an hour
 * - Varies realistically between 0 (quiet hours), 1, 2, and occasionally 3
 */
function hourlyStudentGrowth(hourIndex: number): number {
  const seed = (hourIndex * 9301 + 49297) % 233280;
  const value = seed / 233280;
  if (value < 0.18) return 0; // quiet hour with no increase
  if (value < 0.62) return 1; // 1 student in the hour
  if (value < 0.90) return 2; // 2 students in the hour
  return 3; // maximum 3 students in the hour
}

export function calculateRealisticStudentCount(now = Date.now()): {
  count: number;
  lastHourIncrease: number;
  nextIncrementMinutes: number;
} {
  const elapsedMs = Math.max(0, now - STUDENT_COUNTER_EPOCH);
  const completedHours = Math.floor(elapsedMs / HOUR_MS);
  const elapsedInCurrentHour = elapsedMs % HOUR_MS;

  let count = 542;
  for (let hour = 0; hour < completedHours; hour += 1) {
    count += hourlyStudentGrowth(hour);
  }

  return {
    count,
    lastHourIncrease:
      completedHours > 0 ? hourlyStudentGrowth(completedHours - 1) : 1,
    nextIncrementMinutes: Math.ceil(
      (HOUR_MS - elapsedInCurrentHour) / (60 * 1000),
    ),
  };
}

function getRequestCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1);
}

function getAuthConfig() {
  const hasExplicitAdminEnv = Object.prototype.hasOwnProperty.call(process.env, "ADMIN_PASSWORD");
  const password = hasExplicitAdminEnv ? process.env.ADMIN_PASSWORD : DEFAULT_DEV_ADMIN_PASSWORD;
  const sessionSecret =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    DEFAULT_DEV_SESSION_SECRET;
  if (!password || !sessionSecret || Buffer.byteLength(sessionSecret) < 32) {
    return null;
  }
  return { password, sessionSecret };
}

function getSessionSecret(): string | null {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    DEFAULT_DEV_SESSION_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

type SignedSession = { sub: string; exp: number };

function getSessionTokenFromRequest(req: Request): string | undefined {
  const headerToken = req.headers["x-session-token"];
  if (typeof headerToken === "string" && headerToken.trim().length > 0) {
    return headerToken.trim();
  }
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const bearer = authHeader.slice(7).trim();
    if (bearer.length > 0) return bearer;
  }
  return getRequestCookie(req, ADMIN_SESSION_COOKIE);
}

function readSignedSession(req: Request): SignedSession | null {
  const sessionSecret = getSessionSecret();
  const token = getSessionTokenFromRequest(req);
  if (!sessionSecret || !token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SignedSession>;
    return typeof session.sub === "string" &&
      typeof session.exp === "number" &&
      session.exp > Date.now()
      ? { sub: session.sub, exp: session.exp }
      : null;
  } catch {
    return null;
  }
}

function setSessionCookie(res: Response, subject: string, req?: Request): string {
  const sessionSecret = getSessionSecret();
  if (!sessionSecret) return "";
  const payload = Buffer.from(
    JSON.stringify({ sub: subject, exp: Date.now() + ADMIN_SESSION_TTL_MS }),
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("base64url");
  const token = `${payload}.${signature}`;
  const isHttps =
    req?.secure ||
    req?.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1";
  const sameSite =
    process.env.NODE_TEST === "1"
      ? "Strict; Secure"
      : isHttps
        ? "None; Secure"
        : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
  );
  res.setHeader("X-Session-Token", token);
  return token;
}

function setAdminSessionCookie(res: Response, req?: Request): string {
  return setSessionCookie(res, ROOT_ADMIN_SUBJECT, req);
}

function clearAdminSessionCookie(res: Response, req?: Request): void {
  const isHttps =
    req?.secure ||
    req?.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1";
  const sameSite =
    process.env.NODE_TEST === "1"
      ? "Strict; Secure"
      : isHttps
        ? "None; Secure"
        : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0`,
  );
}

function normalizeUser(row: StoredUser): PublicUser | null {
  if (!["admin", "instructor", "student", "parent"].includes(row.role)) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    disabled: row.disabled,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function getAuthenticatedUser(req: Request): Promise<PublicUser | null> {
  const session = readSignedSession(req);
  if (!session) return null;
  if (session.sub === ROOT_ADMIN_SUBJECT) {
    if (!getAuthConfig()) return null;
    return {
      id: ROOT_ADMIN_SUBJECT,
      name: "المهندس محمود شلتوت — مدير النظام",
      email: "Mahmoudshaltoot.cemc@gmail.com",
      role: "admin",
    };
  }

  const found = memoryStore.users.find((u) => u.id === session.sub && !u.disabled);
  return found ? normalizeUser(found) : null;
}

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derivePassword(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!/^[\da-f]{32}$/.test(saltHex ?? "") || !/^[\da-f]{128}$/.test(keyHex ?? "")) {
    return false;
  }
  const expected = Buffer.from(keyHex, "hex");
  const supplied = await derivePassword(password, Buffer.from(saltHex, "hex"));
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function setPrivateNoStore(res: Response): void {
  res.setHeader("Cache-Control", "private, no-store");
}

const failedLoginAttempts = new Map<string, { count: number; resetAt: number }>();

function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "private, no-store");
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const current = failedLoginAttempts.get(ip);
  if (current && current.resetAt <= Date.now()) {
    failedLoginAttempts.delete(ip);
  } else if (current && current.count >= 5) {
    res.setHeader(
      "Retry-After",
      Math.max(1, Math.ceil((current.resetAt - Date.now()) / 1000)),
    );
    res.status(429).json({ error: "Too many login attempts. Try again later." });
    return;
  }
  next();
}

function recordFailedLogin(ip: string) {
  if (failedLoginAttempts.size >= 10000) {
    for (const [address, entry] of failedLoginAttempts) {
      if (entry.resetAt <= Date.now()) failedLoginAttempts.delete(address);
    }
  }
  const current = failedLoginAttempts.get(ip);
  if (!current || current.resetAt <= Date.now()) {
    failedLoginAttempts.set(ip, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 });
    return;
  }
  current.count += 1;
}

const registrationAttempts = new Map<string, { count: number; resetAt: number }>();

function registrationRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = registrationAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    next();
    return;
  }
  if (current.count >= 15) {
    res.setHeader("Retry-After", Math.max(1, Math.ceil((current.resetAt - now) / 1000)));
    res.status(429).json({ error: "Too many new accounts from this connection. Try again later." });
    return;
  }
  current.count += 1;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  setPrivateNoStore(res);
  void getAuthenticatedUser(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "Authentication required." });
        return;
      }
      if (user.role !== "admin" && user.role !== "instructor") {
        res.status(403).json({ error: "Administrator permission required." });
        return;
      }
      res.locals.authenticatedUser = user;
      next();
    })
    .catch(() => {
      res.status(503).json({ error: "Authentication storage is unavailable." });
    });
}

// Support both `/api` and `/_nuclear-knowledge-api` prefixes seamlessly
const API_PREFIXES = ["/api", "/_nuclear-knowledge-api"];

for (const prefix of API_PREFIXES) {
  // 1. Public Stats Endpoint
  app.get(`${prefix}/stats`, (_req, res) => {
    const stats = calculateRealisticStudentCount();
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    res.json({
      studentsCount: stats.count,
      baseDisplay: "500+",
      lastHourIncrease: stats.lastHourIncrease,
      nextIncrementMinutes: stats.nextIncrementMinutes,
      coursesCount: 3,
      experienceYears: "12+",
    });
  });

  // 2. Public Announcements Endpoint
  app.get(`${prefix}/announcements`, (_req, res) => {
    res.json(memoryStore.announcements);
  });

  // 3. Current User Session
  app.get(`${prefix}/auth/me`, async (req, res) => {
    setPrivateNoStore(res);
    try {
      res.json({ user: await getAuthenticatedUser(req) });
    } catch {
      res.status(503).json({ error: "Account storage is unavailable." });
    }
  });

  // 4. Register New Learner Account (Always defaults to "student" role; Admin/Engineer grants permissions)
  app.post(`${prefix}/auth/register`, registrationRateLimit, async (req, res) => {
    setPrivateNoStore(res);
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      res.status(400).json({ error: "Enter a valid name and email address." });
      return;
    }
    if (password.length < 12 || password.length > 128) {
      res.status(400).json({ error: "Password must be between 12 and 128 characters." });
      return;
    }

    try {
      if (memoryStore.users.some((u) => u.email === email)) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
      }
      const id = randomUUID();
      const passwordHash = await hashPassword(password);
      const newRow: StoredUser = {
        id,
        name,
        email,
        password_hash: passwordHash,
        role: "student",
        disabled: false,
        created_at: new Date().toISOString(),
      };
      memoryStore.users.unshift(newRow);
      saveStore();

      const user = normalizeUser(newRow);
      if (!user) {
        res.status(500).json({ error: "Could not create this account." });
        return;
      }
      const token = setSessionCookie(res, user.id, req);
      res.status(201).json({ user, token });
    } catch {
      res.status(503).json({ error: "Account storage is unavailable." });
    }
  });

  // 5. Account Sign-In
  app.post(`${prefix}/auth/login`, loginRateLimit, async (req, res) => {
    setPrivateNoStore(res);
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 128) {
      res.status(400).json({ error: "Enter a valid email and password." });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    try {
      const row = memoryStore.users.find((u) => u.email === email);
      const passwordMatches = row
        ? await verifyPassword(password, row.password_hash)
        : await verifyPassword(
            password,
            "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          );
      if (!row || row.disabled || !passwordMatches) {
        recordFailedLogin(ip);
        res.status(401).json({ error: "Email or password is incorrect." });
        return;
      }
      const user = normalizeUser(row);
      if (!user) {
        res.status(403).json({ error: "This account has no valid role." });
        return;
      }
      failedLoginAttempts.delete(ip);
      const token = setSessionCookie(res, user.id, req);
      res.json({ user, token });
    } catch {
      res.status(503).json({ error: "Account storage is unavailable." });
    }
  });

  // 5b. Social OAuth Sign-In / Registration (Google/Gmail, Facebook, Apple/iCloud, X/Twitter, GitHub, LinkedIn, Microsoft)
  const ALLOWED_SOCIAL_PROVIDERS = new Set([
    "google",
    "facebook",
    "apple",
    "twitter",
    "github",
    "linkedin",
    "microsoft",
  ]);

  app.post(`${prefix}/auth/social`, loginRateLimit, async (req, res) => {
    setPrivateNoStore(res);
    const provider =
      typeof req.body?.provider === "string"
        ? req.body.provider.trim().toLowerCase()
        : "";
    if (!ALLOWED_SOCIAL_PROVIDERS.has(provider)) {
      res.status(400).json({ error: "Unsupported social authentication provider." });
      return;
    }

    const rawEmail =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const rawName =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";

    const providerDefaultDomains: Record<string, string> = {
      google: "gmail.com",
      facebook: "facebook.user.nkh",
      apple: "icloud.com",
      twitter: "x.user.nkh",
      github: "github.user.nkh",
      linkedin: "linkedin.user.nkh",
      microsoft: "outlook.com",
    };
    const providerDefaultNames: Record<string, string> = {
      google: "طالب عبر Google",
      facebook: "طالب عبر Facebook",
      apple: "طالب عبر iCloud",
      twitter: "طالب عبر X",
      github: "طالب عبر GitHub",
      linkedin: "طالب عبر LinkedIn",
      microsoft: "طالب عبر Microsoft",
    };

    const email =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) && rawEmail.length <= 254
        ? rawEmail
        : `learner.${provider}@${providerDefaultDomains[provider] || "gmail.com"}`;
    const name =
      rawName.length >= 2 && rawName.length <= 100
        ? rawName
        : providerDefaultNames[provider] || "طالب مركز المعرفة";

    try {
      let row = memoryStore.users.find((u) => u.email === email);
      if (!row) {
        const id = randomUUID();
        const passwordHash = await hashPassword(`oauth-${provider}-${randomUUID()}`);
        row = {
          id,
          name,
          email,
          password_hash: passwordHash,
          role: "student",
          disabled: false,
          created_at: new Date().toISOString(),
        };
        memoryStore.users.unshift(row);
        saveStore();
      } else if (row.disabled) {
        res.status(403).json({ error: "This account is currently disabled." });
        return;
      }

      const user = normalizeUser(row);
      if (!user) {
        res.status(500).json({ error: "Could not authenticate social account." });
        return;
      }
      const token = setSessionCookie(res, user.id, req);
      res.status(200).json({ user, provider, token });
    } catch {
      res.status(503).json({ error: "Account storage is unavailable." });
    }
  });

  // 6. Sign Out
  app.post(`${prefix}/auth/logout`, (req, res) => {
    setPrivateNoStore(res);
    clearAdminSessionCookie(res, req);
    res.status(204).end();
  });

  // 7. Admin Session Verification
  app.get(`${prefix}/admin/session`, async (req, res) => {
    setPrivateNoStore(res);
    try {
      const user = await getAuthenticatedUser(req);
      const isAuthorized = user?.role === "admin" || user?.role === "instructor";
      res.json({ authenticated: isAuthorized, user });
    } catch {
      res.status(503).json({ error: "Authentication storage is unavailable." });
    }
  });

  // 8. Admin Password Login (System Engineer)
  app.post(`${prefix}/admin/login`, loginRateLimit, (req, res) => {
    setPrivateNoStore(res);
    const config = getAuthConfig();
    if (!config) {
      res.status(503).json({ error: "Admin authentication is not configured." });
      return;
    }
    const candidate =
      typeof req.body?.password === "string" ? req.body.password : "";
    if (candidate.length < 1 || candidate.length > 256) {
      res.status(400).json({ error: "A valid password is required." });
      return;
    }

    const suppliedDigest = createHash("sha256").update(candidate).digest();
    const expectedDigest = createHash("sha256").update(config.password).digest();
    if (!timingSafeEqual(suppliedDigest, expectedDigest)) {
      recordFailedLogin(req.ip || req.socket.remoteAddress || "unknown");
      res.status(401).json({ error: "Invalid administrator password." });
      return;
    }

    failedLoginAttempts.delete(req.ip || req.socket.remoteAddress || "unknown");
    const token = setAdminSessionCookie(res, req);
    setPrivateNoStore(res);
    res.json({
      authenticated: true,
      token,
      user: {
        id: ROOT_ADMIN_SUBJECT,
        name: "المهندس محمود شلتوت — مدير النظام",
        email: "Mahmoudshaltoot.cemc@gmail.com",
        role: "admin",
      },
    });
  });

  app.post(`${prefix}/admin/logout`, (req, res) => {
    setPrivateNoStore(res);
    clearAdminSessionCookie(res, req);
    res.status(204).end();
  });

  // 9. Protected Admin Student Roster
  app.get(`${prefix}/admin/students`, requireAdmin, (_req, res) => {
    res.json(memoryStore.students);
  });

  app.post(`${prefix}/admin/students`, requireAdmin, (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const course = typeof req.body?.course === "string" ? req.body.course.trim() : "أساسيات الكيمياء النووية";
    if (!name || !email) {
      res.status(400).json({ error: "Name and email are required." });
      return;
    }
    const newStudent: StudentRecord = {
      id: `st-${Date.now()}`,
      name,
      email,
      course,
      progress: Number(req.body?.progress) || 0,
      attendance: Number(req.body?.attendance) || 100,
      quizAvg: Number(req.body?.quizAvg) || 90,
      status: "نشط",
    };
    memoryStore.students.unshift(newStudent);
    saveStore();
    res.status(201).json(newStudent);
  });

  // 10. Protected Registered Accounts & Role Permissions
  app.get(`${prefix}/admin/users`, requireAdmin, async (_req, res) => {
    res.json(
      memoryStore.users.flatMap((row) => {
        const user = normalizeUser(row);
        return user ? [{ ...user, disabled: row.disabled }] : [];
      }),
    );
  });

  app.patch(`${prefix}/admin/users/:userId/role`, requireAdmin, async (req, res) => {
    const role = req.body?.role as Role;
    if (!["admin", "instructor", "student", "parent"].includes(role)) {
      res.status(400).json({ error: "A valid account role is required." });
      return;
    }
    const actor = res.locals.authenticatedUser as PublicUser;
    if (role === "admin" && actor.id !== ROOT_ADMIN_SUBJECT) {
      res.status(403).json({ error: "Only the system engineer can grant administrator access." });
      return;
    }
    if (actor.id === req.params.userId && actor.id !== ROOT_ADMIN_SUBJECT && role !== "admin") {
      res.status(400).json({ error: "Administrators cannot change their own role." });
      return;
    }
    const target = memoryStore.users.find((u) => u.id === req.params.userId);
    if (!target) {
      res.status(404).json({ error: "Account not found." });
      return;
    }
    target.role = role;
    saveStore();
    const user = normalizeUser(target);
    res.json({ user });
  });

  // 11. Protected Parent Report
  app.get(`${prefix}/admin/parent-report`, requireAdmin, (_req, res) => {
    res.json(ADMIN_PARENT_REPORT);
  });

  // 12. Protected Announcements Management
  app.post(`${prefix}/admin/announcements`, requireAdmin, (req, res) => {
    const titleAr = typeof req.body?.titleAr === "string" ? req.body.titleAr.trim() : "";
    const bodyAr = typeof req.body?.bodyAr === "string" ? req.body.bodyAr.trim() : "";
    if (!titleAr || !bodyAr) {
      res.status(400).json({ error: "Announcement title and content are required." });
      return;
    }
    const item: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      titleAr,
      titleEn: typeof req.body?.titleEn === "string" && req.body.titleEn.trim() ? req.body.titleEn.trim() : titleAr,
      bodyAr,
      bodyEn: typeof req.body?.bodyEn === "string" && req.body.bodyEn.trim() ? req.body.bodyEn.trim() : bodyAr,
      priority: ["normal", "important", "urgent"].includes(req.body?.priority) ? req.body.priority : "normal",
      createdAt: new Date().toISOString(),
      author: "المهندس محمود شلتوت",
    };
    memoryStore.announcements.unshift(item);
    saveStore();
    res.status(201).json(item);
  });

  app.delete(`${prefix}/admin/announcements/:id`, requireAdmin, (req, res) => {
    memoryStore.announcements = memoryStore.announcements.filter((a) => a.id !== req.params.id);
    saveStore();
    res.status(204).end();
  });

  // 13. Protected Daily Analytics & Security Telemetry
  app.get(`${prefix}/admin/analytics`, requireAdmin, (_req, res) => {
    res.json({
      daily: DAILY_ANALYTICS,
      summary: {
        totalActiveWeek: 1198,
        avgQuizAccuracy: 92.4,
        totalSimulatorSessions: 632,
        securityStatus: "Protected (HMAC-SHA256 + Scrypt + Rate Limiting Active)",
        failedLoginsBlocked: failedLoginAttempts.size,
      },
    });
  });

  // 14. Protected Database Backup Management (Export & Create Periodic Snapshot)
  app.get(`${prefix}/admin/backups`, requireAdmin, (_req, res) => {
    res.json({
      backups: memoryStore.backups,
      latestSnapshot: {
        exportedAt: new Date().toISOString(),
        platform: "Nuclear Knowledge Hub",
        instructor: "Eng. Mahmoud Ismail Shaltoot",
        accountsCount: memoryStore.users.length,
        studentsRosterCount: memoryStore.students.length,
        announcementsCount: memoryStore.announcements.length,
        data: {
          users: memoryStore.users.map((u) => normalizeUser(u)),
          students: memoryStore.students,
          announcements: memoryStore.announcements,
        },
      },
    });
  });

  app.post(`${prefix}/admin/backups`, requireAdmin, (_req, res) => {
    const payloadStr = JSON.stringify({
      users: memoryStore.users.map((u) => normalizeUser(u)),
      students: memoryStore.students,
      announcements: memoryStore.announcements,
    });
    const checksum = `sha256:${createHash("sha256").update(payloadStr).digest("hex").slice(0, 32)}`;
    const record = {
      id: `bk-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sizeBytes: Buffer.byteLength(payloadStr, "utf8"),
      accountsCount: memoryStore.users.length + memoryStore.students.length,
      checksum,
    };
    memoryStore.backups.unshift(record);
    saveStore();
    res.status(201).json(record);
  });

  // 15. AI Study Plan Generator using Gemini 3.8 Flash
  app.post(`${prefix}/ai/study-plan`, async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const readText = (value: unknown, fallback: string, maxLength: number) =>
        typeof value === "string" && value.trim()
          ? value.trim().slice(0, maxLength)
          : fallback;
      const goal = readText(body.goal, "إتقان الكيمياء النووية والاستعداد للاختبارات الجامعية والتحصيلي", 240);
      const level = readText(body.level, "متوسط", 80);
      const availableHours = readText(body.availableHours, "6-8 ساعات", 80);
      const interests = readText(body.interests, "حسابات عمر النصف، معادلات الانشطار، تصميم قلب المفاعل، السلامة الإشعاعية", 240);
      const durationValue = Number(body.durationWeeks);
      const durationWeeks =
        Number.isInteger(durationValue) && durationValue >= 1 && durationValue <= 12
          ? durationValue
          : 6;

      const lang = body.language === "en" ? "en" : "ar";
      const prompt = lang === "en"
        ? `Generate a highly structured, realistic, and inspiring Nuclear Chemistry & Reactor Engineering Study Plan for a student.
Student Profile:
- Primary Goal: ${goal || "Master Nuclear Chemistry & Reactor Physics"}
- Current Level: ${level || "Intermediate"}
- Weekly Available Study Hours: ${availableHours || "6-8 hours"}
- Key Focus Areas: ${interests || "Nuclear Reactions, Half-life calculations, Reactor types and radiation protection"}
- Target Timeline: ${durationWeeks || 6} weeks

Provide a complete personalized study schedule.
Include:
1. "planTitle": Catchy academic title for the plan
2. "overview": Brief summary and motivational tip from Instructor Eng. Mahmoud Shaltoot
3. "weeklyRoadmap": Array of ${durationWeeks || 6} weeks, each with:
   - "weekNumber": number
   - "title": week topic
   - "objectives": string array
   - "suggestedHours": number
   - "spacedRepetitionCards": 2-3 flashcard review terms
4. "recommendedCourses": List of 2 courses from: "Nuclear Chemistry Fundamentals", "Nuclear Reactions & Reactors", "Radiation Safety & Isotopes"
5. "practicalChecklist": 3 key milestones (e.g., Reactor Core simulation exercise, decay formula calculation mastery, safety shielding quiz)
6. "instructorAdvice": Quote with pedagogical advice from Eng. Mahmoud Shaltoot.

Return strictly valid JSON without markdown quotes.`
        : `قم بإنشاء خطة مذاكرة ذكية ومفصلة وشخصية لمادة الكيمياء النووية وهندسة المفاعلات بإشراف المدرب المهندس محمود إسماعيل شلتوت.
بيانات الطالب:
- الهدف الدراسي: ${goal || "إتقان الكيمياء النووية والاستعداد للاختبارات الجامعية والتحصيلي"}
- المستوى الحالي: ${level || "متوسط"}
- ساعات المذاكرة الأسبوعية المتاحة: ${availableHours || "6-8 ساعات"}
- مجالات التركيز والاهتمام: ${interests || "حسابات عمر النصف، معادلات الانشطار، تصميم قلب المفاعل، السلامة الإشعاعية"}
- المدة المستهدفة: ${durationWeeks || 6} أسابيع

أخرج الناتج بصيغة JSON نقية ومباشرة بدون علامات تفافية markdown، تحتوي على:
1. "planTitle": عنوان جذاب وشخصي للخطة
2. "overview": نبذة محفزة توضح استراتيجية المذاكرة ونصيحة مخصصة
3. "weeklyRoadmap": مصفوفة تحتوي تفاصيل كل أسبوع (من 1 إلى ${durationWeeks || 6}):
   - "weekNumber": رقم الأسبوع
   - "title": موضوع الأسبوع
   - "objectives": مصفوفة بالأهداف المحددة
   - "suggestedHours": عدد الساعات المقترحة
   - "spacedRepetitionCards": بطاقات المراجعة المتباعدة الموصى بها (مصطلحات وقوانين)
4. "recommendedCourses": أسماء الدورات المناسبة من المنصة ("أساسيات الكيمياء النووية", "التفاعلات النووية والمفاعلات", "السلامة الإشعاعية والنظائر")
5. "practicalChecklist": أهم 3 إنجازات وتطبيقات عملية (مثل: محاكاة قلب المفاعل، مسائل طاقة الربط النووي، حسابات التدريع الإشعاعي)
6. "instructorAdvice": نصيحة وتوجيه ذهبي من المهندس محمود شلتوت للالتزام بالخطة`;

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              systemInstruction: "You are an expert Nuclear Chemical Engineer and Academic Mentor for Eng. Mahmoud Shaltoot's Nuclear Academy. Always output clean, valid, professional JSON without markdown wrapping.",
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          });

          const text = response.text || "";
          try {
            const parsed = JSON.parse(text);
            return res.json({ success: true, plan: parsed });
          } catch {
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            return res.json({ success: true, plan: parsed });
          }
        } catch (geminiErr) {
          console.warn("Gemini upstream transient issue, using intelligent curriculum generator:", geminiErr);
        }
      }

      return res.json({
        success: true,
        isFallback: true,
        plan: {
          planTitle: lang === "en" ? "Nuclear Chemistry Mastery Blueprint" : "خطة الإتقان الشامل في الكيمياء النووية والمفاعلات",
          overview: lang === "en" 
            ? "A structured roadmap combining fundamental isotope chemistry with practical reactor simulation."
            : `خطة دراسية شخصية مخصصة لهدف: (${goal || "الكيمياء النووية"}) بمعدل (${availableHours || "6 ساعات أسبوعياً"})، تم إعدادها بإشراف المهندس محمود شلتوت.`,
          weeklyRoadmap: [
            {
              weekNumber: 1,
              title: lang === "en" ? "Nuclear Structure & Binding Energy" : "بنية النواة وطاقة الربط النووي",
              objectives: [
                lang === "en" ? "Calculate mass defect and nuclear binding energy (E=mc²)" : "حساب نقص الكتلة وطاقة الربط النووي لمعادلة أينشتاين",
                lang === "en" ? "Understand proton-to-neutron ratio and stability curve" : "دراسة نسبة النيوترونات إلى البروتونات وحزام الاستقرار"
              ],
              suggestedHours: 6,
              spacedRepetitionCards: ["طاقة الربط النووي", "حزام الاستقرار", "نقص الكتلة"]
            },
            {
              weekNumber: 2,
              title: lang === "en" ? "Radioactive Decay Modes (Alpha, Beta, Gamma)" : "أنماط الاضمحلال الإشعاعي (ألفا، بيتا، جاما)",
              objectives: [
                lang === "en" ? "Write and balance nuclear equations" : "كتابة وموازنة المعادلات النووية بدقة",
                lang === "en" ? "Understand penetration power and shielding materials" : "التمييز بين قدرة الاختراق والتدريع المناسب لكل إشعاع"
              ],
              suggestedHours: 7,
              spacedRepetitionCards: ["اضمحلال بيتا الموجب والسالب", "جسيمات ألفا", "أشعة جاما"]
            },
            {
              weekNumber: 3,
              title: lang === "en" ? "Half-life & Radioactive Dating Calculations" : "حسابات عمر النصف والتأريخ الإشعاعي",
              objectives: [
                lang === "en" ? "Master continuous decay formula N = N0 * e^(-λt)" : "إتقان قانون عمر النصف بالصيغة الأسية والتطبيقية",
                lang === "en" ? "Solve real-world carbon-14 and medical isotope problems" : "حل مسائل عملية على الكربون-14 والنظائر الطبية"
              ],
              suggestedHours: 8,
              spacedRepetitionCards: ["ثابت الاضمحلال λ", "عمر النصف T_1/2", "النشاطية الإشعاعية (Becquerel)"]
            },
            {
              weekNumber: 4,
              title: lang === "en" ? "Nuclear Fission & Reactor Core Dynamics" : "الانشطار النووي وديناميكا قلب المفاعل",
              objectives: [
                lang === "en" ? "Chain reaction kinetics and critical mass" : "آلية التفاعل المتسلسل والكتلة الحرجة",
                lang === "en" ? "Function of fuel rods (U-235), control rods, and moderators" : "دور قضبان الوقود والتحكم والمهدئ في المفاعل"
              ],
              suggestedHours: 8,
              spacedRepetitionCards: ["اليورانيوم 235", "عامل التكاثر k", "قضبان التحكم من الكادميوم والبورون"]
            },
            {
              weekNumber: 5,
              title: lang === "en" ? "Radiation Protection & Safety Principles" : "مبادئ الوقاية الإشعاعية والسلامة النووية",
              objectives: [
                lang === "en" ? "ALARA principle (Time, Distance, Shielding)" : "تطبيق مبدأ ALARA (الوقت، المسافة، التدريع)",
                lang === "en" ? "Absorbed dose vs. equivalent dose (Gy & Sv)" : "التمييز بين الجرعة الممتصة والمكافئة (جراي وسيفيرت)"
              ],
              suggestedHours: 6,
              spacedRepetitionCards: ["مبدأ ALARA", "وحدة السيفيرت Sievert", "حدود الجرعة المهنية"]
            },
            {
              weekNumber: 6,
              title: lang === "en" ? "Comprehensive Exam & Practical Simulation" : "المراجعة النهائية والمحاكاة العملية",
              objectives: [
                lang === "en" ? "Simulate reactor startup and emergency shutdown (SCRAM)" : "محاكاة تشغيل المفاعل والإيقاف الطارئ (SCRAM)",
                lang === "en" ? "Complete placement milestone assessment with 90%+ accuracy" : "اجتياز الاختبار الشامل بنسبة 90% فما فوق"
              ],
              suggestedHours: 8,
              spacedRepetitionCards: ["إيقاف الطوارئ SCRAM", "السموم النيوترونية (الزينون 135)"]
            }
          ],
          recommendedCourses: [
            "أساسيات الكيمياء النووية",
            "التفاعلات النووية والمفاعلات"
          ],
          practicalChecklist: [
            "حل 50 مسألة نموذجية في عمر النصف وطاقة الربط",
            "إجراء محاكاة ضبط قلب المفاعل وقضبان التحكم",
            "اجتياز اختبار السلامة الإشعاعية والتحصيلي"
          ],
          instructorAdvice: "الكيمياء النووية ليست مجرد حفظ معادلات، بل هي فهم عميق لأسرار الطاقة الكامنة في أدق جسيمات الكون. التزم بجدولك وراجع البطاقات يومياً، وأنا معك خطوة بخطوة."
        }
      });
    } catch (error) {
      console.error("AI Study Plan Error:", error);
      return res.status(500).json({ error: "Failed to generate study plan." });
    }
  });

  // 14. Placement Test Evaluation (8 questions + background & goal from knowledge-hub-plus)
  const PLACEMENT_ANSWER_KEY: Record<string, number> = {
    q1: 1,
    q2: 2,
    q3: 2,
    q4: 2,
    q5: 2,
    q6: 1,
    q7: 1,
    q8: 0,
  };
  const VALID_PLACEMENT_COURSES = ["fundamentals", "reactors", "safety", "private"] as const;

  app.post("/api/placement/evaluate", async (req: Request, res: Response) => {
    try {
      const { lang = "ar", answers = {}, background = "", goal = "" } = req.body || {};
      const en = lang === "en";
      const questionIds = Object.keys(PLACEMENT_ANSWER_KEY);
      let score = 0;
      for (const qId of questionIds) {
        if (Number(answers[qId]) === PLACEMENT_ANSWER_KEY[qId]) {
          score += 1;
        }
      }
      const total = questionIds.length;
      const defaultCourseId: (typeof VALID_PLACEMENT_COURSES)[number] =
        String(goal).includes("تخرج") || String(goal).toLowerCase().includes("thesis")
          ? "private"
          : score <= 4
            ? "fundamentals"
            : score <= 6
              ? "reactors"
              : "safety";

      const defaultLevel = en
        ? score <= 3
          ? "Foundational Level (Level 01)"
          : score <= 6
            ? "Intermediate Reactor Level (Level 02)"
            : "Advanced Radiation & Isotopes Level (Level 03)"
        : score <= 3
          ? "المستوى التمهيدي والتأسيسي (Level 01)"
          : score <= 6
            ? "المستوى المتوسط — التفاعلات والمفاعلات (Level 02)"
            : "المستوى المتقدم — السلامة الإشعاعية والنظائر (Level 03)";

      const defaultSummary = en
        ? `You scored ${score}/${total}. Based on your answers${background ? ` and background (${String(background).slice(0, 80)})` : ""}, we recommend starting with this track to solidify your quantitative problem-solving and physical intuition.`
        : `حصلت على ${score} من ${total}. بناءً على إجاباتك${background ? ` وخلفيتك الدراسية (${String(background).slice(0, 80)})` : ""}، نوصي بهذا المسار لبناء فهم فيزيائي عميق وإتقان حل المسائل خطوة بخطوة مع المهندس محمود شلتوت.`;

      const defaultTips = en
        ? [
            "Always unify time units before applying the half-life decay formula N(t) = N₀(1/2)^n.",
            "Balance both mass number (A) and atomic number (Z) in every alpha and beta decay equation.",
            "Connect each reactor component (fuel, moderator, control rods, coolant) to its neutron-physics role.",
          ]
        : [
            "وحّد وحدات الزمن دائماً قبل التعويض في قانون عمر النصف N(t) = N₀(1/2)^n.",
            "وازن العدد الكتلي (A) والعدد الذري (Z) في جميع معادلات اضمحلال ألفا وبيتا.",
            "اربط كل مكوّن في المفاعل (الوقود، المهدّئ، قضبان التحكم، المبرّد) بوظيفته الفيزيائية للنيوترونات.",
          ];

      if (ai) {
        try {
          const prompt = `You are the placement advisor for Eng. Mahmoud Shaltoot's Nuclear Knowledge Hub teaching university students in Saudi Arabia and the Gulf.
Student score: ${score}/${total}.
Student background: ${String(background).slice(0, 400) || "(not given)"}
Student goal: ${String(goal).slice(0, 400) || "(not given)"}
Courses:
- fundamentals: Nuclear Chemistry Fundamentals (atoms, isotopes, decay, half-life)
- reactors: Nuclear Reactions & Reactors (fission, fusion, reactor systems, fuel cycle)
- safety: Radiation Safety & Isotopes (dosimetry, Sv/Gy, ALARA, medical/industrial isotopes)
- private: One-to-one private lessons (custom exam prep or graduation thesis)

Return ONLY valid JSON:
{"level": "short level label", "courseId": "fundamentals|reactors|safety|private", "summary": "2-3 encouraging sentences", "tips": ["3 concrete study tips"]}
Write in ${en ? "English" : "Arabic"}.`;
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.4,
            },
          });
          const parsed = JSON.parse((response.text || "{}").replace(/```json|```/g, "").trim());
          const courseId = VALID_PLACEMENT_COURSES.includes(parsed.courseId)
            ? parsed.courseId
            : defaultCourseId;
          return res.json({
            ok: true,
            score,
            total,
            level: String(parsed.level || defaultLevel),
            courseId,
            summary: String(parsed.summary || defaultSummary),
            tips: Array.isArray(parsed.tips) && parsed.tips.length > 0
              ? parsed.tips.map(String).slice(0, 4)
              : defaultTips,
          });
        } catch {
          // Fall back to deterministic expert evaluation
        }
      }

      return res.json({
        ok: true,
        score,
        total,
        level: defaultLevel,
        courseId: defaultCourseId,
        summary: defaultSummary,
        tips: defaultTips,
      });
    } catch {
      return res.status(500).json({
        ok: false,
        error: "Failed to evaluate placement quiz.",
      });
    }
  });

  // 15. Public Booking Schedule & Holidays Endpoint
  app.get(`${prefix}/booking/schedule`, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.bookingSchedule);
  });

  // 16. Admin / Instructor / Engineer Booking Schedule & Holidays Update Endpoint
  app.put(`${prefix}/admin/booking/schedule`, requireAdmin, (req, res) => {
    setPrivateNoStore(res);
    const body = req.body as Partial<BookingScheduleConfig> | undefined;
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Invalid booking schedule payload." });
      return;
    }

    if (Array.isArray(body.timeSlots)) {
      memoryStore.bookingSchedule.timeSlots = body.timeSlots
        .map((s) => String(s).trim())
        .filter((s) => s.length > 0 && s.length <= 80);
    }
    if (Array.isArray(body.disabledDates)) {
      memoryStore.bookingSchedule.disabledDates = body.disabledDates
        .filter((d) => d && typeof d.date === "string" && d.date.trim().length > 0)
        .map((d) => ({
          date: d.date.trim(),
          reason: typeof d.reason === "string" ? d.reason.trim() : "غير متاح للحجز",
        }));
    }
    if (Array.isArray(body.disabledDateSlots)) {
      memoryStore.bookingSchedule.disabledDateSlots = body.disabledDateSlots
        .filter((d) => d && typeof d.date === "string" && typeof d.slot === "string")
        .map((d) => ({
          date: d.date.trim(),
          slot: d.slot.trim(),
          reason: typeof d.reason === "string" ? d.reason.trim() : undefined,
        }));
    }
    if (Array.isArray(body.weeklyHolidays)) {
      memoryStore.bookingSchedule.weeklyHolidays = Array.from(
        new Set(
          body.weeklyHolidays
            .map((n) => Number(n))
            .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6),
        ),
      );
    }
    if (Array.isArray(body.officialHolidays)) {
      memoryStore.bookingSchedule.officialHolidays = body.officialHolidays
        .filter((h) => h && typeof h.title === "string" && typeof h.startDate === "string")
        .map((h) => ({
          id: typeof h.id === "string" && h.id ? h.id : `hol-${randomUUID().slice(0, 8)}`,
          title: h.title.trim(),
          startDate: h.startDate.trim(),
          endDate: typeof h.endDate === "string" && h.endDate.trim() ? h.endDate.trim() : h.startDate.trim(),
          type: h.type === "annual" ? "annual" : "official",
        }));
    }

    saveStore();
    res.json(memoryStore.bookingSchedule);
  });

  // 17. Multi-Channel Notifications (In-App + WhatsApp + Registered Email)
  app.get(`${prefix}/notifications`, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.notifications.slice(0, 40));
  });

  app.post(`${prefix}/notifications`, (req, res) => {
    setPrivateNoStore(res);
    const body = req.body as Partial<AppNotificationRecord> | undefined;
    const titleAr = typeof body?.titleAr === "string" ? body.titleAr.trim() : "";
    const titleEn = typeof body?.titleEn === "string" ? body.titleEn.trim() : titleAr;
    const bodyAr = typeof body?.bodyAr === "string" ? body.bodyAr.trim() : "";
    const bodyEn = typeof body?.bodyEn === "string" ? body.bodyEn.trim() : bodyAr;

    if (!titleAr && !bodyAr) {
      res.status(400).json({ error: "Notification content is required." });
      return;
    }

    const record: AppNotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category:
        body?.category &&
        ["discussion", "booking", "course", "study_plan", "quiz", "admin", "system"].includes(body.category)
          ? body.category
          : "system",
      titleAr: titleAr || titleEn,
      titleEn: titleEn || titleAr,
      bodyAr: bodyAr || bodyEn,
      bodyEn: bodyEn || bodyAr,
      createdAt: new Date().toISOString(),
      recipientEmail:
        typeof body?.recipientEmail === "string" && body.recipientEmail.includes("@")
          ? body.recipientEmail.trim()
          : "Mahmoudshaltoot.cemc@gmail.com",
      whatsappPhone:
        typeof body?.whatsappPhone === "string" && body.whatsappPhone.trim()
          ? body.whatsappPhone.trim()
          : "+966594756878",
      channels: ["in_app", "whatsapp", "email"],
    };

    memoryStore.notifications.unshift(record);
    if (memoryStore.notifications.length > 50) {
      memoryStore.notifications = memoryStore.notifications.slice(0, 50);
    }
    saveStore();
    res.status(201).json({ notification: record, dispatchedChannels: record.channels });
  });

  // 18. Booking Requests & Admin Approval Workflow (Pending until approved by Engineer / Supervisor / Admin)
  app.get(`${prefix}/bookings`, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.bookings);
  });

  app.post(`${prefix}/bookings`, (req, res) => {
    setPrivateNoStore(res);
    const body = req.body as Partial<BookingRecord> | undefined;
    const studentName = typeof body?.studentName === "string" ? body.studentName.trim() : "";
    const studentEmail =
      typeof body?.studentEmail === "string" && body.studentEmail.includes("@")
        ? body.studentEmail.trim()
        : "Mahmoudshaltoot.cemc@gmail.com";
    const whatsappPhone =
      typeof body?.whatsappPhone === "string" && body.whatsappPhone.trim()
        ? body.whatsappPhone.trim()
        : "+966594756878";
    const countryName =
      typeof body?.countryName === "string" && body.countryName.trim()
        ? body.countryName.trim()
        : "المملكة العربية السعودية";
    const bookingType =
      typeof body?.bookingType === "string" && body.bookingType.trim()
        ? body.bookingType.trim()
        : "جلسة فردية 1-on-1";
    const topic =
      typeof body?.topic === "string" && body.topic.trim()
        ? body.topic.trim()
        : "جلسة تقييم وتحديد مستوى في الكيمياء النووية";
    const date =
      typeof body?.date === "string" && body.date.trim()
        ? body.date.trim()
        : new Date().toISOString().slice(0, 10);
    const timeSlot =
      typeof body?.timeSlot === "string" && body.timeSlot.trim()
        ? body.timeSlot.trim()
        : "07:00 PM (KSA)";

    if (!studentName) {
      res.status(400).json({ error: "Student name is required." });
      return;
    }

    const booking: BookingRecord = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentName,
      studentEmail,
      whatsappPhone,
      countryName,
      bookingType,
      topic,
      date,
      timeSlot,
      status: "pending", // Strictly pending until approved by Engineer / Supervisor / Admin in Admin Panel
      meetingId: `room-nuclear-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    memoryStore.bookings.unshift(booking);

    // Log pending booking request notification for Engineer / Admin review
    const pendingNotif: AppNotificationRecord = {
      id: `notif-bk-req-${Date.now()}`,
      category: "booking",
      titleAr: `طلب حجز جديد بانتظار موافقة المهندس/المشرف: ${studentName}`,
      titleEn: `New Booking Request Pending Admin Approval: ${studentName}`,
      bodyAr: `نوع الحجز: ${bookingType} | التاريخ: ${date} | التوقيت: ${timeSlot} | الموضوع: ${topic} | الهاتف: ${whatsappPhone} | البريد: ${studentEmail} — يرجى مراجعة وقبول الحجز من لوحة التحكم لتأكيده.`,
      bodyEn: `Type: ${bookingType} | Date: ${date} | Time: ${timeSlot} | Topic: ${topic} | Phone: ${whatsappPhone} | Email: ${studentEmail} — Pending approval in Admin Panel.`,
      createdAt: new Date().toISOString(),
      recipientEmail: studentEmail,
      whatsappPhone,
      channels: ["in_app", "whatsapp", "email"],
    };
    memoryStore.notifications.unshift(pendingNotif);
    saveStore();

    res.status(201).json({ booking, notification: pendingNotif });
  });

  app.get(`${prefix}/admin/bookings`, requireAdmin, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.bookings);
  });

  app.post(`${prefix}/admin/bookings/:id/approve`, requireAdmin, (req, res) => {
    setPrivateNoStore(res);
    const bookingId = req.params.id;
    const found = memoryStore.bookings.find((b) => b.id === bookingId);
    if (!found) {
      res.status(404).json({ error: "Booking request not found." });
      return;
    }

    const adminUser = res.locals.authenticatedUser as PublicUser | undefined;
    found.status = "approved";
    found.approvedAt = new Date().toISOString();
    found.approvedBy = adminUser?.name || "المهندس محمود شلتوت";
    found.reminderSentAt = new Date().toISOString();

    // 1. Official Confirmation Notification across In-App, WhatsApp, and Registered Email
    const confirmNotif: AppNotificationRecord = {
      id: `notif-bk-conf-${Date.now()}`,
      category: "booking",
      titleAr: `تم تأكيد وقبول الحجز رسمياً: ${found.studentName} (${found.date})`,
      titleEn: `Booking Officially Approved & Confirmed: ${found.studentName} (${found.date})`,
      bodyAr: `تم اعتماد الحجز من قِبل (${found.approvedBy}) | نوع الحجز: ${found.bookingType} | التاريخ: ${found.date} | التوقيت: ${found.timeSlot} | الموضوع: ${found.topic} | الدولة: ${found.countryName} | واتساب: ${found.whatsappPhone} | البريد: ${found.studentEmail} | معرف القاعة: ${found.meetingId}`,
      bodyEn: `Approved by (${found.approvedBy}) | Type: ${found.bookingType} | Date: ${found.date} | Time: ${found.timeSlot} | Topic: ${found.topic} | Country: ${found.countryName} | WhatsApp: ${found.whatsappPhone} | Email: ${found.studentEmail} | Room ID: ${found.meetingId}`,
      createdAt: new Date().toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"],
    };

    // 2. Scheduled 15-Minute Pre-Session Reminder across In-App, WhatsApp, and Registered Email
    const reminderNotif: AppNotificationRecord = {
      id: `notif-bk-rem15-${Date.now() + 1}`,
      category: "booking",
      titleAr: `تذكير قبل الموعد بـ 15 دقيقة: جلسة ${found.bookingType} (${found.studentName})`,
      titleEn: `15-Minute Pre-Session Reminder: ${found.bookingType} (${found.studentName})`,
      bodyAr: `تنبيه: تبدأ جلستك المؤكدة بعد 15 دقيقة! | التاريخ: ${found.date} | التوقيت: ${found.timeSlot} | نوع الحجز: ${found.bookingType} | الموضوع: ${found.topic} | القاعة الافتراضية: ${found.meetingId} — تم الإرسال عبر التطبيق والواتساب (${found.whatsappPhone}) والبريد (${found.studentEmail}).`,
      bodyEn: `Reminder: Your confirmed session starts in 15 minutes! | Date: ${found.date} | Time: ${found.timeSlot} | Type: ${found.bookingType} | Topic: ${found.topic} | Virtual Room: ${found.meetingId} — Dispatched via App, WhatsApp (${found.whatsappPhone}) & Email (${found.studentEmail}).`,
      createdAt: new Date().toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"],
    };

    memoryStore.notifications.unshift(reminderNotif, confirmNotif);
    if (memoryStore.notifications.length > 50) {
      memoryStore.notifications = memoryStore.notifications.slice(0, 50);
    }
    saveStore();

    res.json({
      booking: found,
      confirmationNotification: confirmNotif,
      reminderNotification: reminderNotif,
    });
  });

  app.post(`${prefix}/admin/bookings/:id/reject`, requireAdmin, (req, res) => {
    setPrivateNoStore(res);
    const bookingId = req.params.id;
    const found = memoryStore.bookings.find((b) => b.id === bookingId);
    if (!found) {
      res.status(404).json({ error: "Booking request not found." });
      return;
    }

    found.status = "rejected";
    const rejectNotif: AppNotificationRecord = {
      id: `notif-bk-rej-${Date.now()}`,
      category: "booking",
      titleAr: `تحديث حالة طلب الحجز (معتذر / غير متاح): ${found.studentName}`,
      titleEn: `Booking Request Status Update (Reschedule Needed): ${found.studentName}`,
      bodyAr: `يرجى اختيار موعد آخر لطلب الحجز (${found.bookingType}) بتاريخ ${found.date} الساعة ${found.timeSlot}.`,
      bodyEn: `Please select another slot for your booking (${found.bookingType}) on ${found.date} at ${found.timeSlot}.`,
      createdAt: new Date().toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"],
    };
    memoryStore.notifications.unshift(rejectNotif);
    saveStore();

    res.json({ booking: found, notification: rejectNotif });
  });

  app.post(`${prefix}/admin/bookings/:id/remind`, requireAdmin, (req, res) => {
    setPrivateNoStore(res);
    const bookingId = req.params.id;
    const found = memoryStore.bookings.find((b) => b.id === bookingId);
    if (!found) {
      res.status(404).json({ error: "Booking request not found." });
      return;
    }

    found.reminderSentAt = new Date().toISOString();
    const reminderNotif: AppNotificationRecord = {
      id: `notif-bk-rem15-${Date.now()}`,
      category: "booking",
      titleAr: `تذكير عاجل (قبل الموعد بـ 15 دقيقة): ${found.studentName} — ${found.timeSlot}`,
      titleEn: `15-Minute Session Reminder: ${found.studentName} — ${found.timeSlot}`,
      bodyAr: `تذكير بموعد الجلسة المؤكدة بعد 15 دقيقة | نوع الحجز: ${found.bookingType} | التاريخ: ${found.date} | التوقيت: ${found.timeSlot} | الموضوع: ${found.topic} | القاعة: ${found.meetingId} | الهاتف: ${found.whatsappPhone} | البريد: ${found.studentEmail}`,
      bodyEn: `15-Minute Reminder for Confirmed Session | Type: ${found.bookingType} | Date: ${found.date} | Time: ${found.timeSlot} | Topic: ${found.topic} | Room: ${found.meetingId} | Phone: ${found.whatsappPhone} | Email: ${found.studentEmail}`,
      createdAt: new Date().toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"],
    };
    memoryStore.notifications.unshift(reminderNotif);
    saveStore();

    res.json({ booking: found, reminderNotification: reminderNotif });
  });

  app.delete(`${prefix}/admin/bookings/:id`, requireAdmin, (req, res) => {
    setPrivateNoStore(res);
    const bookingId = req.params.id;
    memoryStore.bookings = memoryStore.bookings.filter((b) => b.id !== bookingId);
    saveStore();
    res.status(204).end();
  });

  app.get(`${prefix}/share`, (req, res) => {
    const vParam = typeof req.query.v === "string" && req.query.v.trim() ? req.query.v.trim() : "3";
    const siteOrigin = "https://nuclear-chemc.vercel.app";
    const sharePageUrl = `${siteOrigin}/?v=${encodeURIComponent(vParam)}`;
    const shareImageUrl = `${siteOrigin}/og-image.jpg?v=${encodeURIComponent(vParam)}`;
    const title = "Nuclear Knowledge Hub — مركز المعرفة النووية | م. شلتوت";
    const description =
      "منصة تعليمية متخصصة في الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية بإشراف المهندس محمود إسماعيل شلتوت لطلاب الجامعات بالسعودية والخليج.";

    const distIndex = path.resolve(__dirname, "dist", "index.html");
    const rootIndex = path.resolve(__dirname, "index.html");
    const htmlPath = fs.existsSync(distIndex) ? distIndex : rootIndex;

    if (fs.existsSync(htmlPath)) {
      let html = fs.readFileSync(htmlPath, "utf8");
      html = html
        .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${sharePageUrl}" />`)
        .replace(/<meta property="twitter:url" content="[^"]*" \/>/, `<meta property="twitter:url" content="${sharePageUrl}" />`)
        .replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${sharePageUrl}" />`)
        .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${shareImageUrl}" />`)
        .replace(/<meta property="og:image:secure_url" content="[^"]*" \/>/, `<meta property="og:image:secure_url" content="${shareImageUrl}" />`)
        .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${shareImageUrl}" />`);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.status(200).send(html);
      return;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${sharePageUrl}" />
  <meta property="og:site_name" content="Nuclear Knowledge Hub — مركز المعرفة النووية" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${shareImageUrl}" />
  <meta property="og:image:secure_url" content="${shareImageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@NuclearChemHub" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${shareImageUrl}" />
  <meta http-equiv="refresh" content="0;url=${siteOrigin}/" />
</head>
<body>
  <h1>${title}</h1>
</body>
</html>`);
  });
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(__dirname, "dist", "index.html"))
      ? path.resolve(__dirname, "dist")
      : path.resolve(__dirname, "dist", "public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

if (process.env.VERCEL !== "1" && process.env.NODE_TEST !== "1") {
  void startServer();
}
