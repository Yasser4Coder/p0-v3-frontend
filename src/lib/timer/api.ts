import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";
import type { TimerSnapshot } from "../../types/timer";

type TimerResponse = {
  success: boolean;
  message: string;
  data: TimerSnapshot | null;
};

/** Public timer state — backend is source of truth; poll periodically on the timer page. */
export async function getTimer(): Promise<TimerSnapshot> {
  try {
    const res = await apiClient.get<TimerResponse>("/api/timer");
    const payload = res.data;

    if (!payload?.success || payload.data == null) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load timer.",
        details: payload,
      });
    }

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}
