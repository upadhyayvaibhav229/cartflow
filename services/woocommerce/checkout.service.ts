import { wooCommerceRequest } from './client'
import type { CheckoutPayload, WooCommerceCart, WooCommerceSession } from './types'

export function getCheckout(session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/checkout', { session }) }
export function submitCheckout(payload: CheckoutPayload, session?: WooCommerceSession) { return wooCommerceRequest<{ order_id?: number; status?: string; redirect_url?: string }>('/checkout', { method: 'POST', session, body: payload }) }
