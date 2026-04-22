import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import BrandedShell from "../../components/BrandedShell";
import GameButton from "../../components/GameButton";
import {
  clearChallengeContext,
  persistChallengeContext,
  readChallengeContext,
} from "../../lib/challengeNavigation";
import { getChallengeById } from "../../lib/challenges/api";
import { resolveApiFileUrl } from "../../lib/resolveFileUrl";
import type { ChallengeDetailFromApi } from "../../types/challenge";
import {
  CHALLENGE_BY_NODE,
  DOMAIN_THEME,
  domainKeyFromTrackId,
  domainKeyFromTrackName,
  isDomainKey,
  type DomainKey,
} from "./challenge/challengeData";

const glow =
  "0 0 10px rgba(255,255,255,0.35), 0 0 24px rgba(255,255,255,0.12)";

const TRACK_LABEL: Record<number, string> = {
  2: "AI",
  3: "CS",
  4: "PS",
  6: "UX",
  7: "GD",
};

type ChallengeLocationState = {
  challengeId?: unknown;
  node?: unknown;
};

function parseChallengeId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** `/challenge` — challenge id lives in router state (+ session refresh), not the URL. */
export default function MainChallengePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationState = location.state as ChallengeLocationState | null;

  const [submission, setSubmission] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiChallenge, setApiChallenge] = useState<ChallengeDetailFromApi | null>(
    null,
  );

  const challengeId = useMemo(() => {
    const fromState = parseChallengeId(locationState?.challengeId);
    if (fromState != null) return fromState;
    const q = searchParams.get("id");
    if (q?.trim()) {
      const n = Number(q);
      if (Number.isFinite(n) && n > 0) return n;
    }
    const onlyNodeInUrl =
      searchParams.has("node") && !searchParams.has("id");
    if (!onlyNodeInUrl) {
      const fromStorage = readChallengeContext()?.challengeId;
      if (fromStorage != null && fromStorage > 0) return fromStorage;
    }
    return null;
  }, [locationState, location.key, searchParams]);

  /** Legacy `?id=&node=` links: replace with clean `/challenge` + state. */
  useEffect(() => {
    if (!searchParams.has("id") && !searchParams.has("node")) return;

    const idRaw = searchParams.get("id");
    const parsedId =
      idRaw?.trim() !== "" && idRaw != null ? Number(idRaw) : NaN;
    const id =
      Number.isFinite(parsedId) && parsedId > 0 ? parsedId : undefined;

    const nodeQ = searchParams.get("node")?.toLowerCase();
    const node = nodeQ && isDomainKey(nodeQ) ? nodeQ : undefined;

    if (id != null) {
      persistChallengeContext({ challengeId: id, node });
    }

    navigate("/challenge", {
      replace: true,
      state:
        id != null
          ? { challengeId: id, ...(node ? { node } : {}) }
          : node
            ? { node }
            : {},
    });
  }, [searchParams, navigate]);

  /** Keep session in sync when opening from in-app navigation (state on the location). */
  useEffect(() => {
    const id = parseChallengeId(locationState?.challengeId);
    const rawNode = locationState?.node;
    const node =
      typeof rawNode === "string" && isDomainKey(rawNode.toLowerCase())
        ? rawNode.toLowerCase()
        : undefined;
    if (id != null) persistChallengeContext({ challengeId: id, node });
  }, [locationState]);

  useEffect(() => {
    if (challengeId == null) {
      setApiChallenge(null);
      setApiError(null);
      setApiLoading(false);
      return;
    }
    let cancelled = false;
    setApiChallenge(null);
    setApiError(null);
    setApiLoading(true);
    (async () => {
      try {
        const ch = await getChallengeById(challengeId);
        if (cancelled) return;
        setApiChallenge(ch);
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

  /** True on first paint and until fetch settles — avoids redirecting before `useEffect` runs. */
  const awaitingChallengeDetail =
    challengeId != null &&
    !apiError &&
    (apiLoading || apiChallenge == null);

  const nodeHintRaw = useMemo(() => {
    const raw = locationState?.node;
    const fromState =
      typeof raw === "string" ? raw.toLowerCase() : "";
    if (fromState && isDomainKey(fromState)) return fromState;
    const stored = readChallengeContext()?.node?.toLowerCase();
    if (stored && isDomainKey(stored)) return stored;
    const q = searchParams.get("node")?.toLowerCase() ?? "";
    return q && isDomainKey(q) ? q : "";
  }, [locationState, location.key, searchParams]);

  const domainFromNode = useMemo((): DomainKey | null => {
    return isDomainKey(nodeHintRaw) ? nodeHintRaw : null;
  }, [nodeHintRaw]);

  /** Map / URL hint — matches logo or fixes bad `track_id`. */
  const domainHint = useMemo((): DomainKey | null => {
    return isDomainKey(nodeHintRaw) ? nodeHintRaw : null;
  }, [nodeHintRaw]);

  /** Theme: API track name → map hint (logo) → numeric track id. */
  const domain = useMemo((): DomainKey | null => {
    if (challengeId != null) {
      if (!apiChallenge) return null;
      return (
        domainKeyFromTrackName(apiChallenge.track_name) ??
        domainHint ??
        domainKeyFromTrackId(apiChallenge.track_id)
      );
    }
    return domainFromNode;
  }, [challengeId, apiChallenge, domainHint, domainFromNode]);

  if (awaitingChallengeDetail) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center font-Shuriken text-sm tracking-[0.2em] text-white/80">
        Loading challenge…
      </div>
    );
  }

  if (challengeId != null && apiError) {
    return (
      <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4 px-4 text-center font-Shuriken text-sm tracking-[0.2em] text-white/80">
        <p>{apiError}</p>
        <GameButton type="button" onClick={() => window.history.back()}>
          Back
        </GameButton>
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
      ? `STAGE ${apiChallenge.stage_id} · ${
          TRACK_LABEL[apiChallenge.track_id] ?? `TRACK ${apiChallenge.track_id}`
        }`
      : c.zoneLabel;
  const domainTitle =
    apiChallenge != null ? apiChallenge.title.toUpperCase() : c.domainTitle;
  const narrative =
    apiChallenge != null ? apiChallenge.description : c.narrative;
  const taskBody =
    apiChallenge != null
      ? (() => {
          const parts: string[] = [`Type: ${apiChallenge.type}`];
          if (apiChallenge.points != null) {
            parts.push(`Points: ${apiChallenge.points}`);
          }
          if (apiChallenge.type === "auto") {
            if (apiChallenge.max_points != null) {
              parts.push(`Max: ${apiChallenge.max_points}`);
            }
            if (apiChallenge.min_points != null) {
              parts.push(`Min: ${apiChallenge.min_points}`);
            }
            if (apiChallenge.decay != null) {
              parts.push(`Decay: ${apiChallenge.decay}`);
            }
          }
          return parts.join(" · ");
        })()
      : c.taskBody;

  const fileHref = resolveApiFileUrl(apiChallenge?.file_url);

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
                {fileHref ? (
                  <a
                    href={fileHref}
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
                onClick={() => clearChallengeContext()}
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
