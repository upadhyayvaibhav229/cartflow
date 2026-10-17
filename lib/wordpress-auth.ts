import "server-only";
import { cookies } from "next/headers";
import { wordpressApiUrl } from "@/lib/wordpress-api";

export const tokenCookieName = "cartflow_jwt";
export const accountCookieName = "cartflow_account";

export type WordPressTokenResponse = {
  token?: unknown;
  user_email?: unknown;
  user_display_name?: unknown;
  message?: unknown;
};

export async function requestWordPressToken(username: string, password: string) {
  let upstream: Response;
  try {
    upstream = await fetch(wordpressApiUrl("wp-json/jwt-auth/v1/token"), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("WordPress login request failed:", error);
    throw new Error("Unable to reach WordPress.");
  }

  let payload: WordPressTokenResponse;
  try {
    payload = await upstream.json();
  } catch {
    throw new Error("WordPress returned an invalid login response.");
  }

  if (!upstream.ok || typeof payload.token !== "string" || !payload.token) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : "WordPress rejected the login request.";
    throw new Error(upstream.ok ? "WordPress returned an invalid login response." : message);
  }

  return {
    token: payload.token,
    displayName:
      typeof payload.user_display_name === "string"
        ? payload.user_display_name
        : "",
    email: typeof payload.user_email === "string" ? payload.user_email : "",
  };
}

export async function setWordPressAuthCookies(
  token: string,
  account: { displayName: string; email: string },
) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
  cookieStore.set(tokenCookieName, token, options);
  cookieStore.set(accountCookieName, encodeURIComponent(JSON.stringify(account)), options);
}
