import React, { useState } from "react";
import { StudyPlan } from "../types";
import { apiFetch, appPath } from "../lib/app-path";
import { emitAppNotification } from "../lib/notifications";
import { Sparkles, Calendar, CheckCircle2, Clock, BookOpen, AlertCircle, Download, X, BookmarkCheck, ArrowRight } from "lucide-react";

interface AIStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (plan: StudyPlan) => void;
  onEnrollCourse: (courseId: string) => void;
  language: "ar" | "en";
}

export function AIStudyPlanModal({
  isOpen,
  onClose,
  onSavePlan,
  onEnrollCourse,
  language,
}: AIStudyPlanModalProps) {
  const isEn = language === "en";

  const [goal, setGoal] = useState("التحضير لاختبارات الكيمياء النووية والتحصيلي الجامعي");
  const [level, setLevel] = useState("متوسط");
  const [hours, setHours] = useState("6-8 ساعات أسبوعياً");
  const [weeks, setWeeks] = useState(6);
  const [interests, setInterests] = useState("حسابات عمر النصف، معادلات الانشطار، ديناميكا قلب المفاعل، السلامة الإشعاعية");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(appPath("/api/ai/study-plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          level,
          availableHours: hours,
          durationWeeks: weeks,
          interests,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate plan from server");
      }

      const data = await res.json();
      if (data.plan) {
        setGeneratedPlan(data.plan);
        void emitAppNotification({
          category: "study_plan",
          titleAr: `إنشاء خطة مذاكرة ذكية جديدة (${weeks} أسابيع)`,
          titleEn: `New AI Study Plan Generated (${weeks} Weeks)`,
          bodyAr: `الهدف: ${goal} | المستوى: ${level} | الساعات: ${hours}`,
          bodyEn: `Goal: ${goal} | Level: ${level} | Hours: ${hours}`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (generatedPlan) {
      onSavePlan(generatedPlan);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-[#070c18] shadow-[0_0_80px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#091122] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isEn ? "AI Gateway Study Plan Generator" : "مُولّد خطة المذاكرة الذكية عبر AI Gateway"}</span>
                <span className="rounded px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  GEMINI 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Personalized curriculum tailored by AI & reviewed by Eng. Mahmoud Shaltoot"
                  : "خطة مخصصة لمستواك وأهدافك تقترح الدورات المناسبة وجدول المراجعات"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!generatedPlan ? (
            /* Input Form */
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Study Goal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {isEn ? "Your Academic Goal" : "هدفك الدراسي الأساسي"}
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="التحضير لاختبارات الكيمياء النووية والتحصيلي الجامعي">
                      {isEn ? "University Exams & Nuclear Chemistry Prep" : "التحضير لاختبارات الكيمياء النووية والتحصيلي الجامعي"}
                    </option>
                    <option value="فهم هندسة المفاعلات والوقود النووي والانشطار">
                      {isEn ? "Reactor Engineering & Fuel Cycle" : "فهم هندسة المفاعلات والوقود النووي والانشطار"}
                    </option>
                    <option value="الحماية الإشعاعية والتطبيقات الطبية والصناعية">
                      {isEn ? "Radiation Safety & Medical Isotopes" : "الحماية الإشعاعية والتطبيقات الطبية والصناعية"}
                    </option>
                    <option value="تأسيس شامل من الصفر في الفيزياء والكيمياء النووية">
                      {isEn ? "Complete Foundation from Scratch" : "تأسيس شامل من الصفر في الفيزياء والكيمياء النووية"}
                    </option>
                  </select>
                </div>

                {/* Current Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {isEn ? "Current Level" : "مستواك الحالي"}
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="مبتدئ (أول مرة أدرس كيمياء نووية)">{isEn ? "Beginner" : "مبتدئ (أول مرة أدرس كيمياء نووية)"}</option>
                    <option value="متوسط (لدي أساسيات وأريد التعمق)">{isEn ? "Intermediate" : "متوسط (لدي أساسيات وأريد التعمق)"}</option>
                    <option value="متقدم (أستعد لمشاريع وأبحاث متخصصة)">{isEn ? "Advanced" : "متقدم (أستعد لمشاريع وأبحاث متخصصة)"}</option>
                  </select>
                </div>

                {/* Available Hours */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {isEn ? "Available Weekly Hours" : "ساعات المذاكرة المتاحة أسبوعياً"}
                  </label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="3-5 ساعات أسبوعياً (جدول مرن ومخفف)">{isEn ? "3-5 hrs/week (Light/Flexible)" : "3-5 ساعات أسبوعياً (جدول مرن ومخفف)"}</option>
                    <option value="6-8 ساعات أسبوعياً (موصى به للتميز)">{isEn ? "6-8 hrs/week (Recommended)" : "6-8 ساعات أسبوعياً (موصى به للتميز)"}</option>
                    <option value="10+ ساعات أسبوعياً (مكثف سريع)">{isEn ? "10+ hrs/week (Intensive)" : "10+ ساعات أسبوعياً (مكثف سريع)"}</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {isEn ? "Target Timeline" : "المدة الزمنية المستهدفة"}
                  </label>
                  <select
                    value={weeks}
                    onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value={4}>{isEn ? "4 Weeks (Crash Course)" : "٤ أسابيع (مكثف سريع)"}</option>
                    <option value={6}>{isEn ? "6 Weeks (Balanced Mastery)" : "٦ أسابيع (متوازن وشامل)"}</option>
                    <option value={8}>{isEn ? "8 Weeks (Deep In-Depth)" : "٨ أسابيع (عميق ومفصل)"}</option>
                  </select>
                </div>
              </div>

              {/* Focus areas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {isEn ? "Key Topics & Areas of Interest" : "مجالات الاهتمام والموضوعات التي تريد التركيز عليها"}
                </label>
                <textarea
                  rows={2}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  placeholder="مثال: حسابات عمر النصف، معادلات الانشطار، تصميم المفاعلات، الوقاية من الإشعاع..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                  <AlertCircle className="size-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>{isEn ? "Generating AI Plan with Gemini..." : "جارٍ معالجة الخطة عبر نموذج الذكاء الاصطناعي..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>{isEn ? "Generate AI Study Plan Now" : "إنشاء خطة المذاكرة الذكية عبر AI Gateway"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Result Plan */
            <div className="space-y-6">
              {/* Plan Header */}
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1426] to-[#060b14] p-5 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    {isEn ? "Personalized Study Roadmap" : "خارطة المذاكرة المخصصة"}
                  </span>
                  <span className="rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                    {weeks} {isEn ? "Weeks" : "أسابيع"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{generatedPlan.planTitle}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{generatedPlan.overview}</p>
              </div>

              {/* Recommended Courses Box */}
              <div className="rounded-xl border border-slate-800 bg-[#080e1c] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
                  <BookOpen className="size-4 text-cyan-400" />
                  <span>{isEn ? "Recommended Matching Courses:" : "الدورات المقترحة المناسبة لخطتك:"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedPlan.recommendedCourses.map((cName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-slate-900/80 p-3 hover:border-cyan-400/50 transition-all"
                    >
                      <span className="text-xs font-semibold text-slate-200">{cName}</span>
                      <button
                        onClick={() => {
                          onClose();
                          if (cName.includes("أساسيات")) onEnrollCourse("fundamentals");
                          else if (cName.includes("تفاعلات") || cName.includes("مفاعلات")) onEnrollCourse("reactors");
                          else onEnrollCourse("safety");
                        }}
                        className="text-[11px] font-bold text-[#00f0ff] hover:underline"
                      >
                        {isEn ? "Enroll Now →" : "التسجيل في الدورة ←"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Roadmap Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Weekly Milestones Breakdown" : "المراحل الأسبوعية المقترحة"}
                </h4>
                <div className="space-y-3">
                  {generatedPlan.weeklyRoadmap.map((item) => (
                    <div
                      key={item.weekNumber}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300 font-mono">
                            {item.weekNumber}
                          </span>
                          <span className="font-semibold text-sm text-white">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="size-3.5 text-cyan-400" />
                          <span>{item.suggestedHours} {isEn ? "hours" : "ساعات"}</span>
                        </div>
                      </div>

                      {/* Objectives */}
                      <ul className="space-y-1 mb-3 text-xs text-slate-300">
                        {item.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Flashcards to review */}
                      {item.spacedRepetitionCards && item.spacedRepetitionCards.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-400 font-medium">{isEn ? "Spaced Review:" : "مراجعة متباعدة:"}</span>
                          {item.spacedRepetitionCards.map((card, ci) => (
                            <span
                              key={ci}
                              className="rounded px-2 py-0.5 bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px]"
                            >
                              {card}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Checklist */}
              {generatedPlan.practicalChecklist && (
                <div className="rounded-xl border border-slate-800 bg-[#08101e] p-4">
                  <h4 className="text-xs font-bold text-slate-300 mb-2">
                    {isEn ? "Key Milestones & Practical Exercises:" : "أهم المعالم والتطبيقات العملية:"}
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.practicalChecklist.map((ch, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <span className="size-1.5 rounded-full bg-pink-400" />
                        <span>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Advice */}
              {generatedPlan.instructorAdvice && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-4 text-xs text-pink-200 leading-relaxed">
                  <strong className="block text-pink-400 mb-1 font-bold">
                    {isEn ? "A note from Eng. Mahmoud Shaltoot:" : "نصيحة المهندس محمود شلتوت:"}
                  </strong>
                  "{generatedPlan.instructorAdvice}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setGeneratedPlan(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {isEn ? "← Re-configure Parameters" : "← تعديل المعطيات وتوليد جديد"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                  >
                    <BookmarkCheck className="size-4" />
                    <span>{savedSuccess ? (isEn ? "Saved to Profile!" : "تم الحفظ بالملف!") : (isEn ? "Save to Student Profile" : "حفظ الخطة في ملفي")}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
                    title="طباعة أو تصدير الخطة PDF"
                  >
                    <Download className="size-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
