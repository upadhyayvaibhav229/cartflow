export type WooCommerceImage = { id: number; src: string; alt: string }

export type WooCommerceProduct = {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  prices: { price: string; regular_price: string; sale_price: string; currency_code: string; currency_minor_unit: number }
  images: WooCommerceImage[]
  is_in_stock: boolean
  has_options: boolean
  categories: { id: number; name: string; slug: string }[]
}

export type WooCommerceCartItem = {
  key: string
  id: number
  quantity: number
  name: string
  prices: { price: string; currency_code: string; currency_minor_unit: number; subtotal: string; subtotal_tax: string; total: string; total_tax: string }
  images: WooCommerceImage[]
}

export type WooCommerceCart = {
  items: WooCommerceCartItem[]
  items_count: number
  items_weight: number
  totals: { total_items: string; total_items_tax: string; total_fees: string; total_fees_tax: string; total_discount: string; total_discount_tax: string; total_shipping: string; total_shipping_tax: string; total_price: string; total_tax: string; currency_code: string; currency_minor_unit: number }
  coupons: { code: string; discount_type: string; totals: { total_discount: string; total_discount_tax: string } }[]
}

export type WooCommerceCategory = { id: number; name: string; slug: string; count: number; image?: WooCommerceImage }
export type WooCommerceTag = { id: number; name: string; slug: string; count: number }
export type WooCommerceAttribute = { id: number; name: string; slug: string; taxonomy: string; has_variations: boolean; terms?: { id: number; name: string; slug: string }[] }

export type CheckoutPayload = {
  billing_address: Record<string, string>
  shipping_address?: Record<string, string>
  payment_method?: string
  payment_data?: Record<string, string>[]
  customer_note?: string
}

export type WooCommerceError = { code?: string; message: string; data?: { status?: number } }

export type ProductQuery = { page?: number; per_page?: number; search?: string; category?: string; order?: 'asc' | 'desc'; orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating' }

export type WooCommerceResponse<T> = { data?: T; error?: WooCommerceError }

export type WooCommerceSession = { nonce?: string; cartToken?: string }

export type WooCommerceRequestOptions = { method?: 'GET' | 'POST'; body?: unknown; session?: WooCommerceSession }

export type { }
