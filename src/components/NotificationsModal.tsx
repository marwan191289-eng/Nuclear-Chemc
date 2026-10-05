import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2, Mail, Megaphone, MessageSquare, X } from "lucide-react";
import { apiFetch, appPath } from "../lib/app-path";
import {
  AppNotificationItem,
  buildEmailDispatchUrl,
  buildWhatsAppDispatchUrl,
  getLocalNotifications,
} from "../lib/notifications";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking: () => void;
  onNavigateToSpacedRepetition: () => void;
  language: "ar" | "en";
}

interface ServerAnnouncement {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  priority: "normal" | "important" | "urgent";
  createdAt: string;
  author: string;
}

export function NotificationsModal({
  isOpen,
  onClose,
  onNavigateToBooking,
  onNavigateToSpacedRepetition,
  language,
}: NotificationsModalProps) {
  const isEn = language === "en";
  const [serverAnnouncements, setServerAnnouncements] = useState<ServerAnnouncement[]>([]);
  const [liveNotifications, setLiveNotifications] = useState<AppNotificationItem[]>(() =>
    getLocalNotifications(),
  );

  useEffect(() => {
    if (!isOpen) return;
    setLiveNotifications(getLocalNotifications());

    apiFetch(appPath("/api/notifications"))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const local = getLocalNotifications();
          const mergedMap = new Map<string, AppNotificationItem>();
          for (const item of [...local, ...data]) {
            if (item && item.id) mergedMap.set(item.id, item);
          }
          setLiveNotifications(Array.from(mergedMap.values()).slice(0, 35));
        }
      })
      .catch(() => undefined);

    apiFetch(appPath("/api/announcements"))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setServerAnnouncements(data);
      })
      .catch(() => undefined);
  }, [isOpen]);

  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const custom = event as CustomEvent<AppNotificationItem>;
      if (custom.detail) {
        setLiveNotifications((prev) => [
          custom.detail,
          ...prev.filter((n) => n.id !== custom.detail.id),
        ]);
      }
    };
    window.addEventListener("nkh:notification", handleNewNotification);
    return () => window.removeEventListener("nkh:notification", handleNewNotification);
  }, []);

  if (!isOpen) return null;

  const builtInNotifications = [
    {
      id: "n-1",
      title: isEn
        ? "Smart Reminder: Live 1-on-1 Reactor Session"
        : "تنبيه ذكي: موعد جلسة تدريب المفاعلات المباشرة",
      text: isEn
        ? "Your 1-on-1 review session with Eng. Mahmoud starts soon. Open the virtual classroom to check your audio and whiteboard."
        : "جلسة المراجعة الفردية مع المهندس محمود تبدأ قريباً. يرجى الدخول إلى القاعة الافتراضية للتأكد من الميكروفون والسبورة.",
      time: isEn ? "10m ago" : "قبل 10 دقائق",
      action: () => {
        onClose();
        onNavigateToBooking();
      },
      actionText: isEn ? "Open Virtual Classroom →" : "دخول القاعة الافتراضية ←",
    },
    {
      id: "n-2",
      title: isEn
        ? "Spaced Repetition Flashcards Due"
        : "مراجعة متباعدة مستحقة (Spaced Repetition)",
      text: isEn
        ? "5 flashcards on half-life formulas and the nuclear belt of stability are ready for active recall."
        : "لديك 5 بطاقات جديدة جاهزة للمراجعة في قوانين عمر النصف وحزام الاستقرار النووي لترسيخها في الذاكرة طويلة المدى.",
      time: isEn ? "Today" : "اليوم",
      action: () => {
        onClose();
        onNavigateToSpacedRepetition();
      },
      actionText: isEn ? "Start Flashcard Review (+15 XP) →" : "بدء مراجعة البطاقات (+15 XP) ←",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="nuclear-glow relative w-full max-w-lg rounded-3xl border border-[#00e8f5]/40 bg-[#070d1a] p-6 shadow-2xl space-y-4 max-h-[86vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#ef2b88]/20 text-[#ef2b88]">
              <Bell className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isEn
                  ? "Multi-Channel Smart Notifications"
                  : "مركز الإشعارات الذكي (التطبيق + واتساب + البريد)"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEn
                  ? "Real-time alerts for Study Discussion, Bookings, Courses & Admin updates"
                  : "تنبيهات فورية للنقاش الدراسي، الحجوزات، الدورات، وتحديثات الإدارة"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close notifications" : "إغلاق التنبيهات"}
            className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Live Activity & Study Discussion Notifications */}
          {liveNotifications.map((notif) => (
            <div
              key={notif.id}
              className="rounded-2xl border border-[#00e8f5]/35 bg-[#091324] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <strong className="text-[#00e8f5] flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>{isEn ? notif.titleEn : notif.titleAr}</span>
                </strong>
                <span className="text-slate-400 font-mono text-[10px] shrink-0" dir="ltr">
                  {new Date(notif.createdAt).toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {isEn ? notif.bodyEn : notif.bodyAr}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-[10px]">
                <span className="text-emerald-400 font-medium">
                  {isEn
                    ? "Channels: In-App ✓ · WhatsApp ✓ · Email ✓"
                    : "القنوات: التطبيق ✓ · واتساب ✓ · البريد المسجل ✓"}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppDispatchUrl(notif, isEn)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 font-bold text-emerald-300 hover:bg-emerald-900/50 transition"
                  >
                    <MessageSquare className="size-3" />
                    <span>{isEn ? "WhatsApp" : "واتساب"}</span>
                  </a>
                  <a
                    href={buildEmailDispatchUrl(notif, isEn)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#00e8f5]/40 bg-cyan-950/40 px-2.5 py-1 font-bold text-[#00e8f5] hover:bg-cyan-900/50 transition"
                  >
                    <Mail className="size-3" />
                    <span>{isEn ? "Email" : "البريد"}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Official Server Announcements */}
          {serverAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-2xl border border-slate-800 bg-[#081122] p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-cyan-300 flex items-center gap-1.5">
                  <Megaphone className="size-3.5" />
                  <span>{isEn ? ann.titleEn : ann.titleAr}</span>
                </strong>
                <span className="text-slate-400 font-mono text-[10px]">
                  {new Date(ann.createdAt).toLocaleDateString(isEn ? "en-US" : "ar-SA")}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isEn ? ann.bodyEn : ann.bodyAr}
              </p>
            </div>
          ))}

          {/* Built-In Smart Reminders */}
          {builtInNotifications.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-slate-800 bg-[#081122] p-3.5 space-y-2 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-cyan-300">{n.title}</strong>
                <span className="text-slate-400 font-mono text-[10px]">{n.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
              {n.action && (
                <button
                  type="button"
                  onClick={n.action}
                  className="text-[11px] font-bold text-[#ef2b88] hover:underline block pt-1 cursor-pointer"
                >
                  {n.actionText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
