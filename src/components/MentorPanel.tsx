import { useEffect, useState } from "react";
import {
  logoAI,
  logoCS,
  logoGD,
  logoPS,
  logoUX,
  manAI,
  manCS,
  manGD,
  manPS,
  manUX,
} from "../assets/assets";
import MentorMessageModal, {
  type MentorMessagePayload,
} from "./MentorMessageModal";
import type { MentorRowConfig } from "./mentorTypes";

const MENTOR_ROWS: MentorRowConfig[] = [
  {
    id: "cs",
    label: "DEV MENTOR",
    color: "#138F00",
    avatar: manCS,
    logo: logoCS,
  },
  {
    id: "ps",
    label: "PROBLEM SOLVING",
    color: "#B81212",
    avatar: manPS,
    logo: logoPS,
  },
  {
    id: "ai",
    label: "AI",
    color: "#1294B8",
    avatar: manAI,
    logo: logoAI,
  },
  {
    id: "ux",
    label: "UIUX",
    color: "#8F097B",
    avatar: manUX,
    logo: logoUX,
  },
  {
    id: "gd",
    label: "DESIGN MENTOR",
    color: "#B88412",
    avatar: manGD,
    logo: logoGD,
  },
];

/** Diagonal accent strips (same geometry as dashboard `Header` center). */
function DiagonalBars({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden
    >
      <div className="relative h-[140%] w-[min(100%,320px)] min-w-[240px]">
        <div className="absolute top-0 left-[-7%]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="144"
            height="119"
            viewBox="0 0 144 119"
            fill="none"
          >
            <path d="M120 -1H144L28.9756 119H0L120 -1Z" fill={color} />
          </svg>
        </div>
        <div className="absolute top-0 left-[10%]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="234"
            height="123"
            viewBox="0 0 234 123"
            fill="none"
          >
            <path
              d="M115.028 -1.36443C115.407 -1.76982 115.936 -2 116.491 -2H231.65C233.452 -2 234.335 0.195141 233.035 1.44277L112.151 117.491C111.809 117.82 111.361 118.016 110.888 118.045L2.12699 124.694C0.322931 124.804 -0.690402 122.655 0.542655 121.333L115.028 -1.36443Z"
              fill={color}
            />
          </svg>
        </div>
        <div className="absolute top-0 left-[50%]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="144"
            height="119"
            viewBox="0 0 144 119"
            fill="none"
          >
            <path d="M120 -1H144L28.9756 119H0L120 -1Z" fill={color} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MentorRow({
  row,
  onPick,
}: {
  row: MentorRowConfig;
  onPick: (row: MentorRowConfig) => void;
}) {
  const { label, color, avatar, logo } = row;

  const activate = () => onPick(row);

  return (
    <div
      role="button"
      tabIndex={0}
      className="relative my-4 flex w-full cursor-pointer items-center gap-2 overflow-hidden py-2 outline-none ring-offset-black transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/70 sm:my-4 sm:gap-3 sm:py-3 md:gap-4 [@media(max-height:520px)]:my-1 [@media(max-height:520px)]:gap-1.5 [@media(max-height:520px)]:py-1"
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
    >
      <div
        className="relative z-20 h-12 w-11 shrink-0 overflow-hidden rounded-sm border sm:h-14 sm:w-12 md:h-16 md:w-14 [@media(max-height:520px)]:h-9 [@media(max-height:520px)]:w-8"
        style={{ borderColor: `${color}aa` }}
      >
        <img
          src={avatar}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="relative flex min-h-12 min-w-0 flex-1 items-center justify-center sm:min-h-14 [@media(max-height:520px)]:min-h-8">
        <DiagonalBars color={color} />
        <div
          className="relative z-10 border bg-black/85 px-3 py-2 text-center sm:px-5 sm:py-2.5 [@media(max-height:520px)]:px-2 [@media(max-height:520px)]:py-1"
          style={{
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}40, inset 0 0 20px ${color}12`,
          }}
        >
          <span className="font-Shuriken text-[0.6rem] font-black tracking-[0.18em] text-white sm:text-xs md:text-sm md:tracking-[0.22em] [@media(max-height:520px)]:text-[0.5rem] [@media(max-height:520px)]:tracking-[0.14em]">
            {label}
          </span>
        </div>
      </div>

      <div
        className="relative z-20 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 sm:h-14 sm:w-14 md:h-16 md:w-16 [@media(max-height:520px)]:h-9 [@media(max-height:520px)]:w-9"
        style={{
          borderColor: color,
          boxShadow: `0 0 16px ${color}66`,
        }}
      >
        <img
          src={logo}
          alt=""
          className="h-full w-full object-contain p-1"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

type MentorPanelProps = {
  onClose: () => void;
  onSendMentorMessage?: (payload: MentorMessagePayload) => void;
};

/** Mentor picker overlay content (backdrop is handled by parent). */
export default function MentorPanel({
  onClose,
  onSendMentorMessage,
}: MentorPanelProps) {
  const [messageMentor, setMessageMentor] = useState<MentorRowConfig | null>(
    null,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (messageMentor) {
        setMessageMentor(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, messageMentor]);

  return (
    <>
      <div
        className="rounded-xl border border-white/15 bg-black/75 px-3 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-5 sm:py-5 md:px-6 [@media(max-height:520px)]:rounded-lg [@media(max-height:520px)]:px-2.5 [@media(max-height:520px)]:py-2"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-panel-title"
      >
        <h2 id="mentor-panel-title" className="sr-only">
          Choose a mentor domain
        </h2>
        <div className="flex flex-col divide-y divide-white/10">
          {MENTOR_ROWS.map((row) => (
            <MentorRow key={row.id} row={row} onPick={setMessageMentor} />
          ))}
        </div>
      </div>

      {messageMentor ? (
        <MentorMessageModal
          mentor={messageMentor}
          onClose={() => setMessageMentor(null)}
          onSend={onSendMentorMessage}
        />
      ) : null}
    </>
  );
}
