import React, { useState } from "react";
import { Course, Lesson, UserProfile } from "../types";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { StudentProgressCharts } from "./StudentProgressCharts";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

interface StudentPortalProps {
  currentUser: UserProfile;
  courses: Course[];
  completedLessonIds: string[];
  onCompleteLesson: (lessonId: string, earnedXp: number) => void;
  onOpenSpacedRepetition: () => void;
  language: "ar" | "en";
}

export function StudentPortal({
  currentUser,
  courses,
  completedLessonIds,
  onCompleteLesson,
  onOpenSpacedRepetition,
  language,
}: StudentPortalProps) {
  const isEn = language === "en";

  const enrolledCourses = courses.filter((c) =>
    currentUser.enrolledCourseIds.includes(c.id)
  );

  const [portalView, setPortalView] = useState<"analytics" | "lessons">("analytics");
  const [selectedCourse, setSelectedCourse] = useState<Course>(enrolledCourses[0] || courses[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    selectedCourse?.lessons[0] || courses[0].lessons[0]
  );

  // Lesson states
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const isCurrentLessonDone = completedLessonIds.includes(selectedLesson.id);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizAnswer === null) return;
    const isCorrect = selectedQuizAnswer === selectedLesson.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setQuizSubmitted(true);
    if (isCorrect && !isCurrentLessonDone) {
      onCompleteLesson(selectedLesson.id, 50);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto space-y-8">
      {/* Student Overview Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#060e1d] via-[#09152b] to-[#060c18] p-6 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
            <span className="size-2 rounded-full bg-cyan-400 pulse-dot" />
            <span>{isEn ? "STUDENT ACADEMIC PORTAL" : "بوابة الطالب الأكاديمية"}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isEn ? "Welcome back, " : "أهلاً بك، "}
            <span className="text-[#00f0ff]">{currentUser.name}</span>
          </h1>
          <p className="text-xs text-slate-300">
            {isEn
              ? "Track your lessons, interactive simulations, and flashcard spaced repetitions."
              : "تابع دروسك، وتدرّب على حل مسائل المفاعلات، وراجع بطاقات التكرار المتباعد."}
          </p>
        </div>

        {/* Gamification Bar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* XP & Level */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 px-4 py-2 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">XP Points</div>
            <div className="text-lg font-black text-[#00f0ff] font-mono">{currentUser.xp} XP</div>
          </div>

          <div className="rounded-xl border border-pink-500/30 bg-slate-900/90 px-4 py-2 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Energy Level</div>
            <div className="text-sm font-bold text-[#ec4899]">{currentUser.level}</div>
          </div>

          {/* Spaced repetition button */}
          <button
            onClick={onOpenSpacedRepetition}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>{isEn ? "Spaced Repetition (Anki)" : "مراجعة البطاقات الذكية"}</span>
          </button>
        </div>
      </div>

      {/* Portal Navigation Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPortalView("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              portalView === "analytics"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                : "text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>{isEn ? "Analytics & Progress Charts (Recharts)" : "الرسوم البيانية ومقارنة التقدم بالأكاديمية"}</span>
          </button>

          <button
            onClick={() => setPortalView("lessons")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              portalView === "lessons"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                : "text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
            }`}
          >
            <BookOpen className="size-4" />
            <span>{isEn ? "Classroom & Video Lectures" : "قاعة المحاضرات والدروس"}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 pulse-dot" />
          <span>{isEn ? "Progress saved in this browser" : "يُحفظ تقدمك في هذا المتصفح"}</span>
        </div>
      </div>

      {/* View 1: Analytics & Recharts Charts */}
      {portalView === "analytics" && (
        <StudentProgressCharts
          currentUser={currentUser}
          courses={courses}
          completedLessonIds={completedLessonIds}
          language={language}
        />
      )}

      {/* View 2: Main Learning Hub Layout */}
      {portalView === "lessons" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lessons Outline */}
        <div className="lg:col-span-4 space-y-4">
          {/* Course Selector Tabs */}
          <div className="rounded-xl border border-slate-800 bg-[#080d1a] p-3 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              {isEn ? "Select Active Course" : "اختر الدورة الحالية"}
            </label>
            <div className="space-y-1.5">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedLesson(course.lessons[0]);
                    setSelectedQuizAnswer(null);
                    setQuizSubmitted(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-right transition-all cursor-pointer ${
                    selectedCourse.id === course.id
                      ? "bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/40"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="truncate">{course.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                    {course.level}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lessons list for chosen course */}
          <div className="rounded-xl border border-slate-800 bg-[#080d1a] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
              <span>{isEn ? "Course Curriculum" : "قائمة الدروس والمحاضرات"}</span>
              <span className="text-cyan-400 text-[11px] font-mono">
                {completedLessonIds.filter((id) => id.startsWith(selectedCourse.id.slice(0, 4))).length}/
                {selectedCourse.lessons.length} {isEn ? "Done" : "منجز"}
              </span>
            </div>

            <div className="space-y-2">
              {selectedCourse.lessons.map((lesson, idx) => {
                const isDone = completedLessonIds.includes(lesson.id);
                const isActive = selectedLesson.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`w-full text-right p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? "border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <div className="size-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-mono text-slate-400">
                        {idx + 1}
                      </div>
                    )}
                    <div className="flex-1 truncate">
                      <div className="font-semibold truncate">{lesson.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lesson.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Completion preview button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-pink-950/30 p-2.5 text-xs font-bold text-pink-300 hover:bg-pink-900/40 transition-all cursor-pointer"
              >
                <Award className="size-4" />
                <span>{isEn ? "View completion preview" : "عرض معاينة الإنجاز"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Lesson Player & Quiz Checkpoint */}
        <div className="lg:col-span-8 space-y-6">
          {/* Functional High-Definition Video & Simulation Player */}
          <LessonVideoPlayer
            lesson={selectedLesson}
            isCompleted={isCurrentLessonDone}
            onComplete={() => onCompleteLesson(selectedLesson.id, 50)}
            language={language}
          />

          {/* Key Formulas & Notes Drawer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-cyan-500/20 bg-[#070e1c] p-4 space-y-2">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span>{isEn ? "Key Mathematical & Physical Formulas:" : "أهم القوانين والمعادلات في الدرس:"}</span>
              </div>
              <div className="space-y-1 font-mono text-xs text-slate-200">
                {selectedLesson.keyFormulas.map((f, i) => (
                  <div key={i} className="rounded bg-black/50 p-2 border border-slate-800 text-cyan-200">
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#070e1c] p-4 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="size-3.5" />
                <span>{isEn ? "Personal Study Notes:" : "ملاحظاتي الشخصية على الدرس:"}</span>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isEn ? "Write notes or equations to remember..." : "اكتب ملاحظاتك أو أسئلتك لمراجعتها لاحقاً..."}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Interactive Checkpoint Quiz */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#070d1a] p-6 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {isEn ? "Checkpoint Quiz: Test Your Understanding" : "نقطة التحقق: اختبار فهم الدرس وتطبيق المفاهيم"}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">+50 XP</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              {selectedLesson.quiz.question}
            </p>

            {/* Options */}
            <div className="space-y-2">
              {selectedLesson.quiz.options.map((opt, i) => {
                let borderClass = "border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700";
                if (selectedQuizAnswer === i) {
                  borderClass = "border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold";
                }
                if (quizSubmitted) {
                  if (i === selectedLesson.quiz.correctIndex) {
                    borderClass = "border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold";
                  } else if (selectedQuizAnswer === i) {
                    borderClass = "border-rose-500 bg-rose-950/50 text-rose-200";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={quizSubmitted}
                    onClick={() => setSelectedQuizAnswer(i)}
                    className={`w-full text-right p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${borderClass}`}
                  >
                    <span>{opt}</span>
                    <span className="size-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quiz Action & Feedback */}
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={selectedQuizAnswer === null}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                {isEn ? "Submit Answer & Verify" : "تحقق من الإجابة واكسب +50 XP"}
              </button>
            ) : (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  quizCorrect
                    ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                    : "border-rose-500/40 bg-rose-950/40 text-rose-300"
                }`}
              >
                <div className="font-bold">
                  {quizCorrect
                    ? (isEn ? "Correct answer. (+50 XP earned)" : "إجابة صحيحة. أحسنت، كسبت +50 نقطة خبرة")
                    : (isEn ? "Incorrect. Review the explanation:" : "إجابة غير دقيقة. إليك التوضيح العلمي:")}
                </div>
                <p className="text-[11px] text-slate-300">{selectedLesson.quiz.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Non-accredited completion preview */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border-2 border-amber-400/60 bg-[#080d19] p-8 text-center space-y-6 shadow-[0_0_90px_rgba(245,158,11,0.35)]">
            <div className="flex justify-between items-center text-xs font-mono text-amber-400 border-b border-amber-500/30 pb-3">
              <span>{isEn ? "SAMPLE COMPLETION PREVIEW · NOT AN OFFICIAL CREDENTIAL" : "معاينة إنجاز تجريبية · ليست شهادة رسمية"}</span>
              <span className="font-mono">PREVIEW ID: {currentUser.id.slice(0, 6)}</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-slate-400">{isEn ? "Learning milestone preview" : "معاينة إنجاز تعليمي"}</div>
              <h2 className="text-2xl font-extrabold text-white">
                {isEn ? "Nuclear Knowledge Hub" : "منصة المهندس محمود شلتوت للكيمياء النووية"}
              </h2>
            </div>

            <div className="py-4 border-y border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">{isEn ? "Sample profile" : "ملف تعليمي تجريبي"}</p>
              <div className="text-2xl font-black text-amber-300">{currentUser.name}</div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {isEn
                  ? <>This preview shows local learning data for <strong className="text-white">{selectedCourse.title}</strong>, including a sample quiz score of {currentUser.avgQuizScore}%. It does not verify course completion or grant a qualification.</>
                  : <>تعرض هذه المعاينة بيانات التعلّم المحلية لمقرر <strong className="text-white">«{selectedCourse.title}»</strong>، ومنها نتيجة اختبار تجريبية {currentUser.avgQuizScore}٪. لا تثبت إتمام مقرر ولا تمنح مؤهلًا.</>}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 px-6 text-xs text-slate-400">
              <div className="text-right">
                <div className="text-slate-300 font-bold">{isEn ? "Learning progress" : "تقدم التعلّم"}</div>
                <div className="text-[10px]">{isEn ? "Saved on this device" : "محفوظ على هذا الجهاز"}</div>
              </div>
              <div className="flex size-14 items-center justify-center rounded-lg border border-amber-400/40 bg-black/50 p-1 text-[8px] font-mono text-amber-300">
                {isEn ? "[PREVIEW ONLY]" : "[معاينة فقط]"}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <Download className="size-4" />
                <span>{isEn ? "Print this preview" : "طباعة المعاينة"}</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                {isEn ? "Close" : "إغلاق"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
