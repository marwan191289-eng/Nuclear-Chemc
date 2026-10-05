import React, { useEffect, useRef } from "react";

interface AtomNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  orbitRadius: number;
  angle: number;
  angularSpeed: number;
  tilt: number;
  color: string;
  symbol: string;
}

interface RadiationParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: "cyan" | "magenta";
}

interface CssDecayParticle {
  id: string;
  top: string;
  left: string;
  size: string;
  type: "alpha" | "beta" | "gamma";
  duration: string;
  delay: string;
  driftX: string;
  driftY: string;
  opacity: number;
  hasRing?: boolean;
}

const SYMBOLS = ["²³⁵U", "²³⁸U", "¹⁴C", "⁶⁰Co", "⁴₂He", "E=Δmc²", "T₁/₂", "k=1.0", "λ", "γ"];

const CSS_DECAY_PARTICLES: CssDecayParticle[] = [
  { id: "dp-1", top: "14%", left: "12%", size: "6px", type: "alpha", duration: "15s", delay: "0s", driftX: "42px", driftY: "-78px", opacity: 0.24, hasRing: true },
  { id: "dp-2", top: "24%", left: "84%", size: "4px", type: "beta", duration: "12s", delay: "-3s", driftX: "-36px", driftY: "-64px", opacity: 0.22 },
  { id: "dp-3", top: "42%", left: "18%", size: "5px", type: "gamma", duration: "17s", delay: "-6s", driftX: "30px", driftY: "-88px", opacity: 0.2 },
  { id: "dp-4", top: "58%", left: "78%", size: "6px", type: "alpha", duration: "16s", delay: "-2s", driftX: "-44px", driftY: "-72px", opacity: 0.24, hasRing: true },
  { id: "dp-5", top: "72%", left: "26%", size: "4px", type: "beta", duration: "13s", delay: "-8s", driftX: "34px", driftY: "-60px", opacity: 0.2 },
  { id: "dp-6", top: "82%", left: "66%", size: "5px", type: "gamma", duration: "18s", delay: "-5s", driftX: "-28px", driftY: "-84px", opacity: 0.22 },
  { id: "dp-7", top: "32%", left: "52%", size: "4px", type: "alpha", duration: "14s", delay: "-9s", driftX: "26px", driftY: "-70px", opacity: 0.18 },
  { id: "dp-8", top: "66%", left: "44%", size: "5px", type: "beta", duration: "16s", delay: "-4s", driftX: "-32px", driftY: "-68px", opacity: 0.18, hasRing: true },
  { id: "dp-9", top: "18%", left: "62%", size: "4px", type: "gamma", duration: "15s", delay: "-11s", driftX: "38px", driftY: "-75px", opacity: 0.2 },
  { id: "dp-10", top: "88%", left: "15%", size: "5px", type: "alpha", duration: "19s", delay: "-7s", driftX: "40px", driftY: "-82px", opacity: 0.22 },
];

export function NuclearBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let pointerX = width * 0.5;
    let pointerY = height * 0.35;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const atomCount = Math.min(7, Math.max(4, Math.floor(width / 260)));
    const atoms: AtomNode[] = Array.from({ length: atomCount }, (_, idx) => ({
      x: ((idx + 0.5) / atomCount) * width + (Math.random() - 0.5) * 120,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: 2.3 + (idx % 3) * 0.7,
      orbitRadius: 26 + (idx % 4) * 13,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (0.007 + (idx % 3) * 0.0035) * (idx % 2 === 0 ? 1 : -1),
      tilt: idx % 2 === 0 ? 0.42 : -0.42,
      color: idx % 3 === 0 ? "rgba(239, 43, 136, 0.28)" : "rgba(0, 232, 245, 0.3)",
      symbol: SYMBOLS[idx % SYMBOLS.length]!,
    }));

    const particles: RadiationParticle[] = Array.from({ length: 20 }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      size: 1.1 + (idx % 3) * 0.55,
      alpha: 0.13 + (idx % 4) * 0.06,
      hue: idx % 4 === 0 ? "magenta" : "cyan",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle interactive quantum field connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dxMouse = p.x - pointerX;
        const dyMouse = p.y - pointerY;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < 170 && distMouse > 1) {
          p.x += (dxMouse / distMouse) * 0.22;
          p.y += (dyMouse / distMouse) * 0.22;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === "cyan"
            ? `rgba(0, 232, 245, ${p.alpha})`
            : `rgba(239, 43, 136, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]!;
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 232, 245, ${(1 - dist / 130) * 0.055})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      // Floating atomic orbital systems
      for (const atom of atoms) {
        atom.x += atom.vx;
        atom.y += atom.vy;
        atom.angle += atom.angularSpeed;

        if (atom.x < -60) atom.x = width + 60;
        if (atom.x > width + 60) atom.x = -60;
        if (atom.y < -60) atom.y = height + 60;
        if (atom.y > height + 60) atom.y = -60;

        ctx.save();
        ctx.translate(atom.x, atom.y);

        // Glowing nucleus core
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, atom.radius * 4.2);
        grad.addColorStop(0, atom.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, atom.radius * 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(0, 232, 245, 0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, atom.radius, 0, Math.PI * 2);
        ctx.fill();

        // Elliptical Orbit 1
        ctx.save();
        ctx.rotate(atom.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, atom.orbitRadius, atom.orbitRadius * 0.42, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 232, 245, 0.095)";
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // Orbiting electron 1
        const ex1 = Math.cos(atom.angle) * atom.orbitRadius;
        const ey1 = Math.sin(atom.angle) * (atom.orbitRadius * 0.42);
        ctx.beginPath();
        ctx.arc(ex1, ey1, 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 232, 245, 0.65)";
        ctx.fill();
        ctx.restore();

        // Elliptical Orbit 2
        ctx.save();
        ctx.rotate(-atom.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, atom.orbitRadius * 0.85, atom.orbitRadius * 0.36, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(239, 43, 136, 0.085)";
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // Orbiting electron 2
        const ex2 = Math.cos(-atom.angle * 1.3) * (atom.orbitRadius * 0.85);
        const ey2 = Math.sin(-atom.angle * 1.3) * (atom.orbitRadius * 0.36);
        ctx.beginPath();
        ctx.arc(ex2, ey2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 43, 136, 0.58)";
        ctx.fill();
        ctx.restore();

        // Faint isotope notation label
        ctx.font = "600 10px 'Space Grotesk', monospace";
        ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
        ctx.fillText(atom.symbol, atom.orbitRadius * 0.45, -atom.orbitRadius * 0.45);

        ctx.restore();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Pure CSS GPU-Accelerated Floating Radioactive Decay Particles */}
      {CSS_DECAY_PARTICLES.map((p) => (
        <React.Fragment key={p.id}>
          <span
            className={`decay-particle decay-particle-${p.type}`}
            style={
              {
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                "--decay-duration": p.duration,
                "--decay-delay": p.delay,
                "--drift-x": p.driftX,
                "--drift-y": p.driftY,
                "--particle-opacity": p.opacity,
              } as React.CSSProperties
            }
          />
          {p.hasRing && (
            <span
              className="decay-emission-ring"
              style={
                {
                  top: p.top,
                  left: p.left,
                  width: "34px",
                  height: "34px",
                  "--ring-duration": p.duration,
                  "--ring-delay": p.delay,
                } as React.CSSProperties
              }
            />
          )}
        </React.Fragment>
      ))}

      {/* Interactive Atomic Orbital Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      />
    </div>
  );
}
