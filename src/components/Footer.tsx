import React from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import brandLogoImg from "../assets/images/nuclear_brand_logo_1791238367993.jpg";

interface FooterProps {
  onTabChange: (tab: string) => void;
  language: "ar" | "en";
}

export function Footer({ onTabChange, language }: FooterProps) {
  const isEn = language === "en";

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
