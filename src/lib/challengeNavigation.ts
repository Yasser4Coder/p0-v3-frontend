const CHALLENGE_CTX_KEY = "p0_challenge_ctx";

export type ChallengeRouteContext = {
  challengeId: number;
  /** Theme hint (cs | ps | ai | ux | gd), from map track. */
  node?: string;
};

export function persistChallengeContext(ctx: ChallengeRouteContext): void {
  try {
    sessionStorage.setItem(CHALLENGE_CTX_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readChallengeContext(): ChallengeRouteContext | null {
  try {
    const raw = sessionStorage.getItem(CHALLENGE_CTX_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "challengeId" in parsed &&
      typeof (parsed as ChallengeRouteContext).challengeId === "number"
    ) {
      const challengeId = (parsed as ChallengeRouteContext).challengeId;
      if (Number.isFinite(challengeId) && challengeId > 0) {
        const node = (parsed as ChallengeRouteContext).node;
        return {
          challengeId,
          node: typeof node === "string" ? node : undefined,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearChallengeContext(): void {
  try {
    sessionStorage.removeItem(CHALLENGE_CTX_KEY);
  } catch {
    /* ignore */
  }
}
