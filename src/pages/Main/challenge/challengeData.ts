import {
  logoAI,
  logoCS,
  logoGD,
  logoPS,
  logoUX,
} from "../../../assets/assets";

export type DomainKey = "cs" | "ps" | "ai" | "ux" | "gd";

export const DOMAIN_KEYS: DomainKey[] = ["cs", "ps", "ai", "ux", "gd"];

export function isDomainKey(s: string | null | undefined): s is DomainKey {
  return s != null && (DOMAIN_KEYS as string[]).includes(s);
}

/** Map API `track_name` (PS, AI, …) to map/challenge domain keys. */
export function domainKeyFromTrackName(
  trackName: string | null | undefined,
): DomainKey | null {
  if (!trackName?.trim()) return null;
  const k = trackName.trim().toUpperCase();
  if (k === "CS") return "cs";
  if (k === "PS") return "ps";
  if (k === "AI") return "ai";
  if (k === "UX") return "ux";
  if (k === "GD") return "gd";
  return null;
}

/**
 * Map track id → domain when detail payload has no `track_name`
 * (aligned with `/api/tracks`: AI=2, PS=4, CS=3, UX=6, GD=7).
 */
export function domainKeyFromTrackId(trackId: number): DomainKey | null {
  if (trackId === 2) return "ai";
  if (trackId === 3) return "cs";
  if (trackId === 4) return "ps";
  if (trackId === 6) return "ux";
  if (trackId === 7) return "gd";
  return null;
}

export type ChallengeCopy = {
  zoneLabel: string;
  domainTitle: string;
  logo: string;
  narrative: string;
  taskBody: string;
};

/** Accent colors per domain — shell border, logo ring, and UI hints. */
export type DomainTheme = {
  /** BrandedShell outer border + ring */
  shellBorder: string;
  shellRing: string;
  /** Flanking logo thumbnails */
  logoClass: string;
  /** Inner narrative / task panel */
  innerPanelClass: string;
  /** TASK: label */
  taskColor: string;
  /** FILE chip */
  fileBtnClass: string;
  /** Submit input focus */
  inputFocusClass: string;
};

export const DOMAIN_THEME: Record<DomainKey, DomainTheme> = {
  cs: {
    shellBorder: "border-2! border-[#138F00]/65",
    shellRing: "ring-1 ring-[#39FF14]/30",
    logoClass:
      "border-2 border-[#39FF14]/85 object-cover shadow-[0_0_20px_rgba(57,255,20,0.5)]",
    innerPanelClass: "border border-[#138F00]/35 bg-black/45",
    taskColor: "#76AF72",
    fileBtnClass:
      "border-[#39FF14]/55 bg-black/50 hover:border-[#39FF14]/85 hover:bg-black/70",
    inputFocusClass: "focus:border-[#39FF14]/55 focus:ring-[#39FF14]/25",
  },
  ps: {
    shellBorder: "border-2! border-[#B81212]/65",
    shellRing: "ring-1 ring-[#E85D5D]/35",
    logoClass:
      "border-2 border-[#B81212]/85 object-cover shadow-[0_0_20px_rgba(184,18,18,0.45)]",
    innerPanelClass: "border border-[#B81212]/35 bg-black/45",
    taskColor: "#E85D5D",
    fileBtnClass:
      "border-[#B81212]/55 bg-black/50 hover:border-[#B81212]/85 hover:bg-black/70",
    inputFocusClass: "focus:border-[#B81212]/55 focus:ring-[#B81212]/25",
  },
  ai: {
    shellBorder: "border-2! border-[#1294B8]/65",
    shellRing: "ring-1 ring-[#4ECBFF]/30",
    logoClass:
      "border-2 border-[#1294B8]/85 object-cover shadow-[0_0_20px_rgba(18,148,184,0.5)]",
    innerPanelClass: "border border-[#1294B8]/35 bg-black/45",
    taskColor: "#4ECBFF",
    fileBtnClass:
      "border-[#1294B8]/55 bg-black/50 hover:border-[#1294B8]/85 hover:bg-black/70",
    inputFocusClass: "focus:border-[#1294B8]/55 focus:ring-[#1294B8]/25",
  },
  ux: {
    shellBorder: "border-2! border-[#8F097B]/65",
    shellRing: "ring-1 ring-[#D946EF]/30",
    logoClass:
      "border-2 border-[#A855F7]/90 object-cover shadow-[0_0_20px_rgba(168,85,247,0.45)]",
    innerPanelClass: "border border-[#8F097B]/40 bg-black/45",
    taskColor: "#D8B4FE",
    fileBtnClass:
      "border-[#A855F7]/55 bg-black/50 hover:border-[#A855F7]/85 hover:bg-black/70",
    inputFocusClass: "focus:border-[#A855F7]/55 focus:ring-[#A855F7]/25",
  },
  gd: {
    shellBorder: "border-2! border-[#C5A059]/65",
    shellRing: "ring-1 ring-[#E1D69E]/35",
    logoClass:
      "border-2 border-[#E1D69E]/90 object-cover shadow-[0_0_20px_rgba(197,160,89,0.5)]",
    innerPanelClass: "border border-[#C5A059]/40 bg-black/45",
    taskColor: "#E1D69E",
    fileBtnClass:
      "border-[#C5A059]/55 bg-black/50 hover:border-[#E1D69E]/80 hover:bg-black/70",
    inputFocusClass: "focus:border-[#C5A059]/55 focus:ring-[#C5A059]/25",
  },
};

