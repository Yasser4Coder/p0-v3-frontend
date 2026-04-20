import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function isFullscreenActive(): boolean {
  return Boolean(
    document.fullscreenElement ??
      (
        document as Document & {
          webkitFullscreenElement?: Element | null;
        }
      ).webkitFullscreenElement,
  );
}

async function requestDocumentFullscreen(): Promise<boolean> {
  const root = document.documentElement;
  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen();
      return true;
    }
    const wk = (
      root as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      }
    ).webkitRequestFullscreen;
    if (wk) {
      await wk.call(root);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function exitDocumentFullscreen(): Promise<void> {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (
      (
        document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void;
        }
      ).webkitExitFullscreen
    ) {
      await (
        document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void;
        }
      ).webkitExitFullscreen?.();
    }
  } catch {
    /* ignore */
  }
}

/**
 * Small floating control — fixed bottom-right so it doesn’t compete with the header.
 */
export default function FullscreenCornerHint() {
  const [fs, setFs] = useState(() => isFullscreenActive());
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const sync = () => setFs(isFullscreenActive());
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener(
        "webkitfullscreenchange",
        sync as EventListener,
      );
    };
  }, []);

  const onEnter = useCallback(async () => {
    setUnsupported(false);
    const ok = await requestDocumentFullscreen();
    if (!ok) setUnsupported(true);
  }, []);

  const onExit = useCallback(async () => {
    setUnsupported(false);
    await exitDocumentFullscreen();
  }, []);

  const unsupportedTitle =
    "Full screen isn’t available in this browser. Try Chrome or Edge on desktop, or Add to Home Screen on mobile.";

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[100] flex max-w-[min(100vw-1.5rem,280px)] flex-col items-end gap-1 sm:bottom-4 sm:right-4"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <div
        className="pointer-events-auto flex cursor-default items-center gap-1.5 rounded-full border border-white/18 bg-black/70 py-1 pl-2 pr-1 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-2 sm:pl-2.5 sm:pr-1.5"
        role="toolbar"
        aria-label="Full screen controls"
      >
        {fs ? (
          <>
            <span className="font-Shuriken hidden text-[10px] font-bold tracking-[0.08em] text-white/75 sm:inline sm:text-[11px]">
              <kbd className="rounded border border-white/20 bg-white/10 px-1 py-px font-mono">
                Esc
              </kbd>
            </span>
            <button
              type="button"
              onClick={onExit}
              className="font-Shuriken inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#C5A059]/40 bg-[#3d2020]/95 px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-[#f0e6c8] hover:bg-[#4d2a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] sm:text-[11px]"
            >
              <Minimize2 className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2.5} />
              Exit
            </button>
          </>
        ) : (
          <>
            <Maximize2
              className="h-3 w-3 shrink-0 text-[#d4c49a] opacity-90 sm:h-3.5 sm:w-3.5"
              strokeWidth={2.2}
              aria-hidden
            />
            <span className="font-Shuriken max-w-[9.5rem] truncate text-[10px] leading-tight tracking-[0.06em] text-white/82 sm:max-w-none sm:text-[11px]">
              Full screen
            </span>
            <button
              type="button"
              onClick={onEnter}
              title={unsupported ? unsupportedTitle : undefined}
              className="font-Shuriken shrink-0 cursor-pointer rounded-full bg-linear-to-b from-[#8B2323] to-[#5c1818] px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] sm:text-[11px]"
            >
              Go
            </button>
          </>
        )}
      </div>
      {unsupported && !fs ? (
        <p
          className="pointer-events-auto rounded-md border border-amber-500/35 bg-black/75 px-2 py-1 font-Shuriken text-[9px] leading-snug tracking-wide text-amber-100/95 shadow-md backdrop-blur-sm sm:text-[10px]"
          role="status"
        >
          Full screen unavailable here — try Chrome/Edge or Add to Home Screen.
        </p>
      ) : null}
    </div>
  );
}
