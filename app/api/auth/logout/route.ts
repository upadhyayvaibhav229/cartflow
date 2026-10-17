import { cookies } from "next/headers";
import { accountCookieName, tokenCookieName } from "@/lib/wordpress-auth";

export async function POST() {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  cookieStore.set(tokenCookieName, "", options);
  cookieStore.set(accountCookieName, "", options);
  return Response.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
}
