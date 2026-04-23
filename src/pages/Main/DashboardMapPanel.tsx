import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Map as mapImage,
  logoAI,
  logoCS,
  logoGD,
  logoPS,
  logoUX,
} from "../../assets/assets";
import BrandedShell from "../../components/BrandedShell";
import { getChallenges } from "../../lib/challenges/api";
import type { ChallengeFromApi } from "../../types/challenge";
import { persistChallengeContext } from "../../lib/challengeNavigation";
import {
  domainKeyFromTrackId,
  domainKeyFromTrackName,
} from "./challenge/challengeData";

const MAP_VIEW_W = 800;
const MAP_VIEW_H = 520;

/** Island art is centered in the viewBox — keep pins inside this disk, not the full rectangle. */
const MAP_CENTER_X = MAP_VIEW_W / 2;
const MAP_CENTER_Y = MAP_VIEW_H / 2;

/** Smaller markers — many challenges can appear on the map */
const MAP_NODE_IMG_R = 11;
const MAP_NODE_HIT_R = MAP_NODE_IMG_R + 5;

const PADDING = MAP_NODE_IMG_R + MAP_NODE_HIT_R + 4;

/** Max distance from center for marker *center* so the hit circle stays on the island. */
const MAP_PLACEMENT_MAX_R = Math.max(
  48,
  Math.min(MAP_VIEW_W, MAP_VIEW_H) * 0.31 - MAP_NODE_HIT_R - 6,
);

function logoForTrackName(trackName: string) {
  const key = trackName.trim().toUpperCase();
  switch (key) {
    case "PS":
      return logoPS;
    case "AI":
      return logoAI;
    case "CS":
      return logoCS;
    case "UX":
      return logoUX;
    case "GD":
      return logoGD;
    default:
      return logoCS;
  }
}

/** Deterministic “random” in [0, 1) from id + salt */
function hash01(id: number, salt: number) {
  const x = Math.sin(id * 12.9898 + salt * 78.233 + 54.321) * 43758.5453;
  return x - Math.floor(x);
}

/** Uniform random point in a disk (stable per id + attempt). */
function hashPointInPlacementDisk(
  id: number,
  saltR: number,
  saltTheta: number,
  attempt: number,
) {
  const u = hash01(id + attempt * 997, saltR);
  const v = hash01(id + attempt * 691, saltTheta);
  const r = MAP_PLACEMENT_MAX_R * Math.sqrt(u);
  const theta = 2 * Math.PI * v;
  return {
    x: MAP_CENTER_X + r * Math.cos(theta),
    y: MAP_CENTER_Y + r * Math.sin(theta),
  };
}

type PlacedChallenge = ChallengeFromApi & {
  x: number;
  y: number;
  logo: string;
};

function placeChallenges(challenges: ChallengeFromApi[]): PlacedChallenge[] {
  const n = challenges.length;
  if (!n) return [];

  const maxR = MAP_NODE_HIT_R;

  const placed: { x: number; y: number }[] = [];

  const fits = (x: number, y: number) => {
    const ox = x - MAP_CENTER_X;
    const oy = y - MAP_CENTER_Y;
    if (ox * ox + oy * oy > MAP_PLACEMENT_MAX_R * MAP_PLACEMENT_MAX_R) {
      return false;
    }
    for (const p of placed) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy < (2 * maxR) * (2 * maxR)) return false;
    }
    return true;
  };

  return challenges.map((ch, index) => {
    let { x, y } = hashPointInPlacementDisk(ch.id, 1, 2, 0);

    let ok = fits(x, y);
    if (!ok) {
      for (let attempt = 0; attempt < 420; attempt++) {
        ({ x, y } = hashPointInPlacementDisk(
          ch.id + attempt * 131,
          3 + attempt,
          5 + attempt,
          attempt + 1,
        ));
        if (fits(x, y)) {
          ok = true;
          break;
        }
      }
    }

    if (!ok) {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const t = (index + 1) / (n + 1);
      const rr = MAP_PLACEMENT_MAX_R * 0.92 * Math.sqrt(t);
      const angle = index * goldenAngle + hash01(ch.id, 88) * 2 * Math.PI;
      x = MAP_CENTER_X + rr * Math.cos(angle);
      y = MAP_CENTER_Y + rr * Math.sin(angle);
    }

    placed.push({ x, y });

    return {
      ...ch,
      x,
      y,
      logo: logoForTrackName(ch.track_name),
    };
  });
}

