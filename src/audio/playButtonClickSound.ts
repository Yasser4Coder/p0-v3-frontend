import buttonClickSrc from "../assets/sounds/buttonClick.mp3";

/**
 * Short UI click — creates a new Audio each time so rapid clicks still play.
 */
export function playButtonClickSound(): void {
  const audio = new Audio(buttonClickSrc);
  audio.volume = 0.42;
  void audio.play().catch(() => {
    /* autoplay blocked until gesture on some browsers */
  });
}
