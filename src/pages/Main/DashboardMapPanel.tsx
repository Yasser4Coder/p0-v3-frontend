import { useId, type KeyboardEvent, type MouseEvent } from "react";
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

const MAP_VIEW_W = 800;
const MAP_VIEW_H = 520;

const MAP_NODES: {
  x: number;
  y: number;
  logo: string;
  nodeId: string;
  label: string;
}[] = [
  {
    x: 0.32 * MAP_VIEW_W,
    y: 0.18 * MAP_VIEW_H,
    logo: logoCS,
    nodeId: "cs",
    label: "Cyber security",
  },
  {
    x: 0.55 * MAP_VIEW_W,
    y: 0.28 * MAP_VIEW_H,
    logo: logoPS,
    nodeId: "ps",
    label: "Problem solving",
  },
  {
    x: 0.4 * MAP_VIEW_W,
    y: 0.42 * MAP_VIEW_H,
    logo: logoAI,
    nodeId: "ai",
    label: "AI",
  },
  {
    x: 0.62 * MAP_VIEW_W,
    y: 0.55 * MAP_VIEW_H,
    logo: logoGD,
    nodeId: "gd",
    label: "Graphic design",
  },
  {
    x: 0.72 * MAP_VIEW_W,
    y: 0.38 * MAP_VIEW_H,
    logo: logoUX,
    nodeId: "ux",
    label: "UI / UX",
  },
];

const MAP_NODE_IMG_R = 16;
const MAP_NODE_HIT_R = MAP_NODE_IMG_R + 6;

export type DashboardMapPanelProps = {
  /** Status-style layout: wider map, `flex-1` on the column. */
  wideMap?: boolean;
};

export default function DashboardMapPanel({ wideMap }: DashboardMapPanelProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `mapNodeShadow-${uid}`;
  const navigate = useNavigate();

  const openMapNode = (nodeId: string) => {
    navigate(`/challenge?node=${encodeURIComponent(nodeId)}`);
  };

  const onMapNodeActivate = (
    nodeId: string,
    e: MouseEvent<SVGGElement> | KeyboardEvent<SVGGElement>,
  ) => {
    if ("key" in e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
    }
    openMapNode(nodeId);
  };

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
              {MAP_NODES.map((_, i) => (
                <clipPath
                  key={i}
                  id={`map-node-clip-${uid}-${i}`}
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
            {MAP_NODES.map((node, i) => (
              <g
                key={node.nodeId}
                transform={`translate(${node.x},${node.y})`}
                className="cursor-pointer outline-none focus-visible:[&_.map-node-hit]:stroke-[#39FF14] focus-visible:[&_.map-node-hit]:stroke-[2.5]"
                role="button"
                tabIndex={0}
                aria-label={node.label}
                onClick={(e) => onMapNodeActivate(node.nodeId, e)}
                onKeyDown={(e) => onMapNodeActivate(node.nodeId, e)}
              >
                <g filter={`url(#${filterId})`}>
                  <image
                    href={node.logo}
                    x={-MAP_NODE_IMG_R}
                    y={-MAP_NODE_IMG_R}
                    width={MAP_NODE_IMG_R * 2}
                    height={MAP_NODE_IMG_R * 2}
                    clipPath={`url(#map-node-clip-${uid}-${i})`}
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
              </g>
            ))}
          </svg>
        </div>
      </div>
    </BrandedShell>
  );
}
