import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";

export type MyTeamStats = {
  team_name: string;
  rank: number;
  total_score: string;
  total_possible_score: number;
};

type MyTeamStatsResponse =
  | { success: true; message: string; data: MyTeamStats }
  | { success: false; message: string; data: null };

export async function getMyTeamStats() {
  try {
    const res = await apiClient.get<MyTeamStatsResponse>(
      "/api/teams/my-team/stats",
    );
    const payload = res.data;

    if (!payload?.success || !payload.data) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load team stats.",
        details: payload,
      });
    }

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}
