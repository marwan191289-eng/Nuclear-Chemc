import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import {
  Atom,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  Layers,
  ChevronDown,
} from "lucide-react";

interface IsotopeDecaySimulatorProps {
  language: "ar" | "en";
}

interface Isotope {
  id: string;
  name: string;
  nameEn: string;
  symbol: string;
  massNumber: number;
  atomicNumber: number;
  halfLifeValue: number;
  halfLifeUnit: string;
  halfLifeUnitEn: string;
  decayType: "alpha" | "beta_minus" | "gamma" | "beta_plus";
  decayTypeLabel: string;
  equation: string;
  daughterElement: string;
  application: string;
  applicationEn: string;
  category: "energy" | "medical" | "dating" | "safety";
}

const ISOTOPES_DATA: Isotope[] = [
  {
    id: "c-14",
    name: "كربون-14 (C-14)",
    nameEn: "Carbon-14 (C-14)",
    symbol: "¹⁴₆C",
    massNumber: 14,
    atomicNumber: 6,
    halfLifeValue: 5730,
    halfLifeUnit: "سنة",
    halfLifeUnitEn: "years",
    decayType: "beta_minus",
    decayTypeLabel: "انحلال بيتا سالب (β⁻)",
    equation: "¹⁴₆C ⟶ ¹⁴₇N + e⁻ + ν̄ₑ",
    daughterElement: "نيتروجين-14 (مستقر)",
    application: "التأريخ الإشعاعي للآثار والحفريات وتحديد أعمار العينات العضوية القديمة بدقة فائقة.",
    applicationEn: "Radiocarbon dating for archaeology and biological artifacts.",
    category: "dating",
  },
  {
    id: "i-131",
    name: "يود-131 (I-131)",
    nameEn: "Iodine-131 (I-131)",
    symbol: "¹³¹₅₃I",
    massNumber: 131,
    atomicNumber: 53,
    halfLifeValue: 8.02,
    halfLifeUnit: "أيام",
    halfLifeUnitEn: "days",
    decayType: "beta_minus",
    decayTypeLabel: "انحلال بيتا وأشعة غاما (β⁻ + γ)",
    equation: "¹³¹₅₃I ⟶ ¹³¹₅₄Xe + e⁻ + ν̄ₑ + γ",
    daughterElement: "زينون-131 (مستقر)",
    application: "الطب النووي: علاج وتدمير خلايا أورام الغدة الدرقية النشطة وتصويرها تشخيصياً.",
    applicationEn: "Nuclear medicine: Targeted therapy for thyroid cancer and imaging.",
    category: "medical",
  },
  {
    id: "tc-99m",
    name: "تكنيشيوم-99m (Tc-99m)",
    nameEn: "Technetium-99m (Tc-99m)",
    symbol: "⁹⁹ᵐ₄₃Tc",
    massNumber: 99,
    atomicNumber: 43,
    halfLifeValue: 6.01,
    halfLifeUnit: "ساعات",
    halfLifeUnitEn: "hours",
    decayType: "gamma",
    decayTypeLabel: "انبعاث غاما متماكب (Isomeric γ)",
    equation: "⁹⁹ᵐ₄₃Tc ⟶ ⁹⁹₄₃Tc + γ (140.5 keV)",
    daughterElement: "تكنيشيوم-99 الأرضي",
    application: "النظير الأكثر استخداماً عالمياً في التصوير الطبي التشخيصي للقلب والعظام والمخ.",
    applicationEn: "Gold standard diagnostic imaging agent in nuclear cardiology and oncology.",
    category: "medical",
  },
  {
    id: "u-235",
    name: "يورانيوم-235 (U-235)",
    nameEn: "Uranium-235 (U-235)",
    symbol: "²³⁵₉₂U",
    massNumber: 235,
    atomicNumber: 92,
    halfLifeValue: 703.8,
    halfLifeUnit: "مليون سنة",
    halfLifeUnitEn: "million years",
    decayType: "alpha",
    decayTypeLabel: "انحلال ألفا (α)",
    equation: "²³⁵₉₂U ⟶ ²³¹₉₀Th + ⁴₂He (α)",
    daughterElement: "ثوريوم-231 (مشع)",
    application: "وقود المفاعلات النووية الانشطارية وتوليد الطاقة الكهربائية النووية التجارية.",
    applicationEn: "Fissile fuel for nuclear reactors and commercial atomic energy generation.",
    category: "energy",
  },
  {
    id: "co-60",
    name: "كوبالت-60 (Co-60)",
    nameEn: "Cobalt-60 (Co-60)",
    symbol: "⁶⁰₂₇Co",
    massNumber: 60,
    atomicNumber: 27,
    halfLifeValue: 5.27,
    halfLifeUnit: "سنة",
    halfLifeUnitEn: "years",
    decayType: "beta_minus",
    decayTypeLabel: "انحلال بيتا وأشعة غاما قوية (β⁻ + 2γ)",
    equation: "⁶⁰₂₇Co ⟶ ⁶⁰₂₈Ni + e⁻ + ν̄ₑ + 2γ",
    daughterElement: "نيكل-60 (مستقر)",
    application: "التعقيم الإشعاعي للأدوات الجراحية، حفظ الأغذية، والعلاج الإشعاعي للأورام.",
    applicationEn: "Industrial radiation sterilization, food preservation, and cancer radiotherapy.",
    category: "safety",
  },
  {
    id: "cs-137",
    name: "سيزيوم-137 (Cs-137)",
    nameEn: "Cesium-137 (Cs-137)",
    symbol: "¹³⁷₅₅Cs",
    massNumber: 137,
    atomicNumber: 55,
    halfLifeValue: 30.17,
    halfLifeUnit: "سنة",
    halfLifeUnitEn: "years",
    decayType: "beta_minus",
    decayTypeLabel: "انحلال بيتا وغاما (β⁻ + γ)",
    equation: "¹³⁷₅₅Cs ⟶ ¹³⁷₅₆Ba + e⁻ + ν̄ₑ + γ",
    daughterElement: "باريوم-137 (مستقر)",
    application: "معايرة أجهزة الرصد الإشعاعي، دراسات نواتج الانشطار، والرقابة البيئية النووية.",
    applicationEn: "Calibration of radiation detectors and environmental nuclear monitoring.",
    category: "energy",
  },
  {
    id: "rn-222",
    name: "رادون-222 (Rn-222)",
    nameEn: "Radon-222 (Rn-222)",
    symbol: "²²²₈₆Rn",
    massNumber: 222,
    atomicNumber: 86,
    halfLifeValue: 3.82,
    halfLifeUnit: "أيام",
    halfLifeUnitEn: "days",
    decayType: "alpha",
    decayTypeLabel: "انحلال ألفا غازي (α)",
    equation: "²²²₈₆Rn ⟶ ²¹⁸₈₄Po + ⁴₂He (α)",
    daughterElement: "بولونيوم-218 (مشع)",
    application: "غاز خامل مشع طبيعي يُدرس في وقاية المباني ومراقبة التراكيز الإشعاعية بالهواء.",
    applicationEn: "Natural radioactive noble gas studied in indoor radiological protection.",
    category: "safety",
  },
];

