import headerBg from "./HeaderBg.svg";
import splashGif from "./gif/splashScreenGif.gif";
import splashBg from "./splashScreenBg.png";

export { splashGif, splashBg, headerBg };

/**
 * Splash route — load order: full-bleed bg → hero gif → header strip.
 * Preloaded before every other heavy asset (see `preloadAssetPhases`).
 */
export const splashCriticalAssets = [splashBg, splashGif, headerBg];

/** Header logos from `public/` (paths must match `<Header />`). */
export const splashPublicAssets = ["/HUNTERxHAKER.svg", "/Logo.svg"];

/** Everything that should download before the rest of `heavyAssets`. */
export const splashPriorityAssets = [
  ...splashCriticalAssets,
  ...splashPublicAssets,
];
