import { httpGet, httpPost } from "@/lib/api-client/http";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  data: {
    token: string;
    user: AuthUser;
  };
};

export async function signup(name: string, email: string, password: string): Promise<AuthResponse["data"]> {
  const response = await httpPost<AuthResponse>("/auth/signup", { name, email, password });
  return response.data;
}

export async function login(email: string, password: string): Promise<AuthResponse["data"]> {
  const response = await httpPost<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await httpGet<{ data: AuthUser }>("/auth/me");
  return response.data;
}
