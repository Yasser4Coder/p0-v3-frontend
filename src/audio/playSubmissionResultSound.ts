import correctSrc from "../assets/sounds/correctAnswerVoice.mp3";
import wrongSrc from "../assets/sounds/wrongAnswerVoice.mp3";

export function playWrongAnswerVoice(): void {
  const audio = new Audio(wrongSrc);
  audio.volume = 0.75;
  void audio.play().catch(() => {
    /* autoplay blocked until gesture on some browsers */
  });
}

export function playCorrectAnswerVoice(): void {
  const audio = new Audio(correctSrc);
  audio.volume = 0.75;
  void audio.play().catch(() => {
    /* autoplay blocked until gesture on some browsers */
  });
}

