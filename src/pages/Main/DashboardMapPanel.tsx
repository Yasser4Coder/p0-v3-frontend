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

const MAP_VIEW_W = 800;
const MAP_VIEW_H = 520;

/** Smaller markers — many challenges can appear on the map */
const MAP_NODE_IMG_R = 11;
const MAP_NODE_HIT_R = MAP_NODE_IMG_R + 5;

const PADDING = MAP_NODE_IMG_R + MAP_NODE_HIT_R + 4;

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

type PlacedChallenge = ChallengeFromApi & {
  x: number;
  y: number;
  logo: string;
};

function placeChallenges(challenges: ChallengeFromApi[]): PlacedChallenge[] {
  const n = challenges.length;
  if (!n) return [];

  const maxR = MAP_NODE_HIT_R;
  const minX = PADDING;
  const maxX = MAP_VIEW_W - PADDING;
  const minY = PADDING;
  const maxY = MAP_VIEW_H - PADDING;

  const placed: { x: number; y: number }[] = [];

  const fits = (x: number, y: number) => {
    for (const p of placed) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy < (2 * maxR) * (2 * maxR)) return false;
    }
    return true;
  };

  return challenges.map((ch, index) => {
    let x = minX + hash01(ch.id, 1) * (maxX - minX);
    let y = minY + hash01(ch.id, 2) * (maxY - minY);

    let ok = fits(x, y);
    if (!ok) {
      for (let attempt = 0; attempt < 420; attempt++) {
        x = minX + hash01(ch.id + attempt * 997, 3 + attempt) * (maxX - minX);
        y = minY + hash01(ch.id + attempt * 691, 5 + attempt) * (maxY - minY);
        if (fits(x, y)) {
          ok = true;
          break;
        }
      }
    }

    if (!ok) {
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      const cw = (maxX - minX) / cols;
      const rh = (maxY - minY) / rows;
      const col = index % cols;
      const row = Math.floor(index / cols);
      x = minX + cw * (col + 0.5);
      y = minY + rh * (row + 0.5);
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

  const openChallenge = (challengeId: number) => {
    navigate(`/challenge?id=${encodeURIComponent(String(challengeId))}`);
  };

  const onChallengeActivate = (
    challengeId: number,
    e: MouseEvent<SVGGElement> | KeyboardEvent<SVGGElement>,
  ) => {
    if ("key" in e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
    }
    openChallenge(challengeId);
  };

  /** Rough tooltip width for clamping inside the map viewBox */
  function tooltipMetrics(title: string) {
    const padX = 12;
    const maxChars = 36;
    const t =
      title.length > maxChars ? `${title.slice(0, maxChars).trim()}…` : title;
    const estW = Math.min(280, Math.max(120, t.length * 6.2 + padX * 2));
    const h = 26;
    return { text: t, w: estW, h, padX };
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
                onClick={(e) => onChallengeActivate(node.id, e)}
                onKeyDown={(e) => onChallengeActivate(node.id, e)}
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
                      const tipY = -MAP_NODE_HIT_R - m.h - 10;
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
                          <text
                            x={m.padX}
                            y={17}
                            fill="#ffffff"
                            fontFamily="inherit"
                            fontSize={10}
                            fontWeight={700}
                            letterSpacing="0.08em"
                            style={{
                              paintOrder: "stroke fill",
                              stroke: "rgba(0,0,0,0.55)",
                              strokeWidth: 3,
                            }}
                          >
                            {m.text}
                          </text>
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
