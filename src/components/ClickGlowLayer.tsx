import React, { useEffect } from "react";

export function ClickGlowLayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePointerDown = (e: PointerEvent) => {
      // Allow primary clicks and touches
      if (e.button !== 0 && e.pointerType === "mouse") return;

      const x = e.clientX;
      const y = e.clientY;

      // 1. Core expanding neon glow circle
      const glow = document.createElement("span");
      glow.className = "tap-glow";
      glow.style.setProperty("--tap-x", `${x}px`);
      glow.style.setProperty("--tap-y", `${y}px`);
      document.body.appendChild(glow);

      // 2. High-tech shockwave ring
      const ring = document.createElement("span");
      ring.className = "tap-ring";
      ring.style.setProperty("--tap-x", `${x}px`);
      ring.style.setProperty("--tap-y", `${y}px`);
      document.body.appendChild(ring);

      // 3. Radial glowing quantum sparks
      const sparkCount = 8;
      const sparks: HTMLElement[] = [];
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("span");
        spark.className = "tap-spark";
        const angle = (i / sparkCount) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
        const distance = 40 + Math.random() * 55;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        spark.style.setProperty("--tap-x", `${x}px`);
        spark.style.setProperty("--tap-y", `${y}px`);
        spark.style.setProperty("--tx", `${tx}px`);
        spark.style.setProperty("--ty", `${ty}px`);
        document.body.appendChild(spark);
        sparks.push(spark);
      }

      // Cleanup
      window.setTimeout(() => {
        glow.remove();
        ring.remove();
        sparks.forEach((s) => s.remove());
      }, 850);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return null;
}
