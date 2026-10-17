// app/api/auth/register/route.ts  (keep your existing path)
import { requestWordPressToken, setWordPressAuthCookies } from "@/lib/wordpress-auth";

type RegistrationInput = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  password?: unknown;
};

type WpErrorPayload = {
  code?: unknown;
  message?: unknown;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  // 1. Parse body
  let input: RegistrationInput;
  try {
    input = await request.json();
  } catch {
    return Response.json({ message: "Enter your details to create an account." }, { status: 400 });
  }

  // 2. Validate input
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const firstName = typeof input.firstName === "string" ? input.firstName.trim() : "";
  const lastName = typeof input.lastName === "string" ? input.lastName.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!isValidEmail(email) || !firstName || !lastName || password.length < 8) {
    return Response.json(
      { message: "Enter a valid email, your first and last name, and a password with at least 8 characters." },
      { status: 400 },
    );
  }

  // 3. Create the customer through the WooCommerce REST API (server-side only)
  let upstream: Response;
  try {
    const baseUrl = process.env.WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!baseUrl || !consumerKey || !consumerSecret) {
      throw new Error("WORDPRESS_URL / WOOCOMMERCE_CONSUMER_KEY / WOOCOMMERCE_CONSUMER_SECRET is not configured.");
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const endpoint = new URL("wp-json/wc/v3/customers", `${baseUrl.replace(/\/+$/, "")}/`);

    upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        email,
        username: email, // must match what the JWT login uses
        password,
        first_name: firstName,
        last_name: lastName,
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("WooCommerce customer registration request failed:", error);
    return Response.json({ message: "Unable to reach WordPress to create your account." }, { status: 502 });
  }

  // 4. Read response
  let payload: WpErrorPayload;
  try {
    payload = await upstream.json();
  } catch {
    return Response.json({ message: "WordPress returned an invalid registration response." }, { status: 502 });
  }

  // 5. Handle errors (log the real cause, return a clear message)
  if (!upstream.ok) {
    console.error("WooCommerce register failed:", upstream.status, payload);

    const code = typeof payload.code === "string" ? payload.code : "";
    const isDuplicate =
      code.includes("existing_user") ||
      code.includes("email_exists") ||
      code.includes("email-exists") ||
      code.includes("username-exists");

    if (isDuplicate) {
      return Response.json(
        { message: "An account already exists for this email. Sign in instead." },
        { status: 409 },
      );
    }

    const message =
      typeof payload.message === "string" ? payload.message : "Unable to create your account.";

    return Response.json({ message }, { status: upstream.status >= 500 ? 502 : 400 });
  }

  // 6. Auto sign-in with JWT
  try {
    const account = await requestWordPressToken(email, password);
    const displayName = account.displayName || `${firstName} ${lastName}`;
    await setWordPressAuthCookies(account.token, { displayName, email });
    return Response.json({ authenticated: true, displayName, email });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? `Your account was created, but automatic sign-in failed: ${error.message}`
            : "Your account was created, but automatic sign-in failed. Please sign in.",
        accountCreated: true,
      },
      { status: 502 },
    );
  }
}