export type DashboardMapPanelProps = {
  /** Status-style layout: wider map, `flex-1` on the column. */
  wideMap?: boolean;
};

export default function DashboardMapPanel({ wideMap }: DashboardMapPanelProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `mapNodeShadow-${uid}`;
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<ChallengeFromApi[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getChallenges();
        if (!cancelled) setChallenges(list);
      } catch {
        if (!cancelled) setChallenges([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const placed = useMemo(
    () => placeChallenges(challenges),
    [challenges],
  );

  const openChallenge = (ch: ChallengeFromApi) => {
    const domain =
      domainKeyFromTrackName(ch.track_name) ??
      domainKeyFromTrackId(ch.track_id);
    const ctx = {
      challengeId: ch.id,
      ...(domain ? { node: domain } : {}),
    };
    persistChallengeContext(ctx);
    navigate("/challenge", { state: ctx });
  };

  const onChallengeActivate = (
    ch: ChallengeFromApi,
    e: MouseEvent<SVGGElement> | KeyboardEvent<SVGGElement>,
  ) => {
    if ("key" in e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
    }
    openChallenge(ch);
  };

  /** Rough tooltip width for clamping inside the map viewBox */
  function tooltipMetrics(title: string) {
    const padX = 12;
    const padY = 8;
    const fontSizePx = 10;
    const fontWeight = 800;
    const maxW = 300;
    const minW = 140;
    const lineHeightPx = 13;
    const maxLines = 6;

    // Canvas-based measurement for accurate per-title sizing.
    // Falls back to a simple estimate if canvas isn't available.
    const measure = (() => {
      try {
        if (typeof document === "undefined") return null;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.font = `${fontWeight} ${fontSizePx}px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
        return (s: string) => ctx.measureText(s).width;
      } catch {
        return null;
      }
    })();

    const measureText = (s: string) =>
      measure ? measure(s) : s.length * 6.2;

    const words = title.trim().split(/\s+/).filter(Boolean);
    const contentMax = maxW - padX * 2;

    const lines: string[] = [];
    let current = "";

    const pushLine = (line: string) => {
      lines.push(line);
    };

    const flushCurrent = () => {
      if (current.trim()) pushLine(current.trim());
      current = "";
    };

    // Wrap by words, but allow long tokens to break (up to maxLines).
    for (const w of words.length ? words : [title]) {
      const candidate = current ? `${current} ${w}` : w;
      if (measureText(candidate) <= contentMax) {
        current = candidate;
        continue;
      }
      // If current already has content, flush it and retry the word on a new line.
      if (current) {
        flushCurrent();
        if (lines.length >= maxLines) break;
      }
      // Word itself may be too long: split by characters until it fits.
      if (measureText(w) > contentMax) {
        let chunk = "";
        for (const ch of w) {
          const next = chunk + ch;
          if (measureText(next) <= contentMax) {
            chunk = next;
          } else {
            if (chunk) pushLine(chunk);
            chunk = ch;
            if (lines.length >= maxLines) break;
          }
        }
        current = chunk;
        if (lines.length >= maxLines) break;
      } else {
        current = w;
      }
    }

    if (lines.length < maxLines) flushCurrent();

    // Add ellipsis only if we hit maxLines.
    const visible = lines.slice(0, maxLines);
    const hitLimit = lines.length >= maxLines;
    if (hitLimit && visible.length) {
      const lastIdx = visible.length - 1;
      let last = visible[lastIdx] ?? "";
      // If we still have more content, ellipsize the last line.
      while (last && measureText(`${last}…`) > contentMax) {
        last = last.slice(0, -1);
      }
      visible[lastIdx] = last ? `${last}…` : "…";
    }

    const widest = Math.max(
      ...visible.map((l) => measureText(l)),
      0,
    );
    const w = Math.min(maxW, Math.max(minW, Math.ceil(widest + padX * 2)));
    const h = padY * 2 + lineHeightPx * Math.max(1, visible.length);
    return { lines: visible, w, h, padX, padY, lineHeightPx, fontSizePx, fontWeight };
  }

  return (
    <BrandedShell
      compact
      className={`relative z-0 min-w-0 overflow-hidden py-2! shadow-xl md:py-3! lg:min-h-[min(82vh,780px)] ${wideMap ? "flex-1" : "lg:flex-1"}`}
    >
      <div className="relative flex min-h-[min(58vh,560px)] flex-1 overflow-hidden lg:min-h-[min(76vh,720px)]">
        <div className="relative z-1 flex h-full min-h-[min(42vh,360px)] w-full flex-1 items-center justify-center p-1.5 md:p-2 lg:p-3">
          <svg
            className={`h-full max-h-[min(78vh,760px)] w-full cursor-default rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/10 ${wideMap ? "max-w-[min(96vw,1400px)]" : "max-w-[min(92vw,1200px)]"}`}
            viewBox="0 0 800 520"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="World map with skill markers"
          >
            <defs>
              <filter
                id={filterId}
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="0.5"
                  stdDeviation="1.25"
                  floodColor="#000"
                  floodOpacity="0.4"
                />
              </filter>
              {placed.map((ch) => (
                <clipPath
                  key={ch.id}
                  id={`map-node-clip-${uid}-${ch.id}`}
                  clipPathUnits="objectBoundingBox"
                >
                  <circle cx="0.5" cy="0.5" r="0.5" />
                </clipPath>
              ))}
            </defs>
            <image
              href={mapImage}
              x="0"
              y="0"
              width="800"
              height="520"
              preserveAspectRatio="xMidYMid meet"
            />
            {placed.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                className="cursor-pointer outline-none focus-visible:[&_.map-node-hit]:stroke-[#39FF14] focus-visible:[&_.map-node-hit]:stroke-[2.5]"
                role="button"
                tabIndex={0}
                aria-label={node.title}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() =>
                  setHoveredId((current) =>
                    current === node.id ? null : current,
                  )
                }
                onFocus={() => setHoveredId(node.id)}
                onBlur={() =>
                  setHoveredId((current) =>
                    current === node.id ? null : current,
                  )
                }
                onClick={(e) => onChallengeActivate(node, e)}
                onKeyDown={(e) => onChallengeActivate(node, e)}
              >
                <g filter={`url(#${filterId})`}>
                  <image
                    href={node.logo}
                    x={-MAP_NODE_IMG_R}
                    y={-MAP_NODE_IMG_R}
                    width={MAP_NODE_IMG_R * 2}
                    height={MAP_NODE_IMG_R * 2}
                    clipPath={`url(#map-node-clip-${uid}-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                    className="pointer-events-none"
                  />
                </g>
                <circle
                  className="map-node-hit"
                  r={MAP_NODE_HIT_R}
                  fill="transparent"
                  stroke="transparent"
                  pointerEvents="all"
                />
                {hoveredId === node.id
                  ? (() => {
                      const m = tooltipMetrics(node.title);
                      const tipXRaw = -m.w / 2;
                      const maxLeft = MAP_VIEW_W - node.x - PADDING - m.w;
                      const minLeft = PADDING - node.x;
                      const tipX = Math.min(maxLeft, Math.max(minLeft, tipXRaw));
                      const tipYRaw = -MAP_NODE_HIT_R - m.h - 10;
                      const maxTop = MAP_VIEW_H - node.y - PADDING - m.h;
                      const minTop = PADDING - node.y;
                      const tipY = Math.min(maxTop, Math.max(minTop, tipYRaw));
                      return (
                        <g
                          className="pointer-events-none"
                          transform={`translate(${tipX},${tipY})`}
                          aria-hidden
                        >
                          <rect
                            x={0}
                            y={0}
                            width={m.w}
                            height={m.h}
                            rx={8}
                            ry={8}
                            fill="rgba(0,0,0,0.82)"
                            stroke="rgba(255,255,255,0.42)"
                            strokeWidth={1}
                          />
                          <foreignObject
                            x={m.padX}
                            y={m.padY}
                            width={Math.max(0, m.w - m.padX * 2)}
                            height={Math.max(0, m.h - m.padY * 2)}
                          >
                            <div
                              style={{
                                color: "#fff",
                                fontSize: `${m.fontSizePx}px`,
                                fontWeight: m.fontWeight,
                                letterSpacing: "0.08em",
                                lineHeight: `${m.lineHeightPx}px`,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {m.lines.join("\n")}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })()
                  : null}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </BrandedShell>
  );
}
