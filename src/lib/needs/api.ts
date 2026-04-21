import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";

export type CreateNeedRequest = {
  title: string;
  description?: string;
  team_id: string;
  track_id?: string;
  /** Backend expects this field name. We'll map "priority" UI to it. */
  type: string;
};

type BackendResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data: null };

export async function createNeed(body: CreateNeedRequest) {
  try {
    const res = await apiClient.post<BackendResponse<unknown>>("/api/needs", body);
    const payload = res.data;

    if (!payload?.success) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not create need.",
        details: payload,
      });
    }

    return payload;
  } catch (err) {
    throw toApiError(err);
  }
}

