import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import BrandedShell from "../../components/BrandedShell";
import GameButton from "../../components/GameButton";
import { ApiError } from "../../lib/api/errors";
import { getMySubmissions } from "../../lib/submissions/api";
import { resolveApiFileUrl } from "../../lib/resolveFileUrl";
import type { MySubmission, SubmissionStatus } from "../../types/submission";

const GOLD = "#C5A059";
const glow =
  "0 0 12px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.18)";

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusMeta(status: SubmissionStatus) {
  const s = String(status).toLowerCase();
  if (s === "accepted") {
    return {
      label: "ACCEPTED",
      chip: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
      icon: CheckCircle2,
    };
  }
  if (s === "rejected") {
    return {
      label: "REJECTED",
      chip: "border-red-400/30 bg-red-500/12 text-red-200",
      icon: XCircle,
    };
  }
  return {
    label: s === "pending" ? "PENDING" : String(status).toUpperCase(),
    chip: "border-white/15 bg-white/8 text-white/80",
    icon: Clock3,
  };
}

export default function MainMySubmissionsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const list = await getMySubmissions();
        if (cancelled) return;
        setItems(list);
      } catch (e) {
        if (cancelled) return;
        setItems([]);
        setError(
          e instanceof ApiError ? e.message : "Could not load submissions.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const empty = useMemo(() => !loading && !error && items.length === 0, [
    loading,
    error,
    items.length,
  ]);

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
          "md:min-h-[min(62vh,600px)]",
        ].join(" ")}
      >
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 md:gap-5">
          <div className="px-3 pt-5 md:px-6 md:pt-7">
            <h1
              className="mx-auto w-fit rounded-none border-2 border-white px-5 py-2.5 text-center font-Shuriken text-xl font-black tracking-[0.28em] text-white md:px-7 md:py-3 md:text-2xl lg:px-8 lg:text-3xl"
              style={{ textShadow: glow }}
            >
              MY SUBMISSIONS
            </h1>
            <p
              className="mx-auto mt-3 max-w-2xl px-2 text-center font-Shuriken text-xs font-bold normal-case leading-relaxed tracking-[0.08em] text-white/90 md:text-sm md:tracking-[0.12em]"
              style={{ textShadow: glow }}
            >
              Track your latest attempts and review results here.
            </p>
          </div>

          <div className="min-h-0 flex-1 px-3 pb-6 md:px-6 md:pb-8">
            <div className="h-full min-h-0 rounded-2xl border border-white/10 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 md:px-5">
                <h2
                  className="font-Shuriken text-sm font-black tracking-[0.25em] text-white"
                  style={{ color: GOLD, textShadow: glow }}
                >
                  HISTORY
                </h2>
                <span className="font-Shuriken text-[0.65rem] font-black tracking-[0.18em] text-white/60">
                  {loading ? "LOADING…" : `${items.length} ITEMS`}
                </span>
              </div>

              <div className="min-h-0 overflow-y-auto overscroll-contain p-2 md:p-3">
                {loading ? (
                  <p className="px-3 py-10 text-center font-Shuriken text-xs tracking-[0.18em] text-white/70">
                    Loading submissions…
                  </p>
                ) : error ? (
                  <div className="px-3 py-10 text-center">
                    <p className="font-Shuriken text-xs tracking-[0.14em] text-red-200/90">
                      {error}
                    </p>
                    <div className="mt-5 flex justify-center">
                      <GameButton
                        type="button"
                        onClick={() => window.location.reload()}
                        fullWidth={false}
                        outerBgClass="bg-[#C5A059]"
                        bgClass="!rounded-md border !border-[#333B36] bg-[#C5A059] !px-8 !py-2.5 hover:bg-[#b8924f]"
                        fontClass="font-Shuriken text-xs font-black tracking-[0.28em] text-black"
                      >
                        RETRY
                      </GameButton>
                    </div>
                  </div>
                ) : empty ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-3 py-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/40">
                      <FileText className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                    <p className="font-Shuriken text-xs tracking-[0.18em] text-white/70">
                      No submissions yet
                    </p>
                    <p className="max-w-sm font-Shuriken text-[0.65rem] normal-case leading-relaxed tracking-normal text-white/45">
                      Submit a solution from a sub-challenge and it will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {items.map((s) => {
                      const meta = statusMeta(s.status);
                      const Icon = meta.icon;
                      const fileHref = resolveApiFileUrl(s.file_url);
                      const title = s.sub_challenge_title ?? s.challenge_title;
                      const subtitle =
                        s.sub_challenge_title != null ? s.challenge_title : null;
                      const pending =
                        String(s.status).toLowerCase() === "pending";
                      return (
                        <li
                          key={s.id}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.chip}`}
                              aria-hidden
                            >
                              <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                                <p className="min-w-0 flex-1 truncate font-Shuriken text-[11px] font-black tracking-[0.12em] text-white/95 md:text-xs">
                                  {title}
                                </p>
                                <span
                                  className={`shrink-0 rounded-md border px-2 py-0.5 font-Shuriken text-[9px] font-black tracking-[0.14em] ${meta.chip}`}
                                >
                                  {meta.label}
                                </span>
                              </div>
                              {subtitle ? (
                                <p className="mt-1 truncate font-Shuriken text-[10px] tracking-[0.12em] text-white/45">
                                  {subtitle}
                                </p>
                              ) : null}

                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-Shuriken text-[10px] tracking-[0.12em] text-white/60">
                                <span>
                                  Score:{" "}
                                  <span className="tabular-nums text-white/85">
                                    {typeof s.score === "number" ? s.score : "—"}
                                  </span>
                                </span>
                                <span>
                                  {formatCreatedAt(s.created_at)}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <GameButton
                                  type="button"
                                  onClick={() =>
                                    s.sub_challenge_id
                                      ? navigate(
                                          `/challenge/sub/${s.sub_challenge_id}`,
                                          { state: { challengeId: s.challenge_id } },
                                        )
                                      : navigate("/challenge", {
                                          state: { challengeId: s.challenge_id },
                                        })
                                  }
                                  fullWidth={false}
                                  outerBgClass="bg-[#76AF72]"
                                  bgClass="!rounded-md border !border-[#333B36] bg-[#76AF72] !px-6 !py-2 hover:bg-[#5f8f5b]"
                                  fontClass="font-Shuriken text-[0.65rem] font-black tracking-[0.22em] text-black"
                                >
                                  OPEN
                                </GameButton>

                                {pending && s.sub_challenge_id ? (
                                  <GameButton
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/challenge/sub/${s.sub_challenge_id}`,
                                        {
                                          state: {
                                            challengeId: s.challenge_id,
                                            editSubmission: {
                                              id: s.id,
                                              challenge_id: s.challenge_id,
                                              sub_challenge_id: s.sub_challenge_id,
                                              content: s.content,
                                              file_url: s.file_url,
                                            },
                                          },
                                        },
                                      )
                                    }
                                    fullWidth={false}
                                    outerBgClass="bg-[#C5A059]"
                                    bgClass="!rounded-md border !border-[#333B36] bg-[#C5A059] !px-6 !py-2 hover:bg-[#b8924f]"
                                    fontClass="font-Shuriken text-[0.65rem] font-black tracking-[0.22em] text-black"
                                  >
                                    EDIT
                                  </GameButton>
                                ) : null}

                                {fileHref ? (
                                  <a
                                    href={fileHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/15 bg-black/45 px-4 py-2 font-Shuriken text-[0.65rem] font-black tracking-[0.16em] text-white/90 underline-offset-2 hover:bg-black/65 hover:underline"
                                  >
                                    FILE
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </BrandedShell>
    </motion.div>
  );
}

