import { Bell, Inbox, Trash2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "../hooks/useNotifications";

function formatStatus(status: string) {
  return status.replace(/_/g, " ").toUpperCase();
}

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s === "accepted") {
    return "border-emerald-500/35 bg-emerald-500/15 text-emerald-200";
  }
  if (s === "rejected" || s === "declined") {
    return "border-red-400/35 bg-red-500/15 text-red-200";
  }
  return "border-white/15 bg-white/10 text-white/85";
}

type PanelCoords = { top: number; right: number; width: number };

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    clearAllNotifications,
    markAllRead,
    sseEnabled,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<PanelCoords | null>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 12;
    const maxW = Math.min(360, window.innerWidth - margin * 2);
    setCoords({
      top: rect.bottom + 10,
      right: Math.max(margin, window.innerWidth - rect.right),
      width: maxW,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => updatePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const root = rootRef.current;
      const panel = panelRef.current;
      const t = e.target as Node;
      if (root?.contains(t)) return;
      if (panel?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!sseEnabled) return null;

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) markAllRead();
      return next;
    });
  };

  const dropdown =
    open && coords ? (
      <div
        ref={panelRef}
        className="pointer-events-auto fixed z-[110] flex max-h-[min(70vh,420px)] flex-col overflow-hidden rounded-2xl border border-[#39FF14]/25 bg-[#050807]/97 shadow-[0_28px_80px_rgba(0,0,0,0.85),0_0_0_1px_rgba(57,255,20,0.08)] ring-1 ring-black/60 backdrop-blur-xl backdrop-saturate-150"
        style={{
          top: coords.top,
          right: coords.right,
          width: coords.width,
        }}
        role="dialog"
        aria-label="Notifications list"
      >
        <div className="relative shrink-0 border-b border-white/[0.08] bg-linear-to-r from-[#0d160f]/95 to-[#060a08]/95 px-4 py-3.5">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#39FF14]/45 to-transparent"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#39FF14]/30 bg-black/50 text-[#39FF14] shadow-[inset_0_1px_0_rgba(57,255,20,0.12)]">
                <Bell className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-Shuriken text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  Alerts
                </p>
                <p className="mt-0.5 font-Shuriken text-[10px] tracking-[0.08em] text-white/45">
                  Submission reviews
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAllNotifications();
              }}
              disabled={notifications.length === 0}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-Shuriken text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 transition-colors hover:border-red-400/35 hover:bg-red-500/10 hover:text-red-100 disabled:pointer-events-none disabled:opacity-30"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              Clear
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/35">
                <Inbox className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="font-Shuriken text-[11px] tracking-[0.14em] text-white/40">
                Nothing here yet
              </p>
              <p className="max-w-[14rem] font-Shuriken text-[10px] leading-relaxed tracking-[0.08em] text-white/28">
                You will see mentor reviews here as they arrive.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2 pb-1">
              {notifications.map((n) => (
                <li key={n.id}>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 transition-colors hover:bg-white/[0.05]">
                    <p className="font-Shuriken text-[11px] font-bold leading-snug tracking-[0.06em] text-white/95">
                      {n.challenge_title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 font-Shuriken text-[9px] font-black uppercase tracking-[0.14em] ${statusTone(n.status)}`}
                      >
                        {formatStatus(n.status)}
                      </span>
                      {typeof n.score === "number" ? (
                        <span className="font-Shuriken text-[10px] tracking-[0.12em] text-[#39FF14]/85">
                          Score ·{" "}
                          <span className="text-white">{n.score}</span>
                        </span>
                      ) : null}
                    </div>
                    {n.timestamp ? (
                      <p className="mt-2 font-Shuriken text-[9px] tracking-[0.06em] text-white/28">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#333B36] bg-black/75 text-white shadow-[0_0_18px_rgba(57,255,20,0.18)] transition-colors hover:border-[#39FF14]/40 hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/45 md:h-15 md:w-15"
      >
        <Bell className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#B52B2B] px-1 font-Shuriken text-[10px] font-black leading-none text-white ring-2 ring-black md:text-[11px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
