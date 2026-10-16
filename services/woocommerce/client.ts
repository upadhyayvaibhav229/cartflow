import type { WooCommerceRequestOptions, WooCommerceSession } from './types'

export const WOOCOMMERCE_BASE_URL = (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
  ? '/api/woocommerce'
  : process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'http://my-woocommerce-store.local/wp-json/wc/store/v1').replace(/\/$/, '')

export async function wooCommerceRequest<T>(path: string, options: WooCommerceRequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (options.session?.nonce) headers.set('Nonce', options.session.nonce)
  if (options.session?.cartToken) headers.set('Cart-Token', options.session.cartToken)

  const response = await fetch(`${WOOCOMMERCE_BASE_URL}${path}`, {
    method: options.method || 'GET', headers, credentials: 'include', cache: 'no-store',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || `WooCommerce request failed (${response.status})`)
  return payload as T
}

export function sessionHeaders(session?: WooCommerceSession) {
  return { ...(session?.nonce ? { Nonce: session.nonce } : {}), ...(session?.cartToken ? { 'Cart-Token': session.cartToken } : {}) }
}
