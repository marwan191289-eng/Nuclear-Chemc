import React, { useState } from "react";
import { ChatMessage } from "../types";
import {
  AppNotificationItem,
  buildEmailDispatchUrl,
  buildWhatsAppDispatchUrl,
  emitAppNotification,
} from "../lib/notifications";
import {
  Bell,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";

interface ChatAndResourcesProps {
  language: "ar" | "en";
  userEmail?: string;
  userName?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "instructor",
    senderName: "المهندس محمود شلتوت",
    text: "أهلاً بكم يا شباب في مجتمع الكيمياء النووية. إذا كان لديكم أي سؤال في مسائل عمر النصف أو تصميم قلب المفاعل، اطرحوه هنا مباشرة وسأجيبكم بنفسي.",
    timestamp: "10:15 AM",
  },
  {
    id: "msg-2",
    sender: "student",
    senderName: "فيصل الشمري (طالب)",
    text: "مهندس محمود، في حسابات الكتلة الحرجة لمفاعل الماء المضغوط (PWR)، هل نعتبر نسبة التخصيب 3.5% كافية لتوليد 1000 ميجاوات حراري؟",
    timestamp: "10:22 AM",
  },
  {
    id: "msg-3",
    sender: "instructor",
    senderName: "المهندس محمود شلتوت",
    text: "نعم يا فيصل، نسبة التخصيب بين 3% إلى 5% من اليورانيوم-235 في مفاعلات PWR كافية جداً لدورة وقود تمتد من 18 إلى 24 شهراً مع استخدام الماء الخفيف كمهدئ ومبرد تحت ضغط 155 بار لمنع الغليان في القلب.",
    timestamp: "10:25 AM",
  },
];

const SHARED_FILES = [
  {
    id: "summary-formulas",
    title: "ملخص قوانين الكيمياء النووية الشامل (طاقة الربط وعمر النصف)",
    titleEn: "Complete Nuclear Chemistry Formula Sheet (Binding Energy & Half-Life)",
    category: "ملخصات",
    categoryEn: "Formula Sheets",
    size: "2.4 MB",
    pages: "14 صفحة",
    downloads: 384,
    content: `Nuclear Knowledge Hub — مركز المعرفة النووية
المهندس محمود إسماعيل شلتوت (12+ سنة خبرة)
=================================================
ملخص قوانين الكيمياء النووية الشامل:
1. نقص الكتلة (Mass Defect):
   Δm = [Z · m_p + (A - Z) · m_n] - m_nucleus
2. طاقة الربط النووي (Binding Energy):
   E_b = Δm · c²  (حيث 1 amu ≈ 931.5 MeV)
3. قانون الاضمحلال الإشعاعي وعمر النصف:
   N(t) = N₀ · (1/2)^(t / T_1/2) = N₀ · e^(-λt)
   λ = ln(2) / T_1/2 ≈ 0.693 / T_1/2
4. النشاطية الإشعاعية (Activity):
   A(t) = λ · N(t)  (الوحدة الدولية: Becquerel = 1 تفكك/ثانية)
`,
  },
  {
    id: "segre-chart",
    title: "مخطط سغري والنظائر المشعة وحزام الاستقرار النووي (Segrè Chart)",
    titleEn: "Segrè Chart of Nuclides & Nuclear Belt of Stability Guide",
    category: "رسوم توضيحية",
    categoryEn: "Diagrams",
    size: "4.8 MB",
    pages: "ملف عالي الدقة",
    downloads: 512,
    content: `Nuclear Knowledge Hub — مركز المعرفة النووية
دليل حزام الاستقرار النووي (N/Z Ratio):
- للأنوية الخفيفة (Z ≤ 20): الاستقرار عند N/Z ≈ 1.0
- للأنوية الثقيلة (حتى الرصاص Z = 82): تزداد النسبة تدريجياً إلى N/Z ≈ 1.52 للتغلب على تنافر كولوم.
- فوق حزام الاستقرار (فائض نيوترونات): اضمحلال بيتا السالب (β⁻).
- تحت حزام الاستقرار (فائض بروتونات): انبعاث بوزيترون (β⁺) أو التقاط إلكتروني (EC).
`,
  },
  {
    id: "alara-safety",
    title: "دليل تشغيل المفاعلات النووية وتدريع السلامة الإشعاعية (ALARA)",
    titleEn: "Nuclear Reactor Operations & ALARA Radiation Shielding Manual",
    category: "كتب تدريبية",
    categoryEn: "Manuals",
    size: "6.1 MB",
    pages: "32 صفحة",
    downloads: 420,
    content: `Nuclear Knowledge Hub — مركز المعرفة النووية
دليل الوقاية الإشعاعية وتدريع المفاعلات (ALARA):
1. مبادئ ALARA الثلاثة: تقليل الزمن (Time)، مضاعفة المسافة (Distance - قانون التربيع العكسي I₁/I₂ = d₂²/d₁²)، واستخدام التدريع المناسب (Shielding).
2. معادلة التوهين الأسي للأشعة:
   I(x) = I₀ · e^(-μx)
   طبقة القيمة النصفية: HVL = ln(2) / μ
`,
  },
  {
    id: "solved-bank",
    title: "بنك الأسئلة الشامل: 100 مسألة نموذجية محلولة خطوة بخطوة",
    titleEn: "Comprehensive Problem Bank: 100 Worked Nuclear Problems",
    category: "مسائل واختبارات",
    categoryEn: "Problem Bank",
    size: "3.2 MB",
    pages: "24 صفحة",
    downloads: 650,
    content: `Nuclear Knowledge Hub — مركز المعرفة النووية
نماذج مسائل محلولة بإشراف المهندس محمود شلتوت:
مسألة 1: عينة من اليود-131 كتلتها 64 ملجم وعمر نصفها 8 أيام. احسب الكتلة المتبقية بعد 24 يوماً.
الحل: عدد فترات عمر النصف n = 24 / 8 = 3 فترات.
الكتلة المتبقية = 64 × (1/2)³ = 64 / 8 = 8 ملجم.
`,
  },
];

