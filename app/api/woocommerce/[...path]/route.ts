import { NextRequest, NextResponse } from 'next/server'

const baseUrl = (process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'http://my-woocommerce-store.local/wp-json/wc/store/v1').replace(/\/$/, '')

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const upstream = new URL(`${baseUrl}/${path.map(encodeURIComponent).join('/')}`)
  request.nextUrl.searchParams.forEach((value, key) => upstream.searchParams.set(key, value))
  const headers = new Headers({ Accept: 'application/json' })
  const nonce = request.headers.get('nonce')
  const cartToken = request.headers.get('cart-token')
  if (nonce) headers.set('Nonce', nonce)
  if (cartToken) headers.set('Cart-Token', cartToken)
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
  if (body) headers.set('Content-Type', 'application/json')

  const response = await fetch(upstream, { method: request.method, headers, body, cache: 'no-store' })
  const responseHeaders = new Headers({ 'Content-Type': response.headers.get('content-type') || 'application/json' })
  const nextCartToken = response.headers.get('Cart-Token')
  if (nextCartToken) responseHeaders.set('Cart-Token', nextCartToken)
  return new NextResponse(await response.text(), { status: response.status, headers: responseHeaders })
}

export const GET = proxy
export const POST = proxy
