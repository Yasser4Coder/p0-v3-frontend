import { logoAI, logoCS, logoGD, logoPS, logoUX } from "../../assets/assets";
import BrandedShell from "../../components/BrandedShell";
import { motion } from "framer-motion";

const glow =
  "0 0 8px rgba(255,255,255,0.75), 0 0 20px rgba(255,255,255,0.28)";
const glowStrong =
  "0 0 10px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.38)";

type StatRowProps = { logo: string; label: string; value: string };

function StatRow({ logo, label, value }: StatRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-white/15 py-2.5 last:border-b-0 md:gap-4 md:py-3">
      <img
        src={logo}
        alt=""
        className="h-8 w-8 shrink-0 object-contain md:h-9 md:w-9"
      />
      <span
        className="font-Shuriken text-xs font-bold tracking-[0.2em] text-white md:text-sm"
        style={{ textShadow: glow }}
      >
        {label}
      </span>
      <span
        className="ml-auto font-Shuriken text-lg font-black tabular-nums text-white md:text-xl"
        style={{ textShadow: glow }}
      >
        {value}
      </span>
    </div>
  );
}

/** `/main/status` — profile / team status (no map). */
export default function MainStatusPage() {
  return (
    <motion.div
      className="flex min-h-[min(52vh,520px)] w-full min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <BrandedShell
        compact
        className="flex min-h-[min(48vh,480px)] flex-1 flex-col border-white/20! md:min-h-[min(58vh,560px)]"
      >
        <div className="flex flex-col items-center px-3 py-5 md:px-6 md:py-8">
          <h1
            className="font-Shuriken text-2xl font-black tracking-[0.3em] text-white md:text-3xl"
            style={{ textShadow: glowStrong }}
          >
            STATUS
          </h1>
          <p
            className="mt-1 font-Shuriken text-xs font-bold tracking-[0.35em] text-white/95 md:text-sm"
            style={{ textShadow: glow }}
          >
            ELEC TEAM
          </p>

          <div className="mt-6 flex w-full max-w-2xl flex-col items-stretch justify-between gap-5 sm:flex-row sm:items-start md:mt-8">
            <div className="flex flex-col items-center sm:items-start">
              <span
                className="font-Shuriken text-4xl font-black leading-none text-white md:text-5xl"
                style={{ textShadow: glowStrong }}
              >
                12
              </span>
              <span
                className="mt-1 font-Shuriken text-[0.65rem] font-bold tracking-[0.35em] text-white/90 md:text-xs"
                style={{ textShadow: glow }}
              >
                RANKING
              </span>
            </div>
            <div className="flex flex-col gap-1 text-center sm:mt-1 sm:text-right">
              <p
                className="font-Shuriken text-xs font-bold tracking-[0.15em] text-white md:text-sm"
                style={{ textShadow: glow }}
              >
                name: KHALIL
              </p>
              <p
                className="font-Shuriken text-xs font-bold tracking-[0.14em] text-white/95 md:text-sm"
                style={{ textShadow: glow }}
              >
                TEAM DCROWLERS
              </p>
            </div>
          </div>

          <div className="mt-6 w-full max-w-3xl border border-white px-3 py-2 md:mt-8 md:px-6 md:py-3">
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <div className="md:border-r md:border-white/20 md:pr-6">
                <StatRow logo={logoCS} label="CS" value="50" />
                <StatRow logo={logoAI} label="AI" value="50" />
                <StatRow logo={logoPS} label="PS" value="50" />
              </div>
              <div className="md:pl-6">
                <StatRow logo={logoGD} label="GD" value="50" />
                <StatRow logo={logoUX} label="UX" value="50" />
              </div>
            </div>

            <div className="mt-4 flex flex-col items-end gap-2 border-t border-white/25 pt-4 sm:flex-row sm:items-end sm:justify-end md:mt-5 md:pt-5">
              <div
                className="font-Shuriken text-right text-[0.55rem] font-bold leading-tight tracking-[0.28em] text-white/90 md:text-[0.6rem]"
                style={{ textShadow: glow }}
              >
                TOTAL
                <br />
                OF
                <br />
                POINTS
              </div>
              <span
                className="font-Shuriken text-3xl font-black tabular-nums text-white md:text-4xl"
                style={{ textShadow: glowStrong }}
              >
                250
              </span>
            </div>
          </div>
        </div>
      </BrandedShell>
    </motion.div>
  );
}
