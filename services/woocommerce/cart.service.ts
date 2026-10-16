import { wooCommerceRequest } from './client'
import type { WooCommerceCart, WooCommerceSession } from './types'

export function getCart(session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/cart', { session }) }
export function addItem(id: number, quantity = 1, variation?: Record<string, string>, session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/cart/add-item', { method: 'POST', session, body: { id, quantity, ...(variation ? { variation } : {}) } }) }
export function updateItem(key: string, quantity: number, session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/cart/update-item', { method: 'POST', session, body: { key, quantity } }) }
export function removeItem(key: string, session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/cart/remove-item', { method: 'POST', session, body: { key } }) }
export function applyCoupon(code: string, session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/cart/apply-coupon', { method: 'POST', session, body: { code } }) }
export function removeCoupon(code: string, session?: WooCommerceSession) { return wooCommerceRequest<WooCommerceCart>('/cart/remove-coupon', { method: 'POST', session, body: { code } }) }
