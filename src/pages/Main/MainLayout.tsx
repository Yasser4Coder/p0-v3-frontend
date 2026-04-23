import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  mainBg,
  mainCardsBg,
  mainNeedsBg,
  mainScoreboardBg,
  mainStatusBg,
  mainTimerBg,
  welcomeBg,
} from "../../assets/assets";
import DashboardSidebar from "../../components/DashboardSidebar";
import Header from "../../components/Header";
import MentorPanel from "../../components/MentorPanel";
import { ApiError } from "../../lib/api/errors";
import { getMe } from "../../lib/auth/api";
import { getAuthUser } from "../../lib/auth/storage";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Full-screen bg for `/main/*`. */
function mainDashboardBackground(pathname: string): string {
  const p = normalizePath(pathname);
  if (p === "/main/status") return mainStatusBg;
  if (p === "/main/cards") return mainCardsBg;
  if (p === "/main/score-board") return mainScoreboardBg;
  if (p === "/main/my-submissions") return mainBg;
  if (p === "/main/needs") return mainNeedsBg;
  if (p === "/main/timer") return mainTimerBg;
  if (p === "/main") return mainBg;
  return welcomeBg;
}

type MentorDock = {
  top: number;
  left: number;
  maxW: number;
  maxH: number;
};

const PANEL_GAP = 10;
const VIEW_MARGIN = 12;
const PANEL_MAX_W = 420;

function viewportVerticalBounds() {
  const vv = window.visualViewport;
  if (vv) {
    return {
      top: vv.offsetTop,
      bottom: vv.offsetTop + vv.height,
    };
  }
  return { top: 0, bottom: window.innerHeight };
}

/**
 * Shared dashboard chrome: background, header, sidebar, and child route content.
 * Background image follows the active child route (except mentor → welcome art).
 */
export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mentorPanelOpen, setMentorPanelOpen] = useState(false);
  const [mentorDock, setMentorDock] = useState<MentorDock | null>(null);
  const sidebarAnchorRef = useRef<HTMLDivElement>(null);
  const [userDisplayName, setUserDisplayName] = useState(
    () => getAuthUser()?.name ?? "PROFILE",
  );

  useEffect(() => {
    setMentorPanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) setUserDisplayName(me.name);
      } catch (err) {
        if (err instanceof ApiError && err.kind === "unauthorized") {
          navigate("/login", { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const backgroundImage = useMemo(
    () => mainDashboardBackground(pathname),
    [pathname],
  );

  const measureMentorDock = useCallback(() => {
    const el = sidebarAnchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const isLg = window.matchMedia("(min-width: 1024px)").matches;
    const { top: viewTop, bottom: viewBottom } = viewportVerticalBounds();
    const margin = VIEW_MARGIN;
    const bottomLimit = viewBottom - margin;
    const safeTop = viewTop + margin;
    const usableHeight = Math.max(0, bottomLimit - safeTop);

    let top: number;
    let left: number;
    let maxW: number;

    if (isLg) {
      left = r.right + PANEL_GAP;
      maxW = Math.min(
        PANEL_MAX_W,
        Math.max(280, window.innerWidth - left - margin),
      );
      top = r.top;
    } else {
      top = r.bottom + PANEL_GAP;
      left = margin;
      maxW = Math.max(260, window.innerWidth - margin * 2);
    }

    // Never force a min height larger than the viewport (old Math.max(200, …) broke short screens).
    let maxH = Math.max(0, bottomLimit - top);
    const comfortTarget = Math.min(320, usableHeight);
    if (maxH < comfortTarget && usableHeight > 72) {
      const targetH = Math.min(comfortTarget, usableHeight);
      const idealTop = bottomLimit - targetH;
      top = Math.max(safeTop, Math.min(top, idealTop));
      maxH = Math.max(0, bottomLimit - top);
    }

    setMentorDock({ top, left, maxW, maxH });
  }, []);

  useLayoutEffect(() => {
    if (!mentorPanelOpen) {
      setMentorDock(null);
      return;
    }
    measureMentorDock();
    const ro = new ResizeObserver(measureMentorDock);
    if (sidebarAnchorRef.current) {
      ro.observe(sidebarAnchorRef.current);
    }
    window.addEventListener("resize", measureMentorDock);
    window.addEventListener("scroll", measureMentorDock, true);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", measureMentorDock);
    vv?.addEventListener("scroll", measureMentorDock);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureMentorDock);
      window.removeEventListener("scroll", measureMentorDock, true);
      vv?.removeEventListener("resize", measureMentorDock);
      vv?.removeEventListener("scroll", measureMentorDock);
    };
  }, [mentorPanelOpen, measureMentorDock]);

  return (
    <div
      className="min-h-screen font-Shuriken uppercase tracking-wide text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="min-h-screen bg-black/55 backdrop-blur-[1px]">
        <div className="pt-6 md:pt-8">
          <Header variant="dashboard" userDisplayName={userDisplayName} />
        </div>

        <div className="mx-4 flex flex-col gap-4 px-4 pb-8 pt-5 lg:flex-row lg:items-stretch lg:gap-5 lg:px-8 lg:pt-6">
          <motion.div
            ref={sidebarAnchorRef}
            className="w-full max-w-52 shrink-0 md:max-w-56"
            initial={{ opacity: 0, x: -26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <DashboardSidebar
              mentorPanelOpen={mentorPanelOpen}
              onMentorToggle={() => setMentorPanelOpen((o) => !o)}
            />
          </motion.div>
          <div className="relative flex min-h-[min(40vh,280px)] min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                className="flex w-full min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {mentorPanelOpen && mentorDock ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[55] cursor-default bg-black/50 backdrop-blur-[1px]"
              aria-label="Close mentor panel"
              onClick={() => setMentorPanelOpen(false)}
            />
            <div
              className="fixed z-[70] min-h-0 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
              style={{
                top: mentorDock.top,
                left: mentorDock.left,
                width: mentorDock.maxW,
                maxHeight: mentorDock.maxH,
              }}
            >
              <MentorPanel onClose={() => setMentorPanelOpen(false)} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
