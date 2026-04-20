import { PWA_CACHE_VERSION } from "../config/pwaCacheVersion";

const PRELOAD_STORAGE_KEY = `p0-assets-preload-${PWA_CACHE_VERSION}`;

export function hasCompletedAssetPreload(): boolean {
  try {
    return localStorage.getItem(PRELOAD_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markAssetPreloadComplete(): void {
  try {
    localStorage.setItem(PRELOAD_STORAGE_KEY, "1");
  } catch {
    /* private / blocked storage */
  }
}

export type PreloadAssetsOptions = {
  onProgress?: (progress: number) => void;
  /**
   * If true, skip decoding when this browser already finished preload for `PWA_CACHE_VERSION`.
   * First visit still runs full preload and fills the service worker cache.
   */
  skipIfAlreadyLoaded?: boolean;
};

function loadImages(
  urls: string[],
  onEachComplete: () => void,
): Promise<void> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            onEachComplete();
            resolve();
          };
          img.onerror = () => {
            onEachComplete();
            resolve();
          };
          img.src = src;
        }),
    ),
  ).then(() => {});
}

export const preloadAssets = async (
  assets: string[],
  options?: PreloadAssetsOptions,
) => {
  const { onProgress, skipIfAlreadyLoaded } = options ?? {};

  if (skipIfAlreadyLoaded && hasCompletedAssetPreload()) {
    onProgress?.(100);
    return;
  }

  const total = assets.length;
  if (total === 0) {
    onProgress?.(100);
    markAssetPreloadComplete();
    return;
  }

  let finished = 0;
  const bump = () => {
    finished++;
    onProgress?.((finished / total) * 100);
  };

  await loadImages(assets, bump);

  markAssetPreloadComplete();
};

/**
 * Run preload phases **in order**: phase 1 completes before phase 2 starts downloading.
 * Progress is unified across all URLs (splash-first strategy).
 */
export async function preloadAssetPhases(
  phases: string[][],
  options?: PreloadAssetsOptions,
) {
  const { onProgress, skipIfAlreadyLoaded } = options ?? {};

  if (skipIfAlreadyLoaded && hasCompletedAssetPreload()) {
    onProgress?.(100);
    return;
  }

  const flat = phases.flat();
  const total = flat.length;
  if (total === 0) {
    onProgress?.(100);
    markAssetPreloadComplete();
    return;
  }

  let finished = 0;
  const bump = () => {
    finished++;
    onProgress?.((finished / total) * 100);
  };

  for (const phase of phases) {
    await loadImages(phase, bump);
  }

  markAssetPreloadComplete();
}

/**
 * Kick off requests as early as possible (e.g. from `main.tsx`) without blocking render.
 * Splash still runs `preloadAssetPhases` so loads complete + SW cache is populated.
 */
export function warmSplashPriorityAssets(urls: string[]): void {
  for (const src of urls) {
    const img = new Image();
    img.src = src;
  }
}
