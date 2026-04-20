import { useEffect } from "react";
import { playButtonClickSound } from "../audio/playButtonClickSound";

function targetIsClickableControl(target: EventTarget | null): boolean {
  const el =
    target instanceof Element
      ? target.closest(
          'button:not([disabled]), [role="button"]:not([aria-disabled="true"]), [data-p0-click-sfx], input[type="submit"]:not([disabled]), input[type="button"]:not([disabled]), input[type="reset"]:not([disabled])',
        )
      : null;
  return Boolean(el);
}

/**
 * Captures clicks and plays shared button SFX when the hit target is a button-like control.
 */
export default function ButtonClickSound() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (!targetIsClickableControl(e.target)) return;
      playButtonClickSound();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return null;
}
