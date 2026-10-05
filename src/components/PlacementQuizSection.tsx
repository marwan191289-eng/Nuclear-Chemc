import React, { useState } from "react";
import { apiFetch, appPath } from "../lib/app-path";
import { emitAppNotification } from "../lib/notifications";
import { INITIAL_COURSES } from "../data/coursesData";
import {
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  Target,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface PlacementQuizSectionProps {
  onOpenStudyPlan: () => void;
  onSelectCourse?: (courseId: string) => void;
  onBookPrivate?: () => void;
  language: "ar" | "en";
}

type PlacementQuestion = {
  id: string;
  q: { ar: string; en: string };
  options: { ar: string[]; en: string[] };
};

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "q1",
    q: {
      ar: "ما الذي يحدد العدد الذري للعنصر؟",
      en: "What determines an element's atomic number?",
    },
    options: {
      ar: [
        "عدد النيوترونات",
        "عدد البروتونات",
        "عدد البروتونات + النيوترونات",
        "عدد إلكترونات التكافؤ",
      ],
      en: [
        "Number of neutrons",
        "Number of protons",
        "Protons + neutrons",
        "Valence electrons",
      ],
    },
  },
  {
    id: "q2",
    q: {
      ar: "النظائر هي ذرات لنفس العنصر تختلف في:",
      en: "Isotopes of the same element differ in:",
    },
    options: {
      ar: [
        "عدد البروتونات",
        "عدد الإلكترونات",
        "عدد النيوترونات",
        "الشحنة الكلية",
      ],
      en: [
        "Number of protons",
        "Number of electrons",
        "Number of neutrons",
        "Total charge",
      ],
    },
  },
  {
    id: "q3",
    q: {
      ar: "في اضمحلال ألفا، ينقص العدد الكتلي بمقدار:",
      en: "In alpha decay, the mass number decreases by:",
    },
    options: {
      ar: ["1", "2", "4", "0"],
      en: ["1", "2", "4", "0"],
    },
  },
  {
    id: "q4",
    q: {
      ar: "عينة عمر النصف لها ٥ أيام. كم يتبقى منها بعد ١٥ يومًا؟",
      en: "A sample has a 5-day half-life. What fraction remains after 15 days?",
    },
    options: {
      ar: ["1/2", "1/4", "1/8", "1/16"],
      en: ["1/2", "1/4", "1/8", "1/16"],
    },
  },
  {
    id: "q5",
    q: {
      ar: "أي نوع من الإشعاع له أعلى قدرة اختراق؟",
      en: "Which radiation has the highest penetrating power?",
    },
    options: {
      ar: ["ألفا (α)", "بيتا (β)", "جاما (γ)", "كلها متساوية"],
      en: ["Alpha (α)", "Beta (β)", "Gamma (γ)", "All equal"],
    },
  },
  {
    id: "q6",
    q: {
      ar: "ما وظيفة المهدّئ (Moderator) في المفاعل الحراري؟",
      en: "What is the role of the moderator in a thermal reactor?",
    },
    options: {
      ar: [
        "امتصاص كل النيوترونات",
        "إبطاء النيوترونات السريعة",
        "تبريد قلب المفاعل فقط",
        "زيادة كتلة الوقود",
      ],
      en: [
        "Absorb all neutrons",
        "Slow down fast neutrons",
        "Only cool the core",
        "Increase fuel mass",
      ],
    },
  },
  {
    id: "q7",
    q: {
      ar: "وحدة السيفرت (Sv) تقيس:",
      en: "The sievert (Sv) measures:",
    },
    options: {
      ar: [
        "النشاط الإشعاعي",
        "الجرعة المكافئة/الفعالة",
        "طاقة الجسيم",
        "عمر النصف",
      ],
      en: [
        "Radioactivity",
        "Equivalent/effective dose",
        "Particle energy",
        "Half-life",
      ],
    },
  },
  {
    id: "q8",
    q: {
      ar: "مبدأ ALARA في الحماية الإشعاعية يعني:",
      en: "The ALARA principle in radiation protection means:",
    },
    options: {
      ar: [
        "أقل جرعة ممكنة بشكل معقول",
        "منع أي تعرض نهائيًا",
        "أعلى جرعة مسموحة",
        "قياس الجرعة سنويًا",
      ],
      en: [
        "As low as reasonably achievable",
        "Zero exposure always",
        "Maximum allowed dose",
        "Measure dose yearly",
      ],
    },
  },
];

