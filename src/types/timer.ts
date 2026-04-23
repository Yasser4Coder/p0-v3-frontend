export type TimerStatus = "idle" | "paused" | "running" | "expired";

export type TimerSnapshot = {
  server_now: string;
  remaining_ms: number;
  status: TimerStatus;
  expired: boolean;
  idle: boolean;
};
