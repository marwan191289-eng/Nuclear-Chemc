import React from "react";
import { UserProfile } from "../types";
import { Award, Medal, Trophy, GraduationCap } from "lucide-react";

interface GamificationSectionProps {
  currentUser: UserProfile;
  language: "ar" | "en";
}

const BADGES = [
  {
    id: "b1",
    title: "إتقان تركيب النواة والقوى النووية",
    desc: "إتمام الوحدات التأسيسية واجتياز التقييم الرياضي لطاقة الترابط النووي",
  },
  {
    id: "b2",
    title: "كينيتيكا المفاعلات وتوازن النيوترونات",
    desc: "تحقيق العلامة الكاملة في حل مسائل التدفق النيوتروني وعامل التكاثر الفعال k-eff",
  },
  {
    id: "b3",
    title: "معايير الوقاية الإشعاعية المتقدمة (ALARA)",
    desc: "إتقان حسابات الجرعات المكافئة والدروع الواقية والتعامل الآمن مع المصادر",
  },
  {
    id: "b4",
    title: "تحليل النظائر وقوانين الانحلال",
    desc: "حل 50 مسألة نموذجية متقدمة في حسابات عمر النصف وسلاسل النشاط الإشعاعي",
  },
  {
    id: "b5",
    title: "الالتزام الأكاديمي والبحث المستمر",
    desc: "متابعة متصلة وتفاعل يومي مع محاكي قلب المفاعل والتدريبات التحليلية",
  },
];

export function GamificationSection({ currentUser, language }: GamificationSectionProps) {
  const isEn = language === "en";

  return (
    <section className="py-12 px-6 lg:px-10 max-w-[1240px] mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-950/40 px-4 py-1.5 text-xs font-bold text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
          <Trophy className="size-4 text-pink-400" />
          <span>
            {isEn
              ? "COMPETITIVE LEARNING & ACADEMIC CHALLENGES"
              : "التعلم بالمنافسة والتحديات الأكاديمية الجامعية"}
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isEn
            ? "University Academic Leaderboard & Engineering Distinctions"
            : "لوحة التنافس الأكاديمي وتصنيف كليات الهندسة والعلوم"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {isEn
            ? "Built for university engineering, physics, and chemistry students to practice nuclear problems, use reactor simulations, and work through advanced calculations."
            : "منظومة مصممة لطلاب كليات الهندسة والعلوم والباحثين بالمملكة والخليج — تنافس أكاديمياً عبر حل المسائل المتقدمة، تحليل حركية المفاعلات، وتحديات المحاكاة العملية الميدانية."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Your Standing & Academic Accreditations */}
        <div className="lg:col-span-6 space-y-6">
          {/* Level Progress Card */}
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#080f1f] to-[#040812] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="size-3.5" />
                  {isEn ? "Current learning level" : "مستوى التعلّم الحالي"}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">{currentUser.level}</h3>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-cyan-500/10 px-4 py-2 text-[#00f0ff] border border-cyan-500/40 font-mono shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                <span className="text-xs font-bold text-slate-400 uppercase">{isEn ? "Progress points" : "نقاط التقدم"}</span>
                <span className="text-xl font-black text-white">{currentUser.xp} <span className="text-xs text-cyan-400">XP</span></span>
              </div>
            </div>

            {/* Progress bar to next academic rank */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{currentUser.xp} نقطة مستحقة</span>
                <span className="text-cyan-400">الهدف: 1200 نقطة للترقية إلى رتبة أخصائي مفاعلات</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                  style={{ width: `${Math.min(100, (currentUser.xp / 1200) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* In-app learning badges */}
          <div className="rounded-3xl border border-slate-800 bg-[#070c18] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Award className="size-4 text-cyan-400" />
                {isEn ? "Learning badges & milestones" : "أوسمة التعلّم والإنجاز"}
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">{isEn ? "Earned in this platform" : "تُكتسب داخل المنصة"}</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {BADGES.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3.5 flex items-start gap-3.5 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f0e9] text-[#477f72]"><Award className="size-4" /></span>
                  <div>
                    <div className="text-xs font-bold text-white">{b.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* This view intentionally avoids invented learner identities or rankings. */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-[#070d1a] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Medal className="size-5 text-amber-700" />
              <h3 className="text-base font-bold text-white">
                {isEn
                  ? "Learner rankings"
                  : "تصنيف المتعلمين"}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-full">
              {isEn ? "No verified records" : "لا توجد سجلات موثقة"}
            </span>
          </div>

          <div className="rounded-2xl border border-dashed border-[#d7ded6] bg-[#f7f7f1] p-8 text-center">
            <p className="text-sm font-semibold text-[#304b40]">{isEn ? "Verified learner rankings will appear here when available." : "ستظهر هنا تصنيفات المتعلمين عند توفر سجلات موثقة."}</p>
            <p className="mt-2 text-xs leading-6 text-[#718078]">{isEn ? "No student names, scores, or institutions are fabricated for this preview." : "لا تُعرض أسماء أو درجات أو جامعات لطلاب افتراضيين."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
