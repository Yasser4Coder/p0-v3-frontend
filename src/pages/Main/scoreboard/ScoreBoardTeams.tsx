import { AnimatePresence, motion } from "framer-motion";
import { Award, ChevronRight } from "lucide-react";
import type { ScoreboardTeam } from "../../../types/scoreboard";

function PlaceMedal({ index }: { index: number }) {
  if (index === 0) {
    return (
      <Award
        className="h-9 w-9 shrink-0 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  if (index === 1) {
    return (
      <Award
        className="h-8 w-8 shrink-0 text-slate-300"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  if (index === 2) {
    return (
      <Award
        className="h-8 w-8 shrink-0 text-amber-800"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  return (
    <span className="inline-flex w-9 shrink-0 justify-center font-Shuriken text-base font-black tabular-nums text-white/90 md:text-lg">
      {index + 1}
    </span>
  );
}

function rowWidthClass(index: number) {
  if (index === 0) return "w-full";
  if (index === 1) return "w-[90%]";
  if (index === 2) return "w-[80%]";
  return "w-[65%]";
}

type ScoreBoardTeamsProps = {
  teams: ScoreboardTeam[];
  loading: boolean;
  error: string | null;
  /** When set, the matching team row gets a “you are here” arrow. */
  currentTeamName?: string | null;
};

export default function ScoreBoardTeams({
  teams,
  loading,
  error,
  currentTeamName,
}: ScoreBoardTeamsProps) {
  if (loading && teams.length === 0) {
    return (
      <p className="text-center font-Shuriken text-sm normal-case tracking-normal text-white/80">
        Loading…
      </p>
    );
  }

  if (!teams.length) {
    return (
      <p className="text-center font-Shuriken text-sm normal-case tracking-normal text-white/70">
        No teams yet.
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-2.5 md:max-w-2xl md:gap-3">
      {error ? (
        <p className="mb-1 text-center font-Shuriken text-xs normal-case text-amber-200/90">
          {error}
        </p>
      ) : null}
      <AnimatePresence mode="popLayout">
        {teams.map((team, index) => {
          const isYou =
            Boolean(currentTeamName?.trim()) && team.name === currentTeamName;
          return (
            <motion.div
              key={team._id ?? team.id ?? team.name}
              layout
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              aria-current={isYou ? "true" : undefined}
              className={[
                "relative mx-auto flex items-center justify-between gap-3 border px-4 py-2 font-Shuriken normal-case tracking-normal text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:px-6 sm:py-2.5 md:gap-6 md:px-8",
                rowWidthClass(index),
                isYou
                  ? "border-[#C5A059]/80 shadow-[0_0_0_1px_rgba(197,160,89,0.35),0_8px_28px_rgba(197,160,89,0.18)]"
                  : "border-white/25",
              ].join(" ")}
            >
              {isYou ? (
                <motion.div
                  className="pointer-events-none absolute -left-1 top-1/2 z-20 -translate-y-1/2 sm:-left-2 md:-left-3"
                  aria-hidden
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 26 }}
                >
                  <div
                    className="flex items-center rounded-full border bg-black/70 px-0.5 py-0.5 shadow-[0_0_18px_rgba(197,160,89,0.45)] backdrop-blur-sm sm:px-1"
                    style={{ borderColor: "#C5A059aa" }}
                  >
                    <ChevronRight
                      className="h-5 w-5 text-[#C5A059] drop-shadow-[0_0_8px_rgba(197,160,89,0.65)] sm:h-6 sm:w-6"
                      strokeWidth={2.6}
                    />
                  </div>
                </motion.div>
              ) : null}
              <PlaceMedal index={index} />
              <p className="min-w-0 flex-1 truncate text-center text-sm font-bold tracking-[0.12em] sm:text-base md:text-lg md:tracking-[0.2em]">
                {team.name}
              </p>
              <p className="shrink-0 tabular-nums text-sm font-black sm:text-base md:text-xl">
                {team.totalScore}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
