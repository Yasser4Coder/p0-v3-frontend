import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LOGO_AT_CENTER_SIZE_PX,
  LOGO_CENTER_WIDTH_MULTIPLIER,
  LOGO_TO_CENTER_EASE,
  LOGO_TO_CENTER_MS,
  LOGO_TO_SLOT_MS,
  WELCOME_TO_LOGIN_GIF_MS,
} from "../config/welcomeLoginTransition";

export const HEADER_LOGO_ID = "header-p0-logo";

type StartOpts = {
  gifSrc: string;
  durationMs?: number;
};

type Phase = "idle" | "toCenter" | "playing" | "toSlot";

type CtxValue = {
  startWelcomeToLogin: (opts: StartOpts) => void;
  headerLogoSuppressed: boolean;
};

const WelcomeLoginTransitionContext = createContext<CtxValue | null>(null);

export function useWelcomeLoginTransition() {
  const ctx = useContext(WelcomeLoginTransitionContext);
  if (!ctx) {
    throw new Error(
      "useWelcomeLoginTransition must be used within WelcomeLoginTransitionProvider",
    );
  }
  return ctx;
}

export function useHeaderLogoSuppressed() {
  return (
    useContext(WelcomeLoginTransitionContext)?.headerLogoSuppressed ?? false
  );
}

export function WelcomeLoginTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [gifSrc, setGifSrc] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(WELCOME_TO_LOGIN_GIF_MS);
  const [startRect, setStartRect] = useState<DOMRect | null>(null);
  const [slotRect, setSlotRect] = useState<DOMRect | null>(null);
  const finishRef = useRef<() => void>(() => {});
  const transitionLockRef = useRef(false);

  const finish = useCallback(() => {
    setPhase("idle");
    setStartRect(null);
    setSlotRect(null);
    setGifSrc(null);
  }, []);

  finishRef.current = finish;

  const startWelcomeToLogin = useCallback((opts: StartOpts) => {
    if (transitionLockRef.current || phase !== "idle") return;
    const el = document.getElementById(HEADER_LOGO_ID);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;

    transitionLockRef.current = true;
    setStartRect(rect);
    setSlotRect(null);
    setGifSrc(opts.gifSrc);
    setDurationMs(opts.durationMs ?? WELCOME_TO_LOGIN_GIF_MS);
    setPhase("toCenter");
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") transitionLockRef.current = false;
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "toCenter") return;
    const t = setTimeout(() => setPhase("playing"), LOGO_TO_CENTER_MS * 1000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setTimeout(() => {
      navigate("/login", { state: { fromWelcomeTransition: true } });
      setPhase("toSlot");
    }, durationMs);
    return () => clearTimeout(t);
  }, [phase, durationMs, navigate]);

  useLayoutEffect(() => {
    if (phase !== "toSlot") return;
    if (location.pathname !== "/login") return;

    const measure = () => {
      const el = document.getElementById(HEADER_LOGO_ID);
      if (el) setSlotRect(el.getBoundingClientRect());
    };

    measure();
    const id = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(id);
  }, [phase, location.pathname]);

  useEffect(() => {
    if (phase !== "toSlot" || !slotRect) return;
    const t = setTimeout(
      () => finishRef.current(),
      LOGO_TO_SLOT_MS * 1000 + 80,
    );
    return () => clearTimeout(t);
  }, [phase, slotRect]);

  useEffect(() => {
    if (phase !== "toSlot" || slotRect) return;
    const t = setTimeout(() => finishRef.current(), 2500);
    return () => clearTimeout(t);
  }, [phase, slotRect]);

  const headerLogoSuppressed = phase !== "idle";

  const ctxValue: CtxValue = {
    startWelcomeToLogin,
    headerLogoSuppressed,
  };

  const centerSize = startRect
    ? Math.min(
        typeof window !== "undefined"
          ? Math.round(window.innerWidth * 0.88)
          : 320,
        Math.max(
          LOGO_AT_CENTER_SIZE_PX,
          Math.round(startRect.width * LOGO_CENTER_WIDTH_MULTIPLIER),
        ),
      )
    : LOGO_AT_CENTER_SIZE_PX;

  const atCenter = phase === "toCenter" || phase === "playing" || !slotRect;

  const overlay =
    phase !== "idle" && startRect ? (
      <div
        className="fixed inset-0 z-200 overflow-hidden bg-black"
        aria-hidden
      >
        {gifSrc ? (
          <motion.img
            src={gifSrc}
            alt=""
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}

        <div
          className="absolute inset-0 z-10 bg-black/25 backdrop-blur-[2px]"
          aria-hidden
        />

        <motion.img
          src="/Logo.svg"
          alt=""
          className="pointer-events-none fixed z-201"
          style={{ position: "fixed" }}
          initial={{
            top: startRect.top,
            left: startRect.left,
            width: startRect.width,
            height: startRect.height,
            x: 0,
            y: 0,
          }}
          animate={
            atCenter
              ? {
                  top: "50%",
                  left: "50%",
                  width: centerSize,
                  height: centerSize,
                  x: "-50%",
                  y: "-50%",
                }
              : {
                  top: slotRect!.top,
                  left: slotRect!.left,
                  width: slotRect!.width,
                  height: slotRect!.height,
                  x: 0,
                  y: 0,
                }
          }
          transition={{
            duration: atCenter
              ? phase === "toCenter"
                ? LOGO_TO_CENTER_MS
                : 0
              : LOGO_TO_SLOT_MS,
            ease:
              atCenter && phase === "toCenter"
                ? LOGO_TO_CENTER_EASE
                : [0.33, 1, 0.68, 1],
          }}
        />
      </div>
    ) : null;

  return (
    <WelcomeLoginTransitionContext.Provider value={ctxValue}>
      {children}
      {typeof document !== "undefined"
        ? createPortal(overlay, document.body)
        : null}
    </WelcomeLoginTransitionContext.Provider>
  );
}
