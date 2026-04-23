/** One part of a parent challenge (`GET /api/challenges/:id`). */
export type SubChallengeFromApi = {
  id: number;
  challenge_id: number;
  title: string;
  description: string;
  file_url: string | null;
  type: string;
  flag: string | null;
  points: number | null;
  max_points: number | null;
  min_points: number | null;
  decay: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at?: string;
};

/** Fields returned by list endpoints (e.g. active-stage). */
export type ChallengeFromApi = {
  id: number;
  title: string;
  description: string;
  stage_id: number;
  track_id: number;
  mentor_id: number;
  points: number | null;
  file_url: string | null;
  start_time: string | null;
  end_time: string | null;
  type: string;
  flag: string | null;
  max_points: number | null;
  min_points: number | null;
  decay: number | null;
  track_name: string;
  stage_title?: string;
  mentor_name?: string;
  stage_active?: number;
};

/** `GET /api/challenges/:id` — task fields may live on `sub_challenges` only. */
export type ChallengeDetailFromApi = {
  id: number;
  title: string;
  description: string;
  stage_id: number;
  track_id: number;
  mentor_id: number;
  points?: number | null;
  file_url?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  type?: string;
  flag?: string | null;
  max_points?: number | null;
  min_points?: number | null;
  decay?: number | null;
  track_name?: string;
  stage_title?: string;
  mentor_name?: string;
  sub_challenges?: SubChallengeFromApi[];
};
