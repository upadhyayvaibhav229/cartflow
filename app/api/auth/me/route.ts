import { cookies } from "next/headers";
import { wordpressApiUrl } from "@/lib/wordpress-api";
import { accountCookieName, tokenCookieName } from "@/lib/wordpress-auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(tokenCookieName)?.value;
  if (!token) return Response.json({ authenticated: false });

  let upstream: Response;
  try {
    upstream = await fetch(wordpressApiUrl("wp-json/jwt-auth/v1/token/validate"), {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (error) {
    console.error("WordPress token validation failed:", error);
    return Response.json({ message: "Unable to reach WordPress." }, { status: 502 });
  }

  if (upstream.ok) {
    let account: { displayName?: string; email?: string } = {};
    try {
      const value = cookieStore.get(accountCookieName)?.value;
      if (value) account = JSON.parse(decodeURIComponent(value));
    } catch {
      cookieStore.delete(accountCookieName);
    }
    return Response.json({
      authenticated: true,
      displayName: account.displayName ?? "",
      email: account.email ?? "",
    });
  }
  if (upstream.status >= 500 || upstream.status === 404) {
    return Response.json(
      { message: "WordPress could not validate your session. Please try again shortly." },
      { status: 502 },
    );
  }
  cookieStore.delete(tokenCookieName);
  cookieStore.delete(accountCookieName);
  return Response.json({ authenticated: false });
}
