import type { WooCommerceRequestOptions, WooCommerceSession } from "./types";

export const WOOCOMMERCE_BASE_URL = (
  typeof window !== "undefined"
    ? "/api/woocommerce"
    : process.env.NEXT_PUBLIC_WOOCOMMERCE_URL ||
      (process.env.WORDPRESS_URL
        ? `${process.env.WORDPRESS_URL.replace(/\/$/, "")}/wp-json/wc/store/v1`
        : undefined) ||
      "http://my-woocommerce-store.local/wp-json/wc/store/v1"
).replace(/\/$/, "");

function getStoredSession(): WooCommerceSession | undefined {
  if (typeof window === "undefined") return undefined;
  const nonce = window.localStorage.getItem("woocommerce-nonce") || undefined;
  const cartToken =
    window.localStorage.getItem("woocommerce-cart-token") || undefined;
  return nonce || cartToken ? { nonce, cartToken } : undefined;
}

function storeSession(response: Response) {
  if (typeof window === "undefined") return;
  const nonce = response.headers.get("Nonce");
  const cartToken = response.headers.get("Cart-Token");
  if (nonce) window.localStorage.setItem("woocommerce-nonce", nonce);
  if (cartToken)
    window.localStorage.setItem("woocommerce-cart-token", cartToken);
}

export async function wooCommerceRequest<T>(
  path: string,
  options: WooCommerceRequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  const session = options.session ?? getStoredSession();
  if (options.body !== undefined)
    headers.set("Content-Type", "application/json");
  if (session?.nonce) headers.set("Nonce", session.nonce);
  if (session?.cartToken) headers.set("Cart-Token", session.cartToken);

  const response = await fetch(`${WOOCOMMERCE_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    credentials: "include",
    cache: "no-store",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  storeSession(response);
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      payload?.message || `WooCommerce request failed (${response.status})`,
    );
  return payload as T;
}

export function sessionHeaders(session?: WooCommerceSession) {
  return {
    ...(session?.nonce ? { Nonce: session.nonce } : {}),
    ...(session?.cartToken ? { "Cart-Token": session.cartToken } : {}),
  };
}
