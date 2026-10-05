import React, { useState, useRef, useEffect } from "react";
import { Lesson } from "../types";
import { appPath } from "../lib/app-path";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Sparkles,
  Atom,
  CheckCircle2,
  Settings,
  Layers,
  Radio,
  Shield,
  Zap,
} from "lucide-react";

interface LessonVideoPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: () => void;
  language: "ar" | "en";
}

export function LessonVideoPlayer({
  lesson,
  isCompleted,
  onComplete,
  language,
}: LessonVideoPlayerProps) {
  const isEn = language === "en";
  const fallbackVideoUrl = appPath(`/videos/${lesson.id}.mp4`);
  const videoUrl = lesson.videoUrl ? appPath(lesson.videoUrl) : fallbackVideoUrl;

  // Player mode: "video" (HTML5 video stream) or "simulation" (60fps canvas simulation)
  const [playerMode, setPlayerMode] = useState<"video" | "simulation">("video");

  // Video state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);

  // Simulation Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const [simStep, setSimStep] = useState<number>(0);

  // Reset video when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [lesson.id, lesson.videoUrl, videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser restricts autoplay or media, try fallback or switch to interactive simulation
          if (videoRef.current && !videoRef.current.src.endsWith(`/videos/${lesson.id}.mp4`)) {
            videoRef.current.src = fallbackVideoUrl;
            videoRef.current.load();
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
              setPlayerMode("simulation");
            });
          } else {
            setPlayerMode("simulation");
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Auto complete when reached > 90%
      if (videoRef.current.duration && videoRef.current.currentTime / videoRef.current.duration > 0.92) {
        if (!isCompleted) onComplete();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("lesson-player-container");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 60FPS Interactive Physics Canvas Simulation
  useEffect(() => {
    if (playerMode !== "simulation" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const type = lesson.simulationType || "nucleus";

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background subtle grid
      ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (type === "nucleus") {
        // Proton-Neutron Binding Simulation
        ctx.save();
        const pulse = Math.sin(frame * 0.05) * 4;
        // Strong force aura
        const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 90 + pulse);
        grad.addColorStop(0, "rgba(0, 240, 255, 0.35)");
        grad.addColorStop(0.6, "rgba(236, 72, 153, 0.2)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 90 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Nucleons (Protons: Red/Pink, Neutrons: Cyan)
        const nucleons = 18;
        for (let i = 0; i < nucleons; i++) {
          const angle = (i / nucleons) * Math.PI * 2 + frame * 0.01;
          const radius = (i % 3 === 0 ? 25 : i % 3 === 1 ? 45 : 65) + Math.sin(frame * 0.08 + i) * 3;
          const nx = centerX + Math.cos(angle) * radius;
          const ny = centerY + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(nx, ny, 11, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? "#ec4899" : "#00f0ff";
          ctx.shadowColor = i % 2 === 0 ? "#ec4899" : "#00f0ff";
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(i % 2 === 0 ? "P+" : "N", nx, ny);
        }
        ctx.restore();

        // Formula overlay
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Strong Nuclear Force Field • E = Δm · c²", centerX, canvas.height - 25);
      } else if (type === "fission") {
        // Uranium-235 Fission Simulation
        const cycle = frame % 200;
        ctx.save();
        if (cycle < 60) {
          // Incoming neutron
          const nx = 80 + cycle * 4;
          ctx.beginPath();
          ctx.arc(nx, centerY, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#00f0ff";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "10px monospace";
          ctx.fillText("¹n (Thermal)", nx - 20, centerY - 15);

          // Target Uranium 235 Core
          ctx.beginPath();
          ctx.arc(centerX + 60, centerY, 48, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(236, 72, 153, 0.85)";
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px monospace";
          ctx.fillText("²³⁵U Core", centerX + 35, centerY + 4);
        } else {
          // Fission Split: Barium 141 & Krypton 92 + 3 neutrons + energy flash
          const t = cycle - 60;
          // Flash
          if (t < 15) {
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - t / 15})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          // Ba 141 Fragment moving up-right
          ctx.beginPath();
          ctx.arc(centerX + 60 + t * 2, centerY - t * 1.5, 34, 0, Math.PI * 2);
          ctx.fillStyle = "#00f0ff";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.fillStyle = "#000000";
          ctx.font = "bold 11px monospace";
          ctx.fillText("¹⁴¹Ba", centerX + 45 + t * 2, centerY - t * 1.5 + 4);

          // Kr 92 Fragment moving down-left
          ctx.beginPath();
          ctx.arc(centerX + 60 - t * 2.2, centerY + t * 1.3, 28, 0, Math.PI * 2);
          ctx.fillStyle = "#ec4899";
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px monospace";
          ctx.fillText("⁹²Kr", centerX + 48 - t * 2.2, centerY + t * 1.3 + 4);

          // 3 Fast Neutrons escaping
          for (let k = 0; k < 3; k++) {
            const angle = (k * 2.1) + t * 0.05;
            const dist = t * 4;
            const fx = centerX + 60 + Math.cos(angle) * dist;
            const fy = centerY + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(fx, fy, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#00f0ff";
            ctx.shadowBlur = 10;
            ctx.fill();
          }
        }
        ctx.restore();
        ctx.fillStyle = "#00f0ff";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("²³⁵U + ¹n → ¹⁴¹Ba + ⁹²Kr + 3¹n + ~200 MeV Energy", centerX, canvas.height - 25);
      } else if (type === "decay") {
        // Alpha, Beta, Gamma Decay simulation
        ctx.save();
        const pCycle = frame % 120;
        // Parent Nucleus
        ctx.beginPath();
        ctx.arc(centerX - 100, centerY, 50, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.75)";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("نواة أم مشعة", centerX - 100, centerY - 5);
        ctx.font = "10px monospace";
        ctx.fillText("Radioactive", centerX - 100, centerY + 12);

        // Alpha emission
        const ax = centerX - 50 + pCycle * 3.5;
        const ay = centerY - 60;
        ctx.beginPath();
        ctx.arc(ax, ay, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#ec4899";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.fillText("α (⁴He)", ax, ay + 3);

        // Beta emission
        const bx = centerX - 50 + ((pCycle + 40) % 120) * 4.5;
        const by = centerY;
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "bold 8px monospace";
        ctx.fillText("β-", bx, by + 3);

        // Gamma Wave
        const gx = centerX - 50 + ((pCycle + 80) % 120) * 5;
        const gy = centerY + 60;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 30; i++) {
          const wx = gx - i;
          const wy = gy + Math.sin(i * 0.5 + frame * 0.2) * 8;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 10px monospace";
        ctx.fillText("γ (Photon)", gx + 15, gy + 4);

        ctx.restore();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Radiation Modes: Alpha (He-4), Beta (Electron), Gamma (High-E Photon)", centerX, canvas.height - 25);
      } else {
        // Reactor Core & Cooling / Half-Life generic
        ctx.save();
        // Core Cylinders
        const bars = 8;
        for (let b = 0; b < bars; b++) {
          const bx = centerX - 160 + b * 45;
          const rodY = centerY - 50 + Math.sin(frame * 0.04 + b) * 15;
          ctx.fillStyle = b % 2 === 0 ? "#00f0ff" : "#ec4899";
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 10;
          ctx.fillRect(bx, rodY, 20, 100);
        }

        // Water bubble flow
        for (let w = 0; w < 16; w++) {
          const wx = centerX - 180 + (w * 25);
          const wy = canvas.height - 70 - ((frame * 2 + w * 20) % 180);
          ctx.beginPath();
          ctx.arc(wx, wy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
          ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = "#00f0ff";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Thermal Hydraulics & Control Rod Flux Simulation", centerX, canvas.height - 25);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [playerMode, lesson.simulationType]);

  const defaultVideoUrl = lesson.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

  return (
    <div id="lesson-player-container" className="space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080e1c] p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlayerMode("video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playerMode === "video"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Play className="size-3.5 fill-current" />
            <span>{isEn ? "HD Video Lecture" : "المحاضرة المرئية HD"}</span>
          </button>

          <button
            onClick={() => setPlayerMode("simulation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playerMode === "simulation"
                ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Atom className="size-3.5" />
            <span>{isEn ? "60FPS Interactive Physics Lab" : "المختبر التفاعلي والمحاكاة الذرية"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
            1080p 60FPS
          </span>
          <button
            onClick={onComplete}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              isCompleted
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>{isCompleted ? (isEn ? "Completed" : "تم إكمال الدرس") : (isEn ? "Mark as Done (+50 XP)" : "إكمال الدرس (+50 XP)")}</span>
          </button>
        </div>
      </div>

      {/* Main Screen Container */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-[#02050c] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] group">
        {playerMode === "video" ? (
          /* Real Working HTML5 Video Stream */
          <div className="relative aspect-video flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsPlaying(false);
                if (!isCompleted) onComplete();
              }}
              onError={() => {
                // If remote or current URL failed, try local fallback
                if (videoRef.current && !videoRef.current.src.endsWith(`/videos/${lesson.id}.mp4`)) {
                  videoRef.current.src = fallbackVideoUrl;
                  videoRef.current.load();
                } else {
                  setVideoError(true);
                }
              }}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Video Error Recovery Screen */}
            {videoError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 text-center space-y-3">
                <div className="size-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <RotateCcw className="size-6 animate-spin-slow" />
                </div>
                <div className="text-sm font-bold text-white">
                  {isEn ? "Switching to Local Video Stream..." : "جاري استعادة بث المحاضرة من السيرفر المحلي..."}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setVideoError(false);
                      if (videoRef.current) {
                        videoRef.current.src = fallbackVideoUrl;
                        videoRef.current.load();
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  >
                    {isEn ? "Play Local Video ▷" : "تشغيل الفيديو المباشر ▷"}
                  </button>
                  <button
                    onClick={() => setPlayerMode("simulation")}
                    className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-500 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                  >
                    {isEn ? "Open 60FPS Physics Lab" : "المختبر التفاعلي والمحاكاة"}
                  </button>
                </div>
              </div>
            )}

            {/* Big Center Play Overlay (when paused) */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all hover:bg-black/30"
              >
                <div className="size-20 rounded-full bg-cyan-500/25 border-2 border-cyan-400 flex items-center justify-center text-[#00f0ff] shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-110 transition-transform">
                  <Play className="size-9 fill-cyan-400 text-cyan-400 ml-1" />
                </div>
                <div className="mt-4 text-white font-extrabold text-base drop-shadow-md">
                  {lesson.title}
                </div>
                <p className="text-xs text-slate-300 max-w-sm text-center mt-1">
                  انقر للتشغيل والمشاهدة بدقة عالية مع الشرح الصوتي
                </p>
              </div>
            )}

            {/* Custom Cyber Overlay Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 flex flex-col gap-2 transition-opacity duration-300">
              {/* Scrub Timeline */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
                />
              </div>

              {/* Bottom controls row */}
              <div className="flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-3">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-1 text-white hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 fill-current" />}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={toggleMute} className="text-slate-300 hover:text-white cursor-pointer">
                      {isMuted ? <VolumeX className="size-4 text-rose-400" /> : <Volume2 className="size-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-20 h-1 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Timestamp */}
                  <span className="font-mono text-[11px] text-cyan-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed buttons */}
                  <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                    {[1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          playbackRate === s ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 text-slate-300 hover:text-cyan-400 cursor-pointer"
                    title="ملء الشاشة"
                  >
                    <Maximize className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive 60fps Canvas Simulator View */
          <div className="relative aspect-video flex flex-col items-center justify-center bg-[#02050c]">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/75 px-3 py-1 text-xs text-white border border-cyan-500/30 backdrop-blur-md">
              <span className="size-2 rounded-full bg-pink-500 animate-pulse" />
              <span>المحاكاة الذرية النشطة: 60 FPS</span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setPlayerMode("video")}
                className="rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer"
              >
                العودة لمحاضرة الفيديو ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
