import BrandedShell from "../../components/BrandedShell";
import FrostedPanel from "../../components/FrostedPanel";
import DashboardMapPanel from "./DashboardMapPanel";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApiError } from "../../lib/api/errors";
import { getMe } from "../../lib/auth/api";
import { getTeamScoresByTrack } from "../../lib/teams/api";
import {
  getAnnouncements,
  type AnnouncementFromApi,
} from "../../lib/announcements/api";

const GOLD = "#C5A059";

const TOTAL_PER_TRACK = 2500;

type SkillItem = { label: string; value: number; tone: "green" | "gold" };

function clampPct(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatAnnouncementDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  const [announcements, setAnnouncements] = useState<AnnouncementFromApi[]>([]);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<-1 | 1>(1);
  const [skills, setSkills] = useState<SkillItem[]>(() => [
    { label: "UIUX", value: 0, tone: "green" },
    { label: "PROBLEM SOLVING", value: 0, tone: "green" },
    { label: "GRAFIC DESIGN", value: 0, tone: "green" },
    { label: "CYBER SECURITY", value: 0, tone: "green" },
    { label: "AI", value: 0, tone: "green" },
    { label: "TEAM PROGRES", value: 0, tone: "gold" },
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getAnnouncements();
        if (cancelled) return;
        setAnnouncements(list);
        setAnnouncementsError(null);
        setIndex(0); // newest first
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof ApiError ? e.message : "Could not load announcements.";
        setAnnouncements([]);
        setAnnouncementsError(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        const tid = me.team_id;
        if (typeof tid !== "number" || !Number.isFinite(tid) || tid <= 0) {
          if (!cancelled) {
            setSkills((prev) =>
              prev.map((s) => ({ ...s, value: 0 })),
            );
          }
          return;
        }

        const scores = await getTeamScoresByTrack(tid);
        if (cancelled) return;

        const byKey: Record<"cs" | "ai" | "ps" | "gd" | "ux", number> = {
          cs: 0,
          ai: 0,
          ps: 0,
          gd: 0,
          ux: 0,
        };
        for (const t of scores.tracks ?? []) {
          const name = String(t.track_name ?? "").trim().toLowerCase();
          const total = Number(t.total_score) || 0;
          if (name === "cs") byKey.cs = total;
          else if (name === "ai" || name === "ia") byKey.ai = total;
          else if (name === "ps" || name === "problem solving") byKey.ps = total;
          else if (name === "gd") byKey.gd = total;
          else if (name === "ux" || name === "ui" || name === "uiux")
            byKey.ux = total;
        }

        const csPct = clampPct((byKey.cs / TOTAL_PER_TRACK) * 100);
        const aiPct = clampPct((byKey.ai / TOTAL_PER_TRACK) * 100);
        const psPct = clampPct((byKey.ps / TOTAL_PER_TRACK) * 100);
        const gdPct = clampPct((byKey.gd / TOTAL_PER_TRACK) * 100);
        const uxPct = clampPct((byKey.ux / TOTAL_PER_TRACK) * 100);
        const teamPct = clampPct(
          ((byKey.cs + byKey.ai + byKey.ps + byKey.gd + byKey.ux) /
            (TOTAL_PER_TRACK * 5)) *
            100,
        );

        setSkills([
          { label: "UIUX", value: uxPct, tone: "green" },
          { label: "PROBLEM SOLVING", value: psPct, tone: "green" },
          { label: "GRAFIC DESIGN", value: gdPct, tone: "green" },
          { label: "CYBER SECURITY", value: csPct, tone: "green" },
          { label: "AI", value: aiPct, tone: "green" },
          { label: "TEAM PROGRES", value: teamPct, tone: "gold" },
        ]);
      } catch {
        if (!cancelled) {
          setSkills((prev) => prev.map((s) => ({ ...s, value: 0 })));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(() => announcements[index] ?? null, [announcements, index]);
  const canGoPrev = index < announcements.length - 1;
  const canGoNext = index > 0;

  const goPrev = () => {
    if (!canGoPrev) return;
    setDir(1);
    setIndex((i) => Math.min(announcements.length - 1, i + 1));
  };

  const goNext = () => {
    if (!canGoNext) return;
    setDir(-1);
    setIndex((i) => Math.max(0, i - 1));
  };

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
            {skills.map((s) => (
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
          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className={[
                  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-sm transition",
                  "hover:bg-black/55 hover:text-white disabled:opacity-40 disabled:hover:bg-black/35",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                ].join(" ")}
                aria-label="Previous announcement"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.6} />
              </button>

              <div className="flex items-center gap-2">
                {announcements.length ? (
                  <span className="font-Shuriken text-[0.55rem] font-black tracking-[0.3em] text-white/65">
                    {index + 1}/{announcements.length}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className={[
                  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-sm transition",
                  "hover:bg-black/55 hover:text-white disabled:opacity-40 disabled:hover:bg-black/35",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                ].join(" ")}
                aria-label="Next (newer) announcement"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
              </button>
            </div>

            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current ? String(current.id) : announcementsError ?? "empty"}
                  initial={{ opacity: 0, x: dir * 26, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: dir * -26, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  drag={current ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    const threshold = 60;
                    if (info.offset.x > threshold) goPrev();
                    else if (info.offset.x < -threshold) goNext();
                  }}
                  className={[
                    "min-w-0 rounded-2xl border border-white/10 bg-black/35 px-3.5 py-3.5",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md",
                  ].join(" ")}
                >
                  {announcementsError ? (
                    <p className="text-left text-xs leading-relaxed tracking-wide text-red-100/90 md:text-sm">
                      {announcementsError}
                    </p>
                  ) : current ? (
                    <>
                      <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
                        <h3 className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] font-Shuriken text-sm font-black tracking-[0.16em] text-white/95 md:text-base">
                          {current.title}
                        </h3>
                        <div className="shrink-0 text-right">
                          <p className="font-Shuriken text-[0.55rem] font-black tracking-[0.22em] text-white/60">
                            {formatAnnouncementDate(current.created_at)}
                          </p>
                          <p className="font-Shuriken text-[0.55rem] font-black tracking-[0.22em] text-white/50">
                            {current.author_name ? `BY ${current.author_name}` : ""}
                          </p>
                        </div>
                      </div>
                      <p className="whitespace-pre-line break-words [overflow-wrap:anywhere] text-left text-xs leading-relaxed tracking-wide text-white/95 md:text-sm">
                        {current.content}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
                        <h3 className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] font-Shuriken text-sm font-black tracking-[0.16em] text-white/90 md:text-base">
                          Announcements will appear here
                        </h3>
                        <div className="shrink-0 text-right">
                          <p className="font-Shuriken text-[0.55rem] font-black tracking-[0.22em] text-white/50">
                            STAY TUNED
                          </p>
                        </div>
                      </div>
                      <p className="whitespace-pre-line break-words [overflow-wrap:anywhere] text-left text-xs leading-relaxed tracking-wide text-white/75 md:text-sm">
                        No announcements yet. When admins or mentors post updates, you’ll be able to swipe through them here.
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FrostedPanel>
      </motion.div>
    </>
  );
}
