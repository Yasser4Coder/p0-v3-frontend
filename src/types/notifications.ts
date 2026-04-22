export type SubmissionReviewedPayload = {
  submissionId: number;
  status: string;
  score?: number | null;
  challenge_title: string;
  message: string;
  timestamp: string;
};

export type StoredNotification = SubmissionReviewedPayload & {
  id: string;
  read: boolean;
};
