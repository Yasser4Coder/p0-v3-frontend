export type SubmissionStatus = "pending" | "accepted" | "rejected" | (string & {});

export type MySubmission = {
  id: number;
  user_id: number;
  challenge_id: number;
  sub_challenge_id: number | null;
  content: string;
  status: SubmissionStatus;
  score: number | null;
  created_at: string;
  file_url: string | null;
  challenge_title: string;
  sub_challenge_title: string | null;
};