export function ChatAndResources({ language, userEmail, userName }: ChatAndResourcesProps) {
  const isEn = language === "en";
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);
  const [lastDispatchedNotification, setLastDispatchedNotification] =
    useState<AppNotificationItem | null>(null);

  const handleDownloadFile = (file: typeof SHARED_FILES[number]) => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.id}-nuclear-hub.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadedNotice(
      isEn
        ? `Downloaded study sheet: ${file.titleEn}`
        : `تم تنزيل الملخص بنجاح: ${file.title}`,
    );
    void emitAppNotification({
      category: "course",
      titleAr: `تنزيل مورد علمي: ${file.title}`,
      titleEn: `Study Resource Downloaded: ${file.titleEn}`,
      bodyAr: `تم تنزيل الملف (${file.title}) وإرسال إشعار للتطبيق والواتساب والبريد الإلكتروني المسجل (${userEmail || "Mahmoudshaltoot.cemc@gmail.com"}).`,
      bodyEn: `Downloaded (${file.titleEn}) and notified via In-App, WhatsApp, and registered email (${userEmail || "Mahmoudshaltoot.cemc@gmail.com"}).`,
      recipientEmail: userEmail,
    });
    setTimeout(() => setDownloadedNotice(null), 4000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderDisplay = userName && userName !== "طالب" && userName !== "Student"
      ? `${userName} (${isEn ? "Student" : "طالب"})`
      : isEn
        ? "You (Student)"
        : "أنت (طالب)";

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "student",
      senderName: senderDisplay,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.trim();
    setInputText("");
    setIsTyping(true);

    // Immediately dispatch multi-channel notification (In-App + WhatsApp + Registered Email)
    void emitAppNotification({
      category: "discussion",
      titleAr: `رسالة جديدة في النقاش الدراسي من ${senderDisplay}`,
      titleEn: `New Study Discussion Message from ${senderDisplay}`,
      bodyAr: `المحتوى: "${query}" — تم إرسال الإشعار داخل التطبيق وعلى الواتساب وإلى البريد الإلكتروني المسجل (${userEmail || "Mahmoudshaltoot.cemc@gmail.com"}).`,
      bodyEn: `Message: "${query}" — Dispatched via In-App Notifications, WhatsApp, and Registered Email (${userEmail || "Mahmoudshaltoot.cemc@gmail.com"}).`,
      recipientEmail: userEmail,
    }).then((item) => {
      setLastDispatchedNotification(item);
    });

    setTimeout(() => {
      let reply = isEn
        ? "Great question! Eng. Mahmoud has logged your inquiry and will review the full derivation with you in the upcoming session."
        : "سؤال ممتاز ومهم! تم تسجيله وسيقوم المهندس محمود بالرد التفصيلي ومراجعة الحسابات معك خلال جلسة المراجعة القادمة.";
      if (query.includes("عمر النصف") || query.toLowerCase().includes("half-life")) {
        reply = isEn
          ? "Remember: N = N₀ · (1/2)^n where n = total time ÷ half-life. Always make sure both time values use the same unit before dividing!"
          : "تذكر دائماً أن القانون الأسي هو N = N₀ · (1/2)^n، حيث n = الزمن الكلي ÷ عمر النصف. تأكد من توحيد وحدات الزمن (أيام، ساعات، سنوات) قبل إجراء القسمة!";
      } else if (query.includes("انشطار") || query.toLowerCase().includes("fission")) {
        reply = isEn
          ? "When U-235 undergoes thermal fission, it releases an average of 2.43 neutrons and ~200 MeV of energy, mostly as kinetic energy of fission fragments."
          : "عند انشطار اليورانيوم-235، ينطلق في المتوسط 2.43 نيوترون لكل انشطار، وتتحرر طاقة مقدارها حوالي 200 MeV معظمها على شكل طاقة حركية لشظايا الانشطار.";
      } else if (query.includes("سلامة") || query.includes("جرعة") || query.toLowerCase().includes("alara")) {
        reply = isEn
          ? "ALARA minimizes radiation dose via 3 pillars: minimizing exposure Time, maximizing Distance (Inverse Square Law), and using high-density Shielding (lead/concrete)."
          : "مبدأ ALARA يقتضي تقليل التعرض الإشعاعي عبر 3 محاور: تقليل وقت التعرض، مضاعفة المسافة (قانون التربيع العكسي)، واستخدام تدريع رصاصي أو خرساني سميك.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-rep-${Date.now()}`,
          sender: "instructor",
          senderName: isEn ? "Eng. Mahmoud Shaltoot (Instant Guidance)" : "المهندس محمود شلتوت (رد علمي فوري)",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <section className="py-12 px-6 lg:px-10 max-w-[1240px] mx-auto space-y-12">
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare className="size-6 text-cyan-400" />
            <span>{isEn ? "Study Discussion & Downloadable Summaries" : "النقاش الدراسي والموارد التعليمية القابلة للتنزيل"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {isEn
              ? "Use the interactive study discussion and download summary sheets directly to your device."
              : "استخدم محادثة التدريب التفاعلية وحمّل ملخصات القوانين والموارد التعليمية مباشرة على جهازك."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Chat Messenger */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#070d1a] overflow-hidden flex flex-col h-[520px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#091122] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs font-bold text-white">
                {isEn ? "Interactive Academic Q&A" : "محادثة تدريبية تفاعلية"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              {isEn ? "Supervised by Eng. Mahmoud" : "بإشراف المهندس محمود"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050914]">
            {messages.map((m) => {
              const isMe = m.sender === "student";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isMe
                      ? "mr-auto bg-cyan-950/60 border border-cyan-500/30 text-cyan-100"
                      : "ml-auto bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-slate-400">
                    <strong className={isMe ? "text-cyan-400" : "text-pink-400"}>{m.senderName}</strong>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              );
            })}
            {isTyping && (
              <div className="text-[11px] text-cyan-400 italic animate-pulse">
                {isEn ? "Eng. Mahmoud is preparing an academic response..." : "المهندس محمود يكتب رداً علمياً..."}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#080e1c] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isEn ? "Ask about half-life, fission, or ALARA safety..." : "اكتب سؤالك في عمر النصف، الانشطار، أو السلامة الإشعاعية..."}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              aria-label={isEn ? "Send message" : "إرسال السؤال"}
              className="nuclear-glow rounded-xl bg-[#00e8f5] p-2.5 text-slate-950 hover:brightness-110 transition-all cursor-pointer"
            >
              <Send className="size-4" />
            </button>
          </form>

          {lastDispatchedNotification && (
            <div className="border-t border-slate-800/80 bg-[#060c18] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <Bell className="size-3.5 text-[#00e8f5]" />
                <span>
                  {isEn
                    ? "Notified via In-App, WhatsApp & Email"
                    : "تم إرسال إشعار بالتطبيق وعلى الواتساب والبريد المسجل"}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={buildWhatsAppDispatchUrl(lastDispatchedNotification, isEn)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900/50 transition"
                >
                  <MessageSquare className="size-3" />
                  <span>{isEn ? "WhatsApp" : "إرسال للواتساب"}</span>
                </a>
                <a
                  href={buildEmailDispatchUrl(lastDispatchedNotification, isEn)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#00e8f5]/40 bg-cyan-950/40 px-2.5 py-1 text-[10px] font-bold text-[#00e8f5] hover:bg-cyan-900/50 transition"
                >
                  <Mail className="size-3" />
                  <span>{isEn ? "Email" : "إرسال للبريد"}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Downloadable Resources Library */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#070c18] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="size-4 text-cyan-400" />
                <span>{isEn ? "Downloadable Study Summaries" : "ملخصات ومراجع علمية جاهزة للتنزيل"}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {isEn ? "Instant Download" : "تنزيل مباشر"}
              </span>
            </div>

            {downloadedNotice && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300"
              >
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{downloadedNotice}</span>
              </div>
            )}

            <div className="space-y-3">
              {SHARED_FILES.map((file) => (
                <div
                  key={file.id}
                  className="rounded-xl border border-slate-800 bg-[#081020] p-3.5 flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-all"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {isEn ? file.titleEn : file.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
                      <span className="font-sans text-cyan-400 font-medium">
                        {isEn ? file.categoryEn : file.category}
                      </span>
                      <span>· {file.size}</span>
                      <span>· {file.downloads} {isEn ? "downloads" : "تنزيل"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadFile(file)}
                    className="flex size-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition-all shrink-0 cursor-pointer"
                    title={isEn ? "Download study sheet" : "تنزيل الملخص"}
                    aria-label={isEn ? `Download ${file.titleEn}` : `تنزيل ${file.title}`}
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
