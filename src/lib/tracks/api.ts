import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";

export type Track = {
  id: number;
  name: string;
};

type TracksResponse =
  | { success: true; message: string; data: Track[] }
  | { success: false; message: string; data: null };

export async function getTracks() {
  try {
    const res = await apiClient.get<TracksResponse>("/api/tracks");
    const payload = res.data;

    if (!payload?.success || !Array.isArray(payload.data)) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load tracks.",
        details: payload,
      });
    }

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}
