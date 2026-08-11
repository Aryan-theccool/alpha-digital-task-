import confetti from "canvas-confetti";

export function fireCoinCelebration() {
  // Golden coin & star particle shower
  const count = 200;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 10000,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Golden coins, champagne sparkles, neon cyan accents
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#f59e0b", "#fbbf24", "#d97706", "#6c8cff"],
    shapes: ["circle"],
    scalar: 1.2,
  });

  fire(0.2, {
    spread: 60,
    colors: ["#ffffff", "#fef08a", "#4ade80"],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#f59e0b", "#6c8cff", "#c084fc"],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ["#fbbf24", "#60a5fa", "#34d399"],
    shapes: ["star"],
    scalar: 1.4,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#f59e0b", "#ffffff"],
  });
}
