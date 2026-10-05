import React from "react";
import reactorNeonImg from "../assets/reactor-core-neon.png";
import { useStudentCounter } from "../hooks/useStudentCounter";

interface HeroSectionProps {
  onStartJourney: () => void;
  onBrowseCourses: () => void;
  onOpenSimulator: () => void;
  language: "ar" | "en";
}

export function HeroSection({
  onStartJourney,
  onBrowseCourses,
  onOpenSimulator,
  language,
}: HeroSectionProps) {
  const {
    count,
    isPulsing,
    notification,
    isLoading,
    error,
    coursesCount,
    experienceYears,
  } = useStudentCounter();
  const isEn = language === "en";

  const formattedStudentCountAr =
    isLoading || error
      ? "+٥٠٠"
      : `+${count.toLocaleString("ar-SA")}`;

  const formattedStudentCountEn =
    isLoading || error
      ? "+500"
      : `+${count.toLocaleString("en-US")}`;

  const displayCoursesCount = Math.max(12, coursesCount ?? 12);

  return (
    <div className="relative overflow-hidden pt-10 pb-14 lg:pt-16 lg:pb-20">
      {/* Subtle 68px technical square grid overlay matching image.png */}
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-90" />

      {/* Ambient Cyan & Magenta Radial Glows matching image.png */}
      <div className="pointer-events-none absolute -top-28 right-10 h-[520px] w-[520px] rounded-full bg-[#00e8f5]/7 blur-[150px]" />
      <div className="pointer-events-none absolute top-12 left-8 h-[480px] w-[480px] rounded-full bg-[#ef2b88]/8 blur-[150px]" />

      {/* Hourly enrollment notification toast */}
      {notification && (
        <div className="relative z-30 mx-auto max-w-xl px-4 mb-6 transition-all duration-500">
          <div className="nuclear-glow flex items-center gap-3 rounded-full border border-[#00e8f5]/40 bg-[#07111e]/90 backdrop-blur-md px-4 py-2 text-xs text-[#00e8f5]">
            <span className="size-2 rounded-full bg-[#00e8f5] pulse-dot" />
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}

      {/* Main Hero Grid matching image.png (Right in RTL: Arabic Headline & CTAs, Left in RTL: Glowing Reactor Core Card) */}
      <section className="relative z-10 mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Text & CTAs Column (Appears on Right in RTL, Left in LTR) */}
          <div className="lg:col-span-7 text-start">
            {/* Top Status Pill matching image.png */}
            <div className="nuclear-glow mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#192536] bg-[#0a101b]/90 px-4 py-1.5 text-[12px] text-[#94a3b8] backdrop-blur-md">
              <span className="pulse-dot size-2 rounded-full bg-[#00e8f5] shadow-[0_0_8px_#00e8f5]" />
              <span>
                {isEn
                  ? "Available now · Enrollment open for the new cohort"
                  : "متاحة الآن · التسجيل مفتوح للدفعة الجديدة"}
              </span>
            </div>

            {/* Giant Headline matching image.png exact font, weight, and shades (#00e8f5 & #ef2b88) */}
            <h1 className="text-[42px] sm:text-[56px] lg:text-[66px] font-bold leading-[1.15] tracking-tight text-[#f4f7fb]">
              {isEn ? (
                <>
                  Nuclear chemistry,{" "}
                  <span className="text-[#00e8f5]">clearly</span>
                  <br />
                  and in{" "}
                  <span className="text-[#ef2b88]">real depth</span>.
                </>
              ) : (
                <>
                  الكيمياء النووية{" "}
                  <span className="text-[#00e8f5]">بوضوح</span>
                  <br />و<span className="text-[#ef2b88]">بعمق</span> حقيقي.
                </>
              )}
            </h1>

            {/* Subtitle matching image.png */}
            <p className="mt-6 max-w-xl text-[16px] sm:text-[17px] leading-[1.85] text-[#78879b]">
              {isEn ? (
                <>
                  Courses and private lessons by{" "}
                  <strong className="font-semibold text-[#f4f7fb]">
                    Eng. Mahmoud Ismail Shaltoot
                  </strong>{" "}
                  — nuclear chemistry engineer and instructor. We build understanding
                  from the roots: from reactions and isotopes to reactors, in simple,
                  precise language designed for students in Saudi Arabia and the Gulf.
                </>
              ) : (
                <>
                  دورات ودروس خاصة يقدّمها{" "}
                  <strong className="font-semibold text-[#f4f7fb]">
                    المهندس/ محمود إسماعيل شلتوت
                  </strong>{" "}
                  — مهندس كيمياء نووية ومدرّب. نبني الفهم من الجذر: من التفاعلات
                  والنظائر إلى المفاعلات، بلغة بسيطة ودقيقة مصمّمة لطلاب المملكة
                  والخليج.
                </>
              )}
            </p>

            {/* Primary & Secondary Pill Buttons matching image.png with .nuclear-glow */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartJourney}
                className="btn-primary nuclear-glow cursor-pointer"
              >
                {isEn ? "Start your journey" : "ابدأ رحلتك الآن"}
              </button>

              <button
                type="button"
                onClick={onBrowseCourses}
                className="btn-ghost nuclear-glow cursor-pointer"
              >
                {isEn ? "Browse courses" : "استعرض الدورات"}
              </button>
            </div>

            {/* Micro-indicators row below buttons matching image.png */}
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2 text-[12px] text-[#64748b]">
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#ef2b88]" />
                <span>
                  {isEn ? (
                    `${formattedStudentCountEn} students`
                  ) : (
                    <>
                      <span dir="ltr" className="inline-block font-medium text-[#94a3b8]">
                        {formattedStudentCountAr}
                      </span>{" "}
                      طالب
                    </>
                  )}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#00e8f5]" />
                <span>
                  {isEn
                    ? `${displayCoursesCount} specialized courses`
                    : "١٢ دورة متخصصة"}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#00e8f5]" />
                <span>
                  {isEn ? "1-on-1 online lessons" : "دروس فردية أونلاين"}
                </span>
              </span>
            </div>
          </div>

          {/* Left Column (in RTL): Glowing Neon Cylindrical Reactor Core Card (reactor-core-neon.png) */}
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={onOpenSimulator}
              aria-label={isEn ? "Open interactive reactor simulator" : "فتح محاكي المفاعل النووي"}
              className="nuclear-glow group relative block w-full overflow-hidden rounded-2xl border border-[#162334] bg-[#080e17] text-start cursor-pointer"
            >
              {/* Top Header Bar: REACTOR CORE (left) | • ONLINE (right) matching image.png */}
              <div
                className="flex items-center justify-between border-b border-[#131f2e] bg-[#09111b] px-5 py-3.5 font-mono text-[11px] uppercase"
                dir="ltr"
              >
                <span className="font-semibold tracking-[0.2em] text-[#56687a]">
                  REACTOR CORE
                </span>
                <span className="flex items-center gap-2 font-bold tracking-[0.14em] text-[#00e8f5]">
                  <span className="pulse-dot size-1.5 rounded-full bg-[#00e8f5]" />
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Neon Cylindrical Reactor Core Image with U 235 badge at top-right */}
              <div className="nuclear-visual relative overflow-hidden bg-[#050912]">
                <span
                  dir="ltr"
                  className="pointer-events-none absolute top-3.5 right-4 z-20 rounded bg-[#050912]/75 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-[#00e8f5] backdrop-blur-sm"
                >
                  U 235
                </span>
                <img
                  src={reactorNeonImg}
                  alt={
                    isEn
                      ? "Glowing neon blue and magenta nuclear reactor core"
                      : "قلب المفاعل النووي المضاء باللونين السيان والماجينتا"
                  }
                  width={465}
                  height={470}
                  className="aspect-[4/4.35] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Stats Strip — Numbers & Labels Aligned Together in Both Arabic (RTL) & English (LTR) */}
      <section className="relative z-10 mx-auto mt-16 max-w-[1240px] border-t border-[#141e2d] px-6 pt-10 pb-4 lg:mt-20 lg:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Stat 1 (Rightmost in RTL): 500+ Students in #00e8f5 */}
          <div className="flex flex-col items-start text-start">
            <span
              dir="ltr"
              className={`inline-block font-display text-4xl font-bold lg:text-5xl transition-transform duration-300 ${
                isPulsing ? "scale-105 text-white" : "text-[#00e8f5]"
              }`}
            >
              {isLoading || error ? "500+" : `${count}+`}
            </span>
            <div className="mt-2 text-[13px] text-[#78879b]">
              {isEn ? "Students" : "طالب وطالبة"}
            </div>
          </div>

          {/* Stat 2: 12 Specialized Courses in #f4f7fb */}
          <div className="flex flex-col items-start text-start">
            <span
              dir="ltr"
              className="inline-block font-display text-4xl font-bold text-[#f4f7fb] lg:text-5xl"
            >
              {displayCoursesCount}
            </span>
            <div className="mt-2 text-[13px] text-[#78879b]">
              {isEn ? "Specialized courses" : "دورة متخصصة"}
            </div>
          </div>

          {/* Stat 3: 98% Satisfaction in #f4f7fb */}
          <div className="flex flex-col items-start text-start">
            <span
              dir="ltr"
              className="inline-block font-display text-4xl font-bold text-[#f4f7fb] lg:text-5xl"
            >
              98%
            </span>
            <div className="mt-2 text-[13px] text-[#78879b]">
              {isEn ? "Satisfaction" : "نسبة الرضا"}
            </div>
          </div>

          {/* Stat 4 (Leftmost in RTL): +12 Years Experience in #ef2b88 */}
          <div className="flex flex-col items-start text-start">
            <span
              dir="ltr"
              className="inline-block font-display text-4xl font-bold text-[#ef2b88] lg:text-5xl"
            >
              +{String(experienceYears ?? "12+").replace(/\+/g, "")}
            </span>
            <div className="mt-2 text-[13px] text-[#78879b]">
              {isEn ? "Years of experience" : "سنوات خبرة"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
