import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";
import type { LoginRequest, LoginResponse, MeResponse } from "../../types/auth";
import { clearAuthSession, setAuthSession, setAuthUser } from "./storage";

export async function login(body: LoginRequest) {
  try {
    const res = await apiClient.post<LoginResponse>("/api/auth/login", body);
    const payload = res.data;

    if (!payload?.success) {
      throw new ApiError({
        kind: "unauthorized",
        status: res.status,
        message: payload?.message ?? "Invalid email or password.",
        details: payload,
      });
    }

    setAuthSession({
      accessToken: payload.data.accessToken,
      user: payload.data.user,
    });

    return payload.data;
  } catch (err) {
    const apiErr = toApiError(err);
    // If backend returns 200 with success:false, we throw ApiError above.
    throw apiErr;
  }
}

export async function logout() {
  try {
    await apiClient.post("/api/auth/logout");
  } catch (err) {
    const apiErr = toApiError(err);
    // If token is missing/expired, backend may return 401.
    // Logout UX should still succeed locally.
    if (apiErr.kind !== "unauthorized") throw apiErr;
  } finally {
    clearAuthSession();
  }
}

export async function getMe() {
  try {
    const res = await apiClient.get<MeResponse>("/api/auth/me");
    const payload = res.data;

    if (!payload?.success) {
      throw new ApiError({
        kind: "unauthorized",
        status: res.status,
        message: payload?.message ?? "Unauthorized",
        details: payload,
      });
    }

    // Keep stored user fresh (only store the fields the app uses everywhere).
    setAuthUser({
      id: payload.data.id,
      name: payload.data.name,
      email: payload.data.email,
      role: payload.data.role,
      team_id: payload.data.team_id,
      team_name: payload.data.team_name,
    });

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}
