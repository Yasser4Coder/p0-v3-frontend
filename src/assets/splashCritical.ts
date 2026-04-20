import headerBg from "./HeaderBg.svg";
import splashGif from "./gif/splashScreenGif.gif";
import splashBg from "./splashScreenBg.png";
import buttonClickSound from "./sounds/buttonClick.mp3";
import splashIntroMusic from "./sounds/HunterXHunterIntro.mp3";

export {
  splashGif,
  splashBg,
  headerBg,
  buttonClickSound,
  splashIntroMusic,
};

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
  buttonClickSound,
  splashIntroMusic,
  ...splashPublicAssets,
];
