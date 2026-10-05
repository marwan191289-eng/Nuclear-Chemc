import React, { useEffect, useState } from "react";
import { INITIAL_COURSES } from "../data/coursesData";
import {
  BookOpen,
  Clock,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Download,
  Sparkles,
} from "lucide-react";

interface ArticlesSectionProps {
  language: "ar" | "en";
  onSelectCourse?: (courseId: string) => void;
  onOpenPlacement?: () => void;
}

export type BilingualArticle = {
  id: string;
  slug: string;
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  readTimeAr: string;
  readTimeEn: string;
  readMinutes: number;
  date: string;
  relatedCourse: "fundamentals" | "reactors" | "safety";
  excerptAr: string;
  excerptEn: string;
  formulaHighlight: string;
  sectionsAr: { h: string; p: string[] }[];
  sectionsEn: { h: string; p: string[] }[];
};

export const KNOWLEDGE_ARTICLES: BilingualArticle[] = [
  {
    id: "art-1",
    slug: "half-life-explained",
    categoryAr: "ملخصات ومسائل محلولة",
    categoryEn: "Summaries & Worked Problems",
    titleAr: "عمر النصف ببساطة: الشرح والقانون ومسائل محلولة خطوة بخطوة",
    titleEn: "Half-Life Explained: Formula and Worked Problems Step-by-Step",
    readTimeAr: "٦ دقائق قراءة",
    readTimeEn: "6 min read",
    readMinutes: 6,
    date: "2026-09-20",
    relatedCourse: "fundamentals",
    excerptAr:
      "ملخص مجاني يشرح مفهوم عمر النصف في الكيمياء النووية، مع القانون الأساسي والصيغة الأسية وطريقة حل المسائل دون أخطاء.",
    excerptEn:
      "A concise summary of half-life in nuclear chemistry, covering both discrete and exponential decay formulas with worked examples.",
    formulaHighlight: "N(t) = N₀ · (1/2)^(t / T₁/₂)  |  λ = 0.693 / T₁/₂",
    sectionsAr: [
      {
        h: "ما هو عمر النصف؟",
        p: [
          "عمر النصف (Half-life) هو الزمن اللازم لاضمحلال نصف عدد الأنوية المشعة في عينة ما. وهو خاصية مميزة وثابتة لكل نظير مشع ولا يتأثر بالحرارة أو الضغط أو الحالة الكيميائية.",
        ],
      },
      {
        h: "القانون الأساسي والصيغة الأسية",
        p: [
          "الكمية المتبقية = الكمية الابتدائية × (1/2)^n، حيث n عدد أعمار النصف التي مرّت، أي n = الزمن الكلي ÷ عمر النصف.",
          "ويمكن كتابته أيضاً بالصيغة الأسية المعتمدة في الجامعات: N(t) = N₀ e^(−λt)، حيث ثابت الاضمحلال λ = 0.693 ÷ عمر النصف.",
        ],
      },
      {
        h: "مثال محلول بالتفصيل",
        p: [
          "عينة من اليود-131 كتلتها الابتدائية 80 جراماً وعمر نصفها 5 أيام. كم يتبقى منها بعد 15 يوماً؟",
          "الخطوة الأولى: نحسب عدد الفترات n = 15 ÷ 5 = 3 أعمار نصف. الخطوة الثانية: الكتلة المتبقية = 80 × (1/2)³ = 80 × 1/8 = 10 جرامات متبقية (بينما اضمحل 70 جراماً).",
        ],
      },
      {
        h: "أخطاء شائعة في الاختبارات",
        p: [
          "الخلط بين «الكمية المتبقية» و«الكمية المضمحلة»، ونسيان توحيد وحدات الزمن (دقائق، ساعات، أيام) قبل قسمة الزمن الكلي على عمر النصف.",
        ],
      },
    ],
    sectionsEn: [
      {
        h: "What is half-life?",
        p: [
          "Half-life is the time required for half of the radioactive nuclei in a sample to decay. It is a constant characteristic of each isotope and is unaffected by temperature, pressure, or chemical state.",
        ],
      },
      {
        h: "The core formula & exponential law",
        p: [
          "Remaining amount = initial amount × (1/2)^n, where n = elapsed time ÷ half-life.",
          "Equivalently, in university problem sets: N(t) = N₀ e^(−λt) with decay constant λ = 0.693 ÷ half-life.",
        ],
      },
      {
        h: "Worked example",
        p: [
          "An 80 g radioactive sample has a 5-day half-life. After 15 days: n = 15 ÷ 5 = 3 half-lives, so 80 × (1/2)³ = 10 g remain (and 70 g have decayed).",
        ],
      },
      {
        h: "Common exam mistakes",
        p: [
          "Confusing the amount remaining with the amount decayed, and forgetting to convert time units before dividing.",
        ],
      },
    ],
  },
  {
    id: "art-2",
    slug: "alpha-beta-gamma",
    categoryAr: "مقالات علمية",
    categoryEn: "Scientific Articles",
    titleAr: "الفرق بين إشعاع ألفا وبيتا وجاما: الطبيعة والاختراق ومعادلات الاضمحلال",
    titleEn: "Alpha vs Beta vs Gamma Radiation: Penetration & Decay Equations",
    readTimeAr: "٥ دقائق قراءة",
    readTimeEn: "5 min read",
    readMinutes: 5,
    date: "2026-09-12",
    relatedCourse: "fundamentals",
    excerptAr:
      "مقارنة واضحة بين أنواع الإشعاع النووي الثلاثة من حيث الشحنة والكتلة والقدرة على الاختراق والتدريع المناسب لكل نوع.",
    excerptEn:
      "A clear comparison of the three primary types of nuclear radiation: nature, charge, penetrating power, shielding, and nuclear equations.",
    formulaHighlight: "²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He (α)  |  ¹⁴₆C → ¹⁴₇N + ⁰₋₁e (β⁻)",
    sectionsAr: [
      {
        h: "إشعاع ألفا (Alpha — α)",
        p: [
          "هو نواة ذرة هيليوم تتكون من بروتونين ونيوترونين (⁴₂He). عند انبعاث جسيم ألفا من نواة ثقيلة ينقص العدد الذري بمقدار 2 وينقص العدد الكتلي بمقدار 4.",
          "قدرته على التأيين عالية جداً لكن قدرته على الاختراق ضعيفة وتوقفه ورقة عادية أو طبقة الجلد الخارجية.",
        ],
      },
      {
        h: "إشعاع بيتا (Beta — β)",
        p: [
          "إلكترون عالي السرعة ينتج عن تحول نيوترون إلى بروتون داخل النواة غير المستقرة. يزيد العدد الذري بمقدار 1 ويبقى العدد الكتلي ثابتاً.",
          "قدرته على الاختراق متوسطة ويتم إيقافه بواسطة لوح رقيق من الألومنيوم أو البلاستيك الكثيف.",
        ],
      },
      {
        h: "إشعاع جاما (Gamma — γ)",
        p: [
          "موجات كهرومغناطيسية عالية الطاقة (فوتونات) بدون كتلة أو شحنة، تنبعث غالباً بعد اضمحلال ألفا أو بيتا لتفريغ الطاقة الزائدة دون تغيير العدد الذري أو الكتلي.",
          "اختراقها عالٍ جداً وتحتاج إلى دروع من الرصاص الكثيف أو الخرسانة المسلحة السميكة.",
        ],
      },
    ],
    sectionsEn: [
      {
        h: "Alpha radiation (α)",
        p: [
          "A helium nucleus consisting of 2 protons and 2 neutrons (⁴₂He). Emission reduces the atomic number by 2 and the mass number by 4. High ionization power, weak penetration — stopped by a sheet of paper.",
        ],
      },
      {
        h: "Beta radiation (β)",
        p: [
          "A fast electron emitted when a neutron converts into a proton inside the nucleus. Atomic number increases by 1 while mass number remains unchanged. Stopped by a thin aluminum plate.",
        ],
      },
      {
        h: "Gamma radiation (γ)",
        p: [
          "High-energy electromagnetic photons with zero mass and charge. Leaves Z and A unchanged. Highly penetrating — requires dense lead or thick concrete shielding.",
        ],
      },
    ],
  },
  {
    id: "art-3",
    slug: "how-nuclear-reactor-works",
    categoryAr: "هندسة المفاعلات",
    categoryEn: "Reactor Engineering",
    titleAr: "كيف يعمل المفاعل النووي؟ الوقود والمهدّئ وقضبان التحكم",
    titleEn: "How Does a Nuclear Reactor Work? Fuel, Moderator & Control Rods",
    readTimeAr: "٧ دقائق قراءة",
    readTimeEn: "7 min read",
    readMinutes: 7,
    date: "2026-09-01",
    relatedCourse: "reactors",
    excerptAr:
      "ملخص مبسّط لمكوّنات المفاعل النووي: الوقود، المهدّئ، قضبان التحكم، والمبرّد، وكيف يُضبط التفاعل المتسلسل عند الحالة الحرجة (k = 1).",
    excerptEn:
      "A student-friendly guide to reactor core components — fuel rods, moderator, control rods, and coolant — and maintaining criticality (k = 1).",
    formulaHighlight: "k_eff = 1.000 (Critical)  |  ²³⁵U + ¹₀n → Ba + Kr + 3¹₀n + 200 MeV",
    sectionsAr: [
      {
        h: "التفاعل الانشطاري المتسلسل",
        p: [
          "عندما تمتص نواة اليورانيوم-235 نيوتروناً حرارياً بطيئاً تنشطر إلى نواتين أصغر وتطلق طاقة حرارية هائلة (~200 MeV) مع نيوترونين أو ثلاثة تواصل التفاعل مع أنوية أخرى.",
        ],
      },
      {
        h: "المكوّنات الأربعة لقلب المفاعل",
        p: [
          "١. الوقود النووي: أقراص من ثاني أكسيد اليورانيوم المخصب (UO₂) داخل قضبان الزركونيوم.",
          "٢. المهدّئ (Moderator): ماء خفيف أو ماء ثقيل أو جرافيت يبطئ النيوترونات السريعة ليرفع احتمال انشطار U-235.",
          "٣. قضبان التحكم (Control Rods): مصنوعة من البورون أو الكادميوم أو الهافنيوم، تمتص النيوترونات لضبط معدل التفاعل أو إيقافه فورياً (SCRAM).",
          "٤. المبرّد (Coolant): ينقل الحرارة من القلب إلى مولد البخار لتشغيل التوربينات وتوليد الكهرباء.",
        ],
      },
      {
        h: "من الحرارة النووية إلى الكهرباء",
        p: [
          "تعمل محطة الطاقة النووية بدورة بخارية مغلقة وآمنة: الحرارة الناتجة عن الانشطار تحوّل الماء في الدائرة الثانوية إلى بخار يدير التوربينات المتصلة بالمولد الكهربائي دون أي انبعاثات كربونية.",
        ],
      },
    ],
    sectionsEn: [
      {
        h: "The fission chain reaction",
        p: [
          "When a Uranium-235 nucleus absorbs a thermal neutron, it splits into two fission fragments, releasing ~200 MeV of thermal energy and 2–3 fast neutrons that sustain the chain reaction.",
        ],
      },
      {
        h: "The four core components",
        p: [
          "1. Fuel: Enriched UO₂ pellets clad in zirconium alloy tubes. 2. Moderator: Water or graphite that slows fast neutrons to thermal energies. 3. Control rods: Boron or cadmium rods that absorb neutrons to regulate reactivity or trigger SCRAM. 4. Coolant: Transfers core heat to the steam generator.",
        ],
      },
      {
        h: "From heat to clean electricity",
        p: [
          "High-pressure steam drives a turbine-generator set — generating reliable baseload electricity with zero greenhouse gas emissions.",
        ],
      },
    ],
  },
];

