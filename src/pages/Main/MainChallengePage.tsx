import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import BrandedShell from "../../components/BrandedShell";
import GameButton from "../../components/GameButton";
import SubmissionFeedbackToast from "../../components/SubmissionFeedbackToast";
import {
  clearChallengeContext,
  persistChallengeContext,
  readChallengeContext,
} from "../../lib/challengeNavigation";
import { ApiError } from "../../lib/api/errors";
import { getChallengeById } from "../../lib/challenges/api";
import { resolveApiFileUrl } from "../../lib/resolveFileUrl";
import {
  createSubmissionJson,
  createSubmissionMultipart,
  updateSubmissionMultipart,
} from "../../lib/submissions/api";
import {
  playCorrectAnswerVoice,
  playWrongAnswerVoice,
} from "../../audio/playSubmissionResultSound";
import type {
  ChallengeDetailFromApi,
  SubChallengeFromApi,
} from "../../types/challenge";
import {
  CHALLENGE_BY_NODE,
  DOMAIN_SUBCHALLENGE_BTN,
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

function buildTaskBody(task: {
  type: string;
  points: number | null;
  max_points: number | null;
  min_points: number | null;
  decay: number | null;
}): string {
  const parts: string[] = [`Type: ${task.type}`];
  if (task.points != null) parts.push(`Points: ${task.points}`);
  if (task.type === "auto") {
    if (task.max_points != null) parts.push(`Max: ${task.max_points}`);
    if (task.min_points != null) parts.push(`Min: ${task.min_points}`);
    if (task.decay != null) parts.push(`Decay: ${task.decay}`);
  }
  return parts.join(" · ");
}

type ChallengeLocationState = {
  challengeId?: unknown;
  node?: unknown;
  editSubmission?: unknown;
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
  const { subChallengeId: subChallengeIdParam } = useParams<{
    subChallengeId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const locationState = location.state as ChallengeLocationState | null;

  const [submission, setSubmission] = useState("");
  const submissionFileRef = useRef<HTMLInputElement>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const dismissSubmitFeedback = useCallback(() => {
    setSubmitFeedback(null);
  }, []);

  useEffect(() => {
    if (!submitFeedback) return;
    const isWrong =
      submitFeedback.kind === "error" ||
      submitFeedback.message.trim() === "Incorrect flag submitted. Try again.";
    if (isWrong) playWrongAnswerVoice();
    else playCorrectAnswerVoice();
  }, [submitFeedback]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiChallenge, setApiChallenge] = useState<ChallengeDetailFromApi | null>(
    null,
  );

  const editContext = useMemo(() => {
    const raw = locationState?.editSubmission;
    if (!raw || typeof raw !== "object") return null;
    const x = raw as {
      id?: unknown;
      challenge_id?: unknown;
      sub_challenge_id?: unknown;
      content?: unknown;
      file_url?: unknown;
    };
    const id = Number(x.id);
    const challenge_id = Number(x.challenge_id);
    const sub_challenge_id = Number(x.sub_challenge_id);
    if (!Number.isFinite(id) || id < 1) return null;
    if (!Number.isFinite(challenge_id) || challenge_id < 1) return null;
    if (!Number.isFinite(sub_challenge_id) || sub_challenge_id < 1) return null;
    return {
      id,
      challenge_id,
      sub_challenge_id,
      content: typeof x.content === "string" ? x.content : "",
      file_url: typeof x.file_url === "string" ? x.file_url : null,
    };
  }, [locationState]);

  // Prefill when opening from My Submissions → Edit
  useEffect(() => {
    if (!editContext) return;
    // If route doesn't match the intended sub-challenge, don't clobber fields.
    const parsedSubId =
      subChallengeIdParam != null && subChallengeIdParam.trim() !== ""
        ? Number(subChallengeIdParam)
        : NaN;
    if (Number.isFinite(parsedSubId) && parsedSubId !== editContext.sub_challenge_id) {
      return;
    }
    setSubmission(editContext.content);
    setSubmissionFile(null);
    if (submissionFileRef.current) submissionFileRef.current.value = "";
  }, [editContext, subChallengeIdParam]);

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
    setSubmission("");
    setSubmissionFile(null);
    setSubmitFeedback(null);
    if (submissionFileRef.current) submissionFileRef.current.value = "";
  }, [challengeId, subChallengeIdParam]);

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

  const subs: SubChallengeFromApi[] = apiChallenge?.sub_challenges ?? [];
  const hasSubs = subs.length > 0;
  const parsedSubId =
    subChallengeIdParam != null && subChallengeIdParam.trim() !== ""
      ? Number(subChallengeIdParam)
      : NaN;

  if (
    subChallengeIdParam != null &&
    subChallengeIdParam.trim() !== "" &&
    !Number.isFinite(parsedSubId)
  ) {
    return <Navigate to="/challenge" replace state={location.state} />;
  }

  const activeSub =
    Number.isFinite(parsedSubId) && hasSubs
      ? subs.find((s) => s.id === parsedSubId)
      : undefined;

  if (
    subChallengeIdParam != null &&
    subChallengeIdParam.trim() !== "" &&
    apiChallenge
  ) {
    if (!hasSubs || !activeSub) {
      return <Navigate to="/challenge" replace state={location.state} />;
    }
  }

  const c = CHALLENGE_BY_NODE[domain];
  const theme = DOMAIN_THEME[domain];

  const zoneLabel =
    apiChallenge != null
      ? `STAGE ${apiChallenge.stage_id} · ${
          TRACK_LABEL[apiChallenge.track_id] ?? `TRACK ${apiChallenge.track_id}`
        }`
      : c.zoneLabel;

  /** Index: pick a sub-challenge before opening the task view */
  if (!subChallengeIdParam?.trim() && hasSubs && apiChallenge) {
    return (
      <>
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
            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 px-2 py-4 sm:px-4 md:px-6 md:py-6">
              <header className="flex flex-col items-center gap-2 text-center">
                <p
                  className="font-Shuriken text-[0.65rem] font-bold tracking-[0.22em] text-white/90 sm:text-xs"
                  style={{ textShadow: glow }}
                >
                  {zoneLabel}
                </p>
                <h1
                  className="font-Shuriken text-lg font-black tracking-[0.18em] text-white sm:text-xl md:text-2xl"
                  style={{ textShadow: glow }}
                >
                  {apiChallenge.title.toUpperCase()}
                </h1>
                <p className="max-w-xl font-Shuriken text-[0.65rem] leading-relaxed tracking-[0.1em] text-white/75 sm:text-xs">
                  {apiChallenge.description}
                </p>
              </header>

              <div
                className={[
                  "rounded-xl px-3 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-5 md:px-6",
                  theme.innerPanelClass,
                ].join(" ")}
              >
                <h2
                  className="font-Shuriken text-sm font-black tracking-[0.28em] sm:text-base"
                  style={{ color: theme.taskColor, textShadow: glow }}
                >
                  CHOOSE A CHALLENGE
                </h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {subs.map((sc) => {
                    const subBtn = DOMAIN_SUBCHALLENGE_BTN[domain];
                    return (
                      <li key={sc.id}>
                        <GameButton
                          type="button"
                          onClick={() =>
                            navigate(`/challenge/sub/${sc.id}`, {
                              state: location.state,
                            })
                          }
                          fullWidth
                          className="w-full min-w-0 !max-w-none"
                          outerBgClass={subBtn.outerBgClass}
                          bgClass={subBtn.bgClass}
                          fontClass={subBtn.fontClass}
                        >
                          <span className="line-clamp-2">{sc.title}</span>
                        </GameButton>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
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
          </BrandedShell>
        </motion.div>
      </>
    );
  }

  /** Parent challenge has no sub-challenges — nothing to submit */
  if (!subChallengeIdParam?.trim() && !hasSubs && apiChallenge) {
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
            "relative flex min-h-[min(40vh,360px)] flex-1 flex-col overflow-hidden",
            theme.shellBorder,
            theme.shellRing,
            "bg-linear-to-br! from-white/11! via-white/5! to-white/3!",
            "backdrop-blur-3xl backdrop-saturate-200",
          ].join(" ")}
        >
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
            <p className="font-Shuriken text-sm tracking-[0.14em] text-white/85">
              No sub-challenges are available for this challenge yet.
            </p>
            <GameButton
              to="/main"
              onClick={() => clearChallengeContext()}
              outerBgClass="bg-[#C5A059]"
              bgClass="!rounded-md border !border-[#333B36] bg-[#C5A059] !px-10 !py-2.5 hover:bg-[#b8924f]"
              fontClass="font-Shuriken text-xs font-black tracking-[0.35em] text-black md:text-sm"
            >
              HOME
            </GameButton>
          </div>
        </BrandedShell>
      </motion.div>
    );
  }

  if (!activeSub || !apiChallenge) {
    return <Navigate to="/main" replace />;
  }

  const domainTitle = activeSub.title.toUpperCase();
  const narrative = activeSub.description;
  const taskBody = buildTaskBody({
    type: activeSub.type,
    points: activeSub.points,
    max_points: activeSub.max_points,
    min_points: activeSub.min_points,
    decay: activeSub.decay,
  });

  const fileHref = resolveApiFileUrl(activeSub.file_url);
  const currentEditFileHref = resolveApiFileUrl(editContext?.file_url ?? null);

  const canSubmit =
    challengeId != null && apiChallenge != null && activeSub != null;

  async function handleSendSubmission() {
    if (!canSubmit || !apiChallenge || !activeSub) return;
    const content = submission.trim();
    if (!content) {
      setSubmitFeedback({
        kind: "error",
        message: "Enter your answer or flag (required).",
      });
      return;
    }
    setSubmitLoading(true);
    setSubmitFeedback(null);
    try {
      const parentChallengeId = activeSub.challenge_id ?? apiChallenge.id;
      const subChallengeId = activeSub.id;

      if (editContext && editContext.id) {
        await updateSubmissionMultipart({
          submission_id: editContext.id,
          challenge_id: parentChallengeId,
          sub_challenge_id: subChallengeId,
          content,
          file: submissionFile,
        });
        setSubmitFeedback({
          kind: "success",
          message: "Submission updated successfully.",
        });
      } else {
        if (submissionFile) {
          await createSubmissionMultipart({
            challenge_id: parentChallengeId,
            sub_challenge_id: subChallengeId,
            content,
            file: submissionFile,
          });
        } else {
          await createSubmissionJson({
            challenge_id: parentChallengeId,
            sub_challenge_id: subChallengeId,
            content,
          });
        }
        setSubmitFeedback({
          kind: "success",
          message: "Submission sent successfully.",
        });
      }
      setSubmission("");
      setSubmissionFile(null);
      if (submissionFileRef.current) submissionFileRef.current.value = "";
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "Could not send submission. Please try again.";
      setSubmitFeedback({ kind: "error", message });
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <>
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
          <div className="flex shrink-0 justify-start">
            <GameButton
              type="button"
              onClick={() =>
                navigate("/challenge", { state: location.state })
              }
              fullWidth={false}
              className="shrink-0"
              outerBgClass="bg-[#5a6b63]"
              bgClass="!rounded-md border !border-[#333B36] bg-[#5a6b63]/90 !px-6 !py-2 hover:bg-[#4a5a53]"
              fontClass="font-Shuriken text-[0.65rem] font-black tracking-[0.28em] text-white sm:text-xs"
            >
              ← BACK
            </GameButton>
          </div>

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
                <p className="mt-1 font-Shuriken text-[0.55rem] font-bold tracking-[0.14em] text-white/50 sm:text-[0.6rem]">
                  {apiChallenge.title}
                </p>
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
            {editContext ? (
              <div className="mb-4 rounded-xl border border-[#C5A059]/35 bg-black/30 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <p className="font-Shuriken text-[0.65rem] font-black tracking-[0.22em] text-[#C5A059]">
                  EDIT MODE
                </p>
                <p className="mt-1 font-Shuriken text-[0.65rem] tracking-[0.12em] text-white/70">
                  You are editing your latest pending submission.
                </p>
              </div>
            ) : null}

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

                {editContext && currentEditFileHref ? (
                  <a
                    href={currentEditFileHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-sm border border-white/15 bg-black/50 px-4 py-2 font-Shuriken text-[0.65rem] font-black tracking-[0.2em] text-white/85 underline-offset-2 hover:bg-black/70 hover:underline"
                  >
                    CURRENT SUBMISSION FILE
                  </a>
                ) : null}
              </div>

              {canSubmit ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer">
                      <input
                        ref={submissionFileRef}
                        type="file"
                        name="file"
                        className="sr-only"
                        accept=".pdf,application/pdf,application/zip,image/*"
                        disabled={submitLoading}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setSubmissionFile(f);
                        }}
                      />
                      <span
                        className={[
                          "inline-flex min-h-10 items-center justify-center rounded-sm border px-6 py-2",
                          "font-Shuriken text-xs font-black tracking-[0.35em] text-white transition-colors",
                          theme.fileBtnClass,
                          submitLoading ? "pointer-events-none opacity-60" : "",
                        ].join(" ")}
                      >
                        ATTACH FILE
                      </span>
                    </label>
                    {submissionFile ? (
                      <span className="font-Shuriken text-[0.65rem] tracking-[0.12em] text-white/80">
                        {submissionFile.name}
                      </span>
                    ) : null}
                  </div>

                  <label className="block">
                    <span className="sr-only">Submission</span>
                    <input
                      type="text"
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      placeholder="YOUR ANSWER OR FLAG (REQUIRED)"
                      disabled={submitLoading}
                      autoComplete="off"
                      className={[
                        "w-full rounded-sm border border-white/15 bg-black/55 px-4 py-3",
                        "font-Shuriken text-xs font-bold tracking-[0.12em] text-white placeholder:text-white/35",
                        "outline-none focus:ring-2 disabled:opacity-60",
                        theme.inputFocusClass,
                        "md:text-sm",
                      ].join(" ")}
                    />
                  </label>
                </>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              {canSubmit ? (
                <GameButton
                  type="button"
                  onClick={() => void handleSendSubmission()}
                  disabled={submitLoading}
                  fullWidth={false}
                  className="shrink-0"
                  outerBgClass="bg-[#76AF72]"
                  bgClass="!rounded-md border !border-[#333B36] bg-[#76AF72] !px-10 !py-2.5 hover:bg-[#5f8f5b]"
                  fontClass="font-Shuriken text-xs font-black tracking-[0.35em] text-black md:text-sm"
                >
                  {submitLoading ? "SENDING…" : editContext ? "UPDATE" : "SEND"}
                </GameButton>
              ) : null}
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
    <SubmissionFeedbackToast
      feedback={submitFeedback}
      onDismiss={dismissSubmitFeedback}
    />
    </>
  );
}
