import { apiClient } from "../api/client";
import { ApiError, toApiError } from "../api/errors";

export type AnnouncementFromApi = {
  id: number;
  title: string;
  content: string;
  target: string;
  created_by: number | null;
  created_at: string;
  author_name: string | null;
};

type AnnouncementsResponse =
  | { success: true; message: string; data: AnnouncementFromApi[] }
  | { success: false; message: string; data: null };

export async function getAnnouncements(): Promise<AnnouncementFromApi[]> {
  try {
    const res = await apiClient.get<AnnouncementsResponse>("/api/announcements");
    const payload = res.data;

    if (!payload?.success || !Array.isArray(payload.data)) {
      throw new ApiError({
        kind: "bad_request",
        status: res.status,
        message: payload?.message ?? "Could not load announcements.",
        details: payload,
      });
    }

    return payload.data;
  } catch (err) {
    throw toApiError(err);
  }
}

