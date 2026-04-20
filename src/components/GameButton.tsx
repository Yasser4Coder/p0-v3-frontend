import type { AriaAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type GameButtonProps = {
  children: ReactNode;
  /** When set, renders a react-router `<Link>` (reliable SPA navigation). */
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  /** Associate submit with a `<form id="...">` outside the button tree. */
  form?: string;
  /** Classes on the outer `<button>` / `<a>` (e.g. `mt-8`). */
  className?: string;
  /** When false, link/button does not stretch to full width (e.g. centered nav pills). */
  fullWidth?: boolean;
  /** Outer frame background, e.g. `bg-red-600` */
  outerBgClass?: string;
  /** Inner panel background + hover, e.g. `bg-red-600 hover:bg-red-700` */
  bgClass?: string;
  /** Text / font classes, e.g. `text-white text-xl font-semibold tracking-wide` */
  fontClass?: string;
  "aria-current"?: AriaAttributes["aria-current"];
  "aria-expanded"?: AriaAttributes["aria-expanded"];
};

const outerBase =
  "p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const innerBase =
  "flex items-center justify-center text-center px-10 cursor-pointer py-3 rounded-sm border border-white transition-colors";

export default function GameButton({
  children,
  to,
  onClick,
  type = "button",
  form,
  className,
  fullWidth = true,
  outerBgClass = "bg-red-600",
  bgClass = "bg-red-600 hover:bg-red-700",
  fontClass = "text-white text-xl font-semibold tracking-wide",
  "aria-current": ariaCurrent,
  "aria-expanded": ariaExpanded,
}: GameButtonProps) {
  const outerClass = [outerBase, outerBgClass, className].filter(Boolean).join(" ");
  const inner = (
    <div
      className={[innerBase, bgClass, fontClass].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );

  const widthClass = fullWidth ? "w-full max-w-full" : "w-auto max-w-none";

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        data-p0-click-sfx=""
        className={`${outerClass} inline-flex ${widthClass} flex-col no-underline`}
        aria-current={ariaCurrent}
        aria-expanded={ariaExpanded}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      data-p0-click-sfx=""
      className={outerClass}
      aria-current={ariaCurrent}
      aria-expanded={ariaExpanded}
    >
      {inner}
    </button>
  );
}
