import { apiGet, apiPost, type ApiSuccessResponse } from "@/lib/api/client";

export type UserRole = "INVESTOR" | "MANAGER";
export type AuthSession = {
  address: string;
  role?: UserRole;
};

export type AuthNonceData = {
  nonce: string;
};

export type AuthNonceParams = {
  address: string;
  chainId: number;
  domain: string;
};

export type AuthLoginData = {
  user: UserProfile;
};

export type AuthLoginParams = {
  message: string;
  signature: string;
};

export type UserProfile = {
  address: string;
  role: UserRole;
  createdAt: string;
  managerApplicationStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
};

export type AuthSessionData = {
  authenticated: boolean;
  address?: string;
  role?: UserRole;
};

export async function postAuthNonce(params: AuthNonceParams): Promise<AuthNonceData> {
  const payload = await apiPost<ApiSuccessResponse<AuthNonceData>>("/auth/nonce", params);
  return payload.data;
}

export async function postAuthLogin(params: AuthLoginParams): Promise<AuthLoginData> {
  const payload = await apiPost<ApiSuccessResponse<AuthLoginData>>("/auth/login", params);
  return payload.data;
}

export async function postAuthLogout(): Promise<void> {
  await apiPost<ApiSuccessResponse<unknown>>("/auth/logout");
}

export async function getAuthSessionStatus(): Promise<AuthSessionData> {
  const payload = await apiGet<ApiSuccessResponse<AuthSessionData>>("/auth/session");
  return payload.data;
}

export async function getUserProfile(): Promise<UserProfile> {
  const payload = await apiGet<ApiSuccessResponse<UserProfile>>("/user/profile");
  return payload.data;
}
