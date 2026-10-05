import React, { useState } from "react";
import { Download, HelpCircle, MessageSquare, Send, X } from "lucide-react";

interface SupportWidgetProps {
  language: "ar" | "en";
}

export function SupportWidget({ language }: SupportWidgetProps) {
  const isEn = language === "en";
  const [isOpen, setIsOpen] = useState(false);
  const [ticketQuestion, setTicketQuestion] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    const readLocalData = (key: string) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    };
    const data = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      platform: "Nuclear Knowledge Hub",
      data: {
        profile: readLocalData("nuclear_hub_user"),
        completedLessonIds: readLocalData("nuclear_hub_completed_lessons"),
        studyPlan: readLocalData("nuclear_hub_active_plan"),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nuclear-hub-backup-${Date.now()}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupStatus(
      isEn ? "Local backup downloaded." : "تم تنزيل النسخة الاحتياطية المحلية.",
    );
    setTimeout(() => setBackupStatus(null), 3500);
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuestion.trim()) return;
    const subject = encodeURIComponent(
      isEn ? "Nuclear Knowledge Hub support request" : "طلب دعم لمنصة المعرفة النووية",
    );
    const body = encodeURIComponent(ticketQuestion.trim());
    window.location.href =
      `mailto:Mahmoudshaltoot.cemc@gmail.com?subject=${subject}&body=${body}`;
    setSentSuccess(true);
    setTicketQuestion("");
    setTimeout(() => setSentSuccess(false), 6000);
  };

  return (
    <>
      {/* Floating Support Button matching Screenshots 1-3 */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={isEn ? "Help, WhatsApp & local backup" : "المساعدة والتواصل والنسخ الاحتياطي"}
        className="nuclear-glow fixed bottom-6 left-6 z-40 grid size-13 place-items-center rounded-full bg-[#00e8f5] text-[#031218] shadow-[0_0_32px_rgba(0,232,245,0.65)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title={isEn ? "Help and local backup" : "المساعدة والنسخ الاحتياطي المحلي"}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.1 1 4.1 2.7 5.5-.2 1.2-.8 2.8-1.7 3.9-.2.3 0 .7.4.6 1.8-.3 3.7-1.1 5-2 1.1.3 2.3.5 3.6.5 5.5 0 10-3.6 10-8s-4.5-8.5-10-8.5z" />
        </svg>
      </button>

      {/* Support Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/40 bg-[#070d1a] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                  <HelpCircle className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isEn ? "Help & local data backup" : "المساعدة والنسخ الاحتياطي المحلي"}
                  </h3>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <HelpCircle className="size-3" />
                    <span>{isEn ? "Your data stays in this browser until you export it." : "تبقى بياناتك في هذا المتصفح حتى تصدّرها."}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {/* Local Backup Tools */}
            <div className="rounded-xl border border-slate-800 bg-[#091122] p-3.5 space-y-2">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{isEn ? "Local backup" : "نسخة احتياطية محلية"}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isEn
                  ? "Downloads your saved profile and learning progress from this browser. The file is not encrypted and is not sent to a server."
                  : "ينزّل ملفًا يتضمن ملفك الشخصي وتقدمك المحفوظ في هذا المتصفح. الملف غير مشفّر ولا يُرسل إلى خادم."}
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={handleExportBackup}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>{isEn ? "Download local backup" : "تنزيل نسخة احتياطية محلية"}</span>
                </button>
              </div>
              {backupStatus && <div className="text-[10px] text-emerald-400 text-center font-bold">{backupStatus}</div>}
            </div>

            {/* Support email draft form */}
            <form onSubmit={handleSendTicket} className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                 {isEn ? "Draft a support email:" : "اكتب رسالة دعم بالبريد الإلكتروني:"}
              </label>
              <textarea
                rows={3}
                required
                value={ticketQuestion}
                onChange={(e) => setTicketQuestion(e.target.value)}
                placeholder={isEn ? "Describe your question or issue..." : "اكتب استفسارك أو المشكلة التي تواجهها..."}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <Send className="size-3.5" />
                 <span>{isEn ? "Open email draft" : "فتح مسودة بريد إلكتروني"}</span>
              </button>
            </form>

            {sentSuccess && (
              <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-center text-xs text-emerald-300 font-bold">
                {isEn
                  ? "An email draft should open. Send it from your email app to contact support."
                  : "يُفترض أن تفتح مسودة بريد إلكتروني. أرسلها من تطبيق البريد للتواصل مع الدعم."}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
