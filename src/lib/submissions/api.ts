import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";

export async function createSubmissionJson(payload: {
  challenge_id: number;
  content: string;
}): Promise<{ success?: boolean; message?: string; data?: unknown }> {
  try {
    const res = await apiClient.post("/api/submissions", payload);
    const body = res.data as { success?: boolean; message?: string; data?: unknown };
    if (body && typeof body === "object" && body.success === false) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: body.message ?? "Submission rejected.",
        details: body,
      });
    }
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createSubmissionMultipart(params: {
  challenge_id: number;
  content: string;
  file: File;
}): Promise<{ success?: boolean; message?: string; data?: unknown }> {
  const form = new FormData();
  form.append("challenge_id", String(params.challenge_id));
  form.append("content", params.content);
  form.append("file", params.file);

  try {
    const res = await apiClient.post("/api/submissions", form, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });
    const body = res.data as { success?: boolean; message?: string; data?: unknown };
    if (body && typeof body === "object" && body.success === false) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: body.message ?? "Submission rejected.",
        details: body,
      });
    }
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}
