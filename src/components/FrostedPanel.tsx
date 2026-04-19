import type { ReactNode } from "react";

const GLASS =
  "rounded-3xl border-2 border-[#43574C]/90 bg-linear-to-br from-white/14 via-white/6 to-white/3 shadow-[0_12px_48px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl backdrop-saturate-200";

type FrostedPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Glass inner panel (blur + gradient tint). */
export default function FrostedPanel({ children, className }: FrostedPanelProps) {
  return (
    <div
      className={[
        GLASS,
        "mt-6 px-5 py-10 md:mt-8 md:px-7 md:py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
