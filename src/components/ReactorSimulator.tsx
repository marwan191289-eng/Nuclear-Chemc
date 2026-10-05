import React, { useState, useEffect } from "react";
import reactorNeonImg from "../assets/reactor-core-neon.png";
import { IsotopeDecaySimulator } from "./IsotopeDecaySimulator";
import { Atom, AlertTriangle, ShieldCheck, Flame, Gauge, RotateCcw, Power, Sparkles, Activity } from "lucide-react";

interface ReactorSimulatorProps {
  onClose?: () => void;
  language: "ar" | "en";
}

export function ReactorSimulator({ onClose, language }: ReactorSimulatorProps) {
  const isEn = language === "en";

  const [simulatorTab, setSimulatorTab] = useState<"core" | "isotopes">("isotopes");

  // State: Control Rods insertion (0% = withdrawn/highest power, 100% = fully inserted/shutdown)
  const [controlRodInsertion, setControlRodInsertion] = useState<number>(35);
  const [coolantPumpRate, setCoolantPumpRate] = useState<number>(75); // %
  const [isScramActive, setIsScramActive] = useState<boolean>(false);

  // Derived physics values
  const powerMWth = isScramActive ? 0 : Math.round(((100 - controlRodInsertion) / 100) * 1250);
  const coreTempC = isScramActive
    ? 45
    : Math.round(280 + (powerMWth / 1250) * 65 - (coolantPumpRate / 100) * 30);
  const neutronFlux = isScramActive
    ? "1.2e+04 n/cm²·s"
    : `${((100 - controlRodInsertion) * 0.35 + 2.1).toFixed(2)}e+13 n/cm²·s`;
  const kEff = isScramActive
    ? "0.920 (Subcritical)"
    : controlRodInsertion === 35
    ? "1.000 (Critical Equilibrium)"
    : controlRodInsertion < 35
    ? `${(1.0 + (35 - controlRodInsertion) * 0.004).toFixed(3)} (Supercritical)`
    : `${(1.0 - (controlRodInsertion - 35) * 0.003).toFixed(3)} (Subcritical)`;

  const handleScram = () => {
    setIsScramActive(true);
    setControlRodInsertion(100);
    setTimeout(() => {
      // Allow manual restart after 4s
    }, 4000);
  };

  const handleReset = () => {
    setIsScramActive(false);
    setControlRodInsertion(35);
    setCoolantPumpRate(75);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#060b16] p-6 lg:p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] space-y-6">
      {/* Simulator Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulatorTab("isotopes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              simulatorTab === "isotopes"
                ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.45)]"
                : "text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
            }`}
          >
            <Sparkles className="size-4" />
            <span>{isEn ? "Radioactive Isotope Decay Simulator" : "محاكي اضمحلال النظائر المشعة وعمر النصف (جديد)"}</span>
          </button>

          <button
            onClick={() => setSimulatorTab("core")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              simulatorTab === "core"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.45)]"
                : "text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
            }`}
          >
            <Atom className="size-4" />
            <span>{isEn ? "Reactor Core & Kinetics Lab" : "مختبر محاكي قلب المفاعل والكينيتيكا"}</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
          >
            {isEn ? "Close" : "إغلاق"}
          </button>
        )}
      </div>

      {/* Mode 1: Isotope Decay Simulator */}
      {simulatorTab === "isotopes" && (
        <IsotopeDecaySimulator language={language} />
      )}

      {/* Mode 2: Core Simulator */}
      {simulatorTab === "core" && (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <Atom className="size-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{isEn ? "Virtual Nuclear Reactor Core Simulator" : "محاكي قلب المفاعل النووي التفاعلي"}</span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    U-235 CORE
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {isEn
                    ? "Interactive control rod kinetics and thermal hydraulics simulator"
                    : "تجربة افتراضية للتحكم في قضبان الكادميوم ومراقبة الحرارة والقدرة اللحظية"}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {isScramActive ? (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-950 border border-rose-500/50 px-3.5 py-1 text-xs font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                  <AlertTriangle className="size-3.5 animate-pulse" />
                  <span>{isEn ? "SCRAM SHUTDOWN ACTIVE" : "تم الإيقاف الطارئ (SCRAM)"}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-cyan-950 border border-cyan-500/50 px-3.5 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="size-2 rounded-full bg-cyan-400 pulse-dot" />
                  <span>{isEn ? "REACTOR OPERATIONAL" : "المفاعل في حالة تشغيل مستقر"}</span>
                </span>
              )}
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Core Display with glowing dynamic light */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl border border-cyan-500/40 bg-black overflow-hidden shadow-2xl">
            {/* Live Core Image */}
            <img
              src={reactorNeonImg}
              alt="Reactor Core"
              className="w-full aspect-[4/4.5] object-cover transition-all duration-700"
              style={{
                filter: isScramActive
                  ? "grayscale(80%) brightness(0.4)"
                  : `brightness(${0.8 + (powerMWth / 1250) * 0.5}) saturate(${1 + (powerMWth / 1250) * 0.4})`,
              }}
            />

            {/* Dynamic Plasma Laser Aura */}
            {!isScramActive && (
              <div
                className="absolute inset-0 bg-radial-vignette pointer-events-none mix-blend-screen transition-opacity duration-500"
                style={{ opacity: (powerMWth / 1250) * 0.85 }}
              />
            )}

            {/* Overlays */}
            <div className="absolute top-3 left-3 rounded-lg border border-white/10 bg-black/70 px-3 py-1 font-mono text-[11px] text-white backdrop-blur-md">
              TEMP: <span className="text-cyan-400 font-bold">{coreTempC}°C</span>
            </div>
            <div className="absolute top-3 right-3 rounded-lg border border-white/10 bg-black/70 px-3 py-1 font-mono text-[11px] text-white backdrop-blur-md">
              POWER: <span className="text-pink-400 font-bold">{powerMWth} MWth</span>
            </div>

            <div className="absolute bottom-3 inset-x-3 rounded-lg border border-white/10 bg-black/75 p-2.5 font-mono text-[11px] text-slate-300 backdrop-blur-md flex items-center justify-between">
              <span>k_eff: <strong className="text-cyan-300">{kEff}</strong></span>
              <span>Flux: <strong className="text-slate-200">{neutronFlux}</strong></span>
            </div>
          </div>
        </div>

        {/* Controls & Gauges */}
        <div className="lg:col-span-6 space-y-6">
          {/* Key Metrics Gauges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#091122] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="size-3.5 text-pink-400" />
                  <span>{isEn ? "Core Thermal Power" : "القدرة الحرارية للقلب"}</span>
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{powerMWth} <span className="text-xs font-normal text-slate-400">MWth</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(powerMWth / 1250) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#091122] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Gauge className="size-3.5 text-cyan-400" />
                  <span>{isEn ? "Coolant Temperature" : "حرارة المبرد الرئيسي"}</span>
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{coreTempC} <span className="text-xs font-normal text-slate-400">°C</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (coreTempC / 360) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Slider 1: Control Rods (قضبان التحكم) */}
          <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {isEn ? "Control Rods Insertion (Boron / Cadmium)" : "نسبة إدخال قضبان التحكم (البورون والكادميوم)"}
              </span>
              <span className="font-mono text-cyan-400 font-bold">{controlRodInsertion}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={controlRodInsertion}
              disabled={isScramActive}
              onChange={(e) => setControlRodInsertion(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{isEn ? "Max Power (Withdrawn)" : "سحب كامل (أقصى قدرة)"}</span>
              <span>{isEn ? "Critical (35%)" : "الاتزان الحرج (35%)"}</span>
              <span>{isEn ? "Full Insertion (Shutdown)" : "إدخال كامل (إيقاف)"}</span>
            </div>
          </div>

          {/* Slider 2: Coolant Pump Rate */}
          <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {isEn ? "Primary Coolant Circulation Pump" : "معدل تدفق مضخات التبريد الأولية"}
              </span>
              <span className="font-mono text-cyan-400 font-bold">{coolantPumpRate}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={coolantPumpRate}
              disabled={isScramActive}
              onChange={(e) => setCoolantPumpRate(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Emergency SCRAM & Reset Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleScram}
              disabled={isScramActive}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 px-5 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(225,29,72,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Power className="size-4" />
              <span>{isEn ? "SCRAM (Emergency Shutdown)" : "إيقاف طارئ فوري (SCRAM)"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>{isEn ? "Reset Core" : "إعادة ضبط"}</span>
            </button>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
