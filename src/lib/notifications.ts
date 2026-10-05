import { apiFetch, appPath } from "./app-path";

export interface AppNotificationItem {
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

const LOCAL_NOTIFICATIONS_KEY = "nkh_live_notifications";

export function getLocalNotifications(): AppNotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalNotification(item: AppNotificationItem): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalNotifications();
    const updated = [item, ...existing.filter((n) => n.id !== item.id)].slice(0, 40);
    window.localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage limits
  }
}

export function buildWhatsAppDispatchUrl(item: AppNotificationItem, isEn = false): string {
  const phone = (item.whatsappPhone || "+966594756878").replace(/[^\d]/g, "") || "966594756878";
  const text = isEn
    ? `[Nuclear Knowledge Hub Notification]\n• ${item.titleEn}\n${item.bodyEn}\nRegistered Email: ${item.recipientEmail}`
    : `[إشعار منصة الكيمياء النووية]\n• ${item.titleAr}\n${item.bodyAr}\nالبريد المسجل: ${item.recipientEmail}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildEmailDispatchUrl(item: AppNotificationItem, isEn = false): string {
  const recipient = item.recipientEmail || "Mahmoudshaltoot.cemc@gmail.com";
  const cc =
    recipient.toLowerCase() !== "mahmoudshaltoot.cemc@gmail.com"
      ? "&cc=Mahmoudshaltoot.cemc@gmail.com"
      : "";
  const subject = encodeURIComponent(isEn ? item.titleEn : item.titleAr);
  const body = encodeURIComponent(
    isEn
      ? `${item.titleEn}\n\n${item.bodyEn}\n\n— Sent via Nuclear Knowledge Hub (Eng. Mahmoud Ismail Shaltoot)`
      : `${item.titleAr}\n\n${item.bodyAr}\n\n— إشعار تلقائي من منصة الكيمياء النووية (المهندس محمود إسماعيل شلتوت)`,
  );
  return `mailto:${recipient}?subject=${subject}&body=${body}${cc}`;
}

export async function emitAppNotification(input: {
  category: AppNotificationItem["category"];
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  recipientEmail?: string;
  whatsappPhone?: string;
}): Promise<AppNotificationItem> {
  const fallbackItem: AppNotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: input.category,
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    bodyAr: input.bodyAr,
    bodyEn: input.bodyEn,
    createdAt: new Date().toISOString(),
    recipientEmail:
      input.recipientEmail && input.recipientEmail.includes("@")
        ? input.recipientEmail
        : "Mahmoudshaltoot.cemc@gmail.com",
    whatsappPhone: input.whatsappPhone || "+966594756878",
    channels: ["in_app", "whatsapp", "email"],
  };

  saveLocalNotification(fallbackItem);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nkh:notification", { detail: fallbackItem }));
  }

  try {
    const res = await apiFetch(appPath("/api/notifications"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fallbackItem),
    });
    if (res.ok) {
      const data = (await res.json()) as { notification?: AppNotificationItem };
      if (data.notification) {
        saveLocalNotification(data.notification);
        return data.notification;
      }
    }
  } catch {
    // Offline fallback already saved in localStorage and dispatched to UI
  }

  return fallbackItem;
}
