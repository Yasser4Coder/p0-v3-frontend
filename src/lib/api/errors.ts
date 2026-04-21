import type { AxiosError } from "axios";

export type ApiErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "bad_request"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    kind?: ApiErrorKind;
    status?: number;
    details?: unknown;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.kind = params.kind ?? "unknown";
    this.status = params.status;
    this.details = params.details;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).cause = params.cause;
  }
}

type MaybeBackendErrorBody = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

function kindFromStatus(status?: number): ApiErrorKind {
  if (!status) return "unknown";
  if (status === 400) return "bad_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status >= 500) return "server";
  return "unknown";
}

export function toApiError(err: unknown): ApiError {
  const e = err as AxiosError | Error;

  // Axios error (duck-typing avoids importing axios runtime helpers)
  const axiosErr = e as AxiosError;
  if (axiosErr && typeof axiosErr === "object" && "isAxiosError" in axiosErr) {
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data as MaybeBackendErrorBody | undefined;

    const messageFromServer =
      data && typeof data === "object" && typeof data.message === "string"
        ? data.message
        : undefined;

    // Common axios network cases: no response means request never reached server
    if (!axiosErr.response) {
      const code = (axiosErr as AxiosError).code;
      const kind: ApiErrorKind =
        code === "ECONNABORTED" ? "timeout" : "network";
      return new ApiError({
        kind,
        message:
          kind === "timeout"
            ? "Request timed out. Please try again."
            : "Network error. Please check your connection and try again.",
        cause: err,
      });
    }

    return new ApiError({
      kind: kindFromStatus(status),
      status,
      message: messageFromServer ?? "Request failed. Please try again.",
      details: data ?? axiosErr.response?.data,
      cause: err,
    });
  }

  if (e instanceof Error) {
    return new ApiError({ message: e.message, cause: err });
  }

  return new ApiError({ message: "Unknown error occurred.", cause: err });
}