type PlacementEvaluation = {
  score: number;
  total: number;
  level: string;
  courseId: "fundamentals" | "reactors" | "safety" | "private";
  summary: string;
  tips: string[];
};

export function PlacementQuizSection({
  onOpenStudyPlan,
  onSelectCourse,
  onBookPrivate,
  language,
}: PlacementQuizSectionProps) {
  const isEn = language === "en";
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [background, setBackground] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlacementEvaluation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = PLACEMENT_QUESTIONS.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < totalQuestions) {
      setError(
        isEn
          ? `Please answer all ${totalQuestions} questions first (${answeredCount}/${totalQuestions} answered).`
          : `يرجى الإجابة عن جميع الأسئلة الـ ${totalQuestions} أولاً (أجبت عن ${answeredCount} من ${totalQuestions}).`,
      );
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await apiFetch(appPath("/api/placement/evaluate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: language,
          answers,
          background,
          goal,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setResult({
          score: data.score,
          total: data.total,
          level: data.level,
          courseId: data.courseId,
          summary: data.summary,
          tips: Array.isArray(data.tips) ? data.tips : [],
        });
        void emitAppNotification({
          category: "quiz",
          titleAr: `نتيجة اختبار تحديد المستوى: ${data.score}/${data.total}`,
          titleEn: `Placement Quiz Result: ${data.score}/${data.total}`,
          bodyAr: `المستوى المقترح: ${data.level} — ${data.summary}`,
          bodyEn: `Recommended Level: ${data.level} — ${data.summary}`,
        });
      } else {
        setError(
          data.error ||
            (isEn
              ? "Something went wrong. Please try again."
              : "حدث خطأ أثناء التقييم، حاول مرة أخرى."),
        );
      }
    } catch {
      setError(
        isEn
          ? "Something went wrong. Please try again."
          : "حدث خطأ أثناء الاتصال بالخادم، حاول مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError("");
  };

  const recommendedCourse = result
    ? INITIAL_COURSES.find((c) => c.id === result.courseId)
    : undefined;

  return (
    <section
      id="placement-quiz"
      className="py-16 px-6 lg:px-10 max-w-[1240px] mx-auto border-t border-slate-800/80"
    >
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#070f1e] to-[#040914] p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 text-[11px] font-mono text-cyan-300 mb-2">
              <ClipboardCheck className="size-3.5" />
              <span>
                {isEn
                  ? "PLACEMENT TEST · AI & INSTRUCTOR EVALUATION"
                  : "اختبار تحديد المستوى المجاني · تقييم ذكي"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {isEn
                ? "Free Nuclear Chemistry Placement Test (8 Questions)"
                : "اختبار تحديد المستوى المجاني (٨ أسئلة تقييمية شاملة)"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-300 max-w-2xl">
              {isEn
                ? "8 quick scientific questions plus two about your academic background and goal. Evaluates your answers and recommends the right course in seconds."
                : "٨ أسئلة علمية سريعة + سؤالان عن خلفيتك الدراسية وهدفك. يقيّم النظام إجاباتك ويقترح المسار الأنسب لك خلال ثوانٍ."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-xs font-mono text-slate-300">
              {isEn ? "Answered:" : "الإجابات:"}{" "}
              <span className="font-bold text-cyan-400">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            {!result && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="rounded-xl border border-cyan-500/40 bg-cyan-950/60 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition cursor-pointer"
              >
                {isExpanded
                  ? isEn
                    ? "Compact View (4 Qs)"
                    : "عرض مختصر (٤ أسئلة)"
                  : isEn
                    ? "Show All 8 Questions"
                    : "عرض جميع الأسئلة الـ ٨"}
              </button>
            )}
          </div>
        </div>

        {result ? (
          <div className="rounded-2xl border border-cyan-500/40 bg-[#081224] p-6 sm:p-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 border-b border-slate-800 pb-6">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {isEn ? "Your Score" : "النتيجة"}
                </div>
                <div className="mt-1 font-mono text-4xl sm:text-5xl font-black text-cyan-400">
                  {result.score} / {result.total}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {isEn ? "Assessed Level" : "المستوى الأكاديمي المقدر"}
                </div>
                <div className="mt-2 text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Target className="size-5 text-cyan-400 shrink-0" />
                  <span>{result.level}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                {isEn ? "Recommended Course for You" : "الدورة المقترحة لك"}
              </div>
              <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="size-5 text-cyan-300" />
                <span>
                  {recommendedCourse
                    ? isEn
                      ? recommendedCourse.titleEn
                      : recommendedCourse.title
                    : isEn
                      ? "One-to-One Private Lessons with Eng. Mahmoud Shaltoot"
                      : "دروس خاصة فردية مباشرة مع المهندس محمود شلتوت"}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {result.tips.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isEn
                    ? "Concrete Study Tips from Eng. Mahmoud:"
                    : "نصائح ذهبية للمذاكرة من المهندس محمود شلتوت:"}
                </h4>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {result.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-200 leading-relaxed"
                    >
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {recommendedCourse && onSelectCourse ? (
                <button
                  type="button"
                  onClick={() => onSelectCourse(recommendedCourse.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                >
                  <span>
                    {isEn ? "Enroll in Recommended Course" : "سجّل في الدورة المقترحة الآن"}
                  </span>
                  <ArrowRight className="size-4" />
                </button>
              ) : onBookPrivate ? (
                <button
                  type="button"
                  onClick={onBookPrivate}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                >
                  <span>
                    {isEn ? "Book 1-on-1 Session" : "احجز جلسة خاصة الآن"}
                  </span>
                  <ArrowRight className="size-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={onOpenStudyPlan}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/60 px-5 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 transition cursor-pointer"
              >
                <Sparkles className="size-4" />
                <span>
                  {isEn
                    ? "Generate Custom AI Study Plan"
                    : "توليد خطة مذاكرة ذكية مخصصة"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>{isEn ? "Retake Test" : "إعادة الاختبار"}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(isExpanded || answeredCount >= 4
                ? PLACEMENT_QUESTIONS
                : PLACEMENT_QUESTIONS.slice(0, 4)
              ).map((q, i) => (
                <fieldset
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-[#0a1324]/90 p-5 transition hover:border-slate-700"
                >
                  <legend className="sr-only">{q.q[language]}</legend>
                  <div className="mb-3.5 flex items-start gap-2.5 text-sm font-bold text-white">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 font-mono text-xs text-cyan-400 border border-cyan-500/30">
                      0{i + 1}
                    </span>
                    <span className="leading-snug">{q.q[language]}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options[language].map((opt, idx) => {
                      const active = answers[q.id] === idx;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-all ${
                            active
                              ? "border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-sm"
                              : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            className="sr-only"
                            checked={active}
                            onChange={() => {
                              setAnswers((prev) => {
                                const next = { ...prev, [q.id]: idx };
                                if (Object.keys(next).length >= 4) {
                                  setIsExpanded(true);
                                }
                                return next;
                              });
                              setError("");
                            }}
                          />
                          <span
                            className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              active
                                ? "border-cyan-400 bg-cyan-400"
                                : "border-slate-600"
                            }`}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            {!isExpanded && answeredCount < 4 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  {isEn
                    ? "Show remaining 4 questions (Reactor Physics & Radiation Safety) ↓"
                    : "إظهار الأسئلة الأربعة المتبقية (فيزياء المفاعلات والسلامة الإشعاعية) ↓"}
                </button>
              </div>
            )}

            {/* Academic Background & Study Goal from knowledge-hub-plus */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-800/80">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {isEn
                    ? "Your Academic Background (e.g., 3rd-year chemistry student)"
                    : "خلفيتك الدراسية (مثال: طالب كيمياء أو هندسة نووية سنة ثالثة)"}
                </span>
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  maxLength={500}
                  placeholder={
                    isEn
                      ? "Optional — helps tailor your recommendation"
                      : "اختياري — يساعد في تخصيص التوصية لمستواك"
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {isEn
                    ? "Your Goal (university exam, graduation project, career...)"
                    : "هدفك الدراسي (اختبار فصلي، مشروع تخرج، تأسيس شامل...)"}
                </span>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  maxLength={500}
                  placeholder={
                    isEn
                      ? "e.g., Midterm exam prep or reactor thesis"
                      : "مثال: الاستعداد لاختبار الكيمياء النووية أو بحث تخرج"
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </label>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-2.5 text-xs font-semibold text-rose-300">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {isEn
                  ? "Answer all 8 questions to unlock your personalized course recommendation."
                  : "أجب عن الأسئلة الثمانية للحصول على تقييم فوري وتوصية بالدورة المناسبة لك."}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-xs font-bold text-slate-950 shadow-lg transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
              >
                {loading
                  ? isEn
                    ? "Evaluating your level..."
                    : "جارٍ تقييم إجاباتك..."
                  : isEn
                    ? "Evaluate My Level Now"
                    : "قيّم مستواي واقترح المسار المناسب"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
