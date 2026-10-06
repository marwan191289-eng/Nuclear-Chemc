// server.ts
import express from "express";
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
  timingSafeEqual
} from "node:crypto";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
var ADMIN_SESSION_COOKIE = "nuclear_admin_session";
var ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1e3;
var ROOT_ADMIN_SUBJECT = "root-admin";
var STUDENT_COUNTER_EPOCH = Date.UTC(2026, 9, 5, 0, 0, 0);
var HOUR_MS = 60 * 60 * 1e3;
var DEFAULT_DEV_ADMIN_PASSWORD = "mahmoud-nuclear-2026";
var DEFAULT_DEV_SESSION_SECRET = "nuclear-knowledge-hub-session-secret-key-2026-secure-hmac";
var ADMIN_STUDENTS = [
  { id: "st-1", name: "\u0623\u062D\u0645\u062F \u0628\u0646 \u062E\u0627\u0644\u062F \u0627\u0644\u0633\u0639\u062F\u0648\u0646", email: "ahmed.k@kfupm.edu.sa", course: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u0646\u0648\u0648\u064A\u0629", progress: 85, attendance: 96, quizAvg: 94, status: "\u0646\u0634\u0637" },
  { id: "st-2", name: "\u0646\u0648\u0631\u0629 \u0628\u0646\u062A \u0639\u0628\u062F \u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u062F\u0648\u0633\u0631\u064A", email: "noura.d@ksu.edu.sa", course: "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629", progress: 100, attendance: 100, quizAvg: 98, status: "\u0646\u0634\u0637" },
  { id: "st-3", name: "\u0639\u0645\u0631 \u0641\u0647\u062F \u0627\u0644\u0645\u0637\u064A\u0631\u064A", email: "omar.f@iau.edu.sa", course: "\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0648\u0642\u0627\u064A\u0629", progress: 70, attendance: 88, quizAvg: 89, status: "\u0646\u0634\u0637" },
  { id: "st-4", name: "\u0631\u064A\u0645 \u0628\u0646\u062A \u0633\u0644\u0637\u0627\u0646 \u0627\u0644\u0639\u062A\u064A\u0628\u064A", email: "reem.s@kau.edu.sa", course: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u0646\u0648\u0648\u064A\u0629", progress: 45, attendance: 92, quizAvg: 85, status: "\u0646\u0634\u0637" },
  { id: "st-5", name: "\u0633\u0639\u0648\u062F \u0628\u0646 \u0641\u064A\u0635\u0644 \u0627\u0644\u0634\u0645\u0631\u064A", email: "saud.sh@qu.edu.sa", course: "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629", progress: 60, attendance: 84, quizAvg: 79, status: "\u0646\u0634\u0637" }
];
var ADMIN_PARENT_REPORT = {
  studentName: "\u0623\u062D\u0645\u062F \u0628\u0646 \u062E\u0627\u0644\u062F \u0627\u0644\u0633\u0639\u062F\u0648\u0646",
  attendance: 96,
  quizAvg: 94,
  week: 4,
  remarks: "\u064A\u064F\u0638\u0647\u0631 \u0627\u0644\u0637\u0627\u0644\u0628 \u0641\u0647\u0645\u0627\u064B \u062C\u064A\u062F\u0627\u064B \u0644\u0645\u0648\u0636\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0642\u0631\u0631 \u0648\u064A\u0634\u0627\u0631\u0643 \u0628\u0641\u0627\u0639\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0648\u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u0645\u0641\u0627\u0639\u0644.",
  recommendations: [
    "\u0627\u0644\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0641\u064A \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0628\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0645\u062A\u0628\u0627\u0639\u062F.",
    "\u062D\u0644 \u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u064A\u0629 \u0639\u0644\u0649 \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 \u0642\u0628\u0644 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0646\u0647\u0627\u0626\u064A."
  ]
};
var INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    titleAr: "\u0641\u062A\u062D \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0641\u064A \u062F\u0641\u0639\u0629 \u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u0646\u0648\u0648\u064A\u0629",
    titleEn: "Enrollment Open for Nuclear Reactor Engineering Cohort",
    bodyAr: "\u062A\u0628\u062F\u0623 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0627\u062A \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0642\u0627\u062F\u0645 \u0628\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0625\u0633\u0645\u0627\u0639\u064A\u0644 \u0634\u0644\u062A\u0648\u062A \u0645\u0639 \u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0639\u0645\u0644\u064A\u0629 \u0639\u0644\u0649 \u0645\u062D\u0627\u0643\u064A \u0642\u0644\u0628 \u0627\u0644\u0645\u0641\u0627\u0639\u0644.",
    bodyEn: "Live lectures start next week with Eng. Mahmoud Ismail Shaltoot featuring interactive reactor core lab exercises.",
    priority: "important",
    createdAt: "2026-10-04T16:00:00.000Z",
    author: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A"
  },
  {
    id: "ann-2",
    titleAr: "\u062A\u062D\u062F\u064A\u062B \u0628\u0646\u0643 \u0645\u0633\u0627\u0626\u0644 \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629",
    titleEn: "Updated Half-Life & Radiation Safety Problem Bank",
    bodyAr: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 25 \u0645\u0633\u0623\u0644\u0629 \u0645\u062D\u0644\u0648\u0644\u0629 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644 \u0648\u0641\u0642 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0648\u0643\u0627\u0644\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0644\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0630\u0631\u064A\u0629 IAEA \u0648\u0645\u0642\u0631\u0631\u0627\u062A \u0627\u0644\u062C\u0627\u0645\u0639\u0627\u062A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629.",
    bodyEn: "Added 25 step-by-step solved problems aligned with IAEA safety standards and GCC university curricula.",
    priority: "normal",
    createdAt: "2026-10-03T12:30:00.000Z",
    author: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A"
  }
];
var DAILY_ANALYTICS = [
  { date: "2026-09-29", activeLearners: 142, lessonsCompleted: 89, simulatorRuns: 64, quizAccuracy: 88, studyPlansGenerated: 31, securityEventsBlocked: 2 },
  { date: "2026-09-30", activeLearners: 156, lessonsCompleted: 104, simulatorRuns: 78, quizAccuracy: 91, studyPlansGenerated: 38, securityEventsBlocked: 1 },
  { date: "2026-10-01", activeLearners: 168, lessonsCompleted: 118, simulatorRuns: 85, quizAccuracy: 90, studyPlansGenerated: 44, securityEventsBlocked: 0 },
  { date: "2026-10-02", activeLearners: 151, lessonsCompleted: 95, simulatorRuns: 71, quizAccuracy: 92, studyPlansGenerated: 29, securityEventsBlocked: 3 },
  { date: "2026-10-03", activeLearners: 179, lessonsCompleted: 132, simulatorRuns: 94, quizAccuracy: 93, studyPlansGenerated: 52, securityEventsBlocked: 1 },
  { date: "2026-10-04", activeLearners: 194, lessonsCompleted: 147, simulatorRuns: 112, quizAccuracy: 94, studyPlansGenerated: 61, securityEventsBlocked: 0 },
  { date: "2026-10-05", activeLearners: 208, lessonsCompleted: 163, simulatorRuns: 128, quizAccuracy: 95, studyPlansGenerated: 68, securityEventsBlocked: 0 }
];
var DATA_FILE_PATH = path.resolve(__dirname, ".nuclear-hub-store.json");
var DEFAULT_BOOKING_SCHEDULE = {
  timeSlots: [
    "04:00 PM (KSA)",
    "05:30 PM (KSA)",
    "07:00 PM (KSA)",
    "08:30 PM (KSA)",
    "10:00 PM (KSA)"
  ],
  disabledDates: [],
  disabledDateSlots: [],
  weeklyHolidays: [5],
  // Friday weekly holiday by default
  officialHolidays: [
    {
      id: "hol-saudi-national",
      title: "\u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0648\u0637\u0646\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (\u0625\u062C\u0627\u0632\u0629 \u0631\u0633\u0645\u064A\u0629)",
      startDate: "2026-09-23",
      endDate: "2026-09-23",
      type: "official"
    },
    {
      id: "hol-annual-break",
      title: "\u0627\u0644\u0625\u062C\u0627\u0632\u0629 \u0627\u0644\u0633\u0646\u0648\u064A\u0629 \u0644\u0644\u0645\u0646\u0635\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629",
      startDate: "2026-12-28",
      endDate: "2026-12-31",
      type: "annual"
    }
  ]
};
var memoryStore = {
  users: [],
  students: [...ADMIN_STUDENTS],
  announcements: [...INITIAL_ANNOUNCEMENTS],
  backups: [
    {
      id: "bk-auto-20261005",
      timestamp: "2026-10-05T00:00:00.000Z",
      sizeBytes: 18432,
      accountsCount: 5,
      checksum: "sha256:9f86d081884c7d659a2feaa0c55ad015"
    }
  ],
  bookingSchedule: structuredClone(DEFAULT_BOOKING_SCHEDULE),
  notifications: [
    {
      id: "notif-init-1",
      category: "system",
      titleAr: "\u062A\u0641\u0639\u064A\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u062B\u0644\u0627\u062B\u064A (\u0627\u0644\u062A\u0637\u0628\u064A\u0642 + \u0648\u0627\u062A\u0633\u0627\u0628 + \u0627\u0644\u0628\u0631\u064A\u062F)",
      titleEn: "Triple-Channel Notification System Active (In-App + WhatsApp + Email)",
      bodyAr: "\u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u062C\u0645\u064A\u0639 \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0627\u0644\u0646\u0642\u0627\u0634 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0648\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0648\u0627\u0644\u062F\u0648\u0631\u0627\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u062F\u0627\u062E\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0648\u0639\u0628\u0631 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0627\u0644\u0645\u0633\u062C\u0644.",
      bodyEn: "All study discussion messages, bookings, and course updates are dispatched in-app, via WhatsApp, and to your registered email.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: "Mahmoudshaltoot.cemc@gmail.com",
      whatsappPhone: "+966594756878",
      channels: ["in_app", "whatsapp", "email"]
    }
  ],
  bookings: [
    {
      id: "bk-sample-1001",
      studentName: "\u0639\u0628\u062F \u0627\u0644\u0644\u0647 \u0628\u0646 \u0641\u0647\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
      studentEmail: "abdullah.q@kfupm.edu.sa",
      whatsappPhone: "+966551234567",
      countryName: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      bookingType: "\u062C\u0644\u0633\u0629 \u0641\u0631\u062F\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 1-on-1 (\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A)",
      topic: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u0627\u0626\u0644 \u062D\u0633\u0627\u0628 \u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u062D\u0631\u062C\u0629 \u0648\u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 \u0642\u0628\u0644 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0646\u0635\u0641\u064A",
      date: "2026-10-08",
      timeSlot: "07:00 PM (KSA)",
      status: "pending",
      meetingId: "room-nuclear-4821",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ]
};
function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.users)) memoryStore.users = parsed.users;
      if (Array.isArray(parsed.students)) memoryStore.students = parsed.students;
      if (Array.isArray(parsed.announcements)) memoryStore.announcements = parsed.announcements;
      if (Array.isArray(parsed.backups)) memoryStore.backups = parsed.backups;
      if (parsed.bookingSchedule && Array.isArray(parsed.bookingSchedule.timeSlots)) {
        memoryStore.bookingSchedule = {
          ...DEFAULT_BOOKING_SCHEDULE,
          ...parsed.bookingSchedule
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
  }
  return memoryStore;
}
function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(memoryStore, null, 2), "utf8");
  } catch {
  }
}
loadStore();
var apiKey = process.env.GEMINI_API_KEY || "";
var ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
function hourlyStudentGrowth(hourIndex) {
  const seed = (hourIndex * 9301 + 49297) % 233280;
  const value = seed / 233280;
  if (value < 0.18) return 0;
  if (value < 0.62) return 1;
  if (value < 0.9) return 2;
  return 3;
}
function calculateRealisticStudentCount(now = Date.now()) {
  const elapsedMs = Math.max(0, now - STUDENT_COUNTER_EPOCH);
  const completedHours = Math.floor(elapsedMs / HOUR_MS);
  const elapsedInCurrentHour = elapsedMs % HOUR_MS;
  let count = 542;
  for (let hour = 0; hour < completedHours; hour += 1) {
    count += hourlyStudentGrowth(hour);
  }
  return {
    count,
    lastHourIncrease: completedHours > 0 ? hourlyStudentGrowth(completedHours - 1) : 1,
    nextIncrementMinutes: Math.ceil(
      (HOUR_MS - elapsedInCurrentHour) / (60 * 1e3)
    )
  };
}
function getRequestCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return void 0;
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1);
}
function getAuthConfig() {
  const hasExplicitAdminEnv = Object.prototype.hasOwnProperty.call(process.env, "ADMIN_PASSWORD");
  const password = hasExplicitAdminEnv ? process.env.ADMIN_PASSWORD : DEFAULT_DEV_ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || DEFAULT_DEV_SESSION_SECRET;
  if (!password || !sessionSecret || Buffer.byteLength(sessionSecret) < 32) {
    return null;
  }
  return { password, sessionSecret };
}
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || DEFAULT_DEV_SESSION_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}
function getSessionTokenFromRequest(req) {
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
function readSignedSession(req) {
  const sessionSecret = getSessionSecret();
  const token = getSessionTokenFromRequest(req);
  if (!sessionSecret || !token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expectedSignature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    return typeof session.sub === "string" && typeof session.exp === "number" && session.exp > Date.now() ? { sub: session.sub, exp: session.exp } : null;
  } catch {
    return null;
  }
}
function setSessionCookie(res, subject, req) {
  const sessionSecret = getSessionSecret();
  if (!sessionSecret) return "";
  const payload = Buffer.from(
    JSON.stringify({ sub: subject, exp: Date.now() + ADMIN_SESSION_TTL_MS })
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  const token = `${payload}.${signature}`;
  const isHttps = req?.secure || req?.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const sameSite = process.env.NODE_TEST === "1" ? "Strict; Secure" : isHttps ? "None; Secure" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1e3)}`
  );
  res.setHeader("X-Session-Token", token);
  return token;
}
function setAdminSessionCookie(res, req) {
  return setSessionCookie(res, ROOT_ADMIN_SUBJECT, req);
}
function clearAdminSessionCookie(res, req) {
  const isHttps = req?.secure || req?.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const sameSite = process.env.NODE_TEST === "1" ? "Strict; Secure" : isHttps ? "None; Secure" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0`
  );
}
function normalizeUser(row) {
  if (!["admin", "instructor", "student", "parent"].includes(row.role)) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    disabled: row.disabled,
    createdAt: new Date(row.created_at).toISOString()
  };
}
async function getAuthenticatedUser(req) {
  const session = readSignedSession(req);
  if (!session) return null;
  if (session.sub === ROOT_ADMIN_SUBJECT) {
    if (!getAuthConfig()) return null;
    return {
      id: ROOT_ADMIN_SUBJECT,
      name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A \u2014 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
      email: "Mahmoudshaltoot.cemc@gmail.com",
      role: "admin"
    };
  }
  const found = memoryStore.users.find((u) => u.id === session.sub && !u.disabled);
  return found ? normalizeUser(found) : null;
}
function derivePassword(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}
async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await derivePassword(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}
async function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!/^[\da-f]{32}$/.test(saltHex ?? "") || !/^[\da-f]{128}$/.test(keyHex ?? "")) {
    return false;
  }
  const expected = Buffer.from(keyHex, "hex");
  const supplied = await derivePassword(password, Buffer.from(saltHex, "hex"));
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
function setPrivateNoStore(res) {
  res.setHeader("Cache-Control", "private, no-store");
}
var failedLoginAttempts = /* @__PURE__ */ new Map();
function loginRateLimit(req, res, next) {
  res.setHeader("Cache-Control", "private, no-store");
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const current = failedLoginAttempts.get(ip);
  if (current && current.resetAt <= Date.now()) {
    failedLoginAttempts.delete(ip);
  } else if (current && current.count >= 5) {
    res.setHeader(
      "Retry-After",
      Math.max(1, Math.ceil((current.resetAt - Date.now()) / 1e3))
    );
    res.status(429).json({ error: "Too many login attempts. Try again later." });
    return;
  }
  next();
}
function recordFailedLogin(ip) {
  if (failedLoginAttempts.size >= 1e4) {
    for (const [address, entry] of failedLoginAttempts) {
      if (entry.resetAt <= Date.now()) failedLoginAttempts.delete(address);
    }
  }
  const current = failedLoginAttempts.get(ip);
  if (!current || current.resetAt <= Date.now()) {
    failedLoginAttempts.set(ip, { count: 1, resetAt: Date.now() + 15 * 60 * 1e3 });
    return;
  }
  current.count += 1;
}
var registrationAttempts = /* @__PURE__ */ new Map();
function registrationRateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = registrationAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1e3 });
    next();
    return;
  }
  if (current.count >= 15) {
    res.setHeader("Retry-After", Math.max(1, Math.ceil((current.resetAt - now) / 1e3)));
    res.status(429).json({ error: "Too many new accounts from this connection. Try again later." });
    return;
  }
  current.count += 1;
  next();
}
function requireAdmin(req, res, next) {
  setPrivateNoStore(res);
  void getAuthenticatedUser(req).then((user) => {
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
  }).catch(() => {
    res.status(503).json({ error: "Authentication storage is unavailable." });
  });
}
var API_PREFIXES = ["/api", "/_nuclear-knowledge-api"];
for (const prefix of API_PREFIXES) {
  app.get(`${prefix}/stats`, (_req, res) => {
    const stats = calculateRealisticStudentCount();
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    res.json({
      studentsCount: stats.count,
      baseDisplay: "500+",
      lastHourIncrease: stats.lastHourIncrease,
      nextIncrementMinutes: stats.nextIncrementMinutes,
      coursesCount: 3,
      experienceYears: "12+"
    });
  });
  app.get(`${prefix}/announcements`, (_req, res) => {
    res.json(memoryStore.announcements);
  });
  app.get(`${prefix}/auth/me`, async (req, res) => {
    setPrivateNoStore(res);
    try {
      res.json({ user: await getAuthenticatedUser(req) });
    } catch {
      res.status(503).json({ error: "Account storage is unavailable." });
    }
  });
  app.post(`${prefix}/auth/register`, registrationRateLimit, async (req, res) => {
    setPrivateNoStore(res);
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
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
      const newRow = {
        id,
        name,
        email,
        password_hash: passwordHash,
        role: "student",
        disabled: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
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
  app.post(`${prefix}/auth/login`, loginRateLimit, async (req, res) => {
    setPrivateNoStore(res);
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 128) {
      res.status(400).json({ error: "Enter a valid email and password." });
      return;
    }
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    try {
      const row = memoryStore.users.find((u) => u.email === email);
      const passwordMatches = row ? await verifyPassword(password, row.password_hash) : await verifyPassword(
        password,
        "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
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
  const ALLOWED_SOCIAL_PROVIDERS = /* @__PURE__ */ new Set([
    "google",
    "facebook",
    "apple",
    "twitter",
    "github",
    "linkedin",
    "microsoft"
  ]);
  app.post(`${prefix}/auth/social`, loginRateLimit, async (req, res) => {
    setPrivateNoStore(res);
    const provider = typeof req.body?.provider === "string" ? req.body.provider.trim().toLowerCase() : "";
    if (!ALLOWED_SOCIAL_PROVIDERS.has(provider)) {
      res.status(400).json({ error: "Unsupported social authentication provider." });
      return;
    }
    const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const providerDefaultDomains = {
      google: "gmail.com",
      facebook: "facebook.user.nkh",
      apple: "icloud.com",
      twitter: "x.user.nkh",
      github: "github.user.nkh",
      linkedin: "linkedin.user.nkh",
      microsoft: "outlook.com"
    };
    const providerDefaultNames = {
      google: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 Google",
      facebook: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 Facebook",
      apple: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 iCloud",
      twitter: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 X",
      github: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 GitHub",
      linkedin: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 LinkedIn",
      microsoft: "\u0637\u0627\u0644\u0628 \u0639\u0628\u0631 Microsoft"
    };
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) && rawEmail.length <= 254 ? rawEmail : `learner.${provider}@${providerDefaultDomains[provider] || "gmail.com"}`;
    const name = rawName.length >= 2 && rawName.length <= 100 ? rawName : providerDefaultNames[provider] || "\u0637\u0627\u0644\u0628 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0639\u0631\u0641\u0629";
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
          created_at: (/* @__PURE__ */ new Date()).toISOString()
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
  app.post(`${prefix}/auth/logout`, (req, res) => {
    setPrivateNoStore(res);
    clearAdminSessionCookie(res, req);
    res.status(204).end();
  });
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
  app.post(`${prefix}/admin/login`, loginRateLimit, (req, res) => {
    setPrivateNoStore(res);
    const config = getAuthConfig();
    if (!config) {
      res.status(503).json({ error: "Admin authentication is not configured." });
      return;
    }
    const candidate = typeof req.body?.password === "string" ? req.body.password : "";
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
        name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A \u2014 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
        email: "Mahmoudshaltoot.cemc@gmail.com",
        role: "admin"
      }
    });
  });
  app.post(`${prefix}/admin/logout`, (req, res) => {
    setPrivateNoStore(res);
    clearAdminSessionCookie(res, req);
    res.status(204).end();
  });
  app.get(`${prefix}/admin/students`, requireAdmin, (_req, res) => {
    res.json(memoryStore.students);
  });
  app.post(`${prefix}/admin/students`, requireAdmin, (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const course = typeof req.body?.course === "string" ? req.body.course.trim() : "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629";
    if (!name || !email) {
      res.status(400).json({ error: "Name and email are required." });
      return;
    }
    const newStudent = {
      id: `st-${Date.now()}`,
      name,
      email,
      course,
      progress: Number(req.body?.progress) || 0,
      attendance: Number(req.body?.attendance) || 100,
      quizAvg: Number(req.body?.quizAvg) || 90,
      status: "\u0646\u0634\u0637"
    };
    memoryStore.students.unshift(newStudent);
    saveStore();
    res.status(201).json(newStudent);
  });
  app.get(`${prefix}/admin/users`, requireAdmin, async (_req, res) => {
    res.json(
      memoryStore.users.flatMap((row) => {
        const user = normalizeUser(row);
        return user ? [{ ...user, disabled: row.disabled }] : [];
      })
    );
  });
  app.patch(`${prefix}/admin/users/:userId/role`, requireAdmin, async (req, res) => {
    const role = req.body?.role;
    if (!["admin", "instructor", "student", "parent"].includes(role)) {
      res.status(400).json({ error: "A valid account role is required." });
      return;
    }
    const actor = res.locals.authenticatedUser;
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
  app.get(`${prefix}/admin/parent-report`, requireAdmin, (_req, res) => {
    res.json(ADMIN_PARENT_REPORT);
  });
  app.post(`${prefix}/admin/announcements`, requireAdmin, (req, res) => {
    const titleAr = typeof req.body?.titleAr === "string" ? req.body.titleAr.trim() : "";
    const bodyAr = typeof req.body?.bodyAr === "string" ? req.body.bodyAr.trim() : "";
    if (!titleAr || !bodyAr) {
      res.status(400).json({ error: "Announcement title and content are required." });
      return;
    }
    const item = {
      id: `ann-${Date.now()}`,
      titleAr,
      titleEn: typeof req.body?.titleEn === "string" && req.body.titleEn.trim() ? req.body.titleEn.trim() : titleAr,
      bodyAr,
      bodyEn: typeof req.body?.bodyEn === "string" && req.body.bodyEn.trim() ? req.body.bodyEn.trim() : bodyAr,
      priority: ["normal", "important", "urgent"].includes(req.body?.priority) ? req.body.priority : "normal",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A"
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
  app.get(`${prefix}/admin/analytics`, requireAdmin, (_req, res) => {
    res.json({
      daily: DAILY_ANALYTICS,
      summary: {
        totalActiveWeek: 1198,
        avgQuizAccuracy: 92.4,
        totalSimulatorSessions: 632,
        securityStatus: "Protected (HMAC-SHA256 + Scrypt + Rate Limiting Active)",
        failedLoginsBlocked: failedLoginAttempts.size
      }
    });
  });
  app.get(`${prefix}/admin/backups`, requireAdmin, (_req, res) => {
    res.json({
      backups: memoryStore.backups,
      latestSnapshot: {
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        platform: "Nuclear Knowledge Hub",
        instructor: "Eng. Mahmoud Ismail Shaltoot",
        accountsCount: memoryStore.users.length,
        studentsRosterCount: memoryStore.students.length,
        announcementsCount: memoryStore.announcements.length,
        data: {
          users: memoryStore.users.map((u) => normalizeUser(u)),
          students: memoryStore.students,
          announcements: memoryStore.announcements
        }
      }
    });
  });
  app.post(`${prefix}/admin/backups`, requireAdmin, (_req, res) => {
    const payloadStr = JSON.stringify({
      users: memoryStore.users.map((u) => normalizeUser(u)),
      students: memoryStore.students,
      announcements: memoryStore.announcements
    });
    const checksum = `sha256:${createHash("sha256").update(payloadStr).digest("hex").slice(0, 32)}`;
    const record = {
      id: `bk-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      sizeBytes: Buffer.byteLength(payloadStr, "utf8"),
      accountsCount: memoryStore.users.length + memoryStore.students.length,
      checksum
    };
    memoryStore.backups.unshift(record);
    saveStore();
    res.status(201).json(record);
  });
  app.post(`${prefix}/ai/study-plan`, async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const readText = (value, fallback, maxLength) => typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : fallback;
      const goal = readText(body.goal, "\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u062F\u0627\u062F \u0644\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062C\u0627\u0645\u0639\u064A\u0629 \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A", 240);
      const level = readText(body.level, "\u0645\u062A\u0648\u0633\u0637", 80);
      const availableHours = readText(body.availableHours, "6-8 \u0633\u0627\u0639\u0627\u062A", 80);
      const interests = readText(body.interests, "\u062D\u0633\u0627\u0628\u0627\u062A \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641\u060C \u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0627\u0644\u0627\u0646\u0634\u0637\u0627\u0631\u060C \u062A\u0635\u0645\u064A\u0645 \u0642\u0644\u0628 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u060C \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629", 240);
      const durationValue = Number(body.durationWeeks);
      const durationWeeks = Number.isInteger(durationValue) && durationValue >= 1 && durationValue <= 12 ? durationValue : 6;
      const lang = body.language === "en" ? "en" : "ar";
      const prompt = lang === "en" ? `Generate a highly structured, realistic, and inspiring Nuclear Chemistry & Reactor Engineering Study Plan for a student.
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

Return strictly valid JSON without markdown quotes.` : `\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u062E\u0637\u0629 \u0645\u0630\u0627\u0643\u0631\u0629 \u0630\u0643\u064A\u0629 \u0648\u0645\u0641\u0635\u0644\u0629 \u0648\u0634\u062E\u0635\u064A\u0629 \u0644\u0645\u0627\u062F\u0629 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A \u0628\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0625\u0633\u0645\u0627\u0639\u064A\u0644 \u0634\u0644\u062A\u0648\u062A.
\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0627\u0644\u0628:
- \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u062F\u0631\u0627\u0633\u064A: ${goal || "\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u062F\u0627\u062F \u0644\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062C\u0627\u0645\u0639\u064A\u0629 \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A"}
- \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062D\u0627\u0644\u064A: ${level || "\u0645\u062A\u0648\u0633\u0637"}
- \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629: ${availableHours || "6-8 \u0633\u0627\u0639\u0627\u062A"}
- \u0645\u062C\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0648\u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645: ${interests || "\u062D\u0633\u0627\u0628\u0627\u062A \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641\u060C \u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0627\u0644\u0627\u0646\u0634\u0637\u0627\u0631\u060C \u062A\u0635\u0645\u064A\u0645 \u0642\u0644\u0628 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u060C \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629"}
- \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629: ${durationWeeks || 6} \u0623\u0633\u0627\u0628\u064A\u0639

\u0623\u062E\u0631\u062C \u0627\u0644\u0646\u0627\u062A\u062C \u0628\u0635\u064A\u063A\u0629 JSON \u0646\u0642\u064A\u0629 \u0648\u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u062F\u0648\u0646 \u0639\u0644\u0627\u0645\u0627\u062A \u062A\u0641\u0627\u0641\u064A\u0629 markdown\u060C \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649:
1. "planTitle": \u0639\u0646\u0648\u0627\u0646 \u062C\u0630\u0627\u0628 \u0648\u0634\u062E\u0635\u064A \u0644\u0644\u062E\u0637\u0629
2. "overview": \u0646\u0628\u0630\u0629 \u0645\u062D\u0641\u0632\u0629 \u062A\u0648\u0636\u062D \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0645\u0630\u0627\u0643\u0631\u0629 \u0648\u0646\u0635\u064A\u062D\u0629 \u0645\u062E\u0635\u0635\u0629
3. "weeklyRoadmap": \u0645\u0635\u0641\u0648\u0641\u0629 \u062A\u062D\u062A\u0648\u064A \u062A\u0641\u0627\u0635\u064A\u0644 \u0643\u0644 \u0623\u0633\u0628\u0648\u0639 (\u0645\u0646 1 \u0625\u0644\u0649 ${durationWeeks || 6}):
   - "weekNumber": \u0631\u0642\u0645 \u0627\u0644\u0623\u0633\u0628\u0648\u0639
   - "title": \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0628\u0648\u0639
   - "objectives": \u0645\u0635\u0641\u0648\u0641\u0629 \u0628\u0627\u0644\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0645\u062D\u062F\u062F\u0629
   - "suggestedHours": \u0639\u062F\u062F \u0627\u0644\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629
   - "spacedRepetitionCards": \u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062A\u0628\u0627\u0639\u062F\u0629 \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627 (\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0648\u0642\u0648\u0627\u0646\u064A\u0646)
4. "recommendedCourses": \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u062F\u0648\u0631\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u0635\u0629 ("\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629", "\u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A", "\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0646\u0638\u0627\u0626\u0631")
5. "practicalChecklist": \u0623\u0647\u0645 3 \u0625\u0646\u062C\u0627\u0632\u0627\u062A \u0648\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0639\u0645\u0644\u064A\u0629 (\u0645\u062B\u0644: \u0645\u062D\u0627\u0643\u0627\u0629 \u0642\u0644\u0628 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u060C \u0645\u0633\u0627\u0626\u0644 \u0637\u0627\u0642\u0629 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0646\u0648\u0648\u064A\u060C \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A)
6. "instructorAdvice": \u0646\u0635\u064A\u062D\u0629 \u0648\u062A\u0648\u062C\u064A\u0647 \u0630\u0647\u0628\u064A \u0645\u0646 \u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A \u0644\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u062E\u0637\u0629`;
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              systemInstruction: "You are an expert Nuclear Chemical Engineer and Academic Mentor for Eng. Mahmoud Shaltoot's Nuclear Academy. Always output clean, valid, professional JSON without markdown wrapping.",
              responseMimeType: "application/json",
              temperature: 0.7
            }
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
          planTitle: lang === "en" ? "Nuclear Chemistry Mastery Blueprint" : "\u062E\u0637\u0629 \u0627\u0644\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0634\u0627\u0645\u0644 \u0641\u064A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A",
          overview: lang === "en" ? "A structured roadmap combining fundamental isotope chemistry with practical reactor simulation." : `\u062E\u0637\u0629 \u062F\u0631\u0627\u0633\u064A\u0629 \u0634\u062E\u0635\u064A\u0629 \u0645\u062E\u0635\u0635\u0629 \u0644\u0647\u062F\u0641: (${goal || "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629"}) \u0628\u0645\u0639\u062F\u0644 (${availableHours || "6 \u0633\u0627\u0639\u0627\u062A \u0623\u0633\u0628\u0648\u0639\u064A\u0627\u064B"})\u060C \u062A\u0645 \u0625\u0639\u062F\u0627\u062F\u0647\u0627 \u0628\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A.`,
          weeklyRoadmap: [
            {
              weekNumber: 1,
              title: lang === "en" ? "Nuclear Structure & Binding Energy" : "\u0628\u0646\u064A\u0629 \u0627\u0644\u0646\u0648\u0627\u0629 \u0648\u0637\u0627\u0642\u0629 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0646\u0648\u0648\u064A",
              objectives: [
                lang === "en" ? "Calculate mass defect and nuclear binding energy (E=mc\xB2)" : "\u062D\u0633\u0627\u0628 \u0646\u0642\u0635 \u0627\u0644\u0643\u062A\u0644\u0629 \u0648\u0637\u0627\u0642\u0629 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0646\u0648\u0648\u064A \u0644\u0645\u0639\u0627\u062F\u0644\u0629 \u0623\u064A\u0646\u0634\u062A\u0627\u064A\u0646",
                lang === "en" ? "Understand proton-to-neutron ratio and stability curve" : "\u062F\u0631\u0627\u0633\u0629 \u0646\u0633\u0628\u0629 \u0627\u0644\u0646\u064A\u0648\u062A\u0631\u0648\u0646\u0627\u062A \u0625\u0644\u0649 \u0627\u0644\u0628\u0631\u0648\u062A\u0648\u0646\u0627\u062A \u0648\u062D\u0632\u0627\u0645 \u0627\u0644\u0627\u0633\u062A\u0642\u0631\u0627\u0631"
              ],
              suggestedHours: 6,
              spacedRepetitionCards: ["\u0637\u0627\u0642\u0629 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0646\u0648\u0648\u064A", "\u062D\u0632\u0627\u0645 \u0627\u0644\u0627\u0633\u062A\u0642\u0631\u0627\u0631", "\u0646\u0642\u0635 \u0627\u0644\u0643\u062A\u0644\u0629"]
            },
            {
              weekNumber: 2,
              title: lang === "en" ? "Radioactive Decay Modes (Alpha, Beta, Gamma)" : "\u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0627\u0636\u0645\u062D\u0644\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A (\u0623\u0644\u0641\u0627\u060C \u0628\u064A\u062A\u0627\u060C \u062C\u0627\u0645\u0627)",
              objectives: [
                lang === "en" ? "Write and balance nuclear equations" : "\u0643\u062A\u0627\u0628\u0629 \u0648\u0645\u0648\u0627\u0632\u0646\u0629 \u0627\u0644\u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0628\u062F\u0642\u0629",
                lang === "en" ? "Understand penetration power and shielding materials" : "\u0627\u0644\u062A\u0645\u064A\u064A\u0632 \u0628\u064A\u0646 \u0642\u062F\u0631\u0629 \u0627\u0644\u0627\u062E\u062A\u0631\u0627\u0642 \u0648\u0627\u0644\u062A\u062F\u0631\u064A\u0639 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0643\u0644 \u0625\u0634\u0639\u0627\u0639"
              ],
              suggestedHours: 7,
              spacedRepetitionCards: ["\u0627\u0636\u0645\u062D\u0644\u0627\u0644 \u0628\u064A\u062A\u0627 \u0627\u0644\u0645\u0648\u062C\u0628 \u0648\u0627\u0644\u0633\u0627\u0644\u0628", "\u062C\u0633\u064A\u0645\u0627\u062A \u0623\u0644\u0641\u0627", "\u0623\u0634\u0639\u0629 \u062C\u0627\u0645\u0627"]
            },
            {
              weekNumber: 3,
              title: lang === "en" ? "Half-life & Radioactive Dating Calculations" : "\u062D\u0633\u0627\u0628\u0627\u062A \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 \u0648\u0627\u0644\u062A\u0623\u0631\u064A\u062E \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A",
              objectives: [
                lang === "en" ? "Master continuous decay formula N = N0 * e^(-\u03BBt)" : "\u0625\u062A\u0642\u0627\u0646 \u0642\u0627\u0646\u0648\u0646 \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 \u0628\u0627\u0644\u0635\u064A\u063A\u0629 \u0627\u0644\u0623\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u064A\u0629",
                lang === "en" ? "Solve real-world carbon-14 and medical isotope problems" : "\u062D\u0644 \u0645\u0633\u0627\u0626\u0644 \u0639\u0645\u0644\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0643\u0631\u0628\u0648\u0646-14 \u0648\u0627\u0644\u0646\u0638\u0627\u0626\u0631 \u0627\u0644\u0637\u0628\u064A\u0629"
              ],
              suggestedHours: 8,
              spacedRepetitionCards: ["\u062B\u0627\u0628\u062A \u0627\u0644\u0627\u0636\u0645\u062D\u0644\u0627\u0644 \u03BB", "\u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 T_1/2", "\u0627\u0644\u0646\u0634\u0627\u0637\u064A\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 (Becquerel)"]
            },
            {
              weekNumber: 4,
              title: lang === "en" ? "Nuclear Fission & Reactor Core Dynamics" : "\u0627\u0644\u0627\u0646\u0634\u0637\u0627\u0631 \u0627\u0644\u0646\u0648\u0648\u064A \u0648\u062F\u064A\u0646\u0627\u0645\u064A\u0643\u0627 \u0642\u0644\u0628 \u0627\u0644\u0645\u0641\u0627\u0639\u0644",
              objectives: [
                lang === "en" ? "Chain reaction kinetics and critical mass" : "\u0622\u0644\u064A\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0627\u0644\u0645\u062A\u0633\u0644\u0633\u0644 \u0648\u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u062D\u0631\u062C\u0629",
                lang === "en" ? "Function of fuel rods (U-235), control rods, and moderators" : "\u062F\u0648\u0631 \u0642\u0636\u0628\u0627\u0646 \u0627\u0644\u0648\u0642\u0648\u062F \u0648\u0627\u0644\u062A\u062D\u0643\u0645 \u0648\u0627\u0644\u0645\u0647\u062F\u0626 \u0641\u064A \u0627\u0644\u0645\u0641\u0627\u0639\u0644"
              ],
              suggestedHours: 8,
              spacedRepetitionCards: ["\u0627\u0644\u064A\u0648\u0631\u0627\u0646\u064A\u0648\u0645 235", "\u0639\u0627\u0645\u0644 \u0627\u0644\u062A\u0643\u0627\u062B\u0631 k", "\u0642\u0636\u0628\u0627\u0646 \u0627\u0644\u062A\u062D\u0643\u0645 \u0645\u0646 \u0627\u0644\u0643\u0627\u062F\u0645\u064A\u0648\u0645 \u0648\u0627\u0644\u0628\u0648\u0631\u0648\u0646"]
            },
            {
              weekNumber: 5,
              title: lang === "en" ? "Radiation Protection & Safety Principles" : "\u0645\u0628\u0627\u062F\u0626 \u0627\u0644\u0648\u0642\u0627\u064A\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0646\u0648\u0648\u064A\u0629",
              objectives: [
                lang === "en" ? "ALARA principle (Time, Distance, Shielding)" : "\u062A\u0637\u0628\u064A\u0642 \u0645\u0628\u062F\u0623 ALARA (\u0627\u0644\u0648\u0642\u062A\u060C \u0627\u0644\u0645\u0633\u0627\u0641\u0629\u060C \u0627\u0644\u062A\u062F\u0631\u064A\u0639)",
                lang === "en" ? "Absorbed dose vs. equivalent dose (Gy & Sv)" : "\u0627\u0644\u062A\u0645\u064A\u064A\u0632 \u0628\u064A\u0646 \u0627\u0644\u062C\u0631\u0639\u0629 \u0627\u0644\u0645\u0645\u062A\u0635\u0629 \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0626\u0629 (\u062C\u0631\u0627\u064A \u0648\u0633\u064A\u0641\u064A\u0631\u062A)"
              ],
              suggestedHours: 6,
              spacedRepetitionCards: ["\u0645\u0628\u062F\u0623 ALARA", "\u0648\u062D\u062F\u0629 \u0627\u0644\u0633\u064A\u0641\u064A\u0631\u062A Sievert", "\u062D\u062F\u0648\u062F \u0627\u0644\u062C\u0631\u0639\u0629 \u0627\u0644\u0645\u0647\u0646\u064A\u0629"]
            },
            {
              weekNumber: 6,
              title: lang === "en" ? "Comprehensive Exam & Practical Simulation" : "\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0629",
              objectives: [
                lang === "en" ? "Simulate reactor startup and emergency shutdown (SCRAM)" : "\u0645\u062D\u0627\u0643\u0627\u0629 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u0641\u0627\u0639\u0644 \u0648\u0627\u0644\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0637\u0627\u0631\u0626 (SCRAM)",
                lang === "en" ? "Complete placement milestone assessment with 90%+ accuracy" : "\u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0634\u0627\u0645\u0644 \u0628\u0646\u0633\u0628\u0629 90% \u0641\u0645\u0627 \u0641\u0648\u0642"
              ],
              suggestedHours: 8,
              spacedRepetitionCards: ["\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 SCRAM", "\u0627\u0644\u0633\u0645\u0648\u0645 \u0627\u0644\u0646\u064A\u0648\u062A\u0631\u0648\u0646\u064A\u0629 (\u0627\u0644\u0632\u064A\u0646\u0648\u0646 135)"]
            }
          ],
          recommendedCourses: [
            "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629",
            "\u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A"
          ],
          practicalChecklist: [
            "\u062D\u0644 50 \u0645\u0633\u0623\u0644\u0629 \u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0641\u064A \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 \u0648\u0637\u0627\u0642\u0629 \u0627\u0644\u0631\u0628\u0637",
            "\u0625\u062C\u0631\u0627\u0621 \u0645\u062D\u0627\u0643\u0627\u0629 \u0636\u0628\u0637 \u0642\u0644\u0628 \u0627\u0644\u0645\u0641\u0627\u0639\u0644 \u0648\u0642\u0636\u0628\u0627\u0646 \u0627\u0644\u062A\u062D\u0643\u0645",
            "\u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A"
          ],
          instructorAdvice: "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0644\u064A\u0633\u062A \u0645\u062C\u0631\u062F \u062D\u0641\u0638 \u0645\u0639\u0627\u062F\u0644\u0627\u062A\u060C \u0628\u0644 \u0647\u064A \u0641\u0647\u0645 \u0639\u0645\u064A\u0642 \u0644\u0623\u0633\u0631\u0627\u0631 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0643\u0627\u0645\u0646\u0629 \u0641\u064A \u0623\u062F\u0642 \u062C\u0633\u064A\u0645\u0627\u062A \u0627\u0644\u0643\u0648\u0646. \u0627\u0644\u062A\u0632\u0645 \u0628\u062C\u062F\u0648\u0644\u0643 \u0648\u0631\u0627\u062C\u0639 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B\u060C \u0648\u0623\u0646\u0627 \u0645\u0639\u0643 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629."
        }
      });
    } catch (error) {
      console.error("AI Study Plan Error:", error);
      return res.status(500).json({ error: "Failed to generate study plan." });
    }
  });
  const PLACEMENT_ANSWER_KEY = {
    q1: 1,
    q2: 2,
    q3: 2,
    q4: 2,
    q5: 2,
    q6: 1,
    q7: 1,
    q8: 0
  };
  const VALID_PLACEMENT_COURSES = ["fundamentals", "reactors", "safety", "private"];
  app.post("/api/placement/evaluate", async (req, res) => {
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
      const defaultCourseId = String(goal).includes("\u062A\u062E\u0631\u062C") || String(goal).toLowerCase().includes("thesis") ? "private" : score <= 4 ? "fundamentals" : score <= 6 ? "reactors" : "safety";
      const defaultLevel = en ? score <= 3 ? "Foundational Level (Level 01)" : score <= 6 ? "Intermediate Reactor Level (Level 02)" : "Advanced Radiation & Isotopes Level (Level 03)" : score <= 3 ? "\u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062A\u0645\u0647\u064A\u062F\u064A \u0648\u0627\u0644\u062A\u0623\u0633\u064A\u0633\u064A (Level 01)" : score <= 6 ? "\u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u062A\u0648\u0633\u0637 \u2014 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A (Level 02)" : "\u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 \u2014 \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0646\u0638\u0627\u0626\u0631 (Level 03)";
      const defaultSummary = en ? `You scored ${score}/${total}. Based on your answers${background ? ` and background (${String(background).slice(0, 80)})` : ""}, we recommend starting with this track to solidify your quantitative problem-solving and physical intuition.` : `\u062D\u0635\u0644\u062A \u0639\u0644\u0649 ${score} \u0645\u0646 ${total}. \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0625\u062C\u0627\u0628\u0627\u062A\u0643${background ? ` \u0648\u062E\u0644\u0641\u064A\u062A\u0643 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 (${String(background).slice(0, 80)})` : ""}\u060C \u0646\u0648\u0635\u064A \u0628\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631 \u0644\u0628\u0646\u0627\u0621 \u0641\u0647\u0645 \u0641\u064A\u0632\u064A\u0627\u0626\u064A \u0639\u0645\u064A\u0642 \u0648\u0625\u062A\u0642\u0627\u0646 \u062D\u0644 \u0627\u0644\u0645\u0633\u0627\u0626\u0644 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0645\u0639 \u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A.`;
      const defaultTips = en ? [
        "Always unify time units before applying the half-life decay formula N(t) = N\u2080(1/2)^n.",
        "Balance both mass number (A) and atomic number (Z) in every alpha and beta decay equation.",
        "Connect each reactor component (fuel, moderator, control rods, coolant) to its neutron-physics role."
      ] : [
        "\u0648\u062D\u0651\u062F \u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0632\u0645\u0646 \u062F\u0627\u0626\u0645\u0627\u064B \u0642\u0628\u0644 \u0627\u0644\u062A\u0639\u0648\u064A\u0636 \u0641\u064A \u0642\u0627\u0646\u0648\u0646 \u0639\u0645\u0631 \u0627\u0644\u0646\u0635\u0641 N(t) = N\u2080(1/2)^n.",
        "\u0648\u0627\u0632\u0646 \u0627\u0644\u0639\u062F\u062F \u0627\u0644\u0643\u062A\u0644\u064A (A) \u0648\u0627\u0644\u0639\u062F\u062F \u0627\u0644\u0630\u0631\u064A (Z) \u0641\u064A \u062C\u0645\u064A\u0639 \u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0627\u0636\u0645\u062D\u0644\u0627\u0644 \u0623\u0644\u0641\u0627 \u0648\u0628\u064A\u062A\u0627.",
        "\u0627\u0631\u0628\u0637 \u0643\u0644 \u0645\u0643\u0648\u0651\u0646 \u0641\u064A \u0627\u0644\u0645\u0641\u0627\u0639\u0644 (\u0627\u0644\u0648\u0642\u0648\u062F\u060C \u0627\u0644\u0645\u0647\u062F\u0651\u0626\u060C \u0642\u0636\u0628\u0627\u0646 \u0627\u0644\u062A\u062D\u0643\u0645\u060C \u0627\u0644\u0645\u0628\u0631\u0651\u062F) \u0628\u0648\u0638\u064A\u0641\u062A\u0647 \u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0626\u064A\u0629 \u0644\u0644\u0646\u064A\u0648\u062A\u0631\u0648\u0646\u0627\u062A."
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
              temperature: 0.4
            }
          });
          const parsed = JSON.parse((response.text || "{}").replace(/```json|```/g, "").trim());
          const courseId = VALID_PLACEMENT_COURSES.includes(parsed.courseId) ? parsed.courseId : defaultCourseId;
          return res.json({
            ok: true,
            score,
            total,
            level: String(parsed.level || defaultLevel),
            courseId,
            summary: String(parsed.summary || defaultSummary),
            tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips.map(String).slice(0, 4) : defaultTips
          });
        } catch {
        }
      }
      return res.json({
        ok: true,
        score,
        total,
        level: defaultLevel,
        courseId: defaultCourseId,
        summary: defaultSummary,
        tips: defaultTips
      });
    } catch {
      return res.status(500).json({
        ok: false,
        error: "Failed to evaluate placement quiz."
      });
    }
  });
  app.get(`${prefix}/booking/schedule`, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.bookingSchedule);
  });
  app.put(`${prefix}/admin/booking/schedule`, requireAdmin, (req, res) => {
    setPrivateNoStore(res);
    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Invalid booking schedule payload." });
      return;
    }
    if (Array.isArray(body.timeSlots)) {
      memoryStore.bookingSchedule.timeSlots = body.timeSlots.map((s) => String(s).trim()).filter((s) => s.length > 0 && s.length <= 80);
    }
    if (Array.isArray(body.disabledDates)) {
      memoryStore.bookingSchedule.disabledDates = body.disabledDates.filter((d) => d && typeof d.date === "string" && d.date.trim().length > 0).map((d) => ({
        date: d.date.trim(),
        reason: typeof d.reason === "string" ? d.reason.trim() : "\u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0644\u0644\u062D\u062C\u0632"
      }));
    }
    if (Array.isArray(body.disabledDateSlots)) {
      memoryStore.bookingSchedule.disabledDateSlots = body.disabledDateSlots.filter((d) => d && typeof d.date === "string" && typeof d.slot === "string").map((d) => ({
        date: d.date.trim(),
        slot: d.slot.trim(),
        reason: typeof d.reason === "string" ? d.reason.trim() : void 0
      }));
    }
    if (Array.isArray(body.weeklyHolidays)) {
      memoryStore.bookingSchedule.weeklyHolidays = Array.from(
        new Set(
          body.weeklyHolidays.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
        )
      );
    }
    if (Array.isArray(body.officialHolidays)) {
      memoryStore.bookingSchedule.officialHolidays = body.officialHolidays.filter((h) => h && typeof h.title === "string" && typeof h.startDate === "string").map((h) => ({
        id: typeof h.id === "string" && h.id ? h.id : `hol-${randomUUID().slice(0, 8)}`,
        title: h.title.trim(),
        startDate: h.startDate.trim(),
        endDate: typeof h.endDate === "string" && h.endDate.trim() ? h.endDate.trim() : h.startDate.trim(),
        type: h.type === "annual" ? "annual" : "official"
      }));
    }
    saveStore();
    res.json(memoryStore.bookingSchedule);
  });
  app.get(`${prefix}/notifications`, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.notifications.slice(0, 40));
  });
  app.post(`${prefix}/notifications`, (req, res) => {
    setPrivateNoStore(res);
    const body = req.body;
    const titleAr = typeof body?.titleAr === "string" ? body.titleAr.trim() : "";
    const titleEn = typeof body?.titleEn === "string" ? body.titleEn.trim() : titleAr;
    const bodyAr = typeof body?.bodyAr === "string" ? body.bodyAr.trim() : "";
    const bodyEn = typeof body?.bodyEn === "string" ? body.bodyEn.trim() : bodyAr;
    if (!titleAr && !bodyAr) {
      res.status(400).json({ error: "Notification content is required." });
      return;
    }
    const record = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: body?.category && ["discussion", "booking", "course", "study_plan", "quiz", "admin", "system"].includes(body.category) ? body.category : "system",
      titleAr: titleAr || titleEn,
      titleEn: titleEn || titleAr,
      bodyAr: bodyAr || bodyEn,
      bodyEn: bodyEn || bodyAr,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: typeof body?.recipientEmail === "string" && body.recipientEmail.includes("@") ? body.recipientEmail.trim() : "Mahmoudshaltoot.cemc@gmail.com",
      whatsappPhone: typeof body?.whatsappPhone === "string" && body.whatsappPhone.trim() ? body.whatsappPhone.trim() : "+966594756878",
      channels: ["in_app", "whatsapp", "email"]
    };
    memoryStore.notifications.unshift(record);
    if (memoryStore.notifications.length > 50) {
      memoryStore.notifications = memoryStore.notifications.slice(0, 50);
    }
    saveStore();
    res.status(201).json({ notification: record, dispatchedChannels: record.channels });
  });
  app.get(`${prefix}/bookings`, (_req, res) => {
    setPrivateNoStore(res);
    res.json(memoryStore.bookings);
  });
  app.post(`${prefix}/bookings`, (req, res) => {
    setPrivateNoStore(res);
    const body = req.body;
    const studentName = typeof body?.studentName === "string" ? body.studentName.trim() : "";
    const studentEmail = typeof body?.studentEmail === "string" && body.studentEmail.includes("@") ? body.studentEmail.trim() : "Mahmoudshaltoot.cemc@gmail.com";
    const whatsappPhone = typeof body?.whatsappPhone === "string" && body.whatsappPhone.trim() ? body.whatsappPhone.trim() : "+966594756878";
    const countryName = typeof body?.countryName === "string" && body.countryName.trim() ? body.countryName.trim() : "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629";
    const bookingType = typeof body?.bookingType === "string" && body.bookingType.trim() ? body.bookingType.trim() : "\u062C\u0644\u0633\u0629 \u0641\u0631\u062F\u064A\u0629 1-on-1";
    const topic = typeof body?.topic === "string" && body.topic.trim() ? body.topic.trim() : "\u062C\u0644\u0633\u0629 \u062A\u0642\u064A\u064A\u0645 \u0648\u062A\u062D\u062F\u064A\u062F \u0645\u0633\u062A\u0648\u0649 \u0641\u064A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629";
    const date = typeof body?.date === "string" && body.date.trim() ? body.date.trim() : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const timeSlot = typeof body?.timeSlot === "string" && body.timeSlot.trim() ? body.timeSlot.trim() : "07:00 PM (KSA)";
    if (!studentName) {
      res.status(400).json({ error: "Student name is required." });
      return;
    }
    const booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentName,
      studentEmail,
      whatsappPhone,
      countryName,
      bookingType,
      topic,
      date,
      timeSlot,
      status: "pending",
      // Strictly pending until approved by Engineer / Supervisor / Admin in Admin Panel
      meetingId: `room-nuclear-${Math.floor(1e3 + Math.random() * 9e3)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    memoryStore.bookings.unshift(booking);
    const pendingNotif = {
      id: `notif-bk-req-${Date.now()}`,
      category: "booking",
      titleAr: `\u0637\u0644\u0628 \u062D\u062C\u0632 \u062C\u062F\u064A\u062F \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0647\u0646\u062F\u0633/\u0627\u0644\u0645\u0634\u0631\u0641: ${studentName}`,
      titleEn: `New Booking Request Pending Admin Approval: ${studentName}`,
      bodyAr: `\u0646\u0648\u0639 \u0627\u0644\u062D\u062C\u0632: ${bookingType} | \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${date} | \u0627\u0644\u062A\u0648\u0642\u064A\u062A: ${timeSlot} | \u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${topic} | \u0627\u0644\u0647\u0627\u062A\u0641: ${whatsappPhone} | \u0627\u0644\u0628\u0631\u064A\u062F: ${studentEmail} \u2014 \u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u062C\u0632 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0644\u062A\u0623\u0643\u064A\u062F\u0647.`,
      bodyEn: `Type: ${bookingType} | Date: ${date} | Time: ${timeSlot} | Topic: ${topic} | Phone: ${whatsappPhone} | Email: ${studentEmail} \u2014 Pending approval in Admin Panel.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: studentEmail,
      whatsappPhone,
      channels: ["in_app", "whatsapp", "email"]
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
    const adminUser = res.locals.authenticatedUser;
    found.status = "approved";
    found.approvedAt = (/* @__PURE__ */ new Date()).toISOString();
    found.approvedBy = adminUser?.name || "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0634\u0644\u062A\u0648\u062A";
    found.reminderSentAt = (/* @__PURE__ */ new Date()).toISOString();
    const confirmNotif = {
      id: `notif-bk-conf-${Date.now()}`,
      category: "booking",
      titleAr: `\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u062C\u0632 \u0631\u0633\u0645\u064A\u0627\u064B: ${found.studentName} (${found.date})`,
      titleEn: `Booking Officially Approved & Confirmed: ${found.studentName} (${found.date})`,
      bodyAr: `\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062D\u062C\u0632 \u0645\u0646 \u0642\u0650\u0628\u0644 (${found.approvedBy}) | \u0646\u0648\u0639 \u0627\u0644\u062D\u062C\u0632: ${found.bookingType} | \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${found.date} | \u0627\u0644\u062A\u0648\u0642\u064A\u062A: ${found.timeSlot} | \u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${found.topic} | \u0627\u0644\u062F\u0648\u0644\u0629: ${found.countryName} | \u0648\u0627\u062A\u0633\u0627\u0628: ${found.whatsappPhone} | \u0627\u0644\u0628\u0631\u064A\u062F: ${found.studentEmail} | \u0645\u0639\u0631\u0641 \u0627\u0644\u0642\u0627\u0639\u0629: ${found.meetingId}`,
      bodyEn: `Approved by (${found.approvedBy}) | Type: ${found.bookingType} | Date: ${found.date} | Time: ${found.timeSlot} | Topic: ${found.topic} | Country: ${found.countryName} | WhatsApp: ${found.whatsappPhone} | Email: ${found.studentEmail} | Room ID: ${found.meetingId}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"]
    };
    const reminderNotif = {
      id: `notif-bk-rem15-${Date.now() + 1}`,
      category: "booking",
      titleAr: `\u062A\u0630\u0643\u064A\u0631 \u0642\u0628\u0644 \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0640 15 \u062F\u0642\u064A\u0642\u0629: \u062C\u0644\u0633\u0629 ${found.bookingType} (${found.studentName})`,
      titleEn: `15-Minute Pre-Session Reminder: ${found.bookingType} (${found.studentName})`,
      bodyAr: `\u062A\u0646\u0628\u064A\u0647: \u062A\u0628\u062F\u0623 \u062C\u0644\u0633\u062A\u0643 \u0627\u0644\u0645\u0624\u0643\u062F\u0629 \u0628\u0639\u062F 15 \u062F\u0642\u064A\u0642\u0629! | \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${found.date} | \u0627\u0644\u062A\u0648\u0642\u064A\u062A: ${found.timeSlot} | \u0646\u0648\u0639 \u0627\u0644\u062D\u062C\u0632: ${found.bookingType} | \u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${found.topic} | \u0627\u0644\u0642\u0627\u0639\u0629 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629: ${found.meetingId} \u2014 \u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 (${found.whatsappPhone}) \u0648\u0627\u0644\u0628\u0631\u064A\u062F (${found.studentEmail}).`,
      bodyEn: `Reminder: Your confirmed session starts in 15 minutes! | Date: ${found.date} | Time: ${found.timeSlot} | Type: ${found.bookingType} | Topic: ${found.topic} | Virtual Room: ${found.meetingId} \u2014 Dispatched via App, WhatsApp (${found.whatsappPhone}) & Email (${found.studentEmail}).`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"]
    };
    memoryStore.notifications.unshift(reminderNotif, confirmNotif);
    if (memoryStore.notifications.length > 50) {
      memoryStore.notifications = memoryStore.notifications.slice(0, 50);
    }
    saveStore();
    res.json({
      booking: found,
      confirmationNotification: confirmNotif,
      reminderNotification: reminderNotif
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
    const rejectNotif = {
      id: `notif-bk-rej-${Date.now()}`,
      category: "booking",
      titleAr: `\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632 (\u0645\u0639\u062A\u0630\u0631 / \u063A\u064A\u0631 \u0645\u062A\u0627\u062D): ${found.studentName}`,
      titleEn: `Booking Request Status Update (Reschedule Needed): ${found.studentName}`,
      bodyAr: `\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0648\u0639\u062F \u0622\u062E\u0631 \u0644\u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632 (${found.bookingType}) \u0628\u062A\u0627\u0631\u064A\u062E ${found.date} \u0627\u0644\u0633\u0627\u0639\u0629 ${found.timeSlot}.`,
      bodyEn: `Please select another slot for your booking (${found.bookingType}) on ${found.date} at ${found.timeSlot}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"]
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
    found.reminderSentAt = (/* @__PURE__ */ new Date()).toISOString();
    const reminderNotif = {
      id: `notif-bk-rem15-${Date.now()}`,
      category: "booking",
      titleAr: `\u062A\u0630\u0643\u064A\u0631 \u0639\u0627\u062C\u0644 (\u0642\u0628\u0644 \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0640 15 \u062F\u0642\u064A\u0642\u0629): ${found.studentName} \u2014 ${found.timeSlot}`,
      titleEn: `15-Minute Session Reminder: ${found.studentName} \u2014 ${found.timeSlot}`,
      bodyAr: `\u062A\u0630\u0643\u064A\u0631 \u0628\u0645\u0648\u0639\u062F \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u0645\u0624\u0643\u062F\u0629 \u0628\u0639\u062F 15 \u062F\u0642\u064A\u0642\u0629 | \u0646\u0648\u0639 \u0627\u0644\u062D\u062C\u0632: ${found.bookingType} | \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${found.date} | \u0627\u0644\u062A\u0648\u0642\u064A\u062A: ${found.timeSlot} | \u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${found.topic} | \u0627\u0644\u0642\u0627\u0639\u0629: ${found.meetingId} | \u0627\u0644\u0647\u0627\u062A\u0641: ${found.whatsappPhone} | \u0627\u0644\u0628\u0631\u064A\u062F: ${found.studentEmail}`,
      bodyEn: `15-Minute Reminder for Confirmed Session | Type: ${found.bookingType} | Date: ${found.date} | Time: ${found.timeSlot} | Topic: ${found.topic} | Room: ${found.meetingId} | Phone: ${found.whatsappPhone} | Email: ${found.studentEmail}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      recipientEmail: found.studentEmail,
      whatsappPhone: found.whatsappPhone,
      channels: ["in_app", "whatsapp", "email"]
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
    const title = "Nuclear Knowledge Hub \u2014 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 | \u0645. \u0634\u0644\u062A\u0648\u062A";
    const description = "\u0645\u0646\u0635\u0629 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621 \u0627\u0644\u0646\u0648\u0648\u064A\u0629 \u0648\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0645\u0641\u0627\u0639\u0644\u0627\u062A \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0628\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u062D\u0645\u0648\u062F \u0625\u0633\u0645\u0627\u0639\u064A\u0644 \u0634\u0644\u062A\u0648\u062A \u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u062C\u0627\u0645\u0639\u0627\u062A \u0628\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0627\u0644\u062E\u0644\u064A\u062C.";
    const distIndex = path.resolve(__dirname, "dist", "index.html");
    const rootIndex = path.resolve(__dirname, "index.html");
    const htmlPath = fs.existsSync(distIndex) ? distIndex : rootIndex;
    if (fs.existsSync(htmlPath)) {
      let html = fs.readFileSync(htmlPath, "utf8");
      html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${sharePageUrl}" />`).replace(/<meta property="twitter:url" content="[^"]*" \/>/, `<meta property="twitter:url" content="${sharePageUrl}" />`).replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${sharePageUrl}" />`).replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${shareImageUrl}" />`).replace(/<meta property="og:image:secure_url" content="[^"]*" \/>/, `<meta property="og:image:secure_url" content="${shareImageUrl}" />`).replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${shareImageUrl}" />`);
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
  <meta property="og:site_name" content="Nuclear Knowledge Hub \u2014 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0646\u0648\u0648\u064A\u0629" />
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
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(__dirname, "dist", "index.html")) ? path.resolve(__dirname, "dist") : path.resolve(__dirname, "dist", "public");
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
export {
  app,
  calculateRealisticStudentCount
};