/** Hardcoded challenge copy per map domain (node query). */
export const CHALLENGE_BY_NODE: Record<DomainKey, ChallengeCopy> = {
  gd: {
    zoneLabel: "ZONE 1: AWAKENING ZONE",
    domainTitle: "GRAPHIC DESIGN",
    logo: logoGD,
    narrative:
      "AS THE SYSTEM ACTIVATES WITHIN THE ISLAND, IT BEGINS DETECTING NEN SIGNATURES. HOWEVER, IT CANNOT REGISTER OR IDENTIFY EACH NEN TYPE WITHOUT NEN CARDS. THESE CARDS ARE REQUIRED TO CLASSIFY AND ACTIVATE EACH NEN PATHWAY. THE SYSTEM DETECTS THAT THE ORIGINAL NEN CARDS ARE MISSING. TO RESTORE PROPER FUNCTIONALITY, NEW NEN CARDS MUST BE CREATED TO REPRESENT EACH NEN TYPE.",
    taskBody:
      "DESIGN A COMPLETE SET OF NEN CARDS REPRESENTING THE FIVE NEN TYPES: ENHANCER, TRANSMUTER, CONJURER, SPECIALIST, EMITTER.",
  },
  cs: {
    zoneLabel: "ZONE 2: PERIMETER GRID",
    domainTitle: "CYBER SECURITY",
    logo: logoCS,
    narrative:
      "THE ARCHIVE’S OUTER SHELL IS COMPROMISED: UNKNOWN PACKETS ARE PROBING EVERY PORT. THE DEFENSE MATRIX CANNOT LOCK SIGNATURES UNTIL YOU MAP THE ATTACK SURFACE AND SEAL THE CRITICAL GAPS. WITHOUT A HARDENED GATEWAY, THE HUNTER NETWORK REMAINS EXPOSED.",
    taskBody:
      "DOCUMENT A THREAT MODEL FOR THE MOCK API: LIST ENTRY POINTS, TRUST BOUNDARIES, AND THREE CONCRETE CONTROLS (AUTH, RATE LIMIT, INPUT VALIDATION) WITH RATIONALE.",
  },
  ps: {
    zoneLabel: "ZONE 3: LOGIC SPIRE",
    domainTitle: "PROBLEM SOLVING",
    logo: logoPS,
    narrative:
      "THE TRIAL PRESENTS A BROKEN SEQUENCE: CLUES ARRIVE OUT OF ORDER, AND THE SYSTEM WILL NOT OPEN THE NEXT GATE UNTIL THE PATTERN IS RECONSTRUCTED. EACH STEP DEPENDS ON THE LAST—MISS ONE LINK AND THE PATH COLLAPSES.",
    taskBody:
      "SOLVE THE PROVIDED LOGIC PUZZLE: STATE YOUR ASSUMPTIONS, SHOW EACH DEDUCTION, AND GIVE THE FINAL UNLOCK SEQUENCE IN ONE PARAGRAPH.",
  },
  ai: {
    zoneLabel: "ZONE 4: SIGNAL CORE",
    domainTitle: "AI",
    logo: logoAI,
    narrative:
      "THE ISLAND’S SENSOR ARRAY IS FLOODING WITH NOISE. THE MODEL MUST SEPARATE REAL HUNTER SIGNALS FROM PHANTOM READINGS BEFORE THE CORE CAN ROUTE MISSION DATA. UNTIL THE CLASSIFIER IS CALIBRATED, NO AI-ASSISTED BRIEFINGS CAN BE TRUSTED.",
    taskBody:
      "DEFINE A SMALL LABELED DATASET PLAN (CLASSES, SOURCES, BIAS RISKS) AND OUTLINE HOW YOU WOULD EVALUATE PRECISION/RECALL ON A HOLDOUT SET.",
  },
  ux: {
    zoneLabel: "ZONE 5: INTERFACE TRIAL",
    domainTitle: "UI / UX",
    logo: logoUX,
    narrative:
      "OPERATORS REPORT STRAIN: TOO MANY ACTIONS PER SCREEN, NO CLEAR PRIMARY PATH, AND STATUS FEEDBACK ARRIVES TOO LATE. THE INTERFACE MUST BE REBUILT SO A FIRST-TIME HUNTER CAN COMPLETE THE CORE FLOW WITHOUT A GUIDE.",
    taskBody:
      "PRODUCE LOW-FIDELITY WIREFRAMES (KEY SCREENS) PLUS A SHORT USABILITY CHECKLIST COVERING NAVIGATION, FEEDBACK, AND ERROR STATES.",
  },
};
