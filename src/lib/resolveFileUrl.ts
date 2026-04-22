import { API_BASE_URL } from "./api/client";

/** Turn `/uploads/...` into an absolute URL using the configured API origin. */
export function resolveApiFileUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const base = API_BASE_URL.replace(/\/$/, "");
  const rel = p.startsWith("/") ? p : `/${p}`;
  return `${base}${rel}`;
}
