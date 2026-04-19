import BrandedShell from "../../components/BrandedShell";
import FrostedPanel from "../../components/FrostedPanel";
import DashboardMapPanel from "./DashboardMapPanel";
import { motion } from "framer-motion";

const GOLD = "#C5A059";

const SKILLS: { label: string; value: number; tone: "green" | "gold" }[] = [
  { label: "UIUX", value: 72, tone: "green" },
  { label: "PROBLEM SOLVING", value: 64, tone: "green" },
  { label: "GRAFIC DESIGN", value: 58, tone: "green" },
  { label: "CYBER SECURITY", value: 81, tone: "green" },
  { label: "AI", value: 45, tone: "green" },
  { label: "TEAM PROGRES", value: 70, tone: "gold" },
];

const ANNOUNCEMENT =
  "HEY HUNTERS KHALIL WANTS TO MAKE A BIG ANNOUNCEMENT FOR YOU HE IS THE MOST HANDSOME MAN THAT THE EARTH HAS EVER SEEN AND NO ONE CAN COMPARE HIM WITH ANOTHER CUZ HE IS THE GOAT";

function SkillBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "gold";
}) {
  const fill =
    tone === "gold"
      ? "bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.35)]"
      : "bg-[#76AF72] shadow-[0_0_10px_rgba(57,255,20,0.35)]";

  return (
    <div className="font-Shuriken">
      <div className="mb-1 flex justify-between text-[0.65rem] uppercase tracking-[0.12em] text-white/90 md:text-xs">
        <span>{label}</span>
        <span className="text-white/60">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm border border-white/10 bg-black/70">
        <div
          className={`h-full rounded-sm transition-all duration-500 ${fill}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** `/main` — map + status + announcement. */
export default function MainHomePage() {
  return (
    <>
      <motion.div
        className="flex min-w-0 flex-1"
        initial={{ opacity: 0, y: 38 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <DashboardMapPanel />
      </motion.div>
      <motion.div
        className="flex w-full shrink-0 flex-col gap-4 lg:w-80 xl:w-96"
        initial={{ opacity: 0, x: 34 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandedShell className="px-4! py-5! shadow-lg md:px-5! md:py-6!">
          <h2
            className="mb-4 font-Shuriken text-lg font-bold tracking-[0.25em] md:text-xl"
            style={{ color: GOLD }}
          >
            Status
          </h2>
          <div className="flex flex-col gap-3 md:gap-4">
            {SKILLS.map((s) => (
              <SkillBar
                key={s.label}
                label={s.label}
                value={s.value}
                tone={s.tone}
              />
            ))}
          </div>
        </BrandedShell>

        <FrostedPanel className="mt-0! px-4! py-5! md:px-6!">
          <h2
            className="mb-3 font-Shuriken text-lg font-bold tracking-[0.25em] md:text-xl"
            style={{ color: GOLD }}
          >
            Announcement
          </h2>
          <p className="text-left text-xs leading-relaxed tracking-wide text-white/95 md:text-sm">
            {ANNOUNCEMENT}
          </p>
        </FrostedPanel>
      </motion.div>
    </>
  );
}
