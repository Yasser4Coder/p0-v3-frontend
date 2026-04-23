import notificationSrc from "../assets/sounds/notification.mp3";

/** Short alert when a mentor review SSE arrives — new Audio each play. */
export function playNotificationSound(): void {
  const audio = new Audio(notificationSrc);
  audio.volume = 0.55;
  void audio.play().catch(() => {
    /* autoplay blocked until gesture on some browsers */
  });
}
