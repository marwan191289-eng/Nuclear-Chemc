import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Course, UserProfile } from "../types";
import {
  TrendingUp,
  BarChart3,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
} from "lucide-react";

interface StudentProgressChartsProps {
  currentUser: UserProfile;
  courses: Course[];
  completedLessonIds: string[];
  language: "ar" | "en";
}

export function StudentProgressCharts({
  currentUser,
  courses,
  completedLessonIds,
  language,
}: StudentProgressChartsProps) {
  const isEn = language === "en";
  const [activeChartTab, setActiveChartTab] = useState<"courses" | "timeline" | "skills">("courses");

  // Courses baseline vs current mastery
  const courseComparisonData = [
    {
      name: isEn ? "Nuclear Fundamentals" : "أساسيات الكيمياء النووية",
      shortName: isEn ? "Fundamentals" : "أساسيات النواة",
      baseline: 35, // عند بداية الالتحاق
      current: 94,  // المستوى الحالي
      completed: completedLessonIds.filter((id) => id.startsWith("fund")).length,
      total: 3,
    },
    {
      name: isEn ? "Reactions & Reactors" : "التفاعلات والمفاعلات",
      shortName: isEn ? "Reactors" : "المفاعلات النووية",
      baseline: 20,
      current: 88,
      completed: completedLessonIds.filter((id) => id.startsWith("react")).length,
      total: 2,
    },
    {
      name: isEn ? "Radiation Safety" : "السلامة والوقاية الإشعاعية",
      shortName: isEn ? "Radiation Safety" : "السلامة ALARA",
      baseline: 40,
      current: 96,
      completed: completedLessonIds.filter((id) => id.startsWith("safe")).length,
      total: 2,
    },
    {
      name: isEn ? "Decay Kinetics & Half-Life" : "حسابات الانحلال وعمر النصف",
      shortName: isEn ? "Half-Life" : "عمر النصف",
      baseline: 28,
      current: 91,
      completed: 1,
      total: 2,
    },
  ];

  // Timeline progress since enrollment (Week 1 to Week 6)
  const timelineData = [
    { week: isEn ? "Week 1 (Enrollment)" : "الأسبوع 1 (البداية)", score: 32, baseline: 32, note: "اختبار تحديد المستوى المبدئي" },
    { week: isEn ? "Week 2" : "الأسبوع 2", score: 49, baseline: 32, note: "بنية النواة والقوى الشديدة" },
    { week: isEn ? "Week 3" : "الأسبوع 3", score: 66, baseline: 32, note: "نقص الكتلة وطاقة الترابط" },
    { week: isEn ? "Week 4" : "الأسبوع 4", score: 81, baseline: 32, note: "الاتزان الحرج وتوازن النيوترونات" },
    { week: isEn ? "Week 5" : "الأسبوع 5", score: 89, baseline: 32, note: "معايير الجرعات المكافئة والدروع" },
    { week: isEn ? "Week 6 (Current)" : "الأسبوع 6 (الآن)", score: 95, baseline: 32, note: "المستوى التراكمي المتقدم" },
  ];

  // Competency Radar Data
  const radarData = [
    { subject: isEn ? "Nuclear Structure" : "تركيب النواة", baseline: 38, current: 95 },
    { subject: isEn ? "Decay Equations" : "معادلات الانحلال", baseline: 25, current: 92 },
    { subject: isEn ? "Reactor Kinetics" : "حركية المفاعلات", baseline: 18, current: 88 },
    { subject: isEn ? "Safety & ALARA" : "السلامة والوقاية", baseline: 42, current: 98 },
    { subject: isEn ? "Lab Simulation" : "المحاكاة المعملية", baseline: 20, current: 90 },
    { subject: isEn ? "Isotope Calculations" : "حسابات النظائر", baseline: 30, current: 94 },
  ];

  // Custom tooltips
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-cyan-500/40 bg-[#070e1c]/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-white border-b border-slate-700/60 pb-1">{data.name}</div>
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-slate-500" />
              {isEn ? "At Enrollment:" : "عند بداية الالتحاق:"}
            </span>
            <span className="font-mono font-bold text-slate-300">{data.baseline}%</span>
          </div>
          <div className="flex justify-between items-center text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              {isEn ? "Current Mastery:" : "المستوى الحالي المتقن:"}
            </span>
            <span className="font-mono font-bold text-[#00f0ff]">{data.current}%</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-slate-800">
            <span>{isEn ? "Academic Gain:" : "مقدار التطور المحقق:"}</span>
            <span className="font-mono font-bold">+{data.current - data.baseline}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-cyan-500/40 bg-[#070e1c]/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1 min-w-[200px]">
          <div className="font-bold text-cyan-300">{label}</div>
          <div className="text-[11px] text-slate-400">{data.note}</div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-white font-mono">
            <span>{isEn ? "Assessment Score:" : "النتيجة التراكمية:"}</span>
            <span className="text-[#00f0ff] font-bold text-sm">{data.score}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 font-mono text-[10px]">
            <span>{isEn ? "Baseline (Entry):" : "مستوى البداية:"}</span>
            <span>{data.baseline}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Growth Highlights Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Baseline vs Current Overall */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#060e1d] to-[#040812] p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">{isEn ? "Overall Academic Jump" : "القفزة الأكاديمية الشاملة"}</span>
            <span className="inline-flex items-center text-emerald-400 font-mono font-bold text-xs bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <ArrowUpRight className="size-3.5" /> +63%
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#00f0ff] font-mono">95%</span>
            <span className="text-xs text-slate-400 font-mono">
              {isEn ? "vs 32% baseline" : "مقابل 32% عند الالتحاق"}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-500 via-cyan-400 to-[#00f0ff] h-full rounded-full transition-all duration-700" style={{ width: "95%" }} />
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="rounded-2xl border border-slate-800 bg-[#070d1a] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">{isEn ? "Completed Lessons" : "الدروس المنجزة"}</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{completedLessonIds.length}</span>
            <span className="text-xs text-slate-400 font-mono">/ 7 دروس متاحة</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {isEn ? "All quizzes passed on first attempt" : "تم اجتياز جميع اختبارات الفهم بنجاح"}
          </p>
        </div>

        {/* Average Quiz Score */}
        <div className="rounded-2xl border border-slate-800 bg-[#070d1a] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">{isEn ? "Cumulative Exam Average" : "معدل الاختبارات التراكمي"}</span>
            <Sparkles className="size-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300 font-mono">{currentUser.avgQuizScore || 94}%</span>
            <span className="text-xs text-slate-400">امتياز مرتفع</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {isEn ? "Top 5% among GCC nuclear students" : "ضمن أفضل 5% من طلاب كليات العلوم والهندسة"}
          </p>
        </div>

        {/* Lab & Reactor Simulation Hours */}
        <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-[#120818] to-[#060812] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">{isEn ? "Virtual Lab & Reactor Training" : "ساعات التدريب على المحاكي"}</span>
            <Zap className="size-4 text-pink-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#ec4899] font-mono">18.5</span>
            <span className="text-xs text-slate-300">ساعة تدريبية</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {isEn ? "Includes SCRAM and critical equilibrium labs" : "شملت تدريبات الاتزان الحرج والإيقاف الطارئ"}
          </p>
        </div>
      </div>

      {/* Main Charts Card with Interactive Switcher */}
      <div className="rounded-3xl border border-slate-800 bg-[#060a16] p-6 lg:p-8 shadow-2xl space-y-6">
        {/* Card Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
              <BarChart3 className="size-4" />
              <span>{isEn ? "ANALYTICS & BASELINE COMPARISON" : "لوحة التحليلات البيانية ومقارنة المستوى"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isEn
                ? "Academic Trajectory: Current vs Enrollment Baseline"
                : "تطور مستوى الطالب: مقارنة بين بداية الالتحاق والمستوى الحالي"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn
                ? "Visualized with Recharts — tracking competency gains across nuclear disciplines."
                : "رسوم بيانية تفاعلية دقيقة توثق القفزة المعرفية في كل تخصص منذ اليوم الأول."}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#090f1f] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChartTab("courses")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "courses"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isEn ? "Courses Comparison (Bar)" : "مقارنة الدورات (أعمدة)"}
            </button>
            <button
              onClick={() => setActiveChartTab("timeline")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "timeline"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isEn ? "Growth Curve (Timeline)" : "منحنى النمو الزمني"}
            </button>
            <button
              onClick={() => setActiveChartTab("skills")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "skills"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isEn ? "Competency Radar" : "رادار المهارات الشامل"}
            </button>
          </div>
        </div>

        {/* Chart View 1: Double Bar Chart (Baseline vs Current across courses) */}
        {activeChartTab === "courses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>{isEn ? "Proficiency Score (%): Baseline at Entry vs Current Mastery" : "نسبة الإتقان الأكاديمي (%): المستوى عند بداية الالتحاق مقارنة بالمستوى الحالي"}</span>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded bg-slate-600 inline-block" />
                  {isEn ? "Baseline at Entry" : "عند بداية الالتحاق"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded bg-[#00f0ff] inline-block shadow-[0_0_8px_#00f0ff]" />
                  {isEn ? "Current Level" : "المستوى الأكاديمي الحالي"}
                </span>
              </div>
            </div>

            <div className="h-[340px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="baseline"
                    name={isEn ? "Baseline at Entry" : "عند بداية الالتحاق"}
                    fill="#475569"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="current"
                    name={isEn ? "Current Level" : "المستوى الأكاديمي الحالي"}
                    fill="#00f0ff"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Insight Footnote */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 flex items-start gap-3 text-xs text-cyan-200">
              <Sparkles className="size-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <strong>{isEn ? "Academic Diagnosis:" : "التقرير التحليلي لتقدم الطالب:"}</strong>{" "}
                {isEn
                  ? "Significant leap observed in Nuclear Fundamentals (+59%) and Safety (+56%), reflecting full comprehension of nuclear binding energy and ALARA principles."
                  : "قفزة نوعية استثنائية في مقرري «أساسيات الكيمياء النووية» بمقدار (+59%) و«السلامة الإشعاعية» بمقدار (+56%)، مما يبرهن على استيعاب عميق لحسابات طاقة الترابط ومعايير الوقاية."}
              </div>
            </div>
          </div>
        )}

        {/* Chart View 2: Timeline Growth Curve (AreaChart) */}
        {activeChartTab === "timeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>{isEn ? "Weekly Cumulative Score Progression" : "منحنى تصاعد الدرجة التراكمية أسبوعياً منذ التسجيل"}</span>
              <span className="text-cyan-400 font-mono text-xs">من الأسبوع الأول حتى الأسبوع السادس</span>
            </div>

            <div className="h-[340px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#ec4899"
                    strokeDasharray="4 4"
                    fill="url(#baselineGrad)"
                    strokeWidth={1.5}
                    name={isEn ? "Entry Baseline" : "خط الأساس عند الالتحاق (32%)"}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00f0ff"
                    fill="url(#progressGrad)"
                    strokeWidth={3}
                    dot={{ fill: "#00f0ff", r: 4, stroke: "#ffffff", strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: "#00f0ff", stroke: "#ffffff", strokeWidth: 2 }}
                    name={isEn ? "Cumulative Performance" : "المستوى التراكمي الفعلي"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#ec4899]" />
                <span>خط البداية الثابت: 32% (اختبار التقييم المبدئي)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00f0ff]" />
                <span className="text-white font-bold">المستوى المحقق الحالي: 95% (تفوق امتياز)</span>
              </span>
            </div>
          </div>
        )}

        {/* Chart View 3: Radar Chart (Competency Dimensions) */}
        {activeChartTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>{isEn ? "Multi-Dimensional Nuclear Competencies" : "رادار المهارات والكفاءات في الهندسة والكيمياء النووية"}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-slate-500" />
                  {isEn ? "Baseline" : "عند البداية"}
                </span>
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  {isEn ? "Current" : "المستوى الحالي"}
                </span>
              </div>
            </div>

            <div className="h-[360px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                  <Radar
                    name={isEn ? "Baseline" : "عند بداية الالتحاق"}
                    dataKey="baseline"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name={isEn ? "Current Mastery" : "المستوى الحالي"}
                    dataKey="current"
                    stroke="#00f0ff"
                    fill="#00f0ff"
                    fillOpacity={0.45}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
