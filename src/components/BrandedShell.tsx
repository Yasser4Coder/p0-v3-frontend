import type { ReactNode } from "react";

type BrandedShellProps = {
  children: ReactNode;
  className?: string;
  /**
   * Narrow panels (e.g. dashboard sidebar): use tight padding.
   * Default shell uses `md:px-32`, which collapses a `max-w-52` column and kills clicks.
   */
  compact?: boolean;
};

/** Outer Project O frame: dark panel + #43574C border. */
export default function BrandedShell({
  children,
  className,
  compact,
}: BrandedShellProps) {
  const padding = compact
    ? "px-3 py-4 shadow-lg md:px-4 md:py-5"
    : "px-12 py-7 shadow-xl md:px-32 md:py-10";

  return (
    <div
      className={[
        "w-full border-2 border-[#43574C] bg-black/65",
        padding,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
