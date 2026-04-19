import { useState } from "react";
import { needsPanelBg } from "../../assets/assets";
import BrandedShell from "../../components/BrandedShell";
import GameButton from "../../components/GameButton";
import { motion } from "framer-motion";

const GOLD = "#C5A059";
const headlineGlow =
  "0 0 14px rgba(255,255,255,0.35), 0 2px 16px rgba(0,0,0,0.95)";

/** `/main/needs` — light outer glass (BrandedShell) + darker inner glass panel. */
export default function MainNeedsPage() {
  const [text, setText] = useState("");

  return (
    <motion.div
      className="flex w-full min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <BrandedShell
        compact
        className={[
          "relative flex min-h-[min(52vh,480px)] flex-1 flex-col overflow-hidden",
          /* Lighter outer glass — headline sits on this layer */
          "border-[#43574C]! bg-linear-to-br! from-white/11! via-white/5! to-white/3!",
          "backdrop-blur-3xl backdrop-saturate-200",
          "shadow-[0_12px_48px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
          "md:min-h-[min(62vh,600px)]",
        ].join(" ")}
      >
        <div
          className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-position-[center_30%] opacity-[0.35] blur-3xl saturate-[0.9]"
          style={{ backgroundImage: `url(${needsPanelBg})` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-white/2 to-white/5"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 md:gap-5">
          <h1
            className="shrink-0 text-center font-Shuriken text-[0.7rem] font-black leading-snug tracking-[0.22em] text-white sm:text-sm md:text-base"
            style={{ textShadow: headlineGlow }}
          >
            WRITE ANY THING YOU<br />NEED HERE
          </h1>

          {/* Darker inner glass: needs + textarea + HOME */}
          <div
            className={[
              "flex min-h-0 flex-1 flex-col rounded-2xl border border-white/12",
              "bg-linear-to-b from-black/52 via-black/44 to-black/58",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.35)]",
              "backdrop-blur-2xl backdrop-saturate-150",
              "p-4 md:p-6",
            ].join(" ")}
          >
            <h2
              className="shrink-0 font-Shuriken text-base font-bold lowercase tracking-[0.32em] md:text-lg"
              style={{ color: GOLD }}
            >
              needs
            </h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="mt-4 min-h-[180px] w-full flex-1 resize-y rounded-xl border border-white/14 bg-black/35 px-4 py-3 font-Shuriken text-sm normal-case tracking-normal text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md placeholder:text-white/30 focus:border-[#76AF72]/45 focus:outline-none focus:ring-2 focus:ring-[#76AF72]/25 md:mt-5 md:min-h-[220px] md:px-5 md:py-4 md:text-base"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(118, 175, 114, 0.22)",
              }}
              spellCheck={false}
            />

            <div className="mt-6 flex shrink-0 justify-center md:mt-8">
              <GameButton
                to="/main"
                fullWidth={false}
                className="shrink-0"
                outerBgClass="bg-[#C5A059]"
                bgClass="!rounded-md border !border-[#333B36] bg-[#C5A059] !px-12 !py-3 hover:bg-[#b8924f]"
                fontClass="font-Shuriken text-xs font-black tracking-[0.4em] text-black md:text-sm"
              >
                SEND
              </GameButton>
            </div>
          </div>
        </div>
      </BrandedShell>
    </motion.div>
  );
}
