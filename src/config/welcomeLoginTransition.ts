/** Duration the GIF plays (ms) before navigating to login — adjust anytime. */
export const WELCOME_TO_LOGIN_GIF_MS = 2800;

/** Logo size at viewport center (px); larger than header slot for emphasis */
export const LOGO_AT_CENTER_SIZE_PX = 260;

/** Min scale vs header logo width (e.g. 4 → up to 4× header width at center) */
export const LOGO_CENTER_WIDTH_MULTIPLIER = 4.2;

/** Logo flight: header → center (seconds); longer so the grow reads clearly */
export const LOGO_TO_CENTER_MS = 1.45;

/** Easing for header → center: slow finish so the big size “lands” visibly */
export const LOGO_TO_CENTER_EASE: [number, number, number, number] = [
  0.22, 0.99, 0.36, 1,
];

/** Logo flight: center → header slot on login (ms) */
export const LOGO_TO_SLOT_MS = 0.6;

/** Login page: each block fade/slide duration (seconds) */
export const LOGIN_ITEM_ENTER_S = 0.72;

/** Login page: delay before stagger starts after welcome transition (seconds) */
export const LOGIN_STAGGER_DELAY_AFTER_WELCOME_S = 0.42;

/** Login page: delay before stagger when opening /login directly (seconds) */
export const LOGIN_STAGGER_DELAY_DIRECT_S = 0.06;

/** Login page: time between each child animation (seconds) */
export const LOGIN_STAGGER_GAP_S = 0.14;

/** Login page: shorter stagger when not from welcome */
export const LOGIN_STAGGER_GAP_DIRECT_S = 0.07;

/** Login page: outer shell fade (seconds) */
export const LOGIN_PAGE_FADE_S = 0.55;
