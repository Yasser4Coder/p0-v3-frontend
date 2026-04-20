export type MentorId = "cs" | "ps" | "ai" | "ux" | "gd";

export type MentorRowConfig = {
  id: MentorId;
  label: string;
  color: string;
  avatar: string;
  logo: string;
};
