import { useMemo } from "react";
import { motion } from "framer-motion";
import BrandedShell from "../../components/BrandedShell";
import { useScoreboardTeams } from "../../hooks/useScoreboardTeams";
import ScoreBoardTeams from "./scoreboard/ScoreBoardTeams";

const GOLD = "#C5A059";

const headlineGlow =
  "0 0 12px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.18)";

const scoreboardTitleFrameGlow =
  "0 0 4px rgba(255,255,255,0.55), 0 0 12px rgba(255,255,255,0.28), 0 0 22px rgba(255,255,255,0.14)";

const LS_TEAM = "teamName";

function ordinal(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

/** `/main/score-board` — leaderboard + summary (BrandedShell, same glass pattern as Needs/Timer). */
export default function MainScoreBoardPage() {
  const myTeamName = useMemo(
    () => localStorage.getItem(LS_TEAM) ?? "ELEC TEAM",
    [],
  );

  const { teams, loading, error } = useScoreboardTeams(myTeamName);

  const rankIndex = teams.findIndex((t) => t.name === myTeamName);
  const rank = rankIndex === -1 ? null : rankIndex + 1;
  const points =
    rankIndex === -1 ? null : teams[rankIndex]?.totalScore ?? null;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col">
      <BrandedShell
        compact
        className={[
          "relative flex min-h-[min(52vh,480px)] flex-1 flex-col overflow-hidden",
          "border-[#43574C]! bg-linear-to-br! from-white/11! via-white/5! to-white/3!",
          "backdrop-blur-3xl backdrop-saturate-200",
          "shadow-[0_12px_48px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
          "md:min-h-[min(62vh,600px)]",
        ].join(" ")}
      >
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 md:gap-5">
          <div
            className={[
              "flex min-h-[min(40vh,360px)] flex-1 flex-col items-center rounded-2xl",
              "px-3 py-6 md:px-6 md:py-8",
            ].join(" ")}
          >
            <motion.div
              className="flex w-full flex-col items-center gap-8 md:gap-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="mx-auto w-fit rounded-none border-2 border-white px-5 py-2.5 text-center font-Shuriken text-2xl font-black tracking-[0.35em] text-white md:px-7 md:py-3 md:text-3xl lg:px-8 lg:text-4xl"
                style={{
                  textShadow: headlineGlow,
                  boxShadow: scoreboardTitleFrameGlow,
                }}
              >
                SCOREBOARD
              </h1>

              <p
                className="max-w-lg px-2 text-center font-Shuriken text-xs font-bold normal-case leading-relaxed tracking-[0.08em] text-white/92 sm:text-sm md:text-base md:tracking-[0.12em]"
                style={{ textShadow: headlineGlow }}
              >
                {rank != null && points != null ? (
                  <>
                    Your team <span style={{ color: GOLD }}>{myTeamName}</span>{" "}
                    is in the <span className="text-white">{ordinal(rank)}</span>{" "}
                    place with{" "}
                    <span className="tabular-nums text-white">{points}</span> points.
                  </>
                ) : (
                  <>
                    Your team <span style={{ color: GOLD }}>{myTeamName}</span>{" "}
                    is not on the board yet.
                  </>
                )}
              </p>

              <ScoreBoardTeams teams={teams} loading={loading} error={error} />
            </motion.div>
          </div>
        </div>
      </BrandedShell>
    </div>
  );
}
