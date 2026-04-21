import type { AuthUser } from "../../types/auth";

const STORAGE_KEYS = {
  accessToken: "p0.accessToken",
  user: "p0.user",
} as const;

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export function clearAccessToken() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function clearAuthSession() {
  clearAccessToken();
  clearAuthUser();
}

export function setAuthSession(params: { accessToken: string; user: AuthUser }) {
  setAccessToken(params.accessToken);
  setAuthUser(params.user);
}
