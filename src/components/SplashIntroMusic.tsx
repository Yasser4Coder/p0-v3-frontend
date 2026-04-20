import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { splashIntroMusic } from "../assets/splashCritical";

const MUTE_STORAGE_KEY = "p0-splash-intro-muted";

/**
 * Splash-only intro track + bottom-left mute chip (mirrors `FullscreenCornerHint` styling).
 */
export default function SplashIntroMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio(splashIntroMusic);
    audio.loop = false;
    audio.preload = "auto";
    audioRef.current = audio;

    const tryPlay = async () => {
      try {
        await audio.play();
        setAutoPlayBlocked(false);
      } catch {
        setAutoPlayBlocked(true);
      }
    };

    audio.addEventListener("canplay", () => void tryPlay(), { once: true });
    audio.load();

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = muted ? 0 : 0.48;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [muted]);

  const resumePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play().then(() => setAutoPlayBlocked(false)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!autoPlayBlocked) return;
    const onFirstGesture = () => {
      resumePlayback();
      document.removeEventListener("pointerdown", onFirstGesture);
    };
    document.addEventListener("pointerdown", onFirstGesture);
    return () => document.removeEventListener("pointerdown", onFirstGesture);
  }, [autoPlayBlocked, resumePlayback]);

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[100] flex max-w-[min(100vw-1.5rem,280px)] flex-col items-start gap-1 sm:bottom-4 sm:left-4"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
      }}
    >
      <div
        className="pointer-events-auto flex cursor-default items-center gap-1.5 rounded-full border border-white/18 bg-black/70 py-1 pl-2 pr-1 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-2 sm:pl-2.5 sm:pr-1.5"
        role="toolbar"
        aria-label="Intro music"
      >
        {muted ? (
          <VolumeX
            className="h-3 w-3 shrink-0 text-white/55 sm:h-3.5 sm:w-3.5"
            strokeWidth={2.2}
            aria-hidden
          />
        ) : (
          <Volume2
            className="h-3 w-3 shrink-0 text-[#d4c49a] opacity-90 sm:h-3.5 sm:w-3.5"
            strokeWidth={2.2}
            aria-hidden
          />
        )}
        <span className="font-Shuriken max-w-[6rem] truncate text-[10px] leading-tight tracking-[0.06em] text-white/82 sm:max-w-none sm:text-[11px]">
          Intro music
        </span>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="font-Shuriken shrink-0 cursor-pointer rounded-full bg-linear-to-b from-[#8B2323] to-[#5c1818] px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] sm:text-[11px]"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
      {autoPlayBlocked ? (
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <p className="rounded-md border border-amber-500/35 bg-black/75 px-2 py-1 font-Shuriken text-[9px] leading-snug tracking-wide text-amber-100/95 shadow-md backdrop-blur-sm sm:text-[10px]">
            Tap Play if audio didn&apos;t start (browser autoplay).
          </p>
          <button
            type="button"
            onClick={resumePlayback}
            className="font-Shuriken cursor-pointer rounded-full border border-[#C5A059]/50 bg-linear-to-b from-[#8B2323] to-[#5c1818] px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
          >
            Play
          </button>
        </div>
      ) : null}
    </div>
  );
}
