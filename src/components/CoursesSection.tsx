import React, { useState } from "react";
import { Course } from "../types";
import { CourseArtwork } from "./CourseArtwork";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface CoursesSectionProps {
  courses: Course[];
  onEnroll: (course: Course) => void;
  language: "ar" | "en";
}

export function CoursesSection({ courses, onEnroll, language }: CoursesSectionProps) {
  const isEn = language === "en";
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

  const filteredCourses =
    selectedFilter === "all"
      ? courses
      : courses.filter((c) => c.id === selectedFilter);

  return (
    <section id="courses" className="mx-auto max-w-[1240px] px-6 py-16 lg:px-10 lg:py-20">
      {/* Section Header matching Screenshot 2 ("COURSES / الدورات المتاحة" + "عرض الكل ←") */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-3" dir="ltr">
            COURSES
          </div>
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            {isEn ? "Available courses" : "الدورات المتاحة"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", ar: "عرض الكل ←", en: "View all →" },
            { id: "fundamentals", ar: "الأساسيات", en: "Fundamentals" },
            { id: "reactors", ar: "المفاعلات", en: "Reactors" },
            { id: "safety", ar: "السلامة الإشعاعية", en: "Safety" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                selectedFilter === tab.id
                  ? "border border-[#00e5ff]/60 bg-[#00e5ff]/12 text-[#00e5ff]"
                  : "border border-slate-800 bg-[#0b111d]/60 text-slate-400 hover:border-[#00e5ff]/40 hover:text-white"
              }`}
            >
              {isEn ? tab.en : tab.ar}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {filteredCourses.map((course) => {
          const isSyllabusOpen = expandedSyllabusId === course.id;
          return (
            <article
              key={course.id}
              className="course-card nuclear-glow group flex flex-col overflow-hidden rounded-2xl border border-[#162334] bg-[#090e18]/90 backdrop-blur-md"
            >
              {/* Top Visual with Orbital Rings & HUD Labels (NKH / 01..03) */}
              <CourseArtwork
                courseId={course.id}
                fallbackImage={course.image}
                fallbackAlt={isEn ? course.titleEn : course.title}
                lang={language}
                className="aspect-[16/10] w-full"
              />

              {/* Card Body matching Screenshot 2 */}
              <div className="flex flex-1 flex-col p-6">
                {/* Level & Tag Row */}
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="font-display text-[11px] uppercase tracking-[0.18em] text-slate-400"
                    dir="ltr"
                  >
                    {course.level}
                  </span>
                  <span
                    className={
                      course.tagTone === "accent"
                        ? "rounded-full bg-[#f02a98]/15 border border-[#f02a98]/35 px-3 py-1 text-[11px] font-semibold text-[#f02a98]"
                        : "rounded-full bg-[#00e5ff]/12 border border-[#00e5ff]/35 px-3 py-1 text-[11px] font-semibold text-[#00e5ff]"
                    }
                  >
                    {course.tag}
                  </span>
                </div>

                {/* Course Title & Description */}
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                  {isEn ? course.titleEn : course.title}
                </h3>
                <p className="mb-5 flex-1 text-[14px] leading-relaxed text-slate-400">
                  {isEn ? course.descEn : course.desc}
                </p>

                {/* Collapsible Syllabus Topics so all detailed content remains accessible */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSyllabusId(isSyllabusOpen ? null : course.id)
                    }
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-[#00e5ff] transition cursor-pointer"
                  >
                    <span>
                      {isEn
                        ? `Course syllabus (${course.lessonsCount} lessons)`
                        : `محاور الدورة (${course.lessonsCount} محاضرة)`}
                    </span>
                    {isSyllabusOpen ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>
                  {isSyllabusOpen && (
                    <ul className="mt-2.5 space-y-1.5 rounded-xl border border-slate-800/80 bg-[#070b14] p-3 text-xs text-slate-300">
                      {(isEn && course.topicsEn ? course.topicsEn : course.topics).map(
                        (topic, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-[#00e5ff] shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>

                {/* Price Row matching Screenshot 2 */}
                <div className="mb-4 flex items-end justify-between gap-3">
                  <span className="text-[12px] text-slate-400">
                    {isEn ? "Course fee" : "رسوم الدورة"}
                  </span>
                  <span className="font-display text-xl font-bold text-white">
                    {course.price}{" "}
                    <span className="text-[11px] font-semibold text-[#00e5ff]">
                      {isEn ? "SAR" : "ر.س"}
                    </span>
                  </span>
                </div>

                {/* Bottom Duration + Enroll Link Row matching Screenshot 2 */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-[12px] text-slate-400">
                  <span>
                    {isEn ? course.durationEn : course.duration} ·{" "}
                    {isEn ? course.modeEn || "Live online" : course.mode}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEnroll(course)}
                    className="shrink-0 font-bold text-[#00e5ff] transition hover:text-white cursor-pointer"
                  >
                    {isEn ? (
                      <>
                        Enroll <span aria-hidden="true">→</span>
                      </>
                    ) : (
                      <>
                        سجّل الآن <span aria-hidden="true">←</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
