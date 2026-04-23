import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";
import type { MySubmission } from "../../types/submission";

export type CreateSubmissionBody = {
  challenge_id: number;
  sub_challenge_id: number;
  content: string;
};

function asCreateBody(p: CreateSubmissionBody): CreateSubmissionBody {
  return {
    challenge_id: Number(p.challenge_id),
    sub_challenge_id: Number(p.sub_challenge_id),
    content: p.content,
  };
}

export async function createSubmissionJson(
  payload: CreateSubmissionBody,
): Promise<{ success?: boolean; message?: string; data?: unknown }> {
  const requestBody = asCreateBody(payload);
  if (
    !Number.isFinite(requestBody.sub_challenge_id) ||
    requestBody.sub_challenge_id < 1
  ) {
    throw new ApiError({
      kind: "bad_request",
      message: "Invalid sub-challenge id for submission.",
    });
  }
  try {
    const res = await apiClient.post("/api/submissions", requestBody, {
      headers: { "Content-Type": "application/json" },
    });
    const payloadData = res.data as {
      success?: boolean;
      message?: string;
      data?: unknown;
    };
    if (
      payloadData &&
      typeof payloadData === "object" &&
      payloadData.success === false
    ) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payloadData.message ?? "Submission rejected.",
        details: payloadData,
      });
    }
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createSubmissionMultipart(params: {
  challenge_id: number;
  sub_challenge_id: number;
  content: string;
  file: File;
}): Promise<{ success?: boolean; message?: string; data?: unknown }> {
  const subId = Number(params.sub_challenge_id);
  if (!Number.isFinite(subId) || subId < 1) {
    throw new ApiError({
      kind: "bad_request",
      message: "Invalid sub-challenge id for submission.",
    });
  }
  const form = new FormData();
  form.append("challenge_id", String(Number(params.challenge_id)));
  form.append("sub_challenge_id", String(subId));
  form.append("content", params.content);
  form.append("file", params.file);

  try {
    const res = await apiClient.post("/api/submissions", form, {
      maxContentLength: 25_000_000,
      maxBodyLength: 25_000_000,
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData && headers != null) {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return data;
        },
      ],
    });
    const payloadData = res.data as {
      success?: boolean;
      message?: string;
      data?: unknown;
    };
    if (
      payloadData &&
      typeof payloadData === "object" &&
      payloadData.success === false
    ) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payloadData.message ?? "Submission rejected.",
        details: payloadData,
      });
    }
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

type MySubmissionsResponse =
  | { success: true; message: string; data: MySubmission[] }
  | { success: false; message: string; data: null };

export async function getMySubmissions(): Promise<MySubmission[]> {
  try {
    const res = await apiClient.get<MySubmissionsResponse>("/api/submissions/my");
    const payload = res.data;

    if (!payload?.success || !Array.isArray(payload.data)) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load your submissions.",
        details: payload,
      });
    }

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}
