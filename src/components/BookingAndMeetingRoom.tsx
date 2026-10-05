import React, { useState, useRef, useEffect } from "react";
import mahmoudImg from "../assets/mahmoud-lab-coat.png";
import { CountryCode } from "../types";
import { apiFetch, appPath } from "../lib/app-path";
import { emitAppNotification } from "../lib/notifications";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  Mail,
  PenTool,
  Eraser,
  CheckCircle,
  Copy,
  ShieldAlert,
} from "lucide-react";

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

export interface BookingRecordItem {
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

const WEEKDAY_NAMES_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const WEEKDAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const GCC_COUNTRIES: CountryCode[] = [
  { id: "sa", name: "المملكة العربية السعودية", nameEn: "Saudi Arabia", code: "+966", flag: "🇸🇦", sample: "5X XXX XXXX" },
  { id: "kw", name: "دولة الكويت", nameEn: "Kuwait", code: "+965", flag: "🇰🇼", sample: "9XX XXXX" },
  { id: "ae", name: "الإمارات العربية المتحدة", nameEn: "United Arab Emirates", code: "+971", flag: "🇦🇪", sample: "5X XXX XXXX" },
  { id: "qa", name: "دولة قطر", nameEn: "Qatar", code: "+974", flag: "🇶🇦", sample: "5XX XXXX" },
  { id: "bh", name: "مملكة البحرين", nameEn: "Bahrain", code: "+973", flag: "🇧🇭", sample: "3XX XXXX" },
  { id: "om", name: "سلطنة عُمان", nameEn: "Oman", code: "+968", flag: "🇴🇲", sample: "9XX XXXX" },
  { id: "eg", name: "جمهورية مصر العربية", nameEn: "Egypt", code: "+20", flag: "🇪🇬", sample: "1X XXXX XXXX" },
  { id: "jo", name: "المملكة الأردنية الهاشمية", nameEn: "Jordan", code: "+962", flag: "🇯🇴", sample: "7X XXX XXXX" },
  { id: "iq", name: "جمهورية العراق", nameEn: "Iraq", code: "+964", flag: "🇮🇶", sample: "7X XXX XXXX" },
];

interface BookingAndMeetingRoomProps {
  language: "ar" | "en";
  userEmail?: string;
  userName?: string;
}

export function BookingAndMeetingRoom({ language, userEmail, userName }: BookingAndMeetingRoomProps) {
  const isEn = language === "en";

  const [selectedDate, setSelectedDate] = useState("2026-10-08");
  const [selectedTime, setSelectedTime] = useState("07:00 PM (KSA)");
  const [bookingType, setBookingType] = useState("جلسة فردية مباشرة 1-on-1");
  const [topic, setTopic] = useState("جلسة تقييم وتحديد مستوى في الكيمياء النووية والمفاعلات");
  const [studentName, setStudentName] = useState(
    userName && userName !== "طالب" && userName !== "Student" ? userName : "طالب جديد",
  );
  const [studentEmail, setStudentEmail] = useState(
    userEmail && userEmail.includes("@") ? userEmail : "Mahmoudshaltoot.cemc@gmail.com",
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(GCC_COUNTRIES[0]);
  const [localPhone, setLocalPhone] = useState("594756878");
  const [submitting, setSubmitting] = useState(false);

  // Schedule & Holidays configuration managed by Engineer / Supervisor / Admin
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

  // Active booking submitted by student (starts as "pending" until Admin/Engineer approves)
  const [activeBooking, setActiveBooking] = useState<BookingRecordItem | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = window.localStorage.getItem("nkh_last_booking");
      return saved ? (JSON.parse(saved) as BookingRecordItem) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (userEmail && userEmail.includes("@")) {
      setStudentEmail(userEmail);
    }
    if (userName && userName !== "طالب" && userName !== "Student") {
      setStudentName(userName);
    }
  }, [userEmail, userName]);

