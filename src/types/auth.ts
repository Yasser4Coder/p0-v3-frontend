export type AuthRole = "participant" | "admin" | "organizer" | (string & {});

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  team_id?: number;
  team_name?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type LoginErrorResponse = {
  success: false;
  message: string;
  data: null;
};

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export type MeUser = AuthUser & {
  created_at?: string;
  team_id?: number;
  team_name?: string;
};

export type MeSuccessResponse = {
  success: true;
  message: string;
  data: MeUser;
};

export type MeErrorResponse = {
  success: false;
  message: string;
  data: null;
};

export type MeResponse = MeSuccessResponse | MeErrorResponse;
