import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginResponse {
  access: string;
  refresh: string;
  active_store_id: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
}

/**
 * Set a lightweight routing cookie for the Next.js edge middleware.
 * This is NOT the JWT itself — it is only a hint that a session exists.
 * The Django backend independently verifies the JWT on every API call.
 */
function setAuthSessionCookie() {
  document.cookie = "auth_session=1; path=/; SameSite=Strict";
}

function clearAuthSessionCookie() {
  document.cookie = "auth_session=; path=/; max-age=0; SameSite=Strict";
}

export async function register(
  email: string,
  password: string,
  password_confirm: string
): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${BASE_URL}/auth/register/`, {
    email: email.trim().toLowerCase(),
    password,
    password_confirm,
  });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  setAuthSessionCookie();
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${BASE_URL}/auth/token/`, {
    email: email.trim().toLowerCase(),
    password,
  });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  setAuthSessionCookie();
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  clearAuthSessionCookie();
  window.location.href = "/login";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
