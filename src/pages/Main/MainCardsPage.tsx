import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { backOfCard, bookImg } from "../../assets/assets";
import BrandedShell from "../../components/BrandedShell";

const CARD_COUNT = 6;

const glow =
  "0 0 12px rgba(255,255,255,0.35), 0 0 28px rgba(255,255,255,0.12)";

/** Visible height: 2 full rows + gaps + half of the 3rd row (phone-style peek). */
function measurePeekHeight(gridEl: HTMLElement): number | undefined {
  const cell = gridEl.querySelector<HTMLElement>("[data-card-cell]");
  if (!cell) return undefined;
  const h = cell.getBoundingClientRect().height;
  if (h < 8) return undefined;
  const cs = getComputedStyle(gridEl);
  const rowGap = Number.parseFloat(cs.rowGap) || Number.parseFloat(cs.gap) || 12;
  const next = 2 * h + 2 * rowGap + 0.5 * h;
  return Number.isFinite(next) ? next : undefined;
}

/** `/main/cards` — book + card-back grid (see UI mock). */
export default function MainCardsPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
  } | null>(null);
  const [peekHeightPx, setPeekHeightPx] = useState<number | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const refreshScrollHint = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 2;
    const notAtBottom = scrollTop + clientHeight < scrollHeight - 6;
    setShowScrollHint(canScroll && notAtBottom);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Touch: native pan/scroll feels best; mouse/pen: click-drag to scroll.
    if (e.pointerType === "touch") return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startScrollTop: el.scrollTop,
    };
    setGrabbing(true);
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = scrollRef.current;
    if (!d || !el || e.pointerId !== d.pointerId) return;
    const dy = e.clientY - d.startY;
    el.scrollTop = d.startScrollTop - dy;
    refreshScrollHint();
  }, [refreshScrollHint]);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = scrollRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    setGrabbing(false);
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    refreshScrollHint();
  }, [refreshScrollHint]);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const update = () => {
      const next = measurePeekHeight(grid);
      if (next != null) setPeekHeightPx(Math.round(next));
    };

    update();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(grid);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const gridEl = gridRef.current;
    if (!scrollEl) return;

    const raf = requestAnimationFrame(() => {
      refreshScrollHint();
    });
    scrollEl.addEventListener("scroll", refreshScrollHint, { passive: true });
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(refreshScrollHint);
    });
    ro.observe(scrollEl);
    if (gridEl) ro.observe(gridEl);

    return () => {
      cancelAnimationFrame(raf);
      scrollEl.removeEventListener("scroll", refreshScrollHint);
      ro.disconnect();
    };
  }, [peekHeightPx, refreshScrollHint]);

  return (
    <motion.div
      className="flex w-full min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, y: 18 }}
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
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-white/[0.02] to-white/[0.06]"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 p-1 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10 lg:p-2">
          <section
            aria-label="Project book"
            className="flex min-w-0 shrink-0 flex-col items-start justify-start lg:flex-[1.2] lg:self-start"
          >
            <div
              className="flex w-full max-w-[520px] items-start justify-start [perspective:1100px] px-2 py-4 lg:max-w-none lg:py-6"
              style={{ perspectiveOrigin: "50% 50%" }}
            >
              <img
                src={bookImg}
                alt="Hunter project book"
                className="h-auto max-h-[min(52vh,480px)] w-auto max-w-[420px] self-start object-contain select-none drop-shadow-[0_28px_56px_rgba(0,0,0,0.55)] lg:max-h-[min(58vh,560px)] lg:max-w-[min(92%,520px)]"
                style={{
                  transform: "rotateY(-14deg) rotateZ(-2deg)",
                  transformStyle: "preserve-3d",
                }}
                draggable={false}
              />
            </div>
          </section>

          <section
            aria-label="Card backs"
            className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden lg:max-w-[min(100%,400px)]"
          >
            <h1
              className="sr-only font-Shuriken tracking-[0.25em]"
              style={{ textShadow: glow }}
            >
              Cards
            </h1>
            {/* Fixed viewport height (not flex-1) so overflow scroll works; flex-1 was expanding to full grid. */}
            <div
              ref={scrollRef}
              className={`cards-phone-scroll relative min-h-0 w-full shrink-0 overflow-y-auto overscroll-contain px-1 py-2 select-none touch-pan-y sm:px-2 lg:ml-auto lg:max-w-[380px] lg:pr-1 ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
              style={
                peekHeightPx != null
                  ? {
                      height: peekHeightPx,
                      maxHeight: peekHeightPx,
                    }
                  : {
                      height: "min(42vh, 320px)",
                      maxHeight: "min(42vh, 320px)",
                    }
              }
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* Fade + chevron when more cards sit below the fold */}
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center transition-opacity duration-300 ${showScrollHint ? "opacity-100" : "opacity-0"}`}
                aria-hidden
              >
                <div className="h-16 w-full bg-linear-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute bottom-2 flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ChevronDown
                      className="h-6 w-6 text-[#C5A059] drop-shadow-[0_0_12px_rgba(197,160,89,0.45)]"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                  <span className="font-Shuriken text-[0.5rem] font-bold tracking-[0.35em] text-white/80">
                    SCROLL
                  </span>
                </div>
              </div>

              <div
                ref={gridRef}
                className="grid grid-cols-2 justify-items-center gap-3 sm:gap-4"
              >
                {Array.from({ length: CARD_COUNT }, (_, i) => (
                  <div
                    key={i}
                    data-card-cell
                    className="relative w-full max-w-[132px] overflow-hidden rounded-sm ring-1 ring-white/18 shadow-[0_8px_20px_rgba(0,0,0,0.4)] sm:max-w-[148px] md:max-w-[156px]"
                  >
                    <img
                      src={backOfCard}
                      alt=""
                      className="pointer-events-auto block aspect-[5/7] h-auto w-full object-contain"
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => {
                        const g = gridRef.current;
                        if (!g) return;
                        requestAnimationFrame(() => {
                          const next = measurePeekHeight(g);
                          if (next != null) setPeekHeightPx(Math.round(next));
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </BrandedShell>
    </motion.div>
  );
}
