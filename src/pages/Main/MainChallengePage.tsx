import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import BrandedShell from "../../components/BrandedShell";
import GameButton from "../../components/GameButton";
import { getChallengeById } from "../../lib/challenges/api";
import {
  CHALLENGE_BY_NODE,
  DOMAIN_THEME,
  domainKeyFromTrackName,
  isDomainKey,
  type DomainKey,
} from "./challenge/challengeData";

const glow =
  "0 0 10px rgba(255,255,255,0.35), 0 0 24px rgba(255,255,255,0.12)";

/** `/challenge?node=cs|ps|ai|ux|gd` — domain challenge from map markers (standalone layout, no sidebar). */
export default function MainChallengePage() {
  const [searchParams] = useSearchParams();
  const nodeRaw = searchParams.get("node")?.toLowerCase() ?? "";
  const idRaw = searchParams.get("id");
  const [submission, setSubmission] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiChallenge, setApiChallenge] = useState<{
    title: string;
    description: string;
    stage_title: string;
    mentor_name: string;
    points: number | null;
    track_name: string;
    file_url: string | null;
    type: string;
  } | null>(null);

  const challengeId = useMemo(() => {
    if (!idRaw?.trim()) return null;
    const n = Number(idRaw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [idRaw]);

  useEffect(() => {
    if (challengeId == null) {
      setApiChallenge(null);
      setApiError(null);
      setApiLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const ch = await getChallengeById(challengeId);
        if (cancelled) return;
        setApiChallenge({
          title: ch.title,
          description: ch.description,
          stage_title: ch.stage_title,
          mentor_name: ch.mentor_name,
          points: ch.points,
          track_name: ch.track_name,
          file_url: ch.file_url,
          type: ch.type,
        });
      } catch {
        if (!cancelled) {
          setApiChallenge(null);
          setApiError("Could not load this challenge.");
        }
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  const domainFromNode = useMemo((): DomainKey | null => {
    return isDomainKey(nodeRaw) ? nodeRaw : null;
  }, [nodeRaw]);

  const domainFromApi = useMemo((): DomainKey | null => {
    return domainKeyFromTrackName(apiChallenge?.track_name);
  }, [apiChallenge?.track_name]);

  const domain = challengeId != null ? domainFromApi : domainFromNode;

  if (challengeId != null && apiLoading) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center font-Shuriken text-sm tracking-[0.2em] text-white/80">
        Loading challenge…
      </div>
    );
  }

  if (!domain) {
    return <Navigate to="/main" replace />;
  }

  const c = CHALLENGE_BY_NODE[domain];
  const theme = DOMAIN_THEME[domain];

  const zoneLabel =
    apiChallenge != null
      ? `${apiChallenge.stage_title.toUpperCase()} · ${apiChallenge.track_name}`
      : c.zoneLabel;
  const domainTitle =
    apiChallenge != null ? apiChallenge.title.toUpperCase() : c.domainTitle;
  const narrative =
    apiChallenge != null ? apiChallenge.description : c.narrative;
  const taskBody =
    apiChallenge != null
      ? `Mentor: ${apiChallenge.mentor_name}${
          apiChallenge.points != null
            ? ` · Points: ${apiChallenge.points}`
            : ""
        } · Type: ${apiChallenge.type}`
      : c.taskBody;

  return (
    <motion.div
      className="flex w-full min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <BrandedShell
        compact
        className={[
          "relative flex min-h-[min(52vh,520px)] flex-1 flex-col overflow-hidden",
          theme.shellBorder,
          theme.shellRing,
          "bg-linear-to-br! from-white/11! via-white/5! to-white/3!",
          "backdrop-blur-3xl backdrop-saturate-200",
          "shadow-[0_12px_48px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.18)]",
          "md:min-h-[min(62vh,640px)]",
        ].join(" ")}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/25"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-5 px-2 py-4 sm:px-4 md:px-6 md:py-6">
          <header className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-5 md:gap-8">
              <img
                src={c.logo}
                alt=""
                className={`h-12 w-12 shrink-0 rounded-full sm:h-14 sm:w-14 md:h-16 md:w-16 ${theme.logoClass}`}
              />
              <div className="min-w-0 flex-1 text-center">
                <p
                  className="font-Shuriken text-[0.65rem] font-bold tracking-[0.22em] text-white/90 sm:text-xs md:text-sm"
                  style={{ textShadow: glow }}
                >
                  {zoneLabel}
                </p>
                <h1
                  className="mt-1 font-Shuriken text-lg font-black tracking-[0.18em] text-white sm:text-xl md:text-2xl"
                  style={{ textShadow: glow }}
                >
                  {domainTitle}
                </h1>
              </div>
              <img
                src={c.logo}
                alt=""
                className={`h-12 w-12 shrink-0 rounded-full sm:h-14 sm:w-14 md:h-16 md:w-16 ${theme.logoClass}`}
              />
            </div>
          </header>

          <div
            className={[
              "rounded-xl px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
              "backdrop-blur-md sm:px-5 sm:py-5 md:px-6",
              theme.innerPanelClass,
            ].join(" ")}
          >
            <p
              className="font-Shuriken text-left text-[0.65rem] font-bold leading-relaxed tracking-[0.08em] text-white/95 sm:text-xs md:text-sm md:leading-relaxed md:tracking-[0.1em]"
              style={{ textShadow: glow }}
            >
              {apiError ? (
                <span className="text-red-200/95">{apiError}</span>
              ) : (
                narrative
              )}
            </p>

            <h2
              className="mt-6 font-Shuriken text-sm font-black tracking-[0.28em] sm:text-base"
              style={{ color: theme.taskColor, textShadow: glow }}
            >
              TASK:
            </h2>
            <p
              className="mt-2 font-Shuriken text-left text-[0.65rem] font-bold leading-relaxed tracking-[0.08em] text-white/95 sm:text-xs md:text-sm"
              style={{ textShadow: glow }}
            >
              {taskBody}
            </p>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer">
                  <input type="file" className="sr-only" accept=".pdf,application/pdf" />
                  <span
                    className={[
                      "inline-flex min-h-10 items-center justify-center rounded-sm border px-6 py-2",
                      "font-Shuriken text-xs font-black tracking-[0.35em] text-white transition-colors",
                      theme.fileBtnClass,
                    ].join(" ")}
                  >
                    FILE
                  </span>
                </label>
                {apiChallenge?.file_url ? (
                  <a
                    href={apiChallenge.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className={[
                      "inline-flex min-h-10 items-center justify-center rounded-sm border px-4 py-2",
                      "font-Shuriken text-[0.65rem] font-black tracking-[0.2em] text-white underline-offset-2 hover:underline",
                      theme.fileBtnClass,
                    ].join(" ")}
                  >
                    OPEN FILE
                  </a>
                ) : null}
              </div>

              <label className="block">
                <span className="sr-only">Submission</span>
                <input
                  type="text"
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder="SUBMIT HERE"
                  className={[
                    "w-full rounded-sm border border-white/15 bg-black/55 px-4 py-3",
                    "font-Shuriken text-xs font-bold tracking-[0.12em] text-white placeholder:text-white/35",
                    "outline-none focus:ring-2",
                    theme.inputFocusClass,
                    "md:text-sm",
                  ].join(" ")}
                />
              </label>
              <p
                className="font-Shuriken text-[0.55rem] tracking-[0.2em] text-white/65 md:text-xs"
                style={{ textShadow: glow }}
              >
                SUBMIT FORM: PDF
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <GameButton
                to="/main"
                fullWidth={false}
                className="shrink-0"
                outerBgClass="bg-[#C5A059]"
                bgClass="!rounded-md border !border-[#333B36] bg-[#C5A059] !px-10 !py-2.5 hover:bg-[#b8924f]"
                fontClass="font-Shuriken text-xs font-black tracking-[0.35em] text-black md:text-sm"
              >
                HOME
              </GameButton>
            </div>
          </div>
        </div>
      </BrandedShell>
    </motion.div>
  );
}
