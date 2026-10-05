import React from "react";
import mahmoudImg from "../assets/mahmoud-lab-coat.png";
import { CheckCircle, GraduationCap, MessageSquare, Sparkles } from "lucide-react";

interface InstructorPageProps {
  onBookSession: () => void;
  language: "ar" | "en";
}

export function InstructorPage({ onBookSession, language }: InstructorPageProps) {
  const isEn = language === "en";

  const credentials = isEn
    ? [
        "Teaching focus: nuclear chemistry and reactor engineering",
        "Radiation-safety lessons informed by IAEA guidance",
        "Course topics include reactor thermal-hydraulics and fuel-cycle analysis",
        "12+ years of specialized teaching and academic support",
      ]
    : [
        "مجالات التدريس: الكيمياء النووية وهندسة المفاعلات",
        "دروس السلامة الإشعاعية مستندة إلى إرشادات الوكالة الدولية للطاقة الذرية",
        "تتضمن المقررات ديناميكا حراريات المفاعل ودورة الوقود النووي",
        "أكثر من 12 سنة في التدريس التخصصي والدعم الأكاديمي",
      ];

  return (
    <div className="py-10 sm:py-14 px-5 sm:px-6 lg:px-10 max-w-[1240px] mx-auto space-y-12">
      {/* Hero Bio Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#060c18] via-[#081224] to-[#040812] p-5 sm:p-8 lg:p-11 shadow-[0_0_80px_rgba(0,240,255,0.15)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-11 items-center">
          {/* Portrait Photo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 opacity-20 blur-lg transition duration-700 group-hover:opacity-35" />
              <div className="relative rounded-2xl border border-cyan-400/40 bg-black overflow-hidden shadow-2xl">
                <img
                  src={mahmoudImg}
                  alt={isEn ? "Eng. Mahmoud Ismail Shaltoot" : "المهندس محمود إسماعيل شلتوت"}
                  className="w-full max-w-[340px] aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 text-center">
                  <div className="text-white font-bold text-sm">{isEn ? "Eng. Mahmoud Ismail Shaltoot" : "المهندس/ محمود إسماعيل شلتوت"}</div>
                  <div className="text-cyan-400 text-xs font-medium">{isEn ? "Nuclear chemistry instructor" : "مدرّب كيمياء نووية"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio text & credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-4 py-1.5 text-xs text-cyan-300">
              <Sparkles className="size-3.5" />
              <span>{isEn ? "Lead Instructor & Academic Director" : "المشرف الأكاديمي والمدرب العام"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {isEn ? "Eng. Mahmoud Ismail Shaltoot" : "المهندس/ محمود إسماعيل شلتوت"}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-8 font-normal">
              {isEn ? (
                <>
                  Nuclear chemistry instructor and dedicated mentor, bridging fundamental atomic science
                  with advanced reactor technologies. Specializing in curriculum design, university exam prep,
                  and radiological safety training for students across the Kingdom of Saudi Arabia and the Arabian Gulf.
                </>
              ) : (
                <>
                  مدرّب كيمياء نووية شغوف بنقل علوم الذرة والطاقة النووية من أفق النظريات الجافة إلى الفهم
                  الواقعي التطبيقي الممتع. نؤسس الطلاب في جميع مفردات الكيمياء والفيزياء الإشعاعية، ونعدّهم
                  للتفوق الدراسي في الجامعات والمؤسسات البحثية والصناعية الكبرى.
                </>
              )}
            </p>

            {/* Checklist of Credentials */}
            <div className="space-y-3 pt-1">
              {credentials.map((cred, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{cred}</span>
                </div>
              ))}
            </div>

            <p className="rounded-xl border border-slate-800 bg-slate-900/45 px-4 py-3 text-xs leading-6 text-slate-400">
              {isEn
                ? "Lessons are for academic learning. Always follow your university’s approved radiation-safety procedures in any laboratory setting."
                : "المحتوى للتعلّم الأكاديمي؛ ويجب الالتزام بإجراءات السلامة الإشعاعية المعتمدة في الجامعة داخل أي مختبر."}
            </p>

            {/* Contact & Booking Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onBookSession}
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#00f0ff] via-[#10e9ff] to-[#00d4f0] px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_0_35px_rgba(0,240,255,0.45),0_4px_16px_rgba(0,0,0,0.35)] border border-cyan-100/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(0,240,255,0.7)] active:scale-95 cursor-pointer"
              >
                <span className="relative z-10">{isEn ? "Book 1-on-1 Mentorship Session" : "احجز جلسة تقييم وتدريب خاصة"}</span>
              </button>

              <a
                href="https://wa.me/966594756878"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-emerald-950/70 px-6 py-3.5 text-sm font-bold text-emerald-300 hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <MessageSquare className="size-4" />
                <span>{isEn ? "WhatsApp Direct (GCC & Arab)" : "تواصل واتساب مباشر (السعودية والخليج)"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy & Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-6 space-y-3 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
            <GraduationCap className="size-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {isEn ? "From Ground Up" : "الفهم من الجذر"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isEn
              ? "We don't just memorize formulas. We trace the physical origin of mass defect, binding forces, and isotopic stability so you solve any unfamiliar question effortlessly."
              : "لا نعتمد على الحفظ العشوائي للمعادلات، بل نبني الاستيعاب الفيزيائي لأصل نقص الكتلة وطاقة الربط وقوى النواة، لتتمكن من حل أصعب المسائل ببديهة حاضرة."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-6 space-y-3 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
            <Sparkles className="size-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {isEn ? "AI-Powered Adaptive Learning" : "تخصيص مدعوم بالذكاء الاصطناعي"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isEn
              ? "Personalized study schedules, spaced-repetition flashcards, and level progression tailored to your speed and university curriculum."
              : "خطط دراسية شخصية، بطاقات مراجعة متباعدة، وتدريبات تدرجية تتناغم مع جدولك الجامعي والتزاماتك واختباراتك الدورية."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-6 space-y-3 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <CheckCircle className="size-5" />
          </div>
          <h3 className="text-base font-bold text-white">
              {isEn ? "Learning progress" : "متابعة التقدم"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isEn
                ? "Track completed lessons and practice milestones as you work through each course."
                : "تابع الدروس التي أتممتها والتمارين التي أنجزتها خلال تقدمك في المقرر."}
          </p>
        </div>
      </div>

      {/* Private Lessons 3-Step Roadmap from knowledge-hub-plus */}
      <div className="rounded-3xl border border-slate-800 bg-[#070f1d] p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">
              {isEn ? "PRIVATE LESSONS · 1-ON-1 MENTORSHIP" : "الدروس الخاصة الفردية · متابعة مباشرة"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {isEn
                ? "One-to-One Lessons, Built Around Your Goals"
                : "دروس خاصة فردية، مصممة لمستواك وهدفك"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 leading-relaxed">
              {isEn
                ? "Live online sessions shaped around your level and goals — university exam revision, a graduation thesis, or preparing for a career in the nuclear sector."
                : "جلسات مباشرة أونلاين تُصمم حسب مستواك وهدفك — مراجعة اختبارات جامعية، مشروع تخرج، أو التحضير للعمل في القطاع النووي."}
            </p>
          </div>
          <button
            type="button"
            onClick={onBookSession}
            className="rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer shrink-0"
          >
            {isEn ? "Book Your First Session" : "احجز جلستك الأولى الآن"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(isEn
            ? [
                "A free assessment session to map your level and academic goals",
                "A flexible weekly plan that fits your university schedule",
                "Concise summaries, worked exercises, and follow-up between sessions",
              ]
            : [
                "جلسة تقييم مبدئية لتحديد مستواك الدراسي وأهدافك بدقة",
                "خطة أسبوعية مرنة تناسب جدولك الجامعي ومواعيد اختباراتك",
                "ملخصات مركزة وتمارين محلولة ومتابعة مستمرة بين الجلسات",
              ]
          ).map((step, idx) => (
            <div
              key={step}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 font-mono text-sm font-bold text-cyan-400 border border-cyan-500/30">
                0{idx + 1}
              </span>
              <span className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
