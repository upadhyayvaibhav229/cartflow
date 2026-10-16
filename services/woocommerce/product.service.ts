import { wooCommerceRequest } from './client'
import type { ProductQuery, WooCommerceAttribute, WooCommerceCategory, WooCommerceProduct, WooCommerceTag } from './types'

function queryString(query: ProductQuery = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => value !== undefined && params.set(key, String(value)))
  return params.toString()
}

export function getProducts(query?: ProductQuery) { const search = queryString(query); return wooCommerceRequest<WooCommerceProduct[]>(`/products${search ? `?${search}` : ''}`) }
export function getProduct(id: number | string) { return wooCommerceRequest<WooCommerceProduct>(`/products/${encodeURIComponent(id)}`) }
export function getCategories() { return wooCommerceRequest<WooCommerceCategory[]>('/products/categories?per_page=100') }
export function getTags() { return wooCommerceRequest<WooCommerceTag[]>('/products/tags?per_page=100') }
export function getAttributes() { return wooCommerceRequest<WooCommerceAttribute[]>('/products/attributes?per_page=100') }
export function getProductsByCategory(category: string | number, query: Omit<ProductQuery, 'category'> = {}) {
  return getProducts({ ...query, category: String(category) })
}
