/**
 * Authentication and token management helper for Flowmetrics Admin.
 * Handles token storage in localStorage and cookie, token inspection, and session cleanup.
 */

export interface AuthUser {
  sub: string;
  email?: string;
  role: string;
  exp: number;
}

const TOKEN_KEY = "flowmetrics_admin_token";
const COOKIE_NAME = "flowmetrics_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // Check localStorage first
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;

    // Fallback to cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === COOKIE_NAME && value) {
        return decodeURIComponent(value);
      }
    }
  } catch (err) {
    console.error("[Auth] Error reading token:", err);
  }

  return null;
}

export function setStoredToken(token: string, email?: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (email) {
      localStorage.setItem("flowmetrics_admin_email", email);
    }
    // Also store as cookie for HTTP/request helpers if needed (2 hours expiry)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=7200; SameSite=Lax`;
  } catch (err) {
    console.error("[Auth] Error saving token:", err);
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("flowmetrics_admin_email");
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch (err) {
    console.error("[Auth] Error clearing token:", err);
  }
}

export function parseJwt(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload) as AuthUser;
  } catch (err) {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const user = parseJwt(token);
  if (!user || !user.exp) return false;

  // Check if token has expired (exp is in seconds)
  return user.exp * 1000 > Date.now();
}

export function getStoredUser(): { email: string; role: string } | null {
  if (typeof window === "undefined") return null;

  const token = getStoredToken();
  if (!token || !isTokenValid(token)) return null;

  const jwtData = parseJwt(token);
  const savedEmail = localStorage.getItem("flowmetrics_admin_email");

  return {
    email: savedEmail || jwtData?.email || "admin@flowmetrics.io",
    role: jwtData?.role || "admin",
  };
}
