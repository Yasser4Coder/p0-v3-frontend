import { useEffect, useState } from "react";
import BrandedShell from "../../components/BrandedShell";
import { motion } from "framer-motion";

/** Match mockup start: 36:36:00 */
const INITIAL_SECONDS = 36 * 3600 + 36 * 60;

function formatHMS(totalSec: number) {
  const t = Math.max(0, totalSec);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const glow =
  "0 0 12px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.18)";

/** `/main/timer` — glass panel, digital clock, tagline (see UI mock). */
export default function MainTimerPage() {
  const [remaining, setRemaining] = useState(INITIAL_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.div
      className="flex w-full min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <BrandedShell
        compact
        className={[
          "relative flex min-h-[min(52vh,480px)] flex-1 flex-col overflow-hidden",
          "border-[#43574C]! bg-linear-to-br! from-white/11! via-white/5! to-white/3!",
          "backdrop-blur-3xl backdrop-saturate-200",
          "shadow-[0_12px_48px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
          "md:min-h-[min(60vh,560px)]",
        ].join(" ")}
      >
        <div className="relative z-10 flex min-h-0 flex-1 flex-col p-1 md:p-2">
          <div
            className={[
              "flex min-h-[min(44vh,400px)] flex-1 flex-col",
            ].join(" ")}
          >
            <h1
              className="shrink-0 pt-8 text-center font-Shuriken text-2xl font-black tracking-[0.4em] text-white md:pt-10 md:text-3xl lg:text-4xl"
              style={{ textShadow: glow }}
            >
              TIMER
            </h1>

            <div className="flex flex-1 items-center justify-center px-4 py-6">
              <p
                className="text-center font-Shuriken text-5xl font-black tabular-nums tracking-[0.12em] text-white sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ textShadow: glow }}
                aria-live="polite"
                aria-label={`Time remaining ${formatHMS(remaining)}`}
              >
                {formatHMS(remaining)}
              </p>
            </div>

            <p className="shrink-0 pb-8 text-center font-Shuriken text-[0.65rem] font-bold uppercase tracking-[0.28em] text-white/92 md:pb-10 md:text-sm">
              THE CLOCK IS YOUR ENEMY.
            </p>
          </div>
        </div>
      </BrandedShell>
    </motion.div>
  );
}
