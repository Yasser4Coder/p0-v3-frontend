import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import type { MentorId, MentorRowConfig } from "./mentorTypes";
import { ApiError } from "../lib/api/errors";
import { createNeed } from "../lib/needs/api";
import { getMe } from "../lib/auth/api";
import { getAuthUser } from "../lib/auth/storage";
import { getTracks, type Track } from "../lib/tracks/api";

export type MentorMessagePayload = {
  mentorId: MentorId;
  mentorLabel: string;
  title: string;
  message: string;
};

type Theme = {
  headline: string;
  /** Primary accent (borders, glow). */
  accent: string;
  /** Softer tint for gradients / panels. */
  soft: string;
  /** Textarea focus / inner highlight. */
  glow: string;
};

const THEMES: Record<MentorId, Theme> = {
  cs: {
    headline: "CS mentor",
    accent: "#22c55e",
    soft: "#14532d",
    glow: "#4ade80",
  },
  ps: {
    headline: "Problem solving",
    accent: "#ef4444",
    soft: "#7f1d1d",
    glow: "#fca5a5",
  },
  ai: {
    headline: "AI mentor",
    accent: "#38bdf8",
    soft: "#0c4a6e",
    glow: "#7dd3fc",
  },
  ux: {
    headline: "UI / UX mentor",
    accent: "#c084fc",
    soft: "#581c87",
    glow: "#e9d5ff",
  },
  gd: {
    headline: "Design mentor",
    accent: "#eab308",
    soft: "#713f12",
    glow: "#fde047",
  },
};

/** Maps mentor row → track name as returned by GET /api/tracks */
const MENTOR_TRACK_NAME: Record<MentorId, string> = {
  cs: "CS",
  ps: "PS",
  ai: "AI",
  ux: "UX",
  gd: "GD",
};

type MentorMessageModalProps = {
  mentor: MentorRowConfig;
  onClose: () => void;
  /** Optional hook for analytics / extra handling after a successful send. */
  onSend?: (payload: MentorMessagePayload) => void;
};

export default function MentorMessageModal({
  mentor,
  onClose,
  onSend,
}: MentorMessageModalProps) {
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[] | null>(null);

  const theme = THEMES[mentor.id];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTracksLoading(true);
      setError("");
      try {
        const list = await getTracks();
        if (!cancelled) setTracks(list);
      } catch {
        if (!cancelled) {
          setTracks(null);
          setError("Could not load tracks. Please try again.");
        }
      } finally {
        if (!cancelled) setTracksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = useCallback(async () => {
    const t = title.trim();
    const message = body.trim();
    if (!t || !message || isSending || tracksLoading || !tracks?.length) return;

    setError("");
    setIsSending(true);
    try {
      let teamId = getAuthUser()?.team_id;
      if (teamId == null) {
        const me = await getMe();
        teamId = me.team_id;
      }
      if (teamId == null) {
        throw new ApiError({
          kind: "bad_request",
          message: "Could not find your team. Please re-login.",
        });
      }

      const wantName = MENTOR_TRACK_NAME[mentor.id].toUpperCase();
      const track = tracks.find((tr) => tr.name.toUpperCase() === wantName);
      if (!track) {
        throw new ApiError({
          kind: "bad_request",
          message: `No track found for “${wantName}”.`,
        });
      }

      await createNeed({
        title: t,
        description: message,
        team_id: String(teamId),
        track_id: String(track.id),
        type: "mentor",
      });

      onSend?.({
        mentorId: mentor.id,
        mentorLabel: mentor.label,
        title: t,
        message,
      });
      setSent(true);
      setTitle("");
      setBody("");
      window.setTimeout(() => setSent(false), 2600);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not send message. Please try again.";
      setError(msg);
    } finally {
      setIsSending(false);
    }
  }, [title, body, mentor, onSend, isSending, tracksLoading, tracks]);

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close message modal"
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.65)]"
        style={{
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: theme.accent,
          boxShadow: `0 0 48px ${theme.accent}40, inset 0 1px 0 ${theme.glow}33`,
        }}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <div
          className="relative flex items-center gap-3 border-b px-4 py-3 sm:gap-4 sm:px-5 sm:py-4"
          style={{
            borderColor: `${theme.accent}55`,
            background: `linear-gradient(135deg, ${theme.soft}ee 0%, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.97) 100%)`,
          }}
        >
          <div
            className="relative h-12 w-11 shrink-0 overflow-hidden rounded-md border-2 sm:h-14 sm:w-12"
            style={{ borderColor: theme.accent }}
          >
            <img src={mentor.avatar} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-Shuriken text-sm font-black tracking-[0.14em] text-white sm:text-base"
              style={{ textShadow: `0 0 18px ${theme.glow}55` }}
            >
              {theme.headline}
            </h2>
            <p id={descId} className="mt-0.5 font-Shuriken text-[10px] tracking-[0.12em] text-white/70">
              Send a message — your mentor will route it when the channel is live.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/20 bg-black/40 p-2 text-white/85 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <div
          className="space-y-3 px-4 py-4 sm:space-y-4 sm:px-5 sm:py-5"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, ${theme.soft}38 100%)`,
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            Title for {theme.headline}
          </label>
          <input
            id={inputId}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Message title…"
            className="font-Shuriken w-full rounded-xl border bg-black/55 px-3 py-2.5 text-[13px] leading-relaxed tracking-wide text-white placeholder:text-white/35 focus:outline-none sm:px-4 sm:text-sm"
            style={{
              borderColor: `${theme.accent}66`,
              boxShadow: `inset 0 0 24px ${theme.soft}33`,
            }}
          />

          <label htmlFor={`mentor-msg-${mentor.id}`} className="sr-only">
            Message to {theme.headline}
          </label>
          <textarea
            id={`mentor-msg-${mentor.id}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Write your question or note…"
            className="font-Shuriken min-h-[120px] w-full resize-y rounded-xl border bg-black/55 px-3 py-2.5 text-[13px] leading-relaxed tracking-wide text-white placeholder:text-white/35 focus:outline-none sm:min-h-[140px] sm:px-4 sm:text-sm"
            style={{
              borderColor: `${theme.accent}66`,
              boxShadow: `inset 0 0 24px ${theme.soft}44`,
            }}
          />

          {error ? (
            <p
              className="font-Shuriken rounded-lg border border-red-500/35 bg-red-950/35 px-3 py-2 text-center text-[11px] font-bold tracking-[0.08em] text-red-200 sm:text-xs"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {sent ? (
            <p
              className="font-Shuriken rounded-lg border px-3 py-2 text-center text-[11px] font-bold tracking-[0.12em] text-white sm:text-xs"
              style={{
                borderColor: `${theme.accent}77`,
                backgroundColor: `${theme.soft}99`,
                color: theme.glow,
              }}
              role="status"
            >
              Message sent.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/25 bg-transparent px-4 py-2 font-Shuriken text-[11px] font-bold tracking-[0.14em] text-white/85 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={
                !title.trim() ||
                !body.trim() ||
                isSending ||
                tracksLoading ||
                !tracks?.length
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-Shuriken text-[11px] font-black tracking-[0.12em] text-black shadow-inner transition disabled:cursor-not-allowed disabled:opacity-45 sm:text-xs"
              style={{
                borderColor: `${theme.accent}aa`,
                background: `linear-gradient(180deg, ${theme.glow} 0%, ${theme.accent} 100%)`,
                boxShadow: `0 4px 20px ${theme.accent}44`,
              }}
            >
              <Send className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              {isSending ? "Sending…" : "Send message"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