export function ArticlesSection({
  language,
  onSelectCourse,
  onOpenPlacement,
}: ArticlesSectionProps) {
  const isEn = language === "en";
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const activeArticle = KNOWLEDGE_ARTICLES.find((a) => a.slug === selectedSlug) || null;
  const relatedCourse = activeArticle
    ? INITIAL_COURSES.find((c) => c.id === activeArticle.relatedCourse)
    : undefined;

  useEffect(() => {
    if (!activeArticle) return;
    const scriptId = "article-jsonld-schema";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: isEn ? activeArticle.titleEn : activeArticle.titleAr,
      description: isEn ? activeArticle.excerptEn : activeArticle.excerptAr,
      datePublished: activeArticle.date,
      inLanguage: language,
      author: {
        "@type": "Person",
        name: isEn ? "Eng. Mahmoud Ismail Shaltoot" : "المهندس محمود إسماعيل شلتوت",
      },
    });
    return () => {
      scriptEl?.remove();
    };
  }, [activeArticle, isEn, language]);

  const handleDownloadArticle = (article: BilingualArticle) => {
    const sections = isEn ? article.sectionsEn : article.sectionsAr;
    const text = [
      isEn ? article.titleEn : article.titleAr,
      `Date: ${article.date} | ${isEn ? article.readTimeEn : article.readTimeAr}`,
      `Formula: ${article.formulaHighlight}`,
      "------------------------------------------------------------",
      ...sections.flatMap((s) => [`\n## ${s.h}`, ...s.p]),
      "\n------------------------------------------------------------",
      isEn
        ? "Nuclear Knowledge Hub — Eng. Mahmoud Ismail Shaltoot (+966 59 475 6878)"
        : "مركز المعرفة النووية — المهندس محمود إسماعيل شلتوت (+966 59 475 6878)",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.slug}-${language}.txt`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShareArticle = async (article: BilingualArticle) => {
    const shareUrl = `${window.location.origin}/articles#${article.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedSlug(article.slug);
      window.setTimeout(() => setCopiedSlug(null), 2500);
    } catch {
      setCopiedSlug(article.slug);
      window.setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  return (
    <section
      id="articles"
      className="py-16 px-6 lg:px-10 max-w-[1240px] mx-auto border-t border-slate-800/80"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 text-xs font-mono text-cyan-300 mb-3">
            <BookOpen className="size-3.5" />
            <span>
              {isEn
                ? "FREE RESOURCES · ARTICLES & SUMMARIES"
                : "مصادر مجانية · مقالات وملخصات"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {isEn
              ? "Articles, Summaries & Worked Problems"
              : "مقالات وملخصات ومسائل محلولة"}
          </h2>
        </div>
        <p className="text-slate-400 max-w-md text-sm">
          {isEn
            ? "Free, concise explanations of core nuclear chemistry topics — written for university students in Saudi Arabia and the Gulf."
            : "شروحات مجانية مختصرة لأهم موضوعات الكيمياء النووية وهندسة المفاعلات، مكتوبة لطلاب الجامعات."}
        </p>
      </div>

      {/* Full Article Reader View (from knowledge-hub-plus ArticleBody) */}
      {activeArticle ? (
        <article className="rounded-3xl border border-cyan-500/35 bg-[#070f1d] p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <button
              type="button"
              onClick={() => setSelectedSlug(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-cyan-300 hover:border-cyan-400 transition cursor-pointer"
            >
              {isEn ? (
                <>
                  <ArrowLeft className="size-3.5" />
                  <span>All articles & summaries</span>
                </>
              ) : (
                <>
                  <ArrowRight className="size-3.5" />
                  <span>العودة إلى كل المقالات والملخصات</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleShareArticle(activeArticle)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 transition cursor-pointer"
              >
                {copiedSlug === activeArticle.slug ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>{isEn ? "Link Copied!" : "تم نسخ الرابط!"}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-3.5 text-cyan-400" />
                    <span>{isEn ? "Share" : "مشاركة"}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadArticle(activeArticle)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>{isEn ? "Download Summary" : "تنزيل الملخص"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full bg-cyan-950 px-3 py-1 font-semibold text-cyan-300 border border-cyan-500/30">
                {isEn ? activeArticle.categoryEn : activeArticle.categoryAr}
              </span>
              <time dateTime={activeArticle.date} className="font-mono">
                {activeArticle.date}
              </time>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {isEn ? activeArticle.readTimeEn : activeArticle.readTimeAr}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
              {isEn ? activeArticle.titleEn : activeArticle.titleAr}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              {isEn ? activeArticle.excerptEn : activeArticle.excerptAr}
            </p>

            <div
              className="rounded-xl border border-cyan-500/25 bg-slate-950 px-4 py-3 font-mono text-xs sm:text-sm text-cyan-300"
              dir="ltr"
            >
              {activeArticle.formulaHighlight}
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {(isEn ? activeArticle.sectionsEn : activeArticle.sectionsAr).map(
              (sec) => (
                <section
                  key={sec.h}
                  className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 sm:p-6 space-y-2.5"
                >
                  <h2 className="text-lg font-bold text-cyan-300">{sec.h}</h2>
                  {sec.p.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-sm sm:text-base text-slate-200 leading-loose"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ),
            )}
          </div>

          {/* "Go Deeper / تعمّق أكثر" Recommendation Card from knowledge-hub-plus */}
          {relatedCourse && (
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                <Sparkles className="size-3.5" />
                <span>{isEn ? "GO DEEPER IN THIS TRACK" : "تعمّق أكثر في هذا المسار"}</span>
              </div>
              <div className="text-xl font-bold text-white">
                {isEn ? relatedCourse.titleEn : relatedCourse.title}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isEn ? relatedCourse.descEn : relatedCourse.desc}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {onSelectCourse && (
                  <button
                    type="button"
                    onClick={() => onSelectCourse(relatedCourse.id)}
                    className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                  >
                    {isEn ? "Enroll in This Course" : "احجز وسجّل في هذه الدورة"}
                  </button>
                )}
                {onOpenPlacement && (
                  <button
                    type="button"
                    onClick={onOpenPlacement}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-400 transition cursor-pointer"
                  >
                    {isEn ? "Free Placement Test" : "اختبار تحديد المستوى المجاني"}
                  </button>
                )}
              </div>
            </div>
          )}
        </article>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {KNOWLEDGE_ARTICLES.map((art) => (
            <article
              key={art.id}
              onClick={() => setSelectedSlug(art.slug)}
              className="group rounded-3xl border border-slate-800 bg-[#070d19]/90 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-xl cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="rounded-full bg-cyan-950/90 border border-cyan-500/30 px-3 py-0.5 text-[11px] font-semibold text-cyan-300">
                    {isEn ? art.categoryEn : art.categoryAr}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="size-3" />
                    <span>{isEn ? art.readTimeEn : art.readTimeAr}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors leading-snug">
                  {isEn ? art.titleEn : art.titleAr}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {isEn ? art.excerptEn : art.excerptAr}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div
                  className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-[11px] text-cyan-400 text-center overflow-x-auto"
                  dir="ltr"
                >
                  {art.formulaHighlight}
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                  <span>
                    {isEn
                      ? "Read Full Summary & Examples"
                      : "اقرأ الملخص الكامل والأمثلة المحلولة"}
                  </span>
                  <ArrowUpRight className="size-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
