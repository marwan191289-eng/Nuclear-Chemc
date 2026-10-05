import React from "react";
import fundamentals from "../assets/nuclear-fundamentals.jpg";
import reactors from "../assets/nuclear-reactors.jpg";
import safety from "../assets/nuclear-safety.jpg";

type KnownCourseId = "fundamentals" | "reactors" | "safety";

const COURSE_ART: Record<
  KnownCourseId,
  { src: string; alt: { ar: string; en: string }; label: string; index: string }
> = {
  fundamentals: {
    src: fundamentals,
    alt: {
      ar: "تصوير علمي لنواة ذرية مكوّنة من بروتونات ونيوترونات تحيط بها مدارات إلكترونية مضيئة",
      en: "Scientific visualization of an atomic nucleus with orbiting electrons",
    },
    label: "NUCLEAR STRUCTURE",
    index: "NKH / 01",
  },
  reactors: {
    src: reactors,
    alt: {
      ar: "حوض مفاعل بحثي مضاء بالضوء الأزرق داخل منشأة نووية",
      en: "Blue-lit research reactor pool inside a nuclear facility",
    },
    label: "REACTOR SYSTEMS",
    index: "NKH / 02",
  },
  safety: {
    src: safety,
    alt: {
      ar: "جهاز قياس إشعاعي وقارورة عينة داخل مختبر علمي",
      en: "Radiation survey meter and sample vial in a scientific laboratory",
    },
    label: "RADIATION SAFETY",
    index: "NKH / 03",
  },
};

export function CourseArtwork({
  courseId,
  fallbackImage,
  fallbackAlt,
  lang = "ar",
  className = "",
  children,
}: {
  courseId: string;
  fallbackImage?: string;
  fallbackAlt?: string;
  lang?: "ar" | "en";
  className?: string;
  children?: React.ReactNode;
}) {
  const art = COURSE_ART[courseId as KnownCourseId];
  const src = art ? art.src : fallbackImage || fundamentals;
  const alt = art ? art.alt[lang] : fallbackAlt || (lang === "en" ? "Nuclear chemistry course" : "دورة الكيمياء النووية");
  const label = art ? art.label : "NUCLEAR TRACK";
  const badge = art ? art.index : "NKH / PRO";

  return (
    <div className={`course-art nuclear-visual relative isolate overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111e]/90 via-[#07111e]/15 to-transparent" />
      <span
        className="absolute bottom-3 left-4 z-10 font-mono text-[10px] font-bold tracking-[0.2em] text-cyan-200/90 drop-shadow"
        dir="ltr"
      >
        {label}
      </span>
      <span
        className="absolute top-3 left-3 z-10 rounded-full border border-cyan-400/30 bg-[#091522]/70 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.16em] text-cyan-200 backdrop-blur-sm"
        dir="ltr"
      >
        {badge}
      </span>
      {children}
    </div>
  );
}
