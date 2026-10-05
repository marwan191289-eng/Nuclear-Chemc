import React, { useState } from "react";
import { Check, Copy, Download, Mail, MessageSquare, Phone, Share2 } from "lucide-react";
import brandLogoImg from "../assets/images/nuclear_brand_logo_1791238367993.jpg";
import ogBannerImg from "../assets/images/og_social_card_1791237959475.jpg";

interface FooterProps {
  onTabChange: (tab: string) => void;
  language: "ar" | "en";
}

export function Footer({ onTabChange, language }: FooterProps) {
  const isEn = language === "en";
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const shareUrl = "https://nuclear-chemc.vercel.app/?v=2";
  const shareTitle =
    "Nuclear Knowledge Hub — مركز المعرفة النووية | المهندس محمود شلتوت";
  const shareDesc =
    "منصة تعليمية عربية وإنجليزية في الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية بإشراف المهندس محمود إسماعيل شلتوت لطلاب الجامعات والموهوبين في السعودية والخليج.";

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareUrl(true);
      window.setTimeout(() => setCopiedShareUrl(false), 2600);
    } catch {
      setCopiedShareUrl(true);
      window.setTimeout(() => setCopiedShareUrl(false), 2600);
    }
  };

  React.useEffect(() => {
    const replaceReplitBadgeText = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      while (node) {
        if (node.nodeValue && /Made with Replit|Replit/i.test(node.nodeValue)) {
          node.nodeValue = node.nodeValue
            .replace(/Made with Replit/gi, "Made by Marwan Negm")
            .replace(/Replit/gi, "Marwan Negm");
        }
        node = walker.nextNode();
      }
      document.querySelectorAll("[aria-label*='Replit'], [title*='Replit']").forEach((el) => {
        const aria = el.getAttribute("aria-label");
        if (aria) el.setAttribute("aria-label", aria.replace(/Made with Replit/gi, "Made by Marwan Negm").replace(/Replit/gi, "Marwan Negm"));
        const title = el.getAttribute("title");
        if (title) el.setAttribute("title", title.replace(/Made with Replit/gi, "Made by Marwan Negm").replace(/Replit/gi, "Marwan Negm"));
      });
    };
    replaceReplitBadgeText();
    const observer = new MutationObserver(() => replaceReplitBadgeText());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="border-t border-slate-800/80 bg-[#03060f] text-slate-400 py-12 sm:py-14 px-5 sm:px-6 lg:px-10">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-9">
        {/* Brand */}
        <div className="space-y-4 sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-[#05080f] border border-[#00e8f5]/45 shadow-[0_0_18px_rgba(0,232,245,0.2)]">
              <img
                src={brandLogoImg}
                alt="Nuclear Knowledge Hub Logo"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{isEn ? "Eng. Mahmoud Shaltoot" : "المهندس محمود شلتوت"}</div>
              <div className="text-xs text-cyan-400 font-medium">{isEn ? "Nuclear Chemistry & Reactor Hub" : "منصة الكيمياء النووية والمفاعلات"}</div>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {isEn
              ? "Bridging fundamental isotope chemistry with applied nuclear engineering. Specialized tutoring for university and gifted students across Saudi Arabia and the Arabian Gulf."
              : "منصة رائدة متخصصة في تدريس الكيمياء النووية والمفاعلات وتطبيقات الطاقة الإشعاعية والسلامة لطلاب الجامعات والمرحلة الثانوية في السعودية والخليج."}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://wa.me/966594756878"
              target="_blank"
              rel="noreferrer"
              aria-label={isEn ? "Contact us on WhatsApp" : "تواصل معنا عبر واتساب"}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
               title={isEn ? "WhatsApp" : "واتساب مباشر"}
            >
              <MessageSquare className="size-4" />
            </a>
            <a
              href="mailto:Mahmoudshaltoot.cemc@gmail.com"
              aria-label={isEn ? "Send an email" : "إرسال بريد إلكتروني"}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
               title={isEn ? "Email" : "البريد الإلكتروني"}
            >
              <Mail className="size-4" />
            </a>
            <a
              href="tel:+966594756878"
              aria-label={isEn ? "Call the instructor" : "اتصل بالمدرب"}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-pink-400 hover:border-pink-500/40 transition-all"
               title={isEn ? "Call" : "اتصال هاتفي"}
            >
              <Phone className="size-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            {isEn ? "Quick Navigation" : "روابط سريعة"}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onTabChange("home")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Home Page" : "الرئيسية"}
              </button>
            </li>
            <li>
              <button onClick={() => onTabChange("courses")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Courses & Syllabi" : "الدورات المتاحة والتسجيل"}
              </button>
            </li>
            <li>
              <button onClick={() => onTabChange("simulator")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Reactor Simulator" : "محاكي قلب المفاعل الحي"}
              </button>
            </li>
            <li>
              <button onClick={() => onTabChange("instructor")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Instructor Credentials" : "صفحة المهندس محمود شلتوت"}
              </button>
            </li>
            <li>
              <button onClick={() => onTabChange("portal")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Student Portal" : "بوابة الطالب والدروس"}
              </button>
            </li>
            <li>
              <button onClick={() => onTabChange("booking")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Book a session" : "حجز جلسة"}
              </button>
            </li>
            <li>
              <button onClick={() => onTabChange("admin")} className="hover:text-cyan-400 transition-colors">
                {isEn ? "Administration" : "الإدارة"}
              </button>
            </li>
          </ul>
        </div>

        {/* Official Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            {isEn ? "Official Contact" : "التواصل المعتمد"}
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">{isEn ? "Phone & WhatsApp:" : "الهاتف والواتساب المعتمد:"}</span>
              <a href="tel:+966594756878" className="text-white font-mono hover:text-cyan-400 dir-ltr inline-block">
                +966 59 475 6878
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">{isEn ? "Email:" : "البريد الإلكتروني:"}</span>
              <a href="mailto:Mahmoudshaltoot.cemc@gmail.com" className="text-white font-mono hover:text-cyan-400 text-[11px]">
                Mahmoudshaltoot.cemc@gmail.com
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">{isEn ? "Service region:" : "النطاق الجغرافي:"}</span>
              <span className="text-slate-300">{isEn ? "Saudi Arabia and the Gulf" : "المملكة العربية السعودية ودول الخليج العربي"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Open Graph Social Preview Card & One-Click Share Hub */}
      <div
        id="og-preview-card"
        className="max-w-[1240px] mx-auto mb-12 rounded-2xl border border-[#00e8f5]/30 bg-[#070d18]/90 p-5 sm:p-7 shadow-[0_0_45px_rgba(0,232,245,0.12)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Live Social Card Preview (Exact WhatsApp / Facebook / X / Telegram Card Layout) */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-xl border border-[#00e8f5]/40 bg-[#05080f] shadow-xl">
              <div className="relative aspect-[1200/630] w-full overflow-hidden bg-[#05080f]">
                <img
                  src={ogBannerImg}
                  alt={shareTitle}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <span
                  dir="ltr"
                  className="absolute top-3 left-3 rounded-md border border-[#00e8f5]/45 bg-[#05080f]/80 px-2.5 py-1 font-mono text-[10px] font-bold text-[#00e8f5] backdrop-blur-md"
                >
                  OG BANNER · 1200×630 (113 KB)
                </span>
              </div>
              <div className="border-t border-slate-800/90 bg-[#09101d] p-4 space-y-1">
                <div className="font-mono text-[11px] text-[#00e8f5]" dir="ltr">
                  nuclear-chemc.vercel.app
                </div>
                <div className="text-sm font-bold text-white line-clamp-1">
                  {shareTitle}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {shareDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Share Controls & Downloadable Brand Assets */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00e8f5]">
              <Share2 className="size-3.5" />
              <span>
                {isEn
                  ? "OFFICIAL SOCIAL SHARE & OPEN GRAPH CARD"
                  : "بطاقة المعاينة الرسمية ومشاركة الرابط (Open Graph)"}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {isEn
                ? "Ready for WhatsApp, Facebook, X, Telegram & LinkedIn"
                : "معاينة احترافية فورية على واتساب وفيسبوك وتويتر وتيليجرام"}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isEn
                ? "Optimized 1200×630 baseline JPEG (113 KB — under WhatsApp's 300 KB limit) so your preview banner appears immediately when sharing."
                : "تم ضغط وضبط البانر الرسمي بدقة 1200×630 وبحجم 113 KB فقط (أقل من حد واتساب الصارم 300 KB) ليظهر فوراً عند مشاركة الرابط بعد النشر على Vercel."}
            </p>

            {/* One-Click Social Share Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => void handleCopyShareUrl()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00e8f5] px-4 py-2.5 text-xs font-bold text-[#031218] shadow-[0_0_20px_rgba(0,232,245,0.35)] hover:brightness-110 transition cursor-pointer"
              >
                {copiedShareUrl ? (
                  <>
                    <Check className="size-4" />
                    <span>
                      {isEn ? "Link Copied!" : "تم نسخ رابط المعاينة المحدّث!"}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>
                      {isEn
                        ? "Copy Fresh Share Link"
                        : "نسخ الرابط المحدّث للمشاركة"}
                    </span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/45 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
              >
                <span>{isEn ? "Share on WhatsApp" : "مشاركة على واتساب"}</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#00e8f5]/40 bg-[#00e8f5]/10 px-3.5 py-2.5 text-xs font-bold text-[#00e8f5] hover:bg-[#00e8f5]/20 transition"
              >
                <span>{isEn ? "Telegram" : "تيليجرام"}</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-[#00e8f5]/50 transition"
              >
                <span>{isEn ? "Facebook" : "فيسبوك"}</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-[#00e8f5]/50 transition"
              >
                <span>X / Twitter</span>
              </a>
            </div>

            {/* Direct Download Links for OG Banner & Logo */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <a
                href="/og-banner.jpg"
                download="nuclear-knowledge-hub-og-banner.jpg"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#00e8f5] transition"
              >
                <Download className="size-3.5 text-[#00e8f5]" />
                <span>
                  {isEn ? "Download OG Banner (1200×630)" : "تنزيل صورة البانر (1200×630)"}
                </span>
              </a>
              <span className="text-slate-600">·</span>
              <a
                href="/logo-icon.jpg"
                download="nuclear-knowledge-hub-logo.jpg"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#ef2b88] transition"
              >
                <Download className="size-3.5 text-[#ef2b88]" />
                <span>
                  {isEn ? "Download Official Logo" : "تنزيل اللوجو الرسمي"}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto mt-10 sm:mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          {isEn ? `© ${new Date().getFullYear()} Eng. Mahmoud Ismail Shaltoot — Nuclear Chemistry Hub.` : `جميع الحقوق محفوظة © ${new Date().getFullYear()} للمهندس محمود إسماعيل شلتوت — منصة الكيمياء النووية.`}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>{isEn ? "Riyadh • Jeddah • Dhahran • Dubai • Kuwait" : "الرياض • جدة • الظهران • دبي • الكويت"}</span>
          <span className="text-[#00e5ff]/80">{isEn ? "AI study planning" : "خطط مذاكرة بالذكاء الاصطناعي"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0b111d] px-3 py-1 font-mono text-[11px] font-semibold text-slate-300">
            Made by Marwan Negm
          </span>
        </div>
      </div>

      {/* Fixed Bottom-Right Badge: Made by Marwan Negm */}
      <div
        dir="ltr"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-[#00e5ff]/35 bg-[#060911]/90 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-slate-200 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-md select-none"
      >
        <span className="size-2 rounded-full bg-[#00e5ff] pulse-dot" />
        <span>Made by Marwan Negm</span>
      </div>
    </footer>
  );
}
