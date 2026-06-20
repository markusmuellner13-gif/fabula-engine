"use client";

import { useEffect, useState } from "react";
import { phraseSequence } from "@/lib/phrases";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phrases] = useState(() => phraseSequence(7));
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // rotate phrases
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 1400);
    return () => clearInterval(t);
  }, [phrases.length]);

  // progress -> done
  useEffect(() => {
    let raf = 0;
    const startT = performance.now();
    const dur = 2600;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - startT) / dur) * 100);
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 380);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-ink">
      {/* animated backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow/20 blur-[120px] animate-pulseGlow" />
        <div className="absolute left-[20%] top-[30%] h-40 w-40 rounded-full bg-glow2/20 blur-[80px] animate-float" />
        <div className="absolute right-[18%] bottom-[24%] h-52 w-52 rounded-full bg-accent/20 blur-[90px] animate-float" />
      </div>

      {/* logo mark */}
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border border-glow/40 spin-slow" />
        <div className="absolute inset-2 rounded-2xl border border-glow2/30 spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="absolute h-3 w-3 rounded-full bg-glow2" style={{ animation: "orbit 3.5s linear infinite" }} />
        <span className="text-4xl">⚒️</span>
      </div>

      <h1 className="mb-1 text-3xl font-black tracking-tight">
        <span className="gradient-text">Fabula</span> Engine
      </h1>
      <p className="mb-8 text-sm text-white/40">AI-native game engine</p>

      {/* rotating phrase */}
      <div className="h-6 overflow-hidden">
        <p key={idx} className="animate-[float_0.6s_ease] text-center text-base font-medium text-white/80">
          {phrases[idx]}
        </p>
      </div>

      {/* progress bar */}
      <div className="mt-8 h-1.5 w-72 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-glow via-glow2 to-accent transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs tabular-nums text-white/30">{Math.round(progress)}%</p>
    </div>
  );
}
