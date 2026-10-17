import { requestWordPressToken, setWordPressAuthCookies } from "@/lib/wordpress-auth";

export async function POST(request: Request) {
  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return Response.json({ message: "Enter your username and password." }, { status: 400 });
  }

  if (
    typeof credentials.username !== "string" ||
    typeof credentials.password !== "string" ||
    !credentials.username.trim() ||
    !credentials.password
  ) {
    return Response.json({ message: "Enter your username and password." }, { status: 400 });
  }

  try {
    const account = await requestWordPressToken(
      credentials.username.trim(),
      credentials.password,
    );
    await setWordPressAuthCookies(account.token, account);
    return Response.json({
      authenticated: true,
      displayName: account.displayName,
      email: account.email,
    });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Unable to sign in." },
      { status: error instanceof Error && error.message === "Unable to reach WordPress." ? 502 : 401 },
    );
  }
}
