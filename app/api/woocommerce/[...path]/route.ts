import { WOOCOMMERCE_BASE_URL } from "../../../../services/woocommerce/clients";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyWooCommerceRequest(
  request: Request,
  context: RouteContext,
) {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${path.map(encodeURIComponent).join("/")}${requestUrl.search}`,
    `${WOOCOMMERCE_BASE_URL}/`,
  );
  const headers = new Headers({ Accept: "application/json" });

  for (const name of ["content-type", "cookie", "nonce", "cart-token"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === "POST" ? await request.text() : undefined,
      cache: "no-store",
    });
  } catch (error) {
    console.error("WooCommerce proxy request failed:", error);
    return Response.json(
      { message: "Unable to reach the WooCommerce API." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "nonce", "cart-token", "set-cookie"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(
    upstream.status === 204 || upstream.status === 304 ? null : upstream.body,
    {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    },
  );
}

export async function GET(request: Request, context: RouteContext) {
  return proxyWooCommerceRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyWooCommerceRequest(request, context);
}
