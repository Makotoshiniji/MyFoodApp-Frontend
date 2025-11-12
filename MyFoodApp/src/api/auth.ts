// src/api/auth.ts
import api from "./client";

export type LoginResponse = {
  id: number;
  username: string;
  email?: string;
  rank: "admin" | "user";
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export const AuthApi = {
  login: (payload: { identity: string; password: string }) =>
    api.post<LoginResponse>("/Auth/login", payload).then((r) => r.data),

  register: (payload: RegisterRequest) =>
    api.post<LoginResponse>("/Auth/register", payload).then((r) => r.data),
};

export default AuthApi;
