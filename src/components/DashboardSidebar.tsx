import { matchPath, useLocation } from "react-router-dom";
import { splashBg } from "../assets/assets";
import BrandedShell from "./BrandedShell";
import GameButton from "./GameButton";

export const DASHBOARD_NAV_ITEMS = [
  "HOME",
  "STATUS",
  "CARDS",
  "SCORE BOARD",
  "MY SUBMISSIONS",
  "MENTOR",
  "NEEDS",
  "TIMER",
] as const;

export type DashboardNavId = (typeof DASHBOARD_NAV_ITEMS)[number];

/** Full path for each sidebar item (nested under `/main`). MENTOR opens overlay, not a route. */
export const DASHBOARD_NAV_ROUTES: Record<DashboardNavId, string | null> = {
  HOME: "/main",
  STATUS: "/main/status",
  CARDS: "/main/cards",
  "SCORE BOARD": "/main/score-board",
  "MY SUBMISSIONS": "/main/my-submissions",
  MENTOR: null,
  NEEDS: "/main/needs",
  TIMER: "/main/timer",
};

/** Longer paths first so `/main` only matches the dashboard home index. */
const MATCH_ORDER: { path: string; id: DashboardNavId }[] = [
  { path: "/main/my-submissions", id: "MY SUBMISSIONS" },
  { path: "/main/score-board", id: "SCORE BOARD" },
  { path: "/main/status", id: "STATUS" },
  { path: "/main/cards", id: "CARDS" },
  { path: "/main/needs", id: "NEEDS" },
  { path: "/main/timer", id: "TIMER" },
  { path: "/main", id: "HOME" },
];

export function dashboardSidebarActiveId(pathname: string): DashboardNavId {
  for (const { path, id } of MATCH_ORDER) {
    if (matchPath({ path, end: true }, pathname)) {
      return id;
    }
  }
  return "HOME";
}

function SidebarNavItem({
  label,
  active,
  to,
  onClick,
}: {
  label: DashboardNavId;
  active: boolean;
  to: string | null;
  onClick?: () => void;
}) {
  return (
    <GameButton
      type="button"
      to={to ?? undefined}
      onClick={onClick}
      aria-current={to != null && active ? "page" : undefined}
      aria-expanded={label === "MENTOR" ? active : undefined}
      className={[
        "w-full p-[3px]! [&>div]:flex [&>div]:min-h-11 [&>div]:w-full [&>div]:items-center [&>div]:justify-center md:[&>div]:min-h-12",
        active
          ? "ring-1 ring-[#C5A059]/90 ring-offset-2 ring-offset-black/40"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      outerBgClass={active ? "bg-[#C5A059]" : "bg-[#030806]"}
      bgClass={
        active
          ? "!rounded-sm border-black! bg-[#C5A059] shadow-[inset_3px_0_0_0_rgba(0,0,0,0.25)] hover:bg-[#b8924f]"
          : "!rounded-sm border! border-[#333B36]/20! bg-[#0b1510] hover:border-[#39FF14]/40 hover:bg-[#0f1c14]"
      }
      fontClass={
        active
          ? "!px-2 !py-2.5 text-center text-[0.65rem] font-black leading-tight tracking-[0.12em] text-black sm:!px-3 sm:text-xs md:!py-3 md:text-sm md:tracking-[0.16em]"
          : "!px-2 !py-2.5 text-center text-[0.65rem] font-bold leading-tight tracking-[0.12em] text-white/90 sm:!px-3 sm:text-xs md:!py-3 md:text-sm md:tracking-[0.16em]"
      }
    >
      {label}
    </GameButton>
  );
}

export type DashboardSidebarProps = {
  className?: string;
  mentorPanelOpen?: boolean;
  onMentorToggle?: () => void;
};

/**
 * Dashboard left rail. Nav items link to `/main/...` except MENTOR (overlay toggle).
 */
export default function DashboardSidebar({
  className,
  mentorPanelOpen = false,
  onMentorToggle,
}: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const routeActiveId = dashboardSidebarActiveId(pathname);

  return (
    <BrandedShell
      compact
      className={[
        mentorPanelOpen
          ? "relative z-[60] isolate w-full max-w-52 shrink-0 overflow-hidden md:max-w-56"
          : "relative z-30 isolate w-full max-w-52 shrink-0 overflow-hidden md:max-w-56",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${splashBg})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/50"
        aria-hidden
      />
      <nav
        aria-label="Main navigation"
        className="pointer-events-auto relative z-10 flex flex-col gap-1.5 md:gap-2"
      >
        {DASHBOARD_NAV_ITEMS.map((item) => {
          if (item === "MENTOR") {
            return (
              <SidebarNavItem
                key={item}
                label={item}
                active={mentorPanelOpen}
                to={null}
                onClick={onMentorToggle}
              />
            );
          }
          return (
            <SidebarNavItem
              key={item}
              label={item}
              active={routeActiveId === item}
              to={DASHBOARD_NAV_ROUTES[item]}
            />
          );
        })}
      </nav>
    </BrandedShell>
  );
}
