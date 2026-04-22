import { Bell, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";

function formatStatus(status: string) {
  return status.replace(/_/g, " ").toUpperCase();
}

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

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!sseEnabled) return null;

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) markAllRead();
      return next;
    });
  };

  return (
    <div ref={rootRef} className="relative z-40 shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-md border border-[#333B36] bg-black/70 text-white shadow-[0_0_14px_rgba(57,255,20,0.15)] transition-colors hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/40 md:h-15 md:w-15"
      >
        <Bell className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#B52B2B] px-1 font-Shuriken text-[10px] font-black leading-none text-white ring-2 ring-black md:text-[11px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-[#333B36]/90 bg-[#0a0f0c]/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150"
          role="dialog"
          aria-label="Notifications list"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
            <span className="font-Shuriken text-xs font-black tracking-[0.14em] text-white">
              Alerts
            </span>
            <button
              type="button"
              onClick={() => clearAllNotifications()}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-Shuriken text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Clear all
            </button>
          </div>

          <div className="max-h-[min(55vh,320px)] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <p className="px-3 py-8 text-center font-Shuriken text-xs tracking-[0.12em] text-white/45">
                No notifications yet
              </p>
            ) : (
              <ul className="divide-y divide-white/10">
                {notifications.map((n) => (
                  <li key={n.id} className="px-3 py-3">
                    <p className="font-Shuriken text-[11px] font-bold leading-snug tracking-[0.08em] text-white/95">
                      {n.challenge_title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-Shuriken text-[10px] tracking-[0.14em] text-white/65">
                      <span>
                        Status:{" "}
                        <span className="text-[#39FF14]/90">
                          {formatStatus(n.status)}
                        </span>
                      </span>
                      {typeof n.score === "number" ? (
                        <span>
                          Score:{" "}
                          <span className="text-white/90">{n.score}</span>
                        </span>
                      ) : null}
                    </div>
                    {n.timestamp ? (
                      <p className="mt-1 font-Shuriken text-[9px] tracking-[0.1em] text-white/35">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