export function IsotopeDecaySimulator({ language }: IsotopeDecaySimulatorProps) {
  const isEn = language === "en";

  const [selectedIsotopeId, setSelectedIsotopeId] = useState<string>("c-14");
  const [initialMass, setInitialMass] = useState<number>(100); // grams
  const [elapsedHalfLives, setElapsedHalfLives] = useState<number>(1.0); // e.g. 1.0 half life
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const isotope = useMemo(
    () => ISOTOPES_DATA.find((item) => item.id === selectedIsotopeId) || ISOTOPES_DATA[0],
    [selectedIsotopeId]
  );

  // Play animation timer
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setElapsedHalfLives((prev) => {
          if (prev >= 5.0) {
            setIsPlaying(false);
            return 5.0;
          }
          return Math.round((prev + 0.05) * 100) / 100;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Physics calculations
  const remainingFraction = Math.pow(0.5, elapsedHalfLives);
  const remainingMass = Math.round(initialMass * remainingFraction * 100) / 100;
  const decayedMass = Math.round((initialMass - remainingMass) * 100) / 100;
  const actualTimePassed = elapsedHalfLives * isotope.halfLifeValue;
  const lambda = Math.round((0.69315 / isotope.halfLifeValue) * 100000) / 100000;

  // Generate continuous decay curve data points (from 0 to 5 half-lives)
  const chartData = useMemo(() => {
    const points = [];
    const step = 0.2;
    for (let h = 0; h <= 5.05; h += step) {
      const frac = Math.pow(0.5, h);
      const parent = Math.round(initialMass * frac * 10) / 10;
      const daughter = Math.round((initialMass - parent) * 10) / 10;
      points.push({
        halfLives: Math.round(h * 10) / 10,
        timeLabel: `${Math.round(h * 10) / 10} T½`,
        parentMass: parent,
        daughterMass: daughter,
      });
    }
    return points;
  }, [initialMass]);

  // 100 discrete atoms simulation representation
  const undecayedAtomsCount = Math.round(remainingFraction * 100);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedHalfLives(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#071322] via-[#0b1a2e] to-[#070e1c] p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
            <Atom className="size-4 animate-spin-slow" />
            <span>{isEn ? "INTERACTIVE ISOTOPE DECAY SIMULATOR" : "محاكي اضمحلال النظائر المشعة وقوانين عمر النصف"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <span>{isEn ? "Radioactive Decay Law Kinetics" : "حركية الانحلال الإشعاعي ومنحنى الاضمحلال"}</span>
            <span className="rounded-lg bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-xs text-pink-300 font-mono">
              N(t) = N₀ · (½)^(t/T½)
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {isEn
              ? "Select any radioactive isotope, adjust initial mass and elapsed half-lives, and observe exponential decay, daughter accumulation, and atom chamber states in real time."
              : "اختر النظير المشع المستهدف، وحدد الكتلة الابتدائية والزمن المنقضي بمضاعفات عمر النصف، وشاهد المنحنى الرياضي وتفكك الأنوية لحظة بلحظة."}
          </p>
        </div>

        {/* Quick Isotope Dropdown Selector */}
        <div className="flex items-center gap-2 bg-[#060a14] border border-cyan-500/40 rounded-xl p-2 shadow-lg">
          <span className="text-xs text-slate-400 font-medium px-2">
            {isEn ? "Choose Isotope:" : "اختر النظير:"}
          </span>
          <select
            value={selectedIsotopeId}
            onChange={(e) => {
              setSelectedIsotopeId(e.target.value);
              setIsPlaying(false);
            }}
            className="bg-[#0a1424] text-cyan-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {ISOTOPES_DATA.map((iso) => (
              <option key={iso.id} value={iso.id}>
                {isEn ? iso.nameEn : iso.name} — T½: {iso.halfLifeValue} {isEn ? iso.halfLifeUnitEn : iso.halfLifeUnit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Controls & Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Sliders & Equation Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Isotope Quick Identity Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#070d1a] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00f0ff] font-mono text-xl font-black shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  {isotope.symbol}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{isEn ? isotope.nameEn : isotope.name}</h3>
                  <div className="text-xs text-pink-400 font-medium">{isotope.decayTypeLabel}</div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-400">عمر النصف (T½)</div>
                <div className="text-base font-black text-white">
                  {isotope.halfLifeValue} <span className="text-xs text-cyan-400">{isEn ? isotope.halfLifeUnitEn : isotope.halfLifeUnit}</span>
                </div>
              </div>
            </div>

            {/* Nuclear Decay Equation */}
            <div className="rounded-xl border border-slate-800/80 bg-[#050811] p-3 text-center font-mono text-xs text-cyan-300">
              <span className="text-slate-400 text-[10px] block mb-0.5">معادلة الانحلال النووي:</span>
              <span className="font-bold text-sm tracking-wider">{isotope.equation}</span>
            </div>

            {/* Real World Application */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-slate-300 space-y-1">
              <span className="text-cyan-400 font-bold block flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                {isEn ? "Practical Application:" : "التطبيق العلمي والصناعي:"}
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">{isEn ? isotope.applicationEn : isotope.application}</p>
            </div>
          </div>

          {/* Interactive Sliders: Initial Mass & Time */}
          <div className="rounded-2xl border border-slate-800 bg-[#070d1a] p-5 shadow-lg space-y-5">
            {/* Slider 1: Initial Mass N0 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {isEn ? "Initial Sample Mass (N₀):" : "الكتلة الابتدائية للعينة (N₀):"}
                </span>
                <span className="font-mono text-cyan-400 font-bold text-sm">{initialMass} غرام</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={initialMass}
                onChange={(e) => setInitialMass(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 g</span>
                <span>250 g</span>
                <span>500 g</span>
              </div>
            </div>

            {/* Slider 2: Elapsed Half-Lives */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {isEn ? "Elapsed Time (Half-Lives passed, t / T½):" : "الزمن المنقضي (مضاعفات عمر النصف n = t/T½):"}
                </span>
                <span className="font-mono text-pink-400 font-bold text-sm">{elapsedHalfLives} T½</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.05}
                value={elapsedHalfLives}
                onChange={(e) => {
                  setElapsedHalfLives(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 (البداية 100%)</span>
                <span>1 T½ (50%)</span>
                <span>2 T½ (25%)</span>
                <span>3 T½ (12.5%)</span>
                <span>5 T½ (3.1%)</span>
              </div>
            </div>

            {/* Live Play / Pause Controls */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isPlaying
                    ? "bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110"
                }`}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                <span>{isPlaying ? (isEn ? "Pause Simulation" : "إيقاف مؤقت") : (isEn ? "Animate Live Decay" : "تشغيل محاكاة الاضمحلال")}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                title="إعادة ضبط الزمن إلى الصفر"
              >
                <RotateCcw className="size-4" />
                <span>إعادة ضبط</span>
              </button>
            </div>
          </div>

          {/* Atomic Chamber Microscopic Visualization */}
          <div className="rounded-2xl border border-slate-800 bg-[#070c18] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="size-4 text-cyan-400" />
                {isEn ? "Microscopic Nuclei Grid (100 Atoms Sample):" : "غرفة الذرات الافتراضية (عينة من 100 نواة):"}
              </span>
              <span className="font-mono text-cyan-300 font-bold">{undecayedAtomsCount}% غير منحل</span>
            </div>

            {/* 10x10 Matrix of Atoms */}
            <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl bg-black/60 border border-slate-800">
              {Array.from({ length: 100 }).map((_, i) => {
                const isUndecayed = i < undecayedAtomsCount;
                return (
                  <div
                    key={i}
                    className={`size-3 rounded-full transition-all duration-300 ${
                      isUndecayed
                        ? "bg-[#00f0ff] shadow-[0_0_6px_#00f0ff] scale-95"
                        : "bg-slate-700 opacity-30 scale-75"
                    }`}
                    title={isUndecayed ? `نواة ${isotope.name} فعالة` : `نواة ${isotope.daughterElement} ناتجة`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
                <span>أنوية النظير المشع المتبقية ({undecayedAtomsCount}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slate-600" />
                <span>الأنوية الوليدة المستقرة ({100 - undecayedAtomsCount}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Decay Curves & Real-Time Calculated Physics Values */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Calculated Values Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-[#091122] p-3 text-center">
              <div className="text-[10px] text-slate-400">الكتلة المتبقية N(t)</div>
              <div className="text-xl font-black text-[#00f0ff] font-mono">{remainingMass}g</div>
              <div className="text-[10px] text-cyan-400 font-mono">{(remainingFraction * 100).toFixed(1)}%</div>
            </div>

            <div className="rounded-xl border border-pink-500/30 bg-[#120a1c] p-3 text-center">
              <div className="text-[10px] text-slate-400">النواتج الوليدة المستقرة</div>
              <div className="text-xl font-black text-[#ec4899] font-mono">{decayedMass}g</div>
              <div className="text-[10px] text-pink-400 font-mono">{((1 - remainingFraction) * 100).toFixed(1)}%</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#091122] p-3 text-center">
              <div className="text-[10px] text-slate-400">الزمن الفعلي المنقضي</div>
              <div className="text-base font-bold text-white font-mono">{actualTimePassed.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{isEn ? isotope.halfLifeUnitEn : isotope.halfLifeUnit}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#091122] p-3 text-center">
              <div className="text-[10px] text-slate-400">ثابت الاضمحلال λ</div>
              <div className="text-sm font-bold text-amber-300 font-mono">{lambda}</div>
              <div className="text-[10px] text-slate-400">0.693 / T½</div>
            </div>
          </div>

          {/* Interactive Recharts Area Decay Curve */}
          <div className="rounded-2xl border border-slate-800 bg-[#060a16] p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>منحنى الاضمحلال الأسي التفاعلي</span>
                  <span className="text-xs text-cyan-400 font-mono">({isotope.name})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  تناقص النظير المشع الأصلي (بالأزرق) وتراكم النواة الوليدة المستقرة (بالوردي)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                  <span>النظير المشع المتبقي</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded bg-[#ec4899] shadow-[0_0_8px_#ec4899]" />
                  <span>النواتج المتراكمة</span>
                </span>
              </div>
            </div>

            <div className="h-[360px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 25, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="decayParent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="decayDaughter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="timeLabel"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, initialMass]}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tickFormatter={(v) => `${v}g`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-cyan-500/40 bg-[#070e1c]/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
                            <div className="font-bold text-cyan-300 font-mono">الزمن: {d.halfLives} T½ ({d.halfLives * isotope.halfLifeValue} {isotope.halfLifeUnit})</div>
                            <div className="text-white">المتبقي: <strong className="text-[#00f0ff]">{d.parentMass} غرام</strong></div>
                            <div className="text-slate-300">المتحول: <strong className="text-pink-400">{d.daughterMass} غرام</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Vertical reference line at current slider position */}
                  <ReferenceLine
                    x={`${Math.round(elapsedHalfLives * 10) / 10} T½`}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    label={{
                      value: `الآن: ${remainingMass}g`,
                      fill: "#f59e0b",
                      fontSize: 10,
                      position: "top",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="daughterMass"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#decayDaughter)"
                    name="النواتج الوليدة"
                  />
                  <Area
                    type="monotone"
                    dataKey="parentMass"
                    stroke="#00f0ff"
                    strokeWidth={3}
                    fill="url(#decayParent)"
                    name="النظير المشع المتبقي"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Halving Milestones Footnote */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 text-center">
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                1 T½ ⟶ <span className="text-[#00f0ff] font-bold">50%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                2 T½ ⟶ <span className="text-[#00f0ff] font-bold">25%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                3 T½ ⟶ <span className="text-[#00f0ff] font-bold">12.5%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                4 T½ ⟶ <span className="text-[#00f0ff] font-bold">6.25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