  useEffect(() => {
    apiFetch(appPath("/api/booking/schedule"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BookingScheduleConfig | null) => {
        if (data && Array.isArray(data.timeSlots)) {
          setSchedule(data);
          if (data.timeSlots.length > 0 && !data.timeSlots.includes(selectedTime)) {
            setSelectedTime(data.timeSlots[0]!);
          }
        }
      })
      .catch(() => undefined);
  }, []);

  // Poll booking status so when Engineer/Admin approves in AdminPanel, status updates live
  useEffect(() => {
    if (!activeBooking) return;
    const syncBookingStatus = () => {
      apiFetch(appPath("/api/bookings"))
        .then((r) => (r.ok ? r.json() : null))
        .then((list: BookingRecordItem[] | null) => {
          if (!Array.isArray(list)) return;
          const found = list.find((b) => b.id === activeBooking.id);
          if (found && (found.status !== activeBooking.status || found.reminderSentAt !== activeBooking.reminderSentAt)) {
            setActiveBooking(found);
            try {
              window.localStorage.setItem("nkh_last_booking", JSON.stringify(found));
            } catch {
              // Ignore storage limits
            }
          }
        })
        .catch(() => undefined);
    };

    syncBookingStatus();
    const intervalId = window.setInterval(syncBookingStatus, 4000);
    return () => window.clearInterval(intervalId);
  }, [activeBooking]);

  // Check if selectedDate is blocked by weekly holiday, official/annual holiday, or specific disabled date
  const getDateBlockReason = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const explicitDisabled = schedule.disabledDates.find((d) => d.date === dateStr);
    if (explicitDisabled) {
      return isEn
        ? `This date (${dateStr}) is deactivated by administration: ${explicitDisabled.reason}`
        : `هذا التاريخ (${dateStr}) غير متاح للحجز بقرار الإدارة: ${explicitDisabled.reason}`;
    }

    const official = schedule.officialHolidays.find(
      (h) => dateStr >= h.startDate && dateStr <= (h.endDate || h.startDate),
    );
    if (official) {
      return isEn
        ? `Official / Annual Holiday: ${official.title} (${official.startDate} – ${official.endDate})`
        : `عطلة رسمية / سنوية: ${official.title} (${official.startDate} إلى ${official.endDate})`;
    }

