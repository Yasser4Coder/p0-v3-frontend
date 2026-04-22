import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";
import type { ChallengeDetailFromApi, ChallengeFromApi } from "../../types/challenge";

type ChallengesListResponse =
  | {
      success: true;
      message: string;
      data: ChallengeFromApi[] | { challenges: ChallengeFromApi[] };
    }
  | { success: false; message: string; data: null };

export async function getChallenges() {
  try {
    const res = await apiClient.get<ChallengesListResponse>(
      "/api/challenges/active-stage",
    );
    const payload = res.data;

    if (!payload?.success || payload.data == null) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load challenges.",
        details: payload,
      });
    }

    const raw = payload.data;
    const list = Array.isArray(raw) ? raw : raw.challenges;
    if (!Array.isArray(list)) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load challenges.",
        details: payload,
      });
    }

    return list;
  } catch (err) {
    throw toApiError(err);
  }
}

type ChallengeOneResponse =
  | { success: true; message: string; data: ChallengeDetailFromApi }
  | { success: false; message: string; data: null };

export async function getChallengeById(id: number): Promise<ChallengeDetailFromApi> {
  try {
    const res = await apiClient.get<ChallengeOneResponse>(
      `/api/challenges/${id}`,
    );
    const payload = res.data;

    if (!payload?.success || !payload.data) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load challenge.",
        details: payload,
      });
    }

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}
