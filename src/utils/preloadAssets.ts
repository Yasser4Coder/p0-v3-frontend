export const preloadAssets = async (
  assets: string[],
  onProgress?: (progress: number) => void,
) => {
  let finished = 0;
  const total = assets.length;
  if (total === 0) {
    if (onProgress) onProgress(100);
    return;
  }

  const bump = () => {
    finished++;
    if (onProgress) onProgress((finished / total) * 100);
  };

  await Promise.all(
    assets.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            bump();
            resolve();
          };
          img.onerror = () => {
            bump();
            resolve();
          };
          img.src = src;
        }),
    ),
  );
};