    const parsed = new Date(`${dateStr}T12:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) {
      const dayOfWeek = parsed.getUTCDay();
      if (schedule.weeklyHolidays.includes(dayOfWeek)) {
        const dayName = isEn ? WEEKDAY_NAMES_EN[dayOfWeek] : WEEKDAY_NAMES_AR[dayOfWeek];
        return isEn
          ? `${dayName} is a weekly holiday. Please choose another day.`
          : `يوم ${dayName} هو عطلة أسبوعية معتمدة. يرجى اختيار يوم آخر.`;
      }
    }

    return null;
  };

  const dateBlockReason = getDateBlockReason(selectedDate);
  const timeSlots = schedule.timeSlots;

  const isSlotDisabledOnDate = (dateStr: string, slot: string): boolean => {
    return schedule.disabledDateSlots.some((d) => d.date === dateStr && d.slot === slot);
  };

  const [isInsideRoom, setIsInsideRoom] = useState(false);

  // Classroom controls
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [whiteboardMode, setWhiteboardMode] = useState(true);
  const [penColor, setPenColor] = useState("#00e8f5");
  const [copiedLink, setCopiedLink] = useState(false);

  // Whiteboard canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateBlockReason || isSlotDisabledOnDate(selectedDate, selectedTime) || submitting) return;
    setSubmitting(true);

    const formattedPhone = `${selectedCountry.code}${localPhone.replace(/^0+/, "")}`;
    try {
      const response = await apiFetch(appPath("/api/bookings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentEmail,
          whatsappPhone: formattedPhone,
          countryName: selectedCountry.name,
          bookingType,
          topic,
          date: selectedDate,
          timeSlot: selectedTime,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as { booking: BookingRecordItem };
        setActiveBooking(data.booking);
        try {
          window.localStorage.setItem("nkh_last_booking", JSON.stringify(data.booking));
        } catch {
          // Ignore storage restrictions
        }
      }
    } finally {
      setSubmitting(false);
    }

    // Dispatch multi-channel notification that a new booking request is awaiting Admin/Engineer approval
    void emitAppNotification({
      category: "booking",
      titleAr: `طلب حجز جديد بانتظار موافقة المهندس/المشرف: ${studentName}`,
      titleEn: `New Booking Request Pending Engineer/Admin Approval: ${studentName}`,
      bodyAr: `نوع الحجز: ${bookingType} | التاريخ: ${selectedDate} | التوقيت: ${selectedTime} | الموضوع: ${topic} | الهاتف: ${formattedPhone} | البريد: ${studentEmail} — بانتظار تأكيد الحجز من لوحة التحكم.`,
      bodyEn: `Type: ${bookingType} | Date: ${selectedDate} at ${selectedTime} | Topic: ${topic} | Phone: ${formattedPhone} | Email: ${studentEmail} — Awaiting approval in Admin Panel.`,
      recipientEmail: studentEmail,
      whatsappPhone: formattedPhone,
    });
  };

  const meetingId = activeBooking?.meetingId || "room-nuclear-1001";
  const isApproved = activeBooking?.status === "approved";

  const copyMeetingLink = () => {
    const link = `https://knowledge-hub-nuclear.app/meeting/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const fullPhoneFormatted = activeBooking?.whatsappPhone || `${selectedCountry.code} ${localPhone}`;
  const fullPhoneDigits = fullPhoneFormatted.replace(/[^\d]/g, "");

  const whatsappEngineerUrl = `https://wa.me/966594756878?text=${encodeURIComponent(
    `السلام عليكم يا بشمهندس محمود، أنا الطالب ${activeBooking?.studentName || studentName} من ${activeBooking?.countryName || selectedCountry.name}.\nأرسلت طلب حجز (${activeBooking?.bookingType || bookingType}) بتاريخ ${activeBooking?.date || selectedDate} بتوقيت ${activeBooking?.timeSlot || selectedTime}.\nالموضوع: ${activeBooking?.topic || topic}.\nالبريد الإلكتروني: ${activeBooking?.studentEmail || studentEmail}\nرقم الواتساب: ${fullPhoneFormatted}\nحالة الطلب: ${isApproved ? "مؤكد ومعتمد ✓" : "بانتظار تأكيدكم من لوحة التحكم"}`,
  )}`;

  const emailDispatchUrl = `mailto:${encodeURIComponent(activeBooking?.studentEmail || studentEmail)}?cc=Mahmoudshaltoot.cemc@gmail.com&subject=${encodeURIComponent(
    isApproved
      ? `تأكيد الحجز الرسمي + تذكير قبل الموعد بـ 15 دقيقة: ${activeBooking?.bookingType || bookingType}`
      : `طلب حجز قيد المراجعة: ${activeBooking?.bookingType || bookingType}`,
  )}&body=${encodeURIComponent(
    `تفاصيل الحجز الكاملة:\n- الطالب: ${activeBooking?.studentName || studentName}\n- نوع الحجز: ${activeBooking?.bookingType || bookingType}\n- الموضوع: ${activeBooking?.topic || topic}\n- التاريخ: ${activeBooking?.date || selectedDate}\n- التوقيت: ${activeBooking?.timeSlot || selectedTime}\n- الدولة: ${activeBooking?.countryName || selectedCountry.name}\n- رقم الواتساب: ${fullPhoneFormatted}\n- البريد الإلكتروني: ${activeBooking?.studentEmail || studentEmail}\n- الحالة: ${isApproved ? "مؤكد ومعتمد من الإدارة (تذكير قبل الموعد بـ 15 دقيقة مفعّل)" : "بانتظار تأكيد المهندس أو المشرف من لوحة التحكم"}\n- معرف القاعة: ${meetingId}`,
  )}`;

  // Canvas drawing handlers
  useEffect(() => {
    if (!isInsideRoom || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(0, 232, 245, 0.4)";
    ctx.font = "14px monospace";
    ctx.strokeText("²³⁵U + ¹n → ¹⁴¹Ba + ⁹²Kr + 3¹n + ~200 MeV", 20, 40);
    ctx.strokeText("N(t) = N₀ · e^(-λt)", 20, 70);
  }, [isInsideRoom]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    draw(e);
  };

  const stopDraw = () => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto space-y-8">
      {!isInsideRoom ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Info & Booking Approval Status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="nuclear-glow rounded-2xl border border-[#162334] bg-[#090e18] p-6 space-y-4 shadow-[0_0_50px_rgba(0,232,245,0.12)]">
              <div className="flex items-center gap-3">
                <img
                  src={mahmoudImg}
                  alt="Eng Mahmoud Shaltoot"
                  className="size-16 rounded-xl object-cover border border-[#00e8f5]/50 shadow-[0_0_15px_rgba(0,232,245,0.3)]"
                />
                <div>
                  <div className="text-sm font-bold text-white">المهندس/ محمود إسماعيل شلتوت</div>
                  <div className="text-xs text-[#00e8f5]">جلسات فردية مباشرة وجهاً لوجه 1-on-1</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-medium">
                    <span className="size-2 rounded-full bg-emerald-400 pulse-dot" />
                    <span>{isEn ? "Supervised Approval & Smart Reminders" : "اعتماد الحجوزات وتنبيهات ذكية قبل الموعد بـ 15 دقيقة"}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isEn
                  ? "Submit your session booking request below. Your booking is confirmed once approved by Eng. Mahmoud or an authorized administrator in the Admin Panel, triggering instant confirmation and a 15-minute pre-session reminder via In-App, WhatsApp, and Email."
                  : "عند تقديم طلب الحجز، لا يتم تأكيد الحجز نهائياً إلا بعد مراجعته وقبوله من قِبل المهندس محمود شلتوت أو المشرف المفوض في لوحة التحكم. وفور القبول يتم إرسال إشعار التأكيد الكامل وتذكير قبل الموعد بـ 15 دقيقة عبر التطبيق والواتساب والبريد الإلكتروني المسجل."}
              </p>

              <div className="rounded-xl border border-[#00e8f5]/30 bg-[#050912] p-3.5 text-[11px] text-slate-300 space-y-1.5">
                <div className="font-bold text-[#00e8f5] flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>{isEn ? "Multi-Channel Confirmation & 15-Min Reminder:" : "آلية تأكيد الحجز والتذكير الثلاثي:"}</span>
                </div>
                <p>
                  {isEn
                    ? "1. Request submitted as Pending → 2. Approved in Admin Panel → 3. Confirmation + 15-min reminder sent via App, WhatsApp & Email."
                    : "١. يُسجّل الطلب كـ «بانتظار الموافقة» ← ٢. يقبله المهندس أو المشرف من لوحة التحكم ← ٣. يصلك تأكيد فوري + تذكير قبل الموعد بـ 15 دقيقة على الواتساب والإيميل والتطبيق."}
                </p>
              </div>
            </div>

            {/* Active Booking Status Card (Pending vs Approved vs Rejected) */}
            {activeBooking && (
              <div
                className={`nuclear-glow rounded-2xl border p-6 space-y-4 ${
                  isApproved
                    ? "border-emerald-500/50 bg-[#06141d] shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                    : activeBooking.status === "rejected"
                      ? "border-rose-500/50 bg-[#190812]"
                      : "border-amber-500/50 bg-[#141007] shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex items-center gap-2 font-bold text-sm ${
                      isApproved
                        ? "text-emerald-400"
                        : activeBooking.status === "rejected"
                          ? "text-rose-400"
                          : "text-amber-300"
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle className="size-5 shrink-0" />
                        <span>
                          {isEn
                            ? "Booking Officially Approved & Confirmed!"
                            : "تم تأكيد وقبول الحجز من المهندس / المشرف!"}
                        </span>
                      </>
                    ) : activeBooking.status === "rejected" ? (
                      <>
                        <AlertCircle className="size-5 shrink-0" />
                        <span>
                          {isEn
                            ? "Booking Slot Unavailable — Please Reschedule"
                            : "عتذر عن هذا الموعد — يرجى اختيار توقيت آخر"}
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="size-5 shrink-0" />
                        <span>
                          {isEn
                            ? "Pending Approval by Engineer / Admin in Control Panel"
                            : "طلب الحجز قيد المراجعة — بانتظار تأكيد المهندس أو المشرف"}
                        </span>
                      </>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase ${
                      isApproved
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : activeBooking.status === "rejected"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {activeBooking.status === "approved"
                      ? isEn ? "APPROVED" : "مؤكد ✓"
                      : activeBooking.status === "rejected"
                        ? isEn ? "RESCHEDULE" : "معتذر"
                        : isEn ? "PENDING" : "بانتظار التأكيد"}
                  </span>
                </div>

                {!isApproved && activeBooking.status === "pending" && (
                  <p className="text-xs text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/30 bg-amber-950/30 p-3">
                    {isEn
                      ? "Your booking is NOT confirmed yet until Eng. Mahmoud or an authorized supervisor approves it in the Admin Panel (Bookings tab). Once approved, you will receive full confirmation and a 15-minute reminder on WhatsApp, Email, and In-App."
                      : "لا يتم تأكيد الحجز إلا بعد قبوله واعتماده من قِبل المهندس أو المشرف المفوض في لوحة التحكم (قسم طلبات الحجز). فور القبول سيتم تفعيل الغرفة وإرسال التأكيد والتذكير قبل الموعد بـ 15 دقيقة على الواتساب والإيميل والتطبيق."}
                  </p>
                )}

                {isApproved && (
                  <p className="text-xs text-emerald-200/90 leading-relaxed rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3">
                    {isEn
                      ? `Approved by ${activeBooking.approvedBy || "Administration"}. Confirmation and 15-minute pre-session reminder have been dispatched to WhatsApp, Email, and In-App notifications.`
                      : `تم اعتماد وتأكيد الحجز بواسطة (${activeBooking.approvedBy || "إدارة المنصة"}). تم إرسال إشعار التأكيد الكامل وجدولة التذكير قبل الموعد بـ 15 دقيقة على الواتساب والبريد الإلكتروني والتطبيق.`}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-300 rounded-xl border border-slate-800/80 bg-[#050912]/90 p-3.5">
                  <div>
                    {isEn ? "Student:" : "اسم الطالب:"}{" "}
                    <strong className="text-white">{activeBooking.studentName}</strong>
                  </div>
                  <div>
                    {isEn ? "Booking Type:" : "نوع الحجز:"}{" "}
                    <strong className="text-[#00e8f5]">{activeBooking.bookingType}</strong>
                  </div>
                  <div>
                    {isEn ? "Topic:" : "الموضوع والتفاصيل:"}{" "}
                    <strong className="text-white">{activeBooking.topic}</strong>
                  </div>
                  <div>
                    {isEn ? "Date & Time:" : "التاريخ والتوقيت:"}{" "}
                    <strong className="text-white" dir="ltr">
                      {activeBooking.date} — {activeBooking.timeSlot}
                    </strong>
                  </div>
                  <div>
                    {isEn ? "Country:" : "الدولة:"}{" "}
                    <strong className="text-white">{activeBooking.countryName}</strong>
                  </div>
                  <div>
                    {isEn ? "WhatsApp:" : "رقم الواتساب:"}{" "}
                    <strong className="text-[#00e8f5] font-mono" dir="ltr">
                      {activeBooking.whatsappPhone}
                    </strong>
                  </div>
                  <div>
                    {isEn ? "Registered Email:" : "البريد الإلكتروني المسجل:"}{" "}
                    <strong className="text-slate-200 font-mono" dir="ltr">
                      {activeBooking.studentEmail}
                    </strong>
                  </div>
                  {isApproved && (
                    <div>
                      {isEn ? "Classroom ID:" : "معرف القاعة الافتراضية:"}{" "}
                      <code className="text-emerald-300 font-mono">{activeBooking.meetingId}</code>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  {isApproved && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInsideRoom(true)}
                        className="nuclear-glow flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#00e8f5] py-3 text-xs font-bold text-slate-950 hover:brightness-110 cursor-pointer"
                      >
                        <Video className="size-4" />
                        <span>{isEn ? "Enter Live Classroom Now" : "دخول الغرفة الافتراضية المؤكدة الآن"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={copyMeetingLink}
                        className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                        title="نسخ رابط الاجتماع"
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={whatsappEngineerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/60 py-2.5 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition-all cursor-pointer"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>{isEn ? "Send via WhatsApp" : "إشعار واتساب بالتفاصيل"}</span>
                    </a>
                    <a
                      href={emailDispatchUrl}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[#00e8f5]/40 bg-cyan-950/50 py-2.5 px-3 text-xs font-bold text-[#00e8f5] hover:bg-cyan-900/50 transition-all cursor-pointer"
                    >
                      <Mail className="size-3.5" />
                      <span>{isEn ? "Send to Registered Email" : "إرسال للبريد الإلكتروني"}</span>
                    </a>
                  </div>

                  {fullPhoneDigits && (
                    <a
                      href={`https://wa.me/${fullPhoneDigits}?text=${encodeURIComponent(
                        `مرحباً ${activeBooking.studentName}، تفاصيل حجزك في منصة الكيمياء النووية مع المهندس محمود شلتوت:\n- نوع الحجز: ${activeBooking.bookingType}\n- الموضوع: ${activeBooking.topic}\n- التاريخ: ${activeBooking.date}\n- التوقيت: ${activeBooking.timeSlot}\n- الحالة: ${isApproved ? "مؤكد ومعتمد ✓ (تذكير قبل الموعد بـ 15 دقيقة)" : "بانتظار تأكيد الإدارة"}\n- القاعة: https://knowledge-hub-nuclear.app/meeting/${activeBooking.meetingId}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 py-2 text-[11px] font-bold text-slate-300 hover:border-[#00e8f5]/50 transition-all cursor-pointer"
                    >
                      <span>
                        {isEn
                          ? `Send Reminder Copy to My WhatsApp (${activeBooking.whatsappPhone})`
                          : `إرسال نسخة التفاصيل والتذكير إلى رقمي (${activeBooking.whatsappPhone})`}
                      </span>
                    </a>
                  )}
                </div>

                {copiedLink && (
                  <div className="text-[10px] text-emerald-300 text-center font-bold">
                    {isEn ? "Classroom link copied!" : "تم نسخ رابط القاعة إلى الحافظة!"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Booking Request Form */}
          <div className="nuclear-glow lg:col-span-7 rounded-2xl border border-[#162334] bg-[#090e18] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#162334] pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon className="size-5 text-[#00e8f5]" />
                <span>{isEn ? "Request a Session Booking" : "طلب حجز موعد مع المهندس محمود شلتوت"}</span>
              </h2>
              <p className="text-xs text-[#78879b] mt-1">
                {isEn
                  ? "Fill out your details and preferred slot. Bookings are confirmed once approved by the Engineer or Admin in the Control Panel."
                  : "أدخل بياناتك ونوع الحجز والتاريخ والتوقيت. يتم تأكيد الحجز رسمياً فور قبوله من المهندس أو المشرف في لوحة التحكم."}
              </p>
            </div>

            <form onSubmit={(e) => void handleBook(e)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isEn ? "Your Full Name" : "اسم الطالب بالكامل"}
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-xs text-white focus:border-[#00e8f5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isEn ? "Registered Email (for Confirmation & Reminder)" : "البريد الإلكتروني المسجل (للتأكيد والتذكير)"}
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#00e8f5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isEn ? "Booking Type" : "نوع الحجز"}
                  </label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-xs text-white focus:border-[#00e8f5] focus:outline-none cursor-pointer"
                  >
                    <option value="جلسة فردية مباشرة 1-on-1">
                      {isEn ? "1-on-1 Private Live Session" : "جلسة فردية مباشرة 1-on-1"}
                    </option>
                    <option value="جلسة تقييم وتحديد مستوى">
                      {isEn ? "Diagnostic Assessment Session" : "جلسة تقييم وتحديد مستوى"}
                    </option>
                    <option value="مراجعة اختبارات جامعية وتحصيلي">
                      {isEn ? "University Exam & Placement Review" : "مراجعة اختبارات جامعية وتحصيلي"}
                    </option>
                    <option value="إشراف مشروع تخرج أو بحث نووي">
                      {isEn ? "Graduation Project / Nuclear Research Advising" : "إشراف مشروع تخرج أو بحث نووي"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isEn ? "Gulf / Arab Country" : "الدولة الخليجية / العربية"}
                  </label>
                  <select
                    value={selectedCountry.id}
                    onChange={(e) => {
                      const found = GCC_COUNTRIES.find((c) => c.id === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3 py-2.5 text-xs text-white focus:border-[#00e8f5] focus:outline-none cursor-pointer"
                  >
                    <optgroup label="دول مجلس التعاون الخليجي (GCC)">
                      {GCC_COUNTRIES.slice(0, 6).map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="دول عربية أخرى">
                      {GCC_COUNTRIES.slice(6).map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Phone with selected dial code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? "WhatsApp Number (for Approval & 15-Min Reminder)" : "رقم الواتساب (لاستلام إشعار التأكيد والتذكير قبل الموعد بـ 15 دقيقة)"}
                </label>
                <div className="flex rounded-xl border border-slate-700 bg-[#050912] overflow-hidden focus-within:border-[#00e8f5]">
                  <div
                    className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-2.5 text-xs font-mono text-[#00e8f5] border-e border-slate-700 font-bold"
                    dir="ltr"
                  >
                    <span>{selectedCountry.code}</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    placeholder={selectedCountry.sample}
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-white focus:outline-none font-mono tracking-wider"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? "Select Date" : "تاريخ الموعد المطلوب"}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-xs text-white focus:border-[#00e8f5] focus:outline-none"
                />
                {dateBlockReason && (
                  <div
                    role="alert"
                    className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{dateBlockReason}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? "Available Time Slots (KSA Time)" : "المواعيد والتوقيتات المتاحة (بتوقيت مكة المكرمة)"}
                </label>
                {timeSlots.length === 0 ? (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200">
                    {isEn
                      ? "No time slots are currently open. Please check back later."
                      : "لا توجد توقيتات مفعّلة حالياً من قِبل الإدارة."}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const disabledOnDate = isSlotDisabledOnDate(selectedDate, slot);
                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={disabledOnDate}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            disabledOnDate
                              ? "border-rose-900/40 bg-rose-950/20 text-rose-400/50 line-through cursor-not-allowed"
                              : selectedTime === slot
                                ? "border-[#00e8f5] bg-[#00e8f5]/15 text-[#00e8f5] shadow-[0_0_12px_rgba(0,232,245,0.2)] cursor-pointer"
                                : "border-slate-800 bg-[#050912] text-slate-300 hover:border-slate-700 cursor-pointer"
                          }`}
                        >
                          <span dir="ltr">{slot}</span>
                          {disabledOnDate && (
                            <span className="block text-[10px] text-rose-400">
                              {isEn ? "Unavailable" : "غير متاح"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? "Consultation Focus / Topic & Details" : "موضوع الجلسة والتفاصيل المطلوبة"}
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#050912] px-3.5 py-2.5 text-xs text-white focus:border-[#00e8f5] focus:outline-none"
                >
                  <option value="جلسة تقييم وتحديد مستوى في الكيمياء النووية والمفاعلات">
                    جلسة تقييم وتحديد مستوى في الكيمياء النووية والمفاعلات
                  </option>
                  <option value="حل مسائل عمر النصف والنشاطية الإشعاعية">
                    حل مسائل عمر النصف والنشاطية الإشعاعية
                  </option>
                  <option value="شرح تصميم قلب المفاعل والتحكم في الانشطار">
                    شرح تصميم قلب المفاعل والتحكم في الانشطار
                  </option>
                  <option value="مراجعة مكثفة لاختبارات التحصيلي أو المقررات الجامعية">
                    مراجعة مكثفة لاختبارات التحصيلي أو المقررات الجامعية
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    Boolean(dateBlockReason) ||
                    timeSlots.length === 0 ||
                    isSlotDisabledOnDate(selectedDate, selectedTime)
                  }
                  className="btn-primary nuclear-glow w-full py-3.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting
                    ? isEn
                      ? "Submitting Booking Request..."
                      : "جارٍ إرسال طلب الحجز للمهندس والمشرف..."
                    : isEn
                      ? "Submit Booking Request (Awaits Engineer / Admin Confirmation)"
                      : "إرسال طلب الحجز (يتم التأكيد فور موافقة المهندس أو المشرف)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Live Virtual Classroom Interface */
        <div className="rounded-3xl border border-[#00e8f5]/40 bg-[#040813] overflow-hidden shadow-[0_0_90px_rgba(0,232,245,0.2)] space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>قاعة الاجتماع المباشر: {meetingId}</span>
                  <span className="text-[10px] font-mono rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 border border-cyan-500/40">
                    LIVE WEBRTC
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  المهندس محمود شلتوت • {activeBooking?.studentName || studentName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWhiteboardMode(!whiteboardMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  whiteboardMode ? "bg-[#00e8f5] text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <PenTool className="size-3.5" />
                <span>
                  {whiteboardMode
                    ? isEn
                      ? "Whiteboard ON"
                      : "السبورة التفاعلية مفعّلة"
                    : isEn
                      ? "Show Whiteboard"
                      : "إظهار السبورة"}
                </span>
              </button>

              <button
                onClick={() => setIsInsideRoom(false)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition-all cursor-pointer"
              >
                {isEn ? "Leave Room" : "مغادرة الجلسة"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative aspect-video rounded-2xl border border-cyan-500/30 bg-black overflow-hidden shadow-lg flex items-center justify-center">
              <img src={mahmoudImg} alt="Eng Mahmoud" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                المهندس/ محمود شلتوت (المدرّب)
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                HD 1080p
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl border border-slate-800 bg-[#081020] overflow-hidden shadow-lg flex flex-col items-center justify-center text-slate-400">
              {cameraOn ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="size-16 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xl">
                    {(activeBooking?.studentName || studentName)[0] || "ط"}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">كاميرا الطالب متصلة</div>
                </div>
              ) : (
                <div className="text-xs">الكاميرا معطلة</div>
              )}
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                {activeBooking?.studentName || studentName} (أنت)
              </div>
            </div>
          </div>

          {whiteboardMode && (
            <div className="rounded-2xl border border-cyan-500/30 bg-[#050a14] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">السبورة التفاعلية لمعادلات الكيمياء النووية:</span>
                  <div className="flex items-center gap-1">
                    {["#00e8f5", "#ef2b88", "#10b981", "#f59e0b", "#ffffff"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setPenColor(color)}
                        style={{ backgroundColor: color }}
                        className={`size-5 rounded-full border cursor-pointer ${
                          penColor === color ? "scale-125 border-white shadow-lg" : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  <Eraser className="size-3.5" />
                  <span>مسح السبورة</span>
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={800}
                height={260}
                onMouseDown={startDraw}
                onMouseUp={stopDraw}
                onMouseMove={draw}
                onMouseLeave={stopDraw}
                className="w-full h-[220px] rounded-xl border border-slate-800 bg-[#050a14] cursor-crosshair touch-none"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`flex size-11 items-center justify-center rounded-full transition-all cursor-pointer ${
                micOn ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-rose-600 text-white"
              }`}
            >
              {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`flex size-11 items-center justify-center rounded-full transition-all cursor-pointer ${
                cameraOn ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-rose-600 text-white"
              }`}
            >
              {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
            </button>

            <button
              onClick={() => setIsSharingScreen(!isSharingScreen)}
              className={`flex size-11 items-center justify-center rounded-full transition-all cursor-pointer ${
                isSharingScreen ? "bg-[#00e8f5] text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title="مشاركة الشاشة"
            >
              <Monitor className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
